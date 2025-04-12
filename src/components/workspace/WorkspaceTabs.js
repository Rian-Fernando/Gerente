import React from 'react';

const tabInfo = {
  Personal: { icon: '🏠', color: '#007bff' },
  Work: { icon: '💼', color: '#e63946' },
  School: { icon: '🎓', color: '#f39c12' },
  Fitness: { icon: '💪', color: '#2ecc71' },
  Other: { icon: '📁', color: '#95a5a6' }
};

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
            transition: 'all 0.3s ease',
            borderLeft: activeWorkspace === tab ? `6px solid ${tabInfo[tab].color}` : '6px solid transparent',
            paddingLeft: '10px',
          }}
        >
          <span style={{ marginRight: '6px' }}>{tabInfo[tab].icon}</span>
          <span>{tab}</span>
        </button>
      ))}
    </div>
  );
};

export default WorkspaceTabs;