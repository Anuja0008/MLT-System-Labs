import React, { useState, useEffect } from "react";
import { db } from "../../firebase/db"; 
import { collection, query, where, getDocs, setDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import './egfr.css'; // Make sure your CSS includes the bun-page styles

const EGFR = () => {
  const [patientName, setPatientName] = useState("");
  const [patientEmail, setPatientEmail] = useState("");
  const [bookDate, setBookDate] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [creatinine, setCreatinine] = useState("");
  const [egfr, setEgfr] = useState(null);
  const [interpretation, setInterpretation] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    if (!patientEmail || !patientEmail.includes("@")) return;

    const fetchPatientDetails = async (email) => {
      try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", email.trim()));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data();
          setPatientName(userData.name || "");
          setGender(userData.gender || "");
          if (userData.dob) setAge(calculateAge(userData.dob));
        } else {
          setPatientName("");
          setGender("");
          setAge("");
        }
      } catch (error) {
        console.error("Error fetching patient details:", error);
      }
    };

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

    fetchPatientDetails(patientEmail);
    fetchBookingDate(patientEmail);
  }, [patientEmail]);

  const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  const calculateEGFR = () => {
    if (!patientName || !patientEmail || !bookDate || !age || !creatinine) {
      alert("Please fill all fields");
      return;
    }

    const genderFactor = gender.toLowerCase() === "female" ? 0.742 : 1.0;
    let eGFRValue = 175 * Math.pow(creatinine, -1.154) * Math.pow(age, -0.203) * genderFactor;
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

  const printReport = () => window.print();

  const generateRandomSuffix = () => Math.floor(10000 + Math.random() * 90000);

  const handleUpload = async () => {
    if (!egfr) {
      alert("Generate the report first before uploading.");
      return;
    }

    const reportId = `${patientEmail}_${generateRandomSuffix()}`;

    const reportData = {
      patientName,
      patientEmail,
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
    <div className="bun-page">
      <div className="bun-container">
        <h2 className="title">EGFR Report Generator</h2>
          <h3>Input Patient E-mail & Other Fields Will Be Filled</h3>

        <div className="form-group">
          <label>Patient Email</label>
          <input type="email" value={patientEmail} onChange={e => setPatientEmail(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Patient Name</label>
          <input type="text" value={patientName} readOnly />
        </div>
        <div className="form-group">
          <label>Booking Date</label>
          <input type="date" value={bookDate} readOnly />
        </div>
        <div className="form-group">
          <label>Age</label>
          <input type="number" value={age} readOnly />
        </div>
        <div className="form-group">
          <label>Gender</label>
          <input type="text" value={gender} readOnly />
        </div>
          <h3>EGFR Calculation</h3>
        <div className="form-group">
          <label>Creatinine Level (mg/dL)</label>
          <input type="number" value={creatinine} onChange={e => setCreatinine(e.target.value)} />
        </div>

        <div style={{ marginTop: '10px' }}>
          <button className="green-btn btn" onClick={calculateEGFR}>Generate Report</button>
          <button className="red-btn btn" onClick={clearFields}>Clear Fields</button>
          <button className="blue-btn btn go-to-calculation-btn" onClick={() => navigate("/Calculation")}>Go to Calculation</button>
        </div>

        {egfr && (
          <div className="report-section">
            <div className="report-card">
              <h3 className="report-title">Patient Medical Report</h3>
              <p><strong>Name:</strong> {patientName}</p>
              <p><strong>Email:</strong> {patientEmail}</p>
              <p><strong>Booking Date:</strong> {bookDate}</p>
              <p><strong>Age:</strong> {age}</p>
              <p><strong>Gender:</strong> {gender}</p>
              <p><strong>Creatinine Level:</strong> {creatinine} mg/dL</p>
              <p><strong>eGFR:</strong> {egfr} mL/min/1.73m²</p>
              <p><strong>Interpretation:</strong> {interpretation}</p>
              <div>
                <button className="green-btn btn" onClick={printReport}>Print Report</button>
                <button className="green-btn btn" onClick={handleUpload}>Upload Report</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EGFR;
