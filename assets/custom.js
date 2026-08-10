/* ============================================================
   Jehovah Jireh — custom.js
   Task 9 QA fix: cart-drawer focus-trap escape (pre-existing Dawn bug,
   assets/global.js trapFocus() + assets/cart-drawer.js open() — neither
   file is edited by this project).

   Root cause: for an EMPTY cart, open() calls
   trapFocus(container = '.drawer__inner-empty', elementToFocus =
   '.drawer__inner'). elementToFocus is an ANCESTOR of container, not a
   member of getFocusableElements(container)'s first/last list — so the
   focusin fired by that initial .focus() call doesn't match
   container/first/last, and global.js's focusin handler (line ~96) bails
   without arming the Tab-trap keydown listener. Reproduced live: Shift+Tab
   as the very first keystroke after opening an empty cart drawer escapes
   straight to the page's skip-to-content link — confirmed via real
   Input.dispatchKeyEvent Tab presses against the unmodified, server-
   rendered empty-cart markup (no synthetic content). Forward Tab is
   unaffected (the first forward Tab happens to land on the container's
   first focusable element anyway, arming the trap by accident).

   Fix: an independent capture-phase safety net, scoped to this project's
   own cart-drawer only. While a <cart-drawer class="active"> exists, any
   focusin landing outside it is redirected back to its first focusable
   element (recomputed with Dawn's own getFocusableElements() selector,
   global.js line ~4). Runs in the capture phase so it sees the escaped
   focus before app code does; only acts when focus has actually left an
   open drawer, so it never interferes with Dawn's own trap while that
   trap is working correctly (forward Tab, Escape-to-close, etc.).
   ============================================================ */
document.addEventListener(
  'focusin',
  function (event) {
    var drawer = document.querySelector('cart-drawer.active');
    if (!drawer || drawer.contains(event.target)) return;
    var focusable = drawer.querySelectorAll(
      "summary, a[href], button:enabled, [tabindex]:not([tabindex^='-']), [draggable], area, input:not([type=hidden]):enabled, select:enabled, textarea:enabled, object, iframe"
    );
    if (focusable.length) focusable[0].focus();
  },
  true
);
