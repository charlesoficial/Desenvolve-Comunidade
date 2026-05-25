class AiKnowledgeEntry < ApplicationRecord
  self.table_name = "ai_knowledge_entries"

  belongs_to :community
  validates :title, presence: true
end
