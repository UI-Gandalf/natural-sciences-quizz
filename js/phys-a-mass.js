/* ==========================================================================
   Physics Α: «Μάζα και Βάρος» – οδηγός μελέτης (εισαγωγή).
   Content: the study guide "Οδηγός Μελέτης: Μάζα και Βάρος" (definitions, comparison,
   confusion, W = m·g, exercises with solutions) + panels of the infographic.
   window.PhysAMass.render(mountElement)
   ========================================================================== */
(function () {
    'use strict';

    const IMG = 'assets/images/physA/';

    const TF = [
        ['Το βάρος είναι ίδιο με τη μάζα.', false, 'Η μάζα είναι η ποσότητα της ύλης, το βάρος είναι η δύναμη της βαρύτητας.'],
        ['Τα αέρια, όπως ο αέρας σε ένα δωμάτιο, δεν έχουν μάζα.', false, 'Όλα τα αέρια έχουν μάζα. Για παράδειγμα, ένα φουσκωμένο μπαλόνι έχει μεγαλύτερη μάζα από ένα ξεφούσκωτο.'],
        ['Η μάζα ενός σώματος είναι σταθερή σε όλα τα σημεία του σύμπαντος.', true, 'Η μάζα είναι μια εγγενής ιδιότητα της ύλης και δεν αλλάζει με τη θέση.'],
        ['Η ένδειξη μιας ζυγαριάς σε χιλιόγραμμα (kg) μας δείχνει το βάρος μας.', false, 'Η ένδειξη σε kg δείχνει τη μάζα. Η σύγχυση προκύπτει επειδή η ζυγαριά μετρά το βάρος, αλλά είναι βαθμονομημένη να δείχνει μάζα.'],
        ['Τα σώματα στο διάστημα, μακριά από τη Γη, δεν έχουν μάζα.', false, 'Έχουν μάζα, αλλά το βάρος τους μπορεί να είναι σχεδόν μηδενικό αν είναι πολύ μακριά από οποιοδήποτε μεγάλο ουράνιο σώμα.'],
        ['Δύο σώματα με ίσες μάζες έχουν πάντα και ίσα βάρη.', false, 'Έχουν ίσα βάρη μόνο αν βρίσκονται στον ίδιο τόπο (με την ίδια τιμή του g). Στη Γη και στη Σελήνη θα έχουν διαφορετικά βάρη.'],
        ['Ένα κιλό σίδερο και ένα κιλό βαμβάκι έχουν το ίδιο βάρος.', true, 'Αφού έχουν την ίδια μάζα (1 kg) και βρίσκονται στον ίδιο τόπο (Γη), η βαρύτητα ασκεί την ίδια δύναμη (βάρος) και στα δύο.'],
        ['Το βάρος ενός σώματος στην κορυφή ενός βουνού είναι ελαφρώς μικρότερο από ό,τι στην επιφάνεια της θάλασσας.', true, 'Στην κορυφή του βουνού η απόσταση από το κέντρο της Γης είναι μεγαλύτερη, άρα η βαρυτική έλξη (βάρος) είναι ελαφρώς ασθενέστερη.']
    ];

    const PLACES = [
        ['earth10', 'Επιφάνεια της Γης (απλοί υπολογισμοί)', 10],
        ['earth98', 'Επιφάνεια της Γης (μεγαλύτερη ακρίβεια)', 9.8],
        ['eq', 'Γη, Ισημερινός', 9.78],
        ['pole', 'Γη, Πόλοι', 9.83],
        ['moon', 'Επιφάνεια της Σελήνης', 1.6]
    ];

    function fmtN(x, d) {
        let s = (Math.round(x * Math.pow(10, d)) / Math.pow(10, d)).toString();
        return s.replace('.', ',');
    }

    function html() {
        let tf = '';
        TF.forEach((q, i) => {
            tf += '<div class="pm-tf" data-i="' + i + '"><div class="pm-tf-q"><span class="pm-tf-n">' + (i + 1) + '</span>' + q[0] + '</div>' +
                '<div class="pm-tf-b"><button type="button" class="pa-btn" data-act="tf" data-i="' + i + '" data-v="1">✔ Σωστό</button><button type="button" class="pa-btn" data-act="tf" data-i="' + i + '" data-v="0">✖ Λάθος</button></div>' +
                '<div class="pm-tf-a" hidden></div></div>';
        });
        let places = '';
        PLACES.forEach(p => { places += '<option value="' + p[2] + '">' + p[1] + ' · g = ' + String(p[2]).replace('.', ',') + ' N/kg</option>'; });

        return '' +
        '<div class="pa-wrap pm-wrap">' +
        '<header class="pa-head"><div class="pa-kicker">Φυσική Α΄ Γυμνασίου · Εισαγωγή</div>' +
        '<h2>⚖️ Μάζα και Βάρος: λύνοντας την παρανόηση</h2>' +
        '<p>Οδηγός μελέτης με τους βασικούς ορισμούς, τη σύγκριση των δύο μεγεθών, τον λόγο της σύγχυσης και τη σχέση <strong>W = m · g</strong>, με εργαλείο υπολογισμού και ασκήσεις εμπέδωσης με λύσεις.</p>' +
        '<div class="pa-tools"><button type="button" class="pa-btn" data-act="open-sol">📂 Εμφάνιση όλων των λύσεων</button><button type="button" class="pa-btn" data-act="close-sol">📁 Απόκρυψη όλων</button></div></header>' +

        /* 1 */
        '<section class="pa-card" id="pm-s1"><h3><span class="pa-num">1</span> Βασικοί ορισμοί</h3>' +
        '<div class="pa-two">' +
        '<div class="pa-box pa-a"><h4>⚛️ Τι είναι η μάζα (m);</h4><p>Η μάζα (mass) είναι ένα θεμελιώδες φυσικό μέγεθος που περιγράφει δύο βασικές ιδιότητες ενός σώματος:</p>' +
        '<ol class="pa-steps"><li><strong>Ποσότητα ύλης:</strong> εκφράζει την ποσότητα της ύλης από την οποία αποτελείται ένα σώμα.</li>' +
        '<li><strong>Μέτρο αδράνειας:</strong> συνδέεται με την αδράνεια, δηλαδή την «αντίσταση» που εκδηλώνει ένα σώμα σε κάθε προσπάθεια αλλαγής της κινητικής του κατάστασης. Όσο μεγαλύτερη η μάζα, τόσο πιο δύσκολο είναι να ξεκινήσει να κινείται όταν είναι ακίνητο ή να σταματήσει όταν κινείται.</li></ol>' +
        '<ul class="pm-list"><li><strong>Σταθερότητα:</strong> παραμένει η ίδια σε οποιοδήποτε σημείο του σύμπαντος (Γη, Σελήνη, διάστημα).</li><li><strong>Σύμβολο:</strong> m</li><li><strong>Μονάδα (S.I.):</strong> χιλιόγραμμο (kg). Άλλες: τόνος (tn, 1 tn = 1000 kg) και γραμμάριο (g, 1 kg = 1000 g).</li><li><strong>Όργανο:</strong> ζυγός (ζυγός σύγκρισης με ίσους βραχίονες ή ηλεκτρονικός ζυγός).</li></ul></div>' +
        '<div class="pa-box pa-b"><h4>🌍 Τι είναι το βάρος (W ή B);</h4><p>Το βάρος (weight) ενός σώματος είναι η <strong>ελκτική δύναμη</strong> που ασκεί η Γη (ή οποιοδήποτε άλλο ουράνιο σώμα, όπως η Σελήνη ή ένας άλλος πλανήτης) στο σώμα αυτό, λόγω της βαρύτητας.</p>' +
        '<ul class="pm-list"><li><strong>Μεταβλητότητα:</strong> δεν είναι σταθερό, αλλά αλλάζει ανάλογα με τον τόπο. Στη Σελήνη το βάρος ενός σώματος είναι περίπου 6 φορές μικρότερο από ό,τι στη Γη, επειδή η βαρυτική έλξη της Σελήνης είναι ασθενέστερη.</li>' +
        '<li><strong>Κατεύθυνση:</strong> είναι δύναμη με πάντα κατακόρυφη διεύθυνση και φορά προς το κέντρο του πλανήτη ή του ουράνιου σώματος που το ασκεί.</li><li><strong>Σύμβολο:</strong> W ή B</li><li><strong>Μονάδα (S.I.):</strong> Νιούτον (N), ως δύναμη.</li><li><strong>Όργανο:</strong> δυναμόμετρο.</li></ul></div></div>' +
        '<div class="pm-figs"><figure><img src="' + IMG + 'mass.jpg" alt="Infographic: η μάζα ως ποσότητα ύλης και αδράνεια, σταθερή παντού στο σύμπαν" loading="lazy"><figcaption>Μάζα: ποσότητα ύλης, αδράνεια, σταθερή παντού.</figcaption></figure>' +
        '<figure><img src="' + IMG + 'weight.jpg" alt="Infographic: το βάρος ως δύναμη της βαρύτητας, διάνυσμα προς το κέντρο του πλανήτη, μικρότερο στη Σελήνη" loading="lazy"><figcaption>Βάρος: δύναμη της βαρύτητας, προς το κέντρο του πλανήτη.</figcaption></figure></div></section>' +

        /* 2 */
        '<section class="pa-card" id="pm-s2"><h3><span class="pa-num">2</span> Σύγκριση μάζας και βάρους</h3>' +
        '<p>Παρότι στην καθημερινή γλώσσα οι έννοιες συγχέονται, στη Φυσική αποτελούν <strong>δύο διακριτά μεγέθη</strong> με σημαντικές διαφορές αλλά και μια θεμελιώδη ομοιότητα.</p>' +
        '<div class="pm-tablewrap"><table class="pm-table"><thead><tr><th>Χαρακτηριστικό</th><th>Μάζα (m)</th><th>Βάρος (W)</th></tr></thead><tbody>' +
        '<tr><td>Ορισμός</td><td>Η ποσότητα της ύλης που περιέχει ένα σώμα. Το μέτρο της αδράνειάς του.</td><td>Η ελκτική βαρυτική δύναμη που ασκεί η Γη (ή άλλο ουράνιο σώμα) σε ένα σώμα.</td></tr>' +
        '<tr><td>Φύση μεγέθους</td><td>Βαθμωτό μέγεθος (περιγράφεται μόνο από την τιμή του).</td><td>Διανυσματικό μέγεθος (δύναμη: έχει τιμή, διεύθυνση και φορά).</td></tr>' +
        '<tr><td>Σταθερότητα</td><td>Σταθερή. Παραμένει ίδια σε οποιοδήποτε σημείο του σύμπαντος.</td><td>Μεταβλητό. Αλλάζει από τόπο σε τόπο (π.χ. Γη, Σελήνη, Δίας).</td></tr>' +
        '<tr><td>Εξάρτηση από υψόμετρο</td><td>Δεν εξαρτάται.</td><td>Ελαττώνεται όσο αυξάνεται το ύψος από την επιφάνεια της Γης.</td></tr>' +
        '<tr><td>Εξάρτηση από γεωγραφικό πλάτος</td><td>Δεν εξαρτάται.</td><td>Αυξάνεται καθώς κινούμαστε από τον Ισημερινό προς τους Πόλους.</td></tr>' +
        '<tr><td>Μονάδα μέτρησης (S.I.)</td><td>Χιλιόγραμμο (kg)</td><td>Νιούτον (N)</td></tr>' +
        '<tr><td>Όργανο μέτρησης</td><td>Ζυγός σύγκρισης, ηλεκτρονικός ζυγός</td><td>Δυναμόμετρο</td></tr></tbody></table></div>' +
        '<div class="pa-box pa-good"><h4>Η ομοιότητα: η αναλογία</h4><p>Η βασική ομοιότητα και ο λόγος της σύγχυσης είναι ότι <strong>σε έναν συγκεκριμένο τόπο</strong> η μάζα και το βάρος ενός σώματος είναι μεγέθη <strong>ανάλογα</strong>:</p>' +
        '<ul class="pm-list"><li>Αν ένα σώμα Α έχει διπλάσια μάζα από ένα σώμα Β, θα έχει και διπλάσιο βάρος (στον ίδιο τόπο).</li><li>Σώματα με ίσες μάζες έχουν και ίσα βάρη (στον ίδιο τόπο).</li></ul>' +
        '<p>Αυτή η αναλογία μας επιτρέπει να μετράμε τη μάζα με ζυγό, ο οποίος ουσιαστικά συγκρίνει τα βάρη των αντικειμένων στους δύο δίσκους του.</p></div></section>' +

        /* 3 */
        '<section class="pa-card" id="pm-s3"><h3><span class="pa-num">3</span> Γιατί μπερδεύουμε τη μάζα με το βάρος;</h3>' +
        '<div class="pa-grid">' +
        '<div class="pa-point"><div class="pa-ico">🗣️</div><h4>Η καθημερινή γλώσσα</h4><p>Χρησιμοποιούμε τη λέξη «βάρος» για να αναφερθούμε στη μάζα. Όταν λέμε «Το βάρος μου είναι 70 κιλά», στην πραγματικότητα εννοούμε τη μάζα μας (70 kg). Η σωστή διατύπωση είναι «Η μάζα μου είναι 70 kg».</p></div>' +
        '<div class="pa-point"><div class="pa-ico">⚖️</div><h4>Η μέθοδος μέτρησης</h4><p>Η ζυγαριά (σούπερ μάρκετ, σπίτι) λειτουργεί μετρώντας τη δύναμη (το βάρος) που ασκεί το αντικείμενο, αλλά είναι βαθμονομημένη να δείχνει μονάδες μάζας (kg). Αυτό ενισχύει την εσφαλμένη αντίληψη ότι τα δύο μεγέθη είναι ταυτόσημα.</p></div>' +
        '<div class="pa-point"><div class="pa-ico">🥤</div><h4>Η εμπειρία της αδράνειας</h4><p>Ένα γεμάτο κουτί αναψυκτικού είναι πιο δύσκολο να το σπρώξουμε (μεγαλύτερη αδράνεια) και ταυτόχρονα πιο βαρύ όταν το σηκώνουμε. Η σύνδεση «αντίσταση στη μετακίνηση» και «αίσθηση βάρους» οδηγεί στη σύγχυση.</p></div></div></section>' +

        /* 4 */
        '<section class="pa-card" id="pm-s4"><h3><span class="pa-num">4</span> Η μαθηματική σχέση: W = m · g</h3>' +
        '<div class="pm-formula">W = m · g</div>' +
        '<ul class="pm-list"><li><strong>W</strong>: το βάρος του σώματος, σε Νιούτον (N).</li><li><strong>m</strong>: η μάζα του σώματος, σε χιλιόγραμμα (kg).</li><li><strong>g</strong>: η επιτάχυνση της βαρύτητας, ένας αριθμός που εκφράζει την ισχύ του βαρυτικού πεδίου σε έναν συγκεκριμένο τόπο. Μονάδα: N/kg.</li></ul>' +
        '<h4 class="pa-sub">Η τιμή του g δεν είναι σταθερή παντού</h4>' +
        '<ul class="pm-list"><li>Στην επιφάνεια της Γης, για απλούς υπολογισμούς: <strong>g ≈ 10 N/kg</strong>. Για μεγαλύτερη ακρίβεια: <strong>g ≈ 9,8 N/kg</strong>.</li><li>Στη Γη μεταβάλλεται ελαφρώς με το γεωγραφικό πλάτος: g (Ισημερινός) ≈ 9,78 N/kg, ενώ g (Πόλοι) ≈ 9,83 N/kg.</li><li>Στην επιφάνεια της Σελήνης η βαρύτητα είναι πολύ πιο ασθενής: <strong>g ≈ 1,6 N/kg</strong>.</li></ul>' +
        '<p class="pa-key">Ένα σώμα με μάζα 1 kg έχει βάρος περίπου 10 N στη Γη, αλλά μόνο 1,6 N στη Σελήνη.</p>' +
        '<h4 class="pa-sub">🧮 Δοκιμάστε το: ο ίδιος αστροναύτης, άλλος τόπος</h4>' +
        '<div class="pa-calc-form"><label>Μάζα (kg)<input id="pm-m" type="text" inputmode="decimal" value="80" autocomplete="off"></label>' +
        '<label>Τόπος<select id="pm-g">' + places + '</select></label>' +
        '<button type="button" class="pa-btn pa-btn-main" data-act="wcalc">Υπολογισμός</button></div>' +
        '<div class="pa-calc-out" id="pm-out" aria-live="polite"></div>' +
        '<div class="pm-fig-wide"><img src="' + IMG + 'relation.jpg" alt="Infographic: η σχέση W = m·g και γιατί τα μπερδεύουμε στην καθημερινότητα" loading="lazy"></div></section>' +

        /* 5 */
        '<section class="pa-card" id="pm-s5"><h3><span class="pa-num">5</span> Ασκήσεις και ερωτήσεις εμπέδωσης</h3>' +
        '<h4 class="pa-sub">Μέρος Α · Σωστό ή Λάθος</h4><div class="pm-tfs">' + tf + '</div>' +
        '<div class="pm-score" id="pm-score" hidden></div>' +

        '<h4 class="pa-sub">Μέρος Β · Ασκήσεις υπολογισμών</h4>' +
        '<div class="pa-box"><p><strong>Άσκηση 1.</strong> Ένας αστροναύτης έχει μάζα 80 kg. Υπολογίστε τη μάζα και το βάρος του α) στη Γη και β) στη Σελήνη. (Χρησιμοποιήστε g<sub>Γης</sub> = 10 N/kg και g<sub>Σελήνης</sub> = 1,6 N/kg.)</p>' +
        '<button type="button" class="pa-btn" data-act="sol" data-t="s1">Δείτε τη λύση</button>' +
        '<div class="pm-sol" id="s1" hidden><p><strong>α) Στη Γη:</strong> η μάζα του παραμένει 80 kg. Το βάρος του είναι W = m · g = 80 kg · 10 N/kg = <strong>800 N</strong>.</p><p><strong>β) Στη Σελήνη:</strong> η μάζα του παραμένει 80 kg. Το βάρος του είναι W = m · g = 80 kg · 1,6 N/kg = <strong>128 N</strong>.</p></div></div>' +
        '<div class="pa-box"><p><strong>Άσκηση 2.</strong> Συμπληρώστε τα κενά στον πίνακα, κάνοντας τους απαραίτητους υπολογισμούς. (g<sub>Γης</sub> = 10 N/kg.)</p>' +
        '<div class="pm-tablewrap"><table class="pm-table"><thead><tr><th>Αντικείμενο</th><th>Μάζα στη Γη</th><th>Βάρος στη Γη</th><th>Μάζα στη Σελήνη</th><th>Βάρος στη Σελήνη (g = 1,6 N/kg)</th></tr></thead><tbody>' +
        '<tr><td>Α</td><td>300 g</td><td class="pm-blank">;</td><td class="pm-blank">;</td><td class="pm-blank">;</td></tr>' +
        '<tr><td>Β</td><td class="pm-blank">;</td><td>12 N</td><td class="pm-blank">;</td><td class="pm-blank">;</td></tr>' +
        '<tr><td>Γ</td><td class="pm-blank">;</td><td class="pm-blank">;</td><td>24 kg</td><td class="pm-blank">;</td></tr>' +
        '<tr><td>Δ</td><td class="pm-blank">;</td><td class="pm-blank">;</td><td class="pm-blank">;</td><td>5 N</td></tr></tbody></table></div>' +
        '<button type="button" class="pa-btn" data-act="sol" data-t="s2">Δείτε τη λύση</button>' +
        '<div class="pm-sol" id="s2" hidden><div class="pm-tablewrap"><table class="pm-table"><thead><tr><th>Αντικείμενο</th><th>Μάζα στη Γη</th><th>Βάρος στη Γη</th><th>Μάζα στη Σελήνη</th><th>Βάρος στη Σελήνη</th></tr></thead><tbody>' +
        '<tr><td>Α</td><td>300 g (0,3 kg)</td><td>0,3 kg · 10 = <strong>3 N</strong></td><td><strong>300 g (0,3 kg)</strong></td><td>0,3 kg · 1,6 = <strong>0,48 N</strong></td></tr>' +
        '<tr><td>Β</td><td>12 N / 10 = <strong>1,2 kg</strong></td><td>12 N</td><td><strong>1,2 kg</strong></td><td>1,2 kg · 1,6 = <strong>1,92 N</strong></td></tr>' +
        '<tr><td>Γ</td><td><strong>24 kg</strong></td><td>24 kg · 10 = <strong>240 N</strong></td><td>24 kg</td><td>24 kg · 1,6 = <strong>38,4 N</strong></td></tr>' +
        '<tr><td>Δ</td><td>5 N / 1,6 = <strong>3,125 kg</strong></td><td>3,125 kg · 10 = <strong>31,25 N</strong></td><td><strong>3,125 kg</strong></td><td>5 N</td></tr></tbody></table></div></div></div>' +

        '<h4 class="pa-sub">Μέρος Γ · Εννοιολογικές ερωτήσεις</h4>' +
        '<div class="pa-box"><p><strong>Ερώτηση 1.</strong> Σας δίνουν δύο ίδια κουτάκια αναψυκτικού, το ένα γεμάτο και το άλλο άδειο. Χωρίς να τα σηκώσετε ή να χρησιμοποιήσετε ζυγαριά, πώς μπορείτε να καταλάβετε ποιο είναι το γεμάτο;</p>' +
        '<button type="button" class="pa-btn" data-act="sol" data-t="c1">Δείτε την απάντηση</button>' +
        '<div class="pm-sol" id="c1" hidden><p>Τοποθετούμε τα δύο κουτάκια σε μια λεία επιφάνεια (π.χ. ένα τραπέζι) και τα σπρώχνουμε ελαφρά με την ίδια δύναμη (π.χ. φυσώντας με ένα καλαμάκι). Το άδειο κουτάκι, έχοντας μικρότερη μάζα, θα έχει και μικρότερη αδράνεια, επομένως θα αρχίσει να κινείται πολύ πιο εύκολα. Το γεμάτο κουτάκι θα «αντισταθεί» περισσότερο στην κίνηση.</p></div></div>' +
        '<div class="pa-box"><p><strong>Ερώτηση 2.</strong> Το κλασικό ερώτημα: «Τι είναι πιο βαρύ, ένα κιλό σίδερο ή ένα κιλό βαμβάκι;». Ποια είναι η σωστή απάντηση και γιατί; Τι διαφέρει μεταξύ τους;</p>' +
        '<button type="button" class="pa-btn" data-act="sol" data-t="c2">Δείτε την απάντηση</button>' +
        '<div class="pm-sol" id="c2" hidden><p>Και τα δύο έχουν ακριβώς το ίδιο βάρος. Ο λόγος είναι ότι έχουν την ίδια μάζα (1 kg) και, εφόσον τα συγκρίνουμε στον ίδιο τόπο, η βαρύτητα τα έλκει με την ίδια ακριβώς δύναμη. Αυτό που διαφέρει δραματικά μεταξύ τους είναι ο <strong>όγκος</strong>: το ένα κιλό βαμβάκι καταλαμβάνει πολύ μεγαλύτερο χώρο από ένα κιλό σίδερο.</p></div></div>' +
        '<div class="pa-box"><p><strong>Ερώτηση 3.</strong> Αν πάμε στη Σελήνη έναν ζυγό σύγκρισης με ίσους βραχίονες και θελήσουμε να ζυγίσουμε ένα αντικείμενο μάζας 2 kg, θα χρειαστούμε τα ίδια σταθμά (βαράκια) που θα χρειαζόμασταν στη Γη ή διαφορετικά; Αιτιολογήστε την απάντησή σας.</p>' +
        '<button type="button" class="pa-btn" data-act="sol" data-t="c3">Δείτε την απάντηση</button>' +
        '<div class="pm-sol" id="c3" hidden><p>Θα χρειαστούμε <strong>ακριβώς τα ίδια σταθμά</strong>. Ο ζυγός σύγκρισης λειτουργεί συγκρίνοντας τις μάζες και όχι τα βάρη. Η βαρύτητα της Σελήνης (που είναι 1/6 της γήινης) θα ασκήσει μικρότερη δύναμη (βάρος) τόσο στο αντικείμενο όσο και στα σταθμά, αλλά θα τα επηρεάσει και τα δύο αναλογικά. Έτσι η ισορροπία θα επιτευχθεί με την ίδια ακριβώς μάζα σταθμών που θα χρειαζόταν και στη Γη.</p></div></div>' +
        '</section></div>';
    }

    function render(mount) {
        mount.innerHTML = html();
        const root = mount.querySelector('.pm-wrap');
        const answered = {};
        let correct = 0;

        function wcalc() {
            const out = root.querySelector('#pm-out');
            const m = parseFloat(root.querySelector('#pm-m').value.trim().replace(',', '.'));
            const g = parseFloat(root.querySelector('#pm-g').value);
            if (!isFinite(m) || m <= 0) { out.innerHTML = '<div class="pa-msg bad">Γράψτε μια θετική μάζα σε kg (π.χ. 80).</div>'; return; }
            const w = m * g;
            const wEarth = m * 10, wMoon = m * 1.6;
            out.innerHTML = '<div class="pa-msg ok"><div>Μάζα: <strong>' + fmtN(m, 3) + ' kg</strong> (η ίδια σε κάθε τόπο)</div>' +
                '<div class="pa-final">W = m · g = ' + fmtN(m, 3) + ' kg · ' + fmtN(g, 2) + ' N/kg = <strong>' + fmtN(w, 3) + ' N</strong></div>' +
                '<div class="pa-small">Για σύγκριση (g = 10 N/kg στη Γη, 1,6 N/kg στη Σελήνη): στη Γη ' + fmtN(wEarth, 3) + ' N, στη Σελήνη ' + fmtN(wMoon, 3) + ' N.</div></div>';
        }

        root.addEventListener('click', e => {
            const b = e.target.closest('[data-act]');
            if (!b) return;
            const act = b.dataset.act;
            if (act === 'wcalc') wcalc();
            else if (act === 'sol') { const el = root.querySelector('#' + b.dataset.t); el.hidden = !el.hidden; b.textContent = el.hidden ? (b.textContent.replace('Κρύψτε', 'Δείτε')) : b.textContent.replace('Δείτε', 'Κρύψτε'); }
            else if (act === 'open-sol') root.querySelectorAll('.pm-sol').forEach(el => { el.hidden = false; });
            else if (act === 'close-sol') root.querySelectorAll('.pm-sol').forEach(el => { el.hidden = true; });
            else if (act === 'tf') {
                const i = +b.dataset.i;
                if (answered[i] !== undefined) return;
                const q = TF[i];
                const ok = (b.dataset.v === '1') === q[1];
                answered[i] = ok;
                if (ok) correct++;
                const box = root.querySelector('.pm-tf[data-i="' + i + '"]');
                box.classList.add(ok ? 'ok' : 'bad');
                const a = box.querySelector('.pm-tf-a');
                a.hidden = false;
                a.innerHTML = '<strong>' + (ok ? '✔ Σωστά!' : '✖ Όχι.') + ' Η σωστή απάντηση είναι: ' + (q[1] ? 'Σωστό' : 'Λάθος') + '.</strong> ' + q[2];
                box.querySelectorAll('button').forEach(x => { x.disabled = true; });
                if (Object.keys(answered).length === TF.length) {
                    const sc = root.querySelector('#pm-score');
                    sc.hidden = false;
                    sc.textContent = 'Αποτέλεσμα: ' + correct + ' / ' + TF.length + ' σωστές.';
                }
            }
        });
        root.querySelector('#pm-m').addEventListener('keydown', e => { if (e.key === 'Enter') wcalc(); });
        wcalc();
    }

    window.PhysAMass = { render };
})();
