import { offlineMembers, onlineMembers } from "../data/chatData";
import { posts as fallbackPosts } from "../data/communityData";
import {
  findSourceSixCapturedPost,
  sourceSixCapturedComments,
  sourceSixCapturedPostId,
  type SourceSixCapturedPostSeed,
} from "../data/sourceSixCapturedPosts";
import type { ChatMessage, DetailMember } from "../data/chatData";
import type { Post } from "../types/community";
import { getCurrentUsername } from "./auth";
import { getSupabaseAnonKey, getSupabaseUrl, isSupabaseConfigured, supabaseRest, supabaseStorageUpload } from "./supabase";

type DbChatMessage = {
  id: string;
  parent_id?: string | null;
  body: string;
  created_at: string;
  author_username: string;
  author_name: string;
  author_avatar_url: string | null;
};

type DbMember = {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  status: "online" | "offline" | "away";
  role: "owner" | "admin" | "moderator" | "member";
  level?: number | null;
  joined_at?: string | null;
  last_seen_at?: string | null;
};

type DbPost = {
  id: string;
  space_slug: string;
  title: string;
  body: string;
  published_at: string | null;
  created_at: string;
  edited_at?: string | null;
  comments_count: number;
  reactions_count: number;
  pinned?: boolean;
  metadata?: Record<string, unknown> | null;
  attachments?: FeedAttachment[];
  liked_by_viewer?: boolean;
  saved_by_viewer?: boolean;
  views_count?: number;
  author_username?: string;
  author_name: string;
  author_avatar_url: string | null;
  author_role: string | null;
  author_level: number | null;
  author_joined_at: string | null;
};

type RailsPost = {
  id: string;
  title: string;
  body: string;
  status?: string;
  pinned?: boolean;
  published_at?: string | null;
  edited_at?: string | null;
  comments_count?: number;
  reactions_count?: number;
  views_count?: number;
  attachments?: FeedAttachment[];
  liked_by_viewer?: boolean;
  saved_by_viewer?: boolean;
  metadata?: Record<string, unknown> | null;
  space?: { slug?: string };
  user?: {
    username?: string;
    display_name?: string;
    avatar_url?: string | null;
    role?: string | null;
  };
};

type RailsMessage = {
  id: string;
  body: string;
  parent_id?: string | null;
  created_at: string;
  user?: {
    username?: string;
    display_name?: string;
    avatar_url?: string | null;
  };
};

type RailsComment = {
  id: string;
  body: string;
  reactions_count?: number;
  created_at: string;
  user?: {
    username?: string;
    display_name?: string;
    avatar_url?: string | null;
    role?: string | null;
  };
};

type RailsDirectConversation = {
  id: string;
  memberId: string;
  memberUsername: string;
  memberName?: string;
  memberAvatar?: string | null;
  memberRole?: DirectoryMember["role"];
  memberStatus?: DirectoryMember["status"];
  lastMessage: string;
  lastMessageAt: string;
  unread: boolean;
  unreadCount?: number;
};

type RailsDirectMessage = {
  id: string;
  conversationId: string;
  memberUsername: string;
  author: "viewer" | "member";
  body: string;
  time: string;
  createdAt: string;
  dateLabel?: string;
  variant?: "welcome";
};

type RailsMemberConnection = {
  id: string;
  requesterUsername: string;
  targetUsername: string;
  status: "pending" | "accepted" | "rejected" | "blocked" | "connected";
  message?: string | null;
};

type DbMemberConnection = {
  id: string;
  requester_username: string;
  target_username: string;
  status: "connected";
  created_at: string;
};

export type FeedAttachment = {
  id?: string;
  kind: "image" | "video" | "file";
  fileName: string;
  fileUrl: string;
  mimeType?: string | null;
  sizeBytes?: number | null;
  width?: number | null;
  height?: number | null;
  position?: number | null;
};

export type FeedComment = {
  id: string;
  postId: string;
  body: string;
  reactions: number;
  createdAt: string;
  author: {
    username: string;
    name: string;
    avatar: string;
    role?: string | null;
    level?: number | null;
  };
};

export type FeedLike = {
  id: string;
  postId: string;
  emoji: string;
  author: {
    username: string;
    name: string;
    avatar: string;
  };
};

export type DirectoryMember = {
  id: string;
  username: string;
  name: string;
  avatar: string;
  headline: string;
  location: string;
  status: "online" | "offline" | "away";
  role: "owner" | "admin" | "moderator" | "member";
  level: number;
  joinedAt: string;
  lastSeen: string;
  bio: string;
  tags: string[];
  points: number;
  posts: number;
  comments: number;
  spaces: number;
};

export type DirectConversation = {
  id: string;
  memberUsername: string;
  memberId: string;
  memberName: string;
  memberAvatar: string;
  memberRole: DirectoryMember["role"];
  memberStatus: DirectoryMember["status"];
  lastMessage: string;
  lastMessageAt: string;
  unread: boolean;
  unreadCount: number;
};

export type DirectMessage = {
  id: string;
  conversationId: string;
  memberUsername: string;
  author: "viewer" | "member";
  body: string;
  time: string;
  createdAt: string;
  dateLabel?: string;
  variant?: "welcome";
};

export const originalNightConversationId = "9894455e-3a71-4ba7-a1f3-9aebae6f5cec";

export type FeedPost = {
  id: string;
  title: string;
  body: string;
  spaceSlug: string;
  kind: "article" | "image" | "compact" | "poll" | "video" | "file";
  topics: string[];
  publishedAt: string;
  editedAt?: string | null;
  comments: number;
  likes: number;
  views: number;
  pinned: boolean;
  liked: boolean;
  saved: boolean;
  attachments: FeedAttachment[];
  author: {
    username: string;
    name: string;
    avatar: string;
    badge: string;
    level: string;
    joinedAt: string;
  };
};

type DbFeedComment = {
  id: string;
  post_id: string;
  body: string;
  reactions_count: number;
  created_at: string;
  author_username: string;
  author_name: string;
  author_avatar_url: string | null;
  author_role: string | null;
  author_level: number | null;
};

type DbFeedLike = {
  id: string;
  post_id: string;
  emoji: string;
  author_username: string;
  author_name: string;
  author_avatar_url: string | null;
};

export type LeaderboardPeriod = "7_days" | "30_days" | "all_time";

export type LeaderboardEntry = {
  id: string;
  username: string;
  name: string;
  subtitle?: string;
  avatar: string;
  points: number;
};

export type LeaderboardUserSummary = LeaderboardEntry & {
  level: number;
  nextLevel: number | null;
  pointsToNextLevel: number;
};

export type LeaderboardData = {
  entries: LeaderboardEntry[];
  currentUser: LeaderboardUserSummary;
};

export type ViewerProfileSummary = {
  id: string;
  username: string;
  name: string;
  avatar: string;
  lastSeen: string;
  joinedAt: string;
  level: number;
  points: number;
  pointsToNextLevel: number;
  posts: number;
  comments: number;
  spaces: number;
  rewards: number;
  tags: string[];
};

export type AccountNotificationKey =
  | "post_comments"
  | "comment_replies"
  | "mentions"
  | "dms"
  | "weekly_digest"
  | "post_likes"
  | "comment_likes"
  | "live_rooms"
  | "course_content"
  | "polls";

export type AccountSettings = {
  id: string;
  username: string;
  name: string;
  avatarUrl: string | null;
  timezone: string;
  language: string;
  headline: string;
  bio: string;
  location: string;
  links: {
    website: string;
    twitter: string;
    facebook: string;
    instagram: string;
    linkedin: string;
  };
  emailUpdates: boolean;
  notifications: Record<AccountNotificationKey, { email: boolean; platform: boolean }>;
  privacy: {
    showInDirectory: boolean;
    preventMessages: boolean;
  };
};

export type CommunityNotification = {
  id: string;
  kind: string;
  title: string;
  body: string;
  recordType: string | null;
  recordId: string | null;
  readAt: string | null;
  createdAt: string;
  archived: boolean;
};

type DbReaction = {
  user_id?: string;
  reactable_type: string;
  reactable_id: string;
  created_at: string;
};

type DbReactionTarget = {
  id: string;
  user_id: string;
};

type DbPublicProfile = Omit<DbMember, "id"> & {
  user_id: string;
};

type DbMembership = {
  user_id: string;
  level: number | null;
  state: "active" | "pending" | "blocked";
  joined_at?: string | null;
};

type DbViewerUser = {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  last_seen_at: string | null;
  created_at?: string;
  joined_at?: string | null;
  level?: number | null;
};

type DbAccountSettings = {
  id?: string;
  username?: string;
  name?: string;
  avatarUrl?: string | null;
  headline?: string | null;
  bio?: string | null;
  links?: Record<string, unknown> | null;
  preferences?: Record<string, unknown> | null;
};

type DbDirectoryProfile = {
  user_id: string;
  headline: string | null;
  bio: string | null;
  preferences: Record<string, unknown> | null;
};

type DbOwnerCount = {
  user_id: string;
};

type DbSpace = {
  id: string;
  name: string;
  slug: string;
  kind: "feed" | "chat" | "members" | "progress" | "course" | "link";
  icon?: string | null;
  position: number;
  locked: boolean;
  settings?: Record<string, unknown> | null;
};

type DbCourse = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  position: number;
  published: boolean;
};

type DbLesson = {
  id: string;
  course_id: string;
};

type DbSearchPost = {
  id: string;
  title: string;
  body: string;
  space_slug: string;
  author_name: string;
  author_avatar_url: string | null;
};

