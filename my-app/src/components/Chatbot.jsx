import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import "../css/Chatbot.css";

const Chatbot = ({ onShowRecommendations }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [showTeaser, setShowTeaser] = useState(false);
    const [messages, setMessages] = useState([
        { text: "Hi there! Welcome to SpeedAI 🚗. How can I help you?", sender: "bot" }
    ]);
    const [userInput, setUserInput] = useState("");
    const [isThinking, setIsThinking] = useState(false);
    const [lastSuggestedCars, setLastSuggestedCars] = useState([]);
    const [carInventory, setCarInventory] = useState([]);

    const inputRef = useRef(null);
    const bottomRef = useRef(null);

    useEffect(() => {
        fetch("http://localhost:5000/cars")
            .then(res => res.json())
            .then(data => {
                const names = data.map(car => `${car.brand} ${car.name}`.trim());
                setCarInventory(names);
            })
            .catch(console.error);
    }, []);

    useEffect(() => {
        const teaserTimer = setTimeout(() => setShowTeaser(true), 8000);
        const autoHideTimer = setTimeout(() => setShowTeaser(false), 16000);
        return () => {
            clearTimeout(teaserTimer);
            clearTimeout(autoHideTimer);
        };
    }, []);

    useEffect(() => {
        if (isOpen && inputRef.current) inputRef.current.focus();
    }, [isOpen]);

    useEffect(() => {
        if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }, [messages, isThinking]);

    const toggleChatbot = () => {
        setIsOpen(!isOpen);
        setShowTeaser(false);
    };

    const extractCarNames = (text) => {
        const boldRegex = /\*\*(.*?)\*\*/g;
        const matches = [...text.matchAll(boldRegex)];
    
        let extracted = matches.map(match => match[1].replace(/\s*\(\d{4}\)/, "").trim());
    
        if (extracted.length === 0 && carInventory.length > 0) {
            for (const name of carInventory) {
                if (text.includes(name)) {
                    extracted.push(name);
                }
            }
        }
    
        return extracted;
    };

    const sendMessage = async () => {
        const trimmedInput = userInput.trim();
        if (!trimmedInput || isThinking) return;
    
        setMessages(prev => [...prev, { text: trimmedInput, sender: "user" }]);
        setUserInput("");
    
        if (trimmedInput.toLowerCase() === "yes") {
            if (lastSuggestedCars.length > 0) {
                console.log("Opening search with saved suggestions:", lastSuggestedCars);
                setMessages(prev => [...prev, { text: `Sure! Opening the search bar with those models now. 🚗`, sender: "bot" }]);
                onShowRecommendations?.(lastSuggestedCars);
                return;
            } else {
                console.warn(" User said 'yes' but no car names were saved.");
                setMessages(prev => [...prev, {
                    text: "Oops! I don't have any recent models saved to show. Could you repeat which type of car you're looking for? 😊",
                    sender: "bot"
                }]);
                return;
            }
        }
    
        setIsThinking(true);
        setLastSuggestedCars([]);
    
        try {
            const response = await fetch("http://localhost:5000/chatbot", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: trimmedInput })
            });
    
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
            const data = await response.json();
            const botResponse = data.response;
    
            setMessages(prev => [...prev, { text: botResponse, sender: "bot" }]);
    
            const cars = extractCarNames(botResponse);
            console.log("🚗 Extracted car names:", cars);
    
            if (cars.length >= 2) {
                setLastSuggestedCars(cars);
    
                setMessages(prev => [
                    ...prev,
                    {
                        text: `Would you like me to open the search bar and show full details for these models? Just reply with "yes"! 😊`,
                        sender: "bot"
                    }
                ]);
            }
        } catch (err) {
            console.error("Chatbot error:", err);
            setMessages(prev => [
                ...prev,
                {
                    text: "We're having connection issues. Please try again shortly.",
                    sender: "bot"
                }
            ]);
        } finally {
            setIsThinking(false);
            setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
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
