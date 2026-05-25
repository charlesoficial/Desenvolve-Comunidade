require "digest"
require "securerandom"

class ApiToken < ApplicationRecord
  TOKEN_PREFIX = "cm_".freeze
  AVAILABLE_SCOPES = %w[read write admin].freeze

  belongs_to :community
  belongs_to :user, optional: true

  validates :name, presence: true
  validate  :scopes_valid?

  attribute :raw_token, :string

  scope :active, -> { where(revoked_at: nil) }

  # Cria um token novo. Retorna o registro com `raw_token` populado uma
  # unica vez (so pode ser exibido no momento da criacao).
  def self.issue!(community:, user: nil, name:, scopes: ["read"])
    raw = "#{TOKEN_PREFIX}#{SecureRandom.urlsafe_base64(32)}"
    record = create!(
      community: community,
      user: user,
      name: name,
      token_prefix: raw[0, 12],
      token_hash: Digest::SHA256.hexdigest(raw),
      scopes: scopes & AVAILABLE_SCOPES,
    )
    record.raw_token = raw
    record
  end

  def self.find_by_raw(raw)
    return nil if raw.blank?

    active.find_by(token_hash: Digest::SHA256.hexdigest(raw))
  end

  def revoked?
    revoked_at.present?
  end

  def revoke!
    update!(revoked_at: Time.current)
  end

  private

  def scopes_valid?
    invalid = (scopes || []) - AVAILABLE_SCOPES
    errors.add(:scopes, "invalid: #{invalid.join(', ')}") if invalid.any?
  end
end
