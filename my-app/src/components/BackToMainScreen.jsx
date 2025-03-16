import React from "react";
import { TiArrowBackOutline } from "react-icons/ti";
import { useNavigate } from "react-router-dom";
import "../css/BackToMainScreen.css";

function BackToMainScreen() {
  const navigate = useNavigate();

  return (
    <div
      className="back-to-main-screen"
      onClick={() => navigate("/")}
      title="Go Back to the Main screen"
    >
      <TiArrowBackOutline className="back-icon" />
      <span className="back-text">Back to SpeedAI</span>
    </div>
  );
}

export default BackToMainScreen;