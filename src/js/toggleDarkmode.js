function setTheme(theme) {
  localStorage.setItem('theme', theme);
}

function setDarkmode(isdm) {
  const classes = document.documentElement.classList;
  if (isdm) {
    classes.add('dark');
    document.getElementById('dark-mode').setAttribute('d', DARK_MODE);
    setTheme(DARK);
  } else {
    classes.remove('dark');
    document.getElementById('dark-mode').setAttribute('d', LIGHT_MODE);
    setTheme(LIGHT);
  }
}

function toggleDarkMode() {
  setDarkmode(!document.documentElement.classList.contains(DARK))
}

if (localStorage.theme === DARK || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
  setDarkmode(true)
}
