import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/services/api';
import { IAMRole, Permission } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Tooltip } from '@/components/ui/tooltip';
import { ArrowLeft, FileCode, Clock, ShieldAlert } from 'lucide-react';

export default function RoleDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [role, setRole] = useState<IAMRole | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);

  useEffect(() => {
    if (id) {
      api.getRole(id).then(data => {
        setRole(data.role || data);
        setPermissions(data.permissions || []);
      });
    }
  }, [id]);

  if (!role) return <div className="p-8 text-center text-slate-400">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/roles')} className="text-slate-400 hover:text-white">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{role.role_name}</h1>
          <p className="text-sm text-slate-400 font-mono mt-1">{role.arn || `arn:aws:iam::123456789012:role/${role.role_name}`}</p>
        </div>
        <div className="ml-auto">
          <Button onClick={() => navigate('/policy', { state: { roleId: role.id } })} className="gap-2">
            <FileCode className="h-4 w-4" />
            Generate Least-Privilege Policy
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-400">Total Permissions</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{role.total_permissions}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-400">Used Permissions</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-success">{role.used_permissions}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-400">Unused Permissions</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-warning">{role.unused_permissions}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between"><CardTitle className="text-sm text-slate-400">Risk Score</CardTitle><Badge variant={role.risk_level.toLowerCase() as any}>{role.risk_level}</Badge></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">{role.risk_score}/100</div>
            <Progress value={role.risk_score} className="h-2" indicatorClassName={role.risk_score > 80 ? 'bg-critical' : 'bg-warning'} />
          </CardContent>
        </Card>
      </div>

      <div className="rounded-md border border-slate-700 bg-slate-900 overflow-hidden">
        <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
          <h3 className="font-medium text-slate-200">Permissions Analysis</h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Permission</TableHead>
              <TableHead>Resource</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead>Risk Level</TableHead>
              <TableHead>Required By</TableHead>
              <TableHead>Recommendation</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {permissions.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-mono text-xs text-slate-300">{p.action}</TableCell>
                <TableCell>
                  <Tooltip content={p.resource}>
                    <div className="max-w-[150px] truncate text-xs font-mono">{p.resource}</div>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col text-xs">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3 text-slate-500" /> {p.last_used || 'Never'}</span>
                    <span className="text-slate-500">{p.usage_count} calls</span>
                  </div>
                </TableCell>
                <TableCell><Badge variant={p.risk_level.toLowerCase() as any}>{p.risk_level}</Badge></TableCell>
                <TableCell className="text-xs text-slate-400">{p.required_by || '-'}</TableCell>
                <TableCell><span className={`text-xs font-medium ${p.recommendation === 'REMOVE' ? 'text-danger' : p.recommendation === 'RESTRICT' ? 'text-warning' : 'text-success'}`}>{p.recommendation}</span></TableCell>
                <TableCell><Badge variant={p.is_used ? 'used' : 'unused'}>{p.is_used ? 'USED' : 'UNUSED'}</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
