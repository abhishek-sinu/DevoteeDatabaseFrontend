import React, { useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_BASE;

export default function MyProfile() {
    const [profile, setProfile] = useState(null);
    const [facilitatorName, setFacilitatorName] = useState("");
    const [premiumInfo, setPremiumInfo] = useState({ user_type: "-", premium_expiry_date: "-" });
    const [showEdit, setShowEdit] = useState(false);
    const [editData, setEditData] = useState({});
    const [editPhoto, setEditPhoto] = useState(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

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

        const fetchPremium = async () => {
            try {
                const res = await axios.get(`${API_BASE}/api/users/premium-expiry`, {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { userId: email },
                });
                // Format date as DD MMM YYYY (e.g., 28 FEB 2026)
                let formattedDate = "-";
                if (res.data.premium_expiry_date) {
                    const dateObj = new Date(res.data.premium_expiry_date);
                    const day = dateObj.getDate().toString().padStart(2, '0');
                    const month = dateObj.toLocaleString('en-US', { month: 'short' }).toUpperCase();
                    const year = dateObj.getFullYear();
                    formattedDate = `${day} ${month} ${year}`;
                }
                setPremiumInfo({
                    user_type: res.data.user_type || "-",
                    premium_expiry_date: formattedDate
                });
            } catch (err) {
                setPremiumInfo({ user_type: "-", premium_expiry_date: "-" });
            }
        };

        fetchProfile();
        fetchPremium();
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


    // Editable fields (exclude user_type, premium_expiry_date, status, facilitator_id)
    const editableFields = [
        "first_name", "middle_name", "last_name", "gender", "dob", "ethnicity", "citizenship", "marital_status",
        "education_qualification_code", "address1", "address2", "pin_code", "email", "mobile_no", "whatsapp_no",
        "initiated_name", "photo", "spiritual_master_id", "first_initiation_date", "iskcon_first_contact_date",
        "second_initiated", "second_initiation_date", "full_time_devotee", "temple_name"
    ];

    const handleEditClick = () => {
        // Prepare edit data from profile
        const data = {};
        editableFields.forEach(f => data[f] = profile[f] || "");
        setEditData(data);
        setEditPhoto(null);
        setShowEdit(true);
        setError("");
    };

    const handleEditChange = (e) => {
        const { name, value, type, files } = e.target;
        if (type === "file") {
            setEditPhoto(files[0]);
        } else {
            setEditData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleEditSave = async () => {
        setSaving(true);
        setError("");
        try {
            const token = localStorage.getItem("token");
            console.log("[DEBUG] Token:", token);
            const formData = new FormData();
            editableFields.forEach(f => {
                if (f === "photo" && editPhoto) {
                    formData.append("photo", editPhoto);
                } else if (f !== "photo") {
                    formData.append(f, editData[f] || "");
                }
            });
            // If no new photo, keep the old one
            if (!editPhoto && profile.photo) {
                formData.append("photo", profile.photo);
            }
            const config = {
                headers: { Authorization: `Bearer ${token}` },
            };
            const email = sessionStorage.getItem("email");
            console.log("[DEBUG] PUT URL:", `${API_BASE}/api/devotees/${email}/self`);
            console.log("[DEBUG] Config:", config);
            await axios.put(`${API_BASE}/api/devotees/${email}/self`, formData, config);
            setShowEdit(false);
            setSaving(false);
            // Refresh profile
            window.location.reload();
        } catch (err) {
            setError("Failed to update profile. " + (err.response?.data?.error || err.message));
            setSaving(false);
        }
    };

    return (
        <div className="container mt-5 d-flex justify-content-center">
            {profile === null ? (
                <div>Loading profile...</div>
            ) : (
                <div className="card shadow" style={{ maxWidth: "500px", width: "100%", position: 'relative' }}>
                    <div className="card-header text-center bg-primary text-white" style={{ position: 'relative' }}>
                        <h4> {profile.initiated_name || "-"}</h4>
                        {/* Edit icon */}
                        <span
                            style={{ position: 'absolute', top: 12, right: 18, cursor: 'pointer', color: '#fff', fontSize: 22 }}
                            title="Edit Profile"
                            onClick={handleEditClick}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24"><path fill="#fff" d="M3 17.25V21h3.75l11.06-11.06-3.75-3.75L3 17.25zm17.71-10.04a1.003 1.003 0 0 0 0-1.42l-2.5-2.5a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                        </span>
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
                                <strong>User Type: </strong> 
                                <span style={{
                                    color: premiumInfo.user_type === 'trial' ? '#efa208' : premiumInfo.user_type === 'premium' ? '#3d5a1a' : '#333',
                                    fontWeight: 600,
                                    textTransform: 'uppercase'
                                }}>
                                    {premiumInfo.user_type ? premiumInfo.user_type.toUpperCase() : ''}
                                </span>
                            </li>
                            <li className="list-group-item">
                                <strong>Premium Expiry:</strong> {premiumInfo.premium_expiry_date}
                            </li>
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
                                    !["photo", "id", "temple_name", "whatsapp_no", "mobile_no", "created_at", "user_type", "premium_expiry_date", "status", "facilitator_id"].includes(key) &&
                                    value && value.toString().trim() !== ""
                                )
                                .map(([key, value]) => (
                                    <li className="list-group-item" key={key}>
                                        <strong>{key.replace(/_/g, " ")}:</strong> {value}
                                    </li>
                                ))}
                        </ul>
                    </div>
                </div>
            )}
            {/* Edit Modal */}
            <Modal show={showEdit} onHide={() => setShowEdit(false)} centered dialogClassName="modal-wide">
                <Modal.Header closeButton>
                    <Modal.Title>Edit Profile</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {error && <div className="alert alert-danger">{error}</div>}
                    <form>
                        <div className="row">
                            {editableFields.map((field, idx) => (
                                <div
                                    className={field === "photo" ? "col-12 mb-3" : "col-md-6 mb-3"}
                                    key={field}
                                >
                                    {field === "photo" ? (
                                        <>
                                            <label className="form-label">Profile Photo</label>
                                            <input type="file" className="form-control" name="photo" accept="image/*" onChange={handleEditChange} />
                                            {editData.photo && !editPhoto && (
                                                <img src={API_BASE + editData.photo} alt="Current" style={{ width: 60, height: 60, borderRadius: '50%', marginTop: 8 }} />
                                            )}
                                            {editPhoto && (
                                                <img src={URL.createObjectURL(editPhoto)} alt="Preview" style={{ width: 60, height: 60, borderRadius: '50%', marginTop: 8 }} />
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            <label className="form-label">{field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</label>
                                            <input
                                                type={field.toLowerCase().includes('date') ? 'date' : 'text'}
                                                className="form-control"
                                                name={field}
                                                value={editData[field] || ''}
                                                onChange={handleEditChange}
                                            />
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowEdit(false)} disabled={saving}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleEditSave} disabled={saving}>
                        {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </Modal.Footer>
            </Modal>
        {/* Custom style for wide modal */}
        <style>{`
            .modal-wide .modal-dialog {
                max-width: 900px;
            }
        `}</style>
        </div>
    );
}