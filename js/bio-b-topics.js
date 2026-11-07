/* ==========================================================================
   Biology Β: special topics (hydrostatic skeleton, arthropods and moulting, exoskeleton, joints).
   Facts come from the school book "Βιολογία Α΄ Γυμνασίου" (chapter 5, pp. 98-107); the pictures marked "Βιβλίο" are
   cropped from the book's own pages. Boxes marked «συμπληρωματικό» are additions outside the book (not examined).
   window.BioBTopics.render(mountElement)
   ========================================================================== */
(function () {
    'use strict';
    const K = window.BioGuideKit;
    const { tbl, ul, box, flow } = K;
    const IMG = 'assets/images/bioB/';
    const fig = (src, cap, cls) => '<figure class="bt-fig ' + (cls || '') + '"><img src="' + IMG + src + '" alt="' + cap.replace(/"/g, '') + '"><figcaption><span class="bt-src">Βιβλίο</span> ' + cap + ' <span class="bt-zoomhint">🔍 πάτα για μεγέθυνση</span></figcaption></figure>';
    const figs = (items) => '<div class="bt-figs">' + items.join('') + '</div>';
    const supp = (title, body) => '<div class="bga-box bt-supp"><strong>➕ ' + title + ' <span class="bt-tag">συμπληρωματικό · εκτός βιβλίου · δεν ζητείται</span></strong>' + body + '</div>';
    const ctrl = (id, buttons) => '<div class="bt-ctrl" id="' + id + '">' + buttons.map(b => '<button type="button" class="bt-btn" data-act="' + b[0] + '">' + b[1] + '</button>').join('') + '</div>';

    /* ------------------------------------------------------------ 1. hydrostatic skeleton */
    const S1 =
        '<p class="bga-lead">Μερικά ζώα <strong>δεν έχουν σκληρά οστά ή κελύφη</strong>. Το σώμα τους στηρίζεται από <strong>εσωτερικά υγρά</strong>: αυτό λέγεται <strong>υδροστατικός σκελετός</strong>.</p>' +
        tbl(['Ζώο', 'Στήριξη', 'Πώς κινείται (σύμφωνα με το βιβλίο)'], [
            ['Μέδουσα (Εικ. 5.5)', 'Δεν διαθέτει σκελετό. Το σώμα της στηρίζεται από εσωτερικά υγρά (υδροστατικός σκελετός).', 'Κινείται με τη βοήθεια <strong>κυκλικών μυϊκών ινών</strong>.'],
            ['Ύδρα (Εικ. 5.1)', 'Βρίσκεται προσκολλημένη στον βυθό. Το σώμα της στηρίζεται από εσωτερικά υγρά (υδροστατικός σκελετός).', 'Κινεί τις <strong>κεραίες</strong> της για να προσλάβει την τροφή της. <strong>Κινείται, αλλά δεν μετακινείται.</strong>'],
            ['Γεωσκώληκας', 'Έχει υδροστατικό σκελετό.', 'Με τη βοήθεια <strong>τριχιδίων</strong> και <strong>μυών</strong>, που διατάσσονται σε δύο στρώματα.']
        ], 'bga-plain') +
        figs([fig('medusa.png', 'Η μέδουσα (Εικ. 5.5): χωρίς σκελετό, στηρίζεται από εσωτερικά υγρά.'), fig('hydra.png', 'Η ύδρα: κινεί τις κεραίες της για να πιάσει τροφή.'), fig('earthworm.png', 'Ο γεωσκώληκας: τριχίδια και μύες σε δύο στρώματα.')]) +
        '<h4>Πώς κινείται ο γεωσκώληκας (παίξε την κίνηση)</h4>' +
        '<p>Το σώμα του αποτελείται από δακτυλίους (ζώνες). Το τοίχωμά του έχει δύο στρώματα μυών: το <strong>εξωτερικό</strong> από <strong>κυκλικούς μύες</strong> (ακολουθούν την περιφέρεια κάθε ζώνης) και το <strong>εσωτερικό</strong> από <strong>επιμήκεις μύες</strong> (κάθετη διεύθυνση προς τις ζώνες). Η <strong>συνδυασμένη λειτουργία</strong> τους επιτρέπει στον γεωσκώληκα να μετακινείται. Σε κάθε δακτύλιο υπάρχουν τέσσερα ζευγάρια τριχίδια που τον βοηθούν.</p>' +
        '<div class="bt-stage"><svg id="bt-worm" viewBox="0 0 800 230" class="bt-svg" role="img" aria-label="Κίνηση γεωσκώληκα"></svg>' +
        '<div class="bt-legend"><span><i class="bt-sw bt-sw-a"></i> συστέλλονται οι <strong>κυκλικοί</strong> μύες: το τμήμα γίνεται <strong>μακρύ και λεπτό</strong></span><span><i class="bt-sw bt-sw-b"></i> συστέλλονται οι <strong>επιμήκεις</strong> μύες: το τμήμα γίνεται <strong>κοντό και χοντρό</strong> (τα τριχίδια πιάνονται στο έδαφος)</span></div>' +
        ctrl('bt-worm-c', [['pause', '⏸ Παύση']]) + '</div>' +
        '<h4>Η μέδουσα: παίξε την κίνηση</h4>' +
        '<div class="bt-stage"><svg id="bt-medusa" viewBox="0 0 800 260" class="bt-svg" role="img" aria-label="Κίνηση μέδουσας"></svg>' + ctrl('bt-medusa-c', [['pause', '⏸ Παύση']]) +
        '<p class="bga-note">Σχηματική απεικόνιση: ο θόλος συσπάται με τη βοήθεια κυκλικών μυϊκών ινών και το ζώο κινείται.</p></div>' +
        '<h4>Η ύδρα και ο υδροστατικός της σκελετός</h4>' +
        tbl(['Τι λέει το βιβλίο για την ύδρα', ''], [
            ['Πού ζει', 'Βρίσκεται <strong>προσκολλημένη στον βυθό</strong> (Εικ. 5.1).'],
            ['Στήριξη', 'Το σώμα της στηρίζεται από <strong>εσωτερικά υγρά</strong> (υδροστατικός σκελετός). Δεν έχει σκληρά μέρη.'],
            ['Κίνηση', '<strong>Κινεί τις κεραίες της</strong> για να προσλάβει την τροφή της.'],
            ['Μετακίνηση', 'Μπορεί να <strong>κινηθεί</strong>, αλλά <strong>δεν μπορεί να μετακινηθεί</strong> (ζει προσκολλημένη).']
        ], 'bga-plain') +
        '<div class="bt-stage"><div class="bt-hy-bar"><span>Δοκίμασε μια κίνηση:</span>' +
        ctrl('bt-hydra-c', [['rest', 'Ηρεμία'], ['long', '↕ Επιμήκυνση'], ['short', '⇣ Σύντμηση'], ['bend', '↪ Κάμψη'], ['catch', '🍤 Πιάνει τροφή']]) + '</div>' +
        '<svg id="bt-hydra" viewBox="0 0 800 440" class="bt-svg" role="img" aria-label="Κινήσεις της ύδρας"></svg>' +
        '<div class="bt-hy-info" id="bt-hydra-info"></div></div>' +
        supp('Πώς δουλεύει ο υδροστατικός σκελετός της ύδρας;',
            '<p>Το σώμα της ύδρας είναι ένας <strong>κοίλος σωλήνας γεμάτος υγρό</strong>. Γύρω από το υγρό υπάρχουν μυϊκές ίνες σε δύο διευθύνσεις: <strong>κυκλικές</strong> (γύρω από τον σωλήνα) και <strong>επιμήκεις</strong> (κατά μήκος του). Επειδή το υγρό δεν συμπιέζεται εύκολα, όταν συστέλλονται οι μύες το σώμα αλλάζει σχήμα, ενώ η ποσότητα του υγρού μένει ίδια:</p>' +
            ul(['<strong>Κυκλικοί μύες</strong> συστέλλονται: ο σωλήνας στενεύει και <strong>επιμηκύνεται</strong>.',
                '<strong>Επιμήκεις μύες</strong> συστέλλονται: ο σωλήνας <strong>κονταίνει</strong> και φουσκώνει.',
                'Επιμήκεις μύες <strong>της μίας πλευράς</strong> συστέλλονται: το σώμα <strong>λυγίζει</strong> προς αυτή την πλευρά.',
                'Έτσι η ύδρα μπορεί να σκύψει και να φέρει τις κεραίες της προς την τροφή, χωρίς κανένα σκληρό μέρος.']) +
            '<p class="bga-note">Το βιβλίο το αναφέρει ως θέμα για ερευνητική εργασία («Μικρές έρευνες και εργασίες», 1). Η παραπάνω περιγραφή είναι συμπληρωματική και δεν ζητείται.</p>') +
        supp('Γιατί λειτουργεί;', '<p>Τα υγρά του σώματος δεν συμπιέζονται εύκολα. Όταν οι μύες πιέζουν μέρος του σώματος, το υγρό «μετακινείται» και το σχήμα του σώματος αλλάζει (λεπτό και μακρύ, ή κοντό και χοντρό). Έτσι τα υγρά παίζουν τον ρόλο του σκελετού που στηρίζει και του «μοχλού» που βοηθά τους μύες να κινούν το σώμα.</p>');

    /* ------------------------------------------------------------ 2. arthropods and moulting */
    const S2 =
        '<p class="bga-lead">Τα <strong>αρθρόποδα</strong> είναι ζώα με πολλά κοινά χαρακτηριστικά: <strong>εξωσκελετός</strong> και <strong>αρθρωτά πόδια</strong>.</p>' +
        ul(['Το σώμα τους είναι <strong>χωρισμένο σε ζώνες</strong>.',
            'Για την κίνησή τους μπορεί να έχουν <strong>μεμβρανώδη φτερά</strong> και <strong>6, 8, 10, 40… πόδια</strong>.',
            'Ο εξωσκελετός τους είναι <strong>αρθρωτός</strong>, ώστε να επιτρέπονται οι κινήσεις.']) +
        tbl(['Ομάδα αρθροπόδων', 'Παραδείγματα του βιβλίου'], [
            ['Καρκινοειδή', 'αστακός, καραβίδα, καβούρι'],
            ['Μυριάποδα', 'σαρανταποδαρούσα'],
            ['Έντομα', 'μέλισσα, ακρίδα, κουνούπι'],
            ['Αραχνοειδή', 'αράχνη, τσιμπούρι']
        ], 'bga-plain') +
        figs([fig('bee.png', 'Η μέλισσα: δύο ζεύγη μεμβρανωδών φτερών και τρία ζεύγη αρθρωτών ποδιών.')]) +
        '<h4>Η έκδυση</h4>' +
        box('bga-key', '🔑 Έκδυση', '<p>Πολλές φορές, κατά τη διάρκεια της ανάπτυξης του ζώου, ο εξωσκελετός <strong>αποβάλλεται</strong> και <strong>δημιουργείται νέος</strong>. Το φαινόμενο αυτό ονομάζεται <strong>έκδυση</strong>.</p>') +
        '<div class="bt-stage"><div class="bt-steps" id="bt-molt"></div>' + ctrl('bt-molt-c', [['prev', '◀ Προηγούμενο'], ['play', '▶ Αυτόματα'], ['next', 'Επόμενο ▶']]) + '</div>' +
        figs([fig('molt.png', 'Ο εξωσκελετός που αποβλήθηκε κατά την έκδυση.')]) +
        supp('Γιατί γίνεται έκδυση;', '<p>Ο εξωσκελετός είναι σκληρός και δεν μεγαλώνει μαζί με το ζώο. Όταν το ζώο μεγαλώσει, «στενεύει» μέσα στον παλιό του εξωσκελετό. Τότε αυτός αποβάλλεται και σχηματίζεται καινούριος, μεγαλύτερος.</p>');

    /* ------------------------------------------------------------ 3. exoskeleton */
    const S3 =
        '<p class="bga-lead">Τα ζώα που διαθέτουν σκελετό τον έχουν είτε <strong>στο εσωτερικό</strong> του σώματος είτε <strong>εξωτερικά</strong>.</p>' +
        tbl(['', 'Ενδοσκελετός', 'Εξωσκελετός'], [
            ['Πού βρίσκεται', 'Στο <strong>εσωτερικό</strong> του οργανισμού', 'Καλύπτει <strong>εξωτερικά</strong> τον οργανισμό'],
            ['Παραδείγματα του βιβλίου', 'Σπονδυλωτά (όλα έχουν σπονδυλική στήλη, μέρος του ενδοσκελετού τους): γάτα, πτηνά, ψάρια…', 'Έντομα και γενικά όλα τα αρθρόποδα (π.χ. μέλισσα)'],
            ['Κοινές λειτουργίες', 'Εκτός από την <strong>κίνηση</strong>, <strong>προστατεύει</strong>, <strong>υποστηρίζει</strong> και <strong>διατηρεί το σχήμα</strong> του σώματος', 'Το ίδιο: κίνηση, προστασία, υποστήριξη, διατήρηση του σχήματος'],
            ['Ιδιαιτερότητες', 'Στα σπονδυλωτά έχει διαφοροποιήσεις ανάλογα με το περιβάλλον (αέρας, νερό, ξηρά)', 'Στα <strong>ασπόνδυλα</strong> βοηθά επιπλέον στη διατήρηση της <strong>υγρασίας</strong> του σώματος. Στα αρθρόποδα είναι <strong>αρθρωτός</strong>, ώστε να γίνονται κινήσεις']
        ], 'bga-plain') +
        '<h4>Ενδοσκελετός και εξωσκελετός σε σχήμα (διατομές)</h4>' +
        '<div class="bt-stage"><svg id="bt-skel" viewBox="0 0 800 320" class="bt-svg" role="img" aria-label="Ενδοσκελετός και εξωσκελετός"></svg>' +
        ctrl('bt-skel-c', [['both', 'Και τα δύο'], ['endo', 'Μόνο ενδοσκελετός'], ['exo', 'Μόνο εξωσκελετός']]) +
        '<p class="bga-note">Σχηματικό σχέδιο: στον ενδοσκελετό ο σκελετός είναι μέσα και οι μύες γύρω του. Στον εξωσκελετός ο σκελετός είναι ένα εξωτερικό περίβλημα και οι μύες μέσα του.</p></div>' +
        '<h4>Παραδείγματα από το βιβλίο</h4>' +
        figs([fig('bee.png', 'Ο εξωτερικός σκελετός καλύπτει το σώμα των εντόμων και γενικά όλων των αρθροπόδων.'), fig('snail.png', 'Το σαλιγκάρι έχει σκληρό κέλυφος μέσα στο οποίο ζει προφυλαγμένο.'), fig('bivalve.png', 'Τα δίθυρα ζουν προσκολλημένα σε βράχους, με το πόδι και τη βύσσο.')]) +
        ul(['<strong>Έντομα και αρθρόποδα:</strong> εξωτερικός σκελετός που καλύπτει όλο το σώμα. Η μέλισσα έχει δύο ζεύγη μεμβρανωδών φτερών και τρία ζεύγη αρθρωτών ποδιών.',
            '<strong>Σαλιγκάρι:</strong> το σώμα έχει κεφάλι, σπλαχνικό σάκο και πόδι. Ζει προφυλαγμένο μέσα σε σκληρό κέλυφος, και το μυώδες πόδι το κάνει να κινείται αργά (έρπει).',
            '<strong>Δίθυρα:</strong> η μυϊκή προεκβολή (πόδι) εξυπηρετεί την κίνηση· από αυτό εκκρίνονται λεπτές και σκληρές κλωστές (βύσσος) που τα στηρίζουν στον βράχο.']) +
        '<p class="bga-note">Το βιβλίο δεν ονομάζει ρητά το κέλυφος του σαλιγκαριού και των δίθυρων «εξωσκελετό»: το αναφέρει ως προστατευτικό περίβλημα και στήριξη.</p>';

    /* ------------------------------------------------------------ 4. joints */
    const S4 =
        '<p class="bga-lead">Τα οστά συνδέονται μεταξύ τους με τις <strong>αρθρώσεις</strong>. Διακρίνονται σε <strong>διαρθρώσεις</strong> και <strong>συναρθρώσεις</strong>.</p>' +
        tbl(['', 'Διάρθρωση', 'Συνάρθρωση'], [
            ['Τι επιτρέπει', 'Επιτρέπει τις <strong>κινήσεις</strong> των οστών που συμμετέχουν σε αυτή', '<strong>Καμία κίνηση</strong> ή <strong>πολύ περιορισμένες</strong> κινήσεις'],
            ['Παραδείγματα του βιβλίου', 'Ώμος · αγκώνας', 'Λεκάνη (καμία κίνηση) · σπονδυλική στήλη (πολύ περιορισμένες κινήσεις)']
        ], 'bga-plain') +
        '<h4>Η διάρθρωση του αγκώνα και τα μέρη της</h4>' +
        '<div class="bt-joint-wrap"><div class="bt-stage bt-joint-stage"><svg id="bt-joint" viewBox="0 0 600 420" class="bt-svg" role="img" aria-label="Σχηματική διάρθρωση"></svg>' +
        ctrl('bt-joint-c', [['flex', '💪 Κάμψη'], ['ext', '↔ Έκταση'], ['auto', '🔁 Αυτόματα']]) + '</div>' +
        '<div class="bt-joint-info" id="bt-joint-info"></div></div>' +
        '<p class="bga-note">Πάτησε πάνω σε ένα μέρος του σχήματος για να δεις τι είναι και τι κάνει. Το σχήμα είναι σχηματικό. Κάμψη: συστέλλεται ο μυς Α και χαλαρώνει ο Β· έκταση: συστέλλεται ο Β και χαλαρώνει ο Α (όπως στη σελ. 105 του βιβλίου).</p>' +
        '<h4>Η διάρθρωση του ώμου</h4>' +
        '<p>Ο ώμος είναι το δεύτερο παράδειγμα διάρθρωσης του βιβλίου. Τα μέρη είναι τα ίδια με του αγκώνα: οστά, <strong>αρθρικός χόνδρος</strong>, <strong>αρθρικό υγρό</strong>, <strong>αρθρικός θύλακας</strong> και <strong>σύνδεσμοι</strong>.</p>' +
        '<div class="bt-joint-wrap"><div class="bt-stage bt-joint-stage"><svg id="bt-shoulder" viewBox="0 0 620 440" class="bt-svg" role="img" aria-label="Σχηματική διάρθρωση ώμου"></svg>' +
        ctrl('bt-shoulder-c', [['down', '⬇ Χέρι κάτω'], ['side', '➡ Οριζόντια'], ['up', '⬆ Ανύψωση'], ['auto', '🔁 Αυτόματα']]) + '</div>' +
        '<div class="bt-joint-info" id="bt-shoulder-info"></div></div>' +
        supp('Αγκώνας και ώμος: τι διαφέρει;', '<p>Ο αγκώνας κινείται κυρίως σε ένα επίπεδο (κάμψη και έκταση). Στον ώμο το στρογγυλό άκρο του βραχιονίου κινείται μέσα στην εσοχή της ωμοπλάτης και το χέρι μπορεί να κινηθεί προς <strong>πολλές κατευθύνσεις</strong>. Εδώ φαίνεται μία από αυτές (ανύψωση στο πλάι).</p>') +
        '<h4>Πώς γίνεται η κίνηση (σελ. 105)</h4>' +
        '<p>Οι σκελετικοί μύες συνδέονται με τα οστά με <strong>τένοντες</strong> και λειτουργούν συνήθως <strong>κατά ζεύγη</strong>: όταν ο ένας <strong>συστέλλεται</strong>, ο άλλος <strong>χαλαρώνει</strong>, και έτσι κινούνται τα οστά. Στο βιβλίο το παράδειγμα είναι η κίνηση του κάτω άκρου.</p>' +
        '<div class="bt-joint-wrap"><div>' + figs([fig('movement.png', 'Πώς γίνεται η κίνηση (σελ. 105): κάμψη και έκταση του κάτω άκρου με τους μυς Α και Β.', 'bt-fig-tall')]) + '</div>' +
        '<div><div class="bt-stage"><svg id="bt-leg" viewBox="0 0 520 460" class="bt-svg" role="img" aria-label="Κάμψη και έκταση του κάτω άκρου"></svg>' +
        ctrl('bt-leg-c', [['flex', '💪 Κάμψη'], ['ext', '↔ Έκταση'], ['auto', '🔁 Αυτόματα']]) + '<div class="bt-hy-info" id="bt-leg-info"></div></div></div></div>' +
        tbl(['Κίνηση', 'Ποιος μυς συστέλλεται', 'Ποιος μυς χαλαρώνει'], [
            ['Κάμψη του κάτω άκρου', '<strong>Α</strong>', 'Β'],
            ['Έκταση του κάτω άκρου', '<strong>Β</strong>', 'Α']
        ], 'bga-plain') +
        '<h4>Τα μέρη μιας διάρθρωσης</h4>' +
        tbl(['Μέρος', 'Τι είναι / τι κάνει (από το βιβλίο)'], [
            ['Σύνδεσμοι', 'Συγκρατούν τα οστά στη διάρθρωση'],
            ['Αρθρικός θύλακας', 'Σάκος που περιβάλλει τα οστά της διάρθρωσης'],
            ['Αρθρικό υγρό', 'Υπάρχει στην αρθρική κοιλότητα και δρα σαν «λιπαντικό»: τα οστά κινούνται χωρίς να τρίβονται μεταξύ τους και διευκολύνονται οι κινήσεις'],
            ['Αρθρικός χόνδρος', 'Καλύπτει τις επιφάνειες επαφής των οστών']
        ], 'bga-plain') +
        figs([fig('elbow.png', 'Η διάρθρωση του αγκώνα (Εικ. 5.8).'), fig('spine.png', 'Η σπονδυλική στήλη (Εικ. 5.6): οι σπόνδυλοι και οι μεσοσπονδύλιοι δίσκοι. Συνάρθρωση με πολύ περιορισμένες κινήσεις.')]) +
        box('bga-info', 'Βλάβες των αρθρώσεων (σελ. 107)',
            ul(['<strong>Κάταγμα:</strong> το σπάσιμο των οστών.',
                '<strong>Διάστρεμμα (στραμπούληγμα):</strong> κάκωση των ιστών μιας άρθρωσης (στον σύνδεσμο ή στον θύλακα), χωρίς απομάκρυνση των αρθρούμενων οστών.',
                '<strong>Εξάρθρωση:</strong> η πιο σοβαρή βλάβη μιας άρθρωσης, με απομάκρυνση των αρθρούμενων οστών.']));


    /* ---------- zoom viewer: click a picture, then wheel / buttons to zoom and drag to move ---------- */
    function openViewer(src, caption) {
        const ov = document.createElement('div');
        ov.className = 'bt-viewer';
        ov.innerHTML = '<div class="bt-v-bar"><span class="bt-v-cap"></span><span class="bt-v-btns"><button type="button" data-z="out" title="Σμίκρυνση">−</button><button type="button" data-z="in" title="Μεγέθυνση">+</button><button type="button" data-z="reset" title="Αρχική θέση">⟲</button><button type="button" data-z="close" title="Κλείσιμο (Esc)">✕</button></span></div><div class="bt-v-area"><img alt="" draggable="false"></div>';
        ov.querySelector('.bt-v-cap').textContent = caption;
        const area = ov.querySelector('.bt-v-area'), im = ov.querySelector('img');
        im.src = src;
        document.body.appendChild(ov);
        const st = { k: 1, x: 0, y: 0 };
        const apply = () => { im.style.transform = 'translate(' + st.x + 'px,' + st.y + 'px) scale(' + st.k + ')'; };
        const zoomAt = (f, cx, cy) => {
            const r = area.getBoundingClientRect();
            const px = (cx === undefined ? r.left + r.width / 2 : cx) - r.left - r.width / 2, py = (cy === undefined ? r.top + r.height / 2 : cy) - r.top - r.height / 2;
            const nk = Math.min(10, Math.max(1, st.k * f)), g = nk / st.k;
            st.x = px - (px - st.x) * g; st.y = py - (py - st.y) * g; st.k = nk;
            if (nk === 1) { st.x = 0; st.y = 0; }
            apply();
        };
        const close = () => { document.removeEventListener('keydown', onKey); ov.remove(); };
        const onKey = (e) => { if (e.key === 'Escape') close(); else if (e.key === '+') zoomAt(1.3); else if (e.key === '-') zoomAt(1 / 1.3); };
        document.addEventListener('keydown', onKey);
        ov.addEventListener('click', (e) => {
            const z = e.target.dataset && e.target.dataset.z;
            if (z === 'close' || e.target === ov) close();
            else if (z === 'in') zoomAt(1.4); else if (z === 'out') zoomAt(1 / 1.4);
            else if (z === 'reset') { st.k = 1; st.x = 0; st.y = 0; apply(); }
        });
        area.addEventListener('wheel', (e) => { e.preventDefault(); zoomAt(e.deltaY < 0 ? 1.2 : 1 / 1.2, e.clientX, e.clientY); }, { passive: false });
        area.addEventListener('dblclick', (e) => { if (st.k > 1) { st.k = 1; st.x = 0; st.y = 0; apply(); } else zoomAt(3, e.clientX, e.clientY); });
        const pts = new Map(); let lastD = 0;
        area.addEventListener('pointerdown', (e) => { area.setPointerCapture(e.pointerId); pts.set(e.pointerId, { x: e.clientX, y: e.clientY }); lastD = 0; });
        area.addEventListener('pointermove', (e) => {
            const pr = pts.get(e.pointerId); if (!pr) return;
            if (pts.size === 2) {
                pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
                const [a, b] = [...pts.values()]; const dd = Math.hypot(a.x - b.x, a.y - b.y);
                if (lastD) zoomAt(dd / lastD, (a.x + b.x) / 2, (a.y + b.y) / 2);
                lastD = dd; return;
            }
            if (st.k > 1) { st.x += e.clientX - pr.x; st.y += e.clientY - pr.y; apply(); }
            pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
        });
        const up = (e) => pts.delete(e.pointerId);
        area.addEventListener('pointerup', up); area.addEventListener('pointercancel', up);
        area.style.touchAction = 'none';
    }


    /* ------------------------------------------------------------ 5. aerodynamic / hydrodynamic shape */
    const S5 =
        '<p class="bga-lead">Στα σπονδυλωτά ο σκελετός και το σχήμα του σώματος διαφέρουν ανάλογα με το περιβάλλον όπου ζουν και μετακινούνται.</p>' +
        tbl(['Περιβάλλον', 'Μετακίνηση', 'Τι λέει το βιβλίο'], [
            ['Αέρας', 'Πτήση', 'Μπροστινά άκρα σε <strong>πτέρυγες</strong>. Τα φτερά είναι <strong>ελαφριά</strong>. Το σώμα των σπονδυλωτών που πετούν έχει <strong>αεροδυναμικό σχήμα</strong>, που εξυπηρετεί την πτήση.'],
            ['Νερό', 'Κολύμβηση', 'Διευκολύνεται από το <strong>υδροδυναμικό σχήμα</strong> του σώματος, από τα <strong>πτερύγια</strong> και τα <strong>λέπια</strong>.'],
            ['Ξηρά', 'Βάδιση, τρέξιμο, έρπειν', 'Άκρα <strong>κάθετα προς το έδαφος</strong>· τα ερπετά (π.χ. φίδια) μετακινούνται έρποντας.']
        ], 'bga-plain') +
        figs([fig('bird.png', 'Πτηνό: αεροδυναμικό σχήμα, πτέρυγες, ελαφριά φτερά.'), fig('fish.png', 'Ψάρια: υδροδυναμικό σχήμα, πτερύγια, λέπια.'), fig('tortoise.png', 'Χελώνα στην ξηρά: βάδιση με άκρα κάθετα προς το έδαφος.')]) +
        '<h4>Τι σημαίνουν οι όροι «αεροδυναμικό» και «υδροδυναμικό» σχήμα</h4>' +
        supp('Η φυσική με λίγα λόγια',
            ul(['Όταν ένα σώμα κινείται μέσα στον <strong>αέρα</strong> ή στο <strong>νερό</strong> (που λέγονται ρευστά), το ρευστό <strong>αντιστέκεται</strong> στην κίνησή του. Αυτή η αντίσταση λέγεται <strong>αντίσταση του ρευστού</strong> (στον αέρα: αεροδυναμική αντίσταση).',
                'Η αντίσταση εξαρτάται από το <strong>σχήμα</strong>. Αν το μπροστινό μέρος είναι τετράγωνο και το πίσω απότομο, το ρευστό δεν προλαβαίνει να «κλείσει» πίσω από το σώμα και σχηματίζει <strong>στροβίλους</strong> (ακαταστατική ροή). Η αντίσταση είναι μεγάλη και το σώμα καταναλώνει πολλή ενέργεια για να προχωρήσει.',
                'Ένα σώμα με <strong>στρογγυλεμένο μέτωπο και μυτερή ουρά</strong> (σχήμα σταγόνας) αφήνει το ρευστό να ρέει ομαλά γύρω του, χωρίς στροβίλους. Η αντίσταση είναι μικρή.',
                '<strong>Αεροδυναμικό</strong> λέμε το σχήμα που μειώνει την αντίσταση του <strong>αέρα</strong>· <strong>υδροδυναμικό</strong> αυτό που μειώνει την αντίσταση του <strong>νερού</strong>. Είναι η ίδια ιδέα, σε διαφορετικό ρευστό.',
                'Το νερό είναι πολύ πυκνότερο από τον αέρα, γι’ αυτό η αντίσταση του νερού είναι πολύ μεγαλύτερη και το καλό σχήμα έχει ακόμη μεγαλύτερη σημασία για τα ψάρια.'])) +
        '<h4>Δες τη ροή γύρω από διαφορετικά σχήματα</h4>' +
        '<div class="bt-stage"><div class="bt-flowgrid" id="bt-flow"></div><p class="bga-note">Οι γραμμές δείχνουν πώς κινείται το ρευστό (από αριστερά προς τα δεξιά). Η ένδειξη «αντίσταση» είναι ποιοτική, για σύγκριση των σχημάτων.</p></div>' +
        '<h4>Παραδείγματα από τη φύση</h4>' +
        '<div class="bt-stage"><div class="bt-flowgrid" id="bt-flow2"></div></div>' +
        '<p class="bga-note">Το βιβλίο δίνει μόνο τα ονόματα των σχημάτων· η εξήγηση της φυσικής και τα σχέδια ροής είναι συμπληρωματικά και δεν ζητούνται.</p>';

    /* ================================================================== visuals */
    const NS = 'http://www.w3.org/2000/svg';
    const el = (n, a, p) => { const e = document.createElementNS(NS, n); Object.keys(a || {}).forEach(k => e.setAttribute(k, a[k])); if (p) p.appendChild(e); return e; };

    function initWorm(root) {
        const svg = root.querySelector('#bt-worm'); if (!svg) return;
        const N = 14;
        el('rect', { x: 0, y: 0, width: 800, height: 230, fill: '#f1f5f9' }, svg);
        el('rect', { x: 0, y: 175, width: 800, height: 55, fill: '#bf9b6a' }, svg);
        const dashes = el('g', {}, svg);
        for (let i = 0; i < 14; i++) el('rect', { x: i * 70, y: 195 + (i % 3) * 9, width: 26, height: 5, rx: 2, fill: '#8a6a3f' }, dashes);
        const segs = [];
        for (let i = 0; i < N; i++) {
            const g = el('g', {}, svg);
            const body = el('ellipse', { cx: 0, cy: 0, rx: 20, ry: 20, fill: '#d6a39a', stroke: '#8d5b52', 'stroke-width': 2.5 }, g);
            const band = el('path', { d: '', fill: 'none', stroke: '#6b3d36', 'stroke-width': 2.2, opacity: 0.7 }, g);
            const bristle = el('g', {}, g);
            for (const dx of [-8, 8]) el('line', { x1: dx, y1: 0, x2: dx + (dx < 0 ? -4 : 4), y2: 12, stroke: '#4b2d28', 'stroke-width': 2.6, 'stroke-linecap': 'round' }, bristle);
            segs.push({ g, body, band, bristle });
        }
        const head = el('circle', { r: 6, fill: '#4b2d28' }, svg);
        let t = 0, last = performance.now(), paused = false;
        root.querySelector('#bt-worm-c').addEventListener('click', e => {
            if (e.target.dataset.act === 'pause') { paused = !paused; e.target.textContent = paused ? '▶ Συνέχεια' : '⏸ Παύση'; }
        });
        function frame(now) {
            if (!root.isConnected) return;
            requestAnimationFrame(frame);
            const dt = Math.max(0, Math.min(0.05, (now - last) / 1000)); last = now;
            if (!svg.clientWidth) return;
            if (!paused) t += dt;
            let x = 70;
            segs.forEach((s, i) => {
                const c = Math.sin(t * 2.2 - i * 0.62);                // >0: longitudinal muscles contract (short, fat); <0: circular muscles contract (long, thin)
                const len = 41 - 13 * c, h = 29 + 11 * c;
                const cx = x + len / 2; x += len * 0.9;
                s.g.setAttribute('transform', 'translate(' + cx.toFixed(1) + ',' + (175 - h).toFixed(1) + ')');
                s.body.setAttribute('rx', (len / 2 + 2).toFixed(1)); s.body.setAttribute('ry', h.toFixed(1));
                const col = c > 0 ? 'rgb(' + Math.round(214 + 30 * c) + ',' + Math.round(163 - 30 * c) + ',' + Math.round(154 - 80 * c) + ')' : 'rgb(' + Math.round(214 + 70 * c) + ',' + Math.round(163 + 20 * -c) + ',' + Math.round(154 + 70 * -c) + ')';
                s.body.setAttribute('fill', c > 0 ? 'hsl(' + (22 - 8 * c) + ',70%,' + (68 - 12 * c) + '%)' : 'hsl(' + (200 + 10 * -c) + ',65%,' + (72 - 10 * -c) + '%)');
                s.band.setAttribute('d', c < 0 ? 'M' + (-len * 0.2) + ',' + (-h * 0.9) + ' Q0,' + (-h * 1.05) + ' ' + (len * 0.2) + ',' + (-h * 0.9) + ' M' + (-len * 0.2) + ',' + (h * 0.9) + ' Q0,' + (h * 1.05) + ' ' + (len * 0.2) + ',' + (h * 0.9) : 'M' + (-len * 0.3) + ',0 L' + (len * 0.3) + ',0');
                s.bristle.setAttribute('transform', 'translate(0,' + (h - 3).toFixed(1) + ')');
                s.bristle.setAttribute('opacity', c > 0.1 ? Math.min(1, c * 1.6).toFixed(2) : 0.12);
            });
            head.setAttribute('cx', (x + 4).toFixed(1)); head.setAttribute('cy', (175 - 26).toFixed(1));
            dashes.setAttribute('transform', 'translate(' + (-((t * 16) % 70)).toFixed(1) + ',0)');
        }
        requestAnimationFrame(frame);
    }


    function initHydra(root) {
        const svg = root.querySelector('#bt-hydra'); if (!svg) return;
        const info = root.querySelector('#bt-hydra-info');
        const MODES = {
            rest: { L: 215, w: 32, bend: 0, tent: 1.0, circ: 0, lon: 0, side: 0, prey: 0, t: 'Ηρεμία: οι δύο ομάδες μυών είναι χαλαρές και το υγρό δίνει στο σώμα το σχήμα του σωλήνα. Η ύδρα στέκεται όρθια, προσκολλημένη στον βυθό.' },
            long: { L: 300, w: 22, bend: 0, tent: 1.1, circ: 1, lon: 0, side: 0, prey: 0, t: 'Συστέλλονται οι <strong>κυκλικοί</strong> μύες (μπλε): ο σωλήνας στενεύει και, επειδή το υγρό δεν πάει πουθενά, το σώμα <strong>επιμηκύνεται</strong>.' },
            short: { L: 125, w: 48, bend: 0, tent: 0.55, circ: 0, lon: 1, side: 0, prey: 0, t: 'Συστέλλονται οι <strong>επιμήκεις</strong> μύες (πορτοκαλί): το σώμα <strong>κονταίνει</strong> και φουσκώνει. Οι κεραίες μαζεύονται.' },
            bend: { L: 215, w: 32, bend: 1.0, tent: 1.0, circ: 0, lon: 0.5, side: 1, prey: 0, t: 'Συστέλλονται οι επιμήκεις μύες <strong>της μίας πλευράς</strong> (πορτοκαλί): το σώμα <strong>λυγίζει</strong> προς αυτή την πλευρά. Η ύδρα κινείται, αλλά η βάση της μένει στον βυθό: δεν μετακινείται.' },
            catch: { L: 235, w: 29, bend: 0.8, tent: 1.7, circ: 0.4, lon: 0.4, side: 1, prey: 1, t: 'Η ύδρα <strong>κινεί τις κεραίες της</strong> για να προσλάβει την τροφή της: το σώμα σκύβει προς την τροφή και οι κεραίες απλώνονται.' }
        };
        let mode = 'rest', last = performance.now(), t = 0;
        const cur = { L: 215, w: 32, bend: 0, tent: 1, circ: 0, lon: 0, side: 0, prey: 0 };
        info.innerHTML = MODES.rest.t;
        root.querySelector('#bt-hydra-c').addEventListener('click', e => {
            const m = e.target.dataset.act; if (!m || !MODES[m]) return;
            mode = m; info.innerHTML = MODES[m].t;
        });
        const bx = 400, by = 392;
        function frame(now) {
            if (!root.isConnected) return;
            requestAnimationFrame(frame);
            const dt = Math.max(0, Math.min(0.05, (now - last) / 1000)); last = now;
            if (!svg.clientWidth) return;
            t += dt;
            const T = MODES[mode], k = 1 - Math.exp(-dt * 4.5);
            ['L', 'w', 'bend', 'tent', 'circ', 'lon', 'side', 'prey'].forEach(q => { cur[q] += (T[q] - cur[q]) * k; });
            // centre line from the base upwards; heading starts up and turns by the total bend
            const n = 26, pts = [];
            let x = bx, y = by - 10, h = -Math.PI / 2;
            for (let i = 0; i <= n; i++) {
                pts.push([x, y, h]);
                x += Math.cos(h) * cur.L / n; y += Math.sin(h) * cur.L / n;
                h += (cur.bend * 1.25) / n + 0.012 * Math.sin(t * 1.4 + i * 0.3) * (mode === 'rest' ? 1 : 0.4);
            }
            const hw = (i) => cur.w * (1.12 - 0.35 * i / n);
            const off = (p, d) => [p[0] + Math.cos(p[2] + Math.PI / 2) * d, p[1] + Math.sin(p[2] + Math.PI / 2) * d];
            const L = pts.map((p, i) => off(p, -hw(i))), R = pts.map((p, i) => off(p, hw(i)));
            const poly = (a, b) => a.concat(b.slice().reverse()).map(q => q[0].toFixed(1) + ',' + q[1].toFixed(1)).join(' ');
            const Li = pts.map((p, i) => off(p, -hw(i) * 0.62)), Ri = pts.map((p, i) => off(p, hw(i) * 0.62));
            let s = '<defs><linearGradient id="hy-sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bae6fd"/><stop offset="1" stop-color="#0e7490"/></linearGradient></defs>' +
                '<rect width="800" height="440" fill="url(#hy-sea)"/><path d="M0,404 C120,392 220,414 340,404 S600,394 800,406 L800,440 L0,440 Z" fill="#a16207"/><path d="M0,414 C140,404 260,424 400,414 S650,408 800,418 L800,440 L0,440 Z" fill="#78350f"/>';
            // base (foot disc) on a rock
            s += '<ellipse cx="' + bx + '" cy="' + (by + 2) + '" rx="46" ry="12" fill="#f472b6" stroke="#be185d" stroke-width="3"/>';
            // body
            s += '<polygon points="' + poly(L, R) + '" fill="#f9a8d4" stroke="#be185d" stroke-width="4" stroke-linejoin="round"/>';
            // fluid inside
            s += '<polygon points="' + poly(Li, Ri) + '" fill="#bae6fd" stroke="#38bdf8" stroke-width="2" opacity="0.95"/>';
            // fluid particles moving along the tube
            for (let i = 0; i < 9; i++) {
                const u = ((t * 0.18 + i / 9) % 1) * n, ii = Math.min(n, Math.floor(u)), p = pts[ii];
                const sd = Math.sin(i * 2.3) * hw(ii) * 0.35;
                const q = off(p, sd);
                s += '<circle cx="' + q[0].toFixed(1) + '" cy="' + q[1].toFixed(1) + '" r="4" fill="#0284c7" opacity="0.65"/>';
            }
            // circular muscles (rings): blue; stronger when they contract
            const ca = (0.25 + 0.75 * cur.circ).toFixed(2), cw = (2 + 3.5 * cur.circ).toFixed(1);
            for (let i = 1; i < n; i += 2) {
                const a = off(pts[i], -hw(i)), b = off(pts[i], hw(i));
                s += '<line x1="' + a[0].toFixed(1) + '" y1="' + a[1].toFixed(1) + '" x2="' + b[0].toFixed(1) + '" y2="' + b[1].toFixed(1) + '" stroke="#2563eb" stroke-width="' + cw + '" opacity="' + ca + '" stroke-linecap="round"/>';
            }
            // longitudinal muscles: orange; both sides, or only one side when bending
            const lw = (2 + 4 * cur.lon).toFixed(1);
            const side = (arr, base, extra) => 'M' + arr.map(q => q[0].toFixed(1) + ',' + q[1].toFixed(1)).join(' L');
            const la = (0.25 + 0.75 * Math.max(cur.lon, 0)).toFixed(2);
            const outer = pts.map((p, i) => off(p, -hw(i) * 0.82)), outer2 = pts.map((p, i) => off(p, hw(i) * 0.82));
            const bendSide = cur.side;
            s += '<path d="' + side(outer) + '" fill="none" stroke="#ea580c" stroke-width="' + ((2 + 6 * cur.lon * (0.4 + 0.6 * bendSide)).toFixed(1)) + '" opacity="' + (0.3 + 0.7 * Math.min(1, cur.lon * 1.5)).toFixed(2) + '" stroke-linecap="round"/>';
            s += '<path d="' + side(outer2) + '" fill="none" stroke="#ea580c" stroke-width="' + ((2 + 4 * cur.lon * (1 - 0.7 * bendSide)).toFixed(1)) + '" opacity="' + (0.25 + 0.5 * Math.min(1, cur.lon * (1 - 0.6 * bendSide))).toFixed(2) + '" stroke-linecap="round"/>';
            // mouth and tentacles
            const top = pts[n], mouth = off(top, 0);
            s += '<ellipse cx="' + mouth[0].toFixed(1) + '" cy="' + mouth[1].toFixed(1) + '" rx="' + (hw(n) * 0.5).toFixed(1) + '" ry="7" fill="#9d174d" transform="rotate(' + ((top[2] + Math.PI / 2) * 180 / Math.PI).toFixed(1) + ' ' + mouth[0].toFixed(1) + ' ' + mouth[1].toFixed(1) + ')"/>';
            const tips = [];
            for (let k2 = 0; k2 < 6; k2++) {
                const sp = (k2 - 2.5) / 2.5;                              // -1 .. 1 across the crown
                const a0 = top[2] + sp * 1.0;
                const len = (62 + 18 * Math.abs(sp)) * cur.tent;
                const sw = Math.sin(t * 2 + k2) * 9;
                const sx = top[0] + Math.cos(top[2] + Math.PI / 2) * sp * hw(n) * 0.8, sy = top[1] + Math.sin(top[2] + Math.PI / 2) * sp * hw(n) * 0.8;
                const ex = sx + Math.cos(a0) * len + sw, ey = sy + Math.sin(a0) * len;
                const mx = sx + Math.cos(a0 + sp * 0.5) * len * 0.55, my = sy + Math.sin(a0 + sp * 0.5) * len * 0.55;
                tips.push([ex, ey]);
                s += '<path d="M' + sx.toFixed(1) + ',' + sy.toFixed(1) + ' Q' + mx.toFixed(1) + ',' + my.toFixed(1) + ' ' + ex.toFixed(1) + ',' + ey.toFixed(1) + '" fill="none" stroke="#f472b6" stroke-width="5" stroke-linecap="round"/><circle cx="' + ex.toFixed(1) + '" cy="' + ey.toFixed(1) + '" r="3.5" fill="#be185d"/>';
            }
            // prey for the "catch" mode
            if (cur.prey > 0.05) {
                const tp = tips[Math.max(0, Math.min(5, cur.side > 0 ? 5 : 0))];
                const px = tp[0] + 26 * cur.prey, py = tp[1] - 4 + Math.sin(t * 3) * 3;
                s += '<g opacity="' + Math.min(1, cur.prey).toFixed(2) + '"><ellipse cx="' + px.toFixed(1) + '" cy="' + py.toFixed(1) + '" rx="12" ry="7" fill="#16a34a" stroke="#14532d" stroke-width="2"/><circle cx="' + (px + 9).toFixed(1) + '" cy="' + (py - 2).toFixed(1) + '" r="2" fill="#052e16"/></g>';
            }
            // legend inside the picture
            s += '<g font-size="17" font-weight="800"><rect x="16" y="14" width="16" height="16" rx="3" fill="#2563eb"/><text x="38" y="28" fill="#0f172a">κυκλικοί μύες</text><rect x="16" y="40" width="16" height="16" rx="3" fill="#ea580c"/><text x="38" y="54" fill="#0f172a">επιμήκεις μύες</text><rect x="16" y="66" width="16" height="16" rx="3" fill="#bae6fd" stroke="#38bdf8"/><text x="38" y="80" fill="#0f172a">υγρό στο εσωτερικό</text></g>';
            s += '<text x="' + (bx + 70) + '" y="' + (by + 26) + '" font-size="16" font-weight="800" fill="#fef3c7">προσκολλημένη στον βυθό</text>';
            svg.innerHTML = s;
        }
        requestAnimationFrame(frame);
    }


    /* streamlines around a body: panels with a blunt, a round and a streamlined shape (qualitative, for comparison) */
    function flowPanel(o) {
        const cx = 130, cy = 92;
        let lines = '';
        const ys = [-72, -54, -38, -24, -12, 12, 24, 38, 54, 72];
        ys.forEach((y0, idx) => {
            const sign = Math.sign(y0), a0 = Math.abs(y0);
            let pts = '';
            for (let x = 0; x <= 260; x += 4) {
                let y = y0;
                const dx = (x - cx) / o.sw;
                if (a0 < o.H + 18) y = sign * (a0 + (o.H + 10 - a0 * 0.4) * Math.exp(-dx * dx));       // pushed around the body
                if (x > cx + o.len) y += sign * o.wake * Math.exp(-(x - cx - o.len) / 55) * Math.sin((x - cx) / 7 + idx) * (a0 < o.H + 28 ? 1 : 0.2);
                pts += (x ? 'L' : 'M') + x + ',' + (cy + y).toFixed(1);
            }
            lines += '<path d="' + pts + '" class="bt-fl"/>';
        });
        const swirl = o.wake > 8 ? '<g class="bt-swirl"><circle cx="' + (cx + o.len + 24) + '" cy="' + (cy - 14) + '" r="14"/><circle cx="' + (cx + o.len + 24) + '" cy="' + (cy + 18) + '" r="14"/><circle cx="' + (cx + o.len + 56) + '" cy="' + (cy + 2) + '" r="9"/></g>' : '';
        return '<div class="bt-flow"><div class="bt-flow-t">' + o.name + '</div><svg viewBox="0 0 260 184" class="bt-svg">' + lines + swirl + '<g class="bt-body">' + o.shape + '</g></svg>' +
            '<div class="bt-drag"><span>αντίσταση</span><div class="bt-drag-bar"><i style="width:' + o.drag + '%;background:' + o.col + '"></i></div><b>' + o.dragT + '</b></div></div>';
    }
    function initFlow(root) {
        const a = root.querySelector('#bt-flow'), b = root.querySelector('#bt-flow2'); if (!a || !b) return;
        const cx = 130, cy = 92;
        a.innerHTML =
            flowPanel({ name: 'Επίπεδο (απότομο) σχήμα', H: 46, sw: 14, len: 8, wake: 22, drag: 92, col: '#dc2626', dragT: 'μεγάλη', shape: '<rect x="' + (cx - 7) + '" y="' + (cy - 46) + '" width="14" height="92" rx="3"/>' }) +
            flowPanel({ name: 'Σφαίρα (στρογγυλό)', H: 36, sw: 30, len: 36, wake: 11, drag: 52, col: '#f59e0b', dragT: 'μέτρια', shape: '<circle cx="' + cx + '" cy="' + cy + '" r="36"/>' }) +
            flowPanel({ name: 'Σχήμα σταγόνας (αεροδυναμικό / υδροδυναμικό)', H: 26, sw: 52, len: 62, wake: 2.5, drag: 14, col: '#16a34a', dragT: 'μικρή', shape: '<path d="M' + (cx - 52) + ',' + cy + ' C' + (cx - 52) + ',' + (cy - 26) + ' ' + (cx - 6) + ',' + (cy - 28) + ' ' + (cx + 26) + ',' + (cy - 12) + ' L' + (cx + 64) + ',' + cy + ' L' + (cx + 26) + ',' + (cy + 12) + ' C' + (cx - 6) + ',' + (cy + 28) + ' ' + (cx - 52) + ',' + (cy + 26) + ' ' + (cx - 52) + ',' + cy + ' Z"/>' });
        b.innerHTML =
            flowPanel({ name: 'Ψάρι στο νερό (υδροδυναμικό)', H: 24, sw: 52, len: 66, wake: 3, drag: 16, col: '#0ea5e9', dragT: 'μικρή', shape: '<path d="M' + (cx - 58) + ',' + cy + ' C' + (cx - 50) + ',' + (cy - 24) + ' ' + (cx - 4) + ',' + (cy - 26) + ' ' + (cx + 30) + ',' + (cy - 8) + ' L' + (cx + 52) + ',' + (cy - 20) + ' L' + (cx + 52) + ',' + (cy + 20) + ' L' + (cx + 30) + ',' + (cy + 8) + ' C' + (cx - 4) + ',' + (cy + 26) + ' ' + (cx - 50) + ',' + (cy + 24) + ' ' + (cx - 58) + ',' + cy + ' Z"/><circle cx="' + (cx - 38) + '" cy="' + (cy - 5) + '" r="3.5" class="bt-eye"/><path d="M' + (cx - 14) + ',' + (cy - 20) + ' L' + (cx + 2) + ',' + (cy - 36) + ' L' + (cx + 14) + ',' + (cy - 14) + '" class="bt-fin"/>' }) +
            flowPanel({ name: 'Πουλί στον αέρα (αεροδυναμικό)', H: 24, sw: 50, len: 60, wake: 3, drag: 18, col: '#16a34a', dragT: 'μικρή', shape: '<path d="M' + (cx - 56) + ',' + (cy + 2) + ' L' + (cx - 44) + ',' + (cy - 3) + ' C' + (cx - 36) + ',' + (cy - 24) + ' ' + (cx + 4) + ',' + (cy - 24) + ' ' + (cx + 26) + ',' + (cy - 6) + ' L' + (cx + 60) + ',' + (cy + 2) + ' L' + (cx + 26) + ',' + (cy + 8) + ' C' + (cx + 4) + ',' + (cy + 24) + ' ' + (cx - 36) + ',' + (cy + 20) + ' ' + (cx - 44) + ',' + (cy + 6) + ' Z"/><path d="M' + (cx - 6) + ',' + (cy - 14) + ' Q' + (cx + 4) + ',' + (cy - 44) + ' ' + (cx + 34) + ',' + (cy - 38) + ' Q' + (cx + 20) + ',' + (cy - 20) + ' ' + (cx + 8) + ',' + (cy - 12) + ' Z" class="bt-fin"/><circle cx="' + (cx - 34) + '" cy="' + (cy - 6) + '" r="3" class="bt-eye"/>' }) +
            flowPanel({ name: 'Αντιπαράδειγμα: χελώνα (σκληρό, ψηλό καβούκι)', H: 38, sw: 28, len: 40, wake: 9, drag: 58, col: '#f59e0b', dragT: 'μέτρια', shape: '<path d="M' + (cx - 40) + ',' + (cy + 14) + ' C' + (cx - 40) + ',' + (cy - 40) + ' ' + (cx + 40) + ',' + (cy - 40) + ' ' + (cx + 40) + ',' + (cy + 14) + ' Z"/><rect x="' + (cx - 46) + '" y="' + (cy + 12) + '" width="92" height="10" rx="4"/>' });
    }

    function initMedusa(root) {
        const svg = root.querySelector('#bt-medusa'); if (!svg) return;
        el('rect', { x: 0, y: 0, width: 800, height: 260, fill: '#0e7490' }, svg);
        el('rect', { x: 0, y: 0, width: 800, height: 260, fill: 'url(#bt-sea)', opacity: 0 }, svg);
        const g = el('g', {}, svg);
        const bell = el('path', { d: '', fill: '#f9a8d4', stroke: '#be185d', 'stroke-width': 3, 'fill-opacity': 0.85 }, g);
        const rings = el('g', { fill: 'none', stroke: '#9d174d', 'stroke-width': 2.2, opacity: 0.8 }, g);
        const arms = el('g', { fill: 'none', stroke: '#f9a8d4', 'stroke-width': 4, 'stroke-linecap': 'round', opacity: 0.9 }, g);
        const note = el('text', { x: 400, y: 245, 'text-anchor': 'middle', fill: '#e0f2fe', 'font-size': 18, 'font-weight': 700 }, svg);
        let t = 0, last = performance.now(), paused = false;
        root.querySelector('#bt-medusa-c').addEventListener('click', e => {
            if (e.target.dataset.act === 'pause') { paused = !paused; e.target.textContent = paused ? '▶ Συνέχεια' : '⏸ Παύση'; }
        });
        function frame(now) {
            if (!root.isConnected) return;
            requestAnimationFrame(frame);
            const dt = Math.max(0, Math.min(0.05, (now - last) / 1000)); last = now;
            if (!svg.clientWidth) return;
            if (!paused) t += dt;
            const ph = (Math.sin(t * 2.4) + 1) / 2;              // 1: bell contracted
            const w = 150 - 55 * ph, h = 70 + 12 * ph;
            const cy = 120 - 18 * Math.sin(t * 2.4 - 0.5);
            bell.setAttribute('d', 'M' + (-w) + ',0 C' + (-w) + ',' + (-h * 1.5) + ' ' + w + ',' + (-h * 1.5) + ' ' + w + ',0 Q' + (w * 0.5) + ',' + (14 - 8 * ph) + ' 0,6 Q' + (-w * 0.5) + ',' + (14 - 8 * ph) + ' ' + (-w) + ',0 Z');
            let r = '';
            for (let k = 1; k <= 3; k++) r += '<path d="M' + (-w * (1 - 0.1 * k)) + ',' + (-h * 0.35 * k * 0.9) + ' Q0,' + (-h * (0.45 * k + 0.18)) + ' ' + (w * (1 - 0.1 * k)) + ',' + (-h * 0.35 * k * 0.9) + '"/>';
            rings.innerHTML = r;
            let a = '';
            for (let k = -2; k <= 2; k++) a += '<path d="M' + (k * w * 0.35) + ',10 q' + (6 * Math.sin(t * 3 + k)) + ',40 ' + (-4 * Math.sin(t * 3 + k * 2)) + ',80"/>';
            arms.innerHTML = a;
            g.setAttribute('transform', 'translate(400,' + cy.toFixed(1) + ')');
            note.textContent = ph > 0.5 ? 'οι κυκλικές μυϊκές ίνες συστέλλονται: ο θόλος στενεύει' : 'οι μυϊκές ίνες χαλαρώνουν: ο θόλος ανοίγει';
        }
        requestAnimationFrame(frame);
    }

    function animalShape(s, shellScale, o) {
        o = o || {};
        let out = '';
        const legs = (sc, stroke, w, joint) => {
            let l = '';
            for (let i = -1; i <= 1; i++) {
                const x = 110 + i * 26 * sc;
                [-1, 1].forEach(sd => {
                    const kx = x + sd * 12 * sc, ky = 120 + 18 * sc;
                    l += '<polyline points="' + x + ',' + (96 + 4 * sc) + ' ' + kx + ',' + ky + ' ' + (kx + sd * 14 * sc) + ',' + (ky + 26 * sc) + '" fill="none" stroke="' + stroke + '" stroke-width="' + w + '" stroke-linejoin="round" stroke-linecap="round"/>';
                    if (joint) l += '<circle cx="' + kx + '" cy="' + ky + '" r="' + (w * 0.8) + '" fill="' + stroke + '"/>';
                });
            }
            return l;
        };
        if (s) {
            out += legs(s, '#d97706', 5 * s, false);
            out += '<ellipse cx="' + (110 + (o.dx || 0)) + '" cy="82" rx="' + 58 * s + '" ry="' + 26 * s + '" fill="#fbbf24" stroke="#b45309" stroke-width="2.5"/>';
            out += '<circle cx="' + (110 + (o.dx || 0) + 60 * s) + '" cy="80" r="' + 13 * s + '" fill="#f59e0b" stroke="#b45309" stroke-width="2.5"/>';
        }
        if (shellScale) {
            const sc = shellScale;
            out += '<ellipse cx="110" cy="82" rx="' + 64 * sc + '" ry="' + 31 * sc + '" fill="rgba(146,64,14,0.14)" stroke="#92400e" stroke-width="' + (o.thin ? 2.5 : 6) + '"' + (o.ghost ? ' stroke-dasharray="7 6"' : '') + '/>';
            out += '<circle cx="' + (110 + 64 * sc) + '" cy="80" r="' + 16 * sc + '" fill="rgba(146,64,14,0.14)" stroke="#92400e" stroke-width="' + (o.thin ? 2.5 : 6) + '"/>';
            out += legs(sc, '#92400e', o.thin ? 3 : 6, true);
        }
        return out;
    }
    function initMolt(root) {
        const host = root.querySelector('#bt-molt'); if (!host) return;
        const P = [
            ['1. Ο εξωσκελετός ταιριάζει στο ζώο', '<g transform="translate(0,0)">' + animalShape(0.86, 0.9) + '</g>'],
            ['2. Το ζώο αναπτύσσεται', '<g>' + animalShape(1.0, 0.9) + '<path d="M60,50 l8,-8 l6,10 l8,-9 M150,48 l8,-9 l5,10" fill="none" stroke="#dc2626" stroke-width="3" stroke-linecap="round"/></g>'],
            ['3. Ο παλιός εξωσκελετός αποβάλλεται', '<g><g transform="translate(-42,4) scale(0.85)" opacity="0.9">' + animalShape(0, 0.9, { ghost: true, thin: true }) + '</g><g transform="translate(40,0)">' + animalShape(1.0, 0, {}) + '</g></g>'],
            ['4. Δημιουργείται νέος εξωσκελετός', '<g><g transform="translate(-52,10) scale(0.72)" opacity="0.7">' + animalShape(0, 0.9, { ghost: true, thin: true }) + '</g><g transform="translate(20,0)">' + animalShape(1.0, 1.1, {}) + '</g></g>']
        ];
        host.innerHTML = P.map((p, i) => '<div class="bt-step" data-i="' + i + '"><svg viewBox="-20 20 270 190" class="bt-step-svg">' + p[1] + '</svg><div class="bt-step-t">' + p[0] + '</div></div>').join('');
        let cur = 0, auto = false, tm = 0;
        const show = (i) => { cur = (i + P.length) % P.length; host.querySelectorAll('.bt-step').forEach((e, k) => e.classList.toggle('on', k === cur)); };
        show(0);
        const c = root.querySelector('#bt-molt-c');
        c.addEventListener('click', e => {
            const a = e.target.dataset.act; if (!a) return;
            if (a === 'next') { show(cur + 1); } else if (a === 'prev') { show(cur - 1); }
            else if (a === 'play') {
                auto = !auto; e.target.textContent = auto ? '⏸ Παύση' : '▶ Αυτόματα';
                clearInterval(tm); if (auto) tm = setInterval(() => { if (!root.isConnected) { clearInterval(tm); return; } show(cur + 1); }, 1800);
            }
        });
        host.addEventListener('click', e => { const s = e.target.closest('.bt-step'); if (s) show(+s.dataset.i); });
    }

    function initSkel(root) {
        const svg = root.querySelector('#bt-skel'); if (!svg) return;
        const legend = (cx, items) => items.map((it, i) => '<rect x="' + (cx - 130) + '" y="' + (248 + i * 22) + '" width="14" height="14" rx="3" fill="' + it[0] + '" stroke="#334155"/><text x="' + (cx - 108) + '" y="' + (260 + i * 22) + '" font-size="15" font-weight="700" fill="#0f172a">' + it[1] + '</text>').join('');
        const draw = (mode) => {
            const showEndo = mode !== 'exo', showExo = mode !== 'endo';
            let s = '<rect width="800" height="320" fill="#f8fafc"/>';
            if (showEndo) {
                const cx = showExo ? 210 : 400;
                s += '<g transform="translate(' + cx + ',130)"><circle r="92" fill="#fde3c8" stroke="#b9772e" stroke-width="5"/><circle r="76" fill="#f87171" opacity="0.9"/><circle r="34" fill="#e5e7eb" stroke="#64748b" stroke-width="5"/><circle r="13" fill="#fef9c3"/></g>' +
                    '<text x="' + cx + '" y="24" text-anchor="middle" font-size="21" font-weight="800" fill="#0f172a">Ενδοσκελετός</text>' +
                    legend(cx, [['#e5e7eb', 'οστό (ο σκελετός είναι μέσα)'], ['#f87171', 'μύες (γύρω από το οστό)'], ['#fde3c8', 'δέρμα (εξωτερικά)']]);
            }
            if (showExo) {
                const cx = showEndo ? 590 : 400;
                s += '<g transform="translate(' + cx + ',130)"><circle r="92" fill="#a16207" stroke="#713f12" stroke-width="5"/><circle r="74" fill="#f87171" opacity="0.9"/><circle r="40" fill="#fde68a" stroke="#ca8a04" stroke-width="3"/></g>' +
                    '<text x="' + cx + '" y="24" text-anchor="middle" font-size="21" font-weight="800" fill="#0f172a">Εξωσκελετός</text>' +
                    legend(cx, [['#a16207', 'σκελετός (εξωτερικό περίβλημα)'], ['#f87171', 'μύες (μέσα στο περίβλημα)'], ['#fde68a', 'εσωτερικά όργανα']]);
            }
            svg.innerHTML = s;
        };
        draw('both');
        root.querySelector('#bt-skel-c').addEventListener('click', e => { if (e.target.dataset.act) draw(e.target.dataset.act); });
    }

    const JINFO = {
        bone1: ['Οστό (π.χ. βραχιόνιο)', 'Τα οστά είναι συμπαγείς και σκληρές δομές. Συνδέονται μεταξύ τους με τις αρθρώσεις.'],
        bone2: ['Οστό (π.χ. πήχης)', 'Τα οστά συνδέονται μεταξύ τους με τις αρθρώσεις. Στη διάρθρωση κινούνται το ένα ως προς το άλλο.'],
        cart: ['Αρθρικός χόνδρος', 'Καλύπτει τις επιφάνειες επαφής των οστών.'],
        fluid: ['Αρθρικό υγρό', 'Υπάρχει στην αρθρική κοιλότητα και δρα σαν «λιπαντικό» που διευκολύνει τις κινήσεις: τα οστά κινούνται χωρίς να τρίβονται μεταξύ τους.'],
        capsule: ['Αρθρικός θύλακας', 'Ο σάκος που περιβάλλει τα οστά της διάρθρωσης.'],
        lig: ['Σύνδεσμοι', 'Συγκρατούν τα οστά στη διάρθρωση.'],
        muA: ['Μυς Α', 'Οι σκελετικοί μύες λειτουργούν κατά ζεύγη και προσφύονται στα οστά με τένοντες. Στην κάμψη ο μυς Α συστέλλεται και ο Β χαλαρώνει.'],
        muB: ['Μυς Β', 'Οι σκελετικοί μύες λειτουργούν κατά ζεύγη και προσφύονται στα οστά με τένοντες. Στην έκταση ο μυς Β συστέλλεται και ο Α χαλαρώνει.']
    };
    function initJoint(root) {
        const svg = root.querySelector('#bt-joint'); if (!svg) return;
        const info = root.querySelector('#bt-joint-info');
        const P = { x: 260, y: 190 };
        svg.innerHTML = '<rect width="600" height="420" fill="#f8fafc"/>' +
            '<g id="j-up"><rect x="228" y="20" width="64" height="170" rx="22" fill="#ecd9b8" stroke="#a16207" stroke-width="3" data-p="bone1" class="j-part"/><circle cx="260" cy="190" r="40" fill="#ecd9b8" stroke="#a16207" stroke-width="3" data-p="bone1" class="j-part"/></g>' +
            '<g id="j-low"><rect x="228" y="190" width="64" height="200" rx="22" fill="#ecd9b8" stroke="#a16207" stroke-width="3" data-p="bone2" class="j-part"/></g>' +
            '<path id="j-cart1" d="" fill="none" stroke="#0ea5e9" stroke-width="9" stroke-linecap="round" data-p="cart" class="j-part"/>' +
            '<path id="j-cart2" d="" fill="none" stroke="#0ea5e9" stroke-width="9" stroke-linecap="round" data-p="cart" class="j-part"/>' +
            '<ellipse id="j-fluid" cx="260" cy="190" rx="62" ry="50" fill="rgba(125,211,252,0.35)" stroke="none" data-p="fluid" class="j-part"/>' +
            '<ellipse id="j-caps" cx="260" cy="190" rx="86" ry="74" fill="none" stroke="#2563eb" stroke-width="5" stroke-dasharray="12 7" data-p="capsule" class="j-part"/>' +
            '<g id="j-ligs"></g><g id="j-mus"></g>' +
            '<g font-size="17" font-weight="800" fill="#0f172a"><text x="360" y="102" id="t-1">αρθρικός θύλακας</text><text x="360" y="130" id="t-2">αρθρικό υγρό</text><text x="360" y="158" id="t-3">αρθρικός χόνδρος</text><text x="360" y="186" id="t-4">σύνδεσμοι</text></g>' +
            '<g id="j-ptr" stroke="#0f172a" stroke-width="1.6"><line x1="356" y1="97" x2="338" y2="124"/><line x1="356" y1="125" x2="310" y2="172"/><line x1="356" y1="153" x2="300" y2="196"/><line x1="356" y1="181" x2="330" y2="205"/></g>';
        const gUp = svg.querySelector('#j-up'), gLow = svg.querySelector('#j-low'), ligs = svg.querySelector('#j-ligs'), mus = svg.querySelector('#j-mus');
        const c1 = svg.querySelector('#j-cart1'), c2 = svg.querySelector('#j-cart2');
        const mk = (n, o) => { const e = document.createElementNS(NS, n); Object.keys(o).forEach(k => e.setAttribute(k, o[k])); return e; };
        const L1 = mk('line', { stroke: '#7c3aed', 'stroke-width': 6, 'stroke-linecap': 'round', 'data-p': 'lig', class: 'j-part' });
        const L2 = mk('line', { stroke: '#7c3aed', 'stroke-width': 6, 'stroke-linecap': 'round', 'data-p': 'lig', class: 'j-part' });
        ligs.appendChild(L1); ligs.appendChild(L2);
        const MA = mk('path', { fill: 'none', 'stroke-linecap': 'round', 'data-p': 'muA', class: 'j-part' });
        const MB = mk('path', { fill: 'none', 'stroke-linecap': 'round', 'data-p': 'muB', class: 'j-part' });
        mus.appendChild(MA); mus.appendChild(MB);
        [['Α', 120, 200], ['Β', 392, 262]].forEach(x => { const t = mk('text', { x: x[1], y: x[2], 'font-size': 22, 'font-weight': 900, fill: '#7f1d1d' }); t.textContent = x[0]; mus.appendChild(t); });
        let ang = 0, target = 0, auto = false;
        const rot = (px, py, a) => { const r = a * Math.PI / 180; const dx = px - P.x, dy = py - P.y; return [P.x + dx * Math.cos(r) - dy * Math.sin(r), P.y + dx * Math.sin(r) + dy * Math.cos(r)]; };
        function layout() {
            gLow.setAttribute('transform', 'rotate(' + ang.toFixed(1) + ' ' + P.x + ' ' + P.y + ')');
            // cartilage arcs on the two bone ends
            c1.setAttribute('d', 'M222,172 A40,40 0 0 1 298,172');
            const a0 = 180 + ang;      // lower end arc
            const p1 = rot(224, 204, ang), p2 = rot(296, 204, ang), pm = rot(260, 232, ang);
            c2.setAttribute('d', 'M' + p1[0].toFixed(1) + ',' + p1[1].toFixed(1) + ' Q' + pm[0].toFixed(1) + ',' + pm[1].toFixed(1) + ' ' + p2[0].toFixed(1) + ',' + p2[1].toFixed(1));
            // ligaments: from upper bone to lower bone, both sides, outside the capsule
            const lA = rot(224, 262, ang), lB = rot(296, 262, ang);
            const set = (n, o) => Object.keys(o).forEach(k => n.setAttribute(k, o[k]));
            set(L1, { x1: 224, y1: 122, x2: lA[0].toFixed(1), y2: lA[1].toFixed(1) });
            set(L2, { x1: 296, y1: 122, x2: lB[0].toFixed(1), y2: lB[1].toFixed(1) });
            // muscles A (front, left) and B (back, right): from the upper bone to the lower bone; the thickness shows who contracts
            const flexed = ang / 70;
            const a1 = rot(200, 300, ang), b1 = rot(320, 300, ang);
            const wA = 8 + 14 * flexed, wB = 8 + 14 * (1 - flexed);
            set(MA, { d: 'M196,60 Q150,190 ' + a1[0].toFixed(1) + ',' + a1[1].toFixed(1), 'stroke-width': wA.toFixed(1), stroke: 'rgba(220,38,38,' + (0.35 + 0.6 * flexed).toFixed(2) + ')' });
            set(MB, { d: 'M324,60 Q372,190 ' + b1[0].toFixed(1) + ',' + b1[1].toFixed(1), 'stroke-width': wB.toFixed(1), stroke: 'rgba(220,38,38,' + (0.35 + 0.6 * (1 - flexed)).toFixed(2) + ')' });
        }
        const show = (k) => { const d = JINFO[k]; if (d) info.innerHTML = '<div class="bt-jcard"><h4>' + d[0] + '</h4><p>' + d[1] + '</p></div>'; };
        info.innerHTML = '<div class="bt-jcard"><h4>Διάρθρωση</h4><p>Πάτησε ένα μέρος του σχήματος. Με τα κουμπιά «Κάμψη» και «Έκταση» κινείς την άρθρωση και βλέπεις ποιος μυς συστέλλεται.</p></div>';
        svg.addEventListener('click', e => { const p = e.target.closest('[data-p]'); if (p) show(p.dataset.p); });
        root.querySelector('#bt-joint-c').addEventListener('click', e => {
            const a = e.target.dataset.act; if (!a) return;
            if (a === 'flex') { auto = false; target = 70; } else if (a === 'ext') { auto = false; target = 0; }
            else if (a === 'auto') { auto = !auto; e.target.textContent = auto ? '⏸ Παύση' : '🔁 Αυτόματα'; }
        });
        let last = performance.now(), t = 0;
        function frame(now) {
            if (!root.isConnected) return;
            requestAnimationFrame(frame);
            const dt = Math.max(0, Math.min(0.05, (now - last) / 1000)); last = now;
            if (!svg.clientWidth) return;
            if (auto) { t += dt; target = 35 + 35 * Math.sin(t * 1.6); }
            ang += (target - ang) * (1 - Math.exp(-dt * 6));
            layout();
        }
        layout();
        requestAnimationFrame(frame);
    }


    const SINFO = {
        scap: ['Οστό (ωμοπλάτη)', 'Η ωμοπλάτη είναι ένα από τα οστά του ώμου. Τα οστά συνδέονται μεταξύ τους με τις αρθρώσεις.'],
        hum: ['Οστό (βραχιόνιο)', 'Το βραχιόνιο κινείται στη διάρθρωση του ώμου. Στη διάρθρωση τα οστά κινούνται το ένα ως προς το άλλο.'],
        cart: JINFO.cart, fluid: JINFO.fluid, capsule: JINFO.capsule, lig: JINFO.lig
    };
    function initShoulder(root) {
        const svg = root.querySelector('#bt-shoulder'); if (!svg) return;
        const info = root.querySelector('#bt-shoulder-info');
        const P = { x: 300, y: 200 };
        svg.innerHTML = '<rect width="620" height="440" fill="#f8fafc"/>' +
            '<path d="M24,40 L246,40 Q306,76 292,128 C268,158 258,184 266,206 C258,232 270,252 294,278 Q304,330 246,366 L24,366 Z" fill="#e8d9b5" stroke="#a16207" stroke-width="3" data-p="scap" class="j-part"/>' +
            '<text x="40" y="210" font-size="20" font-weight="800" fill="#7c5a12">ωμοπλάτη</text>' +
            '<ellipse cx="300" cy="200" rx="82" ry="88" fill="rgba(125,211,252,0.35)" data-p="fluid" class="j-part"/>' +
            '<g id="s-hum"><rect x="272" y="214" width="56" height="210" rx="22" fill="#ecd9b8" stroke="#a16207" stroke-width="3" data-p="hum" class="j-part"/><circle cx="300" cy="200" r="44" fill="#ecd9b8" stroke="#a16207" stroke-width="3" data-p="hum" class="j-part"/><path d="M268,174 A42,42 0 0 0 268,226" fill="none" stroke="#0ea5e9" stroke-width="8" stroke-linecap="round" data-p="cart" class="j-part"/></g>' +
            '<path d="M272,150 A52,52 0 0 0 272,250" fill="none" stroke="#0ea5e9" stroke-width="9" stroke-linecap="round" data-p="cart" class="j-part"/>' +
            '<ellipse cx="300" cy="200" rx="96" ry="104" fill="none" stroke="#2563eb" stroke-width="5" stroke-dasharray="12 7" data-p="capsule" class="j-part"/>' +
            '<g id="s-lig"></g>' +
            '<text x="372" y="90" font-size="17" font-weight="800" fill="#0f172a">αρθρικός θύλακας</text><text x="372" y="118" font-size="17" font-weight="800" fill="#0f172a">αρθρικό υγρό</text><text x="372" y="146" font-size="17" font-weight="800" fill="#0f172a">αρθρικός χόνδρος</text><text x="372" y="174" font-size="17" font-weight="800" fill="#0f172a">σύνδεσμοι</text>' +
            '<g stroke="#0f172a" stroke-width="1.6"><line x1="368" y1="85" x2="352" y2="140"/><line x1="368" y1="113" x2="330" y2="170"/><line x1="368" y1="141" x2="262" y2="186"/><line x1="368" y1="169" x2="340" y2="248"/></g>';
        const hum = svg.querySelector('#s-hum'), lig = svg.querySelector('#s-lig');
        const mk = (n, o) => { const e = document.createElementNS(NS, n); Object.keys(o).forEach(k => e.setAttribute(k, o[k])); return e; };
        const L1 = mk('line', { stroke: '#7c3aed', 'stroke-width': 6, 'stroke-linecap': 'round', 'data-p': 'lig', class: 'j-part' });
        const L2 = mk('line', { stroke: '#7c3aed', 'stroke-width': 6, 'stroke-linecap': 'round', 'data-p': 'lig', class: 'j-part' });
        lig.appendChild(L1); lig.appendChild(L2);
        let ang = 0, target = 0, auto = false, t = 0;       // 0: arm down, 90: horizontal (to the right), 170: raised
        const rot = (px, py, a) => { const r = -a * Math.PI / 180; const dx = px - P.x, dy = py - P.y; return [P.x + dx * Math.cos(r) - dy * Math.sin(r), P.y + dx * Math.sin(r) + dy * Math.cos(r)]; };
        function layout() {
            hum.setAttribute('transform', 'rotate(' + (-ang).toFixed(1) + ' ' + P.x + ' ' + P.y + ')');
            const a = rot(278, 262, ang), b = rot(322, 262, ang);
            L1.setAttribute('x1', 262); L1.setAttribute('y1', 112); L1.setAttribute('x2', a[0].toFixed(1)); L1.setAttribute('y2', a[1].toFixed(1));
            L2.setAttribute('x1', 262); L2.setAttribute('y1', 290); L2.setAttribute('x2', b[0].toFixed(1)); L2.setAttribute('y2', b[1].toFixed(1));
        }
        const show = (k) => { const dd = SINFO[k]; if (dd) info.innerHTML = '<div class="bt-jcard"><h4>' + dd[0] + '</h4><p>' + dd[1] + '</p></div>'; };
        info.innerHTML = '<div class="bt-jcard"><h4>Διάρθρωση του ώμου</h4><p>Πάτησε ένα μέρος του σχήματος. Με τα κουμπιά κινείς το χέρι και βλέπεις το άκρο του βραχιονίου να κινείται μέσα στην εσοχή της ωμοπλάτης, με τον χόνδρο και το υγρό να μειώνουν την τριβή.</p></div>';
        svg.addEventListener('click', e => { const q = e.target.closest('[data-p]'); if (q) show(q.dataset.p); });
        root.querySelector('#bt-shoulder-c').addEventListener('click', e => {
            const a = e.target.dataset.act; if (!a) return;
            if (a === 'auto') { auto = !auto; e.target.textContent = auto ? '⏸ Παύση' : '🔁 Αυτόματα'; }
            else { auto = false; target = { down: 0, side: 90, up: 165 }[a]; }
        });
        let last = performance.now();
        function frame(now) {
            if (!root.isConnected) return;
            requestAnimationFrame(frame);
            const dt = Math.max(0, Math.min(0.05, (now - last) / 1000)); last = now;
            if (!svg.clientWidth) return;
            if (auto) { t += dt; target = 82 + 82 * Math.sin(t * 1.2 - 1.57); }
            ang += (target - ang) * (1 - Math.exp(-dt * 5));
            layout();
        }
        layout();
        requestAnimationFrame(frame);
    }

    function initLeg(root) {
        const svg = root.querySelector('#bt-leg'); if (!svg) return;
        const info = root.querySelector('#bt-leg-info');
        const H = { x: 270, y: 70 }, KN = { x: 270, y: 240 };
        svg.innerHTML = '<rect width="520" height="460" fill="#f8fafc"/>' +
            '<text x="40" y="40" font-size="18" font-weight="800" fill="#0f172a">εμπρός</text><text x="410" y="40" font-size="18" font-weight="800" fill="#0f172a">πίσω</text>' +
            '<rect x="238" y="70" width="64" height="170" rx="26" fill="#ecd9b8" stroke="#a16207" stroke-width="3"/>' +
            '<g id="l-low"><rect x="240" y="240" width="60" height="176" rx="24" fill="#ecd9b8" stroke="#a16207" stroke-width="3"/><path d="M240,410 q-44,2 -40,26 l100,0 q-6,-24 0,-26 Z" fill="#d6c19a" stroke="#a16207" stroke-width="3"/></g>' +
            '<circle cx="270" cy="240" r="34" fill="#ecd9b8" stroke="#a16207" stroke-width="3"/>' +
            '<path id="l-mA" d="" fill="none" stroke-linecap="round"/><path id="l-mB" d="" fill="none" stroke-linecap="round"/>' +
            '<g font-size="30" font-weight="900" fill="#7f1d1d"><text x="378" y="150">Α</text><text x="136" y="150">Β</text></g>' +
            '<g id="l-arrow"></g>';
        const low = svg.querySelector('#l-low'), mA = svg.querySelector('#l-mA'), mB = svg.querySelector('#l-mB');
        let ang = 0, target = 0, auto = false, t = 0;       // 0 straight; 100 flexed (foot goes backwards = to the right)
        const rot = (px, py, a) => { const r = -a * Math.PI / 180; const dx = px - KN.x, dy = py - KN.y; return [KN.x + dx * Math.cos(r) - dy * Math.sin(r), KN.y + dx * Math.sin(r) + dy * Math.cos(r)]; };
        const TXT = {
            flex: 'Για να γίνει η <strong>κάμψη</strong> του κάτω άκρου, <strong>συστέλλεται ο μυς Α</strong> και <strong>χαλαρώνει ο Β</strong>.',
            ext: 'Για να γίνει <strong>έκταση</strong> του κάτω άκρου, <strong>συστέλλεται ο μυς Β</strong> και <strong>χαλαρώνει ο Α</strong>.',
            mid: 'Οι δύο μύες λειτουργούν κατά ζεύγη: όταν ο ένας συστέλλεται, ο άλλος χαλαρώνει. Πάτησε «Κάμψη» ή «Έκταση».'
        };
        info.innerHTML = TXT.mid;
        function layout() {
            low.setAttribute('transform', 'rotate(' + (-ang).toFixed(1) + ' ' + KN.x + ' ' + KN.y + ')');
            const f = ang / 100;                               // 0..1 flexion
            const a1 = rot(318, 350, ang), b1 = rot(222, 330, ang);
            const mus = (el, x0, y0, bx, by, x1, y1, w, op) => {
                el.setAttribute('d', 'M' + x0 + ',' + y0 + ' Q' + bx + ',' + by + ' ' + x1.toFixed(1) + ',' + y1.toFixed(1));
                el.setAttribute('stroke-width', w.toFixed(1)); el.setAttribute('stroke', 'rgba(220,38,38,' + op.toFixed(2) + ')');
            };
            mus(mA, 312, 96, 372, 220 - 30 * f, a1[0], a1[1], 8 + 18 * f, 0.3 + 0.65 * f);
            mus(mB, 228, 96, 164, 230 + 20 * f, b1[0], b1[1], 8 + 18 * (1 - f), 0.3 + 0.65 * (1 - f));
        }
        root.querySelector('#bt-leg-c').addEventListener('click', e => {
            const a = e.target.dataset.act; if (!a) return;
            if (a === 'flex') { auto = false; target = 100; info.innerHTML = TXT.flex; }
            else if (a === 'ext') { auto = false; target = 0; info.innerHTML = TXT.ext; }
            else if (a === 'auto') { auto = !auto; e.target.textContent = auto ? '⏸ Παύση' : '🔁 Αυτόματα'; }
        });
        let last = performance.now();
        function frame(now) {
            if (!root.isConnected) return;
            requestAnimationFrame(frame);
            const dt = Math.max(0, Math.min(0.05, (now - last) / 1000)); last = now;
            if (!svg.clientWidth) return;
            if (auto) { t += dt; const s = Math.sin(t * 1.3); target = 50 + 50 * s; info.innerHTML = s > 0.15 ? TXT.flex : (s < -0.15 ? TXT.ext : TXT.mid); }
            ang += (target - ang) * (1 - Math.exp(-dt * 6));
            layout();
        }
        layout();
        requestAnimationFrame(frame);
    }

    /* ------------------------------------------------------------ 6. coccyx: the tail that was lost */
    function spineSvg() {
        const sacrum = (cx) => '<path d="M' + (cx - 40) + ',58 L' + (cx + 40) + ',58 L' + (cx + 22) + ',112 L' + (cx - 22) + ',112 Z" fill="#fde68a" stroke="#b45309" stroke-width="3"/><text x="' + cx + ' " y="88" font-size="13" font-weight="800" fill="#78350f" text-anchor="middle">ιερό οστό</text>';
        const coccyx = (cx) => '<path d="M' + (cx - 15) + ',117 L' + (cx + 15) + ',117 L' + (cx + 5) + ',164 L' + (cx - 5) + ',164 Z" fill="#fbbf24" stroke="#b45309" stroke-width="3"/><g stroke="#b45309" stroke-width="2"><line x1="' + (cx - 13) + '" y1="130" x2="' + (cx + 13) + '" y2="130"/><line x1="' + (cx - 11) + '" y1="143" x2="' + (cx + 11) + '" y2="143"/><line x1="' + (cx - 8) + '" y1="154" x2="' + (cx + 8) + '" y2="154"/></g>';
        let tail = '';
        for (let i = 0; i < 14; i++) {
            const y = 124 + i * 14, x = 145 + 22 * Math.sin(i * 0.4), rx = 11 - i * 0.45, ry = 6.2 - i * 0.2;
            tail += '<ellipse cx="' + x.toFixed(1) + '" cy="' + y + '" rx="' + rx.toFixed(1) + '" ry="' + ry.toFixed(1) + '" fill="#fbbf24" stroke="#b45309" stroke-width="2.5"/>';
        }
        const lab = (cx, t1, t2) => '<text x="' + cx + '" y="30" font-size="17" font-weight="800" fill="#0f172a" text-anchor="middle">' + t1 + '</text><text x="' + cx + '" y="326" font-size="13.5" font-weight="700" fill="#475569" text-anchor="middle">' + t2 + '</text>';
        return '<svg viewBox="0 0 860 340" class="bg-svg" role="img" aria-label="Το τέλος της σπονδυλικής στήλης σε πίθηκο με ουρά, χιμπατζή και άνθρωπο">' +
            '<rect width="860" height="340" fill="#f8fafc"/>' +
            '<line x1="287" y1="12" x2="287" y2="328" stroke="#94a3b8" stroke-width="2" stroke-dasharray="6 6"/><line x1="573" y1="12" x2="573" y2="328" stroke="#94a3b8" stroke-width="2" stroke-dasharray="6 6"/>' +
            sacrum(145) + tail + lab(145, 'Πίθηκος με ουρά', 'πολλοί σπόνδυλοι (πάνω από 10)') +
            sacrum(430) + coccyx(430) + lab(430, 'Χιμπατζής', 'κόκκυγας: 3–5 συντηγμένοι σπόνδυλοι') +
            sacrum(715) + coccyx(715) + lab(715, 'Άνθρωπος', 'κόκκυγας: 3–5 συντηγμένοι σπόνδυλοι') +
            '<text x="430" y="252" font-size="15" font-weight="800" fill="#b91c1c" text-anchor="middle">καμία εξωτερική ουρά</text><text x="715" y="252" font-size="15" font-weight="800" fill="#b91c1c" text-anchor="middle">καμία εξωτερική ουρά</text>' +
            '<text x="145" y="12" font-size="11.5" fill="#64748b" text-anchor="middle">σχηματικό (όχι υπό κλίμακα)</text>' +
            '</svg>';
    }

    function treeSvg() {
        const line = (x1, y1, x2, y2, c) => '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + (c || '#334155') + '" stroke-width="4" stroke-linecap="round"/>';
        const lab = (x, y, t, c) => '<text x="' + x + '" y="' + (y + 5) + '" font-size="15" font-weight="800" fill="' + (c || '#0f172a') + '">' + t + '</text>';
        return '<svg viewBox="0 0 860 330" class="bg-svg" role="img" aria-label="Απλό δέντρο: πώς οι ανθρωποειδείς πίθηκοι έχασαν την ουρά">' +
            '<rect width="860" height="330" fill="#f8fafc"/>' +
            line(40, 150, 200, 150) + line(200, 150, 200, 50) + line(200, 50, 600, 50, '#047857') + lab(612, 42, 'πίθηκοι Παλαιού Κόσμου') + '<text x="612" y="66" font-size="14" font-weight="700" fill="#047857">(π.χ. μακάκοι): έχουν ουρά</text>' +
            line(200, 150, 200, 190) + line(200, 190, 330, 190, '#b91c1c') +
            '<g stroke="#dc2626" stroke-width="6" stroke-linecap="round"><path d="M254,178 l22,22 M276,178 l-22,22"/></g><text x="265" y="222" font-size="14.5" font-weight="800" fill="#b91c1c" text-anchor="middle">απώλεια ουράς</text>' +
            line(330, 120, 330, 260, '#b91c1c') +
            line(330, 120, 600, 120, '#b91c1c') + lab(612, 120, 'γίββωνες') +
            line(330, 160, 600, 160, '#b91c1c') + lab(612, 160, 'ουρακοτάγκοι') +
            line(330, 200, 600, 200, '#b91c1c') + lab(612, 200, 'γορίλες') +
            line(330, 260, 470, 260, '#b91c1c') + line(470, 240, 470, 280, '#b91c1c') + line(470, 240, 600, 240, '#b91c1c') + lab(612, 240, 'χιμπατζήδες') + line(470, 280, 600, 280, '#b91c1c') + lab(612, 280, 'άνθρωπος', '#1d4ed8') +
            '<text x="40" y="140" font-size="13.5" font-weight="700" fill="#475569">κοινός πρόγονος</text>' +
            '<text x="430" y="318" font-size="13.5" fill="#475569" text-anchor="middle">Η ουρά χάθηκε στον κοινό πρόγονο, πριν από περίπου 20–25 εκατ. χρόνια. Σχηματικό δέντρο, όχι υπό κλίμακα.</text>' +
            '</svg>';
    }

    const S6 =
        '<div class="bga-box bt-supp"><strong>➕ Όλη η ενότητα <span class="bt-tag">συμπληρωματικό · εκτός βιβλίου · δεν ζητείται</span></strong><p>Το βιβλίο δείχνει τις συναρθρώσεις της σπονδυλικής στήλης. Εδώ δίνεται μια πρόσθετη ματιά στο τελευταίο της τμήμα, τον κόκκυγα, και στην εξελικτική του ιστορία. Τα σχέδια είναι δικά μας, σχηματικά.</p></div>' +
        '<h4>Τι είναι ο κόκκυγας;</h4>' +
        '<p>Ο <strong>κόκκυγας</strong> (το «ουραίο οστό») είναι το τελευταίο τμήμα της σπονδυλικής στήλης: <strong>3 έως 5 μικροί σπόνδυλοι ενωμένοι</strong> κάτω από το ιερό οστό. Είναι ό,τι έχει μείνει από την ουρά των προγόνων μας. Η σύνδεσή του με το ιερό οστό είναι μια σχεδόν ακίνητη <strong>συνάρθρωση</strong> (όχι κανονική κινητή άρθρωση) και με την ηλικία πολλές φορές οστεοποιείται.</p>' +
        '<h4>Πώς είναι το ίδιο σημείο σε άλλα πρωτεύοντα</h4>' +
        '<div class="bt-stage">' + spineSvg() + '</div>' +
        '<p class="bga-note">Ο χιμπατζής δεν έχει ουρά, όπως και ο άνθρωπος· το ίδιο ισχύει για τους γορίλες, τους ουρακοτάγκους και τους γίββωνες. Μαζί λέγονται <strong>ανθρωποειδείς πίθηκοι</strong>. Οι περισσότεροι άλλοι πίθηκοι (π.χ. μακάκοι, μπαμπουίνοι) έχουν ουρά.</p>' +
        '<div class="bt-stage">' + treeSvg() + '</div>' +
        '<h4>Σε τι χρησίμευε η ουρά</h4>' +
        tbl(['Λειτουργία', 'Παραδείγματα', 'Πώς βοηθά'], [
            ['Ισορροπία', 'γάτα, σκίουρος, πίθηκοι που τρέχουν πάνω στα κλαδιά', 'Λειτουργεί σαν <strong>αντίβαρο</strong> όταν το ζώο περπατά ή πηδά σε στενές επιφάνειες.'],
            ['Πρόσφυση', 'αράχνη-πίθηκος, οπόσουμ', 'Η ουρά κρατά τα κλαδιά, σαν <strong>πέμπτο άκρο</strong>.'],
            ['Κίνηση στο νερό', 'ψάρια, φάλαινες, κροκόδειλοι', 'Δίνει <strong>ώθηση</strong> στην κολύμβηση.'],
            ['Στήριξη', 'καγκουρό', 'Στηρίζει το ζώο όταν στέκεται όρθιο, σαν <strong>τρίτο πόδι</strong>.'],
            ['Επικοινωνία και άμυνα', 'σκύλος, λύκος, άλογο, αγελάδα', 'Δείχνει διάθεση ή <strong>διώχνει έντομα</strong>.']
        ], 'bga-plain') +
        '<h4>Τι κάνει ο κόκκυγας σήμερα</h4>' +
        ul(['Σε αυτόν <strong>πιάνονται μύες και σύνδεσμοι</strong> της πυέλου (του «πυθμένα» της λεκάνης), που στηρίζουν όργανα και βοηθούν στον έλεγχο της αποβολής.',
            'Όταν κάθεσαι γερμένος προς τα πίσω, στηρίζει μέρος του βάρους, μαζί με τα ισχιακά οστά.',
            'Ο κόκκυγας δεν είναι «άχρηστος»: δεν χρησιμεύει πια ως ουρά, αλλά έχει άλλο ρόλο.']) +
        '<h4>Γιατί χάθηκε η ουρά: τρεις σκέψεις που πρέπει να ξεχωρίσουμε</h4>' +
        box('bga-warn', '⚠️ Η συνηθισμένη εξήγηση είναι λάθος',
            '<p>Δεν ισχύει ότι «η ουρά χάθηκε γιατί δεν τη χρησιμοποιούσαν». Μια αλλαγή που προκύπτει από τη <strong>χρήση ή τη μη χρήση</strong> ενός οργάνου <strong>δεν μεταβιβάζεται</strong> στους απογόνους. Οι απόγονοι διαφέρουν επειδή υπάρχουν <strong>μεταλλάξεις</strong> (τυχαίες αλλαγές στο DNA) που κληρονομούνται.</p>') +
        flow(['1. Μια μετάλλαξη σε έναν πρόγονο εμποδίζει την ανάπτυξη ουράς', '2. Μεταβιβάζεται στους απογόνους του', '3. Αν δεν βλάπτει (ή και ωφελεί), διαδίδεται στον πληθυσμό', '4. Μετά από πολλές γενιές όλοι οι απόγονοι δεν έχουν ουρά']) +
        '<h4>Γιατί δεν εξαλείφθηκε η μετάλλαξη;</h4>' +
        '<p>Στα ζώα που κινούνται σε δέντρα με ισορροπία πάνω στα κλαδιά, η απώλεια ουράς είναι μειονέκτημα και η μετάλλαξη θα εξαφανιζόταν. Οι ανθρωποειδείς πίθηκοι όμως είχαν <strong>μεγαλύτερο σώμα</strong> και κινούνταν διαφορετικά: <strong>αναρριχώνται και κρέμονται από τα κλαδιά</strong> με τα χέρια, με πιο όρθιο κορμό. Έτσι η ουρά ήταν <strong>λιγότερο σημαντική για την ισορροπία</strong>. Η μετάλλαξη δεν έφερνε μεγάλο μειονέκτημα και μπορούσε να διαδοθεί. Οι ερευνητές εξετάζουν τρεις πιθανές αιτίες:</p>' +
        tbl(['Πιθανότητα', 'Τι σημαίνει'], [
            ['Ουδέτερη αλλαγή', 'Η ουρά δεν είχε πλέον μεγάλη σημασία, οπότε η μετάλλαξη διαδόθηκε <strong>τυχαία</strong>.'],
            ['Πλεονέκτημα', 'Η έλλειψη ουράς ίσως βοηθούσε στη νέα κίνηση (όρθιος κορμός, κρέμασμα). Αυτό είναι μια <strong>υπόθεση</strong>.'],
            ['Συνδυασμός ή «ανταλλαγή»', 'Η ίδια αλλαγή στο DNA μπορεί να έχει και <strong>άλλες συνέπειες</strong> (δείτε παρακάτω). Επιβίωσε επειδή το συνολικό αποτέλεσμα δεν ήταν βλαβερό.']
        ], 'bga-plain') +
        '<p class="bga-note">Δεν ξέρουμε με βεβαιότητα ποια ισχύει. Η εξέλιξη δεν «σχεδιάζει» ούτε επιλέγει κάτι επειδή «χρειάζεται»: διαδίδεται ό,τι δεν εμποδίζει την επιβίωση και τη δημιουργία απογόνων.</p>' +
        supp('Η έρευνα του 2024: ποιο γονίδιο εμπλέκεται',
            '<p>Μια μελέτη του 2024 (δημοσιευμένη στο περιοδικό <em>Nature</em>) βρήκε στους ανθρωποειδείς πιθήκους και στον άνθρωπο ένα <strong>επιπλέον τμήμα DNA</strong> (ένα «μεταθετό στοιχείο» της οικογένειας Alu) μέσα στο γονίδιο <strong>TBXT</strong>, που παίζει ρόλο στην ανάπτυξη της ουράς. Το τμήμα αυτό αλλάζει τον τρόπο που «διαβάζεται» το γονίδιο. Σε πειράματα με ποντίκια, αυτή η αλλαγή έδωσε ποντίκια με πολύ κοντή ουρά ή χωρίς ουρά.</p>' +
            ul(['Η αλλαγή αυτή <strong>συνδέθηκε</strong> και με μεγαλύτερο κίνδυνο προβλημάτων στο νευρικό σωλήνα (σαν τη δισχιδή ράχη) στα ποντίκια. Οι ερευνητές το θεωρούν πιθανή «ανταλλαγή»: η απώλεια ουράς ίσως είχε κόστος, αλλά το όφελος ή η σημασία της κίνησης ήταν μεγαλύτερα.',
                'Είναι <strong>μια ερευνητική εργασία</strong>, όχι τελική απάντηση: άλλα γονίδια ίσως παίζουν ρόλο και η εξήγηση μπορεί να βελτιωθεί.']) +
            '<p>Σημείωση: η απώλεια ουράς δεν εξηγεί <em>πότε</em> ακριβώς έγινε η αλλαγή· οι χρονολογίες (περίπου 20–25 εκατ. χρόνια) και ποια απολιθώματα είχαν ή όχι ουρά (π.χ. <em>Proconsul</em>) είναι ακόμη αντικείμενο μελέτης.</p>') +
        '<h4>Τα «ίχνη» της ουράς που μένουν</h4>' +
        ul(['<strong>Στο έμβρυο:</strong> το ανθρώπινο έμβρυο έχει <strong>ουρά</strong> στις πρώτες εβδομάδες της ανάπτυξης (περίπου 4η–8η), η οποία στη συνέχεια υποχωρεί και μένει ο κόκκυγας.',
            '<strong>Υπολειμματικό όργανο:</strong> όργανο που στους προγόνους είχε μεγάλη σημασία και τώρα έχει μικρότερη ή άλλη. Ο κόκκυγας είναι <strong>ένδειξη</strong> ότι έχουμε κοινούς προγόνους με τα ζώα που έχουν ουρά.',
            '<strong>Γιατί δεν εξαφανίστηκε τελείως:</strong> επειδή η ίδια δομή ήταν χρήσιμη για κάτι άλλο (πρόσφυση μυών), δεν υπήρχε λόγος να εξαλειφθεί.']);

    function render(mount) {
        const root = K.renderPage(mount, {
            title: '🧩 Βαθιά εστίαση & ερμηνεία: στήριξη και κίνηση στα ζώα',
            intro: 'Θέματα του κεφαλαίου «Στήριξη και κίνηση» (σελ. 98–107), με εικόνες του βιβλίου και κινούμενα σχήματα. Τα πλαίσια «συμπληρωματικό» δεν είναι ύλη.',
            sections: [
                { id: 'bt1', icon: '💧', title: '1. Υδροστατικός σκελετός', nav: 'Υδροστατικός σκελετός', sub: 'μέδουσα · ύδρα · γεωσκώληκας', body: S1, open: true },
                { id: 'bt2', icon: '🦀', title: '2. Αρθρόποδα και το φαινόμενο της έκδυσης', nav: 'Αρθρόποδα και έκδυση', sub: 'καρκινοειδή · μυριάποδα · έντομα · αραχνοειδή', body: S2 },
                { id: 'bt3', icon: '🛡️', title: '3. Εξωσκελετός', nav: 'Εξωσκελετός', sub: 'ενδοσκελετός ή εξωσκελετός', body: S3 },
                { id: 'bt5', icon: '🐦', title: '5. Αεροδυναμικό και υδροδυναμικό σχήμα', nav: 'Αεροδυναμικό / υδροδυναμικό', sub: 'πτήση · κολύμβηση · αντίσταση του ρευστού', body: S5 },
                { id: 'bt4', icon: '🦴', title: '4. Διαρθρώσεις και συναρθρώσεις', nav: 'Αρθρώσεις', sub: 'μέρη της διάρθρωσης · κάμψη και έκταση', body: S4 },
                { id: 'bt6', icon: '🐒', title: '6. Ο κόκκυγας: η ουρά που χάθηκε', nav: 'Ο κόκκυγας', sub: 'πώς ήταν · σε τι χρησίμευε · γιατί χάθηκε', body: S6 }
            ]
        });
        initWorm(root); initMedusa(root); initHydra(root); initFlow(root); initShoulder(root); initLeg(root); initMolt(root); initSkel(root); initJoint(root);
        root.addEventListener('click', (e) => {
            const im = e.target.closest('.bt-fig img');
            if (im) openViewer(im.src, im.getAttribute('alt'));
        });
    }

    window.BioBTopics = { render };
})();
