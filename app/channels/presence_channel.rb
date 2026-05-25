class PresenceChannel < ApplicationCable::Channel
  def subscribed
    return reject unless current_user

    @community_id = params[:community_id]
    stream_from presence_stream

    set_status!("online")
    broadcast_status("user_online")
  end

  def unsubscribed
    return unless current_user

    set_status!("offline")
    broadcast_status("user_offline")
  end

  def update_status(data)
    return unless current_user

    new_status = %w[online away offline].include?(data["status"]) ? data["status"] : "online"
    set_status!(new_status)
    broadcast_status("user_status_changed", new_status)
  end

  private

  def presence_stream
    "presence:community:#{@community_id || "global"}"
  end

  def set_status!(status)
    current_user.update_columns(status: status, last_seen_at: Time.current)
  end

  def broadcast_status(action, status = nil)
    ActionCable.server.broadcast(
      presence_stream,
      action: action,
      user_id: current_user.id,
      username: current_user.username,
      status: status || current_user.status,
      timestamp: Time.current.iso8601
    )
  end
end
