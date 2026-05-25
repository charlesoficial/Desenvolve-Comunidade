module Api
  module V1
    module Admin
      class AccessGroupsController < BaseController
        def index
          rows = current_community ? current_community.access_groups.order(:name) : []
          render json: rows.map { |row| serialize(row) }
        end

        def create
          group = current_community.access_groups.build(group_params)
          if group.save
            render json: serialize(group), status: :created
          else
            render json: { errors: group.errors }, status: :unprocessable_entity
          end
        end

        def update
          group = current_community&.access_groups&.find_by(id: params[:id])
          unless group
            render json: { error: "group_not_found" }, status: :not_found
            return
          end
          if group.update(group_params)
            render json: serialize(group)
          else
            render json: { errors: group.errors }, status: :unprocessable_entity
          end
        end

        def destroy
          group = current_community&.access_groups&.find_by(id: params[:id])
          unless group
            render json: { error: "group_not_found" }, status: :not_found
            return
          end
          group.destroy!
          head :no_content
        end

        private

        def group_params
          attrs = params.require(:access_group).permit(:name, :description, :default_role, :active).to_h
          space_ids = params.dig(:access_group, :space_ids)
          attrs[:space_ids] = Array(space_ids).map(&:to_s) if space_ids
          attrs
        end

        def serialize(group)
          space_count = group.space_ids.size
          {
            id: group.id,
            name: group.name,
            description: group.description,
            default_role: group.default_role,
            space_ids: group.space_ids,
            space_count: space_count,
            members_count: group.members_count,
            active: group.active,
            created_at: group.created_at.iso8601,
          }
        end
      end
    end
  end
end
