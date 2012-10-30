define(function() {
  // singleton for registering resource classes by content-type
  var registry = {};

  registry.register = function(resourceClass, contentType) {
    this[contentType] = resourceClass;
  };

  registry.contentTypeForClass = function(resourceClass) {
    for (var type in this) {
      if (this[type] == resourceClass) {
        return type;
      }
    }
  };

  return registry;
});
