class LiveStream < ApplicationRecord
  belongs_to :community
  belongs_to :user, optional: true
  validates :title, :starts_at, presence: true
  validates :status, inclusion: { in: %w[scheduled live ended cancelled] }
end
