import React, { lazy, Suspense, useEffect, useMemo, useState, useCallback } from 'react';
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
import AuthSheet from './components/auth/AuthSheet';
import UserMenu from './components/auth/UserMenu';
import PWAUpdatePrompt from './components/pwa/PWAUpdatePrompt';
import FeedexBridge from './components/FeedexBridge';
import useTaskManager from './hooks/useTaskManager';
import useAuth from './hooks/useAuth';
import useLocalStorage from './hooks/useLocalStorage';
import useToast from './hooks/useToast';
import useDocumentMeta from './hooks/useDocumentMeta';
import { sortTasks } from './features/taskSorting';
import { getInitialDarkMode, persistDarkMode, applyDarkModeClass } from './features/darkMode';
import { CATEGORY_KEYS, CATEGORY_COLORS, CATEGORY_LABELS } from './constants/themes';
import { APP_VERSION, APP_YEAR } from './constants/appInfo';
import { AUDIENCE, AUTHOR_NAME, AUTHOR_URL, REPO_URL } from './constants/siteInfo';
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
  useDocumentMeta({
    title: 'Your tasks — Gerente',
    description:
      'The Gerente task board: group tasks into workspaces, set priorities and due dates, reorder by drag and drop, and run a Pomodoro timer on whatever you are working on right now.',
    path: '/app',
  });
  const auth = useAuth();
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
  } = useTaskManager(auth.user);

  const [workspace, setWorkspace] = useLocalStorage('gerente.workspace', 'personal');
  const [sortOption, setSortOption] = useLocalStorage('gerente.sortOption', 'default');
  const [darkMode, setDarkMode] = useState(getInitialDarkMode);
  const [pomodoroTask, setPomodoroTask] = useState(null);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const { toasts, showToast, dismiss } = useToast();

  useEffect(() => {
    if (auth.user && showAuth) setShowAuth(false);
  }, [auth.user, showAuth]);

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

  const doneCount = useMemo(
    () => filteredTasks.filter((t) => t.completed).length,
    [filteredTasks]
  );
  const openCount = filteredTasks.length - doneCount;

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
          <Link to="/" className="app-brand-link" aria-label="Gerente home">
            <span className="app-brand-lockup">
              <GerenteLogo size={32} variant="lockup" title="Gerente" />
            </span>
          </Link>
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
          <UserMenu auth={auth} onSignInClick={() => setShowAuth(true)} />
        </div>
      </header>

      <main>
        {/* Workspace first: it is the primary navigation, and everything below
            is scoped to whichever one is selected. */}
        <WorkspaceTabs
          activeWorkspace={workspace}
          onChangeWorkspace={setWorkspace}
          taskCounts={taskCounts}
        />

        <SummaryDashboard tasks={tasks} activeWorkspace={workspace} />

        <TaskInput onAddTask={handleAddTask} defaultCategory={workspace} />

        {/* Sort and clear sit directly on the list they act on, rather than
            above the composer where they read as part of adding a task. */}
        <div className="board-toolbar">
          <h2 className="board-toolbar__title">
            <span
              className="board-toolbar__dot"
              style={{ backgroundColor: CATEGORY_COLORS[workspace] }}
              aria-hidden="true"
            />
            {CATEGORY_LABELS[workspace]}
            <span className="board-toolbar__count">
              {openCount} open{doneCount > 0 ? ` · ${doneCount} done` : ''}
            </span>
          </h2>
          <div className="board-toolbar__actions">
            <SortTasks sortMethod={sortOption} onChangeSort={setSortOption} />
            <button
              type="button"
              className="clear-completed-btn"
              onClick={handleClearCompleted}
              disabled={doneCount === 0}
              title={
                doneCount === 0
                  ? 'Nothing completed in this workspace yet'
                  : 'Clear completed tasks in this workspace'
              }
            >
              Clear completed
            </button>
          </div>
        </div>

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
      </main>

      <PomodoroTimer
        task={pomodoroTask}
        onClose={() => setPomodoroTask(null)}
        onComplete={(task) => showToast(`Nice work on "${task.text}". Take a break.`, 'success')}
      />

      <Toast toasts={toasts} onDismiss={dismiss} />

      <AuthSheet
        open={showAuth}
        onClose={() => setShowAuth(false)}
        auth={auth}
        onSuccess={() => {
          setShowAuth(false);
          showToast('Signed in. Tasks now sync to the cloud.', 'success');
        }}
      />

      {showShortcuts && (
        <div className="shortcuts-modal" role="dialog" aria-modal="true" aria-labelledby="shortcuts-heading">
          <div className="shortcuts-backdrop" onClick={() => setShowShortcuts(false)} />
          <div className="shortcuts-content">
            <h2 id="shortcuts-heading">Keyboard shortcuts</h2>
            <ul>
              <li><kbd>?</kbd> Toggle this help</li>
              <li><kbd>D</kbd> Toggle dark mode</li>
              <li><kbd>Enter</kbd> Add task / save edit</li>
              <li><kbd>Esc</kbd> Cancel edit / close Pomodoro / close this</li>
              <li><kbd>Space</kbd> Start / pause Pomodoro</li>
            </ul>
            {/* Autofocused so Esc and Tab have somewhere sensible to start,
                and so focus is not left behind on the page underneath. */}
            <button
              type="button"
              autoFocus
              onClick={() => setShowShortcuts(false)}
              className="shortcuts-close"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      <footer className="app-footer">
        Gerente {APP_VERSION} © {APP_YEAR} · <Link to="/">Home</Link> ·{' '}
        <Link to="/about">About</Link> ·{' '}
        <a href="https://rianfernando.com" rel="author noopener" target="_blank">
          Built by Rian Fernando
        </a>
      </footer>
    </div>
  );
};

