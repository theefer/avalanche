// -*- js2 *-*

define(['jquery', 'promise'],
       function($, Promise) {

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
      success: function(response, textStatus, req) {
        // console.log("success:", arguments, req.getAllResponseHeaders())
        var contentType = req.getResponseHeader('Content-Type');
        promise.resolve({body: response, contentType: contentType});
      },
      error: function(jqXHR, textStatus, errorThrown) {
        console.log("error:", arguments)
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
  var loaded = false;


  // TODO: facilities to GET and return
  // - the HTTP response       (?)          - ?     (or get)
  // - the HTTP response body               - get   (or getData)
  // - the data from the body  (?)          - read
  // - an entity from the body (?)          - ?
  // - a new Resource wrapping the response - fetch
  //   (polymorphic based on type?)


  var backend = new Http(uri); // FIXME: or from options

  function get(params) {
    // FIXME: cache
    return backend.get(params).then(function(resp) {
      return resp.body;
    });
  }

  function put(data) {
    // FIXME: cache
    return backend.put(data).then(function(resp) {
      return resp.body;
    });
  }

  function post(data) {
    // FIXME: cache
    return backend.post(data).then(function(resp) {
      return resp.body;
    });
  }

  function del() {
    // FIXME: cache
    return backend.del().then(function(resp) {
      return resp.body;
    });
  }

  /**
   * @return a new Promise(Resource)
   */
  function fetch(params) {
    return backend.get(params).then(function(fetched) {
      // FIXME: multiplex resource class based on mediaType?
      // var contentType = fetched.contentType;
      // var resourceClass;
      // switch (contentType) {
      // case 'application/collection+json':
      //   break;
      // case 'application/object+json':
      //   break;
      // default:
      //   resourceClass = Resource;
      //   break;
      // }
      // return new resourceClass(uri, fetched.body);
      return new Resource(uri, fetched.body);
    });
  }

  function uriTemplate(template, params) {
    return template.replace(/{(.*?)}/g, function(match, varName) {
      var val = params[varName];
      if (!val) {
        throw new Error("Missing parameter for URI template variable: " + varName)
      }
      return val;
    });
  }

  function findRel(links, rel) {
    // FIXME: better lookup
    for (var i in links) {
      var l = links[i];
      if (l.rel == rel) {
        return l.href;
      }
    }
  }

  /**
   * @return a new Resource if link found
   * @throw LinkNotFound
   */
  function follow(rel, params) {
    return get().then(function(body) {
      var links = body && body.links,
          rawLink = links && findRel(links, rel);
      if (!rawLink) {
        throw new Error("LinkNotFound");
      }

      var link = uriTemplate(rawLink, params);
      return new Resource(link);
    });
  }

  function as(resourceClass) {
    return new resourceClass(uri, data);
  }


  return {
    uri: uri,

    get: get,
    put: put,
    post: post,
    delete: del,

    fetch: fetch,

    follow: follow,
    as: as
  };
};


// TODO:
// - ObjectResource
// - ObjectClassResource
// - CollectionResource

// var ObjectResource = function(uri, data) {
//   function read() {
//     return get().then(function(body) {
//       return body && body.data;
//     });
//   }
//   function update() {
//     return put().then(function(body) {
//       // FIXME: update cache, extract data???
//       return body;
//     });
//   }
//   function destroy() {
//     return del().then(function(body) {
//       // FIXME: kill cache, extract data???
//       return body;
//     });
//   }
//   return {
//     read: read,
//     update: update,
//     destroy: destroy
//   };
// };
// ObjectResource.prototype = new Resource;
// ObjectResource.prototype.constructor = ObjectResource;


var Entity = function(mediaType, data) {
  // var data = _origData;

  return {
    data: data,
    mediaType: mediaType
  };
};

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
root.follow('user', {id: 42}).then(function(res) {
  console.log(res)
  res.get().then(function(x) {
    console.log(x)
  });
  res.fetch().then(function(x) {
    console.log(x)
  });

  // res.read()
  // res.write({name: 'New', email: 'new@example.com'})
  // res.update({email: 'other@example.com'})
  // res.destroy()
});

console.log("follow images [Collection]")
root.follow('images').then(function(res) {
  console.log("images:", res)
  res.get().then(function(x) {
    console.log(x)
  });
  res.fetch().then(function(x) {
    console.log(x)
  });
});

console.log("follow users [ObjectClass]")
root.follow('users').then(function(res) {
  console.log("users:", res)
  res.follow('user', {id: 123}).then(function(ures) {
    ures.get().then(function(x) {
      console.log("user data: ", x)
    });
  });
  // * res.create({name: 'Phil', email: 'phil@example.com'})
  //   res.byId(345)
  //   res.destroy(345)
});


return


var imagesResource = root.follow('images');
//imagesResource = imagesResource.as(ObjectClassResource)
var image42prom = imagesResource.fetch(42);
var newImageProm = imagesResource.create({src: 'test.jpg', width: 42, height: 42, alt: 'test'});
newImageProm.then(function(newImage) {
  console.log("new image:", newImage)
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

});
