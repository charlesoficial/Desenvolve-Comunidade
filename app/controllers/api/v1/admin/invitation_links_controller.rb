module Api
  module V1
    module Admin
      class InvitationLinksController < BaseController
        def index
          rows = current_community ? current_community.invitation_links.order(created_at: :desc) : []
          render json: rows.map(&:to_admin_hash)
        end

        def create
          link = current_community.invitation_links.build(link_params)
          link.created_by_id = current_user&.id if defined?(current_user)
          if link.save
            render json: link.to_admin_hash, status: :created
          else
            render json: { errors: link.errors }, status: :unprocessable_entity
          end
        end

        def update
          link = current_community&.invitation_links&.find_by(id: params[:id])
          unless link
            render json: { error: "link_not_found" }, status: :not_found
            return
          end
          if link.update(link_params)
            render json: link.to_admin_hash
          else
            render json: { errors: link.errors }, status: :unprocessable_entity
          end
        end

        def destroy
          link = current_community&.invitation_links&.find_by(id: params[:id])
          unless link
            render json: { error: "link_not_found" }, status: :not_found
            return
          end
          link.destroy!
          head :no_content
        end

        private

        def link_params
          params.require(:invitation_link).permit(
            :code, :name, :description, :max_uses, :expires_at,
            :active, :plan_id, :member_tag_id,
          )
        end
      end
    end
  end
end
