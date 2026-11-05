import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App.jsx';

describe('DevOps Starter Frontend Application', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    // Mock scrollIntoView
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders main page, hero section, and navigation successfully', async () => {
    global.fetch = vi.fn().mockImplementation(() =>
      new Promise(() => {}) // pending
    );

    render(<App />);

    // Brand and Navigation
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getAllByText('DevOps Starter').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Home').length).toBeGreaterThan(0);
    expect(screen.getAllByText('System Status').length).toBeGreaterThan(0);
    expect(screen.getAllByText('About').length).toBeGreaterThan(0);

    // Hero Section
    expect(
      screen.getByRole('heading', { name: /your application, connected\./i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/a simple demonstration of frontend and backend communication\./i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /check system status/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /learn more/i })
    ).toBeInTheDocument();
  });

  it('renders all three status cards', async () => {
    global.fetch = vi.fn().mockImplementation(() =>
      new Promise(() => {}) // pending
    );

    render(<App />);

    expect(screen.getByText('Frontend Status')).toBeInTheDocument();
    expect(screen.getByText('Backend API Status')).toBeInTheDocument();
    expect(screen.getByText('Application Status')).toBeInTheDocument();
  });

  it('displays loading state during initial or active API check', async () => {
    global.fetch = vi.fn().mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 500))
    );

    render(<App />);

    expect(screen.getByText(/checking\.\.\./i)).toBeInTheDocument();
    expect(screen.getByText(/checking health\.\.\./i)).toBeInTheDocument();
  });

  it('displays successful backend health response', async () => {
    const mockHealthPayload = {
      success: true,
      status: 'healthy',
      service: 'devops-starter-backend',
      timestamp: '2026-11-05T08:00:00.000Z',
      uptime: 45.67
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockHealthPayload
    });

    render(<App />);

    // Wait for async update
    await waitFor(() => {
      expect(screen.getByText('Connected')).toBeInTheDocument();
    });

    expect(screen.getByText('All Systems Operational')).toBeInTheDocument();
    expect(screen.getByText('2 of 2 Online')).toBeInTheDocument();
    expect(screen.getByText('45.67 s')).toBeInTheDocument();
    expect(screen.getAllByText(/devops-starter-backend/).length).toBeGreaterThan(0);
  });

  it('displays error state when backend API request fails', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Failed to fetch'));

    render(<App />);

    // Wait for failure
    await waitFor(() => {
      expect(screen.getByText('Disconnected')).toBeInTheDocument();
    });

    expect(screen.getByText('Degraded - Backend Offline')).toBeInTheDocument();
    expect(screen.getByText('1 of 2 Online')).toBeInTheDocument();
    expect(screen.getByText('Connection Failure')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry connection/i })).toBeInTheDocument();
  });

  it('allows manual retry after connection failure', async () => {
    // First call fails
    global.fetch = vi.fn().mockRejectedValueOnce(new Error('Failed to fetch'));

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Disconnected')).toBeInTheDocument();
    });

    // Second call succeeds
    const mockHealthPayload = {
      success: true,
      status: 'healthy',
      service: 'devops-starter-backend',
      timestamp: '2026-11-05T08:00:00.000Z',
      uptime: 100
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockHealthPayload
    });

    const retryButton = screen.getByRole('button', { name: /retry connection/i });
    fireEvent.click(retryButton);

    await waitFor(() => {
      expect(screen.getByText('Connected')).toBeInTheDocument();
    });
    expect(screen.getByText('All Systems Operational')).toBeInTheDocument();
  });
});
