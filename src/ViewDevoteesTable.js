import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_BASE;

export default function ViewDevoteesTable() {
    const [devotees, setDevotees] = useState([]);
    const [filter, setFilter] = useState("");
    const [modalPhoto, setModalPhoto] = useState(null);
    const [form] = useState({
        first_name: "", middle_name: "", last_name: "", gender: "", dob: "",
        ethnicity: "", citizenship: "", marital_status: "", education_qualification_code: "",
        address1: "", address2: "", pin_code: "", email: "", mobile_no: "", whatsapp_no: "",
        initiated_name: "", photo: "", spiritual_master_id: "", first_initiation_date: "",
        iskcon_first_contact_date: "", second_initiated: "", second_initiation_date: "",
        full_time_devotee: "", temple_name: "", status: ""
    });

    useEffect(() => {
        fetchDevotees();
    }, []);

    const fetchDevotees = async () => {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_BASE}/api/devotees`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setDevotees(res.data);
    };

    const handleFilterChange = (e) => setFilter(e.target.value);

    const filteredDevotees = devotees.filter((d) =>
        Object.values(d).some(
            (val) => val && val.toString().toLowerCase().includes(filter.toLowerCase())
        )
    );

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredDevotees.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredDevotees.length / itemsPerPage);
    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
        <>
            <h5>View Devotees</h5>
            <input
                type="text"
                placeholder="Search..."
                value={filter}
                onChange={handleFilterChange}
                style={{ marginBottom: "10px", padding: "5px" }}
            />
            <div style={{ overflowX: "auto", maxWidth: "100%" }}>
                <table className="table table-bordered table-striped">
                    <thead>
                    <tr>
                        <th>ID</th>
                        {Object.keys(form).map((key) => (
                            <th key={key}>{key.replace(/_/g, " ")}</th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {currentItems.map((d) => (
                        <tr key={d.id}>
                            <td>{d.id}</td>
                            {Object.keys(form).map((key) => (
                                <td key={key}>
                                    {key === "photo" && d[key] ? (
                                        <img
                                            src={`${API_BASE}${d[key]}`}
                                            alt="Profile"
                                            style={{
                                                width: "60px",
                                                height: "60px",
                                                objectFit: "cover",
                                                borderRadius: "50%",
                                                cursor: "pointer"
                                            }}
                                            onClick={() => setModalPhoto(d[key])}
                                        />
                                    ) : (
                                        d[key]
                                    )}
                                </td>
                            ))}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
            <div style={{ marginTop: "10px" }}>
                {pageNumbers.map((number) => (
                    <button
                        key={number}
                        onClick={() => setCurrentPage(number)}
                        className={`btn btn-sm mx-1 ${
                            number === currentPage ? "btn-primary" : "btn-outline-primary"
                        }`}
                    >
                        {number}
                    </button>
                ))}
            </div>

            {modalPhoto && (
                <div
                    className="modal show d-block"
                    tabIndex="-1"
                    role="dialog"
                    onClick={() => setModalPhoto(null)}
                    style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                >
                    <div className="modal-dialog modal-dialog-centered" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Profile Picture</h5>
                                <button
                                    type="button"
                                    className="close"
                                    onClick={() => setModalPhoto(null)}
                                >
                                    <span>&times;</span>
                                </button>
                            </div>
                            <div className="modal-body text-center">
                                <img
                                    src={`${API_BASE}${modalPhoto}`}
                                    alt="Full Profile"
                                    className="img-fluid"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
