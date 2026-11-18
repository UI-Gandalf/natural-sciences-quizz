/* Physics Α: audio overview (NotebookLM) "Ακρίβεια εναντίον αξιοπιστίας στις μετρήσεις". window.AudioTab.renderAccuracy(mount) */
window.AudioTab = (function () {
    'use strict';
    const ACC = { src: 'assets/video/accuracy_vs_reliability.mp3', title: '🎧 Ακρίβεια εναντίον αξιοπιστίας στις μετρήσεις',
        text: 'Μια συζήτηση (περίπου 17 λεπτά, στα ελληνικά) για τη <strong>διαφορά ανάμεσα στην ακρίβεια και στην αξιοπιστία</strong> μιας μέτρησης, με αφορμή τη μέτρηση της περιόδου ενός εκκρεμούς. <strong>Ακρίβεια</strong>: πόσο κοντά στην πραγματική τιμή μπορεί να μετρήσει το όργανο. <strong>Αξιοπιστία</strong>: πόσο σταθερά και συνεπή είναι τα αποτελέσματα όταν επαναλαμβάνουμε την ίδια μέτρηση.' };
    const SUPPORT = { src: 'assets/video/support_motion_podcast.m4a', title: '🎧 Στήριξη και κίνηση (podcast)', text: 'Μια συζήτηση (περίπου 20 λεπτά, στα ελληνικά) με μια γενική παρουσίαση της <strong>στήριξης και της κίνησης</strong> στους οργανισμούς.' };
    function render(mount, cfg) {
        mount.innerHTML =
            '<div class="sv-wrap au-wrap">' +
            '<div class="sv-head"><h2>' + cfg.title + '</h2><p>' + cfg.text + '</p></div>' +
            '<div class="au-box"><audio id="au-el" class="au-el" controls preload="metadata" src="' + cfg.src + '" controlslist="nodownload"></audio>' +
            '<div class="au-bar"><label class="sv-size">Ταχύτητα <select id="au-rate"><option value="0.85">0,85×</option><option value="1" selected>1× (κανονική)</option><option value="1.25">1,25×</option><option value="1.5">1,5×</option></select></label>' +
            '<button type="button" class="sv-btn" id="au-back">⏪ 15 δευτ.</button><button type="button" class="sv-btn" id="au-fwd">15 δευτ. ⏩</button>' +
            '<span class="sv-note">Αν δεν παίζει, δοκίμασε άλλον περιηγητή ή ξαναφόρτωσε τη σελίδα.</span></div></div></div>';
        const a = mount.querySelector('#au-el');
        mount.querySelector('#au-rate').addEventListener('change', (e) => { a.playbackRate = +e.target.value; });
        mount.querySelector('#au-back').addEventListener('click', () => { a.currentTime = Math.max(0, a.currentTime - 15); });
        mount.querySelector('#au-fwd').addEventListener('click', () => { a.currentTime = Math.min(a.duration || 1e9, a.currentTime + 15); });
    }
    return { renderAccuracy: (m) => render(m, ACC), renderSupport: (m) => render(m, SUPPORT) };
})();
