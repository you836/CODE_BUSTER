import { 
  User, DashboardData, IAMRole, Permission, AccessLog, Candidate, 
  PolicyCompare, SimulationResponse, VerificationResponse, AuditLogEntry, 
  AnalysisRun, ServiceDependency, ReportData 
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

class ApiService {
  private token: string | null = null;
  
  setToken(token: string) { 
    this.token = token; 
    localStorage.setItem('token', token); 
  }
  
  getToken() { 
    return this.token || localStorage.getItem('token'); 
  }
  
  clearToken() { 
    this.token = null; 
    localStorage.removeItem('token'); 
  }
  
  private async request(path: string, options: RequestInit = {}) {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers,
      });
      
      const contentType = response.headers.get('content-type') || '';
      if (!response.ok || !contentType.includes('application/json')) {
        if (response.status === 401) {
          this.clearToken();
          window.location.href = '/login';
        }
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.warn(`API call failed for ${path}, using mock data:`, error);
      return await this.mockRequest(path, options);
    }
  }

  // MOCK IMPLEMENTATION FOR UI DEVELOPMENT
  private async mockRequest(path: string, options: RequestInit = {}): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate latency
    
    if (path === '/auth/login') return { access_token: 'mock-token', token_type: 'bearer' };
    if (path === '/auth/me') return { id: '1', username: 'admin', email: 'admin@example.com', full_name: 'Admin User', role: 'admin' };
    if (path === '/dashboard') return { 
      total_roles: 142, total_users: 56, total_permissions: 1250, 
      excessive_permissions: 87, unused_permissions: 31, high_risk_permissions: 12, 
      policies_analyzed: 142, permissions_removed: 45, risk_reduction: 42, simulation_pass_rate: 98,
      permissions_by_risk: [
        {name: 'CRITICAL', value: 12, color: '#a855f7'},
        {name: 'HIGH', value: 45, color: '#ef4444'},
        {name: 'MEDIUM', value: 312, color: '#f59e0b'},
        {name: 'LOW', value: 881, color: '#10b981'}
      ],
      permissions_used_vs_unused: {used: 1132, unused: 118},
      risk_reduction_over_time: [
        {date: 'Mon', score: 65}, {date: 'Tue', score: 72}, {date: 'Wed', score: 78}, {date: 'Thu', score: 85}, {date: 'Fri', score: 91}
      ],
      roles_by_security_score: [
        {name: 'AdminRole', score: 45, risk_level: 'CRITICAL'},
        {name: 'DevOpsRole', score: 65, risk_level: 'HIGH'},
        {name: 'S3ReaderRole', score: 95, risk_level: 'LOW'}
      ]
    };
    if (path === '/roles') return [
      { id: '1', role_name: 'AdminRole', service: 'IAM', total_permissions: 450, used_permissions: 120, unused_permissions: 330, risk_score: 45, risk_level: 'CRITICAL', last_activity: '2 mins ago', status: 'needs_review' },
      { id: '2', role_name: 'S3ReaderRole', service: 'S3', total_permissions: 5, used_permissions: 5, unused_permissions: 0, risk_score: 95, risk_level: 'LOW', last_activity: '1 hour ago', status: 'compliant' }
    ];
    if (path.startsWith('/roles/')) return {
      role: { id: '1', role_name: 'AdminRole', service: 'IAM', total_permissions: 450, used_permissions: 120, unused_permissions: 330, risk_score: 45, risk_level: 'CRITICAL', last_activity: '2 mins ago', status: 'needs_review', description: 'Administrator access' },
      permissions: [
        { id: 'p1', action: 's3:*', resource: '*', effect: 'Allow', service: 'S3', is_wildcard: true, is_admin: false, risk_level: 'HIGH', is_used: true, usage_count: 50, last_used: '1 day ago', required_by: 'BackupService', recommendation: 'RESTRICT', description: 'Full S3 access' }
      ]
    };
    if (path.startsWith('/analyze') && options.method === 'POST') return { run_id: 'mock-run-123' };
    if (path.startsWith('/analyze/')) return {
      id: 'mock-run-123', status: 'COMPLETED', current_state: 'FINALIZE', started_at: new Date().toISOString(), completed_at: new Date().toISOString(),
      total_permissions_analyzed: 87, excessive_found: 18, unused_found: 13, candidates_generated: 31, permissions_removed: 18, permissions_retained: 13, simulation_iterations: 2, risk_reduction: 42, initial_score: 49, final_score: 91, error_message: null
    };
    if (path.startsWith('/candidates')) return [
      { id: 'c1', action: 's3:*', resource: '*', reason: 'Wildcard usage', risk_level: 'HIGH', recommendation: 'RESTRICT', confidence: 95, evidence: {}, status: 'pending', role_name: 'AdminRole', role_id: '1' }
    ];
    if (path.startsWith('/policy/generate')) return { current_policy: { Statement: [] }, proposed_policy: { Statement: [] }, changes: [], explanation: 'Generated least privilege policy' };
    if (path.startsWith('/policy/simulate')) return { passed: true, results: [], iteration: 1, summary: 'Simulation passed' };
    if (path.startsWith('/policy/dependencies')) return [
      { source_service: 'EC2', target_service: 'S3', dependency_type: 'reads', required_permissions: ['s3:GetObject'], description: 'EC2 reads from S3', is_critical: true }
    ];
    if (path.startsWith('/audit-log')) return [
      { id: 'a1', event_type: 'POLICY_CHANGE', action: 'Removed s3:*', permission_action: 's3:*', role_name: 'AdminRole', reason: 'Unused', evidence: 'No logs in 90 days', confidence: 99, simulation_status: 'PASSED', timestamp: new Date().toISOString(), details: {} }
    ];
    return {}; // Default fallback
  }
  
  // Auth
  async login(username, password) { return this.request('/auth/login', { method: 'POST', body: JSON.stringify({username, password}) }); }
  async getMe() { return this.request('/auth/me'); }
  
  // Dashboard
  async getDashboard() { return this.request('/dashboard'); }
  
  // Roles  
  async getRoles() { return this.request('/roles'); }
  async getRole(roleId) { return this.request(`/roles/${roleId}`); }
  
  // Permissions
  async getPermissions(roleId) { return this.request(`/permissions${roleId ? `?role_id=${roleId}` : ''}`); }
  
  // Access Logs
  async getAccessLogs(roleId) { return this.request(`/access-logs${roleId ? `?role_id=${roleId}` : ''}`); }
  
  // Analysis
  async startAnalysis(): Promise<{run_id: string}> { return this.request('/analyze', { method: 'POST' }); }
  async getAnalysisRun(runId) { return this.request(`/analyze/${runId}`); }
  
  // Candidates
  async getCandidates(runId) { return this.request(`/candidates${runId ? `?run_id=${runId}` : ''}`); }
  async updateCandidate(candidateId, status) { return this.request(`/candidates/${candidateId}`, { method: 'PATCH', body: JSON.stringify({status}) }); }
  
  // Policy
  async generatePolicy(runId?: string) { return this.request(`/policy/generate`, { method: 'POST', body: JSON.stringify({run_id: runId}) }); }
  async simulatePolicy(runId?: string) { return this.request(`/policy/simulate`, { method: 'POST', body: JSON.stringify({run_id: runId}) }); }
  async revisePolicy(runId?: string) { return this.request(`/policy/revise`, { method: 'POST', body: JSON.stringify({run_id: runId}) }); }
  async verifyPolicy(runId?: string) { return this.request(`/policy/verify`, { method: 'POST', body: JSON.stringify({run_id: runId}) }); }
  async getFinalPolicy(runId: string) { return this.request(`/policy/final/${runId}`); }
  async getPolicyComparison(runId: string) { return this.request(`/policy/compare/${runId}`); }
  
  // Dependencies
  async getDependencies() { return this.request('/policy/dependencies'); }
  
  // Audit
  async getAuditLog(runId) { return this.request(`/audit-log${runId ? `?run_id=${runId}` : ''}`); }
  
  // Report
  async getReport(runId) { return this.request(`/report/${runId}`); }
}

export const api = new ApiService();
