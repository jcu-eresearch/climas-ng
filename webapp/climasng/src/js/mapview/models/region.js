var MapLayer;

MapLayer = Backbone.Model.extend({
  constructor: function(shortName, longName, path) {
    this.shortName = shortName;
    this.longName = longName;
    this.path = path;
    return null;
  }
});

module.exports = MapLayer;
