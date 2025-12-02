/**
 * In-memory store for used Gumroad license keys
 *
 * Prevents license keys from being reused for multiple resume generations.
 * In production, consider using a database like Redis or PostgreSQL.
 */

interface LicenseRecord {
  key: string;
  usedAt: number;
  email?: string;
}

// In-memory storage (will reset on server restart)
const usedLicenses = new Map<string, LicenseRecord>();

/**
 * Check if a license key has already been used
 */
export function isLicenseUsed(licenseKey: string): boolean {
  return usedLicenses.has(licenseKey);
}

/**
 * Mark a license key as used
 */
export function markLicenseAsUsed(licenseKey: string, email?: string): void {
  usedLicenses.set(licenseKey, {
    key: licenseKey,
    usedAt: Date.now(),
    email,
  });
}

/**
 * Get usage statistics (for debugging)
 */
export function getLicenseStats() {
  return {
    totalUsed: usedLicenses.size,
    licenses: Array.from(usedLicenses.values()),
  };
}

/**
 * Clean up old license records (optional - for memory management)
 * Remove licenses older than 30 days
 */
export function cleanupOldLicenses(): void {
  const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);

  for (const [key, record] of usedLicenses.entries()) {
    if (record.usedAt < thirtyDaysAgo) {
      usedLicenses.delete(key);
    }
  }
}
