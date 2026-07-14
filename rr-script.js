  document.querySelectorAll('.faq-q').forEach(q => {
    q.addEventListener('click', () => {
      const item = q.parentElement;
      const wasOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      if (!wasOpen) item.classList.add('open');
    });
  });

  // ── SCORE QUIZ ──
  const answers = {};

  function goToQ(n) {
    document.querySelectorAll('.quiz-slide').forEach(s => s.classList.remove('active'));
    const target = document.querySelector('[data-q="' + n + '"]');
    if (target) target.classList.add('active');
    document.getElementById('q-current').textContent = n;
    document.getElementById('q-progress').style.width = (n / 6 * 100) + '%';
  }

  document.querySelectorAll('.quiz-option').forEach(btn => {
    btn.addEventListener('click', () => {
      const slide = btn.closest('.quiz-slide');
      slide.querySelectorAll('.quiz-option').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      const qNum = parseInt(slide.dataset.q);
      answers[qNum] = parseInt(btn.dataset.score);
      const nextBtn = document.getElementById('next-' + qNum);
      if (nextBtn) nextBtn.classList.add('enabled');
    });
  });

  document.querySelectorAll('.quiz-btn-next').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!btn.classList.contains('enabled')) return;
      const slide = btn.closest('.quiz-slide');
      const qNum = parseInt(slide.dataset.q);
      if (btn.dataset.finish === 'true') {
        showResults();
      } else {
        goToQ(qNum + 1);
      }
    });
  });

  document.querySelectorAll('.quiz-btn-back').forEach(btn => {
    btn.addEventListener('click', () => goToQ(parseInt(btn.dataset.back) - 1));
  });

  function showResults() {
    if (answers[6] === undefined) return;
    // Each pillar scores 0–25; Q2+Q5 averaged for income (both cover Pillar 01)
    const income = Math.round(((answers[2] || 0) + (answers[5] || 0)) / 2);
    const tax = answers[3] || 0;
    const invest = answers[4] || 0;
    const legacy = answers[6] || 0;
    const total = income + tax + invest + legacy; // true 0–100 (bug from original removed)

    let msg;
    if (total >= 80) {
      msg = "You've done the hard work — which means a review here isn't about catching up. It's about the second-order opportunities: multi-year Roth conversions, IRMAA timing, sequence-of-returns positioning. The clients who score highest often save the most from a coordinated plan, because they have the assets to make optimization meaningful.";
    } else if (total >= 55) {
      msg = "You've covered some of the ground but have meaningful gaps — most likely in tax strategy or investment positioning for retirement. These are exactly the kind of gaps that compound: a withdrawal sequence that costs you 2% a year in taxes, repeated over 25 years, is six figures.";
    } else {
      msg = "Several important pieces of your retirement plan aren't in place yet. That's not unusual — most pre-retirees haven't run the numbers across all four pillars together. A RetireRight Formula review will show you exactly where the gaps are and what they're costing.";
    }

    document.getElementById('score-display').innerHTML = total + '<span>/100</span>';
    document.getElementById('score-message').textContent = msg;

    document.getElementById('quiz-body').style.display = 'none';
    document.getElementById('score-results').classList.add('active');

    setTimeout(() => {
      document.getElementById('bar-income').style.width = (income / 25 * 100) + '%';
      document.getElementById('bar-tax').style.width = (tax / 25 * 100) + '%';
      document.getElementById('bar-invest').style.width = (invest / 25 * 100) + '%';
      document.getElementById('bar-legacy').style.width = (legacy / 25 * 100) + '%';
      document.getElementById('num-income').textContent = income + '/25';
      document.getElementById('num-tax').textContent = tax + '/25';
      document.getElementById('num-invest').textContent = invest + '/25';
      document.getElementById('num-legacy').textContent = legacy + '/25';
    }, 200);

    document.getElementById('q-current').textContent = '✓';
    document.getElementById('q-progress').style.width = '100%';
  }

  const restartBtn = document.getElementById('quiz-restart');
  if (restartBtn) restartBtn.addEventListener('click', () => {
    Object.keys(answers).forEach(k => delete answers[k]);
    document.querySelectorAll('.quiz-option').forEach(b => b.classList.remove('selected'));
    document.querySelectorAll('.quiz-btn-next').forEach(b => b.classList.remove('enabled'));
    document.getElementById('quiz-body').style.display = 'block';
    document.getElementById('score-results').classList.remove('active');
    document.querySelectorAll('.score-bar-fill').forEach(b => b.style.width = '0');
    goToQ(1);
  });

  // ── MOBILE NAV (hamburger drawer, ≤980px) ──
  // Injected here rather than added as Webflow markup so the whtml build can't
  // drop its classes; the drawer must live on #rr-lp (not inside <nav>, whose
  // backdrop-filter would make position:fixed relative to the nav, not viewport).
  (function () {
    const root = document.getElementById('rr-lp');
    const nav = root && root.querySelector('nav');
    const navLinks = nav && nav.querySelector('.nav-links');
    if (!nav || !navLinks) return;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'nav-hamburger';
    btn.setAttribute('aria-label', 'Open menu');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', 'rr-nav-drawer');
    btn.innerHTML = '<span class="nav-hamburger-box" aria-hidden="true">'
      + '<span class="nav-hamburger-line"></span>'
      + '<span class="nav-hamburger-line"></span>'
      + '<span class="nav-hamburger-line"></span></span>';
    nav.appendChild(btn);

    const overlay = document.createElement('div');
    overlay.className = 'nav-drawer-overlay';

    const drawer = document.createElement('nav');
    drawer.id = 'rr-nav-drawer';
    drawer.className = 'nav-drawer';
    drawer.setAttribute('aria-label', 'Site menu');

    const list = document.createElement('ul');
    list.className = 'nav-drawer-list';
    navLinks.querySelectorAll('a').forEach(a => {
      const li = document.createElement('li');
      li.appendChild(a.cloneNode(true));
      list.appendChild(li);
    });
    drawer.appendChild(list);
    root.appendChild(overlay);
    root.appendChild(drawer);

    let isOpen = false;

    // Focus ring, in the exact tab order we want: drawer links first, then the
    // close button (the morphed X) last. The close button lives in <nav> and the
    // drawer is mounted at the end of #rr-lp, so they're far apart in the DOM —
    // we can't rely on natural tab order. Intercept EVERY Tab and drive focus
    // through this ring so it cycles links → close → links and never escapes.
    function ring() {
      return [...drawer.querySelectorAll('a[href], button:not([disabled])'), btn];
    }

    function onKeydown(e) {
      if (e.key === 'Escape') { e.preventDefault(); close(); return; }
      if (e.key !== 'Tab') return;
      const items = ring();
      if (!items.length) return;
      e.preventDefault();
      let i = items.indexOf(document.activeElement);
      if (e.shiftKey) i = (i <= 0 ? items.length - 1 : i - 1);
      else i = (i >= items.length - 1 ? 0 : i + 1);
      items[i].focus();
    }

    function open() {
      if (isOpen) return;
      isOpen = true;
      overlay.classList.add('open');
      drawer.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
      btn.setAttribute('aria-label', 'Close menu');
      document.body.style.overflow = 'hidden';   // lock background scroll
      document.addEventListener('keydown', onKeydown);
      // Focus the first link on the next frame — the drawer is visibility:hidden
      // until styles apply, and you can't focus inside a hidden subtree.
      requestAnimationFrame(() => requestAnimationFrame(() => {
        const first = drawer.querySelector('a[href]');
        if (first && isOpen) first.focus();
      }));
    }

    function close(returnFocus) {
      if (!isOpen) return;
      isOpen = false;
      overlay.classList.remove('open');
      drawer.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-label', 'Open menu');
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKeydown);
      if (returnFocus !== false) btn.focus();
    }

    btn.addEventListener('click', () => { isOpen ? close() : open(); });
    overlay.addEventListener('click', () => close());
    // Following an in-page anchor: close but let the page scroll (don't yank focus back up).
    list.addEventListener('click', (e) => { if (e.target.closest('a')) close(false); });
    // Resized back to desktop while open → tidy up.
    window.matchMedia('(min-width: 981px)').addEventListener('change', (e) => {
      if (e.matches && isOpen) close(false);
    });
  })();

  // ── FRAMEWORK VIDEO (inline play) ──
  const fwVideo = document.getElementById('framework-video');
  const fwOverlay = document.getElementById('framework-overlay');
  if (fwVideo && fwOverlay) {
    fwOverlay.addEventListener('click', () => {
      fwOverlay.classList.add('hidden');
      fwVideo.setAttribute('controls', '');
      const p = fwVideo.play();
      if (p) p.catch(() => {});
    });
    fwVideo.addEventListener('pause', () => {
      if (fwVideo.currentTime < 0.1) fwOverlay.classList.remove('hidden');
    });
  }

  /* Superscript the trademark symbol in display type. The .tm rule already lives in
     rr-lp.css; only the markup is missing. Done here rather than in the Webflow DOM
     because data_whtml_builder drops classes on elements it touches.
     Display type only — the small labels and FAQ body copy read fine at Inter size. */
  (function wrapTrademarks() {
    var TM = '\u2122';   // escaped: the literal glyph is easy to mangle in an editor
    var TARGETS = '#rr-lp .quiz-head h2, #rr-lp .quiz-header-title, #rr-lp .process-step h3';

    document.querySelectorAll(TARGETS).forEach(function (el) {
      var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      var nodes = [];
      var n;
      while ((n = walker.nextNode())) {
        if (n.nodeValue.indexOf(TM) === -1) continue;
        if (n.parentElement.classList.contains('tm')) continue;   // already wrapped
        nodes.push(n);
      }
      nodes.forEach(function (node) {
        var frag = document.createDocumentFragment();
        node.nodeValue.split(TM).forEach(function (part, i) {
          if (i > 0) {
            var sup = document.createElement('span');
            sup.className = 'tm';
            sup.textContent = TM;
            frag.appendChild(sup);
          }
          if (part) frag.appendChild(document.createTextNode(part));
        });
        node.parentNode.replaceChild(frag, node);
      });
    });
  })();