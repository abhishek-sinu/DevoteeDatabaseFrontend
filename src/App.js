import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Login from "./Login";
import DevoteeDashboard from "./DevoteeDashboard";
import PublicDevoteeEntry from "./PublicDevoteeEntry";

function PrivateRoute({ children }) {
    const token = localStorage.getItem("token");
    return token ? children : <Navigate to="/login" />;
}

function App() {
    return (
        <Router>
            <Routes>
                {/* Public entry page - accessible without login */}
                <Route path="/public-entry" element={<PublicDevoteeEntry />} />
                <Route path="/login" element={<Login />} />
                <Route
                    path="/dashboard"
                    element={
                        <PrivateRoute>
                            <DevoteeDashboard />
                        </PrivateRoute>
                    }
                />
                <Route path="/" element={<Navigate to="/login" />} />
            </Routes>
        </Router>
    );
}

export default App;
