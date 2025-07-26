import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebase/db';
import { collection, getDocs, query, where, addDoc, doc, updateDoc } from 'firebase/firestore';
import Sidebar from './Sidebar';

const DoctorProfile = () => {
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
    password: ""
  });

  const [editId, setEditId] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchAssistants = async () => {
      try {
        setLoading(true);
        const q = query(collection(db, "users"), where("role", "==", "Assistant"));
        const querySnapshot = await getDocs(q);
        const assistantList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAssistants(assistantList);
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
    return month < 0 || (month === 0 && new Date().getDate() < birthDate.getDate()) ? age - 1 : age;
  };

  const addAssistant = async () => {
    const age = calculateAge(newAssistant.dob);
    if (age < 18) {
      alert("Assistant must be at least 18 years old.");
      return;
    }

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
        password: ""
      });
      // Refresh assistants list
      const q = query(collection(db, "users"), where("role", "==", "Assistant"));
      const querySnapshot = await getDocs(q);
      const assistantList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAssistants(assistantList);
    } catch (error) {
      console.error("Error adding assistant: ", error);
    }
  };

  // Save edited assistant info
  const saveAssistant = async (id) => {
    const assistant = assistants.find(a => a.id === id);

    // Optionally validate age on edit dob field
    if (assistant.dob) {
      const age = calculateAge(assistant.dob);
      if (age < 18) {
        alert("Assistant must be at least 18 years old.");
        return;
      }
    }

    try {
      const docRef = doc(db, "users", id);
      // Update only allowed fields
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
    <div className="container">
      <Sidebar user={user} />
      <div className="main-content">
        <h2 className="welcome-header0">Welcome</h2>
        <p className="welcome-text">Manage your assistants and update their details.</p>

        <h3>Assistant List</h3>
        {loading ? (
          <p>Loading assistants...</p>
        ) : assistants.length > 0 ? (
          assistants.map((item) => (
            <div key={item.id} className="appointment-card">
              {editId === item.id ? (
                <>
                  <input
                    className="input-field"
                    type="text"
                    value={item.name}
                    onChange={(e) => setAssistants(assistants.map(a => a.id === item.id ? { ...a, name: e.target.value } : a))}
                    placeholder="Name"
                  />
                  <input
                    className="input-field"
                    type="email"
                    value={item.email}
                    onChange={(e) => setAssistants(assistants.map(a => a.id === item.id ? { ...a, email: e.target.value } : a))}
                    placeholder="Email"
                  />
                  <select
                    className="input-field"
                    value={item.gender}
                    onChange={(e) => setAssistants(assistants.map(a => a.id === item.id ? { ...a, gender: e.target.value } : a))}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  <input
                    className="input-field"
                    type="date"
                    value={item.dob}
                    onChange={(e) => setAssistants(assistants.map(a => a.id === item.id ? { ...a, dob: e.target.value } : a))}
                  />
                  <input
                    className="input-field"
                    type="text"
                    value={item.contactNumber}
                    onChange={(e) => setAssistants(assistants.map(a => a.id === item.id ? { ...a, contactNumber: e.target.value } : a))}
                    placeholder="Contact Number"
                  />
                  <input
                    className="input-field"
                    type="text"
                    value={item.nicOrPassport}
                    onChange={(e) => setAssistants(assistants.map(a => a.id === item.id ? { ...a, nicOrPassport: e.target.value } : a))}
                    placeholder="NIC/Passport Number"
                  />
                  <input
                    className="input-field"
                    type="text"
                    value={item.address}
                    onChange={(e) => setAssistants(assistants.map(a => a.id === item.id ? { ...a, address: e.target.value } : a))}
                    placeholder="Home Address"
                  />

                  <button className="button" onClick={() => saveAssistant(item.id)}>Save</button>
                  <button className="d-button" onClick={() => setEditId(null)}>Cancel</button>
                </>
              ) : (
                <>
                  <h3>{item.name}</h3>
                  <p><strong>Email:</strong> {item.email}</p>
                  <p><strong>Gender:</strong> {item.gender}</p>
                  <p><strong>NIC/Passport:</strong> {item.nicOrPassport}</p>
                  <p><strong>Date of Birth:</strong> {item.dob}</p>
                  <p><strong>Telephone Number:</strong> {item.contactNumber || "N/A"}</p>
                  <p><strong>Status:</strong> {item.role || "N/A"}</p>
                  <button className="button" onClick={() => setEditId(item.id)}>Edit</button>
                </>
              )}
            </div>
          ))
        ) : (
          <p>No assistants found.</p>
        )}

        <h3>Add New Assistant</h3>
        <div className="add-user-section">
          <input className="input-field" type="text" placeholder="Name" value={newAssistant.name} onChange={(e) => setNewAssistant({ ...newAssistant, name: e.target.value })} />
          <input className="input-field" type="email" placeholder="Email" value={newAssistant.email} onChange={(e) => setNewAssistant({ ...newAssistant, email: e.target.value })} />
          <select className="input-field" value={newAssistant.gender} onChange={(e) => setNewAssistant({ ...newAssistant, gender: e.target.value })}>
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          <input className="input-field" type="date" placeholder="Date of Birth" value={newAssistant.dob} onChange={(e) => setNewAssistant({ ...newAssistant, dob: e.target.value })} />
          <input className="input-field" type="text" placeholder="Contact Number" value={newAssistant.contactNumber} onChange={(e) => setNewAssistant({ ...newAssistant, contactNumber: e.target.value })} />
          <input className="input-field" type="text" placeholder="NIC/Passport Number" value={newAssistant.nicOrPassport} onChange={(e) => setNewAssistant({ ...newAssistant, nicOrPassport: e.target.value })} />
          <input className="input-field" type="text" placeholder="Home Address" value={newAssistant.address} onChange={(e) => setNewAssistant({ ...newAssistant, address: e.target.value })} />
          <input className="input-field" type="password" placeholder="Password" value={newAssistant.password} onChange={(e) => setNewAssistant({ ...newAssistant, password: e.target.value })} />
          <button className="button" onClick={addAssistant}>Add Assistant</button>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;
