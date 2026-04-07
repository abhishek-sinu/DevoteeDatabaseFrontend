// src/Login.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Login.css"; // Custom styles

// Simple modal for forgot password
function ForgotPasswordModal({ show, onClose, onSubmit, email, setEmail, loading, message }) {
    if (!show) return null;
    return (
        <div className="help-modal-overlay" onClick={onClose}>
            <div className="help-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
                <button className="help-modal-close" onClick={onClose}>&times;</button>
                <h4>Forgot Password?</h4>
                <p>Enter your registered email to receive a password reset link.</p>
                <form onSubmit={onSubmit}>
                    <input
                        type="email"
                        className="form-control mb-3"
                        placeholder="Enter your email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                    />
                    <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>
                {message && <div className="mt-3" style={{ color: message.type === 'success' ? 'green' : 'red' }}>{message.text}</div>}
            </div>
        </div>
    );
}

export default function Login() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        const handler = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };
        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleDownloadApp = () => {
        // Check if running inside Capacitor native app
        if (window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()) {
            return; // Don't show download inside the app itself
        }
        // Direct download from server (no intermediate page)
        const apkUrl = 'https://vaidhisadhanabhakti.cloud/download/VSB.apk';
        window.location.href = apkUrl;
    };

    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState(() => {
        const saved = localStorage.getItem("rememberMe") === "true" ? localStorage.getItem("rememberEmail") : "";
        return saved || "";
    });
    const [password, setPassword] = useState(() => {
        const saved = localStorage.getItem("rememberMe") === "true" ? localStorage.getItem("rememberPassword") : "";
        return saved || "";
    });
    const [rememberMe, setRememberMe] = useState(() => {
        const saved = localStorage.getItem("rememberMe");
        return saved === null ? true : saved === "true";
    });
    const navigate = useNavigate();
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [showHelp, setShowHelp] = useState(false);
    const [showHelpToast, setShowHelpToast] = useState(false);

    // Forgot password modal state
    const [showForgot, setShowForgot] = useState(false);
    const [forgotEmail, setForgotEmail] = useState("");
    const [forgotLoading, setForgotLoading] = useState(false);
    const [forgotMsg, setForgotMsg] = useState(null);

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
            if (rememberMe) {
                localStorage.setItem("token", res.data.token);
                localStorage.setItem("userId", email);
                localStorage.setItem("rememberMe", "true");
                localStorage.setItem("rememberEmail", email);
                localStorage.setItem("rememberPassword", password);
            } else {
                sessionStorage.setItem("token", res.data.token);
                sessionStorage.setItem("userId", email);
                localStorage.setItem("rememberMe", "false");
                localStorage.removeItem("rememberEmail");
                localStorage.removeItem("rememberPassword");
            }
            setToast({ show: true, message: "<b>Login successful!</b>", type: "success" });
            setTimeout(() => {
                setToast({ show: false, message: '', type: 'success' });
                navigate("/dashboard", { replace: true });
            }, 1200);
        } catch (err) {
            setToast({ show: true, message: "<b>Login failed:</b> " + (err.response?.data?.message || err.message), type: "error" });
        } finally {
            setLoading(false); // Stop loading
            setTimeout(() => setToast(t => ({ ...t, show: false })), 3000);
        }
    };

    // Forgot password submit handler
    const handleForgotSubmit = async (e) => {
        e.preventDefault();
        setForgotLoading(true);
        setForgotMsg(null);
        try {
            await axios.post(`${process.env.REACT_APP_API_BASE}/api/forgot-password`, { email: forgotEmail });
            setForgotMsg({ type: 'success', text: 'Reset link sent! Please check your email.' });
        } catch (err) {
            setForgotMsg({ type: 'error', text: err.response?.data?.message || 'Failed to send reset link.' });
        } finally {
            setForgotLoading(false);
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
                   <div className="login-logo-container" style={{ position: 'relative' }}>
                    <img src={process.env.PUBLIC_URL + '/image/VSB-logo.png'} alt="Vaidhisadhanabhakti Logo with Text" className="login-logo" />
                       <button
                           className="btn btn-success"
                           style={{ position: 'fixed', top: 16, right: 32, fontWeight: 600, borderRadius: 8, fontSize: '1rem', background: '#a05a2c', color: '#fff', padding: '10px 22px', zIndex: 1050, boxShadow: '0 2px 8px rgba(160,90,44,0.10)' }}
                           onClick={handleDownloadApp}
                       >
                           <i className="bi bi-download"></i> Download App
                       </button>
                   </div>
                {/* Help Button */}
                <button className="help-btn" onClick={() => setShowHelp(true)}>
                    <span role="img" aria-label="help">❓</span> Help
                </button>

                {/* Help Toast */}
                {showHelpToast && (
                    <div className="help-toast">How to Use?</div>
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
                                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        className="form-control"
                                        placeholder="Enter password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        style={{ paddingRight: 42 }}
                                    />
                                    <span
                                        onClick={() => setShowPassword((v) => !v)}
                                        style={{
                                            position: 'absolute',
                                            right: 10,
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            cursor: 'pointer',
                                            color: '#a05a2c',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            zIndex: 2,
                                            userSelect: 'none',
                                        }}
                                        title={showPassword ? 'Hide Password' : 'Show Password'}
                                    >
                                        {showPassword ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a05a2c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.06 10.06 0 0 1 12 20c-5.05 0-9.29-3.14-11-8 1.06-2.81 2.99-5.12 5.47-6.53"/><path d="M1 1l22 22"/><path d="M9.53 9.53A3.5 3.5 0 0 0 12 15.5c1.93 0 3.5-1.57 3.5-3.5 0-.47-.09-.92-.26-1.33"/><path d="M14.47 14.47A3.5 3.5 0 0 1 12 8.5c-1.93 0-3.5 1.57-3.5 3.5 0 .47.09.92.26 1.33"/></svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a05a2c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12C2.71 7.14 6.95 4 12 4s9.29 3.14 11 8c-1.71 4.86-5.95 8-11 8s-9.29-3.14-11-8z"/><circle cx="12" cy="12" r="3.5"/></svg>
                                        )}
                                    </span>
                                </div>
                                <div style={{ textAlign: 'right', marginTop: 4 }}>
                                    <button
                                        type="button"
                                        className="btn btn-link"
                                        style={{
                                            fontSize: '1rem',
                                            color: '#a05a2c',
                                            textDecoration: 'underline',
                                            fontWeight: 600,
                                            background: 'none',
                                            border: 'none',
                                            padding: 0,
                                            cursor: 'pointer',
                                            boxShadow: 'none',
                                            outline: 'none',
                                        }}
                                        onClick={() => {
                                            setShowForgot(true);
                                            setForgotEmail("");
                                            setForgotMsg(null);
                                        }}
                                    >
                                        Forgot Password?
                                    </button>
                                </div>
                            </div>
                            <div className="form-group mb-3" style={{ width: '100%', textAlign: 'left', marginLeft: 0 }}>
                                <input
                                    type="checkbox"
                                    id="rememberMe"
                                    checked={rememberMe}
                                    onChange={() => {
                                        setRememberMe(!rememberMe);
                                        localStorage.setItem("rememberMe", (!rememberMe).toString());
                                        if (!rememberMe) {
                                            localStorage.setItem("rememberEmail", email);
                                            localStorage.setItem("rememberPassword", password);
                                        } else {
                                            localStorage.removeItem("rememberEmail");
                                            localStorage.removeItem("rememberPassword");
                                        }
                                    }}
                                    style={{ marginRight: 8, width: 20, height: 20 }}
                                />
                                <label htmlFor="rememberMe" style={{ marginBottom: 0, fontWeight: 600, color: '#a05a2c', fontSize: '1rem' }}>Remember Me</label>
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
        {/* Forgot Password Modal */}
        <ForgotPasswordModal
            show={showForgot}
            onClose={() => setShowForgot(false)}
            onSubmit={handleForgotSubmit}
            email={forgotEmail}
            setEmail={setForgotEmail}
            loading={forgotLoading}
            message={forgotMsg}
        />
        </>
    );
}
