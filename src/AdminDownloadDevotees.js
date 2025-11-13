import React, { useState } from 'react';
import axios from 'axios';

export default function AdminDownloadDevotees() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    setError('');
    setSuccess(false);
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No auth token found. Please login again.');
      setLoading(false);
      return;
    }
    try {
      const url = `${process.env.REACT_APP_API_BASE}/api/download/devotees-xlsx`;
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
        validateStatus: s => s >= 200 && s < 500 // allow us to inspect 4xx JSON
      });

      const contentType = response.headers['content-type'] || '';
      if (!response || response.status !== 200) {
        // Try to parse JSON error message
        if (contentType.includes('application/json')) {
          const reader = new FileReader();
          reader.onload = () => {
            try {
              const json = JSON.parse(reader.result);
              setError(json.message || 'Download failed.');
            } catch {
              setError('Download failed (invalid response).');
            }
          };
          reader.readAsText(response.data);
        } else {
          setError(`Download failed with status ${response.status}`);
        }
        setLoading(false);
        return;
      }

      if (!contentType.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')) {
        setError('Server did not return a valid .xlsx file.');
        setLoading(false);
        return;
      }

      const blob = new Blob([response.data], { type: contentType });
      const objectUrl = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = objectUrl;
      anchor.download = 'devotees.xlsx';
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(objectUrl);
      setSuccess(true);
    } catch (e) {
      setError(e.message || 'Unexpected error during download');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <h2>Download Public Devotee Entries (Admin Only)</h2>
      <p className="text-muted mb-3">Click the button below to download the latest exported Excel file of public devotee entries.</p>
      <button className="btn btn-primary" onClick={handleDownload} disabled={loading}>
        {loading ? 'Preparing...' : 'Download devotees.xlsx'}
      </button>
      {error && <div className="alert alert-danger mt-3 mb-0 py-2">{error}</div>}
      {success && !error && <div className="alert alert-success mt-3 mb-0 py-2">File downloaded successfully.</div>}
      <div className="mt-4 small text-secondary">
        Troubleshooting tips:
        <ul className="mt-2 mb-0">
          <li>If the file opens as blank/corrupt, ensure backend sets correct Content-Type and sends a real .xlsx.</li>
          <li>If you see an auth error, re-login to refresh your token.</li>
          <li>Swagger working but UI failing usually means wrong base URL; verify REACT_APP_API_BASE = backend origin.</li>
        </ul>
      </div>
    </div>
  );
}
