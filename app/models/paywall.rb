class Paywall < ApplicationRecord
  belongs_to :community

  validates :name, presence: true
  validates :price_cents, numericality: { greater_than_or_equal_to: 0 }
  validates :status, inclusion: { in: %w[active paused archived] }
  validates :interval, inclusion: { in: %w[month year one_time] }
end
