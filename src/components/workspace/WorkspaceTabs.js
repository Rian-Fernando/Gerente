

import React from 'react';

const tabs = ['Personal', 'Work', 'School', 'Fitness', 'Other'];

const WorkspaceTabs = ({ activeWorkspace, setActiveWorkspace }) => {
  return (
    <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveWorkspace(tab)}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            fontWeight: 'bold',
            backgroundColor: activeWorkspace === tab ? '#1d3557' : '#f1f1f1',
            color: activeWorkspace === tab ? '#fff' : '#333',
            cursor: 'pointer',
            boxShadow: activeWorkspace === tab ? '0 2px 6px rgba(0,0,0,0.2)' : 'none',
            transition: 'all 0.3s ease'
          }}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};

export default WorkspaceTabs;