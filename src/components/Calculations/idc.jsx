import React, { useState } from "react";
import { db } from "../../firebase/db";
import { collection, query, where, getDocs, setDoc, doc } from "firebase/firestore";
import { useNavigate } from 'react-router-dom';
import "./idc.css";
import patientImage from '../../Photos/patient.jpg'; // Import the image

const IDC = () => {
  const [patientEmail, setPatientEmail] = useState("");
  const [patientName, setPatientName] = useState("");
  const [bookDate, setBookDate] = useState("");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [carbs, setCarbs] = useState("");
  const [bg, setBg] = useState("");
  const [targetBg, setTargetBg] = useState("");
  const [insulinRatio, setInsulinRatio] = useState("");
  const [sensitivity, setSensitivity] = useState("");
  const [insulinDose, setInsulinDose] = useState(null);
  const [insulinForCarbs, setInsulinForCarbs] = useState(null);
  const [correctionDose, setCorrectionDose] = useState(null);

  const navigate = useNavigate();

  // Fetch Patient details from Firestore
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
        setAge(calculateAge(userDoc.dob));
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
    const monthDifference = today.getMonth() - birthDate.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const calculateInsulin = () => {
    const insulinForCarbsValue = carbs / insulinRatio;
    const correctionDoseValue = (bg - targetBg) / sensitivity;
    const totalInsulinDoseValue = insulinForCarbsValue + correctionDoseValue;

    setInsulinForCarbs(insulinForCarbsValue.toFixed(2));
    setCorrectionDose(correctionDoseValue.toFixed(2));
    setInsulinDose(totalInsulinDoseValue.toFixed(2));
  };

  const generateReport = () => ({
    patientName,
    patientEmail,
    age,
    weight,
    carbs,
    bg,
    targetBg,
    insulinRatio,
    sensitivity,
    insulinForCarbs,
    correctionDose,
    totalInsulinDose: insulinDose,
    testType: "Insulin Dose Calculator",
    bookDate,
  });

  const clearFields = () => {
    setPatientEmail("");
    setPatientName("");
    setBookDate("");
    setAge("");
    setWeight("");
    setCarbs("");
    setBg("");
    setTargetBg("");
    setInsulinRatio("");
    setSensitivity("");
    setInsulinDose(null);
    setInsulinForCarbs(null);
    setCorrectionDose(null);
  };

  const uploadReport = async (reportData) => {
    try {
      const reportRef = collection(db, "Reports");
      await setDoc(doc(reportRef), reportData);
      alert("Report uploaded successfully!");
    } catch (error) {
      console.error("Error uploading report: ", error);
      alert("Error uploading report. Please try again.");
    }
  };

  const printReport = () => {
    const reportData = generateReport();
    const printableContent = `
      <h2>Insulin Dose Calculator Report</h2>
      <p><strong>Patient Name:</strong> ${reportData.patientName}</p>
      <p><strong>Patient Email:</strong> ${reportData.patientEmail}</p>
      <p><strong>Age:</strong> ${reportData.age}</p>
      <p><strong>Weight (kg):</strong> ${reportData.weight}</p>
      <p><strong>Carbohydrates in Meal (g):</strong> ${reportData.carbs}</p>
      <p><strong>Current Blood Glucose Level (mg/dL):</strong> ${reportData.bg}</p>
      <p><strong>Target Blood Glucose Level (mg/dL):</strong> ${reportData.targetBg}</p>
      <p><strong>Insulin-to-Carbohydrate Ratio:</strong> ${reportData.insulinRatio}</p>
      <p><strong>Correction Factor:</strong> ${reportData.sensitivity}</p>
      <p><strong>Insulin for Carbs:</strong> ${reportData.insulinForCarbs} units</p>
      <p><strong>Correction Dose:</strong> ${reportData.correctionDose} units</p>
      <p><strong>Total Insulin Dose:</strong> ${reportData.totalInsulinDose} units</p>
      <p><strong>Test Type:</strong> ${reportData.testType}</p>
      <p><strong>Report Date:</strong> ${reportData.reportDate}</p>
    `;
    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write(printableContent);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div
      className="idc-page"
      style={{
        backgroundImage: `url(${patientImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="idc-container">
        <h2 className="title">Insulin Dose Calculator</h2>

        <div className="calculation-section">
          <h3>Input Patient E-mail & Other Fields Fill Automatically</h3>
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
              <input type="text" className="input" value={patientName} readOnly />
            </div>
            <div className="form-group">
              <label className="label">Book Date:</label>
              <input type="date" className="input" value={bookDate} readOnly />
            </div>
            <div className="form-group">
              <label className="label">Age:</label>
              <input type="text" className="input" value={age} readOnly />
            </div>
          </div>
        </div>

        <h3>Insulin Dose Calculation</h3>
        <div className="form-container">
          <label>Weight (kg):</label>
          <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} />

          <label>Carbohydrates in Meal (g):</label>
          <input type="number" value={carbs} onChange={(e) => setCarbs(e.target.value)} />

          <label>Current Blood Glucose Level (mg/dL):</label>
          <input type="number" value={bg} onChange={(e) => setBg(e.target.value)} />

          <label>Target Blood Glucose Level (mg/dL):</label>
          <input type="number" value={targetBg} onChange={(e) => setTargetBg(e.target.value)} />

          <label>Insulin-to-Carbohydrate Ratio:</label>
          <input type="number" value={insulinRatio} onChange={(e) => setInsulinRatio(e.target.value)} />

          <label>Correction Factor (1 unit of insulin lowers BG by):</label>
          <input type="number" value={sensitivity} onChange={(e) => setSensitivity(e.target.value)} />

          <button onClick={calculateInsulin} className="btn green-btn">Generate Report</button>
          <button className="clear-button" onClick={clearFields}>Clear Fields</button>
          <button className="go-to-calculation-btn" onClick={() => navigate("/Calculation")}>
            Go to Calculation
          </button>
        </div>

        {insulinDose && (
          <div className="result">
            <h2>Total Insulin Dose: {insulinDose} units</h2>
            <h2>Insulin for Carbs: {insulinForCarbs} units</h2>
            <h2>Correction Dose: {correctionDose} units</h2>

            <button className="btn blue-btn" onClick={printReport}>Print Report</button>
            <button className="btn blue-btn" onClick={() => uploadReport(generateReport())}>Upload Report</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default IDC;
