import React, { useState, useEffect } from 'react';
import './App.css';
import './styles/AppContainer.css';
import TaskList from './components/TaskList';
import TaskInput from './components/TaskInput';
import SortTasks from './components/sort/SortTasks';
import { APP_VERSION, APP_YEAR } from './constants/appInfo';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NotFound from './pages/NotFound';

function App() {
  const [tasks, setTasks] = useState([]);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });
  const [sortMethod, setSortMethod] = useState("none");

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
    setTasks([...tasks, newTask]);
  };

  const deleteTask = (indexToDelete) => {
    const updatedTasks = tasks.filter((_, index) => index !== indexToDelete);
    setTasks(updatedTasks);
  };

  const toggleComplete = (index) => {
    const updatedTasks = tasks.map((task, i) =>
      i === index ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);
  };

  const editTask = (indexToEdit) => {
    const updatedTasks = tasks.map((task, i) =>
      i === indexToEdit ? { ...task, isEditing: true } : task
    );
    setTasks(updatedTasks);
  };

  const saveTask = (index, newText) => {
    const updatedTasks = tasks.map((task, i) =>
      i === index ? { ...task, text: newText, isEditing: false } : task
    );
    setTasks(updatedTasks);
  };

  const cancelEdit = (index) => {
    const updatedTasks = tasks.map((task, i) =>
      i === index ? { ...task, isEditing: false } : task
    );
    setTasks(updatedTasks);
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
              <button onClick={toggleTheme} style={{ marginBottom: '1rem' }}>
                Toggle Theme
              </button>
              <SortTasks sortMethod={sortMethod} onChangeSort={setSortMethod} />
              <TaskInput onAddTask={addTask} />
              <TaskList
                tasks={sortTasks(tasks)}
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
