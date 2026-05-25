class AccessGroup < ApplicationRecord
  belongs_to :community
  validates :name, presence: true
  validates :default_role, inclusion: { in: %w[owner admin moderator member] }
end
