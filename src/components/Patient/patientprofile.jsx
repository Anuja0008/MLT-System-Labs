import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebase/db'; // Import Firestore
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore'; // Add addDoc here
import './PatientProfile.css'; // Import the new CSS file

const PatientProfile = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  // State for booking form
  const [formData, setFormData] = useState({
    patientName: user ? user.email : '', // Pre-fill with user's email if user exists
    testType: '',
    date: '',
  });

  // State for booking history
  const [bookingHistory, setBookingHistory] = useState([]);

  // Check if user is logged in
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Fetch booking history when component mounts
  useEffect(() => {
    const fetchBookingHistory = async () => {
      if (user) {
        const q = query(collection(db, 'Bookings'), where('patientName', '==', user.email));
        const querySnapshot = await getDocs(q);
        const bookings = querySnapshot.docs.map(doc => ({
          date: doc.data().date,
          patientName: doc.data().patientName,
          testType: doc.data().testType,
        }));
        setBookingHistory(bookings);
      }
    };

    fetchBookingHistory();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Add booking data to Firestore
      await addDoc(collection(db, 'Bookings'), {
        patientName: formData.patientName,
        testType: formData.testType,
        date: formData.date,
        timestamp: new Date(),
      });

      alert('Booking successful!');
      setFormData({ patientName: user.email, testType: '', date: '' });

      // Refresh booking history after a successful booking
      const q = query(collection(db, 'Bookings'), where('patientName', '==', user.email));
      const querySnapshot = await getDocs(q);
      const bookings = querySnapshot.docs.map(doc => ({
        date: doc.data().date,
        patientName: doc.data().patientName,
        testType: doc.data().testType,
      }));
      setBookingHistory(bookings);
    } catch (error) {
      console.error('Error booking test:', error);
      alert('Failed to book. Try again.');
    }
  };

  return (
    <div className="patient-profile-container">
      {/* Navigation Header */}
      <header className="header-bar">
        <h1>Patient Portal</h1>
        <nav>
          <button onClick={() => navigate('/RESULT')} className="nav-button1">Check Results</button>
          <button onClick={() => {
            localStorage.removeItem("user");
            navigate('/login');
          }} className="log-button1">Logout</button>
        </nav>
      </header>

      {/* Patient Profile */}
      <section className="patient-info">
        <h2>Patient Profile</h2>
       <p style={{ fontSize: '24px', textAlign: 'center', margin: '10px 0' }}>
  <strong style={{ fontWeight: 'bold', fontSize: '28px', color: '#333' }}>Email:</strong> {user.email}
</p>
<p style={{ fontSize: '24px', textAlign: 'center', margin: '10px 0' }}>
  <strong style={{ fontWeight: 'bold', fontSize: '28px', color: '#333' }}>Role:</strong> {user.role}
</p>

      </section>
      <h3 style={{ fontFamily: 'Poppins', fontSize: '24px', color: '#539e28', textAlign: 'center', marginBottom: '20px' }}>
  Book a Test
</h3>


      <form onSubmit={handleSubmit} className="booking-form">
        <div className="form-group">
          <label htmlFor="patientName">👤 Patient Name:</label>
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
            <option value="MRI Scan">Insulin Dose Calculator</option>
            <option value="CT Scan">INR (International Normalized Ratio)</option>
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
    cursor: "pointer",
    fontSize: "16px",
    borderRadius: "5px",
    transition: "background-color 0.3s ease",
  }}
  onMouseOver={(e) => e.target.style.backgroundColor = "#f8a600"}  // Hover color
  onMouseOut={(e) => e.target.style.backgroundColor = "#FFAC1C"}   // Reset color
  onMouseDown={(e) => e.target.style.backgroundColor = "#e88900"}  // Active color
  onMouseUp={(e) => e.target.style.backgroundColor = "#f8a600"}    // Hover color
>
  📌 Book Now
</button>
      </form>

      {/* Booking History */}
      <section className="booking-history">
        <h3>Your Booking History</h3>
        {bookingHistory.length > 0 ? (
          <ul>
            {bookingHistory.map((booking, index) => (
              <li key={index}>
                <p><strong>Test Type:</strong> {booking.testType}</p>
                <p><strong>Patient Name:</strong> {booking.patientName}</p>
                <p><strong>Date:</strong> {new Date(booking.date).toLocaleDateString()}</p>
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
