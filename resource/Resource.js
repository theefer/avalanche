define(['http/Http', 'promise', 'util/oneAtATime'], function(Http, Promise, oneAtATime) {

  var Resource = function(uri, data) {
    this.uri = uri;
    this._data = data;
    this._backend = new Http(uri); // FIXME: or from options
  };

  var resourceClassByContentType = Resource.resourceClassByContentType = {};
  Resource.registerResourceClass = function(resourceClass, contentType) {
    resourceClassByContentType[contentType] = resourceClass;
  };

  // TODO: central place to hand out, share references and polymorphise Resources
  // var resourceByUriAndContentType = Resource.resourceByUriAndContentType = {};
  // Resource.make = function(uri, contentType, data) {
  //   var key = uri + ' ' + contentType,
  //       resource = resourceByUriAndContentType[key];
  //   if (!resource) {
  //     var resourceClass = resourceClassByContentType[contentType] || Resource;
  //     resource = new resourceClass(uri, data);
  //     resourceByUriAndContentType[key] = resource;
  //   }
  //   return resource;
  // };

  /**
   * @param options: fromCache - only read from the cache, don't fetch the resource
   *                 noCache   - don't fetch from cache, get data from the resource
   */
  Resource.prototype.get = function(params, options) {
    options = options || {};
    if (!options.noCache && this._data !== undefined) {
      var promise = new Promise()
      promise.resolve(this._data)
      console.log("CACHE HIT", this._data, this.uri)
      return promise
    } else if (!options.fromCache) {
console.log(this.uri, params, options)
      // FIXME: also use parameters to build the unique key!
      // only issue one GET at a time
      return oneAtATime('get' + this.uri, function() {
        var options = {}
        if (this.accepts) {
          options.accepts = this.accepts
        }
        return this._backend.get(params, options).then(function(resp) {
          this._data = resp.body;
          console.log("CACHE NOW", this._data, this.uri)
          return resp.body;
        }.bind(this));
      }.bind(this));
    } else {
      var promise = new Promise()
      promise.reject()
      console.log("GET FAIL", this.uri)
      return promise
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

  // FIXME: move to mixin, not present on all Resources
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
