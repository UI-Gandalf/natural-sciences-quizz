/**
 * ==============================================================================
 * Γυμνάσιο Νέας Ερυθραίας - Φυσικές Επιστήμες
 * Ψηφιακός Οδηγός Μελέτης & Σημειώσεις Θεωρίας
 * Ενότητα: Ηλεκτρικό Κύκλωμα & Συνδεσμολογίες Αντιστατών (Φυσική Γ΄ Γυμνασίου)
 * ==============================================================================
 */

window.TheoryNotes = (function() {
    'use strict';

    // Interactive Triangle state
    let activeTriangle = 'ohm';

    const TRIANGLE_DATA = {
        ohm: {
            title: 'Τρίγωνο Νόμου του Ohm',
            formula: 'V = I \\cdot R',
            badge: 'Βασικός Νόμος Κυκλώματος',
            top: { symbol: 'V', name: 'Τάση (Volt)', formula: 'V = I \\cdot R', desc: 'Καλύπτοντας το V: Πολλαπλασιάζουμε την ένταση I με την αντίσταση R.' },
            left: { symbol: 'I', name: 'Ένταση (Ampere)', formula: 'I = \\frac{V}{R}', desc: 'Καλύπτοντας το I: Διαιρούμε την τάση V με την αντίσταση R.' },
            right: { symbol: 'R', name: 'Αντίσταση (Ohm)', formula: 'R = \\frac{V}{I}', desc: 'Καλύπτοντας το R: Διαιρούμε την τάση V με την ένταση I.' },
            tip: 'Κάλυψε με το δάχτυλο το μέγεθος που ζητάς: αν είναι στην κορυφή πολλαπλασιάζεις τα κάτω, αν είναι στη βάση διαιρείς το πάνω με το άλλο της βάσης.'
        },
        power: {
            title: 'Τρίγωνο Ηλεκτρικής Ισχύος',
            formula: 'P = I \\cdot V',
            badge: 'Κατανάλωση & Ρυθμός Ενέργειας',
            top: { symbol: 'P', name: 'Ισχύς (Watt)', formula: 'P = I \\cdot V', desc: 'Καλύπτοντας το P: Πολλαπλασιάζουμε την ένταση I με την τάση V.' },
            left: { symbol: 'I', name: 'Ένταση (Ampere)', formula: 'I = \\frac{P}{V}', desc: 'Καλύπτοντας το I: Διαιρούμε την ισχύ P με την τάση V.' },
            right: { symbol: 'V', name: 'Τάση (Volt)', formula: 'V = \\frac{P}{I}', desc: 'Καλύπτοντας το V: Διαιρούμε την ισχύ P με την ένταση I.' },
            tip: 'Συνδυάζεται επίσης με τον νόμο του Ohm: $P = I^2 \\cdot R = \\frac{V^2}{R}$.'
        },
        energy: {
            title: 'Τρίγωνο Ηλεκτρικής Ενέργειας',
            formula: 'E = P \\cdot t',
            badge: 'Ενέργεια & Χρόνος',
            top: { symbol: 'E', name: 'Ενέργεια (Joule)', formula: 'E = P \\cdot t', desc: 'Καλύπτοντας το E: Πολλαπλασιάζουμε την ισχύ P με τον χρόνο t σε δευτερόλεπτα.' },
            left: { symbol: 'P', name: 'Ισχύς (Watt)', formula: 'P = \\frac{E}{t}', desc: 'Καλύπτοντας το P: Διαιρούμε την ενέργεια E με τον χρόνο t.' },
            right: { symbol: 't', name: 'Χρόνος (Seconds)', formula: 't = \\frac{E}{P}', desc: 'Καλύπτοντας το t: Διαιρούμε την ενέργεια E με την ισχύ P.' },
            tip: 'Προσοχή στις μονάδες: Ο χρόνος t πρέπει να μετατρέπεται πάντοτε σε δευτερόλεπτα (s) για να προκύψει η ενέργεια σε Joules (J).'
        },
        charge: {
            title: 'Τρίγωνο Ηλεκτρικού Φορτίου',
            formula: 'Q = I \\cdot t',
            badge: 'Ορισμός Έντασης Ρεύματος',
            top: { symbol: 'Q', name: 'Φορτίο (Coulomb)', formula: 'Q = I \\cdot t', desc: 'Καλύπτοντας το Q: Πολλαπλασιάζουμε την ένταση I με τον χρόνο t.' },
            left: { symbol: 'I', name: 'Ένταση (Ampere)', formula: 'I = \\frac{Q}{t}', desc: 'Καλύπτοντας το I: Διαιρούμε το διερχόμενο φορτίο Q με τον χρόνο t.' },
            right: { symbol: 't', name: 'Χρόνος (Seconds)', formula: 't = \\frac{Q}{I}', desc: 'Καλύπτοντας το t: Διαιρούμε το φορτίο Q με την ένταση I.' },
            tip: 'Εκφράζει ότι 1 Ampere ισοδυναμεί με διέλευση φορτίου 1 Coulomb σε κάθε 1 δευτερόλεπτο (1 A = 1 C / 1 s).'
        }
    };

    function renderPhysicsG(container) {
        if (!container) return;

        container.innerHTML = `
            <div class="theory-guide-wrapper">
                
                <!-- HERO HEADER -->
                <div class="theory-hero-banner glass-card">
                    <h1 class="theory-hero-title">Ηλεκτρικό Κύκλωμα & Συνδεσμολογίες Αντιστατών</h1>
                    <p class="theory-hero-subtitle">
                        Συμπυκνωμένος οδηγός μελέτης, θεμελιώδη μεγέθη, νόμος του Ohm, μνημονικά τρίγωνα, 
                        πρωτόκολλα επιμερισμού μεγεθών σε σειρά & παράλληλα, συγκριτικοί πίνακες και ανάλυση βραχυκυκλώματος.
                    </p>

                </div>

                <!-- STICKY TABLE OF CONTENTS NAV -->
                <nav class="theory-sticky-nav" id="theory-sticky-nav">
                    <div class="theory-nav-inner">
                        <a href="#theory-sec-1" class="theory-nav-pill active" onclick="TheoryNotes.scrollToSection(event, 'theory-sec-1')">1. Μεγέθη & Ohm</a>
                        <a href="#theory-sec-triangles" class="theory-nav-pill" onclick="TheoryNotes.scrollToSection(event, 'theory-sec-triangles')">Μνημονικά Τρίγωνα</a>
                        <a href="#theory-sec-2" class="theory-nav-pill" onclick="TheoryNotes.scrollToSection(event, 'theory-sec-2')">2. Μονάδες SI</a>
                        <a href="#theory-sec-3" class="theory-nav-pill" onclick="TheoryNotes.scrollToSection(event, 'theory-sec-3')">3. Τάση V_AB</a>
                        <a href="#theory-sec-4" class="theory-nav-pill" onclick="TheoryNotes.scrollToSection(event, 'theory-sec-4')">4. Σύνδεση σε Σειρά</a>
                        <a href="#theory-sec-5" class="theory-nav-pill" onclick="TheoryNotes.scrollToSection(event, 'theory-sec-5')">5. Παράλληλη Σύνδεση</a>
                        <a href="#theory-sec-6" class="theory-nav-pill" onclick="TheoryNotes.scrollToSection(event, 'theory-sec-6')">6. Συγκριτικός Πίνακας</a>
                        <a href="#theory-sec-7" class="theory-nav-pill" onclick="TheoryNotes.scrollToSection(event, 'theory-sec-7')">7. Βραχυκύκλωμα</a>
                    </div>
                </nav>

                <!-- SECTION 1: FUNDAMENTAL QUANTITIES & OHM'S LAW -->
                <section class="theory-section glass-card" id="theory-sec-1">
                    <div class="sec-header">
                        <div class="sec-number-badge">01</div>
                        <div>
                            <h2 class="sec-title">Θεμελιώδη Μεγέθη, Ορισμοί & Νόμος του Ohm</h2>
                            <p class="sec-desc">Βασικά φυσικά μεγέθη του ηλεκτρικού κυκλώματος, μονάδες μέτρησης SI, μαθηματικοί ορισμοί και φυσική σημασία.</p>
                        </div>
                    </div>

                    <div class="theory-table-responsive">
                        <table class="theory-table">
                            <thead>
                                <tr>
                                    <th>Φυσικό Μέγεθος</th>
                                    <th>Σύμβολο & Μονάδα SI</th>
                                    <th>Μαθηματικός Τύπος</th>
                                    <th>Φυσική Σημασία & Ερμηνεία</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td><strong>Ένταση Ηλεκτρικού Ρεύματος</strong></td>
                                    <td><span class="unit-chip">I (Ampere, A)</span></td>
                                    <td class="math-cell">$$I = \\frac{Q}{t}$$</td>
                                    <td>Ο ρυθμός διέλευσης ηλεκτρικού φορτίου $Q$ από μια διατομή του αγωγού στη μονάδα του χρόνου $t$.</td>
                                </tr>
                                <tr>
                                    <td><strong>Ηλεκτρική Τάση (Διαφορά Δυναμικού)</strong></td>
                                    <td><span class="unit-chip">V (Volt, V)</span></td>
                                    <td class="math-cell">$$V = \\frac{E}{Q}$$</td>
                                    <td>Το μέτρο της ηλεκτρικής ενέργειας $E$ που μεταφέρεται ανά μονάδα φορτίου $Q$ μεταξύ δύο σημείων.</td>
                                </tr>
                                <tr>
                                    <td><strong>Ηλεκτρική Αντίσταση</strong></td>
                                    <td><span class="unit-chip">R (Ohm, Ω)</span></td>
                                    <td class="math-cell">$$R = \\frac{V}{I}$$</td>
                                    <td>Το μέτρο της δυσκολίας που προβάλλει ένας αγωγός στη διέλευση του ηλεκτρικού ρεύματος.</td>
                                </tr>
                                <tr>
                                    <td><strong>Ηλεκτρική Ισχύς</strong></td>
                                    <td><span class="unit-chip">P (Watt, W)</span></td>
                                    <td class="math-cell">
                                        $$\\begin{aligned}
                                        P &= \\dfrac{E}{t} \\\\[5pt]
                                        P &= V \\cdot I = \\dfrac{V^2}{R} = I^2 \\cdot R
                                        \\end{aligned}$$
                                    </td>
                                    <td>Ο ρυθμός μεταφοράς ή κατανάλωσης ηλεκτρικής ενέργειας $E$ στη μονάδα του χρόνου $t$.</td>
                                </tr>
                                <tr>
                                    <td><strong>Νόμος του Ohm</strong></td>
                                    <td><span class="unit-chip">Ωμικοί Αντιστάτες</span></td>
                                    <td class="math-cell">$$I = \\frac{V}{R} \\iff V = I \\cdot R$$</td>
                                    <td>Η ένταση του ρεύματος $I$ που διαρρέει έναν ωμικό αντιστάτη είναι <strong>ανάλογη</strong> της τάσης $V$ στα άκρα του.</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <!-- SUBSECTION: MNEMONIC TRIANGLES -->
                    <div class="theory-subsection" id="theory-sec-triangles" style="margin-top: 36px;">
                        <div class="subsec-header">
                            <span class="subsec-icon">🔺</span>
                            <div>
                                <h3 class="subsec-title">Μνημονικά Τρίγωνα Υπολογισμών</h3>
                                <p class="subsec-desc">
                                    Κάλυψε με το δάχτυλο το μέγεθος που ζητάς: αν είναι στην <strong>κορυφή</strong>, οι άλλοι δύο όροι πολλαπλασιάζονται. 
                                    Αν είναι στη <strong>βάση</strong>, διαιρείς το πάνω μέγεθος με το άλλο της βάσης.
                                </p>
                            </div>
                        </div>

                        <!-- DIAGRAM IMAGE PREVIEW WITH LIGHTBOX -->
                        <div class="theory-diagram-card" onclick="openDiagramLightbox('assets/images/theory/triangles.png', 'Μνημονικά Τρίγωνα Υπολογισμών (Ohm, Ισχύος, Ενέργειας, Φορτίου)')" title="Κάντε κλικ για μεγέθυνση σε πλήρη ανάλυση">
                            <div class="diagram-img-frame">
                                <img src="assets/images/theory/triangles.png" alt="Μνημονικά Τρίγωνα Υπολογισμών" class="theory-diagram-img" />
                            </div>
                            <div class="diagram-caption">
                                <span>🔍 Κάντε κλικ για προβολή πλήρους οθόνης</span> • <span>Τρίγωνα: Ohm ($V = I \\cdot R$), Ισχύος ($P = I \\cdot V$), Ενέργειας ($E = P \\cdot t$), Φορτίου ($Q = I \\cdot t$)</span>
                            </div>
                        </div>

                        <!-- INTERACTIVE TRIANGLE EXPLORER -->
                        <div class="interactive-triangle-explorer">
                            <div class="explorer-tabs">
                                <button class="explorer-tab-btn active" onclick="TheoryNotes.setTriangle('ohm', this)">Τρίγωνο Ohm</button>
                                <button class="explorer-tab-btn" onclick="TheoryNotes.setTriangle('power', this)">Τρίγωνο Ισχύος</button>
                                <button class="explorer-tab-btn" onclick="TheoryNotes.setTriangle('energy', this)">Τρίγωνο Ενέργειας</button>
                                <button class="explorer-tab-btn" onclick="TheoryNotes.setTriangle('charge', this)">Τρίγωνο Φορτίου</button>
                            </div>
                            <div class="explorer-body" id="triangle-explorer-content">
                                <!-- Populated dynamically -->
                            </div>
                        </div>
                    </div>

                    <!-- SUBSECTION 1.1: V = f(I) GRAPH -->
                    <div class="theory-subsection" style="margin-top: 40px;">
                        <div class="subsec-header">
                            <span class="subsec-icon">📈</span>
                            <div>
                                <h3 class="subsec-title">1.1 Γραφική Παράσταση $V = f(I)$ & Φυσική Σημασία της Αντίστασης</h3>
                                <p class="subsec-desc">Για έναν ωμικό αντιστάτη, η τάση στα άκρα του είναι ανάλογη της έντασης: $V = R \\cdot I$.</p>
                            </div>
                        </div>

                        <div class="theory-grid-2col">
                            <div class="theory-diagram-card" onclick="openDiagramLightbox('assets/images/theory/v_i_curve.png', 'Σχήμα Α: Γραφική παράσταση V = f(I) για τρεις ωμικούς αντιστάτες')" title="Κάντε κλικ για μεγέθυνση">
                                <button type="button" class="diagram-interactive-btn" onclick="event.stopPropagation(); TheoryNotes.openInteractiveVI()" title="Διαδραστικό: δείξτε μια ευθεία για να δείτε τις τιμές V και I">🎛️ Διαδραστικό</button>
                                <div class="diagram-img-frame">
                                    <img src="assets/images/theory/v_i_curve.png" alt="Γραφική παράσταση V = f(I)" class="theory-diagram-img" />
                                </div>
                                <div class="diagram-caption">
                                    <strong>Σχήμα Α:</strong> Χαρακτηριστική ευθεία $V = f(I)$. Η κλίση της ευθείας ισούται με την αντίσταση $R$.
                                </div>
                            </div>

                            <div class="theory-info-stack">
                                <div class="theory-formula-callout">
                                    <div class="callout-title">📐 Μαθηματική Ερμηνεία της Κλίσης</div>
                                    <p>Συγκρίνοντας με τη γενική μορφή $y = \\alpha \\cdot x$, η κλίση της ευθείας είναι ο συντελεστής $R$:</p>
                                    <div class="highlight-math">
                                        $$\\text{κλίση} = \\frac{\\Delta V}{\\Delta I} = \\frac{V}{I} = R$$
                                    </div>
                                    <ul class="theory-bullet-list">
                                        <li><strong>1. Η κλίση ισούται με την αντίσταση:</strong> Για την ευθεία $R_2$ στο σχήμα: $\\Delta I = 1\\text{ A}$ και $\\Delta V = 5\\text{ V}$, άρα $R_2 = \\frac{5\\text{ V}}{1\\text{ A}} = 5\\,\\Omega$.</li>
                                        <li><strong>2. Μεγαλύτερη κλίση $\\iff$ μεγαλύτερη αντίσταση:</strong> $\\text{κλίση}_1 < \\text{κλίση}_2 < \\text{κλίση}_3 \\iff R_1 < R_2 < R_3$.</li>
                                        <li><strong>Ισοδύναμη ερμηνεία:</strong> Για την ίδια ένταση $I$, ο αντιστάτης με τη μεγαλύτερη κλίση χρειάζεται μεγαλύτερη τάση. Για την ίδια τάση $V$, διαρρέεται από μικρότερη ένταση.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <!-- IMPORTANT CALLOUT: RESISTANCE INDEPENDENCE -->
                        <div class="theory-callout-box warning-theme" style="margin-top: 28px;">
                            <div class="callout-box-header">
                                <span class="box-icon">💡</span>
                                <h4>Κρίσιμο Συμπέρασμα: Η αντίσταση $R$ είναι ΑΝΕΞΑΡΤΗΤΗ της έντασης $I$ και της τάσης $V$</h4>
                            </div>
                            <div class="callout-box-content">
                                <p>
                                    Ο τύπος $R = \\frac{V}{I}$ <strong>δεν σημαίνει</strong> ότι το $R$ μεταβάλλεται αν αλλάξει το $V$ ή το $I$. 
                                    Είναι ο ορισμός της αντίστασης ως <strong>σταθερού πηλίκου</strong>: αν διπλασιάσουμε την τάση, διπλασιάζεται αυτόματα και η ένταση:
                                </p>
                                <div class="highlight-math-center">
                                    $$R = \\frac{V}{I} = \\frac{2V}{2I} = \\frac{3V}{3I} = \\text{σταθερό}$$
                                </div>
                                <p>
                                    Η αντίσταση καθορίζεται <strong>αποκλειστικά από την κατασκευή του αγωγού</strong>: το υλικό (ειδική αντίσταση $\\rho$), 
                                    το μήκος $\\ell$, το εμβαδόν διατομής $S$ ($R = \\rho \\frac{\\ell}{S}$) και τη θερμοκρασία $\\theta$.
                                </p>
                            </div>
                        </div>

                        <div class="theory-diagram-card" style="margin-top: 24px;" onclick="openDiagramLightbox('assets/images/theory/r_i_v_curves.png?v=2', 'Σχήμα Β: Γραφικές παραστάσεις R = f(I) και R = f(V)')" title="Κάντε κλικ για μεγέθυνση">
                            <div class="diagram-img-frame">
                                <img src="assets/images/theory/r_i_v_curves.png?v=2" alt="Γραφικές παραστάσεις R=f(I) και R=f(V)" class="theory-diagram-img" />
                            </div>
                            <div class="diagram-caption">
                                <strong>Σχήμα Β:</strong> Οι γραφικές παραστάσεις $R = f(I)$ και $R = f(V)$ είναι <strong>οριζόντιες ευθείες</strong>. Η τιμή της αντίστασης μένει αμετάβλητη όση τάση ή ένταση κι αν εφαρμόσουμε.
                            </div>
                        </div>
                    </div>
                </section>

                <!-- SECTION 2: PHYSICAL INTERPRETATION OF SI UNITS -->
                <section class="theory-section glass-card" id="theory-sec-2">
                    <div class="sec-header">
                        <div class="sec-number-badge">02</div>
                        <div>
                            <h2 class="sec-title">Φυσική Ερμηνεία Μονάδων Μέτρησης ($1\\text{ A}$, $1\\text{ V}$, $1\\,\\Omega$, $1\\text{ W}$)</h2>
                            <p class="sec-desc">Τι σημαίνει στην πράξη κάθε θεμελιώδης μονάδα μέτρησης του διεθνούς συστήματος SI στο ηλεκτρικό κύκλωμα.</p>
                        </div>
                    </div>

                    <div class="theory-cards-grid">
                        <div class="unit-interpret-card">
                            <div class="unit-card-header">
                                <span class="unit-symbol">1 A</span>
                                <div>
                                    <div class="unit-name">1 Ampere</div>
                                    <div class="unit-formula">$$1\\text{ A} = \\frac{1\\text{ C}}{1\\text{ s}}$$</div>
                                </div>
                            </div>
                            <p class="unit-desc">
                                Η ένταση του ρεύματος είναι $1\\text{ A}$ όταν από μια διατομή του αγωγού διέρχεται ηλεκτρικό φορτίο 
                                <strong>$1\\text{ Coulomb}$</strong> σε χρόνο <strong>$1\\text{ δευτερολέπτου}$</strong>.
                            </p>
                        </div>

                        <div class="unit-interpret-card">
                            <div class="unit-card-header">
                                <span class="unit-symbol">1 V</span>
                                <div>
                                    <div class="unit-name">1 Volt</div>
                                    <div class="unit-formula">$$1\\text{ V} = \\frac{1\\text{ J}}{1\\text{ C}}$$</div>
                                </div>
                            </div>
                            <p class="unit-desc">
                                Η ηλεκτρική τάση μεταξύ δύο σημείων είναι $1\\text{ V}$ όταν προσφέρεται ή καταναλώνεται ενέργεια 
                                <strong>$1\\text{ Joule}$</strong> κατά τη μετακίνηση φορτίου <strong>$1\\text{ Coulomb}$</strong> μεταξύ των δύο αυτών σημείων.
                            </p>
                        </div>

                        <div class="unit-interpret-card">
                            <div class="unit-card-header">
                                <span class="unit-symbol">1 Ω</span>
                                <div>
                                    <div class="unit-name">1 Ohm</div>
                                    <div class="unit-formula">$$1\\,\\Omega = \\frac{1\\text{ V}}{1\\text{ A}}$$</div>
                                </div>
                            </div>
                            <p class="unit-desc">
                                Η αντίσταση ενός αγωγού είναι $1\\,\\Omega$ όταν στα άκρα του εφαρμόζεται τάση 
                                <strong>$1\\text{ Volt}$</strong> και διαρρέεται από ρεύμα έντασης <strong>$1\\text{ Ampere}$</strong>.
                            </p>
                        </div>

                        <div class="unit-interpret-card">
                            <div class="unit-card-header">
                                <span class="unit-symbol">1 W</span>
                                <div>
                                    <div class="unit-name">1 Watt</div>
                                    <div class="unit-formula">$$1\\text{ W} = \\frac{1\\text{ J}}{1\\text{ s}} = 1\\text{ V} \\cdot 1\\text{ A}$$</div>
                                </div>
                            </div>
                            <p class="unit-desc">
                                Η ηλεκτρική ισχύς είναι $1\\text{ W}$ όταν μεταφέρεται ή καταναλώνεται ενέργεια 
                                <strong>$1\\text{ Joule}$</strong> σε χρόνο <strong>$1\\text{ δευτερολέπτου}$</strong>.
                            </p>
                        </div>
                    </div>
                </section>

                <!-- SECTION 3: POTENTIAL DIFFERENCE LOGIC -->
                <section class="theory-section glass-card" id="theory-sec-3">
                    <div class="sec-header">
                        <div class="sec-number-badge">03</div>
                        <div>
                            <h2 class="sec-title">Σκεπτικό Υπολογισμού Διαφοράς Δυναμικού ($V_{AB} = V_A - V_B$)</h2>
                            <p class="sec-desc">Πώς μεταβάλλεται το ηλεκτρικό δυναμικό κατά μήκος του κυκλώματος σε κλειστό και ανοικτό κύκλωμα.</p>
                        </div>
                    </div>

                    <div class="theory-callout-box info-theme">
                        <div class="callout-box-header">
                            <span class="box-icon">⚡</span>
                            <h4>Γενική Αρχή</h4>
                        </div>
                        <div class="callout-box-content">
                            <p>
                                Η διαφορά δυναμικού $V_{AB}$ μεταξύ δύο σημείων $A$ και $B$ εκφράζει την τάση μεταξύ τους και ισούται με την αλγεβρική μεταβολή του δυναμικού κατά τη μετάβαση από το $A$ στο $B$:
                            </p>
                            <div class="highlight-math-center">$$V_{AB} = V_A - V_B$$</div>
                        </div>
                    </div>

                    <div class="theory-grid-2col" style="margin-top: 24px;">
                        <div class="theory-subcard">
                            <h4 class="subcard-title">3.1 Στο Κλειστό Κύκλωμα (Διαρρέεται από $I > 0$)</h4>
                            <ul class="theory-bullet-list">
                                <li>
                                    <strong>Μετάβαση μέσα από αντιστάτη $R$ κατά τη φορά του ρεύματος:</strong> Το ρεύμα ρέει πάντοτε από το υψηλότερο προς το χαμηλότερο δυναμικό. Επομένως, έχουμε <em>πτώση δυναμικού</em> κατά $V = I \\cdot R$:
                                    <div class="math-inline-block">$$V_B = V_A - I \\cdot R \\implies V_{AB} = V_A - V_B = I \\cdot R$$</div>
                                </li>
                                <li>
                                    <strong>Μετάβαση μέσα από πηγή:</strong> Κινούμενοι από τον αρνητικό $(-)$ στον θετικό $(+)$ πόλο της πηγής, έχουμε <em>άνοδο δυναμικού</em> κατά την τάση της πηγής:
                                    <div class="math-inline-block">$$V_+ - V_- = V_{\\text{πηγ}}$$</div>
                                </li>
                            </ul>
                        </div>

                        <div class="theory-subcard">
                            <h4 class="subcard-title">3.2 Στο Ανοικτό Κύκλωμα ($I = 0\\text{ A}$)</h4>
                            <ul class="theory-bullet-list">
                                <li>
                                    <strong>Μηδενική πτώση τάσης στους αντιστάτες:</strong> Εφόσον ο διακόπτης είναι ανοικτός, $I = 0\\text{ A}$, οπότε:
                                    <div class="math-inline-block">$$V_R = I \\cdot R = 0\\text{ V}$$</div>
                                    Όλα τα σημεία που επικοινωνούν με τον θετικό πόλο έχουν $V_A = V_+$, και όλα όσα επικοινωνούν με τον αρνητικό έχουν $V_B = V_-$.
                                </li>
                                <li>
                                    <strong>Τάση στα άκρα του ανοικτού διακόπτη:</strong> Εμφανίζεται ολόκληρη η τάση της πηγής:
                                    <div class="math-inline-block">$$V_{\\text{διακ}} = V_A - V_B = V_+ - V_- = V_{\\text{πηγ}}$$</div>
                                </li>
                                <li>
                                    <strong>Γενίκευση:</strong> Η τάση $V_{AB}$ μεταξύ οποιουδήποτε σημείου $A$ (που συνδέεται με τον θετικό πόλο) και $B$ (που συνδέεται με τον αρνητικό πόλο) ισούται πάντοτε με $V_{\\text{πηγ}}$.
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>

                <!-- SECTION 4: PROTOCOL FOR SERIES CONNECTION -->
                <section class="theory-section glass-card" id="theory-sec-4">
                    <div class="sec-header">
                        <div class="sec-number-badge">04</div>
                        <div>
                            <h2 class="sec-title">Πρωτόκολλο Επίλυσης & Επιμερισμός Μεγεθών: Σύνδεση σε Σειρά</h2>
                            <p class="sec-desc">Αναλυτικά βήματα και νόμοι υπολογισμού για δύο αντιστάτες $R_1, R_2$ συνδεδεμένους σε σειρά (Series Connection).</p>
                        </div>
                    </div>

                    <!-- DIAGRAM -->
                    <div class="theory-diagram-card" onclick="openDiagramLightbox('assets/images/theory/series_circuit.png', 'Σχήμα 1: Δύο αντιστάτες R1 και R2 σε σειρά με πηγή, διακόπτη και όργανα')" title="Κάντε κλικ για μεγέθυνση">
                        <div class="diagram-img-frame">
                            <img src="assets/images/theory/series_circuit.png" alt="Σύνδεση σε Σειρά Σχήμα 1" class="theory-diagram-img" />
                        </div>
                        <div class="diagram-caption">
                            <strong>Σχήμα 1:</strong> Δύο αντιστάτες $R_1$ και $R_2$ σε σειρά με πηγή $V_{\\text{πηγ}}$, διακόπτη $K$, αμπερόμετρο $A$ και βολτόμετρα $V_1, V_2$. Στο καλώδιο $C-D$ τα σημεία $C$ και $D$ έχουν το ίδιο δυναμικό.
                        </div>
                    </div>

                    <!-- CRITICAL CALLOUT: NO CURRENT DROP -->
                    <div class="theory-callout-box warning-theme" style="margin-top: 24px;">
                        <div class="callout-box-header">
                            <span class="box-icon">⚡</span>
                            <h4>1. Κοινό Ρεύμα: Η ένταση είναι ΙΔΙΑ ΠΑΝΤΟΥ — Δεν υπάρχει «πτώση έντασης»!</h4>
                        </div>
                        <div class="callout-box-content">
                            <div class="highlight-math-center">$$I_{\\text{ολ}} = I_1 = I_2 = I$$</div>
                            <p>
                                Σε κύκλωμα σειράς το ρεύμα έχει την ίδια ακριβώς τιμή <strong>σε οποιοδήποτε σημείο του κυκλώματος</strong>: 
                                πριν και μετά από κάθε αντιστάτη, στην πηγή, στον διακόπτη, στο αμπερόμετρο, στα καλώδια σύνδεσης:
                            </p>
                            <div class="highlight-math-center">
                                $$I_{\\text{πριν τον } R_1} = I_{R_1} = I_{\\text{μεταξύ } R_1, R_2} = I_{R_2} = I_{\\text{μετά τον } R_2} = I_A$$
                            </div>
                            <ul class="theory-bullet-list">
                                <li><strong>Η έννοια «πτώση έντασης» δεν υφίσταται.</strong> Ο αντιστάτης δεν «καταναλώνει ρεύμα»· καταναλώνει ηλεκτρική ενέργεια (τη μετατρέπει σε θερμότητα).</li>
                                <li><strong>Αυτό που «πέφτει»</strong> καθώς το ρεύμα περνά από έναν αντιστάτη είναι το δυναμικό (η τάση): $V_{AB} = V_A - V_B = I \\cdot R_1$.</li>
                                <li><strong>Αιτία: Διατήρηση του ηλεκτρικού φορτίου.</strong> Σε κάθε χρονικό διάστημα, όσο φορτίο εισέρχεται στον αντιστάτη, ακριβώς τόσο εξέρχεται. Το αμπερόμετρο δείχνει την ίδια τιμή όπου κι αν τοποθετηθεί μέσα στον βρόχο.</li>
                            </ul>
                        </div>
                    </div>

                    <!-- PROTOCOL STEPS -->
                    <div class="theory-stepper-grid" style="margin-top: 28px;">
                        <div class="theory-step-card">
                            <div class="step-num">2</div>
                            <div class="step-content">
                                <h5>Ισοδύναμη Αντίσταση ($R_{\\text{ολ}}$)</h5>
                                <p><strong>Αυξάνεται</strong> και ισούται με το άθροισμα των επιμέρους αντιστάσεων:</p>
                                <div class="step-math">$$R_{\\text{ολ}} = R_1 + R_2$$</div>
                            </div>
                        </div>

                        <div class="theory-step-card">
                            <div class="step-num">3</div>
                            <div class="step-content">
                                <h5>Ολική Ένταση Ρεύματος ($I$)</h5>
                                <p>Υπολογίζεται από τον νόμο του Ohm για το ολικό κύκλωμα:</p>
                                <div class="step-math">$$I = \\frac{V_{\\text{πηγ}}}{R_{\\text{ολ}}}$$</div>
                            </div>
                        </div>

                        <div class="theory-step-card">
                            <div class="step-num">4</div>
                            <div class="step-content">
                                <h5>Επιμέρους Τάσεις ($V_1, V_2$)</h5>
                                <p>Υπολογίζονται από τον νόμο του Ohm για κάθε αντιστάτη ξεχωριστά:</p>
                                <div class="step-math">$$V_1 = I \\cdot R_1 \\quad \\text{και} \\quad V_2 = I \\cdot R_2$$</div>
                            </div>
                        </div>

                        <div class="theory-step-card">
                            <div class="step-num">5</div>
                            <div class="step-content">
                                <h5>Επιμερισμός Τάσης (Διαιρέτης Τάσης)</h5>
                                <p>Η τάση επιμερίζεται <strong>ανάλογα</strong> με την αντίσταση κάθε αντιστάτη ($V_{\\text{πηγ}} = V_1 + V_2$):</p>
                                <div class="step-math">$$\\frac{V_1}{V_2} = \\frac{R_1}{R_2}$$</div>
                            </div>
                        </div>

                        <div class="theory-step-card">
                            <div class="step-num">6</div>
                            <div class="step-content">
                                <h5>Επιμερισμός Ισχύος & Ενέργειας</h5>
                                <p>Ο επιμερισμός ισχύος και ενέργειας ($E = P \\cdot t$) είναι <strong>ανάλογος</strong> των αντιστάσεων:</p>
                                <div class="step-math">$$\\frac{P_1}{P_2} = \\frac{R_1}{R_2} \\quad \\text{και} \\quad \\frac{E_1}{E_2} = \\frac{R_1}{R_2}$$</div>
                            </div>
                        </div>

                        <div class="theory-step-card">
                            <div class="step-num">7-8</div>
                            <div class="step-content">
                                <h5>Διακόπτης & Αποσύνδεση / Βλάβη</h5>
                                <p>Αν ανοίξει ο διακόπτης ή αποσυνδεθεί/καεί ένας αντιστάτης, <strong>διακόπτεται πλήρως η λειτουργία σε όλο το κύκλωμα</strong>:</p>
                                <div class="step-math">$$I = 0\\text{ A}, \\quad V_1 = 0\\text{ V}, \\quad V_2 = 0\\text{ V}, \\quad V_{\\text{διακ}} = V_{\\text{πηγ}}$$</div>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- SECTION 5: PROTOCOL FOR PARALLEL CONNECTION -->
                <section class="theory-section glass-card" id="theory-sec-5">
                    <div class="sec-header">
                        <div class="sec-number-badge">05</div>
                        <div>
                            <h2 class="sec-title">Πρωτόκολλο Επίλυσης & Επιμερισμός Μεγεθών: Παράλληλη Σύνδεση</h2>
                            <p class="sec-desc">Αναλυτικά βήματα και νόμοι υπολογισμού για δύο αντιστάτες $R_1, R_2$ συνδεδεμένους παράλληλα (Parallel Connection).</p>
                        </div>
                    </div>

                    <!-- DIAGRAM -->
                    <div class="theory-diagram-card" onclick="openDiagramLightbox('assets/images/theory/parallel_circuit.png', 'Σχήμα 2: Δύο αντιστάτες R1 και R2 παράλληλα με πηγή, διακόπτη, κόμβους A, B και ρεύματα I1, I2')" title="Κάντε κλικ για μεγέθυνση">
                        <div class="diagram-img-frame">
                            <img src="assets/images/theory/parallel_circuit.png" alt="Παράλληλη Σύνδεση Σχήμα 2" class="theory-diagram-img" />
                        </div>
                        <div class="diagram-caption">
                            <strong>Σχήμα 2:</strong> Δύο αντιστάτες $R_1$ και $R_2$ παράλληλα με πηγή $V_{\\text{πηγ}}$, διακόπτη $K$, κύριο αμπερόμετρο $A$, κόμβους $A, B$ και επιμέρους ρεύματα κλάδων $I_1, I_2$.
                        </div>
                    </div>

                    <!-- PROTOCOL STEPS -->
                    <div class="theory-stepper-grid" style="margin-top: 28px;">
                        <div class="theory-step-card">
                            <div class="step-num">1</div>
                            <div class="step-content">
                                <h5>1. Κοινή Τάση σε όλους τους κλάδους</h5>
                                <p>Τα άκρα όλων των παράλληλων κλάδων συνδέονται στους ίδιους κόμβους ($A$ και $B$). Όλοι οι αντιστάτες «βλέπουν» την ίδια τάση:</p>
                                <div class="step-math">$$V_1 = V_2 = V_{\\text{πηγ}}$$</div>
                            </div>
                        </div>

                        <div class="theory-step-card">
                            <div class="step-num">2</div>
                            <div class="step-content">
                                <h5>2. Ισοδύναμη Αντίσταση ($R_{\\text{ολ}}$)</h5>
                                <p><strong>Μειώνεται</strong> (είναι πάντοτε μικρότερη από τη μικρότερη επιμέρους αντίσταση):</p>
                                <div class="step-math">$$\\frac{1}{R_{\\text{ολ}}} = \\frac{1}{R_1} + \\frac{1}{R_2} \\implies R_{\\text{ολ}} = \\frac{R_1 \\cdot R_2}{R_1 + R_2}$$</div>
                            </div>
                        </div>

                        <div class="theory-step-card">
                            <div class="step-num">3</div>
                            <div class="step-content">
                                <h5>3. Επιμερισμός Ρεύματος (Διαιρέτης Ρεύματος)</h5>
                                <p>Το ολικό ρεύμα διακλαδίζεται ($I_{\\text{ολ}} = I_1 + I_2$) <strong>αντιστρόφως ανάλογα</strong> των αντιστάσεων:</p>
                                <div class="step-math">$$I_1 = \\frac{V_{\\text{πηγ}}}{R_1}, \\quad I_2 = \\frac{V_{\\text{πηγ}}}{R_2} \\implies \\frac{I_1}{I_2} = \\frac{R_2}{R_1}$$</div>
                            </div>
                        </div>

                        <div class="theory-step-card">
                            <div class="step-num">4</div>
                            <div class="step-content">
                                <h5>4. Επιμερισμός Ισχύος & Ενέργειας</h5>
                                <p>Ο επιμερισμός είναι <strong>αντιστρόφως ανάλογος</strong>: Ο μικρότερος αντιστάτης καταναλώνει τη μεγαλύτερη ισχύ!</p>
                                <div class="step-math">$$\\frac{P_1}{P_2} = \\frac{R_2}{R_1} \\quad \\text{και} \\quad \\frac{E_1}{E_2} = \\frac{R_2}{R_1}$$</div>
                            </div>
                        </div>

                        <div class="theory-step-card">
                            <div class="step-num">5</div>
                            <div class="step-content">
                                <h5>5. Ανοικτός Διακόπτης σε έναν Κλάδο</h5>
                                <p>Αν ανοίξει διακόπτης στον κλάδο $R_1$, διακόπτεται το ρεύμα <strong>μόνο σε αυτόν</strong> ($I_1 = 0$). Ο $R_2$ συνεχίζει κανονικά:</p>
                                <div class="step-math">$$I_1 = 0\\text{ A}, \\quad I_2 = \\frac{V_{\\text{πηγ}}}{R_2}$$</div>
                            </div>
                        </div>

                        <div class="theory-step-card">
                            <div class="step-num">6</div>
                            <div class="step-content">
                                <h5>6. Αποσύνδεση / Βλάβη — Ανεξαρτησία Κλάδων</h5>
                                <p>Κάθε παράλληλος κλάδος λειτουργεί <strong>αυτόνομα και ανεξάρτητα</strong>, ακριβώς όπως οι οικιακές ηλεκτρικές συσκευές.</p>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- SECTION 6: COMPARATIVE MATRIX -->
                <section class="theory-section glass-card" id="theory-sec-6">
                    <div class="sec-header">
                        <div class="sec-number-badge">06</div>
                        <div>
                            <h2 class="sec-title">Συγκριτικός Πίνακας Επιμερισμού Μεγεθών (Σειρά vs Παράλληλα)</h2>
                            <p class="sec-desc">Συνοπτική αντιπαραβολή της συμπεριφοράς των βασικών φυσικών μεγεθών στις δύο συνδεσμολογίες.</p>
                        </div>
                    </div>

                    <div class="theory-table-responsive">
                        <table class="theory-table comparative-table">
                            <thead>
                                <tr>
                                    <th style="width: 25%;">Χαρακτηριστικό / Μέγεθος</th>
                                    <th style="width: 37.5%;" class="series-col-header">Σύνδεση σε Σειρά</th>
                                    <th style="width: 37.5%;" class="parallel-col-header">Παράλληλη Σύνδεση</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td><strong>Ένταση Ρεύματος ($I$)</strong></td>
                                    <td>
                                        <div class="table-formula">$$I_{\\text{ολ}} = I_1 = I_2$$</div>
                                        <span class="table-note">Ίδια παντού (καμία «πτώση έντασης»)</span>
                                    </td>
                                    <td>
                                        <div class="table-formula">$$I_{\\text{ολ}} = I_1 + I_2, \\quad \\frac{I_1}{I_2} = \\frac{R_2}{R_1}$$</div>
                                        <span class="table-note">Αντιστρόφως ανάλογα με την αντίσταση</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td><strong>Πτώση Τάσης ($V$)</strong></td>
                                    <td>
                                        <div class="table-formula">$$V_{\\text{πηγ}} = V_1 + V_2, \\quad \\frac{V_1}{V_2} = \\frac{R_1}{R_2}$$</div>
                                        <span class="table-note">Ανάλογα με την αντίσταση</span>
                                    </td>
                                    <td>
                                        <div class="table-formula">$$V_1 = V_2 = V_{\\text{πηγ}}$$</div>
                                        <span class="table-note">Κοινή τάση σε όλους τους κλάδους</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td><strong>Ισοδύναμη Αντίσταση ($R_{\\text{ολ}}$)</strong></td>
                                    <td>
                                        <div class="table-formula">$$R_{\\text{ολ}} = R_1 + R_2$$</div>
                                        <span class="table-note badge-incr">Αυξάνεται ($R_{\\text{ολ}} > R_{\\text{max}}$)</span>
                                    </td>
                                    <td>
                                        <div class="table-formula">$$R_{\\text{ολ}} = \\frac{R_1 \\cdot R_2}{R_1 + R_2}$$</div>
                                        <span class="table-note badge-decr">Μειώνεται ($R_{\\text{ολ}} < R_{\\text{min}}$)</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td><strong>Ηλεκτρική Ισχύς ($P$)</strong></td>
                                    <td>
                                        <div class="table-formula">$$\\frac{P_1}{P_2} = \\frac{R_1}{R_2}$$</div>
                                        <span class="table-note">Ανάλογα: Ο μεγαλύτερος καταναλώνει περισσότερο</span>
                                    </td>
                                    <td>
                                        <div class="table-formula">$$\\frac{P_1}{P_2} = \\frac{R_2}{R_1}$$</div>
                                        <span class="table-note">Αντιστρόφως: Ο μικρότερος καταναλώνει περισσότερο</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td><strong>Ηλεκτρική Ενέργεια ($E$)</strong></td>
                                    <td>
                                        <div class="table-formula">$$\\frac{E_1}{E_2} = \\frac{R_1}{R_2}$$</div>
                                        <span class="table-note">Ανάλογα (όπως η ισχύς)</span>
                                    </td>
                                    <td>
                                        <div class="table-formula">$$\\frac{E_1}{E_2} = \\frac{R_2}{R_1}$$</div>
                                        <span class="table-note">Αντιστρόφως ανάλογα (όπως η ισχύς)</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td><strong>Επίδραση Βλάβης / Αποσύνδεσης</strong></td>
                                    <td>
                                        <span class="table-alert-text danger">❌ Διακόπτεται η λειτουργία σε όλο το κύκλωμα ($I = 0\\text{ A}$).</span>
                                    </td>
                                    <td>
                                        <span class="table-alert-text success">✅ Οι υπόλοιποι κλάδοι συνεχίζουν ανεπηρέαστα.</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                <!-- SECTION 7: SHORT CIRCUIT & INSTRUMENTS -->
                <section class="theory-section glass-card" id="theory-sec-7">
                    <div class="sec-header">
                        <div class="sec-number-badge">07</div>
                        <div>
                            <h2 class="sec-title">Βραχυκύκλωμα & Όργανα Ηλεκτρικών Μετρήσεων</h2>
                            <p class="sec-desc">Πλήρης ανάλυση μερικού και ολικού βραχυκυκλώματος, αριθμητικό παράδειγμα και κανόνες ορθής σύνδεσης οργάνων.</p>
                        </div>
                    </div>

                    <div class="theory-callout-box info-theme">
                        <div class="callout-box-header">
                            <span class="box-icon">⚠️</span>
                            <h4>Τι ορίζεται ως Βραχυκύκλωμα (Short Circuit);</h4>
                        </div>
                        <div class="callout-box-content">
                            <p>
                                <strong>Βραχυκύκλωμα</strong> ονομάζεται η σύνδεση δύο σημείων ενός κυκλώματος με αγωγό αμελητέας (ιδανικά μηδενικής) αντίστασης ($R_{\\text{καλ}} = 0\\,\\Omega$). 
                                Το ηλεκτρικό ρεύμα επιλέγει πάντοτε τον <strong>δρόμο της ελάχιστης αντίστασης</strong>, παρακάμπτοντας τα στοιχεία που έχουν αντίσταση.
                            </p>
                        </div>
                    </div>

                    <div class="theory-subsection" style="margin-top: 32px;">
                        <h3 class="subsec-title">Α. Μερικό Βραχυκύκλωμα στη Σειρά (Σχήμα 1)</h3>
                        <p>
                            Όταν το καλώδιο συνδέει τα άκρα ενός μόνο αντιστάτη, ο αντιστάτης αυτός <strong>απενεργοποιείται</strong>: 
                            δεν διαρρέεται από ρεύμα και η τάση στα άκρα του μηδενίζεται. Το ρεύμα περνά από το καλώδιο. 
                            Ο άλλος αντιστάτης μένει μόνος του στο κύκλωμα, άρα η ολική αντίσταση <strong>μειώνεται</strong> και η ένταση <strong>αυξάνεται</strong>!
                        </p>

                        <div class="theory-grid-2col" style="margin-top: 18px;">
                            <div class="theory-subcard">
                                <h5>Περίπτωση 1: Βραχυκύκλωμα του $R_1$ (Καλώδιο $A-B$)</h5>
                                <div class="math-block">
                                    $$V_1 = 0\\text{ V}, \\quad I_{R_1} = 0\\text{ A}$$
                                    $$R'_{\\text{ολ}} = R_2, \\quad I' = \\frac{V_{\\text{πηγ}}}{R_2} > I, \\quad V_2 = V_{\\text{πηγ}}$$
                                </div>
                            </div>
                            <div class="theory-subcard">
                                <h5>Περίπτωση 2: Βραχυκύκλωμα του $R_2$ (Καλώδιο $B-C$ ή $B-D$)</h5>
                                <div class="math-block">
                                    $$V_2 = 0\\text{ V}, \\quad I_{R_2} = 0\\text{ A}$$
                                    $$R'_{\\text{ολ}} = R_1, \\quad I' = \\frac{V_{\\text{πηγ}}}{R_1} > I, \\quad V_1 = V_{\\text{πηγ}}$$
                                </div>
                            </div>
                        </div>

                        <!-- NUMERICAL EXAMPLE TABLE -->
                        <div class="example-box" style="margin-top: 24px;">
                            <h4 class="example-title">🔢 Αναλυτικό Αριθμητικό Παράδειγμα ($V_{\\text{πηγ}} = 24\\text{ V}$, $R_1 = 4\\,\\Omega$, $R_2 = 8\\,\\Omega$)</h4>
                            <p>Η αρχική ένταση κανονικής λειτουργίας είναι: $I = \\frac{24\\text{ V}}{4\\,\\Omega + 8\\,\\Omega} = 2\\text{ A}$.</p>

                            <div class="theory-table-responsive" style="margin-top: 14px;">
                                <table class="theory-table mini-table">
                                    <thead>
                                        <tr>
                                            <th>Κατάσταση Κυκλώματος</th>
                                            <th>$R_{\\text{ολ}}\\,(\\Omega)$</th>
                                            <th>$I\\text{ (A)}$</th>
                                            <th>$V_1\\text{ (V)}$</th>
                                            <th>$V_2\\text{ (V)}$</th>
                                            <th>Παρατήρηση / Συμπέρασμα</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td><strong>Κανονική λειτουργία</strong></td>
                                            <td>$12\\,\\Omega$</td>
                                            <td>$2\\text{ A}$</td>
                                            <td>$8\\text{ V}$</td>
                                            <td>$16\\text{ V}$</td>
                                            <td>$V_1 + V_2 = 24\\text{ V}$</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Βραχυκύκλωμα του $R_1$</strong></td>
                                            <td>$8\\,\\Omega$</td>
                                            <td><span class="badge-accent">3 A</span></td>
                                            <td>$0\\text{ V}$</td>
                                            <td>$24\\text{ V}$</td>
                                            <td>Το ρεύμα αυξήθηκε κατά $50\\%$</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Βραχυκύκλωμα του $R_2$</strong></td>
                                            <td>$4\\,\\Omega$</td>
                                            <td><span class="badge-accent">6 A</span></td>
                                            <td>$24\\text{ V}$</td>
                                            <td>$0\\text{ V}$</td>
                                            <td>Το ρεύμα τριπλασιάστηκε!</td>
                                        </tr>
                                        <tr class="danger-row">
                                            <td><strong>Βραχυκύκλωμα και των δύο</strong></td>
                                            <td>$0\\,\\Omega$</td>
                                            <td>$$\\to \\infty$$</td>
                                            <td>$0\\text{ V}$</td>
                                            <td>$0\\text{ V}$</td>
                                            <td>Ολικό βραχυκύκλωμα πηγής!</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <p class="example-conclusion">
                                📌 <strong>Κανόνας:</strong> Όσο <em>μεγαλύτερος</em> είναι ο αντιστάτης που βραχυκυκλώνουμε, τόσο <em>μεγαλύτερη</em> είναι η αύξηση της έντασης του ρεύματος 
                                (εδώ με τον $R_2 = 8\\,\\Omega$ το ρεύμα έγινε $6\\text{ A}$, ενώ με τον $R_1 = 4\\,\\Omega$ έγινε $3\\text{ A}$).
                            </p>
                        </div>
                    </div>

                    <!-- TOTAL SHORT CIRCUIT & WHEN NOT SHORT CIRCUIT -->
                    <div class="theory-grid-2col" style="margin-top: 32px;">
                        <div class="theory-subcard danger-border">
                            <h5>Β. Ολικό Βραχυκύκλωμα Πηγής / Παράλληλης Σύνδεσης</h5>
                            <p>
                                Αν συνδεθεί καλώδιο παράλληλα στους πόλους της πηγής ή σε έναν παράλληλο κλάδο, η συνολική αντίσταση μηδενίζεται:
                            </p>
                            <div class="math-inline-block">$$R_{\\text{ολ}} \\to 0\\,\\Omega \\implies I_{\\text{πηγ}} = \\frac{V_{\\text{πηγ}}}{0} \\to \\infty$$</div>
                            <p style="font-size: 0.88rem; color: var(--text-secondary); margin-top: 8px;">
                                Στην πράξη η ένταση περιορίζεται μόνο από την εσωτερική αντίσταση $r$ της πηγής ($I = V_{\\text{πηγ}}/r$), παραμένει όμως τεράστια: 
                                τα καλώδια υπερθερμαίνονται, η πηγή καταστρέφεται και υπάρχει σοβαρός κίνδυνος πυρκαγιάς.
                            </p>
                        </div>

                        <div class="theory-subcard success-border">
                            <h5>Γ. Πότε ΔΕΝ έχουμε Βραχυκύκλωμα;</h5>
                            <p>Δεν υπάρχει βραχυκύκλωμα στις παρακάτω περιπτώσεις:</p>
                            <ul class="theory-bullet-list">
                                <li>
                                    <strong>Σύνδεση ισοδυναμικών σημείων:</strong> Όταν το καλώδιο συνδέει σημεία που βρίσκονται ήδη στο ίδιο ηλεκτρικό δυναμικό ($V_A = V_B \\implies \\Delta V = 0\\text{ V}$), όπως το καλώδιο $C-D$ στο Σχήμα 1.
                                </li>
                                <li>
                                    <strong>Καλώδιο με αντίσταση:</strong> Όταν ο κλάδος που προστίθεται περιέχει αντίσταση, αποτελεί απλή παράλληλη σύνδεση και όχι βραχυκύκλωμα.
                                </li>
                            </ul>
                        </div>
                    </div>

                    <!-- INSTRUMENTS (AMMETER & VOLTMETER) -->
                    <div class="theory-subsection" style="margin-top: 36px;">
                        <div class="subsec-header">
                            <span class="subsec-icon">🧭</span>
                            <div>
                                <h3 class="subsec-title">6.2 Όργανα Ηλεκτρικών Μετρήσεων (Αμπερόμετρο & Βολτόμετρο)</h3>
                                <p class="subsec-desc">Κανόνες ορθής σύνδεσης και φυσική ερμηνεία των εσωτερικών αντιστάσεων των οργάνων.</p>
                            </div>
                        </div>

                        <div class="theory-grid-2col">
                            <div class="instrument-card ammeter-card">
                                <div class="inst-header">
                                    <span class="inst-badge">Α</span>
                                    <div>
                                        <h4>Αμπερόμετρο (Μέτρηση Έντασης I)</h4>
                                        <span class="inst-rule">Συνδέεται πάντοτε ΣΕ ΣΕΙΡΑ</span>
                                    </div>
                                </div>
                                <ul class="inst-points">
                                    <li><strong>Ιδανικό Αμπερόμετρο:</strong> Έχει <em>μηδενική εσωτερική αντίσταση</em> ($R_A = 0\\,\\Omega$) για να μην προκαλεί πτώση τάσης στο κύκλωμα.</li>
                                    <li class="inst-warning"><strong>⚠️ Λανθασμένη Σύνδεση (Παράλληλα):</strong> Επειδή έχει μηδενική αντίσταση, αν συνδεθεί παράλληλα σε ένα στοιχείο θα προκαλέσει <strong>βραχυκύκλωμα</strong> σε αυτό, απενεργοποιώντας το!</li>
                                </ul>
                            </div>

                            <div class="instrument-card voltmeter-card">
                                <div class="inst-header">
                                    <span class="inst-badge">V</span>
                                    <div>
                                        <h4>Βολτόμετρο (Μέτρηση Τάσης V)</h4>
                                        <span class="inst-rule">Συνδέεται πάντοτε ΠΑΡΑΛΛΗΛΑ</span>
                                    </div>
                                </div>
                                <ul class="inst-points">
                                    <li><strong>Ιδανικό Βολτόμετρο:</strong> Έχει <em>άπειρη εσωτερική αντίσταση</em> ($R_V \\to \\infty$) για να μην απορροφά ρεύμα από το κύκλωμα ($I \\approx 0\\text{ A}$).</li>
                                    <li class="inst-warning"><strong>⚠️ Λανθασμένη Σύνδεση (Σε Σειρά):</strong> Επειδή έχει άπειρη αντίσταση, αν συνδεθεί σε σειρά θα <strong>διακόψει πρακτικά τη ροή του ρεύματος</strong> σε ολόκληρο τον βρόχο!</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

            </div>
        `;

        // Render initial active triangle
        TheoryNotes.renderActiveTriangle();

        // Typeset LaTeX math formulas with MathJax (with retry for async loading)
        ensureMathTypeset(container);

        // Setup scroll spy for sticky nav
        TheoryNotes.setupScrollSpy();
    }

    function setTriangle(type, btn) {
        activeTriangle = type;
        if (btn) {
            const tabs = document.querySelectorAll('.explorer-tab-btn');
            tabs.forEach(t => t.classList.remove('active'));
            btn.classList.add('active');
        }
        renderActiveTriangle();
    }

    function renderActiveTriangle() {
        const mount = document.getElementById('triangle-explorer-content');
        if (!mount) return;
        const d = TRIANGLE_DATA[activeTriangle] || TRIANGLE_DATA.ohm;

        mount.innerHTML = `
            <div class="triangle-active-card">
                <div class="tri-card-header">
                    <div>
                        <h4>${d.title}</h4>
                        <span class="tri-badge">${d.badge}</span>
                    </div>
                    <div class="tri-main-formula">$$${d.formula}$$</div>
                </div>

                <div class="tri-parts-grid">
                    <div class="tri-part-box top-part">
                        <div class="part-sym">${d.top.symbol}</div>
                        <div class="part-info">
                            <strong>${d.top.name}</strong>
                            <div class="part-formula">$$${d.top.formula}$$</div>
                            <p>${d.top.desc}</p>
                        </div>
                    </div>

                    <div class="tri-part-box bottom-part">
                        <div class="part-sym">${d.left.symbol}</div>
                        <div class="part-info">
                            <strong>${d.left.name}</strong>
                            <div class="part-formula">$$${d.left.formula}$$</div>
                            <p>${d.left.desc}</p>
                        </div>
                    </div>

                    <div class="tri-part-box bottom-part">
                        <div class="part-sym">${d.right.symbol}</div>
                        <div class="part-info">
                            <strong>${d.right.name}</strong>
                            <div class="part-formula">$$${d.right.formula}$$</div>
                            <p>${d.right.desc}</p>
                        </div>
                    </div>
                </div>

                <div class="tri-tip-box">
                    <span>💡</span>
                    <span>${d.tip}</span>
                </div>
            </div>
        `;

        ensureMathTypeset(mount);
    }

    function scrollToSection(e, secId) {
        if (e) e.preventDefault();
        const target = document.getElementById(secId);
        if (target) {
            const offset = 80;
            const bodyRect = document.body.getBoundingClientRect().top;
            const elementRect = target.getBoundingClientRect().top;
            const elementPosition = elementRect - bodyRect;
            const offsetPosition = elementPosition - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });

            // Update active pill
            const pills = document.querySelectorAll('.theory-nav-pill');
            pills.forEach(p => p.classList.remove('active'));
            if (e && e.currentTarget) e.currentTarget.classList.add('active');
        }
    }

    function setupScrollSpy() {
        const sections = [
            'theory-sec-1', 'theory-sec-triangles', 'theory-sec-2',
            'theory-sec-3', 'theory-sec-4', 'theory-sec-5',
            'theory-sec-6', 'theory-sec-7'
        ];

        function highlightCurrentSection() {
            const scrollPos = window.scrollY + 120;
            // Default is the first section (top of the page); otherwise the nearest section above the viewport
            let current = sections[0];
            let bestOffset = -Infinity;
            sections.forEach(id => {
                const sec = document.getElementById(id);
                if (sec && sec.offsetTop <= scrollPos && sec.offsetTop > bestOffset) {
                    bestOffset = sec.offsetTop;
                    current = id;
                }
            });
            document.querySelectorAll('.theory-nav-pill').forEach(p => {
                p.classList.toggle('active', p.getAttribute('href') === `#${current}`);
            });
        }

        window.addEventListener('scroll', highlightCurrentSection, { passive: true });
        highlightCurrentSection();
    }

    function ensureMathTypeset(targetElem) {
        if (!targetElem) return;
        if (window.renderMath) {
            window.renderMath(targetElem);
        } else if (window.MathJax && window.MathJax.typesetPromise) {
            window.MathJax.typesetPromise([targetElem]).catch(err => console.warn('MathJax error:', err));
        }
    }

    function toggleFullGuide() {
        const guideContainer = document.getElementById('theory-full-guide-container');
        const toggleBtnText = document.getElementById('toggle-theory-text');
        const toggleBtnIcon = document.getElementById('toggle-theory-icon');
        const mount = document.getElementById('theory-mount');
        if (!guideContainer) return;

        const isHidden = guideContainer.style.display === 'none';
        if (isHidden) {
            guideContainer.style.display = 'block';
            if (toggleBtnText) toggleBtnText.innerText = 'Σύμπτυξη Οδηγού Μελέτης';
            if (toggleBtnIcon) toggleBtnIcon.innerText = '🔼';
            if (mount && (!mount.hasChildNodes() || mount.children.length === 0)) {
                renderPhysicsG(mount);
            }
            setTimeout(() => {
                guideContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 50);
        } else {
            guideContainer.style.display = 'none';
            if (toggleBtnText) toggleBtnText.innerText = 'Άνοιγμα Ψηφιακού Οδηγού Μελέτης';
            if (toggleBtnIcon) toggleBtnIcon.innerText = '📖';
            const card = document.getElementById('theory-chapter-card');
            if (card) card.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    function openSection(secId) {
        const guideContainer = document.getElementById('theory-full-guide-container');
        const toggleBtnText = document.getElementById('toggle-theory-text');
        const toggleBtnIcon = document.getElementById('toggle-theory-icon');
        const mount = document.getElementById('theory-mount');
        if (guideContainer) {
            guideContainer.style.display = 'block';
            if (toggleBtnText) toggleBtnText.innerText = 'Σύμπτυξη Οδηγού Μελέτης';
            if (toggleBtnIcon) toggleBtnIcon.innerText = '🔼';
            if (mount && (!mount.hasChildNodes() || mount.children.length === 0)) {
                renderPhysicsG(mount);
            }
        }
        setTimeout(() => {
            scrollToSection(null, secId);
        }, 120);
    }

    // ==========================================================================
    // Interactive chart V = f(I): hover (or touch) a line to read the point (I, V) and the constant V/I = R
    // ==========================================================================
    const VI_LINES = [
        { label: 'R₁ = 2 Ω', tex: 'R_1 = 2\\ \\Omega', R: 2, color: '#1d4ed8' },
        { label: 'R₂ = 5 Ω', tex: 'R_2 = 5\\ \\Omega', R: 5, color: '#15803d' },
        { label: 'R₃ = 10 Ω', tex: 'R_3 = 10\\ \\Omega', R: 10, color: '#dc2626' }
    ];
    const VI_STEP = 0.05; // the point snaps to this grid, so V and V/I are exact
    const VI_W = 640, VI_H = 420;
    const VI_PLOT = { left: 72, right: 600, top: 24, bottom: 350 };
    const VI_MAX_I = 2.5, VI_MAX_V = 25;

    function viX(I) { return VI_PLOT.left + (I / VI_MAX_I) * (VI_PLOT.right - VI_PLOT.left); }
    function viY(V) { return VI_PLOT.bottom - (V / VI_MAX_V) * (VI_PLOT.bottom - VI_PLOT.top); }

    function buildVISvg() {
        let s = `<svg class="vi-svg" viewBox="0 0 ${VI_W} ${VI_H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Γραφική παράσταση V = f(I)">`;
        // grid and ticks
        for (let V = 0; V <= VI_MAX_V; V += 5) {
            s += `<line x1="${VI_PLOT.left}" x2="${VI_PLOT.right}" y1="${viY(V)}" y2="${viY(V)}" class="vi-grid"/>`;
            s += `<text x="${VI_PLOT.left - 10}" y="${viY(V) + 4}" class="vi-tick" text-anchor="end">${V}</text>`;
        }
        for (let I = 0; I <= VI_MAX_I + 1e-9; I += 0.5) {
            s += `<line x1="${viX(I)}" x2="${viX(I)}" y1="${VI_PLOT.top}" y2="${VI_PLOT.bottom}" class="vi-grid"/>`;
            s += `<text x="${viX(I)}" y="${VI_PLOT.bottom + 18}" class="vi-tick" text-anchor="middle">${I.toFixed(1)}</text>`;
        }
        // axes
        s += `<line x1="${VI_PLOT.left}" x2="${VI_PLOT.left}" y1="${VI_PLOT.bottom}" y2="${VI_PLOT.top - 6}" class="vi-axis"/>`;
        s += `<line x1="${VI_PLOT.left}" x2="${VI_PLOT.right + 8}" y1="${VI_PLOT.bottom}" y2="${VI_PLOT.bottom}" class="vi-axis"/>`;
        s += `<text x="${VI_PLOT.right + 4}" y="${VI_PLOT.bottom + 36}" class="vi-axis-label" text-anchor="end">I (A)</text>`;
        s += `<text x="${VI_PLOT.left + 8}" y="${VI_PLOT.top - 8}" class="vi-axis-label" text-anchor="start">V (V)</text>`;
        // lines (V = R·I, drawn from the origin to I = 2.5 A)
        VI_LINES.forEach((ln, k) => {
            s += `<line x1="${viX(0)}" y1="${viY(0)}" x2="${viX(VI_MAX_I)}" y2="${viY(ln.R * VI_MAX_I)}" stroke="${ln.color}" stroke-width="3" class="vi-line" data-k="${k}"/>`;
            s += `<text x="${viX(VI_MAX_I) - 4}" y="${viY(ln.R * VI_MAX_I) - 10}" fill="${ln.color}" class="vi-line-label" text-anchor="end">${ln.label}</text>`;
        });
        // the active point and its guides
        s += `<g id="vi-point" style="display:none">
                <line id="vi-guide-v" class="vi-guide"/>
                <line id="vi-guide-i" class="vi-guide"/>
                <circle id="vi-dot" r="6" class="vi-dot"/>
              </g>`;
        s += `</svg>`;
        return s;
    }

    function openInteractiveVI() {
        let overlay = document.getElementById('vi-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'vi-overlay';
            overlay.className = 'vi-overlay';
            overlay.innerHTML = `
                <div class="vi-card" role="dialog" aria-modal="true" aria-labelledby="vi-title">
                    <div class="vi-head">
                        <h3 id="vi-title"><span class="vi-title-orn">✦</span> Χαρακτηριστική ευθεία $V = f(I)$ <span class="vi-title-orn">✦</span></h3>
                        <button type="button" class="vi-close" aria-label="Κλείσιμο">✕</button>
                    </div>
                    <p class="vi-hint">Περάστε τον δείκτη (ή το δάχτυλο) πάνω από μία ευθεία. Ο λόγος $\\dfrac{V}{I}$ είναι σταθερός για κάθε ευθεία: $V = R \\cdot I$.</p>
                    <div class="vi-plot">${buildVISvg()}</div>
                    <div class="vi-readout" id="vi-readout">Δεν έχει επιλεγεί ευθεία.</div>
                </div>`;
            document.body.appendChild(overlay);
            if (window.renderMath) window.renderMath(overlay.querySelector('.vi-card'));
            overlay.addEventListener('click', (e) => { if (e.target === overlay) closeInteractiveVI(); });
            overlay.querySelector('.vi-close').addEventListener('click', closeInteractiveVI);
            const svg = overlay.querySelector('.vi-svg');
            svg.addEventListener('pointermove', onVIPointer);
            svg.addEventListener('pointerdown', onVIPointer);
            svg.addEventListener('pointerleave', hideVIPoint);
            document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeInteractiveVI(); });
        }
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeInteractiveVI() {
        const overlay = document.getElementById('vi-overlay');
        if (overlay) overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    function onVIPointer(e) {
        const svg = e.currentTarget;
        const pt = svg.createSVGPoint();
        pt.x = e.clientX; pt.y = e.clientY;
        const p = pt.matrixTransform(svg.getScreenCTM().inverse());
        const I = Math.min(VI_MAX_I, Math.max(0, ((p.x - VI_PLOT.left) / (VI_PLOT.right - VI_PLOT.left)) * VI_MAX_I));
        // the nearest line at this current, measured vertically in SVG units
        let best = null;
        VI_LINES.forEach(ln => {
            const dy = Math.abs(p.y - viY(ln.R * I));
            if (best === null || dy < best.dy) best = { ln, dy };
        });
        if (!best || best.dy > 20) { hideVIPoint(); return; }
        showVIPoint(best.ln, Math.round(I / VI_STEP) * VI_STEP);
    }

    function showVIPoint(ln, I) {
        const V = ln.R * I;
        const svg = document.querySelector('#vi-overlay .vi-svg');
        if (!svg) return;
        const x = viX(I), y = viY(V);
        svg.querySelector('#vi-point').style.display = 'inline';
        svg.querySelector('#vi-dot').setAttribute('cx', x);
        svg.querySelector('#vi-dot').setAttribute('cy', y);
        svg.querySelector('#vi-dot').setAttribute('fill', ln.color);
        const gv = svg.querySelector('#vi-guide-v'), gi = svg.querySelector('#vi-guide-i');
        gv.setAttribute('x1', x); gv.setAttribute('x2', x); gv.setAttribute('y1', y); gv.setAttribute('y2', VI_PLOT.bottom);
        gi.setAttribute('x1', VI_PLOT.left); gi.setAttribute('x2', x); gi.setAttribute('y1', y); gi.setAttribute('y2', y);
        const readout = document.getElementById('vi-readout');
        const key = ln.R + '|' + I.toFixed(2);
        if (readout && readout.dataset.key !== key) {
            readout.dataset.key = key;
            const Ir = I.toFixed(2), Vr = V.toFixed(2);
            readout.innerHTML =
                `<span class="vi-readout-line" style="color:${ln.color}">$${ln.tex}$</span>` +
                `<span class="vi-readout-item">$I = ${Ir}\\ \\text{A}$</span>` +
                `<span class="vi-readout-item">$V = ${Vr}\\ \\text{V}$</span>` +
                `<span class="vi-readout-item">$\\dfrac{V}{I} = \\dfrac{${Vr}\\ \\text{V}}{${Ir}\\ \\text{A}} = ${ln.R}\\ \\Omega$</span>`;
            if (window.renderMath) window.renderMath(readout);
        }
    }

    function hideVIPoint() {
        const svg = document.querySelector('#vi-overlay .vi-svg');
        if (svg) svg.querySelector('#vi-point').style.display = 'none';
        const readout = document.getElementById('vi-readout');
        if (readout) { readout.dataset.key = ''; readout.textContent = 'Δεν έχει επιλεγεί ευθεία.'; }
    }

    return {
        renderPhysicsG: renderPhysicsG,
        setTriangle: setTriangle,
        renderActiveTriangle: renderActiveTriangle,
        scrollToSection: scrollToSection,
        setupScrollSpy: setupScrollSpy,
        toggleFullGuide: toggleFullGuide,
        openSection: openSection,
        openInteractiveVI: openInteractiveVI
    };
})();
