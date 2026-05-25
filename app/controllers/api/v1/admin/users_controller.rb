module Api
  module V1
    module Admin
      # GET   /api/v1/admin/users
      #   ?page=1&per_page=20&q=&status=&role=
      # GET   /api/v1/admin/users/:id  -> detalhe
      # PATCH /api/v1/admin/users/:id  -> atualiza role/status
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

        def show
          user = User.find_by(id: params[:id])
          unless user
            render json: { error: "user_not_found" }, status: :not_found
            return
          end
          render json: serialize(user, detail: true)
        end

        def update
          user = User.find_by(id: params[:id])
          unless user
            render json: { error: "user_not_found" }, status: :not_found
            return
          end

          attrs = params.require(:user).permit(:role, :status, :display_name)
          if attrs[:role].present? && !%w[owner admin moderator member].include?(attrs[:role])
            render json: { error: "invalid_role" }, status: :unprocessable_entity
            return
          end

          if attrs[:status].present? && !%w[online offline away].include?(attrs[:status])
            render json: { error: "invalid_status" }, status: :unprocessable_entity
            return
          end

          user.update!(attrs)
          render json: serialize(user, detail: true)
        end

        private

        def serialize(user, detail: false)
          base = {
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
          return base unless detail

          base.merge(
            posts_count: user.posts.count,
            comments_count: user.comments.count,
            connections_count: user.requested_member_connections.count + user.received_member_connections.count,
          )
        end
      end
    end
  end
end
