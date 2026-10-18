(function () {
  'use strict';

  var CONTACT_EMAIL = 'jthomas36@lancashire.ac.uk';

  /* ---------- Mobile navigation ---------- */
  var header = document.querySelector('.site-header');
  var toggle = document.querySelector('.nav-toggle');
  var menu = document.getElementById('nav-menu');

  function setMenu(open) {
    toggle.setAttribute('aria-expanded', String(open));
    menu.classList.toggle('is-open', open);
  }

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });

    menu.addEventListener('click', function (event) {
      if (event.target.closest('a')) setMenu(false);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
        toggle.focus();
      }
    });

    document.addEventListener('click', function (event) {
      if (!header.contains(event.target)) setMenu(false);
    });

    window.matchMedia('(min-width: 960px)').addEventListener('change', function (mq) {
      if (mq.matches) setMenu(false);
    });
  }

  /* ---------- Header state on scroll ---------- */
  function onScroll() {
    header.classList.toggle('is-scrolled', window.scrollY > 8);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Highlight the current section in the nav ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-links a'));
  var sections = navLinks
    .map(function (link) { return document.querySelector(link.getAttribute('href')); })
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (link) {
          if (link.getAttribute('href') === '#' + entry.target.id) {
            link.setAttribute('aria-current', 'true');
          } else {
            link.removeAttribute('aria-current');
          }
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (section) { navObserver.observe(section); });
  }

  /* ---------- Scroll reveal ---------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll('.reveal'));

  // Stagger siblings that reveal together, e.g. cards in a grid.
  revealEls.forEach(function (el) {
    var siblings = Array.prototype.filter.call(el.parentElement.children, function (child) {
      return child.classList.contains('reveal');
    });
    var index = siblings.indexOf(el);
    if (index > 0) el.style.setProperty('--reveal-delay', Math.min(index * 0.08, 0.4) + 's');
  });

  function show(el) {
    el.classList.add('is-visible');
    // Clear the stagger once revealed so hover effects respond instantly.
    el.addEventListener('transitionend', function clear() {
      el.style.removeProperty('--reveal-delay');
      el.removeEventListener('transitionend', clear);
    });
  }

  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          show(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -40px 0px', threshold: 0 });
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(show);
  }

  /* ---------- Contact form: compose an email ---------- */
  var form = document.getElementById('contact-form');
  var status = document.getElementById('form-status');

  function fieldError(input, message) {
    var id = input.id + '-error';
    var existing = document.getElementById(id);
    if (message) {
      if (!existing) {
        existing = document.createElement('p');
        existing.className = 'field-error';
        existing.id = id;
        input.insertAdjacentElement('afterend', existing);
      }
      existing.textContent = message;
      input.setAttribute('aria-invalid', 'true');
      input.setAttribute('aria-describedby', id);
    } else {
      if (existing) existing.remove();
      input.removeAttribute('aria-invalid');
      input.removeAttribute('aria-describedby');
    }
  }

  function validate(input) {
    var value = input.value.trim();
    if (input.required && !value) {
      fieldError(input, 'Please fill in your ' + input.labels[0].textContent.trim().toLowerCase() + '.');
      return false;
    }
    if (input.type === 'email' && value && !input.checkValidity()) {
      fieldError(input, 'Please enter a valid email address.');
      return false;
    }
    fieldError(input, null);
    return true;
  }

  if (form) {
    var required = Array.prototype.slice.call(form.querySelectorAll('[required]'));

    required.forEach(function (input) {
      input.addEventListener('blur', function () {
        if (input.getAttribute('aria-invalid') === 'true' || input.value) validate(input);
      });
      input.addEventListener('input', function () {
        if (input.getAttribute('aria-invalid') === 'true') validate(input);
      });
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();

      var invalid = required.filter(function (input) { return !validate(input); });
      if (invalid.length) {
        status.textContent = 'Please check the highlighted fields.';
        invalid[0].focus();
        return;
      }

      var data = new FormData(form);
      var name = data.get('name').trim();
      var org = data.get('organisation').trim();
      var role = data.get('role');

      var subject = 'Groundproof pilot enquiry' + (org ? ' from ' + org : ' from ' + name);
      var body = [
        data.get('message').trim(),
        '',
        '---',
        'Name: ' + name,
        'Email: ' + data.get('email').trim(),
        'Organisation: ' + (org || 'Not given'),
        'I\'m with a: ' + role
      ].join('\n');

      window.location.href = 'mailto:' + CONTACT_EMAIL +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(body);

      status.textContent = 'Your email app should now open with your message. If it does not, email us at ' + CONTACT_EMAIL + '.';
    });
  }

  /* ---------- Footer year ---------- */
  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
