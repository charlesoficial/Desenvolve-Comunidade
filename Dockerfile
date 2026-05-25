# syntax=docker/dockerfile:1.7
# Imagem multi-stage para deploy do Rails+Vite na Fly.io.
# Stage 1: builda os assets Vite + bundle do Rails.
ARG RUBY_VERSION=3.3.11
ARG NODE_VERSION=22

FROM node:${NODE_VERSION}-bookworm-slim AS frontend
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --no-audit --no-fund
COPY . .
RUN npm run build

FROM ruby:${RUBY_VERSION}-slim-bookworm AS bundle
WORKDIR /app
ENV BUNDLE_DEPLOYMENT=1 \
    BUNDLE_PATH=/usr/local/bundle \
    BUNDLE_WITHOUT="development:test" \
    RAILS_ENV=production \
    SECRET_KEY_BASE_DUMMY=1
RUN apt-get update -qq && \
    apt-get install -y --no-install-recommends build-essential libpq-dev libyaml-dev pkg-config curl git && \
    rm -rf /var/lib/apt/lists/*
COPY Gemfile Gemfile.lock ./
RUN bundle config set without "development test" && \
    bundle install --jobs=4 --retry=3 && \
    bundle exec bootsnap precompile --gemfile || true

# Stage final: imagem leve com binarios + assets compilados.
FROM ruby:${RUBY_VERSION}-slim-bookworm AS runtime
WORKDIR /app
ENV BUNDLE_DEPLOYMENT=1 \
    BUNDLE_PATH=/usr/local/bundle \
    BUNDLE_WITHOUT="development:test" \
    RAILS_ENV=production \
    RAILS_LOG_TO_STDOUT=1 \
    RAILS_SERVE_STATIC_FILES=1 \
    PORT=3000

RUN apt-get update -qq && \
    apt-get install -y --no-install-recommends libpq5 libyaml-0-2 curl && \
    rm -rf /var/lib/apt/lists/*

COPY --from=bundle /usr/local/bundle /usr/local/bundle
COPY --from=frontend /app /app
COPY --from=frontend /app/public /app/public

# Pre-compila assets ja com SECRET_KEY_BASE de dummy (sera injetado em runtime).
RUN SECRET_KEY_BASE=dummy bundle exec rails assets:precompile

EXPOSE 3000
CMD ["bundle", "exec", "rails", "server", "-b", "0.0.0.0", "-p", "3000"]
