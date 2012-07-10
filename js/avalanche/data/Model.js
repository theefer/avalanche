define(['knockout', 'knockout.mapping'], function(ko, koMapping) {
  var Model = function(initialData) {
    this.data = ko.observable(koMapping.fromJS(initialData));
  };

  return Model;
});
