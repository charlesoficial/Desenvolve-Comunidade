module Api
  module V1
    class PostReactionsController < ApplicationController
      before_action :require_current_user!

      def create
        post = Post.find(params[:post_id])
        reaction = post.reactions.find_by(user: current_user, emoji: emoji)

        if reaction
          reaction.destroy!
        else
          post.reactions.create!(user: current_user, emoji: emoji)
        end

        post.update!(reactions_count: post.reactions.count)
        render json: PostSerializer.new(post.reload).as_json
      end

      def destroy
        post = Post.find(params[:post_id])
        post.reactions.where(user: current_user, emoji: emoji).destroy_all
        post.update!(reactions_count: post.reactions.count)
        render json: PostSerializer.new(post.reload).as_json
      end

      private

      def emoji
        params[:emoji].presence || params.dig(:reaction, :emoji).presence || "like"
      end
    end
  end
end
