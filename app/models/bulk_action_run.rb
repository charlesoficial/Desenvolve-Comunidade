class BulkActionRun < ApplicationRecord
  belongs_to :community
  belongs_to :user, optional: true
  validates :action, :target, :status, presence: true
end
