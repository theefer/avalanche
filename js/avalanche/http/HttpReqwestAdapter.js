define(['reqwest', 'promise'], function(reqwest, Promise) {

  return function() {

    function ajax(method, uri, data, options) {
      options = options || {};

      // FIXME: defaults?
      // if (!options.type) {
      // }

      // if (!options.accept) {
      // }

      // if (data && !options.contentType) {
      // }

      var promise = new Promise();
      var req;

      var ajaxOptions = {
        url:         uri,
        method:      method,
        data:        data,
        type:        options.type,
        accept:      options.accept,
        contentType: data && options.contentType,
        success: function(response) {
          var request = req.request;
          promise.resolve({
            status:      request.status,
            statusText:  request.statusText,
            contentType: request.getResponseHeader('Content-Type'),
            body:        response
          });
        },
        error: function(request) {
          // TODO: parse body if JSON
          var error = {
            status:      request.status,
            statusText:  request.statusText,
            contentType: request.getResponseHeader('Content-Type'),
            body:        request.responseText
          };
          promise.reject(error);
        }
      };

      req = reqwest(ajaxOptions);
      return promise;
    }

    function get(uri, data, options) {
      return ajax('GET', uri, data, options);
    }
    function put(uri, data, options) {
      return ajax('PUT', uri, data, options);
    }
    function post(uri, data, options) {
      return ajax('POST', uri, data, options);
    }
    function del(uri, options) {
      return ajax('DELETE', uri, options);
    }

    return {
      get: get,
      put: put,
      post: post,
      del: del
    };

  };

});
