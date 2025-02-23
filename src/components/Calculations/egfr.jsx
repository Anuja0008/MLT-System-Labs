import React, { useState, useEffect } from "react";
import { db } from "../../firebase/db"; // Firebase config
import { collection, query, where, getDocs, setDoc, doc } from "firebase/firestore";
import './egfr.css' // Import the external CSS
import { useNavigate } from "react-router-dom";

const EGFR = () => {
  const [patientName, setPatientName] = useState("");
  const [patientEmail, setPatientEmail] = useState("");
  const [bookDate, setBookDate] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [creatinine, setCreatinine] = useState("");
  const [egfr, setEgfr] = useState(null);
  const [interpretation, setInterpretation] = useState("");

  useEffect(() => {
    if (patientEmail && patientEmail.includes("@")) {
      fetchPatientDetails(patientEmail);
      fetchBookingDate(patientEmail);
    }
  }, [patientEmail]);

  // Fetch patient details using email
  const fetchPatientDetails = async (email) => {
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", email.trim()));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        setPatientName(userData.name || "");
        setGender(userData.gender || "");
        if (userData.dob) {
          setAge(calculateAge(userData.dob));
        }
      } else {
        setPatientName("");
        setGender("");
        setAge("");
      }
    } catch (error) {
      console.error("Error fetching patient details:", error);
    }
  };

  // Fetch booking date using email
  const fetchBookingDate = async (email) => {
    try {
      const bookingsRef = collection(db, "Bookings");
      const q = query(bookingsRef, where("patientName", "==", email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const booking = querySnapshot.docs[0].data();
        setBookDate(booking.date || "");
      } else {
        setBookDate("");
      }
    } catch (error) {
      console.error("Error fetching booking date:", error);
    }
  };

  const navigate = useNavigate();

  // Calculate age from DOB
  const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Calculate eGFR
  const calculateEGFR = () => {
    if (!patientName || !patientEmail || !bookDate || !age || !creatinine) {
      alert("Please fill all fields");
      return;
    }

    let genderFactor = gender.toLowerCase() === "female" ? 0.742 : 1.0;
    let eGFRValue =
      175 * Math.pow(creatinine, -1.154) * Math.pow(age, -0.203) * genderFactor;
    eGFRValue = eGFRValue.toFixed(2);

    let status = "";
    if (eGFRValue >= 90) status = "Normal kidney function";
    else if (eGFRValue >= 60) status = "Mildly decreased function";
    else if (eGFRValue >= 30) status = "Moderate kidney disease";
    else if (eGFRValue >= 15) status = "Severe kidney disease";
    else status = "Kidney failure";

    setEgfr(eGFRValue);
    setInterpretation(status);
  };

  // Clear all fields
  const clearFields = () => {
    setPatientName("");
    setPatientEmail("");
    setBookDate("");
    setAge("");
    setGender("");
    setCreatinine("");
    setEgfr(null);
    setInterpretation("");
  };

  // Print the report
  const printReport = () => {
    window.print();
  };

  // Generate a random 5-digit number
  const generateRandomSuffix = () => {
    return Math.floor(10000 + Math.random() * 90000); // Random number between 10000 - 99999
  };

  // Upload report to Firestore (creates a new doc ID every time)
  const handleUpload = async () => {
    if (!egfr) {
      alert("Generate the report first before uploading.");
      return;
    }

    // ✅ Generate a unique document ID using email + random suffix
    const randomSuffix = generateRandomSuffix();
    const reportId = `${patientEmail}_${randomSuffix}`;

    const reportData = {
      patientName: patientName,
      patientEmail: patientEmail,
      bookDate,
      age,
      gender,
      creatinine,
      eGFR: egfr,
      interpretation,
      testType: "egfr",
      timestamp: new Date(),
    };

    try {
      await setDoc(doc(db, "Reports", reportId), reportData);
      alert("Report uploaded successfully!");
    } catch (error) {
      console.error("Error uploading report:", error);
      alert("Failed to upload report.");
    }
  };

  return (
    <div className="egfr-container">
    <h2 className="title">EGFR Report Generator</h2>
    <h3>Input Patient E-mail & Other Field Filled Automatically</h3>

      <input className="egfr-input" type="email" placeholder="Patient Email" value={patientEmail} onChange={(e) => setPatientEmail(e.target.value)} />
      <input className="egfr-input" type="text" placeholder="Patient Name" value={patientName} readOnly />
      <input className="egfr-input" type="date" value={bookDate} readOnly />
      <input className="egfr-input" type="number" placeholder="Age" value={age} readOnly />
      <input className="egfr-input" type="text" placeholder="Gender" value={gender} readOnly />
      <input className="egfr-input" type="number" placeholder="Creatinine Level (mg/dL)" value={creatinine} onChange={(e) => setCreatinine(e.target.value)} />

      <button className="report-button" onClick={calculateEGFR}>Generate Report</button>
      <button className="clear-button" onClick={clearFields}>Clear Fields</button>
      <button className="go-to-calculation-btn" onClick={() => navigate("/Calculation")}>Go to Calculation</button>
      


      {egfr && (
        <div className="egfr-report-container">
          <h3>Patient Medical Report</h3>
          <p><strong>Name:</strong> {patientName}</p>
          <p><strong>Email:</strong> {patientEmail}</p>
          <p><strong>Book Date:</strong> {bookDate}</p>
          <p><strong>Age:</strong> {age}</p>
          <p><strong>Gender:</strong> {gender}</p>
          <p><strong>Creatinine Level:</strong> {creatinine} mg/dL</p>
          <p><strong>eGFR:</strong> {egfr} mL/min/1.73m²</p>
          <p><strong>Interpretation:</strong> {interpretation}</p>

          <button className="print-button" onClick={printReport}>Print Report</button>
          <button className="upload-button" onClick={handleUpload}>Upload Report</button>
        </div>
      )}
    </div>
  );
};

export default EGFR;
