import React, { useState } from 'react';
import './App.css';
import TaskList from './components/TaskList';
import TaskInput from './components/TaskInput';

function App() {
  const [tasks, setTasks] = useState([]);

  const addTask = (task) => {
    setTasks([...tasks, task]);
    console.log("Task added:", task);
  };

  const deleteTask = (indexToDelete) => {
    const updatedTasks = tasks.filter((_, index) => index !== indexToDelete);
    setTasks(updatedTasks);
    console.log("Deleted task at index:", indexToDelete); // ← for a bonus commit
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Gerente - Task Manager</h1>
        <TaskInput onAddTask={addTask} />
        <TaskList tasks={tasks} onDeleteTask={deleteTask} />
      </header>
    </div>
  );
}

export default App;