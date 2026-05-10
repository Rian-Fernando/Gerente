import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import './PWAUpdatePrompt.css';

const PWAUpdatePrompt = () => {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl) {
      // Hint to the dev console only; nothing user-facing.
      console.info('[pwa] service worker registered:', swUrl);
    },
    onRegisterError(error) {
      console.error('[pwa] service worker registration failed:', error);
    },
  });

  if (!needRefresh && !offlineReady) return null;

  const dismiss = () => {
    setNeedRefresh(false);
    setOfflineReady(false);
  };

  return (
    <div className="pwa-toast" role="status" aria-live="polite">
      <div className="pwa-toast-message">
        {needRefresh
          ? 'A new version of Gerente is available.'
          : 'Gerente is ready to work offline.'}
      </div>
      <div className="pwa-toast-actions">
        {needRefresh && (
          <button
            type="button"
            className="pwa-toast-btn pwa-toast-btn-primary"
            onClick={() => updateServiceWorker(true)}
          >
            Reload
          </button>
        )}
        <button type="button" className="pwa-toast-btn" onClick={dismiss}>
          {needRefresh ? 'Later' : 'Dismiss'}
        </button>
      </div>
    </div>
  );
};

export default PWAUpdatePrompt;
