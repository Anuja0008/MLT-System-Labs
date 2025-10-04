import React, { useState } from 'react';
import { db } from '../../firebase/db';
import { collection, addDoc } from 'firebase/firestore';
import emailjs from 'emailjs-com';

const PatientRegistration = ({ onPatientAdded, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    gender: '',
    dob: '',
    nicOrPassport: '',
    contactNumber: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) return 'Invalid email format.';
    if (formData.contactNumber && formData.contactNumber.length !== 10)
      return 'Phone number must be exactly 10 digits.';
    if (formData.nicOrPassport.length !== 12)
      return 'NIC/Passport must be exactly 12 characters.';
    if (formData.password.length < 6)
      return 'Password must be at least 6 characters.';
    return '';
  };

  // ✅ EmailJS function — uses your actual IDs and template variables
  const sendEmail = async (patient) => {
    const templateParams = {
      to_name: patient.name,
      email: patient.email, // must match {{email}} in EmailJS
      username: patient.email,
      password: patient.password,
      login_url: 'https://your-app-login-url.com', // optional
      message: `Dear ${patient.name}, your registration as a patient was successful.`,
    };

    try {
      await emailjs.send(
        'service_ia6hy4w', // ✅ Your EmailJS Service ID
        'template_umxquvv', // ✅ Your EmailJS Template ID
        templateParams,
        'rg9inOyfT5wxeIa8z' // ✅ Your EmailJS Public Key
      );
      console.log('✅ Email sent successfully');
    } catch (err) {
      console.error('❌ Failed to send email:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const docRef = await addDoc(collection(db, 'users'), {
        ...formData,
        role: 'Patient',
        createdAt: new Date(),
      });

      const newPatient = { id: docRef.id, ...formData, role: 'Patient' };

      // Trigger email sending after registration
      await sendEmail(newPatient);

      onPatientAdded(newPatient);

      // Reset form after success
      setFormData({
        name: '',
        email: '',
        gender: '',
        dob: '',
        nicOrPassport: '',
        contactNumber: '',
        password: '',
      });

      setLoading(false);
    } catch (err) {
      console.error('Error registering patient:', err);
      setError('Failed to register patient. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        marginBottom: '30px',
        padding: '20px',
        background: '#fff',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        fontFamily: 'Segoe UI, sans-serif',
      }}
    >
      <h3
        style={{
          marginBottom: '20px',
          fontSize: '22px',
          fontWeight: '600',
          color: '#34495e',
        }}
      >
        Register New Patient
      </h3>
      {error && <p style={{ color: 'red', marginBottom: '12px' }}>{error}</p>}
      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
      >
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          required
          style={inputStyle}
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          style={inputStyle}
        />
        <select
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          required
          style={inputStyle}
        >
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          {/* <option value="Other">Other</option> */}
        </select>
    <label style={{ display: "block", marginBottom: "5px" }}>Date of Birth</label>
<input
  type="date"
  name="dob"
  value={formData.dob}
  onChange={handleChange}
  required
  style={inputStyle}
/>

        <input
          type="text"
          name="nicOrPassport"
          placeholder="NIC/Passport (12 characters)"
          value={formData.nicOrPassport}
          onChange={handleChange}
          required
          maxLength={12}
          style={inputStyle}
        />
        <input
          type="text"
          name="contactNumber"
          placeholder="Contact Number (10 digits)"
          value={formData.contactNumber}
          onChange={handleChange}
          maxLength={10}
          style={inputStyle}
        />
        <input
          type="password"
          name="password"
          placeholder="Password (min 6 chars)"
          value={formData.password}
          onChange={handleChange}
          required
          minLength={6}
          style={inputStyle}
        />

        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              background: '#3498db',
              color: '#fff',
              padding: '10px 15px',
              borderRadius: '8px',
              border: 'none',
              fontWeight: '600',
              cursor: 'pointer',
              flex: 1,
              fontSize: '14px',
            }}
          >
            {loading ? 'Registering...' : 'Register Patient'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            style={{
              background: '#e74c3c',
              color: '#fff',
              padding: '10px 15px',
              borderRadius: '8px',
              border: 'none',
              fontWeight: '600',
              cursor: 'pointer',
              flex: 1,
              fontSize: '14px',
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

const inputStyle = {
  padding: '10px',
  borderRadius: '8px',
  border: '1px solid #ccc',
  fontSize: '14px',
};

export default PatientRegistration;
