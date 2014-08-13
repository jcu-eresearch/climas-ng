
RegionType = require('../models/regiontype')

RegionTypes = Backbone.Collection.extend {
    model: RegionType
}

module.exports = RegionTypes
