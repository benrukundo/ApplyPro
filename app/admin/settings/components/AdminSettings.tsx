'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Shield,
  Loader2,
  Copy,
  Download,
  Eye,
  EyeOff,
  Check,
  AlertTriangle,
  Smartphone,
  User,
  Bell,
  Key,
  Save,
  RefreshCw,
} from 'lucide-react';

interface AdminUser {
  id: string;
  name: string | null;
  email: string | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  twoFactorEnabled: boolean;
}

export default function AdminSettings({ admin }: { admin: AdminUser }) {
  const router = useRouter();
  
  // Profile State
  const [profileName, setProfileName] = useState(admin.name || '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  
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
  
  // View Backup Codes State
  const [showViewBackup, setShowViewBackup] = useState(false);
  const [viewBackupCode, setViewBackupCode] = useState('');
  const [existingBackupCodes, setExistingBackupCodes] = useState<string[]>([]);
  const [backupCodesRemaining, setBackupCodesRemaining] = useState<number | null>(null);
  
  // Notification Preferences
  const [notifications, setNotifications] = useState({
    emailOnNewAdmin: true,
    emailOnSecurityAlert: true,
    emailWeeklyReport: false,
  });
  const [notificationsSaving, setNotificationsSaving] = useState(false);

  // Fetch backup codes count on load if 2FA is enabled
  useEffect(() => {
    if (admin.twoFactorEnabled) {
      fetchBackupCodesCount();
    }
  }, [admin.twoFactorEnabled]);

  const fetchBackupCodesCount = async () => {
    try {
      const response = await fetch('/api/admin/2fa/backup-codes-count');
      if (response.ok) {
        const data = await response.json();
        setBackupCodesRemaining(data.count);
      }
    } catch (err) {
      console.error('Failed to fetch backup codes count');
    }
  };

  // Save Profile
  const saveProfile = async () => {
    setProfileSaving(true);
    try {
      const response = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: profileName }),
      });
      
      if (response.ok) {
        setProfileSuccess(true);
        setTimeout(() => setProfileSuccess(false), 3000);
      }
    } catch (err) {
      setError('Failed to update profile');
    } finally {
      setProfileSaving(false);
    }
  };

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
      
      window.location.reload();
    } catch (err) {
      setError('Failed to disable 2FA');
    } finally {
      setIsLoading(false);
    }
  };

  // Regenerate Backup Codes
  const regenerateBackupCodes = async () => {
    if (viewBackupCode.length !== 6) {
      setError('Please enter your current 2FA code');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/admin/2fa/regenerate-backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: viewBackupCode }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setError(data.error || 'Failed to regenerate codes');
        return;
      }
      
      setExistingBackupCodes(data.backupCodes);
      setBackupCodesRemaining(data.backupCodes.length);
    } catch (err) {
      setError('Failed to regenerate backup codes');
    } finally {
      setIsLoading(false);
    }
  };

  // Copy backup codes
  const copyBackupCodes = (codes: string[]) => {
    const text = codes.join('\n');
    navigator.clipboard.writeText(text);
  };

  // Download backup codes
  const downloadBackupCodes = (codes: string[]) => {
    const text = `ApplyPro Admin Backup Codes\n${'='.repeat(30)}\n\nSave these codes in a secure location.\nEach code can only be used once.\n\n${codes.join('\n')}\n\nGenerated: ${new Date().toISOString()}`;
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
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-slate-400 mt-1">Manage your admin account and preferences</p>
      </div>

      {/* Error Display */}
      {error && !showSetup && !showDisable && !showViewBackup && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-300">×</button>
        </div>
      )}

      <div className="space-y-6">
        {/* Profile Section */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-700">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <User className="w-5 h-5 text-blue-400" />
              Profile
            </h2>
          </div>
          <div className="p-6">
            <div className="grid gap-4 max-w-md">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">
                  Display Name
                </label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={admin.email || ''}
                  disabled
                  className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-lg text-slate-500 cursor-not-allowed"
                />
                <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">
                  Role
                </label>
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${
                  admin.isSuperAdmin 
                    ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' 
                    : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                }`}>
                  <Shield className="w-4 h-4" />
                  {admin.isSuperAdmin ? 'Super Admin' : 'Admin'}
                </div>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-slate-700">
              <button
                onClick={saveProfile}
                disabled={profileSaving || profileName === admin.name}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {profileSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : profileSuccess ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {profileSuccess ? 'Saved!' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-700">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Key className="w-5 h-5 text-green-400" />
              Security
            </h2>
          </div>
          <div className="p-6 space-y-6">
            {/* 2FA Card */}
            <div className="flex items-start justify-between p-4 bg-slate-900/50 rounded-xl border border-slate-700">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${admin.twoFactorEnabled ? 'bg-green-500/10' : 'bg-amber-500/10'}`}>
                  <Smartphone className={`w-6 h-6 ${admin.twoFactorEnabled ? 'text-green-400' : 'text-amber-400'}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">Two-Factor Authentication</h3>
                  <p className="text-sm text-slate-400 mb-3 max-w-md">
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
              <div>
                {admin.twoFactorEnabled ? (
                  <button
                    onClick={() => setShowDisable(true)}
                    className="px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-sm font-medium"
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
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Shield className="w-4 h-4" />
                    )}
                    Enable 2FA
                  </button>
                )}
              </div>
            </div>

            {/* Backup Codes Section - Only show if 2FA is enabled */}
            {admin.twoFactorEnabled && (
              <div className="flex items-start justify-between p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-purple-500/10">
                    <Key className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Backup Codes</h3>
                    <p className="text-sm text-slate-400 mb-3 max-w-md">
                      Use backup codes to access your account if you lose your authenticator device.
                    </p>
                    {backupCodesRemaining !== null && (
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                        backupCodesRemaining > 3 
                          ? 'bg-green-500/10 text-green-400' 
                          : backupCodesRemaining > 0 
                            ? 'bg-amber-500/10 text-amber-400'
                            : 'bg-red-500/10 text-red-400'
                      }`}>
                        {backupCodesRemaining} {backupCodesRemaining === 1 ? 'code' : 'codes'} remaining
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setShowViewBackup(true)}
                  className="flex items-center gap-2 px-4 py-2 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors text-sm font-medium"
                >
                  <RefreshCw className="w-4 h-4" />
                  Regenerate
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Notifications Section */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-700">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-400" />
              Notifications
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <label className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-slate-700 cursor-pointer hover:border-slate-600 transition-colors">
              <div>
                <p className="font-medium text-white">Security Alerts</p>
                <p className="text-sm text-slate-400">Get notified about suspicious login attempts</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.emailOnSecurityAlert}
                onChange={(e) => setNotifications(prev => ({ ...prev, emailOnSecurityAlert: e.target.checked }))}
                className="w-5 h-5 rounded border-slate-600 bg-slate-900 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
              />
            </label>
            
            <label className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-slate-700 cursor-pointer hover:border-slate-600 transition-colors">
              <div>
                <p className="font-medium text-white">New Admin Added</p>
                <p className="text-sm text-slate-400">Get notified when a new admin is added</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.emailOnNewAdmin}
                onChange={(e) => setNotifications(prev => ({ ...prev, emailOnNewAdmin: e.target.checked }))}
                className="w-5 h-5 rounded border-slate-600 bg-slate-900 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
              />
            </label>
            
            <label className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-slate-700 cursor-pointer hover:border-slate-600 transition-colors">
              <div>
                <p className="font-medium text-white">Weekly Reports</p>
                <p className="text-sm text-slate-400">Receive weekly analytics summary via email</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.emailWeeklyReport}
                onChange={(e) => setNotifications(prev => ({ ...prev, emailWeeklyReport: e.target.checked }))}
                className="w-5 h-5 rounded border-slate-600 bg-slate-900 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
              />
            </label>
            
            <p className="text-xs text-slate-500 mt-2">
              * Notification preferences are saved automatically
            </p>
          </div>
        </div>
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
                  
                  <div className="flex justify-center mb-6">
                    <div className="p-4 bg-white rounded-xl">
                      <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <p className="text-sm text-slate-400 mb-2">Or enter this code manually:</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 px-3 py-2 bg-slate-900 rounded-lg text-sm text-slate-300 font-mono overflow-hidden">
                        {showSecret ? secret : '••••••••••••••••'}
                      </code>
                      <button
                        onClick={() => setShowSecret(!showSecret)}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg"
                      >
                        {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => navigator.clipboard.writeText(secret)}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg"
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
                      onClick={() => { setSetupStep('qr'); setError(''); }}
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
                      <strong>Important:</strong> Save these backup codes in a secure location. Each code can only be used once. You won&apos;t be able to see them again!
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
                      onClick={() => copyBackupCodes(backupCodes)}
                      className="flex-1 flex items-center justify-center gap-2 py-2 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                      Copy
                    </button>
                    <button
                      onClick={() => downloadBackupCodes(backupCodes)}
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
                    I&apos;ve Saved My Codes
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

      {/* Regenerate Backup Codes Modal */}
      {showViewBackup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl shadow-xl p-6">
            {existingBackupCodes.length === 0 ? (
              <>
                <h3 className="text-xl font-bold text-white mb-2">Regenerate Backup Codes</h3>
                <p className="text-slate-400 text-sm mb-6">
                  Enter your current 2FA code to generate new backup codes. This will invalidate all previous backup codes.
                </p>
                
                {error && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                    {error}
                  </div>
                )}
                
                <input
                  type="text"
                  value={viewBackupCode}
                  onChange={(e) => setViewBackupCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white text-center text-2xl font-mono tracking-widest mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  maxLength={6}
                  autoFocus
                />
                
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowViewBackup(false);
                      setViewBackupCode('');
                      setError('');
                    }}
                    className="flex-1 py-3 border border-slate-600 text-slate-300 rounded-xl font-medium hover:bg-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={regenerateBackupCodes}
                    disabled={isLoading || viewBackupCode.length !== 6}
                    className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      'Generate New Codes'
                    )}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <Check className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">New Backup Codes</h3>
                    <p className="text-sm text-slate-400">Save these codes securely</p>
                  </div>
                </div>
                
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl mb-6">
                  <p className="text-sm text-amber-400">
                    <strong>Important:</strong> Your old backup codes are now invalid. Save these new codes in a secure location.
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mb-6">
                  {existingBackupCodes.map((code, index) => (
                    <div key={index} className="px-3 py-2 bg-slate-900 rounded-lg text-center">
                      <code className="text-slate-300 font-mono text-sm">{code}</code>
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-3 mb-6">
                  <button
                    onClick={() => copyBackupCodes(existingBackupCodes)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    Copy
                  </button>
                  <button
                    onClick={() => downloadBackupCodes(existingBackupCodes)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>
                
                <button
                  onClick={() => {
                    setShowViewBackup(false);
                    setExistingBackupCodes([]);
                    setViewBackupCode('');
                  }}
                  className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                >
                  Done
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
