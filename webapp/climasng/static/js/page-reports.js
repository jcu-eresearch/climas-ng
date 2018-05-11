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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9wdnJkd2IvcHJvamVjdHMvY2xpbWFzLWdsb2JhbC93ZWJhcHAvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi9Vc2Vycy9wdnJkd2IvcHJvamVjdHMvY2xpbWFzLWdsb2JhbC93ZWJhcHAvY2xpbWFzbmcvc3JjL2pzL2Zha2VfOGMyNjQ5NzUuanMiLCIvVXNlcnMvcHZyZHdiL3Byb2plY3RzL2NsaW1hcy1nbG9iYWwvd2ViYXBwL2NsaW1hc25nL3NyYy9qcy9yZXBvcnRzL21haW4uanMiLCIvVXNlcnMvcHZyZHdiL3Byb2plY3RzL2NsaW1hcy1nbG9iYWwvd2ViYXBwL2NsaW1hc25nL3NyYy9qcy9yZXBvcnRzL3V0aWwvc2hpbXMuanMiLCIvVXNlcnMvcHZyZHdiL3Byb2plY3RzL2NsaW1hcy1nbG9iYWwvd2ViYXBwL2NsaW1hc25nL3NyYy9qcy9yZXBvcnRzL3ZpZXdzL2FwcC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlxucmVxdWlyZSgnLi9yZXBvcnRzL21haW4nKTtcblxuIiwiKGZ1bmN0aW9uKCkge1xuICB2YXIgQXBwVmlldztcblxuICBpZiAoIXdpbmRvdy5jb25zb2xlKSB7XG4gICAgd2luZG93LmNvbnNvbGUgPSB7XG4gICAgICBsb2c6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4ge307XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIEFwcFZpZXcgPSByZXF1aXJlKCcuL3ZpZXdzL2FwcCcpO1xuXG4gICQoZnVuY3Rpb24oKSB7XG4gICAgdmFyIGFwcHZpZXc7XG4gICAgYXBwdmlldyA9IG5ldyBBcHBWaWV3KCk7XG4gICAgcmV0dXJuIGFwcHZpZXcucmVuZGVyKCk7XG4gIH0pO1xuXG59KS5jYWxsKHRoaXMpO1xuIiwiKGZ1bmN0aW9uKCkge1xuICB2YXIgX19pbmRleE9mID0gW10uaW5kZXhPZiB8fCBmdW5jdGlvbihpdGVtKSB7IGZvciAodmFyIGkgPSAwLCBsID0gdGhpcy5sZW5ndGg7IGkgPCBsOyBpKyspIHsgaWYgKGkgaW4gdGhpcyAmJiB0aGlzW2ldID09PSBpdGVtKSByZXR1cm4gaTsgfSByZXR1cm4gLTE7IH07XG5cbiAgaWYgKCFBcnJheS5wcm90b3R5cGUuZm9yRWFjaCkge1xuICAgIEFycmF5LnByb3RvdHlwZS5mb3JFYWNoID0gZnVuY3Rpb24oZm4sIHNjb3BlKSB7XG4gICAgICB2YXIgaSwgX2ksIF9yZWYsIF9yZXN1bHRzO1xuICAgICAgX3Jlc3VsdHMgPSBbXTtcbiAgICAgIGZvciAoaSA9IF9pID0gMCwgX3JlZiA9IHRoaXMubGVuZ3RoOyAwIDw9IF9yZWYgPyBfaSA8PSBfcmVmIDogX2kgPj0gX3JlZjsgaSA9IDAgPD0gX3JlZiA/ICsrX2kgOiAtLV9pKSB7XG4gICAgICAgIF9yZXN1bHRzLnB1c2goX19pbmRleE9mLmNhbGwodGhpcywgaSkgPj0gMCA/IGZuLmNhbGwoc2NvcGUsIHRoaXNbaV0sIGksIHRoaXMpIDogdm9pZCAwKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBfcmVzdWx0cztcbiAgICB9O1xuICB9XG5cbiAgaWYgKCFBcnJheS5wcm90b3R5cGUuaW5kZXhPZikge1xuICAgIEFycmF5LnByb3RvdHlwZS5pbmRleE9mID0gZnVuY3Rpb24obmVlZGxlKSB7XG4gICAgICB2YXIgaSwgX2ksIF9yZWY7XG4gICAgICBmb3IgKGkgPSBfaSA9IDAsIF9yZWYgPSB0aGlzLmxlbmd0aDsgMCA8PSBfcmVmID8gX2kgPD0gX3JlZiA6IF9pID49IF9yZWY7IGkgPSAwIDw9IF9yZWYgPyArK19pIDogLS1faSkge1xuICAgICAgICBpZiAodGhpc1tpXSA9PT0gbmVlZGxlKSB7XG4gICAgICAgICAgcmV0dXJuIGk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiAtMTtcbiAgICB9O1xuICB9XG5cbn0pLmNhbGwodGhpcyk7XG4iLCIoZnVuY3Rpb24oKSB7XG4gIHZhciBBcHBWaWV3LCBkZWJ1ZztcblxuICByZXF1aXJlKCcuLi91dGlsL3NoaW1zJyk7XG5cblxuICAvKiBqc2hpbnQgLVcwOTMgKi9cblxuXG4gIC8qIGpzaGludCAtVzA0MSAqL1xuXG4gIGRlYnVnID0gZnVuY3Rpb24oaXRlbVRvTG9nLCBpdGVtTGV2ZWwpIHtcbiAgICB2YXIgbGV2ZWxzLCBtZXNzYWdlTnVtLCB0aHJlc2hvbGQsIHRocmVzaG9sZE51bTtcbiAgICBsZXZlbHMgPSBbJ3ZlcnlkZWJ1ZycsICdkZWJ1ZycsICdtZXNzYWdlJywgJ3dhcm5pbmcnXTtcbiAgICB0aHJlc2hvbGQgPSAnbWVzc2FnZSc7XG4gICAgaWYgKCFpdGVtTGV2ZWwpIHtcbiAgICAgIGl0ZW1MZXZlbCA9ICdkZWJ1Zyc7XG4gICAgfVxuICAgIHRocmVzaG9sZE51bSA9IGxldmVscy5pbmRleE9mKHRocmVzaG9sZCk7XG4gICAgbWVzc2FnZU51bSA9IGxldmVscy5pbmRleE9mKGl0ZW1MZXZlbCk7XG4gICAgaWYgKHRocmVzaG9sZE51bSA+IG1lc3NhZ2VOdW0pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKGl0ZW1Ub0xvZyArICcnID09PSBpdGVtVG9Mb2cpIHtcbiAgICAgIHJldHVybiBjb25zb2xlLmxvZyhcIltcIiArIGl0ZW1MZXZlbCArIFwiXSBcIiArIGl0ZW1Ub0xvZyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBjb25zb2xlLmxvZyhpdGVtVG9Mb2cpO1xuICAgIH1cbiAgfTtcblxuICBBcHBWaWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xuICAgIHRhZ05hbWU6ICdmb3JtJyxcbiAgICBjbGFzc05hbWU6ICcnLFxuICAgIGlkOiAncmVwb3J0Zm9ybScsXG4gICAgZGF0YVVybDogXCJcIiArIGxvY2F0aW9uLnByb3RvY29sICsgXCIvL1wiICsgbG9jYXRpb24uaG9zdCArIFwiL2RhdGFcIixcbiAgICByYXN0ZXJBcGlVcmw6IFwiXCIgKyBsb2NhdGlvbi5wcm90b2NvbCArIFwiLy9sb2NhbGhvc3Q6MTA2MDAvYXBpL3Jhc3Rlci8xL3dtc19kYXRhX3VybFwiLFxuICAgIHRyYWNrU3BsaXR0ZXI6IGZhbHNlLFxuICAgIHRyYWNrUGVyaW9kOiAxMDAsXG4gICAgZXZlbnRzOiB7XG4gICAgICAnY2hhbmdlIC5zZWN0aW9uc2VsZWN0b3IgaW5wdXQnOiAndXBkYXRlU2VjdGlvblNlbGVjdGlvbicsXG4gICAgICAnY2hhbmdlIC5yZWdpb25zZWxlY3QgaW5wdXQnOiAndXBkYXRlUmVnaW9uU2VsZWN0aW9uJyxcbiAgICAgICdjaGFuZ2UgLnJlZ2lvbnNlbGVjdCBzZWxlY3QnOiAndXBkYXRlUmVnaW9uU2VsZWN0aW9uJyxcbiAgICAgICdjaGFuZ2UgLnllYXJzZWxlY3QgaW5wdXQnOiAndXBkYXRlWWVhclNlbGVjdGlvbicsXG4gICAgICAnY2xpY2sgLmdldHJlcG9ydCc6ICdnZXRSZXBvcnQnXG4gICAgfSxcbiAgICBpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciByZWdGZXRjaCwgc2VjdEZldGNoLCB5ZWFyRmV0Y2g7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5pbml0aWFsaXplJyk7XG4gICAgICBfLmJpbmRBbGwuYXBwbHkoXywgW3RoaXNdLmNvbmNhdChfLmZ1bmN0aW9ucyh0aGlzKSkpO1xuICAgICAgdGhpcy5oYXNoID0gJyc7XG4gICAgICBzZWN0RmV0Y2ggPSB0aGlzLmZldGNoUmVwb3J0U2VjdGlvbnMoKTtcbiAgICAgIHJlZ0ZldGNoID0gdGhpcy5mZXRjaFJlZ2lvbnMoKTtcbiAgICAgIHllYXJGZXRjaCA9IHRoaXMuZmV0Y2hZZWFycygpO1xuICAgICAgJC53aGVuKHNlY3RGZXRjaCwgcmVnRmV0Y2gsIHllYXJGZXRjaCkudGhlbigoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIF90aGlzLmNoZWNrSGFzaCgpO1xuICAgICAgICAgIHJldHVybiBfdGhpcy51cGRhdGVTdW1tYXJ5KCk7XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKSk7XG4gICAgICByZXR1cm4gJCh3aW5kb3cpLm9uKCdoYXNoY2hhbmdlJywgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gX3RoaXMuY2hlY2tIYXNoKCk7XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKSk7XG4gICAgfSxcbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgZGVidWcoJ0FwcFZpZXcucmVuZGVyJyk7XG4gICAgICB0aGlzLiRlbC5hcHBlbmQoQXBwVmlldy50ZW1wbGF0ZXMubGF5b3V0KHt9KSk7XG4gICAgICByZXR1cm4gJCgnI2NvbnRlbnR3cmFwIC5tYWluY29udGVudCcpLmFwcGVuZCh0aGlzLiRlbCk7XG4gICAgfSxcbiAgICBjaGVja0hhc2g6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGhhc2gsIGhhc2hEYXRhLCBrZXksIHZhbHVlO1xuICAgICAgaGFzaCA9IHdpbmRvdy5sb2NhdGlvbi5oYXNoO1xuICAgICAgaWYgKHRoaXMuaGFzaCA9PT0gaGFzaCB8fCBoYXNoLmxlbmd0aCA8IDIpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaGFzaERhdGEgPSB0aGlzLnNwbGl0SGFzaChoYXNoKTtcbiAgICAgIGZvciAoa2V5IGluIGhhc2hEYXRhKSB7XG4gICAgICAgIHZhbHVlID0gaGFzaERhdGFba2V5XTtcbiAgICAgICAgdGhpcy5hcHBseUhhc2hFbGVtZW50KGtleSwgdmFsdWUpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMuaGFzaCA9IHdpbmRvdy5sb2NhdGlvbi5oYXNoO1xuICAgIH0sXG4gICAgc3BsaXRIYXNoOiBmdW5jdGlvbihoYXNoKSB7XG4gICAgICB2YXIgaGFzaERhdGEsIGhhc2hMaXN0LCBoYXNoUGFpciwgX2ZuLCBfaSwgX2xlbjtcbiAgICAgIGhhc2hEYXRhID0ge307XG4gICAgICBoYXNoTGlzdCA9IGhhc2guc3Vic3RyaW5nKDEpLnNwbGl0KCcvJyk7XG4gICAgICBfZm4gPSAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGhhc2hQYWlyKSB7XG4gICAgICAgICAgdmFyIHBhcnRzO1xuICAgICAgICAgIHBhcnRzID0gaGFzaFBhaXIuc3BsaXQoJz0nKTtcbiAgICAgICAgICBpZiAocGFydHMubGVuZ3RoID09PSAyKSB7XG4gICAgICAgICAgICByZXR1cm4gaGFzaERhdGFbcGFydHNbMF1dID0gcGFydHNbMV07XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgfSkodGhpcyk7XG4gICAgICBmb3IgKF9pID0gMCwgX2xlbiA9IGhhc2hMaXN0Lmxlbmd0aDsgX2kgPCBfbGVuOyBfaSsrKSB7XG4gICAgICAgIGhhc2hQYWlyID0gaGFzaExpc3RbX2ldO1xuICAgICAgICBfZm4oaGFzaFBhaXIpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGhhc2hEYXRhO1xuICAgIH0sXG4gICAgYXBwbHlIYXNoRWxlbWVudDogZnVuY3Rpb24oZWxlbSwgdmFsdWUpIHtcbiAgICAgIHZhciByZWdpb250eXBlO1xuICAgICAgaWYgKGVsZW0gPT09ICdyZWdpb24nKSB7XG4gICAgICAgIHJlZ2lvbnR5cGUgPSB2YWx1ZS5zcGxpdCgnXycpWzBdO1xuICAgICAgICB0aGlzLiQoJ2lucHV0W3R5cGU9cmFkaW9dW25hbWU9cmVnaW9udHlwZV1bdmFsdWU9XCInICsgcmVnaW9udHlwZSArICdcIl0nKS5jbGljaygpO1xuICAgICAgICB0aGlzLiQoJ3NlbGVjdC5yZWdpb25zZWxlY3RvciBvcHRpb25bdmFsdWU9XCInICsgdmFsdWUgKyAnXCJdJykucGFyZW50KCkudmFsKHZhbHVlKS5jaGFuZ2UoKTtcbiAgICAgIH1cbiAgICAgIGlmIChlbGVtID09PSAneWVhcicpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuJCgnaW5wdXRbdHlwZT1yYWRpb11bbmFtZT15ZWFyXVt2YWx1ZT1cIicgKyB2YWx1ZSArICdcIl0nKS5jbGljaygpO1xuICAgICAgfVxuICAgIH0sXG4gICAgbWFrZUhhc2g6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGhhc2hJdGVtcywga2V5LCBuZXdIYXNoO1xuICAgICAgZGVidWcoJ0FwcFZpZXcubWFrZUhhc2gnKTtcbiAgICAgIGhhc2hJdGVtcyA9IHRoaXMuc3BsaXRIYXNoKHdpbmRvdy5sb2NhdGlvbi5oYXNoKTtcbiAgICAgIGlmICh0aGlzLnNlbGVjdGVkWWVhcikge1xuICAgICAgICBoYXNoSXRlbXMueWVhciA9IHRoaXMuc2VsZWN0ZWRZZWFyO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMuc2VsZWN0ZWRSZWdpb24gJiYgdGhpcy5zZWxlY3RlZFJlZ2lvbiAhPT0gJycpIHtcbiAgICAgICAgaGFzaEl0ZW1zLnJlZ2lvbiA9IHRoaXMuc2VsZWN0ZWRSZWdpb247XG4gICAgICB9XG4gICAgICBuZXdIYXNoID0gKChmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIF9yZXN1bHRzO1xuICAgICAgICBfcmVzdWx0cyA9IFtdO1xuICAgICAgICBmb3IgKGtleSBpbiBoYXNoSXRlbXMpIHtcbiAgICAgICAgICBfcmVzdWx0cy5wdXNoKGtleSArICc9JyArIGhhc2hJdGVtc1trZXldKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gX3Jlc3VsdHM7XG4gICAgICB9KSgpKS5qb2luKCcvJyk7XG4gICAgICByZXR1cm4gbG9jYXRpb24uaGFzaCA9ICcvJyArIG5ld0hhc2g7XG4gICAgfSxcbiAgICBnZXRSZXBvcnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGZvcm07XG4gICAgICBkZWJ1ZygnQXBwVmlldy5nZXRSZXBvcnQnKTtcbiAgICAgIHRoaXMuJCgnI3JlcG9ydGZvcm0nKS5yZW1vdmUoKTtcbiAgICAgIGZvcm0gPSBbXTtcbiAgICAgIGZvcm0ucHVzaCgnPGZvcm0gYWN0aW9uPVwiL3JlZ2lvbnJlcG9ydFwiIG1ldGhvZD1cImdldFwiIGlkPVwicmVwb3J0Zm9ybVwiPicpO1xuICAgICAgZm9ybS5wdXNoKCc8aW5wdXQgdHlwZT1cImhpZGRlblwiIG5hbWU9XCJ5ZWFyXCIgdmFsdWU9XCInICsgdGhpcy5zZWxlY3RlZFllYXIgKyAnXCI+Jyk7XG4gICAgICBmb3JtLnB1c2goJzxpbnB1dCB0eXBlPVwiaGlkZGVuXCIgbmFtZT1cInJlZ2lvbnR5cGVcIiB2YWx1ZT1cIicgKyB0aGlzLnNlbGVjdGVkUmVnaW9uVHlwZSArICdcIj4nKTtcbiAgICAgIGZvcm0ucHVzaCgnPGlucHV0IHR5cGU9XCJoaWRkZW5cIiBuYW1lPVwicmVnaW9uXCIgdmFsdWU9XCInICsgdGhpcy5zZWxlY3RlZFJlZ2lvbiArICdcIj4nKTtcbiAgICAgIGZvcm0ucHVzaCgnPGlucHV0IHR5cGU9XCJoaWRkZW5cIiBuYW1lPVwic2VjdGlvbnNcIiB2YWx1ZT1cIicgKyB0aGlzLnNlbGVjdGVkU2VjdGlvbnMuam9pbignICcpICsgJ1wiPicpO1xuICAgICAgZm9ybS5wdXNoKCc8L2Zvcm0+Jyk7XG4gICAgICB0aGlzLiRlbC5hcHBlbmQoZm9ybS5qb2luKCdcXG4nKSk7XG4gICAgICB0aGlzLiQoJyNyZXBvcnRmb3JtJykuc3VibWl0KCk7XG4gICAgICBpZiAoZ2EgJiYgdHlwZW9mIGdhID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHJldHVybiBnYSgnc2VuZCcsIHtcbiAgICAgICAgICAnaGl0VHlwZSc6ICdldmVudCcsXG4gICAgICAgICAgJ2V2ZW50Q2F0ZWdvcnknOiAncmVwb3J0ZG93bmxvYWQnLFxuICAgICAgICAgICdldmVudEFjdGlvbic6IHRoaXMuc2VsZWN0ZWRSZWdpb25UeXBlLFxuICAgICAgICAgICdldmVudExhYmVsJzogdGhpcy5zZWxlY3RlZFJlZ2lvbixcbiAgICAgICAgICAnZXZlbnRWYWx1ZSc6IHBhcnNlSW50KHRoaXMuc2VsZWN0ZWRZZWFyLCAxMClcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSxcbiAgICBmZXRjaFJlcG9ydFNlY3Rpb25zOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBmZXRjaDtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LmZldGNoUmVwb3J0U2VjdGlvbnMnKTtcbiAgICAgIGZldGNoID0gJC5hamF4KHRoaXMuZGF0YVVybCArICcvcmVwb3J0c2VjdGlvbnMnKTtcbiAgICAgIGZldGNoLmRvbmUoKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgdmFyIHNlY3Rpb25zZWxlY3Q7XG4gICAgICAgICAgX3RoaXMucG9zc2libGVTZWN0aW9ucyA9IGRhdGEuc2VjdGlvbnM7XG4gICAgICAgICAgc2VjdGlvbnNlbGVjdCA9IF90aGlzLiQoJy5zZWN0aW9uc2VsZWN0Jyk7XG4gICAgICAgICAgc2VjdGlvbnNlbGVjdC5lbXB0eSgpLnJlbW92ZUNsYXNzKCdsb2FkaW5nJyk7XG4gICAgICAgICAgcmV0dXJuIF90aGlzLmJ1aWxkUmVwb3J0U2VjdGlvbkxpc3QoX3RoaXMucG9zc2libGVTZWN0aW9ucywgc2VjdGlvbnNlbGVjdCk7XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKSk7XG4gICAgICByZXR1cm4gZmV0Y2gucHJvbWlzZSgpO1xuICAgIH0sXG4gICAgYnVpbGRSZXBvcnRTZWN0aW9uTGlzdDogZnVuY3Rpb24oZGF0YSwgd3JhcHBlcikge1xuICAgICAgZGVidWcoJ0FwcFZpZXcuYnVpbGRSZXBvcnRTZWN0aW9uTGlzdCcpO1xuICAgICAgJC5lYWNoKGRhdGEsIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oaW5kZXgsIGl0ZW0pIHtcbiAgICAgICAgICB2YXIgc2VsZWN0b3JSb3csIHN1YnNlY3Rpb25zO1xuICAgICAgICAgIHNlbGVjdG9yUm93ID0gJChBcHBWaWV3LnRlbXBsYXRlcy5zZWN0aW9uU2VsZWN0b3IoaXRlbSkpO1xuICAgICAgICAgICQod3JhcHBlcikuYXBwZW5kKHNlbGVjdG9yUm93KTtcbiAgICAgICAgICBpZiAoaXRlbS5zZWN0aW9ucy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBzdWJzZWN0aW9ucyA9ICQoQXBwVmlldy50ZW1wbGF0ZXMuc3Vic2VjdGlvbnMoKSk7XG4gICAgICAgICAgICBfdGhpcy5idWlsZFJlcG9ydFNlY3Rpb25MaXN0KGl0ZW0uc2VjdGlvbnMsIHN1YnNlY3Rpb25zKTtcbiAgICAgICAgICAgIHJldHVybiAkKHNlbGVjdG9yUm93KS5hZGRDbGFzcygnaGFzc3Vic2VjdGlvbnMnKS5hcHBlbmQoc3Vic2VjdGlvbnMpO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKTtcbiAgICAgIHJldHVybiB0aGlzLnVwZGF0ZVN1bW1hcnkoKTtcbiAgICB9LFxuICAgIHVwZGF0ZVNlY3Rpb25TZWxlY3Rpb246IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICBkZWJ1ZygnQXBwVmlldy51cGRhdGVTZWN0aW9uU2VsZWN0aW9uJyk7XG4gICAgICByZXR1cm4gdGhpcy5oYW5kbGVTZWN0aW9uU2VsZWN0aW9uKHRoaXMucG9zc2libGVTZWN0aW9ucyk7XG4gICAgfSxcbiAgICBoYW5kbGVTZWN0aW9uU2VsZWN0aW9uOiBmdW5jdGlvbihzZWN0aW9uTGlzdCwgcGFyZW50KSB7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5oYW5kbGVTZWN0aW9uU2VsZWN0aW9uJyk7XG4gICAgICAkLmVhY2goc2VjdGlvbkxpc3QsIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oaW5kZXgsIGl0ZW0pIHtcbiAgICAgICAgICB2YXIgc2VsZWN0aW9uQ29udHJvbCwgc2VsZWN0b3IsIF9yZWY7XG4gICAgICAgICAgc2VsZWN0b3IgPSBfdGhpcy4kKFwiI3NlY3Rpb24tXCIgKyAoaXRlbS5pZC5yZXBsYWNlKC9cXC4vZywgJ1xcXFwuJykpKTtcbiAgICAgICAgICBzZWxlY3Rpb25Db250cm9sID0gc2VsZWN0b3IuZmluZCgnaW5wdXQnKTtcbiAgICAgICAgICBpZiAoc2VsZWN0aW9uQ29udHJvbC5wcm9wKCdjaGVja2VkJykpIHtcbiAgICAgICAgICAgIHNlbGVjdG9yLnJlbW92ZUNsYXNzKCd1bnNlbGVjdGVkJyk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNlbGVjdG9yLmFkZENsYXNzKCd1bnNlbGVjdGVkJyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICgoKF9yZWYgPSBpdGVtLnNlY3Rpb25zKSAhPSBudWxsID8gX3JlZi5sZW5ndGggOiB2b2lkIDApID4gMCkge1xuICAgICAgICAgICAgcmV0dXJuIF90aGlzLmhhbmRsZVNlY3Rpb25TZWxlY3Rpb24oaXRlbS5zZWN0aW9ucywgaXRlbS5pZCk7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpO1xuICAgICAgcmV0dXJuIHRoaXMudXBkYXRlU3VtbWFyeSgpO1xuICAgIH0sXG4gICAgZmV0Y2hSZWdpb25zOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBmZXRjaDtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LmZldGNoUmVnaW9ucycpO1xuICAgICAgZmV0Y2ggPSAkLmFqYXgodGhpcy5kYXRhVXJsICsgJy9yZXBvcnRyZWdpb25zJyk7XG4gICAgICBmZXRjaC5kb25lKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgIHJldHVybiBfdGhpcy5idWlsZFJlZ2lvbkxpc3QoZGF0YSk7XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKSk7XG4gICAgICByZXR1cm4gZmV0Y2gucHJvbWlzZSgpO1xuICAgIH0sXG4gICAgYnVpbGRSZWdpb25MaXN0OiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICB2YXIgcmVnaW9uc2VsZWN0O1xuICAgICAgZGVidWcoJ0FwcFZpZXcuYnVpbGRSZWdpb25MaXN0Jyk7XG4gICAgICB0aGlzLnJlZ2lvbnMgPSBkYXRhLnJlZ2lvbnR5cGVzO1xuICAgICAgcmVnaW9uc2VsZWN0ID0gdGhpcy4kKCcucmVnaW9uc2VsZWN0Jyk7XG4gICAgICByZWdpb25zZWxlY3QuZW1wdHkoKS5yZW1vdmVDbGFzcygnbG9hZGluZycpO1xuICAgICAgJC5lYWNoKHRoaXMucmVnaW9ucywgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihpbmRleCwgcmVnaW9uVHlwZSkge1xuICAgICAgICAgIHZhciByZWcsIHJlZ2lvblR5cGVSb3c7XG4gICAgICAgICAgcmVnaW9uVHlwZS5vcHRpb25MaXN0ID0gW1xuICAgICAgICAgICAgKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICB2YXIgX2ksIF9sZW4sIF9yZWYsIF9yZXN1bHRzO1xuICAgICAgICAgICAgICBfcmVmID0gcmVnaW9uVHlwZS5yZWdpb25zO1xuICAgICAgICAgICAgICBfcmVzdWx0cyA9IFtdO1xuICAgICAgICAgICAgICBmb3IgKF9pID0gMCwgX2xlbiA9IF9yZWYubGVuZ3RoOyBfaSA8IF9sZW47IF9pKyspIHtcbiAgICAgICAgICAgICAgICByZWcgPSBfcmVmW19pXTtcbiAgICAgICAgICAgICAgICBfcmVzdWx0cy5wdXNoKEFwcFZpZXcudGVtcGxhdGVzLnJlZ2lvblNlbGVjdG9yKHJlZykpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHJldHVybiBfcmVzdWx0cztcbiAgICAgICAgICAgIH0pKClcbiAgICAgICAgICBdLmpvaW4oXCJcXG5cIik7XG4gICAgICAgICAgcmVnaW9uVHlwZVJvdyA9ICQoQXBwVmlldy50ZW1wbGF0ZXMucmVnaW9uVHlwZVNlbGVjdG9yKHJlZ2lvblR5cGUpKTtcbiAgICAgICAgICByZXR1cm4gcmVnaW9uc2VsZWN0LmFwcGVuZChyZWdpb25UeXBlUm93KTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKTtcbiAgICAgIHJldHVybiB0aGlzLnVwZGF0ZVN1bW1hcnkoKTtcbiAgICB9LFxuICAgIHVwZGF0ZVJlZ2lvblNlbGVjdGlvbjogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgIHZhciBzZWxlY3RlZFR5cGU7XG4gICAgICBkZWJ1ZygnQXBwVmlldy51cGRhdGVSZWdpb25TZWxlY3Rpb24nKTtcbiAgICAgIHNlbGVjdGVkVHlwZSA9IHRoaXMuJCgnW25hbWU9cmVnaW9udHlwZV06Y2hlY2tlZCcpLnZhbCgpO1xuICAgICAgJC5lYWNoKHRoaXMucmVnaW9ucywgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihpbmRleCwgcmVnaW9uVHlwZSkge1xuICAgICAgICAgIHZhciBzZWxlY3RvcjtcbiAgICAgICAgICBzZWxlY3RvciA9IF90aGlzLiQoXCIjcmVnaW9udHlwZS1cIiArIHJlZ2lvblR5cGUuaWQpO1xuICAgICAgICAgIGlmIChzZWxlY3RlZFR5cGUgPT09IHJlZ2lvblR5cGUuaWQpIHtcbiAgICAgICAgICAgIHNlbGVjdG9yLmFkZENsYXNzKCd0eXBlc2VsZWN0ZWQnKTtcbiAgICAgICAgICAgIF90aGlzLnNlbGVjdGVkUmVnaW9uVHlwZSA9IHJlZ2lvblR5cGUuaWQ7XG4gICAgICAgICAgICBfdGhpcy5zZWxlY3RlZFJlZ2lvbiA9ICQoc2VsZWN0b3IuZmluZCgnc2VsZWN0JykpLnZhbCgpO1xuICAgICAgICAgICAgaWYgKF90aGlzLnNlbGVjdGVkUmVnaW9uID09PSAnJykge1xuICAgICAgICAgICAgICByZXR1cm4gc2VsZWN0b3IucmVtb3ZlQ2xhc3MoJ3JlZ2lvbnNlbGVjdGVkJyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBzZWxlY3Rvci5hZGRDbGFzcygncmVnaW9uc2VsZWN0ZWQnKTtcbiAgICAgICAgICAgICAgcmV0dXJuIF90aGlzLnNlbGVjdGVkUmVnaW9uSW5mbyA9IF8uZmluZChyZWdpb25UeXBlLnJlZ2lvbnMsIGZ1bmN0aW9uKHJlZ2lvbikge1xuICAgICAgICAgICAgICAgIHJldHVybiByZWdpb24uaWQgPT09IF90aGlzLnNlbGVjdGVkUmVnaW9uO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHNlbGVjdG9yLnJlbW92ZUNsYXNzKCd0eXBlc2VsZWN0ZWQnKTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKSk7XG4gICAgICByZXR1cm4gdGhpcy51cGRhdGVTdW1tYXJ5KCk7XG4gICAgfSxcbiAgICBmZXRjaFllYXJzOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBmZXRjaDtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LmZldGNoWWVhcnMnKTtcbiAgICAgIGZldGNoID0gJC5EZWZlcnJlZCgpO1xuICAgICAgZmV0Y2guZG9uZSgoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICByZXR1cm4gX3RoaXMuYnVpbGRZZWFyTGlzdChkYXRhKTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKTtcbiAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBmZXRjaC5yZXNvbHZlKHtcbiAgICAgICAgICB5ZWFyczogWycyMDI1JywgJzIwMzUnLCAnMjA0NScsICcyMDU1JywgJzIwNjUnLCAnMjA3NScsICcyMDg1J11cbiAgICAgICAgfSk7XG4gICAgICB9LCA1MCArICg1MCAqIE1hdGgucmFuZG9tKCkpKTtcbiAgICAgIHJldHVybiBmZXRjaC5wcm9taXNlKCk7XG4gICAgfSxcbiAgICBidWlsZFllYXJMaXN0OiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICB2YXIgeWVhcnNlbGVjdDtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LmJ1aWxkWWVhckxpc3QnKTtcbiAgICAgIHRoaXMueWVhcnMgPSBkYXRhLnllYXJzO1xuICAgICAgeWVhcnNlbGVjdCA9IHRoaXMuJCgnLnllYXJzZWxlY3QnKTtcbiAgICAgIHllYXJzZWxlY3QuZW1wdHkoKS5yZW1vdmVDbGFzcygnbG9hZGluZycpO1xuICAgICAgJC5lYWNoKHRoaXMueWVhcnMsIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oaW5kZXgsIHllYXIpIHtcbiAgICAgICAgICByZXR1cm4geWVhcnNlbGVjdC5hcHBlbmQoQXBwVmlldy50ZW1wbGF0ZXMueWVhclNlbGVjdG9yKHtcbiAgICAgICAgICAgIHllYXI6IHllYXJcbiAgICAgICAgICB9KSk7XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKSk7XG4gICAgICByZXR1cm4gdGhpcy51cGRhdGVTdW1tYXJ5KCk7XG4gICAgfSxcbiAgICB1cGRhdGVZZWFyU2VsZWN0aW9uOiBmdW5jdGlvbihldmVudCkge1xuICAgICAgZGVidWcoJ0FwcFZpZXcudXBkYXRlWWVhclNlbGVjdGlvbicpO1xuICAgICAgdGhpcy5zZWxlY3RlZFllYXIgPSB0aGlzLiQoJ1tuYW1lPXllYXJdOmNoZWNrZWQnKS52YWwoKTtcbiAgICAgICQuZWFjaCh0aGlzLnllYXJzLCAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGluZGV4LCB5ZWFyKSB7XG4gICAgICAgICAgdmFyIHNlbGVjdG9yO1xuICAgICAgICAgIHNlbGVjdG9yID0gX3RoaXMuJChcIiN5ZWFyLVwiICsgeWVhcik7XG4gICAgICAgICAgaWYgKF90aGlzLnNlbGVjdGVkWWVhciA9PT0geWVhcikge1xuICAgICAgICAgICAgcmV0dXJuIHNlbGVjdG9yLmFkZENsYXNzKCd5ZWFyc2VsZWN0ZWQnKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHNlbGVjdG9yLnJlbW92ZUNsYXNzKCd5ZWFyc2VsZWN0ZWQnKTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKSk7XG4gICAgICByZXR1cm4gdGhpcy51cGRhdGVTdW1tYXJ5KCk7XG4gICAgfSxcbiAgICBzZWN0aW9uSWQ6IGZ1bmN0aW9uKHNlY3Rpb25Eb20pIHtcbiAgICAgIHJldHVybiAkKHNlY3Rpb25Eb20pLmZpbmQoJ2lucHV0JykuYXR0cigndmFsdWUnKTtcbiAgICB9LFxuICAgIHNlY3Rpb25OYW1lOiBmdW5jdGlvbihzZWN0aW9uRG9tKSB7XG4gICAgICByZXR1cm4gdGhpcy5zZWN0aW9uSW5mbyhzZWN0aW9uRG9tKS5uYW1lO1xuICAgIH0sXG4gICAgc2VjdGlvbkluZm86IGZ1bmN0aW9uKHNlY3Rpb25Eb20pIHtcbiAgICAgIHZhciBpbmZvLCBwYXJlbnRJZHMsIHBhcmVudGFnZTtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LnNlY3Rpb25JbmZvJyk7XG4gICAgICBwYXJlbnRhZ2UgPSAkKHNlY3Rpb25Eb20pLnBhcmVudHMoJy5zZWN0aW9uc2VsZWN0b3InKTtcbiAgICAgIHBhcmVudElkcyA9IHBhcmVudGFnZS5tYXAoKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihpLCBlbGVtKSB7XG4gICAgICAgICAgcmV0dXJuIF90aGlzLnNlY3Rpb25JZChlbGVtKTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKS5nZXQoKS5yZXZlcnNlKCk7XG4gICAgICBwYXJlbnRJZHMucHVzaCh0aGlzLnNlY3Rpb25JZChzZWN0aW9uRG9tKSk7XG4gICAgICB0aGlzLnNlbGVjdGVkU2VjdGlvbnMucHVzaCh0aGlzLnNlY3Rpb25JZChzZWN0aW9uRG9tKSk7XG4gICAgICBpbmZvID0ge1xuICAgICAgICBzZWN0aW9uczogdGhpcy5wb3NzaWJsZVNlY3Rpb25zXG4gICAgICB9O1xuICAgICAgcGFyZW50SWRzLmZvckVhY2goZnVuY3Rpb24oaWQpIHtcbiAgICAgICAgcmV0dXJuIGluZm8gPSBfLmZpbHRlcihpbmZvLnNlY3Rpb25zLCBmdW5jdGlvbihzZWN0aW9uKSB7XG4gICAgICAgICAgcmV0dXJuIHNlY3Rpb24uaWQgPT09IGlkO1xuICAgICAgICB9KVswXTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIGluZm87XG4gICAgfSxcbiAgICBzdWJTZWN0aW9uTGlzdDogZnVuY3Rpb24oc2VjdGlvbkRvbSkge1xuICAgICAgdmFyIGxpc3QsIHN1YnNlY3Rpb25zO1xuICAgICAgZGVidWcoJ0FwcFZpZXcuc2VjdGlvbkxpc3QnKTtcbiAgICAgIGxpc3QgPSBbXTtcbiAgICAgIHN1YnNlY3Rpb25zID0gJChzZWN0aW9uRG9tKS5jaGlsZHJlbignLnN1YnNlY3Rpb25zJyk7XG4gICAgICBzdWJzZWN0aW9ucy5jaGlsZHJlbignLnNlY3Rpb25zZWxlY3RvcicpLm5vdCgnLnVuc2VsZWN0ZWQnKS5lYWNoKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oaSwgZWxlbSkge1xuICAgICAgICAgIHZhciBuYW1lLCBzdWJzO1xuICAgICAgICAgIG5hbWUgPSBfdGhpcy5zZWN0aW9uTmFtZShlbGVtKTtcbiAgICAgICAgICBzdWJzID0gX3RoaXMuc3ViU2VjdGlvbkxpc3QoZWxlbSk7XG4gICAgICAgICAgaWYgKHN1YnMgIT09ICcnKSB7XG4gICAgICAgICAgICBuYW1lID0gbmFtZSArICcgKCcgKyBzdWJzICsgJyknO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gbGlzdC5wdXNoKG5hbWUpO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpO1xuICAgICAgcmV0dXJuIGxpc3Quam9pbignLCAnKTtcbiAgICB9LFxuICAgIHVwZGF0ZVN1bW1hcnk6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGNvbnRlbnQsIGNvbnRlbnRMaXN0LCBzZWxlY3RlZFNlY3Rpb25zLCBzdW1tYXJ5LCBfcmVmO1xuICAgICAgZGVidWcoJ0FwcFZpZXcudXBkYXRlU3VtbWFyeScpO1xuICAgICAgc2VsZWN0ZWRTZWN0aW9ucyA9IHRoaXMuJCgnLnNlY3Rpb25zZWxlY3QgPiAuc2VjdGlvbnNlbGVjdG9yJykubm90KCcudW5zZWxlY3RlZCcpO1xuICAgICAgdGhpcy5zZWxlY3RlZFNlY3Rpb25zID0gW107XG4gICAgICBjb250ZW50TGlzdCA9IFtdO1xuICAgICAgc2VsZWN0ZWRTZWN0aW9ucy5lYWNoKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oaW5kZXgsIHNlY3Rpb24pIHtcbiAgICAgICAgICB2YXIgaW5mbywgc3ViTGlzdDtcbiAgICAgICAgICBpbmZvID0gX3RoaXMuc2VjdGlvbk5hbWUoc2VjdGlvbik7XG4gICAgICAgICAgc3ViTGlzdCA9IF90aGlzLnN1YlNlY3Rpb25MaXN0KHNlY3Rpb24pO1xuICAgICAgICAgIGlmIChzdWJMaXN0ICE9PSAnJykge1xuICAgICAgICAgICAgaW5mbyA9IGluZm8gKyAnOiAnICsgc3ViTGlzdC50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gY29udGVudExpc3QucHVzaChpbmZvICsgJy4nKTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKTtcbiAgICAgIGNvbnRlbnQgPSAnJztcbiAgICAgIGlmIChjb250ZW50TGlzdC5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNvbnRlbnQgPSAnPGxpPicgKyBjb250ZW50TGlzdC5qb2luKCc8L2xpPjxsaT4nKSArICc8L2xpPic7XG4gICAgICB9XG4gICAgICBzdW1tYXJ5ID0ge1xuICAgICAgICByZWdpb25OYW1lOiAoX3JlZiA9IHRoaXMuc2VsZWN0ZWRSZWdpb25JbmZvKSAhPSBudWxsID8gX3JlZi5uYW1lIDogdm9pZCAwLFxuICAgICAgICB5ZWFyOiB0aGlzLnNlbGVjdGVkWWVhcixcbiAgICAgICAgY29udGVudDogY29udGVudFxuICAgICAgfTtcbiAgICAgIHRoaXMuJCgnLnJldmlld2Jsb2NrJykuaHRtbChBcHBWaWV3LnRlbXBsYXRlcy5yZXZpZXdCbG9jayhzdW1tYXJ5KSk7XG4gICAgICB0aGlzLiQoJy5yZXZpZXdibG9jaycpLnRvZ2dsZUNsYXNzKCdyZWdpb25zZWxlY3RlZCcsIHRoaXMuc2VsZWN0ZWRSZWdpb25JbmZvICE9PSB2b2lkIDApO1xuICAgICAgdGhpcy4kKCcucmV2aWV3YmxvY2snKS50b2dnbGVDbGFzcygneWVhcnNlbGVjdGVkJywgdGhpcy5zZWxlY3RlZFllYXIgIT09IHZvaWQgMCk7XG4gICAgICByZXR1cm4gdGhpcy5tYWtlSGFzaCgpO1xuICAgIH1cbiAgfSwge1xuICAgIHRlbXBsYXRlczoge1xuICAgICAgbGF5b3V0OiBfLnRlbXBsYXRlKFwiPGRpdiBjbGFzcz1cXFwiZm9ybWJsb2NrXFxcIj5cXG4gICAgPGgxPlJlcG9ydCBvbjwvaDE+XFxuICAgIDxkaXYgY2xhc3M9XFxcImxvYWRpbmcgc2VsZWN0IHJlZ2lvbnNlbGVjdFxcXCI+bG9hZGluZyBhdmFpbGFibGUgcmVnaW9ucy4uPC9kaXY+XFxuXFxuICAgIDxoMT5JbiB0aGUgeWVhcjwvaDE+XFxuICAgIDxkaXYgY2xhc3M9XFxcImxvYWRpbmcgc2VsZWN0IHllYXJzZWxlY3RcXFwiPmxvYWRpbmcgYXZhaWxhYmxlIHllYXJzLi48L2Rpdj5cXG5cXG4gICAgPGgxPkluY2x1ZGluZzwvaDE+XFxuICAgIDxkaXYgY2xhc3M9XFxcImxvYWRpbmcgc2VsZWN0IHNlY3Rpb25zZWxlY3RcXFwiPmxvYWRpbmcgYXZhaWxhYmxlIHNlY3Rpb25zLi48L2Rpdj5cXG48L2Rpdj5cXG48ZGl2IGNsYXNzPVxcXCJyZXZpZXdibG9ja1xcXCI+PC9kaXY+XCIpLFxuICAgICAgcmV2aWV3QmxvY2s6IF8udGVtcGxhdGUoXCI8aDE+U2VsZWN0ZWQgUmVwb3J0PC9oMT5cXG48cCBjbGFzcz1cXFwiY292ZXJhZ2VcXFwiPkNvdmVyc1xcbiAgICA8JSBpZiAocmVnaW9uTmFtZSkgeyAlPjwlPSByZWdpb25OYW1lICU+PCUgfSBlbHNlIHsgJT48ZW0+KHVuc3BlY2lmaWVkIHJlZ2lvbik8L2VtPjwlIH0gJT5cXG4gICAgaW5cXG4gICAgPCUgaWYgKHllYXIpIHsgJT48JT0geWVhciAlPi48JSB9IGVsc2UgeyAlPjxlbT4odW5zcGVjaWZpZWQgeWVhcik8L2VtPi48JSB9ICU+XFxuPC9wPlxcbjx1bCBjbGFzcz1cXFwiY29udGVudHNcXFwiPjwlPSBjb250ZW50ICU+PC91bD5cXG48YnV0dG9uIHR5cGU9XFxcImJ1dHRvblxcXCIgY2xhc3M9XFxcImdldHJlcG9ydFxcXCI+ZG93bmxvYWQgcmVwb3J0PC9idXR0b24+XCIpLFxuICAgICAgcmV2aWV3Q29udGVudEl0ZW06IF8udGVtcGxhdGUoXCI8bGk+aXRlbTwvbGk+XCIpLFxuICAgICAgcmVnaW9uVHlwZVNlbGVjdG9yOiBfLnRlbXBsYXRlKFwiPGRpdiBjbGFzcz1cXFwicmVnaW9udHlwZXNlbGVjdG9yXFxcIiBpZD1cXFwicmVnaW9udHlwZS08JT0gaWQgJT5cXFwiPlxcbiAgICA8bGFiZWwgY2xhc3M9XFxcIm5hbWVcXFwiPjxpbnB1dFxcbiAgICAgICAgY2xhc3M9XFxcInJlZ2lvbnR5cGVcXFwiXFxuICAgICAgICBuYW1lPVxcXCJyZWdpb250eXBlXFxcIlxcbiAgICAgICAgdHlwZT1cXFwicmFkaW9cXFwiXFxuICAgICAgICB2YWx1ZT1cXFwiPCU9IGlkICU+XFxcIlxcbiAgICAvPiA8JT0gbmFtZSAlPlxcbiAgICA8L2xhYmVsPlxcbiAgICA8ZGl2IGNsYXNzPVxcXCJyZWdpb25zZWxlY3RvcndyYXBwZXJcXFwiPjxzZWxlY3QgY2xhc3M9XFxcInJlZ2lvbnNlbGVjdG9yXFxcIj5cXG4gICAgICAgIDxvcHRpb24gdmFsdWU9XFxcIlxcXCIgZGlzYWJsZWQ9XFxcImRpc2FibGVkXFxcIiBzZWxlY3RlZD1cXFwic2VsZWN0ZWRcXFwiPnNlbGVjdCBhIHJlZ2lvbiZoZWxsaXA7PC9vcHRpb24+XFxuICAgICAgICA8JT0gb3B0aW9uTGlzdCAlPlxcbiAgICA8L3NlbGVjdD48L2Rpdj5cXG48L2Rpdj5cIiksXG4gICAgICByZWdpb25TZWxlY3RvcjogXy50ZW1wbGF0ZShcIjxvcHRpb24gdmFsdWU9XFxcIjwlPSBpZCAlPlxcXCI+PCU9IG5hbWUgJT48L29wdGlvbj5cIiksXG4gICAgICB5ZWFyU2VsZWN0b3I6IF8udGVtcGxhdGUoXCI8ZGl2IGNsYXNzPVxcXCJ5ZWFycm93XFxcIiBpZD1cXFwieWVhci08JT0geWVhciAlPlxcXCI+XFxuICAgIDxsYWJlbCBjbGFzcz1cXFwibmFtZVxcXCI+PGlucHV0XFxuICAgICAgICBjbGFzcz1cXFwieWVhclxcXCJcXG4gICAgICAgIG5hbWU9XFxcInllYXJcXFwiXFxuICAgICAgICB0eXBlPVxcXCJyYWRpb1xcXCJcXG4gICAgICAgIHZhbHVlPVxcXCI8JT0geWVhciAlPlxcXCJcXG4gICAgLz4gPCU9IHllYXIgJT48L2xhYmVsPlxcbjwvZGl2PlwiKSxcbiAgICAgIHNlY3Rpb25TZWxlY3RvcjogXy50ZW1wbGF0ZShcIjxkaXYgY2xhc3M9XFxcInNlY3Rpb25zZWxlY3RvcjwlIGlmIChpbml0aWFsICE9ICdpbmNsdWRlZCcpIHsgcHJpbnQoJyB1bnNlbGVjdGVkJyk7IH0gJT5cXFwiIGlkPVxcXCJzZWN0aW9uLTwlPSBpZCAlPlxcXCI+XFxuICAgIDxsYWJlbCBjbGFzcz1cXFwibmFtZVxcXCJcXG4gICAgICAgIDwlIGlmIChwcmVzZW5jZSA9PSAncmVxdWlyZWQnKSB7IHByaW50KCd0aXRsZT1cXFwiVGhpcyBzZWN0aW9uIGlzIHJlcXVpcmVkXFxcIicpOyB9ICU+XFxuICAgID48aW5wdXRcXG4gICAgICAgIHR5cGU9XFxcImNoZWNrYm94XFxcIlxcbiAgICAgICAgdmFsdWU9XFxcIjwlPSBpZCAlPlxcXCJcXG4gICAgICAgIDwlIGlmIChpbml0aWFsID09ICdpbmNsdWRlZCcpIHsgcHJpbnQoJ2NoZWNrZWQ9XFxcImNoZWNrZWRcXFwiJyk7IH0gJT5cXG4gICAgICAgIDwlIGlmIChwcmVzZW5jZSA9PSAncmVxdWlyZWQnKSB7IHByaW50KCdkaXNhYmxlZD1cXFwiZGlzYWJsZWRcXFwiJyk7IH0gJT5cXG4gICAgLz4gPCU9IG5hbWUgJT48L2xhYmVsPlxcbiAgICA8cCBjbGFzcz1cXFwiZGVzY3JpcHRpb25cXFwiPjwlPSBkZXNjcmlwdGlvbiAlPjwvcD5cXG5cXG48L2Rpdj5cIiksXG4gICAgICBzdWJzZWN0aW9uczogXy50ZW1wbGF0ZShcIjxkaXYgY2xhc3M9XFxcInN1YnNlY3Rpb25zIGNsZWFyZml4XFxcIj5cXG48L2Rpdj5cIilcbiAgICB9XG4gIH0pO1xuXG4gIG1vZHVsZS5leHBvcnRzID0gQXBwVmlldztcblxufSkuY2FsbCh0aGlzKTtcbiJdfQ==
