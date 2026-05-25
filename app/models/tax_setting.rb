class TaxSetting < ApplicationRecord
  belongs_to :community

  MODELS = %w[inclusive additive].freeze

  validates :model, inclusion: { in: MODELS }

  def to_admin_hash
    {
      id: id,
      enabled: enabled,
      model: model,
      auto_calculate: auto_calculate,
      default_country: default_country,
      rates: rates || [],
      updated_at: updated_at,
    }
  end
end
