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


// ---------- Coupons ----------
export type AdminCoupon = {
  id: string;
  code: string;
  description: string;
  discount_type: "percent" | "fixed";
  discount_value: number;
  max_uses: number | null;
  used_count: number;
  remaining_uses: number | null;
  expires_at: string | null;
  active: boolean;
  usable: boolean;
  applies_to: "all" | "paywall" | "plan";
  paywall_id: string | null;
  plan_id: string | null;
  created_at: string;
};

export function loadAdminCoupons() {
  return adminFetch<AdminCoupon[]>("/api/v1/admin/coupons");
}
export function createAdminCoupon(payload: Partial<AdminCoupon>) {
  return adminFetch<AdminCoupon>("/api/v1/admin/coupons", {
    method: "POST",
    body: JSON.stringify({ coupon: payload }),
  });
}
export function updateAdminCoupon(id: string, payload: Partial<AdminCoupon>) {
  return adminFetch<AdminCoupon>(`/api/v1/admin/coupons/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify({ coupon: payload }),
  });
}
export function deleteAdminCoupon(id: string) {
  return adminFetch<void>(`/api/v1/admin/coupons/${encodeURIComponent(id)}`, { method: "DELETE" });
}

// ---------- Member Tags ----------
export type AdminMemberTag = {
  id: string;
  name: string;
  color: string;
  description: string;
  members_count: number;
  created_at: string;
};

export function loadAdminMemberTags() {
  return adminFetch<AdminMemberTag[]>("/api/v1/admin/member_tags");
}
export function createAdminMemberTag(payload: Partial<AdminMemberTag>) {
  return adminFetch<AdminMemberTag>("/api/v1/admin/member_tags", {
    method: "POST",
    body: JSON.stringify({ tag: payload }),
  });
}
export function updateAdminMemberTag(id: string, payload: Partial<AdminMemberTag>) {
  return adminFetch<AdminMemberTag>(`/api/v1/admin/member_tags/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify({ tag: payload }),
  });
}
export function deleteAdminMemberTag(id: string) {
  return adminFetch<void>(`/api/v1/admin/member_tags/${encodeURIComponent(id)}`, { method: "DELETE" });
}


// ---------- Segmentos ----------
export type AdminSegment = {
  id: string;
  name: string;
  description: string;
  filters: Record<string, unknown>;
  members_count: number;
  last_calculated_at: string | null;
  created_at: string;
};

export function loadAdminSegments() {
  return adminFetch<AdminSegment[]>("/api/v1/admin/segments");
}
export function createAdminSegment(payload: Partial<AdminSegment>) {
  return adminFetch<AdminSegment>("/api/v1/admin/segments", {
    method: "POST",
    body: JSON.stringify({ segment: payload }),
  });
}
export function updateAdminSegment(id: string, payload: Partial<AdminSegment>) {
  return adminFetch<AdminSegment>(`/api/v1/admin/segments/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify({ segment: payload }),
  });
}
export function deleteAdminSegment(id: string) {
  return adminFetch<void>(`/api/v1/admin/segments/${encodeURIComponent(id)}`, { method: "DELETE" });
}

// ---------- Grupos de acesso ----------
export type AdminAccessGroup = {
  id: string;
  name: string;
  description: string;
  default_role: "owner" | "admin" | "moderator" | "member";
  space_ids: string[];
  space_count: number;
  members_count: number;
  active: boolean;
  created_at: string;
};

export function loadAdminAccessGroups() {
  return adminFetch<AdminAccessGroup[]>("/api/v1/admin/access_groups");
}
export function createAdminAccessGroup(payload: Partial<AdminAccessGroup>) {
  return adminFetch<AdminAccessGroup>("/api/v1/admin/access_groups", {
    method: "POST",
    body: JSON.stringify({ access_group: payload }),
  });
}
export function updateAdminAccessGroup(id: string, payload: Partial<AdminAccessGroup>) {
  return adminFetch<AdminAccessGroup>(`/api/v1/admin/access_groups/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify({ access_group: payload }),
  });
}
export function deleteAdminAccessGroup(id: string) {
  return adminFetch<void>(`/api/v1/admin/access_groups/${encodeURIComponent(id)}`, { method: "DELETE" });
}

// ---------- Gamificação ----------
export type AdminGamification = {
  id: string;
  enabled: boolean;
  points_per_post: number;
  points_per_comment: number;
  points_per_reaction_received: number;
  points_per_login: number;
  level_curve: "linear" | "exponential" | "custom";
  level_step: number;
  badges: unknown[];
  updated_at: string;
};

export function loadAdminGamification() {
  return adminFetch<AdminGamification>("/api/v1/admin/gamification");
}
export function updateAdminGamification(payload: Partial<AdminGamification>) {
  return adminFetch<AdminGamification>("/api/v1/admin/gamification", {
    method: "PATCH",
    body: JSON.stringify({ gamification: payload }),
  });
}

// ---------- Subscriptions ----------
export type AdminSubscription = {
  id: string;
  status: string;
  provider_subscription_id: string | null;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
  user: { id: string; username: string; display_name: string; email: string } | null;
  plan: { id: string; name: string; price_cents: number; currency: string; interval: string } | null;
};

export type AdminSubscriptionsPage = {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
  mrr_cents: number;
  subscriptions: AdminSubscription[];
};

export function loadAdminSubscriptions(opts: { page?: number; status?: string } = {}) {
  const params = new URLSearchParams();
  params.set("page", String(opts.page ?? 1));
  if (opts.status) params.set("status", opts.status);
  return adminFetch<AdminSubscriptionsPage>(`/api/v1/admin/subscriptions?${params.toString()}`);
}

