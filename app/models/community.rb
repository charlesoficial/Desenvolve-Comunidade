class Community < ApplicationRecord
  has_many :spaces, dependent: :destroy
  has_many :memberships, dependent: :destroy
  has_many :users, through: :memberships
  has_many :posts, through: :spaces
  has_many :subscriptions, dependent: :destroy
  has_many :plans, dependent: :destroy
  has_many :paywalls, dependent: :destroy

  validates :name, :slug, presence: true
  validates :slug, uniqueness: true
end
