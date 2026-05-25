module Api
  module V1
    module Admin
      # Lista uploads catalogados. UploadsController grava em StorageStrategy
      # mas nao linkava com a tabela; aqui apenas le o que ja foi catalogado.
      class FilesController < BaseController
        DEFAULT_PER_PAGE = 30
        MAX_PER_PAGE = 100

        def index
          page = [params[:page].to_i, 1].max
          per_page = params[:per_page].to_i
          per_page = DEFAULT_PER_PAGE if per_page <= 0
          per_page = [per_page, MAX_PER_PAGE].min

          scope = current_community ? current_community.upload_catalog_entries.order(created_at: :desc).includes(:user) : UploadCatalogEntry.none
          total = scope.count
          rows = scope.offset((page - 1) * per_page).limit(per_page)

          render json: {
            page: page,
            per_page: per_page,
            total: total,
            total_pages: total.zero? ? 0 : (total.to_f / per_page).ceil,
            files: rows.map { |row| serialize(row) },
          }
        end

        def destroy
          entry = current_community&.upload_catalog_entries&.find_by(id: params[:id])
          unless entry
            render json: { error: "entry_not_found" }, status: :not_found
            return
          end
          # Nao remove o arquivo do storage; so tira do catalogo.
          entry.destroy!
          head :no_content
        end

        private

        def serialize(entry)
          {
            id: entry.id,
            filename: entry.filename,
            url: entry.url,
            storage_key: entry.storage_key,
            content_type: entry.content_type,
            bytes: entry.bytes,
            backend: entry.backend,
            created_at: entry.created_at.iso8601,
            user: entry.user && {
              username: entry.user.username,
              display_name: entry.user.display_name,
            },
          }
        end
      end
    end
  end
end
