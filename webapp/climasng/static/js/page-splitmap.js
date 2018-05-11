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
      this.legend = L.control({
        uri: ''
      });
      this.legend.onAdd = (function(_this) {
        return function(map) {
          return _this._div = L.DomUtil.create('div', 'info');
        };
      })(this);
      this.legend.update = (function(_this) {
        return function(props) {
          return _this._div.innerHTML = '<object type="image/svg+xml" data="' + (props ? props.uri : '.') + '" />';
        };
      })(this);
      this.legend.addTo(this.map);
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
        tag = "<b>" + info.confidence + "th</b> percentile projections for " + tag + " at <b>+" + info.degs + "&deg;C</b> with <b>" + dispLookup[info.range] + "</b>";
      }
      if (side === 'left') {
        this.leftTag.find('.leftlayername').html(tag);
      }
      if (side === 'right') {
        return this.rightTag.find('.rightlayername').html(tag);
      }
    },
    addMapLayer: function(side) {
      var ext, futureModelPoint, isConcern, isRefugia, isRichness, mapInfo, mapUrl, projectionName, sideInfo, style, url, zipUrl;
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
        style = 'taxa-richness-change';
        projectionName = "prop.richness_" + sideInfo.degs + "_" + sideInfo.range + "_" + sideInfo.confidence;
        if (sideInfo.degs === 'baseline') {
          projectionName = 'current.richness';
          style = 'taxa-richness';
        }
      } else if (isRefugia) {
        style = 'taxa-refugia';
        projectionName = "refuge.certainty_" + sideInfo.degs + "_" + sideInfo.range;
        if (sideInfo.degs === 'baseline') {
          projectionName = 'current.richness';
        }
      } else if (isConcern) {
        style = 'taxa-aoc';
        projectionName = "AreaOfConcern.certainty_" + sideInfo.degs + "_" + sideInfo.range;
        if (sideInfo.degs === 'baseline') {
          projectionName = 'current.richness';
        }
      } else {
        style = 'spp-suitability-purple';
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
            styles: style,
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
          _this.legend.update({
            uri: '/static/images/legends/' + style + '.sld.svg'
          });
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
        delay: 200,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9wdnJkd2IvcHJvamVjdHMvY2xpbWFzLWdsb2JhbC93ZWJhcHAvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi9Vc2Vycy9wdnJkd2IvcHJvamVjdHMvY2xpbWFzLWdsb2JhbC93ZWJhcHAvY2xpbWFzbmcvc3JjL2pzL2Zha2VfNzMzNjllNzguanMiLCIvVXNlcnMvcHZyZHdiL3Byb2plY3RzL2NsaW1hcy1nbG9iYWwvd2ViYXBwL2NsaW1hc25nL3NyYy9qcy9tYXB2aWV3L21haW4uanMiLCIvVXNlcnMvcHZyZHdiL3Byb2plY3RzL2NsaW1hcy1nbG9iYWwvd2ViYXBwL2NsaW1hc25nL3NyYy9qcy9tYXB2aWV3L21vZGVscy9tYXBsYXllci5qcyIsIi9Vc2Vycy9wdnJkd2IvcHJvamVjdHMvY2xpbWFzLWdsb2JhbC93ZWJhcHAvY2xpbWFzbmcvc3JjL2pzL21hcHZpZXcvdXRpbC9zaGltcy5qcyIsIi9Vc2Vycy9wdnJkd2IvcHJvamVjdHMvY2xpbWFzLWdsb2JhbC93ZWJhcHAvY2xpbWFzbmcvc3JjL2pzL21hcHZpZXcvdmlld3MvYXBwLmpzIiwiL1VzZXJzL3B2cmR3Yi9wcm9qZWN0cy9jbGltYXMtZ2xvYmFsL3dlYmFwcC9jbGltYXNuZy9zcmMvanMvbWVudXNhbmRwYW5lbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1ZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXG5yZXF1aXJlKCcuL21hcHZpZXcvbWFpbicpO1xucmVxdWlyZSgnLi9tZW51c2FuZHBhbmVscycpO1xuXG4kKGZ1bmN0aW9uKCkge1xuICAgIC8vICQoJ2hlYWRlcicpLmRpc2FibGVTZWxlY3Rpb24oKTsgLy8gdW5wb3B1bGFyIGJ1dCBzdGlsbCBiZXR0ZXJcbiAgICAkKCduYXYgPiB1bCcpLm1zcHAoe30pO1xufSk7XG4iLCIoZnVuY3Rpb24oKSB7XG4gIHZhciBBcHBWaWV3O1xuXG4gIGlmICghd2luZG93LmNvbnNvbGUpIHtcbiAgICB3aW5kb3cuY29uc29sZSA9IHtcbiAgICAgIGxvZzogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB7fTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgQXBwVmlldyA9IHJlcXVpcmUoJy4vdmlld3MvYXBwJyk7XG5cbiAgJChmdW5jdGlvbigpIHtcbiAgICB2YXIgYXBwdmlldztcbiAgICBhcHB2aWV3ID0gbmV3IEFwcFZpZXcoKTtcbiAgICByZXR1cm4gYXBwdmlldy5yZW5kZXIoKTtcbiAgfSk7XG5cbn0pLmNhbGwodGhpcyk7XG4iLCIoZnVuY3Rpb24oKSB7XG4gIHZhciBNYXBMYXllcjtcblxuICBNYXBMYXllciA9IEJhY2tib25lLk1vZGVsLmV4dGVuZCh7XG4gICAgY29uc3RydWN0b3I6IGZ1bmN0aW9uKHNob3J0TmFtZSwgbG9uZ05hbWUsIHBhdGgpIHtcbiAgICAgIHRoaXMuc2hvcnROYW1lID0gc2hvcnROYW1lO1xuICAgICAgdGhpcy5sb25nTmFtZSA9IGxvbmdOYW1lO1xuICAgICAgdGhpcy5wYXRoID0gcGF0aDtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfSk7XG5cbiAgbW9kdWxlLmV4cG9ydHMgPSBNYXBMYXllcjtcblxufSkuY2FsbCh0aGlzKTtcbiIsIihmdW5jdGlvbigpIHtcbiAgdmFyIF9faW5kZXhPZiA9IFtdLmluZGV4T2YgfHwgZnVuY3Rpb24oaXRlbSkgeyBmb3IgKHZhciBpID0gMCwgbCA9IHRoaXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7IGlmIChpIGluIHRoaXMgJiYgdGhpc1tpXSA9PT0gaXRlbSkgcmV0dXJuIGk7IH0gcmV0dXJuIC0xOyB9O1xuXG4gIGlmICghQXJyYXkucHJvdG90eXBlLmZvckVhY2gpIHtcbiAgICBBcnJheS5wcm90b3R5cGUuZm9yRWFjaCA9IGZ1bmN0aW9uKGZuLCBzY29wZSkge1xuICAgICAgdmFyIGksIF9pLCBfcmVmLCBfcmVzdWx0cztcbiAgICAgIF9yZXN1bHRzID0gW107XG4gICAgICBmb3IgKGkgPSBfaSA9IDAsIF9yZWYgPSB0aGlzLmxlbmd0aDsgMCA8PSBfcmVmID8gX2kgPD0gX3JlZiA6IF9pID49IF9yZWY7IGkgPSAwIDw9IF9yZWYgPyArK19pIDogLS1faSkge1xuICAgICAgICBfcmVzdWx0cy5wdXNoKF9faW5kZXhPZi5jYWxsKHRoaXMsIGkpID49IDAgPyBmbi5jYWxsKHNjb3BlLCB0aGlzW2ldLCBpLCB0aGlzKSA6IHZvaWQgMCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gX3Jlc3VsdHM7XG4gICAgfTtcbiAgfVxuXG4gIGlmICghQXJyYXkucHJvdG90eXBlLmluZGV4T2YpIHtcbiAgICBBcnJheS5wcm90b3R5cGUuaW5kZXhPZiA9IGZ1bmN0aW9uKG5lZWRsZSkge1xuICAgICAgdmFyIGksIF9pLCBfcmVmO1xuICAgICAgZm9yIChpID0gX2kgPSAwLCBfcmVmID0gdGhpcy5sZW5ndGg7IDAgPD0gX3JlZiA/IF9pIDw9IF9yZWYgOiBfaSA+PSBfcmVmOyBpID0gMCA8PSBfcmVmID8gKytfaSA6IC0tX2kpIHtcbiAgICAgICAgaWYgKHRoaXNbaV0gPT09IG5lZWRsZSkge1xuICAgICAgICAgIHJldHVybiBpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gLTE7XG4gICAgfTtcbiAgfVxuXG4gIGlmICghU3RyaW5nLnByb3RvdHlwZS5zdGFydHNXaXRoKSB7XG4gICAgU3RyaW5nLnByb3RvdHlwZS5zdGFydHNXaXRoID0gZnVuY3Rpb24oc2VhcmNoU3RyLCBwb3MpIHtcbiAgICAgIHJldHVybiB0aGlzLnN1YnN0cihwb3MgfHwgMCwgc2VhcmNoU3RyLmxlbmd0aCkgPT09IHNlYXJjaFN0cjtcbiAgICB9O1xuICB9XG5cbn0pLmNhbGwodGhpcyk7XG4iLCIoZnVuY3Rpb24oKSB7XG4gIHZhciBBcHBWaWV3LCBNYXBMYXllciwgZGVidWc7XG5cbiAgTWFwTGF5ZXIgPSByZXF1aXJlKCcuLi9tb2RlbHMvbWFwbGF5ZXInKTtcblxuICByZXF1aXJlKCcuLi91dGlsL3NoaW1zJyk7XG5cblxuICAvKiBqc2hpbnQgLVcwOTMgKi9cblxuICBkZWJ1ZyA9IGZ1bmN0aW9uKGl0ZW1Ub0xvZywgaXRlbUxldmVsKSB7XG4gICAgdmFyIGxldmVscywgbWVzc2FnZU51bSwgdGhyZXNob2xkLCB0aHJlc2hvbGROdW07XG4gICAgbGV2ZWxzID0gWyd2ZXJ5ZGVidWcnLCAnZGVidWcnLCAnbWVzc2FnZScsICd3YXJuaW5nJ107XG4gICAgaWYgKCFpdGVtTGV2ZWwpIHtcbiAgICAgIGl0ZW1MZXZlbCA9ICdkZWJ1Zyc7XG4gICAgfVxuICAgIHRocmVzaG9sZCA9ICdkZWJ1Zyc7XG4gICAgdGhyZXNob2xkTnVtID0gbGV2ZWxzLmluZGV4T2YodGhyZXNob2xkKTtcbiAgICBtZXNzYWdlTnVtID0gbGV2ZWxzLmluZGV4T2YoaXRlbUxldmVsKTtcbiAgICBpZiAodGhyZXNob2xkTnVtID4gbWVzc2FnZU51bSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoaXRlbVRvTG9nICsgJycgPT09IGl0ZW1Ub0xvZykge1xuICAgICAgcmV0dXJuIGNvbnNvbGUubG9nKFwiW1wiICsgaXRlbUxldmVsICsgXCJdIFwiICsgaXRlbVRvTG9nKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGNvbnNvbGUubG9nKGl0ZW1Ub0xvZyk7XG4gICAgfVxuICB9O1xuXG4gIEFwcFZpZXcgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XG4gICAgdGFnTmFtZTogJ2RpdicsXG4gICAgY2xhc3NOYW1lOiAnc3BsaXRtYXAgc2hvd2Zvcm1zJyxcbiAgICBpZDogJ3NwbGl0bWFwJyxcbiAgICBzcGVjaWVzRGF0YVVybDogd2luZG93Lm1hcENvbmZpZy5zcGVjaWVzRGF0YVVybCxcbiAgICBjbGltYXRlRGF0YVVybDogd2luZG93Lm1hcENvbmZpZy5jbGltYXRlRGF0YVVybCxcbiAgICBzdW1tYXJpZXNEYXRhVXJsOiB3aW5kb3cubWFwQ29uZmlnLnN1bW1hcmllc0RhdGFVcmwsXG4gICAgYmlvZGl2RGF0YVVybDogd2luZG93Lm1hcENvbmZpZy5iaW9kaXZEYXRhVXJsLFxuICAgIHJhc3RlckFwaVVybDogd2luZG93Lm1hcENvbmZpZy5yYXN0ZXJBcGlVcmwsXG4gICAgdHJhY2tTcGxpdHRlcjogZmFsc2UsXG4gICAgdHJhY2tQZXJpb2Q6IDEwMCxcbiAgICBldmVudHM6IHtcbiAgICAgICdjbGljayAuYnRuLWNoYW5nZSc6ICd0b2dnbGVGb3JtcycsXG4gICAgICAnY2xpY2sgLmJ0bi1jb21wYXJlJzogJ3RvZ2dsZVNwbGl0dGVyJyxcbiAgICAgICdjbGljayAuYnRuLWNvcHkubGVmdC12YWxpZC1tYXAnOiAnY29weU1hcExlZnRUb1JpZ2h0JyxcbiAgICAgICdjbGljayAuYnRuLWNvcHkucmlnaHQtdmFsaWQtbWFwJzogJ2NvcHlNYXBSaWdodFRvTGVmdCcsXG4gICAgICAnbGVmdG1hcHVwZGF0ZSc6ICdsZWZ0U2lkZVVwZGF0ZScsXG4gICAgICAncmlnaHRtYXB1cGRhdGUnOiAncmlnaHRTaWRlVXBkYXRlJyxcbiAgICAgICdjaGFuZ2Ugc2VsZWN0LmxlZnQnOiAnbGVmdFNpZGVVcGRhdGUnLFxuICAgICAgJ2NoYW5nZSBzZWxlY3QucmlnaHQnOiAncmlnaHRTaWRlVXBkYXRlJyxcbiAgICAgICdjaGFuZ2UgaW5wdXQubGVmdCc6ICdsZWZ0U2lkZVVwZGF0ZScsXG4gICAgICAnY2hhbmdlIGlucHV0LnJpZ2h0JzogJ3JpZ2h0U2lkZVVwZGF0ZScsXG4gICAgICAnY2hhbmdlICNzeW5jJzogJ3RvZ2dsZVN5bmMnXG4gICAgfSxcbiAgICB0aWNrOiBmdW5jdGlvbigpIHtcbiAgICAgIGlmIChmYWxzZSkge1xuICAgICAgICBkZWJ1Zyh0aGlzLmxlZnRJbmZvLnNjZW5hcmlvKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRlYnVnKCd0aWNrJyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gc2V0VGltZW91dCh0aGlzLnRpY2ssIDEwMDApO1xuICAgIH0sXG4gICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5pbml0aWFsaXplJyk7XG4gICAgICBfLmJpbmRBbGwuYXBwbHkoXywgW3RoaXNdLmNvbmNhdChfLmZ1bmN0aW9ucyh0aGlzKSkpO1xuICAgICAgdGhpcy5uYW1lSW5kZXggPSB7fTtcbiAgICAgIHJldHVybiB0aGlzLm1hcExpc3QgPSB7fTtcbiAgICB9LFxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5yZW5kZXInKTtcbiAgICAgIHRoaXMuJGVsLmFwcGVuZChBcHBWaWV3LnRlbXBsYXRlcy5sYXlvdXQoe1xuICAgICAgICBsZWZ0VGFnOiBBcHBWaWV3LnRlbXBsYXRlcy5sZWZ0VGFnKCksXG4gICAgICAgIHJpZ2h0VGFnOiBBcHBWaWV3LnRlbXBsYXRlcy5yaWdodFRhZygpLFxuICAgICAgICBsZWZ0Rm9ybTogQXBwVmlldy50ZW1wbGF0ZXMubGVmdEZvcm0oKSxcbiAgICAgICAgcmlnaHRGb3JtOiBBcHBWaWV3LnRlbXBsYXRlcy5yaWdodEZvcm0oKVxuICAgICAgfSkpO1xuICAgICAgJCgnI2NvbnRlbnR3cmFwJykuYXBwZW5kKHRoaXMuJGVsKTtcbiAgICAgIHRoaXMubWFwID0gTC5tYXAoJ21hcCcsIHtcbiAgICAgICAgY2VudGVyOiBbMCwgMF0sXG4gICAgICAgIHpvb206IDJcbiAgICAgIH0pO1xuICAgICAgdGhpcy5tYXAub24oJ21vdmUnLCB0aGlzLnJlc2l6ZVRoaW5ncyk7XG4gICAgICBMLmNvbnRyb2wuc2NhbGUoKS5hZGRUbyh0aGlzLm1hcCk7XG4gICAgICB0aGlzLmxlZ2VuZCA9IEwuY29udHJvbCh7XG4gICAgICAgIHVyaTogJydcbiAgICAgIH0pO1xuICAgICAgdGhpcy5sZWdlbmQub25BZGQgPSAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKG1hcCkge1xuICAgICAgICAgIHJldHVybiBfdGhpcy5fZGl2ID0gTC5Eb21VdGlsLmNyZWF0ZSgnZGl2JywgJ2luZm8nKTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpO1xuICAgICAgdGhpcy5sZWdlbmQudXBkYXRlID0gKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihwcm9wcykge1xuICAgICAgICAgIHJldHVybiBfdGhpcy5fZGl2LmlubmVySFRNTCA9ICc8b2JqZWN0IHR5cGU9XCJpbWFnZS9zdmcreG1sXCIgZGF0YT1cIicgKyAocHJvcHMgPyBwcm9wcy51cmkgOiAnLicpICsgJ1wiIC8+JztcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpO1xuICAgICAgdGhpcy5sZWdlbmQuYWRkVG8odGhpcy5tYXApO1xuICAgICAgTC50aWxlTGF5ZXIoJy8vc2VydmVyLmFyY2dpc29ubGluZS5jb20vQXJjR0lTL3Jlc3Qvc2VydmljZXMve3ZhcmlhbnR9L01hcFNlcnZlci90aWxlL3t6fS97eX0ve3h9Jywge1xuICAgICAgICBhdHRyaWJ1dGlvbjogJ1RpbGVzICZjb3B5OyBFc3JpJyxcbiAgICAgICAgdmFyaWFudDogJ1dvcmxkX1RvcG9fTWFwJ1xuICAgICAgfSkuYWRkVG8odGhpcy5tYXApO1xuICAgICAgdGhpcy5sZWZ0Rm9ybSA9IHRoaXMuJCgnLmxlZnQuZm9ybScpO1xuICAgICAgdGhpcy5idWlsZEZvcm0oJ2xlZnQnKTtcbiAgICAgIHRoaXMucmlnaHRGb3JtID0gdGhpcy4kKCcucmlnaHQuZm9ybScpO1xuICAgICAgdGhpcy5idWlsZEZvcm0oJ3JpZ2h0Jyk7XG4gICAgICB0aGlzLmxlZnRUYWcgPSB0aGlzLiQoJy5sZWZ0LnRhZycpO1xuICAgICAgdGhpcy5yaWdodFRhZyA9IHRoaXMuJCgnLnJpZ2h0LnRhZycpO1xuICAgICAgdGhpcy5zcGxpdExpbmUgPSB0aGlzLiQoJy5zcGxpdGxpbmUnKTtcbiAgICAgIHRoaXMuc3BsaXRUaHVtYiA9IHRoaXMuJCgnLnNwbGl0dGh1bWInKTtcbiAgICAgIHRoaXMubGVmdFNpZGVVcGRhdGUoKTtcbiAgICAgIHRoaXMucmlnaHRTaWRlVXBkYXRlKCk7XG4gICAgICByZXR1cm4gdGhpcy50b2dnbGVTcGxpdHRlcigpO1xuICAgIH0sXG4gICAgcmVzb2x2ZVBsYWNlaG9sZGVyczogZnVuY3Rpb24oc3RyV2l0aFBsYWNlaG9sZGVycywgcmVwbGFjZW1lbnRzKSB7XG4gICAgICB2YXIgYW5zLCBrZXksIHJlLCB2YWx1ZTtcbiAgICAgIGFucyA9IHN0cldpdGhQbGFjZWhvbGRlcnM7XG4gICAgICBhbnMgPSBhbnMucmVwbGFjZSgvXFx7XFx7XFxzKmxvY2F0aW9uLnByb3RvY29sXFxzKlxcfVxcfS9nLCBsb2NhdGlvbi5wcm90b2NvbCk7XG4gICAgICBhbnMgPSBhbnMucmVwbGFjZSgvXFx7XFx7XFxzKmxvY2F0aW9uLmhvc3RcXHMqXFx9XFx9L2csIGxvY2F0aW9uLmhvc3QpO1xuICAgICAgYW5zID0gYW5zLnJlcGxhY2UoL1xce1xce1xccypsb2NhdGlvbi5ob3N0bmFtZVxccypcXH1cXH0vZywgbG9jYXRpb24uaG9zdG5hbWUpO1xuICAgICAgZm9yIChrZXkgaW4gcmVwbGFjZW1lbnRzKSB7XG4gICAgICAgIHZhbHVlID0gcmVwbGFjZW1lbnRzW2tleV07XG4gICAgICAgIHJlID0gbmV3IFJlZ0V4cChcIlxcXFx7XFxcXHtcXFxccypcIiArIGtleSArIFwiXFxcXHMqXFxcXH1cXFxcfVwiLCBcImdcIik7XG4gICAgICAgIGFucyA9IGFucy5yZXBsYWNlKHJlLCB2YWx1ZSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gYW5zO1xuICAgIH0sXG4gICAgY29weU1hcExlZnRUb1JpZ2h0OiBmdW5jdGlvbigpIHtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LmNvcHlNYXBMZWZ0VG9SaWdodCcpO1xuICAgICAgaWYgKCF0aGlzLmxlZnRJbmZvKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHRoaXMuJCgnI3JpZ2h0bWFwc3BwJykudmFsKHRoaXMubGVmdEluZm8ubWFwTmFtZSk7XG4gICAgICB0aGlzLiQoJyNyaWdodG1hcHllYXInKS52YWwodGhpcy5sZWZ0SW5mby55ZWFyKTtcbiAgICAgIHRoaXMuJCgnaW5wdXRbbmFtZT1yaWdodG1hcHNjZW5hcmlvXScpLmVhY2goKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihpbmRleCwgaXRlbSkge1xuICAgICAgICAgIHJldHVybiAkKGl0ZW0pLnByb3AoJ2NoZWNrZWQnLCAkKGl0ZW0pLnZhbCgpID09PSBfdGhpcy5sZWZ0SW5mby5zY2VuYXJpbyk7XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKSk7XG4gICAgICB0aGlzLiQoJyNyaWdodG1hcGdjbScpLnZhbCh0aGlzLmxlZnRJbmZvLmdjbSk7XG4gICAgICByZXR1cm4gdGhpcy5yaWdodFNpZGVVcGRhdGUoKTtcbiAgICB9LFxuICAgIGNvcHlNYXBSaWdodFRvTGVmdDogZnVuY3Rpb24oKSB7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5jb3B5TWFwUmlnaHRUb0xlZnQnKTtcbiAgICAgIGlmICghdGhpcy5yaWdodEluZm8pIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdGhpcy4kKCcjbGVmdG1hcHNwcCcpLnZhbCh0aGlzLnJpZ2h0SW5mby5tYXBOYW1lKTtcbiAgICAgIHRoaXMuJCgnI2xlZnRtYXB5ZWFyJykudmFsKHRoaXMucmlnaHRJbmZvLnllYXIpO1xuICAgICAgdGhpcy4kKCdpbnB1dFtuYW1lPWxlZnRtYXBzY2VuYXJpb10nKS5lYWNoKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oaW5kZXgsIGl0ZW0pIHtcbiAgICAgICAgICByZXR1cm4gJChpdGVtKS5wcm9wKCdjaGVja2VkJywgJChpdGVtKS52YWwoKSA9PT0gX3RoaXMucmlnaHRJbmZvLnNjZW5hcmlvKTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKTtcbiAgICAgIHRoaXMuJCgnI2xlZnRtYXBnY20nKS52YWwodGhpcy5yaWdodEluZm8uZ2NtKTtcbiAgICAgIHJldHVybiB0aGlzLmxlZnRTaWRlVXBkYXRlKCk7XG4gICAgfSxcbiAgICBzaWRlVXBkYXRlOiBmdW5jdGlvbihzaWRlKSB7XG4gICAgICB2YXIgYXRCYXNlbGluZSwgY3VyckluZm8sIG5ld0luZm87XG4gICAgICBkZWJ1ZygnQXBwVmlldy5zaWRlVXBkYXRlICgnICsgc2lkZSArICcpJyk7XG4gICAgICBuZXdJbmZvID0ge1xuICAgICAgICBtYXBOYW1lOiB0aGlzLiQoJyMnICsgc2lkZSArICdtYXBzcHAnKS52YWwoKSxcbiAgICAgICAgZGVnczogdGhpcy4kKCcjJyArIHNpZGUgKyAnbWFwZGVncycpLnZhbCgpLFxuICAgICAgICByYW5nZTogdGhpcy4kKCdpbnB1dFtuYW1lPScgKyBzaWRlICsgJ21hcHJhbmdlXTpjaGVja2VkJykudmFsKCksXG4gICAgICAgIGNvbmZpZGVuY2U6IHRoaXMuJCgnIycgKyBzaWRlICsgJ21hcGNvbmZpZGVuY2UnKS52YWwoKVxuICAgICAgfTtcbiAgICAgIGF0QmFzZWxpbmUgPSBuZXdJbmZvLmRlZ3MgPT09ICdiYXNlbGluZSc7XG4gICAgICB0aGlzLiQoXCJpbnB1dFtuYW1lPVwiICsgc2lkZSArIFwibWFwcmFuZ2VdLCAjXCIgKyBzaWRlICsgXCJtYXBjb25maWRlbmNlXCIpLnByb3AoJ2Rpc2FibGVkJywgYXRCYXNlbGluZSk7XG4gICAgICB0aGlzLiQoXCIuXCIgKyBzaWRlICsgXCIuc2lkZS5mb3JtIGZpZWxkc2V0XCIpLnJlbW92ZUNsYXNzKCdkaXNhYmxlZCcpO1xuICAgICAgdGhpcy4kKFwiaW5wdXRbbmFtZV49XCIgKyBzaWRlICsgXCJdOmRpc2FibGVkLCBbaWRePVwiICsgc2lkZSArIFwiXTpkaXNhYmxlZFwiKS5jbG9zZXN0KCdmaWVsZHNldCcpLmFkZENsYXNzKCdkaXNhYmxlZCcpO1xuICAgICAgaWYgKG5ld0luZm8ubWFwTmFtZSBpbiB0aGlzLm5hbWVJbmRleCkge1xuICAgICAgICB0aGlzLiQoXCIuXCIgKyBzaWRlICsgXCItdmFsaWQtbWFwXCIpLnJlbW92ZUNsYXNzKCdkaXNhYmxlZCcpLnByb3AoJ2Rpc2FibGVkJywgZmFsc2UpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy4kKFwiLlwiICsgc2lkZSArIFwiLXZhbGlkLW1hcFwiKS5hZGRDbGFzcygnZGlzYWJsZWQnKS5wcm9wKCdkaXNhYmxlZCcsIHRydWUpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICBjdXJySW5mbyA9IHNpZGUgPT09ICdsZWZ0JyA/IHRoaXMubGVmdEluZm8gOiB0aGlzLnJpZ2h0SW5mbztcbiAgICAgIGlmIChjdXJySW5mbyAmJiBfLmlzRXF1YWwobmV3SW5mbywgY3VyckluZm8pKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIGlmIChjdXJySW5mbyAmJiBuZXdJbmZvLm1hcE5hbWUgPT09IGN1cnJJbmZvLm1hcE5hbWUgJiYgbmV3SW5mby5kZWdzID09PSBjdXJySW5mby5kZWdzICYmIG5ld0luZm8uZGVncyA9PT0gJ2Jhc2VsaW5lJykge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICBpZiAoc2lkZSA9PT0gJ2xlZnQnKSB7XG4gICAgICAgIHRoaXMubGVmdEluZm8gPSBuZXdJbmZvO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5yaWdodEluZm8gPSBuZXdJbmZvO1xuICAgICAgfVxuICAgICAgdGhpcy5hZGRNYXBMYXllcihzaWRlKTtcbiAgICAgIHJldHVybiB0aGlzLmFkZE1hcFRhZyhzaWRlKTtcbiAgICB9LFxuICAgIGxlZnRTaWRlVXBkYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2lkZVVwZGF0ZSgnbGVmdCcpO1xuICAgICAgaWYgKHRoaXMuJCgnI3N5bmMnKVswXS5jaGVja2VkKSB7XG4gICAgICAgIGRlYnVnKCdTeW5jIGNoZWNrZWQgLSBzeW5jaW5nIHJpZ2h0IHNpZGUnLCAnbWVzc2FnZScpO1xuICAgICAgICByZXR1cm4gdGhpcy5jb3B5U3BwVG9SaWdodFNpZGUoKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHJpZ2h0U2lkZVVwZGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5zaWRlVXBkYXRlKCdyaWdodCcpO1xuICAgIH0sXG4gICAgY29weVNwcFRvUmlnaHRTaWRlOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuJCgnI3JpZ2h0bWFwc3BwJykudmFsKHRoaXMuJCgnI2xlZnRtYXBzcHAnKS52YWwoKSk7XG4gICAgICByZXR1cm4gdGhpcy5yaWdodFNpZGVVcGRhdGUoKTtcbiAgICB9LFxuICAgIGFkZE1hcFRhZzogZnVuY3Rpb24oc2lkZSkge1xuICAgICAgdmFyIGRpc3BMb29rdXAsIGluZm8sIHRhZztcbiAgICAgIGRlYnVnKCdBcHBWaWV3LmFkZE1hcFRhZycpO1xuICAgICAgaWYgKHNpZGUgPT09ICdsZWZ0Jykge1xuICAgICAgICBpbmZvID0gdGhpcy5sZWZ0SW5mbztcbiAgICAgIH1cbiAgICAgIGlmIChzaWRlID09PSAncmlnaHQnKSB7XG4gICAgICAgIGluZm8gPSB0aGlzLnJpZ2h0SW5mbztcbiAgICAgIH1cbiAgICAgIHRhZyA9IFwiPGI+PGk+XCIgKyBpbmZvLm1hcE5hbWUgKyBcIjwvaT48L2I+XCI7XG4gICAgICBkaXNwTG9va3VwID0ge1xuICAgICAgICAnbm8uZGlzcCc6ICdubyByYW5nZSBhZGFwdGF0aW9uJyxcbiAgICAgICAgJ3JlYWwuZGlzcCc6ICdyYW5nZSBhZGFwdGF0aW9uJ1xuICAgICAgfTtcbiAgICAgIGlmIChpbmZvLmRlZ3MgPT09ICdiYXNlbGluZScpIHtcbiAgICAgICAgdGFnID0gXCJiYXNlbGluZSBcIiArIHRhZyArIFwiIGRpc3RyaWJ1dGlvblwiO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGFnID0gXCI8Yj5cIiArIGluZm8uY29uZmlkZW5jZSArIFwidGg8L2I+IHBlcmNlbnRpbGUgcHJvamVjdGlvbnMgZm9yIFwiICsgdGFnICsgXCIgYXQgPGI+K1wiICsgaW5mby5kZWdzICsgXCImZGVnO0M8L2I+IHdpdGggPGI+XCIgKyBkaXNwTG9va3VwW2luZm8ucmFuZ2VdICsgXCI8L2I+XCI7XG4gICAgICB9XG4gICAgICBpZiAoc2lkZSA9PT0gJ2xlZnQnKSB7XG4gICAgICAgIHRoaXMubGVmdFRhZy5maW5kKCcubGVmdGxheWVybmFtZScpLmh0bWwodGFnKTtcbiAgICAgIH1cbiAgICAgIGlmIChzaWRlID09PSAncmlnaHQnKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJpZ2h0VGFnLmZpbmQoJy5yaWdodGxheWVybmFtZScpLmh0bWwodGFnKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGFkZE1hcExheWVyOiBmdW5jdGlvbihzaWRlKSB7XG4gICAgICB2YXIgZXh0LCBmdXR1cmVNb2RlbFBvaW50LCBpc0NvbmNlcm4sIGlzUmVmdWdpYSwgaXNSaWNobmVzcywgbWFwSW5mbywgbWFwVXJsLCBwcm9qZWN0aW9uTmFtZSwgc2lkZUluZm8sIHN0eWxlLCB1cmwsIHppcFVybDtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LmFkZE1hcExheWVyJyk7XG4gICAgICBpZiAoc2lkZSA9PT0gJ2xlZnQnKSB7XG4gICAgICAgIHNpZGVJbmZvID0gdGhpcy5sZWZ0SW5mbztcbiAgICAgIH1cbiAgICAgIGlmIChzaWRlID09PSAncmlnaHQnKSB7XG4gICAgICAgIHNpZGVJbmZvID0gdGhpcy5yaWdodEluZm87XG4gICAgICB9XG4gICAgICBmdXR1cmVNb2RlbFBvaW50ID0gJyc7XG4gICAgICBtYXBVcmwgPSAnJztcbiAgICAgIHppcFVybCA9ICcnO1xuICAgICAgaXNSaWNobmVzcyA9IHNpZGVJbmZvLm1hcE5hbWUuc3RhcnRzV2l0aCgnUmljaG5lc3MgLScpO1xuICAgICAgaXNSZWZ1Z2lhID0gc2lkZUluZm8ubWFwTmFtZS5zdGFydHNXaXRoKCdSZWZ1Z2lhIC0nKTtcbiAgICAgIGlzQ29uY2VybiA9IHNpZGVJbmZvLm1hcE5hbWUuc3RhcnRzV2l0aCgnQ29uY2VybiAtJyk7XG4gICAgICBpZiAoaXNSaWNobmVzcykge1xuICAgICAgICBzdHlsZSA9ICd0YXhhLXJpY2huZXNzLWNoYW5nZSc7XG4gICAgICAgIHByb2plY3Rpb25OYW1lID0gXCJwcm9wLnJpY2huZXNzX1wiICsgc2lkZUluZm8uZGVncyArIFwiX1wiICsgc2lkZUluZm8ucmFuZ2UgKyBcIl9cIiArIHNpZGVJbmZvLmNvbmZpZGVuY2U7XG4gICAgICAgIGlmIChzaWRlSW5mby5kZWdzID09PSAnYmFzZWxpbmUnKSB7XG4gICAgICAgICAgcHJvamVjdGlvbk5hbWUgPSAnY3VycmVudC5yaWNobmVzcyc7XG4gICAgICAgICAgc3R5bGUgPSAndGF4YS1yaWNobmVzcyc7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoaXNSZWZ1Z2lhKSB7XG4gICAgICAgIHN0eWxlID0gJ3RheGEtcmVmdWdpYSc7XG4gICAgICAgIHByb2plY3Rpb25OYW1lID0gXCJyZWZ1Z2UuY2VydGFpbnR5X1wiICsgc2lkZUluZm8uZGVncyArIFwiX1wiICsgc2lkZUluZm8ucmFuZ2U7XG4gICAgICAgIGlmIChzaWRlSW5mby5kZWdzID09PSAnYmFzZWxpbmUnKSB7XG4gICAgICAgICAgcHJvamVjdGlvbk5hbWUgPSAnY3VycmVudC5yaWNobmVzcyc7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoaXNDb25jZXJuKSB7XG4gICAgICAgIHN0eWxlID0gJ3RheGEtYW9jJztcbiAgICAgICAgcHJvamVjdGlvbk5hbWUgPSBcIkFyZWFPZkNvbmNlcm4uY2VydGFpbnR5X1wiICsgc2lkZUluZm8uZGVncyArIFwiX1wiICsgc2lkZUluZm8ucmFuZ2U7XG4gICAgICAgIGlmIChzaWRlSW5mby5kZWdzID09PSAnYmFzZWxpbmUnKSB7XG4gICAgICAgICAgcHJvamVjdGlvbk5hbWUgPSAnY3VycmVudC5yaWNobmVzcyc7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHN0eWxlID0gJ3NwcC1zdWl0YWJpbGl0eS1wdXJwbGUnO1xuICAgICAgICBwcm9qZWN0aW9uTmFtZSA9IFwiVEVNUF9cIiArIHNpZGVJbmZvLmRlZ3MgKyBcIl9cIiArIHNpZGVJbmZvLmNvbmZpZGVuY2UgKyBcIi5cIiArIHNpZGVJbmZvLnJhbmdlO1xuICAgICAgICBpZiAoc2lkZUluZm8uZGVncyA9PT0gJ2Jhc2VsaW5lJykge1xuICAgICAgICAgIHByb2plY3Rpb25OYW1lID0gJ2N1cnJlbnQnO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBtYXBJbmZvID0gdGhpcy5tYXBMaXN0W3RoaXMubmFtZUluZGV4W3NpZGVJbmZvLm1hcE5hbWVdXTtcbiAgICAgIGlmIChtYXBJbmZvKSB7XG4gICAgICAgIHVybCA9IHRoaXMuc3BlY2llc0RhdGFVcmw7XG4gICAgICAgIGV4dCA9ICcudGlmJztcbiAgICAgICAgaWYgKG1hcEluZm8udHlwZSA9PT0gJ2NsaW1hdGUnKSB7XG4gICAgICAgICAgdXJsID0gdGhpcy5jbGltYXRlRGF0YVVybDtcbiAgICAgICAgICBleHQgPSAnLmFzYyc7XG4gICAgICAgIH0gZWxzZSBpZiAobWFwSW5mby50eXBlID09PSAncmljaG5lc3MnKSB7XG4gICAgICAgICAgdXJsID0gdGhpcy5zdW1tYXJpZXNEYXRhVXJsO1xuICAgICAgICB9XG4gICAgICAgIG1hcFVybCA9IFtcbiAgICAgICAgICB0aGlzLnJlc29sdmVQbGFjZWhvbGRlcnModXJsLCB7XG4gICAgICAgICAgICBwYXRoOiBtYXBJbmZvLnBhdGhcbiAgICAgICAgICB9KSwgcHJvamVjdGlvbk5hbWUgKyBleHRcbiAgICAgICAgXS5qb2luKCcvJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmxvZyhcIkNhbid0IG1hcCB0aGF0IC0tIG5vICdcIiArIHNpZGVJbmZvLm1hcE5hbWUgKyBcIicgaW4gaW5kZXhcIik7XG4gICAgICB9XG4gICAgICByZXR1cm4gJC5hamF4KHtcbiAgICAgICAgdXJsOiAnL2FwaS9wcmVwbGF5ZXIvJyxcbiAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAnaW5mbyc6IG1hcEluZm8sXG4gICAgICAgICAgJ3Byb2onOiBwcm9qZWN0aW9uTmFtZVxuICAgICAgICB9XG4gICAgICB9KS5kb25lKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgIHZhciBsYXllciwgbG9hZENsYXNzLCB3bXNMYXllciwgd21zVXJsO1xuICAgICAgICAgIGNvbnNvbGUubG9nKFsnbGF5ZXIgcHJlcHBlZCwgYW5zd2VyIGlzICcsIGRhdGFdKTtcbiAgICAgICAgICB3bXNVcmwgPSBkYXRhLm1hcFVybDtcbiAgICAgICAgICB3bXNMYXllciA9IGRhdGEubGF5ZXJOYW1lO1xuICAgICAgICAgIGxheWVyID0gTC50aWxlTGF5ZXIud21zKHdtc1VybCwge1xuICAgICAgICAgICAgbGF5ZXJzOiB3bXNMYXllcixcbiAgICAgICAgICAgIGZvcm1hdDogJ2ltYWdlL3BuZycsXG4gICAgICAgICAgICBzdHlsZXM6IHN0eWxlLFxuICAgICAgICAgICAgdHJhbnNwYXJlbnQ6IHRydWVcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBsb2FkQ2xhc3MgPSAnJyArIHNpZGUgKyAnbG9hZGluZyc7XG4gICAgICAgICAgbGF5ZXIub24oJ2xvYWRpbmcnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBfdGhpcy4kZWwuYWRkQ2xhc3MobG9hZENsYXNzKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBsYXllci5vbignbG9hZCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIF90aGlzLiRlbC5yZW1vdmVDbGFzcyhsb2FkQ2xhc3MpO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIGlmIChzaWRlID09PSAnbGVmdCcpIHtcbiAgICAgICAgICAgIGlmIChfdGhpcy5sZWZ0TGF5ZXIpIHtcbiAgICAgICAgICAgICAgX3RoaXMubWFwLnJlbW92ZUxheWVyKF90aGlzLmxlZnRMYXllcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBfdGhpcy5sZWZ0TGF5ZXIgPSBsYXllcjtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHNpZGUgPT09ICdyaWdodCcpIHtcbiAgICAgICAgICAgIGlmIChfdGhpcy5yaWdodExheWVyKSB7XG4gICAgICAgICAgICAgIF90aGlzLm1hcC5yZW1vdmVMYXllcihfdGhpcy5yaWdodExheWVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF90aGlzLnJpZ2h0TGF5ZXIgPSBsYXllcjtcbiAgICAgICAgICB9XG4gICAgICAgICAgbGF5ZXIuYWRkVG8oX3RoaXMubWFwKTtcbiAgICAgICAgICBfdGhpcy5sZWdlbmQudXBkYXRlKHtcbiAgICAgICAgICAgIHVyaTogJy9zdGF0aWMvaW1hZ2VzL2xlZ2VuZHMvJyArIHN0eWxlICsgJy5zbGQuc3ZnJ1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIHJldHVybiBfdGhpcy5yZXNpemVUaGluZ3MoKTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKS5mYWlsKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oanF4LCBzdGF0dXMpIHtcbiAgICAgICAgICByZXR1cm4gZGVidWcoc3RhdHVzLCAnd2FybmluZycpO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpO1xuICAgIH0sXG4gICAgY2VudHJlTWFwOiBmdW5jdGlvbihyZXBlYXRlZGx5Rm9yKSB7XG4gICAgICB2YXIgbGF0ZXIsIHJlY2VudHJlLCBfaSwgX3Jlc3VsdHM7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5jZW50cmVNYXAnKTtcbiAgICAgIGlmICghcmVwZWF0ZWRseUZvcikge1xuICAgICAgICByZXBlYXRlZGx5Rm9yID0gNTAwO1xuICAgICAgfVxuICAgICAgcmVjZW50cmUgPSAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIF90aGlzLm1hcC5pbnZhbGlkYXRlU2l6ZShmYWxzZSk7XG4gICAgICAgICAgcmV0dXJuIF90aGlzLnJlc2l6ZVRoaW5ncygpO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcyk7XG4gICAgICBfcmVzdWx0cyA9IFtdO1xuICAgICAgZm9yIChsYXRlciA9IF9pID0gMDsgX2kgPD0gcmVwZWF0ZWRseUZvcjsgbGF0ZXIgPSBfaSArPSAyNSkge1xuICAgICAgICBfcmVzdWx0cy5wdXNoKHNldFRpbWVvdXQocmVjZW50cmUsIGxhdGVyKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gX3Jlc3VsdHM7XG4gICAgfSxcbiAgICB0b2dnbGVGb3JtczogZnVuY3Rpb24oKSB7XG4gICAgICBkZWJ1ZygnQXBwVmlldy50b2dnbGVGb3JtcycpO1xuICAgICAgdGhpcy4kZWwudG9nZ2xlQ2xhc3MoJ3Nob3dmb3JtcycpO1xuICAgICAgcmV0dXJuIHRoaXMuY2VudHJlTWFwKCk7XG4gICAgfSxcbiAgICB0b2dnbGVTcGxpdHRlcjogZnVuY3Rpb24oKSB7XG4gICAgICBkZWJ1ZygnQXBwVmlldy50b2dnbGVTcGxpdHRlcicpO1xuICAgICAgdGhpcy4kZWwudG9nZ2xlQ2xhc3MoJ3NwbGl0Jyk7XG4gICAgICBpZiAodGhpcy4kZWwuaGFzQ2xhc3MoJ3NwbGl0JykpIHtcbiAgICAgICAgdGhpcy5hY3RpdmF0ZVNwbGl0dGVyKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmRlYWN0aXZhdGVTcGxpdHRlcigpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMuY2VudHJlTWFwKCk7XG4gICAgfSxcbiAgICB0b2dnbGVTeW5jOiBmdW5jdGlvbigpIHtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LnRvZ2dsZVN5bmMnKTtcbiAgICAgIGlmICh0aGlzLiQoJyNzeW5jJylbMF0uY2hlY2tlZCkge1xuICAgICAgICB0aGlzLiQoJy5yaWdodG1hcHNwcCcpLnByb3AoJ2Rpc2FibGVkJywgdHJ1ZSk7XG4gICAgICAgIHJldHVybiB0aGlzLmNvcHlTcHBUb1JpZ2h0U2lkZSgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuJCgnLnJpZ2h0bWFwc3BwJykucHJvcCgnZGlzYWJsZWQnLCBmYWxzZSk7XG4gICAgICB9XG4gICAgfSxcbiAgICBidWlsZEZvcm06IGZ1bmN0aW9uKHNpZGUpIHtcbiAgICAgIHZhciAkbWFwc3BwO1xuICAgICAgZGVidWcoJ0FwcFZpZXcuYnVpbGRGb3JtJyk7XG4gICAgICAkbWFwc3BwID0gdGhpcy4kKFwiI1wiICsgc2lkZSArIFwibWFwc3BwXCIpO1xuICAgICAgcmV0dXJuICRtYXBzcHAuYXV0b2NvbXBsZXRlKHtcbiAgICAgICAgZGVsYXk6IDIwMCxcbiAgICAgICAgY2xvc2U6IChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBfdGhpcy4kZWwudHJpZ2dlcihcIlwiICsgc2lkZSArIFwibWFwdXBkYXRlXCIpO1xuICAgICAgICAgIH07XG4gICAgICAgIH0pKHRoaXMpLFxuICAgICAgICBzb3VyY2U6IChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICAgIHJldHVybiBmdW5jdGlvbihyZXEsIHJlc3BvbnNlKSB7XG4gICAgICAgICAgICByZXR1cm4gJC5hamF4KHtcbiAgICAgICAgICAgICAgdXJsOiAnL2FwaS9tYXBzZWFyY2gvJyxcbiAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgIHRlcm06IHJlcS50ZXJtXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKGFuc3dlcikge1xuICAgICAgICAgICAgICAgIHZhciBpbmZvLCBuaWNlLCBzZWxlY3RhYmxlO1xuICAgICAgICAgICAgICAgIHNlbGVjdGFibGUgPSBbXTtcbiAgICAgICAgICAgICAgICBmb3IgKG5pY2UgaW4gYW5zd2VyKSB7XG4gICAgICAgICAgICAgICAgICBpbmZvID0gYW5zd2VyW25pY2VdO1xuICAgICAgICAgICAgICAgICAgc2VsZWN0YWJsZS5wdXNoKG5pY2UpO1xuICAgICAgICAgICAgICAgICAgX3RoaXMubWFwTGlzdFtpbmZvLm1hcElkXSA9IGluZm87XG4gICAgICAgICAgICAgICAgICBfdGhpcy5uYW1lSW5kZXhbbmljZV0gPSBpbmZvLm1hcElkO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhhbnN3ZXIpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHNlbGVjdGFibGUpO1xuICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZShzZWxlY3RhYmxlKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfTtcbiAgICAgICAgfSkodGhpcylcbiAgICAgIH0pO1xuICAgIH0sXG4gICAgc3RhcnRTcGxpdHRlclRyYWNraW5nOiBmdW5jdGlvbigpIHtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LnN0YXJ0U3BsaXR0ZXJUcmFja2luZycpO1xuICAgICAgdGhpcy50cmFja1NwbGl0dGVyID0gdHJ1ZTtcbiAgICAgIHRoaXMuc3BsaXRMaW5lLmFkZENsYXNzKCdkcmFnZ2luZycpO1xuICAgICAgcmV0dXJuIHRoaXMubG9jYXRlU3BsaXR0ZXIoKTtcbiAgICB9LFxuICAgIGxvY2F0ZVNwbGl0dGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LmxvY2F0ZVNwbGl0dGVyJyk7XG4gICAgICBpZiAodGhpcy50cmFja1NwbGl0dGVyKSB7XG4gICAgICAgIHRoaXMucmVzaXplVGhpbmdzKCk7XG4gICAgICAgIGlmICh0aGlzLnRyYWNrU3BsaXR0ZXIgPT09IDApIHtcbiAgICAgICAgICB0aGlzLnRyYWNrU3BsaXR0ZXIgPSBmYWxzZTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnRyYWNrU3BsaXR0ZXIgIT09IHRydWUpIHtcbiAgICAgICAgICB0aGlzLnRyYWNrU3BsaXR0ZXIgLT0gMTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc2V0VGltZW91dCh0aGlzLmxvY2F0ZVNwbGl0dGVyLCB0aGlzLnRyYWNrUGVyaW9kKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHJlc2l6ZVRoaW5nczogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgJG1hcEJveCwgYm90dG9tUmlnaHQsIGxheWVyQm90dG9tLCBsYXllclRvcCwgbGVmdExlZnQsIGxlZnRNYXAsIG1hcEJvdW5kcywgbWFwQm94LCBuZXdMZWZ0V2lkdGgsIHJpZ2h0TWFwLCByaWdodFJpZ2h0LCBzcGxpdFBvaW50LCBzcGxpdFgsIHRvcExlZnQ7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5yZXNpemVUaGluZ3MnKTtcbiAgICAgIGlmICh0aGlzLmxlZnRMYXllcikge1xuICAgICAgICBsZWZ0TWFwID0gJCh0aGlzLmxlZnRMYXllci5nZXRDb250YWluZXIoKSk7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5yaWdodExheWVyKSB7XG4gICAgICAgIHJpZ2h0TWFwID0gJCh0aGlzLnJpZ2h0TGF5ZXIuZ2V0Q29udGFpbmVyKCkpO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMuJGVsLmhhc0NsYXNzKCdzcGxpdCcpKSB7XG4gICAgICAgIG5ld0xlZnRXaWR0aCA9IHRoaXMuc3BsaXRUaHVtYi5wb3NpdGlvbigpLmxlZnQgKyAodGhpcy5zcGxpdFRodW1iLndpZHRoKCkgLyAyLjApO1xuICAgICAgICBtYXBCb3ggPSB0aGlzLm1hcC5nZXRDb250YWluZXIoKTtcbiAgICAgICAgJG1hcEJveCA9ICQobWFwQm94KTtcbiAgICAgICAgbWFwQm91bmRzID0gbWFwQm94LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICB0b3BMZWZ0ID0gdGhpcy5tYXAuY29udGFpbmVyUG9pbnRUb0xheWVyUG9pbnQoWzAsIDBdKTtcbiAgICAgICAgc3BsaXRQb2ludCA9IHRoaXMubWFwLmNvbnRhaW5lclBvaW50VG9MYXllclBvaW50KFtuZXdMZWZ0V2lkdGgsIDBdKTtcbiAgICAgICAgYm90dG9tUmlnaHQgPSB0aGlzLm1hcC5jb250YWluZXJQb2ludFRvTGF5ZXJQb2ludChbJG1hcEJveC53aWR0aCgpLCAkbWFwQm94LmhlaWdodCgpXSk7XG4gICAgICAgIGxheWVyVG9wID0gdG9wTGVmdC55O1xuICAgICAgICBsYXllckJvdHRvbSA9IGJvdHRvbVJpZ2h0Lnk7XG4gICAgICAgIHNwbGl0WCA9IHNwbGl0UG9pbnQueCAtIG1hcEJvdW5kcy5sZWZ0O1xuICAgICAgICBsZWZ0TGVmdCA9IHRvcExlZnQueCAtIG1hcEJvdW5kcy5sZWZ0O1xuICAgICAgICByaWdodFJpZ2h0ID0gYm90dG9tUmlnaHQueDtcbiAgICAgICAgdGhpcy5zcGxpdExpbmUuY3NzKCdsZWZ0JywgbmV3TGVmdFdpZHRoKTtcbiAgICAgICAgdGhpcy5sZWZ0VGFnLmF0dHIoJ3N0eWxlJywgXCJjbGlwOiByZWN0KDAsIFwiICsgbmV3TGVmdFdpZHRoICsgXCJweCwgYXV0bywgMClcIik7XG4gICAgICAgIGlmICh0aGlzLmxlZnRMYXllcikge1xuICAgICAgICAgIGxlZnRNYXAuYXR0cignc3R5bGUnLCBcImNsaXA6IHJlY3QoXCIgKyBsYXllclRvcCArIFwicHgsIFwiICsgc3BsaXRYICsgXCJweCwgXCIgKyBsYXllckJvdHRvbSArIFwicHgsIFwiICsgbGVmdExlZnQgKyBcInB4KVwiKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5yaWdodExheWVyKSB7XG4gICAgICAgICAgcmV0dXJuIHJpZ2h0TWFwLmF0dHIoJ3N0eWxlJywgXCJjbGlwOiByZWN0KFwiICsgbGF5ZXJUb3AgKyBcInB4LCBcIiArIHJpZ2h0UmlnaHQgKyBcInB4LCBcIiArIGxheWVyQm90dG9tICsgXCJweCwgXCIgKyBzcGxpdFggKyBcInB4KVwiKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5sZWZ0VGFnLmF0dHIoJ3N0eWxlJywgJ2NsaXA6IGluaGVyaXQnKTtcbiAgICAgICAgaWYgKHRoaXMubGVmdExheWVyKSB7XG4gICAgICAgICAgbGVmdE1hcC5hdHRyKCdzdHlsZScsICdjbGlwOiBpbmhlcml0Jyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMucmlnaHRMYXllcikge1xuICAgICAgICAgIHJldHVybiByaWdodE1hcC5hdHRyKCdzdHlsZScsICdjbGlwOiByZWN0KDAsMCwwLDApJyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIHN0b3BTcGxpdHRlclRyYWNraW5nOiBmdW5jdGlvbigpIHtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LnN0b3BTcGxpdHRlclRyYWNraW5nJyk7XG4gICAgICB0aGlzLnNwbGl0TGluZS5yZW1vdmVDbGFzcygnZHJhZ2dpbmcnKTtcbiAgICAgIHJldHVybiB0aGlzLnRyYWNrU3BsaXR0ZXIgPSA1O1xuICAgIH0sXG4gICAgYWN0aXZhdGVTcGxpdHRlcjogZnVuY3Rpb24oKSB7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5hY3RpdmF0ZVNwbGl0dGVyJyk7XG4gICAgICB0aGlzLnNwbGl0VGh1bWIuZHJhZ2dhYmxlKHtcbiAgICAgICAgY29udGFpbm1lbnQ6ICQoJyNtYXB3cmFwcGVyJyksXG4gICAgICAgIHNjcm9sbDogZmFsc2UsXG4gICAgICAgIHN0YXJ0OiB0aGlzLnN0YXJ0U3BsaXR0ZXJUcmFja2luZyxcbiAgICAgICAgZHJhZzogdGhpcy5yZXNpemVUaGluZ3MsXG4gICAgICAgIHN0b3A6IHRoaXMuc3RvcFNwbGl0dGVyVHJhY2tpbmdcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHRoaXMucmVzaXplVGhpbmdzKCk7XG4gICAgfSxcbiAgICBkZWFjdGl2YXRlU3BsaXR0ZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgZGVidWcoJ0FwcFZpZXcuZGVhY3RpdmF0ZVNwbGl0dGVyJyk7XG4gICAgICB0aGlzLnNwbGl0VGh1bWIuZHJhZ2dhYmxlKCdkZXN0cm95Jyk7XG4gICAgICByZXR1cm4gdGhpcy5yZXNpemVUaGluZ3MoKTtcbiAgICB9XG4gIH0sIHtcbiAgICB0ZW1wbGF0ZXM6IHtcbiAgICAgIGxheW91dDogXy50ZW1wbGF0ZShcIjxkaXYgY2xhcz1cXFwidWktZnJvbnRcXFwiPjwvZGl2PlxcbjxkaXYgY2xhc3M9XFxcInNwbGl0bGluZVxcXCI+Jm5ic3A7PC9kaXY+XFxuPGRpdiBjbGFzcz1cXFwic3BsaXR0aHVtYlxcXCI+PHNwYW4+JiN4Mjc2ZTsgJiN4Mjc2Zjs8L3NwYW4+PC9kaXY+XFxuPGRpdiBjbGFzcz1cXFwibGVmdCB0YWdcXFwiPjwlPSBsZWZ0VGFnICU+PC9kaXY+XFxuPGRpdiBjbGFzcz1cXFwicmlnaHQgdGFnXFxcIj48JT0gcmlnaHRUYWcgJT48L2Rpdj5cXG48ZGl2IGNsYXNzPVxcXCJsZWZ0IHNpZGUgZm9ybVxcXCI+PCU9IGxlZnRGb3JtICU+PC9kaXY+XFxuPGRpdiBjbGFzcz1cXFwicmlnaHQgc2lkZSBmb3JtXFxcIj48JT0gcmlnaHRGb3JtICU+PC9kaXY+XFxuPGRpdiBjbGFzcz1cXFwibGVmdCBsb2FkZXJcXFwiPjxpbWcgc3JjPVxcXCIvc3RhdGljL2ltYWdlcy9zcGlubmVyLmxvYWRpbmZvLm5ldC5naWZcXFwiIC8+PC9kaXY+XFxuPGRpdiBjbGFzcz1cXFwicmlnaHQgbG9hZGVyXFxcIj48aW1nIHNyYz1cXFwiL3N0YXRpYy9pbWFnZXMvc3Bpbm5lci5sb2FkaW5mby5uZXQuZ2lmXFxcIiAvPjwvZGl2PlxcbjxkaXYgaWQ9XFxcIm1hcHdyYXBwZXJcXFwiPjxkaXYgaWQ9XFxcIm1hcFxcXCI+PC9kaXY+PC9kaXY+XCIpLFxuICAgICAgbGVmdFRhZzogXy50ZW1wbGF0ZShcIjxkaXYgY2xhc3M9XFxcInNob3dcXFwiPlxcbiAgICA8c3BhbiBjbGFzcz1cXFwibGVmdGxheWVybmFtZVxcXCI+cGxhaW4gbWFwPC9zcGFuPlxcbiAgICA8YnI+XFxuICAgIDxidXR0b24gY2xhc3M9XFxcImJ0bi1jaGFuZ2VcXFwiPnNldHRpbmdzPC9idXR0b24+XFxuICAgIDxidXR0b24gY2xhc3M9XFxcImJ0bi1jb21wYXJlXFxcIj5zaG93L2hpZGUgY29tcGFyaXNvbiBtYXA8L2J1dHRvbj5cXG48L2Rpdj5cXG48ZGl2IGNsYXNzPVxcXCJlZGl0XFxcIj5cXG4gICAgPGxhYmVsIGNsYXNzPVxcXCJsZWZ0IHN5bmNib3hcXFwiPjwvbGFiZWw+XFxuICAgIDxpbnB1dCBpZD1cXFwibGVmdG1hcHNwcFxcXCIgY2xhc3M9XFxcImxlZnRcXFwiIHR5cGU9XFxcInRleHRcXFwiIG5hbWU9XFxcImxlZnRtYXBzcHBcXFwiIHBsYWNlaG9sZGVyPVxcXCImaGVsbGlwOyBzcGVjaWVzIG9yIGdyb3VwICZoZWxsaXA7XFxcIiAvPlxcbjwvZGl2PlwiKSxcbiAgICAgIHJpZ2h0VGFnOiBfLnRlbXBsYXRlKFwiPGRpdiBjbGFzcz1cXFwic2hvd1xcXCI+XFxuICAgIDxzcGFuIGNsYXNzPVxcXCJyaWdodGxheWVybmFtZVxcXCI+KG5vIGRpc3RyaWJ1dGlvbik8L3NwYW4+XFxuICAgIDxicj5cXG4gICAgPGJ1dHRvbiBjbGFzcz1cXFwiYnRuLWNoYW5nZVxcXCI+c2V0dGluZ3M8L2J1dHRvbj5cXG4gICAgPGJ1dHRvbiBjbGFzcz1cXFwiYnRuLWNvbXBhcmVcXFwiPnNob3cvaGlkZSBjb21wYXJpc29uIG1hcDwvYnV0dG9uPlxcbjwvZGl2PlxcbjxkaXYgY2xhc3M9XFxcImVkaXRcXFwiPlxcbiAgICA8bGFiZWwgY2xhc3M9XFxcInJpZ2h0IHN5bmNib3hcXFwiPjxpbnB1dCBpZD1cXFwic3luY1xcXCIgdHlwZT1cXFwiY2hlY2tib3hcXFwiIHZhbHVlPVxcXCJzeW5jXFxcIiBjaGVja2VkPVxcXCJjaGVja2VkXFxcIiAvPiBzYW1lIGFzIGxlZnQgc2lkZTwvbGFiZWw+XFxuICAgIDxpbnB1dCBpZD1cXFwicmlnaHRtYXBzcHBcXFwiIHR5cGU9XFxcInRleHRcXFwiIGNsYXNzPVxcXCJyaWdodFxcXCIgbmFtZT1cXFwicmlnaHRtYXBzcHBcXFwiIHBsYWNlaG9sZGVyPVxcXCImaGVsbGlwOyBzcGVjaWVzIG9yIGdyb3VwICZoZWxsaXA7XFxcIiAvPlxcbjwvZGl2PlwiKSxcbiAgICAgIGxlZnRGb3JtOiBfLnRlbXBsYXRlKFwiPGZpZWxkc2V0PlxcbiAgICA8bGVnZW5kPnRlbXBlcmF0dXJlIGNoYW5nZTwvbGVnZW5kPlxcbiAgICA8c2VsZWN0IGNsYXNzPVxcXCJsZWZ0XFxcIiBpZD1cXFwibGVmdG1hcGRlZ3NcXFwiPlxcbiAgICAgICAgPG9wdGlvbiB2YWx1ZT1cXFwiYmFzZWxpbmVcXFwiPmJhc2VsaW5lPC9vcHRpb24+XFxuICAgICAgICA8b3B0aW9uIHZhbHVlPVxcXCIxLjVcXFwiPjEuNSAmZGVnO0M8L29wdGlvbj5cXG4gICAgICAgIDxvcHRpb24gdmFsdWU9XFxcIjJcXFwiPjIuMCAmZGVnO0M8L29wdGlvbj5cXG4gICAgICAgIDxvcHRpb24gdmFsdWU9XFxcIjIuN1xcXCI+Mi43ICZkZWc7Qzwvb3B0aW9uPlxcbiAgICAgICAgPG9wdGlvbiB2YWx1ZT1cXFwiMy4yXFxcIj4zLjIgJmRlZztDPC9vcHRpb24+XFxuICAgICAgICA8b3B0aW9uIHZhbHVlPVxcXCI0LjVcXFwiPjQuNSAmZGVnO0M8L29wdGlvbj5cXG4gICAgICAgIDxvcHRncm91cCBsYWJlbD1cXFwiSGlnaCBzZW5zaXRpdml0eSBjbGltYXRlXFxcIj5cXG4gICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVxcXCI2XFxcIj42LjAgJmRlZztDPC9vcHRpb24+XFxuICAgICAgICA8L29wdGdyb3VwPlxcbiAgICA8L3NlbGVjdD5cXG48L2ZpZWxkc2V0PlxcbjxmaWVsZHNldD5cXG4gICAgPGxlZ2VuZD5hZGFwdGF0aW9uIHZpYSByYW5nZSBzaGlmdDwvbGVnZW5kPlxcbiAgICA8bGFiZWw+PCEtLSBzcGFuPm5vbmU8L3NwYW4gLS0+IDxpbnB1dCBuYW1lPVxcXCJsZWZ0bWFwcmFuZ2VcXFwiIGNsYXNzPVxcXCJsZWZ0XFxcIiB0eXBlPVxcXCJyYWRpb1xcXCIgdmFsdWU9XFxcIm5vLmRpc3BcXFwiIGNoZWNrZWQ9XFxcImNoZWNrZWRcXFwiPiBzcGVjaWVzIGNhbm5vdCBzaGlmdCByYW5nZXM8L2xhYmVsPlxcbiAgICA8bGFiZWw+PCEtLSBzcGFuPmFsbG93PC9zcGFuIC0tPiA8aW5wdXQgbmFtZT1cXFwibGVmdG1hcHJhbmdlXFxcIiBjbGFzcz1cXFwibGVmdFxcXCIgdHlwZT1cXFwicmFkaW9cXFwiIHZhbHVlPVxcXCJyZWFsLmRpc3BcXFwiPiBhbGxvdyByYW5nZSBhZGFwdGF0aW9uPC9sYWJlbD5cXG48L2ZpZWxkc2V0PlxcbjxmaWVsZHNldD5cXG4gICAgPGxlZ2VuZD5tb2RlbCBzdW1tYXJ5PC9sZWdlbmQ+XFxuICAgIDxzZWxlY3QgY2xhc3M9XFxcImxlZnRcXFwiIGlkPVxcXCJsZWZ0bWFwY29uZmlkZW5jZVxcXCI+XFxuICAgICAgICA8b3B0aW9uIHZhbHVlPVxcXCIxMFxcXCI+MTB0aCBwZXJjZW50aWxlPC9vcHRpb24+XFxuICAgICAgICA8IS0tIG9wdGlvbiB2YWx1ZT1cXFwiMzNcXFwiPjMzcmQgcGVyY2VudGlsZTwvb3B0aW9uIC0tPlxcbiAgICAgICAgPG9wdGlvbiB2YWx1ZT1cXFwiNTBcXFwiIHNlbGVjdGVkPVxcXCJzZWxlY3RlZFxcXCI+NTB0aCBwZXJjZW50aWxlPC9vcHRpb24+XFxuICAgICAgICA8IS0tIG9wdGlvbiB2YWx1ZT1cXFwiNjZcXFwiPjY2dGggcGVyY2VudGlsZTwvb3B0aW9uIC0tPlxcbiAgICAgICAgPG9wdGlvbiB2YWx1ZT1cXFwiOTBcXFwiPjkwdGggcGVyY2VudGlsZTwvb3B0aW9uPlxcbiAgICA8L3NlbGVjdD5cXG48L2ZpZWxkc2V0PlxcbjxmaWVsZHNldCBjbGFzcz1cXFwiYmxhbmtcXFwiPlxcbiAgICA8YnV0dG9uIHR5cGU9XFxcImJ1dHRvblxcXCIgY2xhc3M9XFxcImJ0bi1jaGFuZ2VcXFwiPmhpZGUgc2V0dGluZ3M8L2J1dHRvbj5cXG4gICAgPGJ1dHRvbiB0eXBlPVxcXCJidXR0b25cXFwiIGNsYXNzPVxcXCJidG4tY29tcGFyZVxcXCI+aGlkZS9zaG93IHJpZ2h0IG1hcDwvYnV0dG9uPlxcbiAgICA8YnV0dG9uIHR5cGU9XFxcImJ1dHRvblxcXCIgY2xhc3M9XFxcImJ0bi1jb3B5IHJpZ2h0LXZhbGlkLW1hcFxcXCI+Y29weSByaWdodCBtYXAgJmxhcXVvOzwvYnV0dG9uPlxcbiAgICA8YSBpZD1cXFwibGVmdG1hcGRsXFxcIiBjbGFzcz1cXFwiZG93bmxvYWQgbGVmdC12YWxpZC1tYXBcXFwiIGhyZWY9XFxcIlxcXCIgZGlzYWJsZWQ9XFxcImRpc2FibGVkXFxcIj5kb3dubG9hZCBqdXN0IHRoaXMgbWFwPGJyPig8MU1iIEdlb1RJRkYpPC9hPlxcbjwvZmllbGRzZXQ+XFxuXCIpLFxuICAgICAgcmlnaHRGb3JtOiBfLnRlbXBsYXRlKFwiPGZpZWxkc2V0PlxcbiAgICA8bGVnZW5kPnRlbXBlcmF0dXJlIGNoYW5nZTwvbGVnZW5kPlxcbiAgICA8c2VsZWN0IGNsYXNzPVxcXCJyaWdodFxcXCIgaWQ9XFxcInJpZ2h0bWFwZGVnc1xcXCI+XFxuICAgICAgICA8b3B0aW9uIHZhbHVlPVxcXCJiYXNlbGluZVxcXCI+YmFzZWxpbmU8L29wdGlvbj5cXG4gICAgICAgIDxvcHRpb24gdmFsdWU9XFxcIjEuNVxcXCI+MS41ICZkZWc7Qzwvb3B0aW9uPlxcbiAgICAgICAgPG9wdGlvbiB2YWx1ZT1cXFwiMlxcXCI+Mi4wICZkZWc7Qzwvb3B0aW9uPlxcbiAgICAgICAgPG9wdGlvbiB2YWx1ZT1cXFwiMi43XFxcIj4yLjcgJmRlZztDPC9vcHRpb24+XFxuICAgICAgICA8b3B0aW9uIHZhbHVlPVxcXCIzLjJcXFwiPjMuMiAmZGVnO0M8L29wdGlvbj5cXG4gICAgICAgIDxvcHRpb24gdmFsdWU9XFxcIjQuNVxcXCI+NC41ICZkZWc7Qzwvb3B0aW9uPlxcbiAgICAgICAgPG9wdGdyb3VwIGxhYmVsPVxcXCJIaWdoIHNlbnNpdGl2aXR5IGNsaW1hdGVcXFwiPlxcbiAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XFxcIjZcXFwiPjYuMCAmZGVnO0M8L29wdGlvbj5cXG4gICAgICAgIDwvb3B0Z3JvdXA+XFxuICAgIDwvc2VsZWN0PlxcbjwvZmllbGRzZXQ+XFxuPGZpZWxkc2V0PlxcbiAgICA8bGVnZW5kPmFkYXB0YXRpb24gdmlhIHJhbmdlIHNoaWZ0PC9sZWdlbmQ+XFxuICAgIDxsYWJlbD48IS0tIHNwYW4+bm9uZTwvc3BhbiAtLT4gPGlucHV0IG5hbWU9XFxcInJpZ2h0bWFwcmFuZ2VcXFwiIGNsYXNzPVxcXCJyaWdodFxcXCIgdHlwZT1cXFwicmFkaW9cXFwiIHZhbHVlPVxcXCJuby5kaXNwXFxcIiBjaGVja2VkPVxcXCJjaGVja2VkXFxcIj4gc3BlY2llcyBjYW5ub3Qgc2hpZnQgcmFuZ2VzPC9sYWJlbD5cXG4gICAgPGxhYmVsPjwhLS0gc3Bhbj5hbGxvdzwvc3BhbiAtLT4gPGlucHV0IG5hbWU9XFxcInJpZ2h0bWFwcmFuZ2VcXFwiIGNsYXNzPVxcXCJyaWdodFxcXCIgdHlwZT1cXFwicmFkaW9cXFwiIHZhbHVlPVxcXCJyZWFsLmRpc3BcXFwiPiBhbGxvdyByYW5nZSBhZGFwdGF0aW9uPC9sYWJlbD5cXG48L2ZpZWxkc2V0PlxcbjxmaWVsZHNldD5cXG4gICAgPGxlZ2VuZD5tb2RlbCBzdW1tYXJ5PC9sZWdlbmQ+XFxuICAgIDxzZWxlY3QgY2xhc3M9XFxcInJpZ2h0XFxcIiBpZD1cXFwicmlnaHRtYXBjb25maWRlbmNlXFxcIj5cXG4gICAgICAgIDxvcHRpb24gdmFsdWU9XFxcIjEwXFxcIj4xMHRoIHBlcmNlbnRpbGU8L29wdGlvbj5cXG4gICAgICAgIDwhLS0gb3B0aW9uIHZhbHVlPVxcXCIzM1xcXCI+MzNyZCBwZXJjZW50aWxlPC9vcHRpb24gLS0+XFxuICAgICAgICA8b3B0aW9uIHZhbHVlPVxcXCI1MFxcXCIgc2VsZWN0ZWQ9XFxcInNlbGVjdGVkXFxcIj41MHRoIHBlcmNlbnRpbGU8L29wdGlvbj5cXG4gICAgICAgIDwhLS0gb3B0aW9uIHZhbHVlPVxcXCI2NlxcXCI+NjZ0aCBwZXJjZW50aWxlPC9vcHRpb24gLS0+XFxuICAgICAgICA8b3B0aW9uIHZhbHVlPVxcXCI5MFxcXCI+OTB0aCBwZXJjZW50aWxlPC9vcHRpb24+XFxuICAgIDwvc2VsZWN0PlxcbjwvZmllbGRzZXQ+XFxuPGZpZWxkc2V0IGNsYXNzPVxcXCJibGFua1xcXCI+XFxuICAgIDxidXR0b24gdHlwZT1cXFwiYnV0dG9uXFxcIiBjbGFzcz1cXFwiYnRuLWNoYW5nZVxcXCI+aGlkZSBzZXR0aW5nczwvYnV0dG9uPlxcbiAgICA8YnV0dG9uIHR5cGU9XFxcImJ1dHRvblxcXCIgY2xhc3M9XFxcImJ0bi1jb21wYXJlXFxcIj5oaWRlL3Nob3cgcmlnaHQgbWFwPC9idXR0b24+XFxuICAgIDxidXR0b24gdHlwZT1cXFwiYnV0dG9uXFxcIiBjbGFzcz1cXFwiYnRuLWNvcHkgbGVmdC12YWxpZC1tYXBcXFwiPmNvcHkgbGVmdCBtYXAgJmxhcXVvOzwvYnV0dG9uPlxcbiAgICA8YSBpZD1cXFwicmlnaHRtYXBkbFxcXCIgY2xhc3M9XFxcImRvd25sb2FkIHJpZ2h0LXZhbGlkLW1hcFxcXCIgaHJlZj1cXFwiXFxcIiBkaXNhYmxlZD1cXFwiZGlzYWJsZWRcXFwiPmRvd25sb2FkIGp1c3QgdGhpcyBtYXA8YnI+KDwxTWIgR2VvVElGRik8L2E+XFxuPC9maWVsZHNldD5cXG5cIilcbiAgICB9XG4gIH0pO1xuXG4gIG1vZHVsZS5leHBvcnRzID0gQXBwVmlldztcblxufSkuY2FsbCh0aGlzKTtcbiIsIlxuLy8galF1ZXJ5IHBsdWdpblxuLy8gYXV0aG9yOiBEYW5pZWwgQmFpcmQgPGRhbmllbEBkYW5pZWxiYWlyZC5jb20+XG4vLyB2ZXJzaW9uOiAwLjEuMjAxNDAyMDVcblxuLy9cbi8vIFRoaXMgbWFuYWdlcyBtZW51cywgc3VibWVudXMsIHBhbmVscywgYW5kIHBhZ2VzLlxuLy8gTGlrZSB0aGlzOlxuLy8gLS0tLi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0uLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLi0tLVxuLy8gICAgfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCAgICAgICAgICAgICAgICAgICAgICB8ICAgICAgICAgICAgICAgICAgICAgICAgfFxuLy8gICAgfCAgU2VsZWN0ZWQgTWFpbiBNZW51IEl0ZW0gICAuLS0tLS0tLS0tLS0uIC4tLS0tLS0tLS0uICAgfCAgQWx0IE1haW4gTWVudSBJdGVtICB8ICBUaGlyZCBNYWluIE1lbnUgSXRlbSAgfFxuLy8gICAgfCAgICAgICAgICAgICAgICAgICAgICAgICAgIC8gIFN1Yml0ZW0gMSAgXFwgU3ViaXRlbSAyIFxcICB8ICAgICAgICAgICAgICAgICAgICAgIHwgICAgICAgICAgICAgICAgICAgICAgICB8XG4vLyAtLS0nLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0nICAgICAgICAgICAgICAgJy0tLS0tLS0tLS0tLS0nLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSctLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0nLS0tXG4vLyAgICAgICB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbi8vICAgICAgIHwgICBQYW5lbCBmb3IgU3ViaXRlbSAxLCB0aGlzIGlzIFBhZ2UgMSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuLy8gICAgICAgfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4vLyAgICAgICB8ICAgRWFjaCBQYW5lbCBjYW4gaGF2ZSBtdWx0aXBsZSBwYWdlcywgb25lIHBhZ2Ugc2hvd2luZyBhdCBhIHRpbWUuICBCdXR0b25zIG9uIHBhZ2VzIHN3aXRjaCAgICAgIHxcbi8vICAgICAgIHwgICBiZXR3ZWVuIHBhZ2VzLiAgUGFuZWwgaGVpZ2h0IGFkanVzdHMgdG8gdGhlIGhlaWdodCBvZiB0aGUgcGFnZS4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuLy8gICAgICAgfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4vLyAgICAgICB8ICAgWyBzZWUgcGFnZSAyIF0gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbi8vICAgICAgIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuLy8gICAgICAgJy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0nXG4vL1xuLy8gLSBtZW51cyBhcmUgYWx3YXlzIDx1bD4gdGFnczsgZWFjaCA8bGk+IGlzIGEgbWVudSBpdGVtXG4vLyAtIGEgbWFpbiBtZW51IDxsaT4gbXVzdCBjb250YWluIGFuIDxhPiB0YWcgYW5kIG1heSBhbHNvIGNvbnRhaW4gYSA8dWw+IHN1Ym1lbnVcbi8vIC0gYSBzdWJtZW51IDxsaT4gbXVzdCBjb250YWluIGFuIDxhPiB0YWcgd2l0aCBhIGRhdGEtdGFyZ2V0cGFuZWwgYXR0cmlidXRlIHNldFxuLy8gLSBUaGVyZSBpcyBhbHdheXMgYSBzaW5nbGUgc2VsZWN0ZWQgbWFpbiBtZW51IGl0ZW1cbi8vIC0gQSBtYWluIG1lbnUgaXRlbSBtYXkgZWl0aGVyIGxpbmsgdG8gYW5vdGhlciB3ZWJwYWdlLCBvciBoYXZlIGEgc3VibWVudVxuLy8gLSBTZWxlY3RpbmcgYSBtYWluIG1lbnUgaXRlbSB3aWxsIHNob3cgaXRzIHN1Ym1lbnUsIGlmIGl0IGhhcyBvbmVcbi8vIC0gQSBzdWJtZW51IGFsd2F5cyBoYXMgYSBzaW5nbGUgaXRlbSBzZWxlY3RlZFxuLy8gLSBDbGlja2luZyBhbiBpbmFjdGl2ZSBzdWJtZW51IGl0ZW0gd2lsbCBzaG93IGl0cyBwYW5lbFxuLy8gLSBDbGlja2luZyBhIHNlbGVjdGVkIHN1Ym1lbnUgaXRlbSB3aWxsIHRvZ2dsZSBpdHMgcGFuZWwgc2hvd2luZyA8LT4gaGlkaW5nICgoKCBOQjogbm90IHlldCBpbXBsZW1lbnRlZCApKSlcbi8vIC0gQSBwYW5lbCBpbml0aWFsbHkgc2hvd3MgaXRzIGZpcnN0IHBhZ2Vcbi8vIC0gU3dpdGNoaW5nIHBhZ2VzIGluIGEgcGFuZWwgY2hhbmdlcyB0aGUgcGFuZWwgaGVpZ2h0IHRvIHN1aXQgaXRzIGN1cnJlbnQgcGFnZVxuLy8gLSBBIHBhbmVsIGlzIGEgSFRNTCBibG9jayBlbGVtZW50IHdpdGggdGhlIGNsYXNzIC5tc3BwLXBhbmVsIChjYW4gYmUgb3ZlcnJpZGRlbiB2aWEgb3B0aW9uKVxuLy8gLSBJZiBhIHBhbmVsIGNvbnRhaW5zIHBhZ2VzLCBvbmUgcGFnZSBzaG91bGQgaGF2ZSB0aGUgY2xhc3MgLmN1cnJlbnQgKGNhbiBiZSBvdmVycmlkZGVuIHZpYSBvcHRpb24pXG4vLyAtIEEgcGFnZSBpcyBhIEhUTUwgYmxvY2sgZWxlbWVudCB3aXRoIHRoZSBjbGFzcyAubXNwcC1wYWdlIChjYW4gYmUgb3ZlcnJpZGRlbiB2aWEgb3B0aW9uKVxuLy8gLSA8YnV0dG9uPiBvciA8YT4gdGFncyBpbiBwYWdlcyB0aGF0IGhhdmUgYSBkYXRhLXRhcmdldHBhZ2UgYXR0cmlidXRlIHNldCB3aWxsIHN3aXRjaCB0byB0aGUgaW5kaWNhdGVkIHBhZ2Vcbi8vXG4vL1xuLy8gVGhlIEhUTUwgc2hvdWxkIGxvb2sgbGlrZSB0aGlzOlxuLy9cbi8vICA8dWwgY2xhc3M9XCJtZW51XCI+ICAgICAgICAgICAgICAgICAgIDwhLS0gdGhpcyBpcyB0aGUgbWFpbiBtZW51IC0tPlxuLy8gICAgICA8bGkgY2xhc3M9XCJjdXJyZW50XCI+ICAgICAgICAgICAgPCEtLSB0aGlzIGlzIGEgbWFpbiBtZW51IGl0ZW0sIGN1cnJlbnRseSBzZWxlY3RlZCAtLT5cbi8vICAgICAgICAgIDxhPkZpcnN0IEl0ZW08L2E+ICAgICAgICAgICA8IS0tIHRoZSBmaXJzdCBpdGVtIGluIHRoZSBtYWluIG1lbnUgLS0+XG4vLyAgICAgICAgICA8dWw+ICAgICAgICAgICAgICAgICAgICAgICAgPCEtLSBhIHN1Ym1lbnUgaW4gdGhlIGZpcnN0IG1haW4gbWVudSBpdGVtIC0tPlxuLy8gICAgICAgICAgICAgIDxsaSBjbGFzcz1cImN1cnJlbnRcIj4gICAgPCEtLSB0aGUgY3VycmVudGx5IHNlbGVjdGVkIHN1Ym1lbnUgaXRlbSAtLT5cbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8IS0tIC5wYW5lbHRyaWdnZXIgYW5kIHRoZSBkYXRhLXBhbmVsaWQgYXR0cmlidXRlIGFyZSByZXF1aXJlZCAtLT5cbi8vICAgICAgICAgICAgICAgICAgPGEgZGF0YS10YXJnZXRwYW5lbD1cInBhbmVsMVwiPmRvIHRoZSBwYW5lbDEgdGhpbmc8L2E+XG4vLyAgICAgICAgICAgICAgPC9saT5cbi8vICAgICAgICAgICAgICA8bGk+Li4uPC9saT4gICAgICAgICAgICA8IS0tIGFub3RoZXIgc3VibWVudSBpdGVtIC0tPlxuLy8gICAgICAgICAgPC91bD5cbi8vICAgICAgPC9saT5cbi8vICAgICAgPGxpPiA8YSBocmVmPVwiYW5vdGhlcl9wYWdlLmh0bWxcIj5hbm90aGVyIHBhZ2U8L2E+IDwvbGk+XG4vLyAgICAgIDxsaT4gPGE+d2hhdGV2ZXI8L2E+IDwvbGk+XG4vLyAgPC91bD5cbi8vXG4vLyAgPGRpdiBpZD1cInBhbmVsMVwiIGNsYXNzPVwibXNwcC1wYW5lbFwiPlxuLy8gICAgICA8ZGl2IGlkPVwicGFnZTExXCIgY2xhc3M9XCJtc3BwLXBhZ2UgY3VycmVudFwiPlxuLy8gICAgICAgICAgVGhpcyBpcyB0aGUgY3VycmVudCBwYWdlIG9uIHBhbmVsIDEuXG4vLyAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBkYXRhLXRhcmdldHBhZ2U9XCJwYWdlMTJcIj5zaG93IHBhZ2UgMjwvYnV0dG9uPlxuLy8gICAgICA8L2Rpdj5cbi8vICAgICAgPGRpdiBpZD1cInBhZ2UxMlwiIGNsYXNzPVwibXNwcC1wYWdlXCI+XG4vLyAgICAgICAgICBUaGlzIGlzIHRoZSBvdGhlciBwYWdlIG9uIHBhbmVsIDEuXG4vLyAgICAgICAgICA8YSBkYXRhLXRhcmdldHBhZ2U9XCJwYWdlMTFcIj5zZWUgdGhlIGZpcnN0IHBhZ2UgYWdhaW48L2E+XG4vLyAgICAgIDwvZGl2PlxuLy8gIDwvZGl2PlxuLy8gIDxkaXYgaWQ9XCJwYW5lbDJcIiBjbGFzcz1cIm1zcHAtcGFuZWxcIj5cbi8vICAgICAgPGRpdiBpZD1cInBhZ2UyMVwiIGNsYXNzPVwibXNwcC1wYWdlIGN1cnJlbnRcIj5cbi8vICAgICAgICAgIFRoaXMgaXMgdGhlIGN1cnJlbnQgcGFnZSBvbiBwYW5lbCAyLlxuLy8gICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgZGF0YS10YXJnZXRwYWdlPVwicGFnZTIyXCI+c2hvdyBwYWdlIDI8L2J1dHRvbj5cbi8vICAgICAgPC9kaXY+XG4vLyAgICAgIDxkaXYgaWQ9XCJwYWdlMjJcIiBjbGFzcz1cIm1zcHAtcGFnZVwiPlxuLy8gICAgICAgICAgVGhpcyBpcyB0aGUgb3RoZXIgcGFnZSBvbiBwYW5lbCAyLlxuLy8gICAgICAgICAgPGEgZGF0YS10YXJnZXRwYWdlPVwicGFnZTIxXCI+c2VlIHRoZSBmaXJzdCBwYWdlIGFnYWluPC9hPlxuLy8gICAgICA8L2Rpdj5cbi8vICA8L2Rpdj5cblxuXG47KCBmdW5jdGlvbigkLCB3aW5kb3csIGRvY3VtZW50LCB1bmRlZmluZWQpIHtcblxuICAgIC8vIG5hbWVzcGFjZSBjbGltYXMsIHdpZGdldCBuYW1lIG1zcHBcbiAgICAvLyBzZWNvbmQgYXJnIGlzIHVzZWQgYXMgdGhlIHdpZGdldCdzIFwicHJvdG90eXBlXCIgb2JqZWN0XG4gICAgJC53aWRnZXQoIFwiY2xpbWFzLm1zcHBcIiAsIHtcblxuICAgICAgICAvL09wdGlvbnMgdG8gYmUgdXNlZCBhcyBkZWZhdWx0c1xuICAgICAgICBvcHRpb25zOiB7XG4gICAgICAgICAgICBhbmltYXRpb25GYWN0b3I6IDIsXG5cbiAgICAgICAgICAgIG1haW5NZW51Q2xhc3M6ICdtc3BwLW1haW4tbWVudScsXG5cbiAgICAgICAgICAgIHBhbmVsQ2xhc3M6ICdtc3BwLXBhbmVsJyxcbiAgICAgICAgICAgIHBhZ2VDbGFzczogJ21zcHAtcGFnZScsXG5cbiAgICAgICAgICAgIGNsZWFyZml4Q2xhc3M6ICdtc3BwLWNsZWFyZml4JyxcbiAgICAgICAgICAgIGFjdGl2ZUNsYXNzOiAnY3VycmVudCdcbiAgICAgICAgfSxcbiAgICAgICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICAvL1NldHVwIHdpZGdldCAoZWcuIGVsZW1lbnQgY3JlYXRpb24sIGFwcGx5IHRoZW1pbmdcbiAgICAgICAgLy8gLCBiaW5kIGV2ZW50cyBldGMuKVxuICAgICAgICBfY3JlYXRlOiBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgdmFyIGJhc2UgPSB0aGlzO1xuICAgICAgICAgICAgdmFyIG9wdHMgPSB0aGlzLm9wdGlvbnM7XG5cbiAgICAgICAgICAgIC8vIHBvcHVsYXRlIHNvbWUgY29udmVuaWVuY2UgdmFyaWFibGVzXG4gICAgICAgICAgICB2YXIgJG1lbnUgPSB0aGlzLmVsZW1lbnQ7XG4gICAgICAgICAgICB0aGlzLm1haW5NZW51SXRlbXMgPSAkbWVudS5jaGlsZHJlbignbGknKTtcbiAgICAgICAgICAgIHRoaXMucGFuZWxzID0gJCgnLicgKyBvcHRzLnBhbmVsQ2xhc3MpO1xuXG4gICAgICAgICAgICAvLyBkaXNhcHBlYXIgd2hpbGUgd2Ugc29ydCB0aGluZ3Mgb3V0XG4gICAgICAgICAgICAkbWVudS5jc3MoeyBvcGFjaXR5OiAwIH0pO1xuICAgICAgICAgICAgdGhpcy5wYW5lbHMuY3NzKHsgb3BhY2l0eTogMCB9KTtcblxuICAgICAgICAgICAgLy8gbWFrZSBzb21lIERPTSBtb2RzXG4gICAgICAgICAgICAkbWVudS5hZGRDbGFzcyhvcHRzLm1haW5NZW51Q2xhc3MpO1xuICAgICAgICAgICAgJG1lbnUuYWRkQ2xhc3Mob3B0cy5jbGVhcmZpeENsYXNzKTtcbiAgICAgICAgICAgIHRoaXMucGFuZWxzLmFkZENsYXNzKG9wdHMuY2xlYXJmaXhDbGFzcyk7XG5cbiAgICAgICAgICAgIC8vIGxheW91dCB0aGUgbWVudVxuICAgICAgICAgICAgdGhpcy5fbGF5b3V0TWVudSgpO1xuXG4gICAgICAgICAgICAvLyBsYXlvdXQgdGhlIHBhbmVsc1xuICAgICAgICAgICAgdGhpcy5fbGF5b3V0UGFuZWxzKCk7XG5cbiAgICAgICAgICAgIC8vIGhvb2sgdXAgY2xpY2sgaGFuZGxpbmcgZXRjXG4gICAgICAgICAgICAkbWVudS5vbignbXNwcHNob3dtZW51JywgdGhpcy5fc2hvd01lbnUpO1xuICAgICAgICAgICAgJG1lbnUub24oJ21zcHBzaG93c3VibWVudScsIHRoaXMuX3Nob3dTdWJNZW51KTtcbiAgICAgICAgICAgICRtZW51Lm9uKCdtc3Bwc2hvd3BhbmVsJywgdGhpcy5fc2hvd1BhbmVsKTtcbiAgICAgICAgICAgICRtZW51Lm9uKCdtc3Bwc2hvd3BhZ2UnLCB0aGlzLl9zaG93UGFnZSk7XG5cbiAgICAgICAgICAgIC8vIGF0dGFjaCBoYW5kbGVycyB0byB0aGUgbWVudS10cmlnZ2Vyc1xuICAgICAgICAgICAgdGhpcy5tYWluTWVudUl0ZW1zLmVhY2goIGZ1bmN0aW9uKGluZGV4LCBpdGVtKSB7XG4gICAgICAgICAgICAgICAgLy8gdGhlIGxpIG1lbnUgaXRlbSBoYXMgYSBjaGlsZCBhIHRoYXQgaXMgaXQncyB0cmlnZ2VyXG4gICAgICAgICAgICAgICAgJChpdGVtKS5jaGlsZHJlbignYScpLmNsaWNrKCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgICAgICAgICBiYXNlLl90cmlnZ2VyKCdzaG93bWVudScsIGV2ZW50LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtZW51aXRlbTogaXRlbSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpZGdldDogYmFzZVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAvLyBhdHRhY2ggaGFuZGxlcnMgdG8gdGhlIHN1Ym1lbnUgaXRlbXNcbiAgICAgICAgICAgICAgICAkKGl0ZW0pLmZpbmQoJ2xpJykuZWFjaCggZnVuY3Rpb24oaW5kZXgsIHN1Yk1lbnVJdGVtKSB7XG4gICAgICAgICAgICAgICAgICAgICQoc3ViTWVudUl0ZW0pLmZpbmQoJ2EnKS5jbGljayggZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhc2UuX3RyaWdnZXIoJ3Nob3dzdWJtZW51JywgZXZlbnQsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZW51aXRlbTogaXRlbSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWJtZW51aXRlbTogc3ViTWVudUl0ZW0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2lkZ2V0OiBiYXNlXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gYXR0YWNoIGhhbmRsZXJzIHRvIHRoZSBwYW5lbCB0cmlnZ2Vyc1xuICAgICAgICAgICAgJG1lbnUuZmluZCgnW2RhdGEtdGFyZ2V0cGFuZWxdJykuZWFjaCggZnVuY3Rpb24oaW5kZXgsIHRyaWdnZXIpIHtcbiAgICAgICAgICAgICAgICB2YXIgJHRyaWdnZXIgPSQodHJpZ2dlcik7XG4gICAgICAgICAgICAgICAgJHRyaWdnZXIuY2xpY2soIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIGJhc2UuX3RyaWdnZXIoJ3Nob3dwYW5lbCcsIGV2ZW50LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYW5lbDogJCgnIycgKyAkdHJpZ2dlci5kYXRhKCd0YXJnZXRwYW5lbCcpKS5maXJzdCgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgd2lkZ2V0OiBiYXNlXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIGF0dGFjaCBoYW5kbGVycyB0byB0aGUgcGFnZSBzd2l0Y2hlcnNcbiAgICAgICAgICAgIHRoaXMucGFuZWxzLmVhY2goIGZ1bmN0aW9uKGluZGV4LCBwYW5lbCkge1xuICAgICAgICAgICAgICAgIHZhciAkcGFuZWwgPSAkKHBhbmVsKTtcbiAgICAgICAgICAgICAgICAkcGFuZWwuZmluZCgnW2RhdGEtdGFyZ2V0cGFnZV0nKS5jbGljayggZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgYmFzZS5fdHJpZ2dlcignc2hvd3BhZ2UnLCBldmVudCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgcGFuZWw6ICRwYW5lbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhZ2U6ICQoJyMnICsgJCh0aGlzKS5kYXRhKCd0YXJnZXRwYWdlJykpLFxuICAgICAgICAgICAgICAgICAgICAgICAgd2lkZ2V0OiBiYXNlXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIGFjdGl2YXRlIHRoZSBjdXJyZW50IG1lbnVzLCBwYW5lbHMgZXRjXG4gICAgICAgICAgICB2YXIgJGN1cnJlbnRNYWluID0gdGhpcy5tYWluTWVudUl0ZW1zLmZpbHRlcignLicgKyBvcHRzLmFjdGl2ZUNsYXNzKTtcbiAgICAgICAgICAgICRjdXJyZW50TWFpbi5yZW1vdmVDbGFzcyhvcHRzLmFjdGl2ZUNsYXNzKS5jaGlsZHJlbignYScpLmNsaWNrKCk7XG5cbiAgICAgICAgICAgIC8vIGZpbmFsbHksIGZhZGUgYmFjayBpblxuICAgICAgICAgICAgJG1lbnUuYW5pbWF0ZSh7IG9wYWNpdHk6IDEgfSwgJ2Zhc3QnKTtcblxuICAgICAgICAgICAgLy8gcGFuZWxzIHN0YXkgaW52aXNpYmxlXG4gICAgICAgIH0sXG4gICAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgICAgX3N3aXRjaENsYXNzT3B0aW9uOiBmdW5jdGlvbihjbGFzc05hbWUsIG5ld0NsYXNzKSB7XG4gICAgICAgICAgICB2YXIgb2xkQ2xhc3MgPSB0aGlzLm9wdGlvbnNbY2xhc3NOYW1lXTtcbiAgICAgICAgICAgIGlmIChvbGRDbGFzcyAhPT0gbmV3Q2xhc3MpIHtcbiAgICAgICAgICAgICAgICB2YXIgZ3JvdXAgPSB0aGlzLmVsZW1lbnQuZmluZCgnLicgKyBvbGRDbGFzcyk7XG4gICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zW2NsYXNzTmFtZV0gPSBuZXdDbGFzcztcbiAgICAgICAgICAgICAgICBncm91cC5yZW1vdmVDbGFzcyhvbGRDbGFzcyk7XG4gICAgICAgICAgICAgICAgZ3JvdXAuYWRkQ2xhc3MobmV3Q2xhc3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgIC8vIFJlc3BvbmQgdG8gYW55IGNoYW5nZXMgdGhlIHVzZXIgbWFrZXMgdG8gdGhlXG4gICAgICAgIC8vIG9wdGlvbiBtZXRob2RcbiAgICAgICAgX3NldE9wdGlvbjogZnVuY3Rpb24oa2V5LCB2YWx1ZSkge1xuICAgICAgICAgICAgc3dpdGNoIChrZXkpIHtcbiAgICAgICAgICAgICAgICBjYXNlIFwibWFpbk1lbnVDbGFzc1wiOlxuICAgICAgICAgICAgICAgIGNhc2UgXCJjbGVhcmZpeENsYXNzXCI6XG4gICAgICAgICAgICAgICAgY2FzZSBcImFjdGl2ZUNsYXNzXCI6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3N3aXRjaENsYXNzT3B0aW9uKGtleSwgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMub3B0aW9uc1trZXldID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIC8vIGl0J3Mgb2theSB0aGF0IHRoZXJlJ3Mgbm8gfSBoZXJlXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyByZW1lbWJlciB0byBjYWxsIG91ciBzdXBlcidzIF9zZXRPcHRpb24gbWV0aG9kXG4gICAgICAgICAgICB0aGlzLl9zdXBlciggXCJfc2V0T3B0aW9uXCIsIGtleSwgdmFsdWUgKTtcbiAgICAgICAgfSxcbiAgICAgICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICAvLyBEZXN0cm95IGFuIGluc3RhbnRpYXRlZCBwbHVnaW4gYW5kIGNsZWFuIHVwXG4gICAgICAgIC8vIG1vZGlmaWNhdGlvbnMgdGhlIHdpZGdldCBoYXMgbWFkZSB0byB0aGUgRE9NXG4gICAgICAgIF9kZXN0cm95OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5yZW1vdmVDbGFzcyh0aGlzLm9wdGlvbnMubWFpbk1lbnVDbGFzcyk7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQucmVtb3ZlQ2xhc3ModGhpcy5vcHRpb25zLmNsZWFyZml4Q2xhc3MpO1xuICAgICAgICAgICAgdGhpcy5wYW5lbHMucmVtb3ZlQ2xhc3ModGhpcy5vcHRpb25zLmNsZWFyZml4Q2xhc3MpO1xuICAgICAgICB9LFxuICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgIC8vIGRvIHRoZSBsYXlvdXQgY2FsY3VsYXRpb25zXG4gICAgICAgIF9sYXlvdXRNZW51OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIC8vIGdvIHRocm91Z2ggZWFjaCBzdWJtZW51IGFuZCByZWNvcmQgaXRzIHdpZHRoXG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQuZmluZCgndWwnKS5lYWNoKCBmdW5jdGlvbihpbmRleCwgc3ViTWVudSkge1xuICAgICAgICAgICAgICAgIHZhciAkc20gPSAkKHN1Yk1lbnUpO1xuICAgICAgICAgICAgICAgICRzbS5jc3Moe3dpZHRoOiAnYXV0byd9KTtcbiAgICAgICAgICAgICAgICAkc20uZGF0YSgnb3JpZ2luYWxXaWR0aCcsICRzbS53aWR0aCgpKTtcblxuICAgICAgICAgICAgICAgIC8vIGxlYXZlIGVhY2ggc3VibWVudSBoaWRkZW4sIHdpdGggd2lkdGggMFxuICAgICAgICAgICAgICAgICRzbS5jc3MoeyB3aWR0aDogMCwgZGlzcGxheTogJ25vbmUnIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgICAgX3Nob3dNZW51OiBmdW5jdGlvbihldmVudCwgZGF0YSkge1xuICAgICAgICAgICAgdmFyICRpdGVtID0gJChkYXRhLm1lbnVpdGVtKTtcbiAgICAgICAgICAgIHZhciBiYXNlID0gZGF0YS53aWRnZXQ7XG4gICAgICAgICAgICAvLyAkaXRlbSBpcyBhIGNsaWNrZWQtb24gbWVudSBpdGVtLi5cbiAgICAgICAgICAgIGlmICgkaXRlbS5oYXNDbGFzcyhiYXNlLm9wdGlvbnMuYWN0aXZlQ2xhc3MpKSB7XG4gICAgICAgICAgICAgICAgLy8gPz9cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYmFzZS5faGlkZVBhbmVscygpO1xuICAgICAgICAgICAgICAgIGJhc2UubWFpbk1lbnVJdGVtcy5yZW1vdmVDbGFzcyhiYXNlLm9wdGlvbnMuYWN0aXZlQ2xhc3MpO1xuICAgICAgICAgICAgICAgIHZhciAkbmV3U3ViTWVudSA9ICRpdGVtLmZpbmQoJ3VsJyk7XG4gICAgICAgICAgICAgICAgdmFyICRvbGRTdWJNZW51cyA9IGJhc2UuZWxlbWVudC5maW5kKCd1bCcpLm5vdCgkbmV3U3ViTWVudSk7XG4gICAgICAgICAgICAgICAgdmFyIG5ld1dpZHRoID0gJG5ld1N1Yk1lbnUuZGF0YSgnb3JpZ2luYWxXaWR0aCcpO1xuXG4gICAgICAgICAgICAgICAgJG9sZFN1Yk1lbnVzLmFuaW1hdGUoeyB3aWR0aDogMCB9LCAoNTAgKiBiYXNlLm9wdGlvbnMuYW5pbWF0aW9uRmFjdG9yKSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICRvbGRTdWJNZW51cy5jc3MoeyBkaXNwbGF5OiAnbm9uZScgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgJGl0ZW0uYWRkQ2xhc3MoYmFzZS5vcHRpb25zLmFjdGl2ZUNsYXNzKTtcbiAgICAgICAgICAgICAgICAkbmV3U3ViTWVudVxuICAgICAgICAgICAgICAgICAgICAuY3NzKHtkaXNwbGF5OiAnYmxvY2snIH0pXG4gICAgICAgICAgICAgICAgICAgIC5hbmltYXRlKHsgd2lkdGg6IG5ld1dpZHRoIH0sICgxMjUgKiBiYXNlLm9wdGlvbnMuYW5pbWF0aW9uRmFjdG9yKSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkbmV3U3ViTWVudS5jc3MoeyB3aWR0aDogJ2F1dG8nIH0pLnJlbW92ZUF0dHIoJ3N0eWxlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBiYXNlLl90cmlnZ2VyKCdtZW51c2hvd24nLCBldmVudCwgeyBpdGVtOiAkaXRlbSwgd2lkZ2V0OiBiYXNlIH0pO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIDtcbiAgICAgICAgICAgICAgICAvLyBpZiB0aGUgbmV3IHN1Ym1lbnUgaGFzIGFuIGFjdGl2ZSBpdGVtLCBjbGljayBpdFxuICAgICAgICAgICAgICAgICRuZXdTdWJNZW51LmZpbmQoJy4nICsgYmFzZS5vcHRpb25zLmFjdGl2ZUNsYXNzICsgJyBhJykuY2xpY2soKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICBfc2hvd1N1Yk1lbnU6IGZ1bmN0aW9uKGV2ZW50LCBkYXRhKSB7XG4gICAgICAgICAgICAvLyBkZS1hY3RpdmVpZnkgYWxsIHRoZSBzdWJtZW51IGl0ZW1zXG4gICAgICAgICAgICAkKGRhdGEubWVudWl0ZW0pLmZpbmQoJ2xpJykucmVtb3ZlQ2xhc3MoZGF0YS53aWRnZXQub3B0aW9ucy5hY3RpdmVDbGFzcyk7XG4gICAgICAgICAgICAvLyBhY3RpdmUtaWZ5IHRoZSBvbmUgdHJ1ZSBzdWJtZW51IGl0ZW1cbiAgICAgICAgICAgICQoZGF0YS5zdWJtZW51aXRlbSkuYWRkQ2xhc3MoZGF0YS53aWRnZXQub3B0aW9ucy5hY3RpdmVDbGFzcyk7XG4gICAgICAgIH0sXG4gICAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgICAgLy8gZG8gdGhlIGxheW91dCBjYWxjdWxhdGlvbnNcbiAgICAgICAgX2xheW91dFBhbmVsczogZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgIHZhciAkcGFnZXMgPSB0aGlzLnBhbmVscy5maW5kKCcuJyArIHRoaXMub3B0aW9ucy5wYWdlQ2xhc3MpO1xuXG4gICAgICAgICAgICAvLyBnbyB0aHJvdWdoIGVhY2ggcGFnZSBhbmQgcmVjb3JkIGl0cyBoZWlnaHRcbiAgICAgICAgICAgICRwYWdlcy5lYWNoKCBmdW5jdGlvbihpbmRleCwgcGFnZSkge1xuICAgICAgICAgICAgICAgIHZhciAkcGFnZSA9ICQocGFnZSk7XG4gICAgICAgICAgICAgICAgJHBhZ2UuY3NzKHtoZWlnaHQ6ICdhdXRvJ30pO1xuICAgICAgICAgICAgICAgICRwYWdlLmRhdGEoJ29yaWdpbmFsSGVpZ2h0JywgJHBhZ2Uub3V0ZXJIZWlnaHQoKSk7XG5cbiAgICAgICAgICAgICAgICAvLyBsZWF2ZSBlYWNoIHBhZ2UgaGlkZGVuLCB3aXRoIGhlaWdodCAwXG4gICAgICAgICAgICAgICAgJHBhZ2UuY3NzKHsgaGVpZ2h0OiAwLCBkaXNwbGF5OiAnbm9uZScgfSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gZ28gdGhyb3VnaCBlYWNoIHBhbmVsIGFuZCBoaWRlIGl0XG4gICAgICAgICAgICB0aGlzLnBhbmVscy5lYWNoKCBmdW5jdGlvbihpbmRleCwgcGFuZWwpIHtcbiAgICAgICAgICAgICAgICB2YXIgJHBhbmVsID0gJChwYW5lbCk7XG4gICAgICAgICAgICAgICAgJHBhbmVsLmNzcyh7IGRpc3BsYXk6ICdub25lJyB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgIF9oaWRlUGFuZWxzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMucGFuZWxzLnJlbW92ZUNsYXNzKHRoaXMub3B0aW9ucy5hY3RpdmVDbGFzcykuY3NzKHsgZGlzcGxheTogJ25vbmUnLCBoZWlnaHQ6IDAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgICAgX3Nob3dQYW5lbDogZnVuY3Rpb24oZXZlbnQsIGRhdGEpIHtcbiAgICAgICAgICAgIHZhciAkcGFuZWwgPSAkKGRhdGEucGFuZWwpO1xuICAgICAgICAgICAgdmFyIGJhc2UgPSBkYXRhLndpZGdldDtcbiAgICAgICAgICAgIC8vICRwYW5lbCBpcyBhIHBhbmVsIHRvIHNob3cuLlxuICAgICAgICAgICAgaWYgKCRwYW5lbC5oYXNDbGFzcyhiYXNlLm9wdGlvbnMuYWN0aXZlQ2xhc3MpKSB7XG4gICAgICAgICAgICAgICAgLy8gPz9cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYmFzZS5faGlkZVBhbmVscygpO1xuICAgICAgICAgICAgICAgICRwYW5lbC5hZGRDbGFzcyhiYXNlLm9wdGlvbnMuYWN0aXZlQ2xhc3MpO1xuICAgICAgICAgICAgICAgICRwYW5lbC5jc3MoeyBkaXNwbGF5OiAnYmxvY2snLCBvcGFjaXR5OiAxIH0pO1xuICAgICAgICAgICAgICAgIHZhciAkcGFnZSA9ICQoJHBhbmVsLmZpbmQoJy4nICsgYmFzZS5vcHRpb25zLnBhZ2VDbGFzcyArICcuJyArIGJhc2Uub3B0aW9ucy5hY3RpdmVDbGFzcykpO1xuICAgICAgICAgICAgICAgIGJhc2UuX3RyaWdnZXIoJ3Nob3dwYWdlJywgZXZlbnQsIHsgcGFuZWw6ICRwYW5lbCwgcGFnZTogJHBhZ2UsIHdpZGdldDogYmFzZSB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICBfc2hvd1BhZ2U6IGZ1bmN0aW9uKGV2ZW50LCBkYXRhKSB7XG4gICAgICAgICAgICB2YXIgYmFzZSA9IGRhdGEud2lkZ2V0O1xuICAgICAgICAgICAgdmFyICRwYW5lbCA9ICQoZGF0YS5wYW5lbCk7XG4gICAgICAgICAgICB2YXIgJHBhZ2UgPSAkKGRhdGEucGFnZSk7XG4gICAgICAgICAgICB2YXIgbmV3SGVpZ2h0ID0gJHBhZ2UuZGF0YSgnb3JpZ2luYWxIZWlnaHQnKTtcblxuICAgICAgICAgICAgLy8gZml4IHRoZSBwYW5lbCdzIGN1cnJlbnQgaGVpZ2h0XG4gICAgICAgICAgICAkcGFuZWwuY3NzKHtoZWlnaHQ6ICRwYW5lbC5oZWlnaHQoKSB9KTtcblxuICAgICAgICAgICAgLy8gZGVhbCB3aXRoIHRoZSBwYWdlIGN1cnJlbnRseSBiZWluZyBkaXNwbGF5ZWRcbiAgICAgICAgICAgIHZhciAkb2xkUGFnZSA9ICRwYW5lbC5maW5kKCcuJyArIGJhc2Uub3B0aW9ucy5wYWdlQ2xhc3MgKyAnLicgKyBiYXNlLm9wdGlvbnMuYWN0aXZlQ2xhc3MpLm5vdCgkcGFnZSk7XG4gICAgICAgICAgICBpZiAoJG9sZFBhZ2UubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICRvbGRQYWdlLmRhdGEoJ29yaWdpbmFsSGVpZ2h0JywgJG9sZFBhZ2Uub3V0ZXJIZWlnaHQoKSk7XG4gICAgICAgICAgICAgICAgJG9sZFBhZ2UucmVtb3ZlQ2xhc3MoYmFzZS5vcHRpb25zLmFjdGl2ZUNsYXNzKS5mYWRlT3V0KCg1MCAqIGJhc2Uub3B0aW9ucy5hbmltYXRpb25GYWN0b3IpLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgJG9sZFBhZ2UuY3NzKHsgaGVpZ2h0OiAwIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBzd2l0Y2ggb24gdGhlIG5ldyBwYWdlIGFuZCBncm93IHRoZSBvcGFuZWwgdG8gaG9sZCBpdFxuICAgICAgICAgICAgJHBhZ2UuY3NzKHsgaGVpZ2h0OiAnYXV0bycgfSkuYWRkQ2xhc3MoYmFzZS5vcHRpb25zLmFjdGl2ZUNsYXNzKS5mYWRlSW4oKDEwMCAqIGJhc2Uub3B0aW9ucy5hbmltYXRpb25GYWN0b3IpLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAkcGFnZS5yZW1vdmVBdHRyKCdzdHlsZScpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB2YXIgYW5pbVRpbWUgPSAoJG9sZFBhZ2UubGVuZ3RoID4gMCA/ICgxMDAgKiBiYXNlLm9wdGlvbnMuYW5pbWF0aW9uRmFjdG9yKSA6ICgxNTAgKiBiYXNlLm9wdGlvbnMuYW5pbWF0aW9uRmFjdG9yKSk7IC8vIGFuaW1hdGUgZmFzdGVyIGlmIGl0J3Mgc3dpdGNoaW5nIHBhZ2VzXG4gICAgICAgICAgICAkcGFuZWwuYW5pbWF0ZSh7IGhlaWdodDogbmV3SGVpZ2h0IH0sIGFuaW1UaW1lLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAkcGFuZWwucmVtb3ZlQXR0cignc3R5bGUnKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH0sXG4gICAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgICAgXzogbnVsbCAvLyBubyBmb2xsb3dpbmcgY29tbWFcbiAgICB9KTtcblxufSkoalF1ZXJ5LCB3aW5kb3csIGRvY3VtZW50KTtcblxuXG5cblxuXG5cblxuXG5cblxuXG5cbiJdfQ==
