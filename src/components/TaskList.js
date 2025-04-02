import React, { useState } from 'react';
import TaskItem from './TaskItem'; // Intentional bug: TaskItem.js is empty

function TaskList() {
    const [tasks, setTasks] = useState([]); // Stores tasks

    const addTask = () => {
        const newTask = { id: tasks.length + 1, text: `Task ${tasks.length + 1}` };
        setTasks([...tasks, newTask]);
    };

    return (
        <div>
            <h2>Your Tasks</h2>
            <button onClick={addTask}>Add Task</button>
            <ul>
                {tasks.map(task => (
                    <TaskItem key={task.id} task={task} /> // Will cause an error
                ))}
            </ul>
        </div>
    );
}

export default TaskList;
