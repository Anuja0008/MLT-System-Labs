// src/components/Profile/Appointments.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar'; // Import the Sidebar component
import { db } from '../../firebase/db'; // Import Firebase
import { collection, query, orderBy, limit, getDocs, deleteDoc, doc, addDoc, updateDoc } from 'firebase/firestore';
import './Appointment.css'; // Import CSS for styling

const Appointments = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [appointments, setAppointments] = useState([]);
  const [latestAppointment, setLatestAppointment] = useState({});
  const [formData, setFormData] = useState({
    patientName: '',
    testType: '',
    date: '',
  });

  // Redirect to login if user is not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Fetch appointments from Firestore
  const fetchAppointments = async () => {
    try {
      const bookingsRef = collection(db, 'Bookings');
      const q = query(bookingsRef, orderBy('timestamp', 'desc'), limit(10)); // Fetch latest 10 appointments
      const querySnapshot = await getDocs(q);

      const appointmentsData = [];
      querySnapshot.forEach((doc) => {
        appointmentsData.push({ id: doc.id, ...doc.data() });
      });

      setAppointments(appointmentsData);
      if (appointmentsData.length > 0) {
        setLatestAppointment(appointmentsData[0]); // Set the latest appointment
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  useEffect(() => {
    fetchAppointments(); // Call the fetchAppointments function on component mount
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'Bookings', id)); // Delete the appointment from Firestore
      alert('Appointment deleted successfully!');
      fetchAppointments(); // Re-fetch appointments after deletion
    } catch (error) {
      console.error('Error deleting appointment:', error);
      alert('Failed to delete appointment. Try again.');
    }
  };

  const handleConfirm = async (id) => {
    try {
      await updateDoc(doc(db, 'Bookings', id), { isConfirmed: true }); // Update the appointment status to confirmed
      alert('Appointment confirmed successfully!');
      fetchAppointments(); // Re-fetch appointments after confirmation
    } catch (error) {
      console.error('Error confirming appointment:', error);
      alert('Failed to confirm appointment. Try again.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await addDoc(collection(db, 'Bookings'), {
        patientName: formData.patientName,
        testType: formData.testType,
        date: formData.date,
        timestamp: new Date(),
        isConfirmed: false, // Default status
      });

      alert('Booking successful!');
      setFormData({ patientName: '', testType: '', date: '' });
      fetchAppointments(); // Re-fetch appointments after booking
    } catch (error) {
      console.error('Error booking appointment:', error);
      alert('Failed to book appointment. Try again.');
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "Arial, sans-serif" }}>
      {/* Sidebar */}
      <Sidebar user={user} />

      {/* Main Content */}
      <div style={{ flex: 1, padding: "20px", backgroundColor: "#ecf0f1", overflowY: "auto", maxHeight: "100vh" }}>
        <h2>Appointments</h2>
        <p>View and manage your upcoming appointments.</p>

        {/* Latest Appointment */}
        <div className="latest-appointment">
          <h3>Latest Appointment</h3>
          {latestAppointment.patientName ? (
            <table>
              <thead>
                <tr>
                  <th>Patient Name</th>
                  <th>Test Type</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{latestAppointment.patientName}</td>
                  <td>{latestAppointment.testType}</td>
                  <td>{latestAppointment.date}</td>
                  <td>{latestAppointment.isConfirmed ? 'Confirmed' : 'Pending'}</td>
                  <td>
                    {!latestAppointment.isConfirmed && (
                      <button onClick={() => handleConfirm(latestAppointment.id)} className="confirm-button">Confirm Booking</button>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          ) : (
            <p>No appointments found.</p>
          )}
        </div>

        {/* Appointment History */}
        <div className="appointment-history">
          <h3>Appointment History</h3>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {appointments.length > 0 ? (
              appointments.map((appointment) => (
                <li key={appointment.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>
                    📅 {appointment.patientName} - {appointment.testType} ({new Date(appointment.timestamp?.toDate()).toLocaleString()})
                  </span>
                  <button onClick={() => handleDelete(appointment.id)} className="delete-button">Delete</button>
                </li>
              ))
            ) : (
              <li>No upcoming appointments</li>
            )}
          </ul>
        </div>

        {/* Booking Form */}
        <form onSubmit={handleSubmit} className="booking-form">
          <h3>Book a New Appointment</h3>
          <div>
            <label htmlFor="patientName">Patient Name:</label>
            <input
              type="text"
              id="patientName"
              name="patientName"
              value={formData.patientName}
              onChange={handleChange}
              required
              placeholder="Enter your name"
            />
          </div>
          <div>
            <label htmlFor="testType">Test Type:</label>
            <select
              id="testType"
              name="testType"
              value={formData.testType}
              onChange={handleChange}
              required
            >
              <option value="">Select a test type</option>
              <option value="Blood Test">Blood Test</option>
              <option value="X-Ray">X-Ray</option>
              <option value="MRI">MRI</option>
              <option value="CT Scan">CT Scan</option>
            </select>
          </div>
          <div>
            <label htmlFor="date">Date:</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="submit-button">Book Appointment</button>
        </form>
      </div>
    </div>
  );
};

export default Appointments;