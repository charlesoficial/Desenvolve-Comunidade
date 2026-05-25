class AddOnboardingPaywallGroupsAiInbox < ActiveRecord::Migration[7.2]
  def change
    create_table :onboarding_steps, id: :uuid do |t|
      t.references :community, type: :uuid, null: false, foreign_key: true
      t.string :title, null: false
      t.text :description
      t.string :step_type, null: false, default: "form" # form, welcome, video, redirect, profile_field
      t.jsonb :payload, null: false, default: {}
      t.boolean :required, null: false, default: true
      t.integer :position, null: false, default: 0
      t.boolean :archived, null: false, default: false
      t.timestamps
      t.index [:community_id, :position]
    end

    create_table :paywall_groups, id: :uuid do |t|
      t.references :community, type: :uuid, null: false, foreign_key: true
      t.string :name, null: false
      t.text :description
      t.integer :price_cents, null: false, default: 0
      t.string :currency, null: false, default: "BRL"
      t.string :interval, null: false, default: "month"
      t.integer :trial_days, null: false, default: 0
      t.uuid :paywall_ids, null: false, array: true, default: []
      t.boolean :active, null: false, default: true
      t.timestamps
    end

    create_table :tax_settings, id: :uuid do |t|
      t.references :community, type: :uuid, null: false, foreign_key: true, index: { unique: true }
      t.string :model, null: false, default: "inclusive" # inclusive, additive
      t.boolean :enabled, null: false, default: false
      t.boolean :auto_calculate, null: false, default: false
      t.string :default_country, null: false, default: "BR"
      t.jsonb :rates, null: false, default: []
      t.timestamps
    end

    create_table :ai_conversations, id: :uuid do |t|
      t.references :community, type: :uuid, null: false, foreign_key: true
      t.references :user, type: :uuid, null: true, foreign_key: true
      t.string :status, null: false, default: "open" # open, resolved, escalated
      t.string :last_question
      t.text :last_answer
      t.integer :turns_count, null: false, default: 0
      t.string :rating # positive, negative
      t.boolean :converted_to_kb, null: false, default: false
      t.timestamps
      t.index [:community_id, :created_at]
      t.index [:community_id, :status]
    end
  end
end
