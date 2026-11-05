import React from 'react';

/**
 * Hero Section component.
 * Displays primary value proposition and call-to-actions.
 *
 * @param {object} props
 * @param {() => void} [props.onCheckStatus] Callback when user clicks primary CTA
 */
export default function Hero({ onCheckStatus }) {
  const handleScrollToStatus = (e) => {
    e.preventDefault();
    const statusSection = document.getElementById('status');
    if (statusSection) {
      statusSection.scrollIntoView({ behavior: 'smooth' });
    }
    if (onCheckStatus) {
      onCheckStatus();
    }
  };

  const handleScrollToAbout = (e) => {
    e.preventDefault();
    const aboutSection = document.getElementById('about');
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="hero" className="hero-section" aria-labelledby="hero-heading">
      <div className="hero-container">
        <div className="hero-badge">
          <span className="badge-dot" aria-hidden="true" />
          <span>Production-Ready Decoupled Architecture</span>
        </div>

        <h1 id="hero-heading" className="hero-title">
          Your Application, Connected.
        </h1>

        <p className="hero-description">
          A simple demonstration of frontend and backend communication.
        </p>

        <div className="hero-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleScrollToStatus}
          >
            Check System Status
          </button>
          <a
            href="#about"
            className="btn btn-secondary"
            onClick={handleScrollToAbout}
          >
            Learn More
          </a>
        </div>
      </div>
    </section>
  );
}

