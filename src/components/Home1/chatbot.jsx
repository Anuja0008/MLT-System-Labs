import React, { useState } from "react";
import { FaPaperPlane, FaCommentDots } from "react-icons/fa";

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Welcome! How can I assist you?" }
  ]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false); // Toggle chatbot

  // Predefined questions
  const predefinedQuestions = [
    "What are the lab hours?",
    "What equipment do you have?",
    "Hello",
    "Thank you",
    "Goodbye"
  ];

  // Function to handle user messages
  const sendMessage = (messageText) => {
    if (messageText.trim() === "") return;

    const userMessage = { sender: "user", text: messageText };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput("");

    // Define basic responses
    const responses = {
      hello: [
        "Hi there! How can I assist you today?",
        "Hey! How can I help?",
        "Hello! Need anything? I'm here to assist.",
        "Hi! How can I make your day easier?"
      ],
      "lab hours": [
        "The lab is open from 8 AM to 8 PM every day.",
        "Lab hours are from 8 AM until 8 PM.",
        "We are available from 8 AM to 8 PM. Feel free to drop by!",
        "You can visit the lab from 8 AM to 8 PM."
      ],
      "What equipment do you have?": [
        "We have microscopes, centrifuges, and spectrometers available for use.",
       
      ],
      "thank you": [
        "You're welcome! Let me know if you need anything else.",
        "Anytime! I'm here if you need more help.",
        "Glad I could help! Feel free to ask if you need more info.",
        "You're welcome! Have a great day ahead!"
      ],
      goodbye: [
        "Goodbye! Have a wonderful day!",
        "See you later! Don't hesitate to ask if you need more help.",
        "Take care! Hope to chat again soon.",
        "Goodbye! Stay safe and have a great day!"
      ],
      default: [
        "Sorry, I didn't quite understand that. Can you rephrase?",
        "I'm not sure I got that. Could you ask something else?",
        "Hmm, I didn't catch that. Could you try again?",
        "Sorry about that! Could you rephrase your question?"
      ]
    };

    // Basic matching logic to handle responses
    let responseText = "I'm not sure about that. Please ask something else.";

    // Check for matching responses
    for (let key in responses) {
      if (messageText.toLowerCase().includes(key.toLowerCase())) {
        responseText = responses[key][Math.floor(Math.random() * responses[key].length)];
        break;
      }
    }

    const botMessage = { sender: "bot", text: responseText };

    setMessages((prevMessages) => [...prevMessages, botMessage]);
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

          {/* Predefined Questions */}
          <div
            style={{
              background: "#f8f9fa",
              padding: "10px",
              fontSize: "14px",
              borderBottom: "2px solid #ddd",
            }}
          >
            {predefinedQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => sendMessage(question)}
                style={{
                  display: "block",
                  background: "#2563eb",
                  color: "white",
                  border: "none",
                  padding: "8px 12px",
                  marginBottom: "8px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  width: "100%",
                  textAlign: "left",
                }}
              >
                {question}
              </button>
            ))}
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
