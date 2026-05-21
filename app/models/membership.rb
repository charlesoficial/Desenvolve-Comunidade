class Membership < ApplicationRecord
  belongs_to :community
  belongs_to :user

  validates :role, :state, presence: true
end
