
unless window.console
    window.console = { log: () -> {} }

require.config {
#    baseUrl: '/js'
    baseUrl: window.climasSettings.staticUrlPrefix
    waitSeconds: 30
    paths:
        jquery: 'lib/jquery-1.11.0.min'
        underscore: 'lib/underscore-min.AMD'
        backbone: 'lib/backbone-min.AMD'
        showdown: 'lib/showdown'
        ra: 'lib/ra'
}

require [
    'jquery'
    'js/oldreports/views/app'
], ($, AppView) ->

    $ ->
        appview = new AppView()
        appview.render()
