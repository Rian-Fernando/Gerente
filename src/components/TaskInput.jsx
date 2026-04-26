import React, { useState } from 'react';
import { CATEGORY_LABELS } from '../constants/themes';
import './TaskInput.css';

const TaskInput = ({ onAddTask, defaultCategory = 'personal' }) => {
  const [text, setText] = useState('');
  const [priority, setPriority] = useState('medium');
  const [category, setCategory] = useState(defaultCategory);
  const [dueDate, setDueDate] = useState('');

  const handleAddTask = () => {
    if (!text.trim()) return;
    const added = onAddTask(text, priority, category, dueDate);
    if (added !== false) {
      setText('');
      setPriority('medium');
      setDueDate('');
    }
  };

  return (
    <div className="task-input">
      <input
        type="text"
        className="task-input-field"
        placeholder="What do you need to get done today?"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleAddTask();
        }}
        aria-label="Task description"
      />

      <select
        value={priority}
        onChange={(e) => setPriority(e.target.value)}
        aria-label="Select task priority"
        className="task-input-select"
      >
        <option value="high">High priority</option>
        <option value="medium">Medium priority</option>
        <option value="low">Low priority</option>
      </select>

      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        aria-label="Select task category"
        className="task-input-select"
      >
        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
          <option key={key} value={key}>
            {label}
          </option>
        ))}
      </select>

      <input
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        aria-label="Set task due date"
        className="task-input-select"
      />

      <button onClick={handleAddTask} className="add-task-btn" type="button">
        Add Task
      </button>
    </div>
  );
};

export default TaskInput;
