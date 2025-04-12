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
        style={{
          padding: '10px 14px',
          fontSize: '16px',
          border: '1px solid #ccc',
          borderRadius: '10px',
          flex: 1,
          backgroundColor: '#f9f9f9',
          transition: 'all 0.3s ease'
        }}
      />

      <select
        value={priority}
        onChange={(e) => setPriority(e.target.value)}
        style={{
          padding: '10px 14px',
          fontSize: '16px',
          borderRadius: '10px',
          border: '1px solid #ccc',
          backgroundColor: '#f9f9f9',
          transition: 'all 0.3s ease'
        }}
      >
        <option value="high">High 🔴</option>
        <option value="medium">Medium 🟡</option>
        <option value="low">Low 🟢</option>
      </select>

      <input
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        style={{
          padding: '10px 14px',
          fontSize: '16px',
          borderRadius: '10px',
          border: '1px solid #ccc',
          backgroundColor: '#f9f9f9',
          transition: 'all 0.3s ease'
        }}
      />

      <button onClick={handleAddTask} style={{
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: '#1a73e8',
          color: '#fff',
          border: 'none',
          borderRadius: '10px',
          cursor: 'pointer',
          fontWeight: '600',
          transition: 'background 0.3s ease'
        }}>
        Add Task
      </button>
    </div>
  );
};

export default TaskInput;