/* ==========================================================================
   Geography Β: "Το ναυάγιο του Vasa" - the Swedish warship that sank in 1628 and was found almost intact in 1956,
   because of the low salinity of the Baltic (no shipworms). SUPPLEMENTARY material, outside the school book.
   Photographs: Wikimedia Commons (credits in the captions). Diagrams and the map are our own schematic drawings
   (land outline: Natural Earth, public domain; salinity values are approximate, from general sources).
   window.VasaPage.render(mountElement)   (needs VASA_LAND from js/vasa-map-land.js and BioGuideKit)
   ========================================================================== */
window.VasaPage = (function () {
    'use strict';
    const K = window.BioGuideKit;
    const { tbl, ul, box, flow } = K;
    const IMG = 'assets/images/vasa/';
    const supp = (title, body) => '<div class="bga-box bt-supp"><strong>➕ ' + title + ' <span class="bt-tag">συμπληρωματικό · εκτός βιβλίου · δεν ζητείται</span></strong>' + body + '</div>';
    const photo = (file, cap, credit, href) => '<figure class="vs-fig"><img src="' + IMG + file + '" alt="' + cap.replace(/"/g, '') + '" loading="lazy"><figcaption>' + cap + ' <span class="vs-credit">' + credit + (href ? ' · <a href="' + href + '" target="_blank" rel="noopener">πηγή</a>' : '') + '</span></figcaption></figure>';

    /* ------------------------------------------------ diagram 1: why it capsized */
    function stabilitySvg() {
        const ship = (x, ballast, label, ok) =>
            '<g transform="translate(' + x + ',34)">' +
            '<path d="M20,150 Q110,215 200,150 L190,120 L30,120 Z" fill="#a16207" stroke="#451a03" stroke-width="3"/>' +
            '<rect x="45" y="70" width="130" height="50" fill="#d6a85c" stroke="#451a03" stroke-width="3"/><rect x="60" y="30" width="100" height="40" fill="#e7c07f" stroke="#451a03" stroke-width="3"/>' +
            '<g fill="#1f2937"><circle cx="70" cy="95" r="5"/><circle cx="95" cy="95" r="5"/><circle cx="125" cy="95" r="5"/><circle cx="150" cy="95" r="5"/><circle cx="80" cy="50" r="4"/><circle cx="110" cy="50" r="4"/><circle cx="140" cy="50" r="4"/></g>' +
            '<line x1="110" y1="30" x2="110" y2="-10" stroke="#451a03" stroke-width="4"/><path d="M110,-8 L150,10 L110,28 Z" fill="#f8fafc" stroke="#475569" stroke-width="2"/>' +
            '<rect x="70" y="' + (175 - ballast) + '" width="80" height="' + ballast + '" rx="6" fill="#475569"/>' +
            '<text x="110" y="' + (170 - ballast / 2 + 5) + '" font-size="12" font-weight="800" fill="#f8fafc" text-anchor="middle">έρμα</text>' +
            '<text x="110" y="245" font-size="15" font-weight="800" fill="' + (ok ? '#047857' : '#b91c1c') + '" text-anchor="middle">' + label + '</text></g>';
        return '<svg viewBox="0 0 760 310" class="bg-svg" role="img" aria-label="Σχηματικό: ένα πλοίο με πολύ βάρος ψηλά και λίγο έρμα ανατρέπεται">' +
            '<rect width="760" height="310" fill="#e0f2fe"/><rect y="184" width="760" height="126" fill="#7dd3fc" opacity="0.55"/>' +
            '<text x="190" y="22" font-size="17" font-weight="800" fill="#0f172a" text-anchor="middle">Το Vasa</text><text x="570" y="22" font-size="17" font-weight="800" fill="#0f172a" text-anchor="middle">Σταθερό πλοίο (σχηματικά)</text>' +
            ship(80, 14, 'πολύ βάρος ψηλά, λίγο έρμα', false) + ship(460, 44, 'περισσότερο έρμα, χαμηλό κέντρο βάρους', true) +
            '</svg>';
    }

    /* ------------------------------------------------ diagram 2: map of the Baltic with salinity */
    function mapHtml() {
        if (typeof VASA_LAND === 'undefined') return '';
        const L = VASA_LAND;
        const px = (lon, lat) => [(lon - L.lon0) / (L.lon1 - L.lon0) * L.w, (L.lat1 - lat) / (L.lat1 - L.lat0) * L.h];
        const pts = [['Βόρεια Θάλασσα', 4.6, 56.9, 35, '#1d4ed8', 'start'], ['Κάτεγατ', 11.5, 57.0, 22, '#2563eb', 'start'], ['Νότια Βαλτική', 17.5, 55.3, 8, '#0891b2', 'middle'], ['Στοκχόλμη (εδώ βυθίστηκε το Vasa)', 18.4, 59.3, 6, '#b45309', 'start'], ['Κόλπος Βοθνίας', 21.5, 62.5, 4, '#7c3aed', 'start'], ['Κόλπος Φινλανδίας (ανατολικά)', 28.5, 60.0, 2, '#7c3aed', 'end']];
        let s = '<svg viewBox="0 0 ' + L.w + ' ' + L.h + '" class="bg-svg" role="img" aria-label="Χάρτης της Βαλτικής με την αλατότητα"><rect width="' + L.w + '" height="' + L.h + '" fill="#bfe3f5"/>';
        L.land.forEach((d) => { s += '<path d="' + d + '" fill="#efe2bd" stroke="#b59f6b" stroke-width="1"/>'; });
        pts.forEach((p) => {
            const [x, y] = px(p[1], p[2]); const r = 7 + p[3] * 0.5;
            s += '<circle cx="' + x.toFixed(0) + '" cy="' + y.toFixed(0) + '" r="' + r.toFixed(0) + '" fill="' + p[4] + '" fill-opacity="0.75" stroke="#fff" stroke-width="3"/>' +
                '<text x="' + (x + (p[5] === 'end' ? -r - 6 : p[5] === 'middle' ? 0 : r + 6)).toFixed(0) + '" y="' + (y + (p[5] === 'middle' ? r + 18 : -2)).toFixed(0) + '" font-size="17" font-weight="800" fill="#0f172a" text-anchor="' + p[5] + '" paint-order="stroke" stroke="#fff" stroke-width="4">' + p[0] + '</text>' +
                '<text x="' + (x + (p[5] === 'end' ? -r - 6 : p[5] === 'middle' ? 0 : r + 6)).toFixed(0) + '" y="' + (y + (p[5] === 'middle' ? r + 36 : 17)).toFixed(0) + '" font-size="15" font-weight="700" fill="#334155" text-anchor="' + p[5] + '" paint-order="stroke" stroke="#fff" stroke-width="4">≈ ' + p[3] + ' ‰</text>';
        });
        s += '<text x="12" y="' + (L.h - 12) + '" font-size="13" fill="#334155">Σχηματικός χάρτης. Οι τιμές αλατότητας είναι ενδεικτικές (‰ = γραμμάρια άλατος ανά χιλιόγραμμο νερού).</text></svg>';
        return s;
    }

    /* ------------------------------------------------ diagram 3: salinity bars and shipworm */
    function barsSvg() {
        const items = [['Ωκεανός', 35, '#1d4ed8'], ['Βόρεια Θάλασσα', 33, '#2563eb'], ['Κάτεγατ', 22, '#0ea5e9'], ['Νότια Βαλτική', 8, '#06b6d4'], ['Στοκχόλμη', 6, '#b45309'], ['Κόλπος Βοθνίας', 4, '#7c3aed']];
        const X = 190, W = 520, Y0 = 62, step = 38, mx = 36;
        const sx = (v) => X + v / mx * W;
        let s = '<svg viewBox="0 0 760 ' + (Y0 + items.length * step + 50) + '" class="bg-svg" role="img" aria-label="Αλατότητα σε διάφορα νερά και όριο για το ξυλοφάγο όστρακο"><rect width="760" height="' + (Y0 + items.length * step + 50) + '" fill="#f8fafc"/>';
        items.forEach((it, i) => {
            const y = Y0 + i * step;
            s += '<text x="' + (X - 10) + '" y="' + (y + 20) + '" font-size="15" font-weight="800" fill="#0f172a" text-anchor="end">' + it[0] + '</text><rect x="' + X + '" y="' + (y + 4) + '" width="' + (it[1] / mx * W) + '" height="24" rx="5" fill="' + it[2] + '"/><text x="' + (sx(it[1]) + 8) + '" y="' + (y + 22) + '" font-size="14" font-weight="800" fill="#334155">≈ ' + it[1] + ' ‰</text>';
        });
        const tx = sx(10), yb = Y0 + items.length * step;
        s += '<rect x="' + X + '" y="' + (Y0 - 10) + '" width="' + (tx - X) + '" height="' + (items.length * step + 10) + '" fill="#10b981" opacity="0.12"/>' +
            '<line x1="' + tx + '" y1="' + (Y0 - 14) + '" x2="' + tx + '" y2="' + (yb + 4) + '" stroke="#dc2626" stroke-width="3" stroke-dasharray="7 5"/>' +
            '<text x="' + (tx + 8) + '" y="' + (Y0 - 24) + '" font-size="14" font-weight="800" fill="#b91c1c">όριο (περίπου): κάτω από αυτό</text><text x="' + (tx + 8) + '" y="' + (Y0 - 8) + '" font-size="14" font-weight="800" fill="#b91c1c">το Teredo δεν πολλαπλασιάζεται</text>' +
            '<text x="' + ((X + tx) / 2) + '" y="' + (yb + 28) + '" font-size="14" font-weight="800" fill="#047857" text-anchor="middle">το ξύλο προστατεύεται</text>' +
            '<text x="' + (X) + '" y="' + (yb + 46) + '" font-size="12.5" fill="#475569">Ενδεικτικές τιμές. Το ακριβές όριο εξαρτάται από το είδος και τις συνθήκες.</text></svg>';
        return s;
    }

    /* ------------------------------------------------ page */
    const S1 =
        '<div class="bga-box bt-supp"><strong>➕ Όλη η σελίδα <span class="bt-tag">συμπληρωματικό · εκτός βιβλίου · δεν ζητείται</span></strong><p>Μια ιστορία που συνδέει την <strong>ιστορία</strong>, τη <strong>φυσική</strong> και τη <strong>Γεωγραφία των θαλασσών</strong>. Οι φωτογραφίες είναι από το Wikimedia Commons με ελεύθερη άδεια. Τα σχέδια και ο χάρτης είναι δικά μας, σχηματικά.</p></div>' +
        '<h4>Ένα πλοίο που βυθίστηκε στην πρώτη του διαδρομή</h4>' +
        '<p>Το <strong>Vasa</strong> («Βάσα») ήταν πολεμικό πλοίο του βασιλιά της Σουηδίας <strong>Γουσταύου Β΄ Αδόλφου</strong>, ναυπηγημένο στη Στοκχόλμη με στόχο να είναι το ισχυρότερο πλοίο του στόλου, με πολλά κανόνια και πλούσια ξύλινη διακόσμηση. Στις <strong>10 Αυγούστου 1628</strong> ξεκίνησε το παρθενικό του ταξίδι. Μετά από μερικές εκατοντάδες μέτρα (περίπου 1,3 χιλιόμετρα) και δύο ριπές ανέμου, έγειρε, γέμισε νερό από τα ανοιχτά παράθυρα των κανονιών και <strong>βυθίστηκε μέσα στο λιμάνι</strong>, μπροστά στους Στοκχολμέζους.</p>' +
        photo('vasa_museum.jpg', 'Το Vasa σήμερα, στο μουσείο της Στοκχόλμης.', 'Φωτογραφία: Richard Mortel, CC BY 2.0, μέσω Wikimedia Commons.', 'https://commons.wikimedia.org/wiki/File:Swedish_warship_Vasa,_sank_1628,_Vasamuseet,_Stockholm_(1)_(36225601066).jpg') +
        '<h4>Γιατί ανατράπηκε</h4>' +
        '<div class="bt-stage">' + stabilitySvg() + '</div>' +
        ul(['Το πλοίο είχε <strong>πολύ βάρος ψηλά</strong> (δύο ράφια με κανόνια και βαριά διακόσμηση) και <strong>λίγο έρμα</strong> στον πυθμένα για να τα ισορροπήσει.',
            'Όσο το βάρος είναι ψηλά και το έρμα λίγο, το <strong>κέντρο βάρους</strong> είναι ψηλά και το πλοίο γέρνει εύκολα. Μια ριπή ανέμου αρκούσε για να το γείρει τόσο, ώστε να μπει νερό από τα ανοιχτά παράθυρα των κανονιών.',
            'Το σχέδιο είναι σχηματικό: δείχνει την ιδέα (ψηλό βάρος, λίγο έρμα) και όχι τις πραγματικές διαστάσεις.']) +
        supp('Σύνδεση με τη Φυσική', '<p>Ένα σώμα ισορροπεί πιο σταθερά όταν το κέντρο βάρους του βρίσκεται χαμηλά. Γι’ αυτό τα πλοία έχουν έρμα στον πυθμένα.</p>');

    const S2 =
        '<p>Η απάντηση βρίσκεται στο νερό. Η <strong>αλατότητα</strong> είναι η ποσότητα του αλατιού στο θαλασσινό νερό. Στον ωκεανό είναι περίπου <strong>35 ‰</strong> (35 γραμμάρια άλατος ανά χιλιόγραμμο νερού). Η Βαλτική είναι μια <strong>σχεδόν κλειστή</strong> θάλασσα με στενό άνοιγμα προς τη Βόρεια Θάλασσα και δέχεται το νερό πολλών ποταμών, που είναι γλυκό. Έτσι το νερό της είναι πολύ <strong>λιγότερο αλμυρό</strong>: περίπου 6 ‰ στη Στοκχόλμη.</p>' +
        '<div class="bt-stage vs-map">' + mapHtml() + '</div>' +
        '<h4>Το ξυλοφάγο που λείπει</h4>' +
        '<p>Στις αλμυρότερες θάλασσες τα ξύλινα ναυάγια διαλύονται σχετικά γρήγορα από τα <strong>ξυλοφάγα όστρακα</strong> (<em>Teredo navalis</em>, «σκουλήκι των πλοίων»). Παρότι τα λέμε «σκουλήκια», είναι <strong>μαλάκια</strong> που ανοίγουν στοές μέσα στο ξύλο. Χρειάζονται αρκετή αλατότητα για να <strong>πολλαπλασιαστούν</strong>. Στη Βαλτική, με τη χαμηλή αλατότητα, δεν μπορούσαν να ζήσουν και να αναπαραχθούν στη Στοκχόλμη.</p>' +
        '<div class="bt-stage">' + barsSvg() + '</div>' +
        photo('shipworm.jpg', 'Σχέδιο ξυλοφάγου οστράκου (shipworm), από βιβλίο του 1733.', 'Z. l’Epie / J. Ruyter, κοινό κτήμα (public domain), μέσω Wikimedia Commons.', 'https://commons.wikimedia.org/wiki/File:Shipworm_drawing.by_Zacharias_l%E2%80%99Epie.jpg') +
        '<h4>Και άλλοι παράγοντες που βοήθησαν</h4>' +
        ul(['<strong>Κρύο νερό.</strong> Οι χημικές και βιολογικές διεργασίες που αποσυνθέτουν το ξύλο γίνονται πιο αργά σε χαμηλή θερμοκρασία.',
            '<strong>Λίγο οξυγόνο στον βυθό.</strong> Πολλοί οργανισμοί που διαλύουν το ξύλο χρειάζονται οξυγόνο.',
            '<strong>Λάσπη.</strong> Το ναυάγιο καλύφθηκε εν μέρει με ίζημα, που το προστάτευσε.']) +
        box('bga-info', 'Το συμπέρασμα',
            '<p>Το Vasa διατηρήθηκε <strong>σχεδόν ακέραιο για 333 χρόνια</strong> κυρίως γιατί τα ξυλοφάγα όστρακα δεν ζουν στο υποαλμυρό νερό της Βαλτικής. Αν είχε βυθιστεί σε αλμυρότερη θάλασσα, πιθανότατα θα είχε διαλυθεί.</p>') +
        supp('Σύνδεση με τη Γεωγραφία', '<p>Η αλατότητα δεν είναι ίδια σε όλες τις θάλασσες. Εξαρτάται από τη <strong>γλυκιά βροχή και τα ποτάμια</strong> που δίνουν νερό (μειώνουν την αλατότητα), από την <strong>εξάτμιση</strong> (την αυξάνει) και από το πόσο <strong>ανοιχτή</strong> είναι η θάλασσα στον ωκεανό.</p>');

    const S3 =
        '<p>Το ναυάγιο εντοπίστηκε μετά από πολλά χρόνια έρευνας (1956) και <strong>ανελκύστηκε στις 24 Απριλίου 1961</strong>, δηλαδή 333 χρόνια μετά τη βύθισή του. Τα ευρήματα (εργαλεία, ρούχα, κέρματα, σκελετοί) έδωσαν πολύτιμες πληροφορίες για τη ζωή του 17ου αιώνα.</p>' +
        photo('vasa_1961_excavation.jpg', 'Αρχαιολογική εργασία μέσα στο Vasa το 1961, μετά την ανέλκυση (πλύσιμο της λάσπης από το εσωτερικό).', 'Φωτογραφία: Vasamuseet (Statens maritima museer), κοινό κτήμα (public domain), μέσω Wikimedia Commons.', 'https://commons.wikimedia.org/wiki/File:VASA._Beckholmen,_Stockholm._1961_-_Vasamuseet_-_2-85.tif') +
        '<h4>Το δύσκολο κομμάτι: να μη σαπίσει στον αέρα</h4>' +
        '<p>Το ξύλο που έμεινε τόσο καιρό στο νερό είχε γεμίσει νερό και ήταν μαλακό. Αν στέγνωνε απλά, θα <strong>ράγιζε και θα συρρικνωνόταν</strong>. Γι’ αυτό το πλοίο ψεκαζόταν επί χρόνια με μια ουσία που αντικαθιστά το νερό μέσα στο ξύλο (<strong>πολυαιθυλενογλυκόλη, PEG</strong>) και μετά στέγνωσε πολύ αργά.</p>' +
        flow(['Ανέλκυση (1961)', 'Συνεχές πλύσιμο και ψεκασμός με PEG (πολλά χρόνια)', 'Αργό στέγνωμα', 'Έκθεση στο μουσείο']) +
        photo('vasa_1963_conservation.jpg', 'Συντήρηση ευρημάτων του Vasa στο Μπέκχολμεν, 1963.', 'Φωτογραφία: Vasamuseet (Statens maritima museer), κοινό κτήμα (public domain), μέσω Wikimedia Commons.', 'https://commons.wikimedia.org/wiki/File:VASA._Beckholmen,_Stockholm._1963_-_Vasamuseet_-_3-103.tif') +
        '<h4>Για περισσότερα</h4>' +
        '<p>Το Vasa εκτίθεται σήμερα στο <strong>Vasamuseet</strong> στη Στοκχόλμη. Η επίσημη ιστοσελίδα του μουσείου έχει πολλές εικόνες, ιστορία και εικονικές περιηγήσεις: <a href="https://www.vasamuseet.se/en" target="_blank" rel="noopener">vasamuseet.se</a> (στα αγγλικά).</p>' +
        '<p class="bga-note">Οι φωτογραφίες του ίδιου του μουσείου σε αυτή τη σελίδα είναι εκείνες που το μουσείο έχει δώσει στο κοινό κτήμα (Wikimedia Commons). Για τις υπόλοιπες, δες την ιστοσελίδα του μουσείου, που ισχύουν οι δικοί του όροι χρήσης.</p>';

    function render(mount) {
        K.renderPage(mount, {
            title: '⚓ Το ναυάγιο του Vasa (Βαλτική)',
            intro: 'Πώς ένα πλοίο του 1628 βρέθηκε σχεδόν ακέραιο, χάρη στη χαμηλή αλατότητα της Βαλτικής. Η σελίδα είναι <strong>συμπληρωματική</strong> και δεν αποτελεί εξεταστέα ύλη.',
            sections: [
                { id: 'vs1', icon: '🚢', title: '1. Το πλοίο και η βύθισή του', nav: 'Η βύθιση', sub: 'ιστορικό υπόβαθρο · γιατί ανατράπηκε', body: S1, open: true },
                { id: 'vs2', icon: '🧂', title: '2. Το «απρόσμενο»: γιατί διατηρήθηκε', nav: 'Η διατήρηση', sub: 'αλατότητα της Βαλτικής · ξυλοφάγα όστρακα', body: S2 },
                { id: 'vs3', icon: '🏗️', title: '3. Ανέλκυση και συντήρηση', nav: 'Ανέλκυση', sub: '1961 · PEG · μουσείο', body: S3 }
            ]
        });
    }
    return { render };
})();
