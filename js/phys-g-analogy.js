/* ==========================================================================
   Physics Γ: the gravitational analogy of a simple circuit with two resistors in series
   (a conveyor "escalator" = the source, a slide with two rough parts = the resistors).
   Content after the study notes "Ανάλυση και ερμηνεία του διαγράμματος του δυναμικού ... συνδεσμολογίας σειράς δύο αντιστατών"
   (page 7 and the pages around it). window.PhysGAnalogy.render(mountElement)
   ========================================================================== */
(function () {
    'use strict';

    /* fixed scale for every scenario: 1 V is always the same height (12 V = 320 px, the maximum), so hills of different scenarios can be compared */
    const GROUND = 440, PX_PER_V = 320 / 12;
    const yOf = (v) => GROUND - v * PX_PER_V;
    const SCEN = [
        { V: 12, R1: 2, R2: 4 },
        { V: 12, R1: 4, R2: 2 },
        { V: 12, R1: 3, R2: 3 },
        { V: 6, R1: 1, R2: 2 }
    ];
    const ESC_N = 9;
    const fv = (x) => (Math.round(x * 10) / 10).toString().replace('.', ',');
    const SPEED = [1, 1, 1, 1, 1, 2.6];                 // relative speed on every part (the flat ground is crossed faster)
    const ROUGH = [false, false, true, false, true, false];

    function geom(sc) {
        const I = sc.V / (sc.R1 + sc.R2);
        const d1 = I * sc.R1, d2 = I * sc.R2;
        const yV = yOf(sc.V), y1 = yOf(sc.V - d1);
        const PTS = [[60, GROUND], [200, yV], [330, yV], [520, y1], [640, y1], [880, GROUND], [60, GROUND]];
        const SEGLEN = PTS.slice(1).map((p, i) => Math.hypot(p[0] - PTS[i][0], p[1] - PTS[i][1]));
        const escLen = Math.hypot(140, GROUND - yV);
        return { sc, I, d1, d2, V1: sc.V - d1, yV, y1, PTS, SEGLEN, TOTAL: SEGLEN.reduce((a, b) => a + b, 0),
            escLen, ux: 140 / escLen, uy: -(GROUND - yV) / escLen, escStep: escLen / ESC_N, Rtot: sc.R1 + sc.R2 };
    }

    /* moving escalator: the staircase slides up the slope at the same speed as the charges that ride on it */
    function steps(g) {
        const a = 140 / ESC_N, b = (GROUND - g.yV) / ESC_N;
        let s = '<clipPath id="ga-esc-clip"><rect x="60" y="' + g.yV.toFixed(1) + '" width="140" height="' + (GROUND - g.yV).toFixed(1) + '"/></clipPath><g clip-path="url(#ga-esc-clip)"><g id="ga-esc">';
        for (let i = -1; i <= ESC_N + 1; i++) {
            const cx = 60 + a * i, cy = GROUND - b * i;           // corner on the slope line
            s += '<rect x="' + (cx - a).toFixed(1) + '" y="' + cy.toFixed(1) + '" width="' + a.toFixed(1) + '" height="' + (GROUND + 20 - cy + b).toFixed(1) + '" class="ga-step"/>';
        }
        return s + '</g></g>';
    }
    function rough(x1, y1, x2, y2) {
        // little teeth along a slope: "rough" surface
        let s = '';
        const n = 14;
        const dx = (x2 - x1) / n, dy = (y2 - y1) / n;
        const len = Math.hypot(dx, dy);
        const nx = -dy / len, ny = dx / len;
        for (let i = 0; i < n; i++) {
            const bx = x1 + dx * i, by = y1 + dy * i;
            s += '<path d="M' + bx.toFixed(1) + ',' + by.toFixed(1) + ' l' + (dx * 0.5 + nx * 7).toFixed(1) + ',' + (dy * 0.5 + ny * 7).toFixed(1) + ' l' + (dx * 0.5 - nx * 7).toFixed(1) + ',' + (dy * 0.5 - ny * 7).toFixed(1) + '" class="ga-tooth"/>';
        }
        return s;
    }
    function arrowV(x, ya, yb, label, cls) {
        const mid = (ya + yb) / 2;
        return '<line x1="' + x + '" y1="' + ya + '" x2="' + x + '" y2="' + yb + '" class="ga-dim"/>' +
            '<path d="M' + (x - 6) + ',' + (ya + 11) + ' L' + x + ',' + ya + ' L' + (x + 6) + ',' + (ya + 11) + ' M' + (x - 6) + ',' + (yb - 11) + ' L' + x + ',' + yb + ' L' + (x + 6) + ',' + (yb - 11) + '" class="ga-dim"/>' +
            (label ? '<text x="' + (x + 10) + '" y="' + (mid + 5) + '" class="ga-dimt ' + (cls || '') + '">' + label + '</text>' : '');
    }
    function marker(n, x, y) {
        return '<g class="ga-mk" transform="translate(' + x.toFixed(1) + ',' + y.toFixed(1) + ')"><circle r="15"/><text y="6" text-anchor="middle">' + n + '</text></g>';
    }
    function pill(x, y, txt) {
        const w = 14 + txt.length * 10.5;
        return '<g class="ga-pill" transform="translate(' + x.toFixed(1) + ',' + y.toFixed(1) + ')"><rect x="' + (-w / 2) + '" y="-15" width="' + w + '" height="30" rx="15"/><text y="6" text-anchor="middle">' + txt + '</text></g>';
    }

    function figure(g) {
        const { sc, yV, y1 } = g;
        const gl = (v, yy) => '<line x1="30" y1="' + yy.toFixed(1) + '" x2="1060" y2="' + yy.toFixed(1) + '" class="ga-guide"/><text x="-44" y="' + (yy - 8).toFixed(1) + '" class="ga-lv">' + fv(v) + ' V</text>';
        // midpoints of the two slopes (for the resistor badges) and the outward normal of the second one (for marker 1)
        const m1 = [425, (yV + y1) / 2], m2 = [760, (y1 + GROUND) / 2];
        const l2 = Math.hypot(240, GROUND - y1), n2 = [(GROUND - y1) / l2, -240 / l2];
        return '<svg viewBox="-50 70 1150 460" class="ga-svg" role="img" aria-label="Κυλιόμενη σκάλα (πηγή) και τσουλήθρα με δύο τραχιά τμήματα (αντιστάτες)">' +
            gl(sc.V, yV) + gl(g.V1, y1) + '<text x="-44" y="' + (GROUND - 8) + '" class="ga-lv">0 V</text>' +
            '<polygon points="200,' + yV.toFixed(1) + ' 330,' + yV.toFixed(1) + ' 520,' + y1.toFixed(1) + ' 640,' + y1.toFixed(1) + ' 880,' + GROUND + ' 200,' + GROUND + '" class="ga-hill"/>' +
            '<rect x="-50" y="' + GROUND + '" width="1150" height="90" class="ga-ground"/>' +
            steps(g) +
            '<path d="M60,' + GROUND + ' L200,' + yV.toFixed(1) + '" class="ga-belt"/>' +
            '<path d="M200,' + yV.toFixed(1) + ' L330,' + yV.toFixed(1) + ' L520,' + y1.toFixed(1) + ' L640,' + y1.toFixed(1) + ' L880,' + GROUND + '" class="ga-track"/>' +
            rough(330, yV, 520, y1) + rough(640, y1, 880, GROUND) +
            '<line x1="880" y1="' + (GROUND + 6) + '" x2="60" y2="' + (GROUND + 6) + '" class="ga-return"/>' +
            arrowV(30, GROUND, yV, '', 'ga-t-src') + '<text transform="translate(8,' + ((GROUND + yV) / 2).toFixed(0) + ') rotate(-90)" text-anchor="middle" class="ga-dimt ga-t-src">ΔV πηγής = ' + fv(sc.V) + ' V</text>' +
            arrowV(548, yV, y1, 'I·R₁ = ' + fv(g.d1) + ' V', 'ga-t-r') +
            arrowV(912, y1, GROUND, 'I·R₂ = ' + fv(g.d2) + ' V', 'ga-t-r') +
            pill(m1[0], m1[1], 'R₁ = ' + sc.R1 + ' Ω') + pill(m2[0], m2[1], 'R₂ = ' + sc.R2 + ' Ω') +
            '<text x="98" y="470" class="ga-cap" text-anchor="start">κυλιόμενη σκάλα = πηγή</text>' +
            '<text x="265" y="' + (yV - 14).toFixed(1) + '" class="ga-cap" text-anchor="middle">καλώδιο</text>' +
            '<text x="580" y="' + (y1 + 28).toFixed(1) + '" class="ga-cap" text-anchor="middle">καλώδιο</text>' +
            '<text x="560" y="508" class="ga-cap" text-anchor="middle">καλώδιο: λείο έδαφος, 0 V (επιστροφή στη βάση της σκάλας)</text>' +
            marker(1, m2[0] + n2[0] * 38, m2[1] + n2[1] * 38) + marker(2, 330, yV - 20) + marker(3, 72, 467) + marker(4, 270, 504) +
            '<g id="ga-charges"></g></svg>';
    }

    const CARDS = [
        [1, 'Η τσουλήθρα', 'Τα φορτία κινούνται αυθόρμητα διαμέσου του εξωτερικού καλωδίου. Φανταστείτε μια τσουλήθρα: «κατηφορίζουν» από τον θετικό πόλο (υψηλότερο υψόμετρο) στον αρνητικό πόλο (χαμηλότερο υψόμετρο), αναπτύσσοντας ταχύτητα και μετατρέποντας τη δυναμική τους ενέργεια σε κινητική και θερμική στα τραχιά σημεία της τσουλήθρας.'],
        [2, 'Τα επίπεδα σημεία', 'Στα επίπεδα σημεία, και του ενεργειακού λόφου και του οριζόντιου επιπέδου, δεν δαπανάται καθόλου ενέργεια.'],
        [3, 'Η πηγή = κυλιόμενη σκάλα', 'Η ηλεκτρική πηγή επιτελεί τη λειτουργία μιας κυλιόμενης σκάλας, η οποία μεταφέρει τα (θετικά) φορτία (δαπανώντας τη δική της ενέργεια) «ανυψώνοντάς» τα από τον αρνητικό πόλο (χαμηλότερο υψόμετρο) στον θετικό πόλο (υψηλότερο υψόμετρο), προσφέροντάς τους την αντίστοιχη δυναμική ενέργεια. Η κυλιόμενη σκάλα λειτουργεί αποκλειστικά και μόνο σε αυτή την κατεύθυνση. Κίνηση στην αντίθετη κατεύθυνση, δηλαδή η αυθόρμητη κατάβαση διαμέσου της ίδιας της πηγής, απαγορεύεται: η λογική του μηχανισμού λειτουργίας της σκάλας προφανώς δεν το επιτρέπει.'],
        [4, 'Από την αρχή', 'Μετά την τσουλήθρα τα φορτία πηγαίνουν στην είσοδο της κυλιόμενης σκάλας και η διαδικασία επαναλαμβάνεται διαρκώς, για όσο διάστημα η σκάλα μπορεί να λειτουργεί.']
    ];

    function tableRows(g) {
        const sc = g.sc;
        const cmp = sc.R1 === sc.R2 ? 'R₁ = R₂, άρα οι δύο κατηφόρες έχουν το ίδιο ύψος' : (sc.R2 > sc.R1 ? 'η μεγαλύτερη αντίσταση (R₂) δίνει ψηλότερη κατηφόρα' : 'η μεγαλύτερη αντίσταση (R₁) δίνει ψηλότερη κατηφόρα');
        return [
            ['Πηγή τάσης ' + fv(sc.V) + ' V', 'Κυλιόμενη σκάλα που ανεβάζει τα φορτία κατά ' + fv(sc.V) + ' V, δαπανώντας δική της ενέργεια'],
            ['Θετικός πόλος', 'Κορυφή: υψηλό υψόμετρο, δυναμικό ' + fv(sc.V) + ' V'],
            ['Αρνητικός πόλος', 'Έδαφος: υψόμετρο 0, δυναμικό 0 V (εμείς επιλέγουμε το έδαφος ως επίπεδο μηδέν)'],
            ['Ιδανικό καλώδιο', 'Λείο οριζόντιο οροπέδιο: ούτε τριβές ούτε αλλαγή ύψους, άρα καμία πτώση τάσης'],
            ['Αντιστάτης', 'Τραχιά κατηφόρα: τα φορτία χάνουν δυναμικό (υψόμετρο) και η δυναμική τους ενέργεια γίνεται κινητική και θερμική'],
            ['Πτώση τάσης I·R', 'Το ύψος της κατηφόρας: ' + cmp],
            ['Ρεύμα I', 'Η ροή των φορτίων, ίδια παντού στη σειρά (το ίδιο «κυκλοφοριακό φορτίο» στο καλώδιο και στις δύο κατηφόρες)'],
            ['Ανοιχτός διακόπτης', 'Κομμένος δρόμος (π.χ. γκρεμισμένη γέφυρα): δεν υπάρχει κίνηση φορτίων, άρα ούτε ρεύμα ούτε μεταφορά ενέργειας']
        ];
    }
    function stepsList(g) {
        const sc = g.sc, d1 = fv(g.d1), d2 = fv(g.d2), V = fv(sc.V), V1 = fv(g.V1), I = fv(g.I);
        const second = sc.R2 > sc.R1 ? ', ψηλότερη από την πρώτη' : (sc.R2 < sc.R1 ? ', χαμηλότερη από την πρώτη' : ', ίδια με την πρώτη');
        return '<li><strong>Πηγή (σκάλα):</strong> το δυναμικό ανεβαίνει από 0 V σε <strong>' + V + ' V</strong>.</li>' +
            '<li><strong>Ιδανικό καλώδιο (οροπέδιο):</strong> παραμένει <strong>' + V + ' V</strong>· καμία πτώση τάσης.</li>' +
            '<li><strong>Αντιστάτης R₁ (πρώτη κατηφόρα):</strong> ΔV = I·R₁ = ' + I + ' A · ' + sc.R1 + ' Ω = <strong>' + d1 + ' V</strong>, άρα ' + V + ' V → <strong>' + V1 + ' V</strong>.</li>' +
            '<li><strong>Καλώδιο ανάμεσα στους αντιστάτες (δεύτερο οροπέδιο, χαμηλότερα):</strong> παραμένει <strong>' + V1 + ' V</strong>.</li>' +
            '<li><strong>Αντιστάτης R₂ (δεύτερη κατηφόρα' + second + '):</strong> ΔV = I·R₂ = ' + I + ' A · ' + sc.R2 + ' Ω = <strong>' + d2 + ' V</strong>, άρα ' + V1 + ' V → <strong>0 V</strong>.</li>' +
            '<li><strong>Καλώδιο μέχρι τον αρνητικό πόλο (έδαφος):</strong> παραμένει <strong>0 V</strong>· τα φορτία φτάνουν στη βάση της σκάλας και όλα ξεκινούν από την αρχή.</li>';
    }

    function render(mount) {
        mount.innerHTML = '';
        const root = document.createElement('div');
        root.className = 'ga-wrap';
        root.innerHTML =
            '<div class="ga-head"><h2>🎢 Βαρυτικό ανάλογο: κύκλωμα με δύο αντιστάτες σε σειρά</h2>' +
            '<p>Η πηγή δουλεύει σαν κυλιόμενη σκάλα που ανεβάζει τα θετικά φορτία και οι δύο αντιστάτες σαν τραχιές κατηφόρες μιας τσουλήθρας. Διάλεξε τιμές και δες πώς αλλάζουν το ύψος του λόφου και οι πτώσεις τάσης.</p></div>' +
            '<div class="ga-pick"><span class="ga-pick-t">Τιμές κυκλώματος:</span><span id="ga-presets" class="ga-presets"></span></div>' +
            '<div class="ga-calc" id="ga-calc"></div>' +
            '<div class="ga-fig"><div class="ga-bar"><button type="button" class="ga-btn" data-act="pause">⏸ Παύση</button><span class="ga-bar-note">Τα κίτρινα «+» ακολουθούν τη διαδρομή του θετικού φορτίου (οι τραχιές κατηφόρες τα «θερμαίνουν»). Η κλίμακα ύψους είναι πάντα η ίδια: 1 V = ίδιο ύψος σε κάθε επιλογή.</span></div><div id="ga-fig-host"></div></div>' +
            '<div class="ga-cards">' + CARDS.map(c => '<div class="ga-card"><div class="ga-card-h"><span class="ga-num">' + c[0] + '</span>' + c[1] + '</div><p>' + c[2] + '</p></div>').join('') + '</div>' +
            '<h3 class="ga-h3">Αντιστοίχιση κυκλώματος και ανάλογου</h3>' +
            '<div class="ga-tw"><table class="ga-table"><thead><tr><th>Στο κύκλωμα</th><th>Στο βαρυτικό ανάλογο</th></tr></thead><tbody id="ga-tbody"></tbody></table></div>' +
            '<h3 class="ga-h3">Ο ενεργειακός «δρόμος» του φορτίου, βήμα βήμα</h3>' +
            '<ol class="ga-steps" id="ga-steps"></ol>' +
            '<div class="ga-note"><strong>Συμπέρασμα:</strong> η διαφορά δυναμικού της πηγής «χάνεται» μέσα από δύο διαδοχικές πτώσεις τάσης: το άθροισμά τους ισούται με την τάση της πηγής. Το κύκλωμα λειτουργεί σαν μια επαναλαμβανόμενη μεταφορά ενέργειας από την πηγή προς τους δύο αντιστάτες.</div>' +
            '<div class="ga-note ga-warn"><strong>Προσοχή:</strong> το βαρυτικό ανάλογο είναι μια ποιοτική προσπάθεια περιγραφής του χαρακτήρα των μεγεθών και των διαδικασιών και όχι κυριολεκτική αποτύπωση των λεπτομερειών του κυκλώματος. Δύο διαφορετικά φυσικά φαινόμενα δεν ταυτίζονται απόλυτα.</div>';
        mount.appendChild(root);

        /* animation state: everything that depends on the chosen scenario lives in G and is rebuilt by apply() */
        let G = null, svg = null, esc = null, pathEl = null, charges = [], escPhase = 0, paused = false;
        const host = root.querySelector('#ga-fig-host');
        const segAt = (s) => {
            let t = s;
            for (let i = 0; i < G.SEGLEN.length; i++) { if (t <= G.SEGLEN[i]) return i; t -= G.SEGLEN[i]; }
            return G.SEGLEN.length - 1;
        };
        function apply(k) {
            G = geom(SCEN[k]);
            host.innerHTML = figure(G);
            svg = host.querySelector('.ga-svg');
            esc = host.querySelector('#ga-esc');
            pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            pathEl.setAttribute('d', G.PTS.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' '));
            pathEl.setAttribute('style', 'visibility:hidden;fill:none');
            svg.appendChild(pathEl);
            const gq = host.querySelector('#ga-charges');
            charges = [];
            const N = 7;
            for (let i = 0; i < N; i++) {
                const c = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                c.setAttribute('class', 'ga-q');
                c.innerHTML = '<circle r="10"/><text y="5" text-anchor="middle">+</text>';
                gq.appendChild(c);
                charges.push({ el: c, s: (i * G.TOTAL) / N });
            }
            escPhase = 0;
            root.querySelector('#ga-tbody').innerHTML = tableRows(G).map(r => '<tr><th scope="row">' + r[0] + '</th><td>' + r[1] + '</td></tr>').join('');
            root.querySelector('#ga-steps').innerHTML = stepsList(G);
            const sc = G.sc;
            root.querySelector('#ga-calc').innerHTML =
                '<span>R<sub>ολ</sub> = R₁ + R₂ = ' + sc.R1 + ' + ' + sc.R2 + ' = <b>' + G.Rtot + ' Ω</b></span>' +
                '<span>I = V / R<sub>ολ</sub> = ' + fv(sc.V) + ' / ' + G.Rtot + ' = <b>' + fv(G.I) + ' A</b></span>' +
                '<span>V₁ = I·R₁ = <b>' + fv(G.d1) + ' V</b></span><span>V₂ = I·R₂ = <b>' + fv(G.d2) + ' V</b></span>' +
                '<span>V₁ + V₂ = ' + fv(G.d1 + G.d2) + ' V = V<sub>πηγής</sub></span>';
            root.querySelectorAll('.ga-preset').forEach((b, i) => b.classList.toggle('on', i === k));
        }
        const presets = root.querySelector('#ga-presets');
        SCEN.forEach((sc, i) => {
            const b = document.createElement('button');
            b.type = 'button'; b.className = 'ga-preset';
            b.innerHTML = '<b>' + sc.V + ' V</b> · R₁ = ' + sc.R1 + ' Ω · R₂ = ' + sc.R2 + ' Ω';
            b.addEventListener('click', () => apply(i));
            presets.appendChild(b);
        });
        apply(0);

        let last = performance.now();
        root.querySelector('[data-act="pause"]').addEventListener('click', (e) => {
            paused = !paused;
            e.currentTarget.textContent = paused ? '▶ Συνέχεια' : '⏸ Παύση';
        });
        function frame(now) {
            if (!root.isConnected) return;
            requestAnimationFrame(frame);
            const dt = Math.min(0.05, (now - last) / 1000);
            last = now;
            if (!svg || !svg.clientWidth) return;                       // tab hidden
            if (!paused) escPhase = (escPhase + 120 * SPEED[0] * dt) % G.escStep;
            if (esc) esc.setAttribute('transform', 'translate(' + (G.ux * escPhase).toFixed(2) + ',' + (G.uy * escPhase).toFixed(2) + ')');
            charges.forEach((c) => {
                const si = segAt(c.s);
                if (!paused) c.s = (c.s + 120 * SPEED[si] * dt) % G.TOTAL;
                const seg = segAt(c.s);
                const p = pathEl.getPointAtLength(c.s);
                c.el.setAttribute('transform', 'translate(' + p.x.toFixed(1) + ',' + (p.y - 12).toFixed(1) + ')');
                c.el.classList.toggle('ga-q-hot', ROUGH[seg]);
            });
        }
        requestAnimationFrame(frame);
    }

    window.PhysGAnalogy = { render };
})();
