class AddProfileFieldsInvitationLinksAuditLogs < ActiveRecord::Migration[7.2]
  def change
    create_table :profile_field_definitions, id: :uuid do |t|
      t.references :community, type: :uuid, null: false, foreign_key: true
      t.string :key, null: false
      t.string :label, null: false
      t.string :field_type, null: false, default: "text" # text, number, dropdown, multi_select, date, url
      t.string :placeholder
      t.text :help_text
      t.boolean :required, null: false, default: false
      t.boolean :show_in_onboarding, null: false, default: false
      t.string :visibility, null: false, default: "members" # public, members, admin
      t.jsonb :options, null: false, default: []
      t.integer :position, null: false, default: 0
      t.boolean :archived, null: false, default: false
      t.timestamps
      t.index [:community_id, :key], unique: true
      t.index [:community_id, :position]
    end

    create_table :invitation_links, id: :uuid do |t|
      t.references :community, type: :uuid, null: false, foreign_key: true
      t.references :created_by, type: :uuid, null: true, foreign_key: { to_table: :users }
      t.references :plan, type: :uuid, null: true, foreign_key: true
      t.string :code, null: false
      t.string :name
      t.text :description
      t.uuid :member_tag_id
      t.integer :max_uses
      t.integer :uses_count, null: false, default: 0
      t.datetime :expires_at
      t.boolean :active, null: false, default: true
      t.timestamps
      t.index [:community_id, :code], unique: true
      t.index :expires_at
    end

    create_table :audit_logs, id: :uuid do |t|
      t.references :community, type: :uuid, null: false, foreign_key: true
      t.references :actor, type: :uuid, null: true, foreign_key: { to_table: :users }
      t.string :action, null: false
      t.string :target_type
      t.uuid :target_id
      t.jsonb :metadata, null: false, default: {}
      t.string :ip_address
      t.text :user_agent
      t.datetime :created_at, null: false
      t.index [:community_id, :created_at]
      t.index [:community_id, :action]
      t.index [:target_type, :target_id]
    end
  end
end
