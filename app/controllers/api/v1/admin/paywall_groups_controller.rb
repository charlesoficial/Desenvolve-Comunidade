module Api
  module V1
    module Admin
      class PaywallGroupsController < BaseController
        def index
          rows = current_community ? current_community.paywall_groups.order(created_at: :desc) : []
          render json: rows.map(&:to_admin_hash)
        end

        def create
          group = current_community.paywall_groups.build(group_params)
          if group.save
            render json: group.to_admin_hash, status: :created
          else
            render json: { errors: group.errors }, status: :unprocessable_entity
          end
        end

        def update
          group = current_community&.paywall_groups&.find_by(id: params[:id])
          unless group
            render json: { error: "group_not_found" }, status: :not_found
            return
          end
          if group.update(group_params)
            render json: group.to_admin_hash
          else
            render json: { errors: group.errors }, status: :unprocessable_entity
          end
        end

        def destroy
          group = current_community&.paywall_groups&.find_by(id: params[:id])
          unless group
            render json: { error: "group_not_found" }, status: :not_found
            return
          end
          group.destroy!
          head :no_content
        end

        private

        def group_params
          permitted = params.require(:paywall_group).permit(
            :name, :description, :price_cents, :currency, :interval, :trial_days, :active,
          ).to_h
          if params[:paywall_group][:paywall_ids].is_a?(Array)
            permitted[:paywall_ids] = params[:paywall_group][:paywall_ids]
          end
          permitted
        end
      end
    end
  end
end
