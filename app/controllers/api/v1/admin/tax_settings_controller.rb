module Api
  module V1
    module Admin
      class TaxSettingsController < BaseController
        def show
          render json: tax_setting.to_admin_hash
        end

        def update
          if tax_setting.update(tax_params)
            render json: tax_setting.to_admin_hash
          else
            render json: { errors: tax_setting.errors }, status: :unprocessable_entity
          end
        end

        private

        def tax_setting
          @tax_setting ||= current_community&.tax_setting || current_community&.create_tax_setting!(default_country: "BR")
        end

        def tax_params
          permitted = params.require(:tax_setting).permit(:enabled, :model, :auto_calculate, :default_country).to_h
          if params[:tax_setting][:rates].is_a?(Array)
            permitted[:rates] = params[:tax_setting][:rates].map { |r| r.respond_to?(:to_unsafe_h) ? r.to_unsafe_h : r }
          end
          permitted
        end
      end
    end
  end
end
