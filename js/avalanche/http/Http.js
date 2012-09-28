define(['./HttpJqueryAdapter'], function(HttpJqueryAdapter) {

  return function(uri, options) {

    // var httpAdapter = new HttpJqueryAdapter; // FIXME: or from options
    options = options || {};

    // FIXME: only load if necessary, or default elsewhere?
    var httpAdapter = options.adapter || new HttpJqueryAdapter;

    /**
     * @return a new Promise(data)
     */
    function get(params, options) {
      // TODO: send Accept
      return httpAdapter.get(uri, params, options);
    }

    /**
     * @return a new Promise(data)
     */
    function put(data, options) {
      // TODO: send mediaType as Content-Type
      return httpAdapter.put(uri, data, options);
    }

    /**
     * @return a new Promise(data)
     */
    function post(data, options) {
      // TODO: send mediaType as Content-Type
      // TODO: send Accept
      return httpAdapter.post(uri, data, options);
    }

    /**
     * @return a new Promise(data)
     */
    function del(options) {
      return httpAdapter.del(uri, options);
    }

    return {
      get: get,
      put: put,
      post: post,
      del: del
    };
  };
});
