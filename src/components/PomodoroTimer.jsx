import React, { useState, useEffect, useRef, useCallback } from 'react';
import './PomodoroTimer.css';

const DEFAULT_WORK_MIN = 25;
const DEFAULT_BREAK_MIN = 5;

const formatTime = (secs) => {
  const minutes = Math.floor(secs / 60).toString().padStart(2, '0');
  const seconds = (secs % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
};

/**
 * Focus timer for a single task.
 *
 * Timing is deadline-based rather than a per-second counter: browsers throttle
 * setInterval to roughly once a minute in a background tab, so counting down by
 * one each tick loses minutes over a 25-minute session — exactly the case this
 * feature exists for. Instead we store the wall-clock instant the session ends
 * and derive the remaining time from it, which stays correct no matter how
 * often the callback actually runs.
 */
const PomodoroTimer = ({ task, onClose, onComplete }) => {
  const [workMin, setWorkMin] = useState(DEFAULT_WORK_MIN);
  const [breakMin, setBreakMin] = useState(DEFAULT_BREAK_MIN);
  const [mode, setMode] = useState('work');
  const [secondsLeft, setSecondsLeft] = useState(DEFAULT_WORK_MIN * 60);
  const [isActive, setIsActive] = useState(false);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);
  const [muted, setMuted] = useState(false);
  const [announcement, setAnnouncement] = useState('');

  const endsAtRef = useRef(null);
  const audioCtxRef = useRef(null);
  const dialogRef = useRef(null);
  const restoreFocusRef = useRef(null);
  const taskId = task?.id ?? null;

  const totalSeconds = (mode === 'work' ? workMin : breakMin) * 60;

  /**
   * A short two-pip chime synthesised locally. The previous implementation
   * streamed an MP3 from a third-party host, which fails in exactly the
   * situation this app is built for — offline.
   */
  const playChime = useCallback(() => {
    if (muted) return;
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      const ctx = audioCtxRef.current || (audioCtxRef.current = new Ctx());
      if (ctx.state === 'suspended') ctx.resume();
      const now = ctx.currentTime;
      [0, 0.26].forEach((offset) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = 880;
        gain.gain.setValueAtTime(0.0001, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.22, now + offset + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.2);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now + offset);
        osc.stop(now + offset + 0.22);
      });
    } catch {
      // Audio is a nicety; never let it break the timer.
    }
  }, [muted]);

  // A new task means a fresh focus session. Without this the dialog reopened
  // holding the previous task's leftovers — often mid-break, with its clock
  // still running down.
  useEffect(() => {
    if (!taskId) return;
    setMode('work');
    setIsActive(false);
    setSecondsLeft(workMin * 60);
    setAnnouncement('');
    endsAtRef.current = null;
    // Intentionally keyed on the task only: changing the focus length mid-task
    // is handled by the effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId]);

  // Changing mode or a duration resets the clock for that phase.
  useEffect(() => {
    setIsActive(false);
    endsAtRef.current = null;
    setSecondsLeft((mode === 'work' ? workMin : breakMin) * 60);
  }, [mode, workMin, breakMin]);

  // The countdown itself, derived from the deadline.
  useEffect(() => {
    if (!isActive) return undefined;
    if (endsAtRef.current == null) endsAtRef.current = Date.now() + secondsLeft * 1000;

    const tick = () => {
      const remaining = Math.max(0, Math.round((endsAtRef.current - Date.now()) / 1000));
      setSecondsLeft(remaining);
    };

    tick();
    const id = setInterval(tick, 250);
    // A throttled background tab can skip ticks entirely; recompute the moment
    // it comes back to the foreground.
    document.addEventListener('visibilitychange', tick);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', tick);
    };
    // Deliberately keyed on isActive alone — the deadline lives in a ref, so
    // this must not tear down and rebuild the interval on every tick.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  // Phase completion.
  useEffect(() => {
    if (secondsLeft !== 0 || !isActive) return;
    setIsActive(false);
    endsAtRef.current = null;
    playChime();
    if (mode === 'work') {
      setCyclesCompleted((c) => c + 1);
      setAnnouncement('Focus session complete. Time for a break.');
      onComplete?.(task);
      setMode('break');
    } else {
      setAnnouncement('Break finished. Ready for another focus session.');
      setMode('work');
    }
  }, [secondsLeft, isActive, mode, task, onComplete, playChime]);

  // Mirror the countdown into the tab title, then put back whatever the title
  // was — previously this restored a hard-coded string that no longer matched
  // any route, so closing the timer left the wrong title behind.
  useEffect(() => {
    if (!task) return undefined;
    const previousTitle = document.title;
    return () => {
      document.title = previousTitle;
    };
  }, [task]);

  useEffect(() => {
    if (!task) return;
    document.title = `${formatTime(secondsLeft)} • ${task.text}`;
  }, [secondsLeft, task]);

  const handleClose = useCallback(() => {
    setIsActive(false);
    endsAtRef.current = null;
    onClose?.();
  }, [onClose]);

  const toggleRunning = useCallback(() => {
    setAnnouncement('');
    setIsActive((active) => {
      // Re-anchor the deadline on resume; drop it on pause.
      endsAtRef.current = active ? null : Date.now() + secondsLeft * 1000;
      return !active;
    });
  }, [secondsLeft]);

  // Move focus into the dialog on open and hand it back on close.
  useEffect(() => {
    if (!task) return undefined;
    restoreFocusRef.current = document.activeElement;
    dialogRef.current?.focus();
    return () => {
      const target = restoreFocusRef.current;
      if (target && typeof target.focus === 'function' && document.contains(target)) {
        target.focus();
      }
    };
  }, [task]);

  useEffect(() => {
    if (!task) return undefined;
    const handler = (e) => {
      if (e.key === 'Escape') {
        handleClose();
        return;
      }

      if (e.key === 'Tab') {
        // Keep Tab inside the dialog while it is modal.
        const focusable = dialogRef.current?.querySelectorAll(
          'button, input, [href], select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable?.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
        return;
      }

      // Space starts/pauses, unless the user is typing or on a control that
      // already handles it.
      if (e.key === ' ') {
        const tag = e.target.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || tag === 'BUTTON') return;
        e.preventDefault();
        toggleRunning();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [task, handleClose, toggleRunning]);

  if (!task) return null;

  const progressPercent = totalSeconds ? ((totalSeconds - secondsLeft) / totalSeconds) * 100 : 0;
  const percentDisplay = Math.round(progressPercent);

  return (
    <>
      <div className="pomodoro-backdrop" onClick={handleClose} />
      <div
        ref={dialogRef}
        tabIndex={-1}
        className={`pomodoro-dialog ${mode === 'break' ? 'break-mode' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="pomodoro-heading"
      >
        <h2 id="pomodoro-heading" className="pomodoro-heading">
          {mode === 'work' ? 'Focus mode' : 'Break time'}
        </h2>
        <p className="pomodoro-task">{task.text}</p>

        {/* role="timer" without a live region: announcing every second would
            flood a screen reader. Completion is announced separately below. */}
        <div className="pomodoro-clock" role="timer" aria-label={`${formatTime(secondsLeft)} remaining`}>
          {formatTime(secondsLeft)}
        </div>

        <div className="pomodoro-progress-text">{percentDisplay}% through this session</div>

        <div className="sr-only" role="status" aria-live="polite">
          {announcement}
        </div>

        {/* Driven by the announcement rather than `secondsLeft === 0`: finishing
            a phase switches mode, which immediately refills the clock for the
            next one, so the old condition could never be true when painted. */}
        {announcement && <div className="pomodoro-complete">{announcement}</div>}

        <div
          className="pomodoro-bar"
          role="progressbar"
          aria-valuenow={percentDisplay}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Session progress"
        >
          <div className="pomodoro-bar-fill" style={{ width: `${progressPercent}%` }} />
        </div>

        <div className="pomodoro-controls">
          <button
            type="button"
            onClick={toggleRunning}
            className={`pomodoro-btn-primary ${isActive ? 'active' : ''}`}
          >
            {isActive ? 'Pause' : 'Start'}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsActive(false);
              endsAtRef.current = null;
              setSecondsLeft(totalSeconds);
            }}
            className="pomodoro-btn-secondary"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={() => setMuted((m) => !m)}
            className="pomodoro-btn-secondary"
            aria-pressed={muted}
          >
            {muted ? 'Muted' : 'Sound on'}
          </button>
          <button type="button" onClick={handleClose} className="pomodoro-btn-close">
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
            Sessions done: <strong>{cyclesCompleted}</strong>
          </div>
        </div>

        <p className="pomodoro-hint">
          <kbd>Space</kbd> start or pause · <kbd>Esc</kbd> close
        </p>
      </div>
    </>
  );
};

export default PomodoroTimer;
