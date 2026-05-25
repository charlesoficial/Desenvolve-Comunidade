module Api
  module V1
    module Admin
      class AuditLogsController < BaseController
        def index
          page = (params[:page].presence || 1).to_i
          per_page = 25
          scope = current_community ? current_community.audit_logs.recent_first.includes(:actor) : AuditLog.none
          scope = scope.for_action(params[:action_filter]) if params[:action_filter].present?

          total = scope.count
          rows = scope.offset((page - 1) * per_page).limit(per_page)

          render json: {
            logs: rows.map(&:to_admin_hash),
            total: total,
            total_pages: (total.to_f / per_page).ceil,
            page: page,
          }
        end
      end
    end
  end
end
