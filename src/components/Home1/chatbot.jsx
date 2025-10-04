import React, { useState } from "react";
import { FaPaperPlane, FaCommentDots, FaUser, FaRobot } from "react-icons/fa";

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { 
      sender: "bot", 
      text: "Welcome! How can I assist you with lab-related questions today?" 
    }
  ]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (messageText) => {
    if (messageText.trim() === "") return;

    const userMessage = { sender: "user", text: messageText };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:5000/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageText }),
      });

      const data = await res.json();
      const botMessage = { 
        sender: "bot", 
        text: data.reply || "No response from server" 
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const botMessage = { 
        sender: "bot", 
        text: "⚠️ Error: Could not connect to server. Please check if the backend is running." 
      };
      setMessages((prev) => [...prev, botMessage]);
    } finally {
      setLoading(false);
    }
  };

  // Format bot messages for better readability
  const formatMessage = (text) => {
    return text.split('\n').map((line, index) => (
      <div key={index}>
        {line}
        {index < text.split('\n').length - 1 && <br />}
      </div>
    ));
  };

  return (
    <>
      {/* Floating Chat Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="chatbot-toggle-btn"
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          background: "#2563eb",
          color: "white",
          border: "none",
          width: "50px",
          height: "50px",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.3)",
          fontSize: "24px",
          zIndex: 1001,
          transition: "all 0.3s ease",
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = "scale(1.1)";
          e.target.style.background = "#1d4ed8";
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = "scale(1)";
          e.target.style.background = "#2563eb";
        }}
      >
        <FaCommentDots />
      </button>

      {/* Chatbot Popup */}
      {isOpen && (
        <div
          className="chatbot-container"
          style={{
            position: "fixed",
            bottom: "90px",
            right: "20px",
            width: "350px",
            height: "500px",
            borderRadius: "16px",
            boxShadow: "0px 8px 25px rgba(0, 0, 0, 0.15)",
            background: "white",
            display: "flex",
            flexDirection: "column",
            fontFamily: "Poppins, sans-serif",
            zIndex: 1000,
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
              color: "white",
              padding: "15px",
              fontSize: "18px",
              fontWeight: "bold",
              textAlign: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
            }}
          >
            <FaRobot />
            Lab Assistant Chatbot
          </div>

          {/* Chat Messages */}
          <div
            style={{
              flex: 1,
              padding: "15px",
              background: "#f8fafc",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "8px",
                  flexDirection: msg.sender === "user" ? "row-reverse" : "row",
                }}
              >
                {/* Avatar */}
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: msg.sender === "user" ? "#2563eb" : "#10b981",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: "14px",
                    flexShrink: 0,
                  }}
                >
                  {msg.sender === "user" ? <FaUser /> : <FaRobot />}
                </div>

                {/* Message Bubble */}
                <div
                  style={{
                    maxWidth: "55%",
                    padding: "12px 16px",
                    borderRadius: "18px",
                    background: msg.sender === "user" ? "#2563eb" : "white",
                    color: msg.sender === "user" ? "white" : "#1f2937",
                    border: msg.sender === "bot" ? "1px solid #e5e7eb" : "none",
                    boxShadow: msg.sender === "bot" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                    wordWrap: "break-word",
                    fontSize: "14px",
                    lineHeight: "1.5",
                  }}
                >
                  <div style={{ fontWeight: msg.sender === "bot" ? "600" : "400" }}>
                    {formatMessage(msg.text)}
                  </div>
                  <div
                    style={{
                      fontSize: "10px",
                      opacity: 0.7,
                      marginTop: "4px",
                      textAlign: msg.sender === "user" ? "right" : "left",
                    }}
                  >
                    {msg.sender === "user" ? "You" : "Assistant"}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "8px",
                }}
              >
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: "#10b981",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: "14px",
                  }}
                >
                  <FaRobot />
                </div>
                <div
                  style={{
                    padding: "12px 16px",
                    borderRadius: "18px",
                    background: "white",
                    border: "1px solid #e5e7eb",
                    color: "#6b7280",
                    fontStyle: "italic",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div className="typing-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                    Thinking...
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div style={{ 
            padding: "15px", 
            borderTop: "1px solid #e5e7eb",
            background: "white" 
          }}>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                style={{
                  flex: 1,
                  padding: "12px",
                  border: "2px solid #e5e7eb",
                  borderRadius: "25px",
                  outline: "none",
                  fontSize: "14px",
                  transition: "border-color 0.3s",
                }}
                placeholder="Ask about lab equipment, procedures, or safety..."
                onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
                onFocus={(e) => {
                  e.target.style.borderColor = "#2563eb";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e5e7eb";
                }}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={loading}
                style={{
                  background: "#2563eb",
                  color: "white",
                  border: "none",
                  width: "44px",
                  height: "44px",
                  borderRadius: "50%",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.3s ease",
                  opacity: loading ? 0.6 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.target.style.background = "#1d4ed8";
                    e.target.style.transform = "scale(1.05)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.target.style.background = "#2563eb";
                    e.target.style.transform = "scale(1)";
                  }
                }}
              >
                <FaPaperPlane />
              </button>
            </div>
          </div>

          {/* Add some CSS for typing animation */}
          <style jsx>{`
            .typing-dots {
              display: inline-flex;
              gap: 3px;
            }
            .typing-dots span {
              width: 6px;
              height: 6px;
              border-radius: 50%;
              background: #9ca3af;
              animation: typing 1.4s infinite ease-in-out;
            }
            .typing-dots span:nth-child(1) { animation-delay: -0.32s; }
            .typing-dots span:nth-child(2) { animation-delay: -0.16s; }
            @keyframes typing {
              0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
              40% { transform: scale(1); opacity: 1; }
            }
          `}</style>
        </div>
      )}
    </>
  );
};

export default Chatbot;