import React from 'react';
import { Bell, LogOut, User, Terminal, Menu } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'react-router-dom';
import TextType from '@/components/ui/TextType';

const PAGE_TEXTS: Record<string, string[]> = {
  '/dashboard': [
    'Dashboard // Real-Time Cloud IAM Security Posture',
    'Autonomous Least-Privilege Policy Mitigator',
    'AI-Powered Zero-Disruption Access Hardening'
  ],
  '/roles': [
    'IAM Roles // Active Identity Risk Assessment',
    'Auditing Entitlements, Wildcards & Admin Grants',
    'Cloud Perimeter Identity Hardening'
  ],
  '/access-analysis': [
    'Access Analysis // Rule Engine Risk Classification',
    'Dormant, Unused & Overprivileged Permission Audit',
    'Heuristic Least-Privilege Recommendations'
  ],
  '/candidates': [
    'Permission Candidates // AI Review & Approval Queue',
    'High-Confidence Action Decommissioning Targets',
    'Verifiable Observed Access Evidence Logs'
  ],
  '/policy': [
    'Policy Generator // Side-by-Side Policy Synthesis',
    'Synthesizing Hardened Least-Privilege JSON Policies',
    'Comparative IAM Policy Delta & Diff Review'
  ],
  '/simulation': [
    'Policy Simulation // Shadow Testing Against Dependency Graph',
    'Proving Zero-Disruption Access Preservation',
    'Autonomous Multi-Iteration Policy Verification'
  ],
  '/dependency-graph': [
    'Dependency Graph // Interactive Cloud Microservice Topology',
    'Mapping Live Inter-Service AWS Permissions',
    'Visualizing Microservice Access Pathways'
  ],
  '/verification': [
    'Security Verification // Six-Point Compliance Checklist',
    'Mathematical Risk Reduction & Score Validation',
    'Automated Posture Assurance Verification'
  ],
  '/audit-trail': [
    'Audit Trail // Immutable Security Ledger',
    'Chronological Mitigation Evidence & Confidence Scores',
    'Continuous SOC 2 & PCI-DSS Compliance Log'
  ],
  '/reports': [
    'Executive Reports // Cloud Security Posture Summary',
    'Certified IAM Least-Privilege Mitigation Dossier',
    'Exportable PDF & Compliance Documentation'
  ],
  '/settings': [
    'System Settings // AI Provider & Orchestration Parameters',
    'Simulation Thresholds & Safety Sandbox Flags',
    'Autonomous Security Engine Configuration'
  ]
};

const getPageTitles = (pathname: string): string[] => {
  const match = Object.keys(PAGE_TEXTS).find(p => pathname === p || (p !== '/dashboard' && pathname.startsWith(p)));
  if (match) return PAGE_TEXTS[match];

  const parts = pathname.split('/').filter(Boolean);
  if (parts.length === 0) return PAGE_TEXTS['/dashboard'];
  const name = parts[0].split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  return [`${name} // Cloud IAM Security Operations`, 'Autonomous Cloud Least-Privilege Mitigator'];
};

interface TopNavProps {
  onToggleMobileMenu?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({ onToggleMobileMenu }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const currentTexts = getPageTitles(location.pathname);

  return (
    <header className="h-16 bg-slate-950/80 border-b border-slate-800/60 flex items-center justify-between px-3 sm:px-6 backdrop-blur-xl sticky top-0 z-30">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* Mobile Hamburger Menu Toggle */}
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/70 border border-slate-800 transition-colors flex-shrink-0 cursor-pointer"
          title="Open Navigation Menu"
          aria-label="Open Navigation Menu"
        >
          <Menu className="h-5 w-5 text-primary" />
        </button>

        <div className="h-8 w-8 rounded-md bg-primary/10 border border-primary/25 hidden sm:flex items-center justify-center text-primary flex-shrink-0">
          <Terminal className="h-4 w-4" />
        </div>

        <div className="flex flex-col min-w-0">
          <TextType
            key={location.pathname}
            texts={currentTexts}
            typingSpeed={60}
            deletingSpeed={35}
            pauseDuration={2200}
            showCursor={true}
            cursorCharacter="_"
            cursorClassName="text-primary font-bold ml-0.5"
            cursorBlinkDuration={0.45}
            className="text-xs sm:text-sm md:text-base font-bold font-mono tracking-tight text-slate-100 truncate max-w-[170px] xs:max-w-[220px] sm:max-w-md md:max-w-xl"
            loop={true}
          />
          <span className="text-[9px] sm:text-[10px] font-mono text-slate-400 tracking-wider uppercase hidden sm:block truncate">
            Autonomous Cloud IAM Mitigator // SOC Level-1 Active
          </span>
        </div>
      </div>
      
      <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
        <button className="text-slate-400 hover:text-white relative p-1.5 rounded-lg hover:bg-slate-900/60 transition-colors cursor-pointer" title="Notifications">
          <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary animate-pulse"></span>
        </button>
        
        <div className="flex items-center gap-2 pl-2 sm:pl-4 border-l border-slate-800">
          <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center text-primary font-bold text-xs flex-shrink-0">
            <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </div>
          <span className="text-xs sm:text-sm font-medium text-slate-200 hidden md:inline">{user?.username || 'Admin'}</span>
          <button 
            onClick={logout} 
            title="Sign Out" 
            className="text-slate-400 hover:text-danger p-1.5 rounded-lg hover:bg-danger/10 transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

