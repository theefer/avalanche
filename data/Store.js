// FIXME: or ObjectClassStore - can be other, e.g. localStorage backed
define(['./Model'], function(Model) {
  var Store = function(objectClassResource) {
    this.resource = objectClassResource;
    // FIXME: specify model class?
  };

  Store.prototype.create = function(data) {
    return this.resource.create(data).then(function(resource) {
      console.log("store create data", resource)
      return new Model(resource);
    });
  };

  Store.prototype.getById = function(id) {
    // FIXME: always {id}?
    return this.resource.getByKey({id: id}).then(function(resource) {
      console.log("store getById", resource, id)
      return new Model(resource);
    });
  };

  return Store;
});
