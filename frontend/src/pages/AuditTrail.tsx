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
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Audit Trail</h1>
        <p className="text-xs sm:text-sm text-slate-400">Cryptographically verifiable log of all autonomous IAM actions</p>
      </div>

      <div className="relative border-l border-slate-700 ml-2 sm:ml-4 space-y-6 sm:space-y-8 py-4">
        {events.map((e) => (
          <div key={e.id} className="relative pl-6 sm:pl-8">
            <div className={`absolute -left-3.5 p-1.5 rounded-full bg-slate-900 border border-slate-700 text-primary`}>
              <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
            <Card className="bg-slate-900/80 border-slate-700 max-w-2xl">
              <CardContent className="p-3 sm:p-4 flex flex-col gap-2">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1">
                  <Badge variant="outline" className="text-xs">{e.event_type}</Badge>
                  <span className="text-[10px] sm:text-xs text-slate-500">{new Date(e.timestamp).toLocaleString()}</span>
                </div>
                <h4 className="font-semibold text-slate-200 mt-1 text-sm sm:text-base">{e.role_name}</h4>
                <p className="text-xs sm:text-sm text-slate-400">{e.action} - {e.reason}</p>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

    </div>
  );
}
