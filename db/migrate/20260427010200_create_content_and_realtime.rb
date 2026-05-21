class CreateContentAndRealtime < ActiveRecord::Migration[7.1]
  def change
    create_table :posts, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.references :space, null: false, foreign_key: true, type: :uuid
      t.references :user, null: false, foreign_key: true, type: :uuid
      t.string :title, null: false
      t.text :body, null: false
      t.string :status, null: false, default: "published"
      t.datetime :published_at
      t.integer :comments_count, null: false, default: 0
      t.integer :reactions_count, null: false, default: 0
      t.boolean :pinned, null: false, default: false
      t.jsonb :metadata, null: false, default: {}
      t.timestamps
    end

    add_index :posts, [:space_id, :published_at]
    add_index :posts, :status

    create_table :comments, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.references :post, null: false, foreign_key: true, type: :uuid
      t.references :user, null: false, foreign_key: true, type: :uuid
      t.references :parent, foreign_key: { to_table: :comments }, type: :uuid
      t.text :body, null: false
      t.integer :reactions_count, null: false, default: 0
      t.timestamps
    end

    add_index :comments, [:post_id, :created_at]

    create_table :messages, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.references :space, null: false, foreign_key: true, type: :uuid
      t.references :user, null: false, foreign_key: true, type: :uuid
      t.references :parent, foreign_key: { to_table: :messages }, type: :uuid
      t.text :body, null: false
      t.jsonb :attachments, null: false, default: []
      t.datetime :edited_at
      t.timestamps
    end

    add_index :messages, [:space_id, :created_at]

    create_table :reactions, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.references :user, null: false, foreign_key: true, type: :uuid
      t.string :reactable_type, null: false
      t.uuid :reactable_id, null: false
      t.string :emoji, null: false, default: "like"
      t.timestamps
    end

    add_index :reactions, [:reactable_type, :reactable_id]
    add_index :reactions, [:user_id, :reactable_type, :reactable_id, :emoji], unique: true, name: "index_reactions_unique_user_reactable_emoji"

    create_table :notifications, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.references :user, null: false, foreign_key: true, type: :uuid
      t.string :kind, null: false
      t.string :title, null: false
      t.text :body
      t.string :record_type
      t.uuid :record_id
      t.datetime :read_at
      t.jsonb :metadata, null: false, default: {}
      t.timestamps
    end

    add_index :notifications, [:user_id, :read_at]
  end
end
