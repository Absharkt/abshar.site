(function () {
  var root = document.documentElement;
  var themeBtn = document.getElementById('theme');
  var themeLabel = document.getElementById('theme-label');

  function isDark() {
    var t = root.getAttribute('data-theme');
    return t ? t === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  function updateLabel() {
    themeLabel.textContent = isDark() ? 'Light' : 'Dark';
    themeBtn.setAttribute('aria-label', 'Switch to ' + (isDark() ? 'light' : 'dark') + ' theme');
  }
  themeBtn.addEventListener('click', function () {
    var next = isDark() ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
    updateLabel();
  });
  updateLabel();

  // Download as PDF: opens the print dialog, which has a "Save as PDF" destination
  document.getElementById('download').addEventListener('click', function () {
    window.print();
  });

  // Scroll reveal: stagger the direct children of each section
  var sections = document.querySelectorAll('.sec');
  sections.forEach(function (sec) {
    Array.prototype.forEach.call(sec.children, function (el, i) {
      el.classList.add('reveal-item');
      el.style.setProperty('--i', i);
    });
    sec.querySelectorAll('.entry:not(:first-of-type)').forEach(function (el, i) {
      el.classList.add('reveal-item');
      el.style.setProperty('--i', i + 1);
    });
  });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    sections.forEach(function (s) { io.observe(s); });
  } else {
    sections.forEach(function (s) { s.classList.add('in'); });
  }
})();
