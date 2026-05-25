require "net/http"
require "openssl"
require "uri"
require "time"
require "digest"

module Uploads
  # Cliente minimalista para Cloudflare R2 (compativel com S3 v4).
  # Faz PUT direto com signed headers, sem precisar do gem aws-sdk-s3.
  # Variaveis de ambiente esperadas:
  #   CLOUDFLARE_R2_ACCOUNT_ID
  #   CLOUDFLARE_R2_BUCKET
  #   CLOUDFLARE_R2_ACCESS_KEY_ID
  #   CLOUDFLARE_R2_SECRET_ACCESS_KEY
  #   CLOUDFLARE_R2_PUBLIC_URL (opcional, ex: https://cdn.comunidade.com)
  module R2Adapter
    module_function

    SERVICE = "s3".freeze
    REGION  = "auto".freeze

    def put(io:, key:, content_type: nil)
      account_id  = ENV.fetch("CLOUDFLARE_R2_ACCOUNT_ID")
      bucket      = ENV.fetch("CLOUDFLARE_R2_BUCKET")
      access_key  = ENV.fetch("CLOUDFLARE_R2_ACCESS_KEY_ID")
      secret_key  = ENV.fetch("CLOUDFLARE_R2_SECRET_ACCESS_KEY")
      public_url  = ENV["CLOUDFLARE_R2_PUBLIC_URL"].to_s.sub(%r{/$}, "")

      host = "#{account_id}.r2.cloudflarestorage.com"
      url  = URI.parse("https://#{host}/#{bucket}/#{key}")
      io.rewind
      payload = io.read
      payload_hash = Digest::SHA256.hexdigest(payload)
      now = Time.now.utc

      headers = {
        "Host" => host,
        "x-amz-content-sha256" => payload_hash,
        "x-amz-date" => now.strftime("%Y%m%dT%H%M%SZ"),
      }
      headers["Content-Type"] = content_type if content_type

      authorization = sigv4_authorization(
        method: "PUT",
        url: url,
        headers: headers,
        payload_hash: payload_hash,
        access_key: access_key,
        secret_key: secret_key,
        now: now,
      )
      headers["Authorization"] = authorization

      Net::HTTP.start(url.host, url.port, use_ssl: true) do |http|
        request = Net::HTTP::Put.new(url.request_uri)
        headers.each { |k, v| request[k] = v }
        request.body = payload
        response = http.request(request)
        unless response.is_a?(Net::HTTPSuccess)
          raise "R2 upload failed (#{response.code}): #{response.body}"
        end
      end

      public_url.present? ? "#{public_url}/#{key}" : "https://#{host}/#{bucket}/#{key}"
    end

    # ---- Implementacao SigV4 ---------------------------------------------

    def sigv4_authorization(method:, url:, headers:, payload_hash:, access_key:, secret_key:, now:)
      amz_date = headers["x-amz-date"]
      datestamp = amz_date[0, 8]
      credential_scope = "#{datestamp}/#{REGION}/#{SERVICE}/aws4_request"

      canonical_uri = url.path.empty? ? "/" : url.path
      canonical_query = url.query.to_s
      sorted_headers = headers.sort_by { |k, _| k.downcase }
      canonical_headers = sorted_headers.map { |k, v| "#{k.downcase}:#{v.to_s.strip}\n" }.join
      signed_headers = sorted_headers.map { |k, _| k.downcase }.join(";")

      canonical_request = [
        method,
        canonical_uri,
        canonical_query,
        canonical_headers,
        signed_headers,
        payload_hash,
      ].join("\n")

      string_to_sign = [
        "AWS4-HMAC-SHA256",
        amz_date,
        credential_scope,
        Digest::SHA256.hexdigest(canonical_request),
      ].join("\n")

      signing_key = derive_signing_key(secret_key: secret_key, datestamp: datestamp)
      signature = OpenSSL::HMAC.hexdigest("sha256", signing_key, string_to_sign)

      "AWS4-HMAC-SHA256 " \
        "Credential=#{access_key}/#{credential_scope}, " \
        "SignedHeaders=#{signed_headers}, " \
        "Signature=#{signature}"
    end

    def derive_signing_key(secret_key:, datestamp:)
      k_date    = OpenSSL::HMAC.digest("sha256", "AWS4#{secret_key}", datestamp)
      k_region  = OpenSSL::HMAC.digest("sha256", k_date, REGION)
      k_service = OpenSSL::HMAC.digest("sha256", k_region, SERVICE)
      OpenSSL::HMAC.digest("sha256", k_service, "aws4_request")
    end
  end
end
