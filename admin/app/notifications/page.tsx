'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Send, Users, Bell } from 'lucide-react';
import { toast } from 'sonner';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function AdminNotificationsPage() {
  const [userId, setUserId] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function handleSendUser() {
    if (!userId || !title || !body) return;
    setLoading(true); setResult(null);
    try {
      const res = await fetch(`${API}/api/notifications/send`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, title, body }) });
      const data = await res.json();
      setResult(JSON.stringify(data, null, 2));
      if (res.ok) toast.success('Sent!'); else toast.error('Failed');
    } catch { toast.error('Server error'); }
    setLoading(false);
  }

  async function handleBroadcast() {
    if (!title || !body) return;
    setLoading(true); setResult(null);
    try {
      const res = await fetch(`${API}/api/notifications/broadcast`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, body }) });
      const data = await res.json();
      setResult(JSON.stringify(data, null, 2));
      if (res.ok) toast.success(`Broadcast to ${data.total} devices`); else toast.error('Failed');
    } catch { toast.error('Server error'); }
    setLoading(false);
  }

  return (
    <div className="p-6">
      <div className="mb-6"><h1 className="text-2xl font-bold">Push Notifications</h1><p className="text-sm text-muted-foreground">Send push notifications via Firebase</p></div>
      <Tabs defaultValue="broadcast">
        <TabsList><TabsTrigger value="broadcast"><Users className="mr-1.5 h-4 w-4" /> Broadcast</TabsTrigger><TabsTrigger value="single"><Bell className="mr-1.5 h-4 w-4" /> To User</TabsTrigger></TabsList>
        <TabsContent value="broadcast" className="mt-4">
          <Card><CardHeader><CardTitle>Broadcast to All</CardTitle><CardDescription>Send to every user with push enabled</CardDescription></CardHeader><CardContent className="space-y-4">
            <div className="space-y-2"><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Flash Sale!" /></div>
            <div className="space-y-2"><Label>Body</Label><textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Up to 50% off!" rows={3} className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" /></div>
            <Button onClick={handleBroadcast} disabled={loading || !title || !body}><Send className="mr-2 h-4 w-4" /> {loading ? 'Sending...' : 'Broadcast'}</Button>
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="single" className="mt-4">
          <Card><CardHeader><CardTitle>Send to User</CardTitle><CardDescription>Send by user ID</CardDescription></CardHeader><CardContent className="space-y-4">
            <div className="space-y-2"><Label>User ID</Label><Input value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="user_abc123" /></div>
            <div className="space-y-2"><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Your order shipped!" /></div>
            <div className="space-y-2"><Label>Body</Label><textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Order #ORD-004 is on its way!" rows={3} className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" /></div>
            <Button onClick={handleSendUser} disabled={loading || !userId || !title || !body}><Send className="mr-2 h-4 w-4" /> {loading ? 'Sending...' : 'Send'}</Button>
          </CardContent></Card>
        </TabsContent>
      </Tabs>
      {result && <Card className="mt-4"><CardHeader><CardTitle className="text-sm">Response</CardTitle></CardHeader><CardContent><pre className="overflow-x-auto rounded bg-muted p-4 text-xs">{result}</pre></CardContent></Card>}
    </div>
  );
}
