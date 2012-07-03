// -*- js2 *-*

var Promise
var LinkNotFound

var HttpJqueryAdapter = function() {

  function ajax(method, uri, data) {
    var promise = new Promise();
    $.ajax({
      type: method,
      url: uri,
      data: data,
      // FIXME:
      // accepts: '',
      // cache, processData, etc (params/options?)
      success: function(response) {
        promise.resolve(response);
      },
      error: function(jqXHR, textStatus, errorThrown) {
        var error = {}; // ???
        promise.reject(error);
      }
    });
    return promise;
  }

  function get(uri, params) {
    return ajax('GET', uri, params);
  }
  function put(uri, data) {
    return ajax('PUT', uri, data);
  }
  function post(uri, data) {
    return ajax('POST', uri, data);
  }
  function del(uri) {
    return ajax('DELETE', uri);
  }

  return {
    get: get,
    put: put,
    post: post,
    del: del
  };
};

var Http = function(uri) {
  var httpAdapter = new HttpJqueryAdapter; // FIXME: or from options

  /**
   * @return a new Promise(data)
   */
  function get(params) {
    // TODO: send Accept
    return httpAdapter.get(uri, params);
  }

  /**
   * @return a new Promise(data)
   */
  function put(data) {
    // TODO: send mediaType as Content-Type
    // TODO: send Accept
    return httpAdapter.put(uri, data);
  }

  /**
   * @return a new Promise(data)
   */
  function post(data) {
    // TODO: send mediaType as Content-Type
    // TODO: send Accept
    return httpAdapter.post(uri, data);
  }

  /**
   * @return a new Promise(data)
   */
  function del() {
    // TODO: send Accept
    return httpAdapter.del(uri);
  }

  return {
    get: get,
    put: put,
    post: post,
    del: del
  };
};

var Resource = function(uri, data) {
  // var data = _origData;
  var loaded = false;


  // TODO: facilities to GET and return
  // - the HTTP response       (?)          - ?     (or get)
  // - the HTTP response body               - get   (or getData)
  // - the data from the body  (?)          - read
  // - an entity from the body (?)          - ?
  // - a new Resource wrapping the response - fetch
  //   (polymorphic based on type?)


  var backend = new Http(uri); // FIXME: or from options

  /**
   * @return a new Promise(Resource)
   */
  function fetch(params) {
    return backend.get(params).map(function(fetchedData) {
      // FIXME: multiplex resource class based on mediaType?
      // return new resourceClass(uri, fetchedData);
      return new Resource(uri, fetchedData);
    });
  }

  /**
   * @return a new Resource if link found
   * @throw LinkNotFound
   */
  function follow(rel, params) {
    // return new Resource if link found
    var rawLink = data && data.links && data.links[rel];
    if (!rawLink) {
      throw new LinkNotFound();
    }
    // TODO: substitute params
    var link = fillLink(rawLink, params);
    return link;
  }

  function as(resourceClass) {
    return new resourceClass(uri, data);
  }


  return {
    get: backend.get,
    put: backend.put,
    post: backend.post,
    delete: backend.del,

    fetch: fetch,

    follow: follow,
    as: as
  };
};


var Entity = function(mediaType, data) {
  // var data = _origData;

  return {
    data: data,
    mediaType: mediaType
  };
};



var Api;
var apiUri;


var root = new Api(apiUri);

// OR:
root.follow('version').then(function(res) {
  res.get();
});

var dataProm = root.fetch();
dataProm.then(function(data) {
  console.log("root data", data);
  // shows {"description": ...}
});

var imagesResource = root.follow('images');
//imagesResource = imagesResource.as(ObjectClassResource)
var image42prom = imagesResource.fetch(42);
var newImageProm = imagesResource.create({src: 'test.jpg', width: 42, height: 42, alt: 'test'});
newImageProm.then(function(newImage) {
  console.log("new image:", newImage)
});

var userResource = root.follow('user', {id: 666});
var userResourceData = userResource.get();
var userData = userResource.fetch();

var versionResource = root.follow('version');
var version = versionResource.get();

/*

/api
{application/vnd.object+json} ???
{
  "data": {
    "description": "Demo API"
  }
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
    "email" "joe@example.com"
  }
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



# Think:

- mediaType for entities?
- embedded entities (with uri, type, data)?


# Components:

- Resources (Hypermedia interface)
  + Support custom Resource Types (e.g. collection+json, json, object class, etc)
    and expose operations as methods
- Entities (object by mediaType, mapped to models)
- Stores
  + ObjectClass resource
  + local cache


*/
