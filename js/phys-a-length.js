/* ==========================================================================
   Physics Α: «Μέτρηση μήκους» (based on the ΕΚΦΕ Νέας Ιωνίας support material, slides 1-15)
   page 1: concepts, accuracy of the instrument, common errors (photos), parallax, conclusions
   page 2: the numerical example (10 measurements of the length of a desk: 118,9 cm)
   window.PhysALength.render(mountElement)
   ========================================================================== */
(function () {
    'use strict';

    const IMG = 'assets/images/physA/length_errors.jpg';
    const LEN = [118.8, 118.9, 119.5, 118.7, 118.7, 118.8, 118.9, 119.0, 119.1, 118.7];

    function nf(x, d) { return x.toFixed(d).replace('.', ','); }

    /* ---------------------------------------------------------------- own diagrams */
    function parallaxSvg() {
        const ticks = (() => { let s = ''; for (let i = 0; i <= 14; i++) { const x = 90 + i * 30; s += '<line x1="' + x + '" y1="170" x2="' + x + '" y2="' + (i % 5 === 0 ? 186 : 180) + '" class="pl-tick"/>'; if (i % 5 === 0) s += '<text x="' + x + '" y="204" text-anchor="middle" class="pl-num">' + (i / 5 + 4) + '</text>'; } return s; })();
        return '<svg viewBox="0 0 640 250" class="pm-svg" role="img" aria-label="Σφάλμα παράλλαξης: λοξή ματιά δίνει διαφορετική ένδειξη">' +
            '<defs><marker id="pl-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="10" markerHeight="10" markerUnits="userSpaceOnUse" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill="#fbbf24"/></marker></defs>' +
            '<rect x="70" y="150" width="480" height="32" rx="3" class="pl-ruler"/>' + ticks +
            /* object whose edge is measured: its tip is 14 px above the scale (thickness of the ruler) */
            '<rect x="250" y="104" width="12" height="46" class="pl-obj"/><text x="240" y="138" text-anchor="end" class="pl-lbl">άκρο του αντικειμένου</text>' +
            /* correct: eye straight above */
            '<line x1="256" y1="20" x2="256" y2="150" class="pl-ok" marker-end="url(#pl-a)"/>' +
            '<circle cx="256" cy="14" r="9" class="pl-eye"/><text x="272" y="22" class="pl-oktxt">✔ από πάνω, κάθετα: σωστή ένδειξη</text>' +
            /* wrong: eye from the left, sight line crosses the scale further to the right */
            '<line x1="90" y1="40" x2="313" y2="150" class="pl-bad" marker-end="url(#pl-a)"/>' +
            '<circle cx="82" cy="36" r="9" class="pl-eye"/>' +
            '<circle cx="313" cy="150" r="4.5" class="pl-pt"/><text x="330" y="132" class="pl-badtxt">✖ λοξά: διαβάζουμε άλλη ένδειξη</text>' +
            '<text x="320" y="240" text-anchor="middle" class="pm-s-n">Όταν το σημείο και η κλίμακα δεν βρίσκονται στο ίδιο επίπεδο και κοιτάμε λοξά, η ένδειξη αλλάζει.</text></svg>';
    }

    function dotPlot(vals, mean) {
        const lo = 118.6, hi = 119.6, W = 640, L = 30, R = W - 30;
        const cnt = {}; let mx = 1;
        vals.forEach(v => { const k = Math.round(v * 10); cnt[k] = (cnt[k] || 0) + 1; if (cnt[k] > mx) mx = cnt[k]; });
        const H = 80 + 22 * mx, y0 = H - 42;
        const X = v => L + (v - lo) / (hi - lo) * (R - L);
        let s = '<svg viewBox="0 0 ' + W + ' ' + H + '" class="pe-svg" role="img" aria-label="Οι 10 μετρήσεις του μήκους του θρανίου">';
        s += '<line x1="' + L + '" y1="' + y0 + '" x2="' + R + '" y2="' + y0 + '" class="pe-axis"/>';
        for (let k = 0; k <= 10; k++) { const v = lo + k * 0.1, x = X(v); s += '<line x1="' + x + '" y1="' + y0 + '" x2="' + x + '" y2="' + (y0 + 6) + '" class="pe-axis"/><text x="' + x + '" y="' + (y0 + 26) + '" text-anchor="middle" class="pe-tick">' + nf(v, 1) + '</text>'; }
        const st = {};
        vals.forEach(v => { const k = Math.round(v * 10); st[k] = (st[k] || 0) + 1; s += '<circle cx="' + X(v) + '" cy="' + (y0 - 12 - (st[k] - 1) * 22) + '" r="9" class="pe-dot"/>'; });
        if (isFinite(mean)) s += '<line x1="' + X(mean) + '" y1="8" x2="' + X(mean) + '" y2="' + y0 + '" class="pe-mean"/><text x="' + (X(mean) + 6) + '" y="20" class="pe-meant">μέση τιμή ' + nf(mean, 2) + ' cm</text>';
        return s + '</svg>';
    }

    /* ---------------------------------------------------------------- zoom viewer (images and svg) */
    function openZoom(box) {
        const src = box.querySelector('svg') || box.querySelector('img');
        if (!src) return;
        const ov = document.createElement('div');
        ov.className = 'pm-lb';
        ov.innerHTML = '<div class="pm-lb-bar"><button type="button" data-z="out">− Σμίκρυνση</button><button type="button" data-z="in">+ Μεγέθυνση</button><button type="button" data-z="fit">⤢ Προσαρμογή</button><button type="button" data-z="close">✕ Κλείσιμο</button></div><div class="pm-lb-body"></div>';
        const body = ov.querySelector('.pm-lb-body');
        const big = src.cloneNode(true);
        big.className = '';
        big.classList.add('pm-lb-svg');
        body.appendChild(big);
        let z = 1;
        const apply = () => { big.style.width = (z * 100) + '%'; };
        const onKey = e => { if (e.key === 'Escape') close(); else if (e.key === '+') { z = Math.min(4, z + 0.25); apply(); } else if (e.key === '-') { z = Math.max(0.5, z - 0.25); apply(); } };
        function close() { document.removeEventListener('keydown', onKey); ov.remove(); }
        ov.addEventListener('click', e => {
            const b = e.target.closest('[data-z]');
            if (b) {
                const a = b.dataset.z;
                if (a === 'close') close();
                else if (a === 'in') z = Math.min(4, z + 0.25);
                else if (a === 'out') z = Math.max(0.5, z - 0.25);
                else z = 1;
                apply();
            } else if (e.target === ov || e.target === body) close();
        });
        document.addEventListener('keydown', onKey);
        document.body.appendChild(ov);
        apply();
    }
    const HINT = '<div class="pm-zoomhint">🔍 Πατήστε για μεγέθυνση</div>';

    /* ---------------------------------------------------------------- page 1 */
    const ERRS = [
        ['1', 'Η αρχή της μετροταινίας (το 0) δεν συμπίπτει με την αρχή της μετρούμενης απόστασης', 'Φωτογραφίες 2 και 6', 'Αν το 0 δεν είναι στην άκρη του αντικειμένου, όλες οι ενδείξεις μετατοπίζονται και η μέτρηση βγαίνει μεγαλύτερη ή μικρότερη από την πραγματική.'],
        ['2', 'Η μετροταινία συστρέφεται', 'Φωτογραφία 7', 'Όταν η ταινία στρίβει πάνω στον εαυτό της, το μήκος που διαβάζουμε δεν αντιστοιχεί στην πραγματική απόσταση των δύο σημείων.'],
        ['3', 'Η μετροταινία δεν ακολουθεί ευθεία και παράλληλη προς τη μετρούμενη απόσταση γραμμή', 'Φωτογραφία 5', 'Μια λοξή ταινία μετρά μεγαλύτερο μήκος από το πραγματικό. Η ταινία πρέπει να είναι τεντωμένη και παράλληλη στην πλευρά που μετράμε.'],
        ['4', 'Η ένδειξη της μετροταινίας που εκλαμβάνεται ως τιμή της μέτρησης δεν συμπίπτει με το τέλος της μετρούμενης απόστασης', 'Φωτογραφία 1', 'Η τιμή πρέπει να διαβάζεται ακριβώς στο σημείο όπου τελειώνει το αντικείμενο, όχι σε κάποια γειτονική χαραγή.'],
        ['5', 'Παρεμβάλλεται άλλο αντικείμενο', 'Φωτογραφία 3', 'Ό,τι μπαίνει ανάμεσα στην ταινία και το αντικείμενο (εδώ ένα μολύβι) εμποδίζει την ταινία να ακουμπά σωστά και αλλοιώνει τη μέτρηση.']
    ];

    function page1() {
        let errs = '';
        ERRS.forEach(e => { errs += '<div class="pl-err"><div class="pl-err-n">' + e[0] + '</div><div><strong>' + e[1] + '</strong> <span class="pl-ph">(' + e[2] + ')</span><p>' + e[3] + '</p></div></div>'; });
        return '' +
        '<div class="pa-wrap">' +
        '<header class="pa-head"><div class="pa-kicker">Φυσική Α΄ Γυμνασίου · Μέτρηση μήκους</div>' +
        '<h2>📏 Μετρήσεις μήκους: πώς μετράμε σωστά</h2>' +
        '<p>Τι σημαίνει μέτρηση, πόσο ακριβής μπορεί να είναι, ποια είναι τα συνηθισμένα λάθη και γιατί επαναλαμβάνουμε τη μέτρηση και παίρνουμε τη <strong>μέση τιμή</strong>. Το υλικό βασίζεται στο υποστηρικτικό υλικό του ΕΚΦΕ Νέας Ιωνίας.</p>' +
        '<div class="pa-exlink"><button type="button" class="pa-btn pa-btn-main" data-act="example">🔬 Δείτε το σε ένα απτό παράδειγμα: το μήκος ενός θρανίου, 10 μετρήσεις →</button>' +
        ' <button type="button" class="pa-btn pa-btn-main" data-act="tool">🧮 Δοκιμάστε με δικές σας μετρήσεις →</button></div></header>' +

        '<section class="pa-card"><h3><span class="pa-num">1</span> Τι είναι μέτρηση και τι είναι μήκος</h3>' +
        '<div class="pa-two"><div class="pa-box pa-a"><h4>Μέτρηση</h4><p>Είναι η σύγκριση ενός μεγέθους με ένα άλλο ομοειδές, το οποίο θεωρούμε ως <strong>μονάδα μέτρησης</strong>. Για να συγκρίνουμε, π.χ., το ύψος δύο μαθητών από διαφορετικές χώρες, χρειαζόμαστε ένα μέτρο σύγκρισης <strong>διεθνώς αναγνωρισμένο</strong>.</p></div>' +
        '<div class="pa-box pa-b"><h4>Μήκος</h4><p>Όταν η λέξη μήκος αναφέρεται σε ένα αντικείμενο (π.χ. ένα μολύβι), σημαίνει «η <strong>απόσταση δύο σημείων</strong> του». Η μεγαλύτερη οριζόντια διάσταση λέγεται μήκος, η άλλη οριζόντια πλάτος και η κατακόρυφη ύψος.</p></div></div>' +
        '<p>Στη Φυσική και στην καθημερινότητα χρησιμοποιούμε ως μονάδα μήκους το <strong>1 μέτρο (1 m)</strong> και μετράμε με μετροταινία ή χάρακα. Το «μέτρο» είναι η μονάδα· η «μετροταινία» είναι το όργανο.</p>' +
        '<p class="pa-small">Το μέτρο καθιερώθηκε το 1791 ώστε να υπάρχει διεθνώς κοινός τρόπος μέτρησης. Από το 1983 ορίζεται ως η απόσταση που διανύει το φως στο κενό σε χρόνο 1/299.792.458 του δευτερολέπτου.</p></section>' +

        '<section class="pa-card"><h3><span class="pa-num">2</span> Ακρίβεια του οργάνου</h3>' +
        '<p>Η ακρίβεια ενός οργάνου προσδιορίζεται από τη <strong>μικρότερη υποδιαίρεση</strong> της κλίμακας μέτρησής του. Κανένα όργανο δεν είναι απολύτως ακριβές: η ακρίβεια κάθε μέτρησης περιορίζεται από την ακρίβεια του οργάνου.</p>' +
        '<div class="pa-two"><div class="pa-box"><h4>Όργανο με ακρίβεια 0,1 cm</h4><div class="pa-big">15,9 cm</div><p>Το μήκος του μολυβιού γράφεται με ένα δεκαδικό ψηφίο.</p></div>' +
        '<div class="pa-box"><h4>Όργανο με ακρίβεια 1 cm</h4><div class="pa-big">16 cm</div><p>Το ίδιο μολύβι γράφεται ως ακέραιος αριθμός.</p></div></div>' +
        '<p class="pa-key">Η μέτρηση ενός φυσικού μεγέθους με το ίδιο όργανο έχει πάντα τον ίδιο αριθμό δεκαδικών ψηφίων, τα οποία πρέπει να αναγράφονται, αφού καθορίζουν και την ακρίβεια της μέτρησης. (Με τον ίδιο τρόπο η μέτρηση του χρόνου: 14 s και 14,27 s.)</p></section>' +

        '<section class="pa-card"><h3><span class="pa-num">3</span> Τα συνηθισμένα λάθη στη μέτρηση με μετροταινία</h3>' +
        '<p>Μέτρηση του μήκους ενός βιβλίου με μετροταινία. Στις φωτογραφίες φαίνονται τα συνηθισμένα <strong>σφάλματα μεθόδου μέτρησης</strong>:</p>' +
        '<div class="pm-svgbox" data-zoom="1"><img class="pl-photo" src="' + IMG + '" alt="Επτά φωτογραφίες μέτρησης του μήκους ενός βιβλίου με μετροταινία και τα συνηθισμένα λάθη" loading="lazy">' + HINT + '</div>' +
        '<div class="pl-errs">' + errs + '</div>' +
        '<div class="pa-rule"><strong>Σωστή μέθοδος:</strong> (1) η αρχή της μετροταινίας (το 0) να συμπίπτει με την αρχή της μετρούμενης απόστασης, (2) η μετροταινία να μη συστρέφεται, (3) να ακολουθεί ευθεία και παράλληλη προς τη μετρούμενη απόσταση γραμμή, (4) η ένδειξη που εκλαμβάνεται ως τιμή της μέτρησης να συμπίπτει με το τέλος της μετρούμενης απόστασης.</div></section>' +

        '<section class="pa-card"><h3><span class="pa-num">4</span> Το σφάλμα παράλλαξης: πού κοιτάμε</h3>' +
        '<p>Ακόμα κι όταν η μετροταινία είναι σωστά τοποθετημένη, η ένδειξη εξαρτάται από <strong>τη θέση του ματιού μας</strong>. Το άκρο του αντικειμένου και η κλίμακα δεν βρίσκονται ακριβώς στο ίδιο επίπεδο (η μετροταινία έχει μικρό πάχος), οπότε αν κοιτάμε λοξά, η γραμμή όρασης συναντά την κλίμακα σε άλλο σημείο και διαβάζουμε <strong>λάθος ένδειξη</strong>. Αυτό λέγεται <strong>σφάλμα παράλλαξης</strong>.</p>' +
        '<div class="pm-svgbox" data-zoom="1">' + parallaxSvg() + HINT + '</div>' +
        '<ul class="pm-list"><li>Κοιτάμε <strong>κάθετα από πάνω</strong>, με το μάτι ακριβώς πάνω από το σημείο που διαβάζουμε.</li><li>Πλησιάζουμε το αντικείμενο όσο γίνεται στην κλίμακα και διαβάζουμε στο ίδιο σημείο κάθε φορά.</li><li>Αν διαβάζει άλλος μαθητής από άλλη γωνία, μπορεί να βρει άλλη τιμή: ένας ακόμα λόγος που επαναλαμβάνουμε τη μέτρηση.</li></ul>' +
        '<p class="pa-small">Η ενότητα για την παράλλαξη είναι δική μας προσθήκη στην παρουσίαση του ΕΚΦΕ, για να ολοκληρωθεί το θέμα των λαθών ανάγνωσης.</p></section>' +

        '<section class="pa-card"><h3><span class="pa-num">5</span> Μια μέτρηση δεν αρκεί: η μέση τιμή</h3>' +
        '<p>Μία μέτρηση δεν είναι «αλάνθαστη»: σε κάθε μέτρηση υπάρχουν μικρές αποκλίσεις. Γι\' αυτό <strong>επαναλαμβάνουμε</strong> τη μέτρηση πολλές φορές και υπολογίζουμε τη <strong>μέση τιμή</strong>, που στη γλώσσα των μαθηματικών είναι η πιθανότερη τιμή. Έτσι οι αποκλίσεις εξομαλύνονται.</p>' +
        '<p>Στο παράδειγμα με το θρανίο, το άθροισμα των 10 μετρήσεων είναι 1189,1 cm και η μέση τιμή 1189,1 ÷ 10 = 118,91 cm, που <strong>στρογγυλοποιείται στο ένα δεκαδικό ψηφίο</strong> του οργάνου: <strong>118,9 cm</strong>.</p>' +
        '<p><button type="button" class="pa-btn pa-btn-main" data-act="example">🔬 Δείτε το παράδειγμα με τις 10 μετρήσεις →</button> <button type="button" class="pa-btn pa-btn-main" data-act="tool">🧮 Δοκιμάστε με δικές σας μετρήσεις →</button></p></section>' +

        '<section class="pa-card"><h3><span class="pa-num">6</span> Συμπεραίνω και καταγράφω</h3>' +
        '<div class="pa-grid">' +
        '<div class="pa-point"><div class="pa-ico">🔁</div><h4>Επαναληψιμότητα της μεθόδου</h4><p>Η διεξαγωγή πολλών μετρήσεων και ο υπολογισμός της μέσης τιμής τους, ώστε να εξομαλύνονται πιθανά λάθη και να υπολογίζουμε μια τιμή πιο κοντά στην πραγματική.</p></div>' +
        '<div class="pa-point"><div class="pa-ico">✅</div><h4>Ορθότητα της μεθόδου</h4><p>Το 0 στην αρχή της απόστασης, μετροταινία χωρίς συστροφές, ευθεία και παράλληλη, ένδειξη στο τέλος της απόστασης (και, για την ανάγνωση, κάθετη ματιά).</p></div>' +
        '<div class="pa-point"><div class="pa-ico">🎯</div><h4>Ακρίβεια της μέτρησης</h4><p>Το αποτέλεσμα γράφεται με την ακρίβεια του οργάνου, δηλαδή με τον ίδιο αριθμό δεκαδικών ψηφίων με τις μετρήσεις.</p></div></div></section>' +
        '</div>';
    }

    /* ---------------------------------------------------------------- page 2 (numerical example) */
    function page2() {
        let rows = '';
        for (let i = 0; i < 10; i++) rows += '<tr><td>' + (i + 1) + '</td><td><input class="pe-in" data-i="' + i + '" value="' + nf(LEN[i], 1) + '" inputmode="decimal"></td></tr>';
        return '' +
        '<div class="pa-wrap">' +
        '<header class="pa-head"><div class="pa-kicker">Φυσική Α΄ Γυμνασίου · Μέτρηση μήκους · Απτό παράδειγμα</div>' +
        '<h2>🔬 Το μήκος ενός θρανίου: από 10 μετρήσεις σε μία τιμή</h2>' +
        '<p>Μέτρηση του μήκους ενός θρανίου με μετροταινία, 10 φορές. Δοκιμάστε να αλλάξετε τιμές και δείτε πώς αλλάζει το αποτέλεσμα.</p>' +
        '<div class="pa-tools"><button type="button" class="pa-btn" data-act="back">⬅ Πίσω στη μέτρηση μήκους</button><button type="button" class="pa-btn" data-act="reset-ex">↺ Αρχικές τιμές</button></div></header>' +
        '<section class="pa-card"><h3><span class="pa-num">1</span> Οι μετρήσεις</h3>' +
        '<div class="pm-tablewrap"><table class="pm-table pe-table"><thead><tr><th>Μέτρηση</th><th>Μήκος (cm)</th></tr></thead><tbody>' + rows + '<tr class="pe-sum"><td>Άθροισμα</td><td id="pl-sum">–</td></tr></tbody></table></div>' +
        '<p class="pa-small">Όλες οι μετρήσεις έχουν <strong>ένα δεκαδικό ψηφίο</strong> (ακρίβεια οργάνου 0,1 cm).</p></section>' +
        '<section class="pa-card"><h3><span class="pa-num">2</span> Πώς πέφτουν οι μετρήσεις;</h3><p>Κάθε τελεία είναι μία μέτρηση· η κάθετη γραμμή είναι η μέση τιμή. Οι περισσότερες τιμές συγκεντρώνονται γύρω από το 118,7 – 119,0 cm.</p><div class="pe-plotbox" data-zoom="1" id="pl-plot"></div>' + HINT + '</section>' +
        '<section class="pa-card"><h3><span class="pa-num">3</span> Ποια είναι η πιο πιθανή τιμή;</h3>' +
        '<p>Στη γλώσσα των μαθηματικών η πιθανότερη τιμή είναι η <strong>μέση τιμή</strong>.</p><div class="pe-steps" id="pl-steps"></div>' +
        '<div class="pa-rule">Η μέτρηση ενός φυσικού μεγέθους με το ίδιο όργανο έχει πάντα τον ίδιο αριθμό δεκαδικών ψηφίων, τα οποία πρέπει να αναγράφονται, αφού καθορίζουν και την ακρίβεια της μέτρησης. Γι\' αυτό η τιμή 118,91 στρογγυλοποιείται σε <strong>ένα δεκαδικό ψηφίο</strong>, που είναι η ακρίβεια του οργάνου.</div>' +
        '<div class="pa-two"><div class="pa-box pa-good"><h4>Η τιμή που γράφουμε</h4><p>Μήκος θρανίου = <strong id="pl-res">–</strong> cm. Χρησιμοποιούμε τα διεθνή σύμβολα των μονάδων (cm).</p></div>' +
        '<div class="pa-box pa-warn"><h4>Παρατήρηση</h4><p id="pl-outl">–</p></div></div></section>' +
        '<div class="pa-tools"><button type="button" class="pa-btn" data-act="back">⬅ Πίσω στη μέτρηση μήκους</button></div></div>';
    }

    function render(mount) {
        mount.innerHTML = page1();
        mount.querySelector('.pa-wrap').addEventListener('click', e => {
            const zb = e.target.closest('[data-zoom]');
            if (zb) { openZoom(zb); return; }
            if (e.target.closest('[data-act="example"]')) renderExample(mount, () => render(mount));
            else if (e.target.closest('[data-act="tool"]') && window.PhysACalc) window.PhysACalc.render(mount, { kind: 'length', back: () => render(mount) });
        });
    }

    function renderExample(mount, back) {
        mount.innerHTML = page2();
        const root = mount.querySelector('.pa-wrap');
        const val = LEN.slice();
        const parse = v => { const x = parseFloat(String(v).trim().replace(',', '.')); return isFinite(x) ? x : NaN; };

        function update() {
            const ok = val.every(isFinite);
            const sumEl = root.querySelector('#pl-sum'), steps = root.querySelector('#pl-steps'), res = root.querySelector('#pl-res'), outl = root.querySelector('#pl-outl');
            if (!ok) { sumEl.textContent = '–'; steps.innerHTML = '<div class="pa-msg bad">Συμπληρώστε και τις 10 μετρήσεις με αριθμούς.</div>'; res.textContent = '–'; outl.textContent = '–'; root.querySelector('#pl-plot').innerHTML = ''; return; }
            const sum = Math.round(val.reduce((a, b) => a + b, 0) * 10) / 10;
            const mean = sum / 10;
            const final = Math.round(mean * 10) / 10;
            sumEl.textContent = nf(sum, 1);
            steps.innerHTML =
                '<div class="pe-step"><span class="pe-sn">1</span><div><strong>Άθροισμα</strong><br>' + nf(sum, 1) + ' cm</div></div>' +
                '<div class="pe-step"><span class="pe-sn">2</span><div><strong>Μέση τιμή</strong><br>' + nf(sum, 1) + ' ÷ 10 = <strong>' + nf(mean, 2) + ' cm</strong></div></div>' +
                '<div class="pe-step pe-final"><span class="pe-sn">3</span><div><strong>Στρογγυλοποίηση στην ακρίβεια του οργάνου (0,1 cm)</strong><br>' + nf(mean, 2) + ' cm → <span class="pa-res">' + nf(final, 1) + ' cm</span></div></div>';
            res.textContent = nf(final, 1);
            const mx = Math.max.apply(null, val), mn = Math.min.apply(null, val);
            const far = val.filter(v => Math.abs(v - mean) >= 0.4);
            outl.textContent = far.length
                ? 'Η τιμή ' + nf(far[0], 1) + ' cm απέχει αρκετά από τις υπόλοιπες. Μια τέτοια απόκλιση οφείλεται συνήθως σε κάποιο από τα λάθη μεθόδου ή ανάγνωσης, και η μέση τιμή τη «εξομαλύνει» χωρίς να την αφήνει να καθορίσει το αποτέλεσμα.'
                : 'Οι μετρήσεις κυμαίνονται από ' + nf(mn, 1) + ' έως ' + nf(mx, 1) + ' cm: η μέση τιμή τις συνοψίζει.';
            root.querySelector('#pl-plot').innerHTML = dotPlot(val, mean);
        }

        root.addEventListener('input', e => {
            const t = e.target.closest('.pe-in');
            if (!t) return;
            val[+t.dataset.i] = parse(t.value);
            update();
        });
        root.addEventListener('click', e => {
            const zb = e.target.closest('[data-zoom]');
            if (zb) { openZoom(zb); return; }
            const b = e.target.closest('[data-act]');
            if (!b) return;
            if (b.dataset.act === 'back') back();
            else if (b.dataset.act === 'reset-ex') {
                for (let i = 0; i < 10; i++) val[i] = LEN[i];
                root.querySelectorAll('.pe-in').forEach(inp => { inp.value = nf(LEN[+inp.dataset.i], 1); });
                update();
            }
        });
        update();
        mount.scrollIntoView({ block: 'start' });
    }

    window.PhysALength = { render };
})();
