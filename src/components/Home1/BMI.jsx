import React, { useState } from 'react';

const BMI = () => {
  const [height, setHeight] = useState(''); // State for height input
  const [weight, setWeight] = useState(''); // State for weight input
  const [bmi, setBmi] = useState(null); // State for calculated BMI
  const [status, setStatus] = useState(''); // BMI Status
  const [isPopupOpen, setIsPopupOpen] = useState(false); // Popup visibility

  const calculateBMI = () => {
    if (height && weight) {
      const heightInMeters = height / 100;
      const calculatedBMI = weight / (heightInMeters * heightInMeters);
      const roundedBMI = calculatedBMI.toFixed(2);
      setBmi(roundedBMI);

      // Determine BMI status
      let bmiStatus = '';
      if (calculatedBMI < 18.5) bmiStatus = 'Underweight';
      else if (calculatedBMI >= 18.5 && calculatedBMI < 24.9) bmiStatus = 'Normal weight';
      else if (calculatedBMI >= 25 && calculatedBMI < 29.9) bmiStatus = 'Overweight';
      else bmiStatus = 'Obese';

      setStatus(bmiStatus);
    } else {
      alert('Please enter both height and weight.');
    }
  };

  return (
    <>
      {/* Button to open BMI popup */}
      <button
        onClick={() => setIsPopupOpen(true)}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "80px",
          background: "#047d44",
          color: "white",
          border: "none",
          width: "50px",
          height: "50px",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
          fontSize: "22px"
        }}
      >
        BMI
      </button>

      {/* BMI Popup */}
      {isPopupOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '80px',
            right: '20px',
            width: '320px',
            borderRadius: '12px',
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.3)',
            background: 'white',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: 'Poppins, sans-serif',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: '#4CAF50',
              color: 'white',
              padding: '12px',
              fontSize: '18px',
              fontWeight: 'bold',
              textAlign: 'center',
              borderTopLeftRadius: '12px',
              borderTopRightRadius: '12px',
            }}
          >
            BMI Calculator
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="Height (cm)"
              style={inputStyle}
            />
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="Weight (kg)"
              style={inputStyle}
            />
          </div>

          <button
            onClick={calculateBMI}
            style={calculateButtonStyle}
          >
            Calculate BMI
          </button>

          {bmi && (
            <div style={{ marginTop: '15px', background: '#f8f9fa', padding: '10px', textAlign: 'center', borderRadius: '8px', fontSize: '16px' }}>
              <strong>Your BMI is:</strong> {bmi} <br />
              <strong>Status:</strong> {status}
            </div>
          )}

          <button
            onClick={() => setIsPopupOpen(false)}
            style={closeButtonStyle}
          >
            &times;
          </button>
        </div>
      )}
    </>
  );
};

// Styles
const inputStyle = {
  padding: '12px',
  border: '2px solid #ddd',
  borderRadius: '8px',
  fontSize: '16px',
  outline: 'none',
  transition: 'border-color 0.3s',
};

const calculateButtonStyle = {
  background: '#4CAF50',
  color: 'white',
  border: 'none',
  padding: '12px 18px',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '16px',
  marginTop: '15px',
  transition: 'background 0.3s',
};

const closeButtonStyle = {
  position: 'absolute',
  top: '10px',
  right: '-2px',
  background: 'transparent',
  border: 'none',
  color: '#777',
  fontSize: '22px',
  cursor: 'pointer',
};

export default BMI;
