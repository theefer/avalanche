define(['./Resource'], function(Resource) {
  var ObjectResource = function(uri, data) {
    Resource.apply(this, arguments);
    this.accepts = {'json': 'application/vnd.object+json'}
  };

  ObjectResource.prototype = new Resource;
  ObjectResource.prototype.constructor = Resource;

  ObjectResource.prototype.read = function(params, options) {
    return this.get(params, options).then(function(body) {
      // FIXME: update cache???
console.log("IN READ", body)
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

  Resource.registerResourceClass(ObjectResource, 'application/vnd.object+json');

  return ObjectResource;
});
