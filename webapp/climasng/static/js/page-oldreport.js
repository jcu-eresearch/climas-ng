(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

// jquery plugin - hopefully you have jquery loaded already :(
// TODO shim in jquery properly
require('./menusandpanels');



$('header').disableSelection(); // unpopular but still better

// -------------------------- menus, submenus, panels, pages handling
// turn on the mspp plugin for our nav menu
$('nav > ul').mspp({});

},{"./menusandpanels":2}],2:[function(require,module,exports){

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













},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9wdnJkd2IvamN1L2NuZy93ZWJhcHAvbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL3B2cmR3Yi9qY3UvY25nL3dlYmFwcC9jbGltYXNuZy9zcmMvanMvZmFrZV8xZjg5NmEwLmpzIiwiL1VzZXJzL3B2cmR3Yi9qY3UvY25nL3dlYmFwcC9jbGltYXNuZy9zcmMvanMvbWVudXNhbmRwYW5lbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcbi8vIGpxdWVyeSBwbHVnaW4gLSBob3BlZnVsbHkgeW91IGhhdmUganF1ZXJ5IGxvYWRlZCBhbHJlYWR5IDooXG4vLyBUT0RPIHNoaW0gaW4ganF1ZXJ5IHByb3Blcmx5XG5yZXF1aXJlKCcuL21lbnVzYW5kcGFuZWxzJyk7XG5cblxuXG4kKCdoZWFkZXInKS5kaXNhYmxlU2VsZWN0aW9uKCk7IC8vIHVucG9wdWxhciBidXQgc3RpbGwgYmV0dGVyXG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIG1lbnVzLCBzdWJtZW51cywgcGFuZWxzLCBwYWdlcyBoYW5kbGluZ1xuLy8gdHVybiBvbiB0aGUgbXNwcCBwbHVnaW4gZm9yIG91ciBuYXYgbWVudVxuJCgnbmF2ID4gdWwnKS5tc3BwKHt9KTtcbiIsIlxuLy8galF1ZXJ5IHBsdWdpblxuLy8gYXV0aG9yOiBEYW5pZWwgQmFpcmQgPGRhbmllbEBkYW5pZWxiYWlyZC5jb20+XG4vLyB2ZXJzaW9uOiAwLjEuMjAxNDAyMDVcblxuLy9cbi8vIFRoaXMgbWFuYWdlcyBtZW51cywgc3VibWVudXMsIHBhbmVscywgYW5kIHBhZ2VzLlxuLy8gTGlrZSB0aGlzOlxuLy8gLS0tLi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0uLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLi0tLVxuLy8gICAgfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCAgICAgICAgICAgICAgICAgICAgICB8ICAgICAgICAgICAgICAgICAgICAgICAgfFxuLy8gICAgfCAgU2VsZWN0ZWQgTWFpbiBNZW51IEl0ZW0gICAuLS0tLS0tLS0tLS0uIC4tLS0tLS0tLS0uICAgfCAgQWx0IE1haW4gTWVudSBJdGVtICB8ICBUaGlyZCBNYWluIE1lbnUgSXRlbSAgfFxuLy8gICAgfCAgICAgICAgICAgICAgICAgICAgICAgICAgIC8gIFN1Yml0ZW0gMSAgXFwgU3ViaXRlbSAyIFxcICB8ICAgICAgICAgICAgICAgICAgICAgIHwgICAgICAgICAgICAgICAgICAgICAgICB8XG4vLyAtLS0nLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0nICAgICAgICAgICAgICAgJy0tLS0tLS0tLS0tLS0nLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSctLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0nLS0tXG4vLyAgICAgICB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbi8vICAgICAgIHwgICBQYW5lbCBmb3IgU3ViaXRlbSAxLCB0aGlzIGlzIFBhZ2UgMSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuLy8gICAgICAgfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4vLyAgICAgICB8ICAgRWFjaCBQYW5lbCBjYW4gaGF2ZSBtdWx0aXBsZSBwYWdlcywgb25lIHBhZ2Ugc2hvd2luZyBhdCBhIHRpbWUuICBCdXR0b25zIG9uIHBhZ2VzIHN3aXRjaCAgICAgIHxcbi8vICAgICAgIHwgICBiZXR3ZWVuIHBhZ2VzLiAgUGFuZWwgaGVpZ2h0IGFkanVzdHMgdG8gdGhlIGhlaWdodCBvZiB0aGUgcGFnZS4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuLy8gICAgICAgfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4vLyAgICAgICB8ICAgWyBzZWUgcGFnZSAyIF0gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbi8vICAgICAgIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuLy8gICAgICAgJy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0nXG4vL1xuLy8gLSBtZW51cyBhcmUgYWx3YXlzIDx1bD4gdGFnczsgZWFjaCA8bGk+IGlzIGEgbWVudSBpdGVtXG4vLyAtIGEgbWFpbiBtZW51IDxsaT4gbXVzdCBjb250YWluIGFuIDxhPiB0YWcgYW5kIG1heSBhbHNvIGNvbnRhaW4gYSA8dWw+IHN1Ym1lbnVcbi8vIC0gYSBzdWJtZW51IDxsaT4gbXVzdCBjb250YWluIGFuIDxhPiB0YWcgd2l0aCBhIGRhdGEtdGFyZ2V0cGFuZWwgYXR0cmlidXRlIHNldFxuLy8gLSBUaGVyZSBpcyBhbHdheXMgYSBzaW5nbGUgc2VsZWN0ZWQgbWFpbiBtZW51IGl0ZW1cbi8vIC0gQSBtYWluIG1lbnUgaXRlbSBtYXkgZWl0aGVyIGxpbmsgdG8gYW5vdGhlciB3ZWJwYWdlLCBvciBoYXZlIGEgc3VibWVudVxuLy8gLSBTZWxlY3RpbmcgYSBtYWluIG1lbnUgaXRlbSB3aWxsIHNob3cgaXRzIHN1Ym1lbnUsIGlmIGl0IGhhcyBvbmVcbi8vIC0gQSBzdWJtZW51IGFsd2F5cyBoYXMgYSBzaW5nbGUgaXRlbSBzZWxlY3RlZFxuLy8gLSBDbGlja2luZyBhbiBpbmFjdGl2ZSBzdWJtZW51IGl0ZW0gd2lsbCBzaG93IGl0cyBwYW5lbFxuLy8gLSBDbGlja2luZyBhIHNlbGVjdGVkIHN1Ym1lbnUgaXRlbSB3aWxsIHRvZ2dsZSBpdHMgcGFuZWwgc2hvd2luZyA8LT4gaGlkaW5nICgoKCBOQjogbm90IHlldCBpbXBsZW1lbnRlZCApKSlcbi8vIC0gQSBwYW5lbCBpbml0aWFsbHkgc2hvd3MgaXRzIGZpcnN0IHBhZ2Vcbi8vIC0gU3dpdGNoaW5nIHBhZ2VzIGluIGEgcGFuZWwgY2hhbmdlcyB0aGUgcGFuZWwgaGVpZ2h0IHRvIHN1aXQgaXRzIGN1cnJlbnQgcGFnZVxuLy8gLSBBIHBhbmVsIGlzIGEgSFRNTCBibG9jayBlbGVtZW50IHdpdGggdGhlIGNsYXNzIC5tc3BwLXBhbmVsIChjYW4gYmUgb3ZlcnJpZGRlbiB2aWEgb3B0aW9uKVxuLy8gLSBJZiBhIHBhbmVsIGNvbnRhaW5zIHBhZ2VzLCBvbmUgcGFnZSBzaG91bGQgaGF2ZSB0aGUgY2xhc3MgLmN1cnJlbnQgKGNhbiBiZSBvdmVycmlkZGVuIHZpYSBvcHRpb24pXG4vLyAtIEEgcGFnZSBpcyBhIEhUTUwgYmxvY2sgZWxlbWVudCB3aXRoIHRoZSBjbGFzcyAubXNwcC1wYWdlIChjYW4gYmUgb3ZlcnJpZGRlbiB2aWEgb3B0aW9uKVxuLy8gLSA8YnV0dG9uPiBvciA8YT4gdGFncyBpbiBwYWdlcyB0aGF0IGhhdmUgYSBkYXRhLXRhcmdldHBhZ2UgYXR0cmlidXRlIHNldCB3aWxsIHN3aXRjaCB0byB0aGUgaW5kaWNhdGVkIHBhZ2Vcbi8vXG4vL1xuLy8gVGhlIEhUTUwgc2hvdWxkIGxvb2sgbGlrZSB0aGlzOlxuLy9cbi8vICA8dWwgY2xhc3M9XCJtZW51XCI+ICAgICAgICAgICAgICAgICAgIDwhLS0gdGhpcyBpcyB0aGUgbWFpbiBtZW51IC0tPlxuLy8gICAgICA8bGkgY2xhc3M9XCJjdXJyZW50XCI+ICAgICAgICAgICAgPCEtLSB0aGlzIGlzIGEgbWFpbiBtZW51IGl0ZW0sIGN1cnJlbnRseSBzZWxlY3RlZCAtLT5cbi8vICAgICAgICAgIDxhPkZpcnN0IEl0ZW08L2E+ICAgICAgICAgICA8IS0tIHRoZSBmaXJzdCBpdGVtIGluIHRoZSBtYWluIG1lbnUgLS0+XG4vLyAgICAgICAgICA8dWw+ICAgICAgICAgICAgICAgICAgICAgICAgPCEtLSBhIHN1Ym1lbnUgaW4gdGhlIGZpcnN0IG1haW4gbWVudSBpdGVtIC0tPlxuLy8gICAgICAgICAgICAgIDxsaSBjbGFzcz1cImN1cnJlbnRcIj4gICAgPCEtLSB0aGUgY3VycmVudGx5IHNlbGVjdGVkIHN1Ym1lbnUgaXRlbSAtLT5cbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8IS0tIC5wYW5lbHRyaWdnZXIgYW5kIHRoZSBkYXRhLXBhbmVsaWQgYXR0cmlidXRlIGFyZSByZXF1aXJlZCAtLT5cbi8vICAgICAgICAgICAgICAgICAgPGEgZGF0YS10YXJnZXRwYW5lbD1cInBhbmVsMVwiPmRvIHRoZSBwYW5lbDEgdGhpbmc8L2E+XG4vLyAgICAgICAgICAgICAgPC9saT5cbi8vICAgICAgICAgICAgICA8bGk+Li4uPC9saT4gICAgICAgICAgICA8IS0tIGFub3RoZXIgc3VibWVudSBpdGVtIC0tPlxuLy8gICAgICAgICAgPC91bD5cbi8vICAgICAgPC9saT5cbi8vICAgICAgPGxpPiA8YSBocmVmPVwiYW5vdGhlcl9wYWdlLmh0bWxcIj5hbm90aGVyIHBhZ2U8L2E+IDwvbGk+XG4vLyAgICAgIDxsaT4gPGE+d2hhdGV2ZXI8L2E+IDwvbGk+XG4vLyAgPC91bD5cbi8vXG4vLyAgPGRpdiBpZD1cInBhbmVsMVwiIGNsYXNzPVwibXNwcC1wYW5lbFwiPlxuLy8gICAgICA8ZGl2IGlkPVwicGFnZTExXCIgY2xhc3M9XCJtc3BwLXBhZ2UgY3VycmVudFwiPlxuLy8gICAgICAgICAgVGhpcyBpcyB0aGUgY3VycmVudCBwYWdlIG9uIHBhbmVsIDEuXG4vLyAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBkYXRhLXRhcmdldHBhZ2U9XCJwYWdlMTJcIj5zaG93IHBhZ2UgMjwvYnV0dG9uPlxuLy8gICAgICA8L2Rpdj5cbi8vICAgICAgPGRpdiBpZD1cInBhZ2UxMlwiIGNsYXNzPVwibXNwcC1wYWdlXCI+XG4vLyAgICAgICAgICBUaGlzIGlzIHRoZSBvdGhlciBwYWdlIG9uIHBhbmVsIDEuXG4vLyAgICAgICAgICA8YSBkYXRhLXRhcmdldHBhZ2U9XCJwYWdlMTFcIj5zZWUgdGhlIGZpcnN0IHBhZ2UgYWdhaW48L2E+XG4vLyAgICAgIDwvZGl2PlxuLy8gIDwvZGl2PlxuLy8gIDxkaXYgaWQ9XCJwYW5lbDJcIiBjbGFzcz1cIm1zcHAtcGFuZWxcIj5cbi8vICAgICAgPGRpdiBpZD1cInBhZ2UyMVwiIGNsYXNzPVwibXNwcC1wYWdlIGN1cnJlbnRcIj5cbi8vICAgICAgICAgIFRoaXMgaXMgdGhlIGN1cnJlbnQgcGFnZSBvbiBwYW5lbCAyLlxuLy8gICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgZGF0YS10YXJnZXRwYWdlPVwicGFnZTIyXCI+c2hvdyBwYWdlIDI8L2J1dHRvbj5cbi8vICAgICAgPC9kaXY+XG4vLyAgICAgIDxkaXYgaWQ9XCJwYWdlMjJcIiBjbGFzcz1cIm1zcHAtcGFnZVwiPlxuLy8gICAgICAgICAgVGhpcyBpcyB0aGUgb3RoZXIgcGFnZSBvbiBwYW5lbCAyLlxuLy8gICAgICAgICAgPGEgZGF0YS10YXJnZXRwYWdlPVwicGFnZTIxXCI+c2VlIHRoZSBmaXJzdCBwYWdlIGFnYWluPC9hPlxuLy8gICAgICA8L2Rpdj5cbi8vICA8L2Rpdj5cblxuXG47KCBmdW5jdGlvbigkLCB3aW5kb3csIGRvY3VtZW50LCB1bmRlZmluZWQpIHtcblxuICAgIC8vIG5hbWVzcGFjZSBjbGltYXMsIHdpZGdldCBuYW1lIG1zcHBcbiAgICAvLyBzZWNvbmQgYXJnIGlzIHVzZWQgYXMgdGhlIHdpZGdldCdzIFwicHJvdG90eXBlXCIgb2JqZWN0XG4gICAgJC53aWRnZXQoIFwiY2xpbWFzLm1zcHBcIiAsIHtcblxuICAgICAgICAvL09wdGlvbnMgdG8gYmUgdXNlZCBhcyBkZWZhdWx0c1xuICAgICAgICBvcHRpb25zOiB7XG4gICAgICAgICAgICBhbmltYXRpb25GYWN0b3I6IDIsXG5cbiAgICAgICAgICAgIG1haW5NZW51Q2xhc3M6ICdtc3BwLW1haW4tbWVudScsXG5cbiAgICAgICAgICAgIHBhbmVsQ2xhc3M6ICdtc3BwLXBhbmVsJyxcbiAgICAgICAgICAgIHBhZ2VDbGFzczogJ21zcHAtcGFnZScsXG5cbiAgICAgICAgICAgIGNsZWFyZml4Q2xhc3M6ICdtc3BwLWNsZWFyZml4JyxcbiAgICAgICAgICAgIGFjdGl2ZUNsYXNzOiAnY3VycmVudCdcbiAgICAgICAgfSxcbiAgICAgICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICAvL1NldHVwIHdpZGdldCAoZWcuIGVsZW1lbnQgY3JlYXRpb24sIGFwcGx5IHRoZW1pbmdcbiAgICAgICAgLy8gLCBiaW5kIGV2ZW50cyBldGMuKVxuICAgICAgICBfY3JlYXRlOiBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgdmFyIGJhc2UgPSB0aGlzO1xuICAgICAgICAgICAgdmFyIG9wdHMgPSB0aGlzLm9wdGlvbnM7XG5cbiAgICAgICAgICAgIC8vIHBvcHVsYXRlIHNvbWUgY29udmVuaWVuY2UgdmFyaWFibGVzXG4gICAgICAgICAgICB2YXIgJG1lbnUgPSB0aGlzLmVsZW1lbnQ7XG4gICAgICAgICAgICB0aGlzLm1haW5NZW51SXRlbXMgPSAkbWVudS5jaGlsZHJlbignbGknKTtcbiAgICAgICAgICAgIHRoaXMucGFuZWxzID0gJCgnLicgKyBvcHRzLnBhbmVsQ2xhc3MpO1xuXG4gICAgICAgICAgICAvLyBkaXNhcHBlYXIgd2hpbGUgd2Ugc29ydCB0aGluZ3Mgb3V0XG4gICAgICAgICAgICAkbWVudS5jc3MoeyBvcGFjaXR5OiAwIH0pO1xuICAgICAgICAgICAgdGhpcy5wYW5lbHMuY3NzKHsgb3BhY2l0eTogMCB9KTtcblxuICAgICAgICAgICAgLy8gbWFrZSBzb21lIERPTSBtb2RzXG4gICAgICAgICAgICAkbWVudS5hZGRDbGFzcyhvcHRzLm1haW5NZW51Q2xhc3MpO1xuICAgICAgICAgICAgJG1lbnUuYWRkQ2xhc3Mob3B0cy5jbGVhcmZpeENsYXNzKTtcbiAgICAgICAgICAgIHRoaXMucGFuZWxzLmFkZENsYXNzKG9wdHMuY2xlYXJmaXhDbGFzcyk7XG5cbiAgICAgICAgICAgIC8vIGxheW91dCB0aGUgbWVudVxuICAgICAgICAgICAgdGhpcy5fbGF5b3V0TWVudSgpO1xuXG4gICAgICAgICAgICAvLyBsYXlvdXQgdGhlIHBhbmVsc1xuICAgICAgICAgICAgdGhpcy5fbGF5b3V0UGFuZWxzKCk7XG5cbiAgICAgICAgICAgIC8vIGhvb2sgdXAgY2xpY2sgaGFuZGxpbmcgZXRjXG4gICAgICAgICAgICAkbWVudS5vbignbXNwcHNob3dtZW51JywgdGhpcy5fc2hvd01lbnUpO1xuICAgICAgICAgICAgJG1lbnUub24oJ21zcHBzaG93c3VibWVudScsIHRoaXMuX3Nob3dTdWJNZW51KTtcbiAgICAgICAgICAgICRtZW51Lm9uKCdtc3Bwc2hvd3BhbmVsJywgdGhpcy5fc2hvd1BhbmVsKTtcbiAgICAgICAgICAgICRtZW51Lm9uKCdtc3Bwc2hvd3BhZ2UnLCB0aGlzLl9zaG93UGFnZSk7XG5cbiAgICAgICAgICAgIC8vIGF0dGFjaCBoYW5kbGVycyB0byB0aGUgbWVudS10cmlnZ2Vyc1xuICAgICAgICAgICAgdGhpcy5tYWluTWVudUl0ZW1zLmVhY2goIGZ1bmN0aW9uKGluZGV4LCBpdGVtKSB7XG4gICAgICAgICAgICAgICAgLy8gdGhlIGxpIG1lbnUgaXRlbSBoYXMgYSBjaGlsZCBhIHRoYXQgaXMgaXQncyB0cmlnZ2VyXG4gICAgICAgICAgICAgICAgJChpdGVtKS5jaGlsZHJlbignYScpLmNsaWNrKCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgICAgICAgICBiYXNlLl90cmlnZ2VyKCdzaG93bWVudScsIGV2ZW50LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtZW51aXRlbTogaXRlbSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpZGdldDogYmFzZVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAvLyBhdHRhY2ggaGFuZGxlcnMgdG8gdGhlIHN1Ym1lbnUgaXRlbXNcbiAgICAgICAgICAgICAgICAkKGl0ZW0pLmZpbmQoJ2xpJykuZWFjaCggZnVuY3Rpb24oaW5kZXgsIHN1Yk1lbnVJdGVtKSB7XG4gICAgICAgICAgICAgICAgICAgICQoc3ViTWVudUl0ZW0pLmZpbmQoJ2EnKS5jbGljayggZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhc2UuX3RyaWdnZXIoJ3Nob3dzdWJtZW51JywgZXZlbnQsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZW51aXRlbTogaXRlbSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWJtZW51aXRlbTogc3ViTWVudUl0ZW0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2lkZ2V0OiBiYXNlXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gYXR0YWNoIGhhbmRsZXJzIHRvIHRoZSBwYW5lbCB0cmlnZ2Vyc1xuICAgICAgICAgICAgJG1lbnUuZmluZCgnW2RhdGEtdGFyZ2V0cGFuZWxdJykuZWFjaCggZnVuY3Rpb24oaW5kZXgsIHRyaWdnZXIpIHtcbiAgICAgICAgICAgICAgICB2YXIgJHRyaWdnZXIgPSQodHJpZ2dlcik7XG4gICAgICAgICAgICAgICAgJHRyaWdnZXIuY2xpY2soIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIGJhc2UuX3RyaWdnZXIoJ3Nob3dwYW5lbCcsIGV2ZW50LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYW5lbDogJCgnIycgKyAkdHJpZ2dlci5kYXRhKCd0YXJnZXRwYW5lbCcpKS5maXJzdCgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgd2lkZ2V0OiBiYXNlXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIGF0dGFjaCBoYW5kbGVycyB0byB0aGUgcGFnZSBzd2l0Y2hlcnNcbiAgICAgICAgICAgIHRoaXMucGFuZWxzLmVhY2goIGZ1bmN0aW9uKGluZGV4LCBwYW5lbCkge1xuICAgICAgICAgICAgICAgIHZhciAkcGFuZWwgPSAkKHBhbmVsKTtcbiAgICAgICAgICAgICAgICAkcGFuZWwuZmluZCgnW2RhdGEtdGFyZ2V0cGFnZV0nKS5jbGljayggZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgYmFzZS5fdHJpZ2dlcignc2hvd3BhZ2UnLCBldmVudCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgcGFuZWw6ICRwYW5lbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhZ2U6ICQoJyMnICsgJCh0aGlzKS5kYXRhKCd0YXJnZXRwYWdlJykpLFxuICAgICAgICAgICAgICAgICAgICAgICAgd2lkZ2V0OiBiYXNlXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIGFjdGl2YXRlIHRoZSBjdXJyZW50IG1lbnVzLCBwYW5lbHMgZXRjXG4gICAgICAgICAgICB2YXIgJGN1cnJlbnRNYWluID0gdGhpcy5tYWluTWVudUl0ZW1zLmZpbHRlcignLicgKyBvcHRzLmFjdGl2ZUNsYXNzKTtcbiAgICAgICAgICAgICRjdXJyZW50TWFpbi5yZW1vdmVDbGFzcyhvcHRzLmFjdGl2ZUNsYXNzKS5jaGlsZHJlbignYScpLmNsaWNrKCk7XG5cbiAgICAgICAgICAgIC8vIGZpbmFsbHksIGZhZGUgYmFjayBpblxuICAgICAgICAgICAgJG1lbnUuYW5pbWF0ZSh7IG9wYWNpdHk6IDEgfSwgJ2Zhc3QnKTtcblxuICAgICAgICAgICAgLy8gcGFuZWxzIHN0YXkgaW52aXNpYmxlXG4gICAgICAgIH0sXG4gICAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgICAgX3N3aXRjaENsYXNzT3B0aW9uOiBmdW5jdGlvbihjbGFzc05hbWUsIG5ld0NsYXNzKSB7XG4gICAgICAgICAgICB2YXIgb2xkQ2xhc3MgPSB0aGlzLm9wdGlvbnNbY2xhc3NOYW1lXTtcbiAgICAgICAgICAgIGlmIChvbGRDbGFzcyAhPT0gbmV3Q2xhc3MpIHtcbiAgICAgICAgICAgICAgICB2YXIgZ3JvdXAgPSB0aGlzLmVsZW1lbnQuZmluZCgnLicgKyBvbGRDbGFzcyk7XG4gICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zW2NsYXNzTmFtZV0gPSBuZXdDbGFzcztcbiAgICAgICAgICAgICAgICBncm91cC5yZW1vdmVDbGFzcyhvbGRDbGFzcyk7XG4gICAgICAgICAgICAgICAgZ3JvdXAuYWRkQ2xhc3MobmV3Q2xhc3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgIC8vIFJlc3BvbmQgdG8gYW55IGNoYW5nZXMgdGhlIHVzZXIgbWFrZXMgdG8gdGhlXG4gICAgICAgIC8vIG9wdGlvbiBtZXRob2RcbiAgICAgICAgX3NldE9wdGlvbjogZnVuY3Rpb24oa2V5LCB2YWx1ZSkge1xuICAgICAgICAgICAgc3dpdGNoIChrZXkpIHtcbiAgICAgICAgICAgICAgICBjYXNlIFwibWFpbk1lbnVDbGFzc1wiOlxuICAgICAgICAgICAgICAgIGNhc2UgXCJjbGVhcmZpeENsYXNzXCI6XG4gICAgICAgICAgICAgICAgY2FzZSBcImFjdGl2ZUNsYXNzXCI6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3N3aXRjaENsYXNzT3B0aW9uKGtleSwgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMub3B0aW9uc1trZXldID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIC8vIGl0J3Mgb2theSB0aGF0IHRoZXJlJ3Mgbm8gfSBoZXJlXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyByZW1lbWJlciB0byBjYWxsIG91ciBzdXBlcidzIF9zZXRPcHRpb24gbWV0aG9kXG4gICAgICAgICAgICB0aGlzLl9zdXBlciggXCJfc2V0T3B0aW9uXCIsIGtleSwgdmFsdWUgKTtcbiAgICAgICAgfSxcbiAgICAgICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICAvLyBEZXN0cm95IGFuIGluc3RhbnRpYXRlZCBwbHVnaW4gYW5kIGNsZWFuIHVwXG4gICAgICAgIC8vIG1vZGlmaWNhdGlvbnMgdGhlIHdpZGdldCBoYXMgbWFkZSB0byB0aGUgRE9NXG4gICAgICAgIF9kZXN0cm95OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5yZW1vdmVDbGFzcyh0aGlzLm9wdGlvbnMubWFpbk1lbnVDbGFzcyk7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQucmVtb3ZlQ2xhc3ModGhpcy5vcHRpb25zLmNsZWFyZml4Q2xhc3MpO1xuICAgICAgICAgICAgdGhpcy5wYW5lbHMucmVtb3ZlQ2xhc3ModGhpcy5vcHRpb25zLmNsZWFyZml4Q2xhc3MpO1xuICAgICAgICB9LFxuICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgIC8vIGRvIHRoZSBsYXlvdXQgY2FsY3VsYXRpb25zXG4gICAgICAgIF9sYXlvdXRNZW51OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIC8vIGdvIHRocm91Z2ggZWFjaCBzdWJtZW51IGFuZCByZWNvcmQgaXRzIHdpZHRoXG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQuZmluZCgndWwnKS5lYWNoKCBmdW5jdGlvbihpbmRleCwgc3ViTWVudSkge1xuICAgICAgICAgICAgICAgIHZhciAkc20gPSAkKHN1Yk1lbnUpO1xuICAgICAgICAgICAgICAgICRzbS5jc3Moe3dpZHRoOiAnYXV0byd9KTtcbiAgICAgICAgICAgICAgICAkc20uZGF0YSgnb3JpZ2luYWxXaWR0aCcsICRzbS53aWR0aCgpKTtcblxuICAgICAgICAgICAgICAgIC8vIGxlYXZlIGVhY2ggc3VibWVudSBoaWRkZW4sIHdpdGggd2lkdGggMFxuICAgICAgICAgICAgICAgICRzbS5jc3MoeyB3aWR0aDogMCwgZGlzcGxheTogJ25vbmUnIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgICAgX3Nob3dNZW51OiBmdW5jdGlvbihldmVudCwgZGF0YSkge1xuICAgICAgICAgICAgdmFyICRpdGVtID0gJChkYXRhLm1lbnVpdGVtKTtcbiAgICAgICAgICAgIHZhciBiYXNlID0gZGF0YS53aWRnZXQ7XG4gICAgICAgICAgICAvLyAkaXRlbSBpcyBhIGNsaWNrZWQtb24gbWVudSBpdGVtLi5cbiAgICAgICAgICAgIGlmICgkaXRlbS5oYXNDbGFzcyhiYXNlLm9wdGlvbnMuYWN0aXZlQ2xhc3MpKSB7XG4gICAgICAgICAgICAgICAgLy8gPz9cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYmFzZS5faGlkZVBhbmVscygpO1xuICAgICAgICAgICAgICAgIGJhc2UubWFpbk1lbnVJdGVtcy5yZW1vdmVDbGFzcyhiYXNlLm9wdGlvbnMuYWN0aXZlQ2xhc3MpO1xuICAgICAgICAgICAgICAgIHZhciAkbmV3U3ViTWVudSA9ICRpdGVtLmZpbmQoJ3VsJyk7XG4gICAgICAgICAgICAgICAgdmFyICRvbGRTdWJNZW51cyA9IGJhc2UuZWxlbWVudC5maW5kKCd1bCcpLm5vdCgkbmV3U3ViTWVudSk7XG4gICAgICAgICAgICAgICAgdmFyIG5ld1dpZHRoID0gJG5ld1N1Yk1lbnUuZGF0YSgnb3JpZ2luYWxXaWR0aCcpO1xuXG4gICAgICAgICAgICAgICAgJG9sZFN1Yk1lbnVzLmFuaW1hdGUoeyB3aWR0aDogMCB9LCAoNTAgKiBiYXNlLm9wdGlvbnMuYW5pbWF0aW9uRmFjdG9yKSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICRvbGRTdWJNZW51cy5jc3MoeyBkaXNwbGF5OiAnbm9uZScgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgJGl0ZW0uYWRkQ2xhc3MoYmFzZS5vcHRpb25zLmFjdGl2ZUNsYXNzKTtcbiAgICAgICAgICAgICAgICAkbmV3U3ViTWVudVxuICAgICAgICAgICAgICAgICAgICAuY3NzKHtkaXNwbGF5OiAnYmxvY2snIH0pXG4gICAgICAgICAgICAgICAgICAgIC5hbmltYXRlKHsgd2lkdGg6IG5ld1dpZHRoIH0sICgxMjUgKiBiYXNlLm9wdGlvbnMuYW5pbWF0aW9uRmFjdG9yKSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkbmV3U3ViTWVudS5jc3MoeyB3aWR0aDogJ2F1dG8nIH0pLnJlbW92ZUF0dHIoJ3N0eWxlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBiYXNlLl90cmlnZ2VyKCdtZW51c2hvd24nLCBldmVudCwgeyBpdGVtOiAkaXRlbSwgd2lkZ2V0OiBiYXNlIH0pO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIDtcbiAgICAgICAgICAgICAgICAvLyBpZiB0aGUgbmV3IHN1Ym1lbnUgaGFzIGFuIGFjdGl2ZSBpdGVtLCBjbGljayBpdFxuICAgICAgICAgICAgICAgICRuZXdTdWJNZW51LmZpbmQoJy4nICsgYmFzZS5vcHRpb25zLmFjdGl2ZUNsYXNzICsgJyBhJykuY2xpY2soKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICBfc2hvd1N1Yk1lbnU6IGZ1bmN0aW9uKGV2ZW50LCBkYXRhKSB7XG4gICAgICAgICAgICAvLyBkZS1hY3RpdmVpZnkgYWxsIHRoZSBzdWJtZW51IGl0ZW1zXG4gICAgICAgICAgICAkKGRhdGEubWVudWl0ZW0pLmZpbmQoJ2xpJykucmVtb3ZlQ2xhc3MoZGF0YS53aWRnZXQub3B0aW9ucy5hY3RpdmVDbGFzcyk7XG4gICAgICAgICAgICAvLyBhY3RpdmUtaWZ5IHRoZSBvbmUgdHJ1ZSBzdWJtZW51IGl0ZW1cbiAgICAgICAgICAgICQoZGF0YS5zdWJtZW51aXRlbSkuYWRkQ2xhc3MoZGF0YS53aWRnZXQub3B0aW9ucy5hY3RpdmVDbGFzcyk7XG4gICAgICAgIH0sXG4gICAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgICAgLy8gZG8gdGhlIGxheW91dCBjYWxjdWxhdGlvbnNcbiAgICAgICAgX2xheW91dFBhbmVsczogZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgIHZhciAkcGFnZXMgPSB0aGlzLnBhbmVscy5maW5kKCcuJyArIHRoaXMub3B0aW9ucy5wYWdlQ2xhc3MpO1xuXG4gICAgICAgICAgICAvLyBnbyB0aHJvdWdoIGVhY2ggcGFnZSBhbmQgcmVjb3JkIGl0cyBoZWlnaHRcbiAgICAgICAgICAgICRwYWdlcy5lYWNoKCBmdW5jdGlvbihpbmRleCwgcGFnZSkge1xuICAgICAgICAgICAgICAgIHZhciAkcGFnZSA9ICQocGFnZSk7XG4gICAgICAgICAgICAgICAgJHBhZ2UuY3NzKHtoZWlnaHQ6ICdhdXRvJ30pO1xuICAgICAgICAgICAgICAgICRwYWdlLmRhdGEoJ29yaWdpbmFsSGVpZ2h0JywgJHBhZ2Uub3V0ZXJIZWlnaHQoKSk7XG5cbiAgICAgICAgICAgICAgICAvLyBsZWF2ZSBlYWNoIHBhZ2UgaGlkZGVuLCB3aXRoIGhlaWdodCAwXG4gICAgICAgICAgICAgICAgJHBhZ2UuY3NzKHsgaGVpZ2h0OiAwLCBkaXNwbGF5OiAnbm9uZScgfSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gZ28gdGhyb3VnaCBlYWNoIHBhbmVsIGFuZCBoaWRlIGl0XG4gICAgICAgICAgICB0aGlzLnBhbmVscy5lYWNoKCBmdW5jdGlvbihpbmRleCwgcGFuZWwpIHtcbiAgICAgICAgICAgICAgICB2YXIgJHBhbmVsID0gJChwYW5lbCk7XG4gICAgICAgICAgICAgICAgJHBhbmVsLmNzcyh7IGRpc3BsYXk6ICdub25lJyB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgIF9oaWRlUGFuZWxzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMucGFuZWxzLnJlbW92ZUNsYXNzKHRoaXMub3B0aW9ucy5hY3RpdmVDbGFzcykuY3NzKHsgZGlzcGxheTogJ25vbmUnLCBoZWlnaHQ6IDAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgICAgX3Nob3dQYW5lbDogZnVuY3Rpb24oZXZlbnQsIGRhdGEpIHtcbiAgICAgICAgICAgIHZhciAkcGFuZWwgPSAkKGRhdGEucGFuZWwpO1xuICAgICAgICAgICAgdmFyIGJhc2UgPSBkYXRhLndpZGdldDtcbiAgICAgICAgICAgIC8vICRwYW5lbCBpcyBhIHBhbmVsIHRvIHNob3cuLlxuICAgICAgICAgICAgaWYgKCRwYW5lbC5oYXNDbGFzcyhiYXNlLm9wdGlvbnMuYWN0aXZlQ2xhc3MpKSB7XG4gICAgICAgICAgICAgICAgLy8gPz9cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYmFzZS5faGlkZVBhbmVscygpO1xuICAgICAgICAgICAgICAgICRwYW5lbC5hZGRDbGFzcyhiYXNlLm9wdGlvbnMuYWN0aXZlQ2xhc3MpO1xuICAgICAgICAgICAgICAgICRwYW5lbC5jc3MoeyBkaXNwbGF5OiAnYmxvY2snLCBvcGFjaXR5OiAxIH0pO1xuICAgICAgICAgICAgICAgIHZhciAkcGFnZSA9ICQoJHBhbmVsLmZpbmQoJy4nICsgYmFzZS5vcHRpb25zLnBhZ2VDbGFzcyArICcuJyArIGJhc2Uub3B0aW9ucy5hY3RpdmVDbGFzcykpO1xuICAgICAgICAgICAgICAgIGJhc2UuX3RyaWdnZXIoJ3Nob3dwYWdlJywgZXZlbnQsIHsgcGFuZWw6ICRwYW5lbCwgcGFnZTogJHBhZ2UsIHdpZGdldDogYmFzZSB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICBfc2hvd1BhZ2U6IGZ1bmN0aW9uKGV2ZW50LCBkYXRhKSB7XG4gICAgICAgICAgICB2YXIgYmFzZSA9IGRhdGEud2lkZ2V0O1xuICAgICAgICAgICAgdmFyICRwYW5lbCA9ICQoZGF0YS5wYW5lbCk7XG4gICAgICAgICAgICB2YXIgJHBhZ2UgPSAkKGRhdGEucGFnZSk7XG4gICAgICAgICAgICB2YXIgbmV3SGVpZ2h0ID0gJHBhZ2UuZGF0YSgnb3JpZ2luYWxIZWlnaHQnKTtcblxuICAgICAgICAgICAgLy8gZml4IHRoZSBwYW5lbCdzIGN1cnJlbnQgaGVpZ2h0XG4gICAgICAgICAgICAkcGFuZWwuY3NzKHtoZWlnaHQ6ICRwYW5lbC5oZWlnaHQoKSB9KTtcblxuICAgICAgICAgICAgLy8gZGVhbCB3aXRoIHRoZSBwYWdlIGN1cnJlbnRseSBiZWluZyBkaXNwbGF5ZWRcbiAgICAgICAgICAgIHZhciAkb2xkUGFnZSA9ICRwYW5lbC5maW5kKCcuJyArIGJhc2Uub3B0aW9ucy5wYWdlQ2xhc3MgKyAnLicgKyBiYXNlLm9wdGlvbnMuYWN0aXZlQ2xhc3MpLm5vdCgkcGFnZSk7XG4gICAgICAgICAgICBpZiAoJG9sZFBhZ2UubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICRvbGRQYWdlLmRhdGEoJ29yaWdpbmFsSGVpZ2h0JywgJG9sZFBhZ2Uub3V0ZXJIZWlnaHQoKSk7XG4gICAgICAgICAgICAgICAgJG9sZFBhZ2UucmVtb3ZlQ2xhc3MoYmFzZS5vcHRpb25zLmFjdGl2ZUNsYXNzKS5mYWRlT3V0KCg1MCAqIGJhc2Uub3B0aW9ucy5hbmltYXRpb25GYWN0b3IpLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgJG9sZFBhZ2UuY3NzKHsgaGVpZ2h0OiAwIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBzd2l0Y2ggb24gdGhlIG5ldyBwYWdlIGFuZCBncm93IHRoZSBvcGFuZWwgdG8gaG9sZCBpdFxuICAgICAgICAgICAgJHBhZ2UuY3NzKHsgaGVpZ2h0OiAnYXV0bycgfSkuYWRkQ2xhc3MoYmFzZS5vcHRpb25zLmFjdGl2ZUNsYXNzKS5mYWRlSW4oKDEwMCAqIGJhc2Uub3B0aW9ucy5hbmltYXRpb25GYWN0b3IpLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAkcGFnZS5yZW1vdmVBdHRyKCdzdHlsZScpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB2YXIgYW5pbVRpbWUgPSAoJG9sZFBhZ2UubGVuZ3RoID4gMCA/ICgxMDAgKiBiYXNlLm9wdGlvbnMuYW5pbWF0aW9uRmFjdG9yKSA6ICgxNTAgKiBiYXNlLm9wdGlvbnMuYW5pbWF0aW9uRmFjdG9yKSk7IC8vIGFuaW1hdGUgZmFzdGVyIGlmIGl0J3Mgc3dpdGNoaW5nIHBhZ2VzXG4gICAgICAgICAgICAkcGFuZWwuYW5pbWF0ZSh7IGhlaWdodDogbmV3SGVpZ2h0IH0sIGFuaW1UaW1lLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAkcGFuZWwucmVtb3ZlQXR0cignc3R5bGUnKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH0sXG4gICAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgICAgXzogbnVsbCAvLyBubyBmb2xsb3dpbmcgY29tbWFcbiAgICB9KTtcblxufSkoalF1ZXJ5LCB3aW5kb3csIGRvY3VtZW50KTtcblxuXG5cblxuXG5cblxuXG5cblxuXG5cbiJdfQ==
