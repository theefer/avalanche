define(['knockout', 'knockout.mapping'], function(ko, koMapping) {
  var Collection = function(resource, modelClass) {
    // FIXME: required (?), or else default to (?, Model)
    this.resource = resource;
    this.modelClass = modelClass;

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
      // var observable = koMapping.fromJS(data, this.data());
      // FIXME: reuse previous array
      var newArray = [];
      for (var i = 0; i < data.length; i++) {
        var model = new this.modelClass(data[i])
        newArray.push(model);
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
    // FIXME: by default, read from server, though can disable (esp. from ctor)
    var previousState = this.state();
    this.state('loading');
    var data = ko.toJS(model.data())
    return this.resource.append(data).then(function(createdResource) {
      // var observable = koMapping.fromJS(data);
      // model.data(data)

      // FIXME: hack, should we avoid mutating and create a new one instead?
      model.resource = createdResource
      model.read()

      this.data.push(model)

      this.state('ready');
      console.log("appended model to Collection", data, createdResource, model, this.data())
      return model;
    }.bind(this), function(error) {
      this.state(previousState);
      return error;
    }.bind(this));
  };

  // TODO: read range, update, destroy, other?

  return Collection;
});
