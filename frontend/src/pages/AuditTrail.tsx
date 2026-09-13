import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, FileCode, CheckCircle2, Clock } from 'lucide-react';
import { api } from '@/services/api';
import { AuditLogEntry } from '@/types';

export default function AuditTrail() {
  const [events, setEvents] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const runId = localStorage.getItem('last_run_id');
    api.getAuditLog(runId || undefined).then(data => {
      setEvents(data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-400">Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Audit Trail</h1>
        <p className="text-slate-400">Cryptographically verifiable log of all autonomous IAM actions</p>
      </div>

      <div className="relative border-l border-slate-700 ml-4 space-y-8 py-4">
        {events.map((e) => (
          <div key={e.id} className="relative pl-8">
            <div className={`absolute -left-3.5 p-1.5 rounded-full bg-slate-900 border border-slate-700 text-primary`}>
              <Clock className="h-4 w-4" />
            </div>
            <Card className="bg-slate-900 border-slate-700 max-w-2xl">
              <CardContent className="p-4 flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <Badge variant="outline">{e.event_type}</Badge>
                  <span className="text-xs text-slate-500">{new Date(e.timestamp).toLocaleString()}</span>
                </div>
                <h4 className="font-semibold text-slate-200 mt-2">{e.role_name}</h4>
                <p className="text-sm text-slate-400">{e.action} - {e.reason}</p>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
