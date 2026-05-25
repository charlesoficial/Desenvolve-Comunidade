module Api
  module V1
    module Admin
      class AiConversationsController < BaseController
        def index
          page = (params[:page].presence || 1).to_i
          per_page = 25
          scope = current_community ? current_community.ai_conversations.includes(:user).recent : AiConversation.none
          scope = scope.where(status: params[:status]) if params[:status].present? && AiConversation::STATUSES.include?(params[:status])

          total = scope.count
          rows = scope.offset((page - 1) * per_page).limit(per_page)
          render json: {
            conversations: rows.map(&:to_admin_hash),
            total: total,
            total_pages: (total.to_f / per_page).ceil,
            page: page,
          }
        end

        def update
          conv = current_community&.ai_conversations&.find_by(id: params[:id])
          unless conv
            render json: { error: "conversation_not_found" }, status: :not_found
            return
          end
          if conv.update(conv_params)
            render json: conv.to_admin_hash
          else
            render json: { errors: conv.errors }, status: :unprocessable_entity
          end
        end

        private

        def conv_params
          params.require(:ai_conversation).permit(:status, :converted_to_kb)
        end
      end
    end
  end
end
