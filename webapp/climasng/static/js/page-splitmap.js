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

  if (!String.prototype.startsWith) {
    String.prototype.startsWith = function(searchStr, pos) {
      return this.substr(pos || 0, searchStr.length) === searchStr;
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
    summariesDataUrl: window.mapConfig.summariesDataUrl,
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
      L.control.scale().addTo(this.map);
      L.tileLayer('//server.arcgisonline.com/ArcGIS/rest/services/{variant}/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri',
        variant: 'World_Topo_Map'
      }).addTo(this.map);
      this.leftForm = this.$('.left.form');
      this.buildForm('left');
      this.rightForm = this.$('.right.form');
      this.buildForm('right');
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
        'no.disp': 'no range adaptation',
        'real.disp': 'range adaptation'
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
      var ext, futureModelPoint, isConcern, isRefugia, isRichness, mapInfo, mapUrl, projectionName, sideInfo, url, zipUrl;
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
      isRichness = sideInfo.mapName.startsWith('Richness -');
      isRefugia = sideInfo.mapName.startsWith('Refugia -');
      isConcern = sideInfo.mapName.startsWith('Concern -');
      if (isRichness) {
        projectionName = "prop.richness_" + sideInfo.degs + "_" + sideInfo.range + "_" + sideInfo.confidence;
        if (sideInfo.degs === 'baseline') {
          projectionName = 'current.richness';
        }
      } else if (isRefugia) {
        projectionName = "refuge.certainty_" + sideInfo.degs + "_" + sideInfo.range;
        if (sideInfo.degs === 'baseline') {
          projectionName = 'current.richness';
        }
      } else if (isConcern) {
        projectionName = "AreaOfConcern.certainty_" + sideInfo.degs + "_" + sideInfo.range;
        if (sideInfo.degs === 'baseline') {
          projectionName = 'current.richness';
        }
      } else {
        projectionName = "TEMP_" + sideInfo.degs + "_" + sideInfo.confidence + "." + sideInfo.range;
        if (sideInfo.degs === 'baseline') {
          projectionName = 'current';
        }
      }
      mapInfo = this.mapList[this.nameIndex[sideInfo.mapName]];
      if (mapInfo) {
        url = this.speciesDataUrl;
        ext = '.tif';
        if (mapInfo.type === 'climate') {
          url = this.climateDataUrl;
          ext = '.asc';
        } else if (mapInfo.type === 'richness') {
          url = this.summariesDataUrl;
        }
        mapUrl = [
          this.resolvePlaceholders(url, {
            path: mapInfo.path
          }), projectionName + ext
        ].join('/');
      } else {
        console.log("Can't map that -- no '" + sideInfo.mapName + "' in index");
      }
      return $.ajax({
        url: '/api/preplayer/',
        data: {
          mapInfo: mapInfo
        }
      }).done((function(_this) {
        return function(data) {
          var layer, loadClass, wmsLayer, wmsUrl;
          console.log(['layer prepped, answer is ', data]);
          wmsUrl = data.mapUrl;
          wmsLayer = data.layerName;
          layer = L.tileLayer.wms(wmsUrl, {
            layers: wmsLayer,
            format: 'image/png',
            transparent: true
          });
          loadClass = '' + side + 'loading';
          layer.on('loading', function() {
            return _this.$el.addClass(loadClass);
          });
          layer.on('load', function() {
            return _this.$el.removeClass(loadClass);
          });
          if (side === 'left') {
            if (_this.leftLayer) {
              _this.map.removeLayer(_this.leftLayer);
            }
            _this.leftLayer = layer;
          }
          if (side === 'right') {
            if (_this.rightLayer) {
              _this.map.removeLayer(_this.rightLayer);
            }
            _this.rightLayer = layer;
          }
          layer.addTo(_this.map);
          return _this.resizeThings();
        };
      })(this)).fail((function(_this) {
        return function(jqx, status) {
          return debug(status, 'warning');
        };
      })(this));
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
    buildForm: function(side) {
      var $mapspp;
      debug('AppView.buildForm');
      $mapspp = this.$("#" + side + "mapspp");
      return $mapspp.autocomplete({
        close: (function(_this) {
          return function() {
            return _this.$el.trigger("" + side + "mapupdate");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9wdnJkd2IvcHJvamVjdHMvY2xpbWFzLWdsb2JhbC93ZWJhcHAvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi9Vc2Vycy9wdnJkd2IvcHJvamVjdHMvY2xpbWFzLWdsb2JhbC93ZWJhcHAvY2xpbWFzbmcvc3JjL2pzL2Zha2VfZjMzZDcwMzAuanMiLCIvVXNlcnMvcHZyZHdiL3Byb2plY3RzL2NsaW1hcy1nbG9iYWwvd2ViYXBwL2NsaW1hc25nL3NyYy9qcy9tYXB2aWV3L21haW4uanMiLCIvVXNlcnMvcHZyZHdiL3Byb2plY3RzL2NsaW1hcy1nbG9iYWwvd2ViYXBwL2NsaW1hc25nL3NyYy9qcy9tYXB2aWV3L21vZGVscy9tYXBsYXllci5qcyIsIi9Vc2Vycy9wdnJkd2IvcHJvamVjdHMvY2xpbWFzLWdsb2JhbC93ZWJhcHAvY2xpbWFzbmcvc3JjL2pzL21hcHZpZXcvdXRpbC9zaGltcy5qcyIsIi9Vc2Vycy9wdnJkd2IvcHJvamVjdHMvY2xpbWFzLWdsb2JhbC93ZWJhcHAvY2xpbWFzbmcvc3JjL2pzL21hcHZpZXcvdmlld3MvYXBwLmpzIiwiL1VzZXJzL3B2cmR3Yi9wcm9qZWN0cy9jbGltYXMtZ2xvYmFsL3dlYmFwcC9jbGltYXNuZy9zcmMvanMvbWVudXNhbmRwYW5lbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xlQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcbnJlcXVpcmUoJy4vbWFwdmlldy9tYWluJyk7XG5yZXF1aXJlKCcuL21lbnVzYW5kcGFuZWxzJyk7XG5cbiQoZnVuY3Rpb24oKSB7XG4gICAgLy8gJCgnaGVhZGVyJykuZGlzYWJsZVNlbGVjdGlvbigpOyAvLyB1bnBvcHVsYXIgYnV0IHN0aWxsIGJldHRlclxuICAgICQoJ25hdiA+IHVsJykubXNwcCh7fSk7XG59KTtcbiIsIihmdW5jdGlvbigpIHtcbiAgdmFyIEFwcFZpZXc7XG5cbiAgaWYgKCF3aW5kb3cuY29uc29sZSkge1xuICAgIHdpbmRvdy5jb25zb2xlID0ge1xuICAgICAgbG9nOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHt9O1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICBBcHBWaWV3ID0gcmVxdWlyZSgnLi92aWV3cy9hcHAnKTtcblxuICAkKGZ1bmN0aW9uKCkge1xuICAgIHZhciBhcHB2aWV3O1xuICAgIGFwcHZpZXcgPSBuZXcgQXBwVmlldygpO1xuICAgIHJldHVybiBhcHB2aWV3LnJlbmRlcigpO1xuICB9KTtcblxufSkuY2FsbCh0aGlzKTtcbiIsIihmdW5jdGlvbigpIHtcbiAgdmFyIE1hcExheWVyO1xuXG4gIE1hcExheWVyID0gQmFja2JvbmUuTW9kZWwuZXh0ZW5kKHtcbiAgICBjb25zdHJ1Y3RvcjogZnVuY3Rpb24oc2hvcnROYW1lLCBsb25nTmFtZSwgcGF0aCkge1xuICAgICAgdGhpcy5zaG9ydE5hbWUgPSBzaG9ydE5hbWU7XG4gICAgICB0aGlzLmxvbmdOYW1lID0gbG9uZ05hbWU7XG4gICAgICB0aGlzLnBhdGggPSBwYXRoO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9KTtcblxuICBtb2R1bGUuZXhwb3J0cyA9IE1hcExheWVyO1xuXG59KS5jYWxsKHRoaXMpO1xuIiwiKGZ1bmN0aW9uKCkge1xuICB2YXIgX19pbmRleE9mID0gW10uaW5kZXhPZiB8fCBmdW5jdGlvbihpdGVtKSB7IGZvciAodmFyIGkgPSAwLCBsID0gdGhpcy5sZW5ndGg7IGkgPCBsOyBpKyspIHsgaWYgKGkgaW4gdGhpcyAmJiB0aGlzW2ldID09PSBpdGVtKSByZXR1cm4gaTsgfSByZXR1cm4gLTE7IH07XG5cbiAgaWYgKCFBcnJheS5wcm90b3R5cGUuZm9yRWFjaCkge1xuICAgIEFycmF5LnByb3RvdHlwZS5mb3JFYWNoID0gZnVuY3Rpb24oZm4sIHNjb3BlKSB7XG4gICAgICB2YXIgaSwgX2ksIF9yZWYsIF9yZXN1bHRzO1xuICAgICAgX3Jlc3VsdHMgPSBbXTtcbiAgICAgIGZvciAoaSA9IF9pID0gMCwgX3JlZiA9IHRoaXMubGVuZ3RoOyAwIDw9IF9yZWYgPyBfaSA8PSBfcmVmIDogX2kgPj0gX3JlZjsgaSA9IDAgPD0gX3JlZiA/ICsrX2kgOiAtLV9pKSB7XG4gICAgICAgIF9yZXN1bHRzLnB1c2goX19pbmRleE9mLmNhbGwodGhpcywgaSkgPj0gMCA/IGZuLmNhbGwoc2NvcGUsIHRoaXNbaV0sIGksIHRoaXMpIDogdm9pZCAwKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBfcmVzdWx0cztcbiAgICB9O1xuICB9XG5cbiAgaWYgKCFBcnJheS5wcm90b3R5cGUuaW5kZXhPZikge1xuICAgIEFycmF5LnByb3RvdHlwZS5pbmRleE9mID0gZnVuY3Rpb24obmVlZGxlKSB7XG4gICAgICB2YXIgaSwgX2ksIF9yZWY7XG4gICAgICBmb3IgKGkgPSBfaSA9IDAsIF9yZWYgPSB0aGlzLmxlbmd0aDsgMCA8PSBfcmVmID8gX2kgPD0gX3JlZiA6IF9pID49IF9yZWY7IGkgPSAwIDw9IF9yZWYgPyArK19pIDogLS1faSkge1xuICAgICAgICBpZiAodGhpc1tpXSA9PT0gbmVlZGxlKSB7XG4gICAgICAgICAgcmV0dXJuIGk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiAtMTtcbiAgICB9O1xuICB9XG5cbiAgaWYgKCFTdHJpbmcucHJvdG90eXBlLnN0YXJ0c1dpdGgpIHtcbiAgICBTdHJpbmcucHJvdG90eXBlLnN0YXJ0c1dpdGggPSBmdW5jdGlvbihzZWFyY2hTdHIsIHBvcykge1xuICAgICAgcmV0dXJuIHRoaXMuc3Vic3RyKHBvcyB8fCAwLCBzZWFyY2hTdHIubGVuZ3RoKSA9PT0gc2VhcmNoU3RyO1xuICAgIH07XG4gIH1cblxufSkuY2FsbCh0aGlzKTtcbiIsIihmdW5jdGlvbigpIHtcbiAgdmFyIEFwcFZpZXcsIE1hcExheWVyLCBkZWJ1ZztcblxuICBNYXBMYXllciA9IHJlcXVpcmUoJy4uL21vZGVscy9tYXBsYXllcicpO1xuXG4gIHJlcXVpcmUoJy4uL3V0aWwvc2hpbXMnKTtcblxuXG4gIC8qIGpzaGludCAtVzA5MyAqL1xuXG4gIGRlYnVnID0gZnVuY3Rpb24oaXRlbVRvTG9nLCBpdGVtTGV2ZWwpIHtcbiAgICB2YXIgbGV2ZWxzLCBtZXNzYWdlTnVtLCB0aHJlc2hvbGQsIHRocmVzaG9sZE51bTtcbiAgICBsZXZlbHMgPSBbJ3ZlcnlkZWJ1ZycsICdkZWJ1ZycsICdtZXNzYWdlJywgJ3dhcm5pbmcnXTtcbiAgICBpZiAoIWl0ZW1MZXZlbCkge1xuICAgICAgaXRlbUxldmVsID0gJ2RlYnVnJztcbiAgICB9XG4gICAgdGhyZXNob2xkID0gJ2RlYnVnJztcbiAgICB0aHJlc2hvbGROdW0gPSBsZXZlbHMuaW5kZXhPZih0aHJlc2hvbGQpO1xuICAgIG1lc3NhZ2VOdW0gPSBsZXZlbHMuaW5kZXhPZihpdGVtTGV2ZWwpO1xuICAgIGlmICh0aHJlc2hvbGROdW0gPiBtZXNzYWdlTnVtKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChpdGVtVG9Mb2cgKyAnJyA9PT0gaXRlbVRvTG9nKSB7XG4gICAgICByZXR1cm4gY29uc29sZS5sb2coXCJbXCIgKyBpdGVtTGV2ZWwgKyBcIl0gXCIgKyBpdGVtVG9Mb2cpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gY29uc29sZS5sb2coaXRlbVRvTG9nKTtcbiAgICB9XG4gIH07XG5cbiAgQXBwVmlldyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcbiAgICB0YWdOYW1lOiAnZGl2JyxcbiAgICBjbGFzc05hbWU6ICdzcGxpdG1hcCBzaG93Zm9ybXMnLFxuICAgIGlkOiAnc3BsaXRtYXAnLFxuICAgIHNwZWNpZXNEYXRhVXJsOiB3aW5kb3cubWFwQ29uZmlnLnNwZWNpZXNEYXRhVXJsLFxuICAgIGNsaW1hdGVEYXRhVXJsOiB3aW5kb3cubWFwQ29uZmlnLmNsaW1hdGVEYXRhVXJsLFxuICAgIHN1bW1hcmllc0RhdGFVcmw6IHdpbmRvdy5tYXBDb25maWcuc3VtbWFyaWVzRGF0YVVybCxcbiAgICBiaW9kaXZEYXRhVXJsOiB3aW5kb3cubWFwQ29uZmlnLmJpb2RpdkRhdGFVcmwsXG4gICAgcmFzdGVyQXBpVXJsOiB3aW5kb3cubWFwQ29uZmlnLnJhc3RlckFwaVVybCxcbiAgICB0cmFja1NwbGl0dGVyOiBmYWxzZSxcbiAgICB0cmFja1BlcmlvZDogMTAwLFxuICAgIGV2ZW50czoge1xuICAgICAgJ2NsaWNrIC5idG4tY2hhbmdlJzogJ3RvZ2dsZUZvcm1zJyxcbiAgICAgICdjbGljayAuYnRuLWNvbXBhcmUnOiAndG9nZ2xlU3BsaXR0ZXInLFxuICAgICAgJ2NsaWNrIC5idG4tY29weS5sZWZ0LXZhbGlkLW1hcCc6ICdjb3B5TWFwTGVmdFRvUmlnaHQnLFxuICAgICAgJ2NsaWNrIC5idG4tY29weS5yaWdodC12YWxpZC1tYXAnOiAnY29weU1hcFJpZ2h0VG9MZWZ0JyxcbiAgICAgICdsZWZ0bWFwdXBkYXRlJzogJ2xlZnRTaWRlVXBkYXRlJyxcbiAgICAgICdyaWdodG1hcHVwZGF0ZSc6ICdyaWdodFNpZGVVcGRhdGUnLFxuICAgICAgJ2NoYW5nZSBzZWxlY3QubGVmdCc6ICdsZWZ0U2lkZVVwZGF0ZScsXG4gICAgICAnY2hhbmdlIHNlbGVjdC5yaWdodCc6ICdyaWdodFNpZGVVcGRhdGUnLFxuICAgICAgJ2NoYW5nZSBpbnB1dC5sZWZ0JzogJ2xlZnRTaWRlVXBkYXRlJyxcbiAgICAgICdjaGFuZ2UgaW5wdXQucmlnaHQnOiAncmlnaHRTaWRlVXBkYXRlJyxcbiAgICAgICdjaGFuZ2UgI3N5bmMnOiAndG9nZ2xlU3luYydcbiAgICB9LFxuICAgIHRpY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKGZhbHNlKSB7XG4gICAgICAgIGRlYnVnKHRoaXMubGVmdEluZm8uc2NlbmFyaW8pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZGVidWcoJ3RpY2snKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBzZXRUaW1lb3V0KHRoaXMudGljaywgMTAwMCk7XG4gICAgfSxcbiAgICBpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LmluaXRpYWxpemUnKTtcbiAgICAgIF8uYmluZEFsbC5hcHBseShfLCBbdGhpc10uY29uY2F0KF8uZnVuY3Rpb25zKHRoaXMpKSk7XG4gICAgICB0aGlzLm5hbWVJbmRleCA9IHt9O1xuICAgICAgcmV0dXJuIHRoaXMubWFwTGlzdCA9IHt9O1xuICAgIH0sXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LnJlbmRlcicpO1xuICAgICAgdGhpcy4kZWwuYXBwZW5kKEFwcFZpZXcudGVtcGxhdGVzLmxheW91dCh7XG4gICAgICAgIGxlZnRUYWc6IEFwcFZpZXcudGVtcGxhdGVzLmxlZnRUYWcoKSxcbiAgICAgICAgcmlnaHRUYWc6IEFwcFZpZXcudGVtcGxhdGVzLnJpZ2h0VGFnKCksXG4gICAgICAgIGxlZnRGb3JtOiBBcHBWaWV3LnRlbXBsYXRlcy5sZWZ0Rm9ybSgpLFxuICAgICAgICByaWdodEZvcm06IEFwcFZpZXcudGVtcGxhdGVzLnJpZ2h0Rm9ybSgpXG4gICAgICB9KSk7XG4gICAgICAkKCcjY29udGVudHdyYXAnKS5hcHBlbmQodGhpcy4kZWwpO1xuICAgICAgdGhpcy5tYXAgPSBMLm1hcCgnbWFwJywge1xuICAgICAgICBjZW50ZXI6IFswLCAwXSxcbiAgICAgICAgem9vbTogMlxuICAgICAgfSk7XG4gICAgICB0aGlzLm1hcC5vbignbW92ZScsIHRoaXMucmVzaXplVGhpbmdzKTtcbiAgICAgIEwuY29udHJvbC5zY2FsZSgpLmFkZFRvKHRoaXMubWFwKTtcbiAgICAgIEwudGlsZUxheWVyKCcvL3NlcnZlci5hcmNnaXNvbmxpbmUuY29tL0FyY0dJUy9yZXN0L3NlcnZpY2VzL3t2YXJpYW50fS9NYXBTZXJ2ZXIvdGlsZS97en0ve3l9L3t4fScsIHtcbiAgICAgICAgYXR0cmlidXRpb246ICdUaWxlcyAmY29weTsgRXNyaScsXG4gICAgICAgIHZhcmlhbnQ6ICdXb3JsZF9Ub3BvX01hcCdcbiAgICAgIH0pLmFkZFRvKHRoaXMubWFwKTtcbiAgICAgIHRoaXMubGVmdEZvcm0gPSB0aGlzLiQoJy5sZWZ0LmZvcm0nKTtcbiAgICAgIHRoaXMuYnVpbGRGb3JtKCdsZWZ0Jyk7XG4gICAgICB0aGlzLnJpZ2h0Rm9ybSA9IHRoaXMuJCgnLnJpZ2h0LmZvcm0nKTtcbiAgICAgIHRoaXMuYnVpbGRGb3JtKCdyaWdodCcpO1xuICAgICAgdGhpcy5sZWZ0VGFnID0gdGhpcy4kKCcubGVmdC50YWcnKTtcbiAgICAgIHRoaXMucmlnaHRUYWcgPSB0aGlzLiQoJy5yaWdodC50YWcnKTtcbiAgICAgIHRoaXMuc3BsaXRMaW5lID0gdGhpcy4kKCcuc3BsaXRsaW5lJyk7XG4gICAgICB0aGlzLnNwbGl0VGh1bWIgPSB0aGlzLiQoJy5zcGxpdHRodW1iJyk7XG4gICAgICB0aGlzLmxlZnRTaWRlVXBkYXRlKCk7XG4gICAgICB0aGlzLnJpZ2h0U2lkZVVwZGF0ZSgpO1xuICAgICAgcmV0dXJuIHRoaXMudG9nZ2xlU3BsaXR0ZXIoKTtcbiAgICB9LFxuICAgIHJlc29sdmVQbGFjZWhvbGRlcnM6IGZ1bmN0aW9uKHN0cldpdGhQbGFjZWhvbGRlcnMsIHJlcGxhY2VtZW50cykge1xuICAgICAgdmFyIGFucywga2V5LCByZSwgdmFsdWU7XG4gICAgICBhbnMgPSBzdHJXaXRoUGxhY2Vob2xkZXJzO1xuICAgICAgYW5zID0gYW5zLnJlcGxhY2UoL1xce1xce1xccypsb2NhdGlvbi5wcm90b2NvbFxccypcXH1cXH0vZywgbG9jYXRpb24ucHJvdG9jb2wpO1xuICAgICAgYW5zID0gYW5zLnJlcGxhY2UoL1xce1xce1xccypsb2NhdGlvbi5ob3N0XFxzKlxcfVxcfS9nLCBsb2NhdGlvbi5ob3N0KTtcbiAgICAgIGFucyA9IGFucy5yZXBsYWNlKC9cXHtcXHtcXHMqbG9jYXRpb24uaG9zdG5hbWVcXHMqXFx9XFx9L2csIGxvY2F0aW9uLmhvc3RuYW1lKTtcbiAgICAgIGZvciAoa2V5IGluIHJlcGxhY2VtZW50cykge1xuICAgICAgICB2YWx1ZSA9IHJlcGxhY2VtZW50c1trZXldO1xuICAgICAgICByZSA9IG5ldyBSZWdFeHAoXCJcXFxce1xcXFx7XFxcXHMqXCIgKyBrZXkgKyBcIlxcXFxzKlxcXFx9XFxcXH1cIiwgXCJnXCIpO1xuICAgICAgICBhbnMgPSBhbnMucmVwbGFjZShyZSwgdmFsdWUpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGFucztcbiAgICB9LFxuICAgIGNvcHlNYXBMZWZ0VG9SaWdodDogZnVuY3Rpb24oKSB7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5jb3B5TWFwTGVmdFRvUmlnaHQnKTtcbiAgICAgIGlmICghdGhpcy5sZWZ0SW5mbykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB0aGlzLiQoJyNyaWdodG1hcHNwcCcpLnZhbCh0aGlzLmxlZnRJbmZvLm1hcE5hbWUpO1xuICAgICAgdGhpcy4kKCcjcmlnaHRtYXB5ZWFyJykudmFsKHRoaXMubGVmdEluZm8ueWVhcik7XG4gICAgICB0aGlzLiQoJ2lucHV0W25hbWU9cmlnaHRtYXBzY2VuYXJpb10nKS5lYWNoKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oaW5kZXgsIGl0ZW0pIHtcbiAgICAgICAgICByZXR1cm4gJChpdGVtKS5wcm9wKCdjaGVja2VkJywgJChpdGVtKS52YWwoKSA9PT0gX3RoaXMubGVmdEluZm8uc2NlbmFyaW8pO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpO1xuICAgICAgdGhpcy4kKCcjcmlnaHRtYXBnY20nKS52YWwodGhpcy5sZWZ0SW5mby5nY20pO1xuICAgICAgcmV0dXJuIHRoaXMucmlnaHRTaWRlVXBkYXRlKCk7XG4gICAgfSxcbiAgICBjb3B5TWFwUmlnaHRUb0xlZnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgZGVidWcoJ0FwcFZpZXcuY29weU1hcFJpZ2h0VG9MZWZ0Jyk7XG4gICAgICBpZiAoIXRoaXMucmlnaHRJbmZvKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHRoaXMuJCgnI2xlZnRtYXBzcHAnKS52YWwodGhpcy5yaWdodEluZm8ubWFwTmFtZSk7XG4gICAgICB0aGlzLiQoJyNsZWZ0bWFweWVhcicpLnZhbCh0aGlzLnJpZ2h0SW5mby55ZWFyKTtcbiAgICAgIHRoaXMuJCgnaW5wdXRbbmFtZT1sZWZ0bWFwc2NlbmFyaW9dJykuZWFjaCgoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGluZGV4LCBpdGVtKSB7XG4gICAgICAgICAgcmV0dXJuICQoaXRlbSkucHJvcCgnY2hlY2tlZCcsICQoaXRlbSkudmFsKCkgPT09IF90aGlzLnJpZ2h0SW5mby5zY2VuYXJpbyk7XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKSk7XG4gICAgICB0aGlzLiQoJyNsZWZ0bWFwZ2NtJykudmFsKHRoaXMucmlnaHRJbmZvLmdjbSk7XG4gICAgICByZXR1cm4gdGhpcy5sZWZ0U2lkZVVwZGF0ZSgpO1xuICAgIH0sXG4gICAgc2lkZVVwZGF0ZTogZnVuY3Rpb24oc2lkZSkge1xuICAgICAgdmFyIGF0QmFzZWxpbmUsIGN1cnJJbmZvLCBuZXdJbmZvO1xuICAgICAgZGVidWcoJ0FwcFZpZXcuc2lkZVVwZGF0ZSAoJyArIHNpZGUgKyAnKScpO1xuICAgICAgbmV3SW5mbyA9IHtcbiAgICAgICAgbWFwTmFtZTogdGhpcy4kKCcjJyArIHNpZGUgKyAnbWFwc3BwJykudmFsKCksXG4gICAgICAgIGRlZ3M6IHRoaXMuJCgnIycgKyBzaWRlICsgJ21hcGRlZ3MnKS52YWwoKSxcbiAgICAgICAgcmFuZ2U6IHRoaXMuJCgnaW5wdXRbbmFtZT0nICsgc2lkZSArICdtYXByYW5nZV06Y2hlY2tlZCcpLnZhbCgpLFxuICAgICAgICBjb25maWRlbmNlOiB0aGlzLiQoJyMnICsgc2lkZSArICdtYXBjb25maWRlbmNlJykudmFsKClcbiAgICAgIH07XG4gICAgICBhdEJhc2VsaW5lID0gbmV3SW5mby5kZWdzID09PSAnYmFzZWxpbmUnO1xuICAgICAgdGhpcy4kKFwiaW5wdXRbbmFtZT1cIiArIHNpZGUgKyBcIm1hcHJhbmdlXSwgI1wiICsgc2lkZSArIFwibWFwY29uZmlkZW5jZVwiKS5wcm9wKCdkaXNhYmxlZCcsIGF0QmFzZWxpbmUpO1xuICAgICAgdGhpcy4kKFwiLlwiICsgc2lkZSArIFwiLnNpZGUuZm9ybSBmaWVsZHNldFwiKS5yZW1vdmVDbGFzcygnZGlzYWJsZWQnKTtcbiAgICAgIHRoaXMuJChcImlucHV0W25hbWVePVwiICsgc2lkZSArIFwiXTpkaXNhYmxlZCwgW2lkXj1cIiArIHNpZGUgKyBcIl06ZGlzYWJsZWRcIikuY2xvc2VzdCgnZmllbGRzZXQnKS5hZGRDbGFzcygnZGlzYWJsZWQnKTtcbiAgICAgIGlmIChuZXdJbmZvLm1hcE5hbWUgaW4gdGhpcy5uYW1lSW5kZXgpIHtcbiAgICAgICAgdGhpcy4kKFwiLlwiICsgc2lkZSArIFwiLXZhbGlkLW1hcFwiKS5yZW1vdmVDbGFzcygnZGlzYWJsZWQnKS5wcm9wKCdkaXNhYmxlZCcsIGZhbHNlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuJChcIi5cIiArIHNpZGUgKyBcIi12YWxpZC1tYXBcIikuYWRkQ2xhc3MoJ2Rpc2FibGVkJykucHJvcCgnZGlzYWJsZWQnLCB0cnVlKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgY3VyckluZm8gPSBzaWRlID09PSAnbGVmdCcgPyB0aGlzLmxlZnRJbmZvIDogdGhpcy5yaWdodEluZm87XG4gICAgICBpZiAoY3VyckluZm8gJiYgXy5pc0VxdWFsKG5ld0luZm8sIGN1cnJJbmZvKSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICBpZiAoY3VyckluZm8gJiYgbmV3SW5mby5tYXBOYW1lID09PSBjdXJySW5mby5tYXBOYW1lICYmIG5ld0luZm8uZGVncyA9PT0gY3VyckluZm8uZGVncyAmJiBuZXdJbmZvLmRlZ3MgPT09ICdiYXNlbGluZScpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgaWYgKHNpZGUgPT09ICdsZWZ0Jykge1xuICAgICAgICB0aGlzLmxlZnRJbmZvID0gbmV3SW5mbztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMucmlnaHRJbmZvID0gbmV3SW5mbztcbiAgICAgIH1cbiAgICAgIHRoaXMuYWRkTWFwTGF5ZXIoc2lkZSk7XG4gICAgICByZXR1cm4gdGhpcy5hZGRNYXBUYWcoc2lkZSk7XG4gICAgfSxcbiAgICBsZWZ0U2lkZVVwZGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNpZGVVcGRhdGUoJ2xlZnQnKTtcbiAgICAgIGlmICh0aGlzLiQoJyNzeW5jJylbMF0uY2hlY2tlZCkge1xuICAgICAgICBkZWJ1ZygnU3luYyBjaGVja2VkIC0gc3luY2luZyByaWdodCBzaWRlJywgJ21lc3NhZ2UnKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29weVNwcFRvUmlnaHRTaWRlKCk7XG4gICAgICB9XG4gICAgfSxcbiAgICByaWdodFNpZGVVcGRhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuc2lkZVVwZGF0ZSgncmlnaHQnKTtcbiAgICB9LFxuICAgIGNvcHlTcHBUb1JpZ2h0U2lkZTogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLiQoJyNyaWdodG1hcHNwcCcpLnZhbCh0aGlzLiQoJyNsZWZ0bWFwc3BwJykudmFsKCkpO1xuICAgICAgcmV0dXJuIHRoaXMucmlnaHRTaWRlVXBkYXRlKCk7XG4gICAgfSxcbiAgICBhZGRNYXBUYWc6IGZ1bmN0aW9uKHNpZGUpIHtcbiAgICAgIHZhciBkaXNwTG9va3VwLCBpbmZvLCB0YWc7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5hZGRNYXBUYWcnKTtcbiAgICAgIGlmIChzaWRlID09PSAnbGVmdCcpIHtcbiAgICAgICAgaW5mbyA9IHRoaXMubGVmdEluZm87XG4gICAgICB9XG4gICAgICBpZiAoc2lkZSA9PT0gJ3JpZ2h0Jykge1xuICAgICAgICBpbmZvID0gdGhpcy5yaWdodEluZm87XG4gICAgICB9XG4gICAgICB0YWcgPSBcIjxiPjxpPlwiICsgaW5mby5tYXBOYW1lICsgXCI8L2k+PC9iPlwiO1xuICAgICAgZGlzcExvb2t1cCA9IHtcbiAgICAgICAgJ25vLmRpc3AnOiAnbm8gcmFuZ2UgYWRhcHRhdGlvbicsXG4gICAgICAgICdyZWFsLmRpc3AnOiAncmFuZ2UgYWRhcHRhdGlvbidcbiAgICAgIH07XG4gICAgICBpZiAoaW5mby5kZWdzID09PSAnYmFzZWxpbmUnKSB7XG4gICAgICAgIHRhZyA9IFwiYmFzZWxpbmUgXCIgKyB0YWcgKyBcIiBkaXN0cmlidXRpb25cIjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRhZyA9IFwiPGI+XCIgKyBpbmZvLmNvbmZpZGVuY2UgKyBcIjwvYj4gcGVyY2VudGlsZSBwcm9qZWN0aW9ucyBmb3IgXCIgKyB0YWcgKyBcIiBhdCA8Yj4rXCIgKyBpbmZvLmRlZ3MgKyBcIiZkZWc7QzwvYj4gd2l0aCA8Yj5cIiArIGRpc3BMb29rdXBbaW5mby5yYW5nZV0gKyBcIjwvYj5cIjtcbiAgICAgIH1cbiAgICAgIGlmIChzaWRlID09PSAnbGVmdCcpIHtcbiAgICAgICAgdGhpcy5sZWZ0VGFnLmZpbmQoJy5sZWZ0bGF5ZXJuYW1lJykuaHRtbCh0YWcpO1xuICAgICAgfVxuICAgICAgaWYgKHNpZGUgPT09ICdyaWdodCcpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucmlnaHRUYWcuZmluZCgnLnJpZ2h0bGF5ZXJuYW1lJykuaHRtbCh0YWcpO1xuICAgICAgfVxuICAgIH0sXG4gICAgYWRkTWFwTGF5ZXI6IGZ1bmN0aW9uKHNpZGUpIHtcbiAgICAgIHZhciBleHQsIGZ1dHVyZU1vZGVsUG9pbnQsIGlzQ29uY2VybiwgaXNSZWZ1Z2lhLCBpc1JpY2huZXNzLCBtYXBJbmZvLCBtYXBVcmwsIHByb2plY3Rpb25OYW1lLCBzaWRlSW5mbywgdXJsLCB6aXBVcmw7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5hZGRNYXBMYXllcicpO1xuICAgICAgaWYgKHNpZGUgPT09ICdsZWZ0Jykge1xuICAgICAgICBzaWRlSW5mbyA9IHRoaXMubGVmdEluZm87XG4gICAgICB9XG4gICAgICBpZiAoc2lkZSA9PT0gJ3JpZ2h0Jykge1xuICAgICAgICBzaWRlSW5mbyA9IHRoaXMucmlnaHRJbmZvO1xuICAgICAgfVxuICAgICAgZnV0dXJlTW9kZWxQb2ludCA9ICcnO1xuICAgICAgbWFwVXJsID0gJyc7XG4gICAgICB6aXBVcmwgPSAnJztcbiAgICAgIGlzUmljaG5lc3MgPSBzaWRlSW5mby5tYXBOYW1lLnN0YXJ0c1dpdGgoJ1JpY2huZXNzIC0nKTtcbiAgICAgIGlzUmVmdWdpYSA9IHNpZGVJbmZvLm1hcE5hbWUuc3RhcnRzV2l0aCgnUmVmdWdpYSAtJyk7XG4gICAgICBpc0NvbmNlcm4gPSBzaWRlSW5mby5tYXBOYW1lLnN0YXJ0c1dpdGgoJ0NvbmNlcm4gLScpO1xuICAgICAgaWYgKGlzUmljaG5lc3MpIHtcbiAgICAgICAgcHJvamVjdGlvbk5hbWUgPSBcInByb3AucmljaG5lc3NfXCIgKyBzaWRlSW5mby5kZWdzICsgXCJfXCIgKyBzaWRlSW5mby5yYW5nZSArIFwiX1wiICsgc2lkZUluZm8uY29uZmlkZW5jZTtcbiAgICAgICAgaWYgKHNpZGVJbmZvLmRlZ3MgPT09ICdiYXNlbGluZScpIHtcbiAgICAgICAgICBwcm9qZWN0aW9uTmFtZSA9ICdjdXJyZW50LnJpY2huZXNzJztcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChpc1JlZnVnaWEpIHtcbiAgICAgICAgcHJvamVjdGlvbk5hbWUgPSBcInJlZnVnZS5jZXJ0YWludHlfXCIgKyBzaWRlSW5mby5kZWdzICsgXCJfXCIgKyBzaWRlSW5mby5yYW5nZTtcbiAgICAgICAgaWYgKHNpZGVJbmZvLmRlZ3MgPT09ICdiYXNlbGluZScpIHtcbiAgICAgICAgICBwcm9qZWN0aW9uTmFtZSA9ICdjdXJyZW50LnJpY2huZXNzJztcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChpc0NvbmNlcm4pIHtcbiAgICAgICAgcHJvamVjdGlvbk5hbWUgPSBcIkFyZWFPZkNvbmNlcm4uY2VydGFpbnR5X1wiICsgc2lkZUluZm8uZGVncyArIFwiX1wiICsgc2lkZUluZm8ucmFuZ2U7XG4gICAgICAgIGlmIChzaWRlSW5mby5kZWdzID09PSAnYmFzZWxpbmUnKSB7XG4gICAgICAgICAgcHJvamVjdGlvbk5hbWUgPSAnY3VycmVudC5yaWNobmVzcyc7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHByb2plY3Rpb25OYW1lID0gXCJURU1QX1wiICsgc2lkZUluZm8uZGVncyArIFwiX1wiICsgc2lkZUluZm8uY29uZmlkZW5jZSArIFwiLlwiICsgc2lkZUluZm8ucmFuZ2U7XG4gICAgICAgIGlmIChzaWRlSW5mby5kZWdzID09PSAnYmFzZWxpbmUnKSB7XG4gICAgICAgICAgcHJvamVjdGlvbk5hbWUgPSAnY3VycmVudCc7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIG1hcEluZm8gPSB0aGlzLm1hcExpc3RbdGhpcy5uYW1lSW5kZXhbc2lkZUluZm8ubWFwTmFtZV1dO1xuICAgICAgaWYgKG1hcEluZm8pIHtcbiAgICAgICAgdXJsID0gdGhpcy5zcGVjaWVzRGF0YVVybDtcbiAgICAgICAgZXh0ID0gJy50aWYnO1xuICAgICAgICBpZiAobWFwSW5mby50eXBlID09PSAnY2xpbWF0ZScpIHtcbiAgICAgICAgICB1cmwgPSB0aGlzLmNsaW1hdGVEYXRhVXJsO1xuICAgICAgICAgIGV4dCA9ICcuYXNjJztcbiAgICAgICAgfSBlbHNlIGlmIChtYXBJbmZvLnR5cGUgPT09ICdyaWNobmVzcycpIHtcbiAgICAgICAgICB1cmwgPSB0aGlzLnN1bW1hcmllc0RhdGFVcmw7XG4gICAgICAgIH1cbiAgICAgICAgbWFwVXJsID0gW1xuICAgICAgICAgIHRoaXMucmVzb2x2ZVBsYWNlaG9sZGVycyh1cmwsIHtcbiAgICAgICAgICAgIHBhdGg6IG1hcEluZm8ucGF0aFxuICAgICAgICAgIH0pLCBwcm9qZWN0aW9uTmFtZSArIGV4dFxuICAgICAgICBdLmpvaW4oJy8nKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiQ2FuJ3QgbWFwIHRoYXQgLS0gbm8gJ1wiICsgc2lkZUluZm8ubWFwTmFtZSArIFwiJyBpbiBpbmRleFwiKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiAkLmFqYXgoe1xuICAgICAgICB1cmw6ICcvYXBpL3ByZXBsYXllci8nLFxuICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgbWFwSW5mbzogbWFwSW5mb1xuICAgICAgICB9XG4gICAgICB9KS5kb25lKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgIHZhciBsYXllciwgbG9hZENsYXNzLCB3bXNMYXllciwgd21zVXJsO1xuICAgICAgICAgIGNvbnNvbGUubG9nKFsnbGF5ZXIgcHJlcHBlZCwgYW5zd2VyIGlzICcsIGRhdGFdKTtcbiAgICAgICAgICB3bXNVcmwgPSBkYXRhLm1hcFVybDtcbiAgICAgICAgICB3bXNMYXllciA9IGRhdGEubGF5ZXJOYW1lO1xuICAgICAgICAgIGxheWVyID0gTC50aWxlTGF5ZXIud21zKHdtc1VybCwge1xuICAgICAgICAgICAgbGF5ZXJzOiB3bXNMYXllcixcbiAgICAgICAgICAgIGZvcm1hdDogJ2ltYWdlL3BuZycsXG4gICAgICAgICAgICB0cmFuc3BhcmVudDogdHJ1ZVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGxvYWRDbGFzcyA9ICcnICsgc2lkZSArICdsb2FkaW5nJztcbiAgICAgICAgICBsYXllci5vbignbG9hZGluZycsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIF90aGlzLiRlbC5hZGRDbGFzcyhsb2FkQ2xhc3MpO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIGxheWVyLm9uKCdsb2FkJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gX3RoaXMuJGVsLnJlbW92ZUNsYXNzKGxvYWRDbGFzcyk7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgaWYgKHNpZGUgPT09ICdsZWZ0Jykge1xuICAgICAgICAgICAgaWYgKF90aGlzLmxlZnRMYXllcikge1xuICAgICAgICAgICAgICBfdGhpcy5tYXAucmVtb3ZlTGF5ZXIoX3RoaXMubGVmdExheWVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF90aGlzLmxlZnRMYXllciA9IGxheWVyO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoc2lkZSA9PT0gJ3JpZ2h0Jykge1xuICAgICAgICAgICAgaWYgKF90aGlzLnJpZ2h0TGF5ZXIpIHtcbiAgICAgICAgICAgICAgX3RoaXMubWFwLnJlbW92ZUxheWVyKF90aGlzLnJpZ2h0TGF5ZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgX3RoaXMucmlnaHRMYXllciA9IGxheWVyO1xuICAgICAgICAgIH1cbiAgICAgICAgICBsYXllci5hZGRUbyhfdGhpcy5tYXApO1xuICAgICAgICAgIHJldHVybiBfdGhpcy5yZXNpemVUaGluZ3MoKTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKS5mYWlsKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oanF4LCBzdGF0dXMpIHtcbiAgICAgICAgICByZXR1cm4gZGVidWcoc3RhdHVzLCAnd2FybmluZycpO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpO1xuICAgIH0sXG4gICAgY2VudHJlTWFwOiBmdW5jdGlvbihyZXBlYXRlZGx5Rm9yKSB7XG4gICAgICB2YXIgbGF0ZXIsIHJlY2VudHJlLCBfaSwgX3Jlc3VsdHM7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5jZW50cmVNYXAnKTtcbiAgICAgIGlmICghcmVwZWF0ZWRseUZvcikge1xuICAgICAgICByZXBlYXRlZGx5Rm9yID0gNTAwO1xuICAgICAgfVxuICAgICAgcmVjZW50cmUgPSAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIF90aGlzLm1hcC5pbnZhbGlkYXRlU2l6ZShmYWxzZSk7XG4gICAgICAgICAgcmV0dXJuIF90aGlzLnJlc2l6ZVRoaW5ncygpO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcyk7XG4gICAgICBfcmVzdWx0cyA9IFtdO1xuICAgICAgZm9yIChsYXRlciA9IF9pID0gMDsgX2kgPD0gcmVwZWF0ZWRseUZvcjsgbGF0ZXIgPSBfaSArPSAyNSkge1xuICAgICAgICBfcmVzdWx0cy5wdXNoKHNldFRpbWVvdXQocmVjZW50cmUsIGxhdGVyKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gX3Jlc3VsdHM7XG4gICAgfSxcbiAgICB0b2dnbGVGb3JtczogZnVuY3Rpb24oKSB7XG4gICAgICBkZWJ1ZygnQXBwVmlldy50b2dnbGVGb3JtcycpO1xuICAgICAgdGhpcy4kZWwudG9nZ2xlQ2xhc3MoJ3Nob3dmb3JtcycpO1xuICAgICAgcmV0dXJuIHRoaXMuY2VudHJlTWFwKCk7XG4gICAgfSxcbiAgICB0b2dnbGVTcGxpdHRlcjogZnVuY3Rpb24oKSB7XG4gICAgICBkZWJ1ZygnQXBwVmlldy50b2dnbGVTcGxpdHRlcicpO1xuICAgICAgdGhpcy4kZWwudG9nZ2xlQ2xhc3MoJ3NwbGl0Jyk7XG4gICAgICBpZiAodGhpcy4kZWwuaGFzQ2xhc3MoJ3NwbGl0JykpIHtcbiAgICAgICAgdGhpcy5hY3RpdmF0ZVNwbGl0dGVyKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmRlYWN0aXZhdGVTcGxpdHRlcigpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMuY2VudHJlTWFwKCk7XG4gICAgfSxcbiAgICB0b2dnbGVTeW5jOiBmdW5jdGlvbigpIHtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LnRvZ2dsZVN5bmMnKTtcbiAgICAgIGlmICh0aGlzLiQoJyNzeW5jJylbMF0uY2hlY2tlZCkge1xuICAgICAgICB0aGlzLiQoJy5yaWdodG1hcHNwcCcpLnByb3AoJ2Rpc2FibGVkJywgdHJ1ZSk7XG4gICAgICAgIHJldHVybiB0aGlzLmNvcHlTcHBUb1JpZ2h0U2lkZSgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuJCgnLnJpZ2h0bWFwc3BwJykucHJvcCgnZGlzYWJsZWQnLCBmYWxzZSk7XG4gICAgICB9XG4gICAgfSxcbiAgICBidWlsZEZvcm06IGZ1bmN0aW9uKHNpZGUpIHtcbiAgICAgIHZhciAkbWFwc3BwO1xuICAgICAgZGVidWcoJ0FwcFZpZXcuYnVpbGRGb3JtJyk7XG4gICAgICAkbWFwc3BwID0gdGhpcy4kKFwiI1wiICsgc2lkZSArIFwibWFwc3BwXCIpO1xuICAgICAgcmV0dXJuICRtYXBzcHAuYXV0b2NvbXBsZXRlKHtcbiAgICAgICAgY2xvc2U6IChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBfdGhpcy4kZWwudHJpZ2dlcihcIlwiICsgc2lkZSArIFwibWFwdXBkYXRlXCIpO1xuICAgICAgICAgIH07XG4gICAgICAgIH0pKHRoaXMpLFxuICAgICAgICBzb3VyY2U6IChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICAgIHJldHVybiBmdW5jdGlvbihyZXEsIHJlc3BvbnNlKSB7XG4gICAgICAgICAgICByZXR1cm4gJC5hamF4KHtcbiAgICAgICAgICAgICAgdXJsOiAnL2FwaS9uYW1lc2VhcmNoLycsXG4gICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICB0ZXJtOiByZXEudGVybVxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbihhbnN3ZXIpIHtcbiAgICAgICAgICAgICAgICB2YXIgaW5mbywgbmljZSwgc2VsZWN0YWJsZTtcbiAgICAgICAgICAgICAgICBzZWxlY3RhYmxlID0gW107XG4gICAgICAgICAgICAgICAgZm9yIChuaWNlIGluIGFuc3dlcikge1xuICAgICAgICAgICAgICAgICAgaW5mbyA9IGFuc3dlcltuaWNlXTtcbiAgICAgICAgICAgICAgICAgIHNlbGVjdGFibGUucHVzaChuaWNlKTtcbiAgICAgICAgICAgICAgICAgIF90aGlzLm1hcExpc3RbaW5mby5tYXBJZF0gPSBpbmZvO1xuICAgICAgICAgICAgICAgICAgX3RoaXMubmFtZUluZGV4W25pY2VdID0gaW5mby5tYXBJZDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYW5zd2VyKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhzZWxlY3RhYmxlKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2Uoc2VsZWN0YWJsZSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH07XG4gICAgICAgIH0pKHRoaXMpXG4gICAgICB9KTtcbiAgICB9LFxuICAgIHN0YXJ0U3BsaXR0ZXJUcmFja2luZzogZnVuY3Rpb24oKSB7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5zdGFydFNwbGl0dGVyVHJhY2tpbmcnKTtcbiAgICAgIHRoaXMudHJhY2tTcGxpdHRlciA9IHRydWU7XG4gICAgICB0aGlzLnNwbGl0TGluZS5hZGRDbGFzcygnZHJhZ2dpbmcnKTtcbiAgICAgIHJldHVybiB0aGlzLmxvY2F0ZVNwbGl0dGVyKCk7XG4gICAgfSxcbiAgICBsb2NhdGVTcGxpdHRlcjogZnVuY3Rpb24oKSB7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5sb2NhdGVTcGxpdHRlcicpO1xuICAgICAgaWYgKHRoaXMudHJhY2tTcGxpdHRlcikge1xuICAgICAgICB0aGlzLnJlc2l6ZVRoaW5ncygpO1xuICAgICAgICBpZiAodGhpcy50cmFja1NwbGl0dGVyID09PSAwKSB7XG4gICAgICAgICAgdGhpcy50cmFja1NwbGl0dGVyID0gZmFsc2U7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy50cmFja1NwbGl0dGVyICE9PSB0cnVlKSB7XG4gICAgICAgICAgdGhpcy50cmFja1NwbGl0dGVyIC09IDE7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQodGhpcy5sb2NhdGVTcGxpdHRlciwgdGhpcy50cmFja1BlcmlvZCk7XG4gICAgICB9XG4gICAgfSxcbiAgICByZXNpemVUaGluZ3M6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyICRtYXBCb3gsIGJvdHRvbVJpZ2h0LCBsYXllckJvdHRvbSwgbGF5ZXJUb3AsIGxlZnRMZWZ0LCBsZWZ0TWFwLCBtYXBCb3VuZHMsIG1hcEJveCwgbmV3TGVmdFdpZHRoLCByaWdodE1hcCwgcmlnaHRSaWdodCwgc3BsaXRQb2ludCwgc3BsaXRYLCB0b3BMZWZ0O1xuICAgICAgZGVidWcoJ0FwcFZpZXcucmVzaXplVGhpbmdzJyk7XG4gICAgICBpZiAodGhpcy5sZWZ0TGF5ZXIpIHtcbiAgICAgICAgbGVmdE1hcCA9ICQodGhpcy5sZWZ0TGF5ZXIuZ2V0Q29udGFpbmVyKCkpO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMucmlnaHRMYXllcikge1xuICAgICAgICByaWdodE1hcCA9ICQodGhpcy5yaWdodExheWVyLmdldENvbnRhaW5lcigpKTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLiRlbC5oYXNDbGFzcygnc3BsaXQnKSkge1xuICAgICAgICBuZXdMZWZ0V2lkdGggPSB0aGlzLnNwbGl0VGh1bWIucG9zaXRpb24oKS5sZWZ0ICsgKHRoaXMuc3BsaXRUaHVtYi53aWR0aCgpIC8gMi4wKTtcbiAgICAgICAgbWFwQm94ID0gdGhpcy5tYXAuZ2V0Q29udGFpbmVyKCk7XG4gICAgICAgICRtYXBCb3ggPSAkKG1hcEJveCk7XG4gICAgICAgIG1hcEJvdW5kcyA9IG1hcEJveC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgdG9wTGVmdCA9IHRoaXMubWFwLmNvbnRhaW5lclBvaW50VG9MYXllclBvaW50KFswLCAwXSk7XG4gICAgICAgIHNwbGl0UG9pbnQgPSB0aGlzLm1hcC5jb250YWluZXJQb2ludFRvTGF5ZXJQb2ludChbbmV3TGVmdFdpZHRoLCAwXSk7XG4gICAgICAgIGJvdHRvbVJpZ2h0ID0gdGhpcy5tYXAuY29udGFpbmVyUG9pbnRUb0xheWVyUG9pbnQoWyRtYXBCb3gud2lkdGgoKSwgJG1hcEJveC5oZWlnaHQoKV0pO1xuICAgICAgICBsYXllclRvcCA9IHRvcExlZnQueTtcbiAgICAgICAgbGF5ZXJCb3R0b20gPSBib3R0b21SaWdodC55O1xuICAgICAgICBzcGxpdFggPSBzcGxpdFBvaW50LnggLSBtYXBCb3VuZHMubGVmdDtcbiAgICAgICAgbGVmdExlZnQgPSB0b3BMZWZ0LnggLSBtYXBCb3VuZHMubGVmdDtcbiAgICAgICAgcmlnaHRSaWdodCA9IGJvdHRvbVJpZ2h0Lng7XG4gICAgICAgIHRoaXMuc3BsaXRMaW5lLmNzcygnbGVmdCcsIG5ld0xlZnRXaWR0aCk7XG4gICAgICAgIHRoaXMubGVmdFRhZy5hdHRyKCdzdHlsZScsIFwiY2xpcDogcmVjdCgwLCBcIiArIG5ld0xlZnRXaWR0aCArIFwicHgsIGF1dG8sIDApXCIpO1xuICAgICAgICBpZiAodGhpcy5sZWZ0TGF5ZXIpIHtcbiAgICAgICAgICBsZWZ0TWFwLmF0dHIoJ3N0eWxlJywgXCJjbGlwOiByZWN0KFwiICsgbGF5ZXJUb3AgKyBcInB4LCBcIiArIHNwbGl0WCArIFwicHgsIFwiICsgbGF5ZXJCb3R0b20gKyBcInB4LCBcIiArIGxlZnRMZWZ0ICsgXCJweClcIik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMucmlnaHRMYXllcikge1xuICAgICAgICAgIHJldHVybiByaWdodE1hcC5hdHRyKCdzdHlsZScsIFwiY2xpcDogcmVjdChcIiArIGxheWVyVG9wICsgXCJweCwgXCIgKyByaWdodFJpZ2h0ICsgXCJweCwgXCIgKyBsYXllckJvdHRvbSArIFwicHgsIFwiICsgc3BsaXRYICsgXCJweClcIik7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMubGVmdFRhZy5hdHRyKCdzdHlsZScsICdjbGlwOiBpbmhlcml0Jyk7XG4gICAgICAgIGlmICh0aGlzLmxlZnRMYXllcikge1xuICAgICAgICAgIGxlZnRNYXAuYXR0cignc3R5bGUnLCAnY2xpcDogaW5oZXJpdCcpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnJpZ2h0TGF5ZXIpIHtcbiAgICAgICAgICByZXR1cm4gcmlnaHRNYXAuYXR0cignc3R5bGUnLCAnY2xpcDogcmVjdCgwLDAsMCwwKScpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICBzdG9wU3BsaXR0ZXJUcmFja2luZzogZnVuY3Rpb24oKSB7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5zdG9wU3BsaXR0ZXJUcmFja2luZycpO1xuICAgICAgdGhpcy5zcGxpdExpbmUucmVtb3ZlQ2xhc3MoJ2RyYWdnaW5nJyk7XG4gICAgICByZXR1cm4gdGhpcy50cmFja1NwbGl0dGVyID0gNTtcbiAgICB9LFxuICAgIGFjdGl2YXRlU3BsaXR0ZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgZGVidWcoJ0FwcFZpZXcuYWN0aXZhdGVTcGxpdHRlcicpO1xuICAgICAgdGhpcy5zcGxpdFRodW1iLmRyYWdnYWJsZSh7XG4gICAgICAgIGNvbnRhaW5tZW50OiAkKCcjbWFwd3JhcHBlcicpLFxuICAgICAgICBzY3JvbGw6IGZhbHNlLFxuICAgICAgICBzdGFydDogdGhpcy5zdGFydFNwbGl0dGVyVHJhY2tpbmcsXG4gICAgICAgIGRyYWc6IHRoaXMucmVzaXplVGhpbmdzLFxuICAgICAgICBzdG9wOiB0aGlzLnN0b3BTcGxpdHRlclRyYWNraW5nXG4gICAgICB9KTtcbiAgICAgIHJldHVybiB0aGlzLnJlc2l6ZVRoaW5ncygpO1xuICAgIH0sXG4gICAgZGVhY3RpdmF0ZVNwbGl0dGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LmRlYWN0aXZhdGVTcGxpdHRlcicpO1xuICAgICAgdGhpcy5zcGxpdFRodW1iLmRyYWdnYWJsZSgnZGVzdHJveScpO1xuICAgICAgcmV0dXJuIHRoaXMucmVzaXplVGhpbmdzKCk7XG4gICAgfVxuICB9LCB7XG4gICAgdGVtcGxhdGVzOiB7XG4gICAgICBsYXlvdXQ6IF8udGVtcGxhdGUoXCI8ZGl2IGNsYXM9XFxcInVpLWZyb250XFxcIj48L2Rpdj5cXG48ZGl2IGNsYXNzPVxcXCJzcGxpdGxpbmVcXFwiPiZuYnNwOzwvZGl2PlxcbjxkaXYgY2xhc3M9XFxcInNwbGl0dGh1bWJcXFwiPjxzcGFuPiYjeDI3NmU7ICYjeDI3NmY7PC9zcGFuPjwvZGl2PlxcbjxkaXYgY2xhc3M9XFxcImxlZnQgdGFnXFxcIj48JT0gbGVmdFRhZyAlPjwvZGl2PlxcbjxkaXYgY2xhc3M9XFxcInJpZ2h0IHRhZ1xcXCI+PCU9IHJpZ2h0VGFnICU+PC9kaXY+XFxuPGRpdiBjbGFzcz1cXFwibGVmdCBzaWRlIGZvcm1cXFwiPjwlPSBsZWZ0Rm9ybSAlPjwvZGl2PlxcbjxkaXYgY2xhc3M9XFxcInJpZ2h0IHNpZGUgZm9ybVxcXCI+PCU9IHJpZ2h0Rm9ybSAlPjwvZGl2PlxcbjxkaXYgY2xhc3M9XFxcImxlZnQgbG9hZGVyXFxcIj48aW1nIHNyYz1cXFwiL3N0YXRpYy9pbWFnZXMvc3Bpbm5lci5sb2FkaW5mby5uZXQuZ2lmXFxcIiAvPjwvZGl2PlxcbjxkaXYgY2xhc3M9XFxcInJpZ2h0IGxvYWRlclxcXCI+PGltZyBzcmM9XFxcIi9zdGF0aWMvaW1hZ2VzL3NwaW5uZXIubG9hZGluZm8ubmV0LmdpZlxcXCIgLz48L2Rpdj5cXG48ZGl2IGlkPVxcXCJtYXB3cmFwcGVyXFxcIj48ZGl2IGlkPVxcXCJtYXBcXFwiPjwvZGl2PjwvZGl2PlwiKSxcbiAgICAgIGxlZnRUYWc6IF8udGVtcGxhdGUoXCI8ZGl2IGNsYXNzPVxcXCJzaG93XFxcIj5cXG4gICAgPHNwYW4gY2xhc3M9XFxcImxlZnRsYXllcm5hbWVcXFwiPnBsYWluIG1hcDwvc3Bhbj5cXG4gICAgPGJyPlxcbiAgICA8YnV0dG9uIGNsYXNzPVxcXCJidG4tY2hhbmdlXFxcIj5zZXR0aW5nczwvYnV0dG9uPlxcbiAgICA8YnV0dG9uIGNsYXNzPVxcXCJidG4tY29tcGFyZVxcXCI+c2hvdy9oaWRlIGNvbXBhcmlzb24gbWFwPC9idXR0b24+XFxuPC9kaXY+XFxuPGRpdiBjbGFzcz1cXFwiZWRpdFxcXCI+XFxuICAgIDxsYWJlbCBjbGFzcz1cXFwibGVmdCBzeW5jYm94XFxcIj48L2xhYmVsPlxcbiAgICA8aW5wdXQgaWQ9XFxcImxlZnRtYXBzcHBcXFwiIGNsYXNzPVxcXCJsZWZ0XFxcIiB0eXBlPVxcXCJ0ZXh0XFxcIiBuYW1lPVxcXCJsZWZ0bWFwc3BwXFxcIiBwbGFjZWhvbGRlcj1cXFwiJmhlbGxpcDsgc3BlY2llcyBvciBncm91cCAmaGVsbGlwO1xcXCIgLz5cXG48L2Rpdj5cIiksXG4gICAgICByaWdodFRhZzogXy50ZW1wbGF0ZShcIjxkaXYgY2xhc3M9XFxcInNob3dcXFwiPlxcbiAgICA8c3BhbiBjbGFzcz1cXFwicmlnaHRsYXllcm5hbWVcXFwiPihubyBkaXN0cmlidXRpb24pPC9zcGFuPlxcbiAgICA8YnI+XFxuICAgIDxidXR0b24gY2xhc3M9XFxcImJ0bi1jaGFuZ2VcXFwiPnNldHRpbmdzPC9idXR0b24+XFxuICAgIDxidXR0b24gY2xhc3M9XFxcImJ0bi1jb21wYXJlXFxcIj5zaG93L2hpZGUgY29tcGFyaXNvbiBtYXA8L2J1dHRvbj5cXG48L2Rpdj5cXG48ZGl2IGNsYXNzPVxcXCJlZGl0XFxcIj5cXG4gICAgPGxhYmVsIGNsYXNzPVxcXCJyaWdodCBzeW5jYm94XFxcIj48aW5wdXQgaWQ9XFxcInN5bmNcXFwiIHR5cGU9XFxcImNoZWNrYm94XFxcIiB2YWx1ZT1cXFwic3luY1xcXCIgY2hlY2tlZD1cXFwiY2hlY2tlZFxcXCIgLz4gc2FtZSBhcyBsZWZ0IHNpZGU8L2xhYmVsPlxcbiAgICA8aW5wdXQgaWQ9XFxcInJpZ2h0bWFwc3BwXFxcIiB0eXBlPVxcXCJ0ZXh0XFxcIiBjbGFzcz1cXFwicmlnaHRcXFwiIG5hbWU9XFxcInJpZ2h0bWFwc3BwXFxcIiBwbGFjZWhvbGRlcj1cXFwiJmhlbGxpcDsgc3BlY2llcyBvciBncm91cCAmaGVsbGlwO1xcXCIgLz5cXG48L2Rpdj5cIiksXG4gICAgICBsZWZ0Rm9ybTogXy50ZW1wbGF0ZShcIjxmaWVsZHNldD5cXG4gICAgPGxlZ2VuZD50ZW1wZXJhdHVyZSBjaGFuZ2U8L2xlZ2VuZD5cXG4gICAgPHNlbGVjdCBjbGFzcz1cXFwibGVmdFxcXCIgaWQ9XFxcImxlZnRtYXBkZWdzXFxcIj5cXG4gICAgICAgIDxvcHRpb24gdmFsdWU9XFxcImJhc2VsaW5lXFxcIj5iYXNlbGluZTwvb3B0aW9uPlxcbiAgICAgICAgPG9wdGlvbiB2YWx1ZT1cXFwiMS41XFxcIj4xLjUgJmRlZztDPC9vcHRpb24+XFxuICAgICAgICA8b3B0aW9uIHZhbHVlPVxcXCIyXFxcIj4yLjAgJmRlZztDPC9vcHRpb24+XFxuICAgICAgICA8b3B0aW9uIHZhbHVlPVxcXCIyLjdcXFwiPjIuNyAmZGVnO0M8L29wdGlvbj5cXG4gICAgICAgIDxvcHRpb24gdmFsdWU9XFxcIjMuMlxcXCI+My4yICZkZWc7Qzwvb3B0aW9uPlxcbiAgICAgICAgPG9wdGlvbiB2YWx1ZT1cXFwiNC41XFxcIj40LjUgJmRlZztDPC9vcHRpb24+XFxuICAgICAgICA8b3B0Z3JvdXAgbGFiZWw9XFxcIkhpZ2ggc2Vuc2l0aXZpdHkgY2xpbWF0ZVxcXCI+XFxuICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cXFwiNlxcXCI+Ni4wICZkZWc7Qzwvb3B0aW9uPlxcbiAgICAgICAgPC9vcHRncm91cD5cXG4gICAgPC9zZWxlY3Q+XFxuPC9maWVsZHNldD5cXG48ZmllbGRzZXQ+XFxuICAgIDxsZWdlbmQ+YWRhcHRhdGlvbiB2aWEgcmFuZ2Ugc2hpZnQ8L2xlZ2VuZD5cXG4gICAgPGxhYmVsPjwhLS0gc3Bhbj5ub25lPC9zcGFuIC0tPiA8aW5wdXQgbmFtZT1cXFwibGVmdG1hcHJhbmdlXFxcIiBjbGFzcz1cXFwibGVmdFxcXCIgdHlwZT1cXFwicmFkaW9cXFwiIHZhbHVlPVxcXCJuby5kaXNwXFxcIiBjaGVja2VkPVxcXCJjaGVja2VkXFxcIj4gc3BlY2llcyBjYW5ub3Qgc2hpZnQgcmFuZ2VzPC9sYWJlbD5cXG4gICAgPGxhYmVsPjwhLS0gc3Bhbj5hbGxvdzwvc3BhbiAtLT4gPGlucHV0IG5hbWU9XFxcImxlZnRtYXByYW5nZVxcXCIgY2xhc3M9XFxcImxlZnRcXFwiIHR5cGU9XFxcInJhZGlvXFxcIiB2YWx1ZT1cXFwicmVhbC5kaXNwXFxcIj4gYWxsb3cgcmFuZ2UgYWRhcHRhdGlvbjwvbGFiZWw+XFxuPC9maWVsZHNldD5cXG48ZmllbGRzZXQ+XFxuICAgIDxsZWdlbmQ+bW9kZWwgc3VtbWFyeTwvbGVnZW5kPlxcbiAgICA8c2VsZWN0IGNsYXNzPVxcXCJsZWZ0XFxcIiBpZD1cXFwibGVmdG1hcGNvbmZpZGVuY2VcXFwiPlxcbiAgICAgICAgPG9wdGlvbiB2YWx1ZT1cXFwiMTBcXFwiPjEwdGggcGVyY2VudGlsZTwvb3B0aW9uPlxcbiAgICAgICAgPCEtLSBvcHRpb24gdmFsdWU9XFxcIjMzXFxcIj4zM3JkIHBlcmNlbnRpbGU8L29wdGlvbiAtLT5cXG4gICAgICAgIDxvcHRpb24gdmFsdWU9XFxcIjUwXFxcIiBzZWxlY3RlZD1cXFwic2VsZWN0ZWRcXFwiPjUwdGggcGVyY2VudGlsZTwvb3B0aW9uPlxcbiAgICAgICAgPCEtLSBvcHRpb24gdmFsdWU9XFxcIjY2XFxcIj42NnRoIHBlcmNlbnRpbGU8L29wdGlvbiAtLT5cXG4gICAgICAgIDxvcHRpb24gdmFsdWU9XFxcIjkwXFxcIj45MHRoIHBlcmNlbnRpbGU8L29wdGlvbj5cXG4gICAgPC9zZWxlY3Q+XFxuPC9maWVsZHNldD5cXG48ZmllbGRzZXQgY2xhc3M9XFxcImJsYW5rXFxcIj5cXG4gICAgPGJ1dHRvbiB0eXBlPVxcXCJidXR0b25cXFwiIGNsYXNzPVxcXCJidG4tY2hhbmdlXFxcIj5oaWRlIHNldHRpbmdzPC9idXR0b24+XFxuICAgIDxidXR0b24gdHlwZT1cXFwiYnV0dG9uXFxcIiBjbGFzcz1cXFwiYnRuLWNvbXBhcmVcXFwiPmhpZGUvc2hvdyByaWdodCBtYXA8L2J1dHRvbj5cXG4gICAgPGJ1dHRvbiB0eXBlPVxcXCJidXR0b25cXFwiIGNsYXNzPVxcXCJidG4tY29weSByaWdodC12YWxpZC1tYXBcXFwiPmNvcHkgcmlnaHQgbWFwICZsYXF1bzs8L2J1dHRvbj5cXG4gICAgPGEgaWQ9XFxcImxlZnRtYXBkbFxcXCIgY2xhc3M9XFxcImRvd25sb2FkIGxlZnQtdmFsaWQtbWFwXFxcIiBocmVmPVxcXCJcXFwiIGRpc2FibGVkPVxcXCJkaXNhYmxlZFxcXCI+ZG93bmxvYWQganVzdCB0aGlzIG1hcDxicj4oPDFNYiBHZW9USUZGKTwvYT5cXG48L2ZpZWxkc2V0PlxcblwiKSxcbiAgICAgIHJpZ2h0Rm9ybTogXy50ZW1wbGF0ZShcIjxmaWVsZHNldD5cXG4gICAgPGxlZ2VuZD50ZW1wZXJhdHVyZSBjaGFuZ2U8L2xlZ2VuZD5cXG4gICAgPHNlbGVjdCBjbGFzcz1cXFwicmlnaHRcXFwiIGlkPVxcXCJyaWdodG1hcGRlZ3NcXFwiPlxcbiAgICAgICAgPG9wdGlvbiB2YWx1ZT1cXFwiYmFzZWxpbmVcXFwiPmJhc2VsaW5lPC9vcHRpb24+XFxuICAgICAgICA8b3B0aW9uIHZhbHVlPVxcXCIxLjVcXFwiPjEuNSAmZGVnO0M8L29wdGlvbj5cXG4gICAgICAgIDxvcHRpb24gdmFsdWU9XFxcIjJcXFwiPjIuMCAmZGVnO0M8L29wdGlvbj5cXG4gICAgICAgIDxvcHRpb24gdmFsdWU9XFxcIjIuN1xcXCI+Mi43ICZkZWc7Qzwvb3B0aW9uPlxcbiAgICAgICAgPG9wdGlvbiB2YWx1ZT1cXFwiMy4yXFxcIj4zLjIgJmRlZztDPC9vcHRpb24+XFxuICAgICAgICA8b3B0aW9uIHZhbHVlPVxcXCI0LjVcXFwiPjQuNSAmZGVnO0M8L29wdGlvbj5cXG4gICAgICAgIDxvcHRncm91cCBsYWJlbD1cXFwiSGlnaCBzZW5zaXRpdml0eSBjbGltYXRlXFxcIj5cXG4gICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVxcXCI2XFxcIj42LjAgJmRlZztDPC9vcHRpb24+XFxuICAgICAgICA8L29wdGdyb3VwPlxcbiAgICA8L3NlbGVjdD5cXG48L2ZpZWxkc2V0PlxcbjxmaWVsZHNldD5cXG4gICAgPGxlZ2VuZD5hZGFwdGF0aW9uIHZpYSByYW5nZSBzaGlmdDwvbGVnZW5kPlxcbiAgICA8bGFiZWw+PCEtLSBzcGFuPm5vbmU8L3NwYW4gLS0+IDxpbnB1dCBuYW1lPVxcXCJyaWdodG1hcHJhbmdlXFxcIiBjbGFzcz1cXFwicmlnaHRcXFwiIHR5cGU9XFxcInJhZGlvXFxcIiB2YWx1ZT1cXFwibm8uZGlzcFxcXCIgY2hlY2tlZD1cXFwiY2hlY2tlZFxcXCI+IHNwZWNpZXMgY2Fubm90IHNoaWZ0IHJhbmdlczwvbGFiZWw+XFxuICAgIDxsYWJlbD48IS0tIHNwYW4+YWxsb3c8L3NwYW4gLS0+IDxpbnB1dCBuYW1lPVxcXCJyaWdodG1hcHJhbmdlXFxcIiBjbGFzcz1cXFwicmlnaHRcXFwiIHR5cGU9XFxcInJhZGlvXFxcIiB2YWx1ZT1cXFwicmVhbC5kaXNwXFxcIj4gYWxsb3cgcmFuZ2UgYWRhcHRhdGlvbjwvbGFiZWw+XFxuPC9maWVsZHNldD5cXG48ZmllbGRzZXQ+XFxuICAgIDxsZWdlbmQ+bW9kZWwgc3VtbWFyeTwvbGVnZW5kPlxcbiAgICA8c2VsZWN0IGNsYXNzPVxcXCJyaWdodFxcXCIgaWQ9XFxcInJpZ2h0bWFwY29uZmlkZW5jZVxcXCI+XFxuICAgICAgICA8b3B0aW9uIHZhbHVlPVxcXCIxMFxcXCI+MTB0aCBwZXJjZW50aWxlPC9vcHRpb24+XFxuICAgICAgICA8IS0tIG9wdGlvbiB2YWx1ZT1cXFwiMzNcXFwiPjMzcmQgcGVyY2VudGlsZTwvb3B0aW9uIC0tPlxcbiAgICAgICAgPG9wdGlvbiB2YWx1ZT1cXFwiNTBcXFwiIHNlbGVjdGVkPVxcXCJzZWxlY3RlZFxcXCI+NTB0aCBwZXJjZW50aWxlPC9vcHRpb24+XFxuICAgICAgICA8IS0tIG9wdGlvbiB2YWx1ZT1cXFwiNjZcXFwiPjY2dGggcGVyY2VudGlsZTwvb3B0aW9uIC0tPlxcbiAgICAgICAgPG9wdGlvbiB2YWx1ZT1cXFwiOTBcXFwiPjkwdGggcGVyY2VudGlsZTwvb3B0aW9uPlxcbiAgICA8L3NlbGVjdD5cXG48L2ZpZWxkc2V0PlxcbjxmaWVsZHNldCBjbGFzcz1cXFwiYmxhbmtcXFwiPlxcbiAgICA8YnV0dG9uIHR5cGU9XFxcImJ1dHRvblxcXCIgY2xhc3M9XFxcImJ0bi1jaGFuZ2VcXFwiPmhpZGUgc2V0dGluZ3M8L2J1dHRvbj5cXG4gICAgPGJ1dHRvbiB0eXBlPVxcXCJidXR0b25cXFwiIGNsYXNzPVxcXCJidG4tY29tcGFyZVxcXCI+aGlkZS9zaG93IHJpZ2h0IG1hcDwvYnV0dG9uPlxcbiAgICA8YnV0dG9uIHR5cGU9XFxcImJ1dHRvblxcXCIgY2xhc3M9XFxcImJ0bi1jb3B5IGxlZnQtdmFsaWQtbWFwXFxcIj5jb3B5IGxlZnQgbWFwICZsYXF1bzs8L2J1dHRvbj5cXG4gICAgPGEgaWQ9XFxcInJpZ2h0bWFwZGxcXFwiIGNsYXNzPVxcXCJkb3dubG9hZCByaWdodC12YWxpZC1tYXBcXFwiIGhyZWY9XFxcIlxcXCIgZGlzYWJsZWQ9XFxcImRpc2FibGVkXFxcIj5kb3dubG9hZCBqdXN0IHRoaXMgbWFwPGJyPig8MU1iIEdlb1RJRkYpPC9hPlxcbjwvZmllbGRzZXQ+XFxuXCIpXG4gICAgfVxuICB9KTtcblxuICBtb2R1bGUuZXhwb3J0cyA9IEFwcFZpZXc7XG5cbn0pLmNhbGwodGhpcyk7XG4iLCJcbi8vIGpRdWVyeSBwbHVnaW5cbi8vIGF1dGhvcjogRGFuaWVsIEJhaXJkIDxkYW5pZWxAZGFuaWVsYmFpcmQuY29tPlxuLy8gdmVyc2lvbjogMC4xLjIwMTQwMjA1XG5cbi8vXG4vLyBUaGlzIG1hbmFnZXMgbWVudXMsIHN1Ym1lbnVzLCBwYW5lbHMsIGFuZCBwYWdlcy5cbi8vIExpa2UgdGhpczpcbi8vIC0tLS4tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS4tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS4tLS1cbi8vICAgIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgICAgICAgICAgICAgICAgICAgICAgfCAgICAgICAgICAgICAgICAgICAgICAgIHxcbi8vICAgIHwgIFNlbGVjdGVkIE1haW4gTWVudSBJdGVtICAgLi0tLS0tLS0tLS0tLiAuLS0tLS0tLS0tLiAgIHwgIEFsdCBNYWluIE1lbnUgSXRlbSAgfCAgVGhpcmQgTWFpbiBNZW51IEl0ZW0gIHxcbi8vICAgIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAvICBTdWJpdGVtIDEgIFxcIFN1Yml0ZW0gMiBcXCAgfCAgICAgICAgICAgICAgICAgICAgICB8ICAgICAgICAgICAgICAgICAgICAgICAgfFxuLy8gLS0tJy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tJyAgICAgICAgICAgICAgICctLS0tLS0tLS0tLS0tJy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0nLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tJy0tLVxuLy8gICAgICAgfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4vLyAgICAgICB8ICAgUGFuZWwgZm9yIFN1Yml0ZW0gMSwgdGhpcyBpcyBQYWdlIDEgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbi8vICAgICAgIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuLy8gICAgICAgfCAgIEVhY2ggUGFuZWwgY2FuIGhhdmUgbXVsdGlwbGUgcGFnZXMsIG9uZSBwYWdlIHNob3dpbmcgYXQgYSB0aW1lLiAgQnV0dG9ucyBvbiBwYWdlcyBzd2l0Y2ggICAgICB8XG4vLyAgICAgICB8ICAgYmV0d2VlbiBwYWdlcy4gIFBhbmVsIGhlaWdodCBhZGp1c3RzIHRvIHRoZSBoZWlnaHQgb2YgdGhlIHBhZ2UuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbi8vICAgICAgIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuLy8gICAgICAgfCAgIFsgc2VlIHBhZ2UgMiBdICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4vLyAgICAgICB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbi8vICAgICAgICctLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tJ1xuLy9cbi8vIC0gbWVudXMgYXJlIGFsd2F5cyA8dWw+IHRhZ3M7IGVhY2ggPGxpPiBpcyBhIG1lbnUgaXRlbVxuLy8gLSBhIG1haW4gbWVudSA8bGk+IG11c3QgY29udGFpbiBhbiA8YT4gdGFnIGFuZCBtYXkgYWxzbyBjb250YWluIGEgPHVsPiBzdWJtZW51XG4vLyAtIGEgc3VibWVudSA8bGk+IG11c3QgY29udGFpbiBhbiA8YT4gdGFnIHdpdGggYSBkYXRhLXRhcmdldHBhbmVsIGF0dHJpYnV0ZSBzZXRcbi8vIC0gVGhlcmUgaXMgYWx3YXlzIGEgc2luZ2xlIHNlbGVjdGVkIG1haW4gbWVudSBpdGVtXG4vLyAtIEEgbWFpbiBtZW51IGl0ZW0gbWF5IGVpdGhlciBsaW5rIHRvIGFub3RoZXIgd2VicGFnZSwgb3IgaGF2ZSBhIHN1Ym1lbnVcbi8vIC0gU2VsZWN0aW5nIGEgbWFpbiBtZW51IGl0ZW0gd2lsbCBzaG93IGl0cyBzdWJtZW51LCBpZiBpdCBoYXMgb25lXG4vLyAtIEEgc3VibWVudSBhbHdheXMgaGFzIGEgc2luZ2xlIGl0ZW0gc2VsZWN0ZWRcbi8vIC0gQ2xpY2tpbmcgYW4gaW5hY3RpdmUgc3VibWVudSBpdGVtIHdpbGwgc2hvdyBpdHMgcGFuZWxcbi8vIC0gQ2xpY2tpbmcgYSBzZWxlY3RlZCBzdWJtZW51IGl0ZW0gd2lsbCB0b2dnbGUgaXRzIHBhbmVsIHNob3dpbmcgPC0+IGhpZGluZyAoKCggTkI6IG5vdCB5ZXQgaW1wbGVtZW50ZWQgKSkpXG4vLyAtIEEgcGFuZWwgaW5pdGlhbGx5IHNob3dzIGl0cyBmaXJzdCBwYWdlXG4vLyAtIFN3aXRjaGluZyBwYWdlcyBpbiBhIHBhbmVsIGNoYW5nZXMgdGhlIHBhbmVsIGhlaWdodCB0byBzdWl0IGl0cyBjdXJyZW50IHBhZ2Vcbi8vIC0gQSBwYW5lbCBpcyBhIEhUTUwgYmxvY2sgZWxlbWVudCB3aXRoIHRoZSBjbGFzcyAubXNwcC1wYW5lbCAoY2FuIGJlIG92ZXJyaWRkZW4gdmlhIG9wdGlvbilcbi8vIC0gSWYgYSBwYW5lbCBjb250YWlucyBwYWdlcywgb25lIHBhZ2Ugc2hvdWxkIGhhdmUgdGhlIGNsYXNzIC5jdXJyZW50IChjYW4gYmUgb3ZlcnJpZGRlbiB2aWEgb3B0aW9uKVxuLy8gLSBBIHBhZ2UgaXMgYSBIVE1MIGJsb2NrIGVsZW1lbnQgd2l0aCB0aGUgY2xhc3MgLm1zcHAtcGFnZSAoY2FuIGJlIG92ZXJyaWRkZW4gdmlhIG9wdGlvbilcbi8vIC0gPGJ1dHRvbj4gb3IgPGE+IHRhZ3MgaW4gcGFnZXMgdGhhdCBoYXZlIGEgZGF0YS10YXJnZXRwYWdlIGF0dHJpYnV0ZSBzZXQgd2lsbCBzd2l0Y2ggdG8gdGhlIGluZGljYXRlZCBwYWdlXG4vL1xuLy9cbi8vIFRoZSBIVE1MIHNob3VsZCBsb29rIGxpa2UgdGhpczpcbi8vXG4vLyAgPHVsIGNsYXNzPVwibWVudVwiPiAgICAgICAgICAgICAgICAgICA8IS0tIHRoaXMgaXMgdGhlIG1haW4gbWVudSAtLT5cbi8vICAgICAgPGxpIGNsYXNzPVwiY3VycmVudFwiPiAgICAgICAgICAgIDwhLS0gdGhpcyBpcyBhIG1haW4gbWVudSBpdGVtLCBjdXJyZW50bHkgc2VsZWN0ZWQgLS0+XG4vLyAgICAgICAgICA8YT5GaXJzdCBJdGVtPC9hPiAgICAgICAgICAgPCEtLSB0aGUgZmlyc3QgaXRlbSBpbiB0aGUgbWFpbiBtZW51IC0tPlxuLy8gICAgICAgICAgPHVsPiAgICAgICAgICAgICAgICAgICAgICAgIDwhLS0gYSBzdWJtZW51IGluIHRoZSBmaXJzdCBtYWluIG1lbnUgaXRlbSAtLT5cbi8vICAgICAgICAgICAgICA8bGkgY2xhc3M9XCJjdXJyZW50XCI+ICAgIDwhLS0gdGhlIGN1cnJlbnRseSBzZWxlY3RlZCBzdWJtZW51IGl0ZW0gLS0+XG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPCEtLSAucGFuZWx0cmlnZ2VyIGFuZCB0aGUgZGF0YS1wYW5lbGlkIGF0dHJpYnV0ZSBhcmUgcmVxdWlyZWQgLS0+XG4vLyAgICAgICAgICAgICAgICAgIDxhIGRhdGEtdGFyZ2V0cGFuZWw9XCJwYW5lbDFcIj5kbyB0aGUgcGFuZWwxIHRoaW5nPC9hPlxuLy8gICAgICAgICAgICAgIDwvbGk+XG4vLyAgICAgICAgICAgICAgPGxpPi4uLjwvbGk+ICAgICAgICAgICAgPCEtLSBhbm90aGVyIHN1Ym1lbnUgaXRlbSAtLT5cbi8vICAgICAgICAgIDwvdWw+XG4vLyAgICAgIDwvbGk+XG4vLyAgICAgIDxsaT4gPGEgaHJlZj1cImFub3RoZXJfcGFnZS5odG1sXCI+YW5vdGhlciBwYWdlPC9hPiA8L2xpPlxuLy8gICAgICA8bGk+IDxhPndoYXRldmVyPC9hPiA8L2xpPlxuLy8gIDwvdWw+XG4vL1xuLy8gIDxkaXYgaWQ9XCJwYW5lbDFcIiBjbGFzcz1cIm1zcHAtcGFuZWxcIj5cbi8vICAgICAgPGRpdiBpZD1cInBhZ2UxMVwiIGNsYXNzPVwibXNwcC1wYWdlIGN1cnJlbnRcIj5cbi8vICAgICAgICAgIFRoaXMgaXMgdGhlIGN1cnJlbnQgcGFnZSBvbiBwYW5lbCAxLlxuLy8gICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgZGF0YS10YXJnZXRwYWdlPVwicGFnZTEyXCI+c2hvdyBwYWdlIDI8L2J1dHRvbj5cbi8vICAgICAgPC9kaXY+XG4vLyAgICAgIDxkaXYgaWQ9XCJwYWdlMTJcIiBjbGFzcz1cIm1zcHAtcGFnZVwiPlxuLy8gICAgICAgICAgVGhpcyBpcyB0aGUgb3RoZXIgcGFnZSBvbiBwYW5lbCAxLlxuLy8gICAgICAgICAgPGEgZGF0YS10YXJnZXRwYWdlPVwicGFnZTExXCI+c2VlIHRoZSBmaXJzdCBwYWdlIGFnYWluPC9hPlxuLy8gICAgICA8L2Rpdj5cbi8vICA8L2Rpdj5cbi8vICA8ZGl2IGlkPVwicGFuZWwyXCIgY2xhc3M9XCJtc3BwLXBhbmVsXCI+XG4vLyAgICAgIDxkaXYgaWQ9XCJwYWdlMjFcIiBjbGFzcz1cIm1zcHAtcGFnZSBjdXJyZW50XCI+XG4vLyAgICAgICAgICBUaGlzIGlzIHRoZSBjdXJyZW50IHBhZ2Ugb24gcGFuZWwgMi5cbi8vICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGRhdGEtdGFyZ2V0cGFnZT1cInBhZ2UyMlwiPnNob3cgcGFnZSAyPC9idXR0b24+XG4vLyAgICAgIDwvZGl2PlxuLy8gICAgICA8ZGl2IGlkPVwicGFnZTIyXCIgY2xhc3M9XCJtc3BwLXBhZ2VcIj5cbi8vICAgICAgICAgIFRoaXMgaXMgdGhlIG90aGVyIHBhZ2Ugb24gcGFuZWwgMi5cbi8vICAgICAgICAgIDxhIGRhdGEtdGFyZ2V0cGFnZT1cInBhZ2UyMVwiPnNlZSB0aGUgZmlyc3QgcGFnZSBhZ2FpbjwvYT5cbi8vICAgICAgPC9kaXY+XG4vLyAgPC9kaXY+XG5cblxuOyggZnVuY3Rpb24oJCwgd2luZG93LCBkb2N1bWVudCwgdW5kZWZpbmVkKSB7XG5cbiAgICAvLyBuYW1lc3BhY2UgY2xpbWFzLCB3aWRnZXQgbmFtZSBtc3BwXG4gICAgLy8gc2Vjb25kIGFyZyBpcyB1c2VkIGFzIHRoZSB3aWRnZXQncyBcInByb3RvdHlwZVwiIG9iamVjdFxuICAgICQud2lkZ2V0KCBcImNsaW1hcy5tc3BwXCIgLCB7XG5cbiAgICAgICAgLy9PcHRpb25zIHRvIGJlIHVzZWQgYXMgZGVmYXVsdHNcbiAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgICAgYW5pbWF0aW9uRmFjdG9yOiAyLFxuXG4gICAgICAgICAgICBtYWluTWVudUNsYXNzOiAnbXNwcC1tYWluLW1lbnUnLFxuXG4gICAgICAgICAgICBwYW5lbENsYXNzOiAnbXNwcC1wYW5lbCcsXG4gICAgICAgICAgICBwYWdlQ2xhc3M6ICdtc3BwLXBhZ2UnLFxuXG4gICAgICAgICAgICBjbGVhcmZpeENsYXNzOiAnbXNwcC1jbGVhcmZpeCcsXG4gICAgICAgICAgICBhY3RpdmVDbGFzczogJ2N1cnJlbnQnXG4gICAgICAgIH0sXG4gICAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgICAgLy9TZXR1cCB3aWRnZXQgKGVnLiBlbGVtZW50IGNyZWF0aW9uLCBhcHBseSB0aGVtaW5nXG4gICAgICAgIC8vICwgYmluZCBldmVudHMgZXRjLilcbiAgICAgICAgX2NyZWF0ZTogZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgIHZhciBiYXNlID0gdGhpcztcbiAgICAgICAgICAgIHZhciBvcHRzID0gdGhpcy5vcHRpb25zO1xuXG4gICAgICAgICAgICAvLyBwb3B1bGF0ZSBzb21lIGNvbnZlbmllbmNlIHZhcmlhYmxlc1xuICAgICAgICAgICAgdmFyICRtZW51ID0gdGhpcy5lbGVtZW50O1xuICAgICAgICAgICAgdGhpcy5tYWluTWVudUl0ZW1zID0gJG1lbnUuY2hpbGRyZW4oJ2xpJyk7XG4gICAgICAgICAgICB0aGlzLnBhbmVscyA9ICQoJy4nICsgb3B0cy5wYW5lbENsYXNzKTtcblxuICAgICAgICAgICAgLy8gZGlzYXBwZWFyIHdoaWxlIHdlIHNvcnQgdGhpbmdzIG91dFxuICAgICAgICAgICAgJG1lbnUuY3NzKHsgb3BhY2l0eTogMCB9KTtcbiAgICAgICAgICAgIHRoaXMucGFuZWxzLmNzcyh7IG9wYWNpdHk6IDAgfSk7XG5cbiAgICAgICAgICAgIC8vIG1ha2Ugc29tZSBET00gbW9kc1xuICAgICAgICAgICAgJG1lbnUuYWRkQ2xhc3Mob3B0cy5tYWluTWVudUNsYXNzKTtcbiAgICAgICAgICAgICRtZW51LmFkZENsYXNzKG9wdHMuY2xlYXJmaXhDbGFzcyk7XG4gICAgICAgICAgICB0aGlzLnBhbmVscy5hZGRDbGFzcyhvcHRzLmNsZWFyZml4Q2xhc3MpO1xuXG4gICAgICAgICAgICAvLyBsYXlvdXQgdGhlIG1lbnVcbiAgICAgICAgICAgIHRoaXMuX2xheW91dE1lbnUoKTtcblxuICAgICAgICAgICAgLy8gbGF5b3V0IHRoZSBwYW5lbHNcbiAgICAgICAgICAgIHRoaXMuX2xheW91dFBhbmVscygpO1xuXG4gICAgICAgICAgICAvLyBob29rIHVwIGNsaWNrIGhhbmRsaW5nIGV0Y1xuICAgICAgICAgICAgJG1lbnUub24oJ21zcHBzaG93bWVudScsIHRoaXMuX3Nob3dNZW51KTtcbiAgICAgICAgICAgICRtZW51Lm9uKCdtc3Bwc2hvd3N1Ym1lbnUnLCB0aGlzLl9zaG93U3ViTWVudSk7XG4gICAgICAgICAgICAkbWVudS5vbignbXNwcHNob3dwYW5lbCcsIHRoaXMuX3Nob3dQYW5lbCk7XG4gICAgICAgICAgICAkbWVudS5vbignbXNwcHNob3dwYWdlJywgdGhpcy5fc2hvd1BhZ2UpO1xuXG4gICAgICAgICAgICAvLyBhdHRhY2ggaGFuZGxlcnMgdG8gdGhlIG1lbnUtdHJpZ2dlcnNcbiAgICAgICAgICAgIHRoaXMubWFpbk1lbnVJdGVtcy5lYWNoKCBmdW5jdGlvbihpbmRleCwgaXRlbSkge1xuICAgICAgICAgICAgICAgIC8vIHRoZSBsaSBtZW51IGl0ZW0gaGFzIGEgY2hpbGQgYSB0aGF0IGlzIGl0J3MgdHJpZ2dlclxuICAgICAgICAgICAgICAgICQoaXRlbSkuY2hpbGRyZW4oJ2EnKS5jbGljayggZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgYmFzZS5fdHJpZ2dlcignc2hvd21lbnUnLCBldmVudCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgbWVudWl0ZW06IGl0ZW0sXG4gICAgICAgICAgICAgICAgICAgICAgICB3aWRnZXQ6IGJhc2VcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgLy8gYXR0YWNoIGhhbmRsZXJzIHRvIHRoZSBzdWJtZW51IGl0ZW1zXG4gICAgICAgICAgICAgICAgJChpdGVtKS5maW5kKCdsaScpLmVhY2goIGZ1bmN0aW9uKGluZGV4LCBzdWJNZW51SXRlbSkge1xuICAgICAgICAgICAgICAgICAgICAkKHN1Yk1lbnVJdGVtKS5maW5kKCdhJykuY2xpY2soIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBiYXNlLl90cmlnZ2VyKCdzaG93c3VibWVudScsIGV2ZW50LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVudWl0ZW06IGl0ZW0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3VibWVudWl0ZW06IHN1Yk1lbnVJdGVtLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpZGdldDogYmFzZVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIGF0dGFjaCBoYW5kbGVycyB0byB0aGUgcGFuZWwgdHJpZ2dlcnNcbiAgICAgICAgICAgICRtZW51LmZpbmQoJ1tkYXRhLXRhcmdldHBhbmVsXScpLmVhY2goIGZ1bmN0aW9uKGluZGV4LCB0cmlnZ2VyKSB7XG4gICAgICAgICAgICAgICAgdmFyICR0cmlnZ2VyID0kKHRyaWdnZXIpO1xuICAgICAgICAgICAgICAgICR0cmlnZ2VyLmNsaWNrKCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgICAgICAgICBiYXNlLl90cmlnZ2VyKCdzaG93cGFuZWwnLCBldmVudCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgcGFuZWw6ICQoJyMnICsgJHRyaWdnZXIuZGF0YSgndGFyZ2V0cGFuZWwnKSkuZmlyc3QoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpZGdldDogYmFzZVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBhdHRhY2ggaGFuZGxlcnMgdG8gdGhlIHBhZ2Ugc3dpdGNoZXJzXG4gICAgICAgICAgICB0aGlzLnBhbmVscy5lYWNoKCBmdW5jdGlvbihpbmRleCwgcGFuZWwpIHtcbiAgICAgICAgICAgICAgICB2YXIgJHBhbmVsID0gJChwYW5lbCk7XG4gICAgICAgICAgICAgICAgJHBhbmVsLmZpbmQoJ1tkYXRhLXRhcmdldHBhZ2VdJykuY2xpY2soIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIGJhc2UuX3RyaWdnZXIoJ3Nob3dwYWdlJywgZXZlbnQsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhbmVsOiAkcGFuZWwsXG4gICAgICAgICAgICAgICAgICAgICAgICBwYWdlOiAkKCcjJyArICQodGhpcykuZGF0YSgndGFyZ2V0cGFnZScpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpZGdldDogYmFzZVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBhY3RpdmF0ZSB0aGUgY3VycmVudCBtZW51cywgcGFuZWxzIGV0Y1xuICAgICAgICAgICAgdmFyICRjdXJyZW50TWFpbiA9IHRoaXMubWFpbk1lbnVJdGVtcy5maWx0ZXIoJy4nICsgb3B0cy5hY3RpdmVDbGFzcyk7XG4gICAgICAgICAgICAkY3VycmVudE1haW4ucmVtb3ZlQ2xhc3Mob3B0cy5hY3RpdmVDbGFzcykuY2hpbGRyZW4oJ2EnKS5jbGljaygpO1xuXG4gICAgICAgICAgICAvLyBmaW5hbGx5LCBmYWRlIGJhY2sgaW5cbiAgICAgICAgICAgICRtZW51LmFuaW1hdGUoeyBvcGFjaXR5OiAxIH0sICdmYXN0Jyk7XG5cbiAgICAgICAgICAgIC8vIHBhbmVscyBzdGF5IGludmlzaWJsZVxuICAgICAgICB9LFxuICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgIF9zd2l0Y2hDbGFzc09wdGlvbjogZnVuY3Rpb24oY2xhc3NOYW1lLCBuZXdDbGFzcykge1xuICAgICAgICAgICAgdmFyIG9sZENsYXNzID0gdGhpcy5vcHRpb25zW2NsYXNzTmFtZV07XG4gICAgICAgICAgICBpZiAob2xkQ2xhc3MgIT09IG5ld0NsYXNzKSB7XG4gICAgICAgICAgICAgICAgdmFyIGdyb3VwID0gdGhpcy5lbGVtZW50LmZpbmQoJy4nICsgb2xkQ2xhc3MpO1xuICAgICAgICAgICAgICAgIHRoaXMub3B0aW9uc1tjbGFzc05hbWVdID0gbmV3Q2xhc3M7XG4gICAgICAgICAgICAgICAgZ3JvdXAucmVtb3ZlQ2xhc3Mob2xkQ2xhc3MpO1xuICAgICAgICAgICAgICAgIGdyb3VwLmFkZENsYXNzKG5ld0NsYXNzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICAvLyBSZXNwb25kIHRvIGFueSBjaGFuZ2VzIHRoZSB1c2VyIG1ha2VzIHRvIHRoZVxuICAgICAgICAvLyBvcHRpb24gbWV0aG9kXG4gICAgICAgIF9zZXRPcHRpb246IGZ1bmN0aW9uKGtleSwgdmFsdWUpIHtcbiAgICAgICAgICAgIHN3aXRjaCAoa2V5KSB7XG4gICAgICAgICAgICAgICAgY2FzZSBcIm1haW5NZW51Q2xhc3NcIjpcbiAgICAgICAgICAgICAgICBjYXNlIFwiY2xlYXJmaXhDbGFzc1wiOlxuICAgICAgICAgICAgICAgIGNhc2UgXCJhY3RpdmVDbGFzc1wiOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9zd2l0Y2hDbGFzc09wdGlvbihrZXksIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnNba2V5XSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAvLyBpdCdzIG9rYXkgdGhhdCB0aGVyZSdzIG5vIH0gaGVyZVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gcmVtZW1iZXIgdG8gY2FsbCBvdXIgc3VwZXIncyBfc2V0T3B0aW9uIG1ldGhvZFxuICAgICAgICAgICAgdGhpcy5fc3VwZXIoIFwiX3NldE9wdGlvblwiLCBrZXksIHZhbHVlICk7XG4gICAgICAgIH0sXG4gICAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgICAgLy8gRGVzdHJveSBhbiBpbnN0YW50aWF0ZWQgcGx1Z2luIGFuZCBjbGVhbiB1cFxuICAgICAgICAvLyBtb2RpZmljYXRpb25zIHRoZSB3aWRnZXQgaGFzIG1hZGUgdG8gdGhlIERPTVxuICAgICAgICBfZGVzdHJveTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQucmVtb3ZlQ2xhc3ModGhpcy5vcHRpb25zLm1haW5NZW51Q2xhc3MpO1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50LnJlbW92ZUNsYXNzKHRoaXMub3B0aW9ucy5jbGVhcmZpeENsYXNzKTtcbiAgICAgICAgICAgIHRoaXMucGFuZWxzLnJlbW92ZUNsYXNzKHRoaXMub3B0aW9ucy5jbGVhcmZpeENsYXNzKTtcbiAgICAgICAgfSxcbiAgICAgICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICAvLyBkbyB0aGUgbGF5b3V0IGNhbGN1bGF0aW9uc1xuICAgICAgICBfbGF5b3V0TWVudTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAvLyBnbyB0aHJvdWdoIGVhY2ggc3VibWVudSBhbmQgcmVjb3JkIGl0cyB3aWR0aFxuICAgICAgICAgICAgdGhpcy5lbGVtZW50LmZpbmQoJ3VsJykuZWFjaCggZnVuY3Rpb24oaW5kZXgsIHN1Yk1lbnUpIHtcbiAgICAgICAgICAgICAgICB2YXIgJHNtID0gJChzdWJNZW51KTtcbiAgICAgICAgICAgICAgICAkc20uY3NzKHt3aWR0aDogJ2F1dG8nfSk7XG4gICAgICAgICAgICAgICAgJHNtLmRhdGEoJ29yaWdpbmFsV2lkdGgnLCAkc20ud2lkdGgoKSk7XG5cbiAgICAgICAgICAgICAgICAvLyBsZWF2ZSBlYWNoIHN1Ym1lbnUgaGlkZGVuLCB3aXRoIHdpZHRoIDBcbiAgICAgICAgICAgICAgICAkc20uY3NzKHsgd2lkdGg6IDAsIGRpc3BsYXk6ICdub25lJyB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgIF9zaG93TWVudTogZnVuY3Rpb24oZXZlbnQsIGRhdGEpIHtcbiAgICAgICAgICAgIHZhciAkaXRlbSA9ICQoZGF0YS5tZW51aXRlbSk7XG4gICAgICAgICAgICB2YXIgYmFzZSA9IGRhdGEud2lkZ2V0O1xuICAgICAgICAgICAgLy8gJGl0ZW0gaXMgYSBjbGlja2VkLW9uIG1lbnUgaXRlbS4uXG4gICAgICAgICAgICBpZiAoJGl0ZW0uaGFzQ2xhc3MoYmFzZS5vcHRpb25zLmFjdGl2ZUNsYXNzKSkge1xuICAgICAgICAgICAgICAgIC8vID8/XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGJhc2UuX2hpZGVQYW5lbHMoKTtcbiAgICAgICAgICAgICAgICBiYXNlLm1haW5NZW51SXRlbXMucmVtb3ZlQ2xhc3MoYmFzZS5vcHRpb25zLmFjdGl2ZUNsYXNzKTtcbiAgICAgICAgICAgICAgICB2YXIgJG5ld1N1Yk1lbnUgPSAkaXRlbS5maW5kKCd1bCcpO1xuICAgICAgICAgICAgICAgIHZhciAkb2xkU3ViTWVudXMgPSBiYXNlLmVsZW1lbnQuZmluZCgndWwnKS5ub3QoJG5ld1N1Yk1lbnUpO1xuICAgICAgICAgICAgICAgIHZhciBuZXdXaWR0aCA9ICRuZXdTdWJNZW51LmRhdGEoJ29yaWdpbmFsV2lkdGgnKTtcblxuICAgICAgICAgICAgICAgICRvbGRTdWJNZW51cy5hbmltYXRlKHsgd2lkdGg6IDAgfSwgKDUwICogYmFzZS5vcHRpb25zLmFuaW1hdGlvbkZhY3RvciksIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAkb2xkU3ViTWVudXMuY3NzKHsgZGlzcGxheTogJ25vbmUnIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICRpdGVtLmFkZENsYXNzKGJhc2Uub3B0aW9ucy5hY3RpdmVDbGFzcyk7XG4gICAgICAgICAgICAgICAgJG5ld1N1Yk1lbnVcbiAgICAgICAgICAgICAgICAgICAgLmNzcyh7ZGlzcGxheTogJ2Jsb2NrJyB9KVxuICAgICAgICAgICAgICAgICAgICAuYW5pbWF0ZSh7IHdpZHRoOiBuZXdXaWR0aCB9LCAoMTI1ICogYmFzZS5vcHRpb25zLmFuaW1hdGlvbkZhY3RvciksIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgJG5ld1N1Yk1lbnUuY3NzKHsgd2lkdGg6ICdhdXRvJyB9KS5yZW1vdmVBdHRyKCdzdHlsZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYmFzZS5fdHJpZ2dlcignbWVudXNob3duJywgZXZlbnQsIHsgaXRlbTogJGl0ZW0sIHdpZGdldDogYmFzZSB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICA7XG4gICAgICAgICAgICAgICAgLy8gaWYgdGhlIG5ldyBzdWJtZW51IGhhcyBhbiBhY3RpdmUgaXRlbSwgY2xpY2sgaXRcbiAgICAgICAgICAgICAgICAkbmV3U3ViTWVudS5maW5kKCcuJyArIGJhc2Uub3B0aW9ucy5hY3RpdmVDbGFzcyArICcgYScpLmNsaWNrKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgICAgX3Nob3dTdWJNZW51OiBmdW5jdGlvbihldmVudCwgZGF0YSkge1xuICAgICAgICAgICAgLy8gZGUtYWN0aXZlaWZ5IGFsbCB0aGUgc3VibWVudSBpdGVtc1xuICAgICAgICAgICAgJChkYXRhLm1lbnVpdGVtKS5maW5kKCdsaScpLnJlbW92ZUNsYXNzKGRhdGEud2lkZ2V0Lm9wdGlvbnMuYWN0aXZlQ2xhc3MpO1xuICAgICAgICAgICAgLy8gYWN0aXZlLWlmeSB0aGUgb25lIHRydWUgc3VibWVudSBpdGVtXG4gICAgICAgICAgICAkKGRhdGEuc3VibWVudWl0ZW0pLmFkZENsYXNzKGRhdGEud2lkZ2V0Lm9wdGlvbnMuYWN0aXZlQ2xhc3MpO1xuICAgICAgICB9LFxuICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgIC8vIGRvIHRoZSBsYXlvdXQgY2FsY3VsYXRpb25zXG4gICAgICAgIF9sYXlvdXRQYW5lbHM6IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICB2YXIgJHBhZ2VzID0gdGhpcy5wYW5lbHMuZmluZCgnLicgKyB0aGlzLm9wdGlvbnMucGFnZUNsYXNzKTtcblxuICAgICAgICAgICAgLy8gZ28gdGhyb3VnaCBlYWNoIHBhZ2UgYW5kIHJlY29yZCBpdHMgaGVpZ2h0XG4gICAgICAgICAgICAkcGFnZXMuZWFjaCggZnVuY3Rpb24oaW5kZXgsIHBhZ2UpIHtcbiAgICAgICAgICAgICAgICB2YXIgJHBhZ2UgPSAkKHBhZ2UpO1xuICAgICAgICAgICAgICAgICRwYWdlLmNzcyh7aGVpZ2h0OiAnYXV0byd9KTtcbiAgICAgICAgICAgICAgICAkcGFnZS5kYXRhKCdvcmlnaW5hbEhlaWdodCcsICRwYWdlLm91dGVySGVpZ2h0KCkpO1xuXG4gICAgICAgICAgICAgICAgLy8gbGVhdmUgZWFjaCBwYWdlIGhpZGRlbiwgd2l0aCBoZWlnaHQgMFxuICAgICAgICAgICAgICAgICRwYWdlLmNzcyh7IGhlaWdodDogMCwgZGlzcGxheTogJ25vbmUnIH0pO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIGdvIHRocm91Z2ggZWFjaCBwYW5lbCBhbmQgaGlkZSBpdFxuICAgICAgICAgICAgdGhpcy5wYW5lbHMuZWFjaCggZnVuY3Rpb24oaW5kZXgsIHBhbmVsKSB7XG4gICAgICAgICAgICAgICAgdmFyICRwYW5lbCA9ICQocGFuZWwpO1xuICAgICAgICAgICAgICAgICRwYW5lbC5jc3MoeyBkaXNwbGF5OiAnbm9uZScgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICBfaGlkZVBhbmVsczogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLnBhbmVscy5yZW1vdmVDbGFzcyh0aGlzLm9wdGlvbnMuYWN0aXZlQ2xhc3MpLmNzcyh7IGRpc3BsYXk6ICdub25lJywgaGVpZ2h0OiAwIH0pO1xuICAgICAgICB9LFxuICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgIF9zaG93UGFuZWw6IGZ1bmN0aW9uKGV2ZW50LCBkYXRhKSB7XG4gICAgICAgICAgICB2YXIgJHBhbmVsID0gJChkYXRhLnBhbmVsKTtcbiAgICAgICAgICAgIHZhciBiYXNlID0gZGF0YS53aWRnZXQ7XG4gICAgICAgICAgICAvLyAkcGFuZWwgaXMgYSBwYW5lbCB0byBzaG93Li5cbiAgICAgICAgICAgIGlmICgkcGFuZWwuaGFzQ2xhc3MoYmFzZS5vcHRpb25zLmFjdGl2ZUNsYXNzKSkge1xuICAgICAgICAgICAgICAgIC8vID8/XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGJhc2UuX2hpZGVQYW5lbHMoKTtcbiAgICAgICAgICAgICAgICAkcGFuZWwuYWRkQ2xhc3MoYmFzZS5vcHRpb25zLmFjdGl2ZUNsYXNzKTtcbiAgICAgICAgICAgICAgICAkcGFuZWwuY3NzKHsgZGlzcGxheTogJ2Jsb2NrJywgb3BhY2l0eTogMSB9KTtcbiAgICAgICAgICAgICAgICB2YXIgJHBhZ2UgPSAkKCRwYW5lbC5maW5kKCcuJyArIGJhc2Uub3B0aW9ucy5wYWdlQ2xhc3MgKyAnLicgKyBiYXNlLm9wdGlvbnMuYWN0aXZlQ2xhc3MpKTtcbiAgICAgICAgICAgICAgICBiYXNlLl90cmlnZ2VyKCdzaG93cGFnZScsIGV2ZW50LCB7IHBhbmVsOiAkcGFuZWwsIHBhZ2U6ICRwYWdlLCB3aWRnZXQ6IGJhc2UgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgICAgX3Nob3dQYWdlOiBmdW5jdGlvbihldmVudCwgZGF0YSkge1xuICAgICAgICAgICAgdmFyIGJhc2UgPSBkYXRhLndpZGdldDtcbiAgICAgICAgICAgIHZhciAkcGFuZWwgPSAkKGRhdGEucGFuZWwpO1xuICAgICAgICAgICAgdmFyICRwYWdlID0gJChkYXRhLnBhZ2UpO1xuICAgICAgICAgICAgdmFyIG5ld0hlaWdodCA9ICRwYWdlLmRhdGEoJ29yaWdpbmFsSGVpZ2h0Jyk7XG5cbiAgICAgICAgICAgIC8vIGZpeCB0aGUgcGFuZWwncyBjdXJyZW50IGhlaWdodFxuICAgICAgICAgICAgJHBhbmVsLmNzcyh7aGVpZ2h0OiAkcGFuZWwuaGVpZ2h0KCkgfSk7XG5cbiAgICAgICAgICAgIC8vIGRlYWwgd2l0aCB0aGUgcGFnZSBjdXJyZW50bHkgYmVpbmcgZGlzcGxheWVkXG4gICAgICAgICAgICB2YXIgJG9sZFBhZ2UgPSAkcGFuZWwuZmluZCgnLicgKyBiYXNlLm9wdGlvbnMucGFnZUNsYXNzICsgJy4nICsgYmFzZS5vcHRpb25zLmFjdGl2ZUNsYXNzKS5ub3QoJHBhZ2UpO1xuICAgICAgICAgICAgaWYgKCRvbGRQYWdlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAkb2xkUGFnZS5kYXRhKCdvcmlnaW5hbEhlaWdodCcsICRvbGRQYWdlLm91dGVySGVpZ2h0KCkpO1xuICAgICAgICAgICAgICAgICRvbGRQYWdlLnJlbW92ZUNsYXNzKGJhc2Uub3B0aW9ucy5hY3RpdmVDbGFzcykuZmFkZU91dCgoNTAgKiBiYXNlLm9wdGlvbnMuYW5pbWF0aW9uRmFjdG9yKSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICRvbGRQYWdlLmNzcyh7IGhlaWdodDogMCB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gc3dpdGNoIG9uIHRoZSBuZXcgcGFnZSBhbmQgZ3JvdyB0aGUgb3BhbmVsIHRvIGhvbGQgaXRcbiAgICAgICAgICAgICRwYWdlLmNzcyh7IGhlaWdodDogJ2F1dG8nIH0pLmFkZENsYXNzKGJhc2Uub3B0aW9ucy5hY3RpdmVDbGFzcykuZmFkZUluKCgxMDAgKiBiYXNlLm9wdGlvbnMuYW5pbWF0aW9uRmFjdG9yKSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgJHBhZ2UucmVtb3ZlQXR0cignc3R5bGUnKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdmFyIGFuaW1UaW1lID0gKCRvbGRQYWdlLmxlbmd0aCA+IDAgPyAoMTAwICogYmFzZS5vcHRpb25zLmFuaW1hdGlvbkZhY3RvcikgOiAoMTUwICogYmFzZS5vcHRpb25zLmFuaW1hdGlvbkZhY3RvcikpOyAvLyBhbmltYXRlIGZhc3RlciBpZiBpdCdzIHN3aXRjaGluZyBwYWdlc1xuICAgICAgICAgICAgJHBhbmVsLmFuaW1hdGUoeyBoZWlnaHQ6IG5ld0hlaWdodCB9LCBhbmltVGltZSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgJHBhbmVsLnJlbW92ZUF0dHIoJ3N0eWxlJyk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB9LFxuICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgIF86IG51bGwgLy8gbm8gZm9sbG93aW5nIGNvbW1hXG4gICAgfSk7XG5cbn0pKGpRdWVyeSwgd2luZG93LCBkb2N1bWVudCk7XG5cblxuXG5cblxuXG5cblxuXG5cblxuXG4iXX0=
