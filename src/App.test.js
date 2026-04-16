import { sortTasks } from './features/taskSorting';
import { formatDate } from './helpers/formatDate';

describe('sortTasks', () => {
  const tasks = [
    { id: '1', text: 'Banana', priority: 'low', completed: false, dueDate: '2026-05-10' },
    { id: '2', text: 'Apple', priority: 'high', completed: true, dueDate: '2026-04-20' },
    { id: '3', text: 'Cherry', priority: 'medium', completed: false, dueDate: '' },
  ];

  test('sorts by priority (high → low)', () => {
    const sorted = sortTasks(tasks, 'priority');
    expect(sorted.map((t) => t.priority)).toEqual(['high', 'medium', 'low']);
  });

  test('sorts alphabetically', () => {
    const sorted = sortTasks(tasks, 'az');
    expect(sorted.map((t) => t.text)).toEqual(['Apple', 'Banana', 'Cherry']);
  });

  test('sorts by completion (incomplete first)', () => {
    const sorted = sortTasks(tasks, 'completed');
    expect(sorted[sorted.length - 1].completed).toBe(true);
  });

  test('sorts by due date (earliest first, blanks last)', () => {
    const sorted = sortTasks(tasks, 'dueDate');
    expect(sorted.map((t) => t.id)).toEqual(['2', '1', '3']);
  });

  test('default returns original order', () => {
    const sorted = sortTasks(tasks, 'default');
    expect(sorted.map((t) => t.id)).toEqual(['1', '2', '3']);
  });

  test('does not mutate the input array', () => {
    const original = [...tasks];
    sortTasks(tasks, 'priority');
    expect(tasks).toEqual(original);
  });
});

describe('formatDate', () => {
  test('formats ISO date to readable format', () => {
    const result = formatDate('2026-04-20');
    expect(result).toMatch(/Apr/);
    expect(result).toMatch(/2026/);
  });
});
