/**
 * In-memory session store for payment verification
 *
 * This prevents users from sharing the success page URL by requiring
 * a valid, unused session token from the payment flow.
 */

interface Session {
  token: string;
  timestamp: number;
  used: boolean;
  resumeText?: string;
  jobDescription?: string;
}

// In-memory storage (will reset on server restart)
// For production, consider using Redis or a database
const sessions = new Map<string, Session>();

const SESSION_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

/**
 * Create a new session
 */
export function createSession(token: string): void {
  sessions.set(token, {
    token,
    timestamp: Date.now(),
    used: false,
  });

  // Clean up expired sessions (basic cleanup)
  cleanupExpiredSessions();
}

/**
 * Verify a session token is valid and unused
 * Marks the token as used if valid
 */
export function verifyAndUseSession(token: string): { valid: boolean; reason?: string } {
  const session = sessions.get(token);

  if (!session) {
    return { valid: false, reason: "Session not found" };
  }

  // Check if expired
  const now = Date.now();
  if (now - session.timestamp > SESSION_EXPIRY_MS) {
    sessions.delete(token);
    return { valid: false, reason: "Session expired" };
  }

  // Check if already used
  if (session.used) {
    return { valid: false, reason: "Session already used" };
  }

  // Mark as used
  session.used = true;
  sessions.set(token, session);

  return { valid: true };
}

/**
 * Check if a session exists and is valid (without marking as used)
 */
export function checkSession(token: string): { valid: boolean; reason?: string } {
  const session = sessions.get(token);

  if (!session) {
    return { valid: false, reason: "Session not found" };
  }

  // Check if expired
  const now = Date.now();
  if (now - session.timestamp > SESSION_EXPIRY_MS) {
    sessions.delete(token);
    return { valid: false, reason: "Session expired" };
  }

  // Check if already used
  if (session.used) {
    return { valid: false, reason: "Session already used" };
  }

  return { valid: true };
}

/**
 * Clean up expired sessions
 */
function cleanupExpiredSessions(): void {
  const now = Date.now();
  for (const [token, session] of sessions.entries()) {
    if (now - session.timestamp > SESSION_EXPIRY_MS) {
      sessions.delete(token);
    }
  }
}

/**
 * Get session stats (for debugging)
 */
export function getSessionStats() {
  cleanupExpiredSessions();
  return {
    total: sessions.size,
    active: Array.from(sessions.values()).filter(s => !s.used).length,
    used: Array.from(sessions.values()).filter(s => s.used).length,
  };
}
