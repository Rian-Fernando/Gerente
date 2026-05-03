import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';

const STORAGE_KEY = 'gerente.tasks';

const loadLocalTasks = () => {
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

const fromRow = (row) => ({
  id: row.id,
  text: row.text,
  completed: row.completed,
  isEditing: false,
  priority: row.priority,
  category: row.category,
  dueDate: row.due_date || '',
  createdAt: row.created_at,
  completedAt: row.completed_at,
  position: row.position,
});

const sortByPosition = (list) => [...list].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

export const useTaskManager = (user) => {
  const cloud = Boolean(user && supabase);
  const [tasks, setTasks] = useState(() => (cloud ? [] : loadLocalTasks()));
  const [loading, setLoading] = useState(cloud);
  const positionRef = useRef(0);

  // Persist to localStorage when in local mode.
  useEffect(() => {
    if (cloud) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch {
      // Storage may be full or unavailable (private mode); silently skip.
    }
  }, [tasks, cloud]);

  // Initial fetch + realtime subscription when signed in.
  useEffect(() => {
    if (!cloud) {
      setTasks(loadLocalTasks());
      setLoading(false);
      return undefined;
    }

    let active = true;
    setLoading(true);

    supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('position', { ascending: true })
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          console.error('Failed to load tasks', error);
          setTasks([]);
        } else {
          const mapped = data.map(fromRow);
          setTasks(mapped);
          positionRef.current = mapped.reduce((max, t) => Math.max(max, t.position || 0), 0);
        }
        setLoading(false);
      });

    const channel = supabase
      .channel(`tasks:${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks', filter: `user_id=eq.${user.id}` },
        (payload) => {
          setTasks((prev) => {
            if (payload.eventType === 'INSERT') {
              if (prev.some((t) => t.id === payload.new.id)) return prev;
              return sortByPosition([...prev, fromRow(payload.new)]);
            }
            if (payload.eventType === 'UPDATE') {
              return sortByPosition(
                prev.map((t) =>
                  t.id === payload.new.id ? { ...fromRow(payload.new), isEditing: t.isEditing } : t
                )
              );
            }
            if (payload.eventType === 'DELETE') {
              return prev.filter((t) => t.id !== payload.old.id);
            }
            return prev;
          });
        }
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [cloud, user?.id]);

  const addTask = useCallback(
    (text, priority, category, dueDate) => {
      const trimmed = text.trim();
      if (!trimmed) return false;
      const now = new Date().toISOString();

      if (cloud) {
        positionRef.current += 1;
        const optimistic = {
          id: createId(),
          text: trimmed,
          completed: false,
          isEditing: false,
          priority: priority || 'medium',
          category: category || 'personal',
          dueDate: dueDate || '',
          createdAt: now,
          completedAt: null,
          position: positionRef.current,
        };
        setTasks((prev) => [...prev, optimistic]);
        supabase
          .from('tasks')
          .insert({
            id: optimistic.id,
            user_id: user.id,
            text: optimistic.text,
            priority: optimistic.priority,
            category: optimistic.category,
            due_date: optimistic.dueDate || null,
            position: optimistic.position,
          })
          .then(({ error }) => {
            if (error) {
              console.error('Failed to add task', error);
              setTasks((prev) => prev.filter((t) => t.id !== optimistic.id));
            }
          });
        return true;
      }

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
    },
    [cloud, user?.id]
  );

  const toggleComplete = useCallback(
    (id) => {
      let snapshot;
      setTasks((prev) => {
        snapshot = prev;
        return prev.map((task) => {
          if (task.id !== id) return task;
          const completed = !task.completed;
          return {
            ...task,
            completed,
            completedAt: completed ? new Date().toISOString() : null,
          };
        });
      });

      if (!cloud) return;
      const target = snapshot.find((t) => t.id === id);
      if (!target) return;
      const completed = !target.completed;
      supabase
        .from('tasks')
        .update({
          completed,
          completed_at: completed ? new Date().toISOString() : null,
        })
        .eq('id', id)
        .then(({ error }) => {
          if (error) {
            console.error('Failed to toggle task', error);
            setTasks(snapshot);
          }
        });
    },
    [cloud]
  );

  const deleteTask = useCallback(
    (id) => {
      let snapshot;
      setTasks((prev) => {
        snapshot = prev;
        return prev.filter((task) => task.id !== id);
      });
      if (!cloud) return;
      supabase
        .from('tasks')
        .delete()
        .eq('id', id)
        .then(({ error }) => {
          if (error) {
            console.error('Failed to delete task', error);
            setTasks(snapshot);
          }
        });
    },
    [cloud]
  );

  const editTask = useCallback((id) => {
    setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, isEditing: true } : task)));
  }, []);

  const saveTask = useCallback(
    (id, newText) => {
      const trimmed = newText.trim();
      let snapshot;
      let nextText;
      setTasks((prev) => {
        snapshot = prev;
        return prev.map((task) => {
          if (task.id !== id) return task;
          nextText = trimmed || task.text;
          return { ...task, text: nextText, isEditing: false };
        });
      });

      if (!cloud || !nextText) return;
      supabase
        .from('tasks')
        .update({ text: nextText })
        .eq('id', id)
        .then(({ error }) => {
          if (error) {
            console.error('Failed to save task', error);
            setTasks(snapshot);
          }
        });
    },
    [cloud]
  );

  const cancelEdit = useCallback((id) => {
    setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, isEditing: false } : task)));
  }, []);

  const reorderTasks = useCallback(
    (workspace, reorderedVisible) => {
      let snapshot;
      let updates = [];
      setTasks((prev) => {
        snapshot = prev;
        const others = prev.filter((task) => task.category !== workspace);
        const maxOther = others.reduce((max, t) => Math.max(max, t.position || 0), 0);
        const repositioned = reorderedVisible.map((task, index) => ({
          ...task,
          position: maxOther + index + 1,
        }));
        updates = repositioned.map((t) => ({ id: t.id, position: t.position }));
        positionRef.current = Math.max(positionRef.current, maxOther + repositioned.length);
        return [...others, ...repositioned];
      });

      if (!cloud || updates.length === 0) return;
      Promise.all(
        updates.map(({ id, position }) =>
          supabase.from('tasks').update({ position }).eq('id', id)
        )
      ).then((results) => {
        const failed = results.find((r) => r.error);
        if (failed) {
          console.error('Failed to reorder tasks', failed.error);
          setTasks(snapshot);
        }
      });
    },
    [cloud]
  );

  const clearCompleted = useCallback(
    (workspace) => {
      let snapshot;
      let idsToDelete = [];
      setTasks((prev) => {
        snapshot = prev;
        const remaining = prev.filter(
          (task) => !(task.completed && (!workspace || task.category === workspace))
        );
        idsToDelete = prev
          .filter((task) => task.completed && (!workspace || task.category === workspace))
          .map((t) => t.id);
        return remaining;
      });

      if (!cloud || idsToDelete.length === 0) return;
      supabase
        .from('tasks')
        .delete()
        .in('id', idsToDelete)
        .then(({ error }) => {
          if (error) {
            console.error('Failed to clear completed tasks', error);
            setTasks(snapshot);
          }
        });
    },
    [cloud]
  );

  return {
    tasks,
    loading,
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
