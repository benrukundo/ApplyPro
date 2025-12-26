'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Shield,
  ShieldCheck,
  ShieldOff,
  Search,
  UserPlus,
  Users,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  Mail,
  Calendar,
  KeyRound,
} from 'lucide-react';

interface AdminUser {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  isAdmin: boolean;
  adminCreatedAt: string | null;
  adminCreatedBy: string | null;
  createdByName: string | null;
  twoFactorEnabled: boolean;
  createdAt: string;
}

interface SearchUser {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  isAdmin: boolean;
  createdAt: string;
}

export default function AdminUsersManagement() {
  const router = useRouter();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [searching, setSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmRevoke, setConfirmRevoke] = useState<string | null>(null);

  useEffect(() => {
    fetchAdmins();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length >= 2) {
        searchUsers();
      } else {
        setSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const fetchAdmins = async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (!res.ok) throw new Error('Failed to fetch admins');
      const data = await res.json();
      setAdmins(data.admins);
    } catch (err) {
      setError('Failed to load admin users');
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async () => {
    setSearching(true);
    try {
      const res = await fetch(`/api/admin/users/search?q=${encodeURIComponent(searchQuery)}`);
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();
      setSearchResults(data.users);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setSearching(false);
    }
  };

  const redirectTo2FA = () => {
    router.push('/admin/verify-2fa?callbackUrl=' + encodeURIComponent('/admin/users'));
  };

  const promoteUser = async (email: string) => {
    setActionLoading(email);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/admin/users/promote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.require2FA) {
          redirectTo2FA();
          return;
        }
        throw new Error(data.error || 'Failed to promote user');
      }

      setSuccess(data.message);
      setSearchQuery('');
      setSearchResults([]);
      setShowSearch(false);
      fetchAdmins();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const revokeAdmin = async (userId: string) => {
    setActionLoading(userId);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/admin/users/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.require2FA) {
          redirectTo2FA();
          return;
        }
        throw new Error(data.error || 'Failed to revoke admin');
      }

      setSuccess(data.message);
      setConfirmRevoke(null);
      fetchAdmins();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin"
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold flex items-center gap-2">
                  <Users className="w-6 h-6 text-blue-500" />
                  Admin Management
                </h1>
                <p className="text-gray-400 text-sm">
                  {admins.length} administrator{admins.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
            >
              <UserPlus className="w-5 h-5" />
              Add Admin
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3">
            <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-400">{error}</p>
            <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-300">
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
            <p className="text-green-400">{success}</p>
            <button onClick={() => setSuccess(null)} className="ml-auto text-green-400 hover:text-green-300">
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        )}

        {showSearch && (
          <div className="mb-8 p-6 bg-gray-800 rounded-xl border border-gray-700">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-blue-500" />
              Promote User to Admin
            </h2>
            <p className="text-gray-400 text-sm mb-4">
              Search for an existing user by email or name to grant admin access.
            </p>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by email or name..."
                className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
                autoFocus
              />
              {searching && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 animate-spin text-gray-400" />
              )}
            </div>

            {searchResults.length > 0 && (
              <div className="mt-4 space-y-2">
                {searchResults.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg border border-gray-600"
                  >
                    <div className="flex items-center gap-3">
                      {user.image ? (
                        <img src={user.image} alt="" className="w-10 h-10 rounded-full" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
                          <span className="text-lg font-medium">
                            {(user.name?.[0] || user.email?.[0] || '?').toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{user.name || 'No name'}</p>
                        <p className="text-sm text-gray-400">{user.email}</p>
                      </div>
                    </div>

                    {user.isAdmin ? (
                      <span className="flex items-center gap-1 text-green-400 text-sm">
                        <ShieldCheck className="w-4 h-4" />
                        Already Admin
                      </span>
                    ) : (
                      <button
                        onClick={() => promoteUser(user.email || '')}
                        disabled={actionLoading === user.email}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-4 py-2 rounded-lg transition-colors text-sm"
                      >
                        {actionLoading === user.email ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Shield className="w-4 h-4" />
                        )}
                        Make Admin
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {searchQuery.length >= 2 && searchResults.length === 0 && !searching && (
              <p className="mt-4 text-gray-400 text-center py-4">
                No users found matching &quot;{searchQuery}&quot;
              </p>
            )}
          </div>
        )}

        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-700">
            <h2 className="font-semibold flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-green-500" />
              Current Administrators
            </h2>
          </div>

          <div className="divide-y divide-gray-700">
            {admins.map((admin) => (
              <div key={admin.id} className="p-4 hover:bg-gray-700/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    {admin.image ? (
                      <img src={admin.image} alt="" className="w-12 h-12 rounded-full" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-600 flex items-center justify-center">
                        <span className="text-xl font-medium">
                          {(admin.name?.[0] || admin.email?.[0] || '?').toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-lg">{admin.name || 'No name set'}</p>
                      <p className="text-gray-400 flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {admin.email}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Admin since {formatDate(admin.adminCreatedAt)}
                        </span>
                        {admin.createdByName && <span>Promoted by {admin.createdByName}</span>}
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        {admin.twoFactorEnabled ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                            <KeyRound className="w-3 h-3" />
                            2FA Enabled
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs">
                            <AlertTriangle className="w-3 h-3" />
                            2FA Not Enabled
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {confirmRevoke === admin.id ? (
                      <div className="flex items-center gap-2 bg-red-500/10 p-2 rounded-lg">
                        <span className="text-sm text-red-400">Confirm?</span>
                        <button
                          onClick={() => revokeAdmin(admin.id)}
                          disabled={actionLoading === admin.id}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
                        >
                          {actionLoading === admin.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            'Yes'
                          )}
                        </button>
                        <button
                          onClick={() => setConfirmRevoke(null)}
                          className="px-3 py-1 bg-gray-600 hover:bg-gray-500 rounded text-sm"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmRevoke(admin.id)}
                        className="flex items-center gap-2 px-3 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-sm"
                        title="Revoke admin access"
                      >
                        <ShieldOff className="w-4 h-4" />
                        Revoke
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {admins.length === 0 && (
            <div className="p-8 text-center text-gray-400">
              <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No administrators found</p>
            </div>
          )}
        </div>

        <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-400">Security Recommendations</p>
              <ul className="mt-2 text-sm text-yellow-400/80 space-y-1">
                <li>• All admins should enable Two-Factor Authentication (2FA)</li>
                <li>• Regularly review admin access and remove unused accounts</li>
                <li>• Only grant admin access to trusted team members</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
