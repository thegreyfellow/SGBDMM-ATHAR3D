require './my_model'
require 'sinatra'
require 'sinatra/reloader'

# set :public_folder, 'assets'
# set :views, 'templates'

get '/' do
  erb :home
end
post '/' do
  keyword = params[:keyword]
  # searching for models with keyword in them.
  models = MyModel.all(:keywords.like => "%#{keyword}%")
  erb :results, locals: { 'models' => models, 'keyword' => keyword }
end
post '/results' do
  scene_models = params[:checked].join('-')
  erb :scene, locals: { 'scene_models' => scene_models }
end
not_found do
  erb :not_found
end
