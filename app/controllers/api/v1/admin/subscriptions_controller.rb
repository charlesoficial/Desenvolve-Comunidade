module Api
  module V1
    module Admin
      # /api/v1/admin/subscriptions
      #   ?status=active|paused|canceled|inactive
      class SubscriptionsController < BaseController
        DEFAULT_PER_PAGE = 25

        def index
          page = [params[:page].to_i, 1].max
          per_page = params[:per_page].to_i
          per_page = DEFAULT_PER_PAGE if per_page <= 0
          per_page = [per_page, 100].min
          status = params[:status].to_s

          scope = current_community ?
            Subscription.where(community_id: current_community.id).order(created_at: :desc).includes(:user, :plan) :
            Subscription.none

          scope = scope.where(status: status) if %w[active paused canceled inactive incomplete trialing past_due].include?(status)

          total = scope.count
          rows = scope.offset((page - 1) * per_page).limit(per_page)

          render json: {
            page: page,
            per_page: per_page,
            total: total,
            total_pages: total.zero? ? 0 : (total.to_f / per_page).ceil,
            mrr_cents: calculate_mrr,
            subscriptions: rows.map { |row| serialize(row) },
          }
        end

        def update
          subscription = current_community ? Subscription.find_by(community_id: current_community.id, id: params[:id]) : nil
          unless subscription
            render json: { error: "subscription_not_found" }, status: :not_found
            return
          end

          new_status = params.dig(:subscription, :status).to_s
          if %w[active paused canceled].include?(new_status)
            subscription.update!(status: new_status)
            render json: serialize(subscription)
          else
            render json: { error: "invalid_status" }, status: :unprocessable_entity
          end
        end

        private

        def calculate_mrr
          return 0 unless current_community
          # Soma do price_cents dos planos das subscriptions ativas com interval mensal
          ids = Subscription.where(community_id: current_community.id, status: %w[active trialing])
                            .where.not(plan_id: nil).pluck(:plan_id)
          return 0 if ids.empty?
          Plan.where(id: ids, interval: "month").sum(:price_cents)
        end

        def serialize(subscription)
          plan = subscription.plan
          {
            id: subscription.id,
            status: subscription.status,
            provider_subscription_id: subscription.provider_subscription_id,
            current_period_end: subscription.current_period_end&.iso8601,
            created_at: subscription.created_at.iso8601,
            updated_at: subscription.updated_at.iso8601,
            user: subscription.user && {
              id: subscription.user.id,
              username: subscription.user.username,
              display_name: subscription.user.display_name,
              email: subscription.user.email.to_s,
            },
            plan: plan && {
              id: plan.id,
              name: plan.name,
              price_cents: plan.price_cents,
              currency: plan.currency,
              interval: plan.interval,
            },
          }
        end
      end
    end
  end
end
