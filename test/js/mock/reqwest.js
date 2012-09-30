// define('reqwest', function() {
//   return jasmine.createSpy();
// });
define('reqwest', function() {
  function fake() {
    return fake.wrapped.apply(this, arguments);
  }
  return fake
});
