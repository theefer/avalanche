// -*- js2 *-*

define(['http/HttpJqueryAdapter', 'http/Http',
        'resource/Resource', 'resource/ObjectResource',
        'resource/ObjectClassResource', 'resource/CollectionResource',
        'data/Store', 'data/Model', 'data/Collection'],
       function(HttpJqueryAdapter, Http,
                Resource, ObjectResource,
                ObjectClassResource, CollectionResource,
                Store, Model, Collection) {

var apiUri = 'http://localhost:4567/api';
var httpAdapter = new HttpJqueryAdapter;
httpAdapter.get(apiUri).then(function(data) {
  console.log(data)
});


var http = new Http(apiUri);
http.get().then(function(data) {
  console.log(data)
});


var root = new Resource(apiUri);
root.get().then(function(data) {
  console.log(data)
});

root.fetch().then(function(data) {
  console.log("fetched: ", data)
});

console.log("follow version")
root.follow('version').then(function(res) {
  console.log(res)
  res.get().then(function(x) {
    console.log(x)
  });
});

console.log("follow user [Object]")
root.follow('user', {id: 125}).then(function(res) {
  console.log("user res", res)
  res.get().then(function(x) {
    console.log(x)
  });
  res.fetch().then(function(x) {
    console.log("user res fetched", x)
  });

  var ores = res.as(ObjectResource)
  ores.read().then(function(x) {
    console.log("read:", x)

    // res.write({name: 'New', email: 'new@example.com'})
    // res.update({email: 'other@example.com'})

    ores.destroy().then(function(x) {
      console.log("destroyed")

      ores.read().then(function(x) {
        console.log("read succeeded, oddly")
      }, function() {
        console.log("read failed, as expected")
      });

    });
  });
});

console.log("follow images [Collection]")
root.follow('images').then(function(res) {
  console.log("images:", res)
  res.get().then(function(x) {
    console.log(x)
  });
  res.as(CollectionResource).readAll().then(function(x) {
    console.log("read collection", x)
  });
  res.fetch().then(function(collRes) {
    console.log("coll res", collRes)
    var coll = new Collection(collRes, Model)
    console.log(coll)
    coll.readAll().then(function(items) {
      console.log("items=", coll.data())
    })
  });
});

console.log("follow users [ObjectClass]")
root.follow('users').then(function(res) {
  console.log("users:", res)
  res.follow('item', {id: 123}).then(function(ures) {
    ures.get().then(function(x) {
      console.log("user data: ", x)
    });
  });
  console.log("before create", res)
  res.fetch().then(function(ocres) {
    console.log("prepare to create", ocres)
    ocres.create({name: 'Phil', email: 'phil@example.com'}).then(function(d) {
      console.log("created", d)
    });
  });
});



root.follow('users').then(function(usersResource) {
usersResource = usersResource.as(ObjectClassResource)
var userStore = new Store(usersResource)
console.log("user store", userStore)
// create
userStore.create({name: 'Adam', email: 'adam@example.com'}).then(function(userModel) {
  console.log("store create: ", userModel)
  console.log(userModel.data())

  // update
  userModel.data().name('Ada')
  userModel.write().then(function() {
    console.log("model updated!", arguments)
  })

  // FIXME: track progress? errors?
  // userModel.saving(), .loading(), .dirty()

  // delete
  userModel.destroy().then(function() {
    console.log("now destroyed!", userModel.data())
  })
  // FIXME: track progress? errors?
}, function() {
  console.log("store create error", arguments)
});

// read
userStore.getById(123).then(function(userModel) {
  console.log(userModel)
  console.log(userModel.data().email())
});


});


});

/*

/api
{application/vnd.object+json} ???
{
  "data": {
    "description": "Demo API"
  },
  "links": [
    {"rel": "images",
     "href": "/images"},
    {"rel": "user",
     "href": "/user/{id}"},
    {"rel": "version",
     "href": "/version"}
  ]
}

/version
{application/json}
"0.1"

/images
{application/vnd.collection+json} ???
{
  "data": [
    ???
  ]
  "links": [
    {"rel": "latest-image",
     "href": "/images/latest"},
    {"rel": "add-image",
     "href": "/images",
     "method": "post" // ???
    },
    {"rel": "update-image",
     "href": "/images/{id}",
     "method": "put" // ???
    },
    {"rel": "delete-image",
     "href": "/images/{id}",
     "method": "delete" // ???
    }
  ]
}

/user/{id}
{application/vnd.object+json} ???
{
  "uri": "/user/17",   // ???
  "mediaType": "user", // ???
  "data": {
    "name": "Joe",
    "email": "joe@example.com"
  },
  "links": [
    {"rel": "friends",
     "href": "/user/{id}/friends"},
    {"rel": "avatar",
     "href": "/user/{id}/avatar"}
  ]
}

/user/{id}/avatar
{application/json}
 {
  "href": "foo.png",
  "mimeType": "image/png"
 }
*/
