import React from "react";
import { useNavigate } from "react-router-dom";

export default function HelpGuide({ setView }) {
  return (
    <div className="container py-5" style={{ maxWidth: 700 }}>
      <div className="d-flex align-items-center mb-4">
        <span style={{ fontSize: 36, color: '#0d6efd', marginRight: 16 }}>
          <i className="bi bi-question-circle-fill"></i>
        </span>
        <h2 className="fw-bold mb-0" style={{ color: '#3d5a1a' }}>How to Use the App: 4 Easy Steps</h2>
      </div>
      <div className="card shadow-lg border-0 rounded-4 mb-4">
        <div className="card-body p-4">
          <ol className="list-unstyled mb-0">
            <li className="mb-4">
              <div className="d-flex align-items-center mb-2">
                <span className="step-circle me-3">1</span>
                <span className="fw-bold" style={{ fontSize: 20 }}>Set Your Template</span>
              </div>
              <div className="mb-2">Personalize your sadhana tracking template as per your daily practices.</div>
              <button className="btn btn-outline-primary btn-sm px-4" onClick={() => setView && setView("sadhanaTemplate")}>Go to Sadhana Template</button>
            </li>
            <li className="mb-4">
              <div className="d-flex align-items-center mb-2">
                <span className="step-circle me-3">2</span>
                <span className="fw-bold" style={{ fontSize: 20 }}>Fill Sadhana Card</span>
              </div>
              <div className="mb-2">Start recording your daily sādhana activities easily.</div>
              <button className="btn btn-outline-primary btn-sm px-4" onClick={() => setView && setView("entry")}>Go to Daily Sadhana Entry</button>
            </li>
            <li className="mb-4">
              <div className="d-flex align-items-center mb-2">
                <span className="step-circle me-3">3</span>
                <span className="fw-bold" style={{ fontSize: 20 }}>Download Reports</span>
              </div>
              <div className="mb-2">Instantly download your sadhana data as PDF or XLS for your records.</div>
              <button className="btn btn-outline-primary btn-sm px-4" onClick={() => setView && setView("download")}>Go to Download Page</button>
            </li>
            <li className="mb-4">
              <div className="d-flex align-items-center mb-2">
                <span className="step-circle me-3">4</span>
                <span className="fw-bold" style={{ fontSize: 20 }}>Performance Chart</span>
              </div>
              <div className="mb-2">Visualize your progress with insightful charts and analytics.</div>
              <button className="btn btn-outline-primary btn-sm px-4" onClick={() => setView && setView("sadhanaReports")}>Go to Sadhana Chart Reports</button>
            </li>
          </ol>
        </div>
      </div>
      <div className="alert alert-warning text-center mt-4" style={{ fontSize: 18, fontWeight: 500 }}>
        <span className="me-2">After your trial pack:</span>
        <span style={{ color: '#c82333', fontWeight: 700 }}>Upgrade to Premium</span>
        <span className="ms-2">for just <b>₹10/month</b>—this helps us maintain the website, domain, and devotee database.</span>
        <div className="mt-3">
          <button className="btn btn-danger btn-lg px-5 fw-bold" onClick={() => setView && setView("upgradePremium")}>Upgrade Now</button>
        </div>
      </div>
      <style>{`
        .step-circle {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: #e3eafc;
          color: #0d6efd;
          font-size: 1.3rem;
          font-weight: 700;
          border: 2px solid #0d6efd;
        }
      `}</style>
    </div>
  );
}
