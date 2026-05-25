class User < ApplicationRecord
  has_secure_password validations: false

  has_one :profile, dependent: :destroy
  has_many :memberships, dependent: :destroy
  has_many :communities, through: :memberships
  has_many :posts, dependent: :destroy
  has_many :comments, dependent: :destroy
  has_many :messages, dependent: :destroy
  has_many :direct_conversation_participants, dependent: :destroy
  has_many :direct_conversations, through: :direct_conversation_participants
  has_many :direct_messages, foreign_key: :sender_id, dependent: :destroy, inverse_of: :sender
  has_many :requested_member_connections, class_name: "MemberConnection", foreign_key: :requester_id, dependent: :destroy, inverse_of: :requester
  has_many :received_member_connections, class_name: "MemberConnection", foreign_key: :target_id, dependent: :destroy, inverse_of: :target
  has_many :notifications, dependent: :destroy
  has_many :reactions, dependent: :destroy
  has_many :subscriptions, dependent: :destroy

  validates :email, :username, :display_name, presence: true
  validates :email, :username, uniqueness: true
end
