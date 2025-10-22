import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import DevoteeApp from "./DevoteeApp";
import BulkUploadDevotees from "./BulkUploadDevotees";
import ViewDevoteesTable from "./ViewDevoteesTable";
import Register from "./createUser";
import SadhanaEntryForm from "./SadhanaEntryForm"; // new
import SadhanaViewDownload from "./DownloadViewSadhanaCard"; // new
import UploadSadhanaCard from "./UploadSadhanaCard";
import './DevoteeApp.css';
import CounsellorEveryDaySadhanaReports from "./CounsellorEveryDaySadhanaReports";
import MyProfile from "./MyProfile";
import axios from "axios";
import ViewUploadedSadhanaCard from "./ViewUploadedSadhanaCard";
import 'bootstrap/dist/css/bootstrap.min.css';
import CounsellorUploadedSadhanaReports from "./CounsellorUploadedSadhanaReports"; // new
import AdminUploadedSadhanaReports from "./AdminUploadedSadhanaReports";

const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
};

export default function DevoteeDashboard() {
    const [view, setView] = useState("view");
    const [role, setRole] = useState("user");
    const [displayName, setDisplayName] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId");
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setRole(decoded.role || "user");
                if (decoded.role === "counsellor" || decoded.role === "user") {
                    setView("profile");
                }
            } catch (error) {
                console.error("Invalid token:", error);
            }
        }
        // Fetch devotee details
        if (userId) {
            const fetchDevotee = async () => {
                try {
                    const res = await axios.get(`${process.env.REACT_APP_API_BASE}/api/devotee`, {
                        headers: { Authorization: `Bearer ${token}` },
                        params: { userId }
                    });
                    if(res.data[0].initiated_name!=="") {
                        setDisplayName(res.data[0].initiated_name);
                    }else {
                        setDisplayName(`${res.data[0].first_name} ${res.data[0].last_name}`);
                    }
                } catch {
                    setDisplayName("");
                }
            };
            fetchDevotee();
        }
    }, []);

    return (
        <div className="container mt-4">
            {/* Krishna Invocation */}
            <div className="text-center p-3 mb-4 bg-info text-white rounded shadow">
                <h2>🙏 Śrī Guru Gaurāṅga Jayate 🙏</h2>
                <h4>Welcome to the Devotee Dashboard</h4>
            </div>

            {/* Logout Button */}
            <div className="d-flex justify-content-end align-items-center mb-3">
                <span className="me-3 fw-bold">{displayName}</span>
                <button onClick={handleLogout} className="btn btn-danger">
                    <i className="bi bi-box-arrow-right"></i> Logout
                </button>
            </div>

            {/* Action Buttons */}
            <div className="d-flex justify-content-center mb-4 flex-wrap gap-2">
                {role === "admin" && (
                    <button
                        onClick={() => setView("view")}
                        className={`btn btn-info${view === "view" ? " active" : ""}`}
                    >
                        <i className="bi bi-table"></i> View Devotees
                    </button>
                )}
                {role === "admin" && (
                    <>
                        <button
                            onClick={() => setView("add")}
                            className={`btn btn-primary${view === "add" ? " active" : ""}`}
                        >
                            <i className="bi bi-pencil-square"></i> Add / Update
                        </button>
                        <button
                            onClick={() => setView("bulk")}
                            className={`btn btn-success${view === "bulk" ? " active" : ""}`}
                        >
                            <i className="bi bi-upload"></i> Bulk Upload
                        </button>
                        <button
                            onClick={() => setView("register")}
                            className={`btn btn-warning${view === "register" ? " active" : ""}`}
                        >
                            <i className="bi bi-person-plus"></i> Assign Role
                        </button>
                        <button
                            onClick={() => setView("adminUploadedReports")}
                            className={`btn btn-secondary${view === "adminUploadedReports" ? " active" : ""}`}
                        >
                            <i className="bi bi-file-earmark-text"></i> Reports
                        </button>
                    </>
                )}
                {(role === "user" || role === "counsellor") && (
                    <button onClick={() => setView("profile")} className={`btn btn-info${view === "profile" ? " active" : ""}`}>
                        My Profile
                    </button>
                )}
                {(role === "user" || role === "counsellor") && (
                    <div className="dropdown">
                        <button className="btn btn-primary dropdown-toggle" type="button" id="sadhanaDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                            Sadhana
                        </button>
                        <ul className="dropdown-menu" aria-labelledby="sadhanaDropdown">
                            <li><button className="dropdown-item" onClick={() => setView("entry")}>Enter Everyday</button></li>
                            <li><button className="dropdown-item" onClick={() => setView("download")}>View Sadhana(Everyday)</button></li>
                            <li><button className="dropdown-item" onClick={() => setView("uploadSadhanaCard")}>Upload Sadhana Card</button></li>
                            <li><button className="dropdown-item" onClick={() => setView("ViewUploadedSadhanaCard")}>View Uploaded Sadhana Card</button></li>
                        </ul>
                    </div>
                )}
                {role === "counsellor" && (
                    <button
                        onClick={() => setView("view")}
                        className={`btn btn-primary${view === "view" ? " active" : ""}`}
                    >
                        <i className="bi bi-table"></i> Assigned Devotees
                    </button>
                )}
                {(role === "counsellor") && (
                    <div className="dropdown">
                        <button className="btn btn-primary dropdown-toggle" type="button" id="sadhanaDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                            Devotees Sadhana Reports
                        </button>
                        <ul className="dropdown-menu" aria-labelledby="sadhanaDropdown">
                            <li><button
                                onClick={() => setView("reports")}
                                className={`dropdown-item${view === "reports" ? " active" : ""}`}
                            >View Everyday Entered</button></li>
                            <li><button className="dropdown-item" onClick={() => setView("uploadedReports")}>View Uploaded</button></li>
                        </ul>
                    </div>
                )}
            </div>

            {/* Content Section */}
            {view === "add" && role === "admin" && <DevoteeApp />}
            {view === "profile" && (role === "user" || role === "counsellor") && <MyProfile />}
            {view === "bulk" && role === "admin" && <BulkUploadDevotees />}
            {view === "register" && role === "admin" && <Register />}
            {view === "view" && (role === "admin" || role === "counsellor") &&  <ViewDevoteesTable userId={localStorage.getItem("userId")}/>}
            {view === "entry" && (role === "user"||role === "counsellor") && <SadhanaEntryForm userId={localStorage.getItem("userId")} />}
            {view === "download" && (role === "user"||role === "counsellor") && <SadhanaViewDownload userId={localStorage.getItem("userId")} />}
            {view === "reports" && role === "counsellor" && <CounsellorEveryDaySadhanaReports userId={localStorage.getItem("userId")}/>}
            {view === "uploadSadhanaCard" && (role === "user" || role === "counsellor") && <UploadSadhanaCard email={localStorage.getItem("userId")} />}
            {view === "ViewUploadedSadhanaCard" && (role === "user" || role === "counsellor") && <ViewUploadedSadhanaCard email={localStorage.getItem("userId")} />}
            {view === "uploadedReports" && (role === "counsellor") && <CounsellorUploadedSadhanaReports userId={localStorage.getItem("userId")} />}
            {view === "adminUploadedReports" && (role === "admin") && <AdminUploadedSadhanaReports />}
        </div>
    );
}