module Api
  module V1
    module Admin
      # Moderacao de posts: lista todos os posts da comunidade com filtros
      # e permite deletar em massa via DELETE /bulk com {ids: [uuid]}.
      class PostsController < BaseController
        DEFAULT_PER_PAGE = 25
        MAX_PER_PAGE = 100

        def index
          page = [params[:page].to_i, 1].max
          per_page = params[:per_page].to_i
          per_page = DEFAULT_PER_PAGE if per_page <= 0
          per_page = [per_page, MAX_PER_PAGE].min
          q = params[:q].to_s.strip

          space_ids = current_community ? current_community.spaces.pluck(:id) : []
          scope = Post.where(space_id: space_ids).order(created_at: :desc)
                       .includes(:user, :space)
          scope = scope.where("title ILIKE :q OR body ILIKE :q", q: "%#{q}%") if q.present?

          total = scope.count
          posts = scope.offset((page - 1) * per_page).limit(per_page)

          render json: {
            page: page,
            per_page: per_page,
            total: total,
            total_pages: (total.to_f / per_page).ceil,
            posts: posts.map { |post| serialize(post) },
          }
        end

        def destroy
          post = Post.joins(:space).where(spaces: { community_id: current_community&.id }).find_by(id: params[:id])
          unless post
            render json: { error: "post_not_found" }, status: :not_found
            return
          end
          post.destroy!
          head :no_content
        end

        # POST /bulk com body {ids: ["uuid1", "uuid2"]}
        def bulk_destroy
          ids = Array(params[:ids]).map(&:to_s)
          space_ids = current_community ? current_community.spaces.pluck(:id) : []
          deleted = Post.where(id: ids, space_id: space_ids).destroy_all
          render json: { deleted: deleted.count }
        end

        private

        def serialize(post)
          {
            id: post.id,
            title: post.title.to_s,
            body: post.body.to_s.truncate(160),
            created_at: post.created_at.iso8601,
            published_at: post.published_at&.iso8601,
            space: post.space && { id: post.space.id, name: post.space.name, slug: post.space.slug },
            author: post.user && {
              id: post.user.id,
              username: post.user.username,
              display_name: post.user.display_name,
              avatar_url: post.user.avatar_url,
            },
          }
        end
      end
    end
  end
end
