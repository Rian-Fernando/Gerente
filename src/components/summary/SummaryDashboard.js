import React from 'react';

const SummaryDashboard = ({ tasks, activeWorkspace }) => {
  const completedTasks = tasks.filter(task => task.completed);
  const tasksToday = completedTasks.filter(task => {
    const completedDate = new Date(task.completedAt).toDateString();
    return completedDate === new Date().toDateString();
  });

  const avgTime = completedTasks.length > 0
    ? Math.round(
        completedTasks.reduce((sum, task) => {
          if (task.createdAt && task.completedAt) {
            return sum + (new Date(task.completedAt) - new Date(task.createdAt)) / 60000;
          }
          return sum;
        }, 0) / completedTasks.length
      )
    : 0;

  return (
    <div style={{
      marginBottom: "20px",
      padding: "12px",
      border: "1px solid #ccc",
      borderRadius: "8px",
      backgroundColor: "#f8f9fa",
      fontSize: "14px",
      display: "flex",
      gap: "30px",
      justifyContent: "space-around"
    }}>
      <div>📁 Workspace: <strong>{activeWorkspace}</strong></div>
      <div>✅ Tasks Today: <strong>{tasksToday.length}</strong></div>
      <div>⏱️ Avg Time: <strong>{avgTime} mins</strong></div>
    </div>
  );
};

export default SummaryDashboard;
