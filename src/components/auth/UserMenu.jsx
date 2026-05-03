import React, { useEffect, useRef, useState } from 'react';
import './UserMenu.css';

const initialFor = (user) => {
  const name = user?.user_metadata?.name || user?.email || '';
  return name.charAt(0).toUpperCase() || '?';
};

const UserMenu = ({ auth, onSignInClick }) => {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  if (!auth.isConfigured) return null;

  if (!auth.user) {
    return (
      <button type="button" className="user-signin-btn" onClick={onSignInClick}>
        Sign in
      </button>
    );
  }

  return (
    <div className="user-menu-wrap" ref={wrapRef}>
      <button
        type="button"
        className="user-avatar"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
      >
        {initialFor(auth.user)}
      </button>
      {open && (
        <div className="user-menu" role="menu">
          <div className="user-menu-email" title={auth.user.email}>
            {auth.user.email}
          </div>
          <button
            type="button"
            className="user-menu-item"
            role="menuitem"
            onClick={async () => {
              setOpen(false);
              await auth.signOut();
            }}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
