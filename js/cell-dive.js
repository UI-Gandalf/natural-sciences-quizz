/* ==========================================================================
   Biology Γ: "Κατάδυση στο κύτταρο" - one single mode: free exploration of a 3D eukaryotic cell (animal or plant).
   You swim around, click an organelle to get to know it, and then look for the parts it is made of
   (its morphology): every part you click in the 3D world is ticked in the panel, next to the school-book text
   about the structure and the function of the organelle.
   Texts: the school material of sheets Γ3.1 - Γ3.4 (the same as in js/cell-explorer.js); the shapes are schematic.
   Three.js r128 is loaded on demand. window.CellDive.render(mountElement)
   ========================================================================== */
window.CellDive = (function () {
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

    /* ------------------------------------------------------------------ content (school material Γ3.1 - Γ3.4) */
    const ORG = {
        membrane: { name: 'Πλασματική μεμβράνη', num: 1, color: '#7dd3fc',
            structure: 'Η πλασματική μεμβράνη, όπως και όλες οι μεμβράνες, αποτελείται από λιπίδια που εμποδίζουν την ελεύθερη διέλευση των ουσιών και από πρωτεΐνες που λειτουργούν ως κανάλια ελεγχόμενης διέλευσης.',
            func: 'Περιβάλλει το κύτταρο και ελέγχει την είσοδο και την έξοδο ουσιών.',
            parts: [['lipids', 'Λιπίδια', 'Εμποδίζουν την ελεύθερη διέλευση των ουσιών.'], ['channels', 'Πρωτεΐνες-κανάλια', 'Λειτουργούν ως κανάλια ελεγχόμενης διέλευσης.']] },
        nucleus: { name: 'Πυρήνας', num: 2, color: '#b39ddb',
            structure: 'Περιβάλλεται από διπλή πυρηνική μεμβράνη (πυρηνικός φάκελος) και έχει ανοίγματα για την επικοινωνία με το υπόλοιπο κύτταρο (πυρηνικοί πόροι).',
            func: 'Περιέχει τις γενετικές πληροφορίες (DNA) για τη δομή και τη λειτουργία του κυττάρου.',
            parts: [['envelope', 'Διπλή πυρηνική μεμβράνη', 'Ο πυρηνικός φάκελος, που περιβάλλει τον πυρήνα.'], ['pores', 'Πυρηνικοί πόροι', 'Ανοίγματα για την επικοινωνία με το υπόλοιπο κύτταρο.'], ['dna', 'Γενετικό υλικό (DNA)', 'Οι γενετικές πληροφορίες του κυττάρου.']] },
        rer: { name: 'Αδρό ενδοπλασματικό δίκτυο', num: 3, color: '#f48fb1',
            structure: 'Το ενδοπλασματικό δίκτυο (ΕΔ) αποτελείται από ένα συνεχόμενο δίκτυο σωλήνων και μεμβρανών, με το οποίο συνδέεται όλο το εσωτερικό του κυττάρου. Το αδρό ΕΔ φέρει ριβοσώματα στην επιφάνειά του.',
            func: 'Σύνθεση πρωτεϊνών.',
            parts: [['net', 'Δίκτυο σωλήνων και μεμβρανών', 'Συνεχόμενο δίκτυο, με το οποίο συνδέεται όλο το εσωτερικό του κυττάρου.'], ['ribo', 'Ριβοσώματα στην επιφάνειά του', 'Το αδρό ΕΔ φέρει ριβοσώματα στην επιφάνειά του.']] },
        ser: { name: 'Λείο ενδοπλασματικό δίκτυο', num: 4, color: '#4db6ac',
            structure: 'Είναι το ίδιο συνεχόμενο δίκτυο σωλήνων και μεμβρανών του ενδοπλασματικού δικτύου, αλλά χωρίς ριβοσώματα στην επιφάνειά του.',
            func: 'Σύνθεση λιπιδίων και αποθήκευση πρωτεϊνών.',
            parts: [['net', 'Δίκτυο σωλήνων χωρίς ριβοσώματα', 'Το ίδιο συνεχόμενο δίκτυο, αλλά χωρίς ριβοσώματα στην επιφάνειά του.']] },
        ribosome: { name: 'Ριβοσώματα', num: 5, color: '#cfd8dc',
            structure: 'Αποτελούνται από RNA και πρωτεΐνες. Βρίσκονται στο αδρό ενδοπλασματικό δίκτυο και ελεύθερα στο κυτταρόπλασμα.',
            func: 'Σύνθεση πρωτεϊνών.',
            parts: [['free', 'Ελεύθερα στο κυτταρόπλασμα', 'Μικρά σωματίδια που αιωρούνται στο κυτταρόπλασμα.'], ['onrer', 'Πάνω στο αδρό ενδοπλασματικό δίκτυο', 'Οι σκούρες κουκκίδες στην επιφάνεια του αδρού ΕΔ.']] },
        golgi: { name: 'Σύμπλεγμα Golgi', num: 6, color: '#ffb74d',
            structure: 'Είναι ένα σύνολο πεπλατυσμένων σάκων, προς και από τους οποίους καταλήγουν κυστίδια μεταφοράς.',
            func: 'Τελική τροποποίηση των πρωτεϊνών.',
            parts: [['sacs', 'Πεπλατυσμένοι σάκοι', 'Ένα σύνολο από πεπλατυσμένους σάκους, ο ένας δίπλα στον άλλο.'], ['vesicles', 'Κυστίδια μεταφοράς', 'Καταλήγουν προς και από τους σάκους.']] },
        mito: { name: 'Μιτοχόνδριο', num: 7, color: '#ff8a65',
            structure: 'Περιβάλλεται από μία εξωτερική και μία εσωτερική μεμβράνη. Στο εσωτερικό του υπάρχει πλήθος πρωτεϊνών. Έχει δικά του ριβοσώματα και DNA.',
            func: 'Κυτταρική αναπνοή: διάσπαση γλυκόζης και παραγωγή ενέργειας.',
            endo: 'Σύμφωνα με την ενδοσυμβιωτική θεωρία, το μιτοχόνδριο προέκυψε από ένα ετερότροφο βακτήριο που ενσωματώθηκε σε αρχέγονο κύτταρο.',
            parts: [['outer', 'Εξωτερική μεμβράνη', 'Το εξωτερικό περίβλημα του μιτοχονδρίου.'], ['inner', 'Εσωτερική μεμβράνη', 'Η δεύτερη μεμβράνη, στο εσωτερικό του.'], ['own', 'Δικά του ριβοσώματα και DNA', 'Ο μικρός δακτύλιος (DNA) και οι κουκκίδες (ριβοσώματα) στο εσωτερικό του.']] },
        lyso: { name: 'Λυσόσωμα', num: 8, color: '#c5e1a5',
            structure: 'Είναι ένα κυστίδιο που περιέχει δραστικά ένζυμα.',
            func: 'Πέψη τροφών, διάσπαση μικροβίων και αυτοκαταστροφή οργανιδίων.',
            parts: [['vesicle', 'Κυστίδιο', 'Το σφαιρικό περίβλημα του λυσοσώματος.'], ['enzymes', 'Δραστικά ένζυμα', 'Βρίσκονται στο εσωτερικό του κυστιδίου.']] },
        dvacuole: { name: 'Πεπτικό κενοτόπιο', num: 9, color: '#81d4fa',
            structure: 'Έχει παρόμοια δομή με το χυμοτόπιο των φυτικών κυττάρων, αλλά μικρότερο μέγεθος. Περιβάλλεται από μία ειδική μεμβράνη, η οποία ρυθμίζει την είσοδο και την έξοδο ουσιών σε αυτό.',
            func: 'Στα ζωικά κύτταρα βρίσκεται το πεπτικό κενοτόπιο, ως αντίστοιχο (μικρότερο) του χυμοτοπίου των φυτικών κυττάρων.',
            parts: [['memb', 'Ειδική μεμβράνη', 'Ρυθμίζει την είσοδο και την έξοδο ουσιών.']] },
        wall: { name: 'Κυτταρικό τοίχωμα', num: 9, color: '#bcaaa4',
            structure: 'Αποτελείται από μικροϊνίδια κυτταρίνης, που σχηματίζουν παράλληλα διαδοχικά στρώματα και συνδέονται και συμπληρώνονται με τη συμμετοχή και άλλων χημικών ουσιών.',
            func: 'Προστασία και στήριξη του κυττάρου.',
            parts: [['fibers', 'Μικροϊνίδια κυτταρίνης', 'Σχηματίζουν παράλληλα διαδοχικά στρώματα.']] },
        chloro: { name: 'Χλωροπλάστης', num: 10, color: '#66bb6a',
            structure: 'Στο εσωτερικό του εντοπίζονται οργανωμένες δομές μεμβρανών, στις οποίες βρίσκονται οι πρωτεΐνες που είναι απαραίτητες για τη λειτουργία της φωτοσύνθεσης. Έχει δικά του ριβοσώματα και DNA.',
            func: 'Φωτοσύνθεση: παραγωγή γλυκόζης και οξυγόνου.',
            endo: 'Σύμφωνα με την ενδοσυμβιωτική θεωρία, ο χλωροπλάστης προέκυψε από ένα κυανοβακτήριο (φωτοσυνθετικό προκαρυωτικό οργανισμό) που ενσωματώθηκε σε κύτταρο-ξενιστή.',
            parts: [['membranes', 'Οργανωμένες δομές μεμβρανών', 'Εκεί βρίσκονται οι πρωτεΐνες που είναι απαραίτητες για τη φωτοσύνθεση.'], ['own', 'Δικά του ριβοσώματα και DNA', 'Ο μικρός δακτύλιος (DNA) και οι κουκκίδες (ριβοσώματα) στο εσωτερικό του.']] },
        vacuole: { name: 'Χυμοτόπιο', num: 11, color: '#80deea',
            structure: 'Περιβάλλεται από μία ειδική μεμβράνη, η οποία ρυθμίζει την είσοδο και την έξοδο ουσιών σε αυτό. Παρόμοια δομή, αλλά μικρότερο μέγεθος, έχει το πεπτικό κενοτόπιο στα ζωικά ευκαρυωτικά κύτταρα.',
            func: 'Αποθήκευση νερού, αλάτων και διαφόρων θρεπτικών συστατικών.',
            parts: [['memb', 'Ειδική μεμβράνη', 'Ρυθμίζει την είσοδο και την έξοδο ουσιών.'], ['content', 'Περιεχόμενο', 'Νερό, άλατα και διάφορα θρεπτικά συστατικά.']] },
        cyto: { name: 'Κυτταρόπλασμα', num: null, color: '#9ee1ee',
            structure: 'Είναι η περιοχή που εκτείνεται από τον πυρήνα έως την πλασματική μεμβράνη του κυττάρου.',
            func: 'Σε αυτήν εντοπίζονται όλα τα κυτταρικά οργανίδια.', parts: [] }
    };
    const ORDER = {
        animal: ['membrane', 'nucleus', 'rer', 'ser', 'ribosome', 'golgi', 'mito', 'lyso', 'dvacuole', 'cyto'],
        plant: ['membrane', 'wall', 'nucleus', 'rer', 'ser', 'ribosome', 'golgi', 'mito', 'lyso', 'chloro', 'vacuole', 'cyto']
    };
    const R = [72, 52, 62];                                   // semi-axes of the cell
    const LAYOUT = {
        animal: { nucleus: [0, 0, 0], nucRot: 1.41, rerFace: 0, ser: [-32, 8, -14], golgi: [40, -12, 10],
            mito: [[-34, -20, -12], [22, 24, -24], [-10, -30, 24], [36, 12, -30]], lyso: [[-46, 12, -18], [10, -34, -10], [-22, 30, 14], [46, -26, -6], [-6, 28, -32]], dvac: [[-48, -6, 24], [26, -36, 30]] },
        plant: { nucleus: [28, 8, 14], nucRot: 0.94, rerFace: 0.9, ser: [-6, -26, 36], golgi: [40, -22, -16],
            mito: [[10, 32, -24], [-10, -34, 26], [42, 26, -10]], lyso: [[8, -34, -12], [-26, 34, 18], [48, -2, -30], [-4, 22, 38]],
            vacuole: [-20, 0, -4], chloro: [[-46, 22, 30], [-52, -14, -18], [-6, 32, -34], [14, -40, 20]] }
    };
    const START = { pos: [-34, 6, 40], yaw: 0.72, pitch: -0.08 };

    function render(mount) {
        mount.innerHTML =
            '<div class="sv-wrap cd-wrap">' +
            '<div class="sv-head"><h2>🤿 Κατάδυση στο κύτταρο</h2>' +
            '<p>Κολύμπησε μέσα σε ένα <strong>ευκαρυωτικό κύτταρο</strong>. <strong>Πάτησε πάνω σε ένα οργανίδιο</strong> για να το γνωρίσεις και μετά ψάξε <strong>τα μέρη από τα οποία αποτελείται</strong>, πατώντας πάνω τους. Κίνηση: <strong>σύρε</strong> για να κοιτάξεις, πλήκτρα <strong>W A S D</strong> ή βέλη, ροδάκι για μπρος–πίσω.</p></div>' +
            '<div class="cd-stage" id="cd-stage">' +
            '<div class="cd-load" id="cd-load">⏳ Φορτώνει το κύτταρο…</div>' +
            '<div class="cd-top"><div class="cd-seg" role="group" aria-label="Είδος κυττάρου"><button type="button" class="cd-btn on" data-type="animal">🐾 Ζωικό κύτταρο</button><button type="button" class="cd-btn" data-type="plant">🌿 Φυτικό κύτταρο</button></div>' +
            '<button type="button" class="cd-btn" data-act="help">❓ Οδηγίες</button><button type="button" class="cd-btn" data-act="full">⛶ Πλήρης οθόνη</button>' +
            '<span class="cd-prog" id="cd-prog"></span></div>' +
            '<div class="cd-toast" id="cd-toast"></div>' +
            '<div class="cd-list" id="cd-list"></div>' +
            '<div class="cd-card" id="cd-card"></div>' +
            '<div class="cd-hover" id="cd-hover"></div>' +
            '<div class="cd-pad" id="cd-pad"><button type="button" data-k="fwd" aria-label="Μπροστά">▲</button><button type="button" data-k="up" aria-label="Πάνω">⤒</button><button type="button" data-k="back" aria-label="Πίσω">▼</button><button type="button" data-k="down" aria-label="Κάτω">⤓</button></div>' +
            '</div></div>';
        const stage = mount.querySelector('#cd-stage');
        ensureThree().then(() => start(stage)).catch(() => { stage.querySelector('#cd-load').textContent = '⚠ Δεν φορτώθηκε η βιβλιοθήκη 3D (χρειάζεται σύνδεση στο διαδίκτυο). Ξαναφόρτωσε τη σελίδα.'; });
    }

    function start(stage) {
        const $ = (s) => stage.querySelector(s);
        let renderer;
        try { renderer = new THREE.WebGLRenderer({ antialias: true }); } catch (e) { $('#cd-load').textContent = '⚠ Η συσκευή σου δεν υποστηρίζει 3D (WebGL).'; return; }
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        const canvas = renderer.domElement; canvas.className = 'cd-canvas';
        stage.insertBefore(canvas, stage.firstChild);
        const scene = new THREE.Scene(); scene.background = new THREE.Color(0x0a3341); scene.fog = new THREE.FogExp2(0x0a3341, 0.0118);
        const camera = new THREE.PerspectiveCamera(70, 1, 0.2, 400); camera.rotation.order = 'YXZ';
        const lights = new THREE.Group(); lights.add(new THREE.AmbientLight(0xbfe9ff, 0.55)); lights.add(new THREE.HemisphereLight(0xcdefff, 0x1b4d5c, 0.55));
        scene.add(lights); camera.add(new THREE.PointLight(0xffffff, 0.9, 150)); scene.add(camera);
        let world = null;                                     // everything of the current cell (rebuilt when the type changes)

        /* ---------------------------------------------------------------- state: one place, one render function */
        const S = {
            type: 'animal', sel: null, pos: new THREE.Vector3(), yaw: 0, pitch: 0, vel: new THREE.Vector3(), keys: {}, fly: null, turn: null,
            prog: { animal: { found: {}, seen: {} }, plant: { found: {}, seen: {} } },
            items: {}, labels: [], vesicles: [], particles: null, pulse: null, hoverId: null
        };
        const P = () => S.prog[S.type];
        const seenOf = (id) => (P().seen[id] || (P().seen[id] = {}));
        const complete = (id) => P().found[id] && ORG[id].parts.every((p) => seenOf(id)[p[0]]);
        const esc = (s) => String(s == null ? '' : s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

        /* ---------------------------------------------------------------- building blocks */
        let seed = 1;
        const rng = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
        const rr = (a, b) => a + (b - a) * rng();
        const dummy = new THREE.Object3D();
        function M(color, opt) { const m = new THREE.MeshPhongMaterial(Object.assign({ color: color, shininess: 50 }, opt || {})); m.userData.base = m.emissive.getHex(); return m; }
        const glass = (color, op) => M(color, { transparent: true, opacity: op, side: THREE.DoubleSide, depthWrite: false });
        function fib(n, r) { const out = [], g = Math.PI * (3 - Math.sqrt(5)); for (let i = 0; i < n; i++) { const y = 1 - (i / (n - 1)) * 2, rad = Math.sqrt(1 - y * y), th = g * i; out.push(new THREE.Vector3(Math.cos(th) * rad * r, y * r, Math.sin(th) * rad * r)); } return out; }
        function tube(pts, rad, mat, seg) { return new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), seg || 40, rad, 6, false), mat); }
        const inside = (p, k) => (p.x / R[0]) ** 2 + (p.y / R[1]) ** 2 + (p.z / R[2]) ** 2 <= (k || 1);
        const onShell = (d, k) => new THREE.Vector3(d.x * R[0] * k, d.y * R[1] * k, d.z * R[2] * k);

        function item(id, center, radius) { const it = S.items[id] || (S.items[id] = { id: id, centers: [], radius: radius, parts: {}, meshes: [] }); if (center) it.centers.push(new THREE.Vector3().fromArray(center)); return it; }
        /* tag a mesh: which organelle, which part of it, and whether it is a see-through shell */
        function tag(mesh, id, part, shell) {
            mesh.userData.id = id; mesh.userData.part = part || null; mesh.userData.shell = !!shell;
            const it = S.items[id]; it.meshes.push(mesh);
            if (part) { const p = it.parts[part] || (it.parts[part] = { mats: new Set() }); p.mats.add(mesh.material); }
            return mesh;
        }
        function add(parent, mesh, id, part, shell) { parent.add(mesh); return tag(mesh, id, part, shell); }

        function buildMembrane(g) {
            item('membrane', [0, 0, R[2] * 0.96], 12);
            const cv = document.createElement('canvas'); cv.width = cv.height = 128; const x = cv.getContext('2d');
            for (let j = 0; j < 8; j++) for (let i = 0; i < 8; i++) { x.fillStyle = 'rgba(255,255,255,0.42)'; x.beginPath(); x.arc(8 + i * 16 + (j % 2) * 8, 8 + j * 16, 4.6, 0, 6.3); x.fill(); }
            const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(22, 12);
            const shell = new THREE.Mesh(new THREE.SphereGeometry(1, 56, 36), M(0x4fc3f7, { map: t, side: THREE.BackSide, transparent: true, opacity: 0.38, depthWrite: false })); shell.scale.set(R[0], R[1], R[2]);
            add(g, shell, 'membrane', 'lipids'); shell.userData.boundary = true;
            // protein channels all around
            const dirs = fib(120, 1), chM = M(0x0277bd);
            const ch = new THREE.InstancedMesh(new THREE.CylinderGeometry(1.3, 1.3, 4.4, 10, 1, true), chM, dirs.length); chM.side = THREE.DoubleSide;
            dirs.forEach((d, i) => { dummy.position.copy(onShell(d, 0.985)); dummy.lookAt(0, 0, 0); dummy.rotateX(Math.PI / 2); dummy.updateMatrix(); ch.setMatrixAt(i, dummy.matrix); });
            add(g, ch, 'membrane', 'channels');
            // a patch where the lipids themselves are drawn (two layers: heads and tails), around the +z pole
            const pole = new THREE.Vector3(0, 0, 1), heads = [], tails = [], chanDirs = dirs.filter((d) => d.dot(pole) > 0.9);
            fib(9000, 1).forEach((d) => {
                if (d.dot(pole) < 0.915) return;
                if (chanDirs.some((c) => onShell(c, 1).distanceTo(onShell(d, 1)) < 2.4)) return;
                heads.push([d, 0.972], [d, 1.012]); tails.push([d, 0.984], [d, 1.0]);
            });
            const hm = M(0xffe0b2), tm = M(0xfff3e0);
            const hI = new THREE.InstancedMesh(new THREE.SphereGeometry(0.5, 8, 6), hm, heads.length), tI = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.11, 0.11, 0.95, 5), tm, tails.length);
            heads.forEach((h, i) => { dummy.rotation.set(0, 0, 0); dummy.position.copy(onShell(h[0], h[1])); dummy.updateMatrix(); hI.setMatrixAt(i, dummy.matrix); });
            tails.forEach((h, i) => { dummy.position.copy(onShell(h[0], h[1])); dummy.lookAt(0, 0, 0); dummy.rotateX(Math.PI / 2); dummy.updateMatrix(); tI.setMatrixAt(i, dummy.matrix); });
            add(g, hI, 'membrane', 'lipids'); add(g, tI, 'membrane', 'lipids');
        }
        function buildWall(g) {
            item('wall', [-R[0] * 0.93, 8, 10], 12);
            const cv = document.createElement('canvas'); cv.width = cv.height = 256; const x = cv.getContext('2d'); x.fillStyle = '#7a5f4b'; x.fillRect(0, 0, 256, 256);
            for (let i = 0; i < 46; i++) { x.strokeStyle = 'rgba(230,205,165,' + rr(0.25, 0.55) + ')'; x.lineWidth = rr(1.2, 2.6); const y = i * 5.6 + rr(-1, 1); x.beginPath(); x.moveTo(0, y); x.lineTo(256, y); x.stroke(); }
            const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(6, 5);
            const w = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 32), M(0xffffff, { map: t, side: THREE.BackSide, transparent: true, opacity: 0.62 })); w.scale.set(R[0] + 3.4, R[1] + 3.4, R[2] + 3.4);
            add(g, w, 'wall', 'fibers');
        }
        function buildNucleus(g0, c, rot) {
            item('nucleus', c, 14);
            const g = new THREE.Group(); g.position.fromArray(c); g.rotation.y = rot; g0.add(g);
            const CUT = 5.15;                                  // the envelope is drawn open (a wedge is missing), so that the inside shows
            add(g, new THREE.Mesh(new THREE.SphereGeometry(13, 40, 26, 0, CUT), glass(0x9575cd, 0.42)), 'nucleus', 'envelope', true);
            add(g, new THREE.Mesh(new THREE.SphereGeometry(12, 36, 24, 0, CUT), glass(0xb39ddb, 0.3)), 'nucleus', 'envelope', true);
            const pts = fib(60, 13).filter((p) => { let ph = Math.atan2(p.z, -p.x); if (ph < 0) ph += Math.PI * 2; return ph < CUT - 0.18 && ph > 0.18; });
            const pores = new THREE.InstancedMesh(new THREE.TorusGeometry(0.95, 0.32, 8, 14), M(0x4527a0), pts.length);
            pts.forEach((p, i) => { dummy.position.copy(p); dummy.lookAt(p.clone().multiplyScalar(2)); dummy.updateMatrix(); pores.setMatrixAt(i, dummy.matrix); });
            add(g, pores, 'nucleus', 'pores');
            const dm = M(0xce93d8);
            for (let k = 0; k < 7; k++) { const p = []; for (let i = 0; i < 7; i++) p.push(new THREE.Vector3(rr(-7.5, 7.5), rr(-7.5, 7.5), rr(-7.5, 7.5))); add(g, tube(p, 0.42, dm, 60), 'nucleus', 'dna'); }
        }
        function sheet(c, r0, ph0, ph1, th0, th1, wave, nu, nv) {
            const f = (u, v, off) => { const ph = ph0 + u * (ph1 - ph0), th = th0 + v * (th1 - th0), r = r0 + (off || 0) + wave * Math.sin(ph * 7) * Math.cos(th * 6); return [c[0] + r * Math.sin(th) * Math.cos(ph), c[1] + r * Math.cos(th), c[2] + r * Math.sin(th) * Math.sin(ph)]; };
            const pos = [], idx = [];
            for (let j = 0; j <= nv; j++) for (let i = 0; i <= nu; i++) pos.push.apply(pos, f(i / nu, j / nv));
            for (let j = 0; j < nv; j++) for (let i = 0; i < nu; i++) { const a = j * (nu + 1) + i, b = a + 1, d = a + nu + 1; idx.push(a, d, b, b, d, d + 1); }
            const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx); geo.computeVertexNormals();
            return { geo: geo, at: f };
        }
        function buildRER(g, nuc, face) {
            item('rer', [nuc[0] + 23 * Math.cos(face), nuc[1], nuc[2] + 23 * Math.sin(face)], 15);
            const m = M(0xf06292, { side: THREE.DoubleSide, transparent: true, opacity: 0.8 }), rib = [];
            for (let k = 0; k < 4; k++) {
                const sh = sheet(nuc, 18.5 + k * 3.3, face - 1.05, face + 1.05, 0.75, 2.4, 0.9, 30, 20);
                add(g, new THREE.Mesh(sh.geo, m), 'rer', 'net');
                for (let n = 0; n < 150; n++) rib.push(sh.at(rng(), rng(), 0.55));
            }
            const im = new THREE.InstancedMesh(new THREE.SphereGeometry(0.5, 6, 5), M(0x37474f), rib.length);
            rib.forEach((p, i) => { dummy.rotation.set(0, 0, 0); dummy.position.fromArray(p); dummy.updateMatrix(); im.setMatrixAt(i, dummy.matrix); });
            add(g, im, 'rer', 'ribo');
        }
        function buildSER(g, c) {
            item('ser', c, 13);
            const m = M(0x26a69a, { transparent: true, opacity: 0.85 });
            for (let k = 0; k < 9; k++) { const p = []; for (let i = 0; i < 6; i++) p.push(new THREE.Vector3(c[0] + rr(-12, 12), c[1] + rr(-9, 9), c[2] + rr(-11, 11))); add(g, tube(p, 0.55, m, 50), 'ser', 'net'); }
        }
        function buildGolgi(g0, c) {
            item('golgi', c, 11);
            const g = new THREE.Group(); g.position.fromArray(c); g.rotation.set(rr(-0.4, 0.4), rr(0, 6), rr(-0.5, 0.5)); g0.add(g);
            const sm = M(0xffa726, { side: THREE.DoubleSide, transparent: true, opacity: 0.9 });
            for (let i = 0; i < 6; i++) { const s = new THREE.Mesh(new THREE.SphereGeometry(10.5, 30, 8, 0, Math.PI * 2, 0, 0.62), sm); s.position.y = i * 1.9 - 15; const k = 1 - i * 0.045; s.scale.set(k, 1, k); add(g, s, 'golgi', 'sacs'); }
            const vm = M(0xffe082);
            for (let i = 0; i < 16; i++) { const a = rr(0, 6.28), rad = rr(5.6, 8); const v = new THREE.Mesh(new THREE.SphereGeometry(rr(0.6, 1.05), 10, 8), vm); v.position.set(Math.cos(a) * rad, rr(-6.5, 3), Math.sin(a) * rad); add(g, v, 'golgi', 'vesicles'); }
            return vm;
        }
        function buildMito(g0, c) {
            item('mito', c, 7.5);
            const g = new THREE.Group(); g.position.fromArray(c); g.rotation.set(rr(0, 3), rr(0, 6), rr(0, 3)); g0.add(g);
            const o = new THREE.Mesh(new THREE.SphereGeometry(1, 30, 18, 0, 4.7), glass(0xff7043, 0.5)); o.scale.set(7.4, 3.6, 3.6); add(g, o, 'mito', 'outer', true);
            const inM = M(0xd84315, { side: THREE.DoubleSide, transparent: true, opacity: 0.55, depthWrite: false });
            const i2 = new THREE.Mesh(new THREE.SphereGeometry(1, 26, 16, 0, 4.7), inM); i2.scale.set(6.5, 2.85, 2.85); add(g, i2, 'mito', 'inner', true);
            const cm = M(0xbf360c);
            for (let z = -1; z <= 1; z++) { const p = []; for (let k = 0; k < 13; k++) { const x = -5.2 + k * 0.87; p.push(new THREE.Vector3(x, (k % 2 ? 1 : -1) * 1.7 * (1 - Math.abs(x) / 8), z * 0.9)); } add(g, tube(p, 0.34, cm, 60), 'mito', 'inner'); }
            const om = M(0xfff59d, { emissive: 0x554400 }); om.userData.base = 0x554400;
            const ring = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.15, 8, 16), om); ring.position.set(4.3, 0.2, 0.3); ring.rotation.set(1.1, 0.4, 0); add(g, ring, 'mito', 'own');
            for (let i = 0; i < 5; i++) { const d = new THREE.Mesh(new THREE.SphereGeometry(0.24, 6, 5), om); d.position.set(rr(3.0, 5.2), rr(-0.9, 0.9), rr(-0.9, 0.9)); add(g, d, 'mito', 'own'); }
        }
        function buildLyso(g0, c) {
            item('lyso', c, 2.8);
            const g = new THREE.Group(); g.position.fromArray(c); g0.add(g);
            add(g, new THREE.Mesh(new THREE.SphereGeometry(2.5, 18, 14), glass(0xaed581, 0.55)), 'lyso', 'vesicle', true);
            const em = M(0x33691e);
            for (let i = 0; i < 12; i++) { const d = new THREE.Mesh(new THREE.SphereGeometry(0.32, 6, 5), em); d.position.set(rr(-1.4, 1.4), rr(-1.4, 1.4), rr(-1.4, 1.4)); add(g, d, 'lyso', 'enzymes'); }
        }
        function buildDVac(g0, c) {
            item('dvacuole', c, 5.2);
            const g = new THREE.Group(); g.position.fromArray(c); g0.add(g);
            add(g, new THREE.Mesh(new THREE.SphereGeometry(5, 22, 16), glass(0x4fc3f7, 0.42)), 'dvacuole', 'memb', true);
            const f = new THREE.Mesh(new THREE.SphereGeometry(1.9, 14, 10), M(0xffe082)); f.position.set(0.6, 0.4, 0); add(g, f, 'dvacuole', null);
        }
        function buildVacuole(g0, c) {
            item('vacuole', c, 27);
            const g = new THREE.Group(); g.position.fromArray(c); g0.add(g);
            const s = new THREE.Mesh(new THREE.SphereGeometry(1, 36, 26), glass(0x80deea, 0.26)); s.scale.set(27, 24, 26); add(g, s, 'vacuole', 'memb', true);
            const cm = M(0xe0f7fa, { transparent: true, opacity: 0.9 });
            for (let i = 0; i < 26; i++) { const d = new THREE.Mesh(new THREE.OctahedronGeometry(rr(0.5, 1.0)), cm); d.position.set(rr(-15, 15), rr(-13, 13), rr(-14, 14)); d.rotation.set(rr(0, 3), rr(0, 3), 0); add(g, d, 'vacuole', 'content'); }
        }
        function buildChloro(g0, c) {
            item('chloro', c, 8.5);
            const g = new THREE.Group(); g.position.fromArray(c); g.rotation.set(rr(0, 3), rr(0, 6), rr(0, 3)); g0.add(g);
            const o = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 18, 0, 4.7), glass(0x43a047, 0.45)); o.scale.set(8.4, 4.3, 4.3); add(g, o, 'chloro', null, true);
            const dm = M(0x1b5e20);
            for (let s = 0; s < 6; s++) { const x = -5.4 + s * 1.75, z = rr(-1.3, 1.3), y = rr(-0.7, 0.7); for (let k = 0; k < 5; k++) { const d = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.15, 0.26, 12), dm); d.position.set(x, y + (k - 2) * 0.42, z); add(g, d, 'chloro', 'membranes'); } }
            const om = M(0xfff59d, { emissive: 0x554400 }); om.userData.base = 0x554400;
            const ring = new THREE.Mesh(new THREE.TorusGeometry(0.66, 0.16, 8, 16), om); ring.position.set(5.6, 0.3, 0.2); ring.rotation.set(1.0, 0.5, 0); add(g, ring, 'chloro', 'own');
            for (let i = 0; i < 5; i++) { const d = new THREE.Mesh(new THREE.SphereGeometry(0.26, 6, 5), om); d.position.set(rr(4.6, 6.4), rr(-1.1, 1.1), rr(-1.1, 1.1)); add(g, d, 'chloro', 'own'); }
        }
        function buildFreeRibosomes(g, L) {
            item('ribosome', null, 6);
            const pts = [];
            while (pts.length < 100) { const p = new THREE.Vector3(rr(-R[0], R[0]) * 0.9, rr(-R[1], R[1]) * 0.9, rr(-R[2], R[2]) * 0.9); if (inside(p, 0.78) && p.distanceTo(new THREE.Vector3().fromArray(L.nucleus)) > 16) pts.push(p); }
            const im = new THREE.InstancedMesh(new THREE.SphereGeometry(0.44, 12, 9), M(0x607d8b), pts.length);
            pts.forEach((p, i) => { dummy.rotation.set(0, 0, 0); dummy.position.copy(p); dummy.updateMatrix(); im.setMatrixAt(i, dummy.matrix); });
            add(g, im, 'ribosome', 'free');
            // a few "meeting points" for the list: the densest places near the start
            [[-22, 4, 22], [14, 18, 26], [-8, -16, 34]].forEach((c) => S.items.ribosome.centers.push(new THREE.Vector3().fromArray(c)));
            // the dots of the rough ER are ribosomes too: clicking them ticks this part
            S.items.ribosome.parts.onrer = { mats: S.items.rer.parts.ribo.mats };
        }
        function buildParticles(g) {
            const n = 650, pos = new Float32Array(n * 3);
            for (let i = 0; i < n; i++) { let p; do { p = new THREE.Vector3(rr(-R[0], R[0]), rr(-R[1], R[1]), rr(-R[2], R[2])); } while (!inside(p, 0.92)); pos.set([p.x, p.y, p.z], i * 3); }
            const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
            const dc = document.createElement('canvas'); dc.width = dc.height = 32; const dx = dc.getContext('2d'); const gr = dx.createRadialGradient(16, 16, 1, 16, 16, 15); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); dx.fillStyle = gr; dx.fillRect(0, 0, 32, 32);
            S.particles = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xbff3ff, size: 0.9, map: new THREE.CanvasTexture(dc), transparent: true, opacity: 0.55, depthWrite: false }));
            g.add(S.particles);
        }
        function buildVesicleTraffic(g, L, vm) {
            const a = S.items.rer.centers[0].clone(), b = new THREE.Vector3().fromArray(L.golgi);
            const p1 = new THREE.CatmullRomCurve3([a, a.clone().lerp(b, 0.5).add(new THREE.Vector3(0, 10, 5)), b.clone().add(new THREE.Vector3(-5, 3, 0))]);
            const out = b.clone().multiplyScalar(1.0).add(b.clone().normalize().multiplyScalar(16));
            const p2 = new THREE.CatmullRomCurve3([b.clone().add(new THREE.Vector3(5, 2, 0)), b.clone().lerp(out, 0.5).add(new THREE.Vector3(0, 6, 0)), out]);
            for (let i = 0; i < 4; i++) { const v = new THREE.Mesh(new THREE.SphereGeometry(0.95, 10, 8), vm); add(g, v, 'golgi', 'vesicles'); S.vesicles.push({ m: v, path: i % 2 ? p2 : p1, off: i / 4 }); }
        }
        function labelSprite(text) {
            const c = document.createElement('canvas'); c.width = 512; c.height = 96; const x = c.getContext('2d');
            let fs = 40; x.font = 'bold ' + fs + 'px Arial'; while (x.measureText(text).width > 450 && fs > 16) { fs -= 2; x.font = 'bold ' + fs + 'px Arial'; }
            x.textAlign = 'center'; x.textBaseline = 'middle'; const w = Math.min(500, x.measureText(text).width + 40);
            x.fillStyle = 'rgba(8,24,32,0.8)'; x.fillRect(256 - w / 2, 12, w, 72); x.strokeStyle = '#fbbf24'; x.lineWidth = 3; x.strokeRect(256 - w / 2, 12, w, 72); x.fillStyle = '#fef3c7'; x.fillText(text, 256, 49);
            const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthTest: false })); sp.scale.set(13, 2.44, 1); sp.renderOrder = 10; return sp;
        }

        function buildWorld() {
            if (world) { scene.remove(world); world.traverse((o) => { if (o.geometry) o.geometry.dispose(); }); }
            world = new THREE.Group(); scene.add(world);
            S.items = {}; S.labels = []; S.vesicles = []; S.pulse = null; S.hoverId = null; S.fly = null; S.turn = null;
            seed = S.type === 'animal' ? 20261117 : 20261118;
            const L = LAYOUT[S.type];
            buildMembrane(world);
            if (S.type === 'plant') buildWall(world);
            buildNucleus(world, L.nucleus, L.nucRot);
            buildRER(world, L.nucleus, L.rerFace);
            buildSER(world, L.ser);
            const vm = buildGolgi(world, L.golgi);
            L.mito.forEach((c) => buildMito(world, c));
            L.lyso.forEach((c) => buildLyso(world, c));
            if (S.type === 'animal') L.dvac.forEach((c) => buildDVac(world, c));
            else { buildVacuole(world, L.vacuole); L.chloro.forEach((c) => buildChloro(world, c)); }
            buildFreeRibosomes(world, L);
            item('cyto', [-18, 10, 22], 8);
            buildParticles(world); buildVesicleTraffic(world, L, vm);
            ORDER[S.type].forEach((id) => { if (P().found[id]) addLabel(id); });       // what was found before stays labelled
            S.pos.fromArray(START.pos); S.yaw = START.yaw; S.pitch = START.pitch; S.vel.set(0, 0, 0);
        }
        function addLabel(id) {
            const it = S.items[id]; if (!it || id === 'cyto' || id === 'ribosome' || !it.centers.length || S.labels.some((l) => l.userData.id === id)) return;
            it.centers.forEach((c, i) => { if (i > 0 && id !== 'mito' && id !== 'chloro') return; const sp = labelSprite((ORG[id].num ? ORG[id].num + '. ' : '') + ORG[id].name); const up = (id === 'membrane' || id === 'wall') ? 0 : it.radius + 2.6; sp.position.set(c.x, c.y + up, c.z); sp.userData.id = id; world.add(sp); S.labels.push(sp); });
        }

        /* ---------------------------------------------------------------- the one UI function */
        let toastT = 0;
        function toast(t) { const el = $('#cd-toast'); el.textContent = t; el.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('on'), 2800); }
        function ui() {
            const ids = ORDER[S.type], pr = P();
            const nf = ids.filter((i) => pr.found[i]).length;
            let pt = 0, ps = 0; ids.forEach((i) => { pt += ORG[i].parts.length; ps += ORG[i].parts.filter((p) => seenOf(i)[p[0]]).length; });
            $('#cd-prog').innerHTML = '🔎 Οργανίδια <b>' + nf + '/' + ids.length + '</b> · 🧩 Μέρη <b>' + ps + '/' + pt + '</b>';
            $('#cd-list').innerHTML = '<div class="cd-list-h">Τι υπάρχει εδώ μέσα;</div>' + ids.map((id) => {
                const o = ORG[id], f = pr.found[id], n = o.parts.length, k = o.parts.filter((p) => seenOf(id)[p[0]]).length;
                return '<button type="button" class="cd-li' + (f ? ' ok' : '') + (S.sel === id ? ' sel' : '') + '" data-id="' + id + '"><span class="dot" style="background:' + (f ? o.color : '#64748b') + '"></span><span class="nm">' + (f ? esc(o.name) : '; ; ;') + '</span>' + (f && n ? '<span class="ct">' + (k === n ? '★' : k + '/' + n) + '</span>' : '') + '</button>';
            }).join('') + '<div class="cd-list-n">Πάτησε ένα όνομα για να πας εκεί. Αν είναι ακόμα «; ; ;», θα στραφείς προς το μέρος του και θα αναβοσβήσει.</div>';
            const card = $('#cd-card'), id = S.sel;
            if (!id) { card.classList.remove('on'); card.innerHTML = ''; return; }
            const o = ORG[id], sn = seenOf(id);
            card.innerHTML = '<button type="button" class="cd-x" data-act="close" aria-label="Κλείσιμο">✕</button>' +
                '<h3><span class="dot" style="background:' + o.color + '"></span>' + (o.num ? o.num + '. ' : '') + esc(o.name) + (complete(id) && o.parts.length ? ' <span class="star" title="Βρήκες όλα τα μέρη του">★</span>' : '') + '</h3>' +
                (o.parts.length ? '<div class="sec">🧩 Από τι αποτελείται <small>(' + o.parts.filter((p) => sn[p[0]]).length + '/' + o.parts.length + ')</small></div>' +
                    '<p class="how">Βρες κάθε μέρος και <b>πάτησε πάνω του</b> μέσα στο κύτταρο. Αν δεν το βλέπεις, πάτησε το όνομά του εδώ και θα αναβοσβήσει.</p>' +
                    o.parts.map((p) => '<button type="button" class="cd-part' + (sn[p[0]] ? ' ok' : '') + '" data-part="' + p[0] + '"><span class="ck">' + (sn[p[0]] ? '✔' : '○') + '</span><span><b>' + esc(p[1]) + '</b>' + (sn[p[0]] ? '<br><small>' + esc(p[2]) + '</small>' : '') + '</span></button>').join('') : '') +
                '<div class="sec">📐 Δομή</div><p>' + esc(o.structure) + '</p>' +
                '<div class="sec">⚙️ Λειτουργία</div><p>' + esc(o.func) + '</p>' + (o.endo ? '<p class="endo">💡 ' + esc(o.endo) + '</p>' : '');
            card.classList.add('on');
        }

        /* ---------------------------------------------------------------- actions */
        function pulse(id, part) { const it = S.items[id]; if (!it) return; const p = part && it.parts[part]; const mats = p ? Array.from(p.mats) : []; if (!mats.length) it.meshes.forEach((m) => { if (mats.indexOf(m.material) < 0) mats.push(m.material); }); if (S.pulse) S.pulse.mats.forEach((m) => m.emissive.setHex(m.userData.base || 0)); S.pulse = { mats: mats, t: 0 }; }
        function select(id, part, opts) {
            const pr = P(), wasFound = pr.found[id], o = ORG[id];
            pr.found[id] = true; S.sel = id;
            let msg = wasFound ? '' : '✨ Ανακάλυψες: ' + o.name;
            if (part && o.parts.some((p) => p[0] === part) && !seenOf(id)[part]) {
                seenOf(id)[part] = true; const pl = o.parts.find((p) => p[0] === part)[1];
                msg = (wasFound ? '🧩 Βρήκες: ' : '✨ ' + o.name + ' · 🧩 ') + pl;
                if (complete(id)) msg += ' ★';
            }
            if (id === 'rer' && part === 'ribo' && pr.found.ribosome) seenOf('ribosome').onrer = true;       // the dots of the rough ER are ribosomes
            if (id === 'ribosome' && seenOf('rer').ribo) seenOf('ribosome').onrer = true;
            if (!wasFound) addLabel(id);
            pulse(id, part);
            if (msg) toast(msg);
            const all = ORDER[S.type].every((k) => complete(k));
            if (all && !pr.done) { pr.done = true; toast('🎉 Συγχαρητήρια! Γνώρισες όλα τα οργανίδια και όλα τα μέρη τους.'); }
            ui();
            if (!(opts && opts.stay)) approach(id, opts && opts.point, opts && opts.face);
        }
        function nearestCenter(id, from) { const it = S.items[id]; let best = it.centers[0], d = 1e9; it.centers.forEach((c) => { const k = c.distanceTo(from); if (k < d) { d = k; best = c; } }); return best; }
        const YAX = new THREE.Vector3(0, 1, 0);
        function clearance(p, except) { let m = 1e9; Object.keys(S.items).forEach((k) => { if (k === except || k === 'membrane' || k === 'wall' || k === 'cyto' || k === 'ribosome' || k === 'vacuole') return; const it = S.items[k]; it.centers.forEach((c) => { m = Math.min(m, p.distanceTo(c) - it.radius); }); }); return m; }
        /* come to a comfortable distance (only if we are far): never asked for, always the same behaviour */
        function approach(id, point, face) {
            if (id === 'cyto') return;
            const it = S.items[id]; if (!it) return;
            const target = ((id === 'ribosome' || id === 'membrane' || id === 'wall') && point) ? point.clone() : nearestCenter(id, point || S.pos).clone();
            const want = id === 'ribosome' ? 7 : (id === 'membrane' || id === 'wall') ? 13 : it.radius * 1.9 + 6;
            const dist = S.pos.distanceTo(target);
            if (id === 'vacuole' || dist <= want * 1.35) { if (face) S.turn = lookAngles(S.pos, target); return; }
            const base = S.pos.clone().sub(target).normalize(); let best = null, bs = -1e9;
            for (const a of [0, 0.7, -0.7, 1.4, -1.4, 2.2, -2.2, 3.14]) for (const ey of [0, 0.45, -0.45]) {
                const d = base.clone().applyAxisAngle(YAX, a); d.y += ey; d.normalize();
                const dest = target.clone().add(d.multiplyScalar(want)); if (!inside(dest, 0.8)) continue;
                const sc = clearance(dest, id) - Math.abs(a) * 1.5;
                if (a === 0 && ey === 0 && sc > 4) { best = dest; bs = 1e9; break; }
                if (sc > bs) { bs = sc; best = dest; }
            }
            if (!best) { best = target.clone().add(base.multiplyScalar(want)); let g = 0; while (!inside(best, 0.8) && g++ < 40) best.lerp(target, 0.1); }
            S.turn = null; S.fly = { from: S.pos.clone(), to: best, look: target, t: 0, dur: Math.max(1.2, Math.min(3, S.pos.distanceTo(best) / 30)) };
        }
        function lookAngles(from, to) { const d = to.clone().sub(from); return { yaw: Math.atan2(d.x, -d.z), pitch: Math.max(-1.3, Math.min(1.3, Math.atan2(d.y, Math.hypot(d.x, d.z)))) }; }
        const angDiff = (a, b) => { let d = b - a; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return d; };
        const cancelAuto = () => { S.fly = null; S.turn = null; };

        /* ---------------------------------------------------------------- picking: what you see is what you click */
        const ray = new THREE.Raycaster(), mouse = new THREE.Vector2();
        function pickAt(e) {
            const r = canvas.getBoundingClientRect(); mouse.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
            ray.setFromCamera(mouse, camera);
            const targets = []; Object.keys(S.items).forEach((k) => S.items[k].meshes.forEach((m) => targets.push(m)));
            const hits = ray.intersectObjects(targets, false); if (!hits.length) return null;
            const resolve = (i) => {
                const h = hits[i], u = h.object.userData;
                if (!u.shell) return h;
                // a see-through shell: if a solid part of the same organelle is right behind it, that is what was meant
                const lim = h.distance + S.items[u.id].radius * 2.4;
                for (let j = i + 1; j < hits.length && hits[j].distance < lim; j++) { const v = hits[j].object.userData; if (v.id === u.id && !v.shell && v.part) return hits[j]; }
                // the big vacuole is glass: another organelle seen through it can be clicked
                if (u.id === 'vacuole') for (let j = i + 1; j < hits.length; j++) { const v = hits[j].object.userData; if (v.id !== 'vacuole' && v.id !== 'membrane' && v.id !== 'wall') return resolve(j); }
                return h;
            };
            const h = resolve(0);
            // the far side of the cell, seen through the water: what you click there is the cytoplasm you are swimming in
            if (h.object.userData.boundary && h.distance > 34) return { id: 'cyto', part: null, point: h.point.clone() };
            // plant cell: the wall lies right behind the membrane. First the membrane is met, then (next click on the boundary) the wall
            if (S.type === 'plant' && h.object.userData.boundary) {
                const pr = P();
                if ((pr.found.membrane && !pr.found.wall && S.sel !== null) || S.sel === 'wall') return { id: 'wall', part: 'fibers', point: h.point.clone() };
            }
            return { id: h.object.userData.id, part: h.object.userData.part, point: h.point.clone() };
        }
        function partLabel(id, part) { const p = ORG[id].parts.find((x) => x[0] === part); return p ? p[1] : ''; }
        function setHover(hit, e) {
            const tip = $('#cd-hover'), id = hit && hit.id;
            if (S.hoverId && S.hoverId !== id && S.items[S.hoverId]) glow(S.hoverId, false);
            S.hoverId = id || null;
            if (!id) { tip.style.display = 'none'; canvas.style.cursor = 'grab'; return; }
            glow(id, true);
            const r = stage.getBoundingClientRect(); tip.style.display = 'block';
            tip.style.left = Math.min(r.width - 220, e.clientX - r.left + 14) + 'px'; tip.style.top = (e.clientY - r.top + 14) + 'px';
            const f = P().found[id], pl = hit.part ? partLabel(id, hit.part) : '';
            tip.innerHTML = f ? '<b>' + esc(ORG[id].name) + '</b>' + (pl ? (seenOf(id)[hit.part] ? '<br>' + esc(pl) : '<br><i>πάτησε: τι μέρος είναι αυτό;</i>') : '') : '<b>; ; ;</b><br><i>πάτησε για να το γνωρίσεις</i>';
            canvas.style.cursor = 'pointer';
        }
        function glow(id, on) { const it = S.items[id]; if (!it) return; const pm = S.pulse ? S.pulse.mats : []; it.meshes.forEach((m) => { const mt = m.material; if (pm.indexOf(mt) >= 0) return; mt.emissive.setHex(on ? 0x262626 : (mt.userData.base || 0)); }); }

        /* ---------------------------------------------------------------- input */
        let drag = null;
        canvas.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, y: e.clientY, t: performance.now(), moved: 0 }; try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ } });
        canvas.addEventListener('pointermove', (e) => {
            if (drag) {
                const dx = e.clientX - drag.x, dy = e.clientY - drag.y; drag.moved += Math.abs(dx) + Math.abs(dy); drag.x = e.clientX; drag.y = e.clientY;
                if (drag.moved > 6) { cancelAuto(); S.yaw += dx * 0.0045; S.pitch = Math.max(-1.35, Math.min(1.35, S.pitch - dy * 0.0045)); canvas.style.cursor = 'grabbing'; $('#cd-hover').style.display = 'none'; }
            } else if (e.pointerType === 'mouse') setHover(pickAt(e), e);
        });
        const endDrag = (e) => {
            if (drag && drag.moved <= 6 && performance.now() - drag.t < 600) { const hit = pickAt(e); if (hit) select(hit.id, hit.part, { point: hit.point }); else select('cyto'); }
            drag = null; canvas.style.cursor = 'grab';
        };
        canvas.addEventListener('pointerup', endDrag); canvas.addEventListener('pointercancel', () => { drag = null; });
        canvas.addEventListener('pointerleave', () => { if (!drag) setHover(null); });
        const fwdVec = () => new THREE.Vector3(Math.sin(S.yaw) * Math.cos(S.pitch), Math.sin(S.pitch), -Math.cos(S.yaw) * Math.cos(S.pitch));
        canvas.addEventListener('wheel', (e) => { e.preventDefault(); cancelAuto(); S.pos.addScaledVector(fwdVec(), -e.deltaY * 0.04); }, { passive: false });
        const KEYMAP = { KeyW: 'fwd', ArrowUp: 'fwd', KeyS: 'back', ArrowDown: 'back', KeyA: 'left', ArrowLeft: 'left', KeyD: 'right', ArrowRight: 'right', KeyQ: 'down', KeyE: 'up' };
        const visible = () => !!stage.offsetParent || document.fullscreenElement === stage;
        let active = false; const onDocDown = (e) => { active = stage.contains(e.target); if (!active) S.keys = {}; };
        document.addEventListener('pointerdown', onDocDown, true);
        const keyDown = (e) => { if (!visible() || !(active || document.fullscreenElement === stage)) return; const k = KEYMAP[e.code]; if (!k || e.ctrlKey || e.metaKey || e.altKey || /INPUT|SELECT|TEXTAREA/.test((e.target || {}).tagName || '')) return; S.keys[k] = true; cancelAuto(); e.preventDefault(); };
        const keyUp = (e) => { const k = KEYMAP[e.code]; if (k) S.keys[k] = false; };
        const allUp = () => { S.keys = {}; };
        window.addEventListener('keydown', keyDown); window.addEventListener('keyup', keyUp); window.addEventListener('blur', allUp);
        const pad = $('#cd-pad');
        pad.addEventListener('pointerdown', (e) => { const b = e.target.closest('button'); if (b) { S.keys[b.dataset.k] = true; cancelAuto(); e.preventDefault(); } });
        ['pointerup', 'pointercancel', 'pointerleave'].forEach((ev) => pad.addEventListener(ev, () => { pad.querySelectorAll('button').forEach((b) => { S.keys[b.dataset.k] = false; }); }));

        stage.addEventListener('click', (e) => {
            const b = e.target.closest('button'); if (!b || b.closest('#cd-pad')) return;
            if (b.dataset.type) { if (b.dataset.type === S.type) return; S.type = b.dataset.type; S.sel = null; stage.querySelectorAll('[data-type]').forEach((x) => x.classList.toggle('on', x === b)); buildWorld(); ui(); toast(S.type === 'plant' ? '🌿 Φυτικό κύτταρο: έχει και τοίχωμα, χλωροπλάστες και χυμοτόπιο' : '🐾 Ζωικό κύτταρο'); return; }
            const act = b.dataset.act;
            if (act === 'help') { showHelp(); return; }
            if (act === 'full') { if (document.fullscreenElement) document.exitFullscreen(); else if (stage.requestFullscreen) stage.requestFullscreen().catch(() => {}); return; }
            if (act === 'close') { S.sel = null; ui(); return; }
            if (act === 'helpclose') { const h = stage.querySelector('.cd-help'); if (h) h.remove(); return; }
            if (b.classList.contains('cd-li')) {
                const id = b.dataset.id;
                if (P().found[id]) { select(id, null, { face: true }); if (id === 'cyto') toast('Το κυτταρόπλασμα είναι παντού γύρω σου.'); }
                else if (id === 'cyto') toast('💡 Κοίτα τον «άδειο» χώρο ανάμεσα στα οργανίδια και πάτησε εκεί.');
                else { S.fly = null; S.turn = lookAngles(S.pos, nearestCenter(id, S.pos)); pulse(id, null); toast('🧭 Κοίτα μπροστά σου: αυτό που αναβοσβήνει. Κολύμπησε προς τα εκεί και πάτησε πάνω του.'); }
                return;
            }
            if (b.classList.contains('cd-part')) { const id = S.sel; if (!id) return; pulse(id, b.dataset.part); if (!seenOf(id)[b.dataset.part]) toast('👀 Αναβοσβήνει: βρες το και πάτησε πάνω του.'); return; }
        });
        function showHelp() {
            if (stage.querySelector('.cd-help')) return;
            const h = document.createElement('div'); h.className = 'cd-help';
            h.innerHTML = '<div class="box"><button type="button" class="cd-x" data-act="helpclose" aria-label="Κλείσιμο">✕</button><h3>🤿 Πώς εξερευνάς το κύτταρο</h3><ol>' +
                '<li><b>Κοίτα γύρω σου:</b> σύρε με το ποντίκι (ή με το δάχτυλο).</li>' +
                '<li><b>Κολύμπησε:</b> πλήκτρα <b>W A S D</b> ή βέλη, <b>Q / E</b> για κάτω–πάνω, ροδάκι για μπρος–πίσω. Σε οθόνη αφής υπάρχουν κουμπιά κάτω δεξιά.</li>' +
                '<li><b>Γνώρισε ένα οργανίδιο:</b> πάτησε πάνω του. Ανοίγει η καρτέλα του με τη δομή και τη λειτουργία του.</li>' +
                '<li><b>Ψάξε τα μέρη του:</b> η καρτέλα γράφει από τι αποτελείται. Βρες κάθε μέρος μέσα στο κύτταρο και πάτησε πάνω του για να σημειωθεί με ✔. Μπορείς να κοιτάξεις και <b>μέσα</b> από τα διαφανή περιβλήματα.</li>' +
                '<li><b>Αν κολλήσεις:</b> πάτησε το όνομα ενός μέρους στην καρτέλα και θα αναβοσβήσει. Στη λίστα αριστερά, πάτησε ένα όνομα για να πας εκεί (ή για να στραφείς προς ένα «; ; ;»).</li></ol>' +
                '<p class="s">Τα σχήματα είναι σχηματικά (όχι σε κλίμακα). Τα κείμενα είναι από το σχολικό υλικό (Γ3.1 – Γ3.4).</p><div style="text-align:center"><button type="button" class="cd-btn on" data-act="helpclose">Βουτιά! 🤿</button></div></div>';
            h.addEventListener('pointerdown', (e) => { if (e.target === h) h.remove(); });
            stage.appendChild(h);
        }

        /* ---------------------------------------------------------------- loop */
        function resize() { const w = stage.clientWidth, h = stage.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
        new ResizeObserver(resize).observe(stage); resize();
        const clock = new THREE.Clock(); let t = 0;
        function frame() {
            if (!document.body.contains(stage)) { window.removeEventListener('keydown', keyDown); window.removeEventListener('keyup', keyUp); window.removeEventListener('blur', allUp); document.removeEventListener('pointerdown', onDocDown, true); renderer.dispose(); return; }
            requestAnimationFrame(frame);
            if (!visible()) { clock.getDelta(); return; }
            const dt = Math.min(0.05, clock.getDelta()); t += dt;
            if (S.fly) {
                const F = S.fly; F.t += dt / F.dur; const k = Math.min(1, F.t), e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
                S.pos.lerpVectors(F.from, F.to, e); const w = lookAngles(S.pos, F.look);
                S.yaw += angDiff(S.yaw, w.yaw) * Math.min(1, dt * 4.5); S.pitch += (w.pitch - S.pitch) * Math.min(1, dt * 4.5); S.vel.set(0, 0, 0);
                if (k >= 1) S.fly = null;
            } else {
                if (S.turn) { const dy = angDiff(S.yaw, S.turn.yaw), dp = S.turn.pitch - S.pitch; S.yaw += dy * Math.min(1, dt * 4); S.pitch += dp * Math.min(1, dt * 4); if (Math.abs(dy) + Math.abs(dp) < 0.01) S.turn = null; }
                const acc = new THREE.Vector3(), f = fwdVec(), r = new THREE.Vector3(Math.cos(S.yaw), 0, Math.sin(S.yaw));
                if (S.keys.fwd) acc.add(f); if (S.keys.back) acc.sub(f); if (S.keys.right) acc.add(r); if (S.keys.left) acc.sub(r); if (S.keys.up) acc.y += 1; if (S.keys.down) acc.y -= 1;
                if (acc.lengthSq() > 0) acc.normalize();
                S.vel.lerp(acc.multiplyScalar(24), Math.min(1, dt * 5)); S.pos.addScaledVector(S.vel, dt);
            }
            const q = (S.pos.x / R[0]) ** 2 + (S.pos.y / R[1]) ** 2 + (S.pos.z / R[2]) ** 2; if (q > 0.9) S.pos.multiplyScalar(Math.sqrt(0.9 / q));
            camera.position.copy(S.pos); camera.rotation.set(S.pitch, -S.yaw, 0);
            if (S.pulse) { const p = S.pulse; p.t += dt; const k = (Math.sin(p.t * 9) + 1) / 2; p.mats.forEach((m) => m.emissive.setRGB(0.85 * k, 0.7 * k, 0.15 * k)); if (p.t > 2.6) { p.mats.forEach((m) => m.emissive.setHex(m.userData.base || 0)); S.pulse = null; } }
            if (S.particles) { const a = S.particles.geometry.attributes.position.array; for (let i = 0; i < a.length; i += 3) { a[i + 1] += Math.sin(t * 0.7 + i) * 0.006; a[i] += Math.cos(t * 0.5 + i * 0.3) * 0.006; } S.particles.geometry.attributes.position.needsUpdate = true; }
            S.vesicles.forEach((v) => v.m.position.copy(v.path.getPoint((t * 0.06 + v.off) % 1)));
            S.labels.forEach((l) => { const d = l.position.distanceTo(S.pos), it = S.items[l.userData.id]; l.visible = d > (it ? it.radius * 2.6 + 8 : 12) && d < 95; });
            renderer.render(scene, camera);
        }

        buildWorld(); ui(); $('#cd-load').style.display = 'none'; frame();
        let seen = false; try { seen = localStorage.getItem('celldive_help') === '1'; localStorage.setItem('celldive_help', '1'); } catch (e) { /* ignore */ }
        if (!seen) showHelp();
        window.__celldive = { S: S, select: select, pickAt: pickAt, camera: camera, P: P };            // for testing
    }
    return { render: render };
})();
