class Lesson < ApplicationRecord
  belongs_to :course

  validates :title, :slug, presence: true
  validates :slug, uniqueness: { scope: :course_id }
end
