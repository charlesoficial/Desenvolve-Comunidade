module Api
  module V1
    module Admin
      # Endpoint generico para sub-paginas de Geral.
      # GET    /api/v1/admin/settings/:key   -> retorna { settings: {...}, defaults: {...} }
      # PATCH  /api/v1/admin/settings/:key   -> body { settings: { ... } } persistido em communities.settings[key]
      class SettingsController < BaseController
        DEFAULTS = {
          "custom_domain" => {
            "domain" => "",
            "force_https" => true,
          },
          "community_ai" => {
            "enabled" => true,
            "system_prompt" => "Você é o assistente oficial da comunidade. Responda de forma curta, simpática e em português.",
            "default_temperature" => 0.4,
          },
          "mobile_app" => {
            "enabled" => false,
            "ios_url" => "",
            "android_url" => "",
            "branding_color" => "#4f46e5",
          },
          "weekly_digest" => {
            "enabled" => true,
            "send_day" => "monday",
            "send_hour" => 9,
            "include_top_posts" => true,
            "include_new_members" => true,
          },
          "embed" => {
            "enabled" => false,
            "allowed_origins" => [],
          },
          "sso" => {
            "enabled" => false,
            "provider" => "saml",
            "metadata_url" => "",
            "entity_id" => "",
          },
          "connect" => {
            "zapier_enabled" => false,
            "n8n_webhook_url" => "",
            "discord_webhook_url" => "",
            "slack_webhook_url" => "",
          },
          "legal" => {
            "terms_url" => "",
            "privacy_url" => "",
            "cookies_url" => "",
            "support_email" => "",
          },
          "home" => {
            "headline" => "Bem-vindo à comunidade",
            "subheadline" => "Entre, participe, evolua.",
            "cta_text" => "Entrar",
            "cta_path" => "/?auth=login",
            "show_member_count" => true,
          },
        }.freeze

        VALID_KEYS = DEFAULTS.keys.freeze

        before_action :validate_key!

        def show
          render json: {
            key: params[:key],
            settings: merged_settings,
            defaults: DEFAULTS[params[:key]],
          }
        end

        def update
          community = current_community
          unless community
            render json: { error: "community_not_found" }, status: :not_found
            return
          end

          raw = params.require(:settings).to_unsafe_h.slice(*allowed_keys.map(&:to_s))
          settings = community.settings.is_a?(Hash) ? community.settings.dup : {}
          existing = (settings[params[:key]] || {})
          merged = existing.merge(stringify_keys(raw))
          settings[params[:key]] = merged
          community.update!(settings: settings)

          render json: {
            key: params[:key],
            settings: merged,
            defaults: DEFAULTS[params[:key]],
          }
        end

        private

        def validate_key!
          return if VALID_KEYS.include?(params[:key])

          render json: { error: "unknown_key", valid_keys: VALID_KEYS }, status: :not_found
        end

        def merged_settings
          stored = current_community&.settings.is_a?(Hash) ? current_community.settings : {}
          DEFAULTS[params[:key]].merge(stored[params[:key]] || {})
        end

        def allowed_keys
          DEFAULTS[params[:key]].keys
        end

        def stringify_keys(hash)
          hash.transform_keys(&:to_s).transform_values do |value|
            if value.is_a?(Hash)
              stringify_keys(value)
            elsif value.is_a?(Array)
              value.compact.map(&:to_s).reject(&:empty?)
            else
              value
            end
          end
        end
      end
    end
  end
end
