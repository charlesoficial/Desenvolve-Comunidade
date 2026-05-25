class UploadCatalogEntry < ApplicationRecord
  self.table_name = "uploads_catalog"

  belongs_to :community
  belongs_to :user, optional: true
end
