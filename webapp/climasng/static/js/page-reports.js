(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

require('./reports/main');


},{"./reports/main":2}],2:[function(require,module,exports){
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

},{"./views/app":4}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
(function() {
  var AppView, debug;

  require('../util/shims');


  /* jshint -W093 */


  /* jshint -W041 */

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
    tagName: 'form',
    className: '',
    id: 'reportform',
    dataUrl: "" + location.protocol + "//" + location.host + "/data",
    rasterApiUrl: "" + location.protocol + "//localhost:10600/api/raster/1/wms_data_url",
    trackSplitter: false,
    trackPeriod: 100,
    events: {
      'change .sectionselector input': 'updateSectionSelection',
      'change .regionselect input': 'updateRegionSelection',
      'change .regionselect select': 'updateRegionSelection',
      'change .yearselect input': 'updateYearSelection',
      'click .getreport': 'getReport'
    },
    initialize: function() {
      var regFetch, sectFetch, yearFetch;
      debug('AppView.initialize');
      _.bindAll.apply(_, [this].concat(_.functions(this)));
      this.hash = '';
      sectFetch = this.fetchReportSections();
      regFetch = this.fetchRegions();
      yearFetch = this.fetchYears();
      $.when(sectFetch, regFetch, yearFetch).then((function(_this) {
        return function() {
          _this.checkHash();
          return _this.updateSummary();
        };
      })(this));
      return $(window).on('hashchange', (function(_this) {
        return function() {
          return _this.checkHash();
        };
      })(this));
    },
    render: function() {
      debug('AppView.render');
      this.$el.append(AppView.templates.layout({}));
      return $('#contentwrap .maincontent').append(this.$el);
    },
    checkHash: function() {
      var hash, hashData, key, value;
      hash = window.location.hash;
      if (this.hash === hash || hash.length < 2) {
        return;
      }
      hashData = this.splitHash(hash);
      for (key in hashData) {
        value = hashData[key];
        this.applyHashElement(key, value);
      }
      return this.hash = window.location.hash;
    },
    splitHash: function(hash) {
      var hashData, hashList, hashPair, _fn, _i, _len;
      hashData = {};
      hashList = hash.substring(1).split('/');
      _fn = (function(_this) {
        return function(hashPair) {
          var parts;
          parts = hashPair.split('=');
          if (parts.length === 2) {
            return hashData[parts[0]] = parts[1];
          }
        };
      })(this);
      for (_i = 0, _len = hashList.length; _i < _len; _i++) {
        hashPair = hashList[_i];
        _fn(hashPair);
      }
      return hashData;
    },
    applyHashElement: function(elem, value) {
      var regiontype;
      if (elem === 'region') {
        regiontype = value.split('_')[0];
        this.$('input[type=radio][name=regiontype][value="' + regiontype + '"]').click();
        this.$('select.regionselector option[value="' + value + '"]').parent().val(value).change();
      }
      if (elem === 'year') {
        return this.$('input[type=radio][name=year][value="' + value + '"]').click();
      }
    },
    makeHash: function() {
      var hashItems, key, newHash;
      debug('AppView.makeHash');
      hashItems = this.splitHash(window.location.hash);
      if (this.selectedYear) {
        hashItems.year = this.selectedYear;
      }
      if (this.selectedRegion && this.selectedRegion !== '') {
        hashItems.region = this.selectedRegion;
      }
      newHash = ((function() {
        var _results;
        _results = [];
        for (key in hashItems) {
          _results.push(key + '=' + hashItems[key]);
        }
        return _results;
      })()).join('/');
      return location.hash = '/' + newHash;
    },
    getReport: function() {
      var form;
      debug('AppView.getReport');
      this.$('#reportform').remove();
      form = [];
      form.push('<form action="/regionreport" method="get" id="reportform">');
      form.push('<input type="hidden" name="year" value="' + this.selectedYear + '">');
      form.push('<input type="hidden" name="regiontype" value="' + this.selectedRegionType + '">');
      form.push('<input type="hidden" name="region" value="' + this.selectedRegion + '">');
      form.push('<input type="hidden" name="sections" value="' + this.selectedSections.join(' ') + '">');
      form.push('</form>');
      this.$el.append(form.join('\n'));
      this.$('#reportform').submit();
      if (ga && typeof ga === 'function') {
        return ga('send', {
          'hitType': 'event',
          'eventCategory': 'reportdownload',
          'eventAction': this.selectedRegionType,
          'eventLabel': this.selectedRegion,
          'eventValue': parseInt(this.selectedYear, 10)
        });
      }
    },
    fetchReportSections: function() {
      var fetch;
      debug('AppView.fetchReportSections');
      fetch = $.ajax(this.dataUrl + '/reportsections');
      fetch.done((function(_this) {
        return function(data) {
          var sectionselect;
          _this.possibleSections = data.sections;
          sectionselect = _this.$('.sectionselect');
          sectionselect.empty().removeClass('loading');
          return _this.buildReportSectionList(_this.possibleSections, sectionselect);
        };
      })(this));
      return fetch.promise();
    },
    buildReportSectionList: function(data, wrapper) {
      debug('AppView.buildReportSectionList');
      $.each(data, (function(_this) {
        return function(index, item) {
          var selectorRow, subsections;
          selectorRow = $(AppView.templates.sectionSelector(item));
          $(wrapper).append(selectorRow);
          if (item.sections.length > 0) {
            subsections = $(AppView.templates.subsections());
            _this.buildReportSectionList(item.sections, subsections);
            return $(selectorRow).addClass('hassubsections').append(subsections);
          }
        };
      })(this));
      return this.updateSummary();
    },
    updateSectionSelection: function(event) {
      debug('AppView.updateSectionSelection');
      return this.handleSectionSelection(this.possibleSections);
    },
    handleSectionSelection: function(sectionList, parent) {
      debug('AppView.handleSectionSelection');
      $.each(sectionList, (function(_this) {
        return function(index, item) {
          var selectionControl, selector, _ref;
          selector = _this.$("#section-" + (item.id.replace(/\./g, '\\.')));
          selectionControl = selector.find('input');
          if (selectionControl.prop('checked')) {
            selector.removeClass('unselected');
          } else {
            selector.addClass('unselected');
          }
          if (((_ref = item.sections) != null ? _ref.length : void 0) > 0) {
            return _this.handleSectionSelection(item.sections, item.id);
          }
        };
      })(this));
      return this.updateSummary();
    },
    fetchRegions: function() {
      var fetch;
      debug('AppView.fetchRegions');
      fetch = $.ajax(this.dataUrl + '/reportregions');
      fetch.done((function(_this) {
        return function(data) {
          return _this.buildRegionList(data);
        };
      })(this));
      return fetch.promise();
    },
    buildRegionList: function(data) {
      var regionselect;
      debug('AppView.buildRegionList');
      this.regions = data.regiontypes;
      regionselect = this.$('.regionselect');
      regionselect.empty().removeClass('loading');
      $.each(this.regions, (function(_this) {
        return function(index, regionType) {
          var reg, regionTypeRow;
          regionType.optionList = [
            (function() {
              var _i, _len, _ref, _results;
              _ref = regionType.regions;
              _results = [];
              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                reg = _ref[_i];
                _results.push(AppView.templates.regionSelector(reg));
              }
              return _results;
            })()
          ].join("\n");
          regionTypeRow = $(AppView.templates.regionTypeSelector(regionType));
          return regionselect.append(regionTypeRow);
        };
      })(this));
      return this.updateSummary();
    },
    updateRegionSelection: function(event) {
      var selectedType;
      debug('AppView.updateRegionSelection');
      selectedType = this.$('[name=regiontype]:checked').val();
      $.each(this.regions, (function(_this) {
        return function(index, regionType) {
          var selector;
          selector = _this.$("#regiontype-" + regionType.id);
          if (selectedType === regionType.id) {
            selector.addClass('typeselected');
            _this.selectedRegionType = regionType.id;
            _this.selectedRegion = $(selector.find('select')).val();
            if (_this.selectedRegion === '') {
              return selector.removeClass('regionselected');
            } else {
              selector.addClass('regionselected');
              return _this.selectedRegionInfo = _.find(regionType.regions, function(region) {
                return region.id === _this.selectedRegion;
              });
            }
          } else {
            return selector.removeClass('typeselected');
          }
        };
      })(this));
      return this.updateSummary();
    },
    fetchYears: function() {
      var fetch;
      debug('AppView.fetchYears');
      fetch = $.Deferred();
      fetch.done((function(_this) {
        return function(data) {
          return _this.buildYearList(data);
        };
      })(this));
      setTimeout(function() {
        return fetch.resolve({
          years: ['2025', '2035', '2045', '2055', '2065', '2075', '2085']
        });
      }, 500 + (500 * Math.random()));
      return fetch.promise();
    },
    buildYearList: function(data) {
      var yearselect;
      debug('AppView.buildYearList');
      this.years = data.years;
      yearselect = this.$('.yearselect');
      yearselect.empty().removeClass('loading');
      $.each(this.years, (function(_this) {
        return function(index, year) {
          return yearselect.append(AppView.templates.yearSelector({
            year: year
          }));
        };
      })(this));
      return this.updateSummary();
    },
    updateYearSelection: function(event) {
      debug('AppView.updateYearSelection');
      this.selectedYear = this.$('[name=year]:checked').val();
      $.each(this.years, (function(_this) {
        return function(index, year) {
          var selector;
          selector = _this.$("#year-" + year);
          if (_this.selectedYear === year) {
            return selector.addClass('yearselected');
          } else {
            return selector.removeClass('yearselected');
          }
        };
      })(this));
      return this.updateSummary();
    },
    sectionId: function(sectionDom) {
      return $(sectionDom).find('input').attr('value');
    },
    sectionName: function(sectionDom) {
      return this.sectionInfo(sectionDom).name;
    },
    sectionInfo: function(sectionDom) {
      var info, parentIds, parentage;
      debug('AppView.sectionInfo');
      parentage = $(sectionDom).parents('.sectionselector');
      parentIds = parentage.map((function(_this) {
        return function(i, elem) {
          return _this.sectionId(elem);
        };
      })(this)).get().reverse();
      parentIds.push(this.sectionId(sectionDom));
      this.selectedSections.push(this.sectionId(sectionDom));
      info = {
        sections: this.possibleSections
      };
      parentIds.forEach(function(id) {
        return info = _.filter(info.sections, function(section) {
          return section.id === id;
        })[0];
      });
      return info;
    },
    subSectionList: function(sectionDom) {
      var list, subsections;
      debug('AppView.sectionList');
      list = [];
      subsections = $(sectionDom).children('.subsections');
      subsections.children('.sectionselector').not('.unselected').each((function(_this) {
        return function(i, elem) {
          var name, subs;
          name = _this.sectionName(elem);
          subs = _this.subSectionList(elem);
          if (subs !== '') {
            name = name + ' (' + subs + ')';
          }
          return list.push(name);
        };
      })(this));
      return list.join(', ');
    },
    updateSummary: function() {
      var content, contentList, selectedSections, summary, _ref;
      debug('AppView.updateSummary');
      selectedSections = this.$('.sectionselect > .sectionselector').not('.unselected');
      this.selectedSections = [];
      contentList = [];
      selectedSections.each((function(_this) {
        return function(index, section) {
          var info, subList;
          info = _this.sectionName(section);
          subList = _this.subSectionList(section);
          if (subList !== '') {
            info = info + ': ' + subList.toLowerCase();
          }
          return contentList.push(info + '.');
        };
      })(this));
      content = '';
      if (contentList.length > 0) {
        content = '<li>' + contentList.join('</li><li>') + '</li>';
      }
      summary = {
        regionName: (_ref = this.selectedRegionInfo) != null ? _ref.name : void 0,
        year: this.selectedYear,
        content: content
      };
      this.$('.reviewblock').html(AppView.templates.reviewBlock(summary));
      this.$('.reviewblock').toggleClass('regionselected', this.selectedRegionInfo !== void 0);
      this.$('.reviewblock').toggleClass('yearselected', this.selectedYear !== void 0);
      return this.makeHash();
    }
  }, {
    templates: {
      layout: _.template("<div class=\"formblock\">\n    <h1>Report on</h1>\n    <div class=\"loading select regionselect\">loading available regions..</div>\n\n    <h1>In the year</h1>\n    <div class=\"loading select yearselect\">loading available years..</div>\n\n    <h1>Including</h1>\n    <div class=\"loading select sectionselect\">loading available sections..</div>\n</div>\n<div class=\"reviewblock\"></div>"),
      reviewBlock: _.template("<h1>Selected Report</h1>\n<p class=\"coverage\">Covers\n    <% if (regionName) { %><%= regionName %><% } else { %><em>(unspecified region)</em><% } %>\n    in\n    <% if (year) { %><%= year %>.<% } else { %><em>(unspecified year)</em>.<% } %>\n</p>\n<ul class=\"contents\"><%= content %></ul>\n<button type=\"button\" class=\"getreport\">download report</button>"),
      reviewContentItem: _.template("<li>item</li>"),
      regionTypeSelector: _.template("<div class=\"regiontypeselector\" id=\"regiontype-<%= id %>\">\n    <label class=\"name\"><input\n        class=\"regiontype\"\n        name=\"regiontype\"\n        type=\"radio\"\n        value=\"<%= id %>\"\n    /> <%= name %>\n    </label>\n    <div class=\"regionselectorwrapper\"><select class=\"regionselector\">\n        <option value=\"\" disabled=\"disabled\" selected=\"selected\">select a region&hellip;</option>\n        <%= optionList %>\n    </select></div>\n</div>"),
      regionSelector: _.template("<option value=\"<%= id %>\"><%= name %></option>"),
      yearSelector: _.template("<div class=\"yearrow\" id=\"year-<%= year %>\">\n    <label class=\"name\"><input\n        class=\"year\"\n        name=\"year\"\n        type=\"radio\"\n        value=\"<%= year %>\"\n    /> <%= year %></label>\n</div>"),
      sectionSelector: _.template("<div class=\"sectionselector<% if (initial != 'included') { print(' unselected'); } %>\" id=\"section-<%= id %>\">\n    <label class=\"name\"\n        <% if (presence == 'required') { print('title=\"This section is required\"'); } %>\n    ><input\n        type=\"checkbox\"\n        value=\"<%= id %>\"\n        <% if (initial == 'included') { print('checked=\"checked\"'); } %>\n        <% if (presence == 'required') { print('disabled=\"disabled\"'); } %>\n    /> <%= name %></label>\n    <p class=\"description\"><%= description %></p>\n\n</div>"),
      subsections: _.template("<div class=\"subsections clearfix\">\n</div>")
    }
  });

  module.exports = AppView;

}).call(this);

},{"../util/shims":3}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9wdnJkd2IvamN1L2NuZy93ZWJhcHAvbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL3B2cmR3Yi9qY3UvY25nL3dlYmFwcC9jbGltYXNuZy9zcmMvanMvZmFrZV84OWNhODIwMi5qcyIsIi9Vc2Vycy9wdnJkd2IvamN1L2NuZy93ZWJhcHAvY2xpbWFzbmcvc3JjL2pzL3JlcG9ydHMvbWFpbi5qcyIsIi9Vc2Vycy9wdnJkd2IvamN1L2NuZy93ZWJhcHAvY2xpbWFzbmcvc3JjL2pzL3JlcG9ydHMvdXRpbC9zaGltcy5qcyIsIi9Vc2Vycy9wdnJkd2IvamN1L2NuZy93ZWJhcHAvY2xpbWFzbmcvc3JjL2pzL3JlcG9ydHMvdmlld3MvYXBwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXG5yZXF1aXJlKCcuL3JlcG9ydHMvbWFpbicpO1xuXG4iLCIoZnVuY3Rpb24oKSB7XG4gIHZhciBBcHBWaWV3O1xuXG4gIGlmICghd2luZG93LmNvbnNvbGUpIHtcbiAgICB3aW5kb3cuY29uc29sZSA9IHtcbiAgICAgIGxvZzogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB7fTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgQXBwVmlldyA9IHJlcXVpcmUoJy4vdmlld3MvYXBwJyk7XG5cbiAgJChmdW5jdGlvbigpIHtcbiAgICB2YXIgYXBwdmlldztcbiAgICBhcHB2aWV3ID0gbmV3IEFwcFZpZXcoKTtcbiAgICByZXR1cm4gYXBwdmlldy5yZW5kZXIoKTtcbiAgfSk7XG5cbn0pLmNhbGwodGhpcyk7XG4iLCIoZnVuY3Rpb24oKSB7XG4gIHZhciBfX2luZGV4T2YgPSBbXS5pbmRleE9mIHx8IGZ1bmN0aW9uKGl0ZW0pIHsgZm9yICh2YXIgaSA9IDAsIGwgPSB0aGlzLmxlbmd0aDsgaSA8IGw7IGkrKykgeyBpZiAoaSBpbiB0aGlzICYmIHRoaXNbaV0gPT09IGl0ZW0pIHJldHVybiBpOyB9IHJldHVybiAtMTsgfTtcblxuICBpZiAoIUFycmF5LnByb3RvdHlwZS5mb3JFYWNoKSB7XG4gICAgQXJyYXkucHJvdG90eXBlLmZvckVhY2ggPSBmdW5jdGlvbihmbiwgc2NvcGUpIHtcbiAgICAgIHZhciBpLCBfaSwgX3JlZiwgX3Jlc3VsdHM7XG4gICAgICBfcmVzdWx0cyA9IFtdO1xuICAgICAgZm9yIChpID0gX2kgPSAwLCBfcmVmID0gdGhpcy5sZW5ndGg7IDAgPD0gX3JlZiA/IF9pIDw9IF9yZWYgOiBfaSA+PSBfcmVmOyBpID0gMCA8PSBfcmVmID8gKytfaSA6IC0tX2kpIHtcbiAgICAgICAgX3Jlc3VsdHMucHVzaChfX2luZGV4T2YuY2FsbCh0aGlzLCBpKSA+PSAwID8gZm4uY2FsbChzY29wZSwgdGhpc1tpXSwgaSwgdGhpcykgOiB2b2lkIDApO1xuICAgICAgfVxuICAgICAgcmV0dXJuIF9yZXN1bHRzO1xuICAgIH07XG4gIH1cblxuICBpZiAoIUFycmF5LnByb3RvdHlwZS5pbmRleE9mKSB7XG4gICAgQXJyYXkucHJvdG90eXBlLmluZGV4T2YgPSBmdW5jdGlvbihuZWVkbGUpIHtcbiAgICAgIHZhciBpLCBfaSwgX3JlZjtcbiAgICAgIGZvciAoaSA9IF9pID0gMCwgX3JlZiA9IHRoaXMubGVuZ3RoOyAwIDw9IF9yZWYgPyBfaSA8PSBfcmVmIDogX2kgPj0gX3JlZjsgaSA9IDAgPD0gX3JlZiA/ICsrX2kgOiAtLV9pKSB7XG4gICAgICAgIGlmICh0aGlzW2ldID09PSBuZWVkbGUpIHtcbiAgICAgICAgICByZXR1cm4gaTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIC0xO1xuICAgIH07XG4gIH1cblxufSkuY2FsbCh0aGlzKTtcbiIsIihmdW5jdGlvbigpIHtcbiAgdmFyIEFwcFZpZXcsIGRlYnVnO1xuXG4gIHJlcXVpcmUoJy4uL3V0aWwvc2hpbXMnKTtcblxuXG4gIC8qIGpzaGludCAtVzA5MyAqL1xuXG5cbiAgLyoganNoaW50IC1XMDQxICovXG5cbiAgZGVidWcgPSBmdW5jdGlvbihpdGVtVG9Mb2csIGl0ZW1MZXZlbCkge1xuICAgIHZhciBsZXZlbHMsIG1lc3NhZ2VOdW0sIHRocmVzaG9sZCwgdGhyZXNob2xkTnVtO1xuICAgIGxldmVscyA9IFsndmVyeWRlYnVnJywgJ2RlYnVnJywgJ21lc3NhZ2UnLCAnd2FybmluZyddO1xuICAgIHRocmVzaG9sZCA9ICdtZXNzYWdlJztcbiAgICBpZiAoIWl0ZW1MZXZlbCkge1xuICAgICAgaXRlbUxldmVsID0gJ2RlYnVnJztcbiAgICB9XG4gICAgdGhyZXNob2xkTnVtID0gbGV2ZWxzLmluZGV4T2YodGhyZXNob2xkKTtcbiAgICBtZXNzYWdlTnVtID0gbGV2ZWxzLmluZGV4T2YoaXRlbUxldmVsKTtcbiAgICBpZiAodGhyZXNob2xkTnVtID4gbWVzc2FnZU51bSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoaXRlbVRvTG9nICsgJycgPT09IGl0ZW1Ub0xvZykge1xuICAgICAgcmV0dXJuIGNvbnNvbGUubG9nKFwiW1wiICsgaXRlbUxldmVsICsgXCJdIFwiICsgaXRlbVRvTG9nKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGNvbnNvbGUubG9nKGl0ZW1Ub0xvZyk7XG4gICAgfVxuICB9O1xuXG4gIEFwcFZpZXcgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XG4gICAgdGFnTmFtZTogJ2Zvcm0nLFxuICAgIGNsYXNzTmFtZTogJycsXG4gICAgaWQ6ICdyZXBvcnRmb3JtJyxcbiAgICBkYXRhVXJsOiBcIlwiICsgbG9jYXRpb24ucHJvdG9jb2wgKyBcIi8vXCIgKyBsb2NhdGlvbi5ob3N0ICsgXCIvZGF0YVwiLFxuICAgIHJhc3RlckFwaVVybDogXCJcIiArIGxvY2F0aW9uLnByb3RvY29sICsgXCIvL2xvY2FsaG9zdDoxMDYwMC9hcGkvcmFzdGVyLzEvd21zX2RhdGFfdXJsXCIsXG4gICAgdHJhY2tTcGxpdHRlcjogZmFsc2UsXG4gICAgdHJhY2tQZXJpb2Q6IDEwMCxcbiAgICBldmVudHM6IHtcbiAgICAgICdjaGFuZ2UgLnNlY3Rpb25zZWxlY3RvciBpbnB1dCc6ICd1cGRhdGVTZWN0aW9uU2VsZWN0aW9uJyxcbiAgICAgICdjaGFuZ2UgLnJlZ2lvbnNlbGVjdCBpbnB1dCc6ICd1cGRhdGVSZWdpb25TZWxlY3Rpb24nLFxuICAgICAgJ2NoYW5nZSAucmVnaW9uc2VsZWN0IHNlbGVjdCc6ICd1cGRhdGVSZWdpb25TZWxlY3Rpb24nLFxuICAgICAgJ2NoYW5nZSAueWVhcnNlbGVjdCBpbnB1dCc6ICd1cGRhdGVZZWFyU2VsZWN0aW9uJyxcbiAgICAgICdjbGljayAuZ2V0cmVwb3J0JzogJ2dldFJlcG9ydCdcbiAgICB9LFxuICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHJlZ0ZldGNoLCBzZWN0RmV0Y2gsIHllYXJGZXRjaDtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LmluaXRpYWxpemUnKTtcbiAgICAgIF8uYmluZEFsbC5hcHBseShfLCBbdGhpc10uY29uY2F0KF8uZnVuY3Rpb25zKHRoaXMpKSk7XG4gICAgICB0aGlzLmhhc2ggPSAnJztcbiAgICAgIHNlY3RGZXRjaCA9IHRoaXMuZmV0Y2hSZXBvcnRTZWN0aW9ucygpO1xuICAgICAgcmVnRmV0Y2ggPSB0aGlzLmZldGNoUmVnaW9ucygpO1xuICAgICAgeWVhckZldGNoID0gdGhpcy5mZXRjaFllYXJzKCk7XG4gICAgICAkLndoZW4oc2VjdEZldGNoLCByZWdGZXRjaCwgeWVhckZldGNoKS50aGVuKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgX3RoaXMuY2hlY2tIYXNoKCk7XG4gICAgICAgICAgcmV0dXJuIF90aGlzLnVwZGF0ZVN1bW1hcnkoKTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKTtcbiAgICAgIHJldHVybiAkKHdpbmRvdykub24oJ2hhc2hjaGFuZ2UnLCAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiBfdGhpcy5jaGVja0hhc2goKTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKTtcbiAgICB9LFxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5yZW5kZXInKTtcbiAgICAgIHRoaXMuJGVsLmFwcGVuZChBcHBWaWV3LnRlbXBsYXRlcy5sYXlvdXQoe30pKTtcbiAgICAgIHJldHVybiAkKCcjY29udGVudHdyYXAgLm1haW5jb250ZW50JykuYXBwZW5kKHRoaXMuJGVsKTtcbiAgICB9LFxuICAgIGNoZWNrSGFzaDogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgaGFzaCwgaGFzaERhdGEsIGtleSwgdmFsdWU7XG4gICAgICBoYXNoID0gd2luZG93LmxvY2F0aW9uLmhhc2g7XG4gICAgICBpZiAodGhpcy5oYXNoID09PSBoYXNoIHx8IGhhc2gubGVuZ3RoIDwgMikge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBoYXNoRGF0YSA9IHRoaXMuc3BsaXRIYXNoKGhhc2gpO1xuICAgICAgZm9yIChrZXkgaW4gaGFzaERhdGEpIHtcbiAgICAgICAgdmFsdWUgPSBoYXNoRGF0YVtrZXldO1xuICAgICAgICB0aGlzLmFwcGx5SGFzaEVsZW1lbnQoa2V5LCB2YWx1ZSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5oYXNoID0gd2luZG93LmxvY2F0aW9uLmhhc2g7XG4gICAgfSxcbiAgICBzcGxpdEhhc2g6IGZ1bmN0aW9uKGhhc2gpIHtcbiAgICAgIHZhciBoYXNoRGF0YSwgaGFzaExpc3QsIGhhc2hQYWlyLCBfZm4sIF9pLCBfbGVuO1xuICAgICAgaGFzaERhdGEgPSB7fTtcbiAgICAgIGhhc2hMaXN0ID0gaGFzaC5zdWJzdHJpbmcoMSkuc3BsaXQoJy8nKTtcbiAgICAgIF9mbiA9IChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oaGFzaFBhaXIpIHtcbiAgICAgICAgICB2YXIgcGFydHM7XG4gICAgICAgICAgcGFydHMgPSBoYXNoUGFpci5zcGxpdCgnPScpO1xuICAgICAgICAgIGlmIChwYXJ0cy5sZW5ndGggPT09IDIpIHtcbiAgICAgICAgICAgIHJldHVybiBoYXNoRGF0YVtwYXJ0c1swXV0gPSBwYXJ0c1sxXTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKTtcbiAgICAgIGZvciAoX2kgPSAwLCBfbGVuID0gaGFzaExpc3QubGVuZ3RoOyBfaSA8IF9sZW47IF9pKyspIHtcbiAgICAgICAgaGFzaFBhaXIgPSBoYXNoTGlzdFtfaV07XG4gICAgICAgIF9mbihoYXNoUGFpcik7XG4gICAgICB9XG4gICAgICByZXR1cm4gaGFzaERhdGE7XG4gICAgfSxcbiAgICBhcHBseUhhc2hFbGVtZW50OiBmdW5jdGlvbihlbGVtLCB2YWx1ZSkge1xuICAgICAgdmFyIHJlZ2lvbnR5cGU7XG4gICAgICBpZiAoZWxlbSA9PT0gJ3JlZ2lvbicpIHtcbiAgICAgICAgcmVnaW9udHlwZSA9IHZhbHVlLnNwbGl0KCdfJylbMF07XG4gICAgICAgIHRoaXMuJCgnaW5wdXRbdHlwZT1yYWRpb11bbmFtZT1yZWdpb250eXBlXVt2YWx1ZT1cIicgKyByZWdpb250eXBlICsgJ1wiXScpLmNsaWNrKCk7XG4gICAgICAgIHRoaXMuJCgnc2VsZWN0LnJlZ2lvbnNlbGVjdG9yIG9wdGlvblt2YWx1ZT1cIicgKyB2YWx1ZSArICdcIl0nKS5wYXJlbnQoKS52YWwodmFsdWUpLmNoYW5nZSgpO1xuICAgICAgfVxuICAgICAgaWYgKGVsZW0gPT09ICd5ZWFyJykge1xuICAgICAgICByZXR1cm4gdGhpcy4kKCdpbnB1dFt0eXBlPXJhZGlvXVtuYW1lPXllYXJdW3ZhbHVlPVwiJyArIHZhbHVlICsgJ1wiXScpLmNsaWNrKCk7XG4gICAgICB9XG4gICAgfSxcbiAgICBtYWtlSGFzaDogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgaGFzaEl0ZW1zLCBrZXksIG5ld0hhc2g7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5tYWtlSGFzaCcpO1xuICAgICAgaGFzaEl0ZW1zID0gdGhpcy5zcGxpdEhhc2god2luZG93LmxvY2F0aW9uLmhhc2gpO1xuICAgICAgaWYgKHRoaXMuc2VsZWN0ZWRZZWFyKSB7XG4gICAgICAgIGhhc2hJdGVtcy55ZWFyID0gdGhpcy5zZWxlY3RlZFllYXI7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5zZWxlY3RlZFJlZ2lvbiAmJiB0aGlzLnNlbGVjdGVkUmVnaW9uICE9PSAnJykge1xuICAgICAgICBoYXNoSXRlbXMucmVnaW9uID0gdGhpcy5zZWxlY3RlZFJlZ2lvbjtcbiAgICAgIH1cbiAgICAgIG5ld0hhc2ggPSAoKGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgX3Jlc3VsdHM7XG4gICAgICAgIF9yZXN1bHRzID0gW107XG4gICAgICAgIGZvciAoa2V5IGluIGhhc2hJdGVtcykge1xuICAgICAgICAgIF9yZXN1bHRzLnB1c2goa2V5ICsgJz0nICsgaGFzaEl0ZW1zW2tleV0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBfcmVzdWx0cztcbiAgICAgIH0pKCkpLmpvaW4oJy8nKTtcbiAgICAgIHJldHVybiBsb2NhdGlvbi5oYXNoID0gJy8nICsgbmV3SGFzaDtcbiAgICB9LFxuICAgIGdldFJlcG9ydDogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgZm9ybTtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LmdldFJlcG9ydCcpO1xuICAgICAgdGhpcy4kKCcjcmVwb3J0Zm9ybScpLnJlbW92ZSgpO1xuICAgICAgZm9ybSA9IFtdO1xuICAgICAgZm9ybS5wdXNoKCc8Zm9ybSBhY3Rpb249XCIvcmVnaW9ucmVwb3J0XCIgbWV0aG9kPVwiZ2V0XCIgaWQ9XCJyZXBvcnRmb3JtXCI+Jyk7XG4gICAgICBmb3JtLnB1c2goJzxpbnB1dCB0eXBlPVwiaGlkZGVuXCIgbmFtZT1cInllYXJcIiB2YWx1ZT1cIicgKyB0aGlzLnNlbGVjdGVkWWVhciArICdcIj4nKTtcbiAgICAgIGZvcm0ucHVzaCgnPGlucHV0IHR5cGU9XCJoaWRkZW5cIiBuYW1lPVwicmVnaW9udHlwZVwiIHZhbHVlPVwiJyArIHRoaXMuc2VsZWN0ZWRSZWdpb25UeXBlICsgJ1wiPicpO1xuICAgICAgZm9ybS5wdXNoKCc8aW5wdXQgdHlwZT1cImhpZGRlblwiIG5hbWU9XCJyZWdpb25cIiB2YWx1ZT1cIicgKyB0aGlzLnNlbGVjdGVkUmVnaW9uICsgJ1wiPicpO1xuICAgICAgZm9ybS5wdXNoKCc8aW5wdXQgdHlwZT1cImhpZGRlblwiIG5hbWU9XCJzZWN0aW9uc1wiIHZhbHVlPVwiJyArIHRoaXMuc2VsZWN0ZWRTZWN0aW9ucy5qb2luKCcgJykgKyAnXCI+Jyk7XG4gICAgICBmb3JtLnB1c2goJzwvZm9ybT4nKTtcbiAgICAgIHRoaXMuJGVsLmFwcGVuZChmb3JtLmpvaW4oJ1xcbicpKTtcbiAgICAgIHRoaXMuJCgnI3JlcG9ydGZvcm0nKS5zdWJtaXQoKTtcbiAgICAgIGlmIChnYSAmJiB0eXBlb2YgZ2EgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgcmV0dXJuIGdhKCdzZW5kJywge1xuICAgICAgICAgICdoaXRUeXBlJzogJ2V2ZW50JyxcbiAgICAgICAgICAnZXZlbnRDYXRlZ29yeSc6ICdyZXBvcnRkb3dubG9hZCcsXG4gICAgICAgICAgJ2V2ZW50QWN0aW9uJzogdGhpcy5zZWxlY3RlZFJlZ2lvblR5cGUsXG4gICAgICAgICAgJ2V2ZW50TGFiZWwnOiB0aGlzLnNlbGVjdGVkUmVnaW9uLFxuICAgICAgICAgICdldmVudFZhbHVlJzogcGFyc2VJbnQodGhpcy5zZWxlY3RlZFllYXIsIDEwKVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGZldGNoUmVwb3J0U2VjdGlvbnM6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGZldGNoO1xuICAgICAgZGVidWcoJ0FwcFZpZXcuZmV0Y2hSZXBvcnRTZWN0aW9ucycpO1xuICAgICAgZmV0Y2ggPSAkLmFqYXgodGhpcy5kYXRhVXJsICsgJy9yZXBvcnRzZWN0aW9ucycpO1xuICAgICAgZmV0Y2guZG9uZSgoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICB2YXIgc2VjdGlvbnNlbGVjdDtcbiAgICAgICAgICBfdGhpcy5wb3NzaWJsZVNlY3Rpb25zID0gZGF0YS5zZWN0aW9ucztcbiAgICAgICAgICBzZWN0aW9uc2VsZWN0ID0gX3RoaXMuJCgnLnNlY3Rpb25zZWxlY3QnKTtcbiAgICAgICAgICBzZWN0aW9uc2VsZWN0LmVtcHR5KCkucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcnKTtcbiAgICAgICAgICByZXR1cm4gX3RoaXMuYnVpbGRSZXBvcnRTZWN0aW9uTGlzdChfdGhpcy5wb3NzaWJsZVNlY3Rpb25zLCBzZWN0aW9uc2VsZWN0KTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKTtcbiAgICAgIHJldHVybiBmZXRjaC5wcm9taXNlKCk7XG4gICAgfSxcbiAgICBidWlsZFJlcG9ydFNlY3Rpb25MaXN0OiBmdW5jdGlvbihkYXRhLCB3cmFwcGVyKSB7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5idWlsZFJlcG9ydFNlY3Rpb25MaXN0Jyk7XG4gICAgICAkLmVhY2goZGF0YSwgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihpbmRleCwgaXRlbSkge1xuICAgICAgICAgIHZhciBzZWxlY3RvclJvdywgc3Vic2VjdGlvbnM7XG4gICAgICAgICAgc2VsZWN0b3JSb3cgPSAkKEFwcFZpZXcudGVtcGxhdGVzLnNlY3Rpb25TZWxlY3RvcihpdGVtKSk7XG4gICAgICAgICAgJCh3cmFwcGVyKS5hcHBlbmQoc2VsZWN0b3JSb3cpO1xuICAgICAgICAgIGlmIChpdGVtLnNlY3Rpb25zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHN1YnNlY3Rpb25zID0gJChBcHBWaWV3LnRlbXBsYXRlcy5zdWJzZWN0aW9ucygpKTtcbiAgICAgICAgICAgIF90aGlzLmJ1aWxkUmVwb3J0U2VjdGlvbkxpc3QoaXRlbS5zZWN0aW9ucywgc3Vic2VjdGlvbnMpO1xuICAgICAgICAgICAgcmV0dXJuICQoc2VsZWN0b3JSb3cpLmFkZENsYXNzKCdoYXNzdWJzZWN0aW9ucycpLmFwcGVuZChzdWJzZWN0aW9ucyk7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpO1xuICAgICAgcmV0dXJuIHRoaXMudXBkYXRlU3VtbWFyeSgpO1xuICAgIH0sXG4gICAgdXBkYXRlU2VjdGlvblNlbGVjdGlvbjogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LnVwZGF0ZVNlY3Rpb25TZWxlY3Rpb24nKTtcbiAgICAgIHJldHVybiB0aGlzLmhhbmRsZVNlY3Rpb25TZWxlY3Rpb24odGhpcy5wb3NzaWJsZVNlY3Rpb25zKTtcbiAgICB9LFxuICAgIGhhbmRsZVNlY3Rpb25TZWxlY3Rpb246IGZ1bmN0aW9uKHNlY3Rpb25MaXN0LCBwYXJlbnQpIHtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LmhhbmRsZVNlY3Rpb25TZWxlY3Rpb24nKTtcbiAgICAgICQuZWFjaChzZWN0aW9uTGlzdCwgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihpbmRleCwgaXRlbSkge1xuICAgICAgICAgIHZhciBzZWxlY3Rpb25Db250cm9sLCBzZWxlY3RvciwgX3JlZjtcbiAgICAgICAgICBzZWxlY3RvciA9IF90aGlzLiQoXCIjc2VjdGlvbi1cIiArIChpdGVtLmlkLnJlcGxhY2UoL1xcLi9nLCAnXFxcXC4nKSkpO1xuICAgICAgICAgIHNlbGVjdGlvbkNvbnRyb2wgPSBzZWxlY3Rvci5maW5kKCdpbnB1dCcpO1xuICAgICAgICAgIGlmIChzZWxlY3Rpb25Db250cm9sLnByb3AoJ2NoZWNrZWQnKSkge1xuICAgICAgICAgICAgc2VsZWN0b3IucmVtb3ZlQ2xhc3MoJ3Vuc2VsZWN0ZWQnKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2VsZWN0b3IuYWRkQ2xhc3MoJ3Vuc2VsZWN0ZWQnKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKCgoX3JlZiA9IGl0ZW0uc2VjdGlvbnMpICE9IG51bGwgPyBfcmVmLmxlbmd0aCA6IHZvaWQgMCkgPiAwKSB7XG4gICAgICAgICAgICByZXR1cm4gX3RoaXMuaGFuZGxlU2VjdGlvblNlbGVjdGlvbihpdGVtLnNlY3Rpb25zLCBpdGVtLmlkKTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKSk7XG4gICAgICByZXR1cm4gdGhpcy51cGRhdGVTdW1tYXJ5KCk7XG4gICAgfSxcbiAgICBmZXRjaFJlZ2lvbnM6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGZldGNoO1xuICAgICAgZGVidWcoJ0FwcFZpZXcuZmV0Y2hSZWdpb25zJyk7XG4gICAgICBmZXRjaCA9ICQuYWpheCh0aGlzLmRhdGFVcmwgKyAnL3JlcG9ydHJlZ2lvbnMnKTtcbiAgICAgIGZldGNoLmRvbmUoKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgcmV0dXJuIF90aGlzLmJ1aWxkUmVnaW9uTGlzdChkYXRhKTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKTtcbiAgICAgIHJldHVybiBmZXRjaC5wcm9taXNlKCk7XG4gICAgfSxcbiAgICBidWlsZFJlZ2lvbkxpc3Q6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIHZhciByZWdpb25zZWxlY3Q7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5idWlsZFJlZ2lvbkxpc3QnKTtcbiAgICAgIHRoaXMucmVnaW9ucyA9IGRhdGEucmVnaW9udHlwZXM7XG4gICAgICByZWdpb25zZWxlY3QgPSB0aGlzLiQoJy5yZWdpb25zZWxlY3QnKTtcbiAgICAgIHJlZ2lvbnNlbGVjdC5lbXB0eSgpLnJlbW92ZUNsYXNzKCdsb2FkaW5nJyk7XG4gICAgICAkLmVhY2godGhpcy5yZWdpb25zLCAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGluZGV4LCByZWdpb25UeXBlKSB7XG4gICAgICAgICAgdmFyIHJlZywgcmVnaW9uVHlwZVJvdztcbiAgICAgICAgICByZWdpb25UeXBlLm9wdGlvbkxpc3QgPSBbXG4gICAgICAgICAgICAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHZhciBfaSwgX2xlbiwgX3JlZiwgX3Jlc3VsdHM7XG4gICAgICAgICAgICAgIF9yZWYgPSByZWdpb25UeXBlLnJlZ2lvbnM7XG4gICAgICAgICAgICAgIF9yZXN1bHRzID0gW107XG4gICAgICAgICAgICAgIGZvciAoX2kgPSAwLCBfbGVuID0gX3JlZi5sZW5ndGg7IF9pIDwgX2xlbjsgX2krKykge1xuICAgICAgICAgICAgICAgIHJlZyA9IF9yZWZbX2ldO1xuICAgICAgICAgICAgICAgIF9yZXN1bHRzLnB1c2goQXBwVmlldy50ZW1wbGF0ZXMucmVnaW9uU2VsZWN0b3IocmVnKSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcmV0dXJuIF9yZXN1bHRzO1xuICAgICAgICAgICAgfSkoKVxuICAgICAgICAgIF0uam9pbihcIlxcblwiKTtcbiAgICAgICAgICByZWdpb25UeXBlUm93ID0gJChBcHBWaWV3LnRlbXBsYXRlcy5yZWdpb25UeXBlU2VsZWN0b3IocmVnaW9uVHlwZSkpO1xuICAgICAgICAgIHJldHVybiByZWdpb25zZWxlY3QuYXBwZW5kKHJlZ2lvblR5cGVSb3cpO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpO1xuICAgICAgcmV0dXJuIHRoaXMudXBkYXRlU3VtbWFyeSgpO1xuICAgIH0sXG4gICAgdXBkYXRlUmVnaW9uU2VsZWN0aW9uOiBmdW5jdGlvbihldmVudCkge1xuICAgICAgdmFyIHNlbGVjdGVkVHlwZTtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LnVwZGF0ZVJlZ2lvblNlbGVjdGlvbicpO1xuICAgICAgc2VsZWN0ZWRUeXBlID0gdGhpcy4kKCdbbmFtZT1yZWdpb250eXBlXTpjaGVja2VkJykudmFsKCk7XG4gICAgICAkLmVhY2godGhpcy5yZWdpb25zLCAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGluZGV4LCByZWdpb25UeXBlKSB7XG4gICAgICAgICAgdmFyIHNlbGVjdG9yO1xuICAgICAgICAgIHNlbGVjdG9yID0gX3RoaXMuJChcIiNyZWdpb250eXBlLVwiICsgcmVnaW9uVHlwZS5pZCk7XG4gICAgICAgICAgaWYgKHNlbGVjdGVkVHlwZSA9PT0gcmVnaW9uVHlwZS5pZCkge1xuICAgICAgICAgICAgc2VsZWN0b3IuYWRkQ2xhc3MoJ3R5cGVzZWxlY3RlZCcpO1xuICAgICAgICAgICAgX3RoaXMuc2VsZWN0ZWRSZWdpb25UeXBlID0gcmVnaW9uVHlwZS5pZDtcbiAgICAgICAgICAgIF90aGlzLnNlbGVjdGVkUmVnaW9uID0gJChzZWxlY3Rvci5maW5kKCdzZWxlY3QnKSkudmFsKCk7XG4gICAgICAgICAgICBpZiAoX3RoaXMuc2VsZWN0ZWRSZWdpb24gPT09ICcnKSB7XG4gICAgICAgICAgICAgIHJldHVybiBzZWxlY3Rvci5yZW1vdmVDbGFzcygncmVnaW9uc2VsZWN0ZWQnKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHNlbGVjdG9yLmFkZENsYXNzKCdyZWdpb25zZWxlY3RlZCcpO1xuICAgICAgICAgICAgICByZXR1cm4gX3RoaXMuc2VsZWN0ZWRSZWdpb25JbmZvID0gXy5maW5kKHJlZ2lvblR5cGUucmVnaW9ucywgZnVuY3Rpb24ocmVnaW9uKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlZ2lvbi5pZCA9PT0gX3RoaXMuc2VsZWN0ZWRSZWdpb247XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gc2VsZWN0b3IucmVtb3ZlQ2xhc3MoJ3R5cGVzZWxlY3RlZCcpO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKTtcbiAgICAgIHJldHVybiB0aGlzLnVwZGF0ZVN1bW1hcnkoKTtcbiAgICB9LFxuICAgIGZldGNoWWVhcnM6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGZldGNoO1xuICAgICAgZGVidWcoJ0FwcFZpZXcuZmV0Y2hZZWFycycpO1xuICAgICAgZmV0Y2ggPSAkLkRlZmVycmVkKCk7XG4gICAgICBmZXRjaC5kb25lKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgIHJldHVybiBfdGhpcy5idWlsZFllYXJMaXN0KGRhdGEpO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpO1xuICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGZldGNoLnJlc29sdmUoe1xuICAgICAgICAgIHllYXJzOiBbJzIwMjUnLCAnMjAzNScsICcyMDQ1JywgJzIwNTUnLCAnMjA2NScsICcyMDc1JywgJzIwODUnXVxuICAgICAgICB9KTtcbiAgICAgIH0sIDUwMCArICg1MDAgKiBNYXRoLnJhbmRvbSgpKSk7XG4gICAgICByZXR1cm4gZmV0Y2gucHJvbWlzZSgpO1xuICAgIH0sXG4gICAgYnVpbGRZZWFyTGlzdDogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgdmFyIHllYXJzZWxlY3Q7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5idWlsZFllYXJMaXN0Jyk7XG4gICAgICB0aGlzLnllYXJzID0gZGF0YS55ZWFycztcbiAgICAgIHllYXJzZWxlY3QgPSB0aGlzLiQoJy55ZWFyc2VsZWN0Jyk7XG4gICAgICB5ZWFyc2VsZWN0LmVtcHR5KCkucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcnKTtcbiAgICAgICQuZWFjaCh0aGlzLnllYXJzLCAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGluZGV4LCB5ZWFyKSB7XG4gICAgICAgICAgcmV0dXJuIHllYXJzZWxlY3QuYXBwZW5kKEFwcFZpZXcudGVtcGxhdGVzLnllYXJTZWxlY3Rvcih7XG4gICAgICAgICAgICB5ZWFyOiB5ZWFyXG4gICAgICAgICAgfSkpO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpO1xuICAgICAgcmV0dXJuIHRoaXMudXBkYXRlU3VtbWFyeSgpO1xuICAgIH0sXG4gICAgdXBkYXRlWWVhclNlbGVjdGlvbjogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LnVwZGF0ZVllYXJTZWxlY3Rpb24nKTtcbiAgICAgIHRoaXMuc2VsZWN0ZWRZZWFyID0gdGhpcy4kKCdbbmFtZT15ZWFyXTpjaGVja2VkJykudmFsKCk7XG4gICAgICAkLmVhY2godGhpcy55ZWFycywgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihpbmRleCwgeWVhcikge1xuICAgICAgICAgIHZhciBzZWxlY3RvcjtcbiAgICAgICAgICBzZWxlY3RvciA9IF90aGlzLiQoXCIjeWVhci1cIiArIHllYXIpO1xuICAgICAgICAgIGlmIChfdGhpcy5zZWxlY3RlZFllYXIgPT09IHllYXIpIHtcbiAgICAgICAgICAgIHJldHVybiBzZWxlY3Rvci5hZGRDbGFzcygneWVhcnNlbGVjdGVkJyk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBzZWxlY3Rvci5yZW1vdmVDbGFzcygneWVhcnNlbGVjdGVkJyk7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpO1xuICAgICAgcmV0dXJuIHRoaXMudXBkYXRlU3VtbWFyeSgpO1xuICAgIH0sXG4gICAgc2VjdGlvbklkOiBmdW5jdGlvbihzZWN0aW9uRG9tKSB7XG4gICAgICByZXR1cm4gJChzZWN0aW9uRG9tKS5maW5kKCdpbnB1dCcpLmF0dHIoJ3ZhbHVlJyk7XG4gICAgfSxcbiAgICBzZWN0aW9uTmFtZTogZnVuY3Rpb24oc2VjdGlvbkRvbSkge1xuICAgICAgcmV0dXJuIHRoaXMuc2VjdGlvbkluZm8oc2VjdGlvbkRvbSkubmFtZTtcbiAgICB9LFxuICAgIHNlY3Rpb25JbmZvOiBmdW5jdGlvbihzZWN0aW9uRG9tKSB7XG4gICAgICB2YXIgaW5mbywgcGFyZW50SWRzLCBwYXJlbnRhZ2U7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5zZWN0aW9uSW5mbycpO1xuICAgICAgcGFyZW50YWdlID0gJChzZWN0aW9uRG9tKS5wYXJlbnRzKCcuc2VjdGlvbnNlbGVjdG9yJyk7XG4gICAgICBwYXJlbnRJZHMgPSBwYXJlbnRhZ2UubWFwKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oaSwgZWxlbSkge1xuICAgICAgICAgIHJldHVybiBfdGhpcy5zZWN0aW9uSWQoZWxlbSk7XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKSkuZ2V0KCkucmV2ZXJzZSgpO1xuICAgICAgcGFyZW50SWRzLnB1c2godGhpcy5zZWN0aW9uSWQoc2VjdGlvbkRvbSkpO1xuICAgICAgdGhpcy5zZWxlY3RlZFNlY3Rpb25zLnB1c2godGhpcy5zZWN0aW9uSWQoc2VjdGlvbkRvbSkpO1xuICAgICAgaW5mbyA9IHtcbiAgICAgICAgc2VjdGlvbnM6IHRoaXMucG9zc2libGVTZWN0aW9uc1xuICAgICAgfTtcbiAgICAgIHBhcmVudElkcy5mb3JFYWNoKGZ1bmN0aW9uKGlkKSB7XG4gICAgICAgIHJldHVybiBpbmZvID0gXy5maWx0ZXIoaW5mby5zZWN0aW9ucywgZnVuY3Rpb24oc2VjdGlvbikge1xuICAgICAgICAgIHJldHVybiBzZWN0aW9uLmlkID09PSBpZDtcbiAgICAgICAgfSlbMF07XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBpbmZvO1xuICAgIH0sXG4gICAgc3ViU2VjdGlvbkxpc3Q6IGZ1bmN0aW9uKHNlY3Rpb25Eb20pIHtcbiAgICAgIHZhciBsaXN0LCBzdWJzZWN0aW9ucztcbiAgICAgIGRlYnVnKCdBcHBWaWV3LnNlY3Rpb25MaXN0Jyk7XG4gICAgICBsaXN0ID0gW107XG4gICAgICBzdWJzZWN0aW9ucyA9ICQoc2VjdGlvbkRvbSkuY2hpbGRyZW4oJy5zdWJzZWN0aW9ucycpO1xuICAgICAgc3Vic2VjdGlvbnMuY2hpbGRyZW4oJy5zZWN0aW9uc2VsZWN0b3InKS5ub3QoJy51bnNlbGVjdGVkJykuZWFjaCgoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGksIGVsZW0pIHtcbiAgICAgICAgICB2YXIgbmFtZSwgc3VicztcbiAgICAgICAgICBuYW1lID0gX3RoaXMuc2VjdGlvbk5hbWUoZWxlbSk7XG4gICAgICAgICAgc3VicyA9IF90aGlzLnN1YlNlY3Rpb25MaXN0KGVsZW0pO1xuICAgICAgICAgIGlmIChzdWJzICE9PSAnJykge1xuICAgICAgICAgICAgbmFtZSA9IG5hbWUgKyAnICgnICsgc3VicyArICcpJztcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGxpc3QucHVzaChuYW1lKTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKTtcbiAgICAgIHJldHVybiBsaXN0LmpvaW4oJywgJyk7XG4gICAgfSxcbiAgICB1cGRhdGVTdW1tYXJ5OiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBjb250ZW50LCBjb250ZW50TGlzdCwgc2VsZWN0ZWRTZWN0aW9ucywgc3VtbWFyeSwgX3JlZjtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LnVwZGF0ZVN1bW1hcnknKTtcbiAgICAgIHNlbGVjdGVkU2VjdGlvbnMgPSB0aGlzLiQoJy5zZWN0aW9uc2VsZWN0ID4gLnNlY3Rpb25zZWxlY3RvcicpLm5vdCgnLnVuc2VsZWN0ZWQnKTtcbiAgICAgIHRoaXMuc2VsZWN0ZWRTZWN0aW9ucyA9IFtdO1xuICAgICAgY29udGVudExpc3QgPSBbXTtcbiAgICAgIHNlbGVjdGVkU2VjdGlvbnMuZWFjaCgoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGluZGV4LCBzZWN0aW9uKSB7XG4gICAgICAgICAgdmFyIGluZm8sIHN1Ykxpc3Q7XG4gICAgICAgICAgaW5mbyA9IF90aGlzLnNlY3Rpb25OYW1lKHNlY3Rpb24pO1xuICAgICAgICAgIHN1Ykxpc3QgPSBfdGhpcy5zdWJTZWN0aW9uTGlzdChzZWN0aW9uKTtcbiAgICAgICAgICBpZiAoc3ViTGlzdCAhPT0gJycpIHtcbiAgICAgICAgICAgIGluZm8gPSBpbmZvICsgJzogJyArIHN1Ykxpc3QudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGNvbnRlbnRMaXN0LnB1c2goaW5mbyArICcuJyk7XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKSk7XG4gICAgICBjb250ZW50ID0gJyc7XG4gICAgICBpZiAoY29udGVudExpc3QubGVuZ3RoID4gMCkge1xuICAgICAgICBjb250ZW50ID0gJzxsaT4nICsgY29udGVudExpc3Quam9pbignPC9saT48bGk+JykgKyAnPC9saT4nO1xuICAgICAgfVxuICAgICAgc3VtbWFyeSA9IHtcbiAgICAgICAgcmVnaW9uTmFtZTogKF9yZWYgPSB0aGlzLnNlbGVjdGVkUmVnaW9uSW5mbykgIT0gbnVsbCA/IF9yZWYubmFtZSA6IHZvaWQgMCxcbiAgICAgICAgeWVhcjogdGhpcy5zZWxlY3RlZFllYXIsXG4gICAgICAgIGNvbnRlbnQ6IGNvbnRlbnRcbiAgICAgIH07XG4gICAgICB0aGlzLiQoJy5yZXZpZXdibG9jaycpLmh0bWwoQXBwVmlldy50ZW1wbGF0ZXMucmV2aWV3QmxvY2soc3VtbWFyeSkpO1xuICAgICAgdGhpcy4kKCcucmV2aWV3YmxvY2snKS50b2dnbGVDbGFzcygncmVnaW9uc2VsZWN0ZWQnLCB0aGlzLnNlbGVjdGVkUmVnaW9uSW5mbyAhPT0gdm9pZCAwKTtcbiAgICAgIHRoaXMuJCgnLnJldmlld2Jsb2NrJykudG9nZ2xlQ2xhc3MoJ3llYXJzZWxlY3RlZCcsIHRoaXMuc2VsZWN0ZWRZZWFyICE9PSB2b2lkIDApO1xuICAgICAgcmV0dXJuIHRoaXMubWFrZUhhc2goKTtcbiAgICB9XG4gIH0sIHtcbiAgICB0ZW1wbGF0ZXM6IHtcbiAgICAgIGxheW91dDogXy50ZW1wbGF0ZShcIjxkaXYgY2xhc3M9XFxcImZvcm1ibG9ja1xcXCI+XFxuICAgIDxoMT5SZXBvcnQgb248L2gxPlxcbiAgICA8ZGl2IGNsYXNzPVxcXCJsb2FkaW5nIHNlbGVjdCByZWdpb25zZWxlY3RcXFwiPmxvYWRpbmcgYXZhaWxhYmxlIHJlZ2lvbnMuLjwvZGl2PlxcblxcbiAgICA8aDE+SW4gdGhlIHllYXI8L2gxPlxcbiAgICA8ZGl2IGNsYXNzPVxcXCJsb2FkaW5nIHNlbGVjdCB5ZWFyc2VsZWN0XFxcIj5sb2FkaW5nIGF2YWlsYWJsZSB5ZWFycy4uPC9kaXY+XFxuXFxuICAgIDxoMT5JbmNsdWRpbmc8L2gxPlxcbiAgICA8ZGl2IGNsYXNzPVxcXCJsb2FkaW5nIHNlbGVjdCBzZWN0aW9uc2VsZWN0XFxcIj5sb2FkaW5nIGF2YWlsYWJsZSBzZWN0aW9ucy4uPC9kaXY+XFxuPC9kaXY+XFxuPGRpdiBjbGFzcz1cXFwicmV2aWV3YmxvY2tcXFwiPjwvZGl2PlwiKSxcbiAgICAgIHJldmlld0Jsb2NrOiBfLnRlbXBsYXRlKFwiPGgxPlNlbGVjdGVkIFJlcG9ydDwvaDE+XFxuPHAgY2xhc3M9XFxcImNvdmVyYWdlXFxcIj5Db3ZlcnNcXG4gICAgPCUgaWYgKHJlZ2lvbk5hbWUpIHsgJT48JT0gcmVnaW9uTmFtZSAlPjwlIH0gZWxzZSB7ICU+PGVtPih1bnNwZWNpZmllZCByZWdpb24pPC9lbT48JSB9ICU+XFxuICAgIGluXFxuICAgIDwlIGlmICh5ZWFyKSB7ICU+PCU9IHllYXIgJT4uPCUgfSBlbHNlIHsgJT48ZW0+KHVuc3BlY2lmaWVkIHllYXIpPC9lbT4uPCUgfSAlPlxcbjwvcD5cXG48dWwgY2xhc3M9XFxcImNvbnRlbnRzXFxcIj48JT0gY29udGVudCAlPjwvdWw+XFxuPGJ1dHRvbiB0eXBlPVxcXCJidXR0b25cXFwiIGNsYXNzPVxcXCJnZXRyZXBvcnRcXFwiPmRvd25sb2FkIHJlcG9ydDwvYnV0dG9uPlwiKSxcbiAgICAgIHJldmlld0NvbnRlbnRJdGVtOiBfLnRlbXBsYXRlKFwiPGxpPml0ZW08L2xpPlwiKSxcbiAgICAgIHJlZ2lvblR5cGVTZWxlY3RvcjogXy50ZW1wbGF0ZShcIjxkaXYgY2xhc3M9XFxcInJlZ2lvbnR5cGVzZWxlY3RvclxcXCIgaWQ9XFxcInJlZ2lvbnR5cGUtPCU9IGlkICU+XFxcIj5cXG4gICAgPGxhYmVsIGNsYXNzPVxcXCJuYW1lXFxcIj48aW5wdXRcXG4gICAgICAgIGNsYXNzPVxcXCJyZWdpb250eXBlXFxcIlxcbiAgICAgICAgbmFtZT1cXFwicmVnaW9udHlwZVxcXCJcXG4gICAgICAgIHR5cGU9XFxcInJhZGlvXFxcIlxcbiAgICAgICAgdmFsdWU9XFxcIjwlPSBpZCAlPlxcXCJcXG4gICAgLz4gPCU9IG5hbWUgJT5cXG4gICAgPC9sYWJlbD5cXG4gICAgPGRpdiBjbGFzcz1cXFwicmVnaW9uc2VsZWN0b3J3cmFwcGVyXFxcIj48c2VsZWN0IGNsYXNzPVxcXCJyZWdpb25zZWxlY3RvclxcXCI+XFxuICAgICAgICA8b3B0aW9uIHZhbHVlPVxcXCJcXFwiIGRpc2FibGVkPVxcXCJkaXNhYmxlZFxcXCIgc2VsZWN0ZWQ9XFxcInNlbGVjdGVkXFxcIj5zZWxlY3QgYSByZWdpb24maGVsbGlwOzwvb3B0aW9uPlxcbiAgICAgICAgPCU9IG9wdGlvbkxpc3QgJT5cXG4gICAgPC9zZWxlY3Q+PC9kaXY+XFxuPC9kaXY+XCIpLFxuICAgICAgcmVnaW9uU2VsZWN0b3I6IF8udGVtcGxhdGUoXCI8b3B0aW9uIHZhbHVlPVxcXCI8JT0gaWQgJT5cXFwiPjwlPSBuYW1lICU+PC9vcHRpb24+XCIpLFxuICAgICAgeWVhclNlbGVjdG9yOiBfLnRlbXBsYXRlKFwiPGRpdiBjbGFzcz1cXFwieWVhcnJvd1xcXCIgaWQ9XFxcInllYXItPCU9IHllYXIgJT5cXFwiPlxcbiAgICA8bGFiZWwgY2xhc3M9XFxcIm5hbWVcXFwiPjxpbnB1dFxcbiAgICAgICAgY2xhc3M9XFxcInllYXJcXFwiXFxuICAgICAgICBuYW1lPVxcXCJ5ZWFyXFxcIlxcbiAgICAgICAgdHlwZT1cXFwicmFkaW9cXFwiXFxuICAgICAgICB2YWx1ZT1cXFwiPCU9IHllYXIgJT5cXFwiXFxuICAgIC8+IDwlPSB5ZWFyICU+PC9sYWJlbD5cXG48L2Rpdj5cIiksXG4gICAgICBzZWN0aW9uU2VsZWN0b3I6IF8udGVtcGxhdGUoXCI8ZGl2IGNsYXNzPVxcXCJzZWN0aW9uc2VsZWN0b3I8JSBpZiAoaW5pdGlhbCAhPSAnaW5jbHVkZWQnKSB7IHByaW50KCcgdW5zZWxlY3RlZCcpOyB9ICU+XFxcIiBpZD1cXFwic2VjdGlvbi08JT0gaWQgJT5cXFwiPlxcbiAgICA8bGFiZWwgY2xhc3M9XFxcIm5hbWVcXFwiXFxuICAgICAgICA8JSBpZiAocHJlc2VuY2UgPT0gJ3JlcXVpcmVkJykgeyBwcmludCgndGl0bGU9XFxcIlRoaXMgc2VjdGlvbiBpcyByZXF1aXJlZFxcXCInKTsgfSAlPlxcbiAgICA+PGlucHV0XFxuICAgICAgICB0eXBlPVxcXCJjaGVja2JveFxcXCJcXG4gICAgICAgIHZhbHVlPVxcXCI8JT0gaWQgJT5cXFwiXFxuICAgICAgICA8JSBpZiAoaW5pdGlhbCA9PSAnaW5jbHVkZWQnKSB7IHByaW50KCdjaGVja2VkPVxcXCJjaGVja2VkXFxcIicpOyB9ICU+XFxuICAgICAgICA8JSBpZiAocHJlc2VuY2UgPT0gJ3JlcXVpcmVkJykgeyBwcmludCgnZGlzYWJsZWQ9XFxcImRpc2FibGVkXFxcIicpOyB9ICU+XFxuICAgIC8+IDwlPSBuYW1lICU+PC9sYWJlbD5cXG4gICAgPHAgY2xhc3M9XFxcImRlc2NyaXB0aW9uXFxcIj48JT0gZGVzY3JpcHRpb24gJT48L3A+XFxuXFxuPC9kaXY+XCIpLFxuICAgICAgc3Vic2VjdGlvbnM6IF8udGVtcGxhdGUoXCI8ZGl2IGNsYXNzPVxcXCJzdWJzZWN0aW9ucyBjbGVhcmZpeFxcXCI+XFxuPC9kaXY+XCIpXG4gICAgfVxuICB9KTtcblxuICBtb2R1bGUuZXhwb3J0cyA9IEFwcFZpZXc7XG5cbn0pLmNhbGwodGhpcyk7XG4iXX0=
