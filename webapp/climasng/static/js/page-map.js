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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9wdnJkd2IvamN1L2NuZy93ZWJhcHAvbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL3B2cmR3Yi9qY3UvY25nL3dlYmFwcC9jbGltYXNuZy9zcmMvanMvZmFrZV82ZGMyNDA0Ni5qcyIsIi9Vc2Vycy9wdnJkd2IvamN1L2NuZy93ZWJhcHAvY2xpbWFzbmcvc3JjL2pzL21lbnVzYW5kcGFuZWxzLmpzIiwiL1VzZXJzL3B2cmR3Yi9qY3UvY25nL3dlYmFwcC9jbGltYXNuZy9zcmMvanMvc3BlY2llc3BhbmVsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcldBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlxuLy8ganF1ZXJ5IHBsdWdpbiAtIGhvcGVmdWxseSB5b3UgaGF2ZSBqcXVlcnkgbG9hZGVkIGFscmVhZHkgOihcbi8vIFRPRE8gc2hpbSBpbiBqcXVlcnkgcHJvcGVybHlcbnJlcXVpcmUoJy4vbWVudXNhbmRwYW5lbHMnKTtcbi8vIHNwZWNpZXNwYW5lbCB1c2VzIGpxIHRvIGhvb2sgdXAgdGhlIHNwZWNpZXMgcGFuZWwgZm9ybSBlbGVtZW50c1xucmVxdWlyZSgnLi9zcGVjaWVzcGFuZWwnKTtcblxuXG4kKCdoZWFkZXInKS5kaXNhYmxlU2VsZWN0aW9uKCk7IC8vIHVucG9wdWxhciBidXQgc3RpbGwgYmV0dGVyXG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIG1lbnVzLCBzdWJtZW51cywgcGFuZWxzLCBwYWdlcyBoYW5kbGluZ1xuXG4vLyBpZiB0aGUgdXNlciBzaG93cyBhIG1hcCB1c2luZyBvbmUgb2YgdGhlIHR3byBzaG93LWEtbWFwIGZvcm1zLFxuLy8gc3dpdGNoIHRoZSAqb3RoZXIqIHBhbmVsIGJhY2sgdG8gc2hvd2luZyBpdCdzIHNob3ctYS1tYXAgZm9ybVxuLy8gKG90aGVyd2lzZSB5b3UgY2FuIGxvb2sgYXQgYSBtYXAgb2Ygc3BlY2llcyBYLCB0aGVuIHNob3cgYSBtYXAgb2Zcbi8vIGJpb2RpdmVyaXN0eSBZLCBhbmQgc3dpdGNoIGJhY2sgdG8gdGhlIHNwZWNpZXMgcGFuZWwgdG8gc2VlIGEgcGFnZVxuLy8gdGVsbGluZyB5b3UgXCJTaG93aW5nIFNwZWNpZXMgWVwiKS5cbmZ1bmN0aW9uIGNsZWFyT3RoZXJTaG93aW5nUGFnZXMoZXZlbnQsIGluZm8pIHtcbiAgICB2YXIgc3BwU2hvd2luZ1BhZ2UgPSAkKCcubXNwcC1wYWdlLnNwZWNpZXNzaG93aW5nJyk7XG4gICAgdmFyIHNwcFBpY2tpbmdQYWdlID0gJCgnLm1zcHAtcGFnZS5zcGVjaWVzc2VsZWN0Jyk7XG5cbiAgICB2YXIgYmlvZGl2U2hvd2luZ1BhZ2UgPSAkKCcubXNwcC1wYWdlLmJpb2RpdmVyc2l0eXNob3dpbmcnKTtcbiAgICB2YXIgYmlvZGl2UGlja2luZ1BhZ2UgPSAkKCcubXNwcC1wYWdlLmJpb2RpdmVyc2l0eXNlbGVjdCcpO1xuXG4gICAgaWYgKCQoaW5mby5wYWdlKS5pcyhzcHBTaG93aW5nUGFnZSkpIHtcbiAgICAgICAgLy8gbWFrZSBzdXJlIHRoZSBiaW9kaXZlcnNpdHktc2hvd2luZyBwYWdlIGlzbid0IGN1cnJlbnRcbiAgICAgICAgYmlvZGl2U2hvd2luZ1BhZ2UucmVtb3ZlQ2xhc3MoJ2N1cnJlbnQnKS5jc3MoeyBkaXNwbGF5OiAnbm9uZScgfSk7XG4gICAgICAgIGJpb2RpdlBpY2tpbmdQYWdlLmFkZENsYXNzKCdjdXJyZW50Jyk7XG4gICAgfSBlbHNlIGlmICgkKGluZm8ucGFnZSkuaXMoYmlvZGl2U2hvd2luZ1BhZ2UpKSB7XG4gICAgICAgIC8vIG1ha2Ugc3VyZSB0aGUgc3BlY2llcy1zaG93aW5nIHBhZ2UgaXNuJ3QgY3VycmVudFxuICAgICAgICBzcHBTaG93aW5nUGFnZS5yZW1vdmVDbGFzcygnY3VycmVudCcpLmNzcyh7IGRpc3BsYXk6ICdub25lJyB9KTtcbiAgICAgICAgc3BwUGlja2luZ1BhZ2UuYWRkQ2xhc3MoJ2N1cnJlbnQnKTtcbiAgICB9XG59XG5cbi8vIHR1cm4gb24gdGhlIG1zcHAgcGx1Z2luIGZvciBvdXIgbmF2IG1lbnVcbiQoJ25hdiA+IHVsJykubXNwcCh7XG4gICAgLy8gcHJvdmlkZSBhIGNhbGxiYWNrIGZvciB3aGVuIGEgcGFnZSBpcyBzaG93bi5cbiAgICBzaG93cGFnZTogY2xlYXJPdGhlclNob3dpbmdQYWdlc1xufSk7XG4iLCJcbi8vIGpRdWVyeSBwbHVnaW5cbi8vIGF1dGhvcjogRGFuaWVsIEJhaXJkIDxkYW5pZWxAZGFuaWVsYmFpcmQuY29tPlxuLy8gdmVyc2lvbjogMC4xLjIwMTQwMjA1XG5cbi8vXG4vLyBUaGlzIG1hbmFnZXMgbWVudXMsIHN1Ym1lbnVzLCBwYW5lbHMsIGFuZCBwYWdlcy5cbi8vIExpa2UgdGhpczpcbi8vIC0tLS4tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS4tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS4tLS1cbi8vICAgIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgICAgICAgICAgICAgICAgICAgICAgfCAgICAgICAgICAgICAgICAgICAgICAgIHxcbi8vICAgIHwgIFNlbGVjdGVkIE1haW4gTWVudSBJdGVtICAgLi0tLS0tLS0tLS0tLiAuLS0tLS0tLS0tLiAgIHwgIEFsdCBNYWluIE1lbnUgSXRlbSAgfCAgVGhpcmQgTWFpbiBNZW51IEl0ZW0gIHxcbi8vICAgIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAvICBTdWJpdGVtIDEgIFxcIFN1Yml0ZW0gMiBcXCAgfCAgICAgICAgICAgICAgICAgICAgICB8ICAgICAgICAgICAgICAgICAgICAgICAgfFxuLy8gLS0tJy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tJyAgICAgICAgICAgICAgICctLS0tLS0tLS0tLS0tJy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0nLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tJy0tLVxuLy8gICAgICAgfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4vLyAgICAgICB8ICAgUGFuZWwgZm9yIFN1Yml0ZW0gMSwgdGhpcyBpcyBQYWdlIDEgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbi8vICAgICAgIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuLy8gICAgICAgfCAgIEVhY2ggUGFuZWwgY2FuIGhhdmUgbXVsdGlwbGUgcGFnZXMsIG9uZSBwYWdlIHNob3dpbmcgYXQgYSB0aW1lLiAgQnV0dG9ucyBvbiBwYWdlcyBzd2l0Y2ggICAgICB8XG4vLyAgICAgICB8ICAgYmV0d2VlbiBwYWdlcy4gIFBhbmVsIGhlaWdodCBhZGp1c3RzIHRvIHRoZSBoZWlnaHQgb2YgdGhlIHBhZ2UuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbi8vICAgICAgIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuLy8gICAgICAgfCAgIFsgc2VlIHBhZ2UgMiBdICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4vLyAgICAgICB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbi8vICAgICAgICctLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tJ1xuLy9cbi8vIC0gbWVudXMgYXJlIGFsd2F5cyA8dWw+IHRhZ3M7IGVhY2ggPGxpPiBpcyBhIG1lbnUgaXRlbVxuLy8gLSBhIG1haW4gbWVudSA8bGk+IG11c3QgY29udGFpbiBhbiA8YT4gdGFnIGFuZCBtYXkgYWxzbyBjb250YWluIGEgPHVsPiBzdWJtZW51XG4vLyAtIGEgc3VibWVudSA8bGk+IG11c3QgY29udGFpbiBhbiA8YT4gdGFnIHdpdGggYSBkYXRhLXRhcmdldHBhbmVsIGF0dHJpYnV0ZSBzZXRcbi8vIC0gVGhlcmUgaXMgYWx3YXlzIGEgc2luZ2xlIHNlbGVjdGVkIG1haW4gbWVudSBpdGVtXG4vLyAtIEEgbWFpbiBtZW51IGl0ZW0gbWF5IGVpdGhlciBsaW5rIHRvIGFub3RoZXIgd2VicGFnZSwgb3IgaGF2ZSBhIHN1Ym1lbnVcbi8vIC0gU2VsZWN0aW5nIGEgbWFpbiBtZW51IGl0ZW0gd2lsbCBzaG93IGl0cyBzdWJtZW51LCBpZiBpdCBoYXMgb25lXG4vLyAtIEEgc3VibWVudSBhbHdheXMgaGFzIGEgc2luZ2xlIGl0ZW0gc2VsZWN0ZWRcbi8vIC0gQ2xpY2tpbmcgYW4gaW5hY3RpdmUgc3VibWVudSBpdGVtIHdpbGwgc2hvdyBpdHMgcGFuZWxcbi8vIC0gQ2xpY2tpbmcgYSBzZWxlY3RlZCBzdWJtZW51IGl0ZW0gd2lsbCB0b2dnbGUgaXRzIHBhbmVsIHNob3dpbmcgPC0+IGhpZGluZyAoKCggTkI6IG5vdCB5ZXQgaW1wbGVtZW50ZWQgKSkpXG4vLyAtIEEgcGFuZWwgaW5pdGlhbGx5IHNob3dzIGl0cyBmaXJzdCBwYWdlXG4vLyAtIFN3aXRjaGluZyBwYWdlcyBpbiBhIHBhbmVsIGNoYW5nZXMgdGhlIHBhbmVsIGhlaWdodCB0byBzdWl0IGl0cyBjdXJyZW50IHBhZ2Vcbi8vIC0gQSBwYW5lbCBpcyBhIEhUTUwgYmxvY2sgZWxlbWVudCB3aXRoIHRoZSBjbGFzcyAubXNwcC1wYW5lbCAoY2FuIGJlIG92ZXJyaWRkZW4gdmlhIG9wdGlvbilcbi8vIC0gSWYgYSBwYW5lbCBjb250YWlucyBwYWdlcywgb25lIHBhZ2Ugc2hvdWxkIGhhdmUgdGhlIGNsYXNzIC5jdXJyZW50IChjYW4gYmUgb3ZlcnJpZGRlbiB2aWEgb3B0aW9uKVxuLy8gLSBBIHBhZ2UgaXMgYSBIVE1MIGJsb2NrIGVsZW1lbnQgd2l0aCB0aGUgY2xhc3MgLm1zcHAtcGFnZSAoY2FuIGJlIG92ZXJyaWRkZW4gdmlhIG9wdGlvbilcbi8vIC0gPGJ1dHRvbj4gb3IgPGE+IHRhZ3MgaW4gcGFnZXMgdGhhdCBoYXZlIGEgZGF0YS10YXJnZXRwYWdlIGF0dHJpYnV0ZSBzZXQgd2lsbCBzd2l0Y2ggdG8gdGhlIGluZGljYXRlZCBwYWdlXG4vL1xuLy9cbi8vIFRoZSBIVE1MIHNob3VsZCBsb29rIGxpa2UgdGhpczpcbi8vXG4vLyAgPHVsIGNsYXNzPVwibWVudVwiPiAgICAgICAgICAgICAgICAgICA8IS0tIHRoaXMgaXMgdGhlIG1haW4gbWVudSAtLT5cbi8vICAgICAgPGxpIGNsYXNzPVwiY3VycmVudFwiPiAgICAgICAgICAgIDwhLS0gdGhpcyBpcyBhIG1haW4gbWVudSBpdGVtLCBjdXJyZW50bHkgc2VsZWN0ZWQgLS0+XG4vLyAgICAgICAgICA8YT5GaXJzdCBJdGVtPC9hPiAgICAgICAgICAgPCEtLSB0aGUgZmlyc3QgaXRlbSBpbiB0aGUgbWFpbiBtZW51IC0tPlxuLy8gICAgICAgICAgPHVsPiAgICAgICAgICAgICAgICAgICAgICAgIDwhLS0gYSBzdWJtZW51IGluIHRoZSBmaXJzdCBtYWluIG1lbnUgaXRlbSAtLT5cbi8vICAgICAgICAgICAgICA8bGkgY2xhc3M9XCJjdXJyZW50XCI+ICAgIDwhLS0gdGhlIGN1cnJlbnRseSBzZWxlY3RlZCBzdWJtZW51IGl0ZW0gLS0+XG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPCEtLSAucGFuZWx0cmlnZ2VyIGFuZCB0aGUgZGF0YS1wYW5lbGlkIGF0dHJpYnV0ZSBhcmUgcmVxdWlyZWQgLS0+XG4vLyAgICAgICAgICAgICAgICAgIDxhIGRhdGEtdGFyZ2V0cGFuZWw9XCJwYW5lbDFcIj5kbyB0aGUgcGFuZWwxIHRoaW5nPC9hPlxuLy8gICAgICAgICAgICAgIDwvbGk+XG4vLyAgICAgICAgICAgICAgPGxpPi4uLjwvbGk+ICAgICAgICAgICAgPCEtLSBhbm90aGVyIHN1Ym1lbnUgaXRlbSAtLT5cbi8vICAgICAgICAgIDwvdWw+XG4vLyAgICAgIDwvbGk+XG4vLyAgICAgIDxsaT4gPGEgaHJlZj1cImFub3RoZXJfcGFnZS5odG1sXCI+YW5vdGhlciBwYWdlPC9hPiA8L2xpPlxuLy8gICAgICA8bGk+IDxhPndoYXRldmVyPC9hPiA8L2xpPlxuLy8gIDwvdWw+XG4vL1xuLy8gIDxkaXYgaWQ9XCJwYW5lbDFcIiBjbGFzcz1cIm1zcHAtcGFuZWxcIj5cbi8vICAgICAgPGRpdiBpZD1cInBhZ2UxMVwiIGNsYXNzPVwibXNwcC1wYWdlIGN1cnJlbnRcIj5cbi8vICAgICAgICAgIFRoaXMgaXMgdGhlIGN1cnJlbnQgcGFnZSBvbiBwYW5lbCAxLlxuLy8gICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgZGF0YS10YXJnZXRwYWdlPVwicGFnZTEyXCI+c2hvdyBwYWdlIDI8L2J1dHRvbj5cbi8vICAgICAgPC9kaXY+XG4vLyAgICAgIDxkaXYgaWQ9XCJwYWdlMTJcIiBjbGFzcz1cIm1zcHAtcGFnZVwiPlxuLy8gICAgICAgICAgVGhpcyBpcyB0aGUgb3RoZXIgcGFnZSBvbiBwYW5lbCAxLlxuLy8gICAgICAgICAgPGEgZGF0YS10YXJnZXRwYWdlPVwicGFnZTExXCI+c2VlIHRoZSBmaXJzdCBwYWdlIGFnYWluPC9hPlxuLy8gICAgICA8L2Rpdj5cbi8vICA8L2Rpdj5cbi8vICA8ZGl2IGlkPVwicGFuZWwyXCIgY2xhc3M9XCJtc3BwLXBhbmVsXCI+XG4vLyAgICAgIDxkaXYgaWQ9XCJwYWdlMjFcIiBjbGFzcz1cIm1zcHAtcGFnZSBjdXJyZW50XCI+XG4vLyAgICAgICAgICBUaGlzIGlzIHRoZSBjdXJyZW50IHBhZ2Ugb24gcGFuZWwgMi5cbi8vICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGRhdGEtdGFyZ2V0cGFnZT1cInBhZ2UyMlwiPnNob3cgcGFnZSAyPC9idXR0b24+XG4vLyAgICAgIDwvZGl2PlxuLy8gICAgICA8ZGl2IGlkPVwicGFnZTIyXCIgY2xhc3M9XCJtc3BwLXBhZ2VcIj5cbi8vICAgICAgICAgIFRoaXMgaXMgdGhlIG90aGVyIHBhZ2Ugb24gcGFuZWwgMi5cbi8vICAgICAgICAgIDxhIGRhdGEtdGFyZ2V0cGFnZT1cInBhZ2UyMVwiPnNlZSB0aGUgZmlyc3QgcGFnZSBhZ2FpbjwvYT5cbi8vICAgICAgPC9kaXY+XG4vLyAgPC9kaXY+XG5cblxuOyggZnVuY3Rpb24oJCwgd2luZG93LCBkb2N1bWVudCwgdW5kZWZpbmVkKSB7XG5cbiAgICAvLyBuYW1lc3BhY2UgY2xpbWFzLCB3aWRnZXQgbmFtZSBtc3BwXG4gICAgLy8gc2Vjb25kIGFyZyBpcyB1c2VkIGFzIHRoZSB3aWRnZXQncyBcInByb3RvdHlwZVwiIG9iamVjdFxuICAgICQud2lkZ2V0KCBcImNsaW1hcy5tc3BwXCIgLCB7XG5cbiAgICAgICAgLy9PcHRpb25zIHRvIGJlIHVzZWQgYXMgZGVmYXVsdHNcbiAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgICAgYW5pbWF0aW9uRmFjdG9yOiAyLFxuXG4gICAgICAgICAgICBtYWluTWVudUNsYXNzOiAnbXNwcC1tYWluLW1lbnUnLFxuXG4gICAgICAgICAgICBwYW5lbENsYXNzOiAnbXNwcC1wYW5lbCcsXG4gICAgICAgICAgICBwYWdlQ2xhc3M6ICdtc3BwLXBhZ2UnLFxuXG4gICAgICAgICAgICBjbGVhcmZpeENsYXNzOiAnbXNwcC1jbGVhcmZpeCcsXG4gICAgICAgICAgICBhY3RpdmVDbGFzczogJ2N1cnJlbnQnXG4gICAgICAgIH0sXG4gICAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgICAgLy9TZXR1cCB3aWRnZXQgKGVnLiBlbGVtZW50IGNyZWF0aW9uLCBhcHBseSB0aGVtaW5nXG4gICAgICAgIC8vICwgYmluZCBldmVudHMgZXRjLilcbiAgICAgICAgX2NyZWF0ZTogZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgIHZhciBiYXNlID0gdGhpcztcbiAgICAgICAgICAgIHZhciBvcHRzID0gdGhpcy5vcHRpb25zO1xuXG4gICAgICAgICAgICAvLyBwb3B1bGF0ZSBzb21lIGNvbnZlbmllbmNlIHZhcmlhYmxlc1xuICAgICAgICAgICAgdmFyICRtZW51ID0gdGhpcy5lbGVtZW50O1xuICAgICAgICAgICAgdGhpcy5tYWluTWVudUl0ZW1zID0gJG1lbnUuY2hpbGRyZW4oJ2xpJyk7XG4gICAgICAgICAgICB0aGlzLnBhbmVscyA9ICQoJy4nICsgb3B0cy5wYW5lbENsYXNzKTtcblxuICAgICAgICAgICAgLy8gZGlzYXBwZWFyIHdoaWxlIHdlIHNvcnQgdGhpbmdzIG91dFxuICAgICAgICAgICAgJG1lbnUuY3NzKHsgb3BhY2l0eTogMCB9KTtcbiAgICAgICAgICAgIHRoaXMucGFuZWxzLmNzcyh7IG9wYWNpdHk6IDAgfSk7XG5cbiAgICAgICAgICAgIC8vIG1ha2Ugc29tZSBET00gbW9kc1xuICAgICAgICAgICAgJG1lbnUuYWRkQ2xhc3Mob3B0cy5tYWluTWVudUNsYXNzKTtcbiAgICAgICAgICAgICRtZW51LmFkZENsYXNzKG9wdHMuY2xlYXJmaXhDbGFzcyk7XG4gICAgICAgICAgICB0aGlzLnBhbmVscy5hZGRDbGFzcyhvcHRzLmNsZWFyZml4Q2xhc3MpO1xuXG4gICAgICAgICAgICAvLyBsYXlvdXQgdGhlIG1lbnVcbiAgICAgICAgICAgIHRoaXMuX2xheW91dE1lbnUoKTtcblxuICAgICAgICAgICAgLy8gbGF5b3V0IHRoZSBwYW5lbHNcbiAgICAgICAgICAgIHRoaXMuX2xheW91dFBhbmVscygpO1xuXG4gICAgICAgICAgICAvLyBob29rIHVwIGNsaWNrIGhhbmRsaW5nIGV0Y1xuICAgICAgICAgICAgJG1lbnUub24oJ21zcHBzaG93bWVudScsIHRoaXMuX3Nob3dNZW51KTtcbiAgICAgICAgICAgICRtZW51Lm9uKCdtc3Bwc2hvd3N1Ym1lbnUnLCB0aGlzLl9zaG93U3ViTWVudSk7XG4gICAgICAgICAgICAkbWVudS5vbignbXNwcHNob3dwYW5lbCcsIHRoaXMuX3Nob3dQYW5lbCk7XG4gICAgICAgICAgICAkbWVudS5vbignbXNwcHNob3dwYWdlJywgdGhpcy5fc2hvd1BhZ2UpO1xuXG4gICAgICAgICAgICAvLyBhdHRhY2ggaGFuZGxlcnMgdG8gdGhlIG1lbnUtdHJpZ2dlcnNcbiAgICAgICAgICAgIHRoaXMubWFpbk1lbnVJdGVtcy5lYWNoKCBmdW5jdGlvbihpbmRleCwgaXRlbSkge1xuICAgICAgICAgICAgICAgIC8vIHRoZSBsaSBtZW51IGl0ZW0gaGFzIGEgY2hpbGQgYSB0aGF0IGlzIGl0J3MgdHJpZ2dlclxuICAgICAgICAgICAgICAgICQoaXRlbSkuY2hpbGRyZW4oJ2EnKS5jbGljayggZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgYmFzZS5fdHJpZ2dlcignc2hvd21lbnUnLCBldmVudCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgbWVudWl0ZW06IGl0ZW0sXG4gICAgICAgICAgICAgICAgICAgICAgICB3aWRnZXQ6IGJhc2VcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgLy8gYXR0YWNoIGhhbmRsZXJzIHRvIHRoZSBzdWJtZW51IGl0ZW1zXG4gICAgICAgICAgICAgICAgJChpdGVtKS5maW5kKCdsaScpLmVhY2goIGZ1bmN0aW9uKGluZGV4LCBzdWJNZW51SXRlbSkge1xuICAgICAgICAgICAgICAgICAgICAkKHN1Yk1lbnVJdGVtKS5maW5kKCdhJykuY2xpY2soIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBiYXNlLl90cmlnZ2VyKCdzaG93c3VibWVudScsIGV2ZW50LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVudWl0ZW06IGl0ZW0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3VibWVudWl0ZW06IHN1Yk1lbnVJdGVtLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpZGdldDogYmFzZVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIGF0dGFjaCBoYW5kbGVycyB0byB0aGUgcGFuZWwgdHJpZ2dlcnNcbiAgICAgICAgICAgICRtZW51LmZpbmQoJ1tkYXRhLXRhcmdldHBhbmVsXScpLmVhY2goIGZ1bmN0aW9uKGluZGV4LCB0cmlnZ2VyKSB7XG4gICAgICAgICAgICAgICAgdmFyICR0cmlnZ2VyID0kKHRyaWdnZXIpO1xuICAgICAgICAgICAgICAgICR0cmlnZ2VyLmNsaWNrKCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgICAgICAgICBiYXNlLl90cmlnZ2VyKCdzaG93cGFuZWwnLCBldmVudCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgcGFuZWw6ICQoJyMnICsgJHRyaWdnZXIuZGF0YSgndGFyZ2V0cGFuZWwnKSkuZmlyc3QoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpZGdldDogYmFzZVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBhdHRhY2ggaGFuZGxlcnMgdG8gdGhlIHBhZ2Ugc3dpdGNoZXJzXG4gICAgICAgICAgICB0aGlzLnBhbmVscy5lYWNoKCBmdW5jdGlvbihpbmRleCwgcGFuZWwpIHtcbiAgICAgICAgICAgICAgICB2YXIgJHBhbmVsID0gJChwYW5lbCk7XG4gICAgICAgICAgICAgICAgJHBhbmVsLmZpbmQoJ1tkYXRhLXRhcmdldHBhZ2VdJykuY2xpY2soIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIGJhc2UuX3RyaWdnZXIoJ3Nob3dwYWdlJywgZXZlbnQsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhbmVsOiAkcGFuZWwsXG4gICAgICAgICAgICAgICAgICAgICAgICBwYWdlOiAkKCcjJyArICQodGhpcykuZGF0YSgndGFyZ2V0cGFnZScpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpZGdldDogYmFzZVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBhY3RpdmF0ZSB0aGUgY3VycmVudCBtZW51cywgcGFuZWxzIGV0Y1xuICAgICAgICAgICAgdmFyICRjdXJyZW50TWFpbiA9IHRoaXMubWFpbk1lbnVJdGVtcy5maWx0ZXIoJy4nICsgb3B0cy5hY3RpdmVDbGFzcyk7XG4gICAgICAgICAgICAkY3VycmVudE1haW4ucmVtb3ZlQ2xhc3Mob3B0cy5hY3RpdmVDbGFzcykuY2hpbGRyZW4oJ2EnKS5jbGljaygpO1xuXG4gICAgICAgICAgICAvLyBmaW5hbGx5LCBmYWRlIGJhY2sgaW5cbiAgICAgICAgICAgICRtZW51LmFuaW1hdGUoeyBvcGFjaXR5OiAxIH0sICdmYXN0Jyk7XG5cbiAgICAgICAgICAgIC8vIHBhbmVscyBzdGF5IGludmlzaWJsZVxuICAgICAgICB9LFxuICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgIF9zd2l0Y2hDbGFzc09wdGlvbjogZnVuY3Rpb24oY2xhc3NOYW1lLCBuZXdDbGFzcykge1xuICAgICAgICAgICAgdmFyIG9sZENsYXNzID0gdGhpcy5vcHRpb25zW2NsYXNzTmFtZV07XG4gICAgICAgICAgICBpZiAob2xkQ2xhc3MgIT09IG5ld0NsYXNzKSB7XG4gICAgICAgICAgICAgICAgdmFyIGdyb3VwID0gdGhpcy5lbGVtZW50LmZpbmQoJy4nICsgb2xkQ2xhc3MpO1xuICAgICAgICAgICAgICAgIHRoaXMub3B0aW9uc1tjbGFzc05hbWVdID0gbmV3Q2xhc3M7XG4gICAgICAgICAgICAgICAgZ3JvdXAucmVtb3ZlQ2xhc3Mob2xkQ2xhc3MpO1xuICAgICAgICAgICAgICAgIGdyb3VwLmFkZENsYXNzKG5ld0NsYXNzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICAvLyBSZXNwb25kIHRvIGFueSBjaGFuZ2VzIHRoZSB1c2VyIG1ha2VzIHRvIHRoZVxuICAgICAgICAvLyBvcHRpb24gbWV0aG9kXG4gICAgICAgIF9zZXRPcHRpb246IGZ1bmN0aW9uKGtleSwgdmFsdWUpIHtcbiAgICAgICAgICAgIHN3aXRjaCAoa2V5KSB7XG4gICAgICAgICAgICAgICAgY2FzZSBcIm1haW5NZW51Q2xhc3NcIjpcbiAgICAgICAgICAgICAgICBjYXNlIFwiY2xlYXJmaXhDbGFzc1wiOlxuICAgICAgICAgICAgICAgIGNhc2UgXCJhY3RpdmVDbGFzc1wiOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9zd2l0Y2hDbGFzc09wdGlvbihrZXksIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnNba2V5XSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAvLyBpdCdzIG9rYXkgdGhhdCB0aGVyZSdzIG5vIH0gaGVyZVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gcmVtZW1iZXIgdG8gY2FsbCBvdXIgc3VwZXIncyBfc2V0T3B0aW9uIG1ldGhvZFxuICAgICAgICAgICAgdGhpcy5fc3VwZXIoIFwiX3NldE9wdGlvblwiLCBrZXksIHZhbHVlICk7XG4gICAgICAgIH0sXG4gICAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgICAgLy8gRGVzdHJveSBhbiBpbnN0YW50aWF0ZWQgcGx1Z2luIGFuZCBjbGVhbiB1cFxuICAgICAgICAvLyBtb2RpZmljYXRpb25zIHRoZSB3aWRnZXQgaGFzIG1hZGUgdG8gdGhlIERPTVxuICAgICAgICBfZGVzdHJveTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQucmVtb3ZlQ2xhc3ModGhpcy5vcHRpb25zLm1haW5NZW51Q2xhc3MpO1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50LnJlbW92ZUNsYXNzKHRoaXMub3B0aW9ucy5jbGVhcmZpeENsYXNzKTtcbiAgICAgICAgICAgIHRoaXMucGFuZWxzLnJlbW92ZUNsYXNzKHRoaXMub3B0aW9ucy5jbGVhcmZpeENsYXNzKTtcbiAgICAgICAgfSxcbiAgICAgICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICAvLyBkbyB0aGUgbGF5b3V0IGNhbGN1bGF0aW9uc1xuICAgICAgICBfbGF5b3V0TWVudTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAvLyBnbyB0aHJvdWdoIGVhY2ggc3VibWVudSBhbmQgcmVjb3JkIGl0cyB3aWR0aFxuICAgICAgICAgICAgdGhpcy5lbGVtZW50LmZpbmQoJ3VsJykuZWFjaCggZnVuY3Rpb24oaW5kZXgsIHN1Yk1lbnUpIHtcbiAgICAgICAgICAgICAgICB2YXIgJHNtID0gJChzdWJNZW51KTtcbiAgICAgICAgICAgICAgICAkc20uY3NzKHt3aWR0aDogJ2F1dG8nfSk7XG4gICAgICAgICAgICAgICAgJHNtLmRhdGEoJ29yaWdpbmFsV2lkdGgnLCAkc20ud2lkdGgoKSk7XG5cbiAgICAgICAgICAgICAgICAvLyBsZWF2ZSBlYWNoIHN1Ym1lbnUgaGlkZGVuLCB3aXRoIHdpZHRoIDBcbiAgICAgICAgICAgICAgICAkc20uY3NzKHsgd2lkdGg6IDAsIGRpc3BsYXk6ICdub25lJyB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgIF9zaG93TWVudTogZnVuY3Rpb24oZXZlbnQsIGRhdGEpIHtcbiAgICAgICAgICAgIHZhciAkaXRlbSA9ICQoZGF0YS5tZW51aXRlbSk7XG4gICAgICAgICAgICB2YXIgYmFzZSA9IGRhdGEud2lkZ2V0O1xuICAgICAgICAgICAgLy8gJGl0ZW0gaXMgYSBjbGlja2VkLW9uIG1lbnUgaXRlbS4uXG4gICAgICAgICAgICBpZiAoJGl0ZW0uaGFzQ2xhc3MoYmFzZS5vcHRpb25zLmFjdGl2ZUNsYXNzKSkge1xuICAgICAgICAgICAgICAgIC8vID8/XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGJhc2UuX2hpZGVQYW5lbHMoKTtcbiAgICAgICAgICAgICAgICBiYXNlLm1haW5NZW51SXRlbXMucmVtb3ZlQ2xhc3MoYmFzZS5vcHRpb25zLmFjdGl2ZUNsYXNzKTtcbiAgICAgICAgICAgICAgICB2YXIgJG5ld1N1Yk1lbnUgPSAkaXRlbS5maW5kKCd1bCcpO1xuICAgICAgICAgICAgICAgIHZhciAkb2xkU3ViTWVudXMgPSBiYXNlLmVsZW1lbnQuZmluZCgndWwnKS5ub3QoJG5ld1N1Yk1lbnUpO1xuICAgICAgICAgICAgICAgIHZhciBuZXdXaWR0aCA9ICRuZXdTdWJNZW51LmRhdGEoJ29yaWdpbmFsV2lkdGgnKTtcblxuICAgICAgICAgICAgICAgICRvbGRTdWJNZW51cy5hbmltYXRlKHsgd2lkdGg6IDAgfSwgKDUwICogYmFzZS5vcHRpb25zLmFuaW1hdGlvbkZhY3RvciksIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAkb2xkU3ViTWVudXMuY3NzKHsgZGlzcGxheTogJ25vbmUnIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICRpdGVtLmFkZENsYXNzKGJhc2Uub3B0aW9ucy5hY3RpdmVDbGFzcyk7XG4gICAgICAgICAgICAgICAgJG5ld1N1Yk1lbnVcbiAgICAgICAgICAgICAgICAgICAgLmNzcyh7ZGlzcGxheTogJ2Jsb2NrJyB9KVxuICAgICAgICAgICAgICAgICAgICAuYW5pbWF0ZSh7IHdpZHRoOiBuZXdXaWR0aCB9LCAoMTI1ICogYmFzZS5vcHRpb25zLmFuaW1hdGlvbkZhY3RvciksIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgJG5ld1N1Yk1lbnUuY3NzKHsgd2lkdGg6ICdhdXRvJyB9KS5yZW1vdmVBdHRyKCdzdHlsZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYmFzZS5fdHJpZ2dlcignbWVudXNob3duJywgZXZlbnQsIHsgaXRlbTogJGl0ZW0sIHdpZGdldDogYmFzZSB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICA7XG4gICAgICAgICAgICAgICAgLy8gaWYgdGhlIG5ldyBzdWJtZW51IGhhcyBhbiBhY3RpdmUgaXRlbSwgY2xpY2sgaXRcbiAgICAgICAgICAgICAgICAkbmV3U3ViTWVudS5maW5kKCcuJyArIGJhc2Uub3B0aW9ucy5hY3RpdmVDbGFzcyArICcgYScpLmNsaWNrKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgICAgX3Nob3dTdWJNZW51OiBmdW5jdGlvbihldmVudCwgZGF0YSkge1xuICAgICAgICAgICAgLy8gZGUtYWN0aXZlaWZ5IGFsbCB0aGUgc3VibWVudSBpdGVtc1xuICAgICAgICAgICAgJChkYXRhLm1lbnVpdGVtKS5maW5kKCdsaScpLnJlbW92ZUNsYXNzKGRhdGEud2lkZ2V0Lm9wdGlvbnMuYWN0aXZlQ2xhc3MpO1xuICAgICAgICAgICAgLy8gYWN0aXZlLWlmeSB0aGUgb25lIHRydWUgc3VibWVudSBpdGVtXG4gICAgICAgICAgICAkKGRhdGEuc3VibWVudWl0ZW0pLmFkZENsYXNzKGRhdGEud2lkZ2V0Lm9wdGlvbnMuYWN0aXZlQ2xhc3MpO1xuICAgICAgICB9LFxuICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgIC8vIGRvIHRoZSBsYXlvdXQgY2FsY3VsYXRpb25zXG4gICAgICAgIF9sYXlvdXRQYW5lbHM6IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICB2YXIgJHBhZ2VzID0gdGhpcy5wYW5lbHMuZmluZCgnLicgKyB0aGlzLm9wdGlvbnMucGFnZUNsYXNzKTtcblxuICAgICAgICAgICAgLy8gZ28gdGhyb3VnaCBlYWNoIHBhZ2UgYW5kIHJlY29yZCBpdHMgaGVpZ2h0XG4gICAgICAgICAgICAkcGFnZXMuZWFjaCggZnVuY3Rpb24oaW5kZXgsIHBhZ2UpIHtcbiAgICAgICAgICAgICAgICB2YXIgJHBhZ2UgPSAkKHBhZ2UpO1xuICAgICAgICAgICAgICAgICRwYWdlLmNzcyh7aGVpZ2h0OiAnYXV0byd9KTtcbiAgICAgICAgICAgICAgICAkcGFnZS5kYXRhKCdvcmlnaW5hbEhlaWdodCcsICRwYWdlLm91dGVySGVpZ2h0KCkpO1xuXG4gICAgICAgICAgICAgICAgLy8gbGVhdmUgZWFjaCBwYWdlIGhpZGRlbiwgd2l0aCBoZWlnaHQgMFxuICAgICAgICAgICAgICAgICRwYWdlLmNzcyh7IGhlaWdodDogMCwgZGlzcGxheTogJ25vbmUnIH0pO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIGdvIHRocm91Z2ggZWFjaCBwYW5lbCBhbmQgaGlkZSBpdFxuICAgICAgICAgICAgdGhpcy5wYW5lbHMuZWFjaCggZnVuY3Rpb24oaW5kZXgsIHBhbmVsKSB7XG4gICAgICAgICAgICAgICAgdmFyICRwYW5lbCA9ICQocGFuZWwpO1xuICAgICAgICAgICAgICAgICRwYW5lbC5jc3MoeyBkaXNwbGF5OiAnbm9uZScgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICBfaGlkZVBhbmVsczogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLnBhbmVscy5yZW1vdmVDbGFzcyh0aGlzLm9wdGlvbnMuYWN0aXZlQ2xhc3MpLmNzcyh7IGRpc3BsYXk6ICdub25lJywgaGVpZ2h0OiAwIH0pO1xuICAgICAgICB9LFxuICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgIF9zaG93UGFuZWw6IGZ1bmN0aW9uKGV2ZW50LCBkYXRhKSB7XG4gICAgICAgICAgICB2YXIgJHBhbmVsID0gJChkYXRhLnBhbmVsKTtcbiAgICAgICAgICAgIHZhciBiYXNlID0gZGF0YS53aWRnZXQ7XG4gICAgICAgICAgICAvLyAkcGFuZWwgaXMgYSBwYW5lbCB0byBzaG93Li5cbiAgICAgICAgICAgIGlmICgkcGFuZWwuaGFzQ2xhc3MoYmFzZS5vcHRpb25zLmFjdGl2ZUNsYXNzKSkge1xuICAgICAgICAgICAgICAgIC8vID8/XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGJhc2UuX2hpZGVQYW5lbHMoKTtcbiAgICAgICAgICAgICAgICAkcGFuZWwuYWRkQ2xhc3MoYmFzZS5vcHRpb25zLmFjdGl2ZUNsYXNzKTtcbiAgICAgICAgICAgICAgICAkcGFuZWwuY3NzKHsgZGlzcGxheTogJ2Jsb2NrJywgb3BhY2l0eTogMSB9KTtcbiAgICAgICAgICAgICAgICB2YXIgJHBhZ2UgPSAkKCRwYW5lbC5maW5kKCcuJyArIGJhc2Uub3B0aW9ucy5wYWdlQ2xhc3MgKyAnLicgKyBiYXNlLm9wdGlvbnMuYWN0aXZlQ2xhc3MpKTtcbiAgICAgICAgICAgICAgICBiYXNlLl90cmlnZ2VyKCdzaG93cGFnZScsIGV2ZW50LCB7IHBhbmVsOiAkcGFuZWwsIHBhZ2U6ICRwYWdlLCB3aWRnZXQ6IGJhc2UgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgICAgX3Nob3dQYWdlOiBmdW5jdGlvbihldmVudCwgZGF0YSkge1xuICAgICAgICAgICAgdmFyIGJhc2UgPSBkYXRhLndpZGdldDtcbiAgICAgICAgICAgIHZhciAkcGFuZWwgPSAkKGRhdGEucGFuZWwpO1xuICAgICAgICAgICAgdmFyICRwYWdlID0gJChkYXRhLnBhZ2UpO1xuICAgICAgICAgICAgdmFyIG5ld0hlaWdodCA9ICRwYWdlLmRhdGEoJ29yaWdpbmFsSGVpZ2h0Jyk7XG5cbiAgICAgICAgICAgIC8vIGZpeCB0aGUgcGFuZWwncyBjdXJyZW50IGhlaWdodFxuICAgICAgICAgICAgJHBhbmVsLmNzcyh7aGVpZ2h0OiAkcGFuZWwuaGVpZ2h0KCkgfSk7XG5cbiAgICAgICAgICAgIC8vIGRlYWwgd2l0aCB0aGUgcGFnZSBjdXJyZW50bHkgYmVpbmcgZGlzcGxheWVkXG4gICAgICAgICAgICB2YXIgJG9sZFBhZ2UgPSAkcGFuZWwuZmluZCgnLicgKyBiYXNlLm9wdGlvbnMucGFnZUNsYXNzICsgJy4nICsgYmFzZS5vcHRpb25zLmFjdGl2ZUNsYXNzKS5ub3QoJHBhZ2UpO1xuICAgICAgICAgICAgaWYgKCRvbGRQYWdlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAkb2xkUGFnZS5kYXRhKCdvcmlnaW5hbEhlaWdodCcsICRvbGRQYWdlLm91dGVySGVpZ2h0KCkpO1xuICAgICAgICAgICAgICAgICRvbGRQYWdlLnJlbW92ZUNsYXNzKGJhc2Uub3B0aW9ucy5hY3RpdmVDbGFzcykuZmFkZU91dCgoNTAgKiBiYXNlLm9wdGlvbnMuYW5pbWF0aW9uRmFjdG9yKSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICRvbGRQYWdlLmNzcyh7IGhlaWdodDogMCB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gc3dpdGNoIG9uIHRoZSBuZXcgcGFnZSBhbmQgZ3JvdyB0aGUgb3BhbmVsIHRvIGhvbGQgaXRcbiAgICAgICAgICAgICRwYWdlLmNzcyh7IGhlaWdodDogJ2F1dG8nIH0pLmFkZENsYXNzKGJhc2Uub3B0aW9ucy5hY3RpdmVDbGFzcykuZmFkZUluKCgxMDAgKiBiYXNlLm9wdGlvbnMuYW5pbWF0aW9uRmFjdG9yKSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgJHBhZ2UucmVtb3ZlQXR0cignc3R5bGUnKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdmFyIGFuaW1UaW1lID0gKCRvbGRQYWdlLmxlbmd0aCA+IDAgPyAoMTAwICogYmFzZS5vcHRpb25zLmFuaW1hdGlvbkZhY3RvcikgOiAoMTUwICogYmFzZS5vcHRpb25zLmFuaW1hdGlvbkZhY3RvcikpOyAvLyBhbmltYXRlIGZhc3RlciBpZiBpdCdzIHN3aXRjaGluZyBwYWdlc1xuICAgICAgICAgICAgJHBhbmVsLmFuaW1hdGUoeyBoZWlnaHQ6IG5ld0hlaWdodCB9LCBhbmltVGltZSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgJHBhbmVsLnJlbW92ZUF0dHIoJ3N0eWxlJyk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB9LFxuICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgIF86IG51bGwgLy8gbm8gZm9sbG93aW5nIGNvbW1hXG4gICAgfSk7XG5cbn0pKGpRdWVyeSwgd2luZG93LCBkb2N1bWVudCk7XG5cblxuXG5cblxuXG5cblxuXG5cblxuXG4iLCJcbihmdW5jdGlvbigpe1xuXG5cbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgLy8gY29udmVuaWVuY2UgZnVuY3Rpb25zXG4gICAgdmFyIGVuYWJsZUdvQnV0dG9uID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICgkLmluQXJyYXkoJCgnI3NwZWNpZXNuYW1lJykudmFsKCksIHNwZWNpZXNTY2lOYW1lTGlzdCkgPiAtMSkge1xuICAgICAgICAgICAgJCgnI3NwcHNob3dtYXAnKS5yZW1vdmVDbGFzcygnZGlzYWJsZWQnKS5wcm9wKCdkaXNhYmxlZCcsIGZhbHNlKTsgLy8gZW5hYmxlIHRoZSBidXR0b25cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICQoJyNzcHBzaG93bWFwJykuYWRkQ2xhc3MoJ2Rpc2FibGVkJykucHJvcCgnZGlzYWJsZWQnLCB0cnVlKTsgLy8gRElTYWJsZSB0aGUgYnV0dG9uXG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8gd29yayBvdXQgd2hlbiB0byBkaXNhYmxlIHRoaW5nc1xuICAgIHZhciBlbmFibGVGdXR1cmVGaWVsZHMgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICAvLyBmZXRjaCB0aGUgY3VycmVudCBmb3JtIGVsZW1lbnRzXG4gICAgICAgIHZhciAkdGltZVBvaW50Q3RsID0gJCgnaW5wdXRbbmFtZT1zcHB0aW1lcG9pbnRdOmNoZWNrZWQnKTtcblxuICAgICAgICBpZiAoJHRpbWVQb2ludEN0bC52YWwoKSA9PT0gJ2Jhc2VsaW5lJykge1xuICAgICAgICAgICAgJCgnaW5wdXRbbmFtZT1zcHBzY2VuYXJpb10sIGlucHV0W25hbWU9c3BwZ2NtXScpLnByb3AoJ2Rpc2FibGVkJywgdHJ1ZSk7IC8vIERJU2FibGUgdGhlIGZ1dHVyZSBmaWVsZHNcbiAgICAgICAgICAgICQoJ2ZpZWxkc2V0LnNwcHNjZW5hcmlvLCBmaWVsZHNldC5zcHBnY20nKS5hZGRDbGFzcygnZGlzYWJsZWQnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICQoJ2lucHV0W25hbWU9c3Bwc2NlbmFyaW9dLCBpbnB1dFtuYW1lPXNwcGdjbV0nKS5wcm9wKCdkaXNhYmxlZCcsIGZhbHNlKTsgLy8gZW5hYmxlIHRoZSBmdXR1cmUgZmllbGRzXG4gICAgICAgICAgICAkKCdmaWVsZHNldC5zcHBzY2VuYXJpbywgZmllbGRzZXQuc3BwZ2NtJykucmVtb3ZlQ2xhc3MoJ2Rpc2FibGVkJyk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIC8vIGZldGNoIHRoZSBzcGVjaWVzIGxpc3RcbiAgICBzcGVjaWVzRmV0Y2ggPSAkLmFqYXgoe1xuICAgICAgICB1cmw6ICcvZGF0YS9zcGVjaWVzJ1xuICAgIH0pO1xuICAgIC8vIGdldCBhIHZhcmlhYmxlIHJlYWQgZm9yIG91ciBsaXN0XG4gICAgdmFyIHNwZWNpZXNMb29rdXBMaXN0ID0gW107XG4gICAgdmFyIHNwZWNpZXNTY2lOYW1lTGlzdCA9IFtdO1xuXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIC8vIHNldCB1cCB0aGUgYXV0b2NvbXBsZXRlIGZpZWxkXG5cbiAgICAvLyBkbyB0aGlzIGFmdGVyIHdlJ3ZlIGZldGNoZWQgdGhlIHNwZWNpZXMgbGlzdFxuICAgIHNwZWNpZXNGZXRjaC5kb25lKCBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHNwZWNpZXNMb29rdXBMaXN0ID0gW107IC8vIG5vIGluaXRpYWwgdmFyIGhlcmUsIHdlIHdhbnQgdG8gcmVmZXIgdG8gdGhlIG91dHNpZGUgc2NvcGVcbiAgICAgICAgc3BlY2llc1NjaU5hbWVMaXN0ID0gW107IC8vIG5vIGluaXRpYWwgdmFyIGhlcmUsIHdlIHdhbnQgdG8gcmVmZXIgdG8gdGhlIG91dHNpZGUgc2NvcGVcbiAgICAgICAgJC5lYWNoKGRhdGEsIGZ1bmN0aW9uKHNjaU5hbWUsIGNvbW1vbk5hbWVzKSB7XG4gICAgICAgICAgICBzcGVjaWVzU2NpTmFtZUxpc3QucHVzaChzY2lOYW1lKTtcbiAgICAgICAgICAgIGlmIChjb21tb25OYW1lcykge1xuICAgICAgICAgICAgICAgICQuZWFjaChjb21tb25OYW1lcywgZnVuY3Rpb24oY25JbmRleCwgY24pIHtcbiAgICAgICAgICAgICAgICAgICAgc3BlY2llc0xvb2t1cExpc3QucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogY24gKyAnICgnICsgc2NpTmFtZSArICcpJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBzY2lOYW1lXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzcGVjaWVzTG9va3VwTGlzdC5wdXNoKHsgbGFiZWw6IHNjaU5hbWUsIHZhbHVlOiBzY2lOYW1lIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgJCgnI3NwZWNpZXNuYW1lJykuYXV0b2NvbXBsZXRlKHsgc291cmNlOiBzcGVjaWVzTG9va3VwTGlzdCB9KTtcbiAgICB9KTtcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgLy8gaG9vayB1cCB0aGUgYXV0by1lbmFibGUgYW5kIGRpc2FibGUgc3R1ZmZcbiAgICAkKCcjc3BlY2llc25hbWUnKS5vbignYXV0b2NvbXBsZXRlY2xvc2UnLCAgZnVuY3Rpb24oZXZlbnQsIHVpKSB7IGVuYWJsZUdvQnV0dG9uKCk7IH0pO1xuICAgICQoJyNzcGVjaWVzbmFtZScpLm9uKCdrZXl1cCcsICAgICAgICAgICAgICBmdW5jdGlvbihldmVudCwgdWkpIHsgZW5hYmxlR29CdXR0b24oKTsgfSk7XG4gICAgJCgnI3NwZWNpZXNuYW1lJykub24oJ2NoYW5nZScsICAgICAgICAgICAgIGZ1bmN0aW9uKGV2ZW50LCB1aSkgeyBlbmFibGVHb0J1dHRvbigpOyB9KTtcblxuICAgICQoJ2lucHV0W25hbWU9c3BwdGltZXBvaW50XScpLmNoYW5nZSggZnVuY3Rpb24oKSB7XG4gICAgICAgIGVuYWJsZUZ1dHVyZUZpZWxkcygpO1xuICAgIH0pO1xuXG4gICAgLy8gYWxzbyBkbyB0aGUgZW5hYmxpbmcgbm93Li5cbiAgICBlbmFibGVHb0J1dHRvbigpO1xuICAgIGVuYWJsZUZ1dHVyZUZpZWxkcygpO1xuXG4gICAgLy8gbmVlZCB0byBhdHRhY2ggdGhlIGZhZGUtaW4gZXZlbnQgaGFuZGVyIHRvIHRoZSBpZnJhbWUncyBcInJlYWR5XCIgZXZlbnQganVzdCBvbmNlLCBhbmQgaXRcbiAgICAvLyB3aWxsIHRyaWdnZXIgZWFjaCB0aW1lIHdlIHNldCB0aGUgaWZyYW1lJ3Mgc3JjIGFuZCB0aGUgcGFnZSBsb2Fkcy5cbiAgICAkKCcjbWFwZnJhbWUnKS5sb2FkKGZ1bmN0aW9uKCkge1xuICAgICAgICAkKCcjbWFwJykuYW5pbWF0ZSh7IG9wYWNpdHk6IDEgfSwgMjUwMCk7XG4gICAgfSk7XG5cblxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAvLyBoYW5kbGUgd2hlbiB0aGV5IGFjdHVhbGx5IGNsaWNrIG9uIHRoZSBzcGVjaWVzIHBhbmVsIGJ1dHRvblxuICAgICQoJyNzcHBzaG93bWFwJykuY2xpY2soIGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIC8vIGZldGNoIHRoZSBjdXJyZW50IHNwZWNpZXMgbmFtZSBldGMgZnJvbSB0aGUgZm9ybSBlbGVtZW50cy5cbiAgICAgICAgdmFyIHNwcE5hbWUgPSAkKCcjc3BlY2llc25hbWUnKS52YWwoKTtcbiAgICAgICAgdmFyIHRpbWVQb2ludCA9ICQoJ2lucHV0W25hbWU9c3BwdGltZXBvaW50XTpjaGVja2VkJykudmFsKCk7XG4gICAgICAgIHZhciBzY2VuYXJpbyA9ICQoJ2lucHV0W25hbWU9c3Bwc2NlbmFyaW9dOmNoZWNrZWQnKS52YWwoKTtcbiAgICAgICAgdmFyIGNsaW1hdGVNb2RlbCA9ICQoJ2lucHV0W25hbWU9c3BwZ2NtXTpjaGVja2VkJykudmFsKCk7XG5cbiAgICAgICAgdmFyIGZ1dHVyZU1vZGVsUG9pbnQgPSBzY2VuYXJpbyArICdfJyArIGNsaW1hdGVNb2RlbCArICdfJyArIHRpbWVQb2ludDtcbiAgICAgICAgaWYgKHRpbWVQb2ludCA9PT0gJ2Jhc2VsaW5lJykge1xuICAgICAgICAgICAgZnV0dXJlTW9kZWxQb2ludCA9ICcxOTkwJztcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBtYXBVcmwgPSAnaHR0cDovLzEzMC4xMDIuMTU1LjMzOjgwODAvJyArIHNwcE5hbWUucmVwbGFjZSgnICcsICdfJykgKyAnL291dHB1dC8nICsgZnV0dXJlTW9kZWxQb2ludCArICcudGlmJztcbiAgICAgICAgbWFwVXJsID0gd2luZG93LmNsaW1hc1NldHRpbmdzLnZpelVybFByZWZpeCArIGVuY29kZVVSSUNvbXBvbmVudChtYXBVcmwpO1xuXG4gICAgICAgICQoJyNzcGVjaWVzc2hvd2luZ3BhZ2UgLnNwZWNpZXNuYW1lJykuaHRtbChzcHBOYW1lKTtcbiAgICAgICAgJCgnI21hcCcpLmFuaW1hdGUoeyBvcGFjaXR5OiAwIH0sICdmYXN0JywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAvLyBmaW5kIHRoZSBtYXAgYW5kIGFwcGx5IGl0XG4gICAgICAgICAgICAkKCcjbWFwZnJhbWUnKS5hdHRyKCdzcmMnLCBtYXBVcmwpO1xuICAgICAgICAgICAgLy8gdGhlIGlmcmFtZSdzIHJlYWR5IGV2ZW50IHdpbGwgZXZlbnR1YWxseSBmaXJlLCBhbmQgdGhhdCdzIHdoZW4gd2UgZmFkZSB0aGUgbWFwIGJhY2sgaW4uXG4gICAgICAgIH0pO1xuXG4gICAgfSk7XG5cbn0pKCk7Il19
