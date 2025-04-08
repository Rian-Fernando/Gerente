import React, { useState } from 'react';

const TaskInput = ({ onAddTask }) => {
  const [inputValue, setInputValue] = useState('');
  const [priority, setPriority] = useState('medium');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim() !== '') {
      onAddTask(inputValue, priority);
      setInputValue('');
      setPriority('medium'); // reset priority
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Add a new task"
        style={{ padding: '8px', fontSize: '16px', width: '60%' }}
      />

      <select
        value={priority}
        onChange={(e) => setPriority(e.target.value)}
        style={{ padding: '8px', marginLeft: '10px', fontSize: '16px' }}
      >
        <option value="high">High 🔴</option>
        <option value="medium">Medium 🟡</option>
        <option value="low">Low 🟢</option>
      </select>

      <button type="submit" style={{ marginLeft: '10px' }}>
        Add
      </button>
    </form>
  );
};

export default TaskInput;