class AffiliateCode < ApplicationRecord
  belongs_to :community
  belongs_to :user

  validates :code, presence: true, uniqueness: { scope: :community_id }
  validates :user_id, uniqueness: { scope: :community_id }
end
