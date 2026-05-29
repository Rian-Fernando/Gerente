import React from 'react';
import { Link } from 'react-router-dom';
import useDocumentMeta from '../hooks/useDocumentMeta';

const NotFound = () => {
  useDocumentMeta({
    title: 'Page not found — Gerente',
    description: 'The page you are looking for does not exist.',
    path: '/',
    noindex: true,
  });

  return (
    <div className="notfound-page" style={{ textAlign: 'center', padding: '60px 20px' }}>
      <h1 style={{ fontSize: '72px', margin: 0, color: 'var(--brand-accent, #E25A3C)' }}>404</h1>
      <p style={{ fontSize: '20px', color: 'var(--text-secondary, #555)' }}>
        Oops! The page you're looking for doesn't exist.
      </p>
      <Link
        to="/"
        style={{
          display: 'inline-block',
          marginTop: '20px',
          padding: '10px 20px',
          background: 'var(--accent, #1a73e8)',
          color: '#fff',
          borderRadius: '8px',
          textDecoration: 'none',
          fontWeight: 600,
        }}
      >
        ← Back to tasks
      </Link>
      <p style={{ marginTop: '40px', fontSize: '13px', color: 'var(--text-tertiary, #86868b)' }}>
        <a href="https://rianfernando.com" rel="author" target="_blank">
          Built by Rian Fernando
        </a>
      </p>
    </div>
  );
};

export default NotFound;
