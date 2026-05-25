module Api
  module V1
    module Admin
      # /api/v1/admin/plans  — gerencia planos de assinatura.
      class PlansController < BaseController
        def index
          plans = current_community ? current_community.plans.ordered : Plan.none
          render json: plans.map { |plan| serialize(plan) }
        end

        def create
          plan = current_community.plans.build(plan_params)
          plan.position = (current_community.plans.maximum(:position) || 0) + 1 if plan.position.zero?
          if plan.save
            render json: serialize(plan), status: :created
          else
            render json: { errors: plan.errors }, status: :unprocessable_entity
          end
        end

        def update
          plan = current_community&.plans&.find_by(id: params[:id])
          unless plan
            render json: { error: "plan_not_found" }, status: :not_found
            return
          end

          if plan.update(plan_params)
            render json: serialize(plan)
          else
            render json: { errors: plan.errors }, status: :unprocessable_entity
          end
        end

        def destroy
          plan = current_community&.plans&.find_by(id: params[:id])
          unless plan
            render json: { error: "plan_not_found" }, status: :not_found
            return
          end

          plan.destroy!
          head :no_content
        end

        private

        def plan_params
          params.require(:plan).permit(:name, :description, :price_cents, :currency, :interval, :highlight, :active, :position)
        end

        def serialize(plan)
          {
            id: plan.id,
            name: plan.name,
            description: plan.description,
            price_cents: plan.price_cents,
            currency: plan.currency,
            interval: plan.interval,
            highlight: plan.highlight,
            active: plan.active,
            position: plan.position,
          }
        end
      end
    end
  end
end
