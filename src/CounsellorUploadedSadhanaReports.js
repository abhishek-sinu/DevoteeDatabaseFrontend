import React, { useState, useEffect } from "react";
import axios from "axios";

export default function CounsellorUploadedSadhanaReports({ userId }) {
  const [devotees, setDevotees] = useState([]);
  const [selectedDevotee, setSelectedDevotee] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [fileInfo, setFileInfo] = useState(null);
  const [loading, setLoading] = useState(false);
    const months = [
        "JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"
    ];
  const [error, setError] = useState("");
  const years = Array.from({ length: 4 }, (_, i) => new Date().getFullYear() - i);

  useEffect(() => {
    const fetchDevotees = async () => {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      if (!token || !userId) return;
      try {
        const res = await axios.get(
            `${process.env.REACT_APP_API_BASE}/api/counsellor/devotees`,
            {
              headers: { Authorization: `Bearer ${token}` },
              params: { user_id: userId },
            }
        );
        setDevotees(res.data.map(item => item.devotee));
      } catch (err) {
        console.error("Error fetching:", err);
      }
    };
    fetchDevotees();
  }, []);

  const handleView = async () => {
    setLoading(true);
    setFileInfo("");
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${process.env.REACT_APP_API_BASE}/api/sadhana-card`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { email: selectedDevotee, month, year }
      });
      setFileInfo(res.data);
    } catch {
        setError("No sadhana card found for selected month/year.");
        setFileInfo("");
    }
    setLoading(false);
  };

  return (
      <div className="container mt-5" style={{ maxWidth: 700 }}>
        <div className="card shadow border-0">
          <div className="card-header bg-primary text-white text-center">
            <h4 className="mb-0">View Uploaded Sadhana (Assigned Devotees)</h4>
          </div>
          <div className="card-body">
            <form className="row g-4 align-items-end mb-3" onSubmit={e => { e.preventDefault(); handleView(); }}>
              <div className="col-md-5">
                <label className="form-label fw-bold">Devotee</label>
                <select className="form-select" value={selectedDevotee} onChange={e => setSelectedDevotee(e.target.value)} required>
                  <option value="">Select</option>
                  {devotees.map(d => (
                      <option key={d.email || d.id} value={d.email || ""}>
                        {d.initiated_name?.trim()
                            ? `${d.initiated_name.trim()} - ${d.email}`
                            : `${[d.first_name, d.last_name].filter(Boolean).join(" ")} - ${d.email}`}
                      </option>
                  ))}
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label fw-bold">Year</label>
                <select className="form-select" value={year} onChange={e => setYear(e.target.value)} required>
                  <option value="">Select</option>
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div className="col-md-2">
                <label className="form-label fw-bold">Month</label>
                <select className="form-select" value={month} onChange={e => setMonth(e.target.value)} required>
                  <option value="">Select</option>
                  {months.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="col-md-2 d-flex align-items-end">
                <button className="btn btn-primary w-100" type="submit" disabled={loading || !selectedDevotee || !month || !year}>
                  {loading ? <span className="spinner-border spinner-border-sm"></span> : "View"}
                </button>
              </div>
            </form>
            {error && <div className="alert alert-danger text-center">{error}</div>}
            {fileInfo && (
                <div className="mt-4 text-center">
                  <a href={`${process.env.REACT_APP_API_BASE}${fileInfo.filePath}`} target="_blank" rel="noopener noreferrer" className="btn btn-success px-4">
                    <i className="bi bi-download me-2"></i>View/Download File
                  </a>
                </div>
            )}
          </div>
        </div>
      </div>
  );

}

