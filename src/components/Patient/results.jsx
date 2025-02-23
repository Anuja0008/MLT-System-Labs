import React, { useState } from "react";
import { db } from "../../firebase/db"; // Correct import path for your db instance
import { collection, query, where, getDocs } from "firebase/firestore"; // Correct imports for Firestore

const Result = () => {
  const [patientEmail, setPatientEmail] = useState("");
  const [bookDate, setBookDate] = useState("");
  const [testType, setTestType] = useState("egfr");
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    try {
      // Reference to the "Reports" collection
      const reportsRef = collection(db, "Reports");

      // Create a query to filter based on the user input
      const q = query(
        reportsRef,
        where("patientEmail", "==", patientEmail),
        where("bookDate", "==", bookDate),
        where("testType", "==", testType)
      );

      // Get the documents that match the query
      const querySnapshot = await getDocs(q);

      // If there are matching reports, display them
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

  // Convert Firestore timestamp to a human-readable format
  const formatTimestamp = (timestamp) => {
    if (timestamp && timestamp.seconds) {
      const date = new Date(timestamp.seconds * 1000); // Convert to milliseconds
      return date.toLocaleString(); // Or use .toDateString()/.toISOString() as needed
    }
    return "N/A";
  };

  return (
    <div>
      <div>
        <label>Patient Email:</label>
        <input
          type="email"
          value={patientEmail}
          onChange={(e) => setPatientEmail(e.target.value)}
        />
      </div>
      <div>
        <label>Book Date:</label>
        <input
          type="date"
          value={bookDate}
          onChange={(e) => setBookDate(e.target.value)}
        />
      </div>
      <div>
        <label>Test Type:</label>
        <select
          value={testType}
          onChange={(e) => setTestType(e.target.value)}
        >
          <option value="egfr">EGFR</option>
          <option value="Blood Urea Nitrogen">Bun</option>
          <option value="Insulin Dose Calculator">Insulin Dose Calculator</option>
          {/* Add more options if needed */}
        </select>
      </div>
      <button onClick={handleSearch}>Search</button>

      <div>
        {results.length > 0 ? (
          <ul>
            {results.map((report, index) => (
              <li key={index}>
                {/* Dynamically render all fields */}
                {Object.entries(report).map(([key, value]) => (
                  <p key={key}>
                    <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> 
                    {key === 'timestamp' ? formatTimestamp(value) : value}
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
