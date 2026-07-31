import React from 'react';
import { render, screen, within, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AppRoutes } from './App';
import { todayISO, formatDate, daysUntil, parseDate } from './helpers/formatDate';

/**
 * End-to-end coverage of the actual task workflow, driven through the real UI
 * the way a person uses it: add a task, complete it, edit it, reorder the
 * workspace, run the timer, clear finished work.
 *
 * Everything runs in local-storage mode (no Supabase env vars in tests), which
 * is the default experience for a visitor with no account.
 */

const renderApp = (path = '/app') =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
    </MemoryRouter>
  );

const addTask = async (user, text) => {
  const field = screen.getByLabelText('Task description');
  await user.clear(field);
  await user.type(field, text);
  await user.click(screen.getByRole('button', { name: /add task/i }));
};

beforeEach(() => {
  localStorage.clear();
  document.title = 'Gerente';
});

describe('creating tasks', () => {
  test('a new task appears in the list', async () => {
    const user = userEvent.setup();
    renderApp();
    await addTask(user, 'Write the report');
    expect(screen.getByText('Write the report')).toBeInTheDocument();
  });

  test('the composer clears and refocuses, ready for the next one', async () => {
    const user = userEvent.setup();
    renderApp();
    await addTask(user, 'First task');
    const field = screen.getByLabelText('Task description');
    expect(field).toHaveValue('');
    expect(field).toHaveFocus();
  });

  test('Enter submits without reaching for the button', async () => {
    const user = userEvent.setup();
    renderApp();
    await user.type(screen.getByLabelText('Task description'), 'Typed and entered{Enter}');
    expect(screen.getByText('Typed and entered')).toBeInTheDocument();
  });

  test('empty and whitespace-only input is rejected', async () => {
    const user = userEvent.setup();
    renderApp();
    const addButton = screen.getByRole('button', { name: /add task/i });
    expect(addButton).toBeDisabled();

    await user.type(screen.getByLabelText('Task description'), '   ');
    expect(addButton).toBeDisabled();
  });

  test('tasks survive a reload via localStorage', async () => {
    const user = userEvent.setup();
    const { unmount } = renderApp();
    await addTask(user, 'Persist me');
    unmount();

    renderApp();
    expect(await screen.findByText('Persist me')).toBeInTheDocument();
  });
});

describe('workspaces', () => {
  test('a task added after switching workspaces lands in the one on screen', async () => {
    const user = userEvent.setup();
    renderApp();

    // Regression: the composer's workspace select kept its mount-time value, so
    // this task was filed under Personal and vanished from the Work list.
    await user.click(screen.getByRole('button', { name: /^Work/ }));
    await addTask(user, 'Quarterly review');

    expect(screen.getByText('Quarterly review')).toBeInTheDocument();
  });

  test('each workspace only shows its own tasks', async () => {
    const user = userEvent.setup();
    renderApp();

    await addTask(user, 'Personal errand');
    await user.click(screen.getByRole('button', { name: /^Work/ }));
    await addTask(user, 'Work deliverable');

    expect(screen.getByText('Work deliverable')).toBeInTheDocument();
    expect(screen.queryByText('Personal errand')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /^Personal/ }));
    expect(screen.getByText('Personal errand')).toBeInTheDocument();
    expect(screen.queryByText('Work deliverable')).not.toBeInTheDocument();
  });

  test('the tab shows a count of open tasks', async () => {
    const user = userEvent.setup();
    renderApp();
    await addTask(user, 'One');
    await addTask(user, 'Two');

    const personalTab = screen.getByRole('button', { name: /^Personal/ });
    expect(within(personalTab).getByText('2')).toBeInTheDocument();
  });
});

describe('completing and clearing', () => {
  test('checking a task marks it complete and updates the count', async () => {
    const user = userEvent.setup();
    renderApp();
    await addTask(user, 'Finish me');

    await user.click(screen.getByRole('checkbox', { name: /mark finish me as complete/i }));

    expect(
      screen.getByRole('checkbox', { name: /mark finish me as incomplete/i })
    ).toBeChecked();
    expect(screen.getByText(/1 done/)).toBeInTheDocument();
  });

  test('clear completed removes only finished tasks', async () => {
    const user = userEvent.setup();
    renderApp();
    await addTask(user, 'Done task');
    await addTask(user, 'Open task');

    await user.click(screen.getByRole('checkbox', { name: /mark done task as complete/i }));
    await user.click(screen.getByRole('button', { name: /clear completed/i }));

    expect(screen.queryByText('Done task')).not.toBeInTheDocument();
    expect(screen.getByText('Open task')).toBeInTheDocument();
  });

  test('clear completed is disabled when nothing is finished', async () => {
    const user = userEvent.setup();
    renderApp();
    await addTask(user, 'Still going');
    expect(screen.getByRole('button', { name: /clear completed/i })).toBeDisabled();
  });
});

