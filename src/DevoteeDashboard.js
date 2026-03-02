import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import DevoteeApp from "./DevoteeApp";
import ContactUs from "./ContactUs";
// Upgrade block card for expired premium/trial
function UpgradeBlockCard({ setView }) {
    return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 350 }}>
            <div className="card shadow-lg border-0 rounded-4 p-4" style={{ maxWidth: 420, width: '100%', background: '#fff8f3' }}>
                <div className="text-center mb-3">
                    <span style={{ fontSize: 48, color: '#c82333' }}><i className="bi bi-emoji-frown"></i></span>
                    <h4 className="fw-bold mt-2" style={{ color: '#c82333' }}>Access Restricted</h4>
                </div>
                <div className="mb-3 text-center" style={{ fontSize: 18, color: '#7a4f01' }}>
                    Sorry, your <b>trial pack</b> or <b>premium pack</b> has expired.<br />
                    Please upgrade to continue enjoying all features!
                </div>
                <div className="mb-3 text-center" style={{ fontSize: 16, color: '#444' }}>
                    <b>Upgrade for just ₹10/month</b> — this helps us maintain the website, domain, and devotee database.
                </div>
                <div className="alert alert-success d-flex align-items-center justify-content-between fw-bold mb-3" style={{ fontSize: 16, background: '#e6f4ea', color: '#256029', border: '1px solid #b7e0c7' }}>
                    <span style={{ display: 'flex', alignItems: 'center' }}>
                        <span style={{ fontSize: 18, marginRight: 8 }}>😊</span> Don't worry, you can still continue entering your sadhana!
                    </span>
                    <button
                        className="btn btn-outline-success btn-sm fw-bold ms-3"
                        style={{ borderRadius: '8px', minWidth: 'auto', fontSize: '0.98rem', whiteSpace: 'nowrap' }}
                        onClick={() => setView && setView("entry")}
                    >
                        Sadhana Entry
                    </button>
                </div>
                <div className="text-center mt-3 d-flex flex-column gap-2 align-items-center">
                    <button className="btn btn-danger btn-lg px-5 fw-bold mb-2" onClick={() => setView && setView("upgradePremium")}>Upgrade to Premium</button>
                </div>
            </div>
        </div>
    );
}
import HelpGuide from "./HelpGuide";
import BulkUploadDevotees from "./BulkUploadDevotees";
import ViewDevoteesTable from "./ViewDevoteesTable";
import Register from "./createUser";
import SadhanaEntryForm from "./SadhanaEntryForm"; // new
import SadhanaViewDownload from "./DownloadViewSadhanaCard"; // new
import UploadSadhanaCard from "./UploadSadhanaCard";
import './DevoteeApp.css';
import './MobileDrawer.css';
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
import SadhanaTemplate from "./SadhanaTemplate";
import UpgradePremium from "./UpgradePremium";




const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
};


