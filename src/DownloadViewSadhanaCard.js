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


const DownloadViewSadhanaCard = () => {
    const [email, setEmail] = useState('');
    const [entries, setEntries] = useState([]);
    const [editingEntryId, setEditingEntryId] = useState(null);
    const [editFormData, setEditFormData] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(null);

    useEffect(() => {
        const storedEmail = localStorage.getItem('userId');
        if (storedEmail) {
            setEmail(storedEmail);
            fetchEntries(storedEmail);
        } else {
            alert('User email not found in local storage.');
        }
    }, []);

    const fetchEntries = async (email) => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_BASE}/api/sadhana/entries/${email}`);
            setEntries(response.data);
        } catch (error) {
            console.error('Error fetching sadhana entries:', error);
        }
    };

    // Helper to get an entry id field (supports `id` or `_id`)
    const getEntryId = (entry) => entry.id || entry._id || entry.entry_id;

    const startEdit = (entry) => {
        const id = getEntryId(entry);
        setEditingEntryId(id);
        // initialize form data with the editable fields
        setEditFormData({
            entry_date: entry.entry_date ? entry.entry_date.split('T')[0] : '',
            wake_up_time: entry.wake_up_time || '',
            chanting_rounds: entry.chanting_rounds || '',
            reading_time: entry.reading_time || '',
            reading_topic: entry.reading_topic || '',
            hearing_time: entry.hearing_time || '',
            hearing_topic: entry.hearing_topic || '',
            service_name: entry.service_name || '',
            service_time: entry.service_time || ''
        });
    };

    const handleEditChange = (field, value) => {
        setEditFormData(prev => ({ ...prev, [field]: value }));
    };

    const saveEdit = async (entry) => {
        const id = getEntryId(entry);
        setIsSaving(true);
        try {
            // Assumption: update endpoint is a PUT to /api/sadhana/entries/:id
            const payload = { ...editFormData };
            const res = await axios.put(`${process.env.REACT_APP_API_BASE}/api/sadhana/entries/${id}`, payload);
            // Replace the entry in local state with returned updated entry if provided
            const updated = res.data || { ...entry, ...payload };
            setEntries(prev => prev.map(e => (getEntryId(e) === id ? updated : e)));
            setEditingEntryId(null);
            setEditFormData({});
        } catch (err) {
            console.error('Error saving entry:', err);
            alert('Failed to save entry. See console for details.');
        } finally {
            setIsSaving(false);
        }
    };

    const cancelEdit = () => {
        setEditingEntryId(null);
        setEditFormData({});
    };

    const deleteEntry = async (entry) => {
        const id = getEntryId(entry);
        if (!window.confirm('Are you sure you want to delete this entry?')) return;
        setIsDeleting(id);
        try {
            // Assumption: delete endpoint is DELETE to /api/sadhana/entries/:id
            await axios.delete(`${process.env.REACT_APP_API_BASE}/api/sadhana/entries/${id}`);
            setEntries(prev => prev.filter(e => getEntryId(e) !== id));
            if (editingEntryId === id) cancelEdit();
        } catch (err) {
            console.error('Error deleting entry:', err);
            alert('Failed to delete entry. See console for details.');
        } finally {
            setIsDeleting(null);
        }
    };

    const downloadCSV = () => {
        const csvContent = [
            ['Date', 'Wake-up Time', 'Chanting Rounds', 'Reading Time', 'Reading Topic', 'Hearing Time', 'Hearing Topic', 'Service Name', 'Service Time'],
            ...entries.map(entry => [
                entry.entry_date,
                entry.wake_up_time,
                entry.chanting_rounds,
                formatTime(entry.reading_time),
                entry.reading_topic,
                entry.hearing_time,
                formatTime(entry.hearing_time),
                entry.service_name,
                formatTime(entry.service_time)
            ])
        ].map(e => e.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', 'sadhana_entries.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const downloadPDF = () => {
        const doc = new jsPDF();
        doc.text("Your Sadhana Entries", 14, 15);
        doc.autoTable({
            startY: 20,
            head: [[
                "Date", "Wake-up Time", "Chanting Rounds", "Reading Time", "Reading Topic",
                "Hearing Time", "Hearing Topic", "Service Name", "Service Time"
            ]],
            body: entries.map(entry => [
                entry.entry_date ? entry.entry_date.split('T')[0] : '',
                entry.wake_up_time,
                entry.chanting_rounds,
                formatTime(entry.reading_time),
                entry.reading_topic,
                formatTime(entry.hearing_time),
                entry.hearing_topic,
                entry.service_name,
                formatTime(entry.service_time)
            ]),
        });
        doc.save("sadhana_entries.pdf");
    };

    return (
        <div className="container mt-4">
            <h4 className="text-center mb-3">Your Sadhana Entries</h4>
            <button className="btn btn-primary mb-3" onClick={downloadCSV}>Download CSV</button>
            <button className="btn btn-secondary mb-3 ms-2" onClick={downloadPDF}>Download PDF</button>
            <div className="table-responsive">
                <table className="table table-bordered table-striped">
                    <thead className="table-dark">
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
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {entries.map((entry, index) => {
                        const id = getEntryId(entry) || index;
                        const isEditing = editingEntryId === id;
                        return (
                            <tr key={id}>
                                <td>
                                    {isEditing ? (
                                        <input type="date" className="form-control" value={editFormData.entry_date || ''} onChange={e => handleEditChange('entry_date', e.target.value)} />
                                    ) : (
                                        entry.entry_date ? entry.entry_date.split('T')[0] : ''
                                    )}
                                </td>
                                <td>
                                    {isEditing ? (
                                        <input type="text" className="form-control" value={editFormData.wake_up_time || ''} onChange={e => handleEditChange('wake_up_time', e.target.value)} />
                                    ) : (
                                        entry.wake_up_time
                                    )}
                                </td>
                                <td>
                                    {isEditing ? (
                                        <input type="number" className="form-control" value={editFormData.chanting_rounds || ''} onChange={e => handleEditChange('chanting_rounds', e.target.value)} />
                                    ) : (
                                        entry.chanting_rounds
                                    )}
                                </td>
                                <td>
                                    {isEditing ? (
                                        <input type="number" className="form-control" value={editFormData.reading_time || ''} onChange={e => handleEditChange('reading_time', e.target.value)} />
                                    ) : (
                                        formatTime(entry.reading_time)
                                    )}
                                </td>
                                <td>
                                    {isEditing ? (
                                        <input type="text" className="form-control" value={editFormData.reading_topic || ''} onChange={e => handleEditChange('reading_topic', e.target.value)} />
                                    ) : (
                                        entry.reading_topic
                                    )}
                                </td>
                                <td>
                                    {isEditing ? (
                                        <input type="number" className="form-control" value={editFormData.hearing_time || ''} onChange={e => handleEditChange('hearing_time', e.target.value)} />
                                    ) : (
                                        formatTime(entry.hearing_time)
                                    )}
                                </td>
                                <td>
                                    {isEditing ? (
                                        <input type="text" className="form-control" value={editFormData.hearing_topic || ''} onChange={e => handleEditChange('hearing_topic', e.target.value)} />
                                    ) : (
                                        entry.hearing_topic
                                    )}
                                </td>
                                <td>
                                    {isEditing ? (
                                        <input type="text" className="form-control" value={editFormData.service_name || ''} onChange={e => handleEditChange('service_name', e.target.value)} />
                                    ) : (
                                        entry.service_name
                                    )}
                                </td>
                                <td>
                                    {isEditing ? (
                                        <input type="number" className="form-control" value={editFormData.service_time || ''} onChange={e => handleEditChange('service_time', e.target.value)} />
                                    ) : (
                                        formatTime(entry.service_time)
                                    )}
                                </td>
                                <td>
                                    {isEditing ? (
                                        <>
                                            <button className="btn btn-sm btn-success me-2" onClick={() => saveEdit(entry)} disabled={isSaving}>
                                                {isSaving ? 'Saving...' : 'Save'}
                                            </button>
                                            <button className="btn btn-sm btn-secondary" onClick={cancelEdit} disabled={isSaving}>Cancel</button>
                                        </>
                                    ) : (
                                        <>
                                            <button className="btn btn-sm btn-primary me-2" onClick={() => startEdit(entry)}>Edit</button>
                                            <button className="btn btn-sm btn-danger" onClick={() => deleteEntry(entry)} disabled={isDeleting === id}>
                                                {isDeleting === id ? 'Deleting...' : 'Delete'}
                                            </button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DownloadViewSadhanaCard;
