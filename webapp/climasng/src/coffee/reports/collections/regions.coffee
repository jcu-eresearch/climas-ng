define [
    'underscore', 'backbone',
    'js/oldreports/models/region'
], (_, Backbone, Region) ->

    Regions = Backbone.Collection.extend {
        model: Region
    }

    return Regions
