class DirectConversation < ApplicationRecord
  belongs_to :created_by, class_name: "User"
  belongs_to :last_message, class_name: "DirectMessage", optional: true

  has_many :participants,
    class_name: "DirectConversationParticipant",
    dependent: :destroy,
    inverse_of: :direct_conversation
  has_many :users, through: :participants
  has_many :messages,
    class_name: "DirectMessage",
    dependent: :destroy,
    inverse_of: :direct_conversation

  validates :created_by, presence: true

  scope :for_user, ->(user) {
    joins(:participants).where(direct_conversation_participants: { user_id: user.id })
  }

  def self.between(first_user, second_user)
    user_ids = [first_user.id, second_user.id]

    joins(:participants)
      .where(direct_conversation_participants: { user_id: user_ids })
      .group("direct_conversations.id")
      .having("COUNT(DISTINCT direct_conversation_participants.user_id) = ?", user_ids.size)
      .order(Arel.sql("(direct_conversations.last_message_id IS NULL) ASC, COALESCE(direct_conversations.last_message_at, direct_conversations.created_at) DESC"))
      .preload(:participants)
      .detect { |conversation| conversation.participants.size == user_ids.size }
  end
end
