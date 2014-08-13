
// jquery plugin - hopefully you have jquery loaded already :(
// TODO shim in jquery properly
require('./menusandpanels');



$('header').disableSelection(); // unpopular but still better

// -------------------------- menus, submenus, panels, pages handling
// turn on the mspp plugin for our nav menu
$('nav > ul').mspp({});
