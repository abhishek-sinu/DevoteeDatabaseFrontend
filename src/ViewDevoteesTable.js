import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_BASE;

export default function ViewDevoteesTable() {
    const [devotees, setDevotees] = useState([]);
    const [filter, setFilter] = useState("");
    const [modalDevotee, setModalDevotee] = useState(null);

    useEffect(() => {
        fetchDevotees();
    }, []);

    const fetchDevotees = async () => {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_BASE}/api/devotees`, {
            headers: { Authorization: `Bearer ${token}` },
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
            <input
                type="text"
                placeholder="Search..."
                value={filter}
                onChange={handleFilterChange}
                className="form-control mb-2"
            />
            <table className="table table-bordered table-striped table-hover">
                <thead>
                <tr>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Initiated Name</th>
                    <th>Mobile No</th>
                    <th>Email</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {currentItems.map((d) => (
                    <tr key={d.id}>
                        <td>{d.first_name}</td>
                        <td>{d.last_name}</td>
                        <td>{d.initiated_name || "-"}</td>
                        <td>{d.mobile_no}</td>
                        <td>{d.email}</td>
                        <td>
                            <button
                                className="btn btn-sm btn-info"
                                onClick={() => setModalDevotee(d)}
                            >
                                View Details
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>

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

            {modalDevotee && (
                <div
                    className="modal d-block"
                    tabIndex="-1"
                    style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                >
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Full Profile</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setModalDevotee(null)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="row align-items-center">
                                    <div className="col-md-4 text-center mb-3 mb-md-0">
                                        {modalDevotee.photo && (
                                            <img
                                                src={API_BASE + modalDevotee.photo}
                                                alt="Profile"
                                                className="img-fluid rounded-circle border"
                                                style={{ maxHeight: "150px", width: "150px", objectFit: "cover" }}
                                            />
                                        )}
                                    </div>
                                    <div className="col-md-8">
                                        <table className="table table-bordered mb-0">
                                            <tbody>
                                            <tr>
                                                <th>Initiated Name</th>
                                                <td>{modalDevotee.initiated_name || "-"}</td>
                                            </tr>
                                            <tr>
                                                <th>Mobile No</th>
                                                <td>{modalDevotee.mobile_no || "-"}</td>
                                            </tr>
                                            <tr>
                                                <th>Temple Name</th>
                                                <td>{modalDevotee.temple_name || "-"}</td>
                                            </tr>
                                            <tr>
                                                <th>Whatsapp No</th>
                                                <td>{modalDevotee.whatsapp_no || "-"}</td>
                                            </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                <hr />
                                <table className="table table-bordered">
                                    <tbody>
                                    {Object.entries(modalDevotee)
                                        .filter(
                                            ([key, value]) =>
                                                !["photo", "id", "temple_name", "whatsapp_no","mobile_no","created_at"].includes(key) &&
                                                value &&
                                                value.toString().trim() !== ""
                                        )
                                        .map(([key, value]) => (
                                            <tr key={key}>
                                                <th>{key.replace(/_/g, " ")}</th>
                                                <td>{value}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="modal-footer">
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => setModalDevotee(null)}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
