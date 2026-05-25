module Api
  module V1
    module Admin
      # CRUD de paginas estaticas (about, regras, FAQ).
      class PagesController < BaseController
        def index
          rows = current_community ? current_community.static_pages.order(:position, :created_at) : []
          render json: rows.map { |row| serialize(row) }
        end

        def create
          page = current_community.static_pages.build(page_params)
          page.position ||= 0
          if page.save
            render json: serialize(page), status: :created
          else
            render json: { errors: page.errors }, status: :unprocessable_entity
          end
        end

        def update
          page = current_community&.static_pages&.find_by(id: params[:id])
          unless page
            render json: { error: "page_not_found" }, status: :not_found
            return
          end
          if page.update(page_params)
            render json: serialize(page)
          else
            render json: { errors: page.errors }, status: :unprocessable_entity
          end
        end

        def destroy
          page = current_community&.static_pages&.find_by(id: params[:id])
          unless page
            render json: { error: "page_not_found" }, status: :not_found
            return
          end
          page.destroy!
          head :no_content
        end

        private

        def page_params
          params.require(:page).permit(:title, :slug, :body, :published, :position)
        end

        def serialize(page)
          {
            id: page.id,
            title: page.title,
            slug: page.slug,
            body: page.body,
            published: page.published,
            position: page.position,
            updated_at: page.updated_at.iso8601,
          }
        end
      end
    end
  end
end
