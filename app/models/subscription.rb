class Subscription < ApplicationRecord
  belongs_to :user
  belongs_to :community
  belongs_to :plan, optional: true

  validates :provider, :status, presence: true
end
