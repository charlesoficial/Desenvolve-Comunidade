class PostSerializer
  def initialize(post)
    @post = post
  end

  def as_json(*)
    metadata = @post.metadata || {}

    {
      id: @post.id,
      title: @post.title,
      body: @post.body,
      status: @post.status,
      pinned: @post.pinned,
      published_at: @post.published_at,
      edited_at: @post.updated_at,
      comments_count: @post.comments_count,
      reactions_count: @post.reactions_count,
      views_count: metadata["views_count"].to_i,
      liked_by_viewer: false,
      saved_by_viewer: false,
      metadata: metadata,
      attachments: metadata["attachments"] || [],
      space: SpaceSerializer.new(@post.space).as_json,
      user: UserSerializer.new(@post.user).as_json
    }
  end
end
