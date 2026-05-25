module Api
  module V1
    module Admin
      # GET /api/v1/admin/users
      #   ?page=1&per_page=20&q=&status=&role=
      # Retorna paginado pro painel /audience/manage.
      class UsersController < BaseController
        DEFAULT_PER_PAGE = 20
        MAX_PER_PAGE = 100

        def index
          page = [params[:page].to_i, 1].max
          requested_per_page = params[:per_page].to_i
          requested_per_page = DEFAULT_PER_PAGE if requested_per_page <= 0
          per_page = [requested_per_page, MAX_PER_PAGE].min
          q = params[:q].to_s.strip
          status = params[:status].to_s.strip
          role = params[:role].to_s.strip

          scope = User.order(created_at: :desc)
          if q.present?
            scope = scope.where(
              "username ILIKE :q OR display_name ILIKE :q OR email::text ILIKE :q",
              q: "%#{q}%",
            )
          end
          scope = scope.where(status: status) if %w[online offline away].include?(status)
          scope = scope.where(role: role) if %w[owner admin moderator member].include?(role)

          total = scope.count
          users = scope.offset((page - 1) * per_page).limit(per_page)

          render json: {
            page: page,
            per_page: per_page,
            total: total,
            total_pages: (total.to_f / per_page).ceil,
            users: users.map { |user| serialize(user) },
          }
        end

        private

        def serialize(user)
          {
            id: user.id,
            username: user.username,
            display_name: user.display_name,
            email: user.email.to_s,
            avatar_url: user.avatar_url,
            role: user.role,
            status: user.status,
            last_seen_at: user.last_seen_at&.iso8601,
            created_at: user.created_at.iso8601,
          }
        end
      end
    end
  end
end
