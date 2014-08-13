
MapLayer = Backbone.Model.extend {
    # ---------------------------------------------------------------
    constructor: (shortName, longName, path)->
        @shortName = shortName
        @longName = longName
        @path = path
        null;
    # ---------------------------------------------------------------
}

module.exports = MapLayer