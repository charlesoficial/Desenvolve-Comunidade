class CreateCommerceAndCourses < ActiveRecord::Migration[7.1]
  def change
    create_table :subscriptions, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.references :user, null: false, foreign_key: true, type: :uuid
      t.references :community, null: false, foreign_key: true, type: :uuid
      t.string :provider, null: false, default: "stripe"
      t.string :provider_customer_id
      t.string :provider_subscription_id
      t.string :status, null: false, default: "inactive"
      t.datetime :current_period_end
      t.jsonb :metadata, null: false, default: {}
      t.timestamps
    end

    add_index :subscriptions, :provider_subscription_id

    create_table :courses, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.references :community, null: false, foreign_key: true, type: :uuid
      t.string :title, null: false
      t.string :slug, null: false
      t.text :description
      t.integer :position, null: false, default: 0
      t.boolean :published, null: false, default: false
      t.timestamps
    end

    add_index :courses, [:community_id, :slug], unique: true

    create_table :lessons, id: :uuid, default: -> { "gen_random_uuid()" } do |t|
      t.references :course, null: false, foreign_key: true, type: :uuid
      t.string :title, null: false
      t.string :slug, null: false
      t.text :body
      t.string :video_url
      t.integer :position, null: false, default: 0
      t.boolean :published, null: false, default: false
      t.timestamps
    end

    add_index :lessons, [:course_id, :slug], unique: true
  end
end
