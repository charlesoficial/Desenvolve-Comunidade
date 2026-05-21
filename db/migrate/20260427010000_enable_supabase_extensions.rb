class EnableSupabaseExtensions < ActiveRecord::Migration[7.1]
  def change
    enable_extension "pgcrypto" unless extension_enabled?("pgcrypto")
    execute "CREATE EXTENSION IF NOT EXISTS citext"
  end
end
