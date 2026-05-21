module Api
  module V1
    class UploadsController < ApplicationController
      before_action :require_current_user!

      def create
        render json: { error: "uploads_not_configured" }, status: :not_implemented
      end
    end
  end
end
