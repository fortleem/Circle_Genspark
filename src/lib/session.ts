// Cirkle — Global session layer
// Single source of truth for the signed-in user across every screen.
// Falls back to demo user (id=1, Ahmed) when not signed in so the whole
// platform remains explorable before registration.

export interface SessionUser {
  id: number;
  handle: string;
  display_name: string;
  email?: string | null;
  country?: string;
  city?: string;
  verified?: number;
  avatar_cid?: string | null;
}

const USER_KEY = "cirkle-user";
const SESSION_KEY = "cirkle-session";

/** Currently signed-in user, or null when browsing as guest/demo. */
export function getUser(): SessionUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    const u = JSON.parse(raw);
    if (u && typeof u.id === "number") return u as SessionUser;
    return null;
  } catch {
    return null;
  }
}

/** Numeric user id every module should use. Demo user 1 when signed out. */
export function getMe(): number {
  return getUser()?.id ?? 1;
}

export function getSessionId(): string | null {
  return localStorage.getItem(SESSION_KEY);
}

export function isSignedIn(): boolean {
  return !!getUser() && !!getSessionId();
}

export function setSession(sessionId: string, user: SessionUser) {
  localStorage.setItem(SESSION_KEY, sessionId);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event("cirkle-session-change"));
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(USER_KEY);
  window.dispatchEvent(new Event("cirkle-session-change"));
}

/** Subscribe to sign-in / sign-out. Returns unsubscribe fn. */
export function onSessionChange(fn: () => void): () => void {
  window.addEventListener("cirkle-session-change", fn);
  window.addEventListener("storage", fn);
  return () => {
    window.removeEventListener("cirkle-session-change", fn);
    window.removeEventListener("storage", fn);
  };
}
