module Api
  module V1
    class MemberConnectionsController < ApplicationController
      before_action :require_current_user!

      def index
        connections = MemberConnection
          .includes(:requester, :target)
          .where("requester_id = :user_id OR target_id = :user_id", user_id: current_user.id)

        render json: connections.map { |connection| connection_json(connection) }
      end

      def create
        target = find_target_user!
        connection = MemberConnection.find_or_initialize_by(requester: current_user, target:)
        connection.message = member_connection_params[:message] if member_connection_params.key?(:message)
        connection.status = "pending" if connection.new_record? || %w[rejected blocked].include?(connection.status)
        connection.rejected_at = nil if connection.status == "pending"
        connection.save!

        render json: connection_json(connection), status: connection.previously_new_record? ? :created : :ok
      end

      def update
        connection = MemberConnection
          .where("requester_id = :user_id OR target_id = :user_id", user_id: current_user.id)
          .find(params[:id])

        status = member_connection_params[:status]
        raise ActionController::BadRequest, "invalid status" unless MemberConnection::STATUSES.include?(status)

        connection.status = status
        connection.accepted_at = Time.current if status == "accepted"
        connection.rejected_at = Time.current if status == "rejected"
        connection.save!

        render json: connection_json(connection)
      end

      private

      def find_target_user!
        identifier = member_connection_params[:target_id].presence || member_connection_params[:target_username].presence
        raise ActiveRecord::RecordNotFound, "target user missing" unless identifier

        User.find_by(id: identifier) ||
          User.find_by(username: identifier) ||
          create_target_user!(identifier)
      end

      def member_connection_params
        params.fetch(:member_connection, params).permit(:target_id, :target_username, :name, :avatar_url, :role, :status, :member_status, :message)
      end

      def connection_json(connection)
        {
          id: connection.id,
          requesterUsername: connection.requester.username,
          targetUsername: connection.target.username,
          status: connection.status,
          message: connection.message,
          acceptedAt: connection.accepted_at&.iso8601,
          rejectedAt: connection.rejected_at&.iso8601,
          createdAt: connection.created_at.iso8601
        }
      end

      def create_target_user!(username)
        User.create!(
          email: "#{username}@project-six.local",
          username: username,
          display_name: member_connection_params[:name].presence || username,
          avatar_url: member_connection_params[:avatar_url],
          role: member_connection_params[:role].presence || "member",
          status: member_connection_params[:member_status].presence || "offline"
        )
      end
    end
  end
end
