module Api
  module V1
    module Admin
      # Base para todos os endpoints administrativos.
      # Garante que so usuarios com role "owner" ou "admin" podem
      # acessar /api/v1/admin/*.
      class BaseController < ApplicationController
        before_action :require_admin!

        private

        def require_admin!
          return if current_user && %w[owner admin].include?(current_user.role)

          render json: { error: "forbidden" }, status: :forbidden
        end

        def current_community
          @current_community ||= Community.order(:created_at).first
        end
      end
    end
  end
end
