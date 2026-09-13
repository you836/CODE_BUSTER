import React, { useEffect, useState } from 'react';
import ReactFlow, { Background, Controls, Node, Edge } from 'reactflow';
import 'reactflow/dist/style.css';
import { api } from '@/services/api';

const initialNodes: Node[] = [
  { id: '1', position: { x: 250, y: 50 }, data: { label: 'Payment Service (EC2)' }, type: 'default', style: { background: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '8px', padding: '10px' } },
  { id: '2', position: { x: 100, y: 200 }, data: { label: 'Transaction DB (DynamoDB)' }, type: 'default', style: { background: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '8px', padding: '10px' } },
  { id: '3', position: { x: 400, y: 200 }, data: { label: 'Receipt Storage (S3)' }, type: 'default', style: { background: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '8px', padding: '10px' } },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', label: 'writes', animated: true, style: { stroke: '#06b6d4' } },
  { id: 'e1-3', source: '1', target: '3', label: 'reads/writes', animated: true, style: { stroke: '#06b6d4' } },
];

export default function DependencyGraph() {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDependencies().then(deps => {
      if (deps && deps.length > 0) {
        const newNodes: Node[] = [];
        const newEdges: Edge[] = [];
        const serviceSet = new Set<string>();

        deps.forEach((dep: any) => {
          serviceSet.add(dep.source_service);
          serviceSet.add(dep.target_service);
        });

        let x = 100;
        let y = 100;
        Array.from(serviceSet).forEach((svc, i) => {
          newNodes.push({
            id: svc,
            position: { x: x + (i % 3) * 200, y: y + Math.floor(i / 3) * 150 },
            data: { label: svc },
            type: 'default',
            style: { background: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '8px', padding: '10px' }
          });
        });

        deps.forEach((dep: any, i: number) => {
          newEdges.push({
            id: `e-${i}`,
            source: dep.source_service,
            target: dep.target_service,
            label: dep.dependency_type || 'depends',
            animated: true,
            style: { stroke: dep.is_critical ? '#ef4444' : '#06b6d4' }
          });
        });

        setNodes(newNodes);
        setEdges(newEdges);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-400">Loading...</div>;

  return (
    <div className="h-full flex flex-col space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Service Dependency Graph</h1>
        <p className="text-slate-400">Visual mapping of IAM cross-service interactions and permission dependencies</p>
      </div>
      
      <div className="flex-1 rounded-xl border border-slate-700 bg-slate-900/50 overflow-hidden relative">
        <ReactFlow nodes={nodes} edges={edges} fitView className="dark">
          <Background color="#334155" gap={16} />
          <Controls className="bg-slate-800 fill-white" />
        </ReactFlow>
        <div className="absolute top-4 right-4 bg-slate-900 border border-slate-700 p-4 rounded-lg w-64 shadow-lg">
          <h3 className="font-semibold mb-2">Graph Legend</h3>
          <div className="space-y-2 text-sm text-slate-400">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-primary" /> Service Node</div>
            <div className="flex items-center gap-2"><div className="w-4 h-0 border-t-2 border-primary border-dashed" /> Active Dependency</div>
          </div>
        </div>
      </div>
    </div>
  );
}
