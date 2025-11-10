import React, { useState, useEffect, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";

const NotificationSend = ({ sentBy, senderName }) => {
    // Support both prop names for backward compatibility
    const sender = senderName || sentBy || "";
    const [searchUser, setSearchUser] = useState("");
    const [message, setMessage] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [selectedEmail, setSelectedEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const debounceRef = useRef(null);

    // Search devotees by name/email as the user types. Backend should provide /api/devotees/search
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
            setSuggestions(res.data || []);
        } catch (err) {
            console.error("Search error:", err);
            setSuggestions([]);
        }
    };

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            searchDevotees(searchUser);
        }, 300);
        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    }, [searchUser]);

    const handleSelectSuggestion = (s) => {
        const displayName = s.initiated_name?.trim() || `${[s.first_name, s.last_name].filter(Boolean).join(' ')}`;
        setSearchUser(displayName + (s.email ? ` - ${s.email}` : ""));
        setSelectedEmail(s.email || "");
        setSuggestions([]);
    };

    const handleSend = async () => {
        if (!selectedEmail || !message.trim()) {
            alert('Please select a recipient and enter a message.');
            return;
        }
        setLoading(true);
        try {
            // POST to notifications API with who sent it
            const token = localStorage.getItem('token');
            const payload = { to: selectedEmail, message, sent_by: sender };
            await axios.post(`${process.env.REACT_APP_API_BASE}/api/notifications/send`, payload, { headers: { Authorization: `Bearer ${token}` } });

            // Success feedback
            alert(`Message sent to ${selectedEmail}`);
            setMessage("");
            setSearchUser("");
            setSelectedEmail("");
        } catch (err) {
            console.error('Send error:', err);
            const msg = err?.response?.data?.message || 'Failed to send notification.';
            alert(msg);
        }
        setLoading(false);
    };

    return (
        <div className="container mt-4">
            <div className="card shadow-sm">
                <div className="card-header bg-primary text-white">
                    <h4 className="mb-0">Send Notification</h4>
                </div>
                <div className="card-body position-relative">
                    <div className="mb-3 position-relative" style={{ maxWidth: 600 }}>
                        <label htmlFor="searchUser" className="form-label">Search User</label>
                        <input
                            type="text"
                            className="form-control"
                            id="searchUser"
                            placeholder="Type name or email (min 2 chars)"
                            value={searchUser}
                            onChange={(e) => { setSearchUser(e.target.value); setSelectedEmail(""); }}
                            autoComplete="off"
                        />
                        {suggestions.length > 0 && (
                            <ul className="list-group position-absolute" style={{ zIndex: 2000, width: '100%' }}>
                                {suggestions.map(s => (
                                    <li key={s.email || s.id} className="list-group-item list-group-item-action" style={{ cursor: 'pointer' }} onClick={() => handleSelectSuggestion(s)}>
                                        {s.initiated_name?.trim() ? `${s.initiated_name.trim()} - ${s.email}` : `${[s.first_name, s.last_name].filter(Boolean).join(' ')} - ${s.email}`}
                                    </li>
                                ))}
                            </ul>
                        )}
                        {selectedEmail && <small className="form-text text-muted">Recipient: {selectedEmail}</small>}
                        {/* Show who is sending the notification (coming from parent prop) */}
                        {sender ? (
                            <div><small className="form-text text-muted">Sending as: <strong>{sender}</strong></small></div>
                        ) : (
                            <div><small className="form-text text-danger">Sender not set — notification can't be sent. Please ensure you're logged in.</small></div>
                        )}
                    </div>
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
