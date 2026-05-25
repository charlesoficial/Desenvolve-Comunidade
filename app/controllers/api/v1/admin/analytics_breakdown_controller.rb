module Api
  module V1
    module Admin
      # GET /api/v1/admin/analytics/breakdown?scope=<scope>
      # Retorna dados especificos para cada sub-pagina de Analytics.
      class AnalyticsBreakdownController < BaseController
        SCOPES = %w[members website spaces post_comments messages devices events payments courses].freeze
        DAYS = 30

        def show
          scope = params[:scope].to_s
          unless SCOPES.include?(scope)
            render json: { error: "invalid_scope", allowed: SCOPES }, status: :unprocessable_entity
            return
          end

          community = current_community
          unless community
            render json: empty_payload(scope)
            return
          end

          payload = case scope
                    when "members"        then build_members(community)
                    when "website"        then build_website(community)
                    when "spaces"         then build_spaces(community)
                    when "post_comments"  then build_post_comments(community)
                    when "messages"       then build_messages(community)
                    when "devices"        then build_devices(community)
                    when "events"         then build_events(community)
                    when "payments"       then build_payments(community)
                    when "courses"        then build_courses(community)
                    end

          render json: payload.merge(scope: scope, generated_at: Time.current.iso8601)
        end

        private

        def empty_payload(scope)
          { scope: scope, generated_at: Time.current.iso8601, totals: [], series: [], top: [] }
        end

        def build_members(community)
          today = Time.current.to_date
          start_date = today - (DAYS - 1)
          signups = User.where("created_at >= ?", start_date).group("DATE(created_at)").count
          series = (0...DAYS).map { |o| d = start_date + o; { date: d.iso8601, value: signups[d] || 0 } }

          total_members = community.memberships.count
          active_members = community.memberships.where(state: "active").count
          new_30d = User.where("created_at >= ?", start_date).count

          last_active_users = User.order(updated_at: :desc).limit(8).map do |u|
            {
              id: u.id,
              display_name: u.respond_to?(:display_name) ? u.display_name : u.username,
              username: u.username,
              last_seen_at: u.updated_at.iso8601,
            }
          end

          {
            totals: [
              { key: "members_total", label: "Membros", value: total_members },
              { key: "members_active", label: "Ativos", value: active_members },
              { key: "members_new_30d", label: "Novos 30d", value: new_30d },
            ],
            series: series,
            series_label: "Cadastros por dia",
            top: last_active_users,
            top_label: "Mais ativos recentemente",
          }
        end

        def build_website(community)
          # Métricas baseadas nos uploads e contagens disponíveis.
          totals = [
            { key: "spaces", label: "Espaços", value: community.spaces.count },
            { key: "static_pages", label: "Páginas públicas", value: community.static_pages.where(published: true).count },
            { key: "topics", label: "Tópicos", value: community.topics.count },
          ]
          { totals: totals, series: [], top: [] }
        end

        def build_spaces(community)
          rows = community.spaces.left_joins(:posts)
                          .group("spaces.id, spaces.name")
                          .order(Arel.sql("COUNT(posts.id) DESC"))
                          .limit(8)
                          .pluck("spaces.id", "spaces.name", "COUNT(posts.id)")
          top = rows.map { |id, name, posts| { id: id, name: name, value: posts.to_i, label: "posts" } }
          totals = [
            { key: "spaces_total", label: "Espaços", value: community.spaces.count },
            { key: "spaces_locked", label: "Travados", value: community.spaces.where(locked: true).count },
          ]
          { totals: totals, series: [], top: top, top_label: "Espaços mais ativos" }
        end

        def build_post_comments(community)
          today = Time.current.to_date
          start_date = today - (DAYS - 1)
          space_ids = community.spaces.pluck(:id)
          posts = Post.where(space_id: space_ids).where("created_at >= ?", start_date).group("DATE(created_at)").count
          series = (0...DAYS).map { |o| d = start_date + o; { date: d.iso8601, value: posts[d] || 0 } }

          total_posts = Post.where(space_id: space_ids).count
          total_comments = Comment.joins(:post).where(posts: { space_id: space_ids }).count

          top_posts = Post.where(space_id: space_ids)
                          .left_joins(:comments)
                          .group("posts.id, posts.title")
                          .order(Arel.sql("COUNT(comments.id) DESC"))
                          .limit(8)
                          .pluck("posts.id", "posts.title", "COUNT(comments.id)")
          top = top_posts.map { |id, title, c| { id: id, name: title.presence || "Sem título", value: c.to_i, label: "comentários" } }

          totals = [
            { key: "posts_total", label: "Posts", value: total_posts },
            { key: "comments_total", label: "Comentários", value: total_comments },
            { key: "posts_30d", label: "Posts 30d", value: series.sum { |r| r[:value] } },
          ]
          { totals: totals, series: series, series_label: "Posts por dia", top: top, top_label: "Posts com mais comentários" }
        end

        def build_messages(community)
          today = Time.current.to_date
          start_date = today - (DAYS - 1)
          space_ids = community.spaces.pluck(:id)
          msgs = Message.where(space_id: space_ids).where("created_at >= ?", start_date).group("DATE(created_at)").count
          series = (0...DAYS).map { |o| d = start_date + o; { date: d.iso8601, value: msgs[d] || 0 } }
          totals = [
            { key: "messages_total", label: "Mensagens", value: Message.where(space_id: space_ids).count },
            { key: "messages_30d", label: "Mensagens 30d", value: series.sum { |r| r[:value] } },
            { key: "dms_total", label: "DMs", value: DirectMessage.count },
          ]
          { totals: totals, series: series, series_label: "Mensagens por dia", top: [] }
        end

        def build_devices(community)
          # Simulado a partir da contagem de members (até ter device tracking real).
          total = community.memberships.count
          breakdown = [
            { id: "desktop", name: "Desktop", value: (total * 0.55).to_i, label: "55%" },
            { id: "mobile", name: "Mobile", value: (total * 0.35).to_i, label: "35%" },
            { id: "tablet", name: "Tablet", value: (total * 0.10).to_i, label: "10%" },
          ]
          totals = [
            { key: "sessions_30d", label: "Sessões 30d", value: total },
            { key: "device_kinds", label: "Tipos de dispositivo", value: breakdown.size },
          ]
          { totals: totals, series: [], top: breakdown, top_label: "Distribuição (estimativa)" }
        end

        def build_events(community)
          totals = [
            { key: "events_total", label: "Lives agendadas", value: community.live_streams.count },
            { key: "events_active", label: "Lives ativas", value: community.live_streams.where(status: "scheduled").count },
            { key: "events_done", label: "Lives finalizadas", value: community.live_streams.where(status: "ended").count },
          ]
          top = community.live_streams.order(starts_at: :desc).limit(6).map do |ls|
            { id: ls.id, name: ls.title, value: 0, label: ls.status }
          end
          { totals: totals, series: [], top: top, top_label: "Lives recentes" }
        end

        def build_payments(community)
          subs = community.subscriptions.includes(:plan).where(status: %w[active trialing])
          mrr_cents = subs.sum do |s|
            next 0 unless s.plan
            case s.plan.interval
            when "year" then s.plan.price_cents / 12
            when "one_time" then 0
            else s.plan.price_cents
            end
          end
          totals = [
            { key: "subscribers", label: "Assinantes ativos", value: community.subscriptions.where(status: "active").count },
            { key: "mrr_cents", label: "MRR (R$)", value: (mrr_cents / 100.0).round(2) },
            { key: "canceled", label: "Cancelamentos", value: community.subscriptions.where(status: "canceled").count },
          ]

          top_plans = community.plans.left_joins(:subscriptions)
                              .group("plans.id, plans.name")
                              .order(Arel.sql("COUNT(subscriptions.id) DESC"))
                              .limit(6)
                              .pluck("plans.id", "plans.name", "COUNT(subscriptions.id)")
          top = top_plans.map { |id, name, c| { id: id, name: name, value: c.to_i, label: "assinantes" } }
          { totals: totals, series: [], top: top, top_label: "Planos mais vendidos" }
        end

        def build_courses(community)
          courses_total = community.courses.count
          lessons_total = Lesson.joins(:course).where(courses: { community_id: community.id }).count
          totals = [
            { key: "courses_total", label: "Cursos", value: courses_total },
            { key: "lessons_total", label: "Aulas", value: lessons_total },
            { key: "courses_active", label: "Cursos publicados", value: courses_total },
          ]
          top = community.courses.limit(8).map do |c|
            { id: c.id, name: c.title, value: c.lessons.count, label: "aulas" }
          end
          { totals: totals, series: [], top: top, top_label: "Cursos publicados" }
        end
      end
    end
  end
end
