module Api
  module V1
    module Admin
      # Registros das acoes em massa executadas pelo admin (excluir posts,
      # banir membros, importar CSV). Logs com filtros aplicados e contagem.
      class BulkActionsController < BaseController
        ACTIONS = %w[delete_posts ban_members import_members export_members notify_all].freeze

        def index
          rows = current_community ? current_community.bulk_action_runs.order(created_at: :desc).limit(200).includes(:user) : []
          render json: rows.map { |row| serialize(row) }
        end

        def create
          action = params.dig(:bulk_action, :action).to_s
          unless ACTIONS.include?(action)
            render json: { error: "unsupported_action", valid: ACTIONS }, status: :unprocessable_entity
            return
          end

          run = current_community.bulk_action_runs.create!(
            user: current_user,
            action: action,
            target: params.dig(:bulk_action, :target).to_s.presence || action.split("_").last,
            filters: params.dig(:bulk_action, :filters).is_a?(ActionController::Parameters) ? params.dig(:bulk_action, :filters).to_unsafe_h : {},
            affected_count: params.dig(:bulk_action, :affected_count).to_i,
            status: params.dig(:bulk_action, :status).to_s.presence || "pending",
          )

          render json: serialize(run), status: :created
        end

        private

        def serialize(run)
          {
            id: run.id,
            action: run.action,
            target: run.target,
            filters: run.filters,
            affected_count: run.affected_count,
            status: run.status,
            created_at: run.created_at.iso8601,
            finished_at: run.finished_at&.iso8601,
            user: run.user && {
              username: run.user.username,
              display_name: run.user.display_name,
            },
          }
        end
      end
    end
  end
end
