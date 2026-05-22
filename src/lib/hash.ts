/**
 * SHA-256 hash utility for PIN hashing
 * Uses Web Crypto API (works in browser and Edge Runtime)
 */

export async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return hashHex;
}

export async function verifyPin(pin: string, hashedPin: string): Promise<boolean> {
  const hashed = await hashPin(pin);
  return hashed === hashedPin;
}
