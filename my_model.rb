require 'dm-core'
require 'dm-migrations'

DataMapper.setup(:default, "sqlite3://#{Dir.pwd}/development.db")

# contains DB properties.
class MyModel
  include DataMapper::Resource
  property :id, Serial
  property :title, String
  property :keywords, String
  # property :path, String
end

DataMapper.finalize

MyModel.auto_upgrade!
