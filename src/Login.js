// src/Login.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Login.css"; // Custom styles

export default function Login() {

    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [showHelp, setShowHelp] = useState(false);
    const [showHelpToast, setShowHelpToast] = useState(false);

    // Show help toast only once on initial load/refresh
    useEffect(() => {
        setShowHelpToast(true);
        const timer = setTimeout(() => setShowHelpToast(false), 3500);
        return () => clearTimeout(timer);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); // Start loading
        try {
            const res = await axios.post(`${process.env.REACT_APP_API_BASE}/api/login`, {
                email,
                password,
            });
            localStorage.setItem("token", res.data.token);
            setToast({ show: true, message: "<b>Login successful!</b>", type: "success" });
            localStorage.setItem("userId", email);
            setTimeout(() => {
                setToast({ show: false, message: '', type: 'success' });
                navigate("/dashboard");
            }, 1200);
        } catch (err) {
            setToast({ show: true, message: "<b>Login failed:</b> " + (err.response?.data?.message || err.message), type: "error" });
        } finally {
            setLoading(false); // Stop loading
            setTimeout(() => setToast(t => ({ ...t, show: false })), 3000);
        }
    };
    return (
        <>
            <div className="login-page">
                {/* Toast Message */}
                <div
                    className={`custom-toast${toast.show ? ' show' : ''} ${toast.type}`}
                    role="alert"
                    style={{
                        pointerEvents: toast.show ? 'auto' : 'none',
                        position: 'fixed',
                        top: 40,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 9999,
                        minWidth: 320,
                        background: toast.type === 'success' ? 'linear-gradient(90deg,#4caf50 0,#43e97b 100%)' : 'linear-gradient(90deg,#e53935 0,#e35d5b 100%)',
                        color: '#fff',
                        fontWeight: 500,
                        fontSize: 18,
                        boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
                        borderRadius: 12,
                        padding: '18px 32px',
                        display: toast.show ? 'flex' : 'none',
                        alignItems: 'center',
                        gap: 16
                    }}
                    dangerouslySetInnerHTML={{ __html: toast.message }}
                />
                {/* Logo at top left */}
                <div className="login-logo-container">
                    <img src={process.env.PUBLIC_URL + '/image/VSB-logo.png'} alt="Vaidhisadhanabhakti Logo with Text" className="login-logo" />
                </div>
                {/* Help Button */}
                <button className="help-btn" onClick={() => setShowHelp(true)}>
                    <span role="img" aria-label="help">❓</span> Help
                </button>

                {/* Help Toast */}
                {showHelpToast && (
                    <div className="help-toast">If you are a new user? Please checkout the information.</div>
                )}

                {/* Help Modal */}
                {showHelp && (
                    <div className="help-modal-overlay" onClick={() => setShowHelp(false)}>
                        <div className="help-modal" onClick={e => e.stopPropagation()}>
                            <button className="help-modal-close" onClick={() => setShowHelp(false)}>&times;</button>
                            <h3>How to Use Vaidhī Sādhana Bhakti App</h3>
                            <ul className="help-list">
                                <li><b>Sign Up:</b> Create your account to get started. Enjoy a <b>1-month free trial</b>!</li>
                                <li><b>Login:</b> Enter your credentials to access your dashboard.</li>
                                <li><b>Set Your Template:</b> Personalize your sadhana tracking template as per your daily practices.</li>
                                <li><b>Fill Sadhana Card:</b> Start recording your daily sādhana activities easily.</li>
                                <li><b>Download Reports:</b> Instantly download your sadhana data as <b>PDF</b> or <b>XLS</b> for your records.</li>
                                <li><b>Performance Chart:</b> Visualize your progress with insightful charts and analytics.</li>
                                <li><b>Contact Us:</b> Reach out with your queries or feedback via the app, or email <a href="mailto:abhi.sinu.1@gmail.com">abhi.sinu.1@gmail.com</a> or call Whatsapp <a href="tel:7032241089">7032241089</a>.</li>
                                <li><b>Upgrade to Premium:</b> After your trial, continue for just <b>₹10/month</b>—this helps us maintain the website, domain, and devotee database.</li>
                            </ul>
                            <div className="help-note">Join us and make your sādhana journey organized, inspiring, and rewarding!</div>
                        </div>
                    </div>
                )}
                <div className="d-flex flex-column justify-content-center align-items-center login-form-bg">
                    <div className="login-info-card mb-3">
                        <span className="info-help-link">New here? <b>Check <span className="help-link" onClick={() => setShowHelp(true)}>Help</span></b> before signing up.<br/>Create your account to get started. <span className="info-trial">Enjoy a 1-month free trial!</span></span>
                    </div>
                    <div className="login-form-container p-4 shadow-lg rounded w-100">
                        <h2 className="text-center mb-4" style={{ color: '#a05a2c' }}>Hare Kṛṣṇa, Devotee</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group mb-3">
                                <input
                                    type="email"
                                    className="form-control"
                                    placeholder="Enter email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group mb-4">
                                <input
                                    type="password"
                                    className="form-control"
                                    placeholder="Enter password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="btn w-100"
                                style={{ background: '#a05a2c', color: '#fff', fontWeight: 600 }}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span
                                            className="spinner-border spinner-border-sm me-2"
                                            role="status"
                                            aria-hidden="true"
                                        ></span>
                                        Logging in...
                                    </>
                                ) : (
                                    "Login"
                                )}
                            </button>
                        </form>
                        <div className="text-center mt-3">
                            <span className="signup-link-text">Don't have an account? <a href="/signup" className="signup-link">Sign up</a></span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
