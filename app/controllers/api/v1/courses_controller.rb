module Api
  module V1
    class CoursesController < ApplicationController
      def index
        courses = Course.where(published: true).order(:position, :created_at)
        render json: courses.map { |course| CourseSerializer.new(course).as_json }
      end

      def show
        course = Course.find_by!(slug: params[:id])
        render json: CourseSerializer.new(course).as_json
      end
    end
  end
end
