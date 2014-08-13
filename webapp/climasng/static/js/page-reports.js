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
    speciesDataUrl: "" + location.protocol + "//" + location.host + "/speciesdata",
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
      return this.fetchYears();
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
      fetch = $.Deferred();
      fetch.done((function(_this) {
        return function(data) {
          var sectionselect;
          _this.possibleSections = data.sections;
          sectionselect = _this.$('.sectionselect');
          sectionselect.empty().removeClass('loading');
          return _this.buildReportSectionList(_this.possibleSections, sectionselect);
        };
      })(this));
      setTimeout(function() {
        return fetch.resolve({
          sections: [
            {
              id: 'intro',
              name: 'Introduction',
              description: 'title, credits, and introductory paragraphs.',
              presence: 'required',
              sections: []
            }, {
              id: 'climatereview',
              name: 'Climate Review',
              description: 'a description of the region\'s current and projected climate.',
              presence: 'optional',
              sections: [
                {
                  id: 'temperature',
                  name: 'Temperature',
                  description: 'current and projected temperature.',
                  presence: 'optional',
                  sections: []
                }, {
                  id: 'rainfall',
                  name: 'Rainfall',
                  description: 'current and projected precipitation.',
                  presence: 'optional',
                  sections: []
                }
              ]
            }, {
              id: 'biodiversity',
              name: 'Biodiversity Review',
              description: 'a description of the region\'s current and projected biodiversity.',
              presence: 'optional',
              sections: [
                {
                  id: 'overall',
                  name: 'Overall',
                  description: 'current and projected biodiversity over all modelled species.',
                  presence: 'optional',
                  sections: []
                }, {
                  id: 'mammals',
                  name: 'Mammals',
                  description: 'current and projected biodiversity over mammal species.',
                  presence: 'optional',
                  sections: []
                }, {
                  id: 'amphibians',
                  name: 'Amphibians',
                  description: 'current and projected biodiversity over amphibian species.',
                  presence: 'optional',
                  sections: [
                    {
                      id: 'allamphibians',
                      name: 'All',
                      description: 'current and projected biodiversity over all amphibian species.',
                      presence: 'optional',
                      sections: []
                    }, {
                      id: 'streamfrogs',
                      name: 'Stream frogs',
                      description: 'current and projected biodiversity over stream frogs.',
                      presence: 'optional',
                      sections: []
                    }
                  ]
                }, {
                  id: 'reptiles',
                  name: 'Reptiles',
                  description: 'current and projected biodiversity over reptile species.',
                  presence: 'optional',
                  sections: [
                    {
                      id: 'allreptiles',
                      name: 'All',
                      description: 'current and projected biodiversity over all reptile species.',
                      presence: 'optional',
                      sections: []
                    }, {
                      id: 'turtles',
                      name: 'Turtles',
                      description: 'current and projected biodiversity over turtles.',
                      presence: 'optional',
                      sections: []
                    }
                  ]
                }, {
                  id: 'birds',
                  name: 'Birds',
                  description: 'current and projected biodiversity over bird species.',
                  presence: 'optional',
                  sections: []
                }, {
                  id: 'freshwaterfish',
                  name: 'Freshwater fish',
                  description: 'current and projected biodiversity over freshwater fish species.',
                  presence: 'optional',
                  sections: []
                }
              ]
            }, {
              id: 'pests',
              name: 'Pest Species',
              description: 'climate suitability and distribution of pest species.',
              presence: 'optional',
              sections: [
                {
                  id: 'pestplants',
                  name: 'Pest Plants',
                  description: 'summary of projections for selected pest plants.',
                  presence: 'optional',
                  sections: []
                }
              ]
            }, {
              id: 'appendixes',
              name: 'Appendices',
              description: 'tables and other appendices.',
              presence: 'required',
              sections: [
                {
                  id: 'observedmammallist',
                  name: 'Mammals Present',
                  description: 'list of mammals currently or projected to be present in region.',
                  presence: 'optional',
                  sections: []
                }, {
                  id: 'observedamphibianslist',
                  name: 'Amphibians Present',
                  description: 'list of amphibians currently or projected to be present in region.',
                  presence: 'optional',
                  sections: []
                }, {
                  id: 'observedstreamfrogslist',
                  name: 'Steam Frogs Present',
                  description: 'list of stream frogs currently or projected to be present in region.',
                  presence: 'optional',
                  sections: []
                }, {
                  id: 'observedreptileslist',
                  name: 'Reptiles Present',
                  description: 'list of reptiles currently or projected to be present in region.',
                  presence: 'optional',
                  sections: []
                }, {
                  id: 'observedturtleslist',
                  name: 'Turtles Present',
                  description: 'list of turtles currently or projected to be present in region.',
                  presence: 'optional',
                  sections: []
                }, {
                  id: 'observedbirdslist',
                  name: 'Birds Present',
                  description: 'list of birds currently or projected to be present in region.',
                  presence: 'optional',
                  sections: []
                }, {
                  id: 'science',
                  name: 'Science',
                  description: 'description of the climate and species distribution modelling used to generate the data in the report.',
                  presence: 'required',
                  sections: []
                }
              ]
            }
          ]
        });
      }, 500 + (500 * Math.random()));
      return fetch.promise();
    },
    buildReportSectionList: function(data, wrapper) {
      debug('AppView.buildReportSectionList');
      return $.each(data, (function(_this) {
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
          selector = _this.$("#section-" + item.id);
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
              id: 'ibra',
              name: 'IBRA bioregion',
              regions: []
            }, {
              id: 'park',
              name: 'Parks, reserves',
              regions: []
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
      return $.each(this.regions, (function(_this) {
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
            if (_this.selectedRegion === null) {
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
      return $.each(this.years, (function(_this) {
        return function(index, year) {
          return yearselect.append(AppView.templates.yearSelector({
            year: year
          }));
        };
      })(this));
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
      return this.$('.reviewblock').html(AppView.templates.reviewBlock(summary));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9wdnJkd2IvamN1L2NuZy93ZWJhcHAvbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL3B2cmR3Yi9qY3UvY25nL3dlYmFwcC9jbGltYXNuZy9zcmMvanMvZmFrZV82ODEwMjBiZC5qcyIsIi9Vc2Vycy9wdnJkd2IvamN1L2NuZy93ZWJhcHAvY2xpbWFzbmcvc3JjL2pzL3JlcG9ydHMvbWFpbi5qcyIsIi9Vc2Vycy9wdnJkd2IvamN1L2NuZy93ZWJhcHAvY2xpbWFzbmcvc3JjL2pzL3JlcG9ydHMvdXRpbC9zaGltcy5qcyIsIi9Vc2Vycy9wdnJkd2IvamN1L2NuZy93ZWJhcHAvY2xpbWFzbmcvc3JjL2pzL3JlcG9ydHMvdmlld3MvYXBwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlxucmVxdWlyZSgnLi9yZXBvcnRzL21haW4nKTtcblxuIiwiKGZ1bmN0aW9uKCkge1xuICB2YXIgQXBwVmlldztcblxuICBpZiAoIXdpbmRvdy5jb25zb2xlKSB7XG4gICAgd2luZG93LmNvbnNvbGUgPSB7XG4gICAgICBsb2c6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4ge307XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIEFwcFZpZXcgPSByZXF1aXJlKCcuL3ZpZXdzL2FwcCcpO1xuXG4gICQoZnVuY3Rpb24oKSB7XG4gICAgdmFyIGFwcHZpZXc7XG4gICAgYXBwdmlldyA9IG5ldyBBcHBWaWV3KCk7XG4gICAgcmV0dXJuIGFwcHZpZXcucmVuZGVyKCk7XG4gIH0pO1xuXG59KS5jYWxsKHRoaXMpO1xuIiwiKGZ1bmN0aW9uKCkge1xuICB2YXIgX19pbmRleE9mID0gW10uaW5kZXhPZiB8fCBmdW5jdGlvbihpdGVtKSB7IGZvciAodmFyIGkgPSAwLCBsID0gdGhpcy5sZW5ndGg7IGkgPCBsOyBpKyspIHsgaWYgKGkgaW4gdGhpcyAmJiB0aGlzW2ldID09PSBpdGVtKSByZXR1cm4gaTsgfSByZXR1cm4gLTE7IH07XG5cbiAgaWYgKCFBcnJheS5wcm90b3R5cGUuZm9yRWFjaCkge1xuICAgIEFycmF5LnByb3RvdHlwZS5mb3JFYWNoID0gZnVuY3Rpb24oZm4sIHNjb3BlKSB7XG4gICAgICB2YXIgaSwgX2ksIF9yZWYsIF9yZXN1bHRzO1xuICAgICAgX3Jlc3VsdHMgPSBbXTtcbiAgICAgIGZvciAoaSA9IF9pID0gMCwgX3JlZiA9IHRoaXMubGVuZ3RoOyAwIDw9IF9yZWYgPyBfaSA8PSBfcmVmIDogX2kgPj0gX3JlZjsgaSA9IDAgPD0gX3JlZiA/ICsrX2kgOiAtLV9pKSB7XG4gICAgICAgIF9yZXN1bHRzLnB1c2goX19pbmRleE9mLmNhbGwodGhpcywgaSkgPj0gMCA/IGZuLmNhbGwoc2NvcGUsIHRoaXNbaV0sIGksIHRoaXMpIDogdm9pZCAwKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBfcmVzdWx0cztcbiAgICB9O1xuICB9XG5cbiAgaWYgKCFBcnJheS5wcm90b3R5cGUuaW5kZXhPZikge1xuICAgIEFycmF5LnByb3RvdHlwZS5pbmRleE9mID0gZnVuY3Rpb24obmVlZGxlKSB7XG4gICAgICB2YXIgaSwgX2ksIF9yZWY7XG4gICAgICBmb3IgKGkgPSBfaSA9IDAsIF9yZWYgPSB0aGlzLmxlbmd0aDsgMCA8PSBfcmVmID8gX2kgPD0gX3JlZiA6IF9pID49IF9yZWY7IGkgPSAwIDw9IF9yZWYgPyArK19pIDogLS1faSkge1xuICAgICAgICBpZiAodGhpc1tpXSA9PT0gbmVlZGxlKSB7XG4gICAgICAgICAgcmV0dXJuIGk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiAtMTtcbiAgICB9O1xuICB9XG5cbn0pLmNhbGwodGhpcyk7XG4iLCIoZnVuY3Rpb24oKSB7XG4gIHZhciBBcHBWaWV3LCBkZWJ1ZztcblxuICByZXF1aXJlKCcuLi91dGlsL3NoaW1zJyk7XG5cblxuICAvKiBqc2hpbnQgLVcwOTMgKi9cblxuXG4gIC8qIGpzaGludCAtVzA0MSAqL1xuXG4gIGRlYnVnID0gZnVuY3Rpb24oaXRlbVRvTG9nLCBpdGVtTGV2ZWwpIHtcbiAgICB2YXIgbGV2ZWxzLCBtZXNzYWdlTnVtLCB0aHJlc2hvbGQsIHRocmVzaG9sZE51bTtcbiAgICBsZXZlbHMgPSBbJ3ZlcnlkZWJ1ZycsICdkZWJ1ZycsICdtZXNzYWdlJywgJ3dhcm5pbmcnXTtcbiAgICB0aHJlc2hvbGQgPSAnbWVzc2FnZSc7XG4gICAgaWYgKCFpdGVtTGV2ZWwpIHtcbiAgICAgIGl0ZW1MZXZlbCA9ICdkZWJ1Zyc7XG4gICAgfVxuICAgIHRocmVzaG9sZE51bSA9IGxldmVscy5pbmRleE9mKHRocmVzaG9sZCk7XG4gICAgbWVzc2FnZU51bSA9IGxldmVscy5pbmRleE9mKGl0ZW1MZXZlbCk7XG4gICAgaWYgKHRocmVzaG9sZE51bSA+IG1lc3NhZ2VOdW0pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKGl0ZW1Ub0xvZyArICcnID09PSBpdGVtVG9Mb2cpIHtcbiAgICAgIHJldHVybiBjb25zb2xlLmxvZyhcIltcIiArIGl0ZW1MZXZlbCArIFwiXSBcIiArIGl0ZW1Ub0xvZyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBjb25zb2xlLmxvZyhpdGVtVG9Mb2cpO1xuICAgIH1cbiAgfTtcblxuICBBcHBWaWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xuICAgIHRhZ05hbWU6ICdmb3JtJyxcbiAgICBjbGFzc05hbWU6ICcnLFxuICAgIGlkOiAncmVwb3J0Zm9ybScsXG4gICAgc3BlY2llc0RhdGFVcmw6IFwiXCIgKyBsb2NhdGlvbi5wcm90b2NvbCArIFwiLy9cIiArIGxvY2F0aW9uLmhvc3QgKyBcIi9zcGVjaWVzZGF0YVwiLFxuICAgIHJhc3RlckFwaVVybDogXCJcIiArIGxvY2F0aW9uLnByb3RvY29sICsgXCIvL2xvY2FsaG9zdDoxMDYwMC9hcGkvcmFzdGVyLzEvd21zX2RhdGFfdXJsXCIsXG4gICAgdHJhY2tTcGxpdHRlcjogZmFsc2UsXG4gICAgdHJhY2tQZXJpb2Q6IDEwMCxcbiAgICBldmVudHM6IHtcbiAgICAgICdjaGFuZ2UgLnNlY3Rpb25zZWxlY3RvciBpbnB1dCc6ICd1cGRhdGVTZWN0aW9uU2VsZWN0aW9uJyxcbiAgICAgICdjaGFuZ2UgLnJlZ2lvbnNlbGVjdCBpbnB1dCc6ICd1cGRhdGVSZWdpb25TZWxlY3Rpb24nLFxuICAgICAgJ2NoYW5nZSAucmVnaW9uc2VsZWN0IHNlbGVjdCc6ICd1cGRhdGVSZWdpb25TZWxlY3Rpb24nLFxuICAgICAgJ2NoYW5nZSAueWVhcnNlbGVjdCBpbnB1dCc6ICd1cGRhdGVZZWFyU2VsZWN0aW9uJyxcbiAgICAgICdjbGljayAuZ2V0cmVwb3J0JzogJ2dldFJlcG9ydCdcbiAgICB9LFxuICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xuICAgICAgZGVidWcoJ0FwcFZpZXcuaW5pdGlhbGl6ZScpO1xuICAgICAgXy5iaW5kQWxsLmFwcGx5KF8sIFt0aGlzXS5jb25jYXQoXy5mdW5jdGlvbnModGhpcykpKTtcbiAgICAgIHRoaXMuZmV0Y2hSZXBvcnRTZWN0aW9ucygpO1xuICAgICAgdGhpcy5mZXRjaFJlZ2lvbnMoKTtcbiAgICAgIHJldHVybiB0aGlzLmZldGNoWWVhcnMoKTtcbiAgICB9LFxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5yZW5kZXInKTtcbiAgICAgIHRoaXMuJGVsLmFwcGVuZChBcHBWaWV3LnRlbXBsYXRlcy5sYXlvdXQoe30pKTtcbiAgICAgIHJldHVybiAkKCcjY29udGVudHdyYXAgLm1haW5jb250ZW50JykuYXBwZW5kKHRoaXMuJGVsKTtcbiAgICB9LFxuICAgIGdldFJlcG9ydDogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgZm9ybTtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LmdldFJlcG9ydCcpO1xuICAgICAgdGhpcy4kKCcjcmVwb3J0Zm9ybScpLnJlbW92ZSgpO1xuICAgICAgZm9ybSA9IFtdO1xuICAgICAgZm9ybS5wdXNoKCc8Zm9ybSBhY3Rpb249XCIvcmVnaW9ucmVwb3J0XCIgbWV0aG9kPVwiZ2V0XCIgaWQ9XCJyZXBvcnRmb3JtXCI+Jyk7XG4gICAgICBmb3JtLnB1c2goJzxpbnB1dCB0eXBlPVwiaGlkZGVuXCIgbmFtZT1cInllYXJcIiB2YWx1ZT1cIicgKyB0aGlzLnNlbGVjdGVkWWVhciArICdcIj4nKTtcbiAgICAgIGZvcm0ucHVzaCgnPGlucHV0IHR5cGU9XCJoaWRkZW5cIiBuYW1lPVwicmVnaW9udHlwZVwiIHZhbHVlPVwiJyArIHRoaXMuc2VsZWN0ZWRSZWdpb25UeXBlICsgJ1wiPicpO1xuICAgICAgZm9ybS5wdXNoKCc8aW5wdXQgdHlwZT1cImhpZGRlblwiIG5hbWU9XCJyZWdpb25cIiB2YWx1ZT1cIicgKyB0aGlzLnNlbGVjdGVkUmVnaW9uICsgJ1wiPicpO1xuICAgICAgZm9ybS5wdXNoKCc8aW5wdXQgdHlwZT1cImhpZGRlblwiIG5hbWU9XCJzZWN0aW9uc1wiIHZhbHVlPVwiJyArIHRoaXMuc2VsZWN0ZWRTZWN0aW9ucy5qb2luKCcgJykgKyAnXCI+Jyk7XG4gICAgICBmb3JtLnB1c2goJzwvZm9ybT4nKTtcbiAgICAgIHRoaXMuJGVsLmFwcGVuZChmb3JtLmpvaW4oJ1xcbicpKTtcbiAgICAgIHJldHVybiB0aGlzLiQoJyNyZXBvcnRmb3JtJykuc3VibWl0KCk7XG4gICAgfSxcbiAgICBmZXRjaFJlcG9ydFNlY3Rpb25zOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBmZXRjaDtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LmZldGNoUmVwb3J0U2VjdGlvbnMnKTtcbiAgICAgIGZldGNoID0gJC5EZWZlcnJlZCgpO1xuICAgICAgZmV0Y2guZG9uZSgoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICB2YXIgc2VjdGlvbnNlbGVjdDtcbiAgICAgICAgICBfdGhpcy5wb3NzaWJsZVNlY3Rpb25zID0gZGF0YS5zZWN0aW9ucztcbiAgICAgICAgICBzZWN0aW9uc2VsZWN0ID0gX3RoaXMuJCgnLnNlY3Rpb25zZWxlY3QnKTtcbiAgICAgICAgICBzZWN0aW9uc2VsZWN0LmVtcHR5KCkucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcnKTtcbiAgICAgICAgICByZXR1cm4gX3RoaXMuYnVpbGRSZXBvcnRTZWN0aW9uTGlzdChfdGhpcy5wb3NzaWJsZVNlY3Rpb25zLCBzZWN0aW9uc2VsZWN0KTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKTtcbiAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBmZXRjaC5yZXNvbHZlKHtcbiAgICAgICAgICBzZWN0aW9uczogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBpZDogJ2ludHJvJyxcbiAgICAgICAgICAgICAgbmFtZTogJ0ludHJvZHVjdGlvbicsXG4gICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAndGl0bGUsIGNyZWRpdHMsIGFuZCBpbnRyb2R1Y3RvcnkgcGFyYWdyYXBocy4nLFxuICAgICAgICAgICAgICBwcmVzZW5jZTogJ3JlcXVpcmVkJyxcbiAgICAgICAgICAgICAgc2VjdGlvbnM6IFtdXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgIGlkOiAnY2xpbWF0ZXJldmlldycsXG4gICAgICAgICAgICAgIG5hbWU6ICdDbGltYXRlIFJldmlldycsXG4gICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnYSBkZXNjcmlwdGlvbiBvZiB0aGUgcmVnaW9uXFwncyBjdXJyZW50IGFuZCBwcm9qZWN0ZWQgY2xpbWF0ZS4nLFxuICAgICAgICAgICAgICBwcmVzZW5jZTogJ29wdGlvbmFsJyxcbiAgICAgICAgICAgICAgc2VjdGlvbnM6IFtcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICBpZDogJ3RlbXBlcmF0dXJlJyxcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICdUZW1wZXJhdHVyZScsXG4gICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ2N1cnJlbnQgYW5kIHByb2plY3RlZCB0ZW1wZXJhdHVyZS4nLFxuICAgICAgICAgICAgICAgICAgcHJlc2VuY2U6ICdvcHRpb25hbCcsXG4gICAgICAgICAgICAgICAgICBzZWN0aW9uczogW11cbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICBpZDogJ3JhaW5mYWxsJyxcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICdSYWluZmFsbCcsXG4gICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ2N1cnJlbnQgYW5kIHByb2plY3RlZCBwcmVjaXBpdGF0aW9uLicsXG4gICAgICAgICAgICAgICAgICBwcmVzZW5jZTogJ29wdGlvbmFsJyxcbiAgICAgICAgICAgICAgICAgIHNlY3Rpb25zOiBbXVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICBpZDogJ2Jpb2RpdmVyc2l0eScsXG4gICAgICAgICAgICAgIG5hbWU6ICdCaW9kaXZlcnNpdHkgUmV2aWV3JyxcbiAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdhIGRlc2NyaXB0aW9uIG9mIHRoZSByZWdpb25cXCdzIGN1cnJlbnQgYW5kIHByb2plY3RlZCBiaW9kaXZlcnNpdHkuJyxcbiAgICAgICAgICAgICAgcHJlc2VuY2U6ICdvcHRpb25hbCcsXG4gICAgICAgICAgICAgIHNlY3Rpb25zOiBbXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgaWQ6ICdvdmVyYWxsJyxcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICdPdmVyYWxsJyxcbiAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnY3VycmVudCBhbmQgcHJvamVjdGVkIGJpb2RpdmVyc2l0eSBvdmVyIGFsbCBtb2RlbGxlZCBzcGVjaWVzLicsXG4gICAgICAgICAgICAgICAgICBwcmVzZW5jZTogJ29wdGlvbmFsJyxcbiAgICAgICAgICAgICAgICAgIHNlY3Rpb25zOiBbXVxuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnbWFtbWFscycsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnTWFtbWFscycsXG4gICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ2N1cnJlbnQgYW5kIHByb2plY3RlZCBiaW9kaXZlcnNpdHkgb3ZlciBtYW1tYWwgc3BlY2llcy4nLFxuICAgICAgICAgICAgICAgICAgcHJlc2VuY2U6ICdvcHRpb25hbCcsXG4gICAgICAgICAgICAgICAgICBzZWN0aW9uczogW11cbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICBpZDogJ2FtcGhpYmlhbnMnLFxuICAgICAgICAgICAgICAgICAgbmFtZTogJ0FtcGhpYmlhbnMnLFxuICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdjdXJyZW50IGFuZCBwcm9qZWN0ZWQgYmlvZGl2ZXJzaXR5IG92ZXIgYW1waGliaWFuIHNwZWNpZXMuJyxcbiAgICAgICAgICAgICAgICAgIHByZXNlbmNlOiAnb3B0aW9uYWwnLFxuICAgICAgICAgICAgICAgICAgc2VjdGlvbnM6IFtcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgIGlkOiAnYWxsYW1waGliaWFucycsXG4gICAgICAgICAgICAgICAgICAgICAgbmFtZTogJ0FsbCcsXG4gICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdjdXJyZW50IGFuZCBwcm9qZWN0ZWQgYmlvZGl2ZXJzaXR5IG92ZXIgYWxsIGFtcGhpYmlhbiBzcGVjaWVzLicsXG4gICAgICAgICAgICAgICAgICAgICAgcHJlc2VuY2U6ICdvcHRpb25hbCcsXG4gICAgICAgICAgICAgICAgICAgICAgc2VjdGlvbnM6IFtdXG4gICAgICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgICBpZDogJ3N0cmVhbWZyb2dzJyxcbiAgICAgICAgICAgICAgICAgICAgICBuYW1lOiAnU3RyZWFtIGZyb2dzJyxcbiAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ2N1cnJlbnQgYW5kIHByb2plY3RlZCBiaW9kaXZlcnNpdHkgb3ZlciBzdHJlYW0gZnJvZ3MuJyxcbiAgICAgICAgICAgICAgICAgICAgICBwcmVzZW5jZTogJ29wdGlvbmFsJyxcbiAgICAgICAgICAgICAgICAgICAgICBzZWN0aW9uczogW11cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAncmVwdGlsZXMnLFxuICAgICAgICAgICAgICAgICAgbmFtZTogJ1JlcHRpbGVzJyxcbiAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnY3VycmVudCBhbmQgcHJvamVjdGVkIGJpb2RpdmVyc2l0eSBvdmVyIHJlcHRpbGUgc3BlY2llcy4nLFxuICAgICAgICAgICAgICAgICAgcHJlc2VuY2U6ICdvcHRpb25hbCcsXG4gICAgICAgICAgICAgICAgICBzZWN0aW9uczogW1xuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgaWQ6ICdhbGxyZXB0aWxlcycsXG4gICAgICAgICAgICAgICAgICAgICAgbmFtZTogJ0FsbCcsXG4gICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdjdXJyZW50IGFuZCBwcm9qZWN0ZWQgYmlvZGl2ZXJzaXR5IG92ZXIgYWxsIHJlcHRpbGUgc3BlY2llcy4nLFxuICAgICAgICAgICAgICAgICAgICAgIHByZXNlbmNlOiAnb3B0aW9uYWwnLFxuICAgICAgICAgICAgICAgICAgICAgIHNlY3Rpb25zOiBbXVxuICAgICAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgICAgaWQ6ICd0dXJ0bGVzJyxcbiAgICAgICAgICAgICAgICAgICAgICBuYW1lOiAnVHVydGxlcycsXG4gICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdjdXJyZW50IGFuZCBwcm9qZWN0ZWQgYmlvZGl2ZXJzaXR5IG92ZXIgdHVydGxlcy4nLFxuICAgICAgICAgICAgICAgICAgICAgIHByZXNlbmNlOiAnb3B0aW9uYWwnLFxuICAgICAgICAgICAgICAgICAgICAgIHNlY3Rpb25zOiBbXVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgaWQ6ICdiaXJkcycsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnQmlyZHMnLFxuICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdjdXJyZW50IGFuZCBwcm9qZWN0ZWQgYmlvZGl2ZXJzaXR5IG92ZXIgYmlyZCBzcGVjaWVzLicsXG4gICAgICAgICAgICAgICAgICBwcmVzZW5jZTogJ29wdGlvbmFsJyxcbiAgICAgICAgICAgICAgICAgIHNlY3Rpb25zOiBbXVxuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnZnJlc2h3YXRlcmZpc2gnLFxuICAgICAgICAgICAgICAgICAgbmFtZTogJ0ZyZXNod2F0ZXIgZmlzaCcsXG4gICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ2N1cnJlbnQgYW5kIHByb2plY3RlZCBiaW9kaXZlcnNpdHkgb3ZlciBmcmVzaHdhdGVyIGZpc2ggc3BlY2llcy4nLFxuICAgICAgICAgICAgICAgICAgcHJlc2VuY2U6ICdvcHRpb25hbCcsXG4gICAgICAgICAgICAgICAgICBzZWN0aW9uczogW11cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgaWQ6ICdwZXN0cycsXG4gICAgICAgICAgICAgIG5hbWU6ICdQZXN0IFNwZWNpZXMnLFxuICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ2NsaW1hdGUgc3VpdGFiaWxpdHkgYW5kIGRpc3RyaWJ1dGlvbiBvZiBwZXN0IHNwZWNpZXMuJyxcbiAgICAgICAgICAgICAgcHJlc2VuY2U6ICdvcHRpb25hbCcsXG4gICAgICAgICAgICAgIHNlY3Rpb25zOiBbXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgaWQ6ICdwZXN0cGxhbnRzJyxcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICdQZXN0IFBsYW50cycsXG4gICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ3N1bW1hcnkgb2YgcHJvamVjdGlvbnMgZm9yIHNlbGVjdGVkIHBlc3QgcGxhbnRzLicsXG4gICAgICAgICAgICAgICAgICBwcmVzZW5jZTogJ29wdGlvbmFsJyxcbiAgICAgICAgICAgICAgICAgIHNlY3Rpb25zOiBbXVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICBpZDogJ2FwcGVuZGl4ZXMnLFxuICAgICAgICAgICAgICBuYW1lOiAnQXBwZW5kaWNlcycsXG4gICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAndGFibGVzIGFuZCBvdGhlciBhcHBlbmRpY2VzLicsXG4gICAgICAgICAgICAgIHByZXNlbmNlOiAncmVxdWlyZWQnLFxuICAgICAgICAgICAgICBzZWN0aW9uczogW1xuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnb2JzZXJ2ZWRtYW1tYWxsaXN0JyxcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICdNYW1tYWxzIFByZXNlbnQnLFxuICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdsaXN0IG9mIG1hbW1hbHMgY3VycmVudGx5IG9yIHByb2plY3RlZCB0byBiZSBwcmVzZW50IGluIHJlZ2lvbi4nLFxuICAgICAgICAgICAgICAgICAgcHJlc2VuY2U6ICdvcHRpb25hbCcsXG4gICAgICAgICAgICAgICAgICBzZWN0aW9uczogW11cbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICBpZDogJ29ic2VydmVkYW1waGliaWFuc2xpc3QnLFxuICAgICAgICAgICAgICAgICAgbmFtZTogJ0FtcGhpYmlhbnMgUHJlc2VudCcsXG4gICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ2xpc3Qgb2YgYW1waGliaWFucyBjdXJyZW50bHkgb3IgcHJvamVjdGVkIHRvIGJlIHByZXNlbnQgaW4gcmVnaW9uLicsXG4gICAgICAgICAgICAgICAgICBwcmVzZW5jZTogJ29wdGlvbmFsJyxcbiAgICAgICAgICAgICAgICAgIHNlY3Rpb25zOiBbXVxuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnb2JzZXJ2ZWRzdHJlYW1mcm9nc2xpc3QnLFxuICAgICAgICAgICAgICAgICAgbmFtZTogJ1N0ZWFtIEZyb2dzIFByZXNlbnQnLFxuICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdsaXN0IG9mIHN0cmVhbSBmcm9ncyBjdXJyZW50bHkgb3IgcHJvamVjdGVkIHRvIGJlIHByZXNlbnQgaW4gcmVnaW9uLicsXG4gICAgICAgICAgICAgICAgICBwcmVzZW5jZTogJ29wdGlvbmFsJyxcbiAgICAgICAgICAgICAgICAgIHNlY3Rpb25zOiBbXVxuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnb2JzZXJ2ZWRyZXB0aWxlc2xpc3QnLFxuICAgICAgICAgICAgICAgICAgbmFtZTogJ1JlcHRpbGVzIFByZXNlbnQnLFxuICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdsaXN0IG9mIHJlcHRpbGVzIGN1cnJlbnRseSBvciBwcm9qZWN0ZWQgdG8gYmUgcHJlc2VudCBpbiByZWdpb24uJyxcbiAgICAgICAgICAgICAgICAgIHByZXNlbmNlOiAnb3B0aW9uYWwnLFxuICAgICAgICAgICAgICAgICAgc2VjdGlvbnM6IFtdXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgaWQ6ICdvYnNlcnZlZHR1cnRsZXNsaXN0JyxcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICdUdXJ0bGVzIFByZXNlbnQnLFxuICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdsaXN0IG9mIHR1cnRsZXMgY3VycmVudGx5IG9yIHByb2plY3RlZCB0byBiZSBwcmVzZW50IGluIHJlZ2lvbi4nLFxuICAgICAgICAgICAgICAgICAgcHJlc2VuY2U6ICdvcHRpb25hbCcsXG4gICAgICAgICAgICAgICAgICBzZWN0aW9uczogW11cbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICBpZDogJ29ic2VydmVkYmlyZHNsaXN0JyxcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICdCaXJkcyBQcmVzZW50JyxcbiAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnbGlzdCBvZiBiaXJkcyBjdXJyZW50bHkgb3IgcHJvamVjdGVkIHRvIGJlIHByZXNlbnQgaW4gcmVnaW9uLicsXG4gICAgICAgICAgICAgICAgICBwcmVzZW5jZTogJ29wdGlvbmFsJyxcbiAgICAgICAgICAgICAgICAgIHNlY3Rpb25zOiBbXVxuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnc2NpZW5jZScsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnU2NpZW5jZScsXG4gICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ2Rlc2NyaXB0aW9uIG9mIHRoZSBjbGltYXRlIGFuZCBzcGVjaWVzIGRpc3RyaWJ1dGlvbiBtb2RlbGxpbmcgdXNlZCB0byBnZW5lcmF0ZSB0aGUgZGF0YSBpbiB0aGUgcmVwb3J0LicsXG4gICAgICAgICAgICAgICAgICBwcmVzZW5jZTogJ3JlcXVpcmVkJyxcbiAgICAgICAgICAgICAgICAgIHNlY3Rpb25zOiBbXVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfVxuICAgICAgICAgIF1cbiAgICAgICAgfSk7XG4gICAgICB9LCA1MDAgKyAoNTAwICogTWF0aC5yYW5kb20oKSkpO1xuICAgICAgcmV0dXJuIGZldGNoLnByb21pc2UoKTtcbiAgICB9LFxuICAgIGJ1aWxkUmVwb3J0U2VjdGlvbkxpc3Q6IGZ1bmN0aW9uKGRhdGEsIHdyYXBwZXIpIHtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LmJ1aWxkUmVwb3J0U2VjdGlvbkxpc3QnKTtcbiAgICAgIHJldHVybiAkLmVhY2goZGF0YSwgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihpbmRleCwgaXRlbSkge1xuICAgICAgICAgIHZhciBzZWxlY3RvclJvdywgc3Vic2VjdGlvbnM7XG4gICAgICAgICAgc2VsZWN0b3JSb3cgPSAkKEFwcFZpZXcudGVtcGxhdGVzLnNlY3Rpb25TZWxlY3RvcihpdGVtKSk7XG4gICAgICAgICAgJCh3cmFwcGVyKS5hcHBlbmQoc2VsZWN0b3JSb3cpO1xuICAgICAgICAgIGlmIChpdGVtLnNlY3Rpb25zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHN1YnNlY3Rpb25zID0gJChBcHBWaWV3LnRlbXBsYXRlcy5zdWJzZWN0aW9ucygpKTtcbiAgICAgICAgICAgIF90aGlzLmJ1aWxkUmVwb3J0U2VjdGlvbkxpc3QoaXRlbS5zZWN0aW9ucywgc3Vic2VjdGlvbnMpO1xuICAgICAgICAgICAgcmV0dXJuICQoc2VsZWN0b3JSb3cpLmFkZENsYXNzKCdoYXNzdWJzZWN0aW9ucycpLmFwcGVuZChzdWJzZWN0aW9ucyk7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpO1xuICAgIH0sXG4gICAgdXBkYXRlU2VjdGlvblNlbGVjdGlvbjogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LnVwZGF0ZVNlY3Rpb25TZWxlY3Rpb24nKTtcbiAgICAgIHJldHVybiB0aGlzLmhhbmRsZVNlY3Rpb25TZWxlY3Rpb24odGhpcy5wb3NzaWJsZVNlY3Rpb25zKTtcbiAgICB9LFxuICAgIGhhbmRsZVNlY3Rpb25TZWxlY3Rpb246IGZ1bmN0aW9uKHNlY3Rpb25MaXN0LCBwYXJlbnQpIHtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LmhhbmRsZVNlY3Rpb25TZWxlY3Rpb24nKTtcbiAgICAgICQuZWFjaChzZWN0aW9uTGlzdCwgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihpbmRleCwgaXRlbSkge1xuICAgICAgICAgIHZhciBzZWxlY3Rpb25Db250cm9sLCBzZWxlY3RvciwgX3JlZjtcbiAgICAgICAgICBzZWxlY3RvciA9IF90aGlzLiQoXCIjc2VjdGlvbi1cIiArIGl0ZW0uaWQpO1xuICAgICAgICAgIHNlbGVjdGlvbkNvbnRyb2wgPSBzZWxlY3Rvci5maW5kKCdpbnB1dCcpO1xuICAgICAgICAgIGlmIChzZWxlY3Rpb25Db250cm9sLnByb3AoJ2NoZWNrZWQnKSkge1xuICAgICAgICAgICAgc2VsZWN0b3IucmVtb3ZlQ2xhc3MoJ3Vuc2VsZWN0ZWQnKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2VsZWN0b3IuYWRkQ2xhc3MoJ3Vuc2VsZWN0ZWQnKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKCgoX3JlZiA9IGl0ZW0uc2VjdGlvbnMpICE9IG51bGwgPyBfcmVmLmxlbmd0aCA6IHZvaWQgMCkgPiAwKSB7XG4gICAgICAgICAgICByZXR1cm4gX3RoaXMuaGFuZGxlU2VjdGlvblNlbGVjdGlvbihpdGVtLnNlY3Rpb25zLCBpdGVtLmlkKTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKSk7XG4gICAgICByZXR1cm4gdGhpcy51cGRhdGVTdW1tYXJ5KCk7XG4gICAgfSxcbiAgICBmZXRjaFJlZ2lvbnM6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGZldGNoO1xuICAgICAgZGVidWcoJ0FwcFZpZXcuZmV0Y2hSZWdpb25zJyk7XG4gICAgICBmZXRjaCA9ICQuRGVmZXJyZWQoKTtcbiAgICAgIGZldGNoLmRvbmUoKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgcmV0dXJuIF90aGlzLmJ1aWxkUmVnaW9uTGlzdChkYXRhKTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKTtcbiAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBmZXRjaC5yZXNvbHZlKHtcbiAgICAgICAgICByZWdpb250eXBlczogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBpZDogJ25ybScsXG4gICAgICAgICAgICAgIG5hbWU6ICdOUk0gcmVnaW9uJyxcbiAgICAgICAgICAgICAgcmVnaW9uczogW1xuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnTlJNX0FDVCcsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnQUNUJ1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnTlJNX0FkZWxhaWRlX2FuZF9Nb3VudF9Mb2Z0eV9SYW5nZXMnLFxuICAgICAgICAgICAgICAgICAgbmFtZTogJ0FkZWxhaWRlIGFuZCBNb3VudCBMb2Z0eSBSYW5nZXMnXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgaWQ6ICdOUk1fQWxpbnl0amFyYV9XaWx1cmFyYScsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnQWxpbnl0amFyYSBXaWx1cmFyYSdcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICBpZDogJ05STV9Bdm9uJyxcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICdBdm9uJ1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnTlJNX0JvcmRlcl9SaXZlcnMtR3d5ZGlyJyxcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICdCb3JkZXIgUml2ZXJzLUd3eWRpcidcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICBpZDogJ05STV9Cb3JkZXJfUml2ZXJzX01hcmFub2EtQmFsb25uZScsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnQm9yZGVyIFJpdmVycyBNYXJhbm9hLUJhbG9ubmUnXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgaWQ6ICdOUk1fQnVyZGVraW4nLFxuICAgICAgICAgICAgICAgICAgbmFtZTogJ0J1cmRla2luJ1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnTlJNX0J1cm5ldHRfTWFyeScsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnQnVybmV0dCBNYXJ5J1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnTlJNX0NhcGVfWW9yaycsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnQ2FwZSBZb3JrJ1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnTlJNX0NlbnRyYWxfV2VzdCcsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnQ2VudHJhbCBXZXN0J1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnTlJNX0NvbmRhbWluZScsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnQ29uZGFtaW5lJ1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnTlJNX0Nvb3BlcmF0aXZlX01hbmFnZW1lbnRfQXJlYScsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnQ29vcGVyYXRpdmUgTWFuYWdlbWVudCBBcmVhJ1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnTlJNX0NvcmFuZ2FtaXRlJyxcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICdDb3JhbmdhbWl0ZSdcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICBpZDogJ05STV9EZXNlcnRfQ2hhbm5lbHMnLFxuICAgICAgICAgICAgICAgICAgbmFtZTogJ0Rlc2VydCBDaGFubmVscydcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICBpZDogJ05STV9FYXN0X0dpcHBzbGFuZCcsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnRWFzdCBHaXBwc2xhbmQnXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgaWQ6ICdOUk1fRXlyZV9QZW5pbnN1bGEnLFxuICAgICAgICAgICAgICAgICAgbmFtZTogJ0V5cmUgUGVuaW5zdWxhJ1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnTlJNX0ZpdHpyb3knLFxuICAgICAgICAgICAgICAgICAgbmFtZTogJ0ZpdHpyb3knXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgaWQ6ICdOUk1fR2xlbmVsZ19Ib3BraW5zJyxcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICdHbGVuZWxnIEhvcGtpbnMnXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgaWQ6ICdOUk1fR291bGJ1cm5fQnJva2VuJyxcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICdHb3VsYnVybiBCcm9rZW4nXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgaWQ6ICdOUk1fSGF3a2VzYnVyeS1OZXBlYW4nLFxuICAgICAgICAgICAgICAgICAgbmFtZTogJ0hhd2tlc2J1cnktTmVwZWFuJ1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnTlJNX0h1bnRlci1DZW50cmFsX1JpdmVycycsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnSHVudGVyLUNlbnRyYWxfUml2ZXJzJ1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnTlJNX0thbmdhcm9vX0lzbGFuZCcsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnS2FuZ2Fyb28gSXNsYW5kJ1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnTlJNX0xhY2hsYW4nLFxuICAgICAgICAgICAgICAgICAgbmFtZTogJ0xhY2hsYW4nXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgaWQ6ICdOUk1fTG93ZXJfTXVycmF5X0RhcmxpbmcnLFxuICAgICAgICAgICAgICAgICAgbmFtZTogJ0xvd2VyIE11cnJheSBEYXJsaW5nJ1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnTlJNX01hY2theV9XaGl0c3VuZGF5JyxcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICdNYWNrYXkgV2hpdHN1bmRheSdcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICBpZDogJ05STV9NYWxsZWUnLFxuICAgICAgICAgICAgICAgICAgbmFtZTogJ01hbGxlZSdcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICBpZDogJ05STV9NdXJyYXknLFxuICAgICAgICAgICAgICAgICAgbmFtZTogJ011cnJheSdcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICBpZDogJ05STV9NdXJydW1iaWRnZWUnLFxuICAgICAgICAgICAgICAgICAgbmFtZTogJ011cnJ1bWJpZGdlZSdcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICBpZDogJ05STV9OYW1vaScsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnTmFtb2knXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgaWQ6ICdOUk1fTm9ydGgnLFxuICAgICAgICAgICAgICAgICAgbmFtZTogJ05vcnRoJ1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnTlJNX05vcnRoX0NlbnRyYWwnLFxuICAgICAgICAgICAgICAgICAgbmFtZTogJ05vcnRoIENlbnRyYWwnXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgaWQ6ICdOUk1fTm9ydGhfRWFzdCcsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnTm9ydGggRWFzdCdcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICBpZDogJ05STV9Ob3J0aF9XZXN0JyxcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICdOb3J0aCBXZXN0J1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnTlJNX05vcnRoZXJuX0FncmljdWx0dXJhbCcsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnTm9ydGhlcm4gQWdyaWN1bHR1cmFsJ1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnTlJNX05vcnRoZXJuX0d1bGYnLFxuICAgICAgICAgICAgICAgICAgbmFtZTogJ05vcnRoZXJuIEd1bGYnXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgaWQ6ICdOUk1fTm9ydGhlcm5fUml2ZXJzJyxcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICdOb3J0aGVybiBSaXZlcnMnXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgaWQ6ICdOUk1fTm9ydGhlcm5fVGVycml0b3J5JyxcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICdOb3J0aGVybiBUZXJyaXRvcnknXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgaWQ6ICdOUk1fTm9ydGhlcm5fYW5kX1lvcmtlJyxcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICdOb3J0aGVybiBhbmQgWW9ya2UnXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgaWQ6ICdOUk1fUGVydGgnLFxuICAgICAgICAgICAgICAgICAgbmFtZTogJ1BlcnRoJ1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnTlJNX1BvcnRfUGhpbGxpcF9hbmRfV2VzdGVybl9Qb3J0JyxcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICdQb3J0IFBoaWxsaXAgYW5kIFdlc3Rlcm4gUG9ydCdcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICBpZDogJ05STV9SYW5nZWxhbmRzJyxcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICdSYW5nZWxhbmRzJ1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnTlJNX1NvdXRoJyxcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICdTb3V0aCdcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICBpZDogJ05STV9Tb3V0aF9BdXN0cmFsaWFuX0FyaWRfTGFuZHMnLFxuICAgICAgICAgICAgICAgICAgbmFtZTogJ1NvdXRoIEF1c3RyYWxpYW4gQXJpZCBMYW5kcydcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICBpZDogJ05STV9Tb3V0aF9BdXN0cmFsaWFuX011cnJheV9EYXJsaW5nX0Jhc2luJyxcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICdTb3V0aCBBdXN0cmFsaWFuIE11cnJheSBEYXJsaW5nIEJhc2luJ1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnTlJNX1NvdXRoX0NvYXN0JyxcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICdTb3V0aCBDb2FzdCdcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICBpZDogJ05STV9Tb3V0aF9FYXN0JyxcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICdTb3V0aCBFYXN0J1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnTlJNX1NvdXRoX0Vhc3RfUXVlZW5zbGFuZCcsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnU291dGggRWFzdCBRdWVlbnNsYW5kJ1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnTlJNX1NvdXRoX1dlc3QnLFxuICAgICAgICAgICAgICAgICAgbmFtZTogJ1NvdXRoIFdlc3QnXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgaWQ6ICdOUk1fU291dGhfV2VzdF9RdWVlbnNsYW5kJyxcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICdTb3V0aCBXZXN0IFF1ZWVuc2xhbmQnXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgaWQ6ICdOUk1fU291dGhlcm5fR3VsZicsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnU291dGhlcm4gR3VsZidcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICBpZDogJ05STV9Tb3V0aGVybl9SaXZlcnMnLFxuICAgICAgICAgICAgICAgICAgbmFtZTogJ1NvdXRoZXJuIFJpdmVycydcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICBpZDogJ05STV9TeWRuZXlfTWV0cm8nLFxuICAgICAgICAgICAgICAgICAgbmFtZTogJ1N5ZG5leSBNZXRybydcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICBpZDogJ05STV9Ub3JyZXNfU3RyYWl0JyxcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICdUb3JyZXMgU3RyYWl0J1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnTlJNX1dlc3RfR2lwcHNsYW5kJyxcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICdXZXN0IEdpcHBzbGFuZCdcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICBpZDogJ05STV9XZXN0ZXJuJyxcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICdXZXN0ZXJuJ1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnTlJNX1dldF9Ucm9waWNzJyxcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICdXZXQgVHJvcGljcydcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICBpZDogJ05STV9XaW1tZXJhJyxcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICdXaW1tZXJhJ1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICBpZDogJ2licmEnLFxuICAgICAgICAgICAgICBuYW1lOiAnSUJSQSBiaW9yZWdpb24nLFxuICAgICAgICAgICAgICByZWdpb25zOiBbXVxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICBpZDogJ3BhcmsnLFxuICAgICAgICAgICAgICBuYW1lOiAnUGFya3MsIHJlc2VydmVzJyxcbiAgICAgICAgICAgICAgcmVnaW9uczogW11cbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgaWQ6ICdzdGF0ZScsXG4gICAgICAgICAgICAgIG5hbWU6ICdTdGF0ZSwgdGVycml0b3J5JyxcbiAgICAgICAgICAgICAgcmVnaW9uczogW1xuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnU3RhdGVfQXVzdHJhbGlhbl9DYXBpdGFsX1RlcnJpdG9yeScsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnQUNUJ1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnU3RhdGVfTmV3X1NvdXRoX1dhbGVzJyxcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICdOZXcgU291dGggV2FsZXMnXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgaWQ6ICdTdGF0ZV9Ob3J0aGVybl9UZXJyaXRvcnknLFxuICAgICAgICAgICAgICAgICAgbmFtZTogJ05vcnRoZXJuIFRlcnJpdG9yeSdcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICBpZDogJ1N0YXRlX1F1ZWVuc2xhbmQnLFxuICAgICAgICAgICAgICAgICAgbmFtZTogJ1F1ZWVuc2xhbmQnXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgaWQ6ICdTdGF0ZV9Tb3V0aF9BdXN0cmFsaWEnLFxuICAgICAgICAgICAgICAgICAgbmFtZTogJ1NvdXRoIEF1c3RyYWxpYSdcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICBpZDogJ1N0YXRlX1Rhc21hbmlhJyxcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICdUYXNtYW5pYSdcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICBpZDogJ1N0YXRlX1ZpY3RvcmlhJyxcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICdWaWN0b3JpYSdcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICBpZDogJ1N0YXRlX1dlc3Rlcm5fQXVzdHJhbGlhJyxcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICdXZXN0ZXJuIEF1c3RyYWxpYSdcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICBdXG4gICAgICAgIH0pO1xuICAgICAgfSwgNTAwICsgKDUwMCAqIE1hdGgucmFuZG9tKCkpKTtcbiAgICAgIHJldHVybiBmZXRjaC5wcm9taXNlKCk7XG4gICAgfSxcbiAgICBidWlsZFJlZ2lvbkxpc3Q6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIHZhciByZWdpb25zZWxlY3Q7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5idWlsZFJlZ2lvbkxpc3QnKTtcbiAgICAgIHRoaXMucmVnaW9ucyA9IGRhdGEucmVnaW9udHlwZXM7XG4gICAgICByZWdpb25zZWxlY3QgPSB0aGlzLiQoJy5yZWdpb25zZWxlY3QnKTtcbiAgICAgIHJlZ2lvbnNlbGVjdC5lbXB0eSgpLnJlbW92ZUNsYXNzKCdsb2FkaW5nJyk7XG4gICAgICByZXR1cm4gJC5lYWNoKHRoaXMucmVnaW9ucywgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihpbmRleCwgcmVnaW9uVHlwZSkge1xuICAgICAgICAgIHZhciByZWcsIHJlZ2lvblR5cGVSb3c7XG4gICAgICAgICAgcmVnaW9uVHlwZS5vcHRpb25MaXN0ID0gW1xuICAgICAgICAgICAgKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICB2YXIgX2ksIF9sZW4sIF9yZWYsIF9yZXN1bHRzO1xuICAgICAgICAgICAgICBfcmVmID0gcmVnaW9uVHlwZS5yZWdpb25zO1xuICAgICAgICAgICAgICBfcmVzdWx0cyA9IFtdO1xuICAgICAgICAgICAgICBmb3IgKF9pID0gMCwgX2xlbiA9IF9yZWYubGVuZ3RoOyBfaSA8IF9sZW47IF9pKyspIHtcbiAgICAgICAgICAgICAgICByZWcgPSBfcmVmW19pXTtcbiAgICAgICAgICAgICAgICBfcmVzdWx0cy5wdXNoKEFwcFZpZXcudGVtcGxhdGVzLnJlZ2lvblNlbGVjdG9yKHJlZykpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHJldHVybiBfcmVzdWx0cztcbiAgICAgICAgICAgIH0pKClcbiAgICAgICAgICBdLmpvaW4oXCJcXG5cIik7XG4gICAgICAgICAgcmVnaW9uVHlwZVJvdyA9ICQoQXBwVmlldy50ZW1wbGF0ZXMucmVnaW9uVHlwZVNlbGVjdG9yKHJlZ2lvblR5cGUpKTtcbiAgICAgICAgICByZXR1cm4gcmVnaW9uc2VsZWN0LmFwcGVuZChyZWdpb25UeXBlUm93KTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKTtcbiAgICB9LFxuICAgIHVwZGF0ZVJlZ2lvblNlbGVjdGlvbjogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgIHZhciBzZWxlY3RlZFR5cGU7XG4gICAgICBkZWJ1ZygnQXBwVmlldy51cGRhdGVSZWdpb25TZWxlY3Rpb24nKTtcbiAgICAgIHNlbGVjdGVkVHlwZSA9IHRoaXMuJCgnW25hbWU9cmVnaW9udHlwZV06Y2hlY2tlZCcpLnZhbCgpO1xuICAgICAgJC5lYWNoKHRoaXMucmVnaW9ucywgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihpbmRleCwgcmVnaW9uVHlwZSkge1xuICAgICAgICAgIHZhciBzZWxlY3RvcjtcbiAgICAgICAgICBzZWxlY3RvciA9IF90aGlzLiQoXCIjcmVnaW9udHlwZS1cIiArIHJlZ2lvblR5cGUuaWQpO1xuICAgICAgICAgIGlmIChzZWxlY3RlZFR5cGUgPT09IHJlZ2lvblR5cGUuaWQpIHtcbiAgICAgICAgICAgIHNlbGVjdG9yLmFkZENsYXNzKCd0eXBlc2VsZWN0ZWQnKTtcbiAgICAgICAgICAgIF90aGlzLnNlbGVjdGVkUmVnaW9uVHlwZSA9IHJlZ2lvblR5cGUuaWQ7XG4gICAgICAgICAgICBfdGhpcy5zZWxlY3RlZFJlZ2lvbiA9ICQoc2VsZWN0b3IuZmluZCgnc2VsZWN0JykpLnZhbCgpO1xuICAgICAgICAgICAgaWYgKF90aGlzLnNlbGVjdGVkUmVnaW9uID09PSBudWxsKSB7XG4gICAgICAgICAgICAgIHJldHVybiBzZWxlY3Rvci5yZW1vdmVDbGFzcygncmVnaW9uc2VsZWN0ZWQnKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHNlbGVjdG9yLmFkZENsYXNzKCdyZWdpb25zZWxlY3RlZCcpO1xuICAgICAgICAgICAgICByZXR1cm4gX3RoaXMuc2VsZWN0ZWRSZWdpb25JbmZvID0gXy5maW5kKHJlZ2lvblR5cGUucmVnaW9ucywgZnVuY3Rpb24ocmVnaW9uKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlZ2lvbi5pZCA9PT0gX3RoaXMuc2VsZWN0ZWRSZWdpb247XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gc2VsZWN0b3IucmVtb3ZlQ2xhc3MoJ3R5cGVzZWxlY3RlZCcpO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKTtcbiAgICAgIHJldHVybiB0aGlzLnVwZGF0ZVN1bW1hcnkoKTtcbiAgICB9LFxuICAgIGZldGNoWWVhcnM6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGZldGNoO1xuICAgICAgZGVidWcoJ0FwcFZpZXcuZmV0Y2hZZWFycycpO1xuICAgICAgZmV0Y2ggPSAkLkRlZmVycmVkKCk7XG4gICAgICBmZXRjaC5kb25lKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgIHJldHVybiBfdGhpcy5idWlsZFllYXJMaXN0KGRhdGEpO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpO1xuICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGZldGNoLnJlc29sdmUoe1xuICAgICAgICAgIHllYXJzOiBbJzIwMTUnLCAnMjAyNScsICcyMDM1JywgJzIwNDUnLCAnMjA1NScsICcyMDY1JywgJzIwNzUnLCAnMjA4NSddXG4gICAgICAgIH0pO1xuICAgICAgfSwgNTAwICsgKDUwMCAqIE1hdGgucmFuZG9tKCkpKTtcbiAgICAgIHJldHVybiBmZXRjaC5wcm9taXNlKCk7XG4gICAgfSxcbiAgICBidWlsZFllYXJMaXN0OiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICB2YXIgeWVhcnNlbGVjdDtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LmJ1aWxkWWVhckxpc3QnKTtcbiAgICAgIHRoaXMueWVhcnMgPSBkYXRhLnllYXJzO1xuICAgICAgeWVhcnNlbGVjdCA9IHRoaXMuJCgnLnllYXJzZWxlY3QnKTtcbiAgICAgIHllYXJzZWxlY3QuZW1wdHkoKS5yZW1vdmVDbGFzcygnbG9hZGluZycpO1xuICAgICAgcmV0dXJuICQuZWFjaCh0aGlzLnllYXJzLCAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGluZGV4LCB5ZWFyKSB7XG4gICAgICAgICAgcmV0dXJuIHllYXJzZWxlY3QuYXBwZW5kKEFwcFZpZXcudGVtcGxhdGVzLnllYXJTZWxlY3Rvcih7XG4gICAgICAgICAgICB5ZWFyOiB5ZWFyXG4gICAgICAgICAgfSkpO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpO1xuICAgIH0sXG4gICAgdXBkYXRlWWVhclNlbGVjdGlvbjogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LnVwZGF0ZVllYXJTZWxlY3Rpb24nKTtcbiAgICAgIHRoaXMuc2VsZWN0ZWRZZWFyID0gdGhpcy4kKCdbbmFtZT15ZWFyc2VsZWN0b3JdOmNoZWNrZWQnKS52YWwoKTtcbiAgICAgICQuZWFjaCh0aGlzLnllYXJzLCAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGluZGV4LCB5ZWFyKSB7XG4gICAgICAgICAgdmFyIHNlbGVjdG9yO1xuICAgICAgICAgIHNlbGVjdG9yID0gX3RoaXMuJChcIiN5ZWFyLVwiICsgeWVhcik7XG4gICAgICAgICAgaWYgKF90aGlzLnNlbGVjdGVkWWVhciA9PT0geWVhcikge1xuICAgICAgICAgICAgcmV0dXJuIHNlbGVjdG9yLmFkZENsYXNzKCd5ZWFyc2VsZWN0ZWQnKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHNlbGVjdG9yLnJlbW92ZUNsYXNzKCd5ZWFyc2VsZWN0ZWQnKTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKSk7XG4gICAgICByZXR1cm4gdGhpcy51cGRhdGVTdW1tYXJ5KCk7XG4gICAgfSxcbiAgICBzZWN0aW9uSWQ6IGZ1bmN0aW9uKHNlY3Rpb25Eb20pIHtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LnNlY3Rpb25JZCcpO1xuICAgICAgcmV0dXJuICQoc2VjdGlvbkRvbSkuZmluZCgnaW5wdXQnKS5hdHRyKCd2YWx1ZScpO1xuICAgIH0sXG4gICAgc2VjdGlvbk5hbWU6IGZ1bmN0aW9uKHNlY3Rpb25Eb20pIHtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LnNlY3Rpb25OYW1lJyk7XG4gICAgICByZXR1cm4gdGhpcy5zZWN0aW9uSW5mbyhzZWN0aW9uRG9tKS5uYW1lO1xuICAgIH0sXG4gICAgc2VjdGlvbkluZm86IGZ1bmN0aW9uKHNlY3Rpb25Eb20pIHtcbiAgICAgIHZhciBpbmZvLCBwYXJlbnRJZHMsIHBhcmVudGFnZTtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LnNlY3Rpb25JbmZvJyk7XG4gICAgICBwYXJlbnRhZ2UgPSAkKHNlY3Rpb25Eb20pLnBhcmVudHMoJy5zZWN0aW9uc2VsZWN0b3InKTtcbiAgICAgIHBhcmVudElkcyA9IHBhcmVudGFnZS5tYXAoKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihpLCBlbGVtKSB7XG4gICAgICAgICAgcmV0dXJuIF90aGlzLnNlY3Rpb25JZChlbGVtKTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKS5nZXQoKS5yZXZlcnNlKCk7XG4gICAgICBwYXJlbnRJZHMucHVzaCh0aGlzLnNlY3Rpb25JZChzZWN0aW9uRG9tKSk7XG4gICAgICB0aGlzLnNlbGVjdGVkU2VjdGlvbnMucHVzaChwYXJlbnRJZHMuam9pbignLicpKTtcbiAgICAgIGluZm8gPSB7XG4gICAgICAgIHNlY3Rpb25zOiB0aGlzLnBvc3NpYmxlU2VjdGlvbnNcbiAgICAgIH07XG4gICAgICBwYXJlbnRJZHMuZm9yRWFjaChmdW5jdGlvbihpZCkge1xuICAgICAgICByZXR1cm4gaW5mbyA9IF8uZmlsdGVyKGluZm8uc2VjdGlvbnMsIGZ1bmN0aW9uKHNlY3Rpb24pIHtcbiAgICAgICAgICByZXR1cm4gc2VjdGlvbi5pZCA9PT0gaWQ7XG4gICAgICAgIH0pWzBdO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gaW5mbztcbiAgICB9LFxuICAgIHN1YlNlY3Rpb25MaXN0OiBmdW5jdGlvbihzZWN0aW9uRG9tKSB7XG4gICAgICB2YXIgbGlzdCwgc3Vic2VjdGlvbnM7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5zZWN0aW9uTGlzdCcpO1xuICAgICAgbGlzdCA9IFtdO1xuICAgICAgc3Vic2VjdGlvbnMgPSAkKHNlY3Rpb25Eb20pLmNoaWxkcmVuKCcuc3Vic2VjdGlvbnMnKTtcbiAgICAgIHN1YnNlY3Rpb25zLmNoaWxkcmVuKCcuc2VjdGlvbnNlbGVjdG9yJykubm90KCcudW5zZWxlY3RlZCcpLmVhY2goKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihpLCBlbGVtKSB7XG4gICAgICAgICAgdmFyIG5hbWUsIHN1YnM7XG4gICAgICAgICAgbmFtZSA9IF90aGlzLnNlY3Rpb25OYW1lKGVsZW0pO1xuICAgICAgICAgIHN1YnMgPSBfdGhpcy5zdWJTZWN0aW9uTGlzdChlbGVtKTtcbiAgICAgICAgICBpZiAoc3VicyAhPT0gJycpIHtcbiAgICAgICAgICAgIG5hbWUgPSBuYW1lICsgJyAoJyArIHN1YnMgKyAnKSc7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBsaXN0LnB1c2gobmFtZSk7XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKSk7XG4gICAgICByZXR1cm4gbGlzdC5qb2luKCcsICcpO1xuICAgIH0sXG4gICAgdXBkYXRlU3VtbWFyeTogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgY29udGVudCwgY29udGVudExpc3QsIHNlbGVjdGVkU2VjdGlvbnMsIHN1bW1hcnksIF9yZWY7XG4gICAgICBkZWJ1ZygnQXBwVmlldy51cGRhdGVTdW1tYXJ5Jyk7XG4gICAgICBzZWxlY3RlZFNlY3Rpb25zID0gdGhpcy4kKCcuc2VjdGlvbnNlbGVjdCA+IC5zZWN0aW9uc2VsZWN0b3InKS5ub3QoJy51bnNlbGVjdGVkJyk7XG4gICAgICB0aGlzLnNlbGVjdGVkU2VjdGlvbnMgPSBbXTtcbiAgICAgIGNvbnRlbnRMaXN0ID0gW107XG4gICAgICBzZWxlY3RlZFNlY3Rpb25zLmVhY2goKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihpbmRleCwgc2VjdGlvbikge1xuICAgICAgICAgIHZhciBpbmZvLCBzdWJMaXN0O1xuICAgICAgICAgIGluZm8gPSBfdGhpcy5zZWN0aW9uTmFtZShzZWN0aW9uKTtcbiAgICAgICAgICBzdWJMaXN0ID0gX3RoaXMuc3ViU2VjdGlvbkxpc3Qoc2VjdGlvbik7XG4gICAgICAgICAgaWYgKHN1Ykxpc3QgIT09ICcnKSB7XG4gICAgICAgICAgICBpbmZvID0gaW5mbyArICc6ICcgKyBzdWJMaXN0LnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBjb250ZW50TGlzdC5wdXNoKGluZm8gKyAnLicpO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpO1xuICAgICAgY29udGVudCA9ICcnO1xuICAgICAgaWYgKGNvbnRlbnRMaXN0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29udGVudCA9ICc8bGk+JyArIGNvbnRlbnRMaXN0LmpvaW4oJzwvbGk+PGxpPicpICsgJzwvbGk+JztcbiAgICAgIH1cbiAgICAgIHN1bW1hcnkgPSB7XG4gICAgICAgIHJlZ2lvbk5hbWU6IChfcmVmID0gdGhpcy5zZWxlY3RlZFJlZ2lvbkluZm8pICE9IG51bGwgPyBfcmVmLm5hbWUgOiB2b2lkIDAsXG4gICAgICAgIHllYXI6IHRoaXMuc2VsZWN0ZWRZZWFyLFxuICAgICAgICBjb250ZW50OiBjb250ZW50XG4gICAgICB9O1xuICAgICAgcmV0dXJuIHRoaXMuJCgnLnJldmlld2Jsb2NrJykuaHRtbChBcHBWaWV3LnRlbXBsYXRlcy5yZXZpZXdCbG9jayhzdW1tYXJ5KSk7XG4gICAgfVxuICB9LCB7XG4gICAgdGVtcGxhdGVzOiB7XG4gICAgICBsYXlvdXQ6IF8udGVtcGxhdGUoXCI8ZGl2IGNsYXNzPVxcXCJyZXZpZXdibG9ja1xcXCI+PC9kaXY+XFxuPGRpdiBjbGFzcz1cXFwiZm9ybWJsb2NrXFxcIj5cXG4gICAgPGgxPlJlcG9ydCBvbjwvaDE+XFxuICAgIDxkaXYgY2xhc3M9XFxcImxvYWRpbmcgc2VsZWN0IHJlZ2lvbnNlbGVjdFxcXCI+bG9hZGluZyBhdmFpbGFibGUgcmVnaW9ucy4uPC9kaXY+XFxuXFxuICAgIDxoMT5JbiB0aGUgeWVhcjwvaDE+XFxuICAgIDxkaXYgY2xhc3M9XFxcImxvYWRpbmcgc2VsZWN0IHllYXJzZWxlY3RcXFwiPmxvYWRpbmcgYXZhaWxhYmxlIHllYXJzLi48L2Rpdj5cXG5cXG4gICAgPGgxPkluY2x1ZGluZzwvaDE+XFxuICAgIDxkaXYgY2xhc3M9XFxcImxvYWRpbmcgc2VsZWN0IHNlY3Rpb25zZWxlY3RcXFwiPmxvYWRpbmcgYXZhaWxhYmxlIHNlY3Rpb25zLi48L2Rpdj5cXG48L2Rpdj5cIiksXG4gICAgICByZXZpZXdCbG9jazogXy50ZW1wbGF0ZShcIjxoMT5TZWxlY3RlZCBSZXBvcnQ8L2gxPlxcbjxwIGNsYXNzPVxcXCJjb3ZlcmFnZVxcXCI+Q292ZXJzXFxuICAgIDwlIGlmIChyZWdpb25OYW1lKSB7ICU+PCU9IHJlZ2lvbk5hbWUgJT48JSB9IGVsc2UgeyAlPjxlbT4odW5zcGVjaWZpZWQgcmVnaW9uKTwvZW0+PCUgfSAlPlxcbiAgICBpblxcbiAgICA8JSBpZiAoeWVhcikgeyAlPjwlPSB5ZWFyICU+LjwlIH0gZWxzZSB7ICU+PGVtPih1bnNwZWNpZmllZCB5ZWFyKTwvZW0+LjwlIH0gJT5cXG48L3A+XFxuPHVsIGNsYXNzPVxcXCJjb250ZW50c1xcXCI+PCU9IGNvbnRlbnQgJT48L3VsPlxcbjxidXR0b24gdHlwZT1cXFwiYnV0dG9uXFxcIiBjbGFzcz1cXFwiZ2V0cmVwb3J0XFxcIj5kb3dubG9hZCByZXBvcnQ8L2J1dHRvbj5cIiksXG4gICAgICByZXZpZXdDb250ZW50SXRlbTogXy50ZW1wbGF0ZShcIjxsaT5pdGVtPC9saT5cIiksXG4gICAgICByZWdpb25UeXBlU2VsZWN0b3I6IF8udGVtcGxhdGUoXCI8ZGl2IGNsYXNzPVxcXCJyZWdpb250eXBlc2VsZWN0b3JcXFwiIGlkPVxcXCJyZWdpb250eXBlLTwlPSBpZCAlPlxcXCI+XFxuICAgIDxsYWJlbCBjbGFzcz1cXFwibmFtZVxcXCI+PGlucHV0XFxuICAgICAgICBjbGFzcz1cXFwicmVnaW9udHlwZVxcXCJcXG4gICAgICAgIG5hbWU9XFxcInJlZ2lvbnR5cGVcXFwiXFxuICAgICAgICB0eXBlPVxcXCJyYWRpb1xcXCJcXG4gICAgICAgIHZhbHVlPVxcXCI8JT0gaWQgJT5cXFwiXFxuICAgIC8+IDwlPSBuYW1lICU+XFxuICAgIDwvbGFiZWw+XFxuICAgIDxkaXYgY2xhc3M9XFxcInJlZ2lvbnNlbGVjdG9yd3JhcHBlclxcXCI+PHNlbGVjdCBjbGFzcz1cXFwicmVnaW9uc2VsZWN0b3JcXFwiPlxcbiAgICAgICAgPG9wdGlvbiB2YWx1ZT1cXFwiXFxcIiBkaXNhYmxlZD1cXFwiZGlzYWJsZWRcXFwiIHNlbGVjdGVkPVxcXCJzZWxlY3RlZFxcXCI+c2VsZWN0IGEgcmVnaW9uJmhlbGxpcDs8L29wdGlvbj5cXG4gICAgICAgIDwlPSBvcHRpb25MaXN0ICU+XFxuICAgIDwvc2VsZWN0PjwvZGl2PlxcbjwvZGl2PlwiKSxcbiAgICAgIHJlZ2lvblNlbGVjdG9yOiBfLnRlbXBsYXRlKFwiPG9wdGlvbiB2YWx1ZT1cXFwiPCU9IGlkICU+XFxcIj48JT0gbmFtZSAlPjwvb3B0aW9uPlwiKSxcbiAgICAgIHllYXJTZWxlY3RvcjogXy50ZW1wbGF0ZShcIjxkaXYgY2xhc3M9XFxcInllYXJyb3dcXFwiIGlkPVxcXCJ5ZWFyLTwlPSB5ZWFyICU+XFxcIj5cXG4gICAgPGxhYmVsIGNsYXNzPVxcXCJuYW1lXFxcIj48aW5wdXRcXG4gICAgICAgIGNsYXNzPVxcXCJ5ZWFyc2VsZWN0b3JcXFwiXFxuICAgICAgICBuYW1lPVxcXCJ5ZWFyc2VsZWN0b3JcXFwiXFxuICAgICAgICB0eXBlPVxcXCJyYWRpb1xcXCJcXG4gICAgICAgIHZhbHVlPVxcXCI8JT0geWVhciAlPlxcXCJcXG4gICAgLz4gPCU9IHllYXIgJT48L2xhYmVsPlxcbjwvZGl2PlwiKSxcbiAgICAgIHNlY3Rpb25TZWxlY3RvcjogXy50ZW1wbGF0ZShcIjxkaXYgY2xhc3M9XFxcInNlY3Rpb25zZWxlY3RvclxcXCIgaWQ9XFxcInNlY3Rpb24tPCU9IGlkICU+XFxcIj5cXG4gICAgPGxhYmVsIGNsYXNzPVxcXCJuYW1lXFxcIlxcbiAgICAgICAgPCUgaWYgKHByZXNlbmNlID09ICdyZXF1aXJlZCcpIHsgcHJpbnQoJ3RpdGxlPVxcXCJUaGlzIHNlY3Rpb24gaXMgcmVxdWlyZWRcXFwiJyk7IH0gJT5cXG4gICAgPjxpbnB1dFxcbiAgICAgICAgdHlwZT1cXFwiY2hlY2tib3hcXFwiXFxuICAgICAgICB2YWx1ZT1cXFwiPCU9IGlkICU+XFxcIlxcbiAgICAgICAgY2hlY2tlZD1cXFwiY2hlY2tlZFxcXCJcXG4gICAgICAgIDwlIGlmIChwcmVzZW5jZSA9PSAncmVxdWlyZWQnKSB7IHByaW50KCdkaXNhYmxlZD1cXFwiZGlzYWJsZWRcXFwiJyk7IH0gJT5cXG4gICAgLz4gPCU9IG5hbWUgJT48L2xhYmVsPlxcbiAgICA8cCBjbGFzcz1cXFwiZGVzY3JpcHRpb25cXFwiPjwlPSBkZXNjcmlwdGlvbiAlPjwvcD5cXG5cXG48L2Rpdj5cIiksXG4gICAgICBzdWJzZWN0aW9uczogXy50ZW1wbGF0ZShcIjxkaXYgY2xhc3M9XFxcInN1YnNlY3Rpb25zIGNsZWFyZml4XFxcIj5cXG48L2Rpdj5cIilcbiAgICB9XG4gIH0pO1xuXG4gIG1vZHVsZS5leHBvcnRzID0gQXBwVmlldztcblxufSkuY2FsbCh0aGlzKTtcbiJdfQ==
