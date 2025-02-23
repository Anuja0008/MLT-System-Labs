import React, { useState } from "react";

const Chatbot = () => {
  const [messages, setMessages] = useState([{ sender: "bot", text: "Welcome! How can I assist you?" }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Send a message to the OpenAI API and handle the response
  const sendMessage = async () => {
    if (input.trim() === "") return;

    // Append user message to the messages array
    const userMessage = { sender: "user", text: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    // Log to check what we're sending to the API
    console.log("Sending message:", input);
    console.log("Updated message history:", updatedMessages);

    try {
      // Call OpenAI API directly
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": ``, // Replace with your OpenAI API key
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo", // Or GPT-4, depending on your needs
          messages: updatedMessages.map((msg) => ({
            role: msg.sender === "user" ? "user" : "assistant",
            content: msg.text,
          })),
        }),
      });

      // Check for successful response
      if (!response.ok) {
        console.error("API Error:", response.statusText);
        alert(`API Error: ${response.statusText}`); // Alert the user of the error
        return;
      }

      const data = await response.json();
      console.log("API Response Data:", data); // Log the full response for debugging

      // Extract the AI's response
      const aiMessage = { sender: "bot", text: data.choices[0]?.message?.content || "I'm not sure how to respond." };

      // Append the AI's response to the messages array
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error fetching AI response:", error);
      alert(`Error: ${error.message}`); // Alert the user of the error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-80 p-4 border rounded-lg shadow-lg flex flex-col">
      <h2 className="text-lg font-bold mb-2">Chatbot</h2>

      {/* Chat Messages */}
      <div className="bg-gray-100 p-2 rounded-lg min-h-40 overflow-y-auto flex-grow">
        {messages.map((msg, index) => (
          <div key={index} className={`p-2 rounded mb-1 ${msg.sender === "user" ? "bg-blue-300 text-right" : "bg-green-300 text-left"}`}>
            {msg.text}
          </div>
        ))}
      </div>

      {/* Input Field */}
      <div className="mt-2 flex">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-grow border p-2 rounded-l"
          placeholder="Type a message..."
        />
        <button
          onClick={sendMessage}
          className="bg-blue-500 text-white p-2 rounded-r"
          disabled={loading}
        >
          {loading ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
