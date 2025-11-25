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
import emailjs from 'emailjs-com';

const SERVICE_ID = "service_ptg659a";
const TEMPLATE_ID = "template_cv7xjyt";
const USER_ID = "_4NAbg1gFi1YYr8GJ";

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
    if (!user) navigate('/login');
  }, [user, navigate]);

  const fetchAppointments = async () => {
    try {
      const bookingsRef = collection(db, 'Bookings');
      const q = query(bookingsRef, orderBy('timestamp', 'desc'), limit(10));
      const querySnapshot = await getDocs(q);

      const appointmentsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        patientFullName: doc.data().patientFullName || 'N/A',
        patientName: doc.data().patientName || 'N/A',
        testType: doc.data().testType || 'N/A',
        date: doc.data().date || 'N/A',
        isConfirmed: doc.data().isConfirmed || false
      }));

      setAppointments(appointmentsData);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  useEffect(() => { fetchAppointments(); }, []);

  const sendEmail = (appointment, action) => {
    const statusTitle = action === "confirmed" ? "Appointment Confirmed!" : "Appointment Cancelled";
    const statusMessage = action === "confirmed"
      ? "Your appointment at Ariana Labs has been successfully confirmed."
      : "Your appointment at Ariana Labs has been cancelled by the admin.";

    const templateParams = {
      to_email: appointment.patientName,
      patient_name: appointment.patientFullName,
      test_type: appointment.testType,
      date: appointment.date,
      statusTitle,
      statusMessage,
      from_name: "Ariana Labs"
    };

    emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, USER_ID)
      .then(() => alert(`Email sent (${action})!`))
      .catch(() => alert('Failed to send email.'));
  };

  const handleConfirm = async (appointment) => {
    try {
      await updateDoc(doc(db, 'Bookings', appointment.id), { isConfirmed: true });
      alert('Appointment confirmed!');
      sendEmail(appointment, 'confirmed');
      fetchAppointments();
    } catch {
      alert('Failed to confirm appointment.');
    }
  };

  const handleDelete = async (appointment) => {
    try {
      await deleteDoc(doc(db, 'Bookings', appointment.id));
      alert('Appointment deleted!');
      sendEmail(appointment, 'cancelled');
      fetchAppointments();
    } catch {
      alert('Failed to delete appointment.');
    }
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === 'patientEmail' && value) {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', value));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0].data();
        setFormData((prev) => ({ ...prev, patientFullName: userDoc.fullName || userDoc.name }));
      } else {
        setFormData((prev) => ({ ...prev, patientFullName: '' }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const bookingsRef = collection(db, 'Bookings');
      const historyRef = collection(db, 'History');

      const existingQ = query(bookingsRef, where('patientName', '==', formData.patientEmail));
      const existingSnapshot = await getDocs(existingQ);

      if (!existingSnapshot.empty) {
        const existingDoc = existingSnapshot.docs[0];
        await deleteDoc(doc(db, 'Bookings', existingDoc.id));
      }

      const newBooking = {
        patientName: formData.patientEmail,
        patientFullName: formData.patientFullName,
        testType: formData.testType,
        date: formData.date,
        timestamp: new Date(),
        isConfirmed: false
      };

      const docRef = await addDoc(bookingsRef, newBooking);
      await addDoc(historyRef, { ...newBooking, bookingId: docRef.id });

      alert('Booking successful!');
      setFormData({ patientEmail: '', patientFullName: '', testType: '', date: '' });
      fetchAppointments();
    } catch {
      alert('Failed to book appointment.');
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Segoe UI', sans-serif", background: "#eef2f7" }}>
      <Sidebar user={user} />

      <div style={{ flex: 1, padding: "30px", overflowY: "auto" }}>
        <h2 style={{ marginBottom: "10px", color: "#2c3e50" }}>Appointments</h2>
        <p style={{ marginBottom: "20px", color: "#7f8c8d" }}>Manage and book your upcoming appointments.</p>

        {/* Latest Appointments */}
        <div style={{ background: "#fff", padding: "20px", borderRadius: "12px", border: "2px solid #27ae60", boxShadow: "0 6px 18px rgba(0,0,0,0.1)", marginBottom: "30px" }}>
          <h3 style={{ marginBottom: "15px", color: "#34495e" }}>Latest Appointments</h3>
          {appointments.length > 0 ? (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
              <thead>
                <tr style={{ background: "#dff9e1" }}>
                  {["Patient Name", "Patient Email", "Test Type", "Date", "Status", "Action"].map((h, i) => (
                    <th key={i} style={{ padding: "10px", textAlign: "left", borderBottom: "2px solid #ddd" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {appointments.map((appointment, index) => (
                  <tr key={appointment.id} style={{ background: index % 2 === 0 ? "#fff" : "#f9f9f9", transition: "0.3s" }}>
                    <td style={{ padding: "10px" }}>{appointment.patientFullName}</td>
                    <td style={{ padding: "10px" }}>{appointment.patientName}</td>
                    <td style={{ padding: "10px" }}>{appointment.testType}</td>
                    <td style={{ padding: "10px" }}>{appointment.date}</td>
                    <td style={{
                      padding: "10px",
                      fontWeight: "bold",
                      color: appointment.isConfirmed ? "#27ae60" : "#e67e22"
                    }}>
                      {appointment.isConfirmed ? "Confirmed" : "Pending"}
                    </td>
                    <td style={{ padding: "10px" }}>
                      {!appointment.isConfirmed && (
                        <button
                          onClick={() => handleConfirm(appointment)}
                          style={{ marginRight: "10px", padding: "8px 16px", border: "none", borderRadius: "8px", background: "linear-gradient(90deg,#27ae60,#2ecc71)", color: "#fff", cursor: "pointer", fontWeight: "bold" }}
                        >
                          Confirm
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(appointment)}
                        style={{ padding: "8px 16px", border: "none", borderRadius: "8px", background: "linear-gradient(90deg,#e74c3c,#c0392b)", color: "#fff", cursor: "pointer", fontWeight: "bold" }}
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ color: "#7f8c8d" }}>No appointments found.</p>
          )}
        </div>

        {/* Booking Form */}
        <form onSubmit={handleSubmit} style={{ background: "#fff", padding: "25px", borderRadius: "12px", border: "2px solid #27ae60", boxShadow: "0 6px 18px rgba(0,0,0,0.1)" }}>
          <h3 style={{ marginBottom: "20px", color: "#34495e" }}>Book a New Appointment</h3>
          {["patientEmail", "patientFullName", "date"].map((id) => (
            <div key={id} style={{ marginBottom: "15px" }}>
              <label htmlFor={id} style={{ display: "block", marginBottom: "6px", fontWeight: "bold", color: "#2c3e50" }}>
                {id === "patientEmail" ? "Patient Email" : id === "patientFullName" ? "Patient Full Name" : "Date Of Birth"}
              </label>
              <input
                type={id === "date" ? "date" : "text"}
                id={id}
                name={id}
                value={formData[id]}
                onChange={handleChange}
                required
                placeholder={`Enter ${id}`}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ccc", fontSize: "14px" }}
              />
            </div>
          ))}
          <div style={{ marginBottom: "15px" }}>
            <label htmlFor="testType" style={{ display: "block", marginBottom: "6px", fontWeight: "bold", color: "#2c3e50" }}>Test Type:</label>
            <select
              id="testType"
              name="testType"
              value={formData.testType}
              onChange={handleChange}
              required
              style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ccc", fontSize: "14px" }}
            >
              <option value="">Select a test type</option>
              <option value="Blood Urea Nitrogen">Blood Urea Nitrogen (BUN)</option>
              <option value="Estimated Glomerular Filtration Rate">Estimated Glomerular Filtration Rate (eGFR)</option>
              <option value="Insulin Dose Calculator">Insulin Dose Calculator</option>
              <option value="INR (International Normalized Ratio)">INR (International Normalized Ratio)</option>
              <option value="Lipid Profile">Lipid Profile Calculation</option>
            </select>
          </div>
          <button
            type="submit"
            style={{ width: "100%", padding: "12px", border: "none", borderRadius: "8px", background: "linear-gradient(90deg,#27ae60,#2ecc71)", color: "#fff", fontWeight: "bold", cursor: "pointer", fontSize: "15px" }}
          >
            Book Appointment
          </button>
        </form>
      </div>
    </div>
  );
};

export default Appointments;
