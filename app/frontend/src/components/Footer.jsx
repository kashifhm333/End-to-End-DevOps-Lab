import React from 'react';

/**
 * Site Footer component.
 * Displays application identity, copyright year, and architectural summary.
 */
export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer" role="contentinfo">
      <div className="footer-container">
        <div className="footer-brand">
          <div className="footer-logo">
            <svg
              className="brand-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="4 17 10 11 4 5" />
              <line x1="12" y1="19" x2="20" y2="19" />
            </svg>
            <span className="footer-title">DevOps Starter</span>
          </div>
          <p className="footer-summary">
            A production-grade, decoupled full-stack architecture built for reliable local development and continuous delivery.
          </p>
        </div>

        <div className="footer-meta">
          <p className="footer-copyright">
            &copy; {currentYear} DevOps Starter. All rights reserved.
          </p>
          <p className="footer-tech">
            React &bull; Vite &bull; Express.js &bull; Node.js
          </p>
        </div>
      </div>
    </footer>
  );
}

