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
        <div className="container-fluid px-0">
            {/* Krishna Invocation */}
            <div className="text-center p-3 mb-4 bg-info text-white rounded shadow">
                <h2>🙏 Śrī Guru Gaurāṅga Jayate 🙏</h2>
                <h4>Welcome to the Devotee Dashboard</h4>
            </div>

            {/* Responsive Navbar */}
            <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm mb-4 rounded">
                <div className="container-fluid">
                    {/* Logo or Brand */}
                    <a className="navbar-brand fw-bold d-flex align-items-center" href="#">
                        <img src={process.env.PUBLIC_URL + "/image/logo.png"} alt="ISKCON Logo" width="40" height="40" className="rounded-circle me-2 border border-primary" style={{objectFit: 'cover'}} />
                        <span className="d-none d-sm-inline"></span>
                    </a>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavDropdown" aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarNavDropdown">
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                            {role === "admin" && (
                                <>
                                    <li className="nav-item">
                                        <button className={`nav-link btn btn-link${view === "view" ? " active fw-bold text-primary" : ""}`} onClick={() => setView("view")}>View Devotees</button>
                                    </li>
                                    <li className="nav-item">
                                        <button className={`nav-link btn btn-link${view === "add" ? " active fw-bold text-primary" : ""}`} onClick={() => setView("add")}>Add / Update</button>
                                    </li>
                                    <li className="nav-item">
                                        <button className={`nav-link btn btn-link${view === "bulk" ? " active fw-bold text-primary" : ""}`} onClick={() => setView("bulk")}>Bulk Upload</button>
                                    </li>
                                    <li className="nav-item">
                                        <button className={`nav-link btn btn-link${view === "register" ? " active fw-bold text-primary" : ""}`} onClick={() => setView("register")}>Assign Role</button>
                                    </li>
                                    <li className="nav-item">
                                        <button className={`nav-link btn btn-link${view === "adminUploadedReports" ? " active fw-bold text-primary" : ""}`} onClick={() => setView("adminUploadedReports")}>Reports</button>
                                    </li>
                                </>
                            )}
                            {(role === "user" || role === "counsellor") && (
                                <>
                                    <li className="nav-item">
                                        <button className={`nav-link btn btn-link${view === "profile" ? " active fw-bold text-primary" : ""}`} onClick={() => setView("profile")}>My Profile</button>
                                    </li>
                                    <li className="nav-item dropdown">
                                        <button className="nav-link dropdown-toggle btn btn-link" id="sadhanaDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                                            Sadhana
                                        </button>
                                        <ul className="dropdown-menu" aria-labelledby="sadhanaDropdown">
                                            <li><button className={`dropdown-item${view === "entry" ? " active" : ""}`} onClick={() => setView("entry")}>Enter Everyday</button></li>
                                            <li><button className={`dropdown-item${view === "download" ? " active" : ""}`} onClick={() => setView("download")}>View Sadhana(Everyday)</button></li>
                                            <li><button className={`dropdown-item${view === "uploadSadhanaCard" ? " active" : ""}`} onClick={() => setView("uploadSadhanaCard")}>Upload Sadhana Card</button></li>
                                            <li><button className={`dropdown-item${view === "ViewUploadedSadhanaCard" ? " active" : ""}`} onClick={() => setView("ViewUploadedSadhanaCard")}>View Uploaded Sadhana Card</button></li>
                                        </ul>
                                    </li>
                                </>
                            )}
                            {role === "counsellor" && (
                                <>
                                    <li className="nav-item">
                                        <button className={`nav-link btn btn-link${view === "view" ? " active fw-bold text-primary" : ""}`} onClick={() => setView("view")}>Assigned Devotees</button>
                                    </li>
                                    <li className="nav-item dropdown">
                                        <button className="nav-link dropdown-toggle btn btn-link" id="devoteeReportsDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                                            Devotees Sadhana Reports
                                        </button>
                                        <ul className="dropdown-menu" aria-labelledby="devoteeReportsDropdown">
                                            <li><button className={`dropdown-item${view === "reports" ? " active" : ""}`} onClick={() => setView("reports")}>View Everyday Entered</button></li>
                                            <li><button className={`dropdown-item${view === "uploadedReports" ? " active" : ""}`} onClick={() => setView("uploadedReports")}>View Uploaded</button></li>
                                        </ul>
                                    </li>
                                </>
                            )}
                        </ul>
                        <div className="d-flex align-items-center">
                            <span className="me-3 fw-bold text-primary">{displayName}</span>
                            <button onClick={handleLogout} className="btn btn-danger">
                                <i className="bi bi-box-arrow-right"></i> Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

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