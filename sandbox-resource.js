// -*- js2 *-*

// == compat ==

if (!Function.prototype.bind) {
  Function.prototype.bind = function (oThis) {
    if (typeof this !== "function") {
      // closest thing possible to the ECMAScript 5 internal IsCallable function
      throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
    }

    var aArgs = Array.prototype.slice.call(arguments, 1), 
        fToBind = this, 
        fNOP = function () {},
        fBound = function () {
          return fToBind.apply(this instanceof fNOP
                                 ? this
                                 : oThis,
                               aArgs.concat(Array.prototype.slice.call(arguments)));
        };

    fNOP.prototype = this.prototype;
    fBound.prototype = new fNOP();

    return fBound;
  };
}

// == end compat ==


define('HttpJqueryAdapter', ['jquery', 'promise'], function($, Promise) {

  return function() {

    // FIXME: single query if multiple identical requests

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




define('Resource', ['Http', 'promise'], function(Http, Promise) {

  var Resource = function(uri, data) {
    this.uri = uri;
    this._data = data
    this._backend = new Http(uri); // FIXME: or from options
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
if (this._data !== undefined) {
    var promise = new Promise()
    promise.resolve(this._data)
console.log("IMMEDIATE resolve", this._data, this.uri)
    return promise
} else {
    return this._backend.get(params).then(function(resp) {
console.log("CACHE NOW", this._data, this.uri)
this._data = resp.body
      return resp.body;
    });
}
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
    return this._backend.get(params).then(function(fetched) {
      // Multiplex resource class based on mediaType
      var contentType = fetched.contentType;
      var resourceClass = resourceClassByContentType[contentType] || Resource;
      return new resourceClass(this.uri, fetched.body);
    }.bind(this));
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
  ObjectResource.prototype.update = function(data) {
    return this.put(data).then(function(body) {
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


define('ObjectClassResource', ['Resource', 'ObjectResource'], function(Resource, ObjectResource) {
  var ObjectClassResource = function(uri, data) {
    Resource.apply(this, arguments);
  };

  ObjectClassResource.prototype = new Resource;
  ObjectClassResource.prototype.constructor = Resource;

  ObjectClassResource.prototype.create = function(data) {
    return this.post(data).then(function(body) {
      // FIXME: build new object resource???
      // return body && body.data;
console.log("BODY", body)
// FIXME: auto cast to correct subclass? or use ObjectResource?
var resource = new Resource(body.uri, body).as(ObjectResource)
return resource
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



define('Model', ['knockout', 'knockout.mapping'], function(ko, koMapping) {
  var Model = function(resource) {
    this.resource = resource

    this.data = ko.observable(null)
    this.state = ko.observable('loading') // ready, saving, loading, destroyed
    // this.dirty = ko.observable(false)
    // TODO: on data(newValue), mark as dirty?

console.log("RESOURCE", resource)
    resource.read().then(function(data) {
      // var observable = koMapping.fromJS(data, that.data);
      var observable = koMapping.fromJS(data);
      this.data(observable)
      this.state('ready')
console.log("set data in Model", this, observable, this.data())
    }.bind(this));
  };



  // Model.prototype.read = function() {
  // };
  // Model.prototype.write = function() {
  // };

  Model.prototype.destroy = function() {
    return this.resource.destroy().then(function() {
      this.state('destroyed')
      this.data(null)
    });
  };

  return Model;
});


define('Store', ['Model'], function(Model) {
  var Store = function(objectClassResource) {
    this.resource = objectClassResource;
// FIXME: specify model class?
  };

  Store.prototype.create = function(data) {
    return this.resource.create(data).then(function(resource) {
console.log("store create data", resource)
      return new Model(resource)
    });
  };

  Store.prototype.getById = function(data) {
    // this.resource.follow('???')
    // wrap in resource
    // wrap in model
  };

  return Store;
});


// var Entity = function(mediaType, data) {
//   // var data = _origData;

//   return {
//     data: data,
//     mediaType: mediaType
//   };
// };


define(['HttpJqueryAdapter', 'Http', 'Resource', 'ObjectResource',
        'ObjectClassResource', 'CollectionResource', 'Store', 'Model'],
       function(HttpJqueryAdapter, Http, Resource, ObjectResource,
                ObjectClassResource, CollectionResource, Store, Model) {

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



root.follow('users').then(function(usersResource) {
usersResource = usersResource.as(ObjectClassResource)
var userStore = new Store(usersResource)
console.log("user store", userStore)
// create
userStore.create({name: 'Adam', email: 'adam@example.com'}).then(function(userModel) {
  console.log("store create: ", userModel)
  console.log(userModel.data())

  // update
  // userModel.data().name('Ada')
  // userModel.write()
  // FIXME: track progress? errors?

  // userModel.saving(), .loading(), .dirty()
  // or .state() [uninitialized, ready, saving, loading, destroyed] ?


  // delete
  // userModel.destroy()
  // FIXME: track progress? errors?
}, function() {
  console.log("store create error", arguments)
});

return;

// read
userStore.getById(345).then(function(userModel) {
  console.log(userModel)
  console.log(userModel.data())
});
// OR:
// var userModel = userStore.getById(345)
// console.log(userModel)
// console.log(userModel.data())

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
