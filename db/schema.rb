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

ActiveRecord::Schema[7.2].define(version: 2026_05_25_230000) do
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

  create_table "access_groups", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "community_id", null: false
    t.text "name", null: false
    t.text "description", default: ""
    t.uuid "space_ids", null: false, array: true
    t.text "default_role", default: "member", null: false
    t.integer "members_count", default: 0, null: false
    t.boolean "active", default: true, null: false
    t.timestamptz "created_at", default: -> { "now()" }, null: false
    t.timestamptz "updated_at", default: -> { "now()" }, null: false
    t.index ["community_id"], name: "index_access_groups_community"
    t.check_constraint "default_role = ANY (ARRAY['owner'::text, 'admin'::text, 'moderator'::text, 'member'::text])", name: "access_groups_default_role_check"
  end

  create_table "affiliate_codes", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "community_id", null: false
    t.uuid "user_id", null: false
    t.text "code", null: false
    t.integer "commission_pct", default: 30, null: false
    t.integer "visits_count", default: 0, null: false
    t.integer "conversions_count", default: 0, null: false
    t.integer "total_revenue_cents", default: 0, null: false
    t.boolean "active", default: true, null: false
    t.timestamptz "created_at", default: -> { "now()" }, null: false
    t.timestamptz "updated_at", default: -> { "now()" }, null: false

    t.unique_constraint ["community_id", "code"], name: "affiliate_codes_community_id_code_key"
    t.unique_constraint ["community_id", "user_id"], name: "affiliate_codes_community_id_user_id_key"
  end

  create_table "ai_knowledge_entries", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "community_id", null: false
    t.text "title", null: false
    t.text "body", default: "", null: false
    t.text "source_url"
    t.boolean "enabled", default: true, null: false
    t.timestamptz "created_at", default: -> { "now()" }, null: false
    t.timestamptz "updated_at", default: -> { "now()" }, null: false
    t.index ["community_id"], name: "index_ai_knowledge_community"
  end

  create_table "api_tokens", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "community_id", null: false
    t.uuid "user_id"
    t.text "name", null: false
    t.text "token_prefix", null: false
    t.text "token_hash", null: false
    t.text "scopes", null: false, array: true
    t.timestamptz "last_used_at"
    t.timestamptz "revoked_at"
    t.timestamptz "created_at", default: -> { "now()" }, null: false
    t.timestamptz "updated_at", default: -> { "now()" }, null: false
    t.index ["community_id"], name: "index_api_tokens_community"
    t.index ["token_hash"], name: "index_api_tokens_token_hash", unique: true
  end

  create_table "audit_logs", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "community_id", null: false
    t.uuid "actor_id"
    t.string "action", null: false
    t.string "target_type"
    t.uuid "target_id"
    t.jsonb "metadata", default: {}, null: false
    t.string "ip_address"
    t.text "user_agent"
    t.datetime "created_at", null: false
    t.index ["actor_id"], name: "index_audit_logs_on_actor_id"
    t.index ["community_id", "action"], name: "index_audit_logs_on_community_id_and_action"
    t.index ["community_id", "created_at"], name: "index_audit_logs_on_community_id_and_created_at"
    t.index ["community_id"], name: "index_audit_logs_on_community_id"
    t.index ["target_type", "target_id"], name: "index_audit_logs_on_target_type_and_target_id"
  end

  create_table "bulk_action_runs", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "community_id", null: false
    t.uuid "user_id"
    t.text "action", null: false
    t.text "target", null: false
    t.jsonb "filters", default: {}, null: false
    t.integer "affected_count", default: 0, null: false
    t.text "status", default: "pending", null: false
    t.timestamptz "created_at", default: -> { "now()" }, null: false
    t.timestamptz "finished_at"
    t.index ["community_id", "created_at"], name: "index_bulk_action_runs_community_created", order: { created_at: :desc }
    t.check_constraint "status = ANY (ARRAY['pending'::text, 'running'::text, 'completed'::text, 'failed'::text])", name: "bulk_action_runs_status_check"
  end

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

  create_table "coupons", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "community_id", null: false
    t.text "code", null: false
    t.text "description", default: ""
    t.text "discount_type", default: "percent", null: false
    t.integer "discount_value", default: 0, null: false
    t.integer "max_uses"
    t.integer "used_count", default: 0, null: false
    t.timestamptz "expires_at"
    t.boolean "active", default: true, null: false
    t.text "applies_to", default: "all", null: false
    t.uuid "paywall_id"
    t.uuid "plan_id"
    t.timestamptz "created_at", default: -> { "now()" }, null: false
    t.timestamptz "updated_at", default: -> { "now()" }, null: false
    t.index "community_id, lower(code)", name: "index_coupons_community_code", unique: true
    t.check_constraint "applies_to = ANY (ARRAY['all'::text, 'paywall'::text, 'plan'::text])", name: "coupons_applies_to_check"
    t.check_constraint "discount_type = ANY (ARRAY['percent'::text, 'fixed'::text])", name: "coupons_discount_type_check"
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

  create_table "email_templates", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "community_id", null: false
    t.text "key", null: false
    t.text "subject", null: false
    t.text "body", default: "", null: false
    t.boolean "enabled", default: true, null: false
    t.timestamptz "created_at", default: -> { "now()" }, null: false
    t.timestamptz "updated_at", default: -> { "now()" }, null: false

    t.unique_constraint ["community_id", "key"], name: "email_templates_community_id_key_key"
  end

  create_table "gamification_settings", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "community_id", null: false
    t.boolean "enabled", default: true, null: false
    t.integer "points_per_post", default: 5, null: false
    t.integer "points_per_comment", default: 2, null: false
    t.integer "points_per_reaction_received", default: 1, null: false
    t.integer "points_per_login", default: 1, null: false
    t.text "level_curve", default: "linear", null: false
    t.integer "level_step", default: 50, null: false
    t.jsonb "badges", default: [], null: false
    t.timestamptz "created_at", default: -> { "now()" }, null: false
    t.timestamptz "updated_at", default: -> { "now()" }, null: false

    t.check_constraint "level_curve = ANY (ARRAY['linear'::text, 'exponential'::text, 'custom'::text])", name: "gamification_settings_curve_check"
    t.unique_constraint ["community_id"], name: "gamification_settings_community_id_key"
  end

  create_table "invitation_links", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "community_id", null: false
    t.uuid "created_by_id"
    t.uuid "plan_id"
    t.string "code", null: false
    t.string "name"
    t.text "description"
    t.uuid "member_tag_id"
    t.integer "max_uses"
    t.integer "uses_count", default: 0, null: false
    t.datetime "expires_at"
    t.boolean "active", default: true, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["community_id", "code"], name: "index_invitation_links_on_community_id_and_code", unique: true
    t.index ["community_id"], name: "index_invitation_links_on_community_id"
    t.index ["created_by_id"], name: "index_invitation_links_on_created_by_id"
    t.index ["expires_at"], name: "index_invitation_links_on_expires_at"
    t.index ["plan_id"], name: "index_invitation_links_on_plan_id"
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

  create_table "live_streams", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "community_id", null: false
    t.uuid "user_id"
    t.text "title", null: false
    t.text "description", default: ""
    t.timestamptz "starts_at", null: false
    t.timestamptz "ends_at"
    t.text "status", default: "scheduled", null: false
    t.text "source_url"
    t.text "recording_url"
    t.timestamptz "created_at", default: -> { "now()" }, null: false
    t.timestamptz "updated_at", default: -> { "now()" }, null: false
    t.index ["community_id", "starts_at"], name: "index_live_streams_community_starts", order: { starts_at: :desc }
    t.check_constraint "status = ANY (ARRAY['scheduled'::text, 'live'::text, 'ended'::text, 'cancelled'::text])", name: "live_streams_status_check"
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

  create_table "member_tag_assignments", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "community_id", null: false
    t.uuid "member_tag_id", null: false
    t.uuid "user_id", null: false
    t.timestamptz "assigned_at", default: -> { "now()" }, null: false
    t.index ["user_id"], name: "index_member_tag_assignments_user"
    t.unique_constraint ["member_tag_id", "user_id"], name: "member_tag_assignments_member_tag_id_user_id_key"
  end

  create_table "member_tags", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "community_id", null: false
    t.text "name", null: false
    t.text "color", default: "#4f46e5", null: false
    t.text "description", default: ""
    t.timestamptz "created_at", default: -> { "now()" }, null: false
    t.timestamptz "updated_at", default: -> { "now()" }, null: false
    t.index "community_id, lower(name)", name: "index_member_tags_community_name", unique: true
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

  create_table "paywalls", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "community_id", null: false
    t.text "name", null: false
    t.text "description", default: ""
    t.integer "price_cents", default: 0, null: false
    t.text "currency", default: "BRL", null: false
    t.text "interval", default: "month", null: false
    t.text "status", default: "active", null: false
    t.jsonb "settings", default: {}, null: false
    t.timestamptz "created_at", default: -> { "now()" }, null: false
    t.timestamptz "updated_at", default: -> { "now()" }, null: false
    t.index ["community_id"], name: "index_paywalls_community"
    t.check_constraint "\"interval\" = ANY (ARRAY['month'::text, 'year'::text, 'one_time'::text])", name: "paywalls_interval_check"
    t.check_constraint "status = ANY (ARRAY['active'::text, 'paused'::text, 'archived'::text])", name: "paywalls_status_check"
  end

  create_table "plans", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "community_id", null: false
    t.text "name", null: false
    t.text "description", default: ""
    t.integer "price_cents", default: 0, null: false
    t.text "currency", default: "BRL", null: false
    t.text "interval", default: "month", null: false
    t.boolean "highlight", default: false, null: false
    t.boolean "active", default: true, null: false
    t.integer "position", default: 0, null: false
    t.jsonb "settings", default: {}, null: false
    t.timestamptz "created_at", default: -> { "now()" }, null: false
    t.timestamptz "updated_at", default: -> { "now()" }, null: false
    t.index ["community_id", "position"], name: "index_plans_community_position"
    t.check_constraint "\"interval\" = ANY (ARRAY['month'::text, 'year'::text, 'one_time'::text])", name: "plans_interval_check"
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

  create_table "profile_field_definitions", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "community_id", null: false
    t.string "key", null: false
    t.string "label", null: false
    t.string "field_type", default: "text", null: false
    t.string "placeholder"
    t.text "help_text"
    t.boolean "required", default: false, null: false
    t.boolean "show_in_onboarding", default: false, null: false
    t.string "visibility", default: "members", null: false
    t.jsonb "options", default: [], null: false
    t.integer "position", default: 0, null: false
    t.boolean "archived", default: false, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["community_id", "key"], name: "index_profile_field_definitions_on_community_id_and_key", unique: true
    t.index ["community_id", "position"], name: "index_profile_field_definitions_on_community_id_and_position"
    t.index ["community_id"], name: "index_profile_field_definitions_on_community_id"
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

  create_table "segments", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "community_id", null: false
    t.text "name", null: false
    t.text "description", default: ""
    t.jsonb "filters", default: {}, null: false
    t.integer "members_count", default: 0, null: false
    t.timestamptz "last_calculated_at"
    t.timestamptz "created_at", default: -> { "now()" }, null: false
    t.timestamptz "updated_at", default: -> { "now()" }, null: false
    t.index ["community_id"], name: "index_segments_community"
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

  create_table "static_pages", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "community_id", null: false
    t.text "slug", null: false
    t.text "title", null: false
    t.text "body", default: "", null: false
    t.boolean "published", default: true, null: false
    t.integer "position", default: 0, null: false
    t.timestamptz "created_at", default: -> { "now()" }, null: false
    t.timestamptz "updated_at", default: -> { "now()" }, null: false

    t.unique_constraint ["community_id", "slug"], name: "static_pages_community_id_slug_key"
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
    t.uuid "plan_id"
    t.index ["community_id"], name: "index_subscriptions_community_id"
    t.index ["plan_id"], name: "index_subscriptions_plan_id"
    t.index ["provider_subscription_id"], name: "index_subscriptions_provider_subscription_id"
    t.index ["user_id"], name: "index_subscriptions_user_id"
  end

  create_table "topics", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "community_id", null: false
    t.text "name", null: false
    t.text "slug", null: false
    t.text "color", default: "#4f46e5"
    t.text "description", default: ""
    t.integer "posts_count", default: 0, null: false
    t.integer "position", default: 0, null: false
    t.timestamptz "created_at", default: -> { "now()" }, null: false
    t.timestamptz "updated_at", default: -> { "now()" }, null: false

    t.unique_constraint ["community_id", "slug"], name: "topics_community_id_slug_key"
  end

  create_table "uploads_catalog", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "community_id", null: false
    t.uuid "user_id"
    t.text "filename", null: false
    t.text "url", null: false
    t.text "storage_key", null: false
    t.text "content_type"
    t.integer "bytes", default: 0, null: false
    t.text "backend", default: "local", null: false
    t.timestamptz "created_at", default: -> { "now()" }, null: false
    t.index ["community_id", "created_at"], name: "index_uploads_community_created", order: { created_at: :desc }
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

  add_foreign_key "access_groups", "communities", name: "access_groups_community_id_fkey", on_delete: :cascade
  add_foreign_key "affiliate_codes", "communities", name: "affiliate_codes_community_id_fkey", on_delete: :cascade
  add_foreign_key "affiliate_codes", "users", name: "affiliate_codes_user_id_fkey", on_delete: :cascade
  add_foreign_key "ai_knowledge_entries", "communities", name: "ai_knowledge_entries_community_id_fkey", on_delete: :cascade
  add_foreign_key "api_tokens", "communities", name: "api_tokens_community_id_fkey", on_delete: :cascade
  add_foreign_key "api_tokens", "users", name: "api_tokens_user_id_fkey", on_delete: :nullify
  add_foreign_key "audit_logs", "communities"
  add_foreign_key "audit_logs", "users", column: "actor_id"
  add_foreign_key "bulk_action_runs", "communities", name: "bulk_action_runs_community_id_fkey", on_delete: :cascade
  add_foreign_key "bulk_action_runs", "users", name: "bulk_action_runs_user_id_fkey", on_delete: :nullify
  add_foreign_key "comments", "comments", column: "parent_id", name: "comments_parent_id_fkey", on_delete: :cascade
  add_foreign_key "comments", "posts", name: "comments_post_id_fkey", on_delete: :cascade
  add_foreign_key "comments", "users", name: "comments_user_id_fkey", on_delete: :cascade
  add_foreign_key "coupons", "communities", name: "coupons_community_id_fkey", on_delete: :cascade
  add_foreign_key "coupons", "paywalls", name: "coupons_paywall_id_fkey", on_delete: :nullify
  add_foreign_key "coupons", "plans", name: "coupons_plan_id_fkey", on_delete: :nullify
  add_foreign_key "courses", "communities", name: "courses_community_id_fkey", on_delete: :cascade
  add_foreign_key "direct_conversation_participants", "direct_conversations", name: "direct_conversation_participants_direct_conversation_id_fkey", on_delete: :cascade
  add_foreign_key "direct_conversation_participants", "users", name: "direct_conversation_participants_user_id_fkey", on_delete: :cascade
  add_foreign_key "direct_conversations", "direct_messages", column: "last_message_id", name: "direct_conversations_last_message_id_fkey"
  add_foreign_key "direct_conversations", "users", column: "created_by_id", name: "direct_conversations_created_by_id_fkey", on_delete: :cascade
  add_foreign_key "direct_messages", "direct_conversations", name: "direct_messages_direct_conversation_id_fkey", on_delete: :cascade
  add_foreign_key "direct_messages", "users", column: "sender_id", name: "direct_messages_sender_id_fkey", on_delete: :cascade
  add_foreign_key "email_templates", "communities", name: "email_templates_community_id_fkey", on_delete: :cascade
  add_foreign_key "gamification_settings", "communities", name: "gamification_settings_community_id_fkey", on_delete: :cascade
  add_foreign_key "invitation_links", "communities"
  add_foreign_key "invitation_links", "plans"
  add_foreign_key "invitation_links", "users", column: "created_by_id"
  add_foreign_key "lessons", "courses", name: "lessons_course_id_fkey", on_delete: :cascade
  add_foreign_key "live_streams", "communities", name: "live_streams_community_id_fkey", on_delete: :cascade
  add_foreign_key "live_streams", "users", name: "live_streams_user_id_fkey", on_delete: :nullify
  add_foreign_key "member_connections", "users", column: "requester_id", name: "member_connections_requester_id_fkey", on_delete: :cascade
  add_foreign_key "member_connections", "users", column: "target_id", name: "member_connections_target_id_fkey", on_delete: :cascade
  add_foreign_key "member_tag_assignments", "communities", name: "member_tag_assignments_community_id_fkey", on_delete: :cascade
  add_foreign_key "member_tag_assignments", "member_tags", name: "member_tag_assignments_member_tag_id_fkey", on_delete: :cascade
  add_foreign_key "member_tag_assignments", "users", name: "member_tag_assignments_user_id_fkey", on_delete: :cascade
  add_foreign_key "member_tags", "communities", name: "member_tags_community_id_fkey", on_delete: :cascade
  add_foreign_key "memberships", "communities", name: "memberships_community_id_fkey", on_delete: :cascade
  add_foreign_key "memberships", "users", name: "memberships_user_id_fkey", on_delete: :cascade
  add_foreign_key "messages", "messages", column: "parent_id", name: "messages_parent_id_fkey", on_delete: :cascade
  add_foreign_key "messages", "spaces", name: "messages_space_id_fkey", on_delete: :cascade
  add_foreign_key "messages", "users", name: "messages_user_id_fkey", on_delete: :cascade
  add_foreign_key "notifications", "users", name: "notifications_user_id_fkey", on_delete: :cascade
  add_foreign_key "paywalls", "communities", name: "paywalls_community_id_fkey", on_delete: :cascade
  add_foreign_key "plans", "communities", name: "plans_community_id_fkey", on_delete: :cascade
  add_foreign_key "post_attachments", "posts", name: "post_attachments_post_id_fkey", on_delete: :cascade
  add_foreign_key "post_attachments", "users", name: "post_attachments_user_id_fkey", on_delete: :cascade
  add_foreign_key "post_saves", "posts", name: "post_saves_post_id_fkey", on_delete: :cascade
  add_foreign_key "post_saves", "users", name: "post_saves_user_id_fkey", on_delete: :cascade
  add_foreign_key "post_views", "posts", name: "post_views_post_id_fkey", on_delete: :cascade
  add_foreign_key "post_views", "users", name: "post_views_user_id_fkey", on_delete: :nullify
  add_foreign_key "posts", "spaces", name: "posts_space_id_fkey", on_delete: :cascade
  add_foreign_key "posts", "users", name: "posts_user_id_fkey", on_delete: :cascade
  add_foreign_key "profile_field_definitions", "communities"
  add_foreign_key "profiles", "users", name: "profiles_user_id_fkey", on_delete: :cascade
  add_foreign_key "reactions", "users", name: "reactions_user_id_fkey", on_delete: :cascade
  add_foreign_key "segments", "communities", name: "segments_community_id_fkey", on_delete: :cascade
  add_foreign_key "spaces", "communities", name: "spaces_community_id_fkey", on_delete: :cascade
  add_foreign_key "spaces", "spaces", column: "parent_id", name: "spaces_parent_id_fkey", on_delete: :cascade
  add_foreign_key "static_pages", "communities", name: "static_pages_community_id_fkey", on_delete: :cascade
  add_foreign_key "subscriptions", "communities", name: "subscriptions_community_id_fkey", on_delete: :cascade
  add_foreign_key "subscriptions", "plans", name: "subscriptions_plan_id_fkey", on_delete: :nullify
  add_foreign_key "subscriptions", "users", name: "subscriptions_user_id_fkey", on_delete: :cascade
  add_foreign_key "topics", "communities", name: "topics_community_id_fkey", on_delete: :cascade
  add_foreign_key "uploads_catalog", "communities", name: "uploads_catalog_community_id_fkey", on_delete: :cascade
  add_foreign_key "uploads_catalog", "users", name: "uploads_catalog_user_id_fkey", on_delete: :nullify
  add_foreign_key "user_public_profiles", "users", name: "user_public_profiles_user_id_fkey", on_delete: :cascade
end
