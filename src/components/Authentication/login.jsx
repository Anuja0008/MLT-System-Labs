import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { db } from "../../firebase/db"; // Import Firestore
import { collection, getDocs, query, where } from "firebase/firestore";

// Import your background image
import backgroundImage from '../../Photos/www.jpg'; // Adjust the path as necessary

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("assistant");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Constants for Firestore collection and field names
  const USERS_COLLECTION = "users";
  const EMAIL_FIELD = "email";
  const PASSWORD_FIELD = "password";
  const ROLE_FIELD = "role";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validate email format
      if (!/\S+@\S+\.\S+/.test(email)) {
        setError("Please enter a valid email address.");
        return;
      }

      // Query Firestore for user credentials
      const usersRef = collection(db, USERS_COLLECTION);
      const q = query(usersRef, where(EMAIL_FIELD, "==", email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError("No user found with this email.");
        return;
      }

      let userData = null;
      querySnapshot.forEach((doc) => {
        userData = doc.data();
      });

      // Check if the password matches
      if (userData[PASSWORD_FIELD] !== password) {
        setError("Incorrect password. Please try again.");
        return;
      }

      // Check if the role matches (case-insensitive)
      if (userData[ROLE_FIELD].toLowerCase() !== role.toLowerCase()) {
        setError("Incorrect role selection.");
        return;
      }

      // Store user data in local storage
      localStorage.setItem("user", JSON.stringify(userData));

      // Reset form fields
      setEmail("");
      setPassword("");
      setRole("doctor");

      // Navigate to different profile pages based on user role
      switch (userData[ROLE_FIELD].toLowerCase()) {
        case 'assistant':
          navigate('/Doctorprofile'); // Redirect to Doctor Profile
          break;
        case 'patient':
          navigate('/Patientprofile'); // Redirect to Patient Profile
          break;
        case 'admin':
          navigate('/assistant-profile'); // Redirect to Assistant Profile
          break;
        default:
          navigate('/home'); // Fallback to home if role is unrecognized
      }
    } catch (error) {
      console.error("Login error:", error.message);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: `linear-gradient(rgba(11, 170, 77, 0.5), rgba(19, 38, 132, 0.5)), url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        padding: "20px",
      }}
    >
      <div
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          padding: "40px",
          borderRadius: "16px",
          width: "400px",
          textAlign: "center",
          boxShadow: "0px 8px 16px rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(5px)",
          opacity: "0.8"
        }}
      >
        <h2 style={{ marginBottom: "24px", fontSize: "28px", color: "#333", fontWeight: "600", fontFamily: "'Poppins', sans-serif" }}>
          Medical Laboratory Login
        </h2>

        {error && <p style={{ color: "red", textAlign: "center", marginBottom: "20px" }}>{error}</p>}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "20px", textAlign: "left" }}>
            <label style={{ display: "block", fontSize: "14px", color: "#555", fontWeight: "500", marginBottom: "8px", fontFamily: "'Poppins', sans-serif" }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              placeholder="Enter your email"
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #ddd",
                borderRadius: "8px",
                fontSize: "16px",
                outline: "none",
                transition: "all 0.3s ease-in-out",
                fontFamily: "'Poppins', sans-serif",
              }}
              required
              disabled={loading}
            />
          </div>

          <div style={{ marginBottom: "20px", textAlign: "left" }}>
            <label style={{ display: "block", fontSize: "14px", color: "#555", fontWeight: "500", marginBottom: "8px", fontFamily: "'Poppins', sans-serif" }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              placeholder="Enter your password"
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #ddd",
                borderRadius: "8px",
                fontSize: "16px",
                outline: "none",
                transition: "all 0.3s ease-in-out",
                fontFamily: "'Poppins', sans-serif",
              }}
              required
              disabled={loading}
            />
          </div>

          <div style={{ marginBottom: "20px", textAlign: "left" }}>
            <label style={{ display: "block", fontSize: "14px", color: "#555", fontWeight: "500", marginBottom: "8px", fontFamily: "'Poppins', sans-serif" }}>
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #ddd",
                borderRadius: "8px",
                fontSize: "16px",
                outline: "none",
                transition: "all 0.3s ease-in-out",
                fontFamily: "'Poppins', sans-serif",
              }}
              disabled={loading}
            >
              <option value="doctor">Doctor</option>
              <option value="patient">Patient</option>
              <option value="assistant">Assistant</option>
            </select>
          </div>

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: "8px",
              background: "linear-gradient(135deg,rgb(38, 50, 142),rgb(51, 180, 73))",
              color: "white",
              fontSize: "18px",
              border: "none",
              cursor: "pointer",
              transition: "all 0.3s ease-in-out",
              fontFamily: "'Poppins', sans-serif",
              fontWeight: "500",
            }}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <div style={{ marginTop: "20px", textAlign: "center" }}>
            <Link
              to="/ForgetPassword"
              style={{
                color: "#66a832",
                textDecoration: "none",
                fontSize: "14px",
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              Forgot Password?
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;