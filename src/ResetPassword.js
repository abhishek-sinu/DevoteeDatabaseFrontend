import React, { useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function ResetPassword() {
  const query = useQuery();
  const token = query.get("token");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match." });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      await axios.post(`${process.env.REACT_APP_API_BASE}/api/reset-password`, {
        token,
        password,
      });
      setMessage({ type: "success", text: "Password reset successful! You can now log in." });
      setTimeout(() => navigate("/login", { replace: true }), 2000);
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Reset failed." });
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return <div style={{ padding: 32, color: "red" }}>Invalid or missing token.</div>;
  }

  return (
    <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: "100vh", background: "#f9f6f1" }}>
      <div className="p-4 shadow-lg rounded" style={{ background: "#fff", minWidth: 340 }}>
        <h2 className="mb-4" style={{ color: "#a05a2c" }}>Reset Password</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group mb-3">
            <input
              type="password"
              className="form-control"
              placeholder="New password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group mb-3">
            <input
              type="password"
              className="form-control"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn w-100" style={{ background: "#a05a2c", color: "#fff", fontWeight: 600 }} disabled={loading}>
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
        {message && (
          <div className="mt-3" style={{ color: message.type === "success" ? "green" : "red" }}>{message.text}</div>
        )}
      </div>
    </div>
  );
}
