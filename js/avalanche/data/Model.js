define(['knockout', 'knockout.mapping'], function(ko, koMapping) {
  var Model = function(initialData, containerObject) {
    // FIXME: needs to be observable? iff observe add/remove props - observableObject?
    this.data = ko.observable(koMapping.fromJS(initialData || {}));
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
