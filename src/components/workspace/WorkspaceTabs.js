import React from 'react';
import { CATEGORY_ICONS, CATEGORY_COLORS } from '../../constants/themes';
import './WorkspaceTabs.css';

const WorkspaceTabs = ({ activeWorkspace, onChangeWorkspace, taskCounts = {} }) => {
  return (
    <nav className="workspace-tabs" aria-label="Workspace categories">
      {Object.keys(CATEGORY_ICONS).map((key) => {
        const isActive = activeWorkspace === key;
        const count = taskCounts[key] || 0;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChangeWorkspace(key)}
            className={`workspace-tab ${isActive ? 'active' : ''}`}
            style={isActive ? { borderLeftColor: CATEGORY_COLORS[key] } : undefined}
            aria-pressed={isActive}
          >
            <span className="workspace-tab-icon">{CATEGORY_ICONS[key]}</span>
            <span className="workspace-tab-label">
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </span>
            {count > 0 && <span className="workspace-tab-count">{count}</span>}
          </button>
        );
      })}
    </nav>
  );
};

export default WorkspaceTabs;
