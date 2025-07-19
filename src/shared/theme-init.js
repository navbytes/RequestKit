// Initialize theme immediately to prevent flash
(function () {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  if (mediaQuery.matches) {
    document.documentElement.classList.add('dark');
    document.body.classList.add('dark');
  }
})();
