import bcrypt from 'bcryptjs';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: number;
}

export interface Session {
  userId: string;
  token: string;
  expiresAt: number;
}

const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

// Check if code is running in browser
const isBrowser = typeof window !== 'undefined';

export function signup(name: string, email: string, password: string): { success: boolean; error?: string } {
  if (!isBrowser) return { success: false, error: 'Not in browser environment' };

  const users = JSON.parse(localStorage.getItem('applypro_users') || '[]');

  // Check if user exists
  if (users.find((u: User) => u.email.toLowerCase() === email.toLowerCase())) {
    return { success: false, error: 'Email already registered' };
  }

  // Validate inputs
  if (name.trim().length < 2) {
    return { success: false, error: 'Name must be at least 2 characters' };
  }

  if (!isValidEmail(email)) {
    return { success: false, error: 'Invalid email address' };
  }

  if (password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters' };
  }

  // Hash password
  const hashedPassword = bcrypt.hashSync(password, 10);

  // Create user
  const user: User = {
    id: crypto.randomUUID(),
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password: hashedPassword,
    createdAt: Date.now()
  };

  users.push(user);
  localStorage.setItem('applypro_users', JSON.stringify(users));

  // Auto login
  createSession(user.id);

  return { success: true };
}

export function login(email: string, password: string): { success: boolean; error?: string } {
  if (!isBrowser) return { success: false, error: 'Not in browser environment' };

  const users = JSON.parse(localStorage.getItem('applypro_users') || '[]');
  const user = users.find((u: User) => u.email.toLowerCase() === email.toLowerCase().trim());

  if (!user) {
    return { success: false, error: 'Invalid email or password' };
  }

  // Verify password
  const isValid = bcrypt.compareSync(password, user.password);

  if (!isValid) {
    return { success: false, error: 'Invalid email or password' };
  }

  // Create session
  createSession(user.id);

  return { success: true };
}

export function logout(): void {
  if (!isBrowser) return;

  localStorage.removeItem('applypro_session');
}

export function isAuthenticated(): boolean {
  if (!isBrowser) return false;

  const sessionData = localStorage.getItem('applypro_session');
  if (!sessionData) return false;

  try {
    const session: Session = JSON.parse(sessionData);

    // Check if session is expired
    if (Date.now() > session.expiresAt) {
      logout();
      return false;
    }

    return true;
  } catch (e) {
    return false;
  }
}

export function getCurrentUser(): User | null {
  if (!isBrowser) return null;

  const sessionData = localStorage.getItem('applypro_session');
  if (!sessionData) return null;

  try {
    const session: Session = JSON.parse(sessionData);

    // Check if session is expired
    if (Date.now() > session.expiresAt) {
      logout();
      return null;
    }

    // Get user from users list
    const users = JSON.parse(localStorage.getItem('applypro_users') || '[]');
    const user = users.find((u: User) => u.id === session.userId);

    if (!user) {
      logout();
      return null;
    }

    // Don't return password
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  } catch (e) {
    return null;
  }
}

export function updateUser(updates: Partial<User>): { success: boolean; error?: string } {
  if (!isBrowser) return { success: false, error: 'Not in browser environment' };

  const currentUser = getCurrentUser();
  if (!currentUser) {
    return { success: false, error: 'Not authenticated' };
  }

  const users = JSON.parse(localStorage.getItem('applypro_users') || '[]');
  const userIndex = users.findIndex((u: User) => u.id === currentUser.id);

  if (userIndex === -1) {
    return { success: false, error: 'User not found' };
  }

  // Update user
  users[userIndex] = { ...users[userIndex], ...updates };
  localStorage.setItem('applypro_users', JSON.stringify(users));

  return { success: true };
}

export function changePassword(currentPassword: string, newPassword: string): { success: boolean; error?: string } {
  if (!isBrowser) return { success: false, error: 'Not in browser environment' };

  const user = getCurrentUser();
  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  // Get full user with password
  const users = JSON.parse(localStorage.getItem('applypro_users') || '[]');
  const fullUser = users.find((u: User) => u.id === user.id);

  if (!fullUser) {
    return { success: false, error: 'User not found' };
  }

  // Verify current password
  const isValid = bcrypt.compareSync(currentPassword, fullUser.password);

  if (!isValid) {
    return { success: false, error: 'Current password is incorrect' };
  }

  // Validate new password
  if (newPassword.length < 6) {
    return { success: false, error: 'New password must be at least 6 characters' };
  }

  // Hash new password
  const hashedPassword = bcrypt.hashSync(newPassword, 10);

  // Update password
  const userIndex = users.findIndex((u: User) => u.id === user.id);
  users[userIndex].password = hashedPassword;
  localStorage.setItem('applypro_users', JSON.stringify(users));

  return { success: true };
}

function createSession(userId: string): void {
  if (!isBrowser) return;

  const session: Session = {
    userId,
    token: crypto.randomUUID(),
    expiresAt: Date.now() + SESSION_DURATION
  };

  localStorage.setItem('applypro_session', JSON.stringify(session));
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function getPasswordStrength(password: string): { strength: 'weak' | 'medium' | 'strong'; score: number } {
  let score = 0;

  // Length
  if (password.length >= 8) score += 25;
  if (password.length >= 12) score += 25;

  // Contains lowercase
  if (/[a-z]/.test(password)) score += 10;

  // Contains uppercase
  if (/[A-Z]/.test(password)) score += 15;

  // Contains numbers
  if (/[0-9]/.test(password)) score += 15;

  // Contains special characters
  if (/[^a-zA-Z0-9]/.test(password)) score += 10;

  if (score < 40) return { strength: 'weak', score };
  if (score < 70) return { strength: 'medium', score };
  return { strength: 'strong', score };
}
