define(['resource/Resource', 'resource/Cache'], function(Resource, ResourceCache) {

  /**
   * Example:
   *
   * require(['avalanche/Api', 'avalanche/http/adapters/Reqwest', 'avalanche/resource/funJSON'],
   *         function(Api, ReqwestAdapter) {
   *   var api = new Api('/api', {type: 'json', adapter: ReqwestAdapter});
   *   var root = api.root();
   *   var root.follow('version').then(function(versionResource) {
   *     versionResource.get().then(function(v) {
   *       console.log('API version: ', v);
   *     });
   *   });
   *   var root.follow('items').then(function(itemsResource) {
   *     itemsResource.get().then(function(items) {
   *       console.log('Items: ', items);
   *     });
   *   });
   * });
   */
  var defaultType = 'json';

  var Api = function(uri, options) {
    this.uri = uri;

    var resourceOptions = {
      httpAdapter: options.httpAdapter, // FIXME: || throw new Error();
      type: options.type || defaultType // 'json', 'xml', etc
    };
    this.resourceCache = new ResourceCache(Resource, resourceOptions);
  };

  Api.prototype.root = function() {
    // return new Resource(this.uri, undefined, this.resourceOptions).fetch();
    return this.resourceCache.byUri(this.uri).fetch()
  };

  return Api;
});