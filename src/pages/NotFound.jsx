import React from 'react';
import { Link } from 'react-router-dom';
import useDocumentMeta from '../hooks/useDocumentMeta';
import { AUTHOR_NAME, AUTHOR_URL } from '../constants/siteInfo';

const NotFound = () => {
  useDocumentMeta({
    title: 'Page not found — Gerente',
    description: 'This page does not exist on Gerente. Head back to the task board or the home page.',
    path: '/',
    noindex: true,
  });

  return (
    <div className="app-container notfound-page">
      <main style={{ textAlign: 'center', padding: '60px 20px' }}>
        {/* The big "404" is decoration — the real heading is the sentence below,
            so screen readers and crawlers get a meaningful h1. */}
        <p
          aria-hidden="true"
          style={{ fontSize: '72px', margin: 0, fontWeight: 700, lineHeight: 1, color: 'var(--brand-accent, #E25A3C)' }}
        >
          404
        </p>
        <h1 style={{ fontSize: '26px', margin: '12px 0' }}>This page does not exist</h1>
        <p style={{ fontSize: '17px', color: 'var(--text-secondary, #555)' }}>
          The link may be out of date. Everything still lives one click away.
        </p>
        <p
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            justifyContent: 'center',
            marginTop: '26px',
          }}
        >
          <Link
            to="/app"
            style={{
              padding: '10px 20px',
              background: 'var(--brand-accent, #E25A3C)',
              color: '#fff',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            Go to your tasks
          </Link>
          <Link
            to="/"
            style={{ padding: '10px 20px', borderRadius: '8px', fontWeight: 600 }}
          >
            Back to home
          </Link>
        </p>
      </main>

      <footer
        style={{
          marginTop: '40px',
          fontSize: '13px',
          textAlign: 'center',
          color: 'var(--text-tertiary, #86868b)',
        }}
      >
        <a href={AUTHOR_URL} rel="author noopener" target="_blank">
          Built by {AUTHOR_NAME}
        </a>
      </footer>
    </div>
  );
};

export default NotFound;
