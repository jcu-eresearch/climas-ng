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
      fetch = $.Deferred();
      fetch.done((function(_this) {
        return function(data) {
          return _this.buildRegionList(data);
        };
      })(this));
      setTimeout(function() {
        return fetch.resolve({
          regiontypes: [
            {
              id: 'nrm',
              name: 'NRM region',
              regions: [
                {
                  id: 'NRM_ACT',
                  name: 'ACT'
                }, {
                  id: 'NRM_Adelaide_and_Mount_Lofty_Ranges',
                  name: 'Adelaide and Mount Lofty Ranges'
                }, {
                  id: 'NRM_Alinytjara_Wilurara',
                  name: 'Alinytjara Wilurara'
                }, {
                  id: 'NRM_Avon',
                  name: 'Avon'
                }, {
                  id: 'NRM_Border_Rivers-Gwydir',
                  name: 'Border Rivers-Gwydir'
                }, {
                  id: 'NRM_Border_Rivers_Maranoa-Balonne',
                  name: 'Border Rivers Maranoa-Balonne'
                }, {
                  id: 'NRM_Burdekin',
                  name: 'Burdekin'
                }, {
                  id: 'NRM_Burnett_Mary',
                  name: 'Burnett Mary'
                }, {
                  id: 'NRM_Cape_York',
                  name: 'Cape York'
                }, {
                  id: 'NRM_Central_West',
                  name: 'Central West'
                }, {
                  id: 'NRM_Condamine',
                  name: 'Condamine'
                }, {
                  id: 'NRM_Cooperative_Management_Area',
                  name: 'Cooperative Management Area'
                }, {
                  id: 'NRM_Corangamite',
                  name: 'Corangamite'
                }, {
                  id: 'NRM_Desert_Channels',
                  name: 'Desert Channels'
                }, {
                  id: 'NRM_East_Gippsland',
                  name: 'East Gippsland'
                }, {
                  id: 'NRM_Eyre_Peninsula',
                  name: 'Eyre Peninsula'
                }, {
                  id: 'NRM_Fitzroy',
                  name: 'Fitzroy'
                }, {
                  id: 'NRM_Glenelg_Hopkins',
                  name: 'Glenelg Hopkins'
                }, {
                  id: 'NRM_Goulburn_Broken',
                  name: 'Goulburn Broken'
                }, {
                  id: 'NRM_Hawkesbury-Nepean',
                  name: 'Hawkesbury-Nepean'
                }, {
                  id: 'NRM_Hunter-Central_Rivers',
                  name: 'Hunter-Central_Rivers'
                }, {
                  id: 'NRM_Kangaroo_Island',
                  name: 'Kangaroo Island'
                }, {
                  id: 'NRM_Lachlan',
                  name: 'Lachlan'
                }, {
                  id: 'NRM_Lower_Murray_Darling',
                  name: 'Lower Murray Darling'
                }, {
                  id: 'NRM_Mackay_Whitsunday',
                  name: 'Mackay Whitsunday'
                }, {
                  id: 'NRM_Mallee',
                  name: 'Mallee'
                }, {
                  id: 'NRM_Murray',
                  name: 'Murray'
                }, {
                  id: 'NRM_Murrumbidgee',
                  name: 'Murrumbidgee'
                }, {
                  id: 'NRM_Namoi',
                  name: 'Namoi'
                }, {
                  id: 'NRM_North',
                  name: 'North'
                }, {
                  id: 'NRM_North_Central',
                  name: 'North Central'
                }, {
                  id: 'NRM_North_East',
                  name: 'North East'
                }, {
                  id: 'NRM_North_West',
                  name: 'North West'
                }, {
                  id: 'NRM_Northern_Agricultural',
                  name: 'Northern Agricultural'
                }, {
                  id: 'NRM_Northern_Gulf',
                  name: 'Northern Gulf'
                }, {
                  id: 'NRM_Northern_Rivers',
                  name: 'Northern Rivers'
                }, {
                  id: 'NRM_Northern_Territory',
                  name: 'Northern Territory'
                }, {
                  id: 'NRM_Northern_and_Yorke',
                  name: 'Northern and Yorke'
                }, {
                  id: 'NRM_Perth',
                  name: 'Perth'
                }, {
                  id: 'NRM_Port_Phillip_and_Western_Port',
                  name: 'Port Phillip and Western Port'
                }, {
                  id: 'NRM_Rangelands',
                  name: 'Rangelands'
                }, {
                  id: 'NRM_South',
                  name: 'South'
                }, {
                  id: 'NRM_South_Australian_Arid_Lands',
                  name: 'South Australian Arid Lands'
                }, {
                  id: 'NRM_South_Australian_Murray_Darling_Basin',
                  name: 'South Australian Murray Darling Basin'
                }, {
                  id: 'NRM_South_Coast',
                  name: 'South Coast'
                }, {
                  id: 'NRM_South_East',
                  name: 'South East'
                }, {
                  id: 'NRM_South_East_Queensland',
                  name: 'South East Queensland'
                }, {
                  id: 'NRM_South_West',
                  name: 'South West'
                }, {
                  id: 'NRM_South_West_Queensland',
                  name: 'South West Queensland'
                }, {
                  id: 'NRM_Southern_Gulf',
                  name: 'Southern Gulf'
                }, {
                  id: 'NRM_Southern_Rivers',
                  name: 'Southern Rivers'
                }, {
                  id: 'NRM_Sydney_Metro',
                  name: 'Sydney Metro'
                }, {
                  id: 'NRM_Torres_Strait',
                  name: 'Torres Strait'
                }, {
                  id: 'NRM_West_Gippsland',
                  name: 'West Gippsland'
                }, {
                  id: 'NRM_Western',
                  name: 'Western'
                }, {
                  id: 'NRM_Wet_Tropics',
                  name: 'Wet Tropics'
                }, {
                  id: 'NRM_Wimmera',
                  name: 'Wimmera'
                }
              ]
            }, {
              id: 'state',
              name: 'State, territory',
              regions: [
                {
                  id: 'State_Australian_Capital_Territory',
                  name: 'ACT'
                }, {
                  id: 'State_New_South_Wales',
                  name: 'New South Wales'
                }, {
                  id: 'State_Northern_Territory',
                  name: 'Northern Territory'
                }, {
                  id: 'State_Queensland',
                  name: 'Queensland'
                }, {
                  id: 'State_South_Australia',
                  name: 'South Australia'
                }, {
                  id: 'State_Tasmania',
                  name: 'Tasmania'
                }, {
                  id: 'State_Victoria',
                  name: 'Victoria'
                }, {
                  id: 'State_Western_Australia',
                  name: 'Western Australia'
                }
              ]
            }
          ]
        });
      }, 500 + (500 * Math.random()));
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
      debug('AppView.sectionId');
      return $(sectionDom).find('input').attr('value');
    },
    sectionName: function(sectionDom) {
      debug('AppView.sectionName');
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
      this.selectedSections.push(parentIds.join('.'));
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
      debug(contentList);
      debug(summary);
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
      sectionSelector: _.template("<div class=\"sectionselector\" id=\"section-<%= id %>\">\n    <label class=\"name\"\n        <% if (presence == 'required') { print('title=\"This section is required\"'); } %>\n    ><input\n        type=\"checkbox\"\n        value=\"<%= id %>\"\n        checked=\"checked\"\n        <% if (presence == 'required') { print('disabled=\"disabled\"'); } %>\n    /> <%= name %></label>\n    <p class=\"description\"><%= description %></p>\n\n</div>"),
      subsections: _.template("<div class=\"subsections clearfix\">\n</div>")
    }
  });

  module.exports = AppView;

}).call(this);

},{"../util/shims":3}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9wdnJkd2IvamN1L2NuZy93ZWJhcHAvbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL3B2cmR3Yi9qY3UvY25nL3dlYmFwcC9jbGltYXNuZy9zcmMvanMvZmFrZV81MmNmYzA4Yi5qcyIsIi9Vc2Vycy9wdnJkd2IvamN1L2NuZy93ZWJhcHAvY2xpbWFzbmcvc3JjL2pzL3JlcG9ydHMvbWFpbi5qcyIsIi9Vc2Vycy9wdnJkd2IvamN1L2NuZy93ZWJhcHAvY2xpbWFzbmcvc3JjL2pzL3JlcG9ydHMvdXRpbC9zaGltcy5qcyIsIi9Vc2Vycy9wdnJkd2IvamN1L2NuZy93ZWJhcHAvY2xpbWFzbmcvc3JjL2pzL3JlcG9ydHMvdmlld3MvYXBwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcbnJlcXVpcmUoJy4vcmVwb3J0cy9tYWluJyk7XG5cbiIsIihmdW5jdGlvbigpIHtcbiAgdmFyIEFwcFZpZXc7XG5cbiAgaWYgKCF3aW5kb3cuY29uc29sZSkge1xuICAgIHdpbmRvdy5jb25zb2xlID0ge1xuICAgICAgbG9nOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHt9O1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICBBcHBWaWV3ID0gcmVxdWlyZSgnLi92aWV3cy9hcHAnKTtcblxuICAkKGZ1bmN0aW9uKCkge1xuICAgIHZhciBhcHB2aWV3O1xuICAgIGFwcHZpZXcgPSBuZXcgQXBwVmlldygpO1xuICAgIHJldHVybiBhcHB2aWV3LnJlbmRlcigpO1xuICB9KTtcblxufSkuY2FsbCh0aGlzKTtcbiIsIihmdW5jdGlvbigpIHtcbiAgdmFyIF9faW5kZXhPZiA9IFtdLmluZGV4T2YgfHwgZnVuY3Rpb24oaXRlbSkgeyBmb3IgKHZhciBpID0gMCwgbCA9IHRoaXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7IGlmIChpIGluIHRoaXMgJiYgdGhpc1tpXSA9PT0gaXRlbSkgcmV0dXJuIGk7IH0gcmV0dXJuIC0xOyB9O1xuXG4gIGlmICghQXJyYXkucHJvdG90eXBlLmZvckVhY2gpIHtcbiAgICBBcnJheS5wcm90b3R5cGUuZm9yRWFjaCA9IGZ1bmN0aW9uKGZuLCBzY29wZSkge1xuICAgICAgdmFyIGksIF9pLCBfcmVmLCBfcmVzdWx0cztcbiAgICAgIF9yZXN1bHRzID0gW107XG4gICAgICBmb3IgKGkgPSBfaSA9IDAsIF9yZWYgPSB0aGlzLmxlbmd0aDsgMCA8PSBfcmVmID8gX2kgPD0gX3JlZiA6IF9pID49IF9yZWY7IGkgPSAwIDw9IF9yZWYgPyArK19pIDogLS1faSkge1xuICAgICAgICBfcmVzdWx0cy5wdXNoKF9faW5kZXhPZi5jYWxsKHRoaXMsIGkpID49IDAgPyBmbi5jYWxsKHNjb3BlLCB0aGlzW2ldLCBpLCB0aGlzKSA6IHZvaWQgMCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gX3Jlc3VsdHM7XG4gICAgfTtcbiAgfVxuXG4gIGlmICghQXJyYXkucHJvdG90eXBlLmluZGV4T2YpIHtcbiAgICBBcnJheS5wcm90b3R5cGUuaW5kZXhPZiA9IGZ1bmN0aW9uKG5lZWRsZSkge1xuICAgICAgdmFyIGksIF9pLCBfcmVmO1xuICAgICAgZm9yIChpID0gX2kgPSAwLCBfcmVmID0gdGhpcy5sZW5ndGg7IDAgPD0gX3JlZiA/IF9pIDw9IF9yZWYgOiBfaSA+PSBfcmVmOyBpID0gMCA8PSBfcmVmID8gKytfaSA6IC0tX2kpIHtcbiAgICAgICAgaWYgKHRoaXNbaV0gPT09IG5lZWRsZSkge1xuICAgICAgICAgIHJldHVybiBpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gLTE7XG4gICAgfTtcbiAgfVxuXG59KS5jYWxsKHRoaXMpO1xuIiwiKGZ1bmN0aW9uKCkge1xuICB2YXIgQXBwVmlldywgZGVidWc7XG5cbiAgcmVxdWlyZSgnLi4vdXRpbC9zaGltcycpO1xuXG5cbiAgLyoganNoaW50IC1XMDkzICovXG5cblxuICAvKiBqc2hpbnQgLVcwNDEgKi9cblxuICBkZWJ1ZyA9IGZ1bmN0aW9uKGl0ZW1Ub0xvZywgaXRlbUxldmVsKSB7XG4gICAgdmFyIGxldmVscywgbWVzc2FnZU51bSwgdGhyZXNob2xkLCB0aHJlc2hvbGROdW07XG4gICAgbGV2ZWxzID0gWyd2ZXJ5ZGVidWcnLCAnZGVidWcnLCAnbWVzc2FnZScsICd3YXJuaW5nJ107XG4gICAgdGhyZXNob2xkID0gJ21lc3NhZ2UnO1xuICAgIGlmICghaXRlbUxldmVsKSB7XG4gICAgICBpdGVtTGV2ZWwgPSAnZGVidWcnO1xuICAgIH1cbiAgICB0aHJlc2hvbGROdW0gPSBsZXZlbHMuaW5kZXhPZih0aHJlc2hvbGQpO1xuICAgIG1lc3NhZ2VOdW0gPSBsZXZlbHMuaW5kZXhPZihpdGVtTGV2ZWwpO1xuICAgIGlmICh0aHJlc2hvbGROdW0gPiBtZXNzYWdlTnVtKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChpdGVtVG9Mb2cgKyAnJyA9PT0gaXRlbVRvTG9nKSB7XG4gICAgICByZXR1cm4gY29uc29sZS5sb2coXCJbXCIgKyBpdGVtTGV2ZWwgKyBcIl0gXCIgKyBpdGVtVG9Mb2cpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gY29uc29sZS5sb2coaXRlbVRvTG9nKTtcbiAgICB9XG4gIH07XG5cbiAgQXBwVmlldyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcbiAgICB0YWdOYW1lOiAnZm9ybScsXG4gICAgY2xhc3NOYW1lOiAnJyxcbiAgICBpZDogJ3JlcG9ydGZvcm0nLFxuICAgIGRhdGFVcmw6IFwiXCIgKyBsb2NhdGlvbi5wcm90b2NvbCArIFwiLy9cIiArIGxvY2F0aW9uLmhvc3QgKyBcIi9kYXRhXCIsXG4gICAgcmFzdGVyQXBpVXJsOiBcIlwiICsgbG9jYXRpb24ucHJvdG9jb2wgKyBcIi8vbG9jYWxob3N0OjEwNjAwL2FwaS9yYXN0ZXIvMS93bXNfZGF0YV91cmxcIixcbiAgICB0cmFja1NwbGl0dGVyOiBmYWxzZSxcbiAgICB0cmFja1BlcmlvZDogMTAwLFxuICAgIGV2ZW50czoge1xuICAgICAgJ2NoYW5nZSAuc2VjdGlvbnNlbGVjdG9yIGlucHV0JzogJ3VwZGF0ZVNlY3Rpb25TZWxlY3Rpb24nLFxuICAgICAgJ2NoYW5nZSAucmVnaW9uc2VsZWN0IGlucHV0JzogJ3VwZGF0ZVJlZ2lvblNlbGVjdGlvbicsXG4gICAgICAnY2hhbmdlIC5yZWdpb25zZWxlY3Qgc2VsZWN0JzogJ3VwZGF0ZVJlZ2lvblNlbGVjdGlvbicsXG4gICAgICAnY2hhbmdlIC55ZWFyc2VsZWN0IGlucHV0JzogJ3VwZGF0ZVllYXJTZWxlY3Rpb24nLFxuICAgICAgJ2NsaWNrIC5nZXRyZXBvcnQnOiAnZ2V0UmVwb3J0J1xuICAgIH0sXG4gICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5pbml0aWFsaXplJyk7XG4gICAgICBfLmJpbmRBbGwuYXBwbHkoXywgW3RoaXNdLmNvbmNhdChfLmZ1bmN0aW9ucyh0aGlzKSkpO1xuICAgICAgdGhpcy5mZXRjaFJlcG9ydFNlY3Rpb25zKCk7XG4gICAgICB0aGlzLmZldGNoUmVnaW9ucygpO1xuICAgICAgdGhpcy5mZXRjaFllYXJzKCk7XG4gICAgICByZXR1cm4gdGhpcy51cGRhdGVTdW1tYXJ5KCk7XG4gICAgfSxcbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgZGVidWcoJ0FwcFZpZXcucmVuZGVyJyk7XG4gICAgICB0aGlzLiRlbC5hcHBlbmQoQXBwVmlldy50ZW1wbGF0ZXMubGF5b3V0KHt9KSk7XG4gICAgICByZXR1cm4gJCgnI2NvbnRlbnR3cmFwIC5tYWluY29udGVudCcpLmFwcGVuZCh0aGlzLiRlbCk7XG4gICAgfSxcbiAgICBnZXRSZXBvcnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGZvcm07XG4gICAgICBkZWJ1ZygnQXBwVmlldy5nZXRSZXBvcnQnKTtcbiAgICAgIHRoaXMuJCgnI3JlcG9ydGZvcm0nKS5yZW1vdmUoKTtcbiAgICAgIGZvcm0gPSBbXTtcbiAgICAgIGZvcm0ucHVzaCgnPGZvcm0gYWN0aW9uPVwiL3JlZ2lvbnJlcG9ydFwiIG1ldGhvZD1cImdldFwiIGlkPVwicmVwb3J0Zm9ybVwiPicpO1xuICAgICAgZm9ybS5wdXNoKCc8aW5wdXQgdHlwZT1cImhpZGRlblwiIG5hbWU9XCJ5ZWFyXCIgdmFsdWU9XCInICsgdGhpcy5zZWxlY3RlZFllYXIgKyAnXCI+Jyk7XG4gICAgICBmb3JtLnB1c2goJzxpbnB1dCB0eXBlPVwiaGlkZGVuXCIgbmFtZT1cInJlZ2lvbnR5cGVcIiB2YWx1ZT1cIicgKyB0aGlzLnNlbGVjdGVkUmVnaW9uVHlwZSArICdcIj4nKTtcbiAgICAgIGZvcm0ucHVzaCgnPGlucHV0IHR5cGU9XCJoaWRkZW5cIiBuYW1lPVwicmVnaW9uXCIgdmFsdWU9XCInICsgdGhpcy5zZWxlY3RlZFJlZ2lvbiArICdcIj4nKTtcbiAgICAgIGZvcm0ucHVzaCgnPGlucHV0IHR5cGU9XCJoaWRkZW5cIiBuYW1lPVwic2VjdGlvbnNcIiB2YWx1ZT1cIicgKyB0aGlzLnNlbGVjdGVkU2VjdGlvbnMuam9pbignICcpICsgJ1wiPicpO1xuICAgICAgZm9ybS5wdXNoKCc8L2Zvcm0+Jyk7XG4gICAgICB0aGlzLiRlbC5hcHBlbmQoZm9ybS5qb2luKCdcXG4nKSk7XG4gICAgICByZXR1cm4gdGhpcy4kKCcjcmVwb3J0Zm9ybScpLnN1Ym1pdCgpO1xuICAgIH0sXG4gICAgZmV0Y2hSZXBvcnRTZWN0aW9uczogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgZmV0Y2g7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5mZXRjaFJlcG9ydFNlY3Rpb25zJyk7XG4gICAgICBmZXRjaCA9ICQuYWpheCh0aGlzLmRhdGFVcmwgKyAnL3JlcG9ydHNlY3Rpb25zJyk7XG4gICAgICBmZXRjaC5kb25lKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgIHZhciBzZWN0aW9uc2VsZWN0O1xuICAgICAgICAgIF90aGlzLnBvc3NpYmxlU2VjdGlvbnMgPSBkYXRhLnNlY3Rpb25zO1xuICAgICAgICAgIHNlY3Rpb25zZWxlY3QgPSBfdGhpcy4kKCcuc2VjdGlvbnNlbGVjdCcpO1xuICAgICAgICAgIHNlY3Rpb25zZWxlY3QuZW1wdHkoKS5yZW1vdmVDbGFzcygnbG9hZGluZycpO1xuICAgICAgICAgIHJldHVybiBfdGhpcy5idWlsZFJlcG9ydFNlY3Rpb25MaXN0KF90aGlzLnBvc3NpYmxlU2VjdGlvbnMsIHNlY3Rpb25zZWxlY3QpO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpO1xuICAgICAgcmV0dXJuIGZldGNoLnByb21pc2UoKTtcbiAgICB9LFxuICAgIGJ1aWxkUmVwb3J0U2VjdGlvbkxpc3Q6IGZ1bmN0aW9uKGRhdGEsIHdyYXBwZXIpIHtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LmJ1aWxkUmVwb3J0U2VjdGlvbkxpc3QnKTtcbiAgICAgICQuZWFjaChkYXRhLCAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGluZGV4LCBpdGVtKSB7XG4gICAgICAgICAgdmFyIHNlbGVjdG9yUm93LCBzdWJzZWN0aW9ucztcbiAgICAgICAgICBzZWxlY3RvclJvdyA9ICQoQXBwVmlldy50ZW1wbGF0ZXMuc2VjdGlvblNlbGVjdG9yKGl0ZW0pKTtcbiAgICAgICAgICAkKHdyYXBwZXIpLmFwcGVuZChzZWxlY3RvclJvdyk7XG4gICAgICAgICAgaWYgKGl0ZW0uc2VjdGlvbnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgc3Vic2VjdGlvbnMgPSAkKEFwcFZpZXcudGVtcGxhdGVzLnN1YnNlY3Rpb25zKCkpO1xuICAgICAgICAgICAgX3RoaXMuYnVpbGRSZXBvcnRTZWN0aW9uTGlzdChpdGVtLnNlY3Rpb25zLCBzdWJzZWN0aW9ucyk7XG4gICAgICAgICAgICByZXR1cm4gJChzZWxlY3RvclJvdykuYWRkQ2xhc3MoJ2hhc3N1YnNlY3Rpb25zJykuYXBwZW5kKHN1YnNlY3Rpb25zKTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKSk7XG4gICAgICByZXR1cm4gdGhpcy51cGRhdGVTdW1tYXJ5KCk7XG4gICAgfSxcbiAgICB1cGRhdGVTZWN0aW9uU2VsZWN0aW9uOiBmdW5jdGlvbihldmVudCkge1xuICAgICAgZGVidWcoJ0FwcFZpZXcudXBkYXRlU2VjdGlvblNlbGVjdGlvbicpO1xuICAgICAgcmV0dXJuIHRoaXMuaGFuZGxlU2VjdGlvblNlbGVjdGlvbih0aGlzLnBvc3NpYmxlU2VjdGlvbnMpO1xuICAgIH0sXG4gICAgaGFuZGxlU2VjdGlvblNlbGVjdGlvbjogZnVuY3Rpb24oc2VjdGlvbkxpc3QsIHBhcmVudCkge1xuICAgICAgZGVidWcoJ0FwcFZpZXcuaGFuZGxlU2VjdGlvblNlbGVjdGlvbicpO1xuICAgICAgJC5lYWNoKHNlY3Rpb25MaXN0LCAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGluZGV4LCBpdGVtKSB7XG4gICAgICAgICAgdmFyIHNlbGVjdGlvbkNvbnRyb2wsIHNlbGVjdG9yLCBfcmVmO1xuICAgICAgICAgIHNlbGVjdG9yID0gX3RoaXMuJChcIiNzZWN0aW9uLVwiICsgKGl0ZW0uaWQucmVwbGFjZSgvXFwuL2csICdcXFxcLicpKSk7XG4gICAgICAgICAgc2VsZWN0aW9uQ29udHJvbCA9IHNlbGVjdG9yLmZpbmQoJ2lucHV0Jyk7XG4gICAgICAgICAgaWYgKHNlbGVjdGlvbkNvbnRyb2wucHJvcCgnY2hlY2tlZCcpKSB7XG4gICAgICAgICAgICBzZWxlY3Rvci5yZW1vdmVDbGFzcygndW5zZWxlY3RlZCcpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzZWxlY3Rvci5hZGRDbGFzcygndW5zZWxlY3RlZCcpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoKChfcmVmID0gaXRlbS5zZWN0aW9ucykgIT0gbnVsbCA/IF9yZWYubGVuZ3RoIDogdm9pZCAwKSA+IDApIHtcbiAgICAgICAgICAgIHJldHVybiBfdGhpcy5oYW5kbGVTZWN0aW9uU2VsZWN0aW9uKGl0ZW0uc2VjdGlvbnMsIGl0ZW0uaWQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKTtcbiAgICAgIHJldHVybiB0aGlzLnVwZGF0ZVN1bW1hcnkoKTtcbiAgICB9LFxuICAgIGZldGNoUmVnaW9uczogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgZmV0Y2g7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5mZXRjaFJlZ2lvbnMnKTtcbiAgICAgIGZldGNoID0gJC5EZWZlcnJlZCgpO1xuICAgICAgZmV0Y2guZG9uZSgoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICByZXR1cm4gX3RoaXMuYnVpbGRSZWdpb25MaXN0KGRhdGEpO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpO1xuICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGZldGNoLnJlc29sdmUoe1xuICAgICAgICAgIHJlZ2lvbnR5cGVzOiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIGlkOiAnbnJtJyxcbiAgICAgICAgICAgICAgbmFtZTogJ05STSByZWdpb24nLFxuICAgICAgICAgICAgICByZWdpb25zOiBbXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgaWQ6ICdOUk1fQUNUJyxcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICdBQ1QnXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgaWQ6ICdOUk1fQWRlbGFpZGVfYW5kX01vdW50X0xvZnR5X1JhbmdlcycsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnQWRlbGFpZGUgYW5kIE1vdW50IExvZnR5IFJhbmdlcydcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICBpZDogJ05STV9BbGlueXRqYXJhX1dpbHVyYXJhJyxcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICdBbGlueXRqYXJhIFdpbHVyYXJhJ1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnTlJNX0F2b24nLFxuICAgICAgICAgICAgICAgICAgbmFtZTogJ0F2b24nXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgaWQ6ICdOUk1fQm9yZGVyX1JpdmVycy1Hd3lkaXInLFxuICAgICAgICAgICAgICAgICAgbmFtZTogJ0JvcmRlciBSaXZlcnMtR3d5ZGlyJ1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnTlJNX0JvcmRlcl9SaXZlcnNfTWFyYW5vYS1CYWxvbm5lJyxcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICdCb3JkZXIgUml2ZXJzIE1hcmFub2EtQmFsb25uZSdcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICBpZDogJ05STV9CdXJkZWtpbicsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnQnVyZGVraW4nXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgaWQ6ICdOUk1fQnVybmV0dF9NYXJ5JyxcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICdCdXJuZXR0IE1hcnknXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgaWQ6ICdOUk1fQ2FwZV9Zb3JrJyxcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICdDYXBlIFlvcmsnXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgaWQ6ICdOUk1fQ2VudHJhbF9XZXN0JyxcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICdDZW50cmFsIFdlc3QnXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgaWQ6ICdOUk1fQ29uZGFtaW5lJyxcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICdDb25kYW1pbmUnXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgaWQ6ICdOUk1fQ29vcGVyYXRpdmVfTWFuYWdlbWVudF9BcmVhJyxcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICdDb29wZXJhdGl2ZSBNYW5hZ2VtZW50IEFyZWEnXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgaWQ6ICdOUk1fQ29yYW5nYW1pdGUnLFxuICAgICAgICAgICAgICAgICAgbmFtZTogJ0NvcmFuZ2FtaXRlJ1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnTlJNX0Rlc2VydF9DaGFubmVscycsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnRGVzZXJ0IENoYW5uZWxzJ1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnTlJNX0Vhc3RfR2lwcHNsYW5kJyxcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICdFYXN0IEdpcHBzbGFuZCdcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICBpZDogJ05STV9FeXJlX1Blbmluc3VsYScsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnRXlyZSBQZW5pbnN1bGEnXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgaWQ6ICdOUk1fRml0enJveScsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnRml0enJveSdcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICBpZDogJ05STV9HbGVuZWxnX0hvcGtpbnMnLFxuICAgICAgICAgICAgICAgICAgbmFtZTogJ0dsZW5lbGcgSG9wa2lucydcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICBpZDogJ05STV9Hb3VsYnVybl9Ccm9rZW4nLFxuICAgICAgICAgICAgICAgICAgbmFtZTogJ0dvdWxidXJuIEJyb2tlbidcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICBpZDogJ05STV9IYXdrZXNidXJ5LU5lcGVhbicsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnSGF3a2VzYnVyeS1OZXBlYW4nXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgaWQ6ICdOUk1fSHVudGVyLUNlbnRyYWxfUml2ZXJzJyxcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICdIdW50ZXItQ2VudHJhbF9SaXZlcnMnXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgaWQ6ICdOUk1fS2FuZ2Fyb29fSXNsYW5kJyxcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICdLYW5nYXJvbyBJc2xhbmQnXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgaWQ6ICdOUk1fTGFjaGxhbicsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnTGFjaGxhbidcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICBpZDogJ05STV9Mb3dlcl9NdXJyYXlfRGFybGluZycsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnTG93ZXIgTXVycmF5IERhcmxpbmcnXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgaWQ6ICdOUk1fTWFja2F5X1doaXRzdW5kYXknLFxuICAgICAgICAgICAgICAgICAgbmFtZTogJ01hY2theSBXaGl0c3VuZGF5J1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnTlJNX01hbGxlZScsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnTWFsbGVlJ1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnTlJNX011cnJheScsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnTXVycmF5J1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnTlJNX011cnJ1bWJpZGdlZScsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnTXVycnVtYmlkZ2VlJ1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnTlJNX05hbW9pJyxcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICdOYW1vaSdcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICBpZDogJ05STV9Ob3J0aCcsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnTm9ydGgnXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgaWQ6ICdOUk1fTm9ydGhfQ2VudHJhbCcsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnTm9ydGggQ2VudHJhbCdcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICBpZDogJ05STV9Ob3J0aF9FYXN0JyxcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICdOb3J0aCBFYXN0J1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnTlJNX05vcnRoX1dlc3QnLFxuICAgICAgICAgICAgICAgICAgbmFtZTogJ05vcnRoIFdlc3QnXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgaWQ6ICdOUk1fTm9ydGhlcm5fQWdyaWN1bHR1cmFsJyxcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICdOb3J0aGVybiBBZ3JpY3VsdHVyYWwnXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgaWQ6ICdOUk1fTm9ydGhlcm5fR3VsZicsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnTm9ydGhlcm4gR3VsZidcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICBpZDogJ05STV9Ob3J0aGVybl9SaXZlcnMnLFxuICAgICAgICAgICAgICAgICAgbmFtZTogJ05vcnRoZXJuIFJpdmVycydcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICBpZDogJ05STV9Ob3J0aGVybl9UZXJyaXRvcnknLFxuICAgICAgICAgICAgICAgICAgbmFtZTogJ05vcnRoZXJuIFRlcnJpdG9yeSdcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICBpZDogJ05STV9Ob3J0aGVybl9hbmRfWW9ya2UnLFxuICAgICAgICAgICAgICAgICAgbmFtZTogJ05vcnRoZXJuIGFuZCBZb3JrZSdcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICBpZDogJ05STV9QZXJ0aCcsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnUGVydGgnXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgaWQ6ICdOUk1fUG9ydF9QaGlsbGlwX2FuZF9XZXN0ZXJuX1BvcnQnLFxuICAgICAgICAgICAgICAgICAgbmFtZTogJ1BvcnQgUGhpbGxpcCBhbmQgV2VzdGVybiBQb3J0J1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnTlJNX1JhbmdlbGFuZHMnLFxuICAgICAgICAgICAgICAgICAgbmFtZTogJ1JhbmdlbGFuZHMnXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgaWQ6ICdOUk1fU291dGgnLFxuICAgICAgICAgICAgICAgICAgbmFtZTogJ1NvdXRoJ1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnTlJNX1NvdXRoX0F1c3RyYWxpYW5fQXJpZF9MYW5kcycsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnU291dGggQXVzdHJhbGlhbiBBcmlkIExhbmRzJ1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnTlJNX1NvdXRoX0F1c3RyYWxpYW5fTXVycmF5X0RhcmxpbmdfQmFzaW4nLFxuICAgICAgICAgICAgICAgICAgbmFtZTogJ1NvdXRoIEF1c3RyYWxpYW4gTXVycmF5IERhcmxpbmcgQmFzaW4nXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgaWQ6ICdOUk1fU291dGhfQ29hc3QnLFxuICAgICAgICAgICAgICAgICAgbmFtZTogJ1NvdXRoIENvYXN0J1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnTlJNX1NvdXRoX0Vhc3QnLFxuICAgICAgICAgICAgICAgICAgbmFtZTogJ1NvdXRoIEVhc3QnXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgaWQ6ICdOUk1fU291dGhfRWFzdF9RdWVlbnNsYW5kJyxcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICdTb3V0aCBFYXN0IFF1ZWVuc2xhbmQnXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgaWQ6ICdOUk1fU291dGhfV2VzdCcsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnU291dGggV2VzdCdcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICBpZDogJ05STV9Tb3V0aF9XZXN0X1F1ZWVuc2xhbmQnLFxuICAgICAgICAgICAgICAgICAgbmFtZTogJ1NvdXRoIFdlc3QgUXVlZW5zbGFuZCdcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICBpZDogJ05STV9Tb3V0aGVybl9HdWxmJyxcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICdTb3V0aGVybiBHdWxmJ1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnTlJNX1NvdXRoZXJuX1JpdmVycycsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnU291dGhlcm4gUml2ZXJzJ1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnTlJNX1N5ZG5leV9NZXRybycsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnU3lkbmV5IE1ldHJvJ1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnTlJNX1RvcnJlc19TdHJhaXQnLFxuICAgICAgICAgICAgICAgICAgbmFtZTogJ1RvcnJlcyBTdHJhaXQnXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgaWQ6ICdOUk1fV2VzdF9HaXBwc2xhbmQnLFxuICAgICAgICAgICAgICAgICAgbmFtZTogJ1dlc3QgR2lwcHNsYW5kJ1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnTlJNX1dlc3Rlcm4nLFxuICAgICAgICAgICAgICAgICAgbmFtZTogJ1dlc3Rlcm4nXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgaWQ6ICdOUk1fV2V0X1Ryb3BpY3MnLFxuICAgICAgICAgICAgICAgICAgbmFtZTogJ1dldCBUcm9waWNzJ1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnTlJNX1dpbW1lcmEnLFxuICAgICAgICAgICAgICAgICAgbmFtZTogJ1dpbW1lcmEnXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgIGlkOiAnc3RhdGUnLFxuICAgICAgICAgICAgICBuYW1lOiAnU3RhdGUsIHRlcnJpdG9yeScsXG4gICAgICAgICAgICAgIHJlZ2lvbnM6IFtcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICBpZDogJ1N0YXRlX0F1c3RyYWxpYW5fQ2FwaXRhbF9UZXJyaXRvcnknLFxuICAgICAgICAgICAgICAgICAgbmFtZTogJ0FDVCdcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICBpZDogJ1N0YXRlX05ld19Tb3V0aF9XYWxlcycsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnTmV3IFNvdXRoIFdhbGVzJ1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnU3RhdGVfTm9ydGhlcm5fVGVycml0b3J5JyxcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICdOb3J0aGVybiBUZXJyaXRvcnknXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgaWQ6ICdTdGF0ZV9RdWVlbnNsYW5kJyxcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICdRdWVlbnNsYW5kJ1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnU3RhdGVfU291dGhfQXVzdHJhbGlhJyxcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICdTb3V0aCBBdXN0cmFsaWEnXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgaWQ6ICdTdGF0ZV9UYXNtYW5pYScsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnVGFzbWFuaWEnXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgaWQ6ICdTdGF0ZV9WaWN0b3JpYScsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnVmljdG9yaWEnXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgaWQ6ICdTdGF0ZV9XZXN0ZXJuX0F1c3RyYWxpYScsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnV2VzdGVybiBBdXN0cmFsaWEnXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9XG4gICAgICAgICAgXVxuICAgICAgICB9KTtcbiAgICAgIH0sIDUwMCArICg1MDAgKiBNYXRoLnJhbmRvbSgpKSk7XG4gICAgICByZXR1cm4gZmV0Y2gucHJvbWlzZSgpO1xuICAgIH0sXG4gICAgYnVpbGRSZWdpb25MaXN0OiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICB2YXIgcmVnaW9uc2VsZWN0O1xuICAgICAgZGVidWcoJ0FwcFZpZXcuYnVpbGRSZWdpb25MaXN0Jyk7XG4gICAgICB0aGlzLnJlZ2lvbnMgPSBkYXRhLnJlZ2lvbnR5cGVzO1xuICAgICAgcmVnaW9uc2VsZWN0ID0gdGhpcy4kKCcucmVnaW9uc2VsZWN0Jyk7XG4gICAgICByZWdpb25zZWxlY3QuZW1wdHkoKS5yZW1vdmVDbGFzcygnbG9hZGluZycpO1xuICAgICAgJC5lYWNoKHRoaXMucmVnaW9ucywgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihpbmRleCwgcmVnaW9uVHlwZSkge1xuICAgICAgICAgIHZhciByZWcsIHJlZ2lvblR5cGVSb3c7XG4gICAgICAgICAgcmVnaW9uVHlwZS5vcHRpb25MaXN0ID0gW1xuICAgICAgICAgICAgKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICB2YXIgX2ksIF9sZW4sIF9yZWYsIF9yZXN1bHRzO1xuICAgICAgICAgICAgICBfcmVmID0gcmVnaW9uVHlwZS5yZWdpb25zO1xuICAgICAgICAgICAgICBfcmVzdWx0cyA9IFtdO1xuICAgICAgICAgICAgICBmb3IgKF9pID0gMCwgX2xlbiA9IF9yZWYubGVuZ3RoOyBfaSA8IF9sZW47IF9pKyspIHtcbiAgICAgICAgICAgICAgICByZWcgPSBfcmVmW19pXTtcbiAgICAgICAgICAgICAgICBfcmVzdWx0cy5wdXNoKEFwcFZpZXcudGVtcGxhdGVzLnJlZ2lvblNlbGVjdG9yKHJlZykpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHJldHVybiBfcmVzdWx0cztcbiAgICAgICAgICAgIH0pKClcbiAgICAgICAgICBdLmpvaW4oXCJcXG5cIik7XG4gICAgICAgICAgcmVnaW9uVHlwZVJvdyA9ICQoQXBwVmlldy50ZW1wbGF0ZXMucmVnaW9uVHlwZVNlbGVjdG9yKHJlZ2lvblR5cGUpKTtcbiAgICAgICAgICByZXR1cm4gcmVnaW9uc2VsZWN0LmFwcGVuZChyZWdpb25UeXBlUm93KTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKTtcbiAgICAgIHJldHVybiB0aGlzLnVwZGF0ZVN1bW1hcnkoKTtcbiAgICB9LFxuICAgIHVwZGF0ZVJlZ2lvblNlbGVjdGlvbjogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgIHZhciBzZWxlY3RlZFR5cGU7XG4gICAgICBkZWJ1ZygnQXBwVmlldy51cGRhdGVSZWdpb25TZWxlY3Rpb24nKTtcbiAgICAgIHNlbGVjdGVkVHlwZSA9IHRoaXMuJCgnW25hbWU9cmVnaW9udHlwZV06Y2hlY2tlZCcpLnZhbCgpO1xuICAgICAgJC5lYWNoKHRoaXMucmVnaW9ucywgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihpbmRleCwgcmVnaW9uVHlwZSkge1xuICAgICAgICAgIHZhciBzZWxlY3RvcjtcbiAgICAgICAgICBzZWxlY3RvciA9IF90aGlzLiQoXCIjcmVnaW9udHlwZS1cIiArIHJlZ2lvblR5cGUuaWQpO1xuICAgICAgICAgIGlmIChzZWxlY3RlZFR5cGUgPT09IHJlZ2lvblR5cGUuaWQpIHtcbiAgICAgICAgICAgIHNlbGVjdG9yLmFkZENsYXNzKCd0eXBlc2VsZWN0ZWQnKTtcbiAgICAgICAgICAgIF90aGlzLnNlbGVjdGVkUmVnaW9uVHlwZSA9IHJlZ2lvblR5cGUuaWQ7XG4gICAgICAgICAgICBfdGhpcy5zZWxlY3RlZFJlZ2lvbiA9ICQoc2VsZWN0b3IuZmluZCgnc2VsZWN0JykpLnZhbCgpO1xuICAgICAgICAgICAgaWYgKF90aGlzLnNlbGVjdGVkUmVnaW9uID09PSAnJykge1xuICAgICAgICAgICAgICByZXR1cm4gc2VsZWN0b3IucmVtb3ZlQ2xhc3MoJ3JlZ2lvbnNlbGVjdGVkJyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBzZWxlY3Rvci5hZGRDbGFzcygncmVnaW9uc2VsZWN0ZWQnKTtcbiAgICAgICAgICAgICAgcmV0dXJuIF90aGlzLnNlbGVjdGVkUmVnaW9uSW5mbyA9IF8uZmluZChyZWdpb25UeXBlLnJlZ2lvbnMsIGZ1bmN0aW9uKHJlZ2lvbikge1xuICAgICAgICAgICAgICAgIHJldHVybiByZWdpb24uaWQgPT09IF90aGlzLnNlbGVjdGVkUmVnaW9uO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHNlbGVjdG9yLnJlbW92ZUNsYXNzKCd0eXBlc2VsZWN0ZWQnKTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKSk7XG4gICAgICByZXR1cm4gdGhpcy51cGRhdGVTdW1tYXJ5KCk7XG4gICAgfSxcbiAgICBmZXRjaFllYXJzOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBmZXRjaDtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LmZldGNoWWVhcnMnKTtcbiAgICAgIGZldGNoID0gJC5EZWZlcnJlZCgpO1xuICAgICAgZmV0Y2guZG9uZSgoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICByZXR1cm4gX3RoaXMuYnVpbGRZZWFyTGlzdChkYXRhKTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKTtcbiAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBmZXRjaC5yZXNvbHZlKHtcbiAgICAgICAgICB5ZWFyczogWycyMDE1JywgJzIwMjUnLCAnMjAzNScsICcyMDQ1JywgJzIwNTUnLCAnMjA2NScsICcyMDc1JywgJzIwODUnXVxuICAgICAgICB9KTtcbiAgICAgIH0sIDUwMCArICg1MDAgKiBNYXRoLnJhbmRvbSgpKSk7XG4gICAgICByZXR1cm4gZmV0Y2gucHJvbWlzZSgpO1xuICAgIH0sXG4gICAgYnVpbGRZZWFyTGlzdDogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgdmFyIHllYXJzZWxlY3Q7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5idWlsZFllYXJMaXN0Jyk7XG4gICAgICB0aGlzLnllYXJzID0gZGF0YS55ZWFycztcbiAgICAgIHllYXJzZWxlY3QgPSB0aGlzLiQoJy55ZWFyc2VsZWN0Jyk7XG4gICAgICB5ZWFyc2VsZWN0LmVtcHR5KCkucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcnKTtcbiAgICAgICQuZWFjaCh0aGlzLnllYXJzLCAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGluZGV4LCB5ZWFyKSB7XG4gICAgICAgICAgcmV0dXJuIHllYXJzZWxlY3QuYXBwZW5kKEFwcFZpZXcudGVtcGxhdGVzLnllYXJTZWxlY3Rvcih7XG4gICAgICAgICAgICB5ZWFyOiB5ZWFyXG4gICAgICAgICAgfSkpO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpO1xuICAgICAgcmV0dXJuIHRoaXMudXBkYXRlU3VtbWFyeSgpO1xuICAgIH0sXG4gICAgdXBkYXRlWWVhclNlbGVjdGlvbjogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LnVwZGF0ZVllYXJTZWxlY3Rpb24nKTtcbiAgICAgIHRoaXMuc2VsZWN0ZWRZZWFyID0gdGhpcy4kKCdbbmFtZT15ZWFyc2VsZWN0b3JdOmNoZWNrZWQnKS52YWwoKTtcbiAgICAgICQuZWFjaCh0aGlzLnllYXJzLCAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGluZGV4LCB5ZWFyKSB7XG4gICAgICAgICAgdmFyIHNlbGVjdG9yO1xuICAgICAgICAgIHNlbGVjdG9yID0gX3RoaXMuJChcIiN5ZWFyLVwiICsgeWVhcik7XG4gICAgICAgICAgaWYgKF90aGlzLnNlbGVjdGVkWWVhciA9PT0geWVhcikge1xuICAgICAgICAgICAgcmV0dXJuIHNlbGVjdG9yLmFkZENsYXNzKCd5ZWFyc2VsZWN0ZWQnKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHNlbGVjdG9yLnJlbW92ZUNsYXNzKCd5ZWFyc2VsZWN0ZWQnKTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKSk7XG4gICAgICByZXR1cm4gdGhpcy51cGRhdGVTdW1tYXJ5KCk7XG4gICAgfSxcbiAgICBzZWN0aW9uSWQ6IGZ1bmN0aW9uKHNlY3Rpb25Eb20pIHtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LnNlY3Rpb25JZCcpO1xuICAgICAgcmV0dXJuICQoc2VjdGlvbkRvbSkuZmluZCgnaW5wdXQnKS5hdHRyKCd2YWx1ZScpO1xuICAgIH0sXG4gICAgc2VjdGlvbk5hbWU6IGZ1bmN0aW9uKHNlY3Rpb25Eb20pIHtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LnNlY3Rpb25OYW1lJyk7XG4gICAgICByZXR1cm4gdGhpcy5zZWN0aW9uSW5mbyhzZWN0aW9uRG9tKS5uYW1lO1xuICAgIH0sXG4gICAgc2VjdGlvbkluZm86IGZ1bmN0aW9uKHNlY3Rpb25Eb20pIHtcbiAgICAgIHZhciBpbmZvLCBwYXJlbnRJZHMsIHBhcmVudGFnZTtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LnNlY3Rpb25JbmZvJyk7XG4gICAgICBwYXJlbnRhZ2UgPSAkKHNlY3Rpb25Eb20pLnBhcmVudHMoJy5zZWN0aW9uc2VsZWN0b3InKTtcbiAgICAgIHBhcmVudElkcyA9IHBhcmVudGFnZS5tYXAoKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihpLCBlbGVtKSB7XG4gICAgICAgICAgcmV0dXJuIF90aGlzLnNlY3Rpb25JZChlbGVtKTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKS5nZXQoKS5yZXZlcnNlKCk7XG4gICAgICBwYXJlbnRJZHMucHVzaCh0aGlzLnNlY3Rpb25JZChzZWN0aW9uRG9tKSk7XG4gICAgICB0aGlzLnNlbGVjdGVkU2VjdGlvbnMucHVzaChwYXJlbnRJZHMuam9pbignLicpKTtcbiAgICAgIGluZm8gPSB7XG4gICAgICAgIHNlY3Rpb25zOiB0aGlzLnBvc3NpYmxlU2VjdGlvbnNcbiAgICAgIH07XG4gICAgICBwYXJlbnRJZHMuZm9yRWFjaChmdW5jdGlvbihpZCkge1xuICAgICAgICByZXR1cm4gaW5mbyA9IF8uZmlsdGVyKGluZm8uc2VjdGlvbnMsIGZ1bmN0aW9uKHNlY3Rpb24pIHtcbiAgICAgICAgICByZXR1cm4gc2VjdGlvbi5pZCA9PT0gaWQ7XG4gICAgICAgIH0pWzBdO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gaW5mbztcbiAgICB9LFxuICAgIHN1YlNlY3Rpb25MaXN0OiBmdW5jdGlvbihzZWN0aW9uRG9tKSB7XG4gICAgICB2YXIgbGlzdCwgc3Vic2VjdGlvbnM7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5zZWN0aW9uTGlzdCcpO1xuICAgICAgbGlzdCA9IFtdO1xuICAgICAgc3Vic2VjdGlvbnMgPSAkKHNlY3Rpb25Eb20pLmNoaWxkcmVuKCcuc3Vic2VjdGlvbnMnKTtcbiAgICAgIHN1YnNlY3Rpb25zLmNoaWxkcmVuKCcuc2VjdGlvbnNlbGVjdG9yJykubm90KCcudW5zZWxlY3RlZCcpLmVhY2goKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihpLCBlbGVtKSB7XG4gICAgICAgICAgdmFyIG5hbWUsIHN1YnM7XG4gICAgICAgICAgbmFtZSA9IF90aGlzLnNlY3Rpb25OYW1lKGVsZW0pO1xuICAgICAgICAgIHN1YnMgPSBfdGhpcy5zdWJTZWN0aW9uTGlzdChlbGVtKTtcbiAgICAgICAgICBpZiAoc3VicyAhPT0gJycpIHtcbiAgICAgICAgICAgIG5hbWUgPSBuYW1lICsgJyAoJyArIHN1YnMgKyAnKSc7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBsaXN0LnB1c2gobmFtZSk7XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKSk7XG4gICAgICByZXR1cm4gbGlzdC5qb2luKCcsICcpO1xuICAgIH0sXG4gICAgdXBkYXRlU3VtbWFyeTogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgY29udGVudCwgY29udGVudExpc3QsIHNlbGVjdGVkU2VjdGlvbnMsIHN1bW1hcnksIF9yZWY7XG4gICAgICBkZWJ1ZygnQXBwVmlldy51cGRhdGVTdW1tYXJ5Jyk7XG4gICAgICBzZWxlY3RlZFNlY3Rpb25zID0gdGhpcy4kKCcuc2VjdGlvbnNlbGVjdCA+IC5zZWN0aW9uc2VsZWN0b3InKS5ub3QoJy51bnNlbGVjdGVkJyk7XG4gICAgICB0aGlzLnNlbGVjdGVkU2VjdGlvbnMgPSBbXTtcbiAgICAgIGNvbnRlbnRMaXN0ID0gW107XG4gICAgICBzZWxlY3RlZFNlY3Rpb25zLmVhY2goKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihpbmRleCwgc2VjdGlvbikge1xuICAgICAgICAgIHZhciBpbmZvLCBzdWJMaXN0O1xuICAgICAgICAgIGluZm8gPSBfdGhpcy5zZWN0aW9uTmFtZShzZWN0aW9uKTtcbiAgICAgICAgICBzdWJMaXN0ID0gX3RoaXMuc3ViU2VjdGlvbkxpc3Qoc2VjdGlvbik7XG4gICAgICAgICAgaWYgKHN1Ykxpc3QgIT09ICcnKSB7XG4gICAgICAgICAgICBpbmZvID0gaW5mbyArICc6ICcgKyBzdWJMaXN0LnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBjb250ZW50TGlzdC5wdXNoKGluZm8gKyAnLicpO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpO1xuICAgICAgY29udGVudCA9ICcnO1xuICAgICAgaWYgKGNvbnRlbnRMaXN0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29udGVudCA9ICc8bGk+JyArIGNvbnRlbnRMaXN0LmpvaW4oJzwvbGk+PGxpPicpICsgJzwvbGk+JztcbiAgICAgIH1cbiAgICAgIHN1bW1hcnkgPSB7XG4gICAgICAgIHJlZ2lvbk5hbWU6IChfcmVmID0gdGhpcy5zZWxlY3RlZFJlZ2lvbkluZm8pICE9IG51bGwgPyBfcmVmLm5hbWUgOiB2b2lkIDAsXG4gICAgICAgIHllYXI6IHRoaXMuc2VsZWN0ZWRZZWFyLFxuICAgICAgICBjb250ZW50OiBjb250ZW50XG4gICAgICB9O1xuICAgICAgZGVidWcoY29udGVudExpc3QpO1xuICAgICAgZGVidWcoc3VtbWFyeSk7XG4gICAgICB0aGlzLiQoJy5yZXZpZXdibG9jaycpLmh0bWwoQXBwVmlldy50ZW1wbGF0ZXMucmV2aWV3QmxvY2soc3VtbWFyeSkpO1xuICAgICAgdGhpcy4kKCcucmV2aWV3YmxvY2snKS50b2dnbGVDbGFzcygncmVnaW9uc2VsZWN0ZWQnLCB0aGlzLnNlbGVjdGVkUmVnaW9uSW5mbyAhPT0gdm9pZCAwKTtcbiAgICAgIHJldHVybiB0aGlzLiQoJy5yZXZpZXdibG9jaycpLnRvZ2dsZUNsYXNzKCd5ZWFyc2VsZWN0ZWQnLCB0aGlzLnNlbGVjdGVkWWVhciAhPT0gdm9pZCAwKTtcbiAgICB9XG4gIH0sIHtcbiAgICB0ZW1wbGF0ZXM6IHtcbiAgICAgIGxheW91dDogXy50ZW1wbGF0ZShcIjxkaXYgY2xhc3M9XFxcInJldmlld2Jsb2NrXFxcIj48L2Rpdj5cXG48ZGl2IGNsYXNzPVxcXCJmb3JtYmxvY2tcXFwiPlxcbiAgICA8aDE+UmVwb3J0IG9uPC9oMT5cXG4gICAgPGRpdiBjbGFzcz1cXFwibG9hZGluZyBzZWxlY3QgcmVnaW9uc2VsZWN0XFxcIj5sb2FkaW5nIGF2YWlsYWJsZSByZWdpb25zLi48L2Rpdj5cXG5cXG4gICAgPGgxPkluIHRoZSB5ZWFyPC9oMT5cXG4gICAgPGRpdiBjbGFzcz1cXFwibG9hZGluZyBzZWxlY3QgeWVhcnNlbGVjdFxcXCI+bG9hZGluZyBhdmFpbGFibGUgeWVhcnMuLjwvZGl2PlxcblxcbiAgICA8aDE+SW5jbHVkaW5nPC9oMT5cXG4gICAgPGRpdiBjbGFzcz1cXFwibG9hZGluZyBzZWxlY3Qgc2VjdGlvbnNlbGVjdFxcXCI+bG9hZGluZyBhdmFpbGFibGUgc2VjdGlvbnMuLjwvZGl2PlxcbjwvZGl2PlwiKSxcbiAgICAgIHJldmlld0Jsb2NrOiBfLnRlbXBsYXRlKFwiPGgxPlNlbGVjdGVkIFJlcG9ydDwvaDE+XFxuPHAgY2xhc3M9XFxcImNvdmVyYWdlXFxcIj5Db3ZlcnNcXG4gICAgPCUgaWYgKHJlZ2lvbk5hbWUpIHsgJT48JT0gcmVnaW9uTmFtZSAlPjwlIH0gZWxzZSB7ICU+PGVtPih1bnNwZWNpZmllZCByZWdpb24pPC9lbT48JSB9ICU+XFxuICAgIGluXFxuICAgIDwlIGlmICh5ZWFyKSB7ICU+PCU9IHllYXIgJT4uPCUgfSBlbHNlIHsgJT48ZW0+KHVuc3BlY2lmaWVkIHllYXIpPC9lbT4uPCUgfSAlPlxcbjwvcD5cXG48dWwgY2xhc3M9XFxcImNvbnRlbnRzXFxcIj48JT0gY29udGVudCAlPjwvdWw+XFxuPGJ1dHRvbiB0eXBlPVxcXCJidXR0b25cXFwiIGNsYXNzPVxcXCJnZXRyZXBvcnRcXFwiPmRvd25sb2FkIHJlcG9ydDwvYnV0dG9uPlwiKSxcbiAgICAgIHJldmlld0NvbnRlbnRJdGVtOiBfLnRlbXBsYXRlKFwiPGxpPml0ZW08L2xpPlwiKSxcbiAgICAgIHJlZ2lvblR5cGVTZWxlY3RvcjogXy50ZW1wbGF0ZShcIjxkaXYgY2xhc3M9XFxcInJlZ2lvbnR5cGVzZWxlY3RvclxcXCIgaWQ9XFxcInJlZ2lvbnR5cGUtPCU9IGlkICU+XFxcIj5cXG4gICAgPGxhYmVsIGNsYXNzPVxcXCJuYW1lXFxcIj48aW5wdXRcXG4gICAgICAgIGNsYXNzPVxcXCJyZWdpb250eXBlXFxcIlxcbiAgICAgICAgbmFtZT1cXFwicmVnaW9udHlwZVxcXCJcXG4gICAgICAgIHR5cGU9XFxcInJhZGlvXFxcIlxcbiAgICAgICAgdmFsdWU9XFxcIjwlPSBpZCAlPlxcXCJcXG4gICAgLz4gPCU9IG5hbWUgJT5cXG4gICAgPC9sYWJlbD5cXG4gICAgPGRpdiBjbGFzcz1cXFwicmVnaW9uc2VsZWN0b3J3cmFwcGVyXFxcIj48c2VsZWN0IGNsYXNzPVxcXCJyZWdpb25zZWxlY3RvclxcXCI+XFxuICAgICAgICA8b3B0aW9uIHZhbHVlPVxcXCJcXFwiIGRpc2FibGVkPVxcXCJkaXNhYmxlZFxcXCIgc2VsZWN0ZWQ9XFxcInNlbGVjdGVkXFxcIj5zZWxlY3QgYSByZWdpb24maGVsbGlwOzwvb3B0aW9uPlxcbiAgICAgICAgPCU9IG9wdGlvbkxpc3QgJT5cXG4gICAgPC9zZWxlY3Q+PC9kaXY+XFxuPC9kaXY+XCIpLFxuICAgICAgcmVnaW9uU2VsZWN0b3I6IF8udGVtcGxhdGUoXCI8b3B0aW9uIHZhbHVlPVxcXCI8JT0gaWQgJT5cXFwiPjwlPSBuYW1lICU+PC9vcHRpb24+XCIpLFxuICAgICAgeWVhclNlbGVjdG9yOiBfLnRlbXBsYXRlKFwiPGRpdiBjbGFzcz1cXFwieWVhcnJvd1xcXCIgaWQ9XFxcInllYXItPCU9IHllYXIgJT5cXFwiPlxcbiAgICA8bGFiZWwgY2xhc3M9XFxcIm5hbWVcXFwiPjxpbnB1dFxcbiAgICAgICAgY2xhc3M9XFxcInllYXJzZWxlY3RvclxcXCJcXG4gICAgICAgIG5hbWU9XFxcInllYXJzZWxlY3RvclxcXCJcXG4gICAgICAgIHR5cGU9XFxcInJhZGlvXFxcIlxcbiAgICAgICAgdmFsdWU9XFxcIjwlPSB5ZWFyICU+XFxcIlxcbiAgICAvPiA8JT0geWVhciAlPjwvbGFiZWw+XFxuPC9kaXY+XCIpLFxuICAgICAgc2VjdGlvblNlbGVjdG9yOiBfLnRlbXBsYXRlKFwiPGRpdiBjbGFzcz1cXFwic2VjdGlvbnNlbGVjdG9yXFxcIiBpZD1cXFwic2VjdGlvbi08JT0gaWQgJT5cXFwiPlxcbiAgICA8bGFiZWwgY2xhc3M9XFxcIm5hbWVcXFwiXFxuICAgICAgICA8JSBpZiAocHJlc2VuY2UgPT0gJ3JlcXVpcmVkJykgeyBwcmludCgndGl0bGU9XFxcIlRoaXMgc2VjdGlvbiBpcyByZXF1aXJlZFxcXCInKTsgfSAlPlxcbiAgICA+PGlucHV0XFxuICAgICAgICB0eXBlPVxcXCJjaGVja2JveFxcXCJcXG4gICAgICAgIHZhbHVlPVxcXCI8JT0gaWQgJT5cXFwiXFxuICAgICAgICBjaGVja2VkPVxcXCJjaGVja2VkXFxcIlxcbiAgICAgICAgPCUgaWYgKHByZXNlbmNlID09ICdyZXF1aXJlZCcpIHsgcHJpbnQoJ2Rpc2FibGVkPVxcXCJkaXNhYmxlZFxcXCInKTsgfSAlPlxcbiAgICAvPiA8JT0gbmFtZSAlPjwvbGFiZWw+XFxuICAgIDxwIGNsYXNzPVxcXCJkZXNjcmlwdGlvblxcXCI+PCU9IGRlc2NyaXB0aW9uICU+PC9wPlxcblxcbjwvZGl2PlwiKSxcbiAgICAgIHN1YnNlY3Rpb25zOiBfLnRlbXBsYXRlKFwiPGRpdiBjbGFzcz1cXFwic3Vic2VjdGlvbnMgY2xlYXJmaXhcXFwiPlxcbjwvZGl2PlwiKVxuICAgIH1cbiAgfSk7XG5cbiAgbW9kdWxlLmV4cG9ydHMgPSBBcHBWaWV3O1xuXG59KS5jYWxsKHRoaXMpO1xuIl19
