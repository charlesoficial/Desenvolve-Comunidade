class StaticPage < ApplicationRecord
  belongs_to :community
  validates :title, :slug, presence: true
  validates :slug, uniqueness: { scope: :community_id }

  before_validation :ensure_slug

  private

  def ensure_slug
    self.slug = title.to_s.parameterize if slug.blank? && title.present?
  end
end
