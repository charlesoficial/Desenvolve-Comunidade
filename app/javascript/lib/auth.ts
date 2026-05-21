import { getSupabaseUrl, isSupabaseConfigured, supabaseRest } from "./supabase";

const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const authStorageKey = "p6-auth-session";
const rememberedLoginKey = "p6-remembered-login";

type SupabaseAuthSession = {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
  user?: {
    id?: string;
    email?: string;
    user_metadata?: {
      display_name?: string;
      username?: string;
      role?: string;
    };
  };
};

type SupabaseUserRow = {
  email: string;
  username?: string;
  display_name?: string;
  role?: string;
};

export function getRememberedLogin() {
  return localStorage.getItem(rememberedLoginKey) || "";
}

export function clearRememberedLogin() {
  localStorage.removeItem(rememberedLoginKey);
}

export function saveRememberedLogin(value: string) {
  localStorage.setItem(rememberedLoginKey, value);
}

export function hasStoredAuthSession() {
  return Boolean(localStorage.getItem(authStorageKey));
}

export function getStoredAuthSession(): SupabaseAuthSession | null {
  try {
    const raw = localStorage.getItem(authStorageKey);
    return raw ? (JSON.parse(raw) as SupabaseAuthSession) : null;
  } catch {
    clearStoredAuthSession();
    return null;
  }
}

export function getStoredAuthEmail() {
  return getStoredAuthSession()?.user?.email || "";
}

export async function getCurrentUsername(fallback = "vitor-araujo") {
  const session = getStoredAuthSession();
  const metadataUsername = session?.user?.user_metadata?.username;
  if (metadataUsername) return metadataUsername;

  const email = session?.user?.email;
  if (!email || !isSupabaseConfigured()) return fallback;

  try {
    const rows = await supabaseRest<SupabaseUserRow[]>(
      `users?email=eq.${encodeURIComponent(email)}&select=username&limit=1`,
    );
    return rows[0]?.username || fallback;
  } catch {
    return fallback;
  }
}

export function clearStoredAuthSession() {
  localStorage.removeItem(authStorageKey);
}

export async function signInWithPassword(login: string, password: string, remember: boolean) {
  if (!isSupabaseConfigured() || !supabaseAnonKey) {
    throw new Error("Supabase Auth não está configurado.");
  }

  const email = await resolveEmail(login.trim());
  const response = await fetch(`${getSupabaseUrl()?.replace(/\/$/, "")}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error(authErrorMessage(await response.text()));
  }

  const session = (await response.json()) as SupabaseAuthSession;
  if (remember) {
    saveRememberedLogin(login.trim());
  } else {
    clearRememberedLogin();
  }
  localStorage.setItem(authStorageKey, JSON.stringify(session));
  return session;
}

export async function signUpWithPassword(email: string, password: string) {
  if (!isSupabaseConfigured() || !supabaseAnonKey) {
    throw new Error("Supabase Auth não está configurado.");
  }

  const response = await fetch(`${getSupabaseUrl()?.replace(/\/$/, "")}/auth/v1/signup`, {
    method: "POST",
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error(authErrorMessage(await response.text()));
  }

  return response.json();
}

export async function sendPasswordRecovery(emailOrUsername: string) {
  if (!isSupabaseConfigured() || !supabaseAnonKey) {
    throw new Error("Supabase Auth não está configurado.");
  }

  const email = await resolveEmail(emailOrUsername.trim());
  const redirectTo = `${window.location.origin}${window.location.pathname}?v=login`;
  const response = await fetch(`${getSupabaseUrl()?.replace(/\/$/, "")}/auth/v1/recover`, {
    method: "POST",
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, redirect_to: redirectTo }),
  });

  if (!response.ok) {
    throw new Error(authErrorMessage(await response.text()));
  }
}

export function startOAuth(provider: "google" | "amazon") {
  if (!isSupabaseConfigured() || !supabaseAnonKey) {
    throw new Error("Supabase Auth não está configurado.");
  }

  const redirectTo = `${window.location.origin}${window.location.pathname}?v=feed`;
  const url = new URL(`${getSupabaseUrl()?.replace(/\/$/, "")}/auth/v1/authorize`);
  url.searchParams.set("provider", provider);
  url.searchParams.set("redirect_to", redirectTo);
  window.location.assign(url.toString());
}

async function resolveEmail(login: string) {
  if (login.includes("@")) return login;

  const rows = await supabaseRest<SupabaseUserRow[]>(
    `users?username=eq.${encodeURIComponent(login)}&select=email&limit=1`,
  );
  const email = rows[0]?.email;
  if (!email) {
    throw new Error("Usuário não encontrado.");
  }
  return email;
}

function authErrorMessage(raw: string) {
  try {
    const data = JSON.parse(raw) as { error_description?: string; msg?: string; message?: string; error?: string };
    const message = data.error_description || data.msg || data.message || data.error;
    if (message?.toLowerCase().includes("invalid login credentials")) {
      return "E-mail, usuário ou senha inválidos.";
    }
    return message || "Não foi possível autenticar.";
  } catch {
    return "Não foi possível autenticar.";
  }
}
