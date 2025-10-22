import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

export default function AdminUploadedSadhanaReports() {
  const [devotees, setDevotees] = useState([]); // kept for compatibility but not loaded all at once
  const [selectedDevotee, setSelectedDevotee] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [fileInfo, setFileInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const debounceRef = useRef(null);

  const months = [
    "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
    "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"
  ];
  const years = Array.from({ length: 4 }, (_, i) => new Date().getFullYear() - i);

  // Search devotees by name/email as admin types. Backend should provide /api/devotees/search
  const searchDevotees = async (q) => {
    if (!q || q.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_BASE}/api/devotees/search`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { query: q }
      });
      // expect array of { id, first_name, last_name, initiated_name, email }
      setSuggestions(res.data || []);
    } catch (err) {
      console.error("Search error:", err);
      setSuggestions([]);
    }
  };

  // Debounced handler
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      searchDevotees(searchQuery);
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchQuery]);

  const handleView = async () => {
    setLoading(true);
    setFileInfo(null);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${process.env.REACT_APP_API_BASE}/api/sadhana-card`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { email: selectedDevotee, month, year }
      });
      setFileInfo(res.data);
    } catch (err) {
      console.error(err);
      setError("No sadhana card found for selected month/year.");
      setFileInfo(null);
    }
    setLoading(false);
  };

  return (
    <div className="card p-3">
      <h5>View Uploaded Sadhana (All Devotees)</h5>
      <div className="row mb-3">
        <div className="col-md-4 position-relative">
          <label>Search Devotee (name or email)</label>
          <input
            type="text"
            className="form-control"
            placeholder="Type name or email..."
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setSelectedDevotee(""); }}
          />
          {suggestions.length > 0 && (
            <ul className="list-group position-absolute" style={{ zIndex: 2000, width: '100%' }}>
              {suggestions.map(s => (
                <li key={s.email || s.id} className="list-group-item list-group-item-action" style={{ cursor: 'pointer' }} onClick={() => {
                  setSelectedDevotee(s.email);
                  setSearchQuery(s.initiated_name?.trim() || `${[s.first_name, s.last_name].filter(Boolean).join(' ')}`);
                  setSuggestions([]);
                }}>
                  {s.initiated_name?.trim() ? `${s.initiated_name.trim()} - ${s.email}` : `${[s.first_name, s.last_name].filter(Boolean).join(' ')} - ${s.email}`}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="col-md-3">
          <label>Month</label>
          <select className="form-select" value={month} onChange={e => setMonth(e.target.value)}>
            <option value="">Select</option>
            {months.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div className="col-md-2">
          <label>Year</label>
          <select className="form-select" value={year} onChange={e => setYear(e.target.value)}>
            <option value="">Select</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div className="col-md-2 d-flex align-items-end">
          <button className="btn btn-primary w-100" onClick={handleView} disabled={loading || !selectedDevotee || !month || !year}>
            {loading ? "Loading..." : "View"}
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {fileInfo && fileInfo.filePath && (
        <div className="mt-3">
          {(fileInfo.filePath.endsWith('.jpg') || fileInfo.filePath.endsWith('.jpeg') || fileInfo.filePath.endsWith('.png')) ? (
            <>
              <img
                src={`${process.env.REACT_APP_API_BASE}${fileInfo.filePath}`}
                alt="Sadhana Card"
                style={{ maxWidth: '400px', maxHeight: '400px', cursor: 'zoom-in' }}
                onDoubleClick={() => setShowModal(true)}
              />
              <br />
              <a href={`${process.env.REACT_APP_API_BASE}${fileInfo.filePath}`} download target="_blank" rel="noopener noreferrer" className="btn btn-success mt-2">Download</a>
              {showModal && (
                <div className="modal fade show" style={{ display: 'block', background: 'rgba(0,0,0,0.7)' }} tabIndex="-1" onClick={() => setShowModal(false)}>
                  <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
                    <div className="modal-content">
                      <div className="modal-header">
                        <h5 className="modal-title">Sadhana Card</h5>
                        <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                      </div>
                      <div className="modal-body text-center">
                        <img
                          src={`${process.env.REACT_APP_API_BASE}${fileInfo.filePath}`}
                          alt="Sadhana Card Large"
                          style={{ maxWidth: '100%', maxHeight: '70vh' }}
                        />
                        <br />
                        <a href={`${process.env.REACT_APP_API_BASE}${fileInfo.filePath}`} download target="_blank" rel="noopener noreferrer" className="btn btn-success mt-3">Download</a>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <a href={`${process.env.REACT_APP_API_BASE}${fileInfo.filePath}`} download target="_blank" rel="noopener noreferrer" className="btn btn-success">Download/View File</a>
          )}
        </div>
      )}
    </div>
  );
}
