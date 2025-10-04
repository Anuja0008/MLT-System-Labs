import React, { useState } from "react";
import { db } from "../../firebase/db";
import { collection, query, where, getDocs, setDoc, doc } from "firebase/firestore";
import "./LPC.css";
import { useNavigate } from "react-router-dom";

const LPC = () => {
  const [patientEmail, setPatientEmail] = useState("");
  const [patientName, setPatientName] = useState("");
  const [bookDate, setBookDate] = useState("");
  const [age, setAge] = useState("");
  const [lpcValue, setLpcValue] = useState("");
  const [lpcStatus, setLpcStatus] = useState("");
  const [lipidResult, setLipidResult] = useState([]);
  const [tc, setTc] = useState("");
  const [hdl, setHdl] = useState("");
  const [tg, setTg] = useState("");

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

  const calculateLipidProfile = () => {
    const totalCholesterol = parseFloat(tc);
    const hdlValue = parseFloat(hdl);
    const triglycerides = parseFloat(tg);

    if (
      isNaN(totalCholesterol) ||
      isNaN(hdlValue) ||
      isNaN(triglycerides) ||
      totalCholesterol <= 0 ||
      hdlValue <= 0 ||
      triglycerides <= 0
    ) {
      setLipidResult(["Please enter valid numbers for Total Cholesterol, HDL, and Triglycerides."]);
      return;
    }

    const ldl = (totalCholesterol - hdlValue - triglycerides / 5).toFixed(2);
    let statusMessage = "";
    let adviceMessage = "";

    if (totalCholesterol < 200 && hdlValue > 60 && ldl < 100 && triglycerides < 150) {
      statusMessage = "GOOD";
      adviceMessage = "Your lipid profile is within the healthy range.";
    } else {
      statusMessage = "BAD";
      adviceMessage =
        "Your lipid profile indicates potential health risks. Please consult your doctor for further evaluation.";
    }

    // Point-wise result array
    const resultPoints = [
      `LDL: ${ldl} mg/dL`,
      `Total Cholesterol: ${totalCholesterol} mg/dL`,
      `HDL: ${hdlValue} mg/dL`,
      `Triglycerides: ${triglycerides} mg/dL`,
      `Result: ${statusMessage}`,
      `${adviceMessage}`,
    ];

    setLipidResult(resultPoints);
    setLpcStatus(statusMessage.toLowerCase());
  };

  const uploadReport = async () => {
    try {
      if (!lipidResult.length) {
        alert("Please calculate the lipid profile before uploading the report.");
        return;
      }

      const reportData = {
        patientName,
        patientEmail,
        testType: "LPC Test",
        bookDate,
        age,
        lpcValue,
        lipidResult,
        lpcStatus,
        timestamp: new Date().toISOString(),
      };

      await setDoc(doc(db, "Reports", new Date().getTime().toString()), reportData);
      alert("Report uploaded successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to upload report.");
    }
  };

  const printReport = () => window.print();

  const clearFields = () => {
    setPatientEmail("");
    setPatientName("");
    setBookDate("");
    setAge("");
    setLpcValue("");
    setLpcStatus("");
    setTc("");
    setHdl("");
    setTg("");
    setLipidResult([]);
  };

  return (
    <div className="lpc-page">
      <div className="lpc-Container">
        <h2 className="title">LPC Calculation</h2>

        <div className="calculation-section">
          <h3>Input Patient Email & Auto-Fill Fields</h3>
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

          <h3>Lipid Profile Calculation</h3>
          <div className="form-group">
            <label>LPC Value:</label>
            <input type="number" value={lpcValue} onChange={(e) => setLpcValue(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Total Cholesterol:</label>
            <input type="number" value={tc} onChange={(e) => setTc(e.target.value)} />
          </div>
          <div className="form-group">
            <label>HDL:</label>
            <input type="number" value={hdl} onChange={(e) => setHdl(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Triglycerides:</label>
            <input type="number" value={tg} onChange={(e) => setTg(e.target.value)} />
          </div>

          <button onClick={calculateLipidProfile} className="btn green-btn">
            Calculate Lipid Profile
          </button>
          <button onClick={clearFields} className="btn red-btn">
            Clear Fields
          </button>
          <button className="go-to-calculation-btn" onClick={() => navigate("/Calculation")}>
            Go to Calculation
          </button>
        </div>

        {lipidResult.length > 0 && (
          <div className={`result-section ${lpcStatus}`}>
            <h3 className="result-title">Lipid Profile Result</h3>
            <ul>
              {lipidResult.map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>
            <button className="print-button" onClick={printReport}>
              Print Report
            </button>
            <button onClick={uploadReport} className="btn blue-btn">
              Upload Report
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LPC;
