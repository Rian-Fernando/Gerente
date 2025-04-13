import React, { useState, useEffect } from 'react';

const PomodoroTimer = ({ task, onClose }) => {
  const [secondsLeft, setSecondsLeft] = useState(1500); // 25 minutes
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive]);

  const formatTime = (secs) => {
    const minutes = Math.floor(secs / 60).toString().padStart(2, '0');
    const seconds = (secs % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  if (!task) return null;

  const progressPercent = ((1500 - secondsLeft) / 1500) * 100;

  return (
    <div style={{
      position: "fixed",
      top: "20%",
      left: "50%",
      transform: "translate(-50%, -20%)",
      background: "#fff",
      border: "2px solid #f39c12",
      borderRadius: "8px",
      padding: "20px",
      zIndex: 1000,
      boxShadow: "0px 4px 12px rgba(0,0,0,0.1)"
    }}>
      <h3>🍅 Pomodoro Mode</h3>
      <p><strong>Task:</strong> {task.text}</p>
      <h1 style={{ fontSize: "48px", margin: "20px 0" }}>{formatTime(secondsLeft)}</h1>
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
          backgroundColor: "#27ae60",
          transition: "width 0.3s ease"
        }} />
      </div>
      <button onClick={() => setIsActive(!isActive)} style={{
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
      }} style={{
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
      <button onClick={onClose} style={{
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
    </div>
  );
};

export default PomodoroTimer;
