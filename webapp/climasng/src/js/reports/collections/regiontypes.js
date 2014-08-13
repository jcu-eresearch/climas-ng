(function() {
  define(['underscore', 'backbone', 'js/oldreports/models/regiontype'], function(_, Backbone, RegionType) {
    var RegionTypes;
    RegionTypes = Backbone.Collection.extend({
      model: RegionType
    });
    return RegionTypes;
  });

}).call(this);
