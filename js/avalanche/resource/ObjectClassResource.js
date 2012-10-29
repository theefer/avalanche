define(['./Resource', './ObjectResource', './registry'],
       function(Resource, ObjectResource, resourceClassRegistry) {

  var contentType = 'application/vnd.objectclass+json';

  var ObjectClassResource = function(uri, data, options) {
    // FIXME: merge in: {type: 'json', accept: contentType}
    Resource.call(this, uri, data, options);
  };

  ObjectClassResource.prototype = Object.create(Resource.prototype);
  ObjectClassResource.prototype.constructor = Resource;

  ObjectClassResource.prototype.contentType = contentType


  ObjectClassResource.prototype.create = function(data) {
    return this.post(data).then(function(body) {
      // FIXME: auto cast to correct subclass? or use ObjectResource?
      // return new Resource(body.uri, body).as(ObjectResource)
      var contentType = ObjectResource.prototype.contentType
      return this._cache.byUriAndContentType(body.uri, contentType, body);
    }.bind(this));
  };

  ObjectClassResource.prototype.getByKey = function(keyValue) {
    return this.follow('item', keyValue).then(function(itemResource) {
      return itemResource.fetch().then(function(resource) {
        console.log("objectclass getById", resource, keyValue)
        return resource
      });
    });
    // FIXME: errback: not supported?
  };

  resourceClassRegistry.register(ObjectClassResource);

  return ObjectClassResource;
});
