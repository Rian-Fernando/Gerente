import React, { useState, useEffect, useRef, useCallback } from 'react';
import './PomodoroTimer.css';

const DEFAULT_WORK_MIN = 25;
const DEFAULT_BREAK_MIN = 5;
const ALERT_SRC = 'https://www.soundjay.com/buttons/sounds/beep-07.mp3';

const formatTime = (secs) => {
  const minutes = Math.floor(secs / 60).toString().padStart(2, '0');
  const seconds = (secs % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
};

const PomodoroTimer = ({ task, onClose, onComplete }) => {
  const [workMin, setWorkMin] = useState(DEFAULT_WORK_MIN);
  const [breakMin, setBreakMin] = useState(DEFAULT_BREAK_MIN);
  const [mode, setMode] = useState('work');
  const [secondsLeft, setSecondsLeft] = useState(DEFAULT_WORK_MIN * 60);
  const [isActive, setIsActive] = useState(false);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);
  const [muted, setMuted] = useState(false);
  const alertRef = useRef(null);

  if (!alertRef.current) {
    alertRef.current = new Audio(ALERT_SRC);
  }

  const totalSeconds = (mode === 'work' ? workMin : breakMin) * 60;

  useEffect(() => {
    setSecondsLeft((mode === 'work' ? workMin : breakMin) * 60);
  }, [mode, workMin, breakMin]);

  useEffect(() => {
    if (!isActive) return;
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          if (!muted) {
            alertRef.current?.play().catch(() => {});
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isActive, muted]);

  useEffect(() => {
    if (secondsLeft !== 0 || !isActive) return;
    setIsActive(false);
    if (mode === 'work') {
      setCyclesCompleted((c) => c + 1);
      onComplete?.(task);
      setMode('break');
    } else {
      setMode('work');
    }
  }, [secondsLeft, isActive, mode, task, onComplete]);

  useEffect(() => {
    if (!task) return;
    document.title = `${formatTime(secondsLeft)} • ${task.text}`;
    return () => {
      document.title = 'Gerente - Task Manager App';
    };
  }, [secondsLeft, task]);

  const handleClose = useCallback(() => {
    setIsActive(false);
    onClose?.();
  }, [onClose]);

  useEffect(() => {
    if (!task) return;
    const handler = (e) => {
      if (e.key === 'Escape') handleClose();
      else if (e.key === ' ' && e.target === document.body) {
        e.preventDefault();
        setIsActive((a) => !a);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [task, handleClose]);

  if (!task) return null;

  const progressPercent = ((totalSeconds - secondsLeft) / totalSeconds) * 100;
  const percentDisplay = Math.round(progressPercent);
  const barColor = progressPercent < 50 ? '#f39c12' : progressPercent < 90 ? '#f1c40f' : '#2ecc71';

  return (
    <>
      <div className="pomodoro-backdrop" onClick={handleClose} />
      <div
        className={`pomodoro-dialog ${mode === 'break' ? 'break-mode' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Pomodoro Timer"
      >
        <h3>
          {mode === 'work' ? '🍅 Focus Mode' : '☕ Break Time'}
        </h3>
        <p className="pomodoro-task">
          <strong>Task:</strong> {task.text}
        </p>

        <h1
          className="pomodoro-clock"
          aria-live="polite"
          aria-label={`Time left: ${formatTime(secondsLeft)}`}
        >
          {formatTime(secondsLeft)}
        </h1>

        <div className="pomodoro-progress-text">Progress: {percentDisplay}%</div>

        {secondsLeft === 0 && (
          <div className="pomodoro-complete">
            {mode === 'work'
              ? '✅ Session complete! Time for a break ☕'
              : '✅ Break finished! Ready for another focus session?'}
          </div>
        )}

        <div className="pomodoro-bar">
          <div
            className="pomodoro-bar-fill"
            style={{ width: `${progressPercent}%`, backgroundColor: barColor }}
          />
        </div>

        <div className="pomodoro-controls">
          <button
            type="button"
            onClick={() => setIsActive((a) => !a)}
            className={`pomodoro-btn-primary ${isActive ? 'active' : ''}`}
            aria-label={isActive ? 'Pause timer' : 'Start timer'}
          >
            {isActive ? 'Pause' : 'Start'}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsActive(false);
              setSecondsLeft(totalSeconds);
            }}
            className="pomodoro-btn-secondary"
            aria-label="Reset timer"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={() => setMuted((m) => !m)}
            className="pomodoro-btn-secondary"
            aria-label={muted ? 'Unmute alerts' : 'Mute alerts'}
          >
            {muted ? '🔇 Muted' : '🔔 Sound'}
          </button>
          <button
            type="button"
            onClick={handleClose}
            className="pomodoro-btn-close"
            aria-label="Close Pomodoro Timer"
          >
            Close
          </button>
        </div>

        <div className="pomodoro-settings">
          <label>
            Focus (min)
            <input
              type="number"
              min="1"
              max="90"
              value={workMin}
              onChange={(e) => setWorkMin(Math.max(1, Number(e.target.value) || 1))}
              disabled={isActive}
            />
          </label>
          <label>
            Break (min)
            <input
              type="number"
              min="1"
              max="60"
              value={breakMin}
              onChange={(e) => setBreakMin(Math.max(1, Number(e.target.value) || 1))}
              disabled={isActive}
            />
          </label>
          <div className="pomodoro-cycles">
            Cycles today: <strong>{cyclesCompleted}</strong>
          </div>
        </div>

        <p className="pomodoro-hint">
          Tip: Press <strong>Space</strong> to pause/start, <strong>Esc</strong> to close.
        </p>
      </div>
    </>
  );
};

export default PomodoroTimer;
