class AddApiTokens < ActiveRecord::Migration[7.2]
  def up
    return if table_exists?(:api_tokens)

    create_table :api_tokens, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.references :community, type: :uuid, foreign_key: { on_delete: :cascade }, null: false
      t.references :user, type: :uuid, foreign_key: { on_delete: :nullify }
      t.text :name, null: false
      t.text :token_prefix, null: false
      t.text :token_hash, null: false
      t.text :scopes, array: true, default: ["read"], null: false
      t.timestamptz :last_used_at
      t.timestamptz :revoked_at
      t.timestamps default: -> { "now()" }
    end

    add_index :api_tokens, :token_hash, unique: true, if_not_exists: true
  end

  def down
    drop_table :api_tokens if table_exists?(:api_tokens)
  end
end
