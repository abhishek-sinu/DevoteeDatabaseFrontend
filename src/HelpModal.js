import React from "react";
import "./ContactUs.css";

export default function HelpModal({ show, onClose }) {
  if (!show) return null;
  return (
    <div className="help-modal-overlay" style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'rgba(0,0,0,0.25)',zIndex:3000,display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div className="contactus-card shadow-lg" style={{position:'relative',zIndex:3001}}>
        <button
          onClick={onClose}
          style={{position:'absolute',top:12,right:16,fontSize:24,background:'none',border:'none',color:'#a05a2c',cursor:'pointer'}}
          aria-label="Close help modal"
        >
          ×
        </button>
        <div className="contactus-header">
          <img src={process.env.PUBLIC_URL + '/image/VSB-logo.png'} alt="Vaidhī Sādhana Bhakti Logo" className="contactus-logo" />
          <h2>Help & Support</h2>
        </div>
        <div className="contactus-body">
          <p className="contactus-intro">
            For any queries, <span className="contactus-highlight">payment issues</span>, suggestions, or if you want a website for yourself, feel free to reach out!
          </p>
          <div className="contactus-info">
            <div className="contactus-info-item">
              <span className="contactus-label">Email:</span>
              <a href="mailto:aparupagourangadas.hs@gmail.com" className="contactus-link">aparupagourangadas.hs@gmail.com</a>
            </div>
            <div className="contactus-info-item">
              <span className="contactus-label">WhatsApp:</span>
              <a href="https://wa.me/917032241089" className="contactus-link" target="_blank" rel="noopener noreferrer">+91 70322 41089</a>
            </div>
          </div>
          <div className="contactus-footer">
            <p>We welcome your feedback and are happy to help you!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
