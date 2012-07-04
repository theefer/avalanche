// -*- js2 *-*

define('HttpJqueryAdapter', ['jquery', 'promise'], function($, Promise) {

  return function() {

    function ajax(method, uri, data) {
      var promise = new Promise();
      var jsonData = JSON.stringify(data);
      $.ajax({
        type: method,
        url: uri,
        data: jsonData,
        // FIXME:
        // accepts: '',
        // cache, processData, contentType, etc (params/options?)
        // contentType: 'application/json; charset=utf-8',
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

});

define('Http', ['HttpJqueryAdapter'], function(HttpJqueryAdapter) {

  return function(uri) {

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
});


// define('Resource0', ['Http'], function(Http) {

//   return function(uri, data) {
//     var Resource = require('Resource0');

//     // var loaded = false;

//     // TODO: facilities to GET and return
//     // - the HTTP response       (?)          - backend.get
//     // - the HTTP response body               - get
//     // - a new Resource wrapping the response - fetch
//     //   (polymorphic based on type?)

//     // - the data from the body  (?)          - read
//     // - an entity from the body (?)          - ?


//     var backend = new Http(uri); // FIXME: or from options

//     function get(params) {
//       // FIXME: cache
//       return backend.get(params).then(function(resp) {
//         return resp.body;
//       });
//     }

//     function put(data) {
//       // FIXME: cache
//       return backend.put(data).then(function(resp) {
//         return resp.body;
//       });
//     }

//     function post(data) {
//       // FIXME: cache
//       return backend.post(data).then(function(resp) {
//         return resp.body;
//       });
//     }

//     function del() {
//       // FIXME: cache
//       return backend.del().then(function(resp) {
//         return resp.body;
//       });
//     }

//     /**
//      * @return a new Promise(Resource)
//      */
//     function fetch(params) {
//       return backend.get(params).then(function(fetched) {
//         // FIXME: multiplex resource class based on mediaType?
//         // var contentType = fetched.contentType;
//         // var resourceClass;
//         // switch (contentType) {
//         // case 'application/collection+json':
//         //   break;
//         // case 'application/object+json':
//         //   break;
//         // default:
//         //   resourceClass = Resource;
//         //   break;
//         // }
//         // return new resourceClass(uri, fetched.body);
//         return new Resource(uri, fetched.body);
//       });
//     }

//     function uriTemplate(template, params) {
//       return template.replace(/{(.*?)}/g, function(match, varName) {
//         var val = params[varName];
//         if (!val) {
//           throw new Error("Missing parameter for URI template variable: " + varName)
//         }
//         return val;
//       });
//     }

//     function findRel(links, rel) {
//       // FIXME: better lookup
//       for (var i in links) {
//         var l = links[i];
//         if (l.rel == rel) {
//           return l.href;
//         }
//       }
//     }

//     /**
//      * @return a new Resource if link found
//      * @throw LinkNotFound
//      */
//     function follow(rel, params) {
//       return get().then(function(body) {
//         var links = body && body.links,
//         rawLink = links && findRel(links, rel);
//         if (!rawLink) {
//           throw new Error("LinkNotFound");
//         }

//         var link = uriTemplate(rawLink, params);
//         return new Resource(link);
//       });
//     }

//     function as(resourceClass) {
//       return new resourceClass(uri, data);
//     }


//     return {
//       uri: uri,

//       get: get,
//       put: put,
//       post: post,
//       delete: del,

//       fetch: fetch,

//       follow: follow,
//       as: as
//     };

//   };

// });




define('Resource', ['Http'], function(Http) {

  var Resource = function(uri, data) {
    this.uri = uri;
    this._data = data
    this._backend = new Http(uri); // FIXME: or from options

    
    // var loaded = false;
  };

  var resourceClassByContentType = Resource.prototype.resourceClassByContentType = {};
  Resource.prototype.registerResourceClass = function(resourceClass, contentType) {
    resourceClassByContentType[contentType] = resourceClass;
  };
  

  // TODO: facilities to GET and return
  // - the HTTP response       (?)          - backend.get
  // - the HTTP response body               - get
  // - a new Resource wrapping the response - fetch
  //   (polymorphic based on type?)

  // - the data from the body  (?)          - read
  // - an entity from the body (?)          - ?

  Resource.prototype.get = function(params) {
    // FIXME: cache
    return this._backend.get(params).then(function(resp) {
      return resp.body;
    });
  };

  Resource.prototype.put = function(data) {
    // FIXME: cache
    return this._backend.put(data).then(function(resp) {
      return resp.body;
    });
  };

  Resource.prototype.post = function(data) {
    // FIXME: cache
    return this._backend.post(data).then(function(resp) {
      return resp.body;
    });
  };

  Resource.prototype.del = function() {
    // FIXME: cache
    return this._backend.del().then(function(resp) {
      return resp.body;
    });
  };

  /**
   * @return a new Promise(Resource)
   */
  Resource.prototype.fetch = function(params) {
    var that = this; // FIXME: use bind
    return this._backend.get(params).then(function(fetched) {
      // Multiplex resource class based on mediaType
      var contentType = fetched.contentType;
      var resourceClass = resourceClassByContentType[contentType] || Resource;
      return new resourceClass(that.uri, fetched.body);
    });
  };

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
  Resource.prototype.follow = function(rel, params) {
    return this.get().then(function(body) {
      var links = body && body.links,
          rawLink = links && findRel(links, rel);
      if (!rawLink) {
        throw new Error("LinkNotFound");
      }

      var link = uriTemplate(rawLink, params);
      return new Resource(link);
    });
  };

  Resource.prototype.as = function(resourceClass) {
    return new resourceClass(this.uri, this._data);
  };

  return Resource;
});


define('ObjectResource', ['Resource'], function(Resource) {
  var ObjectResource = function(uri, data) {
    Resource.apply(this, arguments);
  };

  ObjectResource.prototype = new Resource;
  ObjectResource.prototype.constructor = Resource;

  ObjectResource.prototype.read = function() {
    return this.get().then(function(body) {
      // FIXME: update cache???
      return body && body.data;
    });
  };
  ObjectResource.prototype.update = function() {
    return this.put().then(function(body) {
      // FIXME: update cache, extract data???
      return body;
    });
  };
  ObjectResource.prototype.destroy = function() {
    return this.del().then(function(body) {
      // FIXME: kill cache, extract data???
      return body;
    });
  };

  Resource.prototype.registerResourceClass(ObjectResource, 'application/object+json');

  return ObjectResource;
});


define('ObjectClassResource', ['Resource'], function(Resource) {
  var ObjectClassResource = function(uri, data) {
    Resource.apply(this, arguments);
  };

  ObjectClassResource.prototype = new Resource;
  ObjectClassResource.prototype.constructor = Resource;

  ObjectClassResource.prototype.create = function(data) {
    return this.post(data).then(function(body) {
      // FIXME: build new object resource???
      return body && body.data;
    });
  };

  Resource.prototype.registerResourceClass(ObjectClassResource, 'application/objectclass+json');

  return ObjectClassResource;
});



define('CollectionResource', ['Resource'], function(Resource) {
  var CollectionResource = function(uri, data) {
    Resource.apply(this, arguments);
  };

  CollectionResource.prototype = new Resource;
  CollectionResource.prototype.constructor = Resource;

  // TODO:
  // CollectionResource.prototype.??? = function(data) {
  // };

  Resource.prototype.registerResourceClass(CollectionResource, 'application/collection+json');

  return CollectionResource;
});


// var Entity = function(mediaType, data) {
//   // var data = _origData;

//   return {
//     data: data,
//     mediaType: mediaType
//   };
// };


define(['HttpJqueryAdapter', 'Http', 'Resource', 'ObjectResource',
        'ObjectClassResource', 'CollectionResource'],
       function(HttpJqueryAdapter, Http, Resource, ObjectResource,
                ObjectClassResource, CollectionResource) {

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
  console.log("before create", res)
  res.fetch().then(function(ocres) {
    console.log("prepare to create", ocres)
    ocres.create({name: 'Phil', email: 'phil@example.com'}).then(function(d) {
      console.log("created", d)
    });
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
