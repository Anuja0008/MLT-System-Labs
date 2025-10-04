import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebase/db';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { FaUser, FaEnvelope, FaFlask, FaCalendarAlt } from 'react-icons/fa';
import './PatientProfile.css';

const testIcons = {
  "Blood Urea Nitrogen": <FaFlask style={{ color: '#e67e22', marginRight: '8px' }} />,
  "Estimated Glomerular Filtration Rate": <FaFlask style={{ color: '#2980b9', marginRight: '8px' }} />,
  "Insulin Dose Calculator": <FaFlask style={{ color: '#8e44ad', marginRight: '8px' }} />,
  "INR (International Normalized Ratio)": <FaFlask style={{ color: '#16a085', marginRight: '8px' }} />,
  "Lipid Profile": <FaFlask style={{ color: '#f39c12', marginRight: '8px' }} />
};

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

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

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
        console.error(err);
      }
    };
    fetchBookingHistory();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

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
      console.error(err);
      alert('Failed to update booking.');
    }
  };

  const handleDeleteHistory = async (id) => {
    try {
      await deleteDoc(doc(db, 'History', id));
      setBookingHistory(prev => prev.filter(b => b.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // Navigate to Result page with latest booking info
  const handleCheckResults = () => {
    if (!bookingHistory.length) return alert("No bookings available to check results.");

    const latestBooking = bookingHistory
      .filter(b => b.date)
      .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

    navigate('/RESULT', {
      state: {
        patientEmail: formData.patientName,
        latestBookingDate: latestBooking?.date || '',
        latestTestType: latestBooking?.testType || ''
      }
    });
  };

  return (
    <div className="patient-profile-container">
      <header className="header-bar">
        <div className="patient-info-header">
          <p>👤 {formData.patientFullName}</p>
          <p>({user?.role})</p>
        </div>
        <nav>
          <button onClick={handleCheckResults} className="nav-button1">Check Results</button>
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

      <main className="main-content">
        <form onSubmit={handleSubmit} className="booking-form">
          <h3>📌 Book a Test</h3>
          <div className="form-group">
            <label><FaUser /> Full Name</label>
            <input type="text" name="patientFullName" value={formData.patientFullName} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label><FaEnvelope /> Email</label>
            <input type="email" name="patientName" value={formData.patientName} readOnly />
          </div>
          <div className="form-group">
            <label><FaFlask /> Test Type</label>
            <select name="testType" value={formData.testType} onChange={handleChange} required>
              <option value="">Select Test</option>
              {Object.keys(testIcons).map((test) => (
                <option key={test} value={test}>{test}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label><FaCalendarAlt /> Date</label>
            <input type="date" name="date" value={formData.date} onChange={handleChange} required />
          </div>

          <button type="submit" className="submit">📅 Book Now</button>
        </form>

        <section className="booking-history">
          <h3>🕒 Booking History</h3>
          {bookingHistory.length > 0 ? (
            <ul>
              {bookingHistory.map((booking) => (
                <li key={booking.id}>
                  <p>{testIcons[booking.testType]}<strong>{booking.testType}</strong></p>
                  <p>Patient: {booking.patientFullName}</p>
                  <p>Date: {new Date(booking.date).toLocaleDateString()}</p>
                  <button onClick={() => handleDeleteHistory(booking.id)}>Delete</button>
                </li>
              ))}
            </ul>
          ) : <p>No bookings yet.</p>}
        </section>
      </main>
    </div>
  );
};

export default PatientProfile;
