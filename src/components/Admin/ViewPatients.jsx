import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebase/db';
import { collection, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';
import Sidebar from './Sidebar';
import './patient.css';

const ViewPatient = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatients, setSelectedPatients] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, "users"), where("role", "==", "Patient"));
      const snapshot = await getDocs(q);
      const patientList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
    setSelectedPatients(prev =>
      prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedPatients.length === patients.length) {
      setSelectedPatients([]);
    } else {
      setSelectedPatients(patients.map(p => p.id));
    }
  };

  const handleDelete = async () => {
    if (selectedPatients.length === 0) {
      alert("No patients selected.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete selected patient(s)?")) return;

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

  if (!user) return null;

  return (
    <div className="container">
      <Sidebar user={user} />
      <div className="main-content">
        <h2 className="welcome-header0">Welcome</h2>
        <p className="welcome-text">Manage patient profiles and add new entries.</p>

        <div className="top-bar">
          <h3 className="count-title">Patient List ({patients.length})</h3>
          {patients.length > 0 && (
            <div className="action-bar">
              <label>
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={selectedPatients.length === patients.length}
                /> Select All
              </label>
              <button className="delete-button" onClick={handleDelete}>
                Delete Selected
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <p>Loading patients...</p>
        ) : patients.length > 0 ? (
          patients.map((patient) => (
            <div key={patient.id} className="appointment-card">
              <div className="checkbox-container">
                <input
                  type="checkbox"
                  checked={selectedPatients.includes(patient.id)}
                  onChange={() => handleSelect(patient.id)}
                />
              </div>
              <div className="patient-info">
                <h3>{patient.name}</h3>
                <p><strong>Email:</strong> {patient.email}</p>
                <p><strong>Gender:</strong> {patient.gender}</p>
                <p><strong>Date of Birth:</strong> {patient.dob}</p>
                <p><strong>Contact Number:</strong> {patient.contactNumber}</p>
                <p><strong>NIC/Passport:</strong> {patient.nicOrPassport}</p>
                <p><strong>Address:</strong> {patient.address}</p>
              </div>
            </div>
          ))
        ) : (
          <p>No patients found.</p>
        )}
      </div>
    </div>
  );
};

export default ViewPatient;
