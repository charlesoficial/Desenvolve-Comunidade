module Uploads
  # Decide onde gravar o arquivo:
  # - Producao com R2 configurado (CLOUDFLARE_R2_*) -> upload direto via S3 API
  # - Caso contrario -> grava em public/uploads/<yyyy-mm>/<uuid>.<ext>
  #
  # Em ambos os casos retorna { url:, key:, bytes:, content_type: }
  # com a URL acessivel ao frontend.
  module StorageStrategy
    module_function

    def upload(io:, filename:, content_type: nil, prefix: "uploads")
      bytes = io.size
      ext = File.extname(filename).downcase
      key = "#{prefix}/#{Time.current.strftime('%Y-%m')}/#{SecureRandom.uuid}#{ext}"

      if r2_configured?
        url = Uploads::R2Adapter.put(io: io, key: key, content_type: content_type)
      else
        url = Uploads::LocalAdapter.put(io: io, key: key)
      end

      {
        url: url,
        key: key,
        bytes: bytes,
        content_type: content_type,
      }
    end

    def r2_configured?
      %w[CLOUDFLARE_R2_ACCOUNT_ID CLOUDFLARE_R2_BUCKET CLOUDFLARE_R2_ACCESS_KEY_ID CLOUDFLARE_R2_SECRET_ACCESS_KEY].all? do |key|
        ENV[key].to_s.present?
      end
    end
  end
end
