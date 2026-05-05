import React, { useEffect } from "react";
// Capacitor Local Notifications
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
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
import ResetPassword from "./ResetPassword";

function PrivateRoute({ children }) {
    const token = localStorage.getItem("token");
    return token ? children : <Navigate to="/login" />;
}

function App() {
    useEffect(() => {
        // Only schedule on device (not web)
        if (Capacitor.isNativePlatform && Capacitor.isNativePlatform()) {
            (async () => {
                try {
                    const getTodayKey = () => {
                        const now = new Date();
                        const month = String(now.getMonth() + 1).padStart(2, "0");
                        const day = String(now.getDate()).padStart(2, "0");
                        return `${now.getFullYear()}-${month}-${day}`;
                    };

                    const reminderIds = [101, 102, 103, 104];
                    const reminderTimes = [
                        { hour: 9, minute: 30 },
                        { hour: 10, minute: 0 },
                        { hour: 20, minute: 0 },
                        { hour: 21, minute: 0 },
                        { hour: 22, minute: 0 }
                    ];

                    await LocalNotifications.requestPermissions();
                    await LocalNotifications.registerActionTypes({
                        types: [
                            {
                                id: "SADHANA_ACTIONS",
                                actions: [
                                    { id: "filled", title: "Filled" },
                                    { id: "not_yet", title: "Not yet" }
                                ]
                            }
                        ]
                    });

                    const buildRepeatingNotifications = () =>
                        reminderTimes.map((time, index) => ({
                            id: reminderIds[index],
                            title: "Sadhana Reminder",
                            body: "Have you filled your sadhana today?",
                            actionTypeId: "SADHANA_ACTIONS",
                            smallIcon: "ic_alarm_mono",
                            largeIcon: "ic_alarm_color",
                            schedule: {
                                repeats: true,
                                every: "day",
                                on: { hour: time.hour, minute: time.minute }
                            }
                        }));

                    const actionListener = await LocalNotifications.addListener(
                        "localNotificationActionPerformed",
                        async (event) => {
                            if (event?.actionId === "filled") {
                                localStorage.setItem("sadhanaFilledDate", getTodayKey());
                                await LocalNotifications.cancel({
                                    notifications: reminderIds.map((id) => ({ id }))
                                });
                                await LocalNotifications.schedule({
                                    notifications: buildRepeatingNotifications()
                                });
                            }
                        }
                    );

                    const pending = await LocalNotifications.getPending();
                    const pendingIds = new Set((pending?.notifications || []).map((n) => n.id));

                    const notificationsToSchedule = buildRepeatingNotifications()
                        .filter((notification) => !pendingIds.has(notification.id));

                    if (notificationsToSchedule.length) {
                        await LocalNotifications.schedule({
                            notifications: notificationsToSchedule
                        });
                    }

                    return () => actionListener.remove();
                } catch (e) {
                    // Ignore errors
                }
            })();
        }
    }, []);
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
                <Route path="/reset-password" element={<ResetPassword />} />
            </Routes>
        </Router>
    );
}

export default App;
