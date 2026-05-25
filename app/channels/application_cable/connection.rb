module ApplicationCable
  class Connection < ActionCable::Connection::Base
    identified_by :current_user

    def connect
      self.current_user = find_verified_user
    end

    private

    def find_verified_user
      user_id = cookies.encrypted[:user_id] || request.session[:user_id]
      user = User.find_by(id: user_id) if user_id.present?

      # Fallback de desenvolvimento: alinhado com ApplicationController.
      user ||= if Rails.env.development? || Rails.env.test?
        User.find_by(username: "vitor-araujo") || User.order(:created_at).first
      end

      reject_unauthorized_connection unless user
      user
    end
  end
end
