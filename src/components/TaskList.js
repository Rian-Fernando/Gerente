import { formatDate } from '../helpers/formatDate';
import React from 'react';
import { PRIORITY_COLORS } from '../constants/themes';

const TaskList = ({
  tasks,
  onDeleteTask,
  onToggleComplete,
  onEditTask,
  onSaveTask,
  onCancelEdit
}) => {
  console.log("Rendering TaskList:", tasks);

  if (tasks.length === 0) {
    return <p style={{ fontStyle: "italic", color: "#999" }}>No tasks yet!</p>;
  }

  const getPriorityBackground = (priority) => {
    switch (priority) {
      case 'high':
        return 'rgba(230, 57, 70, 0.1)';
      case 'medium':
        return 'rgba(241, 196, 15, 0.1)';
      case 'low':
        return 'rgba(46, 204, 113, 0.1)';
      default:
        return 'transparent';
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <ul style={{ listStyleType: "none", fontSize: "18px", padding: 0 }}>
      {tasks.map((task, index) => (
        <li
          key={index}
          style={{
            marginBottom: "10px",
            display: "flex",
            flexDirection: "column",
            padding: window.innerWidth <= 600 ? "8px" : "10px",
            borderRadius: "8px",
            backgroundColor: getPriorityBackground(task.priority),
            transition: "background-color 0.3s"
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => onToggleComplete(index)}
            />

            <span
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                backgroundColor: PRIORITY_COLORS[task.priority],
                display: "inline-block",
                marginLeft: "10px",
                marginRight: "6px"
              }}
            ></span>

            {task.isEditing ? (
              <input
                type="text"
                defaultValue={task.text}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    onSaveTask(index, e.target.value);
                  } else if (e.key === "Escape") {
                    onCancelEdit(index);
                  }
                }}
                style={{
                  padding: "4px",
                  fontSize: "16px"
                }}
              />
            ) : (
              <span
                onClick={() => onEditTask(index)}
                style={{
                  textDecoration: task.completed ? 'line-through' : 'none',
                  marginLeft: "5px",
                  cursor: "pointer"
                }}
              >
                {task.text}
              </span>
            )}

            <button
              onClick={() => onDeleteTask(index)}
              className="delete-btn"
              title="Delete this task"
              onMouseEnter={(e) => (e.target.style.color = "#ff0000")}
              onMouseLeave={(e) => (e.target.style.color = "#e63946")}
              style={{
                marginLeft: "auto",
                color: "#e63946",
                background: "none",
                border: "none",
                fontWeight: "bold",
                cursor: "pointer",
                transition: "color 0.3s ease"
              }}
            >
              ✖
            </button>
          </div>

          {task.dueDate && (
            <div style={{ fontSize: "14px", fontStyle: "italic", color: "#666", marginTop: "4px" }}>
              Due: {formatDate(task.dueDate)} {task.dueDate === today ? "🟠 Due Today!" : ""}
            </div>
          )}
          {task.completed && task.createdAt && task.completedAt && (
            <div style={{ fontSize: "13px", color: "#444", marginTop: "2px" }}>
              Completed in {Math.round((new Date(task.completedAt) - new Date(task.createdAt)) / 60000)} minutes
            </div>
          )}
        </li>
      ))}
    </ul>
  );
};

export default TaskList;