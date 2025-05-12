import React, { useState } from "react";
import "../css/Chatbot.css";

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: "Hi there! Welcome to SpeedAI 🚗. How can I help you?", sender: "bot" }
    ]);
    const [userInput, setUserInput] = useState("");

    const toggleChatbot = () => setIsOpen(!isOpen);

    const sendMessage = async () => {
        const trimmedInput = userInput.trim();
        if (!trimmedInput) return;

        setUserInput("");
        setMessages(prev => [...prev, { text: trimmedInput, sender: "user" }]);

        try {
            const response = await fetch("http://localhost:5000/chatbot", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: trimmedInput })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setMessages(prev => [...prev, { text: data.response, sender: "bot" }]);
            
        } catch (error) {
            console.error("Chatbot error:", error);
            setMessages(prev => [...prev, {
                text: "We're having connection issues. Please try again shortly.",
                sender: "bot"
            }]);
        }
    };

    return (
        <>
            <div className="chatbot-icon" onClick={toggleChatbot}>
                <img src="chatbot.png" alt="Chatbot Icon" />
                {messages.length > 1 && <span className="notification-badge">1</span>}
            </div>

            {isOpen && (
                <div className="chatbot-container">
                    <div className="chatbot-header">
                        SpeedAI Assistant
                        <button className="close-btn" onClick={toggleChatbot}>✖</button>
                    </div>
                    <div className="chatbot-messages">
                        {messages.map((msg, index) => (
                            <div key={index} className={`message ${msg.sender}`}>
                                {msg.text}
                            </div>
                        ))}
                    </div>
                    <div className="chatbot-input">
                        <input
                            type="text"
                            placeholder="Ask me anything about cars..."
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                        />
                        <button onClick={sendMessage}>➔</button>
                    </div>
                </div>
            )}
        </>
    );
};

export default Chatbot;
