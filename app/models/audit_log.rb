class AuditLog < ApplicationRecord
  belongs_to :community
  belongs_to :actor, class_name: "User", optional: true

  validates :action, presence: true

  scope :recent_first, -> { order(created_at: :desc) }
  scope :for_action, ->(action) { where(action: action) if action.present? }

  def to_admin_hash
    {
      id: id,
      action: action,
      target_type: target_type,
      target_id: target_id,
      metadata: metadata || {},
      ip_address: ip_address,
      user_agent: user_agent,
      actor: actor ? {
        id: actor.id,
        display_name: actor.respond_to?(:display_name) ? actor.display_name : actor.username,
        username: actor.username,
        email: actor.email,
      } : nil,
      created_at: created_at,
    }
  end

  def self.record!(community:, actor:, action:, target: nil, metadata: {}, request: nil)
    create!(
      community: community,
      actor: actor,
      action: action,
      target_type: target&.class&.name,
      target_id: target&.id,
      metadata: metadata.to_h,
      ip_address: request&.remote_ip,
      user_agent: request&.user_agent,
    )
  rescue ActiveRecord::RecordInvalid => e
    Rails.logger.warn("AuditLog falhou: #{e.message}")
    nil
  end
end
