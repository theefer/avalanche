define(['./Resource'], function(Resource) {
  var contentType = 'application/vnd.object+json';

  var ObjectResource = function(uri, data) {
    Resource.call(this, uri, data, {type: 'json', accept: contentType});
  };

  ObjectResource.prototype = new Resource;
  ObjectResource.prototype.constructor = Resource;

  ObjectResource.prototype.contentType = contentType


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

  Resource.registerResourceClass(ObjectResource);

  return ObjectResource;
});
