define(['avalanche/http/adapters/Reqwest'], function(ReqwestAdapter) {
  var uri = '/some/uri';

  function createFakeRequest() {
    return {
      getResponseHeader: function(){ return }
    };
  }

  describe("ReqwestAdapter", function() {
    var adapter;

    beforeEach(function() {
      adapter = new ReqwestAdapter;
    });

    it("should be able to create an ReqwestAdapter", function() {
      expect(!!adapter).toEqual(true);
    });
  });


  describe("ReqwestAdapter.get", function() {
    var adapter;
    var request;
    var responseContentType
    var responseBody;

    beforeEach(function() {
      adapter = new ReqwestAdapter;

      request = createFakeRequest();
    });

    it("should issue a simple GET and return the response", function() {
      responseBody = {foo: 'bar', test: 42};

      var success

      var reqwest = require('reqwest');
      reqwest.wrapped = function(options) {
        expect(options.url).toEqual(uri);
        expect(options.method).toEqual('GET');
        expect(options.data).toBeUndefined();

        request.status = 200;
        request.statusText = 'OK';

        success = options.success

        return {request: request};
      };

      var promise = adapter.get(uri);
      success(responseBody);

      promise.then(function(response) {
        expect(response.status).toEqual(200);
        expect(response.statusText).toEqual("OK");
        expect(response.contentType).toEqual(responseContentType);
        expect(response.body).toEqual(responseBody);
      });
    });

    it("should issue a simple GET with data and return the response", function() {
    });

    it("should issue a simple GET and return the error response", function() {
    });

    // TODO: type, accepts, contentType
  });

  // TODO: put
  // TODO: post
  // TODO: del

  return {
    name: 'ReqwestAdapterSpec'
  };
});
