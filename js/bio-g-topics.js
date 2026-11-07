/* ==========================================================================
   Biology Γ: "Βαθιά εστίαση & ερμηνεία" (deep focus & interpretation) - special topics.
   Topic 1: stings of bees and wasps (venom, myths about ammonia / urine, first aid).
   SUPPLEMENTARY material (outside the school book, not examined); it connects with the book (proteins, enzymes,
   lipids / cell membranes) and with the Chemistry notion of neutralisation. The diagrams are schematic drawings.
   window.BioGTopics.render(mountElement)
   ========================================================================== */
(function () {
    'use strict';
    const K = window.BioGuideKit;
    const { tbl, ul, box, flow } = K;
    const supp = (title, body) => '<div class="bga-box bt-supp"><strong>➕ ' + title + ' <span class="bt-tag">συμπληρωματικό · εκτός βιβλίου · δεν ζητείται</span></strong>' + body + '</div>';
    const alert = (title, body) => '<div class="bga-box bg-alert"><strong>🚨 ' + title + '</strong>' + body + '</div>';

    /* ------------------------------------------------------------ diagrams (own schematic drawings) */
    function insectsSvg() {
        const bee =
            // wing
            '<ellipse cx="150" cy="86" rx="62" ry="22" transform="rotate(-24 150 86)" fill="#e0f2fe" stroke="#7dd3fc" stroke-width="2" opacity="0.9"/>' +
            // legs
            '<g stroke="#44403c" stroke-width="4" stroke-linecap="round" fill="none"><path d="M118,158 l-14,26 l-10,8"/><path d="M142,162 l-4,30 l-8,6"/><path d="M168,160 l12,28 l8,6"/></g>' +
            // abdomen with stripes
            '<ellipse cx="236" cy="130" rx="76" ry="44" fill="#fbbf24" stroke="#78350f" stroke-width="3"/>' +
            '<path d="M200,92 q-10,38 0,78 M232,87 q-10,43 0,86 M264,92 q-10,38 0,78" fill="none" stroke="#1c1917" stroke-width="9" stroke-linecap="round"/>' +
            // thorax and head
            '<ellipse cx="136" cy="124" rx="40" ry="38" fill="#d6a85c" stroke="#78350f" stroke-width="3"/>' +
            '<circle cx="86" cy="120" r="26" fill="#a16207" stroke="#78350f" stroke-width="3"/><circle cx="76" cy="114" r="6" fill="#1c1917"/>' +
            '<path d="M70,98 q-12,-26 -30,-30 M86,95 q-4,-28 -20,-36" fill="none" stroke="#44403c" stroke-width="3" stroke-linecap="round"/>' +
            // stinger (barbed) at the tip of the abdomen
            '<path d="M310,136 L350,150" stroke="#be123c" stroke-width="5" stroke-linecap="round"/><path d="M330,144 l-3,-9 M338,147 l-3,-9" stroke="#be123c" stroke-width="3" stroke-linecap="round"/>';
        const wasp =
            '<ellipse cx="150" cy="82" rx="58" ry="18" transform="rotate(-20 150 82)" fill="#e0f2fe" stroke="#7dd3fc" stroke-width="2" opacity="0.9"/>' +
            '<g stroke="#1c1917" stroke-width="3.5" stroke-linecap="round" fill="none"><path d="M120,152 l-16,30 l-10,6"/><path d="M142,156 l-2,32 l-8,6"/><path d="M164,154 l14,28 l8,5"/></g>' +
            // narrow waist
            '<path d="M168,128 L202,128" stroke="#1c1917" stroke-width="5" stroke-linecap="round"/>' +
            '<path d="M200,128 C214,92 262,88 304,120 C318,128 322,134 322,134 C300,160 250,176 214,150 C204,144 200,136 200,128 Z" fill="#facc15" stroke="#1c1917" stroke-width="3"/>' +
            '<path d="M222,96 q-6,34 6,64 M252,92 q-6,40 8,76 M282,102 q-4,34 6,56" fill="none" stroke="#1c1917" stroke-width="9" stroke-linecap="round"/>' +
            '<ellipse cx="136" cy="122" rx="34" ry="32" fill="#facc15" stroke="#1c1917" stroke-width="3"/>' +
            '<circle cx="90" cy="118" r="24" fill="#facc15" stroke="#1c1917" stroke-width="3"/><circle cx="80" cy="112" r="6" fill="#1c1917"/>' +
            '<path d="M76,96 q-12,-26 -30,-30 M92,94 q-4,-28 -20,-36" fill="none" stroke="#1c1917" stroke-width="3" stroke-linecap="round"/>' +
            '<path d="M322,134 L362,146" stroke="#be123c" stroke-width="5" stroke-linecap="round"/>';
        const lab = (x, y, tx, ty, text) => '<line x1="' + x + '" y1="' + y + '" x2="' + tx + '" y2="' + (ty + 2) + '" stroke="#0f172a" stroke-width="1.8"/><circle cx="' + x + '" cy="' + y + '" r="4" fill="#0f172a"/><text x="' + tx + '" y="' + ty + '" font-size="17" font-weight="800" fill="#be123c" text-anchor="middle">' + text + '</text>';
        return '<svg viewBox="0 0 860 250" class="bg-svg" role="img" aria-label="Μέλισσα και σφήκα, με τη θέση του κεντριού">' +
            '<rect width="860" height="250" fill="#f8fafc"/>' +
            '<g>' + bee + lab(346, 148, 340, 222, 'κεντρί') + '<text x="190" y="36" font-size="22" font-weight="800" fill="#0f172a" text-anchor="middle">Μέλισσα</text><text x="190" y="58" font-size="14" fill="#475569" text-anchor="middle">χνουδωτό σώμα, φαρδύ κοιλίδιο</text></g>' +
            '<g transform="translate(430,0)">' + wasp + lab(358, 144, 352, 214, 'κεντρί') + '<text x="190" y="36" font-size="22" font-weight="800" fill="#0f172a" text-anchor="middle">Σφήκα</text><text x="190" y="58" font-size="14" fill="#475569" text-anchor="middle">λεπτή «μέση», λείο σώμα</text></g>' +
            '</svg>';
    }

    function stingerSvg() {
        const sac = (x, y) => '<ellipse cx="' + x + '" cy="' + y + '" rx="58" ry="34" fill="#fde68a" stroke="#b45309" stroke-width="3"/><text x="' + x + '" y="' + (y + 2) + '" font-size="14" font-weight="800" fill="#78350f" text-anchor="middle">σάκος</text><text x="' + x + '" y="' + (y + 20) + '" font-size="14" font-weight="800" fill="#78350f" text-anchor="middle">δηλητηρίου</text>';
        return '<svg viewBox="0 0 860 300" class="bg-svg" role="img" aria-label="Αγκιστρωτό και λείο κεντρί">' +
            '<rect width="860" height="300" fill="#f8fafc"/>' +
            // barbed (bee)
            '<g><text x="215" y="34" font-size="20" font-weight="800" fill="#0f172a" text-anchor="middle">Μέλισσα: κεντρί με αγκιστράκια</text>' +
            sac(110, 150) +
            '<path d="M168,150 L340,150" stroke="#be123c" stroke-width="8" stroke-linecap="round"/>' +
            '<g stroke="#be123c" stroke-width="5" stroke-linecap="round"><path d="M200,150 l-14,-16"/><path d="M236,150 l-14,-16"/><path d="M272,150 l-14,-16"/><path d="M308,150 l-14,-16"/><path d="M200,150 l-14,16"/><path d="M236,150 l-14,16"/><path d="M272,150 l-14,16"/><path d="M308,150 l-14,16"/></g>' +
            '<text x="215" y="226" font-size="16" font-weight="700" fill="#0f172a" text-anchor="middle">τα αγκιστράκια πιάνονται στο δέρμα:</text><text x="215" y="248" font-size="16" font-weight="700" fill="#0f172a" text-anchor="middle">το κεντρί συνήθως μένει στο δέρμα</text></g>' +
            // smooth (wasp)
            '<g transform="translate(430,0)"><text x="215" y="34" font-size="20" font-weight="800" fill="#0f172a" text-anchor="middle">Σφήκα, μπάμπουρας: λείο κεντρί</text>' +
            sac(110, 150) +
            '<path d="M168,150 L340,150" stroke="#be123c" stroke-width="8" stroke-linecap="round"/>' +
            '<text x="215" y="226" font-size="16" font-weight="700" fill="#0f172a" text-anchor="middle">βγαίνει εύκολα από το δέρμα:</text><text x="215" y="248" font-size="16" font-weight="700" fill="#0f172a" text-anchor="middle">μπορεί να τσιμπήσει ξανά</text></g>' +
            '</svg>';
    }

    function skinSvg() {
        return '<svg viewBox="0 0 860 380" class="bg-svg" role="img" aria-label="Τομή του δέρματος: πού βρίσκεται το δηλητήριο">' +
            '<rect width="860" height="380" fill="#f8fafc"/>' +
            // layers
            '<rect x="40" y="120" width="780" height="30" fill="#fcd9b6" stroke="#b9772e" stroke-width="2"/>' +
            '<rect x="40" y="150" width="780" height="120" fill="#f9b7a6" stroke="#b9772e" stroke-width="2"/>' +
            '<rect x="40" y="270" width="780" height="70" fill="#fde68a" stroke="#b9772e" stroke-width="2"/>' +
            '<g font-size="17" font-weight="800" fill="#0f172a"><text x="52" y="140">επιδερμίδα</text><text x="52" y="262">χόριο (αγγεία, νεύρα)</text><text x="52" y="310">υποδόριο</text></g>' +
            // vessels and nerve endings in the dermis
            '<path d="M250,190 C300,176 340,214 380,196 S470,176 540,206" fill="none" stroke="#dc2626" stroke-width="7" stroke-linecap="round"/>' +
            '<path d="M250,240 C300,246 340,226 390,238 S480,252 560,232" fill="none" stroke="#2563eb" stroke-width="6" stroke-linecap="round"/>' +
            '<g stroke="#7c3aed" stroke-width="3" fill="none" stroke-linecap="round"><path d="M600,176 l0,-28"/><path d="M640,180 l0,-30"/><path d="M680,176 l0,-26"/></g>' +
            // sting injecting
            '<path d="M410,20 L410,200" stroke="#be123c" stroke-width="9" stroke-linecap="round"/><path d="M410,200 l-6,-18 M410,200 l6,-18" stroke="#be123c" stroke-width="4" stroke-linecap="round"/>' +
            '<g fill="#a16207" stroke="#78350f" stroke-width="2"><circle cx="410" cy="212" r="12"/><circle cx="392" cy="226" r="9"/><circle cx="430" cy="226" r="9"/><circle cx="412" cy="240" r="8"/></g>' +
            '<text x="446" y="214" font-size="17" font-weight="800" fill="#78350f">δηλητήριο μέσα στο χόριο</text>' +
            // something spread on top
            '<g><rect x="560" y="108" width="140" height="12" rx="6" fill="#a7f3d0" stroke="#059669" stroke-width="2"/><text x="630" y="92" font-size="16" font-weight="800" fill="#047857" text-anchor="middle">ό,τι αλείφουμε απ’ έξω</text><path d="M630,98 l0,6" stroke="#047857" stroke-width="2"/>' +
            '<path d="M630,124 l0,14" stroke="#dc2626" stroke-width="4"/><path d="M620,142 l20,0" stroke="#dc2626" stroke-width="4"/><text x="630" y="164" font-size="30" fill="#dc2626" text-anchor="middle" font-weight="900" dy="-2">✕</text></g>' +
            '<text x="430" y="366" font-size="16" font-weight="700" fill="#0f172a" text-anchor="middle">Σαν ένεση: το δηλητήριο μπαίνει βαθιά, εκεί που δεν φτάνει ό,τι αλείφουμε απ’ έξω.</text>' +
            '</svg>';
    }

    function phSvg() {
        const x = (v) => 60 + v * 52;
        const marks = [
            [5.25, 'δηλητήριο μέλισσας', 'περίπου 5–5,5', '#b45309', 0],
            [6, 'ούρα', 'περίπου 6', '#0369a1', 1],
            [8.3, 'μαγειρική σόδα (διάλυμα)', 'περίπου 8', '#0f766e', 2],
            [11.5, 'οικιακή αμμωνία (διάλυμα)', 'περίπου 11–12', '#be123c', 1]
        ];
        const grad = '<defs><linearGradient id="bg-ph" x1="0" x2="1"><stop offset="0" stop-color="#ef4444"/><stop offset="0.25" stop-color="#f59e0b"/><stop offset="0.5" stop-color="#22c55e"/><stop offset="0.75" stop-color="#3b82f6"/><stop offset="1" stop-color="#7c3aed"/></linearGradient></defs>';
        let s = '<svg viewBox="0 0 860 300" class="bg-svg" role="img" aria-label="Κλίμακα pH">' + grad + '<rect width="860" height="300" fill="#f8fafc"/>' +
            '<rect x="60" y="100" width="728" height="30" rx="8" fill="url(#bg-ph)" stroke="#334155" stroke-width="2"/>';
        for (let v = 0; v <= 14; v++) s += '<line x1="' + x(v) + '" y1="130" x2="' + x(v) + '" y2="138" stroke="#334155" stroke-width="2"/><text x="' + x(v) + '" y="156" font-size="15" font-weight="700" fill="#0f172a" text-anchor="middle">' + v + '</text>';
        s += '<text x="60" y="88" font-size="16" font-weight="800" fill="#b91c1c">όξινο</text><text x="424" y="88" font-size="16" font-weight="800" fill="#15803d" text-anchor="middle">ουδέτερο (7)</text><text x="788" y="88" font-size="16" font-weight="800" fill="#6d28d9" text-anchor="end">βασικό</text>';
        marks.forEach((m) => {
            const px = x(m[0]), ty = m[4] === 2 ? 268 : (m[4] ? 206 : 38);
            s += '<line x1="' + px + '" y1="' + (m[4] ? 134 : 98) + '" x2="' + px + '" y2="' + (m[4] === 2 ? 250 : (m[4] ? 190 : 52)) + '" stroke="' + m[3] + '" stroke-width="3"/><circle cx="' + px + '" cy="' + (m[4] ? 134 : 98) + '" r="6" fill="' + m[3] + '"/>' +
                '<text x="' + px + '" y="' + ty + '" font-size="15" font-weight="800" fill="' + m[3] + '" text-anchor="middle">' + m[1] + '</text><text x="' + px + '" y="' + (ty + (m[4] ? 17 : -17)) + '" font-size="13" fill="#475569" text-anchor="middle">' + m[2] + '</text>';
        });
        return s + '</svg>';
    }

    /* ------------------------------------------------------------ section 1 */
    const S1 =
        box('bga-key', '❓ Το ερώτημα', '<p>Πολλοί πιστεύουν ότι σε τσίμπημα μέλισσας πρέπει να ρίξουμε <strong>αμμωνία</strong> (ή να ουρήσουμε πάνω του). Στη Χημεία της Γ΄ τάξης μάθαμε ότι <em>οξύ + βάση → άλας + νερό</em> (εξουδετέρωση). Λειτουργεί όμως αυτό σε ένα τσίμπημα;</p>') +
        '<h4>Πού βρίσκεται το κεντρί;</h4>' +
        '<p>Μόνο τα <strong>θηλυκά</strong> έντομα της ομάδας αυτής έχουν κεντρί. Βρίσκεται στο <strong>άκρο της κοιλιάς</strong>, και είναι συνδεδεμένο με έναν <strong>σάκο δηλητηρίου</strong>.</p>' +
        '<div class="bt-stage">' + insectsSvg() + '</div>' +
        '<div class="bt-stage">' + stingerSvg() + '</div>' +
        '<p class="bga-note">Σχηματικά σχέδια (όχι ανατομικά ακριβή). Αν θέλεις πραγματικές φωτογραφίες ή τομές με ονομασίες, στείλε μου αρχεία με σαφή άδεια χρήσης.</p>' +
        '<h4>Ο μύθος και γιατί είναι λάθος</h4>' +
        tbl(['Ο μύθος', 'Τι ισχύει'], [
            ['«Το δηλητήριο της μέλισσας είναι όξινο, άρα το εξουδετερώνουμε με βάση (αμμωνία, σόδα).»', 'Το δηλητήριο της μέλισσας είναι <strong>ελαφρώς όξινο</strong> (pH περίπου 5–5,5), αλλά ο πόνος και το πρήξιμο <strong>δεν οφείλονται στην οξύτητα</strong>. Οφείλονται σε <strong>πρωτεΐνες και ένζυμα</strong>.'],
            ['«Το δηλητήριο της σφήκας είναι βασικό, άρα χρειάζεται οξύ (ξίδι).»', 'Επίσης λανθασμένο: και εδώ δεν παίζει ρόλο το pH. Δεν αντιμετωπίζεται με οξύ ή βάση.'],
            ['«Τα ούρα (λόγω της αμμωνίας τους) ανακουφίζουν.»', 'Τα ούρα είναι συνήθως ελαφρώς όξινα (pH περίπου 6), περιέχουν κυρίως <strong>ουρία</strong> και ελάχιστη ελεύθερη αμμωνία, και <strong>δεν είναι καθαρά για πληγή</strong>: αυξάνουν τον κίνδυνο μόλυνσης.'],
            ['«Η αμμωνία βοηθά.»', 'Η αμμωνία είναι <strong>ισχυρή χημική ουσία</strong>: μπορεί να προκαλέσει <strong>χημικό έγκαυμα</strong> και ερεθισμό στο ήδη πληγωμένο δέρμα.']
        ], 'bga-plain') +
        '<div class="bt-stage">' + phSvg() + '</div>' +
        '<p class="bga-note">Ενδεικτικές τιμές pH, για εικόνα της κλίμακας. Η διαφορά του δηλητηρίου από το ουδέτερο είναι πολύ μικρή σε σχέση με ό,τι θα έβαζε κανείς πάνω στο δέρμα.</p>' +
        '<h4>Γιατί δεν δουλεύει η «εξουδετέρωση»</h4>' +
        '<div class="bt-stage">' + skinSvg() + '</div>' +
        ul(['<strong>Το δηλητήριο είναι βαθιά.</strong> Το κεντρί λειτουργεί σαν υποδόρια ένεση και βάζει το δηλητήριο κάτω από την επιδερμίδα, μέσα στο χόριο. Ό,τι αλείψουμε στην επιφάνεια δεν φτάνει εκεί αρκετά γρήγορα ούτε αρκετά βαθιά.',
            '<strong>Δεν είναι θέμα pH.</strong> Ο πόνος και η φλεγμονή οφείλονται σε <strong>πρωτεΐνες και ένζυμα</strong>, που ένα ήπιο οξύ ή μια βάση δεν απενεργοποιεί.',
            'Συνδέεται με αυτά που ξέρουμε από το βιβλίο της Βιολογίας: οι <strong>πρωτεΐνες</strong> και τα <strong>ένζυμα</strong> (§1.1) και η <strong>πλασματική μεμβράνη</strong> που δομείται από λιπίδια και πρωτεΐνες (§1.2).']) +
        '<h4>Τι περιέχει το δηλητήριο της μέλισσας (συνοπτικά)</h4>' +
        tbl(['Συστατικό', 'Τι κάνει'], [
            ['<strong>Μελιττίνη</strong> (πρωτεΐνη)', 'Καταστρέφει τις <strong>κυτταρικές μεμβράνες</strong> και ενεργοποιεί τους υποδοχείς του πόνου.'],
            ['<strong>Φωσφολιπάση Α₂</strong> (ένζυμο)', 'Διαλύει τα <strong>φωσφολιπίδια</strong> των κυττάρων: προκαλεί φλεγμονή και βλάβη στους ιστούς.'],
            ['<strong>Υαλουρονιδάση</strong> (ένζυμο)', 'Σπάει την «κολλητική ουσία» ανάμεσα στα κύτταρα και βοηθά το δηλητήριο να <strong>εξαπλωθεί</strong>.'],
            ['<strong>Ισταμίνη</strong>', 'Διαστέλλει τα αγγεία: <strong>ερυθρότητα, πρήξιμο, φαγούρα</strong>. Ο οργανισμός την απελευθερώνει και ως αντίδραση στο δηλητήριο.']
        ], 'bga-plain') +
        '<h4>Πρώτες βοήθειες: τι κάνουμε</h4>' +
        flow(['1. Βγάζουμε γρήγορα το κεντρί', '2. Πλένουμε με νερό και σαπούνι', '3. Βάζουμε κρύο', '4. Ανακουφίζουμε τα συμπτώματα']) +
        ol([
            '<strong>Αφαιρούμε το κεντρί άμεσα</strong> (μέσα σε δευτερόλεπτα). Η μέλισσα αφήνει πίσω το κεντρί μαζί με τον αδένα δηλητηρίου, που <strong>συνεχίζει να συσπάται και να εγχέει δηλητήριο</strong> για περίπου ένα λεπτό ή και περισσότερο. Το <strong>ξύνουμε</strong> με το νύχι, μια πιστωτική κάρτα ή μαχαίρι βουτύρου. <strong>Δεν πιέζουμε</strong> τον σάκο με λαβίδα ή δάχτυλα, γιατί θα πιέσουμε και άλλο δηλητήριο μέσα στο δέρμα.',
            '<strong>Πλένουμε</strong> με νερό και σαπούνι: καθαρίζει την περιοχή και μειώνει τον κίνδυνο μόλυνσης.',
            '<strong>Κρύο επίθεμα</strong> (πάγος σε πανί, όχι απευθείας στο δέρμα) για <strong>10–15 λεπτά</strong>: στενεύει τα αγγεία, μουδιάζει τον πόνο και περιορίζει το πρήξιμο.',
            '<strong>Ανακούφιση:</strong> οι αντιισταμινικές ή οι ήπιες κρέμες υδροκορτιζόνης (αγοράζονται από το φαρμακείο) μειώνουν τη φαγούρα και τη φλεγμονή. Για τον πόνο υπάρχουν απλά παυσίπονα. <strong>Φάρμακα παίρνουμε μόνο με την οδηγία ενήλικα, φαρμακοποιού ή γιατρού</strong> (οι δόσεις εξαρτώνται από την ηλικία και το βάρος).'
        ]) +
        alert('Κόκκινος συναγερμός: σοβαρή αλλεργική αντίδραση (αναφυλαξία)',
            '<p>Καλούμε <strong>αμέσως το 166 (ΕΚΑΒ) ή το 112</strong> αν εμφανιστεί κάτι από τα παρακάτω, ακόμη και λίγα λεπτά μετά το τσίμπημα:</p>' +
            ul(['δυσκολία στην αναπνοή ή συριγμός,', 'πρήξιμο στα χείλη, στη γλώσσα ή στον λαιμό,', 'ζάλη, αδυναμία, τάση για λιποθυμία,', 'εξάνθημα σε όλο το σώμα, ναυτία ή εμετός.']) +
            '<p>Όποιος έχει διαγνωσμένη αλλεργία και φέρει <strong>αυτόματο εγχυτή αδρεναλίνης</strong>, τον χρησιμοποιεί <strong>σύμφωνα με τις οδηγίες του γιατρού του</strong>. Ο παθών δεν πρέπει να μείνει μόνος του.</p>') +
        '<h4>Σφήκες, σκούρκοι (σερσέγκια) και μπάμπουρες</h4>' +
        tbl(['', 'Μέλισσα', 'Κοινή σφήκα', 'Σκούρκος / σερσέγκι (Vespa)', 'Μπάμπουρας (Bombus)'], [
            ['Κεντρί', 'Με <strong>αγκιστράκια</strong>', '<strong>Λείο</strong>', 'Λείο, μεγαλύτερο και παχύτερο', '<strong>Λείο</strong>'],
            ['Μένει στο δέρμα;', 'Συνήθως <strong>ναι</strong> (με τον σάκο δηλητηρίου)', '<strong>Όχι</strong>', '<strong>Όχι</strong>', 'Σπάνια ή καθόλου'],
            ['Πολλά τσιμπήματα;', 'Συνήθως ένα (η μέλισσα συνήθως πεθαίνει)', '<strong>Ναι</strong>, διαδοχικά', '<strong>Ναι</strong>', 'Ναι, αλλά σπάνια τσιμπά'],
            ['Ιδιαιτερότητα', 'Η μελιττίνη είναι το βασικό συστατικό', '—', 'Μεγαλύτερος όγκος δηλητηρίου· περιέχει και <strong>ακετυλοχολίνη</strong> (νευροδιαβιβαστής): το τσίμπημα είναι συχνά πολύ οδυνηρό', 'Πολύ ήρεμος: τσιμπά μόνο αν πατηθεί ή απειληθεί η φωλιά του'],
            ['Τι κάνουμε', 'Βγάζουμε το κεντρί, μετά πλύσιμο και κρύο', 'Δεν ψάχνουμε κεντρί: πλύσιμο και κρύο', 'Δεν ψάχνουμε κεντρί: πλύσιμο και κρύο', 'Δεν ψάχνουμε κεντρί: πλύσιμο και κρύο']
        ], 'bga-plain') +
        box('bga-info', 'Συμπέρασμα',
            '<p>Για κανένα από αυτά τα έντομα δεν έχει νόημα η χρήση <strong>οξέων, βάσεων ή ούρων</strong>. Αυτό που βοηθά είναι: <strong>βγάζουμε το κεντρί (αν υπάρχει), πλένουμε, βάζουμε κρύο, και προσέχουμε για σημάδια αλλεργίας</strong>.</p>') +
        supp('Για συζήτηση', ul(['Γιατί η ιδέα της «εξουδετέρωσης» ακούγεται λογική στη Χημεία, αλλά δεν ταιριάζει εδώ;', 'Τι πρέπει να ξέρει ένας μαθητής για να μην πέσει σε παρόμοιους μύθους (π.χ. τι μας λέει το pH και τι όχι);']));

    function ol(items) { return '<ol class="bga-list">' + items.map(i => '<li>' + i + '</li>').join('') + '</ol>'; }

    function render(mount) {
        K.renderPage(mount, {
            title: '🐝 Βαθιά εστίαση & ερμηνεία',
            intro: 'Θέματα που συνδέουν τη Βιολογία και τη Χημεία με την καθημερινή ζωή. Τα θέματα αυτά είναι <strong>συμπληρωματικά</strong> και δεν αποτελούν εξεταστέα ύλη.',
            sections: [
                { id: 'bg1', icon: '🐝', title: '1. Τσιμπήματα μέλισσας και σφήκας: μύθοι και πρώτες βοήθειες', nav: 'Τσιμπήματα μέλισσας και σφήκας', sub: 'δηλητήριο · μύθος της αμμωνίας και των ούρων · πρώτες βοήθειες', body: S1, open: true }
            ]
        });
    }

    window.BioGTopics = { render };
})();
