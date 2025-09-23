import React, { useState } from "react";
import axios from "axios";

export default function Register() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("user");

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${process.env.REACT_APP_API_BASE}/api/register`, {
                email,
                password,
                role,
            });
            alert("User registered successfully!");
        } catch (err) {
            alert("Registration failed: " + (err.response?.data?.message || err.message));
        }
    };

    return (
        <div className="container mt-5">
            <div className="card shadow border-info">
                <div className="card-header bg-info text-white text-center">
                    <h3>📝 Register New User</h3>
                </div>
                <div className="card-body">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label fw-bold">Email address</label>
                            <input
                                type="email"
                                className="form-control"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="Enter email"
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label fw-bold">Password</label>
                            <input
                                type="password"
                                className="form-control"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="Enter password"
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label fw-bold">Role</label>
                            <select
                                className="form-select"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                            >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <div className="text-center">
                            <button type="submit" className="btn btn-success">
                                <i className="bi bi-person-plus-fill"></i> Register
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
