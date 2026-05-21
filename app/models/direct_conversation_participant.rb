class DirectConversationParticipant < ApplicationRecord
  belongs_to :direct_conversation
  belongs_to :user

  validates :user_id, uniqueness: { scope: :direct_conversation_id }
end
