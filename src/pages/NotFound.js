import React from 'react';

const NotFound = () => {
  return (
    <div style={{
      textAlign: "center",
      padding: "60px 20px",
      fontFamily: "Arial, sans-serif"
    }}>
      <h1 style={{ fontSize: "48px", color: "#e63946" }}>404</h1>
      <p style={{ fontSize: "20px", color: "#555" }}>
        Oops! The page you're looking for doesn't exist.
      </p>
      <a href="/" style={{ color: "#1d3557", textDecoration: "underline" }}>
        Go back home
      </a>
    </div>
  );
};

export default NotFound;
