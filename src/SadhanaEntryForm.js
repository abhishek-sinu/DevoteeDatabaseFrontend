import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CustomToast.css';


const SadhanaEntryForm = () => {
    const [email, setEmail] = useState('');
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [templateFields, setTemplateFields] = useState(null);
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
        serviceTimeUnit: 'minutes',
        // Optional fields
        sleepingTime: '',
        chantingBefore700: false,
        chantingBefore730: false,
        attendedMangalArati: false,
        attendedBhagavatamClass: false,
        bookDistribution: '',
        prasadamHonored: false,
        ekadashiFollowed: false,
        japaQuality: ''
    });

    useEffect(() => {
        const storedEmail = localStorage.getItem('userId');
        if (storedEmail) {
            setEmail(storedEmail);
            loadUserTemplate(storedEmail);
        } else {
            setToast({ show: true, message: 'User email not found in local storage.', type: 'error' });
        }
    }, []);

    const loadUserTemplate = async (userEmail) => {
        try {
            const API_BASE = process.env.REACT_APP_API_BASE;
            const response = await axios.get(`${API_BASE}/api/sadhana/template/${encodeURIComponent(userEmail)}`);
            console.log('Loaded template:', response.data);
            setTemplateFields(response.data);
        } catch (err) {
            console.error('Error loading template:', err);
            // Set default template (all core fields enabled, optional disabled)
            setTemplateFields({
                entry_date: true,
                wake_up_time: true,
                chanting_rounds: true,
                reading_time: true,
                reading_topic: true,
                hearing_time: true,
                hearing_topic: true,
                service_name: true,
                service_time: true,
                sleeping_time: false,
                chanting_before_700: false,
                chanting_before_730: false,
                attended_mangal_arati: false,
                attended_bhagavatam_class: false,
                book_distribution: false,
                prasadam_honored: false,
                ekadashi_followed: false,
                japa_quality: false
            });
        }
    };

    // Toast auto-hide
    useEffect(() => {
        if (toast.show) {
            const timer = setTimeout(() => setToast(t => ({ ...t, show: false })), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast.show]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const API_BASE = process.env.REACT_APP_API_BASE;

        const convertToMinutes = (value, unit) => {
            if (!value || value === '') return null;
            const num = parseInt(value);
            if (isNaN(num)) return null;
            return unit === 'hours' ? num * 60 : num;
        };

        const cleanedData = {
            email,
            entryDate: formData.entryDate || null,
            wakeUpTime: formData.wakeUpTime || null,
            chantingRounds: formData.chantingRounds ? parseInt(formData.chantingRounds) : null,
            readingTime: convertToMinutes(formData.readingTime, formData.readingTimeUnit),
            readingTopic: formData.readingTopic || null,
            hearingTime: convertToMinutes(formData.hearingTime, formData.hearingTimeUnit),
            hearingTopic: formData.hearingTopic || null,
            serviceName: formData.serviceName || null,
            serviceTime: convertToMinutes(formData.serviceTime, formData.serviceTimeUnit),
            // Optional fields - only include if enabled in template
            sleepingTime: templateFields?.sleeping_time ? (formData.sleepingTime || null) : null,
            chantingBefore700: templateFields?.chanting_before_700 ? formData.chantingBefore700 : null,
            chantingBefore730: templateFields?.chanting_before_730 ? formData.chantingBefore730 : null,
            attendedMangalArati: templateFields?.attended_mangal_arati ? formData.attendedMangalArati : null,
            attendedBhagavatamClass: templateFields?.attended_bhagavatam_class ? formData.attendedBhagavatamClass : null,
            bookDistribution: templateFields?.book_distribution ? (formData.bookDistribution ? parseInt(formData.bookDistribution) : null) : null,
            prasadamHonored: templateFields?.prasadam_honored ? formData.prasadamHonored : null,
            ekadashiFollowed: templateFields?.ekadashi_followed ? formData.ekadashiFollowed : null,
            japaQuality: templateFields?.japa_quality ? (formData.japaQuality ? parseInt(formData.japaQuality) : null) : null
        };

        console.log("Sending to backend:", cleanedData);

        try {
            await axios.post(`${API_BASE}/api/sadhana/add`, cleanedData);
            setToast({ show: true, message: 'Sadhana entry submitted!', type: 'success' });
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
                serviceTimeUnit: 'minutes',
                sleepingTime: '',
                chantingBefore700: false,
                chantingBefore730: false,
                attendedMangalArati: false,
                attendedBhagavatamClass: false,
                bookDistribution: '',
                prasadamHonored: false,
                ekadashiFollowed: false,
                japaQuality: ''
            });
        } catch (err) {
            setToast({ show: true, message: 'Error submitting entry', type: 'error' });
            console.error(err);
        }
    };

    return (
        <div className="container">
            {/* Custom Toast */}
            <div className={`custom-toast${toast.show ? ' show' : ''} ${toast.type}`} role="alert" style={{ pointerEvents: toast.show ? 'auto' : 'none' }}>
                <span>{toast.message}</span>
                <button className="toast-close" onClick={() => setToast(t => ({ ...t, show: false }))} aria-label="Close">&times;</button>
            </div>

            {!templateFields ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading template...</span>
                    </div>
                </div>
            ) : (
                <div className="card bg-light shadow mb-4">
                    <div className="card-header bg-info text-white text-center">
                        <h4>Enter Your Daily Sadhana</h4>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit} className="row g-3">
                            {/* Date - Always Required */}
                            {templateFields.entry_date && (
                                <div className="col-md-4">
                                    <label className="form-label">Date</label>
                                    <input type="date" name="entryDate" value={formData.entryDate} onChange={handleChange} className="form-control" required />
                                </div>
                            )}
                            
                            {/* Wake-up Time */}
                            {templateFields.wake_up_time && (
                                <div className="col-md-4">
                                    <label className="form-label">Wake-up Time</label>
                                    <input type="time" name="wakeUpTime" value={formData.wakeUpTime} onChange={handleChange} className="form-control" />
                                </div>
                            )}
                            
                            {/* Sleeping Time - Optional */}
                            {templateFields.sleeping_time && (
                                <div className="col-md-4">
                                    <label className="form-label">Sleeping Time</label>
                                    <input type="time" name="sleepingTime" value={formData.sleepingTime} onChange={handleChange} className="form-control" />
                                </div>
                            )}
                            
                            {/* Chanting Rounds */}
                            {templateFields.chanting_rounds && (
                                <div className="col-md-4">
                                    <label className="form-label">Chanting Rounds</label>
                                    <input type="number" name="chantingRounds" value={formData.chantingRounds} onChange={handleChange} className="form-control" />
                                </div>
                            )}
                            
                            {/* Chanting Before 7:00 AM - Optional */}
                            {templateFields.chanting_before_700 && (
                                <div className="col-md-4">
                                    <label className="form-label d-block">Chanting Status</label>
                                    <div className="form-check">
                                        <input 
                                            type="checkbox" 
                                            name="chantingBefore700" 
                                            checked={formData.chantingBefore700} 
                                            onChange={(e) => setFormData({ ...formData, chantingBefore700: e.target.checked })} 
                                            className="form-check-input" 
                                            id="chantingBefore700"
                                        />
                                        <label className="form-check-label" htmlFor="chantingBefore700">
                                            Chanting Before 7:00 AM
                                        </label>
                                    </div>
                                </div>
                            )}
                            
                            {/* Chanting Before 7:30 AM - Optional */}
                            {templateFields.chanting_before_730 && (
                                <div className="col-md-4">
                                    <label className="form-label d-block">Chanting Status</label>
                                    <div className="form-check">
                                        <input 
                                            type="checkbox" 
                                            name="chantingBefore730" 
                                            checked={formData.chantingBefore730} 
                                            onChange={(e) => setFormData({ ...formData, chantingBefore730: e.target.checked })} 
                                            className="form-check-input" 
                                            id="chantingBefore730"
                                        />
                                        <label className="form-check-label" htmlFor="chantingBefore730">
                                            Chanting Before 7:30 AM
                                        </label>
                                    </div>
                                </div>
                            )}
                            
                            {/* Attended Mangal Arati - Optional */}
                            {templateFields.attended_mangal_arati && (
                                <div className="col-md-4">
                                    <label className="form-label d-block">Program Attendance</label>
                                    <div className="form-check">
                                        <input 
                                            type="checkbox" 
                                            name="attendedMangalArati" 
                                            checked={formData.attendedMangalArati} 
                                            onChange={(e) => setFormData({ ...formData, attendedMangalArati: e.target.checked })} 
                                            className="form-check-input" 
                                            id="attendedMangalArati"
                                        />
                                        <label className="form-check-label" htmlFor="attendedMangalArati">
                                            Attended Mangal Arati
                                        </label>
                                    </div>
                                </div>
                            )}
                            
                            {/* Attended Bhagavatam Class - Optional */}
                            {templateFields.attended_bhagavatam_class && (
                                <div className="col-md-4">
                                    <label className="form-label d-block">Program Attendance</label>
                                    <div className="form-check">
                                        <input 
                                            type="checkbox" 
                                            name="attendedBhagavatamClass" 
                                            checked={formData.attendedBhagavatamClass} 
                                            onChange={(e) => setFormData({ ...formData, attendedBhagavatamClass: e.target.checked })} 
                                            className="form-check-input" 
                                            id="attendedBhagavatamClass"
                                        />
                                        <label className="form-check-label" htmlFor="attendedBhagavatamClass">
                                            Attended Bhagavatam Class
                                        </label>
                                    </div>
                                </div>
                            )}
                            
                            {/* Reading Topic */}
                            {templateFields.reading_topic && (
                                <div className="col-md-6">
                                    <label className="form-label">Reading Topic</label>
                                    <input type="text" name="readingTopic" value={formData.readingTopic} onChange={handleChange} className="form-control" />
                                </div>
                            )}
                            
                            {/* Reading Time */}
                            {templateFields.reading_time && (
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
                            )}
                            
                            {/* Hearing Topic */}
                            {templateFields.hearing_topic && (
                                <div className="col-md-6">
                                    <label className="form-label">Hearing Topic</label>
                                    <input type="text" name="hearingTopic" value={formData.hearingTopic} onChange={handleChange} className="form-control" />
                                </div>
                            )}
                            
                            {/* Hearing Time */}
                            {templateFields.hearing_time && (
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
                            )}
                            
                            {/* Service Name */}
                            {templateFields.service_name && (
                                <div className="col-md-6">
                                    <label className="form-label">Service Name</label>
                                    <input type="text" name="serviceName" value={formData.serviceName} onChange={handleChange} className="form-control" />
                                </div>
                            )}
                            
                            {/* Service Time */}
                            {templateFields.service_time && (
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
                            )}
                            
                            {/* Book Distribution - Optional */}
                            {templateFields.book_distribution && (
                                <div className="col-md-4">
                                    <label className="form-label">Book Distribution (Books)</label>
                                    <input type="number" name="bookDistribution" value={formData.bookDistribution} onChange={handleChange} className="form-control" />
                                </div>
                            )}
                            
                            {/* Prasadam Honored - Optional */}
                            {templateFields.prasadam_honored && (
                                <div className="col-md-4">
                                    <label className="form-label d-block">Prasadam</label>
                                    <div className="form-check">
                                        <input 
                                            type="checkbox" 
                                            name="prasadamHonored" 
                                            checked={formData.prasadamHonored} 
                                            onChange={(e) => setFormData({ ...formData, prasadamHonored: e.target.checked })} 
                                            className="form-check-input" 
                                            id="prasadamHonored"
                                        />
                                        <label className="form-check-label" htmlFor="prasadamHonored">
                                            Prasadam Honored
                                        </label>
                                    </div>
                                </div>
                            )}
                            
                            {/* Ekadashi Followed - Optional */}
                            {templateFields.ekadashi_followed && (
                                <div className="col-md-4">
                                    <label className="form-label d-block">Fasting</label>
                                    <div className="form-check">
                                        <input 
                                            type="checkbox" 
                                            name="ekadashiFollowed" 
                                            checked={formData.ekadashiFollowed} 
                                            onChange={(e) => setFormData({ ...formData, ekadashiFollowed: e.target.checked })} 
                                            className="form-check-input" 
                                            id="ekadashiFollowed"
                                        />
                                        <label className="form-check-label" htmlFor="ekadashiFollowed">
                                            Ekadashi Followed
                                        </label>
                                    </div>
                                </div>
                            )}
                            
                            {/* Japa Quality - Optional */}
                            {templateFields.japa_quality && (
                                <div className="col-md-4">
                                    <label className="form-label">Japa Quality (1-10)</label>
                                    <input type="number" name="japaQuality" min="1" max="10" value={formData.japaQuality} onChange={handleChange} className="form-control" />
                                </div>
                            )}
                            
                            <div className="col-12 text-center">
                                <button type="submit" className="btn btn-success">
                                    <i className="bi bi-check-circle"></i> Submit Sadhana
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SadhanaEntryForm;
