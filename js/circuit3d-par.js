/* Physics Γ: 3D simulation of a circuit with TWO RESISTORS (bulbs) IN PARALLEL: battery, switch, two branches.
   window.Circuit3DParallel.render(mount)   (needs js/circuit3d.js first: it shares its helpers)
   Same ideas as the series circuit: drag to rotate, wheel / pinch to zoom, click a component; Ohm's law steps;
   "follow a positive charge" (one branch at a time, with the potential graph); equipotential parts; short circuits.
   In parallel any wire across a resistor short-circuits the source (always a total short circuit), and a wire across the
   source short-circuits it even when the switch is open. Ideal source and wires: the current is then "→ ∞". */
(function () {
    'use strict';
    const HP = window.__c3dHelpers;
    if (!HP) return;
    const { ensureThree, textSprite, cylinderBetween, fmt, fmtTex, fv } = HP;
    const H = 0.6, BX = 1.4;                       // wire height, x of the battery terminals (z = 3)
    const BXK = [1.6, -1.6];                       // x of the two branches (side by side, facing the camera)
    const ZP = -1.6, ZN = -5.6, ZB = -3.6;         // z of the positive rail, of the negative rail and of the bulbs
    const ZIN = ZB + 0.55, ZOUT = ZB - 0.55;       // bulb terminals (the bulbs are turned so that the current flows along z)
    const DX = [1.1, -1.1];                        // sideways offset of the bypass wire around each bulb
    const ZS = 4.5;                                // z of the wire around the source
    const DEFAULT_VIEW = { theta: 0.55, phi: 1.0, radius: 14.5, target: [0, 0.6, -1.2] };
    const EQ_HI = 0xff6a3d, EQ_LO = 0x38bdf8;
    const LET = ['\u0391', '\u0393', '\u0394', '\u0395', '\u0396', '\u0397', '\u0398', '\u0392'];   // Α Γ Δ Ε Ζ Η Θ Β
    const dI = (x) => (x === Infinity ? '→ ∞' : fmt(x, 2));
    const sub = (i) => i + 1;

    /* flat description of the path of a positive charge through branch k: [x, z] points and checkpoints */
    function branchPath(k) {
        const x = BXK[k];
        const pts = [[BX, 3], [4, 3], [4, 0.6], [4, -0.6], [4, ZP], [x, ZP], [x, ZIN], [x, ZOUT], [x, ZN], [-4, ZN], [-4, 3], [-BX, 3]];
        const s = [0];
        for (let i = 1; i < pts.length; i++) s.push(s[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
        const total = s[s.length - 1] + 2 * BX;              // + the way inside the battery
        // checkpoints: A (+ pole), G, D (switch), E (junction), Z, H (bulb), T (junction), B (- pole)
        const cps = [s[0], s[2], s[3], s[5], s[6], s[7], s[8], s[11]];
        return { pts, s, total, cps };
    }
    const BP = [branchPath(0), branchPath(1)];

    function makeParallel(cfg) {
        const state = { V: 12, R: cfg.R.slice(), closed: false, mode: 'standard', speed: 0.5, paused: false, short: null, branch: 0, selected: null };
        let app = null, M = null;
        const q = (id) => (M ? M.querySelector('#' + id) : null);

        /* ------------------------------------------------ physics */
        function elec() {
            const k = state.short, c = state.closed, V = state.V;
            const e = { I: 0, inf: false, Ib: [0, 0], Vb: [0, 0], Vsw: c ? 0 : V, Isw: 0, Iw: 0 };
            if (!k) {
                if (c) { e.Ib = state.R.map((r) => V / r); e.Vb = [V, V]; e.I = e.Ib[0] + e.Ib[1]; e.Isw = e.I; }
                return e;
            }
            if (k === 'source') { e.inf = true; e.I = Infinity; e.Iw = Infinity; e.Vsw = 0; return e; }
            if (c) { e.inf = true; e.I = Infinity; e.Isw = Infinity; e.Iw = Infinity; }      // a wire across a resistor of the parallel pair
            return e;
        }
        const potAt = (k, s) => {
            const p = BP[k], V = state.V, sZ = p.cps[4], sH = p.cps[5], sB = p.cps[7];
            if (s <= sZ) return V;
            if (s <= sH) return V * (1 - (s - sZ) / (sH - sZ));
            if (s <= sB) return 0;
            return V * (s - sB) / (p.total - sB);
        };

        /* ------------------------------------------------ UI */
        function buildUi(mount) {
            M = mount;
            const rRows = state.R.map((_, i) => `
                        <div class="c3d-row"><span>Αντίσταση R<sub>${sub(i)}</sub> <strong id="c3d-rval${i}"></strong></span>
                            <span class="c3d-pair"><button type="button" data-act="r-" data-i="${i}">−1 Ω</button><button type="button" data-act="r+" data-i="${i}">+1 Ω</button></span></div>`).join('');
            const labs = ['battery', 'bulb0', 'bulb1', 'switch'].map((k) => `<div class="c3d-label" id="c3d-lab-${k}"></div>`).join('\n                    ');
            mount.innerHTML = `
        <div class="c3d-wrap">
            <div class="c3d-head">
                <h3>${cfg.title}</h3>
                <p>${cfg.intro}</p>
            </div>
            <div class="c3d-grid">
                <div class="c3d-stage" id="c3d-stage">
                    <button type="button" class="c3d-fs" data-act="fs" id="c3d-fs" title="Πλήρης οθόνη">⛶ Πλήρης οθόνη</button>
                    ${labs}
                    <div class="c3d-label c3d-label-follow" id="c3d-lab-follow" style="display:none"></div>
                    <div class="c3d-label" id="c3d-lab-short" style="display:none"></div>
                    <div class="c3d-shortwarn" id="c3d-shortwarn" hidden></div>
                    <button type="button" class="c3d-exit" data-act="exit">← Έξοδος</button>
                    <button type="button" class="c3d-info" data-act="info" id="c3d-info" aria-expanded="false">ℹ️ Σημαντικές λεπτομέρειες (μικρόκοσμος) που δεν αποτυπώνονται στην προσομοίωση</button>
                    <div class="c3d-infopanel" id="c3d-infopanel" hidden>
                        <button type="button" class="c3d-infox" data-act="info" aria-label="Κλείσιμο">✕</button>
                        <strong>Σημαντικές λεπτομέρειες (μικρόκοσμος) που δεν αποτυπώνονται στην προσομοίωση</strong>
                        <p><b>Η πηγή δεν δίνει ρεύμα ούτε φορτία.</b> Τα φορτία υπάρχουν ήδη σε όλο το κύκλωμα, όπως το νερό μέσα σε έναν γεμάτο σωλήνα. Η πηγή τους προσφέρει <b>ενέργεια</b>, γι' αυτό κινούνται.</p>
                        <p><b>Η κίνηση των φορτίων στο σύρμα είναι πολύ αργή</b> (της τάξης του χιλιοστού ανά δευτερόλεπτο ή και λιγότερο). Ο λαμπτήρας όμως ανάβει σχεδόν αμέσως, γιατί η «ώθηση» που ξεκινά από την πηγή (δηλαδή το ηλεκτρικό πεδίο, που εφαρμόζεται σε όλο το κύκλωμα) διαδίδεται στο σύρμα με ταχύτητα κοντά σε αυτή του φωτός. Έτσι όλα τα φορτία του σύρματος αρχίζουν να κινούνται σχεδόν ταυτόχρονα.</p>
                        <p class="c3d-supp-note">Στην προσομοίωση τα φορτία φαίνονται να κινούνται γρήγορα για να είναι ορατά. Στην πραγματικότητα κινούνται πολύ πιο αργά.</p>
                        <p class="c3d-supp-btns"><button type="button" class="c3d-vbtn" data-act="vis-micro">▶ Δες τι γίνεται μέσα στο καλώδιο</button><button type="button" class="c3d-vbtn" data-act="vis-front">▶ Δες πώς ξεκινούν όλα τα φορτία μαζί</button></p>
                    </div>
                </div>
                <div class="c3d-study" id="c3d-study" style="display:none"></div>
                <div class="c3d-side">
                    <div class="c3d-controls">
                        <button type="button" class="c3d-main-btn" data-act="toggle" id="c3d-toggle">Κλείσιμο διακόπτη</button>
                        <div class="c3d-row"><span>Τάση πηγής <strong id="c3d-vval"></strong></span>
                            <span class="c3d-pair"><button type="button" data-act="v-">−1 V</button><button type="button" data-act="v+">+1 V</button></span></div>${rRows}
                        <fieldset class="c3d-modes">
                            <legend>Λειτουργία προβολής</legend>
                            <label><input type="radio" name="c3d-mode" value="standard" checked> Απλή παρατήρηση του κυκλώματος</label>
                            <label><input type="radio" name="c3d-mode" value="follow"> Παρακολούθηση θετικού φορτίου</label>
                            <label><input type="radio" name="c3d-mode" value="equi"> Ισοδυναμικά τμήματα</label>
                        </fieldset>
                        <fieldset class="c3d-modes" id="c3d-branchbox" hidden>
                            <legend>Από ποιον κλάδο περνά το φορτίο</legend>
                            <label><input type="radio" name="c3d-branch" value="0" checked> Κλάδος του R<sub>1</sub></label>
                            <label><input type="radio" name="c3d-branch" value="1"> Κλάδος του R<sub>2</sub></label>
                        </fieldset>
                        <fieldset class="c3d-modes c3d-shorts" id="c3d-shorts">
                            <legend>Βραχυκύκλωμα</legend>
                            <label><input type="radio" name="c3d-short" value="none" checked> Κανονικό κύκλωμα</label>
                            <label><input type="radio" name="c3d-short" value="r1"> Καλώδιο γύρω από τον R<sub>1</sub></label>
                            <label><input type="radio" name="c3d-short" value="r2"> Καλώδιο γύρω από τον R<sub>2</sub></label>
                            <label><input type="radio" name="c3d-short" value="source"> Βραχυκύκλωμα πηγής: καλώδιο στους πόλους της πηγής</label>
                            <p class="c3d-lock-note" id="c3d-lock-note" hidden>Αν αλλάξεις λειτουργία προβολής, το κύκλωμα επανέρχεται στην αρχική κατάσταση (ανοιχτός διακόπτης, χωρίς βραχυκύκλωμα).</p>
                            <p class="c3d-lock-note c3d-lock-off" id="c3d-lock-off" hidden>Στην «Παρακολούθηση» και στα «Ισοδυναμικά» δεν είναι διαθέσιμα τα βραχυκυκλώματα. Επίλεξε «Απλή παρατήρηση».</p>
                        </fieldset>
                        <div class="c3d-row c3d-speed-row"><span>Ταχύτητα κίνησης</span>
                            <span class="c3d-pair" id="c3d-speeds"><button type="button" data-act="speed" data-speed="0.5">0,5×</button><button type="button" data-act="speed" data-speed="1">1×</button><button type="button" data-act="speed" data-speed="2">2×</button></span></div>
                        <button type="button" data-act="pause" id="c3d-pause" class="c3d-sub-btn">⏸ Παύση κίνησης</button>
                        <button type="button" data-act="view" class="c3d-sub-btn" id="c3d-viewbtn">Επαναφορά κάμερας</button>
                        <button type="button" data-act="restart" class="c3d-sub-btn">Επανεκκίνηση προσομοίωσης</button>
                    </div>
                    <div class="c3d-follow-panel" id="c3d-follow-panel" hidden></div>
                    <div class="c3d-follow-panel c3d-equi-panel" id="c3d-equi-panel" hidden></div>
                    <div class="c3d-ohm" id="c3d-ohm"></div>
                </div>
            </div>
        </div>`;
            mount.addEventListener('change', (e) => {
                const t = e.target;
                if (!t) return;
                if (t.name === 'c3d-short') {
                    state.short = t.value === 'none' ? null : t.value;
                    if (app && app.setShort) app.setShort(state.short);
                    refreshUi();
                } else if (t.name === 'c3d-branch') {
                    state.branch = +t.value;
                    if (app) app.resetFollow();
                    refreshUi();
                } else if (t.name === 'c3d-mode') {
                    // changing the mode while a short circuit is active restores the starting situation
                    if (state.short) { restartAll(mount); return; }
                    state.mode = t.value;
                    if (state.mode === 'follow') state.speed = 0.5;
                    if (app) app.resetFollow();
                    refreshUi();
                }
            });
            mount.addEventListener('click', (e) => {
                const b = e.target.closest('button[data-act]');
                if (!b) return;
                const act = b.dataset.act;
                if (act === 'toggle') setClosed(!state.closed);
                else if (act === 'v-') changeV(-1);
                else if (act === 'v+') changeV(1);
                else if (act === 'r-') changeR(+b.dataset.i, -1);
                else if (act === 'r+') changeR(+b.dataset.i, 1);
                else if (act === 'view') { if (app) app.resetView(); }
                else if (act === 'restart') restartAll(mount);
                else if (act === 'pause') { state.paused = !state.paused; refreshUi(); }
                else if (act === 'speed') { state.speed = parseFloat(b.dataset.speed); refreshUi(); }
                else if (act === 'fs') toggleFullscreen(mount);
                else if (act === 'info') { const pn = q('c3d-infopanel'), bt = q('c3d-info'); if (pn) { pn.hidden = !pn.hidden; if (bt) bt.setAttribute('aria-expanded', String(!pn.hidden)); } }
                else if (act === 'vis-micro' || act === 'vis-front') { if (window.PhysGMicro) window.PhysGMicro.open(act === 'vis-front' ? 'front' : 'micro'); }
                else if (act === 'exit') {
                    if (document.fullscreenElement) document.exitFullscreen();
                    if (typeof switchSubjectTab === 'function') switchSubjectTab('quizzes');
                }
            });
            document.addEventListener('fullscreenchange', () => {
                const b = q('c3d-fs');
                if (b) b.textContent = document.fullscreenElement ? '✕ Έξοδος από πλήρη οθόνη' : '⛶ Πλήρης οθόνη';
            });
        }
        function toggleFullscreen(mount) {
            const wrap = mount.querySelector('.c3d-wrap');
            if (document.fullscreenElement) document.exitFullscreen();
            else if (wrap.requestFullscreen) wrap.requestFullscreen().catch(() => {});
        }
        function restartAll(mount) {
            state.V = 12; state.R = cfg.R.slice(); state.closed = false; state.selected = null; state.mode = 'standard'; state.branch = 0;
            state.speed = 0.5; state.paused = false; state.short = null;
            if (app) { app.setShort(null); app.resetFollow(); app.resetView(); }
            const std = mount.querySelector('input[name="c3d-mode"][value="standard"]'); if (std) std.checked = true;
            const b0 = mount.querySelector('input[name="c3d-branch"][value="0"]'); if (b0) b0.checked = true;
            refreshUi();
        }
        function setClosed(on) { state.closed = on; if (app) app.resetFollow(); refreshUi(); }
        function changeV(d) { state.V = Math.min(24, Math.max(1, state.V + d)); if (app) app.resetFollow(); refreshUi(); }
        function changeR(i, d) { state.R[i] = Math.min(50, Math.max(1, state.R[i] + d)); if (app) app.resetFollow(); refreshUi(); }

        function ohmHtml() {
            const e = elec(), V = state.V, R = state.R, k = state.short, c = state.closed;
            const title = '<div class="c3d-ohm-title">Νόμος του Ohm</div>';
            if (k) {
                const t = k === 'source' ? 'Βραχυκύκλωμα της πηγής' : 'Καλώδιο γύρω από τον αντιστάτη R<sub>' + (k === 'r1' ? 1 : 2) + '</sub> (ολικό βραχυκύκλωμα)';
                const head = '<div class="c3d-ohm-title">' + t + '</div>';
                if (k === 'source') {
                    return head +
                        '<div class="c3d-step" style="--d:0">Το καλώδιο ενώνει <b>απευθείας τους δύο πόλους της πηγής</b>: $R = 0\\ \\Omega$.</div>' +
                        '<div class="c3d-step c3d-step-last" style="--d:1">$I = \\dfrac{V_{\\text{πηγ}}}{0\\ \\Omega} \\to \\infty$ <b>ακόμη και με ' + (c ? 'κλειστό' : 'ανοιχτό') + ' διακόπτη</b></div>' +
                        '<div class="c3d-step" style="--d:2">Στους αντιστάτες: $V_1 = V_2 = 0\\ \\text{V}$ και $I_1 = I_2 = 0\\ \\text{A}$.</div>' +
                        '<p class="c3d-ohm-note c3d-danger" style="--d:3">⚠️ Ο διακόπτης δεν προστατεύει: το καλώδιο βρίσκεται παράλληλα με την πηγή και παρακάμπτει όλο το υπόλοιπο κύκλωμα.</p>';
                }
                if (!c) return head + '<p class="c3d-ohm-note" style="--d:0">Το καλώδιο ενώνει τους δύο κλάδους του κυκλώματος (το ένα άκρο προς τον θετικό και το άλλο προς τον αρνητικό πόλο). Ο διακόπτης είναι ανοιχτός, άρα $I = 0\\ \\text{A}$. Κλείστε τον για να δείτε τι αλλάζει.</p>';
                return head +
                    '<div class="c3d-step" style="--d:0">Στην παράλληλη σύνδεση τα δύο άκρα του αντιστάτη $R_' + (k === 'r1' ? 1 : 2) + '$ είναι ενωμένα με τους δύο πόλους της πηγής. Το καλώδιο ($0\\ \\Omega$) τους ενώνει <b>απευθείας</b>: ολικό βραχυκύκλωμα.</div>' +
                    '<div class="c3d-step c3d-step-last" style="--d:1">$I = \\dfrac{V_{\\text{πηγ}}}{0\\ \\Omega} \\to \\infty$</div>' +
                    '<div class="c3d-step" style="--d:2">$V_1 = V_2 = 0\\ \\text{V}$ και $I_1 = I_2 = 0\\ \\text{A}$: <b>και οι δύο</b> λαμπτήρες σβήνουν.</div>' +
                    '<p class="c3d-ohm-note c3d-danger" style="--d:3">⚠️ Το ρεύμα γίνεται πάρα πολύ μεγάλο (θεωρητικά άπειρο). Στην πράξη τα καλώδια και η πηγή θερμαίνονται επικίνδυνα. Ο διακόπτης μπορεί να το διακόψει.</p>';
            }
            if (!c) return title + '<p class="c3d-ohm-note" style="--d:0">Ο διακόπτης είναι ανοιχτός: δεν υπάρχει κλειστός δρόμος, άρα $I = 0\\ \\text{A}$.<br>Κλείστε τον για να δείτε τον νόμο του Ohm σε κάθε κλάδο.</p>';
            const Req = (R[0] * R[1]) / (R[0] + R[1]);
            return title +
                '<div class="c3d-step" style="--d:0">Παράλληλη σύνδεση: <b>κοινή τάση</b> $V_1 = V_2 = V_{\\text{πηγ}} = ' + V + '\\ \\text{V}$</div>' +
                '<div class="c3d-step" style="--d:1">$I_1 = \\dfrac{V_1}{R_1} = \\dfrac{' + V + '\\ \\text{V}}{' + R[0] + '\\ \\Omega} = ' + fmtTex(e.Ib[0], 2) + '\\ \\text{A}$</div>' +
                '<div class="c3d-step" style="--d:2">$I_2 = \\dfrac{V_2}{R_2} = \\dfrac{' + V + '\\ \\text{V}}{' + R[1] + '\\ \\Omega} = ' + fmtTex(e.Ib[1], 2) + '\\ \\text{A}$</div>' +
                '<div class="c3d-step c3d-step-last" style="--d:3">$I = I_1 + I_2 = ' + fmtTex(e.Ib[0], 2) + ' + ' + fmtTex(e.Ib[1], 2) + ' = ' + fmtTex(e.I, 2) + '\\ \\text{A}$</div>' +
                '<div class="c3d-step" style="--d:4">$R_{\\text{ολ}} = \\dfrac{V_{\\text{πηγ}}}{I} = \\dfrac{' + V + '\\ \\text{V}}{' + fmtTex(e.I, 2) + '\\ \\text{A}} = ' + fmtTex(Req, 2) + '\\ \\Omega$</div>' +
                '<p class="c3d-ohm-note" style="--d:5">Στην παράλληλη σύνδεση η τάση είναι <b>κοινή</b>, ενώ το ρεύμα της πηγής <b>χωρίζεται</b> στους κλάδους: περισσότερο ρεύμα περνά από τον μικρότερο αντιστάτη.</p>';
        }
        function updateShortWarn() {
            const w = q('c3d-shortwarn'); if (!w) return;
            const k = state.short;
            if (!k) { w.hidden = true; return; }
            const e = elec();
            w.hidden = false;
            if (e.inf) { w.className = 'c3d-shortwarn c3d-sw-danger'; w.innerHTML = '⚠️ <b>ΒΡΑΧΥΚΥΚΛΩΜΑ</b>: το ρεύμα είναι πάρα πολύ μεγάλο (θεωρητικά άπειρο). Κίνδυνος θέρμανσης και καταστροφής!'; }
            else { w.className = 'c3d-shortwarn'; w.innerHTML = 'Καλώδιο γύρω από τον R<sub>' + (k === 'r1' ? 1 : 2) + '</sub>: κλείστε τον διακόπτη για να δείτε το ρεύμα.'; }
        }
        function refreshUi() {
            const root = q('c3d-ohm'); if (!root) return;
            q('c3d-vval').textContent = state.V + ' V';
            state.R.forEach((r, i) => { q('c3d-rval' + i).textContent = r + ' Ω'; });
            q('c3d-pause').textContent = state.paused ? '▶ Συνέχεια κίνησης' : '⏸ Παύση κίνησης';
            M.querySelectorAll('#c3d-speeds button').forEach((b) => b.classList.toggle('c3d-on', parseFloat(b.dataset.speed) === state.speed));
            q('c3d-toggle').textContent = state.closed ? 'Άνοιγμα διακόπτη' : 'Κλείσιμο διακόπτη';
            const off = state.mode !== 'standard';
            M.querySelectorAll('input[name="c3d-short"]').forEach((r) => { r.checked = r.value === (state.short || 'none'); r.disabled = off && r.value !== 'none'; });
            const sf = q('c3d-shorts'); if (sf) sf.classList.toggle('c3d-off', off);
            q('c3d-lock-off').hidden = !off;
            q('c3d-lock-note').hidden = !state.short;
            q('c3d-branchbox').hidden = state.mode !== 'follow';
            M.querySelectorAll('input[name="c3d-mode"]').forEach((r) => { r.checked = r.value === state.mode; });
            updateShortWarn();
            root.innerHTML = ohmHtml();
            if (window.renderMath) window.renderMath(root);
            updateFollowPanel();
            updateEquiPanel();
        }

        /* ------------------------------------------------ follow panel (graph) and equipotential panel */
        const gx = (p, s) => 34 + (s / p.total) * 270;
        const gy = (v) => 128 - (v / state.V) * 88;
        function updateFollowPanel() {
            const el = q('c3d-follow-panel'); if (!el) return;
            el.hidden = state.mode !== 'follow';
            if (state.mode !== 'follow') return;
            const k = state.branch, p = BP[k], V = state.V, e = elec();
            const [sA, sG, sD, sE, sZ, sH, sT, sB] = p.cps;
            const curve = [[0, V], [sZ, V], [sH, 0], [sB, 0], [p.total, V]].map(([s, v]) => gx(p, s).toFixed(1) + ',' + gy(v).toFixed(1)).join(' ');
            const dots = p.cps.map((s, i) => '<circle cx="' + gx(p, s).toFixed(1) + '" cy="' + gy(potAt(k, s + (i === 0 ? 0.0001 : 0))).toFixed(1) + '" r="4.5" class="c3d-g-pt"/>').join('');
            const lab = (s, v, name) => '<text x="' + gx(p, s).toFixed(1) + '" y="' + (gy(v) + (v > 0 ? -9 : 17)).toFixed(1) + '" class="c3d-g-txt" text-anchor="middle"><tspan font-weight="700">' + name + '</tspan> ' + fv(v) + ' V</text>';
            const labels = lab(sA, V, LET[0]) + lab((sG + sD) / 2, V, LET[1] + '·' + LET[2]) + lab(sE, V, LET[3]) + lab(sZ, V, LET[4]) + lab(sH, 0, LET[5]) + lab(sT, 0, LET[6]) + lab(sB, 0, LET[7]);
            const list = [[LET[0], 'θετικός πόλος (+)'], [LET[7], 'αρνητικός πόλος (−)'], [LET[1], 'είσοδος διακόπτη'], [LET[2], 'έξοδος διακόπτη'], [LET[3], 'κόμβος: εδώ διακλαδίζεται το ρεύμα'], [LET[4], 'είσοδος λαμπτήρα ' + sub(k)], [LET[5], 'έξοδος λαμπτήρα ' + sub(k)], [LET[6], 'κόμβος: εδώ ενώνονται οι κλάδοι']];
            const note = state.closed
                ? 'Στον λαμπτήρα ' + sub(k) + ' (' + LET[4] + '→' + LET[5] + ') το δυναμικό πέφτει κατά ' + fv(V) + ' V (= I·R = ' + fmt(e.Ib[k], 2) + ' A · ' + state.R[k] + ' Ω). Ο άλλος κλάδος έχει την ίδια πτώση, γιατί συνδέεται στους ίδιους δύο κόμβους. Μέσα στην πηγή (' + LET[7] + '→' + LET[0] + ') το φορτίο «ανεβαίνει» ξανά κατά ' + V + ' V.'
                : 'Κλείστε τον διακόπτη για να ξεκινήσει το φορτίο τη διαδρομή του.';
            el.innerHTML = '<div class="c3d-ohm-title">Δυναμικό κατά μήκος της διαδρομής (κλάδος ' + sub(k) + ')</div>' +
                '<svg viewBox="0 0 320 168" class="c3d-graph" role="img" aria-label="Γράφημα δυναμικού">' +
                '<line x1="34" y1="' + gy(0) + '" x2="308" y2="' + gy(0) + '" class="c3d-g-axis"/><line x1="34" y1="22" x2="34" y2="' + gy(0) + '" class="c3d-g-axis"/>' +
                '<text x="38" y="16" class="c3d-g-cap">δυναμικό V (αρνητικός πόλος = 0 V)</text><text x="308" y="158" class="c3d-g-cap" text-anchor="end">διαδρομή του φορτίου →</text>' +
                '<polyline points="' + curve + '" class="c3d-g-line"/>' + dots + labels + '<circle id="c3d-gdot" cx="' + gx(p, 0) + '" cy="' + gy(V) + '" r="6.5" class="c3d-g-dot"/></svg>' +
                '<ul class="c3d-follow-list">' + list.map((x) => '<li><b>' + x[0] + '</b> ' + x[1] + '</li>').join('') + '</ul>' +
                '<p class="c3d-ohm-note" style="opacity:1;animation:none">' + note + '</p>';
        }
        function updateEquiPanel() {
            const el = q('c3d-equi-panel'); if (!el) return;
            el.hidden = state.mode !== 'equi';
            if (state.mode !== 'equi') return;
            const sw = (c) => '<span class="c3d-sw c3d-sw-' + c + '"></span>';
            const V = state.V;
            let html = '<div class="c3d-ohm-title">Ισοδυναμικά τμήματα του κυκλώματος</div>' +
                '<p class="c3d-eq-line" style="opacity:1">Ισοδυναμικά είναι τα σημεία που βρίσκονται στο ίδιο δυναμικό: ανάμεσά τους δεν υπάρχει τάση.</p>';
            html += state.closed
                ? '<p class="c3d-eq-line">' + sw('h') + '<b>' + V + ' V:</b> από τον θετικό πόλο (' + LET[0] + ') μέσω του κλειστού διακόπτη (' + LET[1] + '→' + LET[2] + ') και του κόμβου (' + LET[3] + '), έως την είσοδο και των δύο λαμπτήρων.</p>' +
                  '<p class="c3d-eq-line">' + sw('l') + '<b>0 V:</b> από την έξοδο και των δύο λαμπτήρων, μέσω του κόμβου (' + LET[6] + '), έως τον αρνητικό πόλο (' + LET[7] + ').</p>' +
                  '<p class="c3d-ohm-note" style="opacity:1;animation:none">Και οι δύο λαμπτήρες βρίσκονται ανάμεσα στα <b>ίδια δύο ισοδυναμικά τμήματα</b> (' + V + ' V και 0 V), γι’ αυτό έχουν την ίδια τάση ' + V + ' V. Στη πηγή το δυναμικό μεταβάλλεται.</p>'
                : '<p class="c3d-eq-line">' + sw('h') + '<b>' + V + ' V:</b> από τον θετικό πόλο (' + LET[0] + ') έως την πρώτη επαφή του ανοιχτού διακόπτη (' + LET[1] + ').</p>' +
                  '<p class="c3d-eq-line">' + sw('l') + '<b>0 V:</b> από τη δεύτερη επαφή του διακόπτη (' + LET[2] + '), μέσω των δύο λαμπτήρων (χωρίς ρεύμα δεν υπάρχει πτώση τάσης), έως τον αρνητικό πόλο.</p>' +
                  '<p class="c3d-ohm-note" style="opacity:1;animation:none">Όλη η τάση της πηγής (' + V + ' V) εμφανίζεται στα άκρα του ανοιχτού διακόπτη.</p>';
            el.innerHTML = html;
        }

        /* ------------------------------------------------ 3D scene */
        function buildScene(stage) {
            const w = stage.clientWidth || 600, h = stage.clientHeight || 480;
            const renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
            renderer.setSize(w, h);
            renderer.setClearColor(0x0b1220, 1);
            renderer.domElement.className = 'c3d-canvas';
            stage.insertBefore(renderer.domElement, stage.firstChild);
            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(42, w / h, 0.1, 100);
            scene.fog = new THREE.Fog(0x0b1220, 15, 38);
            scene.add(new THREE.HemisphereLight(0xcfe3ff, 0x1a2540, 0.85));
            const sun = new THREE.DirectionalLight(0xffffff, 0.8); sun.position.set(6, 10, 8); scene.add(sun);
            const fc = document.createElement('canvas'); fc.width = fc.height = 256;
            const fg = fc.getContext('2d'), fgr = fg.createRadialGradient(128, 128, 10, 128, 128, 128);
            fgr.addColorStop(0, '#1d3157'); fgr.addColorStop(0.7, '#111c33'); fgr.addColorStop(1, '#0b1220');
            fg.fillStyle = fgr; fg.fillRect(0, 0, 256, 256);
            const floor = new THREE.Mesh(new THREE.CircleGeometry(11, 64), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(fc) }));
            floor.rotation.x = -Math.PI / 2; floor.position.z = -1.2; scene.add(floor);
            const grid = new THREE.GridHelper(20, 20, 0x2b3b5c, 0x1b2740); grid.position.set(0, 0.01, -1.2); grid.material.transparent = true; grid.material.opacity = 0.4; scene.add(grid);
            const sc = document.createElement('canvas'); sc.width = sc.height = 64;
            const sg = sc.getContext('2d'), sgr = sg.createRadialGradient(32, 32, 2, 32, 32, 32);
            sgr.addColorStop(0, 'rgba(0,0,0,0.6)'); sgr.addColorStop(1, 'rgba(0,0,0,0)'); sg.fillStyle = sgr; sg.fillRect(0, 0, 64, 64);
            const shadowTex = new THREE.CanvasTexture(sc);
            [[0, 3, 4.2, 2.2], [4, 0, 2.0, 2.8], [BXK[0], ZB, 2.2, 2.2], [BXK[1], ZB, 2.2, 2.2]].forEach(([x, z, ww, dd]) => {
                const m = new THREE.Mesh(new THREE.PlaneGeometry(ww, dd), new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false }));
                m.rotation.x = -Math.PI / 2; m.position.set(x, 0.02, z); scene.add(m);
            });
            const pickables = [];
            const tag = (obj, kind, idx) => { obj.traverse((o) => { if (o.isMesh) { o.userData.kind = kind; o.userData.idx = idx || 0; pickables.push(o); } }); };
            const pts = (x, z) => new THREE.Vector3(x, H, z);

            // wires
            const wireMat = new THREE.MeshStandardMaterial({ color: 0x2f80ff, metalness: 0.3, roughness: 0.4 });
            const segs = [
                [pts(BX, 3), pts(4, 3)], [pts(4, 3), pts(4, 0.6)], [pts(4, -0.6), pts(4, ZP)],
                [pts(4, ZP), pts(BXK[0], ZP)], [pts(BXK[0], ZP), pts(BXK[1], ZP)],
                [pts(BXK[0], ZP), pts(BXK[0], ZIN)], [pts(BXK[0], ZOUT), pts(BXK[0], ZN)],
                [pts(BXK[1], ZP), pts(BXK[1], ZIN)], [pts(BXK[1], ZOUT), pts(BXK[1], ZN)],
                [pts(BXK[0], ZN), pts(BXK[1], ZN)], [pts(BXK[1], ZN), pts(-4, ZN)], [pts(-4, ZN), pts(-4, 3)], [pts(-4, 3), pts(-BX, 3)]
            ];
            const wires = new THREE.Group();
            segs.forEach(([a, b]) => wires.add(cylinderBetween(a, b, 0.09, wireMat)));
            [pts(4, 3), pts(4, ZP), pts(BXK[0], ZP), pts(BXK[1], ZP), pts(BXK[0], ZN), pts(BXK[1], ZN), pts(-4, ZN), pts(-4, 3)].forEach((p) => {
                const s = new THREE.Mesh(new THREE.SphereGeometry(0.15, 16, 16), wireMat); s.position.copy(p); wires.add(s);
            });
            scene.add(wires); tag(wires, 'wire');

            // battery (at z = 3, along x)
            const battery = new THREE.Group();
            const body = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 2.4, 32), new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.4, metalness: 0.2 })); body.rotation.z = Math.PI / 2;
            const band = new THREE.Mesh(new THREE.CylinderGeometry(0.565, 0.565, 0.9, 32), new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.4, metalness: 0.15 })); band.rotation.z = Math.PI / 2; band.position.x = -0.75;
            const pinMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.7, roughness: 0.3 });
            const pinP = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.35, 16), pinMat); pinP.rotation.z = Math.PI / 2; pinP.position.x = 1.3;
            const pinN = pinP.clone(); pinN.position.x = -1.3;
            const capMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.8, roughness: 0.25 });
            const capP = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.58, 0.16, 32), capMat); capP.rotation.z = Math.PI / 2; capP.position.x = 1.2;
            const stripe = new THREE.Mesh(new THREE.CylinderGeometry(0.57, 0.57, 0.1, 32), new THREE.MeshStandardMaterial({ color: 0xfff7ed, roughness: 0.4 })); stripe.rotation.z = Math.PI / 2; stripe.position.x = 0.1;
            battery.add(body, band, capP, stripe, pinP, pinN);
            const plus = textSprite('+', '#ffffff'); plus.position.set(0.7, 0.95, 0);
            const minus = textSprite('−', '#ffffff'); minus.position.set(-0.75, 0.95, 0);
            battery.add(plus, minus); battery.position.set(0, H, 3); scene.add(battery); tag(battery, 'battery');

            // switch (x = 4): posts at z = ±0.6, the lever pivots at z = +0.6
            const swg = new THREE.Group();
            const baseBox = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.25, 1.9), new THREE.MeshStandardMaterial({ color: 0x4ade80, roughness: 0.5 })); baseBox.position.set(0, -0.28, 0);
            const post1 = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.3, 16), pinMat); post1.position.set(0, -0.05, 0.6);
            const post2 = post1.clone(); post2.position.set(0, -0.05, -0.6);
            const lever = new THREE.Group();
            const leverBar = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 1.25, 12), new THREE.MeshStandardMaterial({ color: 0xe5e7eb, metalness: 0.6, roughness: 0.3 })); leverBar.rotation.x = Math.PI / 2; leverBar.position.set(0, 0, -0.625);
            const knob = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 16), new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.35 })); knob.position.set(0, 0, -1.25);
            lever.add(leverBar, knob); lever.position.set(0, 0, 0.6);
            swg.add(baseBox, post1, post2, lever); swg.position.set(4, H, 0); scene.add(swg); tag(swg, 'switch');

            // bulbs
            const hc = document.createElement('canvas'); hc.width = hc.height = 128;
            const hg = hc.getContext('2d'), grad = hg.createRadialGradient(64, 64, 0, 64, 64, 64);
            grad.addColorStop(0, 'rgba(255,220,120,1)'); grad.addColorStop(0.35, 'rgba(255,200,80,0.45)'); grad.addColorStop(1, 'rgba(255,200,80,0)');
            hg.fillStyle = grad; hg.fillRect(0, 0, 128, 128);
            const haloTex = new THREE.CanvasTexture(hc);
            const ringMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.7, roughness: 0.35 });
            const bulbs = BXK.map((bx, bi) => {
                const bulb = new THREE.Group();
                const socket = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.36, 0.7, 24), new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.5, roughness: 0.4 })); socket.position.y = -0.05;
                const glassMat = new THREE.MeshStandardMaterial({ color: 0xfff6d5, transparent: true, opacity: 0.55, roughness: 0.15, emissive: 0xffc83d, emissiveIntensity: 0 });
                const glass = new THREE.Mesh(new THREE.SphereGeometry(0.85, 32, 32), glassMat); glass.position.y = 1.0;
                const filMat = new THREE.MeshStandardMaterial({ color: 0xffe9a3, emissive: 0xffa500, emissiveIntensity: 0 });
                const filament = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.04, 8, 24), filMat); filament.position.y = 1.0;
                const tL = cylinderBetween(new THREE.Vector3(-0.55, 0, 0), new THREE.Vector3(-0.3, 0, 0), 0.09, wireMat);
                const tR = cylinderBetween(new THREE.Vector3(0.3, 0, 0), new THREE.Vector3(0.55, 0, 0), 0.09, wireMat);
                const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTex, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })); halo.position.y = 1.0;
                bulb.add(halo);
                [-0.28, -0.12, 0.04].forEach((y) => { const ring = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.035, 8, 24), ringMat); ring.rotation.x = Math.PI / 2; ring.position.y = y; bulb.add(ring); });
                const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 0.4, 24), new THREE.MeshStandardMaterial({ color: 0xfff6d5, transparent: true, opacity: 0.5, roughness: 0.2 })); neck.position.y = 0.4;
                const fPost = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.7, 6), ringMat); fPost.position.set(0.12, 0.62, 0);
                const fPost2 = fPost.clone(); fPost2.position.x = -0.12;
                bulb.add(neck, fPost, fPost2, socket, glass, filament, tL, tR);
                bulb.position.set(bx, H, ZB); bulb.rotation.y = Math.PI / 2; scene.add(bulb); tag(bulb, 'bulb', bi);
                const light = new THREE.PointLight(0xffd24a, 0, 14); light.position.set(bx, H + 1.4, ZB); scene.add(light);
                return { glassMat, filMat, halo, light, b: 0 };
            });

            // routes of the moving charges (the last segment of each loop closes it inside the battery and is not drawn)
            const makePath = (arr) => {
                const lens = arr.map((a, i) => a.distanceTo(arr[(i + 1) % arr.length]));
                const tot = lens.reduce((a, b) => a + b, 0);
                const at = (s) => {
                    let t = ((s % tot) + tot) % tot;
                    for (let i = 0; i < arr.length; i++) {
                        if (t <= lens[i]) { const a = arr[i], b = arr[(i + 1) % arr.length]; return { p: a.clone().lerp(b, t / lens[i]), inside: i === arr.length - 1, tangent: b.clone().sub(a).normalize() }; }
                        t -= lens[i];
                    }
                    return { p: arr[0].clone(), inside: false, tangent: new THREE.Vector3(1, 0, 0) };
                };
                return { total: tot, at };
            };
            const branchLoop = (k, detour) => {
                const x = BXK[k];
                const mid = detour ? [pts(x, ZIN), pts(x + DX[k], ZIN), pts(x + DX[k], ZOUT), pts(x, ZOUT)] : [pts(x, ZIN), pts(x, ZOUT)];
                return [pts(BX, 3), pts(4, 3), pts(4, ZP), pts(x, ZP)].concat(mid, [pts(x, ZN), pts(-4, ZN), pts(-4, 3), pts(-BX, 3)]);
            };
            const route = { b0: makePath(branchLoop(0, false)), b1: makePath(branchLoop(1, false)), r1: makePath(branchLoop(0, true)), r2: makePath(branchLoop(1, true)),
                source: makePath([pts(BX, 3), pts(BX, ZS), pts(-BX, ZS), pts(-BX, 3)]) };
            const NPER = 26;
            const charges = new THREE.Group();
            const chargeMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, emissive: 0xf59e0b, emissiveIntensity: 0.8 });
            for (let i = 0; i < 2 * NPER; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 10), chargeMat); m.userData.k = i < NPER ? 0 : 1; m.userData.i = i % NPER; m.userData.s = 0; charges.add(m); }
            scene.add(charges);
            const arrows = new THREE.Group();
            const arrowMat = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xb91c1c, emissiveIntensity: 0.6 });
            { const info = route.b0.at(1.5); const cone = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.5, 16), arrowMat); cone.position.copy(info.p).add(new THREE.Vector3(0, 0.3, 0)); cone.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), info.tangent); arrows.add(cone); }
            scene.add(arrows);

            // bypass wires (red): around bulb 1, around bulb 2, around the source
            const bypassMat = new THREE.MeshStandardMaterial({ color: 0xf43f5e, emissive: 0x9f1239, emissiveIntensity: 0.55, metalness: 0.3, roughness: 0.4 });
            const defs = {
                r1: [pts(BXK[0], ZIN), pts(BXK[0] + DX[0], ZIN), pts(BXK[0] + DX[0], ZOUT), pts(BXK[0], ZOUT)],
                r2: [pts(BXK[1], ZIN), pts(BXK[1] + DX[1], ZIN), pts(BXK[1] + DX[1], ZOUT), pts(BXK[1], ZOUT)],
                source: [pts(BX, 3), pts(BX, ZS), pts(-BX, ZS), pts(-BX, 3)]
            };
            const shortWires = {};
            Object.keys(defs).forEach((key) => {
                const g = new THREE.Group(), d = defs[key];
                for (let i = 0; i < d.length - 1; i++) g.add(cylinderBetween(d[i], d[i + 1], 0.07, bypassMat));
                d.forEach((pt) => { const sph = new THREE.Mesh(new THREE.SphereGeometry(0.16, 14, 14), bypassMat); sph.position.copy(pt); g.add(sph); });
                g.visible = false; scene.add(g); shortWires[key] = g;
            });

            // equipotential overlays: {mesh, open side, closed side}
            const equi = [];
            const eqCol = { H: EQ_HI, L: EQ_LO };
            const eqMat = (op) => new THREE.MeshBasicMaterial({ color: EQ_LO, transparent: true, opacity: op, depthWrite: false });
            const eqTube = (a, b, open, closed, r) => { const m = cylinderBetween(a, b, r || 0.17, eqMat(0.8)); m.visible = false; scene.add(m); equi.push({ m, open, closed }); };
            eqTube(pts(BX, 3), pts(4, 3), 'H', 'H'); eqTube(pts(4, 3), pts(4, 0.6), 'H', 'H');
            eqTube(pts(4, 0.6), pts(4, -0.6), null, 'H', 0.12);
            eqTube(pts(4, -0.6), pts(4, ZP), 'L', 'H'); eqTube(pts(4, ZP), pts(BXK[0], ZP), 'L', 'H'); eqTube(pts(BXK[0], ZP), pts(BXK[1], ZP), 'L', 'H');
            BXK.forEach((x) => { eqTube(pts(x, ZP), pts(x, ZIN), 'L', 'H'); eqTube(pts(x, ZOUT), pts(x, ZN), 'L', 'L'); });
            eqTube(pts(BXK[0], ZN), pts(BXK[1], ZN), 'L', 'L'); eqTube(pts(BXK[1], ZN), pts(-4, ZN), 'L', 'L'); eqTube(pts(-4, ZN), pts(-4, 3), 'L', 'L'); eqTube(pts(-4, 3), pts(-BX, 3), 'L', 'L');
            const eqBlob = (x, y, z, r, open, closed) => { const m = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 16), eqMat(0.4)); m.position.set(x, y, z); m.visible = false; scene.add(m); equi.push({ m, open, closed }); };
            eqBlob(4, H - 0.05, 0.6, 0.3, 'H', 'H'); eqBlob(4, H - 0.05, -0.6, 0.3, 'L', 'H');

            // follower: a big glowing positive test charge
            const follower = new THREE.Group();
            const fMat = new THREE.MeshStandardMaterial({ color: 0xff5a36, emissive: 0xff2d00, emissiveIntensity: 1.2 });
            const fBall = new THREE.Mesh(new THREE.SphereGeometry(0.26, 24, 24), fMat);
            const fPlus = textSprite('+', '#ffffff'); fPlus.scale.set(0.5, 0.5, 0.5); fPlus.material.depthTest = false; fPlus.renderOrder = 10;
            const fGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTex, transparent: true, opacity: 0.85, depthWrite: false, blending: THREE.AdditiveBlending, color: 0xff6a3d })); fGlow.scale.setScalar(1.6);
            follower.add(fBall, fGlow, fPlus); follower.visible = false; scene.add(follower);

            // the follower walks along the polyline of the chosen branch
            const polyAt = (k, sv) => {
                const p = BP[k], d = p.pts;
                if (sv >= p.s[p.s.length - 1]) {                       // inside the battery: from the - pole back to the + pole
                    const t = Math.min(1, (sv - p.s[p.s.length - 1]) / (2 * BX));
                    return { p: new THREE.Vector3(-BX + t * 2 * BX, H, 3), inside: true };
                }
                let i = 1; while (i < p.s.length - 1 && sv > p.s[i]) i++;
                const t = (sv - p.s[i - 1]) / (p.s[i] - p.s[i - 1] || 1);
                return { p: new THREE.Vector3(d[i - 1][0] + (d[i][0] - d[i - 1][0]) * t, H, d[i - 1][1] + (d[i][1] - d[i - 1][1]) * t), inside: false };
            };

            const o = { renderer, scene, camera, pickables, lever, bulbs, charges, arrows, stage, follower, fMat, equi, eqCol, route, polyAt };
            o.setShort = (k) => {
                Object.keys(shortWires).forEach((key) => { shortWires[key].visible = key === k; });
                charges.children.forEach((m) => { const r = k === 'source' ? route.source : (k === 'r1' && m.userData.k === 0) ? route.r1 : (k === 'r2' && m.userData.k === 1) ? route.r2 : m.userData.k === 0 ? route.b0 : route.b1; m.userData.s = (m.userData.i * r.total) / NPER; });
            };
            o.shortMid = { r1: [BXK[0] + DX[0], ZB], r2: [BXK[1] + DX[1], ZB], source: [2.9, ZS + 0.4] };
            return o;
        }

        /* ------------------------------------------------ camera, labels, animation */
        function startApp(mount) {
            const stage = mount.querySelector('#c3d-stage');
            let o;
            try { o = buildScene(stage); } catch (err) {
                stage.innerHTML = '<p class="c3d-error">Ο φυλλομετρητής δεν υποστηρίζει WebGL, οπότε η τρισδιάστατη προβολή δεν είναι διαθέσιμη.</p>';
                return null;
            }
            const view = { theta: DEFAULT_VIEW.theta, phi: DEFAULT_VIEW.phi, radius: DEFAULT_VIEW.radius, target: new THREE.Vector3(...DEFAULT_VIEW.target) };
            const want = { theta: view.theta, phi: view.phi, radius: view.radius, target: view.target.clone() };
            let leverAngle = 0.75, selPoint = null;
            const fs = { s: 0, dwell: 1.4, next: 1, active: false, cp: 0, k: 0 };
            o.resetFollow = () => { fs.active = false; };
            const mkCard = (cls) => { const el = document.createElement('div'); el.className = 'c3d-label ' + cls; el.style.display = 'none'; stage.appendChild(el); return el; };
            const eqHiCard = mkCard('c3d-eq-h'), eqLoCard = mkCard('c3d-eq-l');
            const dom = o.renderer.domElement, pointers = new Map();
            let moved = 0, lastPinch = 0;
            dom.style.touchAction = 'none';
            function pick(ev) {
                const r = dom.getBoundingClientRect();
                const ndc = new THREE.Vector2(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
                const ray = new THREE.Raycaster(); ray.setFromCamera(ndc, o.camera);
                return ray.intersectObjects(o.pickables, false)[0] || null;
            }
            dom.addEventListener('pointerdown', (e) => { dom.setPointerCapture(e.pointerId); pointers.set(e.pointerId, { x: e.clientX, y: e.clientY }); moved = 0; lastPinch = 0; });
            dom.addEventListener('pointermove', (e) => {
                const prev = pointers.get(e.pointerId);
                if (!prev) { dom.style.cursor = pick(e) ? 'pointer' : 'grab'; return; }
                if (pointers.size === 2) {
                    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
                    const [a, b] = [...pointers.values()]; const d = Math.hypot(a.x - b.x, a.y - b.y);
                    if (lastPinch) want.radius = Math.min(24, Math.max(3, want.radius * (lastPinch / d)));
                    lastPinch = d; moved += 10; return;
                }
                const dx = e.clientX - prev.x, dy = e.clientY - prev.y;
                moved += Math.abs(dx) + Math.abs(dy);
                want.theta -= dx * 0.007; want.phi = Math.min(1.5, Math.max(0.15, want.phi - dy * 0.007));
                pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
            });
            dom.addEventListener('pointerup', (e) => {
                const wasClick = pointers.has(e.pointerId) && pointers.size === 1 && moved < 6;
                pointers.delete(e.pointerId);
                if (wasClick) { const hit = pick(e); if (hit) select(hit); }
            });
            dom.addEventListener('pointercancel', (e) => pointers.delete(e.pointerId));
            dom.addEventListener('wheel', (e) => { e.preventDefault(); want.radius = Math.min(24, Math.max(3, want.radius * (1 + e.deltaY * 0.0012))); }, { passive: false });
            function select(hit) {
                const kind = hit.object.userData.kind, idx = hit.object.userData.idx || 0;
                state.selected = kind === 'bulb' ? 'bulb' + idx : kind;
                if (kind === 'switch') setClosed(!state.closed);
                const focus = kind === 'battery' ? [0, H, 3] : kind === 'bulb' ? [BXK[idx], H + 1, ZB] : kind === 'switch' ? [4, H, 0] : null;
                want.target.set(...(focus || [hit.point.x, hit.point.y, hit.point.z]));
                want.radius = kind === 'wire' ? 6.5 : 5.5;
                selPoint = true;
            }
            o.resetView = () => { want.theta = DEFAULT_VIEW.theta; want.phi = DEFAULT_VIEW.phi; want.radius = DEFAULT_VIEW.radius; want.target.set(...DEFAULT_VIEW.target); state.selected = null; selPoint = null; };

            const labs = { battery: mount.querySelector('#c3d-lab-battery'), switch: mount.querySelector('#c3d-lab-switch'), bulb0: mount.querySelector('#c3d-lab-bulb0'), bulb1: mount.querySelector('#c3d-lab-bulb1') };
            const labFollow = mount.querySelector('#c3d-lab-follow'), labShort = mount.querySelector('#c3d-lab-short');
            const project = (x, y, z, el) => {
                const v = new THREE.Vector3(x, y, z).project(o.camera); const r = dom.getBoundingClientRect();
                if (v.z > 1) { el.style.display = 'none'; return; }
                el.style.display = 'block'; el.style.left = ((v.x * 0.5 + 0.5) * r.width) + 'px'; el.style.top = ((-v.y * 0.5 + 0.5) * r.height) + 'px';
            };
            const ro = new ResizeObserver(() => { const w = stage.clientWidth, h = stage.clientHeight; if (w > 0 && h > 0) { o.renderer.setSize(w, h); o.camera.aspect = w / h; o.camera.updateProjectionMatrix(); } });
            ro.observe(stage);
            const row = (sym, val, unit) => '<span class="c3d-q c3d-q-' + sym + '"><i>' + sym + '</i></span><span class="c3d-n">=</span><span class="c3d-v">' + val + '</span><span class="c3d-u">' + unit + '</span>';
            const card = (title, rows) => '<div class="c3d-lt">' + title + '</div><div class="c3d-lg">' + rows.join('') + '</div>';
            const anchor = { battery: [0, H + 1.4, 3], switch: [4, H + 1.1, 0], bulb0: [BXK[0], H + 2.6, ZB], bulb1: [BXK[1], H + 2.6, ZB] };
            let last = performance.now();

            function tick(now) {
                if (!document.body.contains(stage)) { ro.disconnect(); o.renderer.dispose(); return; }
                requestAnimationFrame(tick);
                const dt = Math.min(0.05, (now - last) / 1000); last = now;
                if (!stage.clientWidth) return;
                const k1 = 1 - Math.exp(-dt * 6);
                view.theta += (want.theta - view.theta) * k1; view.phi += (want.phi - view.phi) * k1; view.radius += (want.radius - view.radius) * k1; view.target.lerp(want.target, k1);
                o.camera.position.set(view.target.x + view.radius * Math.sin(view.phi) * Math.sin(view.theta), view.target.y + view.radius * Math.cos(view.phi), view.target.z + view.radius * Math.sin(view.phi) * Math.cos(view.theta));
                o.camera.lookAt(view.target);
                leverAngle += ((state.closed ? 0 : 0.75) - leverAngle) * (1 - Math.exp(-dt * 10));
                o.lever.rotation.x = leverAngle;

                const E = elec();
                o.bulbs.forEach((bb, i) => {
                    const P = E.Ib[i] * E.Vb[i];
                    const targetB = state.closed && P > 0 ? Math.min(1, Math.pow(P / 16, 0.6)) : 0;
                    bb.b += (targetB - bb.b) * (1 - Math.exp(-dt * 5));
                    bb.glassMat.emissiveIntensity = bb.b * 3.0; bb.glassMat.opacity = 0.55 + bb.b * 0.3;
                    bb.halo.material.opacity = bb.b * 0.9; bb.halo.scale.setScalar(1.5 + bb.b * 3.2);
                    bb.filMat.emissiveIntensity = bb.b * 4; bb.light.intensity = bb.b * 3.5;
                });

                // moving charges: a stream through each branch, faster in the branch with the smaller resistance
                const flows = state.closed || state.short === 'source';
                const simDt = state.paused ? 0 : dt * state.speed;
                o.charges.visible = flows && state.mode === 'standard';
                o.arrows.visible = state.closed && state.mode !== 'equi';
                if (o.charges.visible) {
                    const sh = state.short;
                    o.charges.children.forEach((m) => {
                        const k = m.userData.k;
                        let r, speed;
                        if (sh === 'source') { r = o.route.source; speed = 6; m.visible = true; }
                        else if (sh === 'r1' || sh === 'r2') { const kk = sh === 'r1' ? 0 : 1; r = kk === 0 ? o.route.r1 : o.route.r2; speed = 6; if (k !== kk) { m.visible = false; return; } }
                        else { r = k === 0 ? o.route.b0 : o.route.b1; speed = Math.min(6, 0.6 + 1.2 * E.Ib[k]); }
                        m.userData.s += speed * simDt;
                        const info = r.at(m.userData.s);
                        m.position.copy(info.p); m.visible = !info.inside;
                    });
                }

                // positive test charge following the conventional current through the chosen branch
                const act = state.mode === 'follow' && state.closed && !state.short;
                if (act && (!fs.active || fs.k !== state.branch)) { fs.s = 0; fs.next = 1; fs.dwell = 1.4; fs.cp = 0; fs.k = state.branch; }
                fs.active = act;
                o.follower.visible = act;
                labFollow.style.display = act ? 'block' : 'none';
                if (act) {
                    const p = BP[fs.k], CP = p.cps;
                    if (fs.dwell > 0) fs.dwell -= simDt;
                    else {
                        fs.s += ((fs.s >= CP[4] && fs.s < CP[5]) ? 0.9 : 2.0) * simDt;
                        if (fs.next < CP.length && fs.s >= CP[fs.next]) {
                            fs.s = CP[fs.next]; fs.cp = fs.next; fs.next++;
                            fs.dwell = (fs.cp === 4 || fs.cp === 5) ? 3.2 : (fs.cp === 7 ? 2.6 : 1.8);
                        } else if (fs.s >= p.total) { fs.s = 0; fs.cp = 0; fs.next = 1; fs.dwell = 1.8; }
                    }
                    const atCp = fs.dwell > 0;
                    const info = o.polyAt(fs.k, fs.s);
                    o.follower.position.copy(info.p);
                    o.fMat.depthTest = !info.inside;
                    o.follower.scale.setScalar(atCp ? 1.25 * (1 + 0.08 * Math.sin(now / 160)) : 1);
                    const v = potAt(fs.k, fs.s), V = state.V, Ik = E.Ib[fs.k], Rk = state.R[fs.k];
                    const Iseg = (fs.s < CP[3] || fs.s > CP[6]) ? E.I : Ik;          // the whole current before the first junction and after the second one
                    const zeroDrop = '<div class="c3d-fo-eq"><i>ΔV</i> = <i>I</i> · <i>R</i> = ' + fmt(Iseg, 2) + ' A · 0 Ω = <b>0 V</b></div>';
                    const zone = fs.s >= CP[7] ? 'battery' : (fs.s >= CP[4] && fs.s <= CP[5]) ? 'bulb' : (fs.s >= CP[1] && fs.s <= CP[2]) ? 'switch' : (atCp && (fs.cp === 3 || fs.cp === 6)) ? 'junction' : 'wire';
                    let ohm = '';
                    if (zone === 'wire') ohm = '<div class="c3d-fo">Ιδανικό καλώδιο</div>' + zeroDrop + '<p class="c3d-fnote">Δεν συμβαίνει πτώση τάσης (απώλεια δυναμικού), γιατί το καλώδιο, ως ιδανικό, θεωρείται ότι δεν παρουσιάζει αντίσταση.</p>';
                    else if (zone === 'switch') ohm = '<div class="c3d-fo">Ιδανικός διακόπτης</div>' + zeroDrop + '<p class="c3d-fnote">Ο ιδανικός διακόπτης, όταν είναι κλειστός, δεν προκαλεί πτώση τάσης. Από εδώ περνά όλο το ρεύμα της πηγής, I = ' + fmt(E.I, 2) + ' A.</p>';
                    else if (zone === 'junction') ohm = '<div class="c3d-fo">Κόμβος</div><div class="c3d-fo-eq">' + (fs.cp === 3 ? '<i>I</i> = <i>I</i><sub>1</sub> + <i>I</i><sub>2</sub> = ' + fmt(E.Ib[0], 2) + ' + ' + fmt(E.Ib[1], 2) + ' = <b>' + fmt(E.I, 2) + ' A</b>' : '<i>I</i><sub>1</sub> + <i>I</i><sub>2</sub> = <b>' + fmt(E.I, 2) + ' A</b>') + '</div><p class="c3d-fnote">' + (fs.cp === 3 ? 'Στον κόμβο το ρεύμα της πηγής χωρίζεται στους δύο κλάδους. Το δυναμικό δεν αλλάζει: ' + fv(V) + ' V.' : 'Εδώ ενώνονται ξανά οι δύο κλάδοι. Το δυναμικό είναι 0 V.') + '</p>';
                    else if (zone === 'bulb') ohm = '<div class="c3d-fo">Νόμος του Ohm στον λαμπτήρα ' + sub(fs.k) + '</div><div class="c3d-fo-eq"><i>ΔV</i><sub>' + sub(fs.k) + '</sub> = <i>I</i><sub>' + sub(fs.k) + '</sub> · <i>R</i><sub>' + sub(fs.k) + '</sub> = ' + fmt(Ik, 2) + ' A · ' + Rk + ' Ω = <b>' + fv(V) + ' V</b></div><p class="c3d-fnote">Ο λαμπτήρας ' + sub(fs.k) + ' παρουσιάζει αντίσταση: το φορτίο χάνει όλη την ενέργεια που πήρε από την πηγή. Η τάση στα άκρα του είναι ' + fv(V) + ' V, όση και στον άλλον κλάδο.</p>';
                    else ohm = '<div class="c3d-fo">Πηγή</div><div class="c3d-fo-eq"><i>ΔV</i> = ' + fv(V) + ' − 0 = <b>+' + fv(V) + ' V</b></div><p class="c3d-fnote">Η πηγή, καταναλώνοντας δική της χημική ενέργεια, προσφέρει ηλεκτρική ενέργεια στα φορτία καθώς τα μεταφέρει από τον αρνητικό πόλο προς τον θετικό. Στη συνέχεια το φορτίο μπορεί να περάσει από οποιονδήποτε κλάδο.</p>';
                    const cpName = ['Θετικός πόλος (+)', 'Είσοδος διακόπτη', 'Έξοδος διακόπτη', 'Κόμβος (διακλάδωση)', 'Είσοδος λαμπτήρα ' + sub(fs.k), 'Έξοδος λαμπτήρα ' + sub(fs.k), 'Κόμβος (ένωση κλάδων)', 'Αρνητικός πόλος (−)'];
                    const name = atCp ? LET[fs.cp] + ' · ' + cpName[fs.cp] : (zone === 'battery' ? 'Μέσα στην πηγή' : zone === 'bulb' ? 'Μέσα στον λαμπτήρα ' + sub(fs.k) : 'Στο καλώδιο');
                    const fhtml = '<div class="c3d-fhead"><span class="c3d-fplus">+</span><span>' + name + '</span></div><div class="c3d-fval"><i>V</i> = ' + fv(v) + ' V</div>' + ohm;
                    if (labFollow._html !== fhtml) { labFollow._html = fhtml; labFollow.innerHTML = fhtml; }
                    labFollow.classList.toggle('c3d-label-active', atCp);
                    project(info.p.x, info.p.y - 0.45, info.p.z, labFollow);
                    const cw = labFollow.offsetWidth, ch = labFollow.offsetHeight;
                    if (cw) {
                        const sw = stage.clientWidth, sh2 = Math.min(stage.clientHeight, window.innerHeight - stage.getBoundingClientRect().top);
                        const x = parseFloat(labFollow.style.left), y = parseFloat(labFollow.style.top);
                        const flip = y + 22 + ch > sh2 - 6 && y - 40 - ch > 6;
                        labFollow.classList.toggle('c3d-flip', flip);
                        const nx = Math.min(Math.max(x, cw / 2 + 6), Math.max(cw / 2 + 6, sw - cw / 2 - 6));
                        labFollow.style.left = nx + 'px';
                        labFollow.style.setProperty('--ax', Math.max(-cw / 2 + 18, Math.min(cw / 2 - 18, x - nx)) + 'px');
                        if (!flip) { const maxTop = sh2 - 6 - ch - 22; if (y > maxTop) labFollow.style.top = Math.max(maxTop, -16) + 'px'; }
                    }
                    const gdot = q('c3d-gdot');
                    if (gdot) { gdot.setAttribute('cx', gx(p, fs.s).toFixed(1)); gdot.setAttribute('cy', gy(v).toFixed(1)); }
                }

                // equipotential highlight
                o.equi.forEach((e) => { const side = state.closed ? e.closed : e.open; e.m.visible = state.mode === 'equi' && !!side; if (side) e.m.material.color.setHex(o.eqCol[side]); });
                const eqOn = state.mode === 'equi';
                eqHiCard.style.display = eqLoCard.style.display = eqOn ? 'block' : 'none';
                if (eqOn) {
                    const eqCard = (val) => '<div class="c3d-lt">Ισοδυναμικό τμήμα</div><div class="c3d-lg">' + row('V', val, 'V') + '</div>';
                    const hi = eqCard(state.V), lo = eqCard(0);
                    if (eqHiCard._html !== hi) { eqHiCard._html = hi; eqHiCard.innerHTML = hi; }
                    if (eqLoCard._html !== lo) { eqLoCard._html = lo; eqLoCard.innerHTML = lo; }
                    project(2.7, H + 0.5, 3, eqHiCard); project(-4, H + 0.5, 0, eqLoCard);
                }

                // value cards
                const html = {
                    battery: card('Μπαταρία', [row('V', state.V, 'V'), row('I', dI(E.I), 'A')]),
                    switch: card(state.closed ? 'Διακόπτης (κλειστός)' : 'Διακόπτης (ανοιχτός)', [row('V', fmt(E.Vsw, 1), 'V'), row('I', dI(E.Isw), 'A')]),
                    bulb0: card('Λαμπτήρας 1', [row('R', state.R[0], 'Ω'), row('V', fmt(E.Vb[0], 1), 'V'), row('I', dI(E.Ib[0]), 'A')]),
                    bulb1: card('Λαμπτήρας 2', [row('R', state.R[1], 'Ω'), row('V', fmt(E.Vb[1], 1), 'V'), row('I', dI(E.Ib[1]), 'A')])
                };
                Object.keys(labs).forEach((key) => {
                    if (labs[key]._html !== html[key]) { labs[key]._html = html[key]; labs[key].innerHTML = html[key]; }
                    labs[key].classList.toggle('c3d-label-active', state.selected === key);
                    project(anchor[key][0], anchor[key][1], anchor[key][2], labs[key]);
                });
                if (state.short && o.shortMid[state.short]) {
                    const hs = card('Καλώδιο βραχυκυκλώματος', [row('V', '0,0', 'V'), row('I', dI(E.Iw), 'A')]);
                    if (labShort._html !== hs) { labShort._html = hs; labShort.innerHTML = hs; }
                    const mpt = o.shortMid[state.short]; project(mpt[0], H + 0.9, mpt[1], labShort);
                } else labShort.style.display = 'none';
                o.renderer.render(o.scene, o.camera);
            }
            requestAnimationFrame(tick);
            return o;
        }

        function render(mount) {
            if (!mount) return;
            if (!mount.querySelector('.c3d-wrap')) {
                buildUi(mount);
                app = null;
                ensureThree().then(() => {
                    if (!mount.isConnected) return;
                    app = startApp(mount);
                    if (app) app.setShort(state.short);
                    refreshUi();
                }).catch(() => {
                    const stage = mount.querySelector('#c3d-stage');
                    if (stage) stage.innerHTML = '<p class="c3d-error">Δεν ήταν δυνατή η φόρτωση της βιβλιοθήκης 3D (Three.js). Ελέγξτε τη σύνδεση στο διαδίκτυο και ανανεώστε τη σελίδα.</p>';
                });
            }
            M = mount;
            refreshUi();
        }
        return { render };
    }

    window.Circuit3DParallel = makeParallel({
        R: [10, 20],
        title: '3D κύκλωμα με δύο αντιστάτες παράλληλα',
        intro: 'Ένα κύκλωμα με μπαταρία, διακόπτη και δύο λαμπτήρες (αντιστάτες) σε παράλληλη σύνδεση. Σύρετε για περιστροφή, χρησιμοποιήστε τον τροχό ή το τσίμπημα για ζουμ, και πατήστε ένα στοιχείο για να το πλησιάσετε και να δείτε τις τιμές του. Αλλάξτε τις αντιστάσεις R₁ και R₂ και δείτε πώς χωρίζεται το ρεύμα.'
    });
})();
