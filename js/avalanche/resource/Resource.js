define(['../http/Http', 'promise', '../util/oneAtATime'], function(Http, Promise, oneAtATime) {

  var Resource = function(uri, data) {
    this.uri = uri;
    this._data = data;
    this._backend = new Http(uri); // FIXME: or from options

    // Note: subclasses can override contentType on their prototype
    if (this.contentType) {
      this.accepts = {'json': this.contentType}
    }
  };

  // Resource.prototype.contentType = 'application/json'


  var resourceClassByContentType = Resource.resourceClassByContentType = {};
  Resource.registerResourceClass = function(resourceClass) {
    var contentType = resourceClass.prototype.contentType;
    resourceClassByContentType[contentType] = resourceClass;
  };

  var resourceByUri = Resource.resourceByUri = {};
  var resourceByUriAndContentType = Resource.resourceByUriAndContentType = {};
  Resource.make = function(uri, contentType, data) {
    if (!uri) {
      throw new Error('Cannot make a Resource without a URI!');
    }
console.log("Resource.MAKE", uri, contentType, data)

    var resource;
    if (contentType) {
      var key = uri + ' ' + contentType;
      resource = resourceByUriAndContentType[key];

      if (!resource) {
        var resourceClass = resourceClassByContentType[contentType] || Resource;
        resource = new resourceClass(uri, data);
console.log("MAKE NEW", resource, uri, contentType, data)
        resourceByUriAndContentType[key] = resource;
        resourceByUri[uri] = resource;
        // FIXME: is this working? what if setup with another content type before, etc?
      }
else {
console.log("RECYCLE", resource, uri, contentType, data)
}
    } else {
      resource = resourceByUri[uri];
      if (!resource) {
        resource = new Resource(uri, data);
        resourceByUri[uri] = resource;
console.log("MAKE NEW", resource, uri, data)
      }
else {
console.log("RECYCLE", resource, uri, data)
}
    }

    return resource;
  };


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
      // FIXME: also use parameters to build the unique key!
      // only issue one GET at a time
      return oneAtATime('get' + this.uri, function() {
        var options = {}
        if (this.accepts) {
          options.accepts = this.accepts
        }
        return this._backend.get(params, options).then(function(resp) {
          this._data = resp.body;
          this._contentType = resp.contentType
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
    return this.get(params).then(function(data) {
      // FIXME: this._contentType might not be initialized, so might
      //        not be able to resolve the real type of the resource
      //        - fetch again?
      var contentType = this._contentType
      return Resource.make(this.uri, contentType, data);
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
  Resource.prototype.follow = function(rel, params, options) {
    options = options || {};

    return this.get().then(function(body) {
      var links = body && body.links,
          rawLink = links && findRel(links, rel);
      if (!rawLink) {
        throw new Error("LinkNotFound");
      }

      var link = uriTemplate(rawLink, params);

      if (options.as) {
        var contentType = options.as.prototype.contentType;
        return Resource.make(link, contentType);
      } else if (options.fetch) {
        return Resource.make(link).fetch();
      } else {
        return Resource.make(link);
      }
    });
  };

  Resource.prototype.as = function(resourceClass) {
    var contentType = resourceClass.prototype.contentType;
    return Resource.make(this.uri, contentType, this._data);
  };

  return Resource;
});