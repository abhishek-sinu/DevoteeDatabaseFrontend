import React, { useEffect, useState } from 'react';
import axios from 'axios';

const DownloadViewSadhanaCard = () => {
    const [email, setEmail] = useState('');
    const [entries, setEntries] = useState([]);

    useEffect(() => {
        const storedEmail = localStorage.getItem('userId');
        if (storedEmail) {
            setEmail(storedEmail);
            fetchEntries(storedEmail);
        } else {
            alert('User email not found in local storage.');
        }
    }, []);

    const fetchEntries = async (email) => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_BASE}/api/sadhana/entries/${email}`);
            setEntries(response.data);
        } catch (error) {
            console.error('Error fetching sadhana entries:', error);
        }
    };

    const downloadCSV = () => {
        const csvContent = [
            ['Date', 'Wake-up Time', 'Chanting Rounds', 'Reading Time', 'Reading Topic', 'Hearing Time', 'Hearing Topic', 'Service Name', 'Service Time'],
            ...entries.map(entry => [
                entry.entry_date,
                entry.wake_up_time,
                entry.chanting_rounds,
                entry.reading_time,
                entry.reading_topic,
                entry.hearing_time,
                entry.hearing_topic,
                entry.service_name,
                entry.service_time
            ])
        ].map(e => e.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', 'sadhana_entries.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="container mt-4">
            <h4 className="text-center mb-3">Your Sadhana Entries</h4>
            <button className="btn btn-primary mb-3" onClick={downloadCSV}>Download CSV</button>
            <div className="table-responsive">
                <table className="table table-bordered table-striped">
                    <thead className="table-dark">
                    <tr>
                        <th>Date</th>
                        <th>Wake-up Time</th>
                        <th>Chanting Rounds</th>
                        <th>Reading Time</th>
                        <th>Reading Topic</th>
                        <th>Hearing Time</th>
                        <th>Hearing Topic</th>
                        <th>Service Name</th>
                        <th>Service Time</th>
                    </tr>
                    </thead>
                    <tbody>
                    {entries.map((entry, index) => (
                        <tr key={index}>
                            <td>{entry.entry_date ? entry.entry_date.split('T')[0] : ''}</td>
                            <td>{entry.wake_up_time}</td>
                            <td>{entry.chanting_rounds}</td>
                            <td>{entry.reading_time}</td>
                            <td>{entry.reading_topic}</td>
                            <td>{entry.hearing_time}</td>
                            <td>{entry.hearing_topic}</td>
                            <td>{entry.service_name}</td>
                            <td>{entry.service_time}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DownloadViewSadhanaCard;
