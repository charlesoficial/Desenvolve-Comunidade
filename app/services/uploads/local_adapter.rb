module Uploads
  # Adapter de fallback que escreve em public/uploads e retorna a URL
  # publica servida pelo Rails (ou pelo Vite via proxy em dev).
  module LocalAdapter
    module_function

    def put(io:, key:)
      target = Rails.public_path.join(key)
      FileUtils.mkdir_p(File.dirname(target))
      File.open(target, "wb") do |f|
        io.rewind
        IO.copy_stream(io, f)
      end

      "/#{key}"
    end
  end
end
