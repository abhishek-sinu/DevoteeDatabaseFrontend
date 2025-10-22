import React, { useState, useRef } from "react";
import axios from "axios";

const months = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"
];

const getYears = () => {
  const currentYear = new Date().getFullYear();
  return [currentYear, currentYear - 1, currentYear - 2, currentYear - 3];
};

const UploadSadhanaCard = ({ email }) => {
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const fileInputRef = useRef();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(month, year, file)
    if (!month || !year || !file) {
      setMessage("Please select month, year and file.");
      return;
    }
    setLoading(true);
    setMessage("");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("month", month);
    formData.append("year", year);
    formData.append("email", email);
    try {
      await axios.post(`${process.env.REACT_APP_API_BASE}/api/upload-sadhana-card`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage("Upload successful!");
      setFile(null);
      setMonth("");
      setYear("");
      if (fileInputRef.current) fileInputRef.current.value = ""; // Clear file input
    } catch (err) {
      setMessage("Upload failed. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="container mt-4">
      <h5>Upload Sadhana Card</h5>
      <form onSubmit={handleSubmit} className="row g-3">
        <div className="col-md-4">
          <label className="form-label">Month</label>
          <select className="form-select" value={month} onChange={e => setMonth(e.target.value)} required>
            <option value="">Select Month</option>
            {months.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
        <div className="col-md-4">
          <label className="form-label">Year</label>
          <select className="form-select" value={year} onChange={e => setYear(e.target.value)} required>
            <option value="">Select Year</option>
            {getYears().map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <div className="col-md-4">
          <label className="form-label">File</label>
          <input type="file" className="form-control" accept=".jpg,.jpeg,.png,.pdf,.xls,.xlsx" ref={fileInputRef} onChange={e => setFile(e.target.files[0])} required />
        </div>
        <div className="col-12">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <span className="spinner-border spinner-border-sm"></span> : "Upload"}
          </button>
        </div>
        {message && <div className="alert alert-info mt-2">{message}</div>}
      </form>
    </div>
  );
};

export default UploadSadhanaCard;