type DbNotification = {
  id: string;
  kind: string;
  title: string;
  body: string | null;
  record_type: string | null;
  record_id: string | null;
  read_at: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

export type CourseOverviewCard = {
  id: string;
  title: string;
  slug: string;
  section: string;
  progress: number | null;
  completed: boolean;
  private: boolean;
  imageUrl: string;
  iconUrl: string;
  lessonsCount: number;
};

export type CommunitySearchResult = {
  id: string;
  type: "member" | "post" | "space" | "course" | "lesson";
  title: string;
  subtitle: string;
  avatar: string;
  path?: string;
  targetView?: "feed" | "chat" | "members" | "progress" | "leaderboard" | "courses" | "events" | "politica" | "hackingTec";
};

export async function loadChatMessages(spaceSlug = "chat-geral") {
  if (isSupabaseConfigured()) {
    try {
      const rows = await supabaseRest<DbChatMessage[]>(
        `chat_messages_public?space_slug=eq.${encodeURIComponent(spaceSlug)}&select=*&order=created_at.asc`,
      );

      return rows.map((row, index) => mapChatMessage(row, rows[index - 1]));
    } catch {
      // Rails is the fallback API when Supabase is unavailable or incomplete.
    }
  }

  const rows = await railsJson<RailsMessage[]>(`/api/v1/messages?space_id=${encodeURIComponent(spaceSlug)}`).catch(() => []);
  return rows.map((row, index) => mapRailsMessage(row, rows[index - 1]));
}

export async function createChatMessage(body: string, spaceSlug = "chat-geral") {
  const authorUsername = await getCurrentUsername();
  if (isSupabaseConfigured()) {
    try {
      const result = await supabaseRest<DbChatMessage | DbChatMessage[]>("rpc/send_chat_message", {
        method: "POST",
        body: JSON.stringify({
          p_space_slug: spaceSlug,
          p_body: body,
          p_author_username: authorUsername,
        }),
      });

      const row = Array.isArray(result) ? result[0] : result;
      return mapChatMessage(row);
    } catch {
      // Fall through to Rails.
    }
  }

  return createRailsMessage(body, spaceSlug);
}

export async function createThreadMessage(body: string, parentId: string, spaceSlug = "chat-geral") {
  const authorUsername = await getCurrentUsername();
  if (isSupabaseConfigured()) {
    try {
      const [spaces, users] = await Promise.all([
        supabaseRest<Array<{ id: string }>>(`spaces?slug=eq.${encodeURIComponent(spaceSlug)}&select=id&limit=1`),
        supabaseRest<Array<{ id: string }>>(`users?username=eq.${encodeURIComponent(authorUsername)}&select=id&limit=1`),
      ]);
      const space = spaces[0];
      const user = users[0];

      if (!space || !user) throw new Error("Chat thread author or room not found");

      const inserted = await supabaseRest<Array<{ id: string }>>("messages?select=id", {
        method: "POST",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({
          space_id: space.id,
          user_id: user.id,
          parent_id: parentId,
          body,
        }),
      });
      const rowId = inserted[0]?.id;
      if (!rowId) throw new Error("Chat thread message was not saved");

      const rows = await supabaseRest<DbChatMessage[]>(`chat_messages_public?id=eq.${encodeURIComponent(rowId)}&select=*&limit=1`);
      return mapChatMessage(rows[0]);
    } catch {
      // Fall through to Rails.
    }
  }

  return createRailsMessage(body, spaceSlug, parentId);
}

export function directConversationIdForMember(member: Pick<DirectoryMember, "id" | "username">) {
  return member.username === "night" ? originalNightConversationId : member.id;
}

export function directMessagePathForMember(member: Pick<DirectoryMember, "id" | "username">) {
  return `/messages/${encodeURIComponent(directConversationIdForMember(member))}`;
}

export async function loadDirectConversations(): Promise<DirectConversation[]> {
  const rows = await railsJson<RailsDirectConversation[]>("/api/v1/direct_conversations");
  return rows.map(mapRailsDirectConversation);
}

export async function loadDirectConversation(conversationId: string): Promise<{ conversation: DirectConversation; messages: DirectMessage[] }> {
  const row = await railsJson<RailsDirectConversation & { messages: RailsDirectMessage[] }>(
    `/api/v1/direct_conversations/${encodeURIComponent(conversationId)}`,
  );

  return {
    conversation: mapRailsDirectConversation(row),
    messages: row.messages.map(mapRailsDirectMessage),
  };
}

export async function createOrLoadDirectConversation(member: DirectoryMember): Promise<DirectConversation> {
  const row = await railsJson<RailsDirectConversation>("/api/v1/direct_conversations", {
    method: "POST",
    body: JSON.stringify({
      direct_conversation: {
        username: member.username,
        name: member.name,
        avatar_url: member.avatar.startsWith("/") || member.avatar.startsWith("http") ? member.avatar : null,
        role: member.role,
        member_status: member.status,
      },
    }),
  });

  return mapRailsDirectConversation(row);
}

export async function loadDirectMessages(conversationId: string): Promise<DirectMessage[]> {
  const rows = await railsJson<RailsDirectMessage[]>(`/api/v1/direct_conversations/${encodeURIComponent(conversationId)}/messages`);
  return rows.map(mapRailsDirectMessage);
}

export async function createDirectMessage(conversationId: string, body: string): Promise<DirectMessage> {
  const row = await railsJson<RailsDirectMessage>(`/api/v1/direct_conversations/${encodeURIComponent(conversationId)}/messages`, {
    method: "POST",
    body: JSON.stringify({ direct_message: { body } }),
  });

  return mapRailsDirectMessage(row);
}

export async function markDirectConversationRead(conversationId: string): Promise<DirectConversation> {
  const row = await railsJson<RailsDirectConversation>(`/api/v1/direct_conversations/${encodeURIComponent(conversationId)}/read`, {
    method: "PATCH",
  });

  return mapRailsDirectConversation(row);
}

export function subscribeToChatMessages(onChange: () => void) {
  if (import.meta.env.VITE_SUPABASE_REALTIME_ENABLED !== "true") return () => {};

  const supabaseUrl = getSupabaseUrl();
  const supabaseAnonKey = getSupabaseAnonKey();

  if (!supabaseUrl || !supabaseAnonKey || !("WebSocket" in window)) return () => {};

  const socketUrl = `${supabaseUrl.replace(/^http/, "ws").replace(/\/$/, "")}/realtime/v1/websocket?apikey=${encodeURIComponent(supabaseAnonKey)}&vsn=1.0.0`;
  const socket = new WebSocket(socketUrl);
  const topic = "realtime:public:messages";
  let ref = 1;
  let heartbeat: number | undefined;

  socket.addEventListener("open", () => {
    socket.send(JSON.stringify({
      topic,
      event: "phx_join",
      payload: {
        config: {
          broadcast: { self: false },
          presence: { key: "" },
          postgres_changes: [{ event: "*", schema: "public", table: "messages" }],
        },
      },
      ref: String(ref++),
      join_ref: "1",
    }));

    heartbeat = window.setInterval(() => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ topic: "phoenix", event: "heartbeat", payload: {}, ref: String(ref++) }));
      }
    }, 25000);
  });

  socket.addEventListener("message", (event) => {
    try {
      const data = JSON.parse(event.data as string) as { event?: string; payload?: { data?: unknown } };
      if (data.event === "postgres_changes") onChange();
    } catch {
      // Ignore malformed realtime frames; polling remains the fallback.
    }
  });

  return () => {
    if (heartbeat) window.clearInterval(heartbeat);
    socket.close();
  };
}

export async function loadMembers() {
  if (!isSupabaseConfigured()) {
    return { online: onlineMembers, offline: offlineMembers, total: 859 };
  }

  try {
    const rows = await supabaseRest<DbMember[]>("community_members_public?select=*&order=display_name.asc");
    return {
      online: rows.filter((member) => member.status === "online" || member.status === "away").map(mapMember),
      offline: rows.filter((member) => member.status === "offline").map(mapMember),
      total: Math.max(860, rows.length),
    };
  } catch {
    return { online: onlineMembers, offline: offlineMembers, total: 859 };
  }
}

export async function loadDirectoryMembers(sort: "oldest" | "recent" | "alphabetical" = "oldest"): Promise<DirectoryMember[]> {
  if (!isSupabaseConfigured()) return prepareDirectoryMembers(fallbackDirectoryMembers(), sort);

  try {
    const order = sort === "recent" ? "joined_at.desc" : sort === "alphabetical" ? "display_name.asc" : "joined_at.asc";
    const [rows, profiles, posts, comments] = await Promise.all([
      supabaseRest<DbMember[]>(`community_members_public?select=*&order=${order}`),
      supabaseRest<DbDirectoryProfile[]>("profiles?select=user_id,headline,bio,preferences"),
      supabaseRest<DbOwnerCount[]>("posts?select=user_id"),
      supabaseRest<DbOwnerCount[]>("comments?select=user_id"),
    ]);

    const profilesByUser = new Map(profiles.map((profile) => [profile.user_id, profile]));
    const postsByUser = countByUser(posts);
    const commentsByUser = countByUser(comments);

    return sortDirectoryMembers(
      rows.map((row) => mapDirectoryMember(row, profilesByUser.get(row.id), postsByUser.get(row.id), commentsByUser.get(row.id))),
      sort,
    );
  } catch {
    return prepareDirectoryMembers(fallbackDirectoryMembers(), sort);
  }
}

export async function loadViewerConnections(username?: string) {
  try {
    const viewerUsername = username || await getCurrentUsername();
    const rows = await railsJson<RailsMemberConnection[]>("/api/v1/member_connections");
    return rows
      .filter((row) => row.status === "pending" || row.status === "accepted" || row.status === "connected")
      .map((row) => row.requesterUsername === viewerUsername ? row.targetUsername : row.requesterUsername);
  } catch {
    if (!isSupabaseConfigured()) return [];

    const viewerUsername = username || await getCurrentUsername();
    const rows = await supabaseRest<DbMemberConnection[]>(
      `member_connections_public?requester_username=eq.${encodeURIComponent(viewerUsername)}&select=target_username`,
    );

    return rows.map((row) => row.target_username);
  }
}

