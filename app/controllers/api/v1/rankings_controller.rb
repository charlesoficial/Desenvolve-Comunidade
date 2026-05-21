module Api
  module V1
    class RankingsController < ApplicationController
      def index
        users = User.left_joins(:posts)
                    .group("users.id")
                    .select("users.*, COUNT(posts.id) AS posts_total")
                    .order("posts_total DESC")
                    .limit(50)

        render json: users.map.with_index(1) { |user, position| ranking_json(user, position) }
      end

      private

      def ranking_json(user, position)
        UserSerializer.new(user).as_json.merge(
          position: position,
          posts_total: user.posts_total.to_i
        )
      end
    end
  end
end
