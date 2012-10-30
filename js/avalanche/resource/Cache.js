define(['./registry'], function(resourceClassRegistry) {

  var NO_CONTENT_TYPE = '__default__';

  var ResourceCache = function(defaultResourceClass, resourceOptions) {
    this.defaultResourceClass = defaultResourceClass;
    this.resourceOptions = resourceOptions;
    this.resourceOptions.cache = this;

    this._resourceByUri = {};
  };

  ResourceCache.prototype._lookup = function(uri, contentType) {
    return this._resourceByUri[uri] && this._resourceByUri[uri][contentType];
  };

  ResourceCache.prototype._store = function(uri, contentType, resource) {
    if (!this._resourceByUri[uri]) {
      this._resourceByUri[uri] = {};
    }
    this._resourceByUri[uri][contentType] = resource;
  };

  ResourceCache.prototype.byUri = function(uri) {
    if (!uri) {
      throw new Error('Cannot make a Resource without a URI!');
    }

    var resource = this._lookup(uri, NO_CONTENT_TYPE);
    if (!resource) {
      resource = new this.defaultResourceClass(uri, this.resourceOptions);
      this._store(uri, NO_CONTENT_TYPE, resource);
      console.log("MAKE NEW", resource, uri)
    }
    else {
      console.log("RECYCLE", resource, uri)
    }

    return resource;
  };

  ResourceCache.prototype.byUriAndContentType = function(uri, contentType, data) {
    if (!uri) {
      throw new Error('Cannot make a Resource without a URI!');
    }

    var resource = this._lookup(uri, contentType);
    if (!resource) {
      var resourceClass = resourceClassRegistry[contentType] || this.defaultResourceClass;
      resource = new resourceClass(uri, this.resourceOptions, data);
      console.log("MAKE NEW", resource, uri, contentType, data)
      this._store(uri, contentType, resource);
      this._store(uri, NO_CONTENT_TYPE, resource);
      // FIXME: is this working? what if setup with another content type before, etc?
    }
    else {
      console.log("RECYCLE", resource, uri, contentType, data)
    }

    return resource;
  };

  ResourceCache.prototype.byUriAndClass = function(uri, resourceClass, data) {
    if (!uri) {
      throw new Error('Cannot make a Resource without a URI!');
    }

    var contentType = resourceClassRegistry.contentTypeForClass(resourceClass);

    var resource = this._lookup(uri, contentType);
    if (!resource) {
      resource = new resourceClass(uri, this.resourceOptions, data);
      console.log("MAKE NEW", resource, uri, contentType, data)
      this._store(uri, contentType, resource);
      this._store(uri, NO_CONTENT_TYPE, resource);
      // FIXME: is this working? what if setup with another content type before, etc?
    }
    else {
      console.log("RECYCLE", resource, uri, contentType, data)
    }

    return resource;
  };

  return ResourceCache;
});
