class Coupon < ApplicationRecord
  belongs_to :community
  belongs_to :paywall, optional: true
  belongs_to :plan, optional: true

  validates :code, presence: true
  validates :discount_type, inclusion: { in: %w[percent fixed] }
  validates :applies_to, inclusion: { in: %w[all paywall plan] }
  validates :discount_value, numericality: { greater_than_or_equal_to: 0 }

  before_validation :normalize_code

  def expired?
    expires_at.present? && expires_at < Time.current
  end

  def maxed?
    max_uses.present? && used_count >= max_uses
  end

  def usable?
    active? && !expired? && !maxed?
  end

  private

  def normalize_code
    self.code = code.to_s.upcase.strip
  end
end
