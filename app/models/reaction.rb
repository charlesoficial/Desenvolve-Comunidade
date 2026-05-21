class Reaction < ApplicationRecord
  belongs_to :user
  belongs_to :reactable, polymorphic: true

  validates :emoji, presence: true
end
