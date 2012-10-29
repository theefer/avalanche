define(['knockout', './Object', './Model'], function(ko, Objekt, Model) {
  var Collection = function(resource, modelClass) {
    // FIXME: check for CollectionResource?
    this.resource = resource;
    this.modelClass = modelClass || Model;

    this.data = ko.observableArray();
    this.state = ko.observable('uninitialized'); // uninitialized, ready, saving, loading, destroyed
    // this.dirty = ko.observable(false)
    // TODO: on data(newValue), mark as dirty?
    // TODO: keep track of latest known server value?
    // this._serverData = ko.observable(null)

    // FIXME: avoid initializing above unnecessarily
    // Try and read any data from the resource
    // if (this.resource) {
    //   this.readAll({fromCache: true})
    // }
  };


  Collection.prototype.readAll = function(options) {
    var previousState = this.state();
    this.state('loading');
    return this.resource.readAll(undefined, options).then(function(data) {
      // FIXME: reuse previous array
      var newArray = [];
      for (var i = 0; i < data.length; i++) {
        var object = Objekt.prototype.make(data[i], this.modelClass)
        newArray.push(object);
      }
      this.data(newArray);
      this.state('ready');
      console.log("set data in Collection", data, this.data())
      return this.data;
    }.bind(this), function(error) {
      this.state(previousState);
      return error;
    }.bind(this));
  };

  Collection.prototype.append = function(model) {
    var data = model.toJS();
    var previousState = this.state();
    this.state('loading');
    return this.resource.append(data).then(function(createdResource) {
      // FIXME: can also append an Object and then reuse it?
      var createdObject = Objekt.prototype.make(createdResource, this.modelClass)

      console.log(model, createdResource, createdObject, createdObject.model() == model)
      // FIXME: should reuse the model?

      this.data.push(createdObject);

      this.state('ready');
      console.log("appended model to Collection", data, createdResource, createdObject, model, this.data())
      return createdObject;
    }.bind(this), function(error) {
      this.state(previousState);
      return error;
    }.bind(this));
  };

  // FIXME: accept objects or models?
  Collection.prototype.replace = function(objects) {
    var previousState = this.state();
    this.state('loading');
    var data = objects.map(function(m){ return m.model().toJS(); });
    return this.resource.replace(data).then(function(updatedResources) {
      this.data(objects)
      // FIXME: destroy/free unreferenced objects

      // FIXME: if there is a response, use that instead

      this.state('ready');
    }.bind(this), function(error) {
      this.state(previousState);
      return error;
    }.bind(this));
  };

  // TODO: read range, update, destroy, other?

  return Collection;
});
