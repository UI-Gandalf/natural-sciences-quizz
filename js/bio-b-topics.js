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
    const fig = (src, cap, cls) => '<figure class="bt-fig ' + (cls || '') + '"><img src="' + IMG + src + '" alt="' + cap.replace(/"/g, '') + '"><figcaption><span class="bt-src">Βιβλίο</span> ' + cap + '</figcaption></figure>';
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
        figs([fig('worm_seq.png', 'Διαδοχικές θέσεις του γεωσκώληκα καθώς μετακινείται (ένθετο «Με συστολή και… χαλάρωση»).', 'bt-fig-small')]) +
        '<h4>Η μέδουσα: παίξε την κίνηση</h4>' +
        '<div class="bt-stage"><svg id="bt-medusa" viewBox="0 0 800 260" class="bt-svg" role="img" aria-label="Κίνηση μέδουσας"></svg>' + ctrl('bt-medusa-c', [['pause', '⏸ Παύση']]) +
        '<p class="bga-note">Σχηματική απεικόνιση: ο θόλος συσπάται με τη βοήθεια κυκλικών μυϊκών ινών και το ζώο κινείται.</p></div>' +
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
        '<div class="bt-joint-wrap"><div class="bt-stage bt-joint-stage"><svg id="bt-joint" viewBox="0 0 520 420" class="bt-svg" role="img" aria-label="Σχηματική διάρθρωση"></svg>' +
        ctrl('bt-joint-c', [['flex', '💪 Κάμψη'], ['ext', '↔ Έκταση'], ['auto', '🔁 Αυτόματα']]) + '</div>' +
        '<div class="bt-joint-info" id="bt-joint-info"></div></div>' +
        '<p class="bga-note">Πάτησε πάνω σε ένα μέρος του σχήματος για να δεις τι είναι και τι κάνει. Το σχήμα είναι σχηματικό. Κάμψη: συστέλλεται ο μυς Α και χαλαρώνει ο Β· έκταση: συστέλλεται ο Β και χαλαρώνει ο Α (όπως στη σελ. 105 του βιβλίου).</p>' +
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
            const dt = Math.min(0.05, (now - last) / 1000); last = now;
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
            const dt = Math.min(0.05, (now - last) / 1000); last = now;
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
        svg.innerHTML = '<rect width="520" height="420" fill="#f8fafc"/>' +
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
            const dt = Math.min(0.05, (now - last) / 1000); last = now;
            if (!svg.clientWidth) return;
            if (auto) { t += dt; target = 35 + 35 * Math.sin(t * 1.6); }
            ang += (target - ang) * (1 - Math.exp(-dt * 6));
            layout();
        }
        layout();
        requestAnimationFrame(frame);
    }

    function render(mount) {
        const root = K.renderPage(mount, {
            title: '🧩 Ειδικά θέματα: στήριξη και κίνηση στα ζώα',
            intro: 'Τέσσερα θέματα του κεφαλαίου «Στήριξη και κίνηση» (σελ. 98–107), με εικόνες του βιβλίου και κινούμενα σχήματα. Τα πλαίσια «συμπληρωματικό» δεν είναι ύλη.',
            sections: [
                { id: 'bt1', icon: '💧', title: '1. Υδροστατικός σκελετός', nav: 'Υδροστατικός σκελετός', sub: 'μέδουσα · ύδρα · γεωσκώληκας', body: S1, open: true },
                { id: 'bt2', icon: '🦀', title: '2. Αρθρόποδα και το φαινόμενο της έκδυσης', nav: 'Αρθρόποδα και έκδυση', sub: 'καρκινοειδή · μυριάποδα · έντομα · αραχνοειδή', body: S2 },
                { id: 'bt3', icon: '🛡️', title: '3. Εξωσκελετός', nav: 'Εξωσκελετός', sub: 'ενδοσκελετός ή εξωσκελετός', body: S3 },
                { id: 'bt4', icon: '🦴', title: '4. Διαρθρώσεις και συναρθρώσεις', nav: 'Αρθρώσεις', sub: 'μέρη της διάρθρωσης · κάμψη και έκταση', body: S4 }
            ]
        });
        initWorm(root); initMedusa(root); initMolt(root); initSkel(root); initJoint(root);
    }

    window.BioBTopics = { render };
})();
