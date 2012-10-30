define(['./Resource', './registry'],
       function(Resource, resourceClassRegistry) {

  var contentType = 'application/vnd.object+json';

  var ObjectResource = function(uri, data, options) {
    // FIXME: merge in: {type: 'json', accept: contentType}
    Resource.call(this, uri, data, options);
  };

  ObjectResource.prototype = Object.create(Resource.prototype);
  ObjectResource.prototype.constructor = Resource;


  ObjectResource.prototype.read = function(params, options) {
    return this.get(params, options).then(function(body) {
      return body && body.data;
    });
  };

  ObjectResource.prototype.update = function(data) {
    // FIXME: who sets the content-type?
    var options = {contentType: 'application/json'}
    return this.put(data, options).then(function(body) {
      // FIXME: update cache, extract data???
      return body;
    });
  };

  ObjectResource.prototype.destroy = function() {
    return this.del().then(function(body) {
      return body;
    });
  };

  resourceClassRegistry.register(ObjectResource, contentType);

  return ObjectResource;
});
