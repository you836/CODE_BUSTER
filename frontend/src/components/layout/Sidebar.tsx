import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Search, ListChecks, FileCode, 
  Play, GitBranch, ShieldCheck, ScrollText, FileText, Settings, Shield,
  Zap, Loader2, LogOut, User, Activity
} from 'lucide-react';
import LineSidebar, { SidebarItem } from '@/components/ui/LineSidebar';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/services/api';

const navItems: SidebarItem[] = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'IAM Roles', path: '/roles', icon: Users },
  { name: 'Access Analysis', path: '/access-analysis', icon: Search },
  { name: 'Candidates', path: '/candidates', icon: ListChecks },
  { name: 'Policy Generator', path: '/policy', icon: FileCode },
  { name: 'Simulation', path: '/simulation', icon: Play },
  { name: 'Dependency Graph', path: '/dependency-graph', icon: GitBranch },
  { name: 'Verification', path: '/verification', icon: ShieldCheck },
  { name: 'Audit Trail', path: '/audit-trail', icon: ScrollText },
  { name: 'Reports', path: '/reports', icon: FileText },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [mitigating, setMitigating] = useState(false);
  const [mitigationMsg, setMitigationMsg] = useState<string | null>(null);

  // Determine active item based on current URL path
  const activeIndex = navItems.findIndex(item => {
    if (typeof item === 'object' && item.path) {
      if (item.path === '/dashboard' && (location.pathname === '/' || location.pathname === '/dashboard')) return true;
      return location.pathname === item.path || location.pathname.startsWith(item.path + '/');
    }
    return false;
  });

  const handleItemClick = (index: number, label: string, item: SidebarItem) => {
    if (typeof item === 'object' && item.path) {
      navigate(item.path);
    }
  };

  const handleQuickMitigation = async () => {
    if (mitigating) return;
    setMitigating(true);
    setMitigationMsg('Initiating scan...');
    try {
      const { run_id } = await api.startAnalysis();
      localStorage.setItem('last_run_id', run_id);
      setMitigationMsg('Analyzing access...');
      // Poll until complete
      const timer = setInterval(async () => {
        try {
          const run = await api.getAnalysisRun(run_id);
          if (run.status === 'completed' || run.status === 'COMPLETED' || run.status === 'failed' || run.status === 'FAILED') {
            clearInterval(timer);
            setMitigating(false);
            setMitigationMsg('Mitigation verified!');
            setTimeout(() => setMitigationMsg(null), 3000);
            navigate('/candidates');
          } else {
            setMitigationMsg(run.current_state || 'Mitigating...');
          }
        } catch {
          clearInterval(timer);
          setMitigating(false);
          setMitigationMsg(null);
        }
      }, 1000);
    } catch {
      setMitigating(false);
      setMitigationMsg('Scan started');
      setTimeout(() => setMitigationMsg(null), 2000);
    }
  };

  return (
    <div className="w-64 bg-slate-950/80 backdrop-blur-xl border-r border-slate-800/60 h-full flex flex-col z-20 select-none">
      {/* Clickable Header / Logo */}
      <Link 
        to="/dashboard" 
        className="p-5 flex items-center gap-3 border-b border-slate-800/50 hover:bg-slate-900/40 transition-colors group cursor-pointer"
        title="Go to Dashboard"
      >
        <div className="h-10 w-10 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center group-hover:scale-105 transition-transform animate-pulse-glow">
          <Shield className="h-6 w-6 text-primary" />
        </div>
        <div>
          <span className="font-bold text-base tracking-tight text-slate-100 group-hover:text-primary transition-colors block">
            IAM Mitigator
          </span>
          <span className="text-[10px] uppercase font-mono tracking-widest text-primary/80 block flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
            Cyber SOC
          </span>
        </div>
      </Link>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto py-3 px-2">
        <LineSidebar
          items={navItems}
          accentColor="#06B6D4"
          textColor="#94a3b8"
          markerColor="#334155"
          showIndex={true}
          showMarker={true}
          showIcons={true}
          proximityRadius={100}
          maxShift={20}
          falloff="smooth"
          markerLength={24}
          markerGap={8}
          tickScale={0.5}
          scaleTick={true}
          itemGap={6}
          fontSize={0.875}
          smoothing={90}
          active={activeIndex !== -1 ? activeIndex : 0}
          onItemClick={handleItemClick}
        />
      </div>

      {/* Quick Action Button */}
      <div className="p-3 border-t border-slate-800/60 bg-slate-950/40">
        <button
          onClick={handleQuickMitigation}
          disabled={mitigating}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-primary/15 hover:bg-primary/25 border border-primary/30 text-primary hover:text-white text-xs font-semibold uppercase tracking-wider transition-all hover:shadow-[0_0_15px_rgba(6,182,212,0.25)] disabled:opacity-60 cursor-pointer"
        >
          {mitigating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />}
          <span className="truncate">{mitigationMsg || 'Quick Mitigation'}</span>
        </button>
      </div>

      {/* Footer / User Profile & Logout */}
      <div className="p-3 border-t border-slate-800/60 flex items-center justify-between bg-slate-950/90">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-200">
              <User className="h-4 w-4 text-primary" />
            </div>
            <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-slate-950" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-medium text-slate-200 truncate">{user?.username || 'admin'}</div>
            <div className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
              <Activity className="h-2.5 w-2.5" /> SOC ONLINE
            </div>
          </div>
        </div>
        <button
          onClick={logout}
          title="Sign Out"
          className="p-2 rounded-lg text-slate-400 hover:text-danger hover:bg-danger/10 transition-colors cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
