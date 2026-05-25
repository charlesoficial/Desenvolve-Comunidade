module Api
  module V1
    module Admin
      class ProfileFieldsController < BaseController
        def index
          rows = current_community ? current_community.profile_field_definitions.ordered : []
          render json: rows.map(&:to_admin_hash)
        end

        def create
          field = current_community.profile_field_definitions.build(field_params)
          field.position ||= next_position
          if field.save
            render json: field.to_admin_hash, status: :created
          else
            render json: { errors: field.errors }, status: :unprocessable_entity
          end
        end

        def update
          field = current_community&.profile_field_definitions&.find_by(id: params[:id])
          unless field
            render json: { error: "field_not_found" }, status: :not_found
            return
          end
          if field.update(field_params)
            render json: field.to_admin_hash
          else
            render json: { errors: field.errors }, status: :unprocessable_entity
          end
        end

        def destroy
          field = current_community&.profile_field_definitions&.find_by(id: params[:id])
          unless field
            render json: { error: "field_not_found" }, status: :not_found
            return
          end
          field.destroy!
          head :no_content
        end

        private

        def field_params
          permitted = params.require(:profile_field).permit(
            :key, :label, :field_type, :placeholder, :help_text,
            :required, :show_in_onboarding, :visibility, :position, :archived,
          ).to_h
          if params[:profile_field][:options].is_a?(Array)
            permitted[:options] = params[:profile_field][:options]
          end
          permitted
        end

        def next_position
          (current_community.profile_field_definitions.maximum(:position) || -1) + 1
        end
      end
    end
  end
end