describe('editing and deleting', () => {
  test('clicking a task lets you rename it', async () => {
    const user = userEvent.setup();
    renderApp();
    await addTask(user, 'Old name');

    await user.click(screen.getByText('Old name'));
    const editField = screen.getByDisplayValue('Old name');
    await user.clear(editField);
    await user.type(editField, 'New name{Enter}');

    expect(screen.getByText('New name')).toBeInTheDocument();
    expect(screen.queryByText('Old name')).not.toBeInTheDocument();
  });

  test('Escape abandons an edit and keeps the original text', async () => {
    const user = userEvent.setup();
    renderApp();
    await addTask(user, 'Keep me');

    await user.click(screen.getByText('Keep me'));
    const editField = screen.getByDisplayValue('Keep me');
    await user.clear(editField);
    await user.type(editField, 'Discarded{Escape}');

    expect(screen.getByText('Keep me')).toBeInTheDocument();
  });

  test('deleting removes the task', async () => {
    const user = userEvent.setup();
    renderApp();
    await addTask(user, 'Delete me');

    await user.click(screen.getByRole('button', { name: /delete delete me/i }));
    expect(screen.queryByText('Delete me')).not.toBeInTheDocument();
  });
});

describe('the Pomodoro timer', () => {
  test('starts on a specific task and shows the default focus length', async () => {
    const user = userEvent.setup();
    renderApp();
    await addTask(user, 'Deep work');

    await user.click(screen.getByRole('button', { name: /start pomodoro/i }));

    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('Deep work')).toBeInTheDocument();
    expect(within(dialog).getByRole('timer')).toHaveTextContent('25:00');
  });

  test('stays accurate when a background tab fires no ticks at all', async () => {
    const user = userEvent.setup();
    renderApp();
    await addTask(user, 'Timed work');
    await user.click(screen.getByRole('button', { name: /start pomodoro/i }));

    // Advance the wall clock without letting a single interval callback run —
    // exactly what a throttled background tab does. A counter that decremented
    // once per tick would still read 25:00 here; a deadline-based one is right.
    const realNow = Date.now;
    let skew = 0;
    const nowSpy = vi.spyOn(Date, 'now').mockImplementation(() => realNow() + skew);
    try {
      await user.click(screen.getByRole('button', { name: 'Start' }));
      skew = 90_000;

      // Returning to the foreground forces the recompute.
      await act(async () => {
        document.dispatchEvent(new Event('visibilitychange'));
      });

      expect(screen.getByRole('timer')).toHaveTextContent('23:30');
    } finally {
      nowSpy.mockRestore();
    }
  });

  test('mirrors the countdown into the tab title, then restores it on close', async () => {
    const user = userEvent.setup();
    renderApp();
    const titleBeforeTimer = document.title;
    await addTask(user, 'Tab title task');

    await user.click(screen.getByRole('button', { name: /start pomodoro/i }));
    expect(document.title).toBe('25:00 • Tab title task');

    await user.click(screen.getByRole('button', { name: 'Close' }));
    // Regression: this used to restore a hard-coded string that no longer
    // matched any route's title.
    expect(document.title).toBe(titleBeforeTimer);
  });

  test('opening it for another task starts a fresh focus session', async () => {
    const user = userEvent.setup();
    renderApp();
    await addTask(user, 'Task A');
    await addTask(user, 'Task B');

    const [timerA, timerB] = screen.getAllByRole('button', { name: /start pomodoro/i });

    await user.click(timerA);
    await user.click(screen.getByRole('button', { name: 'Reset' }));
    await user.click(screen.getByRole('button', { name: 'Close' }));

    await user.click(timerB);
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('Task B')).toBeInTheDocument();
    expect(within(dialog).getByRole('timer')).toHaveTextContent('25:00');
    expect(within(dialog).getByRole('button', { name: 'Start' })).toBeInTheDocument();
  });

  test('Escape closes the dialog', async () => {
    const user = userEvent.setup();
    renderApp();
    await addTask(user, 'Escapable');

    await user.click(screen.getByRole('button', { name: /start pomodoro/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

describe('due dates', () => {
  test('a date renders as the day the user picked, not the day before', () => {
    // Regression: `new Date('2026-01-01')` is UTC midnight, which is Dec 31
    // anywhere west of Greenwich.
    expect(formatDate('2026-01-01')).toMatch(/Jan 1, 2026/);
    expect(formatDate('2026-07-31')).toMatch(/Jul 31, 2026/);
  });

  test('date-only strings parse to local midnight', () => {
    const parsed = parseDate('2026-03-15');
    expect(parsed.getFullYear()).toBe(2026);
    expect(parsed.getMonth()).toBe(2);
    expect(parsed.getDate()).toBe(15);
    expect(parsed.getHours()).toBe(0);
  });

  test('todayISO matches the local calendar day', () => {
    const now = new Date();
    const [year, month, day] = todayISO().split('-').map(Number);
    expect(year).toBe(now.getFullYear());
    expect(month).toBe(now.getMonth() + 1);
    expect(day).toBe(now.getDate());
  });

  test('a task due today is not overdue', () => {
    expect(daysUntil(todayISO())).toBe(0);
    expect(todayISO() < todayISO()).toBe(false);
  });

  test('daysUntil counts whole days in both directions', () => {
    expect(daysUntil('2026-03-15', '2026-03-13')).toBe(2);
    expect(daysUntil('2026-03-11', '2026-03-13')).toBe(-2);
  });
});

describe('navigation', () => {
  test('the task board links back to the landing page and About', () => {
    renderApp();
    expect(screen.getByRole('link', { name: /gerente home/i })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: /^about$/i })).toHaveAttribute('href', '/about');
  });

  test('an unknown route renders the not-found page', () => {
    renderApp('/nope');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/does not exist/i);
  });
});
