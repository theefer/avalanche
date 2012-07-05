require 'rubygems'
require 'sinatra'
require 'json'

set :public_folder, '.'


get '/api' do
  content_type 'application/object+json'
'{
  "data": {
    "description": "Demo API"
  },
  "links": [
    {"rel": "images",  "href": "/api/images"},
    {"rel": "users",   "href": "/api/users"},
    {"rel": "user",    "href": "/api/users/{id}"},
    {"rel": "version", "href": "/api/version"}
  ]
}'
end

get '/api/version' do
  content_type 'application/json'
  "0.1"
end

get '/api/images' do
  content_type 'application/vnd.collection+json'
'{
  "data": [
    {"uri": "/api/images/777",
     "mediaType": "image",
     "data": {
       "id": 777,
       "src": "hello.jpg",
       "alt": "Hello..."
     }
    },
    {"uri": "/api/images/778",
     "mediaType": "image",
     "data": {
       "id": 778,
       "src": "world.jpg",
       "alt": "world!"
     }
    }
  ],
  "links": [
    {"rel": "latest-image", "href": "/api/images/latest"}
  ]
}'
end

get '/api/users' do
  content_type 'application/objectclass+json'
'{
  "links": [
    {"rel": "item",   "href": "/api/users/{id}"},
    {"rel": "avatar", "href": "/api/users/{id}/avatar"}
  ]
}'
end

post '/api/users' do
  content_type 'application/object+json'
  next_id = USERS.keys.max
  data = JSON.parse(request.body.read)
  user = USERS[next_id] = data
'{
  "uri": "/api/users/' +next_id.to_s+ '",
  "mediaType": "user",
  "data": {
    "id": "' +next_id.to_s+ '",
    "name": "' +(user['name'] || '')+ '",
    "email": "' +(user['email'] || '')+ '"
  },
  "links": [
    {"rel": "friends", "href": "/api/users/' +next_id.to_s+ '/friends"},
    {"rel": "avatar",  "href": "/api/users/' +next_id.to_s+ '/avatar"}
  ]
}'
end

USERS = {
  123 => {'name' => "Joe", 'email' => "joe@example.com"},
  124 => {'name' => "Jim", 'email' => "jim@example.com"},
  125 => {'name' => "Sam", 'email' => "sam@example.com"},
}

get '/api/users/:id' do
  id = params[:id].to_i
  content_type 'application/object+json'
  user = USERS[id] or halt 404
'{
  "uri": "/api/users/' +id.to_s+ '",
  "mediaType": "user",
  "data": {
    "id": "' +id.to_s+ '",
    "name": "' +user['name']+ '",
    "email": "' +user['email']+ '"
  },
  "links": [
    {"rel": "friends", "href": "/api/users/' +id.to_s+ '/friends"},
    {"rel": "avatar",  "href": "/api/users/' +id.to_s+ '/avatar"}
  ]
}'
end

put '/api/users/:id' do
  id = params[:id].to_i
  USERS[id] = JSON.parse(request.body.read)
  content_type 'application/json'
  nil
end

patch '/api/users/:id' do
  id = params[:id].to_i
  content_type 'application/object+json'
  user = USERS[id] or halt 404
  user.merge JSON.parse(request.body.read)
  # FIXME: wrap in object?
end

delete '/api/users/:id' do
  id = params[:id].to_i
  USERS.delete(id)
  content_type 'application/json'
  nil
end


get '/api/users/:id/avatar' do
  content_type 'application/json'
'{
  "href": "foo.png",
  "mimeType": "image/png"
}'
end
