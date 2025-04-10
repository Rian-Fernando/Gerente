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
    <div style={{ marginBottom: '20px' }}>
      <input
        type="text"
        placeholder="Enter a task..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={{ padding: '8px', fontSize: '16px', marginRight: '10px' }}
      />

      <select
        value={priority}
        onChange={(e) => setPriority(e.target.value)}
        style={{ padding: '8px', fontSize: '16px', marginRight: '10px' }}
      >
        <option value="high">High 🔴</option>
        <option value="medium">Medium 🟡</option>
        <option value="low">Low 🟢</option>
      </select>

      <input
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        style={{ padding: '8px', fontSize: '16px', marginRight: '10px' }}
      />

      <button onClick={handleAddTask} style={{ padding: '8px 16px', fontSize: '16px' }}>
        Add Task
      </button>
    </div>
  );
};

export default TaskInput;