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
      }, 50 + (50 * Math.random()));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9wdnJkd2IvcHJvamVjdHMvY2xpbWFzLWdsb2JhbC93ZWJhcHAvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi9Vc2Vycy9wdnJkd2IvcHJvamVjdHMvY2xpbWFzLWdsb2JhbC93ZWJhcHAvY2xpbWFzbmcvc3JjL2pzL2Zha2VfM2I3YjdlZC5qcyIsIi9Vc2Vycy9wdnJkd2IvcHJvamVjdHMvY2xpbWFzLWdsb2JhbC93ZWJhcHAvY2xpbWFzbmcvc3JjL2pzL3JlcG9ydHMvbWFpbi5qcyIsIi9Vc2Vycy9wdnJkd2IvcHJvamVjdHMvY2xpbWFzLWdsb2JhbC93ZWJhcHAvY2xpbWFzbmcvc3JjL2pzL3JlcG9ydHMvdXRpbC9zaGltcy5qcyIsIi9Vc2Vycy9wdnJkd2IvcHJvamVjdHMvY2xpbWFzLWdsb2JhbC93ZWJhcHAvY2xpbWFzbmcvc3JjL2pzL3JlcG9ydHMvdmlld3MvYXBwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXG5yZXF1aXJlKCcuL3JlcG9ydHMvbWFpbicpO1xuXG4iLCIoZnVuY3Rpb24oKSB7XG4gIHZhciBBcHBWaWV3O1xuXG4gIGlmICghd2luZG93LmNvbnNvbGUpIHtcbiAgICB3aW5kb3cuY29uc29sZSA9IHtcbiAgICAgIGxvZzogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB7fTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgQXBwVmlldyA9IHJlcXVpcmUoJy4vdmlld3MvYXBwJyk7XG5cbiAgJChmdW5jdGlvbigpIHtcbiAgICB2YXIgYXBwdmlldztcbiAgICBhcHB2aWV3ID0gbmV3IEFwcFZpZXcoKTtcbiAgICByZXR1cm4gYXBwdmlldy5yZW5kZXIoKTtcbiAgfSk7XG5cbn0pLmNhbGwodGhpcyk7XG4iLCIoZnVuY3Rpb24oKSB7XG4gIHZhciBfX2luZGV4T2YgPSBbXS5pbmRleE9mIHx8IGZ1bmN0aW9uKGl0ZW0pIHsgZm9yICh2YXIgaSA9IDAsIGwgPSB0aGlzLmxlbmd0aDsgaSA8IGw7IGkrKykgeyBpZiAoaSBpbiB0aGlzICYmIHRoaXNbaV0gPT09IGl0ZW0pIHJldHVybiBpOyB9IHJldHVybiAtMTsgfTtcblxuICBpZiAoIUFycmF5LnByb3RvdHlwZS5mb3JFYWNoKSB7XG4gICAgQXJyYXkucHJvdG90eXBlLmZvckVhY2ggPSBmdW5jdGlvbihmbiwgc2NvcGUpIHtcbiAgICAgIHZhciBpLCBfaSwgX3JlZiwgX3Jlc3VsdHM7XG4gICAgICBfcmVzdWx0cyA9IFtdO1xuICAgICAgZm9yIChpID0gX2kgPSAwLCBfcmVmID0gdGhpcy5sZW5ndGg7IDAgPD0gX3JlZiA/IF9pIDw9IF9yZWYgOiBfaSA+PSBfcmVmOyBpID0gMCA8PSBfcmVmID8gKytfaSA6IC0tX2kpIHtcbiAgICAgICAgX3Jlc3VsdHMucHVzaChfX2luZGV4T2YuY2FsbCh0aGlzLCBpKSA+PSAwID8gZm4uY2FsbChzY29wZSwgdGhpc1tpXSwgaSwgdGhpcykgOiB2b2lkIDApO1xuICAgICAgfVxuICAgICAgcmV0dXJuIF9yZXN1bHRzO1xuICAgIH07XG4gIH1cblxuICBpZiAoIUFycmF5LnByb3RvdHlwZS5pbmRleE9mKSB7XG4gICAgQXJyYXkucHJvdG90eXBlLmluZGV4T2YgPSBmdW5jdGlvbihuZWVkbGUpIHtcbiAgICAgIHZhciBpLCBfaSwgX3JlZjtcbiAgICAgIGZvciAoaSA9IF9pID0gMCwgX3JlZiA9IHRoaXMubGVuZ3RoOyAwIDw9IF9yZWYgPyBfaSA8PSBfcmVmIDogX2kgPj0gX3JlZjsgaSA9IDAgPD0gX3JlZiA/ICsrX2kgOiAtLV9pKSB7XG4gICAgICAgIGlmICh0aGlzW2ldID09PSBuZWVkbGUpIHtcbiAgICAgICAgICByZXR1cm4gaTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIC0xO1xuICAgIH07XG4gIH1cblxufSkuY2FsbCh0aGlzKTtcbiIsIihmdW5jdGlvbigpIHtcbiAgdmFyIEFwcFZpZXcsIGRlYnVnO1xuXG4gIHJlcXVpcmUoJy4uL3V0aWwvc2hpbXMnKTtcblxuXG4gIC8qIGpzaGludCAtVzA5MyAqL1xuXG5cbiAgLyoganNoaW50IC1XMDQxICovXG5cbiAgZGVidWcgPSBmdW5jdGlvbihpdGVtVG9Mb2csIGl0ZW1MZXZlbCkge1xuICAgIHZhciBsZXZlbHMsIG1lc3NhZ2VOdW0sIHRocmVzaG9sZCwgdGhyZXNob2xkTnVtO1xuICAgIGxldmVscyA9IFsndmVyeWRlYnVnJywgJ2RlYnVnJywgJ21lc3NhZ2UnLCAnd2FybmluZyddO1xuICAgIHRocmVzaG9sZCA9ICdtZXNzYWdlJztcbiAgICBpZiAoIWl0ZW1MZXZlbCkge1xuICAgICAgaXRlbUxldmVsID0gJ2RlYnVnJztcbiAgICB9XG4gICAgdGhyZXNob2xkTnVtID0gbGV2ZWxzLmluZGV4T2YodGhyZXNob2xkKTtcbiAgICBtZXNzYWdlTnVtID0gbGV2ZWxzLmluZGV4T2YoaXRlbUxldmVsKTtcbiAgICBpZiAodGhyZXNob2xkTnVtID4gbWVzc2FnZU51bSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoaXRlbVRvTG9nICsgJycgPT09IGl0ZW1Ub0xvZykge1xuICAgICAgcmV0dXJuIGNvbnNvbGUubG9nKFwiW1wiICsgaXRlbUxldmVsICsgXCJdIFwiICsgaXRlbVRvTG9nKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGNvbnNvbGUubG9nKGl0ZW1Ub0xvZyk7XG4gICAgfVxuICB9O1xuXG4gIEFwcFZpZXcgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XG4gICAgdGFnTmFtZTogJ2Zvcm0nLFxuICAgIGNsYXNzTmFtZTogJycsXG4gICAgaWQ6ICdyZXBvcnRmb3JtJyxcbiAgICBkYXRhVXJsOiBcIlwiICsgbG9jYXRpb24ucHJvdG9jb2wgKyBcIi8vXCIgKyBsb2NhdGlvbi5ob3N0ICsgXCIvZGF0YVwiLFxuICAgIHJhc3RlckFwaVVybDogXCJcIiArIGxvY2F0aW9uLnByb3RvY29sICsgXCIvL2xvY2FsaG9zdDoxMDYwMC9hcGkvcmFzdGVyLzEvd21zX2RhdGFfdXJsXCIsXG4gICAgdHJhY2tTcGxpdHRlcjogZmFsc2UsXG4gICAgdHJhY2tQZXJpb2Q6IDEwMCxcbiAgICBldmVudHM6IHtcbiAgICAgICdjaGFuZ2UgLnNlY3Rpb25zZWxlY3RvciBpbnB1dCc6ICd1cGRhdGVTZWN0aW9uU2VsZWN0aW9uJyxcbiAgICAgICdjaGFuZ2UgLnJlZ2lvbnNlbGVjdCBpbnB1dCc6ICd1cGRhdGVSZWdpb25TZWxlY3Rpb24nLFxuICAgICAgJ2NoYW5nZSAucmVnaW9uc2VsZWN0IHNlbGVjdCc6ICd1cGRhdGVSZWdpb25TZWxlY3Rpb24nLFxuICAgICAgJ2NoYW5nZSAueWVhcnNlbGVjdCBpbnB1dCc6ICd1cGRhdGVZZWFyU2VsZWN0aW9uJyxcbiAgICAgICdjbGljayAuZ2V0cmVwb3J0JzogJ2dldFJlcG9ydCdcbiAgICB9LFxuICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHJlZ0ZldGNoLCBzZWN0RmV0Y2gsIHllYXJGZXRjaDtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LmluaXRpYWxpemUnKTtcbiAgICAgIF8uYmluZEFsbC5hcHBseShfLCBbdGhpc10uY29uY2F0KF8uZnVuY3Rpb25zKHRoaXMpKSk7XG4gICAgICB0aGlzLmhhc2ggPSAnJztcbiAgICAgIHNlY3RGZXRjaCA9IHRoaXMuZmV0Y2hSZXBvcnRTZWN0aW9ucygpO1xuICAgICAgcmVnRmV0Y2ggPSB0aGlzLmZldGNoUmVnaW9ucygpO1xuICAgICAgeWVhckZldGNoID0gdGhpcy5mZXRjaFllYXJzKCk7XG4gICAgICAkLndoZW4oc2VjdEZldGNoLCByZWdGZXRjaCwgeWVhckZldGNoKS50aGVuKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgX3RoaXMuY2hlY2tIYXNoKCk7XG4gICAgICAgICAgcmV0dXJuIF90aGlzLnVwZGF0ZVN1bW1hcnkoKTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKTtcbiAgICAgIHJldHVybiAkKHdpbmRvdykub24oJ2hhc2hjaGFuZ2UnLCAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiBfdGhpcy5jaGVja0hhc2goKTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKTtcbiAgICB9LFxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5yZW5kZXInKTtcbiAgICAgIHRoaXMuJGVsLmFwcGVuZChBcHBWaWV3LnRlbXBsYXRlcy5sYXlvdXQoe30pKTtcbiAgICAgIHJldHVybiAkKCcjY29udGVudHdyYXAgLm1haW5jb250ZW50JykuYXBwZW5kKHRoaXMuJGVsKTtcbiAgICB9LFxuICAgIGNoZWNrSGFzaDogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgaGFzaCwgaGFzaERhdGEsIGtleSwgdmFsdWU7XG4gICAgICBoYXNoID0gd2luZG93LmxvY2F0aW9uLmhhc2g7XG4gICAgICBpZiAodGhpcy5oYXNoID09PSBoYXNoIHx8IGhhc2gubGVuZ3RoIDwgMikge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBoYXNoRGF0YSA9IHRoaXMuc3BsaXRIYXNoKGhhc2gpO1xuICAgICAgZm9yIChrZXkgaW4gaGFzaERhdGEpIHtcbiAgICAgICAgdmFsdWUgPSBoYXNoRGF0YVtrZXldO1xuICAgICAgICB0aGlzLmFwcGx5SGFzaEVsZW1lbnQoa2V5LCB2YWx1ZSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5oYXNoID0gd2luZG93LmxvY2F0aW9uLmhhc2g7XG4gICAgfSxcbiAgICBzcGxpdEhhc2g6IGZ1bmN0aW9uKGhhc2gpIHtcbiAgICAgIHZhciBoYXNoRGF0YSwgaGFzaExpc3QsIGhhc2hQYWlyLCBfZm4sIF9pLCBfbGVuO1xuICAgICAgaGFzaERhdGEgPSB7fTtcbiAgICAgIGhhc2hMaXN0ID0gaGFzaC5zdWJzdHJpbmcoMSkuc3BsaXQoJy8nKTtcbiAgICAgIF9mbiA9IChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oaGFzaFBhaXIpIHtcbiAgICAgICAgICB2YXIgcGFydHM7XG4gICAgICAgICAgcGFydHMgPSBoYXNoUGFpci5zcGxpdCgnPScpO1xuICAgICAgICAgIGlmIChwYXJ0cy5sZW5ndGggPT09IDIpIHtcbiAgICAgICAgICAgIHJldHVybiBoYXNoRGF0YVtwYXJ0c1swXV0gPSBwYXJ0c1sxXTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKTtcbiAgICAgIGZvciAoX2kgPSAwLCBfbGVuID0gaGFzaExpc3QubGVuZ3RoOyBfaSA8IF9sZW47IF9pKyspIHtcbiAgICAgICAgaGFzaFBhaXIgPSBoYXNoTGlzdFtfaV07XG4gICAgICAgIF9mbihoYXNoUGFpcik7XG4gICAgICB9XG4gICAgICByZXR1cm4gaGFzaERhdGE7XG4gICAgfSxcbiAgICBhcHBseUhhc2hFbGVtZW50OiBmdW5jdGlvbihlbGVtLCB2YWx1ZSkge1xuICAgICAgdmFyIHJlZ2lvbnR5cGU7XG4gICAgICBpZiAoZWxlbSA9PT0gJ3JlZ2lvbicpIHtcbiAgICAgICAgcmVnaW9udHlwZSA9IHZhbHVlLnNwbGl0KCdfJylbMF07XG4gICAgICAgIHRoaXMuJCgnaW5wdXRbdHlwZT1yYWRpb11bbmFtZT1yZWdpb250eXBlXVt2YWx1ZT1cIicgKyByZWdpb250eXBlICsgJ1wiXScpLmNsaWNrKCk7XG4gICAgICAgIHRoaXMuJCgnc2VsZWN0LnJlZ2lvbnNlbGVjdG9yIG9wdGlvblt2YWx1ZT1cIicgKyB2YWx1ZSArICdcIl0nKS5wYXJlbnQoKS52YWwodmFsdWUpLmNoYW5nZSgpO1xuICAgICAgfVxuICAgICAgaWYgKGVsZW0gPT09ICd5ZWFyJykge1xuICAgICAgICByZXR1cm4gdGhpcy4kKCdpbnB1dFt0eXBlPXJhZGlvXVtuYW1lPXllYXJdW3ZhbHVlPVwiJyArIHZhbHVlICsgJ1wiXScpLmNsaWNrKCk7XG4gICAgICB9XG4gICAgfSxcbiAgICBtYWtlSGFzaDogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgaGFzaEl0ZW1zLCBrZXksIG5ld0hhc2g7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5tYWtlSGFzaCcpO1xuICAgICAgaGFzaEl0ZW1zID0gdGhpcy5zcGxpdEhhc2god2luZG93LmxvY2F0aW9uLmhhc2gpO1xuICAgICAgaWYgKHRoaXMuc2VsZWN0ZWRZZWFyKSB7XG4gICAgICAgIGhhc2hJdGVtcy55ZWFyID0gdGhpcy5zZWxlY3RlZFllYXI7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5zZWxlY3RlZFJlZ2lvbiAmJiB0aGlzLnNlbGVjdGVkUmVnaW9uICE9PSAnJykge1xuICAgICAgICBoYXNoSXRlbXMucmVnaW9uID0gdGhpcy5zZWxlY3RlZFJlZ2lvbjtcbiAgICAgIH1cbiAgICAgIG5ld0hhc2ggPSAoKGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgX3Jlc3VsdHM7XG4gICAgICAgIF9yZXN1bHRzID0gW107XG4gICAgICAgIGZvciAoa2V5IGluIGhhc2hJdGVtcykge1xuICAgICAgICAgIF9yZXN1bHRzLnB1c2goa2V5ICsgJz0nICsgaGFzaEl0ZW1zW2tleV0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBfcmVzdWx0cztcbiAgICAgIH0pKCkpLmpvaW4oJy8nKTtcbiAgICAgIHJldHVybiBsb2NhdGlvbi5oYXNoID0gJy8nICsgbmV3SGFzaDtcbiAgICB9LFxuICAgIGdldFJlcG9ydDogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgZm9ybTtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LmdldFJlcG9ydCcpO1xuICAgICAgdGhpcy4kKCcjcmVwb3J0Zm9ybScpLnJlbW92ZSgpO1xuICAgICAgZm9ybSA9IFtdO1xuICAgICAgZm9ybS5wdXNoKCc8Zm9ybSBhY3Rpb249XCIvcmVnaW9ucmVwb3J0XCIgbWV0aG9kPVwiZ2V0XCIgaWQ9XCJyZXBvcnRmb3JtXCI+Jyk7XG4gICAgICBmb3JtLnB1c2goJzxpbnB1dCB0eXBlPVwiaGlkZGVuXCIgbmFtZT1cInllYXJcIiB2YWx1ZT1cIicgKyB0aGlzLnNlbGVjdGVkWWVhciArICdcIj4nKTtcbiAgICAgIGZvcm0ucHVzaCgnPGlucHV0IHR5cGU9XCJoaWRkZW5cIiBuYW1lPVwicmVnaW9udHlwZVwiIHZhbHVlPVwiJyArIHRoaXMuc2VsZWN0ZWRSZWdpb25UeXBlICsgJ1wiPicpO1xuICAgICAgZm9ybS5wdXNoKCc8aW5wdXQgdHlwZT1cImhpZGRlblwiIG5hbWU9XCJyZWdpb25cIiB2YWx1ZT1cIicgKyB0aGlzLnNlbGVjdGVkUmVnaW9uICsgJ1wiPicpO1xuICAgICAgZm9ybS5wdXNoKCc8aW5wdXQgdHlwZT1cImhpZGRlblwiIG5hbWU9XCJzZWN0aW9uc1wiIHZhbHVlPVwiJyArIHRoaXMuc2VsZWN0ZWRTZWN0aW9ucy5qb2luKCcgJykgKyAnXCI+Jyk7XG4gICAgICBmb3JtLnB1c2goJzwvZm9ybT4nKTtcbiAgICAgIHRoaXMuJGVsLmFwcGVuZChmb3JtLmpvaW4oJ1xcbicpKTtcbiAgICAgIHRoaXMuJCgnI3JlcG9ydGZvcm0nKS5zdWJtaXQoKTtcbiAgICAgIGlmIChnYSAmJiB0eXBlb2YgZ2EgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgcmV0dXJuIGdhKCdzZW5kJywge1xuICAgICAgICAgICdoaXRUeXBlJzogJ2V2ZW50JyxcbiAgICAgICAgICAnZXZlbnRDYXRlZ29yeSc6ICdyZXBvcnRkb3dubG9hZCcsXG4gICAgICAgICAgJ2V2ZW50QWN0aW9uJzogdGhpcy5zZWxlY3RlZFJlZ2lvblR5cGUsXG4gICAgICAgICAgJ2V2ZW50TGFiZWwnOiB0aGlzLnNlbGVjdGVkUmVnaW9uLFxuICAgICAgICAgICdldmVudFZhbHVlJzogcGFyc2VJbnQodGhpcy5zZWxlY3RlZFllYXIsIDEwKVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGZldGNoUmVwb3J0U2VjdGlvbnM6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGZldGNoO1xuICAgICAgZGVidWcoJ0FwcFZpZXcuZmV0Y2hSZXBvcnRTZWN0aW9ucycpO1xuICAgICAgZmV0Y2ggPSAkLmFqYXgodGhpcy5kYXRhVXJsICsgJy9yZXBvcnRzZWN0aW9ucycpO1xuICAgICAgZmV0Y2guZG9uZSgoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICB2YXIgc2VjdGlvbnNlbGVjdDtcbiAgICAgICAgICBfdGhpcy5wb3NzaWJsZVNlY3Rpb25zID0gZGF0YS5zZWN0aW9ucztcbiAgICAgICAgICBzZWN0aW9uc2VsZWN0ID0gX3RoaXMuJCgnLnNlY3Rpb25zZWxlY3QnKTtcbiAgICAgICAgICBzZWN0aW9uc2VsZWN0LmVtcHR5KCkucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcnKTtcbiAgICAgICAgICByZXR1cm4gX3RoaXMuYnVpbGRSZXBvcnRTZWN0aW9uTGlzdChfdGhpcy5wb3NzaWJsZVNlY3Rpb25zLCBzZWN0aW9uc2VsZWN0KTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKTtcbiAgICAgIHJldHVybiBmZXRjaC5wcm9taXNlKCk7XG4gICAgfSxcbiAgICBidWlsZFJlcG9ydFNlY3Rpb25MaXN0OiBmdW5jdGlvbihkYXRhLCB3cmFwcGVyKSB7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5idWlsZFJlcG9ydFNlY3Rpb25MaXN0Jyk7XG4gICAgICAkLmVhY2goZGF0YSwgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihpbmRleCwgaXRlbSkge1xuICAgICAgICAgIHZhciBzZWxlY3RvclJvdywgc3Vic2VjdGlvbnM7XG4gICAgICAgICAgc2VsZWN0b3JSb3cgPSAkKEFwcFZpZXcudGVtcGxhdGVzLnNlY3Rpb25TZWxlY3RvcihpdGVtKSk7XG4gICAgICAgICAgJCh3cmFwcGVyKS5hcHBlbmQoc2VsZWN0b3JSb3cpO1xuICAgICAgICAgIGlmIChpdGVtLnNlY3Rpb25zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHN1YnNlY3Rpb25zID0gJChBcHBWaWV3LnRlbXBsYXRlcy5zdWJzZWN0aW9ucygpKTtcbiAgICAgICAgICAgIF90aGlzLmJ1aWxkUmVwb3J0U2VjdGlvbkxpc3QoaXRlbS5zZWN0aW9ucywgc3Vic2VjdGlvbnMpO1xuICAgICAgICAgICAgcmV0dXJuICQoc2VsZWN0b3JSb3cpLmFkZENsYXNzKCdoYXNzdWJzZWN0aW9ucycpLmFwcGVuZChzdWJzZWN0aW9ucyk7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpO1xuICAgICAgcmV0dXJuIHRoaXMudXBkYXRlU3VtbWFyeSgpO1xuICAgIH0sXG4gICAgdXBkYXRlU2VjdGlvblNlbGVjdGlvbjogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LnVwZGF0ZVNlY3Rpb25TZWxlY3Rpb24nKTtcbiAgICAgIHJldHVybiB0aGlzLmhhbmRsZVNlY3Rpb25TZWxlY3Rpb24odGhpcy5wb3NzaWJsZVNlY3Rpb25zKTtcbiAgICB9LFxuICAgIGhhbmRsZVNlY3Rpb25TZWxlY3Rpb246IGZ1bmN0aW9uKHNlY3Rpb25MaXN0LCBwYXJlbnQpIHtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LmhhbmRsZVNlY3Rpb25TZWxlY3Rpb24nKTtcbiAgICAgICQuZWFjaChzZWN0aW9uTGlzdCwgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihpbmRleCwgaXRlbSkge1xuICAgICAgICAgIHZhciBzZWxlY3Rpb25Db250cm9sLCBzZWxlY3RvciwgX3JlZjtcbiAgICAgICAgICBzZWxlY3RvciA9IF90aGlzLiQoXCIjc2VjdGlvbi1cIiArIChpdGVtLmlkLnJlcGxhY2UoL1xcLi9nLCAnXFxcXC4nKSkpO1xuICAgICAgICAgIHNlbGVjdGlvbkNvbnRyb2wgPSBzZWxlY3Rvci5maW5kKCdpbnB1dCcpO1xuICAgICAgICAgIGlmIChzZWxlY3Rpb25Db250cm9sLnByb3AoJ2NoZWNrZWQnKSkge1xuICAgICAgICAgICAgc2VsZWN0b3IucmVtb3ZlQ2xhc3MoJ3Vuc2VsZWN0ZWQnKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2VsZWN0b3IuYWRkQ2xhc3MoJ3Vuc2VsZWN0ZWQnKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKCgoX3JlZiA9IGl0ZW0uc2VjdGlvbnMpICE9IG51bGwgPyBfcmVmLmxlbmd0aCA6IHZvaWQgMCkgPiAwKSB7XG4gICAgICAgICAgICByZXR1cm4gX3RoaXMuaGFuZGxlU2VjdGlvblNlbGVjdGlvbihpdGVtLnNlY3Rpb25zLCBpdGVtLmlkKTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKSk7XG4gICAgICByZXR1cm4gdGhpcy51cGRhdGVTdW1tYXJ5KCk7XG4gICAgfSxcbiAgICBmZXRjaFJlZ2lvbnM6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGZldGNoO1xuICAgICAgZGVidWcoJ0FwcFZpZXcuZmV0Y2hSZWdpb25zJyk7XG4gICAgICBmZXRjaCA9ICQuYWpheCh0aGlzLmRhdGFVcmwgKyAnL3JlcG9ydHJlZ2lvbnMnKTtcbiAgICAgIGZldGNoLmRvbmUoKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgcmV0dXJuIF90aGlzLmJ1aWxkUmVnaW9uTGlzdChkYXRhKTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKTtcbiAgICAgIHJldHVybiBmZXRjaC5wcm9taXNlKCk7XG4gICAgfSxcbiAgICBidWlsZFJlZ2lvbkxpc3Q6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIHZhciByZWdpb25zZWxlY3Q7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5idWlsZFJlZ2lvbkxpc3QnKTtcbiAgICAgIHRoaXMucmVnaW9ucyA9IGRhdGEucmVnaW9udHlwZXM7XG4gICAgICByZWdpb25zZWxlY3QgPSB0aGlzLiQoJy5yZWdpb25zZWxlY3QnKTtcbiAgICAgIHJlZ2lvbnNlbGVjdC5lbXB0eSgpLnJlbW92ZUNsYXNzKCdsb2FkaW5nJyk7XG4gICAgICAkLmVhY2godGhpcy5yZWdpb25zLCAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGluZGV4LCByZWdpb25UeXBlKSB7XG4gICAgICAgICAgdmFyIHJlZywgcmVnaW9uVHlwZVJvdztcbiAgICAgICAgICByZWdpb25UeXBlLm9wdGlvbkxpc3QgPSBbXG4gICAgICAgICAgICAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHZhciBfaSwgX2xlbiwgX3JlZiwgX3Jlc3VsdHM7XG4gICAgICAgICAgICAgIF9yZWYgPSByZWdpb25UeXBlLnJlZ2lvbnM7XG4gICAgICAgICAgICAgIF9yZXN1bHRzID0gW107XG4gICAgICAgICAgICAgIGZvciAoX2kgPSAwLCBfbGVuID0gX3JlZi5sZW5ndGg7IF9pIDwgX2xlbjsgX2krKykge1xuICAgICAgICAgICAgICAgIHJlZyA9IF9yZWZbX2ldO1xuICAgICAgICAgICAgICAgIF9yZXN1bHRzLnB1c2goQXBwVmlldy50ZW1wbGF0ZXMucmVnaW9uU2VsZWN0b3IocmVnKSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcmV0dXJuIF9yZXN1bHRzO1xuICAgICAgICAgICAgfSkoKVxuICAgICAgICAgIF0uam9pbihcIlxcblwiKTtcbiAgICAgICAgICByZWdpb25UeXBlUm93ID0gJChBcHBWaWV3LnRlbXBsYXRlcy5yZWdpb25UeXBlU2VsZWN0b3IocmVnaW9uVHlwZSkpO1xuICAgICAgICAgIHJldHVybiByZWdpb25zZWxlY3QuYXBwZW5kKHJlZ2lvblR5cGVSb3cpO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpO1xuICAgICAgcmV0dXJuIHRoaXMudXBkYXRlU3VtbWFyeSgpO1xuICAgIH0sXG4gICAgdXBkYXRlUmVnaW9uU2VsZWN0aW9uOiBmdW5jdGlvbihldmVudCkge1xuICAgICAgdmFyIHNlbGVjdGVkVHlwZTtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LnVwZGF0ZVJlZ2lvblNlbGVjdGlvbicpO1xuICAgICAgc2VsZWN0ZWRUeXBlID0gdGhpcy4kKCdbbmFtZT1yZWdpb250eXBlXTpjaGVja2VkJykudmFsKCk7XG4gICAgICAkLmVhY2godGhpcy5yZWdpb25zLCAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGluZGV4LCByZWdpb25UeXBlKSB7XG4gICAgICAgICAgdmFyIHNlbGVjdG9yO1xuICAgICAgICAgIHNlbGVjdG9yID0gX3RoaXMuJChcIiNyZWdpb250eXBlLVwiICsgcmVnaW9uVHlwZS5pZCk7XG4gICAgICAgICAgaWYgKHNlbGVjdGVkVHlwZSA9PT0gcmVnaW9uVHlwZS5pZCkge1xuICAgICAgICAgICAgc2VsZWN0b3IuYWRkQ2xhc3MoJ3R5cGVzZWxlY3RlZCcpO1xuICAgICAgICAgICAgX3RoaXMuc2VsZWN0ZWRSZWdpb25UeXBlID0gcmVnaW9uVHlwZS5pZDtcbiAgICAgICAgICAgIF90aGlzLnNlbGVjdGVkUmVnaW9uID0gJChzZWxlY3Rvci5maW5kKCdzZWxlY3QnKSkudmFsKCk7XG4gICAgICAgICAgICBpZiAoX3RoaXMuc2VsZWN0ZWRSZWdpb24gPT09ICcnKSB7XG4gICAgICAgICAgICAgIHJldHVybiBzZWxlY3Rvci5yZW1vdmVDbGFzcygncmVnaW9uc2VsZWN0ZWQnKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHNlbGVjdG9yLmFkZENsYXNzKCdyZWdpb25zZWxlY3RlZCcpO1xuICAgICAgICAgICAgICByZXR1cm4gX3RoaXMuc2VsZWN0ZWRSZWdpb25JbmZvID0gXy5maW5kKHJlZ2lvblR5cGUucmVnaW9ucywgZnVuY3Rpb24ocmVnaW9uKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlZ2lvbi5pZCA9PT0gX3RoaXMuc2VsZWN0ZWRSZWdpb247XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gc2VsZWN0b3IucmVtb3ZlQ2xhc3MoJ3R5cGVzZWxlY3RlZCcpO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKTtcbiAgICAgIHJldHVybiB0aGlzLnVwZGF0ZVN1bW1hcnkoKTtcbiAgICB9LFxuICAgIGZldGNoWWVhcnM6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGZldGNoO1xuICAgICAgZGVidWcoJ0FwcFZpZXcuZmV0Y2hZZWFycycpO1xuICAgICAgZmV0Y2ggPSAkLkRlZmVycmVkKCk7XG4gICAgICBmZXRjaC5kb25lKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgIHJldHVybiBfdGhpcy5idWlsZFllYXJMaXN0KGRhdGEpO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpO1xuICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGZldGNoLnJlc29sdmUoe1xuICAgICAgICAgIHllYXJzOiBbJzIwMjUnLCAnMjAzNScsICcyMDQ1JywgJzIwNTUnLCAnMjA2NScsICcyMDc1JywgJzIwODUnXVxuICAgICAgICB9KTtcbiAgICAgIH0sIDUwICsgKDUwICogTWF0aC5yYW5kb20oKSkpO1xuICAgICAgcmV0dXJuIGZldGNoLnByb21pc2UoKTtcbiAgICB9LFxuICAgIGJ1aWxkWWVhckxpc3Q6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIHZhciB5ZWFyc2VsZWN0O1xuICAgICAgZGVidWcoJ0FwcFZpZXcuYnVpbGRZZWFyTGlzdCcpO1xuICAgICAgdGhpcy55ZWFycyA9IGRhdGEueWVhcnM7XG4gICAgICB5ZWFyc2VsZWN0ID0gdGhpcy4kKCcueWVhcnNlbGVjdCcpO1xuICAgICAgeWVhcnNlbGVjdC5lbXB0eSgpLnJlbW92ZUNsYXNzKCdsb2FkaW5nJyk7XG4gICAgICAkLmVhY2godGhpcy55ZWFycywgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihpbmRleCwgeWVhcikge1xuICAgICAgICAgIHJldHVybiB5ZWFyc2VsZWN0LmFwcGVuZChBcHBWaWV3LnRlbXBsYXRlcy55ZWFyU2VsZWN0b3Ioe1xuICAgICAgICAgICAgeWVhcjogeWVhclxuICAgICAgICAgIH0pKTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKTtcbiAgICAgIHJldHVybiB0aGlzLnVwZGF0ZVN1bW1hcnkoKTtcbiAgICB9LFxuICAgIHVwZGF0ZVllYXJTZWxlY3Rpb246IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICBkZWJ1ZygnQXBwVmlldy51cGRhdGVZZWFyU2VsZWN0aW9uJyk7XG4gICAgICB0aGlzLnNlbGVjdGVkWWVhciA9IHRoaXMuJCgnW25hbWU9eWVhcl06Y2hlY2tlZCcpLnZhbCgpO1xuICAgICAgJC5lYWNoKHRoaXMueWVhcnMsIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oaW5kZXgsIHllYXIpIHtcbiAgICAgICAgICB2YXIgc2VsZWN0b3I7XG4gICAgICAgICAgc2VsZWN0b3IgPSBfdGhpcy4kKFwiI3llYXItXCIgKyB5ZWFyKTtcbiAgICAgICAgICBpZiAoX3RoaXMuc2VsZWN0ZWRZZWFyID09PSB5ZWFyKSB7XG4gICAgICAgICAgICByZXR1cm4gc2VsZWN0b3IuYWRkQ2xhc3MoJ3llYXJzZWxlY3RlZCcpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gc2VsZWN0b3IucmVtb3ZlQ2xhc3MoJ3llYXJzZWxlY3RlZCcpO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKTtcbiAgICAgIHJldHVybiB0aGlzLnVwZGF0ZVN1bW1hcnkoKTtcbiAgICB9LFxuICAgIHNlY3Rpb25JZDogZnVuY3Rpb24oc2VjdGlvbkRvbSkge1xuICAgICAgcmV0dXJuICQoc2VjdGlvbkRvbSkuZmluZCgnaW5wdXQnKS5hdHRyKCd2YWx1ZScpO1xuICAgIH0sXG4gICAgc2VjdGlvbk5hbWU6IGZ1bmN0aW9uKHNlY3Rpb25Eb20pIHtcbiAgICAgIHJldHVybiB0aGlzLnNlY3Rpb25JbmZvKHNlY3Rpb25Eb20pLm5hbWU7XG4gICAgfSxcbiAgICBzZWN0aW9uSW5mbzogZnVuY3Rpb24oc2VjdGlvbkRvbSkge1xuICAgICAgdmFyIGluZm8sIHBhcmVudElkcywgcGFyZW50YWdlO1xuICAgICAgZGVidWcoJ0FwcFZpZXcuc2VjdGlvbkluZm8nKTtcbiAgICAgIHBhcmVudGFnZSA9ICQoc2VjdGlvbkRvbSkucGFyZW50cygnLnNlY3Rpb25zZWxlY3RvcicpO1xuICAgICAgcGFyZW50SWRzID0gcGFyZW50YWdlLm1hcCgoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGksIGVsZW0pIHtcbiAgICAgICAgICByZXR1cm4gX3RoaXMuc2VjdGlvbklkKGVsZW0pO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpLmdldCgpLnJldmVyc2UoKTtcbiAgICAgIHBhcmVudElkcy5wdXNoKHRoaXMuc2VjdGlvbklkKHNlY3Rpb25Eb20pKTtcbiAgICAgIHRoaXMuc2VsZWN0ZWRTZWN0aW9ucy5wdXNoKHRoaXMuc2VjdGlvbklkKHNlY3Rpb25Eb20pKTtcbiAgICAgIGluZm8gPSB7XG4gICAgICAgIHNlY3Rpb25zOiB0aGlzLnBvc3NpYmxlU2VjdGlvbnNcbiAgICAgIH07XG4gICAgICBwYXJlbnRJZHMuZm9yRWFjaChmdW5jdGlvbihpZCkge1xuICAgICAgICByZXR1cm4gaW5mbyA9IF8uZmlsdGVyKGluZm8uc2VjdGlvbnMsIGZ1bmN0aW9uKHNlY3Rpb24pIHtcbiAgICAgICAgICByZXR1cm4gc2VjdGlvbi5pZCA9PT0gaWQ7XG4gICAgICAgIH0pWzBdO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gaW5mbztcbiAgICB9LFxuICAgIHN1YlNlY3Rpb25MaXN0OiBmdW5jdGlvbihzZWN0aW9uRG9tKSB7XG4gICAgICB2YXIgbGlzdCwgc3Vic2VjdGlvbnM7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5zZWN0aW9uTGlzdCcpO1xuICAgICAgbGlzdCA9IFtdO1xuICAgICAgc3Vic2VjdGlvbnMgPSAkKHNlY3Rpb25Eb20pLmNoaWxkcmVuKCcuc3Vic2VjdGlvbnMnKTtcbiAgICAgIHN1YnNlY3Rpb25zLmNoaWxkcmVuKCcuc2VjdGlvbnNlbGVjdG9yJykubm90KCcudW5zZWxlY3RlZCcpLmVhY2goKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihpLCBlbGVtKSB7XG4gICAgICAgICAgdmFyIG5hbWUsIHN1YnM7XG4gICAgICAgICAgbmFtZSA9IF90aGlzLnNlY3Rpb25OYW1lKGVsZW0pO1xuICAgICAgICAgIHN1YnMgPSBfdGhpcy5zdWJTZWN0aW9uTGlzdChlbGVtKTtcbiAgICAgICAgICBpZiAoc3VicyAhPT0gJycpIHtcbiAgICAgICAgICAgIG5hbWUgPSBuYW1lICsgJyAoJyArIHN1YnMgKyAnKSc7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBsaXN0LnB1c2gobmFtZSk7XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKSk7XG4gICAgICByZXR1cm4gbGlzdC5qb2luKCcsICcpO1xuICAgIH0sXG4gICAgdXBkYXRlU3VtbWFyeTogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgY29udGVudCwgY29udGVudExpc3QsIHNlbGVjdGVkU2VjdGlvbnMsIHN1bW1hcnksIF9yZWY7XG4gICAgICBkZWJ1ZygnQXBwVmlldy51cGRhdGVTdW1tYXJ5Jyk7XG4gICAgICBzZWxlY3RlZFNlY3Rpb25zID0gdGhpcy4kKCcuc2VjdGlvbnNlbGVjdCA+IC5zZWN0aW9uc2VsZWN0b3InKS5ub3QoJy51bnNlbGVjdGVkJyk7XG4gICAgICB0aGlzLnNlbGVjdGVkU2VjdGlvbnMgPSBbXTtcbiAgICAgIGNvbnRlbnRMaXN0ID0gW107XG4gICAgICBzZWxlY3RlZFNlY3Rpb25zLmVhY2goKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihpbmRleCwgc2VjdGlvbikge1xuICAgICAgICAgIHZhciBpbmZvLCBzdWJMaXN0O1xuICAgICAgICAgIGluZm8gPSBfdGhpcy5zZWN0aW9uTmFtZShzZWN0aW9uKTtcbiAgICAgICAgICBzdWJMaXN0ID0gX3RoaXMuc3ViU2VjdGlvbkxpc3Qoc2VjdGlvbik7XG4gICAgICAgICAgaWYgKHN1Ykxpc3QgIT09ICcnKSB7XG4gICAgICAgICAgICBpbmZvID0gaW5mbyArICc6ICcgKyBzdWJMaXN0LnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBjb250ZW50TGlzdC5wdXNoKGluZm8gKyAnLicpO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpO1xuICAgICAgY29udGVudCA9ICcnO1xuICAgICAgaWYgKGNvbnRlbnRMaXN0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29udGVudCA9ICc8bGk+JyArIGNvbnRlbnRMaXN0LmpvaW4oJzwvbGk+PGxpPicpICsgJzwvbGk+JztcbiAgICAgIH1cbiAgICAgIHN1bW1hcnkgPSB7XG4gICAgICAgIHJlZ2lvbk5hbWU6IChfcmVmID0gdGhpcy5zZWxlY3RlZFJlZ2lvbkluZm8pICE9IG51bGwgPyBfcmVmLm5hbWUgOiB2b2lkIDAsXG4gICAgICAgIHllYXI6IHRoaXMuc2VsZWN0ZWRZZWFyLFxuICAgICAgICBjb250ZW50OiBjb250ZW50XG4gICAgICB9O1xuICAgICAgdGhpcy4kKCcucmV2aWV3YmxvY2snKS5odG1sKEFwcFZpZXcudGVtcGxhdGVzLnJldmlld0Jsb2NrKHN1bW1hcnkpKTtcbiAgICAgIHRoaXMuJCgnLnJldmlld2Jsb2NrJykudG9nZ2xlQ2xhc3MoJ3JlZ2lvbnNlbGVjdGVkJywgdGhpcy5zZWxlY3RlZFJlZ2lvbkluZm8gIT09IHZvaWQgMCk7XG4gICAgICB0aGlzLiQoJy5yZXZpZXdibG9jaycpLnRvZ2dsZUNsYXNzKCd5ZWFyc2VsZWN0ZWQnLCB0aGlzLnNlbGVjdGVkWWVhciAhPT0gdm9pZCAwKTtcbiAgICAgIHJldHVybiB0aGlzLm1ha2VIYXNoKCk7XG4gICAgfVxuICB9LCB7XG4gICAgdGVtcGxhdGVzOiB7XG4gICAgICBsYXlvdXQ6IF8udGVtcGxhdGUoXCI8ZGl2IGNsYXNzPVxcXCJmb3JtYmxvY2tcXFwiPlxcbiAgICA8aDE+UmVwb3J0IG9uPC9oMT5cXG4gICAgPGRpdiBjbGFzcz1cXFwibG9hZGluZyBzZWxlY3QgcmVnaW9uc2VsZWN0XFxcIj5sb2FkaW5nIGF2YWlsYWJsZSByZWdpb25zLi48L2Rpdj5cXG5cXG4gICAgPGgxPkluIHRoZSB5ZWFyPC9oMT5cXG4gICAgPGRpdiBjbGFzcz1cXFwibG9hZGluZyBzZWxlY3QgeWVhcnNlbGVjdFxcXCI+bG9hZGluZyBhdmFpbGFibGUgeWVhcnMuLjwvZGl2PlxcblxcbiAgICA8aDE+SW5jbHVkaW5nPC9oMT5cXG4gICAgPGRpdiBjbGFzcz1cXFwibG9hZGluZyBzZWxlY3Qgc2VjdGlvbnNlbGVjdFxcXCI+bG9hZGluZyBhdmFpbGFibGUgc2VjdGlvbnMuLjwvZGl2PlxcbjwvZGl2PlxcbjxkaXYgY2xhc3M9XFxcInJldmlld2Jsb2NrXFxcIj48L2Rpdj5cIiksXG4gICAgICByZXZpZXdCbG9jazogXy50ZW1wbGF0ZShcIjxoMT5TZWxlY3RlZCBSZXBvcnQ8L2gxPlxcbjxwIGNsYXNzPVxcXCJjb3ZlcmFnZVxcXCI+Q292ZXJzXFxuICAgIDwlIGlmIChyZWdpb25OYW1lKSB7ICU+PCU9IHJlZ2lvbk5hbWUgJT48JSB9IGVsc2UgeyAlPjxlbT4odW5zcGVjaWZpZWQgcmVnaW9uKTwvZW0+PCUgfSAlPlxcbiAgICBpblxcbiAgICA8JSBpZiAoeWVhcikgeyAlPjwlPSB5ZWFyICU+LjwlIH0gZWxzZSB7ICU+PGVtPih1bnNwZWNpZmllZCB5ZWFyKTwvZW0+LjwlIH0gJT5cXG48L3A+XFxuPHVsIGNsYXNzPVxcXCJjb250ZW50c1xcXCI+PCU9IGNvbnRlbnQgJT48L3VsPlxcbjxidXR0b24gdHlwZT1cXFwiYnV0dG9uXFxcIiBjbGFzcz1cXFwiZ2V0cmVwb3J0XFxcIj5kb3dubG9hZCByZXBvcnQ8L2J1dHRvbj5cIiksXG4gICAgICByZXZpZXdDb250ZW50SXRlbTogXy50ZW1wbGF0ZShcIjxsaT5pdGVtPC9saT5cIiksXG4gICAgICByZWdpb25UeXBlU2VsZWN0b3I6IF8udGVtcGxhdGUoXCI8ZGl2IGNsYXNzPVxcXCJyZWdpb250eXBlc2VsZWN0b3JcXFwiIGlkPVxcXCJyZWdpb250eXBlLTwlPSBpZCAlPlxcXCI+XFxuICAgIDxsYWJlbCBjbGFzcz1cXFwibmFtZVxcXCI+PGlucHV0XFxuICAgICAgICBjbGFzcz1cXFwicmVnaW9udHlwZVxcXCJcXG4gICAgICAgIG5hbWU9XFxcInJlZ2lvbnR5cGVcXFwiXFxuICAgICAgICB0eXBlPVxcXCJyYWRpb1xcXCJcXG4gICAgICAgIHZhbHVlPVxcXCI8JT0gaWQgJT5cXFwiXFxuICAgIC8+IDwlPSBuYW1lICU+XFxuICAgIDwvbGFiZWw+XFxuICAgIDxkaXYgY2xhc3M9XFxcInJlZ2lvbnNlbGVjdG9yd3JhcHBlclxcXCI+PHNlbGVjdCBjbGFzcz1cXFwicmVnaW9uc2VsZWN0b3JcXFwiPlxcbiAgICAgICAgPG9wdGlvbiB2YWx1ZT1cXFwiXFxcIiBkaXNhYmxlZD1cXFwiZGlzYWJsZWRcXFwiIHNlbGVjdGVkPVxcXCJzZWxlY3RlZFxcXCI+c2VsZWN0IGEgcmVnaW9uJmhlbGxpcDs8L29wdGlvbj5cXG4gICAgICAgIDwlPSBvcHRpb25MaXN0ICU+XFxuICAgIDwvc2VsZWN0PjwvZGl2PlxcbjwvZGl2PlwiKSxcbiAgICAgIHJlZ2lvblNlbGVjdG9yOiBfLnRlbXBsYXRlKFwiPG9wdGlvbiB2YWx1ZT1cXFwiPCU9IGlkICU+XFxcIj48JT0gbmFtZSAlPjwvb3B0aW9uPlwiKSxcbiAgICAgIHllYXJTZWxlY3RvcjogXy50ZW1wbGF0ZShcIjxkaXYgY2xhc3M9XFxcInllYXJyb3dcXFwiIGlkPVxcXCJ5ZWFyLTwlPSB5ZWFyICU+XFxcIj5cXG4gICAgPGxhYmVsIGNsYXNzPVxcXCJuYW1lXFxcIj48aW5wdXRcXG4gICAgICAgIGNsYXNzPVxcXCJ5ZWFyXFxcIlxcbiAgICAgICAgbmFtZT1cXFwieWVhclxcXCJcXG4gICAgICAgIHR5cGU9XFxcInJhZGlvXFxcIlxcbiAgICAgICAgdmFsdWU9XFxcIjwlPSB5ZWFyICU+XFxcIlxcbiAgICAvPiA8JT0geWVhciAlPjwvbGFiZWw+XFxuPC9kaXY+XCIpLFxuICAgICAgc2VjdGlvblNlbGVjdG9yOiBfLnRlbXBsYXRlKFwiPGRpdiBjbGFzcz1cXFwic2VjdGlvbnNlbGVjdG9yPCUgaWYgKGluaXRpYWwgIT0gJ2luY2x1ZGVkJykgeyBwcmludCgnIHVuc2VsZWN0ZWQnKTsgfSAlPlxcXCIgaWQ9XFxcInNlY3Rpb24tPCU9IGlkICU+XFxcIj5cXG4gICAgPGxhYmVsIGNsYXNzPVxcXCJuYW1lXFxcIlxcbiAgICAgICAgPCUgaWYgKHByZXNlbmNlID09ICdyZXF1aXJlZCcpIHsgcHJpbnQoJ3RpdGxlPVxcXCJUaGlzIHNlY3Rpb24gaXMgcmVxdWlyZWRcXFwiJyk7IH0gJT5cXG4gICAgPjxpbnB1dFxcbiAgICAgICAgdHlwZT1cXFwiY2hlY2tib3hcXFwiXFxuICAgICAgICB2YWx1ZT1cXFwiPCU9IGlkICU+XFxcIlxcbiAgICAgICAgPCUgaWYgKGluaXRpYWwgPT0gJ2luY2x1ZGVkJykgeyBwcmludCgnY2hlY2tlZD1cXFwiY2hlY2tlZFxcXCInKTsgfSAlPlxcbiAgICAgICAgPCUgaWYgKHByZXNlbmNlID09ICdyZXF1aXJlZCcpIHsgcHJpbnQoJ2Rpc2FibGVkPVxcXCJkaXNhYmxlZFxcXCInKTsgfSAlPlxcbiAgICAvPiA8JT0gbmFtZSAlPjwvbGFiZWw+XFxuICAgIDxwIGNsYXNzPVxcXCJkZXNjcmlwdGlvblxcXCI+PCU9IGRlc2NyaXB0aW9uICU+PC9wPlxcblxcbjwvZGl2PlwiKSxcbiAgICAgIHN1YnNlY3Rpb25zOiBfLnRlbXBsYXRlKFwiPGRpdiBjbGFzcz1cXFwic3Vic2VjdGlvbnMgY2xlYXJmaXhcXFwiPlxcbjwvZGl2PlwiKVxuICAgIH1cbiAgfSk7XG5cbiAgbW9kdWxlLmV4cG9ydHMgPSBBcHBWaWV3O1xuXG59KS5jYWxsKHRoaXMpO1xuIl19
