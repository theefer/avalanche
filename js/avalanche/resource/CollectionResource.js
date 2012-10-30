define(['./Resource', './ObjectResource', './registry'],
       function(Resource, ObjectResource, resourceClassRegistry) {

  var contentType = 'application/vnd.collection+json';

  var CollectionResource = function(uri, data, options) {
    // FIXME: merge in: {type: 'json', accept: contentType}
    Resource.call(this, uri, data, options);
  };

  CollectionResource.prototype = Object.create(Resource.prototype);
  CollectionResource.prototype.constructor = Resource;


  CollectionResource.prototype.readAll = function(params, options) {
    return this.get(params, options).then(function(body) {
      var data = body && body.data;
      if (data) {
        var resources = [];
        for (var i = 0; i < data.length; i++) {
          // FIXME: necessarily a collection of object resources?
          var res = this._cache.byUriAndClass(data[i].uri, ObjectResource, data[i]);
          resources.push(res)
        }
        return resources
      }
    }.bind(this));
  };

  // CollectionResource.prototype.readRange = function() {
  //   return this.follow('')
  // };

  CollectionResource.prototype.append = function(data) {
    return this.follow('append').then(function(resource) {
      return resource.post(data).then(function(body) {
        if (body) {
          // FIXME: necessarily a collection of object resources?
          return this._cache.byUriAndClass(body.uri, ObjectResource, body);
        }
      }.bind(this), function(){});
      // FIXME: oddly required to trigger errback down the line
    }.bind(this));
  };

  CollectionResource.prototype.replace = function(data) {
    // return this.follow('append').then(function(resource) {
    return this.put(data).then(function(body) {
      var data = body && body.data;
      if (data) {
        var resources = [];
        for (var i = 0; i < data.length; i++) {
          // FIXME: necessarily a collection of object resources?
          var res = this._cache.byUriAndClass(data[i].uri, ObjectResource, data[i]);
          resources.push(res)
        }
        return resources
      }
    }.bind(this))
      // FIXME: oddly required to trigger errback down the line
    // });
  };

  // TODO: update? prepend, replace, remove, etc?

  resourceClassRegistry.register(CollectionResource, contentType);

  return CollectionResource;
});
