module Api
  module V1
    class MembershipsController < ApplicationController
      def index
        memberships = Membership.includes(:user, :community).order(:joined_at)
        render json: memberships.map { |membership| membership_json(membership) }
      end

      def show
        render json: membership_json(Membership.find(params[:id]))
      end

      private

      def membership_json(membership)
        {
          id: membership.id,
          role: membership.role,
          state: membership.state,
          level: membership.level,
          joined_at: membership.joined_at,
          user: UserSerializer.new(membership.user).as_json
        }
      end
    end
  end
end
