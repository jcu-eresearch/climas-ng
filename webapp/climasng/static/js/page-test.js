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
      this.namesList = [];
      this.speciesSciNameList = [];
      this.speciesInfoFetchProcess = this.fetchSpeciesInfo();
      this.biodivList = [];
      this.biodivLookupList = [];
      this.niceIndex = {};
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
      var atCurrent, currInfo, newInfo, sciNameMatch, sciNameMatcher, _ref, _ref1;
      debug('AppView.sideUpdate (' + side + ')');
      newInfo = {
        speciesName: this.$('#' + side + 'mapspp').val(),
        niceName: this.$('#' + side + 'mapspp').val(),
        degs: this.$('#' + side + 'mapdegs').val(),
        range: this.$('input[name=' + side + 'maprange]:checked').val(),
        confidence: this.$('#' + side + 'mapconfidence').val()
      };
      atCurrent = newInfo.degs === 'current';
      this.$("input[name=" + side + "maprange], #" + side + "mapconfidence").prop('disabled', atCurrent);
      this.$("." + side + ".side.form fieldset").removeClass('disabled');
      this.$("input[name^=" + side + "]:disabled, [id^=" + side + "]:disabled").closest('fieldset').addClass('disabled');
      if (side === 'right' && newInfo.niceName) {
        console.log('starting spp is |' + newInfo.niceName + '|');
        sciNameMatcher = /.*\((.+)\)$/;
        sciNameMatch = sciNameMatcher.exec(newInfo.niceName);
        if (sciNameMatch && sciNameMatch[1]) {
          console.log('regexed spp is ' + '|' + sciNameMatch[1] + '|');
          newInfo.speciesName = sciNameMatch[1];
        }
      }
      if ((_ref = newInfo.speciesName, __indexOf.call(this.namesList, _ref) >= 0) || (_ref1 = newInfo.niceName, __indexOf.call(this.niceIndex, _ref1) >= 0)) {
        this.$("." + side + "-valid-map").removeClass('disabled').prop('disabled', false);
      } else {
        this.$("." + side + "-valid-map").addClass('disabled').prop('disabled', true);
        return false;
      }
      currInfo = side === 'left' ? this.leftInfo : this.rightInfo;
      if (currInfo && _.isEqual(newInfo, currInfo)) {
        return false;
      }
      if (currInfo && newInfo.speciesName === currInfo.speciesName && newInfo.degs === currInfo.degs && newInfo.degs === 'current') {
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
      tag = "<b><i>" + info.speciesName + "</i></b>";
      dispLookup = {
        '0disp': 'no range adaptation',
        '50disp': '50 years of range adaptation',
        '100disp': '100 years of range adaptation'
      };
      if (info.degs === 'current') {
        tag = "current " + tag + " distribution";
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
      var ext, futureModelPoint, info, isBiodiversity, layer, loadClass, mapUrl, sideInfo, sppFileName, url, val, zipUrl, _ref;
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
      } else {
        sppFileName = ['TEMP', sideInfo.degs, sideInfo.confidence + '.' + sideInfo.range].join('_');
        if (sideInfo.degs === 'current') {
          sppFileName = 'current';
        }
        mapUrl = [
          this.resolvePlaceholders(this.speciesDataUrl, {
            path: this.speciesUrls[sideInfo.speciesName]
          }), sppFileName + '.tif'
        ].join('/');
        if (side === 'right') {
          info = this.mapList[this.niceIndex[sideInfo.niceName]];
          if (info) {
            url = this.speciesDataUrl;
            ext = '.tif';
            if (info.type === 'climate') {
              url = this.climateDataUrl;
              ext = '.asc';
            }
            mapUrl = [
              this.resolvePlaceholders(url, {
                path: info.path
              }), sppFileName + ext
            ].join('/');
          } else {
            console.log('Index misalignment -- let me know what you were looking for, daniel@danielbaird.com');
          }
        }
        this.$('#' + side + 'mapdl').attr('href', mapUrl);
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
      if (window.location.hostname === 'localhost') {
        console.log('map URL is: ', mapUrl);
      }
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
      debug('AppView.fetchSpeciesInfo');
      return $.ajax({
        url: '/data/species',
        dataType: 'json'
      }).done((function(_this) {
        return function(data) {
          var commonNameWriter, speciesLookupList, speciesSciNameList, speciesUrls;
          speciesLookupList = [];
          speciesSciNameList = [];
          speciesUrls = {};
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
            speciesUrls[sciName] = sppInfo.path;
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
          return _this.speciesUrls = speciesUrls;
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
            close: function() {
              return _this.$el.trigger('rightmapupdate');
            },
            source: function(req, response) {
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
                    _this.niceIndex[nice] = info.mapId;
                  }
                  console.log(answer);
                  console.log(selectable);
                  return response(selectable);
                }
              });
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
      layout: _.template("<div clas=\"ui-front\"></div>\n<div class=\"splitline\">&nbsp;</div>\n<div class=\"splitthumb\"><span>&#x276e; &#x276f;</span></div>\n<div class=\"left tag\"><%= leftTag %></div>\n<div class=\"right tag\"><%= rightTag %></div>\n<div class=\"left side form\"><%= leftForm %></div>\n<div class=\"right side form\"><%= rightForm %></div>\n<div class=\"left loader\"><img src=\"/static/images/spinner.loadinfo.net.gif\" /></div>\n<div class=\"right loader\"><img src=\"/static/images/spinner.loadinfo.net.gif\" /></div>\n<div id=\"mapwrapper\"><div id=\"map\"></div></div>"),
      leftTag: _.template("<div class=\"show\">\n    <span class=\"leftlayername\">plain map</span>\n    <br>\n    <button class=\"btn-change\">settings</button>\n    <button class=\"btn-compare\">show/hide comparison map</button>\n</div>\n<div class=\"edit\">\n    <label class=\"left syncbox\"></label>\n    <input id=\"leftmapspp\" class=\"left\" type=\"text\" name=\"leftmapspp\" placeholder=\"&hellip; species or group &hellip;\" />\n</div>"),
      rightTag: _.template("<div class=\"show\">\n    <span class=\"rightlayername\">(no distribution)</span>\n    <br>\n    <button class=\"btn-change\">settings</button>\n    <button class=\"btn-compare\">show/hide comparison map</button>\n</div>\n<div class=\"edit\">\n    <label class=\"right syncbox\"><input id=\"sync\" type=\"checkbox\" value=\"sync\" checked=\"checked\" /> same as left side</label>\n    <input id=\"rightmapspp\" type=\"text\" class=\"right\" name=\"rightmapspp\" placeholder=\"&hellip; species or group &hellip;\" />\n</div>"),
      leftForm: _.template("<fieldset>\n    <legend>temperature change</legend>\n    <select class=\"left\" id=\"leftmapdegs\">\n        <option value=\"current\">current</option>\n        <option value=\"1.5\">1.5 &deg;C</option>\n        <option value=\"2\">2.0 &deg;C</option>\n        <option value=\"2.7\">2.7 &deg;C</option>\n        <option value=\"3.2\">3.2 &deg;C</option>\n        <option value=\"4.5\">4.5 &deg;C</option>\n        <optgroup label=\"High sensitivity climate\">\n            <option value=\"6\">6.0 &deg;C</option>\n        </optgroup>\n    </select>\n</fieldset>\n<fieldset>\n    <legend>adaptation via range shift</legend>\n    <label><!-- span>none</span --> <input name=\"leftmaprange\" class=\"left\" type=\"radio\" value=\"no.disp\" checked=\"checked\"> species cannot shift ranges</label>\n    <label><!-- span>allow</span --> <input name=\"leftmaprange\" class=\"left\" type=\"radio\" value=\"real.disp\"> allow range adaptation</label>\n</fieldset>\n<fieldset>\n    <legend>model summary</legend>\n    <select class=\"left\" id=\"leftmapconfidence\">\n        <option value=\"10\">10th percentile</option>\n        <!-- option value=\"33\">33rd percentile</option -->\n        <option value=\"50\" selected=\"selected\">50th percentile</option>\n        <!-- option value=\"66\">66th percentile</option -->\n        <option value=\"90\">90th percentile</option>\n    </select>\n</fieldset>\n<fieldset class=\"blank\">\n    <button type=\"button\" class=\"btn-change\">hide settings</button>\n    <button type=\"button\" class=\"btn-compare\">hide/show right map</button>\n    <button type=\"button\" class=\"btn-copy right-valid-map\">copy right map &laquo;</button>\n    <a id=\"leftmapdl\" class=\"download left-valid-map\" href=\"\" disabled=\"disabled\">download just this map<br>(<1Mb GeoTIFF)</a>\n</fieldset>\n"),
      rightForm: _.template("<fieldset>\n    <legend>temperature change</legend>\n    <select class=\"right\" id=\"rightmapdegs\">\n        <option value=\"current\">current</option>\n        <option value=\"1.5\">1.5 &deg;C</option>\n        <option value=\"2\">2.0 &deg;C</option>\n        <option value=\"2.7\">2.7 &deg;C</option>\n        <option value=\"3.2\">3.2 &deg;C</option>\n        <option value=\"4.5\">4.5 &deg;C</option>\n        <optgroup label=\"High sensitivity climate\">\n            <option value=\"6\">6.0 &deg;C</option>\n        </optgroup>\n    </select>\n</fieldset>\n<fieldset>\n    <legend>adaptation via range shift</legend>\n    <label><!-- span>none</span --> <input name=\"rightmaprange\" class=\"right\" type=\"radio\" value=\"no.disp\" checked=\"checked\"> species cannot shift ranges</label>\n    <label><!-- span>allow</span --> <input name=\"rightmaprange\" class=\"right\" type=\"radio\" value=\"real.disp\"> allow range adaptation</label>\n</fieldset>\n<fieldset>\n    <legend>model summary</legend>\n    <select class=\"right\" id=\"rightmapconfidence\">\n        <option value=\"10\">10th percentile</option>\n        <!-- option value=\"33\">33rd percentile</option -->\n        <option value=\"50\" selected=\"selected\">50th percentile</option>\n        <!-- option value=\"66\">66th percentile</option -->\n        <option value=\"90\">90th percentile</option>\n    </select>\n</fieldset>\n<fieldset class=\"blank\">\n    <button type=\"button\" class=\"btn-change\">hide settings</button>\n    <button type=\"button\" class=\"btn-compare\">hide/show right map</button>\n    <button type=\"button\" class=\"btn-copy left-valid-map\">copy left map &laquo;</button>\n    <a id=\"rightmapdl\" class=\"download right-valid-map\" href=\"\" disabled=\"disabled\">download just this map<br>(<1Mb GeoTIFF)</a>\n</fieldset>\n")
    }
  });

  module.exports = AppView;

}).call(this);

},{"../models/maplayer":3,"../util/shims":4}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9wdnJkd2IvcHJvamVjdHMvY2xpbWFzLWdsb2JhbC93ZWJhcHAvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi9Vc2Vycy9wdnJkd2IvcHJvamVjdHMvY2xpbWFzLWdsb2JhbC93ZWJhcHAvY2xpbWFzbmcvc3JjL2pzL2Zha2VfMTI1MDY5ZGYuanMiLCIvVXNlcnMvcHZyZHdiL3Byb2plY3RzL2NsaW1hcy1nbG9iYWwvd2ViYXBwL2NsaW1hc25nL3NyYy9qcy9tYXB2aWV3L21haW4uanMiLCIvVXNlcnMvcHZyZHdiL3Byb2plY3RzL2NsaW1hcy1nbG9iYWwvd2ViYXBwL2NsaW1hc25nL3NyYy9qcy9tYXB2aWV3L21vZGVscy9tYXBsYXllci5qcyIsIi9Vc2Vycy9wdnJkd2IvcHJvamVjdHMvY2xpbWFzLWdsb2JhbC93ZWJhcHAvY2xpbWFzbmcvc3JjL2pzL21hcHZpZXcvdXRpbC9zaGltcy5qcyIsIi9Vc2Vycy9wdnJkd2IvcHJvamVjdHMvY2xpbWFzLWdsb2JhbC93ZWJhcHAvY2xpbWFzbmcvc3JjL2pzL21hcHZpZXcvdmlld3MvYXBwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXG5yZXF1aXJlKCcuL21hcHZpZXcvbWFpbicpO1xuXG4kKCdoZWFkZXInKS5kaXNhYmxlU2VsZWN0aW9uKCk7IC8vIHVucG9wdWxhciBidXQgc3RpbGwgYmV0dGVyXG4kKCduYXYgPiB1bCcpLm1zcHAoe30pO1xuIiwiKGZ1bmN0aW9uKCkge1xuICB2YXIgQXBwVmlldztcblxuICBpZiAoIXdpbmRvdy5jb25zb2xlKSB7XG4gICAgd2luZG93LmNvbnNvbGUgPSB7XG4gICAgICBsb2c6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4ge307XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIEFwcFZpZXcgPSByZXF1aXJlKCcuL3ZpZXdzL2FwcCcpO1xuXG4gICQoZnVuY3Rpb24oKSB7XG4gICAgdmFyIGFwcHZpZXc7XG4gICAgYXBwdmlldyA9IG5ldyBBcHBWaWV3KCk7XG4gICAgcmV0dXJuIGFwcHZpZXcucmVuZGVyKCk7XG4gIH0pO1xuXG59KS5jYWxsKHRoaXMpO1xuIiwiKGZ1bmN0aW9uKCkge1xuICB2YXIgTWFwTGF5ZXI7XG5cbiAgTWFwTGF5ZXIgPSBCYWNrYm9uZS5Nb2RlbC5leHRlbmQoe1xuICAgIGNvbnN0cnVjdG9yOiBmdW5jdGlvbihzaG9ydE5hbWUsIGxvbmdOYW1lLCBwYXRoKSB7XG4gICAgICB0aGlzLnNob3J0TmFtZSA9IHNob3J0TmFtZTtcbiAgICAgIHRoaXMubG9uZ05hbWUgPSBsb25nTmFtZTtcbiAgICAgIHRoaXMucGF0aCA9IHBhdGg7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH0pO1xuXG4gIG1vZHVsZS5leHBvcnRzID0gTWFwTGF5ZXI7XG5cbn0pLmNhbGwodGhpcyk7XG4iLCIoZnVuY3Rpb24oKSB7XG4gIHZhciBfX2luZGV4T2YgPSBbXS5pbmRleE9mIHx8IGZ1bmN0aW9uKGl0ZW0pIHsgZm9yICh2YXIgaSA9IDAsIGwgPSB0aGlzLmxlbmd0aDsgaSA8IGw7IGkrKykgeyBpZiAoaSBpbiB0aGlzICYmIHRoaXNbaV0gPT09IGl0ZW0pIHJldHVybiBpOyB9IHJldHVybiAtMTsgfTtcblxuICBpZiAoIUFycmF5LnByb3RvdHlwZS5mb3JFYWNoKSB7XG4gICAgQXJyYXkucHJvdG90eXBlLmZvckVhY2ggPSBmdW5jdGlvbihmbiwgc2NvcGUpIHtcbiAgICAgIHZhciBpLCBfaSwgX3JlZiwgX3Jlc3VsdHM7XG4gICAgICBfcmVzdWx0cyA9IFtdO1xuICAgICAgZm9yIChpID0gX2kgPSAwLCBfcmVmID0gdGhpcy5sZW5ndGg7IDAgPD0gX3JlZiA/IF9pIDw9IF9yZWYgOiBfaSA+PSBfcmVmOyBpID0gMCA8PSBfcmVmID8gKytfaSA6IC0tX2kpIHtcbiAgICAgICAgX3Jlc3VsdHMucHVzaChfX2luZGV4T2YuY2FsbCh0aGlzLCBpKSA+PSAwID8gZm4uY2FsbChzY29wZSwgdGhpc1tpXSwgaSwgdGhpcykgOiB2b2lkIDApO1xuICAgICAgfVxuICAgICAgcmV0dXJuIF9yZXN1bHRzO1xuICAgIH07XG4gIH1cblxuICBpZiAoIUFycmF5LnByb3RvdHlwZS5pbmRleE9mKSB7XG4gICAgQXJyYXkucHJvdG90eXBlLmluZGV4T2YgPSBmdW5jdGlvbihuZWVkbGUpIHtcbiAgICAgIHZhciBpLCBfaSwgX3JlZjtcbiAgICAgIGZvciAoaSA9IF9pID0gMCwgX3JlZiA9IHRoaXMubGVuZ3RoOyAwIDw9IF9yZWYgPyBfaSA8PSBfcmVmIDogX2kgPj0gX3JlZjsgaSA9IDAgPD0gX3JlZiA/ICsrX2kgOiAtLV9pKSB7XG4gICAgICAgIGlmICh0aGlzW2ldID09PSBuZWVkbGUpIHtcbiAgICAgICAgICByZXR1cm4gaTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIC0xO1xuICAgIH07XG4gIH1cblxufSkuY2FsbCh0aGlzKTtcbiIsIihmdW5jdGlvbigpIHtcbiAgdmFyIEFwcFZpZXcsIE1hcExheWVyLCBkZWJ1ZyxcbiAgICBfX2luZGV4T2YgPSBbXS5pbmRleE9mIHx8IGZ1bmN0aW9uKGl0ZW0pIHsgZm9yICh2YXIgaSA9IDAsIGwgPSB0aGlzLmxlbmd0aDsgaSA8IGw7IGkrKykgeyBpZiAoaSBpbiB0aGlzICYmIHRoaXNbaV0gPT09IGl0ZW0pIHJldHVybiBpOyB9IHJldHVybiAtMTsgfTtcblxuICBNYXBMYXllciA9IHJlcXVpcmUoJy4uL21vZGVscy9tYXBsYXllcicpO1xuXG4gIHJlcXVpcmUoJy4uL3V0aWwvc2hpbXMnKTtcblxuXG4gIC8qIGpzaGludCAtVzA5MyAqL1xuXG4gIGRlYnVnID0gZnVuY3Rpb24oaXRlbVRvTG9nLCBpdGVtTGV2ZWwpIHtcbiAgICB2YXIgbGV2ZWxzLCBtZXNzYWdlTnVtLCB0aHJlc2hvbGQsIHRocmVzaG9sZE51bTtcbiAgICBsZXZlbHMgPSBbJ3ZlcnlkZWJ1ZycsICdkZWJ1ZycsICdtZXNzYWdlJywgJ3dhcm5pbmcnXTtcbiAgICB0aHJlc2hvbGQgPSAnbWVzc2FnZSc7XG4gICAgaWYgKCFpdGVtTGV2ZWwpIHtcbiAgICAgIGl0ZW1MZXZlbCA9ICdkZWJ1Zyc7XG4gICAgfVxuICAgIHRocmVzaG9sZE51bSA9IGxldmVscy5pbmRleE9mKHRocmVzaG9sZCk7XG4gICAgbWVzc2FnZU51bSA9IGxldmVscy5pbmRleE9mKGl0ZW1MZXZlbCk7XG4gICAgaWYgKHRocmVzaG9sZE51bSA+IG1lc3NhZ2VOdW0pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKGl0ZW1Ub0xvZyArICcnID09PSBpdGVtVG9Mb2cpIHtcbiAgICAgIHJldHVybiBjb25zb2xlLmxvZyhcIltcIiArIGl0ZW1MZXZlbCArIFwiXSBcIiArIGl0ZW1Ub0xvZyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBjb25zb2xlLmxvZyhpdGVtVG9Mb2cpO1xuICAgIH1cbiAgfTtcblxuICBBcHBWaWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xuICAgIHRhZ05hbWU6ICdkaXYnLFxuICAgIGNsYXNzTmFtZTogJ3NwbGl0bWFwIHNob3dmb3JtcycsXG4gICAgaWQ6ICdzcGxpdG1hcCcsXG4gICAgc3BlY2llc0RhdGFVcmw6IHdpbmRvdy5tYXBDb25maWcuc3BlY2llc0RhdGFVcmwsXG4gICAgY2xpbWF0ZURhdGFVcmw6IHdpbmRvdy5tYXBDb25maWcuY2xpbWF0ZURhdGFVcmwsXG4gICAgYmlvZGl2RGF0YVVybDogd2luZG93Lm1hcENvbmZpZy5iaW9kaXZEYXRhVXJsLFxuICAgIHJhc3RlckFwaVVybDogd2luZG93Lm1hcENvbmZpZy5yYXN0ZXJBcGlVcmwsXG4gICAgdHJhY2tTcGxpdHRlcjogZmFsc2UsXG4gICAgdHJhY2tQZXJpb2Q6IDEwMCxcbiAgICBldmVudHM6IHtcbiAgICAgICdjbGljayAuYnRuLWNoYW5nZSc6ICd0b2dnbGVGb3JtcycsXG4gICAgICAnY2xpY2sgLmJ0bi1jb21wYXJlJzogJ3RvZ2dsZVNwbGl0dGVyJyxcbiAgICAgICdjbGljayAuYnRuLWNvcHkubGVmdC12YWxpZC1tYXAnOiAnY29weU1hcExlZnRUb1JpZ2h0JyxcbiAgICAgICdjbGljayAuYnRuLWNvcHkucmlnaHQtdmFsaWQtbWFwJzogJ2NvcHlNYXBSaWdodFRvTGVmdCcsXG4gICAgICAnbGVmdG1hcHVwZGF0ZSc6ICdsZWZ0U2lkZVVwZGF0ZScsXG4gICAgICAncmlnaHRtYXB1cGRhdGUnOiAncmlnaHRTaWRlVXBkYXRlJyxcbiAgICAgICdjaGFuZ2Ugc2VsZWN0LmxlZnQnOiAnbGVmdFNpZGVVcGRhdGUnLFxuICAgICAgJ2NoYW5nZSBzZWxlY3QucmlnaHQnOiAncmlnaHRTaWRlVXBkYXRlJyxcbiAgICAgICdjaGFuZ2UgaW5wdXQubGVmdCc6ICdsZWZ0U2lkZVVwZGF0ZScsXG4gICAgICAnY2hhbmdlIGlucHV0LnJpZ2h0JzogJ3JpZ2h0U2lkZVVwZGF0ZScsXG4gICAgICAnY2hhbmdlICNzeW5jJzogJ3RvZ2dsZVN5bmMnXG4gICAgfSxcbiAgICB0aWNrOiBmdW5jdGlvbigpIHtcbiAgICAgIGlmIChmYWxzZSkge1xuICAgICAgICBkZWJ1Zyh0aGlzLmxlZnRJbmZvLnNjZW5hcmlvKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRlYnVnKCd0aWNrJyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gc2V0VGltZW91dCh0aGlzLnRpY2ssIDEwMDApO1xuICAgIH0sXG4gICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5pbml0aWFsaXplJyk7XG4gICAgICBfLmJpbmRBbGwuYXBwbHkoXywgW3RoaXNdLmNvbmNhdChfLmZ1bmN0aW9ucyh0aGlzKSkpO1xuICAgICAgdGhpcy5uYW1lc0xpc3QgPSBbXTtcbiAgICAgIHRoaXMuc3BlY2llc1NjaU5hbWVMaXN0ID0gW107XG4gICAgICB0aGlzLnNwZWNpZXNJbmZvRmV0Y2hQcm9jZXNzID0gdGhpcy5mZXRjaFNwZWNpZXNJbmZvKCk7XG4gICAgICB0aGlzLmJpb2Rpdkxpc3QgPSBbXTtcbiAgICAgIHRoaXMuYmlvZGl2TG9va3VwTGlzdCA9IFtdO1xuICAgICAgdGhpcy5uaWNlSW5kZXggPSB7fTtcbiAgICAgIHJldHVybiB0aGlzLm1hcExpc3QgPSB7fTtcbiAgICB9LFxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5yZW5kZXInKTtcbiAgICAgIHRoaXMuJGVsLmFwcGVuZChBcHBWaWV3LnRlbXBsYXRlcy5sYXlvdXQoe1xuICAgICAgICBsZWZ0VGFnOiBBcHBWaWV3LnRlbXBsYXRlcy5sZWZ0VGFnKCksXG4gICAgICAgIHJpZ2h0VGFnOiBBcHBWaWV3LnRlbXBsYXRlcy5yaWdodFRhZygpLFxuICAgICAgICBsZWZ0Rm9ybTogQXBwVmlldy50ZW1wbGF0ZXMubGVmdEZvcm0oKSxcbiAgICAgICAgcmlnaHRGb3JtOiBBcHBWaWV3LnRlbXBsYXRlcy5yaWdodEZvcm0oKVxuICAgICAgfSkpO1xuICAgICAgJCgnI2NvbnRlbnR3cmFwJykuYXBwZW5kKHRoaXMuJGVsKTtcbiAgICAgIHRoaXMubWFwID0gTC5tYXAoJ21hcCcsIHtcbiAgICAgICAgY2VudGVyOiBbMCwgMF0sXG4gICAgICAgIHpvb206IDNcbiAgICAgIH0pO1xuICAgICAgdGhpcy5tYXAub24oJ21vdmUnLCB0aGlzLnJlc2l6ZVRoaW5ncyk7XG4gICAgICBMLnRpbGVMYXllcignaHR0cDovL3tzfS57YmFzZX0ubWFwcy5jaXQuYXBpLmhlcmUuY29tL21hcHRpbGUvMi4xL3t0eXBlfS97bWFwSUR9L3tzY2hlbWV9L3t6fS97eH0ve3l9L3tzaXplfS97Zm9ybWF0fT9hcHBfaWQ9e2FwcF9pZH0mYXBwX2NvZGU9e2FwcF9jb2RlfSZsZz17bGFuZ3VhZ2V9Jywge1xuICAgICAgICBhdHRyaWJ1dGlvbjogJ01hcCAmY29weTsgMjAxNiA8YSBocmVmPVwiaHR0cDovL2RldmVsb3Blci5oZXJlLmNvbVwiPkhFUkU8L2E+JyxcbiAgICAgICAgc3ViZG9tYWluczogJzEyMzQnLFxuICAgICAgICBiYXNlOiAnYWVyaWFsJyxcbiAgICAgICAgdHlwZTogJ21hcHRpbGUnLFxuICAgICAgICBzY2hlbWU6ICd0ZXJyYWluLmRheScsXG4gICAgICAgIGFwcF9pZDogJ2wyUnllNnp3cTN1MmNIWnBWSVBPJyxcbiAgICAgICAgYXBwX2NvZGU6ICdNcFhTbE5MY0xTUUlwZFU2WEhCMFRRJyxcbiAgICAgICAgbWFwSUQ6ICduZXdlc3QnLFxuICAgICAgICBtYXhab29tOiAxOCxcbiAgICAgICAgbGFuZ3VhZ2U6ICdlbmcnLFxuICAgICAgICBmb3JtYXQ6ICdwbmc4JyxcbiAgICAgICAgc2l6ZTogJzI1NidcbiAgICAgIH0pLmFkZFRvKHRoaXMubWFwKTtcbiAgICAgIHRoaXMubGVmdEZvcm0gPSB0aGlzLiQoJy5sZWZ0LmZvcm0nKTtcbiAgICAgIHRoaXMuYnVpbGRMZWZ0Rm9ybSgpO1xuICAgICAgdGhpcy5yaWdodEZvcm0gPSB0aGlzLiQoJy5yaWdodC5mb3JtJyk7XG4gICAgICB0aGlzLmJ1aWxkUmlnaHRGb3JtKCk7XG4gICAgICB0aGlzLmxlZnRUYWcgPSB0aGlzLiQoJy5sZWZ0LnRhZycpO1xuICAgICAgdGhpcy5yaWdodFRhZyA9IHRoaXMuJCgnLnJpZ2h0LnRhZycpO1xuICAgICAgdGhpcy5zcGxpdExpbmUgPSB0aGlzLiQoJy5zcGxpdGxpbmUnKTtcbiAgICAgIHRoaXMuc3BsaXRUaHVtYiA9IHRoaXMuJCgnLnNwbGl0dGh1bWInKTtcbiAgICAgIHRoaXMubGVmdFNpZGVVcGRhdGUoKTtcbiAgICAgIHRoaXMucmlnaHRTaWRlVXBkYXRlKCk7XG4gICAgICByZXR1cm4gdGhpcy50b2dnbGVTcGxpdHRlcigpO1xuICAgIH0sXG4gICAgcmVzb2x2ZVBsYWNlaG9sZGVyczogZnVuY3Rpb24oc3RyV2l0aFBsYWNlaG9sZGVycywgcmVwbGFjZW1lbnRzKSB7XG4gICAgICB2YXIgYW5zLCBrZXksIHJlLCB2YWx1ZTtcbiAgICAgIGFucyA9IHN0cldpdGhQbGFjZWhvbGRlcnM7XG4gICAgICBhbnMgPSBhbnMucmVwbGFjZSgvXFx7XFx7XFxzKmxvY2F0aW9uLnByb3RvY29sXFxzKlxcfVxcfS9nLCBsb2NhdGlvbi5wcm90b2NvbCk7XG4gICAgICBhbnMgPSBhbnMucmVwbGFjZSgvXFx7XFx7XFxzKmxvY2F0aW9uLmhvc3RcXHMqXFx9XFx9L2csIGxvY2F0aW9uLmhvc3QpO1xuICAgICAgYW5zID0gYW5zLnJlcGxhY2UoL1xce1xce1xccypsb2NhdGlvbi5ob3N0bmFtZVxccypcXH1cXH0vZywgbG9jYXRpb24uaG9zdG5hbWUpO1xuICAgICAgZm9yIChrZXkgaW4gcmVwbGFjZW1lbnRzKSB7XG4gICAgICAgIHZhbHVlID0gcmVwbGFjZW1lbnRzW2tleV07XG4gICAgICAgIHJlID0gbmV3IFJlZ0V4cChcIlxcXFx7XFxcXHtcXFxccypcIiArIGtleSArIFwiXFxcXHMqXFxcXH1cXFxcfVwiLCBcImdcIik7XG4gICAgICAgIGFucyA9IGFucy5yZXBsYWNlKHJlLCB2YWx1ZSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gYW5zO1xuICAgIH0sXG4gICAgY29weU1hcExlZnRUb1JpZ2h0OiBmdW5jdGlvbigpIHtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LmNvcHlNYXBMZWZ0VG9SaWdodCcpO1xuICAgICAgaWYgKCF0aGlzLmxlZnRJbmZvKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHRoaXMuJCgnI3JpZ2h0bWFwc3BwJykudmFsKHRoaXMubGVmdEluZm8uc3BlY2llc05hbWUpO1xuICAgICAgdGhpcy4kKCcjcmlnaHRtYXB5ZWFyJykudmFsKHRoaXMubGVmdEluZm8ueWVhcik7XG4gICAgICB0aGlzLiQoJ2lucHV0W25hbWU9cmlnaHRtYXBzY2VuYXJpb10nKS5lYWNoKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oaW5kZXgsIGl0ZW0pIHtcbiAgICAgICAgICByZXR1cm4gJChpdGVtKS5wcm9wKCdjaGVja2VkJywgJChpdGVtKS52YWwoKSA9PT0gX3RoaXMubGVmdEluZm8uc2NlbmFyaW8pO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpO1xuICAgICAgdGhpcy4kKCcjcmlnaHRtYXBnY20nKS52YWwodGhpcy5sZWZ0SW5mby5nY20pO1xuICAgICAgcmV0dXJuIHRoaXMucmlnaHRTaWRlVXBkYXRlKCk7XG4gICAgfSxcbiAgICBjb3B5TWFwUmlnaHRUb0xlZnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgZGVidWcoJ0FwcFZpZXcuY29weU1hcFJpZ2h0VG9MZWZ0Jyk7XG4gICAgICBpZiAoIXRoaXMucmlnaHRJbmZvKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHRoaXMuJCgnI2xlZnRtYXBzcHAnKS52YWwodGhpcy5yaWdodEluZm8uc3BlY2llc05hbWUpO1xuICAgICAgdGhpcy4kKCcjbGVmdG1hcHllYXInKS52YWwodGhpcy5yaWdodEluZm8ueWVhcik7XG4gICAgICB0aGlzLiQoJ2lucHV0W25hbWU9bGVmdG1hcHNjZW5hcmlvXScpLmVhY2goKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihpbmRleCwgaXRlbSkge1xuICAgICAgICAgIHJldHVybiAkKGl0ZW0pLnByb3AoJ2NoZWNrZWQnLCAkKGl0ZW0pLnZhbCgpID09PSBfdGhpcy5yaWdodEluZm8uc2NlbmFyaW8pO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpO1xuICAgICAgdGhpcy4kKCcjbGVmdG1hcGdjbScpLnZhbCh0aGlzLnJpZ2h0SW5mby5nY20pO1xuICAgICAgcmV0dXJuIHRoaXMubGVmdFNpZGVVcGRhdGUoKTtcbiAgICB9LFxuICAgIHNpZGVVcGRhdGU6IGZ1bmN0aW9uKHNpZGUpIHtcbiAgICAgIHZhciBhdEN1cnJlbnQsIGN1cnJJbmZvLCBuZXdJbmZvLCBzY2lOYW1lTWF0Y2gsIHNjaU5hbWVNYXRjaGVyLCBfcmVmLCBfcmVmMTtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LnNpZGVVcGRhdGUgKCcgKyBzaWRlICsgJyknKTtcbiAgICAgIG5ld0luZm8gPSB7XG4gICAgICAgIHNwZWNpZXNOYW1lOiB0aGlzLiQoJyMnICsgc2lkZSArICdtYXBzcHAnKS52YWwoKSxcbiAgICAgICAgbmljZU5hbWU6IHRoaXMuJCgnIycgKyBzaWRlICsgJ21hcHNwcCcpLnZhbCgpLFxuICAgICAgICBkZWdzOiB0aGlzLiQoJyMnICsgc2lkZSArICdtYXBkZWdzJykudmFsKCksXG4gICAgICAgIHJhbmdlOiB0aGlzLiQoJ2lucHV0W25hbWU9JyArIHNpZGUgKyAnbWFwcmFuZ2VdOmNoZWNrZWQnKS52YWwoKSxcbiAgICAgICAgY29uZmlkZW5jZTogdGhpcy4kKCcjJyArIHNpZGUgKyAnbWFwY29uZmlkZW5jZScpLnZhbCgpXG4gICAgICB9O1xuICAgICAgYXRDdXJyZW50ID0gbmV3SW5mby5kZWdzID09PSAnY3VycmVudCc7XG4gICAgICB0aGlzLiQoXCJpbnB1dFtuYW1lPVwiICsgc2lkZSArIFwibWFwcmFuZ2VdLCAjXCIgKyBzaWRlICsgXCJtYXBjb25maWRlbmNlXCIpLnByb3AoJ2Rpc2FibGVkJywgYXRDdXJyZW50KTtcbiAgICAgIHRoaXMuJChcIi5cIiArIHNpZGUgKyBcIi5zaWRlLmZvcm0gZmllbGRzZXRcIikucmVtb3ZlQ2xhc3MoJ2Rpc2FibGVkJyk7XG4gICAgICB0aGlzLiQoXCJpbnB1dFtuYW1lXj1cIiArIHNpZGUgKyBcIl06ZGlzYWJsZWQsIFtpZF49XCIgKyBzaWRlICsgXCJdOmRpc2FibGVkXCIpLmNsb3Nlc3QoJ2ZpZWxkc2V0JykuYWRkQ2xhc3MoJ2Rpc2FibGVkJyk7XG4gICAgICBpZiAoc2lkZSA9PT0gJ3JpZ2h0JyAmJiBuZXdJbmZvLm5pY2VOYW1lKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdzdGFydGluZyBzcHAgaXMgfCcgKyBuZXdJbmZvLm5pY2VOYW1lICsgJ3wnKTtcbiAgICAgICAgc2NpTmFtZU1hdGNoZXIgPSAvLipcXCgoLispXFwpJC87XG4gICAgICAgIHNjaU5hbWVNYXRjaCA9IHNjaU5hbWVNYXRjaGVyLmV4ZWMobmV3SW5mby5uaWNlTmFtZSk7XG4gICAgICAgIGlmIChzY2lOYW1lTWF0Y2ggJiYgc2NpTmFtZU1hdGNoWzFdKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coJ3JlZ2V4ZWQgc3BwIGlzICcgKyAnfCcgKyBzY2lOYW1lTWF0Y2hbMV0gKyAnfCcpO1xuICAgICAgICAgIG5ld0luZm8uc3BlY2llc05hbWUgPSBzY2lOYW1lTWF0Y2hbMV07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmICgoX3JlZiA9IG5ld0luZm8uc3BlY2llc05hbWUsIF9faW5kZXhPZi5jYWxsKHRoaXMubmFtZXNMaXN0LCBfcmVmKSA+PSAwKSB8fCAoX3JlZjEgPSBuZXdJbmZvLm5pY2VOYW1lLCBfX2luZGV4T2YuY2FsbCh0aGlzLm5pY2VJbmRleCwgX3JlZjEpID49IDApKSB7XG4gICAgICAgIHRoaXMuJChcIi5cIiArIHNpZGUgKyBcIi12YWxpZC1tYXBcIikucmVtb3ZlQ2xhc3MoJ2Rpc2FibGVkJykucHJvcCgnZGlzYWJsZWQnLCBmYWxzZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLiQoXCIuXCIgKyBzaWRlICsgXCItdmFsaWQtbWFwXCIpLmFkZENsYXNzKCdkaXNhYmxlZCcpLnByb3AoJ2Rpc2FibGVkJywgdHJ1ZSk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIGN1cnJJbmZvID0gc2lkZSA9PT0gJ2xlZnQnID8gdGhpcy5sZWZ0SW5mbyA6IHRoaXMucmlnaHRJbmZvO1xuICAgICAgaWYgKGN1cnJJbmZvICYmIF8uaXNFcXVhbChuZXdJbmZvLCBjdXJySW5mbykpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgaWYgKGN1cnJJbmZvICYmIG5ld0luZm8uc3BlY2llc05hbWUgPT09IGN1cnJJbmZvLnNwZWNpZXNOYW1lICYmIG5ld0luZm8uZGVncyA9PT0gY3VyckluZm8uZGVncyAmJiBuZXdJbmZvLmRlZ3MgPT09ICdjdXJyZW50Jykge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICBpZiAoc2lkZSA9PT0gJ2xlZnQnKSB7XG4gICAgICAgIHRoaXMubGVmdEluZm8gPSBuZXdJbmZvO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5yaWdodEluZm8gPSBuZXdJbmZvO1xuICAgICAgfVxuICAgICAgdGhpcy5hZGRNYXBMYXllcihzaWRlKTtcbiAgICAgIHJldHVybiB0aGlzLmFkZE1hcFRhZyhzaWRlKTtcbiAgICB9LFxuICAgIGxlZnRTaWRlVXBkYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2lkZVVwZGF0ZSgnbGVmdCcpO1xuICAgICAgaWYgKHRoaXMuJCgnI3N5bmMnKVswXS5jaGVja2VkKSB7XG4gICAgICAgIGRlYnVnKCdTeW5jIGNoZWNrZWQgLSBzeW5jaW5nIHJpZ2h0IHNpZGUnLCAnbWVzc2FnZScpO1xuICAgICAgICByZXR1cm4gdGhpcy5jb3B5U3BwVG9SaWdodFNpZGUoKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHJpZ2h0U2lkZVVwZGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5zaWRlVXBkYXRlKCdyaWdodCcpO1xuICAgIH0sXG4gICAgY29weVNwcFRvUmlnaHRTaWRlOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuJCgnI3JpZ2h0bWFwc3BwJykudmFsKHRoaXMuJCgnI2xlZnRtYXBzcHAnKS52YWwoKSk7XG4gICAgICByZXR1cm4gdGhpcy5yaWdodFNpZGVVcGRhdGUoKTtcbiAgICB9LFxuICAgIGFkZE1hcFRhZzogZnVuY3Rpb24oc2lkZSkge1xuICAgICAgdmFyIGRpc3BMb29rdXAsIGluZm8sIHRhZztcbiAgICAgIGRlYnVnKCdBcHBWaWV3LmFkZE1hcFRhZycpO1xuICAgICAgaWYgKHNpZGUgPT09ICdsZWZ0Jykge1xuICAgICAgICBpbmZvID0gdGhpcy5sZWZ0SW5mbztcbiAgICAgIH1cbiAgICAgIGlmIChzaWRlID09PSAncmlnaHQnKSB7XG4gICAgICAgIGluZm8gPSB0aGlzLnJpZ2h0SW5mbztcbiAgICAgIH1cbiAgICAgIHRhZyA9IFwiPGI+PGk+XCIgKyBpbmZvLnNwZWNpZXNOYW1lICsgXCI8L2k+PC9iPlwiO1xuICAgICAgZGlzcExvb2t1cCA9IHtcbiAgICAgICAgJzBkaXNwJzogJ25vIHJhbmdlIGFkYXB0YXRpb24nLFxuICAgICAgICAnNTBkaXNwJzogJzUwIHllYXJzIG9mIHJhbmdlIGFkYXB0YXRpb24nLFxuICAgICAgICAnMTAwZGlzcCc6ICcxMDAgeWVhcnMgb2YgcmFuZ2UgYWRhcHRhdGlvbidcbiAgICAgIH07XG4gICAgICBpZiAoaW5mby5kZWdzID09PSAnY3VycmVudCcpIHtcbiAgICAgICAgdGFnID0gXCJjdXJyZW50IFwiICsgdGFnICsgXCIgZGlzdHJpYnV0aW9uXCI7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0YWcgPSBcIjxiPlwiICsgaW5mby5jb25maWRlbmNlICsgXCI8L2I+IHBlcmNlbnRpbGUgcHJvamVjdGlvbnMgZm9yIFwiICsgdGFnICsgXCIgYXQgPGI+K1wiICsgaW5mby5kZWdzICsgXCImZGVnO0M8L2I+IHdpdGggPGI+XCIgKyBkaXNwTG9va3VwW2luZm8ucmFuZ2VdICsgXCI8L2I+XCI7XG4gICAgICB9XG4gICAgICBpZiAoc2lkZSA9PT0gJ2xlZnQnKSB7XG4gICAgICAgIHRoaXMubGVmdFRhZy5maW5kKCcubGVmdGxheWVybmFtZScpLmh0bWwodGFnKTtcbiAgICAgIH1cbiAgICAgIGlmIChzaWRlID09PSAncmlnaHQnKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJpZ2h0VGFnLmZpbmQoJy5yaWdodGxheWVybmFtZScpLmh0bWwodGFnKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGFkZE1hcExheWVyOiBmdW5jdGlvbihzaWRlKSB7XG4gICAgICB2YXIgZXh0LCBmdXR1cmVNb2RlbFBvaW50LCBpbmZvLCBpc0Jpb2RpdmVyc2l0eSwgbGF5ZXIsIGxvYWRDbGFzcywgbWFwVXJsLCBzaWRlSW5mbywgc3BwRmlsZU5hbWUsIHVybCwgdmFsLCB6aXBVcmwsIF9yZWY7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5hZGRNYXBMYXllcicpO1xuICAgICAgaWYgKHNpZGUgPT09ICdsZWZ0Jykge1xuICAgICAgICBzaWRlSW5mbyA9IHRoaXMubGVmdEluZm87XG4gICAgICB9XG4gICAgICBpZiAoc2lkZSA9PT0gJ3JpZ2h0Jykge1xuICAgICAgICBzaWRlSW5mbyA9IHRoaXMucmlnaHRJbmZvO1xuICAgICAgfVxuICAgICAgaXNCaW9kaXZlcnNpdHkgPSAoX3JlZiA9IHNpZGVJbmZvLnNwZWNpZXNOYW1lLCBfX2luZGV4T2YuY2FsbCh0aGlzLmJpb2Rpdkxpc3QsIF9yZWYpID49IDApO1xuICAgICAgZnV0dXJlTW9kZWxQb2ludCA9ICcnO1xuICAgICAgbWFwVXJsID0gJyc7XG4gICAgICB6aXBVcmwgPSAnJztcbiAgICAgIGlmIChpc0Jpb2RpdmVyc2l0eSkge1xuICAgICAgICBmdXR1cmVNb2RlbFBvaW50ID0gWydiaW9kaXZlcnNpdHkvZGVjaWxlcy9iaW9kaXZlcnNpdHknLCBzaWRlSW5mby5zY2VuYXJpbywgc2lkZUluZm8ueWVhciwgc2lkZUluZm8uZ2NtXS5qb2luKCdfJyk7XG4gICAgICAgIGlmIChzaWRlSW5mby55ZWFyID09PSAnYmFzZWxpbmUnKSB7XG4gICAgICAgICAgZnV0dXJlTW9kZWxQb2ludCA9ICdiaW9kaXZlcnNpdHkvYmlvZGl2ZXJzaXR5X2N1cnJlbnQnO1xuICAgICAgICB9XG4gICAgICAgIG1hcFVybCA9IFtcbiAgICAgICAgICB0aGlzLnJlc29sdmVQbGFjZWhvbGRlcnModGhpcy5iaW9kaXZEYXRhVXJsLCB7XG4gICAgICAgICAgICBzcHBHcm91cDogc2lkZUluZm8uc3BlY2llc05hbWVcbiAgICAgICAgICB9KSwgZnV0dXJlTW9kZWxQb2ludCArICcudGlmJ1xuICAgICAgICBdLmpvaW4oJy8nKTtcbiAgICAgICAgemlwVXJsID0gW1xuICAgICAgICAgIHRoaXMucmVzb2x2ZVBsYWNlaG9sZGVycyh0aGlzLmJpb2RpdkRhdGFVcmwsIHtcbiAgICAgICAgICAgIHNwcEdyb3VwOiBzaWRlSW5mby5zcGVjaWVzTmFtZVxuICAgICAgICAgIH0pLCAnYmlvZGl2ZXJzaXR5Jywgc2lkZUluZm8uc3BlY2llc05hbWUgKyAnLnppcCdcbiAgICAgICAgXS5qb2luKCcvJyk7XG4gICAgICAgIHRoaXMuJCgnIycgKyBzaWRlICsgJ21hcGRsJykuYXR0cignaHJlZicsIG1hcFVybCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzcHBGaWxlTmFtZSA9IFsnVEVNUCcsIHNpZGVJbmZvLmRlZ3MsIHNpZGVJbmZvLmNvbmZpZGVuY2UgKyAnLicgKyBzaWRlSW5mby5yYW5nZV0uam9pbignXycpO1xuICAgICAgICBpZiAoc2lkZUluZm8uZGVncyA9PT0gJ2N1cnJlbnQnKSB7XG4gICAgICAgICAgc3BwRmlsZU5hbWUgPSAnY3VycmVudCc7XG4gICAgICAgIH1cbiAgICAgICAgbWFwVXJsID0gW1xuICAgICAgICAgIHRoaXMucmVzb2x2ZVBsYWNlaG9sZGVycyh0aGlzLnNwZWNpZXNEYXRhVXJsLCB7XG4gICAgICAgICAgICBwYXRoOiB0aGlzLnNwZWNpZXNVcmxzW3NpZGVJbmZvLnNwZWNpZXNOYW1lXVxuICAgICAgICAgIH0pLCBzcHBGaWxlTmFtZSArICcudGlmJ1xuICAgICAgICBdLmpvaW4oJy8nKTtcbiAgICAgICAgaWYgKHNpZGUgPT09ICdyaWdodCcpIHtcbiAgICAgICAgICBpbmZvID0gdGhpcy5tYXBMaXN0W3RoaXMubmljZUluZGV4W3NpZGVJbmZvLm5pY2VOYW1lXV07XG4gICAgICAgICAgaWYgKGluZm8pIHtcbiAgICAgICAgICAgIHVybCA9IHRoaXMuc3BlY2llc0RhdGFVcmw7XG4gICAgICAgICAgICBleHQgPSAnLnRpZic7XG4gICAgICAgICAgICBpZiAoaW5mby50eXBlID09PSAnY2xpbWF0ZScpIHtcbiAgICAgICAgICAgICAgdXJsID0gdGhpcy5jbGltYXRlRGF0YVVybDtcbiAgICAgICAgICAgICAgZXh0ID0gJy5hc2MnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbWFwVXJsID0gW1xuICAgICAgICAgICAgICB0aGlzLnJlc29sdmVQbGFjZWhvbGRlcnModXJsLCB7XG4gICAgICAgICAgICAgICAgcGF0aDogaW5mby5wYXRoXG4gICAgICAgICAgICAgIH0pLCBzcHBGaWxlTmFtZSArIGV4dFxuICAgICAgICAgICAgXS5qb2luKCcvJyk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdJbmRleCBtaXNhbGlnbm1lbnQgLS0gbGV0IG1lIGtub3cgd2hhdCB5b3Ugd2VyZSBsb29raW5nIGZvciwgZGFuaWVsQGRhbmllbGJhaXJkLmNvbScpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLiQoJyMnICsgc2lkZSArICdtYXBkbCcpLmF0dHIoJ2hyZWYnLCBtYXBVcmwpO1xuICAgICAgfVxuICAgICAgbGF5ZXIgPSBMLnRpbGVMYXllci53bXModGhpcy5yZXNvbHZlUGxhY2Vob2xkZXJzKHRoaXMucmFzdGVyQXBpVXJsKSwge1xuICAgICAgICBEQVRBX1VSTDogbWFwVXJsLFxuICAgICAgICBsYXllcnM6ICdERUZBVUxUJyxcbiAgICAgICAgZm9ybWF0OiAnaW1hZ2UvcG5nJyxcbiAgICAgICAgdHJhbnNwYXJlbnQ6IHRydWVcbiAgICAgIH0pO1xuICAgICAgbG9hZENsYXNzID0gJycgKyBzaWRlICsgJ2xvYWRpbmcnO1xuICAgICAgbGF5ZXIub24oJ2xvYWRpbmcnLCAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiBfdGhpcy4kZWwuYWRkQ2xhc3MobG9hZENsYXNzKTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKTtcbiAgICAgIGxheWVyLm9uKCdsb2FkJywgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gX3RoaXMuJGVsLnJlbW92ZUNsYXNzKGxvYWRDbGFzcyk7XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKSk7XG4gICAgICBpZiAoc2lkZSA9PT0gJ2xlZnQnKSB7XG4gICAgICAgIGlmICh0aGlzLmxlZnRMYXllcikge1xuICAgICAgICAgIHRoaXMubWFwLnJlbW92ZUxheWVyKHRoaXMubGVmdExheWVyKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmxlZnRMYXllciA9IGxheWVyO1xuICAgICAgfVxuICAgICAgaWYgKHNpZGUgPT09ICdyaWdodCcpIHtcbiAgICAgICAgaWYgKHRoaXMucmlnaHRMYXllcikge1xuICAgICAgICAgIHRoaXMubWFwLnJlbW92ZUxheWVyKHRoaXMucmlnaHRMYXllcik7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5yaWdodExheWVyID0gbGF5ZXI7XG4gICAgICB9XG4gICAgICBsYXllci5hZGRUbyh0aGlzLm1hcCk7XG4gICAgICB0aGlzLnJlc2l6ZVRoaW5ncygpO1xuICAgICAgaWYgKHdpbmRvdy5sb2NhdGlvbi5ob3N0bmFtZSA9PT0gJ2xvY2FsaG9zdCcpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ21hcCBVUkwgaXM6ICcsIG1hcFVybCk7XG4gICAgICB9XG4gICAgICBpZiAoZ2EgJiYgdHlwZW9mIGdhID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGlmIChzaWRlSW5mby55ZWFyID09PSAnYmFzZWxpbmUnKSB7XG4gICAgICAgICAgdmFsID0gMTk5MDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB2YWwgPSBwYXJzZUludChzaWRlSW5mby55ZWFyLCAxMCk7XG4gICAgICAgIH1cbiAgICAgICAgdmFsID0gdmFsICsge1xuICAgICAgICAgICd0ZW50aCc6IDAuMSxcbiAgICAgICAgICAnZmlmdGlldGgnOiAwLjUsXG4gICAgICAgICAgJ25pbmV0aWV0aCc6IDAuOVxuICAgICAgICB9W3NpZGVJbmZvLmdjbV07XG4gICAgICAgIHJldHVybiBnYSgnc2VuZCcsIHtcbiAgICAgICAgICAnaGl0VHlwZSc6ICdldmVudCcsXG4gICAgICAgICAgJ2V2ZW50Q2F0ZWdvcnknOiAnbWFwc2hvdycsXG4gICAgICAgICAgJ2V2ZW50QWN0aW9uJzogc2lkZUluZm8uc3BlY2llc05hbWUsXG4gICAgICAgICAgJ2V2ZW50TGFiZWwnOiBzaWRlSW5mby5zY2VuYXJpbyxcbiAgICAgICAgICAnZXZlbnRWYWx1ZSc6IHZhbFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGNlbnRyZU1hcDogZnVuY3Rpb24ocmVwZWF0ZWRseUZvcikge1xuICAgICAgdmFyIGxhdGVyLCByZWNlbnRyZSwgX2ksIF9yZXN1bHRzO1xuICAgICAgZGVidWcoJ0FwcFZpZXcuY2VudHJlTWFwJyk7XG4gICAgICBpZiAoIXJlcGVhdGVkbHlGb3IpIHtcbiAgICAgICAgcmVwZWF0ZWRseUZvciA9IDUwMDtcbiAgICAgIH1cbiAgICAgIHJlY2VudHJlID0gKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICBfdGhpcy5tYXAuaW52YWxpZGF0ZVNpemUoZmFsc2UpO1xuICAgICAgICAgIHJldHVybiBfdGhpcy5yZXNpemVUaGluZ3MoKTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpO1xuICAgICAgX3Jlc3VsdHMgPSBbXTtcbiAgICAgIGZvciAobGF0ZXIgPSBfaSA9IDA7IF9pIDw9IHJlcGVhdGVkbHlGb3I7IGxhdGVyID0gX2kgKz0gMjUpIHtcbiAgICAgICAgX3Jlc3VsdHMucHVzaChzZXRUaW1lb3V0KHJlY2VudHJlLCBsYXRlcikpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIF9yZXN1bHRzO1xuICAgIH0sXG4gICAgdG9nZ2xlRm9ybXM6IGZ1bmN0aW9uKCkge1xuICAgICAgZGVidWcoJ0FwcFZpZXcudG9nZ2xlRm9ybXMnKTtcbiAgICAgIHRoaXMuJGVsLnRvZ2dsZUNsYXNzKCdzaG93Zm9ybXMnKTtcbiAgICAgIHJldHVybiB0aGlzLmNlbnRyZU1hcCgpO1xuICAgIH0sXG4gICAgdG9nZ2xlU3BsaXR0ZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgZGVidWcoJ0FwcFZpZXcudG9nZ2xlU3BsaXR0ZXInKTtcbiAgICAgIHRoaXMuJGVsLnRvZ2dsZUNsYXNzKCdzcGxpdCcpO1xuICAgICAgaWYgKHRoaXMuJGVsLmhhc0NsYXNzKCdzcGxpdCcpKSB7XG4gICAgICAgIHRoaXMuYWN0aXZhdGVTcGxpdHRlcigpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5kZWFjdGl2YXRlU3BsaXR0ZXIoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLmNlbnRyZU1hcCgpO1xuICAgIH0sXG4gICAgdG9nZ2xlU3luYzogZnVuY3Rpb24oKSB7XG4gICAgICBkZWJ1ZygnQXBwVmlldy50b2dnbGVTeW5jJyk7XG4gICAgICBpZiAodGhpcy4kKCcjc3luYycpWzBdLmNoZWNrZWQpIHtcbiAgICAgICAgdGhpcy4kKCcucmlnaHRtYXBzcHAnKS5wcm9wKCdkaXNhYmxlZCcsIHRydWUpO1xuICAgICAgICByZXR1cm4gdGhpcy5jb3B5U3BwVG9SaWdodFNpZGUoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB0aGlzLiQoJy5yaWdodG1hcHNwcCcpLnByb3AoJ2Rpc2FibGVkJywgZmFsc2UpO1xuICAgICAgfVxuICAgIH0sXG4gICAgZmV0Y2hTcGVjaWVzSW5mbzogZnVuY3Rpb24oKSB7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5mZXRjaFNwZWNpZXNJbmZvJyk7XG4gICAgICByZXR1cm4gJC5hamF4KHtcbiAgICAgICAgdXJsOiAnL2RhdGEvc3BlY2llcycsXG4gICAgICAgIGRhdGFUeXBlOiAnanNvbidcbiAgICAgIH0pLmRvbmUoKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgdmFyIGNvbW1vbk5hbWVXcml0ZXIsIHNwZWNpZXNMb29rdXBMaXN0LCBzcGVjaWVzU2NpTmFtZUxpc3QsIHNwZWNpZXNVcmxzO1xuICAgICAgICAgIHNwZWNpZXNMb29rdXBMaXN0ID0gW107XG4gICAgICAgICAgc3BlY2llc1NjaU5hbWVMaXN0ID0gW107XG4gICAgICAgICAgc3BlY2llc1VybHMgPSB7fTtcbiAgICAgICAgICBjb21tb25OYW1lV3JpdGVyID0gZnVuY3Rpb24oc2NpTmFtZSkge1xuICAgICAgICAgICAgdmFyIHNjaU5hbWVQb3N0Zml4O1xuICAgICAgICAgICAgc2NpTmFtZVBvc3RmaXggPSBcIiAoXCIgKyBzY2lOYW1lICsgXCIpXCI7XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oY25JbmRleCwgY24pIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHNwZWNpZXNMb29rdXBMaXN0LnB1c2goe1xuICAgICAgICAgICAgICAgIGxhYmVsOiBjbiArIHNjaU5hbWVQb3N0Zml4LFxuICAgICAgICAgICAgICAgIHZhbHVlOiBzY2lOYW1lXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9O1xuICAgICAgICAgICQuZWFjaChkYXRhLCBmdW5jdGlvbihzY2lOYW1lLCBzcHBJbmZvKSB7XG4gICAgICAgICAgICBzcGVjaWVzU2NpTmFtZUxpc3QucHVzaChzY2lOYW1lKTtcbiAgICAgICAgICAgIHNwZWNpZXNVcmxzW3NjaU5hbWVdID0gc3BwSW5mby5wYXRoO1xuICAgICAgICAgICAgaWYgKHNwcEluZm8uY29tbW9uTmFtZXMpIHtcbiAgICAgICAgICAgICAgcmV0dXJuICQuZWFjaChzcHBJbmZvLmNvbW1vbk5hbWVzLCBjb21tb25OYW1lV3JpdGVyKHNjaU5hbWUpKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHJldHVybiBzcGVjaWVzTG9va3VwTGlzdC5wdXNoKHtcbiAgICAgICAgICAgICAgICBsYWJlbDogc2NpTmFtZSxcbiAgICAgICAgICAgICAgICB2YWx1ZTogc2NpTmFtZVxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgICBfdGhpcy5zcGVjaWVzTG9va3VwTGlzdCA9IHNwZWNpZXNMb29rdXBMaXN0O1xuICAgICAgICAgIF90aGlzLnNwZWNpZXNTY2lOYW1lTGlzdCA9IHNwZWNpZXNTY2lOYW1lTGlzdDtcbiAgICAgICAgICByZXR1cm4gX3RoaXMuc3BlY2llc1VybHMgPSBzcGVjaWVzVXJscztcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKTtcbiAgICB9LFxuICAgIGZldGNoQmlvZGl2SW5mbzogZnVuY3Rpb24oKSB7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5mZXRjaEJpb2RpdkluZm8nKTtcbiAgICAgIHJldHVybiAkLmFqYXgoe1xuICAgICAgICB1cmw6ICcvZGF0YS9iaW9kaXZlcnNpdHknLFxuICAgICAgICBkYXRhVHlwZTogJ2pzb24nXG4gICAgICB9KS5kb25lKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgIHZhciBiaW9kaXZMaXN0LCBiaW9kaXZMb29rdXBMaXN0O1xuICAgICAgICAgIGJpb2Rpdkxpc3QgPSBbXTtcbiAgICAgICAgICBiaW9kaXZMb29rdXBMaXN0ID0gW107XG4gICAgICAgICAgJC5lYWNoKGRhdGEsIGZ1bmN0aW9uKGJpb2Rpdk5hbWUsIGJpb2RpdkluZm8pIHtcbiAgICAgICAgICAgIHZhciBiaW9kaXZDYXBOYW1lO1xuICAgICAgICAgICAgYmlvZGl2Q2FwTmFtZSA9IGJpb2Rpdk5hbWUucmVwbGFjZSgvXi4vLCBmdW5jdGlvbihjKSB7XG4gICAgICAgICAgICAgIHJldHVybiBjLnRvVXBwZXJDYXNlKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGJpb2Rpdkxpc3QucHVzaChiaW9kaXZOYW1lKTtcbiAgICAgICAgICAgIHJldHVybiBiaW9kaXZMb29rdXBMaXN0LnB1c2goe1xuICAgICAgICAgICAgICBsYWJlbDogXCJCaW9kaXZlcnNpdHkgb2YgXCIgKyBiaW9kaXZDYXBOYW1lLFxuICAgICAgICAgICAgICB2YWx1ZTogYmlvZGl2TmFtZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgX3RoaXMuYmlvZGl2TGlzdCA9IGJpb2Rpdkxpc3Q7XG4gICAgICAgICAgcmV0dXJuIF90aGlzLmJpb2Rpdkxvb2t1cExpc3QgPSBiaW9kaXZMb29rdXBMaXN0O1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpO1xuICAgIH0sXG4gICAgYnVpbGRMZWZ0Rm9ybTogZnVuY3Rpb24oKSB7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5idWlsZExlZnRGb3JtJyk7XG4gICAgICByZXR1cm4gJC53aGVuKHRoaXMuc3BlY2llc0luZm9GZXRjaFByb2Nlc3MsIHRoaXMuYmlvZGl2SW5mb0ZldGNoUHJvY2VzcykuZG9uZSgoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHZhciAkbGVmdG1hcHNwcDtcbiAgICAgICAgICAkbGVmdG1hcHNwcCA9IF90aGlzLiQoJyNsZWZ0bWFwc3BwJyk7XG4gICAgICAgICAgX3RoaXMubmFtZXNMaXN0ID0gX3RoaXMuYmlvZGl2TGlzdC5jb25jYXQoX3RoaXMuc3BlY2llc1NjaU5hbWVMaXN0KTtcbiAgICAgICAgICByZXR1cm4gJGxlZnRtYXBzcHAuYXV0b2NvbXBsZXRlKHtcbiAgICAgICAgICAgIHNvdXJjZTogX3RoaXMuYmlvZGl2TG9va3VwTGlzdC5jb25jYXQoX3RoaXMuc3BlY2llc0xvb2t1cExpc3QpLFxuICAgICAgICAgICAgY2xvc2U6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICByZXR1cm4gX3RoaXMuJGVsLnRyaWdnZXIoJ2xlZnRtYXB1cGRhdGUnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKTtcbiAgICB9LFxuICAgIGJ1aWxkUmlnaHRGb3JtOiBmdW5jdGlvbigpIHtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LmJ1aWxkUmlnaHRGb3JtJyk7XG4gICAgICByZXR1cm4gJC53aGVuKHRoaXMuc3BlY2llc0luZm9GZXRjaFByb2Nlc3MsIHRoaXMuYmlvZGl2SW5mb0ZldGNoUHJvY2VzcykuZG9uZSgoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHZhciAkcmlnaHRtYXBzcHA7XG4gICAgICAgICAgJHJpZ2h0bWFwc3BwID0gX3RoaXMuJCgnI3JpZ2h0bWFwc3BwJyk7XG4gICAgICAgICAgX3RoaXMubmFtZXNMaXN0ID0gX3RoaXMuYmlvZGl2TGlzdC5jb25jYXQoX3RoaXMuc3BlY2llc1NjaU5hbWVMaXN0KTtcbiAgICAgICAgICByZXR1cm4gJHJpZ2h0bWFwc3BwLmF1dG9jb21wbGV0ZSh7XG4gICAgICAgICAgICBjbG9zZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHJldHVybiBfdGhpcy4kZWwudHJpZ2dlcigncmlnaHRtYXB1cGRhdGUnKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzb3VyY2U6IGZ1bmN0aW9uKHJlcSwgcmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgcmV0dXJuICQuYWpheCh7XG4gICAgICAgICAgICAgICAgdXJsOiAnL2FwaS9uYW1lc2VhcmNoLycsXG4gICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgdGVybTogcmVxLnRlcm1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKGFuc3dlcikge1xuICAgICAgICAgICAgICAgICAgdmFyIGluZm8sIG5pY2UsIHNlbGVjdGFibGU7XG4gICAgICAgICAgICAgICAgICBzZWxlY3RhYmxlID0gW107XG4gICAgICAgICAgICAgICAgICBmb3IgKG5pY2UgaW4gYW5zd2VyKSB7XG4gICAgICAgICAgICAgICAgICAgIGluZm8gPSBhbnN3ZXJbbmljZV07XG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdGFibGUucHVzaChuaWNlKTtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMubWFwTGlzdFtpbmZvLm1hcElkXSA9IGluZm87XG4gICAgICAgICAgICAgICAgICAgIF90aGlzLm5pY2VJbmRleFtuaWNlXSA9IGluZm8ubWFwSWQ7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhhbnN3ZXIpO1xuICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coc2VsZWN0YWJsZSk7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2Uoc2VsZWN0YWJsZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKTtcbiAgICB9LFxuICAgIHN0YXJ0U3BsaXR0ZXJUcmFja2luZzogZnVuY3Rpb24oKSB7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5zdGFydFNwbGl0dGVyVHJhY2tpbmcnKTtcbiAgICAgIHRoaXMudHJhY2tTcGxpdHRlciA9IHRydWU7XG4gICAgICB0aGlzLnNwbGl0TGluZS5hZGRDbGFzcygnZHJhZ2dpbmcnKTtcbiAgICAgIHJldHVybiB0aGlzLmxvY2F0ZVNwbGl0dGVyKCk7XG4gICAgfSxcbiAgICBsb2NhdGVTcGxpdHRlcjogZnVuY3Rpb24oKSB7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5sb2NhdGVTcGxpdHRlcicpO1xuICAgICAgaWYgKHRoaXMudHJhY2tTcGxpdHRlcikge1xuICAgICAgICB0aGlzLnJlc2l6ZVRoaW5ncygpO1xuICAgICAgICBpZiAodGhpcy50cmFja1NwbGl0dGVyID09PSAwKSB7XG4gICAgICAgICAgdGhpcy50cmFja1NwbGl0dGVyID0gZmFsc2U7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy50cmFja1NwbGl0dGVyICE9PSB0cnVlKSB7XG4gICAgICAgICAgdGhpcy50cmFja1NwbGl0dGVyIC09IDE7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQodGhpcy5sb2NhdGVTcGxpdHRlciwgdGhpcy50cmFja1BlcmlvZCk7XG4gICAgICB9XG4gICAgfSxcbiAgICByZXNpemVUaGluZ3M6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyICRtYXBCb3gsIGJvdHRvbVJpZ2h0LCBsYXllckJvdHRvbSwgbGF5ZXJUb3AsIGxlZnRMZWZ0LCBsZWZ0TWFwLCBtYXBCb3VuZHMsIG1hcEJveCwgbmV3TGVmdFdpZHRoLCByaWdodE1hcCwgcmlnaHRSaWdodCwgc3BsaXRQb2ludCwgc3BsaXRYLCB0b3BMZWZ0O1xuICAgICAgZGVidWcoJ0FwcFZpZXcucmVzaXplVGhpbmdzJyk7XG4gICAgICBpZiAodGhpcy5sZWZ0TGF5ZXIpIHtcbiAgICAgICAgbGVmdE1hcCA9ICQodGhpcy5sZWZ0TGF5ZXIuZ2V0Q29udGFpbmVyKCkpO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMucmlnaHRMYXllcikge1xuICAgICAgICByaWdodE1hcCA9ICQodGhpcy5yaWdodExheWVyLmdldENvbnRhaW5lcigpKTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLiRlbC5oYXNDbGFzcygnc3BsaXQnKSkge1xuICAgICAgICBuZXdMZWZ0V2lkdGggPSB0aGlzLnNwbGl0VGh1bWIucG9zaXRpb24oKS5sZWZ0ICsgKHRoaXMuc3BsaXRUaHVtYi53aWR0aCgpIC8gMi4wKTtcbiAgICAgICAgbWFwQm94ID0gdGhpcy5tYXAuZ2V0Q29udGFpbmVyKCk7XG4gICAgICAgICRtYXBCb3ggPSAkKG1hcEJveCk7XG4gICAgICAgIG1hcEJvdW5kcyA9IG1hcEJveC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgdG9wTGVmdCA9IHRoaXMubWFwLmNvbnRhaW5lclBvaW50VG9MYXllclBvaW50KFswLCAwXSk7XG4gICAgICAgIHNwbGl0UG9pbnQgPSB0aGlzLm1hcC5jb250YWluZXJQb2ludFRvTGF5ZXJQb2ludChbbmV3TGVmdFdpZHRoLCAwXSk7XG4gICAgICAgIGJvdHRvbVJpZ2h0ID0gdGhpcy5tYXAuY29udGFpbmVyUG9pbnRUb0xheWVyUG9pbnQoWyRtYXBCb3gud2lkdGgoKSwgJG1hcEJveC5oZWlnaHQoKV0pO1xuICAgICAgICBsYXllclRvcCA9IHRvcExlZnQueTtcbiAgICAgICAgbGF5ZXJCb3R0b20gPSBib3R0b21SaWdodC55O1xuICAgICAgICBzcGxpdFggPSBzcGxpdFBvaW50LnggLSBtYXBCb3VuZHMubGVmdDtcbiAgICAgICAgbGVmdExlZnQgPSB0b3BMZWZ0LnggLSBtYXBCb3VuZHMubGVmdDtcbiAgICAgICAgcmlnaHRSaWdodCA9IGJvdHRvbVJpZ2h0Lng7XG4gICAgICAgIHRoaXMuc3BsaXRMaW5lLmNzcygnbGVmdCcsIG5ld0xlZnRXaWR0aCk7XG4gICAgICAgIHRoaXMubGVmdFRhZy5hdHRyKCdzdHlsZScsIFwiY2xpcDogcmVjdCgwLCBcIiArIG5ld0xlZnRXaWR0aCArIFwicHgsIGF1dG8sIDApXCIpO1xuICAgICAgICBpZiAodGhpcy5sZWZ0TGF5ZXIpIHtcbiAgICAgICAgICBsZWZ0TWFwLmF0dHIoJ3N0eWxlJywgXCJjbGlwOiByZWN0KFwiICsgbGF5ZXJUb3AgKyBcInB4LCBcIiArIHNwbGl0WCArIFwicHgsIFwiICsgbGF5ZXJCb3R0b20gKyBcInB4LCBcIiArIGxlZnRMZWZ0ICsgXCJweClcIik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMucmlnaHRMYXllcikge1xuICAgICAgICAgIHJldHVybiByaWdodE1hcC5hdHRyKCdzdHlsZScsIFwiY2xpcDogcmVjdChcIiArIGxheWVyVG9wICsgXCJweCwgXCIgKyByaWdodFJpZ2h0ICsgXCJweCwgXCIgKyBsYXllckJvdHRvbSArIFwicHgsIFwiICsgc3BsaXRYICsgXCJweClcIik7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMubGVmdFRhZy5hdHRyKCdzdHlsZScsICdjbGlwOiBpbmhlcml0Jyk7XG4gICAgICAgIGlmICh0aGlzLmxlZnRMYXllcikge1xuICAgICAgICAgIGxlZnRNYXAuYXR0cignc3R5bGUnLCAnY2xpcDogaW5oZXJpdCcpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnJpZ2h0TGF5ZXIpIHtcbiAgICAgICAgICByZXR1cm4gcmlnaHRNYXAuYXR0cignc3R5bGUnLCAnY2xpcDogcmVjdCgwLDAsMCwwKScpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICBzdG9wU3BsaXR0ZXJUcmFja2luZzogZnVuY3Rpb24oKSB7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5zdG9wU3BsaXR0ZXJUcmFja2luZycpO1xuICAgICAgdGhpcy5zcGxpdExpbmUucmVtb3ZlQ2xhc3MoJ2RyYWdnaW5nJyk7XG4gICAgICByZXR1cm4gdGhpcy50cmFja1NwbGl0dGVyID0gNTtcbiAgICB9LFxuICAgIGFjdGl2YXRlU3BsaXR0ZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgZGVidWcoJ0FwcFZpZXcuYWN0aXZhdGVTcGxpdHRlcicpO1xuICAgICAgdGhpcy5zcGxpdFRodW1iLmRyYWdnYWJsZSh7XG4gICAgICAgIGNvbnRhaW5tZW50OiAkKCcjbWFwd3JhcHBlcicpLFxuICAgICAgICBzY3JvbGw6IGZhbHNlLFxuICAgICAgICBzdGFydDogdGhpcy5zdGFydFNwbGl0dGVyVHJhY2tpbmcsXG4gICAgICAgIGRyYWc6IHRoaXMucmVzaXplVGhpbmdzLFxuICAgICAgICBzdG9wOiB0aGlzLnN0b3BTcGxpdHRlclRyYWNraW5nXG4gICAgICB9KTtcbiAgICAgIHJldHVybiB0aGlzLnJlc2l6ZVRoaW5ncygpO1xuICAgIH0sXG4gICAgZGVhY3RpdmF0ZVNwbGl0dGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LmRlYWN0aXZhdGVTcGxpdHRlcicpO1xuICAgICAgdGhpcy5zcGxpdFRodW1iLmRyYWdnYWJsZSgnZGVzdHJveScpO1xuICAgICAgcmV0dXJuIHRoaXMucmVzaXplVGhpbmdzKCk7XG4gICAgfVxuICB9LCB7XG4gICAgdGVtcGxhdGVzOiB7XG4gICAgICBsYXlvdXQ6IF8udGVtcGxhdGUoXCI8ZGl2IGNsYXM9XFxcInVpLWZyb250XFxcIj48L2Rpdj5cXG48ZGl2IGNsYXNzPVxcXCJzcGxpdGxpbmVcXFwiPiZuYnNwOzwvZGl2PlxcbjxkaXYgY2xhc3M9XFxcInNwbGl0dGh1bWJcXFwiPjxzcGFuPiYjeDI3NmU7ICYjeDI3NmY7PC9zcGFuPjwvZGl2PlxcbjxkaXYgY2xhc3M9XFxcImxlZnQgdGFnXFxcIj48JT0gbGVmdFRhZyAlPjwvZGl2PlxcbjxkaXYgY2xhc3M9XFxcInJpZ2h0IHRhZ1xcXCI+PCU9IHJpZ2h0VGFnICU+PC9kaXY+XFxuPGRpdiBjbGFzcz1cXFwibGVmdCBzaWRlIGZvcm1cXFwiPjwlPSBsZWZ0Rm9ybSAlPjwvZGl2PlxcbjxkaXYgY2xhc3M9XFxcInJpZ2h0IHNpZGUgZm9ybVxcXCI+PCU9IHJpZ2h0Rm9ybSAlPjwvZGl2PlxcbjxkaXYgY2xhc3M9XFxcImxlZnQgbG9hZGVyXFxcIj48aW1nIHNyYz1cXFwiL3N0YXRpYy9pbWFnZXMvc3Bpbm5lci5sb2FkaW5mby5uZXQuZ2lmXFxcIiAvPjwvZGl2PlxcbjxkaXYgY2xhc3M9XFxcInJpZ2h0IGxvYWRlclxcXCI+PGltZyBzcmM9XFxcIi9zdGF0aWMvaW1hZ2VzL3NwaW5uZXIubG9hZGluZm8ubmV0LmdpZlxcXCIgLz48L2Rpdj5cXG48ZGl2IGlkPVxcXCJtYXB3cmFwcGVyXFxcIj48ZGl2IGlkPVxcXCJtYXBcXFwiPjwvZGl2PjwvZGl2PlwiKSxcbiAgICAgIGxlZnRUYWc6IF8udGVtcGxhdGUoXCI8ZGl2IGNsYXNzPVxcXCJzaG93XFxcIj5cXG4gICAgPHNwYW4gY2xhc3M9XFxcImxlZnRsYXllcm5hbWVcXFwiPnBsYWluIG1hcDwvc3Bhbj5cXG4gICAgPGJyPlxcbiAgICA8YnV0dG9uIGNsYXNzPVxcXCJidG4tY2hhbmdlXFxcIj5zZXR0aW5nczwvYnV0dG9uPlxcbiAgICA8YnV0dG9uIGNsYXNzPVxcXCJidG4tY29tcGFyZVxcXCI+c2hvdy9oaWRlIGNvbXBhcmlzb24gbWFwPC9idXR0b24+XFxuPC9kaXY+XFxuPGRpdiBjbGFzcz1cXFwiZWRpdFxcXCI+XFxuICAgIDxsYWJlbCBjbGFzcz1cXFwibGVmdCBzeW5jYm94XFxcIj48L2xhYmVsPlxcbiAgICA8aW5wdXQgaWQ9XFxcImxlZnRtYXBzcHBcXFwiIGNsYXNzPVxcXCJsZWZ0XFxcIiB0eXBlPVxcXCJ0ZXh0XFxcIiBuYW1lPVxcXCJsZWZ0bWFwc3BwXFxcIiBwbGFjZWhvbGRlcj1cXFwiJmhlbGxpcDsgc3BlY2llcyBvciBncm91cCAmaGVsbGlwO1xcXCIgLz5cXG48L2Rpdj5cIiksXG4gICAgICByaWdodFRhZzogXy50ZW1wbGF0ZShcIjxkaXYgY2xhc3M9XFxcInNob3dcXFwiPlxcbiAgICA8c3BhbiBjbGFzcz1cXFwicmlnaHRsYXllcm5hbWVcXFwiPihubyBkaXN0cmlidXRpb24pPC9zcGFuPlxcbiAgICA8YnI+XFxuICAgIDxidXR0b24gY2xhc3M9XFxcImJ0bi1jaGFuZ2VcXFwiPnNldHRpbmdzPC9idXR0b24+XFxuICAgIDxidXR0b24gY2xhc3M9XFxcImJ0bi1jb21wYXJlXFxcIj5zaG93L2hpZGUgY29tcGFyaXNvbiBtYXA8L2J1dHRvbj5cXG48L2Rpdj5cXG48ZGl2IGNsYXNzPVxcXCJlZGl0XFxcIj5cXG4gICAgPGxhYmVsIGNsYXNzPVxcXCJyaWdodCBzeW5jYm94XFxcIj48aW5wdXQgaWQ9XFxcInN5bmNcXFwiIHR5cGU9XFxcImNoZWNrYm94XFxcIiB2YWx1ZT1cXFwic3luY1xcXCIgY2hlY2tlZD1cXFwiY2hlY2tlZFxcXCIgLz4gc2FtZSBhcyBsZWZ0IHNpZGU8L2xhYmVsPlxcbiAgICA8aW5wdXQgaWQ9XFxcInJpZ2h0bWFwc3BwXFxcIiB0eXBlPVxcXCJ0ZXh0XFxcIiBjbGFzcz1cXFwicmlnaHRcXFwiIG5hbWU9XFxcInJpZ2h0bWFwc3BwXFxcIiBwbGFjZWhvbGRlcj1cXFwiJmhlbGxpcDsgc3BlY2llcyBvciBncm91cCAmaGVsbGlwO1xcXCIgLz5cXG48L2Rpdj5cIiksXG4gICAgICBsZWZ0Rm9ybTogXy50ZW1wbGF0ZShcIjxmaWVsZHNldD5cXG4gICAgPGxlZ2VuZD50ZW1wZXJhdHVyZSBjaGFuZ2U8L2xlZ2VuZD5cXG4gICAgPHNlbGVjdCBjbGFzcz1cXFwibGVmdFxcXCIgaWQ9XFxcImxlZnRtYXBkZWdzXFxcIj5cXG4gICAgICAgIDxvcHRpb24gdmFsdWU9XFxcImN1cnJlbnRcXFwiPmN1cnJlbnQ8L29wdGlvbj5cXG4gICAgICAgIDxvcHRpb24gdmFsdWU9XFxcIjEuNVxcXCI+MS41ICZkZWc7Qzwvb3B0aW9uPlxcbiAgICAgICAgPG9wdGlvbiB2YWx1ZT1cXFwiMlxcXCI+Mi4wICZkZWc7Qzwvb3B0aW9uPlxcbiAgICAgICAgPG9wdGlvbiB2YWx1ZT1cXFwiMi43XFxcIj4yLjcgJmRlZztDPC9vcHRpb24+XFxuICAgICAgICA8b3B0aW9uIHZhbHVlPVxcXCIzLjJcXFwiPjMuMiAmZGVnO0M8L29wdGlvbj5cXG4gICAgICAgIDxvcHRpb24gdmFsdWU9XFxcIjQuNVxcXCI+NC41ICZkZWc7Qzwvb3B0aW9uPlxcbiAgICAgICAgPG9wdGdyb3VwIGxhYmVsPVxcXCJIaWdoIHNlbnNpdGl2aXR5IGNsaW1hdGVcXFwiPlxcbiAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XFxcIjZcXFwiPjYuMCAmZGVnO0M8L29wdGlvbj5cXG4gICAgICAgIDwvb3B0Z3JvdXA+XFxuICAgIDwvc2VsZWN0PlxcbjwvZmllbGRzZXQ+XFxuPGZpZWxkc2V0PlxcbiAgICA8bGVnZW5kPmFkYXB0YXRpb24gdmlhIHJhbmdlIHNoaWZ0PC9sZWdlbmQ+XFxuICAgIDxsYWJlbD48IS0tIHNwYW4+bm9uZTwvc3BhbiAtLT4gPGlucHV0IG5hbWU9XFxcImxlZnRtYXByYW5nZVxcXCIgY2xhc3M9XFxcImxlZnRcXFwiIHR5cGU9XFxcInJhZGlvXFxcIiB2YWx1ZT1cXFwibm8uZGlzcFxcXCIgY2hlY2tlZD1cXFwiY2hlY2tlZFxcXCI+IHNwZWNpZXMgY2Fubm90IHNoaWZ0IHJhbmdlczwvbGFiZWw+XFxuICAgIDxsYWJlbD48IS0tIHNwYW4+YWxsb3c8L3NwYW4gLS0+IDxpbnB1dCBuYW1lPVxcXCJsZWZ0bWFwcmFuZ2VcXFwiIGNsYXNzPVxcXCJsZWZ0XFxcIiB0eXBlPVxcXCJyYWRpb1xcXCIgdmFsdWU9XFxcInJlYWwuZGlzcFxcXCI+IGFsbG93IHJhbmdlIGFkYXB0YXRpb248L2xhYmVsPlxcbjwvZmllbGRzZXQ+XFxuPGZpZWxkc2V0PlxcbiAgICA8bGVnZW5kPm1vZGVsIHN1bW1hcnk8L2xlZ2VuZD5cXG4gICAgPHNlbGVjdCBjbGFzcz1cXFwibGVmdFxcXCIgaWQ9XFxcImxlZnRtYXBjb25maWRlbmNlXFxcIj5cXG4gICAgICAgIDxvcHRpb24gdmFsdWU9XFxcIjEwXFxcIj4xMHRoIHBlcmNlbnRpbGU8L29wdGlvbj5cXG4gICAgICAgIDwhLS0gb3B0aW9uIHZhbHVlPVxcXCIzM1xcXCI+MzNyZCBwZXJjZW50aWxlPC9vcHRpb24gLS0+XFxuICAgICAgICA8b3B0aW9uIHZhbHVlPVxcXCI1MFxcXCIgc2VsZWN0ZWQ9XFxcInNlbGVjdGVkXFxcIj41MHRoIHBlcmNlbnRpbGU8L29wdGlvbj5cXG4gICAgICAgIDwhLS0gb3B0aW9uIHZhbHVlPVxcXCI2NlxcXCI+NjZ0aCBwZXJjZW50aWxlPC9vcHRpb24gLS0+XFxuICAgICAgICA8b3B0aW9uIHZhbHVlPVxcXCI5MFxcXCI+OTB0aCBwZXJjZW50aWxlPC9vcHRpb24+XFxuICAgIDwvc2VsZWN0PlxcbjwvZmllbGRzZXQ+XFxuPGZpZWxkc2V0IGNsYXNzPVxcXCJibGFua1xcXCI+XFxuICAgIDxidXR0b24gdHlwZT1cXFwiYnV0dG9uXFxcIiBjbGFzcz1cXFwiYnRuLWNoYW5nZVxcXCI+aGlkZSBzZXR0aW5nczwvYnV0dG9uPlxcbiAgICA8YnV0dG9uIHR5cGU9XFxcImJ1dHRvblxcXCIgY2xhc3M9XFxcImJ0bi1jb21wYXJlXFxcIj5oaWRlL3Nob3cgcmlnaHQgbWFwPC9idXR0b24+XFxuICAgIDxidXR0b24gdHlwZT1cXFwiYnV0dG9uXFxcIiBjbGFzcz1cXFwiYnRuLWNvcHkgcmlnaHQtdmFsaWQtbWFwXFxcIj5jb3B5IHJpZ2h0IG1hcCAmbGFxdW87PC9idXR0b24+XFxuICAgIDxhIGlkPVxcXCJsZWZ0bWFwZGxcXFwiIGNsYXNzPVxcXCJkb3dubG9hZCBsZWZ0LXZhbGlkLW1hcFxcXCIgaHJlZj1cXFwiXFxcIiBkaXNhYmxlZD1cXFwiZGlzYWJsZWRcXFwiPmRvd25sb2FkIGp1c3QgdGhpcyBtYXA8YnI+KDwxTWIgR2VvVElGRik8L2E+XFxuPC9maWVsZHNldD5cXG5cIiksXG4gICAgICByaWdodEZvcm06IF8udGVtcGxhdGUoXCI8ZmllbGRzZXQ+XFxuICAgIDxsZWdlbmQ+dGVtcGVyYXR1cmUgY2hhbmdlPC9sZWdlbmQ+XFxuICAgIDxzZWxlY3QgY2xhc3M9XFxcInJpZ2h0XFxcIiBpZD1cXFwicmlnaHRtYXBkZWdzXFxcIj5cXG4gICAgICAgIDxvcHRpb24gdmFsdWU9XFxcImN1cnJlbnRcXFwiPmN1cnJlbnQ8L29wdGlvbj5cXG4gICAgICAgIDxvcHRpb24gdmFsdWU9XFxcIjEuNVxcXCI+MS41ICZkZWc7Qzwvb3B0aW9uPlxcbiAgICAgICAgPG9wdGlvbiB2YWx1ZT1cXFwiMlxcXCI+Mi4wICZkZWc7Qzwvb3B0aW9uPlxcbiAgICAgICAgPG9wdGlvbiB2YWx1ZT1cXFwiMi43XFxcIj4yLjcgJmRlZztDPC9vcHRpb24+XFxuICAgICAgICA8b3B0aW9uIHZhbHVlPVxcXCIzLjJcXFwiPjMuMiAmZGVnO0M8L29wdGlvbj5cXG4gICAgICAgIDxvcHRpb24gdmFsdWU9XFxcIjQuNVxcXCI+NC41ICZkZWc7Qzwvb3B0aW9uPlxcbiAgICAgICAgPG9wdGdyb3VwIGxhYmVsPVxcXCJIaWdoIHNlbnNpdGl2aXR5IGNsaW1hdGVcXFwiPlxcbiAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XFxcIjZcXFwiPjYuMCAmZGVnO0M8L29wdGlvbj5cXG4gICAgICAgIDwvb3B0Z3JvdXA+XFxuICAgIDwvc2VsZWN0PlxcbjwvZmllbGRzZXQ+XFxuPGZpZWxkc2V0PlxcbiAgICA8bGVnZW5kPmFkYXB0YXRpb24gdmlhIHJhbmdlIHNoaWZ0PC9sZWdlbmQ+XFxuICAgIDxsYWJlbD48IS0tIHNwYW4+bm9uZTwvc3BhbiAtLT4gPGlucHV0IG5hbWU9XFxcInJpZ2h0bWFwcmFuZ2VcXFwiIGNsYXNzPVxcXCJyaWdodFxcXCIgdHlwZT1cXFwicmFkaW9cXFwiIHZhbHVlPVxcXCJuby5kaXNwXFxcIiBjaGVja2VkPVxcXCJjaGVja2VkXFxcIj4gc3BlY2llcyBjYW5ub3Qgc2hpZnQgcmFuZ2VzPC9sYWJlbD5cXG4gICAgPGxhYmVsPjwhLS0gc3Bhbj5hbGxvdzwvc3BhbiAtLT4gPGlucHV0IG5hbWU9XFxcInJpZ2h0bWFwcmFuZ2VcXFwiIGNsYXNzPVxcXCJyaWdodFxcXCIgdHlwZT1cXFwicmFkaW9cXFwiIHZhbHVlPVxcXCJyZWFsLmRpc3BcXFwiPiBhbGxvdyByYW5nZSBhZGFwdGF0aW9uPC9sYWJlbD5cXG48L2ZpZWxkc2V0PlxcbjxmaWVsZHNldD5cXG4gICAgPGxlZ2VuZD5tb2RlbCBzdW1tYXJ5PC9sZWdlbmQ+XFxuICAgIDxzZWxlY3QgY2xhc3M9XFxcInJpZ2h0XFxcIiBpZD1cXFwicmlnaHRtYXBjb25maWRlbmNlXFxcIj5cXG4gICAgICAgIDxvcHRpb24gdmFsdWU9XFxcIjEwXFxcIj4xMHRoIHBlcmNlbnRpbGU8L29wdGlvbj5cXG4gICAgICAgIDwhLS0gb3B0aW9uIHZhbHVlPVxcXCIzM1xcXCI+MzNyZCBwZXJjZW50aWxlPC9vcHRpb24gLS0+XFxuICAgICAgICA8b3B0aW9uIHZhbHVlPVxcXCI1MFxcXCIgc2VsZWN0ZWQ9XFxcInNlbGVjdGVkXFxcIj41MHRoIHBlcmNlbnRpbGU8L29wdGlvbj5cXG4gICAgICAgIDwhLS0gb3B0aW9uIHZhbHVlPVxcXCI2NlxcXCI+NjZ0aCBwZXJjZW50aWxlPC9vcHRpb24gLS0+XFxuICAgICAgICA8b3B0aW9uIHZhbHVlPVxcXCI5MFxcXCI+OTB0aCBwZXJjZW50aWxlPC9vcHRpb24+XFxuICAgIDwvc2VsZWN0PlxcbjwvZmllbGRzZXQ+XFxuPGZpZWxkc2V0IGNsYXNzPVxcXCJibGFua1xcXCI+XFxuICAgIDxidXR0b24gdHlwZT1cXFwiYnV0dG9uXFxcIiBjbGFzcz1cXFwiYnRuLWNoYW5nZVxcXCI+aGlkZSBzZXR0aW5nczwvYnV0dG9uPlxcbiAgICA8YnV0dG9uIHR5cGU9XFxcImJ1dHRvblxcXCIgY2xhc3M9XFxcImJ0bi1jb21wYXJlXFxcIj5oaWRlL3Nob3cgcmlnaHQgbWFwPC9idXR0b24+XFxuICAgIDxidXR0b24gdHlwZT1cXFwiYnV0dG9uXFxcIiBjbGFzcz1cXFwiYnRuLWNvcHkgbGVmdC12YWxpZC1tYXBcXFwiPmNvcHkgbGVmdCBtYXAgJmxhcXVvOzwvYnV0dG9uPlxcbiAgICA8YSBpZD1cXFwicmlnaHRtYXBkbFxcXCIgY2xhc3M9XFxcImRvd25sb2FkIHJpZ2h0LXZhbGlkLW1hcFxcXCIgaHJlZj1cXFwiXFxcIiBkaXNhYmxlZD1cXFwiZGlzYWJsZWRcXFwiPmRvd25sb2FkIGp1c3QgdGhpcyBtYXA8YnI+KDwxTWIgR2VvVElGRik8L2E+XFxuPC9maWVsZHNldD5cXG5cIilcbiAgICB9XG4gIH0pO1xuXG4gIG1vZHVsZS5leHBvcnRzID0gQXBwVmlldztcblxufSkuY2FsbCh0aGlzKTtcbiJdfQ==
