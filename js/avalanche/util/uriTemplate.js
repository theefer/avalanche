define(function() {
  // Note: for more extensive support, see http://tools.ietf.org/html/rfc6570
  return function uriTemplate(template, params) {
    return template.replace(/{(.*?)}/g, function(match, varName) {
      var val = params[varName];
      if (!val) {
        throw new Error("Missing parameter for URI template variable: " + varName);
      }
      if (! (typeof val === 'string' || typeof val === 'number')) {
        throw new Error("Invalid type for URI template parameter: " + varName);
      }
      return val;
    });
  };
});