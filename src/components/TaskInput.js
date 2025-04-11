import React, { useState } from 'react';

const TaskInput = ({ onAddTask }) => {
  const [text, setText] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');

  const handleAddTask = () => {
    if (text.trim()) {
      onAddTask(text, priority, dueDate);
      setText('');
      setPriority('medium');
      setDueDate('');
    }
  };

  return (
    <div
      style={{
        marginBottom: '20px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '10px',
        flexDirection: window.innerWidth <= 600 ? 'column' : 'row',
        alignItems: 'flex-start'
      }}
    >
      <input
        type="text"
        placeholder="Enter a task..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={{ padding: '8px', fontSize: '16px' }}
      />

      <select
        value={priority}
        onChange={(e) => setPriority(e.target.value)}
        style={{ padding: '8px', fontSize: '16px' }}
      >
        <option value="high">High 🔴</option>
        <option value="medium">Medium 🟡</option>
        <option value="low">Low 🟢</option>
      </select>

      <input
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        style={{ padding: '8px', fontSize: '16px' }}
      />

      <button onClick={handleAddTask} style={{ padding: '8px 16px', fontSize: '16px' }}>
        Add Task
      </button>
    </div>
  );
};

export default TaskInput;