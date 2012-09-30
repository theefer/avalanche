define(['avalanche/util/oneAtATime', 'promise'], function(oneAtATime, Promise) {
  // helper
  function randomCallId() {
    var randId = Math.round(Math.random()*1000000);
    return 'test_' + randId;
  }

  describe("oneAtATime: callback", function() {
    var promise, callId;

    beforeEach(function() {
      promise = new Promise();
      callId = randomCallId();
    });

    it("should return the promise returned by the callback", function() {
      var callback = function() {
        return promise;
      };

      var result = oneAtATime(callId, callback);
      expect(result).toEqual(promise);
    });

    it("should call the callback with all the arguments provided", function() {
      var callback = function() {
        expect(arguments.length).toEqual(3);
        expect(arguments[0]).toEqual(1);
        expect(arguments[1]).toEqual(2);
        expect(arguments[2]).toEqual(3);
        return promise;
      };

      var result = oneAtATime(callId, callback, 1, 2, 3);
    });

    it("should call the callback with no context", function() {
      var callback = function() {
        expect(this).toBe(window);
        return promise;
      };

      var result = oneAtATime(callId, callback);
    });
  });


  describe("oneAtATime: calls", function() {
    var spy, callId;

    beforeEach(function() {
      spy = {
        callback: function() {
          return new Promise;
        }
      };
      spyOn(spy, 'callback').andCallThrough();

      callId = randomCallId();
    });

    it("should invoke the callback only once and return the same promise for two calls before the promise is fullfilled", function() {
      var result1 = oneAtATime(callId, spy.callback);
      var result2 = oneAtATime(callId, spy.callback);

      expect(spy.callback).toHaveBeenCalled();
      expect(spy.callback.calls.length).toEqual(1);

      expect(result1).toEqual(result2);
    });

    it("should return a separate promise for a second call after the first has succeeded", function() {
      var result1 = oneAtATime(callId, spy.callback);
      result1.resolve();
      
      var result2 = oneAtATime(callId, spy.callback);
      result2.resolve();

      expect(spy.callback).toHaveBeenCalled();
      expect(spy.callback.calls.length).toEqual(2);

      expect(result1).not.toEqual(result2);
    });

    it("should return a separate promise for a second call after the first has failed", function() {
      var result1 = oneAtATime(callId, spy.callback);
      result1.reject();
      
      var result2 = oneAtATime(callId, spy.callback);
      result2.resolve();

      expect(spy.callback).toHaveBeenCalled();
      expect(spy.callback.calls.length).toEqual(2);

      expect(result1).not.toEqual(result2);
    });

    it("should return separate promises for concurrent calls with different ids", function() {
      var result1 = oneAtATime(callId, spy.callback);
      var result2 = oneAtATime(callId+'_different', spy.callback);

      expect(spy.callback).toHaveBeenCalled();
      expect(spy.callback.calls.length).toEqual(2);

      expect(result1).not.toEqual(result2);
    });

  });

  return {
    name: 'OneAtATimeSpec'
  };
});
