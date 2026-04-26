import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import TaskInput from './components/TaskInput';
import TaskList from './components/TaskList';
import PomodoroTimer from './components/PomodoroTimer';
import Toast from './components/Toast';
import WorkspaceTabs from './components/workspace/WorkspaceTabs';
import SortTasks from './components/sort/SortTasks';
import SummaryDashboard from './components/summary/SummaryDashboard';
import NotFound from './pages/NotFound';
import GerenteLogo from './components/brand/GerenteLogo';
import useTaskManager from './hooks/useTaskManager';
import useLocalStorage from './hooks/useLocalStorage';
import useToast from './hooks/useToast';
import { sortTasks } from './features/taskSorting';
import { getInitialDarkMode, persistDarkMode, applyDarkModeClass } from './features/darkMode';
import { CATEGORY_KEYS } from './constants/themes';
import { APP_VERSION, APP_YEAR } from './constants/appInfo';
import './styles/AppContainer.css';

const SunIcon = (props) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
  </svg>
);

const MoonIcon = (props) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
  </svg>
);

const KeyboardIcon = (props) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <rect x="2.5" y="6" width="19" height="12" rx="2.5" />
    <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M6 14h.01M18 14h.01M9 14h6" />
  </svg>
);

const TaskManagerPage = () => {
  const {
    tasks,
    addTask,
    toggleComplete,
    deleteTask,
    editTask,
    saveTask,
    cancelEdit,
    reorderTasks,
    clearCompleted,
  } = useTaskManager();

  const [workspace, setWorkspace] = useLocalStorage('gerente.workspace', 'personal');
  const [sortOption, setSortOption] = useLocalStorage('gerente.sortOption', 'default');
  const [darkMode, setDarkMode] = useState(getInitialDarkMode);
  const [pomodoroTask, setPomodoroTask] = useState(null);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const { toasts, showToast, dismiss } = useToast();

  useEffect(() => {
    applyDarkModeClass(darkMode);
    persistDarkMode(darkMode);
  }, [darkMode]);

  const handleAddTask = useCallback(
    (text, priority, category, dueDate) => {
      const success = addTask(text, priority, category, dueDate);
      if (success) showToast('Task added', 'success');
      return success;
    },
    [addTask, showToast]
  );

  const handleDeleteTask = useCallback(
    (id) => {
      deleteTask(id);
      showToast('Task deleted', 'info');
    },
    [deleteTask, showToast]
  );

  const handleToggleComplete = useCallback(
    (id) => {
      const task = tasks.find((t) => t.id === id);
      toggleComplete(id);
      if (task && !task.completed) showToast('Task completed', 'success');
    },
    [tasks, toggleComplete, showToast]
  );

  const handleStartPomodoro = useCallback(
    (task) => {
      setPomodoroTask(task);
      showToast(`Pomodoro started for "${task.text}"`, 'info');
    },
    [showToast]
  );

  const handleClearCompleted = useCallback(() => {
    const completedCount = tasks.filter((t) => t.completed && t.category === workspace).length;
    if (completedCount === 0) {
      showToast('No completed tasks to clear', 'info');
      return;
    }
    clearCompleted(workspace);
    showToast(`Cleared ${completedCount} completed task${completedCount > 1 ? 's' : ''}`, 'success');
  }, [tasks, workspace, clearCompleted, showToast]);

  const taskCounts = useMemo(() => {
    const counts = {};
    for (const key of CATEGORY_KEYS) counts[key] = 0;
    for (const task of tasks) {
      if (!task.completed && counts[task.category] !== undefined) {
        counts[task.category]++;
      }
    }
    return counts;
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    const scoped = tasks.filter((t) => t.category === workspace);
    return sortTasks(scoped, sortOption);
  }, [tasks, workspace, sortOption]);

  const handleReorderTasks = useCallback(
    (reorderedVisible) => {
      if (sortOption !== 'default') {
        showToast('Switch to Default sort to reorder tasks', 'warning');
        return;
      }
      reorderTasks(workspace, reorderedVisible);
    },
    [sortOption, workspace, reorderTasks, showToast]
  );

  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
        return;
      }
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        setShowShortcuts((s) => !s);
      } else if (e.key.toLowerCase() === 'd' && !e.metaKey && !e.ctrlKey) {
        setDarkMode((d) => !d);
      } else if (e.key === 'Escape' && showShortcuts) {
        setShowShortcuts(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [showShortcuts]);

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">
          <span className="app-brand-lockup">
            <GerenteLogo size={32} variant="lockup" title="Gerente" />
          </span>
          <span className="app-subtitle">Task Manager</span>
        </h1>
        <div className="app-actions">
          <button
            type="button"
            className="icon-action"
            onClick={() => setShowShortcuts(true)}
            title="Keyboard shortcuts (?)"
            aria-label="Show keyboard shortcuts"
          >
            <KeyboardIcon />
          </button>
          <button
            type="button"
            className="icon-action"
            onClick={() => setDarkMode((d) => !d)}
            title="Toggle theme (D)"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
      </header>

      <SummaryDashboard tasks={tasks} activeWorkspace={workspace} />

      <WorkspaceTabs
        activeWorkspace={workspace}
        onChangeWorkspace={setWorkspace}
        taskCounts={taskCounts}
      />

      <div className="toolbar">
        <SortTasks sortMethod={sortOption} onChangeSort={setSortOption} />
        <button
          type="button"
          className="clear-completed-btn"
          onClick={handleClearCompleted}
          title="Clear completed tasks in this workspace"
        >
          Clear completed
        </button>
      </div>

      <TaskInput onAddTask={handleAddTask} defaultCategory={workspace} />

      <TaskList
        tasks={filteredTasks}
        workspace={workspace}
        onDeleteTask={handleDeleteTask}
        onToggleComplete={handleToggleComplete}
        onEditTask={editTask}
        onSaveTask={saveTask}
        onCancelEdit={cancelEdit}
        onReorderTasks={handleReorderTasks}
        onStartPomodoro={handleStartPomodoro}
      />

      <PomodoroTimer
        task={pomodoroTask}
        onClose={() => setPomodoroTask(null)}
        onComplete={(task) => showToast(`Nice work on "${task.text}". Take a break.`, 'success')}
      />

      <Toast toasts={toasts} onDismiss={dismiss} />

      {showShortcuts && (
        <div className="shortcuts-modal" role="dialog" aria-modal="true" aria-label="Keyboard shortcuts">
          <div className="shortcuts-backdrop" onClick={() => setShowShortcuts(false)} />
          <div className="shortcuts-content">
            <h3>Keyboard Shortcuts</h3>
            <ul>
              <li><kbd>?</kbd> Toggle this help</li>
              <li><kbd>D</kbd> Toggle dark mode</li>
              <li><kbd>Enter</kbd> Add task / Save edit</li>
              <li><kbd>Esc</kbd> Cancel edit / Close Pomodoro / Close this</li>
              <li><kbd>Space</kbd> Start / pause Pomodoro</li>
            </ul>
            <button type="button" onClick={() => setShowShortcuts(false)} className="shortcuts-close">
              Got it
            </button>
          </div>
        </div>
      )}

      <footer className="app-footer">
        Gerente {APP_VERSION} © {APP_YEAR} · <Link to="/about">About</Link>
      </footer>
    </div>
  );
};

const AboutPage = () => (
  <div className="app-container">
    <h1>About Gerente</h1>
    <p style={{ color: 'var(--text-secondary, #555)', lineHeight: 1.6 }}>
      Gerente (Portuguese for "Manager") is a simple, focused task manager with workspaces,
      priorities, drag-and-drop ordering, and a built-in Pomodoro timer. Data persists in your
      browser — no account required.
    </p>
    <p>
      <Link to="/">← Back to tasks</Link>
    </p>
  </div>
);

const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<TaskManagerPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </Router>
);

export default App;
