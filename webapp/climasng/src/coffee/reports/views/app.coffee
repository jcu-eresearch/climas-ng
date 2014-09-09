
# $ = require 'jquery'
# _ = require 'lodash'
# Backbone = require 'backbone'
# L = require 'leaflet'

# MapLayer = require '../models/maplayer'

require '../util/shims' # help IE to get up to date

# disable the jshint warning about "did you mean to return a
# conditional" which crops up all the time in coffeescript compiled
# code.
### jshint -W093 ###

# disable the jshint warning about "use !== to compare with null"
# which coffeescript compiled code sometimes triggers.
### jshint -W041 ###

# -------------------------------------------------------------------
debug = (itemToLog, itemLevel)->
    levels = ['verydebug', 'debug', 'message', 'warning']

    # threshold = 'verydebug'
    # threshold = 'debug'
    threshold = 'message'

    itemLevel = 'debug' unless itemLevel

    thresholdNum = levels.indexOf threshold
    messageNum = levels.indexOf itemLevel
    return if thresholdNum > messageNum

    if itemToLog + '' == itemToLog
        # it's a string..
        console.log "[#{itemLevel}] #{itemToLog}"
    else
        console.log itemToLog
# -------------------------------------------------------------------
# -------------------------------------------------------------------

AppView = Backbone.View.extend {
    # ---------------------------------------------------------------
    # this view's base element
    tagName: 'form'
    className: ''
    id: 'reportform'
    # ---------------------------------------------------------------
    # some settings
    dataUrl: "#{location.protocol}//#{location.host}/data"
    rasterApiUrl: "#{location.protocol}//localhost:10600/api/raster/1/wms_data_url"
    # ---------------------------------------------------------------
    # tracking the splitter bar
    trackSplitter: false
    trackPeriod: 100
    # ---------------------------------------------------------------
    events:
        'change .sectionselector input': 'updateSectionSelection'
        'change .regionselect input': 'updateRegionSelection'
        'change .regionselect select': 'updateRegionSelection'
        'change .yearselect input': 'updateYearSelection'
        'click .getreport': 'getReport'
    # ---------------------------------------------------------------
    initialize: ()->
        debug 'AppView.initialize'

        # more annoying version of bindAll requires this concat stuff
        _.bindAll.apply _, [this].concat _.functions(this)

        # kick off the fetching of stuff
        @fetchReportSections()
        @fetchRegions()
        @fetchYears()

        @updateSummary()
        # @tick()
    # ---------------------------------------------------------------
    render: ()->
        debug 'AppView.render'

        @$el.append AppView.templates.layout {}
        $('#contentwrap .maincontent').append @$el

    # ---------------------------------------------------------------
    # actually go get the report
    # ---------------------------------------------------------------
    getReport: ()->
        debug 'AppView.getReport'

        # remove any previous form
        @$('#reportform').remove()

        form = []
        form.push '<form action="/regionreport" method="get" id="reportform">'

        # selected year
        form.push '<input type="hidden" name="year" value="' + @selectedYear + '">'

        # selected region
        form.push '<input type="hidden" name="regiontype" value="' + @selectedRegionType + '">'
        form.push '<input type="hidden" name="region" value="' + @selectedRegion + '">'

        # selected report sections
        form.push '<input type="hidden" name="sections" value="' + @selectedSections.join(' ') + '">'

        form.push '</form>'

        @$el.append form.join '\n'
        @$('#reportform').submit()

    # ---------------------------------------------------------------
    # deal with report sections
    # ---------------------------------------------------------------
    fetchReportSections: ()->
        debug 'AppView.fetchReportSections'

        fetch = $.ajax @dataUrl + '/reportsections'

        # later this will be an ajax call, for now make a deferred object
        # fetch = $.Deferred()

        fetch.done (data)=>
            @possibleSections = data.sections
            sectionselect = @$ '.sectionselect'
            sectionselect.empty().removeClass 'loading'
            @buildReportSectionList @possibleSections, sectionselect

        # # pretend it took a while to get the data..
        # setTimeout ()->
        #     fetch.resolve({
        #         sections: [
        #             {
        #                 id: 'intro'
        #                 name: 'Introduction'
        #                 description: 'title, credits, and introductory paragraphs.'
        #                 presence: 'required'
        #                 sections: []
        #             },{
        #                 id: 'climatereview'
        #                 name: 'Climate Review'
        #                 description: 'a description of the region\'s current and projected climate.'
        #                 presence: 'optional'
        #                 sections: [
        #                     {
        #                         id: 'temperature'
        #                         name: 'Temperature'
        #                         description: 'current and projected temperature.'
        #                         presence: 'optional'
        #                         sections: []
        #                     },{
        #                         id: 'rainfall'
        #                         name: 'Rainfall'
        #                         description: 'current and projected precipitation.'
        #                         presence: 'optional'
        #                         sections: []
        #                     }
        #                 ]
        #             },{
        #                 id: 'biodiversity'
        #                 name: 'Biodiversity Review'
        #                 description: 'a description of the region\'s current and projected biodiversity.'
        #                 presence: 'optional'
        #                 sections: [
        #                     {
        #                         id: 'overall'
        #                         name: 'Overall'
        #                         description: 'current and projected biodiversity over all modelled species.'
        #                         presence: 'optional'
        #                         sections: []
        #                     },{
        #                         id: 'mammals'
        #                         name: 'Mammals'
        #                         description: 'current and projected biodiversity over mammal species.'
        #                         presence: 'optional'
        #                         sections: []
        #                     },{
        #                         id: 'amphibians'
        #                         name: 'Amphibians'
        #                         description: 'current and projected biodiversity over amphibian species.'
        #                         presence: 'optional'
        #                         sections: [{
        #                                 id: 'allamphibians'
        #                                 name: 'All'
        #                                 description: 'current and projected biodiversity over all amphibian species.'
        #                                 presence: 'optional'
        #                                 sections: []
        #                             },{
        #                                 id: 'streamfrogs'
        #                                 name: 'Stream frogs'
        #                                 description: 'current and projected biodiversity over stream frogs.'
        #                                 presence: 'optional'
        #                                 sections: []
        #                             }
        #                         ]
        #                     },{
        #                         id: 'reptiles'
        #                         name: 'Reptiles'
        #                         description: 'current and projected biodiversity over reptile species.'
        #                         presence: 'optional'
        #                         sections: [{
        #                                 id: 'allreptiles'
        #                                 name: 'All'
        #                                 description: 'current and projected biodiversity over all reptile species.'
        #                                 presence: 'optional'
        #                                 sections: []
        #                             },{
        #                                 id: 'turtles'
        #                                 name: 'Turtles'
        #                                 description: 'current and projected biodiversity over turtles.'
        #                                 presence: 'optional'
        #                                 sections: []
        #                             }
        #                         ]
        #                     },{
        #                         id: 'birds'
        #                         name: 'Birds'
        #                         description: 'current and projected biodiversity over bird species.'
        #                         presence: 'optional'
        #                         sections: []
        #                     },{
        #                         id: 'freshwaterfish'
        #                         name: 'Freshwater fish'
        #                         description: 'current and projected biodiversity over freshwater fish species.'
        #                         presence: 'optional'
        #                         sections: []
        #                     }
        #                 ]
        #             },{
        #                 id: 'pests'
        #                 name: 'Pest Species'
        #                 description: 'climate suitability and distribution of pest species.'
        #                 presence: 'optional'
        #                 sections: [
        #                     {
        #                         id: 'pestplants'
        #                         name: 'Pest Plants'
        #                         description: 'summary of projections for selected pest plants.'
        #                         presence: 'optional'
        #                         sections: []
        #                     }
        #                 ]
        #             },{
        #                 id: 'appendixes'
        #                 name: 'Appendices'
        #                 description: 'tables and other appendices.'
        #                 presence: 'required'
        #                 sections: [
        #                     {
        #                         id: 'observedmammallist'
        #                         name: 'Mammals Present'
        #                         description: 'list of mammals currently or projected to be present in region.'
        #                         presence: 'optional'
        #                         sections: []
        #                     },{
        #                         id: 'observedamphibianslist'
        #                         name: 'Amphibians Present'
        #                         description: 'list of amphibians currently or projected to be present in region.'
        #                         presence: 'optional'
        #                         sections: []
        #                     },{
        #                         id: 'observedstreamfrogslist'
        #                         name: 'Steam Frogs Present'
        #                         description: 'list of stream frogs currently or projected to be present in region.'
        #                         presence: 'optional'
        #                         sections: []
        #                     },{
        #                         id: 'observedreptileslist'
        #                         name: 'Reptiles Present'
        #                         description: 'list of reptiles currently or projected to be present in region.'
        #                         presence: 'optional'
        #                         sections: []
        #                     },{
        #                         id: 'observedturtleslist'
        #                         name: 'Turtles Present'
        #                         description: 'list of turtles currently or projected to be present in region.'
        #                         presence: 'optional'
        #                         sections: []
        #                     },{
        #                         id: 'observedbirdslist'
        #                         name: 'Birds Present'
        #                         description: 'list of birds currently or projected to be present in region.'
        #                         presence: 'optional'
        #                         sections: []
        #                     },{
        #                         id: 'science'
        #                         name: 'Science'
        #                         description: 'description of the climate and species distribution modelling used to generate the data in the report.'
        #                         presence: 'required'
        #                         sections: []
        #                     }
        #                 ]
        #             }
        #         ]
        #     })
        # , 500 + (500 * Math.random())

        # now return a promise in case we need to wait for this
        return fetch.promise()
    # ---------------------------------------------------------------
    buildReportSectionList: (data, wrapper)->
        debug 'AppView.buildReportSectionList'

        $.each data, (index, item)=>

            # make a row for this item
            selectorRow = $ AppView.templates.sectionSelector(item)
            $(wrapper).append selectorRow

            # if the item has subitems, insert those
            if item.sections.length > 0
                subsections = $ AppView.templates.subsections()
                @buildReportSectionList item.sections, subsections
                $(selectorRow).addClass('hassubsections').append(subsections)

        @updateSummary()
    # ---------------------------------------------------------------
    updateSectionSelection: (event)->
        debug 'AppView.updateSectionSelection'

        @handleSectionSelection @possibleSections
    # ---------------------------------------------------------------
    handleSectionSelection: (sectionList, parent)->
        debug 'AppView.handleSectionSelection'

        $.each sectionList, (index, item)=>
            # find the selection checkbox..
            selector = @$ "#section-#{ item.id.replace /\./g, '\\.' }"
            selectionControl = selector.find 'input'

            # set the right class on the selector
            if selectionControl.prop 'checked'
                selector.removeClass 'unselected'
            else
                selector.addClass 'unselected'

            if item.sections?.length > 0
                @handleSectionSelection item.sections, item.id

        @updateSummary()
    # ---------------------------------------------------------------
    # deal with regions
    # ---------------------------------------------------------------
    fetchRegions: ()->
        debug 'AppView.fetchRegions'

        # later this will be an ajax call, for now make a deferred object
        fetch = $.Deferred()

        fetch.done (data)=>
            @buildRegionList data

        # pretend it took a while to get the data..
        setTimeout ()->
            fetch.resolve({
                regiontypes: [
                    {
                        id: 'nrm'
                        name: 'NRM region'
                        regions: [
                            { id: 'NRM_ACT', name: 'ACT' },
                            { id: 'NRM_Adelaide_and_Mount_Lofty_Ranges', name: 'Adelaide and Mount Lofty Ranges' },
                            { id: 'NRM_Alinytjara_Wilurara', name: 'Alinytjara Wilurara' },
                            { id: 'NRM_Avon', name: 'Avon' },
                            { id: 'NRM_Border_Rivers-Gwydir', name: 'Border Rivers-Gwydir' },
                            { id: 'NRM_Border_Rivers_Maranoa-Balonne', name: 'Border Rivers Maranoa-Balonne' },
                            { id: 'NRM_Burdekin', name: 'Burdekin' },
                            { id: 'NRM_Burnett_Mary', name: 'Burnett Mary' },
                            { id: 'NRM_Cape_York', name: 'Cape York' },
                            { id: 'NRM_Central_West', name: 'Central West' },
                            { id: 'NRM_Condamine', name: 'Condamine' },
                            { id: 'NRM_Cooperative_Management_Area', name: 'Cooperative Management Area' },
                            { id: 'NRM_Corangamite', name: 'Corangamite' },
                            { id: 'NRM_Desert_Channels', name: 'Desert Channels' },
                            { id: 'NRM_East_Gippsland', name: 'East Gippsland' },
                            { id: 'NRM_Eyre_Peninsula', name: 'Eyre Peninsula' },
                            { id: 'NRM_Fitzroy', name: 'Fitzroy' },
                            { id: 'NRM_Glenelg_Hopkins', name: 'Glenelg Hopkins' },
                            { id: 'NRM_Goulburn_Broken', name: 'Goulburn Broken' },
                            { id: 'NRM_Hawkesbury-Nepean', name: 'Hawkesbury-Nepean' },
                            { id: 'NRM_Hunter-Central_Rivers', name: 'Hunter-Central_Rivers' },
                            { id: 'NRM_Kangaroo_Island', name: 'Kangaroo Island' },
                            { id: 'NRM_Lachlan', name: 'Lachlan' },
                            { id: 'NRM_Lower_Murray_Darling', name: 'Lower Murray Darling' },
                            { id: 'NRM_Mackay_Whitsunday', name: 'Mackay Whitsunday' },
                            { id: 'NRM_Mallee', name: 'Mallee' },
                            { id: 'NRM_Murray', name: 'Murray' },
                            { id: 'NRM_Murrumbidgee', name: 'Murrumbidgee' },
                            { id: 'NRM_Namoi', name: 'Namoi' },
                            { id: 'NRM_North', name: 'North' },
                            { id: 'NRM_North_Central', name: 'North Central' },
                            { id: 'NRM_North_East', name: 'North East' },
                            { id: 'NRM_North_West', name: 'North West' },
                            { id: 'NRM_Northern_Agricultural', name: 'Northern Agricultural' },
                            { id: 'NRM_Northern_Gulf', name: 'Northern Gulf' },
                            { id: 'NRM_Northern_Rivers', name: 'Northern Rivers' },
                            { id: 'NRM_Northern_Territory', name: 'Northern Territory' },
                            { id: 'NRM_Northern_and_Yorke', name: 'Northern and Yorke' },
                            { id: 'NRM_Perth', name: 'Perth' },
                            { id: 'NRM_Port_Phillip_and_Western_Port', name: 'Port Phillip and Western Port' },
                            { id: 'NRM_Rangelands', name: 'Rangelands' },
                            { id: 'NRM_South', name: 'South' },
                            { id: 'NRM_South_Australian_Arid_Lands', name: 'South Australian Arid Lands' },
                            { id: 'NRM_South_Australian_Murray_Darling_Basin', name: 'South Australian Murray Darling Basin' },
                            { id: 'NRM_South_Coast', name: 'South Coast' },
                            { id: 'NRM_South_East', name: 'South East' },
                            { id: 'NRM_South_East_Queensland', name: 'South East Queensland' },
                            { id: 'NRM_South_West', name: 'South West' },
                            { id: 'NRM_South_West_Queensland', name: 'South West Queensland' },
                            { id: 'NRM_Southern_Gulf', name: 'Southern Gulf' },
                            { id: 'NRM_Southern_Rivers', name: 'Southern Rivers' },
                            { id: 'NRM_Sydney_Metro', name: 'Sydney Metro' },
                            { id: 'NRM_Torres_Strait', name: 'Torres Strait' },
                            { id: 'NRM_West_Gippsland', name: 'West Gippsland' },
                            { id: 'NRM_Western', name: 'Western' },
                            { id: 'NRM_Wet_Tropics', name: 'Wet Tropics' },
                            { id: 'NRM_Wimmera', name: 'Wimmera' }
                        ]
                    # },{
                    #     id: 'ibra'
                    #     name: 'IBRA bioregion'
                    #     regions: []
                    # },{
                    #     id: 'park'
                    #     name: 'Parks, reserves'
                    #     regions: []
                    },{
                        id: 'state'
                        name: 'State, territory'
                        regions: [
                            { id: 'State_Australian_Capital_Territory', name: 'ACT' },
                            { id: 'State_New_South_Wales', name: 'New South Wales' },
                            { id: 'State_Northern_Territory', name: 'Northern Territory' },
                            { id: 'State_Queensland', name: 'Queensland' },
                            { id: 'State_South_Australia', name: 'South Australia' },
                            { id: 'State_Tasmania', name: 'Tasmania' },
                            { id: 'State_Victoria', name: 'Victoria' },
                            { id: 'State_Western_Australia', name: 'Western Australia' }
                        ]
                    }
                ]
            })
        , 500 + (500 * Math.random())

        # now return a promise in case we need to wait for this
        return fetch.promise()
    # ---------------------------------------------------------------
    buildRegionList: (data)->
        debug 'AppView.buildRegionList'

        @regions = data.regiontypes
        regionselect = @$ '.regionselect'
        regionselect.empty().removeClass 'loading'

        $.each @regions, (index, regionType)=>
            # make a row for this regiontype

            # first the regions go into a select box
            regionType.optionList = [
                AppView.templates.regionSelector(reg) for reg in regionType.regions
            ].join "\n"

            regionTypeRow = $ AppView.templates.regionTypeSelector(regionType)
            regionselect.append regionTypeRow

        @updateSummary()
    # ---------------------------------------------------------------
    updateRegionSelection: (event)->
        debug 'AppView.updateRegionSelection'

        selectedType = @$('[name=regiontype]:checked').val()

        $.each @regions, (index, regionType)=>
            # find the selection checkbox..
            selector = @$ "#regiontype-#{ regionType.id }"

            # set the right class on the selector
            if selectedType == regionType.id
                selector.addClass 'typeselected'
                @selectedRegionType = regionType.id
                @selectedRegion = $(selector.find('select')).val()
                if @selectedRegion == ''
                    selector.removeClass 'regionselected'
                else
                    selector.addClass 'regionselected'
                    # note the region data for later..
                    @selectedRegionInfo = _.find regionType.regions, (region)=> region.id == @selectedRegion
            else
                selector.removeClass 'typeselected'

        @updateSummary()
    # ---------------------------------------------------------------
    # deal with years
    # ---------------------------------------------------------------
    fetchYears: ()->
        debug 'AppView.fetchYears'

        # later this will be an ajax call, for now make a deferred object
        fetch = $.Deferred()

        fetch.done (data)=>
            @buildYearList data

        # pretend it took a second to get the data..
        setTimeout ()->
            fetch.resolve({
                years: [
                    '2015'
                    '2025'
                    '2035'
                    '2045'
                    '2055'
                    '2065'
                    '2075'
                    '2085'
                ]
            })
        , 500 + (500 * Math.random())

        # now return a promise in case we need to wait for this
        return fetch.promise()
    # ---------------------------------------------------------------
    buildYearList: (data)->
        debug 'AppView.buildYearList'

        @years = data.years
        yearselect = @$ '.yearselect'
        yearselect.empty().removeClass 'loading'

        $.each @years, (index, year)=>
            # make a selector for this year
            yearselect.append AppView.templates.yearSelector({ year: year })

        @updateSummary()
    # ---------------------------------------------------------------
    updateYearSelection: (event)->
        debug 'AppView.updateYearSelection'

        @selectedYear = @$('[name=yearselector]:checked').val()

        $.each @years, (index, year)=>
            # find the selection checkbox..
            selector = @$ "#year-#{ year }"

            # set the right class on the selector
            if @selectedYear == year
                selector.addClass 'yearselected'
            else
                selector.removeClass 'yearselected'

        @updateSummary()
    # ---------------------------------------------------------------
    # update report summary
    # ---------------------------------------------------------------
    sectionId: (sectionDom)->
        debug 'AppView.sectionId'

        $(sectionDom).find('input').attr 'value'
    # ---------------------------------------------------------------
    sectionName: (sectionDom)->
        debug 'AppView.sectionName'

        @sectionInfo(sectionDom).name
    # ---------------------------------------------------------------
    sectionInfo: (sectionDom)->
        debug 'AppView.sectionInfo'

        # get a list of this section's parent ids
        parentage = $(sectionDom).parents '.sectionselector'
        parentIds = parentage.map( (i, elem)=>
            @sectionId elem
        ).get().reverse()
        # add this section's own id
        parentIds.push @sectionId(sectionDom)

        @selectedSections.push parentIds.join('.')

        # now walk into the sections hierarchy
        info = { sections: @possibleSections }

        parentIds.forEach (id)->
            info = _.filter(info.sections, (section)-> section.id == id)[0]

        # finally we have a pointer to the info for this section
        return info
    # ---------------------------------------------------------------
    subSectionList: (sectionDom)->
        debug 'AppView.sectionList'

        list = []
        subsections = $(sectionDom).children('.subsections')
        subsections.children('.sectionselector').not('.unselected').each (i, elem)=>
            name = @sectionName(elem)
            subs = @subSectionList(elem)
            if subs isnt ''
                name = name + ' (' + subs + ')'
            list.push name

        return list.join ', '

    # ---------------------------------------------------------------
    updateSummary: ()->
        debug 'AppView.updateSummary'

        selectedSections = @$('.sectionselect > .sectionselector').not('.unselected')

        @selectedSections = []
        contentList = []
        selectedSections.each (index, section)=>
            info = @sectionName section
            subList = @subSectionList section
            if subList isnt ''
                info = info + ': ' + subList.toLowerCase()
            contentList.push info + '.'

        content = ''
        if contentList.length > 0
            content = '<li>' + contentList.join('</li><li>') + '</li>'

        summary = {
            regionName: @selectedRegionInfo?.name
            year: @selectedYear
            content: content
        }

        debug contentList
        debug summary

        @$('.reviewblock').html AppView.templates.reviewBlock(summary)
        @$('.reviewblock').toggleClass 'regionselected', (@selectedRegionInfo isnt undefined)
        @$('.reviewblock').toggleClass 'yearselected', (@selectedYear isnt undefined)
    # ---------------------------------------------------------------
},{ templates: { # ==================================================
    # templates here
    # ---------------------------------------------------------------
    layout: _.template """
        <div class="reviewblock"></div>
        <div class="formblock">
            <h1>Report on</h1>
            <div class="loading select regionselect">loading available regions..</div>

            <h1>In the year</h1>
            <div class="loading select yearselect">loading available years..</div>

            <h1>Including</h1>
            <div class="loading select sectionselect">loading available sections..</div>
        </div>
    """
    # ---------------------------------------------------------------
    reviewBlock: _.template """
        <h1>Selected Report</h1>
        <p class="coverage">Covers
            <% if (regionName) { %><%= regionName %><% } else { %><em>(unspecified region)</em><% } %>
            in
            <% if (year) { %><%= year %>.<% } else { %><em>(unspecified year)</em>.<% } %>
        </p>
        <ul class="contents"><%= content %></ul>
        <button type="button" class="getreport">download report</button>
    """
    # ---------------------------------------------------------------
    reviewContentItem: _.template """
        <li>item</li>
    """
    # ---------------------------------------------------------------
    regionTypeSelector: _.template """
        <div class="regiontypeselector" id="regiontype-<%= id %>">
            <label class="name"><input
                class="regiontype"
                name="regiontype"
                type="radio"
                value="<%= id %>"
            /> <%= name %>
            </label>
            <div class="regionselectorwrapper"><select class="regionselector">
                <option value="" disabled="disabled" selected="selected">select a region&hellip;</option>
                <%= optionList %>
            </select></div>
        </div>
    """
    # ---------------------------------------------------------------
    regionSelector: _.template """<option value="<%= id %>"><%= name %></option>"""
    # ---------------------------------------------------------------
    yearSelector: _.template """
        <div class="yearrow" id="year-<%= year %>">
            <label class="name"><input
                class="yearselector"
                name="yearselector"
                type="radio"
                value="<%= year %>"
            /> <%= year %></label>
        </div>
    """
    # ---------------------------------------------------------------
    sectionSelector: _.template """
        <div class="sectionselector" id="section-<%= id %>">
            <label class="name"
                <% if (presence == 'required') { print('title="This section is required"'); } %>
            ><input
                type="checkbox"
                value="<%= id %>"
                checked="checked"
                <% if (presence == 'required') { print('disabled="disabled"'); } %>
            /> <%= name %></label>
            <p class="description"><%= description %></p>

        </div>
    """
    # ---------------------------------------------------------------
    subsections: _.template """
        <div class="subsections clearfix">
        </div>
    """
    # ---------------------------------------------------------------
}}

module.exports = AppView