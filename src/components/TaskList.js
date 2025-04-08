import React from 'react';

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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return '#e63946'; // red
      case 'medium':
        return '#f1c40f'; // yellow
      case 'low':
        return '#2ecc71'; // green
      default:
        return '#999';
    }
  };

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

  return (
    <ul style={{ listStyleType: "none", fontSize: "18px", padding: 0 }}>
      {tasks.map((task, index) => (
        <li
          key={index}
          style={{
            marginBottom: "10px",
            display: "flex",
            alignItems: "center",
            padding: "10px",
            borderRadius: "8px",
            backgroundColor: getPriorityBackground(task.priority),
            transition: "background-color 0.3s"
          }}
        >
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
              backgroundColor: getPriorityColor(task.priority),
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
            style={{
              marginLeft: "auto",
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