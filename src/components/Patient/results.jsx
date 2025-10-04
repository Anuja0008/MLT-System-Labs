import React, { useState, useEffect } from "react";
import { db } from "../../firebase/db";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { useLocation } from "react-router-dom";
import { jsPDF } from "jspdf";
import "./Result.css";

const Result = () => {
  const location = useLocation();
  const { patientEmail, latestBookingDate, latestTestType } = location.state || {};

  const [email, setEmail] = useState(patientEmail || "");
  const [bookDate, setBookDate] = useState(latestBookingDate || "");
  const [testType, setTestType] = useState(latestTestType || "egfr");
  const [results, setResults] = useState([]);
  const [patientName, setPatientName] = useState("");

  useEffect(() => {
    if (email && bookDate && testType) {
      fetchResults();
    }
  }, [email, bookDate, testType]);

  const fetchResults = async () => {
    try {
      const reportsRef = collection(db, "Reports");
      const normalizedEmail = email.trim().toLowerCase();
      const normalizedBookDate = bookDate.trim();
      const normalizedTestType = testType.trim().toLowerCase();

      const q = query(reportsRef, where("patientEmail", "==", normalizedEmail));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const filteredResults = querySnapshot.docs
          .map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          }))
          .filter(
            (report) =>
              report.bookDate?.trim() === normalizedBookDate &&
              report.testType?.trim().toLowerCase() === normalizedTestType
          );

        if (filteredResults.length > 0) {
          setPatientName(filteredResults[0].patientName || "");
        }
        setResults(filteredResults);
      } else {
        setResults([]);
      }
    } catch (err) {
      console.error("Error fetching results:", err);
      setResults([]);
    }
  };

  const handleDelete = async (reportId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this report?");
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "Reports", reportId));
      alert("Report deleted successfully.");
      fetchResults();
    } catch (err) {
      console.error("Error deleting report:", err);
      alert("Failed to delete the report.");
    }
  };

  const formatTimestamp = (timestamp) => {
    if (timestamp && timestamp.seconds) {
      return new Date(timestamp.seconds * 1000).toLocaleString();
    }
    return "N/A";
  };

  const formatTestType = (type) => {
    const typeMap = {
      egfr: "eGFR (Estimated Glomerular Filtration Rate)",
      "blood urea nitrogen": "Blood Urea Nitrogen (BUN)",
      "insulin dose calculator": "Insulin Dose Calculation",
      "international normalized ratio (inr)": "International Normalized Ratio (INR)",
      "lpc test": "Lipid Profile Calculation",
    };
    return typeMap[type.trim().toLowerCase()] || type;
  };

  const prettifyKey = (key) => {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());
  };

  // ✅ FULLY FIXED PDF DOWNLOAD FUNCTION
  const downloadPDF = () => {
    if (results.length === 0) return alert("No results to download!");

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    let y = margin;
    const lineHeight = 7;

    const addNewPageIfNeeded = (currentY, extraHeight = lineHeight) => {
      if (currentY + extraHeight > pageHeight - margin) {
        doc.addPage();
        return margin;
      }
      return currentY;
    };

    // --- HEADER ---
    doc.setFillColor(13, 71, 161);
    doc.rect(0, 0, pageWidth, 30, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("ARIANA LABORATORIES", pageWidth / 2, 15, { align: "center" });
    doc.setFontSize(12);
    doc.text(
      "Badulla Branch | Registered Medical Diagnostic Center",
      pageWidth / 2,
      22,
      { align: "center" }
    );

    // --- PATIENT INFO ---
    y = 40;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("LABORATORY TEST REPORT", pageWidth / 2, y, { align: "center" });
    y += 15;

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("PATIENT INFORMATION", margin, y);
    y += 8;
    doc.setFont("helvetica", "normal");
    doc.text(`Patient Name: ${patientName || "Not specified"}`, margin, y);
    y += lineHeight;
    doc.text(`Patient Email: ${email}`, margin, y);
    y += lineHeight;
    doc.text(`Test Type: ${formatTestType(testType)}`, margin, y);
    y += lineHeight;
    doc.text(`Collection Date: ${bookDate}`, margin, y);
    y += lineHeight;
    doc.text(`Report Date: ${new Date().toLocaleDateString()}`, margin, y);
    y += 15;

    // --- TEST RESULTS ---
    doc.setFont("helvetica", "bold");
    doc.text("TEST RESULTS", margin, y);
    y += 8;
    doc.setFont("helvetica", "normal");

    results.forEach((report) => {
      const { id, patientEmail, bookDate, testType, timestamp, ...cleanReport } = report;

      Object.entries(cleanReport).forEach(([key, value]) => {
        y = addNewPageIfNeeded(y);
        doc.text(`${prettifyKey(key)}: ${value}`, margin + 5, y);
        y += lineHeight;
      });

      if (report.timestamp) {
        y = addNewPageIfNeeded(y);
        doc.text(`Analysis Time: ${formatTimestamp(report.timestamp)}`, margin + 5, y);
        y += lineHeight;
      }

      y += 10;
      y = addNewPageIfNeeded(y, 10);
    });

    // --- INTERPRETATION ---
    y = addNewPageIfNeeded(y, 30);
    doc.setFont("helvetica", "bold");
    doc.text("INTERPRETATION", margin, y);
    y += 8;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const interpretation =
      "This laboratory report is intended for use by qualified medical professionals only. Results should be interpreted in the context of the patient's clinical condition and other diagnostic information. Please consult with a physician for proper diagnosis and treatment recommendations.";
    y = addNewPageIfNeeded(y, 25);
    doc.text(interpretation, margin, y, { maxWidth: pageWidth - margin * 2 });
    y += 25;

    // --- SIGNATURE ---
    y = addNewPageIfNeeded(y, 50);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("_________________________", margin, y);
    doc.text("Dr. S. Wijesinghe", margin, y + 7);
    doc.text("Consultant Pathologist", margin, y + 14);
    doc.text("License No: PMCB-12345", margin, y + 21);

    doc.text("_________________________", pageWidth - margin - 60, y);
    doc.text("Laboratory Technician", pageWidth - margin - 60, y + 7);
    doc.text("Ariana Laboratories", pageWidth - margin - 60, y + 14);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - margin - 60, y + 21);

    // --- FOOTER ---
    doc.setFontSize(10);
    doc.text(
      `Generated by Ariana Laboratories | ${new Date().toLocaleString()}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" }
    );

    doc.save(`Ariana_Lab_Report_${patientName || email}.pdf`);
  };

  return (
    <div className="result-page">
      <div className="result-container">
        <h2>Search Test Results</h2>

        <div className="form-group">
          <label>Patient Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Booking Date:</label>
          <input
            type="date"
            value={bookDate}
            onChange={(e) => setBookDate(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Test Type:</label>
          <select value={testType} onChange={(e) => setTestType(e.target.value)}>
            <option value="egfr">EGFR</option>
            <option value="Blood Urea Nitrogen">BUN</option>
            <option value="Insulin Dose Calculator">Insulin Dose Calculator</option>
            <option value="International Normalized Ratio (INR)">INR</option>
            <option value="LPC Test">Lipid Profile Calculation</option>
          </select>
        </div>

        <div className="button-group">
          <button onClick={fetchResults}>Search</button>
          <button onClick={downloadPDF}>Download PDF Report</button>
        </div>

        <div className="results-section">
          {results.length > 0 ? (
            results.map((report, index) => (
              <div key={report.id || index} className="report-item">
                <div className="report-header">
                  <h3>Test Result {index + 1}</h3>
                  <button className="delete-btn" onClick={() => handleDelete(report.id)}>
                    🗑️ Delete
                  </button>
                </div>
                {Object.entries(report).map(([key, value]) => (
                  key !== "id" && (
                    <p key={key}>
                      <strong>{prettifyKey(key)}:</strong>{" "}
                      {key === "timestamp" ? formatTimestamp(value) : value}
                    </p>
                  )
                ))}
              </div>
            ))
          ) : (
            <p className="no-results">No matching reports found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Result;
