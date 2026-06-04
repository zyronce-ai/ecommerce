'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getToken } from '@/lib/use-api';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    fetch(`${API}/api/admin/stats`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setStats).catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold sm:text-2xl">Dashboard</h1>
      {stats ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card><CardHeader className="p-4"><CardTitle className="text-sm">Total Users</CardTitle></CardHeader><CardContent className="p-4 pt-0"><p className="text-2xl font-bold">{stats.users}</p></CardContent></Card>
          <Card><CardHeader className="p-4"><CardTitle className="text-sm">Total Orders</CardTitle></CardHeader><CardContent className="p-4 pt-0"><p className="text-2xl font-bold">{stats.orders}</p></CardContent></Card>
          <Card><CardHeader className="p-4"><CardTitle className="text-sm">Total Products</CardTitle></CardHeader><CardContent className="p-4 pt-0"><p className="text-2xl font-bold">{stats.products}</p></CardContent></Card>
          <Card><CardHeader className="p-4"><CardTitle className="text-sm">Revenue</CardTitle></CardHeader><CardContent className="p-4 pt-0"><p className="text-2xl font-bold">₹{stats.revenue?.toLocaleString()}</p></CardContent></Card>
        </div>
      ) : (
        <p className="text-muted-foreground">Loading stats...</p>
      )}
    </div>
  );
}
