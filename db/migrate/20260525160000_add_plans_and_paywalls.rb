class AddPlansAndPaywalls < ActiveRecord::Migration[7.2]
  def up
    create_table :plans, id: :uuid, default: -> { "gen_random_uuid()" }, if_not_exists: true do |t|
      t.references :community, type: :uuid, foreign_key: { on_delete: :cascade }, null: false
      t.text :name, null: false
      t.text :description, default: ""
      t.integer :price_cents, null: false, default: 0
      t.text :currency, null: false, default: "BRL"
      t.text :interval, null: false, default: "month"
      t.boolean :highlight, null: false, default: false
      t.boolean :active, null: false, default: true
      t.integer :position, null: false, default: 0
      t.jsonb :settings, null: false, default: {}
      t.timestamps default: -> { "now()" }
    end

    add_index :plans, [:community_id, :position], if_not_exists: true

    create_table :paywalls, id: :uuid, default: -> { "gen_random_uuid()" }, if_not_exists: true do |t|
      t.references :community, type: :uuid, foreign_key: { on_delete: :cascade }, null: false
      t.text :name, null: false
      t.text :description, default: ""
      t.integer :price_cents, null: false, default: 0
      t.text :currency, null: false, default: "BRL"
      t.text :interval, null: false, default: "month"
      t.text :status, null: false, default: "active"
      t.jsonb :settings, null: false, default: {}
      t.timestamps default: -> { "now()" }
    end

    add_index :paywalls, :community_id, name: "index_paywalls_community", if_not_exists: true
  end

  def down
    drop_table :paywalls if table_exists?(:paywalls)
    drop_table :plans if table_exists?(:plans)
  end
end
