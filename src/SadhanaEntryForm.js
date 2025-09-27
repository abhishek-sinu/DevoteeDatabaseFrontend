import React, { useState, useEffect } from 'react';
import axios from 'axios';


const SadhanaEntryForm = () => {
    const [email, setEmail] = useState('');
    const [formData, setFormData] = useState({
        entryDate: '',
        wakeUpTime: '',
        chantingRounds: '',
        readingTime: '',
        readingTimeUnit: 'minutes',
        readingTopic: '',
        hearingTime: '',
        hearingTimeUnit: 'minutes',
        hearingTopic: '',
        serviceName: '',
        serviceTime: '',
        serviceTimeUnit: 'minutes'
    });

    useEffect(() => {
        const storedEmail = localStorage.getItem('userId');
        if (storedEmail) {
            setEmail(storedEmail);
        } else {
            alert('User email not found in local storage.');
        }
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const API_BASE = process.env.REACT_APP_API_BASE;

        const convertToMinutes = (value, unit) => {
            const num = parseInt(value);
            if (isNaN(num)) return null;
            return unit === 'hours' ? num * 60 : num;
        };

        const cleanedData = {
            email,
            entryDate: formData.entryDate,
            wakeUpTime: formData.wakeUpTime,
            chantingRounds: formData.chantingRounds,
            readingTime: convertToMinutes(formData.readingTime, formData.readingTimeUnit),
            readingTopic: formData.readingTopic,
            hearingTime: convertToMinutes(formData.hearingTime, formData.hearingTimeUnit),
            hearingTopic: formData.hearingTopic,
            serviceName: formData.serviceName,
            serviceTime: convertToMinutes(formData.serviceTime, formData.serviceTimeUnit)
        };

        console.log("Sending to backend:", cleanedData);

        try {
            await axios.post(`${API_BASE}/api/sadhana/add`, cleanedData);
            alert('Sadhana entry submitted!');
            setFormData({
                entryDate: '',
                wakeUpTime: '',
                chantingRounds: '',
                readingTime: '',
                readingTimeUnit: 'minutes',
                readingTopic: '',
                hearingTime: '',
                hearingTimeUnit: 'minutes',
                hearingTopic: '',
                serviceName: '',
                serviceTime: '',
                serviceTimeUnit: 'minutes'
            });
        } catch (err) {
            alert('Error submitting entry');
            console.error(err);
        }
    };

    return (
        <div className="container">
            <div className="card bg-light shadow mb-4">
                <div className="card-header bg-info text-white text-center">
                    <h4>Enter Your Daily Sadhana</h4>
                </div>
                <div className="card-body">
                    <form onSubmit={handleSubmit} className="row g-3">
                        <div className="col-md-4">
                            <label className="form-label">Date</label>
                            <input type="date" name="entryDate" value={formData.entryDate} onChange={handleChange} className="form-control" required />
                        </div>
                        <div className="col-md-4">
                            <label className="form-label">Wake-up Time</label>
                            <input type="time" name="wakeUpTime" value={formData.wakeUpTime} onChange={handleChange} className="form-control" />
                        </div>
                        <div className="col-md-4">
                            <label className="form-label">Chanting Rounds</label>
                            <input type="number" name="chantingRounds" value={formData.chantingRounds} onChange={handleChange} className="form-control" />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Reading Topic</label>
                            <input type="text" name="readingTopic" value={formData.readingTopic} onChange={handleChange} className="form-control" />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Reading Time</label>

                            <input
                                type="number"
                                name="readingTime"
                                id="readingTime"
                                className="form-control"
                                value={formData.readingTime}
                                onChange={handleChange}
                            />
                            <select
                                name="readingTimeUnit"
                                className="form-control"
                                value={formData.readingTimeUnit}
                                onChange={handleChange}
                            >
                                <option value="minutes">Minutes</option>
                                <option value="hours">Hours</option>
                            </select>
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Hearing Topic</label>
                            <input type="text" name="hearingTopic" value={formData.hearingTopic} onChange={handleChange} className="form-control" />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Hearing Time</label>
                            <input
                                type="number"
                                name="hearingTime"
                                id="hearingTime"
                                className="form-control"
                                value={formData.hearingTime}
                                onChange={handleChange}
                            />
                            <select
                                name="hearingTimeUnit"
                                className="form-control"
                                value={formData.hearingTimeUnit}
                                onChange={handleChange}
                            >
                                <option value="minutes">Minutes</option>
                                <option value="hours">Hours</option>
                            </select>
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Service Name</label>
                            <input type="text" name="serviceName" value={formData.serviceName} onChange={handleChange} className="form-control" />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Service Time</label>
                            <input
                                type="number"
                                name="serviceTime"
                                id="serviceTime"
                                className="form-control"
                                value={formData.serviceTime}
                                onChange={handleChange}
                            />
                            <select
                                name="serviceTimeUnit"
                                className="form-control"
                                value={formData.serviceTimeUnit}
                                onChange={handleChange}
                            >
                                <option value="minutes">Minutes</option>
                                <option value="hours">Hours</option>
                            </select>
                        </div>
                        <div className="col-12 text-center">
                            <button type="submit" className="btn btn-success">
                                <i className="bi bi-check-circle"></i> Submit Sadhana
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SadhanaEntryForm;
