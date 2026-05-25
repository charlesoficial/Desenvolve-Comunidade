Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    # Permite o frontend Vite local (5173), Rails (3000) e qualquer origin via APP_ORIGIN.
    allowed = [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      ENV["APP_ORIGIN"]
    ].compact

    origins(*allowed)

    resource "/api/*",
      headers: :any,
      methods: [:get, :post, :patch, :put, :delete, :options],
      credentials: true

    resource "/cable",
      headers: :any,
      methods: [:get, :post, :options],
      credentials: true
  end
end
