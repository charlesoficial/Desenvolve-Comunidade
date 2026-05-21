module Api
  module V1
    class LessonsController < ApplicationController
      def index
        lessons = Lesson.where(published: true).order(:position, :created_at)
        render json: lessons.map { |lesson| LessonSerializer.new(lesson).as_json }
      end

      def show
        lesson = Lesson.find_by!(slug: params[:id])
        render json: LessonSerializer.new(lesson).as_json
      end
    end
  end
end
