import React, { useState, useEffect } from "react";
import axios from "axios";
import { load } from '@cashfreepayments/cashfree-js';
import { Link } from "react-router-dom";
import HelpModal from "./HelpModal";
import { FaRegCheckCircle, FaRegComments, FaUsers, FaChartBar } from "react-icons/fa";

const logo = process.env.PUBLIC_URL + "/image/logo-nav.png";
const youtubeVideoId = ""; // Replace with your actual video ID

export default function LandingPage() {
    const [showThankYou, setShowThankYou] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [donateAmount, setDonateAmount] = useState(100);
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [donorPhone, setDonorPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cashfree, setCashfree] = useState(null);

  useEffect(() => {
    async function initSDK() {
      const mode = process.env.REACT_APP_CASHFREE_MODE === 'PROD' ? 'production' : 'sandbox';
      const sdk = await load({ mode });
      setCashfree(sdk);
    }
    initSDK();
  }, []);

  const getSessionId = async (amount) => {
    try {
      const user_details = {
        customer_id: donorPhone || 'donor',
        customer_phone: donorPhone,
        customer_name: donorName,
        customer_email: donorEmail
      };
      const res = await axios.get(`${process.env.REACT_APP_API_BASE}/api/payment`, {
        params: {
          user_details,
          amount
        }
      });
      if (res.data && res.data.payment_session_id) {
        return res.data.payment_session_id;
      } else {
        setError('Could not create payment session.');
        return null;
      }
    } catch (err) {
      setError('Error creating payment session.');
      return null;
    }
  };

  const handleDonate = async () => {
    setError("");
    // Basic validation
    if (!donorName.trim() || !donorEmail.trim() || !donorPhone.trim() || !donateAmount || donateAmount < 1) {
      setError("Please fill all fields correctly.");
      return;
    }
    setLoading(true);
    const sessionId = await getSessionId(donateAmount);
    setLoading(false);
    // Validate payment_session_id before proceeding
    if (!sessionId || typeof sessionId !== 'string' || !sessionId.trim() || !cashfree) {
      setError('Payment session could not be created. Please try again.');
      console.error('Invalid or missing payment_session_id:', sessionId);
      return;
    }
    let checkoutOptions = {
      paymentSessionId: sessionId,
      redirectTarget: "_modal",
    };
    // Log the value being sent to Cashfree
    console.log('Invoking Cashfree with paymentSessionId:', sessionId);
    cashfree.checkout(checkoutOptions).then((res) => {
      console.log("Donation payment initialized");
      setShowThankYou(true);
    }).catch(() => {
      setError('Payment modal failed to open. Please try again.');
    });
  };

  return (
    <div style={{ fontFamily: 'serif', background: '#f8f5f0', minHeight: '100vh', color: '#3d5a1a' }}>
      {/* SEO Section: H1, H2, paragraph, crawlable links */}
      {showThankYou && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.25)', zIndex: 9999 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow-lg" style={{ borderRadius: 18 }}>
              <div className="modal-header bg-success text-white" style={{ borderTopLeftRadius: 18, borderTopRightRadius: 18 }}>
                <h5 className="modal-title fw-bold">Thank You!</h5>
              </div>
              <div className="modal-body text-center">
                <div className="mb-3">
                  <span className="badge bg-success" style={{ fontSize: '1.2rem', padding: '8px 24px', borderRadius: 12 }}>
                    Your donation has been initiated.<br />
                    We appreciate your support!
                  </span>
                </div>
                <div className="mt-3">
                  <span className="text-success fw-bold">Hare Krishna!</span>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn fw-bold btn-success" style={{ borderRadius: 8 }} onClick={() => setShowThankYou(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Header */}
      <header style={{ background: '#e6f4ea', borderBottom: '2px solid #7a9c5c', padding: '16px 0', boxShadow: '0 2px 8px rgba(160,90,44,0.10)' }}>
        <div className="container d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center">
            <img src={logo} alt="Vaiḍhī Sādhana Bhakti Logo" style={{ width: 72, height: 72, marginRight: 16 }} />
            <span style={{ fontWeight: 'bold', fontSize: '2rem', color: '#7a9c5c' }}>Vaiḍhī Sādhana Bhakti</span>
          </div>
          <nav>
            <Link to="/login" className="btn mx-2" style={{ background: '#7a9c5c', color: '#fff', border: 'none', fontWeight: 'bold', fontSize: '1.08rem', borderRadius: '10px', padding: '10px 28px' }}>Login</Link>
            <Link to="/signup" className="btn mx-2" style={{ background: '#a05a2c', color: '#fff', border: 'none', fontWeight: 'bold', fontSize: '1.08rem', borderRadius: '10px', padding: '10px 28px' }}>Sign Up</Link>
            <button className="btn mx-2" style={{ background: '#3d5a1a', color: '#fff', border: 'none', fontWeight: 'bold', fontSize: '1.08rem', borderRadius: '10px', padding: '10px 28px' }} onClick={() => setShowHelp(true)}>Help</button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container text-center py-3" style={{paddingTop:'12px', paddingBottom:'12px'}}>
        <h1 style={{ fontWeight: 'bold', fontSize: '2.5rem', color: '#a05a2c' }}>Welcome, Hare Krishna!</h1>
        <p style={{ fontSize: '1.25rem', margin: '24px 0', color: '#3d5a1a' }}>
          Vaiḍhī Sādhana Bhakti helps you track, improve, and share your daily spiritual practices. Join a vibrant spiritual community, get guidance, and grow in your devotion.
        </p>
        <div className="row justify-content-center mb-2" style={{gap:'32px'}}>
          {/* 1. Customize Template */}
          <div className="col-md-3 mb-2 d-flex" style={{minWidth:'260px'}}>
            <div className="card shadow-lg d-flex flex-column justify-content-start" style={{ height: '260px', width: '100%', borderRadius: '20px', border: '2px solid #b0e6e6', background:'#fff', boxShadow:'0 8px 32px rgba(44,160,160,0.13)', padding:'0', alignItems:'center', textAlign:'center', transition:'box-shadow 0.2s', position:'relative', overflow:'hidden' }}>
              <div style={{background:'#f8f8f3', padding:'8px 0 2px 0', borderTopLeftRadius:'20px', borderTopRightRadius:'20px'}}>
                <FaRegCheckCircle size={36} style={{color:'#2ca0a0'}} />
              </div>
              <h5 className="card-title" style={{ color: '#2ca0a0', fontWeight:'bold', fontSize:'1.25rem', margin:'4px 0 10px 0' }}>Customize Your Template</h5>
              <hr style={{margin:'0 0 10px 0', border:'none', borderTop:'2px solid #a05a2c', width:'80%'}} />
              <div style={{flexGrow:1, display:'flex', flexDirection:'column', justifyContent:'flex-start'}}>
                <ul style={{textAlign:'left', fontSize:'1.15rem', color:'#3d2c1a', marginBottom:0, paddingLeft:'24px'}}>
                  <li>Personalize your sadhana card.</li>
                  <li>Choose activities to track: chanting, reading, service, and more.</li>
                </ul>
              </div>
            </div>
          </div>
          {/* 2. Track Sadhana */}
          <div className="col-md-3 mb-2 d-flex" style={{minWidth:'260px'}}>
            <div className="card shadow-lg d-flex flex-column justify-content-start" style={{ height: '260px', width: '100%', borderRadius: '20px', border: '2px solid #e6d7b0', background:'#fff', boxShadow:'0 8px 32px rgba(122,156,92,0.13)', padding:'0', alignItems:'center', textAlign:'center', transition:'box-shadow 0.2s', position:'relative', overflow:'hidden' }}>
              <div style={{background:'#f8f8f3', padding:'8px 0 2px 0', borderTopLeftRadius:'20px', borderTopRightRadius:'20px'}}>
                <FaRegCheckCircle size={36} style={{color:'#7a9c5c'}} />
              </div>
              <h5 className="card-title" style={{ color: '#7a9c5c', fontWeight:'bold', fontSize:'1.25rem', margin:'4px 0 10px 0' }}>Track Sadhana</h5>
              <hr style={{margin:'0 0 10px 0', border:'none', borderTop:'2px solid #a05a2c', width:'80%'}} />
              <div style={{flexGrow:1, display:'flex', flexDirection:'column', justifyContent:'flex-start'}}>
                <ul style={{textAlign:'left', fontSize:'1.15rem', color:'#3d2c1a', marginBottom:0, paddingLeft:'24px'}}>
                  <li>Track daily chanting.</li>
                  <li>Record your Reading Hours.</li>
                  <li>Record your Hearing Hours.</li>
                  <li>Record your services.</li>
                </ul>
              </div>
            </div>
          </div>
          {/* 3. Reports & Chart */}
          <div className="col-md-3 mb-2 d-flex" style={{minWidth:'260px'}}>
            <div className="card shadow-lg d-flex flex-column justify-content-start" style={{ height: '260px', width: '100%', borderRadius: '20px', border: '2px solid #f3e0d0', background:'#fff', boxShadow:'0 8px 32px rgba(160,90,44,0.13)', padding:'0', alignItems:'center', textAlign:'center', transition:'box-shadow 0.2s', position:'relative', overflow:'hidden' }}>
              <div style={{background:'#f8f8f3', padding:'8px 0 2px 0', borderTopLeftRadius:'20px', borderTopRightRadius:'20px'}}>
                <FaChartBar size={36} style={{color:'#a05a2c'}} />
              </div>
              <h5 className="card-title" style={{ color: '#a05a2c', fontWeight:'bold', fontSize:'1.25rem', margin:'4px 0 10px 0' }}>Reports & Chart</h5>
              <hr style={{margin:'0 0 10px 0', border:'none', borderTop:'2px solid #a05a2c', width:'80%'}} />
              <div style={{flexGrow:1, display:'flex', flexDirection:'column', justifyContent:'flex-start'}}>
                <ul style={{textAlign:'left', fontSize:'1.15rem', color:'#3d2c1a', marginBottom:0, paddingLeft:'24px'}}>
                  <li>Visualize sadhana progress</li>
                  <li>View monthly, 3 month, 6 month charts</li>
                  <li>Analyze trends and consistency</li>
                  <li>Download detailed reports</li>
                </ul>
              </div>
            </div>
          </div>
          {/* 4. Get Guidance */}
          <div className="col-md-3 mb-2 d-flex" style={{minWidth:'260px'}}>
            <div className="card shadow-lg d-flex flex-column justify-content-start" style={{ height: '270px', width: '100%', borderRadius: '20px', border: '2px solid #f3e0d0', background:'#fff', boxShadow:'0 8px 32px rgba(160,90,44,0.13)', padding:'0', alignItems:'center', textAlign:'center', transition:'box-shadow 0.2s', position:'relative', overflow:'hidden' }}>
              <div style={{background:'#f8f8f3', padding:'8px 0 2px 0', borderTopLeftRadius:'20px', borderTopRightRadius:'20px'}}>
                <FaRegComments size={36} style={{color:'#a05a2c'}} />
              </div>
              <h5 className="card-title" style={{ color: '#a05a2c', fontWeight:'bold', fontSize:'1.25rem', margin:'4px 0 10px 0' }}>Get Guidance</h5>
              <hr style={{margin:'0 0 10px 0', border:'none', borderTop:'2px solid #a05a2c', width:'80%'}} />
              <ul style={{textAlign:'left', fontSize:'1.15rem', color:'#3d2c1a', marginBottom:0, paddingLeft:'24px'}}>
                <li>Connect with your counsellor</li>
                <li>Your counsellor will review your Sadhana</li>
              </ul>
            </div>
          </div>
          {/* 5. Community */}
          <div className="col-md-3 mb-2 d-flex" style={{minWidth:'260px'}}>
            <div className="card shadow-lg d-flex flex-column justify-content-start" style={{ height: '270px', width: '100%', borderRadius: '20px', border: '2px solid #d6e5c6', background:'#fff', boxShadow:'0 8px 32px rgba(61,90,26,0.13)', padding:'0', alignItems:'center', textAlign:'center', transition:'box-shadow 0.2s', position:'relative', overflow:'hidden' }}>
              <div style={{background:'#f8f8f3', padding:'8px 0 2px 0', borderTopLeftRadius:'20px', borderTopRightRadius:'20px'}}>
                <FaUsers size={36} style={{color:'#3d5a1a'}} />
              </div>
              <h5 className="card-title" style={{ color: '#3d5a1a', fontWeight:'bold', fontSize:'1.25rem', margin:'4px 0 10px 0' }}>Community</h5>
              <hr style={{margin:'0 0 10px 0', border:'none', borderTop:'2px solid #a05a2c', width:'80%'}} />
              <ul style={{textAlign:'left', fontSize:'1.15rem', color:'#3d2c1a', marginBottom:0, paddingLeft:'24px'}}>
                <li>Share progress</li>
                <li>Inspire others</li>
                <li>Grow together</li>
              </ul>
            </div>
          </div>
        </div>
        <Link to="/signup" className="btn btn-lg btn-success px-5 py-3" style={{ background: '#7a9c5c', border: 'none', fontWeight: 'bold', fontSize: '1.2rem' }}>Join Now</Link>
      </section>

      {/* YouTube Video Section */}
      <section className="container text-center py-4">
        <h2 style={{ color: '#a05a2c', fontWeight: 'bold' }}>How to Use the App</h2>
        <div className="ratio ratio-16x9 my-3" style={{ maxWidth: 600, margin: '0 auto' }}>
          <iframe
            src={`https://www.youtube.com/embed/${youtubeVideoId}`}
            title="How to use Vaiḍhī Sādhana Bhakti"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ borderRadius: '12px', border: '2px solid #7a9c5c' }}
          ></iframe>
        </div>
      </section>

      {/* Donate Section */}
      <section className="container text-center py-4">
        <h2 style={{ color: '#7a9c5c', fontWeight: 'bold' }}>Support Us</h2>
        <p style={{ fontSize: '1.1rem', color: '#3d5a1a' }}>
          Help us maintain and improve this platform for all devotees. Your donation makes a difference!<br />
          <span style={{ display: 'block', marginTop: '10px' }}>
            By your generous support, students and brahmacharis can use this app completely free of charge. We are committed to providing free access to all students and brahmacharis so they can focus on their spiritual growth and sadhana without any financial burden. Your contribution helps empower their journey and sustains this service for the entire community.
          </span>
        </p>
        <form style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'left', background: '#fff', padding: '24px 28px', borderRadius: '16px', boxShadow: '0 2px 12px rgba(160,90,44,0.07)' }} onSubmit={e => { e.preventDefault(); handleDonate(); }}>
          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="donorName" style={{ fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>Name</label>
            <input
              id="donorName"
              type="text"
              value={donorName}
              onChange={e => setDonorName(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #a05a2c', fontSize: '1.08rem' }}
              required
            />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="donorEmail" style={{ fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>Email</label>
            <input
              id="donorEmail"
              type="email"
              value={donorEmail}
              onChange={e => setDonorEmail(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #a05a2c', fontSize: '1.08rem' }}
              required
            />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="donorPhone" style={{ fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>Phone</label>
            <input
              id="donorPhone"
              type="tel"
              value={donorPhone}
              onChange={e => setDonorPhone(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #a05a2c', fontSize: '1.08rem' }}
              required
            />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="donateAmount" style={{ fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>Donation Amount (₹)</label>
            <input
              id="donateAmount"
              type="number"
              min="1"
              value={donateAmount}
              onChange={e => setDonateAmount(Number(e.target.value))}
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #a05a2c', fontSize: '1.08rem' }}
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-warning w-100 py-3"
            style={{ background: '#a05a2c', color: '#fff', fontWeight: 'bold', fontSize: '1.15rem', border: 'none', borderRadius: '10px' }}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Donate'}
          </button>
          {error && <div style={{ color: 'red', marginTop: '10px', textAlign: 'center' }}>{error}</div>}
        </form>
      </section>

      {/* Footer */}
      <footer style={{ background: '#e6f4ea', borderTop: '2px solid #7a9c5c', padding: '24px 0', marginTop: '32px' }}>
        <div className="container d-flex flex-column flex-md-row align-items-center justify-content-between">
          <div className="mb-2 mb-md-0">
            <img src={logo} alt="Vaiḍhī Sādhana Bhakti Logo" style={{ width: 48, height: 48, marginRight: 8 }} />
            <span style={{ fontWeight: 'bold', color: '#7a9c5c' }}>Vaiḍhī Sādhana Bhakti</span>
          </div>
          <div>
            <Link to="/login" className="mx-2" style={{ color: '#7a9c5c', textDecoration: 'none' }}>Login</Link>
            <Link to="/signup" className="mx-2" style={{ color: '#7a9c5c', textDecoration: 'none' }}>Sign Up</Link>
            <Link to="/helpGuide" className="mx-2" style={{ color: '#a05a2c', textDecoration: 'none' }}>Help</Link>
            <a href="mailto:contact@vaidhisadhanabhakti.cloud" className="mx-2" style={{ color: '#3d5a1a', textDecoration: 'none' }}>Contact</a>
          </div>
          <div style={{ fontSize: '0.95rem', color: '#a05a2c' }}>
            © {new Date().getFullYear()} Vaiḍhī Sādhana Bhakti. All rights reserved.
          </div>
        </div>
      </footer>
      <HelpModal show={showHelp} onClose={() => setShowHelp(false)} />
    </div>
  );
}
