const PRIORITY_RANK = { high: 3, medium: 2, low: 1 };

export const SORT_OPTIONS = [
  { value: 'default', label: 'Default' },
  { value: 'priority', label: 'Priority' },
  { value: 'dueDate', label: 'Due Date' },
  { value: 'completed', label: 'Completion' },
  { value: 'az', label: 'A-Z' },
];

export const sortTasks = (tasks, sortOption) => {
  const copy = [...tasks];
  switch (sortOption) {
    case 'priority':
      return copy.sort((a, b) => (PRIORITY_RANK[b.priority] ?? 0) - (PRIORITY_RANK[a.priority] ?? 0));
    case 'dueDate':
      return copy.sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      });
    case 'completed':
      return copy.sort((a, b) => Number(a.completed) - Number(b.completed));
    case 'az':
      return copy.sort((a, b) => a.text.localeCompare(b.text));
    default:
      return copy;
  }
};
