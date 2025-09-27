import React from "react";

export default function AddDevoteeForm({ form, handleChange, handleSubmit, editingId }) {
    const excludedFields = ["id", "created_at"];

    // ✅ Log form keys to console
    console.log("Form keys:", Object.keys(form));

    return (
        <div>
            <h4>{editingId ? "Update" : "Add"} Devotee</h4>
            <form onSubmit={handleSubmit}>
                <div className="row">
                    {Object.entries(form)
                        .filter(([key]) => !excludedFields.includes(key))
                        .map(([key, value]) => (
                            <div className="col-md-4 mb-3" key={key}>
                                <label className="form-label">{key.replace(/_/g, " ")}</label>
                                {key === "photo" ? (
                                    <input
                                        type="file"
                                        name={key}
                                        className="form-control"
                                        onChange={handleChange}
                                        accept="image/*"
                                    />
                                ) : key.trim().toLowerCase() === "gender" ? (
                                    <select
                                        name="gender"
                                        className="form-control"
                                        value={value}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                ) : (
                                    <input
                                        type="text"
                                        name={key}
                                        className="form-control"
                                        value={value}
                                        onChange={handleChange}
                                    />
                                )}
                            </div>
                        ))}
                </div>
                <button className="btn btn-info" type="submit">
                    {editingId ? "Update" : "Add"} Devotee
                </button>
            </form>
        </div>
    );
}