import React from 'react';
import { useNavigate } from 'react-router-dom';import { FaUser, FaSignOutAlt, FaClipboardList, FaCalculator } from 'react-icons/fa';

import {
    sidebarStyle,
    sidebarHeaderStyle,
    userInfoStyle,
    userInfoTextStyle,
    sidebarMenuStyle,
    menuItemStyle,
    iconStyle,
  } from '../Profile/Styles';

const Sidebar = ({ user }) => {
  const navigate = useNavigate();

  return (
    <div style={sidebarStyle}>
      <h2 style={sidebarHeaderStyle}>Assistant Profile</h2>
      <div style={userInfoStyle}>
        <p style={userInfoTextStyle}><strong>User Name:</strong> {user.email}</p>
        <p style={userInfoTextStyle}><strong>Role:</strong> {user.role}</p>
      </div>
      <div style={sidebarMenuStyle}>
        <div style={menuItemStyle} onClick={() => navigate('/Doctorprofile')}>
          <FaUser style={iconStyle} /> Profile
        </div>
        <div style={menuItemStyle} onClick={() => navigate('/Appointments')}>
          <FaClipboardList style={iconStyle} /> Appointments
        </div>
        <div style={menuItemStyle} onClick={() => navigate('/Calculation')}>
          <FaCalculator style={iconStyle} /> Calculations
        </div>
        <div
          style={menuItemStyle}
          onClick={() => {
            localStorage.removeItem("user");
            navigate('/login');
          }}
        >
          <FaSignOutAlt style={iconStyle} /> Logout
        </div>
      </div>
    </div>
  );
};

// Export Sidebar as the default export
export default Sidebar;