import React, { useEffect, useState } from 'react';
import axios from 'axios';
import jsPDF from "jspdf";
import "jspdf-autotable";
import './CustomToast.css';


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
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingEntry, setEditingEntry] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingEntry, setDeletingEntry] = useState(null);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [editFormData, setEditFormData] = useState({
        entryDate: '',
        wakeUpTime: '',
        chantingRounds: '',
        readingTime: '',
        readingTimeUnit: 'minutes',
        readingTopic: '',
        hearingTime: '',
        hearingTimeUnit: 'minutes',
        hearingTopic: '',
        serviceName: '',
        serviceTime: '',
        serviceTimeUnit: 'minutes'
    });

    // Toast auto-hide
    useEffect(() => {
        if (toast.show) {
            const timer = setTimeout(() => setToast(t => ({ ...t, show: false })), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast.show]);

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

    // Convert minutes to display value and unit
    const convertMinutesToForm = (minutes) => {
        if (!minutes) return { value: '', unit: 'minutes' };
        if (minutes >= 60 && minutes % 60 === 0) {
            return { value: minutes / 60, unit: 'hours' };
        }
        return { value: minutes, unit: 'minutes' };
    };

    // Handle Edit Click
    const handleEditClick = (entry) => {
        const readingData = convertMinutesToForm(entry.reading_time);
        const hearingData = convertMinutesToForm(entry.hearing_time);
        const serviceData = convertMinutesToForm(entry.service_time);

        setEditingEntry(entry);
        setEditFormData({
            entryDate: entry.entry_date ? entry.entry_date.split('T')[0] : '',
            wakeUpTime: entry.wake_up_time || '',
            chantingRounds: entry.chanting_rounds || '',
            readingTime: readingData.value,
            readingTimeUnit: readingData.unit,
            readingTopic: entry.reading_topic || '',
            hearingTime: hearingData.value,
            hearingTimeUnit: hearingData.unit,
            hearingTopic: entry.hearing_topic || '',
            serviceName: entry.service_name || '',
            serviceTime: serviceData.value,
            serviceTimeUnit: serviceData.unit
        });
        setShowEditModal(true);
    };

    // Handle Delete Click
    const handleDeleteClick = (entry) => {
        setDeletingEntry(entry);
        setDeleteConfirmText('');
        setShowDeleteModal(true);
    };

    // Confirm Delete
    const confirmDelete = async () => {
        if (!deletingEntry) return;

        try {
            await axios.delete(`${process.env.REACT_APP_API_BASE}/api/sadhana/entries/${deletingEntry.id}`);
            setShowDeleteModal(false);
            setDeletingEntry(null);
            setDeleteConfirmText('');
            setToast({ show: true, message: 'Sadhana entry deleted successfully!', type: 'success' });
            
            // Refresh entries
            const res = await axios.get(`${process.env.REACT_APP_API_BASE}/api/sadhana/entries-by-month`, {
                params: { user_id: devoteeId, month: String(month).padStart(2, '0'), year }
            });
            setEntries(res.data || []);
        } catch (err) {
            setShowDeleteModal(false);
            setDeletingEntry(null);
            setDeleteConfirmText('');
            setToast({ show: true, message: 'Failed to delete entry. Please try again.', type: 'error' });
            console.error(err);
        }
    };

    // Handle Edit Form Change
    const handleEditFormChange = (e) => {
        setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
    };

    // Handle Edit Form Submit
    const handleEditFormSubmit = async (e) => {
        e.preventDefault();

        const convertToMinutes = (value, unit) => {
            if (!value || value === '') return null;
            const num = parseInt(value);
            if (isNaN(num)) return null;
            return unit === 'hours' ? num * 60 : num;
        };

        const updatedData = {
            entryDate: editFormData.entryDate || null,
            wakeUpTime: editFormData.wakeUpTime || null,
            chantingRounds: editFormData.chantingRounds ? parseInt(editFormData.chantingRounds) : null,
            readingTime: convertToMinutes(editFormData.readingTime, editFormData.readingTimeUnit),
            readingTopic: editFormData.readingTopic || null,
            hearingTime: convertToMinutes(editFormData.hearingTime, editFormData.hearingTimeUnit),
            hearingTopic: editFormData.hearingTopic || null,
            serviceName: editFormData.serviceName || null,
            serviceTime: convertToMinutes(editFormData.serviceTime, editFormData.serviceTimeUnit)
        };

        console.log("Updating entry ID:", editingEntry.id);
        console.log("Update payload:", updatedData);
        console.log("Form data before conversion:", editFormData);

        try {
            await axios.put(`${process.env.REACT_APP_API_BASE}/api/sadhana/entries/${editingEntry.id}`, updatedData);
            setToast({ show: true, message: 'Sadhana entry updated successfully!', type: 'success' });
            setShowEditModal(false);
            setEditingEntry(null);
            
            // Refresh entries
            const res = await axios.get(`${process.env.REACT_APP_API_BASE}/api/sadhana/entries-by-month`, {
                params: { user_id: devoteeId, month: String(month).padStart(2, '0'), year }
            });
            setEntries(res.data || []);
        } catch (err) {
            setToast({ show: true, message: 'Failed to update entry. Please try again.', type: 'error' });
            console.error(err);
        }
    };

    return (
        <div className="container py-4">
            {/* Custom Toast */}
            <div className={`custom-toast${toast.show ? ' show' : ''} ${toast.type}`} role="alert" style={{ pointerEvents: toast.show ? 'auto' : 'none' }}>
                <span>{toast.message}</span>
                <button className="toast-close" onClick={() => setToast(t => ({ ...t, show: false }))} aria-label="Close">&times;</button>
            </div>

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
                                                <th>Actions</th>
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
                                                    <td style={{ whiteSpace: 'nowrap' }}>
                                                        <div className="d-flex gap-1">
                                                            <button 
                                                                className="btn btn-sm btn-warning" 
                                                                onClick={() => handleEditClick(entry)}
                                                                title="Edit"
                                                            >
                                                                <i className="bi bi-pencil-square"></i>
                                                            </button>
                                                            <button 
                                                                className="btn btn-sm btn-danger" 
                                                                onClick={() => handleDeleteClick(entry)}
                                                                title="Delete"
                                                            >
                                                                <i className="bi bi-trash3-fill"></i>
                                                            </button>
                                                        </div>
                                                    </td>
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

            {/* Edit Modal */}
            {showEditModal && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg modal-dialog-scrollable">
                        <div className="modal-content">
                            <div className="modal-header bg-primary text-white">
                                <h5 className="modal-title">Edit Sadhana Entry</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowEditModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <form onSubmit={handleEditFormSubmit} id="editSadhanaForm">
                                    <div className="row g-3">
                                        <div className="col-md-4">
                                            <label className="form-label">Date</label>
                                            <input 
                                                type="date" 
                                                name="entryDate" 
                                                value={editFormData.entryDate} 
                                                onChange={handleEditFormChange} 
                                                className="form-control" 
                                                required 
                                            />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label">Wake-up Time</label>
                                            <input 
                                                type="time" 
                                                name="wakeUpTime" 
                                                value={editFormData.wakeUpTime} 
                                                onChange={handleEditFormChange} 
                                                className="form-control" 
                                            />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label">Chanting Rounds</label>
                                            <input 
                                                type="number" 
                                                name="chantingRounds" 
                                                value={editFormData.chantingRounds} 
                                                onChange={handleEditFormChange} 
                                                className="form-control" 
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Reading Topic</label>
                                            <input 
                                                type="text" 
                                                name="readingTopic" 
                                                value={editFormData.readingTopic} 
                                                onChange={handleEditFormChange} 
                                                className="form-control" 
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Reading Time</label>
                                            <div className="input-group">
                                                <input 
                                                    type="number" 
                                                    name="readingTime" 
                                                    value={editFormData.readingTime} 
                                                    onChange={handleEditFormChange} 
                                                    className="form-control" 
                                                />
                                                <select 
                                                    name="readingTimeUnit" 
                                                    value={editFormData.readingTimeUnit} 
                                                    onChange={handleEditFormChange} 
                                                    className="form-select"
                                                    style={{ maxWidth: '120px' }}
                                                >
                                                    <option value="minutes">Minutes</option>
                                                    <option value="hours">Hours</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Hearing Topic</label>
                                            <input 
                                                type="text" 
                                                name="hearingTopic" 
                                                value={editFormData.hearingTopic} 
                                                onChange={handleEditFormChange} 
                                                className="form-control" 
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Hearing Time</label>
                                            <div className="input-group">
                                                <input 
                                                    type="number" 
                                                    name="hearingTime" 
                                                    value={editFormData.hearingTime} 
                                                    onChange={handleEditFormChange} 
                                                    className="form-control" 
                                                />
                                                <select 
                                                    name="hearingTimeUnit" 
                                                    value={editFormData.hearingTimeUnit} 
                                                    onChange={handleEditFormChange} 
                                                    className="form-select"
                                                    style={{ maxWidth: '120px' }}
                                                >
                                                    <option value="minutes">Minutes</option>
                                                    <option value="hours">Hours</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Service Name</label>
                                            <input 
                                                type="text" 
                                                name="serviceName" 
                                                value={editFormData.serviceName} 
                                                onChange={handleEditFormChange} 
                                                className="form-control" 
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Service Time</label>
                                            <div className="input-group">
                                                <input 
                                                    type="number" 
                                                    name="serviceTime" 
                                                    value={editFormData.serviceTime} 
                                                    onChange={handleEditFormChange} 
                                                    className="form-control" 
                                                />
                                                <select 
                                                    name="serviceTimeUnit" 
                                                    value={editFormData.serviceTimeUnit} 
                                                    onChange={handleEditFormChange} 
                                                    className="form-select"
                                                    style={{ maxWidth: '120px' }}
                                                >
                                                    <option value="minutes">Minutes</option>
                                                    <option value="hours">Hours</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
                                <button type="submit" form="editSadhanaForm" className="btn btn-primary">
                                    <i className="bi bi-check-circle"></i> Update Entry
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && deletingEntry && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header bg-danger text-white">
                                <h5 className="modal-title">Confirm Delete</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowDeleteModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <p>Are you sure you want to delete the sadhana entry for <strong>{formatDate(deletingEntry.entry_date)}</strong>?</p>
                                <p className="mb-2">Type <strong>delete</strong> to confirm:</p>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    placeholder="Type 'delete' to confirm"
                                    value={deleteConfirmText}
                                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                                    autoFocus
                                />
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                                <button 
                                    type="button" 
                                    className="btn btn-danger" 
                                    onClick={confirmDelete}
                                    disabled={deleteConfirmText.toLowerCase() !== 'delete'}
                                >
                                    <i className="bi bi-trash"></i> Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
