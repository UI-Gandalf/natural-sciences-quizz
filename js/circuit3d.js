/* Physics Γ: 3D introduction to the simple circuit (battery, switch, bulb, wires).
   Exposes window.Circuit3D.render(mount). Three.js is loaded on demand from a CDN.
   Drag to rotate, wheel or pinch to zoom, click an element to fly to it and read V, I, R.
   Closing the switch shows Ohm's law step by step, then the current starts to flow. */
window.Circuit3D = (function () {
    const THREE_URL = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    const H = 0.6;                          // height of the wires above the floor
    const BATTERY_X = 1.4;                  // x of the battery terminals (z = 3)
    const DEFAULT_VIEW = { theta: 0.55, phi: 1.0, radius: 13, target: [0, 0.6, 0] };

    const state = { V: 12, R: 10, closed: false, selected: null };
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
                    <button type="button" class="c3d-exit" data-act="exit">← Έξοδος</button>
                </div>
                <div class="c3d-side">
                    <div class="c3d-controls">
                        <button type="button" class="c3d-main-btn" data-act="toggle" id="c3d-toggle">Κλείσιμο διακόπτη</button>
                        <div class="c3d-row"><span>Τάση πηγής <strong id="c3d-vval"></strong></span>
                            <span class="c3d-pair"><button type="button" data-act="v-">−1 V</button><button type="button" data-act="v+">+1 V</button></span></div>
                        <div class="c3d-row"><span>Αντίσταση λαμπτήρα <strong id="c3d-rval"></strong></span>
                            <span class="c3d-pair"><button type="button" data-act="r-">−1 Ω</button><button type="button" data-act="r+">+1 Ω</button></span></div>
                        <button type="button" data-act="view" class="c3d-sub-btn">Επαναφορά προβολής</button>
                    </div>
                    <div class="c3d-ohm" id="c3d-ohm"></div>
                    <div class="c3d-info" id="c3d-info"></div>
                </div>
            </div>
        </div>`;
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
        updateInfo();
    }

    function updateInfo() {
        const el = document.getElementById('c3d-info');
        if (!el) return;
        const I = currentI(), P = powerP();
        const k = state.selected;
        let html;
        if (k === 'battery') {
            html = `<strong>Πηγή (μπαταρία)</strong><br>Τάση V = ${state.V} V<br>Ένταση I = ${fmt(I, 2)} A<br>Παρεχόμενη ισχύς P = V·I = ${fmt(state.V * I, 1)} W`;
        } else if (k === 'bulb') {
            html = `<strong>Λαμπτήρας (αντιστάτης)</strong><br>Αντίσταση R = ${state.R} Ω<br>Τάση στα άκρα V = I·R = ${fmt(I * state.R, 1)} V<br>Ένταση I = ${fmt(I, 2)} A<br>Ισχύς P = I²·R = ${fmt(P, 1)} W`;
        } else if (k === 'switch') {
            html = state.closed
                ? `<strong>Διακόπτης (κλειστός)</strong><br>Τάση στα άκρα V = 0 V (ιδανικός αγωγός)<br>Ένταση I = ${fmt(I, 2)} A`
                : `<strong>Διακόπτης (ανοιχτός)</strong><br>Τάση στα άκρα V = ${state.V} V (όλη η τάση της πηγής)<br>Ένταση I = 0 A`;
        } else if (k === 'wire') {
            html = `<strong>Αγωγός (καλώδιο)</strong><br>Αντίσταση R ≈ 0 Ω, τάση ≈ 0 V<br>Ένταση I = ${fmt(I, 2)} A (ίδια σε όλο το κύκλωμα σειράς)`;
        } else {
            html = 'Πατήστε ένα στοιχείο (μπαταρία, διακόπτη, λαμπτήρα ή καλώδιο) για να δείτε τις τιμές του.';
        }
        el.innerHTML = html;
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
        scene.add(new THREE.AmbientLight(0xffffff, 0.6));
        const sun = new THREE.DirectionalLight(0xffffff, 0.8);
        sun.position.set(6, 10, 8);
        scene.add(sun);
        const bulbLight = new THREE.PointLight(0xffd24a, 0, 18);
        bulbLight.position.set(0, H + 1.4, -3);
        scene.add(bulbLight);

        const floor = new THREE.Mesh(new THREE.CircleGeometry(9, 64), new THREE.MeshStandardMaterial({ color: 0x111c33, roughness: 0.95 }));
        floor.rotation.x = -Math.PI / 2;
        scene.add(floor);
        const grid = new THREE.GridHelper(18, 18, 0x2b3b5c, 0x1b2740);
        grid.position.y = 0.01;
        scene.add(grid);

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
            const s = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 12), wireMat);
            s.position.copy(p);
            wires.add(s);
        });
        scene.add(wires);
        tag(wires, 'wire');

        // battery (at z = 3, along x)
        const battery = new THREE.Group();
        const body = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 2.4, 32), new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.4, metalness: 0.2 }));
        body.rotation.z = Math.PI / 2;
        const band = new THREE.Mesh(new THREE.CylinderGeometry(0.565, 0.565, 0.9, 32), new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.5 }));
        band.rotation.z = Math.PI / 2;
        band.position.x = -0.75;
        const pinMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.7, roughness: 0.3 });
        const pinP = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.35, 16), pinMat);
        pinP.rotation.z = Math.PI / 2; pinP.position.x = 1.3;
        const pinN = pinP.clone(); pinN.position.x = -1.3;
        battery.add(body, band, pinP, pinN);
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
        const nArrows = 6;
        for (let k = 0; k < nArrows; k++) {
            const s = 1.6 + (k * (total - closingLen - 3.0)) / (nArrows - 1);
            const info = posAt(s);
            const cone = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.5, 16), arrowMat);
            cone.position.copy(info.p).add(new THREE.Vector3(0, 0.3, 0));
            cone.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), info.tangent);
            arrows.add(cone);
        }
        scene.add(arrows);

        return { renderer, scene, camera, pickables, lever, halo, glassMat, filMat, bulbLight, charges, arrows, posAt, total, closingLen, stage };
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
            else updateInfo();
            const focus = {
                battery: [0, H, 3], bulb: [0, H + 1, -3], switch: [4, H, 0]
            }[kind];
            want.target.set(...(focus || [hit.point.x, hit.point.y, hit.point.z]));
            want.radius = kind === 'wire' ? 6.5 : 5.5;
            selPoint = {
                battery: [0, H + 1.3, 3], bulb: [0, H + 2.4, -3], switch: [4, H + 1.0, 0]
            }[kind] || [hit.point.x, hit.point.y + 0.6, hit.point.z];
            if (kind === 'switch') updateInfo();
        }

        o.resetView = () => {
            want.theta = DEFAULT_VIEW.theta; want.phi = DEFAULT_VIEW.phi; want.radius = DEFAULT_VIEW.radius;
            want.target.set(...DEFAULT_VIEW.target);
            state.selected = null;
            selPoint = null;
            updateInfo();
        };

        const labs = {
            battery: mount.querySelector('#c3d-lab-battery'),
            bulb: mount.querySelector('#c3d-lab-bulb'),
            switch: mount.querySelector('#c3d-lab-switch')
        };
        let selPoint = null;
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

            // moving charges and arrows
            const I = currentI();
            const speed = Math.min(6, 0.6 + 1.2 * I);
            o.charges.visible = state.closed;
            o.arrows.visible = state.closed;
            if (state.closed) {
                o.charges.children.forEach((m) => {
                    m.userData.s += speed * dt;
                    const info = o.posAt(m.userData.s);
                    m.position.copy(info.p);
                    m.visible = !info.inside;
                });
            }

            const vSw = state.closed ? 0 : state.V;
            const row = (sym, val, unit) => '<span class="c3d-q c3d-q-' + sym + '"><i>' + sym + '</i></span><span class="c3d-n">=</span><span class="c3d-v">' + val + '</span><span class="c3d-u">' + unit + '</span>';
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
