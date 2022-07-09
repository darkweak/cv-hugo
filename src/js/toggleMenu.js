const CLOSED_MENU_ICON = 'M4 6h16M4 12h16M4 18h16';
const OPENED_MENU_ICON = 'M6 18L18 6M6 6l12 12';

function toggleMenu() {
  const classes = document.getElementById('mobile-menu').classList;
  classes.toggle('hidden');
  document.getElementById('menu-icon').setAttribute('d', classes.contains('hidden') ? CLOSED_MENU_ICON : OPENED_MENU_ICON);
}
