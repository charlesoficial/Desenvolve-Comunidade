module Api
  module V1
    module Admin
      # CRUD de API tokens para integracoes externas (webhooks, automacoes).
      # POST cria e devolve o token bruto UMA UNICA VEZ - nao e armazenado
      # em texto puro.
      class ApiTokensController < BaseController
        def index
          tokens = current_community ? current_community.api_tokens.order(created_at: :desc) : []
          render json: tokens.map { |token| serialize(token) }
        end

        def create
          name = params.dig(:api_token, :name).to_s.strip
          if name.blank?
            render json: { error: "name_required" }, status: :unprocessable_entity
            return
          end

          scopes = Array(params.dig(:api_token, :scopes)).map(&:to_s)
          scopes = ["read"] if scopes.empty?

          token = ::ApiToken.issue!(
            community: current_community,
            user: current_user,
            name: name,
            scopes: scopes,
          )

          render json: serialize(token).merge(token: token.raw_token), status: :created
        end

        def destroy
          token = current_community&.api_tokens&.find_by(id: params[:id])
          unless token
            render json: { error: "token_not_found" }, status: :not_found
            return
          end

          token.revoke!
          render json: serialize(token)
        end

        private

        def serialize(token)
          {
            id: token.id,
            name: token.name,
            token_prefix: token.token_prefix,
            scopes: token.scopes,
            last_used_at: token.last_used_at&.iso8601,
            revoked_at: token.revoked_at&.iso8601,
            created_at: token.created_at.iso8601,
          }
        end
      end
    end
  end
end
