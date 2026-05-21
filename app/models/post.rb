class Post < ApplicationRecord
  belongs_to :space
  belongs_to :user
  has_many :comments, dependent: :destroy
  has_many :reactions, as: :reactable, dependent: :destroy

  validates :title, :body, presence: true

  scope :published, -> { where(status: "published") }
  scope :recent_first, -> { order(published_at: :desc, created_at: :desc) }
end
