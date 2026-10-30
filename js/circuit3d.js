/* Physics Γ: 3D introduction to the simple circuit (battery, switch, bulb, wires).
   Exposes window.Circuit3D.render(mount). Three.js is loaded on demand from a CDN.
   Drag to rotate, wheel or pinch to zoom, click an element to fly to it and read V, I, R.
   Closing the switch shows Ohm's law step by step, then the current starts to flow. */
window.Circuit3D = (function () {
    const THREE_URL = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    const H = 0.6;                          // height of the wires above the floor
    const BATTERY_X = 1.4;                  // x of the battery terminals (z = 3)
    const DEFAULT_VIEW = { theta: 0.55, phi: 1.0, radius: 13, target: [0, 0.6, 0] };

    // path of a positive test charge (conventional current):
    // + pole (A) -> switch in (Γ) -> switch out (Δ) -> bulb in (Ε) -> bulb out (Ζ) -> - pole (Β) -> through the source
    const LET = ['\u0391', '\u0393', '\u0394', '\u0395', '\u0396', '\u0392'];      // Α Γ Δ Ε Ζ Β, in the order the charge meets them
    const EQ_HI = 0xff6a3d, EQ_LO = 0x38bdf8;
    const SEG = [4 - BATTERY_X, 6, 8, 6, 4 - BATTERY_X, 2 * BATTERY_X];
    const PATH = (() => {
        const total = SEG.reduce((a, b) => a + b, 0);
        return {
            total, pA: 0,
            pG: SEG[0] + 3 - 0.6, pD: SEG[0] + 3 + 0.6,
            pE: SEG[0] + SEG[1] + (4 - 0.55), pZ: SEG[0] + SEG[1] + (4 + 0.55),
            pB: total - SEG[5]
        };
    })();
    const state = { V: 12, R: 10, closed: false, selected: null, follow: false, equi: false, speed: 0.5, paused: false };
    function potAt(s) {
        const V = state.V;
        if (s <= PATH.pE) return V;
        if (s < PATH.pZ) return V * (1 - (s - PATH.pE) / (PATH.pZ - PATH.pE));
        if (s <= PATH.pB) return 0;
        return V * (s - PATH.pB) / (PATH.total - PATH.pB);
    }
    function fv(v) {
        const r = Math.round(v * 10) / 10;
        return Number.isInteger(r) ? String(r) : fmt(r, 1);
    }
    function regionName(s) {
        if (s < PATH.pG) return 'Στο καλώδιο, πριν τον διακόπτη';
        if (s < PATH.pD) return 'Μέσα στον διακόπτη';
        if (s < PATH.pE) return 'Στο καλώδιο, πριν τον λαμπτήρα';
        if (s < PATH.pZ) return 'Μέσα στον λαμπτήρα';
        if (s < PATH.pB) return 'Στο καλώδιο, μετά τον λαμπτήρα';
        return 'Μέσα στην πηγή';
    }
    let app = null;
    let threeLoading = null;

    function fmt(x, d) {
        return x.toFixed(d).replace('.', ',');
    }
    function fmtTex(x, d) {
        return x.toFixed(d).replace('.', '{,}');
    }
    function currentI() { return state.closed ? state.V / state.R : 0; }
    function powerP() { return state.closed ? (state.V * state.V) / state.R : 0; }

    function ensureThree() {
        if (window.THREE) return Promise.resolve();
        if (!threeLoading) {
            threeLoading = new Promise((resolve, reject) => {
                const s = document.createElement('script');
                s.src = THREE_URL;
                s.onload = resolve;
                s.onerror = () => { threeLoading = null; reject(new Error('Three.js')); };
                document.head.appendChild(s);
            });
        }
        return threeLoading;
    }

    /* ---------------------------------------------------------------- UI */
    function buildUi(mount) {
        mount.innerHTML = `
        <div class="c3d-wrap">
            <div class="c3d-head">
                <h3>3D εισαγωγή στο απλό ιδανικό κύκλωμα</h3>
                <p>Ένα απλό κύκλωμα με μπαταρία, διακόπτη και λαμπτήρα. Σύρετε για περιστροφή, χρησιμοποιήστε τον τροχό ή το τσίμπημα για ζουμ, και πατήστε ένα στοιχείο για να το πλησιάσετε και να δείτε τις τιμές του.</p>
            </div>
            <div class="c3d-grid">
                <div class="c3d-stage" id="c3d-stage">
                    <button type="button" class="c3d-fs" data-act="fs" id="c3d-fs" title="Πλήρης οθόνη">⛶ Πλήρης οθόνη</button>
                    <div class="c3d-label" id="c3d-lab-battery"></div>
                    <div class="c3d-label" id="c3d-lab-bulb"></div>
                    <div class="c3d-label" id="c3d-lab-switch"></div>
                    <div class="c3d-label c3d-label-follow" id="c3d-lab-follow" style="display:none"></div>
                    <button type="button" class="c3d-exit" data-act="exit">← Έξοδος</button>
                </div>
                <div class="c3d-side">
                    <div class="c3d-controls">
                        <button type="button" class="c3d-main-btn" data-act="toggle" id="c3d-toggle">Κλείσιμο διακόπτη</button>
                        <div class="c3d-row"><span>Τάση πηγής <strong id="c3d-vval"></strong></span>
                            <span class="c3d-pair"><button type="button" data-act="v-">−1 V</button><button type="button" data-act="v+">+1 V</button></span></div>
                        <div class="c3d-row"><span>Αντίσταση λαμπτήρα <strong id="c3d-rval"></strong></span>
                            <span class="c3d-pair"><button type="button" data-act="r-">−1 Ω</button><button type="button" data-act="r+">+1 Ω</button></span></div>
                        <fieldset class="c3d-modes">
                            <legend>Λειτουργία προβολής</legend>
                            <label><input type="radio" name="c3d-mode" value="standard" checked> Απλή παρατήρηση του κυκλώματος</label>
                            <label><input type="radio" name="c3d-mode" value="follow"> Παρακολούθηση θετικού φορτίου</label>
                            <label><input type="radio" name="c3d-mode" value="equi"> Ισοδυναμικά τμήματα</label>
                        </fieldset>
                        <div class="c3d-row c3d-speed-row"><span>Ταχύτητα κίνησης</span>
                            <span class="c3d-pair" id="c3d-speeds"><button type="button" data-act="speed" data-speed="0.5">0,5×</button><button type="button" data-act="speed" data-speed="1">1×</button><button type="button" data-act="speed" data-speed="2">2×</button></span></div>
                        <button type="button" data-act="pause" id="c3d-pause" class="c3d-sub-btn">⏸ Παύση κίνησης</button>
                        <button type="button" data-act="view" class="c3d-sub-btn">Επαναφορά κάμερας</button>
                        <button type="button" data-act="restart" class="c3d-sub-btn">Επανεκκίνηση προσομοίωσης</button>
                    </div>
                    <div class="c3d-follow-panel" id="c3d-follow-panel" hidden></div>
                    <div class="c3d-follow-panel c3d-equi-panel" id="c3d-equi-panel" hidden></div>
                    <div class="c3d-ohm" id="c3d-ohm"></div>
                </div>
            </div>
        </div>`;
        mount.addEventListener('change', (e) => {
            if (e.target && e.target.name === 'c3d-mode') {
                // the three modes are mutually exclusive; the switch can be open or closed in each of them
                const wasFollow = state.follow;
                state.follow = e.target.value === 'follow';
                state.equi = e.target.value === 'equi';
                // following the charge always starts at 0,5× (whatever was chosen before) so the explanations can be read
                if (state.follow && !wasFollow) state.speed = 0.5;
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
            else if (act === 'r-') changeR(-1);
            else if (act === 'r+') changeR(1);
            else if (act === 'view') resetView();
            else if (act === 'restart') restartAll(mount);
            else if (act === 'pause') { state.paused = !state.paused; refreshUi(); }
            else if (act === 'speed') { state.speed = parseFloat(b.dataset.speed); refreshUi(); }
            else if (act === 'fs') toggleFullscreen(mount);
            else if (act === 'exit') {
                if (document.fullscreenElement) document.exitFullscreen();
                if (typeof switchSubjectTab === 'function') switchSubjectTab('quizzes');
            }
        });
    }

    function toggleFullscreen(mount) {
        const wrap = mount.querySelector('.c3d-wrap');
        if (document.fullscreenElement) document.exitFullscreen();
        else if (wrap.requestFullscreen) wrap.requestFullscreen().catch(() => {});
    }
    document.addEventListener('fullscreenchange', () => {
        const b = document.getElementById('c3d-fs');
        if (b) b.textContent = document.fullscreenElement ? '✕ Έξοδος από πλήρη οθόνη' : '⛶ Πλήρης οθόνη';
    });

    // full reset: open switch, default V and R, standard mode, normal speed, camera back at its start
    function restartAll(mount) {
        state.V = 12; state.R = 10; state.closed = false; state.selected = null;
        state.follow = false; state.equi = false; state.speed = 0.5; state.paused = false;
        const std = mount.querySelector('input[name="c3d-mode"][value="standard"]');
        if (std) std.checked = true;
        resetView();
        refreshUi();
    }

    function setClosed(on) {
        state.closed = on;
        refreshUi();
    }
    function changeV(d) {
        state.V = Math.min(24, Math.max(1, state.V + d));
        refreshUi();
    }
    function changeR(d) {
        state.R = Math.min(50, Math.max(1, state.R + d));
        refreshUi();
    }

    function refreshUi() {
        const root = document.getElementById('c3d-ohm');
        if (!root) return;
        document.getElementById('c3d-vval').textContent = state.V + ' V';
        document.getElementById('c3d-rval').textContent = state.R + ' Ω';
        document.getElementById('c3d-pause').textContent = state.paused ? '▶ Συνέχεια κίνησης' : '⏸ Παύση κίνησης';
        document.querySelectorAll('#c3d-speeds button').forEach((b) => b.classList.toggle('c3d-on', parseFloat(b.dataset.speed) === state.speed));
        document.getElementById('c3d-toggle').textContent = state.closed ? 'Άνοιγμα διακόπτη' : 'Κλείσιμο διακόπτη';
        const I = currentI();
        if (state.closed) {
            root.innerHTML = `
                <div class="c3d-ohm-title">Νόμος του Ohm</div>
                <div class="c3d-step" style="--d:0">$I = \\dfrac{V}{R}$</div>
                <div class="c3d-step" style="--d:1">$I = \\dfrac{${state.V}\\ \\text{V}}{${state.R}\\ \\Omega}$</div>
                <div class="c3d-step c3d-step-last" style="--d:2">$I = ${fmtTex(I, 2)}\\ \\text{A}$</div>
                <p class="c3d-ohm-note" style="--d:3">Το ρεύμα ρέει από τον θετικό (+) προς τον αρνητικό (−) πόλο, έξω από την πηγή.</p>`;
        } else {
            root.innerHTML = `
                <div class="c3d-ohm-title">Νόμος του Ohm</div>
                <p class="c3d-ohm-note" style="--d:0">Ο διακόπτης είναι ανοιχτός: δεν υπάρχει κλειστός δρόμος, άρα $I = 0\\ \\text{A}$.<br>Κλείστε τον διακόπτη (πατήστε πάνω του ή το κουμπί) για να δείτε τον υπολογισμό του ρεύματος.</p>`;
        }
        if (window.renderMath) window.renderMath(root);
        updateFollowPanel();
        updateEquiPanel();
    }

    function graphX(s) { return 34 + (s / PATH.total) * 270; }
    function graphY(v) { return 128 - (v / state.V) * 88; }
    function updateFollowPanel() {
        const el = document.getElementById('c3d-follow-panel');
        if (!el) return;
        el.hidden = !state.follow;
        if (!state.follow) return;
        const V = state.V, I = currentI();
        const pts = [[0, V], [PATH.pE, V], [PATH.pZ, 0], [PATH.pB, 0], [PATH.total, V]]
            .map(([s, v]) => graphX(s).toFixed(1) + ',' + graphY(v).toFixed(1)).join(' ');
        const circle = (s, v) => '<circle cx="' + graphX(s).toFixed(1) + '" cy="' + graphY(v).toFixed(1) + '" r="4.5" class="c3d-g-pt"/>';
        const label = (s, v, name) => '<text x="' + graphX(s).toFixed(1) + '" y="' + (graphY(v) + (v > 0 ? -9 : 17)).toFixed(1) + '" class="c3d-g-txt" text-anchor="middle"><tspan font-weight="700">' + name + '</tspan> ' + fv(v) + ' V</text>';
        const mid = (PATH.pG + PATH.pD) / 2;
        el.innerHTML = '<div class="c3d-ohm-title">Δυναμικό κατά μήκος της διαδρομής</div>' +
            '<svg viewBox="0 0 320 168" class="c3d-graph" role="img" aria-label="Γράφημα δυναμικού">' +
            '<line x1="34" y1="' + graphY(0) + '" x2="308" y2="' + graphY(0) + '" class="c3d-g-axis"/>' +
            '<line x1="34" y1="22" x2="34" y2="' + graphY(0) + '" class="c3d-g-axis"/>' +
            '<text x="38" y="16" class="c3d-g-cap">δυναμικό V (αρνητικός πόλος = 0 V)</text>' +
            '<text x="308" y="158" class="c3d-g-cap" text-anchor="end">διαδρομή του φορτίου →</text>' +
            '<polyline points="' + pts + '" class="c3d-g-line"/>' +
            circle(PATH.pA, V) + circle(PATH.pG, V) + circle(PATH.pD, V) + circle(PATH.pE, V) + circle(PATH.pZ, 0) + circle(PATH.pB, 0) +
            label(PATH.pA, V, LET[0]) + label(mid, V, LET[1] + '·' + LET[2]) + label(PATH.pE, V, LET[3]) + label(PATH.pZ, 0, LET[4]) + label(PATH.pB, 0, LET[5]) +
            '<circle id="c3d-gdot" cx="' + graphX(0) + '" cy="' + graphY(V) + '" r="6.5" class="c3d-g-dot"/></svg>' +
            '<ul class="c3d-follow-list">' +
            '<li><b>' + LET[0] + '</b> θετικός πόλος (+)</li><li><b>' + LET[5] + '</b> αρνητικός πόλος (−)</li>' +
            '<li><b>' + LET[1] + '</b> είσοδος διακόπτη</li><li><b>' + LET[2] + '</b> έξοδος διακόπτη</li>' +
            '<li><b>' + LET[3] + '</b> είσοδος λαμπτήρα</li><li><b>' + LET[4] + '</b> έξοδος λαμπτήρα</li></ul>' +
            (state.closed
                ? '<p class="c3d-ohm-note" style="opacity:1;animation:none">Στον λαμπτήρα (' + LET[3] + '→' + LET[4] + ') το δυναμικό πέφτει κατά ' + fv(I * state.R) + ' V (= I·R). Μέσα στην πηγή (' + LET[5] + '→' + LET[0] + ') το φορτίο «ανεβαίνει» ξανά κατά ' + state.V + ' V.</p>'
                : '<p class="c3d-ohm-note" style="opacity:1;animation:none">Κλείστε τον διακόπτη για να ξεκινήσει το φορτίο τη διαδρομή του.</p>');
    }

    function updateEquiPanel() {
        const el = document.getElementById('c3d-equi-panel');
        if (!el) return;
        el.hidden = !state.equi;
        if (!state.equi) return;
        const sw = (c) => '<span class="c3d-sw c3d-sw-' + c + '"></span>';
        const [A, G, D, E, Z, B] = LET;
        el.innerHTML = '<div class="c3d-ohm-title">Ισοδυναμικά τμήματα του κυκλώματος</div>' +
            '<p class="c3d-eq-lead">Ισοδυναμικά είναι τα σημεία που βρίσκονται στο ίδιο δυναμικό: ανάμεσά τους δεν υπάρχει τάση.</p>' +
            (state.closed
                ? '<p class="c3d-eq-line">' + sw('h') + '<b>' + state.V + ' V:</b> από τον θετικό πόλο (' + A + ') μέσω του καλωδίου και του κλειστού διακόπτη (' + G + '→' + D + ') έως την είσοδο του λαμπτήρα (' + E + ').</p>' +
                  '<p class="c3d-eq-line">' + sw('l') + '<b>0 V:</b> από την έξοδο του λαμπτήρα (' + Z + ') μέσω του καλωδίου έως τον αρνητικό πόλο (' + B + ').</p>' +
                  '<p class="c3d-ohm-note" style="opacity:1;animation:none">Ο λαμπτήρας (' + E + '→' + Z + ') και η πηγή (' + B + '→' + A + ') δεν έχουν ισοδυναμικά σημεία: εκεί το δυναμικό μεταβάλλεται. Η κίνηση των φορτίων αναστέλλεται όσο η επιλογή είναι ενεργή.</p>'
                : '<p class="c3d-eq-line">' + sw('h') + '<b>' + state.V + ' V:</b> από τον θετικό πόλο (' + A + ') έως την πρώτη επαφή του ανοιχτού διακόπτη (' + G + ').</p>' +
                  '<p class="c3d-eq-line">' + sw('l') + '<b>0 V:</b> από τη δεύτερη επαφή του διακόπτη (' + D + '), μέσω του λαμπτήρα (χωρίς ρεύμα δεν υπάρχει πτώση τάσης) έως τον αρνητικό πόλο (' + B + ').</p>' +
                  '<p class="c3d-ohm-note" style="opacity:1;animation:none">Όλη η τάση της πηγής (' + state.V + ' V) εμφανίζεται στα άκρα του ανοιχτού διακόπτη.</p>');
    }

    /* -------------------------------------------------------------- scene */
    function textSprite(text, color) {
        const c = document.createElement('canvas');
        c.width = c.height = 128;
        const g = c.getContext('2d');
        g.font = 'bold 110px Arial';
        g.textAlign = 'center';
        g.textBaseline = 'middle';
        g.fillStyle = color;
        g.fillText(text, 64, 70);
        const tex = new THREE.CanvasTexture(c);
        const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true }));
        sp.scale.set(0.9, 0.9, 0.9);
        return sp;
    }

    function cylinderBetween(a, b, radius, mat) {
        const dir = new THREE.Vector3().subVectors(b, a);
        const len = dir.length();
        const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, len, 16), mat);
        mesh.position.copy(a).addScaledVector(dir, 0.5);
        mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
        return mesh;
    }

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
        scene.fog = new THREE.Fog(0x0b1220, 15, 36);
        scene.add(new THREE.HemisphereLight(0xcfe3ff, 0x1a2540, 0.85));
        const sun = new THREE.DirectionalLight(0xffffff, 0.8);
        sun.position.set(6, 10, 8);
        scene.add(sun);
        const bulbLight = new THREE.PointLight(0xffd24a, 0, 18);
        bulbLight.position.set(0, H + 1.4, -3);
        scene.add(bulbLight);

        const fc = document.createElement('canvas');
        fc.width = fc.height = 256;
        const fg = fc.getContext('2d');
        const fgr = fg.createRadialGradient(128, 128, 10, 128, 128, 128);
        fgr.addColorStop(0, '#1d3157');
        fgr.addColorStop(0.7, '#111c33');
        fgr.addColorStop(1, '#0b1220');
        fg.fillStyle = fgr; fg.fillRect(0, 0, 256, 256);
        const floor = new THREE.Mesh(new THREE.CircleGeometry(10, 64), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(fc) }));
        floor.rotation.x = -Math.PI / 2;
        scene.add(floor);
        const grid = new THREE.GridHelper(18, 18, 0x2b3b5c, 0x1b2740);
        grid.position.y = 0.01;
        grid.material.transparent = true;
        grid.material.opacity = 0.4;
        scene.add(grid);

        // soft fake shadows under the components (cheap: one textured quad each)
        const sc = document.createElement('canvas');
        sc.width = sc.height = 64;
        const sg = sc.getContext('2d');
        const sgr = sg.createRadialGradient(32, 32, 2, 32, 32, 32);
        sgr.addColorStop(0, 'rgba(0,0,0,0.6)');
        sgr.addColorStop(1, 'rgba(0,0,0,0)');
        sg.fillStyle = sgr; sg.fillRect(0, 0, 64, 64);
        const shadowTex = new THREE.CanvasTexture(sc);
        [[0, 3, 4.2, 2.2], [0, -3, 2.2, 2.2], [4, 0, 2.0, 2.8]].forEach(([x, z, w, d]) => {
            const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false }));
            m.rotation.x = -Math.PI / 2;
            m.position.set(x, 0.02, z);
            scene.add(m);
        });

        const pickables = [];
        const tag = (obj, kind) => {
            obj.traverse((o) => { if (o.isMesh) { o.userData.kind = kind; pickables.push(o); } });
        };

        // wires
        const wireMat = new THREE.MeshStandardMaterial({ color: 0x2f80ff, metalness: 0.3, roughness: 0.4 });
        const pts = (x, z) => new THREE.Vector3(x, H, z);
        const segs = [
            [pts(BATTERY_X, 3), pts(4, 3)],
            [pts(4, 3), pts(4, 0.6)],
            [pts(4, -0.6), pts(4, -3)],
            [pts(4, -3), pts(0.55, -3)],
            [pts(-0.55, -3), pts(-4, -3)],
            [pts(-4, -3), pts(-4, 3)],
            [pts(-4, 3), pts(-BATTERY_X, 3)]
        ];
        const wires = new THREE.Group();
        segs.forEach(([a, b]) => wires.add(cylinderBetween(a, b, 0.09, wireMat)));
        [pts(4, 3), pts(4, -3), pts(-4, -3), pts(-4, 3)].forEach((p) => {
            const s = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 16), wireMat);
            s.position.copy(p);
            wires.add(s);
        });
        scene.add(wires);
        tag(wires, 'wire');

        // battery (at z = 3, along x)
        const battery = new THREE.Group();
        const body = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 2.4, 32), new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.4, metalness: 0.2 }));
        body.rotation.z = Math.PI / 2;
        const band = new THREE.Mesh(new THREE.CylinderGeometry(0.565, 0.565, 0.9, 32), new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.4, metalness: 0.15 }));      // blue negative end, readable on the dark background
        band.rotation.z = Math.PI / 2;
        band.position.x = -0.75;
        const pinMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.7, roughness: 0.3 });
        const pinP = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.35, 16), pinMat);
        pinP.rotation.z = Math.PI / 2; pinP.position.x = 1.3;
        const pinN = pinP.clone(); pinN.position.x = -1.3;
        const capMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.8, roughness: 0.25 });
        const capP = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.58, 0.16, 32), capMat);
        capP.rotation.z = Math.PI / 2; capP.position.x = 1.2;
        const stripe = new THREE.Mesh(new THREE.CylinderGeometry(0.57, 0.57, 0.1, 32), new THREE.MeshStandardMaterial({ color: 0xfff7ed, roughness: 0.4 }));
        stripe.rotation.z = Math.PI / 2; stripe.position.x = 0.1;
        battery.add(body, band, capP, stripe, pinP, pinN);
        const plus = textSprite('+', '#ffffff'); plus.position.set(0.7, 0.95, 0);
        const minus = textSprite('−', '#ffffff'); minus.position.set(-0.75, 0.95, 0);
        battery.add(plus, minus);
        battery.position.set(0, H, 3);
        scene.add(battery);
        tag(battery, 'battery');

        // switch (at x = 4): terminals at z = ±0.6, lever pivots at z = +0.6
        const sw = new THREE.Group();
        const base = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.25, 1.9), new THREE.MeshStandardMaterial({ color: 0x4ade80, roughness: 0.5 }));
        base.position.set(0, -0.28, 0);
        const post1 = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.3, 16), pinMat); post1.position.set(0, -0.05, 0.6);
        const post2 = post1.clone(); post2.position.set(0, -0.05, -0.6);
        const lever = new THREE.Group();
        const leverBar = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 1.25, 12), new THREE.MeshStandardMaterial({ color: 0xe5e7eb, metalness: 0.6, roughness: 0.3 }));
        leverBar.rotation.x = Math.PI / 2;
        leverBar.position.set(0, 0, -0.625);
        lever.add(leverBar);
        const knob = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 16), new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.35 }));
        knob.position.set(0, 0, -1.25);
        lever.add(knob);
        lever.position.set(0, 0.0, 0.6);
        sw.add(base, post1, post2, lever);
        sw.position.set(4, H, 0);
        scene.add(sw);
        tag(sw, 'switch');

        // bulb (at z = -3)
        const bulb = new THREE.Group();
        const socket = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.36, 0.7, 24), new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.5, roughness: 0.4 }));
        socket.position.y = -0.05;
        const glassMat = new THREE.MeshStandardMaterial({ color: 0xfff6d5, transparent: true, opacity: 0.55, roughness: 0.15, emissive: 0xffc83d, emissiveIntensity: 0 });
        const glass = new THREE.Mesh(new THREE.SphereGeometry(0.85, 32, 32), glassMat);
        glass.position.y = 1.0;
        const filMat = new THREE.MeshStandardMaterial({ color: 0xffe9a3, emissive: 0xffa500, emissiveIntensity: 0 });
        const filament = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.04, 8, 24), filMat);
        filament.position.y = 1.0;
        const terminalL = cylinderBetween(new THREE.Vector3(-0.55, 0, 0), new THREE.Vector3(-0.3, 0, 0), 0.09, wireMat);
        const terminalR = cylinderBetween(new THREE.Vector3(0.3, 0, 0), new THREE.Vector3(0.55, 0, 0), 0.09, wireMat);
        const hc = document.createElement('canvas');
        hc.width = hc.height = 128;
        const hg = hc.getContext('2d');
        const grad = hg.createRadialGradient(64, 64, 0, 64, 64, 64);
        grad.addColorStop(0, 'rgba(255,220,120,1)');
        grad.addColorStop(0.35, 'rgba(255,200,80,0.45)');
        grad.addColorStop(1, 'rgba(255,200,80,0)');
        hg.fillStyle = grad; hg.fillRect(0, 0, 128, 128);
        const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(hc), transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
        halo.position.y = 1.0;
        bulb.add(halo);
        const ringMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.7, roughness: 0.35 });
        [-0.28, -0.12, 0.04].forEach((y) => {
            const ring = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.035, 8, 24), ringMat);
            ring.rotation.x = Math.PI / 2; ring.position.y = y;
            bulb.add(ring);
        });
        const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 0.4, 24), new THREE.MeshStandardMaterial({ color: 0xfff6d5, transparent: true, opacity: 0.5, roughness: 0.2 }));
        neck.position.y = 0.4;
        const fPost = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.7, 6), ringMat);
        fPost.position.set(0.12, 0.62, 0);
        const fPost2 = fPost.clone(); fPost2.position.x = -0.12;
        bulb.add(neck, fPost, fPost2);
        bulb.add(socket, glass, filament, terminalL, terminalR);
        bulb.position.set(0, H, -3);
        scene.add(bulb);
        tag(bulb, 'bulb');

        // direction arrows and moving charges along the loop
        const loop = [pts(BATTERY_X, 3), pts(4, 3), pts(4, -3), pts(-4, -3), pts(-4, 3), pts(-BATTERY_X, 3)];
        const segLen = [];
        let total = 0;
        for (let i = 0; i < loop.length; i++) {
            const a = loop[i], b = loop[(i + 1) % loop.length];
            const d = a.distanceTo(b);
            segLen.push(d);
            total += d;
        }
        const closingLen = segLen[segLen.length - 1];            // inside the battery, not drawn
        const posAt = (s) => {
            let t = ((s % total) + total) % total;
            for (let i = 0; i < loop.length; i++) {
                if (t <= segLen[i]) {
                    const a = loop[i], b = loop[(i + 1) % loop.length];
                    return { p: a.clone().lerp(b, t / segLen[i]), inside: i === loop.length - 1, tangent: b.clone().sub(a).normalize() };
                }
                t -= segLen[i];
            }
            return { p: loop[0].clone(), inside: false, tangent: new THREE.Vector3(1, 0, 0) };
        };

        const charges = new THREE.Group();
        const chargeMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, emissive: 0xf59e0b, emissiveIntensity: 0.8 });
        const N = 36;
        for (let i = 0; i < N; i++) {
            const m = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 10), chargeMat);
            m.userData.s = (i * total) / N;
            charges.add(m);
        }
        scene.add(charges);

        const arrows = new THREE.Group();
        const arrowMat = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xb91c1c, emissiveIntensity: 0.6 });
        {
            const info = posAt(1.5);                                // a single arrow just after the + pole
            const cone = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.5, 16), arrowMat);
            cone.position.copy(info.p).add(new THREE.Vector3(0, 0.3, 0));
            cone.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), info.tangent);
            arrows.add(cone);
        }
        scene.add(arrows);

        // equipotential overlays: {mesh, open side, closed side}, side 'H' (high) / 'L' (low) / null (not shown)
        const equi = [];
        const eqMat = (op) => new THREE.MeshBasicMaterial({ color: EQ_LO, transparent: true, opacity: op, depthWrite: false });
        const eqTube = (a, b, open, closed, r) => {
            const m = cylinderBetween(a, b, r || 0.17, eqMat(0.8));
            m.visible = false; scene.add(m); equi.push({ m, open, closed });
        };
        eqTube(pts(BATTERY_X, 3), pts(4, 3), 'H', 'H');
        eqTube(pts(4, 3), pts(4, 0.6), 'H', 'H');
        eqTube(pts(4, 0.6), pts(4, -0.6), null, 'H', 0.12);       // the closed lever bridges the two posts
        eqTube(pts(4, -0.6), pts(4, -3), 'L', 'H');
        eqTube(pts(4, -3), pts(0.55, -3), 'L', 'H');
        eqTube(pts(0.55, -3), pts(0.3, -3), 'L', 'H');
        eqTube(pts(-0.3, -3), pts(-0.55, -3), 'L', 'L');
        eqTube(pts(-0.55, -3), pts(-4, -3), 'L', 'L');
        eqTube(pts(-4, -3), pts(-4, 3), 'L', 'L');
        eqTube(pts(-4, 3), pts(-BATTERY_X, 3), 'L', 'L');
        const eqBlob = (x, y, z, r, open, closed, shape) => {
            const m = new THREE.Mesh(shape === 'cyl' ? new THREE.CylinderGeometry(r, r, 1.0, 20) : new THREE.SphereGeometry(r, 16, 16), eqMat(0.4));
            m.position.set(x, y, z); m.visible = false; scene.add(m); equi.push({ m, open, closed });
        };
        eqBlob(4, H - 0.05, 0.6, 0.3, 'H', 'H');                  // switch post Γ
        eqBlob(4, H - 0.05, -0.6, 0.3, 'L', 'H');                 // switch post Δ
        eqBlob(0, H, -3, 0.52, 'L', null, 'cyl');                 // bulb socket, no current -> same potential as the - pole
        eqBlob(0, H + 1.0, -3, 0.95, 'L', null);                  // bulb glass

        // follower: a big glowing positive test charge
        const follower = new THREE.Group();
        const fMat = new THREE.MeshStandardMaterial({ color: 0xff5a36, emissive: 0xff2d00, emissiveIntensity: 1.2 });
        const fBall = new THREE.Mesh(new THREE.SphereGeometry(0.26, 24, 24), fMat);
        const fPlus = textSprite('+', '#ffffff');
        fPlus.scale.set(0.5, 0.5, 0.5);
        fPlus.material.depthTest = false;
        fPlus.renderOrder = 10;
        const fGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: halo.material.map, transparent: true, opacity: 0.85, depthWrite: false, blending: THREE.AdditiveBlending, color: 0xff6a3d }));
        fGlow.scale.setScalar(1.6);
        follower.add(fBall, fGlow, fPlus);
        follower.visible = false;
        scene.add(follower);

        // small rings on the six checkpoints; their letters are DOM chips so they never hide behind the components
        const markers = new THREE.Group();
        [pts(BATTERY_X, 3), pts(4, 0.6), pts(4, -0.6), pts(0.55, -3), pts(-0.55, -3), pts(-BATTERY_X, 3)].forEach((p) => {
            const ring = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.03, 8, 32), new THREE.MeshBasicMaterial({ color: 0xfacc15, depthTest: false, transparent: true }));
            ring.rotation.x = Math.PI / 2;
            ring.position.copy(p);
            ring.renderOrder = 5;
            markers.add(ring);
        });
        markers.visible = false;
        scene.add(markers);

        return { renderer, scene, camera, pickables, lever, halo, glassMat, filMat, bulbLight, charges, arrows, posAt, total, closingLen, stage, follower, fMat, markers, equi };
    }

    /* ------------------------------------------------------ camera control */
    function startApp(mount) {
        const stage = mount.querySelector('#c3d-stage');
        let sceneObjs;
        try {
            sceneObjs = buildScene(stage);
        } catch (err) {
            stage.innerHTML = '<p class="c3d-error">Ο φυλλομετρητής δεν υποστηρίζει WebGL, οπότε η τρισδιάστατη προβολή δεν είναι διαθέσιμη.</p>';
            return null;
        }
        const o = sceneObjs;
        const view = { theta: DEFAULT_VIEW.theta, phi: DEFAULT_VIEW.phi, radius: DEFAULT_VIEW.radius, target: new THREE.Vector3(...DEFAULT_VIEW.target) };
        const want = { theta: view.theta, phi: view.phi, radius: view.radius, target: view.target.clone() };
        let leverAngle = 0.75, brightness = 0;
        const fs = { s: 0, dwell: 1.4, next: 1, active: false, cp: 0 };
        const CPS = [PATH.pA, PATH.pG, PATH.pD, PATH.pE, PATH.pZ, PATH.pB];
        const CPNAMES = [LET[0] + ' · Θετικός πόλος (+)', LET[1] + ' · Είσοδος διακόπτη', LET[2] + ' · Έξοδος διακόπτη',
            LET[3] + ' · Είσοδος λαμπτήρα', LET[4] + ' · Έξοδος λαμπτήρα', LET[5] + ' · Αρνητικός πόλος (−)'];
        // letter chips for the checkpoints: [point, centre of the component it belongs to] (the chip is pushed away from that centre on screen)
        const CHIPPOS = [[BATTERY_X, 3, 0, 3], [4, 0.6, 4, 0], [4, -0.6, 4, 0], [0.55, -3, 0, -3], [-0.55, -3, 0, -3], [-BATTERY_X, 3, 0, 3]];
        const chips = CHIPPOS.map((c, i) => {
            const el = document.createElement('div');
            el.className = 'c3d-chip';
            el.textContent = LET[i];
            el.style.display = 'none';
            stage.appendChild(el);
            return { el, x: c[0], z: c[1], cx: c[2], cz: c[3] };
        });
        const mkCard = (cls) => {
            const el = document.createElement('div');
            el.className = 'c3d-label ' + cls;
            el.style.display = 'none';
            stage.appendChild(el);
            return el;
        };
        const eqHiCard = mkCard('c3d-eq-h'), eqLoCard = mkCard('c3d-eq-l');

        const dom = o.renderer.domElement;
        const pointers = new Map();
        let moved = 0, lastPinch = 0;
        dom.style.touchAction = 'none';

        function pick(ev) {
            const r = dom.getBoundingClientRect();
            const ndc = new THREE.Vector2(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
            const ray = new THREE.Raycaster();
            ray.setFromCamera(ndc, o.camera);
            const hit = ray.intersectObjects(o.pickables, false)[0];
            return hit || null;
        }

        dom.addEventListener('pointerdown', (e) => {
            dom.setPointerCapture(e.pointerId);
            pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
            moved = 0;
            lastPinch = 0;
        });
        dom.addEventListener('pointermove', (e) => {
            const prev = pointers.get(e.pointerId);
            if (!prev) {
                dom.style.cursor = pick(e) ? 'pointer' : 'grab';
                return;
            }
            if (pointers.size === 2) {
                pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
                const [a, b] = [...pointers.values()];
                const d = Math.hypot(a.x - b.x, a.y - b.y);
                if (lastPinch) want.radius = Math.min(22, Math.max(3, want.radius * (lastPinch / d)));
                lastPinch = d;
                moved += 10;
                return;
            }
            const dx = e.clientX - prev.x, dy = e.clientY - prev.y;
            moved += Math.abs(dx) + Math.abs(dy);
            want.theta -= dx * 0.007;
            want.phi = Math.min(1.5, Math.max(0.15, want.phi - dy * 0.007));
            pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
        });
        const end = (e) => {
            const wasClick = pointers.has(e.pointerId) && pointers.size === 1 && moved < 6;
            pointers.delete(e.pointerId);
            if (wasClick) {
                const hit = pick(e);
                if (hit) select(hit);
            }
        };
        dom.addEventListener('pointerup', end);
        dom.addEventListener('pointercancel', (e) => pointers.delete(e.pointerId));
        dom.addEventListener('wheel', (e) => {
            e.preventDefault();
            want.radius = Math.min(22, Math.max(3, want.radius * (1 + e.deltaY * 0.0012)));
        }, { passive: false });

        function select(hit) {
            const kind = hit.object.userData.kind;
            state.selected = kind;
            if (kind === 'switch') setClosed(!state.closed);   // a click on the switch also toggles it
            const focus = {
                battery: [0, H, 3], bulb: [0, H + 1, -3], switch: [4, H, 0]
            }[kind];
            want.target.set(...(focus || [hit.point.x, hit.point.y, hit.point.z]));
            want.radius = kind === 'wire' ? 6.5 : 5.5;
            selPoint = {
                battery: [0, H + 1.3, 3], bulb: [0, H + 2.4, -3], switch: [4, H + 1.0, 0]
            }[kind] || [hit.point.x, hit.point.y + 0.6, hit.point.z];
        }

        o.resetView = () => {
            want.theta = DEFAULT_VIEW.theta; want.phi = DEFAULT_VIEW.phi; want.radius = DEFAULT_VIEW.radius;
            want.target.set(...DEFAULT_VIEW.target);
            state.selected = null;
            selPoint = null;
        };

        const labs = {
            battery: mount.querySelector('#c3d-lab-battery'),
            bulb: mount.querySelector('#c3d-lab-bulb'),
            switch: mount.querySelector('#c3d-lab-switch')
        };
        let selPoint = null;
        const labFollow = mount.querySelector('#c3d-lab-follow');
        const project = (x, y, z, el) => {
            const v = new THREE.Vector3(x, y, z).project(o.camera);
            const r = dom.getBoundingClientRect();
            if (v.z > 1) { el.style.display = 'none'; return; }
            el.style.display = 'block';
            el.style.left = ((v.x * 0.5 + 0.5) * r.width) + 'px';
            el.style.top = ((-v.y * 0.5 + 0.5) * r.height) + 'px';
        };

        const ro = new ResizeObserver(() => {
            const w = stage.clientWidth, h = stage.clientHeight;
            if (w > 0 && h > 0) {
                o.renderer.setSize(w, h);
                o.camera.aspect = w / h;
                o.camera.updateProjectionMatrix();
            }
        });
        ro.observe(stage);

        const row = (sym, val, unit) => '<span class="c3d-q c3d-q-' + sym + '"><i>' + sym + '</i></span><span class="c3d-n">=</span><span class="c3d-v">' + val + '</span><span class="c3d-u">' + unit + '</span>';
        let last = performance.now();
        function tick(now) {
            if (!document.body.contains(stage)) { ro.disconnect(); o.renderer.dispose(); return; }
            requestAnimationFrame(tick);
            const dt = Math.min(0.05, (now - last) / 1000);
            last = now;
            if (!stage.clientWidth) return;                       // tab hidden

            const k = 1 - Math.exp(-dt * 6);
            view.theta += (want.theta - view.theta) * k;
            view.phi += (want.phi - view.phi) * k;
            view.radius += (want.radius - view.radius) * k;
            view.target.lerp(want.target, k);
            o.camera.position.set(
                view.target.x + view.radius * Math.sin(view.phi) * Math.sin(view.theta),
                view.target.y + view.radius * Math.cos(view.phi),
                view.target.z + view.radius * Math.sin(view.phi) * Math.cos(view.theta));
            o.camera.lookAt(view.target);

            // switch lever
            const targetAngle = state.closed ? 0 : 0.75;
            leverAngle += (targetAngle - leverAngle) * (1 - Math.exp(-dt * 10));
            o.lever.rotation.x = leverAngle;

            // bulb brightness
            const targetB = state.closed ? Math.min(1, Math.pow(currentI() / 2, 0.7)) : 0;
            brightness += (targetB - brightness) * (1 - Math.exp(-dt * 5));
            o.glassMat.emissiveIntensity = brightness * 3.0;
            o.glassMat.opacity = 0.55 + brightness * 0.3;
            o.halo.material.opacity = brightness * 0.9;
            o.halo.scale.setScalar(1.5 + brightness * 3.2);
            o.filMat.emissiveIntensity = brightness * 4;
            o.bulbLight.intensity = brightness * 3.5;

            // moving charges and arrows (suspended while the equipotential view is on)
            const I = currentI();
            const speed = Math.min(6, 0.6 + 1.2 * I);
            const simDt = state.paused ? 0 : dt * state.speed;      // pause / speed apply to the charges only, the camera stays interactive
            o.charges.visible = state.closed && !state.follow && !state.equi;
            o.arrows.visible = state.closed && !state.equi;
            if (o.charges.visible) {
                o.charges.children.forEach((m) => {
                    m.userData.s += speed * simDt;
                    const info = o.posAt(m.userData.s);
                    m.position.copy(info.p);
                    m.visible = !info.inside;
                });
            }

            // positive test charge following the conventional current
            const act = state.follow && state.closed && !state.equi;
            if (act && !fs.active) { fs.s = 0; fs.next = 1; fs.dwell = 1.4; fs.cp = 0; }
            fs.active = act;
            o.follower.visible = act;
            labFollow.style.display = act ? 'block' : 'none';
            if (act) {
                if (fs.dwell > 0) fs.dwell -= simDt;
                else {
                    fs.s += (fs.s >= PATH.pE && fs.s < PATH.pZ ? 0.9 : 2.0) * simDt;
                    if (fs.next <= 5 && fs.s >= CPS[fs.next]) {
                        fs.s = CPS[fs.next]; fs.cp = fs.next; fs.next++;
                        fs.dwell = (fs.cp === 3 || fs.cp === 4) ? 3.2 : (fs.cp === 5 ? 2.6 : 1.8);
                    } else if (fs.s >= PATH.total) { fs.s = 0; fs.cp = 0; fs.next = 1; fs.dwell = 1.8; }
                }
                const atCp = fs.dwell > 0;
                const info = o.posAt(fs.s);
                o.follower.position.copy(info.p);
                o.fMat.depthTest = !info.inside;
                o.follower.scale.setScalar(atCp ? 1.25 * (1 + 0.08 * Math.sin(now / 160)) : 1);
                const v = potAt(fs.s);
                const zone = fs.s >= PATH.pB ? 'battery' : (fs.s >= PATH.pE && fs.s <= PATH.pZ) ? 'bulb' : (fs.s >= PATH.pG && fs.s <= PATH.pD) ? 'switch' : (fs.s > 0 ? 'wire' : null);
                const zeroDrop = '<div class="c3d-fo-eq"><i>ΔV</i> = <i>I</i> · <i>R</i> = ' + fmt(I, 2) + ' A · 0 Ω = <b>0 V</b></div>';
                let ohm = '';
                if (zone === 'wire') {
                    ohm = '<div class="c3d-fo">Ιδανικό καλώδιο</div>' + zeroDrop +
                        '<p class="c3d-fnote">Δεν συμβαίνει πτώση τάσης (απώλεια δυναμικού), γιατί το καλώδιο, ως ιδανικό, θεωρείται ότι δεν παρουσιάζει καμία αντίσταση στη διέλευση του ηλεκτρικού ρεύματος, δηλαδή έχει <i>R</i> = 0 Ω.</p>';
                } else if (zone === 'switch') {
                    ohm = '<div class="c3d-fo">Ιδανικός διακόπτης</div>' + zeroDrop +
                        '<p class="c3d-fnote">Ο ιδανικός διακόπτης, όταν είναι κλειστός, δεν καταναλώνει ενέργεια (δεν προκαλεί πτώση τάσης), γιατί θεωρείται ότι δεν παρουσιάζει καμία αντίσταση στη διέλευση του ηλεκτρικού ρεύματος, δηλαδή έχει <i>R</i> = 0 Ω.</p>';
                } else if (zone === 'bulb') {
                    const drop = I * state.R;
                    ohm = '<div class="c3d-fo">Νόμος του Ohm στον λαμπτήρα</div>' +
                        '<div class="c3d-fo-eq"><i>ΔV</i> = <i>I</i> · <i>R</i> = ' + fmt(I, 2) + ' A · ' + state.R + ' Ω = <b>' + fv(drop) + ' V</b></div>' +
                        (atCp && fs.cp === 4 ? '<div class="c3d-fo-eq"><i>V</i><sub>' + LET[4] + '</sub> = <i>V</i><sub>' + LET[3] + '</sub> − <i>ΔV</i> = ' + fv(state.V) + ' − ' + fv(drop) + ' = <b>' + fv(v) + ' V</b></div>' : '') +
                        '<p class="c3d-fnote">Ο λαμπτήρας (αντιστάτης) παρουσιάζει αντίσταση στη διέλευση των ηλεκτρικών φορτίων: για να τον διαπεράσουν απαιτείται κατανάλωση ενέργειας (που μετατρέπεται σε φως και θερμότητα). Η αντίστοιχη πτώση τάσης υπολογίζεται από τον νόμο του Ohm.</p>';
                } else if (zone === 'battery') {
                    ohm = '<div class="c3d-fo">Πηγή</div>' +
                        '<div class="c3d-fo-eq"><i>ΔV</i> = <i>V</i><sub>' + LET[0] + '</sub> − <i>V</i><sub>' + LET[5] + '</sub> = ' + fv(state.V) + ' − 0 = <b>+' + fv(state.V) + ' V</b></div>' +
                        '<p class="c3d-fnote">Η πηγή, καταναλώνοντας δική της χημική ενέργεια, προσφέρει ηλεκτρική ενέργεια στα φορτία καθώς τα μεταφέρει από τον αρνητικό (χαμηλού δυναμικού) πόλο προς τον θετικό (υψηλού δυναμικού) πόλο.</p>';
                }
                const fhtml = '<div class="c3d-fhead"><span class="c3d-fplus">+</span><span>' + (atCp ? CPNAMES[fs.cp] : regionName(fs.s)) + '</span></div>' +
                    '<div class="c3d-fval"><i>V</i> = ' + fv(v) + ' V</div>' + ohm;
                if (labFollow._html !== fhtml) { labFollow._html = fhtml; labFollow.innerHTML = fhtml; }
                labFollow.classList.toggle('c3d-label-active', atCp);
                project(info.p.x, info.p.y - 0.45, info.p.z, labFollow);
                // keep the card inside the stage: flip it above the charge near the bottom edge, shift it sideways near the sides
                const cw = labFollow.offsetWidth, ch = labFollow.offsetHeight;
                if (cw) {
                    const sw = stage.clientWidth, sh = Math.min(stage.clientHeight, window.innerHeight - stage.getBoundingClientRect().top);   // visible part of the stage
                    const x = parseFloat(labFollow.style.left), y = parseFloat(labFollow.style.top);
                    const flip = y + 22 + ch > sh - 6 && y - 40 - ch > 6;
                    labFollow.classList.toggle('c3d-flip', flip);
                    const nx = Math.min(Math.max(x, cw / 2 + 6), Math.max(cw / 2 + 6, sw - cw / 2 - 6));
                    labFollow.style.left = nx + 'px';
                    labFollow.style.setProperty('--ax', Math.max(-cw / 2 + 18, Math.min(cw / 2 - 18, x - nx)) + 'px');
                    if (!flip) {
                        const maxTop = sh - 6 - ch - 22;
                        if (y > maxTop) labFollow.style.top = Math.max(maxTop, -16) + 'px';
                    }
                }
                const gdot = document.getElementById('c3d-gdot');
                if (gdot) { gdot.setAttribute('cx', graphX(fs.s).toFixed(1)); gdot.setAttribute('cy', graphY(v).toFixed(1)); }
            }

            // checkpoint rings + letter chips (screen-space, pushed away from their component so they stay readable from any angle)
            const chipsOn = state.follow || state.equi;
            o.markers.visible = chipsOn;
            const rect = dom.getBoundingClientRect();
            const toPx = (x, y, z) => {
                const q = new THREE.Vector3(x, y, z).project(o.camera);
                return { x: (q.x * 0.5 + 0.5) * rect.width, y: (-q.y * 0.5 + 0.5) * rect.height, z: q.z };
            };
            chips.forEach((c, i) => {
                if (!chipsOn) { c.el.style.display = 'none'; return; }
                const pa = toPx(c.x, H, c.z), pc = toPx(c.cx, H, c.cz);
                if (pa.z > 1) { c.el.style.display = 'none'; return; }
                let dx = pa.x - pc.x, dy = pa.y - pc.y;
                const len = Math.hypot(dx, dy);
                if (len < 4) { dx = 0; dy = -1; } else { dx /= len; dy /= len; }
                c.el.style.display = 'block';
                c.el.style.left = (pa.x + dx * 28) + 'px';
                c.el.style.top = (pa.y + dy * 28) + 'px';
                c.el.classList.toggle('c3d-chip-active', act && fs.dwell > 0 && fs.cp === i);
            });

            // equipotential highlight
            o.equi.forEach((e) => {
                const side = state.closed ? e.closed : e.open;
                e.m.visible = state.equi && !!side;
                if (side) e.m.material.color.setHex(side === 'H' ? EQ_HI : EQ_LO);
            });
            eqHiCard.style.display = eqLoCard.style.display = state.equi ? 'block' : 'none';
            if (state.equi) {
                const hiHtml = '<div class="c3d-lt">Ισοδυναμικό τμήμα</div><div class="c3d-lg">' + row('V', state.V, 'V') + '</div>';
                const loHtml = '<div class="c3d-lt">Ισοδυναμικό τμήμα</div><div class="c3d-lg">' + row('V', 0, 'V') + '</div>';
                if (eqHiCard._html !== hiHtml) { eqHiCard._html = hiHtml; eqHiCard.innerHTML = hiHtml; }
                if (eqLoCard._html !== loHtml) { eqLoCard._html = loHtml; eqLoCard.innerHTML = loHtml; }
                project(2.7, H + 0.5, 3, eqHiCard);
                project(-4, H + 0.5, 0, eqLoCard);
            }

            const vSw = state.closed ? 0 : state.V;
            const card = (title, rows) => '<div class="c3d-lt">' + title + '</div><div class="c3d-lg">' + rows.join('') + '</div>';
            const html = {
                battery: card('Μπαταρία', [row('V', state.V, 'V'), row('I', fmt(I, 2), 'A')]),
                bulb: card('Λαμπτήρας', [row('R', state.R, 'Ω'), row('V', fmt(I * state.R, 1), 'V'), row('I', fmt(I, 2), 'A')]),
                switch: card(state.closed ? 'Διακόπτης (κλειστός)' : 'Διακόπτης (ανοιχτός)', [row('V', fmt(vSw, 1), 'V'), row('I', fmt(I, 2), 'A')])
            };
            const anchor = { battery: [0, H + 1.4, 3], bulb: [0, H + 2.6, -3], switch: [4, H + 1.1, 0] };
            Object.keys(labs).forEach((key) => {
                if (labs[key]._html !== html[key]) { labs[key]._html = html[key]; labs[key].innerHTML = html[key]; }
                labs[key].classList.toggle('c3d-label-active', state.selected === key);
                project(anchor[key][0], anchor[key][1], anchor[key][2], labs[key]);
            });

            o.renderer.render(o.scene, o.camera);
        }
        requestAnimationFrame(tick);
        return o;
    }

    function resetView() {
        if (app && app.resetView) app.resetView();
    }

    /* --------------------------------------------------------------- entry */
    function render(mount) {
        if (!mount) return;
        if (!mount.querySelector('.c3d-wrap')) {
            buildUi(mount);
            app = null;
            ensureThree().then(() => {
                if (!mount.isConnected) return;
                app = startApp(mount);
                refreshUi();
            }).catch(() => {
                const stage = mount.querySelector('#c3d-stage');
                if (stage) stage.innerHTML = '<p class="c3d-error">Δεν ήταν δυνατή η φόρτωση της βιβλιοθήκης 3D (Three.js). Ελέγξτε τη σύνδεση στο διαδίκτυο και ανανεώστε τη σελίδα.</p>';
            });
        }
        refreshUi();
    }

    return { render: render };
})();
