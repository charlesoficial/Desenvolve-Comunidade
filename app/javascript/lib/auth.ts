import { getSupabaseUrl, isSupabaseConfigured, supabaseRest } from "./supabase";

const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const authStorageKey = "cs-auth-session";
const rememberedLoginKey = "cs-remembered-login";

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

// Inicia o fluxo OAuth via Supabase. Os providers Google e Amazon precisam
// estar habilitados no painel Authentication > Providers do Supabase, com
// client_id e client_secret. O redirect_to deve estar listado em
// Authentication > URL configuration > Redirect URLs.
export function startOAuth(provider: "google" | "amazon") {
  if (!isSupabaseConfigured() || !supabaseAnonKey) {
    throw new Error("Supabase Auth não está configurado.");
  }

  const redirectTo = `${window.location.origin}/auth/callback`;
  const url = new URL(`${getSupabaseUrl()?.replace(/\/$/, "")}/auth/v1/authorize`);
  url.searchParams.set("provider", provider);
  url.searchParams.set("redirect_to", redirectTo);
  window.location.assign(url.toString());
}

// Pos-callback do OAuth: o Supabase devolve access_token/refresh_token no
// hash da URL (#access_token=...). Precisamos parsear, salvar como sessao
// e limpar a URL.
export function consumeOAuthCallback(): SupabaseAuthSession | null {
  const hash = window.location.hash.replace(/^#/, "");
  if (!hash || !hash.includes("access_token=")) return null;

  const params = new URLSearchParams(hash);
  const accessToken = params.get("access_token");
  if (!accessToken) return null;

  const session: SupabaseAuthSession = {
    access_token: accessToken,
    refresh_token: params.get("refresh_token") || undefined,
    expires_in: Number(params.get("expires_in")) || undefined,
    token_type: params.get("token_type") || "bearer",
  };

  // Tenta hidratar dados do user via /auth/v1/user com o token recebido.
  fetch(`${getSupabaseUrl()?.replace(/\/$/, "")}/auth/v1/user`, {
    headers: {
      apikey: supabaseAnonKey || "",
      Authorization: `Bearer ${accessToken}`,
    },
  })
    .then((r) => (r.ok ? r.json() : null))
    .then((user) => {
      if (user) {
        session.user = user;
        localStorage.setItem(authStorageKey, JSON.stringify(session));
      }
    })
    .catch(() => undefined);

  localStorage.setItem(authStorageKey, JSON.stringify(session));
  // Limpa o hash pra nao exibir o token na URL.
  window.history.replaceState({}, "", window.location.pathname + window.location.search);
  return session;
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
