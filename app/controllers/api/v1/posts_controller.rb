module Api
  module V1
    class PostsController < ApplicationController
      before_action :require_current_user!, only: [:create, :update, :destroy]

      def index
        posts = FeedQuery.new(post_scope).call
        render json: posts.map { |post| PostSerializer.new(post).as_json }
      end

      def show
        post = Post.includes(:user, :space).find(params[:id])
        render json: PostSerializer.new(post).as_json
      end

      def create
        space = find_space!
        post = space.posts.create!(
          user: current_user,
          title: post_params[:title],
          body: post_params[:body],
          metadata: post_metadata,
          published_at: Time.current
        )
        render json: PostSerializer.new(post).as_json, status: :created
      end

      def update
        post = current_user.posts.find(params[:id])
        attributes = post_params.except(:space_id, :space_slug, :attachments).to_h
        attributes[:metadata] = post.metadata.merge(post_metadata) if post_params.key?(:attachments)
        post.update!(attributes)
        render json: PostSerializer.new(post).as_json
      end

      def destroy
        post = current_user.posts.find(params[:id])
        post.update!(status: "archived")
        head :no_content
      end

      private

      def post_scope
        scope = Post.all
        if params[:space_slug].present?
          scope.joins(:space).where(spaces: { slug: params[:space_slug] })
        elsif params[:space_id].present?
          scope.where(space_id: params[:space_id])
        else
          scope
        end
      end

      def post_params
        params.require(:post).permit(
          :space_id,
          :space_slug,
          :title,
          :body,
          :pinned,
          metadata: {},
          attachments: [:id, :kind, :fileName, :fileUrl, :mimeType, :sizeBytes, :width, :height, :position]
        )
      end

      def find_space!
        return Space.find(post_params[:space_id]) if post_params[:space_id].present?

        Space.find_by!(slug: post_params[:space_slug])
      end

      def post_metadata
        metadata = post_params[:metadata].presence&.to_h || {}
        return metadata unless post_params.key?(:attachments)

        attachments = Array(post_params[:attachments]).map(&:to_h)
        metadata.merge("attachments" => attachments)
      end
    end
  end
end
