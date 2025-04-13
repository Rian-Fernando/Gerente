import React, { useState, useEffect } from 'react';
import TaskInput from './components/TaskInput';
import TaskList from './components/TaskList';
import PomodoroTimer from './components/PomodoroTimer';
import './styles/AppContainer.css';
import { CATEGORY_ICONS, PRIORITY_COLORS } from './constants/themes';
import { formatDate } from './helpers/formatDate';

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [workspace, setWorkspace] = useState('personal');
  const [sortOption, setSortOption] = useState('default');
  const [darkMode, setDarkMode] = useState(false);
  const [pomodoroTask, setPomodoroTask] = useState(null);

  // Get today’s date string
  const today = new Date().toISOString().split('T')[0];

  // Filter today’s completed tasks
  const tasksToday = tasks.filter(t => t.completed && t.completedDate === today);

  // Calculate average time for completed tasks
  const avgCompletionTime = tasksToday.length
    ? Math.floor(tasksToday.reduce((sum, t) => sum + (t.timeTaken || 0), 0) / tasksToday.length)
    : 0;

  // Add new task
  const addTask = (text, priority, category, dueDate) => {
    const newTask = {
      text,
      completed: false,
      isEditing: false,
      priority,
      category,
      dueDate,
      createdDate: today,
      timeTaken: 0,
    };
    setTasks([...tasks, newTask]);
  };

  const toggleComplete = (index) => {
    const newTasks = [...tasks];
    const task = newTasks[index];
    task.completed = !task.completed;
    task.completedDate = task.completed ? today : null;
    task.timeTaken = task.completed ? Math.floor(Math.random() * 21) + 5 : 0; // Simulated
    setTasks(newTasks);
  };

  const deleteTask = (index) => {
    const newTasks = tasks.filter((_, i) => i !== index);
    setTasks(newTasks);
  };

  const editTask = (index) => {
    const newTasks = [...tasks];
    newTasks[index].isEditing = true;
    setTasks(newTasks);
  };

  const saveTask = (index, newText) => {
    const newTasks = [...tasks];
    newTasks[index].text = newText;
    newTasks[index].isEditing = false;
    setTasks(newTasks);
  };

  const cancelEdit = (index) => {
    const newTasks = [...tasks];
    newTasks[index].isEditing = false;
    setTasks(newTasks);
  };

  const handleWorkspaceChange = (category) => {
    setWorkspace(category);
  };

  const filteredTasks = tasks
    .filter(task => task.category === workspace)
    .sort((a, b) => {
      if (sortOption === 'priority') {
        const priorityMap = { high: 3, medium: 2, low: 1 };
        return priorityMap[b.priority] - priorityMap[a.priority];
      } else if (sortOption === 'completed') {
        return a.completed - b.completed;
      } else if (sortOption === 'az') {
        return a.text.localeCompare(b.text);
      }
      return 0;
    });

  return (
    <div className={`app-container ${darkMode ? 'dark-mode' : ''}`}>
      <h1>Gerente – Task Manager</h1>

      <div className="stats-bar">
        <div className="stat-card">📋 Workspace: <strong>{workspace.charAt(0).toUpperCase() + workspace.slice(1)}</strong></div>
        <div className="stat-card">✅ Tasks Today: <strong>{tasksToday.length}</strong></div>
        <div className="stat-card">⏱️ Avg Time: <strong>{avgCompletionTime} mins</strong></div>
      </div>

      <div className="mode-switch">
        <button onClick={() => alert("Focus mode coming soon!")}>Enter Focus Mode</button>
        <button onClick={() => setDarkMode(!darkMode)}>Toggle Theme</button>
      </div>

      <div className="category-switcher">
        {Object.keys(CATEGORY_ICONS).map((key) => (
          <button
            key={key}
            className={workspace === key ? 'active' : ''}
            onClick={() => handleWorkspaceChange(key)}
          >
            {CATEGORY_ICONS[key]} {key.charAt(0).toUpperCase() + key.slice(1)}
          </button>
        ))}
      </div>

      <div className="sort-select">
        <label>Sort tasks by:</label>
        <select onChange={(e) => setSortOption(e.target.value)} value={sortOption}>
          <option value="default">Default</option>
          <option value="priority">Priority</option>
          <option value="completed">Completion</option>
          <option value="az">A-Z</option>
        </select>
      </div>

      <TaskInput addTask={addTask} />

      <TaskList
        tasks={filteredTasks}
        onDeleteTask={deleteTask}
        onToggleComplete={toggleComplete}
        onEditTask={editTask}
        onSaveTask={saveTask}
        onCancelEdit={cancelEdit}
        onStartPomodoro={setPomodoroTask}
      />

      <PomodoroTimer task={pomodoroTask} onClose={() => setPomodoroTask(null)} />

      <footer style={{ fontSize: "14px", marginTop: "20px", color: "#888" }}>
        Gerente v1.0.0 © 2025
      </footer>
    </div>
  );
};

export default App;