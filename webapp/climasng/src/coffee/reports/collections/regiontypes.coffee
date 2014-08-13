define [
    'underscore', 'backbone',
    'js/oldreports/models/regiontype'
], (_, Backbone, RegionType) ->

    RegionTypes = Backbone.Collection.extend {
        model: RegionType
    }

    return RegionTypes
