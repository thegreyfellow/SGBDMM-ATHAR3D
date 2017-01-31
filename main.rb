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
  if !models.empty?
    erb :results, locals: { 'models' => models, 'keyword' => keyword }
  else
    erb :model_not_found, locals: { 'keyword' => keyword }
  end
end

post '/results' do
  scene_models = params[:checked].join('-')
  erb :scene, locals: { 'scene_models' => scene_models }
end

not_found do
  erb :not_found
end
