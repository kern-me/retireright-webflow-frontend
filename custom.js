/* RetireRight — site-wide custom JS
 * Loaded via jsDelivr, referenced (defer) in Webflow site-wide Footer Code.
 * ADDITIVE: layers on top of anything already in Webflow. Guard every feature
 * so a missing element is a no-op, not an error. Deploy with ./deploy.sh "msg".
 */
(function () {
  'use strict';

  // ===== HIDE "EMPTY" COMPONENT TEXT ELEMENTS =====
  // Webflow injects a zero-width joiner (U+200D) into empty prop-bound text
  // elements to keep them editable, so :empty never matches and unused
  // subtitles/intros leave a visible gap. Treat a node as blank if every char
  // is whitespace or a zero-width char (ZWSP 200B, ZWNJ 200C, ZWJ 200D, BOM FEFF).
  // Media-only rich text is kept.
  function isBlank(s) {
    for (var i = 0; i < s.length; i++) {
      var c = s.charCodeAt(i);
      if (c === 0x200b || c === 0x200c || c === 0x200d || c === 0xfeff) continue;
      if (c > 0x20 && c !== 0xa0) return false; // a real, visible char
    }
    return true;
  }
  document.querySelectorAll('h1,h2,h3,h4,h5,h6,p,.w-richtext').forEach(function (el) {
    if (!isBlank(el.textContent)) return;
    if (el.matches('.w-richtext') && el.querySelector('img,iframe,video,figure')) return;
    el.style.display = 'none';
  });

  // ===== INTERACTIONS =====
  // Add features here. Pattern:
  //   var el = document.querySelector('.thing');
  //   if (!el) return;   // no-op if not on this page
})();
