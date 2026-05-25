class AiConversation < ApplicationRecord
  belongs_to :community
  belongs_to :user, optional: true

  STATUSES = %w[open resolved escalated].freeze

  validates :status, inclusion: { in: STATUSES }

  scope :recent, -> { order(created_at: :desc) }

  def to_admin_hash
    {
      id: id,
      status: status,
      last_question: last_question,
      last_answer: last_answer,
      turns_count: turns_count,
      rating: rating,
      converted_to_kb: converted_to_kb,
      created_at: created_at,
      updated_at: updated_at,
      user: user ? {
        id: user.id,
        username: user.username,
        display_name: user.respond_to?(:display_name) ? user.display_name : user.username,
        email: user.email,
      } : nil,
    }
  end
end
