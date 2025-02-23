import React, { useState } from "react";
import { db } from "../../firebase/db";
import { collection, query, where, getDocs, /*addDoc*/ setDoc, doc } from "firebase/firestore"; // Import setDoc and doc
import "./bun.css"; // Importing external CSS
import { useNavigate } from 'react-router-dom';

const BUN = () => {
  const [patientEmail, setPatientEmail] = useState("");
  const [patientName, setPatientName] = useState("");
  const [bookDate, setBookDate] = useState("");
  const [/*dob*/, setDob] = useState("");
  const [age, setAge] = useState("");
  const [bun, setBun] = useState("");
  const [creatinine, setCreatinine] = useState("");
  const [report, setReport] = useState(null);

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

        const age = calculateAge(userDoc.dob);
        setAge(age);
      } else {
        alert("No user data found for this email.");
      }
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  };
  const navigate = useNavigate();

  const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
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
    const creatinineStatus = creatinineValue >= 0.6 && creatinineValue <= 1.3 ? "Normal (0.6-1.3 mg/dL)" : "Abnormal";

    const overallResult =
      bunStatus === "Normal (7-20 mg/dL)" && creatinineStatus === "Normal (0.6-1.3 mg/dL)"
        ? "Normal"
        : "Needs Attention";

    const requestDate = new Date().toLocaleDateString();
    const testType = "Blood Urea Nitrogen ";

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
    try {
      const reportData = {
        patientName,
        patientEmail,
        bun: report.bun,
        bunStatus: report.bunStatus,
        creatinine: report.creatinine,
        creatinineStatus: report.creatinineStatus,
        bunCreatinineRatio: report.bunCreatinineRatio,
        interpretation: report.interpretation,
        overallResult: report.overallResult,
        requestDate: report.requestDate,
        testType: report.testType,
        bookDate: report.bookDate,
        age: report.age,
      };

      // Use setDoc to upload the report with the patient's email as the document ID
      await setDoc(doc(db, "Reports", patientEmail), reportData);
      alert("Report uploaded successfully!");
    } catch (error) {
      console.error("Error uploading report: ", error);
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
    <div className="bun-container">
      <h2 className="title">Blood Urea Nitrogen Report Generator</h2>

      <div className="calculation-section">
        <h3>Input Patient E-mail & Other Field Filled Automatically</h3>
        <div className="form-container">
          <div className="form-group">
            <label className="label">Patient Email:</label>
            <input
              type="email"
              className="input"
              value={patientEmail}
              onChange={(e) => setPatientEmail(e.target.value)}
              onBlur={fetchPatientDetails}
            />
          </div>
          <div className="form-group">
            <label className="label">Patient Name:</label>
            <input
              type="text"
              className="input"
              value={patientName}
              readOnly
            />
          </div>
          <div className="form-group">
            <label className="label">Book Date:</label>
            <input
              type="date"
              className="input"
              value={bookDate}
              readOnly
            />
          </div>
          <div className="form-group">
            <label className="label">Age:</label>
            <input
              type="text"
              className="input"
              value={age}
              readOnly
            />
          </div>
          <div className="form-group">
            <label className="label">BUN Level (mg/dL):</label>
            <input
              type="number"
              className="input"
              value={bun}
              onChange={(e) => setBun(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="label">Creatinine Level (mg/dL):</label>
            <input
              type="number"
              className="input"
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
          <div className="report-container">
            <p><strong>Test Type:</strong> {report.testType}</p>
            <p><strong>Request Date:</strong> {report.requestDate}</p>
            <p><strong>Book Date:</strong> {report.bookDate}</p>
            <p><strong>Patient Name:</strong> {report.patientName}</p>
            <p><strong>Patient Email:</strong> {report.patientEmail}</p>
            <p><strong>Age:</strong> {report.age} years</p>
            <p><strong>BUN Level (mg/dL):</strong> {report.bun} - {report.bunStatus}</p>
            <p><strong>Creatinine Level (mg/dL):</strong> {report.creatinine} - {report.creatinineStatus}</p>
            <p><strong>BUN/Creatinine Ratio:</strong> {report.bunCreatinineRatio}</p>
            <p><strong>Interpretation:</strong> {report.interpretation}</p>
            <p className="overall-result"><strong>Overall Result:</strong> {report.overallResult}</p>
            <button onClick={() => window.print()} className="btn blue-btn">Print Report</button>
            <button onClick={uploadReport} className="btn blue-btn">Upload Report</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BUN;