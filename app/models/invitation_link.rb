class InvitationLink < ApplicationRecord
  belongs_to :community
  belongs_to :created_by, class_name: "User", optional: true
  belongs_to :plan, optional: true
  belongs_to :member_tag, optional: true

  validates :code, presence: true, uniqueness: { scope: :community_id }
  validates :uses_count, numericality: { greater_than_or_equal_to: 0 }

  before_validation :generate_code_if_missing

  scope :active_only, -> { where(active: true) }

  def expired?
    expires_at.present? && expires_at < Time.current
  end

  def consumed?
    max_uses.present? && uses_count >= max_uses
  end

  def usable?
    active? && !expired? && !consumed?
  end

  def status
    return "inactive" unless active?
    return "expired" if expired?
    return "consumed" if consumed?
    "active"
  end

  def to_admin_hash
    {
      id: id,
      code: code,
      name: name,
      description: description,
      max_uses: max_uses,
      uses_count: uses_count,
      expires_at: expires_at,
      active: active,
      status: status,
      url: "/invite/#{code}",
      plan: plan ? { id: plan.id, name: plan.name } : nil,
      member_tag_id: member_tag_id,
      created_by: created_by ? { id: created_by.id, display_name: created_by.respond_to?(:display_name) ? created_by.display_name : created_by.username } : nil,
      created_at: created_at,
    }
  end

  private

  def generate_code_if_missing
    return if code.present?
    self.code = SecureRandom.alphanumeric(10).downcase
  end
end