export async function createMemberConnection(member: DirectoryMember, message = "") {
  const row = await railsJson<RailsMemberConnection>("/api/v1/member_connections", {
    method: "POST",
    body: JSON.stringify({
      member_connection: {
        target_username: member.username,
        name: member.name,
        avatar_url: member.avatar.startsWith("/") || member.avatar.startsWith("http") ? member.avatar : null,
        role: member.role,
        member_status: member.status,
        message,
      },
    }),
  });

  return row.status === "pending" || row.status === "accepted" || row.status === "connected";
}

export async function toggleMemberConnection(targetUsername: string, requesterUsername?: string) {
  const member = fallbackDirectoryMembers().find((row) => row.username === targetUsername) || {
    id: targetUsername,
    username: targetUsername,
    name: targetUsername,
    avatar: targetUsername.slice(0, 2).toUpperCase(),
    headline: "",
    location: "",
    status: "offline" as const,
    role: "member" as const,
    level: 1,
    joinedAt: new Date().toISOString(),
    lastSeen: "",
    bio: "",
    tags: [],
    points: 0,
    posts: 0,
    comments: 0,
    spaces: 0,
  };

  try {
    return await createMemberConnection(member);
  } catch {
    if (!isSupabaseConfigured()) return false;
  }

  const viewerUsername = requesterUsername || await getCurrentUsername();
  const result = await supabaseRest<boolean>("rpc/toggle_member_connection", {
    method: "POST",
    body: JSON.stringify({
      p_requester_username: viewerUsername,
      p_target_username: targetUsername,
    }),
  });

  return Boolean(result);
}

export async function loadPosts(spaceSlug = "politica-nacional") {
  if (!isSupabaseConfigured()) return fallbackPosts;

  try {
    const rows = await supabaseRest<DbPost[]>(
      `posts_public?space_slug=eq.${encodeURIComponent(spaceSlug)}&select=*&order=published_at.desc`,
    );

    return rows.map(mapPost);
  } catch {
    return fallbackPosts;
  }
}

export async function createFeedPost(title: string, body: string, spaceSlug = "feed-geral", attachments: FeedAttachment[] = []) {
  const authorUsername = await getCurrentUsername();
  if (isSupabaseConfigured()) {
    try {
      const result = await supabaseRest<DbPost | DbPost[]>("rpc/create_feed_post", {
        method: "POST",
        body: JSON.stringify({
          p_space_slug: spaceSlug,
          p_title: title,
          p_body: body,
          p_author_username: authorUsername,
          p_attachments: attachments,
        }),
      });

      const row = Array.isArray(result) ? result[0] : result;
      return mapFeedPost(row);
    } catch {
      // Fall through to Rails.
    }
  }

  const row = await railsJson<RailsPost>("/api/v1/posts", {
    method: "POST",
    body: JSON.stringify({ post: { space_slug: spaceSlug, title, body, attachments } }),
  });
  return mapRailsPost(row, spaceSlug);
}

export async function loadFeedPosts(spaceSlug = "feed-geral"): Promise<FeedPost[]> {
  if (isSupabaseConfigured()) {
    try {
      const rows = await supabaseRest<DbPost[]>(
        `posts_public?space_slug=eq.${encodeURIComponent(spaceSlug)}&select=*&order=pinned.desc,published_at.desc`,
      );

      return rows.filter((row) => !row.metadata?.archived_by).map(mapFeedPost);
    } catch {
      // Fall through to Rails.
    }
  }

  const rows = await railsJson<RailsPost[]>(`/api/v1/posts?space_slug=${encodeURIComponent(spaceSlug)}`).catch(() => []);
  return rows.filter((row) => row.status !== "archived").map((row) => mapRailsPost(row, spaceSlug));
}

export async function updateFeedPost(postId: string, title: string, body: string) {
  const authorUsername = await getCurrentUsername();
  if (isSupabaseConfigured()) {
    try {
      const result = await supabaseRest<DbPost | DbPost[]>("rpc/update_feed_post", {
        method: "POST",
        body: JSON.stringify({
          p_post_id: postId,
          p_title: title,
          p_body: body,
          p_author_username: authorUsername,
        }),
      });

      return mapFeedPost(Array.isArray(result) ? result[0] : result);
    } catch {
      // Fall through to Rails.
    }
  }

  const row = await railsJson<RailsPost>(`/api/v1/posts/${encodeURIComponent(postId)}`, {
    method: "PATCH",
    body: JSON.stringify({ post: { title, body } }),
  });
  return mapRailsPost(row, "feed-geral");
}

export async function deleteFeedPost(postId: string) {
  const authorUsername = await getCurrentUsername();
  if (isSupabaseConfigured()) {
    try {
      return await supabaseRest<boolean>("rpc/delete_feed_post", {
        method: "POST",
        body: JSON.stringify({
          p_post_id: postId,
          p_author_username: authorUsername,
        }),
      });
    } catch {
      // Fall through to Rails.
    }
  }

  await railsJson<void>(`/api/v1/posts/${encodeURIComponent(postId)}`, { method: "DELETE" });
  return true;
}

export async function togglePostReaction(postId: string) {
  const authorUsername = await getCurrentUsername();
  if (isSupabaseConfigured()) {
    try {
      const result = await supabaseRest<DbPost | DbPost[]>("rpc/toggle_post_reaction", {
        method: "POST",
        body: JSON.stringify({
          p_post_id: postId,
          p_author_username: authorUsername,
          p_emoji: "like",
        }),
      });

      return mapFeedPost(Array.isArray(result) ? result[0] : result);
    } catch {
      // Fall through to Rails.
    }
  }

  const row = await railsJson<RailsPost>(`/api/v1/posts/${encodeURIComponent(postId)}/reaction`, {
    method: "POST",
    body: JSON.stringify({ reaction: { emoji: "like" } }),
  });
  return mapRailsPost(row, "feed-geral");
}

export async function togglePostSave(postId: string) {
  if (!isSupabaseConfigured()) return false;

  const authorUsername = await getCurrentUsername();
  return supabaseRest<boolean>("rpc/toggle_post_save", {
    method: "POST",
    body: JSON.stringify({
      p_post_id: postId,
      p_author_username: authorUsername,
    }),
  });
}

export async function recordPostView(postId: string) {
  if (!isSupabaseConfigured()) return 0;

  const authorUsername = await getCurrentUsername();
  return supabaseRest<number>("rpc/record_post_view", {
    method: "POST",
    body: JSON.stringify({
      p_post_id: postId,
      p_author_username: authorUsername,
      p_viewer_key: null,
    }),
  });
}

export async function loadPostComments(postId: string): Promise<FeedComment[]> {
  if (isSupabaseConfigured()) {
    try {
      const rows = await supabaseRest<DbFeedComment[]>(
        `post_comments_public?post_id=eq.${encodeURIComponent(postId)}&select=*&order=created_at.asc`,
      );

      return rows.map(mapFeedComment);
    } catch {
      // Fall through to Rails.
    }
  }

  const rows = await railsJson<RailsComment[]>(`/api/v1/posts/${encodeURIComponent(postId)}/comments`).catch(() => []);
  return rows.map((row) => mapRailsComment(row, postId));
}

export async function loadPostDetail(postId: string, spaceSlug = "feed-geral"): Promise<FeedPost | null> {
  try {
    const row = await railsJson<RailsPost>(`/api/v1/posts/${encodeURIComponent(postId)}`);
    return mapRailsPost(row, spaceSlug);
  } catch {
    // Supabase remains the primary data source in the current client.
  }

  if (isSupabaseConfigured()) {
    try {
      const rows = await supabaseRest<DbPost[]>(`posts_public?id=eq.${encodeURIComponent(postId)}&select=*&limit=1`);
      if (rows[0]) return mapFeedPost(rows[0]);
    } catch {
      // Fall through to list-based fallback.
    }
  }

  const capturedPost = findSourceSixCapturedPost(spaceSlug, postId);
  if (capturedPost) return mapSourceSixCapturedPost(capturedPost);

  const posts = await loadFeedPosts(spaceSlug).catch(() => []);
  const listMatch = posts.find((post) => post.id === postId || slugify(post.title) === postId);
  return listMatch || null;
}

export async function loadPostDetailComments(postId: string): Promise<FeedComment[]> {
  try {
    const rows = await railsJson<RailsComment[]>(`/api/v1/posts/${encodeURIComponent(postId)}/comments`);
    return rows.map((row) => mapRailsComment(row, postId));
  } catch {
    const rows = await loadPostComments(postId).catch(() => []);
    return rows.length ? rows : sourceSixCapturedComments(postId);
  }
}

export async function createFeedComment(postId: string, body: string) {
  const authorUsername = await getCurrentUsername();
  if (isSupabaseConfigured()) {
    try {
      const result = await supabaseRest<DbFeedComment | DbFeedComment[]>("rpc/create_post_comment", {
        method: "POST",
        body: JSON.stringify({
          p_post_id: postId,
          p_body: body,
          p_author_username: authorUsername,
          p_parent_id: null,
        }),
      });

      return mapFeedComment(Array.isArray(result) ? result[0] : result);
    } catch {
      // Fall through to Rails.
    }
  }

  const row = await railsJson<RailsComment>(`/api/v1/posts/${encodeURIComponent(postId)}/comments`, {
    method: "POST",
    body: JSON.stringify({ comment: { body, parent_id: null } }),
  });
  return mapRailsComment(row, postId);
}

export async function updateFeedComment(commentId: string, body: string, postId?: string) {
  const authorUsername = await getCurrentUsername();
  if (isSupabaseConfigured()) {
    try {
      const result = await supabaseRest<DbFeedComment | DbFeedComment[]>("rpc/update_post_comment", {
        method: "POST",
        body: JSON.stringify({
          p_comment_id: commentId,
          p_body: body,
          p_author_username: authorUsername,
        }),
      });

      return mapFeedComment(Array.isArray(result) ? result[0] : result);
    } catch {
      // Fall through to Rails when the caller can provide the parent post.
    }
  }

  if (!postId) throw new Error("Post id is required to update comments through Rails");

  const row = await railsJson<RailsComment>(
    `/api/v1/posts/${encodeURIComponent(postId)}/comments/${encodeURIComponent(commentId)}`,
    {
      method: "PATCH",
      body: JSON.stringify({ comment: { body } }),
    },
  );
  return mapRailsComment(row, postId);
}

