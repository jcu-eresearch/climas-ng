
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
