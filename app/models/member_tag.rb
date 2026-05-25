class MemberTag < ApplicationRecord
  belongs_to :community
  has_many :member_tag_assignments, dependent: :destroy
  has_many :users, through: :member_tag_assignments

  validates :name, presence: true
  validates :name, uniqueness: { scope: :community_id, case_sensitive: false }
end