export function updateAdminSubscription(id: string, status: string) {
  return adminFetch<AdminSubscription>(`/api/v1/admin/subscriptions/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify({ subscription: { status } }),
  });
}

// ---------- Charges ----------
export type AdminCharge = {
  id: string;
  provider_subscription_id: string | null;
  provider_customer_id: string | null;
  status: string;
  amount_cents: number | null;
  currency: string;
  interval: string | null;
  current_period_end: string | null;
  created_at: string;
  user: { id: string; username: string; display_name: string; email: string } | null;
  plan: { id: string; name: string } | null;
};

export type AdminChargesPage = {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
  charges: AdminCharge[];
};

export function loadAdminCharges(opts: { page?: number } = {}) {
  const params = new URLSearchParams();
  params.set("page", String(opts.page ?? 1));
  return adminFetch<AdminChargesPage>(`/api/v1/admin/charges?${params.toString()}`);
}


// ---------- Profile Fields ----------
export type AdminProfileField = {
  id: string;
  key: string;
  label: string;
  field_type: "text" | "number" | "dropdown" | "multi_select" | "date" | "url" | "textarea";
  placeholder: string | null;
  help_text: string | null;
  required: boolean;
  show_in_onboarding: boolean;
  visibility: "public" | "members" | "admin";
  options: string[];
  position: number;
  archived: boolean;
};

export function loadAdminProfileFields() {
  return adminFetch<AdminProfileField[]>("/api/v1/admin/profile_fields");
}
export function createAdminProfileField(payload: Partial<AdminProfileField>) {
  return adminFetch<AdminProfileField>("/api/v1/admin/profile_fields", {
    method: "POST",
    body: JSON.stringify({ profile_field: payload }),
  });
}
export function updateAdminProfileField(id: string, payload: Partial<AdminProfileField>) {
  return adminFetch<AdminProfileField>(`/api/v1/admin/profile_fields/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify({ profile_field: payload }),
  });
}
export function deleteAdminProfileField(id: string) {
  return adminFetch<void>(`/api/v1/admin/profile_fields/${encodeURIComponent(id)}`, { method: "DELETE" });
}

// ---------- Invitation Links ----------
export type AdminInvitationLink = {
  id: string;
  code: string;
  name: string | null;
  description: string | null;
  max_uses: number | null;
  uses_count: number;
  expires_at: string | null;
  active: boolean;
  status: "active" | "expired" | "consumed" | "inactive";
  url: string;
  plan: { id: string; name: string } | null;
  member_tag_id: string | null;
  created_by: { id: string; display_name: string } | null;
  created_at: string;
};

export function loadAdminInvitationLinks() {
  return adminFetch<AdminInvitationLink[]>("/api/v1/admin/invitation_links");
}
export function createAdminInvitationLink(payload: Partial<AdminInvitationLink>) {
  return adminFetch<AdminInvitationLink>("/api/v1/admin/invitation_links", {
    method: "POST",
    body: JSON.stringify({ invitation_link: payload }),
  });
}
export function updateAdminInvitationLink(id: string, payload: Partial<AdminInvitationLink>) {
  return adminFetch<AdminInvitationLink>(`/api/v1/admin/invitation_links/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify({ invitation_link: payload }),
  });
}
export function deleteAdminInvitationLink(id: string) {
  return adminFetch<void>(`/api/v1/admin/invitation_links/${encodeURIComponent(id)}`, { method: "DELETE" });
}

// ---------- Audit Logs ----------
export type AdminAuditLog = {
  id: string;
  action: string;
  target_type: string | null;
  target_id: string | null;
  metadata: Record<string, unknown>;
  ip_address: string | null;
  user_agent: string | null;
  actor: { id: string; display_name: string; username: string; email: string } | null;
  created_at: string;
};

export type AdminAuditLogsPage = {
  page: number;
  total: number;
  total_pages: number;
  logs: AdminAuditLog[];
};

export function loadAdminAuditLogs(opts: { page?: number; action?: string } = {}) {
  const params = new URLSearchParams();
  params.set("page", String(opts.page ?? 1));
  if (opts.action) params.set("action_filter", opts.action);
  return adminFetch<AdminAuditLogsPage>(`/api/v1/admin/audit_logs?${params.toString()}`);
}

// ---------- Bulk Imports ----------
export type AdminBulkImport = {
  id: string;
  action: string;
  target: string;
  status: "pending" | "running" | "completed" | "failed";
  filters: Record<string, unknown>;
  affected_count: number;
  finished_at: string | null;
  created_at: string;
};

export function loadAdminBulkImports() {
  return adminFetch<AdminBulkImport[]>("/api/v1/admin/bulk_imports");
}
export function createAdminBulkImport(payload: { file_name: string; total_rows?: number; tags?: string[]; plan_id?: string; note?: string }) {
  return adminFetch<AdminBulkImport>("/api/v1/admin/bulk_imports", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}


// ---------- Analytics Breakdown (sub-paginas) ----------
export type AdminAnalyticsBreakdownTotal = {
  key: string;
  label: string;
  value: number;
};

export type AdminAnalyticsBreakdownPoint = {
  date: string;
  value: number;
};

export type AdminAnalyticsBreakdownTop = {
  id: string;
  name: string;
  value: number;
  label?: string;
  username?: string;
  display_name?: string;
  last_seen_at?: string;
};

export type AdminAnalyticsBreakdown = {
  scope: string;
  generated_at: string;
  totals: AdminAnalyticsBreakdownTotal[];
  series: AdminAnalyticsBreakdownPoint[];
  series_label?: string;
  top: AdminAnalyticsBreakdownTop[];
  top_label?: string;
};

export function loadAdminAnalyticsBreakdown(scope: string) {
  return adminFetch<AdminAnalyticsBreakdown>(`/api/v1/admin/analytics/breakdown/${encodeURIComponent(scope)}`);
}
