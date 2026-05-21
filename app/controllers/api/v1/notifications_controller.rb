module Api
  module V1
    class NotificationsController < ApplicationController
      before_action :require_current_user!

      def index
        notifications = current_user.notifications.order(created_at: :desc).limit(50)
        render json: notifications.map { |notification| notification_json(notification) }
      end

      def update
        notification = current_user.notifications.find(params[:id])
        notification.update!(read_at: Time.current)
        render json: notification_json(notification)
      end

      def mark_all_read
        updated = current_user.notifications.where(read_at: nil).update_all(read_at: Time.current, updated_at: Time.current)
        render json: { updated: updated }
      end

      def archive
        notification = current_user.notifications.find(params[:id])
        notification.update!(metadata: notification.metadata.merge("archived" => true))
        render json: notification_json(notification)
      end

      private

      def notification_json(notification)
        {
          id: notification.id,
          kind: notification.kind,
          title: notification.title,
          body: notification.body,
          read_at: notification.read_at,
          created_at: notification.created_at,
          metadata: notification.metadata
        }
      end
    end
  end
end
