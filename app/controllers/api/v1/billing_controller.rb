module Api
  module V1
    class BillingController < ApplicationController
      before_action :require_current_user!

      def show
        subscription = current_user.subscriptions.order(created_at: :desc).first
        render json: {
          status: subscription&.status || "inactive",
          current_period_end: subscription&.current_period_end
        }
      end

      def create
        render json: { error: "billing_not_configured" }, status: :not_implemented
      end
    end
  end
end
