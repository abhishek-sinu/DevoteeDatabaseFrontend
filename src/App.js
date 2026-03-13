import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Login from "./Login";
import Signup from "./Signup";
import DevoteeDashboard from "./DevoteeDashboard";
import ContactUs from "./ContactUs";
import HelpGuide from "./HelpGuide";
import PublicDevoteeEntry from "./PublicDevoteeEntry";
import LandingPage from "./LandingPage";
import QuickLinkPage from './QuickLinkPage';
import SadhanaTemplate from './SadhanaTemplate';
import SadhanaEntryForm from './SadhanaEntryForm';
import SadhanaReports from './SadhanaReports';
import DevoteeTodoList from './DevoteeTodoList';

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
                <Route path="/signup" element={<Signup />} />
                <Route
                    path="/dashboard"
                    element={
                        <PrivateRoute>
                            <DevoteeDashboard />
                        </PrivateRoute>
                    }
                />
                <Route path="/help" element={<HelpGuide />} />
                <Route path="/contact" element={<ContactUs />} />
                <Route path="/" element={<LandingPage />} />
                <Route path="/quick-link" element={<QuickLinkPage />} />
                <Route path="/select-template" element={<SadhanaTemplate />} />
                <Route path="/sadhana-entry" element={<SadhanaEntryForm />} />
                <Route path="/view-entry" element={<SadhanaReports devoteeId={null} userRole={"user"} />} />
                <Route path="/sadhana-chart" element={<SadhanaReports devoteeId={null} userRole={"user"} />} />
                <Route path="/plan-day" element={<DevoteeTodoList />} />
            </Routes>
        </Router>
    );
}

export default App;
