module Api
  module V1
    module Admin
      class SegmentsController < BaseController
        def index
          rows = current_community ? current_community.segments.order(created_at: :desc) : []
          render json: rows.map { |row| serialize(row) }
        end

        def create
          segment = current_community.segments.build(segment_params)
          if segment.save
            render json: serialize(segment), status: :created
          else
            render json: { errors: segment.errors }, status: :unprocessable_entity
          end
        end

        def update
          segment = current_community&.segments&.find_by(id: params[:id])
          unless segment
            render json: { error: "segment_not_found" }, status: :not_found
            return
          end
          if segment.update(segment_params)
            render json: serialize(segment)
          else
            render json: { errors: segment.errors }, status: :unprocessable_entity
          end
        end

        def destroy
          segment = current_community&.segments&.find_by(id: params[:id])
          unless segment
            render json: { error: "segment_not_found" }, status: :not_found
            return
          end
          segment.destroy!
          head :no_content
        end

        private

        def segment_params
          permitted = params.require(:segment).permit(:name, :description).to_h
          # filtros sao livre-form - aceita to_unsafe_h
          if params[:segment][:filters].is_a?(ActionController::Parameters)
            permitted[:filters] = params[:segment][:filters].to_unsafe_h
          elsif params[:segment][:filters].is_a?(Hash)
            permitted[:filters] = params[:segment][:filters]
          end
          permitted
        end

        def serialize(segment)
          {
            id: segment.id,
            name: segment.name,
            description: segment.description,
            filters: segment.filters,
            members_count: segment.members_count,
            last_calculated_at: segment.last_calculated_at&.iso8601,
            created_at: segment.created_at.iso8601,
          }
        end
      end
    end
  end
end
