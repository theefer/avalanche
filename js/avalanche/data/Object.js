define(['knockout', './Model'], function(ko, Model) {
  var Objekt = function(resource, modelClass) {
    this.resource = resource;
    this.modelClass = modelClass || Model

    this.model = ko.observable(); // not yet initialized
    this.state = ko.observable('uninitialized'); // uninitialized, ready, saving, loading, destroyed

    this.v = ko.computed(function() {
      var model = this.model();
      if (model) {
        return model.data();
      }
    }.bind(this))

    // this.dirty = ko.observable(false)
    // TODO: on data(newValue), mark as dirty?
    // TODO: keep track of latest known server value?
    // this._serverData = ko.observable(null)

    // FIXME: avoid initializing above unnecessarily
    if (this.resource) {
      this.read({fromCache: true})
    }
  };


  var objectByUri = Objekt.objectByUri = {};
  // Objekt.make = function(resource, modelClass) {
  Objekt.prototype.make = function(resource, modelClass) {
    if (!resource) {
      throw new Error('Cannot make an Objekt without a Resource!');
    }

    console.log("Find object for", resource)
    var objectClass = this.constructor
// FIXME: vs as argument?
    var uri = resource.uri
    var object = objectByUri[uri];
    if (!object) {
      object = new objectClass(resource, modelClass);
      objectByUri[uri] = object;
      console.log("OBJECT MAKE NEW", object, uri)
    }
    else {
      console.log("OBJECT RECYCLE", object, uri)
    }
    return object;
  };


  Objekt.prototype.read = function(options) {
    // FIXME: by default, read from server, though can disable (esp. from ctor)
    var previousState = this.state();
    this.state('loading');
    return this.resource.read(undefined, options).then(function(data) {
      var model = this.model()
      if (model) {
        model.merge(data)
      } else {
        // create model with data
        model = new this.modelClass(data, this)
        // FIXME: do we want bi-directional bindings?
        this.model(model);
      }

      this.state('ready');
      console.log("set data in Objekt", this, data, this.model())
      return this.model;
    }.bind(this), function(error) {
      this.state(previousState);
      return error;
    }.bind(this));
  };

  Objekt.prototype.write = function() {
    var data = this.model().toJS();
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

  Objekt.prototype.destroy = function() {
    var previousState = this.state();
    this.state('saving');
    return this.resource.destroy().then(function() {
      this.state('destroyed');
      this.model(undefined);
      // FIXME: free up model
    }.bind(this), function(error) {
      this.state(previousState);
      return error;
    }.bind(this));
  };

  return Objekt;
});
