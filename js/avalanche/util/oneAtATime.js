define(function() {
  return function oneAtATime(uniqueCallId, callback /* , args... */) {
    var cache = oneAtATime._cache = (oneAtATime._cache || {});

    var promise = cache[uniqueCallId];
    if (!promise) {
      var args = Array.prototype.slice.call(arguments, 2);
      cache[uniqueCallId] = promise = callback.apply(null, args);
      promise.addBoth(function() {
        delete cache[uniqueCallId];
      });
    }
    return promise;
  };
});