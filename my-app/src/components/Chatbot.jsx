import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import "../css/Chatbot.css";

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [showTeaser, setShowTeaser] = useState(false);
    const [messages, setMessages] = useState([
        { text: "Hi there! Welcome to SpeedAI 🚗. How can I help you?", sender: "bot" }
    ]);
    const [userInput, setUserInput] = useState("");
    const [isThinking, setIsThinking] = useState(false);

    const inputRef = useRef(null);
    const bottomRef = useRef(null);

    useEffect(() => {
        const teaserTimer = setTimeout(() => {
            setShowTeaser(true);
        }, 8000);
        const autoHideTimer = setTimeout(() => {
            setShowTeaser(false);
        }, 16000);
        return () => {
            clearTimeout(teaserTimer);
            clearTimeout(autoHideTimer);
        };
    }, []);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isThinking]);

    const toggleChatbot = () => {
        setIsOpen(!isOpen);
        setShowTeaser(false);
    };

    const sendMessage = async () => {
        const trimmedInput = userInput.trim();
        if (!trimmedInput || isThinking) return;

        setUserInput("");
        setMessages(prev => [...prev, { text: trimmedInput, sender: "user" }]);
        setIsThinking(true);

        try {
            const response = await fetch("http://localhost:5000/chatbot", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: trimmedInput })
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const data = await response.json();
            setMessages(prev => [...prev, { text: data.response, sender: "bot" }]);
        } catch (error) {
            console.error("Chatbot error:", error);
            setMessages(prev => [...prev, {
                text: "We're having connection issues. Please try again shortly.",
                sender: "bot"
            }]);
        } finally {
            setIsThinking(false);
            setTimeout(() => {
                if (bottomRef.current) {
                    bottomRef.current.scrollIntoView({ behavior: "smooth" });
                }
            }, 100);
        }
    };

    return (
        <>
            {showTeaser && !isOpen && (
                <div className="chatbot-teaser">
                    👋 Hello there! I'm your SpeedAI Assistant. How can I help you today?
                </div>
            )}

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
                            <ReactMarkdown>{msg.text}</ReactMarkdown>
                            </div>
                        ))}
                        {isThinking && (
                            <div className="message bot typing-indicator">
                                Thinking
                                <span className="dot">.</span>
                                <span className="dot">.</span>
                                <span className="dot">.</span>
                            </div>
                        )}
                        <div ref={bottomRef}></div>
                    </div>
                    <div className="chatbot-input">
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder={isThinking ? "Please wait..." : "Ask me anything about cars..."}
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                            disabled={isThinking}
                        />
                        <button onClick={sendMessage} disabled={isThinking}>➔</button>
                    </div>
                </div>
            )}
        </>
    );
};

export default Chatbot;
