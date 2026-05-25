class LinkSubscriptionToPlan < ActiveRecord::Migration[7.2]
  def up
    unless column_exists?(:subscriptions, :plan_id)
      add_reference :subscriptions, :plan, type: :uuid, foreign_key: { on_delete: :nullify }, null: true
    end
  end

  def down
    remove_reference :subscriptions, :plan if column_exists?(:subscriptions, :plan_id)
  end
end
