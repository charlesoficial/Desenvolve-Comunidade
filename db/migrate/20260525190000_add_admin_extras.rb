class AddAdminExtras < ActiveRecord::Migration[7.2]
  def up
    unless table_exists?(:ai_knowledge_entries)
      create_table :ai_knowledge_entries, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
        t.references :community, type: :uuid, foreign_key: { on_delete: :cascade }, null: false
        t.text :title, null: false
        t.text :body, null: false, default: ""
        t.text :source_url
        t.boolean :enabled, null: false, default: true
        t.timestamps default: -> { "now()" }
      end
    end

    unless table_exists?(:email_templates)
      create_table :email_templates, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
        t.references :community, type: :uuid, foreign_key: { on_delete: :cascade }, null: false
        t.text :key, null: false
        t.text :subject, null: false
        t.text :body, null: false, default: ""
        t.boolean :enabled, null: false, default: true
        t.timestamps default: -> { "now()" }
      end
      add_index :email_templates, [:community_id, :key], unique: true, if_not_exists: true
    end

    unless table_exists?(:affiliate_codes)
      create_table :affiliate_codes, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
        t.references :community, type: :uuid, foreign_key: { on_delete: :cascade }, null: false
        t.references :user, type: :uuid, foreign_key: { on_delete: :cascade }, null: false
        t.text :code, null: false
        t.integer :commission_pct, null: false, default: 30
        t.integer :visits_count, null: false, default: 0
        t.integer :conversions_count, null: false, default: 0
        t.integer :total_revenue_cents, null: false, default: 0
        t.boolean :active, null: false, default: true
        t.timestamps default: -> { "now()" }
      end
      add_index :affiliate_codes, [:community_id, :code], unique: true, if_not_exists: true
      add_index :affiliate_codes, [:community_id, :user_id], unique: true, if_not_exists: true
    end

    unless table_exists?(:uploads_catalog)
      create_table :uploads_catalog, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
        t.references :community, type: :uuid, foreign_key: { on_delete: :cascade }, null: false
        t.references :user, type: :uuid, foreign_key: { on_delete: :nullify }
        t.text :filename, null: false
        t.text :url, null: false
        t.text :storage_key, null: false
        t.text :content_type
        t.integer :bytes, null: false, default: 0
        t.text :backend, null: false, default: "local"
        t.timestamptz :created_at, null: false, default: -> { "now()" }
      end
      add_index :uploads_catalog, [:community_id, :created_at], order: { created_at: :desc }, if_not_exists: true
    end
  end

  def down
    drop_table :uploads_catalog if table_exists?(:uploads_catalog)
    drop_table :affiliate_codes if table_exists?(:affiliate_codes)
    drop_table :email_templates if table_exists?(:email_templates)
    drop_table :ai_knowledge_entries if table_exists?(:ai_knowledge_entries)
  end
end
