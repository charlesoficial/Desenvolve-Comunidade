module Api
  module V1
    module Admin
      # /api/v1/admin/paywalls — barreiras de pagamento (one-shot ou
      # recorrentes) que liberam acesso a conteudos ou espacos.
      class PaywallsController < BaseController
        def index
          paywalls = current_community ? current_community.paywalls.order(:created_at) : Paywall.none
          render json: paywalls.map { |paywall| serialize(paywall) }
        end

        def create
          paywall = current_community.paywalls.build(paywall_params)
          if paywall.save
            render json: serialize(paywall), status: :created
          else
            render json: { errors: paywall.errors }, status: :unprocessable_entity
          end
        end

        def update
          paywall = current_community&.paywalls&.find_by(id: params[:id])
          unless paywall
            render json: { error: "paywall_not_found" }, status: :not_found
            return
          end

          if paywall.update(paywall_params)
            render json: serialize(paywall)
          else
            render json: { errors: paywall.errors }, status: :unprocessable_entity
          end
        end

        def destroy
          paywall = current_community&.paywalls&.find_by(id: params[:id])
          unless paywall
            render json: { error: "paywall_not_found" }, status: :not_found
            return
          end

          paywall.destroy!
          head :no_content
        end

        private

        def paywall_params
          params.require(:paywall).permit(:name, :description, :price_cents, :currency, :interval, :status)
        end

        def serialize(paywall)
          {
            id: paywall.id,
            name: paywall.name,
            description: paywall.description,
            price_cents: paywall.price_cents,
            currency: paywall.currency,
            interval: paywall.interval,
            status: paywall.status,
          }
        end
      end
    end
  end
end
