module Api
  module V1
    module Admin
      # /api/v1/admin/charges - listagem das transacoes (uma "linha" por
      # subscription criada/atualizada). Como nao temos modelo de Charge
      # ainda, derivamos a partir das proprias subscriptions com seu
      # provider_subscription_id e plan price.
      class ChargesController < BaseController
        DEFAULT_PER_PAGE = 25

        def index
          page = [params[:page].to_i, 1].max
          per_page = params[:per_page].to_i
          per_page = DEFAULT_PER_PAGE if per_page <= 0
          per_page = [per_page, 100].min

          scope = current_community ?
            Subscription.where(community_id: current_community.id).order(created_at: :desc).includes(:user, :plan) :
            Subscription.none

          total = scope.count
          rows = scope.offset((page - 1) * per_page).limit(per_page)

          render json: {
            page: page,
            per_page: per_page,
            total: total,
            total_pages: total.zero? ? 0 : (total.to_f / per_page).ceil,
            charges: rows.map { |row| serialize(row) },
          }
        end

        private

        def serialize(subscription)
          plan = subscription.plan
          {
            id: subscription.id,
            provider_subscription_id: subscription.provider_subscription_id,
            provider_customer_id: subscription.provider_customer_id,
            status: subscription.status,
            amount_cents: plan&.price_cents,
            currency: plan&.currency || "BRL",
            interval: plan&.interval,
            current_period_end: subscription.current_period_end&.iso8601,
            created_at: subscription.created_at.iso8601,
            user: subscription.user && {
              id: subscription.user.id,
              username: subscription.user.username,
              display_name: subscription.user.display_name,
              email: subscription.user.email.to_s,
            },
            plan: plan && { id: plan.id, name: plan.name },
          }
        end
      end
    end
  end
end
