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
    <>
      <div style={{
        position: "sticky",
        top: 0,
        backgroundColor: "#ffffff",
        padding: "12px 16px",
        fontSize: "20px",
        fontWeight: "bold",
        borderBottom: "2px solid #eee",
        zIndex: 10
      }}>
        Workspace: Personal Tasks
      </div>
      <DragDropContext
        onDragEnd={(result) => {
          if (!result.destination) return;
          const reordered = Array.from(tasks);
          const [movedItem] = reordered.splice(result.source.index, 1);
          reordered.splice(result.destination.index, 0, movedItem);
          onReorderTasks(reordered);
        }}
      >
        <div style={{ 
          display: "flex", 
          gap: "12px", 
          marginBottom: "20px", 
          flexWrap: "wrap",
          justifyContent: "space-around"
        }}>
          <div style={{
            flex: "1",
            minWidth: "150px",
            background: "#f5f5f5",
            borderRadius: "10px",
            padding: "12px 16px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
            textAlign: "center"
          }}>
            <h4 style={{ margin: "0", fontSize: "16px", color: "#555" }}>Total Tasks</h4>
            <p style={{ margin: "4px 0 0", fontWeight: "bold", fontSize: "18px" }}>{tasks.length}</p>
          </div>
          <div style={{
            flex: "1",
            minWidth: "150px",
            background: "#dff0d8",
            borderRadius: "10px",
            padding: "12px 16px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
            textAlign: "center"
          }}>
            <h4 style={{ margin: "0", fontSize: "16px", color: "#3c763d" }}>Completed</h4>
            <p style={{ margin: "4px 0 0", fontWeight: "bold", fontSize: "18px" }}>{tasks.filter(t => t.completed).length}</p>
          </div>
          <div style={{
            flex: "1",
            minWidth: "150px",
            background: "#fcf8e3",
            borderRadius: "10px",
            padding: "12px 16px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
            textAlign: "center"
          }}>
            <h4 style={{ margin: "0", fontSize: "16px", color: "#8a6d3b" }}>Pending</h4>
            <p style={{ margin: "4px 0 0", fontWeight: "bold", fontSize: "18px" }}>{tasks.filter(t => !t.completed).length}</p>
          </div>
        </div>
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
                        borderLeft: `5px solid ${CATEGORY_COLORS[task.category] || "#ccc"}`,
                        boxShadow: hoveredIndex === index ? "0 4px 12px rgba(0,0,0,0.15)" : "0 2px 4px rgba(0,0,0,0.05)",
                        transform: hoveredIndex === index ? "translateY(-2px)" : "none",
                        transition: "all 0.3s ease",
                        opacity: task.completed ? 0.6 : 1,
                        transformOrigin: "left center",
                        transitionProperty: "transform, opacity, box-shadow"
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
                          <div
                            onClick={() => onEditTask(index)}
                            style={{
                              marginLeft: "5px",
                              cursor: "pointer",
                              position: "relative",
                              paddingLeft: "10px",
                              fontWeight: "500"
                            }}
                          >
                            <span
                              style={{
                                textDecoration: task.completed ? 'line-through' : 'none',
                                position: "relative",
                                zIndex: 1
                              }}
                            >
                              {task.text}
                            </span>
                            <span
                              style={{
                                position: "absolute",
                                top: "50%",
                                left: 0,
                                transform: "translateY(-50%)",
                                width: "4px",
                                height: "60%",
                                backgroundColor: "#555",
                                borderRadius: "3px",
                                opacity: 0.4
                              }}
                            />
                          </div>
                        )}

                        {task.category && (
                          <span
                            style={{
                              fontSize: "12px",
                              color: CATEGORY_COLORS[task.category] ? "#fff" : "#333",
                              backgroundColor: CATEGORY_COLORS[task.category] || "#eee",
                              borderRadius: "6px",
                              padding: "2px 8px",
                              marginLeft: "10px",
                              fontWeight: "bold",
                              textTransform: "capitalize",
                              boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
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
                      {task.completed && task.completedAt && (
                        <div style={{ fontSize: "12px", color: "#aaa", fontStyle: "italic", marginTop: "2px" }}>
                          Last updated: {formatDate(task.completedAt)}
                        </div>
                      )}
                      {task.completed && task.createdAt && (
                        <div style={{ fontSize: "12px", color: "#888", marginTop: "2px" }}>
                          Created on: {formatDate(task.createdAt)}
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
    </>
  );
};

export default TaskList;