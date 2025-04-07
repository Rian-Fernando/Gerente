// Theme toggling logic (light/dark mode)

import React, { useState, useEffect } from 'react';
import './App.css';
import TaskList from './components/TaskList';
import TaskInput from './components/TaskInput';

function App() {
  const [tasks, setTasks] = useState([]);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const addTask = (text) => {
    const newTask = { text, completed: false, isEditing: false };
    setTasks([...tasks, newTask]);
    console.log("Task added:", newTask);
  };

  const deleteTask = (indexToDelete) => {
    const updatedTasks = tasks.filter((_, index) => index !== indexToDelete);
    setTasks(updatedTasks);
    console.log("Deleted task at index:", indexToDelete);
  };

  const toggleComplete = (index) => {
    const updatedTasks = tasks.map((task, i) =>
      i === index ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);
    console.log("Toggled complete for task:", index);
  };

  const editTask = (indexToEdit) => {
    const updatedTasks = tasks.map((task, i) =>
      i === indexToEdit ? { ...task, isEditing: true } : task
    );
    setTasks(updatedTasks);
    console.log("Editing task at index:", indexToEdit);
  };

  const saveTask = (index, newText) => {
    const updatedTasks = tasks.map((task, i) =>
      i === index ? { ...task, text: newText, isEditing: false } : task
    );
    setTasks(updatedTasks);
    console.log("Saved task:", updatedTasks[index]);
  };

  const cancelEdit = (index) => {
    const updatedTasks = tasks.map((task, i) =>
      i === index ? { ...task, isEditing: false } : task
    );
    setTasks(updatedTasks);
    console.log("Canceled editing for task:", index);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Gerente - Task Manager</h1>
        <button onClick={toggleTheme} style={{ marginBottom: '1rem' }}>
          Toggle Theme
        </button>
        <TaskInput onAddTask={addTask} />
        <TaskList
          tasks={tasks}
          onDeleteTask={deleteTask}
          onToggleComplete={toggleComplete}
          onEditTask={editTask}
          onSaveTask={saveTask}
          onCancelEdit={cancelEdit}
        />
      </header>
    </div>
  );
}

export default App;