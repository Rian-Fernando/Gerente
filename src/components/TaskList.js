import { formatDate } from '../helpers/formatDate';
import React, { useState } from 'react';
import { PRIORITY_COLORS, CATEGORY_COLORS } from '../constants/themes';
import {
  DragDropContext,
  Droppable,
  Draggable
} from '@hello-pangea/dnd';

const TaskList = ({
  tasks,
  onDeleteTask,
  onToggleComplete,
  onEditTask,
  onSaveTask,
  onCancelEdit,
  onReorderTasks,
  onStartPomodoro
}) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
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
    <DragDropContext
      onDragEnd={(result) => {
        if (!result.destination) return;
        const reordered = Array.from(tasks);
        const [movedItem] = reordered.splice(result.source.index, 1);
        reordered.splice(result.destination.index, 0, movedItem);
        onReorderTasks(reordered);
      }}
    >
      <Droppable droppableId="taskList">
        {(provided) => (
          <ul
            {...provided.droppableProps}
            ref={provided.innerRef}
            style={{ listStyleType: "none", fontSize: "18px", padding: 0 }}
          >
            {tasks.map((task, index) => (
              <Draggable key={index} draggableId={index.toString()} index={index}>
                {(provided) => (
                  <li
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    style={{
                      ...provided.draggableProps.style,
                      marginBottom: "10px",
                      display: "flex",
                      flexDirection: "column",
                      padding: window.innerWidth <= 600 ? "8px" : "10px",
                      borderRadius: "8px",
                      backgroundColor: getPriorityBackground(task.priority),
                      boxShadow: hoveredIndex === index ? "0 4px 12px rgba(0,0,0,0.15)" : "0 2px 4px rgba(0,0,0,0.05)",
                      transform: hoveredIndex === index ? "translateY(-2px)" : "none",
                      transition: "all 0.3s ease"
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

                      {task.category && (
                        <span
                          style={{
                            fontSize: "12px",
                            color: "#fff",
                            backgroundColor: CATEGORY_COLORS[task.category] || "#666",
                            borderRadius: "4px",
                            padding: "2px 6px",
                            marginLeft: "10px",
                            fontWeight: "bold",
                            textTransform: "uppercase"
                          }}
                        >
                          {task.category}
                        </span>
                      )}

                      <button
                        title="Toggle Pomodoro Mode"
                        onClick={() => onStartPomodoro(task)}
                        style={{
                          marginLeft: "10px",
                          color: "#f39c12",
                          background: "none",
                          border: "none",
                          fontSize: "16px",
                          cursor: "pointer",
                          transition: "color 0.3s ease"
                        }}
                      >
                        🍅
                      </button>

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
                      <div
                        style={{
                          fontSize: "14px",
                          fontStyle: "italic",
                          color: new Date(task.dueDate) < new Date(today)
                            ? "#e74c3c"
                            : task.dueDate === today
                            ? "#f39c12"
                            : "#666",
                          marginTop: "4px",
                          fontWeight: new Date(task.dueDate) < new Date(today) ? "bold" : "normal"
                        }}
                      >
                        Due: {formatDate(task.dueDate)}{" "}
                        {new Date(task.dueDate) < new Date(today)
                          ? "🔴 Overdue"
                          : task.dueDate === today
                          ? "🟠 Due Today!"
                          : ""}
                      </div>
                    )}
                    {task.completed && task.createdAt && task.completedAt && (
                      <div style={{ fontSize: "13px", color: "#444", marginTop: "2px" }}>
                        Completed in {Math.round((new Date(task.completedAt) - new Date(task.createdAt)) / 60000)} minutes
                      </div>
                    )}
                  </li>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </ul>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default TaskList;