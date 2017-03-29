(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

require('./mapview/main');
require('./menusandpanels');

$(function() {
    // $('header').disableSelection(); // unpopular but still better
    $('nav > ul').mspp({});
});

},{"./mapview/main":2,"./menusandpanels":6}],2:[function(require,module,exports){
(function() {
  var AppView;

  if (!window.console) {
    window.console = {
      log: function() {
        return {};
      }
    };
  }

  AppView = require('./views/app');

  $(function() {
    var appview;
    appview = new AppView();
    return appview.render();
  });

}).call(this);

},{"./views/app":5}],3:[function(require,module,exports){
(function() {
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

}).call(this);

},{}],4:[function(require,module,exports){
(function() {
  var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  if (!Array.prototype.forEach) {
    Array.prototype.forEach = function(fn, scope) {
      var i, _i, _ref, _results;
      _results = [];
      for (i = _i = 0, _ref = this.length; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        _results.push(__indexOf.call(this, i) >= 0 ? fn.call(scope, this[i], i, this) : void 0);
      }
      return _results;
    };
  }

  if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(needle) {
      var i, _i, _ref;
      for (i = _i = 0, _ref = this.length; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        if (this[i] === needle) {
          return i;
        }
      }
      return -1;
    };
  }

}).call(this);

},{}],5:[function(require,module,exports){
(function() {
  var AppView, MapLayer, debug,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  MapLayer = require('../models/maplayer');

  require('../util/shims');


  /* jshint -W093 */

  debug = function(itemToLog, itemLevel) {
    var levels, messageNum, threshold, thresholdNum;
    levels = ['verydebug', 'debug', 'message', 'warning'];
    threshold = 'message';
    if (!itemLevel) {
      itemLevel = 'debug';
    }
    thresholdNum = levels.indexOf(threshold);
    messageNum = levels.indexOf(itemLevel);
    if (thresholdNum > messageNum) {
      return;
    }
    if (itemToLog + '' === itemToLog) {
      return console.log("[" + itemLevel + "] " + itemToLog);
    } else {
      return console.log(itemToLog);
    }
  };

  AppView = Backbone.View.extend({
    tagName: 'div',
    className: 'splitmap showforms',
    id: 'splitmap',
    speciesDataUrl: window.mapConfig.speciesDataUrl,
    biodivDataUrl: window.mapConfig.biodivDataUrl,
    rasterApiUrl: window.mapConfig.rasterApiUrl,
    trackSplitter: false,
    trackPeriod: 100,
    events: {
      'click .btn-change': 'toggleForms',
      'click .btn-compare': 'toggleSplitter',
      'click .btn-copy.left-valid-map': 'copyMapLeftToRight',
      'click .btn-copy.right-valid-map': 'copyMapRightToLeft',
      'leftmapupdate': 'leftSideUpdate',
      'rightmapupdate': 'rightSideUpdate',
      'change select.left': 'leftSideUpdate',
      'change select.right': 'rightSideUpdate',
      'change input.left': 'leftSideUpdate',
      'change input.right': 'rightSideUpdate'
    },
    tick: function() {
      if (false) {
        debug(this.leftInfo.scenario);
      } else {
        debug('tick');
      }
      return setTimeout(this.tick, 1000);
    },
    initialize: function() {
      debug('AppView.initialize');
      _.bindAll.apply(_, [this].concat(_.functions(this)));
      this.namesList = [];
      this.speciesSciNameList = [];
      this.speciesInfoFetchProcess = this.fetchSpeciesInfo();
      this.biodivList = [];
      return this.biodivInfoFetchProcess = this.fetchBiodivInfo();
    },
    render: function() {
      debug('AppView.render');
      this.$el.append(AppView.templates.layout({
        leftTag: AppView.templates.leftTag(),
        rightTag: AppView.templates.rightTag(),
        leftForm: AppView.templates.leftForm(),
        rightForm: AppView.templates.rightForm()
      }));
      $('#contentwrap').append(this.$el);
      this.map = L.map('map', {
        center: [0, 0],
        zoom: 3
      });
      this.map.on('move', this.resizeThings);
      L.tileLayer('http://{s}.{base}.maps.cit.api.here.com/maptile/2.1/{type}/{mapID}/{scheme}/{z}/{x}/{y}/{size}/{format}?app_id={app_id}&app_code={app_code}&lg={language}', {
        attribution: 'Map &copy; 2016 <a href="http://developer.here.com">HERE</a>',
        subdomains: '1234',
        base: 'aerial',
        type: 'maptile',
        scheme: 'terrain.day',
        app_id: 'l2Rye6zwq3u2cHZpVIPO',
        app_code: 'MpXSlNLcLSQIpdU6XHB0TQ',
        mapID: 'newest',
        maxZoom: 18,
        language: 'eng',
        format: 'png8',
        size: '256'
      }).addTo(this.map);
      this.leftForm = this.$('.left.form');
      this.buildLeftForm();
      this.rightForm = this.$('.right.form');
      this.buildRightForm();
      this.leftTag = this.$('.left.tag');
      this.rightTag = this.$('.right.tag');
      this.splitLine = this.$('.splitline');
      this.splitThumb = this.$('.splitthumb');
      this.leftSideUpdate();
      return this.rightSideUpdate();
    },
    resolvePlaceholders: function(strWithPlaceholders, replacements) {
      var ans, key, re, value;
      ans = strWithPlaceholders;
      ans = ans.replace(/\{\{\s*location.protocol\s*\}\}/g, location.protocol);
      ans = ans.replace(/\{\{\s*location.host\s*\}\}/g, location.host);
      ans = ans.replace(/\{\{\s*location.hostname\s*\}\}/g, location.hostname);
      for (key in replacements) {
        value = replacements[key];
        re = new RegExp("\\{\\{\\s*" + key + "\\s*\\}\\}", "g");
        ans = ans.replace(re, value);
      }
      return ans;
    },
    copyMapLeftToRight: function() {
      debug('AppView.copyMapLeftToRight');
      if (!this.leftInfo) {
        return;
      }
      this.$('#rightmapspp').val(this.leftInfo.speciesName);
      this.$('#rightmapyear').val(this.leftInfo.year);
      this.$('input[name=rightmapscenario]').each((function(_this) {
        return function(index, item) {
          return $(item).prop('checked', $(item).val() === _this.leftInfo.scenario);
        };
      })(this));
      this.$('#rightmapgcm').val(this.leftInfo.gcm);
      return this.rightSideUpdate();
    },
    copyMapRightToLeft: function() {
      debug('AppView.copyMapRightToLeft');
      if (!this.rightInfo) {
        return;
      }
      this.$('#leftmapspp').val(this.rightInfo.speciesName);
      this.$('#leftmapyear').val(this.rightInfo.year);
      this.$('input[name=leftmapscenario]').each((function(_this) {
        return function(index, item) {
          return $(item).prop('checked', $(item).val() === _this.rightInfo.scenario);
        };
      })(this));
      this.$('#leftmapgcm').val(this.rightInfo.gcm);
      return this.leftSideUpdate();
    },
    sideUpdate: function(side) {
      var atBaseline, currInfo, mapValidQuery, newInfo, _ref;
      debug('AppView.sideUpdate (' + side + ')');
      newInfo = {
        speciesName: this.$('#' + side + 'mapspp').val(),
        year: this.$('#' + side + 'mapyear').val(),
        scenario: this.$('input[name=' + side + 'mapscenario]:checked').val(),
        gcm: this.$('#' + side + 'mapgcm').val()
      };
      atBaseline = newInfo.year === 'baseline';
      this.$('input[name=' + side + 'mapscenario], #' + side + 'mapgcm').prop('disabled', atBaseline);
      this.$('.' + side + '.side.form fieldset').removeClass('disabled');
      this.$('input[name=' + side + 'mapscenario]:disabled, #' + side + 'mapgcm:disabled').closest('fieldset').addClass('disabled');
      mapValidQuery = '.' + side + '-valid-map';
      if (_ref = newInfo.speciesName, __indexOf.call(this.namesList, _ref) >= 0) {
        this.$(mapValidQuery).removeClass('disabled').prop('disabled', false);
      } else {
        this.$(mapValidQuery).addClass('disabled').prop('disabled', true);
        return false;
      }
      currInfo = side === 'left' ? this.leftInfo : this.rightInfo;
      if (currInfo && _.isEqual(newInfo, currInfo)) {
        return false;
      }
      if (currInfo && newInfo.speciesName === currInfo.speciesName && newInfo.year === currInfo.year && newInfo.year === 'baseline') {
        return false;
      }
      if (side === 'left') {
        this.leftInfo = newInfo;
      } else {
        this.rightInfo = newInfo;
      }
      this.addMapLayer(side);
      return this.addMapTag(side);
    },
    leftSideUpdate: function() {
      return this.sideUpdate('left');
    },
    rightSideUpdate: function() {
      return this.sideUpdate('right');
    },
    addMapTag: function(side) {
      var info, tag;
      debug('AppView.addMapTag');
      if (side === 'left') {
        info = this.leftInfo;
      }
      if (side === 'right') {
        info = this.rightInfo;
      }
      tag = "<b><i>" + info.speciesName + "</i></b>";
      if (info.year === 'baseline') {
        tag = "current " + tag + " distribution";
      } else {
        tag = "<b>" + info.gcm + "</b> percentile projections for " + tag + " in <b>" + info.year + "</b> if <b>" + info.scenario + "</b>";
      }
      if (side === 'left') {
        this.leftTag.find('.leftlayername').html(tag);
      }
      if (side === 'right') {
        return this.rightTag.find('.rightlayername').html(tag);
      }
    },
    addMapLayer: function(side) {
      var futureModelPoint, isBiodiversity, layer, loadClass, mapUrl, sideInfo, sppFileName, val, zipUrl, _ref;
      debug('AppView.addMapLayer');
      if (side === 'left') {
        sideInfo = this.leftInfo;
      }
      if (side === 'right') {
        sideInfo = this.rightInfo;
      }
      isBiodiversity = (_ref = sideInfo.speciesName, __indexOf.call(this.biodivList, _ref) >= 0);
      futureModelPoint = '';
      mapUrl = '';
      zipUrl = '';
      if (isBiodiversity) {
        futureModelPoint = ['biodiversity/deciles/biodiversity', sideInfo.scenario, sideInfo.year, sideInfo.gcm].join('_');
        if (sideInfo.year === 'baseline') {
          futureModelPoint = 'biodiversity/biodiversity_current';
        }
        mapUrl = [
          this.resolvePlaceholders(this.biodivDataUrl, {
            sppGroup: sideInfo.speciesName
          }), futureModelPoint + '.tif'
        ].join('/');
        zipUrl = [
          this.resolvePlaceholders(this.biodivDataUrl, {
            sppGroup: sideInfo.speciesName
          }), 'biodiversity', sideInfo.speciesName + '.zip'
        ].join('/');
        this.$('#' + side + 'mapdl').attr('href', mapUrl);
        this.$('#' + side + 'archivedl').html('download this biodiversity group<br>(~100Mb zip)');
        this.$('#' + side + 'archivedl').attr('href', zipUrl);
      } else {
        futureModelPoint = ['/dispersal/deciles/' + sideInfo.scenario, sideInfo.year, sideInfo.gcm].join('_');
        if (sideInfo.year === 'baseline') {
          futureModelPoint = '/current';
        }
        sppFileName = sideInfo.speciesName.replace(' ', '_');
        mapUrl = [
          this.resolvePlaceholders(this.speciesDataUrl, {
            sppName: sppFileName,
            sppGroup: this.speciesGroups[sideInfo.speciesName]
          }), futureModelPoint + '.tif'
        ].join('/');
        zipUrl = [
          this.resolvePlaceholders(this.speciesDataUrl, {
            sppName: sppFileName,
            sppGroup: this.speciesGroups[sideInfo.speciesName]
          }), sppFileName + '.zip'
        ].join('/');
        this.$('#' + side + 'mapdl').attr('href', mapUrl);
        this.$('#' + side + 'archivedl').html('download this species<br>(~2Gb zip)');
        this.$('#' + side + 'archivedl').attr('href', zipUrl);
      }
      layer = L.tileLayer.wms(this.resolvePlaceholders(this.rasterApiUrl), {
        DATA_URL: mapUrl,
        layers: 'DEFAULT',
        format: 'image/png',
        transparent: true
      });
      loadClass = '' + side + 'loading';
      layer.on('loading', (function(_this) {
        return function() {
          return _this.$el.addClass(loadClass);
        };
      })(this));
      layer.on('load', (function(_this) {
        return function() {
          return _this.$el.removeClass(loadClass);
        };
      })(this));
      if (side === 'left') {
        if (this.leftLayer) {
          this.map.removeLayer(this.leftLayer);
        }
        this.leftLayer = layer;
      }
      if (side === 'right') {
        if (this.rightLayer) {
          this.map.removeLayer(this.rightLayer);
        }
        this.rightLayer = layer;
      }
      layer.addTo(this.map);
      this.resizeThings();
      if (ga && typeof ga === 'function') {
        if (sideInfo.year === 'baseline') {
          val = 1990;
        } else {
          val = parseInt(sideInfo.year, 10);
        }
        val = val + {
          'tenth': 0.1,
          'fiftieth': 0.5,
          'ninetieth': 0.9
        }[sideInfo.gcm];
        return ga('send', {
          'hitType': 'event',
          'eventCategory': 'mapshow',
          'eventAction': sideInfo.speciesName,
          'eventLabel': sideInfo.scenario,
          'eventValue': val
        });
      }
    },
    centreMap: function(repeatedlyFor) {
      var later, recentre, _i, _results;
      debug('AppView.centreMap');
      if (!repeatedlyFor) {
        repeatedlyFor = 500;
      }
      recentre = (function(_this) {
        return function() {
          _this.map.invalidateSize(false);
          return _this.resizeThings();
        };
      })(this);
      _results = [];
      for (later = _i = 0; _i <= repeatedlyFor; later = _i += 25) {
        _results.push(setTimeout(recentre, later));
      }
      return _results;
    },
    toggleForms: function() {
      debug('AppView.toggleForms');
      this.$el.toggleClass('showforms');
      return this.centreMap();
    },
    toggleSplitter: function() {
      debug('AppView.toggleSplitter');
      this.$el.toggleClass('split');
      if (this.$el.hasClass('split')) {
        this.activateSplitter();
      } else {
        this.deactivateSplitter();
      }
      return this.centreMap();
    },
    fetchSpeciesInfo: function() {
      debug('AppView.fetchSpeciesInfo');
      return $.ajax({
        url: '/data/species',
        dataType: 'json'
      }).done((function(_this) {
        return function(data) {
          var commonNameWriter, speciesGroups, speciesLookupList, speciesSciNameList;
          speciesLookupList = [];
          speciesSciNameList = [];
          speciesGroups = {};
          commonNameWriter = function(sciName) {
            var sciNamePostfix;
            sciNamePostfix = " (" + sciName + ")";
            return function(cnIndex, cn) {
              return speciesLookupList.push({
                label: cn + sciNamePostfix,
                value: sciName
              });
            };
          };
          $.each(data, function(sciName, sppInfo) {
            speciesSciNameList.push(sciName);
            speciesGroups[sciName] = sppInfo.group;
            if (sppInfo.commonNames) {
              return $.each(sppInfo.commonNames, commonNameWriter(sciName));
            } else {
              return speciesLookupList.push({
                label: sciName,
                value: sciName
              });
            }
          });
          _this.speciesLookupList = speciesLookupList;
          _this.speciesSciNameList = speciesSciNameList;
          return _this.speciesGroups = speciesGroups;
        };
      })(this));
    },
    fetchBiodivInfo: function() {
      debug('AppView.fetchBiodivInfo');
      return $.ajax({
        url: '/data/biodiversity',
        dataType: 'json'
      }).done((function(_this) {
        return function(data) {
          var biodivList, biodivLookupList;
          biodivList = [];
          biodivLookupList = [];
          $.each(data, function(biodivName, biodivInfo) {
            var biodivCapName;
            biodivCapName = biodivName.replace(/^./, function(c) {
              return c.toUpperCase();
            });
            biodivList.push(biodivName);
            return biodivLookupList.push({
              label: "Biodiversity of " + biodivCapName,
              value: biodivName
            });
          });
          _this.biodivList = biodivList;
          return _this.biodivLookupList = biodivLookupList;
        };
      })(this));
    },
    buildLeftForm: function() {
      debug('AppView.buildLeftForm');
      return $.when(this.speciesInfoFetchProcess, this.biodivInfoFetchProcess).done((function(_this) {
        return function() {
          var $leftmapspp;
          $leftmapspp = _this.$('#leftmapspp');
          _this.namesList = _this.biodivList.concat(_this.speciesSciNameList);
          return $leftmapspp.autocomplete({
            source: _this.biodivLookupList.concat(_this.speciesLookupList),
            appendTo: _this.$el,
            close: function() {
              return _this.$el.trigger('leftmapupdate');
            }
          });
        };
      })(this));
    },
    buildRightForm: function() {
      debug('AppView.buildRightForm');
      return $.when(this.speciesInfoFetchProcess, this.biodivInfoFetchProcess).done((function(_this) {
        return function() {
          var $rightmapspp;
          $rightmapspp = _this.$('#rightmapspp');
          _this.namesList = _this.biodivList.concat(_this.speciesSciNameList);
          return $rightmapspp.autocomplete({
            source: _this.biodivLookupList.concat(_this.speciesLookupList),
            appendTo: _this.$el,
            close: function() {
              return _this.$el.trigger('rightmapupdate');
            }
          });
        };
      })(this));
    },
    startSplitterTracking: function() {
      debug('AppView.startSplitterTracking');
      this.trackSplitter = true;
      this.splitLine.addClass('dragging');
      return this.locateSplitter();
    },
    locateSplitter: function() {
      debug('AppView.locateSplitter');
      if (this.trackSplitter) {
        this.resizeThings();
        if (this.trackSplitter === 0) {
          this.trackSplitter = false;
        } else if (this.trackSplitter !== true) {
          this.trackSplitter -= 1;
        }
        return setTimeout(this.locateSplitter, this.trackPeriod);
      }
    },
    resizeThings: function() {
      var $mapBox, bottomRight, layerBottom, layerTop, leftLeft, leftMap, mapBounds, mapBox, newLeftWidth, rightMap, rightRight, splitPoint, splitX, topLeft;
      debug('AppView.resizeThings');
      if (this.leftLayer) {
        leftMap = $(this.leftLayer.getContainer());
      }
      if (this.rightLayer) {
        rightMap = $(this.rightLayer.getContainer());
      }
      if (this.$el.hasClass('split')) {
        newLeftWidth = this.splitThumb.position().left + (this.splitThumb.width() / 2.0);
        mapBox = this.map.getContainer();
        $mapBox = $(mapBox);
        mapBounds = mapBox.getBoundingClientRect();
        topLeft = this.map.containerPointToLayerPoint([0, 0]);
        splitPoint = this.map.containerPointToLayerPoint([newLeftWidth, 0]);
        bottomRight = this.map.containerPointToLayerPoint([$mapBox.width(), $mapBox.height()]);
        layerTop = topLeft.y;
        layerBottom = bottomRight.y;
        splitX = splitPoint.x - mapBounds.left;
        leftLeft = topLeft.x - mapBounds.left;
        rightRight = bottomRight.x;
        this.splitLine.css('left', newLeftWidth);
        this.leftTag.attr('style', "clip: rect(0, " + newLeftWidth + "px, auto, 0)");
        if (this.leftLayer) {
          leftMap.attr('style', "clip: rect(" + layerTop + "px, " + splitX + "px, " + layerBottom + "px, " + leftLeft + "px)");
        }
        if (this.rightLayer) {
          return rightMap.attr('style', "clip: rect(" + layerTop + "px, " + rightRight + "px, " + layerBottom + "px, " + splitX + "px)");
        }
      } else {
        this.leftTag.attr('style', 'clip: inherit');
        if (this.leftLayer) {
          leftMap.attr('style', 'clip: inherit');
        }
        if (this.rightLayer) {
          return rightMap.attr('style', 'clip: rect(0,0,0,0)');
        }
      }
    },
    stopSplitterTracking: function() {
      debug('AppView.stopSplitterTracking');
      this.splitLine.removeClass('dragging');
      return this.trackSplitter = 5;
    },
    activateSplitter: function() {
      debug('AppView.activateSplitter');
      this.splitThumb.draggable({
        containment: $('#mapwrapper'),
        scroll: false,
        start: this.startSplitterTracking,
        drag: this.resizeThings,
        stop: this.stopSplitterTracking
      });
      return this.resizeThings();
    },
    deactivateSplitter: function() {
      debug('AppView.deactivateSplitter');
      this.splitThumb.draggable('destroy');
      return this.resizeThings();
    }
  }, {
    templates: {
      layout: _.template("<div class=\"splitline\">&nbsp;</div>\n<div class=\"splitthumb\"><span>&#x276e; &#x276f;</span></div>\n<div class=\"left tag\"><%= leftTag %></div>\n<div class=\"right tag\"><%= rightTag %></div>\n<div class=\"left side form\"><%= leftForm %></div>\n<div class=\"right side form\"><%= rightForm %></div>\n<div class=\"left loader\"><img src=\"/static/images/spinner.loadinfo.net.gif\" /></div>\n<div class=\"right loader\"><img src=\"/static/images/spinner.loadinfo.net.gif\" /></div>\n<div id=\"mapwrapper\"><div id=\"map\"></div></div>"),
      leftTag: _.template("<div class=\"show\">\n    <span class=\"leftlayername\">plain map</span>\n    <br>\n    <button class=\"btn-change\">settings</button>\n    <button class=\"btn-compare\">show/hide comparison map</button>\n</div>\n<div class=\"edit\">\n    <input id=\"leftmapspp\" class=\"left\" name=\"leftmapspp\" placeholder=\"&hellip; species or group &hellip;\" />\n    <!--\n    <button class=\"btn-change\">hide settings</button>\n    <button class=\"btn-compare\">compare +/-</button>\n    -->\n</div>"),
      rightTag: _.template("<div class=\"show\">\n    <span class=\"rightlayername\">(no distribution)</span>\n    <br>\n    <button class=\"btn-change\">settings</button>\n    <button class=\"btn-compare\">show/hide comparison map</button>\n</div>\n<div class=\"edit\">\n    <input id=\"rightmapspp\" class=\"right\" name=\"rightmapspp\" placeholder=\"&hellip; species or group &hellip;\" />\n</div>"),
      leftForm: _.template("<fieldset>\n    <legend>temperature change</legend>\n    <select class=\"left\" id=\"leftmapdegs\">\n        <option value=\"baseline\">current</option>\n        <option value=\"1.5\">1.5 &deg;C</option>\n        <option value=\"2.0\">2.0 &deg;C</option>\n        <option value=\"2.7\">2.7 &deg;C</option>\n        <option value=\"3.2\">3.2 &deg;C</option>\n        <option value=\"4.5\">4.5 &deg;C</option>\n        <option value=\"6.0\">6.0 &deg;C</option>\n    </select>\n</fieldset>\n<fieldset>\n    <legend>adaptation via range shift</legend>\n    <label><span>allow</span> <input name=\"leftmapscenario\" class=\"left\" type=\"radio\" value=\"RCP45\"> species can adapt by shifting ranges</label>\n    <label><span>deny</span> <input name=\"leftmapscenario\" class=\"left\" type=\"radio\" value=\"RCP85\" checked=\"checked\"> species cannot shift ranges</label>\n</fieldset>\n<fieldset>\n    <legend>model summary</legend>\n    <select class=\"left\" id=\"leftmapgcm\">\n        <option value=\"tenth\">10th percentile</option>\n        <option value=\"fiftieth\" selected=\"selected\">50th percentile</option>\n        <option value=\"ninetieth\">90th percentile</option>\n    </select>\n</fieldset>\n<fieldset class=\"blank\">\n    <button type=\"button\" class=\"btn-change\">hide settings</button>\n    <button type=\"button\" class=\"btn-compare\">show right map</button>\n    <button type=\"button\" class=\"btn-copy right-valid-map\">copy right map &laquo;</button>\n    <a id=\"leftmapdl\" class=\"download left-valid-map\" href=\"\" disabled=\"disabled\">download just this map<br>(<20Mb GeoTIFF)</a>\n    <a id=\"leftarchivedl\" class=\"download left-valid-map\" href=\"\" disabled=\"disabled\">download this set of maps<br>(~2Gb zip)</a>\n</fieldset>\n\n<fieldset>\n    <legend>time point</legend>\n    <select class=\"left\" id=\"leftmapyear\">\n        <option value=\"baseline\">current</option>\n        <option>2025</option>\n        <option>2035</option>\n        <option>2045</option>\n        <option>2055</option>\n        <option>2065</option>\n        <option>2075</option>\n        <option>2085</option>\n    </select>\n</fieldset>\n<fieldset>\n    <legend>emission scenario</legend>\n    <label><span>RCP 4.5</span> <input name=\"leftmapscenario\" class=\"left\" type=\"radio\" value=\"RCP45\"> lower emissions</label>\n    <label><span>RCP 8.5</span> <input name=\"leftmapscenario\" class=\"left\" type=\"radio\" value=\"RCP85\" checked=\"checked\"> business as usual</label>\n</fieldset>"),
      rightForm: _.template("<fieldset>\n    <legend>time point</legend>\n    <select class=\"right\" id=\"rightmapyear\">\n        <option value=\"baseline\">current</option>\n        <option>2025</option>\n        <option>2035</option>\n        <option>2045</option>\n        <option>2055</option>\n        <option>2065</option>\n        <option>2075</option>\n        <option>2085</option>\n    </select>\n</fieldset>\n<fieldset>\n    <legend>emission scenario</legend>\n    <label><span>RCP 4.5</span> <input name=\"rightmapscenario\" class=\"right\" type=\"radio\" value=\"RCP45\"> lower emissions</label>\n    <label><span>RCP 8.5</span> <input name=\"rightmapscenario\" class=\"right\" type=\"radio\" value=\"RCP85\" checked=\"checked\"> business as usual</label>\n</fieldset>\n<fieldset>\n    <legend>model summary</legend>\n    <select class=\"right\" id=\"rightmapgcm\">\n        <option value=\"tenth\">10th percentile</option>\n        <option value=\"fiftieth\" selected=\"selected\">50th percentile</option>\n        <option value=\"ninetieth\">90th percentile</option>\n    </select>\n</fieldset>\n<fieldset class=\"blank\">\n    <button type=\"button\" class=\"btn-change\">hide settings</button>\n    <button type=\"button\" class=\"btn-compare\">hide right map</button>\n    <button type=\"button\" class=\"btn-copy left-valid-map\">&raquo; copy left map</button>\n    <a id=\"rightmapdl\" class=\"download right-valid-map\" href=\"\" disabled=\"disabled\">download just this map<br>(<20Mb GeoTIFF)</a>\n    <a id=\"rightarchivedl\" class=\"download right-valid-map\" href=\"\" disabled=\"disabled\">download this set of maps<br>(<2Gb zip)</a>\n</fieldset>")
    }
  });

  module.exports = AppView;

}).call(this);

},{"../models/maplayer":3,"../util/shims":4}],6:[function(require,module,exports){

// jQuery plugin
// author: Daniel Baird <daniel@danielbaird.com>
// version: 0.1.20140205

//
// This manages menus, submenus, panels, and pages.
// Like this:
// ---.--------------------------------------------------------.----------------------.------------------------.---
//    |                                                        |                      |                        |
//    |  Selected Main Menu Item   .-----------. .---------.   |  Alt Main Menu Item  |  Third Main Menu Item  |
//    |                           /  Subitem 1  \ Subitem 2 \  |                      |                        |
// ---'--------------------------'               '-------------'----------------------'------------------------'---
//       |                                                                                                 |
//       |   Panel for Subitem 1, this is Page 1                                                           |
//       |                                                                                                 |
//       |   Each Panel can have multiple pages, one page showing at a time.  Buttons on pages switch      |
//       |   between pages.  Panel height adjusts to the height of the page.                               |
//       |                                                                                                 |
//       |   [ see page 2 ]                                                                                |
//       |                                                                                                 |
//       '-------------------------------------------------------------------------------------------------'
//
// - menus are always <ul> tags; each <li> is a menu item
// - a main menu <li> must contain an <a> tag and may also contain a <ul> submenu
// - a submenu <li> must contain an <a> tag with a data-targetpanel attribute set
// - There is always a single selected main menu item
// - A main menu item may either link to another webpage, or have a submenu
// - Selecting a main menu item will show its submenu, if it has one
// - A submenu always has a single item selected
// - Clicking an inactive submenu item will show its panel
// - Clicking a selected submenu item will toggle its panel showing <-> hiding ((( NB: not yet implemented )))
// - A panel initially shows its first page
// - Switching pages in a panel changes the panel height to suit its current page
// - A panel is a HTML block element with the class .mspp-panel (can be overridden via option)
// - If a panel contains pages, one page should have the class .current (can be overridden via option)
// - A page is a HTML block element with the class .mspp-page (can be overridden via option)
// - <button> or <a> tags in pages that have a data-targetpage attribute set will switch to the indicated page
//
//
// The HTML should look like this:
//
//  <ul class="menu">                   <!-- this is the main menu -->
//      <li class="current">            <!-- this is a main menu item, currently selected -->
//          <a>First Item</a>           <!-- the first item in the main menu -->
//          <ul>                        <!-- a submenu in the first main menu item -->
//              <li class="current">    <!-- the currently selected submenu item -->
//                                      <!-- .paneltrigger and the data-panelid attribute are required -->
//                  <a data-targetpanel="panel1">do the panel1 thing</a>
//              </li>
//              <li>...</li>            <!-- another submenu item -->
//          </ul>
//      </li>
//      <li> <a href="another_page.html">another page</a> </li>
//      <li> <a>whatever</a> </li>
//  </ul>
//
//  <div id="panel1" class="mspp-panel">
//      <div id="page11" class="mspp-page current">
//          This is the current page on panel 1.
//          <button type="button" data-targetpage="page12">show page 2</button>
//      </div>
//      <div id="page12" class="mspp-page">
//          This is the other page on panel 1.
//          <a data-targetpage="page11">see the first page again</a>
//      </div>
//  </div>
//  <div id="panel2" class="mspp-panel">
//      <div id="page21" class="mspp-page current">
//          This is the current page on panel 2.
//          <button type="button" data-targetpage="page22">show page 2</button>
//      </div>
//      <div id="page22" class="mspp-page">
//          This is the other page on panel 2.
//          <a data-targetpage="page21">see the first page again</a>
//      </div>
//  </div>


;( function($, window, document, undefined) {

    // namespace climas, widget name mspp
    // second arg is used as the widget's "prototype" object
    $.widget( "climas.mspp" , {

        //Options to be used as defaults
        options: {
            animationFactor: 2,

            mainMenuClass: 'mspp-main-menu',

            panelClass: 'mspp-panel',
            pageClass: 'mspp-page',

            clearfixClass: 'mspp-clearfix',
            activeClass: 'current'
        },
        // ----------------------------------------------------------
        //Setup widget (eg. element creation, apply theming
        // , bind events etc.)
        _create: function() {

            var base = this;
            var opts = this.options;

            // populate some convenience variables
            var $menu = this.element;
            this.mainMenuItems = $menu.children('li');
            this.panels = $('.' + opts.panelClass);

            // disappear while we sort things out
            $menu.css({ opacity: 0 });
            this.panels.css({ opacity: 0 });

            // make some DOM mods
            $menu.addClass(opts.mainMenuClass);
            $menu.addClass(opts.clearfixClass);
            this.panels.addClass(opts.clearfixClass);

            // layout the menu
            this._layoutMenu();

            // layout the panels
            this._layoutPanels();

            // hook up click handling etc
            $menu.on('msppshowmenu', this._showMenu);
            $menu.on('msppshowsubmenu', this._showSubMenu);
            $menu.on('msppshowpanel', this._showPanel);
            $menu.on('msppshowpage', this._showPage);

            // attach handlers to the menu-triggers
            this.mainMenuItems.each( function(index, item) {
                // the li menu item has a child a that is it's trigger
                $(item).children('a').click( function(event) {
                    base._trigger('showmenu', event, {
                        menuitem: item,
                        widget: base
                    });
                });
                // attach handlers to the submenu items
                $(item).find('li').each( function(index, subMenuItem) {
                    $(subMenuItem).find('a').click( function(event) {
                        base._trigger('showsubmenu', event, {
                            menuitem: item,
                            submenuitem: subMenuItem,
                            widget: base
                        });
                    });
                });
            });

            // attach handlers to the panel triggers
            $menu.find('[data-targetpanel]').each( function(index, trigger) {
                var $trigger =$(trigger);
                $trigger.click( function(event) {
                    base._trigger('showpanel', event, {
                        panel: $('#' + $trigger.data('targetpanel')).first(),
                        widget: base
                    });
                });
            });

            // attach handlers to the page switchers
            this.panels.each( function(index, panel) {
                var $panel = $(panel);
                $panel.find('[data-targetpage]').click( function(event) {
                    base._trigger('showpage', event, {
                        panel: $panel,
                        page: $('#' + $(this).data('targetpage')),
                        widget: base
                    });
                });
            });

            // activate the current menus, panels etc
            var $currentMain = this.mainMenuItems.filter('.' + opts.activeClass);
            $currentMain.removeClass(opts.activeClass).children('a').click();

            // finally, fade back in
            $menu.animate({ opacity: 1 }, 'fast');

            // panels stay invisible
        },
        // ----------------------------------------------------------
        _switchClassOption: function(className, newClass) {
            var oldClass = this.options[className];
            if (oldClass !== newClass) {
                var group = this.element.find('.' + oldClass);
                this.options[className] = newClass;
                group.removeClass(oldClass);
                group.addClass(newClass);
            }
        },
        // ----------------------------------------------------------
        // Respond to any changes the user makes to the
        // option method
        _setOption: function(key, value) {
            switch (key) {
                case "mainMenuClass":
                case "clearfixClass":
                case "activeClass":
                    this._switchClassOption(key, value);
                    break;

                default:
                    this.options[key] = value;
                    break;
                // it's okay that there's no } here
            }
            // remember to call our super's _setOption method
            this._super( "_setOption", key, value );
        },
        // ----------------------------------------------------------
        // Destroy an instantiated plugin and clean up
        // modifications the widget has made to the DOM
        _destroy: function() {
            this.element.removeClass(this.options.mainMenuClass);
            this.element.removeClass(this.options.clearfixClass);
            this.panels.removeClass(this.options.clearfixClass);
        },
        // ----------------------------------------------------------
        // do the layout calculations
        _layoutMenu: function() {
            // go through each submenu and record its width
            this.element.find('ul').each( function(index, subMenu) {
                var $sm = $(subMenu);
                $sm.css({width: 'auto'});
                $sm.data('originalWidth', $sm.width());

                // leave each submenu hidden, with width 0
                $sm.css({ width: 0, display: 'none' });
            });
        },
        // ----------------------------------------------------------
        _showMenu: function(event, data) {
            var $item = $(data.menuitem);
            var base = data.widget;
            // $item is a clicked-on menu item..
            if ($item.hasClass(base.options.activeClass)) {
                // ??
            } else {
                base._hidePanels();
                base.mainMenuItems.removeClass(base.options.activeClass);
                var $newSubMenu = $item.find('ul');
                var $oldSubMenus = base.element.find('ul').not($newSubMenu);
                var newWidth = $newSubMenu.data('originalWidth');

                $oldSubMenus.animate({ width: 0 }, (50 * base.options.animationFactor), function() {
                    $oldSubMenus.css({ display: 'none' });
                });
                $item.addClass(base.options.activeClass);
                $newSubMenu
                    .css({display: 'block' })
                    .animate({ width: newWidth }, (125 * base.options.animationFactor), function() {
                        $newSubMenu.css({ width: 'auto' }).removeAttr('style');
                        base._trigger('menushown', event, { item: $item, widget: base });
                    })
                ;
                // if the new submenu has an active item, click it
                $newSubMenu.find('.' + base.options.activeClass + ' a').click();
            }
        },
        // ----------------------------------------------------------
        _showSubMenu: function(event, data) {
            // de-activeify all the submenu items
            $(data.menuitem).find('li').removeClass(data.widget.options.activeClass);
            // active-ify the one true submenu item
            $(data.submenuitem).addClass(data.widget.options.activeClass);
        },
        // ----------------------------------------------------------
        // do the layout calculations
        _layoutPanels: function() {

            var $pages = this.panels.find('.' + this.options.pageClass);

            // go through each page and record its height
            $pages.each( function(index, page) {
                var $page = $(page);
                $page.css({height: 'auto'});
                $page.data('originalHeight', $page.outerHeight());

                // leave each page hidden, with height 0
                $page.css({ height: 0, display: 'none' });
            });

            // go through each panel and hide it
            this.panels.each( function(index, panel) {
                var $panel = $(panel);
                $panel.css({ display: 'none' });
            });
        },
        // ----------------------------------------------------------
        _hidePanels: function() {
            this.panels.removeClass(this.options.activeClass).css({ display: 'none', height: 0 });
        },
        // ----------------------------------------------------------
        _showPanel: function(event, data) {
            var $panel = $(data.panel);
            var base = data.widget;
            // $panel is a panel to show..
            if ($panel.hasClass(base.options.activeClass)) {
                // ??
            } else {
                base._hidePanels();
                $panel.addClass(base.options.activeClass);
                $panel.css({ display: 'block', opacity: 1 });
                var $page = $($panel.find('.' + base.options.pageClass + '.' + base.options.activeClass));
                base._trigger('showpage', event, { panel: $panel, page: $page, widget: base });
            }
        },
        // ----------------------------------------------------------
        _showPage: function(event, data) {
            var base = data.widget;
            var $panel = $(data.panel);
            var $page = $(data.page);
            var newHeight = $page.data('originalHeight');

            // fix the panel's current height
            $panel.css({height: $panel.height() });

            // deal with the page currently being displayed
            var $oldPage = $panel.find('.' + base.options.pageClass + '.' + base.options.activeClass).not($page);
            if ($oldPage.length > 0) {
                $oldPage.data('originalHeight', $oldPage.outerHeight());
                $oldPage.removeClass(base.options.activeClass).fadeOut((50 * base.options.animationFactor), function() {
                    $oldPage.css({ height: 0 });
                });
            }

            // switch on the new page and grow the opanel to hold it
            $page.css({ height: 'auto' }).addClass(base.options.activeClass).fadeIn((100 * base.options.animationFactor), function() {
                $page.removeAttr('style');
            });
            var animTime = ($oldPage.length > 0 ? (100 * base.options.animationFactor) : (150 * base.options.animationFactor)); // animate faster if it's switching pages
            $panel.animate({ height: newHeight }, animTime, function() {
                $panel.removeAttr('style');
            });

        },
        // ----------------------------------------------------------
        _: null // no following comma
    });

})(jQuery, window, document);













},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9wdnJkd2IvcHJvamVjdHMvY2xpbWFzLWdsb2JhbC93ZWJhcHAvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi9Vc2Vycy9wdnJkd2IvcHJvamVjdHMvY2xpbWFzLWdsb2JhbC93ZWJhcHAvY2xpbWFzbmcvc3JjL2pzL2Zha2VfNDVhNTRjNjMuanMiLCIvVXNlcnMvcHZyZHdiL3Byb2plY3RzL2NsaW1hcy1nbG9iYWwvd2ViYXBwL2NsaW1hc25nL3NyYy9qcy9tYXB2aWV3L21haW4uanMiLCIvVXNlcnMvcHZyZHdiL3Byb2plY3RzL2NsaW1hcy1nbG9iYWwvd2ViYXBwL2NsaW1hc25nL3NyYy9qcy9tYXB2aWV3L21vZGVscy9tYXBsYXllci5qcyIsIi9Vc2Vycy9wdnJkd2IvcHJvamVjdHMvY2xpbWFzLWdsb2JhbC93ZWJhcHAvY2xpbWFzbmcvc3JjL2pzL21hcHZpZXcvdXRpbC9zaGltcy5qcyIsIi9Vc2Vycy9wdnJkd2IvcHJvamVjdHMvY2xpbWFzLWdsb2JhbC93ZWJhcHAvY2xpbWFzbmcvc3JjL2pzL21hcHZpZXcvdmlld3MvYXBwLmpzIiwiL1VzZXJzL3B2cmR3Yi9wcm9qZWN0cy9jbGltYXMtZ2xvYmFsL3dlYmFwcC9jbGltYXNuZy9zcmMvanMvbWVudXNhbmRwYW5lbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3aEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlxucmVxdWlyZSgnLi9tYXB2aWV3L21haW4nKTtcbnJlcXVpcmUoJy4vbWVudXNhbmRwYW5lbHMnKTtcblxuJChmdW5jdGlvbigpIHtcbiAgICAvLyAkKCdoZWFkZXInKS5kaXNhYmxlU2VsZWN0aW9uKCk7IC8vIHVucG9wdWxhciBidXQgc3RpbGwgYmV0dGVyXG4gICAgJCgnbmF2ID4gdWwnKS5tc3BwKHt9KTtcbn0pO1xuIiwiKGZ1bmN0aW9uKCkge1xuICB2YXIgQXBwVmlldztcblxuICBpZiAoIXdpbmRvdy5jb25zb2xlKSB7XG4gICAgd2luZG93LmNvbnNvbGUgPSB7XG4gICAgICBsb2c6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4ge307XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIEFwcFZpZXcgPSByZXF1aXJlKCcuL3ZpZXdzL2FwcCcpO1xuXG4gICQoZnVuY3Rpb24oKSB7XG4gICAgdmFyIGFwcHZpZXc7XG4gICAgYXBwdmlldyA9IG5ldyBBcHBWaWV3KCk7XG4gICAgcmV0dXJuIGFwcHZpZXcucmVuZGVyKCk7XG4gIH0pO1xuXG59KS5jYWxsKHRoaXMpO1xuIiwiKGZ1bmN0aW9uKCkge1xuICB2YXIgTWFwTGF5ZXI7XG5cbiAgTWFwTGF5ZXIgPSBCYWNrYm9uZS5Nb2RlbC5leHRlbmQoe1xuICAgIGNvbnN0cnVjdG9yOiBmdW5jdGlvbihzaG9ydE5hbWUsIGxvbmdOYW1lLCBwYXRoKSB7XG4gICAgICB0aGlzLnNob3J0TmFtZSA9IHNob3J0TmFtZTtcbiAgICAgIHRoaXMubG9uZ05hbWUgPSBsb25nTmFtZTtcbiAgICAgIHRoaXMucGF0aCA9IHBhdGg7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH0pO1xuXG4gIG1vZHVsZS5leHBvcnRzID0gTWFwTGF5ZXI7XG5cbn0pLmNhbGwodGhpcyk7XG4iLCIoZnVuY3Rpb24oKSB7XG4gIHZhciBfX2luZGV4T2YgPSBbXS5pbmRleE9mIHx8IGZ1bmN0aW9uKGl0ZW0pIHsgZm9yICh2YXIgaSA9IDAsIGwgPSB0aGlzLmxlbmd0aDsgaSA8IGw7IGkrKykgeyBpZiAoaSBpbiB0aGlzICYmIHRoaXNbaV0gPT09IGl0ZW0pIHJldHVybiBpOyB9IHJldHVybiAtMTsgfTtcblxuICBpZiAoIUFycmF5LnByb3RvdHlwZS5mb3JFYWNoKSB7XG4gICAgQXJyYXkucHJvdG90eXBlLmZvckVhY2ggPSBmdW5jdGlvbihmbiwgc2NvcGUpIHtcbiAgICAgIHZhciBpLCBfaSwgX3JlZiwgX3Jlc3VsdHM7XG4gICAgICBfcmVzdWx0cyA9IFtdO1xuICAgICAgZm9yIChpID0gX2kgPSAwLCBfcmVmID0gdGhpcy5sZW5ndGg7IDAgPD0gX3JlZiA/IF9pIDw9IF9yZWYgOiBfaSA+PSBfcmVmOyBpID0gMCA8PSBfcmVmID8gKytfaSA6IC0tX2kpIHtcbiAgICAgICAgX3Jlc3VsdHMucHVzaChfX2luZGV4T2YuY2FsbCh0aGlzLCBpKSA+PSAwID8gZm4uY2FsbChzY29wZSwgdGhpc1tpXSwgaSwgdGhpcykgOiB2b2lkIDApO1xuICAgICAgfVxuICAgICAgcmV0dXJuIF9yZXN1bHRzO1xuICAgIH07XG4gIH1cblxuICBpZiAoIUFycmF5LnByb3RvdHlwZS5pbmRleE9mKSB7XG4gICAgQXJyYXkucHJvdG90eXBlLmluZGV4T2YgPSBmdW5jdGlvbihuZWVkbGUpIHtcbiAgICAgIHZhciBpLCBfaSwgX3JlZjtcbiAgICAgIGZvciAoaSA9IF9pID0gMCwgX3JlZiA9IHRoaXMubGVuZ3RoOyAwIDw9IF9yZWYgPyBfaSA8PSBfcmVmIDogX2kgPj0gX3JlZjsgaSA9IDAgPD0gX3JlZiA/ICsrX2kgOiAtLV9pKSB7XG4gICAgICAgIGlmICh0aGlzW2ldID09PSBuZWVkbGUpIHtcbiAgICAgICAgICByZXR1cm4gaTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIC0xO1xuICAgIH07XG4gIH1cblxufSkuY2FsbCh0aGlzKTtcbiIsIihmdW5jdGlvbigpIHtcbiAgdmFyIEFwcFZpZXcsIE1hcExheWVyLCBkZWJ1ZyxcbiAgICBfX2luZGV4T2YgPSBbXS5pbmRleE9mIHx8IGZ1bmN0aW9uKGl0ZW0pIHsgZm9yICh2YXIgaSA9IDAsIGwgPSB0aGlzLmxlbmd0aDsgaSA8IGw7IGkrKykgeyBpZiAoaSBpbiB0aGlzICYmIHRoaXNbaV0gPT09IGl0ZW0pIHJldHVybiBpOyB9IHJldHVybiAtMTsgfTtcblxuICBNYXBMYXllciA9IHJlcXVpcmUoJy4uL21vZGVscy9tYXBsYXllcicpO1xuXG4gIHJlcXVpcmUoJy4uL3V0aWwvc2hpbXMnKTtcblxuXG4gIC8qIGpzaGludCAtVzA5MyAqL1xuXG4gIGRlYnVnID0gZnVuY3Rpb24oaXRlbVRvTG9nLCBpdGVtTGV2ZWwpIHtcbiAgICB2YXIgbGV2ZWxzLCBtZXNzYWdlTnVtLCB0aHJlc2hvbGQsIHRocmVzaG9sZE51bTtcbiAgICBsZXZlbHMgPSBbJ3ZlcnlkZWJ1ZycsICdkZWJ1ZycsICdtZXNzYWdlJywgJ3dhcm5pbmcnXTtcbiAgICB0aHJlc2hvbGQgPSAnbWVzc2FnZSc7XG4gICAgaWYgKCFpdGVtTGV2ZWwpIHtcbiAgICAgIGl0ZW1MZXZlbCA9ICdkZWJ1Zyc7XG4gICAgfVxuICAgIHRocmVzaG9sZE51bSA9IGxldmVscy5pbmRleE9mKHRocmVzaG9sZCk7XG4gICAgbWVzc2FnZU51bSA9IGxldmVscy5pbmRleE9mKGl0ZW1MZXZlbCk7XG4gICAgaWYgKHRocmVzaG9sZE51bSA+IG1lc3NhZ2VOdW0pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKGl0ZW1Ub0xvZyArICcnID09PSBpdGVtVG9Mb2cpIHtcbiAgICAgIHJldHVybiBjb25zb2xlLmxvZyhcIltcIiArIGl0ZW1MZXZlbCArIFwiXSBcIiArIGl0ZW1Ub0xvZyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBjb25zb2xlLmxvZyhpdGVtVG9Mb2cpO1xuICAgIH1cbiAgfTtcblxuICBBcHBWaWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xuICAgIHRhZ05hbWU6ICdkaXYnLFxuICAgIGNsYXNzTmFtZTogJ3NwbGl0bWFwIHNob3dmb3JtcycsXG4gICAgaWQ6ICdzcGxpdG1hcCcsXG4gICAgc3BlY2llc0RhdGFVcmw6IHdpbmRvdy5tYXBDb25maWcuc3BlY2llc0RhdGFVcmwsXG4gICAgYmlvZGl2RGF0YVVybDogd2luZG93Lm1hcENvbmZpZy5iaW9kaXZEYXRhVXJsLFxuICAgIHJhc3RlckFwaVVybDogd2luZG93Lm1hcENvbmZpZy5yYXN0ZXJBcGlVcmwsXG4gICAgdHJhY2tTcGxpdHRlcjogZmFsc2UsXG4gICAgdHJhY2tQZXJpb2Q6IDEwMCxcbiAgICBldmVudHM6IHtcbiAgICAgICdjbGljayAuYnRuLWNoYW5nZSc6ICd0b2dnbGVGb3JtcycsXG4gICAgICAnY2xpY2sgLmJ0bi1jb21wYXJlJzogJ3RvZ2dsZVNwbGl0dGVyJyxcbiAgICAgICdjbGljayAuYnRuLWNvcHkubGVmdC12YWxpZC1tYXAnOiAnY29weU1hcExlZnRUb1JpZ2h0JyxcbiAgICAgICdjbGljayAuYnRuLWNvcHkucmlnaHQtdmFsaWQtbWFwJzogJ2NvcHlNYXBSaWdodFRvTGVmdCcsXG4gICAgICAnbGVmdG1hcHVwZGF0ZSc6ICdsZWZ0U2lkZVVwZGF0ZScsXG4gICAgICAncmlnaHRtYXB1cGRhdGUnOiAncmlnaHRTaWRlVXBkYXRlJyxcbiAgICAgICdjaGFuZ2Ugc2VsZWN0LmxlZnQnOiAnbGVmdFNpZGVVcGRhdGUnLFxuICAgICAgJ2NoYW5nZSBzZWxlY3QucmlnaHQnOiAncmlnaHRTaWRlVXBkYXRlJyxcbiAgICAgICdjaGFuZ2UgaW5wdXQubGVmdCc6ICdsZWZ0U2lkZVVwZGF0ZScsXG4gICAgICAnY2hhbmdlIGlucHV0LnJpZ2h0JzogJ3JpZ2h0U2lkZVVwZGF0ZSdcbiAgICB9LFxuICAgIHRpY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKGZhbHNlKSB7XG4gICAgICAgIGRlYnVnKHRoaXMubGVmdEluZm8uc2NlbmFyaW8pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZGVidWcoJ3RpY2snKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBzZXRUaW1lb3V0KHRoaXMudGljaywgMTAwMCk7XG4gICAgfSxcbiAgICBpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LmluaXRpYWxpemUnKTtcbiAgICAgIF8uYmluZEFsbC5hcHBseShfLCBbdGhpc10uY29uY2F0KF8uZnVuY3Rpb25zKHRoaXMpKSk7XG4gICAgICB0aGlzLm5hbWVzTGlzdCA9IFtdO1xuICAgICAgdGhpcy5zcGVjaWVzU2NpTmFtZUxpc3QgPSBbXTtcbiAgICAgIHRoaXMuc3BlY2llc0luZm9GZXRjaFByb2Nlc3MgPSB0aGlzLmZldGNoU3BlY2llc0luZm8oKTtcbiAgICAgIHRoaXMuYmlvZGl2TGlzdCA9IFtdO1xuICAgICAgcmV0dXJuIHRoaXMuYmlvZGl2SW5mb0ZldGNoUHJvY2VzcyA9IHRoaXMuZmV0Y2hCaW9kaXZJbmZvKCk7XG4gICAgfSxcbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgZGVidWcoJ0FwcFZpZXcucmVuZGVyJyk7XG4gICAgICB0aGlzLiRlbC5hcHBlbmQoQXBwVmlldy50ZW1wbGF0ZXMubGF5b3V0KHtcbiAgICAgICAgbGVmdFRhZzogQXBwVmlldy50ZW1wbGF0ZXMubGVmdFRhZygpLFxuICAgICAgICByaWdodFRhZzogQXBwVmlldy50ZW1wbGF0ZXMucmlnaHRUYWcoKSxcbiAgICAgICAgbGVmdEZvcm06IEFwcFZpZXcudGVtcGxhdGVzLmxlZnRGb3JtKCksXG4gICAgICAgIHJpZ2h0Rm9ybTogQXBwVmlldy50ZW1wbGF0ZXMucmlnaHRGb3JtKClcbiAgICAgIH0pKTtcbiAgICAgICQoJyNjb250ZW50d3JhcCcpLmFwcGVuZCh0aGlzLiRlbCk7XG4gICAgICB0aGlzLm1hcCA9IEwubWFwKCdtYXAnLCB7XG4gICAgICAgIGNlbnRlcjogWzAsIDBdLFxuICAgICAgICB6b29tOiAzXG4gICAgICB9KTtcbiAgICAgIHRoaXMubWFwLm9uKCdtb3ZlJywgdGhpcy5yZXNpemVUaGluZ3MpO1xuICAgICAgTC50aWxlTGF5ZXIoJ2h0dHA6Ly97c30ue2Jhc2V9Lm1hcHMuY2l0LmFwaS5oZXJlLmNvbS9tYXB0aWxlLzIuMS97dHlwZX0ve21hcElEfS97c2NoZW1lfS97en0ve3h9L3t5fS97c2l6ZX0ve2Zvcm1hdH0/YXBwX2lkPXthcHBfaWR9JmFwcF9jb2RlPXthcHBfY29kZX0mbGc9e2xhbmd1YWdlfScsIHtcbiAgICAgICAgYXR0cmlidXRpb246ICdNYXAgJmNvcHk7IDIwMTYgPGEgaHJlZj1cImh0dHA6Ly9kZXZlbG9wZXIuaGVyZS5jb21cIj5IRVJFPC9hPicsXG4gICAgICAgIHN1YmRvbWFpbnM6ICcxMjM0JyxcbiAgICAgICAgYmFzZTogJ2FlcmlhbCcsXG4gICAgICAgIHR5cGU6ICdtYXB0aWxlJyxcbiAgICAgICAgc2NoZW1lOiAndGVycmFpbi5kYXknLFxuICAgICAgICBhcHBfaWQ6ICdsMlJ5ZTZ6d3EzdTJjSFpwVklQTycsXG4gICAgICAgIGFwcF9jb2RlOiAnTXBYU2xOTGNMU1FJcGRVNlhIQjBUUScsXG4gICAgICAgIG1hcElEOiAnbmV3ZXN0JyxcbiAgICAgICAgbWF4Wm9vbTogMTgsXG4gICAgICAgIGxhbmd1YWdlOiAnZW5nJyxcbiAgICAgICAgZm9ybWF0OiAncG5nOCcsXG4gICAgICAgIHNpemU6ICcyNTYnXG4gICAgICB9KS5hZGRUbyh0aGlzLm1hcCk7XG4gICAgICB0aGlzLmxlZnRGb3JtID0gdGhpcy4kKCcubGVmdC5mb3JtJyk7XG4gICAgICB0aGlzLmJ1aWxkTGVmdEZvcm0oKTtcbiAgICAgIHRoaXMucmlnaHRGb3JtID0gdGhpcy4kKCcucmlnaHQuZm9ybScpO1xuICAgICAgdGhpcy5idWlsZFJpZ2h0Rm9ybSgpO1xuICAgICAgdGhpcy5sZWZ0VGFnID0gdGhpcy4kKCcubGVmdC50YWcnKTtcbiAgICAgIHRoaXMucmlnaHRUYWcgPSB0aGlzLiQoJy5yaWdodC50YWcnKTtcbiAgICAgIHRoaXMuc3BsaXRMaW5lID0gdGhpcy4kKCcuc3BsaXRsaW5lJyk7XG4gICAgICB0aGlzLnNwbGl0VGh1bWIgPSB0aGlzLiQoJy5zcGxpdHRodW1iJyk7XG4gICAgICB0aGlzLmxlZnRTaWRlVXBkYXRlKCk7XG4gICAgICByZXR1cm4gdGhpcy5yaWdodFNpZGVVcGRhdGUoKTtcbiAgICB9LFxuICAgIHJlc29sdmVQbGFjZWhvbGRlcnM6IGZ1bmN0aW9uKHN0cldpdGhQbGFjZWhvbGRlcnMsIHJlcGxhY2VtZW50cykge1xuICAgICAgdmFyIGFucywga2V5LCByZSwgdmFsdWU7XG4gICAgICBhbnMgPSBzdHJXaXRoUGxhY2Vob2xkZXJzO1xuICAgICAgYW5zID0gYW5zLnJlcGxhY2UoL1xce1xce1xccypsb2NhdGlvbi5wcm90b2NvbFxccypcXH1cXH0vZywgbG9jYXRpb24ucHJvdG9jb2wpO1xuICAgICAgYW5zID0gYW5zLnJlcGxhY2UoL1xce1xce1xccypsb2NhdGlvbi5ob3N0XFxzKlxcfVxcfS9nLCBsb2NhdGlvbi5ob3N0KTtcbiAgICAgIGFucyA9IGFucy5yZXBsYWNlKC9cXHtcXHtcXHMqbG9jYXRpb24uaG9zdG5hbWVcXHMqXFx9XFx9L2csIGxvY2F0aW9uLmhvc3RuYW1lKTtcbiAgICAgIGZvciAoa2V5IGluIHJlcGxhY2VtZW50cykge1xuICAgICAgICB2YWx1ZSA9IHJlcGxhY2VtZW50c1trZXldO1xuICAgICAgICByZSA9IG5ldyBSZWdFeHAoXCJcXFxce1xcXFx7XFxcXHMqXCIgKyBrZXkgKyBcIlxcXFxzKlxcXFx9XFxcXH1cIiwgXCJnXCIpO1xuICAgICAgICBhbnMgPSBhbnMucmVwbGFjZShyZSwgdmFsdWUpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGFucztcbiAgICB9LFxuICAgIGNvcHlNYXBMZWZ0VG9SaWdodDogZnVuY3Rpb24oKSB7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5jb3B5TWFwTGVmdFRvUmlnaHQnKTtcbiAgICAgIGlmICghdGhpcy5sZWZ0SW5mbykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB0aGlzLiQoJyNyaWdodG1hcHNwcCcpLnZhbCh0aGlzLmxlZnRJbmZvLnNwZWNpZXNOYW1lKTtcbiAgICAgIHRoaXMuJCgnI3JpZ2h0bWFweWVhcicpLnZhbCh0aGlzLmxlZnRJbmZvLnllYXIpO1xuICAgICAgdGhpcy4kKCdpbnB1dFtuYW1lPXJpZ2h0bWFwc2NlbmFyaW9dJykuZWFjaCgoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGluZGV4LCBpdGVtKSB7XG4gICAgICAgICAgcmV0dXJuICQoaXRlbSkucHJvcCgnY2hlY2tlZCcsICQoaXRlbSkudmFsKCkgPT09IF90aGlzLmxlZnRJbmZvLnNjZW5hcmlvKTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKTtcbiAgICAgIHRoaXMuJCgnI3JpZ2h0bWFwZ2NtJykudmFsKHRoaXMubGVmdEluZm8uZ2NtKTtcbiAgICAgIHJldHVybiB0aGlzLnJpZ2h0U2lkZVVwZGF0ZSgpO1xuICAgIH0sXG4gICAgY29weU1hcFJpZ2h0VG9MZWZ0OiBmdW5jdGlvbigpIHtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LmNvcHlNYXBSaWdodFRvTGVmdCcpO1xuICAgICAgaWYgKCF0aGlzLnJpZ2h0SW5mbykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB0aGlzLiQoJyNsZWZ0bWFwc3BwJykudmFsKHRoaXMucmlnaHRJbmZvLnNwZWNpZXNOYW1lKTtcbiAgICAgIHRoaXMuJCgnI2xlZnRtYXB5ZWFyJykudmFsKHRoaXMucmlnaHRJbmZvLnllYXIpO1xuICAgICAgdGhpcy4kKCdpbnB1dFtuYW1lPWxlZnRtYXBzY2VuYXJpb10nKS5lYWNoKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oaW5kZXgsIGl0ZW0pIHtcbiAgICAgICAgICByZXR1cm4gJChpdGVtKS5wcm9wKCdjaGVja2VkJywgJChpdGVtKS52YWwoKSA9PT0gX3RoaXMucmlnaHRJbmZvLnNjZW5hcmlvKTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKTtcbiAgICAgIHRoaXMuJCgnI2xlZnRtYXBnY20nKS52YWwodGhpcy5yaWdodEluZm8uZ2NtKTtcbiAgICAgIHJldHVybiB0aGlzLmxlZnRTaWRlVXBkYXRlKCk7XG4gICAgfSxcbiAgICBzaWRlVXBkYXRlOiBmdW5jdGlvbihzaWRlKSB7XG4gICAgICB2YXIgYXRCYXNlbGluZSwgY3VyckluZm8sIG1hcFZhbGlkUXVlcnksIG5ld0luZm8sIF9yZWY7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5zaWRlVXBkYXRlICgnICsgc2lkZSArICcpJyk7XG4gICAgICBuZXdJbmZvID0ge1xuICAgICAgICBzcGVjaWVzTmFtZTogdGhpcy4kKCcjJyArIHNpZGUgKyAnbWFwc3BwJykudmFsKCksXG4gICAgICAgIHllYXI6IHRoaXMuJCgnIycgKyBzaWRlICsgJ21hcHllYXInKS52YWwoKSxcbiAgICAgICAgc2NlbmFyaW86IHRoaXMuJCgnaW5wdXRbbmFtZT0nICsgc2lkZSArICdtYXBzY2VuYXJpb106Y2hlY2tlZCcpLnZhbCgpLFxuICAgICAgICBnY206IHRoaXMuJCgnIycgKyBzaWRlICsgJ21hcGdjbScpLnZhbCgpXG4gICAgICB9O1xuICAgICAgYXRCYXNlbGluZSA9IG5ld0luZm8ueWVhciA9PT0gJ2Jhc2VsaW5lJztcbiAgICAgIHRoaXMuJCgnaW5wdXRbbmFtZT0nICsgc2lkZSArICdtYXBzY2VuYXJpb10sICMnICsgc2lkZSArICdtYXBnY20nKS5wcm9wKCdkaXNhYmxlZCcsIGF0QmFzZWxpbmUpO1xuICAgICAgdGhpcy4kKCcuJyArIHNpZGUgKyAnLnNpZGUuZm9ybSBmaWVsZHNldCcpLnJlbW92ZUNsYXNzKCdkaXNhYmxlZCcpO1xuICAgICAgdGhpcy4kKCdpbnB1dFtuYW1lPScgKyBzaWRlICsgJ21hcHNjZW5hcmlvXTpkaXNhYmxlZCwgIycgKyBzaWRlICsgJ21hcGdjbTpkaXNhYmxlZCcpLmNsb3Nlc3QoJ2ZpZWxkc2V0JykuYWRkQ2xhc3MoJ2Rpc2FibGVkJyk7XG4gICAgICBtYXBWYWxpZFF1ZXJ5ID0gJy4nICsgc2lkZSArICctdmFsaWQtbWFwJztcbiAgICAgIGlmIChfcmVmID0gbmV3SW5mby5zcGVjaWVzTmFtZSwgX19pbmRleE9mLmNhbGwodGhpcy5uYW1lc0xpc3QsIF9yZWYpID49IDApIHtcbiAgICAgICAgdGhpcy4kKG1hcFZhbGlkUXVlcnkpLnJlbW92ZUNsYXNzKCdkaXNhYmxlZCcpLnByb3AoJ2Rpc2FibGVkJywgZmFsc2UpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy4kKG1hcFZhbGlkUXVlcnkpLmFkZENsYXNzKCdkaXNhYmxlZCcpLnByb3AoJ2Rpc2FibGVkJywgdHJ1ZSk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIGN1cnJJbmZvID0gc2lkZSA9PT0gJ2xlZnQnID8gdGhpcy5sZWZ0SW5mbyA6IHRoaXMucmlnaHRJbmZvO1xuICAgICAgaWYgKGN1cnJJbmZvICYmIF8uaXNFcXVhbChuZXdJbmZvLCBjdXJySW5mbykpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgaWYgKGN1cnJJbmZvICYmIG5ld0luZm8uc3BlY2llc05hbWUgPT09IGN1cnJJbmZvLnNwZWNpZXNOYW1lICYmIG5ld0luZm8ueWVhciA9PT0gY3VyckluZm8ueWVhciAmJiBuZXdJbmZvLnllYXIgPT09ICdiYXNlbGluZScpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgaWYgKHNpZGUgPT09ICdsZWZ0Jykge1xuICAgICAgICB0aGlzLmxlZnRJbmZvID0gbmV3SW5mbztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMucmlnaHRJbmZvID0gbmV3SW5mbztcbiAgICAgIH1cbiAgICAgIHRoaXMuYWRkTWFwTGF5ZXIoc2lkZSk7XG4gICAgICByZXR1cm4gdGhpcy5hZGRNYXBUYWcoc2lkZSk7XG4gICAgfSxcbiAgICBsZWZ0U2lkZVVwZGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5zaWRlVXBkYXRlKCdsZWZ0Jyk7XG4gICAgfSxcbiAgICByaWdodFNpZGVVcGRhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuc2lkZVVwZGF0ZSgncmlnaHQnKTtcbiAgICB9LFxuICAgIGFkZE1hcFRhZzogZnVuY3Rpb24oc2lkZSkge1xuICAgICAgdmFyIGluZm8sIHRhZztcbiAgICAgIGRlYnVnKCdBcHBWaWV3LmFkZE1hcFRhZycpO1xuICAgICAgaWYgKHNpZGUgPT09ICdsZWZ0Jykge1xuICAgICAgICBpbmZvID0gdGhpcy5sZWZ0SW5mbztcbiAgICAgIH1cbiAgICAgIGlmIChzaWRlID09PSAncmlnaHQnKSB7XG4gICAgICAgIGluZm8gPSB0aGlzLnJpZ2h0SW5mbztcbiAgICAgIH1cbiAgICAgIHRhZyA9IFwiPGI+PGk+XCIgKyBpbmZvLnNwZWNpZXNOYW1lICsgXCI8L2k+PC9iPlwiO1xuICAgICAgaWYgKGluZm8ueWVhciA9PT0gJ2Jhc2VsaW5lJykge1xuICAgICAgICB0YWcgPSBcImN1cnJlbnQgXCIgKyB0YWcgKyBcIiBkaXN0cmlidXRpb25cIjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRhZyA9IFwiPGI+XCIgKyBpbmZvLmdjbSArIFwiPC9iPiBwZXJjZW50aWxlIHByb2plY3Rpb25zIGZvciBcIiArIHRhZyArIFwiIGluIDxiPlwiICsgaW5mby55ZWFyICsgXCI8L2I+IGlmIDxiPlwiICsgaW5mby5zY2VuYXJpbyArIFwiPC9iPlwiO1xuICAgICAgfVxuICAgICAgaWYgKHNpZGUgPT09ICdsZWZ0Jykge1xuICAgICAgICB0aGlzLmxlZnRUYWcuZmluZCgnLmxlZnRsYXllcm5hbWUnKS5odG1sKHRhZyk7XG4gICAgICB9XG4gICAgICBpZiAoc2lkZSA9PT0gJ3JpZ2h0Jykge1xuICAgICAgICByZXR1cm4gdGhpcy5yaWdodFRhZy5maW5kKCcucmlnaHRsYXllcm5hbWUnKS5odG1sKHRhZyk7XG4gICAgICB9XG4gICAgfSxcbiAgICBhZGRNYXBMYXllcjogZnVuY3Rpb24oc2lkZSkge1xuICAgICAgdmFyIGZ1dHVyZU1vZGVsUG9pbnQsIGlzQmlvZGl2ZXJzaXR5LCBsYXllciwgbG9hZENsYXNzLCBtYXBVcmwsIHNpZGVJbmZvLCBzcHBGaWxlTmFtZSwgdmFsLCB6aXBVcmwsIF9yZWY7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5hZGRNYXBMYXllcicpO1xuICAgICAgaWYgKHNpZGUgPT09ICdsZWZ0Jykge1xuICAgICAgICBzaWRlSW5mbyA9IHRoaXMubGVmdEluZm87XG4gICAgICB9XG4gICAgICBpZiAoc2lkZSA9PT0gJ3JpZ2h0Jykge1xuICAgICAgICBzaWRlSW5mbyA9IHRoaXMucmlnaHRJbmZvO1xuICAgICAgfVxuICAgICAgaXNCaW9kaXZlcnNpdHkgPSAoX3JlZiA9IHNpZGVJbmZvLnNwZWNpZXNOYW1lLCBfX2luZGV4T2YuY2FsbCh0aGlzLmJpb2Rpdkxpc3QsIF9yZWYpID49IDApO1xuICAgICAgZnV0dXJlTW9kZWxQb2ludCA9ICcnO1xuICAgICAgbWFwVXJsID0gJyc7XG4gICAgICB6aXBVcmwgPSAnJztcbiAgICAgIGlmIChpc0Jpb2RpdmVyc2l0eSkge1xuICAgICAgICBmdXR1cmVNb2RlbFBvaW50ID0gWydiaW9kaXZlcnNpdHkvZGVjaWxlcy9iaW9kaXZlcnNpdHknLCBzaWRlSW5mby5zY2VuYXJpbywgc2lkZUluZm8ueWVhciwgc2lkZUluZm8uZ2NtXS5qb2luKCdfJyk7XG4gICAgICAgIGlmIChzaWRlSW5mby55ZWFyID09PSAnYmFzZWxpbmUnKSB7XG4gICAgICAgICAgZnV0dXJlTW9kZWxQb2ludCA9ICdiaW9kaXZlcnNpdHkvYmlvZGl2ZXJzaXR5X2N1cnJlbnQnO1xuICAgICAgICB9XG4gICAgICAgIG1hcFVybCA9IFtcbiAgICAgICAgICB0aGlzLnJlc29sdmVQbGFjZWhvbGRlcnModGhpcy5iaW9kaXZEYXRhVXJsLCB7XG4gICAgICAgICAgICBzcHBHcm91cDogc2lkZUluZm8uc3BlY2llc05hbWVcbiAgICAgICAgICB9KSwgZnV0dXJlTW9kZWxQb2ludCArICcudGlmJ1xuICAgICAgICBdLmpvaW4oJy8nKTtcbiAgICAgICAgemlwVXJsID0gW1xuICAgICAgICAgIHRoaXMucmVzb2x2ZVBsYWNlaG9sZGVycyh0aGlzLmJpb2RpdkRhdGFVcmwsIHtcbiAgICAgICAgICAgIHNwcEdyb3VwOiBzaWRlSW5mby5zcGVjaWVzTmFtZVxuICAgICAgICAgIH0pLCAnYmlvZGl2ZXJzaXR5Jywgc2lkZUluZm8uc3BlY2llc05hbWUgKyAnLnppcCdcbiAgICAgICAgXS5qb2luKCcvJyk7XG4gICAgICAgIHRoaXMuJCgnIycgKyBzaWRlICsgJ21hcGRsJykuYXR0cignaHJlZicsIG1hcFVybCk7XG4gICAgICAgIHRoaXMuJCgnIycgKyBzaWRlICsgJ2FyY2hpdmVkbCcpLmh0bWwoJ2Rvd25sb2FkIHRoaXMgYmlvZGl2ZXJzaXR5IGdyb3VwPGJyPih+MTAwTWIgemlwKScpO1xuICAgICAgICB0aGlzLiQoJyMnICsgc2lkZSArICdhcmNoaXZlZGwnKS5hdHRyKCdocmVmJywgemlwVXJsKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZ1dHVyZU1vZGVsUG9pbnQgPSBbJy9kaXNwZXJzYWwvZGVjaWxlcy8nICsgc2lkZUluZm8uc2NlbmFyaW8sIHNpZGVJbmZvLnllYXIsIHNpZGVJbmZvLmdjbV0uam9pbignXycpO1xuICAgICAgICBpZiAoc2lkZUluZm8ueWVhciA9PT0gJ2Jhc2VsaW5lJykge1xuICAgICAgICAgIGZ1dHVyZU1vZGVsUG9pbnQgPSAnL2N1cnJlbnQnO1xuICAgICAgICB9XG4gICAgICAgIHNwcEZpbGVOYW1lID0gc2lkZUluZm8uc3BlY2llc05hbWUucmVwbGFjZSgnICcsICdfJyk7XG4gICAgICAgIG1hcFVybCA9IFtcbiAgICAgICAgICB0aGlzLnJlc29sdmVQbGFjZWhvbGRlcnModGhpcy5zcGVjaWVzRGF0YVVybCwge1xuICAgICAgICAgICAgc3BwTmFtZTogc3BwRmlsZU5hbWUsXG4gICAgICAgICAgICBzcHBHcm91cDogdGhpcy5zcGVjaWVzR3JvdXBzW3NpZGVJbmZvLnNwZWNpZXNOYW1lXVxuICAgICAgICAgIH0pLCBmdXR1cmVNb2RlbFBvaW50ICsgJy50aWYnXG4gICAgICAgIF0uam9pbignLycpO1xuICAgICAgICB6aXBVcmwgPSBbXG4gICAgICAgICAgdGhpcy5yZXNvbHZlUGxhY2Vob2xkZXJzKHRoaXMuc3BlY2llc0RhdGFVcmwsIHtcbiAgICAgICAgICAgIHNwcE5hbWU6IHNwcEZpbGVOYW1lLFxuICAgICAgICAgICAgc3BwR3JvdXA6IHRoaXMuc3BlY2llc0dyb3Vwc1tzaWRlSW5mby5zcGVjaWVzTmFtZV1cbiAgICAgICAgICB9KSwgc3BwRmlsZU5hbWUgKyAnLnppcCdcbiAgICAgICAgXS5qb2luKCcvJyk7XG4gICAgICAgIHRoaXMuJCgnIycgKyBzaWRlICsgJ21hcGRsJykuYXR0cignaHJlZicsIG1hcFVybCk7XG4gICAgICAgIHRoaXMuJCgnIycgKyBzaWRlICsgJ2FyY2hpdmVkbCcpLmh0bWwoJ2Rvd25sb2FkIHRoaXMgc3BlY2llczxicj4ofjJHYiB6aXApJyk7XG4gICAgICAgIHRoaXMuJCgnIycgKyBzaWRlICsgJ2FyY2hpdmVkbCcpLmF0dHIoJ2hyZWYnLCB6aXBVcmwpO1xuICAgICAgfVxuICAgICAgbGF5ZXIgPSBMLnRpbGVMYXllci53bXModGhpcy5yZXNvbHZlUGxhY2Vob2xkZXJzKHRoaXMucmFzdGVyQXBpVXJsKSwge1xuICAgICAgICBEQVRBX1VSTDogbWFwVXJsLFxuICAgICAgICBsYXllcnM6ICdERUZBVUxUJyxcbiAgICAgICAgZm9ybWF0OiAnaW1hZ2UvcG5nJyxcbiAgICAgICAgdHJhbnNwYXJlbnQ6IHRydWVcbiAgICAgIH0pO1xuICAgICAgbG9hZENsYXNzID0gJycgKyBzaWRlICsgJ2xvYWRpbmcnO1xuICAgICAgbGF5ZXIub24oJ2xvYWRpbmcnLCAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiBfdGhpcy4kZWwuYWRkQ2xhc3MobG9hZENsYXNzKTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKTtcbiAgICAgIGxheWVyLm9uKCdsb2FkJywgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gX3RoaXMuJGVsLnJlbW92ZUNsYXNzKGxvYWRDbGFzcyk7XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKSk7XG4gICAgICBpZiAoc2lkZSA9PT0gJ2xlZnQnKSB7XG4gICAgICAgIGlmICh0aGlzLmxlZnRMYXllcikge1xuICAgICAgICAgIHRoaXMubWFwLnJlbW92ZUxheWVyKHRoaXMubGVmdExheWVyKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmxlZnRMYXllciA9IGxheWVyO1xuICAgICAgfVxuICAgICAgaWYgKHNpZGUgPT09ICdyaWdodCcpIHtcbiAgICAgICAgaWYgKHRoaXMucmlnaHRMYXllcikge1xuICAgICAgICAgIHRoaXMubWFwLnJlbW92ZUxheWVyKHRoaXMucmlnaHRMYXllcik7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5yaWdodExheWVyID0gbGF5ZXI7XG4gICAgICB9XG4gICAgICBsYXllci5hZGRUbyh0aGlzLm1hcCk7XG4gICAgICB0aGlzLnJlc2l6ZVRoaW5ncygpO1xuICAgICAgaWYgKGdhICYmIHR5cGVvZiBnYSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBpZiAoc2lkZUluZm8ueWVhciA9PT0gJ2Jhc2VsaW5lJykge1xuICAgICAgICAgIHZhbCA9IDE5OTA7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdmFsID0gcGFyc2VJbnQoc2lkZUluZm8ueWVhciwgMTApO1xuICAgICAgICB9XG4gICAgICAgIHZhbCA9IHZhbCArIHtcbiAgICAgICAgICAndGVudGgnOiAwLjEsXG4gICAgICAgICAgJ2ZpZnRpZXRoJzogMC41LFxuICAgICAgICAgICduaW5ldGlldGgnOiAwLjlcbiAgICAgICAgfVtzaWRlSW5mby5nY21dO1xuICAgICAgICByZXR1cm4gZ2EoJ3NlbmQnLCB7XG4gICAgICAgICAgJ2hpdFR5cGUnOiAnZXZlbnQnLFxuICAgICAgICAgICdldmVudENhdGVnb3J5JzogJ21hcHNob3cnLFxuICAgICAgICAgICdldmVudEFjdGlvbic6IHNpZGVJbmZvLnNwZWNpZXNOYW1lLFxuICAgICAgICAgICdldmVudExhYmVsJzogc2lkZUluZm8uc2NlbmFyaW8sXG4gICAgICAgICAgJ2V2ZW50VmFsdWUnOiB2YWxcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSxcbiAgICBjZW50cmVNYXA6IGZ1bmN0aW9uKHJlcGVhdGVkbHlGb3IpIHtcbiAgICAgIHZhciBsYXRlciwgcmVjZW50cmUsIF9pLCBfcmVzdWx0cztcbiAgICAgIGRlYnVnKCdBcHBWaWV3LmNlbnRyZU1hcCcpO1xuICAgICAgaWYgKCFyZXBlYXRlZGx5Rm9yKSB7XG4gICAgICAgIHJlcGVhdGVkbHlGb3IgPSA1MDA7XG4gICAgICB9XG4gICAgICByZWNlbnRyZSA9IChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgX3RoaXMubWFwLmludmFsaWRhdGVTaXplKGZhbHNlKTtcbiAgICAgICAgICByZXR1cm4gX3RoaXMucmVzaXplVGhpbmdzKCk7XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKTtcbiAgICAgIF9yZXN1bHRzID0gW107XG4gICAgICBmb3IgKGxhdGVyID0gX2kgPSAwOyBfaSA8PSByZXBlYXRlZGx5Rm9yOyBsYXRlciA9IF9pICs9IDI1KSB7XG4gICAgICAgIF9yZXN1bHRzLnB1c2goc2V0VGltZW91dChyZWNlbnRyZSwgbGF0ZXIpKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBfcmVzdWx0cztcbiAgICB9LFxuICAgIHRvZ2dsZUZvcm1zOiBmdW5jdGlvbigpIHtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LnRvZ2dsZUZvcm1zJyk7XG4gICAgICB0aGlzLiRlbC50b2dnbGVDbGFzcygnc2hvd2Zvcm1zJyk7XG4gICAgICByZXR1cm4gdGhpcy5jZW50cmVNYXAoKTtcbiAgICB9LFxuICAgIHRvZ2dsZVNwbGl0dGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LnRvZ2dsZVNwbGl0dGVyJyk7XG4gICAgICB0aGlzLiRlbC50b2dnbGVDbGFzcygnc3BsaXQnKTtcbiAgICAgIGlmICh0aGlzLiRlbC5oYXNDbGFzcygnc3BsaXQnKSkge1xuICAgICAgICB0aGlzLmFjdGl2YXRlU3BsaXR0ZXIoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuZGVhY3RpdmF0ZVNwbGl0dGVyKCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5jZW50cmVNYXAoKTtcbiAgICB9LFxuICAgIGZldGNoU3BlY2llc0luZm86IGZ1bmN0aW9uKCkge1xuICAgICAgZGVidWcoJ0FwcFZpZXcuZmV0Y2hTcGVjaWVzSW5mbycpO1xuICAgICAgcmV0dXJuICQuYWpheCh7XG4gICAgICAgIHVybDogJy9kYXRhL3NwZWNpZXMnLFxuICAgICAgICBkYXRhVHlwZTogJ2pzb24nXG4gICAgICB9KS5kb25lKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgIHZhciBjb21tb25OYW1lV3JpdGVyLCBzcGVjaWVzR3JvdXBzLCBzcGVjaWVzTG9va3VwTGlzdCwgc3BlY2llc1NjaU5hbWVMaXN0O1xuICAgICAgICAgIHNwZWNpZXNMb29rdXBMaXN0ID0gW107XG4gICAgICAgICAgc3BlY2llc1NjaU5hbWVMaXN0ID0gW107XG4gICAgICAgICAgc3BlY2llc0dyb3VwcyA9IHt9O1xuICAgICAgICAgIGNvbW1vbk5hbWVXcml0ZXIgPSBmdW5jdGlvbihzY2lOYW1lKSB7XG4gICAgICAgICAgICB2YXIgc2NpTmFtZVBvc3RmaXg7XG4gICAgICAgICAgICBzY2lOYW1lUG9zdGZpeCA9IFwiIChcIiArIHNjaU5hbWUgKyBcIilcIjtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbihjbkluZGV4LCBjbikge1xuICAgICAgICAgICAgICByZXR1cm4gc3BlY2llc0xvb2t1cExpc3QucHVzaCh7XG4gICAgICAgICAgICAgICAgbGFiZWw6IGNuICsgc2NpTmFtZVBvc3RmaXgsXG4gICAgICAgICAgICAgICAgdmFsdWU6IHNjaU5hbWVcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH07XG4gICAgICAgICAgJC5lYWNoKGRhdGEsIGZ1bmN0aW9uKHNjaU5hbWUsIHNwcEluZm8pIHtcbiAgICAgICAgICAgIHNwZWNpZXNTY2lOYW1lTGlzdC5wdXNoKHNjaU5hbWUpO1xuICAgICAgICAgICAgc3BlY2llc0dyb3Vwc1tzY2lOYW1lXSA9IHNwcEluZm8uZ3JvdXA7XG4gICAgICAgICAgICBpZiAoc3BwSW5mby5jb21tb25OYW1lcykge1xuICAgICAgICAgICAgICByZXR1cm4gJC5lYWNoKHNwcEluZm8uY29tbW9uTmFtZXMsIGNvbW1vbk5hbWVXcml0ZXIoc2NpTmFtZSkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHNwZWNpZXNMb29rdXBMaXN0LnB1c2goe1xuICAgICAgICAgICAgICAgIGxhYmVsOiBzY2lOYW1lLFxuICAgICAgICAgICAgICAgIHZhbHVlOiBzY2lOYW1lXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIF90aGlzLnNwZWNpZXNMb29rdXBMaXN0ID0gc3BlY2llc0xvb2t1cExpc3Q7XG4gICAgICAgICAgX3RoaXMuc3BlY2llc1NjaU5hbWVMaXN0ID0gc3BlY2llc1NjaU5hbWVMaXN0O1xuICAgICAgICAgIHJldHVybiBfdGhpcy5zcGVjaWVzR3JvdXBzID0gc3BlY2llc0dyb3VwcztcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKTtcbiAgICB9LFxuICAgIGZldGNoQmlvZGl2SW5mbzogZnVuY3Rpb24oKSB7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5mZXRjaEJpb2RpdkluZm8nKTtcbiAgICAgIHJldHVybiAkLmFqYXgoe1xuICAgICAgICB1cmw6ICcvZGF0YS9iaW9kaXZlcnNpdHknLFxuICAgICAgICBkYXRhVHlwZTogJ2pzb24nXG4gICAgICB9KS5kb25lKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgIHZhciBiaW9kaXZMaXN0LCBiaW9kaXZMb29rdXBMaXN0O1xuICAgICAgICAgIGJpb2Rpdkxpc3QgPSBbXTtcbiAgICAgICAgICBiaW9kaXZMb29rdXBMaXN0ID0gW107XG4gICAgICAgICAgJC5lYWNoKGRhdGEsIGZ1bmN0aW9uKGJpb2Rpdk5hbWUsIGJpb2RpdkluZm8pIHtcbiAgICAgICAgICAgIHZhciBiaW9kaXZDYXBOYW1lO1xuICAgICAgICAgICAgYmlvZGl2Q2FwTmFtZSA9IGJpb2Rpdk5hbWUucmVwbGFjZSgvXi4vLCBmdW5jdGlvbihjKSB7XG4gICAgICAgICAgICAgIHJldHVybiBjLnRvVXBwZXJDYXNlKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGJpb2Rpdkxpc3QucHVzaChiaW9kaXZOYW1lKTtcbiAgICAgICAgICAgIHJldHVybiBiaW9kaXZMb29rdXBMaXN0LnB1c2goe1xuICAgICAgICAgICAgICBsYWJlbDogXCJCaW9kaXZlcnNpdHkgb2YgXCIgKyBiaW9kaXZDYXBOYW1lLFxuICAgICAgICAgICAgICB2YWx1ZTogYmlvZGl2TmFtZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgX3RoaXMuYmlvZGl2TGlzdCA9IGJpb2Rpdkxpc3Q7XG4gICAgICAgICAgcmV0dXJuIF90aGlzLmJpb2Rpdkxvb2t1cExpc3QgPSBiaW9kaXZMb29rdXBMaXN0O1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpO1xuICAgIH0sXG4gICAgYnVpbGRMZWZ0Rm9ybTogZnVuY3Rpb24oKSB7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5idWlsZExlZnRGb3JtJyk7XG4gICAgICByZXR1cm4gJC53aGVuKHRoaXMuc3BlY2llc0luZm9GZXRjaFByb2Nlc3MsIHRoaXMuYmlvZGl2SW5mb0ZldGNoUHJvY2VzcykuZG9uZSgoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHZhciAkbGVmdG1hcHNwcDtcbiAgICAgICAgICAkbGVmdG1hcHNwcCA9IF90aGlzLiQoJyNsZWZ0bWFwc3BwJyk7XG4gICAgICAgICAgX3RoaXMubmFtZXNMaXN0ID0gX3RoaXMuYmlvZGl2TGlzdC5jb25jYXQoX3RoaXMuc3BlY2llc1NjaU5hbWVMaXN0KTtcbiAgICAgICAgICByZXR1cm4gJGxlZnRtYXBzcHAuYXV0b2NvbXBsZXRlKHtcbiAgICAgICAgICAgIHNvdXJjZTogX3RoaXMuYmlvZGl2TG9va3VwTGlzdC5jb25jYXQoX3RoaXMuc3BlY2llc0xvb2t1cExpc3QpLFxuICAgICAgICAgICAgYXBwZW5kVG86IF90aGlzLiRlbCxcbiAgICAgICAgICAgIGNsb3NlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIF90aGlzLiRlbC50cmlnZ2VyKCdsZWZ0bWFwdXBkYXRlJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKSk7XG4gICAgfSxcbiAgICBidWlsZFJpZ2h0Rm9ybTogZnVuY3Rpb24oKSB7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5idWlsZFJpZ2h0Rm9ybScpO1xuICAgICAgcmV0dXJuICQud2hlbih0aGlzLnNwZWNpZXNJbmZvRmV0Y2hQcm9jZXNzLCB0aGlzLmJpb2RpdkluZm9GZXRjaFByb2Nlc3MpLmRvbmUoKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICB2YXIgJHJpZ2h0bWFwc3BwO1xuICAgICAgICAgICRyaWdodG1hcHNwcCA9IF90aGlzLiQoJyNyaWdodG1hcHNwcCcpO1xuICAgICAgICAgIF90aGlzLm5hbWVzTGlzdCA9IF90aGlzLmJpb2Rpdkxpc3QuY29uY2F0KF90aGlzLnNwZWNpZXNTY2lOYW1lTGlzdCk7XG4gICAgICAgICAgcmV0dXJuICRyaWdodG1hcHNwcC5hdXRvY29tcGxldGUoe1xuICAgICAgICAgICAgc291cmNlOiBfdGhpcy5iaW9kaXZMb29rdXBMaXN0LmNvbmNhdChfdGhpcy5zcGVjaWVzTG9va3VwTGlzdCksXG4gICAgICAgICAgICBhcHBlbmRUbzogX3RoaXMuJGVsLFxuICAgICAgICAgICAgY2xvc2U6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICByZXR1cm4gX3RoaXMuJGVsLnRyaWdnZXIoJ3JpZ2h0bWFwdXBkYXRlJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKSk7XG4gICAgfSxcbiAgICBzdGFydFNwbGl0dGVyVHJhY2tpbmc6IGZ1bmN0aW9uKCkge1xuICAgICAgZGVidWcoJ0FwcFZpZXcuc3RhcnRTcGxpdHRlclRyYWNraW5nJyk7XG4gICAgICB0aGlzLnRyYWNrU3BsaXR0ZXIgPSB0cnVlO1xuICAgICAgdGhpcy5zcGxpdExpbmUuYWRkQ2xhc3MoJ2RyYWdnaW5nJyk7XG4gICAgICByZXR1cm4gdGhpcy5sb2NhdGVTcGxpdHRlcigpO1xuICAgIH0sXG4gICAgbG9jYXRlU3BsaXR0ZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgZGVidWcoJ0FwcFZpZXcubG9jYXRlU3BsaXR0ZXInKTtcbiAgICAgIGlmICh0aGlzLnRyYWNrU3BsaXR0ZXIpIHtcbiAgICAgICAgdGhpcy5yZXNpemVUaGluZ3MoKTtcbiAgICAgICAgaWYgKHRoaXMudHJhY2tTcGxpdHRlciA9PT0gMCkge1xuICAgICAgICAgIHRoaXMudHJhY2tTcGxpdHRlciA9IGZhbHNlO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMudHJhY2tTcGxpdHRlciAhPT0gdHJ1ZSkge1xuICAgICAgICAgIHRoaXMudHJhY2tTcGxpdHRlciAtPSAxO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KHRoaXMubG9jYXRlU3BsaXR0ZXIsIHRoaXMudHJhY2tQZXJpb2QpO1xuICAgICAgfVxuICAgIH0sXG4gICAgcmVzaXplVGhpbmdzOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciAkbWFwQm94LCBib3R0b21SaWdodCwgbGF5ZXJCb3R0b20sIGxheWVyVG9wLCBsZWZ0TGVmdCwgbGVmdE1hcCwgbWFwQm91bmRzLCBtYXBCb3gsIG5ld0xlZnRXaWR0aCwgcmlnaHRNYXAsIHJpZ2h0UmlnaHQsIHNwbGl0UG9pbnQsIHNwbGl0WCwgdG9wTGVmdDtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LnJlc2l6ZVRoaW5ncycpO1xuICAgICAgaWYgKHRoaXMubGVmdExheWVyKSB7XG4gICAgICAgIGxlZnRNYXAgPSAkKHRoaXMubGVmdExheWVyLmdldENvbnRhaW5lcigpKTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLnJpZ2h0TGF5ZXIpIHtcbiAgICAgICAgcmlnaHRNYXAgPSAkKHRoaXMucmlnaHRMYXllci5nZXRDb250YWluZXIoKSk7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy4kZWwuaGFzQ2xhc3MoJ3NwbGl0JykpIHtcbiAgICAgICAgbmV3TGVmdFdpZHRoID0gdGhpcy5zcGxpdFRodW1iLnBvc2l0aW9uKCkubGVmdCArICh0aGlzLnNwbGl0VGh1bWIud2lkdGgoKSAvIDIuMCk7XG4gICAgICAgIG1hcEJveCA9IHRoaXMubWFwLmdldENvbnRhaW5lcigpO1xuICAgICAgICAkbWFwQm94ID0gJChtYXBCb3gpO1xuICAgICAgICBtYXBCb3VuZHMgPSBtYXBCb3guZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIHRvcExlZnQgPSB0aGlzLm1hcC5jb250YWluZXJQb2ludFRvTGF5ZXJQb2ludChbMCwgMF0pO1xuICAgICAgICBzcGxpdFBvaW50ID0gdGhpcy5tYXAuY29udGFpbmVyUG9pbnRUb0xheWVyUG9pbnQoW25ld0xlZnRXaWR0aCwgMF0pO1xuICAgICAgICBib3R0b21SaWdodCA9IHRoaXMubWFwLmNvbnRhaW5lclBvaW50VG9MYXllclBvaW50KFskbWFwQm94LndpZHRoKCksICRtYXBCb3guaGVpZ2h0KCldKTtcbiAgICAgICAgbGF5ZXJUb3AgPSB0b3BMZWZ0Lnk7XG4gICAgICAgIGxheWVyQm90dG9tID0gYm90dG9tUmlnaHQueTtcbiAgICAgICAgc3BsaXRYID0gc3BsaXRQb2ludC54IC0gbWFwQm91bmRzLmxlZnQ7XG4gICAgICAgIGxlZnRMZWZ0ID0gdG9wTGVmdC54IC0gbWFwQm91bmRzLmxlZnQ7XG4gICAgICAgIHJpZ2h0UmlnaHQgPSBib3R0b21SaWdodC54O1xuICAgICAgICB0aGlzLnNwbGl0TGluZS5jc3MoJ2xlZnQnLCBuZXdMZWZ0V2lkdGgpO1xuICAgICAgICB0aGlzLmxlZnRUYWcuYXR0cignc3R5bGUnLCBcImNsaXA6IHJlY3QoMCwgXCIgKyBuZXdMZWZ0V2lkdGggKyBcInB4LCBhdXRvLCAwKVwiKTtcbiAgICAgICAgaWYgKHRoaXMubGVmdExheWVyKSB7XG4gICAgICAgICAgbGVmdE1hcC5hdHRyKCdzdHlsZScsIFwiY2xpcDogcmVjdChcIiArIGxheWVyVG9wICsgXCJweCwgXCIgKyBzcGxpdFggKyBcInB4LCBcIiArIGxheWVyQm90dG9tICsgXCJweCwgXCIgKyBsZWZ0TGVmdCArIFwicHgpXCIpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnJpZ2h0TGF5ZXIpIHtcbiAgICAgICAgICByZXR1cm4gcmlnaHRNYXAuYXR0cignc3R5bGUnLCBcImNsaXA6IHJlY3QoXCIgKyBsYXllclRvcCArIFwicHgsIFwiICsgcmlnaHRSaWdodCArIFwicHgsIFwiICsgbGF5ZXJCb3R0b20gKyBcInB4LCBcIiArIHNwbGl0WCArIFwicHgpXCIpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmxlZnRUYWcuYXR0cignc3R5bGUnLCAnY2xpcDogaW5oZXJpdCcpO1xuICAgICAgICBpZiAodGhpcy5sZWZ0TGF5ZXIpIHtcbiAgICAgICAgICBsZWZ0TWFwLmF0dHIoJ3N0eWxlJywgJ2NsaXA6IGluaGVyaXQnKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5yaWdodExheWVyKSB7XG4gICAgICAgICAgcmV0dXJuIHJpZ2h0TWFwLmF0dHIoJ3N0eWxlJywgJ2NsaXA6IHJlY3QoMCwwLDAsMCknKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgc3RvcFNwbGl0dGVyVHJhY2tpbmc6IGZ1bmN0aW9uKCkge1xuICAgICAgZGVidWcoJ0FwcFZpZXcuc3RvcFNwbGl0dGVyVHJhY2tpbmcnKTtcbiAgICAgIHRoaXMuc3BsaXRMaW5lLnJlbW92ZUNsYXNzKCdkcmFnZ2luZycpO1xuICAgICAgcmV0dXJuIHRoaXMudHJhY2tTcGxpdHRlciA9IDU7XG4gICAgfSxcbiAgICBhY3RpdmF0ZVNwbGl0dGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LmFjdGl2YXRlU3BsaXR0ZXInKTtcbiAgICAgIHRoaXMuc3BsaXRUaHVtYi5kcmFnZ2FibGUoe1xuICAgICAgICBjb250YWlubWVudDogJCgnI21hcHdyYXBwZXInKSxcbiAgICAgICAgc2Nyb2xsOiBmYWxzZSxcbiAgICAgICAgc3RhcnQ6IHRoaXMuc3RhcnRTcGxpdHRlclRyYWNraW5nLFxuICAgICAgICBkcmFnOiB0aGlzLnJlc2l6ZVRoaW5ncyxcbiAgICAgICAgc3RvcDogdGhpcy5zdG9wU3BsaXR0ZXJUcmFja2luZ1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gdGhpcy5yZXNpemVUaGluZ3MoKTtcbiAgICB9LFxuICAgIGRlYWN0aXZhdGVTcGxpdHRlcjogZnVuY3Rpb24oKSB7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5kZWFjdGl2YXRlU3BsaXR0ZXInKTtcbiAgICAgIHRoaXMuc3BsaXRUaHVtYi5kcmFnZ2FibGUoJ2Rlc3Ryb3knKTtcbiAgICAgIHJldHVybiB0aGlzLnJlc2l6ZVRoaW5ncygpO1xuICAgIH1cbiAgfSwge1xuICAgIHRlbXBsYXRlczoge1xuICAgICAgbGF5b3V0OiBfLnRlbXBsYXRlKFwiPGRpdiBjbGFzcz1cXFwic3BsaXRsaW5lXFxcIj4mbmJzcDs8L2Rpdj5cXG48ZGl2IGNsYXNzPVxcXCJzcGxpdHRodW1iXFxcIj48c3Bhbj4mI3gyNzZlOyAmI3gyNzZmOzwvc3Bhbj48L2Rpdj5cXG48ZGl2IGNsYXNzPVxcXCJsZWZ0IHRhZ1xcXCI+PCU9IGxlZnRUYWcgJT48L2Rpdj5cXG48ZGl2IGNsYXNzPVxcXCJyaWdodCB0YWdcXFwiPjwlPSByaWdodFRhZyAlPjwvZGl2PlxcbjxkaXYgY2xhc3M9XFxcImxlZnQgc2lkZSBmb3JtXFxcIj48JT0gbGVmdEZvcm0gJT48L2Rpdj5cXG48ZGl2IGNsYXNzPVxcXCJyaWdodCBzaWRlIGZvcm1cXFwiPjwlPSByaWdodEZvcm0gJT48L2Rpdj5cXG48ZGl2IGNsYXNzPVxcXCJsZWZ0IGxvYWRlclxcXCI+PGltZyBzcmM9XFxcIi9zdGF0aWMvaW1hZ2VzL3NwaW5uZXIubG9hZGluZm8ubmV0LmdpZlxcXCIgLz48L2Rpdj5cXG48ZGl2IGNsYXNzPVxcXCJyaWdodCBsb2FkZXJcXFwiPjxpbWcgc3JjPVxcXCIvc3RhdGljL2ltYWdlcy9zcGlubmVyLmxvYWRpbmZvLm5ldC5naWZcXFwiIC8+PC9kaXY+XFxuPGRpdiBpZD1cXFwibWFwd3JhcHBlclxcXCI+PGRpdiBpZD1cXFwibWFwXFxcIj48L2Rpdj48L2Rpdj5cIiksXG4gICAgICBsZWZ0VGFnOiBfLnRlbXBsYXRlKFwiPGRpdiBjbGFzcz1cXFwic2hvd1xcXCI+XFxuICAgIDxzcGFuIGNsYXNzPVxcXCJsZWZ0bGF5ZXJuYW1lXFxcIj5wbGFpbiBtYXA8L3NwYW4+XFxuICAgIDxicj5cXG4gICAgPGJ1dHRvbiBjbGFzcz1cXFwiYnRuLWNoYW5nZVxcXCI+c2V0dGluZ3M8L2J1dHRvbj5cXG4gICAgPGJ1dHRvbiBjbGFzcz1cXFwiYnRuLWNvbXBhcmVcXFwiPnNob3cvaGlkZSBjb21wYXJpc29uIG1hcDwvYnV0dG9uPlxcbjwvZGl2PlxcbjxkaXYgY2xhc3M9XFxcImVkaXRcXFwiPlxcbiAgICA8aW5wdXQgaWQ9XFxcImxlZnRtYXBzcHBcXFwiIGNsYXNzPVxcXCJsZWZ0XFxcIiBuYW1lPVxcXCJsZWZ0bWFwc3BwXFxcIiBwbGFjZWhvbGRlcj1cXFwiJmhlbGxpcDsgc3BlY2llcyBvciBncm91cCAmaGVsbGlwO1xcXCIgLz5cXG4gICAgPCEtLVxcbiAgICA8YnV0dG9uIGNsYXNzPVxcXCJidG4tY2hhbmdlXFxcIj5oaWRlIHNldHRpbmdzPC9idXR0b24+XFxuICAgIDxidXR0b24gY2xhc3M9XFxcImJ0bi1jb21wYXJlXFxcIj5jb21wYXJlICsvLTwvYnV0dG9uPlxcbiAgICAtLT5cXG48L2Rpdj5cIiksXG4gICAgICByaWdodFRhZzogXy50ZW1wbGF0ZShcIjxkaXYgY2xhc3M9XFxcInNob3dcXFwiPlxcbiAgICA8c3BhbiBjbGFzcz1cXFwicmlnaHRsYXllcm5hbWVcXFwiPihubyBkaXN0cmlidXRpb24pPC9zcGFuPlxcbiAgICA8YnI+XFxuICAgIDxidXR0b24gY2xhc3M9XFxcImJ0bi1jaGFuZ2VcXFwiPnNldHRpbmdzPC9idXR0b24+XFxuICAgIDxidXR0b24gY2xhc3M9XFxcImJ0bi1jb21wYXJlXFxcIj5zaG93L2hpZGUgY29tcGFyaXNvbiBtYXA8L2J1dHRvbj5cXG48L2Rpdj5cXG48ZGl2IGNsYXNzPVxcXCJlZGl0XFxcIj5cXG4gICAgPGlucHV0IGlkPVxcXCJyaWdodG1hcHNwcFxcXCIgY2xhc3M9XFxcInJpZ2h0XFxcIiBuYW1lPVxcXCJyaWdodG1hcHNwcFxcXCIgcGxhY2Vob2xkZXI9XFxcIiZoZWxsaXA7IHNwZWNpZXMgb3IgZ3JvdXAgJmhlbGxpcDtcXFwiIC8+XFxuPC9kaXY+XCIpLFxuICAgICAgbGVmdEZvcm06IF8udGVtcGxhdGUoXCI8ZmllbGRzZXQ+XFxuICAgIDxsZWdlbmQ+dGVtcGVyYXR1cmUgY2hhbmdlPC9sZWdlbmQ+XFxuICAgIDxzZWxlY3QgY2xhc3M9XFxcImxlZnRcXFwiIGlkPVxcXCJsZWZ0bWFwZGVnc1xcXCI+XFxuICAgICAgICA8b3B0aW9uIHZhbHVlPVxcXCJiYXNlbGluZVxcXCI+Y3VycmVudDwvb3B0aW9uPlxcbiAgICAgICAgPG9wdGlvbiB2YWx1ZT1cXFwiMS41XFxcIj4xLjUgJmRlZztDPC9vcHRpb24+XFxuICAgICAgICA8b3B0aW9uIHZhbHVlPVxcXCIyLjBcXFwiPjIuMCAmZGVnO0M8L29wdGlvbj5cXG4gICAgICAgIDxvcHRpb24gdmFsdWU9XFxcIjIuN1xcXCI+Mi43ICZkZWc7Qzwvb3B0aW9uPlxcbiAgICAgICAgPG9wdGlvbiB2YWx1ZT1cXFwiMy4yXFxcIj4zLjIgJmRlZztDPC9vcHRpb24+XFxuICAgICAgICA8b3B0aW9uIHZhbHVlPVxcXCI0LjVcXFwiPjQuNSAmZGVnO0M8L29wdGlvbj5cXG4gICAgICAgIDxvcHRpb24gdmFsdWU9XFxcIjYuMFxcXCI+Ni4wICZkZWc7Qzwvb3B0aW9uPlxcbiAgICA8L3NlbGVjdD5cXG48L2ZpZWxkc2V0PlxcbjxmaWVsZHNldD5cXG4gICAgPGxlZ2VuZD5hZGFwdGF0aW9uIHZpYSByYW5nZSBzaGlmdDwvbGVnZW5kPlxcbiAgICA8bGFiZWw+PHNwYW4+YWxsb3c8L3NwYW4+IDxpbnB1dCBuYW1lPVxcXCJsZWZ0bWFwc2NlbmFyaW9cXFwiIGNsYXNzPVxcXCJsZWZ0XFxcIiB0eXBlPVxcXCJyYWRpb1xcXCIgdmFsdWU9XFxcIlJDUDQ1XFxcIj4gc3BlY2llcyBjYW4gYWRhcHQgYnkgc2hpZnRpbmcgcmFuZ2VzPC9sYWJlbD5cXG4gICAgPGxhYmVsPjxzcGFuPmRlbnk8L3NwYW4+IDxpbnB1dCBuYW1lPVxcXCJsZWZ0bWFwc2NlbmFyaW9cXFwiIGNsYXNzPVxcXCJsZWZ0XFxcIiB0eXBlPVxcXCJyYWRpb1xcXCIgdmFsdWU9XFxcIlJDUDg1XFxcIiBjaGVja2VkPVxcXCJjaGVja2VkXFxcIj4gc3BlY2llcyBjYW5ub3Qgc2hpZnQgcmFuZ2VzPC9sYWJlbD5cXG48L2ZpZWxkc2V0PlxcbjxmaWVsZHNldD5cXG4gICAgPGxlZ2VuZD5tb2RlbCBzdW1tYXJ5PC9sZWdlbmQ+XFxuICAgIDxzZWxlY3QgY2xhc3M9XFxcImxlZnRcXFwiIGlkPVxcXCJsZWZ0bWFwZ2NtXFxcIj5cXG4gICAgICAgIDxvcHRpb24gdmFsdWU9XFxcInRlbnRoXFxcIj4xMHRoIHBlcmNlbnRpbGU8L29wdGlvbj5cXG4gICAgICAgIDxvcHRpb24gdmFsdWU9XFxcImZpZnRpZXRoXFxcIiBzZWxlY3RlZD1cXFwic2VsZWN0ZWRcXFwiPjUwdGggcGVyY2VudGlsZTwvb3B0aW9uPlxcbiAgICAgICAgPG9wdGlvbiB2YWx1ZT1cXFwibmluZXRpZXRoXFxcIj45MHRoIHBlcmNlbnRpbGU8L29wdGlvbj5cXG4gICAgPC9zZWxlY3Q+XFxuPC9maWVsZHNldD5cXG48ZmllbGRzZXQgY2xhc3M9XFxcImJsYW5rXFxcIj5cXG4gICAgPGJ1dHRvbiB0eXBlPVxcXCJidXR0b25cXFwiIGNsYXNzPVxcXCJidG4tY2hhbmdlXFxcIj5oaWRlIHNldHRpbmdzPC9idXR0b24+XFxuICAgIDxidXR0b24gdHlwZT1cXFwiYnV0dG9uXFxcIiBjbGFzcz1cXFwiYnRuLWNvbXBhcmVcXFwiPnNob3cgcmlnaHQgbWFwPC9idXR0b24+XFxuICAgIDxidXR0b24gdHlwZT1cXFwiYnV0dG9uXFxcIiBjbGFzcz1cXFwiYnRuLWNvcHkgcmlnaHQtdmFsaWQtbWFwXFxcIj5jb3B5IHJpZ2h0IG1hcCAmbGFxdW87PC9idXR0b24+XFxuICAgIDxhIGlkPVxcXCJsZWZ0bWFwZGxcXFwiIGNsYXNzPVxcXCJkb3dubG9hZCBsZWZ0LXZhbGlkLW1hcFxcXCIgaHJlZj1cXFwiXFxcIiBkaXNhYmxlZD1cXFwiZGlzYWJsZWRcXFwiPmRvd25sb2FkIGp1c3QgdGhpcyBtYXA8YnI+KDwyME1iIEdlb1RJRkYpPC9hPlxcbiAgICA8YSBpZD1cXFwibGVmdGFyY2hpdmVkbFxcXCIgY2xhc3M9XFxcImRvd25sb2FkIGxlZnQtdmFsaWQtbWFwXFxcIiBocmVmPVxcXCJcXFwiIGRpc2FibGVkPVxcXCJkaXNhYmxlZFxcXCI+ZG93bmxvYWQgdGhpcyBzZXQgb2YgbWFwczxicj4ofjJHYiB6aXApPC9hPlxcbjwvZmllbGRzZXQ+XFxuXFxuPGZpZWxkc2V0PlxcbiAgICA8bGVnZW5kPnRpbWUgcG9pbnQ8L2xlZ2VuZD5cXG4gICAgPHNlbGVjdCBjbGFzcz1cXFwibGVmdFxcXCIgaWQ9XFxcImxlZnRtYXB5ZWFyXFxcIj5cXG4gICAgICAgIDxvcHRpb24gdmFsdWU9XFxcImJhc2VsaW5lXFxcIj5jdXJyZW50PC9vcHRpb24+XFxuICAgICAgICA8b3B0aW9uPjIwMjU8L29wdGlvbj5cXG4gICAgICAgIDxvcHRpb24+MjAzNTwvb3B0aW9uPlxcbiAgICAgICAgPG9wdGlvbj4yMDQ1PC9vcHRpb24+XFxuICAgICAgICA8b3B0aW9uPjIwNTU8L29wdGlvbj5cXG4gICAgICAgIDxvcHRpb24+MjA2NTwvb3B0aW9uPlxcbiAgICAgICAgPG9wdGlvbj4yMDc1PC9vcHRpb24+XFxuICAgICAgICA8b3B0aW9uPjIwODU8L29wdGlvbj5cXG4gICAgPC9zZWxlY3Q+XFxuPC9maWVsZHNldD5cXG48ZmllbGRzZXQ+XFxuICAgIDxsZWdlbmQ+ZW1pc3Npb24gc2NlbmFyaW88L2xlZ2VuZD5cXG4gICAgPGxhYmVsPjxzcGFuPlJDUCA0LjU8L3NwYW4+IDxpbnB1dCBuYW1lPVxcXCJsZWZ0bWFwc2NlbmFyaW9cXFwiIGNsYXNzPVxcXCJsZWZ0XFxcIiB0eXBlPVxcXCJyYWRpb1xcXCIgdmFsdWU9XFxcIlJDUDQ1XFxcIj4gbG93ZXIgZW1pc3Npb25zPC9sYWJlbD5cXG4gICAgPGxhYmVsPjxzcGFuPlJDUCA4LjU8L3NwYW4+IDxpbnB1dCBuYW1lPVxcXCJsZWZ0bWFwc2NlbmFyaW9cXFwiIGNsYXNzPVxcXCJsZWZ0XFxcIiB0eXBlPVxcXCJyYWRpb1xcXCIgdmFsdWU9XFxcIlJDUDg1XFxcIiBjaGVja2VkPVxcXCJjaGVja2VkXFxcIj4gYnVzaW5lc3MgYXMgdXN1YWw8L2xhYmVsPlxcbjwvZmllbGRzZXQ+XCIpLFxuICAgICAgcmlnaHRGb3JtOiBfLnRlbXBsYXRlKFwiPGZpZWxkc2V0PlxcbiAgICA8bGVnZW5kPnRpbWUgcG9pbnQ8L2xlZ2VuZD5cXG4gICAgPHNlbGVjdCBjbGFzcz1cXFwicmlnaHRcXFwiIGlkPVxcXCJyaWdodG1hcHllYXJcXFwiPlxcbiAgICAgICAgPG9wdGlvbiB2YWx1ZT1cXFwiYmFzZWxpbmVcXFwiPmN1cnJlbnQ8L29wdGlvbj5cXG4gICAgICAgIDxvcHRpb24+MjAyNTwvb3B0aW9uPlxcbiAgICAgICAgPG9wdGlvbj4yMDM1PC9vcHRpb24+XFxuICAgICAgICA8b3B0aW9uPjIwNDU8L29wdGlvbj5cXG4gICAgICAgIDxvcHRpb24+MjA1NTwvb3B0aW9uPlxcbiAgICAgICAgPG9wdGlvbj4yMDY1PC9vcHRpb24+XFxuICAgICAgICA8b3B0aW9uPjIwNzU8L29wdGlvbj5cXG4gICAgICAgIDxvcHRpb24+MjA4NTwvb3B0aW9uPlxcbiAgICA8L3NlbGVjdD5cXG48L2ZpZWxkc2V0PlxcbjxmaWVsZHNldD5cXG4gICAgPGxlZ2VuZD5lbWlzc2lvbiBzY2VuYXJpbzwvbGVnZW5kPlxcbiAgICA8bGFiZWw+PHNwYW4+UkNQIDQuNTwvc3Bhbj4gPGlucHV0IG5hbWU9XFxcInJpZ2h0bWFwc2NlbmFyaW9cXFwiIGNsYXNzPVxcXCJyaWdodFxcXCIgdHlwZT1cXFwicmFkaW9cXFwiIHZhbHVlPVxcXCJSQ1A0NVxcXCI+IGxvd2VyIGVtaXNzaW9uczwvbGFiZWw+XFxuICAgIDxsYWJlbD48c3Bhbj5SQ1AgOC41PC9zcGFuPiA8aW5wdXQgbmFtZT1cXFwicmlnaHRtYXBzY2VuYXJpb1xcXCIgY2xhc3M9XFxcInJpZ2h0XFxcIiB0eXBlPVxcXCJyYWRpb1xcXCIgdmFsdWU9XFxcIlJDUDg1XFxcIiBjaGVja2VkPVxcXCJjaGVja2VkXFxcIj4gYnVzaW5lc3MgYXMgdXN1YWw8L2xhYmVsPlxcbjwvZmllbGRzZXQ+XFxuPGZpZWxkc2V0PlxcbiAgICA8bGVnZW5kPm1vZGVsIHN1bW1hcnk8L2xlZ2VuZD5cXG4gICAgPHNlbGVjdCBjbGFzcz1cXFwicmlnaHRcXFwiIGlkPVxcXCJyaWdodG1hcGdjbVxcXCI+XFxuICAgICAgICA8b3B0aW9uIHZhbHVlPVxcXCJ0ZW50aFxcXCI+MTB0aCBwZXJjZW50aWxlPC9vcHRpb24+XFxuICAgICAgICA8b3B0aW9uIHZhbHVlPVxcXCJmaWZ0aWV0aFxcXCIgc2VsZWN0ZWQ9XFxcInNlbGVjdGVkXFxcIj41MHRoIHBlcmNlbnRpbGU8L29wdGlvbj5cXG4gICAgICAgIDxvcHRpb24gdmFsdWU9XFxcIm5pbmV0aWV0aFxcXCI+OTB0aCBwZXJjZW50aWxlPC9vcHRpb24+XFxuICAgIDwvc2VsZWN0PlxcbjwvZmllbGRzZXQ+XFxuPGZpZWxkc2V0IGNsYXNzPVxcXCJibGFua1xcXCI+XFxuICAgIDxidXR0b24gdHlwZT1cXFwiYnV0dG9uXFxcIiBjbGFzcz1cXFwiYnRuLWNoYW5nZVxcXCI+aGlkZSBzZXR0aW5nczwvYnV0dG9uPlxcbiAgICA8YnV0dG9uIHR5cGU9XFxcImJ1dHRvblxcXCIgY2xhc3M9XFxcImJ0bi1jb21wYXJlXFxcIj5oaWRlIHJpZ2h0IG1hcDwvYnV0dG9uPlxcbiAgICA8YnV0dG9uIHR5cGU9XFxcImJ1dHRvblxcXCIgY2xhc3M9XFxcImJ0bi1jb3B5IGxlZnQtdmFsaWQtbWFwXFxcIj4mcmFxdW87IGNvcHkgbGVmdCBtYXA8L2J1dHRvbj5cXG4gICAgPGEgaWQ9XFxcInJpZ2h0bWFwZGxcXFwiIGNsYXNzPVxcXCJkb3dubG9hZCByaWdodC12YWxpZC1tYXBcXFwiIGhyZWY9XFxcIlxcXCIgZGlzYWJsZWQ9XFxcImRpc2FibGVkXFxcIj5kb3dubG9hZCBqdXN0IHRoaXMgbWFwPGJyPig8MjBNYiBHZW9USUZGKTwvYT5cXG4gICAgPGEgaWQ9XFxcInJpZ2h0YXJjaGl2ZWRsXFxcIiBjbGFzcz1cXFwiZG93bmxvYWQgcmlnaHQtdmFsaWQtbWFwXFxcIiBocmVmPVxcXCJcXFwiIGRpc2FibGVkPVxcXCJkaXNhYmxlZFxcXCI+ZG93bmxvYWQgdGhpcyBzZXQgb2YgbWFwczxicj4oPDJHYiB6aXApPC9hPlxcbjwvZmllbGRzZXQ+XCIpXG4gICAgfVxuICB9KTtcblxuICBtb2R1bGUuZXhwb3J0cyA9IEFwcFZpZXc7XG5cbn0pLmNhbGwodGhpcyk7XG4iLCJcbi8vIGpRdWVyeSBwbHVnaW5cbi8vIGF1dGhvcjogRGFuaWVsIEJhaXJkIDxkYW5pZWxAZGFuaWVsYmFpcmQuY29tPlxuLy8gdmVyc2lvbjogMC4xLjIwMTQwMjA1XG5cbi8vXG4vLyBUaGlzIG1hbmFnZXMgbWVudXMsIHN1Ym1lbnVzLCBwYW5lbHMsIGFuZCBwYWdlcy5cbi8vIExpa2UgdGhpczpcbi8vIC0tLS4tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS4tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS4tLS1cbi8vICAgIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgICAgICAgICAgICAgICAgICAgICAgfCAgICAgICAgICAgICAgICAgICAgICAgIHxcbi8vICAgIHwgIFNlbGVjdGVkIE1haW4gTWVudSBJdGVtICAgLi0tLS0tLS0tLS0tLiAuLS0tLS0tLS0tLiAgIHwgIEFsdCBNYWluIE1lbnUgSXRlbSAgfCAgVGhpcmQgTWFpbiBNZW51IEl0ZW0gIHxcbi8vICAgIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAvICBTdWJpdGVtIDEgIFxcIFN1Yml0ZW0gMiBcXCAgfCAgICAgICAgICAgICAgICAgICAgICB8ICAgICAgICAgICAgICAgICAgICAgICAgfFxuLy8gLS0tJy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tJyAgICAgICAgICAgICAgICctLS0tLS0tLS0tLS0tJy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0nLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tJy0tLVxuLy8gICAgICAgfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4vLyAgICAgICB8ICAgUGFuZWwgZm9yIFN1Yml0ZW0gMSwgdGhpcyBpcyBQYWdlIDEgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbi8vICAgICAgIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuLy8gICAgICAgfCAgIEVhY2ggUGFuZWwgY2FuIGhhdmUgbXVsdGlwbGUgcGFnZXMsIG9uZSBwYWdlIHNob3dpbmcgYXQgYSB0aW1lLiAgQnV0dG9ucyBvbiBwYWdlcyBzd2l0Y2ggICAgICB8XG4vLyAgICAgICB8ICAgYmV0d2VlbiBwYWdlcy4gIFBhbmVsIGhlaWdodCBhZGp1c3RzIHRvIHRoZSBoZWlnaHQgb2YgdGhlIHBhZ2UuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbi8vICAgICAgIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuLy8gICAgICAgfCAgIFsgc2VlIHBhZ2UgMiBdICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4vLyAgICAgICB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbi8vICAgICAgICctLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tJ1xuLy9cbi8vIC0gbWVudXMgYXJlIGFsd2F5cyA8dWw+IHRhZ3M7IGVhY2ggPGxpPiBpcyBhIG1lbnUgaXRlbVxuLy8gLSBhIG1haW4gbWVudSA8bGk+IG11c3QgY29udGFpbiBhbiA8YT4gdGFnIGFuZCBtYXkgYWxzbyBjb250YWluIGEgPHVsPiBzdWJtZW51XG4vLyAtIGEgc3VibWVudSA8bGk+IG11c3QgY29udGFpbiBhbiA8YT4gdGFnIHdpdGggYSBkYXRhLXRhcmdldHBhbmVsIGF0dHJpYnV0ZSBzZXRcbi8vIC0gVGhlcmUgaXMgYWx3YXlzIGEgc2luZ2xlIHNlbGVjdGVkIG1haW4gbWVudSBpdGVtXG4vLyAtIEEgbWFpbiBtZW51IGl0ZW0gbWF5IGVpdGhlciBsaW5rIHRvIGFub3RoZXIgd2VicGFnZSwgb3IgaGF2ZSBhIHN1Ym1lbnVcbi8vIC0gU2VsZWN0aW5nIGEgbWFpbiBtZW51IGl0ZW0gd2lsbCBzaG93IGl0cyBzdWJtZW51LCBpZiBpdCBoYXMgb25lXG4vLyAtIEEgc3VibWVudSBhbHdheXMgaGFzIGEgc2luZ2xlIGl0ZW0gc2VsZWN0ZWRcbi8vIC0gQ2xpY2tpbmcgYW4gaW5hY3RpdmUgc3VibWVudSBpdGVtIHdpbGwgc2hvdyBpdHMgcGFuZWxcbi8vIC0gQ2xpY2tpbmcgYSBzZWxlY3RlZCBzdWJtZW51IGl0ZW0gd2lsbCB0b2dnbGUgaXRzIHBhbmVsIHNob3dpbmcgPC0+IGhpZGluZyAoKCggTkI6IG5vdCB5ZXQgaW1wbGVtZW50ZWQgKSkpXG4vLyAtIEEgcGFuZWwgaW5pdGlhbGx5IHNob3dzIGl0cyBmaXJzdCBwYWdlXG4vLyAtIFN3aXRjaGluZyBwYWdlcyBpbiBhIHBhbmVsIGNoYW5nZXMgdGhlIHBhbmVsIGhlaWdodCB0byBzdWl0IGl0cyBjdXJyZW50IHBhZ2Vcbi8vIC0gQSBwYW5lbCBpcyBhIEhUTUwgYmxvY2sgZWxlbWVudCB3aXRoIHRoZSBjbGFzcyAubXNwcC1wYW5lbCAoY2FuIGJlIG92ZXJyaWRkZW4gdmlhIG9wdGlvbilcbi8vIC0gSWYgYSBwYW5lbCBjb250YWlucyBwYWdlcywgb25lIHBhZ2Ugc2hvdWxkIGhhdmUgdGhlIGNsYXNzIC5jdXJyZW50IChjYW4gYmUgb3ZlcnJpZGRlbiB2aWEgb3B0aW9uKVxuLy8gLSBBIHBhZ2UgaXMgYSBIVE1MIGJsb2NrIGVsZW1lbnQgd2l0aCB0aGUgY2xhc3MgLm1zcHAtcGFnZSAoY2FuIGJlIG92ZXJyaWRkZW4gdmlhIG9wdGlvbilcbi8vIC0gPGJ1dHRvbj4gb3IgPGE+IHRhZ3MgaW4gcGFnZXMgdGhhdCBoYXZlIGEgZGF0YS10YXJnZXRwYWdlIGF0dHJpYnV0ZSBzZXQgd2lsbCBzd2l0Y2ggdG8gdGhlIGluZGljYXRlZCBwYWdlXG4vL1xuLy9cbi8vIFRoZSBIVE1MIHNob3VsZCBsb29rIGxpa2UgdGhpczpcbi8vXG4vLyAgPHVsIGNsYXNzPVwibWVudVwiPiAgICAgICAgICAgICAgICAgICA8IS0tIHRoaXMgaXMgdGhlIG1haW4gbWVudSAtLT5cbi8vICAgICAgPGxpIGNsYXNzPVwiY3VycmVudFwiPiAgICAgICAgICAgIDwhLS0gdGhpcyBpcyBhIG1haW4gbWVudSBpdGVtLCBjdXJyZW50bHkgc2VsZWN0ZWQgLS0+XG4vLyAgICAgICAgICA8YT5GaXJzdCBJdGVtPC9hPiAgICAgICAgICAgPCEtLSB0aGUgZmlyc3QgaXRlbSBpbiB0aGUgbWFpbiBtZW51IC0tPlxuLy8gICAgICAgICAgPHVsPiAgICAgICAgICAgICAgICAgICAgICAgIDwhLS0gYSBzdWJtZW51IGluIHRoZSBmaXJzdCBtYWluIG1lbnUgaXRlbSAtLT5cbi8vICAgICAgICAgICAgICA8bGkgY2xhc3M9XCJjdXJyZW50XCI+ICAgIDwhLS0gdGhlIGN1cnJlbnRseSBzZWxlY3RlZCBzdWJtZW51IGl0ZW0gLS0+XG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPCEtLSAucGFuZWx0cmlnZ2VyIGFuZCB0aGUgZGF0YS1wYW5lbGlkIGF0dHJpYnV0ZSBhcmUgcmVxdWlyZWQgLS0+XG4vLyAgICAgICAgICAgICAgICAgIDxhIGRhdGEtdGFyZ2V0cGFuZWw9XCJwYW5lbDFcIj5kbyB0aGUgcGFuZWwxIHRoaW5nPC9hPlxuLy8gICAgICAgICAgICAgIDwvbGk+XG4vLyAgICAgICAgICAgICAgPGxpPi4uLjwvbGk+ICAgICAgICAgICAgPCEtLSBhbm90aGVyIHN1Ym1lbnUgaXRlbSAtLT5cbi8vICAgICAgICAgIDwvdWw+XG4vLyAgICAgIDwvbGk+XG4vLyAgICAgIDxsaT4gPGEgaHJlZj1cImFub3RoZXJfcGFnZS5odG1sXCI+YW5vdGhlciBwYWdlPC9hPiA8L2xpPlxuLy8gICAgICA8bGk+IDxhPndoYXRldmVyPC9hPiA8L2xpPlxuLy8gIDwvdWw+XG4vL1xuLy8gIDxkaXYgaWQ9XCJwYW5lbDFcIiBjbGFzcz1cIm1zcHAtcGFuZWxcIj5cbi8vICAgICAgPGRpdiBpZD1cInBhZ2UxMVwiIGNsYXNzPVwibXNwcC1wYWdlIGN1cnJlbnRcIj5cbi8vICAgICAgICAgIFRoaXMgaXMgdGhlIGN1cnJlbnQgcGFnZSBvbiBwYW5lbCAxLlxuLy8gICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgZGF0YS10YXJnZXRwYWdlPVwicGFnZTEyXCI+c2hvdyBwYWdlIDI8L2J1dHRvbj5cbi8vICAgICAgPC9kaXY+XG4vLyAgICAgIDxkaXYgaWQ9XCJwYWdlMTJcIiBjbGFzcz1cIm1zcHAtcGFnZVwiPlxuLy8gICAgICAgICAgVGhpcyBpcyB0aGUgb3RoZXIgcGFnZSBvbiBwYW5lbCAxLlxuLy8gICAgICAgICAgPGEgZGF0YS10YXJnZXRwYWdlPVwicGFnZTExXCI+c2VlIHRoZSBmaXJzdCBwYWdlIGFnYWluPC9hPlxuLy8gICAgICA8L2Rpdj5cbi8vICA8L2Rpdj5cbi8vICA8ZGl2IGlkPVwicGFuZWwyXCIgY2xhc3M9XCJtc3BwLXBhbmVsXCI+XG4vLyAgICAgIDxkaXYgaWQ9XCJwYWdlMjFcIiBjbGFzcz1cIm1zcHAtcGFnZSBjdXJyZW50XCI+XG4vLyAgICAgICAgICBUaGlzIGlzIHRoZSBjdXJyZW50IHBhZ2Ugb24gcGFuZWwgMi5cbi8vICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGRhdGEtdGFyZ2V0cGFnZT1cInBhZ2UyMlwiPnNob3cgcGFnZSAyPC9idXR0b24+XG4vLyAgICAgIDwvZGl2PlxuLy8gICAgICA8ZGl2IGlkPVwicGFnZTIyXCIgY2xhc3M9XCJtc3BwLXBhZ2VcIj5cbi8vICAgICAgICAgIFRoaXMgaXMgdGhlIG90aGVyIHBhZ2Ugb24gcGFuZWwgMi5cbi8vICAgICAgICAgIDxhIGRhdGEtdGFyZ2V0cGFnZT1cInBhZ2UyMVwiPnNlZSB0aGUgZmlyc3QgcGFnZSBhZ2FpbjwvYT5cbi8vICAgICAgPC9kaXY+XG4vLyAgPC9kaXY+XG5cblxuOyggZnVuY3Rpb24oJCwgd2luZG93LCBkb2N1bWVudCwgdW5kZWZpbmVkKSB7XG5cbiAgICAvLyBuYW1lc3BhY2UgY2xpbWFzLCB3aWRnZXQgbmFtZSBtc3BwXG4gICAgLy8gc2Vjb25kIGFyZyBpcyB1c2VkIGFzIHRoZSB3aWRnZXQncyBcInByb3RvdHlwZVwiIG9iamVjdFxuICAgICQud2lkZ2V0KCBcImNsaW1hcy5tc3BwXCIgLCB7XG5cbiAgICAgICAgLy9PcHRpb25zIHRvIGJlIHVzZWQgYXMgZGVmYXVsdHNcbiAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgICAgYW5pbWF0aW9uRmFjdG9yOiAyLFxuXG4gICAgICAgICAgICBtYWluTWVudUNsYXNzOiAnbXNwcC1tYWluLW1lbnUnLFxuXG4gICAgICAgICAgICBwYW5lbENsYXNzOiAnbXNwcC1wYW5lbCcsXG4gICAgICAgICAgICBwYWdlQ2xhc3M6ICdtc3BwLXBhZ2UnLFxuXG4gICAgICAgICAgICBjbGVhcmZpeENsYXNzOiAnbXNwcC1jbGVhcmZpeCcsXG4gICAgICAgICAgICBhY3RpdmVDbGFzczogJ2N1cnJlbnQnXG4gICAgICAgIH0sXG4gICAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgICAgLy9TZXR1cCB3aWRnZXQgKGVnLiBlbGVtZW50IGNyZWF0aW9uLCBhcHBseSB0aGVtaW5nXG4gICAgICAgIC8vICwgYmluZCBldmVudHMgZXRjLilcbiAgICAgICAgX2NyZWF0ZTogZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgIHZhciBiYXNlID0gdGhpcztcbiAgICAgICAgICAgIHZhciBvcHRzID0gdGhpcy5vcHRpb25zO1xuXG4gICAgICAgICAgICAvLyBwb3B1bGF0ZSBzb21lIGNvbnZlbmllbmNlIHZhcmlhYmxlc1xuICAgICAgICAgICAgdmFyICRtZW51ID0gdGhpcy5lbGVtZW50O1xuICAgICAgICAgICAgdGhpcy5tYWluTWVudUl0ZW1zID0gJG1lbnUuY2hpbGRyZW4oJ2xpJyk7XG4gICAgICAgICAgICB0aGlzLnBhbmVscyA9ICQoJy4nICsgb3B0cy5wYW5lbENsYXNzKTtcblxuICAgICAgICAgICAgLy8gZGlzYXBwZWFyIHdoaWxlIHdlIHNvcnQgdGhpbmdzIG91dFxuICAgICAgICAgICAgJG1lbnUuY3NzKHsgb3BhY2l0eTogMCB9KTtcbiAgICAgICAgICAgIHRoaXMucGFuZWxzLmNzcyh7IG9wYWNpdHk6IDAgfSk7XG5cbiAgICAgICAgICAgIC8vIG1ha2Ugc29tZSBET00gbW9kc1xuICAgICAgICAgICAgJG1lbnUuYWRkQ2xhc3Mob3B0cy5tYWluTWVudUNsYXNzKTtcbiAgICAgICAgICAgICRtZW51LmFkZENsYXNzKG9wdHMuY2xlYXJmaXhDbGFzcyk7XG4gICAgICAgICAgICB0aGlzLnBhbmVscy5hZGRDbGFzcyhvcHRzLmNsZWFyZml4Q2xhc3MpO1xuXG4gICAgICAgICAgICAvLyBsYXlvdXQgdGhlIG1lbnVcbiAgICAgICAgICAgIHRoaXMuX2xheW91dE1lbnUoKTtcblxuICAgICAgICAgICAgLy8gbGF5b3V0IHRoZSBwYW5lbHNcbiAgICAgICAgICAgIHRoaXMuX2xheW91dFBhbmVscygpO1xuXG4gICAgICAgICAgICAvLyBob29rIHVwIGNsaWNrIGhhbmRsaW5nIGV0Y1xuICAgICAgICAgICAgJG1lbnUub24oJ21zcHBzaG93bWVudScsIHRoaXMuX3Nob3dNZW51KTtcbiAgICAgICAgICAgICRtZW51Lm9uKCdtc3Bwc2hvd3N1Ym1lbnUnLCB0aGlzLl9zaG93U3ViTWVudSk7XG4gICAgICAgICAgICAkbWVudS5vbignbXNwcHNob3dwYW5lbCcsIHRoaXMuX3Nob3dQYW5lbCk7XG4gICAgICAgICAgICAkbWVudS5vbignbXNwcHNob3dwYWdlJywgdGhpcy5fc2hvd1BhZ2UpO1xuXG4gICAgICAgICAgICAvLyBhdHRhY2ggaGFuZGxlcnMgdG8gdGhlIG1lbnUtdHJpZ2dlcnNcbiAgICAgICAgICAgIHRoaXMubWFpbk1lbnVJdGVtcy5lYWNoKCBmdW5jdGlvbihpbmRleCwgaXRlbSkge1xuICAgICAgICAgICAgICAgIC8vIHRoZSBsaSBtZW51IGl0ZW0gaGFzIGEgY2hpbGQgYSB0aGF0IGlzIGl0J3MgdHJpZ2dlclxuICAgICAgICAgICAgICAgICQoaXRlbSkuY2hpbGRyZW4oJ2EnKS5jbGljayggZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgYmFzZS5fdHJpZ2dlcignc2hvd21lbnUnLCBldmVudCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgbWVudWl0ZW06IGl0ZW0sXG4gICAgICAgICAgICAgICAgICAgICAgICB3aWRnZXQ6IGJhc2VcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgLy8gYXR0YWNoIGhhbmRsZXJzIHRvIHRoZSBzdWJtZW51IGl0ZW1zXG4gICAgICAgICAgICAgICAgJChpdGVtKS5maW5kKCdsaScpLmVhY2goIGZ1bmN0aW9uKGluZGV4LCBzdWJNZW51SXRlbSkge1xuICAgICAgICAgICAgICAgICAgICAkKHN1Yk1lbnVJdGVtKS5maW5kKCdhJykuY2xpY2soIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBiYXNlLl90cmlnZ2VyKCdzaG93c3VibWVudScsIGV2ZW50LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVudWl0ZW06IGl0ZW0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3VibWVudWl0ZW06IHN1Yk1lbnVJdGVtLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpZGdldDogYmFzZVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIGF0dGFjaCBoYW5kbGVycyB0byB0aGUgcGFuZWwgdHJpZ2dlcnNcbiAgICAgICAgICAgICRtZW51LmZpbmQoJ1tkYXRhLXRhcmdldHBhbmVsXScpLmVhY2goIGZ1bmN0aW9uKGluZGV4LCB0cmlnZ2VyKSB7XG4gICAgICAgICAgICAgICAgdmFyICR0cmlnZ2VyID0kKHRyaWdnZXIpO1xuICAgICAgICAgICAgICAgICR0cmlnZ2VyLmNsaWNrKCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgICAgICAgICBiYXNlLl90cmlnZ2VyKCdzaG93cGFuZWwnLCBldmVudCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgcGFuZWw6ICQoJyMnICsgJHRyaWdnZXIuZGF0YSgndGFyZ2V0cGFuZWwnKSkuZmlyc3QoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpZGdldDogYmFzZVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBhdHRhY2ggaGFuZGxlcnMgdG8gdGhlIHBhZ2Ugc3dpdGNoZXJzXG4gICAgICAgICAgICB0aGlzLnBhbmVscy5lYWNoKCBmdW5jdGlvbihpbmRleCwgcGFuZWwpIHtcbiAgICAgICAgICAgICAgICB2YXIgJHBhbmVsID0gJChwYW5lbCk7XG4gICAgICAgICAgICAgICAgJHBhbmVsLmZpbmQoJ1tkYXRhLXRhcmdldHBhZ2VdJykuY2xpY2soIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIGJhc2UuX3RyaWdnZXIoJ3Nob3dwYWdlJywgZXZlbnQsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhbmVsOiAkcGFuZWwsXG4gICAgICAgICAgICAgICAgICAgICAgICBwYWdlOiAkKCcjJyArICQodGhpcykuZGF0YSgndGFyZ2V0cGFnZScpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpZGdldDogYmFzZVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBhY3RpdmF0ZSB0aGUgY3VycmVudCBtZW51cywgcGFuZWxzIGV0Y1xuICAgICAgICAgICAgdmFyICRjdXJyZW50TWFpbiA9IHRoaXMubWFpbk1lbnVJdGVtcy5maWx0ZXIoJy4nICsgb3B0cy5hY3RpdmVDbGFzcyk7XG4gICAgICAgICAgICAkY3VycmVudE1haW4ucmVtb3ZlQ2xhc3Mob3B0cy5hY3RpdmVDbGFzcykuY2hpbGRyZW4oJ2EnKS5jbGljaygpO1xuXG4gICAgICAgICAgICAvLyBmaW5hbGx5LCBmYWRlIGJhY2sgaW5cbiAgICAgICAgICAgICRtZW51LmFuaW1hdGUoeyBvcGFjaXR5OiAxIH0sICdmYXN0Jyk7XG5cbiAgICAgICAgICAgIC8vIHBhbmVscyBzdGF5IGludmlzaWJsZVxuICAgICAgICB9LFxuICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgIF9zd2l0Y2hDbGFzc09wdGlvbjogZnVuY3Rpb24oY2xhc3NOYW1lLCBuZXdDbGFzcykge1xuICAgICAgICAgICAgdmFyIG9sZENsYXNzID0gdGhpcy5vcHRpb25zW2NsYXNzTmFtZV07XG4gICAgICAgICAgICBpZiAob2xkQ2xhc3MgIT09IG5ld0NsYXNzKSB7XG4gICAgICAgICAgICAgICAgdmFyIGdyb3VwID0gdGhpcy5lbGVtZW50LmZpbmQoJy4nICsgb2xkQ2xhc3MpO1xuICAgICAgICAgICAgICAgIHRoaXMub3B0aW9uc1tjbGFzc05hbWVdID0gbmV3Q2xhc3M7XG4gICAgICAgICAgICAgICAgZ3JvdXAucmVtb3ZlQ2xhc3Mob2xkQ2xhc3MpO1xuICAgICAgICAgICAgICAgIGdyb3VwLmFkZENsYXNzKG5ld0NsYXNzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICAvLyBSZXNwb25kIHRvIGFueSBjaGFuZ2VzIHRoZSB1c2VyIG1ha2VzIHRvIHRoZVxuICAgICAgICAvLyBvcHRpb24gbWV0aG9kXG4gICAgICAgIF9zZXRPcHRpb246IGZ1bmN0aW9uKGtleSwgdmFsdWUpIHtcbiAgICAgICAgICAgIHN3aXRjaCAoa2V5KSB7XG4gICAgICAgICAgICAgICAgY2FzZSBcIm1haW5NZW51Q2xhc3NcIjpcbiAgICAgICAgICAgICAgICBjYXNlIFwiY2xlYXJmaXhDbGFzc1wiOlxuICAgICAgICAgICAgICAgIGNhc2UgXCJhY3RpdmVDbGFzc1wiOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9zd2l0Y2hDbGFzc09wdGlvbihrZXksIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnNba2V5XSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAvLyBpdCdzIG9rYXkgdGhhdCB0aGVyZSdzIG5vIH0gaGVyZVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gcmVtZW1iZXIgdG8gY2FsbCBvdXIgc3VwZXIncyBfc2V0T3B0aW9uIG1ldGhvZFxuICAgICAgICAgICAgdGhpcy5fc3VwZXIoIFwiX3NldE9wdGlvblwiLCBrZXksIHZhbHVlICk7XG4gICAgICAgIH0sXG4gICAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgICAgLy8gRGVzdHJveSBhbiBpbnN0YW50aWF0ZWQgcGx1Z2luIGFuZCBjbGVhbiB1cFxuICAgICAgICAvLyBtb2RpZmljYXRpb25zIHRoZSB3aWRnZXQgaGFzIG1hZGUgdG8gdGhlIERPTVxuICAgICAgICBfZGVzdHJveTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQucmVtb3ZlQ2xhc3ModGhpcy5vcHRpb25zLm1haW5NZW51Q2xhc3MpO1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50LnJlbW92ZUNsYXNzKHRoaXMub3B0aW9ucy5jbGVhcmZpeENsYXNzKTtcbiAgICAgICAgICAgIHRoaXMucGFuZWxzLnJlbW92ZUNsYXNzKHRoaXMub3B0aW9ucy5jbGVhcmZpeENsYXNzKTtcbiAgICAgICAgfSxcbiAgICAgICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICAvLyBkbyB0aGUgbGF5b3V0IGNhbGN1bGF0aW9uc1xuICAgICAgICBfbGF5b3V0TWVudTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAvLyBnbyB0aHJvdWdoIGVhY2ggc3VibWVudSBhbmQgcmVjb3JkIGl0cyB3aWR0aFxuICAgICAgICAgICAgdGhpcy5lbGVtZW50LmZpbmQoJ3VsJykuZWFjaCggZnVuY3Rpb24oaW5kZXgsIHN1Yk1lbnUpIHtcbiAgICAgICAgICAgICAgICB2YXIgJHNtID0gJChzdWJNZW51KTtcbiAgICAgICAgICAgICAgICAkc20uY3NzKHt3aWR0aDogJ2F1dG8nfSk7XG4gICAgICAgICAgICAgICAgJHNtLmRhdGEoJ29yaWdpbmFsV2lkdGgnLCAkc20ud2lkdGgoKSk7XG5cbiAgICAgICAgICAgICAgICAvLyBsZWF2ZSBlYWNoIHN1Ym1lbnUgaGlkZGVuLCB3aXRoIHdpZHRoIDBcbiAgICAgICAgICAgICAgICAkc20uY3NzKHsgd2lkdGg6IDAsIGRpc3BsYXk6ICdub25lJyB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgIF9zaG93TWVudTogZnVuY3Rpb24oZXZlbnQsIGRhdGEpIHtcbiAgICAgICAgICAgIHZhciAkaXRlbSA9ICQoZGF0YS5tZW51aXRlbSk7XG4gICAgICAgICAgICB2YXIgYmFzZSA9IGRhdGEud2lkZ2V0O1xuICAgICAgICAgICAgLy8gJGl0ZW0gaXMgYSBjbGlja2VkLW9uIG1lbnUgaXRlbS4uXG4gICAgICAgICAgICBpZiAoJGl0ZW0uaGFzQ2xhc3MoYmFzZS5vcHRpb25zLmFjdGl2ZUNsYXNzKSkge1xuICAgICAgICAgICAgICAgIC8vID8/XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGJhc2UuX2hpZGVQYW5lbHMoKTtcbiAgICAgICAgICAgICAgICBiYXNlLm1haW5NZW51SXRlbXMucmVtb3ZlQ2xhc3MoYmFzZS5vcHRpb25zLmFjdGl2ZUNsYXNzKTtcbiAgICAgICAgICAgICAgICB2YXIgJG5ld1N1Yk1lbnUgPSAkaXRlbS5maW5kKCd1bCcpO1xuICAgICAgICAgICAgICAgIHZhciAkb2xkU3ViTWVudXMgPSBiYXNlLmVsZW1lbnQuZmluZCgndWwnKS5ub3QoJG5ld1N1Yk1lbnUpO1xuICAgICAgICAgICAgICAgIHZhciBuZXdXaWR0aCA9ICRuZXdTdWJNZW51LmRhdGEoJ29yaWdpbmFsV2lkdGgnKTtcblxuICAgICAgICAgICAgICAgICRvbGRTdWJNZW51cy5hbmltYXRlKHsgd2lkdGg6IDAgfSwgKDUwICogYmFzZS5vcHRpb25zLmFuaW1hdGlvbkZhY3RvciksIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAkb2xkU3ViTWVudXMuY3NzKHsgZGlzcGxheTogJ25vbmUnIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICRpdGVtLmFkZENsYXNzKGJhc2Uub3B0aW9ucy5hY3RpdmVDbGFzcyk7XG4gICAgICAgICAgICAgICAgJG5ld1N1Yk1lbnVcbiAgICAgICAgICAgICAgICAgICAgLmNzcyh7ZGlzcGxheTogJ2Jsb2NrJyB9KVxuICAgICAgICAgICAgICAgICAgICAuYW5pbWF0ZSh7IHdpZHRoOiBuZXdXaWR0aCB9LCAoMTI1ICogYmFzZS5vcHRpb25zLmFuaW1hdGlvbkZhY3RvciksIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgJG5ld1N1Yk1lbnUuY3NzKHsgd2lkdGg6ICdhdXRvJyB9KS5yZW1vdmVBdHRyKCdzdHlsZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYmFzZS5fdHJpZ2dlcignbWVudXNob3duJywgZXZlbnQsIHsgaXRlbTogJGl0ZW0sIHdpZGdldDogYmFzZSB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICA7XG4gICAgICAgICAgICAgICAgLy8gaWYgdGhlIG5ldyBzdWJtZW51IGhhcyBhbiBhY3RpdmUgaXRlbSwgY2xpY2sgaXRcbiAgICAgICAgICAgICAgICAkbmV3U3ViTWVudS5maW5kKCcuJyArIGJhc2Uub3B0aW9ucy5hY3RpdmVDbGFzcyArICcgYScpLmNsaWNrKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgICAgX3Nob3dTdWJNZW51OiBmdW5jdGlvbihldmVudCwgZGF0YSkge1xuICAgICAgICAgICAgLy8gZGUtYWN0aXZlaWZ5IGFsbCB0aGUgc3VibWVudSBpdGVtc1xuICAgICAgICAgICAgJChkYXRhLm1lbnVpdGVtKS5maW5kKCdsaScpLnJlbW92ZUNsYXNzKGRhdGEud2lkZ2V0Lm9wdGlvbnMuYWN0aXZlQ2xhc3MpO1xuICAgICAgICAgICAgLy8gYWN0aXZlLWlmeSB0aGUgb25lIHRydWUgc3VibWVudSBpdGVtXG4gICAgICAgICAgICAkKGRhdGEuc3VibWVudWl0ZW0pLmFkZENsYXNzKGRhdGEud2lkZ2V0Lm9wdGlvbnMuYWN0aXZlQ2xhc3MpO1xuICAgICAgICB9LFxuICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgIC8vIGRvIHRoZSBsYXlvdXQgY2FsY3VsYXRpb25zXG4gICAgICAgIF9sYXlvdXRQYW5lbHM6IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICB2YXIgJHBhZ2VzID0gdGhpcy5wYW5lbHMuZmluZCgnLicgKyB0aGlzLm9wdGlvbnMucGFnZUNsYXNzKTtcblxuICAgICAgICAgICAgLy8gZ28gdGhyb3VnaCBlYWNoIHBhZ2UgYW5kIHJlY29yZCBpdHMgaGVpZ2h0XG4gICAgICAgICAgICAkcGFnZXMuZWFjaCggZnVuY3Rpb24oaW5kZXgsIHBhZ2UpIHtcbiAgICAgICAgICAgICAgICB2YXIgJHBhZ2UgPSAkKHBhZ2UpO1xuICAgICAgICAgICAgICAgICRwYWdlLmNzcyh7aGVpZ2h0OiAnYXV0byd9KTtcbiAgICAgICAgICAgICAgICAkcGFnZS5kYXRhKCdvcmlnaW5hbEhlaWdodCcsICRwYWdlLm91dGVySGVpZ2h0KCkpO1xuXG4gICAgICAgICAgICAgICAgLy8gbGVhdmUgZWFjaCBwYWdlIGhpZGRlbiwgd2l0aCBoZWlnaHQgMFxuICAgICAgICAgICAgICAgICRwYWdlLmNzcyh7IGhlaWdodDogMCwgZGlzcGxheTogJ25vbmUnIH0pO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIGdvIHRocm91Z2ggZWFjaCBwYW5lbCBhbmQgaGlkZSBpdFxuICAgICAgICAgICAgdGhpcy5wYW5lbHMuZWFjaCggZnVuY3Rpb24oaW5kZXgsIHBhbmVsKSB7XG4gICAgICAgICAgICAgICAgdmFyICRwYW5lbCA9ICQocGFuZWwpO1xuICAgICAgICAgICAgICAgICRwYW5lbC5jc3MoeyBkaXNwbGF5OiAnbm9uZScgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICBfaGlkZVBhbmVsczogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLnBhbmVscy5yZW1vdmVDbGFzcyh0aGlzLm9wdGlvbnMuYWN0aXZlQ2xhc3MpLmNzcyh7IGRpc3BsYXk6ICdub25lJywgaGVpZ2h0OiAwIH0pO1xuICAgICAgICB9LFxuICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgIF9zaG93UGFuZWw6IGZ1bmN0aW9uKGV2ZW50LCBkYXRhKSB7XG4gICAgICAgICAgICB2YXIgJHBhbmVsID0gJChkYXRhLnBhbmVsKTtcbiAgICAgICAgICAgIHZhciBiYXNlID0gZGF0YS53aWRnZXQ7XG4gICAgICAgICAgICAvLyAkcGFuZWwgaXMgYSBwYW5lbCB0byBzaG93Li5cbiAgICAgICAgICAgIGlmICgkcGFuZWwuaGFzQ2xhc3MoYmFzZS5vcHRpb25zLmFjdGl2ZUNsYXNzKSkge1xuICAgICAgICAgICAgICAgIC8vID8/XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGJhc2UuX2hpZGVQYW5lbHMoKTtcbiAgICAgICAgICAgICAgICAkcGFuZWwuYWRkQ2xhc3MoYmFzZS5vcHRpb25zLmFjdGl2ZUNsYXNzKTtcbiAgICAgICAgICAgICAgICAkcGFuZWwuY3NzKHsgZGlzcGxheTogJ2Jsb2NrJywgb3BhY2l0eTogMSB9KTtcbiAgICAgICAgICAgICAgICB2YXIgJHBhZ2UgPSAkKCRwYW5lbC5maW5kKCcuJyArIGJhc2Uub3B0aW9ucy5wYWdlQ2xhc3MgKyAnLicgKyBiYXNlLm9wdGlvbnMuYWN0aXZlQ2xhc3MpKTtcbiAgICAgICAgICAgICAgICBiYXNlLl90cmlnZ2VyKCdzaG93cGFnZScsIGV2ZW50LCB7IHBhbmVsOiAkcGFuZWwsIHBhZ2U6ICRwYWdlLCB3aWRnZXQ6IGJhc2UgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgICAgX3Nob3dQYWdlOiBmdW5jdGlvbihldmVudCwgZGF0YSkge1xuICAgICAgICAgICAgdmFyIGJhc2UgPSBkYXRhLndpZGdldDtcbiAgICAgICAgICAgIHZhciAkcGFuZWwgPSAkKGRhdGEucGFuZWwpO1xuICAgICAgICAgICAgdmFyICRwYWdlID0gJChkYXRhLnBhZ2UpO1xuICAgICAgICAgICAgdmFyIG5ld0hlaWdodCA9ICRwYWdlLmRhdGEoJ29yaWdpbmFsSGVpZ2h0Jyk7XG5cbiAgICAgICAgICAgIC8vIGZpeCB0aGUgcGFuZWwncyBjdXJyZW50IGhlaWdodFxuICAgICAgICAgICAgJHBhbmVsLmNzcyh7aGVpZ2h0OiAkcGFuZWwuaGVpZ2h0KCkgfSk7XG5cbiAgICAgICAgICAgIC8vIGRlYWwgd2l0aCB0aGUgcGFnZSBjdXJyZW50bHkgYmVpbmcgZGlzcGxheWVkXG4gICAgICAgICAgICB2YXIgJG9sZFBhZ2UgPSAkcGFuZWwuZmluZCgnLicgKyBiYXNlLm9wdGlvbnMucGFnZUNsYXNzICsgJy4nICsgYmFzZS5vcHRpb25zLmFjdGl2ZUNsYXNzKS5ub3QoJHBhZ2UpO1xuICAgICAgICAgICAgaWYgKCRvbGRQYWdlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAkb2xkUGFnZS5kYXRhKCdvcmlnaW5hbEhlaWdodCcsICRvbGRQYWdlLm91dGVySGVpZ2h0KCkpO1xuICAgICAgICAgICAgICAgICRvbGRQYWdlLnJlbW92ZUNsYXNzKGJhc2Uub3B0aW9ucy5hY3RpdmVDbGFzcykuZmFkZU91dCgoNTAgKiBiYXNlLm9wdGlvbnMuYW5pbWF0aW9uRmFjdG9yKSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICRvbGRQYWdlLmNzcyh7IGhlaWdodDogMCB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gc3dpdGNoIG9uIHRoZSBuZXcgcGFnZSBhbmQgZ3JvdyB0aGUgb3BhbmVsIHRvIGhvbGQgaXRcbiAgICAgICAgICAgICRwYWdlLmNzcyh7IGhlaWdodDogJ2F1dG8nIH0pLmFkZENsYXNzKGJhc2Uub3B0aW9ucy5hY3RpdmVDbGFzcykuZmFkZUluKCgxMDAgKiBiYXNlLm9wdGlvbnMuYW5pbWF0aW9uRmFjdG9yKSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgJHBhZ2UucmVtb3ZlQXR0cignc3R5bGUnKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdmFyIGFuaW1UaW1lID0gKCRvbGRQYWdlLmxlbmd0aCA+IDAgPyAoMTAwICogYmFzZS5vcHRpb25zLmFuaW1hdGlvbkZhY3RvcikgOiAoMTUwICogYmFzZS5vcHRpb25zLmFuaW1hdGlvbkZhY3RvcikpOyAvLyBhbmltYXRlIGZhc3RlciBpZiBpdCdzIHN3aXRjaGluZyBwYWdlc1xuICAgICAgICAgICAgJHBhbmVsLmFuaW1hdGUoeyBoZWlnaHQ6IG5ld0hlaWdodCB9LCBhbmltVGltZSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgJHBhbmVsLnJlbW92ZUF0dHIoJ3N0eWxlJyk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB9LFxuICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgIF86IG51bGwgLy8gbm8gZm9sbG93aW5nIGNvbW1hXG4gICAgfSk7XG5cbn0pKGpRdWVyeSwgd2luZG93LCBkb2N1bWVudCk7XG5cblxuXG5cblxuXG5cblxuXG5cblxuXG4iXX0=
