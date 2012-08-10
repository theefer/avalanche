require 'rubygems'
require 'sinatra'
require 'json'

set :public_folder, '.'

module JSONable
  def to_json
    to_hash.to_json
  end
end

class Tag
  include JSONable

  attr_reader :type

  def id; @name; end

  def initialize(name)
    @name = name
    @type = 'tag'
  end

  def to_hash
    {"name" => @name}
  end
end

class User
  include JSONable

  attr_reader :id, :type

  def initialize(id, nickname)
    @id = id
    @nickname = nickname
    @type = 'user'
  end

  def to_hash
    {
      "nickname" => @nickname
    }
  end
end

class Task
  include JSONable

  attr_reader :id, :type

  def initialize(id, title, tags, done)
    @id = id
    @title = title
    @tags = tags
    @done = done
    @author = User.new(777, 'abraham')
    @type = 'task'
  end

  def to_hash
    {
      "id"    => @id,
      "title" => @title,
      "done"  => @done,
      "author" => serializeObject(@author),
      "tags"  => @tags.map {|t| serializeObject(t)}
    }
  end

  def self.extract_title_and_tags(s)
    title = s.gsub(/\s?\#[a-z]+\s?/, ' ').strip
    tags = s.scan(/\#([a-z]+)/).map {|w| Tag.new(w)}
    [title, tags]
  end

  def self.new_from_data(data)
    title, tags = extract_title_and_tags(data["title"])
    new(data["id"], title, tags, data["done"])
  end
end

class TaskManager
  def initialize
    @tasks = []
  end

  def add(task)
    @tasks.push(task)
  end

  def next_id
    @tasks.map(&:id).max + 1
  end

  def find(id)
    @tasks.find {|t| t.id == id}
  end

  def replace(id, task)
    index = @tasks.index {|t| t.id == id} or raise "cannot find element to replace!"
    @tasks[index] = task
  end

  def replaceAll(tasks)
    @tasks = tasks
  end

  def delete(id)
    @tasks.delete_if {|t| t.id == id}
  end

  def all
    @tasks
  end
end

TASKS = TaskManager.new
TASKS.add Task.new(1, "Default Task", [Tag.new('demo')], false)

def serializeObject(obj)
  {"uri" => "/api/#{obj.type}s/#{obj.id}",
   # "mediaType" => obj.type,
   "data" => obj.to_hash}
end

get '/api' do
  content_type 'application/vnd.object+json'
  {"links" => [{"rel" => "tasks",   "href" => "/api/tasks"},
               {"rel" => "version", "href" => "/api/version"}]}.to_json
end

get '/api/version' do
  content_type 'application/json'
  "0.1"
end

get '/api/tasks' do
  content_type 'application/vnd.objectclass+json'
  {"links" => [{"rel" => "item",    "href" => "/api/tasks/{id}"},
               {"rel" => "all",     "href" => "/api/tasks/all"},
               {"rel" => "done",    "href" => "/api/tasks/done"},
               {"rel" => "pending", "href" => "/api/tasks/pending"}]}.to_json
end

get '/api/tasks/all' do
  content_type 'application/vnd.collection+json'
  {"data" => TASKS.all.map {|t| serializeObject(t)},
   "links" => [{"rel" => "append",  "href" => "/api/tasks/all"},
               {"rel" => "done",    "href" => "/api/tasks/done"},
               {"rel" => "pending", "href" => "/api/tasks/pending"}]}.to_json
end

# append
post '/api/tasks/all' do
  content_type 'application/vnd.object+json'
  next_id = TASKS.next_id

  data = JSON.parse(request.body.read)
  halt 400 if !data["title"] || data["title"].empty?

  data["id"] = next_id

  task = Task.new_from_data(data)
  TASKS.add task

  serializeObject(task).to_json
end

# replace
put '/api/tasks/all' do
  content_type 'application/vnd.collection+json'

  data = JSON.parse(request.body.read)
  halt 400 if !data.is_a?(Array)

  tasks = data.map {|d| Task.new_from_data(d)}
  TASKS.replaceAll tasks

  {"data" => TASKS.all.map {|t| serializeObject(t)},
   "links" => [{"rel" => "append",  "href" => "/api/tasks/all"},
               {"rel" => "done",    "href" => "/api/tasks/done"},
               {"rel" => "pending", "href" => "/api/tasks/pending"}]}.to_json
  nil
end

get '/api/tasks/:id' do
  id = params[:id].to_i
  content_type 'application/vnd.object+json'
  task = TASKS.find(id) or halt 404
  serializeObject(task).to_json
end

put '/api/tasks/:id' do
  id = params[:id].to_i
  data = JSON.parse(request.body.read)
  data["id"] = data["id"].to_i

  halt 400 if data["id"] != id

  TASKS.replace(id, Task.new_from_data(data))

  content_type 'application/json'
  nil
end

# patch '/api/users/:id' do
#   id = params[:id].to_i
#   content_type 'application/vnd.object+json'
#   user = USERS[id] or halt 404
#   user.merge JSON.parse(request.body.read)
#   # FIXME: wrap in object?
# end

delete '/api/tasks/:id' do
  id = params[:id].to_i
  TASKS.delete(id)
  content_type 'application/json'
  nil
end

post '/api/tasks' do
  content_type 'application/vnd.object+json'
  next_id = TASKS.next_id

  data = JSON.parse(request.body.read)
  data["id"] = next_id

  task = Task.new_from_data(data)
  TASKS.add task

  serializeObject(task).to_json
end



# /api
#   index

# /api/version
#   version


# /api/tasks
#   objectclass[task]

# /api/tasks/{id}
#   object[task]

# /api/tasks/all
#   collection[task]

# /api/tasks/done
#   collection[task]

# /api/tasks/pending
#   collection[task]


# /api/tags
#   objectclass[tag]

# /api/tags/{name}
#   object[tag]

# /api/tags/all
#   collection[tag]
