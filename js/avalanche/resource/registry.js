define(function() {
  // singleton for registering resource classes by content-type
  var registry = {};

  registry.register = function(resourceClass) {
    var contentType = resourceClass.prototype.contentType;
    this[contentType] = resourceClass;
  };

  return registry;
});