import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { ShieldAlert, Info } from 'lucide-react';
import { api } from '@/services/api';
import { Candidate } from '@/types';

export default function AccessAnalysis() {
  const [filter, setFilter] = useState('all');
  const [findings, setFindings] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const runId = localStorage.getItem('last_run_id');
    api.getCandidates(runId || undefined).then(data => {
      setFindings(data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-400">Loading...</div>;

  const filteredFindings = findings.filter(f => {
    if (filter === 'all') return true;
    return f.risk_level.toLowerCase() === filter.toLowerCase();
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Access Analysis</h1>
          <p className="text-slate-400">Detailed breakdown of excessive and unused permissions</p>
        </div>
        <div className="w-64">
          <Select value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="all">All Findings</option>
            <option value="critical">Critical Risk</option>
            <option value="high">High Risk</option>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        {filteredFindings.map((finding, idx) => (
          <Card key={idx} className="border-slate-700 bg-slate-900 hover:bg-slate-800/80 transition-colors">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <ShieldAlert className={`h-5 w-5 ${finding.risk_level === 'CRITICAL' ? 'text-critical' : 'text-danger'}`} />
                  <CardTitle className="text-lg text-slate-200">{finding.role_name}</CardTitle>
                  <code className="px-2 py-1 bg-slate-950 text-slate-300 rounded text-sm font-mono border border-slate-800">{finding.action}</code>
                </div>
                <div className="flex gap-2">
                  <Badge variant={finding.risk_level.toLowerCase() as any}>{finding.risk_level}</Badge>
                  <Badge variant="outline">{finding.recommendation}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 p-3 bg-slate-950/50 rounded-md border border-slate-800/50 text-sm text-slate-300">
                <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p>{finding.reason}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
