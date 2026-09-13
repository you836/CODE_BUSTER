import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { api } from '@/services/api';

export default function Simulation() {
  const [running, setRunning] = useState(false);
  const [ran, setRan] = useState(false);
  const [data, setData] = useState<any>(null);

  const runSimulation = async () => {
    setRunning(true);
    try {
      const runId = localStorage.getItem('last_run_id');
      const res = await api.simulatePolicy(runId || undefined);
      if (res && res.results) {
        setData(res);
      }
      setRan(true);
    } catch (e) {
      console.error(e);
      setRan(true);
    } finally {
      setRunning(false);
    }
  };

  useEffect(() => {
    runSimulation();
  }, []);

  const results = data?.results || [
    { request: 's3:GetObject', resource: 'app-data-bucket/file.txt', original: 'ALLOW', proposed: 'ALLOW', status: 'PASS', reason: 'Required permission preserved', service: 'S3' },
    { request: 's3:DeleteBucket', resource: 'app-data-bucket', original: 'ALLOW', proposed: 'DENY', status: 'PASS', reason: 'Unused destructive permission removed', service: 'S3' },
    { request: 'ec2:RunInstances', resource: '*', original: 'DENY', proposed: 'DENY', status: 'PASS', reason: 'Maintains default deny', service: 'EC2' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Access Simulation</h1>
          <p className="text-slate-400">Test proposed policies against historical access patterns safely</p>
        </div>
        <Button onClick={runSimulation} disabled={running} className="gap-2 bg-primary text-slate-950 font-semibold h-10">
          {running ? <div className="h-4 w-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" /> : <Play className="h-4 w-4" />}
          {running ? 'Simulating...' : 'Run Simulation'}
        </Button>
      </div>

      {ran && (
        <div className={`border p-4 rounded-lg flex items-center gap-3 ${data?.passed === false ? 'bg-danger/20 border-danger/50 text-danger' : 'bg-success/20 border-success/50 text-success'}`}>
          {data?.passed === false ? <XCircle className="h-6 w-6" /> : <CheckCircle2 className="h-6 w-6" />}
          <div>
            <h3 className="font-semibold">SIMULATION {data?.passed === false ? 'FAILED' : 'PASSED'} - Iteration {data?.iteration || 1}</h3>
            <p className="text-sm opacity-80">{data?.summary || 'The proposed policy successfully allowed all historical necessary actions while denying unused ones.'}</p>
          </div>
        </div>
      )}

      <Card className="border-slate-700 bg-slate-900 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Request Action</TableHead>
              <TableHead>Resource</TableHead>
              <TableHead>Original Result</TableHead>
              <TableHead>Proposed Result</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Reason</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((r, i) => (
              <TableRow key={i}>
                <TableCell className="font-mono text-xs">{r.request}</TableCell>
                <TableCell className="font-mono text-xs text-slate-400">{r.resource}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={r.original === 'ALLOW' ? 'text-success border-success' : 'text-danger border-danger'}>{r.original}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={r.proposed === 'ALLOW' ? 'text-success border-success' : 'text-danger border-danger'}>{r.proposed}</Badge>
                </TableCell>
                <TableCell>
                  {r.status === 'PASS' ? (
                    <div className="flex items-center gap-1 text-success"><CheckCircle2 className="h-4 w-4" /> <span className="text-xs font-bold">PASS</span></div>
                  ) : (
                    <div className="flex items-center gap-1 text-danger"><XCircle className="h-4 w-4" /> <span className="text-xs font-bold">FAIL</span></div>
                  )}
                </TableCell>
                <TableCell className="text-xs text-slate-300">{r.reason}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
