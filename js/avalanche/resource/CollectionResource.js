define(['./Resource', './ObjectResource', './registry'],
       function(Resource, ObjectResource, resourceClassRegistry) {

  var contentType = 'application/vnd.collection+json';

  var CollectionResource = function(uri, data, options) {
    // FIXME: merge in: {type: 'json', accept: contentType}
    Resource.call(this, uri, data, options);
  };

  CollectionResource.prototype = Object.create(Resource.prototype);
  CollectionResource.prototype.constructor = Resource;

  CollectionResource.prototype.contentType = contentType


  CollectionResource.prototype.readAll = function(params, options) {
    return this.get(params, options).then(function(body) {
      var data = body && body.data;
      if (data) {
        var resources = [];
        for (var i = 0; i < data.length; i++) {
          // FIXME: auto cast to correct subclass? or use ObjectResource?
          // var res = new Resource(data[i].uri, data[i]).as(ObjectResource)
          var contentType = ObjectResource.prototype.contentType
          var res = Resource.make(data[i].uri, contentType, data[i])
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
          var contentType = ObjectResource.prototype.contentType
          return Resource.make(body.uri, contentType, body)
          // FIXME: auto cast to correct subclass? or use ObjectResource?
          // return new Resource(body.uri, body).as(ObjectResource)
        }
      }, function(){});
      // FIXME: oddly required to trigger errback down the line
    });
  };

  CollectionResource.prototype.replace = function(data) {
    // return this.follow('append').then(function(resource) {
      return this.put(data).then(function(body) {
      var data = body && body.data;
      if (data) {
        var resources = [];
        for (var i = 0; i < data.length; i++) {
          // FIXME: auto cast to correct subclass? or use ObjectResource?
          // var res = new Resource(data[i].uri, data[i]).as(ObjectResource)
          var contentType = ObjectResource.prototype.contentType
          var res = Resource.make(data[i].uri, contentType, data[i])
          resources.push(res)
        }
        return resources
      }
      })
      // FIXME: oddly required to trigger errback down the line
    // });
  };

  // TODO: update? prepend, replace, remove, etc?

  resourceClassRegistry.register(CollectionResource);

  return CollectionResource;
});
