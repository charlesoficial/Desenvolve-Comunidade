module Api
  module V1
    module Admin
      # GET    /api/v1/admin/memberships?state=pending|blocked|active
      # PATCH  /api/v1/admin/memberships/:id  -> body { state: 'active'|'blocked' } (aprovar/bloquear)
      # DELETE /api/v1/admin/memberships/:id  -> remove membership
      class MembershipsController < BaseController
        def index
          state = params[:state].to_s
          state = "pending" unless %w[pending active blocked].include?(state)

          memberships = (current_community&.memberships || Membership.none)
                          .where(state: state)
                          .includes(:user)
                          .order(created_at: :desc)

          render json: memberships.map { |m| serialize(m) }
        end

        def update
          membership = current_community&.memberships&.find_by(id: params[:id])
          unless membership
            render json: { error: "membership_not_found" }, status: :not_found
            return
          end

          new_state = params.dig(:membership, :state).to_s
          unless %w[pending active blocked].include?(new_state)
            render json: { error: "invalid_state" }, status: :unprocessable_entity
            return
          end

          membership.update!(state: new_state)
          render json: serialize(membership)
        end

        def destroy
          membership = current_community&.memberships&.find_by(id: params[:id])
          unless membership
            render json: { error: "membership_not_found" }, status: :not_found
            return
          end

          membership.destroy!
          head :no_content
        end

        private

        def serialize(membership)
          user = membership.user
          {
            id: membership.id,
            user_id: membership.user_id,
            state: membership.state,
            role: membership.role,
            joined_at: membership.joined_at&.iso8601,
            created_at: membership.created_at.iso8601,
            user: user && {
              username: user.username,
              display_name: user.display_name,
              email: user.email.to_s,
              avatar_url: user.avatar_url,
            },
          }
        end
      end
    end
  end
end
