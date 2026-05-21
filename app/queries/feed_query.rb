class FeedQuery
  def initialize(scope = Post.all)
    @scope = scope
  end

  def call
    @scope.includes(:user, :space).published.recent_first
  end
end
