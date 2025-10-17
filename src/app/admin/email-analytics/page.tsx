"use client";

import { useState, useEffect } from "react";

interface EmailMetrics {
  totalEmails: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  complained: number;
  openRate: number;
  clickRate: number;
  recentEvents: EmailEvent[];
}

interface EmailEvent {
  id: string;
  type: string;
  email: string;
  timestamp: string;
  messageId?: string;
}

export default function EmailAnalyticsPage() {
  const [metrics, setMetrics] = useState<EmailMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const response = await fetch("/api/admin/email-metrics");
      if (!response.ok) throw new Error("Failed to fetch metrics");
      const data = await response.json();
      setMetrics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow">
                  <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-red-800 font-semibold mb-2">Error Loading Analytics</h2>
            <p className="text-red-600">{error}</p>
            <button 
              onClick={fetchMetrics}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Email Analytics</h1>
          <button 
            onClick={fetchMetrics}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
        </div>

        {metrics && (
          <>
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <MetricCard 
                title="Total Emails" 
                value={metrics.totalEmails} 
                color="blue"
              />
              <MetricCard 
                title="Delivered" 
                value={metrics.delivered} 
                color="green"
                percentage={metrics.totalEmails > 0 ? (metrics.delivered / metrics.totalEmails * 100) : 0}
              />
              <MetricCard 
                title="Opened" 
                value={metrics.opened} 
                color="purple"
                percentage={metrics.openRate}
              />
              <MetricCard 
                title="Clicked" 
                value={metrics.clicked} 
                color="orange"
                percentage={metrics.clickRate}
              />
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Engagement Rates</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Open Rate</span>
                      <span>{metrics.openRate.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(metrics.openRate, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Click Rate</span>
                      <span>{metrics.clickRate.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(metrics.clickRate, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Delivery Issues</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bounced</span>
                    <span className={`font-semibold ${metrics.bounced > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {metrics.bounced}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Complained</span>
                    <span className={`font-semibold ${metrics.complained > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {metrics.complained}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Events */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold">Recent Email Events</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Event
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Message ID
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {metrics.recentEvents.length > 0 ? (
                      metrics.recentEvents.map((event) => (
                        <tr key={event.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <EventBadge type={event.type} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {event.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(event.timestamp).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                            {event.messageId ? event.messageId.substring(0, 8) + '...' : '-'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                          No email events yet. Send some emails to see analytics here!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: number;
  color: 'blue' | 'green' | 'purple' | 'orange';
  percentage?: number;
}

function MetricCard({ title, value, color, percentage }: MetricCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    orange: 'bg-orange-50 text-orange-700 border-orange-200'
  };

  return (
    <div className={`p-6 rounded-lg border ${colorClasses[color]}`}>
      <h3 className="text-sm font-medium opacity-75 mb-2">{title}</h3>
      <div className="flex items-baseline">
        <p className="text-2xl font-bold">{value.toLocaleString()}</p>
        {percentage !== undefined && (
          <span className="ml-2 text-sm opacity-75">
            ({percentage.toFixed(1)}%)
          </span>
        )}
      </div>
    </div>
  );
}

function EventBadge({ type }: { type: string }) {
  const badgeClasses = {
    delivered: 'bg-green-100 text-green-800',
    opened: 'bg-purple-100 text-purple-800',
    clicked: 'bg-orange-100 text-orange-800',
    bounced: 'bg-red-100 text-red-800',
    complained: 'bg-red-100 text-red-800'
  };

  const className = badgeClasses[type as keyof typeof badgeClasses] || 'bg-gray-100 text-gray-800';

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${className}`}>
      {type}
    </span>
  );
}
