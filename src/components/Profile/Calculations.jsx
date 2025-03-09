// src/components/Calculation.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCalculator, FaHeartbeat, FaSyringe, FaFileMedical, FaClipboardList } from 'react-icons/fa'; // Import relevant icons
import Sidebar from './Sidebar';
import './Calculation.css'; // Ensure CSS is correctly imported

const Calculation = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")) || null; // Make it null if no user is found

  // Redirect to login if user is not available
  React.useEffect(() => {
    if (!user || !user.email) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (user === null) return <div>Loading...</div>; // Display loading state if no user data

  return (
    <div className="container">
      <Sidebar user={user} />
      <div className="main-content">
        <h2 className="welcome-header1">Welcome, {user.name || "User "}</h2>
        <p className="welcome-text">Choose an option below:</p>
        
        <div className="button-container">
          <button className="button1" onClick={() => navigate('/BUN')}>
            <FaCalculator style={{ marginRight: '8px' }} /> Blood Urea Nitrogen (BUN) to Creatinine Ratio
          </button>
          <button className="button1" onClick={() => navigate('/EGFR')}>
            <FaHeartbeat style={{ marginRight: '8px' }} /> Estimated Glomerular Filtration Rate (eGFR)
          </button>
          <button className="button1" onClick={() => navigate('/IDC')}>
            <FaSyringe style={{ marginRight: '8px' }} /> Insulin Dose Calculator
          </button>
          <button className="button1" onClick={() => navigate('/INR')}>
            <FaFileMedical style={{ marginRight: '8px' }} /> INR (International Normalized Ratio)
          </button>
          <button className="button1" onClick={() => navigate('/LPC')}>
            <FaClipboardList style={{ marginRight: '8px' }} /> Lipid Profile Calculation
          </button>
        </div>
      </div>
    </div>
  );
};

export default Calculation;