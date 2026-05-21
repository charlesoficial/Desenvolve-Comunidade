class Course < ApplicationRecord
  belongs_to :community
  has_many :lessons, dependent: :destroy

  validates :title, :slug, presence: true
  validates :slug, uniqueness: { scope: :community_id }
end
