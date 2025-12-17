export type ApplicationStatus = 'saved' | 'applied' | 'interview' | 'offer' | 'rejected';
export type Priority = 'low' | 'medium' | 'high';
export type JobSource = 'linkedin' | 'indeed' | 'company_website' | 'referral' | 'recruiter' | 'other';

export interface Application {
  id: string;
  userId: string;
  companyName: string;
  positionTitle: string;
  status: ApplicationStatus;
  appliedDate: number | null;
  salary: string;
  location: string;
  isRemote: boolean;
  jobUrl: string;
  notes: string;
  jobSource: JobSource;
  followUpDate: number | null;
  priority: Priority;
  contactPerson: string;
  contactEmail: string;
  createdAt: number;
  updatedAt: number;
  history: Array<{
    status: ApplicationStatus;
    date: number;
    note: string;
  }>;
}

export interface Statistics {
  total: number;
  saved: number;
  applied: number;
  interview: number;
  offer: number;
  rejected: number;
  responseRate: number;
  averageResponseTime: number;
  applicationsByMonth: Array<{ month: string; count: number }>;
}

const isBrowser = typeof window !== 'undefined';

// Get user ID from localStorage (set by the tracker page when authenticated)
function getUserId(): string | null {
  if (!isBrowser) return null;
  return localStorage.getItem('applypro_current_user_id');
}

// Set user ID (called from tracker page when session is available)
export function setCurrentUserId(userId: string): void {
  if (!isBrowser) return;
  localStorage.setItem('applypro_current_user_id', userId);
}

// Clear user ID (called on logout)
export function clearCurrentUserId(): void {
  if (!isBrowser) return;
  localStorage.removeItem('applypro_current_user_id');
}

function getUserKey(): string | null {
  const userId = getUserId();
  if (!userId) return null;
  return `applypro_applications_${userId}`;
}

export function getAllApplications(): Application[] {
  if (!isBrowser) return [];

  const key = getUserKey();
  if (!key) return [];

  const data = localStorage.getItem(key);
  if (!data) return [];

  try {
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

export function getApplicationById(id: string): Application | null {
  const applications = getAllApplications();
  return applications.find(app => app.id === id) || null;
}

export function addApplication(data: Omit<Application, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'history'>): { success: boolean; id?: string; error?: string } {
  if (!isBrowser) return { success: false, error: 'Not in browser environment' };

  const userId = getUserId();
  if (!userId) {
    return { success: false, error: 'Not authenticated' };
  }

  const applications = getAllApplications();

  // Check limit (100 applications - generous limit)
  if (applications.length >= 100) {
    return { success: false, error: 'Application limit reached (100).' };
  }

  const now = Date.now();
  const newApplication: Application = {
    id: crypto.randomUUID(),
    userId: userId,
    companyName: data.companyName || '',
    positionTitle: data.positionTitle || '',
    status: data.status || 'saved',
    appliedDate: data.appliedDate || null,
    salary: data.salary || '',
    location: data.location || '',
    isRemote: data.isRemote || false,
    jobUrl: data.jobUrl || '',
    notes: data.notes || '',
    jobSource: data.jobSource || 'other',
    followUpDate: data.followUpDate || null,
    priority: data.priority || 'medium',
    contactPerson: data.contactPerson || '',
    contactEmail: data.contactEmail || '',
    createdAt: now,
    updatedAt: now,
    history: [
      {
        status: data.status || 'saved',
        date: now,
        note: 'Application created'
      }
    ]
  };

  applications.push(newApplication);

  const key = getUserKey();
  if (!key) return { success: false, error: 'User key not found' };

  localStorage.setItem(key, JSON.stringify(applications));

  return { success: true, id: newApplication.id };
}

export function updateApplication(id: string, updates: Partial<Application>): { success: boolean; error?: string } {
  if (!isBrowser) return { success: false, error: 'Not in browser environment' };

  const applications = getAllApplications();
  const index = applications.findIndex(app => app.id === id);

  if (index === -1) {
    return { success: false, error: 'Application not found' };
  }

  const now = Date.now();
  const currentApp = applications[index];

  // If status changed, add to history
  if (updates.status && updates.status !== currentApp.status) {
    const historyEntry = {
      status: updates.status,
      date: now,
      note: `Status changed to ${updates.status}`
    };

    updates.history = [...currentApp.history, historyEntry];
  }

  applications[index] = {
    ...currentApp,
    ...updates,
    updatedAt: now
  };

  const key = getUserKey();
  if (!key) return { success: false, error: 'User key not found' };

  localStorage.setItem(key, JSON.stringify(applications));

  return { success: true };
}

export function deleteApplication(id: string): { success: boolean; error?: string } {
  if (!isBrowser) return { success: false, error: 'Not in browser environment' };

  const applications = getAllApplications();
  const filtered = applications.filter(app => app.id !== id);

  if (filtered.length === applications.length) {
    return { success: false, error: 'Application not found' };
  }

  const key = getUserKey();
  if (!key) return { success: false, error: 'User key not found' };

  localStorage.setItem(key, JSON.stringify(filtered));

  return { success: true };
}

export function deleteMultipleApplications(ids: string[]): { success: boolean; deleted: number; error?: string } {
  if (!isBrowser) return { success: false, deleted: 0, error: 'Not in browser environment' };

  const applications = getAllApplications();
  const filtered = applications.filter(app => !ids.includes(app.id));

  const deletedCount = applications.length - filtered.length;

  const key = getUserKey();
  if (!key) return { success: false, deleted: 0, error: 'User key not found' };

  localStorage.setItem(key, JSON.stringify(filtered));

  return { success: true, deleted: deletedCount };
}

export function getStatistics(): Statistics {
  const applications = getAllApplications();

  const stats: Statistics = {
    total: applications.length,
    saved: applications.filter(app => app.status === 'saved').length,
    applied: applications.filter(app => app.status === 'applied').length,
    interview: applications.filter(app => app.status === 'interview').length,
    offer: applications.filter(app => app.status === 'offer').length,
    rejected: applications.filter(app => app.status === 'rejected').length,
    responseRate: 0,
    averageResponseTime: 0,
    applicationsByMonth: []
  };

  // Calculate response rate
  const totalResponded = stats.interview + stats.offer + stats.rejected;
  const totalApplied = stats.applied + totalResponded;
  if (totalApplied > 0) {
    stats.responseRate = Math.round((totalResponded / totalApplied) * 100);
  }

  // Calculate average response time (days from applied to any response)
  const respondedApps = applications.filter(app =>
    app.status !== 'saved' && app.status !== 'applied' && app.appliedDate
  );

  if (respondedApps.length > 0) {
    const totalResponseTime = respondedApps.reduce((sum, app) => {
      const responseTime = app.updatedAt - (app.appliedDate || app.createdAt);
      return sum + responseTime;
    }, 0);

    stats.averageResponseTime = Math.round(totalResponseTime / respondedApps.length / (1000 * 60 * 60 * 24));
  }

  // Group by month
  const monthGroups: { [key: string]: number } = {};
  applications.forEach(app => {
    const date = new Date(app.createdAt);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    monthGroups[monthKey] = (monthGroups[monthKey] || 0) + 1;
  });

  stats.applicationsByMonth = Object.entries(monthGroups)
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month));

  return stats;
}

