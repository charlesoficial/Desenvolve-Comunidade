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


export type AdminApiToken = {
  id: string;
  name: string;
  token_prefix: string;
  scopes: string[];
  last_used_at: string | null;
  revoked_at: string | null;
  created_at: string;
};

export type AdminApiTokenWithSecret = AdminApiToken & { token: string };

export function loadAdminApiTokens() {
  return adminFetch<AdminApiToken[]>("/api/v1/admin/api_tokens");
}

export function createAdminApiToken(payload: { name: string; scopes: string[] }) {
  return adminFetch<AdminApiTokenWithSecret>("/api/v1/admin/api_tokens", {
    method: "POST",
    body: JSON.stringify({ api_token: payload }),
  });
}

export function revokeAdminApiToken(id: string) {
  return adminFetch<AdminApiToken>(`/api/v1/admin/api_tokens/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export type AdminPostRow = {
  id: string;
  title: string;
  body: string;
  created_at: string;
  published_at: string | null;
  space: { id: string; name: string; slug: string } | null;
  author: { id: string; username: string; display_name: string; avatar_url: string | null } | null;
};

export type AdminPostsPage = {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
  posts: AdminPostRow[];
};

export function loadAdminPosts(opts: { page?: number; perPage?: number; q?: string } = {}) {
  const params = new URLSearchParams();
  params.set("page", String(opts.page ?? 1));
  params.set("per_page", String(opts.perPage ?? 25));
  if (opts.q) params.set("q", opts.q);
  return adminFetch<AdminPostsPage>(`/api/v1/admin/posts?${params.toString()}`);
}

export function deleteAdminPost(id: string) {
  return adminFetch<void>(`/api/v1/admin/posts/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export function bulkDeleteAdminPosts(ids: string[]) {
  return adminFetch<{ deleted: number }>("/api/v1/admin/posts/bulk_destroy", {
    method: "POST",
    body: JSON.stringify({ ids }),
  });
}


// ---------- AI Knowledge ----------
export type AdminKnowledgeEntry = {
  id: string;
  title: string;
  body: string;
  source_url: string | null;
  enabled: boolean;
  created_at: string;
  updated_at: string;
};

export function loadAdminKnowledge() {
  return adminFetch<AdminKnowledgeEntry[]>("/api/v1/admin/ai_knowledge");
}
export function createAdminKnowledge(entry: Partial<AdminKnowledgeEntry>) {
  return adminFetch<AdminKnowledgeEntry>("/api/v1/admin/ai_knowledge", {
    method: "POST",
    body: JSON.stringify({ entry }),
  });
}
export function updateAdminKnowledge(id: string, entry: Partial<AdminKnowledgeEntry>) {
  return adminFetch<AdminKnowledgeEntry>(`/api/v1/admin/ai_knowledge/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify({ entry }),
  });
}
export function deleteAdminKnowledge(id: string) {
  return adminFetch<void>(`/api/v1/admin/ai_knowledge/${encodeURIComponent(id)}`, { method: "DELETE" });
}

// ---------- Email Templates ----------
export type AdminEmailTemplate = {
  id: string;
  key: string;
  subject: string;
  body: string;
  enabled: boolean;
  updated_at: string;
};

export function loadAdminEmailTemplates() {
  return adminFetch<AdminEmailTemplate[]>("/api/v1/admin/email_templates");
}
export function updateAdminEmailTemplate(id: string, payload: Partial<AdminEmailTemplate>) {
  return adminFetch<AdminEmailTemplate>(`/api/v1/admin/email_templates/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify({ email_template: payload }),
  });
}

// ---------- Files / Mídia ----------
export type AdminFile = {
  id: string;
  filename: string;
  url: string;
  storage_key: string;
  content_type: string | null;
  bytes: number;
  backend: string;
  created_at: string;
  user: { username: string; display_name: string } | null;
};

export type AdminFilesPage = {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
  files: AdminFile[];
};

export function loadAdminFiles(opts: { page?: number; perPage?: number } = {}) {
  const params = new URLSearchParams();
  params.set("page", String(opts.page ?? 1));
  params.set("per_page", String(opts.perPage ?? 30));
  return adminFetch<AdminFilesPage>(`/api/v1/admin/files?${params.toString()}`);
}
export function deleteAdminFile(id: string) {
  return adminFetch<void>(`/api/v1/admin/files/${encodeURIComponent(id)}`, { method: "DELETE" });
}

// ---------- Affiliates ----------
export type AdminAffiliate = {
  id: string;
  code: string;
  commission_pct: number;
  visits_count: number;
  conversions_count: number;
  total_revenue_cents: number;
  active: boolean;
  created_at: string;
  user: { id: string; username: string; display_name: string; avatar_url: string | null } | null;
};

export function loadAdminAffiliates() {
  return adminFetch<AdminAffiliate[]>("/api/v1/admin/affiliates");
}
export function createAdminAffiliate(payload: { user_id: string; commission_pct?: number }) {
  return adminFetch<AdminAffiliate>("/api/v1/admin/affiliates", {
    method: "POST",
    body: JSON.stringify({ affiliate: payload }),
  });
}
export function updateAdminAffiliate(id: string, payload: { commission_pct?: number; active?: boolean }) {
  return adminFetch<AdminAffiliate>(`/api/v1/admin/affiliates/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify({ affiliate: payload }),
  });
}
export function deleteAdminAffiliate(id: string) {
  return adminFetch<void>(`/api/v1/admin/affiliates/${encodeURIComponent(id)}`, { method: "DELETE" });
}


// ---------- Generic settings (sub-paginas de Geral) ----------
export type AdminSettingsBag = Record<string, unknown>;

export type AdminSettingsResponse = {
  key: string;
  settings: AdminSettingsBag;
  defaults: AdminSettingsBag;
};

export function loadAdminSettings(key: string) {
  return adminFetch<AdminSettingsResponse>(`/api/v1/admin/settings/${encodeURIComponent(key)}`);
}

export function updateAdminSettings(key: string, settings: AdminSettingsBag) {
  return adminFetch<AdminSettingsResponse>(`/api/v1/admin/settings/${encodeURIComponent(key)}`, {
    method: "PATCH",
    body: JSON.stringify({ settings }),
  });
}


// ---------- Static Pages ----------
export type AdminStaticPage = {
  id: string;
  title: string;
  slug: string;
  body: string;
  published: boolean;
  position: number;
  updated_at: string;
};

export function loadAdminPages() {
  return adminFetch<AdminStaticPage[]>("/api/v1/admin/pages");
}
export function createAdminPage(payload: Partial<AdminStaticPage>) {
  return adminFetch<AdminStaticPage>("/api/v1/admin/pages", {
    method: "POST",
    body: JSON.stringify({ page: payload }),
  });
}
export function updateAdminPage(id: string, payload: Partial<AdminStaticPage>) {
  return adminFetch<AdminStaticPage>(`/api/v1/admin/pages/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify({ page: payload }),
  });
}
export function deleteAdminPage(id: string) {
  return adminFetch<void>(`/api/v1/admin/pages/${encodeURIComponent(id)}`, { method: "DELETE" });
}

