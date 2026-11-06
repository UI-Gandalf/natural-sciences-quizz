/* ==========================================================================
   Physics Γ: the gravitational analogy of a simple circuit with two resistors in series
   (a conveyor "escalator" = the source, a slide with two rough parts = the resistors).
   Content after the study notes "Ανάλυση και ερμηνεία του διαγράμματος του δυναμικού ... συνδεσμολογίας σειράς δύο αντιστατών"
   (page 7 and the pages around it). window.PhysGAnalogy.render(mountElement)
   ========================================================================== */
(function () {
    'use strict';

    /* the track the positive charge follows; y = height ~ potential (ground 440 = 0 V, 120 = 12 V) */
    const PTS = [[60, 440], [200, 120], [330, 120], [520, 227], [640, 227], [880, 440], [60, 440]];
    const NAMES = ['σκάλα', 'καλώδιο', 'R1', 'καλώδιο', 'R2', 'έδαφος'];
    const SEGLEN = PTS.slice(1).map((p, i) => Math.hypot(p[0] - PTS[i][0], p[1] - PTS[i][1]));
    const TOTAL = SEGLEN.reduce((a, b) => a + b, 0);
    const SPEED = [1, 1, 1, 1, 1, 2.6];                 // relative speed on every part (the flat ground is crossed faster)
    const ROUGH = [false, false, true, false, true, false];

    const ground = 440, y12 = 120, y8 = 227;

    function steps() {
        // stairs of the escalator between (60,440) and (200,120)
        let s = '';
        const n = 9;
        for (let i = 0; i < n; i++) {
            const x0 = 60 + (140 / n) * i, x1 = 60 + (140 / n) * (i + 1);
            const yTop = 440 - (320 / n) * (i + 1);
            s += '<rect x="' + x0.toFixed(1) + '" y="' + yTop.toFixed(1) + '" width="' + (x1 - x0 + 0.5).toFixed(1) + '" height="' + (440 - yTop).toFixed(1) + '" class="ga-step"/>';
        }
        return s;
    }
    function rough(x1, y1, x2, y2) {
        // little teeth along a slope: "rough" surface
        let s = '';
        const n = 14;
        const dx = (x2 - x1) / n, dy = (y2 - y1) / n;
        const len = Math.hypot(dx, dy);
        const nx = -dy / len, ny = dx / len;          // normal (pointing up-right for a descending slope)
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
            '<text x="' + (x + 10) + '" y="' + (mid + 5) + '" class="ga-dimt ' + (cls || '') + '">' + label + '</text>';
    }
    function marker(n, x, y) {
        return '<g class="ga-mk" transform="translate(' + x + ',' + y + ')"><circle r="15"/><text y="6" text-anchor="middle">' + n + '</text></g>';
    }

    function figure() {
        const track = PTS.map((p, i) => (i ? 'L' : 'M') + p[0] + ',' + p[1]).join(' ');
        return '<svg viewBox="-50 70 1150 460" class="ga-svg" role="img" aria-label="Κυλιόμενη σκάλα (πηγή) και τσουλήθρα με δύο τραχιά τμήματα (αντιστάτες)">' +
            // guide levels
            '<line x1="30" y1="' + y12 + '" x2="1060" y2="' + y12 + '" class="ga-guide"/><line x1="30" y1="' + y8 + '" x2="1060" y2="' + y8 + '" class="ga-guide"/>' +
            '<text x="-44" y="' + (y12 - 8) + '" class="ga-lv">12 V</text><text x="-44" y="' + (y8 - 8) + '" class="ga-lv">8 V</text><text x="-44" y="' + (ground - 8) + '" class="ga-lv">0 V</text>' +
            // hill under the slide and the ground
            '<polygon points="200,120 330,120 520,227 640,227 880,440 200,440" class="ga-hill"/>' +
            '<rect x="-50" y="' + ground + '" width="1150" height="90" class="ga-ground"/>' +
            steps() +
            '<path d="M60,440 L200,120" class="ga-belt"/>' +
            // the track itself (thick) and the rough parts
            '<path d="M200,120 L330,120 L520,227 L640,227 L880,440" class="ga-track"/>' +
            rough(330, 120, 520, 227) + rough(640, 227, 880, 440) +
            '<line x1="880" y1="' + (ground + 6) + '" x2="60" y2="' + (ground + 6) + '" class="ga-return"/>' +
            // dimensions
            arrowV(30, ground, y12, '', 'ga-t-src') + '<text transform="translate(8,280) rotate(-90)" text-anchor="middle" class="ga-dimt ga-t-src">ΔV πηγής = 12 V</text>' +
            arrowV(548, y12, y8, 'I·R₁ = 4 V', 'ga-t-r') +
            arrowV(912, y8, ground, 'I·R₂ = 8 V', 'ga-t-r') +
            // labels of the parts
            '<text x="98" y="470" class="ga-cap" text-anchor="start">κυλιόμενη σκάλα = πηγή</text>' +
            '<text x="215" y="104" class="ga-cap">καλώδιο: λείο οροπέδιο</text>' +
            '<text x="330" y="204" class="ga-cap ga-cap-r">R₁ = 2 Ω</text><text x="330" y="224" class="ga-cap ga-cap-r">τραχιά κατηφόρα</text>' +
            '<text x="590" y="213" class="ga-cap">καλώδιο</text>' +
            '<text x="745" y="372" class="ga-cap ga-cap-r" text-anchor="end">R₂ = 4 Ω</text><text x="745" y="392" class="ga-cap ga-cap-r" text-anchor="end">τραχιά κατηφόρα</text>' +
            '<text x="560" y="508" class="ga-cap" text-anchor="middle">καλώδιο: λείο έδαφος, 0 V (επιστροφή στη βάση της σκάλας)</text>' +
            marker(1, 810, 330) + marker(2, 500, 98) + marker(3, 250, 300) + marker(4, 100, 508) +
            '<g id="ga-charges"></g></svg>';
    }

    const CARDS = [
        [1, 'Η τσουλήθρα', 'Τα φορτία κινούνται αυθόρμητα διαμέσου του εξωτερικού καλωδίου. Φανταστείτε μια τσουλήθρα: «κατηφορίζουν» από τον θετικό πόλο (υψηλότερο υψόμετρο) στον αρνητικό πόλο (χαμηλότερο υψόμετρο), αναπτύσσοντας ταχύτητα και μετατρέποντας τη δυναμική τους ενέργεια σε κινητική και θερμική στα τραχιά σημεία της τσουλήθρας.'],
        [2, 'Τα επίπεδα σημεία', 'Στα επίπεδα σημεία, και του ενεργειακού λόφου και του οριζόντιου επιπέδου, δεν δαπανάται καθόλου ενέργεια.'],
        [3, 'Η πηγή = κυλιόμενη σκάλα', 'Η ηλεκτρική πηγή επιτελεί τη λειτουργία μιας κυλιόμενης σκάλας, η οποία μεταφέρει τα (θετικά) φορτία (δαπανώντας τη δική της ενέργεια) «ανυψώνοντάς» τα από τον αρνητικό πόλο (χαμηλότερο υψόμετρο) στον θετικό πόλο (υψηλότερο υψόμετρο), προσφέροντάς τους την αντίστοιχη δυναμική ενέργεια. Η κυλιόμενη σκάλα λειτουργεί αποκλειστικά και μόνο σε αυτή την κατεύθυνση. Κίνηση στην αντίθετη κατεύθυνση, δηλαδή η αυθόρμητη κατάβαση διαμέσου της ίδιας της πηγής, απαγορεύεται: η λογική του μηχανισμού λειτουργίας της σκάλας προφανώς δεν το επιτρέπει.'],
        [4, 'Από την αρχή', 'Μετά την τσουλήθρα τα φορτία πηγαίνουν στην είσοδο της κυλιόμενης σκάλας και η διαδικασία επαναλαμβάνεται διαρκώς, για όσο διάστημα η σκάλα μπορεί να λειτουργεί.']
    ];

    const TABLE = [
        ['Πηγή τάσης 12 V', 'Κυλιόμενη σκάλα που ανεβάζει τα φορτία κατά 12 V, δαπανώντας δική της ενέργεια'],
        ['Θετικός πόλος', 'Κορυφή: υψηλό υψόμετρο, δυναμικό 12 V'],
        ['Αρνητικός πόλος', 'Έδαφος: υψόμετρο 0, δυναμικό 0 V (εμείς επιλέγουμε το έδαφος ως επίπεδο μηδέν)'],
        ['Ιδανικό καλώδιο', 'Λείο οριζόντιο οροπέδιο: ούτε τριβές ούτε αλλαγή ύψους, άρα καμία πτώση τάσης'],
        ['Αντιστάτης', 'Τραχιά κατηφόρα: τα φορτία χάνουν δυναμικό (υψόμετρο) και η δυναμική τους ενέργεια γίνεται κινητική και θερμική'],
        ['Πτώση τάσης I·R', 'Το ύψος της κατηφόρας (R₂ = 2·R₁, άρα διπλάσιο ύψος)'],
        ['Ρεύμα I', 'Η ροή των φορτίων, ίδια παντού στη σειρά (το ίδιο «κυκλοφοριακό φορτίο» στο καλώδιο και στις δύο κατηφόρες)'],
        ['Ανοιχτός διακόπτης', 'Κομμένος δρόμος (π.χ. γκρεμισμένη γέφυρα): δεν υπάρχει κίνηση φορτίων, άρα ούτε ρεύμα ούτε μεταφορά ενέργειας']
    ];

    function render(mount) {
        mount.innerHTML = '';
        const root = document.createElement('div');
        root.className = 'ga-wrap';
        root.innerHTML =
            '<div class="ga-head"><h2>🎢 Βαρυτικό ανάλογο: κύκλωμα με δύο αντιστάτες σε σειρά</h2>' +
            '<p>Η πηγή δουλεύει σαν κυλιόμενη σκάλα που ανεβάζει τα θετικά φορτία και οι δύο αντιστάτες σαν τραχιές κατηφόρες μιας τσουλήθρας. Παράδειγμα: V = 12 V, R₁ = 2 Ω, R₂ = 4 Ω, άρα R<sub>ολ</sub> = 6 Ω και I = 2 A.</p></div>' +
            '<div class="ga-fig"><div class="ga-bar"><button type="button" class="ga-btn" data-act="pause">⏸ Παύση</button><span class="ga-bar-note">Τα κίτρινα «+» ακολουθούν τη διαδρομή του θετικού φορτίου (οι τραχιές κατηφόρες τα «θερμαίνουν»).</span></div>' + figure() + '</div>' +
            '<div class="ga-cards">' + CARDS.map(c => '<div class="ga-card"><div class="ga-card-h"><span class="ga-num">' + c[0] + '</span>' + c[1] + '</div><p>' + c[2] + '</p></div>').join('') + '</div>' +
            '<h3 class="ga-h3">Αντιστοίχιση κυκλώματος και ανάλογου</h3>' +
            '<div class="ga-tw"><table class="ga-table"><thead><tr><th>Στο κύκλωμα</th><th>Στο βαρυτικό ανάλογο</th></tr></thead><tbody>' + TABLE.map(r => '<tr><th scope="row">' + r[0] + '</th><td>' + r[1] + '</td></tr>').join('') + '</tbody></table></div>' +
            '<h3 class="ga-h3">Ο ενεργειακός «δρόμος» του φορτίου, βήμα βήμα</h3>' +
            '<ol class="ga-steps">' +
            '<li><strong>Πηγή (σκάλα):</strong> το δυναμικό ανεβαίνει από 0 V σε <strong>12 V</strong>.</li>' +
            '<li><strong>Ιδανικό καλώδιο (οροπέδιο):</strong> παραμένει <strong>12 V</strong>· καμία πτώση τάσης.</li>' +
            '<li><strong>Αντιστάτης R₁ (πρώτη κατηφόρα):</strong> ΔV = I·R₁ = 2 A · 2 Ω = <strong>4 V</strong>, άρα 12 V → <strong>8 V</strong>.</li>' +
            '<li><strong>Καλώδιο ανάμεσα στους αντιστάτες (δεύτερο οροπέδιο, χαμηλότερα):</strong> παραμένει <strong>8 V</strong>.</li>' +
            '<li><strong>Αντιστάτης R₂ (δεύτερη κατηφόρα, διπλάσιο ύψος):</strong> ΔV = I·R₂ = 2 A · 4 Ω = <strong>8 V</strong>, άρα 8 V → <strong>0 V</strong>.</li>' +
            '<li><strong>Καλώδιο μέχρι τον αρνητικό πόλο (έδαφος):</strong> παραμένει <strong>0 V</strong>· τα φορτία φτάνουν στη βάση της σκάλας και όλα ξεκινούν από την αρχή.</li></ol>' +
            '<div class="ga-note"><strong>Συμπέρασμα:</strong> η διαφορά δυναμικού των 12 V «χάνεται» μέσα από δύο διαδοχικές πτώσεις τάσης, 4 V + 8 V = 12 V. Το κύκλωμα λειτουργεί σαν μια επαναλαμβανόμενη μεταφορά ενέργειας από την πηγή προς τους δύο αντιστάτες.</div>' +
            '<div class="ga-note ga-warn"><strong>Προσοχή:</strong> το βαρυτικό ανάλογο είναι μια ποιοτική προσπάθεια περιγραφής του χαρακτήρα των μεγεθών και των διαδικασιών και όχι κυριολεκτική αποτύπωση των λεπτομερειών του κυκλώματος. Δύο διαφορετικά φυσικά φαινόμενα δεν ταυτίζονται απόλυτα.</div>';
        mount.appendChild(root);

        // animation of the positive charges along the track
        const svg = root.querySelector('.ga-svg');
        const g = root.querySelector('#ga-charges');
        const pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        pathEl.setAttribute('d', PTS.map((p, i) => (i ? 'L' : 'M') + p[0] + ',' + p[1]).join(' '));
        pathEl.setAttribute('style', 'visibility:hidden;fill:none');
        svg.appendChild(pathEl);
        const N = 7;
        const charges = [];
        for (let i = 0; i < N; i++) {
            const c = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            c.setAttribute('class', 'ga-q');
            c.innerHTML = '<circle r="10"/><text y="5" text-anchor="middle">+</text>';
            g.appendChild(c);
            charges.push({ el: c, s: (i * TOTAL) / N });
        }
        const segAt = (s) => {
            let t = s;
            for (let i = 0; i < SEGLEN.length; i++) { if (t <= SEGLEN[i]) return i; t -= SEGLEN[i]; }
            return SEGLEN.length - 1;
        };
        let paused = false, last = performance.now();
        root.querySelector('[data-act="pause"]').addEventListener('click', (e) => {
            paused = !paused;
            e.currentTarget.textContent = paused ? '▶ Συνέχεια' : '⏸ Παύση';
        });
        function frame(now) {
            if (!root.isConnected) return;
            requestAnimationFrame(frame);
            const dt = Math.min(0.05, (now - last) / 1000);
            last = now;
            if (!svg.clientWidth) return;                       // tab hidden
            charges.forEach((c) => {
                const si = segAt(c.s);
                if (!paused) c.s = (c.s + 120 * SPEED[si] * dt) % TOTAL;
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
