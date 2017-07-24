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
      var atCurrent, currInfo, mapValidQuery, newInfo, speciesName, _ref;
      debug('AppView.sideUpdate (' + side + ')');
      newInfo = {
        speciesName: this.$('#' + side + 'mapspp').val(),
        degs: this.$('#' + side + 'mapdegs').val(),
        range: this.$('input[name=' + side + 'maprange]:checked').val(),
        confidence: this.$('#' + side + 'mapconfidence').val(),
        year: this.$('#' + side + 'mapyear').val(),
        scenario: this.$('input[name=' + side + 'mapscenario]:checked').val(),
        gcm: this.$('#' + side + 'mapgcm').val()
      };
      if (side === 'right' && newInfo.speciesName) {
        console.log('starting spp is |' + newInfo.speciesName + '|');
        speciesName = newInfo.speciesName.match(/.*\((.*)\)$/)[1];
        console.log('regexed spp is ' + '|' + speciesName + '|');
        if (speciesName.length > 0) {
          console.log('spp replaced.');
          newInfo.speciesName = speciesName;
        }
      }
      atCurrent = newInfo.degs === 'current';
      this.$(['input[name=' + side + 'maprange]', '#' + side + 'mapconfidence'].join(',')).prop('disabled', atCurrent);
      this.$('.' + side + '.side.form fieldset').removeClass('disabled');
      this.$('input[name^=' + side + ']:disabled, [id^=' + side + ']:disabled').closest('fieldset').addClass('disabled');
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
      } else {
        sppFileName = ['TEMP', sideInfo.degs, sideInfo.confidence + '.' + sideInfo.range].join('_');
        if (sideInfo.degs === 'current') {
          sppFileName = 'current';
        }
        mapUrl = [
          this.resolvePlaceholders(this.speciesDataUrl, {
            sppUrl: this.speciesUrls[sideInfo.speciesName]
          }), sppFileName + '.tif'
        ].join('/');
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
            source: '/api/namesearch',
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9wdnJkd2IvcHJvamVjdHMvY2xpbWFzLWdsb2JhbC93ZWJhcHAvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi9Vc2Vycy9wdnJkd2IvcHJvamVjdHMvY2xpbWFzLWdsb2JhbC93ZWJhcHAvY2xpbWFzbmcvc3JjL2pzL2Zha2VfNmZmMTRiYjguanMiLCIvVXNlcnMvcHZyZHdiL3Byb2plY3RzL2NsaW1hcy1nbG9iYWwvd2ViYXBwL2NsaW1hc25nL3NyYy9qcy9tYXB2aWV3L21haW4uanMiLCIvVXNlcnMvcHZyZHdiL3Byb2plY3RzL2NsaW1hcy1nbG9iYWwvd2ViYXBwL2NsaW1hc25nL3NyYy9qcy9tYXB2aWV3L21vZGVscy9tYXBsYXllci5qcyIsIi9Vc2Vycy9wdnJkd2IvcHJvamVjdHMvY2xpbWFzLWdsb2JhbC93ZWJhcHAvY2xpbWFzbmcvc3JjL2pzL21hcHZpZXcvdXRpbC9zaGltcy5qcyIsIi9Vc2Vycy9wdnJkd2IvcHJvamVjdHMvY2xpbWFzLWdsb2JhbC93ZWJhcHAvY2xpbWFzbmcvc3JjL2pzL21hcHZpZXcvdmlld3MvYXBwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcbnJlcXVpcmUoJy4vbWFwdmlldy9tYWluJyk7XG5cbiQoJ2hlYWRlcicpLmRpc2FibGVTZWxlY3Rpb24oKTsgLy8gdW5wb3B1bGFyIGJ1dCBzdGlsbCBiZXR0ZXJcbiQoJ25hdiA+IHVsJykubXNwcCh7fSk7XG4iLCIoZnVuY3Rpb24oKSB7XG4gIHZhciBBcHBWaWV3O1xuXG4gIGlmICghd2luZG93LmNvbnNvbGUpIHtcbiAgICB3aW5kb3cuY29uc29sZSA9IHtcbiAgICAgIGxvZzogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB7fTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgQXBwVmlldyA9IHJlcXVpcmUoJy4vdmlld3MvYXBwJyk7XG5cbiAgJChmdW5jdGlvbigpIHtcbiAgICB2YXIgYXBwdmlldztcbiAgICBhcHB2aWV3ID0gbmV3IEFwcFZpZXcoKTtcbiAgICByZXR1cm4gYXBwdmlldy5yZW5kZXIoKTtcbiAgfSk7XG5cbn0pLmNhbGwodGhpcyk7XG4iLCIoZnVuY3Rpb24oKSB7XG4gIHZhciBNYXBMYXllcjtcblxuICBNYXBMYXllciA9IEJhY2tib25lLk1vZGVsLmV4dGVuZCh7XG4gICAgY29uc3RydWN0b3I6IGZ1bmN0aW9uKHNob3J0TmFtZSwgbG9uZ05hbWUsIHBhdGgpIHtcbiAgICAgIHRoaXMuc2hvcnROYW1lID0gc2hvcnROYW1lO1xuICAgICAgdGhpcy5sb25nTmFtZSA9IGxvbmdOYW1lO1xuICAgICAgdGhpcy5wYXRoID0gcGF0aDtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfSk7XG5cbiAgbW9kdWxlLmV4cG9ydHMgPSBNYXBMYXllcjtcblxufSkuY2FsbCh0aGlzKTtcbiIsIihmdW5jdGlvbigpIHtcbiAgdmFyIF9faW5kZXhPZiA9IFtdLmluZGV4T2YgfHwgZnVuY3Rpb24oaXRlbSkgeyBmb3IgKHZhciBpID0gMCwgbCA9IHRoaXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7IGlmIChpIGluIHRoaXMgJiYgdGhpc1tpXSA9PT0gaXRlbSkgcmV0dXJuIGk7IH0gcmV0dXJuIC0xOyB9O1xuXG4gIGlmICghQXJyYXkucHJvdG90eXBlLmZvckVhY2gpIHtcbiAgICBBcnJheS5wcm90b3R5cGUuZm9yRWFjaCA9IGZ1bmN0aW9uKGZuLCBzY29wZSkge1xuICAgICAgdmFyIGksIF9pLCBfcmVmLCBfcmVzdWx0cztcbiAgICAgIF9yZXN1bHRzID0gW107XG4gICAgICBmb3IgKGkgPSBfaSA9IDAsIF9yZWYgPSB0aGlzLmxlbmd0aDsgMCA8PSBfcmVmID8gX2kgPD0gX3JlZiA6IF9pID49IF9yZWY7IGkgPSAwIDw9IF9yZWYgPyArK19pIDogLS1faSkge1xuICAgICAgICBfcmVzdWx0cy5wdXNoKF9faW5kZXhPZi5jYWxsKHRoaXMsIGkpID49IDAgPyBmbi5jYWxsKHNjb3BlLCB0aGlzW2ldLCBpLCB0aGlzKSA6IHZvaWQgMCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gX3Jlc3VsdHM7XG4gICAgfTtcbiAgfVxuXG4gIGlmICghQXJyYXkucHJvdG90eXBlLmluZGV4T2YpIHtcbiAgICBBcnJheS5wcm90b3R5cGUuaW5kZXhPZiA9IGZ1bmN0aW9uKG5lZWRsZSkge1xuICAgICAgdmFyIGksIF9pLCBfcmVmO1xuICAgICAgZm9yIChpID0gX2kgPSAwLCBfcmVmID0gdGhpcy5sZW5ndGg7IDAgPD0gX3JlZiA/IF9pIDw9IF9yZWYgOiBfaSA+PSBfcmVmOyBpID0gMCA8PSBfcmVmID8gKytfaSA6IC0tX2kpIHtcbiAgICAgICAgaWYgKHRoaXNbaV0gPT09IG5lZWRsZSkge1xuICAgICAgICAgIHJldHVybiBpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gLTE7XG4gICAgfTtcbiAgfVxuXG59KS5jYWxsKHRoaXMpO1xuIiwiKGZ1bmN0aW9uKCkge1xuICB2YXIgQXBwVmlldywgTWFwTGF5ZXIsIGRlYnVnLFxuICAgIF9faW5kZXhPZiA9IFtdLmluZGV4T2YgfHwgZnVuY3Rpb24oaXRlbSkgeyBmb3IgKHZhciBpID0gMCwgbCA9IHRoaXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7IGlmIChpIGluIHRoaXMgJiYgdGhpc1tpXSA9PT0gaXRlbSkgcmV0dXJuIGk7IH0gcmV0dXJuIC0xOyB9O1xuXG4gIE1hcExheWVyID0gcmVxdWlyZSgnLi4vbW9kZWxzL21hcGxheWVyJyk7XG5cbiAgcmVxdWlyZSgnLi4vdXRpbC9zaGltcycpO1xuXG5cbiAgLyoganNoaW50IC1XMDkzICovXG5cbiAgZGVidWcgPSBmdW5jdGlvbihpdGVtVG9Mb2csIGl0ZW1MZXZlbCkge1xuICAgIHZhciBsZXZlbHMsIG1lc3NhZ2VOdW0sIHRocmVzaG9sZCwgdGhyZXNob2xkTnVtO1xuICAgIGxldmVscyA9IFsndmVyeWRlYnVnJywgJ2RlYnVnJywgJ21lc3NhZ2UnLCAnd2FybmluZyddO1xuICAgIHRocmVzaG9sZCA9ICdtZXNzYWdlJztcbiAgICBpZiAoIWl0ZW1MZXZlbCkge1xuICAgICAgaXRlbUxldmVsID0gJ2RlYnVnJztcbiAgICB9XG4gICAgdGhyZXNob2xkTnVtID0gbGV2ZWxzLmluZGV4T2YodGhyZXNob2xkKTtcbiAgICBtZXNzYWdlTnVtID0gbGV2ZWxzLmluZGV4T2YoaXRlbUxldmVsKTtcbiAgICBpZiAodGhyZXNob2xkTnVtID4gbWVzc2FnZU51bSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoaXRlbVRvTG9nICsgJycgPT09IGl0ZW1Ub0xvZykge1xuICAgICAgcmV0dXJuIGNvbnNvbGUubG9nKFwiW1wiICsgaXRlbUxldmVsICsgXCJdIFwiICsgaXRlbVRvTG9nKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGNvbnNvbGUubG9nKGl0ZW1Ub0xvZyk7XG4gICAgfVxuICB9O1xuXG4gIEFwcFZpZXcgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XG4gICAgdGFnTmFtZTogJ2RpdicsXG4gICAgY2xhc3NOYW1lOiAnc3BsaXRtYXAgc2hvd2Zvcm1zJyxcbiAgICBpZDogJ3NwbGl0bWFwJyxcbiAgICBzcGVjaWVzRGF0YVVybDogd2luZG93Lm1hcENvbmZpZy5zcGVjaWVzRGF0YVVybCxcbiAgICBiaW9kaXZEYXRhVXJsOiB3aW5kb3cubWFwQ29uZmlnLmJpb2RpdkRhdGFVcmwsXG4gICAgcmFzdGVyQXBpVXJsOiB3aW5kb3cubWFwQ29uZmlnLnJhc3RlckFwaVVybCxcbiAgICB0cmFja1NwbGl0dGVyOiBmYWxzZSxcbiAgICB0cmFja1BlcmlvZDogMTAwLFxuICAgIGV2ZW50czoge1xuICAgICAgJ2NsaWNrIC5idG4tY2hhbmdlJzogJ3RvZ2dsZUZvcm1zJyxcbiAgICAgICdjbGljayAuYnRuLWNvbXBhcmUnOiAndG9nZ2xlU3BsaXR0ZXInLFxuICAgICAgJ2NsaWNrIC5idG4tY29weS5sZWZ0LXZhbGlkLW1hcCc6ICdjb3B5TWFwTGVmdFRvUmlnaHQnLFxuICAgICAgJ2NsaWNrIC5idG4tY29weS5yaWdodC12YWxpZC1tYXAnOiAnY29weU1hcFJpZ2h0VG9MZWZ0JyxcbiAgICAgICdsZWZ0bWFwdXBkYXRlJzogJ2xlZnRTaWRlVXBkYXRlJyxcbiAgICAgICdyaWdodG1hcHVwZGF0ZSc6ICdyaWdodFNpZGVVcGRhdGUnLFxuICAgICAgJ2NoYW5nZSBzZWxlY3QubGVmdCc6ICdsZWZ0U2lkZVVwZGF0ZScsXG4gICAgICAnY2hhbmdlIHNlbGVjdC5yaWdodCc6ICdyaWdodFNpZGVVcGRhdGUnLFxuICAgICAgJ2NoYW5nZSBpbnB1dC5sZWZ0JzogJ2xlZnRTaWRlVXBkYXRlJyxcbiAgICAgICdjaGFuZ2UgaW5wdXQucmlnaHQnOiAncmlnaHRTaWRlVXBkYXRlJyxcbiAgICAgICdjaGFuZ2UgI3N5bmMnOiAndG9nZ2xlU3luYydcbiAgICB9LFxuICAgIHRpY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKGZhbHNlKSB7XG4gICAgICAgIGRlYnVnKHRoaXMubGVmdEluZm8uc2NlbmFyaW8pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZGVidWcoJ3RpY2snKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBzZXRUaW1lb3V0KHRoaXMudGljaywgMTAwMCk7XG4gICAgfSxcbiAgICBpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LmluaXRpYWxpemUnKTtcbiAgICAgIF8uYmluZEFsbC5hcHBseShfLCBbdGhpc10uY29uY2F0KF8uZnVuY3Rpb25zKHRoaXMpKSk7XG4gICAgICB0aGlzLm5hbWVzTGlzdCA9IFtdO1xuICAgICAgdGhpcy5zcGVjaWVzU2NpTmFtZUxpc3QgPSBbXTtcbiAgICAgIHRoaXMuc3BlY2llc0luZm9GZXRjaFByb2Nlc3MgPSB0aGlzLmZldGNoU3BlY2llc0luZm8oKTtcbiAgICAgIHRoaXMuYmlvZGl2TGlzdCA9IFtdO1xuICAgICAgcmV0dXJuIHRoaXMuYmlvZGl2SW5mb0ZldGNoUHJvY2VzcyA9IHRoaXMuZmV0Y2hCaW9kaXZJbmZvKCk7XG4gICAgfSxcbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgZGVidWcoJ0FwcFZpZXcucmVuZGVyJyk7XG4gICAgICB0aGlzLiRlbC5hcHBlbmQoQXBwVmlldy50ZW1wbGF0ZXMubGF5b3V0KHtcbiAgICAgICAgbGVmdFRhZzogQXBwVmlldy50ZW1wbGF0ZXMubGVmdFRhZygpLFxuICAgICAgICByaWdodFRhZzogQXBwVmlldy50ZW1wbGF0ZXMucmlnaHRUYWcoKSxcbiAgICAgICAgbGVmdEZvcm06IEFwcFZpZXcudGVtcGxhdGVzLmxlZnRGb3JtKCksXG4gICAgICAgIHJpZ2h0Rm9ybTogQXBwVmlldy50ZW1wbGF0ZXMucmlnaHRGb3JtKClcbiAgICAgIH0pKTtcbiAgICAgICQoJyNjb250ZW50d3JhcCcpLmFwcGVuZCh0aGlzLiRlbCk7XG4gICAgICB0aGlzLm1hcCA9IEwubWFwKCdtYXAnLCB7XG4gICAgICAgIGNlbnRlcjogWzAsIDBdLFxuICAgICAgICB6b29tOiAzXG4gICAgICB9KTtcbiAgICAgIHRoaXMubWFwLm9uKCdtb3ZlJywgdGhpcy5yZXNpemVUaGluZ3MpO1xuICAgICAgTC50aWxlTGF5ZXIoJ2h0dHA6Ly97c30ue2Jhc2V9Lm1hcHMuY2l0LmFwaS5oZXJlLmNvbS9tYXB0aWxlLzIuMS97dHlwZX0ve21hcElEfS97c2NoZW1lfS97en0ve3h9L3t5fS97c2l6ZX0ve2Zvcm1hdH0/YXBwX2lkPXthcHBfaWR9JmFwcF9jb2RlPXthcHBfY29kZX0mbGc9e2xhbmd1YWdlfScsIHtcbiAgICAgICAgYXR0cmlidXRpb246ICdNYXAgJmNvcHk7IDIwMTYgPGEgaHJlZj1cImh0dHA6Ly9kZXZlbG9wZXIuaGVyZS5jb21cIj5IRVJFPC9hPicsXG4gICAgICAgIHN1YmRvbWFpbnM6ICcxMjM0JyxcbiAgICAgICAgYmFzZTogJ2FlcmlhbCcsXG4gICAgICAgIHR5cGU6ICdtYXB0aWxlJyxcbiAgICAgICAgc2NoZW1lOiAndGVycmFpbi5kYXknLFxuICAgICAgICBhcHBfaWQ6ICdsMlJ5ZTZ6d3EzdTJjSFpwVklQTycsXG4gICAgICAgIGFwcF9jb2RlOiAnTXBYU2xOTGNMU1FJcGRVNlhIQjBUUScsXG4gICAgICAgIG1hcElEOiAnbmV3ZXN0JyxcbiAgICAgICAgbWF4Wm9vbTogMTgsXG4gICAgICAgIGxhbmd1YWdlOiAnZW5nJyxcbiAgICAgICAgZm9ybWF0OiAncG5nOCcsXG4gICAgICAgIHNpemU6ICcyNTYnXG4gICAgICB9KS5hZGRUbyh0aGlzLm1hcCk7XG4gICAgICB0aGlzLmxlZnRGb3JtID0gdGhpcy4kKCcubGVmdC5mb3JtJyk7XG4gICAgICB0aGlzLmJ1aWxkTGVmdEZvcm0oKTtcbiAgICAgIHRoaXMucmlnaHRGb3JtID0gdGhpcy4kKCcucmlnaHQuZm9ybScpO1xuICAgICAgdGhpcy5idWlsZFJpZ2h0Rm9ybSgpO1xuICAgICAgdGhpcy5sZWZ0VGFnID0gdGhpcy4kKCcubGVmdC50YWcnKTtcbiAgICAgIHRoaXMucmlnaHRUYWcgPSB0aGlzLiQoJy5yaWdodC50YWcnKTtcbiAgICAgIHRoaXMuc3BsaXRMaW5lID0gdGhpcy4kKCcuc3BsaXRsaW5lJyk7XG4gICAgICB0aGlzLnNwbGl0VGh1bWIgPSB0aGlzLiQoJy5zcGxpdHRodW1iJyk7XG4gICAgICB0aGlzLmxlZnRTaWRlVXBkYXRlKCk7XG4gICAgICB0aGlzLnJpZ2h0U2lkZVVwZGF0ZSgpO1xuICAgICAgcmV0dXJuIHRoaXMudG9nZ2xlU3BsaXR0ZXIoKTtcbiAgICB9LFxuICAgIHJlc29sdmVQbGFjZWhvbGRlcnM6IGZ1bmN0aW9uKHN0cldpdGhQbGFjZWhvbGRlcnMsIHJlcGxhY2VtZW50cykge1xuICAgICAgdmFyIGFucywga2V5LCByZSwgdmFsdWU7XG4gICAgICBhbnMgPSBzdHJXaXRoUGxhY2Vob2xkZXJzO1xuICAgICAgYW5zID0gYW5zLnJlcGxhY2UoL1xce1xce1xccypsb2NhdGlvbi5wcm90b2NvbFxccypcXH1cXH0vZywgbG9jYXRpb24ucHJvdG9jb2wpO1xuICAgICAgYW5zID0gYW5zLnJlcGxhY2UoL1xce1xce1xccypsb2NhdGlvbi5ob3N0XFxzKlxcfVxcfS9nLCBsb2NhdGlvbi5ob3N0KTtcbiAgICAgIGFucyA9IGFucy5yZXBsYWNlKC9cXHtcXHtcXHMqbG9jYXRpb24uaG9zdG5hbWVcXHMqXFx9XFx9L2csIGxvY2F0aW9uLmhvc3RuYW1lKTtcbiAgICAgIGZvciAoa2V5IGluIHJlcGxhY2VtZW50cykge1xuICAgICAgICB2YWx1ZSA9IHJlcGxhY2VtZW50c1trZXldO1xuICAgICAgICByZSA9IG5ldyBSZWdFeHAoXCJcXFxce1xcXFx7XFxcXHMqXCIgKyBrZXkgKyBcIlxcXFxzKlxcXFx9XFxcXH1cIiwgXCJnXCIpO1xuICAgICAgICBhbnMgPSBhbnMucmVwbGFjZShyZSwgdmFsdWUpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGFucztcbiAgICB9LFxuICAgIGNvcHlNYXBMZWZ0VG9SaWdodDogZnVuY3Rpb24oKSB7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5jb3B5TWFwTGVmdFRvUmlnaHQnKTtcbiAgICAgIGlmICghdGhpcy5sZWZ0SW5mbykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB0aGlzLiQoJyNyaWdodG1hcHNwcCcpLnZhbCh0aGlzLmxlZnRJbmZvLnNwZWNpZXNOYW1lKTtcbiAgICAgIHRoaXMuJCgnI3JpZ2h0bWFweWVhcicpLnZhbCh0aGlzLmxlZnRJbmZvLnllYXIpO1xuICAgICAgdGhpcy4kKCdpbnB1dFtuYW1lPXJpZ2h0bWFwc2NlbmFyaW9dJykuZWFjaCgoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGluZGV4LCBpdGVtKSB7XG4gICAgICAgICAgcmV0dXJuICQoaXRlbSkucHJvcCgnY2hlY2tlZCcsICQoaXRlbSkudmFsKCkgPT09IF90aGlzLmxlZnRJbmZvLnNjZW5hcmlvKTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKTtcbiAgICAgIHRoaXMuJCgnI3JpZ2h0bWFwZ2NtJykudmFsKHRoaXMubGVmdEluZm8uZ2NtKTtcbiAgICAgIHJldHVybiB0aGlzLnJpZ2h0U2lkZVVwZGF0ZSgpO1xuICAgIH0sXG4gICAgY29weU1hcFJpZ2h0VG9MZWZ0OiBmdW5jdGlvbigpIHtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LmNvcHlNYXBSaWdodFRvTGVmdCcpO1xuICAgICAgaWYgKCF0aGlzLnJpZ2h0SW5mbykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB0aGlzLiQoJyNsZWZ0bWFwc3BwJykudmFsKHRoaXMucmlnaHRJbmZvLnNwZWNpZXNOYW1lKTtcbiAgICAgIHRoaXMuJCgnI2xlZnRtYXB5ZWFyJykudmFsKHRoaXMucmlnaHRJbmZvLnllYXIpO1xuICAgICAgdGhpcy4kKCdpbnB1dFtuYW1lPWxlZnRtYXBzY2VuYXJpb10nKS5lYWNoKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oaW5kZXgsIGl0ZW0pIHtcbiAgICAgICAgICByZXR1cm4gJChpdGVtKS5wcm9wKCdjaGVja2VkJywgJChpdGVtKS52YWwoKSA9PT0gX3RoaXMucmlnaHRJbmZvLnNjZW5hcmlvKTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKTtcbiAgICAgIHRoaXMuJCgnI2xlZnRtYXBnY20nKS52YWwodGhpcy5yaWdodEluZm8uZ2NtKTtcbiAgICAgIHJldHVybiB0aGlzLmxlZnRTaWRlVXBkYXRlKCk7XG4gICAgfSxcbiAgICBzaWRlVXBkYXRlOiBmdW5jdGlvbihzaWRlKSB7XG4gICAgICB2YXIgYXRDdXJyZW50LCBjdXJySW5mbywgbWFwVmFsaWRRdWVyeSwgbmV3SW5mbywgc3BlY2llc05hbWUsIF9yZWY7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5zaWRlVXBkYXRlICgnICsgc2lkZSArICcpJyk7XG4gICAgICBuZXdJbmZvID0ge1xuICAgICAgICBzcGVjaWVzTmFtZTogdGhpcy4kKCcjJyArIHNpZGUgKyAnbWFwc3BwJykudmFsKCksXG4gICAgICAgIGRlZ3M6IHRoaXMuJCgnIycgKyBzaWRlICsgJ21hcGRlZ3MnKS52YWwoKSxcbiAgICAgICAgcmFuZ2U6IHRoaXMuJCgnaW5wdXRbbmFtZT0nICsgc2lkZSArICdtYXByYW5nZV06Y2hlY2tlZCcpLnZhbCgpLFxuICAgICAgICBjb25maWRlbmNlOiB0aGlzLiQoJyMnICsgc2lkZSArICdtYXBjb25maWRlbmNlJykudmFsKCksXG4gICAgICAgIHllYXI6IHRoaXMuJCgnIycgKyBzaWRlICsgJ21hcHllYXInKS52YWwoKSxcbiAgICAgICAgc2NlbmFyaW86IHRoaXMuJCgnaW5wdXRbbmFtZT0nICsgc2lkZSArICdtYXBzY2VuYXJpb106Y2hlY2tlZCcpLnZhbCgpLFxuICAgICAgICBnY206IHRoaXMuJCgnIycgKyBzaWRlICsgJ21hcGdjbScpLnZhbCgpXG4gICAgICB9O1xuICAgICAgaWYgKHNpZGUgPT09ICdyaWdodCcgJiYgbmV3SW5mby5zcGVjaWVzTmFtZSkge1xuICAgICAgICBjb25zb2xlLmxvZygnc3RhcnRpbmcgc3BwIGlzIHwnICsgbmV3SW5mby5zcGVjaWVzTmFtZSArICd8Jyk7XG4gICAgICAgIHNwZWNpZXNOYW1lID0gbmV3SW5mby5zcGVjaWVzTmFtZS5tYXRjaCgvLipcXCgoLiopXFwpJC8pWzFdO1xuICAgICAgICBjb25zb2xlLmxvZygncmVnZXhlZCBzcHAgaXMgJyArICd8JyArIHNwZWNpZXNOYW1lICsgJ3wnKTtcbiAgICAgICAgaWYgKHNwZWNpZXNOYW1lLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICBjb25zb2xlLmxvZygnc3BwIHJlcGxhY2VkLicpO1xuICAgICAgICAgIG5ld0luZm8uc3BlY2llc05hbWUgPSBzcGVjaWVzTmFtZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgYXRDdXJyZW50ID0gbmV3SW5mby5kZWdzID09PSAnY3VycmVudCc7XG4gICAgICB0aGlzLiQoWydpbnB1dFtuYW1lPScgKyBzaWRlICsgJ21hcHJhbmdlXScsICcjJyArIHNpZGUgKyAnbWFwY29uZmlkZW5jZSddLmpvaW4oJywnKSkucHJvcCgnZGlzYWJsZWQnLCBhdEN1cnJlbnQpO1xuICAgICAgdGhpcy4kKCcuJyArIHNpZGUgKyAnLnNpZGUuZm9ybSBmaWVsZHNldCcpLnJlbW92ZUNsYXNzKCdkaXNhYmxlZCcpO1xuICAgICAgdGhpcy4kKCdpbnB1dFtuYW1lXj0nICsgc2lkZSArICddOmRpc2FibGVkLCBbaWRePScgKyBzaWRlICsgJ106ZGlzYWJsZWQnKS5jbG9zZXN0KCdmaWVsZHNldCcpLmFkZENsYXNzKCdkaXNhYmxlZCcpO1xuICAgICAgbWFwVmFsaWRRdWVyeSA9ICcuJyArIHNpZGUgKyAnLXZhbGlkLW1hcCc7XG4gICAgICBpZiAoX3JlZiA9IG5ld0luZm8uc3BlY2llc05hbWUsIF9faW5kZXhPZi5jYWxsKHRoaXMubmFtZXNMaXN0LCBfcmVmKSA+PSAwKSB7XG4gICAgICAgIHRoaXMuJChtYXBWYWxpZFF1ZXJ5KS5yZW1vdmVDbGFzcygnZGlzYWJsZWQnKS5wcm9wKCdkaXNhYmxlZCcsIGZhbHNlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuJChtYXBWYWxpZFF1ZXJ5KS5hZGRDbGFzcygnZGlzYWJsZWQnKS5wcm9wKCdkaXNhYmxlZCcsIHRydWUpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICBjdXJySW5mbyA9IHNpZGUgPT09ICdsZWZ0JyA/IHRoaXMubGVmdEluZm8gOiB0aGlzLnJpZ2h0SW5mbztcbiAgICAgIGlmIChjdXJySW5mbyAmJiBfLmlzRXF1YWwobmV3SW5mbywgY3VyckluZm8pKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIGlmIChjdXJySW5mbyAmJiBuZXdJbmZvLnNwZWNpZXNOYW1lID09PSBjdXJySW5mby5zcGVjaWVzTmFtZSAmJiBuZXdJbmZvLmRlZ3MgPT09IGN1cnJJbmZvLmRlZ3MgJiYgbmV3SW5mby5kZWdzID09PSAnY3VycmVudCcpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgaWYgKHNpZGUgPT09ICdsZWZ0Jykge1xuICAgICAgICB0aGlzLmxlZnRJbmZvID0gbmV3SW5mbztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMucmlnaHRJbmZvID0gbmV3SW5mbztcbiAgICAgIH1cbiAgICAgIHRoaXMuYWRkTWFwTGF5ZXIoc2lkZSk7XG4gICAgICByZXR1cm4gdGhpcy5hZGRNYXBUYWcoc2lkZSk7XG4gICAgfSxcbiAgICBsZWZ0U2lkZVVwZGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNpZGVVcGRhdGUoJ2xlZnQnKTtcbiAgICAgIGlmICh0aGlzLiQoJyNzeW5jJylbMF0uY2hlY2tlZCkge1xuICAgICAgICBkZWJ1ZygnU3luYyBjaGVja2VkIC0gc3luY2luZyByaWdodCBzaWRlJywgJ21lc3NhZ2UnKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29weVNwcFRvUmlnaHRTaWRlKCk7XG4gICAgICB9XG4gICAgfSxcbiAgICByaWdodFNpZGVVcGRhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuc2lkZVVwZGF0ZSgncmlnaHQnKTtcbiAgICB9LFxuICAgIGNvcHlTcHBUb1JpZ2h0U2lkZTogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLiQoJyNyaWdodG1hcHNwcCcpLnZhbCh0aGlzLiQoJyNsZWZ0bWFwc3BwJykudmFsKCkpO1xuICAgICAgcmV0dXJuIHRoaXMucmlnaHRTaWRlVXBkYXRlKCk7XG4gICAgfSxcbiAgICBhZGRNYXBUYWc6IGZ1bmN0aW9uKHNpZGUpIHtcbiAgICAgIHZhciBkaXNwTG9va3VwLCBpbmZvLCB0YWc7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5hZGRNYXBUYWcnKTtcbiAgICAgIGlmIChzaWRlID09PSAnbGVmdCcpIHtcbiAgICAgICAgaW5mbyA9IHRoaXMubGVmdEluZm87XG4gICAgICB9XG4gICAgICBpZiAoc2lkZSA9PT0gJ3JpZ2h0Jykge1xuICAgICAgICBpbmZvID0gdGhpcy5yaWdodEluZm87XG4gICAgICB9XG4gICAgICB0YWcgPSBcIjxiPjxpPlwiICsgaW5mby5zcGVjaWVzTmFtZSArIFwiPC9pPjwvYj5cIjtcbiAgICAgIGRpc3BMb29rdXAgPSB7XG4gICAgICAgICcwZGlzcCc6ICdubyByYW5nZSBhZGFwdGF0aW9uJyxcbiAgICAgICAgJzUwZGlzcCc6ICc1MCB5ZWFycyBvZiByYW5nZSBhZGFwdGF0aW9uJyxcbiAgICAgICAgJzEwMGRpc3AnOiAnMTAwIHllYXJzIG9mIHJhbmdlIGFkYXB0YXRpb24nXG4gICAgICB9O1xuICAgICAgaWYgKGluZm8uZGVncyA9PT0gJ2N1cnJlbnQnKSB7XG4gICAgICAgIHRhZyA9IFwiY3VycmVudCBcIiArIHRhZyArIFwiIGRpc3RyaWJ1dGlvblwiO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGFnID0gXCI8Yj5cIiArIGluZm8uY29uZmlkZW5jZSArIFwiPC9iPiBwZXJjZW50aWxlIHByb2plY3Rpb25zIGZvciBcIiArIHRhZyArIFwiIGF0IDxiPitcIiArIGluZm8uZGVncyArIFwiJmRlZztDPC9iPiB3aXRoIDxiPlwiICsgZGlzcExvb2t1cFtpbmZvLnJhbmdlXSArIFwiPC9iPlwiO1xuICAgICAgfVxuICAgICAgaWYgKHNpZGUgPT09ICdsZWZ0Jykge1xuICAgICAgICB0aGlzLmxlZnRUYWcuZmluZCgnLmxlZnRsYXllcm5hbWUnKS5odG1sKHRhZyk7XG4gICAgICB9XG4gICAgICBpZiAoc2lkZSA9PT0gJ3JpZ2h0Jykge1xuICAgICAgICByZXR1cm4gdGhpcy5yaWdodFRhZy5maW5kKCcucmlnaHRsYXllcm5hbWUnKS5odG1sKHRhZyk7XG4gICAgICB9XG4gICAgfSxcbiAgICBhZGRNYXBMYXllcjogZnVuY3Rpb24oc2lkZSkge1xuICAgICAgdmFyIGZ1dHVyZU1vZGVsUG9pbnQsIGlzQmlvZGl2ZXJzaXR5LCBsYXllciwgbG9hZENsYXNzLCBtYXBVcmwsIHNpZGVJbmZvLCBzcHBGaWxlTmFtZSwgdmFsLCB6aXBVcmwsIF9yZWY7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5hZGRNYXBMYXllcicpO1xuICAgICAgaWYgKHNpZGUgPT09ICdsZWZ0Jykge1xuICAgICAgICBzaWRlSW5mbyA9IHRoaXMubGVmdEluZm87XG4gICAgICB9XG4gICAgICBpZiAoc2lkZSA9PT0gJ3JpZ2h0Jykge1xuICAgICAgICBzaWRlSW5mbyA9IHRoaXMucmlnaHRJbmZvO1xuICAgICAgfVxuICAgICAgaXNCaW9kaXZlcnNpdHkgPSAoX3JlZiA9IHNpZGVJbmZvLnNwZWNpZXNOYW1lLCBfX2luZGV4T2YuY2FsbCh0aGlzLmJpb2Rpdkxpc3QsIF9yZWYpID49IDApO1xuICAgICAgZnV0dXJlTW9kZWxQb2ludCA9ICcnO1xuICAgICAgbWFwVXJsID0gJyc7XG4gICAgICB6aXBVcmwgPSAnJztcbiAgICAgIGlmIChpc0Jpb2RpdmVyc2l0eSkge1xuICAgICAgICBmdXR1cmVNb2RlbFBvaW50ID0gWydiaW9kaXZlcnNpdHkvZGVjaWxlcy9iaW9kaXZlcnNpdHknLCBzaWRlSW5mby5zY2VuYXJpbywgc2lkZUluZm8ueWVhciwgc2lkZUluZm8uZ2NtXS5qb2luKCdfJyk7XG4gICAgICAgIGlmIChzaWRlSW5mby55ZWFyID09PSAnYmFzZWxpbmUnKSB7XG4gICAgICAgICAgZnV0dXJlTW9kZWxQb2ludCA9ICdiaW9kaXZlcnNpdHkvYmlvZGl2ZXJzaXR5X2N1cnJlbnQnO1xuICAgICAgICB9XG4gICAgICAgIG1hcFVybCA9IFtcbiAgICAgICAgICB0aGlzLnJlc29sdmVQbGFjZWhvbGRlcnModGhpcy5iaW9kaXZEYXRhVXJsLCB7XG4gICAgICAgICAgICBzcHBHcm91cDogc2lkZUluZm8uc3BlY2llc05hbWVcbiAgICAgICAgICB9KSwgZnV0dXJlTW9kZWxQb2ludCArICcudGlmJ1xuICAgICAgICBdLmpvaW4oJy8nKTtcbiAgICAgICAgemlwVXJsID0gW1xuICAgICAgICAgIHRoaXMucmVzb2x2ZVBsYWNlaG9sZGVycyh0aGlzLmJpb2RpdkRhdGFVcmwsIHtcbiAgICAgICAgICAgIHNwcEdyb3VwOiBzaWRlSW5mby5zcGVjaWVzTmFtZVxuICAgICAgICAgIH0pLCAnYmlvZGl2ZXJzaXR5Jywgc2lkZUluZm8uc3BlY2llc05hbWUgKyAnLnppcCdcbiAgICAgICAgXS5qb2luKCcvJyk7XG4gICAgICAgIHRoaXMuJCgnIycgKyBzaWRlICsgJ21hcGRsJykuYXR0cignaHJlZicsIG1hcFVybCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzcHBGaWxlTmFtZSA9IFsnVEVNUCcsIHNpZGVJbmZvLmRlZ3MsIHNpZGVJbmZvLmNvbmZpZGVuY2UgKyAnLicgKyBzaWRlSW5mby5yYW5nZV0uam9pbignXycpO1xuICAgICAgICBpZiAoc2lkZUluZm8uZGVncyA9PT0gJ2N1cnJlbnQnKSB7XG4gICAgICAgICAgc3BwRmlsZU5hbWUgPSAnY3VycmVudCc7XG4gICAgICAgIH1cbiAgICAgICAgbWFwVXJsID0gW1xuICAgICAgICAgIHRoaXMucmVzb2x2ZVBsYWNlaG9sZGVycyh0aGlzLnNwZWNpZXNEYXRhVXJsLCB7XG4gICAgICAgICAgICBzcHBVcmw6IHRoaXMuc3BlY2llc1VybHNbc2lkZUluZm8uc3BlY2llc05hbWVdXG4gICAgICAgICAgfSksIHNwcEZpbGVOYW1lICsgJy50aWYnXG4gICAgICAgIF0uam9pbignLycpO1xuICAgICAgICB0aGlzLiQoJyMnICsgc2lkZSArICdtYXBkbCcpLmF0dHIoJ2hyZWYnLCBtYXBVcmwpO1xuICAgICAgfVxuICAgICAgbGF5ZXIgPSBMLnRpbGVMYXllci53bXModGhpcy5yZXNvbHZlUGxhY2Vob2xkZXJzKHRoaXMucmFzdGVyQXBpVXJsKSwge1xuICAgICAgICBEQVRBX1VSTDogbWFwVXJsLFxuICAgICAgICBsYXllcnM6ICdERUZBVUxUJyxcbiAgICAgICAgZm9ybWF0OiAnaW1hZ2UvcG5nJyxcbiAgICAgICAgdHJhbnNwYXJlbnQ6IHRydWVcbiAgICAgIH0pO1xuICAgICAgbG9hZENsYXNzID0gJycgKyBzaWRlICsgJ2xvYWRpbmcnO1xuICAgICAgbGF5ZXIub24oJ2xvYWRpbmcnLCAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiBfdGhpcy4kZWwuYWRkQ2xhc3MobG9hZENsYXNzKTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKTtcbiAgICAgIGxheWVyLm9uKCdsb2FkJywgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gX3RoaXMuJGVsLnJlbW92ZUNsYXNzKGxvYWRDbGFzcyk7XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKSk7XG4gICAgICBpZiAoc2lkZSA9PT0gJ2xlZnQnKSB7XG4gICAgICAgIGlmICh0aGlzLmxlZnRMYXllcikge1xuICAgICAgICAgIHRoaXMubWFwLnJlbW92ZUxheWVyKHRoaXMubGVmdExheWVyKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmxlZnRMYXllciA9IGxheWVyO1xuICAgICAgfVxuICAgICAgaWYgKHNpZGUgPT09ICdyaWdodCcpIHtcbiAgICAgICAgaWYgKHRoaXMucmlnaHRMYXllcikge1xuICAgICAgICAgIHRoaXMubWFwLnJlbW92ZUxheWVyKHRoaXMucmlnaHRMYXllcik7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5yaWdodExheWVyID0gbGF5ZXI7XG4gICAgICB9XG4gICAgICBsYXllci5hZGRUbyh0aGlzLm1hcCk7XG4gICAgICB0aGlzLnJlc2l6ZVRoaW5ncygpO1xuICAgICAgaWYgKHdpbmRvdy5sb2NhdGlvbi5ob3N0bmFtZSA9PT0gJ2xvY2FsaG9zdCcpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ21hcCBVUkwgaXM6ICcsIG1hcFVybCk7XG4gICAgICB9XG4gICAgICBpZiAoZ2EgJiYgdHlwZW9mIGdhID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGlmIChzaWRlSW5mby55ZWFyID09PSAnYmFzZWxpbmUnKSB7XG4gICAgICAgICAgdmFsID0gMTk5MDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB2YWwgPSBwYXJzZUludChzaWRlSW5mby55ZWFyLCAxMCk7XG4gICAgICAgIH1cbiAgICAgICAgdmFsID0gdmFsICsge1xuICAgICAgICAgICd0ZW50aCc6IDAuMSxcbiAgICAgICAgICAnZmlmdGlldGgnOiAwLjUsXG4gICAgICAgICAgJ25pbmV0aWV0aCc6IDAuOVxuICAgICAgICB9W3NpZGVJbmZvLmdjbV07XG4gICAgICAgIHJldHVybiBnYSgnc2VuZCcsIHtcbiAgICAgICAgICAnaGl0VHlwZSc6ICdldmVudCcsXG4gICAgICAgICAgJ2V2ZW50Q2F0ZWdvcnknOiAnbWFwc2hvdycsXG4gICAgICAgICAgJ2V2ZW50QWN0aW9uJzogc2lkZUluZm8uc3BlY2llc05hbWUsXG4gICAgICAgICAgJ2V2ZW50TGFiZWwnOiBzaWRlSW5mby5zY2VuYXJpbyxcbiAgICAgICAgICAnZXZlbnRWYWx1ZSc6IHZhbFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGNlbnRyZU1hcDogZnVuY3Rpb24ocmVwZWF0ZWRseUZvcikge1xuICAgICAgdmFyIGxhdGVyLCByZWNlbnRyZSwgX2ksIF9yZXN1bHRzO1xuICAgICAgZGVidWcoJ0FwcFZpZXcuY2VudHJlTWFwJyk7XG4gICAgICBpZiAoIXJlcGVhdGVkbHlGb3IpIHtcbiAgICAgICAgcmVwZWF0ZWRseUZvciA9IDUwMDtcbiAgICAgIH1cbiAgICAgIHJlY2VudHJlID0gKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICBfdGhpcy5tYXAuaW52YWxpZGF0ZVNpemUoZmFsc2UpO1xuICAgICAgICAgIHJldHVybiBfdGhpcy5yZXNpemVUaGluZ3MoKTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpO1xuICAgICAgX3Jlc3VsdHMgPSBbXTtcbiAgICAgIGZvciAobGF0ZXIgPSBfaSA9IDA7IF9pIDw9IHJlcGVhdGVkbHlGb3I7IGxhdGVyID0gX2kgKz0gMjUpIHtcbiAgICAgICAgX3Jlc3VsdHMucHVzaChzZXRUaW1lb3V0KHJlY2VudHJlLCBsYXRlcikpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIF9yZXN1bHRzO1xuICAgIH0sXG4gICAgdG9nZ2xlRm9ybXM6IGZ1bmN0aW9uKCkge1xuICAgICAgZGVidWcoJ0FwcFZpZXcudG9nZ2xlRm9ybXMnKTtcbiAgICAgIHRoaXMuJGVsLnRvZ2dsZUNsYXNzKCdzaG93Zm9ybXMnKTtcbiAgICAgIHJldHVybiB0aGlzLmNlbnRyZU1hcCgpO1xuICAgIH0sXG4gICAgdG9nZ2xlU3BsaXR0ZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgZGVidWcoJ0FwcFZpZXcudG9nZ2xlU3BsaXR0ZXInKTtcbiAgICAgIHRoaXMuJGVsLnRvZ2dsZUNsYXNzKCdzcGxpdCcpO1xuICAgICAgaWYgKHRoaXMuJGVsLmhhc0NsYXNzKCdzcGxpdCcpKSB7XG4gICAgICAgIHRoaXMuYWN0aXZhdGVTcGxpdHRlcigpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5kZWFjdGl2YXRlU3BsaXR0ZXIoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLmNlbnRyZU1hcCgpO1xuICAgIH0sXG4gICAgdG9nZ2xlU3luYzogZnVuY3Rpb24oKSB7XG4gICAgICBkZWJ1ZygnQXBwVmlldy50b2dnbGVTeW5jJyk7XG4gICAgICBpZiAodGhpcy4kKCcjc3luYycpWzBdLmNoZWNrZWQpIHtcbiAgICAgICAgdGhpcy4kKCcucmlnaHRtYXBzcHAnKS5wcm9wKCdkaXNhYmxlZCcsIHRydWUpO1xuICAgICAgICByZXR1cm4gdGhpcy5jb3B5U3BwVG9SaWdodFNpZGUoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB0aGlzLiQoJy5yaWdodG1hcHNwcCcpLnByb3AoJ2Rpc2FibGVkJywgZmFsc2UpO1xuICAgICAgfVxuICAgIH0sXG4gICAgZmV0Y2hTcGVjaWVzSW5mbzogZnVuY3Rpb24oKSB7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5mZXRjaFNwZWNpZXNJbmZvJyk7XG4gICAgICByZXR1cm4gJC5hamF4KHtcbiAgICAgICAgdXJsOiAnL2RhdGEvc3BlY2llcycsXG4gICAgICAgIGRhdGFUeXBlOiAnanNvbidcbiAgICAgIH0pLmRvbmUoKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgdmFyIGNvbW1vbk5hbWVXcml0ZXIsIHNwZWNpZXNMb29rdXBMaXN0LCBzcGVjaWVzU2NpTmFtZUxpc3QsIHNwZWNpZXNVcmxzO1xuICAgICAgICAgIHNwZWNpZXNMb29rdXBMaXN0ID0gW107XG4gICAgICAgICAgc3BlY2llc1NjaU5hbWVMaXN0ID0gW107XG4gICAgICAgICAgc3BlY2llc1VybHMgPSB7fTtcbiAgICAgICAgICBjb21tb25OYW1lV3JpdGVyID0gZnVuY3Rpb24oc2NpTmFtZSkge1xuICAgICAgICAgICAgdmFyIHNjaU5hbWVQb3N0Zml4O1xuICAgICAgICAgICAgc2NpTmFtZVBvc3RmaXggPSBcIiAoXCIgKyBzY2lOYW1lICsgXCIpXCI7XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oY25JbmRleCwgY24pIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHNwZWNpZXNMb29rdXBMaXN0LnB1c2goe1xuICAgICAgICAgICAgICAgIGxhYmVsOiBjbiArIHNjaU5hbWVQb3N0Zml4LFxuICAgICAgICAgICAgICAgIHZhbHVlOiBzY2lOYW1lXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9O1xuICAgICAgICAgICQuZWFjaChkYXRhLCBmdW5jdGlvbihzY2lOYW1lLCBzcHBJbmZvKSB7XG4gICAgICAgICAgICBzcGVjaWVzU2NpTmFtZUxpc3QucHVzaChzY2lOYW1lKTtcbiAgICAgICAgICAgIHNwZWNpZXNVcmxzW3NjaU5hbWVdID0gc3BwSW5mby5wYXRoO1xuICAgICAgICAgICAgaWYgKHNwcEluZm8uY29tbW9uTmFtZXMpIHtcbiAgICAgICAgICAgICAgcmV0dXJuICQuZWFjaChzcHBJbmZvLmNvbW1vbk5hbWVzLCBjb21tb25OYW1lV3JpdGVyKHNjaU5hbWUpKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHJldHVybiBzcGVjaWVzTG9va3VwTGlzdC5wdXNoKHtcbiAgICAgICAgICAgICAgICBsYWJlbDogc2NpTmFtZSxcbiAgICAgICAgICAgICAgICB2YWx1ZTogc2NpTmFtZVxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgICBfdGhpcy5zcGVjaWVzTG9va3VwTGlzdCA9IHNwZWNpZXNMb29rdXBMaXN0O1xuICAgICAgICAgIF90aGlzLnNwZWNpZXNTY2lOYW1lTGlzdCA9IHNwZWNpZXNTY2lOYW1lTGlzdDtcbiAgICAgICAgICByZXR1cm4gX3RoaXMuc3BlY2llc1VybHMgPSBzcGVjaWVzVXJscztcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKTtcbiAgICB9LFxuICAgIGZldGNoQmlvZGl2SW5mbzogZnVuY3Rpb24oKSB7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5mZXRjaEJpb2RpdkluZm8nKTtcbiAgICAgIHJldHVybiAkLmFqYXgoe1xuICAgICAgICB1cmw6ICcvZGF0YS9iaW9kaXZlcnNpdHknLFxuICAgICAgICBkYXRhVHlwZTogJ2pzb24nXG4gICAgICB9KS5kb25lKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgIHZhciBiaW9kaXZMaXN0LCBiaW9kaXZMb29rdXBMaXN0O1xuICAgICAgICAgIGJpb2Rpdkxpc3QgPSBbXTtcbiAgICAgICAgICBiaW9kaXZMb29rdXBMaXN0ID0gW107XG4gICAgICAgICAgJC5lYWNoKGRhdGEsIGZ1bmN0aW9uKGJpb2Rpdk5hbWUsIGJpb2RpdkluZm8pIHtcbiAgICAgICAgICAgIHZhciBiaW9kaXZDYXBOYW1lO1xuICAgICAgICAgICAgYmlvZGl2Q2FwTmFtZSA9IGJpb2Rpdk5hbWUucmVwbGFjZSgvXi4vLCBmdW5jdGlvbihjKSB7XG4gICAgICAgICAgICAgIHJldHVybiBjLnRvVXBwZXJDYXNlKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGJpb2Rpdkxpc3QucHVzaChiaW9kaXZOYW1lKTtcbiAgICAgICAgICAgIHJldHVybiBiaW9kaXZMb29rdXBMaXN0LnB1c2goe1xuICAgICAgICAgICAgICBsYWJlbDogXCJCaW9kaXZlcnNpdHkgb2YgXCIgKyBiaW9kaXZDYXBOYW1lLFxuICAgICAgICAgICAgICB2YWx1ZTogYmlvZGl2TmFtZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgX3RoaXMuYmlvZGl2TGlzdCA9IGJpb2Rpdkxpc3Q7XG4gICAgICAgICAgcmV0dXJuIF90aGlzLmJpb2Rpdkxvb2t1cExpc3QgPSBiaW9kaXZMb29rdXBMaXN0O1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpO1xuICAgIH0sXG4gICAgYnVpbGRMZWZ0Rm9ybTogZnVuY3Rpb24oKSB7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5idWlsZExlZnRGb3JtJyk7XG4gICAgICByZXR1cm4gJC53aGVuKHRoaXMuc3BlY2llc0luZm9GZXRjaFByb2Nlc3MsIHRoaXMuYmlvZGl2SW5mb0ZldGNoUHJvY2VzcykuZG9uZSgoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHZhciAkbGVmdG1hcHNwcDtcbiAgICAgICAgICAkbGVmdG1hcHNwcCA9IF90aGlzLiQoJyNsZWZ0bWFwc3BwJyk7XG4gICAgICAgICAgX3RoaXMubmFtZXNMaXN0ID0gX3RoaXMuYmlvZGl2TGlzdC5jb25jYXQoX3RoaXMuc3BlY2llc1NjaU5hbWVMaXN0KTtcbiAgICAgICAgICByZXR1cm4gJGxlZnRtYXBzcHAuYXV0b2NvbXBsZXRlKHtcbiAgICAgICAgICAgIHNvdXJjZTogX3RoaXMuYmlvZGl2TG9va3VwTGlzdC5jb25jYXQoX3RoaXMuc3BlY2llc0xvb2t1cExpc3QpLFxuICAgICAgICAgICAgY2xvc2U6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICByZXR1cm4gX3RoaXMuJGVsLnRyaWdnZXIoJ2xlZnRtYXB1cGRhdGUnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKTtcbiAgICB9LFxuICAgIGJ1aWxkUmlnaHRGb3JtOiBmdW5jdGlvbigpIHtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LmJ1aWxkUmlnaHRGb3JtJyk7XG4gICAgICByZXR1cm4gJC53aGVuKHRoaXMuc3BlY2llc0luZm9GZXRjaFByb2Nlc3MsIHRoaXMuYmlvZGl2SW5mb0ZldGNoUHJvY2VzcykuZG9uZSgoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHZhciAkcmlnaHRtYXBzcHA7XG4gICAgICAgICAgJHJpZ2h0bWFwc3BwID0gX3RoaXMuJCgnI3JpZ2h0bWFwc3BwJyk7XG4gICAgICAgICAgX3RoaXMubmFtZXNMaXN0ID0gX3RoaXMuYmlvZGl2TGlzdC5jb25jYXQoX3RoaXMuc3BlY2llc1NjaU5hbWVMaXN0KTtcbiAgICAgICAgICByZXR1cm4gJHJpZ2h0bWFwc3BwLmF1dG9jb21wbGV0ZSh7XG4gICAgICAgICAgICBzb3VyY2U6ICcvYXBpL25hbWVzZWFyY2gnLFxuICAgICAgICAgICAgY2xvc2U6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICByZXR1cm4gX3RoaXMuJGVsLnRyaWdnZXIoJ3JpZ2h0bWFwdXBkYXRlJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKSk7XG4gICAgfSxcbiAgICBzdGFydFNwbGl0dGVyVHJhY2tpbmc6IGZ1bmN0aW9uKCkge1xuICAgICAgZGVidWcoJ0FwcFZpZXcuc3RhcnRTcGxpdHRlclRyYWNraW5nJyk7XG4gICAgICB0aGlzLnRyYWNrU3BsaXR0ZXIgPSB0cnVlO1xuICAgICAgdGhpcy5zcGxpdExpbmUuYWRkQ2xhc3MoJ2RyYWdnaW5nJyk7XG4gICAgICByZXR1cm4gdGhpcy5sb2NhdGVTcGxpdHRlcigpO1xuICAgIH0sXG4gICAgbG9jYXRlU3BsaXR0ZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgZGVidWcoJ0FwcFZpZXcubG9jYXRlU3BsaXR0ZXInKTtcbiAgICAgIGlmICh0aGlzLnRyYWNrU3BsaXR0ZXIpIHtcbiAgICAgICAgdGhpcy5yZXNpemVUaGluZ3MoKTtcbiAgICAgICAgaWYgKHRoaXMudHJhY2tTcGxpdHRlciA9PT0gMCkge1xuICAgICAgICAgIHRoaXMudHJhY2tTcGxpdHRlciA9IGZhbHNlO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMudHJhY2tTcGxpdHRlciAhPT0gdHJ1ZSkge1xuICAgICAgICAgIHRoaXMudHJhY2tTcGxpdHRlciAtPSAxO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KHRoaXMubG9jYXRlU3BsaXR0ZXIsIHRoaXMudHJhY2tQZXJpb2QpO1xuICAgICAgfVxuICAgIH0sXG4gICAgcmVzaXplVGhpbmdzOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciAkbWFwQm94LCBib3R0b21SaWdodCwgbGF5ZXJCb3R0b20sIGxheWVyVG9wLCBsZWZ0TGVmdCwgbGVmdE1hcCwgbWFwQm91bmRzLCBtYXBCb3gsIG5ld0xlZnRXaWR0aCwgcmlnaHRNYXAsIHJpZ2h0UmlnaHQsIHNwbGl0UG9pbnQsIHNwbGl0WCwgdG9wTGVmdDtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LnJlc2l6ZVRoaW5ncycpO1xuICAgICAgaWYgKHRoaXMubGVmdExheWVyKSB7XG4gICAgICAgIGxlZnRNYXAgPSAkKHRoaXMubGVmdExheWVyLmdldENvbnRhaW5lcigpKTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLnJpZ2h0TGF5ZXIpIHtcbiAgICAgICAgcmlnaHRNYXAgPSAkKHRoaXMucmlnaHRMYXllci5nZXRDb250YWluZXIoKSk7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy4kZWwuaGFzQ2xhc3MoJ3NwbGl0JykpIHtcbiAgICAgICAgbmV3TGVmdFdpZHRoID0gdGhpcy5zcGxpdFRodW1iLnBvc2l0aW9uKCkubGVmdCArICh0aGlzLnNwbGl0VGh1bWIud2lkdGgoKSAvIDIuMCk7XG4gICAgICAgIG1hcEJveCA9IHRoaXMubWFwLmdldENvbnRhaW5lcigpO1xuICAgICAgICAkbWFwQm94ID0gJChtYXBCb3gpO1xuICAgICAgICBtYXBCb3VuZHMgPSBtYXBCb3guZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIHRvcExlZnQgPSB0aGlzLm1hcC5jb250YWluZXJQb2ludFRvTGF5ZXJQb2ludChbMCwgMF0pO1xuICAgICAgICBzcGxpdFBvaW50ID0gdGhpcy5tYXAuY29udGFpbmVyUG9pbnRUb0xheWVyUG9pbnQoW25ld0xlZnRXaWR0aCwgMF0pO1xuICAgICAgICBib3R0b21SaWdodCA9IHRoaXMubWFwLmNvbnRhaW5lclBvaW50VG9MYXllclBvaW50KFskbWFwQm94LndpZHRoKCksICRtYXBCb3guaGVpZ2h0KCldKTtcbiAgICAgICAgbGF5ZXJUb3AgPSB0b3BMZWZ0Lnk7XG4gICAgICAgIGxheWVyQm90dG9tID0gYm90dG9tUmlnaHQueTtcbiAgICAgICAgc3BsaXRYID0gc3BsaXRQb2ludC54IC0gbWFwQm91bmRzLmxlZnQ7XG4gICAgICAgIGxlZnRMZWZ0ID0gdG9wTGVmdC54IC0gbWFwQm91bmRzLmxlZnQ7XG4gICAgICAgIHJpZ2h0UmlnaHQgPSBib3R0b21SaWdodC54O1xuICAgICAgICB0aGlzLnNwbGl0TGluZS5jc3MoJ2xlZnQnLCBuZXdMZWZ0V2lkdGgpO1xuICAgICAgICB0aGlzLmxlZnRUYWcuYXR0cignc3R5bGUnLCBcImNsaXA6IHJlY3QoMCwgXCIgKyBuZXdMZWZ0V2lkdGggKyBcInB4LCBhdXRvLCAwKVwiKTtcbiAgICAgICAgaWYgKHRoaXMubGVmdExheWVyKSB7XG4gICAgICAgICAgbGVmdE1hcC5hdHRyKCdzdHlsZScsIFwiY2xpcDogcmVjdChcIiArIGxheWVyVG9wICsgXCJweCwgXCIgKyBzcGxpdFggKyBcInB4LCBcIiArIGxheWVyQm90dG9tICsgXCJweCwgXCIgKyBsZWZ0TGVmdCArIFwicHgpXCIpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnJpZ2h0TGF5ZXIpIHtcbiAgICAgICAgICByZXR1cm4gcmlnaHRNYXAuYXR0cignc3R5bGUnLCBcImNsaXA6IHJlY3QoXCIgKyBsYXllclRvcCArIFwicHgsIFwiICsgcmlnaHRSaWdodCArIFwicHgsIFwiICsgbGF5ZXJCb3R0b20gKyBcInB4LCBcIiArIHNwbGl0WCArIFwicHgpXCIpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmxlZnRUYWcuYXR0cignc3R5bGUnLCAnY2xpcDogaW5oZXJpdCcpO1xuICAgICAgICBpZiAodGhpcy5sZWZ0TGF5ZXIpIHtcbiAgICAgICAgICBsZWZ0TWFwLmF0dHIoJ3N0eWxlJywgJ2NsaXA6IGluaGVyaXQnKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5yaWdodExheWVyKSB7XG4gICAgICAgICAgcmV0dXJuIHJpZ2h0TWFwLmF0dHIoJ3N0eWxlJywgJ2NsaXA6IHJlY3QoMCwwLDAsMCknKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgc3RvcFNwbGl0dGVyVHJhY2tpbmc6IGZ1bmN0aW9uKCkge1xuICAgICAgZGVidWcoJ0FwcFZpZXcuc3RvcFNwbGl0dGVyVHJhY2tpbmcnKTtcbiAgICAgIHRoaXMuc3BsaXRMaW5lLnJlbW92ZUNsYXNzKCdkcmFnZ2luZycpO1xuICAgICAgcmV0dXJuIHRoaXMudHJhY2tTcGxpdHRlciA9IDU7XG4gICAgfSxcbiAgICBhY3RpdmF0ZVNwbGl0dGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LmFjdGl2YXRlU3BsaXR0ZXInKTtcbiAgICAgIHRoaXMuc3BsaXRUaHVtYi5kcmFnZ2FibGUoe1xuICAgICAgICBjb250YWlubWVudDogJCgnI21hcHdyYXBwZXInKSxcbiAgICAgICAgc2Nyb2xsOiBmYWxzZSxcbiAgICAgICAgc3RhcnQ6IHRoaXMuc3RhcnRTcGxpdHRlclRyYWNraW5nLFxuICAgICAgICBkcmFnOiB0aGlzLnJlc2l6ZVRoaW5ncyxcbiAgICAgICAgc3RvcDogdGhpcy5zdG9wU3BsaXR0ZXJUcmFja2luZ1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gdGhpcy5yZXNpemVUaGluZ3MoKTtcbiAgICB9LFxuICAgIGRlYWN0aXZhdGVTcGxpdHRlcjogZnVuY3Rpb24oKSB7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5kZWFjdGl2YXRlU3BsaXR0ZXInKTtcbiAgICAgIHRoaXMuc3BsaXRUaHVtYi5kcmFnZ2FibGUoJ2Rlc3Ryb3knKTtcbiAgICAgIHJldHVybiB0aGlzLnJlc2l6ZVRoaW5ncygpO1xuICAgIH1cbiAgfSwge1xuICAgIHRlbXBsYXRlczoge1xuICAgICAgbGF5b3V0OiBfLnRlbXBsYXRlKFwiPGRpdiBjbGFzPVxcXCJ1aS1mcm9udFxcXCI+PC9kaXY+XFxuPGRpdiBjbGFzcz1cXFwic3BsaXRsaW5lXFxcIj4mbmJzcDs8L2Rpdj5cXG48ZGl2IGNsYXNzPVxcXCJzcGxpdHRodW1iXFxcIj48c3Bhbj4mI3gyNzZlOyAmI3gyNzZmOzwvc3Bhbj48L2Rpdj5cXG48ZGl2IGNsYXNzPVxcXCJsZWZ0IHRhZ1xcXCI+PCU9IGxlZnRUYWcgJT48L2Rpdj5cXG48ZGl2IGNsYXNzPVxcXCJyaWdodCB0YWdcXFwiPjwlPSByaWdodFRhZyAlPjwvZGl2PlxcbjxkaXYgY2xhc3M9XFxcImxlZnQgc2lkZSBmb3JtXFxcIj48JT0gbGVmdEZvcm0gJT48L2Rpdj5cXG48ZGl2IGNsYXNzPVxcXCJyaWdodCBzaWRlIGZvcm1cXFwiPjwlPSByaWdodEZvcm0gJT48L2Rpdj5cXG48ZGl2IGNsYXNzPVxcXCJsZWZ0IGxvYWRlclxcXCI+PGltZyBzcmM9XFxcIi9zdGF0aWMvaW1hZ2VzL3NwaW5uZXIubG9hZGluZm8ubmV0LmdpZlxcXCIgLz48L2Rpdj5cXG48ZGl2IGNsYXNzPVxcXCJyaWdodCBsb2FkZXJcXFwiPjxpbWcgc3JjPVxcXCIvc3RhdGljL2ltYWdlcy9zcGlubmVyLmxvYWRpbmZvLm5ldC5naWZcXFwiIC8+PC9kaXY+XFxuPGRpdiBpZD1cXFwibWFwd3JhcHBlclxcXCI+PGRpdiBpZD1cXFwibWFwXFxcIj48L2Rpdj48L2Rpdj5cIiksXG4gICAgICBsZWZ0VGFnOiBfLnRlbXBsYXRlKFwiPGRpdiBjbGFzcz1cXFwic2hvd1xcXCI+XFxuICAgIDxzcGFuIGNsYXNzPVxcXCJsZWZ0bGF5ZXJuYW1lXFxcIj5wbGFpbiBtYXA8L3NwYW4+XFxuICAgIDxicj5cXG4gICAgPGJ1dHRvbiBjbGFzcz1cXFwiYnRuLWNoYW5nZVxcXCI+c2V0dGluZ3M8L2J1dHRvbj5cXG4gICAgPGJ1dHRvbiBjbGFzcz1cXFwiYnRuLWNvbXBhcmVcXFwiPnNob3cvaGlkZSBjb21wYXJpc29uIG1hcDwvYnV0dG9uPlxcbjwvZGl2PlxcbjxkaXYgY2xhc3M9XFxcImVkaXRcXFwiPlxcbiAgICA8bGFiZWwgY2xhc3M9XFxcImxlZnQgc3luY2JveFxcXCI+PC9sYWJlbD5cXG4gICAgPGlucHV0IGlkPVxcXCJsZWZ0bWFwc3BwXFxcIiBjbGFzcz1cXFwibGVmdFxcXCIgdHlwZT1cXFwidGV4dFxcXCIgbmFtZT1cXFwibGVmdG1hcHNwcFxcXCIgcGxhY2Vob2xkZXI9XFxcIiZoZWxsaXA7IHNwZWNpZXMgb3IgZ3JvdXAgJmhlbGxpcDtcXFwiIC8+XFxuPC9kaXY+XCIpLFxuICAgICAgcmlnaHRUYWc6IF8udGVtcGxhdGUoXCI8ZGl2IGNsYXNzPVxcXCJzaG93XFxcIj5cXG4gICAgPHNwYW4gY2xhc3M9XFxcInJpZ2h0bGF5ZXJuYW1lXFxcIj4obm8gZGlzdHJpYnV0aW9uKTwvc3Bhbj5cXG4gICAgPGJyPlxcbiAgICA8YnV0dG9uIGNsYXNzPVxcXCJidG4tY2hhbmdlXFxcIj5zZXR0aW5nczwvYnV0dG9uPlxcbiAgICA8YnV0dG9uIGNsYXNzPVxcXCJidG4tY29tcGFyZVxcXCI+c2hvdy9oaWRlIGNvbXBhcmlzb24gbWFwPC9idXR0b24+XFxuPC9kaXY+XFxuPGRpdiBjbGFzcz1cXFwiZWRpdFxcXCI+XFxuICAgIDxsYWJlbCBjbGFzcz1cXFwicmlnaHQgc3luY2JveFxcXCI+PGlucHV0IGlkPVxcXCJzeW5jXFxcIiB0eXBlPVxcXCJjaGVja2JveFxcXCIgdmFsdWU9XFxcInN5bmNcXFwiIGNoZWNrZWQ9XFxcImNoZWNrZWRcXFwiIC8+IHNhbWUgYXMgbGVmdCBzaWRlPC9sYWJlbD5cXG4gICAgPGlucHV0IGlkPVxcXCJyaWdodG1hcHNwcFxcXCIgdHlwZT1cXFwidGV4dFxcXCIgY2xhc3M9XFxcInJpZ2h0XFxcIiBuYW1lPVxcXCJyaWdodG1hcHNwcFxcXCIgcGxhY2Vob2xkZXI9XFxcIiZoZWxsaXA7IHNwZWNpZXMgb3IgZ3JvdXAgJmhlbGxpcDtcXFwiIC8+XFxuPC9kaXY+XCIpLFxuICAgICAgbGVmdEZvcm06IF8udGVtcGxhdGUoXCI8ZmllbGRzZXQ+XFxuICAgIDxsZWdlbmQ+dGVtcGVyYXR1cmUgY2hhbmdlPC9sZWdlbmQ+XFxuICAgIDxzZWxlY3QgY2xhc3M9XFxcImxlZnRcXFwiIGlkPVxcXCJsZWZ0bWFwZGVnc1xcXCI+XFxuICAgICAgICA8b3B0aW9uIHZhbHVlPVxcXCJjdXJyZW50XFxcIj5jdXJyZW50PC9vcHRpb24+XFxuICAgICAgICA8b3B0aW9uIHZhbHVlPVxcXCIxLjVcXFwiPjEuNSAmZGVnO0M8L29wdGlvbj5cXG4gICAgICAgIDxvcHRpb24gdmFsdWU9XFxcIjJcXFwiPjIuMCAmZGVnO0M8L29wdGlvbj5cXG4gICAgICAgIDxvcHRpb24gdmFsdWU9XFxcIjIuN1xcXCI+Mi43ICZkZWc7Qzwvb3B0aW9uPlxcbiAgICAgICAgPG9wdGlvbiB2YWx1ZT1cXFwiMy4yXFxcIj4zLjIgJmRlZztDPC9vcHRpb24+XFxuICAgICAgICA8b3B0aW9uIHZhbHVlPVxcXCI0LjVcXFwiPjQuNSAmZGVnO0M8L29wdGlvbj5cXG4gICAgICAgIDxvcHRncm91cCBsYWJlbD1cXFwiSGlnaCBzZW5zaXRpdml0eSBjbGltYXRlXFxcIj5cXG4gICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVxcXCI2XFxcIj42LjAgJmRlZztDPC9vcHRpb24+XFxuICAgICAgICA8L29wdGdyb3VwPlxcbiAgICA8L3NlbGVjdD5cXG48L2ZpZWxkc2V0PlxcbjxmaWVsZHNldD5cXG4gICAgPGxlZ2VuZD5hZGFwdGF0aW9uIHZpYSByYW5nZSBzaGlmdDwvbGVnZW5kPlxcbiAgICA8bGFiZWw+PCEtLSBzcGFuPm5vbmU8L3NwYW4gLS0+IDxpbnB1dCBuYW1lPVxcXCJsZWZ0bWFwcmFuZ2VcXFwiIGNsYXNzPVxcXCJsZWZ0XFxcIiB0eXBlPVxcXCJyYWRpb1xcXCIgdmFsdWU9XFxcIm5vLmRpc3BcXFwiIGNoZWNrZWQ9XFxcImNoZWNrZWRcXFwiPiBzcGVjaWVzIGNhbm5vdCBzaGlmdCByYW5nZXM8L2xhYmVsPlxcbiAgICA8bGFiZWw+PCEtLSBzcGFuPmFsbG93PC9zcGFuIC0tPiA8aW5wdXQgbmFtZT1cXFwibGVmdG1hcHJhbmdlXFxcIiBjbGFzcz1cXFwibGVmdFxcXCIgdHlwZT1cXFwicmFkaW9cXFwiIHZhbHVlPVxcXCJyZWFsLmRpc3BcXFwiPiBhbGxvdyByYW5nZSBhZGFwdGF0aW9uPC9sYWJlbD5cXG48L2ZpZWxkc2V0PlxcbjxmaWVsZHNldD5cXG4gICAgPGxlZ2VuZD5tb2RlbCBzdW1tYXJ5PC9sZWdlbmQ+XFxuICAgIDxzZWxlY3QgY2xhc3M9XFxcImxlZnRcXFwiIGlkPVxcXCJsZWZ0bWFwY29uZmlkZW5jZVxcXCI+XFxuICAgICAgICA8b3B0aW9uIHZhbHVlPVxcXCIxMFxcXCI+MTB0aCBwZXJjZW50aWxlPC9vcHRpb24+XFxuICAgICAgICA8IS0tIG9wdGlvbiB2YWx1ZT1cXFwiMzNcXFwiPjMzcmQgcGVyY2VudGlsZTwvb3B0aW9uIC0tPlxcbiAgICAgICAgPG9wdGlvbiB2YWx1ZT1cXFwiNTBcXFwiIHNlbGVjdGVkPVxcXCJzZWxlY3RlZFxcXCI+NTB0aCBwZXJjZW50aWxlPC9vcHRpb24+XFxuICAgICAgICA8IS0tIG9wdGlvbiB2YWx1ZT1cXFwiNjZcXFwiPjY2dGggcGVyY2VudGlsZTwvb3B0aW9uIC0tPlxcbiAgICAgICAgPG9wdGlvbiB2YWx1ZT1cXFwiOTBcXFwiPjkwdGggcGVyY2VudGlsZTwvb3B0aW9uPlxcbiAgICA8L3NlbGVjdD5cXG48L2ZpZWxkc2V0PlxcbjxmaWVsZHNldCBjbGFzcz1cXFwiYmxhbmtcXFwiPlxcbiAgICA8YnV0dG9uIHR5cGU9XFxcImJ1dHRvblxcXCIgY2xhc3M9XFxcImJ0bi1jaGFuZ2VcXFwiPmhpZGUgc2V0dGluZ3M8L2J1dHRvbj5cXG4gICAgPGJ1dHRvbiB0eXBlPVxcXCJidXR0b25cXFwiIGNsYXNzPVxcXCJidG4tY29tcGFyZVxcXCI+aGlkZS9zaG93IHJpZ2h0IG1hcDwvYnV0dG9uPlxcbiAgICA8YnV0dG9uIHR5cGU9XFxcImJ1dHRvblxcXCIgY2xhc3M9XFxcImJ0bi1jb3B5IHJpZ2h0LXZhbGlkLW1hcFxcXCI+Y29weSByaWdodCBtYXAgJmxhcXVvOzwvYnV0dG9uPlxcbiAgICA8YSBpZD1cXFwibGVmdG1hcGRsXFxcIiBjbGFzcz1cXFwiZG93bmxvYWQgbGVmdC12YWxpZC1tYXBcXFwiIGhyZWY9XFxcIlxcXCIgZGlzYWJsZWQ9XFxcImRpc2FibGVkXFxcIj5kb3dubG9hZCBqdXN0IHRoaXMgbWFwPGJyPig8MU1iIEdlb1RJRkYpPC9hPlxcbjwvZmllbGRzZXQ+XFxuXCIpLFxuICAgICAgcmlnaHRGb3JtOiBfLnRlbXBsYXRlKFwiPGZpZWxkc2V0PlxcbiAgICA8bGVnZW5kPnRlbXBlcmF0dXJlIGNoYW5nZTwvbGVnZW5kPlxcbiAgICA8c2VsZWN0IGNsYXNzPVxcXCJyaWdodFxcXCIgaWQ9XFxcInJpZ2h0bWFwZGVnc1xcXCI+XFxuICAgICAgICA8b3B0aW9uIHZhbHVlPVxcXCJjdXJyZW50XFxcIj5jdXJyZW50PC9vcHRpb24+XFxuICAgICAgICA8b3B0aW9uIHZhbHVlPVxcXCIxLjVcXFwiPjEuNSAmZGVnO0M8L29wdGlvbj5cXG4gICAgICAgIDxvcHRpb24gdmFsdWU9XFxcIjJcXFwiPjIuMCAmZGVnO0M8L29wdGlvbj5cXG4gICAgICAgIDxvcHRpb24gdmFsdWU9XFxcIjIuN1xcXCI+Mi43ICZkZWc7Qzwvb3B0aW9uPlxcbiAgICAgICAgPG9wdGlvbiB2YWx1ZT1cXFwiMy4yXFxcIj4zLjIgJmRlZztDPC9vcHRpb24+XFxuICAgICAgICA8b3B0aW9uIHZhbHVlPVxcXCI0LjVcXFwiPjQuNSAmZGVnO0M8L29wdGlvbj5cXG4gICAgICAgIDxvcHRncm91cCBsYWJlbD1cXFwiSGlnaCBzZW5zaXRpdml0eSBjbGltYXRlXFxcIj5cXG4gICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVxcXCI2XFxcIj42LjAgJmRlZztDPC9vcHRpb24+XFxuICAgICAgICA8L29wdGdyb3VwPlxcbiAgICA8L3NlbGVjdD5cXG48L2ZpZWxkc2V0PlxcbjxmaWVsZHNldD5cXG4gICAgPGxlZ2VuZD5hZGFwdGF0aW9uIHZpYSByYW5nZSBzaGlmdDwvbGVnZW5kPlxcbiAgICA8bGFiZWw+PCEtLSBzcGFuPm5vbmU8L3NwYW4gLS0+IDxpbnB1dCBuYW1lPVxcXCJyaWdodG1hcHJhbmdlXFxcIiBjbGFzcz1cXFwicmlnaHRcXFwiIHR5cGU9XFxcInJhZGlvXFxcIiB2YWx1ZT1cXFwibm8uZGlzcFxcXCIgY2hlY2tlZD1cXFwiY2hlY2tlZFxcXCI+IHNwZWNpZXMgY2Fubm90IHNoaWZ0IHJhbmdlczwvbGFiZWw+XFxuICAgIDxsYWJlbD48IS0tIHNwYW4+YWxsb3c8L3NwYW4gLS0+IDxpbnB1dCBuYW1lPVxcXCJyaWdodG1hcHJhbmdlXFxcIiBjbGFzcz1cXFwicmlnaHRcXFwiIHR5cGU9XFxcInJhZGlvXFxcIiB2YWx1ZT1cXFwicmVhbC5kaXNwXFxcIj4gYWxsb3cgcmFuZ2UgYWRhcHRhdGlvbjwvbGFiZWw+XFxuPC9maWVsZHNldD5cXG48ZmllbGRzZXQ+XFxuICAgIDxsZWdlbmQ+bW9kZWwgc3VtbWFyeTwvbGVnZW5kPlxcbiAgICA8c2VsZWN0IGNsYXNzPVxcXCJyaWdodFxcXCIgaWQ9XFxcInJpZ2h0bWFwY29uZmlkZW5jZVxcXCI+XFxuICAgICAgICA8b3B0aW9uIHZhbHVlPVxcXCIxMFxcXCI+MTB0aCBwZXJjZW50aWxlPC9vcHRpb24+XFxuICAgICAgICA8IS0tIG9wdGlvbiB2YWx1ZT1cXFwiMzNcXFwiPjMzcmQgcGVyY2VudGlsZTwvb3B0aW9uIC0tPlxcbiAgICAgICAgPG9wdGlvbiB2YWx1ZT1cXFwiNTBcXFwiIHNlbGVjdGVkPVxcXCJzZWxlY3RlZFxcXCI+NTB0aCBwZXJjZW50aWxlPC9vcHRpb24+XFxuICAgICAgICA8IS0tIG9wdGlvbiB2YWx1ZT1cXFwiNjZcXFwiPjY2dGggcGVyY2VudGlsZTwvb3B0aW9uIC0tPlxcbiAgICAgICAgPG9wdGlvbiB2YWx1ZT1cXFwiOTBcXFwiPjkwdGggcGVyY2VudGlsZTwvb3B0aW9uPlxcbiAgICA8L3NlbGVjdD5cXG48L2ZpZWxkc2V0PlxcbjxmaWVsZHNldCBjbGFzcz1cXFwiYmxhbmtcXFwiPlxcbiAgICA8YnV0dG9uIHR5cGU9XFxcImJ1dHRvblxcXCIgY2xhc3M9XFxcImJ0bi1jaGFuZ2VcXFwiPmhpZGUgc2V0dGluZ3M8L2J1dHRvbj5cXG4gICAgPGJ1dHRvbiB0eXBlPVxcXCJidXR0b25cXFwiIGNsYXNzPVxcXCJidG4tY29tcGFyZVxcXCI+aGlkZS9zaG93IHJpZ2h0IG1hcDwvYnV0dG9uPlxcbiAgICA8YnV0dG9uIHR5cGU9XFxcImJ1dHRvblxcXCIgY2xhc3M9XFxcImJ0bi1jb3B5IGxlZnQtdmFsaWQtbWFwXFxcIj5jb3B5IGxlZnQgbWFwICZsYXF1bzs8L2J1dHRvbj5cXG4gICAgPGEgaWQ9XFxcInJpZ2h0bWFwZGxcXFwiIGNsYXNzPVxcXCJkb3dubG9hZCByaWdodC12YWxpZC1tYXBcXFwiIGhyZWY9XFxcIlxcXCIgZGlzYWJsZWQ9XFxcImRpc2FibGVkXFxcIj5kb3dubG9hZCBqdXN0IHRoaXMgbWFwPGJyPig8MU1iIEdlb1RJRkYpPC9hPlxcbjwvZmllbGRzZXQ+XFxuXCIpXG4gICAgfVxuICB9KTtcblxuICBtb2R1bGUuZXhwb3J0cyA9IEFwcFZpZXc7XG5cbn0pLmNhbGwodGhpcyk7XG4iXX0=
