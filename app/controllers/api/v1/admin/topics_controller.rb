module Api
  module V1
    module Admin
      # CRUD de topicos. Cada topico tem cor + slug + descricao.
      class TopicsController < BaseController
        def index
          rows = current_community ? current_community.topics.order(:position, :created_at) : []
          render json: rows.map { |row| serialize(row) }
        end

        def create
          topic = current_community.topics.build(topic_params)
          topic.position ||= (current_community.topics.maximum(:position) || 0) + 1
          if topic.save
            render json: serialize(topic), status: :created
          else
            render json: { errors: topic.errors }, status: :unprocessable_entity
          end
        end

        def update
          topic = current_community&.topics&.find_by(id: params[:id])
          unless topic
            render json: { error: "topic_not_found" }, status: :not_found
            return
          end
          if topic.update(topic_params)
            render json: serialize(topic)
          else
            render json: { errors: topic.errors }, status: :unprocessable_entity
          end
        end

        def destroy
          topic = current_community&.topics&.find_by(id: params[:id])
          unless topic
            render json: { error: "topic_not_found" }, status: :not_found
            return
          end
          topic.destroy!
          head :no_content
        end

        private

        def topic_params
          params.require(:topic).permit(:name, :slug, :color, :description, :position)
        end

        def serialize(topic)
          {
            id: topic.id,
            name: topic.name,
            slug: topic.slug,
            color: topic.color,
            description: topic.description,
            posts_count: topic.posts_count,
            position: topic.position,
          }
        end
      end
    end
  end
end
