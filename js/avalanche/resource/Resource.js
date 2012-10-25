define(['../http/Http', 'promise', '../util/oneAtATime', '../util/uriTemplate'],
       function(Http, Promise, oneAtATime, uriTemplate) {

  var Resource = function(uri, data, options) {
    this.uri = uri;
    this._data = data;
// FIXME: init contentType of data

    // TODO: document options: type, accept, adapter
    this._backend = new Http(uri, options);

    // FIXME: use cache instead of Resource.make
    // this._cache = options.cache

    // TODO:
    // - contentType: method options, and subclasses may override as JSON or custom mediatype

    // TODO: manage cache PUT, subclasses may disable and manually override
  };

  // Resource.prototype.contentType = 'application/json'

  // TODO: extract registering into a common helper?

  // FIXME: deprecate, use resource/registry singleton instead
  var resourceClassByContentType = Resource.resourceClassByContentType = {};
  Resource.registerResourceClass = function(resourceClass) {
    var contentType = resourceClass.prototype.contentType;
    resourceClassByContentType[contentType] = resourceClass;
  };

  // TODO: extract caching into a common helper
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
      console.log("CACHE HIT", this._data, this.uri)
      var promise = new Promise();
      promise.resolve(this._data);
      return promise;
    } else if (!options.fromCache) {
      // FIXME: also use parameters to build the unique key!
      // only issue one GET at a time
      return oneAtATime('get' + this.uri, function() {
        return this._backend.get(params, options).then(function(resp) {
          console.log("CACHE NOW", resp.body, this.uri)
          this._data = resp.body;
          this._contentType = resp.contentType;
          return resp.body;
        }.bind(this));
      }.bind(this));
    } else {
      console.log("GET FAIL", this.uri)
      var promise = new Promise();
      promise.reject();
      return promise;
    }
  };

  Resource.prototype.put = function(data, options) {
    return this._backend.put(data, options).then(function(resp) {
      // FIXME: cache, unless disabled
      return resp.body;
    });
  };

  Resource.prototype.post = function(data, options) {
    return this._backend.post(data, options).then(function(resp) {
      return resp.body;
    });
  };

  Resource.prototype.del = function(options) {
    // only issue one DELETE at a time
    return oneAtATime('delete' + this.uri, function() {
      return this._backend.del(options).then(function(resp) {
        // dispose of internal cached state
        delete this._data;
        delete this._contentType;

        return resp.body;
      }.bind(this));
    }.bind(this));
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
   * Follow a rel link and return the associated Resource.
   * 
   * @param rel the name of the relation to follow
   * @param params URI parameters for the relation's URI template
   * @param options
   *          - "lazy" if true, returns an empty Resource pointing
   *                   to the relation link without fetching the URI
   *                   (default: false)
   *          - "as" Resource class to use for the followed resource,
   *                 particularly useful with lazy=true (when fetched,
   *                 the class is automatically guessed based on
   *                 content-type.
   * @return a Promise of a new Resource if link found
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

      var contentType;
      if (options.as) {
        contentType = options.as.prototype.contentType;
      }

      if (options.lazy) {
        return Resource.make(link, contentType);
      } else {
        return Resource.make(link, contentType).fetch();
      }
    });
  };

  Resource.prototype.as = function(resourceClass) {
    var contentType = resourceClass.prototype.contentType;
    return Resource.make(this.uri, contentType, this._data);
  };

  return Resource;
});
