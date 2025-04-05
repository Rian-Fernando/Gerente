import React from 'react';

const TaskList = ({ tasks, onDeleteTask }) => {
  if (tasks.length === 0) {
    return <p style={{ fontStyle: "italic", color: "#999" }}>No tasks yet!</p>;
  }

  return (
    <ul style={{ listStyleType: "none", fontSize: "18px", padding: 0 }}>
      {tasks.map((task, index) => (
        <li key={index} style={{ marginBottom: "10px" }}>
          {task}
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