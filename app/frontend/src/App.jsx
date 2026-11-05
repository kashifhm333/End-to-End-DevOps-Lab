import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import StatusCard from './components/StatusCard.jsx';
import Footer from './components/Footer.jsx';
import { checkHealth, getApiBaseUrl, fetchItems, createItem, deleteItem } from './services/api.js';

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

  // MongoDB items state
  const [items, setItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [itemsError, setItemsError] = useState(null);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [submittingItem, setSubmittingItem] = useState(false);

  // Active AbortController ref to cancel inflight requests
  const abortControllerRef = useRef(null);
  const itemsAbortRef = useRef(null);

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
   * Load records from MongoDB
   */
  const loadMongoItems = useCallback(async () => {
    if (itemsAbortRef.current) {
      itemsAbortRef.current.abort();
    }
    const controller = new AbortController();
    itemsAbortRef.current = controller;

    setItemsLoading(true);
    setItemsError(null);

    const result = await fetchItems(controller.signal);

    if (controller.signal.aborted) return;

    setItemsLoading(false);
    if (result.success) {
      setItems(result.data);
    } else {
      setItemsError(result.error);
    }
  }, []);

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

      // If database is connected according to health response, reload items
      if (result.data?.database?.status === 'connected') {
        loadMongoItems();
      }
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
  }, [healthState.loading, loadMongoItems]);

  // Initial health check and items load on mount
  useEffect(() => {
    handleCheckConnection();
    loadMongoItems();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (itemsAbortRef.current) {
        itemsAbortRef.current.abort();
      }
    };
  }, []);

  /**
   * Create a new item in MongoDB
   */
  const handleCreateItem = async (e) => {
    e.preventDefault();
    if (!newItemTitle.trim() || submittingItem) return;

    setSubmittingItem(true);
    setItemsError(null);

    const result = await createItem({
      title: newItemTitle.trim(),
      description: newItemDesc.trim()
    });

    setSubmittingItem(false);

    if (result.success) {
      setNewItemTitle('');
      setNewItemDesc('');
      loadMongoItems();
    } else {
      setItemsError(result.error);
    }
  };

  /**
   * Delete an item from MongoDB
   */
  const handleDeleteItem = async (id) => {
    const result = await deleteItem(id);
    if (result.success) {
      setItems((prev) => prev.filter((item) => item._id !== id));
    } else {
      setItemsError(result.error);
    }
  };

  // Compute status details
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

  // Database status
  const dbStatus = healthState.data?.database?.status || 'disconnected';
  const isDbConnected = isBackendHealthy && dbStatus === 'connected';

  const dbStatusText = isBackendLoading
    ? 'Checking...'
    : isBackendError
    ? 'Unreachable'
    : isDbConnected
    ? 'Connected'
    : 'Disconnected';

  const dbVariant = isBackendLoading
    ? 'loading'
    : isDbConnected
    ? 'healthy'
    : 'warning';

  // Overall application composite status
  const appStatusText = isBackendLoading
    ? 'Checking Health...'
    : !isBackendHealthy
    ? 'Degraded - Backend Offline'
    : !isDbConnected
    ? 'Degraded - Database Offline'
    : 'All Systems Operational';

  const appVariant = isBackendLoading
    ? 'loading'
    : isBackendHealthy && isDbConnected
    ? 'healthy'
    : 'danger';

  const servicesOnlineCount = (1 /* frontend */) + (isBackendHealthy ? 1 : 0) + (isDbConnected ? 1 : 0);

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
                Live health indicators verifying frontend, backend API, and MongoDB availability.
              </p>
            </div>

            {/* Status Cards Grid */}
            <div className="status-grid status-grid--four">
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
                description={`REST API service at ${getApiBaseUrl()}/api/health.`}
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

              {/* 3. MongoDB Database Status Card */}
              <StatusCard
                title="Database Status"
                statusText={dbStatusText}
                variant={dbVariant}
                description="MongoDB document store for persistent record management."
                metrics={[
                  { label: 'Database Type', value: 'MongoDB / Mongoose' },
                  { label: 'Connection State', value: dbStatus },
                  { label: 'CRUD Service', value: isDbConnected ? 'Active' : 'Offline' }
                ]}
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <ellipse cx="12" cy="5" rx="9" ry="3" />
                    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                  </svg>
                }
              />

              {/* 4. Overall Application Status Card */}
              <StatusCard
                title="Application Status"
                statusText={appStatusText}
                variant={appVariant}
                description="Composite health determined by real-time end-to-end communication."
                metrics={[
                  { label: 'Services Healthy', value: `${servicesOnlineCount} of 3 Online` },
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
                    Dispatch live HTTP GET request to test backend reachability, database status, and inspect payload.
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
                  <span className="meta-label">API Status:</span>
                  <span className={`badge-pill badge-pill--${backendVariant}`}>
                    {healthState.loading ? 'Requesting...' : healthState.status ? `HTTP ${healthState.status}` : 'Connection Failed'}
                  </span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">MongoDB:</span>
                  <span className={`badge-pill badge-pill--${dbVariant}`}>
                    {isDbConnected ? 'Connected' : dbStatus}
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

        {/* DATABASE (MONGODB) FUNCTIONALITY SECTION */}
        <section id="database" className="database-section" aria-labelledby="database-heading">
          <div className="section-container">
            <div className="section-header">
              <span className="section-eyebrow">Database Integration</span>
              <h2 id="database-heading" className="section-title">
                MongoDB Records &amp; Storage
              </h2>
              <p className="section-subtitle">
                Demonstrating persistent document storage via Mongoose ODM and REST API endpoints.
              </p>
            </div>

            {/* MongoDB Connection Status Alert / Info */}
            <div className={`db-status-banner db-status-banner--${isDbConnected ? 'connected' : 'disconnected'}`}>
              <div className="db-status-banner__icon">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <ellipse cx="12" cy="5" rx="9" ry="3" />
                  <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                  <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                </svg>
              </div>
              <div className="db-status-banner__content">
                <strong>
                  {isDbConnected
                    ? 'MongoDB Connection Active'
                    : 'MongoDB Instance Currently Disconnected'}
                </strong>
                <p>
                  {isDbConnected
                    ? 'Records created below are persistently stored in the configured MongoDB database.'
                    : 'The backend is running in resilient degraded mode without an active MongoDB connection. Start MongoDB locally or provide a valid MONGODB_URI in app/backend/.env.'}
                </p>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={loadMongoItems}
                disabled={itemsLoading}
              >
                {itemsLoading ? 'Refreshing...' : 'Refresh Records'}
              </button>
            </div>

            {/* Interactive Form & Record List Grid */}
            <div className="db-layout-grid">
              {/* Add New Record Form */}
              <div className="db-card">
                <h3 className="db-card__title">Create MongoDB Record</h3>
                <p className="db-card__subtitle">
                  Sends a POST request to <code>/api/items</code> to insert a document.
                </p>

                <form onSubmit={handleCreateItem} className="db-form">
                  <div className="form-group">
                    <label htmlFor="record-title" className="form-label">
                      Title <span className="required-star">*</span>
                    </label>
                    <input
                      id="record-title"
                      type="text"
                      className="form-input"
                      placeholder="e.g. Deploy container to Kubernetes"
                      value={newItemTitle}
                      onChange={(e) => setNewItemTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="record-desc" className="form-label">
                      Description (Optional)
                    </label>
                    <textarea
                      id="record-desc"
                      className="form-textarea"
                      placeholder="e.g. Verified readiness probes and resource limits."
                      rows="3"
                      value={newItemDesc}
                      onChange={(e) => setNewItemDesc(e.target.value)}
                    />
                  </div>

                  {itemsError && (
                    <div className="form-error-alert" role="alert">
                      {itemsError}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submittingItem || !newItemTitle.trim()}
                  >
                    {submittingItem ? (
                      <>
                        <span className="spinner" aria-hidden="true" />
                        <span>Saving to MongoDB...</span>
                      </>
                    ) : (
                      <>
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <line x1="12" y1="5" x2="12" y2="19" />
                          <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        <span>Save Record to MongoDB</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Records List View */}
              <div className="db-card">
                <div className="db-card__header-bar">
                  <div>
                    <h3 className="db-card__title">Stored Records</h3>
                    <p className="db-card__subtitle">
                      Live records retrieved from <code>GET /api/items</code>.
                    </p>
                  </div>
                  <span className="badge-pill badge-pill--healthy">
                    {items.length} {items.length === 1 ? 'Record' : 'Records'}
                  </span>
                </div>

                <div className="records-container">
                  {itemsLoading && (
                    <div className="records-empty-state">
                      <span className="spinner" aria-hidden="true" />
                      <span>Loading records from database...</span>
                    </div>
                  )}

                  {!itemsLoading && items.length === 0 && (
                    <div className="records-empty-state">
                      <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="8" y1="12" x2="16" y2="12" />
                      </svg>
                      <p className="empty-title">No records stored yet</p>
                      <p className="empty-desc">
                        {isDbConnected
                          ? 'Use the form to create your first document in MongoDB.'
                          : 'Connect a MongoDB instance to start saving and viewing documents.'}
                      </p>
                    </div>
                  )}

                  {!itemsLoading && items.length > 0 && (
                    <ul className="records-list" aria-label="MongoDB Records">
                      {items.map((item) => (
                        <li key={item._id} className="record-item">
                          <div className="record-item__info">
                            <h4 className="record-item__title">{item.title}</h4>
                            {item.description && (
                              <p className="record-item__desc">{item.description}</p>
                            )}
                            <div className="record-item__meta">
                              <span className="record-id">ID: {item._id}</span>
                              <span className="record-date">
                                {new Date(item.createdAt).toLocaleString()}
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            className="btn-icon-danger"
                            title="Delete Record"
                            aria-label={`Delete record ${item.title}`}
                            onClick={() => handleDeleteItem(item._id)}
                          >
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
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
                  DevOps Starter serves as a baseline full-stack template featuring independent React frontend, Node.js/Express backend, and MongoDB document storage organized in a clean monorepo. It isolates business concerns and provides live health telemetry.
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
                <h3 className="about-card__title">React, Express &amp; MongoDB</h3>
                <p className="about-card__text">
                  The frontend interacts with Express using asynchronous Fetch API calls through a centralized service layer. Express communicates with MongoDB through Mongoose ODM, with graceful degradation when the database is unavailable.
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
                  A standardized <code>/api/health</code> endpoint serves as a liveness and readiness probe for container orchestrators. It dynamically reports process uptime, ISO timestamps, and database connectivity.
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
