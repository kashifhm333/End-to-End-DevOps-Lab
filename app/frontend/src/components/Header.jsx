import React, { useState, useEffect } from 'react';

/**
 * Site Header component.
 * Provides accessible navigation, mobile hamburger drawer, and smooth section scrolling.
 */
export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  const handleNavClick = (e, targetId) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
      // Update window URL hash without jumping
      window.history.pushState(null, '', `#${targetId}`);
    }
  };

  return (
    <header className="site-header" role="banner">
      <div className="header-container">
        <a
          href="#hero"
          className="brand-logo"
          onClick={(e) => handleNavClick(e, 'hero')}
          aria-label="DevOps Starter Home"
        >
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
          <span className="brand-text">DevOps Starter</span>
        </a>

        {/* Desktop Navigation */}
        <nav className="desktop-nav" aria-label="Main Navigation">
          <ul className="nav-list">
            <li>
              <a
                href="#hero"
                className="nav-link"
                onClick={(e) => handleNavClick(e, 'hero')}
              >
                Home
              </a>
            </li>
            <li>
              <a
                href="#status"
                className="nav-link"
                onClick={(e) => handleNavClick(e, 'status')}
              >
                System Status
              </a>
            </li>
            <li>
              <a
                href="#database"
                className="nav-link"
                onClick={(e) => handleNavClick(e, 'database')}
              >
                Database
              </a>
            </li>
            <li>
              <a
                href="#about"
                className="nav-link"
                onClick={(e) => handleNavClick(e, 'about')}
              >
                About
              </a>
            </li>
          </ul>
        </nav>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          className="mobile-menu-toggle"
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-nav"
          aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <svg
              viewBox="0 0 24 24"
              width="22"
              height="22"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg
              viewBox="0 0 24 24"
              width="22"
              height="22"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Navigation Drawer */}
      <nav
        id="mobile-nav"
        className={`mobile-nav ${mobileMenuOpen ? 'open' : ''}`}
        aria-label="Mobile Navigation"
        aria-hidden={!mobileMenuOpen}
      >
        <ul className="mobile-nav-list">
          <li>
            <a
              href="#hero"
              className="mobile-nav-link"
              onClick={(e) => handleNavClick(e, 'hero')}
            >
              Home
            </a>
          </li>
          <li>
            <a
              href="#status"
              className="mobile-nav-link"
              onClick={(e) => handleNavClick(e, 'status')}
            >
              System Status
            </a>
          </li>
          <li>
            <a
              href="#database"
              className="mobile-nav-link"
              onClick={(e) => handleNavClick(e, 'database')}
            >
              Database
            </a>
          </li>
          <li>
            <a
              href="#about"
              className="mobile-nav-link"
              onClick={(e) => handleNavClick(e, 'about')}
            >
              About
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
}

