import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import StatusCard from './components/StatusCard.jsx';
import Footer from './components/Footer.jsx';
import { checkHealth, getApiBaseUrl } from './services/api.js';

export default function App() {
  // Health check state
  const [healthState, setHealthState] = useState({
    loading: false,
    error: null,
    data: null,
    responseTimeMs: null,
    status: null,
    lastChecked: null
  });

  // Client session uptime (seconds elapsed since page mount)
  const [clientSeconds, setClientSeconds] = useState(0);

  // Active AbortController ref to cancel inflight requests
  const abortControllerRef = useRef(null);

  // Track client uptime
  useEffect(() => {
    const timer = setInterval(() => {
      setClientSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  /**
   * Format client seconds into mm:ss or hh:mm:ss
   */
  const formatUptime = (totalSeconds) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    if (hrs > 0) {
      return `${hrs}h ${mins}m ${secs}s`;
    }
    return `${mins}m ${secs}s`;
  };

  /**
   * Perform backend health check request
   */
  const handleCheckConnection = useCallback(async () => {
    // Prevent duplicate concurrent requests
    if (healthState.loading) return;

    // Abort previous in-flight request if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setHealthState((prev) => ({
      ...prev,
      loading: true,
      error: null
    }));

    const result = await checkHealth(controller.signal);

    // If request was aborted, do not update state
    if (controller.signal.aborted) return;

    if (result.success) {
      setHealthState({
        loading: false,
        error: null,
        data: result.data,
        responseTimeMs: result.responseTimeMs,
        status: result.status,
        lastChecked: new Date().toLocaleTimeString()
      });
    } else {
      setHealthState({
        loading: false,
        error: result.error,
        data: null,
        responseTimeMs: result.responseTimeMs,
        status: result.status,
        lastChecked: new Date().toLocaleTimeString()
      });
    }
  }, [healthState.loading]);

  // Initial health check on page mount
  useEffect(() => {
    handleCheckConnection();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Compute Backend Status Card details
  const isBackendHealthy = !healthState.loading && healthState.data && !healthState.error;
  const isBackendLoading = healthState.loading;
  const isBackendError = !healthState.loading && !!healthState.error;

  const backendStatusText = isBackendLoading
    ? 'Checking...'
    : isBackendHealthy
    ? 'Connected'
    : isBackendError
    ? 'Disconnected'
    : 'Unknown';

  const backendVariant = isBackendLoading
    ? 'loading'
    : isBackendHealthy
    ? 'healthy'
    : 'danger';

  // Compute Overall Application Status Card details
  const appStatusText = isBackendLoading
    ? 'Checking Health...'
    : isBackendHealthy
    ? 'All Systems Operational'
    : 'Degraded - Backend Offline';

  const appVariant = isBackendLoading
    ? 'loading'
    : isBackendHealthy
    ? 'healthy'
    : 'danger';

  return (
    <div className="app-layout">
      <Header />

      <main id="main-content" className="main-content">
        <Hero onCheckStatus={handleCheckConnection} />

        {/* SYSTEM STATUS SECTION */}
        <section id="status" className="status-section" aria-labelledby="status-heading">
          <div className="section-container">
            <div className="section-header">
              <span className="section-eyebrow">Real-Time Telemetry</span>
              <h2 id="status-heading" className="section-title">
                System Status
              </h2>
              <p className="section-subtitle">
                Live health indicators verifying independent frontend and backend availability.
              </p>
            </div>

            {/* Three Status Cards Grid */}
            <div className="status-grid">
              {/* 1. Frontend Status Card */}
              <StatusCard
                title="Frontend Status"
                statusText="Operational"
                variant="healthy"
                description="Client single-page application running in the browser."
                metrics={[
                  { label: 'Environment', value: 'Vite / React' },
                  { label: 'Client Uptime', value: formatUptime(clientSeconds) },
                  { label: 'Protocol', value: window.location.protocol.replace(':', '').toUpperCase() }
                ]}
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                    <line x1="8" y1="21" x2="16" y2="21" />
                    <line x1="12" y1="17" x2="12" y2="21" />
                  </svg>
                }
              />

              {/* 2. Backend API Status Card */}
              <StatusCard
                title="Backend API Status"
                statusText={backendStatusText}
                variant={backendVariant}
                description={`REST API endpoint at ${getApiBaseUrl()}/api/health.`}
                metrics={[
                  {
                    label: 'Service',
                    value: healthState.data?.service || (isBackendLoading ? 'Probing...' : 'Unreachable')
                  },
                  {
                    label: 'Response Time',
                    value: healthState.responseTimeMs !== null ? `${healthState.responseTimeMs} ms` : '—'
                  },
                  {
                    label: 'HTTP Status',
                    value: healthState.status ? `${healthState.status} ${healthState.status === 200 ? 'OK' : 'Error'}` : (isBackendLoading ? 'Connecting...' : 'No Response')
                  }
                ]}
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
                    <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
                    <line x1="6" y1="6" x2="6.01" y2="6" />
                    <line x1="6" y1="18" x2="6.01" y2="18" />
                  </svg>
                }
              />

              {/* 3. Overall Application Status Card */}
              <StatusCard
                title="Application Status"
                statusText={appStatusText}
                variant={appVariant}
                description="Composite health determined by real-time end-to-end communication."
                metrics={[
                  { label: 'Services Healthy', value: isBackendHealthy ? '2 of 2 Online' : '1 of 2 Online' },
                  { label: 'Server Uptime', value: healthState.data?.uptime ? `${healthState.data.uptime} s` : '—' },
                  { label: 'Last Verified', value: healthState.lastChecked || 'Pending' }
                ]}
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                }
              />
            </div>

            {/* API Connection Feature Interactive Panel */}
            <div className="connection-panel">
              <div className="connection-panel__header">
                <div>
                  <h3 className="connection-panel__title">API Health Check Control</h3>
                  <p className="connection-panel__subtitle">
                    Dispatch live HTTP GET request to test backend reachability and inspect response payload.
                  </p>
                </div>

                <div className="connection-panel__actions">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleCheckConnection}
                    disabled={healthState.loading}
                    aria-busy={healthState.loading}
                  >
                    {healthState.loading ? (
                      <>
                        <span className="spinner" aria-hidden="true" />
                        <span>Checking Connection...</span>
                      </>
                    ) : (
                      <>
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <polyline points="23 4 23 10 17 10" />
                          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                        </svg>
                        <span>Check Backend Connection</span>
                      </>
                    )}
                  </button>

                  {isBackendError && (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleCheckConnection}
                      disabled={healthState.loading}
                    >
                      Retry Connection
                    </button>
                  )}
                </div>
              </div>

              {/* Status and Diagnostics Banner */}
              <div className="connection-meta-bar">
                <div className="meta-item">
                  <span className="meta-label">Target URL:</span>
                  <code className="meta-code">{getApiBaseUrl()}/api/health</code>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Status:</span>
                  <span className={`badge-pill badge-pill--${backendVariant}`}>
                    {healthState.loading ? 'Requesting...' : healthState.status ? `HTTP ${healthState.status}` : 'Connection Failed'}
                  </span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Latency:</span>
                  <span className="meta-val">
                    {healthState.responseTimeMs !== null ? `${healthState.responseTimeMs} ms` : '—'}
                  </span>
                </div>
              </div>

              {/* Detailed Output Area */}
              <div className="response-display">
                <div className="response-display__header">
                  <span className="response-display__tab">HTTP Response Payload</span>
                  {healthState.lastChecked && (
                    <span className="response-display__timestamp">
                      Checked at {healthState.lastChecked}
                    </span>
                  )}
                </div>

                {healthState.loading && (
                  <div className="response-display__placeholder">
                    <span className="spinner" aria-hidden="true" />
                    <span>Communicating with backend server...</span>
                  </div>
                )}

                {!healthState.loading && isBackendError && (
                  <div className="response-display__error" role="alert">
                    <div className="error-header">
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      <strong>Connection Failure</strong>
                    </div>
                    <p className="error-body">{healthState.error}</p>
                    <div className="error-troubleshooting">
                      <p className="troubleshooting-title">Troubleshooting:</p>
                      <ul>
                        <li>Ensure the Express backend is running (<code>npm --prefix app/backend run dev</code>).</li>
                        <li>Verify that the backend is listening on port 5000.</li>
                        <li>Confirm <code>VITE_API_URL</code> matches your backend URL.</li>
                      </ul>
                    </div>
                  </div>
                )}

                {!healthState.loading && isBackendHealthy && healthState.data && (
                  <pre className="response-code-block" tabIndex="0">
                    <code>{JSON.stringify(healthState.data, null, 2)}</code>
                  </pre>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ABOUT SECTION */}
        <section id="about" className="about-section" aria-labelledby="about-heading">
          <div className="section-container">
            <div className="section-header">
              <span className="section-eyebrow">Architecture & Design</span>
              <h2 id="about-heading" className="section-title">
                About DevOps Starter
              </h2>
              <p className="section-subtitle">
                A clean demonstration of modern decoupled web architecture built for enterprise reliability.
              </p>
            </div>

            <div className="about-grid">
              <article className="about-card">
                <div className="about-card__icon-wrap">
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                  </svg>
                </div>
                <h3 className="about-card__title">What This Application Does</h3>
                <p className="about-card__text">
                  DevOps Starter serves as a baseline full-stack template featuring independent React frontend and Node.js/Express backend services organized in a clean monorepo. It isolates business concerns and provides live health telemetry.
                </p>
              </article>

              <article className="about-card">
                <div className="about-card__icon-wrap">
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="16 3 21 3 21 8" />
                    <line x1="4" y1="20" x2="21" y2="3" />
                    <polyline points="21 16 21 21 16 21" />
                    <line x1="15" y1="15" x2="21" y2="21" />
                    <line x1="4" y1="4" x2="9" y2="9" />
                  </svg>
                </div>
                <h3 className="about-card__title">React &amp; Express Communication</h3>
                <p className="about-card__text">
                  The frontend interacts with Express using standard asynchronous Fetch API calls through a centralized service layer. Requests utilize CORS preflight negotiation, environment-configured endpoints, and strict JSON data validation.
                </p>
              </article>

              <article className="about-card">
                <div className="about-card__icon-wrap">
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <h3 className="about-card__title">The Role of API Health Checks</h3>
                <p className="about-card__text">
                  A standardized <code>/api/health</code> endpoint serves as a liveness probe for monitoring tools and orchestrators. It dynamically outputs uptime, ISO timestamps, and status to confirm the backend service is ready to handle traffic.
                </p>
              </article>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

