class CourseSerializer
  def initialize(course)
    @course = course
  end

  def as_json(*)
    {
      id: @course.id,
      title: @course.title,
      slug: @course.slug,
      description: @course.description,
      position: @course.position,
      published: @course.published
    }
  end
end
