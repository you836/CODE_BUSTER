import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

import Lightfall from '@/components/ui/Lightfall';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(username, password);
    navigate('/dashboard');
  };

  const handleDemoLogin = async () => {
    setUsername('admin');
    setPassword('admin123');
    await login('admin', 'admin123');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Interactive Lightfall WebGL Background */}
      <div className="absolute inset-0 z-0">
        <Lightfall
          colors={['#A6C8FF', '#5227FF', '#FF9FFC']}
          backgroundColor="#070c1e"
          speed={0.5}
          streakCount={3}
          streakWidth={1.2}
          streakLength={1.2}
          glow={1.2}
          density={0.6}
          twinkle={1}
          zoom={3}
          backgroundGlow={0.6}
          opacity={0.9}
          mouseInteraction
          mouseStrength={0.6}
          mouseRadius={1}
          color1="#0a0f24"
          color2="#3B82F6"
          color3="#06B6D4"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/60 pointer-events-none" />
      </div>
      
      <Card className="w-full max-w-md relative z-10 border-slate-800 bg-slate-900/80 backdrop-blur-md shadow-2xl">
        <CardHeader className="space-y-3 items-center pb-8">
          <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center mb-2 animate-pulse-glow">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">IAM Mitigator</CardTitle>
          <CardDescription>Autonomous Cloud IAM Least-Privilege</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Username</label>
              <Input 
                value={username} 
                onChange={e => setUsername(e.target.value)} 
                placeholder="admin" 
                required 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Password</label>
              <Input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                placeholder="••••••••" 
                required 
              />
            </div>
            <Button type="submit" className="w-full mt-6">Sign In</Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-slate-800 pt-6">
          <Button variant="ghost" onClick={handleDemoLogin} className="text-sm text-slate-400">
            Use Demo Credentials
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
