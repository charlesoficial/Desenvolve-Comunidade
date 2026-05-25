module Api
  module V1
    # Recebe eventos do Stripe (subscription, payment, invoice).
    # Registrado em routes como POST /api/v1/billing/webhook.
    # Quando STRIPE_WEBHOOK_SECRET nao esta configurado, aceita o body
    # como JSON cru pra dev/test, mas NUNCA em producao.
    class BillingWebhooksController < ApplicationController
      skip_before_action :verify_authenticity_token, raise: false

      def create
        payload = request.body.read
        event = parse_event(payload)
        unless event
          render json: { error: "invalid_signature" }, status: :bad_request
          return
        end

        handle_event(event)
        render json: { received: true }
      rescue StandardError => e
        Rails.logger.error("[BillingWebhook] #{e.class}: #{e.message}")
        render json: { error: "webhook_error", message: e.message }, status: :internal_server_error
      end

      private

      def parse_event(payload)
        signature = request.headers["Stripe-Signature"].to_s
        secret = ENV["STRIPE_WEBHOOK_SECRET"].to_s

        if defined?(Stripe::Webhook) && secret.present? && signature.present?
          return Stripe::Webhook.construct_event(payload, signature, secret)
        end

        # Modo dev: aceita JSON simples sem verificar assinatura.
        # NUNCA habilite em producao. Production exige STRIPE_WEBHOOK_SECRET.
        return nil if Rails.env.production?

        JSON.parse(payload).with_indifferent_access
      rescue JSON::ParserError, Stripe::SignatureVerificationError
        nil
      end

      def handle_event(event)
        type = event[:type] || event["type"]
        data = (event[:data] || event["data"] || {})[:object] || (event["data"] || {})["object"]
        return unless data

        case type
        when "checkout.session.completed"
          activate_subscription_from_session(data)
        when "customer.subscription.updated", "customer.subscription.deleted"
          sync_subscription_status(data)
        end
      end

      def activate_subscription_from_session(data)
        metadata = data[:metadata] || data["metadata"] || {}
        user_id = metadata[:user_id] || metadata["user_id"]
        plan_id = metadata[:plan_id] || metadata["plan_id"]
        return unless user_id && plan_id

        plan = Plan.find_by(id: plan_id)
        return unless plan

        subscription = Subscription.find_or_initialize_by(
          user_id: user_id,
          community_id: plan.community_id,
          provider: "stripe",
        )

        subscription.update!(
          plan_id: plan.id,
          status: "active",
          provider_customer_id: data[:customer] || data["customer"],
          provider_subscription_id: data[:subscription] || data["subscription"],
          metadata: { source: "checkout.session.completed" },
        )
      end

      def sync_subscription_status(data)
        provider_id = data[:id] || data["id"]
        return unless provider_id

        subscription = Subscription.find_by(provider_subscription_id: provider_id)
        return unless subscription

        status = data[:status] || data["status"]
        period_end = data[:current_period_end] || data["current_period_end"]
        subscription.update!(
          status: status.presence || subscription.status,
          current_period_end: (period_end ? Time.zone.at(period_end.to_i) : subscription.current_period_end),
        )
      end
    end
  end
end
