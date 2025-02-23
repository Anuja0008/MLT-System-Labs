import React, { useState } from "react";
import { db } from "../../firebase/db"; // Firestore import
import { collection, getDocs, query, where, updateDoc, doc } from "firebase/firestore";
import emailjs from "@emailjs/browser";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const USERS_COLLECTION = "users";
  const EMAIL_FIELD = "email";
  const PASSWORD_FIELD = "password";

  const handleResetPassword = async () => {
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const usersRef = collection(db, USERS_COLLECTION);
      const q = query(usersRef, where(EMAIL_FIELD, "==", email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError("No user found with this email.");
        setLoading(false);
        return;
      }

      let userDocId = null;
      let userName = "";
      querySnapshot.forEach((docSnap) => {
        userDocId = docSnap.id;
        userName = docSnap.data().name || "User";
      });

      if (!userDocId) {
        setError("Something went wrong. Try again.");
        setLoading(false);
        return;
      }

      const tempPassword = Math.random().toString(36).slice(-8);
      const userDocRef = doc(db, USERS_COLLECTION, userDocId);
      await updateDoc(userDocRef, { [PASSWORD_FIELD]: tempPassword });

      const emailParams = {
        to_name: userName,
        to_email: email,
        password: tempPassword,
      };

      await emailjs
        .send(
          "service_o8wu5ji",
          "template_delfrig",
          emailParams,
          "TQNCaWwbyeda2B53Z"
        )
        .then((result) => {
          console.log("Email sent successfully:", result);
          setMessage("A temporary password has been sent to your email.");
        })
        .catch((error) => {
          console.error("Error sending email:", error);
          setError("Failed to send email. Please try again.");
        });

    } catch (error) {
      console.error("Error resetting password:", error);
      setError("Error resetting password. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      backgroundImage: "url('/background.jpg')", // Change to your actual image path
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      padding: "20px"
    }}>
      <div style={{
        backgroundColor: "rgba(255, 255, 255, 0.9)", // Slight transparency for better readability
        padding: "40px",
        borderRadius: "16px",
        width: "400px",
        textAlign: "center",
        boxShadow: "0px 8px 16px rgba(0, 0, 0, 0.5)"
      }}>
        <h2 style={{ marginBottom: "24px", fontSize: "24px", color: "#333" }}>Forgot Password</h2>

        {error && <p style={{ color: "red" }}>{error}</p>}
        {message && <p style={{ color: "green" }}>{message}</p>}

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
            marginBottom: "20px"
          }}
          required
          disabled={loading}
        />

        <button
          onClick={handleResetPassword}
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: "8px",
            background: "linear-gradient(135deg,rgb(38, 50, 142),rgb(51, 180, 73))",
            color: "white",
            fontSize: "18px",
            border: "none",
            cursor: "pointer"
          }}
          disabled={loading}
        >
          {loading ? "Processing..." : "Reset Password"}
        </button>
      </div>
    </div>
  );
};

export default ForgotPassword;
