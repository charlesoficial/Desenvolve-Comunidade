class AddPagesTopicsLiveStreams < ActiveRecord::Migration[7.2]
  def up
    unless table_exists?(:static_pages)
      create_table :static_pages, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
        t.references :community, type: :uuid, foreign_key: { on_delete: :cascade }, null: false
        t.text :slug, null: false
        t.text :title, null: false
        t.text :body, null: false, default: ""
        t.boolean :published, null: false, default: true
        t.integer :position, null: false, default: 0
        t.timestamps default: -> { "now()" }
      end
      add_index :static_pages, [:community_id, :slug], unique: true, if_not_exists: true
    end

    unless table_exists?(:topics)
      create_table :topics, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
        t.references :community, type: :uuid, foreign_key: { on_delete: :cascade }, null: false
        t.text :name, null: false
        t.text :slug, null: false
        t.text :color, default: "#4f46e5"
        t.text :description, default: ""
        t.integer :posts_count, null: false, default: 0
        t.integer :position, null: false, default: 0
        t.timestamps default: -> { "now()" }
      end
      add_index :topics, [:community_id, :slug], unique: true, if_not_exists: true
    end

    unless table_exists?(:live_streams)
      create_table :live_streams, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
        t.references :community, type: :uuid, foreign_key: { on_delete: :cascade }, null: false
        t.references :user, type: :uuid, foreign_key: { on_delete: :nullify }
        t.text :title, null: false
        t.text :description, default: ""
        t.timestamptz :starts_at, null: false
        t.timestamptz :ends_at
        t.text :status, null: false, default: "scheduled"
        t.text :source_url
        t.text :recording_url
        t.timestamps default: -> { "now()" }
      end
      add_index :live_streams, [:community_id, :starts_at], order: { starts_at: :desc }, if_not_exists: true
    end

    unless table_exists?(:bulk_action_runs)
      create_table :bulk_action_runs, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
        t.references :community, type: :uuid, foreign_key: { on_delete: :cascade }, null: false
        t.references :user, type: :uuid, foreign_key: { on_delete: :nullify }
        t.text :action, null: false
        t.text :target, null: false
        t.jsonb :filters, null: false, default: {}
        t.integer :affected_count, null: false, default: 0
        t.text :status, null: false, default: "pending"
        t.timestamptz :created_at, null: false, default: -> { "now()" }
        t.timestamptz :finished_at
      end
      add_index :bulk_action_runs, [:community_id, :created_at], order: { created_at: :desc }, if_not_exists: true
    end
  end

  def down
    drop_table :bulk_action_runs if table_exists?(:bulk_action_runs)
    drop_table :live_streams if table_exists?(:live_streams)
    drop_table :topics if table_exists?(:topics)
    drop_table :static_pages if table_exists?(:static_pages)
  end
end
