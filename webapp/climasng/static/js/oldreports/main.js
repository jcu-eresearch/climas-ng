(function() {
  if (!window.console) {
    window.console = {
      log: function() {
        return {};
      }
    };
  }

  require.config({
    baseUrl: window.climasSettings.staticUrlPrefix,
    waitSeconds: 30,
    paths: {
      jquery: 'lib/jquery-1.11.0.min',
      underscore: 'lib/underscore-min.AMD',
      backbone: 'lib/backbone-min.AMD',
      showdown: 'lib/showdown',
      ra: 'lib/ra'
    }
  });

  require(['jquery', 'js/oldreports/views/app'], function($, AppView) {
    return $(function() {
      var appview;
      appview = new AppView();
      return appview.render();
    });
  });

}).call(this);
