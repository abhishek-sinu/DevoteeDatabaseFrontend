import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_BASE;

export default function PublicDevoteeEntry() {
  const [form, setForm] = useState({
    first_name: "", middle_name: "", last_name: "", gender: "", dob: "", ethnicity: "", citizenship: "",
    marital_status: "", education_qualification_code: "", address1: "", address2: "", pin_code: "",
    email: "", mobile_no: "", whatsapp_no: "", initiated_name: "", photo: null, spiritual_master_id: "",
    first_initiation_date: "", iskcon_first_contact_date: "", second_initiated: "", second_initiation_date: "",
    full_time_devotee: "", temple_name: "", status: "", facilitator_id: ""
  });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  useEffect(() => { fetchCountries(); }, []);
  useEffect(() => { if (form.citizenship) fetchStates(form.citizenship); }, [form.citizenship]);
  useEffect(() => { if (form.address1 && form.citizenship) fetchCities(form.citizenship, form.address1); }, [form.address1]);

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
  const fetchStates = async (countryCode) => {
    try {
      const res = await axios.get(`https://api.countrystatecity.in/v1/countries/${countryCode}/states`, {
        headers: { "X-CSCAPI-KEY": "M2JyaVR4b1E5aFR2ckJURGtmUUNMc0JaSldRamRaaDJDSFppWkp5aA==" }
      });
      setStates(res.data);
    } catch (err) { console.error(err); }
  };
  const fetchCities = async (countryCode, stateCode) => {
    try {
      const res = await axios.get(`https://api.countrystatecity.in/v1/countries/${countryCode}/states/${stateCode}/cities`, {
        headers: { "X-CSCAPI-KEY": "M2JyaVR4b1E5aFR2ckJURGtmUUNMc0JaSldRamRaaDJDSFppWkp5aA==" }
      });
      setCities(res.data);
    } catch (err) { console.error(err); }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm(prev => ({ ...prev, [name]: name === 'photo' ? files[0] : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");
    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (k === 'photo') {
        if (v instanceof File) formData.append(k, v);
      } else {
        formData.append(k, v || '');
      }
    });

    try {
      // public endpoint that will save to XLS on server
      await axios.post(`${API_BASE}/api/devotees/public`, formData, { headers: { "Content-Type": "multipart/form-data" } });
      setSuccessMsg('Thank you. Your details have been submitted successfully.');
      setForm({
        first_name: "", middle_name: "", last_name: "", gender: "", dob: "", ethnicity: "", citizenship: "",
        marital_status: "", education_qualification_code: "", address1: "", address2: "", pin_code: "",
        email: "", mobile_no: "", whatsapp_no: "", initiated_name: "", photo: null, spiritual_master_id: "",
        first_initiation_date: "", iskcon_first_contact_date: "", second_initiated: "", second_initiation_date: "",
        full_time_devotee: "", temple_name: "", status: "", facilitator_id: ""
      });
    } catch (err) {
      console.error('Submit error', err);
      setErrorMsg((err.response && err.response.data && err.response.data.error) ? err.response.data.error : 'Submission failed. Please try again later.');
    }
    setLoading(false);
  };

  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-header bg-primary text-white">Devotee Self Registration</div>
        <div className="card-body">
          {successMsg && <div className="alert alert-success">{successMsg}</div>}
          {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-4 mb-3">
                <label>First Name</label>
                <input name="first_name" className="form-control" value={form.first_name} onChange={handleChange} required />
              </div>
              <div className="col-md-4 mb-3">
                <label>Middle Name</label>
                <input name="middle_name" className="form-control" value={form.middle_name} onChange={handleChange} />
              </div>
              <div className="col-md-4 mb-3">
                <label>Last Name</label>
                <input name="last_name" className="form-control" value={form.last_name} onChange={handleChange} />
              </div>

              <div className="col-md-4 mb-3">
                <label>Gender</label>
                <select name="gender" className="form-control" value={form.gender} onChange={handleChange}>
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="col-md-4 mb-3">
                <label>Date of Birth</label>
                <input type="date" name="dob" className="form-control" value={form.dob} onChange={handleChange} />
              </div>

              <div className="col-md-4 mb-3">
                <label>Citizenship (Country)</label>
                <select name="citizenship" className="form-control" value={form.citizenship} onChange={handleChange}>
                  <option value="">Select Country</option>
                  {countries.map(c => <option key={c.iso2} value={c.iso2}>{c.name}</option>)}
                </select>
              </div>

              <div className="col-md-4 mb-3">
                <label>State</label>
                <select name="address1" className="form-control" value={form.address1} onChange={handleChange}>
                  <option value="">Select State</option>
                  {states.map(s => <option key={s.iso2} value={s.iso2}>{s.name}</option>)}
                </select>
              </div>

              <div className="col-md-4 mb-3">
                <label>City</label>
                <select name="address2" className="form-control" value={form.address2} onChange={handleChange}>
                  <option value="">Select City</option>
                  {cities.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                </select>
              </div>

              <div className="col-md-4 mb-3">
                <label>Email</label>
                <input type="email" name="email" className="form-control" value={form.email} onChange={handleChange} required />
              </div>

              <div className="col-md-4 mb-3">
                <label>Mobile No</label>
                <input name="mobile_no" className="form-control" value={form.mobile_no} onChange={handleChange} />
              </div>

              <div className="col-md-4 mb-3">
                <label>Whatsapp No</label>
                <input name="whatsapp_no" className="form-control" value={form.whatsapp_no} onChange={handleChange} />
              </div>

              <div className="col-md-4 mb-3">
                <label>Photo (optional)</label>
                <input type="file" name="photo" accept="image/*" className="form-control" onChange={handleChange} />
              </div>

              <div className="col-md-4 mb-3">
                <label>ISKCON First Contact Date</label>
                <input
                    type="date"
                    name="iskcon_first_contact_date"
                    className="form-control"
                    value={form.iskcon_first_contact_date}
                    onChange={handleChange}
                />
              </div>

              <div className="col-md-4 mb-3">
                <label>Marital Status</label>
                <select
                    name="marital_status"
                    className="form-control"
                    value={form.marital_status}
                    onChange={handleChange}
                >
                  <option value="">Select Marital Status</option>
                  <option value="Grihastha">Grihastha</option>
                  <option value="Bramhachari">Bramhachari</option>
                  <option value="Not Married">Not Married</option>
                </select>
              </div>

              <div className="col-md-4 mb-3">
                <label>Temple Name</label>
                <input name="temple_name" className="form-control" value={form.temple_name} onChange={handleChange} />
              </div>

              <div className="col-md-12 text-end">
                <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? 'Submitting...' : 'Submit'}</button>
              </div>
            </div>
          </form>
        </div>
      </div>
      <div className="text-center mt-3">
        <small>Fields you provide will be stored and processed by the temple administration.</small>
      </div>
    </div>
  );
}

