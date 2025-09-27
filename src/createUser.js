import React, { useState } from "react";
import axios from "axios";

export default function AssignUserRole() {
    const [email, setEmail] = useState("");
    const [user, setUser] = useState(null);
    const [role, setRole] = useState("user");
    const [message, setMessage] = useState("");

    const token = localStorage.getItem("token");

    const handleSearch = async () => {
        try {
            const response = await axios.get(
                `${process.env.REACT_APP_API_BASE}/api/users/by-email`,
                {
                    params: { email },
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setUser(response.data);
            setRole(response.data.role);
            setMessage("");
        } catch (err) {
            setUser(null);
            setMessage("User not found");
        }
    };

    const handleAssignRole = async () => {
        try {
            await axios.put(
                `${process.env.REACT_APP_API_BASE}/api/users/assign-role`,
                { email, role },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMessage(`✅ Role updated to '${role}' for ${email}`);
        } catch (err) {
            setMessage("❌ Failed to update role");
        }
    };

    return (
        <div className="container mt-5">
            <div className="card shadow border-info">
                <div className="card-header bg-info text-white text-center">
                    <h3>🔐 Assign Role to User</h3>
                </div>
                <div className="card-body">
                    <div className="mb-3">
                        <label className="form-label fw-bold">Search by Email</label>
                        <input
                            type="email"
                            className="form-control"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter user email"
                            required
                        />
                        <button className="btn btn-primary mt-2" onClick={handleSearch}>
                            🔍 Search
                        </button>
                    </div>

                    {user && (
                        <>
                            <div className="mb-3">
                                <label className="form-label fw-bold">Assign Role</label>
                                <select
                                    className="form-select"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                >
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                    <option value="counsellor">counsellor</option>
                                </select>
                            </div>
                            <div className="text-center">
                                <button className="btn btn-success" onClick={handleAssignRole}>
                                    ✅ Assign Role
                                </button>
                            </div>
                        </>
                    )}

                    {message && (
                        <div className="mt-3 text-center fw-bold">
                            {message}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}