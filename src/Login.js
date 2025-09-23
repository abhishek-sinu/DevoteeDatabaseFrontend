// src/Login.js
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Login.css"; // Custom styles

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${process.env.REACT_APP_API_BASE}/api/login`, {
                email,
                password,
            });
            localStorage.setItem("token", res.data.token);
            alert("Login successful!");
            localStorage.setItem("userId", email);
            navigate("/dashboard");
        } catch (err) {
            alert("Login failed: " + (err.response?.data?.message || err.message));
        }
    };

    return (
        <div className="login-page d-flex align-items-center justify-content-center">
            <div className="login-form-container p-4 shadow-lg rounded">
                <h2 className="text-center mb-4 text-light">Welcome, Devotee</h2>
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
                    <button type="submit" className="btn btn-primary w-100">
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
}
