define(['reqwest', 'promise'], function(reqwest, Promise) {

  return function() {

    // FIXME: single query if multiple identical requests

    function ajax(method, uri, data, options) {
      options = options || {};

      var promise = new Promise();

      var ajaxOptions = {
        url: uri,
        method: method,
        data: data,
        // FIXME:
        // type, contentType, etc (params/options?)
        // contentType: 'application/json; charset=utf-8',
        success: function(response, textStatus, req) {
          var contentType = req.getResponseHeader('Content-Type');
          promise.resolve({body: response, contentType: contentType});
        },
        error: function(err) {
          console.log("error:", arguments)
          var error = {}; // ???
          promise.reject(error);
        }
      };

      if (options.accepts) {
        ajaxOptions.type = 'json'
        ajaxOptions.accepts = options.accepts
      }
      if (options.contentType) {
        ajaxOptions.contentType = options.contentType
      }

      reqwest(ajaxOptions);
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
