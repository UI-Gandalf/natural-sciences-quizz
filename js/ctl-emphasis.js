/* ==========================================================================
   Makes the link between a control (button, slider, checkbox, choice) and the figure it changes obvious:
   - a short call-to-action label above the control,
   - a short highlight ("pulse") of the figure every time the control is used.
   It works on the controls that are created later by the different pages (MutationObserver), without touching their code.
   ========================================================================== */
(function () {
    'use strict';
    /* [controls selector, how to find the figure from the controls, label text, optional exclude selector] */
    const RULES = [
        ['.bt-ctrl', (c) => c.closest('.bt-stage'), '👆 Πάτησε ένα κουμπί και παρακολούθησε το σχήμα να αλλάζει', '#bt-worm-c, #bt-medusa-c'],
        ['.cell-toolbar', (c) => c.parentElement && c.parentElement.querySelector('.cell-stage'), '👆 Διάλεξε τι θα φαίνεται και παρακολούθησε το σχήμα'],
        ['.neut-controls', (c) => c.closest('.neut-grid'), '👆 Πρόσθεσε οξύ και παρακολούθησε το ποτήρι, το pH και την καμπύλη'],
        ['.ga-pick', (c) => c.parentElement && c.parentElement.querySelector('.ga-fig'), '👆 Διάλεξε τιμές και παρακολούθησε το σχήμα να αλλάζει'],
        ['.bj-side', (c) => document.getElementById('bj-stage'), null]
    ];
    const done = new WeakSet();

    function pulse(fig) {
        if (!fig) return;
        fig.classList.remove('ce-pulse'); void fig.offsetWidth; fig.classList.add('ce-pulse');
    }

    function decorate(root) {
        RULES.forEach(([sel, getFig, text, excl]) => {
            root.querySelectorAll(sel).forEach((c) => {
                if (done.has(c) || (excl && c.matches(excl))) return;
                done.add(c);
                if (text) {
                    const hint = document.createElement('div');
                    hint.className = 'ce-hint';
                    hint.textContent = text;
                    c.parentNode.insertBefore(hint, c);
                }
                const fire = () => pulse(getFig(c));
                c.addEventListener('click', (e) => { if (e.target.closest('button, label, input, select')) fire(); });
                c.addEventListener('input', fire);
                c.addEventListener('change', fire);
            });
        });
    }

    function start() {
        decorate(document);
        let t = 0;
        new MutationObserver(() => { clearTimeout(t); t = setTimeout(() => decorate(document), 60); }).observe(document.body, { childList: true, subtree: true });
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
