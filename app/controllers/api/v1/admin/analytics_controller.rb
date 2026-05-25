module Api
  module V1
    module Admin
      # GET /api/v1/admin/analytics
      # Series diarias dos ultimos 30 dias para signups, posts e mensagens.
      class AnalyticsController < BaseController
        DAYS = 30

        def show
          community = current_community
          unless community
            render json: empty_payload
            return
          end

          today = Time.current.to_date
          start_date = today - (DAYS - 1)

          signups = User.where("created_at >= ?", start_date)
                        .group("DATE(created_at)")
                        .count

          space_ids = community.spaces.pluck(:id)
          posts = Post.where(space_id: space_ids)
                      .where("created_at >= ?", start_date)
                      .group("DATE(created_at)")
                      .count
          messages = Message.where(space_id: space_ids)
                            .where("created_at >= ?", start_date)
                            .group("DATE(created_at)")
                            .count

          series = (0...DAYS).map do |offset|
            d = start_date + offset
            {
              date: d.iso8601,
              signups: signups[d] || 0,
              posts: posts[d] || 0,
              messages: messages[d] || 0,
            }
          end

          render json: {
            community_id: community.id,
            generated_at: Time.current.iso8601,
            series: series,
            totals: {
              signups: series.sum { |row| row[:signups] },
              posts: series.sum { |row| row[:posts] },
              messages: series.sum { |row| row[:messages] },
            },
          }
        end

        private

        def empty_payload
          {
            community_id: nil,
            generated_at: Time.current.iso8601,
            series: [],
            totals: { signups: 0, posts: 0, messages: 0 },
          }
        end
      end
    end
  end
end
