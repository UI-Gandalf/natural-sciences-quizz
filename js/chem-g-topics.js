/* ==========================================================================
   Chemistry Γ: "Βαθιά εστίαση & ερμηνεία" - special topics.
   Topic 1: lactic acid and anaerobic respiration (the book mentions lactic acid as the acid of muscle fatigue).
   SUPPLEMENTARY material (outside the school book, not examined); it connects with the book (acids, pH scale,
   ionisation of weak acids). The diagrams are schematic drawings.
   window.ChemGTopics.render(mountElement)
   ========================================================================== */
(function () {
    'use strict';
    const K = window.BioGuideKit;
    const { tbl, ul, box, flow } = K;
    const supp = (title, body) => '<div class="bga-box bt-supp"><strong>➕ ' + title + ' <span class="bt-tag">συμπληρωματικό · εκτός βιβλίου · δεν ζητείται</span></strong>' + body + '</div>';

    /* ------------------------------------------------------------ diagrams (own schematic drawings) */
    function atpSvg() {
        const bar = (x, h, c, label, val) => '<rect x="' + x + '" y="' + (250 - h) + '" width="120" height="' + h + '" rx="8" fill="' + c + '" stroke="#0f172a" stroke-width="2.5"/>' +
            '<text x="' + (x + 60) + '" y="' + (240 - h) + '" font-size="20" font-weight="800" fill="#0f172a" text-anchor="middle">' + val + '</text>' +
            '<text x="' + (x + 60) + '" y="278" font-size="15" font-weight="800" fill="#0f172a" text-anchor="middle">' + label + '</text>';
        return '<svg viewBox="0 0 860 330" class="bg-svg" role="img" aria-label="Απόδοση ATP: αερόβια και αναερόβια διάσπαση της γλυκόζης">' +
            '<rect width="860" height="330" fill="#f8fafc"/>' +
            '<text x="215" y="28" font-size="17" font-weight="800" fill="#0f172a" text-anchor="middle">ATP από ένα μόριο γλυκόζης</text>' +
            '<line x1="40" y1="250" x2="400" y2="250" stroke="#475569" stroke-width="3"/>' +
            bar(70, 190, '#34d399', 'με οξυγόνο', '≈ 36–38') + bar(250, 10, '#f87171', 'χωρίς οξυγόνο', '2') +
            '<text x="215" y="304" font-size="13.5" fill="#475569" text-anchor="middle">η αναερόβια δίνει πολύ λιγότερη</text><text x="215" y="321" font-size="13.5" fill="#475569" text-anchor="middle">ενέργεια ανά μόριο γλυκόζης</text>' +
            '<line x1="430" y1="12" x2="430" y2="318" stroke="#94a3b8" stroke-width="2" stroke-dasharray="6 6"/>' +
            '<text x="645" y="28" font-size="17" font-weight="800" fill="#0f172a" text-anchor="middle">Πόσο γρήγορα και για πόσο;</text>' +
            '<text x="470" y="84" font-size="15" font-weight="800" fill="#047857">Αερόβια</text>' +
            '<rect x="470" y="94" width="350" height="26" rx="6" fill="#34d399" stroke="#047857" stroke-width="2"/><text x="645" y="113" font-size="13.5" font-weight="800" fill="#064e3b" text-anchor="middle">πιο αργά · διαρκεί ώρες</text>' +
            '<text x="470" y="170" font-size="15" font-weight="800" fill="#b91c1c">Αναερόβια</text>' +
            '<rect x="470" y="180" width="70" height="26" rx="6" fill="#f87171" stroke="#b91c1c" stroke-width="2"/><text x="550" y="199" font-size="13.5" font-weight="800" fill="#7f1d1d">γρήγορα · μόνο για λίγο (έως 1–2 λεπτά)</text>' +
            '<text x="645" y="270" font-size="13.5" fill="#475569" text-anchor="middle">η αναερόβια δίνει ενέργεια γρήγορα,</text><text x="645" y="288" font-size="13.5" fill="#475569" text-anchor="middle">η αερόβια κρατά πολύ</text>' +
            '</svg>';
    }

    function phSvg() {
        const x = (v) => 60 + (v - 5) * 80;       // 5..14 visible
        const grad = '<defs><linearGradient id="cg-ph" x1="0" x2="1"><stop offset="0" stop-color="#ef4444"/><stop offset="0.3" stop-color="#f59e0b"/><stop offset="0.55" stop-color="#22c55e"/><stop offset="1" stop-color="#3b82f6"/></linearGradient></defs>';
        let s = '<svg viewBox="0 0 860 280" class="bg-svg" role="img" aria-label="pH του μυός σε ηρεμία και σε κόπωση">' + grad + '<rect width="860" height="280" fill="#f8fafc"/>' +
            '<rect x="' + x(5) + '" y="96" width="' + (x(14) - x(5)) + '" height="30" rx="8" fill="url(#cg-ph)" stroke="#334155" stroke-width="2"/>';
        for (let v = 5; v <= 14; v++) s += '<line x1="' + x(v) + '" y1="126" x2="' + x(v) + '" y2="134" stroke="#334155" stroke-width="2"/><text x="' + x(v) + '" y="152" font-size="15" font-weight="700" fill="#0f172a" text-anchor="middle">' + v + '</text>';
        s += '<text x="' + x(5) + '" y="84" font-size="15" font-weight="800" fill="#b91c1c">πιο όξινο</text><text x="' + x(14) + '" y="84" font-size="15" font-weight="800" fill="#1d4ed8" text-anchor="end">πιο βασικό</text>' +
            // rest (7.0-7.2) and fatigue (~6.5)
            '<rect x="' + x(7) + '" y="96" width="' + (x(7.2) - x(7)) + '" height="30" fill="none" stroke="#047857" stroke-width="4"/>' +
            '<line x1="' + x(7.1) + '" y1="134" x2="' + x(7.1) + '" y2="196" stroke="#047857" stroke-width="3"/><circle cx="' + x(7.1) + '" cy="134" r="6" fill="#047857"/>' +
            '<text x="' + (x(7.1) + 12) + '" y="196" font-size="15" font-weight="800" fill="#047857">μυϊκό κύτταρο σε ηρεμία</text><text x="' + (x(7.1) + 12) + '" y="216" font-size="13.5" fill="#475569">pH περίπου 7,0–7,2</text>' +
            '<line x1="' + x(6.5) + '" y1="134" x2="' + x(6.5) + '" y2="196" stroke="#b91c1c" stroke-width="3"/><circle cx="' + x(6.5) + '" cy="134" r="6" fill="#b91c1c"/>' +
            '<text x="' + (x(6.5) - 12) + '" y="196" font-size="15" font-weight="800" fill="#b91c1c" text-anchor="end">έντονη προσπάθεια</text><text x="' + (x(6.5) - 12) + '" y="216" font-size="13.5" fill="#475569" text-anchor="end">pH περίπου 6,5</text>' +
            '<text x="' + (x(6.8) + 4) + '" y="52" font-size="14.5" font-weight="800" fill="#0f172a" text-anchor="middle">pH 7,0 → 6,5: περίπου 3 φορές περισσότερα H⁺</text>' +
            '<text x="' + (x(6.8) + 4) + '" y="70" font-size="12.5" fill="#475569" text-anchor="middle">(κάθε 1 μονάδα pH = 10 φορές)</text>' +
            '<text x="' + x(11) + '" y="260" font-size="13.5" fill="#475569" text-anchor="middle">Ενδεικτικές τιμές για την εικόνα της κλίμακας.</text>' +
            '</svg>';
        return s;
    }

    function thrSvg() {
        // x: intensity 0..100, y: lactate level (schematic)
        const X = (v) => 60 + v * 7.2, Y = (v) => 250 - v * 2.0;
        const curve = (t, c) => { let d = ''; for (let i = 0; i <= 100; i += 4) { const e = i <= t ? 8 + (i / t) * 6 : 14 + Math.pow((i - t) / (100 - t), 2.2) * 80; d += (i ? 'L' : 'M') + X(i).toFixed(1) + ',' + Y(e).toFixed(1); } return '<path d="' + d + '" fill="none" stroke="' + c + '" stroke-width="5" stroke-linecap="round"/>'; };
        return '<svg viewBox="0 0 860 330" class="bg-svg" role="img" aria-label="Γαλακτικό στο αίμα ανάλογα με την ένταση της άσκησης: αγύμναστος και προπονημένος">' +
            '<rect width="860" height="330" fill="#f8fafc"/>' +
            '<line x1="60" y1="250" x2="800" y2="250" stroke="#475569" stroke-width="3"/><line x1="60" y1="250" x2="60" y2="30" stroke="#475569" stroke-width="3"/>' +
            '<text x="430" y="290" font-size="15" font-weight="800" fill="#0f172a" text-anchor="middle">ένταση της άσκησης →</text>' +
            '<text x="22" y="140" font-size="15" font-weight="800" fill="#0f172a" transform="rotate(-90 22 140)" text-anchor="middle">γαλακτικό στο αίμα →</text>' +
            curve(45, '#ef4444') + curve(75, '#10b981') +
            '<line x1="' + X(45) + '" y1="252" x2="' + X(45) + '" y2="60" stroke="#ef4444" stroke-width="2.5" stroke-dasharray="6 5"/><text x="' + X(45) + '" y="50" font-size="14.5" font-weight="800" fill="#b91c1c" text-anchor="middle">κατώφλι αγύμναστου</text>' +
            '<line x1="' + X(75) + '" y1="252" x2="' + X(75) + '" y2="100" stroke="#10b981" stroke-width="2.5" stroke-dasharray="6 5"/><text x="' + X(75) + '" y="90" font-size="14.5" font-weight="800" fill="#047857" text-anchor="middle">κατώφλι αθλητή</text>' +
            '<text x="' + X(20) + '" y="206" font-size="13.5" font-weight="700" fill="#475569" text-anchor="middle">παραγωγή = απομάκρυνση</text>' +
            '<text x="800" y="316" font-size="12.5" fill="#475569" text-anchor="end">Σχηματικό διάγραμμα, όχι πραγματικές μετρήσεις.</text>' +
            '</svg>';
    }

    /* ------------------------------------------------------------ section 1 */
    const S1 =
        box('bga-key', '❓ Το ερώτημα', '<p>Στο βιβλίο γράφεται ότι κατά την έντονη άσκηση παράγεται <strong>γαλακτικό οξύ</strong>. Τι σημαίνει όμως «αναερόβια αναπνοή», γιατί παράγεται οξύ στους μυς, και είναι όντως αυτό που μας «καίει» και μας κουράζει;</p>') +
        '<h4>Τι κάνει ο μυς για ενέργεια</h4>' +
        '<p>Τα μυϊκά κύτταρα διασπούν τη <strong>γλυκόζη</strong> για να παράγουν <strong>ATP</strong>, το «ενεργειακό νόμισμα» που επιτρέπει στους μυς να συσπώνται. Αν υπάρχει αρκετό οξυγόνο, η διάσπαση είναι πλήρης (<strong>αερόβια</strong>). Όταν η ανάγκη για ενέργεια ξεπερνά αυτό που προλαβαίνει να φέρει το αίμα, το κύτταρο στρέφεται στη <strong>γαλακτική ζύμωση</strong>, μια διαδικασία έκτακτης ανάγκης <strong>χωρίς οξυγόνο</strong>.</p>' +
        tbl(['', 'Αερόβια αναπνοή', 'Αναερόβια (γαλακτική ζύμωση)'], [
            ['Οξυγόνο', 'Απαραίτητο', 'Δεν χρειάζεται'],
            ['Πού γίνεται', 'Κυτταρόπλασμα και <strong>μιτοχόνδρια</strong>', 'Μόνο στο <strong>κυτταρόπλασμα</strong>'],
            ['Απλοποιημένη εξίσωση', 'γλυκόζη + οξυγόνο → διοξείδιο του άνθρακα + νερό<br>C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O', 'γλυκόζη → γαλακτικό οξύ<br>C₆H₁₂O₆ → 2C₃H₆O₃'],
            ['Ενέργεια (ATP)', '<strong>Υψηλή</strong>: περίπου 36–38 ATP ανά γλυκόζη', '<strong>Χαμηλή</strong>: 2 ATP ανά γλυκόζη'],
            ['Ταχύτητα', 'Σχετικά αργή', '<strong>Γρήγορη</strong> (λίγα βήματα)'],
            ['Προϊόντα', 'CO₂ και H₂O (αποβάλλονται εύκολα)', 'Γαλακτικό οξύ'],
            ['Για πόσο', 'Ώρες, όσο υπάρχουν καύσιμα και οξυγόνο', 'Από λίγα δευτερόλεπτα έως 1–2 λεπτά']
        ], 'bga-plain') +
        '<div class="bt-stage">' + atpSvg() + '</div>' +
        '<p class="bga-note">Για το ίδιο ποσό ATP, η αναερόβια διαδικασία καταναλώνει περίπου <strong>18–19 φορές περισσότερη γλυκόζη</strong> (36–38 ÷ 2).</p>' +
        '<h4>Πότε χρησιμοποιείται καθεμία</h4>' +
        tbl(['', 'Πλεονεκτήματα', 'Μειονεκτήματα', 'Παραδείγματα'], [
            ['<strong>Αερόβια</strong>', 'Μεγάλη απόδοση ενέργειας. Τα προϊόντα (CO₂, H₂O) αποβάλλονται εύκολα από τους πνεύμονες και με τον ιδρώτα.', 'Ξεκινά πιο αργά και περιορίζεται από το πόσο οξυγόνο φέρνουν η καρδιά και οι πνεύμονες στους μυς.', 'Μαραθώνιος, χαλαρό τρέξιμο, ποδηλασία αντοχής, περπάτημα, ηρεμία'],
            ['<strong>Αναερόβια</strong>', 'Δίνει πολλή ισχύ σχεδόν αμέσως, πέρα από το όριο που επιτρέπει η παροχή οξυγόνου.', 'Πολύ ασύμφορη (18–19 φορές περισσότερη γλυκόζη) και οδηγεί γρήγορα σε εξάντληση, λόγω της πτώσης του pH.', 'Σπριντ 100–400 m, άρση βαρών, εκρηκτικό άλμα, τελευταία δευτερόλεπτα μιας ανηφόρας']
        ], 'bga-plain') +
        '<p class="bga-note">Οι δύο διαδικασίες δεν λειτουργούν ποτέ εντελώς χωριστά: το σώμα αλλάζει συνεχώς το ποσοστό συμμετοχής τους, ανάλογα με την ένταση και τη διάρκεια της προσπάθειας.</p>' +
        '<h4>Γιατί νιώθουμε εξάντληση και «κάψιμο»;</h4>' +
        '<p>Παλιότερα πίστευαν ότι το γαλακτικό οξύ είναι «δηλητήριο» που καταστρέφει τον μυ. Σήμερα ξέρουμε ότι το πρόβλημα είναι η <strong>οξύτητα</strong>, δηλαδή τα ιόντα <strong>H⁺</strong>. Εδώ συνδέεται άμεσα με τη Χημεία του βιβλίου:</p>' +
        ul(['Το γαλακτικό οξύ είναι <strong>ασθενές οξύ</strong>: στο κύτταρο <strong>ιοντίζεται</strong> σε γαλακτικό ανιόν και ιόντα υδρογόνου (<strong>H⁺</strong>). Και η ίδια η διάσπαση του ATP κατά τη συστολή απελευθερώνει επιπλέον H⁺.',
            'Τα H⁺ <strong>χαμηλώνουν το pH</strong> του μυός: από περίπου 7,0–7,2 σε περίπου 6,5 σε έντονη προσπάθεια. Επειδή η κλίμακα pH είναι <strong>λογαριθμική</strong>, η αλλαγή αυτή σημαίνει περίπου <strong>3 φορές περισσότερα H⁺</strong>.']) +
        '<div class="bt-stage">' + phSvg() + '</div>' +
        ul(['<strong>Μπλοκάρεται η συστολή:</strong> τα περισσότερα H⁺ δυσκολεύουν τη σύνδεση του ασβεστίου που χρειάζεται ο μυς για να συσταλεί. Ο μυς «αρνείται» να υπακούσει.',
            '<strong>Επιβραδύνονται τα ένζυμα:</strong> τα ένζυμα λειτουργούν σωστά μόνο σε συγκεκριμένο pH. Η οξύτητα τα επιβραδύνει και μειώνεται η παραγωγή ATP.',
            '<strong>Πόνος καύσου:</strong> τα ελεύθερα H⁺ διεγείρουν τις νευρικές απολήξεις του πόνου. Λειτουργεί σαν μηχανισμός ασφαλείας: μας αναγκάζει να σταματήσουμε πριν υποστεί βλάβη ο μυς.']) +
        '<h4>Τι απογίνεται το γαλακτικό</h4>' +
        flow(['Έντονη προσπάθεια: παράγεται γαλακτικό στον μυ', 'Η ένταση πέφτει και υπάρχει οξυγόνο', 'Το αίμα το μεταφέρει στην καρδιά και στο συκώτι', 'Η καρδιά το χρησιμοποιεί ως καύσιμο· το συκώτι το μετατρέπει ξανά σε γλυκόζη']) +
        '<p>Δηλαδή το γαλακτικό <strong>δεν πάει χαμένο</strong>: ανακυκλώνεται. Η διαδικασία στο συκώτι ονομάζεται <strong>κύκλος του Cori</strong>.</p>' +
        box('bga-info', 'Συμπέρασμα',
            '<p>Το γαλακτικό οξύ δεν είναι «δηλητήριο». Η κούραση και το κάψιμο οφείλονται στα <strong>ιόντα H⁺</strong> (πτώση του pH) που προκύπτουν από τη γρήγορη, αναερόβια παραγωγή ενέργειας. Αυτό που ψάχνει το βιβλίο είναι ότι <strong>η αναερόβια αναπνοή στους μυς παράγει γαλακτικό οξύ</strong>.</p>') +
        supp('Το «αναερόβιο κατώφλι» των αθλητών',
            '<p><strong>Κεντρικό νόημα:</strong> σε ηρεμία ή ήπια άσκηση το σώμα παράγει συνεχώς λίγο γαλακτικό, αλλά η καρδιά και το συκώτι το απομακρύνουν με τον ίδιο ρυθμό, οπότε στο αίμα μένει χαμηλό και σταθερό (περίπου 1–2 mmol/L). Το <strong>αναερόβιο κατώφλι</strong> είναι η ένταση της άσκησης πάνω από την οποία το γαλακτικό <strong>παράγεται πιο γρήγορα από ό,τι απομακρύνεται</strong>.</p>' +
            '<div class="bt-stage">' + thrSvg() + '</div>' +
            ul(['<strong>Πάνω από το κατώφλι</strong> συσσωρεύονται απότομα το γαλακτικό και τα H⁺. Η οξέωση αναγκάζει τον αθλητή να μειώσει τον ρυθμό ή να σταματήσει μέσα σε λίγα λεπτά.',
                '<strong>Η προπόνηση το μετακινεί ψηλότερα.</strong> Ένας αγύμναστος το φτάνει περίπου στο 50–60% της μέγιστης πρόσληψης οξυγόνου (VO₂max), ένας επαγγελματίας μαραθωνοδρόμος περίπου στο 85–90%.',
                'Η προπόνηση αντοχής αυξάνει τα <strong>μιτοχόνδρια</strong>, τα <strong>τριχοειδή αγγεία</strong> γύρω από τους μυς (περισσότερο οξυγόνο) και τις <strong>πρωτεΐνες-μεταφορείς</strong> που βγάζουν το γαλακτικό από το κύτταρο. Έτσι ο αθλητής τρέχει γρηγορότερα παραμένοντας αερόβια.'])) +
        supp('Γιατί το «πιάσιμο» της επόμενης ημέρας ΔΕΝ οφείλεται στο γαλακτικό οξύ',
            '<p><strong>Κεντρικό νόημα:</strong> το γαλακτικό απομακρύνεται μέσα σε περίπου μία ώρα μετά την προσπάθεια. Δεν υπάρχει πια στον μυ όταν ξυπνάς πιασμένος 24 ή 48 ώρες αργότερα.</p>' +
            flow(['Έκκεντρη ή ασυνήθιστη άσκηση', 'Μικρορωγμές στις μυϊκές ίνες', 'Φλεγμονή και μικρό οίδημα (24–48 ώρες)', 'Πίεση στις απολήξεις του πόνου: δυσκαμψία']) +
            ul(['Ο καθυστερημένος μυϊκός πόνος λέγεται <strong>DOMS</strong> (Delayed Onset Muscle Soreness) και οφείλεται σε <strong>μηχανικές βλάβες και φλεγμονή</strong>, όχι σε οξύ.',
                '<strong>Έκκεντρη συστολή</strong> είναι όταν ο μυς φρενάρει ένα φορτίο ενώ επιμηκύνεται (κατέβασμα ανηφόρας, αργό κατέβασμα βάρους).',
                'Το σώμα στέλνει λευκά αιμοσφαίρια για να καθαρίσουν και να επισκευάσουν τις ίνες. Η επισκευή τις κάνει <strong>πιο γερές</strong> για την επόμενη φορά.'])) +
        supp('Ρυθμιστικά διαλύματα',
            ul(['Το αίμα διατηρεί σταθερό pH (7,35–7,45) με τη βοήθεια <strong>ρυθμιστικών διαλυμάτων</strong>. Η έντονη πτώση του pH συμβαίνει κυρίως <strong>μέσα στον μυ</strong>, όχι σε όλο το σώμα.'])) +
        supp('Για συζήτηση', ul(['Γιατί η αναερόβια διαδικασία παρά τη χαμηλή της απόδοση είναι χρήσιμη σε ένα σπριντ;', 'Το γαλακτικό οξύ υπάρχει και στο γιαούρτι. Βακτήρια που ζυμώνουν τη γλυκόζη (λακτόζη) του γάλακτος το παράγουν με παρόμοια διαδικασία. Τι κοινό έχει με αυτό που γίνεται στον μυ;']));

    /* page 1: lactic acid (tab "Βαθιά εστίαση & ερμηνεία") */
    function render(mount) {
        K.renderPage(mount, {
            title: '🏃 Αναερόβια αναπνοή και γαλακτικό οξύ',
            intro: 'Σύνδεση της Χημείας (οξέα, pH) με τη Βιολογία των μυών. Οι επεκτάσεις που σημειώνονται ως <strong>συμπληρωματικές</strong> δεν αποτελούν εξεταστέα ύλη.',
            sections: [
                { id: 'cg1', icon: '🏃', title: 'Αερόβια και αναερόβια διάσπαση, pH και γαλακτικό οξύ', nav: 'Γαλακτικό οξύ', sub: 'αερόβια και αναερόβια διάσπαση · γιατί «καίνε» οι μύες · τι γίνεται το γαλακτικό', body: S1, open: true }
            ]
        });
    }

    /* page 2: insect stings and how to deal with them (separate tab "Τσιμπήματα εντόμων") */
    const DISCLAIMER = '<div class="bg-disclaimer"><strong>Οι πληροφορίες σε αυτή τη σελίδα (τσιμπήματα, φαρμακείο εξοχής, αναφυλαξία, αδρεναλίνη) είναι μόνο για ενημέρωση και σε καμία περίπτωση δεν αποτελούν ιατρικές οδηγίες. Όποιος έχει τέτοιο πρόβλημα πρέπει οπωσδήποτε να συμβουλευτεί τον γιατρό του.</strong></div>';

    function renderInsects(mount) {
        const bee = (window.BioGTopics && window.BioGTopics.sections) || [];
        const root = K.renderPage(mount, {
            title: '🐝 Τσιμπήματα εντόμων και αντιμετώπιση',
            intro: 'Μύθοι και πρώτες βοήθειες στα τσιμπήματα εντόμων, με τη βοήθεια της Χημείας (οξέα, βάσεις, pH). Τα θέματα αυτά είναι <strong>συμπληρωματικά</strong> και δεν αποτελούν εξεταστέα ύλη.</p>' + DISCLAIMER + '<p style="display:none">',
            sections: bee.map((b, i) => Object.assign({}, b, { title: (i + 1) + '. ' + b.title, open: i === 0 }))
        });
        if (window.BioGTopics && window.BioGTopics.wire) window.BioGTopics.wire(root);
    }

    /* the tab: a drop-down menu chooses between the two independent topics */
    const TOPICS = [
        { key: 'lactic', label: '🏃 Αναερόβια αναπνοή και γαλακτικό οξύ', show: render },
        { key: 'insects', label: '🐝 Τσιμπήματα εντόμων και αντιμετώπιση', show: renderInsects }
    ];

    function renderTab(mount) {
        mount.innerHTML = '';
        const root = document.createElement('div');
        root.className = 'bga';
        root.innerHTML = '<div class="bga-head"><h2>🧩 Βαθιά εστίαση & ερμηνεία</h2><p>Επιπλέον θέματα που συνδέουν τη Χημεία με την καθημερινή ζωή. Είναι <strong>συμπληρωματικά</strong> και <strong>δεν αποτελούν εξεταστέα ύλη</strong>.</p>' +
            '<div class="cg-pick cg-pick-strong"><span class="cg-pick-t">👇 Υπάρχουν ' + TOPICS.length + ' θέματα: διάλεξε από το μενού</span><label class="cg-pick-sel"><select id="cg-topic">' + TOPICS.map(t => '<option value="' + t.key + '">' + t.label + '</option>').join('') + '</select></label>' +
            '<div class="cg-chips">' + TOPICS.map(t => '<button type="button" class="cg-chip" data-k="' + t.key + '">' + t.label + '</button>').join('') + '</div></div></div><div id="cg-content"></div>';
        mount.appendChild(root);
        const sel = root.querySelector('#cg-topic'), content = root.querySelector('#cg-content');
        const go = () => { root.querySelectorAll('.cg-chip').forEach(c => c.classList.toggle('on', c.dataset.k === sel.value)); const t = TOPICS.find(x => x.key === sel.value) || TOPICS[0]; t.show(content); };
        sel.addEventListener('change', go);
        root.querySelectorAll('.cg-chip').forEach(c => c.addEventListener('click', () => { sel.value = c.dataset.k; go(); }));
        go();
    }

    window.ChemGTopics = { render: renderTab };
})();
