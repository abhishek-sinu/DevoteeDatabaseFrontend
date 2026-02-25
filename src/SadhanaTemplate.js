
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CustomToast.css';

// Helper to convert snake_case to camelCase (explicit mapping for known fields)
const snakeToCamel = str => {
    if (str === 'chanting_before_700') return 'chantingBefore700';
    if (str === 'chanting_before_730') return 'chantingBefore730';
    if (str === 'attended_mangal_arati') return 'attendedMangalArati';
    if (str === 'attended_bhagavatam_class') return 'attendedBhagavatamClass';
    if (str === 'book_distribution') return 'bookDistribution';
    if (str === 'prasadam_honored') return 'prasadamHonored';
    if (str === 'ekadashi_followed') return 'ekadashiFollowed';
    if (str === 'japa_quality') return 'japaQuality';
    if (str === 'sleeping_time') return 'sleepingTime';
    if (str === 'service_name') return 'serviceName';
    if (str === 'service_time') return 'serviceTime';
    if (str === 'hearing_topic') return 'hearingTopic';
    if (str === 'hearing_time') return 'hearingTime';
    if (str === 'reading_topic') return 'readingTopic';
    if (str === 'reading_time') return 'readingTime';
    if (str === 'chanting_rounds') return 'chantingRounds';
    if (str === 'wake_up_time') return 'wakeUpTime';
    if (str === 'entry_date') return 'entryDate';
    return str.replace(/([-_][a-z])/g, group =>
        group.toUpperCase().replace('-', '').replace('_', '')
    );
};

const PREDEFINED_TEMPLATES = [
    'ISKCON HYDERABAD',
    'ISKCON BBSR'
];

// Track which template is selected
// ...existing code...

