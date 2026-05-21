class MemberConnection < ApplicationRecord
  STATUSES = %w[pending accepted rejected blocked connected].freeze

  belongs_to :requester, class_name: "User"
  belongs_to :target, class_name: "User"

  validates :requester_id, uniqueness: { scope: :target_id }
  validates :status, inclusion: { in: STATUSES }
  validate :different_users

  private

  def different_users
    errors.add(:target_id, "must be different from requester") if requester_id == target_id
  end
end
