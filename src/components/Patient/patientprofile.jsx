import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebase/db';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import './PatientProfile.css';

const PatientProfile = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [formData, setFormData] = useState({
    patientFullName: user?.name || '',
    patientName: user?.email || '',
    testType: '',
    date: '',
  });

  const [bookingHistory, setBookingHistory] = useState([]);

  // Redirect if user not logged in
  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  // Fetch booking history (current + past)
  useEffect(() => {
    const fetchBookingHistory = async () => {
      if (!user) return;

      try {
        const bookingsRef = collection(db, 'Bookings');
        const historyRef = collection(db, 'History');

        const bookingsQuery = query(bookingsRef, where('patientName', '==', user.email));
        const historyQuery = query(historyRef, where('patientName', '==', user.email));

        const [bookingsSnap, historySnap] = await Promise.all([
          getDocs(bookingsQuery),
          getDocs(historyQuery)
        ]);

        const currentBookings = bookingsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const pastBookings = historySnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        setBookingHistory([...currentBookings, ...pastBookings]);
      } catch (err) {
        console.error('Error fetching booking history:', err);
      }
    };

    fetchBookingHistory();
  }, [user]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle booking submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const bookingsRef = collection(db, 'Bookings');
      const historyRef = collection(db, 'History');

      // Move old bookings to history
      const oldBookingsQuery = query(bookingsRef, where('patientName', '==', user.email));
      const snapshot = await getDocs(oldBookingsQuery);

      const movePromises = snapshot.docs.map(doc => 
        addDoc(historyRef, { ...doc.data(), timestamp: new Date() })
      );
      await Promise.all(movePromises);

      const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      // Add new booking
      await addDoc(bookingsRef, {
        patientFullName: formData.patientFullName,
        patientName: formData.patientName,
        testType: formData.testType,
        date: formData.date,
        timestamp: new Date(),
      });

      alert('Booking updated successfully!');
      setFormData(prev => ({ ...prev, testType: '', date: '' }));

      // Refresh booking history
      const [bookingsSnap, historySnap] = await Promise.all([
        getDocs(query(bookingsRef, where('patientName', '==', user.email))),
        getDocs(query(historyRef, where('patientName', '==', user.email))),
      ]);

      const currentBookings = bookingsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const pastBookings = historySnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      setBookingHistory([...currentBookings, ...pastBookings]);
    } catch (err) {
      console.error('Error updating booking:', err);
      alert('Failed to update booking.');
    }
  };

  // Delete a booking from History
  const handleDeleteHistory = async (id) => {
    try {
      await deleteDoc(doc(db, 'History', id));
      alert('Booking deleted from history successfully!');
      setBookingHistory(prev => prev.filter(b => b.id !== id));
    } catch (err) {
      console.error('Error deleting booking from history:', err);
      alert('Failed to delete booking from history.');
    }
  };

  return (
    <div className="patient-profile-container">
      <header className="header-bar">
        <h1>Patient Portal</h1>
        <nav>
          <button onClick={() => navigate('/RESULT')} className="nav-button1">Check Results</button>
          <button
            onClick={() => {
              localStorage.removeItem("user");
              navigate('/login');
            }}
            className="log-button1"
          >
            Logout
          </button>
        </nav>
      </header>

      <section className="patient-info">
        <h2>Patient Profile</h2>
        <p style={{ fontSize: '24px', textAlign: 'center', margin: '10px 0' }}>
          <strong style={{ fontSize: '28px', color: '#333' }}>Name:</strong> {formData.patientFullName}
        </p>
        <p style={{ fontSize: '24px', textAlign: 'center', margin: '10px 0' }}>
          <strong style={{ fontSize: '28px', color: '#333' }}>Role:</strong> {user?.role}
        </p>
      </section>

      <h3 style={{ fontFamily: 'Poppins', fontSize: '24px', color: '#539e28', textAlign: 'center', marginBottom: '20px' }}>
        Book a Test
      </h3>

      <form onSubmit={handleSubmit} className="booking-form">
        <div className="form-group">
          <label htmlFor="patientFullName">👤 Patient Full Name:</label>
          <input
            type="text"
            id="patientFullName"
            name="patientFullName"
            value={formData.patientFullName}
            onChange={handleChange}
            required
            placeholder="Enter your full name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="patientName">📧 Patient Email:</label>
          <input
            type="email"
            id="patientName"
            name="patientName"
            value={formData.patientName}
            readOnly
          />
        </div>

        <div className="form-group">
          <label htmlFor="testType">🔬 Test Type:</label>
          <select
            id="testType"
            name="testType"
            value={formData.testType}
            onChange={handleChange}
            required
          >
            <option value="">Select Test</option>
            <option value="Blood Urea Nitrogen">Blood Urea Nitrogen (BUN)</option>
            <option value="Estimated Glomerular Filtration Rate">Estimated Glomerular Filtration Rate (eGFR)</option>
            <option value="Insulin Dose Calculator">Insulin Dose Calculator</option>
            <option value="INR (International Normalized Ratio)">INR (International Normalized Ratio)</option>
            <option value="Lipid Profile">Lipid Profile Calculation</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="date">📆 Select Date:</label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </div>

        <button
          type="submit"
          className="submit"
          style={{
            backgroundColor: "#FFAC1C",
            color: "white",
            padding: "10px 20px",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            transition: "background-color 0.3s ease",
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = "#e69b00"}
          onMouseOut={(e) => e.target.style.backgroundColor = "#FFAC1C"}
          onMouseDown={(e) => e.target.style.backgroundColor = "#cc8f00"}
          onMouseUp={(e) => e.target.style.backgroundColor = "#e69b00"}
        >
          📌 Book Now
        </button>
      </form>

      <section className="booking-history">
        <h3>Your Booking History</h3>
        {bookingHistory.length > 0 ? (
          <ul>
            {bookingHistory.map((booking) => (
              <li key={booking.id}>
                <p><strong>Test Type:</strong> {booking.testType}</p>
                <p><strong>Patient Name:</strong> {booking.patientFullName}</p>
                <p><strong>Date:</strong> {new Date(booking.date).toLocaleDateString()}</p>
                <button
                  onClick={() => handleDeleteHistory(booking.id)}
                  style={{
                    backgroundColor: "#FF4C4C",
                    color: "white",
                    padding: "5px 10px",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    marginTop: "5px"
                  }}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No bookings yet.</p>
        )}
      </section>
    </div>
  );
};

export default PatientProfile;
