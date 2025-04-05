import React from 'react';

const TaskList = ({ tasks, onDeleteTask }) => {
  return (
    <ul style={{ listStyleType: "none", fontSize: "18px" }}>
      {tasks.map((task, index) => (
        <li key={index}>
          {task}
          <button 
            onClick={() => onDeleteTask(index)} 
            style={{ marginLeft: "10px", color: "red", background: "none", border: "none", cursor: "pointer" }}
          >
            ✖
          </button>
        </li>
      ))}
    </ul>
  );
};

export default TaskList;