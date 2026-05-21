module Api
  module V1
    class CommentsController < ApplicationController
      before_action :require_current_user!, only: [:create, :update, :destroy]

      def index
        post = Post.find(params[:post_id])
        comments = post.comments.includes(:user).order(:created_at)
        render json: comments.map { |comment| CommentSerializer.new(comment).as_json }
      end

      def create
        post = Post.find(params[:post_id])
        comment = post.comments.create!(
          user: current_user,
          body: comment_params[:body],
          parent_id: comment_params[:parent_id]
        )
        render json: CommentSerializer.new(comment).as_json, status: :created
      end

      def update
        comment = editable_comment!
        return unless comment

        comment.update!(body: comment_params[:body])
        render json: CommentSerializer.new(comment).as_json
      end

      def destroy
        comment = editable_comment!
        return unless comment

        comment.destroy!
        head :no_content
      end

      private

      def comment_params
        params.require(:comment).permit(:body, :parent_id)
      end

      def editable_comment!
        comment = Post.find(params[:post_id]).comments.find(params[:id])
        return comment if comment.user_id == current_user.id || current_user.role.in?(%w[owner admin moderator])

        render json: { error: "forbidden" }, status: :forbidden
        nil
      end
    end
  end
end
