import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Login.css";

export default function Signup() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);

    useEffect(() => {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
        });
    }, []);
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [name, setName] = useState("");
    const [initiatedName, setInitiatedName] = useState("");
    const [mobile, setMobile] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    // Step 1: Send OTP
    const handleSendOtp = async () => {
        console.log('Email value before send OTP:', email);
        if (!email) {
            setToast({ show: true, message: "Please enter your email.", type: "error" });
            setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3500);
            return;
        }
        setLoading(true);
        try {
            // First, check if email already exists
            const checkRes = await fetch(`${process.env.REACT_APP_API_BASE}/api/check-email-exists`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            });
            console.log('Raw checkRes:', checkRes);
            const checkData = await checkRes.json();
            console.log('Check email exists response:', checkData);
            if (checkData.exists) {
                setToast({ show: true, message: "Email already registered. Please login.", type: "error" });
                setLoading(false);
                setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3500);
                return;
            }
            // If not exists, send OTP
            const res = await fetch(`${process.env.REACT_APP_API_BASE}/api/send-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            });
            if (!res.ok) throw new Error("Failed to send OTP");
            setOtpSent(true);
            setToast({ show: true, message: "OTP sent to your email. Please check spam folder if not see in Inbox.", type: "success" });
        } catch (err) {
             console.error('Error in handleSendOtp:', err);
            setToast({ show: true, message: "Failed to send OTP. Try again.", type: "error" });
        }
        setLoading(false);
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3500);
    };

    // Step 2: Verify OTP
    const handleVerifyOtp = async () => {
        if (!otp) {
            setToast({ show: true, message: "Please enter the OTP.", type: "error" });
            setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3500);
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(`${process.env.REACT_APP_API_BASE}/api/verify-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp })
            });
            if (!res.ok) throw new Error("OTP verification failed");
            setOtpVerified(true);
            setToast({ show: true, message: "OTP verified! Please complete your signup.", type: "success" });
        } catch (err) {
            setToast({ show: true, message: "Invalid OTP. Try again.", type: "error" });
        }
        setLoading(false);
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3500);
    };

    // Step 3: Signup
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setToast({ show: true, message: "Passwords do not match.", type: "error" });
            setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3500);
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(`${process.env.REACT_APP_API_BASE}/api/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, name, initiated_name: initiatedName, mobile, password })
            });
            if (!res.ok) throw new Error("Signup failed");
            setToast({ show: true, message: "Signup successful! Please check your email to verify your account.", type: "success" });
            setEmail(""); setName(""); setInitiatedName(""); setMobile(""); setPassword(""); setConfirmPassword(""); setOtp(""); setOtpSent(false); setOtpVerified(false);
            setTimeout(() => {
                setToast({ show: false, message: '', type: 'success' });
                navigate('/login');
            }, 1800);
        } catch (err) {
            setToast({ show: true, message: "Signup failed. Please try again.", type: "error" });
        }
        setLoading(false);
    };

    const handleDownloadApp = () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
        } else {
            window.open('https://support.google.com/chrome/answer/9658361', '_blank'); // fallback info
        }
    };

    return (
        <div className="login-page">
            <div className="login-logo-container" style={{ position: 'relative' }}>
                <img src={process.env.PUBLIC_URL + '/image/VSB-logo.png'} alt="Vaidhisadhanabhakti Logo with Text" className="login-logo" />
                <button
                    className="btn btn-success d-block d-md-none"
                    style={{ position: 'absolute', top: 0, right: 0, fontWeight: 600, borderRadius: 8, fontSize: '1rem', background: '#3d5a1a', color: '#fff', padding: '8px 18px', zIndex: 10 }}
                    onClick={handleDownloadApp}
                >
                    Download App
                </button>
            </div>
            <div className="d-flex flex-column justify-content-center align-items-center login-form-bg">
                <div className="login-form-container p-4 shadow-lg rounded w-100">
                    <h2 className="text-center mb-4" style={{ color: '#a05a2c' }}>Sign Up</h2>
                    {/* Step 1: Email and Send OTP */}
                    <div className="form-group mb-3">
                        <input
                            type="email"
                            className="form-control"
                            placeholder="Enter email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            disabled={otpSent || otpVerified}
                        />
                    </div>
                    {!otpSent && (
                        <button
                            className="btn w-100 mb-3"
                            style={{ background: '#a05a2c', color: '#fff', fontWeight: 600 }}
                            onClick={handleSendOtp}
                            disabled={loading || !email}
                        >
                            {loading ? "Sending OTP..." : "Send OTP"}
                        </button>
                    )}
                    {/* Step 2: OTP Verification */}
                    {otpSent && !otpVerified && (
                        <>
                            <div className="form-group mb-3">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Enter OTP"
                                    value={otp}
                                    onChange={e => setOtp(e.target.value)}
                                    required
                                />
                            </div>
                            <div style={{ color: '#b36b00', fontSize: '14px', marginBottom: '10px', marginTop: '-5px' }}>
                              Please check your spam folder as well if you do not see the OTP email.
                            </div>
                            <button
                                className="btn w-100 mb-3"
                                style={{ background: '#7a9c5c', color: '#fff', fontWeight: 600 }}
                                onClick={handleVerifyOtp}
                                disabled={loading || !otp}
                            >
                                {loading ? "Verifying..." : "Verify OTP"}
                            </button>
                        </>
                    )}
                    {/* Step 3: Signup Form (only after OTP verified) */}
                    {otpVerified && (
                        <form onSubmit={handleSubmit}>
                            <div className="form-group mb-3">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Enter your name"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group mb-3">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Initiated Name (Optional)"
                                    value={initiatedName}
                                    onChange={e => setInitiatedName(e.target.value)}
                                />
                            </div>
                            <div className="form-group mb-3">
                                <input
                                    type="tel"
                                    className="form-control"
                                    placeholder="Mobile Number"
                                    value={mobile}
                                    onChange={e => setMobile(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group mb-3">
                                <input
                                    type="password"
                                    className="form-control"
                                    placeholder="Password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                />
                            </div>
                            <div className="form-group mb-4">
                                <input
                                    type="password"
                                    className="form-control"
                                    placeholder="Confirm Password"
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    required
                                    minLength={6}
                                />
                            </div>
                            <button
                                type="submit"
                                className="btn w-100"
                                style={{ background: '#a05a2c', color: '#fff', fontWeight: 600 }}
                                disabled={loading}
                            >
                                {loading ? "Signing up..." : "Sign Up"}
                            </button>
                        </form>
                    )}
                    <div className="text-center mt-3">
                        <span className="signup-link-text">Already have an account? <a href="/login" className="signup-link">Login</a></span>
                    </div>
                </div>
            </div>
            {toast.show && (
                <div className={`help-toast ${toast.type}`}>{toast.message}</div>
            )}
        </div>
    );
}