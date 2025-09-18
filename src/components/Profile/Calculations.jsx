// src/components/Calculation.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCalculator, FaHeartbeat, FaSyringe, FaFileMedical, FaClipboardList } from 'react-icons/fa';
import Sidebar from './Sidebar';

const Calculation = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")) || null;

  useEffect(() => {
    if (!user || !user.email) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (user === null) return <div style={{ textAlign: "center", marginTop: "40px", fontSize: "18px" }}>Loading...</div>;

  const cardStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: "140px",
    height: "140px",
    margin: "15px",
    padding: "20px",
    background: "#fff",
    borderRadius: "16px",
    border: "2px solid #27ae60", // green border
    cursor: "pointer",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
    transition: "all 0.3s ease",
    color: "#2c3e50",
    fontWeight: "bold",
    fontSize: "14px",
    textAlign: "center"
  };

  const cardHover = {
    transform: "translateY(-6px) scale(1.05)",
    boxShadow: "0 8px 18px rgba(0,0,0,0.2)",
    borderColor: "#2ecc71" // brighter green on hover
  };

  const iconStyle = { fontSize: "32px", marginBottom: "10px", color: "#27ae60" }; // green icons

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Segoe UI', sans-serif", background: "#eef2f7" }}>
      <Sidebar user={user} />

      <div style={{ flex: 1, padding: "30px", overflowY: "auto" }}>
        <h2 style={{ color: "#2c3e50", marginBottom: "10px" }}>Welcome, {user.name || "User"}</h2>
        <p style={{ color: "#7f8c8d", marginBottom: "25px" }}>Choose a calculation tool:</p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
          <div
            style={cardStyle}
            onMouseOver={(e) => Object.assign(e.currentTarget.style, cardStyle, cardHover)}
            onMouseOut={(e) => Object.assign(e.currentTarget.style, cardStyle)}
            onClick={() => navigate('/BUN')}
          >
            <FaCalculator style={iconStyle} />
            BUN
          </div>

          <div
            style={cardStyle}
            onMouseOver={(e) => Object.assign(e.currentTarget.style, cardStyle, cardHover)}
            onMouseOut={(e) => Object.assign(e.currentTarget.style, cardStyle)}
            onClick={() => navigate('/EGFR')}
          >
            <FaHeartbeat style={iconStyle} />
            eGFR
          </div>

          <div
            style={cardStyle}
            onMouseOver={(e) => Object.assign(e.currentTarget.style, cardStyle, cardHover)}
            onMouseOut={(e) => Object.assign(e.currentTarget.style, cardStyle)}
            onClick={() => navigate('/IDC')}
          >
            <FaSyringe style={iconStyle} />
            IDC
          </div>

          <div
            style={cardStyle}
            onMouseOver={(e) => Object.assign(e.currentTarget.style, cardStyle, cardHover)}
            onMouseOut={(e) => Object.assign(e.currentTarget.style, cardStyle)}
            onClick={() => navigate('/INR')}
          >
            <FaFileMedical style={iconStyle} />
            INR
          </div>

          <div
            style={cardStyle}
            onMouseOver={(e) => Object.assign(e.currentTarget.style, cardStyle, cardHover)}
            onMouseOut={(e) => Object.assign(e.currentTarget.style, cardStyle)}
            onClick={() => navigate('/LPC')}
          >
            <FaClipboardList style={iconStyle} />
            LPC
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calculation;
