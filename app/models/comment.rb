class Comment < ApplicationRecord
  belongs_to :post, counter_cache: true
  belongs_to :user
  belongs_to :parent, class_name: "Comment", optional: true
  has_many :replies, class_name: "Comment", foreign_key: :parent_id, dependent: :destroy, inverse_of: :parent
  has_many :reactions, as: :reactable, dependent: :destroy

  validates :body, presence: true
end
