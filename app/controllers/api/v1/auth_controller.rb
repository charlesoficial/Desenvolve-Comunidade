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
        render json: { error: "auth_not_configured" }, status: :not_implemented
      end

      def destroy
        head :no_content
      end
    end
  end
end
