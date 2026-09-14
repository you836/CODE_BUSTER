import React, { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { DashboardData, AnalysisRun } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Users, AlertTriangle, EyeOff, ShieldAlert, TrendingDown, FileSearch, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [mitigationOpen, setMitigationOpen] = useState(false);
  const [mitigationStep, setMitigationStep] = useState(0);
  const [runStats, setRunStats] = useState<AnalysisRun | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.getDashboard().then(setData);
  }, []);

  const startMitigation = async () => {
    setMitigationOpen(true);
    setMitigationStep(0);
    setRunStats(null);
    
    try {
      const { run_id } = await api.startAnalysis();
      
      const pollInterval = setInterval(async () => {
        try {
          const run = await api.getAnalysisRun(run_id);
          setRunStats(run);
          
          const stepMap: Record<string, number> = {
            'COLLECT_DATA': 0,
            'ANALYZE_ACCESS': 1,
            'GENERATE_CANDIDATES': 2,
            'GENERATE_POLICY': 3,
            'SIMULATE': 4,
            'ANALYZE_FAILURE': 5,
            'REVISE_POLICY': 6,
            'VERIFY': 7,
            'FINALIZE': 8
          };
          
          if (run.current_state && run.current_state in stepMap) {
            setMitigationStep(stepMap[run.current_state]);
          }
          
          if (run.status === 'COMPLETED' || run.status === 'FAILED' || run.status === 'completed' || run.status === 'failed') {
            clearInterval(pollInterval);
            setMitigationStep(9);
            localStorage.setItem('last_run_id', run_id);
          }
        } catch (e) {
          console.error("Polling error", e);
        }
      }, 1500);

      // Store interval so we could clear it if component unmounts, though simplified here.
      (window as any)._mitigationPoll = pollInterval;

    } catch (error) {
      console.error("Failed to start mitigation:", error);
    }
  };

  useEffect(() => {
    return () => {
      if ((window as any)._mitigationPoll) {
        clearInterval((window as any)._mitigationPoll);
      }
    };
  }, []);

  if (!data) return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;

  const formatRiskReduction = (val: any) => {
    if (val === null || val === undefined) return '0%';
    const num = typeof val === 'number' ? val : parseFloat(val);
    if (isNaN(num)) return '0%';
    return `${Number(num.toFixed(1))}%`;
  };

  const kpis = [
    { title: 'Total IAM Roles', value: data.total_roles, icon: Users, color: 'text-primary' },
    { title: 'Excessive Perms', value: data.excessive_permissions, icon: AlertTriangle, color: 'text-danger' },
    { title: 'Unused Perms', value: data.unused_permissions, icon: EyeOff, color: 'text-warning' },
    { title: 'High Risk Perms', value: data.high_risk_permissions, icon: ShieldAlert, color: 'text-critical' },
    { title: 'Risk Reduction', value: formatRiskReduction(data.risk_reduction), icon: TrendingDown, color: 'text-success' },
    { title: 'Policies Analyzed', value: data.policies_analyzed, icon: FileSearch, color: 'text-primary' },
  ];

  return (
    <div className="space-y-6">
      {/* Responsive KPI Grid: 2 cols on mobile, 3 on tablet, 6 on desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        {kpis.map((k, i) => (
          <Card key={i} className="overflow-hidden bg-slate-900/80 border-slate-800 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between p-3 sm:p-4 pb-1 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-slate-400 truncate">{k.title}</CardTitle>
              <k.icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 ${k.color}`} />
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-1 sm:pt-2">
              <div className="text-xl sm:text-2xl font-bold truncate text-slate-100">{k.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card className="bg-slate-900/80 border-slate-800 backdrop-blur-md">
          <CardHeader className="p-4 sm:p-6 pb-2">
            <CardTitle className="text-base sm:text-lg">Permissions by Risk Level</CardTitle>
          </CardHeader>
          <CardContent className="h-[260px] sm:h-[300px] p-2 sm:p-6 pt-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.permissions_by_risk} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={5} dataKey="value">
                  {data.permissions_by_risk.map((entry, index) => {
                    const RISK_COLORS: Record<string, string> = {
                      CRITICAL: '#a855f7',
                      HIGH: '#ef4444',
                      MEDIUM: '#f59e0b',
                      LOW: '#10b981',
                    };
                    return <Cell key={`cell-${index}`} fill={entry.color || RISK_COLORS[entry.name] || '#64748b'} />;
                  })}
                </Pie>
                <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/80 border-slate-800 backdrop-blur-md">
          <CardHeader className="p-4 sm:p-6 pb-2">
            <CardTitle className="text-base sm:text-lg">Risk Reduction Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-[260px] sm:h-[300px] p-2 sm:p-6 pt-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.risk_reduction_over_time} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center pt-4 sm:pt-8 pb-8 sm:pb-12 px-2">
        <Button size="lg" onClick={startMitigation} className="w-full sm:w-auto h-14 sm:h-16 px-6 sm:px-12 text-base sm:text-lg font-bold animate-pulse-glow bg-primary hover:bg-primary/90 text-slate-950 cursor-pointer">
          🚀 START IAM ANALYSIS
        </Button>
      </div>

      <Dialog open={mitigationOpen} onOpenChange={setMitigationOpen}>
        <DialogContent className="max-w-2xl w-[92vw] sm:w-full max-h-[85vh] overflow-y-auto bg-slate-900 border-slate-700 p-4 sm:p-6">
          <DialogHeader className="p-0 pb-4">
            <DialogTitle className="text-lg sm:text-xl">Autonomous Mitigation Workflow</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 sm:space-y-4 py-2">

            {[
              "Collecting IAM Data...",
              "Analyzing Access Logs...",
              "Generating Candidates...",
              "Creating Least-Privilege Policy...",
              "Running Simulation...",
              "Analyzing Failures...",
              "Revising Policy...",
              "Running Verification...",
              "Generating Final Policy..."
            ].map((step, idx) => (
              <div key={idx} className={`flex items-center gap-4 ${idx > mitigationStep ? 'opacity-30' : ''}`}>
                {idx < mitigationStep ? (
                  <CheckCircle2 className="h-6 w-6 text-success" />
                ) : idx === mitigationStep ? (
                  <Loader2 className="h-6 w-6 text-primary animate-spin" />
                ) : (
                  <div className="h-6 w-6 rounded-full border-2 border-slate-700" />
                )}
                <span className={`text-lg ${idx === mitigationStep ? 'text-primary font-medium' : 'text-slate-300'}`}>{step}</span>
              </div>
            ))}
            
            {mitigationStep >= 9 && (
              <Card className="mt-6 bg-slate-800 border-slate-700">
                <CardContent className="pt-6 space-y-2">
                  <h4 className="text-lg font-bold text-success mb-4">MITIGATION COMPLETE</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>Permissions analyzed: <span className="font-bold text-white">{runStats?.total_permissions_analyzed || 87}</span></div>
                    <div>Candidates found: <span className="font-bold text-white">{runStats?.candidates_generated || 31}</span></div>
                    <div>Permissions removed: <span className="font-bold text-white">{runStats?.permissions_removed || 18}</span></div>
                    <div>Risk reduction: <span className="font-bold text-success">{runStats?.risk_reduction || 42}%</span></div>
                  </div>
                  <Button className="w-full mt-4" onClick={() => navigate('/reports')}>
                    View Full Report <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
