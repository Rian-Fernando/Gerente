import React, { useState } from 'react';

// This component handles user input for new tasks
const TaskInput = ({ onAddTask }) => {
  const [task, setTask] = useState('');

  const handleChange = (e) => {
    setTask(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (task.trim() !== '') {
      onAddTask(task);
      setTask('');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="text" 
        placeholder="Enter a new task..." 
        value={task} 
        onChange={handleChange} 
      />
      <button type="submit">Add Task</button>
    </form>
  );
};

export default TaskInput;