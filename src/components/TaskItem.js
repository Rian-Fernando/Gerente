import React from 'react';

function TaskItem({ task }) {
    return <li>{task.text}</li>;
}

export default TaskItem;
