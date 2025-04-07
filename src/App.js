import React, { useState } from 'react';
import './App.css';
import TaskList from './components/TaskList';
import TaskInput from './components/TaskInput';

function App() {
  const [tasks, setTasks] = useState([]);

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

  return (
    <div className="App">
      <header className="App-header">
        <h1>Gerente - Task Manager</h1>
        <TaskInput onAddTask={addTask} />
        <TaskList
          tasks={tasks}
          onDeleteTask={deleteTask}
          onToggleComplete={toggleComplete}
          onEditTask={editTask}
          onSaveTask={saveTask}
        />
      </header>
    </div>
  );
}

export default App;