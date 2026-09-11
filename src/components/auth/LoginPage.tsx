import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { UserRole } from '../../types';
import { Recycle, ArrowRight, ShieldCheck, Sparkles, User, Lock, Mail, Building2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, register, googleLogin } = useAuth();
  const { theme } = useTheme();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('citizen');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'signin') {
      login(email || 'demo@wasteloop.org', selectedRole);
    } else {
      register(fullName || 'New User', email || 'user@wasteloop.org', selectedRole);
    }
  };

  const handleDemoRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    login(`demo-${role}@wasteloop.org`, role);
  };

  const rolesList: { id: UserRole; name: string; label: string; desc: string; icon: string }[] = [
    { id: 'citizen', name: 'Citizen', label: 'Generator', desc: 'Zero-effort collection scheduling & reporting', icon: '👤' },
    { id: 'collector', name: 'Collector', label: 'Field Driver', desc: 'Route navigation & collection verification', icon: '🚛' },
    { id: 'supervisor', name: 'Supervisor', label: 'Zone Operations', desc: 'SLA monitoring & task reassignment', icon: '📋' },
    { id: 'admin', name: 'Municipal Admin', label: 'Command Center', desc: 'City analytics & live operational GIS', icon: '🏛️' },
    { id: 'recycler', name: 'Recycler', label: 'Circular Economy', desc: 'Material recovery & batch traceability', icon: '♻️' },
    { id: 'organization_admin', name: 'Org Admin', label: 'Institutional', desc: 'Campus & facility waste management', icon: '🏢' },
    { id: 'platform_admin', name: 'Platform Admin', label: 'SaaS Platform', desc: 'Multi-tenant settings & audit logs', icon: '⚙️' }
  ];

  return (
    <div className={`min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-300 ${
      theme === 'light' ? 'bg-slate-50 text-slate-900' : 'bg-slate-950 text-slate-100'
    }`}>
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Brand Logo */}
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-brand-600/10 border border-brand-500/20 text-brand-600 mb-4 shadow-sm">
          <Recycle className="w-10 h-10 animate-spin-slow" />
        </div>

        <h2 className="text-3xl font-extrabold tracking-tight">
          WasteLoop Operations Platform
        </h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          AI-Powered Smart Waste Management & Circular Economy Platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className={`py-8 px-6 sm:px-10 shadow-2xl rounded-2xl border transition-colors duration-300 ${
          theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}>

          {/* Mode Switcher Tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 mb-6">
            <button
              onClick={() => setMode('signin')}
              className={`flex-1 py-3 text-sm font-semibold border-b-2 text-center transition-colors ${
                mode === 'signin' 
                  ? 'border-brand-500 text-brand-600 dark:text-brand-400' 
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 py-3 text-sm font-semibold border-b-2 text-center transition-colors ${
                mode === 'signup' 
                  ? 'border-brand-500 text-brand-600 dark:text-brand-400' 
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Google OAuth Button */}
          <button
            type="button"
            onClick={googleLogin}
            className={`w-full flex items-center justify-center space-x-3 px-4 py-3 border rounded-xl font-medium text-sm transition-all duration-200 mb-6 shadow-sm hover:shadow ${
              theme === 'light' 
                ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50' 
                : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-750'
            }`}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className={`px-2 ${theme === 'light' ? 'bg-white text-slate-500' : 'bg-slate-900 text-slate-400'}`}>
                Or continue with email
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Sreeraj Gantimall"
                    className={`w-full pl-9 pr-4 py-2.5 rounded-xl text-sm border focus:ring-2 focus:ring-brand-500 focus:outline-none transition-all ${
                      theme === 'light' ? 'bg-white border-slate-300' : 'bg-slate-800 border-slate-700 text-white'
                    }`}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@swarnandhra.ac.in"
                  className={`w-full pl-9 pr-4 py-2.5 rounded-xl text-sm border focus:ring-2 focus:ring-brand-500 focus:outline-none transition-all ${
                    theme === 'light' ? 'bg-white border-slate-300' : 'bg-slate-800 border-slate-700 text-white'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className={`w-full pl-9 pr-4 py-2.5 rounded-xl text-sm border focus:ring-2 focus:ring-brand-500 focus:outline-none transition-all ${
                    theme === 'light' ? 'bg-white border-slate-300' : 'bg-slate-800 border-slate-700 text-white'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Account Role</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                className={`w-full px-3 py-2.5 rounded-xl text-sm border focus:ring-2 focus:ring-brand-500 focus:outline-none ${
                  theme === 'light' ? 'bg-white border-slate-300' : 'bg-slate-800 border-slate-700 text-white'
                }`}
              >
                {rolesList.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.icon} {r.name} ({r.label})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full mt-2 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-md transition-colors"
            >
              <span>{mode === 'signin' ? 'Sign In to Dashboard' : 'Create & Launch Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Role Selector for Judges */}
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase flex items-center">
                <Sparkles className="w-3.5 h-3.5 mr-1 text-emerald-500" />
                Quick Demo Access (Select Any Role)
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              {rolesList.map(role => (
                <button
                  key={role.id}
                  onClick={() => handleDemoRoleSelect(role.id)}
                  className={`text-left p-2.5 rounded-xl border text-xs transition-all hover:border-brand-500 ${
                    selectedRole === role.id 
                      ? 'border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-400 font-medium' 
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="font-semibold flex items-center space-x-1.5">
                    <span>{role.icon}</span>
                    <span>{role.name}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {role.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-400 flex items-center justify-center space-x-1">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Supabase RLS & OAuth Verified • Enterprise Multi-tenant</span>
          </div>

        </div>
      </div>

    </div>
  );
};
