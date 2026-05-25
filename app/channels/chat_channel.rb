class ChatChannel < ApplicationCable::Channel
  def subscribed
    space = Space.find_by(slug: params[:space_slug])
    return reject unless space

    @space = space
    stream_for space
  end

  def unsubscribed
    stop_all_streams
  end

  def speak(data)
    return unless current_user
    return unless @space

    body = data["body"].to_s.strip
    return if body.empty?

    message = @space.messages.create!(
      user: current_user,
      body: body,
      parent_id: data["parent_id"].presence
    )

    payload = MessageSerializer.new(message).as_json
    ChatChannel.broadcast_to(@space, action: "message_created", message: payload)
  end

  def typing(data)
    return unless current_user
    return unless @space

    ChatChannel.broadcast_to(
      @space,
      action: "typing",
      user_id: current_user.id,
      username: current_user.username,
      is_typing: data["is_typing"] == true
    )
  end
end
