import React from 'react';
import './App.css';
import TaskList from './components/TaskList';  // Importing TaskList component
import TaskInput from './components/TaskInput'; // Importing TaskInput component

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Gerente - Task Manager</h1>
        <TaskInput />  {/* Input field for tasks */}
        <TaskList />   {/* Task list display */}
      </header>
    </div>
  );
}

export default App;
