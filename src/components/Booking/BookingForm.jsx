// import React, { useState } from 'react';
// import { db } from '../../firebase/db';
// import { collection, addDoc } from 'firebase/firestore';
// import './BookingForm.css'; // Importing CSS

// const BookingForm = () => {
//   const [formData, setFormData] = useState({
//     patientName: '',
//     testType: '',
//     date: '',
//   });

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({ ...formData, [name]: value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     try {
//       await addDoc(collection(db, 'Bookings'), {
//         patientName: formData.patientName,
//         testType: formData.testType,
//         date: formData.date,
//         timestamp: new Date(),
//       });

//       alert('Booking successful!');
//       setFormData({ patientName: '', testType: '', date: '' });
//     } catch (error) {
//       console.error('Error booking test:', error);
//       alert('Failed to book. Try again.');
//     }
//   };

//   return (
//     <div className="booking-container">
//       <div className="form-wrapper">
//         <h2>📅 Book a Test</h2>
//         <form onSubmit={handleSubmit} className="booking-form">
          
//           <div className="form-group">
//             <label htmlFor="patientName">👤 Patient Name:</label>
//             <input
//               type="text"
//               id="patientName"
//               name="patientName"
//               value={formData.patientName}
//               onChange={handleChange}
//               required
//               placeholder="Enter your name"
//             />
//           </div>

//           <div className="form-group">
//             <label htmlFor="testType">🔬 Test Type:</label>
//             <select
//               id="testType"
//               name="testType"
//               value={formData.testType}
//               onChange={handleChange}
//               required
//             >
//               <option value="">Select Test</option>
//               <option value="Blood Test">Blood Urea Nitrogen (BUN)</option>
//               <option value="X-Ray">Estimated Glomerular Filtration Rate (eGFR)</option>
//               <option value="MRI Scan">Insulin Dose Calculator</option>
//               <option value="CT Scan">INR (International Normalized Ratio)</option>
//               <option value="Lipid Profile">Lipid Profile Calculation</option>
//             </select>
//           </div>

//           <div className="form-group">
//             <label htmlFor="date">📆 Select Date:</label>
//             <input
//               type="date"
//               id="date"
//               name="date"
//               value={formData.date}
//               onChange={handleChange}
//               required
//             />
//           </div>

//           <button type="submit" className="book-button">📌 Book Now</button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default BookingForm;