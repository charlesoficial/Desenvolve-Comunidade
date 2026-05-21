class MessageSerializer
  def initialize(message)
    @message = message
  end

  def as_json(*)
    {
      id: @message.id,
      body: @message.body,
      attachments: @message.attachments,
      parent_id: @message.parent_id,
      created_at: @message.created_at,
      edited_at: @message.edited_at,
      user: UserSerializer.new(@message.user).as_json
    }
  end
end
