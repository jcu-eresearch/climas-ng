(function() {
  define(['underscore', 'backbone', 'js/oldreports/models/region'], function(_, Backbone, Region) {
    var Regions;
    Regions = Backbone.Collection.extend({
      model: Region
    });
    return Regions;
  });

}).call(this);
