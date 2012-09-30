define(['avalanche/util/uriTemplate'], function(uriTemplate) {
  describe("uriTemplate", function() {
    var resource;

    it("should return a parameter-free URI string unchanged", function() {
      var result = uriTemplate('/some/uri');
      expect(result).toEqual('/some/uri');
    });

    it("should ignore parameters and return a parameter-free URI string unchanged", function() {
      var result = uriTemplate('/some/uri', {foo: 'bar'});
      expect(result).toEqual('/some/uri');
    });

    it("should substitute a single string parameter", function() {
      var result = uriTemplate('/some/uri/{foo}', {foo: 'bar'});
      expect(result).toEqual('/some/uri/bar');
    });

    it("should substitute a single integer parameter", function() {
      var result = uriTemplate('/some/uri/{foo}', {foo: 42});
      expect(result).toEqual('/some/uri/42');
    });

    it("should throw an error when a parameter is an object", function() {
      var wrapped = function() {
        uriTemplate('/some/uri/{foo}', {foo: {}});
      };
      expect(wrapped).toThrow();
    });

    it("should throw an error when a parameter is a function", function() {
      var wrapped = function() {
        uriTemplate('/some/uri/{foo}', {foo: function(){}});
      };
      expect(wrapped).toThrow();
    });

    it("should throw an error when a parameter is undefined", function() {
      var wrapped = function() {
        uriTemplate('/some/uri/{foo}', {foo: undefined});
      };
      expect(wrapped).toThrow();
    });

    it("should substitute multiple parameters", function() {
      var result = uriTemplate('/some/{test}/uri/{foo}', {foo: 'bar', test: 'val'});
      expect(result).toEqual('/some/val/uri/bar');
    });

    it("should ignore parameters absent from the template", function() {
      var result = uriTemplate('/some/{test}/uri', {imaginary: 'x', test: 'val'});
      expect(result).toEqual('/some/val/uri');
    });

    it("should substitute multiple occurences of the same parameter in the template", function() {
      var result = uriTemplate('/some/{test}/uri/{test}', {test: 'val'});
      expect(result).toEqual('/some/val/uri/val');
    });

    it("should throw an error when a required parameter is missing", function() {
      var wrapped = function() {
        uriTemplate('/some/{param}', {});
      };
      expect(wrapped).toThrow();
    });

  });

  return {
    name: 'ResourceSpec'
  };
});
