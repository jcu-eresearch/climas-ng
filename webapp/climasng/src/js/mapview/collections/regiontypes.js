(function() {
  var RegionType, RegionTypes;

  RegionType = require('../models/regiontype');

  RegionTypes = Backbone.Collection.extend({
    model: RegionType
  });

  module.exports = RegionTypes;

}).call(this);
