import React from 'react';
import { SORT_OPTIONS } from '../../features/taskSorting';
import './SortTasks.css';

const SortTasks = ({ sortMethod, onChangeSort }) => {
  return (
    <div className="sort-tasks">
      <label htmlFor="sort-select" className="sort-tasks-label">
        Sort by:
      </label>
      <select
        id="sort-select"
        value={sortMethod}
        onChange={(e) => onChangeSort(e.target.value)}
        className="sort-tasks-select"
      >
        {SORT_OPTIONS.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SortTasks;
