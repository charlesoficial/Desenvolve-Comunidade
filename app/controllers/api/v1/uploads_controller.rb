module Api
  module V1
    class UploadsController < ApplicationController
      before_action :require_current_user!

      MAX_BYTES = 25.megabytes
      ALLOWED_TYPES = %w[
        image/png image/jpeg image/webp image/gif
        video/mp4 video/quicktime video/webm
        application/pdf application/zip application/octet-stream
      ].freeze

      def create
        file = params[:file] || params.dig(:upload, :file)
        unless file.respond_to?(:read) && file.respond_to?(:original_filename)
          render json: { error: "missing_file" }, status: :unprocessable_entity
          return
        end

        if file.size > MAX_BYTES
          render json: { error: "file_too_large", limit: MAX_BYTES }, status: :payload_too_large
          return
        end

        content_type = file.content_type.presence
        if content_type && ALLOWED_TYPES.exclude?(content_type)
          render json: { error: "unsupported_type", content_type: content_type }, status: :unsupported_media_type
          return
        end

        result = Uploads::StorageStrategy.upload(
          io: file.tempfile,
          filename: file.original_filename,
          content_type: content_type,
        )

        # Cataloga o upload pra aparecer em /settings/files. Quando a comunidade
        # nao existe ainda, faz best-effort e ignora falhas pra nao quebrar o upload.
        catalog_entry = nil
        if defined?(UploadCatalogEntry) && Community.any?
          community = Community.order(:created_at).first
          catalog_entry = UploadCatalogEntry.create(
            community: community,
            user: current_user,
            filename: file.original_filename,
            url: result[:url],
            storage_key: result[:key],
            content_type: result[:content_type],
            bytes: result[:bytes].to_i,
            backend: Uploads::StorageStrategy.r2_configured? ? "r2" : "local",
          )
        end

        render json: {
          id: catalog_entry&.id,
          url: result[:url],
          key: result[:key],
          bytes: result[:bytes],
          content_type: result[:content_type],
          backend: Uploads::StorageStrategy.r2_configured? ? "r2" : "local",
        }, status: :created
      rescue StandardError => e
        Rails.logger.error("[UploadsController] #{e.class}: #{e.message}")
        render json: { error: "upload_failed", message: e.message }, status: :internal_server_error
      end
    end
  end
end
