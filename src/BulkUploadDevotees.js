import React, { useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";

const API_BASE = process.env.REACT_APP_API_BASE;

export default function BulkUploadDevotees() {
    const [excelData, setExcelData] = useState([]);
    const [uploadStatus, setUploadStatus] = useState("");
    const token = localStorage.getItem("token");

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (evt) => {
            const bstr = evt.target.result;
            const wb = XLSX.read(bstr, { type: "binary" });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const data = XLSX.utils.sheet_to_json(ws);
            setExcelData(data);
        };
        reader.readAsBinaryString(file);
    };

    const handleBulkUpload = async () => {
        try {
            await axios.post(`${API_BASE}/api/devotees/bulk`, { devotees: excelData }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUploadStatus("✅ Upload successful!");
        } catch (error) {
            console.error("Upload failed", error);
            let msg = "❌ Upload failed. Please check the file format.";
            if (error.response && error.response.data) {
                if (
                    error.response.data.details &&
                    error.response.data.details.includes("Duplicate entry")
                ) {
                    // Extract the email from the error message if possible
                    const match = error.response.data.details.match(/'([^']+)'/);
                    const email = match ? match[1] : "This email";
                    msg = `❌ ${email} is already registered. Please remove duplicates and try again.`;
                } else if (error.response.data.error) {
                    msg = `❌ ${error.response.data.error}`;
                }
            }
            setUploadStatus(msg);
        }
    };


    return (
        <div className="container mt-5">
            <div className="card border-primary shadow">
                <div className="card-header bg-info text-white text-center">
                    <h4>📤 Bulk Upload Devotees</h4>
                </div>
                <div className="card-body">
                    <div className="mb-3">
                        <label className="form-label fw-bold">Upload Excel File (.xlsx)</label>
                        <input type="file" className="form-control" accept=".xlsx, .xls" onChange={handleFileUpload} />
                    </div>
                    <div className="text-center">
                        <button className="btn btn-success" onClick={handleBulkUpload}>
                            <i className="bi bi-cloud-upload-fill"></i> Upload
                        </button>
                    </div>
                    {uploadStatus && (
                        <div className={`mt-3 text-center fw-bold ${uploadStatus.includes('✅') ? 'text-success' : 'text-danger'}`}>
                            {uploadStatus}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