// ---------- Topics ----------
export type AdminTopic = {
  id: string;
  name: string;
  slug: string;
  color: string;
  description: string;
  posts_count: number;
  position: number;
};

export function loadAdminTopics() {
  return adminFetch<AdminTopic[]>("/api/v1/admin/topics");
}
export function createAdminTopic(payload: Partial<AdminTopic>) {
  return adminFetch<AdminTopic>("/api/v1/admin/topics", {
    method: "POST",
    body: JSON.stringify({ topic: payload }),
  });
}
export function updateAdminTopic(id: string, payload: Partial<AdminTopic>) {
  return adminFetch<AdminTopic>(`/api/v1/admin/topics/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify({ topic: payload }),
  });
}
export function deleteAdminTopic(id: string) {
  return adminFetch<void>(`/api/v1/admin/topics/${encodeURIComponent(id)}`, { method: "DELETE" });
}

// ---------- Live Streams ----------
export type AdminLiveStream = {
  id: string;
  title: string;
  description: string;
  starts_at: string | null;
  ends_at: string | null;
  status: "scheduled" | "live" | "ended" | "cancelled";
  source_url: string | null;
  recording_url: string | null;
  host: { id: string; username: string; display_name: string } | null;
};

export function loadAdminLiveStreams() {
  return adminFetch<AdminLiveStream[]>("/api/v1/admin/live_streams");
}
export function createAdminLiveStream(payload: Partial<AdminLiveStream>) {
  return adminFetch<AdminLiveStream>("/api/v1/admin/live_streams", {
    method: "POST",
    body: JSON.stringify({ live_stream: payload }),
  });
}
export function updateAdminLiveStream(id: string, payload: Partial<AdminLiveStream>) {
  return adminFetch<AdminLiveStream>(`/api/v1/admin/live_streams/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify({ live_stream: payload }),
  });
}
export function deleteAdminLiveStream(id: string) {
  return adminFetch<void>(`/api/v1/admin/live_streams/${encodeURIComponent(id)}`, { method: "DELETE" });
}

// ---------- Bulk Actions ----------
export type AdminBulkAction = {
  id: string;
  action: string;
  target: string;
  filters: Record<string, unknown>;
  affected_count: number;
  status: "pending" | "running" | "completed" | "failed";
  created_at: string;
  finished_at: string | null;
  user: { username: string; display_name: string } | null;
};

export function loadAdminBulkActions() {
  return adminFetch<AdminBulkAction[]>("/api/v1/admin/bulk_actions");
}
export function createAdminBulkAction(payload: { action: string; target?: string; filters?: Record<string, unknown>; affected_count?: number }) {
  return adminFetch<AdminBulkAction>("/api/v1/admin/bulk_actions", {
    method: "POST",
    body: JSON.stringify({ bulk_action: payload }),
  });
}