export default function DevoteeDashboard() {
    const navigate = useNavigate();
    // Default view is helpGuide for all roles
    const [view, setView] = useState("helpGuide");
    const [role, setRole] = useState("user");
    const [displayName, setDisplayName] = useState("");
    const [devoteeId, setDevoteeId] = useState("");
    // State for premium expiry and user type
    const [premiumExpiry, setPremiumExpiry] = useState(null);
    const [userType, setUserType] = useState(null);
    // State for mobile drawer
    const [drawerOpen, setDrawerOpen] = useState(false);
    // Toast for profile picture/temple name
    const [profileToast, setProfileToast] = useState({ show: false, message: '', type: 'warning' });

    const handleDropdownSelect = (nextView, dropdownId) => {
        setView(nextView);
        const toggleButton = document.getElementById(dropdownId);
        const dropdownWrapper = toggleButton?.closest('.dropdown');
        const dropdownMenu = dropdownWrapper?.querySelector('.dropdown-menu');

        dropdownWrapper?.classList.remove('show');
        dropdownMenu?.classList.remove('show');
        toggleButton?.setAttribute('aria-expanded', 'false');
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId");
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setRole(decoded.role || "user");
                setView("helpGuide");
            } catch (error) {
                console.error("Invalid token:", error);
            }
        }
        // Prefer sessionStorage for premium info
        const sessionUserType = sessionStorage.getItem("user_type");
        let sessionPremiumExpiry = sessionStorage.getItem("premium_expiry_date");
        // Treat 'null' or invalid as null
        if (sessionUserType && sessionUserType !== 'null') setUserType(sessionUserType);
        if (sessionPremiumExpiry && sessionPremiumExpiry !== 'null' && sessionPremiumExpiry !== '') {
            setPremiumExpiry(sessionPremiumExpiry);
        } else {
            setPremiumExpiry(null);
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
                        setDevoteeId(res.data[0].id || "");
                        sessionStorage.setItem("email", res.data[0].email || "");
                        localStorage.setItem("phone", res.data[0].mobile_no || "");
                        if(res.data[0].initiated_name!=='') {
                            setDisplayName(res.data[0].initiated_name);
                        } else {
                            setDisplayName(`${res.data[0].first_name} ${res.data[0].last_name}`);
                        }
                        // Show toast if photo or temple_name is empty
                        if (!res.data[0].photo || res.data[0].photo === "") {
                            setProfileToast({ show: true, message: "Please set your profile picture in My Profile / Temple Name.", type: 'warning' });
                        } else if (!res.data[0].temple_name || res.data[0].temple_name === "") {
                            setProfileToast({ show: true, message: "Please set your temple name in My Profile.", type: 'warning' });
                        }
                        setTimeout(() => setProfileToast({ show: false, message: '', type: 'warning' }), 5000);
                    }
                } catch {
                    setDisplayName("");
                    setDevoteeId("");
                }
            };
            fetchDevotee();
            // If sessionStorage is missing, fetch from API and sync
            if (!sessionUserType || !sessionPremiumExpiry) {
                const fetchPremiumInfo = async () => {
                    try {
                        const res = await axios.get(`${process.env.REACT_APP_API_BASE}/api/users/premium-expiry`, {
                            headers: { Authorization: `Bearer ${token}` },
                            params: { userId }
                        });
                        setPremiumExpiry(res.data.premium_expiry_date || null);
                        setUserType(res.data.user_type || null);
                        // Store in sessionStorage
                        if (res.data.user_type) {
                            sessionStorage.setItem("user_type", res.data.user_type);
                        }
                        if (res.data.expiryDate) {
                            sessionStorage.setItem("premium_expiry", res.data.expiryDate);
                        }
                    } catch {
                        setPremiumExpiry(null);
                        setUserType(null);
                        sessionStorage.removeItem("user_type");
                        sessionStorage.removeItem("premium_expiry");
                    }
                };
                fetchPremiumInfo();
            }
        }
    }, []);

    return (
        <div className="container-fluid px-0">
            {/* Responsive Navbar with Side Drawer for Mobile */}
            <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm mb-4 rounded dashboard-navbar position-relative">
                <div className="container-fluid main-navbar-fluid">
                    {/* Desktop: logo/app name and nav links in one row; Mobile: logo/app name left, hamburger right */}
                    <div className="d-none d-lg-flex w-100 flex-row align-items-center justify-content-between mb-0 mb-lg-0" style={{minHeight:'56px'}}>
                        <div className="navbar-logo-name d-flex align-items-center">
                            <img src={process.env.PUBLIC_URL + "/image/logo-nav.png"} alt="ISKCON Logo" width="65" height="65" className="main-navbar-logo me-2" />
                            <span className="fw-bold app-title-text" style={{fontSize:'1.13rem',color:'#0d6efd'}}>Vaidhi Sādhana Bhakti</span>
                        </div>
                        <div className="flex-grow-1 d-flex align-items-center">
                            <div className="collapse navbar-collapse show" id="navbarNavDropdown" style={{flex:1}}>
                                <ul className="navbar-nav me-auto mb-2 mb-lg-0 dashboard-nav-main">
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
                                    <li className="nav-item dropdown">
                                        <button
                                            className={`nav-link dropdown-toggle btn btn-link${
                                                view === "adminUploadedReports" || view === "adminDownloadDevotees" || view === "sadhanaReports"
                                                    ? " active fw-bold text-primary"
                                                    : ""
                                            }`}
                                            id="adminReportDropdown"
                                            data-bs-toggle="dropdown"
                                            aria-expanded="false"
                                        >
                                            Report
                                        </button>
                                        <ul className="dropdown-menu" aria-labelledby="adminReportDropdown">
                                            <li>
                                                <button
                                                    className={`dropdown-item${view === "adminUploadedReports" ? " active" : ""}`}
                                                    onClick={() => handleDropdownSelect("adminUploadedReports", "adminReportDropdown")}
                                                >
                                                    Devotee Reports
                                                </button>
                                            </li>
                                            <li>
                                                <button
                                                    className={`dropdown-item${view === "adminDownloadDevotees" ? " active" : ""}`}
                                                    onClick={() => handleDropdownSelect("adminDownloadDevotees", "adminReportDropdown")}
                                                >
                                                    Download Devotees XLSX
                                                </button>
                                            </li>
                                            <li>
                                                <button
                                                    className={`dropdown-item${view === "sadhanaReports" ? " active" : ""}`}
                                                    onClick={() => handleDropdownSelect("sadhanaReports", "adminReportDropdown")}
                                                >
                                                    Sadhana Reports
                                                </button>
                                            </li>
                                        </ul>
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
                                            <li><button className={`dropdown-item${view === "entry" ? " active" : ""}`} onClick={() => handleDropdownSelect("entry", "sadhanaDropdown")}>New Entry</button></li>
                                            <li><button className={`dropdown-item${view === "download" ? " active" : ""}`} onClick={() => handleDropdownSelect("download", "sadhanaDropdown")}>View Entries</button></li>
                                            <li><button className={`dropdown-item${view === "sadhanaTemplate" ? " active" : ""}`} onClick={() => handleDropdownSelect("sadhanaTemplate", "sadhanaDropdown")}>Sadhana Template</button></li>
                                            <li><button className={`dropdown-item${view === "sadhanaReports" ? " active" : ""}`} onClick={() => handleDropdownSelect("sadhanaReports", "sadhanaDropdown")}>Sadhana Chart Reports</button></li>
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
                                            <li><button className={`dropdown-item${view === "reports" ? " active" : ""}`} onClick={() => handleDropdownSelect("reports", "devoteeReportsDropdown")}>View Everyday Entered</button></li>
                                            <li><button className={`dropdown-item${view === "uploadedReports" ? " active" : ""}`} onClick={() => handleDropdownSelect("uploadedReports", "devoteeReportsDropdown")}>View Uploaded</button></li>
                                        </ul>
                                    </li>
                                        <li className="nav-item">
                                            <button className={`nav-link btn btn-link${view === "sadhanaReports" ? " active fw-bold text-primary" : ""}`} onClick={() => setView("sadhanaReports")}>Sadhana Chart Reports</button>
                                        </li>
                                </>
                            )}
                        </ul>
                            <ul className="navbar-nav ms-auto dashboard-nav-right">
                            {/* <li className="nav-item">
                                <button className={`nav-link btn btn-link${view === "notificationView" ? " active fw-bold text-primary" : ""}`} onClick={() => setView("notificationView")}>View Messages</button>
                            </li> */}
                            <li className="nav-item">
                                <button className={`nav-link btn btn-link${view === "contact" ? " active fw-bold text-primary" : ""}`} onClick={() => setView("contact")}>Contact Us</button>
                            </li>
                            {/* Display name moved above navbar for desktop */}
                            {/* Premium Status Button: Trial, Premium, or Unlock Premium */}
                            
                            {(userType === "trial" && premiumExpiry && !isNaN(new Date(premiumExpiry)) && new Date(premiumExpiry) >= new Date()) && (
                            <li className="nav-item">
                                <button className="nav-link btn fw-bold ms-2" style={{background:'#fff3cd', color:'#efa208', border:'1px solid #efa208', borderRadius:'6px', cursor:'default'}} disabled>Trial</button>
                            </li>
                            )}
                            {(userType === "premium" && premiumExpiry && !isNaN(new Date(premiumExpiry)) && new Date(premiumExpiry) >= new Date()) && (
                                <li className="nav-item">
                                    <button className="nav-link btn fw-bold ms-2" style={{background:'#e6f4ea', color:'#3d5a1a', border:'1px solid #3d5a1a', borderRadius:'6px', cursor:'default'}} disabled>Premium</button>
                                </li>
                            )}
                            {((!premiumExpiry || isNaN(new Date(premiumExpiry)) || new Date(premiumExpiry) < new Date()) || (!userType)) && (
                                <li className="nav-item">
                                    <button className="nav-link btn fw-bold ms-2" style={{background:'#f8d7da', color:'#c82333', border:'1px solid #c82333', borderRadius:'6px'}} onClick={() => setView('upgradePremium')}>Unlock Premium</button>
                                </li>
                            )}
                            <li className="nav-item d-flex align-items-center">
                                <button
                                    className="nav-link btn btn-link"
                                    style={{ fontSize: 22, color: '#8d5524', background: 'none', border: 'none', marginRight: 8 }}
                                    title="How to use the app"
                                    onClick={() => setView('helpGuide')}
                                >
                                    <i className="bi bi-question-circle-fill" style={{ color: '#8d5524' }}></i>
                                </button>
                            </li>
                            <li className="nav-item">
                                <button onClick={handleLogout} className="nav-link text-danger">
                                    <i className="bi bi-box-arrow-right"></i> Logout
                                </button>
                            </li>
                        </ul>
                    </div>
                        </div>
                    </div>
                    {/* Mobile: logo/app name left, hamburger right */}
                    <div className="d-flex d-lg-none w-100 flex-row align-items-center justify-content-between mb-0 mb-lg-0" style={{minHeight:'48px'}}>
                        <div className="navbar-logo-name d-flex align-items-center">
                            <img src={process.env.PUBLIC_URL + "/image/logo-nav.png"} alt="ISKCON Logo" width="108" height="108" className="main-navbar-logo me-2" />
                            <span className="fw-bold app-title-text" style={{fontSize:'1.13rem',color:'#0d6efd'}}>Vaidhi Sādhana Bhakti</span>
                        </div>
                        <div style={{display:'flex',alignItems:'center'}}>
                            <button className="btn btn-outline-secondary" style={{zIndex:1101}} onClick={() => setDrawerOpen(true)}>
                                <span className="navbar-toggler-icon"></span>
                            </button>
                        </div>
                    </div>
                    {/* Side Drawer for Mobile */}
                    <div className={`side-drawer d-lg-none${drawerOpen ? " open" : ""}`} style={{zIndex:1102}}>
                        <div className="drawer-header d-flex justify-content-between align-items-center p-3 border-bottom">
                            <img src={process.env.PUBLIC_URL + "/image/VSB-logo.png"} alt="VSB Logo" width="170" height="108" />
                            <button className="drawer-close-btn" onClick={() => setDrawerOpen(false)} aria-label="Close menu">
                                <i className="bi bi-x-circle-fill"></i>
                            </button>
                        </div>
                        <div className="drawer-body p-0">
                            <nav className="drawer-menu">
                                <ul className="drawer-list">
                                    {/* My Profile and Sadhana section always at top, vertical */}
                                    <li className="drawer-section">
                                        <button className={`drawer-link${view === "profile" ? " active" : ""}`} onClick={() => { setView("profile"); setDrawerOpen(false); }}>
                                            <span className="drawer-icon"><i className="bi bi-person-circle"></i></span> My Profile
                                        </button>
                                    </li>
                                    {/* Unlock Premium for mobile */}
                                    {(userType === "trial" && premiumExpiry && !isNaN(new Date(premiumExpiry)) && new Date(premiumExpiry) >= new Date()) && (
                                        <li className="drawer-section">
                                            <button className="drawer-link fw-bold" style={{background:'#fff3cd', color:'#efa208', border:'1px solid #efa208', borderRadius:'6px', cursor:'default'}} disabled>Trial</button>
                                        </li>
                                    )}
                                    {(userType === "premium" && premiumExpiry && !isNaN(new Date(premiumExpiry)) && new Date(premiumExpiry) >= new Date()) && (
                                        <li className="drawer-section">
                                            <button className="drawer-link fw-bold" style={{background:'#e6f4ea', color:'#3d5a1a', border:'1px solid #3d5a1a', borderRadius:'6px', cursor:'default'}} disabled>Premium</button>
                                        </li>
                                    )}
                                    {((!premiumExpiry || isNaN(new Date(premiumExpiry)) || new Date(premiumExpiry) < new Date()) || (!userType)) && (
                                        <li className="drawer-section">
                                            <button className="drawer-link fw-bold" style={{background:'#f8d7da', color:'#c82333', border:'1px solid #c82333', borderRadius:'6px'}} onClick={() => { setView('upgradePremium'); setDrawerOpen(false); }}>Unlock Premium</button>
                                        </li>
                                    )}
                                    <li className="drawer-section">
                                        <div className="drawer-label"><span className="drawer-icon"><i className="bi bi-flower1"></i></span> Sadhana</div>
                                        <ul className="drawer-sublist">
                                            <li><button className={`drawer-sublink${view === "entry" ? " active" : ""}`} onClick={() => { handleDropdownSelect("entry", "sadhanaDropdown"); setDrawerOpen(false); }}><i className="bi bi-plus-square"></i> New Entry</button></li>
                                            <li><button className={`drawer-sublink${view === "download" ? " active" : ""}`} onClick={() => { handleDropdownSelect("download", "sadhanaDropdown"); setDrawerOpen(false); }}><i className="bi bi-list-check"></i> View Entries</button></li>
                                            <li><button className={`drawer-sublink${view === "sadhanaTemplate" ? " active" : ""}`} onClick={() => { handleDropdownSelect("sadhanaTemplate", "sadhanaDropdown"); setDrawerOpen(false); }}><i className="bi bi-file-earmark-text"></i> Sadhana Template</button></li>
                                            <li><button className={`drawer-sublink${view === "sadhanaReports" ? " active" : ""}`} onClick={() => { handleDropdownSelect("sadhanaReports", "sadhanaDropdown"); setDrawerOpen(false); }}><i className="bi bi-bar-chart"></i> Sadhana Chart Reports</button></li>
                                        </ul>
                                    </li>
                                    {/* Admin/Counsellor extra sections */}
                                    {role === "admin" && (
                                        <>
                                            <li className="drawer-section"><button className={`drawer-link${view === "view" ? " active" : ""}`} onClick={() => { setView("view"); setDrawerOpen(false); }}><i className="bi bi-people"></i> View Devotees</button></li>
                                            <li className="drawer-section"><button className={`drawer-link${view === "add" ? " active" : ""}`} onClick={() => { setView("add"); setDrawerOpen(false); }}><i className="bi bi-person-plus"></i> Add / Update</button></li>
                                            <li className="drawer-section"><button className={`drawer-link${view === "bulk" ? " active" : ""}`} onClick={() => { setView("bulk"); setDrawerOpen(false); }}><i className="bi bi-upload"></i> Bulk Upload</button></li>
                                            <li className="drawer-section"><button className={`drawer-link${view === "register" ? " active" : ""}`} onClick={() => { setView("register"); setDrawerOpen(false); }}><i className="bi bi-person-badge"></i> Assign Role</button></li>
                                            <li className="drawer-section">
                                                <div className="drawer-label"><i className="bi bi-clipboard-data"></i> Report</div>
                                                <ul className="drawer-sublist">
                                                    <li><button className={`drawer-sublink${view === "adminUploadedReports" ? " active" : ""}`} onClick={() => { handleDropdownSelect("adminUploadedReports", "adminReportDropdown"); setDrawerOpen(false); }}><i className="bi bi-file-earmark-bar-graph"></i> Devotee Reports</button></li>
                                                    <li><button className={`drawer-sublink${view === "adminDownloadDevotees" ? " active" : ""}`} onClick={() => { handleDropdownSelect("adminDownloadDevotees", "adminReportDropdown"); setDrawerOpen(false); }}><i className="bi bi-download"></i> Download Devotees XLSX</button></li>
                                                    <li><button className={`drawer-sublink${view === "sadhanaReports" ? " active" : ""}`} onClick={() => { handleDropdownSelect("sadhanaReports", "adminReportDropdown"); setDrawerOpen(false); }}><i className="bi bi-bar-chart"></i> Sadhana Reports</button></li>
                                                </ul>
                                            </li>
                                        </>
                                    )}
                                    {role === "counsellor" && (
                                        <>
                                            <li className="drawer-section"><button className={`drawer-link${view === "view" ? " active" : ""}`} onClick={() => { setView("view"); setDrawerOpen(false); }}><i className="bi bi-people"></i> Assigned Devotees</button></li>
                                            <li className="drawer-section">
                                                <div className="drawer-label"><i className="bi bi-clipboard-data"></i> Devotees Sadhana Reports</div>
                                                <ul className="drawer-sublist">
                                                    <li><button className={`drawer-sublink${view === "reports" ? " active" : ""}`} onClick={() => { handleDropdownSelect("reports", "devoteeReportsDropdown"); setDrawerOpen(false); }}><i className="bi bi-calendar-check"></i> View Everyday Entered</button></li>
                                                    <li><button className={`drawer-sublink${view === "uploadedReports" ? " active" : ""}`} onClick={() => { handleDropdownSelect("uploadedReports", "devoteeReportsDropdown"); setDrawerOpen(false); }}><i className="bi bi-upload"></i> View Uploaded</button></li>
                                                </ul>
                                            </li>
                                            <li className="drawer-section"><button className={`drawer-link${view === "sadhanaReports" ? " active" : ""}`} onClick={() => { setView("sadhanaReports"); setDrawerOpen(false); }}><i className="bi bi-bar-chart"></i> Sadhana Chart Reports</button></li>
                                        </>
                                    )}
                                    {/* General actions */}
                                    <li className="drawer-section mt-3"><button className={`drawer-link${view === "notificationView" ? " active" : ""}`} onClick={() => { setView("notificationView"); setDrawerOpen(false); }}><i className="bi bi-envelope"></i> View Messages</button></li>
                                    <li className="drawer-section"><button className={`drawer-link${view === "contact" ? " active" : ""}`} onClick={() => { setView("contact"); setDrawerOpen(false); }}><i className="bi bi-chat-dots"></i> Contact Us</button></li>
                                    <li className="drawer-section"><span className="drawer-link fw-bold text-primary"><i className="bi bi-person-badge"></i> {displayName}</span></li>
                                    <li className="drawer-section"><button onClick={() => { handleLogout(); setDrawerOpen(false); }} className="drawer-link text-danger"><i className="bi bi-box-arrow-right"></i> Logout</button></li>
                                </ul>
                            </nav>
                        </div>
                    </div>
                    {/* Overlay for drawer */}
                    {drawerOpen && <div className="drawer-overlay d-lg-none" style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'rgba(0,0,0,0.3)',zIndex:1100}} onClick={() => setDrawerOpen(false)}></div>}
                </div>
            </nav>
            {/* Display name above navbar, right-aligned (desktop) and top-right (mobile) */}
            <div className="w-100 d-none d-lg-flex justify-content-end align-items-center" style={{minHeight:'32px', paddingRight: '32px'}}>
                <span className="fw-bold app-title-text" style={{fontSize:'1.1rem', color:'#3d5a1a', background:'#e6f4ea', borderRadius:'6px', padding:'2px 16px', marginTop:'8px'}}>{displayName}</span>
            </div>
            {/* Mobile display name */}
            <div className="d-flex d-lg-none justify-content-end align-items-center w-100" style={{paddingRight: '16px', marginTop: '8px', marginBottom: '-8px'}}>
                <span className="fw-bold app-title-text" style={{fontSize:'1.05rem', color:'#3d5a1a', background:'#e6f4ea', borderRadius:'6px', padding:'2px 12px'}}>{displayName}</span>
            </div>
            {/* Render UpgradePremium modal if selected */}
            {view === 'upgradePremium' && (
                <UpgradePremium
                    name={displayName}
                    email={localStorage.getItem("userId")}
                    phone={localStorage.getItem("phone")} 
                    onClose={() => setView('notificationView')}
                />
            )}
            {/* Content Section */}
            {view === "add" && role === "admin" && <DevoteeApp />}
            {view === "profile" && (role === "user" || role === "counsellor") && <MyProfile />}
            {view === "bulk" && role === "admin" && <BulkUploadDevotees />}
            {view === "register" && role === "admin" && <Register />}
            {view === "view" && (role === "admin" || role === "counsellor") &&  <ViewDevoteesTable userId={localStorage.getItem("userId")}/>}
            {view === "entry" && (role === "user"||role === "counsellor") && <SadhanaEntryForm userId={localStorage.getItem("userId")} />}
                        {view === "download" && (role === "user"||role === "counsellor") && (
                            (!premiumExpiry || isNaN(new Date(premiumExpiry)) || new Date(premiumExpiry) < new Date())
                                ? <UpgradeBlockCard setView={setView} />
                                : <SadhanaViewDownload userRole={role} devoteeId={devoteeId} email={localStorage.getItem("userId")} />
                        )}
            {view === "sadhanaTemplate" && (role === "user"||role === "counsellor") && <SadhanaTemplate devoteeId={devoteeId} email={localStorage.getItem("userId")} />}
                        {view === "sadhanaReports" && (role === "admin" || role === "counsellor" || role === "user") && (
                            (role === "user" || role === "counsellor") && (!premiumExpiry || isNaN(new Date(premiumExpiry)) || new Date(premiumExpiry) < new Date())
                                ? <UpgradeBlockCard setView={setView} />
                                : <SadhanaReports devoteeId={devoteeId} userRole={role} />
                        )}
            {view === "reports" && role === "counsellor" && <CounsellorEveryDaySadhanaReports userId={localStorage.getItem("userId")}/>}
            {view === "uploadSadhanaCard" && (role === "user" || role === "counsellor") && <UploadSadhanaCard email={localStorage.getItem("userId")} />}
            {view === "ViewUploadedSadhanaCard" && (role === "user" || role === "counsellor") && <ViewUploadedSadhanaCard email={localStorage.getItem("userId")} />}
            {view === "uploadedReports" && (role === "counsellor") && <CounsellorUploadedSadhanaReports userId={localStorage.getItem("userId")} />}
            {view === "adminUploadedReports" && (role === "admin") && <AdminUploadedSadhanaReports />}
            {view === "adminDownloadDevotees" && (role === "admin") && <AdminDownloadDevotees />}
            {/* {view === "notificationView" && <NotificationView email={localStorage.getItem("userId")} userRole={role}/>} */}
            {view === "notificationSend" && (
                <NotificationSend
                    senderName={displayName || devoteeId || localStorage.getItem("userId") || "Admin"}
                    userRole={role}
                    devoteeId={devoteeId}
                    email={localStorage.getItem("userId")}
                />
            )}
            {view === "helpGuide" && <HelpGuide setView={setView} />}
            {view === "contact" && <ContactUs />}
            {/* Quick Access Links */}
            <div className="dashboard-quick-links d-flex justify-content-center align-items-center gap-3 mt-2 mb-1">
                <button
                    className="btn btn-primary fw-bold px-4 py-2 dashboard-quick-link-btn"
                    style={{ borderRadius: '10px', fontSize: '1.08rem', background: '#7a9c5c', border: 'none', boxShadow: '0 2px 8px rgba(160,90,44,0.10)' }}
                    onClick={() => setView('entry')}
                >
                    <i className="bi bi-pencil-square me-2"></i> Sadhana Entry
                </button>
                <button
                    className="btn btn-info fw-bold px-4 py-2 dashboard-quick-link-btn"
                    style={{ borderRadius: '10px', fontSize: '1.08rem', background: '#3d5a1a', color: '#fff', border: 'none', boxShadow: '0 2px 8px rgba(160,90,44,0.10)' }}
                    onClick={() => setView('download')}
                >
                    <i className="bi bi-list-check me-2"></i> View Entries
                </button>
                <button
                    className="btn btn-warning fw-bold px-4 py-2 dashboard-quick-link-btn"
                    style={{ borderRadius: '10px', fontSize: '1.08rem', background: '#a05a2c', color: '#fff', border: 'none', boxShadow: '0 2px 8px rgba(160,90,44,0.10)' }}
                    onClick={() => setView('sadhanaReports')}
                >
                    <i className="bi bi-bar-chart-fill me-2"></i> Sadhana Chart Report
                </button>
            </div>
        {profileToast.show && (
            <div
                className={`help-toast ${profileToast.type}`}
                style={{
                    position: 'fixed',
                    top: '76px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: profileToast.type === 'warning' ? '#ffeaea' : undefined,
                    color: profileToast.type === 'warning' ? '#a94442' : undefined,
                    fontWeight: 700,
                    fontSize: '1.05rem',
                    borderRadius: '10px',
                    boxShadow: '0 2px 8px rgba(160,90,44,0.10)',
                    padding: '10px 18px',
                    minWidth: '180px',
                    maxHeight: '80px',
                    zIndex: 3002,
                    border: '1.2px solid #f5c2c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <span style={{marginRight: 8, fontSize: '1.15em'}}>⚠️</span>
                {profileToast.message}
            </div>
        )}
        </div>
        
    );
}