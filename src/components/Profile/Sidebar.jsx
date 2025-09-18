import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaSignOutAlt, FaClipboardList, FaCalculator } from "react-icons/fa";

const Sidebar = ({ user }) => {
  const navigate = useNavigate();
  const [hoveredItem, setHoveredItem] = useState(null);
  const [activeItem, setActiveItem] = useState("Profile");

  // Sidebar container style
  const sidebarStyle = {
    width: "256px",
    minHeight: "100vh",
    background: "#10101dff", // Dark navy background
    color: "#f0f0f0",
    padding: "16px 0",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.5)",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    borderRight: "1px solid #1f1f2f",
  };

  // Header style
  const sidebarHeaderStyle = {
    borderBottom: "1px solid #2c2c3d",
    padding: "0 24px 16px 24px",
    marginBottom: "16px",
    fontSize: "18px",
    fontWeight: "600",
    textAlign: "left",
    width: "100%",
    color: "#52c41a", // Bright green accent
  };

  // User info card
  const userInfoStyle = {
    marginBottom: "24px",
    background: "#1a1a2e",
    padding: "16px 24px",
    width: "100%",
    borderBottom: "1px solid #2c2c3d",
    borderRadius: "6px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
  };

  const userInfoTextStyle = {
    margin: "8px 0",
    fontSize: "14px",
    color: "#bfbfbf",
    lineHeight: "1.5",
  };

  // Menu item style
  const menuItemStyle = (isHovered, isActive) => ({
    padding: "12px 24px",
    background: isActive
      ? "#262640"
      : isHovered
      ? "#1f1f2f"
      : "transparent",
    color: isActive ? "#52c41a" : "#f0f0f0",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    fontSize: "14px",
    fontWeight: isActive ? "500" : "400",
    transition: "all 0.3s",
    width: "100%",
    borderRight: isActive ? "3px solid #52c41a" : "3px solid transparent",
    borderRadius: "4px",
    margin: "4px 8px",
  });

  const iconStyle = {
    marginRight: "12px",
    fontSize: "14px",
    color: "inherit",
  };

  // Menu items
  const menuItems = [
    { label: "Profile", icon: <FaUser style={iconStyle} />, path: "/Doctorprofile" },
    { label: "Appointments", icon: <FaClipboardList style={iconStyle} />, path: "/Appointments" },
    { label: "Calculations", icon: <FaCalculator style={iconStyle} />, path: "/Calculation" },
  ];

  // Handlers
  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleMenuItemClick = (item) => {
    setActiveItem(item.label);
    navigate(item.path);
  };

  return (
    <div style={sidebarStyle}>
      <h2 style={sidebarHeaderStyle}>Assistant Profile</h2>

      {/* User Info */}
      <div style={userInfoStyle}>
        <p style={userInfoTextStyle}>
          <strong>User Name:</strong> {user.email}
        </p>
        <p style={userInfoTextStyle}>
          <strong>Role:</strong> {user.role}
        </p>
      </div>

      {/* Menu Items */}
      <div style={{ width: "100%", display: "flex", flexDirection: "column" }}>
        {menuItems.map((item, index) => (
          <div
            key={index}
            style={menuItemStyle(hoveredItem === index, activeItem === item.label)}
            onMouseEnter={() => setHoveredItem(index)}
            onMouseLeave={() => setHoveredItem(null)}
            onClick={() => handleMenuItemClick(item)}
          >
            {item.icon}
            {item.label}
          </div>
        ))}

        {/* Logout */}
        <div
          style={{
            marginTop: "auto",
            paddingTop: "16px",
            borderTop: "1px solid #2c2c3d",
          }}
        >
          <div
            style={menuItemStyle(hoveredItem === "logout", false)}
            onMouseEnter={() => setHoveredItem("logout")}
            onMouseLeave={() => setHoveredItem(null)}
            onClick={handleLogout}
          >
            <FaSignOutAlt style={iconStyle} /> Logout
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
