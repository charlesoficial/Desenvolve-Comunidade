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

ActiveRecord::Schema[7.2].define(version: 2026_05_04_170000) do
  create_schema "extensions"

  # These are extensions that must be enabled in order to support this database
  enable_extension "citext"
  enable_extension "pgcrypto"
  enable_extension "plpgsql"

  create_table "comments", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "post_id", null: false
    t.uuid "user_id", null: false
    t.uuid "parent_id"
    t.text "body", null: false
    t.integer "reactions_count", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["parent_id"], name: "index_comments_on_parent_id"
    t.index ["post_id", "created_at"], name: "index_comments_on_post_id_and_created_at"
    t.index ["post_id"], name: "index_comments_on_post_id"
    t.index ["user_id"], name: "index_comments_on_user_id"
  end

  create_table "communities", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "name", null: false
    t.string "slug", null: false
    t.string "logo_url"
    t.string "brand_color", default: "#e11d48", null: false
    t.jsonb "settings", default: {}, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["slug"], name: "index_communities_on_slug", unique: true
  end

  create_table "courses", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "community_id", null: false
    t.string "title", null: false
    t.string "slug", null: false
    t.text "description"
    t.integer "position", default: 0, null: false
    t.boolean "published", default: false, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["community_id", "slug"], name: "index_courses_on_community_id_and_slug", unique: true
    t.index ["community_id"], name: "index_courses_on_community_id"
  end

  create_table "direct_conversation_participants", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "direct_conversation_id", null: false
    t.uuid "user_id", null: false
    t.datetime "last_read_at"
    t.datetime "muted_at"
    t.datetime "archived_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["direct_conversation_id", "user_id"], name: "index_direct_participants_unique_user", unique: true
    t.index ["direct_conversation_id"], name: "idx_on_direct_conversation_id_bac7e31a7e"
    t.index ["user_id", "archived_at"], name: "idx_on_user_id_archived_at_86b2df7262"
    t.index ["user_id"], name: "index_direct_conversation_participants_on_user_id"
  end

  create_table "direct_conversations", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "created_by_id", null: false
    t.uuid "last_message_id"
    t.datetime "last_message_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["created_by_id"], name: "index_direct_conversations_on_created_by_id"
    t.index ["last_message_at"], name: "index_direct_conversations_on_last_message_at"
  end

  create_table "direct_messages", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "direct_conversation_id", null: false
    t.uuid "sender_id", null: false
    t.text "body", null: false
    t.jsonb "metadata", default: {}, null: false
    t.jsonb "attachments", default: [], null: false
    t.datetime "edited_at"
    t.datetime "deleted_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["direct_conversation_id", "created_at"], name: "index_direct_messages_on_direct_conversation_id_and_created_at"
    t.index ["direct_conversation_id"], name: "index_direct_messages_on_direct_conversation_id"
    t.index ["sender_id"], name: "index_direct_messages_on_sender_id"
  end

  create_table "lessons", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "course_id", null: false
    t.string "title", null: false
    t.string "slug", null: false
    t.text "body"
    t.string "video_url"
    t.integer "position", default: 0, null: false
    t.boolean "published", default: false, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["course_id", "slug"], name: "index_lessons_on_course_id_and_slug", unique: true
    t.index ["course_id"], name: "index_lessons_on_course_id"
  end

  create_table "member_connections", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "requester_id", null: false
    t.uuid "target_id", null: false
    t.string "status", default: "pending", null: false
    t.text "message"
    t.datetime "accepted_at"
    t.datetime "rejected_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["requester_id", "target_id"], name: "index_member_connections_unique_pair", unique: true
    t.index ["requester_id"], name: "index_member_connections_on_requester_id"
    t.index ["target_id", "status"], name: "index_member_connections_on_target_id_and_status"
    t.index ["target_id"], name: "index_member_connections_on_target_id"
  end

  create_table "memberships", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "community_id", null: false
    t.uuid "user_id", null: false
    t.string "role", default: "member", null: false
    t.string "state", default: "active", null: false
    t.integer "level", default: 1, null: false
    t.datetime "joined_at", default: -> { "CURRENT_TIMESTAMP" }, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["community_id", "user_id"], name: "index_memberships_on_community_id_and_user_id", unique: true
    t.index ["community_id"], name: "index_memberships_on_community_id"
    t.index ["user_id"], name: "index_memberships_on_user_id"
  end

  create_table "messages", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "space_id", null: false
    t.uuid "user_id", null: false
    t.uuid "parent_id"
    t.text "body", null: false
    t.jsonb "attachments", default: [], null: false
    t.datetime "edited_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["parent_id"], name: "index_messages_on_parent_id"
    t.index ["space_id", "created_at"], name: "index_messages_on_space_id_and_created_at"
    t.index ["space_id"], name: "index_messages_on_space_id"
    t.index ["user_id"], name: "index_messages_on_user_id"
  end

  create_table "notifications", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "user_id", null: false
    t.string "kind", null: false
    t.string "title", null: false
    t.text "body"
    t.string "record_type"
    t.uuid "record_id"
    t.datetime "read_at"
    t.jsonb "metadata", default: {}, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id", "read_at"], name: "index_notifications_on_user_id_and_read_at"
    t.index ["user_id"], name: "index_notifications_on_user_id"
  end

  create_table "posts", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "space_id", null: false
    t.uuid "user_id", null: false
    t.string "title", null: false
    t.text "body", null: false
    t.string "status", default: "published", null: false
    t.datetime "published_at"
    t.integer "comments_count", default: 0, null: false
    t.integer "reactions_count", default: 0, null: false
    t.boolean "pinned", default: false, null: false
    t.jsonb "metadata", default: {}, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["space_id", "published_at"], name: "index_posts_on_space_id_and_published_at"
    t.index ["space_id"], name: "index_posts_on_space_id"
    t.index ["status"], name: "index_posts_on_status"
    t.index ["user_id"], name: "index_posts_on_user_id"
  end

  create_table "profiles", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "user_id", null: false
    t.string "headline"
    t.text "bio"
    t.jsonb "links", default: {}, null: false
    t.jsonb "preferences", default: {}, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_profiles_on_user_id"
  end

  create_table "reactions", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "user_id", null: false
    t.string "reactable_type", null: false
    t.uuid "reactable_id", null: false
    t.string "emoji", default: "like", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["reactable_type", "reactable_id"], name: "index_reactions_on_reactable_type_and_reactable_id"
    t.index ["user_id", "reactable_type", "reactable_id", "emoji"], name: "index_reactions_unique_user_reactable_emoji", unique: true
    t.index ["user_id"], name: "index_reactions_on_user_id"
  end

  create_table "spaces", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "community_id", null: false
    t.uuid "parent_id"
    t.string "name", null: false
    t.string "slug", null: false
    t.string "kind", default: "feed", null: false
    t.string "icon"
    t.integer "position", default: 0, null: false
    t.boolean "locked", default: false, null: false
    t.jsonb "settings", default: {}, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["community_id", "position"], name: "index_spaces_on_community_id_and_position"
    t.index ["community_id", "slug"], name: "index_spaces_on_community_id_and_slug", unique: true
    t.index ["community_id"], name: "index_spaces_on_community_id"
    t.index ["parent_id"], name: "index_spaces_on_parent_id"
  end

  create_table "subscriptions", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "user_id", null: false
    t.uuid "community_id", null: false
    t.string "provider", default: "stripe", null: false
    t.string "provider_customer_id"
    t.string "provider_subscription_id"
    t.string "status", default: "inactive", null: false
    t.datetime "current_period_end"
    t.jsonb "metadata", default: {}, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["community_id"], name: "index_subscriptions_on_community_id"
    t.index ["provider_subscription_id"], name: "index_subscriptions_on_provider_subscription_id"
    t.index ["user_id"], name: "index_subscriptions_on_user_id"
  end

  create_table "users", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.citext "email", null: false
    t.string "username", null: false
    t.string "display_name", null: false
    t.string "avatar_url"
    t.string "role", default: "member", null: false
    t.string "status", default: "offline", null: false
    t.datetime "last_seen_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["username"], name: "index_users_on_username", unique: true
  end

  add_foreign_key "comments", "comments", column: "parent_id"
  add_foreign_key "comments", "posts"
  add_foreign_key "comments", "users"
  add_foreign_key "courses", "communities"
  add_foreign_key "direct_conversation_participants", "direct_conversations"
  add_foreign_key "direct_conversation_participants", "users"
  add_foreign_key "direct_conversations", "direct_messages", column: "last_message_id"
  add_foreign_key "direct_conversations", "users", column: "created_by_id"
  add_foreign_key "direct_messages", "direct_conversations"
  add_foreign_key "direct_messages", "users", column: "sender_id"
  add_foreign_key "lessons", "courses"
  add_foreign_key "member_connections", "users", column: "requester_id"
  add_foreign_key "member_connections", "users", column: "target_id"
  add_foreign_key "memberships", "communities"
  add_foreign_key "memberships", "users"
  add_foreign_key "messages", "messages", column: "parent_id"
  add_foreign_key "messages", "spaces"
  add_foreign_key "messages", "users"
  add_foreign_key "notifications", "users"
  add_foreign_key "posts", "spaces"
  add_foreign_key "posts", "users"
  add_foreign_key "profiles", "users"
  add_foreign_key "reactions", "users"
  add_foreign_key "spaces", "communities"
  add_foreign_key "spaces", "spaces", column: "parent_id"
  add_foreign_key "subscriptions", "communities"
  add_foreign_key "subscriptions", "users"
end
