'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  Shield,
  LogOut,
  Menu,
  X,
  Home,
  BarChart3,
  FileText,
  Users,
  Settings,
  Smartphone,
  Check,
  AlertTriangle,
  Loader2,
  Copy,
  Download,
  Eye,
  EyeOff,
} from 'lucide-react';

interface AdminUser {
  id: string;
  name: string | null;
  email: string | null;
  isAdmin: boolean;
  twoFactorEnabled: boolean;
}

export default function AdminSettings({ admin }: { admin: AdminUser }) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // 2FA Setup State
  const [showSetup, setShowSetup] = useState(false);
  const [setupStep, setSetupStep] = useState<'qr' | 'verify' | 'backup'>('qr');
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  
  // Disable 2FA State
  const [showDisable, setShowDisable] = useState(false);
  const [disableCode, setDisableCode] = useState('');

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/admin/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: Home, current: false },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3, current: false },
    { name: 'Resume Examples', href: '/admin/examples', icon: FileText, current: false, badge: 'Soon' },
    { name: 'Users', href: '/admin/users', icon: Users, current: false, badge: 'Soon' },
    { name: 'Settings', href: '/admin/settings', icon: Settings, current: true },
  ];

  // Start 2FA Setup
  const startSetup = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/admin/2fa/setup', {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setError(data.error || 'Failed to start setup');
        return;
      }
      
      setQrCode(data.qrCode);
      setSecret(data.secret);
      setShowSetup(true);
      setSetupStep('qr');
    } catch (err) {
      setError('Failed to start 2FA setup');
    } finally {
      setIsLoading(false);
    }
  };

  // Verify and Enable 2FA
  const verifyAndEnable = async () => {
    if (verifyCode.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/admin/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: verifyCode }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setError(data.error || 'Verification failed');
        return;
      }
      
      setBackupCodes(data.backupCodes);
      setSetupStep('backup');
    } catch (err) {
      setError('Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Disable 2FA
  const disable2FA = async () => {
    if (disableCode.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/admin/2fa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: disableCode }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setError(data.error || 'Failed to disable 2FA');
        return;
      }
      
      // Refresh the page to update admin state
      window.location.reload();
    } catch (err) {
      setError('Failed to disable 2FA');
    } finally {
      setIsLoading(false);
    }
  };

  //  backup codes
  const copyBackupCodes = () => {
    const text = backupCodes.join('\n');
    navigator.clipboard.writeText(text);
  };

  // Download backup codes
  const downloadBackupCodes = () => {
    const text = `ApplyPro Admin Backup Codes\n${'='.repeat(30)}\n\nSave these codes in a secure location.\nEach code can only be used once.\n\n${backupCodes.join('\n')}\n\nGenerated: ${new Date().toISOString()}`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'applypro-backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Finish setup
  const finishSetup = () => {
    setShowSetup(false);
    setSetupStep('qr');
    setQrCode('');
    setSecret('');
    setVerifyCode('');
    setBackupCodes([]);
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 z-50 h-full w-64 bg-slate-800 border-r border-slate-700 transform transition-transform duration-200 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-white">ApplyPro</p>
              <p className="text-xs text-slate-400">Admin Panel</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors ${
                item.current ? 'bg-blue-500/10 text-blue-400' : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </div>
              {item.badge && (
                <span className="text-xs px-2 py-0.5 bg-slate-700 text-slate-400 rounded-full">{item.badge}</span>
              )}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
              {admin.name?.charAt(0) || admin.email?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{admin.name || 'Admin'}</p>
              <p className="text-xs text-slate-400 truncate">{admin.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 bg-slate-800/80 backdrop-blur-xl border-b border-slate-700">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-slate-400 hover:text-white">
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold text-white">Settings</h1>
          </div>
        </header>

        <main className="p-6">
          {/* Security Section */}
          <div className="max-w-2xl">
            <h2 className="text-xl font-bold text-white mb-6">Security</h2>
            
            {/* 2FA Card */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${admin.twoFactorEnabled ? 'bg-green-500/10' : 'bg-amber-500/10'}`}>
                      <Smartphone className={`w-6 h-6 ${admin.twoFactorEnabled ? 'text-green-400' : 'text-amber-400'}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">Two-Factor Authentication</h3>
                      <p className="text-sm text-slate-400 mb-3">
                        Add an extra layer of security to your admin account by requiring a verification code in addition to your password.
                      </p>
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                        admin.twoFactorEnabled 
                          ? 'bg-green-500/10 text-green-400' 
                          : 'bg-amber-500/10 text-amber-400'
                      }`}>
                        {admin.twoFactorEnabled ? (
                          <>
                            <Check className="w-4 h-4" />
                            Enabled
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-4 h-4" />
                            Not Enabled
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Error Display */}
                {error && !showSetup && !showDisable && (
                  <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                    {error}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="mt-6 pt-6 border-t border-slate-700">
                  {admin.twoFactorEnabled ? (
                    <button
                      onClick={() => setShowDisable(true)}
                      className="px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      Disable 2FA
                    </button>
                  ) : (
                    <button
                      onClick={startSetup}
                      disabled={isLoading}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Setting up...
                        </>
                      ) : (
                        <>
                          <Shield className="w-4 h-4" />
                          Enable 2FA
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* 2FA Setup Modal */}
      {showSetup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl shadow-xl">
            <div className="p-6">
              {/* QR Code Step */}
              {setupStep === 'qr' && (
                <>
                  <h3 className="text-xl font-bold text-white mb-2">Set Up 2FA</h3>
                  <p className="text-slate-400 text-sm mb-6">
                    Scan this QR code with your authenticator app (Google Authenticator, Authy, 1Password, etc.)
                  </p>
                  
                  {/* QR Code */}
                  <div className="flex justify-center mb-6">
                    <div className="p-4 bg-white rounded-xl">
                      <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />
                    </div>
                  </div>
                  
                  {/* Manual Entry */}
                  <div className="mb-6">
                    <p className="text-sm text-slate-400 mb-2">Or enter this code manually:</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 px-3 py-2 bg-slate-900 rounded-lg text-sm text-slate-300 font-mono">
                        {showSecret ? secret : '••••••••••••••••'}
                      </code>
                      <button
                        onClick={() => setShowSecret(!showSecret)}
                        className="p-2 text-slate-400 hover:text-white"
                      >
                        {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => navigator.clipboard.writeText(secret)}
                        className="p-2 text-slate-400 hover:text-white"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setSetupStep('verify')}
                    className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                  >
                    Continue
                  </button>
                </>
              )}

              {/* Verify Step */}
              {setupStep === 'verify' && (
                <>
                  <h3 className="text-xl font-bold text-white mb-2">Verify Setup</h3>
                  <p className="text-slate-400 text-sm mb-6">
                    Enter the 6-digit code from your authenticator app to verify the setup.
                  </p>
                  
                  {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                      {error}
                    </div>
                  )}
                  
                  <input
                    type="text"
                    value={verifyCode}
                    onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white text-center text-2xl font-mono tracking-widest mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    maxLength={6}
                    autoFocus
                  />
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => setSetupStep('qr')}
                      className="flex-1 py-3 border border-slate-600 text-slate-300 rounded-xl font-medium hover:bg-slate-700 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={verifyAndEnable}
                      disabled={isLoading || verifyCode.length !== 6}
                      className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        'Verify & Enable'
                      )}
                    </button>
                  </div>
                </>
              )}

              {/* Backup Codes Step */}
              {setupStep === 'backup' && (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-green-500/10 rounded-lg">
                      <Check className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">2FA Enabled!</h3>
                      <p className="text-sm text-slate-400">Save your backup codes</p>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl mb-6">
                    <p className="text-sm text-amber-400">
                      <strong>Important:</strong> Save these backup codes in a secure location. Each code can only be used once. You won't be able to see them again!
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mb-6">
                    {backupCodes.map((code, index) => (
                      <div key={index} className="px-3 py-2 bg-slate-900 rounded-lg text-center">
                        <code className="text-slate-300 font-mono text-sm">{code}</code>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex gap-3 mb-6">
                    <button
                      onClick={copyBackupCodes}
                      className="flex-1 flex items-center justify-center gap-2 py-2 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                      Copy
                    </button>
                    <button
                      onClick={downloadBackupCodes}
                      className="flex-1 flex items-center justify-center gap-2 py-2 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                  
                  <button
                    onClick={finishSetup}
                    className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                  >
                    I've Saved My Codes
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Disable 2FA Modal */}
      {showDisable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl shadow-xl p-6">
            <h3 className="text-xl font-bold text-white mb-2">Disable 2FA</h3>
            <p className="text-slate-400 text-sm mb-6">
              Enter your current 2FA code to disable two-factor authentication.
            </p>
            
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}
            
            <input
              type="text"
              value={disableCode}
              onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white text-center text-2xl font-mono tracking-widest mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={6}
              autoFocus
            />
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDisable(false);
                  setDisableCode('');
                  setError('');
                }}
                className="flex-1 py-3 border border-slate-600 text-slate-300 rounded-xl font-medium hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={disable2FA}
                disabled={isLoading || disableCode.length !== 6}
                className="flex-1 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Disabling...
                  </>
                ) : (
                  'Disable 2FA'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
