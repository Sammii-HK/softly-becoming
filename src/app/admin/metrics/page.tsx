'use client';

import { useEffect, useState } from 'react';

interface MetricsData {
  countFree: number;
  countPaid: number;
  events: { delivered: number; opened: number; clicked: number };
}

export default function Metrics() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/metrics')
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setMetrics(data);
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <main className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-2xl mb-6">Email metrics (last 7 days)</h1>
        <div className="text-center py-8">Loading...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-2xl mb-6">Email metrics (last 7 days)</h1>
        <div className="text-center py-8 text-red-600">Error: {error}</div>
      </main>
    );
  }

  if (!metrics) {
    return (
      <main className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-2xl mb-6">Email metrics (last 7 days)</h1>
        <div className="text-center py-8">No data available</div>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl mb-6">Email metrics (last 7 days)</h1>
      <div className="grid grid-cols-2 gap-4">
        <Card title="Active free"> {metrics.countFree} </Card>
        <Card title="Active paid"> {metrics.countPaid} </Card>
        <Card title="Delivered"> {metrics.events.delivered || 0} </Card>
        <Card title="Opened"> {metrics.events.opened || 0} </Card>
        <Card title="Clicked"> {metrics.events.clicked || 0} </Card>
      </div>
    </main>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border rounded p-4">
      <div className="text-sm opacity-70">{title}</div>
      <div className="text-2xl">{children}</div>
    </div>
  );
}
