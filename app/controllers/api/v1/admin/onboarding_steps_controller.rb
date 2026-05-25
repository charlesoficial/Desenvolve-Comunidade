module Api
  module V1
    module Admin
      class OnboardingStepsController < BaseController
        def index
          rows = current_community ? current_community.onboarding_steps.ordered : []
          render json: rows.map(&:to_admin_hash)
        end

        def create
          step = current_community.onboarding_steps.build(step_params)
          step.position ||= next_position
          if step.save
            render json: step.to_admin_hash, status: :created
          else
            render json: { errors: step.errors }, status: :unprocessable_entity
          end
        end

        def update
          step = current_community&.onboarding_steps&.find_by(id: params[:id])
          unless step
            render json: { error: "step_not_found" }, status: :not_found
            return
          end
          if step.update(step_params)
            render json: step.to_admin_hash
          else
            render json: { errors: step.errors }, status: :unprocessable_entity
          end
        end

        def destroy
          step = current_community&.onboarding_steps&.find_by(id: params[:id])
          unless step
            render json: { error: "step_not_found" }, status: :not_found
            return
          end
          step.destroy!
          head :no_content
        end

        private

        def step_params
          permitted = params.require(:onboarding_step).permit(:title, :description, :step_type, :required, :position, :archived).to_h
          if params[:onboarding_step][:payload].is_a?(ActionController::Parameters)
            permitted[:payload] = params[:onboarding_step][:payload].to_unsafe_h
          elsif params[:onboarding_step][:payload].is_a?(Hash)
            permitted[:payload] = params[:onboarding_step][:payload]
          end
          permitted
        end

        def next_position
          (current_community.onboarding_steps.maximum(:position) || -1) + 1
        end
      end
    end
  end
end
