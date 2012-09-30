define(function() {
  /**
   * Helper to prevent concurrent calls while a Promise is executing,
   * instead reusing the same Promise of a response.
   * 
   * @param {string} uniqueCallId The unique name to group identical calls by.
   * @param {function} callback A function to perform the action, returning a Promise.
   * @param {any} args Any number of parameters to pass to the callback.
   * @return A single Promise for any number of concurrent calls of the same id.
   */
  return function oneAtATime(uniqueCallId, callback /* , args... */) {
    var cache = oneAtATime.__cache__ = (oneAtATime.__cache__ || {});

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