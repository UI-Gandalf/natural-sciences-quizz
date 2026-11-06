/* ==========================================================================
   Biology Β: 3D comparison of the movements of the shoulder, the elbow, the knee, the ankle and the joint that
   turns the palm. SUPPLEMENTARY material (outside the school book, not examined): the book only says that a
   diarthrosis (διάρθρωση) allows movements of the bones, with the shoulder and the elbow as examples.
   Three.js is loaded on demand from a CDN.  window.BioBJoints3D.render(mountElement)
   ========================================================================== */
(function () {
    'use strict';
    const THREE_URL = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    const D = Math.PI / 180;
    let loading = null;
    function ensureThree() {
        if (window.THREE) return Promise.resolve();
        if (!loading) {
            loading = new Promise((res, rej) => {
                const s = document.createElement('script');
                s.src = THREE_URL; s.onload = res; s.onerror = () => { loading = null; rej(new Error('Three.js')); };
                document.head.appendChild(s);
            });
        }
        return loading;
    }

    /* ------------------------------------------------------------ content (Greek) */
    const META = {
        shoulder: {
            name: 'Ώμος', type: 'σφαιρική (σφαιροειδής) διάρθρωση', color: 0xf97316, dofCount: 3,
            desc: 'Το στρογγυλό άκρο του βραχιονίου κινείται μέσα στην εσοχή της ωμοπλάτης, σαν μπάλα σε υποδοχή. Γι’ αυτό το χέρι κινείται <strong>προς όλες τις κατευθύνσεις</strong> και μπορεί και να <strong>στρέφεται</strong>.',
            range: 'ανύψωση στο πλάι έως περίπου 170°–180°, μπροστά έως περίπου 170°, στροφή περίπου ±80°',
            dofs: [
                { k: 'flex', label: 'Μπροστά – πίσω', min: -50, max: 170, def: 0 },
                { k: 'abd', label: 'Ανύψωση στο πλάι', min: -30, max: 170, def: 0 },
                { k: 'rot', label: 'Στροφή του βραχιονίου', min: -80, max: 80, def: 0 }
            ], locks: []
        },
        elbow: {
            name: 'Αγκώνας', type: 'μεντεσές (γίγγλυμος)', color: 0x22c55e, dofCount: 1,
            desc: 'Ο αγκώνας λειτουργεί σαν <strong>μεντεσές πόρτας</strong>: το αντιβράχιο κινείται μόνο ανοίγοντας και κλείνοντας, δηλαδή σε <strong>ένα επίπεδο</strong>.',
            range: 'κάμψη έως περίπου 145°',
            dofs: [{ k: 'flex', label: 'Κάμψη – έκταση', min: 0, max: 145, def: 0 }],
            locks: ['Κίνηση στο πλάι', 'Στροφή του βραχιονίου γύρω από τον άξονά του']
        },
        knee: {
            name: 'Γόνατο', type: 'μεντεσές (κυρίως)', color: 0x3b82f6, dofCount: 1,
            desc: 'Το γόνατο λυγίζει και τεντώνεται κυρίως σαν μεντεσές. Η επιγονατίδα κινείται μπροστά του καθώς λυγίζει.',
            range: 'κάμψη έως περίπου 135°',
            dofs: [{ k: 'flex', label: 'Κάμψη – έκταση', min: 0, max: 135, def: 0 }],
            locks: ['Κίνηση στο πλάι', 'Μεγάλη στροφή της κνήμης (μόνο πολύ μικρή όταν το γόνατο είναι λυγισμένο)']
        },
        ankle: {
            name: 'Αστράγαλος', type: 'μεντεσές (κυρίως)', color: 0xa855f7, dofCount: 1,
            desc: 'Η άρθρωση του αστραγάλου ανεβοκατεβάζει το πέλμα (σηκώνει ή κατεβάζει τις μύτες των ποδιών), κυρίως σαν <strong>μεντεσές</strong>.',
            range: 'προς τα κάτω έως περίπου 45°, προς τα πάνω έως περίπου 20°',
            dofs: [{ k: 'dors', label: 'Μύτη πάνω – μύτη κάτω', min: -45, max: 20, def: 0 }],
            locks: ['Μεγάλη κλίση προς τα πλάγια (γίνεται κυρίως σε άλλη άρθρωση, κάτω από τον αστράγαλο)', 'Στροφή του πέλματος γύρω από τη κνήμη']
        },
        forearm: {
            name: 'Στροφή της παλάμης', type: 'στροφική (τροχοειδής) διάρθρωση: ακτινοωλενική', color: 0xe11d48, dofCount: 1,
            desc: 'Η παλάμη γυρίζει επειδή το ένα οστό του αντιβραχίου, η <strong>κερκίδα (ακτίνα)</strong>, <strong>περιστρέφεται γύρω από την ωλένη</strong>. Οι δύο ακτινοωλενικές αρθρώσεις (στον αγκώνα και στον καρπό) το επιτρέπουν. Η κίνηση λέγεται <strong>πρηνισμός</strong> (παλάμη προς τα κάτω ή πίσω) και <strong>υπτιασμός</strong> (παλάμη προς τα πάνω ή μπροστά).',
            range: 'έως περίπου 80°–90° προς κάθε κατεύθυνση',
            dofs: [{ k: 'rot', label: 'Πρηνισμός – υπτιασμός', min: -90, max: 90, def: 0 }],
            locks: ['Κάμψη και έκταση (γίνονται στον αγκώνα και στον καρπό)']
        }
    };
    const ORDER = ['shoulder', 'elbow', 'knee', 'ankle', 'forearm'];

    /* ------------------------------------------------------------ 3D helpers */
    function mkHelpers(T) {
        const boneMat = new T.MeshStandardMaterial({ color: 0xecd9b8, roughness: 0.55, metalness: 0.05 });
        const jointMat = new T.MeshStandardMaterial({ color: 0xd6bf94, roughness: 0.5, metalness: 0.05 });
        function between(a, b, r, mat) {
            const g = new T.Group();
            const dir = new T.Vector3().subVectors(b, a), len = dir.length();
            const cyl = new T.Mesh(new T.CylinderGeometry(r, r, len, 20), mat || boneMat);
            cyl.position.copy(a).addScaledVector(dir, 0.5);
            cyl.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), dir.clone().normalize());
            g.add(cyl);
            [a, b].forEach(p => { const s = new T.Mesh(new T.SphereGeometry(r, 20, 14), mat || boneMat); s.position.copy(p); g.add(s); });
            return g;
        }
        const V = (x, y, z) => new T.Vector3(x, y, z);
        return { boneMat, jointMat, between, V };
    }

    /* each joint: group (at the joint centre), apply(values), tip() = world position of a point whose path shows the range */
    function buildJoints(T) {
        const H = mkHelpers(T), V = H.V;
        const joints = {};
        const marker = (col) => new T.MeshStandardMaterial({ color: col, roughness: 0.4, emissive: col, emissiveIntensity: 0.25 });

        // ---------------- shoulder
        {
            const g = new T.Group();
            const scap = new T.Mesh(new T.BoxGeometry(2.4, 2.8, 0.34), H.boneMat); scap.position.set(-1.35, 0.25, -0.55); scap.rotation.y = 0.0; g.add(scap);
            const cup = new T.Mesh(new T.SphereGeometry(0.72, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2), new T.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.55, side: T.DoubleSide, roughness: 0.4 }));
            cup.rotation.z = Math.PI / 2; cup.position.set(-0.05, 0, 0); g.add(cup);               // socket opening towards +x
            const arm = new T.Group();
            const head = new T.Mesh(new T.SphereGeometry(0.52, 24, 18), H.jointMat); arm.add(head);
            arm.add(H.between(V(0, -0.3, 0), V(0, -3.3, 0), 0.3));
            const tipObj = new T.Object3D(); tipObj.position.set(0, -3.3, 0); arm.add(tipObj);
            g.add(arm);
            const axes = new T.Group();      // little label for the lateral direction
            g.add(axes);
            joints.shoulder = {
                group: g, tipObj,
                apply(v) { arm.rotation.set(-(v.flex || 0) * D, (v.rot || 0) * D, (v.abd || 0) * D, 'ZXY'); },
                samples() { const o = []; for (let f = -50; f <= 170; f += 12) for (let a = -30; a <= 170; a += 12) o.push({ flex: f, abd: a, rot: 0 }); return o; }
            };
        }
        // ---------------- elbow
        {
            const g = new T.Group();
            g.add(H.between(V(0, 3.2, 0), V(0, 0, 0), 0.34));
            const pin = new T.Mesh(new T.CylinderGeometry(0.16, 0.16, 1.4, 16), new T.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.6, roughness: 0.3 }));
            pin.rotation.z = Math.PI / 2; g.add(pin);
            const fore = new T.Group();
            fore.add(H.between(V(0, 0, 0), V(0, -2.9, 0), 0.28));
            const hand = new T.Mesh(new T.BoxGeometry(0.9, 1.0, 0.25), H.jointMat); hand.position.set(0, -3.4, 0); fore.add(hand);
            const tipObj = new T.Object3D(); tipObj.position.set(0, -2.9, 0); fore.add(tipObj);
            g.add(fore);
            joints.elbow = {
                group: g, tipObj,
                apply(v) { fore.rotation.set(-(v.flex || 0) * D, 0, 0); },
                samples() { const o = []; for (let f = 0; f <= 145; f += 4) o.push({ flex: f }); return o; }
            };
        }
        // ---------------- knee
        {
            const g = new T.Group();
            g.add(H.between(V(0, 3.4, 0), V(0, 0, 0), 0.4));
            const pin = new T.Mesh(new T.CylinderGeometry(0.18, 0.18, 1.6, 16), new T.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.6, roughness: 0.3 }));
            pin.rotation.z = Math.PI / 2; g.add(pin);
            const shin = new T.Group();
            shin.add(H.between(V(0, 0, 0), V(0, -3.3, 0), 0.32));
            const foot = new T.Mesh(new T.BoxGeometry(0.7, 0.3, 1.5), H.jointMat); foot.position.set(0, -3.5, 0.5); shin.add(foot);
            const patella = new T.Mesh(new T.SphereGeometry(0.3, 16, 12), new T.MeshStandardMaterial({ color: 0x93c5fd, roughness: 0.4 })); patella.scale.set(1, 1.1, 0.6); patella.position.set(0, 0.0, 0.5); g.add(patella);
            const tipObj = new T.Object3D(); tipObj.position.set(0, -3.3, 0); shin.add(tipObj);
            g.add(shin);
            joints.knee = {
                group: g, tipObj,
                apply(v) { const f = (v.flex || 0) * D; shin.rotation.set(f, 0, 0); patella.position.set(0, -0.35 * Math.sin(f * 0.6), 0.5 + 0.1 * Math.cos(f * 0.5)); },
                samples() { const o = []; for (let f = 0; f <= 135; f += 4) o.push({ flex: f }); return o; }
            };
        }
        // ---------------- ankle
        {
            const g = new T.Group();
            g.add(H.between(V(0, 3.4, 0), V(0, 0.15, 0), 0.34));
            const pin = new T.Mesh(new T.CylinderGeometry(0.15, 0.15, 1.2, 16), new T.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.6, roughness: 0.3 }));
            pin.rotation.z = Math.PI / 2; g.add(pin);
            const foot = new T.Group();
            const sole = new T.Mesh(new T.BoxGeometry(0.9, 0.32, 2.3), H.jointMat); sole.position.set(0, -0.55, 0.55); foot.add(sole);
            const heel = new T.Mesh(new T.SphereGeometry(0.36, 16, 12), H.jointMat); heel.position.set(0, -0.5, -0.55); foot.add(heel);
            const tipObj = new T.Object3D(); tipObj.position.set(0, -0.55, 1.7); foot.add(tipObj);
            g.add(foot);
            joints.ankle = {
                group: g, tipObj,
                apply(v) { foot.rotation.set(-(v.dors || 0) * D, 0, 0); },
                samples() { const o = []; for (let f = -45; f <= 20; f += 3) o.push({ dors: f }); return o; }
            };
        }
        // ---------------- forearm rotation (pronation / supination)
        {
            const g = new T.Group();
            const ulna = H.between(V(-0.3, 3.0, 0), V(-0.3, -0.2, 0), 0.2); g.add(ulna);
            const elbowBlock = new T.Mesh(new T.SphereGeometry(0.5, 20, 14), H.jointMat); elbowBlock.position.set(0, 3.2, 0); g.add(elbowBlock);
            const radius = new T.Group(); g.add(radius);
            const hand = new T.Group(); hand.scale.set(1.35, 1.35, 1.35); g.add(hand);
            const palm = new T.Mesh(new T.BoxGeometry(0.12, 1.0, 0.9), new T.MeshStandardMaterial({ color: 0xfda4af, roughness: 0.5 }));
            palm.position.set(-0.3, -0.5, 0); hand.add(palm);                       // pink side = palm
            const back = new T.Mesh(new T.BoxGeometry(0.28, 1.0, 0.9), H.jointMat); back.position.set(-0.06, -0.5, 0); hand.add(back);
            const thumb = new T.Mesh(new T.CylinderGeometry(0.11, 0.11, 0.6, 12), H.jointMat); thumb.position.set(0, -0.2, 0.62); thumb.rotation.x = 0.5; hand.add(thumb);
            const tipObj = new T.Object3D(); tipObj.position.set(0, -0.2, 1.0); hand.add(tipObj);
            let radMesh = null;
            joints.forearm = {
                group: g, tipObj,
                apply(v) {
                    const psi = (v.rot || 0) * D;
                    // distal end of the radius circles around the ulna
                    const wrist = new T.Vector3(-0.3 + 0.8 * Math.sin(psi), 0, 0.8 * Math.cos(psi));
                    if (radMesh) { radius.remove(radMesh); }
                    radMesh = H.between(V(0.25, 3.0, 0), wrist, 0.2);
                    radius.add(radMesh);
                    hand.position.copy(wrist).add(V(0.3, -0.2, 0));
                    hand.position.set(wrist.x, wrist.y - 0.2, wrist.z);
                    hand.rotation.set(0, psi, 0);
                },
                samples() { const o = []; for (let r = -90; r <= 90; r += 4) o.push({ rot: r }); return o; }
            };
            joints.forearm.apply({ rot: 0 });
        }
        Object.keys(joints).forEach(k => { joints[k].key = k; joints[k].meta = META[k]; joints[k].values = {}; META[k].dofs.forEach(d => { joints[k].values[d.k] = d.def; }); });
        return joints;
    }

    /* ------------------------------------------------------------ UI */
    function render(mount) {
        mount.innerHTML = '';
        const root = document.createElement('div');
        root.className = 'bj-wrap';
        root.innerHTML =
            '<div class="bj-head"><h2>🧭 Οι αρθρώσεις σε 3D: ποια κινείται πιο ελεύθερα;</h2>' +
            '<p>Σύρε για περιστροφή της κάμερας, τροχός ή τσίμπημα για ζουμ. Διάλεξε άρθρωση και κίνησε τα ρυθμιστικά. Οι <strong>κουκκίδες</strong> δείχνουν όλες τις θέσεις που μπορεί να φτάσει το άκρο.</p>' +
            '<p class="bj-supp"><strong>➕ Συμπληρωματικό · εκτός βιβλίου · δεν ζητείται.</strong> Το βιβλίο λέει μόνο ότι η διάρθρωση επιτρέπει τις κινήσεις των οστών (π.χ. ώμος, αγκώνας). Τα ονόματα των τύπων και οι γωνίες εδώ είναι ενδεικτικά.</p></div>' +
            '<div class="bj-tabs" id="bj-tabs"></div>' +
            '<div class="bj-grid"><div class="bj-stage" id="bj-stage"><button type="button" class="bj-fs" data-act="fs">⛶ Πλήρης οθόνη</button><div class="bj-chips" id="bj-chips"></div></div>' +
            '<aside class="bj-side" id="bj-side"></aside></div>' +
            '<div class="bj-tw"><table class="bga-table bga-plain bj-table"><thead><tr><th>Άρθρωση</th><th>Τύπος</th><th>Κατευθύνσεις κίνησης</th><th>Ενδεικτικό εύρος</th></tr></thead><tbody id="bj-tbody"></tbody></table></div>';
        mount.appendChild(root);
        const stage = root.querySelector('#bj-stage');
        const side = root.querySelector('#bj-side');
        const tabs = root.querySelector('#bj-tabs');
        const chips = root.querySelector('#bj-chips');
        root.querySelector('#bj-tbody').innerHTML = ORDER.map(k => { const m = META[k]; return '<tr><th scope="row">' + m.name + '</th><td>' + m.type + '</td><td><strong>' + m.dofCount + '</strong>' + (m.dofCount === 1 ? ' (ένα επίπεδο)' : ' (τρεις)') + '</td><td>' + m.range + '</td></tr>'; }).join('');
        const st = { sel: 'shoulder', compare: false, auto: false, cloud: true };
        tabs.innerHTML = ORDER.map(k => '<button type="button" class="bj-tab" data-j="' + k + '">' + META[k].name + '</button>').join('') + '<button type="button" class="bj-tab bj-tab-cmp" data-j="all">⚖️ Σύγκριση όλων</button>';
        stage.insertAdjacentHTML('beforeend', '<p class="bj-load">Φόρτωση 3D…</p>');

        let app = null;
        ensureThree().then(() => { if (root.isConnected) { stage.querySelector('.bj-load').remove(); app = start(); } })
            .catch(() => { stage.innerHTML = '<p class="bj-err">Δεν ήταν δυνατή η φόρτωση της βιβλιοθήκης 3D (Three.js). Ελέγξτε τη σύνδεση στο διαδίκτυο και ανανεώστε τη σελίδα.</p>'; });

        function start() {
            const T = window.THREE;
            const renderer = new T.WebGLRenderer({ antialias: true });
            renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
            renderer.setClearColor(0x0b1220, 1);
            const dom = renderer.domElement; dom.className = 'bj-canvas'; stage.insertBefore(dom, stage.firstChild);
            const scene = new T.Scene();
            scene.fog = new T.Fog(0x0b1220, 25, 70);
            const cam = new T.PerspectiveCamera(40, 1, 0.1, 200);
            scene.add(new T.HemisphereLight(0xdbeafe, 0x1e293b, 0.95));
            const sun = new T.DirectionalLight(0xffffff, 0.8); sun.position.set(5, 9, 8); scene.add(sun);
            const grid = new T.GridHelper(40, 40, 0x2b3b5c, 0x1b2740); grid.position.y = -4.6; scene.add(grid);
            const joints = buildJoints(T);
            const clouds = {};
            ORDER.forEach(k => {
                const j = joints[k];
                scene.add(j.group);
                // cloud of reachable positions of the tip
                const pts = [];
                j.samples().forEach(s => { j.apply(s); j.group.updateMatrixWorld(true); const p = new T.Vector3(); j.tipObj.getWorldPosition(p); pts.push(p.x, p.y, p.z); });
                j.apply(j.values);
                const geo = new T.BufferGeometry(); geo.setAttribute('position', new T.Float32BufferAttribute(pts, 3));
                const cl = new T.Points(geo, new T.PointsMaterial({ color: META[k].color, size: 0.2, transparent: true, opacity: 0.95 }));
                j.group.add(cl);
                // the cloud is computed in world coordinates of a group at the origin: undo the group position later
                cl.userData.base = pts;
                clouds[k] = cl;
                // tip marker
                const m = new T.Mesh(new T.SphereGeometry(0.22, 16, 12), new T.MeshStandardMaterial({ color: META[k].color, emissive: META[k].color, emissiveIntensity: 0.6 }));
                j.tipObj.add(m);
            });
            const spacing = 9;
            const view = { th: 0.6, ph: 1.2, r: 15, tx: 0, ty: -0.2, tz: 0 }, want = Object.assign({}, view);
            function layoutScene() {
                ORDER.forEach((k, i) => {
                    const j = joints[k];
                    j.group.visible = st.compare || st.sel === k;
                    const rowTop = i < 3, col = rowTop ? i - 1 : i - 3 - 0.5;
                    j.group.position.set(st.compare ? col * spacing : 0, st.compare ? (rowTop ? 4.6 : -5.4) : 0, 0);
                    clouds[k].visible = st.cloud;
                });
                want.tx = 0; want.th = st.compare ? 0.12 : 0.6; want.r = st.compare ? 36 : 15; want.ph = st.compare ? 1.45 : 1.2;
                tabs.querySelectorAll('.bj-tab').forEach(b => b.classList.toggle('on', st.compare ? b.dataset.j === 'all' : b.dataset.j === st.sel));
                chips.innerHTML = st.compare ? ORDER.map(k => '<span class="bj-chip" data-k="' + k + '" style="border-color:#' + META[k].color.toString(16).padStart(6, '0') + '">' + META[k].name + '</span>').join('') : '';
                buildSide();
            }
            // pointer orbit
            const pointers = new Map(); let lastPinch = 0;
            dom.style.touchAction = 'none';
            dom.addEventListener('pointerdown', e => { dom.setPointerCapture(e.pointerId); pointers.set(e.pointerId, { x: e.clientX, y: e.clientY }); lastPinch = 0; });
            dom.addEventListener('pointermove', e => {
                const pr = pointers.get(e.pointerId); if (!pr) return;
                if (pointers.size === 2) {
                    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
                    const [a, b] = [...pointers.values()], d = Math.hypot(a.x - b.x, a.y - b.y);
                    if (lastPinch) want.r = Math.min(80, Math.max(5, want.r * lastPinch / d)); lastPinch = d; return;
                }
                want.th -= (e.clientX - pr.x) * 0.007; want.ph = Math.min(1.7, Math.max(0.2, want.ph - (e.clientY - pr.y) * 0.007));
                pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
            });
            const up = e => pointers.delete(e.pointerId);
            dom.addEventListener('pointerup', up); dom.addEventListener('pointercancel', up);
            dom.addEventListener('wheel', e => { e.preventDefault(); want.r = Math.min(80, Math.max(5, want.r * (1 + e.deltaY * 0.0012))); }, { passive: false });

            function buildSide() {
                if (st.compare) {
                    side.innerHTML = '<div class="bj-card"><h3>⚖️ Σύγκριση</h3><p>Και οι πέντε αρθρώσεις κινούνται τώρα αυτόματα μέσα στα όριά τους. Οι κουκκίδες δείχνουν πόσο «χώρο» καλύπτει το άκρο καθεμιάς.</p><ul class="bj-cmp">' +
                        ORDER.map(k => '<li><i style="background:#' + META[k].color.toString(16).padStart(6, '0') + '"></i><span><strong>' + META[k].name + '</strong>: ' + (META[k].dofCount === 3 ? 'κινείται σε <strong>πολλές κατευθύνσεις</strong>' : 'κινείται σε <strong>ένα επίπεδο</strong>') + '</span></li>').join('') +
                        '</ul><p class="bj-note">Ο ώμος έχει <strong>πολύ μεγαλύτερη ελευθερία</strong> από τις άλλες, που είναι κυρίως μεντεσέδες.</p></div>' + toggles();
                } else {
                    const j = joints[st.sel], m = META[st.sel];
                    side.innerHTML = '<div class="bj-card"><h3>' + m.name + '</h3><div class="bj-type">' + m.type + '</div><p>' + m.desc + '</p><div class="bj-dof"><b>' + m.dofCount + '</b> ' + (m.dofCount === 1 ? 'βαθμός ελευθερίας (ένας άξονας κίνησης)' : 'βαθμοί ελευθερίας (τρεις άξονες κίνησης)') + '</div></div>' +
                        '<div class="bj-card"><h4>Κινήσεις που επιτρέπονται</h4>' + m.dofs.map(d => '<label class="bj-slider"><span>' + d.label + ' <b id="bj-v-' + d.k + '">' + Math.round(j.values[d.k]) + '°</b></span><input type="range" min="' + d.min + '" max="' + d.max + '" value="' + j.values[d.k] + '" data-k="' + d.k + '"><small>' + d.min + '° … ' + d.max + '°</small></label>').join('') +
                        (m.locks.length ? '<h4>Κινήσεις που δεν γίνονται</h4>' + m.locks.map(l => '<div class="bj-lock">🔒 ' + l + '</div>').join('') : '') + '</div>' + toggles();
                }
            }
            function toggles() {
                return '<div class="bj-toggles"><button type="button" class="bj-btn' + (st.auto ? ' on' : '') + '" data-act="auto">' + (st.auto ? '⏸ Παύση επίδειξης' : '▶ Αυτόματη επίδειξη') + '</button>' +
                    '<button type="button" class="bj-btn' + (st.cloud ? ' on' : '') + '" data-act="cloud">⚫ Περιοχή κίνησης</button><button type="button" class="bj-btn" data-act="reset">↺ Αρχική θέση / κάμερα</button></div>';
            }
            root.addEventListener('click', e => {
                const b = e.target.closest('[data-j],[data-act]'); if (!b) return;
                if (b.dataset.j) { if (b.dataset.j === 'all') { st.compare = true; st.auto = true; } else { st.compare = false; st.sel = b.dataset.j; } layoutScene(); }
                else if (b.dataset.act === 'auto') { st.auto = !st.auto; buildSide(); }
                else if (b.dataset.act === 'cloud') { st.cloud = !st.cloud; layoutScene(); }
                else if (b.dataset.act === 'reset') { st.auto = false; ORDER.forEach(k => { META[k].dofs.forEach(d => { joints[k].values[d.k] = d.def; }); joints[k].apply(joints[k].values); }); want.th = 0.6; want.ph = 1.2; want.r = st.compare ? 36 : 15; buildSide(); }
                else if (b.dataset.act === 'fs') { const w = root.querySelector('.bj-grid'); if (document.fullscreenElement) document.exitFullscreen(); else if (w.requestFullscreen) w.requestFullscreen().catch(() => {}); }
            });
            root.addEventListener('input', e => {
                const inp = e.target.closest('input[type=range]'); if (!inp || st.compare) return;
                st.auto = false;
                const j = joints[st.sel]; j.values[inp.dataset.k] = +inp.value; j.apply(j.values);
                const lab = root.querySelector('#bj-v-' + inp.dataset.k); if (lab) lab.textContent = Math.round(+inp.value) + '°';
            });
            const ro = new ResizeObserver(() => { const w = stage.clientWidth, h = stage.clientHeight; if (w > 0 && h > 0) { renderer.setSize(w, h); cam.aspect = w / h; cam.updateProjectionMatrix(); } });
            ro.observe(stage);

            let last = performance.now(), t = 0;
            const proj = new T.Vector3();
            function autoVals(k, tt, ph) {
                const m = META[k], o = {};
                m.dofs.forEach((d, i) => {
                    const mid = (d.min + d.max) / 2, amp = (d.max - d.min) / 2;
                    const f = k === 'shoulder' ? [1.0, 1.0, 0.7][i] : 1.0, p = k === 'shoulder' ? [0, 1.57, 0.8][i] : 0;
                    o[d.k] = mid + amp * Math.sin(tt * f * 1.1 + p + ph);
                });
                return o;
            }
            function frame(now) {
                if (!root.isConnected) { ro.disconnect(); renderer.dispose(); return; }
                requestAnimationFrame(frame);
                const dt = Math.max(0, Math.min(0.05, (now - last) / 1000)); last = now;
                if (!stage.clientWidth) return;
                t += dt;
                const k = 1 - Math.exp(-dt * 6);
                view.th += (want.th - view.th) * k; view.ph += (want.ph - view.ph) * k; view.r += (want.r - view.r) * k;
                cam.position.set(view.tx + view.r * Math.sin(view.ph) * Math.sin(view.th), view.ty + view.r * Math.cos(view.ph), view.tz + view.r * Math.sin(view.ph) * Math.cos(view.th));
                cam.lookAt(view.tx, view.ty, view.tz);
                if (st.auto || st.compare) {
                    ORDER.forEach((kk, i) => {
                        if (!st.compare && kk !== st.sel) return;
                        const v = autoVals(kk, t, i * 0.7);
                        joints[kk].apply(v);
                        if (!st.compare) {
                            const m = META[kk];
                            m.dofs.forEach(d => { joints[kk].values[d.k] = v[d.k]; const inp = side.querySelector('input[data-k="' + d.k + '"]'); if (inp) inp.value = v[d.k]; const lab = side.querySelector('#bj-v-' + d.k); if (lab) lab.textContent = Math.round(v[d.k]) + '°'; });
                        }
                    });
                }
                // labels over each joint in compare mode
                if (st.compare) {
                    const r = dom.getBoundingClientRect();
                    chips.querySelectorAll('.bj-chip').forEach(c => {
                        const j = joints[c.dataset.k];
                        proj.set(j.group.position.x, j.group.position.y + 3.9, 0).project(cam);
                        c.style.left = ((proj.x * 0.5 + 0.5) * r.width) + 'px'; c.style.top = ((-proj.y * 0.5 + 0.5) * r.height) + 'px';
                    });
                }
                renderer.render(scene, cam);
            }
            layoutScene();
            requestAnimationFrame(frame);
            return { renderer };
        }
    }
    window.BioBJoints3D = { render };
})();
