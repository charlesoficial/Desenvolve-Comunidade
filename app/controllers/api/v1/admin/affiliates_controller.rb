module Api
  module V1
    module Admin
      # Lista codigos de afiliados da comunidade. Cada usuario pode ter
      # no maximo 1 codigo. Ordenado por receita gerada desc.
      class AffiliatesController < BaseController
        def index
          rows = current_community ? current_community.affiliate_codes.includes(:user).order(total_revenue_cents: :desc, created_at: :desc) : []
          render json: rows.map { |row| serialize(row) }
        end

        def create
          user_id = params.dig(:affiliate, :user_id)
          unless current_community.users.exists?(id: user_id)
            render json: { error: "user_not_member" }, status: :unprocessable_entity
            return
          end

          code = AffiliateCode.find_or_initialize_by(community: current_community, user_id: user_id)
          code.code ||= generate_code(user_id)
          code.commission_pct = params.dig(:affiliate, :commission_pct).to_i.between?(1, 100) ? params.dig(:affiliate, :commission_pct).to_i : 30
          code.active = true
          code.save!
          render json: serialize(code), status: :created
        end

        def update
          code = current_community&.affiliate_codes&.find_by(id: params[:id])
          unless code
            render json: { error: "code_not_found" }, status: :not_found
            return
          end
          attrs = params.require(:affiliate).permit(:commission_pct, :active)
          code.update!(attrs)
          render json: serialize(code)
        end

        def destroy
          code = current_community&.affiliate_codes&.find_by(id: params[:id])
          unless code
            render json: { error: "code_not_found" }, status: :not_found
            return
          end
          code.destroy!
          head :no_content
        end

        private

        def generate_code(user_id)
          # Codigo curto baseado em user_id + random pra evitar colisao.
          slug = User.find(user_id).username.to_s.parameterize.first(10)
          "#{slug}-#{SecureRandom.hex(2)}"
        end

        def serialize(code)
          {
            id: code.id,
            code: code.code,
            commission_pct: code.commission_pct,
            visits_count: code.visits_count,
            conversions_count: code.conversions_count,
            total_revenue_cents: code.total_revenue_cents,
            active: code.active,
            created_at: code.created_at.iso8601,
            user: code.user && {
              id: code.user.id,
              username: code.user.username,
              display_name: code.user.display_name,
              avatar_url: code.user.avatar_url,
            },
          }
        end
      end
    end
  end
end
