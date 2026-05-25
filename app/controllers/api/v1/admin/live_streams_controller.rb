module Api
  module V1
    module Admin
      # Lives / aulas ao vivo. Status: scheduled|live|ended|cancelled.
      class LiveStreamsController < BaseController
        def index
          rows = current_community ? current_community.live_streams.order(starts_at: :desc).includes(:user) : []
          render json: rows.map { |row| serialize(row) }
        end

        def create
          stream = current_community.live_streams.build(stream_params.merge(user: current_user))
          if stream.save
            render json: serialize(stream), status: :created
          else
            render json: { errors: stream.errors }, status: :unprocessable_entity
          end
        end

        def update
          stream = current_community&.live_streams&.find_by(id: params[:id])
          unless stream
            render json: { error: "stream_not_found" }, status: :not_found
            return
          end
          if stream.update(stream_params)
            render json: serialize(stream)
          else
            render json: { errors: stream.errors }, status: :unprocessable_entity
          end
        end

        def destroy
          stream = current_community&.live_streams&.find_by(id: params[:id])
          unless stream
            render json: { error: "stream_not_found" }, status: :not_found
            return
          end
          stream.destroy!
          head :no_content
        end

        private

        def stream_params
          params.require(:live_stream).permit(:title, :description, :starts_at, :ends_at, :status, :source_url, :recording_url)
        end

        def serialize(stream)
          {
            id: stream.id,
            title: stream.title,
            description: stream.description,
            starts_at: stream.starts_at&.iso8601,
            ends_at: stream.ends_at&.iso8601,
            status: stream.status,
            source_url: stream.source_url,
            recording_url: stream.recording_url,
            host: stream.user && {
              id: stream.user.id,
              username: stream.user.username,
              display_name: stream.user.display_name,
            },
          }
        end
      end
    end
  end
end
