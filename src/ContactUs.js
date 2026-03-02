import React from "react";
import "./ContactUs.css";

export default function ContactUs() {
  return (
    <div className="contactus-page-bg">
      <div className="contactus-card shadow-lg">
        <div className="contactus-header">
          <img src={process.env.PUBLIC_URL + '/image/VSB-logo.png'} alt="Vaidhī Sādhana Bhakti Logo" className="contactus-logo" />
          <h2>Contact Us</h2>
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
