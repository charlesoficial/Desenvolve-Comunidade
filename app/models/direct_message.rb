class DirectMessage < ApplicationRecord
  belongs_to :direct_conversation
  belongs_to :sender, class_name: "User"

  validates :body, presence: true
end
