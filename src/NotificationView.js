import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const NotificationView = () => {
    const [notifications, setNotifications] = useState([
        { id: 1, message: "Your facilitator has sent you a new message.", read: false },
        { id: 2, message: "You submitted your Sadhana card.", read: true },
        { id: 3, message: "Reminder: Submit your Sadhana card today.", read: false }
    ]);
    const [activeTab, setActiveTab] = useState("recent");

    const toggleRead = (id) => {
        setNotifications(
            notifications.map((note) =>
                note.id === id ? { ...note, read: !note.read } : note
            )
        );
    };

    const recentNotifications = notifications.filter(note => !note.read);
    const readNotifications = notifications.filter(note => note.read);

    return (
        <div className="container mt-4">
            <div className="card shadow-sm">
                <div className="card-header bg-info text-white">
                    <h4 className="mb-0">Notifications</h4>
                </div>
                <div className="card-body">
                    <ul className="nav nav-tabs mb-3">
                        <li className="nav-item">
                            <button className={`nav-link ${activeTab === "recent" ? "active" : ""}`} onClick={() => setActiveTab("recent")}>Recent</button>
                        </li>
                        <li className="nav-item">
                            <button className={`nav-link ${activeTab === "read" ? "active" : ""}`} onClick={() => setActiveTab("read")}>Read</button>
                        </li>
                    </ul>

                    <ul className="list-group">
                        {(activeTab === "recent" ? recentNotifications : readNotifications).map((note) => (
                            <li
                                key={note.id}
                                className={`list-group-item d-flex justify-content-between align-items-center ${note.read ? 'text-muted' : 'fw-bold'}`}
                            >
                                {note.message}
                                <div className="form-check">
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
                        {(activeTab === "recent" ? recentNotifications : readNotifications).length === 0 && (
                            <li className="list-group-item text-muted">No notifications to display.</li>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default NotificationView;