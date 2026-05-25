# Estrategia de queue:
# - test: sempre :test
# - dev/prod: usa :sidekiq SE Redis estiver alcancavel; caso contrario :inline.
#   Isso evita travar o boot quando o usuario nao tem Redis local rodando.
require "uri"
require "socket"

module CommunityPlatform
  module QueueAdapter
    module_function

    def reachable?(url)
      parsed = URI.parse(url)
      socket = TCPSocket.new(parsed.host || "localhost", parsed.port || 6379)
      socket.close
      true
    rescue StandardError
      false
    end
  end
end

queue_adapter =
  if Rails.env.test?
    :test
  elsif ENV["DISABLE_SIDEKIQ"] == "true"
    :inline
  else
    redis_url = ENV.fetch("REDIS_URL", "redis://localhost:6379/1")
    if CommunityPlatform::QueueAdapter.reachable?(redis_url)
      :sidekiq
    else
      Rails.logger.info("[ActiveJob] Redis indisponivel em #{redis_url} - usando :inline")
      :inline
    end
  end

Rails.application.config.active_job.queue_adapter = queue_adapter
