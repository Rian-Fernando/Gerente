import React from 'react';

const TaskList = ({ tasks, onDeleteTask, onToggleComplete }) => {
  if (tasks.length === 0) {
    return <p style={{ fontStyle: "italic", color: "#999" }}>No tasks yet!</p>;
  }

  return (
    <ul style={{ listStyleType: "none", fontSize: "18px", padding: 0 }}>
      {tasks.map((task, index) => (
        <li key={index} style={{ marginBottom: "10px" }}>
          <input 
            type="checkbox" 
            checked={task.completed} 
            onChange={() => onToggleComplete(index)} 
          />
          <span style={{ 
            textDecoration: task.completed ? 'line-through' : 'none',
            marginLeft: "10px"
          }}>
            {task.text}
          </span>
          <button
            onClick={() => onDeleteTask(index)}
            style={{
              marginLeft: "10px",
              color: "#e63946",
              background: "none",
              border: "none",
              fontWeight: "bold",
              cursor: "pointer"
            }}
          >
            ✖
          </button>
        </li>
      ))}
    </ul>
  );
};

export default TaskList;