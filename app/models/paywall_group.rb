class PaywallGroup < ApplicationRecord
  belongs_to :community

  validates :name, presence: true
  validates :price_cents, numericality: { greater_than_or_equal_to: 0 }
  validates :interval, inclusion: { in: %w[month year one_time] }
  validates :trial_days, numericality: { greater_than_or_equal_to: 0 }

  scope :active_only, -> { where(active: true) }

  def paywalls
    return [] if paywall_ids.blank?
    community.paywalls.where(id: paywall_ids)
  end

  def to_admin_hash
    {
      id: id,
      name: name,
      description: description,
      price_cents: price_cents,
      currency: currency,
      interval: interval,
      trial_days: trial_days,
      paywall_ids: paywall_ids || [],
      paywall_count: (paywall_ids || []).size,
      paywalls: paywalls.map { |p| { id: p.id, name: p.name, price_cents: p.price_cents } },
      active: active,
      created_at: created_at,
    }
  end
end
