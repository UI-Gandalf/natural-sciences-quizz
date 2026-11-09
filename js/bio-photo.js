/* ==========================================================================
   Photosynthesis: leaf diagram, factors that affect it and a small "limiting factor" lab (SUPPLEMENTARY, outside the book).
   Shared by the Biology Α and Γ "Βαθιά εστίαση & ερμηνεία" tabs.
   window.BioPhoto.section(number) -> section config for BioGuideKit.renderPage;  window.BioPhoto.init(root)
   ========================================================================== */
(function () {
    'use strict';
    const K = window.BioGuideKit;
    const { tbl, ul } = K;

    /* ------------------------------------------------------------ 7. photosynthesis (supplementary) */
    function leafSvg() {
        let cells = '', chl = '';
        for (let i = 0; i < 9; i++) {
            const x = 52 + i * 52;
            cells += '<rect x="' + x + '" y="152" width="44" height="52" rx="10" fill="#dcfce7" stroke="#16a34a" stroke-width="2"/>';
            chl += '<circle cx="' + (x + 12) + '" cy="168" r="5" fill="#15803d"/><circle cx="' + (x + 30) + '" cy="176" r="5" fill="#15803d"/><circle cx="' + (x + 16) + '" cy="190" r="5" fill="#15803d"/>';
        }
        let rays = '';
        for (let i = 0; i < 6; i++) rays += '<line x1="' + (90 + i * 70) + '" y1="46" x2="' + (110 + i * 70) + '" y2="122" stroke="#f59e0b" stroke-width="4" stroke-linecap="round"/><path d="M' + (104 + i * 70) + ',112 l6,12 l8,-12" fill="none" stroke="#f59e0b" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>';
        return '<svg viewBox="0 0 860 400" class="bg-svg" role="img" aria-label="Φωτοσύνθεση στο φύλλο: τι μπαίνει και τι βγαίνει">' +
            '<rect width="860" height="400" fill="#f0f9ff"/>' +
            '<circle cx="70" cy="30" r="22" fill="#fbbf24" stroke="#f59e0b" stroke-width="3"/><text x="104" y="36" font-size="15" font-weight="800" fill="#b45309">φως (ηλιακή ακτινοβολία)</text>' + rays +
            // leaf cross-section
            '<g transform="translate(70,0)">' +
            '<rect x="40" y="130" width="500" height="22" rx="6" fill="#86efac" stroke="#16a34a" stroke-width="2.5"/>' +
            cells + chl +
            '<rect x="40" y="206" width="500" height="44" fill="#bbf7d0" stroke="#16a34a" stroke-width="2.5"/>' +
            '<g fill="#ecfccb" stroke="#65a30d" stroke-width="2"><ellipse cx="90" cy="228" rx="18" ry="10"/><ellipse cx="170" cy="230" rx="22" ry="10"/><ellipse cx="400" cy="228" rx="20" ry="10"/></g>' +
            '<rect x="40" y="250" width="500" height="20" rx="6" fill="#86efac" stroke="#16a34a" stroke-width="2.5"/>' +
            '<rect x="296" y="246" width="30" height="28" fill="#f0f9ff"/><ellipse cx="290" cy="260" rx="14" ry="12" fill="#4ade80" stroke="#15803d" stroke-width="2.5"/><ellipse cx="332" cy="260" rx="14" ry="12" fill="#4ade80" stroke="#15803d" stroke-width="2.5"/>' +
            '<text x="274" y="298" font-size="13" font-weight="800" fill="#166534" text-anchor="end">στόμιο</text>' +
            // arrows in/out
            '<path d="M304,360 L304,292" stroke="#475569" stroke-width="5" stroke-linecap="round"/><path d="M296,302 l8,-12 l8,12" fill="none" stroke="#475569" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>' +
            '<text x="304" y="382" font-size="15" font-weight="800" fill="#334155" text-anchor="middle">CO₂ από τον αέρα</text>' +
            '<path d="M346,292 L346,344" stroke="#0284c7" stroke-width="5" stroke-linecap="round"/><path d="M338,334 l8,12 l8,-12" fill="none" stroke="#0284c7" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>' +
            '<text x="372" y="338" font-size="15" font-weight="800" fill="#0369a1">O₂ προς τον αέρα</text>' +
            '<g transform="translate(-70,0)"><path d="M8,228 L104,228" stroke="#2563eb" stroke-width="6" stroke-linecap="round"/><path d="M94,220 l12,8 l-12,8" fill="none" stroke="#2563eb" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>' +
            '<text x="8" y="196" font-size="14" font-weight="800" fill="#1d4ed8">νερό</text><text x="8" y="212" font-size="13" font-weight="800" fill="#1d4ed8">από τη ρίζα</text><text x="8" y="256" font-size="12" fill="#1d4ed8">(ξύλωμα)</text></g>' +
            '<path d="M512,228 L548,228" stroke="#a16207" stroke-width="6" stroke-linecap="round"/><path d="M540,220 l12,8 l-12,8" fill="none" stroke="#a16207" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>' +
            '<text x="500" y="233" font-size="14" font-weight="800" fill="#854d0e" text-anchor="end">γλυκόζη</text>' +
            '<text x="290" y="146" font-size="12.5" font-weight="800" fill="#14532d" text-anchor="middle">επιδερμίδα</text><circle cx="52" cy="296" r="5" fill="#15803d"/><text x="64" y="301" font-size="13" font-weight="800" fill="#14532d">χλωροπλάστες</text>' +
            '</g>' +
            // equation panel
            '<rect x="630" y="62" width="220" height="296" rx="16" fill="#ffffff" stroke="#94a3b8" stroke-width="2"/>' +
            '<text x="740" y="92" font-size="16" font-weight="800" fill="#0f172a" text-anchor="middle">Η φωτοσύνθεση</text>' +
            '<text x="740" y="126" font-size="16" font-weight="800" fill="#475569" text-anchor="middle">διοξείδιο του άνθρακα</text><text x="740" y="148" font-size="16" font-weight="800" fill="#2563eb" text-anchor="middle">+ νερό</text>' +
            '<path d="M740,160 L740,206" stroke="#f59e0b" stroke-width="6" stroke-linecap="round"/><path d="M730,196 l10,14 l10,-14" fill="none" stroke="#f59e0b" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>' +
            '<text x="754" y="180" font-size="13.5" font-weight="800" fill="#b45309">φως +</text><text x="754" y="198" font-size="13.5" font-weight="800" fill="#b45309">χλωροφύλλη</text>' +
            '<text x="740" y="240" font-size="16" font-weight="800" fill="#a16207" text-anchor="middle">γλυκόζη</text><text x="740" y="262" font-size="16" font-weight="800" fill="#0369a1" text-anchor="middle">+ οξυγόνο</text>' +
            '<text x="740" y="304" font-size="13" fill="#475569" text-anchor="middle">CO₂ + H₂O → γλυκόζη + O₂</text><text x="740" y="324" font-size="12" fill="#64748b" text-anchor="middle">(απλοποιημένη, χωρίς αριθμούς)</text>' +
            '</svg>';
    }

    const S7 =
        '<div class="bga-box bt-supp"><strong>➕ Όλη η ενότητα <span class="bt-tag">συμπληρωματικό · εκτός βιβλίου · δεν ζητείται</span></strong><p>Στο σχολικό βιβλίο η φωτοσύνθεση αναφέρεται σύντομα (λειτουργία των φυτών που χρειάζεται ηλιακή ακτινοβολία). Εδώ δίνεται λίγο περισσότερη εικόνα, σε απλό επίπεδο, με το σχέδιο και τους παράγοντες που τη ρυθμίζουν. Το σχέδιο είναι δικό μας και σχηματικό.</p></div>' +
        '<h4>Τι μπαίνει και τι βγαίνει</h4>' +
        '<div class="bt-stage">' + leafSvg() + '</div>' +
        ul(['<strong>Φως:</strong> η ενέργειά του δεσμεύεται από τη <strong>χλωροφύλλη</strong>, που βρίσκεται στους <strong>χλωροπλάστες</strong> των κυττάρων του φύλλου.',
            '<strong>Διοξείδιο του άνθρακα (CO₂):</strong> μπαίνει από τον αέρα μέσα από τα μικροσκοπικά <strong>στόμια</strong> του φύλλου.',
            '<strong>Νερό:</strong> το παίρνει η ρίζα από το έδαφος και ανεβαίνει στο φύλλο μέσα από το <strong>ξύλωμα</strong>.',
            '<strong>Προϊόντα:</strong> η <strong>γλυκόζη</strong> (τροφή και υλικό για το φυτό, όπως για το άμυλο και την κυτταρίνη) και το <strong>οξυγόνο</strong>, που βγαίνει από τα στόμια στον αέρα.']) +
        '<h4>Ποιοι παράγοντες επηρεάζουν τη φωτοσύνθεση</h4>' +
        tbl(['Παράγοντας', 'Τι κάνει', 'Αν είναι λίγος ή υπερβολικός'], [
            ['☀️ Ένταση του φωτός', 'Παρέχει την ενέργεια.', 'Με λίγο φως η φωτοσύνθεση είναι αργή. Από κάποιο σημείο και μετά δεν αυξάνεται άλλο, γιατί περιορίζει κάτι άλλο.'],
            ['🌫️ Συγκέντρωση CO₂', 'Είναι η πρώτη ύλη για τη γλυκόζη.', 'Λίγο CO₂ (π.χ. σε κλειστό χώρο) περιορίζει τη φωτοσύνθεση, ακόμα και με πολύ φως.'],
            ['🌡️ Θερμοκρασία', 'Οι αντιδράσεις γίνονται με <strong>ένζυμα</strong>.', 'Στο κρύο είναι αργή. Στη ζέστη ο ρυθμός ανεβαίνει μέχρι μια άριστη τιμή, και αν ανέβει πολύ τα ένζυμα <strong>χαλάνε</strong> και πέφτει απότομα.'],
            ['💧 Νερό', 'Είναι πρώτη ύλη, και κρατά τα στόμια ανοιχτά.', 'Με λειψυδρία το φυτό <strong>κλείνει τα στόμια</strong> για να μη χάνει νερό. Τότε όμως δεν μπαίνει CO₂ και η φωτοσύνθεση μειώνεται.'],
            ['🍃 Χλωροφύλλη', 'Δεσμεύει το φως.', 'Φύλλα με λιγότερη χλωροφύλλη (π.χ. κιτρινισμένα ή ποικιλόχρωμα) φωτοσυνθέτουν λιγότερο.']
        ], 'bga-plain') +
        '<h4>Δοκίμασε: ποιος παράγοντας «φρενάρει»;</h4>' +
        '<p>Όταν η φωτοσύνθεση περιορίζεται από έναν μόνο παράγοντα, αυτός λέγεται <strong>περιοριστικός παράγοντας</strong>: όσο τον αυξάνεις, ανεβαίνει ο ρυθμός· όσο αλλάζεις τους άλλους, δεν αλλάζει σχεδόν τίποτα. <span class="ph-hint">Μετακίνησε τους δείκτες και παρακολούθησε τη μπάρα και το διάγραμμα που αλλάζουν.</span></p>' +
        '<div class="bt-stage ph-lab" id="ph-lab"><div class="ph-ctrl">' +
        '<label>☀️ Φως <input type="range" id="ph-L" min="0" max="100" value="30"><b id="ph-Lv"></b></label>' +
        '<label>🌫️ CO₂ <input type="range" id="ph-C" min="0" max="100" value="60"><b id="ph-Cv"></b></label>' +
        '<label>🌡️ Θερμοκρασία <input type="range" id="ph-T" min="0" max="45" value="25"><b id="ph-Tv"></b></label>' +
        '<label>💧 Νερό στο έδαφος <input type="range" id="ph-W" min="0" max="100" value="80"><b id="ph-Wv"></b></label>' +
        '</div><div class="ph-out"><div class="ph-watch">👀 Παρακολούθησε εδώ: ο ρυθμός της φωτοσύνθεσης</div><div class="ph-bar"><i id="ph-bar"></i></div><div id="ph-txt" class="ph-txt"></div><svg viewBox="0 0 420 210" class="ph-graph" id="ph-graph" role="img" aria-label="Ρυθμός φωτοσύνθεσης ανάλογα με το φως"></svg></div></div>' +
        '<p class="bga-note">Απλό μοντέλο για την κατανόηση, όχι πραγματικές μετρήσεις. Στην καμπύλη, το σημείο δείχνει την τρέχουσα τιμή του φωτός. Όταν η καμπύλη «ισιώνει», το φως δεν είναι πια ο περιοριστικός παράγοντας.</p>' +
        '<h4>Γιατί είναι σημαντική</h4>' +
        ul(['Δημιουργεί τη <strong>τροφή</strong> των φυτών και, μέσω της τροφικής αλυσίδας, των ζώων.',
            'Δίνει <strong>οξυγόνο</strong> στην ατμόσφαιρα και δεσμεύει <strong>CO₂</strong>.',
            'Γι’ αυτό, π.χ., τα φυτά μέσα σε σκοτεινό δωμάτιο δεν αναπτύσσονται καλά και τα φύλλα στρέφονται προς το φως.']);

    function initPhoto(root) {
        const g = (id) => root.querySelector('#' + id);
        if (!g('ph-L')) return;
        const model = (L, C, T, W) => {
            const fL = 1 - Math.exp(-L / 28);
            const fC = 1 - Math.exp(-(C * Math.min(1, 0.25 + W / 55)) / 22);
            const x = (T - 27) / 12;
            const fT = Math.max(0, Math.exp(-x * x) - (T > 38 ? (T - 38) / 10 : 0) * 0.5);
            return { fL, fC, fT, rate: Math.max(0, Math.min(fL, fC) * fT) };
        };
        function update() {
            const L = +g('ph-L').value, C = +g('ph-C').value, T = +g('ph-T').value, W = +g('ph-W').value;
            g('ph-Lv').textContent = L + '%'; g('ph-Cv').textContent = C + '%'; g('ph-Tv').textContent = T + ' °C'; g('ph-Wv').textContent = W + '%';
            const m = model(L, C, T, W);
            const out = root.querySelector('.ph-out'); if (out) { out.classList.remove('ph-pulse'); void out.offsetWidth; out.classList.add('ph-pulse'); }
            g('ph-bar').style.width = Math.round(m.rate * 100) + '%';
            const names = [['fL', 'το φως'], ['fC', 'το CO₂ (ή το νερό, που κλείνει τα στόμια)'], ['fT', 'η θερμοκρασία']];
            names.sort((a, b) => m[a[0]] - m[b[0]]);
            const lim = names[0];
            let msg = 'Ρυθμός φωτοσύνθεσης: <strong>' + Math.round(m.rate * 100) + '%</strong> του μέγιστου. ';
            msg += m.rate < 0.05 ? 'Σχεδόν μηδενικός: ' : 'Περιοριστικός παράγοντας: ';
            msg += '<strong>' + lim[1] + '</strong>.';
            if (W < 30 && C > 20) msg += ' (Με λίγο νερό τα στόμια κλείνουν και μπαίνει λιγότερο CO₂.)';
            if (T > 38) msg += ' (Η υψηλή θερμοκρασία χαλάει τα ένζυμα.)';
            g('ph-txt').innerHTML = msg;
            let d = '';
            for (let l = 0; l <= 100; l += 4) { const r = model(l, C, T, W).rate; d += (l ? 'L' : 'M') + (40 + l * 3.6).toFixed(1) + ',' + (170 - r * 150).toFixed(1); }
            const cx = 40 + L * 3.6, cy = 170 - m.rate * 150;
            g('ph-graph').innerHTML = '<rect width="420" height="210" fill="#f8fafc"/><line x1="40" y1="170" x2="404" y2="170" stroke="#475569" stroke-width="2.5"/><line x1="40" y1="170" x2="40" y2="12" stroke="#475569" stroke-width="2.5"/>' +
                '<path d="' + d + '" fill="none" stroke="#16a34a" stroke-width="4" stroke-linecap="round"/>' +
                '<line x1="' + cx + '" y1="170" x2="' + cx + '" y2="' + cy + '" stroke="#f59e0b" stroke-width="2.5" stroke-dasharray="5 4"/><circle cx="' + cx + '" cy="' + cy + '" r="7" fill="#f59e0b" stroke="#78350f" stroke-width="2"/>' +
                '<text x="222" y="198" font-size="13" font-weight="800" fill="#0f172a" text-anchor="middle">φως →</text><text x="14" y="95" font-size="13" font-weight="800" fill="#0f172a" transform="rotate(-90 14 95)" text-anchor="middle">ρυθμός →</text>';
        }
        root.querySelectorAll('#ph-lab input').forEach((i) => i.addEventListener('input', update));
        update();
    }

    function section(num) {
        return { id: 'bp1', icon: '🌿', title: num + '. Φωτοσύνθεση: τι μπαίνει, τι βγαίνει και τι τη ρυθμίζει', nav: 'Φωτοσύνθεση', sub: 'σχέδιο φύλλου · παράγοντες · περιοριστικός παράγοντας', body: S7, open: true };
    }

    window.BioPhoto = { section, init: initPhoto };
})();
