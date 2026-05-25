module Api
  module V1
    class BillingController < ApplicationController
      before_action :require_current_user!

      def show
        subscription = current_user.subscriptions.order(created_at: :desc).first
        plan = subscription&.plan
        render json: {
          status: subscription&.status || "inactive",
          current_period_end: subscription&.current_period_end,
          plan: plan && {
            id: plan.id,
            name: plan.name,
            price_cents: plan.price_cents,
            currency: plan.currency,
            interval: plan.interval,
          },
        }
      end

      # Cria uma sessao Stripe Checkout para o plano informado e devolve a url
      # de redirecionamento. Quando STRIPE_SECRET_KEY nao esta configurado,
      # devolve uma URL de stub pra o frontend continuar funcionando.
      def create
        plan_id = params.dig(:billing, :plan_id) || params[:plan_id]
        plan = Plan.find_by(id: plan_id)
        unless plan
          render json: { error: "plan_not_found" }, status: :unprocessable_entity
          return
        end

        success_url = build_url(params[:success_path].presence || "/settings/plans?status=success")
        cancel_url  = build_url(params[:cancel_path].presence || "/settings/plans?status=cancel")

        if Stripe.api_key.to_s.empty?
          render json: {
            mode: "stub",
            url: "#{success_url}&plan_id=#{plan.id}",
            message: "STRIPE_SECRET_KEY ausente — checkout em modo demonstracao.",
          }
          return
        end

        session = Stripe::Checkout::Session.create(
          mode: plan.interval == "one_time" ? "payment" : "subscription",
          customer_email: current_user.email,
          success_url: success_url,
          cancel_url: cancel_url,
          metadata: { plan_id: plan.id, user_id: current_user.id },
          line_items: [{
            quantity: 1,
            price_data: {
              currency: plan.currency.downcase,
              unit_amount: plan.price_cents,
              recurring: plan.interval == "one_time" ? nil : { interval: plan.interval },
              product_data: {
                name: plan.name,
                description: plan.description.presence,
              }.compact,
            },
          }],
        )

        render json: { mode: "stripe", url: session.url, session_id: session.id }
      rescue Stripe::StripeError => e
        Rails.logger.error("[Billing] Stripe error: #{e.message}")
        render json: { error: "stripe_error", message: e.message }, status: :bad_gateway
      end

      private

      def build_url(path)
        host = request.headers["Origin"].presence || ENV["APP_HOST"].presence || request.base_url
        URI.join(host, path).to_s
      rescue URI::InvalidURIError
        "#{request.base_url}#{path}"
      end
    end
  end
end
