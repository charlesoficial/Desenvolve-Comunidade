# Implementações pendentes — pronto pra aplicar

Este documento contém **código pronto** para as 3 lacunas críticas
identificadas em 22/05/2026. Aplicar quando o `DATABASE_URL` for resolvido
e o Rails subir.

---

## 1. ChatChannel — Action Cable real-time

**Arquivo:** `app/channels/chat_channel.rb`
**Estado atual:** stub vazio
**Implementação:**

```ruby
class ChatChannel < ApplicationCable::Channel
  def subscribed
    space = Space.find_by(slug: params[:space_slug])
    return reject unless space

    @space = space
    stream_for space
  end

  def unsubscribed
    stop_all_streams
  end

  def speak(data)
    return unless current_user
    return unless @space

    body = data["body"].to_s.strip
    return if body.empty?

    message = @space.messages.create!(
      user: current_user,
      body: body,
      parent_id: data["parent_id"]
    )

    payload = MessageSerializer.new(message).as_json
    ChatChannel.broadcast_to(@space, action: "message_created", message: payload)
  end
end
```

---

## 2. NotificationChannel

**Arquivo:** `app/channels/notification_channel.rb`

```ruby
class NotificationChannel < ApplicationCable::Channel
  def subscribed
    return reject unless current_user
    stream_for current_user
  end

  def unsubscribed
    stop_all_streams
  end

  def mark_read(data)
    notification = current_user.notifications.find(data["notification_id"])
    notification.update!(read_at: Time.current) if notification
  end
end
```

---

## 3. PresenceChannel

**Arquivo:** `app/channels/presence_channel.rb`

```ruby
class PresenceChannel < ApplicationCable::Channel
  def subscribed
    return reject unless current_user

    stream_from "presence:community:#{params[:community_id]}"

    current_user.update_columns(
      status: "online",
      last_seen_at: Time.current
    )

    ActionCable.server.broadcast(
      "presence:community:#{params[:community_id]}",
      action: "user_online",
      user_id: current_user.id,
      username: current_user.username,
      timestamp: Time.current.iso8601
    )
  end

  def unsubscribed
    return unless current_user

    current_user.update_columns(
      status: "offline",
      last_seen_at: Time.current
    )

    ActionCable.server.broadcast(
      "presence:community:#{params[:community_id]}",
      action: "user_offline",
      user_id: current_user.id,
      username: current_user.username,
      timestamp: Time.current.iso8601
    )
  end
end
```

---

## 4. ApplicationCable::Connection — autenticação WebSocket

**Arquivo:** `app/channels/application_cable/connection.rb`
**Adicionar identificação por session ou token:**

```ruby
module ApplicationCable
  class Connection < ActionCable::Connection::Base
    identified_by :current_user

    def connect
      self.current_user = find_verified_user
    end

    private

    def find_verified_user
      user_id = request.session[:user_id]
      user = User.find_by(id: user_id) if user_id.present?

      # Fallback de desenvolvimento (mesma logica do ApplicationController)
      user ||= if Rails.env.development? || Rails.env.test?
        User.find_by(username: "vitor-araujo") || User.order(:created_at).first
      end

      reject_unauthorized_connection unless user
      user
    end
  end
end
```

---

## 5. AuthController — login real (sem Devise, com bcrypt)

**Pré-requisito:** adicionar ao `Gemfile`:

```ruby
gem "bcrypt", "~> 3.1"
```

E migration:

```ruby
class AddPasswordDigestToUsers < ActiveRecord::Migration[7.2]
  def change
    add_column :users, :password_digest, :string
  end
end
```

**Atualizar `app/models/user.rb`:**

```ruby
class User < ApplicationRecord
  has_secure_password validations: false

  # ...resto das associações que ja existem
end
```

**Atualizar `app/controllers/api/v1/auth_controller.rb`:**

```ruby
module Api
  module V1
    class AuthController < ApplicationController
      def show
        if current_user
          render json: { user: UserSerializer.new(current_user).as_json }
        else
          render json: { user: nil }
        end
      end

      def create
        user = User.find_by(email: params[:email].to_s.downcase.strip)

        if user&.authenticate(params[:password])
          session[:user_id] = user.id
          render json: { user: UserSerializer.new(user).as_json }
        else
          render json: { error: "invalid_credentials" }, status: :unauthorized
        end
      end

      def destroy
        session.delete(:user_id)
        head :no_content
      end
    end
  end
end
```

---

## 6. Endpoint de signup (registro)

**Adicionar no `routes.rb`:**

```ruby
post "/auth/signup", to: "auth#signup"
```

**Adicionar no AuthController:**

```ruby
def signup
  user = User.new(
    email: params[:email].to_s.downcase.strip,
    username: params[:username].to_s.strip,
    display_name: params[:display_name].to_s.strip,
    password: params[:password],
    role: "member",
    status: "offline"
  )

  if user.save
    session[:user_id] = user.id
    render json: { user: UserSerializer.new(user).as_json }, status: :created
  else
    render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
  end
end
```

---

## 7. CORS (se frontend SPA estiver em domínio separado)

**Já tem `rack-cors` no Gemfile.** Adicionar/conferir
`config/initializers/cors.rb`:

```ruby
Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins "http://127.0.0.1:5173", "http://localhost:5173"
    resource "*",
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head],
      credentials: true
  end
end
```

E configurar fetch no frontend pra mandar cookies:

```ts
fetch(url, { credentials: "include", ... })
```
