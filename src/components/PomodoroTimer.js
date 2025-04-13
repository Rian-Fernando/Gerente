import React, { useState, useEffect } from 'react';

const PomodoroTimer = ({ task, onClose }) => {
  if (!task) return null;

  const [secondsLeft, setSecondsLeft] = useState(1500); // 25 minutes

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs) => {
    const minutes = Math.floor(secs / 60).toString().padStart(2, '0');
    const seconds = (secs % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

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
