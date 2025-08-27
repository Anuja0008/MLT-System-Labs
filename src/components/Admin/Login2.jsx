import React, { useState } from "react";
import { Form, Input, Button, Typography, Alert } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase/db";
import bgImage from "../../Photos/doc.jpg";

const { Title } = Typography;

const Login2 = () => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(""); // ✅ track error message
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    setErrorMsg(""); // reset old errors
    try {
      const { username, password } = values;

      const adminRef = collection(db, "Admin");
      const q = query(adminRef, where("Username", "==", username.trim()));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setErrorMsg("Login Failed"); // show under form
        setLoading(false);
        return;
      }

      let loginSuccess = false;
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.password?.trim() === password.trim()) {
          loginSuccess = true;
        }
      });

      if (loginSuccess) {
        localStorage.setItem("user", JSON.stringify({ username }));
        setErrorMsg(""); // clear error if success
        navigate("/admin");
      } else {
        setErrorMsg("Login Failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      setErrorMsg("Something went wrong. Try again!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          padding: "40px",
          borderRadius: "12px",
          boxShadow: "0px 8px 25px rgba(0,0,0,0.15)",
          maxWidth: "400px",
          width: "100%",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <Title level={3} style={{ margin: 0, color: "#096dd9" }}>
            Ariana Labs
          </Title>
          <p style={{ color: "#666", marginBottom: "20px" }}>Admin Login</p>
        </div>

        <Form name="adminLogin" onFinish={onFinish} layout="vertical">
          <Form.Item
            name="username"
            rules={[{ required: true, message: "Please input your username!" }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Username"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: "Please input your password!" },
              { min: 6, message: "Password must be at least 6 characters!" },
              { max: 16, message: "Password cannot be longer than 16 characters!" },
              {
                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
                message:
                  "Password must include uppercase, lowercase, and a number!",
              },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
              size="large"
              maxLength={16}
            />
          </Form.Item>

          {/* ✅ Show error message below fields */}
          {errorMsg && (
            <Alert
              message={errorMsg}
              type="error"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={loading}
              style={{
                background: "linear-gradient(135deg, #53d726, #096dd9)",
                border: "none",
                fontWeight: "bold",
              }}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default Login2;
