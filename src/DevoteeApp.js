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
  const [form, setForm] = useState({
    first_name: "", middle_name: "", last_name: "", gender: "", dob: "", ethnicity: "", citizenship: "",
    marital_status: "", education_qualification_code: "", address1: "", address2: "", pin_code: "",
    email: "", mobile_no: "", whatsapp_no: "", initiated_name: "", photo: null, spiritual_master_id: "",
    first_initiation_date: "", iskcon_first_contact_date: "", second_initiated: "", second_initiation_date: "",
    full_time_devotee: "", temple_name: "", status: ""
  });

  const excludedFields = ["id", "created_at"];
  const [editingId, setEditingId] = useState(null);
  const token = localStorage.getItem("token");

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalImage, setModalImage] = useState("");

  const openModal = (imgUrl) => {
    setModalImage(imgUrl);
    setModalIsOpen(true);
  };

  const closeModal = () => setModalIsOpen(false);

  useEffect(() => {
    fetchDevotees();
  }, []);

  const fetchDevotees = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/devotees`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDevotees(res.data);
    } catch (err) {
      console.error("❌ Error fetching devotees:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm({
      ...form,
      [name]: name === "photo" ? files[0] : value,
    });
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

  const filteredDevotees = devotees.filter(d =>
      Object.values(d).some(val =>
          val && val.toString().toLowerCase().includes(filter.toLowerCase())
      )
  );

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

            <input
                type="text"
                className="form-control mb-3"
                placeholder="Search..."
                value={filter}
                onChange={handleFilterChange}
            />

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
                                <img
                                    src={`${API_BASE}${d[key]}`}
                                    alt="Devotee"
                                    width="50"
                                    style={{ cursor: "pointer" }}
                                    onDoubleClick={() => openModal(`${API_BASE}${d[key]}`)}
                                />
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
