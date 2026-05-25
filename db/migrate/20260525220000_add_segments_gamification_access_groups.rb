class AddSegmentsGamificationAccessGroups < ActiveRecord::Migration[7.2]
  def up
    unless table_exists?(:segments)
      create_table :segments, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
        t.references :community, type: :uuid, foreign_key: { on_delete: :cascade }, null: false
        t.text :name, null: false
        t.text :description, default: ""
        t.jsonb :filters, null: false, default: {}
        t.integer :members_count, null: false, default: 0
        t.timestamptz :last_calculated_at
        t.timestamps default: -> { "now()" }
      end
    end

    unless table_exists?(:access_groups)
      create_table :access_groups, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
        t.references :community, type: :uuid, foreign_key: { on_delete: :cascade }, null: false
        t.text :name, null: false
        t.text :description, default: ""
        t.column :space_ids, "uuid[]", null: false, default: []
        t.text :default_role, null: false, default: "member"
        t.integer :members_count, null: false, default: 0
        t.boolean :active, null: false, default: true
        t.timestamps default: -> { "now()" }
      end
    end

    unless table_exists?(:gamification_settings)
      create_table :gamification_settings, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
        t.references :community, type: :uuid, foreign_key: { on_delete: :cascade }, null: false
        t.boolean :enabled, null: false, default: true
        t.integer :points_per_post, null: false, default: 5
        t.integer :points_per_comment, null: false, default: 2
        t.integer :points_per_reaction_received, null: false, default: 1
        t.integer :points_per_login, null: false, default: 1
        t.text :level_curve, null: false, default: "linear"
        t.integer :level_step, null: false, default: 50
        t.jsonb :badges, null: false, default: []
        t.timestamps default: -> { "now()" }
      end
      add_index :gamification_settings, :community_id, unique: true, if_not_exists: true
    end
  end

  def down
    drop_table :gamification_settings if table_exists?(:gamification_settings)
    drop_table :access_groups if table_exists?(:access_groups)
    drop_table :segments if table_exists?(:segments)
  end
end