export async function deleteFeedComment(commentId: string, postId?: string) {
  const authorUsername = await getCurrentUsername();
  if (isSupabaseConfigured()) {
    try {
      return await supabaseRest<boolean>("rpc/delete_post_comment", {
        method: "POST",
        body: JSON.stringify({
          p_comment_id: commentId,
          p_author_username: authorUsername,
        }),
      });
    } catch {
      // Fall through to Rails when the caller can provide the parent post.
    }
  }

  if (!postId) throw new Error("Post id is required to delete comments through Rails");

  await railsJson<void>(`/api/v1/posts/${encodeURIComponent(postId)}/comments/${encodeURIComponent(commentId)}`, { method: "DELETE" });
  return true;
}

export async function loadPostLikes(postId: string): Promise<FeedLike[]> {
  if (!isSupabaseConfigured()) return [];

  const rows = await supabaseRest<DbFeedLike[]>(
    `post_likes_public?post_id=eq.${encodeURIComponent(postId)}&select=*&order=created_at.asc`,
  ).catch(() => []);

  return rows.map((row) => ({
    id: row.id,
    postId: row.post_id,
    emoji: row.emoji,
    author: {
      username: row.author_username,
      name: row.author_name,
      avatar: row.author_avatar_url || initials(row.author_name),
    },
  }));
}

export async function loadCourseOverview(): Promise<CourseOverviewCard[]> {
  if (!isSupabaseConfigured()) return loadRailsCourseOverview();

  try {
    const [spaces, courses, lessons] = await Promise.all([
      supabaseRest<DbSpace[]>(
        "spaces?kind=in.(course,link)&select=id,name,slug,kind,locked,position,settings&order=position.asc",
      ),
      supabaseRest<DbCourse[]>("courses?select=id,title,slug,description,position,published&order=position.asc"),
      supabaseRest<DbLesson[]>("lessons?select=id,course_id"),
    ]);

    const lessonCounts = new Map<string, number>();
    for (const lesson of lessons) {
      lessonCounts.set(lesson.course_id, (lessonCounts.get(lesson.course_id) || 0) + 1);
    }

    const cards = spaces.map((space) => mapCourseSpace(space));

    for (const course of courses) {
      if (!cards.some((card) => card.slug === course.slug)) {
        cards.push({
          id: course.id,
          title: course.title,
          slug: course.slug,
          section: "Método P6 | 2026",
          progress: 0,
          completed: false,
          private: !course.published,
          imageUrl: courseImage(course.slug),
          iconUrl: courseIcon(course.slug),
          lessonsCount: lessonCounts.get(course.id) || 0,
        });
      }
    }

    return cards.length ? sortCourseOverview(cards) : fallbackCourseOverview();
  } catch {
    return loadRailsCourseOverview();
  }
}

export async function searchCommunity(query: string): Promise<CommunitySearchResult[]> {
  if (!isSupabaseConfigured()) return [];

  const term = query.trim();
  if (!term) return [];

  const encoded = encodeURIComponent(term.replace(/[,*()]/g, " "));

  try {
    const [members, posts, spaces, courses] = await Promise.all([
      supabaseRest<DbMember[]>(
        `community_members_public?or=(display_name.ilike.*${encoded}*,username.ilike.*${encoded}*)&select=id,username,display_name,avatar_url,role,status,level&limit=6`,
      ),
      supabaseRest<DbSearchPost[]>(
        `posts_public?or=(title.ilike.*${encoded}*,body.ilike.*${encoded}*)&select=id,title,body,space_slug,author_name,author_avatar_url&limit=6`,
      ),
      supabaseRest<DbSpace[]>(
        `spaces?or=(name.ilike.*${encoded}*,slug.ilike.*${encoded}*)&select=id,name,slug,kind,settings,locked,position&limit=6`,
      ),
      supabaseRest<DbCourse[]>(
        `courses?or=(title.ilike.*${encoded}*,description.ilike.*${encoded}*)&select=id,title,slug,description,position,published&limit=4`,
      ),
    ]);

    return [
      ...members.map((member) => ({
        id: `member-${member.id}`,
        type: "member" as const,
        title: member.display_name || member.username,
        subtitle: member.role === "admin" || member.role === "owner" ? "Administrador" : "Membro",
        avatar: member.avatar_url || initials(member.display_name || member.username),
        path: "/members",
        targetView: "members" as const,
      })),
      ...posts.map((post) => ({
        id: `post-${post.id}`,
        type: "post" as const,
        title: post.title || excerpt(post.body)[0] || "Publicação",
        subtitle: `${spaceLabel(post.space_slug)} · ${post.author_name}`,
        avatar: post.author_avatar_url || initials(post.author_name),
        path: `/c/${post.space_slug}/${post.id}`,
        targetView: viewForSpace(post.space_slug),
      })),
      ...spaces.map((space) => ({
        id: `space-${space.id}`,
        type: "space" as const,
        title: space.name,
        subtitle: stringValue(space.settings?.section) || "Espaço",
        avatar: space.name.slice(0, 2).toUpperCase(),
        path: pathForSpace(space.slug, space.kind),
        targetView: viewForSpace(space.slug, space.kind),
      })),
      ...courses.map((course) => ({
        id: `course-${course.id}`,
        type: "course" as const,
        title: course.title,
        subtitle: course.description || "Curso",
        avatar: "CR",
        path: "/courses",
        targetView: "courses" as const,
      })),
    ].slice(0, 16);
  } catch (error) {
    console.error("Failed to search community", error);
    return [];
  }
}

export async function loadLeaderboard(period: LeaderboardPeriod): Promise<LeaderboardEntry[]> {
  const data = await loadLeaderboardData(period);
  return data.entries;
}

export async function loadLeaderboardData(period: LeaderboardPeriod, viewerUsername?: string): Promise<LeaderboardData> {
  if (!isSupabaseConfigured()) return fallbackLeaderboardData(period);

  try {
    const resolvedViewerUsername = viewerUsername || await getCurrentUsername();
    const periodFilter = leaderboardPeriodFilter(period);
    const [profiles, memberships, reactions, posts, comments] = await Promise.all([
      supabaseRest<DbPublicProfile[]>("user_public_profiles?select=*"),
      supabaseRest<DbMembership[]>("memberships?select=user_id,level,state&state=eq.active"),
      supabaseRest<DbReaction[]>(
        `reactions?select=user_id,reactable_type,reactable_id,created_at&emoji=eq.like${periodFilter}&order=created_at.desc`,
      ),
      supabaseRest<DbReactionTarget[]>("posts?select=id,user_id"),
      supabaseRest<DbReactionTarget[]>("comments?select=id,user_id"),
    ]);

    const postOwners = new Map(posts.map((post) => [post.id, post.user_id]));
    const commentOwners = new Map(comments.map((comment) => [comment.id, comment.user_id]));
    const pointsByUser = new Map<string, number>();

    for (const reaction of reactions) {
      const ownerId = reaction.reactable_type === "post"
        ? postOwners.get(reaction.reactable_id)
        : reaction.reactable_type === "comment"
          ? commentOwners.get(reaction.reactable_id)
          : undefined;

      if (ownerId) pointsByUser.set(ownerId, (pointsByUser.get(ownerId) || 0) + 1);
    }

    const activeMembers = new Set(memberships.map((membership) => membership.user_id));
    const communityProfiles = activeMembers.size
      ? profiles.filter((profile) => activeMembers.has(profile.user_id))
      : profiles;

    const calculated = communityProfiles
      .map((profile) => ({
        id: profile.user_id,
        username: profile.username,
        name: leaderboardDisplayName(profile),
        subtitle: leaderboardSubtitle(profile.username),
        avatar: leaderboardAvatar(profile),
        points: pointsByUser.get(profile.user_id) || 0,
      }))
      .sort((a, b) => b.points - a.points || a.name.localeCompare(b.name, "pt-BR"));

    const viewerProfile =
      communityProfiles.find((profile) => profile.username === resolvedViewerUsername) ||
      profiles.find((profile) => profile.username === resolvedViewerUsername) ||
      communityProfiles[0] ||
      profiles[0];

    const viewerPoints = viewerProfile ? pointsByUser.get(viewerProfile.user_id) || 0 : 0;
    const viewerLevel = calculateLeaderboardLevel(viewerPoints);
    const fallbackName = viewerProfile ? leaderboardDisplayName(viewerProfile) : "Vitor Santos Araujo";
    const currentUser: LeaderboardUserSummary = {
      id: viewerProfile?.user_id || resolvedViewerUsername,
      username: viewerProfile?.username || resolvedViewerUsername,
      name: fallbackName,
      avatar: viewerProfile ? leaderboardAvatar(viewerProfile) : initials(fallbackName),
      points: viewerPoints,
      subtitle: undefined,
      level: viewerLevel.level,
      nextLevel: viewerLevel.nextLevel,
      pointsToNextLevel: viewerLevel.pointsToNextLevel,
    };

    return { entries: calculated, currentUser };
  } catch (error) {
    console.error("Failed to load leaderboard", error);
    return fallbackLeaderboardData(period);
  }
}

