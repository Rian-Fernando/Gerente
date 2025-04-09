// Component: SortTasks.js
// UI dropdown to select sort method for tasks

import React from 'react';

const SortTasks = ({ sortMethod, onChangeSort }) => {
  return (
    <div style={{ marginBottom: "15px" }}>
      <label htmlFor="sort" style={{ fontWeight: "bold" }}>Sort tasks by: </label>
      <select
        id="sort"
        value={sortMethod}
        onChange={(e) => onChangeSort(e.target.value)}
        style={{ padding: "4px 8px", borderRadius: "5px", marginLeft: "8px" }}
      >
        <option value="none">Default</option>
        <option value="priority">Priority</option>
        <option value="az">A-Z</option>
        <option value="completed">Completed status</option>
      </select>
    </div>
  );
};

export default SortTasks;
