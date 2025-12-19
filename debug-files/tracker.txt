import { getSession } from 'next-auth/react';

export type ApplicationStatus = 'saved' | 'applied' | 'interview' | 'offer' | 'rejected';
export type Priority = 'low' | 'medium' | 'high';
export type JobSource = 'linkedin' | 'indeed' | 'company_website' | 'referral' | 'recruiter' | 'other';

// Updated interface to match database schema
export interface Application {
  id: string;
  userId: string;
  companyName: string;
  positionTitle: string;
  jobUrl?: string;
  location?: string;
  salary?: string;
  isRemote: boolean;
  jobSource: JobSource;
  status: ApplicationStatus;
  appliedDate?: Date;
  notes?: string;
  followUpDate?: Date;
  priority: Priority;
  contactPerson?: string;
  contactEmail?: string;
  createdAt: Date;
  updatedAt: Date;
  statusHistory?: Array<{
    status: ApplicationStatus;
    changedAt: Date;
    note?: string;
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

// API helper functions
async function apiRequest(endpoint: string, options?: RequestInit) {
  const session = await getSession();
  if (!session?.user) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(endpoint, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'API request failed');
  }

  return response.json();
}

// Convert database format to frontend format
function convertFromDatabase(dbApp: any): Application {
  return {
    id: dbApp.id,
    userId: dbApp.userId,
    companyName: dbApp.companyName,
    positionTitle: dbApp.positionTitle,
    jobUrl: dbApp.jobUrl || '',
    location: dbApp.location || '',
    salary: dbApp.salary || '',
    isRemote: dbApp.isRemote,
    jobSource: dbApp.jobSource,
    status: dbApp.status,
    appliedDate: dbApp.appliedDate ? new Date(dbApp.appliedDate) : undefined,
    notes: dbApp.notes || '',
    followUpDate: dbApp.followUpDate ? new Date(dbApp.followUpDate) : undefined,
    priority: dbApp.priority,
    contactPerson: dbApp.contactPerson || '',
    contactEmail: dbApp.contactEmail || '',
    createdAt: new Date(dbApp.createdAt),
    updatedAt: new Date(dbApp.updatedAt),
    statusHistory: dbApp.statusHistory?.map((h: any) => ({
      status: h.status,
      changedAt: new Date(h.changedAt),
      note: h.note,
    })),
  };
}

export async function getAllApplications(): Promise<Application[]> {
  try {
    const response = await apiRequest('/api/job-applications');
    return response.applications.map(convertFromDatabase);
  } catch (error) {
    console.error('Error fetching applications:', error);
    return [];
  }
}

export async function getApplicationById(id: string): Promise<Application | null> {
  try {
    const response = await apiRequest(`/api/job-applications/${id}`);
    return convertFromDatabase(response.application);
  } catch (error) {
    console.error('Error fetching application:', error);
    return null;
  }
}

export async function addApplication(data: Omit<Application, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'statusHistory'>): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const payload = {
      companyName: data.companyName,
      positionTitle: data.positionTitle,
      jobUrl: data.jobUrl,
      location: data.location,
      salary: data.salary,
      isRemote: data.isRemote,
      jobSource: data.jobSource,
      status: data.status,
      appliedDate: data.appliedDate?.toISOString(),
      notes: data.notes,
      followUpDate: data.followUpDate?.toISOString(),
      priority: data.priority,
      contactPerson: data.contactPerson,
      contactEmail: data.contactEmail,
    };

