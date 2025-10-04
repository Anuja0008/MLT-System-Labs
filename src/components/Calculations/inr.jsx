import React, { useState } from "react";
import { db } from "../../firebase/db";
import { collection, query, where, getDocs, setDoc, doc } from "firebase/firestore";
import "./inr.css";
import { useNavigate } from "react-router-dom";

const INR = () => {
  const [patientEmail, setPatientEmail] = useState("");
  const [patientName, setPatientName] = useState("");
  const [bookDate, setBookDate] = useState("");
  const [age, setAge] = useState("");
  const [pt, setPt] = useState("");
  const [controlPT, setControlPT] = useState("");
  const [isi, setIsi] = useState("");
  const [inrResult, setInrResult] = useState(null);
  const [inrStatus, setInrStatus] = useState("");

  const navigate = useNavigate();

  const fetchPatientDetails = async () => {
    try {
      const bookingsQuery = query(collection(db, "Bookings"), where("patientName", "==", patientEmail));
      const bookingsSnapshot = await getDocs(bookingsQuery);
      if (!bookingsSnapshot.empty) {
        const bookingDoc = bookingsSnapshot.docs[0].data();
        setBookDate(bookingDoc.date);
      } else {
        alert("No booking found for this email.");
      }

      const usersQuery = query(collection(db, "users"), where("email", "==", patientEmail));
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
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  const calculateINR = () => {
    const ptValue = parseFloat(pt);
    const controlPTValue = parseFloat(controlPT);
    const isiValue = parseFloat(isi);
    if (isNaN(ptValue) || isNaN(controlPTValue) || isNaN(isiValue) || ptValue <= 0 || controlPTValue <= 0 || isiValue <= 0) {
      setInrResult("Please enter valid numbers.");
      setInrStatus("");
      return;
    }
    const inr = Math.pow(ptValue / controlPTValue, isiValue).toFixed(2);
    let statusMessage = "";
    if (inr >= 0.8 && inr <= 1.1) statusMessage = "Your INR is within the normal range.";
    else if (inr >= 2.0 && inr <= 3.0) statusMessage = "Your INR is within the recommended range for patients on anticoagulant therapy.";
    else if (inr < 0.8) statusMessage = "Your INR is too low. This may increase the risk of clot formation.";
    else statusMessage = "Your INR is too high, increasing the risk of bleeding.";

    setInrResult(`INR Value: ${inr} - ${statusMessage}`);
    setInrStatus(inr >= 0.8 && inr <= 3.0 ? "good" : "bad");
  };

  const uploadReport = async () => {
    try {
      const reportData = { patientName, patientEmail, testType: "International Normalized Ratio (INR)", bookDate, age, inrResult };
      await setDoc(doc(db, "Reports", new Date().getTime().toString()), reportData);
      alert("Report uploaded successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to upload report.");
    }
  };

  const printReport = () => window.print();
  const clearFields = () => { setPatientEmail(""); setPatientName(""); setBookDate(""); setAge(""); setPt(""); setControlPT(""); setIsi(""); setInrResult(null); setInrStatus(""); };

  return (
    <div className="inr-page">
      <div className="inr-Container">
        <h2 className="title">International Normalized Ratio (INR) Calculator</h2>
        {/* Patient Details */}
        <div className="calculation-section">
          <h3>Input Patient Email & Auto-Fill Fields</h3>
          <div className="form-group">
            <label>Patient Email:</label>
            <input type="email" value={patientEmail} onChange={(e) => setPatientEmail(e.target.value)} onBlur={fetchPatientDetails} />
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
          {/* INR Inputs */}
          <h3>INR Calculation</h3>
          <div className="form-group">
            <label>Patient PT (sec):</label>
            <input type="number" value={pt} onChange={(e) => setPt(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Control PT (sec):</label>
            <input type="number" value={controlPT} onChange={(e) => setControlPT(e.target.value)} />
          </div>
          <div className="form-group">
            <label>ISI Value:</label>
            <input type="number" value={isi} onChange={(e) => setIsi(e.target.value)} />
          </div>
          <button className="btn green-btn" onClick={calculateINR}>Calculate INR</button>
          <button className="btn red-btn" onClick={clearFields}>Clear Fields</button>
          <button className="go-to-calculation-btn" onClick={() => navigate("/Calculation")}>Go to Calculation</button>
        </div>

        {/* INR Result */}
        {inrResult && (
          <div className={`result-section ${inrStatus}`}>
            <h3>INR Result</h3>
            <p>{inrResult}</p>
            <button className="print-button" onClick={printReport}>Print Report</button>
            <button className="btn blue-btn" onClick={uploadReport}>Upload Report</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default INR;
