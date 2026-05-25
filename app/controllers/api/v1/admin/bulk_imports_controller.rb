module Api
  module V1
    module Admin
      class BulkImportsController < BaseController
        # Reaproveita BulkActionRun com action="member_import" para representar uploads de CSV.
        def index
          rows = current_community ? current_community.bulk_action_runs.where(action: "member_import").order(created_at: :desc) : []
          render json: rows.map { |row| serialize(row) }
        end

        def create
          run = current_community.bulk_action_runs.build(
            action: "member_import",
            target: "users",
            status: "pending",
            filters: payload,
          )
          if run.save
            render json: serialize(run), status: :created
          else
            render json: { errors: run.errors }, status: :unprocessable_entity
          end
        end

        private

        def payload
          {
            file_name: params[:file_name],
            total_rows: params[:total_rows],
            tags: Array(params[:tags]),
            plan_id: params[:plan_id],
            note: params[:note],
          }
        end

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
