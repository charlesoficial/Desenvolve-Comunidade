class LessonSerializer
  def initialize(lesson)
    @lesson = lesson
  end

  def as_json(*)
    {
      id: @lesson.id,
      title: @lesson.title,
      slug: @lesson.slug,
      body: @lesson.body,
      video_url: @lesson.video_url,
      position: @lesson.position,
      published: @lesson.published
    }
  end
end
