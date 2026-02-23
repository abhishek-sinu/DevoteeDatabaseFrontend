import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./NotificationView.css";
import quotes from "./quotes";

const getQuoteOfTheDay = () => {
    if (!quotes.length) {
        return { text: "Stay steady in service and progress with gratitude.", author: "Daily Reflection" };
    }

    const today = new Date();
    const daySeed = Number(`${today.getUTCFullYear()}${today.getUTCMonth() + 1}${today.getUTCDate()}`);
    const quoteIndex = daySeed % quotes.length;
    return quotes[quoteIndex];
};

const NotificationView = ({ email }) => {
    const [notifications, setNotifications] = useState([]);
    const [activeTab, setActiveTab] = useState("recent");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const devoteeEmail = email || "";
    const quoteOfTheDay = getQuoteOfTheDay();

    useEffect(() => {
        if (!devoteeEmail) return;
        setLoading(true);
        setError("");
        fetch(`${process.env.REACT_APP_API_BASE}/api/notifications/view?devotee_email=${encodeURIComponent(devoteeEmail)}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        })
            .then(res => {
                if (!res.ok) throw new Error("Failed to fetch notifications");
                return res.json();
            })
            .then(data => {
                // Use status from backend: 'read' or 'unread'
                setNotifications(data.map(n => ({ ...n, read: n.status === 'read' })));
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [devoteeEmail]);

    const toggleRead = async (id) => {
        const note = notifications.find(n => n.id === id);
        if (!note) return;
        const newStatus = note.read ? 'unread' : 'read';
        try {
            await fetch(`${process.env.REACT_APP_API_BASE}/api/notifications/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({ id, status: newStatus })
            });
            setNotifications(
                notifications.map((n) =>
                    n.id === id ? { ...n, read: !n.read, status: newStatus } : n
                )
            );
        } catch (err) {
            setError('Failed to update notification status.' + err.message);
        }
    };

    // Sort by created_at descending (most recent first)
    const sortedNotifications = [...notifications].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const recentNotifications = sortedNotifications.filter(note => note.status !== 'read');
    const readNotifications = sortedNotifications.filter(note => note.status === 'read');

    return (
        <div className="container-fluid mt-3 px-3 px-lg-4">
            <div className="card shadow-sm notification-shell">
                <div className="card-header notification-shell__header">
                    <h4 className="mb-0 text-white">Notifications</h4>
                </div>
                <div className="card-body">
                    <div className="row g-3">
                        <div className="col-12 col-lg-8">
                            <ul className="nav nav-tabs mb-3">
                                <li className="nav-item">
                                    <button className={`nav-link ${activeTab === "recent" ? "active" : ""}`} onClick={() => setActiveTab("recent")}>Recent</button>
                                </li>
                                <li className="nav-item">
                                    <button className={`nav-link ${activeTab === "read" ? "active" : ""}`} onClick={() => setActiveTab("read")}>Read</button>
                                </li>
                            </ul>

                            {loading && <div className="text-center text-secondary mb-3">Loading notifications...</div>}
                            {error && <div className="alert alert-danger mb-3">{error}</div>}

                            <ul className="list-group">
                                {(activeTab === "recent" ? recentNotifications : readNotifications).map((note) => (
                                    <li
                                        key={note.id}
                                        className={`list-group-item notification-item ${note.read ? 'text-muted' : 'fw-bold'}`}
                                    >
                                        <div className="notification-item__content">
                                            <div>{note.message}</div>
                                            <div className="small text-secondary">
                                                {note.sent_by && <span>From: {note.sent_by} | </span>}
                                                {note.created_at && new Date(note.created_at).toLocaleString()}
                                            </div>
                                        </div>
                                        <div className="form-check ms-3">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                checked={note.read}
                                                onChange={() => toggleRead(note.id)}
                                                id={`check-${note.id}`}
                                            />
                                            <label className="form-check-label" htmlFor={`check-${note.id}`}>
                                                {note.read ? "Read" : "Unread"}
                                            </label>
                                        </div>
                                    </li>
                                ))}
                                {(activeTab === "recent" ? recentNotifications : readNotifications).length === 0 && !loading && (
                                    <li className="list-group-item text-muted">No notifications to display.</li>
                                )}
                            </ul>
                        </div>

                        <div className="col-12 col-lg-4">
                            <div className="card h-100 quote-day-card border-0 shadow-sm">
                                <div className="card-body d-flex flex-column">
                                    <p className="quote-day-title mb-2">Quote of the Day</p>
                                    <p className="quote-day-text flex-grow-1 mb-3">“{quoteOfTheDay.text}”</p>
                                    <p className="quote-day-author mb-0 text-end">— {quoteOfTheDay.author}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotificationView;