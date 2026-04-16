import React from 'react';
import './Toast.css';

const Toast = ({ toasts, onDismiss }) => {
  if (!toasts.length) return null;

  return (
    <div className="toast-stack" role="status" aria-live="polite">
      {toasts.map(({ id, message, type }) => (
        <div key={id} className={`toast toast-${type}`} onClick={() => onDismiss(id)}>
          <span>{message}</span>
          <button
            className="toast-close"
            aria-label="Dismiss notification"
            onClick={(e) => {
              e.stopPropagation();
              onDismiss(id);
            }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

export default Toast;
