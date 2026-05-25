class Plan < ApplicationRecord
  belongs_to :community
  has_many :subscriptions, dependent: :nullify

  validates :name, presence: true
  validates :price_cents, numericality: { greater_than_or_equal_to: 0 }
  validates :interval, inclusion: { in: %w[month year one_time] }

  scope :ordered, -> { order(:position, :created_at) }
end
