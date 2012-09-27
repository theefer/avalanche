define(['avalanche/resource/Resource'], function(Resource) {
  describe("Resource", function() {
    var resource;

    beforeEach(function() {
      resource = new Resource('/some/uri');
    });

    it("should be able to create a Resource", function() {
      expect(!!resource).toEqual(true);

      // //demonstrates use of custom matcher
      // expect(player).toBePlaying(song);
    });

  });

  return {
    name: 'ResourceSpec'
  };
});
