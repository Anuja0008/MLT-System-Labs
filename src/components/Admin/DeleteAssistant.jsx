import React, { useState, useEffect } from "react";
import { db } from "../../firebase/db";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { Layout, Menu, Space, Typography, message, Popconfirm } from "antd";
import {
  TeamOutlined,
  DashboardOutlined,
  UserAddOutlined,
  UserDeleteOutlined,
  UserOutlined,
  ScheduleOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

// Live Clock Component
const LiveClock = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Space>
      <span style={{ fontSize: "0.9rem", color: "#fff" }}>
        {currentTime.toLocaleDateString(undefined, {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </span>
      <span style={{ fontWeight: "bold", fontSize: "1rem", color: "#fff" }}>
        {currentTime.toLocaleTimeString()}
      </span>
    </Space>
  );
};

function DELETEASSISTANT() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [assistants, setAssistants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  useEffect(() => {
    fetchAssistants();
  }, []);

  const fetchAssistants = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, "users"));
      const assistantsData = querySnapshot.docs
        .filter((doc) => doc.data().role === "Assistant")
        .map((doc) => ({ id: doc.id, ...doc.data() }));
      setAssistants(assistantsData);
    } catch (error) {
      console.error("Error fetching assistants:", error);
      message.error("Failed to load assistants");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "users", id));
      message.success("Assistant deleted successfully");
      setAssistants(assistants.filter((a) => a.id !== id));
    } catch (error) {
      console.error("Error deleting assistant:", error);
      message.error("Failed to delete assistant");
    }
  };

  if (!user) return null;

  return (
    <Layout style={{ minHeight: "100vh", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      {/* Sidebar */}
      <Sider
        width={250}
        style={{ background: "#181c2e", position: "fixed", height: "100vh", left: 0, top: 0, overflow: "auto" }}
      >
        <div
          style={{
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontWeight: 600,
            fontSize: "1.2rem",
          }}
        >
          <TeamOutlined style={{ marginRight: 8 }} />Assistant Portal
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={["delete-assistant"]}
          style={{ background: "transparent" }}
        >
          <Menu.Item key="dashboard" icon={<DashboardOutlined />} onClick={() => navigate("/Admin")}>
            Dashboard
          </Menu.Item>

          <Menu.SubMenu key="assistants" icon={<TeamOutlined />} title="Assistants">
            <Menu.Item key="add-assistant" icon={<UserAddOutlined />} onClick={() => navigate("/ADDASSISTANT")}>
              Add Assistant
            </Menu.Item>
            <Menu.Item key="delete-assistant" icon={<UserDeleteOutlined />}>
              Delete Assistant
            </Menu.Item>
          </Menu.SubMenu>

          <Menu.Item key="patients" icon={<UserOutlined />} onClick={() => navigate("/ViewPatient")}>
            Patients
          </Menu.Item>
          <Menu.Item key="bookings" icon={<ScheduleOutlined />} onClick={() => navigate("/Bookinginfo")}>
            Bookings
          </Menu.Item>
        </Menu>
      </Sider>

      {/* Main Layout */}
      <Layout style={{ marginLeft: 250, minHeight: "100vh" }}>
        {/* Header */}
        <Header
          style={{
            padding: "0 24px",
            background: "#53d726",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "sticky",
            top: 0,
            zIndex: 1,
          }}
        >
          <Title level={4} style={{ margin: 0, color: "#fff" }}>
            Delete Assistant Dashboard
          </Title>
          <LiveClock />
        </Header>

        {/* Content */}
        <Content style={{ margin: "24px 16px", overflowY: "auto", maxHeight: "calc(100vh - 64px)" }}>
          <div style={{ padding: 24, background: "#f9fafb", borderRadius: 12 }}>
            <p style={{ color: "#555", marginBottom: "2rem", fontSize: "1rem" }}>
              View and delete assistants from your portal.
            </p>

            {loading ? (
              <p style={{ color: "#666" }}>Loading assistants...</p>
            ) : assistants.length > 0 ? (
              <div style={{ display: "grid", gap: "1.5rem" }}>
                {assistants.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      backgroundColor: "white",
                      padding: "1.5rem",
                      borderRadius: "12px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      transition: "box-shadow 0.3s ease",
                      borderLeft: "4px solid #f44336",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 15px rgba(0,0,0,0.15)")}
                    onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)")}
                  >
                    <div>
                      <h3 style={{ margin: "0 0 0.5rem 0", color: "#181c2e" }}>{item.name}</h3>
                      <p style={{ margin: "0.25rem 0", color: "#555" }}><strong>Email:</strong> {item.email}</p>
                      <p style={{ margin: "0.25rem 0", color: "#555" }}><strong>NIC/Passport:</strong> {item.nicOrPassport}</p>
                      <p style={{ margin: "0.25rem 0", color: "#555" }}><strong>Phone:</strong> {item.contactNumber || "N/A"}</p>
                      <p style={{ margin: "0.25rem 0", color: "#555" }}><strong>Address:</strong> {item.address}</p>
                    </div>

                    <Popconfirm
                      title="Are you sure to delete this assistant?"
                      onConfirm={() => handleDelete(item.id)}
                      okText="Yes"
                      cancelText="No"
                    >
                      <button style={deleteButtonStyle} aria-label={`Delete assistant ${item.name}`}>
                        <DeleteOutlined style={{ fontSize: "18px", color: "white" }} />
                      </button>
                    </Popconfirm>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: "#777" }}>No assistants found.</p>
            )}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}

const deleteButtonStyle = {
  backgroundColor: "#dc3545",
  border: "none",
  borderRadius: "6px",
  padding: "8px 12px",
  cursor: "pointer",
  transition: "background-color 0.3s ease",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 2px 6px rgba(220, 53, 69, 0.4)",
};

export default DELETEASSISTANT;
