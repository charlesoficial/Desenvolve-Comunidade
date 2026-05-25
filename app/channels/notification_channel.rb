class NotificationChannel < ApplicationCable::Channel
  def subscribed
    return reject unless current_user

    stream_for current_user
  end

  def unsubscribed
    stop_all_streams
  end

  def mark_read(data)
    return unless current_user

    notification = current_user.notifications.find_by(id: data["notification_id"])
    notification&.update!(read_at: Time.current)
  end

  def mark_all_read
    return unless current_user

    current_user.notifications.where(read_at: nil).update_all(read_at: Time.current)
  end
end
