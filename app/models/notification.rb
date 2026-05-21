class Notification < ApplicationRecord
  belongs_to :user

  validates :kind, :title, presence: true
end
