/* ==========================================================================
   Physics Γ: "Κύκλωμα σειράς - επεξήγηση σε βίντεο" - the NotebookLM video overview (English) with Greek subtitles.
   The subtitles come from js/series-video-cues.js and are drawn by the page (not by the browser), so they work from any
   host, can be switched on / off, and stay visible in full screen.
   window.SeriesVideo.render(mountElement)
   ========================================================================== */
window.SeriesVideo = (function () {
    'use strict';
        const fmt = (s) => { s = Math.max(0, Math.floor(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };

    const SERIES = { src: 'assets/video/series_circuit_masterclass.mp4', cues: () => window.SERIES_VIDEO_CUES || [], title: 'Κύκλωμα σε σειρά: επεξήγηση σε βίντεο', lead: 'πώς επιλύουμε ένα κύκλωμα <strong>σε σειρά</strong>', min: 5 };
    const PARALLEL = { src: 'assets/video/parallel_circuit_masterclass.mp4', cues: () => window.PARALLEL_VIDEO_CUES || [], title: 'Παράλληλο κύκλωμα: επεξήγηση σε βίντεο', notes: () => window.PARALLEL_VIDEO_NOTES || [], warn: 'Το βίντεο (φτιαγμένο από το NotebookLM) έχει <strong>λάθη</strong>: στο 1:28 λέει «4,8 Ω» αντί για 2 Ω, και από το 3:20 έως το 4:25 οι εικόνες δείχνουν κύκλωμα <strong>σε σειρά</strong>. Σε αυτά τα σημεία εμφανίζεται <strong>πορτοκαλί σημείωση διόρθωσης</strong> πάνω στο βίντεο.', lead: 'πώς επιλύουμε ένα <strong>παράλληλο</strong> κύκλωμα', min: 5 };

    function render(mount, cfg) {
        cfg = cfg || SERIES;
        const cues = cfg.cues();
        mount.innerHTML =
            '<div class="sv-wrap">' +
            '<div class="sv-head"><h2>🎬 ' + cfg.title + '</h2>' +
            '<p>Ένα σύντομο βίντεο (περίπου ' + cfg.min + ' λεπτά) που εξηγεί <strong>βήμα προς βήμα</strong> ' + cfg.lead + '. Το βίντεο είναι στα <strong>αγγλικά</strong>. Με το κουμπί <strong>«Υπότιτλοι»</strong> εμφανίζονται οι <strong>ελληνικοί υπότιτλοι</strong>.</p>' + (cfg.warn ? '<p class="sv-warn">⚠ ' + cfg.warn + '</p>' : '') + '</div>' +
            '<div class="sv-player" id="sv-player">' +
            '<video id="sv-video" class="sv-video" src="' + cfg.src + '" controls preload="metadata" playsinline controlslist="nodownload"></video>' +
            '<div class="sv-sub" id="sv-sub" aria-live="off"></div><div class="sv-fix" id="sv-fix"></div></div>' +
            '<div class="sv-bar"><button type="button" class="sv-btn on" id="sv-cc" aria-pressed="true">✅ Υπότιτλοι ελληνικά: ΕΜΦΑΝΙΖΟΝΤΑΙ <small>(πάτα για να κρυφτούν)</small></button>' +
            '<label class="sv-size">Μέγεθος γραμμάτων <select id="sv-fs"><option value="0.9">Μικρά</option><option value="1.15" selected>Κανονικά</option><option value="1.5">Μεγάλα</option></select></label>' +
            '<button type="button" class="sv-btn" id="sv-full">⛶ Πλήρης οθόνη</button>' +
            '<span class="sv-note">Αν το βίντεο δεν παίζει, δοκίμασε άλλον περιηγητή ή ξαναφόρτωσε τη σελίδα.</span></div>' +
            '<details class="sv-tx"><summary>📄 Δες όλο το κείμενο των υποτίτλων (ελληνικά)</summary><div class="sv-tx-body" id="sv-tx-body"></div></details>' +
            '</div>';
        const v = mount.querySelector('#sv-video'), sub = mount.querySelector('#sv-sub'), cc = mount.querySelector('#sv-cc'), box = mount.querySelector('#sv-player');
        let on = true;
        const fix = mount.querySelector('#sv-fix'), notes = cfg.notes ? cfg.notes() : [];
        const showFix = () => { const t = v.currentTime, n = notes.find((x) => t >= x[0] && t < x[1]); fix.textContent = n ? n[2] : ''; fix.style.display = n ? 'block' : 'none'; };
        v.addEventListener('timeupdate', showFix); v.addEventListener('seeked', showFix);
        const show = () => {
            if (!on) { sub.textContent = ''; sub.style.display = 'none'; return; }
            const t = v.currentTime;
            const c = cues.find((x) => t >= x[0] && t < x[1]);
            sub.textContent = c ? c[2] : '';
            sub.style.display = c ? 'block' : 'none';
        };
        v.addEventListener('timeupdate', show); v.addEventListener('seeked', show); v.addEventListener('play', show);
        cc.addEventListener('click', () => {
            on = !on; cc.classList.toggle('on', on); cc.setAttribute('aria-pressed', String(on));
            cc.innerHTML = on ? '✅ Υπότιτλοι ελληνικά: ΕΜΦΑΝΙΖΟΝΤΑΙ <small>(πάτα για να κρυφτούν)</small>' : '🚫 Υπότιτλοι ελληνικά: ΚΡΥΦΤΟΙ <small>(πάτα για να εμφανιστούν)</small>'; show();
        });
        mount.querySelector('#sv-fs').addEventListener('change', (e) => { box.style.setProperty('--sv-fs', e.target.value); });
        box.style.setProperty('--sv-fs', '1.15');
        mount.querySelector('#sv-full').addEventListener('click', () => {
            if (document.fullscreenElement) document.exitFullscreen();
            else if (box.requestFullscreen) box.requestFullscreen().catch(() => {});
        });
        // clickable transcript: a line jumps to its place in the video
        const tx = mount.querySelector('#sv-tx-body');
        tx.innerHTML = cues.map((c, i) => '<button type="button" class="sv-line" data-i="' + i + '"><b>' + fmt(c[0]) + '</b> ' + c[2] + '</button>').join('');
        tx.addEventListener('click', (e) => { const b = e.target.closest('.sv-line'); if (!b) return; v.currentTime = (cues[+b.dataset.i][0] + 0.01); v.play().catch(() => {}); mount.querySelector('#sv-player').scrollIntoView({ behavior: 'smooth', block: 'center' }); });
        v.addEventListener('timeupdate', () => {
            const t = v.currentTime, i = cues.findIndex((x) => t >= x[0] && t < x[1]);
            tx.querySelectorAll('.sv-line.now').forEach((e) => e.classList.remove('now'));
            if (i >= 0) { const e = tx.querySelector('.sv-line[data-i="' + i + '"]'); if (e) e.classList.add('now'); }
        });
    }
    return { render, renderParallel: (m) => render(m, PARALLEL) };
})();
