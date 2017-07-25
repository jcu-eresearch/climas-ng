(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

// jquery plugin - hopefully you have jquery loaded already :(
// TODO shim in jquery properly
require('./menusandpanels');
// speciespanel uses jq to hook up the species panel form elements
require('./speciespanel');


$('header').disableSelection(); // unpopular but still better

// -------------------------- menus, submenus, panels, pages handling

// if the user shows a map using one of the two show-a-map forms,
// switch the *other* panel back to showing it's show-a-map form
// (otherwise you can look at a map of species X, then show a map of
// biodiveristy Y, and switch back to the species panel to see a page
// telling you "Showing Species Y").
function clearOtherShowingPages(event, info) {
    var sppShowingPage = $('.mspp-page.speciesshowing');
    var sppPickingPage = $('.mspp-page.speciesselect');

    var biodivShowingPage = $('.mspp-page.biodiversityshowing');
    var biodivPickingPage = $('.mspp-page.biodiversityselect');

    if ($(info.page).is(sppShowingPage)) {
        // make sure the biodiversity-showing page isn't current
        biodivShowingPage.removeClass('current').css({ display: 'none' });
        biodivPickingPage.addClass('current');
    } else if ($(info.page).is(biodivShowingPage)) {
        // make sure the species-showing page isn't current
        sppShowingPage.removeClass('current').css({ display: 'none' });
        sppPickingPage.addClass('current');
    }
}

// turn on the mspp plugin for our nav menu
$('nav > ul').mspp({
    // provide a callback for when a page is shown.
    showpage: clearOtherShowingPages
});

},{"./menusandpanels":2,"./speciespanel":3}],2:[function(require,module,exports){

// jQuery plugin
// author: Daniel Baird <daniel@danielbaird.com>
// version: 0.1.20140205

//
// This manages menus, submenus, panels, and pages.
// Like this:
// ---.--------------------------------------------------------.----------------------.------------------------.---
//    |                                                        |                      |                        |
//    |  Selected Main Menu Item   .-----------. .---------.   |  Alt Main Menu Item  |  Third Main Menu Item  |
//    |                           /  Subitem 1  \ Subitem 2 \  |                      |                        |
// ---'--------------------------'               '-------------'----------------------'------------------------'---
//       |                                                                                                 |
//       |   Panel for Subitem 1, this is Page 1                                                           |
//       |                                                                                                 |
//       |   Each Panel can have multiple pages, one page showing at a time.  Buttons on pages switch      |
//       |   between pages.  Panel height adjusts to the height of the page.                               |
//       |                                                                                                 |
//       |   [ see page 2 ]                                                                                |
//       |                                                                                                 |
//       '-------------------------------------------------------------------------------------------------'
//
// - menus are always <ul> tags; each <li> is a menu item
// - a main menu <li> must contain an <a> tag and may also contain a <ul> submenu
// - a submenu <li> must contain an <a> tag with a data-targetpanel attribute set
// - There is always a single selected main menu item
// - A main menu item may either link to another webpage, or have a submenu
// - Selecting a main menu item will show its submenu, if it has one
// - A submenu always has a single item selected
// - Clicking an inactive submenu item will show its panel
// - Clicking a selected submenu item will toggle its panel showing <-> hiding ((( NB: not yet implemented )))
// - A panel initially shows its first page
// - Switching pages in a panel changes the panel height to suit its current page
// - A panel is a HTML block element with the class .mspp-panel (can be overridden via option)
// - If a panel contains pages, one page should have the class .current (can be overridden via option)
// - A page is a HTML block element with the class .mspp-page (can be overridden via option)
// - <button> or <a> tags in pages that have a data-targetpage attribute set will switch to the indicated page
//
//
// The HTML should look like this:
//
//  <ul class="menu">                   <!-- this is the main menu -->
//      <li class="current">            <!-- this is a main menu item, currently selected -->
//          <a>First Item</a>           <!-- the first item in the main menu -->
//          <ul>                        <!-- a submenu in the first main menu item -->
//              <li class="current">    <!-- the currently selected submenu item -->
//                                      <!-- .paneltrigger and the data-panelid attribute are required -->
//                  <a data-targetpanel="panel1">do the panel1 thing</a>
//              </li>
//              <li>...</li>            <!-- another submenu item -->
//          </ul>
//      </li>
//      <li> <a href="another_page.html">another page</a> </li>
//      <li> <a>whatever</a> </li>
//  </ul>
//
//  <div id="panel1" class="mspp-panel">
//      <div id="page11" class="mspp-page current">
//          This is the current page on panel 1.
//          <button type="button" data-targetpage="page12">show page 2</button>
//      </div>
//      <div id="page12" class="mspp-page">
//          This is the other page on panel 1.
//          <a data-targetpage="page11">see the first page again</a>
//      </div>
//  </div>
//  <div id="panel2" class="mspp-panel">
//      <div id="page21" class="mspp-page current">
//          This is the current page on panel 2.
//          <button type="button" data-targetpage="page22">show page 2</button>
//      </div>
//      <div id="page22" class="mspp-page">
//          This is the other page on panel 2.
//          <a data-targetpage="page21">see the first page again</a>
//      </div>
//  </div>


;( function($, window, document, undefined) {

    // namespace climas, widget name mspp
    // second arg is used as the widget's "prototype" object
    $.widget( "climas.mspp" , {

        //Options to be used as defaults
        options: {
            animationFactor: 2,

            mainMenuClass: 'mspp-main-menu',

            panelClass: 'mspp-panel',
            pageClass: 'mspp-page',

            clearfixClass: 'mspp-clearfix',
            activeClass: 'current'
        },
        // ----------------------------------------------------------
        //Setup widget (eg. element creation, apply theming
        // , bind events etc.)
        _create: function() {

            var base = this;
            var opts = this.options;

            // populate some convenience variables
            var $menu = this.element;
            this.mainMenuItems = $menu.children('li');
            this.panels = $('.' + opts.panelClass);

            // disappear while we sort things out
            $menu.css({ opacity: 0 });
            this.panels.css({ opacity: 0 });

            // make some DOM mods
            $menu.addClass(opts.mainMenuClass);
            $menu.addClass(opts.clearfixClass);
            this.panels.addClass(opts.clearfixClass);

            // layout the menu
            this._layoutMenu();

            // layout the panels
            this._layoutPanels();

            // hook up click handling etc
            $menu.on('msppshowmenu', this._showMenu);
            $menu.on('msppshowsubmenu', this._showSubMenu);
            $menu.on('msppshowpanel', this._showPanel);
            $menu.on('msppshowpage', this._showPage);

            // attach handlers to the menu-triggers
            this.mainMenuItems.each( function(index, item) {
                // the li menu item has a child a that is it's trigger
                $(item).children('a').click( function(event) {
                    base._trigger('showmenu', event, {
                        menuitem: item,
                        widget: base
                    });
                });
                // attach handlers to the submenu items
                $(item).find('li').each( function(index, subMenuItem) {
                    $(subMenuItem).find('a').click( function(event) {
                        base._trigger('showsubmenu', event, {
                            menuitem: item,
                            submenuitem: subMenuItem,
                            widget: base
                        });
                    });
                });
            });

            // attach handlers to the panel triggers
            $menu.find('[data-targetpanel]').each( function(index, trigger) {
                var $trigger =$(trigger);
                $trigger.click( function(event) {
                    base._trigger('showpanel', event, {
                        panel: $('#' + $trigger.data('targetpanel')).first(),
                        widget: base
                    });
                });
            });

            // attach handlers to the page switchers
            this.panels.each( function(index, panel) {
                var $panel = $(panel);
                $panel.find('[data-targetpage]').click( function(event) {
                    base._trigger('showpage', event, {
                        panel: $panel,
                        page: $('#' + $(this).data('targetpage')),
                        widget: base
                    });
                });
            });

            // activate the current menus, panels etc
            var $currentMain = this.mainMenuItems.filter('.' + opts.activeClass);
            $currentMain.removeClass(opts.activeClass).children('a').click();

            // finally, fade back in
            $menu.animate({ opacity: 1 }, 'fast');

            // panels stay invisible
        },
        // ----------------------------------------------------------
        _switchClassOption: function(className, newClass) {
            var oldClass = this.options[className];
            if (oldClass !== newClass) {
                var group = this.element.find('.' + oldClass);
                this.options[className] = newClass;
                group.removeClass(oldClass);
                group.addClass(newClass);
            }
        },
        // ----------------------------------------------------------
        // Respond to any changes the user makes to the
        // option method
        _setOption: function(key, value) {
            switch (key) {
                case "mainMenuClass":
                case "clearfixClass":
                case "activeClass":
                    this._switchClassOption(key, value);
                    break;

                default:
                    this.options[key] = value;
                    break;
                // it's okay that there's no } here
            }
            // remember to call our super's _setOption method
            this._super( "_setOption", key, value );
        },
        // ----------------------------------------------------------
        // Destroy an instantiated plugin and clean up
        // modifications the widget has made to the DOM
        _destroy: function() {
            this.element.removeClass(this.options.mainMenuClass);
            this.element.removeClass(this.options.clearfixClass);
            this.panels.removeClass(this.options.clearfixClass);
        },
        // ----------------------------------------------------------
        // do the layout calculations
        _layoutMenu: function() {
            // go through each submenu and record its width
            this.element.find('ul').each( function(index, subMenu) {
                var $sm = $(subMenu);
                $sm.css({width: 'auto'});
                $sm.data('originalWidth', $sm.width());

                // leave each submenu hidden, with width 0
                $sm.css({ width: 0, display: 'none' });
            });
        },
        // ----------------------------------------------------------
        _showMenu: function(event, data) {
            var $item = $(data.menuitem);
            var base = data.widget;
            // $item is a clicked-on menu item..
            if ($item.hasClass(base.options.activeClass)) {
                // ??
            } else {
                base._hidePanels();
                base.mainMenuItems.removeClass(base.options.activeClass);
                var $newSubMenu = $item.find('ul');
                var $oldSubMenus = base.element.find('ul').not($newSubMenu);
                var newWidth = $newSubMenu.data('originalWidth');

                $oldSubMenus.animate({ width: 0 }, (50 * base.options.animationFactor), function() {
                    $oldSubMenus.css({ display: 'none' });
                });
                $item.addClass(base.options.activeClass);
                $newSubMenu
                    .css({display: 'block' })
                    .animate({ width: newWidth }, (125 * base.options.animationFactor), function() {
                        $newSubMenu.css({ width: 'auto' }).removeAttr('style');
                        base._trigger('menushown', event, { item: $item, widget: base });
                    })
                ;
                // if the new submenu has an active item, click it
                $newSubMenu.find('.' + base.options.activeClass + ' a').click();
            }
        },
        // ----------------------------------------------------------
        _showSubMenu: function(event, data) {
            // de-activeify all the submenu items
            $(data.menuitem).find('li').removeClass(data.widget.options.activeClass);
            // active-ify the one true submenu item
            $(data.submenuitem).addClass(data.widget.options.activeClass);
        },
        // ----------------------------------------------------------
        // do the layout calculations
        _layoutPanels: function() {

            var $pages = this.panels.find('.' + this.options.pageClass);

            // go through each page and record its height
            $pages.each( function(index, page) {
                var $page = $(page);
                $page.css({height: 'auto'});
                $page.data('originalHeight', $page.outerHeight());

                // leave each page hidden, with height 0
                $page.css({ height: 0, display: 'none' });
            });

            // go through each panel and hide it
            this.panels.each( function(index, panel) {
                var $panel = $(panel);
                $panel.css({ display: 'none' });
            });
        },
        // ----------------------------------------------------------
        _hidePanels: function() {
            this.panels.removeClass(this.options.activeClass).css({ display: 'none', height: 0 });
        },
        // ----------------------------------------------------------
        _showPanel: function(event, data) {
            var $panel = $(data.panel);
            var base = data.widget;
            // $panel is a panel to show..
            if ($panel.hasClass(base.options.activeClass)) {
                // ??
            } else {
                base._hidePanels();
                $panel.addClass(base.options.activeClass);
                $panel.css({ display: 'block', opacity: 1 });
                var $page = $($panel.find('.' + base.options.pageClass + '.' + base.options.activeClass));
                base._trigger('showpage', event, { panel: $panel, page: $page, widget: base });
            }
        },
        // ----------------------------------------------------------
        _showPage: function(event, data) {
            var base = data.widget;
            var $panel = $(data.panel);
            var $page = $(data.page);
            var newHeight = $page.data('originalHeight');

            // fix the panel's current height
            $panel.css({height: $panel.height() });

            // deal with the page currently being displayed
            var $oldPage = $panel.find('.' + base.options.pageClass + '.' + base.options.activeClass).not($page);
            if ($oldPage.length > 0) {
                $oldPage.data('originalHeight', $oldPage.outerHeight());
                $oldPage.removeClass(base.options.activeClass).fadeOut((50 * base.options.animationFactor), function() {
                    $oldPage.css({ height: 0 });
                });
            }

            // switch on the new page and grow the opanel to hold it
            $page.css({ height: 'auto' }).addClass(base.options.activeClass).fadeIn((100 * base.options.animationFactor), function() {
                $page.removeAttr('style');
            });
            var animTime = ($oldPage.length > 0 ? (100 * base.options.animationFactor) : (150 * base.options.animationFactor)); // animate faster if it's switching pages
            $panel.animate({ height: newHeight }, animTime, function() {
                $panel.removeAttr('style');
            });

        },
        // ----------------------------------------------------------
        _: null // no following comma
    });

})(jQuery, window, document);













},{}],3:[function(require,module,exports){

(function(){


    // -------------------------------------------------------------------------------------------
    // convenience functions
    var enableGoButton = function() {
        if ($.inArray($('#speciesname').val(), speciesSciNameList) > -1) {
            $('#sppshowmap').removeClass('disabled').prop('disabled', false); // enable the button
        } else {
            $('#sppshowmap').addClass('disabled').prop('disabled', true); // DISable the button
        }
    };

    // work out when to disable things
    var enableFutureFields = function() {

        // fetch the current form elements
        var $timePointCtl = $('input[name=spptimepoint]:checked');

        if ($timePointCtl.val() === 'baseline') {
            $('input[name=sppscenario], input[name=sppgcm]').prop('disabled', true); // DISable the future fields
            $('fieldset.sppscenario, fieldset.sppgcm').addClass('disabled');
        } else {
            $('input[name=sppscenario], input[name=sppgcm]').prop('disabled', false); // enable the future fields
            $('fieldset.sppscenario, fieldset.sppgcm').removeClass('disabled');
        }
    };

    // -------------------------------------------------------------------------------------------
    // fetch the species list
    speciesFetch = $.ajax({
        url: '/data/species'
    });
    // get a variable read for our list
    var speciesLookupList = [];
    var speciesSciNameList = [];

    // -------------------------------------------------------------------------------------------
    // set up the autocomplete field

    // do this after we've fetched the species list
    speciesFetch.done( function(data) {
        speciesLookupList = []; // no initial var here, we want to refer to the outside scope
        speciesSciNameList = []; // no initial var here, we want to refer to the outside scope
        $.each(data, function(sciName, commonNames) {
            speciesSciNameList.push(sciName);
            if (commonNames) {
                $.each(commonNames, function(cnIndex, cn) {
                    speciesLookupList.push({
                        label: cn + ' (' + sciName + ')',
                        value: sciName
                    });
                });
            } else {
                speciesLookupList.push({ label: sciName, value: sciName });
            }
        });
        $('#speciesname').autocomplete({ source: speciesLookupList });
    });
    // -------------------------------------------------------------------------------------------
    // hook up the auto-enable and disable stuff
    $('#speciesname').on('autocompleteclose',  function(event, ui) { enableGoButton(); });
    $('#speciesname').on('keyup',              function(event, ui) { enableGoButton(); });
    $('#speciesname').on('change',             function(event, ui) { enableGoButton(); });

    $('input[name=spptimepoint]').change( function() {
        enableFutureFields();
    });

    // also do the enabling now..
    enableGoButton();
    enableFutureFields();

    // need to attach the fade-in event hander to the iframe's "ready" event just once, and it
    // will trigger each time we set the iframe's src and the page loads.
    $('#mapframe').load(function() {
        $('#map').animate({ opacity: 1 }, 2500);
    });


    // -------------------------------------------------------------------------------------------
    // handle when they actually click on the species panel button
    $('#sppshowmap').click( function() {

        // fetch the current species name etc from the form elements.
        var sppName = $('#speciesname').val();
        var timePoint = $('input[name=spptimepoint]:checked').val();
        var scenario = $('input[name=sppscenario]:checked').val();
        var climateModel = $('input[name=sppgcm]:checked').val();

        var futureModelPoint = scenario + '_' + climateModel + '_' + timePoint;
        if (timePoint === 'baseline') {
            futureModelPoint = '1990';
        }

        var mapUrl = 'http://130.102.155.33:8080/' + sppName.replace(' ', '_') + '/output/' + futureModelPoint + '.tif';
        mapUrl = window.climasSettings.vizUrlPrefix + encodeURIComponent(mapUrl);

        $('#speciesshowingpage .speciesname').html(sppName);
        $('#map').animate({ opacity: 0 }, 'fast', function() {
            // find the map and apply it
            $('#mapframe').attr('src', mapUrl);
            // the iframe's ready event will eventually fire, and that's when we fade the map back in.
        });

    });

})();
},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9wdnJkd2IvcHJvamVjdHMvY2xpbWFzLWdsb2JhbC93ZWJhcHAvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi9Vc2Vycy9wdnJkd2IvcHJvamVjdHMvY2xpbWFzLWdsb2JhbC93ZWJhcHAvY2xpbWFzbmcvc3JjL2pzL2Zha2VfYjU0NTA3N2EuanMiLCIvVXNlcnMvcHZyZHdiL3Byb2plY3RzL2NsaW1hcy1nbG9iYWwvd2ViYXBwL2NsaW1hc25nL3NyYy9qcy9tZW51c2FuZHBhbmVscy5qcyIsIi9Vc2Vycy9wdnJkd2IvcHJvamVjdHMvY2xpbWFzLWdsb2JhbC93ZWJhcHAvY2xpbWFzbmcvc3JjL2pzL3NwZWNpZXNwYW5lbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JXQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcbi8vIGpxdWVyeSBwbHVnaW4gLSBob3BlZnVsbHkgeW91IGhhdmUganF1ZXJ5IGxvYWRlZCBhbHJlYWR5IDooXG4vLyBUT0RPIHNoaW0gaW4ganF1ZXJ5IHByb3Blcmx5XG5yZXF1aXJlKCcuL21lbnVzYW5kcGFuZWxzJyk7XG4vLyBzcGVjaWVzcGFuZWwgdXNlcyBqcSB0byBob29rIHVwIHRoZSBzcGVjaWVzIHBhbmVsIGZvcm0gZWxlbWVudHNcbnJlcXVpcmUoJy4vc3BlY2llc3BhbmVsJyk7XG5cblxuJCgnaGVhZGVyJykuZGlzYWJsZVNlbGVjdGlvbigpOyAvLyB1bnBvcHVsYXIgYnV0IHN0aWxsIGJldHRlclxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBtZW51cywgc3VibWVudXMsIHBhbmVscywgcGFnZXMgaGFuZGxpbmdcblxuLy8gaWYgdGhlIHVzZXIgc2hvd3MgYSBtYXAgdXNpbmcgb25lIG9mIHRoZSB0d28gc2hvdy1hLW1hcCBmb3Jtcyxcbi8vIHN3aXRjaCB0aGUgKm90aGVyKiBwYW5lbCBiYWNrIHRvIHNob3dpbmcgaXQncyBzaG93LWEtbWFwIGZvcm1cbi8vIChvdGhlcndpc2UgeW91IGNhbiBsb29rIGF0IGEgbWFwIG9mIHNwZWNpZXMgWCwgdGhlbiBzaG93IGEgbWFwIG9mXG4vLyBiaW9kaXZlcmlzdHkgWSwgYW5kIHN3aXRjaCBiYWNrIHRvIHRoZSBzcGVjaWVzIHBhbmVsIHRvIHNlZSBhIHBhZ2Vcbi8vIHRlbGxpbmcgeW91IFwiU2hvd2luZyBTcGVjaWVzIFlcIikuXG5mdW5jdGlvbiBjbGVhck90aGVyU2hvd2luZ1BhZ2VzKGV2ZW50LCBpbmZvKSB7XG4gICAgdmFyIHNwcFNob3dpbmdQYWdlID0gJCgnLm1zcHAtcGFnZS5zcGVjaWVzc2hvd2luZycpO1xuICAgIHZhciBzcHBQaWNraW5nUGFnZSA9ICQoJy5tc3BwLXBhZ2Uuc3BlY2llc3NlbGVjdCcpO1xuXG4gICAgdmFyIGJpb2RpdlNob3dpbmdQYWdlID0gJCgnLm1zcHAtcGFnZS5iaW9kaXZlcnNpdHlzaG93aW5nJyk7XG4gICAgdmFyIGJpb2RpdlBpY2tpbmdQYWdlID0gJCgnLm1zcHAtcGFnZS5iaW9kaXZlcnNpdHlzZWxlY3QnKTtcblxuICAgIGlmICgkKGluZm8ucGFnZSkuaXMoc3BwU2hvd2luZ1BhZ2UpKSB7XG4gICAgICAgIC8vIG1ha2Ugc3VyZSB0aGUgYmlvZGl2ZXJzaXR5LXNob3dpbmcgcGFnZSBpc24ndCBjdXJyZW50XG4gICAgICAgIGJpb2RpdlNob3dpbmdQYWdlLnJlbW92ZUNsYXNzKCdjdXJyZW50JykuY3NzKHsgZGlzcGxheTogJ25vbmUnIH0pO1xuICAgICAgICBiaW9kaXZQaWNraW5nUGFnZS5hZGRDbGFzcygnY3VycmVudCcpO1xuICAgIH0gZWxzZSBpZiAoJChpbmZvLnBhZ2UpLmlzKGJpb2RpdlNob3dpbmdQYWdlKSkge1xuICAgICAgICAvLyBtYWtlIHN1cmUgdGhlIHNwZWNpZXMtc2hvd2luZyBwYWdlIGlzbid0IGN1cnJlbnRcbiAgICAgICAgc3BwU2hvd2luZ1BhZ2UucmVtb3ZlQ2xhc3MoJ2N1cnJlbnQnKS5jc3MoeyBkaXNwbGF5OiAnbm9uZScgfSk7XG4gICAgICAgIHNwcFBpY2tpbmdQYWdlLmFkZENsYXNzKCdjdXJyZW50Jyk7XG4gICAgfVxufVxuXG4vLyB0dXJuIG9uIHRoZSBtc3BwIHBsdWdpbiBmb3Igb3VyIG5hdiBtZW51XG4kKCduYXYgPiB1bCcpLm1zcHAoe1xuICAgIC8vIHByb3ZpZGUgYSBjYWxsYmFjayBmb3Igd2hlbiBhIHBhZ2UgaXMgc2hvd24uXG4gICAgc2hvd3BhZ2U6IGNsZWFyT3RoZXJTaG93aW5nUGFnZXNcbn0pO1xuIiwiXG4vLyBqUXVlcnkgcGx1Z2luXG4vLyBhdXRob3I6IERhbmllbCBCYWlyZCA8ZGFuaWVsQGRhbmllbGJhaXJkLmNvbT5cbi8vIHZlcnNpb246IDAuMS4yMDE0MDIwNVxuXG4vL1xuLy8gVGhpcyBtYW5hZ2VzIG1lbnVzLCBzdWJtZW51cywgcGFuZWxzLCBhbmQgcGFnZXMuXG4vLyBMaWtlIHRoaXM6XG4vLyAtLS0uLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0uLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS4tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0uLS0tXG4vLyAgICB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8ICAgICAgICAgICAgICAgICAgICAgIHwgICAgICAgICAgICAgICAgICAgICAgICB8XG4vLyAgICB8ICBTZWxlY3RlZCBNYWluIE1lbnUgSXRlbSAgIC4tLS0tLS0tLS0tLS4gLi0tLS0tLS0tLS4gICB8ICBBbHQgTWFpbiBNZW51IEl0ZW0gIHwgIFRoaXJkIE1haW4gTWVudSBJdGVtICB8XG4vLyAgICB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgLyAgU3ViaXRlbSAxICBcXCBTdWJpdGVtIDIgXFwgIHwgICAgICAgICAgICAgICAgICAgICAgfCAgICAgICAgICAgICAgICAgICAgICAgIHxcbi8vIC0tLSctLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLScgICAgICAgICAgICAgICAnLS0tLS0tLS0tLS0tLSctLS0tLS0tLS0tLS0tLS0tLS0tLS0tJy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSctLS1cbi8vICAgICAgIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuLy8gICAgICAgfCAgIFBhbmVsIGZvciBTdWJpdGVtIDEsIHRoaXMgaXMgUGFnZSAxICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4vLyAgICAgICB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbi8vICAgICAgIHwgICBFYWNoIFBhbmVsIGNhbiBoYXZlIG11bHRpcGxlIHBhZ2VzLCBvbmUgcGFnZSBzaG93aW5nIGF0IGEgdGltZS4gIEJ1dHRvbnMgb24gcGFnZXMgc3dpdGNoICAgICAgfFxuLy8gICAgICAgfCAgIGJldHdlZW4gcGFnZXMuICBQYW5lbCBoZWlnaHQgYWRqdXN0cyB0byB0aGUgaGVpZ2h0IG9mIHRoZSBwYWdlLiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4vLyAgICAgICB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbi8vICAgICAgIHwgICBbIHNlZSBwYWdlIDIgXSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuLy8gICAgICAgfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4vLyAgICAgICAnLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSdcbi8vXG4vLyAtIG1lbnVzIGFyZSBhbHdheXMgPHVsPiB0YWdzOyBlYWNoIDxsaT4gaXMgYSBtZW51IGl0ZW1cbi8vIC0gYSBtYWluIG1lbnUgPGxpPiBtdXN0IGNvbnRhaW4gYW4gPGE+IHRhZyBhbmQgbWF5IGFsc28gY29udGFpbiBhIDx1bD4gc3VibWVudVxuLy8gLSBhIHN1Ym1lbnUgPGxpPiBtdXN0IGNvbnRhaW4gYW4gPGE+IHRhZyB3aXRoIGEgZGF0YS10YXJnZXRwYW5lbCBhdHRyaWJ1dGUgc2V0XG4vLyAtIFRoZXJlIGlzIGFsd2F5cyBhIHNpbmdsZSBzZWxlY3RlZCBtYWluIG1lbnUgaXRlbVxuLy8gLSBBIG1haW4gbWVudSBpdGVtIG1heSBlaXRoZXIgbGluayB0byBhbm90aGVyIHdlYnBhZ2UsIG9yIGhhdmUgYSBzdWJtZW51XG4vLyAtIFNlbGVjdGluZyBhIG1haW4gbWVudSBpdGVtIHdpbGwgc2hvdyBpdHMgc3VibWVudSwgaWYgaXQgaGFzIG9uZVxuLy8gLSBBIHN1Ym1lbnUgYWx3YXlzIGhhcyBhIHNpbmdsZSBpdGVtIHNlbGVjdGVkXG4vLyAtIENsaWNraW5nIGFuIGluYWN0aXZlIHN1Ym1lbnUgaXRlbSB3aWxsIHNob3cgaXRzIHBhbmVsXG4vLyAtIENsaWNraW5nIGEgc2VsZWN0ZWQgc3VibWVudSBpdGVtIHdpbGwgdG9nZ2xlIGl0cyBwYW5lbCBzaG93aW5nIDwtPiBoaWRpbmcgKCgoIE5COiBub3QgeWV0IGltcGxlbWVudGVkICkpKVxuLy8gLSBBIHBhbmVsIGluaXRpYWxseSBzaG93cyBpdHMgZmlyc3QgcGFnZVxuLy8gLSBTd2l0Y2hpbmcgcGFnZXMgaW4gYSBwYW5lbCBjaGFuZ2VzIHRoZSBwYW5lbCBoZWlnaHQgdG8gc3VpdCBpdHMgY3VycmVudCBwYWdlXG4vLyAtIEEgcGFuZWwgaXMgYSBIVE1MIGJsb2NrIGVsZW1lbnQgd2l0aCB0aGUgY2xhc3MgLm1zcHAtcGFuZWwgKGNhbiBiZSBvdmVycmlkZGVuIHZpYSBvcHRpb24pXG4vLyAtIElmIGEgcGFuZWwgY29udGFpbnMgcGFnZXMsIG9uZSBwYWdlIHNob3VsZCBoYXZlIHRoZSBjbGFzcyAuY3VycmVudCAoY2FuIGJlIG92ZXJyaWRkZW4gdmlhIG9wdGlvbilcbi8vIC0gQSBwYWdlIGlzIGEgSFRNTCBibG9jayBlbGVtZW50IHdpdGggdGhlIGNsYXNzIC5tc3BwLXBhZ2UgKGNhbiBiZSBvdmVycmlkZGVuIHZpYSBvcHRpb24pXG4vLyAtIDxidXR0b24+IG9yIDxhPiB0YWdzIGluIHBhZ2VzIHRoYXQgaGF2ZSBhIGRhdGEtdGFyZ2V0cGFnZSBhdHRyaWJ1dGUgc2V0IHdpbGwgc3dpdGNoIHRvIHRoZSBpbmRpY2F0ZWQgcGFnZVxuLy9cbi8vXG4vLyBUaGUgSFRNTCBzaG91bGQgbG9vayBsaWtlIHRoaXM6XG4vL1xuLy8gIDx1bCBjbGFzcz1cIm1lbnVcIj4gICAgICAgICAgICAgICAgICAgPCEtLSB0aGlzIGlzIHRoZSBtYWluIG1lbnUgLS0+XG4vLyAgICAgIDxsaSBjbGFzcz1cImN1cnJlbnRcIj4gICAgICAgICAgICA8IS0tIHRoaXMgaXMgYSBtYWluIG1lbnUgaXRlbSwgY3VycmVudGx5IHNlbGVjdGVkIC0tPlxuLy8gICAgICAgICAgPGE+Rmlyc3QgSXRlbTwvYT4gICAgICAgICAgIDwhLS0gdGhlIGZpcnN0IGl0ZW0gaW4gdGhlIG1haW4gbWVudSAtLT5cbi8vICAgICAgICAgIDx1bD4gICAgICAgICAgICAgICAgICAgICAgICA8IS0tIGEgc3VibWVudSBpbiB0aGUgZmlyc3QgbWFpbiBtZW51IGl0ZW0gLS0+XG4vLyAgICAgICAgICAgICAgPGxpIGNsYXNzPVwiY3VycmVudFwiPiAgICA8IS0tIHRoZSBjdXJyZW50bHkgc2VsZWN0ZWQgc3VibWVudSBpdGVtIC0tPlxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwhLS0gLnBhbmVsdHJpZ2dlciBhbmQgdGhlIGRhdGEtcGFuZWxpZCBhdHRyaWJ1dGUgYXJlIHJlcXVpcmVkIC0tPlxuLy8gICAgICAgICAgICAgICAgICA8YSBkYXRhLXRhcmdldHBhbmVsPVwicGFuZWwxXCI+ZG8gdGhlIHBhbmVsMSB0aGluZzwvYT5cbi8vICAgICAgICAgICAgICA8L2xpPlxuLy8gICAgICAgICAgICAgIDxsaT4uLi48L2xpPiAgICAgICAgICAgIDwhLS0gYW5vdGhlciBzdWJtZW51IGl0ZW0gLS0+XG4vLyAgICAgICAgICA8L3VsPlxuLy8gICAgICA8L2xpPlxuLy8gICAgICA8bGk+IDxhIGhyZWY9XCJhbm90aGVyX3BhZ2UuaHRtbFwiPmFub3RoZXIgcGFnZTwvYT4gPC9saT5cbi8vICAgICAgPGxpPiA8YT53aGF0ZXZlcjwvYT4gPC9saT5cbi8vICA8L3VsPlxuLy9cbi8vICA8ZGl2IGlkPVwicGFuZWwxXCIgY2xhc3M9XCJtc3BwLXBhbmVsXCI+XG4vLyAgICAgIDxkaXYgaWQ9XCJwYWdlMTFcIiBjbGFzcz1cIm1zcHAtcGFnZSBjdXJyZW50XCI+XG4vLyAgICAgICAgICBUaGlzIGlzIHRoZSBjdXJyZW50IHBhZ2Ugb24gcGFuZWwgMS5cbi8vICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGRhdGEtdGFyZ2V0cGFnZT1cInBhZ2UxMlwiPnNob3cgcGFnZSAyPC9idXR0b24+XG4vLyAgICAgIDwvZGl2PlxuLy8gICAgICA8ZGl2IGlkPVwicGFnZTEyXCIgY2xhc3M9XCJtc3BwLXBhZ2VcIj5cbi8vICAgICAgICAgIFRoaXMgaXMgdGhlIG90aGVyIHBhZ2Ugb24gcGFuZWwgMS5cbi8vICAgICAgICAgIDxhIGRhdGEtdGFyZ2V0cGFnZT1cInBhZ2UxMVwiPnNlZSB0aGUgZmlyc3QgcGFnZSBhZ2FpbjwvYT5cbi8vICAgICAgPC9kaXY+XG4vLyAgPC9kaXY+XG4vLyAgPGRpdiBpZD1cInBhbmVsMlwiIGNsYXNzPVwibXNwcC1wYW5lbFwiPlxuLy8gICAgICA8ZGl2IGlkPVwicGFnZTIxXCIgY2xhc3M9XCJtc3BwLXBhZ2UgY3VycmVudFwiPlxuLy8gICAgICAgICAgVGhpcyBpcyB0aGUgY3VycmVudCBwYWdlIG9uIHBhbmVsIDIuXG4vLyAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBkYXRhLXRhcmdldHBhZ2U9XCJwYWdlMjJcIj5zaG93IHBhZ2UgMjwvYnV0dG9uPlxuLy8gICAgICA8L2Rpdj5cbi8vICAgICAgPGRpdiBpZD1cInBhZ2UyMlwiIGNsYXNzPVwibXNwcC1wYWdlXCI+XG4vLyAgICAgICAgICBUaGlzIGlzIHRoZSBvdGhlciBwYWdlIG9uIHBhbmVsIDIuXG4vLyAgICAgICAgICA8YSBkYXRhLXRhcmdldHBhZ2U9XCJwYWdlMjFcIj5zZWUgdGhlIGZpcnN0IHBhZ2UgYWdhaW48L2E+XG4vLyAgICAgIDwvZGl2PlxuLy8gIDwvZGl2PlxuXG5cbjsoIGZ1bmN0aW9uKCQsIHdpbmRvdywgZG9jdW1lbnQsIHVuZGVmaW5lZCkge1xuXG4gICAgLy8gbmFtZXNwYWNlIGNsaW1hcywgd2lkZ2V0IG5hbWUgbXNwcFxuICAgIC8vIHNlY29uZCBhcmcgaXMgdXNlZCBhcyB0aGUgd2lkZ2V0J3MgXCJwcm90b3R5cGVcIiBvYmplY3RcbiAgICAkLndpZGdldCggXCJjbGltYXMubXNwcFwiICwge1xuXG4gICAgICAgIC8vT3B0aW9ucyB0byBiZSB1c2VkIGFzIGRlZmF1bHRzXG4gICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgIGFuaW1hdGlvbkZhY3RvcjogMixcblxuICAgICAgICAgICAgbWFpbk1lbnVDbGFzczogJ21zcHAtbWFpbi1tZW51JyxcblxuICAgICAgICAgICAgcGFuZWxDbGFzczogJ21zcHAtcGFuZWwnLFxuICAgICAgICAgICAgcGFnZUNsYXNzOiAnbXNwcC1wYWdlJyxcblxuICAgICAgICAgICAgY2xlYXJmaXhDbGFzczogJ21zcHAtY2xlYXJmaXgnLFxuICAgICAgICAgICAgYWN0aXZlQ2xhc3M6ICdjdXJyZW50J1xuICAgICAgICB9LFxuICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgIC8vU2V0dXAgd2lkZ2V0IChlZy4gZWxlbWVudCBjcmVhdGlvbiwgYXBwbHkgdGhlbWluZ1xuICAgICAgICAvLyAsIGJpbmQgZXZlbnRzIGV0Yy4pXG4gICAgICAgIF9jcmVhdGU6IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICB2YXIgYmFzZSA9IHRoaXM7XG4gICAgICAgICAgICB2YXIgb3B0cyA9IHRoaXMub3B0aW9ucztcblxuICAgICAgICAgICAgLy8gcG9wdWxhdGUgc29tZSBjb252ZW5pZW5jZSB2YXJpYWJsZXNcbiAgICAgICAgICAgIHZhciAkbWVudSA9IHRoaXMuZWxlbWVudDtcbiAgICAgICAgICAgIHRoaXMubWFpbk1lbnVJdGVtcyA9ICRtZW51LmNoaWxkcmVuKCdsaScpO1xuICAgICAgICAgICAgdGhpcy5wYW5lbHMgPSAkKCcuJyArIG9wdHMucGFuZWxDbGFzcyk7XG5cbiAgICAgICAgICAgIC8vIGRpc2FwcGVhciB3aGlsZSB3ZSBzb3J0IHRoaW5ncyBvdXRcbiAgICAgICAgICAgICRtZW51LmNzcyh7IG9wYWNpdHk6IDAgfSk7XG4gICAgICAgICAgICB0aGlzLnBhbmVscy5jc3MoeyBvcGFjaXR5OiAwIH0pO1xuXG4gICAgICAgICAgICAvLyBtYWtlIHNvbWUgRE9NIG1vZHNcbiAgICAgICAgICAgICRtZW51LmFkZENsYXNzKG9wdHMubWFpbk1lbnVDbGFzcyk7XG4gICAgICAgICAgICAkbWVudS5hZGRDbGFzcyhvcHRzLmNsZWFyZml4Q2xhc3MpO1xuICAgICAgICAgICAgdGhpcy5wYW5lbHMuYWRkQ2xhc3Mob3B0cy5jbGVhcmZpeENsYXNzKTtcblxuICAgICAgICAgICAgLy8gbGF5b3V0IHRoZSBtZW51XG4gICAgICAgICAgICB0aGlzLl9sYXlvdXRNZW51KCk7XG5cbiAgICAgICAgICAgIC8vIGxheW91dCB0aGUgcGFuZWxzXG4gICAgICAgICAgICB0aGlzLl9sYXlvdXRQYW5lbHMoKTtcblxuICAgICAgICAgICAgLy8gaG9vayB1cCBjbGljayBoYW5kbGluZyBldGNcbiAgICAgICAgICAgICRtZW51Lm9uKCdtc3Bwc2hvd21lbnUnLCB0aGlzLl9zaG93TWVudSk7XG4gICAgICAgICAgICAkbWVudS5vbignbXNwcHNob3dzdWJtZW51JywgdGhpcy5fc2hvd1N1Yk1lbnUpO1xuICAgICAgICAgICAgJG1lbnUub24oJ21zcHBzaG93cGFuZWwnLCB0aGlzLl9zaG93UGFuZWwpO1xuICAgICAgICAgICAgJG1lbnUub24oJ21zcHBzaG93cGFnZScsIHRoaXMuX3Nob3dQYWdlKTtcblxuICAgICAgICAgICAgLy8gYXR0YWNoIGhhbmRsZXJzIHRvIHRoZSBtZW51LXRyaWdnZXJzXG4gICAgICAgICAgICB0aGlzLm1haW5NZW51SXRlbXMuZWFjaCggZnVuY3Rpb24oaW5kZXgsIGl0ZW0pIHtcbiAgICAgICAgICAgICAgICAvLyB0aGUgbGkgbWVudSBpdGVtIGhhcyBhIGNoaWxkIGEgdGhhdCBpcyBpdCdzIHRyaWdnZXJcbiAgICAgICAgICAgICAgICAkKGl0ZW0pLmNoaWxkcmVuKCdhJykuY2xpY2soIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIGJhc2UuX3RyaWdnZXIoJ3Nob3dtZW51JywgZXZlbnQsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lbnVpdGVtOiBpdGVtLFxuICAgICAgICAgICAgICAgICAgICAgICAgd2lkZ2V0OiBiYXNlXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIC8vIGF0dGFjaCBoYW5kbGVycyB0byB0aGUgc3VibWVudSBpdGVtc1xuICAgICAgICAgICAgICAgICQoaXRlbSkuZmluZCgnbGknKS5lYWNoKCBmdW5jdGlvbihpbmRleCwgc3ViTWVudUl0ZW0pIHtcbiAgICAgICAgICAgICAgICAgICAgJChzdWJNZW51SXRlbSkuZmluZCgnYScpLmNsaWNrKCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYmFzZS5fdHJpZ2dlcignc2hvd3N1Ym1lbnUnLCBldmVudCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lbnVpdGVtOiBpdGVtLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1Ym1lbnVpdGVtOiBzdWJNZW51SXRlbSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWRnZXQ6IGJhc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBhdHRhY2ggaGFuZGxlcnMgdG8gdGhlIHBhbmVsIHRyaWdnZXJzXG4gICAgICAgICAgICAkbWVudS5maW5kKCdbZGF0YS10YXJnZXRwYW5lbF0nKS5lYWNoKCBmdW5jdGlvbihpbmRleCwgdHJpZ2dlcikge1xuICAgICAgICAgICAgICAgIHZhciAkdHJpZ2dlciA9JCh0cmlnZ2VyKTtcbiAgICAgICAgICAgICAgICAkdHJpZ2dlci5jbGljayggZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgYmFzZS5fdHJpZ2dlcignc2hvd3BhbmVsJywgZXZlbnQsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhbmVsOiAkKCcjJyArICR0cmlnZ2VyLmRhdGEoJ3RhcmdldHBhbmVsJykpLmZpcnN0KCksXG4gICAgICAgICAgICAgICAgICAgICAgICB3aWRnZXQ6IGJhc2VcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gYXR0YWNoIGhhbmRsZXJzIHRvIHRoZSBwYWdlIHN3aXRjaGVyc1xuICAgICAgICAgICAgdGhpcy5wYW5lbHMuZWFjaCggZnVuY3Rpb24oaW5kZXgsIHBhbmVsKSB7XG4gICAgICAgICAgICAgICAgdmFyICRwYW5lbCA9ICQocGFuZWwpO1xuICAgICAgICAgICAgICAgICRwYW5lbC5maW5kKCdbZGF0YS10YXJnZXRwYWdlXScpLmNsaWNrKCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgICAgICAgICBiYXNlLl90cmlnZ2VyKCdzaG93cGFnZScsIGV2ZW50LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYW5lbDogJHBhbmVsLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGFnZTogJCgnIycgKyAkKHRoaXMpLmRhdGEoJ3RhcmdldHBhZ2UnKSksXG4gICAgICAgICAgICAgICAgICAgICAgICB3aWRnZXQ6IGJhc2VcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gYWN0aXZhdGUgdGhlIGN1cnJlbnQgbWVudXMsIHBhbmVscyBldGNcbiAgICAgICAgICAgIHZhciAkY3VycmVudE1haW4gPSB0aGlzLm1haW5NZW51SXRlbXMuZmlsdGVyKCcuJyArIG9wdHMuYWN0aXZlQ2xhc3MpO1xuICAgICAgICAgICAgJGN1cnJlbnRNYWluLnJlbW92ZUNsYXNzKG9wdHMuYWN0aXZlQ2xhc3MpLmNoaWxkcmVuKCdhJykuY2xpY2soKTtcblxuICAgICAgICAgICAgLy8gZmluYWxseSwgZmFkZSBiYWNrIGluXG4gICAgICAgICAgICAkbWVudS5hbmltYXRlKHsgb3BhY2l0eTogMSB9LCAnZmFzdCcpO1xuXG4gICAgICAgICAgICAvLyBwYW5lbHMgc3RheSBpbnZpc2libGVcbiAgICAgICAgfSxcbiAgICAgICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICBfc3dpdGNoQ2xhc3NPcHRpb246IGZ1bmN0aW9uKGNsYXNzTmFtZSwgbmV3Q2xhc3MpIHtcbiAgICAgICAgICAgIHZhciBvbGRDbGFzcyA9IHRoaXMub3B0aW9uc1tjbGFzc05hbWVdO1xuICAgICAgICAgICAgaWYgKG9sZENsYXNzICE9PSBuZXdDbGFzcykge1xuICAgICAgICAgICAgICAgIHZhciBncm91cCA9IHRoaXMuZWxlbWVudC5maW5kKCcuJyArIG9sZENsYXNzKTtcbiAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnNbY2xhc3NOYW1lXSA9IG5ld0NsYXNzO1xuICAgICAgICAgICAgICAgIGdyb3VwLnJlbW92ZUNsYXNzKG9sZENsYXNzKTtcbiAgICAgICAgICAgICAgICBncm91cC5hZGRDbGFzcyhuZXdDbGFzcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgICAgLy8gUmVzcG9uZCB0byBhbnkgY2hhbmdlcyB0aGUgdXNlciBtYWtlcyB0byB0aGVcbiAgICAgICAgLy8gb3B0aW9uIG1ldGhvZFxuICAgICAgICBfc2V0T3B0aW9uOiBmdW5jdGlvbihrZXksIHZhbHVlKSB7XG4gICAgICAgICAgICBzd2l0Y2ggKGtleSkge1xuICAgICAgICAgICAgICAgIGNhc2UgXCJtYWluTWVudUNsYXNzXCI6XG4gICAgICAgICAgICAgICAgY2FzZSBcImNsZWFyZml4Q2xhc3NcIjpcbiAgICAgICAgICAgICAgICBjYXNlIFwiYWN0aXZlQ2xhc3NcIjpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fc3dpdGNoQ2xhc3NPcHRpb24oa2V5LCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zW2tleV0gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgLy8gaXQncyBva2F5IHRoYXQgdGhlcmUncyBubyB9IGhlcmVcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIHJlbWVtYmVyIHRvIGNhbGwgb3VyIHN1cGVyJ3MgX3NldE9wdGlvbiBtZXRob2RcbiAgICAgICAgICAgIHRoaXMuX3N1cGVyKCBcIl9zZXRPcHRpb25cIiwga2V5LCB2YWx1ZSApO1xuICAgICAgICB9LFxuICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgIC8vIERlc3Ryb3kgYW4gaW5zdGFudGlhdGVkIHBsdWdpbiBhbmQgY2xlYW4gdXBcbiAgICAgICAgLy8gbW9kaWZpY2F0aW9ucyB0aGUgd2lkZ2V0IGhhcyBtYWRlIHRvIHRoZSBET01cbiAgICAgICAgX2Rlc3Ryb3k6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50LnJlbW92ZUNsYXNzKHRoaXMub3B0aW9ucy5tYWluTWVudUNsYXNzKTtcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5yZW1vdmVDbGFzcyh0aGlzLm9wdGlvbnMuY2xlYXJmaXhDbGFzcyk7XG4gICAgICAgICAgICB0aGlzLnBhbmVscy5yZW1vdmVDbGFzcyh0aGlzLm9wdGlvbnMuY2xlYXJmaXhDbGFzcyk7XG4gICAgICAgIH0sXG4gICAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgICAgLy8gZG8gdGhlIGxheW91dCBjYWxjdWxhdGlvbnNcbiAgICAgICAgX2xheW91dE1lbnU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgLy8gZ28gdGhyb3VnaCBlYWNoIHN1Ym1lbnUgYW5kIHJlY29yZCBpdHMgd2lkdGhcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5maW5kKCd1bCcpLmVhY2goIGZ1bmN0aW9uKGluZGV4LCBzdWJNZW51KSB7XG4gICAgICAgICAgICAgICAgdmFyICRzbSA9ICQoc3ViTWVudSk7XG4gICAgICAgICAgICAgICAgJHNtLmNzcyh7d2lkdGg6ICdhdXRvJ30pO1xuICAgICAgICAgICAgICAgICRzbS5kYXRhKCdvcmlnaW5hbFdpZHRoJywgJHNtLndpZHRoKCkpO1xuXG4gICAgICAgICAgICAgICAgLy8gbGVhdmUgZWFjaCBzdWJtZW51IGhpZGRlbiwgd2l0aCB3aWR0aCAwXG4gICAgICAgICAgICAgICAgJHNtLmNzcyh7IHdpZHRoOiAwLCBkaXNwbGF5OiAnbm9uZScgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICBfc2hvd01lbnU6IGZ1bmN0aW9uKGV2ZW50LCBkYXRhKSB7XG4gICAgICAgICAgICB2YXIgJGl0ZW0gPSAkKGRhdGEubWVudWl0ZW0pO1xuICAgICAgICAgICAgdmFyIGJhc2UgPSBkYXRhLndpZGdldDtcbiAgICAgICAgICAgIC8vICRpdGVtIGlzIGEgY2xpY2tlZC1vbiBtZW51IGl0ZW0uLlxuICAgICAgICAgICAgaWYgKCRpdGVtLmhhc0NsYXNzKGJhc2Uub3B0aW9ucy5hY3RpdmVDbGFzcykpIHtcbiAgICAgICAgICAgICAgICAvLyA/P1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBiYXNlLl9oaWRlUGFuZWxzKCk7XG4gICAgICAgICAgICAgICAgYmFzZS5tYWluTWVudUl0ZW1zLnJlbW92ZUNsYXNzKGJhc2Uub3B0aW9ucy5hY3RpdmVDbGFzcyk7XG4gICAgICAgICAgICAgICAgdmFyICRuZXdTdWJNZW51ID0gJGl0ZW0uZmluZCgndWwnKTtcbiAgICAgICAgICAgICAgICB2YXIgJG9sZFN1Yk1lbnVzID0gYmFzZS5lbGVtZW50LmZpbmQoJ3VsJykubm90KCRuZXdTdWJNZW51KTtcbiAgICAgICAgICAgICAgICB2YXIgbmV3V2lkdGggPSAkbmV3U3ViTWVudS5kYXRhKCdvcmlnaW5hbFdpZHRoJyk7XG5cbiAgICAgICAgICAgICAgICAkb2xkU3ViTWVudXMuYW5pbWF0ZSh7IHdpZHRoOiAwIH0sICg1MCAqIGJhc2Uub3B0aW9ucy5hbmltYXRpb25GYWN0b3IpLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgJG9sZFN1Yk1lbnVzLmNzcyh7IGRpc3BsYXk6ICdub25lJyB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAkaXRlbS5hZGRDbGFzcyhiYXNlLm9wdGlvbnMuYWN0aXZlQ2xhc3MpO1xuICAgICAgICAgICAgICAgICRuZXdTdWJNZW51XG4gICAgICAgICAgICAgICAgICAgIC5jc3Moe2Rpc3BsYXk6ICdibG9jaycgfSlcbiAgICAgICAgICAgICAgICAgICAgLmFuaW1hdGUoeyB3aWR0aDogbmV3V2lkdGggfSwgKDEyNSAqIGJhc2Uub3B0aW9ucy5hbmltYXRpb25GYWN0b3IpLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICRuZXdTdWJNZW51LmNzcyh7IHdpZHRoOiAnYXV0bycgfSkucmVtb3ZlQXR0cignc3R5bGUnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhc2UuX3RyaWdnZXIoJ21lbnVzaG93bicsIGV2ZW50LCB7IGl0ZW06ICRpdGVtLCB3aWRnZXQ6IGJhc2UgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgO1xuICAgICAgICAgICAgICAgIC8vIGlmIHRoZSBuZXcgc3VibWVudSBoYXMgYW4gYWN0aXZlIGl0ZW0sIGNsaWNrIGl0XG4gICAgICAgICAgICAgICAgJG5ld1N1Yk1lbnUuZmluZCgnLicgKyBiYXNlLm9wdGlvbnMuYWN0aXZlQ2xhc3MgKyAnIGEnKS5jbGljaygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgIF9zaG93U3ViTWVudTogZnVuY3Rpb24oZXZlbnQsIGRhdGEpIHtcbiAgICAgICAgICAgIC8vIGRlLWFjdGl2ZWlmeSBhbGwgdGhlIHN1Ym1lbnUgaXRlbXNcbiAgICAgICAgICAgICQoZGF0YS5tZW51aXRlbSkuZmluZCgnbGknKS5yZW1vdmVDbGFzcyhkYXRhLndpZGdldC5vcHRpb25zLmFjdGl2ZUNsYXNzKTtcbiAgICAgICAgICAgIC8vIGFjdGl2ZS1pZnkgdGhlIG9uZSB0cnVlIHN1Ym1lbnUgaXRlbVxuICAgICAgICAgICAgJChkYXRhLnN1Ym1lbnVpdGVtKS5hZGRDbGFzcyhkYXRhLndpZGdldC5vcHRpb25zLmFjdGl2ZUNsYXNzKTtcbiAgICAgICAgfSxcbiAgICAgICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICAvLyBkbyB0aGUgbGF5b3V0IGNhbGN1bGF0aW9uc1xuICAgICAgICBfbGF5b3V0UGFuZWxzOiBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgdmFyICRwYWdlcyA9IHRoaXMucGFuZWxzLmZpbmQoJy4nICsgdGhpcy5vcHRpb25zLnBhZ2VDbGFzcyk7XG5cbiAgICAgICAgICAgIC8vIGdvIHRocm91Z2ggZWFjaCBwYWdlIGFuZCByZWNvcmQgaXRzIGhlaWdodFxuICAgICAgICAgICAgJHBhZ2VzLmVhY2goIGZ1bmN0aW9uKGluZGV4LCBwYWdlKSB7XG4gICAgICAgICAgICAgICAgdmFyICRwYWdlID0gJChwYWdlKTtcbiAgICAgICAgICAgICAgICAkcGFnZS5jc3Moe2hlaWdodDogJ2F1dG8nfSk7XG4gICAgICAgICAgICAgICAgJHBhZ2UuZGF0YSgnb3JpZ2luYWxIZWlnaHQnLCAkcGFnZS5vdXRlckhlaWdodCgpKTtcblxuICAgICAgICAgICAgICAgIC8vIGxlYXZlIGVhY2ggcGFnZSBoaWRkZW4sIHdpdGggaGVpZ2h0IDBcbiAgICAgICAgICAgICAgICAkcGFnZS5jc3MoeyBoZWlnaHQ6IDAsIGRpc3BsYXk6ICdub25lJyB9KTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBnbyB0aHJvdWdoIGVhY2ggcGFuZWwgYW5kIGhpZGUgaXRcbiAgICAgICAgICAgIHRoaXMucGFuZWxzLmVhY2goIGZ1bmN0aW9uKGluZGV4LCBwYW5lbCkge1xuICAgICAgICAgICAgICAgIHZhciAkcGFuZWwgPSAkKHBhbmVsKTtcbiAgICAgICAgICAgICAgICAkcGFuZWwuY3NzKHsgZGlzcGxheTogJ25vbmUnIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgICAgX2hpZGVQYW5lbHM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5wYW5lbHMucmVtb3ZlQ2xhc3ModGhpcy5vcHRpb25zLmFjdGl2ZUNsYXNzKS5jc3MoeyBkaXNwbGF5OiAnbm9uZScsIGhlaWdodDogMCB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICBfc2hvd1BhbmVsOiBmdW5jdGlvbihldmVudCwgZGF0YSkge1xuICAgICAgICAgICAgdmFyICRwYW5lbCA9ICQoZGF0YS5wYW5lbCk7XG4gICAgICAgICAgICB2YXIgYmFzZSA9IGRhdGEud2lkZ2V0O1xuICAgICAgICAgICAgLy8gJHBhbmVsIGlzIGEgcGFuZWwgdG8gc2hvdy4uXG4gICAgICAgICAgICBpZiAoJHBhbmVsLmhhc0NsYXNzKGJhc2Uub3B0aW9ucy5hY3RpdmVDbGFzcykpIHtcbiAgICAgICAgICAgICAgICAvLyA/P1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBiYXNlLl9oaWRlUGFuZWxzKCk7XG4gICAgICAgICAgICAgICAgJHBhbmVsLmFkZENsYXNzKGJhc2Uub3B0aW9ucy5hY3RpdmVDbGFzcyk7XG4gICAgICAgICAgICAgICAgJHBhbmVsLmNzcyh7IGRpc3BsYXk6ICdibG9jaycsIG9wYWNpdHk6IDEgfSk7XG4gICAgICAgICAgICAgICAgdmFyICRwYWdlID0gJCgkcGFuZWwuZmluZCgnLicgKyBiYXNlLm9wdGlvbnMucGFnZUNsYXNzICsgJy4nICsgYmFzZS5vcHRpb25zLmFjdGl2ZUNsYXNzKSk7XG4gICAgICAgICAgICAgICAgYmFzZS5fdHJpZ2dlcignc2hvd3BhZ2UnLCBldmVudCwgeyBwYW5lbDogJHBhbmVsLCBwYWdlOiAkcGFnZSwgd2lkZ2V0OiBiYXNlIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgIF9zaG93UGFnZTogZnVuY3Rpb24oZXZlbnQsIGRhdGEpIHtcbiAgICAgICAgICAgIHZhciBiYXNlID0gZGF0YS53aWRnZXQ7XG4gICAgICAgICAgICB2YXIgJHBhbmVsID0gJChkYXRhLnBhbmVsKTtcbiAgICAgICAgICAgIHZhciAkcGFnZSA9ICQoZGF0YS5wYWdlKTtcbiAgICAgICAgICAgIHZhciBuZXdIZWlnaHQgPSAkcGFnZS5kYXRhKCdvcmlnaW5hbEhlaWdodCcpO1xuXG4gICAgICAgICAgICAvLyBmaXggdGhlIHBhbmVsJ3MgY3VycmVudCBoZWlnaHRcbiAgICAgICAgICAgICRwYW5lbC5jc3Moe2hlaWdodDogJHBhbmVsLmhlaWdodCgpIH0pO1xuXG4gICAgICAgICAgICAvLyBkZWFsIHdpdGggdGhlIHBhZ2UgY3VycmVudGx5IGJlaW5nIGRpc3BsYXllZFxuICAgICAgICAgICAgdmFyICRvbGRQYWdlID0gJHBhbmVsLmZpbmQoJy4nICsgYmFzZS5vcHRpb25zLnBhZ2VDbGFzcyArICcuJyArIGJhc2Uub3B0aW9ucy5hY3RpdmVDbGFzcykubm90KCRwYWdlKTtcbiAgICAgICAgICAgIGlmICgkb2xkUGFnZS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgJG9sZFBhZ2UuZGF0YSgnb3JpZ2luYWxIZWlnaHQnLCAkb2xkUGFnZS5vdXRlckhlaWdodCgpKTtcbiAgICAgICAgICAgICAgICAkb2xkUGFnZS5yZW1vdmVDbGFzcyhiYXNlLm9wdGlvbnMuYWN0aXZlQ2xhc3MpLmZhZGVPdXQoKDUwICogYmFzZS5vcHRpb25zLmFuaW1hdGlvbkZhY3RvciksIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAkb2xkUGFnZS5jc3MoeyBoZWlnaHQ6IDAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIHN3aXRjaCBvbiB0aGUgbmV3IHBhZ2UgYW5kIGdyb3cgdGhlIG9wYW5lbCB0byBob2xkIGl0XG4gICAgICAgICAgICAkcGFnZS5jc3MoeyBoZWlnaHQ6ICdhdXRvJyB9KS5hZGRDbGFzcyhiYXNlLm9wdGlvbnMuYWN0aXZlQ2xhc3MpLmZhZGVJbigoMTAwICogYmFzZS5vcHRpb25zLmFuaW1hdGlvbkZhY3RvciksIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICRwYWdlLnJlbW92ZUF0dHIoJ3N0eWxlJyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHZhciBhbmltVGltZSA9ICgkb2xkUGFnZS5sZW5ndGggPiAwID8gKDEwMCAqIGJhc2Uub3B0aW9ucy5hbmltYXRpb25GYWN0b3IpIDogKDE1MCAqIGJhc2Uub3B0aW9ucy5hbmltYXRpb25GYWN0b3IpKTsgLy8gYW5pbWF0ZSBmYXN0ZXIgaWYgaXQncyBzd2l0Y2hpbmcgcGFnZXNcbiAgICAgICAgICAgICRwYW5lbC5hbmltYXRlKHsgaGVpZ2h0OiBuZXdIZWlnaHQgfSwgYW5pbVRpbWUsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICRwYW5lbC5yZW1vdmVBdHRyKCdzdHlsZScpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgfSxcbiAgICAgICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICBfOiBudWxsIC8vIG5vIGZvbGxvd2luZyBjb21tYVxuICAgIH0pO1xuXG59KShqUXVlcnksIHdpbmRvdywgZG9jdW1lbnQpO1xuXG5cblxuXG5cblxuXG5cblxuXG5cblxuIiwiXG4oZnVuY3Rpb24oKXtcblxuXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIC8vIGNvbnZlbmllbmNlIGZ1bmN0aW9uc1xuICAgIHZhciBlbmFibGVHb0J1dHRvbiA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoJC5pbkFycmF5KCQoJyNzcGVjaWVzbmFtZScpLnZhbCgpLCBzcGVjaWVzU2NpTmFtZUxpc3QpID4gLTEpIHtcbiAgICAgICAgICAgICQoJyNzcHBzaG93bWFwJykucmVtb3ZlQ2xhc3MoJ2Rpc2FibGVkJykucHJvcCgnZGlzYWJsZWQnLCBmYWxzZSk7IC8vIGVuYWJsZSB0aGUgYnV0dG9uXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAkKCcjc3Bwc2hvd21hcCcpLmFkZENsYXNzKCdkaXNhYmxlZCcpLnByb3AoJ2Rpc2FibGVkJywgdHJ1ZSk7IC8vIERJU2FibGUgdGhlIGJ1dHRvblxuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8vIHdvcmsgb3V0IHdoZW4gdG8gZGlzYWJsZSB0aGluZ3NcbiAgICB2YXIgZW5hYmxlRnV0dXJlRmllbGRzID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgLy8gZmV0Y2ggdGhlIGN1cnJlbnQgZm9ybSBlbGVtZW50c1xuICAgICAgICB2YXIgJHRpbWVQb2ludEN0bCA9ICQoJ2lucHV0W25hbWU9c3BwdGltZXBvaW50XTpjaGVja2VkJyk7XG5cbiAgICAgICAgaWYgKCR0aW1lUG9pbnRDdGwudmFsKCkgPT09ICdiYXNlbGluZScpIHtcbiAgICAgICAgICAgICQoJ2lucHV0W25hbWU9c3Bwc2NlbmFyaW9dLCBpbnB1dFtuYW1lPXNwcGdjbV0nKS5wcm9wKCdkaXNhYmxlZCcsIHRydWUpOyAvLyBESVNhYmxlIHRoZSBmdXR1cmUgZmllbGRzXG4gICAgICAgICAgICAkKCdmaWVsZHNldC5zcHBzY2VuYXJpbywgZmllbGRzZXQuc3BwZ2NtJykuYWRkQ2xhc3MoJ2Rpc2FibGVkJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAkKCdpbnB1dFtuYW1lPXNwcHNjZW5hcmlvXSwgaW5wdXRbbmFtZT1zcHBnY21dJykucHJvcCgnZGlzYWJsZWQnLCBmYWxzZSk7IC8vIGVuYWJsZSB0aGUgZnV0dXJlIGZpZWxkc1xuICAgICAgICAgICAgJCgnZmllbGRzZXQuc3Bwc2NlbmFyaW8sIGZpZWxkc2V0LnNwcGdjbScpLnJlbW92ZUNsYXNzKCdkaXNhYmxlZCcpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAvLyBmZXRjaCB0aGUgc3BlY2llcyBsaXN0XG4gICAgc3BlY2llc0ZldGNoID0gJC5hamF4KHtcbiAgICAgICAgdXJsOiAnL2RhdGEvc3BlY2llcydcbiAgICB9KTtcbiAgICAvLyBnZXQgYSB2YXJpYWJsZSByZWFkIGZvciBvdXIgbGlzdFxuICAgIHZhciBzcGVjaWVzTG9va3VwTGlzdCA9IFtdO1xuICAgIHZhciBzcGVjaWVzU2NpTmFtZUxpc3QgPSBbXTtcblxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAvLyBzZXQgdXAgdGhlIGF1dG9jb21wbGV0ZSBmaWVsZFxuXG4gICAgLy8gZG8gdGhpcyBhZnRlciB3ZSd2ZSBmZXRjaGVkIHRoZSBzcGVjaWVzIGxpc3RcbiAgICBzcGVjaWVzRmV0Y2guZG9uZSggZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICBzcGVjaWVzTG9va3VwTGlzdCA9IFtdOyAvLyBubyBpbml0aWFsIHZhciBoZXJlLCB3ZSB3YW50IHRvIHJlZmVyIHRvIHRoZSBvdXRzaWRlIHNjb3BlXG4gICAgICAgIHNwZWNpZXNTY2lOYW1lTGlzdCA9IFtdOyAvLyBubyBpbml0aWFsIHZhciBoZXJlLCB3ZSB3YW50IHRvIHJlZmVyIHRvIHRoZSBvdXRzaWRlIHNjb3BlXG4gICAgICAgICQuZWFjaChkYXRhLCBmdW5jdGlvbihzY2lOYW1lLCBjb21tb25OYW1lcykge1xuICAgICAgICAgICAgc3BlY2llc1NjaU5hbWVMaXN0LnB1c2goc2NpTmFtZSk7XG4gICAgICAgICAgICBpZiAoY29tbW9uTmFtZXMpIHtcbiAgICAgICAgICAgICAgICAkLmVhY2goY29tbW9uTmFtZXMsIGZ1bmN0aW9uKGNuSW5kZXgsIGNuKSB7XG4gICAgICAgICAgICAgICAgICAgIHNwZWNpZXNMb29rdXBMaXN0LnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6IGNuICsgJyAoJyArIHNjaU5hbWUgKyAnKScsXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogc2NpTmFtZVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc3BlY2llc0xvb2t1cExpc3QucHVzaCh7IGxhYmVsOiBzY2lOYW1lLCB2YWx1ZTogc2NpTmFtZSB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgICQoJyNzcGVjaWVzbmFtZScpLmF1dG9jb21wbGV0ZSh7IHNvdXJjZTogc3BlY2llc0xvb2t1cExpc3QgfSk7XG4gICAgfSk7XG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIC8vIGhvb2sgdXAgdGhlIGF1dG8tZW5hYmxlIGFuZCBkaXNhYmxlIHN0dWZmXG4gICAgJCgnI3NwZWNpZXNuYW1lJykub24oJ2F1dG9jb21wbGV0ZWNsb3NlJywgIGZ1bmN0aW9uKGV2ZW50LCB1aSkgeyBlbmFibGVHb0J1dHRvbigpOyB9KTtcbiAgICAkKCcjc3BlY2llc25hbWUnKS5vbigna2V5dXAnLCAgICAgICAgICAgICAgZnVuY3Rpb24oZXZlbnQsIHVpKSB7IGVuYWJsZUdvQnV0dG9uKCk7IH0pO1xuICAgICQoJyNzcGVjaWVzbmFtZScpLm9uKCdjaGFuZ2UnLCAgICAgICAgICAgICBmdW5jdGlvbihldmVudCwgdWkpIHsgZW5hYmxlR29CdXR0b24oKTsgfSk7XG5cbiAgICAkKCdpbnB1dFtuYW1lPXNwcHRpbWVwb2ludF0nKS5jaGFuZ2UoIGZ1bmN0aW9uKCkge1xuICAgICAgICBlbmFibGVGdXR1cmVGaWVsZHMoKTtcbiAgICB9KTtcblxuICAgIC8vIGFsc28gZG8gdGhlIGVuYWJsaW5nIG5vdy4uXG4gICAgZW5hYmxlR29CdXR0b24oKTtcbiAgICBlbmFibGVGdXR1cmVGaWVsZHMoKTtcblxuICAgIC8vIG5lZWQgdG8gYXR0YWNoIHRoZSBmYWRlLWluIGV2ZW50IGhhbmRlciB0byB0aGUgaWZyYW1lJ3MgXCJyZWFkeVwiIGV2ZW50IGp1c3Qgb25jZSwgYW5kIGl0XG4gICAgLy8gd2lsbCB0cmlnZ2VyIGVhY2ggdGltZSB3ZSBzZXQgdGhlIGlmcmFtZSdzIHNyYyBhbmQgdGhlIHBhZ2UgbG9hZHMuXG4gICAgJCgnI21hcGZyYW1lJykubG9hZChmdW5jdGlvbigpIHtcbiAgICAgICAgJCgnI21hcCcpLmFuaW1hdGUoeyBvcGFjaXR5OiAxIH0sIDI1MDApO1xuICAgIH0pO1xuXG5cbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgLy8gaGFuZGxlIHdoZW4gdGhleSBhY3R1YWxseSBjbGljayBvbiB0aGUgc3BlY2llcyBwYW5lbCBidXR0b25cbiAgICAkKCcjc3Bwc2hvd21hcCcpLmNsaWNrKCBmdW5jdGlvbigpIHtcblxuICAgICAgICAvLyBmZXRjaCB0aGUgY3VycmVudCBzcGVjaWVzIG5hbWUgZXRjIGZyb20gdGhlIGZvcm0gZWxlbWVudHMuXG4gICAgICAgIHZhciBzcHBOYW1lID0gJCgnI3NwZWNpZXNuYW1lJykudmFsKCk7XG4gICAgICAgIHZhciB0aW1lUG9pbnQgPSAkKCdpbnB1dFtuYW1lPXNwcHRpbWVwb2ludF06Y2hlY2tlZCcpLnZhbCgpO1xuICAgICAgICB2YXIgc2NlbmFyaW8gPSAkKCdpbnB1dFtuYW1lPXNwcHNjZW5hcmlvXTpjaGVja2VkJykudmFsKCk7XG4gICAgICAgIHZhciBjbGltYXRlTW9kZWwgPSAkKCdpbnB1dFtuYW1lPXNwcGdjbV06Y2hlY2tlZCcpLnZhbCgpO1xuXG4gICAgICAgIHZhciBmdXR1cmVNb2RlbFBvaW50ID0gc2NlbmFyaW8gKyAnXycgKyBjbGltYXRlTW9kZWwgKyAnXycgKyB0aW1lUG9pbnQ7XG4gICAgICAgIGlmICh0aW1lUG9pbnQgPT09ICdiYXNlbGluZScpIHtcbiAgICAgICAgICAgIGZ1dHVyZU1vZGVsUG9pbnQgPSAnMTk5MCc7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgbWFwVXJsID0gJ2h0dHA6Ly8xMzAuMTAyLjE1NS4zMzo4MDgwLycgKyBzcHBOYW1lLnJlcGxhY2UoJyAnLCAnXycpICsgJy9vdXRwdXQvJyArIGZ1dHVyZU1vZGVsUG9pbnQgKyAnLnRpZic7XG4gICAgICAgIG1hcFVybCA9IHdpbmRvdy5jbGltYXNTZXR0aW5ncy52aXpVcmxQcmVmaXggKyBlbmNvZGVVUklDb21wb25lbnQobWFwVXJsKTtcblxuICAgICAgICAkKCcjc3BlY2llc3Nob3dpbmdwYWdlIC5zcGVjaWVzbmFtZScpLmh0bWwoc3BwTmFtZSk7XG4gICAgICAgICQoJyNtYXAnKS5hbmltYXRlKHsgb3BhY2l0eTogMCB9LCAnZmFzdCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgLy8gZmluZCB0aGUgbWFwIGFuZCBhcHBseSBpdFxuICAgICAgICAgICAgJCgnI21hcGZyYW1lJykuYXR0cignc3JjJywgbWFwVXJsKTtcbiAgICAgICAgICAgIC8vIHRoZSBpZnJhbWUncyByZWFkeSBldmVudCB3aWxsIGV2ZW50dWFsbHkgZmlyZSwgYW5kIHRoYXQncyB3aGVuIHdlIGZhZGUgdGhlIG1hcCBiYWNrIGluLlxuICAgICAgICB9KTtcblxuICAgIH0pO1xuXG59KSgpOyJdfQ==
