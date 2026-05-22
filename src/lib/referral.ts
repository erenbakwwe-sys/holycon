/**
 * Generate a unique referral code for customers
 * Format: 6 uppercase alphanumeric characters (e.g., "HK3X9P")
 */

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Excluded I, O, 0, 1 to avoid confusion

export function generateReferralCode(): string {
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
  }
  return code;
}

/**
 * Generate a 6-digit reward claim code
 * Format: 6 numeric digits (e.g., "482917")
 */
export function generateRewardCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Build the referral share URL
 */
export function buildReferralUrl(referralCode: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${baseUrl}/card?ref=${referralCode}`;
}
