import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'gerente.tasks';

const loadTasks = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const createId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

export const useTaskManager = () => {
  const [tasks, setTasks] = useState(loadTasks);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch {
      // Storage may be full or unavailable (private mode); silently skip.
    }
  }, [tasks]);

  const addTask = useCallback((text, priority, category, dueDate) => {
    const trimmed = text.trim();
    if (!trimmed) return false;
    const now = new Date().toISOString();
    setTasks((prev) => [
      ...prev,
      {
        id: createId(),
        text: trimmed,
        completed: false,
        isEditing: false,
        priority: priority || 'medium',
        category: category || 'personal',
        dueDate: dueDate || '',
        createdAt: now,
        completedAt: null,
      },
    ]);
    return true;
  }, []);

  const toggleComplete = useCallback((id) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== id) return task;
        const completed = !task.completed;
        return {
          ...task,
          completed,
          completedAt: completed ? new Date().toISOString() : null,
        };
      })
    );
  }, []);

  const deleteTask = useCallback((id) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  }, []);

  const editTask = useCallback((id) => {
    setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, isEditing: true } : task)));
  }, []);

  const saveTask = useCallback((id, newText) => {
    const trimmed = newText.trim();
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, text: trimmed || task.text, isEditing: false } : task
      )
    );
  }, []);

  const cancelEdit = useCallback((id) => {
    setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, isEditing: false } : task)));
  }, []);

  const reorderTasks = useCallback((workspace, reorderedVisible) => {
    setTasks((prev) => {
      const others = prev.filter((task) => task.category !== workspace);
      return [...others, ...reorderedVisible];
    });
  }, []);

  const clearCompleted = useCallback((workspace) => {
    setTasks((prev) =>
      prev.filter((task) => !(task.completed && (!workspace || task.category === workspace)))
    );
  }, []);

  return {
    tasks,
    addTask,
    toggleComplete,
    deleteTask,
    editTask,
    saveTask,
    cancelEdit,
    reorderTasks,
    clearCompleted,
  };
};

export default useTaskManager;
