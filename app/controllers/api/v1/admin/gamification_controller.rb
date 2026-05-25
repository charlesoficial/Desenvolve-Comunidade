module Api
  module V1
    module Admin
      # /api/v1/admin/gamification - leitura/atualizacao das configuracoes
      # de gamificacao da comunidade. Cria automaticamente um registro com
      # defaults caso ainda nao exista.
      class GamificationController < BaseController
        def show
          render json: serialize(ensure_settings)
        end

        def update
          settings = ensure_settings
          if settings.update(settings_params)
            render json: serialize(settings)
          else
            render json: { errors: settings.errors }, status: :unprocessable_entity
          end
        end

        private

        def ensure_settings
          return nil unless current_community
          current_community.gamification_setting ||
            current_community.create_gamification_setting!
        end

        def settings_params
          attrs = params.require(:gamification).permit(
            :enabled, :points_per_post, :points_per_comment,
            :points_per_reaction_received, :points_per_login,
            :level_curve, :level_step,
          ).to_h
          if params[:gamification][:badges].is_a?(Array)
            attrs[:badges] = params[:gamification][:badges].to_a
          end
          attrs
        end

        def serialize(s)
          return { error: "no_community" } unless s
          {
            id: s.id,
            enabled: s.enabled,
            points_per_post: s.points_per_post,
            points_per_comment: s.points_per_comment,
            points_per_reaction_received: s.points_per_reaction_received,
            points_per_login: s.points_per_login,
            level_curve: s.level_curve,
            level_step: s.level_step,
            badges: s.badges,
            updated_at: s.updated_at.iso8601,
          }
        end
      end
    end
  end
end
