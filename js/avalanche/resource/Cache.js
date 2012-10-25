define(['./registry'], function(resourceClassRegistry) {

  // FIXME: put methods on prototype?
  var ResourceCache = function(defaultResourceClass, resourceOptions) {

    resourceOptions.cache = this

    var NO_CONTENT_TYPE = '__default__';
    var resourceByUri = {};

    var lookup = function(uri, contentType) {
      return resourceByUri[uri] && resourceByUri[uri][contentType];
    };

    var store = function(uri, contentType, resource) {
      if (!resourceByUri[uri]) {
          resourceByUri[uri] = {};
      }
      resourceByUri[uri][contentType] = resource;
    }

    var byUri = function(uri) {
      if (!uri) {
        throw new Error('Cannot make a Resource without a URI!');
      }
      console.log("ResourceCache.byUri", uri)

      var resource = lookup(uri, NO_CONTENT_TYPE);
      if (!resource) {
        resource = new defaultResourceClass(uri, undefined, resourceOptions);
        store(uri, NO_CONTENT_TYPE, resource);
        console.log("MAKE NEW", resource, uri)
      }
      else {
        console.log("RECYCLE", resource, uri)
      }

      return resource;
    };

    var byUriAndContentType = function(uri, contentType, data) {
      if (!uri) {
        throw new Error('Cannot make a Resource without a URI!');
      }
      console.log("ResourceCache.byUriAndContentType", uri, contentType, data)

      var resource = lookup(uri, contentType);
      if (!resource) {
        var resourceClass = resourceClassRegistry[contentType] || defaultResourceClass;
        resource = new resourceClass(uri, data, resourceOptions);
        console.log("MAKE NEW", resource, uri, contentType, data)
        store(uri, contentType, resource);
        store(uri, NO_CONTENT_TYPE, resource);
        // FIXME: is this working? what if setup with another content type before, etc?
      }
      else {
        console.log("RECYCLE", resource, uri, contentType, data)
      }

      return resource;
    };

    return {
      byUri: byUri,
      byUriAndContentType: byUriAndContentType
    };
  };

  return ResourceCache;
});