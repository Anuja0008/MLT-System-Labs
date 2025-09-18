import React, { useState, useEffect } from "react";
import { db } from "../../firebase/db";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useLocation } from "react-router-dom";
import { jsPDF } from "jspdf";
import "./Result.css";

const Result = () => {
  const location = useLocation();
  const { patientEmail, latestBookingDate, latestTestType } = location.state || {};

  const [email, setEmail] = useState(patientEmail || '');
  const [bookDate, setBookDate] = useState(latestBookingDate || '');
  const [testType, setTestType] = useState(latestTestType || 'egfr');
  const [results, setResults] = useState([]);
  const [patientName, setPatientName] = useState('');

  useEffect(() => {
    if (email && bookDate && testType) {
      fetchResults();
    }
  }, [email, bookDate, testType]);

  const fetchResults = async () => {
    try {
      const reportsRef = collection(db, "Reports");
      const q = query(
        reportsRef,
        where("patientEmail", "==", email),
        where("bookDate", "==", bookDate),
        where("testType", "==", testType)
      );

      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const filteredResults = querySnapshot.docs.map(doc => {
          const data = doc.data();
          // Extract patient name if available
          if (data.patientName) setPatientName(data.patientName);
          return data;
        });
        setResults(filteredResults);
      } else {
        setResults([]);
      }
    } catch (err) {
      console.error(err);
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
      'egfr': 'eGFR (Estimated Glomerular Filtration Rate)',
      'Blood Urea Nitrogen': 'Blood Urea Nitrogen (BUN)',
      'Insulin Dose Calculator': 'Insulin Dose Calculation',
      'International Normalized Ratio (INR)': 'International Normalized Ratio (INR)',
      'LPC Test': 'Lipid Profile Calculation'
    };
    return typeMap[type] || type;
  };

  const downloadPDF = () => {
    if (results.length === 0) return alert("No results to download!");

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    let y = margin;
    
    // Add header with logo and information
    doc.setFillColor(13, 71, 161);
    doc.rect(0, 0, pageWidth, 30, 'F');
    
    // Logo and header text
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("ARIANA LABORATORIES", pageWidth / 2, 15, { align: "center" });
    doc.setFontSize(12);
    doc.text("Badulla Branch | Registered Medical Diagnostic Center", pageWidth / 2, 22, { align: "center" });
    
    y = 40;
    
    // Report title
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("LABORATORY TEST REPORT", pageWidth / 2, y, { align: "center" });
    y += 15;
    
    // Horizontal line
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;
    
    // Patient information section
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("PATIENT INFORMATION", margin, y);
    y += 8;
    
    doc.setFont("helvetica", "normal");
    doc.text(`Patient Name: ${patientName || 'Not specified'}`, margin, y);
    y += 7;
    doc.text(`Patient Email: ${email}`, margin, y);
    y += 7;
    doc.text(`Test Type: ${formatTestType(testType)}`, margin, y);
    y += 7;
    doc.text(`Collection Date: ${bookDate}`, margin, y);
    y += 7;
    doc.text(`Report Date: ${new Date().toLocaleDateString()}`, margin, y);
    y += 15;
    
    // Test results section
    doc.setFont("helvetica", "bold");
    doc.text("TEST RESULTS", margin, y);
    y += 8;
    
    doc.setFont("helvetica", "normal");
    results.forEach((report, index) => {
      // Add a new page if needed
      if (y > 240) {
        doc.addPage();
        y = margin;
      }
      
      // Remove unnecessary fields for display
      const { patientEmail, bookDate, testType, timestamp, ...cleanReport } = report;
      
      Object.entries(cleanReport).forEach(([key, value]) => {
        if (y > 270) {
          doc.addPage();
          y = margin;
        }
        
        // Format key for better display
        const formattedKey = key
          .replace(/([A-Z])/g, ' $1')
          .replace(/^./, str => str.toUpperCase());
        
        doc.text(`${formattedKey}: ${value}`, margin + 5, y);
        y += 7;
      });
      
      // Add timestamp if available
      if (report.timestamp) {
        if (y > 270) {
          doc.addPage();
          y = margin;
        }
        doc.text(`Analysis Time: ${formatTimestamp(report.timestamp)}`, margin + 5, y);
        y += 7;
      }
      
      y += 5;
    });
    
    y += 10;
    
    // Add footer with interpretation and signatures
    if (y > 250) {
      doc.addPage();
      y = margin;
    }
    
    doc.setFont("helvetica", "bold");
    doc.text("INTERPRETATION", margin, y);
    y += 8;
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const interpretation = "This laboratory report is intended for use by qualified medical professionals only. Results should be interpreted in the context of the patient's clinical condition and other diagnostic information. Please consult with a physician for proper diagnosis and treatment recommendations.";
    doc.text(interpretation, margin, y, { maxWidth: pageWidth - margin * 2 });
    y += 20;
    
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
    
    // Page numbering
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: "center" });
    }
    
    doc.save(`Ariana_Lab_Report_${patientName || email}.pdf`);
  };

  return (
    <div className="result-page">
      <div className="result-container">
        <h2>Search Test Results</h2>

        <div className="form-group">
          <label>Patient Email:</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div className="form-group">
          <label>Booking Date:</label>
          <input type="date" value={bookDate} onChange={(e) => setBookDate(e.target.value)} />
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
          {results.length > 0 ? results.map((report, index) => (
            <div key={index} className="report-item">
              <h3>Test Result {index + 1}</h3>
              {Object.entries(report).map(([key, value]) => (
                <p key={key}><strong>{key}:</strong> {key === "timestamp" ? formatTimestamp(value) : value}</p>
              ))}
            </div>
          )) : <p className="no-results">No matching reports found.</p>}
        </div>
      </div>
    </div>
  );
};

export default Result;