import React from 'react';

const TaskList = ({ tasks, onDeleteTask, onToggleComplete, onEditTask }) => {
  console.log("Rendering TaskList:", tasks); // Debug log

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
          <span
            onClick={() => onEditTask(index)}
            style={{
              textDecoration: task.completed ? 'line-through' : 'none',
              marginLeft: "10px",
              cursor: "pointer"
            }}
          >
            {task.text}
          </span>
          <button
            onClick={() => onDeleteTask(index)}
            className="delete-btn"
            style={{
              marginLeft: "10px",
              color: "#e63946",
              background: "none",
              border: "none",
              fontWeight: "bold",
              cursor: "pointer",
              transition: "color 0.2s"
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