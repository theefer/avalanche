define(['knockout', 'knockout.mapping'], function(ko, koMapping) {
  var Model = function(initialData, containerObject) {
    this.data = ko.observable(koMapping.fromJS(initialData));
    this.object = containerObject
    // FIXME: do we want bi-directional bindings? ok if optional?
  };

  /**
   * Merge a Javascript Object into the internal observable data.
   */
  Model.prototype.merge = function(data) {
    // koMapping.fromJS(data, {}, model.data())
    var currentData = this.data()
    koMapping.fromJS(data, {}, currentData)
    this.data(currentData)
    // FIXME: redundant?
  };

  /**
   * Export data to a plain Javascript Object.
   */
  Model.prototype.toJS = function() {
    return koMapping.toJS(this.data());
  };

  return Model;
});
