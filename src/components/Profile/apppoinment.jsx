import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { db } from '../../firebase/db';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  deleteDoc,
  doc,
  addDoc,
  updateDoc
} from 'firebase/firestore';
import './Appointment.css';

const Appointments = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [appointments, setAppointments] = useState([]);
  const [formData, setFormData] = useState({
    patientEmail: '',
    patientFullName: '',
    testType: '',
    date: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const fetchAppointments = async () => {
    try {
      const bookingsRef = collection(db, 'Bookings');
      const q = query(bookingsRef, orderBy('timestamp', 'desc'), limit(10));
      const querySnapshot = await getDocs(q);

      const appointmentsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setAppointments(appointmentsData);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'Bookings', id));
      alert('Appointment deleted successfully!');
      fetchAppointments();
    } catch (error) {
      console.error('Error deleting appointment:', error);
      alert('Failed to delete appointment. Try again.');
    }
  };

  const handleConfirm = async (id) => {
    try {
      await updateDoc(doc(db, 'Bookings', id), { isConfirmed: true });
      alert('Appointment confirmed successfully!');
      fetchAppointments();
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
      const bookingsRef = collection(db, 'Bookings');
      const historyRef = collection(db, 'History');

      // Remove existing booking if exists
      const existingQ = query(bookingsRef, where('patientEmail', '==', formData.patientEmail));
      const existingSnapshot = await getDocs(existingQ);

      if (!existingSnapshot.empty) {
        const existingDoc = existingSnapshot.docs[0];
        await deleteDoc(doc(db, 'Bookings', existingDoc.id));
        console.log('Existing appointment deleted.');
      }

      // Use manually entered full name
      const fullName = formData.patientFullName;

      const newBooking = {
        patientName: formData.patientEmail,
        patientFullName: fullName,
        testType: formData.testType,
        date: formData.date,
        timestamp: new Date(),
        isConfirmed: false
      };

      const docRef = await addDoc(bookingsRef, newBooking);
      await addDoc(historyRef, { ...newBooking, bookingId: docRef.id });

      alert('Booking successful!');
      setFormData({
        patientEmail: '',
        patientFullName: '',
        testType: '',
        date: ''
      });
      fetchAppointments();

    } catch (error) {
      console.error('Error booking appointment:', error);
      alert('Failed to book appointment. Try again.');
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "Arial, sans-serif" }}>
      <Sidebar user={user} />

      <div style={{ flex: 1, padding: "20px", backgroundColor: "#ecf0f1", overflowY: "auto", maxHeight: "100vh" }}>
        <h2>Appointments</h2>
        <p>View and manage your upcoming appointments.</p>

        <div className="latest-appointment">
          <h3>Latest Appointments</h3>
          {appointments.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Patient Name</th>
                  <th>Patient Email</th>
                  <th>Test Type</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appointment) => (
                  <tr key={appointment.id}>
                    <td>{appointment.patientFullName || 'N/A'}</td>
                    <td>{appointment.patientName}</td>
                    <td>{appointment.testType}</td>
                    <td>{appointment.date}</td>
                    <td>{appointment.isConfirmed ? 'Confirmed' : 'Pending'}</td>
                    <td>
                      {!appointment.isConfirmed && (
                        <button onClick={() => handleConfirm(appointment.id)} className="confirm-button">
                          Confirm
                        </button>
                      )}
                      <button onClick={() => handleDelete(appointment.id)} className="delete-button">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No appointments found.</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="booking-form">
          <h3>Book a New Appointment</h3>
          <div>
            <label htmlFor="patientFullName">Patient Full Name:</label>
            <input
              type="text"
              id="patientFullName"
              name="patientFullName"
              value={formData.patientFullName}
              onChange={handleChange}
              required
              placeholder="Enter patient's full name"
            />
          </div>
          <div>
            <label htmlFor="patientEmail">Patient Email:</label>
            <input
              type="email"
              id="patientEmail"
              name="patientEmail"
              value={formData.patientEmail}
              onChange={handleChange}
              required
              placeholder="Enter patient email"
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
              <option value="Blood Urea Nitrogen">Blood Urea Nitrogen (BUN)</option>
              <option value="Estimated Glomerular Filtration Rate">Estimated Glomerular Filtration Rate (eGFR)</option>
              <option value="Insulin Dose Calculator">Insulin Dose Calculator</option>
              <option value="INR (International Normalized Ratio)">INR (International Normalized Ratio)</option>
              <option value="Lipid Profile">Lipid Profile Calculation</option>
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
