class OnboardingStep < ApplicationRecord
  belongs_to :community

  STEP_TYPES = %w[welcome form video redirect profile_field].freeze

  validates :title, presence: true
  validates :step_type, inclusion: { in: STEP_TYPES }

  scope :ordered, -> { order(:position, :created_at) }
  scope :active, -> { where(archived: false) }

  def to_admin_hash
    {
      id: id,
      title: title,
      description: description,
      step_type: step_type,
      payload: payload || {},
      required: required,
      position: position,
      archived: archived,
    }
  end
end
