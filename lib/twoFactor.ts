import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.TWO_FACTOR_ENCRYPTION_KEY;

if (!ENCRYPTION_KEY) {
  throw new Error('TWO_FACTOR_ENCRYPTION_KEY environment variable is required');
}

const ENCRYPTION_SALT = process.env.TWO_FACTOR_SALT || 'applypro-2fa-salt-v1';

// Configure authenticator
authenticator.options = {
  digits: 6,
  step: 30, // 30 seconds
  window: 1, // Allow 1 step before/after for clock drift
};

// Generate a new secret for 2FA setup
export function generateTwoFactorSecret(email: string): {
  secret: string;
  otpauthUrl: string;
} {
  const secret = authenticator.generateSecret();
  const otpauthUrl = authenticator.keyuri(email, 'ApplyPro Admin', secret);
  
  return { secret, otpauthUrl };
}

// Generate QR code as data URL
export async function generateQRCode(otpauthUrl: string): Promise<string> {
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl, {
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    });
    return qrCodeDataUrl;
  } catch (error) {
    console.error('QR Code generation error:', error);
    throw new Error('Failed to generate QR code');
  }
}

// Verify a TOTP token
export function verifyTwoFactorToken(token: string, secret: string): boolean {
  try {
    return authenticator.verify({ token, secret });
  } catch (error) {
    console.error('Token verification error:', error);
    return false;
  }
}

// Generate backup codes
export function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    // Generate 8-character alphanumeric codes
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    // Format as XXXX-XXXX for readability
    codes.push(`${code.slice(0, 4)}-${code.slice(4)}`);
  }
  return codes;
}

// Hash backup codes for storage
export function hashBackupCode(code: string): string {
  return crypto.createHash('sha256').update(code.replace('-', '').toUpperCase()).digest('hex');
}

// Verify a backup code against stored hashes
export function verifyBackupCode(inputCode: string, storedHashes: string[]): {
  valid: boolean;
  remainingHashes: string[];
} {
  const inputHash = hashBackupCode(inputCode);
  const index = storedHashes.findIndex(hash => hash === inputHash);
  
  if (index === -1) {
    return { valid: false, remainingHashes: storedHashes };
  }
  
  // Remove used code
  const remainingHashes = [...storedHashes];
  remainingHashes.splice(index, 1);
  
  return { valid: true, remainingHashes };
}

export function encryptSecret(secret: string): string {
  const iv = crypto.randomBytes(16);
  const key = crypto.scryptSync(ENCRYPTION_KEY, ENCRYPTION_SALT, 32);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  
  let encrypted = cipher.update(secret, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return `${iv.toString('hex')}:${encrypted}`;
}

export function decryptSecret(encryptedSecret: string): string {
  const [ivHex, encrypted] = encryptedSecret.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const key = crypto.scryptSync(ENCRYPTION_KEY, ENCRYPTION_SALT, 32);
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
