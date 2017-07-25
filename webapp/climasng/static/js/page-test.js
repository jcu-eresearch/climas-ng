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
      var atCurrent, currInfo, newInfo, sciNameMatch, sciNameMatcher, _ref;
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
      if ((_ref = newInfo.speciesName, __indexOf.call(this.namesList, _ref) >= 0) || newInfo.niceName in this.niceIndex) {
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
          console.log('getting right side map.');
          console.log('side info is ', sideInfo);
          console.log('@niceIndex[sideInfo.niceName] is ', this.niceIndex[sideInfo.niceName]);
          info = this.mapList[this.niceIndex[sideInfo.niceName]];
          console.log('info is ', info);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9wdnJkd2IvcHJvamVjdHMvY2xpbWFzLWdsb2JhbC93ZWJhcHAvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi9Vc2Vycy9wdnJkd2IvcHJvamVjdHMvY2xpbWFzLWdsb2JhbC93ZWJhcHAvY2xpbWFzbmcvc3JjL2pzL2Zha2VfNDQ4OTgwYTguanMiLCIvVXNlcnMvcHZyZHdiL3Byb2plY3RzL2NsaW1hcy1nbG9iYWwvd2ViYXBwL2NsaW1hc25nL3NyYy9qcy9tYXB2aWV3L21haW4uanMiLCIvVXNlcnMvcHZyZHdiL3Byb2plY3RzL2NsaW1hcy1nbG9iYWwvd2ViYXBwL2NsaW1hc25nL3NyYy9qcy9tYXB2aWV3L21vZGVscy9tYXBsYXllci5qcyIsIi9Vc2Vycy9wdnJkd2IvcHJvamVjdHMvY2xpbWFzLWdsb2JhbC93ZWJhcHAvY2xpbWFzbmcvc3JjL2pzL21hcHZpZXcvdXRpbC9zaGltcy5qcyIsIi9Vc2Vycy9wdnJkd2IvcHJvamVjdHMvY2xpbWFzLWdsb2JhbC93ZWJhcHAvY2xpbWFzbmcvc3JjL2pzL21hcHZpZXcvdmlld3MvYXBwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcbnJlcXVpcmUoJy4vbWFwdmlldy9tYWluJyk7XG5cbiQoJ2hlYWRlcicpLmRpc2FibGVTZWxlY3Rpb24oKTsgLy8gdW5wb3B1bGFyIGJ1dCBzdGlsbCBiZXR0ZXJcbiQoJ25hdiA+IHVsJykubXNwcCh7fSk7XG4iLCIoZnVuY3Rpb24oKSB7XG4gIHZhciBBcHBWaWV3O1xuXG4gIGlmICghd2luZG93LmNvbnNvbGUpIHtcbiAgICB3aW5kb3cuY29uc29sZSA9IHtcbiAgICAgIGxvZzogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB7fTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgQXBwVmlldyA9IHJlcXVpcmUoJy4vdmlld3MvYXBwJyk7XG5cbiAgJChmdW5jdGlvbigpIHtcbiAgICB2YXIgYXBwdmlldztcbiAgICBhcHB2aWV3ID0gbmV3IEFwcFZpZXcoKTtcbiAgICByZXR1cm4gYXBwdmlldy5yZW5kZXIoKTtcbiAgfSk7XG5cbn0pLmNhbGwodGhpcyk7XG4iLCIoZnVuY3Rpb24oKSB7XG4gIHZhciBNYXBMYXllcjtcblxuICBNYXBMYXllciA9IEJhY2tib25lLk1vZGVsLmV4dGVuZCh7XG4gICAgY29uc3RydWN0b3I6IGZ1bmN0aW9uKHNob3J0TmFtZSwgbG9uZ05hbWUsIHBhdGgpIHtcbiAgICAgIHRoaXMuc2hvcnROYW1lID0gc2hvcnROYW1lO1xuICAgICAgdGhpcy5sb25nTmFtZSA9IGxvbmdOYW1lO1xuICAgICAgdGhpcy5wYXRoID0gcGF0aDtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfSk7XG5cbiAgbW9kdWxlLmV4cG9ydHMgPSBNYXBMYXllcjtcblxufSkuY2FsbCh0aGlzKTtcbiIsIihmdW5jdGlvbigpIHtcbiAgdmFyIF9faW5kZXhPZiA9IFtdLmluZGV4T2YgfHwgZnVuY3Rpb24oaXRlbSkgeyBmb3IgKHZhciBpID0gMCwgbCA9IHRoaXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7IGlmIChpIGluIHRoaXMgJiYgdGhpc1tpXSA9PT0gaXRlbSkgcmV0dXJuIGk7IH0gcmV0dXJuIC0xOyB9O1xuXG4gIGlmICghQXJyYXkucHJvdG90eXBlLmZvckVhY2gpIHtcbiAgICBBcnJheS5wcm90b3R5cGUuZm9yRWFjaCA9IGZ1bmN0aW9uKGZuLCBzY29wZSkge1xuICAgICAgdmFyIGksIF9pLCBfcmVmLCBfcmVzdWx0cztcbiAgICAgIF9yZXN1bHRzID0gW107XG4gICAgICBmb3IgKGkgPSBfaSA9IDAsIF9yZWYgPSB0aGlzLmxlbmd0aDsgMCA8PSBfcmVmID8gX2kgPD0gX3JlZiA6IF9pID49IF9yZWY7IGkgPSAwIDw9IF9yZWYgPyArK19pIDogLS1faSkge1xuICAgICAgICBfcmVzdWx0cy5wdXNoKF9faW5kZXhPZi5jYWxsKHRoaXMsIGkpID49IDAgPyBmbi5jYWxsKHNjb3BlLCB0aGlzW2ldLCBpLCB0aGlzKSA6IHZvaWQgMCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gX3Jlc3VsdHM7XG4gICAgfTtcbiAgfVxuXG4gIGlmICghQXJyYXkucHJvdG90eXBlLmluZGV4T2YpIHtcbiAgICBBcnJheS5wcm90b3R5cGUuaW5kZXhPZiA9IGZ1bmN0aW9uKG5lZWRsZSkge1xuICAgICAgdmFyIGksIF9pLCBfcmVmO1xuICAgICAgZm9yIChpID0gX2kgPSAwLCBfcmVmID0gdGhpcy5sZW5ndGg7IDAgPD0gX3JlZiA/IF9pIDw9IF9yZWYgOiBfaSA+PSBfcmVmOyBpID0gMCA8PSBfcmVmID8gKytfaSA6IC0tX2kpIHtcbiAgICAgICAgaWYgKHRoaXNbaV0gPT09IG5lZWRsZSkge1xuICAgICAgICAgIHJldHVybiBpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gLTE7XG4gICAgfTtcbiAgfVxuXG59KS5jYWxsKHRoaXMpO1xuIiwiKGZ1bmN0aW9uKCkge1xuICB2YXIgQXBwVmlldywgTWFwTGF5ZXIsIGRlYnVnLFxuICAgIF9faW5kZXhPZiA9IFtdLmluZGV4T2YgfHwgZnVuY3Rpb24oaXRlbSkgeyBmb3IgKHZhciBpID0gMCwgbCA9IHRoaXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7IGlmIChpIGluIHRoaXMgJiYgdGhpc1tpXSA9PT0gaXRlbSkgcmV0dXJuIGk7IH0gcmV0dXJuIC0xOyB9O1xuXG4gIE1hcExheWVyID0gcmVxdWlyZSgnLi4vbW9kZWxzL21hcGxheWVyJyk7XG5cbiAgcmVxdWlyZSgnLi4vdXRpbC9zaGltcycpO1xuXG5cbiAgLyoganNoaW50IC1XMDkzICovXG5cbiAgZGVidWcgPSBmdW5jdGlvbihpdGVtVG9Mb2csIGl0ZW1MZXZlbCkge1xuICAgIHZhciBsZXZlbHMsIG1lc3NhZ2VOdW0sIHRocmVzaG9sZCwgdGhyZXNob2xkTnVtO1xuICAgIGxldmVscyA9IFsndmVyeWRlYnVnJywgJ2RlYnVnJywgJ21lc3NhZ2UnLCAnd2FybmluZyddO1xuICAgIGlmICghaXRlbUxldmVsKSB7XG4gICAgICBpdGVtTGV2ZWwgPSAnZGVidWcnO1xuICAgIH1cbiAgICB0aHJlc2hvbGQgPSAnZGVidWcnO1xuICAgIHRocmVzaG9sZE51bSA9IGxldmVscy5pbmRleE9mKHRocmVzaG9sZCk7XG4gICAgbWVzc2FnZU51bSA9IGxldmVscy5pbmRleE9mKGl0ZW1MZXZlbCk7XG4gICAgaWYgKHRocmVzaG9sZE51bSA+IG1lc3NhZ2VOdW0pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKGl0ZW1Ub0xvZyArICcnID09PSBpdGVtVG9Mb2cpIHtcbiAgICAgIHJldHVybiBjb25zb2xlLmxvZyhcIltcIiArIGl0ZW1MZXZlbCArIFwiXSBcIiArIGl0ZW1Ub0xvZyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBjb25zb2xlLmxvZyhpdGVtVG9Mb2cpO1xuICAgIH1cbiAgfTtcblxuICBBcHBWaWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xuICAgIHRhZ05hbWU6ICdkaXYnLFxuICAgIGNsYXNzTmFtZTogJ3NwbGl0bWFwIHNob3dmb3JtcycsXG4gICAgaWQ6ICdzcGxpdG1hcCcsXG4gICAgc3BlY2llc0RhdGFVcmw6IHdpbmRvdy5tYXBDb25maWcuc3BlY2llc0RhdGFVcmwsXG4gICAgY2xpbWF0ZURhdGFVcmw6IHdpbmRvdy5tYXBDb25maWcuY2xpbWF0ZURhdGFVcmwsXG4gICAgYmlvZGl2RGF0YVVybDogd2luZG93Lm1hcENvbmZpZy5iaW9kaXZEYXRhVXJsLFxuICAgIHJhc3RlckFwaVVybDogd2luZG93Lm1hcENvbmZpZy5yYXN0ZXJBcGlVcmwsXG4gICAgdHJhY2tTcGxpdHRlcjogZmFsc2UsXG4gICAgdHJhY2tQZXJpb2Q6IDEwMCxcbiAgICBldmVudHM6IHtcbiAgICAgICdjbGljayAuYnRuLWNoYW5nZSc6ICd0b2dnbGVGb3JtcycsXG4gICAgICAnY2xpY2sgLmJ0bi1jb21wYXJlJzogJ3RvZ2dsZVNwbGl0dGVyJyxcbiAgICAgICdjbGljayAuYnRuLWNvcHkubGVmdC12YWxpZC1tYXAnOiAnY29weU1hcExlZnRUb1JpZ2h0JyxcbiAgICAgICdjbGljayAuYnRuLWNvcHkucmlnaHQtdmFsaWQtbWFwJzogJ2NvcHlNYXBSaWdodFRvTGVmdCcsXG4gICAgICAnbGVmdG1hcHVwZGF0ZSc6ICdsZWZ0U2lkZVVwZGF0ZScsXG4gICAgICAncmlnaHRtYXB1cGRhdGUnOiAncmlnaHRTaWRlVXBkYXRlJyxcbiAgICAgICdjaGFuZ2Ugc2VsZWN0LmxlZnQnOiAnbGVmdFNpZGVVcGRhdGUnLFxuICAgICAgJ2NoYW5nZSBzZWxlY3QucmlnaHQnOiAncmlnaHRTaWRlVXBkYXRlJyxcbiAgICAgICdjaGFuZ2UgaW5wdXQubGVmdCc6ICdsZWZ0U2lkZVVwZGF0ZScsXG4gICAgICAnY2hhbmdlIGlucHV0LnJpZ2h0JzogJ3JpZ2h0U2lkZVVwZGF0ZScsXG4gICAgICAnY2hhbmdlICNzeW5jJzogJ3RvZ2dsZVN5bmMnXG4gICAgfSxcbiAgICB0aWNrOiBmdW5jdGlvbigpIHtcbiAgICAgIGlmIChmYWxzZSkge1xuICAgICAgICBkZWJ1Zyh0aGlzLmxlZnRJbmZvLnNjZW5hcmlvKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRlYnVnKCd0aWNrJyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gc2V0VGltZW91dCh0aGlzLnRpY2ssIDEwMDApO1xuICAgIH0sXG4gICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5pbml0aWFsaXplJyk7XG4gICAgICBfLmJpbmRBbGwuYXBwbHkoXywgW3RoaXNdLmNvbmNhdChfLmZ1bmN0aW9ucyh0aGlzKSkpO1xuICAgICAgdGhpcy5uYW1lc0xpc3QgPSBbXTtcbiAgICAgIHRoaXMuc3BlY2llc1NjaU5hbWVMaXN0ID0gW107XG4gICAgICB0aGlzLnNwZWNpZXNJbmZvRmV0Y2hQcm9jZXNzID0gdGhpcy5mZXRjaFNwZWNpZXNJbmZvKCk7XG4gICAgICB0aGlzLmJpb2Rpdkxpc3QgPSBbXTtcbiAgICAgIHRoaXMuYmlvZGl2TG9va3VwTGlzdCA9IFtdO1xuICAgICAgdGhpcy5uaWNlSW5kZXggPSB7fTtcbiAgICAgIHJldHVybiB0aGlzLm1hcExpc3QgPSB7fTtcbiAgICB9LFxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5yZW5kZXInKTtcbiAgICAgIHRoaXMuJGVsLmFwcGVuZChBcHBWaWV3LnRlbXBsYXRlcy5sYXlvdXQoe1xuICAgICAgICBsZWZ0VGFnOiBBcHBWaWV3LnRlbXBsYXRlcy5sZWZ0VGFnKCksXG4gICAgICAgIHJpZ2h0VGFnOiBBcHBWaWV3LnRlbXBsYXRlcy5yaWdodFRhZygpLFxuICAgICAgICBsZWZ0Rm9ybTogQXBwVmlldy50ZW1wbGF0ZXMubGVmdEZvcm0oKSxcbiAgICAgICAgcmlnaHRGb3JtOiBBcHBWaWV3LnRlbXBsYXRlcy5yaWdodEZvcm0oKVxuICAgICAgfSkpO1xuICAgICAgJCgnI2NvbnRlbnR3cmFwJykuYXBwZW5kKHRoaXMuJGVsKTtcbiAgICAgIHRoaXMubWFwID0gTC5tYXAoJ21hcCcsIHtcbiAgICAgICAgY2VudGVyOiBbMCwgMF0sXG4gICAgICAgIHpvb206IDNcbiAgICAgIH0pO1xuICAgICAgdGhpcy5tYXAub24oJ21vdmUnLCB0aGlzLnJlc2l6ZVRoaW5ncyk7XG4gICAgICBMLnRpbGVMYXllcignaHR0cDovL3tzfS57YmFzZX0ubWFwcy5jaXQuYXBpLmhlcmUuY29tL21hcHRpbGUvMi4xL3t0eXBlfS97bWFwSUR9L3tzY2hlbWV9L3t6fS97eH0ve3l9L3tzaXplfS97Zm9ybWF0fT9hcHBfaWQ9e2FwcF9pZH0mYXBwX2NvZGU9e2FwcF9jb2RlfSZsZz17bGFuZ3VhZ2V9Jywge1xuICAgICAgICBhdHRyaWJ1dGlvbjogJ01hcCAmY29weTsgMjAxNiA8YSBocmVmPVwiaHR0cDovL2RldmVsb3Blci5oZXJlLmNvbVwiPkhFUkU8L2E+JyxcbiAgICAgICAgc3ViZG9tYWluczogJzEyMzQnLFxuICAgICAgICBiYXNlOiAnYWVyaWFsJyxcbiAgICAgICAgdHlwZTogJ21hcHRpbGUnLFxuICAgICAgICBzY2hlbWU6ICd0ZXJyYWluLmRheScsXG4gICAgICAgIGFwcF9pZDogJ2wyUnllNnp3cTN1MmNIWnBWSVBPJyxcbiAgICAgICAgYXBwX2NvZGU6ICdNcFhTbE5MY0xTUUlwZFU2WEhCMFRRJyxcbiAgICAgICAgbWFwSUQ6ICduZXdlc3QnLFxuICAgICAgICBtYXhab29tOiAxOCxcbiAgICAgICAgbGFuZ3VhZ2U6ICdlbmcnLFxuICAgICAgICBmb3JtYXQ6ICdwbmc4JyxcbiAgICAgICAgc2l6ZTogJzI1NidcbiAgICAgIH0pLmFkZFRvKHRoaXMubWFwKTtcbiAgICAgIHRoaXMubGVmdEZvcm0gPSB0aGlzLiQoJy5sZWZ0LmZvcm0nKTtcbiAgICAgIHRoaXMuYnVpbGRMZWZ0Rm9ybSgpO1xuICAgICAgdGhpcy5yaWdodEZvcm0gPSB0aGlzLiQoJy5yaWdodC5mb3JtJyk7XG4gICAgICB0aGlzLmJ1aWxkUmlnaHRGb3JtKCk7XG4gICAgICB0aGlzLmxlZnRUYWcgPSB0aGlzLiQoJy5sZWZ0LnRhZycpO1xuICAgICAgdGhpcy5yaWdodFRhZyA9IHRoaXMuJCgnLnJpZ2h0LnRhZycpO1xuICAgICAgdGhpcy5zcGxpdExpbmUgPSB0aGlzLiQoJy5zcGxpdGxpbmUnKTtcbiAgICAgIHRoaXMuc3BsaXRUaHVtYiA9IHRoaXMuJCgnLnNwbGl0dGh1bWInKTtcbiAgICAgIHRoaXMubGVmdFNpZGVVcGRhdGUoKTtcbiAgICAgIHRoaXMucmlnaHRTaWRlVXBkYXRlKCk7XG4gICAgICByZXR1cm4gdGhpcy50b2dnbGVTcGxpdHRlcigpO1xuICAgIH0sXG4gICAgcmVzb2x2ZVBsYWNlaG9sZGVyczogZnVuY3Rpb24oc3RyV2l0aFBsYWNlaG9sZGVycywgcmVwbGFjZW1lbnRzKSB7XG4gICAgICB2YXIgYW5zLCBrZXksIHJlLCB2YWx1ZTtcbiAgICAgIGFucyA9IHN0cldpdGhQbGFjZWhvbGRlcnM7XG4gICAgICBhbnMgPSBhbnMucmVwbGFjZSgvXFx7XFx7XFxzKmxvY2F0aW9uLnByb3RvY29sXFxzKlxcfVxcfS9nLCBsb2NhdGlvbi5wcm90b2NvbCk7XG4gICAgICBhbnMgPSBhbnMucmVwbGFjZSgvXFx7XFx7XFxzKmxvY2F0aW9uLmhvc3RcXHMqXFx9XFx9L2csIGxvY2F0aW9uLmhvc3QpO1xuICAgICAgYW5zID0gYW5zLnJlcGxhY2UoL1xce1xce1xccypsb2NhdGlvbi5ob3N0bmFtZVxccypcXH1cXH0vZywgbG9jYXRpb24uaG9zdG5hbWUpO1xuICAgICAgZm9yIChrZXkgaW4gcmVwbGFjZW1lbnRzKSB7XG4gICAgICAgIHZhbHVlID0gcmVwbGFjZW1lbnRzW2tleV07XG4gICAgICAgIHJlID0gbmV3IFJlZ0V4cChcIlxcXFx7XFxcXHtcXFxccypcIiArIGtleSArIFwiXFxcXHMqXFxcXH1cXFxcfVwiLCBcImdcIik7XG4gICAgICAgIGFucyA9IGFucy5yZXBsYWNlKHJlLCB2YWx1ZSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gYW5zO1xuICAgIH0sXG4gICAgY29weU1hcExlZnRUb1JpZ2h0OiBmdW5jdGlvbigpIHtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LmNvcHlNYXBMZWZ0VG9SaWdodCcpO1xuICAgICAgaWYgKCF0aGlzLmxlZnRJbmZvKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHRoaXMuJCgnI3JpZ2h0bWFwc3BwJykudmFsKHRoaXMubGVmdEluZm8uc3BlY2llc05hbWUpO1xuICAgICAgdGhpcy4kKCcjcmlnaHRtYXB5ZWFyJykudmFsKHRoaXMubGVmdEluZm8ueWVhcik7XG4gICAgICB0aGlzLiQoJ2lucHV0W25hbWU9cmlnaHRtYXBzY2VuYXJpb10nKS5lYWNoKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oaW5kZXgsIGl0ZW0pIHtcbiAgICAgICAgICByZXR1cm4gJChpdGVtKS5wcm9wKCdjaGVja2VkJywgJChpdGVtKS52YWwoKSA9PT0gX3RoaXMubGVmdEluZm8uc2NlbmFyaW8pO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpO1xuICAgICAgdGhpcy4kKCcjcmlnaHRtYXBnY20nKS52YWwodGhpcy5sZWZ0SW5mby5nY20pO1xuICAgICAgcmV0dXJuIHRoaXMucmlnaHRTaWRlVXBkYXRlKCk7XG4gICAgfSxcbiAgICBjb3B5TWFwUmlnaHRUb0xlZnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgZGVidWcoJ0FwcFZpZXcuY29weU1hcFJpZ2h0VG9MZWZ0Jyk7XG4gICAgICBpZiAoIXRoaXMucmlnaHRJbmZvKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHRoaXMuJCgnI2xlZnRtYXBzcHAnKS52YWwodGhpcy5yaWdodEluZm8uc3BlY2llc05hbWUpO1xuICAgICAgdGhpcy4kKCcjbGVmdG1hcHllYXInKS52YWwodGhpcy5yaWdodEluZm8ueWVhcik7XG4gICAgICB0aGlzLiQoJ2lucHV0W25hbWU9bGVmdG1hcHNjZW5hcmlvXScpLmVhY2goKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihpbmRleCwgaXRlbSkge1xuICAgICAgICAgIHJldHVybiAkKGl0ZW0pLnByb3AoJ2NoZWNrZWQnLCAkKGl0ZW0pLnZhbCgpID09PSBfdGhpcy5yaWdodEluZm8uc2NlbmFyaW8pO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpO1xuICAgICAgdGhpcy4kKCcjbGVmdG1hcGdjbScpLnZhbCh0aGlzLnJpZ2h0SW5mby5nY20pO1xuICAgICAgcmV0dXJuIHRoaXMubGVmdFNpZGVVcGRhdGUoKTtcbiAgICB9LFxuICAgIHNpZGVVcGRhdGU6IGZ1bmN0aW9uKHNpZGUpIHtcbiAgICAgIHZhciBhdEN1cnJlbnQsIGN1cnJJbmZvLCBuZXdJbmZvLCBzY2lOYW1lTWF0Y2gsIHNjaU5hbWVNYXRjaGVyLCBfcmVmO1xuICAgICAgZGVidWcoJ0FwcFZpZXcuc2lkZVVwZGF0ZSAoJyArIHNpZGUgKyAnKScpO1xuICAgICAgbmV3SW5mbyA9IHtcbiAgICAgICAgc3BlY2llc05hbWU6IHRoaXMuJCgnIycgKyBzaWRlICsgJ21hcHNwcCcpLnZhbCgpLFxuICAgICAgICBuaWNlTmFtZTogdGhpcy4kKCcjJyArIHNpZGUgKyAnbWFwc3BwJykudmFsKCksXG4gICAgICAgIGRlZ3M6IHRoaXMuJCgnIycgKyBzaWRlICsgJ21hcGRlZ3MnKS52YWwoKSxcbiAgICAgICAgcmFuZ2U6IHRoaXMuJCgnaW5wdXRbbmFtZT0nICsgc2lkZSArICdtYXByYW5nZV06Y2hlY2tlZCcpLnZhbCgpLFxuICAgICAgICBjb25maWRlbmNlOiB0aGlzLiQoJyMnICsgc2lkZSArICdtYXBjb25maWRlbmNlJykudmFsKClcbiAgICAgIH07XG4gICAgICBhdEN1cnJlbnQgPSBuZXdJbmZvLmRlZ3MgPT09ICdjdXJyZW50JztcbiAgICAgIHRoaXMuJChcImlucHV0W25hbWU9XCIgKyBzaWRlICsgXCJtYXByYW5nZV0sICNcIiArIHNpZGUgKyBcIm1hcGNvbmZpZGVuY2VcIikucHJvcCgnZGlzYWJsZWQnLCBhdEN1cnJlbnQpO1xuICAgICAgdGhpcy4kKFwiLlwiICsgc2lkZSArIFwiLnNpZGUuZm9ybSBmaWVsZHNldFwiKS5yZW1vdmVDbGFzcygnZGlzYWJsZWQnKTtcbiAgICAgIHRoaXMuJChcImlucHV0W25hbWVePVwiICsgc2lkZSArIFwiXTpkaXNhYmxlZCwgW2lkXj1cIiArIHNpZGUgKyBcIl06ZGlzYWJsZWRcIikuY2xvc2VzdCgnZmllbGRzZXQnKS5hZGRDbGFzcygnZGlzYWJsZWQnKTtcbiAgICAgIGlmIChzaWRlID09PSAncmlnaHQnICYmIG5ld0luZm8ubmljZU5hbWUpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ3N0YXJ0aW5nIHNwcCBpcyB8JyArIG5ld0luZm8ubmljZU5hbWUgKyAnfCcpO1xuICAgICAgICBzY2lOYW1lTWF0Y2hlciA9IC8uKlxcKCguKylcXCkkLztcbiAgICAgICAgc2NpTmFtZU1hdGNoID0gc2NpTmFtZU1hdGNoZXIuZXhlYyhuZXdJbmZvLm5pY2VOYW1lKTtcbiAgICAgICAgaWYgKHNjaU5hbWVNYXRjaCAmJiBzY2lOYW1lTWF0Y2hbMV0pIHtcbiAgICAgICAgICBjb25zb2xlLmxvZygncmVnZXhlZCBzcHAgaXMgJyArICd8JyArIHNjaU5hbWVNYXRjaFsxXSArICd8Jyk7XG4gICAgICAgICAgbmV3SW5mby5zcGVjaWVzTmFtZSA9IHNjaU5hbWVNYXRjaFsxXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKChfcmVmID0gbmV3SW5mby5zcGVjaWVzTmFtZSwgX19pbmRleE9mLmNhbGwodGhpcy5uYW1lc0xpc3QsIF9yZWYpID49IDApIHx8IG5ld0luZm8ubmljZU5hbWUgaW4gdGhpcy5uaWNlSW5kZXgpIHtcbiAgICAgICAgdGhpcy4kKFwiLlwiICsgc2lkZSArIFwiLXZhbGlkLW1hcFwiKS5yZW1vdmVDbGFzcygnZGlzYWJsZWQnKS5wcm9wKCdkaXNhYmxlZCcsIGZhbHNlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuJChcIi5cIiArIHNpZGUgKyBcIi12YWxpZC1tYXBcIikuYWRkQ2xhc3MoJ2Rpc2FibGVkJykucHJvcCgnZGlzYWJsZWQnLCB0cnVlKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgY3VyckluZm8gPSBzaWRlID09PSAnbGVmdCcgPyB0aGlzLmxlZnRJbmZvIDogdGhpcy5yaWdodEluZm87XG4gICAgICBpZiAoY3VyckluZm8gJiYgXy5pc0VxdWFsKG5ld0luZm8sIGN1cnJJbmZvKSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICBpZiAoY3VyckluZm8gJiYgbmV3SW5mby5zcGVjaWVzTmFtZSA9PT0gY3VyckluZm8uc3BlY2llc05hbWUgJiYgbmV3SW5mby5kZWdzID09PSBjdXJySW5mby5kZWdzICYmIG5ld0luZm8uZGVncyA9PT0gJ2N1cnJlbnQnKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIGlmIChzaWRlID09PSAnbGVmdCcpIHtcbiAgICAgICAgdGhpcy5sZWZ0SW5mbyA9IG5ld0luZm87XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnJpZ2h0SW5mbyA9IG5ld0luZm87XG4gICAgICB9XG4gICAgICB0aGlzLmFkZE1hcExheWVyKHNpZGUpO1xuICAgICAgcmV0dXJuIHRoaXMuYWRkTWFwVGFnKHNpZGUpO1xuICAgIH0sXG4gICAgbGVmdFNpZGVVcGRhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zaWRlVXBkYXRlKCdsZWZ0Jyk7XG4gICAgICBpZiAodGhpcy4kKCcjc3luYycpWzBdLmNoZWNrZWQpIHtcbiAgICAgICAgZGVidWcoJ1N5bmMgY2hlY2tlZCAtIHN5bmNpbmcgcmlnaHQgc2lkZScsICdtZXNzYWdlJyk7XG4gICAgICAgIHJldHVybiB0aGlzLmNvcHlTcHBUb1JpZ2h0U2lkZSgpO1xuICAgICAgfVxuICAgIH0sXG4gICAgcmlnaHRTaWRlVXBkYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLnNpZGVVcGRhdGUoJ3JpZ2h0Jyk7XG4gICAgfSxcbiAgICBjb3B5U3BwVG9SaWdodFNpZGU6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy4kKCcjcmlnaHRtYXBzcHAnKS52YWwodGhpcy4kKCcjbGVmdG1hcHNwcCcpLnZhbCgpKTtcbiAgICAgIHJldHVybiB0aGlzLnJpZ2h0U2lkZVVwZGF0ZSgpO1xuICAgIH0sXG4gICAgYWRkTWFwVGFnOiBmdW5jdGlvbihzaWRlKSB7XG4gICAgICB2YXIgZGlzcExvb2t1cCwgaW5mbywgdGFnO1xuICAgICAgZGVidWcoJ0FwcFZpZXcuYWRkTWFwVGFnJyk7XG4gICAgICBpZiAoc2lkZSA9PT0gJ2xlZnQnKSB7XG4gICAgICAgIGluZm8gPSB0aGlzLmxlZnRJbmZvO1xuICAgICAgfVxuICAgICAgaWYgKHNpZGUgPT09ICdyaWdodCcpIHtcbiAgICAgICAgaW5mbyA9IHRoaXMucmlnaHRJbmZvO1xuICAgICAgfVxuICAgICAgdGFnID0gXCI8Yj48aT5cIiArIGluZm8uc3BlY2llc05hbWUgKyBcIjwvaT48L2I+XCI7XG4gICAgICBkaXNwTG9va3VwID0ge1xuICAgICAgICAnMGRpc3AnOiAnbm8gcmFuZ2UgYWRhcHRhdGlvbicsXG4gICAgICAgICc1MGRpc3AnOiAnNTAgeWVhcnMgb2YgcmFuZ2UgYWRhcHRhdGlvbicsXG4gICAgICAgICcxMDBkaXNwJzogJzEwMCB5ZWFycyBvZiByYW5nZSBhZGFwdGF0aW9uJ1xuICAgICAgfTtcbiAgICAgIGlmIChpbmZvLmRlZ3MgPT09ICdjdXJyZW50Jykge1xuICAgICAgICB0YWcgPSBcImN1cnJlbnQgXCIgKyB0YWcgKyBcIiBkaXN0cmlidXRpb25cIjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRhZyA9IFwiPGI+XCIgKyBpbmZvLmNvbmZpZGVuY2UgKyBcIjwvYj4gcGVyY2VudGlsZSBwcm9qZWN0aW9ucyBmb3IgXCIgKyB0YWcgKyBcIiBhdCA8Yj4rXCIgKyBpbmZvLmRlZ3MgKyBcIiZkZWc7QzwvYj4gd2l0aCA8Yj5cIiArIGRpc3BMb29rdXBbaW5mby5yYW5nZV0gKyBcIjwvYj5cIjtcbiAgICAgIH1cbiAgICAgIGlmIChzaWRlID09PSAnbGVmdCcpIHtcbiAgICAgICAgdGhpcy5sZWZ0VGFnLmZpbmQoJy5sZWZ0bGF5ZXJuYW1lJykuaHRtbCh0YWcpO1xuICAgICAgfVxuICAgICAgaWYgKHNpZGUgPT09ICdyaWdodCcpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucmlnaHRUYWcuZmluZCgnLnJpZ2h0bGF5ZXJuYW1lJykuaHRtbCh0YWcpO1xuICAgICAgfVxuICAgIH0sXG4gICAgYWRkTWFwTGF5ZXI6IGZ1bmN0aW9uKHNpZGUpIHtcbiAgICAgIHZhciBleHQsIGZ1dHVyZU1vZGVsUG9pbnQsIGluZm8sIGlzQmlvZGl2ZXJzaXR5LCBsYXllciwgbG9hZENsYXNzLCBtYXBVcmwsIHNpZGVJbmZvLCBzcHBGaWxlTmFtZSwgdXJsLCB2YWwsIHppcFVybCwgX3JlZjtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LmFkZE1hcExheWVyJyk7XG4gICAgICBpZiAoc2lkZSA9PT0gJ2xlZnQnKSB7XG4gICAgICAgIHNpZGVJbmZvID0gdGhpcy5sZWZ0SW5mbztcbiAgICAgIH1cbiAgICAgIGlmIChzaWRlID09PSAncmlnaHQnKSB7XG4gICAgICAgIHNpZGVJbmZvID0gdGhpcy5yaWdodEluZm87XG4gICAgICB9XG4gICAgICBpc0Jpb2RpdmVyc2l0eSA9IChfcmVmID0gc2lkZUluZm8uc3BlY2llc05hbWUsIF9faW5kZXhPZi5jYWxsKHRoaXMuYmlvZGl2TGlzdCwgX3JlZikgPj0gMCk7XG4gICAgICBmdXR1cmVNb2RlbFBvaW50ID0gJyc7XG4gICAgICBtYXBVcmwgPSAnJztcbiAgICAgIHppcFVybCA9ICcnO1xuICAgICAgaWYgKGlzQmlvZGl2ZXJzaXR5KSB7XG4gICAgICAgIGZ1dHVyZU1vZGVsUG9pbnQgPSBbJ2Jpb2RpdmVyc2l0eS9kZWNpbGVzL2Jpb2RpdmVyc2l0eScsIHNpZGVJbmZvLnNjZW5hcmlvLCBzaWRlSW5mby55ZWFyLCBzaWRlSW5mby5nY21dLmpvaW4oJ18nKTtcbiAgICAgICAgaWYgKHNpZGVJbmZvLnllYXIgPT09ICdiYXNlbGluZScpIHtcbiAgICAgICAgICBmdXR1cmVNb2RlbFBvaW50ID0gJ2Jpb2RpdmVyc2l0eS9iaW9kaXZlcnNpdHlfY3VycmVudCc7XG4gICAgICAgIH1cbiAgICAgICAgbWFwVXJsID0gW1xuICAgICAgICAgIHRoaXMucmVzb2x2ZVBsYWNlaG9sZGVycyh0aGlzLmJpb2RpdkRhdGFVcmwsIHtcbiAgICAgICAgICAgIHNwcEdyb3VwOiBzaWRlSW5mby5zcGVjaWVzTmFtZVxuICAgICAgICAgIH0pLCBmdXR1cmVNb2RlbFBvaW50ICsgJy50aWYnXG4gICAgICAgIF0uam9pbignLycpO1xuICAgICAgICB6aXBVcmwgPSBbXG4gICAgICAgICAgdGhpcy5yZXNvbHZlUGxhY2Vob2xkZXJzKHRoaXMuYmlvZGl2RGF0YVVybCwge1xuICAgICAgICAgICAgc3BwR3JvdXA6IHNpZGVJbmZvLnNwZWNpZXNOYW1lXG4gICAgICAgICAgfSksICdiaW9kaXZlcnNpdHknLCBzaWRlSW5mby5zcGVjaWVzTmFtZSArICcuemlwJ1xuICAgICAgICBdLmpvaW4oJy8nKTtcbiAgICAgICAgdGhpcy4kKCcjJyArIHNpZGUgKyAnbWFwZGwnKS5hdHRyKCdocmVmJywgbWFwVXJsKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNwcEZpbGVOYW1lID0gWydURU1QJywgc2lkZUluZm8uZGVncywgc2lkZUluZm8uY29uZmlkZW5jZSArICcuJyArIHNpZGVJbmZvLnJhbmdlXS5qb2luKCdfJyk7XG4gICAgICAgIGlmIChzaWRlSW5mby5kZWdzID09PSAnY3VycmVudCcpIHtcbiAgICAgICAgICBzcHBGaWxlTmFtZSA9ICdjdXJyZW50JztcbiAgICAgICAgfVxuICAgICAgICBtYXBVcmwgPSBbXG4gICAgICAgICAgdGhpcy5yZXNvbHZlUGxhY2Vob2xkZXJzKHRoaXMuc3BlY2llc0RhdGFVcmwsIHtcbiAgICAgICAgICAgIHBhdGg6IHRoaXMuc3BlY2llc1VybHNbc2lkZUluZm8uc3BlY2llc05hbWVdXG4gICAgICAgICAgfSksIHNwcEZpbGVOYW1lICsgJy50aWYnXG4gICAgICAgIF0uam9pbignLycpO1xuICAgICAgICBpZiAoc2lkZSA9PT0gJ3JpZ2h0Jykge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdnZXR0aW5nIHJpZ2h0IHNpZGUgbWFwLicpO1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdzaWRlIGluZm8gaXMgJywgc2lkZUluZm8pO1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdAbmljZUluZGV4W3NpZGVJbmZvLm5pY2VOYW1lXSBpcyAnLCB0aGlzLm5pY2VJbmRleFtzaWRlSW5mby5uaWNlTmFtZV0pO1xuICAgICAgICAgIGluZm8gPSB0aGlzLm1hcExpc3RbdGhpcy5uaWNlSW5kZXhbc2lkZUluZm8ubmljZU5hbWVdXTtcbiAgICAgICAgICBjb25zb2xlLmxvZygnaW5mbyBpcyAnLCBpbmZvKTtcbiAgICAgICAgICBpZiAoaW5mbykge1xuICAgICAgICAgICAgdXJsID0gdGhpcy5zcGVjaWVzRGF0YVVybDtcbiAgICAgICAgICAgIGV4dCA9ICcudGlmJztcbiAgICAgICAgICAgIGlmIChpbmZvLnR5cGUgPT09ICdjbGltYXRlJykge1xuICAgICAgICAgICAgICB1cmwgPSB0aGlzLmNsaW1hdGVEYXRhVXJsO1xuICAgICAgICAgICAgICBleHQgPSAnLmFzYyc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBtYXBVcmwgPSBbXG4gICAgICAgICAgICAgIHRoaXMucmVzb2x2ZVBsYWNlaG9sZGVycyh1cmwsIHtcbiAgICAgICAgICAgICAgICBwYXRoOiBpbmZvLnBhdGhcbiAgICAgICAgICAgICAgfSksIHNwcEZpbGVOYW1lICsgZXh0XG4gICAgICAgICAgICBdLmpvaW4oJy8nKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ0luZGV4IG1pc2FsaWdubWVudCAtLSBsZXQgbWUga25vdyB3aGF0IHlvdSB3ZXJlIGxvb2tpbmcgZm9yLCBkYW5pZWxAZGFuaWVsYmFpcmQuY29tJyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuJCgnIycgKyBzaWRlICsgJ21hcGRsJykuYXR0cignaHJlZicsIG1hcFVybCk7XG4gICAgICB9XG4gICAgICBsYXllciA9IEwudGlsZUxheWVyLndtcyh0aGlzLnJlc29sdmVQbGFjZWhvbGRlcnModGhpcy5yYXN0ZXJBcGlVcmwpLCB7XG4gICAgICAgIERBVEFfVVJMOiBtYXBVcmwsXG4gICAgICAgIGxheWVyczogJ0RFRkFVTFQnLFxuICAgICAgICBmb3JtYXQ6ICdpbWFnZS9wbmcnLFxuICAgICAgICB0cmFuc3BhcmVudDogdHJ1ZVxuICAgICAgfSk7XG4gICAgICBsb2FkQ2xhc3MgPSAnJyArIHNpZGUgKyAnbG9hZGluZyc7XG4gICAgICBsYXllci5vbignbG9hZGluZycsIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuIF90aGlzLiRlbC5hZGRDbGFzcyhsb2FkQ2xhc3MpO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpO1xuICAgICAgbGF5ZXIub24oJ2xvYWQnLCAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiBfdGhpcy4kZWwucmVtb3ZlQ2xhc3MobG9hZENsYXNzKTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKTtcbiAgICAgIGlmIChzaWRlID09PSAnbGVmdCcpIHtcbiAgICAgICAgaWYgKHRoaXMubGVmdExheWVyKSB7XG4gICAgICAgICAgdGhpcy5tYXAucmVtb3ZlTGF5ZXIodGhpcy5sZWZ0TGF5ZXIpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMubGVmdExheWVyID0gbGF5ZXI7XG4gICAgICB9XG4gICAgICBpZiAoc2lkZSA9PT0gJ3JpZ2h0Jykge1xuICAgICAgICBpZiAodGhpcy5yaWdodExheWVyKSB7XG4gICAgICAgICAgdGhpcy5tYXAucmVtb3ZlTGF5ZXIodGhpcy5yaWdodExheWVyKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnJpZ2h0TGF5ZXIgPSBsYXllcjtcbiAgICAgIH1cbiAgICAgIGxheWVyLmFkZFRvKHRoaXMubWFwKTtcbiAgICAgIHRoaXMucmVzaXplVGhpbmdzKCk7XG4gICAgICBpZiAod2luZG93LmxvY2F0aW9uLmhvc3RuYW1lID09PSAnbG9jYWxob3N0Jykge1xuICAgICAgICBjb25zb2xlLmxvZygnbWFwIFVSTCBpczogJywgbWFwVXJsKTtcbiAgICAgIH1cbiAgICAgIGlmIChnYSAmJiB0eXBlb2YgZ2EgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgaWYgKHNpZGVJbmZvLnllYXIgPT09ICdiYXNlbGluZScpIHtcbiAgICAgICAgICB2YWwgPSAxOTkwO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHZhbCA9IHBhcnNlSW50KHNpZGVJbmZvLnllYXIsIDEwKTtcbiAgICAgICAgfVxuICAgICAgICB2YWwgPSB2YWwgKyB7XG4gICAgICAgICAgJ3RlbnRoJzogMC4xLFxuICAgICAgICAgICdmaWZ0aWV0aCc6IDAuNSxcbiAgICAgICAgICAnbmluZXRpZXRoJzogMC45XG4gICAgICAgIH1bc2lkZUluZm8uZ2NtXTtcbiAgICAgICAgcmV0dXJuIGdhKCdzZW5kJywge1xuICAgICAgICAgICdoaXRUeXBlJzogJ2V2ZW50JyxcbiAgICAgICAgICAnZXZlbnRDYXRlZ29yeSc6ICdtYXBzaG93JyxcbiAgICAgICAgICAnZXZlbnRBY3Rpb24nOiBzaWRlSW5mby5zcGVjaWVzTmFtZSxcbiAgICAgICAgICAnZXZlbnRMYWJlbCc6IHNpZGVJbmZvLnNjZW5hcmlvLFxuICAgICAgICAgICdldmVudFZhbHVlJzogdmFsXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0sXG4gICAgY2VudHJlTWFwOiBmdW5jdGlvbihyZXBlYXRlZGx5Rm9yKSB7XG4gICAgICB2YXIgbGF0ZXIsIHJlY2VudHJlLCBfaSwgX3Jlc3VsdHM7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5jZW50cmVNYXAnKTtcbiAgICAgIGlmICghcmVwZWF0ZWRseUZvcikge1xuICAgICAgICByZXBlYXRlZGx5Rm9yID0gNTAwO1xuICAgICAgfVxuICAgICAgcmVjZW50cmUgPSAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIF90aGlzLm1hcC5pbnZhbGlkYXRlU2l6ZShmYWxzZSk7XG4gICAgICAgICAgcmV0dXJuIF90aGlzLnJlc2l6ZVRoaW5ncygpO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcyk7XG4gICAgICBfcmVzdWx0cyA9IFtdO1xuICAgICAgZm9yIChsYXRlciA9IF9pID0gMDsgX2kgPD0gcmVwZWF0ZWRseUZvcjsgbGF0ZXIgPSBfaSArPSAyNSkge1xuICAgICAgICBfcmVzdWx0cy5wdXNoKHNldFRpbWVvdXQocmVjZW50cmUsIGxhdGVyKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gX3Jlc3VsdHM7XG4gICAgfSxcbiAgICB0b2dnbGVGb3JtczogZnVuY3Rpb24oKSB7XG4gICAgICBkZWJ1ZygnQXBwVmlldy50b2dnbGVGb3JtcycpO1xuICAgICAgdGhpcy4kZWwudG9nZ2xlQ2xhc3MoJ3Nob3dmb3JtcycpO1xuICAgICAgcmV0dXJuIHRoaXMuY2VudHJlTWFwKCk7XG4gICAgfSxcbiAgICB0b2dnbGVTcGxpdHRlcjogZnVuY3Rpb24oKSB7XG4gICAgICBkZWJ1ZygnQXBwVmlldy50b2dnbGVTcGxpdHRlcicpO1xuICAgICAgdGhpcy4kZWwudG9nZ2xlQ2xhc3MoJ3NwbGl0Jyk7XG4gICAgICBpZiAodGhpcy4kZWwuaGFzQ2xhc3MoJ3NwbGl0JykpIHtcbiAgICAgICAgdGhpcy5hY3RpdmF0ZVNwbGl0dGVyKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmRlYWN0aXZhdGVTcGxpdHRlcigpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMuY2VudHJlTWFwKCk7XG4gICAgfSxcbiAgICB0b2dnbGVTeW5jOiBmdW5jdGlvbigpIHtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LnRvZ2dsZVN5bmMnKTtcbiAgICAgIGlmICh0aGlzLiQoJyNzeW5jJylbMF0uY2hlY2tlZCkge1xuICAgICAgICB0aGlzLiQoJy5yaWdodG1hcHNwcCcpLnByb3AoJ2Rpc2FibGVkJywgdHJ1ZSk7XG4gICAgICAgIHJldHVybiB0aGlzLmNvcHlTcHBUb1JpZ2h0U2lkZSgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuJCgnLnJpZ2h0bWFwc3BwJykucHJvcCgnZGlzYWJsZWQnLCBmYWxzZSk7XG4gICAgICB9XG4gICAgfSxcbiAgICBmZXRjaFNwZWNpZXNJbmZvOiBmdW5jdGlvbigpIHtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LmZldGNoU3BlY2llc0luZm8nKTtcbiAgICAgIHJldHVybiAkLmFqYXgoe1xuICAgICAgICB1cmw6ICcvZGF0YS9zcGVjaWVzJyxcbiAgICAgICAgZGF0YVR5cGU6ICdqc29uJ1xuICAgICAgfSkuZG9uZSgoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICB2YXIgY29tbW9uTmFtZVdyaXRlciwgc3BlY2llc0xvb2t1cExpc3QsIHNwZWNpZXNTY2lOYW1lTGlzdCwgc3BlY2llc1VybHM7XG4gICAgICAgICAgc3BlY2llc0xvb2t1cExpc3QgPSBbXTtcbiAgICAgICAgICBzcGVjaWVzU2NpTmFtZUxpc3QgPSBbXTtcbiAgICAgICAgICBzcGVjaWVzVXJscyA9IHt9O1xuICAgICAgICAgIGNvbW1vbk5hbWVXcml0ZXIgPSBmdW5jdGlvbihzY2lOYW1lKSB7XG4gICAgICAgICAgICB2YXIgc2NpTmFtZVBvc3RmaXg7XG4gICAgICAgICAgICBzY2lOYW1lUG9zdGZpeCA9IFwiIChcIiArIHNjaU5hbWUgKyBcIilcIjtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbihjbkluZGV4LCBjbikge1xuICAgICAgICAgICAgICByZXR1cm4gc3BlY2llc0xvb2t1cExpc3QucHVzaCh7XG4gICAgICAgICAgICAgICAgbGFiZWw6IGNuICsgc2NpTmFtZVBvc3RmaXgsXG4gICAgICAgICAgICAgICAgdmFsdWU6IHNjaU5hbWVcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH07XG4gICAgICAgICAgJC5lYWNoKGRhdGEsIGZ1bmN0aW9uKHNjaU5hbWUsIHNwcEluZm8pIHtcbiAgICAgICAgICAgIHNwZWNpZXNTY2lOYW1lTGlzdC5wdXNoKHNjaU5hbWUpO1xuICAgICAgICAgICAgc3BlY2llc1VybHNbc2NpTmFtZV0gPSBzcHBJbmZvLnBhdGg7XG4gICAgICAgICAgICBpZiAoc3BwSW5mby5jb21tb25OYW1lcykge1xuICAgICAgICAgICAgICByZXR1cm4gJC5lYWNoKHNwcEluZm8uY29tbW9uTmFtZXMsIGNvbW1vbk5hbWVXcml0ZXIoc2NpTmFtZSkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHNwZWNpZXNMb29rdXBMaXN0LnB1c2goe1xuICAgICAgICAgICAgICAgIGxhYmVsOiBzY2lOYW1lLFxuICAgICAgICAgICAgICAgIHZhbHVlOiBzY2lOYW1lXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIF90aGlzLnNwZWNpZXNMb29rdXBMaXN0ID0gc3BlY2llc0xvb2t1cExpc3Q7XG4gICAgICAgICAgX3RoaXMuc3BlY2llc1NjaU5hbWVMaXN0ID0gc3BlY2llc1NjaU5hbWVMaXN0O1xuICAgICAgICAgIHJldHVybiBfdGhpcy5zcGVjaWVzVXJscyA9IHNwZWNpZXNVcmxzO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpO1xuICAgIH0sXG4gICAgZmV0Y2hCaW9kaXZJbmZvOiBmdW5jdGlvbigpIHtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LmZldGNoQmlvZGl2SW5mbycpO1xuICAgICAgcmV0dXJuICQuYWpheCh7XG4gICAgICAgIHVybDogJy9kYXRhL2Jpb2RpdmVyc2l0eScsXG4gICAgICAgIGRhdGFUeXBlOiAnanNvbidcbiAgICAgIH0pLmRvbmUoKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgdmFyIGJpb2Rpdkxpc3QsIGJpb2Rpdkxvb2t1cExpc3Q7XG4gICAgICAgICAgYmlvZGl2TGlzdCA9IFtdO1xuICAgICAgICAgIGJpb2Rpdkxvb2t1cExpc3QgPSBbXTtcbiAgICAgICAgICAkLmVhY2goZGF0YSwgZnVuY3Rpb24oYmlvZGl2TmFtZSwgYmlvZGl2SW5mbykge1xuICAgICAgICAgICAgdmFyIGJpb2RpdkNhcE5hbWU7XG4gICAgICAgICAgICBiaW9kaXZDYXBOYW1lID0gYmlvZGl2TmFtZS5yZXBsYWNlKC9eLi8sIGZ1bmN0aW9uKGMpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGMudG9VcHBlckNhc2UoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgYmlvZGl2TGlzdC5wdXNoKGJpb2Rpdk5hbWUpO1xuICAgICAgICAgICAgcmV0dXJuIGJpb2Rpdkxvb2t1cExpc3QucHVzaCh7XG4gICAgICAgICAgICAgIGxhYmVsOiBcIkJpb2RpdmVyc2l0eSBvZiBcIiArIGJpb2RpdkNhcE5hbWUsXG4gICAgICAgICAgICAgIHZhbHVlOiBiaW9kaXZOYW1lXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBfdGhpcy5iaW9kaXZMaXN0ID0gYmlvZGl2TGlzdDtcbiAgICAgICAgICByZXR1cm4gX3RoaXMuYmlvZGl2TG9va3VwTGlzdCA9IGJpb2Rpdkxvb2t1cExpc3Q7XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKSk7XG4gICAgfSxcbiAgICBidWlsZExlZnRGb3JtOiBmdW5jdGlvbigpIHtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LmJ1aWxkTGVmdEZvcm0nKTtcbiAgICAgIHJldHVybiAkLndoZW4odGhpcy5zcGVjaWVzSW5mb0ZldGNoUHJvY2VzcywgdGhpcy5iaW9kaXZJbmZvRmV0Y2hQcm9jZXNzKS5kb25lKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdmFyICRsZWZ0bWFwc3BwO1xuICAgICAgICAgICRsZWZ0bWFwc3BwID0gX3RoaXMuJCgnI2xlZnRtYXBzcHAnKTtcbiAgICAgICAgICBfdGhpcy5uYW1lc0xpc3QgPSBfdGhpcy5iaW9kaXZMaXN0LmNvbmNhdChfdGhpcy5zcGVjaWVzU2NpTmFtZUxpc3QpO1xuICAgICAgICAgIHJldHVybiAkbGVmdG1hcHNwcC5hdXRvY29tcGxldGUoe1xuICAgICAgICAgICAgc291cmNlOiBfdGhpcy5iaW9kaXZMb29rdXBMaXN0LmNvbmNhdChfdGhpcy5zcGVjaWVzTG9va3VwTGlzdCksXG4gICAgICAgICAgICBjbG9zZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHJldHVybiBfdGhpcy4kZWwudHJpZ2dlcignbGVmdG1hcHVwZGF0ZScpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpO1xuICAgIH0sXG4gICAgYnVpbGRSaWdodEZvcm06IGZ1bmN0aW9uKCkge1xuICAgICAgZGVidWcoJ0FwcFZpZXcuYnVpbGRSaWdodEZvcm0nKTtcbiAgICAgIHJldHVybiAkLndoZW4odGhpcy5zcGVjaWVzSW5mb0ZldGNoUHJvY2VzcywgdGhpcy5iaW9kaXZJbmZvRmV0Y2hQcm9jZXNzKS5kb25lKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdmFyICRyaWdodG1hcHNwcDtcbiAgICAgICAgICAkcmlnaHRtYXBzcHAgPSBfdGhpcy4kKCcjcmlnaHRtYXBzcHAnKTtcbiAgICAgICAgICBfdGhpcy5uYW1lc0xpc3QgPSBfdGhpcy5iaW9kaXZMaXN0LmNvbmNhdChfdGhpcy5zcGVjaWVzU2NpTmFtZUxpc3QpO1xuICAgICAgICAgIHJldHVybiAkcmlnaHRtYXBzcHAuYXV0b2NvbXBsZXRlKHtcbiAgICAgICAgICAgIGNsb3NlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIF90aGlzLiRlbC50cmlnZ2VyKCdyaWdodG1hcHVwZGF0ZScpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNvdXJjZTogZnVuY3Rpb24ocmVxLCByZXNwb25zZSkge1xuICAgICAgICAgICAgICByZXR1cm4gJC5hamF4KHtcbiAgICAgICAgICAgICAgICB1cmw6ICcvYXBpL25hbWVzZWFyY2gvJyxcbiAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICB0ZXJtOiByZXEudGVybVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24oYW5zd2VyKSB7XG4gICAgICAgICAgICAgICAgICB2YXIgaW5mbywgbmljZSwgc2VsZWN0YWJsZTtcbiAgICAgICAgICAgICAgICAgIHNlbGVjdGFibGUgPSBbXTtcbiAgICAgICAgICAgICAgICAgIGZvciAobmljZSBpbiBhbnN3ZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgaW5mbyA9IGFuc3dlcltuaWNlXTtcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0YWJsZS5wdXNoKG5pY2UpO1xuICAgICAgICAgICAgICAgICAgICBfdGhpcy5tYXBMaXN0W2luZm8ubWFwSWRdID0gaW5mbztcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMubmljZUluZGV4W25pY2VdID0gaW5mby5tYXBJZDtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGFuc3dlcik7XG4gICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhzZWxlY3RhYmxlKTtcbiAgICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZShzZWxlY3RhYmxlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpO1xuICAgIH0sXG4gICAgc3RhcnRTcGxpdHRlclRyYWNraW5nOiBmdW5jdGlvbigpIHtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LnN0YXJ0U3BsaXR0ZXJUcmFja2luZycpO1xuICAgICAgdGhpcy50cmFja1NwbGl0dGVyID0gdHJ1ZTtcbiAgICAgIHRoaXMuc3BsaXRMaW5lLmFkZENsYXNzKCdkcmFnZ2luZycpO1xuICAgICAgcmV0dXJuIHRoaXMubG9jYXRlU3BsaXR0ZXIoKTtcbiAgICB9LFxuICAgIGxvY2F0ZVNwbGl0dGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LmxvY2F0ZVNwbGl0dGVyJyk7XG4gICAgICBpZiAodGhpcy50cmFja1NwbGl0dGVyKSB7XG4gICAgICAgIHRoaXMucmVzaXplVGhpbmdzKCk7XG4gICAgICAgIGlmICh0aGlzLnRyYWNrU3BsaXR0ZXIgPT09IDApIHtcbiAgICAgICAgICB0aGlzLnRyYWNrU3BsaXR0ZXIgPSBmYWxzZTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnRyYWNrU3BsaXR0ZXIgIT09IHRydWUpIHtcbiAgICAgICAgICB0aGlzLnRyYWNrU3BsaXR0ZXIgLT0gMTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc2V0VGltZW91dCh0aGlzLmxvY2F0ZVNwbGl0dGVyLCB0aGlzLnRyYWNrUGVyaW9kKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHJlc2l6ZVRoaW5nczogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgJG1hcEJveCwgYm90dG9tUmlnaHQsIGxheWVyQm90dG9tLCBsYXllclRvcCwgbGVmdExlZnQsIGxlZnRNYXAsIG1hcEJvdW5kcywgbWFwQm94LCBuZXdMZWZ0V2lkdGgsIHJpZ2h0TWFwLCByaWdodFJpZ2h0LCBzcGxpdFBvaW50LCBzcGxpdFgsIHRvcExlZnQ7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5yZXNpemVUaGluZ3MnKTtcbiAgICAgIGlmICh0aGlzLmxlZnRMYXllcikge1xuICAgICAgICBsZWZ0TWFwID0gJCh0aGlzLmxlZnRMYXllci5nZXRDb250YWluZXIoKSk7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5yaWdodExheWVyKSB7XG4gICAgICAgIHJpZ2h0TWFwID0gJCh0aGlzLnJpZ2h0TGF5ZXIuZ2V0Q29udGFpbmVyKCkpO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMuJGVsLmhhc0NsYXNzKCdzcGxpdCcpKSB7XG4gICAgICAgIG5ld0xlZnRXaWR0aCA9IHRoaXMuc3BsaXRUaHVtYi5wb3NpdGlvbigpLmxlZnQgKyAodGhpcy5zcGxpdFRodW1iLndpZHRoKCkgLyAyLjApO1xuICAgICAgICBtYXBCb3ggPSB0aGlzLm1hcC5nZXRDb250YWluZXIoKTtcbiAgICAgICAgJG1hcEJveCA9ICQobWFwQm94KTtcbiAgICAgICAgbWFwQm91bmRzID0gbWFwQm94LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICB0b3BMZWZ0ID0gdGhpcy5tYXAuY29udGFpbmVyUG9pbnRUb0xheWVyUG9pbnQoWzAsIDBdKTtcbiAgICAgICAgc3BsaXRQb2ludCA9IHRoaXMubWFwLmNvbnRhaW5lclBvaW50VG9MYXllclBvaW50KFtuZXdMZWZ0V2lkdGgsIDBdKTtcbiAgICAgICAgYm90dG9tUmlnaHQgPSB0aGlzLm1hcC5jb250YWluZXJQb2ludFRvTGF5ZXJQb2ludChbJG1hcEJveC53aWR0aCgpLCAkbWFwQm94LmhlaWdodCgpXSk7XG4gICAgICAgIGxheWVyVG9wID0gdG9wTGVmdC55O1xuICAgICAgICBsYXllckJvdHRvbSA9IGJvdHRvbVJpZ2h0Lnk7XG4gICAgICAgIHNwbGl0WCA9IHNwbGl0UG9pbnQueCAtIG1hcEJvdW5kcy5sZWZ0O1xuICAgICAgICBsZWZ0TGVmdCA9IHRvcExlZnQueCAtIG1hcEJvdW5kcy5sZWZ0O1xuICAgICAgICByaWdodFJpZ2h0ID0gYm90dG9tUmlnaHQueDtcbiAgICAgICAgdGhpcy5zcGxpdExpbmUuY3NzKCdsZWZ0JywgbmV3TGVmdFdpZHRoKTtcbiAgICAgICAgdGhpcy5sZWZ0VGFnLmF0dHIoJ3N0eWxlJywgXCJjbGlwOiByZWN0KDAsIFwiICsgbmV3TGVmdFdpZHRoICsgXCJweCwgYXV0bywgMClcIik7XG4gICAgICAgIGlmICh0aGlzLmxlZnRMYXllcikge1xuICAgICAgICAgIGxlZnRNYXAuYXR0cignc3R5bGUnLCBcImNsaXA6IHJlY3QoXCIgKyBsYXllclRvcCArIFwicHgsIFwiICsgc3BsaXRYICsgXCJweCwgXCIgKyBsYXllckJvdHRvbSArIFwicHgsIFwiICsgbGVmdExlZnQgKyBcInB4KVwiKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5yaWdodExheWVyKSB7XG4gICAgICAgICAgcmV0dXJuIHJpZ2h0TWFwLmF0dHIoJ3N0eWxlJywgXCJjbGlwOiByZWN0KFwiICsgbGF5ZXJUb3AgKyBcInB4LCBcIiArIHJpZ2h0UmlnaHQgKyBcInB4LCBcIiArIGxheWVyQm90dG9tICsgXCJweCwgXCIgKyBzcGxpdFggKyBcInB4KVwiKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5sZWZ0VGFnLmF0dHIoJ3N0eWxlJywgJ2NsaXA6IGluaGVyaXQnKTtcbiAgICAgICAgaWYgKHRoaXMubGVmdExheWVyKSB7XG4gICAgICAgICAgbGVmdE1hcC5hdHRyKCdzdHlsZScsICdjbGlwOiBpbmhlcml0Jyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMucmlnaHRMYXllcikge1xuICAgICAgICAgIHJldHVybiByaWdodE1hcC5hdHRyKCdzdHlsZScsICdjbGlwOiByZWN0KDAsMCwwLDApJyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIHN0b3BTcGxpdHRlclRyYWNraW5nOiBmdW5jdGlvbigpIHtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LnN0b3BTcGxpdHRlclRyYWNraW5nJyk7XG4gICAgICB0aGlzLnNwbGl0TGluZS5yZW1vdmVDbGFzcygnZHJhZ2dpbmcnKTtcbiAgICAgIHJldHVybiB0aGlzLnRyYWNrU3BsaXR0ZXIgPSA1O1xuICAgIH0sXG4gICAgYWN0aXZhdGVTcGxpdHRlcjogZnVuY3Rpb24oKSB7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5hY3RpdmF0ZVNwbGl0dGVyJyk7XG4gICAgICB0aGlzLnNwbGl0VGh1bWIuZHJhZ2dhYmxlKHtcbiAgICAgICAgY29udGFpbm1lbnQ6ICQoJyNtYXB3cmFwcGVyJyksXG4gICAgICAgIHNjcm9sbDogZmFsc2UsXG4gICAgICAgIHN0YXJ0OiB0aGlzLnN0YXJ0U3BsaXR0ZXJUcmFja2luZyxcbiAgICAgICAgZHJhZzogdGhpcy5yZXNpemVUaGluZ3MsXG4gICAgICAgIHN0b3A6IHRoaXMuc3RvcFNwbGl0dGVyVHJhY2tpbmdcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHRoaXMucmVzaXplVGhpbmdzKCk7XG4gICAgfSxcbiAgICBkZWFjdGl2YXRlU3BsaXR0ZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgZGVidWcoJ0FwcFZpZXcuZGVhY3RpdmF0ZVNwbGl0dGVyJyk7XG4gICAgICB0aGlzLnNwbGl0VGh1bWIuZHJhZ2dhYmxlKCdkZXN0cm95Jyk7XG4gICAgICByZXR1cm4gdGhpcy5yZXNpemVUaGluZ3MoKTtcbiAgICB9XG4gIH0sIHtcbiAgICB0ZW1wbGF0ZXM6IHtcbiAgICAgIGxheW91dDogXy50ZW1wbGF0ZShcIjxkaXYgY2xhcz1cXFwidWktZnJvbnRcXFwiPjwvZGl2PlxcbjxkaXYgY2xhc3M9XFxcInNwbGl0bGluZVxcXCI+Jm5ic3A7PC9kaXY+XFxuPGRpdiBjbGFzcz1cXFwic3BsaXR0aHVtYlxcXCI+PHNwYW4+JiN4Mjc2ZTsgJiN4Mjc2Zjs8L3NwYW4+PC9kaXY+XFxuPGRpdiBjbGFzcz1cXFwibGVmdCB0YWdcXFwiPjwlPSBsZWZ0VGFnICU+PC9kaXY+XFxuPGRpdiBjbGFzcz1cXFwicmlnaHQgdGFnXFxcIj48JT0gcmlnaHRUYWcgJT48L2Rpdj5cXG48ZGl2IGNsYXNzPVxcXCJsZWZ0IHNpZGUgZm9ybVxcXCI+PCU9IGxlZnRGb3JtICU+PC9kaXY+XFxuPGRpdiBjbGFzcz1cXFwicmlnaHQgc2lkZSBmb3JtXFxcIj48JT0gcmlnaHRGb3JtICU+PC9kaXY+XFxuPGRpdiBjbGFzcz1cXFwibGVmdCBsb2FkZXJcXFwiPjxpbWcgc3JjPVxcXCIvc3RhdGljL2ltYWdlcy9zcGlubmVyLmxvYWRpbmZvLm5ldC5naWZcXFwiIC8+PC9kaXY+XFxuPGRpdiBjbGFzcz1cXFwicmlnaHQgbG9hZGVyXFxcIj48aW1nIHNyYz1cXFwiL3N0YXRpYy9pbWFnZXMvc3Bpbm5lci5sb2FkaW5mby5uZXQuZ2lmXFxcIiAvPjwvZGl2PlxcbjxkaXYgaWQ9XFxcIm1hcHdyYXBwZXJcXFwiPjxkaXYgaWQ9XFxcIm1hcFxcXCI+PC9kaXY+PC9kaXY+XCIpLFxuICAgICAgbGVmdFRhZzogXy50ZW1wbGF0ZShcIjxkaXYgY2xhc3M9XFxcInNob3dcXFwiPlxcbiAgICA8c3BhbiBjbGFzcz1cXFwibGVmdGxheWVybmFtZVxcXCI+cGxhaW4gbWFwPC9zcGFuPlxcbiAgICA8YnI+XFxuICAgIDxidXR0b24gY2xhc3M9XFxcImJ0bi1jaGFuZ2VcXFwiPnNldHRpbmdzPC9idXR0b24+XFxuICAgIDxidXR0b24gY2xhc3M9XFxcImJ0bi1jb21wYXJlXFxcIj5zaG93L2hpZGUgY29tcGFyaXNvbiBtYXA8L2J1dHRvbj5cXG48L2Rpdj5cXG48ZGl2IGNsYXNzPVxcXCJlZGl0XFxcIj5cXG4gICAgPGxhYmVsIGNsYXNzPVxcXCJsZWZ0IHN5bmNib3hcXFwiPjwvbGFiZWw+XFxuICAgIDxpbnB1dCBpZD1cXFwibGVmdG1hcHNwcFxcXCIgY2xhc3M9XFxcImxlZnRcXFwiIHR5cGU9XFxcInRleHRcXFwiIG5hbWU9XFxcImxlZnRtYXBzcHBcXFwiIHBsYWNlaG9sZGVyPVxcXCImaGVsbGlwOyBzcGVjaWVzIG9yIGdyb3VwICZoZWxsaXA7XFxcIiAvPlxcbjwvZGl2PlwiKSxcbiAgICAgIHJpZ2h0VGFnOiBfLnRlbXBsYXRlKFwiPGRpdiBjbGFzcz1cXFwic2hvd1xcXCI+XFxuICAgIDxzcGFuIGNsYXNzPVxcXCJyaWdodGxheWVybmFtZVxcXCI+KG5vIGRpc3RyaWJ1dGlvbik8L3NwYW4+XFxuICAgIDxicj5cXG4gICAgPGJ1dHRvbiBjbGFzcz1cXFwiYnRuLWNoYW5nZVxcXCI+c2V0dGluZ3M8L2J1dHRvbj5cXG4gICAgPGJ1dHRvbiBjbGFzcz1cXFwiYnRuLWNvbXBhcmVcXFwiPnNob3cvaGlkZSBjb21wYXJpc29uIG1hcDwvYnV0dG9uPlxcbjwvZGl2PlxcbjxkaXYgY2xhc3M9XFxcImVkaXRcXFwiPlxcbiAgICA8bGFiZWwgY2xhc3M9XFxcInJpZ2h0IHN5bmNib3hcXFwiPjxpbnB1dCBpZD1cXFwic3luY1xcXCIgdHlwZT1cXFwiY2hlY2tib3hcXFwiIHZhbHVlPVxcXCJzeW5jXFxcIiBjaGVja2VkPVxcXCJjaGVja2VkXFxcIiAvPiBzYW1lIGFzIGxlZnQgc2lkZTwvbGFiZWw+XFxuICAgIDxpbnB1dCBpZD1cXFwicmlnaHRtYXBzcHBcXFwiIHR5cGU9XFxcInRleHRcXFwiIGNsYXNzPVxcXCJyaWdodFxcXCIgbmFtZT1cXFwicmlnaHRtYXBzcHBcXFwiIHBsYWNlaG9sZGVyPVxcXCImaGVsbGlwOyBzcGVjaWVzIG9yIGdyb3VwICZoZWxsaXA7XFxcIiAvPlxcbjwvZGl2PlwiKSxcbiAgICAgIGxlZnRGb3JtOiBfLnRlbXBsYXRlKFwiPGZpZWxkc2V0PlxcbiAgICA8bGVnZW5kPnRlbXBlcmF0dXJlIGNoYW5nZTwvbGVnZW5kPlxcbiAgICA8c2VsZWN0IGNsYXNzPVxcXCJsZWZ0XFxcIiBpZD1cXFwibGVmdG1hcGRlZ3NcXFwiPlxcbiAgICAgICAgPG9wdGlvbiB2YWx1ZT1cXFwiY3VycmVudFxcXCI+Y3VycmVudDwvb3B0aW9uPlxcbiAgICAgICAgPG9wdGlvbiB2YWx1ZT1cXFwiMS41XFxcIj4xLjUgJmRlZztDPC9vcHRpb24+XFxuICAgICAgICA8b3B0aW9uIHZhbHVlPVxcXCIyXFxcIj4yLjAgJmRlZztDPC9vcHRpb24+XFxuICAgICAgICA8b3B0aW9uIHZhbHVlPVxcXCIyLjdcXFwiPjIuNyAmZGVnO0M8L29wdGlvbj5cXG4gICAgICAgIDxvcHRpb24gdmFsdWU9XFxcIjMuMlxcXCI+My4yICZkZWc7Qzwvb3B0aW9uPlxcbiAgICAgICAgPG9wdGlvbiB2YWx1ZT1cXFwiNC41XFxcIj40LjUgJmRlZztDPC9vcHRpb24+XFxuICAgICAgICA8b3B0Z3JvdXAgbGFiZWw9XFxcIkhpZ2ggc2Vuc2l0aXZpdHkgY2xpbWF0ZVxcXCI+XFxuICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cXFwiNlxcXCI+Ni4wICZkZWc7Qzwvb3B0aW9uPlxcbiAgICAgICAgPC9vcHRncm91cD5cXG4gICAgPC9zZWxlY3Q+XFxuPC9maWVsZHNldD5cXG48ZmllbGRzZXQ+XFxuICAgIDxsZWdlbmQ+YWRhcHRhdGlvbiB2aWEgcmFuZ2Ugc2hpZnQ8L2xlZ2VuZD5cXG4gICAgPGxhYmVsPjwhLS0gc3Bhbj5ub25lPC9zcGFuIC0tPiA8aW5wdXQgbmFtZT1cXFwibGVmdG1hcHJhbmdlXFxcIiBjbGFzcz1cXFwibGVmdFxcXCIgdHlwZT1cXFwicmFkaW9cXFwiIHZhbHVlPVxcXCJuby5kaXNwXFxcIiBjaGVja2VkPVxcXCJjaGVja2VkXFxcIj4gc3BlY2llcyBjYW5ub3Qgc2hpZnQgcmFuZ2VzPC9sYWJlbD5cXG4gICAgPGxhYmVsPjwhLS0gc3Bhbj5hbGxvdzwvc3BhbiAtLT4gPGlucHV0IG5hbWU9XFxcImxlZnRtYXByYW5nZVxcXCIgY2xhc3M9XFxcImxlZnRcXFwiIHR5cGU9XFxcInJhZGlvXFxcIiB2YWx1ZT1cXFwicmVhbC5kaXNwXFxcIj4gYWxsb3cgcmFuZ2UgYWRhcHRhdGlvbjwvbGFiZWw+XFxuPC9maWVsZHNldD5cXG48ZmllbGRzZXQ+XFxuICAgIDxsZWdlbmQ+bW9kZWwgc3VtbWFyeTwvbGVnZW5kPlxcbiAgICA8c2VsZWN0IGNsYXNzPVxcXCJsZWZ0XFxcIiBpZD1cXFwibGVmdG1hcGNvbmZpZGVuY2VcXFwiPlxcbiAgICAgICAgPG9wdGlvbiB2YWx1ZT1cXFwiMTBcXFwiPjEwdGggcGVyY2VudGlsZTwvb3B0aW9uPlxcbiAgICAgICAgPCEtLSBvcHRpb24gdmFsdWU9XFxcIjMzXFxcIj4zM3JkIHBlcmNlbnRpbGU8L29wdGlvbiAtLT5cXG4gICAgICAgIDxvcHRpb24gdmFsdWU9XFxcIjUwXFxcIiBzZWxlY3RlZD1cXFwic2VsZWN0ZWRcXFwiPjUwdGggcGVyY2VudGlsZTwvb3B0aW9uPlxcbiAgICAgICAgPCEtLSBvcHRpb24gdmFsdWU9XFxcIjY2XFxcIj42NnRoIHBlcmNlbnRpbGU8L29wdGlvbiAtLT5cXG4gICAgICAgIDxvcHRpb24gdmFsdWU9XFxcIjkwXFxcIj45MHRoIHBlcmNlbnRpbGU8L29wdGlvbj5cXG4gICAgPC9zZWxlY3Q+XFxuPC9maWVsZHNldD5cXG48ZmllbGRzZXQgY2xhc3M9XFxcImJsYW5rXFxcIj5cXG4gICAgPGJ1dHRvbiB0eXBlPVxcXCJidXR0b25cXFwiIGNsYXNzPVxcXCJidG4tY2hhbmdlXFxcIj5oaWRlIHNldHRpbmdzPC9idXR0b24+XFxuICAgIDxidXR0b24gdHlwZT1cXFwiYnV0dG9uXFxcIiBjbGFzcz1cXFwiYnRuLWNvbXBhcmVcXFwiPmhpZGUvc2hvdyByaWdodCBtYXA8L2J1dHRvbj5cXG4gICAgPGJ1dHRvbiB0eXBlPVxcXCJidXR0b25cXFwiIGNsYXNzPVxcXCJidG4tY29weSByaWdodC12YWxpZC1tYXBcXFwiPmNvcHkgcmlnaHQgbWFwICZsYXF1bzs8L2J1dHRvbj5cXG4gICAgPGEgaWQ9XFxcImxlZnRtYXBkbFxcXCIgY2xhc3M9XFxcImRvd25sb2FkIGxlZnQtdmFsaWQtbWFwXFxcIiBocmVmPVxcXCJcXFwiIGRpc2FibGVkPVxcXCJkaXNhYmxlZFxcXCI+ZG93bmxvYWQganVzdCB0aGlzIG1hcDxicj4oPDFNYiBHZW9USUZGKTwvYT5cXG48L2ZpZWxkc2V0PlxcblwiKSxcbiAgICAgIHJpZ2h0Rm9ybTogXy50ZW1wbGF0ZShcIjxmaWVsZHNldD5cXG4gICAgPGxlZ2VuZD50ZW1wZXJhdHVyZSBjaGFuZ2U8L2xlZ2VuZD5cXG4gICAgPHNlbGVjdCBjbGFzcz1cXFwicmlnaHRcXFwiIGlkPVxcXCJyaWdodG1hcGRlZ3NcXFwiPlxcbiAgICAgICAgPG9wdGlvbiB2YWx1ZT1cXFwiY3VycmVudFxcXCI+Y3VycmVudDwvb3B0aW9uPlxcbiAgICAgICAgPG9wdGlvbiB2YWx1ZT1cXFwiMS41XFxcIj4xLjUgJmRlZztDPC9vcHRpb24+XFxuICAgICAgICA8b3B0aW9uIHZhbHVlPVxcXCIyXFxcIj4yLjAgJmRlZztDPC9vcHRpb24+XFxuICAgICAgICA8b3B0aW9uIHZhbHVlPVxcXCIyLjdcXFwiPjIuNyAmZGVnO0M8L29wdGlvbj5cXG4gICAgICAgIDxvcHRpb24gdmFsdWU9XFxcIjMuMlxcXCI+My4yICZkZWc7Qzwvb3B0aW9uPlxcbiAgICAgICAgPG9wdGlvbiB2YWx1ZT1cXFwiNC41XFxcIj40LjUgJmRlZztDPC9vcHRpb24+XFxuICAgICAgICA8b3B0Z3JvdXAgbGFiZWw9XFxcIkhpZ2ggc2Vuc2l0aXZpdHkgY2xpbWF0ZVxcXCI+XFxuICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cXFwiNlxcXCI+Ni4wICZkZWc7Qzwvb3B0aW9uPlxcbiAgICAgICAgPC9vcHRncm91cD5cXG4gICAgPC9zZWxlY3Q+XFxuPC9maWVsZHNldD5cXG48ZmllbGRzZXQ+XFxuICAgIDxsZWdlbmQ+YWRhcHRhdGlvbiB2aWEgcmFuZ2Ugc2hpZnQ8L2xlZ2VuZD5cXG4gICAgPGxhYmVsPjwhLS0gc3Bhbj5ub25lPC9zcGFuIC0tPiA8aW5wdXQgbmFtZT1cXFwicmlnaHRtYXByYW5nZVxcXCIgY2xhc3M9XFxcInJpZ2h0XFxcIiB0eXBlPVxcXCJyYWRpb1xcXCIgdmFsdWU9XFxcIm5vLmRpc3BcXFwiIGNoZWNrZWQ9XFxcImNoZWNrZWRcXFwiPiBzcGVjaWVzIGNhbm5vdCBzaGlmdCByYW5nZXM8L2xhYmVsPlxcbiAgICA8bGFiZWw+PCEtLSBzcGFuPmFsbG93PC9zcGFuIC0tPiA8aW5wdXQgbmFtZT1cXFwicmlnaHRtYXByYW5nZVxcXCIgY2xhc3M9XFxcInJpZ2h0XFxcIiB0eXBlPVxcXCJyYWRpb1xcXCIgdmFsdWU9XFxcInJlYWwuZGlzcFxcXCI+IGFsbG93IHJhbmdlIGFkYXB0YXRpb248L2xhYmVsPlxcbjwvZmllbGRzZXQ+XFxuPGZpZWxkc2V0PlxcbiAgICA8bGVnZW5kPm1vZGVsIHN1bW1hcnk8L2xlZ2VuZD5cXG4gICAgPHNlbGVjdCBjbGFzcz1cXFwicmlnaHRcXFwiIGlkPVxcXCJyaWdodG1hcGNvbmZpZGVuY2VcXFwiPlxcbiAgICAgICAgPG9wdGlvbiB2YWx1ZT1cXFwiMTBcXFwiPjEwdGggcGVyY2VudGlsZTwvb3B0aW9uPlxcbiAgICAgICAgPCEtLSBvcHRpb24gdmFsdWU9XFxcIjMzXFxcIj4zM3JkIHBlcmNlbnRpbGU8L29wdGlvbiAtLT5cXG4gICAgICAgIDxvcHRpb24gdmFsdWU9XFxcIjUwXFxcIiBzZWxlY3RlZD1cXFwic2VsZWN0ZWRcXFwiPjUwdGggcGVyY2VudGlsZTwvb3B0aW9uPlxcbiAgICAgICAgPCEtLSBvcHRpb24gdmFsdWU9XFxcIjY2XFxcIj42NnRoIHBlcmNlbnRpbGU8L29wdGlvbiAtLT5cXG4gICAgICAgIDxvcHRpb24gdmFsdWU9XFxcIjkwXFxcIj45MHRoIHBlcmNlbnRpbGU8L29wdGlvbj5cXG4gICAgPC9zZWxlY3Q+XFxuPC9maWVsZHNldD5cXG48ZmllbGRzZXQgY2xhc3M9XFxcImJsYW5rXFxcIj5cXG4gICAgPGJ1dHRvbiB0eXBlPVxcXCJidXR0b25cXFwiIGNsYXNzPVxcXCJidG4tY2hhbmdlXFxcIj5oaWRlIHNldHRpbmdzPC9idXR0b24+XFxuICAgIDxidXR0b24gdHlwZT1cXFwiYnV0dG9uXFxcIiBjbGFzcz1cXFwiYnRuLWNvbXBhcmVcXFwiPmhpZGUvc2hvdyByaWdodCBtYXA8L2J1dHRvbj5cXG4gICAgPGJ1dHRvbiB0eXBlPVxcXCJidXR0b25cXFwiIGNsYXNzPVxcXCJidG4tY29weSBsZWZ0LXZhbGlkLW1hcFxcXCI+Y29weSBsZWZ0IG1hcCAmbGFxdW87PC9idXR0b24+XFxuICAgIDxhIGlkPVxcXCJyaWdodG1hcGRsXFxcIiBjbGFzcz1cXFwiZG93bmxvYWQgcmlnaHQtdmFsaWQtbWFwXFxcIiBocmVmPVxcXCJcXFwiIGRpc2FibGVkPVxcXCJkaXNhYmxlZFxcXCI+ZG93bmxvYWQganVzdCB0aGlzIG1hcDxicj4oPDFNYiBHZW9USUZGKTwvYT5cXG48L2ZpZWxkc2V0PlxcblwiKVxuICAgIH1cbiAgfSk7XG5cbiAgbW9kdWxlLmV4cG9ydHMgPSBBcHBWaWV3O1xuXG59KS5jYWxsKHRoaXMpO1xuIl19
