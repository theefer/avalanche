define(['./Resource', './ObjectResource'], function(Resource, ObjectResource) {
  var ObjectClassResource = function(uri, data) {
    Resource.apply(this, arguments);
  };

  ObjectClassResource.prototype = new Resource;
  ObjectClassResource.prototype.constructor = Resource;

  ObjectClassResource.prototype.contentType = 'application/vnd.objectclass+json'


  ObjectClassResource.prototype.create = function(data) {
    return this.post(data).then(function(body) {
      // FIXME: auto cast to correct subclass? or use ObjectResource?
      // return new Resource(body.uri, body).as(ObjectResource)
      var contentType = ObjectResource.prototype.contentType
      return Resource.make(body.uri, contentType, body)
    });
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

  Resource.registerResourceClass(ObjectClassResource);

  return ObjectClassResource;
});
