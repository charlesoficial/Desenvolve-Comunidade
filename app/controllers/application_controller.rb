class ApplicationController < ActionController::Base
  protect_from_forgery with: :null_session, if: -> { request.format.json? }

  private

  def current_user
    @current_user ||= begin
      session_user = User.find_by(id: session[:user_id]) if session[:user_id].present?
      if session_user
        session_user
      elsif Rails.env.development? || Rails.env.test?
        User.find_by(username: "vitor-araujo") || User.order(:created_at).first
      end
    end
  end

  def require_current_user!
    return if current_user

    render json: { error: "unauthenticated" }, status: :unauthorized
  end
end
