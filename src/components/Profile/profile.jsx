// src/components/DoctorProfile.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebase/db';
import { collection, getDocs, query, where, doc, deleteDoc } from 'firebase/firestore';
import Sidebar from './Sidebar';
import PatientRegistration from './PatientRegistration';

const DoctorProfile = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("Assistant");
  const [showRegistration, setShowRegistration] = useState(false);

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const q = query(collection(db, "users"), where("role", "==", view));
        const querySnapshot = await getDocs(q);

        const userList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setData(userList);
      } catch (error) {
        console.error(`Error fetching ${view}:`, error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [view]);

  const deleteUser = async (id) => {
    try {
      await deleteDoc(doc(db, "users", id));
      setData(data.filter(user => user.id !== id));
    } catch (error) {
      console.error("Error deleting user: ", error);
    }
  };

  if (!user) return null;

  return (
    <div style={styles.container}>
      {/* Fixed Sidebar */}
      <div style={styles.sidebarWrapper}>
        <Sidebar user={user} />
      </div>

      {/* Scrollable Main Section */}
      <div style={styles.mainContent}>
        <div style={styles.contentWrapper}>
          <h2 style={styles.title}>👋 Welcome, {user.name || "User"}</h2>
          <p style={styles.subtitle}>
            Manage your profile, view assistants/patients, and update details.
          </p>

          {/* View Toggle */}
          <div style={styles.toggleContainer}>
            <button
              style={{
                ...styles.toggleButton,
                background: view === "Assistant" ? "#3498db" : "#eaeff5",
                color: view === "Assistant" ? "#fff" : "#2c3e50",
                boxShadow: view === "Assistant" ? "0px 3px 8px rgba(0,0,0,0.15)" : "none",
              }}
              onClick={() => {
                setView("Assistant");
                setShowRegistration(false);
              }}
            >
              Assistants
            </button>
            <button
              style={{
                ...styles.toggleButton,
                background: view === "Patient" ? "#3498db" : "#eaeff5",
                color: view === "Patient" ? "#fff" : "#2c3e50",
                boxShadow: view === "Patient" ? "0px 3px 8px rgba(0,0,0,0.15)" : "none",
              }}
              onClick={() => setView("Patient")}
            >
              Patients
            </button>
          </div>

          {/* Add Patient Button */}
          {view === "Patient" && (
            <button
              style={styles.addButton}
              onClick={() => setShowRegistration(!showRegistration)}
            >
              {showRegistration ? 'Hide Registration' : 'Add New Patient'}
            </button>
          )}

          {/* Patient Registration Form */}
          {showRegistration && view === "Patient" && (
            <PatientRegistration
              onPatientAdded={(newPatient) => {
                setData([...data, newPatient]);
                setShowRegistration(false);
              }}
              onCancel={() => setShowRegistration(false)}
            />
          )}

          <h3 style={styles.listTitle}>{view} List</h3>

          {loading ? (
            <p style={styles.loadingText}>Loading {view.toLowerCase()}...</p>
          ) : (
            <div style={styles.cardGrid}>
              {data.length > 0 ? (
                data.map((item) => (
                  <div
                    key={item.id}
                    style={styles.card}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-4px)";
                      e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.12)";
                      e.currentTarget.style.borderColor = "#27ae60";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "none";
                      e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
                      e.currentTarget.style.borderColor = "#2ecc71";
                    }}
                  >
                    <h3 style={styles.cardTitle}>{item.name}</h3>
                    <p><strong>Email:</strong> {item.email}</p>
                    <p><strong>Gender:</strong> {item.gender}</p>
                    <p><strong>NIC/Passport:</strong> {item.nicOrPassport}</p>
                    <p><strong>DOB:</strong> {item.dob}</p>
                    <p><strong>Phone:</strong> {item.contactNumber || "N/A"}</p>
                    <p><strong>Role:</strong> {item.role || "N/A"}</p>
                    <button
                      style={styles.deleteButton}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#c0392b")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "#e74c3c")}
                      onClick={() => deleteUser(item.id)}
                    >
                      🗑 Delete
                    </button>
                  </div>
                ))
              ) : (
                <p style={styles.noDataText}>
                  No {view.toLowerCase()} found.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Styles
const styles = {
  container: {
    display: "flex",
    height: "100vh",
    background: "#f5f7fb",
    fontFamily: "Segoe UI, sans-serif",
    overflow: "hidden",
  },
  sidebarWrapper: {
    position: "fixed",
    top: 0,
    left: 0,
    bottom: 0,
    width: "260px",
    background: "#fff",
    boxShadow: "2px 0 8px rgba(0,0,0,0.1)",
    zIndex: 10,
  },
  mainContent: {
    marginLeft: "260px",
    flex: 1,
    height: "100vh",
    overflowY: "auto",
  },
  contentWrapper: {
    padding: "40px",
  },
  title: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#2c3e50",
    marginBottom: "8px",
  },
  subtitle: {
    fontSize: "16px",
    color: "#7f8c8d",
    marginBottom: "25px",
  },
  toggleContainer: {
    display: "flex",
    gap: "15px",
    marginBottom: "25px",
  },
  toggleButton: {
    padding: "10px 18px",
    border: "none",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "0.3s ease",
  },
  addButton: {
    marginBottom: "20px",
    padding: "10px 18px",
    borderRadius: "8px",
    background: "#2ecc71",
    color: "#fff",
    fontWeight: "600",
    border: "none",
    cursor: "pointer",
  },
  listTitle: {
    fontSize: "20px",
    fontWeight: "600",
    marginBottom: "20px",
    color: "#34495e",
  },
  loadingText: {
    fontSize: "16px",
    color: "#7f8c8d",
    marginTop: "15px",
  },
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "20px",
    paddingBottom: "40px",
  },
  card: {
    background: "#fff",
    borderRadius: "12px",
    padding: "20px",
    border: "2px solid #2ecc71",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    transition: "all 0.2s ease",
  },
  cardTitle: {
    fontSize: "20px",
    fontWeight: "600",
    marginBottom: "12px",
    color: "#34495e",
  },
  deleteButton: {
    marginTop: "12px",
    background: "#e74c3c",
    color: "#fff",
    border: "none",
    padding: "8px 14px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    transition: "0.3s",
  },
  noDataText: {
    fontSize: "16px",
    color: "#7f8c8d",
    marginTop: "15px",
  },
};

export default DoctorProfile;