const AboutPage = () => {
  useDocumentMeta({
    title: 'About Gerente — who built it and how it works',
    description:
      'Gerente is a free, offline-first task manager with workspaces, priorities, due dates and a built-in Pomodoro timer, built by Rian Fernando with React, Vite and Supabase.',
    path: '/about',
  });

  return (
    <div className="app-container prose-page">
      <nav aria-label="Breadcrumb" className="prose-page__nav">
        <Link to="/">← Gerente</Link>
      </nav>

      <main>
        <h1>About Gerente</h1>

        <p>
          Gerente (Portuguese for <em>manager</em>) is a free task manager for the web. It
          groups tasks into workspaces such as Personal, Work and School, ranks them by
          priority, tracks due dates, and includes a built-in Pomodoro timer, so the plan
          for the day and the focus session live in the same place.
        </p>

        <h2>Who it is for</h2>
        <p>
          {AUDIENCE} It is deliberately small: there are no boards, no assignees and no
          integrations to configure before it becomes useful.
        </p>

        <h2>How your data is stored</h2>
        <p>
          Signed out, tasks are kept in your browser’s local storage and never leave the
          device. Signing in is optional; it moves tasks to a Supabase Postgres database
          protected by row-level security policies, so an account can only ever read and
          write its own rows. Gerente is a progressive web app, so it installs to the dock
          or home screen and keeps working with no network connection.
        </p>
        <p>
          The feedback button loads{' '}
          <a href="https://feedex.rianfernando.com" rel="noopener" target="_blank">Feedex</a>,
          my own open-source feedback tool. It sends nothing unless you write something and
          submit it, and it never has access to your tasks — a report carries only the page
          you sent it from, the app version, and your email if you happen to be signed in.
        </p>

        <h2>How it is built</h2>
        <p>
          Gerente is a React 19 single-page app bundled with Vite 8, with a three.js scene
          on the landing page, Supabase for optional auth and sync, Workbox for the offline
          service worker, and Vitest and GitHub Actions for tests and CI. The full source
          is on <a href={REPO_URL} rel="noopener" target="_blank">GitHub</a> under the MIT
          licence, along with a log of the architecture decisions behind it.
        </p>

        <p className="prose-page__back">
          <Link to="/app">Open the task board →</Link>
        </p>
      </main>

      <footer className="app-footer">
        <Link to="/">Home</Link> ·{' '}
        <a href={REPO_URL} rel="noopener" target="_blank">Source</a> ·{' '}
        <a href={AUTHOR_URL} rel="author noopener" target="_blank">
          Built by {AUTHOR_NAME}
        </a>
      </footer>
    </div>
  );
};

// Split out so the task board never downloads the landing page's three.js scene.
const Landing = lazy(() => import('./pages/Landing'));

/**
 * Everything below the router. Exported separately so tests can mount the real
 * app inside a MemoryRouter — nesting one router inside another throws.
 */
export const AppRoutes = () => (
  <>
    <Suspense fallback={null}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/app" element={<TaskManagerPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
    <PWAUpdatePrompt />
    <FeedexBridge />
  </>
);

const App = () => (
  <Router>
    <AppRoutes />
  </Router>
);

export default App;
