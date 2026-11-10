/* ==========================================================================
   Chemistry Γ: "Υδροπονία και αεροπονία" - supplementary topic (outside the book, not examined).
   Connects with: ionic solutions, salts, the pH scale, acids / bases / neutralisation, buffer (bicarbonates).
   All drawings are our own schematic drawings. The pH ranges of the nutrients are APPROXIMATE and schematic.
   No doses, no instructions for handling chemicals.
   window.ChemHydro.render(mountElement)
   ========================================================================== */
window.ChemHydro = (function () {
    'use strict';
    const K = window.BioGuideKit;
    const { tbl, ul, box, flow } = K;
    const supp = (title, body) => '<div class="bga-box bt-supp"><strong>➕ ' + title + ' <span class="bt-tag">συμπληρωματικό · εκτός βιβλίου · δεν ζητείται</span></strong>' + body + '</div>';

    /* ------------------------------------------------ diagram 1: soil / hydroponics / aeroponics */
    function systemsSvg() {
        const plant = (x, y) => '<g transform="translate(' + x + ',' + y + ')"><path d="M0,0 C-6,-30 -30,-40 -42,-30 C-30,-22 -12,-22 0,0 Z" fill="#22c55e" stroke="#15803d" stroke-width="2"/><path d="M0,0 C6,-34 30,-46 44,-36 C30,-26 12,-26 0,0 Z" fill="#4ade80" stroke="#15803d" stroke-width="2"/><line x1="0" y1="0" x2="0" y2="26" stroke="#15803d" stroke-width="4"/></g>';
        const roots = (x, y, c) => '<g transform="translate(' + x + ',' + y + ')" stroke="' + c + '" stroke-width="3" fill="none" stroke-linecap="round"><path d="M0,0 C-8,18 -20,30 -30,52"/><path d="M0,0 C0,22 2,40 0,62"/><path d="M0,0 C8,18 20,30 30,52"/><path d="M-10,22 C-22,28 -30,34 -38,34"/><path d="M10,24 C22,30 32,34 40,32"/></g>';
        const col = (x, title, sub) => '<text x="' + x + '" y="26" font-size="17" font-weight="800" fill="#0f172a" text-anchor="middle">' + title + '</text><text x="' + x + '" y="46" font-size="13" fill="#475569" text-anchor="middle">' + sub + '</text>';
        let s = '<svg viewBox="0 0 860 340" class="bg-svg" role="img" aria-label="Σύγκριση: χώμα, υδροπονία, αεροπονία"><rect width="860" height="340" fill="#f8fafc"/>' +
            '<line x1="287" y1="12" x2="287" y2="330" stroke="#94a3b8" stroke-width="2" stroke-dasharray="6 6"/><line x1="573" y1="12" x2="573" y2="330" stroke="#94a3b8" stroke-width="2" stroke-dasharray="6 6"/>';
        // soil
        s += col(143, 'Χώμα', 'οι ρίζες βρίσκονται στο έδαφος') + '<rect x="40" y="170" width="206" height="130" rx="8" fill="#a16207" stroke="#713f12" stroke-width="3"/><g fill="#854d0e"><circle cx="70" cy="200" r="6"/><circle cx="120" cy="230" r="7"/><circle cx="190" cy="205" r="6"/><circle cx="160" cy="270" r="6"/><circle cx="80" cy="268" r="7"/></g>' + plant(143, 170) + roots(143, 175, '#fde68a');
        s += '<text x="143" y="322" font-size="13" font-weight="700" fill="#0f172a" text-anchor="middle">το χώμα «φέρνει» τα θρεπτικά</text>';
        // hydroponics
        s += col(430, 'Υδροπονία', 'οι ρίζες μέσα σε θρεπτικό διάλυμα') + '<rect x="330" y="200" width="200" height="100" rx="10" fill="#7dd3fc" stroke="#0369a1" stroke-width="3"/><rect x="330" y="166" width="200" height="12" rx="4" fill="#94a3b8"/>' + plant(430, 166) + roots(430, 180, '#fef3c7');
        s += '<g fill="#fff" opacity="0.85"><circle cx="360" cy="270" r="4"/><circle cx="395" cy="285" r="4"/><circle cx="470" cy="270" r="4"/><circle cx="500" cy="285" r="4"/><circle cx="445" cy="290" r="3"/></g><text x="430" y="322" font-size="13" font-weight="700" fill="#0f172a" text-anchor="middle">διάλυμα με ιόντα (άλατα)</text>';
        // aeroponics
        s += col(716, 'Αεροπονία', 'οι ρίζες στον αέρα, με ψεκασμό') + '<rect x="620" y="176" width="192" height="10" rx="4" fill="#94a3b8"/>' + plant(716, 176) + roots(716, 186, '#fef3c7');
        s += '<rect x="640" y="288" width="152" height="22" rx="6" fill="#7dd3fc" stroke="#0369a1" stroke-width="2"/><g fill="#38bdf8"><circle cx="690" cy="262" r="3.5"/><circle cx="706" cy="270" r="3.5"/><circle cx="722" cy="258" r="3.5"/><circle cx="740" cy="268" r="3.5"/><circle cx="702" cy="250" r="3"/><circle cx="730" cy="246" r="3"/><circle cx="716" cy="276" r="3"/></g><path d="M716,288 L716,280" stroke="#0369a1" stroke-width="4"/>';
        s += '<text x="716" y="326" font-size="13" font-weight="700" fill="#0f172a" text-anchor="middle">ομίχλη θρεπτικού διαλύματος</text></svg>';
        return s;
    }

    /* ------------------------------------------------ diagram 2: ions in the nutrient solution */
    function ionsSvg() {
        const ions = [['NO₃⁻', 'νιτρικό', '#2563eb'], ['PO₄³⁻', 'φωσφορικό', '#7c3aed'], ['K⁺', 'κάλιο', '#d97706'], ['Ca²⁺', 'ασβέστιο', '#0f766e'], ['Mg²⁺', 'μαγνήσιο', '#15803d'], ['Fe²⁺', 'σίδηρος', '#b91c1c']];
        let s = '<svg viewBox="0 0 860 300" class="bg-svg" role="img" aria-label="Ιόντα του θρεπτικού διαλύματος που απορροφά η ρίζα"><rect width="860" height="300" fill="#f8fafc"/>' +
            '<rect x="20" y="30" width="460" height="250" rx="16" fill="#bae6fd" stroke="#0369a1" stroke-width="3"/><text x="40" y="58" font-size="16" font-weight="800" fill="#075985">Θρεπτικό διάλυμα (νερό με διαλυμένα άλατα)</text>';
        ions.forEach((q, i) => {
            const x = 70 + (i % 3) * 140, y = 110 + Math.floor(i / 3) * 90;
            s += '<circle cx="' + x + '" cy="' + y + '" r="30" fill="' + q[2] + '" fill-opacity="0.9" stroke="#fff" stroke-width="3"/><text x="' + x + '" y="' + (y + 5) + '" font-size="16" font-weight="800" fill="#fff" text-anchor="middle">' + q[0] + '</text><text x="' + x + '" y="' + (y + 52) + '" font-size="13" font-weight="700" fill="#0f172a" text-anchor="middle">' + q[1] + '</text>';
        });
        s += '<path d="M490,150 L590,150" stroke="#16a34a" stroke-width="6" stroke-linecap="round"/><path d="M578,138 l16,12 l-16,12" fill="none" stroke="#16a34a" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>' +
            '<g transform="translate(700,150)" stroke="#a16207" stroke-width="10" fill="none" stroke-linecap="round"><path d="M-70,0 C-30,0 -20,-40 20,-60"/><path d="M-70,0 C-30,0 -10,20 30,26"/><path d="M-70,0 L10,0"/></g>' +
            '<text x="700" y="250" font-size="15" font-weight="800" fill="#0f172a" text-anchor="middle">ρίζα: απορροφά ιόντα</text><text x="700" y="64" font-size="14" fill="#475569" text-anchor="middle">Τα άλατα διαλύονται σε ιόντα</text><text x="700" y="82" font-size="14" fill="#475569" text-anchor="middle">και τα φυτά παίρνουν τα ιόντα.</text></svg>';
        return s;
    }

    /* ------------------------------------------------ diagram 3: pH control flow (drawn as svg) */
    function phControlSvg() {
        return '<svg viewBox="0 0 860 220" class="bg-svg" role="img" aria-label="Ρύθμιση του pH του θρεπτικού διαλύματος"><rect width="860" height="220" fill="#f8fafc"/>' +
            '<rect x="30" y="70" width="190" height="80" rx="14" fill="#fef3c7" stroke="#b45309" stroke-width="3"/><text x="125" y="104" font-size="16" font-weight="800" fill="#78350f" text-anchor="middle">Μετράμε το pH</text><text x="125" y="128" font-size="13" fill="#78350f" text-anchor="middle">(πεχάμετρο)</text>' +
            '<path d="M222,110 L276,110" stroke="#475569" stroke-width="5"/><path d="M268,100 l12,10 l-12,10" fill="none" stroke="#475569" stroke-width="5" stroke-linejoin="round"/>' +
            '<rect x="280" y="20" width="250" height="70" rx="14" fill="#fee2e2" stroke="#b91c1c" stroke-width="3"/><text x="405" y="50" font-size="15" font-weight="800" fill="#7f1d1d" text-anchor="middle">pH πολύ ψηλό (βασικό)</text><text x="405" y="72" font-size="13.5" fill="#7f1d1d" text-anchor="middle">→ προσθέτουμε λίγο οξύ</text>' +
            '<rect x="280" y="130" width="250" height="70" rx="14" fill="#dbeafe" stroke="#1d4ed8" stroke-width="3"/><text x="405" y="160" font-size="15" font-weight="800" fill="#1e3a8a" text-anchor="middle">pH πολύ χαμηλό (όξινο)</text><text x="405" y="182" font-size="13.5" fill="#1e3a8a" text-anchor="middle">→ προσθέτουμε λίγη βάση</text>' +
            '<path d="M534,55 L590,100" stroke="#475569" stroke-width="4"/><path d="M534,165 L590,120" stroke="#475569" stroke-width="4"/>' +
            '<rect x="594" y="70" width="236" height="80" rx="14" fill="#dcfce7" stroke="#15803d" stroke-width="3"/><text x="712" y="104" font-size="15" font-weight="800" fill="#14532d" text-anchor="middle">Εξουδετέρωση: το pH</text><text x="712" y="126" font-size="15" font-weight="800" fill="#14532d" text-anchor="middle">επανέρχεται στην περιοχή</text><text x="712" y="145" font-size="13" fill="#14532d" text-anchor="middle">που ταιριάζει στα φυτά</text></svg>';
    }

    /* ------------------------------------------------ interactive: nutrient availability vs pH (schematic) */
    const NUTR = [
        ['Άζωτο (νιτρικά)', 5.5, 8.0, '#2563eb'],
        ['Φώσφορος', 6.0, 7.2, '#7c3aed'],
        ['Κάλιο', 5.8, 8.2, '#d97706'],
        ['Ασβέστιο και μαγνήσιο', 6.2, 8.5, '#0f766e'],
        ['Σίδηρος', 4.5, 6.4, '#b91c1c'],
        ['Μαγγάνιο', 4.5, 6.4, '#be185d']
    ];
    function avail(lo, hi, ph) {                       // schematic: full availability between lo and hi, falling off outside
        if (ph >= lo && ph <= hi) return 100;
        const d = ph < lo ? lo - ph : ph - hi;
        return Math.max(8, 100 - d * 45);
    }
    const S_LAB =
        '<p>Ένα φυτό μπορεί να απορροφήσει ένα θρεπτικό μόνο όταν αυτό είναι <strong>διαλυμένο και σε κατάλληλη μορφή</strong>. Το pH του διαλύματος αλλάζει αυτή τη διαθεσιμότητα. Μετακίνησε το pH και δες ποια θρεπτικά είναι εύκολα διαθέσιμα στα φυτά.</p>' +
        '<div class="bt-stage hy-lab" id="hy-lab"><div class="hy-ctl"><label>pH του διαλύματος <input type="range" id="hy-ph" min="4" max="9" step="0.1" value="6"><b id="hy-phv"></b></label><div class="hy-scale"><span style="background:#ef4444">όξινο</span><span style="background:#22c55e">σχεδόν ουδέτερο</span><span style="background:#3b82f6">βασικό</span></div></div>' +
        '<div class="hy-bars" id="hy-bars"></div><div class="hy-msg" id="hy-msg"></div></div>' +
        '<p class="bga-note">Σχηματικό διάγραμμα: οι ακριβείς περιοχές διαφέρουν ανά θρεπτικό, ανά καλλιέργεια και ανά πηγή. Εδώ δίνονται μόνο για να καταλάβεις την ιδέα. Οι καλλιεργητές λένε ότι «για τα περισσότερα φυτά ταιριάζει ένα ελαφρώς όξινο διάλυμα», περίπου pH 5,5–6,5.</p>';

    function initLab(root) {
        const rng = root.querySelector('#hy-ph'); if (!rng) return;
        const bars = root.querySelector('#hy-bars'), msg = root.querySelector('#hy-msg'), val = root.querySelector('#hy-phv');
        bars.innerHTML = NUTR.map((n, i) => '<div class="hy-row"><span class="hy-name">' + n[0] + '</span><div class="hy-track"><i id="hy-b' + i + '" style="background:' + n[3] + '"></i></div><b id="hy-v' + i + '"></b></div>').join('');
        const upd = () => {
            const ph = +rng.value; val.textContent = ph.toFixed(1).replace('.', ',');
            let low = [];
            NUTR.forEach((n, i) => { const a = avail(n[1], n[2], ph); root.querySelector('#hy-b' + i).style.width = a + '%'; root.querySelector('#hy-v' + i).textContent = a >= 99 ? 'καλή' : (a >= 70 ? 'μέτρια' : 'χαμηλή'); if (a < 70) low.push(n[0]); });
            msg.innerHTML = ph >= 5.5 && ph <= 6.5 ? '✅ <strong>Περιοχή που συνήθως ταιριάζει:</strong> τα περισσότερα θρεπτικά είναι διαθέσιμα.' : (ph < 5.5 ? '⚠️ <strong>Πολύ όξινο.</strong> Δυσκολεύονται: ' + (low.join(', ') || '—') + '. Θα χρειαζόταν να ανέβει το pH (προσθήκη λίγης βάσης).' : '⚠️ <strong>Πολύ βασικό.</strong> Δυσκολεύονται: ' + (low.join(', ') || '—') + '. Θα χρειαζόταν να κατέβει το pH (προσθήκη λίγου οξέος).');
        };
        rng.addEventListener('input', upd); upd();
    }

    /* ------------------------------------------------ page */
    const S1 =
        '<div class="bga-box bt-supp"><strong>➕ Όλη η ενότητα <span class="bt-tag">συμπληρωματικό · εκτός βιβλίου · δεν ζητείται</span></strong><p>Η υδροπονία και η αεροπονία είναι τρόποι καλλιέργειας <strong>χωρίς χώμα</strong>. Η Χημεία της Γ΄ Γυμνασίου (διαλύματα, ιόντα, άλατα, pH, εξουδετέρωση) εξηγεί γιατί δουλεύουν. Τα σχέδια είναι δικά μας και σχηματικά. Δεν δίνονται ποσότητες ή οδηγίες για χημικά.</p></div>' +
        '<h4>Τι είναι</h4>' +
        '<div class="bt-stage">' + systemsSvg() + '</div>' +
        ul(['<strong>Υδροπονία:</strong> οι ρίζες βρίσκονται μέσα σε νερό με διαλυμένα θρεπτικά (θρεπτικό διάλυμα).',
            '<strong>Αεροπονία:</strong> οι ρίζες κρέμονται στον αέρα και ψεκάζονται κατά διαστήματα με ομίχλη θρεπτικού διαλύματος.',
            'Και στις δύο, ο καλλιεργητής <strong>ελέγχει ακριβώς τι παίρνει το φυτό</strong>, αντί να το αφήνει στο χώμα.']) +
        '<h4>Τα θρεπτικά είναι ιόντα</h4>' +
        '<p>Τα άλατα που βάζουμε στο νερό (π.χ. νιτρικά, φωσφορικά, άλατα του καλίου, του ασβεστίου και του μαγνησίου) <strong>διαλύονται και διασπώνται σε ιόντα</strong>. Τα φυτά απορροφούν τα ιόντα αυτά από το νερό. Είναι το ίδιο φαινόμενο με τη διάλυση ενός άλατος στο νερό που γνωρίζεις.</p>' +
        '<div class="bt-stage">' + ionsSvg() + '</div>' +
        tbl(['Θρεπτικό ιόν', 'Τι προσφέρει στο φυτό (περίπου)'], [
            ['Νιτρικά (NO₃⁻)', 'άζωτο για τις πρωτεΐνες και την ανάπτυξη των φύλλων'],
            ['Φωσφορικά (PO₄³⁻)', 'ενέργεια και ανάπτυξη ριζών, άνθηση'],
            ['Κάλιο (K⁺)', 'ρύθμιση του νερού και της λειτουργίας των κυττάρων'],
            ['Ασβέστιο (Ca²⁺)', 'στερεότητα των κυττάρων'],
            ['Μαγνήσιο (Mg²⁺)', 'συστατικό της χλωροφύλλης'],
            ['Σίδηρος (Fe²⁺ / Fe³⁺)', 'σχηματισμός χλωροφύλλης']
        ], 'bga-plain') +
        supp('Σύνδεση με τη Βιολογία', '<p>Η χλωροφύλλη και οι πρωτεΐνες των φυτών φτιάχνονται από τα στοιχεία που παίρνουν ως ιόντα: άζωτο, μαγνήσιο, σίδηρο κ.ά. Γι’ αυτό ένα φυτό που δεν έχει αρκετά από αυτά κιτρινίζει ή δεν μεγαλώνει καλά.</p>');

    const S2 =
        '<p>Το <strong>pH</strong> είναι το πιο σημαντικό «ρυθμιστικό κουμπί» ενός θρεπτικού διαλύματος. Δες τι αλλάζει όταν το μετακινείς:</p>' +
        S_LAB +
        '<h4>Πώς το ρυθμίζουν</h4>' +
        '<div class="bt-stage">' + phControlSvg() + '</div>' +
        ul(['Όταν το pH ξεφύγει, προσθέτουν <strong>πολύ μικρή ποσότητα</strong> οξέος ή βάσης, ώστε να επανέλθει στην κατάλληλη περιοχή. Είναι εφαρμογή της <strong>εξουδετέρωσης</strong>.',
            'Το νερό της βρύσης περιέχει συχνά <strong>διττανθρακικά</strong>. Αυτά «αντιστέκονται» στην αλλαγή του pH (ρυθμιστικό διάλυμα). Γι’ αυτό το pH ενός διαλύματος πρέπει να ελέγχεται ξανά και ξανά.',
            'Τα φυτά, καθώς απορροφούν ιόντα, αλλάζουν και το ίδιο το pH του διαλύματος. Έτσι χρειάζεται συνεχής παρακολούθηση.']) +
        box('bga-warn', '⚠️ Προσοχή', '<p>Τα οξέα και οι βάσεις που χρησιμοποιούνται για τη ρύθμιση είναι <strong>επικίνδυνα χημικά</strong>. Δεν χειριζόμαστε τέτοιες ουσίες μόνοι μας: αυτό γίνεται με οδηγίες και προστασία από ενήλικες.</p>') +
        '<h4>Τι μετράμε</h4>' +
        tbl(['Μέτρηση', 'Τι δείχνει', 'Με τι μετριέται'], [
            ['<strong>pH</strong>', 'πόσο όξινο ή βασικό είναι το διάλυμα', 'πεχάμετρο'],
            ['<strong>Αγωγιμότητα</strong>', 'πόσα ιόντα (άλατα) υπάρχουν διαλυμένα: περισσότερα ιόντα, μεγαλύτερη αγωγιμότητα', 'αγωγιμόμετρο']
        ], 'bga-plain') +
        supp('Σύνδεση με τη Φυσική', '<p>Ένα διάλυμα άγει το ρεύμα όσο περισσότερα ιόντα έχει. Η μέτρηση της αγωγιμότητας βασίζεται στην ίδια ιδέα με τον ηλεκτρικό αγωγό που μελετάτε στη Φυσική.</p>');

    const S3 =
        tbl(['', 'Χώμα', 'Υδροπονία', 'Αεροπονία'], [
            ['Πού βρίσκονται οι ρίζες', 'στο έδαφος', 'σε θρεπτικό διάλυμα', 'στον αέρα, με ψεκασμό'],
            ['Έλεγχος των θρεπτικών', 'δύσκολος', '<strong>καλός</strong> (το διάλυμα ρυθμίζεται)', '<strong>πολύ καλός</strong>'],
            ['Χρήση νερού', 'μεγάλη', '<strong>μικρότερη</strong> (το νερό ανακυκλώνεται)', '<strong>πολύ μικρή</strong>'],
            ['Κίνδυνος', 'ασθένειες του εδάφους', 'αν χαλάσει το pH ή η σύνθεση, επηρεάζεται όλο το φυτό', 'αν σταματήσει ο ψεκασμός, οι ρίζες ξεραίνονται γρήγορα'],
            ['Κόστος και εξοπλισμός', 'μικρό', 'μεγαλύτερο', 'μεγαλύτερο']
        ], 'bga-plain') +
        box('bga-info', 'Το συμπέρασμα', '<p>Η υδροπονία και η αεροπονία δεν είναι «μαγεία»: είναι <strong>εφαρμοσμένη Χημεία</strong>. Ο καλλιεργητής ελέγχει ιόντα, pH και αγωγιμότητα, ώστε το φυτό να έχει τα θρεπτικά που χρειάζεται στη μορφή που μπορεί να απορροφήσει.</p>') +
        supp('Για συζήτηση', ul(['Γιατί το pH επηρεάζει το αν ένα θρεπτικό είναι διαθέσιμο στο φυτό;', 'Γιατί χρειάζεται συνεχής έλεγχος του pH σε ένα σύστημα υδροπονίας;', 'Ποια μέτρηση θα σου έδειχνε ότι το διάλυμα έχει «εξαντληθεί» από ιόντα;']));

    function render(mount) {
        const root = K.renderPage(mount, {
            title: '🌱 Υδροπονία και αεροπονία',
            intro: 'Πώς η Χημεία των διαλυμάτων, των ιόντων και του pH επιτρέπει σε φυτά να μεγαλώνουν <strong>χωρίς χώμα</strong>. Η σελίδα είναι <strong>συμπληρωματική</strong> και δεν αποτελεί εξεταστέα ύλη.',
            sections: [
                { id: 'hy1', icon: '🌿', title: '1. Τι είναι και τι θρεπτικά παίρνει το φυτό', nav: 'Τι είναι', sub: 'χώμα · υδροπονία · αεροπονία · ιόντα', body: S1, open: true },
                { id: 'hy2', icon: '🧪', title: '2. Το pH του θρεπτικού διαλύματος', nav: 'Το pH', sub: 'διαδραστικό διάγραμμα · ρύθμιση · μετρήσεις', body: S2 },
                { id: 'hy3', icon: '⚖️', title: '3. Σύγκριση και συμπέρασμα', nav: 'Σύγκριση', sub: 'πλεονεκτήματα και κίνδυνοι', body: S3 }
            ]
        });
        initLab(root);
    }
    return { render };
})();
