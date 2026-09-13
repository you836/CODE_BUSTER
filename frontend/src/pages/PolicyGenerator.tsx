import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Info, Play, Download } from 'lucide-react';
import { api } from '@/services/api';

export default function PolicyGenerator() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const runId = localStorage.getItem('last_run_id');
    if (runId) {
      api.getPolicyComparison(runId).then(res => {
        setData(res);
        setLoading(false);
      }).catch(() => {
        fetchDefaultPolicy();
      });
    } else {
      fetchDefaultPolicy();
    }
  }, []);

  const fetchDefaultPolicy = () => {
    api.generatePolicy().then(res => {
      setData(res);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  const handleSimulate = async () => {
    const runId = localStorage.getItem('last_run_id');
    try {
      await api.simulatePolicy(runId || undefined);
    } catch (e) {
      console.error(e);
    }
    navigate('/simulation');
  };

  const handleExportJson = () => {
    const policyToExport = data?.proposed_policy || proposedPolicy;
    const blob = new Blob([JSON.stringify(policyToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'least-privilege-policy.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="p-8 text-center text-slate-400">Loading policy generation...</div>;

  const currentPolicy = data?.current_policy || {
    "Version": "2012-10-17",
    "Statement": [
      { "Effect": "Allow", "Action": "s3:*", "Resource": "*" },
      { "Effect": "Allow", "Action": "dynamodb:*", "Resource": "*" },
      { "Effect": "Allow", "Action": "iam:*", "Resource": "*" }
    ]
  };

  const proposedPolicy = data?.proposed_policy || {
    "Version": "2012-10-17",
    "Statement": [
      { "Effect": "Allow", "Action": "s3:GetObject", "Resource": "arn:aws:s3:::app-data-bucket/*" },
      { "Effect": "Allow", "Action": "s3:PutObject", "Resource": "arn:aws:s3:::app-data-bucket/*" },
      { "Effect": "Allow", "Action": "dynamodb:GetItem", "Resource": "arn:aws:dynamodb:*:*:table/Orders" },
      { "Effect": "Allow", "Action": "dynamodb:PutItem", "Resource": "arn:aws:dynamodb:*:*:table/Orders" }
    ]
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Policy Generator</h1>
          <p className="text-slate-400">Compare and review generated least-privilege policies</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 cursor-pointer" onClick={handleExportJson}>
            <Download className="h-4 w-4" /> Export JSON
          </Button>
          <Button className="gap-2 cursor-pointer bg-primary text-slate-950 font-semibold" onClick={handleSimulate}>
            <Play className="h-4 w-4" /> Run Simulation
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-[400px]">
        <Card className="flex flex-col bg-slate-900 border-slate-700">
          <div className="p-3 border-b border-slate-700 bg-slate-800/50 flex justify-between items-center">
            <span className="font-semibold text-sm">CURRENT POLICY</span>
            <Badge variant="outline" className="text-danger border-danger/30 bg-danger/10">Excessive</Badge>
          </div>
          <CardContent className="p-0 flex-1 overflow-auto">
            <pre className="p-4 text-sm font-mono text-slate-300 h-full bg-[#0d1117]">
{JSON.stringify(currentPolicy, null, 2).replace(/"s3:\*"/g, '<span class="text-danger">"s3:*"</span>').replace(/"\*"/g, '<span class="text-danger">"*"</span>')}
            </pre>
          </CardContent>
        </Card>

        <Card className="flex flex-col bg-slate-900 border-slate-700">
          <div className="p-3 border-b border-slate-700 bg-slate-800/50 flex justify-between items-center">
            <span className="font-semibold text-sm text-primary">PROPOSED POLICY</span>
            <Badge variant="outline" className="text-success border-success/30 bg-success/10">Least-Privilege</Badge>
          </div>
          <CardContent className="p-0 flex-1 overflow-auto">
            <pre className="p-4 text-sm font-mono text-slate-300 h-full bg-[#0d1117]">
{JSON.stringify(proposedPolicy, null, 2).replace(/"s3:GetObject"/g, '<span class="text-success">"s3:GetObject"</span>').replace(/"s3:ListBucket"/g, '<span class="text-success">"s3:ListBucket"</span>')}
            </pre>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-700 bg-slate-900">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-slate-200 mb-1">Policy Explanation</h4>
              <p className="text-sm text-slate-400">{data?.explanation || 'The wildcard permission has been restricted based on access logs.'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
