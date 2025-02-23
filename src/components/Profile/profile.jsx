import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebase/db'; // Ensure Firebase is correctly initialized
import { collection, getDocs, query, where, addDoc, doc, deleteDoc } from 'firebase/firestore';
import Sidebar from './Sidebar';
import './profile.css'; // Import the CSS file

const DoctorProfile = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("Assistant"); // Toggle between "Doctor" and "Patient"
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    gender: "",
    dob: "",
    contactNumber: "",
    nicOrPassport: "",
    address: "",
    emergencyContactName: "",
    password: "",
    medicalHistory: "", // For Patient
  });

  // Redirect to login if user is not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Fetch data (Doctors, Patients) from Firestore
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log(`Fetching users with role: ${view}`);
        const q = query(collection(db, "users"), where("role", "==", view));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          console.log(`No ${view} found in Firestore.`);
        }

        const userList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        console.log("Fetched Data:", userList);
        setData(userList);
      } catch (error) {
        console.error(`Error fetching ${view}:`, error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [view]);

  const addUser = async () => {
    // Validate age
    const age = calculateAge(newUser.dob);
    if (age < 18) {
      alert("User must be at least 18 years old.");
      return;
    }

    try {
      const docRef = await addDoc(collection(db, "users"), { ...newUser, role: view });
      console.log("User added with ID: ", docRef.id);
      setNewUser({
        name: "",
        email: "",
        gender: "",
        dob: "",
        contactNumber: "",
        nicOrPassport: "",
        address: "",
        emergencyContactName: "",
        password: "",
        medicalHistory: "", // For Patient
      });
    } catch (error) {
      console.error("Error adding user: ", error);
    }
  };

  const deleteUser = async (id) => {
    try {
      await deleteDoc(doc(db, "users", id));
      setData(data.filter(user => user.id !== id));
      console.log("User deleted with ID: ", id);
    } catch (error) {
      console.error("Error deleting user: ", error);
    }
  };

  // Calculate age from Date of Birth
  const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const age = new Date().getFullYear() - birthDate.getFullYear();
    const month = new Date().getMonth() - birthDate.getMonth();
    if (month < 0 || (month === 0 && new Date().getDate() < birthDate.getDate())) {
      return age - 1;
    }
    return age;
  };

  if (!user) return null;

  return (
    <div className="container">
      <Sidebar user={user} />
      <div className="main-content">
        <h2 className="welcome-header">Welcome,  {user.name || "User "}</h2>
        <p className="welcome-text">Manage your profile, view appointments, and update details.</p>

        <div>
          <button className="button" onClick={() => setView("Assistant")} disabled={view === "Assistant"}>View Doctors</button>
          <button className="button" onClick={() => setView("Patient")} disabled={view === "Patient"}>View Patients</button>
        </div>

        <h3>{view} List</h3>
        {loading ? (
          <p>Loading {view.toLowerCase()}...</p>
        ) : (
          data.length > 0 ? (
            data.map((item) => (
              <div key={item.id} className="appointment-card">
                <h3>{item.name}</h3>
                <p><strong>Email:</strong> {item.email}</p>
                <p><strong>Gender:</strong> {item.gender}</p>
                <p><strong>NIC/Passport:</strong> {item.nicOrPassport}</p>
                <p><strong>Date of Birth:</strong> {item.dob}</p>
                <p><strong>Teliphone Number:</strong> {item.contactNumber || "N/A"}</p>
                {view === "Doctor" && <p><strong>Status:</strong> {item.role || "N/A"}</p>}
                {view === "Patient" && <p><strong>Status:</strong> {item.role || "N/A"}</p>}
                <button className="button" onClick={() => deleteUser(item.id)}>Delete</button>
              </div>
            ))
          ) : (
            <p>No {view.toLowerCase()} found.</p>
          )
        )}

        <h3>Add New {view}</h3>
        <div className="add-user-section">
          <input className="input-field" type="text" placeholder="Name" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} />
          <input className="input-field" type="email" placeholder="Email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
          
          <select className="input-field" value={newUser.gender} onChange={(e) => setNewUser({ ...newUser, gender: e.target.value })}>
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>

          <input className="input-field" type="date" placeholder="Date of Birth" value={newUser.dob} onChange={(e) => setNewUser({ ...newUser, dob: e.target.value })} />
          <input className="input-field" type="text" placeholder="Contact Number" value={newUser.contactNumber} onChange={(e) => setNewUser({ ...newUser, contactNumber: e.target.value })} />
          <input className="input-field" type="text" placeholder="NIC/Passport Number" value={newUser.nicOrPassport} onChange={(e) => setNewUser({ ...newUser, nicOrPassport: e.target.value })} />
          <input className="input-field" type="text" placeholder="Home Address" value={newUser.address} onChange={(e) => setNewUser({ ...newUser, address: e.target.value })} />
          
          
          {/* {view === "Patient" && <input className="input-field" type="text" placeholder="Medical History" value={newUser.medicalHistory} onChange={(e) => setNewUser({ ...newUser, medicalHistory: e.target.value })} />} */}
          
          <input className="input-field" type="password" placeholder="Password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} />
          
          <button className="button" onClick={addUser}>Add {view}</button>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;
