// src/components/DoctorProfile.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebase/db';
import { collection, getDocs, query, where, doc, deleteDoc } from 'firebase/firestore';
import Sidebar from './Sidebar';

const DoctorProfile = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("Assistant");

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
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
    <div style={{ display: "flex", minHeight: "100vh", background: "#f5f7fb", fontFamily: "Segoe UI, sans-serif" }}>
      <Sidebar user={user} />
      <div style={{ flex: 1, padding: "40px" }}>
        <h2 style={{ fontSize: "28px", fontWeight: "700", color: "#2c3e50", marginBottom: "8px" }}>
          👋 Welcome, {user.name || "User"}
        </h2>
        <p style={{ fontSize: "16px", color: "#7f8c8d", marginBottom: "25px" }}>
          Manage your profile, view assistants/patients, and update details.
        </p>

        {/* Toggle buttons */}
        <div style={{ display: "flex", gap: "15px", marginBottom: "25px" }}>
          <button
            style={{
              padding: "10px 18px",
              border: "none",
              borderRadius: "8px",
              background: view === "Assistant" ? "#3498db" : "#eaeff5",
              color: view === "Assistant" ? "#fff" : "#2c3e50",
              fontWeight: "600",
              cursor: "pointer",
              boxShadow: view === "Assistant" ? "0px 3px 8px rgba(0,0,0,0.15)" : "none",
              transition: "0.3s ease"
            }}
            onClick={() => setView("Assistant")}
          >
            Assistants
          </button>
          <button
            style={{
              padding: "10px 18px",
              border: "none",
              borderRadius: "8px",
              background: view === "Patient" ? "#3498db" : "#eaeff5",
              color: view === "Patient" ? "#fff" : "#2c3e50",
              fontWeight: "600",
              cursor: "pointer",
              boxShadow: view === "Patient" ? "0px 3px 8px rgba(0,0,0,0.15)" : "none",
              transition: "0.3s ease"
            }}
            onClick={() => setView("Patient")}
          >
            Patients
          </button>
        </div>

        <h3 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "20px", color: "#34495e" }}>
          {view} List
        </h3>

        {loading ? (
          <p style={{ fontSize: "16px", color: "#7f8c8d", marginTop: "15px" }}>
            Loading {view.toLowerCase()}...
          </p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
            {data.length > 0 ? (
              data.map((item) => (
                <div
                  key={item.id}
                  style={{
                    background: "#fff",
                    borderRadius: "12px",
                    padding: "20px",
                    border: "2px solid #2ecc71", // ✅ Green border
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.3s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.12)";
                    e.currentTarget.style.borderColor = "#27ae60"; // ✅ Darker green on hover
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "none";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
                    e.currentTarget.style.borderColor = "#2ecc71";
                  }}
                >
                  <h3 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "12px", color: "#34495e" }}>
                    {item.name}
                  </h3>
                  <p><strong>Email:</strong> {item.email}</p>
                  <p><strong>Gender:</strong> {item.gender}</p>
                  <p><strong>NIC/Passport:</strong> {item.nicOrPassport}</p>
                  <p><strong>DOB:</strong> {item.dob}</p>
                  <p><strong>Phone:</strong> {item.contactNumber || "N/A"}</p>
                  <p><strong>Role:</strong> {item.role || "N/A"}</p>
                  <button
                    style={{
                      marginTop: "12px",
                      background: "#e74c3c",
                      color: "#fff",
                      border: "none",
                      padding: "8px 14px",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "14px",
                      transition: "0.3s"
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#c0392b")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "#e74c3c")}
                    onClick={() => deleteUser(item.id)}
                  >
                    🗑 Delete
                  </button>
                </div>
              ))
            ) : (
              <p style={{ fontSize: "16px", color: "#7f8c8d", marginTop: "15px" }}>
                No {view.toLowerCase()} found.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorProfile;
