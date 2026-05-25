Rails.application.routes.draw do
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

      namespace :admin do
        resource :community, controller: :community, only: [:show, :update]
        resource :dashboard, controller: :dashboard, only: [:show]
        resources :users, only: [:index, :show, :update]
        resources :spaces, only: [:index, :update] do
          collection do
            post :reorder
          end
        end
        resources :plans, only: [:index, :create, :update, :destroy]
        resources :paywalls, only: [:index, :create, :update, :destroy]
      end
    end
  end

  get "*path", to: "web/app#show", constraints: ->(request) do
    !request.xhr? && request.format.html?
  end

  root "web/app#show"
end
