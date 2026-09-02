import React, { useState } from 'react';
import { useAdminAuth } from '../../shared/context/AdminAuthContext';
import { Lock, Mail, ShieldAlert, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const { loginAsAdmin, loginWithGoogleAsAdmin, demoOwnerLogin, error, clearError } = useAdminAuth();

  const [email, setEmail] = useState('arcbeing3@gmail.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setLoading(true);
    try {
      await loginAsAdmin(email, password);
    } catch (err: any) {
      setLocalError(err.message || 'Invalid administrator credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLocalError(null);
    setLoading(true);
    try {
      await loginWithGoogleAsAdmin();
    } catch (err: any) {
      setLocalError(err.message || 'Google administrator authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoOwnerLogin = async () => {
    setLocalError(null);
    setLoading(true);
    try {
      await demoOwnerLogin();
    } catch (err: any) {
      setLocalError('Failed demo owner access.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-center items-center p-4 sm:p-6 select-none font-sans">
      <div className="w-full max-w-md space-y-8">
        {/* Header & Logo */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 bg-white text-zinc-950 rounded-2xl mx-auto flex items-center justify-center font-black text-2xl shadow-xl">
            A
          </div>
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-zinc-500">
              Private Owner Interface
            </span>
            <h1 className="text-2xl font-black tracking-tight text-white mt-1">
              ARC Management Panel
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Single-Vendor administrative access & inventory command center.
            </p>
          </div>
        </div>

        {/* Login Box */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-8 shadow-2xl space-y-6">
          {(error || localError) && (
            <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-800/80 text-xs text-rose-300 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error || localError}</span>
            </div>
          )}

          {/* Direct Demo Owner Access Button */}
          <div className="p-4 rounded-2xl bg-zinc-800/80 border border-zinc-700/60 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                ARC Owner Fast Access
              </span>
              <span className="text-[10px] text-zinc-400">Owner Session</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Instant one-click administrator session for the verified ARC owner.
            </p>
            <button
              type="button"
              onClick={handleDemoOwnerLogin}
              disabled={loading}
              className="w-full py-2.5 px-4 bg-white hover:bg-zinc-100 text-zinc-950 text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow flex items-center justify-center gap-2 mt-2"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Open ARC Control Center</span>
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-800" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-zinc-900 px-2 text-zinc-500 font-bold">Or authenticate with password</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Owner Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="arcbeing3@gmail.com"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-zinc-950 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Admin Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-zinc-950 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In as Owner'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-2.5 px-4 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-xs font-semibold text-zinc-300 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <span>Sign In with Owner Google Account</span>
          </button>
        </div>

        {/* Security Notice */}
        <p className="text-center text-[11px] text-zinc-500">
          Strict single-vendor security. Non-administrative users are automatically restricted by Firestore rules.
        </p>
      </div>
    </div>
  );
};
