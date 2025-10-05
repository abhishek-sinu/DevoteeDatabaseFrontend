import React, { useEffect, useState } from "react";
import axios from "axios";
import ReactModal from "react-modal";
import './DevoteeApp.css';
import imageCompression from 'browser-image-compression';

const API_BASE = process.env.REACT_APP_API_BASE;

ReactModal.setAppElement("#root");

export default function DevoteeApp() {
  const [devotees, setDevotees] = useState([]);
  const [filter, setFilter] = useState("");
  const [filterType, setFilterType] = useState("Common Filter");
  const [filterValue, setFilterValue] = useState("");
  const [form, setForm] = useState({
    first_name: "", middle_name: "", last_name: "", gender: "", dob: "", ethnicity: "", citizenship: "",
    marital_status: "", education_qualification_code: "", address1: "", address2: "", pin_code: "",
    email: "", mobile_no: "", whatsapp_no: "", initiated_name: "", photo: null, spiritual_master_id: "",
    first_initiation_date: "", iskcon_first_contact_date: "", second_initiated: "", second_initiation_date: "",
    full_time_devotee: "", temple_name: "", status: ""
  });

  const excludedFields = ["id", "created_at"];
  const [facilitator, setCounsellors] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const token = localStorage.getItem("token");

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);



  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalImage, setModalImage] = useState("");

  const openModal = (imgUrl) => {
    setModalImage(imgUrl);
    setModalIsOpen(true);
  };

  const closeModal = () => setModalIsOpen(false);

  useEffect(() => {
    fetchDevotees();
    fetchCounsellors();
  }, []);

  const fetchDevotees = async () => {
    try {
      const userId = "ALL";
      const res = await axios.get(`${API_BASE}/api/devotees`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { userId }
      });
      setDevotees(res.data);
    } catch (err) {
      console.error("❌ Error fetching devotees:", err);
    }
  };

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
    if (form.citizenship) fetchStates(form.citizenship);
  }, [form.citizenship]);

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
    if (form.address1 && form.citizenship) fetchCities(form.citizenship, form.address1);
  }, [form.address1]);

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

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm({
      ...form,
      [name]: name === "photo" ? files[0] : value,
    });
  };

  const fetchCounsellors = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/facilitators`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCounsellors(res.data);
    } catch (err) {
      console.error("❌ Error fetching facilitators:", err);
    }
  };

  const handleFilterChange = (e) => setFilter(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();

    Object.entries(form).forEach(([key, value]) => {
      if (key === "photo") {
        if (value instanceof File) {
          formData.append(key, value);
        }
      } else {
        formData.append(key, value);
      }
    });


    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    };

    try {
      if (editingId) {
        await axios.put(`${API_BASE}/api/devotees/${editingId}`, formData, config);
      } else {
        await axios.post(`${API_BASE}/api/devotees`, formData, config);
      }

      setForm({
        first_name: "", middle_name: "", last_name: "", gender: "", dob: "", ethnicity: "", citizenship: "",
        marital_status: "", education_qualification_code: "", address1: "", address2: "", pin_code: "",
        email: "", mobile_no: "", whatsapp_no: "", initiated_name: "", photo: null, spiritual_master_id: "",
        first_initiation_date: "", iskcon_first_contact_date: "", second_initiated: "", second_initiation_date: "",
        full_time_devotee: "", temple_name: "", status: ""
      });
      setEditingId(null);
      fetchDevotees();
    } catch (err) {
      console.error("❌ Error submitting form:", err);
    }
  };

  const handleEdit = (d) => {
    setForm({ ...d, photo: d.photo });
    setEditingId(d.id);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this devotee?")) return;
    try {
      await axios.delete(`${API_BASE}/api/devotees/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchDevotees();
    } catch (err) {
      console.error("❌ Error deleting devotee:", err);
    }
  };

  const filteredDevotees = devotees.filter(d => {
    if (filterType === "Common Filter") {
      return Object.values(d).some(val =>
          val && val.toString().toLowerCase().includes(filterValue.toLowerCase())
      );
    }
    if (filterType === "By Age ≥" && filterValue) {
      if (!d.dob) return false;
      const dob = new Date(d.dob);
      if (isNaN(dob)) return false;
      const age = Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      return age >= parseInt(filterValue, 10);
    }
    if (filterType === "Gender" && filterValue) {
      return d.gender && d.gender === filterValue;
    }
    if (filterType === "Marital Status" && filterValue) {
      return d.marital_status && d.marital_status === filterValue;
    }
    if (filterType === "Education" && filterValue) {
      return d.education_qualification_code && d.education_qualification_code === filterValue;
    }
    if (filterType === "City" && filterValue) {
      return d.address2 && d.address2.toLowerCase().includes(filterValue.toLowerCase());
    }
    if (filterType === "State" && filterValue) {
      return d.address1 && d.address1.toLowerCase().includes(filterValue.toLowerCase());
    }
    if (filterType === "First Initiated Date" && filterValue) {
      return d.first_initiation_date && d.first_initiation_date === filterValue;
    }
    if (filterType === "Second Initiated Date" && filterValue) {
      return d.second_initiation_date && d.second_initiation_date === filterValue;
    }
    if (filterType === "Full Time Devotees" && filterValue) {
      return d.full_time_devotee && d.full_time_devotee === filterValue;
    }
    return true;
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 2;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDevotees.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredDevotees.length / itemsPerPage);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
      <div className="container mt-4">
        <div className="card border-info shadow">
          <div className="card-header bg-info text-white text-center">
            <h3>Devotees Information</h3>
          </div>
          <div className="card-body">
            <div className="form-container mb-4">
              <h4 className="mb-3">{editingId ? "Update" : "Add"} Devotee</h4>
              <form onSubmit={handleSubmit}>
                <div className="row">
                  {Object.entries(form)
                      .filter(([key]) => !excludedFields.includes(key)&& key !== "counceller_id")
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
                            ): key === "citizenship" ? (
                                <select name="citizenship" className="form-control" value={value} onChange={handleChange}>
                                  <option value="">Select Country</option>
                                  {countries.map(c => (
                                      <option key={c.name} value={c.name}>{c.name}</option>
                                  ))}
                                </select>
                            ) : key === "address1" ? (
                                <select name="address1" className="form-control" value={value} onChange={handleChange}>
                                  <option value="">Select State</option>
                                  {states.map(s => (
                                      <option key={s.name} value={s.name}>{s.name}</option>
                                  ))}
                                </select>
                            ) : key === "address2" ? (
                                <select name="address2" className="form-control" value={value} onChange={handleChange}>
                                  <option value="">Select City</option>
                                  {cities.map(city => (
                                      <option key={city.name} value={city.name}>{city.name}</option>
                                  ))}
                                </select>
                            ) : key === "marital_status" ? (
                                <select
                                    name="marital_status"
                                    className="form-control"
                                    value={value}
                                    onChange={handleChange}
                                >
                                  <option value="">Select Marital Status</option>
                                  <option value="Grihastha">Grihastha</option>
                                  <option value="Bramhachari">Bramhachari</option>
                                  <option value="Not Married">Not Married</option>
                                </select>
                            ) : key === "gender" ? (
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
                            ) : key === "dob" ? (
                                <input
                                    type="date"
                                    name="dob"
                                    className="form-control"
                                    value={value}
                                    onChange={handleChange}
                                    placeholder="Date of Birth"
                                />
                            ) : key === "first_initiation_date" ? (
                                <input
                                    type="date"
                                    name="first_initiation_date"
                                    className="form-control"
                                    value={value}
                                    onChange={handleChange}
                                    placeholder="First Initiation Date"
                                />
                            ) : key === "iskcon_first_contact_date" ? (
                                <input
                                    type="date"
                                    name="iskcon_first_contact_date"
                                    className="form-control"
                                    value={value}
                                    onChange={handleChange}
                                    placeholder="ISKCON First Contact Date"
                                />
                            ) : key === "second_initiation_date" ? (
                                <input
                                    type="date"
                                    name="second_initiation_date"
                                    className="form-control"
                                    value={value}
                                    onChange={handleChange}
                                    placeholder="Second Initiation Date"
                                />
                            ) : key === "second_initiated" || key === "full_time_devotee" ? (
                                <select
                                    name={key}
                                    className="form-control"
                                    value={value}
                                    onChange={handleChange}
                                >
                                  <option value="">Select</option>
                                  <option value="Yes">Yes</option>
                                  <option value="No">No</option>
                                </select>
                            ) : key === "email" ? (
                                <input
                                    type="email"
                                    name="email"
                                    className="form-control"
                                    value={value}
                                    onChange={handleChange}
                                    pattern="^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$"
                                    required
                                    placeholder="Enter a valid email address"
                                />
                            ) : key === "education_qualification_code" ? (
                                        <div className="col-md-4 mb-3" key={key}>
                                          <select
                                              name="education_qualification_code"
                                              className="form-control"
                                              style={{ minWidth: 260, width: "100%" }}
                                              value={value}
                                              onChange={handleChange}
                                          >
                                            <option value="">Select Education Qualification</option>
                                            <option value="10th">10th</option>
                                            <option value="12th">12th</option>
                                            <option value="Graduation">Graduation</option>
                                            <option value="Post Graduation">Post Graduation</option>
                                            <option value="PHD">PHD</option>
                                          </select>
                                        </div>
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
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Facilitator</label>
                    <select
                        name="facilitator_id"
                        className="form-control"
                        value={form.counceller_id || ""}
                        onChange={handleChange}
                    >
                      <option value="">Select Facilitator</option>
                      {facilitator.map(c => (
                          <option key={c.user_id} value={c.user_id}>
                            {c.initiated_name}
                          </option>
                      ))}
                    </select>
                  </div>
                </div>
                <button className="btn btn-info" type="submit">
                  {editingId ? "Update" : "Add"} Devotee
                </button>
              </form>
            </div>

            <div className="table-responsive">
              <table className="table table-striped table-bordered">
                <thead>
                <tr>
                  <th>ID</th>
                  {Object.keys(form).map((key) => (
                      <th key={key}>{key.replace(/_/g, " ")}</th>
                  ))}
                  <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {currentItems.map((d) => (
                    <tr key={d.id}>
                      <td>{d.id}</td>
                      {Object.keys(form).map((key) => (
                          <td key={key}>
                            {key === "photo" && d[key] ? (
                                (() => {
                                  const imgPath = `${API_BASE}${d[key]}`;
                                  console.log("Image path:", imgPath);
                                  return (
                                      <img
                                          src={imgPath}
                                          alt="Devotee"
                                          width="50"
                                          style={{ cursor: "pointer" }}
                                          onClick={() => openModal(imgPath)}
                                      />
                                  );
                                })()
                            ) : key === "dob" && d[key] ? (
                                (() => {
                                  const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
                                  const date = new Date(d[key]);
                                  if (isNaN(date)) return d[key];
                                  const day = String(date.getDate()).padStart(2, '0');
                                  const month = monthNames[date.getMonth()];
                                  const year = date.getFullYear();
                                  return `${day}-${month}-${year}`;
                                })()
                            ) : (
                                d[key]
                            )}
                          </td>
                      ))}
                      <td>
                        <button className="btn btn-success btn-sm me-2" onClick={() => handleEdit(d)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(d.id)}>Delete</button>
                      </td>
                    </tr>
                ))}
                </tbody>
              </table>
            </div>

            <div className="d-flex justify-content-center mt-3">
              {pageNumbers.map(number => (
                  <button
                      key={number}
                      onClick={() => setCurrentPage(number)}
                      className={`btn btn-sm mx-1 ${number === currentPage ? 'btn-primary' : 'btn-outline-primary'}`}
                  >
                    {number}
                  </button>
              ))}
            </div>
          </div>
        </div>

        {modalIsOpen && (
            <div className="Overlay" onClick={closeModal}>
              <div className="Modal" onClick={e => e.stopPropagation()}>
                <button className="close-button" onClick={closeModal}>×</button>
                <img src={modalImage} alt="Profile" />
              </div>
            </div>
        )}
      </div>
  );
}
