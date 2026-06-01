'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Search } from 'lucide-react';
import { getVendorId, getToken } from '@/lib/use-api';
import { io, Socket } from 'socket.io-client';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function ChatPage() {
  const vendorId = getVendorId() || '';
  const [conversations, setConversations] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [search, setSearch] = useState('');
  const socketRef = useRef<Socket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const s = io(API, { auth: { token: getToken() } });
    socketRef.current = s;
    s.on('connect', () => s.emit('join-chat', vendorId));
    s.on('new-message', (msg: any) => {
      if (msg.receiverId === vendorId || msg.senderId === vendorId) {
        setMessages((prev) => [...prev, msg]);
      }
    });
    return () => { s.disconnect(); };
  }, [vendorId]);

  useEffect(() => {
    fetch(`${API}/api/chat/conversations/${vendorId}`, { headers: { Authorization: `Bearer ${getToken()}` } })
      .then((r) => r.json()).then(setConversations).catch(() => {});
  }, [vendorId]);

  useEffect(() => {
    if (!selected) return;
    fetch(`${API}/api/chat/${selected.userId}`, { headers: { Authorization: `Bearer ${getToken()}` } })
      .then((r) => r.json()).then(setMessages).catch(() => {});
  }, [selected, vendorId]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  async function handleSend() {
    if (!text.trim() || !selected) return;
    const msg = { senderId: vendorId, receiverId: selected.userId, text: text.trim() };
    try {
      await fetch(`${API}/api/chat`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(msg),
      });
      socketRef.current?.emit('send-message', { chatId: vendorId, ...msg });
      setMessages((prev) => [...prev, { ...msg, createdAt: new Date().toISOString() }]);
      setText('');
    } catch {}
  }

  const filtered = conversations.filter((c: any) => c.name?.toLowerCase().includes(search.toLowerCase()));
  const displayMessages = selected
    ? messages.filter((m: any) => (m.senderId === vendorId && m.receiverId === selected.userId) || (m.receiverId === vendorId && m.senderId === selected.userId))
    : [];

  return (
    <div className="p-6">
      <div className="mb-6"><h1 className="text-2xl font-bold">Messages</h1><p className="text-sm text-muted-foreground">Chat with your customers</p></div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader><div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Search..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} /></div></CardHeader>
          <CardContent className="p-0">
            {filtered.map((c: any) => (
              <div key={c.userId} className={`flex cursor-pointer items-center gap-3 border-b p-4 transition-colors ${selected?.userId === c.userId ? 'bg-muted' : 'hover:bg-muted/50'}`} onClick={() => setSelected(c)}>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">{c.name.charAt(0)}</div>
                <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{c.name}</p><p className="text-xs text-muted-foreground truncate">{c.lastMsg}</p></div>
              </div>
            ))}
            {filtered.length === 0 && <p className="p-4 text-sm text-muted-foreground">No conversations</p>}
          </CardContent>
        </Card>
        <Card className="lg:col-span-2 flex flex-col">
          <CardHeader className="border-b"><CardTitle className="text-base">{selected?.name ?? 'Select a conversation'}</CardTitle></CardHeader>
          <CardContent className="flex-1 space-y-4 p-4 max-h-[400px] overflow-y-auto">
            {displayMessages.map((m: any, i: number) => (
              <div key={i} className={`flex ${m.senderId === vendorId ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] rounded-lg px-3 py-2 text-sm ${m.senderId === vendorId ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>{m.text}</div>
              </div>
            ))}
            <div ref={bottomRef} />
          </CardContent>
          <div className="flex items-center gap-2 border-t p-4">
            <Input placeholder="Type a message..." value={text} onChange={(e) => setText(e.target.value)} className="flex-1" onKeyDown={(e) => e.key === 'Enter' && handleSend()} />
            <Button size="icon" onClick={handleSend}><Send className="h-4 w-4" /></Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
