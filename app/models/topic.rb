class Topic < ApplicationRecord
  belongs_to :community
  validates :name, :slug, presence: true
  validates :slug, uniqueness: { scope: :community_id }

  before_validation :ensure_slug

  private

  def ensure_slug
    self.slug = name.to_s.parameterize if slug.blank? && name.present?
  end
end