    const response = await apiRequest('/api/job-applications', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    return { success: true, id: response.application.id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateApplication(id: string, updates: Partial<Application>): Promise<{ success: boolean; error?: string }> {
  try {
    const payload = {
      companyName: updates.companyName,
      positionTitle: updates.positionTitle,
      jobUrl: updates.jobUrl,
      location: updates.location,
      salary: updates.salary,
      isRemote: updates.isRemote,
      jobSource: updates.jobSource,
      status: updates.status,
      appliedDate: updates.appliedDate?.toISOString(),
      notes: updates.notes,
      followUpDate: updates.followUpDate?.toISOString(),
      priority: updates.priority,
      contactPerson: updates.contactPerson,
      contactEmail: updates.contactEmail,
    };

    await apiRequest(`/api/job-applications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteApplication(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await apiRequest(`/api/job-applications/${id}`, {
      method: 'DELETE',
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteMultipleApplications(ids: string[]): Promise<{ success: boolean; deleted: number; error?: string }> {
  try {
    const deletePromises = ids.map(id =>
      apiRequest(`/api/job-applications/${id}`, { method: 'DELETE' })
    );
    await Promise.all(deletePromises);
    return { success: true, deleted: ids.length };
  } catch (error: any) {
    return { success: false, deleted: 0, error: error.message };
  }
}

export async function getStatistics(): Promise<Statistics> {
  try {
    const response = await apiRequest('/api/job-applications/stats');
    return response.stats;
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return {
      total: 0,
      saved: 0,
      applied: 0,
      interview: 0,
      offer: 0,
      rejected: 0,
      responseRate: 0,
      averageResponseTime: 0,
      applicationsByMonth: [],
    };
  }
}

export async function searchApplications(query: string): Promise<Application[]> {
  try {
    const response = await apiRequest(`/api/job-applications?search=${encodeURIComponent(query)}`);
    return response.applications.map(convertFromDatabase);
  } catch (error) {
    console.error('Error searching applications:', error);
    return [];
  }
}

export async function filterApplications(
  status?: ApplicationStatus,
  priority?: Priority,
  dateFrom?: number,
  dateTo?: number
): Promise<Application[]> {
  try {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (priority) params.append('priority', priority);

    const response = await apiRequest(`/api/job-applications?${params.toString()}`);
    let applications = response.applications.map(convertFromDatabase);

    // Client-side filtering for dates (since API doesn't support date range yet)
    if (dateFrom) {
      applications = applications.filter((app: Application) => app.createdAt.getTime() >= dateFrom);
    }
    if (dateTo) {
      applications = applications.filter((app: Application) => app.createdAt.getTime() <= dateTo);
    }

    return applications;
  } catch (error) {
    console.error('Error filtering applications:', error);
    return [];
  }
}

export async function getUpcomingFollowUps(): Promise<Application[]> {
  try {
    const applications = await getAllApplications();
    const now = Date.now();
    const sevenDaysFromNow = now + (7 * 24 * 60 * 60 * 1000);

    return applications
      .filter(app => app.followUpDate && app.followUpDate.getTime() >= now && app.followUpDate.getTime() <= sevenDaysFromNow)
      .sort((a, b) => (a.followUpDate?.getTime() || 0) - (b.followUpDate?.getTime() || 0));
  } catch (error) {
    console.error('Error fetching upcoming follow-ups:', error);
    return [];
  }
}

export async function exportToCSV(): Promise<string> {
  try {
    const applications = await getAllApplications();

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
      app.appliedDate ? app.appliedDate.toLocaleDateString() : '',
      app.salary,
      app.location,
      app.isRemote ? 'Yes' : 'No',
      app.jobUrl,
      app.jobSource,
      app.priority,
      app.contactPerson,
      app.contactEmail,
      app.notes?.replace(/\n/g, ' ') || '',
    ]);

    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    return csv;
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    return '';
  }
}

export async function importFromBackup(jsonData: string): Promise<{ success: boolean; imported: number; error?: string }> {
  try {
    const applications = JSON.parse(jsonData) as Partial<Application>[];

    if (!Array.isArray(applications)) {
      return { success: false, imported: 0, error: 'Invalid backup format' };
    }

    let imported = 0;
    for (const app of applications) {
      try {
        const result = await addApplication({
          companyName: app.companyName || '',
          positionTitle: app.positionTitle || '',
          jobUrl: app.jobUrl,
          location: app.location,
          salary: app.salary,
          isRemote: app.isRemote || false,
          jobSource: app.jobSource || 'other',
          status: app.status || 'saved',
          appliedDate: app.appliedDate,
          notes: app.notes,
          followUpDate: app.followUpDate,
          priority: app.priority || 'medium',
          contactPerson: app.contactPerson,
          contactEmail: app.contactEmail,
        });

        if (result.success) {
          imported++;
        }
      } catch (e) {
        // Continue with next application if one fails
        console.error('Error importing application:', e);
      }
    }

    return { success: true, imported };
  } catch (e) {
    return { success: false, imported: 0, error: 'Failed to parse backup file' };
  }
}

export async function exportBackup(): Promise<string> {
  try {
    const applications = await getAllApplications();
    return JSON.stringify(applications, null, 2);
  } catch (error) {
    console.error('Error exporting backup:', error);
    return '[]';
  }
}

// Legacy functions for backward compatibility (now no-ops)
export function setCurrentUserId(userId: string): void {
  // No longer needed - authentication handled by NextAuth
}

export function clearCurrentUserId(): void {
  // No longer needed - authentication handled by NextAuth
}
