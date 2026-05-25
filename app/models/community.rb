class Community < ApplicationRecord
  has_many :spaces, dependent: :destroy
  has_many :memberships, dependent: :destroy
  has_many :users, through: :memberships
  has_many :posts, through: :spaces
  has_many :subscriptions, dependent: :destroy
  has_many :plans, dependent: :destroy
  has_many :paywalls, dependent: :destroy
  has_many :api_tokens, dependent: :destroy
  has_many :ai_knowledge_entries, dependent: :destroy
  has_many :email_templates, dependent: :destroy
  has_many :affiliate_codes, dependent: :destroy
  has_many :upload_catalog_entries, class_name: "UploadCatalogEntry", dependent: :destroy
  has_many :static_pages, dependent: :destroy
  has_many :topics, dependent: :destroy
  has_many :live_streams, dependent: :destroy
  has_many :bulk_action_runs, dependent: :destroy
  has_many :coupons, dependent: :destroy
  has_many :member_tags, dependent: :destroy
  has_many :member_tag_assignments, dependent: :destroy

  validates :name, :slug, presence: true
  validates :slug, uniqueness: true
end
