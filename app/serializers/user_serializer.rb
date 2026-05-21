class UserSerializer
  def initialize(user)
    @user = user
  end

  def as_json(*)
    {
      id: @user.id,
      username: @user.username,
      display_name: @user.display_name,
      avatar_url: @user.avatar_url,
      role: @user.role,
      status: @user.status
    }
  end
end
