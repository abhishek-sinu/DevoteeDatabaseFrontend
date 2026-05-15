import React, { useState, useEffect } from 'react';
import './PasswordManager.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import axios from 'axios';

const API_URL = `${process.env.REACT_APP_API_BASE || ''}/api/passwords`;

const PasswordManager = () => {
  const [passwords, setPasswords] = useState([]); // Stores encrypted passwords
  const [formData, setFormData] = useState({
    service: '',
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState({}); // Tracks visibility of passwords
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchPasswords();
  }, []);

  const fetchPasswords = async () => {
    try {
      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setPasswords(response.data);
    } catch (error) {
      console.error('Error fetching passwords:', error);
      alert('Failed to fetch passwords. Please try again.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddPassword = async () => {
    try {
      const response = await axios.post(
        API_URL,
        {
          service_name: formData.service,
          username: formData.username,
          password: formData.password,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      setPasswords([...passwords, response.data]);
      setFormData({ service: '', username: '', password: '' });
    } catch (error) {
      console.error('Error adding password:', error);
      alert('Failed to add password. Please try again.');
    }
  };

  const toggleShowPassword = (id) => {
    setShowPassword((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyText = async (text, label) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      alert(`${label} copied`);
    } catch (error) {
      console.error(`Error copying ${label}:`, error);
      alert(`Failed to copy ${label}.`);
    }
  };

  const handleDeletePassword = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setPasswords(passwords.filter((item) => item.id !== id));
    } catch (error) {
      console.error('Error deleting password:', error);
      alert('Failed to delete password. Please try again.');
    }
  };

  // Filtered passwords by search
  const filteredPasswords = passwords.filter(
    (item) =>
      item.service_name.toLowerCase().includes(search.toLowerCase()) ||
      item.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="password-manager">
      <div className="pm-header">
        <h1>Password Manager</h1>
        <p>Securely save and quickly access your important credentials.</p>
      </div>

      <div className="pm-grid">
        <section className="pm-panel pm-form-panel">
          <div className="pm-panel-header">
            <h2>Add New Password</h2>
          </div>
          <div className="password-form">
            <div className="pm-row-fields">
              <input
                type="text"
                name="service"
                placeholder="Service Name"
                value={formData.service}
                onChange={handleInputChange}
              />
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleInputChange}
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
              />
            </div>
            <button onClick={handleAddPassword}>Save Password</button>
          </div>

          <div className="password-security-note">
            Your passwords are encrypted before storage. Keep all account credentials in one protected place.
          </div>
        </section>

        <section className="pm-panel pm-list-panel">
          <div className="pm-panel-header pm-list-header-search">
            <h2>Saved Passwords</h2>
            <span className="pm-count">{filteredPasswords.length}</span>
          </div>
          <div className="pm-search-row">
            <input
              className="pm-search-input"
              type="text"
              placeholder="Search by service or username..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoComplete="off"
            />
          </div>
          <div className="password-list">
            {filteredPasswords.length === 0 && (
              <div className="pm-empty-state">No passwords found. Try a different search or add a new entry.</div>
            )}

            {filteredPasswords.map((item) => (
              <div key={item.id} className="password-item">
                <div className="pm-item-main">
                  <p><strong>Service:</strong> {item.service_name}</p>
                  <p><strong>Username:</strong> {item.username}</p>
                  <p>
                    <strong>Password:</strong>
                    <span className="pm-password-text">
                      {showPassword[item.id] ? (item.decrypted_password || 'Unavailable') : '********'}
                    </span>
                    <span className="pm-eye-btn" onClick={() => toggleShowPassword(item.id)}>
                      {showPassword[item.id] ? <FaEyeSlash /> : <FaEye />}
                    </span>
                  </p>
                </div>
                <div className="pm-item-actions">
                  <button className="pm-action-btn" onClick={() => copyText(item.username, 'Username')}>Copy Username</button>
                  <button className="pm-action-btn" onClick={() => copyText(item.decrypted_password, 'Password')}>Copy Password</button>
                  <button className="pm-delete-btn" onClick={() => handleDeletePassword(item.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default PasswordManager;