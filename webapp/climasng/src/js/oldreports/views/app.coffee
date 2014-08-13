define [
    'jquery', 'underscore', 'backbone', 'showdown',
    'js/oldreports/collections/regions'
    'js/oldreports/collections/regiontypes'
    'ra'
], ($, _, Backbone, Showdown, Regions, RegionTypes, RA) ->

    AppView = Backbone.View.extend {
        # -----------------------------------------------------------
        events:
            'change input[type=radio].rtype':  'changeRegionType'
            'change select.regionselect':      'changeRegion'
            'change input[type=radio].year':   'changeYear'
            'change input[type=radio].format': 'changeFormat'
            'click .generate':                 'startReport'
        # -----------------------------------------------------------
        initialize: () ->
            # window.region_list initialised in the HAML template
            @region_types = new RegionTypes window.climasSettings.regionTypeList
            @regions = new Regions window.climasSettings.regionList
            _.bindAll this
        # -----------------------------------------------------------
        render: () ->

            me = this

            form_parts = []

            # regiontype and region -----

            type_choices = []
            @region_types.each (rt) ->

                # skip countries for now
                # TODO add this back in
                if rt.get('regiontype') isnt 'National'

                    # make a list of that region type's regions
                    region_list = []
                    me.regions.each (r) ->
                        if r.get('region_type_regiontype') == rt.get('regiontype')
                            region_list.push AppView.region_option(r.attributes)

                    disabled = (rt.get('regiontype') is 'IBRA')

                    # merge the region list into the region type attributes
                    info = _.extend({regions: region_list.join(''), disabled: disabled}, rt.attributes)
                    type_choices.push AppView.type_choice(info)

            form_parts.push AppView.type_chooser({ regiontypes: type_choices.join('') })

            # year -----

            years = []
            for year in [2015..2085] by 10
                years.push AppView.year_option { year: year }

            form_parts.push AppView.year_chooser { years: years.join('\n') }

            # format -----

            formats = []
            for f, n of {
#                'msword-html': 'MS Word-compatible HTML document'
                'html'       : 'Download a HTML document'
                'preview'    : 'Preview in this browser window'
            }
                formats.push AppView.format_option { format: f, formatname: n }

            form_parts.push AppView.format_chooser { formats: formats.join('') }

            # final form -----

            html_form = AppView.form { formcontent: form_parts.join('') }

            @$el.append $('<div id="notreport">' + html_form + '</div>')

            @updateReportButton()

            $('.content').append @$el
        # -----------------------------------------------------------
        regionDataUrl: (region) ->
            # did we get a region id or actual model?

            # if it's a model, great
            the_region = region

            if typeof(region) == 'string'
                # if it's a region id, fetch the model
                the_region = @regions.get region

            clean_name = the_region.get('name').replace /[^A-Za-z0-9-]/g, '_'

            url = [
                window.climasSettings.regionDataUrlPrefix
                the_region.get 'region_type_regiontype'
                "_"
                clean_name
                "/"
            ].join ""

            url
        # -----------------------------------------------------------
        regionZipUrl: (region) ->
            url = @regionDataUrl region
            # lazily retrieve the clean name..
            bits = url.split '/'
            clean_name = bits[bits.length - 2]
            url + clean_name + '.zip'
        # -----------------------------------------------------------
        changeRegionType: () ->
            selected_region_type = @$('.rtype:checked').val()

            # show the good region selector dropdown
            $('#chosen_' + selected_region_type).css "visibility", "visible"

            # hide the other dropdowns
            @$('.rtype').not(':checked').each (i, elem) ->
                $('#chosen_' + $(elem).val()).css "visibility", "hidden"

            # reset the region to the selected one for this type
            @changeRegion { target: $('#chosen_' + selected_region_type) }
        # -----------------------------------------------------------
        changeRegion: (e) ->
            @selected_region = $(e.target).val()
            if @selected_region == "invalid"
                @selected_region = null

            # update and show the download-region-data link
            # if there is a selected region
            if @selected_region
                @$('#regiondownloadlink').prop 'href', @regionZipUrl(@selected_region)
                @$('#regiondownloadlink').css "visibility", "visible"
            else
                @$('#regiondownloadlink').css "visibility", "hidden"

            @updateReportButton()
        # -----------------------------------------------------------
        changeYear: (e) ->
            @year = $(e.target).val()
            @updateReportButton()
        # -----------------------------------------------------------
        changeFormat: (e) ->
            @format = $(e.target).val()
            @updateReportButton()
        # -----------------------------------------------------------
        updateReportButton: () ->
            if @selected_region and @year and @format
                @$('.generate').removeAttr 'disabled'
            else
                @$('.generate').attr 'disabled', 'disabled'
        # -----------------------------------------------------------
        startReport: (e) ->

            @$('#report').empty()

            @enterLoadingState()

            @updateProgress()

            # fresh every time
            @doc = null
            @data = null
            @appendix = null

            @fetchDoc()
            @fetchData()
            @fetchAppendix()

            @updateProgress()

            e.preventDefault()
        # -----------------------------------------------------------
        updateProgress: () ->
            fetchlist = {
                'template': @doc
                'data': @data
                'tables': @appendix
            }
            progress = ''
            done = true
            for name, item of fetchlist
                if item
                    progress += '&#10003;'
                else
                    progress += '&#8987;'
                    done = false
                progress += name
                progress += ' '
            $button = @$('.generate')
            if done
                @exitLoadingState()
            else if @loading
                @$('.generate').html progress
        # -----------------------------------------------------------
        fetchData: () ->
            if @data
                @progress
            else
                data_url = @regionDataUrl(@selected_region) + "data.json"
                $.ajax data_url, {
                    context: this
                    dataType: 'json'
                    success: (data) =>
                        @data = data
                        @progress()
                    error: () =>
                        @exitLoadingState()
                        alert """
Could not fetch data for this region.

Due to modelling constraints, we can only report on continental Australia.

Let us know if you think we're missing data for your region.
"""
                }
        # -----------------------------------------------------------
        fetchDoc: () ->
            if @doc
                @progress
            else
                doc_url = window.climasSettings.assetUrlPrefix + "sourcedoc.txt"
                $.ajax doc_url, {
                    context: this
                    dataType: 'text'
                    success: (data) =>
                        @doc = data
                        @progress()
                    error: () =>
                        @exitLoadingState()
                        alert """
Could not fetch the report template.

This should only happen if your network is down; if you're sure your connection is okay, we'd appreciate it if you reported this problem to the developers.
"""
                }
        # -----------------------------------------------------------
        fetchAppendix: () ->
            if @appendix
                @progress
            else
                appendix_url = window.climasSettings.speciesDataUrlPrefix + "#{@selected_region}/#{@year}/speciestables.html"
                $.ajax appendix_url, {
                    context: this
                    dataType: 'html'
                    success: (data) =>
                        @appendix = data
                        @progress()
                    error: (err) =>
                        @exitLoadingState()
                        alert """
Could not fetch data for this region.

Due to modelling constraints, we can only report on continental Australia.

Let us know if you think we're missing data for your region.
"""
                }
        # -----------------------------------------------------------
        enterLoadingState: () ->
            @loading = true
            document.body.style.cursor = 'wait'
            @$('.generate').attr 'disabled', 'disabled'
            @$('.generate').css 'cursor', 'wait'
        # -----------------------------------------------------------
        exitLoadingState: () ->
            @loading = false
            document.body.style.cursor = 'default'
            @$('.generate').removeAttr('disabled').css 'cursor', 'pointer'
            @$('.generate').html 'generate report'
        # -----------------------------------------------------------
        progress: () ->
            @updateProgress()
            if @doc and @data and @appendix
                @generateReport()
        # -----------------------------------------------------------
        generateReport: () ->
            # do the thing
            @data['year'] = @year

            the_region = @regions.get @selected_region

            @data['rg_url'] = @regionDataUrl(the_region).replace /\/$/, ''
            @data['rg_short_name'] = the_region.get 'name'
            @data['rg_long_name'] = the_region.get 'long_name'

            resolution = RA.resolve @doc, @data
            html = new Showdown.converter().makeHtml resolution

            html += @appendix

            if @format == 'preview'
                # this appends the report into the current window
                $('#content').append $('<div id="report"></div>')
                $('#report').html html
                $('#report').get(0).scrollIntoView true

            else
                # this posts the report content back to the server so it returns as a url document
                filename = the_region.get('name') + '_' + @year
                filename = filename.replace(/\s+/g, '')
                @postback html, 'report', @format, filename

            document.body.style.cursor = 'default'

            # this would push the report to the user as an html download, except in IE 6,7,8,9
            # document.location = 'data:Application/octet-stream,' + encodeURIComponent(html);

            # this opens a new window with the report, except for popup blocking
            # report_window = window.open()
            # report_window.document.write(new Showdown.converter().makeHtml(resolution))

        # -----------------------------------------------------------
        postback: (content, cssFiles, format, filename) ->
            # content: what you want back from the server
            # cssFiles: a comma-separated list of css files, without the .css
            # format: the format you want back, e.g. 'msword_html' or 'html'

            form = $ '<form method="post" action="' + window.climasSettings.reflectorUrl + '"></form>'

            contentField = $ '<input type="hidden" name="content" />'
            contentField.attr 'value', content
            form.append contentField

            if cssFiles
                cssField = $ '<input type="hidden" name="css" />'
                cssField.attr 'value', cssFiles
                form.append cssField

            if format
                formatField = $ '<input type="hidden" name="format" />'
                formatField.attr 'value', format
                form.append formatField

            if filename
                filenameField = $ '<input type="hidden" name="filename" />'
                filenameField.attr 'value', filename
                form.append filenameField

            form.appendTo('body').submit()
        # -----------------------------------------------------------
    },{ # ================================================================
        # templates here
        # -----------------------------------------------------------
        form: _.template """
            <form id="kickoffform" class="clearfix">
                <p class="toolintro">
                    Get a regional report on projected changes in temperature,
                    rainfall, and species composition for a selected year.
                    <br>Species included are land-based Australian birds, mammals,
                    reptiles and amphibians.
                </p>
                <%= formcontent %>
            </form>
        """
        # -----------------------------------------------------------
        # -----------------------------------------------------------
        format_option: _.template """
            <label><input type="radio" class="format" name="formatradio" value="<%= format %>">
                <%= formatname %>
            </label>
        """
        # -----------------------------------------------------------
        format_chooser: _.template """
            <div class="onefield formatselection formsection">
                <h3>Select an output format</h3>
                <%= formats %>
                <button class="generate">generate report</button>
            </div>
        """
        # -----------------------------------------------------------
        # -----------------------------------------------------------
        year_option: _.template """
            <label><input type="radio" class="year" name="yearradio" value="<%= year %>">
                <%= year %>
            </label>
        """
        # -----------------------------------------------------------
        year_chooser: _.template """
            <div class="onefield yearselection formsection">
                <h3>Select a year</h3>
                <%= years %>
            </div>
        """
        # -----------------------------------------------------------
        # -----------------------------------------------------------
        type_choice: _.template """
                <div class="regiontypeselector">
                    <label><input type="radio" class="rtype" name="regiontyperadio" <% if (disabled) { print('disabled="true"'); } %>
                            value="<%= regiontype %>"><%= regiontypename_plural %></label>
                    <select class="regionselect" name="chosen_<%= regiontype %>" id="chosen_<%= regiontype %>">
                        <option disabled="disabled" selected="selected" value="invalid">choose a region...</option>
                        <%= regions %>
                    </select>
                </div>
        """
        # -----------------------------------------------------------
        region_option: _.template """
            <option value="<%= id %>"><%= name %></option>
        """
        # -----------------------------------------------------------
        type_chooser: _.template """
            <div class="onefield regiontypeselection formsection">
                <h3>Select a region</h3>
                <%= regiontypes %>
                <a id="regiondownloadlink" href="">download region data</a>
            </div>
        """
        # -----------------------------------------------------------
    }

    return AppView
