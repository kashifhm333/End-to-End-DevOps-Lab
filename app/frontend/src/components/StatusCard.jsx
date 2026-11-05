import React from 'react';

/**
 * Reusable StatusCard component for displaying system telemetry and health metrics.
 *
 * @param {object} props
 * @param {string} props.title - Card title
 * @param {string} props.statusText - Text displayed on the status pill badge
 * @param {'healthy' | 'warning' | 'danger' | 'loading' | 'neutral'} props.variant - Visual variant of the status badge
 * @param {string} [props.description] - Description or status summary
 * @param {Array<{label: string, value: string | number}>} [props.metrics] - Key metrics to display
 * @param {React.ReactNode} [props.icon] - Semantic SVG icon
 * @param {React.ReactNode} [props.children] - Additional child content
 */
export default function StatusCard({
  title,
  statusText,
  variant = 'neutral',
  description,
  metrics = [],
  icon,
  children
}) {
  return (
    <article className={`status-card status-card--${variant}`}>
      <div className="status-card__header">
        <div className="status-card__title-wrap">
          {icon && <span className="status-card__icon" aria-hidden="true">{icon}</span>}
          <h3 className="status-card__title">{title}</h3>
        </div>
        <div className={`status-pill status-pill--${variant}`} role="status">
          <span className="status-pill__dot" aria-hidden="true" />
          <span className="status-pill__label">{statusText}</span>
        </div>
      </div>

      {description && <p className="status-card__desc">{description}</p>}

      {metrics.length > 0 && (
        <dl className="status-card__metrics">
          {metrics.map((item, idx) => (
            <div key={idx} className="metric-row">
              <dt className="metric-label">{item.label}</dt>
              <dd className="metric-value">{item.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {children}
    </article>
  );
}

