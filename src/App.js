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
        const getTodayKey = () => {
            const now = new Date();
            const month = String(now.getMonth() + 1).padStart(2, "0");
            const day = String(now.getDate()).padStart(2, "0");
            return `${now.getFullYear()}-${month}-${day}`;
        };

        const reminderIds = [101, 102, 103, 104, 105];
        const reminderTimes = [
            { hour: 10, minute: 0 },
            { hour: 20, minute: 0 },
            { hour: 21, minute: 0 },
            { hour: 22, minute: 0 }
        ];

        const buildRepeatingNotifications = (startTomorrow = false) =>
            reminderTimes.map((time, index) => {
                const at = new Date();
                at.setHours(time.hour, time.minute, 0, 0);
                if (startTomorrow || at <= new Date()) {
                    at.setDate(at.getDate() + 1);
                }

                return {
                    id: reminderIds[index],
                    title: "Sadhana Reminder",
                    body: "Have you filled your sadhana today?",
                    actionTypeId: "SADHANA_ACTIONS",
                    smallIcon: "ic_alarm_mono",
                    largeIcon: "ic_alarm_color",
                    schedule: {
                        at,
                        repeats: true
                    }
                };
            });

        const webTimeoutIds = [];
        let removeNativeListener = null;

        const showBrowserNotification = async () => {
            const title = "Sadhana Reminder";
            const body = "Have you filled your sadhana today?";

            // Always check filled status first
            if (localStorage.getItem("sadhanaFilledDate") === getTodayKey()) {
                return;
            }

            try {
                if ("serviceWorker" in navigator) {
                    const registration = await navigator.serviceWorker.getRegistration();
                    if (registration) {
                        await registration.showNotification(title, { body });
                        return;
                    }
                }
            } catch (e) {
                // Fallback to Notification constructor
            }

            if (Notification.permission === "granted") {
                new Notification(title, { body });
            }
        };

        const scheduleBrowserDailyNotifications = () => {
            reminderTimes.forEach((time) => {
                const firstRun = new Date();
                firstRun.setHours(time.hour, time.minute, 0, 0);
                if (firstRun <= new Date()) {
                    firstRun.setDate(firstRun.getDate() + 1);
                }

                const scheduleNext = (runAt) => {
                    const delayMs = Math.max(runAt.getTime() - Date.now(), 0);
                    const timeoutId = window.setTimeout(async () => {
                        await showBrowserNotification();
                        const nextRun = new Date(runAt);
                        nextRun.setDate(nextRun.getDate() + 1);
                        scheduleNext(nextRun);
                    }, delayMs);
                    webTimeoutIds.push(timeoutId);
                };

                scheduleNext(firstRun);
            });
        };

        const isNative = Capacitor.isNativePlatform && Capacitor.isNativePlatform();

        if (isNative) {
            (async () => {
                try {
                    const permissions = await LocalNotifications.requestPermissions();
                    if (permissions?.display !== "granted") {
                        return;
                    }

                    await LocalNotifications.registerActionTypes({
                        types: [
                            {
                                id: "SADHANA_ACTIONS",
                                actions: [
                                    { id: "filled", title: "YES - Filled" },
                                    { id: "not_yet", title: "NO - Not Filled" }
                                ]
                            }
                        ]
                    });

                    const actionListener = await LocalNotifications.addListener(
                        "localNotificationActionPerformed",
                        async (event) => {
                            if (event?.actionId === "filled") {
                                localStorage.setItem("sadhanaFilledDate", getTodayKey());
                                await LocalNotifications.cancel({
                                    notifications: reminderIds.map((id) => ({ id }))
                                });
                                await LocalNotifications.schedule({
                                    notifications: buildRepeatingNotifications(true)
                                });
                            }
                        }
                    );

                    removeNativeListener = () => actionListener.remove();

                    // Refresh fixed IDs every launch to avoid stale pending schedules.
                    await LocalNotifications.cancel({
                        notifications: reminderIds.map((id) => ({ id }))
                    });

                    const filledToday = localStorage.getItem("sadhanaFilledDate") === getTodayKey();
                    if (filledToday) {
                        await LocalNotifications.schedule({
                            notifications: buildRepeatingNotifications(true)
                        });
                    } else {
                        await LocalNotifications.schedule({
                            notifications: buildRepeatingNotifications()
                        });
                    }
                } catch (e) {
                    // Ignore errors
                }
            })();
        } else if (typeof window !== "undefined" && "Notification" in window) {
            (async () => {
                if (Notification.permission === "default") {
                    try {
                        await Notification.requestPermission();
                    } catch (e) {
                        // Ignore permission prompt errors
                    }
                }

                if (Notification.permission === "granted") {
                    scheduleBrowserDailyNotifications();
                }
            })();
        }

        return () => {
            webTimeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId));
            if (removeNativeListener) {
                removeNativeListener();
            }
        };
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
