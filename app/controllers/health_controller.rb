# Healthcheck simples pra Fly.io / load balancers. Retorna 200 quando o
# DB responde a uma query trivial. Sem auth porque precisa funcionar em
# qualquer ponto do ciclo de boot.
class HealthController < ActionController::API
  def show
    db_ok = ActiveRecord::Base.connection.execute("SELECT 1").any?
    render json: {
      status: db_ok ? "ok" : "degraded",
      time: Time.current.iso8601,
      db: db_ok,
    }
  rescue StandardError => e
    render json: { status: "error", message: e.message }, status: :service_unavailable
  end
end
