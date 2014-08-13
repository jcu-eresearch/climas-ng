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
