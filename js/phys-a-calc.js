/* ==========================================================================
   Physics Α: «Δοκιμάστε με δικές σας μετρήσεις» – 10 values, chosen precision,
   sum, division by 10, rounding to the precision of the instrument, comments.
   window.PhysACalc.render(mount, { kind: 'length' | 'time', back: fn })
   ========================================================================== */
(function () {
    'use strict';

    const CFG = {
        length: {
            unit: 'cm', title: '📏 Δικές σας μετρήσεις μήκους', what: 'μήκους',
            opts: [[1, 'Ακρίβεια 0,1 cm (ένα δεκαδικό)', 'π.χ. 118,9']],
            samples: { 0: [[119, 119, 120, 119, 119, 119, 119, 119, 119, 119], [46, 45, 46, 45, 45, 46, 46, 45, 45, 45], [88, 88, 87, 88, 87, 87, 89, 87, 88, 88], [152, 152, 154, 153, 152, 153, 152, 152, 152, 152], [24, 24, 24, 24, 24, 24, 24, 24, 24, 24]], 1: [[118.8, 118.9, 119.5, 118.7, 118.7, 118.8, 118.9, 119.0, 119.1, 118.7], [45.9, 45.3, 45.7, 45.1, 45.1, 45.7, 45.5, 45.0, 45.3, 45.0], [87.8, 87.5, 87.1, 88.0, 87.4, 87.4, 88.8, 87.1, 87.7, 87.7], [152.4, 152.3, 153.5, 152.6, 152.2, 153.0, 152.4, 152.0, 152.4, 152.3], [23.7, 23.9, 23.5, 23.9, 23.8, 23.8, 23.8, 23.8, 24.3, 23.5]], 2: [[118.84, 118.91, 119.47, 118.72, 118.69, 118.83, 118.95, 119.02, 119.08, 118.74], [45.85, 45.31, 45.67, 45.09, 45.13, 45.68, 45.45, 45.04, 45.32, 44.97], [87.75, 87.48, 87.13, 88.01, 87.40, 87.41, 88.75, 87.07, 87.73, 87.65], [152.40, 152.29, 153.51, 152.57, 152.15, 153.00, 152.36, 152.00, 152.35, 152.27], [23.65, 23.91, 23.49, 23.94, 23.83, 23.79, 23.78, 23.79, 24.33, 23.51]], 3: [[118.843, 118.913, 119.471, 118.721, 118.692, 118.831, 118.953, 119.021, 119.081, 118.740], [45.851, 45.313, 45.673, 45.090, 45.134, 45.683, 45.453, 45.044, 45.320, 44.972], [87.750, 87.484, 87.131, 88.010, 87.403, 87.413, 88.752, 87.070, 87.730, 87.650], [152.404, 152.291, 153.513, 152.573, 152.153, 153.003, 152.362, 152.003, 152.353, 152.273], [23.651, 23.912, 23.490, 23.942, 23.834, 23.790, 23.781, 23.794, 24.334, 23.512]] }
        },
        time: {
            unit: 's', title: '⏱ Δικές σας μετρήσεις χρόνου', what: 'χρόνου',
            opts: [[0, 'Αναλογικό ρολόι: ακρίβεια 1 s (κανένα δεκαδικό)', 'π.χ. 14'], [2, 'Χρονόμετρο: ακρίβεια 0,01 s (δύο δεκαδικά)', 'π.χ. 14,27'], [3, 'Ακρίβεια 0,001 s (τρία δεκαδικά)', 'π.χ. 14,267']],
            samples: { 0: [[13, 13, 14, 14, 14, 13, 14, 13, 14, 14], [9, 9, 8, 9, 8, 9, 9, 9, 9, 9], [21, 21, 21, 21, 21, 21, 21, 21, 21, 21], [12, 12, 12, 12, 12, 12, 12, 12, 12, 12], [33, 34, 33, 33, 33, 33, 33, 33, 32, 33]], 2: [[14.20, 14.09, 14.34, 14.40, 14.51, 14.28, 14.23, 14.21, 14.24, 14.17], [8.69, 8.80, 8.23, 8.94, 8.46, 8.65, 8.79, 8.66, 8.92, 8.66], [20.65, 20.62, 21.14, 21.40, 20.96, 21.34, 20.78, 21.17, 21.33, 21.16], [11.62, 11.88, 11.95, 11.94, 11.84, 11.92, 11.78, 11.79, 11.85, 12.00], [33.30, 33.51, 32.90, 33.46, 32.94, 33.35, 32.99, 33.06, 32.40, 33.06]], 3: [[14.203, 14.094, 14.341, 14.402, 14.512, 14.279, 14.231, 14.208, 14.244, 14.176], [8.688, 8.798, 8.231, 8.937, 8.456, 8.645, 8.792, 8.662, 8.917, 8.661], [20.651, 20.621, 21.138, 21.396, 20.955, 21.341, 20.781, 21.166, 21.333, 21.160], [11.617, 11.879, 11.945, 11.940, 11.836, 11.924, 11.782, 11.790, 11.848, 12.002], [33.296, 33.505, 32.902, 33.456, 32.938, 33.348, 32.993, 33.060, 32.398, 33.062]] }
        }
    };

    const nf = (x, d) => x.toFixed(d).replace('.', ',');
    function decimalsOf(str) {
        const s = String(str).trim().replace(',', '.');
        const k = s.indexOf('.');
        return k < 0 ? 0 : s.length - k - 1;
    }

    function render(mount, opt) {
        const cfg = CFG[opt.kind];
        const st = { d: cfg.opts[0][0], set: 0, filled: false };
        let inputs = '';
        for (let i = 0; i < 10; i++) inputs += '<tr><td>' + (i + 1) + '</td><td><input class="pc-in" data-i="' + i + '" inputmode="decimal" autocomplete="off"></td></tr>';
        mount.innerHTML =
            '<div class="pa-wrap">' +
            '<header class="pa-head"><div class="pa-kicker">Φυσική Α΄ Γυμνασίου · Εργαλείο</div><h2>' + cfg.title + '</h2>' +
            '<p>' + (cfg.opts.length === 1 ? 'Η μετροταινία έχει <strong>ακρίβεια 0,1 cm</strong> (ένα δεκαδικό ψηφίο). Γράψτε' : 'Επιλέξτε την <strong>ακρίβεια του οργάνου</strong>, γράψτε') + ' τις 10 μετρήσεις σας και η εφαρμογή θα υπολογίσει το άθροισμα, θα διαιρέσει με το 10 και θα στρογγυλοποιήσει τη μέση τιμή με την ακρίβεια των μετρήσεων, σχολιάζοντας το αποτέλεσμα.</p>' +
            '<div class="pa-tools"><button type="button" class="pa-btn" data-act="back">⬅ Πίσω</button><button type="button" class="pa-btn" data-act="sample">✨ Γέμισμα με παράδειγμα</button><label class="pa-setsel">Σειρά μετρήσεων: <select id="pc-set" aria-label="Επιλογή σειράς μετρήσεων παραδείγματος">' + [1, 2, 3, 4, 5].map(n => '<option value="' + (n - 1) + '">Παράδειγμα #' + n + '</option>').join('') + '</select></label><button type="button" class="pa-btn" data-act="clear">🧹 Καθαρισμός</button></div></header>' +
            '<section class="pa-card"><h3><span class="pa-num">1</span> Ακρίβεια οργάνου</h3><div class="pc-opts">' +
            cfg.opts.map(o => '<label class="pc-opt"><input type="radio" name="pc-d" value="' + o[0] + '"' + (o[0] === st.d ? ' checked' : '') + '><span>' + o[1] + '</span></label>').join('') + '</div></section>' +
            '<section class="pa-card"><h3><span class="pa-num">2</span> Οι 10 μετρήσεις (' + cfg.unit + ')</h3><div class="pm-tablewrap"><table class="pm-table pe-table"><thead><tr><th>Μέτρηση</th><th>Τιμή (' + cfg.unit + ')</th></tr></thead><tbody>' + inputs + '</tbody></table></div><div id="pc-warn"></div></section>' +
            '<section class="pa-card"><h3><span class="pa-num">3</span> Αποτέλεσμα</h3><div id="pc-out"><div class="pa-small">Συμπληρώστε και τις 10 τιμές.</div></div></section>' +
            '<div class="pa-tools"><button type="button" class="pa-btn" data-act="back">⬅ Πίσω</button></div></div>';
        const root = mount.querySelector('.pa-wrap');

        function placeholders() {
            const o = cfg.opts.find(x => x[0] === st.d);
            root.querySelectorAll('.pc-in').forEach(i => { i.placeholder = o[2]; });
        }

        function update() {
            const ins = Array.from(root.querySelectorAll('.pc-in'));
            const raw = ins.map(i => i.value.trim());
            const vals = raw.map(r => parseFloat(r.replace(',', '.')));
            const filled = raw.filter(r => r !== '').length;
            const warn = root.querySelector('#pc-warn'), out = root.querySelector('#pc-out');
            const bad = raw.map((r, i) => (r !== '' && (!isFinite(vals[i]) || vals[i] < 0)) ? i + 1 : 0).filter(Boolean);
            if (bad.length) { warn.innerHTML = '<div class="pa-msg bad">Οι μετρήσεις ' + bad.join(', ') + ' δεν είναι έγκυροι θετικοί αριθμοί.</div>'; out.innerHTML = ''; return; }
            const wrongDec = raw.map((r, i) => (r !== '' && decimalsOf(r) !== st.d) ? i + 1 : 0).filter(Boolean);
            warn.innerHTML = wrongDec.length
                ? '<div class="pa-msg bad">Το ίδιο όργανο δίνει πάντα τον ίδιο αριθμό δεκαδικών ψηφίων. Οι μετρήσεις ' + wrongDec.join(', ') + ' δεν έχουν ' + (st.d === 0 ? 'κανένα δεκαδικό' : st.d + (st.d === 1 ? ' δεκαδικό ψηφίο' : ' δεκαδικά ψηφία')) + '. Διορθώστε τις ή αλλάξτε την ακρίβεια.</div>'
                : '';
            if (filled < 10) { out.innerHTML = '<div class="pa-small">Συμπληρώθηκαν ' + filled + ' από 10 τιμές.</div>'; return; }
            if (wrongDec.length) { out.innerHTML = ''; return; }

            const k = Math.pow(10, st.d);
            const ints = vals.map(v => Math.round(v * k));              // exact integer arithmetic
            const sumI = ints.reduce((a, b) => a + b, 0);
            const sum = sumI / k;
            const mean = sum / 10;
            const finalI = Math.round(sumI / 10);                         // round half up on the scaled integer mean
            const final = finalI / k;
            const meanRaw = nf(mean, st.d + 1);
            const mn = Math.min.apply(null, vals), mx = Math.max.apply(null, vals);
            const sd = Math.sqrt(vals.reduce((a, v) => a + (v - mean) * (v - mean), 0) / 10);
            const step = 1 / k;
            const far = vals.map((v, i) => ({ v, i })).filter(o => sd > 0 && Math.abs(o.v - mean) > 2 * sd && Math.abs(o.v - mean) > 2 * step);

            const dec = st.d === 0 ? 'κανένα δεκαδικό' : (st.d === 1 ? 'ένα δεκαδικό ψηφίο' : st.d + ' δεκαδικά ψηφία');
            let c = '';
            c += '<li><strong>Άθροισμα και διαίρεση:</strong> το άθροισμα είναι ' + nf(sum, st.d) + ' ' + cfg.unit + ' και διαιρώντας με το 10 (μετακινούμε την υποδιαστολή κατά ένα ψηφίο προς τα αριστερά) βρίσκουμε ' + meanRaw + ' ' + cfg.unit + '.</li>';
            if (nf(mean, st.d + 1).replace(/0+$/, '').length && Math.abs(mean - final) > 1e-9) c += '<li><strong>Στρογγυλοποίηση:</strong> οι μετρήσεις έχουν ' + dec + ', οπότε και το αποτέλεσμα δίνεται με ' + dec + ': <strong>' + nf(final, st.d) + ' ' + cfg.unit + '</strong>. Ο μέσος όρος δεν μπορεί «ως εκ θαύματος» να αυξήσει την ακρίβεια του οργάνου.</li>';
            else c += '<li><strong>Στρογγυλοποίηση:</strong> η μέση τιμή βγήκε ήδη με ' + dec + ', όσα και οι μετρήσεις, οπότε δεν χρειάστηκε στρογγυλοποίηση.</li>';
            if (st.d === 0) c += '<li><strong>Τι σημαίνει ο ακέραιος:</strong> το ' + nf(final, 0) + ' ' + cfg.unit + ' δηλώνει ότι δεν γνωρίζουμε το δεκαδικό μέρος· η πραγματική τιμή θα μπορούσε να είναι από ' + nf(final - 0.5, 1) + ' έως ' + nf(final + 0.4, 1) + ' ' + cfg.unit + '. Δεν είναι το ίδιο με το ' + nf(final, 1) + ' ' + cfg.unit + ', που θα δήλωνε ότι έχουμε μετρήσει και το δέκατο.</li>';
            else c += '<li><strong>Τι σημαίνει η γραφή:</strong> το ' + nf(final, st.d) + ' ' + cfg.unit + ' δηλώνει ότι είμαστε βέβαιοι και για το ' + (st.d === 1 ? 'πρώτο' : (st.d === 2 ? 'δεύτερο' : 'τρίτο')) + ' δεκαδικό ψηφίο. Γι\' αυτό δεν γράφουμε περισσότερα ούτε λιγότερα ψηφία από την ακρίβεια του οργάνου.</li>';
            c += '<li><strong>Διασπορά:</strong> οι μετρήσεις κυμαίνονται από ' + nf(mn, st.d) + ' έως ' + nf(mx, st.d) + ' ' + cfg.unit + ' (εύρος ' + nf(mx - mn, st.d) + ' ' + cfg.unit + '). ' + (mx === mn ? 'Όλες οι τιμές είναι ίδιες: το όργανό σας δεν «βλέπει» τις μικρές διαφορές. Αυτό δεν σημαίνει ότι η μέτρηση είναι τέλεια, αλλά ότι η ακρίβεια του οργάνου είναι χαμηλή σε σχέση με τις αποκλίσεις.' : 'Η μέση τιμή εξομαλύνει αυτές τις αποκλίσεις.') + '</li>';
            if (far.length) c += '<li><strong>Προσοχή στην τιμή ' + nf(far[0].v, st.d) + ' (μέτρηση ' + (far[0].i + 1) + '):</strong> απέχει αρκετά από τις υπόλοιπες. Αξίζει να ελέγξετε αν έγινε λάθος μεθόδου ή ανάγνωσης' + (opt.kind === 'length' ? ' (μηδέν της μετροταινίας, συστροφή, παράλληλη ευθεία, παράλλαξη)' : ' (καθυστέρηση αντίδρασης, λάθος ανάγνωση, έλλειψη συγχρονισμού)') + '.</li>';
            if (opt.kind === 'time' && st.d >= 2) c += '<li class="pc-hl"><strong>⚠️ Ακρίβεια οργάνου ≠ ακρίβεια πειράματος:</strong> στο πείραμα του εκκρεμούς ο ανθρώπινος χρόνος αντίδρασης δίνει σφάλμα τουλάχιστον ΔΤ = 0,2 – 0,3 s. Έτσι, αν και το χρονόμετρο γράφει εκατοστά, τα τελευταία ψηφία δεν είναι στην πράξη αξιόπιστα.</li>';
            out.innerHTML =
                '<div class="pe-step"><span class="pe-sn">1</span><div><strong>Άθροισμα</strong><br>' + nf(sum, st.d) + ' ' + cfg.unit + '</div></div>' +
                '<div class="pe-step"><span class="pe-sn">2</span><div><strong>Διαίρεση με το 10</strong><br>' + nf(sum, st.d) + ' ÷ 10 = <strong>' + meanRaw + ' ' + cfg.unit + '</strong></div></div>' +
                '<div class="pe-step pe-final"><span class="pe-sn">3</span><div><strong>Τελική τιμή (με ' + dec + ')</strong><br><span class="pa-res">' + nf(final, st.d) + ' ' + cfg.unit + '</span></div></div>' +
                '<h4 class="pa-sub">Σχόλια</h4><ul class="pm-list">' + c + '</ul>';
        }

        // five fixed example series for every precision: #1 is the one used in the theory example
        function fillSample() {
            const row = cfg.samples[st.d][st.set];
            const ins = root.querySelectorAll('.pc-in');
            row.forEach((v, i) => { ins[i].value = nf(v, st.d); });
            st.filled = true;          // the table holds an unchanged example: a change of precision re-fills it
            update();
        }

        root.addEventListener('input', e => { if (e.target.closest('.pc-in')) { st.filled = false; update(); } });
        root.addEventListener('change', e => {
            if (e.target.id === 'pc-set') {
                // another example always starts with the coarsest instrument (whole numbers)
                st.set = +e.target.value; st.d = cfg.opts[0][0];
                const r0 = root.querySelector('input[name="pc-d"][value="' + st.d + '"]'); if (r0) r0.checked = true;
                placeholders(); fillSample(); return;
            }
            if (e.target.name === 'pc-d') {
                st.d = +e.target.value; placeholders();
                if (st.filled) fillSample();      // the same example, now as read with the new precision
                else { root.querySelectorAll('.pc-in').forEach(i => { i.value = ''; }); update(); }
            }
        });
        root.addEventListener('click', e => {
            const b = e.target.closest('[data-act]');
            if (!b) return;
            if (b.dataset.act === 'back') opt.back();
            else if (b.dataset.act === 'clear') { st.filled = false; root.querySelectorAll('.pc-in').forEach(i => { i.value = ''; }); update(); }
            else if (b.dataset.act === 'sample') fillSample();
        });
        placeholders();
        update();
        mount.scrollIntoView({ block: 'start' });
    }

    window.PhysACalc = { render };
})();
