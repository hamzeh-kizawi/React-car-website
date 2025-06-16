import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import Cookies from "js-cookie";
import "../css/Chatbot.css";
import { useAuth } from "../contexts/AuthContext";

const Chatbot = ({ onShowRecommendations }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [showTeaser, setShowTeaser] = useState(false);
    const [showWarning, setShowWarning] = useState(false);
    const [messages, setMessages] = useState([
        { text: "Hi there! Welcome to SpeedAI 🚗. How can I help you?", sender: "bot" }
    ]);
    const [userInput, setUserInput] = useState("");
    const [isThinking, setIsThinking] = useState(false);
    const [lastSuggestedCars, setLastSuggestedCars] = useState([]);
    const [carInventory, setCarInventory] = useState([]);

    const csrfToken = Cookies.get("csrf_access_token");

    const inputRef = useRef(null);
    const bottomRef = useRef(null);
    const { user } = useAuth();

    useEffect(() => {
        fetch("http://localhost:5000/cars")
            .then(res => res.json())
            .then(data => {
                const names = data.map(car => `${car.brand} ${car.name}`.trim());
                setCarInventory(names);
            })
            .catch(console.error);
    }, []);

    // manages the teaser message
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

    // automatically scrolls the message window to the bottom
    useEffect(() => {
        if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }, [messages, isThinking]);

    // it toggles the chatbot window open or closed
    const toggleChatbot = () => {
        // If there's no user show a warning instead of opening the chat
        if (!user) {
            setShowWarning(true);
            setTimeout(() => setShowWarning(false), 4000);
            return;
        }
        setIsOpen(!isOpen);
        setShowTeaser(false); // hide the teaser when chat is open manually
    };

    // to extract car names from the bot's response text
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

        if (!user) {
            setMessages(prev => [
                ...prev,
                { text: "❌ You must be logged in or a guest to use the chatbot", sender: "bot" }
            ]);
            return;
        }

        // add the user's message to the chat and clear the input field
        setMessages(prev => [...prev, { text: trimmedInput, sender: "user" }]);
        setUserInput("");

        // if the user types "yes", show the last recommended cars
        if (trimmedInput.toLowerCase() === "yes") {
            if (lastSuggestedCars.length > 0) {
                setMessages(prev => [...prev, { text: `Sure! Opening the search bar with those models now. 🚗`, sender: "bot" }]);
                onShowRecommendations?.(lastSuggestedCars);
                return;
            } else {
                setMessages(prev => [...prev, {
                    text: "Oops! I don't have any recent models saved to show. Could you repeat which type of car you're looking for? 😊",
                    sender: "bot"
                }]);
                return;
            }
        }

        setIsThinking(true);
        setLastSuggestedCars([]); // clear old suggestions

        try {
            const response = await fetch("http://localhost:5000/chatbot", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": csrfToken,
                },
                body: JSON.stringify({ query: trimmedInput })
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            setMessages(prev => [...prev, { text: "", sender: "bot" }]);
            
            // to handle the streamed response from the backend for a real time typing effect
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullBotResponse = "";
            let thinkingStateUpdated = false; 

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                if (!thinkingStateUpdated) {
                    setIsThinking(false);
                    thinkingStateUpdated = true;
                }

                 // decode the chunk of data and process it line by line
                const chunk = decoder.decode(value);
                const lines = chunk.split('\n').filter(line => line.trim() !== '');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const jsonStr = line.substring(6);
                        if (jsonStr === '[DONE]') continue;

                        try {
                            const parsed = JSON.parse(jsonStr);
                            const content = parsed.choices[0]?.delta?.content || "";
                            
                            if (content) {
                                fullBotResponse += content;
                                setMessages(prev => {
                                    const newMessages = [...prev];
                                    newMessages[newMessages.length - 1].text += content;
                                    return newMessages;
                                });
                            }
                        } catch (e) {
                            console.error("Error parsing stream chunk:", e);
                        }
                    }
                }
            }

            // after the full response receives check if it contains car recommendations
            const cars = extractCarNames(fullBotResponse);
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
            setMessages(prev => {
                const newMessages = [...prev];
                if (newMessages[newMessages.length - 1].text === "") {
                    newMessages[newMessages.length - 1].text = "We're having connection issues. Please try again shortly.";
                } else {
                    newMessages.push({ text: "We're having connection issues. Please try again shortly", sender: "bot" });
                }
                return newMessages;
            });
        } finally {
            if (isThinking) {
                 setIsThinking(false);
            }
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

            {showWarning && (
                <div className="chatbot-warning">
                    ❌ You need to log in to use the chatbot
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