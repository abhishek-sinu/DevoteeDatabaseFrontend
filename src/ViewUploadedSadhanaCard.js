import React, { useState } from "react";
import axios from "axios";

const months = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"
];
const getYears = () => {
  const currentYear = new Date().getFullYear();
  return [currentYear, currentYear - 1, currentYear - 2, currentYear - 3];
};

const ViewUploadedSadhanaCard = ({ email }) => {
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [fileInfo, setFileInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  const fetchSadhanaCard = async () => {
    setLoading(true);
    setError("");
    setFileInfo(null);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_BASE}/api/sadhana-card?email=${email}&month=${month}&year=${year}`);
      setFileInfo(response.data);
    } catch (err) {
      setError("No sadhana card found for selected month/year.");
    }
    setLoading(false);
  };

  const handleDownload = () => {
    if (fileInfo && fileInfo.filePath) {
      window.open(fileInfo.filePath, '_blank');
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: 650 }}>
      <div className="card shadow border-0">
        <div className="card-header bg-primary text-white text-center">
          <h4 className="mb-0">View/Download Uploaded Sadhana Card</h4>
        </div>
        <div className="card-body">
          <form className="row g-4 mb-3" onSubmit={e => { e.preventDefault(); fetchSadhanaCard(); }}>
            <div className="col-md-5">
              <label className="form-label fw-bold">Year</label>
              <select className="form-select" value={year} onChange={e => setYear(e.target.value)} required>
                <option value="">Select Year</option>
                {getYears().map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <div className="col-md-5">
              <label className="form-label fw-bold">Month</label>
              <select className="form-select" value={month} onChange={e => setMonth(e.target.value)} required>
                <option value="">Select Month</option>
                {months.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div className="col-md-2 d-flex align-items-end">
              <button className="btn btn-primary w-100" type="submit" disabled={loading || !month || !year}>
                {loading ? <span className="spinner-border spinner-border-sm"></span> : "View"}
              </button>
            </div>
          </form>
          {error && <div className="alert alert-danger text-center mb-3">{error}</div>}
          {fileInfo && fileInfo.filePath && (
            <div className="mt-3 text-center">
              <strong>Uploaded Sadhana Card:</strong>
              <div className="mt-3">
                {(fileInfo.filePath.endsWith('.jpg') || fileInfo.filePath.endsWith('.jpeg') || fileInfo.filePath.endsWith('.png')) ? (
                  <>
                    <img
                      src={`${process.env.REACT_APP_API_BASE}${fileInfo.filePath}`}
                      alt="Sadhana Card"
                      className="img-thumbnail shadow-sm"
                      style={{ maxWidth: '350px', maxHeight: '350px', cursor: 'zoom-in', border: '2px solid #0d6efd' }}
                      onDoubleClick={() => setShowModal(true)}
                    />
                    <br />
                    <a href={`${process.env.REACT_APP_API_BASE}${fileInfo.filePath}`} download target="_blank" rel="noopener noreferrer" className="btn btn-success mt-3 px-4">
                      <i className="bi bi-download me-2"></i>Download
                    </a>
                    {/* Modal for bigger image view */}
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
                                style={{ maxWidth: '100%', maxHeight: '70vh', border: '2px solid #0d6efd' }}
                                className="img-fluid rounded shadow"
                              />
                              <br />
                              <a href={`${process.env.REACT_APP_API_BASE}${fileInfo.filePath}`} download target="_blank" rel="noopener noreferrer" className="btn btn-success mt-3 px-4">
                                <i className="bi bi-download me-2"></i>Download
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <a href={`${process.env.REACT_APP_API_BASE}${fileInfo.filePath}`} download target="_blank" rel="noopener noreferrer" className="btn btn-success px-4">Download/View File</a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewUploadedSadhanaCard;
