import React from "react";

export default function AddDevoteeForm({ form, handleChange, handleSubmit, editingId }) {
    const excludedFields = ["id", "created_at"];

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
