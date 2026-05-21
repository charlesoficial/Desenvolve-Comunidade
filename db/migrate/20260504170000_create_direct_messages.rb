class CreateDirectMessages < ActiveRecord::Migration[7.1]
  def change
    create_table :direct_conversations, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.references :created_by, null: false, foreign_key: { to_table: :users }, type: :uuid
      t.uuid :last_message_id
      t.datetime :last_message_at
      t.timestamps
    end

    add_index :direct_conversations, :last_message_at

    create_table :direct_conversation_participants, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.references :direct_conversation, null: false, foreign_key: true, type: :uuid
      t.references :user, null: false, foreign_key: true, type: :uuid
      t.datetime :last_read_at
      t.datetime :muted_at
      t.datetime :archived_at
      t.timestamps
    end

    add_index :direct_conversation_participants,
      [:direct_conversation_id, :user_id],
      unique: true,
      name: "index_direct_participants_unique_user"
    add_index :direct_conversation_participants, [:user_id, :archived_at]

    create_table :direct_messages, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.references :direct_conversation, null: false, foreign_key: true, type: :uuid
      t.references :sender, null: false, foreign_key: { to_table: :users }, type: :uuid
      t.text :body, null: false
      t.jsonb :metadata, null: false, default: {}
      t.jsonb :attachments, null: false, default: []
      t.datetime :edited_at
      t.datetime :deleted_at
      t.timestamps
    end

    add_index :direct_messages, [:direct_conversation_id, :created_at]
    add_foreign_key :direct_conversations, :direct_messages, column: :last_message_id

    unless table_exists?(:member_connections)
      create_table :member_connections, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
        t.references :requester, null: false, foreign_key: { to_table: :users }, type: :uuid
        t.references :target, null: false, foreign_key: { to_table: :users }, type: :uuid
        t.string :status, null: false, default: "pending"
        t.text :message
        t.datetime :accepted_at
        t.datetime :rejected_at
        t.timestamps
      end

      add_index :member_connections,
        [:requester_id, :target_id],
        unique: true,
        name: "index_member_connections_unique_pair"
      add_index :member_connections, [:target_id, :status]
    end
  end
end
