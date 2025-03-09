import React, { useState } from "react";
import { db } from "../../firebase/db";
import { collection, query, where, getDocs } from "firebase/firestore";
import "./Result.css"; // Assuming you'll create a separate CSS file for styling

const Result = () => {
  const [patientEmail, setPatientEmail] = useState("");
  const [bookDate, setBookDate] = useState("");
  const [testType, setTestType] = useState("egfr");
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    try {
      const reportsRef = collection(db, "Reports");
      const q = query(
        reportsRef,
        where("patientEmail", "==", patientEmail),
        where("bookDate", "==", bookDate),
        where("testType", "==", testType)
      );

      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const filteredResults = querySnapshot.docs.map((doc) => doc.data());
        setResults(filteredResults);
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error("Error fetching reports: ", error);
    }
  };

  const formatTimestamp = (timestamp) => {
    if (timestamp && timestamp.seconds) {
      const date = new Date(timestamp.seconds * 1000);
      return date.toLocaleString();
    }
    return "N/A";
  };

  return (
    <div className="result-container">
      <h2>Search Test Results</h2>

      <div className="form-group">
        <label>Patient Email:</label>
        <input
          type="email"
          value={patientEmail}
          onChange={(e) => setPatientEmail(e.target.value)}
          className="input-field"
        />
      </div>

      <div className="form-group">
        <label>Book Date:</label>
        <input
          type="date"
          value={bookDate}
          onChange={(e) => setBookDate(e.target.value)}
          className="input-field"
        />
      </div>

      <div className="form-group">
        <label>Test Type:</label>
        <select
          value={testType}
          onChange={(e) => setTestType(e.target.value)}
          className="select-field"
        >
          <option value="egfr">EGFR</option>
          <option value="Blood Urea Nitrogen">BUN</option>
          <option value="Insulin Dose Calculator">Insulin Dose Calculator</option>
          <option value="International Normalized Ratio (INR)">INR</option>
          <option value="LPC Test">Lipid Profile Calculation</option>
        </select>
      </div>

      <button className="search-btn" onClick={handleSearch}>
        Search
      </button>

      <div className="results-section">
        {results.length > 0 ? (
          <ul className="results-list">
            {results.map((report, index) => (
              <li key={index} className="report-item">
                {Object.entries(report).map(([key, value]) => (
                  <p key={key} className="report-detail">
                    <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong>{" "}
                    {key === "timestamp" ? formatTimestamp(value) : value}
                  </p>
                ))}
              </li>
            ))}
          </ul>
        ) : (
          <p>No matching reports found.</p>
        )}
      </div>
    </div>
  );
};

export default Result;
