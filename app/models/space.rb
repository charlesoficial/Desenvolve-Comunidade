class Space < ApplicationRecord
  belongs_to :community
  belongs_to :parent, class_name: "Space", optional: true
  has_many :children, class_name: "Space", foreign_key: :parent_id, dependent: :destroy, inverse_of: :parent
  has_many :posts, dependent: :destroy
  has_many :messages, dependent: :destroy

  validates :name, :slug, :kind, presence: true
  validates :slug, uniqueness: { scope: :community_id }

  scope :ordered, -> { order(:position, :created_at) }
end
