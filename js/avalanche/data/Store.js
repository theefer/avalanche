// FIXME: or ObjectClassStore - can be other, e.g. localStorage backed
define(['./Object', './Model'], function(Objekt, Model) {
  var Store = function(objectClassResource, modelClass) {
    this.resource = objectClassResource;
    this.modelClass = modelClass || Model
  };

  Store.prototype.create = function(data) {
    return this.resource.create(data).then(function(resource) {
      console.log("store create data", resource)
      // return this.modelClass.prototype.make(resource)
      return Objekt.prototype.make(resource, this.modelClass)
    }.bind(this));
  };

  Store.prototype.getById = function(id) {
    // FIXME: always {id}?
    return this.resource.getByKey({id: id}).then(function(resource) {
      console.log("store getById", resource, id)
      // return this.modelClass.prototype.make(resource)
      return Objekt.prototype.make(resource, this.modelClass)
    }.bind(this));
  };

  return Store;
});
