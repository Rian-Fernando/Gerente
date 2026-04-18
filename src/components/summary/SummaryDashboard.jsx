import React, { useMemo } from 'react';
import { CATEGORY_ICONS } from '../../constants/themes';
import './SummaryDashboard.css';

const SummaryDashboard = ({ tasks, activeWorkspace }) => {
  const stats = useMemo(() => {
    const today = new Date().toDateString();
    const completed = tasks.filter((t) => t.completed);
    const completedToday = completed.filter(
      (t) => t.completedAt && new Date(t.completedAt).toDateString() === today
    );
    const durations = completed
      .filter((t) => t.createdAt && t.completedAt)
      .map((t) => (new Date(t.completedAt) - new Date(t.createdAt)) / 60000);
    const avgMin = durations.length
      ? Math.round(durations.reduce((s, m) => s + m, 0) / durations.length)
      : 0;
    const overdue = tasks.filter(
      (t) => !t.completed && t.dueDate && new Date(t.dueDate) < new Date(today)
    ).length;
    return { completedToday: completedToday.length, avgMin, overdue };
  }, [tasks]);

  const workspaceLabel = activeWorkspace
    ? `${CATEGORY_ICONS[activeWorkspace] || '📋'} ${activeWorkspace.charAt(0).toUpperCase()}${activeWorkspace.slice(1)}`
    : 'All';

  return (
    <div className="summary-dashboard">
      <div className="summary-card">
        <span className="summary-label">Workspace</span>
        <strong className="summary-value">{workspaceLabel}</strong>
      </div>
      <div className="summary-card">
        <span className="summary-label">✅ Tasks Today</span>
        <strong className="summary-value">{stats.completedToday}</strong>
      </div>
      <div className="summary-card">
        <span className="summary-label">⏱️ Avg Time</span>
        <strong className="summary-value">{stats.avgMin} min</strong>
      </div>
      <div className={`summary-card ${stats.overdue > 0 ? 'summary-card-alert' : ''}`}>
        <span className="summary-label">⚠️ Overdue</span>
        <strong className="summary-value">{stats.overdue}</strong>
      </div>
    </div>
  );
};

export default SummaryDashboard;
