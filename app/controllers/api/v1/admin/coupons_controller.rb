module Api
  module V1
    module Admin
      class CouponsController < BaseController
        def index
          rows = current_community ? current_community.coupons.order(created_at: :desc) : []
          render json: rows.map { |row| serialize(row) }
        end

        def create
          coupon = current_community.coupons.build(coupon_params)
          if coupon.save
            render json: serialize(coupon), status: :created
          else
            render json: { errors: coupon.errors }, status: :unprocessable_entity
          end
        end

        def update
          coupon = current_community&.coupons&.find_by(id: params[:id])
          unless coupon
            render json: { error: "coupon_not_found" }, status: :not_found
            return
          end
          if coupon.update(coupon_params)
            render json: serialize(coupon)
          else
            render json: { errors: coupon.errors }, status: :unprocessable_entity
          end
        end

        def destroy
          coupon = current_community&.coupons&.find_by(id: params[:id])
          unless coupon
            render json: { error: "coupon_not_found" }, status: :not_found
            return
          end
          coupon.destroy!
          head :no_content
        end

        private

        def coupon_params
          params.require(:coupon).permit(:code, :description, :discount_type, :discount_value, :max_uses, :expires_at, :active, :applies_to, :paywall_id, :plan_id)
        end

        def serialize(coupon)
          {
            id: coupon.id,
            code: coupon.code,
            description: coupon.description,
            discount_type: coupon.discount_type,
            discount_value: coupon.discount_value,
            max_uses: coupon.max_uses,
            used_count: coupon.used_count,
            remaining_uses: coupon.max_uses ? [coupon.max_uses - coupon.used_count, 0].max : nil,
            expires_at: coupon.expires_at&.iso8601,
            active: coupon.active,
            usable: coupon.usable?,
            applies_to: coupon.applies_to,
            paywall_id: coupon.paywall_id,
            plan_id: coupon.plan_id,
            created_at: coupon.created_at.iso8601,
          }
        end
      end
    end
  end
end