export async function loadViewerProfileSummary(username?: string): Promise<ViewerProfileSummary> {
  if (!isSupabaseConfigured()) return fallbackViewerProfileSummary();

  try {
    const viewerUsername = username || await getCurrentUsername();
    const users = await supabaseRest<DbViewerUser[]>(
      `community_members_public?username=eq.${encodeURIComponent(viewerUsername)}&select=id,username,display_name,avatar_url,last_seen_at,joined_at,level`,
    );
    const user = users[0];
    if (!user) return fallbackViewerProfileSummary();

    const [posts, comments, spaces, leaderboard] = await Promise.all([
      supabaseRest<Array<{ id: string }>>(`posts?user_id=eq.${encodeURIComponent(user.id)}&select=id`),
      supabaseRest<Array<{ id: string }>>(`comments?user_id=eq.${encodeURIComponent(user.id)}&select=id`),
      supabaseRest<Array<{ id: string }>>("spaces?select=id"),
      loadLeaderboardData("all_time", viewerUsername),
    ]);

    const displayName = user.display_name || user.username;
    const currentUser = leaderboard.currentUser;

    return {
      id: user.id,
      username: user.username,
      name: displayName,
      avatar: user.avatar_url || initials(displayName),
      lastSeen: user.username === "vitor-araujo" ? "Visto pela última vez há 3 minutos" : formatRelativeLastSeen(user.last_seen_at),
      joinedAt: user.username === "vitor-araujo" ? "26 de abril de 2026" : formatProfileDate(user.joined_at || user.created_at || new Date().toISOString()),
      level: currentUser.level || user.level || 1,
      points: currentUser.points,
      pointsToNextLevel: currentUser.pointsToNextLevel,
      posts: posts.length,
      comments: comments.length,
      spaces: Math.max(26, spaces.length),
      rewards: 0,
      tags: ["p6 Goat"],
    };
  } catch (error) {
    console.error("Failed to load viewer profile", error);
    return fallbackViewerProfileSummary();
  }
}

export async function loadAccountSettings(username?: string): Promise<AccountSettings> {
  if (!isSupabaseConfigured()) return fallbackAccountSettings();

  try {
    const viewerUsername = username || await getCurrentUsername();
    const result = await supabaseRest<DbAccountSettings | DbAccountSettings[]>("rpc/get_account_settings", {
      method: "POST",
      body: JSON.stringify({ p_username: viewerUsername }),
    });

    return mapAccountSettings(Array.isArray(result) ? result[0] : result);
  } catch (error) {
    console.error("Failed to load account settings", error);
    return fallbackAccountSettings();
  }
}

export async function saveAccountSettings(settings: AccountSettings, username?: string): Promise<AccountSettings> {
  if (!isSupabaseConfigured()) return settings;

  const viewerUsername = username || await getCurrentUsername();
  const result = await supabaseRest<DbAccountSettings | DbAccountSettings[]>("rpc/save_account_settings", {
    method: "POST",
    body: JSON.stringify({
      p_username: viewerUsername,
      p_display_name: settings.name,
      p_avatar_url: settings.avatarUrl,
      p_headline: settings.headline,
      p_bio: settings.bio,
      p_links: settings.links,
      p_preferences: {
        timezone: settings.timezone,
        language: settings.language,
        location: settings.location,
        emailUpdates: settings.emailUpdates,
        notifications: settings.notifications,
        privacy: settings.privacy,
      },
    }),
  });

  return mapAccountSettings(Array.isArray(result) ? result[0] : result);
}

export async function uploadProfileAvatar(file: File): Promise<string> {
  const username = await getCurrentUsername();
  const extension = file.name.includes(".") ? file.name.split(".").pop() : "png";
  const safeName = file.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9._-]+/g, "-");
  return supabaseStorageUpload("feed-attachments", `avatars/${username}-${Date.now()}-${safeName || `avatar.${extension}`}`, file);
}

export async function loadNotifications(username?: string): Promise<CommunityNotification[]> {
  if (!isSupabaseConfigured()) {
    return railsJson<DbNotification[]>("/api/v1/notifications").then((rows) => rows.map(mapNotification)).catch(() => []);
  }

  const viewerUsername = username || await getCurrentUsername();
  const rows = await supabaseRest<DbNotification[]>("rpc/get_viewer_notifications", {
    method: "POST",
    body: JSON.stringify({ p_username: viewerUsername }),
  }).catch(() => railsJson<DbNotification[]>("/api/v1/notifications"));

  return rows.map(mapNotification);
}

export async function markAllNotificationsRead(username?: string) {
  if (!isSupabaseConfigured()) {
    const result = await railsJson<{ updated: number }>("/api/v1/notifications/mark_all_read", { method: "PATCH" }).catch(() => ({ updated: 0 }));
    return result.updated;
  }

  const viewerUsername = username || await getCurrentUsername();
  const result = await supabaseRest<number>("rpc/mark_viewer_notifications_read", {
    method: "POST",
    body: JSON.stringify({ p_username: viewerUsername }),
  }).catch(async () => {
    const railsResult = await railsJson<{ updated: number }>("/api/v1/notifications/mark_all_read", { method: "PATCH" });
    return railsResult.updated;
  });

  return Number(result) || 0;
}

export async function archiveNotification(notificationId: string, archived = true, username?: string) {
  if (!isSupabaseConfigured()) {
    if (!archived) return false;
    await railsJson<DbNotification>(`/api/v1/notifications/${encodeURIComponent(notificationId)}/archive`, { method: "PATCH" }).catch(() => null);
    return true;
  }

  const viewerUsername = username || await getCurrentUsername();
  const result = await supabaseRest<boolean>("rpc/set_viewer_notification_archived", {
    method: "POST",
    body: JSON.stringify({
      p_username: viewerUsername,
      p_notification_id: notificationId,
      p_archived: archived,
    }),
  }).catch(async () => {
    if (!archived) return false;
    await railsJson<DbNotification>(`/api/v1/notifications/${encodeURIComponent(notificationId)}/archive`, { method: "PATCH" });
    return true;
  });

  return Boolean(result);
}

export async function uploadFeedAttachment(file: File): Promise<FeedAttachment> {
  const extension = file.name.includes(".") ? file.name.split(".").pop() : "bin";
  const safeName = file.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9._-]+/g, "-");
  const path = `posts/${Date.now()}-${Math.random().toString(36).slice(2)}-${safeName || `arquivo.${extension}`}`;
  const fileUrl = await supabaseStorageUpload("feed-attachments", path, file);

  return {
    kind: file.type.startsWith("image/") ? "image" : file.type.startsWith("video/") ? "video" : "file",
    fileName: file.name,
    fileUrl,
    mimeType: file.type,
    sizeBytes: file.size,
  };
}

function mapChatMessage(row: DbChatMessage, previous?: DbChatMessage): ChatMessage {
  const currentDate = dateKey(row.created_at);
  const previousDate = previous ? dateKey(previous.created_at) : null;

  return {
    id: row.id,
    parentId: row.parent_id,
    author: row.author_name || row.author_username,
    authorUsername: row.author_username,
    time: formatTime(row.created_at),
    createdAt: row.created_at,
    avatar: row.author_avatar_url || initials(row.author_name || row.author_username),
    text: row.body,
    highlighted: false,
    divider: previousDate && previousDate !== currentDate ? formatDivider(row.created_at) : undefined,
    newDivider: false,
  };
}

function mapMember(row: DbMember): DetailMember {
  return {
    id: row.id,
    name: row.display_name || row.username,
    avatar: row.avatar_url || initials(row.display_name || row.username),
    status: row.status === "online" ? "yellow" : undefined,
    admin: row.role === "admin" || row.role === "owner",
  };
}

const directoryMeta: Record<string, Partial<Pick<DirectoryMember, "avatar" | "location" | "bio" | "tags" | "points" | "posts" | "comments" | "spaces" | "level" | "joinedAt" | "lastSeen">>> = {
  night: { avatar: "/p6-members-assets/Cindy.jpeg", location: "Sapopemba", level: 7, joinedAt: "2025-12-03T12:00:00Z", lastSeen: "Visto pela última vez há 2 dias", tags: ["p6 Veterano", "p6 Goat", "Hackudo"], points: 345, posts: 41, comments: 17, spaces: 26 },
  psy: { avatar: "/p6-members-assets/%E2%8A%B9.jpeg", location: "Rio de Janeiro", level: 1, tags: ["p6 Goat"], points: 0, posts: 0, comments: 0, spaces: 25 },
  walker15k: { avatar: "/p6-members-assets/photo_2025-08-25_21-30-00.jpg", location: "Massachusetts", level: 1, bio: "15k", tags: ["p6 Goat", "p6 Veterano"], points: 0, posts: 0, comments: 0, spaces: 25 },
  toppan15k: { location: "Tóquio", points: 0 },
  anya: { location: "Sapopemba", points: 0 },
  kali15k: { avatar: "/p6-members-assets/photo_2025-12-05_16-06-52.jpg", location: "Tavek, Lunir & Sovax.", tags: ["Admin"], points: 0 },
  goat: { location: "Brasil", tags: ["Admin", "Hackudo"], points: 180 },
  "o_cuervo": { location: "Brasil", tags: ["p6 Veterano", "Hackudo"], points: 280 },
  "refzinho-like": { location: "Rio de Janeiro", points: 0 },
  "sorenus-like": { location: "Brasil", points: 0 },
  suaves: { avatar: "/p6-members-assets/alain_20delon.jpg", location: "", points: 0 },
};

const preferredDirectoryOrder = [
  "night",
  "psy",
  "walker15k",
  "toppan15k",
  "suaves",
  "anya",
  "kali15k",
  "goat",
  "shelby15k",
  "vamp.darcy",
  "refzinho-like",
  "sorenus-like",
  "o_cuervo",
];

