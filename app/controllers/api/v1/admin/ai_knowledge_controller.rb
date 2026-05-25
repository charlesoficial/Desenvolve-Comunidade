module Api
  module V1
    module Admin
      # CRUD da knowledge base usada pelos AI Agents.
      class AiKnowledgeController < BaseController
        def index
          rows = current_community ? current_community.ai_knowledge_entries.order(created_at: :desc) : []
          render json: rows.map { |row| serialize(row) }
        end

        def create
          entry = current_community.ai_knowledge_entries.build(entry_params)
          if entry.save
            render json: serialize(entry), status: :created
          else
            render json: { errors: entry.errors }, status: :unprocessable_entity
          end
        end

        def update
          entry = current_community&.ai_knowledge_entries&.find_by(id: params[:id])
          unless entry
            render json: { error: "entry_not_found" }, status: :not_found
            return
          end
          if entry.update(entry_params)
            render json: serialize(entry)
          else
            render json: { errors: entry.errors }, status: :unprocessable_entity
          end
        end

        def destroy
          entry = current_community&.ai_knowledge_entries&.find_by(id: params[:id])
          unless entry
            render json: { error: "entry_not_found" }, status: :not_found
            return
          end
          entry.destroy!
          head :no_content
        end

        private

        def entry_params
          params.require(:entry).permit(:title, :body, :source_url, :enabled)
        end

        def serialize(entry)
          {
            id: entry.id,
            title: entry.title,
            body: entry.body,
            source_url: entry.source_url,
            enabled: entry.enabled,
            created_at: entry.created_at.iso8601,
            updated_at: entry.updated_at.iso8601,
          }
        end
      end
    end
  end
end
