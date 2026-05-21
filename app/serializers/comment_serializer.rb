class CommentSerializer
  def initialize(comment)
    @comment = comment
  end

  def as_json(*)
    {
      id: @comment.id,
      body: @comment.body,
      parent_id: @comment.parent_id,
      reactions_count: @comment.reactions_count,
      created_at: @comment.created_at,
      user: UserSerializer.new(@comment.user).as_json
    }
  end
end
