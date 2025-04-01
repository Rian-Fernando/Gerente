import React from 'react';
import TaskList from './components/TaskList';  // Intentional issue: TaskList.js is empty
import './styles.css';

function App() {
    return (
        <div className="container">
            <h1>Gerente - Task Manager</h1>
            <TaskList />  {/* This will cause an error initially */}
        </div>
    );
}

export default App;
