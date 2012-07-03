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
    {"rel": "user",        "href": "/api/users/{id}"},
    {"rel": "user-avatar", "href": "/api/users/{id}/avatar"}
  ]
}'
end

get '/api/users/:id' do
  id = params[:id]
  content_type 'application/object+json'
'{
  "uri": "/api/user/' +id+ '",
  "mediaType": "user",
  "data": {
    "name": "Joe' +id+ '",
    "email": "joe' +id+ '@example.com"
  },
  "links": [
    {"rel": "friends", "href": "/api/users/' +id+ '/friends"},
    {"rel": "avatar",  "href": "/api/users/' +id+ '/avatar"}
  ]
}'
end

get '/api/user/:id/avatar' do
  content_type 'application/json'
'{
  "href": "foo.png",
  "mimeType": "image/png"
}'
end
