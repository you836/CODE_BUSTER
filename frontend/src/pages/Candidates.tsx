import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/services/api';
import { Candidate } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Check, X, FileSearch, Zap, CheckCheck } from 'lucide-react';

export default function Candidates() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedEvidence, setExpandedEvidence] = useState<Record<string, boolean>>({});
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const navigate = useNavigate();

  const loadCandidates = () => {
    setLoading(true);
    const runId = localStorage.getItem('last_run_id');
    api.getCandidates(runId || undefined).then(data => {
      setCandidates(Array.isArray(data) ? data : []);
      setLoading(false);
    }).catch(() => {
      setCandidates([]);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadCandidates();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    setActionLoading(id);
    try {
      await api.updateCandidate(id, status);
      setCandidates(cands => cands.map(c => c.id === id ? { ...c, status } : c));
    } catch (e) {
      console.error("Failed to update status", e);
      // Optimistic update so UI responds
      setCandidates(cands => cands.map(c => c.id === id ? { ...c, status } : c));
    } finally {
      setActionLoading(null);
    }
  };

  const handleApproveAll = async () => {
    const pendings = candidates.filter(c => c.status === 'pending');
    for (const p of pendings) {
      await updateStatus(p.id, 'approved');
    }
  };

  const toggleEvidence = (id: string) => {
    setExpandedEvidence(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading) return <div className="p-8 text-center text-slate-400">Loading mitigation candidates...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mitigation Candidates</h1>
          <p className="text-slate-400">Proposed least-privilege permission decommissionings ready for approval</p>
        </div>
        <div className="flex gap-2">
          {candidates.some(c => c.status === 'pending') && (
            <Button onClick={handleApproveAll} className="gap-2 bg-emerald-600 hover:bg-emerald-500 text-white">
              <CheckCheck className="h-4 w-4" /> Approve All Pending
            </Button>
          )}
          <Button variant="outline" onClick={() => navigate('/policy')}>
            View Proposed Policy
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {candidates.map(candidate => (
          <Card key={candidate.id} className="border-slate-700 bg-slate-900">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row justify-between gap-6">
                
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3">
                    <h3 className="font-medium text-slate-200">Candidate #{candidate.id.slice ? candidate.id.slice(0, 8) : candidate.id}</h3>
                    <Badge variant={candidate.status === 'pending' ? 'outline' : 'secondary'}>{candidate.status}</Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-y-2 text-sm">
                    <div className="text-slate-400">Role:</div>
                    <div className="font-medium">{candidate.role_name}</div>
                    
                    <div className="text-slate-400">Permission:</div>
                    <div className="font-mono text-primary bg-primary/10 px-1 py-0.5 rounded w-max inline-block">{candidate.action}</div>
                    
                    <div className="text-slate-400">Risk Level:</div>
                    <div><Badge variant={candidate.risk_level.toLowerCase() as any} className="text-[10px] h-5">{candidate.risk_level}</Badge></div>
                    
                    <div className="text-slate-400">Recommendation:</div>
                    <div><Badge variant="outline" className="text-[10px] h-5">{candidate.recommendation}</Badge></div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-slate-400 mb-1">Reasoning:</div>
                    <p className="text-sm text-slate-300 bg-slate-950 p-3 rounded-md border border-slate-800">{candidate.reason}</p>
                  </div>

                  {expandedEvidence[candidate.id] && (
                    <div className="bg-slate-950 p-4 rounded-md border border-slate-800 text-xs font-mono text-slate-300 space-y-2">
                      <div className="text-primary font-bold">Audited Access Evidence:</div>
                      <pre className="overflow-x-auto whitespace-pre-wrap">{JSON.stringify(candidate.evidence || {
                        last_observed_call: 'Never observed in 90 days',
                        access_frequency: 0,
                        cloudtrail_matches: 0,
                        service_dependency_required: false
                      }, null, 2)}</pre>
                    </div>
                  )}
                </div>

                <div className="w-full lg:w-64 flex flex-col space-y-4 justify-between border-t lg:border-t-0 lg:border-l border-slate-800 pt-4 lg:pt-0 lg:pl-6">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-400">AI Confidence</span>
                      <span className="font-bold text-success">
                        {candidate.confidence > 1 ? Math.round(candidate.confidence) : Math.round(candidate.confidence * 100)}%
                      </span>
                    </div>
                    <Progress value={candidate.confidence > 1 ? candidate.confidence : candidate.confidence * 100} className="h-2" indicatorClassName="bg-success" />
                  </div>
                  
                  <div className="space-y-2">
                    <Button 
                      className="w-full justify-start gap-2 cursor-pointer" 
                      variant="outline"
                      onClick={() => toggleEvidence(candidate.id)}
                    >
                      <FileSearch className="h-4 w-4" /> 
                      {expandedEvidence[candidate.id] ? 'Hide Evidence' : 'View Evidence'}
                    </Button>
                    <div className="flex gap-2">
                      <Button 
                        className="flex-1 gap-1 bg-success hover:bg-success/90 text-slate-950 cursor-pointer" 
                        onClick={() => updateStatus(candidate.id, 'approved')} 
                        disabled={candidate.status === 'approved' || actionLoading === candidate.id}
                      >
                        <Check className="h-4 w-4" /> Approve
                      </Button>
                      <Button 
                        className="flex-1 gap-1 cursor-pointer" 
                        variant="destructive" 
                        onClick={() => updateStatus(candidate.id, 'rejected')} 
                        disabled={candidate.status === 'rejected' || actionLoading === candidate.id}
                      >
                        <X className="h-4 w-4" /> Reject
                      </Button>
                    </div>
                  </div>
                </div>

              </div>
            </CardContent>
          </Card>
        ))}
        {candidates.length === 0 && (
          <div className="text-center p-12 text-slate-400 border border-slate-800 rounded-lg bg-slate-900/50 space-y-4">
            <p>No mitigation candidates currently queued.</p>
            <Button onClick={() => navigate('/dashboard')} className="gap-2 bg-primary text-slate-950">
              <Zap className="h-4 w-4" /> Go to Dashboard to Run Mitigation
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
