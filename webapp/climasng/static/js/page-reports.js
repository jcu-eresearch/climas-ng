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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9wdnJkd2IvcHJvamVjdHMvY2xpbWFzLWdsb2JhbC93ZWJhcHAvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi9Vc2Vycy9wdnJkd2IvcHJvamVjdHMvY2xpbWFzLWdsb2JhbC93ZWJhcHAvY2xpbWFzbmcvc3JjL2pzL2Zha2VfMTQ2YjcxLmpzIiwiL1VzZXJzL3B2cmR3Yi9wcm9qZWN0cy9jbGltYXMtZ2xvYmFsL3dlYmFwcC9jbGltYXNuZy9zcmMvanMvcmVwb3J0cy9tYWluLmpzIiwiL1VzZXJzL3B2cmR3Yi9wcm9qZWN0cy9jbGltYXMtZ2xvYmFsL3dlYmFwcC9jbGltYXNuZy9zcmMvanMvcmVwb3J0cy91dGlsL3NoaW1zLmpzIiwiL1VzZXJzL3B2cmR3Yi9wcm9qZWN0cy9jbGltYXMtZ2xvYmFsL3dlYmFwcC9jbGltYXNuZy9zcmMvanMvcmVwb3J0cy92aWV3cy9hcHAuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcbnJlcXVpcmUoJy4vcmVwb3J0cy9tYWluJyk7XG5cbiIsIihmdW5jdGlvbigpIHtcbiAgdmFyIEFwcFZpZXc7XG5cbiAgaWYgKCF3aW5kb3cuY29uc29sZSkge1xuICAgIHdpbmRvdy5jb25zb2xlID0ge1xuICAgICAgbG9nOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHt9O1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICBBcHBWaWV3ID0gcmVxdWlyZSgnLi92aWV3cy9hcHAnKTtcblxuICAkKGZ1bmN0aW9uKCkge1xuICAgIHZhciBhcHB2aWV3O1xuICAgIGFwcHZpZXcgPSBuZXcgQXBwVmlldygpO1xuICAgIHJldHVybiBhcHB2aWV3LnJlbmRlcigpO1xuICB9KTtcblxufSkuY2FsbCh0aGlzKTtcbiIsIihmdW5jdGlvbigpIHtcbiAgdmFyIF9faW5kZXhPZiA9IFtdLmluZGV4T2YgfHwgZnVuY3Rpb24oaXRlbSkgeyBmb3IgKHZhciBpID0gMCwgbCA9IHRoaXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7IGlmIChpIGluIHRoaXMgJiYgdGhpc1tpXSA9PT0gaXRlbSkgcmV0dXJuIGk7IH0gcmV0dXJuIC0xOyB9O1xuXG4gIGlmICghQXJyYXkucHJvdG90eXBlLmZvckVhY2gpIHtcbiAgICBBcnJheS5wcm90b3R5cGUuZm9yRWFjaCA9IGZ1bmN0aW9uKGZuLCBzY29wZSkge1xuICAgICAgdmFyIGksIF9pLCBfcmVmLCBfcmVzdWx0cztcbiAgICAgIF9yZXN1bHRzID0gW107XG4gICAgICBmb3IgKGkgPSBfaSA9IDAsIF9yZWYgPSB0aGlzLmxlbmd0aDsgMCA8PSBfcmVmID8gX2kgPD0gX3JlZiA6IF9pID49IF9yZWY7IGkgPSAwIDw9IF9yZWYgPyArK19pIDogLS1faSkge1xuICAgICAgICBfcmVzdWx0cy5wdXNoKF9faW5kZXhPZi5jYWxsKHRoaXMsIGkpID49IDAgPyBmbi5jYWxsKHNjb3BlLCB0aGlzW2ldLCBpLCB0aGlzKSA6IHZvaWQgMCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gX3Jlc3VsdHM7XG4gICAgfTtcbiAgfVxuXG4gIGlmICghQXJyYXkucHJvdG90eXBlLmluZGV4T2YpIHtcbiAgICBBcnJheS5wcm90b3R5cGUuaW5kZXhPZiA9IGZ1bmN0aW9uKG5lZWRsZSkge1xuICAgICAgdmFyIGksIF9pLCBfcmVmO1xuICAgICAgZm9yIChpID0gX2kgPSAwLCBfcmVmID0gdGhpcy5sZW5ndGg7IDAgPD0gX3JlZiA/IF9pIDw9IF9yZWYgOiBfaSA+PSBfcmVmOyBpID0gMCA8PSBfcmVmID8gKytfaSA6IC0tX2kpIHtcbiAgICAgICAgaWYgKHRoaXNbaV0gPT09IG5lZWRsZSkge1xuICAgICAgICAgIHJldHVybiBpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gLTE7XG4gICAgfTtcbiAgfVxuXG59KS5jYWxsKHRoaXMpO1xuIiwiKGZ1bmN0aW9uKCkge1xuICB2YXIgQXBwVmlldywgZGVidWc7XG5cbiAgcmVxdWlyZSgnLi4vdXRpbC9zaGltcycpO1xuXG5cbiAgLyoganNoaW50IC1XMDkzICovXG5cblxuICAvKiBqc2hpbnQgLVcwNDEgKi9cblxuICBkZWJ1ZyA9IGZ1bmN0aW9uKGl0ZW1Ub0xvZywgaXRlbUxldmVsKSB7XG4gICAgdmFyIGxldmVscywgbWVzc2FnZU51bSwgdGhyZXNob2xkLCB0aHJlc2hvbGROdW07XG4gICAgbGV2ZWxzID0gWyd2ZXJ5ZGVidWcnLCAnZGVidWcnLCAnbWVzc2FnZScsICd3YXJuaW5nJ107XG4gICAgdGhyZXNob2xkID0gJ21lc3NhZ2UnO1xuICAgIGlmICghaXRlbUxldmVsKSB7XG4gICAgICBpdGVtTGV2ZWwgPSAnZGVidWcnO1xuICAgIH1cbiAgICB0aHJlc2hvbGROdW0gPSBsZXZlbHMuaW5kZXhPZih0aHJlc2hvbGQpO1xuICAgIG1lc3NhZ2VOdW0gPSBsZXZlbHMuaW5kZXhPZihpdGVtTGV2ZWwpO1xuICAgIGlmICh0aHJlc2hvbGROdW0gPiBtZXNzYWdlTnVtKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChpdGVtVG9Mb2cgKyAnJyA9PT0gaXRlbVRvTG9nKSB7XG4gICAgICByZXR1cm4gY29uc29sZS5sb2coXCJbXCIgKyBpdGVtTGV2ZWwgKyBcIl0gXCIgKyBpdGVtVG9Mb2cpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gY29uc29sZS5sb2coaXRlbVRvTG9nKTtcbiAgICB9XG4gIH07XG5cbiAgQXBwVmlldyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcbiAgICB0YWdOYW1lOiAnZm9ybScsXG4gICAgY2xhc3NOYW1lOiAnJyxcbiAgICBpZDogJ3JlcG9ydGZvcm0nLFxuICAgIGRhdGFVcmw6IFwiXCIgKyBsb2NhdGlvbi5wcm90b2NvbCArIFwiLy9cIiArIGxvY2F0aW9uLmhvc3QgKyBcIi9kYXRhXCIsXG4gICAgcmFzdGVyQXBpVXJsOiBcIlwiICsgbG9jYXRpb24ucHJvdG9jb2wgKyBcIi8vbG9jYWxob3N0OjEwNjAwL2FwaS9yYXN0ZXIvMS93bXNfZGF0YV91cmxcIixcbiAgICB0cmFja1NwbGl0dGVyOiBmYWxzZSxcbiAgICB0cmFja1BlcmlvZDogMTAwLFxuICAgIGV2ZW50czoge1xuICAgICAgJ2NoYW5nZSAuc2VjdGlvbnNlbGVjdG9yIGlucHV0JzogJ3VwZGF0ZVNlY3Rpb25TZWxlY3Rpb24nLFxuICAgICAgJ2NoYW5nZSAucmVnaW9uc2VsZWN0IGlucHV0JzogJ3VwZGF0ZVJlZ2lvblNlbGVjdGlvbicsXG4gICAgICAnY2hhbmdlIC5yZWdpb25zZWxlY3Qgc2VsZWN0JzogJ3VwZGF0ZVJlZ2lvblNlbGVjdGlvbicsXG4gICAgICAnY2hhbmdlIC55ZWFyc2VsZWN0IGlucHV0JzogJ3VwZGF0ZVllYXJTZWxlY3Rpb24nLFxuICAgICAgJ2NsaWNrIC5nZXRyZXBvcnQnOiAnZ2V0UmVwb3J0J1xuICAgIH0sXG4gICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgcmVnRmV0Y2gsIHNlY3RGZXRjaCwgeWVhckZldGNoO1xuICAgICAgZGVidWcoJ0FwcFZpZXcuaW5pdGlhbGl6ZScpO1xuICAgICAgXy5iaW5kQWxsLmFwcGx5KF8sIFt0aGlzXS5jb25jYXQoXy5mdW5jdGlvbnModGhpcykpKTtcbiAgICAgIHRoaXMuaGFzaCA9ICcnO1xuICAgICAgc2VjdEZldGNoID0gdGhpcy5mZXRjaFJlcG9ydFNlY3Rpb25zKCk7XG4gICAgICByZWdGZXRjaCA9IHRoaXMuZmV0Y2hSZWdpb25zKCk7XG4gICAgICB5ZWFyRmV0Y2ggPSB0aGlzLmZldGNoWWVhcnMoKTtcbiAgICAgICQud2hlbihzZWN0RmV0Y2gsIHJlZ0ZldGNoLCB5ZWFyRmV0Y2gpLnRoZW4oKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICBfdGhpcy5jaGVja0hhc2goKTtcbiAgICAgICAgICByZXR1cm4gX3RoaXMudXBkYXRlU3VtbWFyeSgpO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpO1xuICAgICAgcmV0dXJuICQod2luZG93KS5vbignaGFzaGNoYW5nZScsIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuIF90aGlzLmNoZWNrSGFzaCgpO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpO1xuICAgIH0sXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LnJlbmRlcicpO1xuICAgICAgdGhpcy4kZWwuYXBwZW5kKEFwcFZpZXcudGVtcGxhdGVzLmxheW91dCh7fSkpO1xuICAgICAgcmV0dXJuICQoJyNjb250ZW50d3JhcCAubWFpbmNvbnRlbnQnKS5hcHBlbmQodGhpcy4kZWwpO1xuICAgIH0sXG4gICAgY2hlY2tIYXNoOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBoYXNoLCBoYXNoRGF0YSwga2V5LCB2YWx1ZTtcbiAgICAgIGhhc2ggPSB3aW5kb3cubG9jYXRpb24uaGFzaDtcbiAgICAgIGlmICh0aGlzLmhhc2ggPT09IGhhc2ggfHwgaGFzaC5sZW5ndGggPCAyKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGhhc2hEYXRhID0gdGhpcy5zcGxpdEhhc2goaGFzaCk7XG4gICAgICBmb3IgKGtleSBpbiBoYXNoRGF0YSkge1xuICAgICAgICB2YWx1ZSA9IGhhc2hEYXRhW2tleV07XG4gICAgICAgIHRoaXMuYXBwbHlIYXNoRWxlbWVudChrZXksIHZhbHVlKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLmhhc2ggPSB3aW5kb3cubG9jYXRpb24uaGFzaDtcbiAgICB9LFxuICAgIHNwbGl0SGFzaDogZnVuY3Rpb24oaGFzaCkge1xuICAgICAgdmFyIGhhc2hEYXRhLCBoYXNoTGlzdCwgaGFzaFBhaXIsIF9mbiwgX2ksIF9sZW47XG4gICAgICBoYXNoRGF0YSA9IHt9O1xuICAgICAgaGFzaExpc3QgPSBoYXNoLnN1YnN0cmluZygxKS5zcGxpdCgnLycpO1xuICAgICAgX2ZuID0gKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihoYXNoUGFpcikge1xuICAgICAgICAgIHZhciBwYXJ0cztcbiAgICAgICAgICBwYXJ0cyA9IGhhc2hQYWlyLnNwbGl0KCc9Jyk7XG4gICAgICAgICAgaWYgKHBhcnRzLmxlbmd0aCA9PT0gMikge1xuICAgICAgICAgICAgcmV0dXJuIGhhc2hEYXRhW3BhcnRzWzBdXSA9IHBhcnRzWzFdO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpO1xuICAgICAgZm9yIChfaSA9IDAsIF9sZW4gPSBoYXNoTGlzdC5sZW5ndGg7IF9pIDwgX2xlbjsgX2krKykge1xuICAgICAgICBoYXNoUGFpciA9IGhhc2hMaXN0W19pXTtcbiAgICAgICAgX2ZuKGhhc2hQYWlyKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBoYXNoRGF0YTtcbiAgICB9LFxuICAgIGFwcGx5SGFzaEVsZW1lbnQ6IGZ1bmN0aW9uKGVsZW0sIHZhbHVlKSB7XG4gICAgICB2YXIgcmVnaW9udHlwZTtcbiAgICAgIGlmIChlbGVtID09PSAncmVnaW9uJykge1xuICAgICAgICByZWdpb250eXBlID0gdmFsdWUuc3BsaXQoJ18nKVswXTtcbiAgICAgICAgdGhpcy4kKCdpbnB1dFt0eXBlPXJhZGlvXVtuYW1lPXJlZ2lvbnR5cGVdW3ZhbHVlPVwiJyArIHJlZ2lvbnR5cGUgKyAnXCJdJykuY2xpY2soKTtcbiAgICAgICAgdGhpcy4kKCdzZWxlY3QucmVnaW9uc2VsZWN0b3Igb3B0aW9uW3ZhbHVlPVwiJyArIHZhbHVlICsgJ1wiXScpLnBhcmVudCgpLnZhbCh2YWx1ZSkuY2hhbmdlKCk7XG4gICAgICB9XG4gICAgICBpZiAoZWxlbSA9PT0gJ3llYXInKSB7XG4gICAgICAgIHJldHVybiB0aGlzLiQoJ2lucHV0W3R5cGU9cmFkaW9dW25hbWU9eWVhcl1bdmFsdWU9XCInICsgdmFsdWUgKyAnXCJdJykuY2xpY2soKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIG1ha2VIYXNoOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBoYXNoSXRlbXMsIGtleSwgbmV3SGFzaDtcbiAgICAgIGRlYnVnKCdBcHBWaWV3Lm1ha2VIYXNoJyk7XG4gICAgICBoYXNoSXRlbXMgPSB0aGlzLnNwbGl0SGFzaCh3aW5kb3cubG9jYXRpb24uaGFzaCk7XG4gICAgICBpZiAodGhpcy5zZWxlY3RlZFllYXIpIHtcbiAgICAgICAgaGFzaEl0ZW1zLnllYXIgPSB0aGlzLnNlbGVjdGVkWWVhcjtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLnNlbGVjdGVkUmVnaW9uICYmIHRoaXMuc2VsZWN0ZWRSZWdpb24gIT09ICcnKSB7XG4gICAgICAgIGhhc2hJdGVtcy5yZWdpb24gPSB0aGlzLnNlbGVjdGVkUmVnaW9uO1xuICAgICAgfVxuICAgICAgbmV3SGFzaCA9ICgoZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBfcmVzdWx0cztcbiAgICAgICAgX3Jlc3VsdHMgPSBbXTtcbiAgICAgICAgZm9yIChrZXkgaW4gaGFzaEl0ZW1zKSB7XG4gICAgICAgICAgX3Jlc3VsdHMucHVzaChrZXkgKyAnPScgKyBoYXNoSXRlbXNba2V5XSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIF9yZXN1bHRzO1xuICAgICAgfSkoKSkuam9pbignLycpO1xuICAgICAgcmV0dXJuIGxvY2F0aW9uLmhhc2ggPSAnLycgKyBuZXdIYXNoO1xuICAgIH0sXG4gICAgZ2V0UmVwb3J0OiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBmb3JtO1xuICAgICAgZGVidWcoJ0FwcFZpZXcuZ2V0UmVwb3J0Jyk7XG4gICAgICB0aGlzLiQoJyNyZXBvcnRmb3JtJykucmVtb3ZlKCk7XG4gICAgICBmb3JtID0gW107XG4gICAgICBmb3JtLnB1c2goJzxmb3JtIGFjdGlvbj1cIi9yZWdpb25yZXBvcnRcIiBtZXRob2Q9XCJnZXRcIiBpZD1cInJlcG9ydGZvcm1cIj4nKTtcbiAgICAgIGZvcm0ucHVzaCgnPGlucHV0IHR5cGU9XCJoaWRkZW5cIiBuYW1lPVwieWVhclwiIHZhbHVlPVwiJyArIHRoaXMuc2VsZWN0ZWRZZWFyICsgJ1wiPicpO1xuICAgICAgZm9ybS5wdXNoKCc8aW5wdXQgdHlwZT1cImhpZGRlblwiIG5hbWU9XCJyZWdpb250eXBlXCIgdmFsdWU9XCInICsgdGhpcy5zZWxlY3RlZFJlZ2lvblR5cGUgKyAnXCI+Jyk7XG4gICAgICBmb3JtLnB1c2goJzxpbnB1dCB0eXBlPVwiaGlkZGVuXCIgbmFtZT1cInJlZ2lvblwiIHZhbHVlPVwiJyArIHRoaXMuc2VsZWN0ZWRSZWdpb24gKyAnXCI+Jyk7XG4gICAgICBmb3JtLnB1c2goJzxpbnB1dCB0eXBlPVwiaGlkZGVuXCIgbmFtZT1cInNlY3Rpb25zXCIgdmFsdWU9XCInICsgdGhpcy5zZWxlY3RlZFNlY3Rpb25zLmpvaW4oJyAnKSArICdcIj4nKTtcbiAgICAgIGZvcm0ucHVzaCgnPC9mb3JtPicpO1xuICAgICAgdGhpcy4kZWwuYXBwZW5kKGZvcm0uam9pbignXFxuJykpO1xuICAgICAgdGhpcy4kKCcjcmVwb3J0Zm9ybScpLnN1Ym1pdCgpO1xuICAgICAgaWYgKGdhICYmIHR5cGVvZiBnYSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICByZXR1cm4gZ2EoJ3NlbmQnLCB7XG4gICAgICAgICAgJ2hpdFR5cGUnOiAnZXZlbnQnLFxuICAgICAgICAgICdldmVudENhdGVnb3J5JzogJ3JlcG9ydGRvd25sb2FkJyxcbiAgICAgICAgICAnZXZlbnRBY3Rpb24nOiB0aGlzLnNlbGVjdGVkUmVnaW9uVHlwZSxcbiAgICAgICAgICAnZXZlbnRMYWJlbCc6IHRoaXMuc2VsZWN0ZWRSZWdpb24sXG4gICAgICAgICAgJ2V2ZW50VmFsdWUnOiBwYXJzZUludCh0aGlzLnNlbGVjdGVkWWVhciwgMTApXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0sXG4gICAgZmV0Y2hSZXBvcnRTZWN0aW9uczogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgZmV0Y2g7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5mZXRjaFJlcG9ydFNlY3Rpb25zJyk7XG4gICAgICBmZXRjaCA9ICQuYWpheCh0aGlzLmRhdGFVcmwgKyAnL3JlcG9ydHNlY3Rpb25zJyk7XG4gICAgICBmZXRjaC5kb25lKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgIHZhciBzZWN0aW9uc2VsZWN0O1xuICAgICAgICAgIF90aGlzLnBvc3NpYmxlU2VjdGlvbnMgPSBkYXRhLnNlY3Rpb25zO1xuICAgICAgICAgIHNlY3Rpb25zZWxlY3QgPSBfdGhpcy4kKCcuc2VjdGlvbnNlbGVjdCcpO1xuICAgICAgICAgIHNlY3Rpb25zZWxlY3QuZW1wdHkoKS5yZW1vdmVDbGFzcygnbG9hZGluZycpO1xuICAgICAgICAgIHJldHVybiBfdGhpcy5idWlsZFJlcG9ydFNlY3Rpb25MaXN0KF90aGlzLnBvc3NpYmxlU2VjdGlvbnMsIHNlY3Rpb25zZWxlY3QpO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpO1xuICAgICAgcmV0dXJuIGZldGNoLnByb21pc2UoKTtcbiAgICB9LFxuICAgIGJ1aWxkUmVwb3J0U2VjdGlvbkxpc3Q6IGZ1bmN0aW9uKGRhdGEsIHdyYXBwZXIpIHtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LmJ1aWxkUmVwb3J0U2VjdGlvbkxpc3QnKTtcbiAgICAgICQuZWFjaChkYXRhLCAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGluZGV4LCBpdGVtKSB7XG4gICAgICAgICAgdmFyIHNlbGVjdG9yUm93LCBzdWJzZWN0aW9ucztcbiAgICAgICAgICBzZWxlY3RvclJvdyA9ICQoQXBwVmlldy50ZW1wbGF0ZXMuc2VjdGlvblNlbGVjdG9yKGl0ZW0pKTtcbiAgICAgICAgICAkKHdyYXBwZXIpLmFwcGVuZChzZWxlY3RvclJvdyk7XG4gICAgICAgICAgaWYgKGl0ZW0uc2VjdGlvbnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgc3Vic2VjdGlvbnMgPSAkKEFwcFZpZXcudGVtcGxhdGVzLnN1YnNlY3Rpb25zKCkpO1xuICAgICAgICAgICAgX3RoaXMuYnVpbGRSZXBvcnRTZWN0aW9uTGlzdChpdGVtLnNlY3Rpb25zLCBzdWJzZWN0aW9ucyk7XG4gICAgICAgICAgICByZXR1cm4gJChzZWxlY3RvclJvdykuYWRkQ2xhc3MoJ2hhc3N1YnNlY3Rpb25zJykuYXBwZW5kKHN1YnNlY3Rpb25zKTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKSk7XG4gICAgICByZXR1cm4gdGhpcy51cGRhdGVTdW1tYXJ5KCk7XG4gICAgfSxcbiAgICB1cGRhdGVTZWN0aW9uU2VsZWN0aW9uOiBmdW5jdGlvbihldmVudCkge1xuICAgICAgZGVidWcoJ0FwcFZpZXcudXBkYXRlU2VjdGlvblNlbGVjdGlvbicpO1xuICAgICAgcmV0dXJuIHRoaXMuaGFuZGxlU2VjdGlvblNlbGVjdGlvbih0aGlzLnBvc3NpYmxlU2VjdGlvbnMpO1xuICAgIH0sXG4gICAgaGFuZGxlU2VjdGlvblNlbGVjdGlvbjogZnVuY3Rpb24oc2VjdGlvbkxpc3QsIHBhcmVudCkge1xuICAgICAgZGVidWcoJ0FwcFZpZXcuaGFuZGxlU2VjdGlvblNlbGVjdGlvbicpO1xuICAgICAgJC5lYWNoKHNlY3Rpb25MaXN0LCAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGluZGV4LCBpdGVtKSB7XG4gICAgICAgICAgdmFyIHNlbGVjdGlvbkNvbnRyb2wsIHNlbGVjdG9yLCBfcmVmO1xuICAgICAgICAgIHNlbGVjdG9yID0gX3RoaXMuJChcIiNzZWN0aW9uLVwiICsgKGl0ZW0uaWQucmVwbGFjZSgvXFwuL2csICdcXFxcLicpKSk7XG4gICAgICAgICAgc2VsZWN0aW9uQ29udHJvbCA9IHNlbGVjdG9yLmZpbmQoJ2lucHV0Jyk7XG4gICAgICAgICAgaWYgKHNlbGVjdGlvbkNvbnRyb2wucHJvcCgnY2hlY2tlZCcpKSB7XG4gICAgICAgICAgICBzZWxlY3Rvci5yZW1vdmVDbGFzcygndW5zZWxlY3RlZCcpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzZWxlY3Rvci5hZGRDbGFzcygndW5zZWxlY3RlZCcpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoKChfcmVmID0gaXRlbS5zZWN0aW9ucykgIT0gbnVsbCA/IF9yZWYubGVuZ3RoIDogdm9pZCAwKSA+IDApIHtcbiAgICAgICAgICAgIHJldHVybiBfdGhpcy5oYW5kbGVTZWN0aW9uU2VsZWN0aW9uKGl0ZW0uc2VjdGlvbnMsIGl0ZW0uaWQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKTtcbiAgICAgIHJldHVybiB0aGlzLnVwZGF0ZVN1bW1hcnkoKTtcbiAgICB9LFxuICAgIGZldGNoUmVnaW9uczogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgZmV0Y2g7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5mZXRjaFJlZ2lvbnMnKTtcbiAgICAgIGZldGNoID0gJC5hamF4KHRoaXMuZGF0YVVybCArICcvcmVwb3J0cmVnaW9ucycpO1xuICAgICAgZmV0Y2guZG9uZSgoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICByZXR1cm4gX3RoaXMuYnVpbGRSZWdpb25MaXN0KGRhdGEpO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpO1xuICAgICAgcmV0dXJuIGZldGNoLnByb21pc2UoKTtcbiAgICB9LFxuICAgIGJ1aWxkUmVnaW9uTGlzdDogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgdmFyIHJlZ2lvbnNlbGVjdDtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LmJ1aWxkUmVnaW9uTGlzdCcpO1xuICAgICAgdGhpcy5yZWdpb25zID0gZGF0YS5yZWdpb250eXBlcztcbiAgICAgIHJlZ2lvbnNlbGVjdCA9IHRoaXMuJCgnLnJlZ2lvbnNlbGVjdCcpO1xuICAgICAgcmVnaW9uc2VsZWN0LmVtcHR5KCkucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcnKTtcbiAgICAgICQuZWFjaCh0aGlzLnJlZ2lvbnMsIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oaW5kZXgsIHJlZ2lvblR5cGUpIHtcbiAgICAgICAgICB2YXIgcmVnLCByZWdpb25UeXBlUm93O1xuICAgICAgICAgIHJlZ2lvblR5cGUub3B0aW9uTGlzdCA9IFtcbiAgICAgICAgICAgIChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgdmFyIF9pLCBfbGVuLCBfcmVmLCBfcmVzdWx0cztcbiAgICAgICAgICAgICAgX3JlZiA9IHJlZ2lvblR5cGUucmVnaW9ucztcbiAgICAgICAgICAgICAgX3Jlc3VsdHMgPSBbXTtcbiAgICAgICAgICAgICAgZm9yIChfaSA9IDAsIF9sZW4gPSBfcmVmLmxlbmd0aDsgX2kgPCBfbGVuOyBfaSsrKSB7XG4gICAgICAgICAgICAgICAgcmVnID0gX3JlZltfaV07XG4gICAgICAgICAgICAgICAgX3Jlc3VsdHMucHVzaChBcHBWaWV3LnRlbXBsYXRlcy5yZWdpb25TZWxlY3RvcihyZWcpKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXR1cm4gX3Jlc3VsdHM7XG4gICAgICAgICAgICB9KSgpXG4gICAgICAgICAgXS5qb2luKFwiXFxuXCIpO1xuICAgICAgICAgIHJlZ2lvblR5cGVSb3cgPSAkKEFwcFZpZXcudGVtcGxhdGVzLnJlZ2lvblR5cGVTZWxlY3RvcihyZWdpb25UeXBlKSk7XG4gICAgICAgICAgcmV0dXJuIHJlZ2lvbnNlbGVjdC5hcHBlbmQocmVnaW9uVHlwZVJvdyk7XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKSk7XG4gICAgICByZXR1cm4gdGhpcy51cGRhdGVTdW1tYXJ5KCk7XG4gICAgfSxcbiAgICB1cGRhdGVSZWdpb25TZWxlY3Rpb246IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICB2YXIgc2VsZWN0ZWRUeXBlO1xuICAgICAgZGVidWcoJ0FwcFZpZXcudXBkYXRlUmVnaW9uU2VsZWN0aW9uJyk7XG4gICAgICBzZWxlY3RlZFR5cGUgPSB0aGlzLiQoJ1tuYW1lPXJlZ2lvbnR5cGVdOmNoZWNrZWQnKS52YWwoKTtcbiAgICAgICQuZWFjaCh0aGlzLnJlZ2lvbnMsIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oaW5kZXgsIHJlZ2lvblR5cGUpIHtcbiAgICAgICAgICB2YXIgc2VsZWN0b3I7XG4gICAgICAgICAgc2VsZWN0b3IgPSBfdGhpcy4kKFwiI3JlZ2lvbnR5cGUtXCIgKyByZWdpb25UeXBlLmlkKTtcbiAgICAgICAgICBpZiAoc2VsZWN0ZWRUeXBlID09PSByZWdpb25UeXBlLmlkKSB7XG4gICAgICAgICAgICBzZWxlY3Rvci5hZGRDbGFzcygndHlwZXNlbGVjdGVkJyk7XG4gICAgICAgICAgICBfdGhpcy5zZWxlY3RlZFJlZ2lvblR5cGUgPSByZWdpb25UeXBlLmlkO1xuICAgICAgICAgICAgX3RoaXMuc2VsZWN0ZWRSZWdpb24gPSAkKHNlbGVjdG9yLmZpbmQoJ3NlbGVjdCcpKS52YWwoKTtcbiAgICAgICAgICAgIGlmIChfdGhpcy5zZWxlY3RlZFJlZ2lvbiA9PT0gJycpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHNlbGVjdG9yLnJlbW92ZUNsYXNzKCdyZWdpb25zZWxlY3RlZCcpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgc2VsZWN0b3IuYWRkQ2xhc3MoJ3JlZ2lvbnNlbGVjdGVkJyk7XG4gICAgICAgICAgICAgIHJldHVybiBfdGhpcy5zZWxlY3RlZFJlZ2lvbkluZm8gPSBfLmZpbmQocmVnaW9uVHlwZS5yZWdpb25zLCBmdW5jdGlvbihyZWdpb24pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVnaW9uLmlkID09PSBfdGhpcy5zZWxlY3RlZFJlZ2lvbjtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBzZWxlY3Rvci5yZW1vdmVDbGFzcygndHlwZXNlbGVjdGVkJyk7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpO1xuICAgICAgcmV0dXJuIHRoaXMudXBkYXRlU3VtbWFyeSgpO1xuICAgIH0sXG4gICAgZmV0Y2hZZWFyczogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgZmV0Y2g7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5mZXRjaFllYXJzJyk7XG4gICAgICBmZXRjaCA9ICQuRGVmZXJyZWQoKTtcbiAgICAgIGZldGNoLmRvbmUoKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgcmV0dXJuIF90aGlzLmJ1aWxkWWVhckxpc3QoZGF0YSk7XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKSk7XG4gICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gZmV0Y2gucmVzb2x2ZSh7XG4gICAgICAgICAgeWVhcnM6IFsnMjAyNScsICcyMDM1JywgJzIwNDUnLCAnMjA1NScsICcyMDY1JywgJzIwNzUnLCAnMjA4NSddXG4gICAgICAgIH0pO1xuICAgICAgfSwgNTAgKyAoNTAgKiBNYXRoLnJhbmRvbSgpKSk7XG4gICAgICByZXR1cm4gZmV0Y2gucHJvbWlzZSgpO1xuICAgIH0sXG4gICAgYnVpbGRZZWFyTGlzdDogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgdmFyIHllYXJzZWxlY3Q7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5idWlsZFllYXJMaXN0Jyk7XG4gICAgICB0aGlzLnllYXJzID0gZGF0YS55ZWFycztcbiAgICAgIHllYXJzZWxlY3QgPSB0aGlzLiQoJy55ZWFyc2VsZWN0Jyk7XG4gICAgICB5ZWFyc2VsZWN0LmVtcHR5KCkucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcnKTtcbiAgICAgICQuZWFjaCh0aGlzLnllYXJzLCAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGluZGV4LCB5ZWFyKSB7XG4gICAgICAgICAgcmV0dXJuIHllYXJzZWxlY3QuYXBwZW5kKEFwcFZpZXcudGVtcGxhdGVzLnllYXJTZWxlY3Rvcih7XG4gICAgICAgICAgICB5ZWFyOiB5ZWFyXG4gICAgICAgICAgfSkpO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpO1xuICAgICAgcmV0dXJuIHRoaXMudXBkYXRlU3VtbWFyeSgpO1xuICAgIH0sXG4gICAgdXBkYXRlWWVhclNlbGVjdGlvbjogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LnVwZGF0ZVllYXJTZWxlY3Rpb24nKTtcbiAgICAgIHRoaXMuc2VsZWN0ZWRZZWFyID0gdGhpcy4kKCdbbmFtZT15ZWFyXTpjaGVja2VkJykudmFsKCk7XG4gICAgICAkLmVhY2godGhpcy55ZWFycywgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihpbmRleCwgeWVhcikge1xuICAgICAgICAgIHZhciBzZWxlY3RvcjtcbiAgICAgICAgICBzZWxlY3RvciA9IF90aGlzLiQoXCIjeWVhci1cIiArIHllYXIpO1xuICAgICAgICAgIGlmIChfdGhpcy5zZWxlY3RlZFllYXIgPT09IHllYXIpIHtcbiAgICAgICAgICAgIHJldHVybiBzZWxlY3Rvci5hZGRDbGFzcygneWVhcnNlbGVjdGVkJyk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBzZWxlY3Rvci5yZW1vdmVDbGFzcygneWVhcnNlbGVjdGVkJyk7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpO1xuICAgICAgcmV0dXJuIHRoaXMudXBkYXRlU3VtbWFyeSgpO1xuICAgIH0sXG4gICAgc2VjdGlvbklkOiBmdW5jdGlvbihzZWN0aW9uRG9tKSB7XG4gICAgICByZXR1cm4gJChzZWN0aW9uRG9tKS5maW5kKCdpbnB1dCcpLmF0dHIoJ3ZhbHVlJyk7XG4gICAgfSxcbiAgICBzZWN0aW9uTmFtZTogZnVuY3Rpb24oc2VjdGlvbkRvbSkge1xuICAgICAgcmV0dXJuIHRoaXMuc2VjdGlvbkluZm8oc2VjdGlvbkRvbSkubmFtZTtcbiAgICB9LFxuICAgIHNlY3Rpb25JbmZvOiBmdW5jdGlvbihzZWN0aW9uRG9tKSB7XG4gICAgICB2YXIgaW5mbywgcGFyZW50SWRzLCBwYXJlbnRhZ2U7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5zZWN0aW9uSW5mbycpO1xuICAgICAgcGFyZW50YWdlID0gJChzZWN0aW9uRG9tKS5wYXJlbnRzKCcuc2VjdGlvbnNlbGVjdG9yJyk7XG4gICAgICBwYXJlbnRJZHMgPSBwYXJlbnRhZ2UubWFwKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oaSwgZWxlbSkge1xuICAgICAgICAgIHJldHVybiBfdGhpcy5zZWN0aW9uSWQoZWxlbSk7XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKSkuZ2V0KCkucmV2ZXJzZSgpO1xuICAgICAgcGFyZW50SWRzLnB1c2godGhpcy5zZWN0aW9uSWQoc2VjdGlvbkRvbSkpO1xuICAgICAgdGhpcy5zZWxlY3RlZFNlY3Rpb25zLnB1c2godGhpcy5zZWN0aW9uSWQoc2VjdGlvbkRvbSkpO1xuICAgICAgaW5mbyA9IHtcbiAgICAgICAgc2VjdGlvbnM6IHRoaXMucG9zc2libGVTZWN0aW9uc1xuICAgICAgfTtcbiAgICAgIHBhcmVudElkcy5mb3JFYWNoKGZ1bmN0aW9uKGlkKSB7XG4gICAgICAgIHJldHVybiBpbmZvID0gXy5maWx0ZXIoaW5mby5zZWN0aW9ucywgZnVuY3Rpb24oc2VjdGlvbikge1xuICAgICAgICAgIHJldHVybiBzZWN0aW9uLmlkID09PSBpZDtcbiAgICAgICAgfSlbMF07XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBpbmZvO1xuICAgIH0sXG4gICAgc3ViU2VjdGlvbkxpc3Q6IGZ1bmN0aW9uKHNlY3Rpb25Eb20pIHtcbiAgICAgIHZhciBsaXN0LCBzdWJzZWN0aW9ucztcbiAgICAgIGRlYnVnKCdBcHBWaWV3LnNlY3Rpb25MaXN0Jyk7XG4gICAgICBsaXN0ID0gW107XG4gICAgICBzdWJzZWN0aW9ucyA9ICQoc2VjdGlvbkRvbSkuY2hpbGRyZW4oJy5zdWJzZWN0aW9ucycpO1xuICAgICAgc3Vic2VjdGlvbnMuY2hpbGRyZW4oJy5zZWN0aW9uc2VsZWN0b3InKS5ub3QoJy51bnNlbGVjdGVkJykuZWFjaCgoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGksIGVsZW0pIHtcbiAgICAgICAgICB2YXIgbmFtZSwgc3VicztcbiAgICAgICAgICBuYW1lID0gX3RoaXMuc2VjdGlvbk5hbWUoZWxlbSk7XG4gICAgICAgICAgc3VicyA9IF90aGlzLnN1YlNlY3Rpb25MaXN0KGVsZW0pO1xuICAgICAgICAgIGlmIChzdWJzICE9PSAnJykge1xuICAgICAgICAgICAgbmFtZSA9IG5hbWUgKyAnICgnICsgc3VicyArICcpJztcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGxpc3QucHVzaChuYW1lKTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKTtcbiAgICAgIHJldHVybiBsaXN0LmpvaW4oJywgJyk7XG4gICAgfSxcbiAgICB1cGRhdGVTdW1tYXJ5OiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBjb250ZW50LCBjb250ZW50TGlzdCwgc2VsZWN0ZWRTZWN0aW9ucywgc3VtbWFyeSwgX3JlZjtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LnVwZGF0ZVN1bW1hcnknKTtcbiAgICAgIHNlbGVjdGVkU2VjdGlvbnMgPSB0aGlzLiQoJy5zZWN0aW9uc2VsZWN0ID4gLnNlY3Rpb25zZWxlY3RvcicpLm5vdCgnLnVuc2VsZWN0ZWQnKTtcbiAgICAgIHRoaXMuc2VsZWN0ZWRTZWN0aW9ucyA9IFtdO1xuICAgICAgY29udGVudExpc3QgPSBbXTtcbiAgICAgIHNlbGVjdGVkU2VjdGlvbnMuZWFjaCgoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGluZGV4LCBzZWN0aW9uKSB7XG4gICAgICAgICAgdmFyIGluZm8sIHN1Ykxpc3Q7XG4gICAgICAgICAgaW5mbyA9IF90aGlzLnNlY3Rpb25OYW1lKHNlY3Rpb24pO1xuICAgICAgICAgIHN1Ykxpc3QgPSBfdGhpcy5zdWJTZWN0aW9uTGlzdChzZWN0aW9uKTtcbiAgICAgICAgICBpZiAoc3ViTGlzdCAhPT0gJycpIHtcbiAgICAgICAgICAgIGluZm8gPSBpbmZvICsgJzogJyArIHN1Ykxpc3QudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGNvbnRlbnRMaXN0LnB1c2goaW5mbyArICcuJyk7XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKSk7XG4gICAgICBjb250ZW50ID0gJyc7XG4gICAgICBpZiAoY29udGVudExpc3QubGVuZ3RoID4gMCkge1xuICAgICAgICBjb250ZW50ID0gJzxsaT4nICsgY29udGVudExpc3Quam9pbignPC9saT48bGk+JykgKyAnPC9saT4nO1xuICAgICAgfVxuICAgICAgc3VtbWFyeSA9IHtcbiAgICAgICAgcmVnaW9uTmFtZTogKF9yZWYgPSB0aGlzLnNlbGVjdGVkUmVnaW9uSW5mbykgIT0gbnVsbCA/IF9yZWYubmFtZSA6IHZvaWQgMCxcbiAgICAgICAgeWVhcjogdGhpcy5zZWxlY3RlZFllYXIsXG4gICAgICAgIGNvbnRlbnQ6IGNvbnRlbnRcbiAgICAgIH07XG4gICAgICB0aGlzLiQoJy5yZXZpZXdibG9jaycpLmh0bWwoQXBwVmlldy50ZW1wbGF0ZXMucmV2aWV3QmxvY2soc3VtbWFyeSkpO1xuICAgICAgdGhpcy4kKCcucmV2aWV3YmxvY2snKS50b2dnbGVDbGFzcygncmVnaW9uc2VsZWN0ZWQnLCB0aGlzLnNlbGVjdGVkUmVnaW9uSW5mbyAhPT0gdm9pZCAwKTtcbiAgICAgIHRoaXMuJCgnLnJldmlld2Jsb2NrJykudG9nZ2xlQ2xhc3MoJ3llYXJzZWxlY3RlZCcsIHRoaXMuc2VsZWN0ZWRZZWFyICE9PSB2b2lkIDApO1xuICAgICAgcmV0dXJuIHRoaXMubWFrZUhhc2goKTtcbiAgICB9XG4gIH0sIHtcbiAgICB0ZW1wbGF0ZXM6IHtcbiAgICAgIGxheW91dDogXy50ZW1wbGF0ZShcIjxkaXYgY2xhc3M9XFxcImZvcm1ibG9ja1xcXCI+XFxuICAgIDxoMT5SZXBvcnQgb248L2gxPlxcbiAgICA8ZGl2IGNsYXNzPVxcXCJsb2FkaW5nIHNlbGVjdCByZWdpb25zZWxlY3RcXFwiPmxvYWRpbmcgYXZhaWxhYmxlIHJlZ2lvbnMuLjwvZGl2PlxcblxcbiAgICA8aDE+SW4gdGhlIHllYXI8L2gxPlxcbiAgICA8ZGl2IGNsYXNzPVxcXCJsb2FkaW5nIHNlbGVjdCB5ZWFyc2VsZWN0XFxcIj5sb2FkaW5nIGF2YWlsYWJsZSB5ZWFycy4uPC9kaXY+XFxuXFxuICAgIDxoMT5JbmNsdWRpbmc8L2gxPlxcbiAgICA8ZGl2IGNsYXNzPVxcXCJsb2FkaW5nIHNlbGVjdCBzZWN0aW9uc2VsZWN0XFxcIj5sb2FkaW5nIGF2YWlsYWJsZSBzZWN0aW9ucy4uPC9kaXY+XFxuPC9kaXY+XFxuPGRpdiBjbGFzcz1cXFwicmV2aWV3YmxvY2tcXFwiPjwvZGl2PlwiKSxcbiAgICAgIHJldmlld0Jsb2NrOiBfLnRlbXBsYXRlKFwiPGgxPlNlbGVjdGVkIFJlcG9ydDwvaDE+XFxuPHAgY2xhc3M9XFxcImNvdmVyYWdlXFxcIj5Db3ZlcnNcXG4gICAgPCUgaWYgKHJlZ2lvbk5hbWUpIHsgJT48JT0gcmVnaW9uTmFtZSAlPjwlIH0gZWxzZSB7ICU+PGVtPih1bnNwZWNpZmllZCByZWdpb24pPC9lbT48JSB9ICU+XFxuICAgIGluXFxuICAgIDwlIGlmICh5ZWFyKSB7ICU+PCU9IHllYXIgJT4uPCUgfSBlbHNlIHsgJT48ZW0+KHVuc3BlY2lmaWVkIHllYXIpPC9lbT4uPCUgfSAlPlxcbjwvcD5cXG48dWwgY2xhc3M9XFxcImNvbnRlbnRzXFxcIj48JT0gY29udGVudCAlPjwvdWw+XFxuPGJ1dHRvbiB0eXBlPVxcXCJidXR0b25cXFwiIGNsYXNzPVxcXCJnZXRyZXBvcnRcXFwiPmRvd25sb2FkIHJlcG9ydDwvYnV0dG9uPlwiKSxcbiAgICAgIHJldmlld0NvbnRlbnRJdGVtOiBfLnRlbXBsYXRlKFwiPGxpPml0ZW08L2xpPlwiKSxcbiAgICAgIHJlZ2lvblR5cGVTZWxlY3RvcjogXy50ZW1wbGF0ZShcIjxkaXYgY2xhc3M9XFxcInJlZ2lvbnR5cGVzZWxlY3RvclxcXCIgaWQ9XFxcInJlZ2lvbnR5cGUtPCU9IGlkICU+XFxcIj5cXG4gICAgPGxhYmVsIGNsYXNzPVxcXCJuYW1lXFxcIj48aW5wdXRcXG4gICAgICAgIGNsYXNzPVxcXCJyZWdpb250eXBlXFxcIlxcbiAgICAgICAgbmFtZT1cXFwicmVnaW9udHlwZVxcXCJcXG4gICAgICAgIHR5cGU9XFxcInJhZGlvXFxcIlxcbiAgICAgICAgdmFsdWU9XFxcIjwlPSBpZCAlPlxcXCJcXG4gICAgLz4gPCU9IG5hbWUgJT5cXG4gICAgPC9sYWJlbD5cXG4gICAgPGRpdiBjbGFzcz1cXFwicmVnaW9uc2VsZWN0b3J3cmFwcGVyXFxcIj48c2VsZWN0IGNsYXNzPVxcXCJyZWdpb25zZWxlY3RvclxcXCI+XFxuICAgICAgICA8b3B0aW9uIHZhbHVlPVxcXCJcXFwiIGRpc2FibGVkPVxcXCJkaXNhYmxlZFxcXCIgc2VsZWN0ZWQ9XFxcInNlbGVjdGVkXFxcIj5zZWxlY3QgYSByZWdpb24maGVsbGlwOzwvb3B0aW9uPlxcbiAgICAgICAgPCU9IG9wdGlvbkxpc3QgJT5cXG4gICAgPC9zZWxlY3Q+PC9kaXY+XFxuPC9kaXY+XCIpLFxuICAgICAgcmVnaW9uU2VsZWN0b3I6IF8udGVtcGxhdGUoXCI8b3B0aW9uIHZhbHVlPVxcXCI8JT0gaWQgJT5cXFwiPjwlPSBuYW1lICU+PC9vcHRpb24+XCIpLFxuICAgICAgeWVhclNlbGVjdG9yOiBfLnRlbXBsYXRlKFwiPGRpdiBjbGFzcz1cXFwieWVhcnJvd1xcXCIgaWQ9XFxcInllYXItPCU9IHllYXIgJT5cXFwiPlxcbiAgICA8bGFiZWwgY2xhc3M9XFxcIm5hbWVcXFwiPjxpbnB1dFxcbiAgICAgICAgY2xhc3M9XFxcInllYXJcXFwiXFxuICAgICAgICBuYW1lPVxcXCJ5ZWFyXFxcIlxcbiAgICAgICAgdHlwZT1cXFwicmFkaW9cXFwiXFxuICAgICAgICB2YWx1ZT1cXFwiPCU9IHllYXIgJT5cXFwiXFxuICAgIC8+IDwlPSB5ZWFyICU+PC9sYWJlbD5cXG48L2Rpdj5cIiksXG4gICAgICBzZWN0aW9uU2VsZWN0b3I6IF8udGVtcGxhdGUoXCI8ZGl2IGNsYXNzPVxcXCJzZWN0aW9uc2VsZWN0b3I8JSBpZiAoaW5pdGlhbCAhPSAnaW5jbHVkZWQnKSB7IHByaW50KCcgdW5zZWxlY3RlZCcpOyB9ICU+XFxcIiBpZD1cXFwic2VjdGlvbi08JT0gaWQgJT5cXFwiPlxcbiAgICA8bGFiZWwgY2xhc3M9XFxcIm5hbWVcXFwiXFxuICAgICAgICA8JSBpZiAocHJlc2VuY2UgPT0gJ3JlcXVpcmVkJykgeyBwcmludCgndGl0bGU9XFxcIlRoaXMgc2VjdGlvbiBpcyByZXF1aXJlZFxcXCInKTsgfSAlPlxcbiAgICA+PGlucHV0XFxuICAgICAgICB0eXBlPVxcXCJjaGVja2JveFxcXCJcXG4gICAgICAgIHZhbHVlPVxcXCI8JT0gaWQgJT5cXFwiXFxuICAgICAgICA8JSBpZiAoaW5pdGlhbCA9PSAnaW5jbHVkZWQnKSB7IHByaW50KCdjaGVja2VkPVxcXCJjaGVja2VkXFxcIicpOyB9ICU+XFxuICAgICAgICA8JSBpZiAocHJlc2VuY2UgPT0gJ3JlcXVpcmVkJykgeyBwcmludCgnZGlzYWJsZWQ9XFxcImRpc2FibGVkXFxcIicpOyB9ICU+XFxuICAgIC8+IDwlPSBuYW1lICU+PC9sYWJlbD5cXG4gICAgPHAgY2xhc3M9XFxcImRlc2NyaXB0aW9uXFxcIj48JT0gZGVzY3JpcHRpb24gJT48L3A+XFxuXFxuPC9kaXY+XCIpLFxuICAgICAgc3Vic2VjdGlvbnM6IF8udGVtcGxhdGUoXCI8ZGl2IGNsYXNzPVxcXCJzdWJzZWN0aW9ucyBjbGVhcmZpeFxcXCI+XFxuPC9kaXY+XCIpXG4gICAgfVxuICB9KTtcblxuICBtb2R1bGUuZXhwb3J0cyA9IEFwcFZpZXc7XG5cbn0pLmNhbGwodGhpcyk7XG4iXX0=
