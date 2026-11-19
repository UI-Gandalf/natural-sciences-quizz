/* ==========================================================================
   Physics Γ: "Οδηγός επιβίωσης: ηλεκτρικά κυκλώματα" - slide show (14 slides, images from the NotebookLM presentation).
   Two ways to watch: manual (buttons, arrow keys, swipe, thumbnails) or automatic (play / pause, seconds per slide).
   window.SurvivalSlides.render(mountElement), window.SurvivalSlides.stop()
   ========================================================================== */
window.SurvivalSlides = (function () {
    'use strict';
    const SETS = {
        survival: { n: 14, dir: 'survival/s', title: 'Οδηγός επιβίωσης: ηλεκτρικά κυκλώματα', intro: '14 διαφάνειες για τη <strong>σειρά</strong>, τα <strong>παράλληλα</strong> και το <strong>βραχυκύκλωμα</strong>.' },
        geomosaic: { n: 11, dir: 'geomosaic/g', title: 'Το θαλάσσιο ψηφιδωτό της Ευρώπης', intro: '11 διαφάνειες για τις θάλασσες της Ευρώπης: καταγωγή, Βόρεια Θάλασσα, Βαλτική, Μεσόγειος και ο άνθρωπος.' },
        chemacid: { n: 30, out: [28, 29], dir: 'chemacid/c', title: 'Οξέα, βάσεις και εξουδετέρωση', intro: '30 διαφάνειες (οι δύο τελευταίες είναι ΕΚΤΟΣ ΥΛΗΣ): ιδιότητες οξέων και βάσεων, θεωρίες, δείκτες, κλίμακα pH, αραίωση και συμπύκνωση, εξουδετέρωση, και οι εφαρμογές τους στο σώμα μας, στη φύση, στο νοικοκυριό, στη διατροφή, στη βιομηχανία και στο περιβάλλον.' },
        bioarch: { n: 15, dir: 'bioarch/b', title: 'Στήριξη & Κίνηση: η αρχιτεκτονική της ζωής', intro: '15 διαφάνειες για τη <strong>στήριξη</strong> και την <strong>κίνηση</strong>: από τους μονοκύτταρους οργανισμούς και τα φυτά, μέχρι τα ζώα και το ανθρώπινο μυοσκελετικό σύστημα.' }
    };
    let N = 14, src = (i) => 'assets/images/survival/s' + String(i + 1).padStart(2, '0') + '.jpg';
    let timer = null;
    function stop() { if (timer) { clearInterval(timer); timer = null; } const b = document.getElementById('ss-play'); if (b) { b.classList.remove('on'); b.innerHTML = '▶ Αυτόματη αναπαραγωγή'; } }

    function render(mount, key) {
        stop();
        const set = SETS[key || 'survival']; N = set.n; src = (i) => 'assets/images/' + set.dir + String(i + 1).padStart(2, '0') + '.jpg';
        let cur = 0;
        mount.innerHTML =
            '<div class="ss-wrap">' +
            '<div class="sv-head"><h2>📊 ' + set.title + '</h2>' +
            '<p>' + set.intro + ' Μπορείς να τις προχωράς <strong>μόνος/η σου</strong> (κουμπιά, βέλη του πληκτρολογίου, σύρσιμο με το δάχτυλο ή κλικ στις μικρογραφίες) ή να τις αφήσεις να παίζουν <strong>αυτόματα</strong>.</p></div>' +
            '<div class="ss-stage" id="ss-stage" tabindex="0">' +
            '<img id="ss-img" class="ss-img" alt="Διαφάνεια 1" src="' + src(0) + '">' +
            '<div class="ss-out" id="ss-out" hidden>ΕΚΤΟΣ ΥΛΗΣ <small>δεν ζητείται</small></div>' +
            '<button type="button" class="ss-nav ss-prev" id="ss-prev" aria-label="Προηγούμενη διαφάνεια">‹</button>' +
            '<button type="button" class="ss-nav ss-next" id="ss-next" aria-label="Επόμενη διαφάνεια">›</button>' +
            '<div class="ss-prog"><div class="ss-prog-bar" id="ss-bar"></div></div></div>' +
            '<div class="sv-bar ss-bar2">' +
            '<button type="button" class="sv-btn" id="ss-b-prev">⏮ Προηγούμενη</button>' +
            '<span class="ss-count" id="ss-count"></span>' +
            '<button type="button" class="sv-btn" id="ss-b-next">Επόμενη ⏭</button>' +
            '<button type="button" class="sv-btn" id="ss-play">▶ Αυτόματη αναπαραγωγή</button>' +
            '<label class="sv-size">Χρόνος ανά διαφάνεια <select id="ss-sec"><option value="6">6 δευτ.</option><option value="10" selected>10 δευτ.</option><option value="15">15 δευτ.</option><option value="25">25 δευτ.</option></select></label>' +
            '<button type="button" class="sv-btn" id="ss-full">⛶ Πλήρης οθόνη</button></div>' +
            '<div class="ss-thumbs" id="ss-thumbs"></div></div>';
        const $ = (s) => mount.querySelector(s);
        const img = $('#ss-img'), cnt = $('#ss-count'), th = $('#ss-thumbs'), stage = $('#ss-stage'), bar = $('#ss-bar'), play = $('#ss-play');
        const OUT = set.out || [];                    // slides marked "ΕΚΤΟΣ ΥΛΗΣ" (0-based)
        th.innerHTML = Array.from({ length: N }, (_, i) => '<button type="button" class="ss-th' + (OUT.indexOf(i) >= 0 ? ' ss-th-out' : '') + '" data-i="' + i + '" aria-label="Διαφάνεια ' + (i + 1) + (OUT.indexOf(i) >= 0 ? ' (εκτός ύλης)' : '') + '"><img loading="lazy" src="' + src(i) + '" alt=""><b>' + (i + 1) + '</b>' + (OUT.indexOf(i) >= 0 ? '<i class="ss-th-tag">ΕΚΤΟΣ ΥΛΗΣ</i>' : '') + '</button>').join('');
        let secs = 10, t0 = 0;
        const go = (i) => {
            cur = (i + N) % N; img.src = src(cur); img.alt = 'Διαφάνεια ' + (cur + 1);
            cnt.textContent = 'Διαφάνεια ' + (cur + 1) + ' / ' + N;
            th.querySelectorAll('.ss-th').forEach((b, k) => b.classList.toggle('now', k === cur));
            const ob = $('#ss-out'); if (ob) ob.hidden = OUT.indexOf(cur) < 0;
            const nb = new Image(); nb.src = src((cur + 1) % N);            // preload the next one
            t0 = Date.now();
        };
        const start = () => {
            stop(); play.classList.add('on'); play.innerHTML = '⏸ Παύση'; t0 = Date.now();
            timer = setInterval(() => {
                if (!document.body.contains(mount)) { stop(); return; }
                const p = (Date.now() - t0) / (secs * 1000);
                bar.style.width = Math.min(100, p * 100) + '%';
                if (p >= 1) go(cur + 1);
            }, 100);
        };
        const halt = () => { stop(); bar.style.width = '0'; };
        const manual = (i) => { go(i); if (timer) t0 = Date.now(); };
        $('#ss-prev').onclick = $('#ss-b-prev').onclick = () => manual(cur - 1);
        $('#ss-next').onclick = $('#ss-b-next').onclick = () => manual(cur + 1);
        play.onclick = () => { if (timer) halt(); else start(); };
        $('#ss-sec').onchange = (e) => { secs = +e.target.value; t0 = Date.now(); };
        th.onclick = (e) => { const b = e.target.closest('.ss-th'); if (b) manual(+b.dataset.i); };
        stage.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight' || e.key === 'PageDown') { manual(cur + 1); e.preventDefault(); }
            else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { manual(cur - 1); e.preventDefault(); }
            else if (e.key === ' ') { play.click(); e.preventDefault(); }
        });
        let x0 = null;
        stage.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
        stage.addEventListener('touchend', (e) => { if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0; x0 = null; if (Math.abs(dx) > 40) manual(cur + (dx < 0 ? 1 : -1)); });
        $('#ss-full').onclick = () => { if (document.fullscreenElement) document.exitFullscreen(); else if (stage.requestFullscreen) { stage.requestFullscreen().catch(() => {}); stage.focus(); } };
        go(0);
    }
    return { render, stop };
})();
