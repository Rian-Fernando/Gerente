import React, { useState, useEffect } from 'react';

const PomodoroTimer = ({ task, onClose }) => {
  const alertSound = new Audio("https://www.soundjay.com/buttons/sounds/beep-07.mp3");
  const [secondsLeft, setSecondsLeft] = useState(1500); // 25 minutes
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev === 1) {
          alertSound.play();
        }
        return prev > 0 ? prev - 1 : 0;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive]);

  const formatTime = (secs) => {
    const minutes = Math.floor(secs / 60).toString().padStart(2, '0');
    const seconds = (secs % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  useEffect(() => {
    if (task) {
      document.title = `${formatTime(secondsLeft)} • ${task.text}`;
    }

    return () => {
      document.title = "Gerente - Task Manager App";
    };
  }, [secondsLeft, task]);

  if (!task) return null;

  const progressPercent = ((1500 - secondsLeft) / 1500) * 100;
  const percentDisplay = Math.round(progressPercent);

  return (
    <div style={{
      position: "fixed",
      top: "20%",
      left: "50%",
      transform: "translate(-50%, -20%)",
      background: "#fff",
      border: "2px solid #f39c12",
      borderRadius: "8px",
      padding: "24px",
      zIndex: 1000,
      boxShadow: "0px 4px 12px rgba(0,0,0,0.1)",
      transition: "transform 0.3s ease, opacity 0.3s ease",
      opacity: 0.98,
      border: "1px solid #e0e0e0"
    }}>
      <h3>🍅 Pomodoro Focus Mode</h3>
      <p><strong>Task:</strong> {task.text}</p>
      
      // --- Timer Display ---
      <h1
        style={{ fontSize: "48px", margin: "20px 0" }}
        aria-live="polite"
        aria-label={`Time left: ${formatTime(secondsLeft)}`}
      >
        {formatTime(secondsLeft)}
      </h1>
      
      // --- Progress Bar ---
      <div style={{
        marginBottom: "10px",
        fontSize: "14px",
        fontWeight: "bold",
        color: "#555",
        textAlign: "center"
      }}>
        Progress: {percentDisplay}%
      </div>
      {secondsLeft === 0 && (
        // --- Completion Badge ---
        <div style={{
          backgroundColor: "#2ecc71",
          color: "#fff",
          padding: "10px",
          borderRadius: "6px",
          fontWeight: "bold",
          marginBottom: "10px",
          textAlign: "center",
          boxShadow: "0px 2px 6px rgba(0,0,0,0.1)"
        }}>
          ✅ Pomodoro complete! Take a short break ☕
        </div>
      )}
      
      // --- Progress Bar ---
      <div style={{
        height: "10px",
        width: "100%",
        backgroundColor: "#eee",
        borderRadius: "5px",
        overflow: "hidden",
        marginBottom: "12px"
      }}>
        <div style={{
          height: "100%",
          width: `${progressPercent}%`,
          backgroundColor: progressPercent < 50 ? "#f39c12" : progressPercent < 90 ? "#f1c40f" : "#2ecc71",
          transition: "width 0.3s ease"
        }} />
      </div>
      
      // --- Control Buttons ---
      <button onClick={() => setIsActive(!isActive)} aria-label={isActive ? "Pause Pomodoro" : "Start Pomodoro"} style={{
        background: isActive ? "#e74c3c" : "#2ecc71",
        border: "none",
        padding: "8px 16px",
        color: "#fff",
        fontWeight: "bold",
        borderRadius: "4px",
        cursor: "pointer",
        marginRight: "10px"
      }}>
        {isActive ? "Pause" : "Start"}
      </button>
      <button onClick={() => {
        setSecondsLeft(1500);
        setIsActive(false);
      }} aria-label="Reset Pomodoro" style={{
        background: "#3498db",
        border: "none",
        padding: "8px 16px",
        color: "#fff",
        fontWeight: "bold",
        borderRadius: "4px",
        cursor: "pointer",
        marginRight: "10px"
      }}>
        Reset
      </button>
      <button onClick={onClose} aria-label="Close Pomodoro Timer" style={{
        background: "#f39c12",
        border: "none",
        padding: "8px 16px",
        color: "#fff",
        fontWeight: "bold",
        borderRadius: "4px",
        cursor: "pointer"
      }}>
        Close
      </button>
      <p style={{
        fontSize: "12px",
        color: "#888",
        marginTop: "12px",
        textAlign: "center"
      }}>
        Tip: Press <strong>Esc</strong> to quickly close Pomodoro.
      </p>
    </div>
  );
};

export default PomodoroTimer;
