import React, { useState } from 'react';

const BMI = () => {
  const [height, setHeight] = useState(''); // State for height input
  const [weight, setWeight] = useState(''); // State for weight input
  const [bmi, setBmi] = useState(null); // State for calculated BMI
  const [isPopupOpen, setIsPopupOpen] = useState(false); // State to control popup visibility

  // Calculate BMI logic
  const calculateBMI = () => {
    if (height && weight) {
      const heightInMeters = height / 100; // Convert height to meters
      const calculatedBMI = weight / (heightInMeters * heightInMeters); // BMI formula
      setBmi(calculatedBMI.toFixed(2)); // Set BMI with 2 decimal places
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
          {/* Popup Header */}
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

          {/* Input fields for height and weight */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '15px',
              marginTop: '15px',
            }}
          >
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="Height (cm)"
              style={{
                padding: '12px',
                border: '2px solid #ddd',
                borderRadius: '8px',
                fontSize: '16px',
                outline: 'none',
                transition: 'border-color 0.3s',
              }}
            />
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="Weight (kg)"
              style={{
                padding: '12px',
                border: '2px solid #ddd',
                borderRadius: '8px',
                fontSize: '16px',
                outline: 'none',
                transition: 'border-color 0.3s',
              }}
            />
          </div>

          {/* Calculate button */}
          <button
            onClick={calculateBMI}
            style={{
              background: '#4CAF50',
              color: 'white',
              border: 'none',
              padding: '12px 18px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              marginTop: '15px',
              transition: 'background 0.3s',
            }}
          >
            Calculate BMI
          </button>

          {/* Display BMI result */}
          {bmi && (
            <div
              style={{
                marginTop: '15px',
                background: '#f8f9fa',
                padding: '10px',
                textAlign: 'center',
                borderRadius: '8px',
                fontSize: '18px',
              }}
            >
              <strong>Your BMI is:</strong> {bmi}
            </div>
          )}

          {/* Close button */}
          <button
            onClick={() => setIsPopupOpen(false)}
            style={{
              position: 'absolute',
              top: '10px',
              right: '-2px',
              background: 'transparent',
              border: 'none',
              color: '#777',
              fontSize: '22px',
              cursor: 'pointer',
            
            }}
          >
            &times;
          </button>
        </div>
      )}
    </>
  );
};

export default BMI;
