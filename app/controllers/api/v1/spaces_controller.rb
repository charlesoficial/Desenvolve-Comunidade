module Api
  module V1
    class SpacesController < ApplicationController
      def index
        spaces = Space.includes(:community).ordered
        render json: spaces.map { |space| SpaceSerializer.new(space).as_json }
      end

      def show
        space = Space.find_by!(slug: params[:id])
        render json: SpaceSerializer.new(space).as_json
      end
    end
  end
end
