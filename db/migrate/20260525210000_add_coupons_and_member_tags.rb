class AddCouponsAndMemberTags < ActiveRecord::Migration[7.2]
  def up
    unless table_exists?(:coupons)
      create_table :coupons, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
        t.references :community, type: :uuid, foreign_key: { on_delete: :cascade }, null: false
        t.text :code, null: false
        t.text :description, default: ""
        t.text :discount_type, null: false, default: "percent"
        t.integer :discount_value, null: false, default: 0
        t.integer :max_uses
        t.integer :used_count, null: false, default: 0
        t.timestamptz :expires_at
        t.boolean :active, null: false, default: true
        t.text :applies_to, null: false, default: "all"
        t.references :paywall, type: :uuid, foreign_key: { on_delete: :nullify }
        t.references :plan, type: :uuid, foreign_key: { on_delete: :nullify }
        t.timestamps default: -> { "now()" }
      end
    end

    unless table_exists?(:member_tags)
      create_table :member_tags, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
        t.references :community, type: :uuid, foreign_key: { on_delete: :cascade }, null: false
        t.text :name, null: false
        t.text :color, null: false, default: "#4f46e5"
        t.text :description, default: ""
        t.timestamps default: -> { "now()" }
      end
    end

    unless table_exists?(:member_tag_assignments)
      create_table :member_tag_assignments, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
        t.references :community, type: :uuid, foreign_key: { on_delete: :cascade }, null: false
        t.references :member_tag, type: :uuid, foreign_key: { on_delete: :cascade }, null: false
        t.references :user, type: :uuid, foreign_key: { on_delete: :cascade }, null: false
        t.timestamptz :assigned_at, null: false, default: -> { "now()" }
      end
      add_index :member_tag_assignments, [:member_tag_id, :user_id], unique: true, if_not_exists: true
    end
  end

  def down
    drop_table :member_tag_assignments if table_exists?(:member_tag_assignments)
    drop_table :member_tags if table_exists?(:member_tags)
    drop_table :coupons if table_exists?(:coupons)
  end
end
