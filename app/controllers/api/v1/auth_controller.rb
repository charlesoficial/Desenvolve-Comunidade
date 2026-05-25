module Api
  module V1
    class AuthController < ApplicationController
      def show
        if current_user
          render json: { user: UserSerializer.new(current_user).as_json }
        else
          render json: { user: nil }
        end
      end

      def create
        email = params[:email].to_s.downcase.strip
        password = params[:password].to_s

        user = User.find_by(email: email) if email.present?

        if user && user.password_digest.present? && user.authenticate(password)
          session[:user_id] = user.id
          user.update_columns(status: "online", last_seen_at: Time.current)
          render json: { user: UserSerializer.new(user).as_json }
        else
          render json: { error: "invalid_credentials" }, status: :unauthorized
        end
      end

      def destroy
        if current_user
          current_user.update_columns(status: "offline", last_seen_at: Time.current)
        end
        session.delete(:user_id)
        head :no_content
      end

      def signup
        email = params[:email].to_s.downcase.strip
        username = params[:username].to_s.strip
        display_name = params[:display_name].to_s.strip.presence || username
        password = params[:password].to_s

        if password.length < 8
          return render json: { error: "password_too_short" }, status: :unprocessable_entity
        end

        user = User.new(
          email: email,
          username: username,
          display_name: display_name,
          password: password,
          role: "member",
          status: "online",
          last_seen_at: Time.current
        )

        if user.save
          session[:user_id] = user.id
          render json: { user: UserSerializer.new(user).as_json }, status: :created
        else
          render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
        end
      end
    end
  end
end
