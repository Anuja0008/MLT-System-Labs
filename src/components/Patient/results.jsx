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
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import "./Result.css";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Result = () => {
  const location = useLocation();
  const { patientEmail, latestBookingDate, latestTestType } = location.state || {};

  const [email, setEmail] = useState(patientEmail || "");
  const [bookDate, setBookDate] = useState(latestBookingDate || "");
  const [testType, setTestType] = useState(latestTestType || "egfr");
  const [results, setResults] = useState([]);
  const [patientName, setPatientName] = useState("");
  const [chartData, setChartData] = useState(null);
  const [chartAnalysis, setChartAnalysis] = useState("");

  useEffect(() => {
    if (email && bookDate && testType) {
      fetchResults();
    }
  }, [email, bookDate, testType]);

  useEffect(() => {
    if (results.length > 0) {
      generateChartData();
    } else {
      setChartData(null);
      setChartAnalysis("");
    }
  }, [results]);

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

  // Improved function to get the main result value for ALL test types
  const getMainResultValue = (report, testType) => {
    const testTypeLower = testType.toLowerCase();
    
    // First, try common result field names that work for ALL test types
    const commonResultFields = ['result', 'value', 'calculatedValue', 'score', 'finalValue', 'testResult'];
    
    for (let field of commonResultFields) {
      if (report[field] !== undefined && report[field] !== null && !isNaN(parseFloat(report[field]))) {
        const value = parseFloat(report[field]);
        // For INR, accept small decimal values
        if (testTypeLower.includes('inr')) {
          return value;
        }
        // For other tests, ensure it's a reasonable positive value
        if (value > 0 && value < 10000) {
          return value;
        }
      }
    }
    
    // Then try test-specific field names
    if (testTypeLower.includes('egfr')) {
      const egfrFields = ['egfrValue', 'egfr', 'egfrResult'];
      for (let field of egfrFields) {
        if (report[field] !== undefined && report[field] !== null && !isNaN(parseFloat(report[field]))) {
          const value = parseFloat(report[field]);
          if (value > 0 && value < 10000) return value;
        }
      }
    } else if (testTypeLower.includes('blood urea nitrogen') || testTypeLower.includes('bun')) {
      const bunFields = ['bunValue', 'bun', 'urea', 'ureaValue'];
      for (let field of bunFields) {
        if (report[field] !== undefined && report[field] !== null && !isNaN(parseFloat(report[field]))) {
          const value = parseFloat(report[field]);
          if (value > 0 && value < 10000) return value;
        }
      }
    } else if (testTypeLower.includes('insulin')) {
      const insulinFields = ['insulinDose', 'dose', 'insulinValue'];
      for (let field of insulinFields) {
        if (report[field] !== undefined && report[field] !== null && !isNaN(parseFloat(report[field]))) {
          const value = parseFloat(report[field]);
          if (value > 0 && value < 10000) return value;
        }
      }
    } else if (testTypeLower.includes('inr')) {
      const inrFields = ['inrValue', 'inr', 'inrResult', 'pt', 'controlPt'];
      for (let field of inrFields) {
        if (report[field] !== undefined && report[field] !== null && !isNaN(parseFloat(report[field]))) {
          const value = parseFloat(report[field]);
          // INR values can be small decimals, so accept any reasonable value
          if (value >= 0 && value < 100) return value;
        }
      }
    } else if (testTypeLower.includes('lpc') || testTypeLower.includes('lipid')) {
      // For lipid profile, use the most critical value
      const lipidFields = ['totalCholesterol', 'ldl', 'triglycerides', 'hdl', 'vldl', 'nonHdl'];
      const lipidValues = [];
      
      for (let field of lipidFields) {
        if (report[field] !== undefined && report[field] !== null && !isNaN(parseFloat(report[field]))) {
          const value = parseFloat(report[field]);
          if (value > 0 && value < 10000) {
            lipidValues.push(value);
          }
        }
      }
      
      if (lipidValues.length > 0) {
        return Math.max(...lipidValues);
      }
    }
    
    // Final fallback: look for ANY numeric field that's not metadata
    const metadataFields = ['id', 'patientEmail', 'patientName', 'bookDate', 'testType', 'timestamp', 'age', 'gender'];
    
    for (let key in report) {
      if (metadataFields.includes(key)) continue;
      
      const value = report[key];
      // Skip non-numeric values, booleans, and strings that don't represent numbers
      if (value !== undefined && value !== null && !isNaN(parseFloat(value)) && typeof value !== 'boolean') {
        const numValue = parseFloat(value);
        // Different validation based on test type
        if (testTypeLower.includes('inr')) {
          // INR can have small decimal values
          if (numValue >= 0 && numValue < 100) {
            return numValue;
          }
        } else {
          // Other tests should have reasonable positive values
          if (numValue > 0 && numValue < 10000) {
            return numValue;
          }
        }
      }
    }
    
    console.log("No valid result value found in report:", report);
    return null;
  };

  const getStatusInfo = (value, testType) => {
    const criticalRanges = {
      egfr: {
        normal: { min: 90, max: 120, description: "Normal kidney function" },
        mild: { min: 60, max: 89, description: "Mild kidney damage" },
        moderate: { min: 30, max: 59, description: "Moderate kidney damage" },
        severe: { min: 15, max: 29, description: "Severe kidney damage" },
        critical: { min: 0, max: 14, description: "Kidney failure" }
      },
      "blood urea nitrogen": {
        normal: { min: 7, max: 20, description: "Normal kidney function" },
        mild: { min: 21, max: 30, description: "Mild kidney impairment" },
        moderate: { min: 31, max: 40, description: "Moderate kidney impairment" },
        severe: { min: 41, max: 50, description: "Severe kidney impairment" },
        critical: { min: 51, max: 100, description: "Kidney failure" }
      },
      "insulin dose calculator": {
        normal: { min: 0, max: 10, description: "Normal insulin requirement" },
        mild: { min: 11, max: 20, description: "Mild insulin resistance" },
        moderate: { min: 21, max: 30, description: "Moderate insulin resistance" },
        severe: { min: 31, max: 40, description: "Severe insulin resistance" },
        critical: { min: 41, max: 100, description: "Critical insulin requirement" }
      },
      "international normalized ratio (inr)": {
        normal: { min: 0.8, max: 1.2, description: "Normal blood clotting" },
        mild: { min: 1.3, max: 2.0, description: "Mild anticoagulation" },
        moderate: { min: 2.1, max: 3.0, description: "Therapeutic range for most conditions" },
        severe: { min: 3.1, max: 4.0, description: "High bleeding risk" },
        critical: { min: 4.1, max: 10, description: "Critical bleeding risk" }
      },
      "lpc test": {
        normal: { min: 0, max: 150, description: "Normal level" },
        mild: { min: 151, max: 200, description: "Mild elevation" },
        moderate: { min: 201, max: 250, description: "Moderate elevation" },
        severe: { min: 251, max: 300, description: "Severe elevation" },
        critical: { min: 301, max: 500, description: "Critical elevation" }
      }
    };

    const currentTestType = testType.trim().toLowerCase();
    const ranges = criticalRanges[currentTestType] || criticalRanges.egfr;
    
    // Safe check for ranges
    if (!ranges.critical || !ranges.normal) {
      return { status: 'NORMAL', color: [75, 192, 192], description: "Within normal range" };
    }

    if (value >= ranges.critical.min && value <= ranges.critical.max) {
      return { status: 'CRITICAL', color: [255, 0, 0], description: ranges.critical.description };
    } else if (ranges.severe && value >= ranges.severe.min && value <= ranges.severe.max) {
      return { status: 'SEVERE', color: [255, 165, 0], description: ranges.severe.description };
    } else if (ranges.moderate && value >= ranges.moderate.min && value <= ranges.moderate.max) {
      return { status: 'MODERATE', color: [255, 255, 0], description: ranges.moderate.description };
    } else if (ranges.mild && value >= ranges.mild.min && value <= ranges.mild.max) {
      return { status: 'MILD', color: [173, 216, 230], description: ranges.mild.description };
    } else {
      return { status: 'NORMAL', color: [75, 192, 192], description: ranges.normal.description };
    }
  };

  const generateChartData = () => {
    if (results.length === 0) return;

    const report = results[0];
    const mainResultValue = getMainResultValue(report, testType);
    
    console.log("Report data:", report);
    console.log("Main result value:", mainResultValue);
    console.log("Test type:", testType);
    
    if (mainResultValue === null || mainResultValue === undefined || isNaN(mainResultValue)) {
      console.log("No valid result value found for test type:", testType);
      setChartData(null);
      return;
    }

    const numericValue = mainResultValue;
    const statusInfo = getStatusInfo(numericValue, testType);
    
    const testTypeDisplay = formatTestType(testType);
    
    const data = {
      labels: [testTypeDisplay],
      datasets: [
        {
          label: 'Test Result',
          data: [numericValue],
          backgroundColor: [`rgba(${statusInfo.color[0]}, ${statusInfo.color[1]}, ${statusInfo.color[2]}, 0.6)`],
          borderColor: [`rgba(${statusInfo.color[0]}, ${statusInfo.color[1]}, ${statusInfo.color[2]}, 1)`],
          borderWidth: 2,
          borderRadius: 10,
          barPercentage: 0.5,
        },
      ],
    };

    const options = {
      responsive: true,
      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: true,
          text: `Patient Health Status - ${statusInfo.status}`,
          font: {
            size: 18,
            weight: 'bold'
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `Result: ${numericValue} - ${statusInfo.status}`;
            },
            afterLabel: function(context) {
              return statusInfo.description;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Value',
            font: {
              weight: 'bold'
            }
          },
          grid: {
            color: 'rgba(0,0,0,0.1)'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Test Type',
            font: {
              weight: 'bold'
            }
          },
          grid: {
            display: false
          }
        }
      },
    };

    setChartData({ data, options });
    setChartAnalysis(`Health Status: ${statusInfo.status}\nValue: ${numericValue}\nDescription: ${statusInfo.description}`);
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
      egfr: "eGFR",
      "blood urea nitrogen": "BUN",
      "insulin dose calculator": "Insulin Dose",
      "international normalized ratio (inr)": "INR",
      "lpc test": "Lipid Profile",
    };
    return typeMap[type.trim().toLowerCase()] || type;
  };

  const prettifyKey = (key) => {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());
  };

  // PDF download function remains the same...
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

    // --- HEALTH STATUS SUMMARY ---
    if (results.length > 0) {
      const report = results[0];
      const mainResultValue = getMainResultValue(report, testType);
      
      if (mainResultValue && !isNaN(mainResultValue)) {
        const numericValue = mainResultValue;
        const statusInfo = getStatusInfo(numericValue, testType);
        
        doc.setFont("helvetica", "bold");
        doc.text("HEALTH STATUS", margin, y);
        y += 8;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        
        // Set color based on status
        switch(statusInfo.status) {
          case 'CRITICAL':
            doc.setTextColor(255, 0, 0);
            break;
          case 'SEVERE':
            doc.setTextColor(255, 165, 0);
            break;
          case 'MODERATE':
            doc.setTextColor(255, 165, 0);
            break;
          case 'MILD':
            doc.setTextColor(0, 0, 255);
            break;
          default:
            doc.setTextColor(0, 128, 0);
        }
        
        y = addNewPageIfNeeded(y);
        doc.setFont("helvetica", "bold");
        doc.text(`● Status: ${statusInfo.status}`, margin + 5, y);
        y += lineHeight;
        
        // Reset color
        doc.setTextColor(0, 0, 0);
        doc.text(`● Result Value: ${numericValue}`, margin + 5, y);
        y += lineHeight;
        doc.text(`● Assessment: ${statusInfo.description}`, margin + 5, y);
        y += 10;
      }
    }

    // --- DETAILED RESULTS ---
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    y = addNewPageIfNeeded(y, 15);
    doc.text("DETAILED TEST RESULTS", margin, y);
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
    doc.text("Dr. Lakshika Weerasinghe", margin, y + 7);
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

        {/* Health Status Chart Section - SIMPLIFIED */}
        {chartData && (
          <div className="chart-section">
            <h3>Patient Health Status</h3>
            <div className="chart-container">
              <Bar data={chartData.data} options={chartData.options} />
            </div>
            <div className="status-indicator">
              <div className="status-info">
                <h4>Current Status: 
                  <span className={`status-${chartData.options.plugins.title.text.includes('CRITICAL') ? 'critical' : 
                    chartData.options.plugins.title.text.includes('SEVERE') ? 'severe' :
                    chartData.options.plugins.title.text.includes('MODERATE') ? 'moderate' :
                    chartData.options.plugins.title.text.includes('MILD') ? 'mild' : 'normal'
                  }`}>
                    {chartData.options.plugins.title.text.split(' - ')[1]}
                  </span>
                </h4>
                <p>Result Value: <strong>{chartData.data.datasets[0].data[0]}</strong></p>
              </div>
            </div>
          </div>
        )}

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