require "net/http"
require "json"

module Supabase
  class Client
    def initialize(url: ENV.fetch("SUPABASE_URL"), key: ENV.fetch("SUPABASE_SERVICE_ROLE_KEY", ENV["SUPABASE_ANON_KEY"]))
      @url = url.delete_suffix("/")
      @key = key
    end

    def get(path, query: {})
      request(Net::HTTP::Get, path, query:)
    end

    def post(path, body:)
      request(Net::HTTP::Post, path, body:)
    end

    private

    def request(method, path, query: {}, body: nil)
      uri = URI("#{@url}/rest/v1/#{path.to_s.delete_prefix("/")}")
      uri.query = URI.encode_www_form(query) if query.any?

      http_request = method.new(uri)
      http_request["apikey"] = @key
      http_request["Authorization"] = "Bearer #{@key}"
      http_request["Content-Type"] = "application/json"
      http_request["Accept"] = "application/json"
      http_request.body = JSON.generate(body) if body

      response = Net::HTTP.start(uri.hostname, uri.port, use_ssl: uri.scheme == "https") do |http|
        http.request(http_request)
      end

      return nil if response.code.to_i == 204
      parsed = response.body.to_s.empty? ? nil : JSON.parse(response.body)
      response.is_a?(Net::HTTPSuccess) ? parsed : raise("Supabase request failed: #{response.code}")
    end
  end
end
