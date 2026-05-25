module Api
  module V1
    module Admin
      # /api/v1/admin/workflows
      # Workflows sao armazenados como array em communities.settings["workflows"]
      # pra evitar nova migration. Cada item: {id, name, trigger, action, enabled}.
      class WorkflowsController < BaseController
        TRIGGERS = %w[member_joined post_created comment_created paywall_purchased].freeze
        ACTIONS  = %w[send_email send_dm grant_access tag_member].freeze

        def index
          render json: workflows
        end

        def create
          flow = build_workflow(params.require(:workflow))
          list = workflows + [flow]
          persist!(list)
          render json: flow, status: :created
        end

        def update
          list = workflows
          idx = list.find_index { |w| w["id"] == params[:id] }
          if idx.nil?
            render json: { error: "workflow_not_found" }, status: :not_found
            return
          end

          patch = params.require(:workflow).permit(:name, :trigger, :action, :enabled).to_h
          list[idx] = list[idx].merge(patch)
          persist!(list)
          render json: list[idx]
        end

        def destroy
          list = workflows.reject { |w| w["id"] == params[:id] }
          persist!(list)
          head :no_content
        end

        private

        def workflows
          settings = current_community&.settings.is_a?(Hash) ? current_community.settings : {}
          Array(settings["workflows"]).map { |w| w.is_a?(Hash) ? w : {} }
        end

        def persist!(list)
          community = current_community
          settings = community.settings.is_a?(Hash) ? community.settings.dup : {}
          settings["workflows"] = list
          community.update!(settings: settings)
        end

        def build_workflow(payload)
          permitted = payload.permit(:name, :trigger, :action, :enabled).to_h
          {
            "id" => SecureRandom.uuid,
            "name" => permitted["name"].to_s.presence || "Sem título",
            "trigger" => TRIGGERS.include?(permitted["trigger"]) ? permitted["trigger"] : TRIGGERS.first,
            "action" => ACTIONS.include?(permitted["action"]) ? permitted["action"] : ACTIONS.first,
            "enabled" => permitted["enabled"].nil? ? true : permitted["enabled"] == true || permitted["enabled"] == "true",
            "created_at" => Time.current.iso8601,
          }
        end
      end
    end
  end
end
