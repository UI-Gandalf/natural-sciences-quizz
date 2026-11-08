/* ==========================================================================
   Physics Γ: two small visuals opened from the 3D circuit simulations (SUPPLEMENTARY, outside the book).
   (1) What happens inside the wire: free electrons move randomly and collide with the (almost still) copper atoms;
       when the switch closes and the electric field acts, they get a small net drift (strongly exaggerated here)
       while still colliding all the time. The real motion of electrons is opposite to the conventional current.
   (2) The "push" (electric field) spreads along the whole circuit at a speed close to that of light, so all the
       (positive, conventional) charges start moving almost at the same time. Shown in extreme slow motion.
   window.PhysGMicro.open('micro' | 'front')
   ========================================================================== */
window.PhysGMicro = (function () {
    'use strict';
    const W = 760, H = 300;
    let overlay = null, raf = 0, current = null, keyHandler = null;

    const fmt = (x, d) => x.toFixed(d).replace('.', ',');
    const rnd = (a, b) => a + Math.random() * (b - a);

    /* ------------------------------------------------------------ visual 1: inside the wire */
    function makeMicro(canvas, ui) {
        const ctx = canvas.getContext('2d');
        const ions = [];
        for (let r = 0; r < 5; r++) for (let c = 0; c < 14; c++) {
            const jx = Math.sin(r * 12.9898 + c * 78.233) * 43758.5453, jy = Math.sin(r * 39.346 + c * 11.135) * 24634.6345;   // fixed pseudo-random offsets
            ions.push({ x: 28 + c * 56 + (r % 2 ? 28 : 0) + ((jx - Math.floor(jx)) - 0.5) * 22, y: 44 + r * 54 + ((jy - Math.floor(jy)) - 0.5) * 22, ph: Math.random() * 6.28 });
        }
        const R_ION = 14, R_E = 5, VTH = 150, ACC = 170;
        let mode = 'real';                                           // 'real' (electrons) or 'conv' (imaginary positive charges)
        const els = [];
        const place = () => { for (let k = 0; k < 400; k++) { const x = rnd(8, W - 8), y = rnd(14, H - 14); if (ions.every((i) => Math.hypot(i.x - x, i.y - y) > R_ION + R_E + 3)) return [x, y]; } return [10, 10]; };
        for (let k = 0; k < 30; k++) { const p = place(), a = rnd(0, 6.283); els.push({ x: p[0], y: p[1], vx: VTH * Math.cos(a), vy: VTH * Math.sin(a), ux: 0 }); }
        let closed = false, time = 0, trail = [];
        let speedF = 1;

        function scatter(e) { const a = rnd(0, 6.283), v = VTH * rnd(0.7, 1.3); e.vx = v * Math.cos(a); e.vy = v * Math.sin(a); }
        function step(dt) {
            time += dt;
            for (const e of els) {
                if (closed) e.vx += (mode === 'real' ? -ACC : ACC) * dt;   // electrons are pushed opposite to the field, positive charges along it
                const sp = Math.hypot(e.vx, e.vy); if (sp > 2.6 * VTH) { e.vx *= 2.6 * VTH / sp; e.vy *= 2.6 * VTH / sp; }
                const nx = e.x + e.vx * dt, ny = e.y + e.vy * dt;
                e.ux += e.vx * dt;
                e.x = nx; e.y = ny;
                if (e.x < -4) { e.x += W + 8; if (e === els[0]) trail.push(null); }
                else if (e.x > W + 4) { e.x -= W + 8; if (e === els[0]) trail.push(null); }
                if (e.y < 12) { e.y = 12; e.vy = Math.abs(e.vy); } else if (e.y > H - 12) { e.y = H - 12; e.vy = -Math.abs(e.vy); }
                for (const i of ions) {
                    const ix = i.x + Math.sin(time * 9 + i.ph) * 1.6, iy = i.y + Math.cos(time * 8 + i.ph) * 1.6;
                    const dx = e.x - ix, dy = e.y - iy, d = Math.hypot(dx, dy);
                    if (d < R_ION + R_E) { const nxn = dx / (d || 1), nyn = dy / (d || 1); e.x = ix + nxn * (R_ION + R_E + 0.5); e.y = iy + nyn * (R_ION + R_E + 0.5); scatter(e); if (nxn * e.vx + nyn * e.vy < 0) { e.vx = -e.vx; e.vy = -e.vy; } }
                }
            }
            trail.push([els[0].x, els[0].y]);
            if (trail.length > 170) trail.shift();
        }
        function draw() {
            const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#78350f'); g.addColorStop(0.5, '#b45309'); g.addColorStop(1, '#78350f');
            ctx.fillStyle = '#0b1220'; ctx.fillRect(0, 0, W, H);
            ctx.fillStyle = g; ctx.globalAlpha = 0.22; ctx.fillRect(0, 8, W, H - 16); ctx.globalAlpha = 1;
            ctx.strokeStyle = '#d97706'; ctx.lineWidth = 3; ctx.strokeRect(1.5, 9.5, W - 3, H - 19);
            for (const i of ions) {
                const ix = i.x + Math.sin(time * 9 + i.ph) * 1.6, iy = i.y + Math.cos(time * 8 + i.ph) * 1.6;
                ctx.beginPath(); ctx.arc(ix, iy, R_ION, 0, 6.283); ctx.fillStyle = '#c2713a'; ctx.fill(); ctx.strokeStyle = '#7c2d12'; ctx.lineWidth = 2; ctx.stroke();
                if (mode === 'real') { ctx.fillStyle = '#fff7ed'; ctx.font = '700 15px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('+', ix, iy + 5); }
            }
            // trail of the highlighted electron
            ctx.strokeStyle = '#fde047'; ctx.lineWidth = 2.5; ctx.beginPath(); let pen = false;
            for (const p of trail) { if (!p) { pen = false; continue; } if (!pen) { ctx.moveTo(p[0], p[1]); pen = true; } else ctx.lineTo(p[0], p[1]); }
            ctx.stroke();
            els.forEach((e, k) => {
                const rr = (mode === 'real' ? R_E : 6) + (k === 0 ? 2 : 0);
                ctx.beginPath(); ctx.arc(e.x, e.y, rr, 0, 6.283); ctx.fillStyle = mode === 'real' ? '#38bdf8' : '#ef4444'; ctx.fill();
                ctx.strokeStyle = k === 0 ? '#fde047' : (mode === 'real' ? '#0c4a6e' : '#fff'); ctx.lineWidth = k === 0 ? 3 : 1.5; ctx.stroke();
                if (mode !== 'real') { ctx.fillStyle = '#fff'; ctx.font = '800 10px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('+', e.x, e.y + 3.5); }
            });
            if (closed) {
                ctx.fillStyle = 'rgba(250,204,21,0.95)'; ctx.fillRect(250, 18, 260, 8); ctx.beginPath(); ctx.moveTo(510, 10); ctx.lineTo(534, 22); ctx.lineTo(510, 34); ctx.closePath(); ctx.fill();
                ctx.fillStyle = '#fef9c3'; ctx.font = '800 14px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('ηλεκτρικό πεδίο Ε', 380, 14);
            }
        }
        function updateUi() {
            const m = els.reduce((s, e) => s + e.ux, 0) / els.length;
            ui.disp.textContent = fmt(Math.abs(m), 0) + ' px ' + (Math.abs(m) < 8 ? '(περίπου μηδέν)' : (m < 0 ? 'προς τα αριστερά' : 'προς τα δεξιά'));
            ui.who.textContent = mode === 'real' ? 'ηλεκτρονίων' : 'θετικών φορτίων';
        }
        function reset() { els.forEach((e) => { e.ux = 0; }); trail = []; }
        let last = 0;
        return {
            frame(now) {
                const dt = Math.min(0.05, last ? (now - last) / 1000 : 0.016) * speedF; last = now;
                for (let k = 0; k < 3; k++) step(dt / 3);
                draw(); updateUi();
            },
            setClosed(c) { closed = c; reset(); },
            setMode(m) { mode = m; reset(); },
            setSpeed(f) { speedF = f; }
        };
    }

    /* ------------------------------------------------------------ visual 2: the push spreads at (almost) the speed of light */
    function makeFront(canvas, ui) {
        const ctx = canvas.getContext('2d');
        const A = [110, 50], B = [650, 50], C = [650, 250], D = [110, 250];
        const segs = [[A, B], [B, C], [C, D], [D, A]];
        const lens = segs.map((s) => Math.hypot(s[1][0] - s[0][0], s[1][1] - s[0][1]));
        const L = lens.reduce((a, b) => a + b, 0);
        const pos = (s) => { s = ((s % L) + L) % L; for (let k = 0; k < 4; k++) { if (s <= lens[k]) { const t = s / lens[k], a = segs[k][0], b = segs[k][1]; return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; } s -= lens[k]; } return A; };
        const S_BAT = lens[0] + lens[1] + lens[2] + lens[3] / 2;          // battery on the left side
        const N = 64, T_FRONT = 5, VD = 38, RAMP = 0.5;                  // the front needs 5 "ns" to reach the far point
        const CF = (L / 2) / T_FRONT;
        const ch = [];
        for (let i = 0; i < N; i++) { const s = i * L / N; const d = Math.min(Math.abs(s - S_BAT), L - Math.abs(s - S_BAT)); ch.push({ s0: s, t0: d / CF, off: 0, on: false }); }
        let t = 0, running = false, closed = false, speedF = 5;
        const sBulb = lens[0] / 2;

        function update(dt) {
            if (!running) return;
            t += dt * speedF;
            ch.forEach((c) => { if (t >= c.t0) { c.on = true; const tt = t - c.t0; c.off = VD * (tt < RAMP ? tt * tt / (2 * RAMP) : (tt - RAMP / 2)); } });
        }
        function draw() {
            ctx.fillStyle = '#0b1220'; ctx.fillRect(0, 0, W, H);
            // wires
            ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 7; ctx.lineJoin = 'round'; ctx.strokeRect(A[0], A[1], B[0] - A[0], D[1] - A[1]);
            // front: glow along the wire on both sides of the battery
            if (running) {
                const f = Math.min(t * CF, L / 2);
                if (f > 0 && t < T_FRONT + 0.9) {
                    ctx.strokeStyle = 'rgba(250, 204, 21, 0.9)'; ctx.lineWidth = 11; ctx.lineCap = 'round';
                    [-1, 1].forEach((dir) => { ctx.beginPath(); for (let u = Math.max(0, f - 90); u <= f; u += 6) { const p = pos(S_BAT + dir * u); if (u === Math.max(0, f - 90)) ctx.moveTo(p[0], p[1]); else ctx.lineTo(p[0], p[1]); } ctx.stroke(); });
                    ctx.lineCap = 'butt';
                }
            }
            // battery (left side)
            ctx.fillStyle = '#0b1220'; ctx.fillRect(D[0] - 14, 118, 28, 64);
            ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(D[0] - 22, 146); ctx.lineTo(D[0] + 22, 146); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(D[0] - 12, 160); ctx.lineTo(D[0] + 12, 160); ctx.stroke();
            ctx.fillStyle = '#fca5a5'; ctx.font = '800 18px sans-serif'; ctx.textAlign = 'left'; ctx.fillText('+', D[0] + 26, 146); ctx.fillStyle = '#93c5fd'; ctx.fillText('−', D[0] + 26, 172);
            ctx.fillStyle = '#cbd5e1'; ctx.font = '700 13px sans-serif'; ctx.fillText('πηγή', D[0] - 56, 152);
            // switch (bottom middle)
            const sw = [380, 250];
            ctx.fillStyle = '#0b1220'; ctx.fillRect(sw[0] - 34, sw[1] - 6, 68, 12);
            ctx.fillStyle = '#e2e8f0'; ctx.beginPath(); ctx.arc(sw[0] - 30, sw[1], 5, 0, 6.283); ctx.arc(sw[0] + 30, sw[1], 5, 0, 6.283); ctx.fill();
            ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(sw[0] - 30, sw[1]); ctx.lineTo(closed ? sw[0] + 30 : sw[0] + 22, closed ? sw[1] : sw[1] - 22); ctx.stroke();
            ctx.fillStyle = '#cbd5e1'; ctx.font = '700 13px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('διακόπτης', sw[0], sw[1] + 28);
            // bulb (top middle): lights when the charges near it move
            const bp = pos(sBulb), near = ch.filter((c) => Math.abs(c.s0 - sBulb) < 60 && c.on).length;
            ctx.fillStyle = '#0b1220'; ctx.beginPath(); ctx.arc(bp[0], bp[1], 24, 0, 6.283); ctx.fill();
            ctx.beginPath(); ctx.arc(bp[0], bp[1], 20, 0, 6.283); ctx.fillStyle = near > 2 ? '#fde047' : '#1e293b'; ctx.fill(); ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 4; ctx.stroke();
            ctx.beginPath(); ctx.moveTo(bp[0] - 12, bp[1] - 12); ctx.lineTo(bp[0] + 12, bp[1] + 12); ctx.moveTo(bp[0] + 12, bp[1] - 12); ctx.lineTo(bp[0] - 12, bp[1] + 12); ctx.stroke();
            ctx.fillStyle = '#cbd5e1'; ctx.font = '700 13px sans-serif'; ctx.fillText('λαμπτήρας', bp[0], bp[1] - 32);
            // positive charges
            ch.forEach((c) => {
                const p = pos(c.s0 + c.off);
                ctx.beginPath(); ctx.arc(p[0], p[1], c.on ? 8 : 6.5, 0, 6.283);
                if (c.on) { ctx.shadowColor = '#f87171'; ctx.shadowBlur = 10; }
                ctx.fillStyle = c.on ? '#ef4444' : '#64748b'; ctx.fill(); ctx.shadowBlur = 0;
                ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke();
                ctx.fillStyle = '#fff'; ctx.font = '800 11px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('+', p[0], p[1] + 4);
            });
        }
        function updateUi() {
            const on = ch.filter((c) => c.on).length;
            ui.clock.textContent = running ? fmt(Math.min(t, T_FRONT), 1) + ' ns' : '0,0 ns';
            ui.count.textContent = on + ' από ' + N;
            ui.msg.textContent = !running ? 'Πάτα «Κλείσιμο διακόπτη».' : (on === N ? 'Όλα τα φορτία έχουν ξεκινήσει μέσα σε ' + fmt(T_FRONT, 0) + ' ns (πέντε δισεκατομμυριοστά του δευτερολέπτου).' : 'Το «μέτωπο» της ώθησης προχωρά στο σύρμα και τα φορτία ξεκινούν καθώς φτάνει σε αυτά.');
        }
        let last = 0;
        return {
            frame(now) { const dt = Math.min(0.05, last ? (now - last) / 1000 : 0.016); last = now; update(dt); draw(); updateUi(); },
            close() { if (running) return; closed = true; running = true; t = 0; },
            reset() { closed = false; running = false; t = 0; ch.forEach((c) => { c.on = false; c.off = 0; }); },
            setSpeed(f) { speedF = f; }
        };
    }

    /* ------------------------------------------------------------ modal */
    function close() {
        cancelAnimationFrame(raf); raf = 0; current = null;
        if (overlay) { overlay.remove(); overlay = null; }
        if (keyHandler) { document.removeEventListener('keydown', keyHandler); keyHandler = null; }
    }

    function show(kind) {
        cancelAnimationFrame(raf);
        const body = overlay.querySelector('.pgm-body');
        overlay.querySelectorAll('.pgm-tab').forEach((b) => b.classList.toggle('on', b.dataset.kind === kind));
        if (kind === 'micro') {
            body.innerHTML =
                '<div class="pgm-ctrl pgm-mode"><span>Δες το:</span><button type="button" class="pgm-btn pgm-sec on" data-mode="real">(i) στην πραγματικότητα</button><button type="button" class="pgm-btn pgm-sec" data-mode="conv">(ii) συμβατικά, με θετικά φορτία</button></div>' +
                '<div class="pgm-note pgm-key" id="pgm-keynote"></div>' +
                '<canvas class="pgm-canvas" width="' + W + '" height="' + H + '"></canvas>' +
                '<div class="pgm-ctrl"><button type="button" class="pgm-btn" id="pgm-sw">Διακόπτης: <b>ανοιχτός</b> (πάτα για κλείσιμο)</button>' +
                '<span class="pgm-meter">Μέση μετατόπιση των <span id="pgm-who">ηλεκτρονίων</span>: <b id="pgm-disp"></b></span></div>' +
                '<ul class="pgm-list"><li><strong style="color:#fbbf24">Ανοιχτός διακόπτης:</strong> τα ελεύθερα φορτία κινούνται γρήγορα προς όλες τις κατευθύνσεις και χτυπούν στα σχεδόν ακίνητα άτομα του χαλκού. Συνολικά δεν πηγαίνουν προς κάποια κατεύθυνση.</li>' +
                '<li><strong style="color:#fbbf24">Κλειστός διακόπτης:</strong> το ηλεκτρικό πεδίο ωθεί όλα τα φορτία προς την ίδια κατεύθυνση. Εξακολουθούν να συγκρούονται συνεχώς, αλλά αποκτούν μια μικρή καθαρή κίνηση προς τη μία πλευρά.</li>' +
                '<li class="pgm-small">Στην πραγματικότητα αυτή η καθαρή κίνηση (ολίσθηση) είναι <strong>πολύ μικρότερη</strong> από την τυχαία ταχύτητα. Εδώ έχει μεγεθυνθεί πολύ ώστε να φαίνεται. Το κίτρινο ίχνος δείχνει τη διαδρομή ενός φορτίου.</li></ul>';
            const canvas = body.querySelector('canvas'), ui = { disp: body.querySelector('#pgm-disp'), who: body.querySelector('#pgm-who') };
            current = makeMicro(canvas, ui);
            const NOTE = {
                realOpen: '<strong>Ο διακόπτης είναι ανοιχτός: δεν υπάρχει ηλεκτρικό πεδίο στο σύρμα.</strong> Η «θάλασσα» των ελεύθερων <strong>ηλεκτρονίων</strong> κινείται τυχαία, χωρίς καμία προτιμώμενη κατεύθυνση, και τα ηλεκτρόνια χτυπούν συνεχώς στα σχεδόν ακίνητα άτομα του χαλκού. Πάτα «Κλείσιμο διακόπτη» για να δεις τι αλλάζει.',
                convOpen: '<strong>Ο διακόπτης είναι ανοιχτός: δεν υπάρχει ηλεκτρικό πεδίο στο σύρμα.</strong> Στη συμβατική εικόνα φανταζόμαστε <strong>θετικά φορτία</strong>, που κινούνται τυχαία, χωρίς καμία προτιμώμενη κατεύθυνση, και χτυπούν στα άτομα του χαλκού. Πάτα «Κλείσιμο διακόπτη» για να δεις τι αλλάζει.',
                realClosed: '<strong>Ο διακόπτης είναι κλειστός και εφαρμόζεται ηλεκτρικό πεδίο.</strong> Αυτό που βλέπεις είναι αυτό που συμβαίνει <strong>στην πραγματικότητα</strong>: τα <strong>ηλεκτρόνια</strong> (αρνητικά φορτία) ωθούνται <strong>αντίθετα</strong> από το πεδίο, δηλαδή αντίθετα από τη συμβατική φορά του ρεύματος. Συνεχίζουν να χτυπούν στα άτομα, αλλά τώρα έχουν και μια μικρή καθαρή κίνηση προς μία κατεύθυνση.',
                convClosed: '<strong>Ο διακόπτης είναι κλειστός και εφαρμόζεται ηλεκτρικό πεδίο.</strong> Στη <strong>συμβατική</strong> εικόνα υποθέτουμε <strong>θετικά φορτία</strong>, που ωθούνται <strong>προς την κατεύθυνση του πεδίου</strong>. Αυτή είναι η συμβατική φορά του ρεύματος. Η πραγματική κίνηση των ηλεκτρονίων είναι αντίθετη.'
            };
            const note = body.querySelector('#pgm-keynote');
            let sw = false, md = 'real';
            const refresh = () => { note.innerHTML = NOTE[md + (sw ? 'Closed' : 'Open')]; };
            refresh();
            body.querySelectorAll('[data-mode]').forEach((b) => b.addEventListener('click', () => {
                md = b.dataset.mode; current.setMode(md); refresh();
                body.querySelectorAll('[data-mode]').forEach((x) => x.classList.toggle('on', x === b));
            }));
            const btn = body.querySelector('#pgm-sw');
            btn.addEventListener('click', () => { sw = !sw; current.setClosed(sw); refresh(); btn.innerHTML = 'Διακόπτης: <b>' + (sw ? 'κλειστός' : 'ανοιχτός') + '</b> (πάτα για ' + (sw ? 'άνοιγμα' : 'κλείσιμο') + ')'; btn.classList.toggle('closed', sw); });
        } else {
            body.innerHTML =
                '<div class="pgm-note pgm-key">Όταν κλείνει ο διακόπτης, η «ώθηση» (το ηλεκτρικό πεδίο) διαδίδεται στο σύρμα με ταχύτητα <strong>κοντά σε αυτή του φωτός</strong>. Για να τη δεις, η κίνηση εμφανίζεται <strong>δισεκατομμύρια φορές πιο αργά</strong>: 1 δευτερόλεπτο στην οθόνη αντιστοιχεί σε 5 ns (δισεκατομμυριοστά του δευτερολέπτου). Εδώ τα φορτία είναι τα συμβατικά θετικά.</div>' +
                '<canvas class="pgm-canvas" width="' + W + '" height="' + H + '"></canvas>' +
                '<div class="pgm-ctrl"><button type="button" class="pgm-btn" id="pgm-close">Κλείσιμο διακόπτη</button><button type="button" class="pgm-btn pgm-sec" id="pgm-reset">Επανάληψη</button>' +
                '<span class="pgm-meter">Χρόνος: <b id="pgm-clock"></b> · Φορτία που κινούνται: <b id="pgm-count"></b></span></div>' +
                '<div class="pgm-ctrl"><span class="pgm-msg" id="pgm-msg"></span></div>' +
                '<ul class="pgm-list"><li>Τα γκρι φορτία είναι ακίνητα. Το κίτρινο «μέτωπο» ξεκινά από την πηγή και τρέχει προς τις δύο κατευθύνσεις του κυκλώματος. Κάθε φορτίο ξεκινά όταν το φτάσει.</li>' +
                '<li>Μέσα σε ελάχιστα ns <strong>όλα τα φορτία του κυκλώματος έχουν ξεκινήσει σχεδόν ταυτόχρονα</strong>, γι’ αυτό ο λαμπτήρας ανάβει αμέσως.</li>' +
                '<li class="pgm-small">Η μετακίνηση των φορτίων έχει μεγεθυνθεί πολύ ώστε να φαίνεται. Στην πραγματικότητα, στο ίδιο διάστημα τα φορτία δεν προλαβαίνουν να μετακινηθούν ούτε κατά ένα ελάχιστο κλάσμα του χιλιοστού.</li></ul>';
            const canvas = body.querySelector('canvas'), ui = { clock: body.querySelector('#pgm-clock'), count: body.querySelector('#pgm-count'), msg: body.querySelector('#pgm-msg') };
            current = makeFront(canvas, ui);
            body.querySelector('#pgm-close').addEventListener('click', () => current.close());
            body.querySelector('#pgm-reset').addEventListener('click', () => current.reset());
        }
        const loop = (now) => { if (!current) return; current.frame(now); raf = requestAnimationFrame(loop); };
        raf = requestAnimationFrame(loop);
    }

    function open(kind) {
        close();
        overlay = document.createElement('div');
        overlay.className = 'pgm-overlay';
        overlay.innerHTML = '<div class="pgm-panel" role="dialog" aria-modal="true" aria-label="Οπτικοποίηση κίνησης των φορτίων">' +
            '<div class="pgm-top"><div class="pgm-tabs"><button type="button" class="pgm-tab" data-kind="micro">① Μέσα στο καλώδιο</button><button type="button" class="pgm-tab" data-kind="front">② Σε όλο το κύκλωμα</button></div>' +
            '<button type="button" class="pgm-x" aria-label="Κλείσιμο">✕</button></div><div class="pgm-body"></div></div>';
        (document.fullscreenElement || document.body).appendChild(overlay);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay || e.target.closest('.pgm-x')) close();
            const t = e.target.closest('.pgm-tab'); if (t) show(t.dataset.kind);
        });
        keyHandler = (e) => { if (e.key === 'Escape') close(); };
        document.addEventListener('keydown', keyHandler);
        show(kind === 'front' ? 'front' : 'micro');
    }

    return { open, close };
})();