export default function SadhanaTemplate({ devoteeId, email }) {
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    // Handler for predefined template buttons
    const applyPredefinedTemplate = async (templateName) => {
        setSelectedTemplate(templateName);
        setToast({ show: true, message: 'Submit Below Save Template', type: 'success' });
        try {
            const res = await axios.get(`${process.env.REACT_APP_API_BASE}/api/sadhana/predefined-templates`, {
                params: { sadhana_template: templateName }
            });
            // If API returns an array, use the first object
            const templateObj = Array.isArray(res.data) ? res.data[0] : res.data;
            if (templateObj) {
                setTemplateFields(prev => {
                    // Deep clone and update all fields, setting missing ones to false
                    const updated = {};
                    Object.keys(prev).forEach(field => {
                        updated[field] = { ...prev[field] };
                    });
                    // Set all fields (core and optional) based on API response, fallback to false for missing optionals
                    Object.keys(updated).forEach(field => {
                        // Find the snake_case key for this field
                        const camelToSnake = str => {
                            return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
                        };
                        const snakeKey = camelToSnake(field);
                        // If present in API response, use its value, else:
                        if (templateObj.hasOwnProperty(snakeKey)) {
                            updated[field].enabled = !!templateObj[snakeKey];
                        } else if (!updated[field].locked) {
                            updated[field].enabled = false;
                        }
                    });
                    return updated;
                });
            }
        } catch (err) {
            setToast({ show: true, message: 'Failed to load predefined template.', type: 'error' });
        }
    };
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [templateFields, setTemplateFields] = useState({
        // Core fields (always enabled, cannot be disabled)
        entryDate: { enabled: true, locked: true, label: 'Entry Date' },
        wakeUpTime: { enabled: true, locked: true, label: 'Wake-up Time' },
        chantingRounds: { enabled: true, locked: true, label: 'Chanting Rounds' },
        readingTime: { enabled: true, locked: true, label: 'Reading Time' },
        readingTopic: { enabled: true, locked: true, label: 'Reading Topic' },
        hearingTime: { enabled: true, locked: true, label: 'Hearing Time' },
        hearingTopic: { enabled: true, locked: true, label: 'Hearing Topic' },
        serviceName: { enabled: true, locked: true, label: 'Service Name' },
        serviceTime: { enabled: true, locked: true, label: 'Service Time' },
        
        // Optional/Custom fields
        sleepingTime: { enabled: false, locked: false, label: 'Sleeping Time' },
        chantingBefore700: { enabled: false, locked: false, label: 'Chanting Before 7:00 AM' },
        chantingBefore730: { enabled: false, locked: false, label: 'Chanting Before 7:30 AM' },
        attendedMangalArati: { enabled: false, locked: false, label: 'Attended Mangal Arati' },
        attendedBhagavatamClass: { enabled: false, locked: false, label: 'Attended Bhagavatam Class' },
        bookDistribution: { enabled: false, locked: false, label: 'Book Distribution (Books)' },
        prasadamHonored: { enabled: false, locked: false, label: 'Prasadam Honored' },
        ekadashiFollowed: { enabled: false, locked: false, label: 'Ekadashi Followed' },
        japaQuality: { enabled: false, locked: false, label: 'Japa Quality (1-10)' },
    });

    // Toast auto-hide
    useEffect(() => {
        if (toast.show) {
            const timer = setTimeout(() => setToast(t => ({ ...t, show: false })), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast.show]);

    // Load user's saved template
    useEffect(() => {
        const loadTemplate = async () => {
            try {
                const res = await axios.get(`${process.env.REACT_APP_API_BASE}/api/sadhana/template/${encodeURIComponent(email)}`);
                if (res.data) {
                    // Merge loaded template with default fields
                    setTemplateFields(prev => {
                        const updated = { ...prev };
                        Object.keys(res.data).forEach(key => {
                            const camelKey = snakeToCamel(key);
                            if (updated[camelKey]) {
                                updated[camelKey].enabled = res.data[key];
                            }
                        });
                        return updated;
                    });
                }
            } catch (err) {
                console.log('No saved template found, using defaults');
            }
        };
        if (email) loadTemplate();
    }, [email]);

    const handleToggle = (fieldName) => {
        setTemplateFields(prev => ({
            ...prev,
            [fieldName]: {
                ...prev[fieldName],
                enabled: !prev[fieldName].enabled
            }
        }));
    };

    const handleSave = async () => {
        try {
            console.log('=== handleSave called ===');
            console.log('Incoming email:', email);
            console.log('Incoming devoteeId:', devoteeId);
            console.log('Current templateFields:', templateFields);
            
            const templateData = {
                userEmail: email,
                devoteeId: devoteeId
            };
            
            // Add all template field selections
            Object.keys(templateFields).forEach(key => {
                templateData[key] = templateFields[key].enabled;
            });

            console.log('Saving template for:', email);
            console.log('Complete template data being sent:', JSON.stringify(templateData, null, 2));

            await axios.post(`${process.env.REACT_APP_API_BASE}/api/sadhana/template/${encodeURIComponent(email)}`, templateData);

            setToast({ show: true, message: 'Sadhana template saved successfully!', type: 'success' });
        } catch (err) {
            setToast({ show: true, message: 'Failed to save template. Please try again.', type: 'error' });
            console.error(err);
        }
    };

    const coreFields = Object.entries(templateFields).filter(([, value]) => value.locked);
    const optionalFields = Object.entries(templateFields).filter(([, value]) => !value.locked);

    return (
        <div className="container py-4">
            {/* Custom Toast */}
            <div className={`custom-toast${toast.show ? ' show' : ''} ${toast.type}`} role="alert" style={{ pointerEvents: toast.show ? 'auto' : 'none' }}>
                <span>{toast.message}</span>
                <button className="toast-close" onClick={() => setToast(t => ({ ...t, show: false }))} aria-label="Close">&times;</button>
            </div>

            {/* ...existing code... */}

            <div className="row justify-content-center">
                <div className="col-lg-10">
                    <div className="card shadow-lg border-0 rounded-4">
                        <div className="card-header bg-success text-white rounded-top-4">
                            <h4 className="mb-0">
                                <i className="bi bi-gear-fill me-2"></i>
                                Customize Your Sadhana Template
                            </h4>
                        </div>

                        <div className="card-body bg-light rounded-bottom-4">
                            {/* Predefined Template Buttons (moved inside card, above core fields) */}
                            <div className="mb-4 text-center sadhana-template-btn-group">
                                <span className="me-2 fw-semibold">Predefined Templates:</span>
                                <div className="template-btns-flex">
                                    {PREDEFINED_TEMPLATES.map(name => (
                                        <button
                                            key={name}
                                            className={`btn btn-outline-primary btn-sm mx-1 template-btn${selectedTemplate === name ? ' active' : ''}`}
                                            type="button"
                                            onClick={() => applyPredefinedTemplate(name)}
                                        >
                                            {name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <p className="text-muted mb-4">
                                <i className="bi bi-info-circle me-2"></i>
                                Choose which fields you want to track in your daily sadhana entries. Core fields are required and cannot be disabled.
                            </p>

                            {/* Core Fields */}
                            <div className="mb-4">
                                <h5 className="border-bottom pb-2 mb-3">
                                    <i className="bi bi-lock-fill me-2 text-primary"></i>
                                    Core Fields (Required)
                                </h5>
                                <div className="row g-3">
                                    {coreFields.map(([fieldName, fieldData]) => (
                                        <div key={fieldName} className="col-md-6 col-lg-4">
                                            <div className="form-check p-3 border rounded bg-white shadow-sm">
                                                <input 
                                                    className="form-check-input" 
                                                    type="checkbox" 
                                                    id={fieldName}
                                                    checked={fieldData.enabled}
                                                    disabled={fieldData.locked}
                                                />
                                                <label className="form-check-label ms-2" htmlFor={fieldName}>
                                                    <strong>{fieldData.label}</strong>
                                                    <br />
                                                    <small className="text-muted">Always tracked</small>
                                                </label>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Optional Fields */}
                            <div className="mb-4">
                                <h5 className="border-bottom pb-2 mb-3">
                                    <i className="bi bi-toggles me-2 text-success"></i>
                                    Optional Fields (Customize)
                                </h5>
                                <div className="row g-3">
                                    {optionalFields.map(([fieldName, fieldData]) => (
                                        <div key={fieldName} className="col-md-6 col-lg-4">
                                            <div className={`form-check p-3 border rounded shadow-sm ${fieldData.enabled ? 'bg-success bg-opacity-10 border-success' : 'bg-white'}`}>
                                                <input 
                                                    className="form-check-input" 
                                                    type="checkbox" 
                                                    id={fieldName}
                                                    checked={fieldData.enabled}
                                                    onChange={() => handleToggle(fieldName)}
                                                />
                                                <label className="form-check-label ms-2" htmlFor={fieldName} style={{ cursor: 'pointer' }}>
                                                    <strong>{fieldData.label}</strong>
                                                    <br />
                                                    <small className="text-muted">
                                                        {fieldData.enabled ? 'Will be tracked' : 'Click to enable'}
                                                    </small>
                                                </label>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Save Button */}
                            <div className="text-center mt-4">
                                <button 
                                    className="btn btn-success btn-lg px-5"
                                    onClick={handleSave}
                                >
                                    <i className="bi bi-check-circle-fill me-2"></i>
                                    Save Template
                                </button>
                            </div>

                            {/* Info Box */}
                            <div className="alert alert-info mt-4" role="alert">
                                <h6 className="alert-heading">
                                    <i className="bi bi-lightbulb-fill me-2"></i>
                                    Note:
                                </h6>
                                <ul className="mb-0">
                                    <li>Your template choices will apply to future sadhana entries</li>
                                    <li>Only enabled fields will appear in your entry form</li>
                                    <li>You can change these settings anytime</li>
                                    <li>Core fields are always required for sadhana tracking</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
