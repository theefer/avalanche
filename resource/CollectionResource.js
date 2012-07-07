define(['./Resource', './ObjectResource'], function(Resource, ObjectResource) {
  var CollectionResource = function(uri, data) {
    Resource.apply(this, arguments);
    this.accepts = 'application/vnd.collection+json'
  };

  CollectionResource.prototype = new Resource;
  CollectionResource.prototype.constructor = Resource;

  CollectionResource.prototype.readAll = function(params, options) {
    return this.get(params, options).then(function(body) {
      var data = body && body.data;
      if (data) {
        var resources = [];
        for (var i = 0; i < data.length; i++) {
          // FIXME: auto cast to correct subclass? or use ObjectResource?
          var res = new Resource(data[i].uri, data[i]).as(ObjectResource)
          resources.push(res)
        }
        return resources
      }
    });
  };

  // CollectionResource.prototype.readRange = function() {
  //   return this.follow('')
  // };

  CollectionResource.prototype.append = function(data) {
    return this.follow('append').then(function(resource) {
      return resource.post(data).then(function(body) {
        if (body) {
          // FIXME: auto cast to correct subclass? or use ObjectResource?
          return new Resource(body.uri, body).as(ObjectResource)
        }
      }, function(){});
      // FIXME: oddly required to trigger errback down the line
    });
  };

  // TODO: update? prepend, replace, remove, etc?

  Resource.registerResourceClass(CollectionResource, 'application/vnd.collection+json');

  return CollectionResource;
});
