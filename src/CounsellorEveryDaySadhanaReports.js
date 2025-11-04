import React, { useEffect, useState } from "react";
import axios from "axios";

export default function CounsellorEveryDaySadhanaReports() {
  const [devotees, setDevotees] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [entries, setEntries] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => String(currentYear - i));
  const months = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  useEffect(() => {
    const fetchDevotees = async () => {
      if (!token || !userId) return;
      try {
        const res = await axios.get(
            `${process.env.REACT_APP_API_BASE}/api/counsellor/devotees`,
            {
              headers: { Authorization: `Bearer ${token}` },
              params: { user_id: userId },
            }
        );
        setDevotees(res.data);
      } catch (err) {
        console.error("Error fetching:", err);
      }
    };
    fetchDevotees();
  }, [token, userId]);

  const fetchEntries = async (id, month, year, page) => {
    try {
      const res = await axios.get(
          `${process.env.REACT_APP_API_BASE}/api/sadhana/by-email`,
          {
            headers: { Authorization: `Bearer ${token}` },
            params: { id, month, year, page },
          }
      );
      setEntries(res.data.entries);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error("Error fetching sadhana entries:", err);
      setEntries([]);
    }
  };

  const handleDevoteeSelect = (e) => {
    const email = e.target.value;
    setSelectedId(email);
    setSelectedMonth("");
    setSelectedYear("");
    setEntries([]);
  };

  const handleMonthChange = (e) => {
    const month = e.target.value;
    setSelectedMonth(month);
    if (selectedYear && selectedId) {
      fetchEntries(selectedId, month, selectedYear, 1);
      setCurrentPage(1);
    }
  };

  const handleYearChange = (e) => {
    const year = e.target.value;
    setSelectedYear(year);
    if (selectedMonth && selectedId) {
      fetchEntries(selectedId, selectedMonth, year, 1);
      setCurrentPage(1);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchEntries(selectedId, selectedMonth, selectedYear, page);
  };

  return (
      <div className="container mt-5" style={{ maxWidth: 1000 }}>
        <div className="card shadow border-0">
          <div className="card-header bg-primary text-white text-center">
            <h4 className="mb-0">Counsellor's Devotee Sadhana Report</h4>
          </div>
          <div className="card-body">
            <div className="mb-4">
              <label className="form-label fw-bold">Select Devotee:</label>
              <select className="form-select" value={selectedId} onChange={handleDevoteeSelect}>
                <option value="">-- Choose Devotee --</option>
                {devotees.map((d, idx) => (
                    <option key={idx} value={d.devotee.id}>
                      {d.devotee.initiated_name} ({d.devotee.email})
                    </option>
                ))}
              </select>
            </div>

            {selectedId && (
                <div className="row mb-4 g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Year:</label>
                    <select className="form-select" value={selectedYear} onChange={handleYearChange}>
                      <option value="">-- Select Year --</option>
                      {years.map((y) => (
                          <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Month:</label>
                    <select className="form-select" value={selectedMonth} onChange={handleMonthChange}>
                      <option value="">-- Select Month --</option>
                      {months.map((m) => (
                          <option key={m.value} value={m.value}>{m.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
            )}

            {entries.length > 0 && (
                <>
                  <div className="table-responsive">
                    <table className="table table-bordered table-striped align-middle">
                      <thead className="table-dark text-center">
                      <tr>
                        <th>Date</th>
                        <th>Wake-up Time</th>
                        <th>Chanting Rounds</th>
                        <th>Reading Time</th>
                        <th>Reading Topic</th>
                        <th>Hearing Time</th>
                        <th>Hearing Topic</th>
                        <th>Service Name</th>
                        <th>Service Time</th>
                      </tr>
                      </thead>
                      <tbody>
                      {entries.map((entry, idx) => (
                          <tr key={idx}>
                            <td>{entry.entry_date}</td>
                            <td>{entry.wake_up_time}</td>
                            <td>{entry.chanting_rounds}</td>
                            <td>{entry.reading_time} min</td>
                            <td>{entry.reading_topic}</td>
                            <td>{entry.hearing_time} min</td>
                            <td>{entry.hearing_topic}</td>
                            <td>{entry.service_name}</td>
                            <td>{entry.service_time} min</td>
                          </tr>
                      ))}
                      </tbody>
                    </table>
                  </div>
                  <nav>
                    <ul className="pagination justify-content-center">
                      {Array.from({ length: totalPages }, (_, i) => (
                          <li key={i + 1} className={`page-item ${currentPage === i + 1 ? "active" : ""}`}>
                            <button className="page-link" onClick={() => handlePageChange(i + 1)}>
                              {i + 1}
                            </button>
                          </li>
                      ))}
                    </ul>
                  </nav>
                </>
            )}
            {selectedId && entries.length === 0 && (
                <div className="alert alert-info text-center mt-4">No entries found for the selected month and year.</div>
            )}
          </div>
        </div>
      </div>
  );

}