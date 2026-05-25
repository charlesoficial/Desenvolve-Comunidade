module Api
  module V1
    module Admin
      # GET    /api/v1/admin/community  -> retorna a comunidade ativa
      # PATCH  /api/v1/admin/community  -> atualiza nome, descricao, locale, fuso
      #
      # description / locale / timezone vivem no jsonb settings pra evitar
      # nova migration. Nome continua na coluna proprio.
      class CommunityController < BaseController
        def show
          render json: community_payload(current_community)
        end

        def update
          community = current_community
          unless community
            render json: { error: "community_not_found" }, status: :not_found
            return
          end

          new_name = params.dig(:community, :name)
          settings = community.settings.is_a?(Hash) ? community.settings.dup : {}
          %i[description locale timezone].each do |key|
            value = params.dig(:community, key)
            settings[key.to_s] = value if value.is_a?(String)
          end

          community.update!(name: new_name.presence || community.name, settings: settings)

          render json: community_payload(community)
        end

        private

        def community_payload(community)
          return { id: nil, name: "Comunidade", description: "", locale: "pt-BR", timezone: "America/Sao_Paulo" } unless community

          settings = community.settings.is_a?(Hash) ? community.settings : {}
          {
            id: community.id,
            name: community.name,
            slug: community.slug,
            description: settings["description"].to_s,
            locale: settings["locale"].presence || "pt-BR",
            timezone: settings["timezone"].presence || "America/Sao_Paulo",
            brand_color: community.brand_color,
            logo_url: community.logo_url,
          }
        end
      end
    end
  end
end
