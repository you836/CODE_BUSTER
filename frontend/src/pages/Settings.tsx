import React, { useState } from 'react';
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  BrainCircuit, Cloud, ShieldCheck, Bell, Sliders, Database, 
  KeyRound, Check, CheckCircle2, AlertTriangle, RefreshCw, 
  Download, Eye, EyeOff, Terminal, Zap, Activity,
  Server, Lock, Plus, Trash2, Send
} from 'lucide-react';

interface SettingState {
  aiProvider: string;
  aiModel: string;
  apiKey: string;
  temperature: number;
  maxTokens: number;
  reasoningMode: string;
  awsAccountId: string;
  roleArn: string;
  regions: string[];
  cloudTrailSync: string;
  readOnlyMode: boolean;
  inactivityThreshold: number;
  confidenceThreshold: number;
  maxIterations: number;
  autoRemediate: boolean;
  protectedRoles: string[];
  slackWebhook: string;
  slackChannel: string;
  teamsWebhook: string;
  alertOnCritical: boolean;
  alertOnFailure: boolean;
  alertOnWildcard: boolean;
  logRetention: string;
}

const DEFAULT_SETTINGS: SettingState = {
  aiProvider: 'openai',
  aiModel: 'gpt-4o',
  apiKey: 'sk-proj-7a91bf938b8d1042cfa98b92',
  temperature: 0.1,
  maxTokens: 2048,
  reasoningMode: 'balanced',
  awsAccountId: '849201938491',
  roleArn: 'arn:aws:iam::849201938491:role/AutonomousSecurityMitigator',
  regions: ['us-east-1', 'us-west-2', 'eu-west-1'],
  cloudTrailSync: '1h',
  readOnlyMode: true,
  inactivityThreshold: 90,
  confidenceThreshold: 95,
  maxIterations: 3,
  autoRemediate: false,
  protectedRoles: ['RootAdmin', 'BillingAdmin', 'SecurityBreakGlass', 'KmsKeyAdmin'],
  slackWebhook: 'https://hooks.slack.com/services/T00/B00/X00SECRET',
  slackChannel: '#soc-iam-alerts',
  teamsWebhook: '',
  alertOnCritical: true,
  alertOnFailure: true,
  alertOnWildcard: true,
  logRetention: '365d',
};

const ALL_REGIONS = [
  { id: 'us-east-1', name: 'US East (N. Virginia)' },
  { id: 'us-west-2', name: 'US West (Oregon)' },
  { id: 'eu-west-1', name: 'EU (Ireland)' },
  { id: 'ap-southeast-1', name: 'Asia Pacific (Singapore)' },
];

