Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins ENV.fetch("APP_ORIGIN", "http://localhost:3000")
    resource "/api/*", headers: :any, methods: [:get, :post, :patch, :put, :delete, :options]
  end
end
