import React, { useEffect, useState } from 'react';
import axios from 'axios';
import jsPDF from "jspdf";
import "jspdf-autotable";


const formatTime = (minutes) => {
    if (!minutes && minutes !== 0) return '';
    if (minutes >= 60 && minutes % 60 === 0) {
        return `${minutes / 60} hr`;
    }
    return `${minutes} min`;
};
// --- Month/Year Dropdown Implementation ---

const getMonthName = (monthNumber) => {
    return new Date(2000, monthNumber - 1, 1).toLocaleString('default', { month: 'long' });
};

const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    return [currentYear, currentYear - 1];
};

const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1);


export default function DownloadViewSadhanaCard({ devoteeId }) {
    const [entries, setEntries] = useState([]);
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!devoteeId) return;
        const fetchEntries = async () => {
            setLoading(true);
            setError("");
            try {
                const res = await axios.get(`${process.env.REACT_APP_API_BASE}/api/sadhana/entries-by-month`, {
                    params: { user_id: devoteeId, month: String(month).padStart(2, '0'), year }
                });
                setEntries(res.data || []);
            } catch (err) {
                setError("Failed to fetch sadhana entries.");
                setEntries([]);
            } finally {
                setLoading(false);
            }
        };
        fetchEntries();
    }, [devoteeId, year, month]);

    // Helper to format date
    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleDateString();
    };
    // Helper to format time in hours/minutes
    const formatMinutes = (minutes) => {
        if (!minutes && minutes !== 0) return '';
        if (minutes >= 60 && minutes % 60 === 0) {
            return `${minutes / 60} hr`;
        }
        if (minutes > 60) {
            const h = Math.floor(minutes / 60);
            const m = minutes % 60;
            return `${h} hr${h > 1 ? 's' : ''}${m ? ' ' + m + ' min' : ''}`;
        }
        return `${minutes} min`;
    };

    return (
        <div className="container py-4">
            <div className="row justify-content-center">
                <div className="col-lg-10">
                    <div className="card shadow-lg border-0 rounded-4">
                        <div className="card-header bg-primary text-white rounded-top-4 d-flex align-items-center justify-content-between">
                            <h4 className="mb-0">📅 View Sadhana Entries by Month</h4>
                            <div className="d-flex gap-3">
                                <div>
                                    <label htmlFor="yearSelect" className="form-label mb-0 me-2">Year</label>
                                    <select
                                        id="yearSelect"
                                        className="form-select d-inline-block w-auto"
                                        value={year}
                                        onChange={e => setYear(Number(e.target.value))}
                                    >
                                        {getYearOptions().map(y => (
                                            <option key={y} value={y}>{y}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="monthSelect" className="form-label mb-0 me-2">Month</label>
                                    <select
                                        id="monthSelect"
                                        className="form-select d-inline-block w-auto"
                                        value={month}
                                        onChange={e => setMonth(Number(e.target.value))}
                                    >
                                        {monthOptions.map(m => (
                                            <option key={m} value={m}>{getMonthName(m)}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="card-body bg-light rounded-bottom-4">
                            {loading ? (
                                <div className="text-center py-5">
                                    <div className="spinner-border text-primary mb-2" role="status" />
                                    <div>Loading...</div>
                                </div>
                            ) : error ? (
                                <div className="alert alert-danger text-center">{error}</div>
                            ) : entries.length === 0 ? (
                                <div className="alert alert-warning text-center">No data</div>
                            ) : (
                                <div style={{ overflowX: 'auto', maxHeight: 400, overflowY: 'auto' }}>
                                    <table className="table table-hover align-middle table-bordered border-primary rounded-3 overflow-hidden mb-0">
                                        <thead className="table-primary">
                                            <tr>
                                                <th>Date</th>
                                                <th>Wake Up Time</th>
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
                                            {entries.map(entry => (
                                                <tr key={entry.id || entry.entry_date}>
                                                    <td>{formatDate(entry.entry_date)}</td>
                                                    <td>{entry.wake_up_time}</td>
                                                    <td>{entry.chanting_rounds}</td>
                                                    <td>{formatMinutes(entry.reading_time)}</td>
                                                    <td>{entry.reading_topic}</td>
                                                    <td>{formatMinutes(entry.hearing_time)}</td>
                                                    <td>{entry.hearing_topic}</td>
                                                    <td>{entry.service_name}</td>
                                                    <td>{formatMinutes(entry.service_time)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
