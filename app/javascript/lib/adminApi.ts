// Cliente HTTP dedicado ao painel admin. Evita pendurar mais funcao
// dentro de communityApi.ts (ja com 1800+ linhas).
import { getStoredAuthSession } from "./auth";

export type AdminCommunity = {
  id: string | null;
  name: string;
  slug?: string;
  description: string;
  locale: string;
  timezone: string;
  brand_color?: string | null;
  logo_url?: string | null;
};

export type AdminUser = {
  id: string;
  username: string;
  display_name: string;
  email: string;
  avatar_url: string | null;
  role: "owner" | "admin" | "moderator" | "member";
  status: "online" | "offline" | "away";
  last_seen_at: string | null;
  created_at: string;
};

export type AdminUsersPage = {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
  users: AdminUser[];
};

async function adminFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const session = getStoredAuthSession();
  if (session?.access_token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${session.access_token}`);
  }

  const response = await fetch(path, { ...options, headers, credentials: "include" });
  if (!response.ok) {
    throw new Error(`Admin API request failed (${response.status})`);
  }

  return response.json() as Promise<T>;
}

export function loadAdminCommunity() {
  return adminFetch<AdminCommunity>("/api/v1/admin/community");
}

export function updateAdminCommunity(payload: Partial<AdminCommunity>) {
  return adminFetch<AdminCommunity>("/api/v1/admin/community", {
    method: "PATCH",
    body: JSON.stringify({ community: payload }),
  });
}

type LoadUsersOptions = {
  page?: number;
  perPage?: number;
  q?: string;
  status?: string;
  role?: string;
};

export function loadAdminUsers({ page = 1, perPage = 20, q = "", status = "", role = "" }: LoadUsersOptions = {}) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("per_page", String(perPage));
  if (q) params.set("q", q);
  if (status) params.set("status", status);
  if (role) params.set("role", role);

  return adminFetch<AdminUsersPage>(`/api/v1/admin/users?${params.toString()}`);
}


export type AdminDashboardStat = {
  key: string;
  label: string;
  value: number;
  delta_pct: number | null;
  positive: boolean;
};

export type AdminDashboard = {
  community_id: string | null;
  generated_at: string;
  stats: AdminDashboardStat[];
  totals: { members: number; spaces: number; posts: number };
};

export type AdminSpace = {
  id: string;
  name: string;
  slug: string;
  kind: "feed" | "chat" | "members" | "progress" | "course" | "link";
  icon: string | null;
  position: number;
  locked: boolean;
  visibility: string;
  posts_count: number;
  messages_count: number;
  members_count: number;
};

export type AdminUserDetail = AdminUser & {
  posts_count: number;
  comments_count: number;
  connections_count: number;
};

export function loadAdminDashboard() {
  return adminFetch<AdminDashboard>("/api/v1/admin/dashboard");
}

export function loadAdminSpaces() {
  return adminFetch<AdminSpace[]>("/api/v1/admin/spaces");
}

export function updateAdminSpace(id: string, payload: Partial<Pick<AdminSpace, "name" | "kind" | "locked" | "position">>) {
  return adminFetch<AdminSpace>(`/api/v1/admin/spaces/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify({ space: payload }),
  });
}

export function reorderAdminSpaces(ids: string[]) {
  return adminFetch<{ ok: boolean; count: number }>("/api/v1/admin/spaces/reorder", {
    method: "POST",
    body: JSON.stringify({ ids }),
  });
}

export function loadAdminUser(id: string) {
  return adminFetch<AdminUserDetail>(`/api/v1/admin/users/${encodeURIComponent(id)}`);
}

export function updateAdminUser(id: string, payload: Partial<Pick<AdminUser, "role" | "status" | "display_name">>) {
  return adminFetch<AdminUserDetail>(`/api/v1/admin/users/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify({ user: payload }),
  });
}


export type AdminPlan = {
  id: string;
  name: string;
  description: string;
  price_cents: number;
  currency: string;
  interval: "month" | "year" | "one_time";
  highlight: boolean;
  active: boolean;
  position: number;
};

export type AdminPaywall = {
  id: string;
  name: string;
  description: string;
  price_cents: number;
  currency: string;
  interval: "month" | "year" | "one_time";
  status: "active" | "paused" | "archived";
};

export function loadAdminPlans() {
  return adminFetch<AdminPlan[]>("/api/v1/admin/plans");
}

export function createAdminPlan(payload: Partial<AdminPlan>) {
  return adminFetch<AdminPlan>("/api/v1/admin/plans", {
    method: "POST",
    body: JSON.stringify({ plan: payload }),
  });
}

export function updateAdminPlan(id: string, payload: Partial<AdminPlan>) {
  return adminFetch<AdminPlan>(`/api/v1/admin/plans/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify({ plan: payload }),
  });
}

export function deleteAdminPlan(id: string) {
  return adminFetch<void>(`/api/v1/admin/plans/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export function loadAdminPaywalls() {
  return adminFetch<AdminPaywall[]>("/api/v1/admin/paywalls");
}

export function createAdminPaywall(payload: Partial<AdminPaywall>) {
  return adminFetch<AdminPaywall>("/api/v1/admin/paywalls", {
    method: "POST",
    body: JSON.stringify({ paywall: payload }),
  });
}

export function updateAdminPaywall(id: string, payload: Partial<AdminPaywall>) {
  return adminFetch<AdminPaywall>(`/api/v1/admin/paywalls/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify({ paywall: payload }),
  });
}

export function deleteAdminPaywall(id: string) {
  return adminFetch<void>(`/api/v1/admin/paywalls/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}


export type AdminAnalytics = {
  community_id: string | null;
  generated_at: string;
  series: Array<{ date: string; signups: number; posts: number; messages: number }>;
  totals: { signups: number; posts: number; messages: number };
};

export type AdminMembership = {
  id: string;
  user_id: string;
  state: "pending" | "active" | "blocked";
  role: AdminUser["role"];
  joined_at: string | null;
  created_at: string;
  user: {
    username: string;
    display_name: string;
    email: string;
    avatar_url: string | null;
  } | null;
};

export type AdminWorkflow = {
  id: string;
  name: string;
  trigger: string;
  action: string;
  enabled: boolean;
  created_at?: string;
};

export function loadAdminAnalytics() {
  return adminFetch<AdminAnalytics>("/api/v1/admin/analytics");
}

export function loadAdminMemberships(state: AdminMembership["state"] = "pending") {
  return adminFetch<AdminMembership[]>(`/api/v1/admin/memberships?state=${encodeURIComponent(state)}`);
}

export function updateAdminMembership(id: string, patch: { state: AdminMembership["state"] }) {
  return adminFetch<AdminMembership>(`/api/v1/admin/memberships/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify({ membership: patch }),
  });
}

export function deleteAdminMembership(id: string) {
  return adminFetch<void>(`/api/v1/admin/memberships/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export function loadAdminWorkflows() {
  return adminFetch<AdminWorkflow[]>("/api/v1/admin/workflows");
}

export function createAdminWorkflow(payload: Partial<AdminWorkflow>) {
  return adminFetch<AdminWorkflow>("/api/v1/admin/workflows", {
    method: "POST",
    body: JSON.stringify({ workflow: payload }),
  });
}

export function updateAdminWorkflow(id: string, payload: Partial<AdminWorkflow>) {
  return adminFetch<AdminWorkflow>(`/api/v1/admin/workflows/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify({ workflow: payload }),
  });
}

export function deleteAdminWorkflow(id: string) {
  return adminFetch<void>(`/api/v1/admin/workflows/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
