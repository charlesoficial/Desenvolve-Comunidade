class Subscription < ApplicationRecord
  belongs_to :user
  belongs_to :community

  validates :provider, :status, presence: true
end
