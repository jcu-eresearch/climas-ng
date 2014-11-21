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
          years: ['2015', '2025', '2035', '2045', '2055', '2065', '2075', '2085']
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
      layout: _.template("<div class=\"reviewblock\"></div>\n<div class=\"formblock\">\n    <h1>Report on</h1>\n    <div class=\"loading select regionselect\">loading available regions..</div>\n\n    <h1>In the year</h1>\n    <div class=\"loading select yearselect\">loading available years..</div>\n\n    <h1>Including</h1>\n    <div class=\"loading select sectionselect\">loading available sections..</div>\n</div>"),
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9wdnJkd2IvamN1L2NuZy93ZWJhcHAvbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL3B2cmR3Yi9qY3UvY25nL3dlYmFwcC9jbGltYXNuZy9zcmMvanMvZmFrZV80YzQzMGUwLmpzIiwiL1VzZXJzL3B2cmR3Yi9qY3UvY25nL3dlYmFwcC9jbGltYXNuZy9zcmMvanMvcmVwb3J0cy9tYWluLmpzIiwiL1VzZXJzL3B2cmR3Yi9qY3UvY25nL3dlYmFwcC9jbGltYXNuZy9zcmMvanMvcmVwb3J0cy91dGlsL3NoaW1zLmpzIiwiL1VzZXJzL3B2cmR3Yi9qY3UvY25nL3dlYmFwcC9jbGltYXNuZy9zcmMvanMvcmVwb3J0cy92aWV3cy9hcHAuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcbnJlcXVpcmUoJy4vcmVwb3J0cy9tYWluJyk7XG5cbiIsIihmdW5jdGlvbigpIHtcbiAgdmFyIEFwcFZpZXc7XG5cbiAgaWYgKCF3aW5kb3cuY29uc29sZSkge1xuICAgIHdpbmRvdy5jb25zb2xlID0ge1xuICAgICAgbG9nOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHt9O1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICBBcHBWaWV3ID0gcmVxdWlyZSgnLi92aWV3cy9hcHAnKTtcblxuICAkKGZ1bmN0aW9uKCkge1xuICAgIHZhciBhcHB2aWV3O1xuICAgIGFwcHZpZXcgPSBuZXcgQXBwVmlldygpO1xuICAgIHJldHVybiBhcHB2aWV3LnJlbmRlcigpO1xuICB9KTtcblxufSkuY2FsbCh0aGlzKTtcbiIsIihmdW5jdGlvbigpIHtcbiAgdmFyIF9faW5kZXhPZiA9IFtdLmluZGV4T2YgfHwgZnVuY3Rpb24oaXRlbSkgeyBmb3IgKHZhciBpID0gMCwgbCA9IHRoaXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7IGlmIChpIGluIHRoaXMgJiYgdGhpc1tpXSA9PT0gaXRlbSkgcmV0dXJuIGk7IH0gcmV0dXJuIC0xOyB9O1xuXG4gIGlmICghQXJyYXkucHJvdG90eXBlLmZvckVhY2gpIHtcbiAgICBBcnJheS5wcm90b3R5cGUuZm9yRWFjaCA9IGZ1bmN0aW9uKGZuLCBzY29wZSkge1xuICAgICAgdmFyIGksIF9pLCBfcmVmLCBfcmVzdWx0cztcbiAgICAgIF9yZXN1bHRzID0gW107XG4gICAgICBmb3IgKGkgPSBfaSA9IDAsIF9yZWYgPSB0aGlzLmxlbmd0aDsgMCA8PSBfcmVmID8gX2kgPD0gX3JlZiA6IF9pID49IF9yZWY7IGkgPSAwIDw9IF9yZWYgPyArK19pIDogLS1faSkge1xuICAgICAgICBfcmVzdWx0cy5wdXNoKF9faW5kZXhPZi5jYWxsKHRoaXMsIGkpID49IDAgPyBmbi5jYWxsKHNjb3BlLCB0aGlzW2ldLCBpLCB0aGlzKSA6IHZvaWQgMCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gX3Jlc3VsdHM7XG4gICAgfTtcbiAgfVxuXG4gIGlmICghQXJyYXkucHJvdG90eXBlLmluZGV4T2YpIHtcbiAgICBBcnJheS5wcm90b3R5cGUuaW5kZXhPZiA9IGZ1bmN0aW9uKG5lZWRsZSkge1xuICAgICAgdmFyIGksIF9pLCBfcmVmO1xuICAgICAgZm9yIChpID0gX2kgPSAwLCBfcmVmID0gdGhpcy5sZW5ndGg7IDAgPD0gX3JlZiA/IF9pIDw9IF9yZWYgOiBfaSA+PSBfcmVmOyBpID0gMCA8PSBfcmVmID8gKytfaSA6IC0tX2kpIHtcbiAgICAgICAgaWYgKHRoaXNbaV0gPT09IG5lZWRsZSkge1xuICAgICAgICAgIHJldHVybiBpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gLTE7XG4gICAgfTtcbiAgfVxuXG59KS5jYWxsKHRoaXMpO1xuIiwiKGZ1bmN0aW9uKCkge1xuICB2YXIgQXBwVmlldywgZGVidWc7XG5cbiAgcmVxdWlyZSgnLi4vdXRpbC9zaGltcycpO1xuXG5cbiAgLyoganNoaW50IC1XMDkzICovXG5cblxuICAvKiBqc2hpbnQgLVcwNDEgKi9cblxuICBkZWJ1ZyA9IGZ1bmN0aW9uKGl0ZW1Ub0xvZywgaXRlbUxldmVsKSB7XG4gICAgdmFyIGxldmVscywgbWVzc2FnZU51bSwgdGhyZXNob2xkLCB0aHJlc2hvbGROdW07XG4gICAgbGV2ZWxzID0gWyd2ZXJ5ZGVidWcnLCAnZGVidWcnLCAnbWVzc2FnZScsICd3YXJuaW5nJ107XG4gICAgdGhyZXNob2xkID0gJ21lc3NhZ2UnO1xuICAgIGlmICghaXRlbUxldmVsKSB7XG4gICAgICBpdGVtTGV2ZWwgPSAnZGVidWcnO1xuICAgIH1cbiAgICB0aHJlc2hvbGROdW0gPSBsZXZlbHMuaW5kZXhPZih0aHJlc2hvbGQpO1xuICAgIG1lc3NhZ2VOdW0gPSBsZXZlbHMuaW5kZXhPZihpdGVtTGV2ZWwpO1xuICAgIGlmICh0aHJlc2hvbGROdW0gPiBtZXNzYWdlTnVtKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChpdGVtVG9Mb2cgKyAnJyA9PT0gaXRlbVRvTG9nKSB7XG4gICAgICByZXR1cm4gY29uc29sZS5sb2coXCJbXCIgKyBpdGVtTGV2ZWwgKyBcIl0gXCIgKyBpdGVtVG9Mb2cpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gY29uc29sZS5sb2coaXRlbVRvTG9nKTtcbiAgICB9XG4gIH07XG5cbiAgQXBwVmlldyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcbiAgICB0YWdOYW1lOiAnZm9ybScsXG4gICAgY2xhc3NOYW1lOiAnJyxcbiAgICBpZDogJ3JlcG9ydGZvcm0nLFxuICAgIGRhdGFVcmw6IFwiXCIgKyBsb2NhdGlvbi5wcm90b2NvbCArIFwiLy9cIiArIGxvY2F0aW9uLmhvc3QgKyBcIi9kYXRhXCIsXG4gICAgcmFzdGVyQXBpVXJsOiBcIlwiICsgbG9jYXRpb24ucHJvdG9jb2wgKyBcIi8vbG9jYWxob3N0OjEwNjAwL2FwaS9yYXN0ZXIvMS93bXNfZGF0YV91cmxcIixcbiAgICB0cmFja1NwbGl0dGVyOiBmYWxzZSxcbiAgICB0cmFja1BlcmlvZDogMTAwLFxuICAgIGV2ZW50czoge1xuICAgICAgJ2NoYW5nZSAuc2VjdGlvbnNlbGVjdG9yIGlucHV0JzogJ3VwZGF0ZVNlY3Rpb25TZWxlY3Rpb24nLFxuICAgICAgJ2NoYW5nZSAucmVnaW9uc2VsZWN0IGlucHV0JzogJ3VwZGF0ZVJlZ2lvblNlbGVjdGlvbicsXG4gICAgICAnY2hhbmdlIC5yZWdpb25zZWxlY3Qgc2VsZWN0JzogJ3VwZGF0ZVJlZ2lvblNlbGVjdGlvbicsXG4gICAgICAnY2hhbmdlIC55ZWFyc2VsZWN0IGlucHV0JzogJ3VwZGF0ZVllYXJTZWxlY3Rpb24nLFxuICAgICAgJ2NsaWNrIC5nZXRyZXBvcnQnOiAnZ2V0UmVwb3J0J1xuICAgIH0sXG4gICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgcmVnRmV0Y2gsIHNlY3RGZXRjaCwgeWVhckZldGNoO1xuICAgICAgZGVidWcoJ0FwcFZpZXcuaW5pdGlhbGl6ZScpO1xuICAgICAgXy5iaW5kQWxsLmFwcGx5KF8sIFt0aGlzXS5jb25jYXQoXy5mdW5jdGlvbnModGhpcykpKTtcbiAgICAgIHRoaXMuaGFzaCA9ICcnO1xuICAgICAgc2VjdEZldGNoID0gdGhpcy5mZXRjaFJlcG9ydFNlY3Rpb25zKCk7XG4gICAgICByZWdGZXRjaCA9IHRoaXMuZmV0Y2hSZWdpb25zKCk7XG4gICAgICB5ZWFyRmV0Y2ggPSB0aGlzLmZldGNoWWVhcnMoKTtcbiAgICAgICQud2hlbihzZWN0RmV0Y2gsIHJlZ0ZldGNoLCB5ZWFyRmV0Y2gpLnRoZW4oKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICBfdGhpcy5jaGVja0hhc2goKTtcbiAgICAgICAgICByZXR1cm4gX3RoaXMudXBkYXRlU3VtbWFyeSgpO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpO1xuICAgICAgcmV0dXJuICQod2luZG93KS5vbignaGFzaGNoYW5nZScsIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuIF90aGlzLmNoZWNrSGFzaCgpO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpO1xuICAgIH0sXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LnJlbmRlcicpO1xuICAgICAgdGhpcy4kZWwuYXBwZW5kKEFwcFZpZXcudGVtcGxhdGVzLmxheW91dCh7fSkpO1xuICAgICAgcmV0dXJuICQoJyNjb250ZW50d3JhcCAubWFpbmNvbnRlbnQnKS5hcHBlbmQodGhpcy4kZWwpO1xuICAgIH0sXG4gICAgY2hlY2tIYXNoOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBoYXNoLCBoYXNoRGF0YSwga2V5LCB2YWx1ZTtcbiAgICAgIGhhc2ggPSB3aW5kb3cubG9jYXRpb24uaGFzaDtcbiAgICAgIGlmICh0aGlzLmhhc2ggPT09IGhhc2ggfHwgaGFzaC5sZW5ndGggPCAyKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGhhc2hEYXRhID0gdGhpcy5zcGxpdEhhc2goaGFzaCk7XG4gICAgICBmb3IgKGtleSBpbiBoYXNoRGF0YSkge1xuICAgICAgICB2YWx1ZSA9IGhhc2hEYXRhW2tleV07XG4gICAgICAgIHRoaXMuYXBwbHlIYXNoRWxlbWVudChrZXksIHZhbHVlKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLmhhc2ggPSB3aW5kb3cubG9jYXRpb24uaGFzaDtcbiAgICB9LFxuICAgIHNwbGl0SGFzaDogZnVuY3Rpb24oaGFzaCkge1xuICAgICAgdmFyIGhhc2hEYXRhLCBoYXNoTGlzdCwgaGFzaFBhaXIsIF9mbiwgX2ksIF9sZW47XG4gICAgICBoYXNoRGF0YSA9IHt9O1xuICAgICAgaGFzaExpc3QgPSBoYXNoLnN1YnN0cmluZygxKS5zcGxpdCgnLycpO1xuICAgICAgX2ZuID0gKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihoYXNoUGFpcikge1xuICAgICAgICAgIHZhciBwYXJ0cztcbiAgICAgICAgICBwYXJ0cyA9IGhhc2hQYWlyLnNwbGl0KCc9Jyk7XG4gICAgICAgICAgaWYgKHBhcnRzLmxlbmd0aCA9PT0gMikge1xuICAgICAgICAgICAgcmV0dXJuIGhhc2hEYXRhW3BhcnRzWzBdXSA9IHBhcnRzWzFdO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpO1xuICAgICAgZm9yIChfaSA9IDAsIF9sZW4gPSBoYXNoTGlzdC5sZW5ndGg7IF9pIDwgX2xlbjsgX2krKykge1xuICAgICAgICBoYXNoUGFpciA9IGhhc2hMaXN0W19pXTtcbiAgICAgICAgX2ZuKGhhc2hQYWlyKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBoYXNoRGF0YTtcbiAgICB9LFxuICAgIGFwcGx5SGFzaEVsZW1lbnQ6IGZ1bmN0aW9uKGVsZW0sIHZhbHVlKSB7XG4gICAgICB2YXIgcmVnaW9udHlwZTtcbiAgICAgIGlmIChlbGVtID09PSAncmVnaW9uJykge1xuICAgICAgICByZWdpb250eXBlID0gdmFsdWUuc3BsaXQoJ18nKVswXTtcbiAgICAgICAgdGhpcy4kKCdpbnB1dFt0eXBlPXJhZGlvXVtuYW1lPXJlZ2lvbnR5cGVdW3ZhbHVlPVwiJyArIHJlZ2lvbnR5cGUgKyAnXCJdJykuY2xpY2soKTtcbiAgICAgICAgdGhpcy4kKCdzZWxlY3QucmVnaW9uc2VsZWN0b3Igb3B0aW9uW3ZhbHVlPVwiJyArIHZhbHVlICsgJ1wiXScpLnBhcmVudCgpLnZhbCh2YWx1ZSkuY2hhbmdlKCk7XG4gICAgICB9XG4gICAgICBpZiAoZWxlbSA9PT0gJ3llYXInKSB7XG4gICAgICAgIHJldHVybiB0aGlzLiQoJ2lucHV0W3R5cGU9cmFkaW9dW25hbWU9eWVhcl1bdmFsdWU9XCInICsgdmFsdWUgKyAnXCJdJykuY2xpY2soKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIG1ha2VIYXNoOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBoYXNoSXRlbXMsIGtleSwgbmV3SGFzaDtcbiAgICAgIGRlYnVnKCdBcHBWaWV3Lm1ha2VIYXNoJyk7XG4gICAgICBoYXNoSXRlbXMgPSB0aGlzLnNwbGl0SGFzaCh3aW5kb3cubG9jYXRpb24uaGFzaCk7XG4gICAgICBpZiAodGhpcy5zZWxlY3RlZFllYXIpIHtcbiAgICAgICAgaGFzaEl0ZW1zLnllYXIgPSB0aGlzLnNlbGVjdGVkWWVhcjtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLnNlbGVjdGVkUmVnaW9uICYmIHRoaXMuc2VsZWN0ZWRSZWdpb24gIT09ICcnKSB7XG4gICAgICAgIGhhc2hJdGVtcy5yZWdpb24gPSB0aGlzLnNlbGVjdGVkUmVnaW9uO1xuICAgICAgfVxuICAgICAgbmV3SGFzaCA9ICgoZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBfcmVzdWx0cztcbiAgICAgICAgX3Jlc3VsdHMgPSBbXTtcbiAgICAgICAgZm9yIChrZXkgaW4gaGFzaEl0ZW1zKSB7XG4gICAgICAgICAgX3Jlc3VsdHMucHVzaChrZXkgKyAnPScgKyBoYXNoSXRlbXNba2V5XSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIF9yZXN1bHRzO1xuICAgICAgfSkoKSkuam9pbignLycpO1xuICAgICAgcmV0dXJuIGxvY2F0aW9uLmhhc2ggPSAnLycgKyBuZXdIYXNoO1xuICAgIH0sXG4gICAgZ2V0UmVwb3J0OiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBmb3JtO1xuICAgICAgZGVidWcoJ0FwcFZpZXcuZ2V0UmVwb3J0Jyk7XG4gICAgICB0aGlzLiQoJyNyZXBvcnRmb3JtJykucmVtb3ZlKCk7XG4gICAgICBmb3JtID0gW107XG4gICAgICBmb3JtLnB1c2goJzxmb3JtIGFjdGlvbj1cIi9yZWdpb25yZXBvcnRcIiBtZXRob2Q9XCJnZXRcIiBpZD1cInJlcG9ydGZvcm1cIj4nKTtcbiAgICAgIGZvcm0ucHVzaCgnPGlucHV0IHR5cGU9XCJoaWRkZW5cIiBuYW1lPVwieWVhclwiIHZhbHVlPVwiJyArIHRoaXMuc2VsZWN0ZWRZZWFyICsgJ1wiPicpO1xuICAgICAgZm9ybS5wdXNoKCc8aW5wdXQgdHlwZT1cImhpZGRlblwiIG5hbWU9XCJyZWdpb250eXBlXCIgdmFsdWU9XCInICsgdGhpcy5zZWxlY3RlZFJlZ2lvblR5cGUgKyAnXCI+Jyk7XG4gICAgICBmb3JtLnB1c2goJzxpbnB1dCB0eXBlPVwiaGlkZGVuXCIgbmFtZT1cInJlZ2lvblwiIHZhbHVlPVwiJyArIHRoaXMuc2VsZWN0ZWRSZWdpb24gKyAnXCI+Jyk7XG4gICAgICBmb3JtLnB1c2goJzxpbnB1dCB0eXBlPVwiaGlkZGVuXCIgbmFtZT1cInNlY3Rpb25zXCIgdmFsdWU9XCInICsgdGhpcy5zZWxlY3RlZFNlY3Rpb25zLmpvaW4oJyAnKSArICdcIj4nKTtcbiAgICAgIGZvcm0ucHVzaCgnPC9mb3JtPicpO1xuICAgICAgdGhpcy4kZWwuYXBwZW5kKGZvcm0uam9pbignXFxuJykpO1xuICAgICAgdGhpcy4kKCcjcmVwb3J0Zm9ybScpLnN1Ym1pdCgpO1xuICAgICAgaWYgKGdhICYmIHR5cGVvZiBnYSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICByZXR1cm4gZ2EoJ3NlbmQnLCB7XG4gICAgICAgICAgJ2hpdFR5cGUnOiAnZXZlbnQnLFxuICAgICAgICAgICdldmVudENhdGVnb3J5JzogJ3JlcG9ydGRvd25sb2FkJyxcbiAgICAgICAgICAnZXZlbnRBY3Rpb24nOiB0aGlzLnNlbGVjdGVkUmVnaW9uVHlwZSxcbiAgICAgICAgICAnZXZlbnRMYWJlbCc6IHRoaXMuc2VsZWN0ZWRSZWdpb24sXG4gICAgICAgICAgJ2V2ZW50VmFsdWUnOiBwYXJzZUludCh0aGlzLnNlbGVjdGVkWWVhciwgMTApXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0sXG4gICAgZmV0Y2hSZXBvcnRTZWN0aW9uczogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgZmV0Y2g7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5mZXRjaFJlcG9ydFNlY3Rpb25zJyk7XG4gICAgICBmZXRjaCA9ICQuYWpheCh0aGlzLmRhdGFVcmwgKyAnL3JlcG9ydHNlY3Rpb25zJyk7XG4gICAgICBmZXRjaC5kb25lKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgIHZhciBzZWN0aW9uc2VsZWN0O1xuICAgICAgICAgIF90aGlzLnBvc3NpYmxlU2VjdGlvbnMgPSBkYXRhLnNlY3Rpb25zO1xuICAgICAgICAgIHNlY3Rpb25zZWxlY3QgPSBfdGhpcy4kKCcuc2VjdGlvbnNlbGVjdCcpO1xuICAgICAgICAgIHNlY3Rpb25zZWxlY3QuZW1wdHkoKS5yZW1vdmVDbGFzcygnbG9hZGluZycpO1xuICAgICAgICAgIHJldHVybiBfdGhpcy5idWlsZFJlcG9ydFNlY3Rpb25MaXN0KF90aGlzLnBvc3NpYmxlU2VjdGlvbnMsIHNlY3Rpb25zZWxlY3QpO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpO1xuICAgICAgcmV0dXJuIGZldGNoLnByb21pc2UoKTtcbiAgICB9LFxuICAgIGJ1aWxkUmVwb3J0U2VjdGlvbkxpc3Q6IGZ1bmN0aW9uKGRhdGEsIHdyYXBwZXIpIHtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LmJ1aWxkUmVwb3J0U2VjdGlvbkxpc3QnKTtcbiAgICAgICQuZWFjaChkYXRhLCAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGluZGV4LCBpdGVtKSB7XG4gICAgICAgICAgdmFyIHNlbGVjdG9yUm93LCBzdWJzZWN0aW9ucztcbiAgICAgICAgICBzZWxlY3RvclJvdyA9ICQoQXBwVmlldy50ZW1wbGF0ZXMuc2VjdGlvblNlbGVjdG9yKGl0ZW0pKTtcbiAgICAgICAgICAkKHdyYXBwZXIpLmFwcGVuZChzZWxlY3RvclJvdyk7XG4gICAgICAgICAgaWYgKGl0ZW0uc2VjdGlvbnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgc3Vic2VjdGlvbnMgPSAkKEFwcFZpZXcudGVtcGxhdGVzLnN1YnNlY3Rpb25zKCkpO1xuICAgICAgICAgICAgX3RoaXMuYnVpbGRSZXBvcnRTZWN0aW9uTGlzdChpdGVtLnNlY3Rpb25zLCBzdWJzZWN0aW9ucyk7XG4gICAgICAgICAgICByZXR1cm4gJChzZWxlY3RvclJvdykuYWRkQ2xhc3MoJ2hhc3N1YnNlY3Rpb25zJykuYXBwZW5kKHN1YnNlY3Rpb25zKTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKSk7XG4gICAgICByZXR1cm4gdGhpcy51cGRhdGVTdW1tYXJ5KCk7XG4gICAgfSxcbiAgICB1cGRhdGVTZWN0aW9uU2VsZWN0aW9uOiBmdW5jdGlvbihldmVudCkge1xuICAgICAgZGVidWcoJ0FwcFZpZXcudXBkYXRlU2VjdGlvblNlbGVjdGlvbicpO1xuICAgICAgcmV0dXJuIHRoaXMuaGFuZGxlU2VjdGlvblNlbGVjdGlvbih0aGlzLnBvc3NpYmxlU2VjdGlvbnMpO1xuICAgIH0sXG4gICAgaGFuZGxlU2VjdGlvblNlbGVjdGlvbjogZnVuY3Rpb24oc2VjdGlvbkxpc3QsIHBhcmVudCkge1xuICAgICAgZGVidWcoJ0FwcFZpZXcuaGFuZGxlU2VjdGlvblNlbGVjdGlvbicpO1xuICAgICAgJC5lYWNoKHNlY3Rpb25MaXN0LCAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGluZGV4LCBpdGVtKSB7XG4gICAgICAgICAgdmFyIHNlbGVjdGlvbkNvbnRyb2wsIHNlbGVjdG9yLCBfcmVmO1xuICAgICAgICAgIHNlbGVjdG9yID0gX3RoaXMuJChcIiNzZWN0aW9uLVwiICsgKGl0ZW0uaWQucmVwbGFjZSgvXFwuL2csICdcXFxcLicpKSk7XG4gICAgICAgICAgc2VsZWN0aW9uQ29udHJvbCA9IHNlbGVjdG9yLmZpbmQoJ2lucHV0Jyk7XG4gICAgICAgICAgaWYgKHNlbGVjdGlvbkNvbnRyb2wucHJvcCgnY2hlY2tlZCcpKSB7XG4gICAgICAgICAgICBzZWxlY3Rvci5yZW1vdmVDbGFzcygndW5zZWxlY3RlZCcpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzZWxlY3Rvci5hZGRDbGFzcygndW5zZWxlY3RlZCcpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoKChfcmVmID0gaXRlbS5zZWN0aW9ucykgIT0gbnVsbCA/IF9yZWYubGVuZ3RoIDogdm9pZCAwKSA+IDApIHtcbiAgICAgICAgICAgIHJldHVybiBfdGhpcy5oYW5kbGVTZWN0aW9uU2VsZWN0aW9uKGl0ZW0uc2VjdGlvbnMsIGl0ZW0uaWQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKTtcbiAgICAgIHJldHVybiB0aGlzLnVwZGF0ZVN1bW1hcnkoKTtcbiAgICB9LFxuICAgIGZldGNoUmVnaW9uczogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgZmV0Y2g7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5mZXRjaFJlZ2lvbnMnKTtcbiAgICAgIGZldGNoID0gJC5hamF4KHRoaXMuZGF0YVVybCArICcvcmVwb3J0cmVnaW9ucycpO1xuICAgICAgZmV0Y2guZG9uZSgoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICByZXR1cm4gX3RoaXMuYnVpbGRSZWdpb25MaXN0KGRhdGEpO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpO1xuICAgICAgcmV0dXJuIGZldGNoLnByb21pc2UoKTtcbiAgICB9LFxuICAgIGJ1aWxkUmVnaW9uTGlzdDogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgdmFyIHJlZ2lvbnNlbGVjdDtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LmJ1aWxkUmVnaW9uTGlzdCcpO1xuICAgICAgdGhpcy5yZWdpb25zID0gZGF0YS5yZWdpb250eXBlcztcbiAgICAgIHJlZ2lvbnNlbGVjdCA9IHRoaXMuJCgnLnJlZ2lvbnNlbGVjdCcpO1xuICAgICAgcmVnaW9uc2VsZWN0LmVtcHR5KCkucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcnKTtcbiAgICAgICQuZWFjaCh0aGlzLnJlZ2lvbnMsIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oaW5kZXgsIHJlZ2lvblR5cGUpIHtcbiAgICAgICAgICB2YXIgcmVnLCByZWdpb25UeXBlUm93O1xuICAgICAgICAgIHJlZ2lvblR5cGUub3B0aW9uTGlzdCA9IFtcbiAgICAgICAgICAgIChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgdmFyIF9pLCBfbGVuLCBfcmVmLCBfcmVzdWx0cztcbiAgICAgICAgICAgICAgX3JlZiA9IHJlZ2lvblR5cGUucmVnaW9ucztcbiAgICAgICAgICAgICAgX3Jlc3VsdHMgPSBbXTtcbiAgICAgICAgICAgICAgZm9yIChfaSA9IDAsIF9sZW4gPSBfcmVmLmxlbmd0aDsgX2kgPCBfbGVuOyBfaSsrKSB7XG4gICAgICAgICAgICAgICAgcmVnID0gX3JlZltfaV07XG4gICAgICAgICAgICAgICAgX3Jlc3VsdHMucHVzaChBcHBWaWV3LnRlbXBsYXRlcy5yZWdpb25TZWxlY3RvcihyZWcpKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXR1cm4gX3Jlc3VsdHM7XG4gICAgICAgICAgICB9KSgpXG4gICAgICAgICAgXS5qb2luKFwiXFxuXCIpO1xuICAgICAgICAgIHJlZ2lvblR5cGVSb3cgPSAkKEFwcFZpZXcudGVtcGxhdGVzLnJlZ2lvblR5cGVTZWxlY3RvcihyZWdpb25UeXBlKSk7XG4gICAgICAgICAgcmV0dXJuIHJlZ2lvbnNlbGVjdC5hcHBlbmQocmVnaW9uVHlwZVJvdyk7XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKSk7XG4gICAgICByZXR1cm4gdGhpcy51cGRhdGVTdW1tYXJ5KCk7XG4gICAgfSxcbiAgICB1cGRhdGVSZWdpb25TZWxlY3Rpb246IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICB2YXIgc2VsZWN0ZWRUeXBlO1xuICAgICAgZGVidWcoJ0FwcFZpZXcudXBkYXRlUmVnaW9uU2VsZWN0aW9uJyk7XG4gICAgICBzZWxlY3RlZFR5cGUgPSB0aGlzLiQoJ1tuYW1lPXJlZ2lvbnR5cGVdOmNoZWNrZWQnKS52YWwoKTtcbiAgICAgICQuZWFjaCh0aGlzLnJlZ2lvbnMsIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oaW5kZXgsIHJlZ2lvblR5cGUpIHtcbiAgICAgICAgICB2YXIgc2VsZWN0b3I7XG4gICAgICAgICAgc2VsZWN0b3IgPSBfdGhpcy4kKFwiI3JlZ2lvbnR5cGUtXCIgKyByZWdpb25UeXBlLmlkKTtcbiAgICAgICAgICBpZiAoc2VsZWN0ZWRUeXBlID09PSByZWdpb25UeXBlLmlkKSB7XG4gICAgICAgICAgICBzZWxlY3Rvci5hZGRDbGFzcygndHlwZXNlbGVjdGVkJyk7XG4gICAgICAgICAgICBfdGhpcy5zZWxlY3RlZFJlZ2lvblR5cGUgPSByZWdpb25UeXBlLmlkO1xuICAgICAgICAgICAgX3RoaXMuc2VsZWN0ZWRSZWdpb24gPSAkKHNlbGVjdG9yLmZpbmQoJ3NlbGVjdCcpKS52YWwoKTtcbiAgICAgICAgICAgIGlmIChfdGhpcy5zZWxlY3RlZFJlZ2lvbiA9PT0gJycpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHNlbGVjdG9yLnJlbW92ZUNsYXNzKCdyZWdpb25zZWxlY3RlZCcpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgc2VsZWN0b3IuYWRkQ2xhc3MoJ3JlZ2lvbnNlbGVjdGVkJyk7XG4gICAgICAgICAgICAgIHJldHVybiBfdGhpcy5zZWxlY3RlZFJlZ2lvbkluZm8gPSBfLmZpbmQocmVnaW9uVHlwZS5yZWdpb25zLCBmdW5jdGlvbihyZWdpb24pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVnaW9uLmlkID09PSBfdGhpcy5zZWxlY3RlZFJlZ2lvbjtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBzZWxlY3Rvci5yZW1vdmVDbGFzcygndHlwZXNlbGVjdGVkJyk7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpO1xuICAgICAgcmV0dXJuIHRoaXMudXBkYXRlU3VtbWFyeSgpO1xuICAgIH0sXG4gICAgZmV0Y2hZZWFyczogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgZmV0Y2g7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5mZXRjaFllYXJzJyk7XG4gICAgICBmZXRjaCA9ICQuRGVmZXJyZWQoKTtcbiAgICAgIGZldGNoLmRvbmUoKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgcmV0dXJuIF90aGlzLmJ1aWxkWWVhckxpc3QoZGF0YSk7XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKSk7XG4gICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gZmV0Y2gucmVzb2x2ZSh7XG4gICAgICAgICAgeWVhcnM6IFsnMjAxNScsICcyMDI1JywgJzIwMzUnLCAnMjA0NScsICcyMDU1JywgJzIwNjUnLCAnMjA3NScsICcyMDg1J11cbiAgICAgICAgfSk7XG4gICAgICB9LCA1MDAgKyAoNTAwICogTWF0aC5yYW5kb20oKSkpO1xuICAgICAgcmV0dXJuIGZldGNoLnByb21pc2UoKTtcbiAgICB9LFxuICAgIGJ1aWxkWWVhckxpc3Q6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIHZhciB5ZWFyc2VsZWN0O1xuICAgICAgZGVidWcoJ0FwcFZpZXcuYnVpbGRZZWFyTGlzdCcpO1xuICAgICAgdGhpcy55ZWFycyA9IGRhdGEueWVhcnM7XG4gICAgICB5ZWFyc2VsZWN0ID0gdGhpcy4kKCcueWVhcnNlbGVjdCcpO1xuICAgICAgeWVhcnNlbGVjdC5lbXB0eSgpLnJlbW92ZUNsYXNzKCdsb2FkaW5nJyk7XG4gICAgICAkLmVhY2godGhpcy55ZWFycywgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihpbmRleCwgeWVhcikge1xuICAgICAgICAgIHJldHVybiB5ZWFyc2VsZWN0LmFwcGVuZChBcHBWaWV3LnRlbXBsYXRlcy55ZWFyU2VsZWN0b3Ioe1xuICAgICAgICAgICAgeWVhcjogeWVhclxuICAgICAgICAgIH0pKTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKTtcbiAgICAgIHJldHVybiB0aGlzLnVwZGF0ZVN1bW1hcnkoKTtcbiAgICB9LFxuICAgIHVwZGF0ZVllYXJTZWxlY3Rpb246IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICBkZWJ1ZygnQXBwVmlldy51cGRhdGVZZWFyU2VsZWN0aW9uJyk7XG4gICAgICB0aGlzLnNlbGVjdGVkWWVhciA9IHRoaXMuJCgnW25hbWU9eWVhcl06Y2hlY2tlZCcpLnZhbCgpO1xuICAgICAgJC5lYWNoKHRoaXMueWVhcnMsIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oaW5kZXgsIHllYXIpIHtcbiAgICAgICAgICB2YXIgc2VsZWN0b3I7XG4gICAgICAgICAgc2VsZWN0b3IgPSBfdGhpcy4kKFwiI3llYXItXCIgKyB5ZWFyKTtcbiAgICAgICAgICBpZiAoX3RoaXMuc2VsZWN0ZWRZZWFyID09PSB5ZWFyKSB7XG4gICAgICAgICAgICByZXR1cm4gc2VsZWN0b3IuYWRkQ2xhc3MoJ3llYXJzZWxlY3RlZCcpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gc2VsZWN0b3IucmVtb3ZlQ2xhc3MoJ3llYXJzZWxlY3RlZCcpO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKTtcbiAgICAgIHJldHVybiB0aGlzLnVwZGF0ZVN1bW1hcnkoKTtcbiAgICB9LFxuICAgIHNlY3Rpb25JZDogZnVuY3Rpb24oc2VjdGlvbkRvbSkge1xuICAgICAgcmV0dXJuICQoc2VjdGlvbkRvbSkuZmluZCgnaW5wdXQnKS5hdHRyKCd2YWx1ZScpO1xuICAgIH0sXG4gICAgc2VjdGlvbk5hbWU6IGZ1bmN0aW9uKHNlY3Rpb25Eb20pIHtcbiAgICAgIHJldHVybiB0aGlzLnNlY3Rpb25JbmZvKHNlY3Rpb25Eb20pLm5hbWU7XG4gICAgfSxcbiAgICBzZWN0aW9uSW5mbzogZnVuY3Rpb24oc2VjdGlvbkRvbSkge1xuICAgICAgdmFyIGluZm8sIHBhcmVudElkcywgcGFyZW50YWdlO1xuICAgICAgZGVidWcoJ0FwcFZpZXcuc2VjdGlvbkluZm8nKTtcbiAgICAgIHBhcmVudGFnZSA9ICQoc2VjdGlvbkRvbSkucGFyZW50cygnLnNlY3Rpb25zZWxlY3RvcicpO1xuICAgICAgcGFyZW50SWRzID0gcGFyZW50YWdlLm1hcCgoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGksIGVsZW0pIHtcbiAgICAgICAgICByZXR1cm4gX3RoaXMuc2VjdGlvbklkKGVsZW0pO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpLmdldCgpLnJldmVyc2UoKTtcbiAgICAgIHBhcmVudElkcy5wdXNoKHRoaXMuc2VjdGlvbklkKHNlY3Rpb25Eb20pKTtcbiAgICAgIHRoaXMuc2VsZWN0ZWRTZWN0aW9ucy5wdXNoKHRoaXMuc2VjdGlvbklkKHNlY3Rpb25Eb20pKTtcbiAgICAgIGluZm8gPSB7XG4gICAgICAgIHNlY3Rpb25zOiB0aGlzLnBvc3NpYmxlU2VjdGlvbnNcbiAgICAgIH07XG4gICAgICBwYXJlbnRJZHMuZm9yRWFjaChmdW5jdGlvbihpZCkge1xuICAgICAgICByZXR1cm4gaW5mbyA9IF8uZmlsdGVyKGluZm8uc2VjdGlvbnMsIGZ1bmN0aW9uKHNlY3Rpb24pIHtcbiAgICAgICAgICByZXR1cm4gc2VjdGlvbi5pZCA9PT0gaWQ7XG4gICAgICAgIH0pWzBdO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gaW5mbztcbiAgICB9LFxuICAgIHN1YlNlY3Rpb25MaXN0OiBmdW5jdGlvbihzZWN0aW9uRG9tKSB7XG4gICAgICB2YXIgbGlzdCwgc3Vic2VjdGlvbnM7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5zZWN0aW9uTGlzdCcpO1xuICAgICAgbGlzdCA9IFtdO1xuICAgICAgc3Vic2VjdGlvbnMgPSAkKHNlY3Rpb25Eb20pLmNoaWxkcmVuKCcuc3Vic2VjdGlvbnMnKTtcbiAgICAgIHN1YnNlY3Rpb25zLmNoaWxkcmVuKCcuc2VjdGlvbnNlbGVjdG9yJykubm90KCcudW5zZWxlY3RlZCcpLmVhY2goKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihpLCBlbGVtKSB7XG4gICAgICAgICAgdmFyIG5hbWUsIHN1YnM7XG4gICAgICAgICAgbmFtZSA9IF90aGlzLnNlY3Rpb25OYW1lKGVsZW0pO1xuICAgICAgICAgIHN1YnMgPSBfdGhpcy5zdWJTZWN0aW9uTGlzdChlbGVtKTtcbiAgICAgICAgICBpZiAoc3VicyAhPT0gJycpIHtcbiAgICAgICAgICAgIG5hbWUgPSBuYW1lICsgJyAoJyArIHN1YnMgKyAnKSc7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBsaXN0LnB1c2gobmFtZSk7XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKSk7XG4gICAgICByZXR1cm4gbGlzdC5qb2luKCcsICcpO1xuICAgIH0sXG4gICAgdXBkYXRlU3VtbWFyeTogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgY29udGVudCwgY29udGVudExpc3QsIHNlbGVjdGVkU2VjdGlvbnMsIHN1bW1hcnksIF9yZWY7XG4gICAgICBkZWJ1ZygnQXBwVmlldy51cGRhdGVTdW1tYXJ5Jyk7XG4gICAgICBzZWxlY3RlZFNlY3Rpb25zID0gdGhpcy4kKCcuc2VjdGlvbnNlbGVjdCA+IC5zZWN0aW9uc2VsZWN0b3InKS5ub3QoJy51bnNlbGVjdGVkJyk7XG4gICAgICB0aGlzLnNlbGVjdGVkU2VjdGlvbnMgPSBbXTtcbiAgICAgIGNvbnRlbnRMaXN0ID0gW107XG4gICAgICBzZWxlY3RlZFNlY3Rpb25zLmVhY2goKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihpbmRleCwgc2VjdGlvbikge1xuICAgICAgICAgIHZhciBpbmZvLCBzdWJMaXN0O1xuICAgICAgICAgIGluZm8gPSBfdGhpcy5zZWN0aW9uTmFtZShzZWN0aW9uKTtcbiAgICAgICAgICBzdWJMaXN0ID0gX3RoaXMuc3ViU2VjdGlvbkxpc3Qoc2VjdGlvbik7XG4gICAgICAgICAgaWYgKHN1Ykxpc3QgIT09ICcnKSB7XG4gICAgICAgICAgICBpbmZvID0gaW5mbyArICc6ICcgKyBzdWJMaXN0LnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBjb250ZW50TGlzdC5wdXNoKGluZm8gKyAnLicpO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpO1xuICAgICAgY29udGVudCA9ICcnO1xuICAgICAgaWYgKGNvbnRlbnRMaXN0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29udGVudCA9ICc8bGk+JyArIGNvbnRlbnRMaXN0LmpvaW4oJzwvbGk+PGxpPicpICsgJzwvbGk+JztcbiAgICAgIH1cbiAgICAgIHN1bW1hcnkgPSB7XG4gICAgICAgIHJlZ2lvbk5hbWU6IChfcmVmID0gdGhpcy5zZWxlY3RlZFJlZ2lvbkluZm8pICE9IG51bGwgPyBfcmVmLm5hbWUgOiB2b2lkIDAsXG4gICAgICAgIHllYXI6IHRoaXMuc2VsZWN0ZWRZZWFyLFxuICAgICAgICBjb250ZW50OiBjb250ZW50XG4gICAgICB9O1xuICAgICAgdGhpcy4kKCcucmV2aWV3YmxvY2snKS5odG1sKEFwcFZpZXcudGVtcGxhdGVzLnJldmlld0Jsb2NrKHN1bW1hcnkpKTtcbiAgICAgIHRoaXMuJCgnLnJldmlld2Jsb2NrJykudG9nZ2xlQ2xhc3MoJ3JlZ2lvbnNlbGVjdGVkJywgdGhpcy5zZWxlY3RlZFJlZ2lvbkluZm8gIT09IHZvaWQgMCk7XG4gICAgICB0aGlzLiQoJy5yZXZpZXdibG9jaycpLnRvZ2dsZUNsYXNzKCd5ZWFyc2VsZWN0ZWQnLCB0aGlzLnNlbGVjdGVkWWVhciAhPT0gdm9pZCAwKTtcbiAgICAgIHJldHVybiB0aGlzLm1ha2VIYXNoKCk7XG4gICAgfVxuICB9LCB7XG4gICAgdGVtcGxhdGVzOiB7XG4gICAgICBsYXlvdXQ6IF8udGVtcGxhdGUoXCI8ZGl2IGNsYXNzPVxcXCJyZXZpZXdibG9ja1xcXCI+PC9kaXY+XFxuPGRpdiBjbGFzcz1cXFwiZm9ybWJsb2NrXFxcIj5cXG4gICAgPGgxPlJlcG9ydCBvbjwvaDE+XFxuICAgIDxkaXYgY2xhc3M9XFxcImxvYWRpbmcgc2VsZWN0IHJlZ2lvbnNlbGVjdFxcXCI+bG9hZGluZyBhdmFpbGFibGUgcmVnaW9ucy4uPC9kaXY+XFxuXFxuICAgIDxoMT5JbiB0aGUgeWVhcjwvaDE+XFxuICAgIDxkaXYgY2xhc3M9XFxcImxvYWRpbmcgc2VsZWN0IHllYXJzZWxlY3RcXFwiPmxvYWRpbmcgYXZhaWxhYmxlIHllYXJzLi48L2Rpdj5cXG5cXG4gICAgPGgxPkluY2x1ZGluZzwvaDE+XFxuICAgIDxkaXYgY2xhc3M9XFxcImxvYWRpbmcgc2VsZWN0IHNlY3Rpb25zZWxlY3RcXFwiPmxvYWRpbmcgYXZhaWxhYmxlIHNlY3Rpb25zLi48L2Rpdj5cXG48L2Rpdj5cIiksXG4gICAgICByZXZpZXdCbG9jazogXy50ZW1wbGF0ZShcIjxoMT5TZWxlY3RlZCBSZXBvcnQ8L2gxPlxcbjxwIGNsYXNzPVxcXCJjb3ZlcmFnZVxcXCI+Q292ZXJzXFxuICAgIDwlIGlmIChyZWdpb25OYW1lKSB7ICU+PCU9IHJlZ2lvbk5hbWUgJT48JSB9IGVsc2UgeyAlPjxlbT4odW5zcGVjaWZpZWQgcmVnaW9uKTwvZW0+PCUgfSAlPlxcbiAgICBpblxcbiAgICA8JSBpZiAoeWVhcikgeyAlPjwlPSB5ZWFyICU+LjwlIH0gZWxzZSB7ICU+PGVtPih1bnNwZWNpZmllZCB5ZWFyKTwvZW0+LjwlIH0gJT5cXG48L3A+XFxuPHVsIGNsYXNzPVxcXCJjb250ZW50c1xcXCI+PCU9IGNvbnRlbnQgJT48L3VsPlxcbjxidXR0b24gdHlwZT1cXFwiYnV0dG9uXFxcIiBjbGFzcz1cXFwiZ2V0cmVwb3J0XFxcIj5kb3dubG9hZCByZXBvcnQ8L2J1dHRvbj5cIiksXG4gICAgICByZXZpZXdDb250ZW50SXRlbTogXy50ZW1wbGF0ZShcIjxsaT5pdGVtPC9saT5cIiksXG4gICAgICByZWdpb25UeXBlU2VsZWN0b3I6IF8udGVtcGxhdGUoXCI8ZGl2IGNsYXNzPVxcXCJyZWdpb250eXBlc2VsZWN0b3JcXFwiIGlkPVxcXCJyZWdpb250eXBlLTwlPSBpZCAlPlxcXCI+XFxuICAgIDxsYWJlbCBjbGFzcz1cXFwibmFtZVxcXCI+PGlucHV0XFxuICAgICAgICBjbGFzcz1cXFwicmVnaW9udHlwZVxcXCJcXG4gICAgICAgIG5hbWU9XFxcInJlZ2lvbnR5cGVcXFwiXFxuICAgICAgICB0eXBlPVxcXCJyYWRpb1xcXCJcXG4gICAgICAgIHZhbHVlPVxcXCI8JT0gaWQgJT5cXFwiXFxuICAgIC8+IDwlPSBuYW1lICU+XFxuICAgIDwvbGFiZWw+XFxuICAgIDxkaXYgY2xhc3M9XFxcInJlZ2lvbnNlbGVjdG9yd3JhcHBlclxcXCI+PHNlbGVjdCBjbGFzcz1cXFwicmVnaW9uc2VsZWN0b3JcXFwiPlxcbiAgICAgICAgPG9wdGlvbiB2YWx1ZT1cXFwiXFxcIiBkaXNhYmxlZD1cXFwiZGlzYWJsZWRcXFwiIHNlbGVjdGVkPVxcXCJzZWxlY3RlZFxcXCI+c2VsZWN0IGEgcmVnaW9uJmhlbGxpcDs8L29wdGlvbj5cXG4gICAgICAgIDwlPSBvcHRpb25MaXN0ICU+XFxuICAgIDwvc2VsZWN0PjwvZGl2PlxcbjwvZGl2PlwiKSxcbiAgICAgIHJlZ2lvblNlbGVjdG9yOiBfLnRlbXBsYXRlKFwiPG9wdGlvbiB2YWx1ZT1cXFwiPCU9IGlkICU+XFxcIj48JT0gbmFtZSAlPjwvb3B0aW9uPlwiKSxcbiAgICAgIHllYXJTZWxlY3RvcjogXy50ZW1wbGF0ZShcIjxkaXYgY2xhc3M9XFxcInllYXJyb3dcXFwiIGlkPVxcXCJ5ZWFyLTwlPSB5ZWFyICU+XFxcIj5cXG4gICAgPGxhYmVsIGNsYXNzPVxcXCJuYW1lXFxcIj48aW5wdXRcXG4gICAgICAgIGNsYXNzPVxcXCJ5ZWFyXFxcIlxcbiAgICAgICAgbmFtZT1cXFwieWVhclxcXCJcXG4gICAgICAgIHR5cGU9XFxcInJhZGlvXFxcIlxcbiAgICAgICAgdmFsdWU9XFxcIjwlPSB5ZWFyICU+XFxcIlxcbiAgICAvPiA8JT0geWVhciAlPjwvbGFiZWw+XFxuPC9kaXY+XCIpLFxuICAgICAgc2VjdGlvblNlbGVjdG9yOiBfLnRlbXBsYXRlKFwiPGRpdiBjbGFzcz1cXFwic2VjdGlvbnNlbGVjdG9yPCUgaWYgKGluaXRpYWwgIT0gJ2luY2x1ZGVkJykgeyBwcmludCgnIHVuc2VsZWN0ZWQnKTsgfSAlPlxcXCIgaWQ9XFxcInNlY3Rpb24tPCU9IGlkICU+XFxcIj5cXG4gICAgPGxhYmVsIGNsYXNzPVxcXCJuYW1lXFxcIlxcbiAgICAgICAgPCUgaWYgKHByZXNlbmNlID09ICdyZXF1aXJlZCcpIHsgcHJpbnQoJ3RpdGxlPVxcXCJUaGlzIHNlY3Rpb24gaXMgcmVxdWlyZWRcXFwiJyk7IH0gJT5cXG4gICAgPjxpbnB1dFxcbiAgICAgICAgdHlwZT1cXFwiY2hlY2tib3hcXFwiXFxuICAgICAgICB2YWx1ZT1cXFwiPCU9IGlkICU+XFxcIlxcbiAgICAgICAgPCUgaWYgKGluaXRpYWwgPT0gJ2luY2x1ZGVkJykgeyBwcmludCgnY2hlY2tlZD1cXFwiY2hlY2tlZFxcXCInKTsgfSAlPlxcbiAgICAgICAgPCUgaWYgKHByZXNlbmNlID09ICdyZXF1aXJlZCcpIHsgcHJpbnQoJ2Rpc2FibGVkPVxcXCJkaXNhYmxlZFxcXCInKTsgfSAlPlxcbiAgICAvPiA8JT0gbmFtZSAlPjwvbGFiZWw+XFxuICAgIDxwIGNsYXNzPVxcXCJkZXNjcmlwdGlvblxcXCI+PCU9IGRlc2NyaXB0aW9uICU+PC9wPlxcblxcbjwvZGl2PlwiKSxcbiAgICAgIHN1YnNlY3Rpb25zOiBfLnRlbXBsYXRlKFwiPGRpdiBjbGFzcz1cXFwic3Vic2VjdGlvbnMgY2xlYXJmaXhcXFwiPlxcbjwvZGl2PlwiKVxuICAgIH1cbiAgfSk7XG5cbiAgbW9kdWxlLmV4cG9ydHMgPSBBcHBWaWV3O1xuXG59KS5jYWxsKHRoaXMpO1xuIl19
