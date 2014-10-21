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
      debug('AppView.initialize');
      _.bindAll.apply(_, [this].concat(_.functions(this)));
      this.fetchReportSections();
      this.fetchRegions();
      this.fetchYears();
      return this.updateSummary();
    },
    render: function() {
      debug('AppView.render');
      this.$el.append(AppView.templates.layout({}));
      return $('#contentwrap .maincontent').append(this.$el);
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
      return this.$('#reportform').submit();
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
      this.selectedYear = this.$('[name=yearselector]:checked').val();
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
      return this.$('.reviewblock').toggleClass('yearselected', this.selectedYear !== void 0);
    }
  }, {
    templates: {
      layout: _.template("<div class=\"reviewblock\"></div>\n<div class=\"formblock\">\n    <h1>Report on</h1>\n    <div class=\"loading select regionselect\">loading available regions..</div>\n\n    <h1>In the year</h1>\n    <div class=\"loading select yearselect\">loading available years..</div>\n\n    <h1>Including</h1>\n    <div class=\"loading select sectionselect\">loading available sections..</div>\n</div>"),
      reviewBlock: _.template("<h1>Selected Report</h1>\n<p class=\"coverage\">Covers\n    <% if (regionName) { %><%= regionName %><% } else { %><em>(unspecified region)</em><% } %>\n    in\n    <% if (year) { %><%= year %>.<% } else { %><em>(unspecified year)</em>.<% } %>\n</p>\n<ul class=\"contents\"><%= content %></ul>\n<button type=\"button\" class=\"getreport\">download report</button>"),
      reviewContentItem: _.template("<li>item</li>"),
      regionTypeSelector: _.template("<div class=\"regiontypeselector\" id=\"regiontype-<%= id %>\">\n    <label class=\"name\"><input\n        class=\"regiontype\"\n        name=\"regiontype\"\n        type=\"radio\"\n        value=\"<%= id %>\"\n    /> <%= name %>\n    </label>\n    <div class=\"regionselectorwrapper\"><select class=\"regionselector\">\n        <option value=\"\" disabled=\"disabled\" selected=\"selected\">select a region&hellip;</option>\n        <%= optionList %>\n    </select></div>\n</div>"),
      regionSelector: _.template("<option value=\"<%= id %>\"><%= name %></option>"),
      yearSelector: _.template("<div class=\"yearrow\" id=\"year-<%= year %>\">\n    <label class=\"name\"><input\n        class=\"yearselector\"\n        name=\"yearselector\"\n        type=\"radio\"\n        value=\"<%= year %>\"\n    /> <%= year %></label>\n</div>"),
      sectionSelector: _.template("<div class=\"sectionselector<% if (initial != 'included') { print(' unselected'); } %>\" id=\"section-<%= id %>\">\n    <label class=\"name\"\n        <% if (presence == 'required') { print('title=\"This section is required\"'); } %>\n    ><input\n        type=\"checkbox\"\n        value=\"<%= id %>\"\n        <% if (initial == 'included') { print('checked=\"checked\"'); } %>\n        <% if (presence == 'required') { print('disabled=\"disabled\"'); } %>\n    /> <%= name %></label>\n    <p class=\"description\"><%= description %></p>\n\n</div>"),
      subsections: _.template("<div class=\"subsections clearfix\">\n</div>")
    }
  });

  module.exports = AppView;

}).call(this);

},{"../util/shims":3}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9wdnJkd2IvamN1L2NuZy93ZWJhcHAvbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL3B2cmR3Yi9qY3UvY25nL3dlYmFwcC9jbGltYXNuZy9zcmMvanMvZmFrZV9mOGU2MzkxMC5qcyIsIi9Vc2Vycy9wdnJkd2IvamN1L2NuZy93ZWJhcHAvY2xpbWFzbmcvc3JjL2pzL3JlcG9ydHMvbWFpbi5qcyIsIi9Vc2Vycy9wdnJkd2IvamN1L2NuZy93ZWJhcHAvY2xpbWFzbmcvc3JjL2pzL3JlcG9ydHMvdXRpbC9zaGltcy5qcyIsIi9Vc2Vycy9wdnJkd2IvamN1L2NuZy93ZWJhcHAvY2xpbWFzbmcvc3JjL2pzL3JlcG9ydHMvdmlld3MvYXBwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlxucmVxdWlyZSgnLi9yZXBvcnRzL21haW4nKTtcblxuIiwiKGZ1bmN0aW9uKCkge1xuICB2YXIgQXBwVmlldztcblxuICBpZiAoIXdpbmRvdy5jb25zb2xlKSB7XG4gICAgd2luZG93LmNvbnNvbGUgPSB7XG4gICAgICBsb2c6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4ge307XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIEFwcFZpZXcgPSByZXF1aXJlKCcuL3ZpZXdzL2FwcCcpO1xuXG4gICQoZnVuY3Rpb24oKSB7XG4gICAgdmFyIGFwcHZpZXc7XG4gICAgYXBwdmlldyA9IG5ldyBBcHBWaWV3KCk7XG4gICAgcmV0dXJuIGFwcHZpZXcucmVuZGVyKCk7XG4gIH0pO1xuXG59KS5jYWxsKHRoaXMpO1xuIiwiKGZ1bmN0aW9uKCkge1xuICB2YXIgX19pbmRleE9mID0gW10uaW5kZXhPZiB8fCBmdW5jdGlvbihpdGVtKSB7IGZvciAodmFyIGkgPSAwLCBsID0gdGhpcy5sZW5ndGg7IGkgPCBsOyBpKyspIHsgaWYgKGkgaW4gdGhpcyAmJiB0aGlzW2ldID09PSBpdGVtKSByZXR1cm4gaTsgfSByZXR1cm4gLTE7IH07XG5cbiAgaWYgKCFBcnJheS5wcm90b3R5cGUuZm9yRWFjaCkge1xuICAgIEFycmF5LnByb3RvdHlwZS5mb3JFYWNoID0gZnVuY3Rpb24oZm4sIHNjb3BlKSB7XG4gICAgICB2YXIgaSwgX2ksIF9yZWYsIF9yZXN1bHRzO1xuICAgICAgX3Jlc3VsdHMgPSBbXTtcbiAgICAgIGZvciAoaSA9IF9pID0gMCwgX3JlZiA9IHRoaXMubGVuZ3RoOyAwIDw9IF9yZWYgPyBfaSA8PSBfcmVmIDogX2kgPj0gX3JlZjsgaSA9IDAgPD0gX3JlZiA/ICsrX2kgOiAtLV9pKSB7XG4gICAgICAgIF9yZXN1bHRzLnB1c2goX19pbmRleE9mLmNhbGwodGhpcywgaSkgPj0gMCA/IGZuLmNhbGwoc2NvcGUsIHRoaXNbaV0sIGksIHRoaXMpIDogdm9pZCAwKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBfcmVzdWx0cztcbiAgICB9O1xuICB9XG5cbiAgaWYgKCFBcnJheS5wcm90b3R5cGUuaW5kZXhPZikge1xuICAgIEFycmF5LnByb3RvdHlwZS5pbmRleE9mID0gZnVuY3Rpb24obmVlZGxlKSB7XG4gICAgICB2YXIgaSwgX2ksIF9yZWY7XG4gICAgICBmb3IgKGkgPSBfaSA9IDAsIF9yZWYgPSB0aGlzLmxlbmd0aDsgMCA8PSBfcmVmID8gX2kgPD0gX3JlZiA6IF9pID49IF9yZWY7IGkgPSAwIDw9IF9yZWYgPyArK19pIDogLS1faSkge1xuICAgICAgICBpZiAodGhpc1tpXSA9PT0gbmVlZGxlKSB7XG4gICAgICAgICAgcmV0dXJuIGk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiAtMTtcbiAgICB9O1xuICB9XG5cbn0pLmNhbGwodGhpcyk7XG4iLCIoZnVuY3Rpb24oKSB7XG4gIHZhciBBcHBWaWV3LCBkZWJ1ZztcblxuICByZXF1aXJlKCcuLi91dGlsL3NoaW1zJyk7XG5cblxuICAvKiBqc2hpbnQgLVcwOTMgKi9cblxuXG4gIC8qIGpzaGludCAtVzA0MSAqL1xuXG4gIGRlYnVnID0gZnVuY3Rpb24oaXRlbVRvTG9nLCBpdGVtTGV2ZWwpIHtcbiAgICB2YXIgbGV2ZWxzLCBtZXNzYWdlTnVtLCB0aHJlc2hvbGQsIHRocmVzaG9sZE51bTtcbiAgICBsZXZlbHMgPSBbJ3ZlcnlkZWJ1ZycsICdkZWJ1ZycsICdtZXNzYWdlJywgJ3dhcm5pbmcnXTtcbiAgICB0aHJlc2hvbGQgPSAnbWVzc2FnZSc7XG4gICAgaWYgKCFpdGVtTGV2ZWwpIHtcbiAgICAgIGl0ZW1MZXZlbCA9ICdkZWJ1Zyc7XG4gICAgfVxuICAgIHRocmVzaG9sZE51bSA9IGxldmVscy5pbmRleE9mKHRocmVzaG9sZCk7XG4gICAgbWVzc2FnZU51bSA9IGxldmVscy5pbmRleE9mKGl0ZW1MZXZlbCk7XG4gICAgaWYgKHRocmVzaG9sZE51bSA+IG1lc3NhZ2VOdW0pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKGl0ZW1Ub0xvZyArICcnID09PSBpdGVtVG9Mb2cpIHtcbiAgICAgIHJldHVybiBjb25zb2xlLmxvZyhcIltcIiArIGl0ZW1MZXZlbCArIFwiXSBcIiArIGl0ZW1Ub0xvZyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBjb25zb2xlLmxvZyhpdGVtVG9Mb2cpO1xuICAgIH1cbiAgfTtcblxuICBBcHBWaWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xuICAgIHRhZ05hbWU6ICdmb3JtJyxcbiAgICBjbGFzc05hbWU6ICcnLFxuICAgIGlkOiAncmVwb3J0Zm9ybScsXG4gICAgZGF0YVVybDogXCJcIiArIGxvY2F0aW9uLnByb3RvY29sICsgXCIvL1wiICsgbG9jYXRpb24uaG9zdCArIFwiL2RhdGFcIixcbiAgICByYXN0ZXJBcGlVcmw6IFwiXCIgKyBsb2NhdGlvbi5wcm90b2NvbCArIFwiLy9sb2NhbGhvc3Q6MTA2MDAvYXBpL3Jhc3Rlci8xL3dtc19kYXRhX3VybFwiLFxuICAgIHRyYWNrU3BsaXR0ZXI6IGZhbHNlLFxuICAgIHRyYWNrUGVyaW9kOiAxMDAsXG4gICAgZXZlbnRzOiB7XG4gICAgICAnY2hhbmdlIC5zZWN0aW9uc2VsZWN0b3IgaW5wdXQnOiAndXBkYXRlU2VjdGlvblNlbGVjdGlvbicsXG4gICAgICAnY2hhbmdlIC5yZWdpb25zZWxlY3QgaW5wdXQnOiAndXBkYXRlUmVnaW9uU2VsZWN0aW9uJyxcbiAgICAgICdjaGFuZ2UgLnJlZ2lvbnNlbGVjdCBzZWxlY3QnOiAndXBkYXRlUmVnaW9uU2VsZWN0aW9uJyxcbiAgICAgICdjaGFuZ2UgLnllYXJzZWxlY3QgaW5wdXQnOiAndXBkYXRlWWVhclNlbGVjdGlvbicsXG4gICAgICAnY2xpY2sgLmdldHJlcG9ydCc6ICdnZXRSZXBvcnQnXG4gICAgfSxcbiAgICBpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LmluaXRpYWxpemUnKTtcbiAgICAgIF8uYmluZEFsbC5hcHBseShfLCBbdGhpc10uY29uY2F0KF8uZnVuY3Rpb25zKHRoaXMpKSk7XG4gICAgICB0aGlzLmZldGNoUmVwb3J0U2VjdGlvbnMoKTtcbiAgICAgIHRoaXMuZmV0Y2hSZWdpb25zKCk7XG4gICAgICB0aGlzLmZldGNoWWVhcnMoKTtcbiAgICAgIHJldHVybiB0aGlzLnVwZGF0ZVN1bW1hcnkoKTtcbiAgICB9LFxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5yZW5kZXInKTtcbiAgICAgIHRoaXMuJGVsLmFwcGVuZChBcHBWaWV3LnRlbXBsYXRlcy5sYXlvdXQoe30pKTtcbiAgICAgIHJldHVybiAkKCcjY29udGVudHdyYXAgLm1haW5jb250ZW50JykuYXBwZW5kKHRoaXMuJGVsKTtcbiAgICB9LFxuICAgIGdldFJlcG9ydDogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgZm9ybTtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LmdldFJlcG9ydCcpO1xuICAgICAgdGhpcy4kKCcjcmVwb3J0Zm9ybScpLnJlbW92ZSgpO1xuICAgICAgZm9ybSA9IFtdO1xuICAgICAgZm9ybS5wdXNoKCc8Zm9ybSBhY3Rpb249XCIvcmVnaW9ucmVwb3J0XCIgbWV0aG9kPVwiZ2V0XCIgaWQ9XCJyZXBvcnRmb3JtXCI+Jyk7XG4gICAgICBmb3JtLnB1c2goJzxpbnB1dCB0eXBlPVwiaGlkZGVuXCIgbmFtZT1cInllYXJcIiB2YWx1ZT1cIicgKyB0aGlzLnNlbGVjdGVkWWVhciArICdcIj4nKTtcbiAgICAgIGZvcm0ucHVzaCgnPGlucHV0IHR5cGU9XCJoaWRkZW5cIiBuYW1lPVwicmVnaW9udHlwZVwiIHZhbHVlPVwiJyArIHRoaXMuc2VsZWN0ZWRSZWdpb25UeXBlICsgJ1wiPicpO1xuICAgICAgZm9ybS5wdXNoKCc8aW5wdXQgdHlwZT1cImhpZGRlblwiIG5hbWU9XCJyZWdpb25cIiB2YWx1ZT1cIicgKyB0aGlzLnNlbGVjdGVkUmVnaW9uICsgJ1wiPicpO1xuICAgICAgZm9ybS5wdXNoKCc8aW5wdXQgdHlwZT1cImhpZGRlblwiIG5hbWU9XCJzZWN0aW9uc1wiIHZhbHVlPVwiJyArIHRoaXMuc2VsZWN0ZWRTZWN0aW9ucy5qb2luKCcgJykgKyAnXCI+Jyk7XG4gICAgICBmb3JtLnB1c2goJzwvZm9ybT4nKTtcbiAgICAgIHRoaXMuJGVsLmFwcGVuZChmb3JtLmpvaW4oJ1xcbicpKTtcbiAgICAgIHJldHVybiB0aGlzLiQoJyNyZXBvcnRmb3JtJykuc3VibWl0KCk7XG4gICAgfSxcbiAgICBmZXRjaFJlcG9ydFNlY3Rpb25zOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBmZXRjaDtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LmZldGNoUmVwb3J0U2VjdGlvbnMnKTtcbiAgICAgIGZldGNoID0gJC5hamF4KHRoaXMuZGF0YVVybCArICcvcmVwb3J0c2VjdGlvbnMnKTtcbiAgICAgIGZldGNoLmRvbmUoKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgdmFyIHNlY3Rpb25zZWxlY3Q7XG4gICAgICAgICAgX3RoaXMucG9zc2libGVTZWN0aW9ucyA9IGRhdGEuc2VjdGlvbnM7XG4gICAgICAgICAgc2VjdGlvbnNlbGVjdCA9IF90aGlzLiQoJy5zZWN0aW9uc2VsZWN0Jyk7XG4gICAgICAgICAgc2VjdGlvbnNlbGVjdC5lbXB0eSgpLnJlbW92ZUNsYXNzKCdsb2FkaW5nJyk7XG4gICAgICAgICAgcmV0dXJuIF90aGlzLmJ1aWxkUmVwb3J0U2VjdGlvbkxpc3QoX3RoaXMucG9zc2libGVTZWN0aW9ucywgc2VjdGlvbnNlbGVjdCk7XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKSk7XG4gICAgICByZXR1cm4gZmV0Y2gucHJvbWlzZSgpO1xuICAgIH0sXG4gICAgYnVpbGRSZXBvcnRTZWN0aW9uTGlzdDogZnVuY3Rpb24oZGF0YSwgd3JhcHBlcikge1xuICAgICAgZGVidWcoJ0FwcFZpZXcuYnVpbGRSZXBvcnRTZWN0aW9uTGlzdCcpO1xuICAgICAgJC5lYWNoKGRhdGEsIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oaW5kZXgsIGl0ZW0pIHtcbiAgICAgICAgICB2YXIgc2VsZWN0b3JSb3csIHN1YnNlY3Rpb25zO1xuICAgICAgICAgIHNlbGVjdG9yUm93ID0gJChBcHBWaWV3LnRlbXBsYXRlcy5zZWN0aW9uU2VsZWN0b3IoaXRlbSkpO1xuICAgICAgICAgICQod3JhcHBlcikuYXBwZW5kKHNlbGVjdG9yUm93KTtcbiAgICAgICAgICBpZiAoaXRlbS5zZWN0aW9ucy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBzdWJzZWN0aW9ucyA9ICQoQXBwVmlldy50ZW1wbGF0ZXMuc3Vic2VjdGlvbnMoKSk7XG4gICAgICAgICAgICBfdGhpcy5idWlsZFJlcG9ydFNlY3Rpb25MaXN0KGl0ZW0uc2VjdGlvbnMsIHN1YnNlY3Rpb25zKTtcbiAgICAgICAgICAgIHJldHVybiAkKHNlbGVjdG9yUm93KS5hZGRDbGFzcygnaGFzc3Vic2VjdGlvbnMnKS5hcHBlbmQoc3Vic2VjdGlvbnMpO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKTtcbiAgICAgIHJldHVybiB0aGlzLnVwZGF0ZVN1bW1hcnkoKTtcbiAgICB9LFxuICAgIHVwZGF0ZVNlY3Rpb25TZWxlY3Rpb246IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICBkZWJ1ZygnQXBwVmlldy51cGRhdGVTZWN0aW9uU2VsZWN0aW9uJyk7XG4gICAgICByZXR1cm4gdGhpcy5oYW5kbGVTZWN0aW9uU2VsZWN0aW9uKHRoaXMucG9zc2libGVTZWN0aW9ucyk7XG4gICAgfSxcbiAgICBoYW5kbGVTZWN0aW9uU2VsZWN0aW9uOiBmdW5jdGlvbihzZWN0aW9uTGlzdCwgcGFyZW50KSB7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5oYW5kbGVTZWN0aW9uU2VsZWN0aW9uJyk7XG4gICAgICAkLmVhY2goc2VjdGlvbkxpc3QsIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oaW5kZXgsIGl0ZW0pIHtcbiAgICAgICAgICB2YXIgc2VsZWN0aW9uQ29udHJvbCwgc2VsZWN0b3IsIF9yZWY7XG4gICAgICAgICAgc2VsZWN0b3IgPSBfdGhpcy4kKFwiI3NlY3Rpb24tXCIgKyAoaXRlbS5pZC5yZXBsYWNlKC9cXC4vZywgJ1xcXFwuJykpKTtcbiAgICAgICAgICBzZWxlY3Rpb25Db250cm9sID0gc2VsZWN0b3IuZmluZCgnaW5wdXQnKTtcbiAgICAgICAgICBpZiAoc2VsZWN0aW9uQ29udHJvbC5wcm9wKCdjaGVja2VkJykpIHtcbiAgICAgICAgICAgIHNlbGVjdG9yLnJlbW92ZUNsYXNzKCd1bnNlbGVjdGVkJyk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNlbGVjdG9yLmFkZENsYXNzKCd1bnNlbGVjdGVkJyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICgoKF9yZWYgPSBpdGVtLnNlY3Rpb25zKSAhPSBudWxsID8gX3JlZi5sZW5ndGggOiB2b2lkIDApID4gMCkge1xuICAgICAgICAgICAgcmV0dXJuIF90aGlzLmhhbmRsZVNlY3Rpb25TZWxlY3Rpb24oaXRlbS5zZWN0aW9ucywgaXRlbS5pZCk7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpO1xuICAgICAgcmV0dXJuIHRoaXMudXBkYXRlU3VtbWFyeSgpO1xuICAgIH0sXG4gICAgZmV0Y2hSZWdpb25zOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBmZXRjaDtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LmZldGNoUmVnaW9ucycpO1xuICAgICAgZmV0Y2ggPSAkLmFqYXgodGhpcy5kYXRhVXJsICsgJy9yZXBvcnRyZWdpb25zJyk7XG4gICAgICBmZXRjaC5kb25lKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgIHJldHVybiBfdGhpcy5idWlsZFJlZ2lvbkxpc3QoZGF0YSk7XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKSk7XG4gICAgICByZXR1cm4gZmV0Y2gucHJvbWlzZSgpO1xuICAgIH0sXG4gICAgYnVpbGRSZWdpb25MaXN0OiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICB2YXIgcmVnaW9uc2VsZWN0O1xuICAgICAgZGVidWcoJ0FwcFZpZXcuYnVpbGRSZWdpb25MaXN0Jyk7XG4gICAgICB0aGlzLnJlZ2lvbnMgPSBkYXRhLnJlZ2lvbnR5cGVzO1xuICAgICAgcmVnaW9uc2VsZWN0ID0gdGhpcy4kKCcucmVnaW9uc2VsZWN0Jyk7XG4gICAgICByZWdpb25zZWxlY3QuZW1wdHkoKS5yZW1vdmVDbGFzcygnbG9hZGluZycpO1xuICAgICAgJC5lYWNoKHRoaXMucmVnaW9ucywgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihpbmRleCwgcmVnaW9uVHlwZSkge1xuICAgICAgICAgIHZhciByZWcsIHJlZ2lvblR5cGVSb3c7XG4gICAgICAgICAgcmVnaW9uVHlwZS5vcHRpb25MaXN0ID0gW1xuICAgICAgICAgICAgKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICB2YXIgX2ksIF9sZW4sIF9yZWYsIF9yZXN1bHRzO1xuICAgICAgICAgICAgICBfcmVmID0gcmVnaW9uVHlwZS5yZWdpb25zO1xuICAgICAgICAgICAgICBfcmVzdWx0cyA9IFtdO1xuICAgICAgICAgICAgICBmb3IgKF9pID0gMCwgX2xlbiA9IF9yZWYubGVuZ3RoOyBfaSA8IF9sZW47IF9pKyspIHtcbiAgICAgICAgICAgICAgICByZWcgPSBfcmVmW19pXTtcbiAgICAgICAgICAgICAgICBfcmVzdWx0cy5wdXNoKEFwcFZpZXcudGVtcGxhdGVzLnJlZ2lvblNlbGVjdG9yKHJlZykpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHJldHVybiBfcmVzdWx0cztcbiAgICAgICAgICAgIH0pKClcbiAgICAgICAgICBdLmpvaW4oXCJcXG5cIik7XG4gICAgICAgICAgcmVnaW9uVHlwZVJvdyA9ICQoQXBwVmlldy50ZW1wbGF0ZXMucmVnaW9uVHlwZVNlbGVjdG9yKHJlZ2lvblR5cGUpKTtcbiAgICAgICAgICByZXR1cm4gcmVnaW9uc2VsZWN0LmFwcGVuZChyZWdpb25UeXBlUm93KTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKTtcbiAgICAgIHJldHVybiB0aGlzLnVwZGF0ZVN1bW1hcnkoKTtcbiAgICB9LFxuICAgIHVwZGF0ZVJlZ2lvblNlbGVjdGlvbjogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgIHZhciBzZWxlY3RlZFR5cGU7XG4gICAgICBkZWJ1ZygnQXBwVmlldy51cGRhdGVSZWdpb25TZWxlY3Rpb24nKTtcbiAgICAgIHNlbGVjdGVkVHlwZSA9IHRoaXMuJCgnW25hbWU9cmVnaW9udHlwZV06Y2hlY2tlZCcpLnZhbCgpO1xuICAgICAgJC5lYWNoKHRoaXMucmVnaW9ucywgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihpbmRleCwgcmVnaW9uVHlwZSkge1xuICAgICAgICAgIHZhciBzZWxlY3RvcjtcbiAgICAgICAgICBzZWxlY3RvciA9IF90aGlzLiQoXCIjcmVnaW9udHlwZS1cIiArIHJlZ2lvblR5cGUuaWQpO1xuICAgICAgICAgIGlmIChzZWxlY3RlZFR5cGUgPT09IHJlZ2lvblR5cGUuaWQpIHtcbiAgICAgICAgICAgIHNlbGVjdG9yLmFkZENsYXNzKCd0eXBlc2VsZWN0ZWQnKTtcbiAgICAgICAgICAgIF90aGlzLnNlbGVjdGVkUmVnaW9uVHlwZSA9IHJlZ2lvblR5cGUuaWQ7XG4gICAgICAgICAgICBfdGhpcy5zZWxlY3RlZFJlZ2lvbiA9ICQoc2VsZWN0b3IuZmluZCgnc2VsZWN0JykpLnZhbCgpO1xuICAgICAgICAgICAgaWYgKF90aGlzLnNlbGVjdGVkUmVnaW9uID09PSAnJykge1xuICAgICAgICAgICAgICByZXR1cm4gc2VsZWN0b3IucmVtb3ZlQ2xhc3MoJ3JlZ2lvbnNlbGVjdGVkJyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBzZWxlY3Rvci5hZGRDbGFzcygncmVnaW9uc2VsZWN0ZWQnKTtcbiAgICAgICAgICAgICAgcmV0dXJuIF90aGlzLnNlbGVjdGVkUmVnaW9uSW5mbyA9IF8uZmluZChyZWdpb25UeXBlLnJlZ2lvbnMsIGZ1bmN0aW9uKHJlZ2lvbikge1xuICAgICAgICAgICAgICAgIHJldHVybiByZWdpb24uaWQgPT09IF90aGlzLnNlbGVjdGVkUmVnaW9uO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHNlbGVjdG9yLnJlbW92ZUNsYXNzKCd0eXBlc2VsZWN0ZWQnKTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKSk7XG4gICAgICByZXR1cm4gdGhpcy51cGRhdGVTdW1tYXJ5KCk7XG4gICAgfSxcbiAgICBmZXRjaFllYXJzOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBmZXRjaDtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LmZldGNoWWVhcnMnKTtcbiAgICAgIGZldGNoID0gJC5EZWZlcnJlZCgpO1xuICAgICAgZmV0Y2guZG9uZSgoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICByZXR1cm4gX3RoaXMuYnVpbGRZZWFyTGlzdChkYXRhKTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKTtcbiAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBmZXRjaC5yZXNvbHZlKHtcbiAgICAgICAgICB5ZWFyczogWycyMDE1JywgJzIwMjUnLCAnMjAzNScsICcyMDQ1JywgJzIwNTUnLCAnMjA2NScsICcyMDc1JywgJzIwODUnXVxuICAgICAgICB9KTtcbiAgICAgIH0sIDUwMCArICg1MDAgKiBNYXRoLnJhbmRvbSgpKSk7XG4gICAgICByZXR1cm4gZmV0Y2gucHJvbWlzZSgpO1xuICAgIH0sXG4gICAgYnVpbGRZZWFyTGlzdDogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgdmFyIHllYXJzZWxlY3Q7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5idWlsZFllYXJMaXN0Jyk7XG4gICAgICB0aGlzLnllYXJzID0gZGF0YS55ZWFycztcbiAgICAgIHllYXJzZWxlY3QgPSB0aGlzLiQoJy55ZWFyc2VsZWN0Jyk7XG4gICAgICB5ZWFyc2VsZWN0LmVtcHR5KCkucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcnKTtcbiAgICAgICQuZWFjaCh0aGlzLnllYXJzLCAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGluZGV4LCB5ZWFyKSB7XG4gICAgICAgICAgcmV0dXJuIHllYXJzZWxlY3QuYXBwZW5kKEFwcFZpZXcudGVtcGxhdGVzLnllYXJTZWxlY3Rvcih7XG4gICAgICAgICAgICB5ZWFyOiB5ZWFyXG4gICAgICAgICAgfSkpO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpO1xuICAgICAgcmV0dXJuIHRoaXMudXBkYXRlU3VtbWFyeSgpO1xuICAgIH0sXG4gICAgdXBkYXRlWWVhclNlbGVjdGlvbjogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LnVwZGF0ZVllYXJTZWxlY3Rpb24nKTtcbiAgICAgIHRoaXMuc2VsZWN0ZWRZZWFyID0gdGhpcy4kKCdbbmFtZT15ZWFyc2VsZWN0b3JdOmNoZWNrZWQnKS52YWwoKTtcbiAgICAgICQuZWFjaCh0aGlzLnllYXJzLCAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGluZGV4LCB5ZWFyKSB7XG4gICAgICAgICAgdmFyIHNlbGVjdG9yO1xuICAgICAgICAgIHNlbGVjdG9yID0gX3RoaXMuJChcIiN5ZWFyLVwiICsgeWVhcik7XG4gICAgICAgICAgaWYgKF90aGlzLnNlbGVjdGVkWWVhciA9PT0geWVhcikge1xuICAgICAgICAgICAgcmV0dXJuIHNlbGVjdG9yLmFkZENsYXNzKCd5ZWFyc2VsZWN0ZWQnKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHNlbGVjdG9yLnJlbW92ZUNsYXNzKCd5ZWFyc2VsZWN0ZWQnKTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKSk7XG4gICAgICByZXR1cm4gdGhpcy51cGRhdGVTdW1tYXJ5KCk7XG4gICAgfSxcbiAgICBzZWN0aW9uSWQ6IGZ1bmN0aW9uKHNlY3Rpb25Eb20pIHtcbiAgICAgIHJldHVybiAkKHNlY3Rpb25Eb20pLmZpbmQoJ2lucHV0JykuYXR0cigndmFsdWUnKTtcbiAgICB9LFxuICAgIHNlY3Rpb25OYW1lOiBmdW5jdGlvbihzZWN0aW9uRG9tKSB7XG4gICAgICByZXR1cm4gdGhpcy5zZWN0aW9uSW5mbyhzZWN0aW9uRG9tKS5uYW1lO1xuICAgIH0sXG4gICAgc2VjdGlvbkluZm86IGZ1bmN0aW9uKHNlY3Rpb25Eb20pIHtcbiAgICAgIHZhciBpbmZvLCBwYXJlbnRJZHMsIHBhcmVudGFnZTtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LnNlY3Rpb25JbmZvJyk7XG4gICAgICBwYXJlbnRhZ2UgPSAkKHNlY3Rpb25Eb20pLnBhcmVudHMoJy5zZWN0aW9uc2VsZWN0b3InKTtcbiAgICAgIHBhcmVudElkcyA9IHBhcmVudGFnZS5tYXAoKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihpLCBlbGVtKSB7XG4gICAgICAgICAgcmV0dXJuIF90aGlzLnNlY3Rpb25JZChlbGVtKTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKS5nZXQoKS5yZXZlcnNlKCk7XG4gICAgICBwYXJlbnRJZHMucHVzaCh0aGlzLnNlY3Rpb25JZChzZWN0aW9uRG9tKSk7XG4gICAgICB0aGlzLnNlbGVjdGVkU2VjdGlvbnMucHVzaCh0aGlzLnNlY3Rpb25JZChzZWN0aW9uRG9tKSk7XG4gICAgICBpbmZvID0ge1xuICAgICAgICBzZWN0aW9uczogdGhpcy5wb3NzaWJsZVNlY3Rpb25zXG4gICAgICB9O1xuICAgICAgcGFyZW50SWRzLmZvckVhY2goZnVuY3Rpb24oaWQpIHtcbiAgICAgICAgcmV0dXJuIGluZm8gPSBfLmZpbHRlcihpbmZvLnNlY3Rpb25zLCBmdW5jdGlvbihzZWN0aW9uKSB7XG4gICAgICAgICAgcmV0dXJuIHNlY3Rpb24uaWQgPT09IGlkO1xuICAgICAgICB9KVswXTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIGluZm87XG4gICAgfSxcbiAgICBzdWJTZWN0aW9uTGlzdDogZnVuY3Rpb24oc2VjdGlvbkRvbSkge1xuICAgICAgdmFyIGxpc3QsIHN1YnNlY3Rpb25zO1xuICAgICAgZGVidWcoJ0FwcFZpZXcuc2VjdGlvbkxpc3QnKTtcbiAgICAgIGxpc3QgPSBbXTtcbiAgICAgIHN1YnNlY3Rpb25zID0gJChzZWN0aW9uRG9tKS5jaGlsZHJlbignLnN1YnNlY3Rpb25zJyk7XG4gICAgICBzdWJzZWN0aW9ucy5jaGlsZHJlbignLnNlY3Rpb25zZWxlY3RvcicpLm5vdCgnLnVuc2VsZWN0ZWQnKS5lYWNoKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oaSwgZWxlbSkge1xuICAgICAgICAgIHZhciBuYW1lLCBzdWJzO1xuICAgICAgICAgIG5hbWUgPSBfdGhpcy5zZWN0aW9uTmFtZShlbGVtKTtcbiAgICAgICAgICBzdWJzID0gX3RoaXMuc3ViU2VjdGlvbkxpc3QoZWxlbSk7XG4gICAgICAgICAgaWYgKHN1YnMgIT09ICcnKSB7XG4gICAgICAgICAgICBuYW1lID0gbmFtZSArICcgKCcgKyBzdWJzICsgJyknO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gbGlzdC5wdXNoKG5hbWUpO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpO1xuICAgICAgcmV0dXJuIGxpc3Quam9pbignLCAnKTtcbiAgICB9LFxuICAgIHVwZGF0ZVN1bW1hcnk6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGNvbnRlbnQsIGNvbnRlbnRMaXN0LCBzZWxlY3RlZFNlY3Rpb25zLCBzdW1tYXJ5LCBfcmVmO1xuICAgICAgZGVidWcoJ0FwcFZpZXcudXBkYXRlU3VtbWFyeScpO1xuICAgICAgc2VsZWN0ZWRTZWN0aW9ucyA9IHRoaXMuJCgnLnNlY3Rpb25zZWxlY3QgPiAuc2VjdGlvbnNlbGVjdG9yJykubm90KCcudW5zZWxlY3RlZCcpO1xuICAgICAgdGhpcy5zZWxlY3RlZFNlY3Rpb25zID0gW107XG4gICAgICBjb250ZW50TGlzdCA9IFtdO1xuICAgICAgc2VsZWN0ZWRTZWN0aW9ucy5lYWNoKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oaW5kZXgsIHNlY3Rpb24pIHtcbiAgICAgICAgICB2YXIgaW5mbywgc3ViTGlzdDtcbiAgICAgICAgICBpbmZvID0gX3RoaXMuc2VjdGlvbk5hbWUoc2VjdGlvbik7XG4gICAgICAgICAgc3ViTGlzdCA9IF90aGlzLnN1YlNlY3Rpb25MaXN0KHNlY3Rpb24pO1xuICAgICAgICAgIGlmIChzdWJMaXN0ICE9PSAnJykge1xuICAgICAgICAgICAgaW5mbyA9IGluZm8gKyAnOiAnICsgc3ViTGlzdC50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gY29udGVudExpc3QucHVzaChpbmZvICsgJy4nKTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKTtcbiAgICAgIGNvbnRlbnQgPSAnJztcbiAgICAgIGlmIChjb250ZW50TGlzdC5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNvbnRlbnQgPSAnPGxpPicgKyBjb250ZW50TGlzdC5qb2luKCc8L2xpPjxsaT4nKSArICc8L2xpPic7XG4gICAgICB9XG4gICAgICBzdW1tYXJ5ID0ge1xuICAgICAgICByZWdpb25OYW1lOiAoX3JlZiA9IHRoaXMuc2VsZWN0ZWRSZWdpb25JbmZvKSAhPSBudWxsID8gX3JlZi5uYW1lIDogdm9pZCAwLFxuICAgICAgICB5ZWFyOiB0aGlzLnNlbGVjdGVkWWVhcixcbiAgICAgICAgY29udGVudDogY29udGVudFxuICAgICAgfTtcbiAgICAgIHRoaXMuJCgnLnJldmlld2Jsb2NrJykuaHRtbChBcHBWaWV3LnRlbXBsYXRlcy5yZXZpZXdCbG9jayhzdW1tYXJ5KSk7XG4gICAgICB0aGlzLiQoJy5yZXZpZXdibG9jaycpLnRvZ2dsZUNsYXNzKCdyZWdpb25zZWxlY3RlZCcsIHRoaXMuc2VsZWN0ZWRSZWdpb25JbmZvICE9PSB2b2lkIDApO1xuICAgICAgcmV0dXJuIHRoaXMuJCgnLnJldmlld2Jsb2NrJykudG9nZ2xlQ2xhc3MoJ3llYXJzZWxlY3RlZCcsIHRoaXMuc2VsZWN0ZWRZZWFyICE9PSB2b2lkIDApO1xuICAgIH1cbiAgfSwge1xuICAgIHRlbXBsYXRlczoge1xuICAgICAgbGF5b3V0OiBfLnRlbXBsYXRlKFwiPGRpdiBjbGFzcz1cXFwicmV2aWV3YmxvY2tcXFwiPjwvZGl2PlxcbjxkaXYgY2xhc3M9XFxcImZvcm1ibG9ja1xcXCI+XFxuICAgIDxoMT5SZXBvcnQgb248L2gxPlxcbiAgICA8ZGl2IGNsYXNzPVxcXCJsb2FkaW5nIHNlbGVjdCByZWdpb25zZWxlY3RcXFwiPmxvYWRpbmcgYXZhaWxhYmxlIHJlZ2lvbnMuLjwvZGl2PlxcblxcbiAgICA8aDE+SW4gdGhlIHllYXI8L2gxPlxcbiAgICA8ZGl2IGNsYXNzPVxcXCJsb2FkaW5nIHNlbGVjdCB5ZWFyc2VsZWN0XFxcIj5sb2FkaW5nIGF2YWlsYWJsZSB5ZWFycy4uPC9kaXY+XFxuXFxuICAgIDxoMT5JbmNsdWRpbmc8L2gxPlxcbiAgICA8ZGl2IGNsYXNzPVxcXCJsb2FkaW5nIHNlbGVjdCBzZWN0aW9uc2VsZWN0XFxcIj5sb2FkaW5nIGF2YWlsYWJsZSBzZWN0aW9ucy4uPC9kaXY+XFxuPC9kaXY+XCIpLFxuICAgICAgcmV2aWV3QmxvY2s6IF8udGVtcGxhdGUoXCI8aDE+U2VsZWN0ZWQgUmVwb3J0PC9oMT5cXG48cCBjbGFzcz1cXFwiY292ZXJhZ2VcXFwiPkNvdmVyc1xcbiAgICA8JSBpZiAocmVnaW9uTmFtZSkgeyAlPjwlPSByZWdpb25OYW1lICU+PCUgfSBlbHNlIHsgJT48ZW0+KHVuc3BlY2lmaWVkIHJlZ2lvbik8L2VtPjwlIH0gJT5cXG4gICAgaW5cXG4gICAgPCUgaWYgKHllYXIpIHsgJT48JT0geWVhciAlPi48JSB9IGVsc2UgeyAlPjxlbT4odW5zcGVjaWZpZWQgeWVhcik8L2VtPi48JSB9ICU+XFxuPC9wPlxcbjx1bCBjbGFzcz1cXFwiY29udGVudHNcXFwiPjwlPSBjb250ZW50ICU+PC91bD5cXG48YnV0dG9uIHR5cGU9XFxcImJ1dHRvblxcXCIgY2xhc3M9XFxcImdldHJlcG9ydFxcXCI+ZG93bmxvYWQgcmVwb3J0PC9idXR0b24+XCIpLFxuICAgICAgcmV2aWV3Q29udGVudEl0ZW06IF8udGVtcGxhdGUoXCI8bGk+aXRlbTwvbGk+XCIpLFxuICAgICAgcmVnaW9uVHlwZVNlbGVjdG9yOiBfLnRlbXBsYXRlKFwiPGRpdiBjbGFzcz1cXFwicmVnaW9udHlwZXNlbGVjdG9yXFxcIiBpZD1cXFwicmVnaW9udHlwZS08JT0gaWQgJT5cXFwiPlxcbiAgICA8bGFiZWwgY2xhc3M9XFxcIm5hbWVcXFwiPjxpbnB1dFxcbiAgICAgICAgY2xhc3M9XFxcInJlZ2lvbnR5cGVcXFwiXFxuICAgICAgICBuYW1lPVxcXCJyZWdpb250eXBlXFxcIlxcbiAgICAgICAgdHlwZT1cXFwicmFkaW9cXFwiXFxuICAgICAgICB2YWx1ZT1cXFwiPCU9IGlkICU+XFxcIlxcbiAgICAvPiA8JT0gbmFtZSAlPlxcbiAgICA8L2xhYmVsPlxcbiAgICA8ZGl2IGNsYXNzPVxcXCJyZWdpb25zZWxlY3RvcndyYXBwZXJcXFwiPjxzZWxlY3QgY2xhc3M9XFxcInJlZ2lvbnNlbGVjdG9yXFxcIj5cXG4gICAgICAgIDxvcHRpb24gdmFsdWU9XFxcIlxcXCIgZGlzYWJsZWQ9XFxcImRpc2FibGVkXFxcIiBzZWxlY3RlZD1cXFwic2VsZWN0ZWRcXFwiPnNlbGVjdCBhIHJlZ2lvbiZoZWxsaXA7PC9vcHRpb24+XFxuICAgICAgICA8JT0gb3B0aW9uTGlzdCAlPlxcbiAgICA8L3NlbGVjdD48L2Rpdj5cXG48L2Rpdj5cIiksXG4gICAgICByZWdpb25TZWxlY3RvcjogXy50ZW1wbGF0ZShcIjxvcHRpb24gdmFsdWU9XFxcIjwlPSBpZCAlPlxcXCI+PCU9IG5hbWUgJT48L29wdGlvbj5cIiksXG4gICAgICB5ZWFyU2VsZWN0b3I6IF8udGVtcGxhdGUoXCI8ZGl2IGNsYXNzPVxcXCJ5ZWFycm93XFxcIiBpZD1cXFwieWVhci08JT0geWVhciAlPlxcXCI+XFxuICAgIDxsYWJlbCBjbGFzcz1cXFwibmFtZVxcXCI+PGlucHV0XFxuICAgICAgICBjbGFzcz1cXFwieWVhcnNlbGVjdG9yXFxcIlxcbiAgICAgICAgbmFtZT1cXFwieWVhcnNlbGVjdG9yXFxcIlxcbiAgICAgICAgdHlwZT1cXFwicmFkaW9cXFwiXFxuICAgICAgICB2YWx1ZT1cXFwiPCU9IHllYXIgJT5cXFwiXFxuICAgIC8+IDwlPSB5ZWFyICU+PC9sYWJlbD5cXG48L2Rpdj5cIiksXG4gICAgICBzZWN0aW9uU2VsZWN0b3I6IF8udGVtcGxhdGUoXCI8ZGl2IGNsYXNzPVxcXCJzZWN0aW9uc2VsZWN0b3I8JSBpZiAoaW5pdGlhbCAhPSAnaW5jbHVkZWQnKSB7IHByaW50KCcgdW5zZWxlY3RlZCcpOyB9ICU+XFxcIiBpZD1cXFwic2VjdGlvbi08JT0gaWQgJT5cXFwiPlxcbiAgICA8bGFiZWwgY2xhc3M9XFxcIm5hbWVcXFwiXFxuICAgICAgICA8JSBpZiAocHJlc2VuY2UgPT0gJ3JlcXVpcmVkJykgeyBwcmludCgndGl0bGU9XFxcIlRoaXMgc2VjdGlvbiBpcyByZXF1aXJlZFxcXCInKTsgfSAlPlxcbiAgICA+PGlucHV0XFxuICAgICAgICB0eXBlPVxcXCJjaGVja2JveFxcXCJcXG4gICAgICAgIHZhbHVlPVxcXCI8JT0gaWQgJT5cXFwiXFxuICAgICAgICA8JSBpZiAoaW5pdGlhbCA9PSAnaW5jbHVkZWQnKSB7IHByaW50KCdjaGVja2VkPVxcXCJjaGVja2VkXFxcIicpOyB9ICU+XFxuICAgICAgICA8JSBpZiAocHJlc2VuY2UgPT0gJ3JlcXVpcmVkJykgeyBwcmludCgnZGlzYWJsZWQ9XFxcImRpc2FibGVkXFxcIicpOyB9ICU+XFxuICAgIC8+IDwlPSBuYW1lICU+PC9sYWJlbD5cXG4gICAgPHAgY2xhc3M9XFxcImRlc2NyaXB0aW9uXFxcIj48JT0gZGVzY3JpcHRpb24gJT48L3A+XFxuXFxuPC9kaXY+XCIpLFxuICAgICAgc3Vic2VjdGlvbnM6IF8udGVtcGxhdGUoXCI8ZGl2IGNsYXNzPVxcXCJzdWJzZWN0aW9ucyBjbGVhcmZpeFxcXCI+XFxuPC9kaXY+XCIpXG4gICAgfVxuICB9KTtcblxuICBtb2R1bGUuZXhwb3J0cyA9IEFwcFZpZXc7XG5cbn0pLmNhbGwodGhpcyk7XG4iXX0=