export function searchApplications(query: string): Application[] {
  const applications = getAllApplications();
  const lowerQuery = query.toLowerCase().trim();

  if (!lowerQuery) return applications;

  return applications.filter(app =>
    app.companyName.toLowerCase().includes(lowerQuery) ||
    app.positionTitle.toLowerCase().includes(lowerQuery) ||
    app.location.toLowerCase().includes(lowerQuery) ||
    app.notes.toLowerCase().includes(lowerQuery)
  );
}

export function filterApplications(
  status?: ApplicationStatus,
  priority?: Priority,
  dateFrom?: number,
  dateTo?: number
): Application[] {
  let applications = getAllApplications();

  if (status) {
    applications = applications.filter(app => app.status === status);
  }

  if (priority) {
    applications = applications.filter(app => app.priority === priority);
  }

  if (dateFrom) {
    applications = applications.filter(app => app.createdAt >= dateFrom);
  }

  if (dateTo) {
    applications = applications.filter(app => app.createdAt <= dateTo);
  }

  return applications;
}

export function getUpcomingFollowUps(): Application[] {
  const applications = getAllApplications();
  const now = Date.now();
  const sevenDaysFromNow = now + (7 * 24 * 60 * 60 * 1000);

  return applications
    .filter(app => app.followUpDate && app.followUpDate >= now && app.followUpDate <= sevenDaysFromNow)
    .sort((a, b) => (a.followUpDate || 0) - (b.followUpDate || 0));
}

export function exportToCSV(): string {
  const applications = getAllApplications();

  const headers = [
    'Company',
    'Position',
    'Status',
    'Applied Date',
    'Salary',
    'Location',
    'Remote',
    'Job URL',
    'Job Source',
    'Priority',
    'Contact Person',
    'Contact Email',
    'Notes'
  ];

  const rows = applications.map(app => [
    app.companyName,
    app.positionTitle,
    app.status,
    app.appliedDate ? new Date(app.appliedDate).toLocaleDateString() : '',
    app.salary,
    app.location,
    app.isRemote ? 'Yes' : 'No',
    app.jobUrl,
    app.jobSource || 'other',
    app.priority,
    app.contactPerson,
    app.contactEmail,
    app.notes.replace(/\n/g, ' ')
  ]);

  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');

  return csv;
}

export function importFromBackup(jsonData: string): { success: boolean; imported: number; error?: string } {
  if (!isBrowser) return { success: false, imported: 0, error: 'Not in browser environment' };

  const userId = getUserId();
  if (!userId) {
    return { success: false, imported: 0, error: 'Not authenticated' };
  }

  try {
    const applications = JSON.parse(jsonData) as Application[];

    if (!Array.isArray(applications)) {
      return { success: false, imported: 0, error: 'Invalid backup format' };
    }

    // Update userId for all applications
    const updatedApplications = applications.map(app => ({
      ...app,
      userId: userId
    }));

    const key = getUserKey();
    if (!key) return { success: false, imported: 0, error: 'User key not found' };

    localStorage.setItem(key, JSON.stringify(updatedApplications));

    return { success: true, imported: updatedApplications.length };
  } catch (e) {
    return { success: false, imported: 0, error: 'Failed to parse backup file' };
  }
}

export function exportBackup(): string {
  const applications = getAllApplications();
  return JSON.stringify(applications, null, 2);
}
