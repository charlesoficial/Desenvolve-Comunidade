class EmailTemplate < ApplicationRecord
  belongs_to :community
  validates :key, :subject, presence: true
end
