import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { PRIORITY_COLORS, CATEGORY_COLORS, CATEGORY_LABELS } from '../constants/themes';
import { formatDate } from '../helpers/formatDate';
import './TaskList.css';

const getDueStatus = (dueDate, today) => {
  if (!dueDate) return null;
  if (dueDate < today) return { label: 'Overdue', className: 'due-overdue' };
  if (dueDate === today) return { label: 'Due today', className: 'due-today' };
  const daysAway = Math.ceil((new Date(dueDate) - new Date(today)) / 86400000);
  if (daysAway <= 2) return { label: 'Due soon', className: 'due-soon' };
  return { label: '', className: 'due-future' };
};

const TimerIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="13" r="7" />
    <path d="M12 9v4l2 2M9 2h6M12 6V2" />
  </svg>
);

const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

const TaskList = ({
  tasks,
  workspace,
  onDeleteTask,
  onToggleComplete,
  onEditTask,
  onSaveTask,
  onCancelEdit,
  onReorderTasks,
  onStartPomodoro,
}) => {
  const [hoveredId, setHoveredId] = useState(null);
  const today = new Date().toISOString().split('T')[0];
  const workspaceLabel = workspace ? workspace.charAt(0).toUpperCase() + workspace.slice(1) : 'Tasks';

  const completedCount = tasks.filter((t) => t.completed).length;
  const pendingCount = tasks.length - completedCount;

  return (
    <div className="task-list-container">
      <div className="task-list-header">
        <span
          className="task-list-header-dot"
          style={{ backgroundColor: CATEGORY_COLORS[workspace] || '#86868B' }}
          aria-hidden="true"
        />
        Workspace: {workspaceLabel}
      </div>

      <div className="task-stats">
        <div className="task-stat task-stat-total">
          <h4>Total</h4>
          <p>{tasks.length}</p>
        </div>
        <div className="task-stat task-stat-completed">
          <h4>Completed</h4>
          <p>{completedCount}</p>
        </div>
        <div className="task-stat task-stat-pending">
          <h4>Pending</h4>
          <p>{pendingCount}</p>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="task-empty-state">
          <div className="task-empty-icon" aria-hidden="true">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M9 12l2 2 4-4" />
            </svg>
          </div>
          <p className="task-empty-title">All clear in {workspaceLabel}.</p>
          <p className="task-empty-subtitle">Add a task above to get started.</p>
        </div>
      ) : (
        <DragDropContext
          onDragEnd={(result) => {
            if (!result.destination) return;
            if (result.source.index === result.destination.index) return;
            const reordered = Array.from(tasks);
            const [moved] = reordered.splice(result.source.index, 1);
            reordered.splice(result.destination.index, 0, moved);
            onReorderTasks?.(reordered);
          }}
        >
          <Droppable droppableId="taskList">
            {(provided) => (
              <ul className="task-list" {...provided.droppableProps} ref={provided.innerRef}>
                {tasks.map((task, index) => {
                  const dueStatus = getDueStatus(task.dueDate, today);
                  const priorityBg = `priority-${task.priority || 'medium'}`;
                  return (
                    <Draggable key={task.id} draggableId={task.id} index={index}>
                      {(dragProvided, snapshot) => (
                        <li
                          ref={dragProvided.innerRef}
                          {...dragProvided.draggableProps}
                          {...dragProvided.dragHandleProps}
                          onMouseEnter={() => setHoveredId(task.id)}
                          onMouseLeave={() => setHoveredId(null)}
                          className={`task-item ${priorityBg} ${task.completed ? 'is-completed' : ''} ${
                            hoveredId === task.id ? 'is-hovered' : ''
                          } ${snapshot.isDragging ? 'is-dragging' : ''}`}
                          style={{
                            ...dragProvided.draggableProps.style,
                            borderLeftColor: CATEGORY_COLORS[task.category] || '#ccc',
                          }}
                        >
                          <div className="task-row">
                            <input
                              type="checkbox"
                              checked={task.completed}
                              onChange={() => onToggleComplete(task.id)}
                              aria-label={`Mark ${task.text} as ${task.completed ? 'incomplete' : 'complete'}`}
                            />

                            <span
                              className="priority-dot"
                              style={{ backgroundColor: PRIORITY_COLORS[task.priority] }}
                              title={`Priority: ${task.priority}`}
                            />

                            {task.isEditing ? (
                              <input
                                type="text"
                                defaultValue={task.text}
                                autoFocus
                                className="task-edit-input"
                                onBlur={(e) => onSaveTask(task.id, e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') onSaveTask(task.id, e.target.value);
                                  else if (e.key === 'Escape') onCancelEdit(task.id);
                                }}
                              />
                            ) : (
                              <div
                                className="task-text"
                                onClick={() => onEditTask(task.id)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') onEditTask(task.id);
                                }}
                              >
                                {task.text}
                              </div>
                            )}

                            {task.category && (
                              <span
                                className="task-badge"
                                style={{ backgroundColor: CATEGORY_COLORS[task.category] || '#eee' }}
                              >
                                {CATEGORY_LABELS[task.category] || task.category}
                              </span>
                            )}

                            {dueStatus?.label && (
                              <span className={`task-due-badge ${dueStatus.className}`}>
                                {dueStatus.label}
                              </span>
                            )}

                            <button
                              type="button"
                              className="task-icon-btn pomodoro-btn"
                              title="Start Pomodoro for this task"
                              aria-label="Start Pomodoro timer"
                              onClick={() => onStartPomodoro(task)}
                            >
                              <TimerIcon />
                            </button>

                            <button
                              type="button"
                              className="task-icon-btn delete-btn"
                              title="Delete this task"
                              aria-label={`Delete ${task.text}`}
                              onClick={() => onDeleteTask(task.id)}
                            >
                              <CloseIcon />
                            </button>
                          </div>

                          {task.dueDate && (
                            <div className={`task-due-line ${dueStatus?.className || ''}`}>
                              Due: {formatDate(task.dueDate)}
                            </div>
                          )}

                          {task.completed && task.createdAt && task.completedAt && (
                            <div className="task-meta">
                              Completed in{' '}
                              {Math.max(
                                1,
                                Math.round((new Date(task.completedAt) - new Date(task.createdAt)) / 60000)
                              )}{' '}
                              min · {formatDate(task.completedAt)}
                            </div>
                          )}
                        </li>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </ul>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>
  );
};

export default TaskList;
