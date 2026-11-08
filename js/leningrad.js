/* ==========================================================================
   Geography Β: "Η πολιορκία του Λένινγκραντ (1941-1944)" - history + geography of the siege (Baltic, Neva, Lake Ladoga,
   the "Road of Life"). SUPPLEMENTARY material, outside the school book. A respectful, factual page about a tragedy.
   Photographs: Wikimedia Commons (credits in the captions). The map and the timeline are our own schematic drawings
   (land outline: Natural Earth, public domain; the lake and the front lines are drawn by hand and are approximate).
   window.LeningradPage.render(mountElement)   (needs LEN_LAND from js/leningrad-map-land.js and BioGuideKit)
   ========================================================================== */
window.LeningradPage = (function () {
    'use strict';
    const K = window.BioGuideKit;
    const { tbl, ul, box, flow } = K;
    const IMG = 'assets/images/leningrad/';
    const supp = (title, body) => '<div class="bga-box bt-supp"><strong>➕ ' + title + ' <span class="bt-tag">συμπληρωματικό · εκτός βιβλίου · δεν ζητείται</span></strong>' + body + '</div>';
    const photo = (file, cap, credit, href) => '<figure class="vs-fig"><img src="' + IMG + file + '" alt="' + cap.replace(/"/g, '') + '" loading="lazy"><figcaption>' + cap + ' <span class="vs-credit">' + credit + (href ? ' · <a href="' + href + '" target="_blank" rel="noopener">πηγή</a>' : '') + '</span></figcaption></figure>';

    /* ------------------------------------------------ map: the ring around the city */
    function mapHtml() {
        if (typeof LEN_LAND === 'undefined') return '';
        const L = LEN_LAND;
        const px = (lon, lat) => [(lon - L.lon0) / (L.lon1 - L.lon0) * L.w, (L.lat1 - lat) / (L.lat1 - L.lat0) * L.h];
        const P = (lon, lat) => { const p = px(lon, lat); return p[0].toFixed(0) + ',' + p[1].toFixed(0); };
        const txt = (lon, lat, t, o) => { const p = px(lon, lat); o = o || {}; return '<text x="' + (p[0] + (o.dx || 0)).toFixed(0) + '" y="' + (p[1] + (o.dy || 0)).toFixed(0) + '" font-size="' + (o.fs || 17) + '" font-weight="' + (o.fw || 800) + '" fill="' + (o.c || '#0f172a') + '" text-anchor="' + (o.a || 'start') + '"' + (o.i ? ' font-style="italic"' : '') + ' paint-order="stroke" stroke="' + (o.sc || '#fff') + '" stroke-width="4">' + t + '</text>'; };
        let s = '<svg viewBox="0 0 ' + L.w + ' ' + L.h + '" class="bg-svg" role="img" aria-label="Χάρτης: το Λένινγκραντ, η Νέβα και η λίμνη Λάντογκα"><rect width="' + L.w + '" height="' + L.h + '" fill="#bfe3f5"/>';
        L.land.forEach((d) => { s += '<path d="' + d + '" fill="#efe2bd" stroke="#b59f6b" stroke-width="1"/>'; });
        // Lake Ladoga (hand-drawn, approximate), the Neva and the Gulf
        const lake = [[31.0, 59.95], [30.4, 60.3], [30.1, 60.75], [30.15, 61.2], [30.5, 61.7], [31.2, 61.8], [32.2, 61.6], [32.85, 61.1], [32.95, 60.6], [32.5, 60.2], [32.0, 60.0], [31.5, 59.95]];
        s += '<path d="M' + lake.map((q) => P(q[0], q[1])).join(' L') + ' Z" fill="#bfe3f5" stroke="#7dc3e6" stroke-width="3" stroke-linejoin="round"/>';
        s += '<path d="M' + P(30.95, 59.95) + ' Q' + P(30.7, 59.9) + ' ' + P(30.35, 59.93) + '" fill="none" stroke="#38bdf8" stroke-width="5" stroke-linecap="round"/>';
        // ring: German lines (south) and Finnish lines (north), schematic
        s += '<path d="M' + P(29.75, 59.9) + ' Q' + P(30.2, 59.55) + ' ' + P(30.75, 59.7) + ' T' + P(31.05, 59.93) + '" fill="none" stroke="#dc2626" stroke-width="5" stroke-dasharray="10 6"/>';
        s += '<path d="M' + P(29.7, 60.0) + ' Q' + P(29.8, 60.4) + ' ' + P(30.3, 60.5) + ' T' + P(30.9, 60.45) + '" fill="none" stroke="#7c3aed" stroke-width="5" stroke-dasharray="10 6"/>';
        // Road of Life (winter ice road, schematic): from the west shore to the east shore of the southern part of the lake
        s += '<path d="M' + P(30.75, 60.2) + ' L' + P(31.55, 60.05) + '" fill="none" stroke="#16a34a" stroke-width="7" stroke-dasharray="3 7" stroke-linecap="round"/>';
        // city and places
        const city = px(30.32, 59.94);
        s += '<circle cx="' + city[0].toFixed(0) + '" cy="' + city[1].toFixed(0) + '" r="11" fill="#b91c1c" stroke="#fff" stroke-width="3"/>';
        s += txt(30.32, 59.94, 'Λένινγκραντ (Αγία Πετρούπολη)', { dx: -16, dy: -16, a: 'end', fs: 18 });
        s += txt(30.0, 59.58, 'γερμανικές γραμμές (νότια)', { dx: -10, dy: 26, a: 'start', c: '#b91c1c', fs: 15 });
        s += txt(30.0, 60.55, 'φινλανδικές γραμμές (βόρεια)', { dx: 0, dy: -26, a: 'start', c: '#6d28d9', fs: 15 });
        s += txt(31.35, 61.05, 'Λίμνη Λάντογκα', { a: 'middle', fs: 22, c: '#0369a1', i: true, sc: '#e0f2fe' });
        s += txt(27.3, 59.5, 'Κόλπος της Φινλανδίας', { a: 'middle', fs: 18, c: '#0369a1', i: true, sc: '#e0f2fe' });
        s += txt(30.65, 59.9, 'Νέβα', { dx: 0, dy: 26, a: 'start', fs: 14, c: '#0369a1', sc: '#e0f2fe' });
        const sh = px(31.03, 59.95); s += '<circle cx="' + sh[0].toFixed(0) + '" cy="' + sh[1].toFixed(0) + '" r="6" fill="#0f172a"/>' + txt(31.03, 59.95, 'Σλίσελμπουργκ (εδώ έκλεισε ο κλοιός)', { dx: 14, dy: 52, a: 'start', fs: 14 });
        s += txt(31.15, 60.12, '«Δρόμος της Ζωής» (σχηματικά)', { dx: 0, dy: -14, a: 'middle', fs: 14, c: '#15803d' });
        s += '<text x="14" y="' + (L.h - 14) + '" font-size="13" fill="#334155">Σχηματικός χάρτης: η λίμνη και οι γραμμές του μετώπου έχουν σχεδιαστεί προσεγγιστικά.</text></svg>';
        return s;
    }

    /* ------------------------------------------------ timeline */
    function timelineSvg() {
        const ev = [['8 Σεπτ. 1941', 'ο κλοιός κλείνει', '#dc2626'], ['Νοέμβριος 1941', 'ο πάγος της Λάντογκα αντέχει: ανοίγει ο «Δρόμος της Ζωής»', '#16a34a'], ['Χειμώνας 1941–42', 'ο μεγαλύτερος λιμός και κρύο', '#7c3aed'], ['18 Ιαν. 1943', 'ο κλοιός σπάει (στενός διάδρομος)', '#0891b2'], ['27 Ιαν. 1944', 'τέλος της πολιορκίας', '#15803d']];
        const x0 = 70, x1 = 690, y = 120;
        let s = '<svg viewBox="0 0 760 270" class="bg-svg" role="img" aria-label="Χρονολόγιο της πολιορκίας"><rect width="760" height="270" fill="#f8fafc"/>' +
            '<line x1="' + x0 + '" y1="' + y + '" x2="' + x1 + '" y2="' + y + '" stroke="#475569" stroke-width="5" stroke-linecap="round"/>';
        ev.forEach((e, i) => {
            const x = x0 + (x1 - x0) * i / (ev.length - 1), up = i % 2 === 0;
            s += '<circle cx="' + x + '" cy="' + y + '" r="11" fill="' + e[2] + '" stroke="#fff" stroke-width="3"/>' +
                '<line x1="' + x + '" y1="' + y + '" x2="' + x + '" y2="' + (up ? y - 36 : y + 36) + '" stroke="' + e[2] + '" stroke-width="3"/>' +
                '<text x="' + x + '" y="' + (up ? y - 82 : y + 62) + '" font-size="15.5" font-weight="800" fill="#0f172a" text-anchor="middle">' + e[0] + '</text>';
            const words = e[1].split(' '); let l1 = '', l2 = '';
            words.forEach((w) => { if ((l1 + ' ' + w).length <= 22 && !l2) l1 = (l1 + ' ' + w).trim(); else l2 = (l2 + ' ' + w).trim(); });
            s += '<text x="' + x + '" y="' + (up ? y - 64 : y + 80) + '" font-size="13.5" fill="#334155" text-anchor="middle">' + l1 + '</text>' + (l2 ? '<text x="' + x + '" y="' + (up ? y - 48 : y + 96) + '" font-size="13.5" fill="#334155" text-anchor="middle">' + l2 + '</text>' : '');
        });
        return s + '<text x="380" y="256" font-size="13.5" font-weight="800" fill="#b91c1c" text-anchor="middle">872 ημέρες πολιορκίας</text></svg>';
    }

    /* ------------------------------------------------ page */
    const S1 =
        '<div class="bga-box bt-supp"><strong>➕ Όλη η σελίδα <span class="bt-tag">συμπληρωματικό · εκτός βιβλίου · δεν ζητείται</span></strong><p>Η πολιορκία του Λένινγκραντ είναι μία από τις πιο τραγικές σελίδες του Β΄ Παγκοσμίου Πολέμου. Η σελίδα εξηγεί γεγονότα και γεωγραφία με σεβασμό προς τα θύματα. Οι φωτογραφίες είναι από το Wikimedia Commons με ελεύθερη άδεια. Ο χάρτης και το χρονολόγιο είναι δικά μας, σχηματικά. Οι αριθμοί είναι εκτιμήσεις.</p></div>' +
        '<h4>Τι συνέβη</h4>' +
        '<p>Το <strong>Λένινγκραντ</strong> (σήμερα Αγία Πετρούπολη) ήταν τότε η δεύτερη μεγαλύτερη πόλη της Σοβιετικής Ένωσης, με πληθυσμό περίπου 2,5–3 εκατομμύρια. Το καλοκαίρι του 1941 η Γερμανία επιτέθηκε στη Σοβιετική Ένωση. Τα γερμανικά στρατεύματα πλησίασαν από το νότο και τα φινλανδικά από το βορρά. Στις <strong>8 Σεπτεμβρίου 1941</strong> κατέλαβαν το Σλίσελμπουργκ, στη νοτιοανατολική άκρη της πόλης, και ο κλοιός έκλεισε. Η πολιορκία κράτησε <strong>872 ημέρες</strong>, ως τις <strong>27 Ιανουαρίου 1944</strong>.</p>' +
        '<div class="bt-stage">' + timelineSvg() + '</div>' +
        '<h4>Γιατί η Γεωγραφία έκανε τον κλοιό τόσο σκληρό</h4>' +
        '<div class="bt-stage vs-map">' + mapHtml() + '</div>' +
        ul(['Η πόλη βρίσκεται στο ανατολικό άκρο του <strong>Κόλπου της Φινλανδίας</strong>, στη Βαλτική, και στις εκβολές του ποταμού <strong>Νέβα</strong>. Από το δυτικό μέρος βρισκόταν η θάλασσα, αλλά ο εχθρός ήλεγχε τις ακτές και η Βαλτική δεν ήταν δρόμος ανεφοδιασμού.',
            'Από τα νότια και τα βόρεια ήταν τα εχθρικά στρατεύματα. Από τα ανατολικά βρίσκεται η <strong>Λάντογκα</strong>, η μεγαλύτερη λίμνη της Ευρώπης. Αυτή έγινε ο <strong>μοναδικός δρόμος</strong> προς την υπόλοιπη χώρα.',
            'Η πόλη δεν είχε αποθέματα τροφίμων για τόσο μεγάλο πληθυσμό. Ο ανεφοδιασμός έπρεπε να περάσει από τη λίμνη.']);

    const S2 =
        '<p>Η Λάντογκα είναι μεγάλη λίμνη και τον χειμώνα παγώνει. Το καλοκαίρι το νερό ήταν ο δρόμος των πλοιαρίων, ενώ ο εχθρός πυροβολούσε και βομβάρδιζε τη διαδρομή. Όταν ο πάγος έγινε αρκετά χοντρός (Νοέμβριος 1941), άνοιξε μια <strong>πάγινη οδός</strong> για φορτηγά, που ονομάστηκε <strong>«Δρόμος της Ζωής»</strong>.</p>' +
        photo('road_of_life.jpg', 'Φορτηγά στον «Δρόμο της Ζωής», πάνω στον πάγο της Λάντογκα.', 'Φωτογραφία: Αρχείο, CC0 (κοινό κτήμα), μέσω Wikimedia Commons.', 'https://commons.wikimedia.org/wiki/File:In_the_spring_on_the_%22Road_of_Life%22_on_Lake_Ladoga.jpg') +
        ul(['Από τον <strong>Δρόμο της Ζωής</strong> έφταναν στην πόλη τρόφιμα και καύσιμα, και από εκεί εκκενώνονταν πολίτες, κυρίως παιδιά, γυναίκες και ασθενείς. Συνολικά εκκενώθηκε πάνω από ένα εκατομμύριο άνθρωποι.',
            'Η διαδρομή είχε σοβαρούς κινδύνους: τα βομβαρδιστικά, οι ρωγμές στον πάγο και τα καιρικά φαινόμενα. Πολλά οχήματα χάθηκαν στον πάγο.',
            'Την άνοιξη ο πάγος έλιωνε και η οδός έκλεινε. Το καλοκαίρι η μεταφορά γινόταν με πλοιάρια, δίπλα στις εχθρικές θέσεις.']) +
        photo('foodstuffs_ladoga.jpg', 'Φόρτωση τροφίμων για το πολιορκημένο Λένινγκραντ στη λίμνη Λάντογκα.', 'Φωτογραφία: Μπορίς Κουντογιάροφ (RIA Novosti), CC BY-SA 3.0, μέσω Wikimedia Commons.', 'https://commons.wikimedia.org/wiki/File:RIAN_archive_310_Foodstuffs_for_Leningrad.jpg') +
        photo('ladoga_boats.jpg', 'Ρυμουλκά και φορτηγίδες με τρόφιμα στη Λάντογκα.', 'Φωτογραφία: Μπορίς Κουντογιάροφ (RIA Novosti), CC BY-SA 3.0, μέσω Wikimedia Commons.', 'https://commons.wikimedia.org/wiki/File:RIAN_archive_397_Cutters_carrying_foodstuffs_to_besieged_Leningrad_on_Ladoga_Lake.jpg') +
        supp('Σύνδεση με τη Γεωγραφία και τη Φυσική', '<p>Ο πάγος μιας λίμνης μπορεί να σηκώσει φορτηγά μόνο όταν είναι αρκετά χοντρός. Η αντοχή του εξαρτάται από το <strong>πάχος</strong> και τη θερμοκρασία. Ο χειμώνας του 1941–42 ήταν από τους πιο κρύους του αιώνα, κάτι που βοήθησε τον πάγο αλλά έκανε πιο σκληρή τη ζωή στην πόλη.</p>');

    const S3 =
        '<p>Ο πρώτος χειμώνας (1941–42) ήταν ο πιο τραγικός. Το φαγητό ήταν ελάχιστο, η θέρμανση έλειπε και το κρύο ήταν πολύ έντονο.</p>' +
        ul(['<strong>Μερίδες ψωμιού:</strong> από τα τέλη Νοεμβρίου 1941 η ημερήσια μερίδα έπεσε περίπου στα <strong>250 γραμμάρια</strong> για τους εργάτες και περίπου στα <strong>125 γραμμάρια</strong> για τους υπόλοιπους κατοίκους, μαζί με τα παιδιά. Το ψωμί περιείχε και υποκατάστατα (όπως πίτουρο ή κυτταρίνη).',
            '<strong>Λιμός και ασθένειες:</strong> πολλοί άνθρωποι πέθαναν από την πείνα, το κρύο και τις ασθένειες. Οι εκτιμήσεις για τους νεκρούς είναι της τάξης των <strong>εκατοντάδων χιλιάδων</strong> (συχνά αναφέρονται 600.000 έως 800.000, ενώ ορισμένοι ιστορικοί δίνουν και μεγαλύτερους αριθμούς).',
            '<strong>Βομβαρδισμοί:</strong> η πόλη δεχόταν επιθέσεις από την αεροπορία και το πυροβολικό.',
            '<strong>Αντοχή:</strong> παρά τις συνθήκες, οι κάτοικοι συνέχισαν να δουλεύουν, να φροντίζουν ο ένας τον άλλον και να διατηρούν τη δράση της πόλης. Στις 9 Αυγούστου 1942 παίχτηκε στην πολιορκημένη πόλη η <strong>Έβδομη Συμφωνία</strong> του Σοστακόβιτς (η «Συμφωνία του Λένινγκραντ»), και μεταδόθηκε και προς τα εχθρικά στρατεύματα.']) +
        box('bga-info', 'Μια σημείωση',
            '<p>Οι αριθμοί των θυμάτων διαφέρουν ανάλογα με την πηγή και τον τρόπο μέτρησης. Η σελίδα τους αναφέρει ως <strong>εκτίμηση</strong>. Το σημαντικό είναι ο μεγάλος ανθρώπινος πόνος και η προσπάθεια διάσωσης των κατοίκων.</p>');

    const S4 =
        '<p>Ο κλοιός δεν έσπασε με μία ενέργεια, αλλά σε δύο φάσεις:</p>' +
        flow(['18 Ιανουαρίου 1943: επιχείρηση «Ίσκρα»', 'Στενός διάδρομος (λίγα χιλιόμετρα) στη νότια ακτή της Λάντογκα', 'Σιδηρόδρομος και δρόμος: καλύτερος ανεφοδιασμός', 'Ιανουάριος 1944: η μεγάλη επίθεση απομακρύνει τον εχθρό']) +
        ul(['Ο διάδρομος του 1943 ήταν στενός και εκτεθειμένος σε πυρά, αλλά επέτρεψε την κατασκευή σιδηροδρομικής γραμμής και την αύξηση του ανεφοδιασμού.',
            'Η οριστική άρση της πολιορκίας έγινε στις <strong>27 Ιανουαρίου 1944</strong>, μετά από μεγάλη σοβιετική επίθεση που απώθησε τα γερμανικά στρατεύματα μακριά από την πόλη.',
            'Η πόλη τιμήθηκε μετά τον πόλεμο ως <strong>«Πόλη-Ήρωας»</strong>. Σήμερα υπάρχουν μνημεία και Μουσείο Άμυνας και Πολιορκίας του Λένινγκραντ.']) +
        supp('Για συζήτηση', ul(['Γιατί η γεωγραφία (θάλασσα, ποταμός, λίμνη) έκανε την πόλη εύκολη στόχο αλλά και έδωσε μια οδό διάσωσης;', 'Πώς διαφέρει ο ρόλος της Βαλτικής εδώ (πολιορκία) από τον ρόλο της στο ναυάγιο του Vasa (διατήρηση);']));

    function render(mount) {
        K.renderPage(mount, {
            title: '🕯️ Η πολιορκία του Λένινγκραντ (1941–1944)',
            intro: 'Πώς η γεωγραφία της Βαλτικής, της Νέβας και της Λάντογκα καθόρισε μία από τις πιο τραγικές πολιορκίες της ιστορίας. Η σελίδα είναι <strong>συμπληρωματική</strong> και δεν αποτελεί εξεταστέα ύλη.',
            sections: [
                { id: 'ln1', icon: '🗺️', title: '1. Η πολιορκία και η γεωγραφία της', nav: 'Η πολιορκία', sub: 'τι συνέβη · χάρτης · χρονολόγιο', body: S1, open: true },
                { id: 'ln2', icon: '🚛', title: '2. Ο «Δρόμος της Ζωής» στη Λάντογκα', nav: 'Δρόμος της Ζωής', sub: 'πάγος · ανεφοδιασμός · εκκένωση', body: S2 },
                { id: 'ln3', icon: '🍞', title: '3. Ο λιμός και η ζωή στην πόλη', nav: 'Η ζωή στην πόλη', sub: 'μερίδες ψωμιού · θύματα · Σοστακόβιτς', body: S3 },
                { id: 'ln4', icon: '🏁', title: '4. Το τέλος της πολιορκίας', nav: 'Το τέλος', sub: '1943 · 1944', body: S4 }
            ]
        });
    }
    return { render };
})();
