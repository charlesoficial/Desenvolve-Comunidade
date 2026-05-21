class CreateCommunityCore < ActiveRecord::Migration[7.1]
  def change
    create_table :users, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.citext :email, null: false
      t.string :username, null: false
      t.string :display_name, null: false
      t.string :avatar_url
      t.string :role, null: false, default: "member"
      t.string :status, null: false, default: "offline"
      t.datetime :last_seen_at
      t.timestamps
    end

    add_index :users, :email, unique: true
    add_index :users, :username, unique: true

    create_table :profiles, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.references :user, null: false, foreign_key: true, type: :uuid
      t.string :headline
      t.text :bio
      t.jsonb :links, null: false, default: {}
      t.jsonb :preferences, null: false, default: {}
      t.timestamps
    end

    create_table :communities, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.string :name, null: false
      t.string :slug, null: false
      t.string :logo_url
      t.string :brand_color, null: false, default: "#e11d48"
      t.jsonb :settings, null: false, default: {}
      t.timestamps
    end

    add_index :communities, :slug, unique: true

    create_table :spaces, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.references :community, null: false, foreign_key: true, type: :uuid
      t.references :parent, foreign_key: { to_table: :spaces }, type: :uuid
      t.string :name, null: false
      t.string :slug, null: false
      t.string :kind, null: false, default: "feed"
      t.string :icon
      t.integer :position, null: false, default: 0
      t.boolean :locked, null: false, default: false
      t.jsonb :settings, null: false, default: {}
      t.timestamps
    end

    add_index :spaces, [:community_id, :slug], unique: true
    add_index :spaces, [:community_id, :position]

    create_table :memberships, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.references :community, null: false, foreign_key: true, type: :uuid
      t.references :user, null: false, foreign_key: true, type: :uuid
      t.string :role, null: false, default: "member"
      t.string :state, null: false, default: "active"
      t.integer :level, null: false, default: 1
      t.datetime :joined_at, null: false, default: -> { "CURRENT_TIMESTAMP" }
      t.timestamps
    end

    add_index :memberships, [:community_id, :user_id], unique: true
  end
end
