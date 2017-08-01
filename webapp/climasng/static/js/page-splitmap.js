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
  var AppView, MapLayer, debug;

  MapLayer = require('../models/maplayer');

  require('../util/shims');


  /* jshint -W093 */

  debug = function(itemToLog, itemLevel) {
    var levels, messageNum, threshold, thresholdNum;
    levels = ['verydebug', 'debug', 'message', 'warning'];
    if (!itemLevel) {
      itemLevel = 'debug';
    }
    threshold = 'debug';
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
    climateDataUrl: window.mapConfig.climateDataUrl,
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
      'change input.right': 'rightSideUpdate',
      'change #sync': 'toggleSync'
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
      this.nameIndex = {};
      return this.mapList = {};
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
        zoom: 2
      });
      this.map.on('move', this.resizeThings);
      L.tileLayer('//server.arcgisonline.com/ArcGIS/rest/services/{variant}/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri',
        variant: 'World_Topo_Map'
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
      this.rightSideUpdate();
      return this.toggleSplitter();
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
      this.$('#rightmapspp').val(this.leftInfo.mapName);
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
      this.$('#leftmapspp').val(this.rightInfo.mapName);
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
      var atBaseline, currInfo, newInfo;
      debug('AppView.sideUpdate (' + side + ')');
      newInfo = {
        mapName: this.$('#' + side + 'mapspp').val(),
        degs: this.$('#' + side + 'mapdegs').val(),
        range: this.$('input[name=' + side + 'maprange]:checked').val(),
        confidence: this.$('#' + side + 'mapconfidence').val()
      };
      atBaseline = newInfo.degs === 'baseline';
      this.$("input[name=" + side + "maprange], #" + side + "mapconfidence").prop('disabled', atBaseline);
      this.$("." + side + ".side.form fieldset").removeClass('disabled');
      this.$("input[name^=" + side + "]:disabled, [id^=" + side + "]:disabled").closest('fieldset').addClass('disabled');
      if (newInfo.mapName in this.nameIndex) {
        this.$("." + side + "-valid-map").removeClass('disabled').prop('disabled', false);
      } else {
        this.$("." + side + "-valid-map").addClass('disabled').prop('disabled', true);
        return false;
      }
      currInfo = side === 'left' ? this.leftInfo : this.rightInfo;
      if (currInfo && _.isEqual(newInfo, currInfo)) {
        return false;
      }
      if (currInfo && newInfo.mapName === currInfo.mapName && newInfo.degs === currInfo.degs && newInfo.degs === 'baseline') {
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
      this.sideUpdate('left');
      if (this.$('#sync')[0].checked) {
        debug('Sync checked - syncing right side', 'message');
        return this.copySppToRightSide();
      }
    },
    rightSideUpdate: function() {
      return this.sideUpdate('right');
    },
    copySppToRightSide: function() {
      this.$('#rightmapspp').val(this.$('#leftmapspp').val());
      return this.rightSideUpdate();
    },
    addMapTag: function(side) {
      var dispLookup, info, tag;
      debug('AppView.addMapTag');
      if (side === 'left') {
        info = this.leftInfo;
      }
      if (side === 'right') {
        info = this.rightInfo;
      }
      tag = "<b><i>" + info.mapName + "</i></b>";
      dispLookup = {
        '0disp': 'no range adaptation',
        '50disp': '50 years of range adaptation',
        '100disp': '100 years of range adaptation'
      };
      if (info.degs === 'baseline') {
        tag = "baseline " + tag + " distribution";
      } else {
        tag = "<b>" + info.confidence + "</b> percentile projections for " + tag + " at <b>+" + info.degs + "&deg;C</b> with <b>" + dispLookup[info.range] + "</b>";
      }
      if (side === 'left') {
        this.leftTag.find('.leftlayername').html(tag);
      }
      if (side === 'right') {
        return this.rightTag.find('.rightlayername').html(tag);
      }
    },
    addMapLayer: function(side) {
      var ext, futureModelPoint, layer, loadClass, mapInfo, mapUrl, projectionName, sideInfo, url, zipUrl;
      debug('AppView.addMapLayer');
      if (side === 'left') {
        sideInfo = this.leftInfo;
      }
      if (side === 'right') {
        sideInfo = this.rightInfo;
      }
      futureModelPoint = '';
      mapUrl = '';
      zipUrl = '';
      projectionName = "TEMP_" + sideInfo.degs + "_" + sideInfo.confidence + "." + sideInfo.range;
      if (sideInfo.degs === 'baseline') {
        projectionName = 'current';
      }
      mapInfo = this.mapList[this.nameIndex[sideInfo.mapName]];
      if (mapInfo) {
        url = this.speciesDataUrl;
        ext = '.tif';
        if (mapInfo.type === 'climate') {
          url = this.climateDataUrl;
          ext = '.asc';
        }
        mapUrl = [
          this.resolvePlaceholders(url, {
            path: mapInfo.path
          }), projectionName + ext
        ].join('/');
      } else {
        console.log("Can't map that -- no '" + sideInfo.mapName + "' in index");
      }
      this.$('#' + side + 'mapdl').attr('href', mapUrl);
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
      if (window.location.hostname === 'localhost') {
        return console.log('map URL is: ', mapUrl);
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
    toggleSync: function() {
      debug('AppView.toggleSync');
      if (this.$('#sync')[0].checked) {
        this.$('.rightmapspp').prop('disabled', true);
        return this.copySppToRightSide();
      } else {
        return this.$('.rightmapspp').prop('disabled', false);
      }
    },
    fetchSpeciesInfo: function() {
      return debug('AppView.fetchSpeciesInfo');
    },
    fetchBiodivInfo: function() {
      return debug('AppView.fetchBiodivInfo');
    },
    buildLeftForm: function() {
      var $leftmapspp;
      debug('AppView.buildLeftForm');
      $leftmapspp = this.$('#leftmapspp');
      return $leftmapspp.autocomplete({
        close: (function(_this) {
          return function() {
            return _this.$el.trigger('rightmapupdate');
          };
        })(this),
        source: (function(_this) {
          return function(req, response) {
            return $.ajax({
              url: '/api/namesearch/',
              data: {
                term: req.term
              },
              success: function(answer) {
                var info, nice, selectable;
                selectable = [];
                for (nice in answer) {
                  info = answer[nice];
                  selectable.push(nice);
                  _this.mapList[info.mapId] = info;
                  _this.nameIndex[nice] = info.mapId;
                }
                console.log(answer);
                console.log(selectable);
                return response(selectable);
              }
            });
          };
        })(this)
      });
    },
    buildRightForm: function() {
      var $rightmapspp;
      debug('AppView.buildRightForm');
      $rightmapspp = this.$('#rightmapspp');
      return $rightmapspp.autocomplete({
        close: (function(_this) {
          return function() {
            return _this.$el.trigger('rightmapupdate');
          };
        })(this),
        source: (function(_this) {
          return function(req, response) {
            return $.ajax({
              url: '/api/namesearch/',
              data: {
                term: req.term
              },
              success: function(answer) {
                var info, nice, selectable;
                selectable = [];
                for (nice in answer) {
                  info = answer[nice];
                  selectable.push(nice);
                  _this.mapList[info.mapId] = info;
                  _this.nameIndex[nice] = info.mapId;
                }
                console.log(answer);
                console.log(selectable);
                return response(selectable);
              }
            });
          };
        })(this)
      });
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
      layout: _.template("<div clas=\"ui-front\"></div>\n<div class=\"splitline\">&nbsp;</div>\n<div class=\"splitthumb\"><span>&#x276e; &#x276f;</span></div>\n<div class=\"left tag\"><%= leftTag %></div>\n<div class=\"right tag\"><%= rightTag %></div>\n<div class=\"left side form\"><%= leftForm %></div>\n<div class=\"right side form\"><%= rightForm %></div>\n<div class=\"left loader\"><img src=\"/static/images/spinner.loadinfo.net.gif\" /></div>\n<div class=\"right loader\"><img src=\"/static/images/spinner.loadinfo.net.gif\" /></div>\n<div id=\"mapwrapper\"><div id=\"map\"></div></div>"),
      leftTag: _.template("<div class=\"show\">\n    <span class=\"leftlayername\">plain map</span>\n    <br>\n    <button class=\"btn-change\">settings</button>\n    <button class=\"btn-compare\">show/hide comparison map</button>\n</div>\n<div class=\"edit\">\n    <label class=\"left syncbox\"></label>\n    <input id=\"leftmapspp\" class=\"left\" type=\"text\" name=\"leftmapspp\" placeholder=\"&hellip; species or group &hellip;\" />\n</div>"),
      rightTag: _.template("<div class=\"show\">\n    <span class=\"rightlayername\">(no distribution)</span>\n    <br>\n    <button class=\"btn-change\">settings</button>\n    <button class=\"btn-compare\">show/hide comparison map</button>\n</div>\n<div class=\"edit\">\n    <label class=\"right syncbox\"><input id=\"sync\" type=\"checkbox\" value=\"sync\" checked=\"checked\" /> same as left side</label>\n    <input id=\"rightmapspp\" type=\"text\" class=\"right\" name=\"rightmapspp\" placeholder=\"&hellip; species or group &hellip;\" />\n</div>"),
      leftForm: _.template("<fieldset>\n    <legend>temperature change</legend>\n    <select class=\"left\" id=\"leftmapdegs\">\n        <option value=\"baseline\">baseline</option>\n        <option value=\"1.5\">1.5 &deg;C</option>\n        <option value=\"2\">2.0 &deg;C</option>\n        <option value=\"2.7\">2.7 &deg;C</option>\n        <option value=\"3.2\">3.2 &deg;C</option>\n        <option value=\"4.5\">4.5 &deg;C</option>\n        <optgroup label=\"High sensitivity climate\">\n            <option value=\"6\">6.0 &deg;C</option>\n        </optgroup>\n    </select>\n</fieldset>\n<fieldset>\n    <legend>adaptation via range shift</legend>\n    <label><!-- span>none</span --> <input name=\"leftmaprange\" class=\"left\" type=\"radio\" value=\"no.disp\" checked=\"checked\"> species cannot shift ranges</label>\n    <label><!-- span>allow</span --> <input name=\"leftmaprange\" class=\"left\" type=\"radio\" value=\"real.disp\"> allow range adaptation</label>\n</fieldset>\n<fieldset>\n    <legend>model summary</legend>\n    <select class=\"left\" id=\"leftmapconfidence\">\n        <option value=\"10\">10th percentile</option>\n        <!-- option value=\"33\">33rd percentile</option -->\n        <option value=\"50\" selected=\"selected\">50th percentile</option>\n        <!-- option value=\"66\">66th percentile</option -->\n        <option value=\"90\">90th percentile</option>\n    </select>\n</fieldset>\n<fieldset class=\"blank\">\n    <button type=\"button\" class=\"btn-change\">hide settings</button>\n    <button type=\"button\" class=\"btn-compare\">hide/show right map</button>\n    <button type=\"button\" class=\"btn-copy right-valid-map\">copy right map &laquo;</button>\n    <a id=\"leftmapdl\" class=\"download left-valid-map\" href=\"\" disabled=\"disabled\">download just this map<br>(<1Mb GeoTIFF)</a>\n</fieldset>\n"),
      rightForm: _.template("<fieldset>\n    <legend>temperature change</legend>\n    <select class=\"right\" id=\"rightmapdegs\">\n        <option value=\"baseline\">baseline</option>\n        <option value=\"1.5\">1.5 &deg;C</option>\n        <option value=\"2\">2.0 &deg;C</option>\n        <option value=\"2.7\">2.7 &deg;C</option>\n        <option value=\"3.2\">3.2 &deg;C</option>\n        <option value=\"4.5\">4.5 &deg;C</option>\n        <optgroup label=\"High sensitivity climate\">\n            <option value=\"6\">6.0 &deg;C</option>\n        </optgroup>\n    </select>\n</fieldset>\n<fieldset>\n    <legend>adaptation via range shift</legend>\n    <label><!-- span>none</span --> <input name=\"rightmaprange\" class=\"right\" type=\"radio\" value=\"no.disp\" checked=\"checked\"> species cannot shift ranges</label>\n    <label><!-- span>allow</span --> <input name=\"rightmaprange\" class=\"right\" type=\"radio\" value=\"real.disp\"> allow range adaptation</label>\n</fieldset>\n<fieldset>\n    <legend>model summary</legend>\n    <select class=\"right\" id=\"rightmapconfidence\">\n        <option value=\"10\">10th percentile</option>\n        <!-- option value=\"33\">33rd percentile</option -->\n        <option value=\"50\" selected=\"selected\">50th percentile</option>\n        <!-- option value=\"66\">66th percentile</option -->\n        <option value=\"90\">90th percentile</option>\n    </select>\n</fieldset>\n<fieldset class=\"blank\">\n    <button type=\"button\" class=\"btn-change\">hide settings</button>\n    <button type=\"button\" class=\"btn-compare\">hide/show right map</button>\n    <button type=\"button\" class=\"btn-copy left-valid-map\">copy left map &laquo;</button>\n    <a id=\"rightmapdl\" class=\"download right-valid-map\" href=\"\" disabled=\"disabled\">download just this map<br>(<1Mb GeoTIFF)</a>\n</fieldset>\n")
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9wdnJkd2IvcHJvamVjdHMvY2xpbWFzLWdsb2JhbC93ZWJhcHAvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi9Vc2Vycy9wdnJkd2IvcHJvamVjdHMvY2xpbWFzLWdsb2JhbC93ZWJhcHAvY2xpbWFzbmcvc3JjL2pzL2Zha2VfOWMxNzY5MjUuanMiLCIvVXNlcnMvcHZyZHdiL3Byb2plY3RzL2NsaW1hcy1nbG9iYWwvd2ViYXBwL2NsaW1hc25nL3NyYy9qcy9tYXB2aWV3L21haW4uanMiLCIvVXNlcnMvcHZyZHdiL3Byb2plY3RzL2NsaW1hcy1nbG9iYWwvd2ViYXBwL2NsaW1hc25nL3NyYy9qcy9tYXB2aWV3L21vZGVscy9tYXBsYXllci5qcyIsIi9Vc2Vycy9wdnJkd2IvcHJvamVjdHMvY2xpbWFzLWdsb2JhbC93ZWJhcHAvY2xpbWFzbmcvc3JjL2pzL21hcHZpZXcvdXRpbC9zaGltcy5qcyIsIi9Vc2Vycy9wdnJkd2IvcHJvamVjdHMvY2xpbWFzLWdsb2JhbC93ZWJhcHAvY2xpbWFzbmcvc3JjL2pzL21hcHZpZXcvdmlld3MvYXBwLmpzIiwiL1VzZXJzL3B2cmR3Yi9wcm9qZWN0cy9jbGltYXMtZ2xvYmFsL3dlYmFwcC9jbGltYXNuZy9zcmMvanMvbWVudXNhbmRwYW5lbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNWVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlxucmVxdWlyZSgnLi9tYXB2aWV3L21haW4nKTtcbnJlcXVpcmUoJy4vbWVudXNhbmRwYW5lbHMnKTtcblxuJChmdW5jdGlvbigpIHtcbiAgICAvLyAkKCdoZWFkZXInKS5kaXNhYmxlU2VsZWN0aW9uKCk7IC8vIHVucG9wdWxhciBidXQgc3RpbGwgYmV0dGVyXG4gICAgJCgnbmF2ID4gdWwnKS5tc3BwKHt9KTtcbn0pO1xuIiwiKGZ1bmN0aW9uKCkge1xuICB2YXIgQXBwVmlldztcblxuICBpZiAoIXdpbmRvdy5jb25zb2xlKSB7XG4gICAgd2luZG93LmNvbnNvbGUgPSB7XG4gICAgICBsb2c6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4ge307XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIEFwcFZpZXcgPSByZXF1aXJlKCcuL3ZpZXdzL2FwcCcpO1xuXG4gICQoZnVuY3Rpb24oKSB7XG4gICAgdmFyIGFwcHZpZXc7XG4gICAgYXBwdmlldyA9IG5ldyBBcHBWaWV3KCk7XG4gICAgcmV0dXJuIGFwcHZpZXcucmVuZGVyKCk7XG4gIH0pO1xuXG59KS5jYWxsKHRoaXMpO1xuIiwiKGZ1bmN0aW9uKCkge1xuICB2YXIgTWFwTGF5ZXI7XG5cbiAgTWFwTGF5ZXIgPSBCYWNrYm9uZS5Nb2RlbC5leHRlbmQoe1xuICAgIGNvbnN0cnVjdG9yOiBmdW5jdGlvbihzaG9ydE5hbWUsIGxvbmdOYW1lLCBwYXRoKSB7XG4gICAgICB0aGlzLnNob3J0TmFtZSA9IHNob3J0TmFtZTtcbiAgICAgIHRoaXMubG9uZ05hbWUgPSBsb25nTmFtZTtcbiAgICAgIHRoaXMucGF0aCA9IHBhdGg7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH0pO1xuXG4gIG1vZHVsZS5leHBvcnRzID0gTWFwTGF5ZXI7XG5cbn0pLmNhbGwodGhpcyk7XG4iLCIoZnVuY3Rpb24oKSB7XG4gIHZhciBfX2luZGV4T2YgPSBbXS5pbmRleE9mIHx8IGZ1bmN0aW9uKGl0ZW0pIHsgZm9yICh2YXIgaSA9IDAsIGwgPSB0aGlzLmxlbmd0aDsgaSA8IGw7IGkrKykgeyBpZiAoaSBpbiB0aGlzICYmIHRoaXNbaV0gPT09IGl0ZW0pIHJldHVybiBpOyB9IHJldHVybiAtMTsgfTtcblxuICBpZiAoIUFycmF5LnByb3RvdHlwZS5mb3JFYWNoKSB7XG4gICAgQXJyYXkucHJvdG90eXBlLmZvckVhY2ggPSBmdW5jdGlvbihmbiwgc2NvcGUpIHtcbiAgICAgIHZhciBpLCBfaSwgX3JlZiwgX3Jlc3VsdHM7XG4gICAgICBfcmVzdWx0cyA9IFtdO1xuICAgICAgZm9yIChpID0gX2kgPSAwLCBfcmVmID0gdGhpcy5sZW5ndGg7IDAgPD0gX3JlZiA/IF9pIDw9IF9yZWYgOiBfaSA+PSBfcmVmOyBpID0gMCA8PSBfcmVmID8gKytfaSA6IC0tX2kpIHtcbiAgICAgICAgX3Jlc3VsdHMucHVzaChfX2luZGV4T2YuY2FsbCh0aGlzLCBpKSA+PSAwID8gZm4uY2FsbChzY29wZSwgdGhpc1tpXSwgaSwgdGhpcykgOiB2b2lkIDApO1xuICAgICAgfVxuICAgICAgcmV0dXJuIF9yZXN1bHRzO1xuICAgIH07XG4gIH1cblxuICBpZiAoIUFycmF5LnByb3RvdHlwZS5pbmRleE9mKSB7XG4gICAgQXJyYXkucHJvdG90eXBlLmluZGV4T2YgPSBmdW5jdGlvbihuZWVkbGUpIHtcbiAgICAgIHZhciBpLCBfaSwgX3JlZjtcbiAgICAgIGZvciAoaSA9IF9pID0gMCwgX3JlZiA9IHRoaXMubGVuZ3RoOyAwIDw9IF9yZWYgPyBfaSA8PSBfcmVmIDogX2kgPj0gX3JlZjsgaSA9IDAgPD0gX3JlZiA/ICsrX2kgOiAtLV9pKSB7XG4gICAgICAgIGlmICh0aGlzW2ldID09PSBuZWVkbGUpIHtcbiAgICAgICAgICByZXR1cm4gaTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIC0xO1xuICAgIH07XG4gIH1cblxufSkuY2FsbCh0aGlzKTtcbiIsIihmdW5jdGlvbigpIHtcbiAgdmFyIEFwcFZpZXcsIE1hcExheWVyLCBkZWJ1ZztcblxuICBNYXBMYXllciA9IHJlcXVpcmUoJy4uL21vZGVscy9tYXBsYXllcicpO1xuXG4gIHJlcXVpcmUoJy4uL3V0aWwvc2hpbXMnKTtcblxuXG4gIC8qIGpzaGludCAtVzA5MyAqL1xuXG4gIGRlYnVnID0gZnVuY3Rpb24oaXRlbVRvTG9nLCBpdGVtTGV2ZWwpIHtcbiAgICB2YXIgbGV2ZWxzLCBtZXNzYWdlTnVtLCB0aHJlc2hvbGQsIHRocmVzaG9sZE51bTtcbiAgICBsZXZlbHMgPSBbJ3ZlcnlkZWJ1ZycsICdkZWJ1ZycsICdtZXNzYWdlJywgJ3dhcm5pbmcnXTtcbiAgICBpZiAoIWl0ZW1MZXZlbCkge1xuICAgICAgaXRlbUxldmVsID0gJ2RlYnVnJztcbiAgICB9XG4gICAgdGhyZXNob2xkID0gJ2RlYnVnJztcbiAgICB0aHJlc2hvbGROdW0gPSBsZXZlbHMuaW5kZXhPZih0aHJlc2hvbGQpO1xuICAgIG1lc3NhZ2VOdW0gPSBsZXZlbHMuaW5kZXhPZihpdGVtTGV2ZWwpO1xuICAgIGlmICh0aHJlc2hvbGROdW0gPiBtZXNzYWdlTnVtKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChpdGVtVG9Mb2cgKyAnJyA9PT0gaXRlbVRvTG9nKSB7XG4gICAgICByZXR1cm4gY29uc29sZS5sb2coXCJbXCIgKyBpdGVtTGV2ZWwgKyBcIl0gXCIgKyBpdGVtVG9Mb2cpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gY29uc29sZS5sb2coaXRlbVRvTG9nKTtcbiAgICB9XG4gIH07XG5cbiAgQXBwVmlldyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcbiAgICB0YWdOYW1lOiAnZGl2JyxcbiAgICBjbGFzc05hbWU6ICdzcGxpdG1hcCBzaG93Zm9ybXMnLFxuICAgIGlkOiAnc3BsaXRtYXAnLFxuICAgIHNwZWNpZXNEYXRhVXJsOiB3aW5kb3cubWFwQ29uZmlnLnNwZWNpZXNEYXRhVXJsLFxuICAgIGNsaW1hdGVEYXRhVXJsOiB3aW5kb3cubWFwQ29uZmlnLmNsaW1hdGVEYXRhVXJsLFxuICAgIGJpb2RpdkRhdGFVcmw6IHdpbmRvdy5tYXBDb25maWcuYmlvZGl2RGF0YVVybCxcbiAgICByYXN0ZXJBcGlVcmw6IHdpbmRvdy5tYXBDb25maWcucmFzdGVyQXBpVXJsLFxuICAgIHRyYWNrU3BsaXR0ZXI6IGZhbHNlLFxuICAgIHRyYWNrUGVyaW9kOiAxMDAsXG4gICAgZXZlbnRzOiB7XG4gICAgICAnY2xpY2sgLmJ0bi1jaGFuZ2UnOiAndG9nZ2xlRm9ybXMnLFxuICAgICAgJ2NsaWNrIC5idG4tY29tcGFyZSc6ICd0b2dnbGVTcGxpdHRlcicsXG4gICAgICAnY2xpY2sgLmJ0bi1jb3B5LmxlZnQtdmFsaWQtbWFwJzogJ2NvcHlNYXBMZWZ0VG9SaWdodCcsXG4gICAgICAnY2xpY2sgLmJ0bi1jb3B5LnJpZ2h0LXZhbGlkLW1hcCc6ICdjb3B5TWFwUmlnaHRUb0xlZnQnLFxuICAgICAgJ2xlZnRtYXB1cGRhdGUnOiAnbGVmdFNpZGVVcGRhdGUnLFxuICAgICAgJ3JpZ2h0bWFwdXBkYXRlJzogJ3JpZ2h0U2lkZVVwZGF0ZScsXG4gICAgICAnY2hhbmdlIHNlbGVjdC5sZWZ0JzogJ2xlZnRTaWRlVXBkYXRlJyxcbiAgICAgICdjaGFuZ2Ugc2VsZWN0LnJpZ2h0JzogJ3JpZ2h0U2lkZVVwZGF0ZScsXG4gICAgICAnY2hhbmdlIGlucHV0LmxlZnQnOiAnbGVmdFNpZGVVcGRhdGUnLFxuICAgICAgJ2NoYW5nZSBpbnB1dC5yaWdodCc6ICdyaWdodFNpZGVVcGRhdGUnLFxuICAgICAgJ2NoYW5nZSAjc3luYyc6ICd0b2dnbGVTeW5jJ1xuICAgIH0sXG4gICAgdGljazogZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoZmFsc2UpIHtcbiAgICAgICAgZGVidWcodGhpcy5sZWZ0SW5mby5zY2VuYXJpbyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkZWJ1ZygndGljaycpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHNldFRpbWVvdXQodGhpcy50aWNrLCAxMDAwKTtcbiAgICB9LFxuICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xuICAgICAgZGVidWcoJ0FwcFZpZXcuaW5pdGlhbGl6ZScpO1xuICAgICAgXy5iaW5kQWxsLmFwcGx5KF8sIFt0aGlzXS5jb25jYXQoXy5mdW5jdGlvbnModGhpcykpKTtcbiAgICAgIHRoaXMubmFtZUluZGV4ID0ge307XG4gICAgICByZXR1cm4gdGhpcy5tYXBMaXN0ID0ge307XG4gICAgfSxcbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgZGVidWcoJ0FwcFZpZXcucmVuZGVyJyk7XG4gICAgICB0aGlzLiRlbC5hcHBlbmQoQXBwVmlldy50ZW1wbGF0ZXMubGF5b3V0KHtcbiAgICAgICAgbGVmdFRhZzogQXBwVmlldy50ZW1wbGF0ZXMubGVmdFRhZygpLFxuICAgICAgICByaWdodFRhZzogQXBwVmlldy50ZW1wbGF0ZXMucmlnaHRUYWcoKSxcbiAgICAgICAgbGVmdEZvcm06IEFwcFZpZXcudGVtcGxhdGVzLmxlZnRGb3JtKCksXG4gICAgICAgIHJpZ2h0Rm9ybTogQXBwVmlldy50ZW1wbGF0ZXMucmlnaHRGb3JtKClcbiAgICAgIH0pKTtcbiAgICAgICQoJyNjb250ZW50d3JhcCcpLmFwcGVuZCh0aGlzLiRlbCk7XG4gICAgICB0aGlzLm1hcCA9IEwubWFwKCdtYXAnLCB7XG4gICAgICAgIGNlbnRlcjogWzAsIDBdLFxuICAgICAgICB6b29tOiAyXG4gICAgICB9KTtcbiAgICAgIHRoaXMubWFwLm9uKCdtb3ZlJywgdGhpcy5yZXNpemVUaGluZ3MpO1xuICAgICAgTC50aWxlTGF5ZXIoJy8vc2VydmVyLmFyY2dpc29ubGluZS5jb20vQXJjR0lTL3Jlc3Qvc2VydmljZXMve3ZhcmlhbnR9L01hcFNlcnZlci90aWxlL3t6fS97eX0ve3h9Jywge1xuICAgICAgICBhdHRyaWJ1dGlvbjogJ1RpbGVzICZjb3B5OyBFc3JpJyxcbiAgICAgICAgdmFyaWFudDogJ1dvcmxkX1RvcG9fTWFwJ1xuICAgICAgfSkuYWRkVG8odGhpcy5tYXApO1xuICAgICAgdGhpcy5sZWZ0Rm9ybSA9IHRoaXMuJCgnLmxlZnQuZm9ybScpO1xuICAgICAgdGhpcy5idWlsZExlZnRGb3JtKCk7XG4gICAgICB0aGlzLnJpZ2h0Rm9ybSA9IHRoaXMuJCgnLnJpZ2h0LmZvcm0nKTtcbiAgICAgIHRoaXMuYnVpbGRSaWdodEZvcm0oKTtcbiAgICAgIHRoaXMubGVmdFRhZyA9IHRoaXMuJCgnLmxlZnQudGFnJyk7XG4gICAgICB0aGlzLnJpZ2h0VGFnID0gdGhpcy4kKCcucmlnaHQudGFnJyk7XG4gICAgICB0aGlzLnNwbGl0TGluZSA9IHRoaXMuJCgnLnNwbGl0bGluZScpO1xuICAgICAgdGhpcy5zcGxpdFRodW1iID0gdGhpcy4kKCcuc3BsaXR0aHVtYicpO1xuICAgICAgdGhpcy5sZWZ0U2lkZVVwZGF0ZSgpO1xuICAgICAgdGhpcy5yaWdodFNpZGVVcGRhdGUoKTtcbiAgICAgIHJldHVybiB0aGlzLnRvZ2dsZVNwbGl0dGVyKCk7XG4gICAgfSxcbiAgICByZXNvbHZlUGxhY2Vob2xkZXJzOiBmdW5jdGlvbihzdHJXaXRoUGxhY2Vob2xkZXJzLCByZXBsYWNlbWVudHMpIHtcbiAgICAgIHZhciBhbnMsIGtleSwgcmUsIHZhbHVlO1xuICAgICAgYW5zID0gc3RyV2l0aFBsYWNlaG9sZGVycztcbiAgICAgIGFucyA9IGFucy5yZXBsYWNlKC9cXHtcXHtcXHMqbG9jYXRpb24ucHJvdG9jb2xcXHMqXFx9XFx9L2csIGxvY2F0aW9uLnByb3RvY29sKTtcbiAgICAgIGFucyA9IGFucy5yZXBsYWNlKC9cXHtcXHtcXHMqbG9jYXRpb24uaG9zdFxccypcXH1cXH0vZywgbG9jYXRpb24uaG9zdCk7XG4gICAgICBhbnMgPSBhbnMucmVwbGFjZSgvXFx7XFx7XFxzKmxvY2F0aW9uLmhvc3RuYW1lXFxzKlxcfVxcfS9nLCBsb2NhdGlvbi5ob3N0bmFtZSk7XG4gICAgICBmb3IgKGtleSBpbiByZXBsYWNlbWVudHMpIHtcbiAgICAgICAgdmFsdWUgPSByZXBsYWNlbWVudHNba2V5XTtcbiAgICAgICAgcmUgPSBuZXcgUmVnRXhwKFwiXFxcXHtcXFxce1xcXFxzKlwiICsga2V5ICsgXCJcXFxccypcXFxcfVxcXFx9XCIsIFwiZ1wiKTtcbiAgICAgICAgYW5zID0gYW5zLnJlcGxhY2UocmUsIHZhbHVlKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBhbnM7XG4gICAgfSxcbiAgICBjb3B5TWFwTGVmdFRvUmlnaHQ6IGZ1bmN0aW9uKCkge1xuICAgICAgZGVidWcoJ0FwcFZpZXcuY29weU1hcExlZnRUb1JpZ2h0Jyk7XG4gICAgICBpZiAoIXRoaXMubGVmdEluZm8pIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdGhpcy4kKCcjcmlnaHRtYXBzcHAnKS52YWwodGhpcy5sZWZ0SW5mby5tYXBOYW1lKTtcbiAgICAgIHRoaXMuJCgnI3JpZ2h0bWFweWVhcicpLnZhbCh0aGlzLmxlZnRJbmZvLnllYXIpO1xuICAgICAgdGhpcy4kKCdpbnB1dFtuYW1lPXJpZ2h0bWFwc2NlbmFyaW9dJykuZWFjaCgoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGluZGV4LCBpdGVtKSB7XG4gICAgICAgICAgcmV0dXJuICQoaXRlbSkucHJvcCgnY2hlY2tlZCcsICQoaXRlbSkudmFsKCkgPT09IF90aGlzLmxlZnRJbmZvLnNjZW5hcmlvKTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKTtcbiAgICAgIHRoaXMuJCgnI3JpZ2h0bWFwZ2NtJykudmFsKHRoaXMubGVmdEluZm8uZ2NtKTtcbiAgICAgIHJldHVybiB0aGlzLnJpZ2h0U2lkZVVwZGF0ZSgpO1xuICAgIH0sXG4gICAgY29weU1hcFJpZ2h0VG9MZWZ0OiBmdW5jdGlvbigpIHtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LmNvcHlNYXBSaWdodFRvTGVmdCcpO1xuICAgICAgaWYgKCF0aGlzLnJpZ2h0SW5mbykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB0aGlzLiQoJyNsZWZ0bWFwc3BwJykudmFsKHRoaXMucmlnaHRJbmZvLm1hcE5hbWUpO1xuICAgICAgdGhpcy4kKCcjbGVmdG1hcHllYXInKS52YWwodGhpcy5yaWdodEluZm8ueWVhcik7XG4gICAgICB0aGlzLiQoJ2lucHV0W25hbWU9bGVmdG1hcHNjZW5hcmlvXScpLmVhY2goKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihpbmRleCwgaXRlbSkge1xuICAgICAgICAgIHJldHVybiAkKGl0ZW0pLnByb3AoJ2NoZWNrZWQnLCAkKGl0ZW0pLnZhbCgpID09PSBfdGhpcy5yaWdodEluZm8uc2NlbmFyaW8pO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpO1xuICAgICAgdGhpcy4kKCcjbGVmdG1hcGdjbScpLnZhbCh0aGlzLnJpZ2h0SW5mby5nY20pO1xuICAgICAgcmV0dXJuIHRoaXMubGVmdFNpZGVVcGRhdGUoKTtcbiAgICB9LFxuICAgIHNpZGVVcGRhdGU6IGZ1bmN0aW9uKHNpZGUpIHtcbiAgICAgIHZhciBhdEJhc2VsaW5lLCBjdXJySW5mbywgbmV3SW5mbztcbiAgICAgIGRlYnVnKCdBcHBWaWV3LnNpZGVVcGRhdGUgKCcgKyBzaWRlICsgJyknKTtcbiAgICAgIG5ld0luZm8gPSB7XG4gICAgICAgIG1hcE5hbWU6IHRoaXMuJCgnIycgKyBzaWRlICsgJ21hcHNwcCcpLnZhbCgpLFxuICAgICAgICBkZWdzOiB0aGlzLiQoJyMnICsgc2lkZSArICdtYXBkZWdzJykudmFsKCksXG4gICAgICAgIHJhbmdlOiB0aGlzLiQoJ2lucHV0W25hbWU9JyArIHNpZGUgKyAnbWFwcmFuZ2VdOmNoZWNrZWQnKS52YWwoKSxcbiAgICAgICAgY29uZmlkZW5jZTogdGhpcy4kKCcjJyArIHNpZGUgKyAnbWFwY29uZmlkZW5jZScpLnZhbCgpXG4gICAgICB9O1xuICAgICAgYXRCYXNlbGluZSA9IG5ld0luZm8uZGVncyA9PT0gJ2Jhc2VsaW5lJztcbiAgICAgIHRoaXMuJChcImlucHV0W25hbWU9XCIgKyBzaWRlICsgXCJtYXByYW5nZV0sICNcIiArIHNpZGUgKyBcIm1hcGNvbmZpZGVuY2VcIikucHJvcCgnZGlzYWJsZWQnLCBhdEJhc2VsaW5lKTtcbiAgICAgIHRoaXMuJChcIi5cIiArIHNpZGUgKyBcIi5zaWRlLmZvcm0gZmllbGRzZXRcIikucmVtb3ZlQ2xhc3MoJ2Rpc2FibGVkJyk7XG4gICAgICB0aGlzLiQoXCJpbnB1dFtuYW1lXj1cIiArIHNpZGUgKyBcIl06ZGlzYWJsZWQsIFtpZF49XCIgKyBzaWRlICsgXCJdOmRpc2FibGVkXCIpLmNsb3Nlc3QoJ2ZpZWxkc2V0JykuYWRkQ2xhc3MoJ2Rpc2FibGVkJyk7XG4gICAgICBpZiAobmV3SW5mby5tYXBOYW1lIGluIHRoaXMubmFtZUluZGV4KSB7XG4gICAgICAgIHRoaXMuJChcIi5cIiArIHNpZGUgKyBcIi12YWxpZC1tYXBcIikucmVtb3ZlQ2xhc3MoJ2Rpc2FibGVkJykucHJvcCgnZGlzYWJsZWQnLCBmYWxzZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLiQoXCIuXCIgKyBzaWRlICsgXCItdmFsaWQtbWFwXCIpLmFkZENsYXNzKCdkaXNhYmxlZCcpLnByb3AoJ2Rpc2FibGVkJywgdHJ1ZSk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIGN1cnJJbmZvID0gc2lkZSA9PT0gJ2xlZnQnID8gdGhpcy5sZWZ0SW5mbyA6IHRoaXMucmlnaHRJbmZvO1xuICAgICAgaWYgKGN1cnJJbmZvICYmIF8uaXNFcXVhbChuZXdJbmZvLCBjdXJySW5mbykpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgaWYgKGN1cnJJbmZvICYmIG5ld0luZm8ubWFwTmFtZSA9PT0gY3VyckluZm8ubWFwTmFtZSAmJiBuZXdJbmZvLmRlZ3MgPT09IGN1cnJJbmZvLmRlZ3MgJiYgbmV3SW5mby5kZWdzID09PSAnYmFzZWxpbmUnKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIGlmIChzaWRlID09PSAnbGVmdCcpIHtcbiAgICAgICAgdGhpcy5sZWZ0SW5mbyA9IG5ld0luZm87XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnJpZ2h0SW5mbyA9IG5ld0luZm87XG4gICAgICB9XG4gICAgICB0aGlzLmFkZE1hcExheWVyKHNpZGUpO1xuICAgICAgcmV0dXJuIHRoaXMuYWRkTWFwVGFnKHNpZGUpO1xuICAgIH0sXG4gICAgbGVmdFNpZGVVcGRhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zaWRlVXBkYXRlKCdsZWZ0Jyk7XG4gICAgICBpZiAodGhpcy4kKCcjc3luYycpWzBdLmNoZWNrZWQpIHtcbiAgICAgICAgZGVidWcoJ1N5bmMgY2hlY2tlZCAtIHN5bmNpbmcgcmlnaHQgc2lkZScsICdtZXNzYWdlJyk7XG4gICAgICAgIHJldHVybiB0aGlzLmNvcHlTcHBUb1JpZ2h0U2lkZSgpO1xuICAgICAgfVxuICAgIH0sXG4gICAgcmlnaHRTaWRlVXBkYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLnNpZGVVcGRhdGUoJ3JpZ2h0Jyk7XG4gICAgfSxcbiAgICBjb3B5U3BwVG9SaWdodFNpZGU6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy4kKCcjcmlnaHRtYXBzcHAnKS52YWwodGhpcy4kKCcjbGVmdG1hcHNwcCcpLnZhbCgpKTtcbiAgICAgIHJldHVybiB0aGlzLnJpZ2h0U2lkZVVwZGF0ZSgpO1xuICAgIH0sXG4gICAgYWRkTWFwVGFnOiBmdW5jdGlvbihzaWRlKSB7XG4gICAgICB2YXIgZGlzcExvb2t1cCwgaW5mbywgdGFnO1xuICAgICAgZGVidWcoJ0FwcFZpZXcuYWRkTWFwVGFnJyk7XG4gICAgICBpZiAoc2lkZSA9PT0gJ2xlZnQnKSB7XG4gICAgICAgIGluZm8gPSB0aGlzLmxlZnRJbmZvO1xuICAgICAgfVxuICAgICAgaWYgKHNpZGUgPT09ICdyaWdodCcpIHtcbiAgICAgICAgaW5mbyA9IHRoaXMucmlnaHRJbmZvO1xuICAgICAgfVxuICAgICAgdGFnID0gXCI8Yj48aT5cIiArIGluZm8ubWFwTmFtZSArIFwiPC9pPjwvYj5cIjtcbiAgICAgIGRpc3BMb29rdXAgPSB7XG4gICAgICAgICcwZGlzcCc6ICdubyByYW5nZSBhZGFwdGF0aW9uJyxcbiAgICAgICAgJzUwZGlzcCc6ICc1MCB5ZWFycyBvZiByYW5nZSBhZGFwdGF0aW9uJyxcbiAgICAgICAgJzEwMGRpc3AnOiAnMTAwIHllYXJzIG9mIHJhbmdlIGFkYXB0YXRpb24nXG4gICAgICB9O1xuICAgICAgaWYgKGluZm8uZGVncyA9PT0gJ2Jhc2VsaW5lJykge1xuICAgICAgICB0YWcgPSBcImJhc2VsaW5lIFwiICsgdGFnICsgXCIgZGlzdHJpYnV0aW9uXCI7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0YWcgPSBcIjxiPlwiICsgaW5mby5jb25maWRlbmNlICsgXCI8L2I+IHBlcmNlbnRpbGUgcHJvamVjdGlvbnMgZm9yIFwiICsgdGFnICsgXCIgYXQgPGI+K1wiICsgaW5mby5kZWdzICsgXCImZGVnO0M8L2I+IHdpdGggPGI+XCIgKyBkaXNwTG9va3VwW2luZm8ucmFuZ2VdICsgXCI8L2I+XCI7XG4gICAgICB9XG4gICAgICBpZiAoc2lkZSA9PT0gJ2xlZnQnKSB7XG4gICAgICAgIHRoaXMubGVmdFRhZy5maW5kKCcubGVmdGxheWVybmFtZScpLmh0bWwodGFnKTtcbiAgICAgIH1cbiAgICAgIGlmIChzaWRlID09PSAncmlnaHQnKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJpZ2h0VGFnLmZpbmQoJy5yaWdodGxheWVybmFtZScpLmh0bWwodGFnKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGFkZE1hcExheWVyOiBmdW5jdGlvbihzaWRlKSB7XG4gICAgICB2YXIgZXh0LCBmdXR1cmVNb2RlbFBvaW50LCBsYXllciwgbG9hZENsYXNzLCBtYXBJbmZvLCBtYXBVcmwsIHByb2plY3Rpb25OYW1lLCBzaWRlSW5mbywgdXJsLCB6aXBVcmw7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5hZGRNYXBMYXllcicpO1xuICAgICAgaWYgKHNpZGUgPT09ICdsZWZ0Jykge1xuICAgICAgICBzaWRlSW5mbyA9IHRoaXMubGVmdEluZm87XG4gICAgICB9XG4gICAgICBpZiAoc2lkZSA9PT0gJ3JpZ2h0Jykge1xuICAgICAgICBzaWRlSW5mbyA9IHRoaXMucmlnaHRJbmZvO1xuICAgICAgfVxuICAgICAgZnV0dXJlTW9kZWxQb2ludCA9ICcnO1xuICAgICAgbWFwVXJsID0gJyc7XG4gICAgICB6aXBVcmwgPSAnJztcbiAgICAgIHByb2plY3Rpb25OYW1lID0gXCJURU1QX1wiICsgc2lkZUluZm8uZGVncyArIFwiX1wiICsgc2lkZUluZm8uY29uZmlkZW5jZSArIFwiLlwiICsgc2lkZUluZm8ucmFuZ2U7XG4gICAgICBpZiAoc2lkZUluZm8uZGVncyA9PT0gJ2Jhc2VsaW5lJykge1xuICAgICAgICBwcm9qZWN0aW9uTmFtZSA9ICdjdXJyZW50JztcbiAgICAgIH1cbiAgICAgIG1hcEluZm8gPSB0aGlzLm1hcExpc3RbdGhpcy5uYW1lSW5kZXhbc2lkZUluZm8ubWFwTmFtZV1dO1xuICAgICAgaWYgKG1hcEluZm8pIHtcbiAgICAgICAgdXJsID0gdGhpcy5zcGVjaWVzRGF0YVVybDtcbiAgICAgICAgZXh0ID0gJy50aWYnO1xuICAgICAgICBpZiAobWFwSW5mby50eXBlID09PSAnY2xpbWF0ZScpIHtcbiAgICAgICAgICB1cmwgPSB0aGlzLmNsaW1hdGVEYXRhVXJsO1xuICAgICAgICAgIGV4dCA9ICcuYXNjJztcbiAgICAgICAgfVxuICAgICAgICBtYXBVcmwgPSBbXG4gICAgICAgICAgdGhpcy5yZXNvbHZlUGxhY2Vob2xkZXJzKHVybCwge1xuICAgICAgICAgICAgcGF0aDogbWFwSW5mby5wYXRoXG4gICAgICAgICAgfSksIHByb2plY3Rpb25OYW1lICsgZXh0XG4gICAgICAgIF0uam9pbignLycpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJDYW4ndCBtYXAgdGhhdCAtLSBubyAnXCIgKyBzaWRlSW5mby5tYXBOYW1lICsgXCInIGluIGluZGV4XCIpO1xuICAgICAgfVxuICAgICAgdGhpcy4kKCcjJyArIHNpZGUgKyAnbWFwZGwnKS5hdHRyKCdocmVmJywgbWFwVXJsKTtcbiAgICAgIGxheWVyID0gTC50aWxlTGF5ZXIud21zKHRoaXMucmVzb2x2ZVBsYWNlaG9sZGVycyh0aGlzLnJhc3RlckFwaVVybCksIHtcbiAgICAgICAgREFUQV9VUkw6IG1hcFVybCxcbiAgICAgICAgbGF5ZXJzOiAnREVGQVVMVCcsXG4gICAgICAgIGZvcm1hdDogJ2ltYWdlL3BuZycsXG4gICAgICAgIHRyYW5zcGFyZW50OiB0cnVlXG4gICAgICB9KTtcbiAgICAgIGxvYWRDbGFzcyA9ICcnICsgc2lkZSArICdsb2FkaW5nJztcbiAgICAgIGxheWVyLm9uKCdsb2FkaW5nJywgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gX3RoaXMuJGVsLmFkZENsYXNzKGxvYWRDbGFzcyk7XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKSk7XG4gICAgICBsYXllci5vbignbG9hZCcsIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuIF90aGlzLiRlbC5yZW1vdmVDbGFzcyhsb2FkQ2xhc3MpO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpO1xuICAgICAgaWYgKHNpZGUgPT09ICdsZWZ0Jykge1xuICAgICAgICBpZiAodGhpcy5sZWZ0TGF5ZXIpIHtcbiAgICAgICAgICB0aGlzLm1hcC5yZW1vdmVMYXllcih0aGlzLmxlZnRMYXllcik7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5sZWZ0TGF5ZXIgPSBsYXllcjtcbiAgICAgIH1cbiAgICAgIGlmIChzaWRlID09PSAncmlnaHQnKSB7XG4gICAgICAgIGlmICh0aGlzLnJpZ2h0TGF5ZXIpIHtcbiAgICAgICAgICB0aGlzLm1hcC5yZW1vdmVMYXllcih0aGlzLnJpZ2h0TGF5ZXIpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucmlnaHRMYXllciA9IGxheWVyO1xuICAgICAgfVxuICAgICAgbGF5ZXIuYWRkVG8odGhpcy5tYXApO1xuICAgICAgdGhpcy5yZXNpemVUaGluZ3MoKTtcbiAgICAgIGlmICh3aW5kb3cubG9jYXRpb24uaG9zdG5hbWUgPT09ICdsb2NhbGhvc3QnKSB7XG4gICAgICAgIHJldHVybiBjb25zb2xlLmxvZygnbWFwIFVSTCBpczogJywgbWFwVXJsKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGNlbnRyZU1hcDogZnVuY3Rpb24ocmVwZWF0ZWRseUZvcikge1xuICAgICAgdmFyIGxhdGVyLCByZWNlbnRyZSwgX2ksIF9yZXN1bHRzO1xuICAgICAgZGVidWcoJ0FwcFZpZXcuY2VudHJlTWFwJyk7XG4gICAgICBpZiAoIXJlcGVhdGVkbHlGb3IpIHtcbiAgICAgICAgcmVwZWF0ZWRseUZvciA9IDUwMDtcbiAgICAgIH1cbiAgICAgIHJlY2VudHJlID0gKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICBfdGhpcy5tYXAuaW52YWxpZGF0ZVNpemUoZmFsc2UpO1xuICAgICAgICAgIHJldHVybiBfdGhpcy5yZXNpemVUaGluZ3MoKTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpO1xuICAgICAgX3Jlc3VsdHMgPSBbXTtcbiAgICAgIGZvciAobGF0ZXIgPSBfaSA9IDA7IF9pIDw9IHJlcGVhdGVkbHlGb3I7IGxhdGVyID0gX2kgKz0gMjUpIHtcbiAgICAgICAgX3Jlc3VsdHMucHVzaChzZXRUaW1lb3V0KHJlY2VudHJlLCBsYXRlcikpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIF9yZXN1bHRzO1xuICAgIH0sXG4gICAgdG9nZ2xlRm9ybXM6IGZ1bmN0aW9uKCkge1xuICAgICAgZGVidWcoJ0FwcFZpZXcudG9nZ2xlRm9ybXMnKTtcbiAgICAgIHRoaXMuJGVsLnRvZ2dsZUNsYXNzKCdzaG93Zm9ybXMnKTtcbiAgICAgIHJldHVybiB0aGlzLmNlbnRyZU1hcCgpO1xuICAgIH0sXG4gICAgdG9nZ2xlU3BsaXR0ZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgZGVidWcoJ0FwcFZpZXcudG9nZ2xlU3BsaXR0ZXInKTtcbiAgICAgIHRoaXMuJGVsLnRvZ2dsZUNsYXNzKCdzcGxpdCcpO1xuICAgICAgaWYgKHRoaXMuJGVsLmhhc0NsYXNzKCdzcGxpdCcpKSB7XG4gICAgICAgIHRoaXMuYWN0aXZhdGVTcGxpdHRlcigpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5kZWFjdGl2YXRlU3BsaXR0ZXIoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLmNlbnRyZU1hcCgpO1xuICAgIH0sXG4gICAgdG9nZ2xlU3luYzogZnVuY3Rpb24oKSB7XG4gICAgICBkZWJ1ZygnQXBwVmlldy50b2dnbGVTeW5jJyk7XG4gICAgICBpZiAodGhpcy4kKCcjc3luYycpWzBdLmNoZWNrZWQpIHtcbiAgICAgICAgdGhpcy4kKCcucmlnaHRtYXBzcHAnKS5wcm9wKCdkaXNhYmxlZCcsIHRydWUpO1xuICAgICAgICByZXR1cm4gdGhpcy5jb3B5U3BwVG9SaWdodFNpZGUoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB0aGlzLiQoJy5yaWdodG1hcHNwcCcpLnByb3AoJ2Rpc2FibGVkJywgZmFsc2UpO1xuICAgICAgfVxuICAgIH0sXG4gICAgZmV0Y2hTcGVjaWVzSW5mbzogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gZGVidWcoJ0FwcFZpZXcuZmV0Y2hTcGVjaWVzSW5mbycpO1xuICAgIH0sXG4gICAgZmV0Y2hCaW9kaXZJbmZvOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBkZWJ1ZygnQXBwVmlldy5mZXRjaEJpb2RpdkluZm8nKTtcbiAgICB9LFxuICAgIGJ1aWxkTGVmdEZvcm06IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyICRsZWZ0bWFwc3BwO1xuICAgICAgZGVidWcoJ0FwcFZpZXcuYnVpbGRMZWZ0Rm9ybScpO1xuICAgICAgJGxlZnRtYXBzcHAgPSB0aGlzLiQoJyNsZWZ0bWFwc3BwJyk7XG4gICAgICByZXR1cm4gJGxlZnRtYXBzcHAuYXV0b2NvbXBsZXRlKHtcbiAgICAgICAgY2xvc2U6IChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBfdGhpcy4kZWwudHJpZ2dlcigncmlnaHRtYXB1cGRhdGUnKTtcbiAgICAgICAgICB9O1xuICAgICAgICB9KSh0aGlzKSxcbiAgICAgICAgc291cmNlOiAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgICByZXR1cm4gZnVuY3Rpb24ocmVxLCByZXNwb25zZSkge1xuICAgICAgICAgICAgcmV0dXJuICQuYWpheCh7XG4gICAgICAgICAgICAgIHVybDogJy9hcGkvbmFtZXNlYXJjaC8nLFxuICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgdGVybTogcmVxLnRlcm1cbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24oYW5zd2VyKSB7XG4gICAgICAgICAgICAgICAgdmFyIGluZm8sIG5pY2UsIHNlbGVjdGFibGU7XG4gICAgICAgICAgICAgICAgc2VsZWN0YWJsZSA9IFtdO1xuICAgICAgICAgICAgICAgIGZvciAobmljZSBpbiBhbnN3ZXIpIHtcbiAgICAgICAgICAgICAgICAgIGluZm8gPSBhbnN3ZXJbbmljZV07XG4gICAgICAgICAgICAgICAgICBzZWxlY3RhYmxlLnB1c2gobmljZSk7XG4gICAgICAgICAgICAgICAgICBfdGhpcy5tYXBMaXN0W2luZm8ubWFwSWRdID0gaW5mbztcbiAgICAgICAgICAgICAgICAgIF90aGlzLm5hbWVJbmRleFtuaWNlXSA9IGluZm8ubWFwSWQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGFuc3dlcik7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coc2VsZWN0YWJsZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlKHNlbGVjdGFibGUpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9O1xuICAgICAgICB9KSh0aGlzKVxuICAgICAgfSk7XG4gICAgfSxcbiAgICBidWlsZFJpZ2h0Rm9ybTogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgJHJpZ2h0bWFwc3BwO1xuICAgICAgZGVidWcoJ0FwcFZpZXcuYnVpbGRSaWdodEZvcm0nKTtcbiAgICAgICRyaWdodG1hcHNwcCA9IHRoaXMuJCgnI3JpZ2h0bWFwc3BwJyk7XG4gICAgICByZXR1cm4gJHJpZ2h0bWFwc3BwLmF1dG9jb21wbGV0ZSh7XG4gICAgICAgIGNsb3NlOiAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gX3RoaXMuJGVsLnRyaWdnZXIoJ3JpZ2h0bWFwdXBkYXRlJyk7XG4gICAgICAgICAgfTtcbiAgICAgICAgfSkodGhpcyksXG4gICAgICAgIHNvdXJjZTogKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKHJlcSwgcmVzcG9uc2UpIHtcbiAgICAgICAgICAgIHJldHVybiAkLmFqYXgoe1xuICAgICAgICAgICAgICB1cmw6ICcvYXBpL25hbWVzZWFyY2gvJyxcbiAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgIHRlcm06IHJlcS50ZXJtXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKGFuc3dlcikge1xuICAgICAgICAgICAgICAgIHZhciBpbmZvLCBuaWNlLCBzZWxlY3RhYmxlO1xuICAgICAgICAgICAgICAgIHNlbGVjdGFibGUgPSBbXTtcbiAgICAgICAgICAgICAgICBmb3IgKG5pY2UgaW4gYW5zd2VyKSB7XG4gICAgICAgICAgICAgICAgICBpbmZvID0gYW5zd2VyW25pY2VdO1xuICAgICAgICAgICAgICAgICAgc2VsZWN0YWJsZS5wdXNoKG5pY2UpO1xuICAgICAgICAgICAgICAgICAgX3RoaXMubWFwTGlzdFtpbmZvLm1hcElkXSA9IGluZm87XG4gICAgICAgICAgICAgICAgICBfdGhpcy5uYW1lSW5kZXhbbmljZV0gPSBpbmZvLm1hcElkO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhhbnN3ZXIpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHNlbGVjdGFibGUpO1xuICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZShzZWxlY3RhYmxlKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfTtcbiAgICAgICAgfSkodGhpcylcbiAgICAgIH0pO1xuICAgIH0sXG4gICAgc3RhcnRTcGxpdHRlclRyYWNraW5nOiBmdW5jdGlvbigpIHtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LnN0YXJ0U3BsaXR0ZXJUcmFja2luZycpO1xuICAgICAgdGhpcy50cmFja1NwbGl0dGVyID0gdHJ1ZTtcbiAgICAgIHRoaXMuc3BsaXRMaW5lLmFkZENsYXNzKCdkcmFnZ2luZycpO1xuICAgICAgcmV0dXJuIHRoaXMubG9jYXRlU3BsaXR0ZXIoKTtcbiAgICB9LFxuICAgIGxvY2F0ZVNwbGl0dGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LmxvY2F0ZVNwbGl0dGVyJyk7XG4gICAgICBpZiAodGhpcy50cmFja1NwbGl0dGVyKSB7XG4gICAgICAgIHRoaXMucmVzaXplVGhpbmdzKCk7XG4gICAgICAgIGlmICh0aGlzLnRyYWNrU3BsaXR0ZXIgPT09IDApIHtcbiAgICAgICAgICB0aGlzLnRyYWNrU3BsaXR0ZXIgPSBmYWxzZTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnRyYWNrU3BsaXR0ZXIgIT09IHRydWUpIHtcbiAgICAgICAgICB0aGlzLnRyYWNrU3BsaXR0ZXIgLT0gMTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc2V0VGltZW91dCh0aGlzLmxvY2F0ZVNwbGl0dGVyLCB0aGlzLnRyYWNrUGVyaW9kKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHJlc2l6ZVRoaW5nczogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgJG1hcEJveCwgYm90dG9tUmlnaHQsIGxheWVyQm90dG9tLCBsYXllclRvcCwgbGVmdExlZnQsIGxlZnRNYXAsIG1hcEJvdW5kcywgbWFwQm94LCBuZXdMZWZ0V2lkdGgsIHJpZ2h0TWFwLCByaWdodFJpZ2h0LCBzcGxpdFBvaW50LCBzcGxpdFgsIHRvcExlZnQ7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5yZXNpemVUaGluZ3MnKTtcbiAgICAgIGlmICh0aGlzLmxlZnRMYXllcikge1xuICAgICAgICBsZWZ0TWFwID0gJCh0aGlzLmxlZnRMYXllci5nZXRDb250YWluZXIoKSk7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5yaWdodExheWVyKSB7XG4gICAgICAgIHJpZ2h0TWFwID0gJCh0aGlzLnJpZ2h0TGF5ZXIuZ2V0Q29udGFpbmVyKCkpO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMuJGVsLmhhc0NsYXNzKCdzcGxpdCcpKSB7XG4gICAgICAgIG5ld0xlZnRXaWR0aCA9IHRoaXMuc3BsaXRUaHVtYi5wb3NpdGlvbigpLmxlZnQgKyAodGhpcy5zcGxpdFRodW1iLndpZHRoKCkgLyAyLjApO1xuICAgICAgICBtYXBCb3ggPSB0aGlzLm1hcC5nZXRDb250YWluZXIoKTtcbiAgICAgICAgJG1hcEJveCA9ICQobWFwQm94KTtcbiAgICAgICAgbWFwQm91bmRzID0gbWFwQm94LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICB0b3BMZWZ0ID0gdGhpcy5tYXAuY29udGFpbmVyUG9pbnRUb0xheWVyUG9pbnQoWzAsIDBdKTtcbiAgICAgICAgc3BsaXRQb2ludCA9IHRoaXMubWFwLmNvbnRhaW5lclBvaW50VG9MYXllclBvaW50KFtuZXdMZWZ0V2lkdGgsIDBdKTtcbiAgICAgICAgYm90dG9tUmlnaHQgPSB0aGlzLm1hcC5jb250YWluZXJQb2ludFRvTGF5ZXJQb2ludChbJG1hcEJveC53aWR0aCgpLCAkbWFwQm94LmhlaWdodCgpXSk7XG4gICAgICAgIGxheWVyVG9wID0gdG9wTGVmdC55O1xuICAgICAgICBsYXllckJvdHRvbSA9IGJvdHRvbVJpZ2h0Lnk7XG4gICAgICAgIHNwbGl0WCA9IHNwbGl0UG9pbnQueCAtIG1hcEJvdW5kcy5sZWZ0O1xuICAgICAgICBsZWZ0TGVmdCA9IHRvcExlZnQueCAtIG1hcEJvdW5kcy5sZWZ0O1xuICAgICAgICByaWdodFJpZ2h0ID0gYm90dG9tUmlnaHQueDtcbiAgICAgICAgdGhpcy5zcGxpdExpbmUuY3NzKCdsZWZ0JywgbmV3TGVmdFdpZHRoKTtcbiAgICAgICAgdGhpcy5sZWZ0VGFnLmF0dHIoJ3N0eWxlJywgXCJjbGlwOiByZWN0KDAsIFwiICsgbmV3TGVmdFdpZHRoICsgXCJweCwgYXV0bywgMClcIik7XG4gICAgICAgIGlmICh0aGlzLmxlZnRMYXllcikge1xuICAgICAgICAgIGxlZnRNYXAuYXR0cignc3R5bGUnLCBcImNsaXA6IHJlY3QoXCIgKyBsYXllclRvcCArIFwicHgsIFwiICsgc3BsaXRYICsgXCJweCwgXCIgKyBsYXllckJvdHRvbSArIFwicHgsIFwiICsgbGVmdExlZnQgKyBcInB4KVwiKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5yaWdodExheWVyKSB7XG4gICAgICAgICAgcmV0dXJuIHJpZ2h0TWFwLmF0dHIoJ3N0eWxlJywgXCJjbGlwOiByZWN0KFwiICsgbGF5ZXJUb3AgKyBcInB4LCBcIiArIHJpZ2h0UmlnaHQgKyBcInB4LCBcIiArIGxheWVyQm90dG9tICsgXCJweCwgXCIgKyBzcGxpdFggKyBcInB4KVwiKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5sZWZ0VGFnLmF0dHIoJ3N0eWxlJywgJ2NsaXA6IGluaGVyaXQnKTtcbiAgICAgICAgaWYgKHRoaXMubGVmdExheWVyKSB7XG4gICAgICAgICAgbGVmdE1hcC5hdHRyKCdzdHlsZScsICdjbGlwOiBpbmhlcml0Jyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMucmlnaHRMYXllcikge1xuICAgICAgICAgIHJldHVybiByaWdodE1hcC5hdHRyKCdzdHlsZScsICdjbGlwOiByZWN0KDAsMCwwLDApJyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIHN0b3BTcGxpdHRlclRyYWNraW5nOiBmdW5jdGlvbigpIHtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LnN0b3BTcGxpdHRlclRyYWNraW5nJyk7XG4gICAgICB0aGlzLnNwbGl0TGluZS5yZW1vdmVDbGFzcygnZHJhZ2dpbmcnKTtcbiAgICAgIHJldHVybiB0aGlzLnRyYWNrU3BsaXR0ZXIgPSA1O1xuICAgIH0sXG4gICAgYWN0aXZhdGVTcGxpdHRlcjogZnVuY3Rpb24oKSB7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5hY3RpdmF0ZVNwbGl0dGVyJyk7XG4gICAgICB0aGlzLnNwbGl0VGh1bWIuZHJhZ2dhYmxlKHtcbiAgICAgICAgY29udGFpbm1lbnQ6ICQoJyNtYXB3cmFwcGVyJyksXG4gICAgICAgIHNjcm9sbDogZmFsc2UsXG4gICAgICAgIHN0YXJ0OiB0aGlzLnN0YXJ0U3BsaXR0ZXJUcmFja2luZyxcbiAgICAgICAgZHJhZzogdGhpcy5yZXNpemVUaGluZ3MsXG4gICAgICAgIHN0b3A6IHRoaXMuc3RvcFNwbGl0dGVyVHJhY2tpbmdcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHRoaXMucmVzaXplVGhpbmdzKCk7XG4gICAgfSxcbiAgICBkZWFjdGl2YXRlU3BsaXR0ZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgZGVidWcoJ0FwcFZpZXcuZGVhY3RpdmF0ZVNwbGl0dGVyJyk7XG4gICAgICB0aGlzLnNwbGl0VGh1bWIuZHJhZ2dhYmxlKCdkZXN0cm95Jyk7XG4gICAgICByZXR1cm4gdGhpcy5yZXNpemVUaGluZ3MoKTtcbiAgICB9XG4gIH0sIHtcbiAgICB0ZW1wbGF0ZXM6IHtcbiAgICAgIGxheW91dDogXy50ZW1wbGF0ZShcIjxkaXYgY2xhcz1cXFwidWktZnJvbnRcXFwiPjwvZGl2PlxcbjxkaXYgY2xhc3M9XFxcInNwbGl0bGluZVxcXCI+Jm5ic3A7PC9kaXY+XFxuPGRpdiBjbGFzcz1cXFwic3BsaXR0aHVtYlxcXCI+PHNwYW4+JiN4Mjc2ZTsgJiN4Mjc2Zjs8L3NwYW4+PC9kaXY+XFxuPGRpdiBjbGFzcz1cXFwibGVmdCB0YWdcXFwiPjwlPSBsZWZ0VGFnICU+PC9kaXY+XFxuPGRpdiBjbGFzcz1cXFwicmlnaHQgdGFnXFxcIj48JT0gcmlnaHRUYWcgJT48L2Rpdj5cXG48ZGl2IGNsYXNzPVxcXCJsZWZ0IHNpZGUgZm9ybVxcXCI+PCU9IGxlZnRGb3JtICU+PC9kaXY+XFxuPGRpdiBjbGFzcz1cXFwicmlnaHQgc2lkZSBmb3JtXFxcIj48JT0gcmlnaHRGb3JtICU+PC9kaXY+XFxuPGRpdiBjbGFzcz1cXFwibGVmdCBsb2FkZXJcXFwiPjxpbWcgc3JjPVxcXCIvc3RhdGljL2ltYWdlcy9zcGlubmVyLmxvYWRpbmZvLm5ldC5naWZcXFwiIC8+PC9kaXY+XFxuPGRpdiBjbGFzcz1cXFwicmlnaHQgbG9hZGVyXFxcIj48aW1nIHNyYz1cXFwiL3N0YXRpYy9pbWFnZXMvc3Bpbm5lci5sb2FkaW5mby5uZXQuZ2lmXFxcIiAvPjwvZGl2PlxcbjxkaXYgaWQ9XFxcIm1hcHdyYXBwZXJcXFwiPjxkaXYgaWQ9XFxcIm1hcFxcXCI+PC9kaXY+PC9kaXY+XCIpLFxuICAgICAgbGVmdFRhZzogXy50ZW1wbGF0ZShcIjxkaXYgY2xhc3M9XFxcInNob3dcXFwiPlxcbiAgICA8c3BhbiBjbGFzcz1cXFwibGVmdGxheWVybmFtZVxcXCI+cGxhaW4gbWFwPC9zcGFuPlxcbiAgICA8YnI+XFxuICAgIDxidXR0b24gY2xhc3M9XFxcImJ0bi1jaGFuZ2VcXFwiPnNldHRpbmdzPC9idXR0b24+XFxuICAgIDxidXR0b24gY2xhc3M9XFxcImJ0bi1jb21wYXJlXFxcIj5zaG93L2hpZGUgY29tcGFyaXNvbiBtYXA8L2J1dHRvbj5cXG48L2Rpdj5cXG48ZGl2IGNsYXNzPVxcXCJlZGl0XFxcIj5cXG4gICAgPGxhYmVsIGNsYXNzPVxcXCJsZWZ0IHN5bmNib3hcXFwiPjwvbGFiZWw+XFxuICAgIDxpbnB1dCBpZD1cXFwibGVmdG1hcHNwcFxcXCIgY2xhc3M9XFxcImxlZnRcXFwiIHR5cGU9XFxcInRleHRcXFwiIG5hbWU9XFxcImxlZnRtYXBzcHBcXFwiIHBsYWNlaG9sZGVyPVxcXCImaGVsbGlwOyBzcGVjaWVzIG9yIGdyb3VwICZoZWxsaXA7XFxcIiAvPlxcbjwvZGl2PlwiKSxcbiAgICAgIHJpZ2h0VGFnOiBfLnRlbXBsYXRlKFwiPGRpdiBjbGFzcz1cXFwic2hvd1xcXCI+XFxuICAgIDxzcGFuIGNsYXNzPVxcXCJyaWdodGxheWVybmFtZVxcXCI+KG5vIGRpc3RyaWJ1dGlvbik8L3NwYW4+XFxuICAgIDxicj5cXG4gICAgPGJ1dHRvbiBjbGFzcz1cXFwiYnRuLWNoYW5nZVxcXCI+c2V0dGluZ3M8L2J1dHRvbj5cXG4gICAgPGJ1dHRvbiBjbGFzcz1cXFwiYnRuLWNvbXBhcmVcXFwiPnNob3cvaGlkZSBjb21wYXJpc29uIG1hcDwvYnV0dG9uPlxcbjwvZGl2PlxcbjxkaXYgY2xhc3M9XFxcImVkaXRcXFwiPlxcbiAgICA8bGFiZWwgY2xhc3M9XFxcInJpZ2h0IHN5bmNib3hcXFwiPjxpbnB1dCBpZD1cXFwic3luY1xcXCIgdHlwZT1cXFwiY2hlY2tib3hcXFwiIHZhbHVlPVxcXCJzeW5jXFxcIiBjaGVja2VkPVxcXCJjaGVja2VkXFxcIiAvPiBzYW1lIGFzIGxlZnQgc2lkZTwvbGFiZWw+XFxuICAgIDxpbnB1dCBpZD1cXFwicmlnaHRtYXBzcHBcXFwiIHR5cGU9XFxcInRleHRcXFwiIGNsYXNzPVxcXCJyaWdodFxcXCIgbmFtZT1cXFwicmlnaHRtYXBzcHBcXFwiIHBsYWNlaG9sZGVyPVxcXCImaGVsbGlwOyBzcGVjaWVzIG9yIGdyb3VwICZoZWxsaXA7XFxcIiAvPlxcbjwvZGl2PlwiKSxcbiAgICAgIGxlZnRGb3JtOiBfLnRlbXBsYXRlKFwiPGZpZWxkc2V0PlxcbiAgICA8bGVnZW5kPnRlbXBlcmF0dXJlIGNoYW5nZTwvbGVnZW5kPlxcbiAgICA8c2VsZWN0IGNsYXNzPVxcXCJsZWZ0XFxcIiBpZD1cXFwibGVmdG1hcGRlZ3NcXFwiPlxcbiAgICAgICAgPG9wdGlvbiB2YWx1ZT1cXFwiYmFzZWxpbmVcXFwiPmJhc2VsaW5lPC9vcHRpb24+XFxuICAgICAgICA8b3B0aW9uIHZhbHVlPVxcXCIxLjVcXFwiPjEuNSAmZGVnO0M8L29wdGlvbj5cXG4gICAgICAgIDxvcHRpb24gdmFsdWU9XFxcIjJcXFwiPjIuMCAmZGVnO0M8L29wdGlvbj5cXG4gICAgICAgIDxvcHRpb24gdmFsdWU9XFxcIjIuN1xcXCI+Mi43ICZkZWc7Qzwvb3B0aW9uPlxcbiAgICAgICAgPG9wdGlvbiB2YWx1ZT1cXFwiMy4yXFxcIj4zLjIgJmRlZztDPC9vcHRpb24+XFxuICAgICAgICA8b3B0aW9uIHZhbHVlPVxcXCI0LjVcXFwiPjQuNSAmZGVnO0M8L29wdGlvbj5cXG4gICAgICAgIDxvcHRncm91cCBsYWJlbD1cXFwiSGlnaCBzZW5zaXRpdml0eSBjbGltYXRlXFxcIj5cXG4gICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVxcXCI2XFxcIj42LjAgJmRlZztDPC9vcHRpb24+XFxuICAgICAgICA8L29wdGdyb3VwPlxcbiAgICA8L3NlbGVjdD5cXG48L2ZpZWxkc2V0PlxcbjxmaWVsZHNldD5cXG4gICAgPGxlZ2VuZD5hZGFwdGF0aW9uIHZpYSByYW5nZSBzaGlmdDwvbGVnZW5kPlxcbiAgICA8bGFiZWw+PCEtLSBzcGFuPm5vbmU8L3NwYW4gLS0+IDxpbnB1dCBuYW1lPVxcXCJsZWZ0bWFwcmFuZ2VcXFwiIGNsYXNzPVxcXCJsZWZ0XFxcIiB0eXBlPVxcXCJyYWRpb1xcXCIgdmFsdWU9XFxcIm5vLmRpc3BcXFwiIGNoZWNrZWQ9XFxcImNoZWNrZWRcXFwiPiBzcGVjaWVzIGNhbm5vdCBzaGlmdCByYW5nZXM8L2xhYmVsPlxcbiAgICA8bGFiZWw+PCEtLSBzcGFuPmFsbG93PC9zcGFuIC0tPiA8aW5wdXQgbmFtZT1cXFwibGVmdG1hcHJhbmdlXFxcIiBjbGFzcz1cXFwibGVmdFxcXCIgdHlwZT1cXFwicmFkaW9cXFwiIHZhbHVlPVxcXCJyZWFsLmRpc3BcXFwiPiBhbGxvdyByYW5nZSBhZGFwdGF0aW9uPC9sYWJlbD5cXG48L2ZpZWxkc2V0PlxcbjxmaWVsZHNldD5cXG4gICAgPGxlZ2VuZD5tb2RlbCBzdW1tYXJ5PC9sZWdlbmQ+XFxuICAgIDxzZWxlY3QgY2xhc3M9XFxcImxlZnRcXFwiIGlkPVxcXCJsZWZ0bWFwY29uZmlkZW5jZVxcXCI+XFxuICAgICAgICA8b3B0aW9uIHZhbHVlPVxcXCIxMFxcXCI+MTB0aCBwZXJjZW50aWxlPC9vcHRpb24+XFxuICAgICAgICA8IS0tIG9wdGlvbiB2YWx1ZT1cXFwiMzNcXFwiPjMzcmQgcGVyY2VudGlsZTwvb3B0aW9uIC0tPlxcbiAgICAgICAgPG9wdGlvbiB2YWx1ZT1cXFwiNTBcXFwiIHNlbGVjdGVkPVxcXCJzZWxlY3RlZFxcXCI+NTB0aCBwZXJjZW50aWxlPC9vcHRpb24+XFxuICAgICAgICA8IS0tIG9wdGlvbiB2YWx1ZT1cXFwiNjZcXFwiPjY2dGggcGVyY2VudGlsZTwvb3B0aW9uIC0tPlxcbiAgICAgICAgPG9wdGlvbiB2YWx1ZT1cXFwiOTBcXFwiPjkwdGggcGVyY2VudGlsZTwvb3B0aW9uPlxcbiAgICA8L3NlbGVjdD5cXG48L2ZpZWxkc2V0PlxcbjxmaWVsZHNldCBjbGFzcz1cXFwiYmxhbmtcXFwiPlxcbiAgICA8YnV0dG9uIHR5cGU9XFxcImJ1dHRvblxcXCIgY2xhc3M9XFxcImJ0bi1jaGFuZ2VcXFwiPmhpZGUgc2V0dGluZ3M8L2J1dHRvbj5cXG4gICAgPGJ1dHRvbiB0eXBlPVxcXCJidXR0b25cXFwiIGNsYXNzPVxcXCJidG4tY29tcGFyZVxcXCI+aGlkZS9zaG93IHJpZ2h0IG1hcDwvYnV0dG9uPlxcbiAgICA8YnV0dG9uIHR5cGU9XFxcImJ1dHRvblxcXCIgY2xhc3M9XFxcImJ0bi1jb3B5IHJpZ2h0LXZhbGlkLW1hcFxcXCI+Y29weSByaWdodCBtYXAgJmxhcXVvOzwvYnV0dG9uPlxcbiAgICA8YSBpZD1cXFwibGVmdG1hcGRsXFxcIiBjbGFzcz1cXFwiZG93bmxvYWQgbGVmdC12YWxpZC1tYXBcXFwiIGhyZWY9XFxcIlxcXCIgZGlzYWJsZWQ9XFxcImRpc2FibGVkXFxcIj5kb3dubG9hZCBqdXN0IHRoaXMgbWFwPGJyPig8MU1iIEdlb1RJRkYpPC9hPlxcbjwvZmllbGRzZXQ+XFxuXCIpLFxuICAgICAgcmlnaHRGb3JtOiBfLnRlbXBsYXRlKFwiPGZpZWxkc2V0PlxcbiAgICA8bGVnZW5kPnRlbXBlcmF0dXJlIGNoYW5nZTwvbGVnZW5kPlxcbiAgICA8c2VsZWN0IGNsYXNzPVxcXCJyaWdodFxcXCIgaWQ9XFxcInJpZ2h0bWFwZGVnc1xcXCI+XFxuICAgICAgICA8b3B0aW9uIHZhbHVlPVxcXCJiYXNlbGluZVxcXCI+YmFzZWxpbmU8L29wdGlvbj5cXG4gICAgICAgIDxvcHRpb24gdmFsdWU9XFxcIjEuNVxcXCI+MS41ICZkZWc7Qzwvb3B0aW9uPlxcbiAgICAgICAgPG9wdGlvbiB2YWx1ZT1cXFwiMlxcXCI+Mi4wICZkZWc7Qzwvb3B0aW9uPlxcbiAgICAgICAgPG9wdGlvbiB2YWx1ZT1cXFwiMi43XFxcIj4yLjcgJmRlZztDPC9vcHRpb24+XFxuICAgICAgICA8b3B0aW9uIHZhbHVlPVxcXCIzLjJcXFwiPjMuMiAmZGVnO0M8L29wdGlvbj5cXG4gICAgICAgIDxvcHRpb24gdmFsdWU9XFxcIjQuNVxcXCI+NC41ICZkZWc7Qzwvb3B0aW9uPlxcbiAgICAgICAgPG9wdGdyb3VwIGxhYmVsPVxcXCJIaWdoIHNlbnNpdGl2aXR5IGNsaW1hdGVcXFwiPlxcbiAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XFxcIjZcXFwiPjYuMCAmZGVnO0M8L29wdGlvbj5cXG4gICAgICAgIDwvb3B0Z3JvdXA+XFxuICAgIDwvc2VsZWN0PlxcbjwvZmllbGRzZXQ+XFxuPGZpZWxkc2V0PlxcbiAgICA8bGVnZW5kPmFkYXB0YXRpb24gdmlhIHJhbmdlIHNoaWZ0PC9sZWdlbmQ+XFxuICAgIDxsYWJlbD48IS0tIHNwYW4+bm9uZTwvc3BhbiAtLT4gPGlucHV0IG5hbWU9XFxcInJpZ2h0bWFwcmFuZ2VcXFwiIGNsYXNzPVxcXCJyaWdodFxcXCIgdHlwZT1cXFwicmFkaW9cXFwiIHZhbHVlPVxcXCJuby5kaXNwXFxcIiBjaGVja2VkPVxcXCJjaGVja2VkXFxcIj4gc3BlY2llcyBjYW5ub3Qgc2hpZnQgcmFuZ2VzPC9sYWJlbD5cXG4gICAgPGxhYmVsPjwhLS0gc3Bhbj5hbGxvdzwvc3BhbiAtLT4gPGlucHV0IG5hbWU9XFxcInJpZ2h0bWFwcmFuZ2VcXFwiIGNsYXNzPVxcXCJyaWdodFxcXCIgdHlwZT1cXFwicmFkaW9cXFwiIHZhbHVlPVxcXCJyZWFsLmRpc3BcXFwiPiBhbGxvdyByYW5nZSBhZGFwdGF0aW9uPC9sYWJlbD5cXG48L2ZpZWxkc2V0PlxcbjxmaWVsZHNldD5cXG4gICAgPGxlZ2VuZD5tb2RlbCBzdW1tYXJ5PC9sZWdlbmQ+XFxuICAgIDxzZWxlY3QgY2xhc3M9XFxcInJpZ2h0XFxcIiBpZD1cXFwicmlnaHRtYXBjb25maWRlbmNlXFxcIj5cXG4gICAgICAgIDxvcHRpb24gdmFsdWU9XFxcIjEwXFxcIj4xMHRoIHBlcmNlbnRpbGU8L29wdGlvbj5cXG4gICAgICAgIDwhLS0gb3B0aW9uIHZhbHVlPVxcXCIzM1xcXCI+MzNyZCBwZXJjZW50aWxlPC9vcHRpb24gLS0+XFxuICAgICAgICA8b3B0aW9uIHZhbHVlPVxcXCI1MFxcXCIgc2VsZWN0ZWQ9XFxcInNlbGVjdGVkXFxcIj41MHRoIHBlcmNlbnRpbGU8L29wdGlvbj5cXG4gICAgICAgIDwhLS0gb3B0aW9uIHZhbHVlPVxcXCI2NlxcXCI+NjZ0aCBwZXJjZW50aWxlPC9vcHRpb24gLS0+XFxuICAgICAgICA8b3B0aW9uIHZhbHVlPVxcXCI5MFxcXCI+OTB0aCBwZXJjZW50aWxlPC9vcHRpb24+XFxuICAgIDwvc2VsZWN0PlxcbjwvZmllbGRzZXQ+XFxuPGZpZWxkc2V0IGNsYXNzPVxcXCJibGFua1xcXCI+XFxuICAgIDxidXR0b24gdHlwZT1cXFwiYnV0dG9uXFxcIiBjbGFzcz1cXFwiYnRuLWNoYW5nZVxcXCI+aGlkZSBzZXR0aW5nczwvYnV0dG9uPlxcbiAgICA8YnV0dG9uIHR5cGU9XFxcImJ1dHRvblxcXCIgY2xhc3M9XFxcImJ0bi1jb21wYXJlXFxcIj5oaWRlL3Nob3cgcmlnaHQgbWFwPC9idXR0b24+XFxuICAgIDxidXR0b24gdHlwZT1cXFwiYnV0dG9uXFxcIiBjbGFzcz1cXFwiYnRuLWNvcHkgbGVmdC12YWxpZC1tYXBcXFwiPmNvcHkgbGVmdCBtYXAgJmxhcXVvOzwvYnV0dG9uPlxcbiAgICA8YSBpZD1cXFwicmlnaHRtYXBkbFxcXCIgY2xhc3M9XFxcImRvd25sb2FkIHJpZ2h0LXZhbGlkLW1hcFxcXCIgaHJlZj1cXFwiXFxcIiBkaXNhYmxlZD1cXFwiZGlzYWJsZWRcXFwiPmRvd25sb2FkIGp1c3QgdGhpcyBtYXA8YnI+KDwxTWIgR2VvVElGRik8L2E+XFxuPC9maWVsZHNldD5cXG5cIilcbiAgICB9XG4gIH0pO1xuXG4gIG1vZHVsZS5leHBvcnRzID0gQXBwVmlldztcblxufSkuY2FsbCh0aGlzKTtcbiIsIlxuLy8galF1ZXJ5IHBsdWdpblxuLy8gYXV0aG9yOiBEYW5pZWwgQmFpcmQgPGRhbmllbEBkYW5pZWxiYWlyZC5jb20+XG4vLyB2ZXJzaW9uOiAwLjEuMjAxNDAyMDVcblxuLy9cbi8vIFRoaXMgbWFuYWdlcyBtZW51cywgc3VibWVudXMsIHBhbmVscywgYW5kIHBhZ2VzLlxuLy8gTGlrZSB0aGlzOlxuLy8gLS0tLi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0uLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLi0tLVxuLy8gICAgfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCAgICAgICAgICAgICAgICAgICAgICB8ICAgICAgICAgICAgICAgICAgICAgICAgfFxuLy8gICAgfCAgU2VsZWN0ZWQgTWFpbiBNZW51IEl0ZW0gICAuLS0tLS0tLS0tLS0uIC4tLS0tLS0tLS0uICAgfCAgQWx0IE1haW4gTWVudSBJdGVtICB8ICBUaGlyZCBNYWluIE1lbnUgSXRlbSAgfFxuLy8gICAgfCAgICAgICAgICAgICAgICAgICAgICAgICAgIC8gIFN1Yml0ZW0gMSAgXFwgU3ViaXRlbSAyIFxcICB8ICAgICAgICAgICAgICAgICAgICAgIHwgICAgICAgICAgICAgICAgICAgICAgICB8XG4vLyAtLS0nLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0nICAgICAgICAgICAgICAgJy0tLS0tLS0tLS0tLS0nLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSctLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0nLS0tXG4vLyAgICAgICB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbi8vICAgICAgIHwgICBQYW5lbCBmb3IgU3ViaXRlbSAxLCB0aGlzIGlzIFBhZ2UgMSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuLy8gICAgICAgfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4vLyAgICAgICB8ICAgRWFjaCBQYW5lbCBjYW4gaGF2ZSBtdWx0aXBsZSBwYWdlcywgb25lIHBhZ2Ugc2hvd2luZyBhdCBhIHRpbWUuICBCdXR0b25zIG9uIHBhZ2VzIHN3aXRjaCAgICAgIHxcbi8vICAgICAgIHwgICBiZXR3ZWVuIHBhZ2VzLiAgUGFuZWwgaGVpZ2h0IGFkanVzdHMgdG8gdGhlIGhlaWdodCBvZiB0aGUgcGFnZS4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuLy8gICAgICAgfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4vLyAgICAgICB8ICAgWyBzZWUgcGFnZSAyIF0gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbi8vICAgICAgIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuLy8gICAgICAgJy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0nXG4vL1xuLy8gLSBtZW51cyBhcmUgYWx3YXlzIDx1bD4gdGFnczsgZWFjaCA8bGk+IGlzIGEgbWVudSBpdGVtXG4vLyAtIGEgbWFpbiBtZW51IDxsaT4gbXVzdCBjb250YWluIGFuIDxhPiB0YWcgYW5kIG1heSBhbHNvIGNvbnRhaW4gYSA8dWw+IHN1Ym1lbnVcbi8vIC0gYSBzdWJtZW51IDxsaT4gbXVzdCBjb250YWluIGFuIDxhPiB0YWcgd2l0aCBhIGRhdGEtdGFyZ2V0cGFuZWwgYXR0cmlidXRlIHNldFxuLy8gLSBUaGVyZSBpcyBhbHdheXMgYSBzaW5nbGUgc2VsZWN0ZWQgbWFpbiBtZW51IGl0ZW1cbi8vIC0gQSBtYWluIG1lbnUgaXRlbSBtYXkgZWl0aGVyIGxpbmsgdG8gYW5vdGhlciB3ZWJwYWdlLCBvciBoYXZlIGEgc3VibWVudVxuLy8gLSBTZWxlY3RpbmcgYSBtYWluIG1lbnUgaXRlbSB3aWxsIHNob3cgaXRzIHN1Ym1lbnUsIGlmIGl0IGhhcyBvbmVcbi8vIC0gQSBzdWJtZW51IGFsd2F5cyBoYXMgYSBzaW5nbGUgaXRlbSBzZWxlY3RlZFxuLy8gLSBDbGlja2luZyBhbiBpbmFjdGl2ZSBzdWJtZW51IGl0ZW0gd2lsbCBzaG93IGl0cyBwYW5lbFxuLy8gLSBDbGlja2luZyBhIHNlbGVjdGVkIHN1Ym1lbnUgaXRlbSB3aWxsIHRvZ2dsZSBpdHMgcGFuZWwgc2hvd2luZyA8LT4gaGlkaW5nICgoKCBOQjogbm90IHlldCBpbXBsZW1lbnRlZCApKSlcbi8vIC0gQSBwYW5lbCBpbml0aWFsbHkgc2hvd3MgaXRzIGZpcnN0IHBhZ2Vcbi8vIC0gU3dpdGNoaW5nIHBhZ2VzIGluIGEgcGFuZWwgY2hhbmdlcyB0aGUgcGFuZWwgaGVpZ2h0IHRvIHN1aXQgaXRzIGN1cnJlbnQgcGFnZVxuLy8gLSBBIHBhbmVsIGlzIGEgSFRNTCBibG9jayBlbGVtZW50IHdpdGggdGhlIGNsYXNzIC5tc3BwLXBhbmVsIChjYW4gYmUgb3ZlcnJpZGRlbiB2aWEgb3B0aW9uKVxuLy8gLSBJZiBhIHBhbmVsIGNvbnRhaW5zIHBhZ2VzLCBvbmUgcGFnZSBzaG91bGQgaGF2ZSB0aGUgY2xhc3MgLmN1cnJlbnQgKGNhbiBiZSBvdmVycmlkZGVuIHZpYSBvcHRpb24pXG4vLyAtIEEgcGFnZSBpcyBhIEhUTUwgYmxvY2sgZWxlbWVudCB3aXRoIHRoZSBjbGFzcyAubXNwcC1wYWdlIChjYW4gYmUgb3ZlcnJpZGRlbiB2aWEgb3B0aW9uKVxuLy8gLSA8YnV0dG9uPiBvciA8YT4gdGFncyBpbiBwYWdlcyB0aGF0IGhhdmUgYSBkYXRhLXRhcmdldHBhZ2UgYXR0cmlidXRlIHNldCB3aWxsIHN3aXRjaCB0byB0aGUgaW5kaWNhdGVkIHBhZ2Vcbi8vXG4vL1xuLy8gVGhlIEhUTUwgc2hvdWxkIGxvb2sgbGlrZSB0aGlzOlxuLy9cbi8vICA8dWwgY2xhc3M9XCJtZW51XCI+ICAgICAgICAgICAgICAgICAgIDwhLS0gdGhpcyBpcyB0aGUgbWFpbiBtZW51IC0tPlxuLy8gICAgICA8bGkgY2xhc3M9XCJjdXJyZW50XCI+ICAgICAgICAgICAgPCEtLSB0aGlzIGlzIGEgbWFpbiBtZW51IGl0ZW0sIGN1cnJlbnRseSBzZWxlY3RlZCAtLT5cbi8vICAgICAgICAgIDxhPkZpcnN0IEl0ZW08L2E+ICAgICAgICAgICA8IS0tIHRoZSBmaXJzdCBpdGVtIGluIHRoZSBtYWluIG1lbnUgLS0+XG4vLyAgICAgICAgICA8dWw+ICAgICAgICAgICAgICAgICAgICAgICAgPCEtLSBhIHN1Ym1lbnUgaW4gdGhlIGZpcnN0IG1haW4gbWVudSBpdGVtIC0tPlxuLy8gICAgICAgICAgICAgIDxsaSBjbGFzcz1cImN1cnJlbnRcIj4gICAgPCEtLSB0aGUgY3VycmVudGx5IHNlbGVjdGVkIHN1Ym1lbnUgaXRlbSAtLT5cbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8IS0tIC5wYW5lbHRyaWdnZXIgYW5kIHRoZSBkYXRhLXBhbmVsaWQgYXR0cmlidXRlIGFyZSByZXF1aXJlZCAtLT5cbi8vICAgICAgICAgICAgICAgICAgPGEgZGF0YS10YXJnZXRwYW5lbD1cInBhbmVsMVwiPmRvIHRoZSBwYW5lbDEgdGhpbmc8L2E+XG4vLyAgICAgICAgICAgICAgPC9saT5cbi8vICAgICAgICAgICAgICA8bGk+Li4uPC9saT4gICAgICAgICAgICA8IS0tIGFub3RoZXIgc3VibWVudSBpdGVtIC0tPlxuLy8gICAgICAgICAgPC91bD5cbi8vICAgICAgPC9saT5cbi8vICAgICAgPGxpPiA8YSBocmVmPVwiYW5vdGhlcl9wYWdlLmh0bWxcIj5hbm90aGVyIHBhZ2U8L2E+IDwvbGk+XG4vLyAgICAgIDxsaT4gPGE+d2hhdGV2ZXI8L2E+IDwvbGk+XG4vLyAgPC91bD5cbi8vXG4vLyAgPGRpdiBpZD1cInBhbmVsMVwiIGNsYXNzPVwibXNwcC1wYW5lbFwiPlxuLy8gICAgICA8ZGl2IGlkPVwicGFnZTExXCIgY2xhc3M9XCJtc3BwLXBhZ2UgY3VycmVudFwiPlxuLy8gICAgICAgICAgVGhpcyBpcyB0aGUgY3VycmVudCBwYWdlIG9uIHBhbmVsIDEuXG4vLyAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBkYXRhLXRhcmdldHBhZ2U9XCJwYWdlMTJcIj5zaG93IHBhZ2UgMjwvYnV0dG9uPlxuLy8gICAgICA8L2Rpdj5cbi8vICAgICAgPGRpdiBpZD1cInBhZ2UxMlwiIGNsYXNzPVwibXNwcC1wYWdlXCI+XG4vLyAgICAgICAgICBUaGlzIGlzIHRoZSBvdGhlciBwYWdlIG9uIHBhbmVsIDEuXG4vLyAgICAgICAgICA8YSBkYXRhLXRhcmdldHBhZ2U9XCJwYWdlMTFcIj5zZWUgdGhlIGZpcnN0IHBhZ2UgYWdhaW48L2E+XG4vLyAgICAgIDwvZGl2PlxuLy8gIDwvZGl2PlxuLy8gIDxkaXYgaWQ9XCJwYW5lbDJcIiBjbGFzcz1cIm1zcHAtcGFuZWxcIj5cbi8vICAgICAgPGRpdiBpZD1cInBhZ2UyMVwiIGNsYXNzPVwibXNwcC1wYWdlIGN1cnJlbnRcIj5cbi8vICAgICAgICAgIFRoaXMgaXMgdGhlIGN1cnJlbnQgcGFnZSBvbiBwYW5lbCAyLlxuLy8gICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgZGF0YS10YXJnZXRwYWdlPVwicGFnZTIyXCI+c2hvdyBwYWdlIDI8L2J1dHRvbj5cbi8vICAgICAgPC9kaXY+XG4vLyAgICAgIDxkaXYgaWQ9XCJwYWdlMjJcIiBjbGFzcz1cIm1zcHAtcGFnZVwiPlxuLy8gICAgICAgICAgVGhpcyBpcyB0aGUgb3RoZXIgcGFnZSBvbiBwYW5lbCAyLlxuLy8gICAgICAgICAgPGEgZGF0YS10YXJnZXRwYWdlPVwicGFnZTIxXCI+c2VlIHRoZSBmaXJzdCBwYWdlIGFnYWluPC9hPlxuLy8gICAgICA8L2Rpdj5cbi8vICA8L2Rpdj5cblxuXG47KCBmdW5jdGlvbigkLCB3aW5kb3csIGRvY3VtZW50LCB1bmRlZmluZWQpIHtcblxuICAgIC8vIG5hbWVzcGFjZSBjbGltYXMsIHdpZGdldCBuYW1lIG1zcHBcbiAgICAvLyBzZWNvbmQgYXJnIGlzIHVzZWQgYXMgdGhlIHdpZGdldCdzIFwicHJvdG90eXBlXCIgb2JqZWN0XG4gICAgJC53aWRnZXQoIFwiY2xpbWFzLm1zcHBcIiAsIHtcblxuICAgICAgICAvL09wdGlvbnMgdG8gYmUgdXNlZCBhcyBkZWZhdWx0c1xuICAgICAgICBvcHRpb25zOiB7XG4gICAgICAgICAgICBhbmltYXRpb25GYWN0b3I6IDIsXG5cbiAgICAgICAgICAgIG1haW5NZW51Q2xhc3M6ICdtc3BwLW1haW4tbWVudScsXG5cbiAgICAgICAgICAgIHBhbmVsQ2xhc3M6ICdtc3BwLXBhbmVsJyxcbiAgICAgICAgICAgIHBhZ2VDbGFzczogJ21zcHAtcGFnZScsXG5cbiAgICAgICAgICAgIGNsZWFyZml4Q2xhc3M6ICdtc3BwLWNsZWFyZml4JyxcbiAgICAgICAgICAgIGFjdGl2ZUNsYXNzOiAnY3VycmVudCdcbiAgICAgICAgfSxcbiAgICAgICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICAvL1NldHVwIHdpZGdldCAoZWcuIGVsZW1lbnQgY3JlYXRpb24sIGFwcGx5IHRoZW1pbmdcbiAgICAgICAgLy8gLCBiaW5kIGV2ZW50cyBldGMuKVxuICAgICAgICBfY3JlYXRlOiBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgdmFyIGJhc2UgPSB0aGlzO1xuICAgICAgICAgICAgdmFyIG9wdHMgPSB0aGlzLm9wdGlvbnM7XG5cbiAgICAgICAgICAgIC8vIHBvcHVsYXRlIHNvbWUgY29udmVuaWVuY2UgdmFyaWFibGVzXG4gICAgICAgICAgICB2YXIgJG1lbnUgPSB0aGlzLmVsZW1lbnQ7XG4gICAgICAgICAgICB0aGlzLm1haW5NZW51SXRlbXMgPSAkbWVudS5jaGlsZHJlbignbGknKTtcbiAgICAgICAgICAgIHRoaXMucGFuZWxzID0gJCgnLicgKyBvcHRzLnBhbmVsQ2xhc3MpO1xuXG4gICAgICAgICAgICAvLyBkaXNhcHBlYXIgd2hpbGUgd2Ugc29ydCB0aGluZ3Mgb3V0XG4gICAgICAgICAgICAkbWVudS5jc3MoeyBvcGFjaXR5OiAwIH0pO1xuICAgICAgICAgICAgdGhpcy5wYW5lbHMuY3NzKHsgb3BhY2l0eTogMCB9KTtcblxuICAgICAgICAgICAgLy8gbWFrZSBzb21lIERPTSBtb2RzXG4gICAgICAgICAgICAkbWVudS5hZGRDbGFzcyhvcHRzLm1haW5NZW51Q2xhc3MpO1xuICAgICAgICAgICAgJG1lbnUuYWRkQ2xhc3Mob3B0cy5jbGVhcmZpeENsYXNzKTtcbiAgICAgICAgICAgIHRoaXMucGFuZWxzLmFkZENsYXNzKG9wdHMuY2xlYXJmaXhDbGFzcyk7XG5cbiAgICAgICAgICAgIC8vIGxheW91dCB0aGUgbWVudVxuICAgICAgICAgICAgdGhpcy5fbGF5b3V0TWVudSgpO1xuXG4gICAgICAgICAgICAvLyBsYXlvdXQgdGhlIHBhbmVsc1xuICAgICAgICAgICAgdGhpcy5fbGF5b3V0UGFuZWxzKCk7XG5cbiAgICAgICAgICAgIC8vIGhvb2sgdXAgY2xpY2sgaGFuZGxpbmcgZXRjXG4gICAgICAgICAgICAkbWVudS5vbignbXNwcHNob3dtZW51JywgdGhpcy5fc2hvd01lbnUpO1xuICAgICAgICAgICAgJG1lbnUub24oJ21zcHBzaG93c3VibWVudScsIHRoaXMuX3Nob3dTdWJNZW51KTtcbiAgICAgICAgICAgICRtZW51Lm9uKCdtc3Bwc2hvd3BhbmVsJywgdGhpcy5fc2hvd1BhbmVsKTtcbiAgICAgICAgICAgICRtZW51Lm9uKCdtc3Bwc2hvd3BhZ2UnLCB0aGlzLl9zaG93UGFnZSk7XG5cbiAgICAgICAgICAgIC8vIGF0dGFjaCBoYW5kbGVycyB0byB0aGUgbWVudS10cmlnZ2Vyc1xuICAgICAgICAgICAgdGhpcy5tYWluTWVudUl0ZW1zLmVhY2goIGZ1bmN0aW9uKGluZGV4LCBpdGVtKSB7XG4gICAgICAgICAgICAgICAgLy8gdGhlIGxpIG1lbnUgaXRlbSBoYXMgYSBjaGlsZCBhIHRoYXQgaXMgaXQncyB0cmlnZ2VyXG4gICAgICAgICAgICAgICAgJChpdGVtKS5jaGlsZHJlbignYScpLmNsaWNrKCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgICAgICAgICBiYXNlLl90cmlnZ2VyKCdzaG93bWVudScsIGV2ZW50LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtZW51aXRlbTogaXRlbSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpZGdldDogYmFzZVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAvLyBhdHRhY2ggaGFuZGxlcnMgdG8gdGhlIHN1Ym1lbnUgaXRlbXNcbiAgICAgICAgICAgICAgICAkKGl0ZW0pLmZpbmQoJ2xpJykuZWFjaCggZnVuY3Rpb24oaW5kZXgsIHN1Yk1lbnVJdGVtKSB7XG4gICAgICAgICAgICAgICAgICAgICQoc3ViTWVudUl0ZW0pLmZpbmQoJ2EnKS5jbGljayggZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhc2UuX3RyaWdnZXIoJ3Nob3dzdWJtZW51JywgZXZlbnQsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZW51aXRlbTogaXRlbSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWJtZW51aXRlbTogc3ViTWVudUl0ZW0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2lkZ2V0OiBiYXNlXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gYXR0YWNoIGhhbmRsZXJzIHRvIHRoZSBwYW5lbCB0cmlnZ2Vyc1xuICAgICAgICAgICAgJG1lbnUuZmluZCgnW2RhdGEtdGFyZ2V0cGFuZWxdJykuZWFjaCggZnVuY3Rpb24oaW5kZXgsIHRyaWdnZXIpIHtcbiAgICAgICAgICAgICAgICB2YXIgJHRyaWdnZXIgPSQodHJpZ2dlcik7XG4gICAgICAgICAgICAgICAgJHRyaWdnZXIuY2xpY2soIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIGJhc2UuX3RyaWdnZXIoJ3Nob3dwYW5lbCcsIGV2ZW50LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYW5lbDogJCgnIycgKyAkdHJpZ2dlci5kYXRhKCd0YXJnZXRwYW5lbCcpKS5maXJzdCgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgd2lkZ2V0OiBiYXNlXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIGF0dGFjaCBoYW5kbGVycyB0byB0aGUgcGFnZSBzd2l0Y2hlcnNcbiAgICAgICAgICAgIHRoaXMucGFuZWxzLmVhY2goIGZ1bmN0aW9uKGluZGV4LCBwYW5lbCkge1xuICAgICAgICAgICAgICAgIHZhciAkcGFuZWwgPSAkKHBhbmVsKTtcbiAgICAgICAgICAgICAgICAkcGFuZWwuZmluZCgnW2RhdGEtdGFyZ2V0cGFnZV0nKS5jbGljayggZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgYmFzZS5fdHJpZ2dlcignc2hvd3BhZ2UnLCBldmVudCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgcGFuZWw6ICRwYW5lbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhZ2U6ICQoJyMnICsgJCh0aGlzKS5kYXRhKCd0YXJnZXRwYWdlJykpLFxuICAgICAgICAgICAgICAgICAgICAgICAgd2lkZ2V0OiBiYXNlXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIGFjdGl2YXRlIHRoZSBjdXJyZW50IG1lbnVzLCBwYW5lbHMgZXRjXG4gICAgICAgICAgICB2YXIgJGN1cnJlbnRNYWluID0gdGhpcy5tYWluTWVudUl0ZW1zLmZpbHRlcignLicgKyBvcHRzLmFjdGl2ZUNsYXNzKTtcbiAgICAgICAgICAgICRjdXJyZW50TWFpbi5yZW1vdmVDbGFzcyhvcHRzLmFjdGl2ZUNsYXNzKS5jaGlsZHJlbignYScpLmNsaWNrKCk7XG5cbiAgICAgICAgICAgIC8vIGZpbmFsbHksIGZhZGUgYmFjayBpblxuICAgICAgICAgICAgJG1lbnUuYW5pbWF0ZSh7IG9wYWNpdHk6IDEgfSwgJ2Zhc3QnKTtcblxuICAgICAgICAgICAgLy8gcGFuZWxzIHN0YXkgaW52aXNpYmxlXG4gICAgICAgIH0sXG4gICAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgICAgX3N3aXRjaENsYXNzT3B0aW9uOiBmdW5jdGlvbihjbGFzc05hbWUsIG5ld0NsYXNzKSB7XG4gICAgICAgICAgICB2YXIgb2xkQ2xhc3MgPSB0aGlzLm9wdGlvbnNbY2xhc3NOYW1lXTtcbiAgICAgICAgICAgIGlmIChvbGRDbGFzcyAhPT0gbmV3Q2xhc3MpIHtcbiAgICAgICAgICAgICAgICB2YXIgZ3JvdXAgPSB0aGlzLmVsZW1lbnQuZmluZCgnLicgKyBvbGRDbGFzcyk7XG4gICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zW2NsYXNzTmFtZV0gPSBuZXdDbGFzcztcbiAgICAgICAgICAgICAgICBncm91cC5yZW1vdmVDbGFzcyhvbGRDbGFzcyk7XG4gICAgICAgICAgICAgICAgZ3JvdXAuYWRkQ2xhc3MobmV3Q2xhc3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgIC8vIFJlc3BvbmQgdG8gYW55IGNoYW5nZXMgdGhlIHVzZXIgbWFrZXMgdG8gdGhlXG4gICAgICAgIC8vIG9wdGlvbiBtZXRob2RcbiAgICAgICAgX3NldE9wdGlvbjogZnVuY3Rpb24oa2V5LCB2YWx1ZSkge1xuICAgICAgICAgICAgc3dpdGNoIChrZXkpIHtcbiAgICAgICAgICAgICAgICBjYXNlIFwibWFpbk1lbnVDbGFzc1wiOlxuICAgICAgICAgICAgICAgIGNhc2UgXCJjbGVhcmZpeENsYXNzXCI6XG4gICAgICAgICAgICAgICAgY2FzZSBcImFjdGl2ZUNsYXNzXCI6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3N3aXRjaENsYXNzT3B0aW9uKGtleSwgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMub3B0aW9uc1trZXldID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIC8vIGl0J3Mgb2theSB0aGF0IHRoZXJlJ3Mgbm8gfSBoZXJlXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyByZW1lbWJlciB0byBjYWxsIG91ciBzdXBlcidzIF9zZXRPcHRpb24gbWV0aG9kXG4gICAgICAgICAgICB0aGlzLl9zdXBlciggXCJfc2V0T3B0aW9uXCIsIGtleSwgdmFsdWUgKTtcbiAgICAgICAgfSxcbiAgICAgICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICAvLyBEZXN0cm95IGFuIGluc3RhbnRpYXRlZCBwbHVnaW4gYW5kIGNsZWFuIHVwXG4gICAgICAgIC8vIG1vZGlmaWNhdGlvbnMgdGhlIHdpZGdldCBoYXMgbWFkZSB0byB0aGUgRE9NXG4gICAgICAgIF9kZXN0cm95OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5yZW1vdmVDbGFzcyh0aGlzLm9wdGlvbnMubWFpbk1lbnVDbGFzcyk7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQucmVtb3ZlQ2xhc3ModGhpcy5vcHRpb25zLmNsZWFyZml4Q2xhc3MpO1xuICAgICAgICAgICAgdGhpcy5wYW5lbHMucmVtb3ZlQ2xhc3ModGhpcy5vcHRpb25zLmNsZWFyZml4Q2xhc3MpO1xuICAgICAgICB9LFxuICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgIC8vIGRvIHRoZSBsYXlvdXQgY2FsY3VsYXRpb25zXG4gICAgICAgIF9sYXlvdXRNZW51OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIC8vIGdvIHRocm91Z2ggZWFjaCBzdWJtZW51IGFuZCByZWNvcmQgaXRzIHdpZHRoXG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQuZmluZCgndWwnKS5lYWNoKCBmdW5jdGlvbihpbmRleCwgc3ViTWVudSkge1xuICAgICAgICAgICAgICAgIHZhciAkc20gPSAkKHN1Yk1lbnUpO1xuICAgICAgICAgICAgICAgICRzbS5jc3Moe3dpZHRoOiAnYXV0byd9KTtcbiAgICAgICAgICAgICAgICAkc20uZGF0YSgnb3JpZ2luYWxXaWR0aCcsICRzbS53aWR0aCgpKTtcblxuICAgICAgICAgICAgICAgIC8vIGxlYXZlIGVhY2ggc3VibWVudSBoaWRkZW4sIHdpdGggd2lkdGggMFxuICAgICAgICAgICAgICAgICRzbS5jc3MoeyB3aWR0aDogMCwgZGlzcGxheTogJ25vbmUnIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgICAgX3Nob3dNZW51OiBmdW5jdGlvbihldmVudCwgZGF0YSkge1xuICAgICAgICAgICAgdmFyICRpdGVtID0gJChkYXRhLm1lbnVpdGVtKTtcbiAgICAgICAgICAgIHZhciBiYXNlID0gZGF0YS53aWRnZXQ7XG4gICAgICAgICAgICAvLyAkaXRlbSBpcyBhIGNsaWNrZWQtb24gbWVudSBpdGVtLi5cbiAgICAgICAgICAgIGlmICgkaXRlbS5oYXNDbGFzcyhiYXNlLm9wdGlvbnMuYWN0aXZlQ2xhc3MpKSB7XG4gICAgICAgICAgICAgICAgLy8gPz9cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYmFzZS5faGlkZVBhbmVscygpO1xuICAgICAgICAgICAgICAgIGJhc2UubWFpbk1lbnVJdGVtcy5yZW1vdmVDbGFzcyhiYXNlLm9wdGlvbnMuYWN0aXZlQ2xhc3MpO1xuICAgICAgICAgICAgICAgIHZhciAkbmV3U3ViTWVudSA9ICRpdGVtLmZpbmQoJ3VsJyk7XG4gICAgICAgICAgICAgICAgdmFyICRvbGRTdWJNZW51cyA9IGJhc2UuZWxlbWVudC5maW5kKCd1bCcpLm5vdCgkbmV3U3ViTWVudSk7XG4gICAgICAgICAgICAgICAgdmFyIG5ld1dpZHRoID0gJG5ld1N1Yk1lbnUuZGF0YSgnb3JpZ2luYWxXaWR0aCcpO1xuXG4gICAgICAgICAgICAgICAgJG9sZFN1Yk1lbnVzLmFuaW1hdGUoeyB3aWR0aDogMCB9LCAoNTAgKiBiYXNlLm9wdGlvbnMuYW5pbWF0aW9uRmFjdG9yKSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICRvbGRTdWJNZW51cy5jc3MoeyBkaXNwbGF5OiAnbm9uZScgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgJGl0ZW0uYWRkQ2xhc3MoYmFzZS5vcHRpb25zLmFjdGl2ZUNsYXNzKTtcbiAgICAgICAgICAgICAgICAkbmV3U3ViTWVudVxuICAgICAgICAgICAgICAgICAgICAuY3NzKHtkaXNwbGF5OiAnYmxvY2snIH0pXG4gICAgICAgICAgICAgICAgICAgIC5hbmltYXRlKHsgd2lkdGg6IG5ld1dpZHRoIH0sICgxMjUgKiBiYXNlLm9wdGlvbnMuYW5pbWF0aW9uRmFjdG9yKSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkbmV3U3ViTWVudS5jc3MoeyB3aWR0aDogJ2F1dG8nIH0pLnJlbW92ZUF0dHIoJ3N0eWxlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBiYXNlLl90cmlnZ2VyKCdtZW51c2hvd24nLCBldmVudCwgeyBpdGVtOiAkaXRlbSwgd2lkZ2V0OiBiYXNlIH0pO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIDtcbiAgICAgICAgICAgICAgICAvLyBpZiB0aGUgbmV3IHN1Ym1lbnUgaGFzIGFuIGFjdGl2ZSBpdGVtLCBjbGljayBpdFxuICAgICAgICAgICAgICAgICRuZXdTdWJNZW51LmZpbmQoJy4nICsgYmFzZS5vcHRpb25zLmFjdGl2ZUNsYXNzICsgJyBhJykuY2xpY2soKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICBfc2hvd1N1Yk1lbnU6IGZ1bmN0aW9uKGV2ZW50LCBkYXRhKSB7XG4gICAgICAgICAgICAvLyBkZS1hY3RpdmVpZnkgYWxsIHRoZSBzdWJtZW51IGl0ZW1zXG4gICAgICAgICAgICAkKGRhdGEubWVudWl0ZW0pLmZpbmQoJ2xpJykucmVtb3ZlQ2xhc3MoZGF0YS53aWRnZXQub3B0aW9ucy5hY3RpdmVDbGFzcyk7XG4gICAgICAgICAgICAvLyBhY3RpdmUtaWZ5IHRoZSBvbmUgdHJ1ZSBzdWJtZW51IGl0ZW1cbiAgICAgICAgICAgICQoZGF0YS5zdWJtZW51aXRlbSkuYWRkQ2xhc3MoZGF0YS53aWRnZXQub3B0aW9ucy5hY3RpdmVDbGFzcyk7XG4gICAgICAgIH0sXG4gICAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgICAgLy8gZG8gdGhlIGxheW91dCBjYWxjdWxhdGlvbnNcbiAgICAgICAgX2xheW91dFBhbmVsczogZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgIHZhciAkcGFnZXMgPSB0aGlzLnBhbmVscy5maW5kKCcuJyArIHRoaXMub3B0aW9ucy5wYWdlQ2xhc3MpO1xuXG4gICAgICAgICAgICAvLyBnbyB0aHJvdWdoIGVhY2ggcGFnZSBhbmQgcmVjb3JkIGl0cyBoZWlnaHRcbiAgICAgICAgICAgICRwYWdlcy5lYWNoKCBmdW5jdGlvbihpbmRleCwgcGFnZSkge1xuICAgICAgICAgICAgICAgIHZhciAkcGFnZSA9ICQocGFnZSk7XG4gICAgICAgICAgICAgICAgJHBhZ2UuY3NzKHtoZWlnaHQ6ICdhdXRvJ30pO1xuICAgICAgICAgICAgICAgICRwYWdlLmRhdGEoJ29yaWdpbmFsSGVpZ2h0JywgJHBhZ2Uub3V0ZXJIZWlnaHQoKSk7XG5cbiAgICAgICAgICAgICAgICAvLyBsZWF2ZSBlYWNoIHBhZ2UgaGlkZGVuLCB3aXRoIGhlaWdodCAwXG4gICAgICAgICAgICAgICAgJHBhZ2UuY3NzKHsgaGVpZ2h0OiAwLCBkaXNwbGF5OiAnbm9uZScgfSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gZ28gdGhyb3VnaCBlYWNoIHBhbmVsIGFuZCBoaWRlIGl0XG4gICAgICAgICAgICB0aGlzLnBhbmVscy5lYWNoKCBmdW5jdGlvbihpbmRleCwgcGFuZWwpIHtcbiAgICAgICAgICAgICAgICB2YXIgJHBhbmVsID0gJChwYW5lbCk7XG4gICAgICAgICAgICAgICAgJHBhbmVsLmNzcyh7IGRpc3BsYXk6ICdub25lJyB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgIF9oaWRlUGFuZWxzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMucGFuZWxzLnJlbW92ZUNsYXNzKHRoaXMub3B0aW9ucy5hY3RpdmVDbGFzcykuY3NzKHsgZGlzcGxheTogJ25vbmUnLCBoZWlnaHQ6IDAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgICAgX3Nob3dQYW5lbDogZnVuY3Rpb24oZXZlbnQsIGRhdGEpIHtcbiAgICAgICAgICAgIHZhciAkcGFuZWwgPSAkKGRhdGEucGFuZWwpO1xuICAgICAgICAgICAgdmFyIGJhc2UgPSBkYXRhLndpZGdldDtcbiAgICAgICAgICAgIC8vICRwYW5lbCBpcyBhIHBhbmVsIHRvIHNob3cuLlxuICAgICAgICAgICAgaWYgKCRwYW5lbC5oYXNDbGFzcyhiYXNlLm9wdGlvbnMuYWN0aXZlQ2xhc3MpKSB7XG4gICAgICAgICAgICAgICAgLy8gPz9cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYmFzZS5faGlkZVBhbmVscygpO1xuICAgICAgICAgICAgICAgICRwYW5lbC5hZGRDbGFzcyhiYXNlLm9wdGlvbnMuYWN0aXZlQ2xhc3MpO1xuICAgICAgICAgICAgICAgICRwYW5lbC5jc3MoeyBkaXNwbGF5OiAnYmxvY2snLCBvcGFjaXR5OiAxIH0pO1xuICAgICAgICAgICAgICAgIHZhciAkcGFnZSA9ICQoJHBhbmVsLmZpbmQoJy4nICsgYmFzZS5vcHRpb25zLnBhZ2VDbGFzcyArICcuJyArIGJhc2Uub3B0aW9ucy5hY3RpdmVDbGFzcykpO1xuICAgICAgICAgICAgICAgIGJhc2UuX3RyaWdnZXIoJ3Nob3dwYWdlJywgZXZlbnQsIHsgcGFuZWw6ICRwYW5lbCwgcGFnZTogJHBhZ2UsIHdpZGdldDogYmFzZSB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICBfc2hvd1BhZ2U6IGZ1bmN0aW9uKGV2ZW50LCBkYXRhKSB7XG4gICAgICAgICAgICB2YXIgYmFzZSA9IGRhdGEud2lkZ2V0O1xuICAgICAgICAgICAgdmFyICRwYW5lbCA9ICQoZGF0YS5wYW5lbCk7XG4gICAgICAgICAgICB2YXIgJHBhZ2UgPSAkKGRhdGEucGFnZSk7XG4gICAgICAgICAgICB2YXIgbmV3SGVpZ2h0ID0gJHBhZ2UuZGF0YSgnb3JpZ2luYWxIZWlnaHQnKTtcblxuICAgICAgICAgICAgLy8gZml4IHRoZSBwYW5lbCdzIGN1cnJlbnQgaGVpZ2h0XG4gICAgICAgICAgICAkcGFuZWwuY3NzKHtoZWlnaHQ6ICRwYW5lbC5oZWlnaHQoKSB9KTtcblxuICAgICAgICAgICAgLy8gZGVhbCB3aXRoIHRoZSBwYWdlIGN1cnJlbnRseSBiZWluZyBkaXNwbGF5ZWRcbiAgICAgICAgICAgIHZhciAkb2xkUGFnZSA9ICRwYW5lbC5maW5kKCcuJyArIGJhc2Uub3B0aW9ucy5wYWdlQ2xhc3MgKyAnLicgKyBiYXNlLm9wdGlvbnMuYWN0aXZlQ2xhc3MpLm5vdCgkcGFnZSk7XG4gICAgICAgICAgICBpZiAoJG9sZFBhZ2UubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICRvbGRQYWdlLmRhdGEoJ29yaWdpbmFsSGVpZ2h0JywgJG9sZFBhZ2Uub3V0ZXJIZWlnaHQoKSk7XG4gICAgICAgICAgICAgICAgJG9sZFBhZ2UucmVtb3ZlQ2xhc3MoYmFzZS5vcHRpb25zLmFjdGl2ZUNsYXNzKS5mYWRlT3V0KCg1MCAqIGJhc2Uub3B0aW9ucy5hbmltYXRpb25GYWN0b3IpLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgJG9sZFBhZ2UuY3NzKHsgaGVpZ2h0OiAwIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBzd2l0Y2ggb24gdGhlIG5ldyBwYWdlIGFuZCBncm93IHRoZSBvcGFuZWwgdG8gaG9sZCBpdFxuICAgICAgICAgICAgJHBhZ2UuY3NzKHsgaGVpZ2h0OiAnYXV0bycgfSkuYWRkQ2xhc3MoYmFzZS5vcHRpb25zLmFjdGl2ZUNsYXNzKS5mYWRlSW4oKDEwMCAqIGJhc2Uub3B0aW9ucy5hbmltYXRpb25GYWN0b3IpLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAkcGFnZS5yZW1vdmVBdHRyKCdzdHlsZScpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB2YXIgYW5pbVRpbWUgPSAoJG9sZFBhZ2UubGVuZ3RoID4gMCA/ICgxMDAgKiBiYXNlLm9wdGlvbnMuYW5pbWF0aW9uRmFjdG9yKSA6ICgxNTAgKiBiYXNlLm9wdGlvbnMuYW5pbWF0aW9uRmFjdG9yKSk7IC8vIGFuaW1hdGUgZmFzdGVyIGlmIGl0J3Mgc3dpdGNoaW5nIHBhZ2VzXG4gICAgICAgICAgICAkcGFuZWwuYW5pbWF0ZSh7IGhlaWdodDogbmV3SGVpZ2h0IH0sIGFuaW1UaW1lLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAkcGFuZWwucmVtb3ZlQXR0cignc3R5bGUnKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH0sXG4gICAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgICAgXzogbnVsbCAvLyBubyBmb2xsb3dpbmcgY29tbWFcbiAgICB9KTtcblxufSkoalF1ZXJ5LCB3aW5kb3csIGRvY3VtZW50KTtcblxuXG5cblxuXG5cblxuXG5cblxuXG5cbiJdfQ==
