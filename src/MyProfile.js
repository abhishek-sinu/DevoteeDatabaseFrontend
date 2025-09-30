import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_BASE;

export default function MyProfile() {
    const [profile, setProfile] = useState(null);
    const [facilitatorName, setFacilitatorName] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");
        const email = localStorage.getItem("userId");

        const fetchProfile = async () => {
            try {
                const res = await axios.get(`${API_BASE}/api/devotees`, {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { userId: email, type: "Name" },
                });
                setProfile(res.data[0]);
            } catch (err) {
                console.error("Error fetching profile:", err);
            }
        };

        fetchProfile();
    }, []);

    const fetchFacilitatorName = async (id) => {
        if (!id) return;
        const token = localStorage.getItem("token");
        try {
            const res = await axios.get(`${API_BASE}/api/devotees/${id}/initiated-name`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setFacilitatorName(res.data.initiated_name || "Not found");
        } catch {
            setFacilitatorName("Not found");
        }
    };

    useEffect(() => {
        if (profile?.facilitator_id) {
            fetchFacilitatorName(profile.facilitator_id);
        }
    }, [profile]);

    if (!profile) return <div>Loading profile...</div>;

    return (
        <div className="container mt-5 d-flex justify-content-center">
            <div className="card shadow" style={{ maxWidth: "500px", width: "100%" }}>
                <div className="card-header text-center bg-primary text-white">
                    <h4> {profile.initiated_name || "-"}</h4>
                </div>
                <div className="card-body">
                    {profile.photo && (
                        <div className="d-flex justify-content-center mb-4">
                            <img
                                src={API_BASE + profile.photo}
                                alt="Profile"
                                className="rounded-circle border"
                                style={{ width: "120px", height: "120px", objectFit: "cover" }}
                            />
                        </div>
                    )}
                    <ul className="list-group list-group-flush">
                        <li className="list-group-item">
                            <strong>Mobile No:</strong> {profile.mobile_no || "-"}
                        </li>
                        <li className="list-group-item">
                            <strong>Temple Name:</strong> {profile.temple_name || "-"}
                        </li>
                        <li className="list-group-item">
                            <strong>Whatsapp No:</strong> {profile.whatsapp_no || "-"}
                        </li>
                        {Object.entries(profile)
                            .filter(([key, value]) =>
                                !["photo", "id", "temple_name", "whatsapp_no", "mobile_no", "created_at"].includes(key) &&
                                value && value.toString().trim() !== ""
                            )
                            .map(([key, value]) => {
                                if (key === "facilitator_id") {
                                    if (facilitatorName === "Not found") return null;
                                    return (
                                        <li className="list-group-item" key={key}>
                                            <strong>{key.replace(/_/g, " ")}:</strong> {value} <br />
                                            <span className="text-muted">
                                            <strong>Facilitator Name:</strong> {facilitatorName}
                                            </span>
                                        </li>
                                    );
                                }
                                return (
                                    <li className="list-group-item" key={key}>
                                        <strong>{key.replace(/_/g, " ")}:</strong> {value}
                                    </li>
                                );
                            })}
                    </ul>
                </div>
            </div>
        </div>
    );
}