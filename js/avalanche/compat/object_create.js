// Compatibility function to ensure the presence of the create method on Object
//
// Code borrowed from:
// https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/create
define(function() {
  if (!Object.create) {
    Object.create = function (o) {
      if (arguments.length > 1) {
        throw new Error('Object.create implementation only accepts the first parameter.');
      }
      function F() {}
      F.prototype = o;
      return new F();
    };
  }
});

