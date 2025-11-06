import React, { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";


const API_BASE = process.env.REACT_APP_API_BASE;

export default function ViewDevoteesTable() {
    const [devotees, setDevotees] = useState([]);
    const [filter, setFilter] = useState("");
    const [modalDevotee, setModalDevotee] = useState(null);
    const [facilitatorName, setFacilitatorName] = useState("");
    const [filterType, setFilterType] = useState("Common Filter");
    const [filterValue, setFilterValue] = useState("");
    const [isExporting, setIsExporting] = useState(false);

    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);


    useEffect(() => {
        fetchCountries();
    }, []);

    const fetchCountries = async () => {
        try {
            const res = await axios.get("https://api.countrystatecity.in/v1/countries", {
                headers: { "X-CSCAPI-KEY": "M2JyaVR4b1E5aFR2ckJURGtmUUNMc0JaSldRamRaaDJDSFppWkp5aA==" }
            });
            setCountries(res.data);
        } catch (err) {
            console.error("Error fetching countries:", err);
        }
    };


    useEffect(() => {
        if (filterType === "Country" && filterValue.country) {
            const selectedCountry = countries.find(c => c.name === filterValue.country);
            if (selectedCountry) fetchStates(selectedCountry.iso2);
        }
    }, [filterValue.country]);

    const fetchStates = async (countryCode) => {
        try {
            const res = await axios.get(`https://api.countrystatecity.in/v1/countries/${countryCode}/states`, {
                headers: { "X-CSCAPI-KEY": "M2JyaVR4b1E5aFR2ckJURGtmUUNMc0JaSldRamRaaDJDSFppWkp5aA==" }
            });
            setStates(res.data);
        } catch (err) {
            console.error("Error fetching states:", err);
        }
    };

    useEffect(() => {
        if (filterType === "Country" && filterValue.country && filterValue.state) {
            const selectedCountry = countries.find(c => c.name === filterValue.country);
            const selectedState = states.find(s => s.name === filterValue.state);
            if (selectedCountry && selectedState) fetchCities(selectedCountry.iso2, selectedState.iso2);
        }
    }, [filterValue.state]);

    const fetchCities = async (countryCode, stateCode) => {
        try {
            const res = await axios.get(`https://api.countrystatecity.in/v1/countries/${countryCode}/states/${stateCode}/cities`, {
                headers: { "X-CSCAPI-KEY": "M2JyaVR4b1E5aFR2ckJURGtmUUNMc0JaSldRamRaaDJDSFppWkp5aA==" }
            });
            setCities(res.data);
        } catch (err) {
            console.error("Error fetching cities:", err);
        }
    };



    useEffect(() => {
        fetchDevotees();
    }, []);

    const fetchDevotees = async () => {
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId");
        const res = await axios.get(`${API_BASE}/api/devotees`, {
            headers: { Authorization: `Bearer ${token}` },
            params: { userId }
        });
        setDevotees(res.data);
    };

    const filteredDevotees = devotees.filter((d) => {
        if (filterType === "Common Filter") {
            return Object.values(d).some((val) =>
                val && val.toString().toLowerCase().includes(filterValue.toLowerCase())
            );
        }

        if (filterType === "Country" && filterValue) {
            return (
                (!filterValue.country || (d.citizenship && d.citizenship.toLowerCase().includes(filterValue.country.toLowerCase()))) &&
                (!filterValue.state || (d.address1 && d.address1.toLowerCase().includes(filterValue.state.toLowerCase()))) &&
                (!filterValue.city || (d.address2 && d.address2.toLowerCase().includes(filterValue.city.toLowerCase())))
            );
        }

        if (filterType === "By Age ≥") {
            if (!d.dob) return false;
            const birthYear = new Date(d.dob).getFullYear();
            const currentYear = new Date().getFullYear();
            const age = currentYear - birthYear;
            return age >= parseInt(filterValue);
        }

        if (filterType === "Gender") return d.gender === filterValue;
        if (filterType === "Marital Status") return d.marital_status === filterValue;
        if (filterType === "Education") return d.education_qualification_code === filterValue;
        if (filterType === "City") return d.address1?.toLowerCase().includes(filterValue.toLowerCase());
        if (filterType === "State") return d.address2?.toLowerCase().includes(filterValue.toLowerCase());
        if (filterType === "First Initiated Date") return d.first_initiation_date === filterValue;
        if (filterType === "Second Initiated Date") return d.second_initiation_date === filterValue;
        if (filterType === "Full Time Devotees") return d.full_time_devotee === filterValue;

        return true;
    });

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredDevotees.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredDevotees.length / itemsPerPage);
    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

    const fetchFacilitatorName = async (id) => {
        if (!id) return;
        const token = localStorage.getItem("token");
        try {
            const res = await axios.get(`${API_BASE}/api/devotees/${id}/initiated-name`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setFacilitatorName(res.data.initiated_name || "Not found");
        } catch (err) {
            setFacilitatorName("Not found");
        }
    };

    const exportToExcel = () => {
        setIsExporting(true);

        const exportData = filteredDevotees.map((devotee) => {
            const formatted = {};
            Object.entries(devotee).forEach(([key, value]) => {
                formatted[key.replace(/_/g, " ")] = value;
            });
            return formatted;
        });

        const worksheet = XLSX.utils.json_to_sheet(exportData);

        const columnWidths = Object.keys(exportData[0]).map((key) => ({
            wch: Math.max(key.length, ...exportData.map((row) => (row[key] ? row[key].toString().length : 0))) + 2
        }));
        worksheet['!cols'] = columnWidths;

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Devotees");

        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const data = new Blob([excelBuffer], { type: "application/octet-stream" });
        saveAs(data, "filtered_devotees.xlsx");

        setTimeout(() => setIsExporting(false), 1000); // simulate download delay
    };

    return (
        <>
            <div className="row mb-3">
                <div className="col-md-4">
                    <select className="form-control" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                        <option>Common Filter</option>
                        <option>By Age ≥</option>
                        <option>Gender</option>
                        <option>Marital Status</option>
                        <option>Education</option>
                        <option>Country</option>
                        <option>First Initiated Date</option>
                        <option>Second Initiated Date</option>
                        <option>Full Time Devotees</option>
                    </select>
                </div>
                <div className="col-md-5">
                    {filterType === "Country" && (
                        <>
                            <select className="form-control mb-2" value={filterValue.country || ""} onChange={(e) => setFilterValue({ country: e.target.value })}>
                                <option value="">Select Country</option>
                                {countries.map(c => (
                                    <option key={c.iso2} value={c.name}>{c.name}</option>
                                ))}
                            </select>
                            {filterValue.country && (
                                <select className="form-control mb-2" value={filterValue.state || ""} onChange={(e) => setFilterValue(prev => ({ ...prev, state: e.target.value }))}>
                                    <option value="">Select State</option>
                                    {states.map(s => (
                                        <option key={s.iso2} value={s.name}>{s.name}</option>
                                    ))}
                                </select>
                            )}
                            {filterValue.state && (
                                <select className="form-control" value={filterValue.city || ""} onChange={(e) => setFilterValue(prev => ({ ...prev, city: e.target.value }))}>
                                    <option value="">Select City</option>
                                    {cities.map(city => (
                                        <option key={city.name} value={city.name}>{city.name}</option>
                                    ))}
                                </select>
                            )}
                        </>
                    )}
                    {filterType === "Common Filter" && (
                        <input type="text" className="form-control" placeholder="Search..." value={filterValue} onChange={(e) => setFilterValue(e.target.value)} />
                    )}
                    {filterType === "By Age ≥" && (
                        <input type="number" className="form-control" min="0" max="100" value={filterValue} onChange={(e) => setFilterValue(e.target.value)} />
                    )}
                    {filterType === "Gender" && (
                        <select className="form-control" value={filterValue} onChange={(e) => setFilterValue(e.target.value)}>
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    )}
                    {filterType === "Marital Status" && (
                        <select className="form-control" value={filterValue} onChange={(e) => setFilterValue(e.target.value)}>
                            <option value="">Select Marital Status</option>
                            <option value="Grihastha">Grihastha</option>
                            <option value="Bramhachari">Bramhachari</option>
                            <option value="Not Married">Not Married</option>
                        </select>
                    )}
                    {filterType === "Education" && (
                        <select className="form-control" value={filterValue} onChange={(e) => setFilterValue(e.target.value)}>
                            <option value="">Select Education</option>
                            <option value="Below 10th">Below 10th</option>
                            <option value="10th">10th</option>
                            <option value="12th">12th</option>
                            <option value="Graduation">Graduation</option>
                            <option value="Post Graduation">Post Graduation</option>
                            <option value="PHD">PHD</option>
                        </select>
                    )}
                    {filterType === "First Initiated Date" && (
                        <input type="date" className="form-control" value={filterValue} onChange={(e) => setFilterValue(e.target.value)} />
                    )}
                    {filterType === "Second Initiated Date" && (
                        <input type="date" className="form-control" value={filterValue} onChange={(e) => setFilterValue(e.target.value)} />
                    )}
                    {filterType === "Full Time Devotees" && (
                        <select className="form-control" value={filterValue} onChange={(e) => setFilterValue(e.target.value)}>
                            <option value="">Select</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                        </select>
                    )}
                </div>
                <div className="col-md-3 d-flex align-items-center">
                    <button className="btn btn-success w-100" onClick={exportToExcel} disabled={isExporting}>
                        {isExporting ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Exporting...
                            </>
                        ) : (
                            "Export to Excel"
                        )}
                    </button>
                </div>
            </div>
            <div className="table-responsive">
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
            </div>

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
                                                <td>
                                                    {key === "facilitator_id" ? (
                                                        <>
                                                            {value}
                                                            {" "}
                                                            <a
                                                                href="#"
                                                                onClick={e => {
                                                                    e.preventDefault();
                                                                    fetchFacilitatorName(value);
                                                                }}
                                                                style={{ marginLeft: 8 }}
                                                            >
                                                                Name:
                                                            </a>
                                                            {facilitatorName && (
                                                                <span style={{ marginLeft: 8, color: '#007bff' }}>{facilitatorName}</span>
                                                            )}
                                                        </>
                                                    ) : (
                                                        value
                                                    )}
                                                </td>
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
