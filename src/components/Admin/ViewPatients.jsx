import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase/db";
import {
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
} from "firebase/firestore";
import {
  Layout,
  Menu,
  Typography,
  Space,
  Button,
  Checkbox,
  Spin,
  Card,
  Input,
} from "antd";
import {
  DashboardOutlined,
  TeamOutlined,
  UserAddOutlined,
  UserDeleteOutlined,
  UserOutlined,
  ScheduleOutlined,
  MedicineBoxOutlined,
} from "@ant-design/icons";

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

// Live clock
const LiveClock = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <Space style={{ color: "#fff", fontSize: "0.9rem" }}>
      <span>
        {currentTime.toLocaleDateString(undefined, {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </span>
      <span style={{ fontWeight: "bold" }}>
        {currentTime.toLocaleTimeString()}
      </span>
    </Space>
  );
};

const ViewPatient = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatients, setSelectedPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, "users"), where("role", "==", "Patient"));
      const snapshot = await getDocs(q);
      const patientList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPatients(patientList);
    } catch (err) {
      console.error("Error fetching patients:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleSelect = (id) => {
    setSelectedPatients((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedPatients.length === patients.length) {
      setSelectedPatients([]);
    } else {
      setSelectedPatients(patients.map((p) => p.id));
    }
  };

  const handleDelete = async () => {
    if (selectedPatients.length === 0) {
      alert("No patients selected.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete selected patient(s)?"))
      return;

    try {
      for (const id of selectedPatients) {
        await deleteDoc(doc(db, "users", id));
      }
      alert("Selected patients deleted.");
      setSelectedPatients([]);
      fetchPatients();
    } catch (error) {
      console.error("Error deleting patients:", error);
    }
  };

  // Filtered patients
  const filteredPatients = patients.filter((patient) =>
    patient.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user) return null;

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Fixed Sidebar */}
      <Sider
        width={250}
        style={{
          background: "#181c2e",
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
        }}
      >
        <div
          style={{
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
          }}
        >
          <MedicineBoxOutlined style={{ marginRight: 10 }} /> Ariana Labs
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={["patients"]}
          style={{ background: "transparent", borderRight: 0 }}
        >
          <Menu.Item
            key="dashboard"
            icon={<DashboardOutlined />}
            onClick={() => navigate("/admin")}
          >
            Dashboard
          </Menu.Item>
          <Menu.SubMenu
            key="assistants"
            icon={<TeamOutlined />}
            title="Assistants"
          >
            <Menu.Item
              key="add-assistant"
              icon={<UserAddOutlined />}
              onClick={() => navigate("/ADDASSISTANT")}
            >
              Add Assistant
            </Menu.Item>
            <Menu.Item
              key="manage-assistants"
              icon={<UserDeleteOutlined />}
              onClick={() => navigate("/DELETEASSISTANT")}
            >
              Delete Assistants
            </Menu.Item>
          </Menu.SubMenu>
          <Menu.Item
            key="patients"
            icon={<UserOutlined />}
            onClick={() => navigate("/ViewPatient")}
          >
            Patients
          </Menu.Item>
          <Menu.Item
            key="bookings"
            icon={<ScheduleOutlined />}
            onClick={() => navigate("/Bookinginfo")}
          >
            Bookings
          </Menu.Item>
        </Menu>
      </Sider>

      {/* Main Layout with margin for fixed sidebar */}
      <Layout style={{ marginLeft: 250 }}>
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
            View Patients
          </Title>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Input
              placeholder="Search patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: 200 }}
            />
            <LiveClock />
          </div>
        </Header>

        {/* Content */}
        <Content style={{ margin: "24px", minHeight: 280 }}>
          {loading ? (
            <Spin tip="Loading patients..." />
          ) : filteredPatients.length > 0 ? (
            <>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "16px",
                  alignItems: "center",
                }}
              >
                <Checkbox
                  onChange={handleSelectAll}
                  checked={
                    selectedPatients.length === patients.length &&
                    patients.length > 0
                  }
                >
                  Select All
                </Checkbox>
                <Button danger onClick={handleDelete}>
                  Delete Selected
                </Button>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fill, minmax(300px, 1fr))",
                  gap: "16px",
                }}
              >
                {filteredPatients.map((patient) => (
                  <Card
                    key={patient.id}
                    title={patient.name}
                    extra={
                      <Checkbox
                        checked={selectedPatients.includes(patient.id)}
                        onChange={() => handleSelect(patient.id)}
                      />
                    }
                    style={{
                      border: "2px solid #53d726",
                      borderRadius: "10px",
                      boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                      margin: "10px",
                    }}
                  >
                    <p>
                      <strong>Email:</strong> {patient.email}
                    </p>
                    <p>
                      <strong>Gender:</strong> {patient.gender}
                    </p>
                    <p>
                      <strong>Date of Birth:</strong> {patient.dob}
                    </p>
                    <p>
                      <strong>Contact Number:</strong> {patient.contactNumber}
                    </p>
                    <p>
                      <strong>NIC/Passport:</strong> {patient.nicOrPassport}
                    </p>
                    <p>
                      <strong>Address:</strong> {patient.address}
                    </p>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <p>No patients found.</p>
          )}
        </Content>
      </Layout>
    </Layout>
  );
};

export default ViewPatient;
