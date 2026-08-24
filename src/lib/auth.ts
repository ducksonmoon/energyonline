import "server-only";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "energy_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

function getSecretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Precomputed bcrypt hash with no matching plaintext, used to keep login
 * comparison time constant when the username doesn't exist — otherwise a
 * missing user short-circuits before bcrypt runs, leaking valid usernames
 * via response timing.
 */
const DUMMY_PASSWORD_HASH = "$2b$10$19I3xEYqFyX6vtD2rHUSwec4myUrXs2JGr7/EmLMh0Pb/kabDcDwa";

export async function verifyPasswordConstantTime(password: string, hash: string | null): Promise<boolean> {
  return bcrypt.compare(password, hash ?? DUMMY_PASSWORD_HASH);
}

export type SessionPayload = { sub: string; username: string };

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getSecretKey());
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (typeof payload.sub !== "string" || typeof payload.username !== "string") return null;
    return { sub: payload.sub, username: payload.username };
  } catch {
    return null;
  }
}

export async function createSession(userId: string, username: string) {
  const token = await createSessionToken({ sub: userId, username });
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

const LOGIN_MAX_ATTEMPTS = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

/** In-memory per-username login throttle. Fine for a single-instance deployment. */
const loginAttempts = new Map<string, { count: number; firstAttempt: number }>();

export function checkLoginRateLimit(username: string): { allowed: boolean; retryAfterMs: number } {
  const key = username.trim().toLowerCase();
  const entry = loginAttempts.get(key);
  const now = Date.now();
  if (!entry || now - entry.firstAttempt > LOGIN_WINDOW_MS) return { allowed: true, retryAfterMs: 0 };
  if (entry.count >= LOGIN_MAX_ATTEMPTS) {
    return { allowed: false, retryAfterMs: LOGIN_WINDOW_MS - (now - entry.firstAttempt) };
  }
  return { allowed: true, retryAfterMs: 0 };
}

export function recordFailedLogin(username: string) {
  const key = username.trim().toLowerCase();
  const now = Date.now();
  const entry = loginAttempts.get(key);
  if (!entry || now - entry.firstAttempt > LOGIN_WINDOW_MS) {
    loginAttempts.set(key, { count: 1, firstAttempt: now });
  } else {
    entry.count += 1;
  }
}

export function clearLoginAttempts(username: string) {
  loginAttempts.delete(username.trim().toLowerCase());
}
