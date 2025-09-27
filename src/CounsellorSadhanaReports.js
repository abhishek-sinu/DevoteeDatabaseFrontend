import React, { useEffect, useState } from "react";
import axios from "axios";

export default function CounsellorSadhanaReports() {
  const [devotees, setDevotees] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState("");
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
            `${process.env.REACT_APP_API_BASE}/api/counsellor/devotees-sadhana`,
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

  const fetchEntries = async (email, month, year, page) => {
    try {
      const res = await axios.get(
          `${process.env.REACT_APP_API_BASE}/api/sadhana/by-email`,
          {
            headers: { Authorization: `Bearer ${token}` },
            params: { email, month, year, page },
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
    setSelectedEmail(email);
    setSelectedMonth("");
    setSelectedYear("");
    setEntries([]);
  };

  const handleMonthChange = (e) => {
    const month = e.target.value;
    setSelectedMonth(month);
    if (selectedYear && selectedEmail) {
      fetchEntries(selectedEmail, month, selectedYear, 1);
      setCurrentPage(1);
    }
  };

  const handleYearChange = (e) => {
    const year = e.target.value;
    setSelectedYear(year);
    if (selectedMonth && selectedEmail) {
      fetchEntries(selectedEmail, selectedMonth, year, 1);
      setCurrentPage(1);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchEntries(selectedEmail, selectedMonth, selectedYear, page);
  };

  return (
      <div className="container mt-4">
        <h4>Counsellor's Devotee Sadhana Report</h4>

        <div className="mb-3">
          <label>Select Devotee:</label>
          <select className="form-select" value={selectedEmail} onChange={handleDevoteeSelect}>
            <option value="">-- Choose Devotee --</option>
            {devotees.map((d, idx) => (
                <option key={idx} value={d.devotee.email}>
                  {d.devotee.initiated_name} ({d.devotee.email})
                </option>
            ))}
          </select>
        </div>

        {selectedEmail && (
            <div className="row mb-3">
              <div className="col">
                <label>Month:</label>
                <select className="form-select" value={selectedMonth} onChange={handleMonthChange}>
                  <option value="">-- Select Month --</option>
                  {months.map((m) => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
              <div className="col">
                <label>Year:</label>
                <select className="form-select" value={selectedYear} onChange={handleYearChange}>
                  <option value="">-- Select Year --</option>
                  {years.map((y) => (
                      <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>
        )}

        {entries.length > 0 && (
            <>
              <table className="table table-bordered">
                <thead>
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

              <nav>
                <ul className="pagination">
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
      </div>
  );
}