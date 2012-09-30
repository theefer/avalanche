define(['avalanche/resource/ObjectResource'], function(ObjectResource) {
  describe("ObjectResource", function() {
    var resource;

    beforeEach(function() {
      resource = new ObjectResource('/some/uri');
    });

    it("should be able to create an ObjectResource", function() {
      expect(!!resource).toEqual(true);

      // //demonstrates use of custom matcher
      // expect(player).toBePlaying(song);
    });

    // TODO: contentType, resourceclass (make)
    // TODO: read
    // TODO: update
    // TODO: destroy

    // TODO: links

    // TODO: + all base tests from Resource

  });

  return {
    name: 'ObjectResourceSpec'
  };
});
