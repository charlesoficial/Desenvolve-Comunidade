module Api
  module V1
    class DirectConversationsController < ApplicationController
      before_action :require_current_user!
      before_action :set_conversation!, only: [:show, :messages, :read]

      def index
        conversations = DirectConversation
          .for_user(current_user)
          .includes(:last_message, participants: :user)
          .order(Arel.sql("COALESCE(direct_conversations.last_message_at, direct_conversations.created_at) DESC"))

        render json: conversations.map { |conversation| conversation_json(conversation) }
      end

      def show
        render json: conversation_json(@conversation).merge(
          messages: @conversation.messages.includes(:sender).order(:created_at).map { |message| message_json(message) }
        )
      end

      def create
        target = find_target_user!
        conversation = DirectConversation.between(current_user, target)
        created = false

        unless conversation
          conversation = DirectConversation.create!(created_by: current_user, last_message_at: Time.current)
          conversation.participants.create!(user: current_user, last_read_at: Time.current)
          conversation.participants.create!(user: target)
          created = true
        end

        render json: conversation_json(conversation), status: created ? :created : :ok
      end

      def messages
        if request.get?
          render json: @conversation.messages.includes(:sender).order(:created_at).map { |message| message_json(message) }
          return
        end

        message = @conversation.messages.create!(
          sender: current_user,
          body: direct_message_params[:body],
          attachments: direct_message_params[:attachments] || [],
          metadata: direct_message_params[:metadata] || {}
        )
        @conversation.update!(last_message: message, last_message_at: message.created_at)
        participant_for_current_user.update!(last_read_at: Time.current)

        render json: message_json(message), status: :created
      end

      def read
        participant_for_current_user.update!(last_read_at: Time.current)
        render json: conversation_json(@conversation.reload)
      end

      private

      def set_conversation!
        @conversation = DirectConversation
          .for_user(current_user)
          .includes(:last_message, participants: :user)
          .find(params[:id])
      end

      def participant_for_current_user
        @conversation.participants.detect { |participant| participant.user_id == current_user.id } ||
          @conversation.participants.find_by!(user: current_user)
      end

      def other_participant(conversation)
        conversation.participants.detect { |participant| participant.user_id != current_user.id } || conversation.participants.first
      end

      def find_target_user!
        identifier = direct_conversation_params[:user_id].presence || direct_conversation_params[:username].presence
        raise ActiveRecord::RecordNotFound, "target user missing" unless identifier

        User.find_by(id: identifier) ||
          User.find_by(username: identifier) ||
          create_target_user!(identifier)
      end

      def direct_conversation_params
        params.fetch(:direct_conversation, params).permit(:user_id, :username, :name, :avatar_url, :role, :member_status)
      end

      def direct_message_params
        params.require(:direct_message).permit(:body, metadata: {}, attachments: [])
      end

      def conversation_json(conversation)
        participant = other_participant(conversation)
        member = participant&.user || current_user
        current_participant = conversation.participants.detect { |row| row.user_id == current_user.id }
        unread_count = unread_count_for(conversation, current_participant)

        {
          id: conversation.id,
          memberId: member.id,
          memberUsername: member.username,
          memberName: member.display_name,
          memberAvatar: member.avatar_url,
          memberRole: member.role,
          memberStatus: member.status,
          lastMessage: conversation.last_message&.body || "",
          lastMessageAt: (conversation.last_message_at || conversation.created_at).iso8601,
          unread: unread_count.positive?,
          unreadCount: unread_count
        }
      end

      def message_json(message)
        {
          id: message.id,
          conversationId: message.direct_conversation_id,
          memberUsername: message.sender.username,
          author: message.sender_id == current_user.id ? "viewer" : "member",
          body: message.body,
          time: I18n.l(message.created_at, format: "%H:%M"),
          createdAt: message.created_at.iso8601,
          variant: message.metadata["variant"].presence,
          metadata: message.metadata,
          attachments: message.attachments
        }
      end

      def unread_count_for(conversation, participant)
        return 0 unless participant

        scope = conversation.messages.where.not(sender_id: current_user.id)
        scope = scope.where("created_at > ?", participant.last_read_at) if participant.last_read_at
        scope.count
      end

      def create_target_user!(username)
        User.create!(
          email: "#{username}@project-six.local",
          username: username,
          display_name: direct_conversation_params[:name].presence || username,
          avatar_url: direct_conversation_params[:avatar_url],
          role: direct_conversation_params[:role].presence || "member",
          status: direct_conversation_params[:member_status].presence || "offline"
        )
      end
    end
  end
end
