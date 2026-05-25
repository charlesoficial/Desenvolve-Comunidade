module Api
  module V1
    module Admin
      # Templates de e-mail por evento (welcome, reply_received, etc).
      # Garante que sempre existam os 4 templates default na primeira leitura.
      class EmailTemplatesController < BaseController
        DEFAULTS = [
          { key: "welcome",        subject: "Boas-vindas a {{community_name}}!",                    body: "Olá {{name}},\n\nÉ um prazer ter você conosco." },
          { key: "post_reply",     subject: "{{author}} respondeu sua publicação em {{community_name}}", body: "Veja a resposta no link e continue a conversa." },
          { key: "weekly_digest",  subject: "Resumo da semana em {{community_name}}",               body: "Aqui está o que rolou nos últimos 7 dias." },
          { key: "paywall_thanks", subject: "Pagamento confirmado em {{community_name}}",           body: "Obrigado pela compra. Seu acesso foi liberado." },
        ].freeze

        def index
          ensure_defaults!
          rows = current_community.email_templates.order(:key)
          render json: rows.map { |row| serialize(row) }
        end

        def update
          template = current_community&.email_templates&.find_by(id: params[:id])
          unless template
            render json: { error: "template_not_found" }, status: :not_found
            return
          end

          if template.update(params.require(:email_template).permit(:subject, :body, :enabled))
            render json: serialize(template)
          else
            render json: { errors: template.errors }, status: :unprocessable_entity
          end
        end

        private

        def ensure_defaults!
          return unless current_community

          existing = current_community.email_templates.pluck(:key)
          (DEFAULTS.map { |t| t[:key] } - existing).each do |missing_key|
            payload = DEFAULTS.find { |t| t[:key] == missing_key }
            current_community.email_templates.create!(payload)
          end
        end

        def serialize(template)
          {
            id: template.id,
            key: template.key,
            subject: template.subject,
            body: template.body,
            enabled: template.enabled,
            updated_at: template.updated_at.iso8601,
          }
        end
      end
    end
  end
end
