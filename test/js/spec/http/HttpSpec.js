define(['avalanche/http/Http'], function(Http) {
  var uri = '/some/uri';

  describe("Http", function() {
    var http;

    beforeEach(function() {
      http = new Http(uri);
    });

    it("should be able to create an Http client", function() {
      expect(!!http).toEqual(true);
    });

  });

  describe("Http.get", function() {
    var adapter;
    var http;
    var resp;

    beforeEach(function() {
      adapter = createSpyAdapter();
      http = new Http(uri, {adapter: adapter});

      resp = new Object;
      spyOn(adapter, 'get').andReturn(resp);
    });

    it("should call get on the underlying adapter", function() {
      var response = http.get();
      expect(adapter.get).toHaveBeenCalledWith(uri, undefined, undefined);
      expect(response).toBe(resp);
    });

    it("should call get on the underlying adapter with params", function() {
      var response = http.get({hello: 'bob'});
      expect(adapter.get).toHaveBeenCalledWith(uri, {hello: 'bob'}, undefined);
      expect(response).toBe(resp);
    });

    it("should call get on the underlying adapter with options", function() {
      var response = http.get(null, {hello: 'bob'});
      expect(adapter.get).toHaveBeenCalledWith(uri, null, {hello: 'bob'});
      expect(response).toBe(resp);
    });

    it("should call get on the underlying adapter with params and options", function() {
      var response = http.get({foo: 'bar'}, {hello: 'bob'});
      expect(adapter.get).toHaveBeenCalledWith(uri, {foo: 'bar'}, {hello: 'bob'});
      expect(response).toBe(resp);
    });
  });

  // TODO: put
  // TODO: post
  // TODO: del

  // TODO: default adapter

  function createSpyAdapter(resp) {
    // return jasmine.createSpyObj('adapter', ['get', 'put', 'post', 'del']);
    return {
      'get': function(){},
      'put': function(){},
      'post': function(){},
      'del': function(){}
    };
  }

  return {
    name: 'HttpSpec'
  };
});
