import React from 'react';
import { Card, Button, Tooltip } from 'antd';
import { CheckCircleOutlined, EditOutlined, UnorderedListOutlined, BarChartOutlined, CalendarOutlined, QuestionCircleOutlined, FileTextOutlined, UserOutlined } from '@ant-design/icons';
import './QuickLinkPage.css';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const menuItems = [
  {
    key: 'select-template',
    icon: <FileTextOutlined style={{ fontSize: 36, color: '#4B5320' }} />,
    label: 'Select Template',
    dashboardView: 'sadhanaTemplate',
    step: 'Step 1',
    tooltip: 'Start by selecting your Sadhana template.'
  },
  {
    key: 'update-profile',
    icon: <UserOutlined style={{ fontSize: 36, color: '#0d6efd', marginTop: '24px' }} />,
    label: 'Photo For Sadhana Card',
    dashboardView: 'profile',
    step: 'Step 2',
    tooltip: 'Update your profile picture. The same photo will appear on your Sadhana Card.'
  },
  {
    key: 'sadhana-entry',
    icon: <EditOutlined style={{ fontSize: 36, color: '#6A9A5B' }} />,
    label: 'Sadhana Entry',
    dashboardView: 'entry',
    step: 'Step 3',
    tooltip: 'Enter your daily Sadhana activities.'
  },
  {
    key: 'view-entry',
    icon: <UnorderedListOutlined style={{ fontSize: 36, color: '#35521C' }} />,
    label: 'View Entry',
    dashboardView: 'download',
    step: 'Step 4',
    tooltip: 'View your previous Sadhana entries.'
  },
  {
    key: 'sadhana-chart',
    icon: <BarChartOutlined style={{ fontSize: 36, color: '#A05A2C' }} />,
    label: 'Sadhana Chart',
    dashboardView: 'sadhanaReports',
    step: 'Step 5',
    tooltip: 'Visualize your Sadhana progress.'
  },
  {
    key: 'plan-day',
    icon: <CalendarOutlined style={{ fontSize: 36, color: '#A05A2C' }} />,
    label: 'Plan Your Day',
    dashboardView: 'todoList',
    step: '',
    tooltip: 'Plan your daily activities.'
  },
  {
    key: 'help',
    icon: <QuestionCircleOutlined style={{ fontSize: 36, color: '#6A9A5B' }} />,
    label: 'Help Guide',
    dashboardView: 'helpGuide',
    step: '',
    tooltip: 'Get detailed help and instructions.'
  }
];

const showSequenceToast = () => {
  toast.info('To use this page: 1. Select Template 2. Update Profile Pic (photo will appear on Sadhana Card) 3. Sadhana Entry 4. View Entry 5. Sadhana Chart 6. Plan Your Day', {
    position: 'top-center',
    autoClose: 7000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

const QuickLinkPage = ({ setDashboardView, premiumExpiry }) => {
  const navigate = useNavigate();
  React.useEffect(() => {
    showSequenceToast();
  }, []);

  // Restriction check
  const isPremiumValid = premiumExpiry && !isNaN(new Date(premiumExpiry)) && new Date(premiumExpiry) >= new Date();

  if (!isPremiumValid) {
    // Show restriction card if premium expired
    return (
      <div style={{margin:'40px auto',maxWidth:'500px'}}>
        <div className="card shadow-lg border-0 rounded-4 p-4" style={{ background: '#fff8f3' }}>
          <div className="text-center mb-3">
            <span style={{ fontSize: 48, color: '#c82333' }}><i className="bi bi-emoji-frown"></i></span>
            <h4 className="fw-bold mt-2" style={{ color: '#c82333' }}>Access Restricted</h4>
          </div>
          <div className="mb-3 text-center" style={{ fontSize: 18, color: '#7a4f01' }}>
            Sorry, your <b>trial pack</b> or <b>premium pack</b> has expired.<br />
            Please upgrade to continue enjoying all features!
          </div>
          <div className="mb-3 text-center" style={{ fontSize: 16, color: '#444' }}>
            <b>Upgrade for just ₹10/month</b> — this helps us maintain the website, domain, and devotee database.
          </div>
          <div className="alert alert-success d-flex align-items-center justify-content-between fw-bold mb-3" style={{ fontSize: 16, background: '#e6f4ea', color: '#256029', border: '1px solid #b7e0c7' }}>
            <span style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: 18, marginRight: 8 }}>😊</span> Don't worry, you can still continue entering your sadhana!
            </span>
            <button
              className="btn btn-outline-success btn-sm fw-bold ms-3"
              style={{ borderRadius: '8px', minWidth: 'auto', fontSize: '0.98rem', whiteSpace: 'nowrap' }}
              onClick={() => setDashboardView && setDashboardView("entry")}
            >
              Sadhana Entry
            </button>
          </div>
          <div className="text-center mt-3 d-flex flex-column gap-2 align-items-center">
            <button className="btn btn-danger btn-lg px-5 fw-bold mb-2" onClick={() => setDashboardView && setDashboardView("upgradePremium")}>Upgrade to Premium</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="quicklink-page">
      <div className="quicklink-header">
        <img src="/image/logo.png" alt="Logo" className="quicklink-logo" />
        <h2>Quick Links</h2>
        <p className="quicklink-desc" style={{
          fontSize: '1.25rem',
          fontWeight: 700,
          color: '#388e3c',
          background: '#fff3cd',
          borderRadius: '8px',
          padding: '10px 24px',
          margin: '18px 0',
          boxShadow: '0 2px 8px #e6cfa5',
          letterSpacing: '0.5px',
          textAlign: 'center'
        }}>Follow the sequence for best experience. All features are arranged for easy access.</p>
      </div>
      <div className="quicklink-card-container">
        {menuItems.map(item => (
          <Card key={item.key} className="quicklink-card" style={{position:'relative',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',cursor:'pointer'}} onClick={() => setDashboardView && setDashboardView(item.dashboardView)}>
            {item.step && (
              <div className="quicklink-step-label" style={{position:'absolute',top:'10px',right:'12px',height:'28px',minWidth:'80px',padding:'0 8px',display:'flex',alignItems:'center',justifyContent:'center',color:'#a05a2c',fontWeight:'bold',fontSize:'1.05em',background:'#fff3cd',borderRadius:'6px',border:'1px solid #e6cfa5',boxShadow:'0 2px 8px #e6cfa5'}}>
                {item.step}
              </div>
            )}
            <Tooltip title={item.tooltip} placement="top">
              <div style={{display:'flex',justifyContent:'center',alignItems:'center',width:'100%',margin:'32px 0 12px 0'}}>
                <div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'72px',width:'72px'}}>
                  <Button
                    className="quicklink-btn"
                    type="primary"
                    shape="circle"
                    size="large"
                    icon={item.icon}
                    style={{ background: '#fff', border: 'none', boxShadow: '0 2px 8px #e0e0e0', pointerEvents:'none', width:'72px', height:'72px', display:'flex', alignItems:'center', justifyContent:'center', marginTop: item.key === 'update-profile' ? '24px' : '0', padding: 0 }}
                  />
                </div>
              </div>
            </Tooltip>
            <div className="quicklink-label">{item.label}</div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default QuickLinkPage;
