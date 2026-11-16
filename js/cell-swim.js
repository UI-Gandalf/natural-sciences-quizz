/* ==========================================================================
   Biology Γ: "Κολύμπι μέσα στο κύτταρο" - a 3D journey inside the eukaryotic cell (animal / plant).
   You swim between the organelles, click on them to discover them and read the school-book description,
   take a guided tour, zoom into the plasma membrane and play the "find the organelle" missions.
   The texts come from window.CellExplorer.content (the same school-book material as the 2D explorer, sheets Γ3.1 - Γ3.4).
   Three.js r128 is loaded on demand. window.CellSwim.render(mountElement)
   ========================================================================== */
window.CellSwim = (function () {
    'use strict';
    const THREE_URL = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    let threeLoading = null;
    function ensureThree() {
        if (window.THREE) return Promise.resolve();
        if (!threeLoading) {
            threeLoading = new Promise((resolve, reject) => {
                const s = document.createElement('script');
                s.src = THREE_URL; s.onload = resolve;
                s.onerror = () => { threeLoading = null; reject(new Error('Three.js')); };
                document.head.appendChild(s);
            });
        }
        return threeLoading;
    }

    const R = [72, 52, 62];                         // semi-axes of the cell (ellipsoid)
    const NANO = [0, 600, 0];                       // where the "zoom into the membrane" scene lives
    const rng = (function () { let a = 20261117; return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; })();
    const rr = (a, b) => a + (b - a) * rng();

    /* where everything is (centre, radius used for flying / hovering) */
    const LAYOUT = {
        animal: {
            nucleus: [[0, 0, 0], 14], rer: [[22, 0, 0], 14], ser: [[-32, 6, 8], 12], golgi: [[40, -12, 10], 11],
            mito: [[[-34, -20, -12], [22, 24, -24], [-10, -30, 24], [36, 12, -30]], 7],
            lyso: [[[-46, 12, -18], [10, -34, -10], [-22, 30, 14], [46, -26, -6], [-6, 28, -32]], 2.6],
            dvacuole: [[[-48, -6, 24], [26, -36, 30]], 5]
        },
        plant: {
            nucleus: [[34, 8, 14], 13], rer: [[10, 8, 14], 14], ser: [[24, -12, 40], 12], golgi: [[40, -22, -16], 11],
            mito: [[[10, 32, -24], [-10, -34, 26], [42, 26, -10]], 7],
            lyso: [[[8, -34, -12], [-26, 34, 18], [48, -2, -30], [-4, 22, 38]], 2.6],
            vacuole: [[-20, 0, -4], 27],
            chloro: [[[-46, 22, 30], [-52, -14, -18], [-6, 32, -34], [14, -40, 20]], 8]
        }
    };
    const COLORS = { membrane: '#7dd3fc', nucleus: '#b39ddb', rer: '#f48fb1', ser: '#4db6ac', ribosome: '#cfd8dc', golgi: '#ffb74d', mito: '#ff8a65', lyso: '#c5e1a5', dvacuole: '#81d4fa', vacuole: '#80deea', chloro: '#66bb6a', wall: '#a1887f', cyto: '#9ee1ee' };

    function render(mount) {
        mount.innerHTML =
            '<div class="sv-wrap cs-wrap">' +
            '<div class="sv-head"><h2>🌊 Κολύμπι μέσα στο κύτταρο</h2>' +
            '<p>Βούτα μέσα σε ένα <strong>ευκαρυωτικό κύτταρο</strong> και ανακάλυψε τα οργανίδια και τις μεμβράνες του. <strong>Σύρε</strong> για να κοιτάξεις γύρω σου, κινήσου με τα πλήκτρα <strong>W A S D</strong> (ή με τα βέλη και Q/E για πάνω–κάτω) και <strong>πάτησε πάνω σε ένα οργανίδιο</strong> για να το γνωρίσεις. Δοκίμασε και την <strong>Ξενάγηση</strong> ή τις <strong>Αποστολές</strong>.</p></div>' +
            '<div class="cs-stage" id="cs-stage">' +
            '<div class="cs-load" id="cs-load">⏳ Φορτώνει το κύτταρο…</div>' +
            '<div class="cs-top">' +
            '<div class="cs-seg" role="group" aria-label="Είδος κυττάρου"><button type="button" class="cs-btn on" data-type="animal">🐾 Ζωικό κύτταρο</button><button type="button" class="cs-btn" data-type="plant">🌿 Φυτικό κύτταρο</button></div>' +
            '<button type="button" class="cs-btn" id="cs-tour">▶ Ξενάγηση</button>' +
            '<button type="button" class="cs-btn" id="cs-mission">🎯 Αποστολές</button>' +
            '<button type="button" class="cs-btn" id="cs-help">❓ Οδηγίες</button>' +
            '<button type="button" class="cs-btn" id="cs-full">⛶ Πλήρης οθόνη</button>' +
            '</div>' +
            '<div class="cs-prog" id="cs-prog"></div>' +
            '<div class="cs-tip" id="cs-tip"></div>' +
            '<div class="cs-list" id="cs-list"></div>' +
            '<canvas class="cs-map" id="cs-map" width="132" height="132" title="Χάρτης του κυττάρου (πάτησε για να πας κοντά)"></canvas>' +
            '<div class="cs-card" id="cs-card"></div>' +
            '<div class="cs-quest" id="cs-quest"></div>' +
            '<div class="cs-pad" id="cs-pad"><button type="button" data-k="fwd" aria-label="Μπροστά">▲</button><button type="button" data-k="back" aria-label="Πίσω">▼</button><button type="button" data-k="up" aria-label="Πάνω">⤒</button><button type="button" data-k="down" aria-label="Κάτω">⤓</button></div>' +
            '</div></div>';
        const stage = mount.querySelector('#cs-stage');
        ensureThree().then(() => start(mount, stage)).catch(() => { stage.querySelector('#cs-load').textContent = '⚠ Δεν φορτώθηκε η βιβλιοθήκη 3D (χρειάζεται σύνδεση στο διαδίκτυο). Ξαναφόρτωσε τη σελίδα.'; });
    }

    function start(mount, stage) {
        const C = window.CellExplorer && window.CellExplorer.content;
        if (!C) { stage.querySelector('#cs-load').textContent = '⚠ Λείπει το περιεχόμενο του κυττάρου.'; return; }
        const $ = (s) => stage.querySelector(s);
        let renderer;
        try { renderer = new THREE.WebGLRenderer({ antialias: true }); } catch (e) { $('#cs-load').textContent = '⚠ Η συσκευή σου δεν υποστηρίζει 3D (WebGL).'; return; }
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.domElement.className = 'cs-canvas';
        stage.insertBefore(renderer.domElement, stage.firstChild);
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0a3341);
        scene.fog = new THREE.FogExp2(0x0a3341, 0.0125);
        const camera = new THREE.PerspectiveCamera(70, 1, 0.2, 2000);
        scene.add(new THREE.AmbientLight(0xbfe9ff, 0.55));
        const hemi = new THREE.HemisphereLight(0xcdefff, 0x1b4d5c, 0.55); scene.add(hemi);
        const head = new THREE.PointLight(0xffffff, 0.9, 140); camera.add(head); scene.add(camera);
        const nanoLight = new THREE.PointLight(0xffffff, 1.0, 120); nanoLight.position.set(NANO[0], NANO[1] + 20, NANO[2] + 30);

        /* ------------------------------------------------------------ state */
        const S = { type: 'animal', mode: 'cell', yaw: 0.6, pitch: 0, pos: new THREE.Vector3(-34, 6, 40), vel: new THREE.Vector3(), keys: {}, fly: null, items: {}, found: {}, hover: null, tour: null, quest: null, orbit: { th: 0.4, ph: 1.2, d: 26 }, cur: null };
        let world = null, nano = null, anims = [], particles = null, vesicles = [], labels = [];
        const order = () => (S.type === 'animal' ? C.ORDER_ANIMAL : C.ORDER_PLANT).concat(['cyto']);
        const ORG = C.ORG;

        /* ------------------------------------------------------------ materials / helpers */
        const mats = [];
        function M(color, opt) { const m = new THREE.MeshPhongMaterial(Object.assign({ color: color, shininess: 50, emissive: 0x000000 }, opt || {})); mats.push(m); return m; }
        const dummy = new THREE.Object3D();
        function fib(n, r) { const out = []; const g = Math.PI * (3 - Math.sqrt(5)); for (let i = 0; i < n; i++) { const y = 1 - (i / (n - 1)) * 2, rad = Math.sqrt(1 - y * y), th = g * i; out.push(new THREE.Vector3(Math.cos(th) * rad * r, y * r, Math.sin(th) * rad * r)); } return out; }
        function tubeThrough(pts, rad, mat, seg) { const c = new THREE.CatmullRomCurve3(pts); return new THREE.Mesh(new THREE.TubeGeometry(c, seg || 40, rad, 6, false), mat); }
        function inside(p, k) { return (p.x / R[0]) ** 2 + (p.y / R[1]) ** 2 + (p.z / R[2]) ** 2 <= (k || 1); }

        function register(id, group, center, radius, anchor) {
            const it = S.items[id] || (S.items[id] = { id: id, meshes: [], mats: new Set(), centers: [], radius: radius, anchor: anchor || null });
            it.centers.push(center.clone ? center.clone() : new THREE.Vector3().fromArray(center));
            group.traverse((o) => { if (o.isMesh) { o.userData.id = id; it.meshes.push(o); (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => it.mats.add(m)); } });
        }

        /* ------------------------------------------------------------ organelle builders */
        function buildNucleus(pos) {
            const g = new THREE.Group(); g.position.fromArray(pos);
            g.add(new THREE.Mesh(new THREE.SphereGeometry(13, 36, 26), M(0x9575cd, { transparent: true, opacity: 0.34, side: THREE.DoubleSide, depthWrite: false })));
            g.add(new THREE.Mesh(new THREE.SphereGeometry(12.1, 32, 24), M(0xb39ddb, { transparent: true, opacity: 0.22, side: THREE.DoubleSide, depthWrite: false })));
            const pts = fib(46, 13), pm = M(0x4527a0), im = new THREE.InstancedMesh(new THREE.TorusGeometry(0.95, 0.3, 8, 14), pm, pts.length);
            pts.forEach((p, i) => { dummy.position.copy(p); dummy.lookAt(p.clone().multiplyScalar(2)); dummy.updateMatrix(); im.setMatrixAt(i, dummy.matrix); });
            g.add(im);
            const nucleolus = new THREE.Mesh(new THREE.SphereGeometry(3.3, 20, 16), M(0x5e35b1)); nucleolus.position.set(2.5, 1.2, 0.5); g.add(nucleolus);
            for (let k = 0; k < 6; k++) { const p = []; for (let i = 0; i < 7; i++) p.push(new THREE.Vector3(rr(-8, 8), rr(-8, 8), rr(-8, 8))); g.add(tubeThrough(p, 0.34, M(0x7e57c2), 60)); }
            g.rotation.y = rr(0, 6);
            scene.add(g); return g;
        }
        function sheet(cx, cy, cz, r0, ph0, ph1, th0, th1, wave, nu, nv) {
            const pos = [], idx = [], nrm = [];
            for (let j = 0; j <= nv; j++) for (let i = 0; i <= nu; i++) {
                const u = i / nu, v = j / nv, ph = ph0 + u * (ph1 - ph0), th = th0 + v * (th1 - th0);
                const r = r0 + wave * Math.sin(ph * 7) * Math.cos(th * 6);
                pos.push(cx + r * Math.sin(th) * Math.cos(ph), cy + r * Math.cos(th), cz + r * Math.sin(th) * Math.sin(ph));
            }
            for (let j = 0; j < nv; j++) for (let i = 0; i < nu; i++) { const a = j * (nu + 1) + i, b = a + 1, c = a + nu + 1, d = c + 1; idx.push(a, c, b, b, c, d); }
            const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx); geo.computeVertexNormals();
            return { geo: geo, at: (u, v, off) => { const ph = ph0 + u * (ph1 - ph0), th = th0 + v * (th1 - th0), r = r0 + off + wave * Math.sin(ph * 7) * Math.cos(th * 6); return new THREE.Vector3(cx + r * Math.sin(th) * Math.cos(ph), cy + r * Math.cos(th), cz + r * Math.sin(th) * Math.sin(ph)); } };
        }
        function buildRER(c, nucPos, facing) {
            const g = new THREE.Group(); const m = M(0xf06292, { side: THREE.DoubleSide, transparent: true, opacity: 0.78 });
            const rib = []; const pm = M(0x37474f);
            for (let k = 0; k < 4; k++) {
                const sh = sheet(nucPos[0], nucPos[1], nucPos[2], 18.5 + k * 3.3, facing - 1.05, facing + 1.05, 0.75, 2.4, 0.9, 30, 20);
                g.add(new THREE.Mesh(sh.geo, m));
                for (let n = 0; n < 150; n++) rib.push(sh.at(rng(), rng(), 0.55));
            }
            const im = new THREE.InstancedMesh(new THREE.SphereGeometry(0.46, 6, 5), pm, rib.length);
            rib.forEach((p, i) => { dummy.position.copy(p); dummy.updateMatrix(); im.setMatrixAt(i, dummy.matrix); }); g.add(im);
            scene.add(g); return g;
        }
        function buildSER(c) {
            const g = new THREE.Group(); const m = M(0x26a69a, { transparent: true, opacity: 0.8 });
            for (let k = 0; k < 9; k++) { const p = []; for (let i = 0; i < 6; i++) p.push(new THREE.Vector3(c[0] + rr(-13, 13), c[1] + rr(-9, 9), c[2] + rr(-12, 12))); g.add(tubeThrough(p, 0.5, m, 50)); }
            scene.add(g); return g;
        }
        function buildGolgi(c) {
            const g = new THREE.Group(); g.position.fromArray(c); g.rotation.set(rr(-0.4, 0.4), rr(0, 6), rr(-0.5, 0.5));
            const sacs = new THREE.Group();
            for (let i = 0; i < 6; i++) { const s = new THREE.Mesh(new THREE.SphereGeometry(10.5, 30, 8, 0, Math.PI * 2, 0, 0.62), M(0xffa726, { side: THREE.DoubleSide, transparent: true, opacity: 0.86 })); s.position.y = i * 1.9; const k = 1 - i * 0.045; s.scale.set(k, 1, k); sacs.add(s); }
            sacs.position.y = -5; g.add(sacs);
            for (let i = 0; i < 16; i++) { const a = rr(0, 6.28), rad = rr(5.5, 8); const v = new THREE.Mesh(new THREE.SphereGeometry(rr(0.55, 1.0), 10, 8), M(0xffcc80)); v.position.set(Math.cos(a) * rad, rr(-4, 5), Math.sin(a) * rad); g.add(v); }
            scene.add(g); return g;
        }
        function buildMito(c) {
            const g = new THREE.Group(); g.position.fromArray(c); g.rotation.set(rr(0, 3), rr(0, 6), rr(0, 3));
            const o = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 18), M(0xff7043, { transparent: true, opacity: 0.34, depthWrite: false, side: THREE.DoubleSide })); o.scale.set(7.2, 3.5, 3.5); g.add(o);
            const i2 = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), M(0xe64a19, { transparent: true, opacity: 0.4, depthWrite: false, side: THREE.DoubleSide })); i2.scale.set(6.4, 2.8, 2.8); g.add(i2);
            for (let z = -1; z <= 1; z++) { const p = []; for (let k = 0; k < 13; k++) p.push(new THREE.Vector3(-5.2 + k * 0.87, (k % 2 ? 1 : -1) * 1.7 * (1 - Math.abs(-5.2 + k * 0.87) / 8), z * 0.9)); g.add(tubeThrough(p, 0.33, M(0xbf360c), 60)); }
            g.userData.spin = rr(0.05, 0.12); anims.push((t) => { g.rotation.x += 0.0006; });
            scene.add(g); return g;
        }
        function buildLyso(c) {
            const g = new THREE.Group(); g.position.fromArray(c);
            g.add(new THREE.Mesh(new THREE.SphereGeometry(2.4, 18, 14), M(0xaed581, { transparent: true, opacity: 0.7 })));
            for (let i = 0; i < 12; i++) { const d = new THREE.Mesh(new THREE.SphereGeometry(0.3, 6, 5), M(0x33691e)); d.position.set(rr(-1.4, 1.4), rr(-1.4, 1.4), rr(-1.4, 1.4)); g.add(d); }
            scene.add(g); return g;
        }
        function buildDVac(c) {
            const g = new THREE.Group(); g.position.fromArray(c);
            g.add(new THREE.Mesh(new THREE.SphereGeometry(5, 22, 16), M(0x4fc3f7, { transparent: true, opacity: 0.36, depthWrite: false })));
            const f = new THREE.Mesh(new THREE.SphereGeometry(2, 14, 10), M(0xffe082)); f.position.set(0.6, 0.4, 0); g.add(f);
            scene.add(g); return g;
        }
        function buildVacuole(c) {
            const g = new THREE.Group(); g.position.fromArray(c);
            const s = new THREE.Mesh(new THREE.SphereGeometry(1, 36, 26), M(0x80deea, { transparent: true, opacity: 0.2, depthWrite: false, side: THREE.DoubleSide })); s.scale.set(27, 24, 26); g.add(s);
            scene.add(g); return g;
        }
        function buildChloro(c) {
            const g = new THREE.Group(); g.position.fromArray(c); g.rotation.set(rr(0, 3), rr(0, 6), rr(0, 3));
            const o = new THREE.Mesh(new THREE.SphereGeometry(1, 26, 18), M(0x43a047, { transparent: true, opacity: 0.34, depthWrite: false, side: THREE.DoubleSide })); o.scale.set(8.2, 4.2, 4.2); g.add(o);
            const dm = M(0x1b5e20);
            for (let s = 0; s < 7; s++) { const x = -5.4 + s * 1.8, z = rr(-1.4, 1.4), y = rr(-0.8, 0.8); for (let k = 0; k < 5; k++) { const d = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.15, 0.26, 12), dm); d.position.set(x, y + (k - 2) * 0.42, z); g.add(d); } }
            scene.add(g); return g;
        }
        function buildWall() {
            const cv = document.createElement('canvas'); cv.width = cv.height = 256; const x = cv.getContext('2d'); x.fillStyle = '#7a5f4b'; x.fillRect(0, 0, 256, 256);
            for (let i = 0; i < 90; i++) { x.strokeStyle = 'rgba(220,190,150,' + rr(0.12, 0.35) + ')'; x.lineWidth = rr(1, 2.4); x.beginPath(); const y = rr(0, 256), a = rr(-0.5, 0.5); x.moveTo(0, y); x.lineTo(256, y + a * 256); x.stroke(); }
            const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(7, 4);
            const w = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 32), M(0xffffff, { map: t, side: THREE.BackSide, transparent: true, opacity: 0.55 })); w.scale.set(R[0] + 3.2, R[1] + 3.2, R[2] + 3.2);
            scene.add(w); return w;
        }
        function buildMembrane() {
            const cv = document.createElement('canvas'); cv.width = cv.height = 128; const x = cv.getContext('2d'); x.clearRect(0, 0, 128, 128);
            for (let j = 0; j < 8; j++) for (let i = 0; i < 8; i++) { x.fillStyle = 'rgba(255,255,255,0.42)'; x.beginPath(); x.arc(8 + i * 16 + (j % 2) * 8, 8 + j * 16, 4.6, 0, 6.3); x.fill(); }
            const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(22, 12);
            const g = new THREE.Group();
            const m = new THREE.Mesh(new THREE.SphereGeometry(1, 56, 36), M(0x4fc3f7, { map: t, side: THREE.BackSide, transparent: true, opacity: 0.38, depthWrite: false })); m.scale.set(R[0], R[1], R[2]); g.add(m);
            const pm = M(0x01579b), ch = new THREE.InstancedMesh(new THREE.CylinderGeometry(1.5, 1.5, 4.2, 10), pm, 140);
            const dirs = fib(140, 1);
            dirs.forEach((d, i) => { const p = new THREE.Vector3(d.x * R[0] * 0.985, d.y * R[1] * 0.985, d.z * R[2] * 0.985); dummy.position.copy(p); dummy.lookAt(0, 0, 0); dummy.rotateX(Math.PI / 2); dummy.updateMatrix(); ch.setMatrixAt(i, dummy.matrix); });
            g.add(ch); scene.add(g); return g;
        }

        /* ------------------------------------------------------------ the whole cell */
        function addParticles() {
            const n = 700, pos = new Float32Array(n * 3);
            for (let i = 0; i < n; i++) { let p; do { p = new THREE.Vector3(rr(-R[0], R[0]), rr(-R[1], R[1]), rr(-R[2], R[2])); } while (!inside(p, 0.92)); pos.set([p.x, p.y, p.z], i * 3); }
            const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
            const dc = document.createElement('canvas'); dc.width = dc.height = 32; const dx = dc.getContext('2d'); const gr = dx.createRadialGradient(16, 16, 1, 16, 16, 15); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); dx.fillStyle = gr; dx.fillRect(0, 0, 32, 32);
            particles = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xbff3ff, size: 1.1, map: new THREE.CanvasTexture(dc), transparent: true, opacity: 0.7, depthWrite: false }));
            scene.add(particles);
        }
        function addFreeRibosomes() {
            const n = 150, im = new THREE.InstancedMesh(new THREE.SphereGeometry(0.5, 6, 5), M(0x455a64), n);
            for (let i = 0; i < n; i++) { let p; do { p = new THREE.Vector3(rr(-R[0], R[0]) * 0.9, rr(-R[1], R[1]) * 0.9, rr(-R[2], R[2]) * 0.9); } while (!inside(p, 0.8)); dummy.position.copy(p); dummy.updateMatrix(); im.setMatrixAt(i, dummy.matrix); }
            scene.add(im); return im;
        }
        function addVesicles(L) {
            const nuc = L.nucleus[0], gol = L.golgi[0];
            const a = new THREE.Vector3().fromArray(L.rer[0]), b = new THREE.Vector3().fromArray(gol);
            const mid = a.clone().lerp(b, 0.5).add(new THREE.Vector3(0, 12, 6));
            const path1 = new THREE.CatmullRomCurve3([a, mid, b.clone().add(new THREE.Vector3(-6, 3, 0))]);
            const out = new THREE.Vector3(b.x + 22, b.y - 6, b.z + 18);
            const path2 = new THREE.CatmullRomCurve3([b.clone().add(new THREE.Vector3(6, 2, 0)), b.clone().lerp(out, 0.5).add(new THREE.Vector3(0, 8, 0)), out]);
            for (let i = 0; i < 4; i++) {
                const v = new THREE.Mesh(new THREE.SphereGeometry(0.9, 10, 8), M(0xfff176, { emissive: 0x665500 })); scene.add(v); vesicles.push({ m: v, path: i % 2 ? path2 : path1, off: i / 4 });
            }
        }
        function labelSprite(text) {
            const c = document.createElement('canvas'); c.width = 512; c.height = 96; const x = c.getContext('2d');
            let fs = 40; x.font = 'bold ' + fs + 'px Arial'; while (x.measureText(text).width > 450 && fs > 16) { fs -= 2; x.font = 'bold ' + fs + 'px Arial'; }
            x.textAlign = 'center'; x.textBaseline = 'middle';
            x.fillStyle = 'rgba(8,24,32,0.78)'; const w = Math.min(500, x.measureText(text).width + 40); x.fillRect(256 - w / 2, 12, w, 72);
            x.strokeStyle = '#fbbf24'; x.lineWidth = 3; x.strokeRect(256 - w / 2, 12, w, 72); x.fillStyle = '#fef3c7'; x.fillText(text, 256, 49);
            const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthTest: false })); sp.scale.set(15, 2.8, 1); sp.renderOrder = 10;
            return sp;
        }

        function buildWorld() {
            if (world) { scene.remove(world); }
            // clear
            Object.keys(S.items).forEach((k) => delete S.items[k]);
            labels.forEach((l) => scene.remove(l)); labels = []; anims = []; vesicles = []; mats.length = 0;
            const keep = [scene.children.filter((o) => o.isLight || o === camera)];
            scene.children.slice().forEach((o) => { if (!(o.isLight || o === camera || o === nanoGroup())) scene.remove(o); });
            const L = LAYOUT[S.type];
            const mem = buildMembrane(); register('membrane', mem, new THREE.Vector3(0, 0, R[2] * 0.97), 10, new THREE.Vector3(0, 0, R[2] * 0.96));
            if (S.type === 'plant') { const w = buildWall(); register('wall', w, new THREE.Vector3(-R[0] * 0.95, 8, 10), 10, new THREE.Vector3(-R[0] * 0.93, 8, 10)); }
            const nuc = buildNucleus(L.nucleus[0]); register('nucleus', nuc, L.nucleus[0], L.nucleus[1]);
            const rer = buildRER(L.rer[0], L.nucleus[0], S.type === 'animal' ? 0.0 : Math.PI); register('rer', rer, L.rer[0], L.rer[1]);
            const ser = buildSER(L.ser[0]); register('ser', ser, L.ser[0], L.ser[1]);
            const gol = buildGolgi(L.golgi[0]); register('golgi', gol, L.golgi[0], L.golgi[1]);
            L.mito[0].forEach((c) => register('mito', buildMito(c), c, L.mito[1]));
            L.lyso[0].forEach((c) => register('lyso', buildLyso(c), c, L.lyso[1]));
            if (S.type === 'animal') L.dvacuole[0].forEach((c) => register('dvacuole', buildDVac(c), c, L.dvacuole[1]));
            else { const v = buildVacuole(L.vacuole[0]); register('vacuole', v, L.vacuole[0], L.vacuole[1]); L.chloro[0].forEach((c) => register('chloro', buildChloro(c), c, L.chloro[1])); }
            const rb = addFreeRibosomes(); register('ribosome', rb, new THREE.Vector3().fromArray(L.rer[0]), 12);
            // ribosomes attached to the rough ER belong to "ribosome" as well: tag the instanced dots of the rER group
            rer.traverse((o) => { if (o.isInstancedMesh) { o.userData.id = 'ribosome'; S.items.ribosome.meshes.push(o); S.items.ribosome.mats.add(o.material); } });
            S.items.ribosome.centers.push(new THREE.Vector3(-20, 18, -6), new THREE.Vector3(-8, -14, 30), new THREE.Vector3(30, 20, 24));
            S.items.cyto = { id: 'cyto', meshes: [], mats: new Set(), centers: [new THREE.Vector3(-18, 10, 22)], radius: 8 };
            addParticles(); addVesicles(L);
            world = true;
        }
        function nanoGroup() { return nano; }

        /* ------------------------------------------------------------ the membrane under the microscope */
        function buildNano() {
            nano = new THREE.Group(); nano.position.fromArray(NANO);
            const head = M(0xffcc80), tail = M(0xffe0b2, { transparent: true, opacity: 0.9 });
            const nx = 26, nz = 14, sp = 1.35, per = nx * nz * 2;
            const hs = new THREE.InstancedMesh(new THREE.SphereGeometry(0.62, 10, 8), head, per), ts = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.13, 0.13, 2.1, 5), tail, per * 2);
            const holes = [[-8, 3], [0, -4], [8, 4]];
            let hi = 0, ti = 0;
            for (let layer = 0; layer < 2; layer++) for (let i = 0; i < nx; i++) for (let k = 0; k < nz; k++) {
                const x = (i - nx / 2) * sp + (k % 2) * 0.6, z = (k - nz / 2) * sp;
                if (holes.some((h) => Math.hypot(x - h[0], z - h[1]) < 2.1)) continue;
                const y = layer ? -2.2 : 2.2, dir = layer ? 1 : -1;
                dummy.rotation.set(0, 0, 0); dummy.position.set(x, y, z); dummy.updateMatrix(); hs.setMatrixAt(hi++, dummy.matrix);
                for (const dx of [-0.28, 0.28]) { dummy.position.set(x + dx, y + dir * 1.25, z); dummy.updateMatrix(); ts.setMatrixAt(ti++, dummy.matrix); }
            }
            hs.count = hi; ts.count = ti; nano.add(hs); nano.add(ts);
            const pm = M(0x0277bd, { transparent: true, opacity: 0.9 });
            holes.forEach((h) => { const c = new THREE.Mesh(new THREE.CylinderGeometry(1.7, 1.7, 7.2, 16, 1, true), M(0x0288d1, { side: THREE.DoubleSide, transparent: true, opacity: 0.85 })); c.position.set(h[0], 0, h[1]); nano.add(c); const cap1 = new THREE.Mesh(new THREE.TorusGeometry(1.7, 0.45, 8, 18), pm); cap1.rotation.x = Math.PI / 2; cap1.position.set(h[0], 3.6, h[1]); nano.add(cap1); const cap2 = cap1.clone(); cap2.position.y = -3.6; nano.add(cap2); });
            // molecules: some pass through the channels, the others bounce on the lipid layer
            nano.userData.mol = [];
            for (let i = 0; i < 9; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(0.55, 10, 8), M(i < 6 ? 0x80cbc4 : 0xef9a9a, { emissive: 0x112222 })); const h = holes[i % 3]; nano.add(m); nano.userData.mol.push({ m: m, h: h, pass: i < 6, t: rng() }); }
            function lab(text, x, y, z, w) { const s = labelSprite(text); s.scale.set(w, w * 0.1875, 1); s.position.set(x, y, z); nano.add(s); }
            lab('Έξω από το κύτταρο', -12, 10, -6, 11); lab('Κυτταρόπλασμα', -12, -10, -6, 11);
            scene.add(nano); scene.add(nanoLight);
        }

        /* ------------------------------------------------------------ UI helpers */
        const esc = (s) => String(s == null ? '' : s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
        function renderList() {
            const el = $('#cs-list'); const ids = order();
            el.innerHTML = '<div class="cs-list-h">Οργανίδια <small>(' + ids.filter((i) => S.found[i]).length + '/' + ids.length + ')</small></div>' + ids.map((id) => {
                const o = ORG[id]; return '<button type="button" class="cs-li' + (S.found[id] ? ' ok' : '') + '" data-id="' + id + '"><span class="dot" style="background:' + COLORS[id] + '"></span>' + (S.found[id] ? '✔ ' : '') + (S.found[id] ? esc(o.name) : '???') + '</button>';
            }).join('') + '<div class="cs-list-n">Πάτησε ένα όνομα για να πας κοντά του. Το «???» το βρίσκεις κοιτάζοντας γύρω σου.</div>';
            const ids2 = ids; const n = ids2.filter((i) => S.found[i]).length;
            $('#cs-prog').innerHTML = '🔎 Ανακαλύψεις: <b>' + n + ' / ' + ids2.length + '</b><span class="bar"><i style="width:' + Math.round(n / ids2.length * 100) + '%"></i></span>' + (n === ids2.length ? ' 🎉 Τα βρήκες όλα!' : '');
        }
        function showCard(id) {
            const o = ORG[id]; if (!o) return;
            const card = $('#cs-card');
            card.innerHTML = '<button type="button" class="cs-x" aria-label="Κλείσιμο">✕</button><h3><span class="dot" style="background:' + COLORS[id] + '"></span>' + (o.num ? o.num + '. ' : '') + esc(o.name) + '</h3>' +
                '<p><b>Δομή:</b> ' + esc(o.structure) + '</p><p><b>Λειτουργία:</b> ' + esc(o.func) + '</p>' + (o.endo ? '<p class="endo">🏠 ' + esc(o.endo) + '</p>' : '') +
                '<div class="acts">' + (id === 'membrane' ? '<button type="button" class="cs-btn" data-act="nano">🔬 Μεγέθυνση στη μεμβράνη</button>' : '') + (id !== 'cyto' ? '<button type="button" class="cs-btn" data-act="go" data-id="' + id + '">➜ Πλησίασε</button>' : '') + '</div>';
            card.classList.add('on');
        }
        function hideCard() { $('#cs-card').classList.remove('on'); }
        function discover(id) {
            if (!S.found[id]) { S.found[id] = true; const all = order().every((k) => S.found[k]); toast(all ? '🎉 Τα βρήκες όλα! Δοκίμασε τώρα τις Αποστολές' : '✨ Ανακάλυψες: ' + ORG[id].name); renderList(); addLabel(id); }
            showCard(id);
        }
        function addLabel(id) {
            const it = S.items[id]; if (!it || id === 'cyto' || !it.centers.length) return;
            const sp = labelSprite((ORG[id].num ? ORG[id].num + '. ' : '') + ORG[id].name);
            const c = it.centers[0]; sp.position.set(c.x, c.y + it.radius + 3.2, c.z); sp.userData.id = id; scene.add(sp); labels.push(sp);
        }
        let toastT = 0;
        function toast(t) { const el = $('#cs-tip'); el.textContent = t; el.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('on'), 2600); }
        function bar() { const l = $('#cs-quest'); return l; }

        /* ------------------------------------------------------------ movement */
        function nearestCenter(it, from) { let best = it.centers[0], d = 1e9; it.centers.forEach((c) => { const k = c.distanceTo(from); if (k < d) { d = k; best = c; } }); return best; }
        function flyTo(id, done) {
            const it = S.items[id]; if (!it) return;
            if (S.mode === 'nano') exitNano(true);
            const target = (id === 'membrane' || id === 'wall') ? it.anchor.clone() : nearestCenter(it, S.pos).clone();
            const stop = (id === 'membrane' || id === 'wall') ? 13 : it.radius * 1.9 + 7;
            const dest = approachPoint(id, target, stop);
            S.fly = { from: S.pos.clone(), to: dest, look: target.clone(), t: 0, dur: Math.max(1.4, Math.min(3.2, S.pos.distanceTo(dest) / 28)), done: done, id: id };
        }
        // a point at distance `stop` from the target with free space around it (not inside another organelle)
        const YAX = new THREE.Vector3(0, 1, 0);
        function clearance(p, except) { let m = 1e9; Object.keys(S.items).forEach((k) => { if (k === except || k === 'membrane' || k === 'wall' || k === 'cyto' || k === 'ribosome' || k === 'vacuole') return; const it = S.items[k]; it.centers.forEach((c) => { m = Math.min(m, p.distanceTo(c) - (k === 'rer' ? 15 : it.radius)); }); }); return m; }
        function approachPoint(id, target, stop) {
            const base = S.pos.clone().sub(target); if (base.length() < 0.5) base.set(0, 0, 1); base.normalize();
            let best = null, bs = -1e9;
            for (const a of [0, 0.8, -0.8, 1.6, -1.6, 2.4, -2.4, 3.14]) for (const ey of [0, 0.5, -0.5]) {
                const d = base.clone().applyAxisAngle(YAX, a); d.y += ey; d.normalize();
                let dest = target.clone().add(d.multiplyScalar(stop)); if (!inside(dest, 0.82)) continue;
                const sc = clearance(dest, id);
                if (a === 0 && ey === 0 && sc > 5) return dest;
                if (sc > bs) { bs = sc; best = dest; }
            }
            if (best) return best;
            const dest = target.clone().add(base.multiplyScalar(stop)); let g = 0; while (!inside(dest, 0.82) && g++ < 30) dest.lerp(target, 0.12); return dest;
        }
        function lookAtYawPitch(from, to) { const d = to.clone().sub(from); return { yaw: Math.atan2(d.x, -d.z) , pitch: Math.atan2(d.y, Math.hypot(d.x, d.z)) }; }
        function angDiff(a, b) { let d = b - a; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return d; }

        function enterNano() {
            if (!nano) buildNano();
            S.mode = 'nano'; S.fly = null; S.cur = { pos: S.pos.clone(), yaw: S.yaw, pitch: S.pitch };
            nano.visible = true; nanoLight.visible = true; scene.fog = null; scene.background = new THREE.Color(0x0d3b52);
            toast('🔬 Μεγέθυνση στη μεμβράνη: σύρε για να γυρίσεις, ροδάκι για ζουμ');
            const el = $('#cs-card'); el.classList.add('on');
            el.innerHTML = '<button type="button" class="cs-x" data-act="exitnano" aria-label="Κλείσιμο">✕</button><h3>🔬 Η πλασματική μεμβράνη από κοντά</h3><p><span class="dot" style="background:#ffe0b2"></span><b>Λιπίδια</b> (οι κρεμ «κεφαλές» με τις «ουρές» τους): εμποδίζουν την ελεύθερη διέλευση των ουσιών.</p><p><span class="dot" style="background:#29b6f6"></span><b>Πρωτεΐνες-κανάλια ελεγχόμενης διέλευσης</b> (οι μπλε σωλήνες): αφήνουν να περάσουν ουσίες με έλεγχο. Παρατήρησε ότι κάποια μόρια περνούν μόνο από τα κανάλια.</p><div class="acts"><button type="button" class="cs-btn" data-act="exitnano">← Πίσω στο κύτταρο</button></div>';
        }
        function exitNano(silent) {
            if (S.mode !== 'nano') return;
            S.mode = 'cell'; if (nano) nano.visible = false; nanoLight.visible = false;
            scene.fog = new THREE.FogExp2(0x0a3341, 0.0125); scene.background = new THREE.Color(0x0a3341);
            if (S.cur) { S.pos.copy(S.cur.pos); S.yaw = S.cur.yaw; S.pitch = S.cur.pitch; }
            if (!silent) showCard('membrane');
        }

        /* ------------------------------------------------------------ tour & missions */
        function startTour() {
            if (S.mode === 'nano') exitNano(true);
            stopQuest(); const ids = order().filter((i) => i !== 'cyto');
            S.tour = { ids: ids, i: -1 }; $('#cs-tour').textContent = '■ Σταμάτα την ξενάγηση'; nextTour();
        }
        function nextTour() {
            const T = S.tour; if (!T) return; T.i++;
            if (T.i >= T.ids.length) { stopTour(); toast('🏁 Τέλος ξενάγησης!'); return; }
            const id = T.ids[T.i]; flyTo(id, () => { discover(id); const c = $('#cs-card'); if (!c.querySelector('.tour-n')) { const b = document.createElement('div'); b.className = 'acts'; b.innerHTML = '<button type="button" class="cs-btn tour-n" data-act="tournext">' + (T.i + 1 < T.ids.length ? 'Επόμενο ➜' : 'Τέλος 🏁') + '</button>'; c.appendChild(b); } });
        }
        function stopTour() { S.tour = null; $('#cs-tour').textContent = '▶ Ξενάγηση'; }

        function stopQuest() { S.quest = null; $('#cs-quest').classList.remove('on'); $('#cs-mission').textContent = '🎯 Αποστολές'; }
        function startQuest() {
            if (S.mode === 'nano') exitNano(true); stopTour(); hideCard();
            const type = S.type;
            const pool = C.TESTS.filter((t) => !t[2] || t[2] === type).filter((t) => t[1].some((id) => S.items[id]));
            const picks = pool.slice().sort(() => rng() - 0.5).slice(0, 6);
            S.quest = { list: picks, i: 0, score: 0, tries: 0, done: false };
            $('#cs-mission').textContent = '■ Σταμάτα τις αποστολές'; showQuest();
        }
        function showQuest() {
            const Q = S.quest, b = $('#cs-quest'); if (!Q) return;
            b.classList.add('on');
            if (Q.i >= Q.list.length) { b.innerHTML = '<b>🏆 Τέλος αποστολών!</b> Βαθμολογία: <b>' + Q.score + ' / ' + Q.list.length * 10 + '</b> πόντοι <button type="button" class="cs-btn" data-act="questagain">↻ Ξανά</button><button type="button" class="cs-btn" data-act="questend">Κλείσιμο</button>'; return; }
            b.innerHTML = '<b>🎯 Αποστολή ' + (Q.i + 1) + ' / ' + Q.list.length + ':</b> Βρες και πάτησε το οργανίδιο που… <i>' + esc(Q.list[Q.i][0]) + '</i> <span class="sc">Πόντοι: ' + Q.score + '</span>';
        }
        function questClick(id) {
            const Q = S.quest; if (!Q || Q.i >= Q.list.length) return false;
            const ok = Q.list[Q.i][1].indexOf(id) >= 0;
            if (ok) { Q.score += Q.tries === 0 ? 10 : 5; toast('✅ Σωστά! ' + ORG[id].name + (Q.tries === 0 ? ' (+10)' : ' (+5)')); Q.i++; Q.tries = 0; discover(id); showQuest(); }
            else { Q.tries++; toast('❌ Αυτό είναι: ' + (ORG[id] ? ORG[id].name : '') + '. Δοκίμασε ξανά.'); if (Q.tries >= 3) { Q.i++; Q.tries = 0; toast('➜ Επόμενη αποστολή (η σωστή: ' + Q.list[Q.i - 1][1].map((x) => ORG[x].name).join(' / ') + ')'); showQuest(); } }
            return true;
        }

        /* ------------------------------------------------------------ input */
        const el = renderer.domElement;
        let drag = null;
        el.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, y: e.clientY, t: performance.now(), moved: 0 }; el.setPointerCapture(e.pointerId); });
        el.addEventListener('pointermove', (e) => {
            if (drag) {
                const dx = e.clientX - drag.x, dy = e.clientY - drag.y; drag.moved += Math.abs(dx) + Math.abs(dy); drag.x = e.clientX; drag.y = e.clientY;
                if (S.mode === 'nano') { S.orbit.th -= dx * 0.006; S.orbit.ph = Math.max(0.25, Math.min(2.9, S.orbit.ph - dy * 0.006)); }
                else if (!S.fly) { S.yaw += dx * 0.0045; S.pitch = Math.max(-1.35, Math.min(1.35, S.pitch - dy * 0.0045)); }
            } else pick(e, false);
        });
        el.addEventListener('pointerup', (e) => { if (drag && drag.moved < 6 && performance.now() - drag.t < 450) pick(e, true); drag = null; });
        el.addEventListener('wheel', (e) => { e.preventDefault(); if (S.mode === 'nano') S.orbit.d = Math.max(10, Math.min(48, S.orbit.d + e.deltaY * 0.02)); else if (!S.fly) { const f = new THREE.Vector3(Math.sin(S.yaw) * Math.cos(S.pitch), Math.sin(S.pitch), -Math.cos(S.yaw) * Math.cos(S.pitch)); S.pos.addScaledVector(f, -e.deltaY * 0.04); } }, { passive: false });
        const KEYMAP = { KeyW: 'fwd', ArrowUp: 'fwd', KeyS: 'back', ArrowDown: 'back', KeyA: 'left', ArrowLeft: 'left', KeyD: 'right', ArrowRight: 'right', KeyQ: 'down', KeyE: 'up', Space: 'up', ShiftLeft: 'down' };
        const keyDown = (e) => { if (!stage.offsetParent && !document.fullscreenElement) return; const k = KEYMAP[e.code]; if (k && !/INPUT|SELECT|TEXTAREA/.test((e.target || {}).tagName || '')) { S.keys[k] = true; e.preventDefault(); } };
        const keyUp = (e) => { const k = KEYMAP[e.code]; if (k) S.keys[k] = false; };
        window.addEventListener('keydown', keyDown); window.addEventListener('keyup', keyUp);
        stage.querySelector('#cs-pad').addEventListener('pointerdown', (e) => { const b = e.target.closest('button'); if (b) { S.keys[b.dataset.k] = true; e.preventDefault(); } });
        window.addEventListener('pointerup', () => { ['fwd', 'back', 'up', 'down'].forEach((k) => { S.keys['pad_' + k] = false; }); const pad = stage.querySelector('#cs-pad'); pad.querySelectorAll('button').forEach((b) => { S.keys[b.dataset.k] = false; }); });

        const ray = new THREE.Raycaster(); const mouse = new THREE.Vector2();
        function pickAt(e) {
            const r = el.getBoundingClientRect(); mouse.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
            ray.setFromCamera(mouse, camera);
            const targets = []; Object.keys(S.items).forEach((k) => S.items[k].meshes.forEach((m) => targets.push(m)));
            const hits = ray.intersectObjects(targets, false);
            return hits.length ? hits[0].object.userData.id : null;
        }
        function pick(e, click) {
            if (S.mode === 'nano') return;
            const id = pickAt(e);
            if (!click) { S.hover = id; const tip = $('#cs-hover'); setHover(id, e); return; }
            if (S.fly) return;
            if (S.quest) { if (id) questClick(id); else if (!questClick('cyto')) { /* ignore */ } return; }
            if (id) discover(id);
            else if (inside(S.pos, 0.98)) { discover('cyto'); }
        }
        let hoverEl = null;
        function setHover(id, e) {
            if (!hoverEl) { hoverEl = document.createElement('div'); hoverEl.className = 'cs-hover'; stage.appendChild(hoverEl); }
            if (!id || S.quest) { hoverEl.style.display = 'none'; el.style.cursor = drag ? 'grabbing' : 'grab'; Object.keys(S.items).forEach((k) => glow(k, false)); return; }
            const r = stage.getBoundingClientRect(); hoverEl.style.display = 'block'; hoverEl.style.left = (e.clientX - r.left + 14) + 'px'; hoverEl.style.top = (e.clientY - r.top + 12) + 'px';
            hoverEl.textContent = S.found[id] ? ORG[id].name : 'Πάτησε για να ανακαλύψεις'; el.style.cursor = 'pointer';
            Object.keys(S.items).forEach((k) => glow(k, k === id));
        }
        function glow(id, on) { const it = S.items[id]; if (!it) return; it.mats.forEach((m) => { if (m.emissive) m.emissive.setHex(on ? 0x2a2a2a : (m.userData.baseEmissive || 0)); }); }

        /* ------------------------------------------------------------ top buttons */
        stage.addEventListener('click', (e) => {
            const b = e.target.closest('button'); if (!b) return;
            if (b.dataset.type) { S.type = b.dataset.type; stage.querySelectorAll('[data-type]').forEach((x) => x.classList.toggle('on', x === b)); S.found = {}; S.fly = null; stopTour(); stopQuest(); hideCard(); exitNano(true); buildWorld(); S.pos.set(-34, 6, 40); S.yaw = 0.6; S.pitch = 0; renderList(); return; }
            if (b.classList.contains('cs-x')) { if (b.dataset.act === 'exitnano') exitNano(); else hideCard(); return; }
            if (b.classList.contains('cs-li')) { const id = b.dataset.id; flyTo(id, () => { if (S.quest) { /* mission: do not reveal */ } else discover(id); }); return; }
            const act = b.dataset.act;
            if (act === 'nano') enterNano(); else if (act === 'exitnano') exitNano(); else if (act === 'go') flyTo(b.dataset.id);
            else if (act === 'tournext') nextTour(); else if (act === 'questagain') startQuest(); else if (act === 'questend') stopQuest();
            else if (b.id === 'cs-tour') { if (S.tour) { stopTour(); S.fly = null; } else startTour(); }
            else if (b.id === 'cs-mission') { if (S.quest) stopQuest(); else startQuest(); }
            else if (b.id === 'cs-help') showHelp();
            else if (b.id === 'cs-full') { if (document.fullscreenElement) document.exitFullscreen(); else if (stage.requestFullscreen) stage.requestFullscreen().catch(() => {}); }
        });
        function showHelp() {
            if (stage.querySelector('.cs-help')) return;
            const h = document.createElement('div'); h.className = 'cs-help';
            h.innerHTML = '<div class="box"><button type="button" class="cs-x" aria-label="Κλείσιμο">✕</button><h3>🌊 Πώς κολυμπάς στο κύτταρο</h3><ul>' +
                '<li><b>Κοίτα γύρω σου:</b> σύρε με το ποντίκι ή με το δάχτυλο.</li>' +
                '<li><b>Κινήσου:</b> πλήκτρα <b>W A S D</b> ή βέλη, <b>Q / E</b> κάτω–πάνω, ροδάκι ποντικιού για μπρος–πίσω. Σε κινητό χρησιμοποίησε τα κουμπιά ▲ ▼ κάτω δεξιά.</li>' +
                '<li><b>Ανακάλυψε:</b> πάτησε πάνω σε ένα οργανίδιο ή στη μεμβράνη. Θα εμφανιστεί η δομή και η λειτουργία του. Στη λίστα αριστερά φαίνεται πόσα βρήκες. Αν πατήσεις στο «κενό», γνωρίζεις το κυτταρόπλασμα.</li>' +
                '<li><b>Μεμβράνη:</b> πάτησε στο κέλυφος του κυττάρου και μετά «🔬 Μεγέθυνση στη μεμβράνη».</li>' +
                '<li><b>▶ Ξενάγηση:</b> σε πηγαίνει αυτόματα από οργανίδιο σε οργανίδιο.</li>' +
                '<li><b>🎯 Αποστολές:</b> σου δίνεται μια περιγραφή και βρίσκεις το οργανίδιο στον χώρο.</li></ul><p class="s">Το περιεχόμενο είναι από το σχολικό υλικό (Γ3.1–Γ3.4). Τα σχήματα είναι σχηματικά και όχι σε κλίμακα.</p></div>';
            h.addEventListener('click', (e) => { if (e.target === h || e.target.closest('.cs-x')) h.remove(); });
            stage.appendChild(h);
        }

        /* ------------------------------------------------------------ minimap */
        const map = $('#cs-map'), mx = map.getContext('2d');
        function drawMap() {
            mx.clearRect(0, 0, 132, 132); mx.fillStyle = 'rgba(7,24,32,0.75)'; mx.fillRect(0, 0, 132, 132);
            mx.strokeStyle = 'rgba(125,211,252,0.9)'; mx.lineWidth = 2; mx.beginPath(); mx.ellipse(66, 66, 60, 60 * R[2] / R[0], 0, 0, 6.3); mx.stroke();
            const X = (p) => 66 + (p.x / R[0]) * 60, Y = (p) => 66 + (p.z / R[0]) * 60;
            Object.keys(S.items).forEach((k) => { const it = S.items[k]; it.centers.forEach((c) => { mx.fillStyle = S.found[k] ? COLORS[k] : 'rgba(180,200,210,0.55)'; mx.beginPath(); mx.arc(X(c), Y(c), S.found[k] ? 4 : 3, 0, 6.3); mx.fill(); }); });
            const p = S.mode === 'nano' && S.cur ? S.cur.pos : S.pos, yaw = S.mode === 'nano' && S.cur ? S.cur.yaw : S.yaw;
            mx.save(); mx.translate(X(p), Y(p)); mx.rotate(yaw); mx.fillStyle = '#fbbf24'; mx.beginPath(); mx.moveTo(0, -7); mx.lineTo(5, 5); mx.lineTo(-5, 5); mx.closePath(); mx.fill(); mx.restore();
        }
        map.addEventListener('click', (e) => { const r = map.getBoundingClientRect(); const px = (e.clientX - r.left) / r.width * 132, py = (e.clientY - r.top) / r.height * 132; let best = null, bd = 1e9; Object.keys(S.items).forEach((k) => S.items[k].centers.forEach((c) => { const d = Math.hypot(66 + c.x / R[0] * 60 - px, 66 + c.z / R[0] * 60 - py); if (d < bd) { bd = d; best = k; } })); if (best && bd < 16) flyTo(best, () => { if (!S.quest) discover(best); }); });

        /* ------------------------------------------------------------ resize / loop */
        function resize() { const w = stage.clientWidth, h = stage.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
        new ResizeObserver(resize).observe(stage); resize();
        const clock = new THREE.Clock(); let t = 0, alive = true;
        function frame() {
            if (!document.body.contains(stage)) { alive = false; window.removeEventListener('keydown', keyDown); window.removeEventListener('keyup', keyUp); renderer.dispose(); return; }
            requestAnimationFrame(frame);
            if (!stage.offsetParent && !document.fullscreenElement) return;           // tab hidden: do not draw
            const dt = Math.min(0.05, clock.getDelta()); t += dt;
            // movement
            if (S.mode === 'cell') {
                if (S.fly) {
                    const F = S.fly; F.t += dt / F.dur; const k = Math.min(1, F.t), e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
                    S.pos.lerpVectors(F.from, F.to, e);
                    const want = lookAtYawPitch(S.pos, F.look); S.yaw += angDiff(S.yaw, want.yaw) * Math.min(1, dt * 4); S.pitch += (want.pitch - S.pitch) * Math.min(1, dt * 4);
                    if (k >= 1) { const done = F.done; S.fly = null; if (done) done(); }
                } else {
                    const sp = 26; const f = new THREE.Vector3(Math.sin(S.yaw), 0, -Math.cos(S.yaw)), r = new THREE.Vector3(Math.cos(S.yaw), 0, Math.sin(S.yaw));
                    const acc = new THREE.Vector3();
                    if (S.keys.fwd) acc.add(new THREE.Vector3(Math.sin(S.yaw) * Math.cos(S.pitch), Math.sin(S.pitch), -Math.cos(S.yaw) * Math.cos(S.pitch)));
                    if (S.keys.back) acc.sub(new THREE.Vector3(Math.sin(S.yaw) * Math.cos(S.pitch), Math.sin(S.pitch), -Math.cos(S.yaw) * Math.cos(S.pitch)));
                    if (S.keys.right) acc.add(r); if (S.keys.left) acc.sub(r); if (S.keys.up) acc.y += 1; if (S.keys.down) acc.y -= 1;
                    S.vel.lerp(acc.multiplyScalar(sp), Math.min(1, dt * 5));
                    S.pos.addScaledVector(S.vel, dt);
                }
                // stay inside the membrane
                const q = (S.pos.x / R[0]) ** 2 + (S.pos.y / R[1]) ** 2 + (S.pos.z / R[2]) ** 2; if (q > 0.9) S.pos.multiplyScalar(Math.sqrt(0.9 / q));
                camera.position.copy(S.pos);
                camera.rotation.order = 'YXZ'; camera.rotation.set(S.pitch, -S.yaw, 0);
            } else {
                const o = S.orbit; camera.position.set(NANO[0] + o.d * Math.sin(o.ph) * Math.cos(o.th), NANO[1] + o.d * Math.cos(o.ph), NANO[2] + o.d * Math.sin(o.ph) * Math.sin(o.th)); camera.lookAt(NANO[0], NANO[1], NANO[2]);
                if (nano) nano.userData.mol.forEach((m) => { m.t += dt * 0.16; const u = m.t % 1; if (m.pass) { m.m.position.set(m.h[0] + Math.sin(t * 2 + m.t * 9) * 0.3, 9 - u * 18, m.h[1]); } else { const b = Math.abs(Math.sin(u * 3.14)) ; m.m.position.set(m.h[0] + 4 + m.t % 3, 5 + b * 5, m.h[1] + 2 + Math.sin(u * 12) * 2); } });
            }
            // animations
            anims.forEach((a) => a(t));
            if (particles && S.mode === 'cell') { const a = particles.geometry.attributes.position.array; for (let i = 0; i < a.length; i += 3) { a[i + 1] += Math.sin(t * 0.7 + i) * 0.006; a[i] += Math.cos(t * 0.5 + i * 0.3) * 0.006; } particles.geometry.attributes.position.needsUpdate = true; }
            vesicles.forEach((v) => { const u = (t * 0.07 + v.off) % 1; v.m.position.copy(v.path.getPoint(u)); v.m.visible = S.mode === 'cell'; });
            labels.forEach((l) => { l.visible = S.mode === 'cell'; });
            renderer.render(scene, camera); drawMap();
        }

        /* ------------------------------------------------------------ go */
        mats.forEach((m) => { m.userData.baseEmissive = m.emissive ? m.emissive.getHex() : 0; });
        buildWorld(); mats.forEach((m) => { m.userData.baseEmissive = m.emissive ? m.emissive.getHex() : 0; });
        renderList(); $('#cs-load').style.display = 'none';
        frame();
        setTimeout(() => { if (!localStorage.getItem('cellswim_help')) { try { localStorage.setItem('cellswim_help', '1'); } catch (e) { /* ignore */ } showHelp(); } }, 600);
        window.__cellswim = { S, flyTo, discover };     // for testing
    }
    return { render };
})();
