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
            opts: [[0, 'Ακρίβεια 1 cm (κανένα δεκαδικό)', 'π.χ. 119'], [1, 'Ακρίβεια 0,1 cm (ένα δεκαδικό)', 'π.χ. 118,9'], [2, 'Ακρίβεια 0,01 cm (δύο δεκαδικά)', 'π.χ. 118,91']],
            sample: { 0: [119, 119, 120, 119, 119, 119, 119, 119, 119, 119], 1: [118.8, 118.9, 119.5, 118.7, 118.7, 118.8, 118.9, 119.0, 119.1, 118.7], 2: [118.84, 118.91, 119.47, 118.72, 118.69, 118.83, 118.95, 119.02, 119.08, 118.74] }
        },
        time: {
            unit: 's', title: '⏱ Δικές σας μετρήσεις χρόνου', what: 'χρόνου',
            opts: [[0, 'Αναλογικό ρολόι: ακρίβεια 1 s (κανένα δεκαδικό)', 'π.χ. 14'], [2, 'Χρονόμετρο: ακρίβεια 0,01 s (δύο δεκαδικά)', 'π.χ. 14,27'], [3, 'Ακρίβεια 0,001 s (τρία δεκαδικά)', 'π.χ. 14,267']],
            sample: { 0: [13, 13, 14, 14, 14, 13, 14, 13, 14, 14], 2: [14.20, 14.09, 14.34, 14.40, 14.51, 14.28, 14.23, 14.21, 14.24, 14.17], 3: [14.203, 14.094, 14.341, 14.402, 14.512, 14.279, 14.231, 14.208, 14.244, 14.176] }
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
        const st = { d: cfg.opts[1][0] };
        let inputs = '';
        for (let i = 0; i < 10; i++) inputs += '<tr><td>' + (i + 1) + '</td><td><input class="pc-in" data-i="' + i + '" inputmode="decimal" autocomplete="off"></td></tr>';
        mount.innerHTML =
            '<div class="pa-wrap">' +
            '<header class="pa-head"><div class="pa-kicker">Φυσική Α΄ Γυμνασίου · Εργαλείο</div><h2>' + cfg.title + '</h2>' +
            '<p>Επιλέξτε την <strong>ακρίβεια του οργάνου</strong>, γράψτε τις 10 μετρήσεις σας και η εφαρμογή θα υπολογίσει το άθροισμα, θα διαιρέσει με το 10 και θα στρογγυλοποιήσει τη μέση τιμή με την ακρίβεια των μετρήσεων, σχολιάζοντας το αποτέλεσμα.</p>' +
            '<div class="pa-tools"><button type="button" class="pa-btn" data-act="back">⬅ Πίσω</button><button type="button" class="pa-btn" data-act="sample">✨ Γέμισμα με παράδειγμα</button><button type="button" class="pa-btn" data-act="clear">🧹 Καθαρισμός</button></div></header>' +
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

        root.addEventListener('input', e => { if (e.target.closest('.pc-in')) update(); });
        root.addEventListener('change', e => {
            if (e.target.name === 'pc-d') { st.d = +e.target.value; placeholders(); root.querySelectorAll('.pc-in').forEach(i => { i.value = ''; }); update(); }
        });
        root.addEventListener('click', e => {
            const b = e.target.closest('[data-act]');
            if (!b) return;
            if (b.dataset.act === 'back') opt.back();
            else if (b.dataset.act === 'clear') { root.querySelectorAll('.pc-in').forEach(i => { i.value = ''; }); update(); }
            else if (b.dataset.act === 'sample') { cfg.sample[st.d].forEach((v, i) => { root.querySelectorAll('.pc-in')[i].value = nf(v, st.d); }); update(); }
        });
        placeholders();
        update();
        mount.scrollIntoView({ block: 'start' });
    }

    window.PhysACalc = { render };
})();
