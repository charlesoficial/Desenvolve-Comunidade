# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.2].define(version: 2026_05_22_180000) do
  create_schema "auth"
  create_schema "extensions"
  create_schema "graphql"
  create_schema "graphql_public"
  create_schema "pgbouncer"
  create_schema "realtime"
  create_schema "storage"
  create_schema "supabase_migrations"
  create_schema "vault"

  # These are extensions that must be enabled in order to support this database
  enable_extension "citext"
  enable_extension "pg_stat_statements"
  enable_extension "pgcrypto"
  enable_extension "plpgsql"
  enable_extension "supabase_vault"
  enable_extension "uuid-ossp"

  create_table "comments", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "post_id", null: false
    t.uuid "user_id", null: false
    t.uuid "parent_id"
    t.text "body", null: false
    t.integer "reactions_count", default: 0, null: false
    t.timestamptz "created_at", default: -> { "now()" }, null: false
    t.timestamptz "updated_at", default: -> { "now()" }, null: false
    t.timestamptz "edited_at"
    t.index ["parent_id"], name: "index_comments_parent_id"
    t.index ["post_id", "created_at"], name: "comments_post_id_created_at_idx"
    t.index ["post_id", "created_at"], name: "index_comments_post_created_at"
    t.index ["user_id"], name: "index_comments_user_id"
  end

  create_table "communities", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.text "name", null: false
    t.text "slug", null: false
    t.text "logo_url"
    t.text "brand_color", default: "#e11d48", null: false
    t.jsonb "settings", default: {}, null: false
    t.timestamptz "created_at", default: -> { "now()" }, null: false
    t.timestamptz "updated_at", default: -> { "now()" }, null: false

    t.unique_constraint ["slug"], name: "communities_slug_key"
  end

  create_table "courses", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "community_id", null: false
    t.text "title", null: false
    t.text "slug", null: false
    t.text "description"
    t.integer "position", default: 0, null: false
    t.boolean "published", default: false, null: false
    t.timestamptz "created_at", default: -> { "now()" }, null: false
    t.timestamptz "updated_at", default: -> { "now()" }, null: false
    t.index ["community_id", "position"], name: "index_courses_community_position"
    t.unique_constraint ["community_id", "slug"], name: "courses_community_id_slug_key"
  end

  create_table "direct_conversation_participants", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "direct_conversation_id", null: false
    t.uuid "user_id", null: false
    t.timestamptz "last_read_at"
    t.timestamptz "muted_at"
    t.timestamptz "archived_at"
    t.timestamptz "created_at", default: -> { "now()" }, null: false
    t.timestamptz "updated_at", default: -> { "now()" }, null: false
    t.index ["user_id", "archived_at"], name: "index_direct_participants_on_user_archived"
    t.unique_constraint ["direct_conversation_id", "user_id"], name: "direct_conversation_participa_direct_conversation_id_user_i_key"
  end

  create_table "direct_conversations", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "created_by_id", null: false
    t.uuid "last_message_id"
    t.timestamptz "last_message_at"
    t.timestamptz "created_at", default: -> { "now()" }, null: false
    t.timestamptz "updated_at", default: -> { "now()" }, null: false
    t.index ["last_message_at"], name: "index_direct_conversations_on_last_message_at"
  end

  create_table "direct_messages", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "direct_conversation_id", null: false
    t.uuid "sender_id", null: false
    t.text "body", null: false
    t.jsonb "metadata", default: {}, null: false
    t.jsonb "attachments", default: [], null: false
    t.timestamptz "edited_at"
    t.timestamptz "deleted_at"
    t.timestamptz "created_at", default: -> { "now()" }, null: false
    t.timestamptz "updated_at", default: -> { "now()" }, null: false
    t.index ["direct_conversation_id", "created_at"], name: "index_direct_messages_on_conversation_created"
  end

  create_table "lessons", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "course_id", null: false
    t.text "title", null: false
    t.text "slug", null: false
    t.text "body"
    t.text "video_url"
    t.integer "position", default: 0, null: false
    t.boolean "published", default: false, null: false
    t.timestamptz "created_at", default: -> { "now()" }, null: false
    t.timestamptz "updated_at", default: -> { "now()" }, null: false
    t.index ["course_id", "position"], name: "index_lessons_course_position"
    t.unique_constraint ["course_id", "slug"], name: "lessons_course_id_slug_key"
  end

  create_table "member_connections", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "requester_id", null: false
    t.uuid "target_id", null: false
    t.text "status", default: "connected", null: false
    t.timestamptz "created_at", default: -> { "now()" }, null: false
    t.text "message"
    t.timestamptz "accepted_at"
    t.timestamptz "rejected_at"
    t.timestamptz "updated_at", default: -> { "now()" }, null: false
    t.index ["target_id", "status"], name: "index_member_connections_on_target_status"
    t.check_constraint "requester_id <> target_id", name: "member_connections_check"
    t.check_constraint "status = ANY (ARRAY['pending'::text, 'accepted'::text, 'rejected'::text, 'blocked'::text, 'connected'::text])", name: "member_connections_status_check"
    t.unique_constraint ["requester_id", "target_id"], name: "member_connections_requester_id_target_id_key"
  end

  create_table "memberships", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "community_id", null: false
    t.uuid "user_id", null: false
    t.text "role", default: "member", null: false
    t.text "state", default: "active", null: false
    t.integer "level", default: 1, null: false
    t.timestamptz "joined_at", default: -> { "now()" }, null: false
    t.timestamptz "created_at", default: -> { "now()" }, null: false
    t.timestamptz "updated_at", default: -> { "now()" }, null: false
    t.index ["user_id"], name: "index_memberships_user_id"
    t.check_constraint "role = ANY (ARRAY['owner'::text, 'admin'::text, 'moderator'::text, 'member'::text])", name: "memberships_role_check"
    t.check_constraint "state = ANY (ARRAY['active'::text, 'pending'::text, 'blocked'::text])", name: "memberships_state_check"
    t.unique_constraint ["community_id", "user_id"], name: "memberships_community_id_user_id_key"
  end

  create_table "messages", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "space_id", null: false
    t.uuid "user_id", null: false
    t.uuid "parent_id"
    t.text "body", null: false
    t.jsonb "attachments", default: [], null: false
    t.timestamptz "edited_at"
    t.timestamptz "created_at", default: -> { "now()" }, null: false
    t.timestamptz "updated_at", default: -> { "now()" }, null: false
    t.index ["parent_id"], name: "index_messages_parent_id"
    t.index ["space_id", "created_at"], name: "index_messages_space_created_at"
    t.index ["user_id"], name: "index_messages_user_id"
  end

  create_table "notifications", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "user_id", null: false
    t.text "kind", null: false
    t.text "title", null: false
    t.text "body"
    t.text "record_type"
    t.uuid "record_id"
    t.timestamptz "read_at"
    t.jsonb "metadata", default: {}, null: false
    t.timestamptz "created_at", default: -> { "now()" }, null: false
    t.timestamptz "updated_at", default: -> { "now()" }, null: false
    t.index ["user_id", "read_at"], name: "index_notifications_user_read_at"
  end

  create_table "post_attachments", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "post_id", null: false
    t.uuid "user_id", null: false
    t.text "kind", default: "file", null: false
    t.text "file_name", null: false
    t.text "file_url", null: false
    t.text "mime_type"
    t.bigint "size_bytes"
    t.integer "width"
    t.integer "height"
    t.integer "position", default: 0, null: false
    t.timestamptz "created_at", default: -> { "now()" }, null: false
    t.timestamptz "updated_at", default: -> { "now()" }, null: false
    t.index ["post_id", "position"], name: "post_attachments_post_id_idx"
    t.check_constraint "kind = ANY (ARRAY['image'::text, 'video'::text, 'file'::text])", name: "post_attachments_kind_check"
  end

  create_table "post_saves", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "post_id", null: false
    t.uuid "user_id", null: false
    t.timestamptz "created_at", default: -> { "now()" }, null: false
    t.index ["user_id", "post_id"], name: "post_saves_user_post_idx"
    t.unique_constraint ["post_id", "user_id"], name: "post_saves_post_id_user_id_key"
  end

  create_table "post_views", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "post_id", null: false
    t.uuid "user_id"
    t.text "viewer_key"
    t.timestamptz "created_at", default: -> { "now()" }, null: false

    t.unique_constraint ["post_id", "user_id"], name: "post_views_post_id_user_id_key"
    t.unique_constraint ["post_id", "viewer_key"], name: "post_views_post_id_viewer_key_key"
  end

  create_table "posts", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "space_id", null: false
    t.uuid "user_id", null: false
    t.text "title", null: false
    t.text "body", null: false
    t.text "status", default: "published", null: false
    t.timestamptz "published_at"
    t.integer "comments_count", default: 0, null: false
    t.integer "reactions_count", default: 0, null: false
    t.boolean "pinned", default: false, null: false
    t.jsonb "metadata", default: {}, null: false
    t.timestamptz "created_at", default: -> { "now()" }, null: false
    t.timestamptz "updated_at", default: -> { "now()" }, null: false
    t.timestamptz "edited_at"
    t.index ["space_id", "published_at"], name: "index_posts_space_published_at", order: { published_at: :desc }
    t.index ["status"], name: "index_posts_status"
    t.index ["user_id"], name: "index_posts_user_id"
    t.check_constraint "status = ANY (ARRAY['draft'::text, 'published'::text, 'archived'::text])", name: "posts_status_check"
  end

  create_table "profiles", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "user_id", null: false
    t.text "headline"
    t.text "bio"
    t.jsonb "links", default: {}, null: false
    t.jsonb "preferences", default: {}, null: false
    t.timestamptz "created_at", default: -> { "now()" }, null: false
    t.timestamptz "updated_at", default: -> { "now()" }, null: false

    t.unique_constraint ["user_id"], name: "profiles_user_id_key"
  end

  create_table "reactions", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "user_id", null: false
    t.text "reactable_type", null: false
    t.uuid "reactable_id", null: false
    t.text "emoji", default: "like", null: false
    t.timestamptz "created_at", default: -> { "now()" }, null: false
    t.timestamptz "updated_at", default: -> { "now()" }, null: false
    t.index ["reactable_type", "reactable_id"], name: "index_reactions_reactable"
    t.index ["user_id", "reactable_type", "reactable_id", "emoji"], name: "reactions_unique_user_target", unique: true
    t.unique_constraint ["user_id", "reactable_type", "reactable_id", "emoji"], name: "reactions_user_id_reactable_type_reactable_id_emoji_key"
  end

  create_table "spaces", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "community_id", null: false
    t.uuid "parent_id"
    t.text "name", null: false
    t.text "slug", null: false
    t.text "kind", default: "feed", null: false
    t.text "icon"
    t.integer "position", default: 0, null: false
    t.boolean "locked", default: false, null: false
    t.jsonb "settings", default: {}, null: false
    t.timestamptz "created_at", default: -> { "now()" }, null: false
    t.timestamptz "updated_at", default: -> { "now()" }, null: false
    t.index ["community_id", "position"], name: "index_spaces_community_position"
    t.index ["parent_id"], name: "index_spaces_parent_id"
    t.check_constraint "kind = ANY (ARRAY['feed'::text, 'chat'::text, 'members'::text, 'progress'::text, 'course'::text, 'link'::text])", name: "spaces_kind_check"
    t.unique_constraint ["community_id", "slug"], name: "spaces_community_id_slug_key"
  end

  create_table "subscriptions", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "user_id", null: false
    t.uuid "community_id", null: false
    t.text "provider", default: "stripe", null: false
    t.text "provider_customer_id"
    t.text "provider_subscription_id"
    t.text "status", default: "inactive", null: false
    t.timestamptz "current_period_end"
    t.jsonb "metadata", default: {}, null: false
    t.timestamptz "created_at", default: -> { "now()" }, null: false
    t.timestamptz "updated_at", default: -> { "now()" }, null: false
    t.index ["community_id"], name: "index_subscriptions_community_id"
    t.index ["provider_subscription_id"], name: "index_subscriptions_provider_subscription_id"
    t.index ["user_id"], name: "index_subscriptions_user_id"
  end

  create_table "user_public_profiles", primary_key: "user_id", id: :uuid, default: nil, force: :cascade do |t|
    t.text "username", null: false
    t.text "display_name", null: false
    t.text "avatar_url"
    t.text "status", default: "offline", null: false
    t.text "role", default: "member", null: false
    t.integer "level", default: 1
    t.timestamptz "joined_at"
    t.timestamptz "updated_at", default: -> { "now()" }, null: false
    t.check_constraint "role = ANY (ARRAY['owner'::text, 'admin'::text, 'moderator'::text, 'member'::text])", name: "user_public_profiles_role_check"
    t.check_constraint "status = ANY (ARRAY['online'::text, 'offline'::text, 'away'::text])", name: "user_public_profiles_status_check"
  end

  create_table "users", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.citext "email", null: false
    t.text "username", null: false
    t.text "display_name", null: false
    t.text "avatar_url"
    t.text "role", default: "member", null: false
    t.text "status", default: "offline", null: false
    t.timestamptz "last_seen_at"
    t.timestamptz "created_at", default: -> { "now()" }, null: false
    t.timestamptz "updated_at", default: -> { "now()" }, null: false
    t.string "password_digest"

    t.check_constraint "role = ANY (ARRAY['owner'::text, 'admin'::text, 'moderator'::text, 'member'::text])", name: "users_role_check"
    t.check_constraint "status = ANY (ARRAY['online'::text, 'offline'::text, 'away'::text])", name: "users_status_check"
    t.unique_constraint ["email"], name: "users_email_key"
    t.unique_constraint ["username"], name: "users_username_key"
  end

  add_foreign_key "comments", "comments", column: "parent_id", name: "comments_parent_id_fkey", on_delete: :cascade
  add_foreign_key "comments", "posts", name: "comments_post_id_fkey", on_delete: :cascade
  add_foreign_key "comments", "users", name: "comments_user_id_fkey", on_delete: :cascade
  add_foreign_key "courses", "communities", name: "courses_community_id_fkey", on_delete: :cascade
  add_foreign_key "direct_conversation_participants", "direct_conversations", name: "direct_conversation_participants_direct_conversation_id_fkey", on_delete: :cascade
  add_foreign_key "direct_conversation_participants", "users", name: "direct_conversation_participants_user_id_fkey", on_delete: :cascade
  add_foreign_key "direct_conversations", "direct_messages", column: "last_message_id", name: "direct_conversations_last_message_id_fkey"
  add_foreign_key "direct_conversations", "users", column: "created_by_id", name: "direct_conversations_created_by_id_fkey", on_delete: :cascade
  add_foreign_key "direct_messages", "direct_conversations", name: "direct_messages_direct_conversation_id_fkey", on_delete: :cascade
  add_foreign_key "direct_messages", "users", column: "sender_id", name: "direct_messages_sender_id_fkey", on_delete: :cascade
  add_foreign_key "lessons", "courses", name: "lessons_course_id_fkey", on_delete: :cascade
  add_foreign_key "member_connections", "users", column: "requester_id", name: "member_connections_requester_id_fkey", on_delete: :cascade
  add_foreign_key "member_connections", "users", column: "target_id", name: "member_connections_target_id_fkey", on_delete: :cascade
  add_foreign_key "memberships", "communities", name: "memberships_community_id_fkey", on_delete: :cascade
  add_foreign_key "memberships", "users", name: "memberships_user_id_fkey", on_delete: :cascade
  add_foreign_key "messages", "messages", column: "parent_id", name: "messages_parent_id_fkey", on_delete: :cascade
  add_foreign_key "messages", "spaces", name: "messages_space_id_fkey", on_delete: :cascade
  add_foreign_key "messages", "users", name: "messages_user_id_fkey", on_delete: :cascade
  add_foreign_key "notifications", "users", name: "notifications_user_id_fkey", on_delete: :cascade
  add_foreign_key "post_attachments", "posts", name: "post_attachments_post_id_fkey", on_delete: :cascade
  add_foreign_key "post_attachments", "users", name: "post_attachments_user_id_fkey", on_delete: :cascade
  add_foreign_key "post_saves", "posts", name: "post_saves_post_id_fkey", on_delete: :cascade
  add_foreign_key "post_saves", "users", name: "post_saves_user_id_fkey", on_delete: :cascade
  add_foreign_key "post_views", "posts", name: "post_views_post_id_fkey", on_delete: :cascade
  add_foreign_key "post_views", "users", name: "post_views_user_id_fkey", on_delete: :nullify
  add_foreign_key "posts", "spaces", name: "posts_space_id_fkey", on_delete: :cascade
  add_foreign_key "posts", "users", name: "posts_user_id_fkey", on_delete: :cascade
  add_foreign_key "profiles", "users", name: "profiles_user_id_fkey", on_delete: :cascade
  add_foreign_key "reactions", "users", name: "reactions_user_id_fkey", on_delete: :cascade
  add_foreign_key "spaces", "communities", name: "spaces_community_id_fkey", on_delete: :cascade
  add_foreign_key "spaces", "spaces", column: "parent_id", name: "spaces_parent_id_fkey", on_delete: :cascade
  add_foreign_key "subscriptions", "communities", name: "subscriptions_community_id_fkey", on_delete: :cascade
  add_foreign_key "subscriptions", "users", name: "subscriptions_user_id_fkey", on_delete: :cascade
  add_foreign_key "user_public_profiles", "users", name: "user_public_profiles_user_id_fkey", on_delete: :cascade
end
