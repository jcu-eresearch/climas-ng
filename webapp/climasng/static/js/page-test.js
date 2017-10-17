(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

require('./mapview/main');

$('header').disableSelection(); // unpopular but still better
$('nav > ul').mspp({});

},{"./mapview/main":2}],2:[function(require,module,exports){
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
        method: 'POST',
        data: {
          'info': mapInfo,
          'proj': projectionName
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
            styles: 'spp-suitability-purple',
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
              url: '/api/mapsearch/',
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

},{"../models/maplayer":3,"../util/shims":4}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9wdnJkd2IvcHJvamVjdHMvY2xpbWFzLWdsb2JhbC93ZWJhcHAvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi9Vc2Vycy9wdnJkd2IvcHJvamVjdHMvY2xpbWFzLWdsb2JhbC93ZWJhcHAvY2xpbWFzbmcvc3JjL2pzL2Zha2VfNWQ5ZDU5NjcuanMiLCIvVXNlcnMvcHZyZHdiL3Byb2plY3RzL2NsaW1hcy1nbG9iYWwvd2ViYXBwL2NsaW1hc25nL3NyYy9qcy9tYXB2aWV3L21haW4uanMiLCIvVXNlcnMvcHZyZHdiL3Byb2plY3RzL2NsaW1hcy1nbG9iYWwvd2ViYXBwL2NsaW1hc25nL3NyYy9qcy9tYXB2aWV3L21vZGVscy9tYXBsYXllci5qcyIsIi9Vc2Vycy9wdnJkd2IvcHJvamVjdHMvY2xpbWFzLWdsb2JhbC93ZWJhcHAvY2xpbWFzbmcvc3JjL2pzL21hcHZpZXcvdXRpbC9zaGltcy5qcyIsIi9Vc2Vycy9wdnJkd2IvcHJvamVjdHMvY2xpbWFzLWdsb2JhbC93ZWJhcHAvY2xpbWFzbmcvc3JjL2pzL21hcHZpZXcvdmlld3MvYXBwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcbnJlcXVpcmUoJy4vbWFwdmlldy9tYWluJyk7XG5cbiQoJ2hlYWRlcicpLmRpc2FibGVTZWxlY3Rpb24oKTsgLy8gdW5wb3B1bGFyIGJ1dCBzdGlsbCBiZXR0ZXJcbiQoJ25hdiA+IHVsJykubXNwcCh7fSk7XG4iLCIoZnVuY3Rpb24oKSB7XG4gIHZhciBBcHBWaWV3O1xuXG4gIGlmICghd2luZG93LmNvbnNvbGUpIHtcbiAgICB3aW5kb3cuY29uc29sZSA9IHtcbiAgICAgIGxvZzogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB7fTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgQXBwVmlldyA9IHJlcXVpcmUoJy4vdmlld3MvYXBwJyk7XG5cbiAgJChmdW5jdGlvbigpIHtcbiAgICB2YXIgYXBwdmlldztcbiAgICBhcHB2aWV3ID0gbmV3IEFwcFZpZXcoKTtcbiAgICByZXR1cm4gYXBwdmlldy5yZW5kZXIoKTtcbiAgfSk7XG5cbn0pLmNhbGwodGhpcyk7XG4iLCIoZnVuY3Rpb24oKSB7XG4gIHZhciBNYXBMYXllcjtcblxuICBNYXBMYXllciA9IEJhY2tib25lLk1vZGVsLmV4dGVuZCh7XG4gICAgY29uc3RydWN0b3I6IGZ1bmN0aW9uKHNob3J0TmFtZSwgbG9uZ05hbWUsIHBhdGgpIHtcbiAgICAgIHRoaXMuc2hvcnROYW1lID0gc2hvcnROYW1lO1xuICAgICAgdGhpcy5sb25nTmFtZSA9IGxvbmdOYW1lO1xuICAgICAgdGhpcy5wYXRoID0gcGF0aDtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfSk7XG5cbiAgbW9kdWxlLmV4cG9ydHMgPSBNYXBMYXllcjtcblxufSkuY2FsbCh0aGlzKTtcbiIsIihmdW5jdGlvbigpIHtcbiAgdmFyIF9faW5kZXhPZiA9IFtdLmluZGV4T2YgfHwgZnVuY3Rpb24oaXRlbSkgeyBmb3IgKHZhciBpID0gMCwgbCA9IHRoaXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7IGlmIChpIGluIHRoaXMgJiYgdGhpc1tpXSA9PT0gaXRlbSkgcmV0dXJuIGk7IH0gcmV0dXJuIC0xOyB9O1xuXG4gIGlmICghQXJyYXkucHJvdG90eXBlLmZvckVhY2gpIHtcbiAgICBBcnJheS5wcm90b3R5cGUuZm9yRWFjaCA9IGZ1bmN0aW9uKGZuLCBzY29wZSkge1xuICAgICAgdmFyIGksIF9pLCBfcmVmLCBfcmVzdWx0cztcbiAgICAgIF9yZXN1bHRzID0gW107XG4gICAgICBmb3IgKGkgPSBfaSA9IDAsIF9yZWYgPSB0aGlzLmxlbmd0aDsgMCA8PSBfcmVmID8gX2kgPD0gX3JlZiA6IF9pID49IF9yZWY7IGkgPSAwIDw9IF9yZWYgPyArK19pIDogLS1faSkge1xuICAgICAgICBfcmVzdWx0cy5wdXNoKF9faW5kZXhPZi5jYWxsKHRoaXMsIGkpID49IDAgPyBmbi5jYWxsKHNjb3BlLCB0aGlzW2ldLCBpLCB0aGlzKSA6IHZvaWQgMCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gX3Jlc3VsdHM7XG4gICAgfTtcbiAgfVxuXG4gIGlmICghQXJyYXkucHJvdG90eXBlLmluZGV4T2YpIHtcbiAgICBBcnJheS5wcm90b3R5cGUuaW5kZXhPZiA9IGZ1bmN0aW9uKG5lZWRsZSkge1xuICAgICAgdmFyIGksIF9pLCBfcmVmO1xuICAgICAgZm9yIChpID0gX2kgPSAwLCBfcmVmID0gdGhpcy5sZW5ndGg7IDAgPD0gX3JlZiA/IF9pIDw9IF9yZWYgOiBfaSA+PSBfcmVmOyBpID0gMCA8PSBfcmVmID8gKytfaSA6IC0tX2kpIHtcbiAgICAgICAgaWYgKHRoaXNbaV0gPT09IG5lZWRsZSkge1xuICAgICAgICAgIHJldHVybiBpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gLTE7XG4gICAgfTtcbiAgfVxuXG4gIGlmICghU3RyaW5nLnByb3RvdHlwZS5zdGFydHNXaXRoKSB7XG4gICAgU3RyaW5nLnByb3RvdHlwZS5zdGFydHNXaXRoID0gZnVuY3Rpb24oc2VhcmNoU3RyLCBwb3MpIHtcbiAgICAgIHJldHVybiB0aGlzLnN1YnN0cihwb3MgfHwgMCwgc2VhcmNoU3RyLmxlbmd0aCkgPT09IHNlYXJjaFN0cjtcbiAgICB9O1xuICB9XG5cbn0pLmNhbGwodGhpcyk7XG4iLCIoZnVuY3Rpb24oKSB7XG4gIHZhciBBcHBWaWV3LCBNYXBMYXllciwgZGVidWc7XG5cbiAgTWFwTGF5ZXIgPSByZXF1aXJlKCcuLi9tb2RlbHMvbWFwbGF5ZXInKTtcblxuICByZXF1aXJlKCcuLi91dGlsL3NoaW1zJyk7XG5cblxuICAvKiBqc2hpbnQgLVcwOTMgKi9cblxuICBkZWJ1ZyA9IGZ1bmN0aW9uKGl0ZW1Ub0xvZywgaXRlbUxldmVsKSB7XG4gICAgdmFyIGxldmVscywgbWVzc2FnZU51bSwgdGhyZXNob2xkLCB0aHJlc2hvbGROdW07XG4gICAgbGV2ZWxzID0gWyd2ZXJ5ZGVidWcnLCAnZGVidWcnLCAnbWVzc2FnZScsICd3YXJuaW5nJ107XG4gICAgaWYgKCFpdGVtTGV2ZWwpIHtcbiAgICAgIGl0ZW1MZXZlbCA9ICdkZWJ1Zyc7XG4gICAgfVxuICAgIHRocmVzaG9sZCA9ICdkZWJ1Zyc7XG4gICAgdGhyZXNob2xkTnVtID0gbGV2ZWxzLmluZGV4T2YodGhyZXNob2xkKTtcbiAgICBtZXNzYWdlTnVtID0gbGV2ZWxzLmluZGV4T2YoaXRlbUxldmVsKTtcbiAgICBpZiAodGhyZXNob2xkTnVtID4gbWVzc2FnZU51bSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoaXRlbVRvTG9nICsgJycgPT09IGl0ZW1Ub0xvZykge1xuICAgICAgcmV0dXJuIGNvbnNvbGUubG9nKFwiW1wiICsgaXRlbUxldmVsICsgXCJdIFwiICsgaXRlbVRvTG9nKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGNvbnNvbGUubG9nKGl0ZW1Ub0xvZyk7XG4gICAgfVxuICB9O1xuXG4gIEFwcFZpZXcgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XG4gICAgdGFnTmFtZTogJ2RpdicsXG4gICAgY2xhc3NOYW1lOiAnc3BsaXRtYXAgc2hvd2Zvcm1zJyxcbiAgICBpZDogJ3NwbGl0bWFwJyxcbiAgICBzcGVjaWVzRGF0YVVybDogd2luZG93Lm1hcENvbmZpZy5zcGVjaWVzRGF0YVVybCxcbiAgICBjbGltYXRlRGF0YVVybDogd2luZG93Lm1hcENvbmZpZy5jbGltYXRlRGF0YVVybCxcbiAgICBzdW1tYXJpZXNEYXRhVXJsOiB3aW5kb3cubWFwQ29uZmlnLnN1bW1hcmllc0RhdGFVcmwsXG4gICAgYmlvZGl2RGF0YVVybDogd2luZG93Lm1hcENvbmZpZy5iaW9kaXZEYXRhVXJsLFxuICAgIHJhc3RlckFwaVVybDogd2luZG93Lm1hcENvbmZpZy5yYXN0ZXJBcGlVcmwsXG4gICAgdHJhY2tTcGxpdHRlcjogZmFsc2UsXG4gICAgdHJhY2tQZXJpb2Q6IDEwMCxcbiAgICBldmVudHM6IHtcbiAgICAgICdjbGljayAuYnRuLWNoYW5nZSc6ICd0b2dnbGVGb3JtcycsXG4gICAgICAnY2xpY2sgLmJ0bi1jb21wYXJlJzogJ3RvZ2dsZVNwbGl0dGVyJyxcbiAgICAgICdjbGljayAuYnRuLWNvcHkubGVmdC12YWxpZC1tYXAnOiAnY29weU1hcExlZnRUb1JpZ2h0JyxcbiAgICAgICdjbGljayAuYnRuLWNvcHkucmlnaHQtdmFsaWQtbWFwJzogJ2NvcHlNYXBSaWdodFRvTGVmdCcsXG4gICAgICAnbGVmdG1hcHVwZGF0ZSc6ICdsZWZ0U2lkZVVwZGF0ZScsXG4gICAgICAncmlnaHRtYXB1cGRhdGUnOiAncmlnaHRTaWRlVXBkYXRlJyxcbiAgICAgICdjaGFuZ2Ugc2VsZWN0LmxlZnQnOiAnbGVmdFNpZGVVcGRhdGUnLFxuICAgICAgJ2NoYW5nZSBzZWxlY3QucmlnaHQnOiAncmlnaHRTaWRlVXBkYXRlJyxcbiAgICAgICdjaGFuZ2UgaW5wdXQubGVmdCc6ICdsZWZ0U2lkZVVwZGF0ZScsXG4gICAgICAnY2hhbmdlIGlucHV0LnJpZ2h0JzogJ3JpZ2h0U2lkZVVwZGF0ZScsXG4gICAgICAnY2hhbmdlICNzeW5jJzogJ3RvZ2dsZVN5bmMnXG4gICAgfSxcbiAgICB0aWNrOiBmdW5jdGlvbigpIHtcbiAgICAgIGlmIChmYWxzZSkge1xuICAgICAgICBkZWJ1Zyh0aGlzLmxlZnRJbmZvLnNjZW5hcmlvKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRlYnVnKCd0aWNrJyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gc2V0VGltZW91dCh0aGlzLnRpY2ssIDEwMDApO1xuICAgIH0sXG4gICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5pbml0aWFsaXplJyk7XG4gICAgICBfLmJpbmRBbGwuYXBwbHkoXywgW3RoaXNdLmNvbmNhdChfLmZ1bmN0aW9ucyh0aGlzKSkpO1xuICAgICAgdGhpcy5uYW1lSW5kZXggPSB7fTtcbiAgICAgIHJldHVybiB0aGlzLm1hcExpc3QgPSB7fTtcbiAgICB9LFxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5yZW5kZXInKTtcbiAgICAgIHRoaXMuJGVsLmFwcGVuZChBcHBWaWV3LnRlbXBsYXRlcy5sYXlvdXQoe1xuICAgICAgICBsZWZ0VGFnOiBBcHBWaWV3LnRlbXBsYXRlcy5sZWZ0VGFnKCksXG4gICAgICAgIHJpZ2h0VGFnOiBBcHBWaWV3LnRlbXBsYXRlcy5yaWdodFRhZygpLFxuICAgICAgICBsZWZ0Rm9ybTogQXBwVmlldy50ZW1wbGF0ZXMubGVmdEZvcm0oKSxcbiAgICAgICAgcmlnaHRGb3JtOiBBcHBWaWV3LnRlbXBsYXRlcy5yaWdodEZvcm0oKVxuICAgICAgfSkpO1xuICAgICAgJCgnI2NvbnRlbnR3cmFwJykuYXBwZW5kKHRoaXMuJGVsKTtcbiAgICAgIHRoaXMubWFwID0gTC5tYXAoJ21hcCcsIHtcbiAgICAgICAgY2VudGVyOiBbMCwgMF0sXG4gICAgICAgIHpvb206IDJcbiAgICAgIH0pO1xuICAgICAgdGhpcy5tYXAub24oJ21vdmUnLCB0aGlzLnJlc2l6ZVRoaW5ncyk7XG4gICAgICBMLmNvbnRyb2wuc2NhbGUoKS5hZGRUbyh0aGlzLm1hcCk7XG4gICAgICBMLnRpbGVMYXllcignLy9zZXJ2ZXIuYXJjZ2lzb25saW5lLmNvbS9BcmNHSVMvcmVzdC9zZXJ2aWNlcy97dmFyaWFudH0vTWFwU2VydmVyL3RpbGUve3p9L3t5fS97eH0nLCB7XG4gICAgICAgIGF0dHJpYnV0aW9uOiAnVGlsZXMgJmNvcHk7IEVzcmknLFxuICAgICAgICB2YXJpYW50OiAnV29ybGRfVG9wb19NYXAnXG4gICAgICB9KS5hZGRUbyh0aGlzLm1hcCk7XG4gICAgICB0aGlzLmxlZnRGb3JtID0gdGhpcy4kKCcubGVmdC5mb3JtJyk7XG4gICAgICB0aGlzLmJ1aWxkRm9ybSgnbGVmdCcpO1xuICAgICAgdGhpcy5yaWdodEZvcm0gPSB0aGlzLiQoJy5yaWdodC5mb3JtJyk7XG4gICAgICB0aGlzLmJ1aWxkRm9ybSgncmlnaHQnKTtcbiAgICAgIHRoaXMubGVmdFRhZyA9IHRoaXMuJCgnLmxlZnQudGFnJyk7XG4gICAgICB0aGlzLnJpZ2h0VGFnID0gdGhpcy4kKCcucmlnaHQudGFnJyk7XG4gICAgICB0aGlzLnNwbGl0TGluZSA9IHRoaXMuJCgnLnNwbGl0bGluZScpO1xuICAgICAgdGhpcy5zcGxpdFRodW1iID0gdGhpcy4kKCcuc3BsaXR0aHVtYicpO1xuICAgICAgdGhpcy5sZWZ0U2lkZVVwZGF0ZSgpO1xuICAgICAgdGhpcy5yaWdodFNpZGVVcGRhdGUoKTtcbiAgICAgIHJldHVybiB0aGlzLnRvZ2dsZVNwbGl0dGVyKCk7XG4gICAgfSxcbiAgICByZXNvbHZlUGxhY2Vob2xkZXJzOiBmdW5jdGlvbihzdHJXaXRoUGxhY2Vob2xkZXJzLCByZXBsYWNlbWVudHMpIHtcbiAgICAgIHZhciBhbnMsIGtleSwgcmUsIHZhbHVlO1xuICAgICAgYW5zID0gc3RyV2l0aFBsYWNlaG9sZGVycztcbiAgICAgIGFucyA9IGFucy5yZXBsYWNlKC9cXHtcXHtcXHMqbG9jYXRpb24ucHJvdG9jb2xcXHMqXFx9XFx9L2csIGxvY2F0aW9uLnByb3RvY29sKTtcbiAgICAgIGFucyA9IGFucy5yZXBsYWNlKC9cXHtcXHtcXHMqbG9jYXRpb24uaG9zdFxccypcXH1cXH0vZywgbG9jYXRpb24uaG9zdCk7XG4gICAgICBhbnMgPSBhbnMucmVwbGFjZSgvXFx7XFx7XFxzKmxvY2F0aW9uLmhvc3RuYW1lXFxzKlxcfVxcfS9nLCBsb2NhdGlvbi5ob3N0bmFtZSk7XG4gICAgICBmb3IgKGtleSBpbiByZXBsYWNlbWVudHMpIHtcbiAgICAgICAgdmFsdWUgPSByZXBsYWNlbWVudHNba2V5XTtcbiAgICAgICAgcmUgPSBuZXcgUmVnRXhwKFwiXFxcXHtcXFxce1xcXFxzKlwiICsga2V5ICsgXCJcXFxccypcXFxcfVxcXFx9XCIsIFwiZ1wiKTtcbiAgICAgICAgYW5zID0gYW5zLnJlcGxhY2UocmUsIHZhbHVlKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBhbnM7XG4gICAgfSxcbiAgICBjb3B5TWFwTGVmdFRvUmlnaHQ6IGZ1bmN0aW9uKCkge1xuICAgICAgZGVidWcoJ0FwcFZpZXcuY29weU1hcExlZnRUb1JpZ2h0Jyk7XG4gICAgICBpZiAoIXRoaXMubGVmdEluZm8pIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdGhpcy4kKCcjcmlnaHRtYXBzcHAnKS52YWwodGhpcy5sZWZ0SW5mby5tYXBOYW1lKTtcbiAgICAgIHRoaXMuJCgnI3JpZ2h0bWFweWVhcicpLnZhbCh0aGlzLmxlZnRJbmZvLnllYXIpO1xuICAgICAgdGhpcy4kKCdpbnB1dFtuYW1lPXJpZ2h0bWFwc2NlbmFyaW9dJykuZWFjaCgoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGluZGV4LCBpdGVtKSB7XG4gICAgICAgICAgcmV0dXJuICQoaXRlbSkucHJvcCgnY2hlY2tlZCcsICQoaXRlbSkudmFsKCkgPT09IF90aGlzLmxlZnRJbmZvLnNjZW5hcmlvKTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKTtcbiAgICAgIHRoaXMuJCgnI3JpZ2h0bWFwZ2NtJykudmFsKHRoaXMubGVmdEluZm8uZ2NtKTtcbiAgICAgIHJldHVybiB0aGlzLnJpZ2h0U2lkZVVwZGF0ZSgpO1xuICAgIH0sXG4gICAgY29weU1hcFJpZ2h0VG9MZWZ0OiBmdW5jdGlvbigpIHtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LmNvcHlNYXBSaWdodFRvTGVmdCcpO1xuICAgICAgaWYgKCF0aGlzLnJpZ2h0SW5mbykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB0aGlzLiQoJyNsZWZ0bWFwc3BwJykudmFsKHRoaXMucmlnaHRJbmZvLm1hcE5hbWUpO1xuICAgICAgdGhpcy4kKCcjbGVmdG1hcHllYXInKS52YWwodGhpcy5yaWdodEluZm8ueWVhcik7XG4gICAgICB0aGlzLiQoJ2lucHV0W25hbWU9bGVmdG1hcHNjZW5hcmlvXScpLmVhY2goKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihpbmRleCwgaXRlbSkge1xuICAgICAgICAgIHJldHVybiAkKGl0ZW0pLnByb3AoJ2NoZWNrZWQnLCAkKGl0ZW0pLnZhbCgpID09PSBfdGhpcy5yaWdodEluZm8uc2NlbmFyaW8pO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpO1xuICAgICAgdGhpcy4kKCcjbGVmdG1hcGdjbScpLnZhbCh0aGlzLnJpZ2h0SW5mby5nY20pO1xuICAgICAgcmV0dXJuIHRoaXMubGVmdFNpZGVVcGRhdGUoKTtcbiAgICB9LFxuICAgIHNpZGVVcGRhdGU6IGZ1bmN0aW9uKHNpZGUpIHtcbiAgICAgIHZhciBhdEJhc2VsaW5lLCBjdXJySW5mbywgbmV3SW5mbztcbiAgICAgIGRlYnVnKCdBcHBWaWV3LnNpZGVVcGRhdGUgKCcgKyBzaWRlICsgJyknKTtcbiAgICAgIG5ld0luZm8gPSB7XG4gICAgICAgIG1hcE5hbWU6IHRoaXMuJCgnIycgKyBzaWRlICsgJ21hcHNwcCcpLnZhbCgpLFxuICAgICAgICBkZWdzOiB0aGlzLiQoJyMnICsgc2lkZSArICdtYXBkZWdzJykudmFsKCksXG4gICAgICAgIHJhbmdlOiB0aGlzLiQoJ2lucHV0W25hbWU9JyArIHNpZGUgKyAnbWFwcmFuZ2VdOmNoZWNrZWQnKS52YWwoKSxcbiAgICAgICAgY29uZmlkZW5jZTogdGhpcy4kKCcjJyArIHNpZGUgKyAnbWFwY29uZmlkZW5jZScpLnZhbCgpXG4gICAgICB9O1xuICAgICAgYXRCYXNlbGluZSA9IG5ld0luZm8uZGVncyA9PT0gJ2Jhc2VsaW5lJztcbiAgICAgIHRoaXMuJChcImlucHV0W25hbWU9XCIgKyBzaWRlICsgXCJtYXByYW5nZV0sICNcIiArIHNpZGUgKyBcIm1hcGNvbmZpZGVuY2VcIikucHJvcCgnZGlzYWJsZWQnLCBhdEJhc2VsaW5lKTtcbiAgICAgIHRoaXMuJChcIi5cIiArIHNpZGUgKyBcIi5zaWRlLmZvcm0gZmllbGRzZXRcIikucmVtb3ZlQ2xhc3MoJ2Rpc2FibGVkJyk7XG4gICAgICB0aGlzLiQoXCJpbnB1dFtuYW1lXj1cIiArIHNpZGUgKyBcIl06ZGlzYWJsZWQsIFtpZF49XCIgKyBzaWRlICsgXCJdOmRpc2FibGVkXCIpLmNsb3Nlc3QoJ2ZpZWxkc2V0JykuYWRkQ2xhc3MoJ2Rpc2FibGVkJyk7XG4gICAgICBpZiAobmV3SW5mby5tYXBOYW1lIGluIHRoaXMubmFtZUluZGV4KSB7XG4gICAgICAgIHRoaXMuJChcIi5cIiArIHNpZGUgKyBcIi12YWxpZC1tYXBcIikucmVtb3ZlQ2xhc3MoJ2Rpc2FibGVkJykucHJvcCgnZGlzYWJsZWQnLCBmYWxzZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLiQoXCIuXCIgKyBzaWRlICsgXCItdmFsaWQtbWFwXCIpLmFkZENsYXNzKCdkaXNhYmxlZCcpLnByb3AoJ2Rpc2FibGVkJywgdHJ1ZSk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIGN1cnJJbmZvID0gc2lkZSA9PT0gJ2xlZnQnID8gdGhpcy5sZWZ0SW5mbyA6IHRoaXMucmlnaHRJbmZvO1xuICAgICAgaWYgKGN1cnJJbmZvICYmIF8uaXNFcXVhbChuZXdJbmZvLCBjdXJySW5mbykpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgaWYgKGN1cnJJbmZvICYmIG5ld0luZm8ubWFwTmFtZSA9PT0gY3VyckluZm8ubWFwTmFtZSAmJiBuZXdJbmZvLmRlZ3MgPT09IGN1cnJJbmZvLmRlZ3MgJiYgbmV3SW5mby5kZWdzID09PSAnYmFzZWxpbmUnKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIGlmIChzaWRlID09PSAnbGVmdCcpIHtcbiAgICAgICAgdGhpcy5sZWZ0SW5mbyA9IG5ld0luZm87XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnJpZ2h0SW5mbyA9IG5ld0luZm87XG4gICAgICB9XG4gICAgICB0aGlzLmFkZE1hcExheWVyKHNpZGUpO1xuICAgICAgcmV0dXJuIHRoaXMuYWRkTWFwVGFnKHNpZGUpO1xuICAgIH0sXG4gICAgbGVmdFNpZGVVcGRhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zaWRlVXBkYXRlKCdsZWZ0Jyk7XG4gICAgICBpZiAodGhpcy4kKCcjc3luYycpWzBdLmNoZWNrZWQpIHtcbiAgICAgICAgZGVidWcoJ1N5bmMgY2hlY2tlZCAtIHN5bmNpbmcgcmlnaHQgc2lkZScsICdtZXNzYWdlJyk7XG4gICAgICAgIHJldHVybiB0aGlzLmNvcHlTcHBUb1JpZ2h0U2lkZSgpO1xuICAgICAgfVxuICAgIH0sXG4gICAgcmlnaHRTaWRlVXBkYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLnNpZGVVcGRhdGUoJ3JpZ2h0Jyk7XG4gICAgfSxcbiAgICBjb3B5U3BwVG9SaWdodFNpZGU6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy4kKCcjcmlnaHRtYXBzcHAnKS52YWwodGhpcy4kKCcjbGVmdG1hcHNwcCcpLnZhbCgpKTtcbiAgICAgIHJldHVybiB0aGlzLnJpZ2h0U2lkZVVwZGF0ZSgpO1xuICAgIH0sXG4gICAgYWRkTWFwVGFnOiBmdW5jdGlvbihzaWRlKSB7XG4gICAgICB2YXIgZGlzcExvb2t1cCwgaW5mbywgdGFnO1xuICAgICAgZGVidWcoJ0FwcFZpZXcuYWRkTWFwVGFnJyk7XG4gICAgICBpZiAoc2lkZSA9PT0gJ2xlZnQnKSB7XG4gICAgICAgIGluZm8gPSB0aGlzLmxlZnRJbmZvO1xuICAgICAgfVxuICAgICAgaWYgKHNpZGUgPT09ICdyaWdodCcpIHtcbiAgICAgICAgaW5mbyA9IHRoaXMucmlnaHRJbmZvO1xuICAgICAgfVxuICAgICAgdGFnID0gXCI8Yj48aT5cIiArIGluZm8ubWFwTmFtZSArIFwiPC9pPjwvYj5cIjtcbiAgICAgIGRpc3BMb29rdXAgPSB7XG4gICAgICAgICduby5kaXNwJzogJ25vIHJhbmdlIGFkYXB0YXRpb24nLFxuICAgICAgICAncmVhbC5kaXNwJzogJ3JhbmdlIGFkYXB0YXRpb24nXG4gICAgICB9O1xuICAgICAgaWYgKGluZm8uZGVncyA9PT0gJ2Jhc2VsaW5lJykge1xuICAgICAgICB0YWcgPSBcImJhc2VsaW5lIFwiICsgdGFnICsgXCIgZGlzdHJpYnV0aW9uXCI7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0YWcgPSBcIjxiPlwiICsgaW5mby5jb25maWRlbmNlICsgXCI8L2I+IHBlcmNlbnRpbGUgcHJvamVjdGlvbnMgZm9yIFwiICsgdGFnICsgXCIgYXQgPGI+K1wiICsgaW5mby5kZWdzICsgXCImZGVnO0M8L2I+IHdpdGggPGI+XCIgKyBkaXNwTG9va3VwW2luZm8ucmFuZ2VdICsgXCI8L2I+XCI7XG4gICAgICB9XG4gICAgICBpZiAoc2lkZSA9PT0gJ2xlZnQnKSB7XG4gICAgICAgIHRoaXMubGVmdFRhZy5maW5kKCcubGVmdGxheWVybmFtZScpLmh0bWwodGFnKTtcbiAgICAgIH1cbiAgICAgIGlmIChzaWRlID09PSAncmlnaHQnKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJpZ2h0VGFnLmZpbmQoJy5yaWdodGxheWVybmFtZScpLmh0bWwodGFnKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGFkZE1hcExheWVyOiBmdW5jdGlvbihzaWRlKSB7XG4gICAgICB2YXIgZXh0LCBmdXR1cmVNb2RlbFBvaW50LCBpc0NvbmNlcm4sIGlzUmVmdWdpYSwgaXNSaWNobmVzcywgbWFwSW5mbywgbWFwVXJsLCBwcm9qZWN0aW9uTmFtZSwgc2lkZUluZm8sIHVybCwgemlwVXJsO1xuICAgICAgZGVidWcoJ0FwcFZpZXcuYWRkTWFwTGF5ZXInKTtcbiAgICAgIGlmIChzaWRlID09PSAnbGVmdCcpIHtcbiAgICAgICAgc2lkZUluZm8gPSB0aGlzLmxlZnRJbmZvO1xuICAgICAgfVxuICAgICAgaWYgKHNpZGUgPT09ICdyaWdodCcpIHtcbiAgICAgICAgc2lkZUluZm8gPSB0aGlzLnJpZ2h0SW5mbztcbiAgICAgIH1cbiAgICAgIGZ1dHVyZU1vZGVsUG9pbnQgPSAnJztcbiAgICAgIG1hcFVybCA9ICcnO1xuICAgICAgemlwVXJsID0gJyc7XG4gICAgICBpc1JpY2huZXNzID0gc2lkZUluZm8ubWFwTmFtZS5zdGFydHNXaXRoKCdSaWNobmVzcyAtJyk7XG4gICAgICBpc1JlZnVnaWEgPSBzaWRlSW5mby5tYXBOYW1lLnN0YXJ0c1dpdGgoJ1JlZnVnaWEgLScpO1xuICAgICAgaXNDb25jZXJuID0gc2lkZUluZm8ubWFwTmFtZS5zdGFydHNXaXRoKCdDb25jZXJuIC0nKTtcbiAgICAgIGlmIChpc1JpY2huZXNzKSB7XG4gICAgICAgIHByb2plY3Rpb25OYW1lID0gXCJwcm9wLnJpY2huZXNzX1wiICsgc2lkZUluZm8uZGVncyArIFwiX1wiICsgc2lkZUluZm8ucmFuZ2UgKyBcIl9cIiArIHNpZGVJbmZvLmNvbmZpZGVuY2U7XG4gICAgICAgIGlmIChzaWRlSW5mby5kZWdzID09PSAnYmFzZWxpbmUnKSB7XG4gICAgICAgICAgcHJvamVjdGlvbk5hbWUgPSAnY3VycmVudC5yaWNobmVzcyc7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoaXNSZWZ1Z2lhKSB7XG4gICAgICAgIHByb2plY3Rpb25OYW1lID0gXCJyZWZ1Z2UuY2VydGFpbnR5X1wiICsgc2lkZUluZm8uZGVncyArIFwiX1wiICsgc2lkZUluZm8ucmFuZ2U7XG4gICAgICAgIGlmIChzaWRlSW5mby5kZWdzID09PSAnYmFzZWxpbmUnKSB7XG4gICAgICAgICAgcHJvamVjdGlvbk5hbWUgPSAnY3VycmVudC5yaWNobmVzcyc7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoaXNDb25jZXJuKSB7XG4gICAgICAgIHByb2plY3Rpb25OYW1lID0gXCJBcmVhT2ZDb25jZXJuLmNlcnRhaW50eV9cIiArIHNpZGVJbmZvLmRlZ3MgKyBcIl9cIiArIHNpZGVJbmZvLnJhbmdlO1xuICAgICAgICBpZiAoc2lkZUluZm8uZGVncyA9PT0gJ2Jhc2VsaW5lJykge1xuICAgICAgICAgIHByb2plY3Rpb25OYW1lID0gJ2N1cnJlbnQucmljaG5lc3MnO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwcm9qZWN0aW9uTmFtZSA9IFwiVEVNUF9cIiArIHNpZGVJbmZvLmRlZ3MgKyBcIl9cIiArIHNpZGVJbmZvLmNvbmZpZGVuY2UgKyBcIi5cIiArIHNpZGVJbmZvLnJhbmdlO1xuICAgICAgICBpZiAoc2lkZUluZm8uZGVncyA9PT0gJ2Jhc2VsaW5lJykge1xuICAgICAgICAgIHByb2plY3Rpb25OYW1lID0gJ2N1cnJlbnQnO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBtYXBJbmZvID0gdGhpcy5tYXBMaXN0W3RoaXMubmFtZUluZGV4W3NpZGVJbmZvLm1hcE5hbWVdXTtcbiAgICAgIGlmIChtYXBJbmZvKSB7XG4gICAgICAgIHVybCA9IHRoaXMuc3BlY2llc0RhdGFVcmw7XG4gICAgICAgIGV4dCA9ICcudGlmJztcbiAgICAgICAgaWYgKG1hcEluZm8udHlwZSA9PT0gJ2NsaW1hdGUnKSB7XG4gICAgICAgICAgdXJsID0gdGhpcy5jbGltYXRlRGF0YVVybDtcbiAgICAgICAgICBleHQgPSAnLmFzYyc7XG4gICAgICAgIH0gZWxzZSBpZiAobWFwSW5mby50eXBlID09PSAncmljaG5lc3MnKSB7XG4gICAgICAgICAgdXJsID0gdGhpcy5zdW1tYXJpZXNEYXRhVXJsO1xuICAgICAgICB9XG4gICAgICAgIG1hcFVybCA9IFtcbiAgICAgICAgICB0aGlzLnJlc29sdmVQbGFjZWhvbGRlcnModXJsLCB7XG4gICAgICAgICAgICBwYXRoOiBtYXBJbmZvLnBhdGhcbiAgICAgICAgICB9KSwgcHJvamVjdGlvbk5hbWUgKyBleHRcbiAgICAgICAgXS5qb2luKCcvJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmxvZyhcIkNhbid0IG1hcCB0aGF0IC0tIG5vICdcIiArIHNpZGVJbmZvLm1hcE5hbWUgKyBcIicgaW4gaW5kZXhcIik7XG4gICAgICB9XG4gICAgICByZXR1cm4gJC5hamF4KHtcbiAgICAgICAgdXJsOiAnL2FwaS9wcmVwbGF5ZXIvJyxcbiAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAnaW5mbyc6IG1hcEluZm8sXG4gICAgICAgICAgJ3Byb2onOiBwcm9qZWN0aW9uTmFtZVxuICAgICAgICB9XG4gICAgICB9KS5kb25lKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgIHZhciBsYXllciwgbG9hZENsYXNzLCB3bXNMYXllciwgd21zVXJsO1xuICAgICAgICAgIGNvbnNvbGUubG9nKFsnbGF5ZXIgcHJlcHBlZCwgYW5zd2VyIGlzICcsIGRhdGFdKTtcbiAgICAgICAgICB3bXNVcmwgPSBkYXRhLm1hcFVybDtcbiAgICAgICAgICB3bXNMYXllciA9IGRhdGEubGF5ZXJOYW1lO1xuICAgICAgICAgIGxheWVyID0gTC50aWxlTGF5ZXIud21zKHdtc1VybCwge1xuICAgICAgICAgICAgbGF5ZXJzOiB3bXNMYXllcixcbiAgICAgICAgICAgIGZvcm1hdDogJ2ltYWdlL3BuZycsXG4gICAgICAgICAgICBzdHlsZXM6ICdzcHAtc3VpdGFiaWxpdHktcHVycGxlJyxcbiAgICAgICAgICAgIHRyYW5zcGFyZW50OiB0cnVlXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgbG9hZENsYXNzID0gJycgKyBzaWRlICsgJ2xvYWRpbmcnO1xuICAgICAgICAgIGxheWVyLm9uKCdsb2FkaW5nJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gX3RoaXMuJGVsLmFkZENsYXNzKGxvYWRDbGFzcyk7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgbGF5ZXIub24oJ2xvYWQnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBfdGhpcy4kZWwucmVtb3ZlQ2xhc3MobG9hZENsYXNzKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBpZiAoc2lkZSA9PT0gJ2xlZnQnKSB7XG4gICAgICAgICAgICBpZiAoX3RoaXMubGVmdExheWVyKSB7XG4gICAgICAgICAgICAgIF90aGlzLm1hcC5yZW1vdmVMYXllcihfdGhpcy5sZWZ0TGF5ZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgX3RoaXMubGVmdExheWVyID0gbGF5ZXI7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChzaWRlID09PSAncmlnaHQnKSB7XG4gICAgICAgICAgICBpZiAoX3RoaXMucmlnaHRMYXllcikge1xuICAgICAgICAgICAgICBfdGhpcy5tYXAucmVtb3ZlTGF5ZXIoX3RoaXMucmlnaHRMYXllcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBfdGhpcy5yaWdodExheWVyID0gbGF5ZXI7XG4gICAgICAgICAgfVxuICAgICAgICAgIGxheWVyLmFkZFRvKF90aGlzLm1hcCk7XG4gICAgICAgICAgcmV0dXJuIF90aGlzLnJlc2l6ZVRoaW5ncygpO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpLmZhaWwoKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihqcXgsIHN0YXR1cykge1xuICAgICAgICAgIHJldHVybiBkZWJ1ZyhzdGF0dXMsICd3YXJuaW5nJyk7XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKSk7XG4gICAgfSxcbiAgICBjZW50cmVNYXA6IGZ1bmN0aW9uKHJlcGVhdGVkbHlGb3IpIHtcbiAgICAgIHZhciBsYXRlciwgcmVjZW50cmUsIF9pLCBfcmVzdWx0cztcbiAgICAgIGRlYnVnKCdBcHBWaWV3LmNlbnRyZU1hcCcpO1xuICAgICAgaWYgKCFyZXBlYXRlZGx5Rm9yKSB7XG4gICAgICAgIHJlcGVhdGVkbHlGb3IgPSA1MDA7XG4gICAgICB9XG4gICAgICByZWNlbnRyZSA9IChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgX3RoaXMubWFwLmludmFsaWRhdGVTaXplKGZhbHNlKTtcbiAgICAgICAgICByZXR1cm4gX3RoaXMucmVzaXplVGhpbmdzKCk7XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKTtcbiAgICAgIF9yZXN1bHRzID0gW107XG4gICAgICBmb3IgKGxhdGVyID0gX2kgPSAwOyBfaSA8PSByZXBlYXRlZGx5Rm9yOyBsYXRlciA9IF9pICs9IDI1KSB7XG4gICAgICAgIF9yZXN1bHRzLnB1c2goc2V0VGltZW91dChyZWNlbnRyZSwgbGF0ZXIpKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBfcmVzdWx0cztcbiAgICB9LFxuICAgIHRvZ2dsZUZvcm1zOiBmdW5jdGlvbigpIHtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LnRvZ2dsZUZvcm1zJyk7XG4gICAgICB0aGlzLiRlbC50b2dnbGVDbGFzcygnc2hvd2Zvcm1zJyk7XG4gICAgICByZXR1cm4gdGhpcy5jZW50cmVNYXAoKTtcbiAgICB9LFxuICAgIHRvZ2dsZVNwbGl0dGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LnRvZ2dsZVNwbGl0dGVyJyk7XG4gICAgICB0aGlzLiRlbC50b2dnbGVDbGFzcygnc3BsaXQnKTtcbiAgICAgIGlmICh0aGlzLiRlbC5oYXNDbGFzcygnc3BsaXQnKSkge1xuICAgICAgICB0aGlzLmFjdGl2YXRlU3BsaXR0ZXIoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuZGVhY3RpdmF0ZVNwbGl0dGVyKCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5jZW50cmVNYXAoKTtcbiAgICB9LFxuICAgIHRvZ2dsZVN5bmM6IGZ1bmN0aW9uKCkge1xuICAgICAgZGVidWcoJ0FwcFZpZXcudG9nZ2xlU3luYycpO1xuICAgICAgaWYgKHRoaXMuJCgnI3N5bmMnKVswXS5jaGVja2VkKSB7XG4gICAgICAgIHRoaXMuJCgnLnJpZ2h0bWFwc3BwJykucHJvcCgnZGlzYWJsZWQnLCB0cnVlKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29weVNwcFRvUmlnaHRTaWRlKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdGhpcy4kKCcucmlnaHRtYXBzcHAnKS5wcm9wKCdkaXNhYmxlZCcsIGZhbHNlKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGJ1aWxkRm9ybTogZnVuY3Rpb24oc2lkZSkge1xuICAgICAgdmFyICRtYXBzcHA7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5idWlsZEZvcm0nKTtcbiAgICAgICRtYXBzcHAgPSB0aGlzLiQoXCIjXCIgKyBzaWRlICsgXCJtYXBzcHBcIik7XG4gICAgICByZXR1cm4gJG1hcHNwcC5hdXRvY29tcGxldGUoe1xuICAgICAgICBjbG9zZTogKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIF90aGlzLiRlbC50cmlnZ2VyKFwiXCIgKyBzaWRlICsgXCJtYXB1cGRhdGVcIik7XG4gICAgICAgICAgfTtcbiAgICAgICAgfSkodGhpcyksXG4gICAgICAgIHNvdXJjZTogKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKHJlcSwgcmVzcG9uc2UpIHtcbiAgICAgICAgICAgIHJldHVybiAkLmFqYXgoe1xuICAgICAgICAgICAgICB1cmw6ICcvYXBpL21hcHNlYXJjaC8nLFxuICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgdGVybTogcmVxLnRlcm1cbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24oYW5zd2VyKSB7XG4gICAgICAgICAgICAgICAgdmFyIGluZm8sIG5pY2UsIHNlbGVjdGFibGU7XG4gICAgICAgICAgICAgICAgc2VsZWN0YWJsZSA9IFtdO1xuICAgICAgICAgICAgICAgIGZvciAobmljZSBpbiBhbnN3ZXIpIHtcbiAgICAgICAgICAgICAgICAgIGluZm8gPSBhbnN3ZXJbbmljZV07XG4gICAgICAgICAgICAgICAgICBzZWxlY3RhYmxlLnB1c2gobmljZSk7XG4gICAgICAgICAgICAgICAgICBfdGhpcy5tYXBMaXN0W2luZm8ubWFwSWRdID0gaW5mbztcbiAgICAgICAgICAgICAgICAgIF90aGlzLm5hbWVJbmRleFtuaWNlXSA9IGluZm8ubWFwSWQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGFuc3dlcik7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coc2VsZWN0YWJsZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlKHNlbGVjdGFibGUpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9O1xuICAgICAgICB9KSh0aGlzKVxuICAgICAgfSk7XG4gICAgfSxcbiAgICBzdGFydFNwbGl0dGVyVHJhY2tpbmc6IGZ1bmN0aW9uKCkge1xuICAgICAgZGVidWcoJ0FwcFZpZXcuc3RhcnRTcGxpdHRlclRyYWNraW5nJyk7XG4gICAgICB0aGlzLnRyYWNrU3BsaXR0ZXIgPSB0cnVlO1xuICAgICAgdGhpcy5zcGxpdExpbmUuYWRkQ2xhc3MoJ2RyYWdnaW5nJyk7XG4gICAgICByZXR1cm4gdGhpcy5sb2NhdGVTcGxpdHRlcigpO1xuICAgIH0sXG4gICAgbG9jYXRlU3BsaXR0ZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgZGVidWcoJ0FwcFZpZXcubG9jYXRlU3BsaXR0ZXInKTtcbiAgICAgIGlmICh0aGlzLnRyYWNrU3BsaXR0ZXIpIHtcbiAgICAgICAgdGhpcy5yZXNpemVUaGluZ3MoKTtcbiAgICAgICAgaWYgKHRoaXMudHJhY2tTcGxpdHRlciA9PT0gMCkge1xuICAgICAgICAgIHRoaXMudHJhY2tTcGxpdHRlciA9IGZhbHNlO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMudHJhY2tTcGxpdHRlciAhPT0gdHJ1ZSkge1xuICAgICAgICAgIHRoaXMudHJhY2tTcGxpdHRlciAtPSAxO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KHRoaXMubG9jYXRlU3BsaXR0ZXIsIHRoaXMudHJhY2tQZXJpb2QpO1xuICAgICAgfVxuICAgIH0sXG4gICAgcmVzaXplVGhpbmdzOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciAkbWFwQm94LCBib3R0b21SaWdodCwgbGF5ZXJCb3R0b20sIGxheWVyVG9wLCBsZWZ0TGVmdCwgbGVmdE1hcCwgbWFwQm91bmRzLCBtYXBCb3gsIG5ld0xlZnRXaWR0aCwgcmlnaHRNYXAsIHJpZ2h0UmlnaHQsIHNwbGl0UG9pbnQsIHNwbGl0WCwgdG9wTGVmdDtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LnJlc2l6ZVRoaW5ncycpO1xuICAgICAgaWYgKHRoaXMubGVmdExheWVyKSB7XG4gICAgICAgIGxlZnRNYXAgPSAkKHRoaXMubGVmdExheWVyLmdldENvbnRhaW5lcigpKTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLnJpZ2h0TGF5ZXIpIHtcbiAgICAgICAgcmlnaHRNYXAgPSAkKHRoaXMucmlnaHRMYXllci5nZXRDb250YWluZXIoKSk7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy4kZWwuaGFzQ2xhc3MoJ3NwbGl0JykpIHtcbiAgICAgICAgbmV3TGVmdFdpZHRoID0gdGhpcy5zcGxpdFRodW1iLnBvc2l0aW9uKCkubGVmdCArICh0aGlzLnNwbGl0VGh1bWIud2lkdGgoKSAvIDIuMCk7XG4gICAgICAgIG1hcEJveCA9IHRoaXMubWFwLmdldENvbnRhaW5lcigpO1xuICAgICAgICAkbWFwQm94ID0gJChtYXBCb3gpO1xuICAgICAgICBtYXBCb3VuZHMgPSBtYXBCb3guZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIHRvcExlZnQgPSB0aGlzLm1hcC5jb250YWluZXJQb2ludFRvTGF5ZXJQb2ludChbMCwgMF0pO1xuICAgICAgICBzcGxpdFBvaW50ID0gdGhpcy5tYXAuY29udGFpbmVyUG9pbnRUb0xheWVyUG9pbnQoW25ld0xlZnRXaWR0aCwgMF0pO1xuICAgICAgICBib3R0b21SaWdodCA9IHRoaXMubWFwLmNvbnRhaW5lclBvaW50VG9MYXllclBvaW50KFskbWFwQm94LndpZHRoKCksICRtYXBCb3guaGVpZ2h0KCldKTtcbiAgICAgICAgbGF5ZXJUb3AgPSB0b3BMZWZ0Lnk7XG4gICAgICAgIGxheWVyQm90dG9tID0gYm90dG9tUmlnaHQueTtcbiAgICAgICAgc3BsaXRYID0gc3BsaXRQb2ludC54IC0gbWFwQm91bmRzLmxlZnQ7XG4gICAgICAgIGxlZnRMZWZ0ID0gdG9wTGVmdC54IC0gbWFwQm91bmRzLmxlZnQ7XG4gICAgICAgIHJpZ2h0UmlnaHQgPSBib3R0b21SaWdodC54O1xuICAgICAgICB0aGlzLnNwbGl0TGluZS5jc3MoJ2xlZnQnLCBuZXdMZWZ0V2lkdGgpO1xuICAgICAgICB0aGlzLmxlZnRUYWcuYXR0cignc3R5bGUnLCBcImNsaXA6IHJlY3QoMCwgXCIgKyBuZXdMZWZ0V2lkdGggKyBcInB4LCBhdXRvLCAwKVwiKTtcbiAgICAgICAgaWYgKHRoaXMubGVmdExheWVyKSB7XG4gICAgICAgICAgbGVmdE1hcC5hdHRyKCdzdHlsZScsIFwiY2xpcDogcmVjdChcIiArIGxheWVyVG9wICsgXCJweCwgXCIgKyBzcGxpdFggKyBcInB4LCBcIiArIGxheWVyQm90dG9tICsgXCJweCwgXCIgKyBsZWZ0TGVmdCArIFwicHgpXCIpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnJpZ2h0TGF5ZXIpIHtcbiAgICAgICAgICByZXR1cm4gcmlnaHRNYXAuYXR0cignc3R5bGUnLCBcImNsaXA6IHJlY3QoXCIgKyBsYXllclRvcCArIFwicHgsIFwiICsgcmlnaHRSaWdodCArIFwicHgsIFwiICsgbGF5ZXJCb3R0b20gKyBcInB4LCBcIiArIHNwbGl0WCArIFwicHgpXCIpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmxlZnRUYWcuYXR0cignc3R5bGUnLCAnY2xpcDogaW5oZXJpdCcpO1xuICAgICAgICBpZiAodGhpcy5sZWZ0TGF5ZXIpIHtcbiAgICAgICAgICBsZWZ0TWFwLmF0dHIoJ3N0eWxlJywgJ2NsaXA6IGluaGVyaXQnKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5yaWdodExheWVyKSB7XG4gICAgICAgICAgcmV0dXJuIHJpZ2h0TWFwLmF0dHIoJ3N0eWxlJywgJ2NsaXA6IHJlY3QoMCwwLDAsMCknKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgc3RvcFNwbGl0dGVyVHJhY2tpbmc6IGZ1bmN0aW9uKCkge1xuICAgICAgZGVidWcoJ0FwcFZpZXcuc3RvcFNwbGl0dGVyVHJhY2tpbmcnKTtcbiAgICAgIHRoaXMuc3BsaXRMaW5lLnJlbW92ZUNsYXNzKCdkcmFnZ2luZycpO1xuICAgICAgcmV0dXJuIHRoaXMudHJhY2tTcGxpdHRlciA9IDU7XG4gICAgfSxcbiAgICBhY3RpdmF0ZVNwbGl0dGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LmFjdGl2YXRlU3BsaXR0ZXInKTtcbiAgICAgIHRoaXMuc3BsaXRUaHVtYi5kcmFnZ2FibGUoe1xuICAgICAgICBjb250YWlubWVudDogJCgnI21hcHdyYXBwZXInKSxcbiAgICAgICAgc2Nyb2xsOiBmYWxzZSxcbiAgICAgICAgc3RhcnQ6IHRoaXMuc3RhcnRTcGxpdHRlclRyYWNraW5nLFxuICAgICAgICBkcmFnOiB0aGlzLnJlc2l6ZVRoaW5ncyxcbiAgICAgICAgc3RvcDogdGhpcy5zdG9wU3BsaXR0ZXJUcmFja2luZ1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gdGhpcy5yZXNpemVUaGluZ3MoKTtcbiAgICB9LFxuICAgIGRlYWN0aXZhdGVTcGxpdHRlcjogZnVuY3Rpb24oKSB7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5kZWFjdGl2YXRlU3BsaXR0ZXInKTtcbiAgICAgIHRoaXMuc3BsaXRUaHVtYi5kcmFnZ2FibGUoJ2Rlc3Ryb3knKTtcbiAgICAgIHJldHVybiB0aGlzLnJlc2l6ZVRoaW5ncygpO1xuICAgIH1cbiAgfSwge1xuICAgIHRlbXBsYXRlczoge1xuICAgICAgbGF5b3V0OiBfLnRlbXBsYXRlKFwiPGRpdiBjbGFzPVxcXCJ1aS1mcm9udFxcXCI+PC9kaXY+XFxuPGRpdiBjbGFzcz1cXFwic3BsaXRsaW5lXFxcIj4mbmJzcDs8L2Rpdj5cXG48ZGl2IGNsYXNzPVxcXCJzcGxpdHRodW1iXFxcIj48c3Bhbj4mI3gyNzZlOyAmI3gyNzZmOzwvc3Bhbj48L2Rpdj5cXG48ZGl2IGNsYXNzPVxcXCJsZWZ0IHRhZ1xcXCI+PCU9IGxlZnRUYWcgJT48L2Rpdj5cXG48ZGl2IGNsYXNzPVxcXCJyaWdodCB0YWdcXFwiPjwlPSByaWdodFRhZyAlPjwvZGl2PlxcbjxkaXYgY2xhc3M9XFxcImxlZnQgc2lkZSBmb3JtXFxcIj48JT0gbGVmdEZvcm0gJT48L2Rpdj5cXG48ZGl2IGNsYXNzPVxcXCJyaWdodCBzaWRlIGZvcm1cXFwiPjwlPSByaWdodEZvcm0gJT48L2Rpdj5cXG48ZGl2IGNsYXNzPVxcXCJsZWZ0IGxvYWRlclxcXCI+PGltZyBzcmM9XFxcIi9zdGF0aWMvaW1hZ2VzL3NwaW5uZXIubG9hZGluZm8ubmV0LmdpZlxcXCIgLz48L2Rpdj5cXG48ZGl2IGNsYXNzPVxcXCJyaWdodCBsb2FkZXJcXFwiPjxpbWcgc3JjPVxcXCIvc3RhdGljL2ltYWdlcy9zcGlubmVyLmxvYWRpbmZvLm5ldC5naWZcXFwiIC8+PC9kaXY+XFxuPGRpdiBpZD1cXFwibWFwd3JhcHBlclxcXCI+PGRpdiBpZD1cXFwibWFwXFxcIj48L2Rpdj48L2Rpdj5cIiksXG4gICAgICBsZWZ0VGFnOiBfLnRlbXBsYXRlKFwiPGRpdiBjbGFzcz1cXFwic2hvd1xcXCI+XFxuICAgIDxzcGFuIGNsYXNzPVxcXCJsZWZ0bGF5ZXJuYW1lXFxcIj5wbGFpbiBtYXA8L3NwYW4+XFxuICAgIDxicj5cXG4gICAgPGJ1dHRvbiBjbGFzcz1cXFwiYnRuLWNoYW5nZVxcXCI+c2V0dGluZ3M8L2J1dHRvbj5cXG4gICAgPGJ1dHRvbiBjbGFzcz1cXFwiYnRuLWNvbXBhcmVcXFwiPnNob3cvaGlkZSBjb21wYXJpc29uIG1hcDwvYnV0dG9uPlxcbjwvZGl2PlxcbjxkaXYgY2xhc3M9XFxcImVkaXRcXFwiPlxcbiAgICA8bGFiZWwgY2xhc3M9XFxcImxlZnQgc3luY2JveFxcXCI+PC9sYWJlbD5cXG4gICAgPGlucHV0IGlkPVxcXCJsZWZ0bWFwc3BwXFxcIiBjbGFzcz1cXFwibGVmdFxcXCIgdHlwZT1cXFwidGV4dFxcXCIgbmFtZT1cXFwibGVmdG1hcHNwcFxcXCIgcGxhY2Vob2xkZXI9XFxcIiZoZWxsaXA7IHNwZWNpZXMgb3IgZ3JvdXAgJmhlbGxpcDtcXFwiIC8+XFxuPC9kaXY+XCIpLFxuICAgICAgcmlnaHRUYWc6IF8udGVtcGxhdGUoXCI8ZGl2IGNsYXNzPVxcXCJzaG93XFxcIj5cXG4gICAgPHNwYW4gY2xhc3M9XFxcInJpZ2h0bGF5ZXJuYW1lXFxcIj4obm8gZGlzdHJpYnV0aW9uKTwvc3Bhbj5cXG4gICAgPGJyPlxcbiAgICA8YnV0dG9uIGNsYXNzPVxcXCJidG4tY2hhbmdlXFxcIj5zZXR0aW5nczwvYnV0dG9uPlxcbiAgICA8YnV0dG9uIGNsYXNzPVxcXCJidG4tY29tcGFyZVxcXCI+c2hvdy9oaWRlIGNvbXBhcmlzb24gbWFwPC9idXR0b24+XFxuPC9kaXY+XFxuPGRpdiBjbGFzcz1cXFwiZWRpdFxcXCI+XFxuICAgIDxsYWJlbCBjbGFzcz1cXFwicmlnaHQgc3luY2JveFxcXCI+PGlucHV0IGlkPVxcXCJzeW5jXFxcIiB0eXBlPVxcXCJjaGVja2JveFxcXCIgdmFsdWU9XFxcInN5bmNcXFwiIGNoZWNrZWQ9XFxcImNoZWNrZWRcXFwiIC8+IHNhbWUgYXMgbGVmdCBzaWRlPC9sYWJlbD5cXG4gICAgPGlucHV0IGlkPVxcXCJyaWdodG1hcHNwcFxcXCIgdHlwZT1cXFwidGV4dFxcXCIgY2xhc3M9XFxcInJpZ2h0XFxcIiBuYW1lPVxcXCJyaWdodG1hcHNwcFxcXCIgcGxhY2Vob2xkZXI9XFxcIiZoZWxsaXA7IHNwZWNpZXMgb3IgZ3JvdXAgJmhlbGxpcDtcXFwiIC8+XFxuPC9kaXY+XCIpLFxuICAgICAgbGVmdEZvcm06IF8udGVtcGxhdGUoXCI8ZmllbGRzZXQ+XFxuICAgIDxsZWdlbmQ+dGVtcGVyYXR1cmUgY2hhbmdlPC9sZWdlbmQ+XFxuICAgIDxzZWxlY3QgY2xhc3M9XFxcImxlZnRcXFwiIGlkPVxcXCJsZWZ0bWFwZGVnc1xcXCI+XFxuICAgICAgICA8b3B0aW9uIHZhbHVlPVxcXCJiYXNlbGluZVxcXCI+YmFzZWxpbmU8L29wdGlvbj5cXG4gICAgICAgIDxvcHRpb24gdmFsdWU9XFxcIjEuNVxcXCI+MS41ICZkZWc7Qzwvb3B0aW9uPlxcbiAgICAgICAgPG9wdGlvbiB2YWx1ZT1cXFwiMlxcXCI+Mi4wICZkZWc7Qzwvb3B0aW9uPlxcbiAgICAgICAgPG9wdGlvbiB2YWx1ZT1cXFwiMi43XFxcIj4yLjcgJmRlZztDPC9vcHRpb24+XFxuICAgICAgICA8b3B0aW9uIHZhbHVlPVxcXCIzLjJcXFwiPjMuMiAmZGVnO0M8L29wdGlvbj5cXG4gICAgICAgIDxvcHRpb24gdmFsdWU9XFxcIjQuNVxcXCI+NC41ICZkZWc7Qzwvb3B0aW9uPlxcbiAgICAgICAgPG9wdGdyb3VwIGxhYmVsPVxcXCJIaWdoIHNlbnNpdGl2aXR5IGNsaW1hdGVcXFwiPlxcbiAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XFxcIjZcXFwiPjYuMCAmZGVnO0M8L29wdGlvbj5cXG4gICAgICAgIDwvb3B0Z3JvdXA+XFxuICAgIDwvc2VsZWN0PlxcbjwvZmllbGRzZXQ+XFxuPGZpZWxkc2V0PlxcbiAgICA8bGVnZW5kPmFkYXB0YXRpb24gdmlhIHJhbmdlIHNoaWZ0PC9sZWdlbmQ+XFxuICAgIDxsYWJlbD48IS0tIHNwYW4+bm9uZTwvc3BhbiAtLT4gPGlucHV0IG5hbWU9XFxcImxlZnRtYXByYW5nZVxcXCIgY2xhc3M9XFxcImxlZnRcXFwiIHR5cGU9XFxcInJhZGlvXFxcIiB2YWx1ZT1cXFwibm8uZGlzcFxcXCIgY2hlY2tlZD1cXFwiY2hlY2tlZFxcXCI+IHNwZWNpZXMgY2Fubm90IHNoaWZ0IHJhbmdlczwvbGFiZWw+XFxuICAgIDxsYWJlbD48IS0tIHNwYW4+YWxsb3c8L3NwYW4gLS0+IDxpbnB1dCBuYW1lPVxcXCJsZWZ0bWFwcmFuZ2VcXFwiIGNsYXNzPVxcXCJsZWZ0XFxcIiB0eXBlPVxcXCJyYWRpb1xcXCIgdmFsdWU9XFxcInJlYWwuZGlzcFxcXCI+IGFsbG93IHJhbmdlIGFkYXB0YXRpb248L2xhYmVsPlxcbjwvZmllbGRzZXQ+XFxuPGZpZWxkc2V0PlxcbiAgICA8bGVnZW5kPm1vZGVsIHN1bW1hcnk8L2xlZ2VuZD5cXG4gICAgPHNlbGVjdCBjbGFzcz1cXFwibGVmdFxcXCIgaWQ9XFxcImxlZnRtYXBjb25maWRlbmNlXFxcIj5cXG4gICAgICAgIDxvcHRpb24gdmFsdWU9XFxcIjEwXFxcIj4xMHRoIHBlcmNlbnRpbGU8L29wdGlvbj5cXG4gICAgICAgIDwhLS0gb3B0aW9uIHZhbHVlPVxcXCIzM1xcXCI+MzNyZCBwZXJjZW50aWxlPC9vcHRpb24gLS0+XFxuICAgICAgICA8b3B0aW9uIHZhbHVlPVxcXCI1MFxcXCIgc2VsZWN0ZWQ9XFxcInNlbGVjdGVkXFxcIj41MHRoIHBlcmNlbnRpbGU8L29wdGlvbj5cXG4gICAgICAgIDwhLS0gb3B0aW9uIHZhbHVlPVxcXCI2NlxcXCI+NjZ0aCBwZXJjZW50aWxlPC9vcHRpb24gLS0+XFxuICAgICAgICA8b3B0aW9uIHZhbHVlPVxcXCI5MFxcXCI+OTB0aCBwZXJjZW50aWxlPC9vcHRpb24+XFxuICAgIDwvc2VsZWN0PlxcbjwvZmllbGRzZXQ+XFxuPGZpZWxkc2V0IGNsYXNzPVxcXCJibGFua1xcXCI+XFxuICAgIDxidXR0b24gdHlwZT1cXFwiYnV0dG9uXFxcIiBjbGFzcz1cXFwiYnRuLWNoYW5nZVxcXCI+aGlkZSBzZXR0aW5nczwvYnV0dG9uPlxcbiAgICA8YnV0dG9uIHR5cGU9XFxcImJ1dHRvblxcXCIgY2xhc3M9XFxcImJ0bi1jb21wYXJlXFxcIj5oaWRlL3Nob3cgcmlnaHQgbWFwPC9idXR0b24+XFxuICAgIDxidXR0b24gdHlwZT1cXFwiYnV0dG9uXFxcIiBjbGFzcz1cXFwiYnRuLWNvcHkgcmlnaHQtdmFsaWQtbWFwXFxcIj5jb3B5IHJpZ2h0IG1hcCAmbGFxdW87PC9idXR0b24+XFxuICAgIDxhIGlkPVxcXCJsZWZ0bWFwZGxcXFwiIGNsYXNzPVxcXCJkb3dubG9hZCBsZWZ0LXZhbGlkLW1hcFxcXCIgaHJlZj1cXFwiXFxcIiBkaXNhYmxlZD1cXFwiZGlzYWJsZWRcXFwiPmRvd25sb2FkIGp1c3QgdGhpcyBtYXA8YnI+KDwxTWIgR2VvVElGRik8L2E+XFxuPC9maWVsZHNldD5cXG5cIiksXG4gICAgICByaWdodEZvcm06IF8udGVtcGxhdGUoXCI8ZmllbGRzZXQ+XFxuICAgIDxsZWdlbmQ+dGVtcGVyYXR1cmUgY2hhbmdlPC9sZWdlbmQ+XFxuICAgIDxzZWxlY3QgY2xhc3M9XFxcInJpZ2h0XFxcIiBpZD1cXFwicmlnaHRtYXBkZWdzXFxcIj5cXG4gICAgICAgIDxvcHRpb24gdmFsdWU9XFxcImJhc2VsaW5lXFxcIj5iYXNlbGluZTwvb3B0aW9uPlxcbiAgICAgICAgPG9wdGlvbiB2YWx1ZT1cXFwiMS41XFxcIj4xLjUgJmRlZztDPC9vcHRpb24+XFxuICAgICAgICA8b3B0aW9uIHZhbHVlPVxcXCIyXFxcIj4yLjAgJmRlZztDPC9vcHRpb24+XFxuICAgICAgICA8b3B0aW9uIHZhbHVlPVxcXCIyLjdcXFwiPjIuNyAmZGVnO0M8L29wdGlvbj5cXG4gICAgICAgIDxvcHRpb24gdmFsdWU9XFxcIjMuMlxcXCI+My4yICZkZWc7Qzwvb3B0aW9uPlxcbiAgICAgICAgPG9wdGlvbiB2YWx1ZT1cXFwiNC41XFxcIj40LjUgJmRlZztDPC9vcHRpb24+XFxuICAgICAgICA8b3B0Z3JvdXAgbGFiZWw9XFxcIkhpZ2ggc2Vuc2l0aXZpdHkgY2xpbWF0ZVxcXCI+XFxuICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cXFwiNlxcXCI+Ni4wICZkZWc7Qzwvb3B0aW9uPlxcbiAgICAgICAgPC9vcHRncm91cD5cXG4gICAgPC9zZWxlY3Q+XFxuPC9maWVsZHNldD5cXG48ZmllbGRzZXQ+XFxuICAgIDxsZWdlbmQ+YWRhcHRhdGlvbiB2aWEgcmFuZ2Ugc2hpZnQ8L2xlZ2VuZD5cXG4gICAgPGxhYmVsPjwhLS0gc3Bhbj5ub25lPC9zcGFuIC0tPiA8aW5wdXQgbmFtZT1cXFwicmlnaHRtYXByYW5nZVxcXCIgY2xhc3M9XFxcInJpZ2h0XFxcIiB0eXBlPVxcXCJyYWRpb1xcXCIgdmFsdWU9XFxcIm5vLmRpc3BcXFwiIGNoZWNrZWQ9XFxcImNoZWNrZWRcXFwiPiBzcGVjaWVzIGNhbm5vdCBzaGlmdCByYW5nZXM8L2xhYmVsPlxcbiAgICA8bGFiZWw+PCEtLSBzcGFuPmFsbG93PC9zcGFuIC0tPiA8aW5wdXQgbmFtZT1cXFwicmlnaHRtYXByYW5nZVxcXCIgY2xhc3M9XFxcInJpZ2h0XFxcIiB0eXBlPVxcXCJyYWRpb1xcXCIgdmFsdWU9XFxcInJlYWwuZGlzcFxcXCI+IGFsbG93IHJhbmdlIGFkYXB0YXRpb248L2xhYmVsPlxcbjwvZmllbGRzZXQ+XFxuPGZpZWxkc2V0PlxcbiAgICA8bGVnZW5kPm1vZGVsIHN1bW1hcnk8L2xlZ2VuZD5cXG4gICAgPHNlbGVjdCBjbGFzcz1cXFwicmlnaHRcXFwiIGlkPVxcXCJyaWdodG1hcGNvbmZpZGVuY2VcXFwiPlxcbiAgICAgICAgPG9wdGlvbiB2YWx1ZT1cXFwiMTBcXFwiPjEwdGggcGVyY2VudGlsZTwvb3B0aW9uPlxcbiAgICAgICAgPCEtLSBvcHRpb24gdmFsdWU9XFxcIjMzXFxcIj4zM3JkIHBlcmNlbnRpbGU8L29wdGlvbiAtLT5cXG4gICAgICAgIDxvcHRpb24gdmFsdWU9XFxcIjUwXFxcIiBzZWxlY3RlZD1cXFwic2VsZWN0ZWRcXFwiPjUwdGggcGVyY2VudGlsZTwvb3B0aW9uPlxcbiAgICAgICAgPCEtLSBvcHRpb24gdmFsdWU9XFxcIjY2XFxcIj42NnRoIHBlcmNlbnRpbGU8L29wdGlvbiAtLT5cXG4gICAgICAgIDxvcHRpb24gdmFsdWU9XFxcIjkwXFxcIj45MHRoIHBlcmNlbnRpbGU8L29wdGlvbj5cXG4gICAgPC9zZWxlY3Q+XFxuPC9maWVsZHNldD5cXG48ZmllbGRzZXQgY2xhc3M9XFxcImJsYW5rXFxcIj5cXG4gICAgPGJ1dHRvbiB0eXBlPVxcXCJidXR0b25cXFwiIGNsYXNzPVxcXCJidG4tY2hhbmdlXFxcIj5oaWRlIHNldHRpbmdzPC9idXR0b24+XFxuICAgIDxidXR0b24gdHlwZT1cXFwiYnV0dG9uXFxcIiBjbGFzcz1cXFwiYnRuLWNvbXBhcmVcXFwiPmhpZGUvc2hvdyByaWdodCBtYXA8L2J1dHRvbj5cXG4gICAgPGJ1dHRvbiB0eXBlPVxcXCJidXR0b25cXFwiIGNsYXNzPVxcXCJidG4tY29weSBsZWZ0LXZhbGlkLW1hcFxcXCI+Y29weSBsZWZ0IG1hcCAmbGFxdW87PC9idXR0b24+XFxuICAgIDxhIGlkPVxcXCJyaWdodG1hcGRsXFxcIiBjbGFzcz1cXFwiZG93bmxvYWQgcmlnaHQtdmFsaWQtbWFwXFxcIiBocmVmPVxcXCJcXFwiIGRpc2FibGVkPVxcXCJkaXNhYmxlZFxcXCI+ZG93bmxvYWQganVzdCB0aGlzIG1hcDxicj4oPDFNYiBHZW9USUZGKTwvYT5cXG48L2ZpZWxkc2V0PlxcblwiKVxuICAgIH1cbiAgfSk7XG5cbiAgbW9kdWxlLmV4cG9ydHMgPSBBcHBWaWV3O1xuXG59KS5jYWxsKHRoaXMpO1xuIl19
