import React, { useState } from "react";
import { FaPaperPlane, FaCommentDots } from "react-icons/fa";

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Welcome! How can I assist you?" }
  ]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Send message to backend (Gemini AI)
  const sendMessage = async (messageText) => {
    if (messageText.trim() === "") return;

    const userMessage = { sender: "user", text: messageText };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageText }),
      });

      const data = await res.json();
      const botMessage = { sender: "bot", text: data.reply };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const botMessage = { sender: "bot", text: "⚠️ Error: Could not connect to server." };
      setMessages((prev) => [...prev, botMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Chat Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
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
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
          fontSize: "22px",
        }}
      >
        <FaCommentDots />
      </button>

      {/* Chatbot Popup */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: "80px",
            right: "20px",
            width: "300px",
            borderRadius: "12px",
            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.2)",
            background: "white",
            display: "flex",
            flexDirection: "column",
            fontFamily: "Poppins, sans-serif",
            zIndex: 1000,
          }}
        >
          {/* Header */}
          <div
            style={{
              background: "#2563eb",
              color: "white",
              padding: "10px",
              fontSize: "16px",
              fontWeight: "bold",
              textAlign: "center",
              borderTopLeftRadius: "12px",
              borderTopRightRadius: "12px",
            }}
          >
            Lab Assistant Chatbot
          </div>

          {/* Chat Messages */}
          <div
            style={{
              background: "#f8f9fa",
              padding: "12px",
              borderRadius: "10px",
              minHeight: "250px",
              maxHeight: "300px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  padding: "10px 14px",
                  borderRadius: "18px",
                  maxWidth: "75%",
                  wordWrap: "break-word",
                  fontSize: "14px",
                  lineHeight: "1.5",
                  alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                  background: msg.sender === "user" ? "#2563eb" : "#10b981",
                  color: "white",
                }}
              >
                {msg.text}
              </div>
            ))}

            {loading && (
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: "18px",
                  maxWidth: "75%",
                  background: "#10b981",
                  color: "white",
                  alignSelf: "flex-start",
                  fontSize: "14px",
                }}
              >
                Typing...
              </div>
            )}
          </div>

          {/* Input & Send Button */}
          <div style={{ display: "flex", padding: "10px", gap: "6px" }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              style={{
                flexGrow: 1,
                padding: "10px",
                border: "2px solid #ddd",
                borderRadius: "8px",
                outline: "none",
                fontSize: "14px",
              }}
              placeholder="Ask about the lab..."
              onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
            />
            <button
              onClick={() => sendMessage(input)}
              style={{
                background: "#2563eb",
                color: "white",
                border: "none",
                padding: "10px 14px",
                borderRadius: "8px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FaPaperPlane />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
