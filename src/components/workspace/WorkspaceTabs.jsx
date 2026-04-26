import React from 'react';
import { CATEGORY_LABELS, CATEGORY_COLORS, CATEGORY_KEYS } from '../../constants/themes';
import './WorkspaceTabs.css';

const WorkspaceTabs = ({ activeWorkspace, onChangeWorkspace, taskCounts = {} }) => {
  return (
    <nav className="workspace-tabs" aria-label="Workspace categories">
      {CATEGORY_KEYS.map((key) => {
        const isActive = activeWorkspace === key;
        const count = taskCounts[key] || 0;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChangeWorkspace(key)}
            className={`workspace-tab ${isActive ? 'active' : ''}`}
            aria-pressed={isActive}
          >
            <span
              className="workspace-tab-dot"
              style={{ backgroundColor: CATEGORY_COLORS[key] }}
              aria-hidden="true"
            />
            <span className="workspace-tab-label">{CATEGORY_LABELS[key]}</span>
            {count > 0 && <span className="workspace-tab-count">{count}</span>}
          </button>
        );
      })}
    </nav>
  );
};

export default WorkspaceTabs;