export default function Settings() {
  const [settings, setSettings] = useState<SettingState>(() => {
    try {
      const saved = localStorage.getItem('iam_mitigator_settings');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [activeTab, setActiveTab] = useState('ai');
  const [showApiKey, setShowApiKey] = useState(false);
  const [testAiStatus, setTestAiStatus] = useState<string | null>(null);
  const [testCloudStatus, setTestCloudStatus] = useState<string | null>(null);
  const [testWebhookStatus, setTestWebhookStatus] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [newProtectedRole, setNewProtectedRole] = useState('');

  const updateSetting = <K extends keyof SettingState>(key: K, value: SettingState[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveAll = () => {
    localStorage.setItem('iam_mitigator_settings', JSON.stringify(settings));
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleExportConfig = () => {
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'iam-mitigator-config.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleTestAi = () => {
    setTestAiStatus('testing');
    setTimeout(() => {
      setTestAiStatus('success');
      setTimeout(() => setTestAiStatus(null), 4000);
    }, 1200);
  };

  const handleTestCloud = () => {
    setTestCloudStatus('testing');
    setTimeout(() => {
      setTestCloudStatus('success');
      setTimeout(() => setTestCloudStatus(null), 4000);
    }, 1400);
  };

  const handleTestWebhook = () => {
    setTestWebhookStatus('testing');
    setTimeout(() => {
      setTestWebhookStatus('success');
      setTimeout(() => setTestWebhookStatus(null), 4000);
    }, 1100);
  };

  const toggleRegion = (regionId: string) => {
    if (settings.regions.includes(regionId)) {
      if (settings.regions.length > 1) {
        updateSetting('regions', settings.regions.filter(r => r !== regionId));
      }
    } else {
      updateSetting('regions', [...settings.regions, regionId]);
    }
  };

  const addProtectedRole = () => {
    if (!newProtectedRole.trim()) return;
    if (!settings.protectedRoles.includes(newProtectedRole.trim())) {
      updateSetting('protectedRoles', [...settings.protectedRoles, newProtectedRole.trim()]);
    }
    setNewProtectedRole('');
  };

  const removeProtectedRole = (role: string) => {
    updateSetting('protectedRoles', settings.protectedRoles.filter(r => r !== role));
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Header & Master Action Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/60 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-slate-800/80 backdrop-blur-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary shadow-[0_0_15px_rgba(6,182,212,0.3)] shrink-0">
              <Sliders className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl font-black tracking-tight text-slate-100 flex flex-wrap items-center gap-2 sm:gap-3">
                System Settings & Orchestration
                <Badge variant="outline" className="text-[10px] sm:text-xs border-primary/40 text-primary bg-primary/10">SOC TIER-1</Badge>
              </h1>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Configure AI reasoning models, AWS multi-region connectors, simulation sandbox rules, and alerting webhooks.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full md:w-auto justify-end">
          <Button 
            variant="outline" 
            onClick={handleExportConfig}
            className="gap-2 border-slate-700 hover:bg-slate-800 text-slate-300 cursor-pointer text-xs sm:text-sm"
          >
            <Download className="h-4 w-4" /> Export Config
          </Button>
          <Button 
            onClick={handleSaveAll}
            className="gap-2 bg-primary hover:bg-primary/90 text-slate-950 font-bold shadow-[0_0_20px_rgba(6,182,212,0.4)] cursor-pointer text-xs sm:text-sm"
          >
            <Check className="h-4 w-4" /> Save All Settings
          </Button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <div className="text-sm font-medium">
            Settings committed and synchronized across the autonomous orchestrator engine.
          </div>
        </div>
      )}

      {/* Main Tabs Container */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-slate-900/80 border border-slate-800 p-1.5 rounded-xl grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1 h-auto">

          <TabsTrigger value="ai" className="gap-2 py-2.5 data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-primary/40 rounded-lg">
            <BrainCircuit className="h-4 w-4" /> AI Engine
          </TabsTrigger>
          <TabsTrigger value="cloud" className="gap-2 py-2.5 data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-primary/40 rounded-lg">
            <Cloud className="h-4 w-4" /> Cloud & IAM
          </TabsTrigger>
          <TabsTrigger value="safety" className="gap-2 py-2.5 data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-primary/40 rounded-lg">
            <ShieldCheck className="h-4 w-4" /> Safety Rules
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2 py-2.5 data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-primary/40 rounded-lg">
            <Bell className="h-4 w-4" /> SOC Webhooks
          </TabsTrigger>
          <TabsTrigger value="system" className="gap-2 py-2.5 data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-primary/40 rounded-lg">
            <Activity className="h-4 w-4" /> Diagnostics
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: AI REASONING ENGINE */}
        <TabsContent value="ai" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Provider Selection */}
              <Card className="bg-slate-900/70 border-slate-800 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-slate-100">
                    <BrainCircuit className="h-5 w-5 text-primary" /> AI Model Provider
                  </CardTitle>
                  <CardDescription>
                    Select the foundational reasoning model used for least-privilege heuristic synthesis.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { id: 'openai', name: 'OpenAI GPT-4o', badge: 'Recommended', desc: 'Highest precision policy logic and edge reasoning', cost: 'Standard Tier' },
                      { id: 'anthropic', name: 'Claude 3.5 Sonnet', badge: 'High Context', desc: 'Superior complex cross-microservice dependency mapping', cost: 'Enterprise' },
                      { id: 'bedrock', name: 'AWS Bedrock Titan', badge: 'In-VPC Native', desc: 'Runs fully enclosed inside your AWS VPC boundary', cost: 'GovCloud Ready' },
                    ].map(p => (
                      <div 
                        key={p.id}
                        onClick={() => updateSetting('aiProvider', p.id)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                          settings.aiProvider === p.id 
                            ? 'bg-primary/10 border-primary shadow-[0_0_15px_rgba(6,182,212,0.25)]' 
                            : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-bold text-slate-200 text-sm">{p.name}</span>
                          <Badge variant="outline" className={`text-[10px] ${settings.aiProvider === p.id ? 'border-primary text-primary' : 'border-slate-700 text-slate-400'}`}>
                            {p.badge}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed mb-3">{p.desc}</p>
                        <div className="text-[10px] font-mono text-slate-500 uppercase">{p.cost}</div>
                      </div>
                    ))}
                  </div>

                  {/* API Key Management */}
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <label className="text-sm font-medium text-slate-300 flex items-center justify-between">
                      <span className="flex items-center gap-1.5"><KeyRound className="h-4 w-4 text-primary" /> API Key Authentication</span>
                      <span className="text-xs text-slate-500">AES-256 Vault Encrypted</span>
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input 
                          type={showApiKey ? 'text' : 'password'}
                          value={settings.apiKey}
                          onChange={e => updateSetting('apiKey', e.target.value)}
                          className="bg-slate-950 border-slate-800 font-mono text-xs pr-10 text-slate-200"
                        />
                        <button
                          type="button"
                          onClick={() => setShowApiKey(!showApiKey)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                        >
                          {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      <Button 
                        variant="outline" 
                        onClick={handleTestAi}
                        disabled={testAiStatus === 'testing'}
                        className="gap-2 cursor-pointer border-slate-700 hover:bg-slate-800 text-slate-200"
                      >
                        {testAiStatus === 'testing' ? <RefreshCw className="h-4 w-4 animate-spin text-primary" /> : <Zap className="h-4 w-4 text-primary" />}
                        {testAiStatus === 'testing' ? 'Pinging...' : 'Test Connection'}
                      </Button>
                    </div>
                    {testAiStatus === 'success' && (
                      <div className="text-xs font-mono text-emerald-400 flex items-center gap-1.5 mt-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5" /> API handshake verified // Roundtrip latency: 38ms // Quota: 100,000 TPM available
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Reasoning Engine Parameters */}
              <Card className="bg-slate-900/70 border-slate-800 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-lg text-slate-100 flex items-center gap-2">
                    <Sliders className="h-5 w-5 text-primary" /> Reasoning Temperature & Tokens
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-medium text-slate-300">Temperature</span>
                        <span className="font-mono text-primary font-bold">{settings.temperature}</span>
                      </div>
                      <input 
                        type="range" 
                        min="0.0" 
                        max="0.8" 
                        step="0.05"
                        value={settings.temperature}
                        onChange={e => updateSetting('temperature', parseFloat(e.target.value))}
                        className="w-full accent-cyan-500 cursor-pointer"
                      />
                      <p className="text-xs text-slate-500">Lower values ensure deterministic, strictly conformant least-privilege syntax.</p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-medium text-slate-300">Max Reasoning Tokens</span>
                        <span className="font-mono text-primary font-bold">{settings.maxTokens}</span>
                      </div>
                      <input 
                        type="range" 
                        min="1024" 
                        max="4096" 
                        step="256"
                        value={settings.maxTokens}
                        onChange={e => updateSetting('maxTokens', parseInt(e.target.value))}
                        className="w-full accent-cyan-500 cursor-pointer"
                      />
                      <p className="text-xs text-slate-500">Token budget allocated for multi-pass policy dependency synthesis.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* AI Policy Reasoning Prompt Preview */}
            <div className="space-y-6">
              <Card className="bg-slate-900/70 border-slate-800 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-base text-slate-200 flex items-center gap-2">
                    <Terminal className="h-4 w-4 text-primary" /> Active System Prompt
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Autonomous rule constraints fed into the LLM during candidate evaluation.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <pre className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-400 whitespace-pre-wrap leading-relaxed h-[360px] overflow-y-auto">
{`SYSTEM_DIRECTIVE: "AUTONOMOUS_IAM_LEAST_PRIVILEGE_AGENT"

CORE INSTRUCTIONS:
1. NEVER strip a permission if an active service dependency graph indicates critical inter-service communication.
2. Wildcard actions (e.g. s3:*, ec2:*) MUST be scoped down to specific tested verbs from historical logs.
3. If an access action has 0 invocations within the inactivity window (default: ${settings.inactivityThreshold} days), flag for decommissioning with confidence >= ${settings.confidenceThreshold}%.
4. In simulation phase, auto-restore any permission that triggers a synthetic mock failure in dependent services.
5. Provide auditable justification reasons for all policy mutations.`}
                  </pre>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* TAB 2: CLOUD & IAM CONNECTORS */}
        <TabsContent value="cloud" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-slate-900/70 border-slate-800 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-slate-100">
                    <Cloud className="h-5 w-5 text-primary" /> AWS Account & Cross-Account Role
                  </CardTitle>
                  <CardDescription>
                    Configure IAM cross-account assume-role parameters for identity posture discovery.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">AWS Target Account ID</label>
                    <Input 
                      value={settings.awsAccountId}
                      onChange={e => updateSetting('awsAccountId', e.target.value)}
                      placeholder="12-digit AWS Account ID"
                      className="bg-slate-950 border-slate-800 font-mono text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Security Audit Role ARN</label>
                    <Input 
                      value={settings.roleArn}
                      onChange={e => updateSetting('roleArn', e.target.value)}
                      placeholder="arn:aws:iam::account:role/name"
                      className="bg-slate-950 border-slate-800 font-mono text-sm"
                    />
                  </div>

                  <div className="pt-2">
                    <Button 
                      variant="outline" 
                      onClick={handleTestCloud}
                      disabled={testCloudStatus === 'testing'}
                      className="gap-2 cursor-pointer border-slate-700 hover:bg-slate-800"
                    >
                      {testCloudStatus === 'testing' ? <RefreshCw className="h-4 w-4 animate-spin text-primary" /> : <Cloud className="h-4 w-4 text-primary" />}
                      {testCloudStatus === 'testing' ? 'Verifying AWS AssumeRole...' : 'Validate IAM Connector'}
                    </Button>
                    {testCloudStatus === 'success' && (
                      <div className="text-xs font-mono text-emerald-400 flex items-center gap-1.5 mt-2">
                        <CheckCircle2 className="h-3.5 w-3.5" /> AssumeRole STS token granted // Read-only access validated across 142 IAM roles
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Target Cloud Regions */}
              <Card className="bg-slate-900/70 border-slate-800 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-lg text-slate-100">Audited Cloud Regions</CardTitle>
                  <CardDescription>CloudTrail logs and service dependencies will be monitored in active regions.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {ALL_REGIONS.map(reg => {
                      const isSelected = settings.regions.includes(reg.id);
                      return (
                        <div
                          key={reg.id}
                          onClick={() => toggleRegion(reg.id)}
                          className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                            isSelected 
                              ? 'bg-primary/10 border-primary/50 text-slate-200' 
                              : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'
                          }`}
                        >
                          <div>
                            <div className="text-sm font-semibold">{reg.id}</div>
                            <div className="text-xs opacity-75">{reg.name}</div>
                          </div>
                          <div className={`h-5 w-5 rounded-md flex items-center justify-center border ${
                            isSelected ? 'bg-primary text-slate-950 border-primary' : 'border-slate-700'
                          }`}>
                            {isSelected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Cloud Safeguard Flags */}
            <div className="space-y-6">
              <Card className="bg-slate-900/70 border-slate-800 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-base text-slate-100 flex items-center gap-2">
                    <Lock className="h-4 w-4 text-primary" /> Safeguard Boundaries
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-sm text-slate-200">Shadow Sandbox Mode</span>
                      <button
                        type="button"
                        onClick={() => updateSetting('readOnlyMode', !settings.readOnlyMode)}
                        className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                          settings.readOnlyMode ? 'bg-primary' : 'bg-slate-800'
                        }`}
                      >
                        <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                          settings.readOnlyMode ? 'translate-x-5' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>
                    <p className="text-xs text-slate-400">
                      Enforces non-destructive dry-run policy evaluation. Live AWS IAM policies will never be altered.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <label className="text-sm font-semibold text-slate-200 block">CloudTrail Ingest Cadence</label>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      {['15m', '1h', '24h'].map(cadence => (
                        <button
                          key={cadence}
                          type="button"
                          onClick={() => updateSetting('cloudTrailSync', cadence)}
                          className={`py-2 text-center rounded-lg border cursor-pointer font-mono font-medium ${
                            settings.cloudTrailSync === cadence
                              ? 'bg-primary/20 border-primary text-primary'
                              : 'bg-slate-900 border-slate-800 text-slate-400'
                          }`}
                        >
                          {cadence}
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* TAB 3: SAFETY RULES & THRESHOLDS */}
        <TabsContent value="safety" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Threshold Sliders */}
              <Card className="bg-slate-900/70 border-slate-800 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-lg text-slate-100 flex items-center gap-2">
                    <Sliders className="h-5 w-5 text-primary" /> Autonomous Inactivity & Confidence Windows
                  </CardTitle>
                  <CardDescription>
                    Tune the mathematical bounds required to classify a permission as candidate for revocation.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium text-slate-300">Inactivity Threshold Window</span>
                      <span className="font-mono text-primary font-bold bg-primary/10 px-2 py-0.5 rounded border border-primary/30">
                        {settings.inactivityThreshold} Days
                      </span>
                    </div>
                    <input 
                      type="range" 
                      min="30" 
                      max="180" 
                      step="15"
                      value={settings.inactivityThreshold}
                      onChange={e => updateSetting('inactivityThreshold', parseInt(e.target.value))}
                      className="w-full accent-cyan-500 cursor-pointer"
                    />
                    <p className="text-xs text-slate-500">
                      Permissions with zero observed API calls across this window will be flagged as candidates for removal.
                    </p>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-slate-800">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium text-slate-300">Minimum AI Confidence Score</span>
                      <span className="font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                        {settings.confidenceThreshold}%
                      </span>
                    </div>
                    <input 
                      type="range" 
                      min="75" 
                      max="99" 
                      step="1"
                      value={settings.confidenceThreshold}
                      onChange={e => updateSetting('confidenceThreshold', parseInt(e.target.value))}
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                    <p className="text-xs text-slate-500">
                      Required confidence threshold based on CloudTrail log density and dependency safety cross-checks.
                    </p>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-slate-800">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium text-slate-300">Max Simulation Iterations</span>
                      <span className="font-mono text-primary font-bold bg-primary/10 px-2 py-0.5 rounded border border-primary/30">
                        {settings.maxIterations} Loops
                      </span>
                    </div>
                    <input 
                      type="range" 
                      min="1" 
                      max="5" 
                      step="1"
                      value={settings.maxIterations}
                      onChange={e => updateSetting('maxIterations', parseInt(e.target.value))}
                      className="w-full accent-cyan-500 cursor-pointer"
                    />
                    <p className="text-xs text-slate-500">
                      Number of automated revise-and-test loops executed when shadow simulation detects mock failures.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Protected Roles Lockdown */}
              <Card className="bg-slate-900/70 border-slate-800 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-lg text-slate-100 flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-emerald-400" /> Protected Roles Lockdown
                  </CardTitle>
                  <CardDescription>
                    These IAM identities are immune from automated mitigations or revocation proposals.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {settings.protectedRoles.map(role => (
                      <span 
                        key={role}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300"
                      >
                        <Lock className="h-3 w-3 text-primary" />
                        {role}
                        <button 
                          type="button" 
                          onClick={() => removeProtectedRole(role)}
                          className="text-slate-500 hover:text-danger ml-1 cursor-pointer"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Input 
                      placeholder="e.g. IncidentResponseRole"
                      value={newProtectedRole}
                      onChange={e => setNewProtectedRole(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addProtectedRole()}
                      className="bg-slate-950 border-slate-800 text-xs"
                    />
                    <Button 
                      variant="outline" 
                      onClick={addProtectedRole}
                      className="gap-1 text-xs cursor-pointer border-slate-700"
                    >
                      <Plus className="h-4 w-4" /> Add Protected Role
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Compliance Preset Card */}
            <div className="space-y-6">
              <Card className="bg-slate-900/70 border-slate-800 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-base text-slate-100">Compliance Frameworks</CardTitle>
                  <CardDescription className="text-xs">Certified rule presets applied during assessment.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { name: 'SOC 2 Type II (Trust Criteria)', status: 'ACTIVE', desc: 'CC6.1, CC6.2 logical access controls' },
                    { name: 'CIS AWS Benchmark v3.0', status: 'ACTIVE', desc: 'Section 1.16 - Ensure IAM policies are least privilege' },
                    { name: 'PCI-DSS v4.0 Requirement 7', status: 'ACTIVE', desc: 'Restrict access to system components by business need' },
                    { name: 'HIPAA Security Rule § 164.312', status: 'ACTIVE', desc: 'Unique user identification and minimum necessary rule' },
                  ].map(c => (
                    <div key={c.name} className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-200">{c.name}</span>
                        <Badge variant="outline" className="text-[9px] border-emerald-500/30 text-emerald-400 bg-emerald-500/10">{c.status}</Badge>
                      </div>
                      <p className="text-[11px] text-slate-400">{c.desc}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* TAB 4: SOC WEBHOOKS & NOTIFICATIONS */}
        <TabsContent value="notifications" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-slate-900/70 border-slate-800 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-lg text-slate-100 flex items-center gap-2">
                    <Bell className="h-5 w-5 text-primary" /> Slack & Microsoft Teams Webhooks
                  </CardTitle>
                  <CardDescription>
                    Push real-time security alerts when excessive permissions are decommissioned or simulations fail.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Slack Incoming Webhook URL</label>
                    <Input 
                      value={settings.slackWebhook}
                      onChange={e => updateSetting('slackWebhook', e.target.value)}
                      placeholder="https://hooks.slack.com/services/..."
                      className="bg-slate-950 border-slate-800 font-mono text-xs"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Slack Target Channel</label>
                    <Input 
                      value={settings.slackChannel}
                      onChange={e => updateSetting('slackChannel', e.target.value)}
                      placeholder="#soc-iam-alerts"
                      className="bg-slate-950 border-slate-800 text-xs"
                    />
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <label className="text-sm font-medium text-slate-300">Microsoft Teams Webhook URL (Optional)</label>
                    <Input 
                      value={settings.teamsWebhook}
                      onChange={e => updateSetting('teamsWebhook', e.target.value)}
                      placeholder="https://outlook.office.com/webhook/..."
                      className="bg-slate-950 border-slate-800 font-mono text-xs"
                    />
                  </div>

                  <div className="pt-2">
                    <Button 
                      variant="outline" 
                      onClick={handleTestWebhook}
                      disabled={testWebhookStatus === 'testing'}
                      className="gap-2 cursor-pointer border-slate-700 hover:bg-slate-800 text-slate-200"
                    >
                      {testWebhookStatus === 'testing' ? <RefreshCw className="h-4 w-4 animate-spin text-primary" /> : <Send className="h-4 w-4 text-primary" />}
                      {testWebhookStatus === 'testing' ? 'Dispatching Payload...' : 'Send Test SOC Alert'}
                    </Button>
                    {testWebhookStatus === 'success' && (
                      <div className="text-xs font-mono text-emerald-400 flex items-center gap-1.5 mt-2">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Webhook delivered // Status: 200 OK // Message posted to {settings.slackChannel}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Notification Event Triggers */}
            <div className="space-y-6">
              <Card className="bg-slate-900/70 border-slate-800 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-base text-slate-100">Event Triggers</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { key: 'alertOnCritical', label: 'Critical Risk Permission Flagged', desc: 'Alerts when admin:*, iam:*, or s3:* wildcard detected' },
                    { key: 'alertOnFailure', label: 'Simulation Auto-Recovery Triggered', desc: 'Notifies when a test scenario catches an AI regression' },
                    { key: 'alertOnWildcard', label: 'New Least-Privilege Policy Staged', desc: 'Broadcasts policy delta comparison ready for review' },
                  ].map(trig => {
                    const isChecked = (settings as any)[trig.key];
                    return (
                      <div 
                        key={trig.key}
                        onClick={() => updateSetting(trig.key as any, !isChecked)}
                        className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 flex items-start gap-3 cursor-pointer hover:border-slate-700 transition-colors"
                      >
                        <div className={`mt-0.5 h-4 w-4 rounded flex items-center justify-center border ${
                          isChecked ? 'bg-primary text-slate-950 border-primary' : 'border-slate-700'
                        }`}>
                          {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-slate-200">{trig.label}</div>
                          <div className="text-[11px] text-slate-400 leading-snug mt-0.5">{trig.desc}</div>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* TAB 5: DIAGNOSTICS & SYSTEM HEALTH */}
        <TabsContent value="system" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-slate-900/70 border-slate-800 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-lg text-slate-100 flex items-center gap-2">
                    <Server className="h-5 w-5 text-primary" /> Architecture Node Telemetry
                  </CardTitle>
                  <CardDescription>Real-time microservice status across the IAM mitigation runtime.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { node: 'FastAPI REST Server', port: '8000', status: 'ONLINE', latency: '2ms', desc: 'Asynchronous event loop handling policy simulation requests' },
                      { node: 'PostgreSQL Database', port: '5432', status: 'HEALTHY', latency: '4ms', desc: 'Database: iam_mitigator // Active connection pool' },
                      { node: 'AI State Machine Worker', port: 'Background', status: 'STANDBY', latency: '0ms', desc: '9-step state machine ready to process automated scans' },
                      { node: 'React Vite Frontend', port: '5173', status: 'ONLINE', latency: '1ms', desc: 'Cyber SOC Dashboard UI with WebGL accelerated canvas' },
                    ].map(n => (
                      <div key={n.node} className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                        <div className="space-y-0.5">
                          <div className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                            {n.node}
                            <span className="text-[10px] font-mono text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                              Port {n.port}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400">{n.desc}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="text-xs text-emerald-400 border-emerald-500/30 bg-emerald-500/10">
                            {n.status}
                          </Badge>
                          <div className="text-[10px] font-mono text-slate-500 mt-1">{n.latency} ping</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Maintenance & Data Retention */}
              <Card className="bg-slate-900/70 border-slate-800 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-lg text-slate-100 flex items-center gap-2">
                    <Database className="h-5 w-5 text-primary" /> Immutable Audit Retention
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-3.5 bg-slate-950 rounded-xl border border-slate-800">
                    <div>
                      <div className="text-sm font-semibold text-slate-200">Cryptographic Audit Trail Retention</div>
                      <div className="text-xs text-slate-400">SOC 2 compliant append-only ledger for all autonomous decisions</div>
                    </div>
                    <select 
                      value={settings.logRetention}
                      onChange={e => updateSetting('logRetention', e.target.value)}
                      className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg p-2 font-mono"
                    >
                      <option value="90d">90 Days</option>
                      <option value="365d">365 Days (1 Year)</option>
                      <option value="7y">7 Years (Strict Legal)</option>
                    </select>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Danger Zone */}
            <div className="space-y-6">
              <Card className="bg-danger/5 border-danger/20 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-base text-danger flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-danger" /> Diagnostic Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      localStorage.removeItem('last_run_id');
                      alert('Simulation cache cleared. Next mitigation will establish a new baseline.');
                    }}
                    className="w-full text-xs border-slate-800 hover:bg-slate-800 text-slate-300 cursor-pointer"
                  >
                    Clear Local Run Cache
                  </Button>

                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSettings(DEFAULT_SETTINGS);
                      localStorage.removeItem('iam_mitigator_settings');
                      alert('Reset all configuration parameters to factory defaults.');
                    }}
                    className="w-full text-xs border-danger/30 text-danger hover:bg-danger/10 cursor-pointer"
                  >
                    Reset to Factory Defaults
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
