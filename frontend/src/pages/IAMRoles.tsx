import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/services/api';
import { IAMRole } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export default function IAMRoles() {
  const [roles, setRoles] = useState<IAMRole[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.getRoles().then(setRoles);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">IAM Roles</h1>
        <p className="text-slate-400">Cloud identity access management roles and their security posture</p>
      </div>

      <div className="rounded-md border border-slate-700 bg-slate-900 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Role Name</TableHead>
              <TableHead>Permissions</TableHead>
              <TableHead>Used</TableHead>
              <TableHead>Unused</TableHead>
              <TableHead>Risk Score</TableHead>
              <TableHead>Risk Level</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.map((role) => (
              <TableRow key={role.id} onClick={() => navigate(`/roles/${role.id}`)} className="cursor-pointer">
                <TableCell>
                  <div className="font-medium text-slate-200">{role.role_name}</div>
                  <div className="text-xs text-slate-500">{role.service}</div>
                </TableCell>
                <TableCell>{role.total_permissions}</TableCell>
                <TableCell className="text-success">{role.used_permissions}</TableCell>
                <TableCell className="text-warning">{role.unused_permissions}</TableCell>
                <TableCell className="w-[150px]">
                  <div className="flex items-center gap-2">
                    <Progress value={role.risk_score} className="h-2" indicatorClassName={
                      role.risk_score > 80 ? 'bg-critical' : role.risk_score > 50 ? 'bg-danger' : 'bg-warning'
                    } />
                    <span className="text-xs text-slate-400">{role.risk_score}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={role.risk_level.toLowerCase() as any}>{role.risk_level}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{role.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">View</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
