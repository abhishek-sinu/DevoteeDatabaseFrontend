import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import DevoteeApp from "./DevoteeApp";
import BulkUploadDevotees from "./BulkUploadDevotees";
import ViewDevoteesTable from "./ViewDevoteesTable";
import Register from "./createUser";
import SadhanaEntryForm from "./SadhanaEntryForm"; // new
import SadhanaViewDownload from "./DownloadViewSadhanaCard"; // new

const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
};

export default function DevoteeDashboard() {
    const [view, setView] = useState("view");
    const [role, setRole] = useState("user");

    useEffect(() => {
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId");
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setRole(decoded.role || "user");
            } catch (error) {
                console.error("Invalid token:", error);
            }
        }
    }, []);

    return (
        <>
            {/* Krishna Invocation */}
            <div className="text-center p-3 mb-4 bg-info text-white rounded shadow">
                <h2>🙏 Śrī Guru Gaurāṅga Jayate 🙏</h2>
                <h4>Welcome to the Devotee Dashboard</h4>
            </div>

            {/* Logout Button */}
            <div className="text-end mb-3">
                <button onClick={handleLogout} className="btn btn-danger">
                    <i className="bi bi-box-arrow-right"></i> Logout
                </button>
            </div>

            {/* Action Buttons */}
            <div className="d-flex justify-content-center mb-4 flex-wrap gap-2">
                {role === "admin" && (
                    <>
                        <button onClick={() => setView("add")} className="btn btn-primary">
                            <i className="bi bi-pencil-square"></i> Add / Update
                        </button>
                        <button onClick={() => setView("bulk")} className="btn btn-success">
                            <i className="bi bi-upload"></i> Bulk Upload
                        </button>
                        <button onClick={() => setView("register")} className="btn btn-warning">
                            <i className="bi bi-person-plus"></i> Create User
                        </button>
                    </>
                )}
                <button onClick={() => setView("view")} className="btn btn-secondary">
                    <i className="bi bi-table"></i> View Devotees
                </button>

                {role === "user" && (
                    <>
                        <button onClick={() => setView("entry")} className="btn btn-info">
                            <i className="bi bi-journal-plus"></i> Enter Sadhana Card
                        </button>
                        <button onClick={() => setView("download")} className="btn btn-dark">
                            <i className="bi bi-cloud-download"></i> View / Download Sadhana Card
                        </button>
                    </>
                )}
            </div>

            {/* Content Section */}
            {view === "add" && role === "admin" && <DevoteeApp />}
            {view === "bulk" && role === "admin" && <BulkUploadDevotees />}
            {view === "register" && role === "admin" && <Register />}
            {view === "view" && <ViewDevoteesTable />}
            {view === "entry" && role === "user" && <SadhanaEntryForm userId={localStorage.getItem("userId")} />}
            {view === "download" && role === "user" && <SadhanaViewDownload  userId={localStorage.getItem("userId")} />}
        </>
    );
}
