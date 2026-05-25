class ApplicationController < ActionController::Base
  protect_from_forgery with: :null_session, if: -> { request.format.json? }

  private

  def current_user
    @current_user ||= resolve_current_user
  end

  def require_current_user!
    return if current_user

    render json: { error: "unauthenticated" }, status: :unauthorized
  end

  def resolve_current_user
    # Tentamos resolver o usuario por sessao Rails primeiro,
    # depois pelo email do JWT do Supabase, e por fim pelo fallback de dev.

    # 1) Sessao Rails (auth bcrypt direto na nossa API).
    if session[:user_id].present?
      user = User.find_by(id: session[:user_id])
      return user if user
    end

    # 2) Header Authorization com JWT do Supabase.
    if (email = supabase_jwt_email).present?
      user = User.find_by(email: email)
      return user if user
    end

    # 3) Fallback de desenvolvimento, equivalente ao seed.
    if Rails.env.development? || Rails.env.test?
      return User.find_by(username: "vitor-araujo") || User.order(:created_at).first
    end

    nil
  end

  def supabase_jwt_email
    header = request.headers["Authorization"].to_s
    return nil unless header.start_with?("Bearer ")

    token = header.split(" ", 2).last
    payload_b64 = token.split(".")[1]
    return nil unless payload_b64

    json = Base64.urlsafe_decode64(payload_b64.tr("-_", "+/").ljust(payload_b64.length + (4 - payload_b64.length % 4) % 4, "="))
    payload = JSON.parse(json)
    payload["email"]
  rescue StandardError
    nil
  end
end
