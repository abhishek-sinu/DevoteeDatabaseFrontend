// src/Login.js
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Login.css"; // Custom styles
import quotes from "./quotes";

export default function Login() {

    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    // Pick a random quote on each render
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

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
                {/* Left: Image Half with Quote Card */}
                {/* Desktop: Quote on left, Mobile: Quote above login */}
                <div className="login-bg-half d-none d-md-flex flex-column justify-content-center align-items-center position-relative" style={{ minHeight: '100vh' }}>
                    <div className="quote-card shadow-lg px-5 py-3 d-flex flex-column justify-content-center align-items-center"
                        style={{
                            background: 'rgba(255,255,255,0.88)',
                            borderRadius: 18,
                            maxWidth: 700,
                            minWidth: 420,
                            minHeight: 90,
                            margin: '32px',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
                            position: 'absolute',
                            top: -30,
                            right: -400,
                            left: 'auto',
                            transform: 'none',
                            textAlign: 'left',
                            fontFamily: 'serif',
                            zIndex: 10,
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        <div style={{ fontSize: 22, fontWeight: 500, color: '#2d3a4a', marginBottom: 10, fontStyle: 'italic', lineHeight: 1.4, maxWidth: 600 }}>
                            {`"${randomQuote.text}"`}
                        </div>
                        <div style={{ fontSize: 16, color: '#4b5e6b', fontWeight: 500, marginTop: 4, textAlign: 'right', width: '100%' }}>
                            — {randomQuote.author}
                        </div>
                    </div>
                </div>
                {/* Mobile: Show quote above login form */}
                <div className="d-flex d-md-none flex-column align-items-end w-100" style={{padding: '16px 0 0 0'}}>
                    <div className="quote-card shadow-lg px-4 py-3 w-100" style={{
                        background: 'rgba(255,255,255,0.95)',
                        borderRadius: 14,
                        margin: '0 12px 18px 12px',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.13)',
                        textAlign: 'left',
                        fontFamily: 'serif',
                        zIndex: 10,
                        maxWidth: '100%',
                    }}>
                        <div style={{ fontSize: 17, fontWeight: 500, color: '#2d3a4a', marginBottom: 7, fontStyle: 'italic', lineHeight: 1.4 }}>
                            {`"${randomQuote.text}"`}
                        </div>
                        <div style={{ fontSize: 14, color: '#4b5e6b', fontWeight: 500, marginTop: 2, textAlign: 'right', width: '100%' }}>
                            — {randomQuote.author}
                        </div>
                    </div>
                </div>
                {/* Right: Login Form with background image */}
                <div 
                    className="d-flex flex-column justify-content-center align-items-center" 
                    style={{ 
                        flex: 1, 
                        background: `url('${process.env.PUBLIC_URL}/image/header-bg.jpg') center center/cover no-repeat, rgba(0,0,0,0.55)`,
                        position: 'relative' 
                    }}
                >
                    <div className="login-form-container p-4 shadow-lg rounded w-100" style={{ maxWidth: 400, background: 'rgba(0,0,0,0.6)' }}>
                        <h2 className="text-center mb-4 text-light">Hare Kṛṣṇa, Devotee</h2>
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
                                className="btn btn-primary w-100"
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
                    </div>
                </div>
            </div>
        </>
    );
}
