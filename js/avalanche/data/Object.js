define(['knockout', 'knockout.mapping', './Model'], function(ko, koMapping, Model) {
  var Objekt = function(resource, modelClass) {
    this.resource = resource;
    this.modelClass = modelClass || Model

    this.data = ko.observable(); // not yet initialized
    this.state = ko.observable('uninitialized'); // uninitialized, ready, saving, loading, destroyed
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
      var model = this.data()
      if (model) {
        // model exists, simply update it
        // koMapping.fromJS(data, {}, model.data())
        var modelData = model.data()
        koMapping.fromJS(data, {}, modelData)
        // FIXME: move koMapping (from/to) inside model, can be overriden, config'd
        model.data(modelData)
        // FIXME: redundant?
      } else {
        // create model with data
        model = new this.modelClass(data)
        model.object = this
        // FIXME: do we want bi-directional bindings?
        this.data(model);
      }
      // FIXME:  ^ clumsy

      // var observable = koMapping.fromJS(data, this.data())
      // this.data(observable)
      this.state('ready');
      console.log("set data in Objekt", this, data, this.data())
      return this.data;
    }.bind(this), function(error) {
      this.state(previousState);
      return error;
    }.bind(this));
  };

  Objekt.prototype.write = function() {
    // FIXME: erg
    var data = koMapping.toJS(this.data().data())
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
      this.data(undefined);
    }.bind(this), function(error) {
      this.state(previousState);
      return error;
    }.bind(this));
  };

  return Objekt;
});
