import React, { useState, useEffect } from 'react';
import './App.css';
import './styles/AppContainer.css';
import TaskList from './components/TaskList';
import TaskInput from './components/TaskInput';
import SortTasks from './components/sort/SortTasks';
import WorkspaceTabs from './components/workspace/WorkspaceTabs';
import { APP_VERSION, APP_YEAR } from './constants/appInfo';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NotFound from './pages/NotFound';

function App() {
  const [workspaceTasks, setWorkspaceTasks] = useState({
    Personal: [],
    Work: [],
    School: [],
    Fitness: [],
    Other: []
  });
  const [activeWorkspace, setActiveWorkspace] = useState("Personal");
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });
  const [sortMethod, setSortMethod] = useState("none");
  const [focusMode, setFocusMode] = useState(false);

  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const addTask = (text, priority = 'medium', dueDate = '') => {
    const newTask = {
      text,
      completed: false,
      isEditing: false,
      priority,
      dueDate
    };
    setWorkspaceTasks(prev => ({
      ...prev,
      [activeWorkspace]: [...prev[activeWorkspace], newTask]
    }));
  };

  const deleteTask = (indexToDelete) => {
    const updatedTasks = workspaceTasks[activeWorkspace].filter((_, index) => index !== indexToDelete);
    setWorkspaceTasks(prev => ({
      ...prev,
      [activeWorkspace]: updatedTasks
    }));
  };

  const toggleComplete = (index) => {
    const updatedTasks = workspaceTasks[activeWorkspace].map((task, i) =>
      i === index ? { ...task, completed: !task.completed } : task
    );
    setWorkspaceTasks(prev => ({
      ...prev,
      [activeWorkspace]: updatedTasks
    }));
  };

  const editTask = (indexToEdit) => {
    const updatedTasks = workspaceTasks[activeWorkspace].map((task, i) =>
      i === indexToEdit ? { ...task, isEditing: true } : task
    );
    setWorkspaceTasks(prev => ({
      ...prev,
      [activeWorkspace]: updatedTasks
    }));
  };

  const saveTask = (index, newText) => {
    const updatedTasks = workspaceTasks[activeWorkspace].map((task, i) =>
      i === index ? { ...task, text: newText, isEditing: false } : task
    );
    setWorkspaceTasks(prev => ({
      ...prev,
      [activeWorkspace]: updatedTasks
    }));
  };

  const cancelEdit = (index) => {
    const updatedTasks = workspaceTasks[activeWorkspace].map((task, i) =>
      i === index ? { ...task, isEditing: false } : task
    );
    setWorkspaceTasks(prev => ({
      ...prev,
      [activeWorkspace]: updatedTasks
    }));
  };

  const sortTasks = (tasks) => {
    if (sortMethod === "priority") {
      const priorityOrder = { high: 1, medium: 2, low: 3 };
      return [...tasks].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    } else if (sortMethod === "az") {
      return [...tasks].sort((a, b) => a.text.localeCompare(b.text));
    } else if (sortMethod === "completed") {
      return [...tasks].sort((a, b) => a.completed - b.completed);
    }
    return tasks;
  };

  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={
            <header className="App-header">
              <h1>Gerente - Task Manager</h1>
              <button onClick={() => setFocusMode(prev => !prev)} style={{ marginBottom: '1rem' }}>
                {focusMode ? "Exit Focus Mode" : "Enter Focus Mode"}
              </button>
              {!focusMode && (
                <>
                  <button onClick={toggleTheme} style={{ marginBottom: '1rem' }}>
                    Toggle Theme
                  </button>
                  <WorkspaceTabs activeWorkspace={activeWorkspace} setActiveWorkspace={setActiveWorkspace} />
                  <SortTasks sortMethod={sortMethod} onChangeSort={setSortMethod} />
                </>
              )}
              <TaskInput onAddTask={addTask} />
              <TaskList
                tasks={sortTasks(workspaceTasks[activeWorkspace])}
                onDeleteTask={deleteTask}
                onToggleComplete={toggleComplete}
                onEditTask={editTask}
                onSaveTask={saveTask}
                onCancelEdit={cancelEdit}
              />
            </header>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <footer style={{
          textAlign: "center",
          fontSize: "14px",
          color: "#888",
          marginTop: "30px"
        }}>
          Gerente {APP_VERSION} © {APP_YEAR}
        </footer>
      </div>
    </Router>
  );
}

export default App;
