// src/pages/BUN.jsx
import React, { useState } from "react";
import { db } from "../../firebase/db";
import {
  collection,
  query,
  where,
  getDocs,
  setDoc,
  doc,
} from "firebase/firestore";
import "./bun.css";
import { useNavigate } from "react-router-dom";

const BUN = () => {
  const [patientEmail, setPatientEmail] = useState("");
  const [patientName, setPatientName] = useState("");
  const [bookDate, setBookDate] = useState("");
  const [dob, setDob] = useState("");
  const [age, setAge] = useState("");
  const [bun, setBun] = useState("");
  const [creatinine, setCreatinine] = useState("");
  const [report, setReport] = useState(null);

  const navigate = useNavigate();

  const fetchPatientDetails = async () => {
    try {
      const bookingsQuery = query(
        collection(db, "Bookings"),
        where("patientName", "==", patientEmail)
      );
      const bookingsSnapshot = await getDocs(bookingsQuery);
      if (!bookingsSnapshot.empty) {
        const bookingDoc = bookingsSnapshot.docs[0].data();
        setBookDate(bookingDoc.date);
      } else {
        alert("No booking found for this email.");
      }

      const usersQuery = query(
        collection(db, "users"),
        where("email", "==", patientEmail)
      );
      const usersSnapshot = await getDocs(usersQuery);
      if (!usersSnapshot.empty) {
        const userDoc = usersSnapshot.docs[0].data();
        setPatientName(userDoc.name);
        setDob(userDoc.dob);

        const calculatedAge = calculateAge(userDoc.dob);
        setAge(calculatedAge);
      } else {
        alert("No user data found for this email.");
      }
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  };

  const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const generateReport = () => {
    const bunValue = parseFloat(bun);
    const creatinineValue = parseFloat(creatinine);
    const bunCreatinineRatio = (bunValue / creatinineValue).toFixed(2);

    let interpretation = "";
    if (bunCreatinineRatio > 20) {
      interpretation = "Pre-renal cause of acute kidney failure (>20:1)";
    } else if (bunCreatinineRatio >= 10 && bunCreatinineRatio <= 20) {
      interpretation = "Normal or post-renal cause (10-20:1)";
    } else {
      interpretation = "Intrinsic renal cause (<10:1)";
    }

    const bunStatus = bunValue >= 7 && bunValue <= 20 ? "Normal (7-20 mg/dL)" : "Abnormal";
    const creatinineStatus =
      creatinineValue >= 0.6 && creatinineValue <= 1.3 ? "Normal (0.6-1.3 mg/dL)" : "Abnormal";

    const overallResult =
      bunStatus.includes("Normal") && creatinineStatus.includes("Normal")
        ? "Normal"
        : "Needs Attention";

    const requestDate = new Date().toLocaleDateString();
    const testType = "Blood Urea Nitrogen";

    setReport({
      patientName,
      patientEmail,
      bun: bunValue,
      bunStatus,
      creatinine: creatinineValue,
      creatinineStatus,
      bunCreatinineRatio,
      interpretation,
      overallResult,
      requestDate,
      testType,
      bookDate,
      age,
    });
  };

  const uploadReport = async () => {
    if (!report) return;
    try {
      await setDoc(doc(db, "Reports", patientEmail), report);
      alert("Report uploaded successfully!");
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload report.");
    }
  };

  const clearFields = () => {
    setPatientEmail("");
    setPatientName("");
    setBookDate("");
    setDob("");
    setAge("");
    setBun("");
    setCreatinine("");
    setReport(null);
  };

  return (
    <div className="bun-page">
      <div className="bun-container">
        {/* <button className="home-btn" onClick={() => navigate("/")}>Home</button> */}
        <h2 className="title">Blood Urea Nitrogen Report Generator</h2>

        <div className="calculation-section">
          <h3>Input Patient E-mail & Other Fields Will Be Filled</h3>
          <div className="form-container">
            <div className="form-group">
              <label>Patient Email:</label>
              <input
                type="email"
                value={patientEmail}
                onChange={(e) => setPatientEmail(e.target.value)}
                onBlur={fetchPatientDetails}
              />
            </div>
            <div className="form-group">
              <label>Patient Name:</label>
              <input type="text" value={patientName} readOnly />
            </div>
            <div className="form-group">
              <label>Book Date:</label>
              <input type="date" value={bookDate} readOnly />
            </div>
            <div className="form-group">
              <label>Age:</label>
              <input type="text" value={age} readOnly />
            </div>
              <h3>BUN Calculation</h3>
            <div className="form-group">
              <label>BUN Level (mg/dL):</label>
              <input type="number" value={bun} onChange={(e) => setBun(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Creatinine Level (mg/dL):</label>
              <input
                type="number"
                value={creatinine}
                onChange={(e) => setCreatinine(e.target.value)}
              />
            </div>
            <button onClick={generateReport} className="btn green-btn">Generate Report</button>
            <button onClick={clearFields} className="btn red-btn">Clear Fields</button>
            <button className="go-to-calculation-btn" onClick={() => navigate("/Calculation")}>
              Go to Calculation
            </button>
          </div>
        </div>

        {report && (
          <div className="report-section">
            <h3 className="report-title">Generated Medical Report</h3>
            <div className="report-card">
              <p><strong>Test Type:</strong> {report.testType}</p>
              <p><strong>Request Date:</strong> {report.requestDate}</p>
              <p><strong>Book Date:</strong> {report.bookDate}</p>
              <p><strong>Patient Name:</strong> {report.patientName}</p>
              <p><strong>Patient Email:</strong> {report.patientEmail}</p>
              <p><strong>Age:</strong> {report.age}</p>
              <p><strong>BUN:</strong> {report.bun} ({report.bunStatus})</p>
              <p><strong>Creatinine:</strong> {report.creatinine} ({report.creatinineStatus})</p>
              <p><strong>Ratio:</strong> {report.bunCreatinineRatio}</p>
              <p><strong>Interpretation:</strong> {report.interpretation}</p>
              <p className="overall-result"><strong>Overall:</strong> {report.overallResult}</p>
              <button onClick={() => window.print()} className="btn blue-btn">Print</button>
              <button onClick={uploadReport} className="btn blue-btn">Upload</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BUN;
