import React, { useState } from 'react';

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
        placeholder="Enter Task" 
        value={task} 
        onChange={handleChange} 
      />
      <button type="submit">Add Task</button>
    </form>
  );
};

export default TaskInput;
