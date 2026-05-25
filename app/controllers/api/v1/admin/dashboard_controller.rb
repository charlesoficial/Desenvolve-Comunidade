module Api
  module V1
    module Admin
      # GET /api/v1/admin/dashboard
      # Retorna KPIs basicos da comunidade ativa pra alimentar a tela /settings/dashboard.
      class DashboardController < BaseController
        def show
          community = current_community
          unless community
            render json: empty_payload
            return
          end

          now = Time.current
          last_30 = now - 30.days
          previous_30 = last_30 - 30.days

          active_members = User.where(status: %w[online away]).count
          total_members = community.users.count
          new_members_week = community.users.where("memberships.joined_at >= ?", now - 7.days).count
          new_members_prev_week = community.users.where("memberships.joined_at >= ? AND memberships.joined_at < ?", now - 14.days, now - 7.days).count

          posts_scope = Post.joins(:space).where(spaces: { community_id: community.id })
          posts_30 = posts_scope.where("posts.created_at >= ?", last_30).count
          posts_prev_30 = posts_scope.where("posts.created_at >= ? AND posts.created_at < ?", previous_30, last_30).count

          comments_30 = Comment.joins(post: :space).where(spaces: { community_id: community.id }).where("comments.created_at >= ?", last_30).count

          render json: {
            community_id: community.id,
            generated_at: now.iso8601,
            stats: [
              {
                key: "active_members",
                label: "Membros ativos",
                value: active_members,
                delta_pct: percent_delta(active_members, total_members),
                positive: active_members >= 0,
              },
              {
                key: "new_members_week",
                label: "Novos esta semana",
                value: new_members_week,
                delta_pct: percent_delta(new_members_week, new_members_prev_week),
                positive: new_members_week >= new_members_prev_week,
              },
              {
                key: "posts_30",
                label: "Posts (30 dias)",
                value: posts_30,
                delta_pct: percent_delta(posts_30, posts_prev_30),
                positive: posts_30 >= posts_prev_30,
              },
              {
                key: "comments_30",
                label: "Comentários (30 dias)",
                value: comments_30,
                delta_pct: nil,
                positive: true,
              },
            ],
            totals: {
              members: total_members,
              spaces: community.spaces.count,
              posts: posts_scope.count,
            },
          }
        end

        private

        def empty_payload
          {
            community_id: nil,
            generated_at: Time.current.iso8601,
            stats: [],
            totals: { members: 0, spaces: 0, posts: 0 },
          }
        end

        def percent_delta(current, previous)
          return nil if previous.nil? || previous.zero?

          (((current - previous).to_f / previous) * 100).round(1)
        end
      end
    end
  end
end
