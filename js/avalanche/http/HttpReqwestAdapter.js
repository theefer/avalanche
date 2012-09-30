define(['reqwest', 'promise'], function(reqwest, Promise) {

  return function() {

    // FIXME: single query if multiple identical requests

    function ajax(method, uri, data, options) {
      options = options || {};

      var promise = new Promise();
      var req;

      var ajaxOptions = {
        url: uri,
        method: method,
        data: data,
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

      // FIXME: accept, type, contentType, etc (params/options?)
      // expecting
      if (options.accepts) {
        ajaxOptions.type = 'json'
        ajaxOptions.accepts = options.accepts
        // ajaxOptions.headers.Accept = 'json'
      } else {
        // FIXME: temporary hacky default
        ajaxOptions.type = 'json'
      }

      // sending
      if (options.contentType) {
        ajaxOptions.contentType = options.contentType
      }

      req = reqwest(ajaxOptions);
      return promise;
    }

    function get(uri, params, options) {
      return ajax('GET', uri, params, options);
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
