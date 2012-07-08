define(['knockout', 'knockout.mapping'], function(ko, koMapping) {
  // var Model = function(resource) {
  //   this.resource = resource;

  //   this.data = ko.observable(); // not yet initialized
  //   this.state = ko.observable('uninitialized'); // uninitialized, ready, saving, loading, destroyed
  //   // this.dirty = ko.observable(false)
  //   // TODO: on data(newValue), mark as dirty?
  //   // TODO: keep track of latest known server value?
  //   // this._serverData = ko.observable(null)

  //   // FIXME: avoid initializing above unnecessarily
  //   if (this.resource) {
  //     this.read({fromCache: true})
  //   }
  // };

  var Model = function(resource, initialData) {
    this.resource = resource;

    // FIXME: resource vs data????
    if (initialData) {
      this.data = ko.observable(koMapping.fromJS(initialData));
      this.state = ko.observable('ready'); // uninitialized, ready, saving, loading, destroyed
    } else {
      this.data = ko.observable(koMapping.fromJS({})); // not yet initialized
      this.state = ko.observable('uninitialized'); // uninitialized, ready, saving, loading, destroyed
    }
    // this.dirty = ko.observable(false)
    // TODO: on data(newValue), mark as dirty?
    // TODO: keep track of latest known server value?
    // this._serverData = ko.observable(null)

    // FIXME: avoid initializing above unnecessarily
    if (this.resource) {
      this.read({fromCache: true})
    }
  };


  var modelByUri = Model.modelByUri = {};
  // Model.make = function(resource, modelClass) {
  Model.prototype.make = function(resource) {
    if (!resource) {
      throw new Error('Cannot make a Model without a Resource!');
    }

    console.log("Find model for", resource)
    var modelClass = this.constructor
// FIXME: vs as argument?
    var uri = resource.uri
    var model = modelByUri[uri];
    if (!model) {
      model = new modelClass(resource);
      modelByUri[uri] = model;
      console.log("MODEL MAKE NEW", model, uri)
    }
    else {
      console.log("MODEL RECYCLE", model, uri)
    }
    return model;
  };


  Model.prototype.read = function(options) {
    // FIXME: by default, read from server, though can disable (esp. from ctor)
    var previousState = this.state();
    this.state('loading');
    return this.resource.read(undefined, options).then(function(data) {
      var observable = koMapping.fromJS(data, this.data())
      this.data(observable)
      this.state('ready');
console.log("set data in Model", this, data, observable, this.data())
      return this.data;
    }.bind(this), function(error) {
      this.state(previousState);
      return error;
    }.bind(this));
  };

  Model.prototype.write = function() {
    var data = koMapping.toJS(this.data)
    var previousState = this.state();
    this.state('saving');
    return this.resource.update(data).then(function(data) {
      this.state('ready');
      // FIXME: receive updated value?
      return data;
    }.bind(this), function(error) {
      this.state(previousState);
      return error;
    }.bind(this));
  };

  Model.prototype.destroy = function() {
    var previousState = this.state();
    this.state('saving');
    return this.resource.destroy().then(function() {
      this.state('destroyed');
      this.data(undefined);
    }.bind(this), function(error) {
      this.state(previousState);
      return error;
    }.bind(this));
  };

  return Model;
});
