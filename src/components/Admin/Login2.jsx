import React, { useState } from "react";
import { Form, Input, Button, Typography, message } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase/db";
import bgImage from "../../Photos/doc.jpg";

const { Title } = Typography;

message.config({ top: 100, duration: 3, maxCount: 3 });

const Login2 = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const { username, password } = values;

      const adminRef = collection(db, "Admin");
      const q = query(adminRef, where("Username", "==", username.trim()));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        message.error("Invalid username or password");
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
        // Save admin info in localStorage
        localStorage.setItem("user", JSON.stringify({ username }));
        message.success("Login successful!");
        navigate("/admin"); // go to admin dashboard
      } else {
        message.error("Invalid username or password");
      }
    } catch (err) {
      console.error("Login error:", err);
      message.error("Something went wrong. Try again!");
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
            <Input prefix={<UserOutlined />} placeholder="Username" size="large" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Password" size="large" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={loading}
              style={{ background: "linear-gradient(135deg, #53d726, #096dd9)", border: "none", fontWeight: "bold" }}
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
