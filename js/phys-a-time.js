/* ==========================================================================
   Physics Α: «Μέτρηση χρόνου – κρίσιμα σημεία του πειράματος (βασική εκδοχή)».
   Content: the school handout "Περιγραφή και ερμηνεία των σημαντικότερων σημείων της
   πειραματικής διαδικασίας" (main text + all footnotes, shown as expandable notes).
   window.PhysATime.render(mountElement)
   ========================================================================== */
(function () {
    'use strict';

    /* footnote helper: <sup> button + the note itself (closed until clicked) */
    function fn(n, text) {
        return '<button type="button" class="pa-fn" data-n="' + n + '" aria-expanded="false" title="Σημείωση ' + n + '">' + n + '</button>' +
            '<span class="pa-note" data-note="' + n + '" hidden><strong>Σημείωση ' + n + '.</strong> ' + text + '</span>';
    }

    const N = {
        1: 'Όπως εξηγήσαμε στο μάθημα, η απομάκρυνση δεν πρέπει να είναι μεγαλύτερη από <strong>10 περίπου μοίρες</strong> από τη θέση ισορροπίας, έτσι ώστε η περίοδος του εκκρεμούς να διατηρείται πρακτικά σταθερή μεταξύ των διαφόρων επαναλήψεων του πειράματος.<br>Αν απομακρύνουμε πιο πολύ την πλαστελίνη, η περίοδος πλέον <strong>αυξάνεται</strong> (όσο μεγαλώνει η γωνία, τόσο αυξάνεται και η τιμή της περιόδου) και εισάγουμε μια ακόμα πηγή σφάλματος, που θα μπορούσαμε να έχουμε αποφύγει.',
        2: 'Αυτός ο μαθητής περιμένει τη στιγμή που ο δευτερολεπτοδείκτης του ρολογιού θα βρίσκεται <strong>ακριβώς πάνω από την ένδειξη κάποιου δευτερολέπτου</strong> (κατά προτίμηση στην αρχή ή στη μέση κάποιου πρώτου λεπτού, για ευκολία στον υπολογισμό του χρόνου μετέπειτα), ώστε να ανακοινώσει την έναρξη της μέτρησης και να αρχίσει να μετρά από εκείνο το χρονικό σημείο.',
        3: 'Είναι σημαντικό αυτός ο μαθητής να βρίσκεται σε <strong>πλήρη ετοιμότητα</strong>, ώστε να ανακοινώνει την έναρξη («πάμε!») και τη λήξη («τέλος!») της μέτρησης σχεδόν ακαριαία, είτε όταν αφήνει είτε όταν σταματά την πλαστελίνη.<br>Πρέπει επίσης να προσέχει πάρα πολύ να κρατά το επάνω μέρος του νήματος <strong>απολύτως σταθερό</strong>, ενώ στην αρχή απλώς να αφήνει την πλαστελίνη να κινηθεί από μόνη της και <strong>να μην την ωθήσει (σπρώξει) καθόλου</strong>, ώστε να κινείται διαρκώς σε μια ευθεία γραμμή, χωρίς να παραπαίει (χωρίς να πηγαίνει πέρα-δώθε κατά τη διάρκεια της ταλάντωσής της).',
        4: 'Η διαίρεση με το 10 γίνεται με μετακίνηση της υποδιαστολής κατά ένα ψηφίο προς τα αριστερά.',
        5: 'Θα μπορούσαμε να την επαναλάβουμε 20 ή 100 φορές ή οποιονδήποτε άλλο αριθμό. Το 10 βολεύει και γιατί η διαίρεση είναι πανεύκολη και γιατί οι μετρήσεις ολοκληρώνονται σε σύντομο χρονικό διάστημα, σε σχέση π.χ. με το 100, που είναι σίγουρα πολύ πιο χρονοβόρο.<br>Κάθε φορά πρέπει να αποφασίζουμε τον αριθμό των επαναλήψεων ανάλογα με το πείραμα, προσπαθώντας να επιτύχουμε μια <strong>λεπτή ισορροπία μεταξύ του απαιτούμενου χρόνου, της επιθυμητής ακρίβειας και του αποδεκτού μεγέθους του σφάλματος</strong>.',
        6: 'Δηλαδή να έχουμε την πεποίθηση ότι μπορούμε να εμπιστευθούμε το τελικό μας αποτέλεσμα και να ισχυριστούμε ότι είναι με μεγάλη πιθανότητα κοντά στην πραγματική τιμή που ψάχνουμε.',
        7: 'Ακόμα και στην τελειότερη εκτέλεση του πειράματος πάντα θα υπάρχει κάποιο σφάλμα (έστω και μικρότερο από το δικό μας) από τους χρόνους αντίδρασης αυτών που συμμετέχουν, όσο πεπειραμένοι και αν είναι. Συγκεκριμένα, στο πείραμά μας είναι ανθρωπίνως αδύνατον να μειώσουμε το σφάλμα κάτω από ένα κατώτατο όριο <strong>ΔΤ = 0,2 – 0,3 s</strong>.',
        8: 'Η επιλογή του βιβλίου του ίδιου αριθμού (10) και για τις δύο (εντελώς ανεξάρτητες και διαφορετικές μεταξύ τους) καταστάσεις είναι ατυχής και περιπλέκει τις έννοιες που θέλει να περιγράψει, προκαλώντας σύγχυση χωρίς λόγο.'
    };

    function html() {
        return '' +
        '<div class="pa-wrap">' +
        '<header class="pa-head"><div class="pa-kicker">Φυσική Α΄ Γυμνασίου · Μέτρηση χρόνου · Βασικές παρατηρήσεις</div>' +
        '<h2>⏱ Κρίσιμα σημεία της μέτρησης του χρόνου δέκα ταλαντώσεων ενός απλού εκκρεμούς</h2>' +
        '<p>Περιγραφή και ερμηνεία των σημαντικότερων σημείων της πειραματικής διαδικασίας. Οι μικρότερης σημασίας παρατηρήσεις και συμβουλές του φυλλαδίου βρίσκονται στις <strong>σημειώσεις</strong> (μικρά αριθμημένα κουμπιά): πατήστε ένα νούμερο για να ανοίξει. Μετά την αρχική μελέτη του κειμένου αξίζει να τις διαβάσετε όλες, γιατί δίνουν σημαντικές λεπτομέρειες, ερμηνείες και απαντήσεις σε απορίες για τις επιλογές μας.</p>' +
        '<div class="pa-tools"><button type="button" class="pa-btn" data-act="open-all">📂 Άνοιγμα όλων των σημειώσεων</button><button type="button" class="pa-btn" data-act="close-all">📁 Κλείσιμο όλων</button></div>' +
        '<div class="pa-exlink"><button type="button" class="pa-btn pa-btn-main" data-act="example">🔬 Δείτε το σε ένα απτό παράδειγμα με πραγματικές μετρήσεις →</button></div></header>' +

        /* 1 */
        '<section class="pa-card" id="pa-s1"><h3><span class="pa-num">1</span> Η πειραματική διαδικασία</h3>' +
        '<p>Το πείραμα για τον υπολογισμό του <strong>χρόνου 10 ταλαντώσεων</strong> ενός απλού εκκρεμούς (συνήθως ένα κομμάτι σκοινί με μια μπαλίτσα από πλαστελίνη στο άκρο) οργανώθηκε περίπου ως εξής:</p>' +
        '<div class="pa-roles">' +
        '<div class="pa-role"><div class="pa-role-n">1ος μαθητής</div><div class="pa-role-t">🧶 Το εκκρεμές</div><p>Κρατά σταθερά με το ένα χέρι τη μία άκρη του νήματος, ενώ με το άλλο απομακρύνει την πλαστελίνη ελαφρώς' + fn(1, N[1]) + ' από τη θέση (κατακόρυφη) ισορροπίας της. Αφήνει την πλαστελίνη να ξεκινήσει την ταλάντωση και, στο τέλος, τη σταματά και ανακοινώνει τη λήξη.</p></div>' +
        '<div class="pa-role"><div class="pa-role-n">2ος μαθητής</div><div class="pa-role-t">🕰️ Το ρολόι</div><p>Κρατά ένα απλό αναλογικό ρολόι (με ακρίβεια δευτερολέπτου) και ανακοινώνει δυνατά την έναρξη' + fn(2, N[2]) + ' του πειράματος, ώστε ο πρώτος να αφήσει ταυτόχρονα την πλαστελίνη.</p></div>' +
        '<div class="pa-role"><div class="pa-role-n">3ος μαθητής</div><div class="pa-role-t">⏲️ Το χρονόμετρο</div><p>Χρησιμοποιεί ένα χρονόμετρο με ακρίβεια εκατοστού του δευτερολέπτου.</p></div></div>' +
        '<ol class="pa-steps"><li><strong>Έναρξη:</strong> ο 2ος μαθητής ανακοινώνει την έναρξη και ο 1ος αφήνει την πλαστελίνη.</li>' +
        '<li><strong>Λήξη:</strong> στο τέλος του χρονικού διαστήματος των 10 ταλαντώσεων ο μαθητής που χειρίζεται το εκκρεμές ανακοινώνει δυνατά το τέλος' + fn(3, N[3]) + ', εκτιμώντας νοερά ότι το εκκρεμές έχει ολοκληρώσει και την 10η ταλάντωσή του (έχει επιστρέψει για 10η φορά στο σημείο από το οποίο αφέθηκε αρχικά).</li>' +
        '<li><strong>Μέτρηση:</strong> οι άλλοι δύο παίρνουν όσο πιο «αστραπιαία» μπορούν τις αντίστοιχες μετρήσεις τους.</li></ol>' +
        '<p class="pa-key">Όλοι πρέπει να λειτουργούν όσο περισσότερο συγχρονισμένα είναι εφικτό, ώστε να ελαχιστοποιείται το συνολικό σφάλμα της μέτρησης.</p></section>' +

        /* 2 */
        '<section class="pa-card" id="pa-s2"><h3><span class="pa-num">2</span> Κρίσιμα σημεία: τι κάνουμε και γιατί</h3>' +
        '<div class="pa-grid">' +
        '<div class="pa-point"><div class="pa-ico">📐</div><h4>Μικρή γωνία (≈ 10°)</h4><p>Η απομάκρυνση από την κατακόρυφο δεν ξεπερνά τις 10 περίπου μοίρες, ώστε η περίοδος να μένει πρακτικά σταθερή στις επαναλήψεις. Με μεγαλύτερη γωνία η περίοδος αυξάνεται και έχουμε ακόμα μία πηγή σφάλματος, που μπορούσαμε να αποφύγουμε.</p></div>' +
        '<div class="pa-point"><div class="pa-ico">🕰️</div><h4>Ποιος δίνει την έναρξη;</h4><p>Την έναρξη την ανακοινώνει ο μαθητής με το <strong>ρολόι</strong>, όταν ο δευτερολεπτοδείκτης είναι ακριβώς πάνω από κάποιο δευτερόλεπτο. Έτσι ξεκινά από ακέραιο δευτερόλεπτο και δεν χρειάζεται να στρογγυλοποιήσει στην αρχή.</p></div>' +
        '<div class="pa-point"><div class="pa-ico">⚠️</div><h4>Αν την έναρξη τη δώσει άλλος</h4><p>Αν την έναρξη δήλωνε ο μαθητής του εκκρεμούς ή αυτός του χρονομέτρου, ο μαθητής με το ρολόι δεν θα ήταν βέβαιο ότι ξεκινά από ακέραιο δευτερόλεπτο και θα αναγκαζόταν να επιλέξει το προηγούμενο ή το επόμενο, δηλαδή να «στρογγυλοποιήσει» στην αρχή της μέτρησης. Θα αυξάνονταν επίσης οι πιθανότητες να μπερδευτεί και να υπολογίσει λανθασμένα την τελική μέτρηση.</p></div>' +
        '<div class="pa-point"><div class="pa-ico">🏁</div><h4>Η λήξη αναγκαστικά στρογγυλοποιείται</h4><p>Η εντολή λήξης δίνεται αναγκαστικά από τον μαθητή που χειρίζεται το εκκρεμές. Άρα η απόφαση «στρογγυλοποίησης» στο τέλος της μέτρησης είναι αναπόφευκτη, σε κάθε περίπτωση.</p></div>' +
        '<div class="pa-point"><div class="pa-ico">✋</div><h4>Σταθερό νήμα, χωρίς ώθηση</h4><p>Το επάνω μέρος του νήματος μένει απολύτως σταθερό και η πλαστελίνη απλώς αφήνεται: δεν την ωθούμε καθόλου, ώστε να κινείται σε ευθεία γραμμή και να μην παραπαίει.</p></div>' +
        '<div class="pa-point"><div class="pa-ico">⚡</div><h4>Ετοιμότητα και συγχρονισμός</h4><p>«Πάμε!» και «τέλος!» ανακοινώνονται σχεδόν ακαριαία, όταν η πλαστελίνη αφήνεται και όταν σταματά. Όλοι συγχρονίζονται όσο γίνεται καλύτερα.</p></div>' +
        '</div></section>' +

        /* 3 */
        '<section class="pa-card" id="pa-s3"><h3><span class="pa-num">3</span> Γιατί επαναλαμβάνουμε το πείραμα; Σφάλματα</h3>' +
        '<p>Παρά την προσοχή στην εκτέλεση, με κάθε δυνατή λεπτομέρεια, είναι αναμενόμενο και απολύτως φυσιολογικό να εισαχθούν <strong>σφάλματα</strong> στις μετρήσεις. Το ζητούμενο είναι να είναι όσο μικρότερα γίνεται.</p>' +
        '<p>Δεν εκτελούμε τη μέτρηση μόνο μία φορά (ανεξαρτήτως του οργάνου που χρησιμοποιούμε): ακολουθούμε την ίδια τακτική με τις μετρήσεις του μήκους και <strong>επαναλαμβάνουμε πολλές φορές το πείραμα</strong>, εδώ πάλι 10 φορές, γιατί έτσι διευκολύνεται πολύ η διαίρεση' + fn(4, N[4]) + ' για τον υπολογισμό του μέσου όρου' + fn(5, N[5]) + ', ώστε να πλησιάσουμε στατιστικά' + fn(6, N[6]) + ' την πραγματική τιμή (την οποία δεν γνωρίζουμε εκ των προτέρων).</p>' +
        '<div class="pa-two">' +
        '<div class="pa-box pa-good"><h4>Μπορεί μια μέτρηση να είναι τέλεια;</h4><p>Δεν αποκλείεται, εντελώς συμπωματικά, κάποια μέτρηση να είναι πράγματι τέλεια' + fn(7, N[7]) + '. Επειδή όμως δεν γνωρίζουμε την πραγματική τιμή, δεν μπορούμε να είμαστε σίγουροι γι' + "'" + ' αυτό.</p></div>' +
        '<div class="pa-box pa-warn"><h4>Τι πάει συνήθως στραβά;</h4><ul><li>Ο μαθητής έχασε τη συγκέντρωσή του και καθυστέρησε πολύ να αντιδράσει, στην αρχή ή στο τέλος.</li><li>Διάβασε εντελώς λάθος την ένδειξη στο ρολόι ή στο χρονόμετρο.</li><li>Δεν συγχρονίστηκε σωστά με κάποιον συνεργάτη.</li></ul></div></div>' +
        '<p class="pa-key">Το πιθανότερο είναι ότι κάθε μέτρηση θα είναι λίγο ή περισσότερο λανθασμένη. Γι' + "'" + ' αυτό παίρνουμε τον μέσο όρο των επαναλήψεων.</p></section>' +

        /* 4 */
        '<section class="pa-card" id="pa-s4"><h3><span class="pa-num">4</span> Μέσος όρος και ακρίβεια του αποτελέσματος</h3>' +
        '<p>Στο τέλος υπολογίζουμε τον <strong>μέσο όρο των 10 επαναληπτικών πειραμάτων</strong>: αθροίζουμε τις 10 τιμές της περιόδου που υπολογίσαμε από κάθε ξεχωριστή πειραματική διαδικασία και διαιρούμε το άθροισμα με το 10.</p>' +
        '<div class="pa-rule">Προσοχή: το τελικό αποτέλεσμα δίνεται <strong>πάντα με την ακρίβεια των αρχικών μετρήσεων</strong>. Δεν παρασυρόμαστε να απαντήσουμε με μεγαλύτερη ακρίβεια επειδή φαινομενικά μοιάζει ότι την έχουμε.</div>' +
        '<div class="pa-two">' +
        '<div class="pa-box"><h4>🕰️ Αναλογικό ρολόι (ακρίβεια δευτερολέπτου)</h4><p>Στρογγυλοποιούμε στο κοντινότερο δευτερόλεπτο, <strong>χωρίς κανένα δεκαδικό μέρος</strong>.</p><div class="pa-calc-ex">136 ÷ 10 = <strong>13,6 s</strong> → <strong class="pa-res">14 s</strong></div><p class="pa-small">Όλες οι αρχικές μετρήσεις λήφθηκαν με στρογγυλοποίηση στο κοντινότερο δευτερόλεπτο, άρα δεν μπορούμε να απαντήσουμε με μεγαλύτερη ακρίβεια. Θα ήταν σαν η διαδικασία του μέσου όρου να είχε «ως εκ θαύματος» αυξήσει την ακρίβεια, κάτι που δεν συμβαίνει. Αν το αποτέλεσμα ήταν από 13,1 έως 13,4 θα στρογγυλοποιούσαμε στο 13.</p></div>' +
        '<div class="pa-box"><h4>⏲️ Χρονόμετρο (ακρίβεια εκατοστού)</h4><p>Στρογγυλοποιούμε στα <strong>δύο δεκαδικά ψηφία</strong>.</p><div class="pa-calc-ex">142,67 ÷ 10 = <strong>14,267 s</strong> → <strong class="pa-res">14,27 s</strong></div><p class="pa-small">Οι αρχικές μετρήσεις λήφθηκαν με ακρίβεια εκατοστού (το χρονόμετρο «στρογγυλοποιεί» από μόνο του σε αυτό το επίπεδο), άρα δεν μπορούμε ξαφνικά να απαντήσουμε με ακρίβεια χιλιοστού. Αν είχαμε αποτέλεσμα από 14,260 έως 14,264 θα στρογγυλοποιούσαμε στο 14,26.</p></div></div>' +
        '<p><button type="button" class="pa-btn pa-btn-main" data-act="example">🔬 Δείτε και ολόκληρο το παράδειγμα με τις 10 μετρήσεις →</button></p>' +
        '<p class="pa-small">Τα παραδείγματα είναι από τις μετρήσεις και την επεξεργασία του συνοδευτικού υλικού του ΕΚΦΕ Χαλανδρίου (τελευταία σελίδα).</p>' +

        '<h4 class="pa-sub">Φαινομενικό παράδοξο, αλλά πολύ σημαντικό: 14 s ≠ 14,0 s</h4>' +
        '<p>Παρά το ότι μαθηματικά είναι ο ίδιος αριθμός (δεκατέσσερα), στη Φυσική υποδηλώνουν <strong>διαφορετικές καταστάσεις</strong>:</p>' +
        '<div class="pa-two">' +
        '<div class="pa-box"><div class="pa-big">14 s</div><p>Ο ακέραιος 14 μας λέει ότι δεν έχουμε την παραμικρή ιδέα για το δεκαδικό μέρος της μέτρησης: θα μπορούσε να είναι από <strong>13,5 έως 14,4</strong>, αφού όλοι αυτοί οι δεκαδικοί στρογγυλοποιούνται στον ακέραιο 14.</p></div>' +
        '<div class="pa-box"><div class="pa-big">14,0 s</div><p>Ο δεκαδικός 14,0 μας λέει ότι είμαστε πεπεισμένοι ότι δεν υπάρχει κανένα δέκατο μετά το 14, γιατί έχουμε μετρήσει με <strong>ακρίβεια δεκάτου του δευτερολέπτου</strong>.</p></div></div>' +
        '</section>' +

        /* 5 */
        '<section class="pa-card" id="pa-s5"><h3><span class="pa-num">5</span> Μην μπερδεύετε τα δύο «10»' + fn(8, N[8]) + '</h3>' +
        '<p>Πρέπει να αποφύγουμε τη συνηθισμένη σύγχυση και να αντιληφθούμε τη <strong>εννοιολογική διαφορά</strong> μεταξύ:</p>' +
        '<div class="pa-two">' +
        '<div class="pa-box pa-a"><div class="pa-tag">(α)</div><h4>Να επαναλάβουμε 10 φορές το ίδιο πείραμα</h4><p>Στοχεύει στη <strong>βελτίωση της στατιστικής αξιοπιστίας</strong> του τελικού αποτελέσματος, ώστε να θεωρείται περισσότερο αξιόπιστο.</p></div>' +
        '<div class="pa-box pa-b"><div class="pa-tag">(β)</div><h4>Να μετρήσουμε τον χρόνο 10 διαδοχικών ταλαντώσεων</h4><p>Επιδιώκει την <strong>ελαχιστοποίηση του σφάλματος</strong> στον υπολογισμό της περιόδου της ταλάντωσης.</p></div></div></section>' +

        /* calculator */
        '<section class="pa-card pa-calcbox" id="pa-calc"><h3><span class="pa-num">🧮</span> Δοκιμή: υπολογίστε και στρογγυλοποιήστε σωστά</h3>' +
        '<p>Δώστε το <strong>άθροισμα των 10 επαναληπτικών μετρήσεων</strong> και διαλέξτε το όργανο. Η εφαρμογή διαιρεί με το 10 και στρογγυλοποιεί με τον κανόνα της ακρίβειας των αρχικών μετρήσεων. Ο μέσος όρος εδώ είναι ο μέσος χρόνος των 10 ταλαντώσεων· ό,τι δώσετε, η διαίρεση γίνεται με το 10 όπως στο φυλλάδιο.</p>' +
        '<div class="pa-calc-form"><label>Όργανο<select id="pa-inst"><option value="clock">🕰️ Αναλογικό ρολόι (δευτερόλεπτο)</option><option value="stop">⏲️ Χρονόμετρο (εκατοστό)</option></select></label>' +
        '<label>Άθροισμα 10 μετρήσεων (s)<input id="pa-sum" type="text" inputmode="decimal" placeholder="π.χ. 136 ή 142,67" autocomplete="off"></label>' +
        '<button type="button" class="pa-btn pa-btn-main" data-act="calc">Υπολογισμός</button></div>' +
        '<div class="pa-calc-out" id="pa-out" aria-live="polite"></div></section>' +
        '</div>';
    }

    function render(mount) {
        mount.innerHTML = html();
        const root = mount.querySelector('.pa-wrap');

        function toggle(n, force) {
            const note = root.querySelector('.pa-note[data-note="' + n + '"]');
            const btns = root.querySelectorAll('.pa-fn[data-n="' + n + '"]');
            if (!note) return;
            const open = force === undefined ? note.hidden : force;
            note.hidden = !open;
            btns.forEach(b => { b.classList.toggle('on', open); b.setAttribute('aria-expanded', open ? 'true' : 'false'); });
        }

        /* the same note can be referenced twice (3): show only the first copy, mirror state to the button */
        root.addEventListener('click', e => {
            const fnb = e.target.closest('.pa-fn');
            if (fnb) { toggle(fnb.dataset.n); return; }
            const b = e.target.closest('[data-act]');
            if (!b) return;
            if (b.dataset.act === 'open-all') { for (let n = 1; n <= 8; n++) toggle(n, true); }
            else if (b.dataset.act === 'close-all') { for (let n = 1; n <= 8; n++) toggle(n, false); }
            else if (b.dataset.act === 'calc') calc();
            else if (b.dataset.act === 'example') renderExample(mount, () => render(mount));
        });
        root.querySelector('#pa-sum').addEventListener('keydown', e => { if (e.key === 'Enter') calc(); });

        function calc() {
            const out = root.querySelector('#pa-out');
            const raw = root.querySelector('#pa-sum').value.trim().replace(',', '.');
            const inst = root.querySelector('#pa-inst').value;
            const sum = parseFloat(raw);
            if (!isFinite(sum) || sum <= 0) { out.innerHTML = '<div class="pa-msg bad">Γράψτε ένα θετικό αριθμό για το άθροισμα (π.χ. 136 ή 142,67).</div>'; return; }
            const mean = sum / 10;
            const fmtN = (x, d) => x.toFixed(d).replace('.', ',');
            const res = inst === 'clock' ? Math.round(mean) : Math.round(mean * 100) / 100;
            const dec = inst === 'clock' ? 0 : 2;
            const why = inst === 'clock'
                ? 'Οι αρχικές μετρήσεις έχουν ακρίβεια δευτερολέπτου, άρα το αποτέλεσμα δίνεται στο κοντινότερο δευτερόλεπτο, χωρίς δεκαδικό μέρος.'
                : 'Οι αρχικές μετρήσεις έχουν ακρίβεια εκατοστού του δευτερολέπτου, άρα το αποτέλεσμα δίνεται με δύο δεκαδικά ψηφία.';
            out.innerHTML = '<div class="pa-msg ok"><div>Μέσος όρος: ' + fmtN(sum, 2).replace(/,00$/, '') + ' ÷ 10 = <strong>' + fmtN(mean, 3).replace(/0+$/, '').replace(/,$/, '') + ' s</strong></div>' +
                '<div class="pa-final">Τελικό αποτέλεσμα: <strong>' + fmtN(res, dec) + ' s</strong></div><div class="pa-small">' + why + '</div></div>';
        }
    }


    /* ------------------------------------------------------------------ second page: a concrete example (10 measurements) */
    const CLOCK = [13, 13, 14, 14, 14, 13, 14, 13, 14, 14];
    const STOP = [14.20, 14.09, 14.34, 14.40, 14.51, 14.28, 14.23, 14.21, 14.24, 14.17];

    function nf(x, d) { return x.toFixed(d).replace('.', ','); }
    function trimZ(s) { return s.indexOf(',') < 0 ? s : s.replace(/0+$/, '').replace(/,$/, ''); }

    function exampleHtml() {
        let rows = '';
        for (let i = 0; i < 10; i++) {
            rows += '<tr><td>' + (i + 1) + '</td><td><input class="pe-in" data-k="c" data-i="' + i + '" value="' + CLOCK[i] + '" inputmode="decimal"></td>' +
                '<td><input class="pe-in" data-k="s" data-i="' + i + '" value="' + nf(STOP[i], 2) + '" inputmode="decimal"></td></tr>';
        }
        return '' +
        '<div class="pa-wrap">' +
        '<header class="pa-head"><div class="pa-kicker">Φυσική Α΄ Γυμνασίου · Μέτρηση χρόνου · Απτό παράδειγμα</div>' +
        '<h2>🔬 Από τις 10 μετρήσεις στην τελική απάντηση</h2>' +
        '<p>Εδώ εφαρμόζουμε όσα είπαμε σε ένα πραγματικό παράδειγμα: οι <strong>δέκα επαναλήψεις</strong> του πειράματος, με τον χρόνο 10 ταλαντώσεων του απλού εκκρεμούς, μετρημένο με <strong>αναλογικό ρολόι</strong> (ακρίβεια δευτερολέπτου) και με <strong>ψηφιακό χρονόμετρο</strong> (ακρίβεια εκατοστού του δευτερολέπτου). Μπορείτε να αλλάξετε τις τιμές στον πίνακα και να δείτε πώς αλλάζει το αποτέλεσμα.</p>' +
        '<div class="pa-tools"><button type="button" class="pa-btn" data-act="back">⬅ Πίσω στα κρίσιμα σημεία</button><button type="button" class="pa-btn" data-act="reset-ex">↺ Αρχικές τιμές</button></div></header>' +

        '<section class="pa-card"><h3><span class="pa-num">1</span> Οι μετρήσεις</h3>' +
        '<p>Κάθε γραμμή είναι μία επανάληψη του πειράματος. Στο ρολόι οι μετρήσεις είναι ακέραια δευτερόλεπτα· στο χρονόμετρο έχουν δύο δεκαδικά.</p>' +
        '<div class="pm-tablewrap"><table class="pm-table pe-table"><thead><tr><th>Μέτρηση</th><th>Χρόνος 10 ταλαντώσεων<br>αναλογικό ρολόι (s)</th><th>Χρόνος 10 ταλαντώσεων<br>ψηφιακό χρονόμετρο (s)</th></tr></thead><tbody>' + rows +
        '<tr class="pe-sum"><td>Άθροισμα</td><td id="pe-sc">–</td><td id="pe-ss">–</td></tr></tbody></table></div>' +
        '<p class="pa-key">Έχοντας έναν πίνακα γεμάτο αριθμούς, πώς βγάζουμε ένα και μοναδικό, αξιόπιστο συμπέρασμα; Με τον μέσο όρο και τον «χρυσό κανόνα» της στρογγυλοποίησης.</p></section>' +

        '<section class="pa-card"><h3><span class="pa-num">2</span> Πώς πέφτουν οι μετρήσεις;</h3>' +
        '<p>Κάθε τελεία είναι μία μέτρηση· η κάθετη γραμμή είναι ο μέσος όρος. Παρατηρήστε πόσο διαφορετική είναι η «πυκνότητα» των τιμών στα δύο όργανα.</p>' +
        '<div class="pe-plots"><div><h4>🕰️ Αναλογικό ρολόι</h4><div id="pe-pc" class="pe-plotbox" data-zoom="1"></div></div><div><h4>⏲️ Ψηφιακό χρονόμετρο</h4><div id="pe-ps" class="pe-plotbox" data-zoom="1"></div></div></div><p class="pm-zoomhint">🔍 Πατήστε πάνω σε ένα διάγραμμα για μεγέθυνση</p></section>' +

        '<section class="pa-card"><h3><span class="pa-num">3</span> Μέσος όρος και στρογγυλοποίηση, βήμα βήμα</h3>' +
        '<p>Για να συνδυάσουμε όλες τις μετρήσεις σε μία αντιπροσωπευτική τιμή, αθροίζουμε όλες τις τιμές και διαιρούμε με τον αριθμό των μετρήσεων (εδώ 10).</p>' +
        '<div class="pa-rule">Χρυσός κανόνας: το τελικό αποτέλεσμα δίνεται <strong>πάντα με την ακρίβεια των αρχικών μετρήσεων</strong>. Ο μέσος όρος δεν μπορεί «ως εκ θαύματος» να αυξήσει την ακρίβεια του οργάνου.</div>' +
        '<div class="pa-two">' +
        '<div class="pa-box pa-a"><h4>🕰️ Αναλογικό ρολόι</h4><div class="pe-steps" id="pe-stc"></div></div>' +
        '<div class="pa-box pa-b"><h4>⏲️ Ψηφιακό χρονόμετρο</h4><div class="pe-steps" id="pe-sts"></div></div></div></section>' +

        '<section class="pa-card"><h3><span class="pa-num">4</span> Τι σημαίνει «14 s» και τι «14,0 s»;</h3>' +
        '<p>Μαθηματικά είναι ο ίδιος αριθμός, αλλά στη Φυσική η διαφορά τους δεν είναι στην ποσότητα, αλλά στην <strong>πληροφορία για την ακρίβεια</strong> της μέτρησης.</p>' +
        '<div class="pe-range pe-plotbox" data-zoom="1"><svg viewBox="0 0 640 170" class="pe-svg" role="img" aria-label="14 s και 14,0 s"><line x1="20" y1="44" x2="620" y2="44" class="pe-axis"/><line x1="20" y1="34" x2="20" y2="44" class="pe-axis"/><text x="20" y="24" text-anchor="middle" class="pe-tick">13,0</text><line x1="220" y1="34" x2="220" y2="44" class="pe-axis"/><text x="220" y="24" text-anchor="middle" class="pe-tick">13,5</text><line x1="420" y1="34" x2="420" y2="44" class="pe-axis"/><text x="420" y="24" text-anchor="middle" class="pe-tick">14,0</text><line x1="580" y1="34" x2="580" y2="44" class="pe-axis"/><text x="580" y="24" text-anchor="middle" class="pe-tick">14,4</text><line x1="620" y1="34" x2="620" y2="44" class="pe-axis"/><text x="620" y="24" text-anchor="middle" class="pe-tick">14,5</text><rect x="220" y="56" width="380" height="36" rx="8" class="pe-r14"/><text x="410" y="79" text-anchor="middle" class="pe-rt">14 s: οπουδήποτε από 13,5 έως 14,4</text><rect x="413" y="108" width="14" height="36" rx="5" class="pe-r140"/><text x="396" y="131" text-anchor="end" class="pe-rt">14,0 s: το πρώτο δεκαδικό είναι μηδέν</text></svg><div class="pm-zoomhint">🔍 Πατήστε για μεγέθυνση</div></div>' +
        '<div class="pa-two"><div class="pa-box"><div class="pa-big">14 s</div><p>Δηλώνουμε ότι η μέτρηση είναι περίπου 14 δευτερόλεπτα. Δεν έχουμε καμία ιδέα για το δεκαδικό μέρος: η πραγματική τιμή θα μπορούσε να είναι από <strong>13,5 s έως 14,4 s</strong>, αφού όλες αυτές στρογγυλοποιούνται στο 14. Δήλωση <strong>χαμηλής ακρίβειας</strong>.</p></div>' +
        '<div class="pa-box"><div class="pa-big">14,0 s</div><p>Δηλώνουμε κάτι πολύ ισχυρότερο: είμαστε πεπεισμένοι ότι το πρώτο δεκαδικό ψηφίο είναι πράγματι μηδέν, επειδή χρησιμοποιήσαμε όργανο με ακρίβεια τουλάχιστον δεκάτου του δευτερολέπτου. Δήλωση <strong>πολύ πιο ακριβής</strong>.</p></div></div>' +
        '<p class="pa-key">Γι\' αυτό στο ρολόι γράφουμε 14 s και στο χρονόμετρο 14,27 s: το καθένα λέει την ιστορία του οργάνου του.</p></section>' +
        '<div class="pa-tools"><button type="button" class="pa-btn" data-act="back">⬅ Πίσω στα κρίσιμα σημεία</button></div>' +
        '</div>';
    }

    function dotPlot(vals, lo, hi, mean, unit) {
        const cnt = {};
        let maxStack = 1;
        vals.forEach(v => { const k = Math.round(v * 100); cnt[k] = (cnt[k] || 0) + 1; if (cnt[k] > maxStack) maxStack = cnt[k]; });
        const W = 520, H = 70 + 18 * maxStack, L = 24, R = W - 24, y0 = H - 40;
        const X = v => L + (v - lo) / (hi - lo) * (R - L);
        let s = '<svg viewBox="0 0 ' + W + ' ' + H + '" class="pe-svg" role="img">';
        s += '<line x1="' + L + '" y1="' + y0 + '" x2="' + R + '" y2="' + y0 + '" class="pe-axis"/>';
        const step = (hi - lo) >= 2 ? 1 : 0.1;
        for (let v = Math.ceil(lo / step) * step; v <= hi + 1e-9; v += step) {
            const x = X(v);
            s += '<line x1="' + x + '" y1="' + y0 + '" x2="' + x + '" y2="' + (y0 + 6) + '" class="pe-axis"/><text x="' + x + '" y="' + (y0 + 24) + '" text-anchor="middle" class="pe-tick">' + nf(v, step === 1 ? 0 : 1) + '</text>';
        }
        const stack = {};
        vals.forEach(v => {
            const key = Math.round(v * 100);
            stack[key] = (stack[key] || 0) + 1;
            s += '<circle cx="' + X(v) + '" cy="' + (y0 - 11 - (stack[key] - 1) * 18) + '" r="8" class="pe-dot"/>';
        });
        if (isFinite(mean)) s += '<line x1="' + X(mean) + '" y1="6" x2="' + X(mean) + '" y2="' + y0 + '" class="pe-mean"/><text x="' + X(mean) + '" y="12" text-anchor="' + (X(mean) > W / 2 ? 'end' : 'start') + '" dx="' + (X(mean) > W / 2 ? -5 : 5) + '" class="pe-meant">μέσος όρος ' + nf(mean, 3).replace(/0+$/, '').replace(/,$/, '') + ' ' + unit + '</text>';
        return s + '</svg>';
    }


    function openZoomPlot(box) {
        const svg = box.querySelector('svg');
        if (!svg) return;
        const ov = document.createElement('div');
        ov.className = 'pm-lb';
        ov.innerHTML = '<div class="pm-lb-bar"><button type="button" data-z="out">− Σμίκρυνση</button><button type="button" data-z="in">+ Μεγέθυνση</button><button type="button" data-z="fit">⤢ Προσαρμογή</button><button type="button" data-z="close">✕ Κλείσιμο</button></div><div class="pm-lb-body"></div>';
        const body = ov.querySelector('.pm-lb-body');
        const big = svg.cloneNode(true);
        big.setAttribute('class', 'pm-lb-svg');
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

    function renderExample(mount, back) {
        mount.innerHTML = exampleHtml();
        const root = mount.querySelector('.pa-wrap');
        const val = { c: CLOCK.slice(), s: STOP.slice() };

        function parse(v) { const x = parseFloat(String(v).trim().replace(',', '.')); return isFinite(x) ? x : NaN; }

        function steps(vals, kind) {
            const ok = vals.every(isFinite);
            if (!ok) return '<div class="pa-msg bad">Συμπληρώστε και τις 10 μετρήσεις με αριθμούς.</div>';
            const sum = vals.reduce((a, b) => a + b, 0);
            const mean = sum / 10;
            const clock = kind === 'c';
            const res = clock ? Math.round(mean) : Math.round(mean * 100) / 100;
            const sumS = trimZ(nf(sum, 2));
            const meanS = trimZ(nf(mean, 3));
            return '<div class="pe-step"><span class="pe-sn">1</span><div><strong>Άθροισμα</strong><br>' + sumS + ' s</div></div>' +
                '<div class="pe-step"><span class="pe-sn">2</span><div><strong>Μέσος όρος</strong><br>' + sumS + ' ÷ 10 = <strong>' + meanS + ' s</strong></div></div>' +
                '<div class="pe-step"><span class="pe-sn">3</span><div><strong>Ακρίβεια των μετρήσεων</strong><br>' + (clock ? 'ακέραια δευτερόλεπτα (ακρίβεια δευτερολέπτου)' : 'δύο δεκαδικά ψηφία (ακρίβεια εκατοστού)') + '</div></div>' +
                '<div class="pe-step pe-final"><span class="pe-sn">4</span><div><strong>Τελική τιμή</strong><br>' + meanS + ' s → <span class="pa-res">' + nf(res, clock ? 0 : 2) + ' s</span><div class="pa-small">' +
                (clock ? 'Στρογγυλοποιούμε στον πλησιέστερο ακέραιο, χωρίς δεκαδικό μέρος.' : 'Στρογγυλοποιούμε στα δύο δεκαδικά ψηφία.') + '</div></div></div>';
        }

        function update() {
            const sc = val.c.every(isFinite) ? val.c.reduce((a, b) => a + b, 0) : NaN;
            const ss = val.s.every(isFinite) ? val.s.reduce((a, b) => a + b, 0) : NaN;
            root.querySelector('#pe-sc').textContent = isFinite(sc) ? trimZ(nf(sc, 2)) : '–';
            root.querySelector('#pe-ss').textContent = isFinite(ss) ? trimZ(nf(ss, 2)) : '–';
            root.querySelector('#pe-stc').innerHTML = steps(val.c, 'c');
            root.querySelector('#pe-sts').innerHTML = steps(val.s, 's');
            const okc = val.c.every(isFinite), oks = val.s.every(isFinite);
            const cc = okc ? val.c : [];
            const ssv = oks ? val.s : [];
            root.querySelector('#pe-pc').innerHTML = okc ? dotPlot(cc, Math.floor(Math.min.apply(null, cc)) - 1, Math.ceil(Math.max.apply(null, cc)) + 1, sc / 10, 's') : '';
            const lo = oks ? Math.floor(Math.min.apply(null, ssv) * 10) / 10 - 0.1 : 0, hi = oks ? Math.ceil(Math.max.apply(null, ssv) * 10) / 10 + 0.1 : 1;
            root.querySelector('#pe-ps').innerHTML = oks ? dotPlot(ssv, lo, hi, ss / 10, 's') : '';
        }

        root.addEventListener('input', e => {
            const t = e.target.closest('.pe-in');
            if (!t) return;
            val[t.dataset.k][+t.dataset.i] = parse(t.value);
            update();
        });
        root.addEventListener('click', e => {
            const zb = e.target.closest('[data-zoom]');
            if (zb) { openZoomPlot(zb); return; }
            const b = e.target.closest('[data-act]');
            if (!b) return;
            if (b.dataset.act === 'back') { back(); }
            else if (b.dataset.act === 'reset-ex') {
                val.c = CLOCK.slice(); val.s = STOP.slice();
                root.querySelectorAll('.pe-in').forEach(inp => { const i = +inp.dataset.i; inp.value = inp.dataset.k === 'c' ? CLOCK[i] : nf(STOP[i], 2); });
                update();
            }
        });
        update();
        mount.scrollIntoView({ block: 'start' });
    }

    window.PhysATime = { render };
})();
