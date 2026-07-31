/**
 * Date helpers.
 *
 * Everything here works in the user's LOCAL timezone. Due dates come from an
 * <input type="date">, which yields a bare `YYYY-MM-DD` string — and passing
 * that to `new Date()` parses it as UTC midnight, not local midnight. West of
 * UTC that lands on the previous day, so a date picked as Jan 1 rendered as
 * Dec 31 and a task due today was reported overdue. Parse date-only strings
 * explicitly instead of letting the Date constructor guess.
 */

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/** Parse a value into a Date, treating bare `YYYY-MM-DD` as local midnight. */
export const parseDate = (value) => {
  if (value instanceof Date) return value;
  if (typeof value === 'string' && DATE_ONLY.test(value)) {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
  }
  return new Date(value);
};

/** Today as a local `YYYY-MM-DD` string, directly comparable to an input value. */
export const todayISO = () => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
};

/** Whole days from today to a due date: negative is overdue, 0 is due today. */
export const daysUntil = (dueDate, today = todayISO()) =>
  Math.round((parseDate(dueDate) - parseDate(today)) / 86400000);

export const formatDate = (dateString) => {
  const date = parseDate(dateString);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export default formatDate;
