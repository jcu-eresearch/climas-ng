
# $ = require 'jquery'
# _ = require 'lodash'
# Backbone = require 'backbone'
# L = require 'leaflet'
MapLayer = require '../models/maplayer'
require '../util/shims'

# disable the jshint warning about "did you mean to return a
# conditional" which crops up all the time in coffeescript compiled
# code.
### jshint -W093 ###

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
    tagName: 'div'
    className: 'splitmap showforms'
    id: 'splitmap'
    # ---------------------------------------------------------------
    # some settings
    speciesDataUrl: window.mapConfig.speciesDataUrl
    biodivDataUrl: window.mapConfig.biodivDataUrl
    rasterApiUrl: window.mapConfig.rasterApiUrl
    # ---------------------------------------------------------------
    # tracking the splitter bar
    trackSplitter: false
    trackPeriod: 100
    # ---------------------------------------------------------------
    events:
        'click .btn-change': 'toggleForms'
        'click .btn-compare': 'toggleSplitter'
        'click .btn-copy.left-valid-map': 'copyMapLeftToRight'
        'click .btn-copy.right-valid-map': 'copyMapRightToLeft'
        'leftmapupdate': 'leftSideUpdate'
        'rightmapupdate': 'rightSideUpdate'
        'change select.left': 'leftSideUpdate'
        'change select.right': 'rightSideUpdate'
        'change input.left': 'leftSideUpdate'
        'change input.right': 'rightSideUpdate'
        'change #sync': 'toggleSync'
    # ---------------------------------------------------------------
    tick: ()->
        # if @map
        if false
        # if @leftInfo
            # debug @map.getPixelOrigin()
            debug @leftInfo.scenario
        else
            debug 'tick'
        setTimeout(@tick, 1000)
    # ---------------------------------------------------------------
    initialize: ()->
        debug 'AppView.initialize'

        # more annoying version of bindAll requires this concat stuff
        _.bindAll.apply _, [this].concat _.functions(this)

        # kick off the fetching of the species and biodiversity lists
        @namesList = []

        @speciesSciNameList = []
        @speciesInfoFetchProcess = @fetchSpeciesInfo()

        @biodivList = []
        @biodivInfoFetchProcess = @fetchBiodivInfo()

        # @sideUpdate('left')

        # @tick()
    # ---------------------------------------------------------------
    render: ()->
        debug 'AppView.render'

        @$el.append AppView.templates.layout {
            leftTag: AppView.templates.leftTag()
            rightTag: AppView.templates.rightTag()

            leftForm: AppView.templates.leftForm()
            rightForm: AppView.templates.rightForm()
        }
        $('#contentwrap').append @$el

        @map = L.map 'map', {
            center: [0, 0]
            zoom: 3
        }
        @map.on 'move', @resizeThings

        ## removed MapQuest base layer 2016-07-20 due to licencing changes
        # L.tileLayer('http://otile{s}.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.png', {
        #     subdomains: '1234'
        #     maxZoom: 18
        #     attribution: '''
        #     Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a>,
        #     tiles &copy; <a href="http://www.mapquest.com/" target="_blank">MapQuest</a>
        #     '''
        # }).addTo @map
        #
        ## replaced with HERE maps base layer

        L.tileLayer('http://{s}.{base}.maps.cit.api.here.com/maptile/2.1/{type}/{mapID}/{scheme}/{z}/{x}/{y}/{size}/{format}?app_id={app_id}&app_code={app_code}&lg={language}', {
            attribution: 'Map &copy; 2016 <a href="http://developer.here.com">HERE</a>'
            subdomains: '1234'
            base: 'aerial'
            type: 'maptile'
            scheme: 'terrain.day'
            app_id: 'l2Rye6zwq3u2cHZpVIPO'
            app_code: 'MpXSlNLcLSQIpdU6XHB0TQ'
            mapID: 'newest'
            maxZoom: 18
            language: 'eng'
            format: 'png8'
            size: '256'
        }).addTo @map

        @leftForm = @$ '.left.form'
        @buildLeftForm()

        @rightForm = @$ '.right.form'
        @buildRightForm()

        @leftTag = @$ '.left.tag'
        @rightTag = @$ '.right.tag'

        @splitLine = @$ '.splitline'
        @splitThumb = @$ '.splitthumb'

        @leftSideUpdate()
        @rightSideUpdate()

        # show the splitter by default
        @toggleSplitter()
    # ---------------------------------------------------------------
    resolvePlaceholders: (strWithPlaceholders, replacements)->
        ans = strWithPlaceholders
        ans = ans.replace /\{\{\s*location.protocol\s*\}\}/g, location.protocol
        ans = ans.replace /\{\{\s*location.host\s*\}\}/g, location.host
        ans = ans.replace /\{\{\s*location.hostname\s*\}\}/g, location.hostname
        for key, value of replacements
            re = new RegExp "\\{\\{\\s*" + key + "\\s*\\}\\}", "g"
            ans = ans.replace re, value
        ans

    # ---------------------------------------------------------------
    # ---------------------------------------------------------------
    # map interaction
    # ---------------------------------------------------------------
    copyMapLeftToRight: ()->
        debug 'AppView.copyMapLeftToRight'

        return unless @leftInfo

        @$('#rightmapspp').val @leftInfo.speciesName
        @$('#rightmapyear').val @leftInfo.year
        @$('input[name=rightmapscenario]').each (index, item)=>
            $(item).prop 'checked', ($(item).val() == @leftInfo.scenario)
        @$('#rightmapgcm').val @leftInfo.gcm

        @rightSideUpdate()
    # ---------------------------------------------------------------
    copyMapRightToLeft: ()->
        debug 'AppView.copyMapRightToLeft'

        return unless @rightInfo

        @$('#leftmapspp').val @rightInfo.speciesName
        @$('#leftmapyear').val @rightInfo.year
        @$('input[name=leftmapscenario]').each (index, item)=>
            $(item).prop 'checked', ($(item).val() == @rightInfo.scenario)
        @$('#leftmapgcm').val @rightInfo.gcm

        @leftSideUpdate()
    # ---------------------------------------------------------------
    sideUpdate: (side)->
        debug 'AppView.sideUpdate (' + side + ')'

        newInfo = {
            speciesName: @$('#' + side + 'mapspp').val()
            degs: @$('#' + side + 'mapdegs').val()
            range: @$('input[name=' + side + 'maprange]:checked').val()
            confidence: @$('#' + side + 'mapconfidence').val()

            year: @$('#' + side + 'mapyear').val()
            scenario: @$('input[name=' + side + 'mapscenario]:checked').val()
            gcm: @$('#' + side + 'mapgcm').val()
        }




        # testing new naming interface
        if side is 'right' and newInfo.speciesName

            console.log 'starting spp is |' + newInfo.speciesName + '|'

            # the speciesName we want is the bracketed bit at the end
            sciNameMatcher = ///
                .*          # maybe there's a common name
                \(          # a literal open paren
                    (       # start of capture group that gets the sci name
                        .+  # the sci name (anything inside the parens)
                    )       # end of capture group
                \)          # a literal closing paren
                $           # then the end of the string
            ///

            sciNameMatch = sciNameMatcher.exec newInfo.speciesName

            if sciNameMatch and sciNameMatch[1]
                # if it matched, and there's a capture group at .[1], then
                # the scientific name is what's in the capture group
                console.log('regexed spp is ' + '|' + sciNameMatch[1] + '|')
                newInfo.speciesName = sciNameMatch[1]




        # if we're looking for current, disable the future-y things
        atCurrent = (newInfo.degs == 'current')
        @$( [
                'input[name=' + side + 'maprange]'
                '#' + side + 'mapconfidence'
            ].join ','
        ).prop 'disabled', atCurrent 
        # now add a disabled style to the fieldsets holding disabled items
        @$('.' + side + '.side.form fieldset').removeClass 'disabled'
        @$(
            'input[name^=' + side + ']:disabled, [id^=' + side + ']:disabled'
        ).closest('fieldset').addClass 'disabled'

        # is it a real species or biodiv name?
        mapValidQuery = '.' + side + '-valid-map'
        if newInfo.speciesName in @namesList
            # it's real, enable the things that need valid species
            # e.g. downloads, copy to the other side, etc
            @$(mapValidQuery).removeClass('disabled').prop 'disabled', false
        else
            # it's not real, disable those things and bail out right now
            @$(mapValidQuery).addClass('disabled').prop 'disabled', true
            return false

        currInfo = if side == 'left' then @leftInfo else @rightInfo
        # bail if nothing changed
        return false if currInfo and _.isEqual newInfo, currInfo

        # also bail if they're both same species at current, a
        # kind of special case of being "the same"
        if (
            currInfo and
            newInfo.speciesName == currInfo.speciesName and
            newInfo.degs == currInfo.degs and
            newInfo.degs == 'current'
        )
            return false

        # if we got here, something has changed.

        if side is 'left'
            # save the new setup
            @leftInfo = newInfo
        else
            @rightInfo = newInfo

        # apply the changes to the map
        @addMapLayer side

        # apply the changes to the tag
        @addMapTag side

    # ---------------------------------------------------------------
    leftSideUpdate: ()->
        @sideUpdate 'left'
        if @$('#sync')[0].checked 
            debug 'Sync checked - syncing right side', 'message'
            @copySppToRightSide()

    # ---------------------------------------------------------------
    rightSideUpdate: ()->
        return @sideUpdate 'right'
    # ---------------------------------------------------------------
    copySppToRightSide: ()->
        @$('#rightmapspp').val @$('#leftmapspp').val()
        @rightSideUpdate()
    # ---------------------------------------------------------------
    addMapTag: (side)->
        debug 'AppView.addMapTag'

        info = @leftInfo if side == 'left'
        info = @rightInfo if side == 'right'

        tag = "<b><i>#{info.speciesName}</i></b>"
        dispLookup = {
            '0disp': 'no range adaptation'
            '50disp': '50 years of range adaptation'
            '100disp': '100 years of range adaptation'
        }

        if info.degs is 'current'
            tag = "current #{tag} distribution"
        else
            tag = "<b>#{info.confidence}</b> percentile projections for #{tag} at <b>+#{info.degs}&deg;C</b> with <b>#{dispLookup[info.range]}</b>"

        if side == 'left'
            @leftTag.find('.leftlayername').html tag

        if side == 'right'
            @rightTag.find('.rightlayername').html tag
    # ---------------------------------------------------------------
    addMapLayer: (side)->
        debug 'AppView.addMapLayer'

        sideInfo = @leftInfo if side == 'left'
        sideInfo = @rightInfo if side == 'right'

        # is it a biodiversity map?
        isBiodiversity = sideInfo.speciesName in @biodivList

        futureModelPoint = ''
        mapUrl = ''
        zipUrl = ''

        if isBiodiversity
            # they're looking for a biodiversity map.
            futureModelPoint = [
                'biodiversity/deciles/biodiversity'
                sideInfo.scenario
                sideInfo.year
                sideInfo.gcm
            ].join '_'

            # if they want current, just get the current biodiv
            futureModelPoint = 'biodiversity/biodiversity_current' if sideInfo.year == 'baseline'

            # now make that into a URL
            mapUrl = [
                @resolvePlaceholders @biodivDataUrl, {
                    sppGroup: sideInfo.speciesName
                }
                futureModelPoint + '.tif'
            ].join '/'

            zipUrl = [
                @resolvePlaceholders @biodivDataUrl, {
                    sppGroup: sideInfo.speciesName
                }
                'biodiversity'
                sideInfo.speciesName + '.zip'
            ].join '/'

            # update the download links
            @$('#' + side + 'mapdl').attr 'href', mapUrl
            # @$('#' + side + 'archivedl').html 'download this biodiversity group<br>(~100Mb zip)'
            # @$('#' + side + 'archivedl').attr 'href', zipUrl

        else
            # it's a plain old species map they're after.

            # work out the string that gets to the projection point they want
            sppFileName = [
                'TEMP',
                sideInfo.degs,
                sideInfo.confidence + '.' + sideInfo.range
            ].join '_'

            # if they want current, just get the current projection
            sppFileName = 'current' if sideInfo.degs == 'current'

            # now make that into a URL
            mapUrl = [
                @resolvePlaceholders @speciesDataUrl, {
                    sppUrl: @speciesUrls[sideInfo.speciesName]
                }
                sppFileName + '.tif'
            ].join '/'

            ## not offering zipped data for Wallace/Climas Global
            # zipUrl = [
            #     @resolvePlaceholders @speciesDataUrl, {
            #         sppName: sppFileName
            #         sppGroup: @speciesUrls[sideInfo.speciesName]
            #     }
            #     sppFileName + '.zip'
            # ].join '/'

            # update the download links
            @$('#' + side + 'mapdl').attr 'href', mapUrl

            ## not offering zipped data for Wallace/Climas Global
            # @$('#' + side + 'archivedl').html 'download this species<br>(~2Gb zip)'
            # @$('#' + side + 'archivedl').attr 'href', zipUrl

        # we've made a url, start the map layer loading
        layer = L.tileLayer.wms @resolvePlaceholders(@rasterApiUrl), {
            DATA_URL: mapUrl
            layers: 'DEFAULT'
            format: 'image/png'
            transparent: true
            }

        # add a class to our element when there's tiles loading
        loadClass = '' + side + 'loading'
        layer.on 'loading', ()=> @$el.addClass loadClass
        layer.on 'load', ()=> @$el.removeClass loadClass

        if side == 'left'
            @map.removeLayer @leftLayer if @leftLayer
            @leftLayer = layer

        if side == 'right'
            @map.removeLayer @rightLayer if @rightLayer
            @rightLayer = layer

        layer.addTo @map

        @resizeThings() # re-establish the splitter

        # if we're local, log the map URL to the console
        if window.location.hostname == 'localhost'
            console.log 'map URL is: ', mapUrl

        # log this as an action in Google Analytics
        if ga and typeof(ga) == 'function'
            # we have a ga thing which is probaby a google analytics thing.
            # "value" is year.percentile, eg. for 90th percentile in 2055,
            # we will send 2055.9 as the value.
            if sideInfo.year == 'baseline'
                val = 1990
            else
                val = parseInt(sideInfo.year, 10)
            val = val + { 'tenth': 0.1, 'fiftieth': 0.5, 'ninetieth': 0.9 }[sideInfo.gcm]

            ga('send', {
                'hitType': 'event',
                'eventCategory': 'mapshow',
                'eventAction': sideInfo.speciesName,
                'eventLabel': sideInfo.scenario,
                'eventValue': val
            })

    # ---------------------------------------------------------------
    # ---------------------------------------------------------------
    # UI actions
    # ---------------------------------------------------------------
    centreMap: (repeatedlyFor)->
        debug 'AppView.centreMap'

        repeatedlyFor = 500 unless repeatedlyFor
        recentre = ()=>
            @map.invalidateSize(false)
            @resizeThings()
        setTimeout(
            recentre, later
        ) for later in [0..repeatedlyFor] by 25

    # ---------------------------------------------------------------
    toggleForms: ()->
        debug 'AppView.toggleForms'

        @$el.toggleClass 'showforms'
        @centreMap()
    # ---------------------------------------------------------------
    toggleSplitter: ()->
        debug 'AppView.toggleSplitter'

        @$el.toggleClass 'split'
        if @$el.hasClass 'split'
            @activateSplitter()
        else
            @deactivateSplitter()
        @centreMap()
    # ---------------------------------------------------------------
    toggleSync: ()->
        debug 'AppView.toggleSync'

        if @$('#sync')[0].checked
            # .. checked now, so was unchecked before
            @$('.rightmapspp').prop 'disabled', true
            @copySppToRightSide()
        else
            @$('.rightmapspp').prop 'disabled', false
    # ---------------------------------------------------------------
    # ---------------------------------------------------------------
    # ajaxy stuff
    # ---------------------------------------------------------------
    fetchSpeciesInfo: ()->
        debug 'AppView.fetchSpeciesInfo'

        return $.ajax({
            url: '/data/species',
            dataType: 'json'
        }).done (data)=>
            speciesLookupList = []
            speciesSciNameList = []
            speciesUrls = {}

            # in order to avoid making a function in the inner loop,
            # here's a function returning a function that writes a
            # common name into the given sciName.  This is partial
            # function application, which is a bit like currying.
            commonNameWriter = (sciName)=>
                sciNamePostfix = " (#{sciName})"
                return (cnIndex, cn)=>
                    speciesLookupList.push {
                        label: cn + sciNamePostfix
                        value: sciName
                    }
            # that's it.. this'll be used in the loop below.

            $.each data, (sciName, sppInfo)=>
                speciesSciNameList.push sciName
                speciesUrls[sciName] = sppInfo.path
                if sppInfo.commonNames
                    $.each sppInfo.commonNames, commonNameWriter sciName
                else
                    speciesLookupList.push
                        label: sciName
                        value: sciName

            @speciesLookupList = speciesLookupList
            @speciesSciNameList = speciesSciNameList
            @speciesUrls = speciesUrls
    # ---------------------------------------------------------------
    fetchBiodivInfo: ()->
        debug 'AppView.fetchBiodivInfo'

        return $.ajax({
            url: '/data/biodiversity',
            dataType: 'json'
        }).done (data)=>
            biodivList = []
            biodivLookupList = []

            $.each data, (biodivName, biodivInfo)=>
                biodivCapName = biodivName.replace /^./, (c)-> c.toUpperCase()
                biodivList.push biodivName
                biodivLookupList.push
                    label: "Biodiversity of " + biodivCapName
                    value: biodivName

            @biodivList = biodivList
            @biodivLookupList = biodivLookupList

    # ---------------------------------------------------------------
    # ---------------------------------------------------------------
    # form creation
    # ---------------------------------------------------------------
    buildLeftForm: ()->
        debug 'AppView.buildLeftForm'

        $.when(@speciesInfoFetchProcess, @biodivInfoFetchProcess).done =>
            $leftmapspp = @$ '#leftmapspp'

            # while we're here, make a big single list of acceptable names
            @namesList = @biodivList.concat @speciesSciNameList

            $leftmapspp.autocomplete
                source: @biodivLookupList.concat @speciesLookupList
                close: => @$el.trigger 'leftmapupdate'
    # ---------------------------------------------------------------
    buildRightForm: ()->
        debug 'AppView.buildRightForm'

        $.when(@speciesInfoFetchProcess, @biodivInfoFetchProcess).done =>
            $rightmapspp = @$ '#rightmapspp'

            # while we're here, make a big single list of acceptable names
            @namesList = @biodivList.concat @speciesSciNameList

            $rightmapspp.autocomplete {
                source: '/api/namesearch'
                close: => @$el.trigger 'rightmapupdate'
            }
    # ---------------------------------------------------------------
    # ---------------------------------------------------------------
    # splitter handling
    # ---------------------------------------------------------------
    startSplitterTracking: ()->
        debug 'AppView.startSplitterTracking'

        @trackSplitter = true
        @splitLine.addClass 'dragging'

        @locateSplitter()
    # ---------------------------------------------------------------
    locateSplitter: ()->
        debug 'AppView.locateSplitter'

        if @trackSplitter
            @resizeThings()
            # decrement remaining track count, unless it's true
            if @trackSplitter == 0
                @trackSplitter = false
            else if @trackSplitter != true
                @trackSplitter -= 1
            setTimeout @locateSplitter, @trackPeriod
    # ---------------------------------------------------------------
    resizeThings: ()->
        debug 'AppView.resizeThings'

        if @leftLayer
            leftMap = $ @leftLayer.getContainer()

        if @rightLayer
            rightMap = $ @rightLayer.getContainer()

        if @$el.hasClass 'split'

            # we're still in split mode
            newLeftWidth = @splitThumb.position().left + (@splitThumb.width() / 2.0)

            mapBox = @map.getContainer()
            $mapBox = $ mapBox
            mapBounds = mapBox.getBoundingClientRect()

            topLeft = @map.containerPointToLayerPoint [0,0]
            splitPoint = @map.containerPointToLayerPoint [newLeftWidth, 0]
            bottomRight = @map.containerPointToLayerPoint [$mapBox.width(), $mapBox.height()]

            layerTop = topLeft.y
            layerBottom = bottomRight.y

            splitX = splitPoint.x - mapBounds.left

            leftLeft = topLeft.x - mapBounds.left
            rightRight = bottomRight.x

            @splitLine.css 'left', newLeftWidth

            ##### have to use attr to set style, for this to work in frickin IE8.
            # @leftTag.css 'clip', "rect(0, #{newLeftWidth}px, auto, 0)"
            @leftTag.attr 'style', "clip: rect(0, #{newLeftWidth}px, auto, 0)"

            ##### have to use attr to set style, for this to work in IE8.
            # leftMap.css 'clip', "rect(#{layerTop}px, #{splitX}px, #{layerBottom}px, #{leftLeft}px)" if @leftLayer
            # rightMap.css 'clip', "rect(#{layerTop}px, #{rightRight}px, #{layerBottom}px, #{splitX}px)" if @rightLayer
            leftMap.attr 'style', "clip: rect(#{layerTop}px, #{splitX}px, #{layerBottom}px, #{leftLeft}px)" if @leftLayer
            rightMap.attr 'style', "clip: rect(#{layerTop}px, #{rightRight}px, #{layerBottom}px, #{splitX}px)" if @rightLayer

        else
            # we're not in split mode (this is probably the last
            # resizeThings call before exiting split mode), so go
            # full left side only.

            ##### have to set style attr for IE8 to work.
            # @leftTag.css 'clip', 'inherit'
            # leftMap.css 'clip', 'inherit' if @leftLayer
            # rightMap.css 'clip', 'rect(0,0,0,0)' if @rightLayer

            @leftTag.attr 'style', 'clip: inherit'
            leftMap.attr 'style', 'clip: inherit' if @leftLayer
            rightMap.attr 'style', 'clip: rect(0,0,0,0)' if @rightLayer

    # ---------------------------------------------------------------
    stopSplitterTracking: ()->
        debug 'AppView.stopSplitterTracking'

        @splitLine.removeClass 'dragging'
        @trackSplitter = 5 # five more resizings, then stop
    # ---------------------------------------------------------------
    activateSplitter: ()->
        debug 'AppView.activateSplitter'

        @splitThumb.draggable {
            containment: $ '#mapwrapper'
            scroll: false
            start: @startSplitterTracking
            drag: @resizeThings
            stop: @stopSplitterTracking
        }
        @resizeThings()
    # ---------------------------------------------------------------
    deactivateSplitter: ()->
        debug 'AppView.deactivateSplitter'

        @splitThumb.draggable 'destroy'
        @resizeThings()

    # ---------------------------------------------------------------
},{ templates: { # ==================================================
    # templates here
    # ---------------------------------------------------------------
    layout: _.template """
        <div clas="ui-front"></div>
        <div class="splitline">&nbsp;</div>
        <div class="splitthumb"><span>&#x276e; &#x276f;</span></div>
        <div class="left tag"><%= leftTag %></div>
        <div class="right tag"><%= rightTag %></div>
        <div class="left side form"><%= leftForm %></div>
        <div class="right side form"><%= rightForm %></div>
        <div class="left loader"><img src="/static/images/spinner.loadinfo.net.gif" /></div>
        <div class="right loader"><img src="/static/images/spinner.loadinfo.net.gif" /></div>
        <div id="mapwrapper"><div id="map"></div></div>
    """
    # ---------------------------------------------------------------
    leftTag: _.template """
        <div class="show">
            <span class="leftlayername">plain map</span>
            <br>
            <button class="btn-change">settings</button>
            <button class="btn-compare">show/hide comparison map</button>
        </div>
        <div class="edit">
            <label class="left syncbox"></label>
            <input id="leftmapspp" class="left" type="text" name="leftmapspp" placeholder="&hellip; species or group &hellip;" />
        </div>
    """
    # ---------------------------------------------------------------
    rightTag: _.template """
        <div class="show">
            <span class="rightlayername">(no distribution)</span>
            <br>
            <button class="btn-change">settings</button>
            <button class="btn-compare">show/hide comparison map</button>
        </div>
        <div class="edit">
            <label class="right syncbox"><input id="sync" type="checkbox" value="sync" checked="checked" /> same as left side</label>
            <input id="rightmapspp" type="text" class="right" name="rightmapspp" placeholder="&hellip; species or group &hellip;" />
        </div>
    """
    # ---------------------------------------------------------------
    leftForm: _.template """
        <fieldset>
            <legend>temperature change</legend>
            <select class="left" id="leftmapdegs">
                <option value="current">current</option>
                <option value="1.5">1.5 &deg;C</option>
                <option value="2">2.0 &deg;C</option>
                <option value="2.7">2.7 &deg;C</option>
                <option value="3.2">3.2 &deg;C</option>
                <option value="4.5">4.5 &deg;C</option>
                <optgroup label="High sensitivity climate">
                    <option value="6">6.0 &deg;C</option>
                </optgroup>
            </select>
        </fieldset>
        <fieldset>
            <legend>adaptation via range shift</legend>
            <label><!-- span>none</span --> <input name="leftmaprange" class="left" type="radio" value="no.disp" checked="checked"> species cannot shift ranges</label>
            <label><!-- span>allow</span --> <input name="leftmaprange" class="left" type="radio" value="real.disp"> allow range adaptation</label>
        </fieldset>
        <fieldset>
            <legend>model summary</legend>
            <select class="left" id="leftmapconfidence">
                <option value="10">10th percentile</option>
                <!-- option value="33">33rd percentile</option -->
                <option value="50" selected="selected">50th percentile</option>
                <!-- option value="66">66th percentile</option -->
                <option value="90">90th percentile</option>
            </select>
        </fieldset>
        <fieldset class="blank">
            <button type="button" class="btn-change">hide settings</button>
            <button type="button" class="btn-compare">hide/show right map</button>
            <button type="button" class="btn-copy right-valid-map">copy right map &laquo;</button>
            <a id="leftmapdl" class="download left-valid-map" href="" disabled="disabled">download just this map<br>(<1Mb GeoTIFF)</a>
        </fieldset>

    """
    # ---------------------------------------------------------------
    rightForm: _.template """
        <fieldset>
            <legend>temperature change</legend>
            <select class="right" id="rightmapdegs">
                <option value="current">current</option>
                <option value="1.5">1.5 &deg;C</option>
                <option value="2">2.0 &deg;C</option>
                <option value="2.7">2.7 &deg;C</option>
                <option value="3.2">3.2 &deg;C</option>
                <option value="4.5">4.5 &deg;C</option>
                <optgroup label="High sensitivity climate">
                    <option value="6">6.0 &deg;C</option>
                </optgroup>
            </select>
        </fieldset>
        <fieldset>
            <legend>adaptation via range shift</legend>
            <label><!-- span>none</span --> <input name="rightmaprange" class="right" type="radio" value="no.disp" checked="checked"> species cannot shift ranges</label>
            <label><!-- span>allow</span --> <input name="rightmaprange" class="right" type="radio" value="real.disp"> allow range adaptation</label>
        </fieldset>
        <fieldset>
            <legend>model summary</legend>
            <select class="right" id="rightmapconfidence">
                <option value="10">10th percentile</option>
                <!-- option value="33">33rd percentile</option -->
                <option value="50" selected="selected">50th percentile</option>
                <!-- option value="66">66th percentile</option -->
                <option value="90">90th percentile</option>
            </select>
        </fieldset>
        <fieldset class="blank">
            <button type="button" class="btn-change">hide settings</button>
            <button type="button" class="btn-compare">hide/show right map</button>
            <button type="button" class="btn-copy left-valid-map">copy left map &laquo;</button>
            <a id="rightmapdl" class="download right-valid-map" href="" disabled="disabled">download just this map<br>(<1Mb GeoTIFF)</a>
        </fieldset>

    """
    # ---------------------------------------------------------------
}}

module.exports = AppView