function mapDirectoryMember(row: DbMember, profile?: DbDirectoryProfile, postCount?: number, commentCount?: number): DirectoryMember {
  const meta = directoryMeta[row.username] || {};
  const name = row.display_name || row.username;
  const level = meta.level || row.level || 1;
  const preferences = isRecord(profile?.preferences) ? profile.preferences : {};
  const savedLocation = stringValue(preferences.location);
  const headline = stringValue(profile?.headline);
  const bio = stringValue(profile?.bio);

  return {
    id: row.id,
    username: row.username,
    name: row.username === "goat" ? "Goat" : name,
    avatar: meta.avatar || row.avatar_url || initials(name),
    headline,
    location: meta.location ?? savedLocation,
    status: row.status,
    role: row.role,
    level,
    joinedAt: meta.joinedAt || row.joined_at || new Date().toISOString(),
    lastSeen: meta.lastSeen || (row.status === "online" ? "Agora" : "Visto pela última vez há 2 dias"),
    bio: meta.bio || bio,
    tags: meta.tags || (row.role === "admin" || row.role === "owner" ? ["p6 Goat", "Hackudo"] : ["p6 Goat"]),
    points: meta.points ?? level * 20,
    posts: meta.posts ?? postCount ?? 0,
    comments: meta.comments ?? commentCount ?? 0,
    spaces: meta.spaces ?? 25,
  };
}

function countByUser(rows: DbOwnerCount[]) {
  const counts = new Map<string, number>();
  for (const row of rows) {
    counts.set(row.user_id, (counts.get(row.user_id) || 0) + 1);
  }
  return counts;
}

const showcaseDirectoryMembers: DirectoryMember[] = [
  {
    id: "psy",
    username: "psy",
    name: "Psy",
    avatar: "/Feed%20Geral%20_%20Project%20Six_files/IMG_0535.jpeg",
    headline: "",
    location: "Rio de Janeiro",
    status: "offline",
    role: "member",
    level: 1,
    joinedAt: "2025-12-11T12:00:00Z",
    lastSeen: "Visto pela última vez há 2 dias",
    bio: "",
    tags: ["p6 Goat"],
    points: 0,
    posts: 0,
    comments: 0,
    spaces: 25,
  },
  {
    id: "shelby15k",
    username: "shelby15k",
    name: "shelby15k",
    avatar: "/source-six-assets/11fa80eb52474318b5d51c73ada152f6-58f23fff20cd.jpg",
    headline: "",
    location: "",
    status: "offline",
    role: "member",
    level: 1,
    joinedAt: "2025-12-18T12:00:00Z",
    lastSeen: "Visto pela última vez há 2 dias",
    bio: "",
    tags: ["p6 Goat"],
    points: 0,
    posts: 0,
    comments: 0,
    spaces: 25,
  },
];

function prepareDirectoryMembers(rows: DirectoryMember[], sort: "oldest" | "recent" | "alphabetical") {
  const byUsername = new Map(rows.map((member) => [member.username, member]));

  for (const member of showcaseDirectoryMembers) {
    if (!byUsername.has(member.username)) byUsername.set(member.username, member);
  }

  return sortDirectoryMembers(Array.from(byUsername.values()), sort);
}

function sortDirectoryMembers(members: DirectoryMember[], sort: "oldest" | "recent" | "alphabetical") {
  const sorted = [...members];

  if (sort === "alphabetical") {
    return sorted.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  }

  if (sort === "recent") {
    return sorted.sort((a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime());
  }

  return sorted.sort((a, b) => {
    const aIndex = preferredDirectoryOrder.indexOf(a.username);
    const bIndex = preferredDirectoryOrder.indexOf(b.username);

    if (aIndex !== -1 || bIndex !== -1) {
      return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
    }

    return new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime();
  });
}

function fallbackDirectoryMembers(): DirectoryMember[] {
  return [
    { id: "night", username: "night", name: "Night", avatar: "/source-six-assets/7ad7792ee375693f271bc25ea391972a-9f4cecd9df81.jpg", headline: "", location: "Sapopemba", status: "offline", role: "admin", level: 7, joinedAt: "2025-12-03T12:00:00Z", lastSeen: "Visto pela última vez há 2 dias", bio: "", tags: ["p6 Veterano", "p6 Goat", "Hackudo"], points: 345, posts: 41, comments: 17, spaces: 26 },
    { id: "psy", username: "psy", name: "Psy", avatar: "/Feed%20Geral%20_%20Project%20Six_files/IMG_0535.jpeg", headline: "", location: "Rio de Janeiro", status: "offline", role: "member", level: 1, joinedAt: "2025-12-11T12:00:00Z", lastSeen: "Visto pela última vez há 2 dias", bio: "", tags: ["p6 Goat"], points: 0, posts: 0, comments: 0, spaces: 25 },
    { id: "walker15k", username: "walker15k", name: "Walker15k", avatar: "/source-six-assets/IMG_2459.jpeg-20e76166eb1c.jpg", headline: "", location: "Massachusetts", status: "offline", role: "member", level: 1, joinedAt: "2025-12-12T12:00:00Z", lastSeen: "Visto pela última vez há 2 dias", bio: "15k", tags: ["p6 Goat", "p6 Veterano"], points: 0, posts: 0, comments: 0, spaces: 25 },
  ];
}

function mapCourseSpace(space: DbSpace): CourseOverviewCard {
  const section = stringValue(space.settings?.section) || (space.kind === "link" ? "Método P6 | 2026" : "Aulas");
  const progress = courseProgress(space.slug);

  return {
    id: space.id,
    title: space.name,
    slug: space.slug,
    section,
    progress,
    completed: progress === 100,
    private: true,
    imageUrl: courseImage(space.slug),
    iconUrl: courseIcon(space.slug),
    lessonsCount: 0,
  };
}

function fallbackCourseOverview(): CourseOverviewCard[] {
  return [
    "aula-de-opsec",
    "influencer-ia-tiktok-dark",
    "basico",
    "fba",
    "aulas-info",
    "aulas-completas",
    "fulfillment-by-merchant",
  ].map((slug, index) => ({
    id: `course-${slug}`,
    title: courseTitle(slug),
    slug,
    section: courseSection(slug),
    progress: slug === "fba" ? 100 : slug === "aula-de-opsec" || slug === "aulas-completas" ? null : 0,
    completed: slug === "fba",
    private: true,
    imageUrl: courseImage(slug),
    iconUrl: courseIcon(slug),
    lessonsCount: index === 0 ? 1 : 0,
  }));
}

function sortCourseOverview(cards: CourseOverviewCard[]) {
  const order = [
    "aula-de-opsec",
    "influencer-ia-tiktok-dark",
    "basico",
    "fba",
    "aulas-info",
    "aulas-completas",
    "fulfillment-by-merchant",
    "agenda-de-aulas",
    "aulas-gravadas",
    "central-de-ajuda-fbm",
    "metodo-p6-2026",
  ];

  return [...cards].sort((a, b) => {
    const aIndex = order.indexOf(a.slug);
    const bIndex = order.indexOf(b.slug);
    return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex) || a.title.localeCompare(b.title, "pt-BR");
  });
}

