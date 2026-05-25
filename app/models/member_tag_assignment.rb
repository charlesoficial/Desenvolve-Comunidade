class MemberTagAssignment < ApplicationRecord
  belongs_to :community
  belongs_to :member_tag
  belongs_to :user

  validates :user_id, uniqueness: { scope: :member_tag_id }
end
