import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase/db";
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { Layout, Menu, Button, Space, Typography } from "antd";
import {
  TeamOutlined,
  UserAddOutlined,
  UserDeleteOutlined,
  DashboardOutlined,
  UserOutlined,
  ScheduleOutlined,
  ReloadOutlined,
} from "@ant-design/icons";

// Import default assistant image
import defaultAssistImg from "../../Photos/Assist.jpg";

const { Header, Content, Sider } = Layout;
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
    <span style={{ fontSize: "0.9rem", color: "#fff", fontWeight: "bold" }}>
  {currentTime.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
</span>
<span style={{ fontWeight: "bold", fontSize: "1rem", color: "#fff" }}>
  {currentTime.toLocaleTimeString()}
</span>

    </Space>
  );
};

const ADDASSISTANT = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [assistants, setAssistants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newAssistant, setNewAssistant] = useState({
    name: "",
    email: "",
    gender: "",
    dob: "",
    contactNumber: "",
    nicOrPassport: "",
    address: "",
    password: "",
  });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  useEffect(() => {
    const fetchAssistants = async () => {
      try {
        setLoading(true);
        const q = query(collection(db, "users"), where("role", "==", "Assistant"));
        const snapshot = await getDocs(q);
        const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setAssistants(list);
      } catch (error) {
        console.error("Error fetching assistants:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAssistants();
  }, []);

  const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const age = new Date().getFullYear() - birthDate.getFullYear();
    const month = new Date().getMonth() - birthDate.getMonth();
    return month < 0 || (month === 0 && new Date().getDate() < birthDate.getDate())
      ? age - 1
      : age;
  };

  const addAssistant = async () => {
    const age = calculateAge(newAssistant.dob);
    if (age < 18) return alert("Assistant must be at least 18 years old.");

    try {
      await addDoc(collection(db, "users"), { ...newAssistant, role: "Assistant" });
      alert("Assistant added successfully");
      setNewAssistant({
        name: "",
        email: "",
        gender: "",
        dob: "",
        contactNumber: "",
        nicOrPassport: "",
        address: "",
        password: "",
      });
      const q = query(collection(db, "users"), where("role", "==", "Assistant"));
      const snapshot = await getDocs(q);
      setAssistants(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error adding assistant:", error);
    }
  };

  const saveAssistant = async (id) => {
    const assistant = assistants.find((a) => a.id === id);
    if (!assistant) return;

    if (assistant.dob && calculateAge(assistant.dob) < 18) {
      return alert("Assistant must be at least 18 years old.");
    }

    try {
      const docRef = doc(db, "users", id);
      await updateDoc(docRef, {
        name: assistant.name,
        email: assistant.email,
        gender: assistant.gender,
        dob: assistant.dob,
        contactNumber: assistant.contactNumber,
        nicOrPassport: assistant.nicOrPassport,
        address: assistant.address,
      });
      alert("Assistant updated successfully");
      setEditId(null);
    } catch (error) {
      console.error("Error updating assistant:", error);
      alert("Failed to update assistant");
    }
  };

  if (!user) return null;

  return (
    <Layout style={{ minHeight: "100vh", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      {/* Sidebar */}
      <Sider width={250} style={{ background: "#181c2e", height: "100vh", position: "fixed", left: 0, top: 0, overflow: "auto" }}>
        <div style={{ height: 64, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 600, fontSize: "1.2rem" }}>
          <TeamOutlined style={{ marginRight: 8 }} /> Doctor Portal
        </div>
        <Menu theme="dark" mode="inline" defaultSelectedKeys={["assistants"]} style={{ background: "transparent" }}>
          <Menu.Item key="dashboard" icon={<DashboardOutlined />} onClick={() => navigate("/Admin")}>
            Dashboard
          </Menu.Item>
          <Menu.SubMenu key="assistants" icon={<DashboardOutlined />} title="Assistants">
            <Menu.Item key="add-assistant" icon={<UserAddOutlined />} onClick={() => navigate("/ADDASSITANT")}>
              Add Assistant
            </Menu.Item>
            <Menu.Item key="delete-assistant" icon={<UserDeleteOutlined />} onClick={() => navigate("/DELETEASSISTANT")}>
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
        <Header style={{ padding: "0 24px", background: "#53d726", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 1 }}>
          <Title level={4} style={{ margin: 0, color: "#fff", fontSize: "1.5rem" }}>
            Add Assistant Dashboard
          </Title>
          <Space>
            <LiveClock />
            {/* <Button type="primary" icon={<ReloadOutlined />} onClick={() => navigate("/ResetPassword")}>
              Reset Password
            </Button> */}
          </Space>
        </Header>

        <Content style={{ margin: "24px 16px", overflowY: "auto", maxHeight: "calc(100vh - 64px)" }}>
          <div style={{ padding: 24, background: "#f9fafb", borderRadius: 12 }}>
            {/* <h2 style={{ fontWeight: 700, fontSize: "2rem", color: "#181c2e" }}>Welcome</h2> */}
            <p style={{ color: "#555", marginBottom: "2rem", fontSize: "1rem" }}>
              Manage your assistants and update their details.
            </p>

            {/* Assistant List */}
            <section>
              <h3 style={{ marginBottom: "1rem", color: "#181c2e", fontSize: "1.2rem" }}>Assistant List</h3>
              {loading ? (
                <p style={{ color: "#666" }}>Loading assistants...</p>
              ) : assistants.length > 0 ? (
                <div style={{ display: "grid", gap: "1.5rem" }}>
                  {assistants.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        position: "relative",
                        backgroundColor: "white",
                        padding: "1.5rem",
                        borderRadius: "12px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        transition: "box-shadow 0.3s ease",
                        borderLeft: `4px solid #199121ff`,
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 15px rgba(0,0,0,0.15)")}
                      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)")}
                    >
                      <img
                        src={item.imageUrl || defaultAssistImg}
                        alt={item.name}
                        style={{
                           position: "absolute",
                           top: editId === item.id ? "12px" : "12px", // same top
                           right: editId === item.id ? "12px" : "12px",
                           width: editId === item.id ? "100px" : "200px", // shrink when editing
                          height: editId === item.id ? "100px" : "200px",
                              objectFit: "cover",
                             borderRadius: "8px",
                              border: "2px solid #53d726",
                              transition: "all 0.3s ease", // smooth resize
                        }}
                      />

                      {editId === item.id ? (
                        <>
                          <input
                            style={inputStyle}
                            type="text"
                            value={item.name}
                            placeholder="Name"
                            onChange={(e) =>
                              setAssistants(
                                assistants.map((a) => (a.id === item.id ? { ...a, name: e.target.value } : a))
                              )
                            }
                          />
                          <input
                            style={inputStyle}
                            type="email"
                            value={item.email}
                            placeholder="Email"
                            onChange={(e) =>
                              setAssistants(
                                assistants.map((a) => (a.id === item.id ? { ...a, email: e.target.value } : a))
                              )
                            }
                          />
                          <select
                            style={inputStyle}
                            value={item.gender}
                            onChange={(e) =>
                              setAssistants(
                                assistants.map((a) => (a.id === item.id ? { ...a, gender: e.target.value } : a))
                              )
                            }
                          >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                          <input
                            style={inputStyle}
                            type="date"
                            value={item.dob}
                            onChange={(e) =>
                              setAssistants(
                                assistants.map((a) => (a.id === item.id ? { ...a, dob: e.target.value } : a))
                              )
                            }
                          />
                          <input
                            style={inputStyle}
                            type="text"
                            value={item.nicOrPassport}
                            placeholder="NIC/Passport"
                            onChange={(e) =>
                              setAssistants(
                                assistants.map((a) => (a.id === item.id ? { ...a, nicOrPassport: e.target.value } : a))
                              )
                            }
                          />
                          <input
                            style={inputStyle}
                            type="text"
                            value={item.contactNumber}
                            placeholder="Contact Number"
                            onChange={(e) =>
                              setAssistants(
                                assistants.map((a) => (a.id === item.id ? { ...a, contactNumber: e.target.value } : a))
                              )
                            }
                          />
                          <input
                            style={inputStyle}
                            type="text"
                            value={item.address}
                            placeholder="Address"
                            onChange={(e) =>
                              setAssistants(
                                assistants.map((a) => (a.id === item.id ? { ...a, address: e.target.value } : a))
                              )
                            }
                          />
                          <div style={{ marginTop: "0.5rem" }}>
                            <button
                              style={{ ...buttonStyle, backgroundColor: "#28a745", marginRight: "0.5rem" }}
                              onClick={() => saveAssistant(item.id)}
                            >
                              Save
                            </button>
                            <button
                              style={{ ...buttonStyle, backgroundColor: "#dc3545" }}
                              onClick={() => setEditId(null)}
                            >
                              Cancel
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <h3 style={{ margin: "0 0 0.5rem 0", color: "#181c2e", fontSize: "1.2rem" }}>{item.name}</h3>
                          <p><strong>Email:</strong> {item.email}</p>
                          <p><strong>Gender:</strong> {item.gender}</p>
                          <p><strong>DOB:</strong> {item.dob}</p>
                          <p><strong>NIC/Passport:</strong> {item.nicOrPassport}</p>
                          <p><strong>Phone:</strong> {item.contactNumber || "N/A"}</p>
                          <p><strong>Address:</strong> {item.address}</p>
                          <p><strong>Status:</strong> {item.role || "N/A"}</p>
                          <button style={{ ...buttonStyle, backgroundColor: "#53d726" }} onClick={() => setEditId(item.id)}>
                            Edit
                          </button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: "#777" }}>No assistants found.</p>
              )}
            </section>

            {/* Add New Assistant Form */}
            <section style={{ marginTop: "3rem" }}>
              <h3 style={{ marginBottom: "1rem", color: "#181c2e" }}>Add New Assistant</h3>
              <div
                style={{
                  backgroundColor: "white",
                  padding: "1.5rem",
                  borderRadius: "12px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  maxWidth: "600px",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                  borderLeft: `4px solid #199121ff`,
                }}
              >
                <input
                  style={inputStyle}
                  type="text"
                  placeholder="Name"
                  value={newAssistant.name}
                  onChange={(e) => setNewAssistant({ ...newAssistant, name: e.target.value })}
                />
                <input
                  style={inputStyle}
                  type="email"
                  placeholder="Email"
                  value={newAssistant.email}
                  onChange={(e) => setNewAssistant({ ...newAssistant, email: e.target.value })}
                />
                <select
                  style={inputStyle}
                  value={newAssistant.gender}
                  onChange={(e) => setNewAssistant({ ...newAssistant, gender: e.target.value })}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                <input
                  style={inputStyle}
                  type="date"
                  value={newAssistant.dob}
                  onChange={(e) => setNewAssistant({ ...newAssistant, dob: e.target.value })}
                />
                <input
                  style={inputStyle}
                  type="text"
                  placeholder="Contact Number"
                  value={newAssistant.contactNumber}
                  onChange={(e) => setNewAssistant({ ...newAssistant, contactNumber: e.target.value })}
                />
                <input
                  style={inputStyle}
                  type="text"
                  placeholder="NIC/Passport"
                  value={newAssistant.nicOrPassport}
                  onChange={(e) => setNewAssistant({ ...newAssistant, nicOrPassport: e.target.value })}
                />
                <input
                  style={inputStyle}
                  type="text"
                  placeholder="Address"
                  value={newAssistant.address}
                  onChange={(e) => setNewAssistant({ ...newAssistant, address: e.target.value })}
                />
                <input
                  style={inputStyle}
                  type="password"
                  placeholder="Password"
                  value={newAssistant.password}
                  onChange={(e) => setNewAssistant({ ...newAssistant, password: e.target.value })}
                />
                <div style={{ gridColumn: "span 2", textAlign: "right" }}>
                  <button style={{ ...buttonStyle, backgroundColor: "#53d726" }} onClick={addAssistant}>
                    Add Assistant
                  </button>
                </div>
              </div>
            </section>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

// Input and Button styles
const inputStyle = {
  padding: "10px 12px",
  fontSize: "0.95rem",
  borderRadius: "6px",
  border: "1px solid #d9d9d9",
  outline: "none",
  transition: "border-color 0.3s ease",
  width: "100%",
  boxSizing: "border-box",
  backgroundColor: "#fafafa",
};

const buttonStyle = {
  padding: "10px 20px",
  border: "none",
  borderRadius: "6px",
  color: "white",
  fontWeight: "600",
  cursor: "pointer",
  transition: "background-color 0.3s ease",
  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
};

export default ADDASSISTANT;
