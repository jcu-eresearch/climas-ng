
unless window.console
    window.console = { log: () -> {} }

AppView = require('./views/app')

$ ->
    appview = new AppView()
    appview.render()
