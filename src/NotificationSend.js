import React, { useState, useEffect, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import "./CustomToast.css";

const NotificationSend = ({ sentBy, senderName, userRole, devoteeId, email }) => {
    console.log('NotificationSend userRole:', userRole);
    console.log('NotificationSend devoteeId:', devoteeId);
    console.log('NotificationSend email:', email);
    // Support both prop names for backward compatibility
    const sender = senderName || sentBy || "";
    const [searchUser, setSearchUser] = useState("");
    const [message, setMessage] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [selectedEmail, setSelectedEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [facilitator, setFacilitator] = useState(null);
    const [devotees, setDevotees] = useState([]); // For facilitator search
    const [allUsers, setAllUsers] = useState([]); // For admin global search
    const debounceRef = useRef(null);

    // Fetch facilitator for current user (for user role)
    useEffect(() => {
        if (userRole === "user") {
            if (!devoteeId) return;
            const token = localStorage.getItem("token");
            axios.get(`${process.env.REACT_APP_API_BASE}/api/facilitator/by-devotee-id`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { devotee_id: email }
            })
            .then(res => setFacilitator(res.data))
            .catch(() => setFacilitator(null));
        }
    }, [userRole]);

    // Fetch devotees for facilitator (for counsellor role)
    useEffect(() => {
        if (userRole === "counsellor") {
            const facilitatorId = localStorage.getItem("userId");
            if (!facilitatorId) return;
            const token = localStorage.getItem("token");
            axios.get(`${process.env.REACT_APP_API_BASE}/api/facilitator/devotees-by-facilitator-id`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { facilitator_id: devoteeId }
            })
            .then(res => setDevotees(res.data || []))
            .catch(() => setDevotees([]));
        }
    }, [userRole]);

    // Fetch all users for admin (optional: can use API or keep search as is)
    useEffect(() => {
        if (userRole === "admin") {
            // No need to prefetch all users, just use the global search API
            setAllUsers([]);
        }
    }, [userRole]);

    // Search devotees by name/email as the user types
    const searchDevotees = async (q) => {
        if (!q || q.trim().length < 2) {
            setSuggestions([]);
            return;
        }
        const token = localStorage.getItem("token");
        if (userRole === "counsellor") {
            // Only search in the facilitator's devotees
            const filtered = devotees.filter(d => {
                const name = `${d.initiated_name || ''} ${d.first_name || ''} ${d.last_name || ''}`.toLowerCase();
                return name.includes(q.toLowerCase()) || (d.email && d.email.toLowerCase().includes(q.toLowerCase()));
            });
            setSuggestions(filtered);
        } else if (userRole === "admin") {
            // Use global search API for admin
            try {
                const res = await axios.get(`${process.env.REACT_APP_API_BASE}/api/devotees/search`, {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { query: q }
                });
                setSuggestions(res.data || []);
            } catch (err) {
                setSuggestions([]);
            }
        }
    };

    useEffect(() => {
        if (userRole !== "counsellor" && userRole !== "admin") return;
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            searchDevotees(searchUser);
        }, 300);
        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    }, [searchUser, userRole, devotees]);

    const handleSelectSuggestion = (s) => {
        const displayName = s.initiated_name?.trim() || `${[s.first_name, s.last_name].filter(Boolean).join(' ')}`;
        setSearchUser(displayName + (s.email ? ` - ${s.email}` : ""));
        setSelectedEmail(s.email || "");
        setSuggestions([]);
    };

    const handleFacilitatorSelect = () => {
        if (facilitator) {
            setSelectedEmail(facilitator.email);
            setSearchUser("");
        }
    };

    const handleSend = async () => {
        if (!selectedEmail || !message.trim()) {
            setToast({ show: true, message: 'Please select a recipient and enter a message.', type: 'error' });
            return;
        }
        setLoading(true);
        try {
            // POST to notifications API with who sent it
            const token = localStorage.getItem('token');
            const payload = { to: selectedEmail, message, sent_by: sender };
            await axios.post(`${process.env.REACT_APP_API_BASE}/api/notifications/send`, payload, { headers: { Authorization: `Bearer ${token}` } });

            // Success feedback
            setToast({ show: true, message: `Message sent to ${selectedEmail}`, type: 'success' });
            setMessage("");
            setSearchUser("");
            setSelectedEmail("");
        } catch (err) {
            console.error('Send error:', err);
            const msg = err?.response?.data?.message || 'Failed to send notification.';
            setToast({ show: true, message: msg, type: 'error' });
        }
        setLoading(false);
    };

    // Toast auto-hide
    useEffect(() => {
        if (toast.show) {
            const timer = setTimeout(() => setToast(t => ({ ...t, show: false })), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast.show]);

    return (
        <div className="container mt-4">
            {/* Custom Toast */}
            <div className={`custom-toast${toast.show ? ' show' : ''} ${toast.type}`} role="alert" style={{ pointerEvents: toast.show ? 'auto' : 'none' }}>
                <span>{toast.message}</span>
                <button className="toast-close" onClick={() => setToast(t => ({ ...t, show: false }))} aria-label="Close">&times;</button>
            </div>
            <div className="card shadow-sm">
                <div className="card-header bg-primary text-white">
                    <h4 className="mb-0">Send Notification</h4>
                </div>
                <div className="card-body position-relative">
                    {/* Facilitator Dropdown for user role only */}
                    {userRole === "user" && facilitator && (
                        <div className="mb-3" style={{ maxWidth: 600 }}>
                            <label className="form-label">Facilitator</label>
                            <select
                                className="form-select"
                                value={selectedEmail}
                                onChange={e => {
                                    if (e.target.value) { setSelectedEmail(e.target.value); setSearchUser(""); }
                                    else { setSelectedEmail(''); }
                                }}
                            >
                                <option value="">-- Select Facilitator --</option>
                                <option value={facilitator.email}>{facilitator.initiated_name || facilitator.first_name + ' ' + facilitator.last_name} ({facilitator.email})</option>
                            </select>
                        </div>
                    )}
                    {/* Search User for counsellor and admin only */}
                    {(userRole === "counsellor" || userRole === "admin") && (
                        <div className="mb-3 position-relative" style={{ maxWidth: 600 }}>
                            <label htmlFor="searchUser" className="form-label">Search Devotee</label>
                            <input
                                type="text"
                                className="form-control"
                                id="searchUser"
                                placeholder="Type name or email (min 2 chars)"
                                value={searchUser}
                                onChange={(e) => { setSearchUser(e.target.value); setSelectedEmail(""); }}
                                autoComplete="off"
                                disabled={userRole === "counsellor" && devotees.length === 0}
                            />
                            {userRole === "counsellor" && devotees.length === 0 && (
                                <div className="text-danger mt-2">No devotees assigned to you.</div>
                            )}
                            {suggestions.length > 0 && (
                                <ul className="list-group position-absolute" style={{ zIndex: 2000, width: '100%' }}>
                                    {suggestions.map(s => (
                                        <li key={s.email || s.id} className="list-group-item list-group-item-action" style={{ cursor: 'pointer' }} onClick={() => handleSelectSuggestion(s)}>
                                            {s.initiated_name?.trim() ? `${s.initiated_name.trim()} - ${s.email}` : `${[s.first_name, s.last_name].filter(Boolean).join(' ')} - ${s.email}`}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}
                    {selectedEmail && <small className="form-text text-muted">Recipient: {selectedEmail}</small>}
                    {/* Show who is sending the notification (coming from parent prop) */}
                    {sender ? (
                        <div><small className="form-text text-muted">Sending as: <strong>{sender}</strong></small></div>
                    ) : (
                        <div><small className="form-text text-danger">Sender not set — notification can't be sent. Please ensure you're logged in.</small></div>
                    )}
                    <div className="mb-3">
                        <label htmlFor="message" className="form-label">Message</label>
                        <textarea
                            className="form-control"
                            id="message"
                            rows="5"
                            placeholder="Type your message here"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        ></textarea>
                    </div>
                    <button className="btn btn-success" onClick={handleSend} disabled={loading || !selectedEmail || !message.trim() || !sender}>{loading ? 'Sending...' : 'Send'}</button>
                 </div>
             </div>
         </div>
     );
};

export default NotificationSend;
