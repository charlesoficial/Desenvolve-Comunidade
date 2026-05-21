class Message < ApplicationRecord
  belongs_to :space
  belongs_to :user
  belongs_to :parent, class_name: "Message", optional: true
  has_many :replies, class_name: "Message", foreign_key: :parent_id, dependent: :destroy, inverse_of: :parent

  validates :body, presence: true
end
