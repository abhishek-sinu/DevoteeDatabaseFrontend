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
import AdminDownloadDevotees from "./AdminDownloadDevotees";
import NotificationView from "./NotificationView";
import NotificationSend from "./NotificationSend";
import SadhanaReports from "./SadhanaReports";




const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
};

export default function DevoteeDashboard() {
    const [view, setView] = useState("view");
    const [role, setRole] = useState("user");
    const [displayName, setDisplayName] = useState("");
    const [devoteeId, setDevoteeId] = useState("");

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
                    if (res.data[0]) {
                        console.log("Fetched devoteeId:", res.data[0].id);
                        setDevoteeId(res.data[0].id || "");
                            console.log("Fetched devoteeId:", res.data[0].devotee_id);
                        if(res.data[0].initiated_name!=="") {
                            setDisplayName(res.data[0].initiated_name);
                        }else {
                            setDisplayName(`${res.data[0].first_name} ${res.data[0].last_name}`);
                        }
                    }
                } catch {
                    setDisplayName("");
                    setDevoteeId("");
                }
            };
            fetchDevotee();
        }
    }, []);

    return (
        <div className="container-fluid px-0">
            {/* Krishna Invocation */}
            <div
                className="invocation-header p-3 mb-4 text-white rounded shadow"
                style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/image/header-bg.jpg)` }}
            >
                <div className="invocation-content container-fluid d-flex align-items-center">
                    <div style={{ width: 90 }} className="d-flex justify-content-start align-items-center">
                        <img src={process.env.PUBLIC_URL + "/image/iskconlogo.jpg"} alt="ISKCON Logo" width="72" height="72" className="header-logo border border-primary" style={{ objectFit: 'cover' }} />
                    </div>
                    <div className="flex-grow-1 text-center">
                        <h2 className="mb-1">Śrī Guru Śrī Gaurāṅga Jayataha</h2>
                        <h4 className="mb-0">Welcome to the Devotee Dashboard</h4>
                    </div>
                    <div style={{ width: 90 }} className="d-flex justify-content-end align-items-center">
                        <img src={process.env.PUBLIC_URL + "/image/logo.png"} alt="ISKCON Logo" width="72" height="72" className="header-logo border border-primary" style={{ objectFit: 'cover' }} />
                    </div>
                </div>
            </div>
           {/* Responsive Navbar */}
            <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm mb-4 rounded">
                <div className="container-fluid">
                    {/* Logo or Brand */}
                    <a className="navbar-brand fw-bold d-flex align-items-center" href="#">
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
                                    <li className="nav-item">
                                        <button className={`nav-link btn btn-link${view === "adminDownloadDevotees" ? " active fw-bold text-primary" : ""}`} onClick={() => setView("adminDownloadDevotees")}>Download Devotees XLSX</button>
                                    </li>
                                        <li className="nav-item">
                                            <button className={`nav-link btn btn-link${view === "sadhanaReports" ? " active fw-bold text-primary" : ""}`} onClick={() => setView("sadhanaReports")}>Sadhana Reports</button>
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
                                            <li><button className={`dropdown-item${view === "sadhanaReports" ? " active" : ""}`} onClick={() => setView("sadhanaReports")}>Sadhana Chart Reports</button></li>
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
                                        <li className="nav-item">
                                            <button className={`nav-link btn btn-link${view === "sadhanaReports" ? " active fw-bold text-primary" : ""}`} onClick={() => setView("sadhanaReports")}>Sadhana Chart Reports</button>
                                        </li>
                                </>
                            )}
                        </ul>
                        <ul className="navbar-nav ms-auto">
                            <li className="nav-item dropdown">
                                <button className="nav-link dropdown-toggle btn btn-link" id="notificationDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                                    <img src={`${process.env.PUBLIC_URL}/image/bell-colorful.png`} alt="" width="24" height="24" />
                                </button>
                                <ul className="dropdown-menu" aria-labelledby="notificationDropdown">
                                    <li>
                                        <button className={`dropdown-item${view === "notificationView" ? " active" : ""}`} onClick={() => setView("notificationView")}>
                                            View
                                        </button>
                                    </li>
                                    <li>
                                        <button className={`dropdown-item${view === "notificationSend" ? " active" : ""}`} onClick={() => setView("notificationSend")}>
                                            Send
                                        </button>
                                    </li>
                                </ul>
                            </li>
                            <li className="nav-item">
                                <span className="nav-link fw-bold text-primary">{displayName}</span>
                            </li>
                            <li className="nav-item">
                                <button onClick={handleLogout} className="nav-link text-danger">
                                    <i className="bi bi-box-arrow-right"></i> Logout
                                </button>
                            </li>
                        </ul>
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
            {view === "download" && (role === "user"||role === "counsellor") && <SadhanaViewDownload devoteeId={devoteeId} />}
            {view === "sadhanaReports" && (role === "admin" || role === "counsellor" || role === "user") && <SadhanaReports devoteeId={devoteeId} userRole={role} />}
            {view === "reports" && role === "counsellor" && <CounsellorEveryDaySadhanaReports userId={localStorage.getItem("userId")}/>}
            {view === "uploadSadhanaCard" && (role === "user" || role === "counsellor") && <UploadSadhanaCard email={localStorage.getItem("userId")} />}
            {view === "ViewUploadedSadhanaCard" && (role === "user" || role === "counsellor") && <ViewUploadedSadhanaCard email={localStorage.getItem("userId")} />}
            {view === "uploadedReports" && (role === "counsellor") && <CounsellorUploadedSadhanaReports userId={localStorage.getItem("userId")} />}
            {view === "adminUploadedReports" && (role === "admin") && <AdminUploadedSadhanaReports />}
            {view === "adminDownloadDevotees" && (role === "admin") && <AdminDownloadDevotees />}
            {view === "notificationView" && <NotificationView email={localStorage.getItem("userId")} />}
            {view === "notificationSend" && <NotificationSend senderName={displayName} userRole={role} devoteeId={devoteeId} email={localStorage.getItem("userId")}/>}
        </div>
    );
}