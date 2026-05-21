class SpaceSerializer
  def initialize(space)
    @space = space
  end

  def as_json(*)
    {
      id: @space.id,
      name: @space.name,
      slug: @space.slug,
      kind: @space.kind,
      icon: @space.icon,
      locked: @space.locked,
      position: @space.position,
      parent_id: @space.parent_id,
      settings: @space.settings
    }
  end
end