function courseTitle(slug: string) {
  const titles: Record<string, string> = {
    "aula-de-opsec": "Aula de OPSEC",
    "influencer-ia-tiktok-dark": "Influencer IA & TikTok Dark",
    basico: "Básico",
    fba: "FBA",
    "aulas-info": "Aulas",
    "aulas-completas": "Aulas Completas",
    "fulfillment-by-merchant": "Fulfillment by Merchant",
    "agenda-de-aulas": "Agenda de aulas",
    "aulas-gravadas": "Aulas Gravadas",
    "central-de-ajuda-fbm": "Central de Ajuda 'FBM'",
    "metodo-p6-2026": "Método P6 | 2026",
  };

  return titles[slug] || slug.split("-").map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`).join(" ");
}

function courseSection(slug: string) {
  if (["aula-de-opsec"].includes(slug)) return "Área Hacking";
  if (["influencer-ia-tiktok-dark"].includes(slug)) return "Diverso";
  if (["basico", "aulas-completas"].includes(slug)) return "Expert Hot";
  if (["aulas-info"].includes(slug)) return "Info Produto";
  return "Método P6 | 2026";
}

function courseProgress(slug: string) {
  if (slug === "fba") return 100;
  if (slug === "aula-de-opsec" || slug === "aulas-completas") return null;
  return 0;
}

function courseImage(slug: string) {
  const images: Record<string, string> = {
    "aula-de-opsec": "",
    "influencer-ia-tiktok-dark": "/source-six-assets/ChatGPT20Image202420de20jan.20de2020262021_20_42-ffda654e5b95.png",
    basico: "/source-six-assets/imagem_2025-12-23_205133551-d8562cf0617d.png",
    fba: "",
    "aulas-info": "/source-six-assets/image-0d09bfbb635d.png",
    "aulas-completas": "/source-six-assets/Engenharia20Social_page-0001-9db4a91f1c5b.jpg",
    "fulfillment-by-merchant": "/source-six-assets/image-107ba8a7b039.png",
    "agenda-de-aulas": "",
    "aulas-gravadas": "",
  };

  return Object.prototype.hasOwnProperty.call(images, slug) ? images[slug] : "/source-six-assets/imagem_2025-12-23_205133551-d8562cf0617d.png";
}

function courseIcon(slug: string) {
  const icons: Record<string, string> = {
    "aula-de-opsec": "/source-six-assets/hjskcyevn0m4onfjkc0ybxt3tr1w-579710e4bba9.png",
    "influencer-ia-tiktok-dark": "/source-six-assets/t1l74hojbmqzn2bz0lf4qfo61vqz-fe900685ddcf.png",
    basico: "/source-six-assets/awaxoue0o2mtkhmm0ck56a1sr18h-500e2eba57dc.png",
    fba: "/source-six-assets/ljt8d56p7ibeexgh0bj5ddmlen0a-9a3e46db5669.png",
    "aulas-info": "/source-six-assets/4xtp50z2f2kdtlw8e0g34w1jqvht-02bd1f4360d4.png",
    "aulas-completas": "/source-six-assets/qfeoralvy2guhfrsgaufm020fta0-123aff879e1d.png",
    "fulfillment-by-merchant": "/source-six-assets/vgl6iyzpzt0b3kohtuntebcbhiox-f7d84f25043f.png",
  };

  return icons[slug] || icons["aula-de-opsec"];
}

function viewForSpace(slug: string, kind?: DbSpace["kind"]): CommunitySearchResult["targetView"] {
  if (slug === "chat-geral" || kind === "chat") return "chat";
  if (slug === "membros" || kind === "members") return "members";
  if (slug === "seu-progresso" || kind === "progress") return "progress";
  if (slug === "politica-nacional") return "politica";
  if (kind === "course" || kind === "link" || slug.includes("aula")) return "courses";
  return "feed";
}

function pathForSpace(slug: string, kind?: DbSpace["kind"]) {
  if (slug === "membros" || kind === "members") return "/members";
  if (kind === "course" || kind === "link") return "/courses";
  if (slug === "evento-aula") return "/events";
  return `/c/${slug}`;
}

function spaceLabel(slug: string) {
  const labels: Record<string, string> = {
    "feed-geral": "Feed Geral",
    "chat-geral": "Chat Geral",
    "seu-progresso": "Seu Progresso",
    "politica-nacional": "Política Nacional",
  };

  return labels[slug] || courseTitle(slug);
}

function mapPost(row: DbPost): Post {
  return {
    id: row.id,
    title: row.title,
    author: {
      name: row.author_name,
      avatar: row.author_avatar_url || initials(row.author_name),
      badge: row.author_role === "admin" || row.author_role === "owner" ? "Admin" : "Hackudo",
      level: row.author_level ? `Nivel ${row.author_level}` : "Nivel 2",
      joinedAt: row.author_joined_at ? `Membro desde ${formatLongDate(row.author_joined_at)}` : "Membro desde 2 de fevereiro de 2026",
    },
    excerpt: excerpt(row.body),
    date: formatShortDate(row.published_at || row.created_at),
    comments: row.comments_count,
    likes: row.reactions_count,
  };
}

function mapFeedPost(row: DbPost): FeedPost {
  const metadata = row.metadata || {};
  const postKind = typeof metadata.postKind === "string" ? metadata.postKind : undefined;
  const topics = Array.isArray(metadata.topics) ? metadata.topics.filter((topic): topic is string => typeof topic === "string") : [];

  return {
    id: row.id,
    title: row.title,
    body: row.body,
    spaceSlug: row.space_slug,
    kind: (postKind as FeedPost["kind"]) || (row.attachments?.length ? "image" : "article"),
    topics,
    publishedAt: row.published_at || row.created_at,
    editedAt: row.edited_at,
    comments: row.comments_count,
    likes: row.reactions_count,
    views: row.views_count || 0,
    pinned: Boolean(row.pinned),
    liked: Boolean(row.liked_by_viewer),
    saved: Boolean(row.saved_by_viewer),
    attachments: row.attachments || [],
    author: {
      username: row.author_username || row.author_name,
      name: row.author_name,
      avatar: row.author_avatar_url || initials(row.author_name),
      badge: row.author_role === "admin" || row.author_role === "owner" ? "Admin" : row.author_username === "maycon-pogan" ? "p6 Goat" : "Hackudo",
      level: row.author_level ? `Nivel ${row.author_level}` : "Nivel 2",
      joinedAt: row.author_joined_at ? `Membro desde ${formatLongDate(row.author_joined_at)}` : "Membro desde 2 de fevereiro de 2026",
    },
  };
}

function mapFeedComment(row: DbFeedComment): FeedComment {
  return {
    id: row.id,
    postId: row.post_id,
    body: row.body,
    reactions: row.reactions_count,
    createdAt: row.created_at,
    author: {
      username: row.author_username,
      name: row.author_name,
      avatar: row.author_avatar_url || initials(row.author_name),
      role: row.author_role,
      level: row.author_level,
    },
  };
}

async function railsJson<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(path, {
    ...options,
    headers,
    credentials: "same-origin",
  });

  if (!response.ok) {
    throw new Error(`Rails API request failed (${response.status})`);
  }

  return response.json() as Promise<T>;
}

async function createRailsMessage(body: string, spaceSlug: string, parentId?: string) {
  const row = await railsJson<RailsMessage>("/api/v1/messages", {
    method: "POST",
    body: JSON.stringify({ message: { space_slug: spaceSlug, body, parent_id: parentId } }),
  });

  return mapRailsMessage(row);
}

async function loadRailsCourseOverview() {
  const courses = await railsJson<DbCourse[]>("/api/v1/courses").catch(() => []);
  if (!courses.length) return fallbackCourseOverview();

  return sortCourseOverview(courses.map((course) => ({
    id: course.id,
    title: course.title,
    slug: course.slug,
    section: courseSection(course.slug),
    progress: courseProgress(course.slug),
    completed: courseProgress(course.slug) === 100,
    private: !course.published,
    imageUrl: courseImage(course.slug),
    iconUrl: courseIcon(course.slug),
    lessonsCount: 0,
  })));
}

function mapRailsMessage(row: RailsMessage, previous?: RailsMessage): ChatMessage {
  const authorName = row.user?.display_name || row.user?.username || "Membro";
  const currentDate = dateKey(row.created_at);
  const previousDate = previous ? dateKey(previous.created_at) : null;

  return {
    id: row.id,
    parentId: row.parent_id,
    author: authorName,
    authorUsername: row.user?.username || authorName,
    time: formatTime(row.created_at),
    createdAt: row.created_at,
    avatar: row.user?.avatar_url || initials(authorName),
    text: row.body,
    highlighted: false,
    divider: previousDate && previousDate !== currentDate ? formatDivider(row.created_at) : undefined,
    newDivider: false,
  };
}

function mapRailsDirectConversation(row: RailsDirectConversation): DirectConversation {
  return {
    id: row.id,
    memberId: row.memberId,
    memberUsername: row.memberUsername,
    memberName: row.memberName || row.memberUsername,
    memberAvatar: row.memberAvatar || initials(row.memberName || row.memberUsername),
    memberRole: row.memberRole || "member",
    memberStatus: row.memberStatus || "offline",
    lastMessage: row.lastMessage,
    lastMessageAt: row.lastMessageAt,
    unread: row.unread,
    unreadCount: row.unreadCount || 0,
  };
}

function mapRailsDirectMessage(row: RailsDirectMessage): DirectMessage {
  return {
    id: row.id,
    conversationId: row.conversationId,
    memberUsername: row.memberUsername,
    author: row.author,
    body: row.body,
    time: row.time || formatTime(row.createdAt),
    createdAt: row.createdAt,
    dateLabel: row.dateLabel,
    variant: row.variant,
  };
}

function mapRailsPost(row: RailsPost, fallbackSpaceSlug: string): FeedPost {
  const authorName = row.user?.display_name || row.user?.username || "Membro";
  const spaceSlug = row.space?.slug || fallbackSpaceSlug;
  const publishedAt = row.published_at || new Date().toISOString();
  const metadata = row.metadata || {};
  const postKind = typeof metadata.postKind === "string" ? metadata.postKind : undefined;
  const topics = Array.isArray(metadata.topics) ? metadata.topics.filter((topic): topic is string => typeof topic === "string") : [];
  const attachments = row.attachments || [];

  return {
    id: row.id,
    title: row.title,
    body: row.body,
    spaceSlug,
    kind: (postKind as FeedPost["kind"]) || (attachments.length ? attachmentKind(attachments) : "article"),
    topics,
    publishedAt,
    editedAt: row.edited_at,
    comments: row.comments_count || 0,
    likes: row.reactions_count || 0,
    views: row.views_count || 0,
    pinned: Boolean(row.pinned),
    liked: Boolean(row.liked_by_viewer),
    saved: Boolean(row.saved_by_viewer),
    attachments,
    author: {
      username: row.user?.username || authorName,
      name: authorName,
      avatar: row.user?.avatar_url || initials(authorName),
      badge: row.user?.role === "admin" || row.user?.role === "owner" ? "Admin" : "Hackudo",
      level: "Nível 2",
      joinedAt: "Membro Project Six",
    },
  };
}

function mapSourceSixCapturedPost(seed: SourceSixCapturedPostSeed): FeedPost {
  const attachments = seed.attachments || [];
  return {
    id: sourceSixCapturedPostId(seed),
    title: seed.title,
    body: seed.body,
    spaceSlug: seed.spaceSlug,
    kind: seed.kind || (attachments.length ? attachmentKind(attachments) : "article"),
    topics: seed.topics || [],
    publishedAt: seed.publishedAt || "2026-04-20T12:00:00-03:00",
    comments: seed.comments || 0,
    likes: seed.likes || 0,
    views: 0,
    pinned: Boolean(seed.pinned),
    liked: false,
    saved: false,
    attachments,
    author: seed.author || {
      username: "membro",
      name: "Membro",
      avatar: "M",
      badge: "Hackudo",
      level: "Nível 2",
      joinedAt: "Membro desde 2026",
    },
  };
}

function attachmentKind(attachments: FeedAttachment[]): FeedPost["kind"] {
  if (attachments.some((attachment) => attachment.kind === "video")) return "video";
  if (attachments.some((attachment) => attachment.kind === "file")) return "file";
  return "image";
}

function mapRailsComment(row: RailsComment, postId: string): FeedComment {
  const authorName = row.user?.display_name || row.user?.username || "Membro";

  return {
    id: row.id,
    postId,
    body: row.body,
    reactions: row.reactions_count || 0,
    createdAt: row.created_at,
    author: {
      username: row.user?.username || authorName,
      name: authorName,
      avatar: row.user?.avatar_url || initials(authorName),
      role: row.user?.role,
      level: null,
    },
  };
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function mapNotification(row: DbNotification): CommunityNotification {
  const metadata = row.metadata || {};
  return {
    id: row.id,
    kind: row.kind,
    title: row.title,
    body: row.body || "",
    recordType: row.record_type,
    recordId: row.record_id,
    readAt: row.read_at,
    createdAt: row.created_at,
    archived: metadata.archived === true || metadata.archived === "true",
  };
}

function leaderboardPeriodFilter(period: LeaderboardPeriod) {
  if (period === "all_time") return "";

  const days = period === "30_days" ? 30 : 7;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  return `&created_at=gte.${encodeURIComponent(since)}`;
}

function leaderboardDisplayName(profile: DbMember | DbPublicProfile) {
  if (profile.username === "goat") return "Goat";
  return profile.display_name || profile.username;
}

function leaderboardAvatar(profile: DbMember | DbPublicProfile) {
  const reference = leaderboardReferenceProfiles.find((entry) => entry.username === profile.username);
  return reference?.avatar || profile.avatar_url || initials(profile.display_name || profile.username);
}

function leaderboardSubtitle(username: string) {
  return leaderboardReferenceProfiles.find((entry) => entry.username === username)?.subtitle;
}

const leaderboardReferenceProfiles: LeaderboardEntry[] = [
  { id: "leader-o-cuervo", username: "o_cuervo", name: "o_cuervo", subtitle: "IT", avatar: "/Feed%20Geral%20_%20Project%20Six_files/d0f92b7a6b87e4692dfd1c8e88c5df4e.jpg", points: 7 },
  { id: "leader-tetey15k", username: "tetey15k", name: "tetey15k", avatar: "/Seu%20Progresso%20_%20Project%20Six_files/Captura%20de%20tela%202025-10-31%20202909.png", points: 7 },
  { id: "leader-kali15k", username: "kali15k", name: "Kali15k", subtitle: "Tavek, Lunir & Sovax.", avatar: "/p6-members-assets/photo_2025-12-05_16-06-52.jpg", points: 6 },
  { id: "leader-goat", username: "goat", name: "Goat", avatar: "p6", points: 6 },
  { id: "leader-night", username: "night", name: "Night", avatar: "/p6-members-assets/Cindy.jpeg", points: 2 },
  { id: "leader-lhz", username: "lhz", name: "𝑙ℎ𝑧", avatar: "L", points: 2 },
  { id: "leader-sorenus", username: "sorenus", name: "Sorenus", subtitle: "Inteligência e Força", avatar: "S", points: 2 },
  { id: "leader-vamp", username: "vamp.darcy", name: "vamp.darcy", avatar: "/Seu%20Progresso%20_%20Project%20Six_files/download%20(3).jpg", points: 1 },
  { id: "leader-zero", username: "zero", name: "zero", avatar: "/Seu%20Progresso%20_%20Project%20Six_files/cb9e8ea52c4bd777e771df8a3664c405.jpg", points: 1 },
  { id: "leader-drk", username: "drk_333", name: "drk_333", avatar: "/Seu%20Progresso%20_%20Project%20Six_files/download%20(2).jfif", points: 1 },
];

const leaderboardLevelThresholds = [
  { level: 1, points: 0 },
  { level: 2, points: 10 },
  { level: 3, points: 20 },
  { level: 4, points: 40 },
  { level: 5, points: 80 },
  { level: 6, points: 160 },
  { level: 7, points: 320 },
  { level: 8, points: 640 },
  { level: 9, points: 1280 },
];

function calculateLeaderboardLevel(points: number) {
  const current = [...leaderboardLevelThresholds].reverse().find((item) => points >= item.points) || leaderboardLevelThresholds[0];
  const next = leaderboardLevelThresholds.find((item) => item.points > points) || null;

  return {
    level: current.level,
    nextLevel: next?.level || null,
    pointsToNextLevel: next ? next.points - points : 0,
  };
}

function fallbackLeaderboard(period: LeaderboardPeriod): LeaderboardEntry[] {
  const multiplier = period === "all_time" ? 18 : period === "30_days" ? 4 : 1;
  return leaderboardReferenceProfiles.map((entry) => ({ ...entry, points: entry.points * multiplier }));
}

function fallbackLeaderboardData(period: LeaderboardPeriod): LeaderboardData {
  const entries = fallbackLeaderboard(period);
  const current = calculateLeaderboardLevel(0);

  return {
    entries,
    currentUser: {
      id: "vitor-araujo",
      username: "vitor-araujo",
      name: "Vitor Santos Araujo",
      avatar: "VA",
      points: 0,
      level: current.level,
      nextLevel: current.nextLevel,
      pointsToNextLevel: current.pointsToNextLevel,
    },
  };
}

function fallbackViewerProfileSummary(): ViewerProfileSummary {
  return {
    id: "vitor-araujo",
    username: "vitor-araujo",
    name: "Vítor Santos Araujo",
    avatar: "VA",
    lastSeen: "Visto pela última vez há 3 minutos",
    joinedAt: "26 de abril de 2026",
    level: 1,
    points: 0,
    pointsToNextLevel: 10,
    posts: 0,
    comments: 0,
    spaces: 26,
    rewards: 0,
    tags: ["p6 Goat"],
  };
}

const defaultAccountNotifications: AccountSettings["notifications"] = {
  post_comments: { email: true, platform: true },
  comment_replies: { email: true, platform: true },
  mentions: { email: true, platform: true },
  dms: { email: true, platform: false },
  weekly_digest: { email: true, platform: false },
  post_likes: { email: false, platform: true },
  comment_likes: { email: false, platform: true },
  live_rooms: { email: false, platform: true },
  course_content: { email: true, platform: true },
  polls: { email: false, platform: true },
};

function fallbackAccountSettings(): AccountSettings {
  return {
    id: "vitor-araujo",
    username: "vitor-araujo",
    name: "Vítor Santos Araujo",
    avatarUrl: null,
    timezone: "(GMT -03:00) Brasilia",
    language: "Português (Brasil)",
    headline: "",
    bio: "",
    location: "",
    links: {
      website: "",
      twitter: "",
      facebook: "",
      instagram: "",
      linkedin: "",
    },
    emailUpdates: true,
    notifications: defaultAccountNotifications,
    privacy: {
      showInDirectory: true,
      preventMessages: false,
    },
  };
}

function mapAccountSettings(row?: DbAccountSettings): AccountSettings {
  const fallback = fallbackAccountSettings();
  if (!row || !row.id) return fallback;

  const preferences = isRecord(row.preferences) ? row.preferences : {};
  const links = isRecord(row.links) ? row.links : {};
  const savedNotifications = isRecord(preferences.notifications) ? preferences.notifications : {};
  const privacy = isRecord(preferences.privacy) ? preferences.privacy : {};

  return {
    ...fallback,
    id: String(row.id),
    username: typeof row.username === "string" ? row.username : fallback.username,
    name: typeof row.name === "string" && row.name ? row.name : fallback.name,
    avatarUrl: typeof row.avatarUrl === "string" && row.avatarUrl ? row.avatarUrl : null,
    timezone: typeof preferences.timezone === "string" ? preferences.timezone : fallback.timezone,
    language: typeof preferences.language === "string" ? preferences.language : fallback.language,
    headline: typeof row.headline === "string" ? row.headline : "",
    bio: typeof row.bio === "string" ? row.bio : "",
    location: typeof preferences.location === "string" ? preferences.location : "",
    links: {
      website: stringValue(links.website),
      twitter: stringValue(links.twitter),
      facebook: stringValue(links.facebook),
      instagram: stringValue(links.instagram),
      linkedin: stringValue(links.linkedin),
    },
    emailUpdates: typeof preferences.emailUpdates === "boolean" ? preferences.emailUpdates : fallback.emailUpdates,
    notifications: mergeAccountNotifications(savedNotifications),
    privacy: {
      showInDirectory: typeof privacy.showInDirectory === "boolean" ? privacy.showInDirectory : fallback.privacy.showInDirectory,
      preventMessages: typeof privacy.preventMessages === "boolean" ? privacy.preventMessages : fallback.privacy.preventMessages,
    },
  };
}

function mergeAccountNotifications(value: Record<string, unknown>): AccountSettings["notifications"] {
  return Object.fromEntries(
    Object.entries(defaultAccountNotifications).map(([key, fallback]) => {
      const saved = isRecord(value[key]) ? value[key] : {};
      return [
        key,
        {
          email: typeof saved.email === "boolean" ? saved.email : fallback.email,
          platform: typeof saved.platform === "boolean" ? saved.platform : fallback.platform,
        },
      ];
    }),
  ) as AccountSettings["notifications"];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value : "";
}

function formatProfileDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(value));
}

function formatRelativeLastSeen(value?: string | null) {
  if (!value) return "Visto pela última vez há 3 minutos";

  const diffMinutes = Math.max(1, Math.round((Date.now() - new Date(value).getTime()) / 60000));
  if (diffMinutes < 60) return `Visto pela última vez há ${diffMinutes} minuto${diffMinutes === 1 ? "" : "s"}`;

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `Visto pela última vez há ${diffHours} hora${diffHours === 1 ? "" : "s"}`;

  const diffDays = Math.round(diffHours / 24);
  return `Visto pela última vez há ${diffDays} dia${diffDays === 1 ? "" : "s"}`;
}


function excerpt(body: string) {
  const paragraphs = body.split("\n").filter(Boolean);
  if (paragraphs.length > 1) return paragraphs.slice(0, 2);
  return [body.length > 210 ? `${body.slice(0, 207)}...` : body];
}

function initials(name: string) {
  const parts = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase() || "VA";
  return parts.map((part) => part[0]?.toUpperCase()).join("") || "VA";
}

function dateKey(value: string) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date(value));
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(value));
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "short",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(value)).replace(" de ", " ");
}

function formatLongDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(value));
}

function formatDivider(value: string) {
  const date = dateKey(value);
  const today = dateKey(new Date().toISOString());
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = dateKey(yesterdayDate.toISOString());

  if (date === today) return "HOJE";
  if (date === yesterday) return "ONTEM";

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(value)).replace(".", ".").toUpperCase();
}
