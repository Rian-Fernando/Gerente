import React, { useEffect, useRef, useState } from 'react';
import { CATEGORY_LABELS } from '../constants/themes';
import './TaskInput.css';

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

const TaskInput = ({ onAddTask, defaultCategory = 'personal' }) => {
  const [text, setText] = useState('');
  const [priority, setPriority] = useState('medium');
  const [category, setCategory] = useState(defaultCategory);
  const [dueDate, setDueDate] = useState('');
  const fieldRef = useRef(null);

  // Follow the active workspace. Without this the select keeps whichever
  // workspace was active when the component mounted, so switching tabs and
  // adding a task filed it under the old workspace — where it immediately
  // vanished from view, because the list only shows the active one.
  useEffect(() => {
    setCategory(defaultCategory);
  }, [defaultCategory]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    const added = onAddTask(text, priority, category, dueDate);
    if (added !== false) {
      setText('');
      setPriority('medium');
      setDueDate('');
      fieldRef.current?.focus();
    }
  };

  return (
    <form className="task-input" onSubmit={handleSubmit}>
      <div className="task-input-main">
        <input
          ref={fieldRef}
          type="text"
          className="task-input-field"
          placeholder="What do you need to get done?"
          value={text}
          onChange={(e) => setText(e.target.value)}
          aria-label="Task description"
        />
        <button type="submit" className="add-task-btn" disabled={!text.trim()}>
          <PlusIcon />
          <span>Add task</span>
        </button>
      </div>

      <div className="task-input-options">
        <label className="task-input-option">
          <span className="task-input-option-label">Priority</span>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="task-input-select"
          >
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </label>

        <label className="task-input-option">
          <span className="task-input-option-label">Workspace</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="task-input-select"
          >
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label className="task-input-option">
          <span className="task-input-option-label">Due date</span>
          {/* No `min` — back-dating is legitimate, and the Overdue state
              exists precisely to surface it. */}
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="task-input-select"
          />
        </label>

        {dueDate && (
          <button
            type="button"
            className="task-input-clear"
            onClick={() => setDueDate('')}
          >
            Clear date
          </button>
        )}
      </div>
    </form>
  );
};

export default TaskInput;
