import React, { useState } from "react";
import { db } from "../../firebase/db"; // Firestore import
import { collection, getDocs, query, where, updateDoc, doc } from "firebase/firestore";
import emailjs from "@emailjs/browser";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [tempPassword, setTempPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // To track the current step

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
      let userTempPassword = "";
      querySnapshot.forEach((docSnap) => {
        userDocId = docSnap.id;
        userName = docSnap.data().name || "User"; // If name doesn't exist, use "User"
        userTempPassword = docSnap.data()[PASSWORD_FIELD]; // Fetch the stored temporary password
      });

      if (!userDocId) {
        setError("Something went wrong. Try again.");
        setLoading(false);
        return;
      }

      const tempPassword = Math.random().toString(36).slice(-8); // Generate a temporary password
      const userDocRef = doc(db, USERS_COLLECTION, userDocId);
      await updateDoc(userDocRef, { [PASSWORD_FIELD]: tempPassword });

      // Prepare email body with name and password
      const emailBody = `
        Hello ${userName},
        We received a request to reset your password. Here is your temporary password:
        ${tempPassword}
        You can use this password to log in and reset your password later.
        If you did not request this change, please ignore this email.
        Best regards,
      `;

      // Prepare email parameters to send
      const emailParams = {
        to_name: userName,
        to_email: email,
        message: emailBody, // Set the email body with the generated content
      };

      // Send the email with the temporary password
      await emailjs
        .send(
          "service_jb667to", // Replace with your actual service ID
          "template_bxsjpmf", // Replace with your actual template ID
          emailParams,
          "IBYw3GvqWUVFDrE24" // Replace with your actual user ID
        )
        .then((result) => {
          console.log("Email sent successfully:", result);
          setMessage("A temporary password has been sent to your email.");
          setStep(2); // Move to the step where the user can enter the temporary password
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

  const handleVerifyTempPassword = async () => {
    setError("");
    setMessage("");

    // Trim both passwords to avoid whitespace issues
    if (newPassword.trim() !== confirmPassword.trim()) {
      setError("New password and confirm password do not match.");
      return;
    }

    try {
      const usersRef = collection(db, USERS_COLLECTION);
      const q = query(usersRef, where(EMAIL_FIELD, "==", email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError("No user found with this email.");
        return;
      }

      let userDocId = null;
      let storedTempPassword = "";
      querySnapshot.forEach((docSnap) => {
        userDocId = docSnap.id;
        storedTempPassword = docSnap.data()[PASSWORD_FIELD]; // Stored temporary password
      });

      if (storedTempPassword !== tempPassword) {
        setError("Incorrect temporary password.");
        return;
      }

      // Proceed to update the password
      const userDocRef = doc(db, USERS_COLLECTION, userDocId);
      await updateDoc(userDocRef, { [PASSWORD_FIELD]: newPassword });
      setMessage("Your password has been successfully updated!");
      setStep(1); // Optionally, reset the step or navigate to another view
    } catch (error) {
      setError("Failed to reset password. Try again.");
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
        <h2 style={{ marginBottom: "24px", fontSize: "24px", color: "#333" }}>
          {step === 1 ? "Forgot Password" : "Verify Temporary Password"}
        </h2>

        {error && <p style={{ color: "red" }}>{error}</p>}
        {message && <p style={{ color: "green" }}>{message}</p>}

        {step === 1 ? (
          <>
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
          </>
        ) : (
          <>
            <input
              type="text"
              value={tempPassword}
              placeholder="Enter temporary password"
              onChange={(e) => setTempPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #ddd",
                borderRadius: "8px",
                fontSize: "16px",
                marginBottom: "20px"
              }}
              required
            />
            <input
              type="password"
              value={newPassword}
              placeholder="Enter new password"
              onChange={(e) => setNewPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #ddd",
                borderRadius: "8px",
                fontSize: "16px",
                marginBottom: "20px"
              }}
              required
            />
            <input
              type="password"
              value={confirmPassword}
              placeholder="Confirm new password"
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #ddd",
                borderRadius: "8px",
                fontSize: "16px",
                marginBottom: "20px"
              }}
              required
            />
            <button
              onClick={handleVerifyTempPassword}
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
              {loading ? "Processing..." : "Submit New Password"}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
