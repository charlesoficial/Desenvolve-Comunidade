module Api
  module V1
    module Admin
      # GET    /api/v1/admin/spaces            -> lista todos os espacos com contagem de membros e posts
      # PATCH  /api/v1/admin/spaces/:id        -> atualiza nome, kind, locked
      # POST   /api/v1/admin/spaces/reorder    -> reordena positions {ids: [uuid]}
      class SpacesController < BaseController
        def index
          community = current_community
          spaces = community ? community.spaces.order(:position, :created_at) : Space.none

          # Pre-carrega contagens em memoria pra evitar N+1.
          space_ids = spaces.map(&:id)
          posts_count = Post.where(space_id: space_ids).group(:space_id).count
          messages_count = Message.where(space_id: space_ids).group(:space_id).count
          members_total = community ? community.users.count : 0

          render json: spaces.map { |space| serialize(space, posts_count, messages_count, members_total) }
        end

        def update
          community = current_community
          space = community&.spaces&.find_by(id: params[:id])
          unless space
            render json: { error: "space_not_found" }, status: :not_found
            return
          end

          attrs = params.require(:space).permit(:name, :kind, :locked, :position, :icon)
          space.update!(attrs)
          posts_count = { space.id => space.posts.count }
          messages_count = { space.id => space.messages.count }
          render json: serialize(space, posts_count, messages_count, community.users.count)
        end

        def reorder
          community = current_community
          ids = Array(params[:ids]).map(&:to_s)
          if community.nil? || ids.empty?
            render json: { error: "invalid_ids" }, status: :unprocessable_entity
            return
          end

          Space.transaction do
            ids.each_with_index do |id, idx|
              community.spaces.where(id: id).update_all(position: idx + 1)
            end
          end

          render json: { ok: true, count: ids.size }
        end

        private

        def serialize(space, posts_count, messages_count, members_total)
          settings = space.settings.is_a?(Hash) ? space.settings : {}
          {
            id: space.id,
            name: space.name,
            slug: space.slug,
            kind: space.kind,
            icon: space.icon,
            position: space.position,
            locked: space.locked,
            visibility: settings["visibility"] || (space.locked ? "private" : "public"),
            posts_count: posts_count[space.id] || 0,
            messages_count: messages_count[space.id] || 0,
            members_count: members_total,
          }
        end
      end
    end
  end
end
