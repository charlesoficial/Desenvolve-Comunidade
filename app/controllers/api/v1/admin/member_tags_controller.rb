module Api
  module V1
    module Admin
      class MemberTagsController < BaseController
        def index
          rows = current_community ? current_community.member_tags.order(:name) : []
          # Pre-calcula contagem de uso de cada tag
          counts = MemberTagAssignment.where(member_tag_id: rows.map(&:id)).group(:member_tag_id).count
          render json: rows.map { |row| serialize(row, counts[row.id] || 0) }
        end

        def create
          tag = current_community.member_tags.build(tag_params)
          if tag.save
            render json: serialize(tag, 0), status: :created
          else
            render json: { errors: tag.errors }, status: :unprocessable_entity
          end
        end

        def update
          tag = current_community&.member_tags&.find_by(id: params[:id])
          unless tag
            render json: { error: "tag_not_found" }, status: :not_found
            return
          end
          if tag.update(tag_params)
            render json: serialize(tag, tag.member_tag_assignments.count)
          else
            render json: { errors: tag.errors }, status: :unprocessable_entity
          end
        end

        def destroy
          tag = current_community&.member_tags&.find_by(id: params[:id])
          unless tag
            render json: { error: "tag_not_found" }, status: :not_found
            return
          end
          tag.destroy!
          head :no_content
        end

        private

        def tag_params
          params.require(:tag).permit(:name, :color, :description)
        end

        def serialize(tag, members_count)
          {
            id: tag.id,
            name: tag.name,
            color: tag.color,
            description: tag.description,
            members_count: members_count,
            created_at: tag.created_at.iso8601,
          }
        end
      end
    end
  end
end
