/* ==========================================================================
   Physics Γ: "Οδηγός επιβίωσης: ηλεκτρικά κυκλώματα" - slide show (14 slides, images from the NotebookLM presentation).
   Two ways to watch: manual (buttons, arrow keys, swipe, thumbnails) or automatic (play / pause, seconds per slide).
   window.SurvivalSlides.render(mountElement), window.SurvivalSlides.stop()
   ========================================================================== */
window.SurvivalSlides = (function () {
    'use strict';
    const N = 14;
    const src = (i) => 'assets/images/survival/s' + String(i + 1).padStart(2, '0') + '.jpg';
    let timer = null;
    function stop() { if (timer) { clearInterval(timer); timer = null; } const b = document.getElementById('ss-play'); if (b) { b.classList.remove('on'); b.innerHTML = '▶ Αυτόματη αναπαραγωγή'; } }

    function render(mount) {
        stop();
        let cur = 0;
        mount.innerHTML =
            '<div class="ss-wrap">' +
            '<div class="sv-head"><h2>📊 Οδηγός επιβίωσης: ηλεκτρικά κυκλώματα</h2>' +
            '<p>14 διαφάνειες για τη <strong>σειρά</strong>, τα <strong>παράλληλα</strong> και το <strong>βραχυκύκλωμα</strong>. Μπορείς να τις προχωράς <strong>μόνος/η σου</strong> (κουμπιά, βέλη του πληκτρολογίου, σύρσιμο με το δάχτυλο ή κλικ στις μικρογραφίες) ή να τις αφήσεις να παίζουν <strong>αυτόματα</strong>.</p></div>' +
            '<div class="ss-stage" id="ss-stage" tabindex="0">' +
            '<img id="ss-img" class="ss-img" alt="Διαφάνεια 1" src="' + src(0) + '">' +
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
        th.innerHTML = Array.from({ length: N }, (_, i) => '<button type="button" class="ss-th" data-i="' + i + '" aria-label="Διαφάνεια ' + (i + 1) + '"><img loading="lazy" src="' + src(i) + '" alt=""><b>' + (i + 1) + '</b></button>').join('');
        let secs = 10, t0 = 0;
        const go = (i) => {
            cur = (i + N) % N; img.src = src(cur); img.alt = 'Διαφάνεια ' + (cur + 1);
            cnt.textContent = 'Διαφάνεια ' + (cur + 1) + ' / ' + N;
            th.querySelectorAll('.ss-th').forEach((b, k) => b.classList.toggle('now', k === cur));
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
