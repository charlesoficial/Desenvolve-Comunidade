Rails.application.routes.draw do
  get "/healthz", to: "health#show"
  get "/up", to: "health#show"

  namespace :api do
    namespace :v1 do
      resource :auth, controller: :auth, only: [:show, :create, :destroy]
      post "auth/signup", to: "auth#signup"
      resources :spaces, only: [:index, :show]
      resources :posts, only: [:index, :show, :create, :update, :destroy] do
        resources :comments, only: [:index, :create, :update, :destroy]
        resource :reaction, only: [:create, :destroy], controller: :post_reactions
      end
      resources :memberships, only: [:index, :show]
      resources :courses, only: [:index, :show]
      resources :lessons, only: [:index, :show]
      resources :rankings, only: [:index]
      resources :notifications, only: [:index, :update] do
        patch :mark_all_read, on: :collection
        patch :archive, on: :member
      end
      resources :messages, only: [:index, :create]
      resources :direct_conversations, only: [:index, :show, :create] do
        get :messages, on: :member
        post :messages, on: :member
        patch :read, on: :member
      end
      resources :member_connections, only: [:index, :create, :update]
      resources :uploads, only: [:create]
      resource :billing, controller: :billing, only: [:show, :create]
      post "billing/webhook", to: "billing_webhooks#create"

      namespace :admin do
        resource :community, controller: :community, only: [:show, :update]
        resource :dashboard, controller: :dashboard, only: [:show]
        resource :analytics, controller: :analytics, only: [:show]
        resources :users, only: [:index, :show, :update]
        resources :spaces, only: [:index, :update] do
          collection do
            post :reorder
          end
        end
        resources :plans, only: [:index, :create, :update, :destroy]
        resources :paywalls, only: [:index, :create, :update, :destroy]
        resources :memberships, only: [:index, :update, :destroy]
        resources :workflows, only: [:index, :create, :update, :destroy]
        resources :api_tokens, only: [:index, :create, :destroy]
        resources :posts, only: [:index, :destroy] do
          collection do
            post :bulk_destroy
          end
        end
        resources :ai_knowledge, controller: :ai_knowledge, only: [:index, :create, :update, :destroy]
        resources :email_templates, only: [:index, :update]
        resources :files, only: [:index, :destroy]
        resources :affiliates, only: [:index, :create, :update, :destroy]
        get  "settings/:key", to: "settings#show", constraints: { key: /[a-z_]+/ }
        patch "settings/:key", to: "settings#update", constraints: { key: /[a-z_]+/ }
        resources :coupons, only: [:index, :create, :update, :destroy]
        resources :member_tags, only: [:index, :create, :update, :destroy]
        resources :segments, only: [:index, :create, :update, :destroy]
        resources :access_groups, only: [:index, :create, :update, :destroy]
        resource  :gamification, controller: :gamification, only: [:show, :update]
        resources :subscriptions, only: [:index, :update]
        resources :charges, only: [:index]
        resources :pages, only: [:index, :create, :update, :destroy]
        resources :topics, only: [:index, :create, :update, :destroy]
        resources :live_streams, only: [:index, :create, :update, :destroy]
        resources :bulk_actions, only: [:index, :create]
      end
    end
  end

  get "*path", to: "web/app#show", constraints: ->(request) do
    !request.xhr? && request.format.html?
  end

  root "web/app#show"
end
