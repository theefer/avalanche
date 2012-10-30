define(['avalanche/resource/Resource'], function(Resource) {
  describe("Resource", function() {
    var resource;

    beforeEach(function() {
      resource = new Resource('/some/uri', {httpAdapter: {}});
    });

    it("should be able to create a Resource", function() {
      expect(!!resource).toEqual(true);
    });

    // TODO: get
    // TODO: put
    // TODO: post
    // TODO: delete

    // TODO: fetch?

    // TODO: extract uri template

    // TODO: extract caching facilities

    // TODO: follow
    // TODO: as

    // TODO: content type

    // TODO: customizable backend?

  });

  return {
    name: 'ResourceSpec'
  };
});
