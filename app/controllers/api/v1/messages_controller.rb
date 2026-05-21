module Api
  module V1
    class MessagesController < ApplicationController
      before_action :require_current_user!, only: [:create]

      def index
        space = Space.find_by!(slug: params[:space_id] || "chat-geral")
        messages = space.messages.includes(:user).order(:created_at).last(80)
        render json: messages.map { |message| MessageSerializer.new(message).as_json }
      end

      def create
        space = find_space!
        message = space.messages.create!(
          user: current_user,
          body: message_params[:body],
          parent_id: message_params[:parent_id]
        )
        render json: MessageSerializer.new(message).as_json, status: :created
      end

      private

      def message_params
        params.require(:message).permit(:space_id, :space_slug, :body, :parent_id)
      end

      def find_space!
        return Space.find(message_params[:space_id]) if message_params[:space_id].present?

        Space.find_by!(slug: message_params[:space_slug] || "chat-geral")
      end
    end
  end
end
