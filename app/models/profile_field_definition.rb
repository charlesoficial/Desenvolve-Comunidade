class ProfileFieldDefinition < ApplicationRecord
  belongs_to :community

  FIELD_TYPES = %w[text number dropdown multi_select date url textarea].freeze
  VISIBILITIES = %w[public members admin].freeze

  validates :key, presence: true, format: { with: /\A[a-z0-9_]+\z/ }, uniqueness: { scope: :community_id }
  validates :label, presence: true
  validates :field_type, inclusion: { in: FIELD_TYPES }
  validates :visibility, inclusion: { in: VISIBILITIES }

  scope :ordered, -> { order(:position, :created_at) }
  scope :active, -> { where(archived: false) }

  def to_admin_hash
    {
      id: id,
      key: key,
      label: label,
      field_type: field_type,
      placeholder: placeholder,
      help_text: help_text,
      required: required,
      show_in_onboarding: show_in_onboarding,
      visibility: visibility,
      options: options || [],
      position: position,
      archived: archived,
    }
  end
end
