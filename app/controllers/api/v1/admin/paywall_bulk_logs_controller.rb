module Api
  module V1
    module Admin
      # Acoes em massa relacionadas a paywalls/assinaturas, lidas de bulk_action_runs.
      class PaywallBulkLogsController < BaseController
        PAYWALL_ACTIONS = %w[
          paywall_bulk_cancel
          paywall_bulk_pause
          paywall_bulk_discount
          paywall_bulk_export
          subscription_bulk_cancel
        ].freeze

        def index
          rows = if current_community
                   current_community.bulk_action_runs.where(action: PAYWALL_ACTIONS).order(created_at: :desc)
                 else
                   []
                 end
          render json: rows.map { |row| serialize(row) }
        end

        private

        def serialize(run)
          {
            id: run.id,
            action: run.action,
            target: run.target,
            status: run.status,
            filters: run.filters || {},
            affected_count: run.affected_count,
            finished_at: run.finished_at,
            created_at: run.created_at,
          }
        end
      end
    end
  end
end
