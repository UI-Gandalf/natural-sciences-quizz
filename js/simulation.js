/**
 * ==============================================================================
 * Γυμνάσιο Νέας Ερυθραίας - Φυσικές Επιστήμες
 * Διαδραστικό Εργαστήριο Ηλεκτρικών Κυκλωμάτων (Circuit Simulator)
 * Σύνδεση σε Σειρά & Παράλληλη Σύνδεση (Σχήμα 1 & Σχήμα 2)
 * ==============================================================================
 */

window.CircuitSimulation = (function() {
    'use strict';

    // Simulation Internal State
    const state = {
        topology: 'series',      // 'series' | 'parallel'
        V_src: 20,               // Volts (1 - 60)
        R1: 4,                   // Ohms (1 - 50)
        R2: 6,                   // Ohms (1 - 50)
        switchClosed: true,      // Boolean
        shortR1: false,          // Boolean: Short-circuit bypass
        shortR2: false,          // Boolean: Short-circuit bypass
        shortModeR1: 'classic',          // 'classic' | 'alternative'
        shortModeR2: 'classic',          // 'classic' | 'alternative'
        harmlessConnection: 'none',      // 'none' | 'series_GA' | 'series_FC' | 'parallel_AC' | 'parallel_FE'
        brokenR1: false,         // Boolean: Device malfunction / open circuit
        brokenR2: false,         // Boolean: Device malfunction / open circuit
        faultInstrument: 'none', // 'none' | 'ammeter_parallel' | 'ammeter2_parallel' | 'voltmeter_series'
        showSteps: true,         // Boolean: Show detailed calculation steps
        activeProbe: 'R1',       // Currently inspected component
        hoverProbe: null,        // Hovered element
        isFullscreen: false,     // Boolean: Fullscreen lightbox modal active
        containerEl: null
    };

    // Ready-made presets previously at the top of simulation have been permanently removed per user request. Do not re-add.
    const PRESETS = {};

    function showToast(msg) {
        if (typeof window.showToast === 'function') {
            window.showToast(msg);
        }
    }

    /**
     * Compute all electrical quantities based on physical laws
     */
    function computePhysics() {
        const { topology, V_src, R1, R2, switchClosed, shortR1, shortR2, brokenR1, brokenR2, faultInstrument } = state;
        const res = {
            switchClosed,
            V_src,
            R1,
            R2,
            shortR1,
            shortR2,
            brokenR1,
            brokenR2,
            faultInstrument,
            topology
        };

        if (!switchClosed) {
            res.status = 'open_circuit';
            res.statusText = 'Ανοικτός Διακόπτης (Διακοπή Ρεύματος)';
            res.I_total = 0;
            res.R_eq = Infinity;
            res.P_total = 0;
            res.V_switch = V_src;
            res.I_switch = 0;
            res.I_A1 = 0;
            res.I_A2 = 0;
            res.I_A3 = 0;
            res.V1 = 0;
            res.I1 = 0;
            res.P1 = 0;
            res.V2 = 0;
            res.I2 = 0;
            res.P2 = 0;
            res.VA = 0;
            res.VB = 0;
            res.VC = 0;
            res.VD = 0;
            res.VE = 0;
            res.VF = 0;
            res.VG = V_src;
            res.VK = 0;
            res.V_src_meter = V_src;
            res.V_par_meter = 0;
            return res;
        }

        res.V_switch = 0;
        res.V_src_meter = V_src;

        if (topology === 'series') {
            // Check for faulty instrument placement (Case I: Ammeter A1 in parallel with source)
            if (faultInstrument === 'ammeter_parallel') {
                res.status = 'total_short';
                res.statusText = '⚠️ Ολικό Βραχυκύκλωμα Πηγής (Λανθασμένη Τοποθέτηση Αμπερομέτρου A₁ παράλληλα στην πηγή)!';
                res.R_eq = 0;
                res.I_total = Infinity;
                res.I_switch = Infinity;
                res.P_total = Infinity;
                res.I_A1 = Infinity;
                res.I_A2 = 0;
                res.I_A3 = 0;
                res.V1 = 0;
                res.I1 = 0;
                res.P1 = 0;
                res.V2 = 0;
                res.I2 = 0;
                res.P2 = 0;
                res.VD = 0;
                res.VE = 0;
                res.VF = 0;
                res.VM = 0;
                res.VC = 0;
                res.VB = 0;
                res.VA = 0;
                res.VK = 0;
                res.VG = 0;
                res.V_src_meter = V_src;
                return res;
            }

            // Check for faulty instrument placement (Case II: Ammeter A2 in parallel with R2, between K and M)
            if (faultInstrument === 'ammeter2_parallel') {
                if (brokenR1) {
                    res.status = 'broken_circuit';
                    res.statusText = '💥 Καταστροφή R₁ (Διακοπή Σειράς - I = 0 A)';
                    res.R_eq = Infinity;
                    res.I_total = 0;
                    res.I_switch = 0;
                    res.P_total = 0;
                    res.I_A1 = 0;
                    res.I_A2 = 0;
                    res.I_A3 = 0;
                    res.V1 = V_src;
                    res.I1 = 0;
                    res.P1 = 0;
                    res.V2 = 0;
                    res.I2 = 0;
                    res.P2 = 0;
                    res.VD = 0;
                    res.VE = 0;
                    res.VF = 0;
                    res.VM = 0;
                    res.VC = 0;
                    res.VB = 0;
                    res.VA = V_src;
                    res.VK = 0;
                    res.VG = V_src;
                    res.V_src_meter = V_src;
                    return res;
                }

                if (shortR1) {
                    res.status = 'total_short';
                    res.statusText = '⚠️ Ολικό Βραχυκύκλωμα Πηγής (R₁ βραχυκυκλωμένος & A₂ παράλληλα)!';
                    res.R_eq = 0;
                    res.I_total = Infinity;
                    res.I_switch = Infinity;
                    res.P_total = Infinity;
                    res.I_A1 = Infinity;
                    res.I_A2 = Infinity;
                    res.I_A3 = 0;
                    res.V1 = 0;
                    res.I1 = 0;
                    res.P1 = 0;
                    res.V2 = 0;
                    res.I2 = 0;
                    res.P2 = 0;
                    res.VD = 0;
                    res.VE = 0;
                    res.VF = 0;
                    res.VM = 0;
                    res.VC = 0;
                    res.VB = 0;
                    res.VA = 0;
                    res.VK = 0;
                    res.VG = 0;
                    res.V_src_meter = V_src;
                    return res;
                }

                // Normal Case II: R1 is active, R2 is short-circuited by A2
                const I1 = V_src / R1;
                res.status = 'partial_short';
                res.statusText = '⚠️ Μερικό Βραχυκύκλωμα (Λανθασμένη Τοποθέτηση Α₂ μεταξύ K − M: Βραχυκύκλωση R₂)';
                res.R_eq = R1;
                res.I_total = I1;
                res.I_switch = I1;
                res.P_total = V_src * I1;
                res.I_A1 = I1;
                res.I_A2 = I1;
                res.I_A3 = 0;

                res.V1 = V_src;
                res.I1 = I1;
                res.P1 = V_src * I1;

                res.V2 = 0;
                res.I2 = 0;
                res.P2 = 0;

                // Potentials
                res.VD = 0;
                res.VE = 0;
                res.VF = 0;
                res.VM = 0;
                res.VC = 0;
                res.VB = 0;
                res.VK = 0;
                res.VA = V_src;
                res.VG = V_src;
                res.V_src_meter = V_src;
                return res;
            }

            // Check for faulty instrument placement (Case III: Voltmeter in series replacing A1)
            if (faultInstrument === 'voltmeter_series') {
                res.status = 'open_circuit';
                res.statusText = '⚠️ Σφάλμα: Σύνδεση Βολτομέτρου σε Σειρά (Rv → ∞) — Μηδενισμός Ρεύματος (I = 0 A)';
                res.R_eq = Infinity;
                res.I_total = 0;
                res.I_switch = 0;
                res.P_total = 0;
                res.I_A1 = 0;
                res.I_A2 = 0;
                res.I_A3 = 0;
                res.V1 = 0;
                res.I1 = 0;
                res.P1 = 0;
                res.V2 = 0;
                res.I2 = 0;
                res.P2 = 0;
                res.V_series_meter = V_src;
                res.V_src_meter = V_src;
                res.VG = V_src;
                res.VA = 0;
                res.VB = 0;
                res.VC = 0;
                res.VD = 0;
                res.VE = 0;
                res.VF = 0;
                res.VM = 0;
                res.VK = 0;
                return res;
            }

            // Check for broken device (open circuit fault in series)
            if (brokenR1 || brokenR2) {
                res.status = 'broken_circuit';
                if (brokenR1 && brokenR2) {
                    res.statusText = '💥 Καταστροφή R₁ & R₂ (Διακοπή Σειράς - I = 0 A)';
                    res.V1 = V_src;
                    res.V2 = 0;
                } else if (brokenR1) {
                    res.statusText = '💥 Καταστροφή R₁ (Διακοπή Σειράς - I = 0 A)';
                    res.V1 = V_src; // Entire source voltage drops across open break!
                    res.V2 = 0;
                } else {
                    res.statusText = '💥 Καταστροφή R₂ (Διακοπή Σειράς - I = 0 A)';
                    res.V1 = 0;
                    res.V2 = V_src; // Entire source voltage drops across open break!
                }
                res.R_eq = Infinity;
                res.I_total = 0;
                res.I_switch = 0;
                res.P_total = 0;
                res.I1 = 0;
                res.P1 = 0;
                res.I2 = 0;
                res.P2 = 0;

                // Potentials
                res.VD = 0;
                res.VE = 0;
                res.VF = 0;
                res.VC = 0;
                if (brokenR1) {
                    res.VB = 0;
                    res.VA = V_src;
                } else {
                    res.VB = V_src;
                    res.VA = V_src;
                }
                res.VG = V_src;
                return res;
            }

            const effR1 = shortR1 ? 0 : R1;
            const effR2 = shortR2 ? 0 : R2;
            const Req = effR1 + effR2;

            if (Req <= 0.001) {
                res.status = 'total_short';
                res.statusText = '⚠️ Ολικό Βραχυκύκλωμα Πηγής!';
                res.R_eq = 0;
                res.I_total = Infinity;
                res.I_switch = Infinity;
                res.P_total = Infinity;
                res.V1 = 0;
                res.I1 = 0;
                res.P1 = 0;
                res.V2 = 0;
                res.I2 = 0;
                res.P2 = 0;
                return res;
            }

            const I = V_src / Req;
            res.status = (shortR1 || shortR2) ? 'partial_short' : 'normal';
            res.statusText = (shortR1 || shortR2) ? 
                `Μερικό Βραχυκύκλωμα (${shortR1 && shortR2 ? 'R₁ & R₂' : (shortR1 ? (state.shortModeR1 === 'alternative' ? 'R₁ μέσω G ↔ B' : 'R₁') : (state.shortModeR2 === 'alternative' ? 'R₂ μέσω B ↔ E' : 'R₂'))})` : 
                (state.harmlessConnection === 'series_GA' ? '✅ Κανονική Λειτουργία (Σύνδεση G ↔ A — Χωρίς Βραχυκύκλωμα)' : 
                 state.harmlessConnection === 'series_FC' ? '✅ Κανονική Λειτουργία (Σύνδεση F ↔ C — Αγωγός Επιστροφής 0V)' : 
                 'Κανονική Λειτουργία (Σειρά)');
            res.R_eq = Req;
            res.I_total = I;
            res.I_switch = I;
            res.I_A1 = I;
            res.I_A2 = I;
            res.I_A3 = I;
            res.P_total = V_src * I;

            res.V1 = shortR1 ? 0 : (I * R1);
            res.I1 = shortR1 ? 0 : I;
            res.P1 = shortR1 ? 0 : (res.V1 * res.I1);

            res.V2 = shortR2 ? 0 : (I * R2);
            res.I2 = shortR2 ? 0 : I;
            res.P2 = shortR2 ? 0 : (res.V2 * res.I2);

            // Potentials (VD = 0V ground)
            res.VD = 0;
            res.VC = 0;
            res.VE = 0;
            res.VF = 0;
            res.VB = res.V2;
            res.VA = res.VB + res.V1; // = V_src
            res.VK = res.VA;
            res.VG = V_src;
        } else {
            // Parallel circuit
            // Check for faulty instrument placement (Case I: Ammeter A1 vertically parallel to source before Aολ)
            if (faultInstrument === 'ammeter_parallel') {
                res.status = 'total_short';
                res.statusText = '⚠️ Ολικό Βραχυκύκλωμα Πηγής (Λανθασμένη Τοποθέτηση Α₁ Παράλληλα στην Πηγή)!';
                res.R_eq = 0;
                res.I_total = Infinity;
                res.I_switch = Infinity;
                res.P_total = Infinity;
                res.I_A1 = Infinity;
                res.I_A2 = 0;
                res.I_main = 0;
                res.V1 = 0;
                res.I1 = 0;
                res.P1 = 0;
                res.V2 = 0;
                res.I2 = 0;
                res.P2 = 0;
                res.V_par_meter = 0;
                res.V_src_meter = V_src;
                res.VD = 0;
                res.VE = 0;
                res.VF = 0;
                res.VB = 0;
                res.VA = 0;
                res.VC = 0;
                res.VK = 0;
                res.VG = V_src;
                return res;
            }

            // Check for faulty instrument placement (Case II: Ammeter A2 vertically between R1 and R2)
            if (faultInstrument === 'ammeter2_parallel') {
                res.status = 'total_short';
                res.statusText = '⚠️ Βραχυκύκλωση Συστοιχίας (Λανθασμένη Τοποθέτηση Α₂ Κάθετα Ανάμεσα στους R₁ & R₂)!';
                res.R_eq = 0;
                res.I_total = Infinity;
                res.I_switch = Infinity;
                res.P_total = Infinity;
                res.I_A1 = 0;
                res.I_A2 = Infinity;
                res.I_main = Infinity;
                res.V1 = 0;
                res.I1 = 0;
                res.P1 = 0;
                res.V2 = 0;
                res.I2 = 0;
                res.P2 = 0;
                res.V_par_meter = 0;
                res.V_src_meter = V_src;
                res.VD = 0;
                res.VE = 0;
                res.VF = 0;
                res.VB = 0;
                res.VA = 0;
                res.VC = 0;
                res.VK = 0;
                res.VM = 0;
                res.VG = V_src;
                return res;
            }

            // Check for faulty instrument placement (Case III: Voltmeter in series on main supply rail before Aολ)
            if (faultInstrument === 'voltmeter_series') {
                res.status = 'open_circuit';
                res.statusText = '⚠️ Σφάλμα: Βολτόμετρο σε Σειρά στον Κύριο Αγωγό (Rv → ∞) — Iολ = 0 A, Vπαρ = 0 V';
                res.R_eq = Infinity;
                res.I_total = 0;
                res.I_switch = 0;
                res.P_total = 0;
                res.I_A1 = 0;
                res.I_A2 = 0;
                res.V1 = 0;
                res.I1 = 0;
                res.P1 = 0;
                res.V2 = 0;
                res.I2 = 0;
                res.P2 = 0;
                res.V_series_meter = V_src;
                res.V_par_meter = 0;
                res.V_src_meter = V_src;
                res.VD = 0;
                res.VE = 0;
                res.VF = 0;
                res.VB = 0;
                res.VA = 0;
                res.VC = 0;
                res.VG = V_src;
                return res;
            }

            if (shortR1 || shortR2) {
                res.status = 'total_short';
                res.statusText = `⚠️ Ολικό Βραχυκύκλωμα Πηγής (${shortR1 ? (state.shortModeR1 === 'alternative' ? 'μέσω A ↔ E' : 'R₁') : (state.shortModeR2 === 'alternative' ? 'μέσω B ↔ C' : 'R₂')})!`;
                res.R_eq = 0;
                res.I_total = Infinity;
                res.I_switch = Infinity;
                res.P_total = Infinity;
                res.V1 = 0;
                res.I1 = 0;
                res.P1 = 0;
                res.V2 = 0;
                res.I2 = 0;
                res.P2 = 0;
                res.V_par_meter = 0;
                return res;
            }

            // Check broken in parallel
            if (brokenR1 && brokenR2) {
                res.status = 'broken_circuit';
                res.statusText = '💥 Καταστροφή & των δύο κλάδων (I = 0 A)';
                res.R_eq = Infinity;
                res.I_total = 0;
                res.I_switch = 0;
                res.P_total = 0;
                res.V1 = 0;
                res.I1 = 0;
                res.P1 = 0;
                res.V2 = 0;
                res.I2 = 0;
                res.P2 = 0;
                res.V_par_meter = V_src;
                res.VD = 0;
                res.VE = 0;
                res.VF = 0;
                res.VB = 0;
                res.VA = V_src;
                res.VC = V_src;
                res.VG = V_src;
                return res;
            }

            if (brokenR1 && !brokenR2) {
                const I2 = V_src / R2;
                res.status = 'partial_broken';
                res.statusText = '💥 Καταστροφή R₁ (Λειτουργεί μόνον ο κλάδος R₂)';
                res.R_eq = R2;
                res.I_total = I2;
                res.I_switch = I2;
                res.P_total = V_src * I2;
                res.V1 = 0;
                res.I1 = 0;
                res.P1 = 0;
                res.V2 = V_src;
                res.I2 = I2;
                res.P2 = V_src * I2;
                res.V_par_meter = V_src;
                res.VD = 0;
                res.VE = 0;
                res.VF = 0;
                res.VB = 0;
                res.VA = V_src;
                res.VC = V_src;
                res.VG = V_src;
                return res;
            }

            if (brokenR2 && !brokenR1) {
                const I1 = V_src / R1;
                res.status = 'partial_broken';
                res.statusText = '💥 Καταστροφή R₂ (Λειτουργεί μόνον ο κλάδος R₁)';
                res.R_eq = R1;
                res.I_total = I1;
                res.I_switch = I1;
                res.P_total = V_src * I1;
                res.V1 = V_src;
                res.I1 = I1;
                res.P1 = V_src * I1;
                res.V2 = 0;
                res.I2 = 0;
                res.P2 = 0;
                res.V_par_meter = V_src;
                res.VD = 0;
                res.VE = 0;
                res.VF = 0;
                res.VB = 0;
                res.VA = V_src;
                res.VC = V_src;
                res.VG = V_src;
                return res;
            }

            const Req = (R1 * R2) / (R1 + R2);
            const I1 = V_src / R1;
            const I2 = V_src / R2;
            const Itot = I1 + I2;

            res.status = 'normal';
            res.statusText = state.harmlessConnection === 'parallel_AC' ? 
                '✅ Κανονική Λειτουργία (Σύνδεση A ↔ C — Άνω γραμμή Vπηγ)' : 
                state.harmlessConnection === 'parallel_FE' ? 
                '✅ Κανονική Λειτουργία (Σύνδεση F ↔ E — Κάτω γραμμή 0V)' : 
                'Κανονική Λειτουργία (Παράλληλα)';
            res.R_eq = Req;
            res.I_total = Itot;
            res.I_switch = Itot;
            res.P_total = V_src * Itot;

            res.V1 = V_src;
            res.I1 = I1;
            res.P1 = V_src * I1;

            res.V2 = V_src;
            res.I2 = I2;
            res.P2 = V_src * I2;

            res.V_par_meter = V_src;

            res.VD = 0;
            res.VE = 0;
            res.VF = 0;
            res.VB = 0;
            res.VA = V_src;
            res.VC = V_src;
            res.VG = V_src;
        }

        return res;
    }

    /**
     * Render the entire simulation interface into container
     */
    function render(container) {
        state.containerEl = container;
        const phys = computePhysics();
        const isFaultActive = state.faultInstrument && state.faultInstrument !== 'none';

        function getHarmlessTogglePopup(isActive) {
            return `
                <div class="harmless-toggle-popup" role="tooltip">
                    <div class="popup-header">
                        <span class="popup-icon">🔄</span>
                        <span>Λειτουργία Διακόπτη (Toggle)</span>
                    </div>
                    <div class="popup-body">
                        Το πάτημα της επιλογής εναλλάσσει το κύκλωμα από την <strong>αρχική κατάσταση</strong> στην κατάσταση <strong>με το καλώδιο που δεν επιφέρει μεταβολές στο καθεστώς του κυκλώματος</strong> και αντίστροφα.
                    </div>
                    <div class="popup-status-badge ${isActive ? 'active-state' : 'inactive-state'}">
                        <span>${isActive ? '🟢 Τρέχουσα: Συνδεδεμένο (Κλικ για επιστροφή)' : '⚪ Τρέχουσα: Αρχική (Κλικ για ενεργοποίηση)'}</span>
                    </div>
                    <span class="popup-arrow"></span>
                </div>
            `;
        }

        container.innerHTML = `
            <div class="sim-container theme-physics">
                <!-- Header Toolbar: Topology & Fullscreen -->
                <div class="sim-header-card">
                    <div class="sim-header-top">
                        <div class="sim-title-wrap">
                            <span class="sim-title-badge">⚡ Εικονικό Εργαστήριο Φυσικής</span>
                            <h2 class="sim-title">Διαδραστική Προσομοίωση Κυκλωμάτων</h2>
                            <p class="sim-subtitle">
                                Μεταβάλλετε τις τιμές τάσης και αντιστάσεων, ανοιγοκλείστε τον διακόπτη και περάστε το ποντίκι πάνω από οποιοδήποτε στοιχείο για ζωντανή μέτρηση & ανάλυση!
                            </p>
                        </div>
                        
                        <!-- Topology Switch & Fullscreen Toolbar Actions -->
                        <div class="sim-header-actions">
                            <div class="sim-topology-switch">
                                <button class="sim-topo-btn ${state.topology === 'series' ? 'active' : ''}" id="topo-series-btn" onclick="CircuitSimulation.setTopology('series')">
                                    <span class="topo-icon">⛓️</span>
                                    <span>Σύνδεση σε Σειρά (Σχήμα 1)</span>
                                </button>
                                <button class="sim-topo-btn ${state.topology === 'parallel' ? 'active' : ''}" id="topo-parallel-btn" onclick="CircuitSimulation.setTopology('parallel')">
                                    <span class="topo-icon">🔀</span>
                                    <span>Παράλληλη Σύνδεση (Σχήμα 2)</span>
                                </button>
                            </div>

                            <!-- Minimalist Discrete Fullscreen Popup Button -->
                            ${state.isFullscreen ? `
                                <button class="sim-fullscreen-btn sim-exit-fs-btn" onclick="CircuitSimulation.closeFullscreenModal()" title="Έξοδος από πλήρη οθόνη (Esc)">
                                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M4 14h6m0 0v6m0-6L3 21m17-11h-6m0 0V4m0 6l7-7"/>
                                    </svg>
                                    <span>Έξοδος</span>
                                </button>
                            ` : `
                                <button class="sim-fullscreen-btn" onclick="CircuitSimulation.openFullscreenModal()" title="Προβολή σε πλήρη οθόνη (Fullscreen Popup)">
                                    <svg class="sim-fullscreen-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
                                    </svg>
                                    <span>Πλήρης Οθόνη</span>
                                </button>
                            `}
                        </div>
                    </div>
                </div>

                <!-- Main Laboratory Layout: Controls + SVG Circuit + HUD Inspector -->
                <div class="sim-workspace-grid">
                    <!-- Left: Interactive Controls Sidebar -->
                    <div class="sim-controls-panel">
                        <div class="sim-card-header">
                            <span class="sim-card-icon">🎛️</span>
                            <h3 class="sim-card-title">Παράμετροι Κυκλώματος</h3>
                        </div>

                        <!-- 1. Source Voltage Control -->
                        <div class="sim-control-group">
                            <div class="sim-control-header">
                                <label for="sim-slider-vsrc">
                                    <strong>Τάση Πηγής</strong> <span class="math-expr">(<i class="math-var">V</i><sub class="math-sub">πηγ</sub>)</span>:
                                </label>
                                <span class="sim-val-display" id="disp-vsrc">${state.V_src} V</span>
                            </div>
                            <div class="sim-slider-row">
                                <input type="range" id="sim-slider-vsrc" min="1" max="60" step="1" value="${state.V_src}" 
                                       oninput="CircuitSimulation.setParam('V_src', this.value)" />
                            </div>
                            <div class="sim-quick-steppers">
                                <button class="sim-step-btn" onclick="CircuitSimulation.adjustParam('V_src', -5)">-5V</button>
                                <button class="sim-step-btn" onclick="CircuitSimulation.adjustParam('V_src', -1)">-1V</button>
                                <button class="sim-step-btn" onclick="CircuitSimulation.adjustParam('V_src', +1)">+1V</button>
                                <button class="sim-step-btn" onclick="CircuitSimulation.adjustParam('V_src', +5)">+5V</button>
                            </div>
                        </div>

                        <!-- 2. Resistor R1 Control -->
                        <div class="sim-control-group ${isFaultActive ? 'is-locked' : ''}">
                            <div class="sim-control-header">
                                <label for="sim-slider-r1">
                                    <strong>Αντιστάτης 1</strong> <span class="math-expr">(<i class="math-var">R</i><sub class="math-sub">1</sub>)</span>:
                                </label>
                                <span class="sim-val-display" id="disp-r1">${state.R1} Ω ${isFaultActive ? '<span class="sim-locked-tag">🔒 Κλειδωμένο</span>' : ''}</span>
                            </div>
                            <div class="sim-slider-row">
                                <input type="range" id="sim-slider-r1" min="1" max="50" step="1" value="${state.R1}" 
                                       ${isFaultActive ? 'disabled' : ''}
                                       title="${isFaultActive ? 'Κλειδωμένο κατά τη μελέτη σφάλματος τοποθέτησης οργάνου' : ''}"
                                       oninput="CircuitSimulation.setParam('R1', this.value)" />
                            </div>
                            <div class="sim-toggles-row" style="display: flex; flex-direction: column; gap: 6px;">
                                <label class="sim-toggle-checkbox ${isFaultActive ? 'is-disabled' : ''}" title="${isFaultActive ? 'Κλειδωμένο κατά τη μελέτη σφάλματος τοποθέτησης οργάνου' : ''}">
                                    <input type="checkbox" id="sim-short-r1" ${state.shortR1 ? 'checked' : ''} ${isFaultActive ? 'disabled' : ''}
                                           onchange="CircuitSimulation.toggleShort('shortR1', this.checked)">
                                    <span class="checkbox-custom"></span>
                                    <span class="checkbox-label">Βραχυκύκλωση <span class="math-expr"><i class="math-var">R</i><sub class="math-sub">1</sub></span> (Παράκαμψη)</span>
                                </label>
                                <div class="sim-short-mode-subline ${!state.shortR1 ? 'is-dimmed' : ''}">
                                    <button type="button" class="sim-subline-pill ${state.shortR1 && state.shortModeR1 === 'classic' ? 'active' : ''}" 
                                            ${isFaultActive ? 'disabled' : ''}
                                            onclick="CircuitSimulation.setShortMode('R1', 'classic')" 
                                            title="Άμεση παράκαμψη στα άκρα του R1 (${state.topology === 'series' ? 'A ↔ B' : 'A ↔ B'})">
                                        <span class="pill-num">(1)</span> Άμεση
                                    </button>
                                    <button type="button" class="sim-subline-pill ${state.shortR1 && state.shortModeR1 === 'alternative' ? 'active' : ''}" 
                                            ${isFaultActive ? 'disabled' : ''}
                                            onclick="CircuitSimulation.setShortMode('R1', 'alternative')" 
                                            title="${state.topology === 'series' ? 'Έμμεση παράκαμψη: καλώδιο G ↔ B κάτω από τον R1' : 'Έμμεση παράκαμψη: καλώδιο A ↔ E'}">
                                        <span class="pill-num">(2)</span> Έμμεση
                                    </button>
                                </div>
                                <label class="sim-toggle-checkbox broken-toggle ${isFaultActive ? 'is-disabled' : ''}" title="${isFaultActive ? 'Κλειδωμένο κατά τη μελέτη σφάλματος τοποθέτησης οργάνου' : ''}">
                                    <input type="checkbox" id="sim-broken-r1" ${state.brokenR1 ? 'checked' : ''} ${isFaultActive ? 'disabled' : ''}
                                           onchange="CircuitSimulation.toggleBroken('brokenR1', this.checked)">
                                    <span class="checkbox-custom"></span>
                                    <span class="checkbox-label">💥 Καταστροφή <span class="math-expr"><i class="math-var">R</i><sub class="math-sub">1</sub></span> (Διακοπή)</span>
                                </label>
                            </div>
                        </div>

                        <!-- 3. Resistor R2 Control -->
                        <div class="sim-control-group ${isFaultActive ? 'is-locked' : ''}">
                            <div class="sim-control-header">
                                <label for="sim-slider-r2">
                                    <strong>Αντιστάτης 2</strong> <span class="math-expr">(<i class="math-var">R</i><sub class="math-sub">2</sub>)</span>:
                                </label>
                                <span class="sim-val-display" id="disp-r2">${state.R2} Ω ${isFaultActive ? '<span class="sim-locked-tag">🔒 Κλειδωμένο</span>' : ''}</span>
                            </div>
                            <div class="sim-slider-row">
                                <input type="range" id="sim-slider-r2" min="1" max="50" step="1" value="${state.R2}" 
                                       ${isFaultActive ? 'disabled' : ''}
                                       title="${isFaultActive ? 'Κλειδωμένο κατά τη μελέτη σφάλματος τοποθέτησης οργάνου' : ''}"
                                       oninput="CircuitSimulation.setParam('R2', this.value)" />
                            </div>
                            <div class="sim-toggles-row" style="display: flex; flex-direction: column; gap: 6px;">
                                <label class="sim-toggle-checkbox ${isFaultActive ? 'is-disabled' : ''}" title="${isFaultActive ? 'Κλειδωμένο κατά τη μελέτη σφάλματος τοποθέτησης οργάνου' : ''}">
                                    <input type="checkbox" id="sim-short-r2" ${state.shortR2 ? 'checked' : ''} ${isFaultActive ? 'disabled' : ''}
                                           onchange="CircuitSimulation.toggleShort('shortR2', this.checked)">
                                    <span class="checkbox-custom"></span>
                                    <span class="checkbox-label">Βραχυκύκλωση <span class="math-expr"><i class="math-var">R</i><sub class="math-sub">2</sub></span> (Παράκαμψη)</span>
                                </label>
                                <div class="sim-short-mode-subline ${!state.shortR2 ? 'is-dimmed' : ''}">
                                    <button type="button" class="sim-subline-pill ${state.shortR2 && state.shortModeR2 === 'classic' ? 'active' : ''}" 
                                            ${isFaultActive ? 'disabled' : ''}
                                            onclick="CircuitSimulation.setShortMode('R2', 'classic')" 
                                            title="Άμεση παράκαμψη στα άκρα του R2 (${state.topology === 'series' ? 'B ↔ C' : 'C ↔ E'})">
                                        <span class="pill-num">(1)</span> Άμεση
                                    </button>
                                    <button type="button" class="sim-subline-pill ${state.shortR2 && state.shortModeR2 === 'alternative' ? 'active' : ''}" 
                                            ${isFaultActive ? 'disabled' : ''}
                                            onclick="CircuitSimulation.setShortMode('R2', 'alternative')" 
                                            title="${state.topology === 'series' ? 'Έμμεση παράκαμψη: καλώδιο B ↔ E' : 'Έμμεση παράκαμψη: καλώδιο B ↔ C'}">
                                        <span class="pill-num">(2)</span> Έμμεση
                                    </button>
                                </div>
                                <label class="sim-toggle-checkbox broken-toggle ${isFaultActive ? 'is-disabled' : ''}" title="${isFaultActive ? 'Κλειδωμένο κατά τη μελέτη σφάλματος τοποθέτησης οργάνου' : ''}">
                                    <input type="checkbox" id="sim-broken-r2" ${state.brokenR2 ? 'checked' : ''} ${isFaultActive ? 'disabled' : ''}
                                           onchange="CircuitSimulation.toggleBroken('brokenR2', this.checked)">
                                    <span class="checkbox-custom"></span>
                                    <span class="checkbox-label">💥 Καταστροφή <span class="math-expr"><i class="math-var">R</i><sub class="math-sub">2</sub></span> (Διακοπή)</span>
                                </label>
                            </div>
                        </div>

                        <!-- Faulty Instrument Placement (Series & Parallel Circuits) -->
                        ${state.topology === 'series' ? `
                            <div class="sim-control-group sim-fault-group ${state.faultInstrument === 'ammeter_parallel' ? 'is-shorted' : (state.faultInstrument === 'ammeter2_parallel' ? 'is-partial' : (state.faultInstrument === 'voltmeter_series' ? 'is-series-vm' : ''))}" id="sim-fault-group">
                                <div class="sim-control-header">
                                    <span class="sim-group-title">
                                        <strong>⚠️ Τοποθέτηση Οργάνων</strong>
                                    </span>
                                    ${state.faultInstrument === 'ammeter_parallel' ? `
                                        <span class="warn-badge">Ολικό Βραχυκύκλωμα</span>
                                    ` : state.faultInstrument === 'ammeter2_parallel' ? `
                                        <span class="warn-badge" style="background: rgba(245, 158, 11, 0.18); color: #f59e0b; border-color: rgba(245, 158, 11, 0.4);">Βραχυκύκλωση R₂</span>
                                    ` : state.faultInstrument === 'voltmeter_series' ? `
                                        <span class="warn-badge" style="background: rgba(168, 85, 247, 0.18); color: #c084fc; border-color: rgba(168, 85, 247, 0.4);">Διακοπή (Rv → ∞)</span>
                                    ` : `
                                        <span class="ok-badge">Ορθή Σύνδεση</span>
                                    `}
                                </div>
                                <div class="sim-fault-options-list">
                                    <label class="sim-radio-card ${state.faultInstrument === 'none' ? 'active' : ''}">
                                        <input type="radio" name="sim-fault-instrument" value="none" 
                                               ${state.faultInstrument === 'none' ? 'checked' : ''} 
                                               onchange="CircuitSimulation.setFaultInstrument('none')">
                                        <span class="radio-card-dot"></span>
                                        <div class="radio-card-content">
                                            <span class="radio-card-title">Ορθή συνδεσμολογία</span>
                                            <span class="radio-card-desc">Όλα τα όργανα σε σειρά (<span class="math-expr"><i class="math-var">A</i><sub class="math-sub">1</sub></span>, <span class="math-expr"><i class="math-var">A</i><sub class="math-sub">2</sub></span>, <span class="math-expr"><i class="math-var">A</i><sub class="math-sub">3</sub></span>)</span>
                                        </div>
                                    </label>

                                    <label class="sim-radio-card warn ${state.faultInstrument === 'ammeter_parallel' ? 'active' : ''}">
                                        <input type="radio" name="sim-fault-instrument" value="ammeter_parallel" 
                                               ${state.faultInstrument === 'ammeter_parallel' ? 'checked' : ''} 
                                               onchange="CircuitSimulation.setFaultInstrument('ammeter_parallel')">
                                        <span class="radio-card-dot"></span>
                                        <div class="radio-card-content">
                                            <span class="radio-card-title"><strong>(1) Λανθασμένη τοποθέτηση αμπερομέτρου I</strong></span>
                                            <span class="radio-card-desc">Παράλληλα στην πηγή (Κόμβοι K − F) ➔ Ολικό Βραχυκύκλωμα!</span>
                                        </div>
                                    </label>

                                    <label class="sim-radio-card warn ${state.faultInstrument === 'ammeter2_parallel' ? 'active' : ''}">
                                        <input type="radio" name="sim-fault-instrument" value="ammeter2_parallel" 
                                               ${state.faultInstrument === 'ammeter2_parallel' ? 'checked' : ''} 
                                               onchange="CircuitSimulation.setFaultInstrument('ammeter2_parallel')">
                                        <span class="radio-card-dot"></span>
                                        <div class="radio-card-content">
                                            <span class="radio-card-title"><strong>(2) Λανθασμένη τοποθέτηση αμπερομέτρου II</strong></span>
                                            <span class="radio-card-desc">Παράλληλα στον <span class="math-expr"><i class="math-var">R</i><sub class="math-sub">2</sub></span> (Κόμβοι K − M) ➔ Βραχυκύκλωση <span class="math-expr"><i class="math-var">R</i><sub class="math-sub">2</sub></span></span>
                                        </div>
                                    </label>

                                    <label class="sim-radio-card warn ${state.faultInstrument === 'voltmeter_series' ? 'active' : ''}">
                                        <input type="radio" name="sim-fault-instrument" value="voltmeter_series" 
                                               ${state.faultInstrument === 'voltmeter_series' ? 'checked' : ''} 
                                               onchange="CircuitSimulation.setFaultInstrument('voltmeter_series')">
                                        <span class="radio-card-dot"></span>
                                        <div class="radio-card-content">
                                            <span class="radio-card-title"><strong>(3) Λανθασμένη τοποθέτηση βολτομέτρου</strong></span>
                                            <span class="radio-card-desc">Σύνδεση σε σειρά (στη θέση του <span class="math-expr"><i class="math-var">A</i><sub class="math-sub">1</sub></span>) ➔ <span class="math-expr"><i class="math-var">I</i> = 0 A</span></span>
                                        </div>
                                    </label>
                                </div>
                                    ${isFaultActive ? `
                                        <div class="sim-fault-lock-notice">
                                            <span>🔒</span>
                                            <span>Οι ολισθητές αντιστάσεων, οι διακόπτες βραχυκυκλώματος και καταστροφής έχουν κλειδωθεί για αποφυγή σύγχυσης κατά τη μελέτη του σφάλματος.</span>
                                        </div>
                                    ` : ''}
                            </div>
                        ` : `
                            <div class="sim-control-group sim-fault-group ${state.faultInstrument === 'ammeter_parallel' ? 'is-faulted' : (state.faultInstrument === 'ammeter2_parallel' ? 'is-partial' : (state.faultInstrument === 'voltmeter_series' ? 'is-series-vm' : ''))}" id="sim-fault-group">
                                <div class="sim-control-header">
                                    <span class="sim-group-title">
                                        <strong>⚠️ Τοποθέτηση Οργάνων</strong>
                                    </span>
                                    ${state.faultInstrument === 'ammeter_parallel' ? `
                                        <span class="danger-badge">Βραχυκύκλωμα</span>
                                    ` : state.faultInstrument === 'ammeter2_parallel' ? `
                                        <span class="warn-badge" style="background: rgba(245, 158, 11, 0.18); color: #f59e0b; border-color: rgba(245, 158, 11, 0.4);">Βραχυκύκλωση R₂</span>
                                    ` : state.faultInstrument === 'voltmeter_series' ? `
                                        <span class="warn-badge" style="background: rgba(168, 85, 247, 0.18); color: #c084fc; border-color: rgba(168, 85, 247, 0.4);">Διακοπή (Rv → ∞)</span>
                                    ` : `
                                        <span class="ok-badge">Ορθή Σύνδεση</span>
                                    `}
                                </div>
                                <div class="sim-fault-options-list">
                                    <label class="sim-radio-card ${state.faultInstrument === 'none' ? 'active' : ''}">
                                        <input type="radio" name="sim-fault-instrument" value="none" 
                                               ${state.faultInstrument === 'none' ? 'checked' : ''} 
                                               onchange="CircuitSimulation.setFaultInstrument('none')">
                                        <span class="radio-card-dot"></span>
                                        <div class="radio-card-content">
                                            <span class="radio-card-title">Ορθή συνδεσμολογία</span>
                                            <span class="radio-card-desc">Όλα τα όργανα στις κανονικές τους θέσεις</span>
                                        </div>
                                    </label>

                                    <label class="sim-radio-card warn ${state.faultInstrument === 'ammeter_parallel' ? 'active' : ''}">
                                        <input type="radio" name="sim-fault-instrument" value="ammeter_parallel" 
                                               ${state.faultInstrument === 'ammeter_parallel' ? 'checked' : ''} 
                                               onchange="CircuitSimulation.setFaultInstrument('ammeter_parallel')">
                                        <span class="radio-card-dot"></span>
                                        <div class="radio-card-content">
                                            <span class="radio-card-title"><strong>(1) Λανθασμένη τοποθέτηση αμπερομέτρου I</strong></span>
                                            <span class="radio-card-desc">Παράλληλα στην πηγή (Κόμβοι K − F) ➔ Ολικό Βραχυκύκλωμα!</span>
                                        </div>
                                    </label>

                                    <label class="sim-radio-card warn ${state.faultInstrument === 'ammeter2_parallel' ? 'active' : ''}">
                                        <input type="radio" name="sim-fault-instrument" value="ammeter2_parallel" 
                                               ${state.faultInstrument === 'ammeter2_parallel' ? 'checked' : ''} 
                                               onchange="CircuitSimulation.setFaultInstrument('ammeter2_parallel')">
                                        <span class="radio-card-dot"></span>
                                        <div class="radio-card-content">
                                            <span class="radio-card-title"><strong>(2) Λανθασμένη τοποθέτηση αμπερομέτρου II</strong></span>
                                            <span class="radio-card-desc">Κάθετα ανάμεσα στους <span class="math-expr"><i class="math-var">R</i><sub class="math-sub">1</sub></span> & <span class="math-expr"><i class="math-var">R</i><sub class="math-sub">2</sub></span> (Κόμβοι K − M) ➔ Βραχυκύκλωση</span>
                                        </div>
                                    </label>

                                    <label class="sim-radio-card warn ${state.faultInstrument === 'voltmeter_series' ? 'active' : ''}">
                                        <input type="radio" name="sim-fault-instrument" value="voltmeter_series" 
                                               ${state.faultInstrument === 'voltmeter_series' ? 'checked' : ''} 
                                               onchange="CircuitSimulation.setFaultInstrument('voltmeter_series')">
                                        <span class="radio-card-dot"></span>
                                        <div class="radio-card-content">
                                            <span class="radio-card-title"><strong>(3) Λανθασμένη τοποθέτηση βολτομέτρου</strong></span>
                                            <span class="radio-card-desc">Σε σειρά στον κύριο αγωγό (πριν το <span class="math-expr"><i class="math-var">A</i><sub class="math-sub">ολ</sub></span>) ➔ <span class="math-expr"><i class="math-var">I</i><sub class="math-sub">ολ</sub> = 0 A</span></span>
                                        </div>
                                    </label>
                                </div>
                                    ${isFaultActive ? `
                                        <div class="sim-fault-lock-notice">
                                            <span>🔒</span>
                                            <span>Οι ολισθητές αντιστάσεων, οι διακόπτες βραχυκυκλώματος και καταστροφής έχουν κλειδωθεί για αποφυγή σύγχυσης κατά τη μελέτη του σφάλματος.</span>
                                        </div>
                                    ` : ''}
                            </div>
                        `}

                        <!-- Harmless / Equipotential Connections -->
                        <div class="sim-control-group sim-harmless-group ${isFaultActive ? 'is-locked' : ''}" id="sim-harmless-group">
                            <div class="sim-control-header">
                                <span class="sim-group-title">
                                    <strong>🔗 Συνδέσεις που δεν προκαλούν βραχυκύκλωμα</strong>
                                </span>
                                ${isFaultActive ? `
                                    <span class="sim-locked-tag">🔒 Κλειδωμένο</span>
                                ` : state.harmlessConnection !== 'none' ? `
                                    <span class="ok-badge">Ισοδυναμική Σύνδεση</span>
                                ` : `
                                    <span class="ok-badge" style="opacity: 0.7;">Καμία Σύνδεση</span>
                                `}
                            </div>
                            <div class="sim-harmless-options-list">
                                ${state.topology === 'series' ? `
                                    <div class="sim-radio-card harmless ${isFaultActive ? 'is-disabled' : ''} ${state.harmlessConnection === 'series_GA' ? 'active' : ''}"
                                         onclick="${isFaultActive ? '' : `CircuitSimulation.setHarmlessConnection('series_GA')`}" role="button" tabindex="${isFaultActive ? '-1' : '0'}"
                                         title="${isFaultActive ? 'Κλειδωμένο κατά τη μελέτη σφάλματος τοποθέτησης οργάνου' : ''}">
                                        ${getHarmlessTogglePopup(state.harmlessConnection === 'series_GA')}
                                        <span class="radio-card-dot"></span>
                                        <div class="radio-card-content">
                                            <span class="radio-card-title"><strong>(1) Σύνδεση G με A</strong></span>
                                            <span class="radio-card-desc">Ενώνει 2 σημεία στο ίδιο δυναμικό (<span class="math-expr"><i class="math-var">V</i><sub class="math-sub">G</sub> = <i class="math-var">V</i><sub class="math-sub">A</sub> = <i class="math-var">V</i><sub class="math-sub">πηγ</sub></span>) ➔ Κανένα βραχυκύκλωμα!</span>
                                        </div>
                                    </div>

                                    <div class="sim-radio-card harmless ${isFaultActive ? 'is-disabled' : ''} ${state.harmlessConnection === 'series_FC' ? 'active' : ''}"
                                         onclick="${isFaultActive ? '' : `CircuitSimulation.setHarmlessConnection('series_FC')`}" role="button" tabindex="${isFaultActive ? '-1' : '0'}"
                                         title="${isFaultActive ? 'Κλειδωμένο κατά τη μελέτη σφάλματος τοποθέτησης οργάνου' : ''}">
                                        ${getHarmlessTogglePopup(state.harmlessConnection === 'series_FC')}
                                        <span class="radio-card-dot"></span>
                                        <div class="radio-card-content">
                                            <span class="radio-card-title"><strong>(2) Σύνδεση F με C</strong></span>
                                            <span class="radio-card-desc">Ενώνει 2 σημεία μηδενικού δυναμικού (<span class="math-expr"><i class="math-var">V</i><sub class="math-sub">F</sub> = <i class="math-var">V</i><sub class="math-sub">C</sub> = 0 V</span>) ➔ Κανένα βραχυκύκλωμα!</span>
                                        </div>
                                    </div>
                                ` : `
                                    <div class="sim-radio-card harmless ${isFaultActive ? 'is-disabled' : ''} ${state.harmlessConnection === 'parallel_AC' ? 'active' : ''}"
                                         onclick="${isFaultActive ? '' : `CircuitSimulation.setHarmlessConnection('parallel_AC')`}" role="button" tabindex="${isFaultActive ? '-1' : '0'}"
                                         title="${isFaultActive ? 'Κλειδωμένο κατά τη μελέτη σφάλματος τοποθέτησης οργάνου' : ''}">
                                        ${getHarmlessTogglePopup(state.harmlessConnection === 'parallel_AC')}
                                        <span class="radio-card-dot"></span>
                                        <div class="radio-card-content">
                                            <span class="radio-card-title"><strong>(1) Σύνδεση A με C</strong></span>
                                            <span class="radio-card-desc">Ενώνει 2 σημεία της ίδιας άνω γραμμής (<span class="math-expr"><i class="math-var">V</i><sub class="math-sub">A</sub> = <i class="math-var">V</i><sub class="math-sub">C</sub> = <i class="math-var">V</i><sub class="math-sub">πηγ</sub></span>) ➔ Κανένα βραχυκύκλωμα!</span>
                                        </div>
                                    </div>

                                    <div class="sim-radio-card harmless ${isFaultActive ? 'is-disabled' : ''} ${state.harmlessConnection === 'parallel_FE' ? 'active' : ''}"
                                         onclick="${isFaultActive ? '' : `CircuitSimulation.setHarmlessConnection('parallel_FE')`}" role="button" tabindex="${isFaultActive ? '-1' : '0'}"
                                         title="${isFaultActive ? 'Κλειδωμένο κατά τη μελέτη σφάλματος τοποθέτησης οργάνου' : ''}">
                                        ${getHarmlessTogglePopup(state.harmlessConnection === 'parallel_FE')}
                                        <span class="radio-card-dot"></span>
                                        <div class="radio-card-content">
                                            <span class="radio-card-title"><strong>(2) Σύνδεση F με E</strong></span>
                                            <span class="radio-card-desc">Ενώνει 2 σημεία της κοινής επιστροφής (<span class="math-expr"><i class="math-var">V</i><sub class="math-sub">F</sub> = <i class="math-var">V</i><sub class="math-sub">E</sub> = 0 V</span>) ➔ Κανένα βραχυκύκλωμα!</span>
                                        </div>
                                    </div>
                                `}
                            </div>
                        </div>

                        <!-- 4. Calculation Mode -->
                        <div class="sim-control-group sim-actions-group">
                            <div class="sim-steps-toggle-wrap" style="margin-top: 0;">
                                <label class="sim-toggle-checkbox">
                                    <input type="checkbox" id="sim-show-steps" ${state.showSteps ? 'checked' : ''} 
                                           onchange="CircuitSimulation.toggleShowSteps(this.checked)">
                                    <span class="checkbox-custom"></span>
                                    <span class="checkbox-label"><strong>📐 Αναλυτικά Βήματα Υπολογισμού</strong></span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <!-- Center & Right: Circuit Schematic & Live Inspector HUD -->
                    <div class="sim-display-column">
                        <!-- SVG Schematic Frame -->
                        <div class="sim-schematic-card" id="sim-schematic-card">
                            <div class="sim-schematic-header">
                                <div class="sim-circuit-status-chip ${phys.status}" id="sim-status-chip">
                                    <span class="chip-dot"></span>
                                    <span id="sim-status-text">${phys.statusText}</span>
                                </div>
                                <div style="display: flex; align-items: center; gap: 10px;">
                                    <div class="sim-instructions-badge">
                                        🔍 <em>Περάστε το ποντίκι πάνω από στοιχεία ή κόμβους για πληροφορίες</em>
                                    </div>
                                    <button class="sim-schematic-fs-btn" onclick="${state.isFullscreen ? 'CircuitSimulation.closeFullscreenModal()' : 'CircuitSimulation.openFullscreenModal()'}" title="${state.isFullscreen ? 'Έξοδος από πλήρη οθόνη (Esc)' : 'Πλήρης Οθόνη (Popup)'}">
                                        ${state.isFullscreen ? `
                                            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                <path d="M4 14h6m0 0v6m0-6L3 21m17-11h-6m0 0V4m0 6l7-7"/>
                                            </svg>
                                        ` : `
                                            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                <path d="M15 3h6v6m0-6L14 10M9 21H3v-6m0 6l7-7"/>
                                            </svg>
                                        `}
                                    </button>
                                </div>
                            </div>

                            <!-- Vector SVG Circuit Canvas -->
                            <div class="sim-svg-viewport" id="sim-svg-viewport">
                                <!-- Generated dynamically -->
                            </div>
                        </div>

                        <!-- Live Multimeter / Probe HUD -->
                        <div class="sim-hud-card" id="sim-hud-card">
                            <!-- Injected dynamically -->
                        </div>
                    </div>
                </div>

                <!-- Bottom Metrics Strip -->
                <div class="sim-metrics-strip" id="sim-metrics-strip">
                    <!-- Injected dynamically -->
                </div>
            </div>
        `;

        updateSvg();
        updateHud();
        updateMetrics();
        if (typeof triggerMathTypeset === 'function') {
            triggerMathTypeset(container);
        }
    }

    /**
     * Generate dynamic vector SVG circuit based on current topology & physics
     */
    function updateSvg() {
        const viewport = document.getElementById('sim-svg-viewport');
        if (!viewport) return;

        const phys = computePhysics();
        const isClosed = state.switchClosed;
        const isFaultAmmeter1 = state.faultInstrument === 'ammeter_parallel';
        const isFaultAmmeter2 = state.faultInstrument === 'ammeter2_parallel';
        const isFaultAmmeter = isFaultAmmeter1 || isFaultAmmeter2;
        const isFaultVoltmeter = state.faultInstrument === 'voltmeter_series';
        const isShortTotal = phys.status === 'total_short';
        const isBrokenSeries = state.topology === 'series' && (state.brokenR1 || state.brokenR2);
        const hasCurrent = isClosed && !isShortTotal && !isBrokenSeries && !isFaultVoltmeter && phys.I_total > 0;

        // Particle speed & dasharray
        const animSpeed = hasCurrent ? Math.max(0.6, Math.min(3.5, 4.5 / phys.I_total)).toFixed(2) : 0;
        const currentLineClass = hasCurrent ? 'wire-current-active' : 'wire-current-inactive';

        let svgHtml = '';

        if (state.topology === 'series') {
            svgHtml = `
                <svg viewBox="-20 -45 960 550" class="sim-svg-circuit" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <!-- Glow filter for active wires -->
                        <filter id="wire-glow" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="3.5" result="blur" />
                            <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                        <!-- Glow filter for short-circuit surge wire -->
                        <filter id="wire-glow-danger" x="-30%" y="-30%" width="160%" height="160%">
                            <feGaussianBlur stdDeviation="4.5" result="blur" />
                            <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                        <!-- Arrowhead marker for conventional current flow -->
                        <marker id="current-arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#38bdf8" />
                        </marker>
                        <!-- Arrowhead marker for short-circuit surge current -->
                        <marker id="current-arrow-short" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#ef4444" />
                        </marker>
                    </defs>

                    <!-- TOP SHORT-CIRCUIT ALERT BANNER -->
                    ${(isClosed && (isFaultAmmeter1 || phys.I_total === Infinity)) ? `
                        <g class="sim-top-danger-banner">
                            <rect x="330" y="-36" width="360" height="40" rx="10" class="sim-top-danger-rect" />
                            <text x="510" y="-11" class="sim-top-danger-text" text-anchor="middle">
                                ⚡ <tspan class="sim-math-sym">I</tspan> → ∞ (Βραχυκύκλωμα!)
                            </text>
                        </g>
                    ` : ''}

                    <!-- Background Base Wire Path (Gray) -->
                    <rect x="100" y="80" width="680" height="270" rx="16" ry="16" class="circuit-wire-base" />

                    <!-- Vertical Cable for Faulty Ammeter Cases -->
                    ${isFaultAmmeter1 ? `
                        <line x1="260" y1="80" x2="260" y2="350" class="circuit-wire-base wire-short-vertical" />
                    ` : ''}
                    ${isFaultAmmeter2 ? `
                        <line x1="495" y1="80" x2="495" y2="350" class="circuit-wire-base wire-short-vertical" />
                    ` : ''}

                    <!-- Active Animated Current Overlay Path -->
                    ${isFaultAmmeter1 ? `
                        ${isClosed ? `
                            <!-- Closed Short-Circuit Loop: Battery(+) -> Switch -> Knot K -> A1 -> Knot F -> Battery(-) -->
                            <path d="M 100 200 L 100 80 L 260 80 L 260 350 L 100 350 L 100 230" 
                                  class="circuit-wire-current wire-short-furious" />
                            <!-- Directional arrows in short-circuit loop -->
                            <path d="M 100 200 L 100 135" marker-end="url(#current-arrow-short)" class="flow-arrow-path short-arrow" />
                            <path d="M 205 80 L 245 80" marker-end="url(#current-arrow-short)" class="flow-arrow-path short-arrow" />
                            <path d="M 260 105 L 260 165" marker-end="url(#current-arrow-short)" class="flow-arrow-path short-arrow" />
                            <path d="M 260 260 L 260 320" marker-end="url(#current-arrow-short)" class="flow-arrow-path short-arrow" />
                            <path d="M 240 350 L 160 350" marker-end="url(#current-arrow-short)" class="flow-arrow-path short-arrow" />
                        ` : ''}
                    ` : isFaultAmmeter2 ? `
                        ${hasCurrent ? `
                            <!-- Closed Loop through R1 and A2: Battery(+) -> Switch -> A1 -> R1 -> Knot K -> A2 -> Knot M -> Battery(-) -->
                            <path d="M 100 200 L 100 80 L 495 80 L 495 350 L 100 350 L 100 230" 
                                  class="circuit-wire-current ${currentLineClass}" 
                                  style="animation-duration: ${animSpeed}s;" />
                            <!-- Directional arrows in R1-A2 loop -->
                            <path d="M 100 200 L 100 135" marker-end="url(#current-arrow)" class="flow-arrow-path" />
                            <path d="M 205 80 L 235 80" marker-end="url(#current-arrow)" class="flow-arrow-path" />
                            <path d="M 275 80 L 305 80" marker-end="url(#current-arrow)" class="flow-arrow-path" />
                            <path d="M 445 80 L 485 80" marker-end="url(#current-arrow)" class="flow-arrow-path" />
                            <path d="M 495 105 L 495 175" marker-end="url(#current-arrow)" class="flow-arrow-path" />
                            <path d="M 495 255 L 495 320" marker-end="url(#current-arrow)" class="flow-arrow-path" />
                            <path d="M 470 350 L 410 350" marker-end="url(#current-arrow)" class="flow-arrow-path" />
                            <path d="M 380 350 L 320 350" marker-end="url(#current-arrow)" class="flow-arrow-path" />
                            <path d="M 210 350 L 150 350" marker-end="url(#current-arrow)" class="flow-arrow-path" />
                        ` : ''}
                    ` : `
                        <rect x="100" y="80" width="680" height="270" rx="16" ry="16" 
                              class="circuit-wire-current ${currentLineClass}" 
                              style="animation-duration: ${animSpeed}s;" />
                        ${hasCurrent ? `
                            <path d="M 100 200 L 100 135" marker-end="url(#current-arrow)" class="flow-arrow-path" />
                            <path d="M 205 80 L 225 80" marker-end="url(#current-arrow)" class="flow-arrow-path" />
                            <path d="M 780 160 L 780 240" marker-end="url(#current-arrow)" class="flow-arrow-path" />
                            <path d="M 740 350 L 670 350" marker-end="url(#current-arrow)" class="flow-arrow-path" />
                            <path d="M 560 350 L 500 350" marker-end="url(#current-arrow)" class="flow-arrow-path" />
                            <path d="M 380 350 L 320 350" marker-end="url(#current-arrow)" class="flow-arrow-path" />
                            <path d="M 210 350 L 150 350" marker-end="url(#current-arrow)" class="flow-arrow-path" />
                        ` : ''}
                    `}

                    <!-- Informative warning badge when faulty ammeter/voltmeter is active (Relocated cleanly to bottom: y=415 to 477) -->
                    ${isFaultAmmeter1 ? `
                        <g class="sim-bypass-alert-badge">
                            <rect x="120" y="415" width="680" height="62" rx="14" class="sim-bypass-warning-banner" style="stroke: rgba(239, 68, 68, 0.75); fill: rgba(15, 23, 42, 0.96);" />
                            <text x="460" y="439" class="sim-bypass-warning-text" text-anchor="middle">
                                <tspan x="460" dy="0">${isClosed ? '⚡ Όλο το ρεύμα διαρρέει το <tspan class="sim-math-sym">A</tspan><tspan class="sim-math-sub" dy="3">1</tspan><tspan dy="-3"> (Βραχυκύκλωμα)</tspan>' : '⚪ Ανοικτός διακόπτης'}</tspan>
                                <tspan x="460" dy="24">${isClosed ? 'Στους αντιστάτες <tspan class="sim-math-sym">R</tspan><tspan class="sim-math-sub" dy="3">1</tspan><tspan dy="-3"> &amp; </tspan><tspan class="sim-math-sym">R</tspan><tspan class="sim-math-sub" dy="3">2</tspan><tspan dy="-3">: </tspan><tspan class="sim-math-sym">I</tspan> = 0 A (Πλήρης παράκαμψη)' : 'Το ρεύμα είναι μηδέν (<tspan class="sim-math-sym">I</tspan> = 0 A)'}</tspan>
                            </text>
                        </g>
                    ` : ''}
                    ${isFaultAmmeter2 ? `
                        <g class="sim-bypass-alert-badge">
                            <rect x="120" y="415" width="680" height="62" rx="14" class="sim-bypass-warning-banner" style="stroke: rgba(245, 158, 11, 0.75); fill: rgba(15, 23, 42, 0.96);" />
                            <text x="460" y="439" class="sim-bypass-warning-text" style="fill: #fcd34d;" text-anchor="middle">
                                <tspan x="460" dy="0">${isClosed ? '⚡ Το ρεύμα διαρρέει μόνο το <tspan class="sim-math-sym">R</tspan><tspan class="sim-math-sub" dy="3">1</tspan><tspan dy="-3"> και το </tspan><tspan class="sim-math-sym">A</tspan><tspan class="sim-math-sub" dy="3">2</tspan>' : '⚪ Ανοικτός διακόπτης'}</tspan>
                                <tspan x="460" dy="24">${isClosed ? 'Στους <tspan class="sim-math-sym">R</tspan><tspan class="sim-math-sub" dy="3">2</tspan><tspan dy="-3"> και </tspan><tspan class="sim-math-sym">A</tspan><tspan class="sim-math-sub" dy="3">3</tspan><tspan dy="-3">: </tspan><tspan class="sim-math-sym">I</tspan> = 0 A (Βραχυκύκλωση <tspan class="sim-math-sym">R</tspan><tspan class="sim-math-sub" dy="3">2</tspan><tspan dy="-3">)</tspan>' : 'Το ρεύμα είναι μηδέν (<tspan class="sim-math-sym">I</tspan> = 0 A)'}</tspan>
                            </text>
                        </g>
                    ` : ''}
                    ${isFaultVoltmeter ? `
                        <g class="sim-bypass-alert-badge">
                            <rect x="120" y="415" width="680" height="62" rx="14" class="sim-bypass-warning-banner" style="stroke: rgba(168, 85, 247, 0.75); fill: rgba(15, 23, 42, 0.96);" />
                            <text x="460" y="439" class="sim-bypass-warning-text" style="fill: #d8b4fe;" text-anchor="middle">
                                <tspan x="460" dy="0">${isClosed ? '⚠️ Το βολτόμετρο συνδέθηκε σε σειρά (<tspan class="sim-math-sym">R</tspan><tspan class="sim-math-sub" dy="3">v</tspan><tspan dy="-3"> → ∞)</tspan>' : '⚪ Ανοικτός διακόπτης'}</tspan>
                                <tspan x="460" dy="24">${isClosed ? 'Μηδενίζει το ρεύμα (<tspan class="sim-math-sym">I</tspan> = 0 A) &amp; τις τάσεις (<tspan class="sim-math-sym">V</tspan><tspan class="sim-math-sub" dy="3">1</tspan><tspan dy="-3"> = </tspan><tspan class="sim-math-sym">V</tspan><tspan class="sim-math-sub" dy="3">2</tspan><tspan dy="-3"> = 0 V)</tspan>' : 'Το ρεύμα είναι μηδέν (<tspan class="sim-math-sym">I</tspan> = 0 A)'}</tspan>
                            </text>
                        </g>
                    ` : ''}

                    <!-- 1. VOLTMETER Vπηγ across DC Source (Left side: x=42, y=215) -->
                    <g class="comp-interactive comp-voltmeter" data-probe="voltmeter_src"
                       onmouseenter="CircuitSimulation.hoverProbe('voltmeter_src')" 
                       onmouseleave="CircuitSimulation.hoverProbe(null)"
                       onclick="CircuitSimulation.selectProbe('voltmeter_src')">
                        <!-- Probe leads to battery terminals -->
                        <path d="M 42 197 L 42 160 L 100 160" class="voltmeter-lead" />
                        <path d="M 42 233 L 42 270 L 100 270" class="voltmeter-lead" />
                        <circle cx="100" cy="160" r="3.5" class="voltmeter-contact-dot" />
                        <circle cx="100" cy="270" r="3.5" class="voltmeter-contact-dot" />
                        <!-- Voltmeter Instrument Body -->
                        <circle cx="42" cy="215" r="18.5" class="voltmeter-circle" />
                        <text x="42" y="215" class="voltmeter-text"><tspan font-style="italic">V</tspan><tspan font-size="0.7em" dy="2">πηγ</tspan></text>
                        <text x="42" y="250" class="voltmeter-reading-tag">${state.V_src} V</text>
                    </g>

                    <!-- 2. DC VOLTAGE SOURCE (BATTERY) at Left (x=100, y=215) -->
                    <g class="comp-interactive comp-source" data-probe="source" 
                       onmouseenter="CircuitSimulation.hoverProbe('source')" 
                       onmouseleave="CircuitSimulation.hoverProbe(null)"
                       onclick="CircuitSimulation.selectProbe('source')">
                        <rect x="70" y="160" width="60" height="110" class="comp-hitbox" />
                        <line x1="78" y1="200" x2="122" y2="200" class="battery-plate positive" />
                        <line x1="88" y1="230" x2="112" y2="230" class="battery-plate negative" />
                        <text x="132" y="196" class="comp-label bold text-positive">+</text>
                        <text x="132" y="235" class="comp-label bold text-negative">−</text>
                    </g>

                    <!-- NODE G (x=100, y=80) - Above Source -->
                    <g class="circuit-node-group" onmouseenter="CircuitSimulation.hoverProbe('nodeG')" onmouseleave="CircuitSimulation.hoverProbe(null)" onclick="CircuitSimulation.selectProbe('nodeG')">
                        <circle cx="100" cy="80" r="14" class="comp-hitbox" fill="transparent" />
                        <circle cx="100" cy="80" r="4" class="circuit-node-dot" />
                        <text x="100" y="65" class="node-letter">G</text>
                    </g>

                    <!-- 3. SWITCH K at Top-Left (x=145 to x=205, y=80) -->
                    <g class="comp-interactive comp-switch" data-probe="switch"
                       onmouseenter="CircuitSimulation.hoverProbe('switch')" 
                       onmouseleave="CircuitSimulation.hoverProbe(null)"
                       onclick="CircuitSimulation.toggleSwitch()">
                        <rect x="135" y="45" width="80" height="70" class="comp-hitbox" />
                        <circle cx="145" cy="80" r="4.5" class="terminal-dot" />
                        <circle cx="205" cy="80" r="4.5" class="terminal-dot" />
                        ${isClosed ? `
                            <line x1="145" y1="80" x2="205" y2="80" class="switch-blade closed" />
                        ` : `
                            <line x1="145" y1="80" x2="195" y2="52" class="switch-blade open" />
                        `}
                        <text x="175" y="40" class="comp-title-tag">Διακόπτης K</text>
                    </g>

                    <!-- 4. AMMETER A1 / KNOT K / SERIES VOLTMETER SETUP -->
                    ${isFaultAmmeter1 ? `
                        <!-- KNOT K (x=260, y=80) - In A1's previous location -->
                        <g class="circuit-node-group node-knot-group" onmouseenter="CircuitSimulation.hoverProbe('nodeK')" onmouseleave="CircuitSimulation.hoverProbe(null)" onclick="CircuitSimulation.selectProbe('nodeK')">
                            <circle cx="260" cy="80" r="14" class="comp-hitbox" fill="transparent" />
                            <circle cx="260" cy="80" r="5" class="circuit-node-dot knot-k-dot" />
                            <text x="260" y="65" class="node-letter knot-k-letter">K</text>
                        </g>

                        <!-- AMMETER A1 (Perpendicular in the middle of cable joining K and F: x=260, y=215) -->
                        <g class="comp-interactive comp-meter faulty-ammeter" data-probe="ammeter1"
                           onmouseenter="CircuitSimulation.hoverProbe('ammeter1')" 
                           onmouseleave="CircuitSimulation.hoverProbe(null)"
                           onclick="CircuitSimulation.selectProbe('ammeter1')">
                            <rect x="225" y="175" width="70" height="80" class="comp-hitbox" />
                            <circle cx="260" cy="215" r="21" class="meter-circle meter-faulty ${isClosed ? 'short-alarm' : ''}" />
                            <text x="260" y="215" class="meter-text faulty-text">A₁</text>
                            <text x="260" y="250" class="meter-reading-tag danger-reading">
                                ${!isClosed ? '0.00 A' : '∞ A'}
                            </text>
                        </g>
                    ` : isFaultVoltmeter ? `
                        <!-- 4. VOLTMETER CONNECTED IN SERIES (REPLACES A1: x=255, y=80) -->
                        <g class="comp-interactive comp-voltmeter faulty-voltmeter" data-probe="voltmeter_series"
                           onmouseenter="CircuitSimulation.hoverProbe('voltmeter_series')" 
                           onmouseleave="CircuitSimulation.hoverProbe(null)"
                           onclick="CircuitSimulation.selectProbe('voltmeter_series')">
                            <rect x="230" y="55" width="50" height="65" class="comp-hitbox" />
                            <circle cx="255" cy="80" r="18.5" class="voltmeter-circle meter-faulty-purple" />
                            <text x="255" y="80" class="voltmeter-text faulty-text-purple"><tspan font-style="italic">V</tspan><tspan font-size="0.75em" dy="2">σ</tspan></text>
                            <text x="255" y="115" class="meter-reading-tag purple-reading">${!isClosed ? '0.0 V' : phys.V_src.toFixed(1) + ' V'}</text>
                        </g>
                    ` : `
                        <!-- 4. AMMETER A1 at Top (before R1: x=255, y=80) -->
                        <g class="comp-interactive comp-meter" data-probe="ammeter1"
                           onmouseenter="CircuitSimulation.hoverProbe('ammeter1')" 
                           onmouseleave="CircuitSimulation.hoverProbe(null)"
                           onclick="CircuitSimulation.selectProbe('ammeter1')">
                            <rect x="235" y="55" width="45" height="65" class="comp-hitbox" />
                            <circle cx="255" cy="80" r="18.5" class="meter-circle" />
                            <text x="255" y="80" class="meter-text">A₁</text>
                            <text x="255" y="115" class="meter-reading-tag">${phys.I_total.toFixed(2)} A</text>
                        </g>
                    `}

                    <!-- NODE A (x=310, y=80) -->
                    <g class="circuit-node-group" onmouseenter="CircuitSimulation.hoverProbe('nodeA')" onmouseleave="CircuitSimulation.hoverProbe(null)" onclick="CircuitSimulation.selectProbe('nodeA')">
                        <circle cx="310" cy="80" r="14" class="comp-hitbox" fill="transparent" />
                        <circle cx="310" cy="80" r="4" class="circuit-node-dot" />
                        <text x="310" y="65" class="node-letter">A</text>
                    </g>

                    <!-- 5. RESISTOR R1 (x=340 to x=440, y=80) -->
                    <g class="comp-interactive comp-resistor ${state.shortR1 ? 'is-shorted' : ''} ${state.brokenR1 ? 'is-broken' : ''}" data-probe="R1"
                       onmouseenter="CircuitSimulation.hoverProbe('R1')" 
                       onmouseleave="CircuitSimulation.hoverProbe(null)"
                       onclick="CircuitSimulation.selectProbe('R1')">
                        <rect x="330" y="35" width="120" height="90" class="comp-hitbox" />
                        <text x="390" y="53" class="comp-resistor-top" text-anchor="middle"><tspan font-style="italic">R</tspan><tspan font-size="0.75em" dy="3">1</tspan><tspan dy="-3"> = ${state.R1} Ω</tspan></text>
                        
                        ${state.brokenR1 ? `
                            <!-- Broken Resistor Split in Two with Gap & Red Crack Symbol -->
                            <rect x="340" y="68" width="44" height="24" rx="3" class="resistor-body broken" />
                            <rect x="396" y="68" width="44" height="24" rx="3" class="resistor-body broken" />
                            <text x="362" y="80" class="resistor-inner-text" style="font-size: 14.5px;"><tspan font-style="italic">R</tspan><tspan font-size="0.75em" dy="3">1</tspan></text>
                            <path d="M 388 64 L 396 96 M 396 64 L 388 96" class="resistor-crack-symbol" />
                            <text x="390" y="118" class="broken-badge-text" text-anchor="middle">💥 ΚΑΤΑΣΤΡΟΦΗ</text>
                        ` : `
                            <!-- Normal / Shorted Resistor Box -->
                            <rect x="345" y="68" width="90" height="24" rx="4" class="resistor-body ${state.shortR1 ? 'shorted' : ''}" />
                            <text x="390" y="80" class="resistor-inner-text"><tspan font-style="italic">R</tspan><tspan font-size="0.75em" dy="3">1</tspan></text>
                            <text x="390" y="118" class="comp-resistor-bottom" text-anchor="middle">${state.shortR1 ? '<tspan font-style="italic">V</tspan><tspan font-size="0.75em" dy="3">1</tspan><tspan dy="-3"> = 0.0 V (0 Ω)</tspan>' : `<tspan font-style="italic">V</tspan><tspan font-size="0.75em" dy="3">1</tspan><tspan dy="-3"> = ${phys.V1.toFixed(1)} V</tspan>`}</text>
                        `}

                        <!-- Bypass Wire if shorted -->
                        ${state.shortR1 ? (state.shortModeR1 === 'alternative' ? `
                            <!-- Alternative Equipotential Bypass: G(100, 80) to B(545, 80) wiggly shaped underneath R1 -->
                            <path d="M 100 80 C 130 140, 160 235, 210 235 C 255 235, 280 252, 320 252 C 360 252, 390 232, 430 232 C 475 232, 510 248, 532 238 C 545 225, 545 130, 545 80" class="short-circuit-bypass-wire" />
                            ${hasCurrent ? `
                                <path d="M 100 80 C 130 140, 160 235, 210 235 C 255 235, 280 252, 320 252 C 360 252, 390 232, 430 232 C 475 232, 510 248, 532 238 C 545 225, 545 130, 545 80" class="circuit-wire-current wire-current-active bypass-current" style="animation-duration: ${animSpeed}s;" />
                            ` : ''}
                            <circle cx="100" cy="80" r="5.5" class="short-contact-dot" />
                            <circle cx="545" cy="80" r="5.5" class="short-contact-dot" />
                            <text x="345" y="274" class="short-wire-label" text-anchor="middle">⚠️ Έμμεση Παράκαμψη R₁ (G ↔ B)</text>
                        ` : `
                            <!-- Classic Bypass: A(310, 80) to post-R1(470, 80) -->
                            <path d="M 310 80 C 335 22, 445 22, 470 80" class="short-circuit-bypass-wire" />
                            ${hasCurrent ? `
                                <path d="M 310 80 C 335 22, 445 22, 470 80" class="circuit-wire-current wire-current-active bypass-current" style="animation-duration: ${animSpeed}s;" />
                            ` : ''}
                            <circle cx="310" cy="80" r="4.5" class="short-contact-dot" />
                            <circle cx="470" cy="80" r="4.5" class="short-contact-dot" />
                            <text x="390" y="20" class="short-wire-label">⚠️ Άμεση Παράκαμψη R₁ (A ↔ B)</text>
                        `) : ''}
                    </g>

                    <!-- 6. VOLTMETER V1 across Resistor R1 (inside loop: x=390, y=170) -->
                    <g class="comp-interactive comp-voltmeter" data-probe="voltmeter1"
                       onmouseenter="CircuitSimulation.hoverProbe('voltmeter1')" 
                       onmouseleave="CircuitSimulation.hoverProbe(null)"
                       onclick="CircuitSimulation.selectProbe('voltmeter1')">
                        <path d="M 373 170 L 310 170 L 310 80" class="voltmeter-lead" />
                        <path d="M 407 170 L 470 170 L 470 80" class="voltmeter-lead" />
                        <circle cx="310" cy="80" r="3.5" class="voltmeter-contact-dot" />
                        <circle cx="470" cy="80" r="3.5" class="voltmeter-contact-dot" />
                        <circle cx="390" cy="170" r="18.5" class="voltmeter-circle" />
                        <text x="390" y="170" class="voltmeter-text"><tspan font-style="italic">V</tspan><tspan font-size="0.75em" dy="2">1</tspan></text>
                        <text x="390" y="204" class="voltmeter-reading-tag">${phys.V1.toFixed(1)} V</text>
                    </g>

                    <!-- 7. AMMETER A2 / KNOT K SETUP -->
                    ${isFaultAmmeter2 ? `
                        <!-- KNOT K (x=495, y=80) - In A2's previous location -->
                        <g class="circuit-node-group node-knot-group" onmouseenter="CircuitSimulation.hoverProbe('nodeK')" onmouseleave="CircuitSimulation.hoverProbe(null)" onclick="CircuitSimulation.selectProbe('nodeK')">
                            <circle cx="495" cy="80" r="14" class="comp-hitbox" fill="transparent" />
                            <circle cx="495" cy="80" r="5" class="circuit-node-dot knot-k-dot" />
                            <text x="495" y="65" class="node-letter knot-k-letter">K</text>
                        </g>

                        <!-- AMMETER A2 (Perpendicular in the middle of cable joining K and M: x=495, y=215) -->
                        <g class="comp-interactive comp-meter faulty-ammeter" data-probe="ammeter2"
                           onmouseenter="CircuitSimulation.hoverProbe('ammeter2')" 
                           onmouseleave="CircuitSimulation.hoverProbe(null)"
                           onclick="CircuitSimulation.selectProbe('ammeter2')">
                            <rect x="465" y="175" width="60" height="80" class="comp-hitbox" />
                            <circle cx="495" cy="215" r="21" class="meter-circle meter-faulty-orange" />
                            <text x="495" y="215" class="meter-text faulty-text-orange">A₂</text>
                            <text x="495" y="250" class="meter-reading-tag warning-reading">
                                ${!isClosed ? '0.00 A' : (phys.I_A2 !== undefined ? phys.I_A2.toFixed(2) : phys.I_total.toFixed(2)) + ' A'}
                            </text>
                        </g>
                    ` : `
                        <g class="comp-interactive comp-meter" data-probe="ammeter2"
                           onmouseenter="CircuitSimulation.hoverProbe('ammeter2')" 
                           onmouseleave="CircuitSimulation.hoverProbe(null)"
                           onclick="CircuitSimulation.selectProbe('ammeter2')">
                            <rect x="475" y="55" width="45" height="65" class="comp-hitbox" />
                            <circle cx="495" cy="80" r="18.5" class="meter-circle" />
                            <text x="495" y="80" class="meter-text">A₂</text>
                            <text x="495" y="115" class="meter-reading-tag">${(phys.I_A2 !== undefined ? phys.I_A2 : phys.I_total).toFixed(2)} A</text>
                        </g>
                    `}

                    <!-- NODE B (x=545, y=80) -->
                    <g class="circuit-node-group" onmouseenter="CircuitSimulation.hoverProbe('nodeB')" onmouseleave="CircuitSimulation.hoverProbe(null)" onclick="CircuitSimulation.selectProbe('nodeB')">
                        <circle cx="545" cy="80" r="14" class="comp-hitbox" fill="transparent" />
                        <circle cx="545" cy="80" r="4" class="circuit-node-dot" />
                        <text x="545" y="65" class="node-letter">B</text>
                    </g>

                    <!-- 8. RESISTOR R2 (x=570 to x=670, y=80) -->
                    <g class="comp-interactive comp-resistor ${state.shortR2 ? 'is-shorted' : ''} ${state.brokenR2 ? 'is-broken' : ''}" data-probe="R2"
                       onmouseenter="CircuitSimulation.hoverProbe('R2')" 
                       onmouseleave="CircuitSimulation.hoverProbe(null)"
                       onclick="CircuitSimulation.selectProbe('R2')">
                        <rect x="560" y="35" width="120" height="90" class="comp-hitbox" />
                        <text x="620" y="53" class="comp-resistor-top" text-anchor="middle"><tspan font-style="italic">R</tspan><tspan font-size="0.75em" dy="3">2</tspan><tspan dy="-3"> = ${state.R2} Ω</tspan></text>
                        
                        ${state.brokenR2 ? `
                            <rect x="570" y="68" width="44" height="24" rx="3" class="resistor-body broken" />
                            <rect x="626" y="68" width="44" height="24" rx="3" class="resistor-body broken" />
                            <text x="592" y="80" class="resistor-inner-text" style="font-size: 14.5px;"><tspan font-style="italic">R</tspan><tspan font-size="0.75em" dy="3">2</tspan></text>
                            <path d="M 618 64 L 626 96 M 626 64 L 618 96" class="resistor-crack-symbol" />
                            <text x="620" y="118" class="broken-badge-text" text-anchor="middle">💥 ΚΑΤΑΣΤΡΟΦΗ</text>
                        ` : `
                            <rect x="575" y="68" width="90" height="24" rx="4" class="resistor-body ${state.shortR2 ? 'shorted' : ''}" />
                            <text x="620" y="80" class="resistor-inner-text"><tspan font-style="italic">R</tspan><tspan font-size="0.75em" dy="3">2</tspan></text>
                            <text x="620" y="118" class="comp-resistor-bottom" text-anchor="middle">${state.shortR2 ? '<tspan font-style="italic">V</tspan><tspan font-size="0.75em" dy="3">2</tspan><tspan dy="-3"> = 0.0 V (0 Ω)</tspan>' : `<tspan font-style="italic">V</tspan><tspan font-size="0.75em" dy="3">2</tspan><tspan dy="-3"> = ${phys.V2.toFixed(1)} V</tspan>`}</text>
                        `}

                        ${state.shortR2 ? (state.shortModeR2 === 'alternative' ? `
                            <!-- Alternative Equipotential Bypass: B(545, 80) to E(620, 350) through central open space -->
                            <path d="M 545 80 C 530 160, 560 270, 620 350" class="short-circuit-bypass-wire" />
                            ${hasCurrent ? `
                                <path d="M 545 80 C 530 160, 560 270, 620 350" class="circuit-wire-current wire-current-active bypass-current" style="animation-duration: ${animSpeed}s;" />
                            ` : ''}
                            <circle cx="545" cy="80" r="5" class="short-contact-dot" />
                            <circle cx="620" cy="350" r="5" class="short-contact-dot" />
                            <text x="540" y="225" class="short-wire-label" text-anchor="middle">⚠️ Έμμεση Παράκαμψη R₂ (B ↔ E)</text>
                        ` : `
                            <!-- Classic Bypass: B(545, 80) to C(700, 80) -->
                            <path d="M 545 80 C 570 22, 675 22, 700 80" class="short-circuit-bypass-wire" />
                            ${hasCurrent ? `
                                <path d="M 545 80 C 570 22, 675 22, 700 80" class="circuit-wire-current wire-current-active bypass-current" style="animation-duration: ${animSpeed}s;" />
                            ` : ''}
                            <circle cx="545" cy="80" r="4.5" class="short-contact-dot" />
                            <circle cx="700" cy="80" r="4.5" class="short-contact-dot" />
                            <text x="620" y="20" class="short-wire-label">⚠️ Άμεση Παράκαμψη R₂ (B ↔ C)</text>
                        `) : ''}
                    </g>

                    <!-- 9. VOLTMETER V2 across Resistor R2 (inside loop: x=620, y=170) -->
                    <g class="comp-interactive comp-voltmeter" data-probe="voltmeter2"
                       onmouseenter="CircuitSimulation.hoverProbe('voltmeter2')" 
                       onmouseleave="CircuitSimulation.hoverProbe(null)"
                       onclick="CircuitSimulation.selectProbe('voltmeter2')">
                        <path d="M 603 170 L 545 170 L 545 80" class="voltmeter-lead" />
                        <path d="M 637 170 L 700 170 L 700 80" class="voltmeter-lead" />
                        <circle cx="545" cy="80" r="3.5" class="voltmeter-contact-dot" />
                        <circle cx="700" cy="80" r="3.5" class="voltmeter-contact-dot" />
                        <circle cx="620" cy="170" r="18.5" class="voltmeter-circle" />
                        <text x="620" y="170" class="voltmeter-text"><tspan font-style="italic">V</tspan><tspan font-size="0.75em" dy="2">2</tspan></text>
                        <text x="620" y="204" class="voltmeter-reading-tag">${phys.V2.toFixed(1)} V</text>
                    </g>

                    <!-- 10. AMMETER A3 at Top (after R2: x=725, y=80) -->
                    <g class="comp-interactive comp-meter" data-probe="ammeter3"
                       onmouseenter="CircuitSimulation.hoverProbe('ammeter3')" 
                       onmouseleave="CircuitSimulation.hoverProbe(null)"
                       onclick="CircuitSimulation.selectProbe('ammeter3')">
                        <rect x="705" y="55" width="45" height="65" class="comp-hitbox" />
                        <circle cx="725" cy="80" r="18.5" class="meter-circle" />
                        <text x="725" y="80" class="meter-text">A₃</text>
                        <text x="725" y="115" class="meter-reading-tag">${(phys.I_A3 !== undefined ? phys.I_A3 : phys.I_total).toFixed(2)} A</text>
                    </g>

                    <!-- NODE C (x=780, y=80) -->
                    <g class="circuit-node-group" onmouseenter="CircuitSimulation.hoverProbe('nodeC')" onmouseleave="CircuitSimulation.hoverProbe(null)" onclick="CircuitSimulation.selectProbe('nodeC')">
                        <circle cx="780" cy="80" r="14" class="comp-hitbox" fill="transparent" />
                        <circle cx="780" cy="80" r="4" class="circuit-node-dot" />
                        <text x="780" y="65" class="node-letter">C</text>
                    </g>

                    <!-- Wire Probe Zones (Hovering plain wires) -->
                    <g class="wire-probe-zone" onmouseenter="CircuitSimulation.hoverProbe('wireMain')" onmouseleave="CircuitSimulation.hoverProbe(null)">
                        <rect x="765" y="130" width="30" height="150" class="probe-wire-hitbox" />
                        <rect x="120" y="335" width="110" height="30" class="probe-wire-hitbox" />
                        <rect x="670" y="335" width="90" height="30" class="probe-wire-hitbox" />
                    </g>

                    <!-- NODE F (x=260, y=350) - Left of Ground D / Landing of Vertical Cable -->
                    <g class="circuit-node-group ${isFaultAmmeter1 ? 'node-knot-group' : ''}" onmouseenter="CircuitSimulation.hoverProbe('nodeF')" onmouseleave="CircuitSimulation.hoverProbe(null)" onclick="CircuitSimulation.selectProbe('nodeF')">
                        <circle cx="260" cy="350" r="14" class="comp-hitbox" fill="transparent" />
                        <circle cx="260" cy="350" r="${isFaultAmmeter1 ? 5 : 4}" class="circuit-node-dot ${isFaultAmmeter1 ? 'knot-f-dot' : ''}" />
                        <text x="260" y="335" class="node-letter ${isFaultAmmeter1 ? 'knot-f-letter' : ''}">F</text>
                    </g>

                    <!-- NODE D (GROUND) at Bottom (x=440, y=350) -->
                    <g class="circuit-node-group" onmouseenter="CircuitSimulation.hoverProbe('nodeD')" onmouseleave="CircuitSimulation.hoverProbe(null)" onclick="CircuitSimulation.selectProbe('nodeD')">
                        <circle cx="440" cy="350" r="14" class="comp-hitbox" fill="transparent" />
                        <circle cx="440" cy="350" r="4" class="circuit-node-dot" />
                        <!-- Ground symbol lines -->
                        <line x1="440" y1="350" x2="440" y2="385" class="ground-stem" />
                        <line x1="425" y1="385" x2="455" y2="385" class="ground-line" />
                        <line x1="430" y1="390" x2="450" y2="390" class="ground-line" />
                        <line x1="435" y1="395" x2="445" y2="395" class="ground-line" />
                        <text x="462" y="380" class="node-letter ground-label" text-anchor="start">D (0 V)</text>
                    </g>

                    <!-- KNOT M (x=495, y=350) - Landing of Vertical Cable from A2 -->
                    ${isFaultAmmeter2 ? `
                        <g class="circuit-node-group node-knot-group" onmouseenter="CircuitSimulation.hoverProbe('nodeM')" onmouseleave="CircuitSimulation.hoverProbe(null)" onclick="CircuitSimulation.selectProbe('nodeM')">
                            <circle cx="495" cy="350" r="14" class="comp-hitbox" fill="transparent" />
                            <circle cx="495" cy="350" r="5" class="circuit-node-dot knot-m-dot" />
                            <text x="512" y="342" class="node-letter knot-m-letter">M</text>
                        </g>
                    ` : ''}

                    <!-- NODE E (x=620, y=350) - Right of Ground D -->
                    <g class="circuit-node-group" onmouseenter="CircuitSimulation.hoverProbe('nodeE')" onmouseleave="CircuitSimulation.hoverProbe(null)" onclick="CircuitSimulation.selectProbe('nodeE')">
                        <circle cx="620" cy="350" r="14" class="comp-hitbox" fill="transparent" />
                        <circle cx="620" cy="350" r="4" class="circuit-node-dot" />
                        <text x="620" y="335" class="node-letter">E</text>
                    </g>

                    <!-- Harmless Equipotential Connection Wire Overlays (Series) -->
                    ${state.harmlessConnection === 'series_GA' ? `
                        <g class="comp-interactive comp-harmless-wire" data-probe="harmless_wire"
                           onmouseenter="CircuitSimulation.hoverProbe('harmless_wire')" 
                           onmouseleave="CircuitSimulation.hoverProbe(null)"
                           onclick="CircuitSimulation.selectProbe('harmless_wire')">
                            <!-- Cable connecting G(100, 80) and A(310, 80) with 90px clearance above rail (at y=-10) -->
                            <path d="M 100 80 L 100 2 Q 100 -10, 112 -10 L 298 -10 Q 310 -10, 310 2 L 310 80" class="harmless-bypass-wire" />
                            <circle cx="100" cy="80" r="5" class="harmless-contact-dot" />
                            <circle cx="310" cy="80" r="5" class="harmless-contact-dot" />

                            <!-- Prominent Explanatory Banner in Central Open Space (Double Font Size) -->
                            <rect x="190" y="240" width="560" height="74" rx="14" class="harmless-center-banner" />
                            <text x="470" y="268" class="harmless-banner-title" text-anchor="middle">✅ Ακίνδυνη Σύνδεση: G ↔ A</text>
                            <text x="470" y="295" class="harmless-banner-sub" text-anchor="middle">Ισοδυναμικά σημεία: <tspan class="sim-math-sym">V</tspan><tspan class="sim-math-sub" dy="2">G</tspan><tspan dy="-2"> = </tspan><tspan class="sim-math-sym">V</tspan><tspan class="sim-math-sub" dy="2">A</tspan><tspan dy="-2"> = </tspan><tspan class="sim-math-sym">V</tspan><tspan class="sim-math-sub" dy="2">πηγ</tspan><tspan dy="-2"> — Χωρίς Βραχυκύκλωμα</tspan></text>
                        </g>
                    ` : ''}

                    ${state.harmlessConnection === 'series_FC' ? `
                        <g class="comp-interactive comp-harmless-wire" data-probe="harmless_wire"
                           onmouseenter="CircuitSimulation.hoverProbe('harmless_wire')" 
                           onmouseleave="CircuitSimulation.hoverProbe(null)"
                           onclick="CircuitSimulation.selectProbe('harmless_wire')">
                            <!-- Cable connecting F(260, 350) and C(780, 80) around the perimeter at y=425 (below ground D) -->
                            <path d="M 780 80 L 820 80 Q 830 80, 830 92 L 830 415 Q 830 425, 818 425 L 272 425 Q 260 425, 260 415 L 260 350" class="harmless-bypass-wire" />
                            <circle cx="780" cy="80" r="5" class="harmless-contact-dot" />
                            <circle cx="260" cy="350" r="5" class="harmless-contact-dot" />

                            <!-- Prominent Explanatory Banner in Central Open Space (Double Font Size) -->
                            <rect x="190" y="240" width="560" height="74" rx="14" class="harmless-center-banner" />
                            <text x="470" y="268" class="harmless-banner-title" text-anchor="middle">✅ Ακίνδυνη Σύνδεση: F ↔ C</text>
                            <text x="470" y="295" class="harmless-banner-sub" text-anchor="middle">Κοινός αγωγός επιστροφής: <tspan class="sim-math-sym">V</tspan><tspan class="sim-math-sub" dy="2">F</tspan><tspan dy="-2"> = </tspan><tspan class="sim-math-sym">V</tspan><tspan class="sim-math-sub" dy="2">C</tspan><tspan dy="-2"> = 0 V — Χωρίς Βραχυκύκλωμα</tspan></text>
                        </g>
                    ` : ''}
                </svg>
            `;
        } else {
            // PARALLEL CIRCUIT SVG (Σχήμα 2 - Vertical Resistors with Meters & Fault Options)
            const hasCurrent1 = hasCurrent && !state.brokenR1 && phys.I1 > 0;
            const hasCurrent2 = hasCurrent && !state.brokenR2 && phys.I2 > 0;
            const animSpeed1 = hasCurrent1 ? (3 / Math.max(0.2, phys.I1)).toFixed(2) : 0;
            const animSpeed2 = hasCurrent2 ? (3 / Math.max(0.2, phys.I2)).toFixed(2) : 0;

            svgHtml = `
                <svg viewBox="-20 -45 960 550" class="sim-svg-circuit" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <!-- Glow filter for active wires -->
                        <filter id="wire-glow-par" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="3.5" result="blur" />
                            <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                        <!-- Glow filter for short-circuit surge wire -->
                        <filter id="wire-glow-danger-par" x="-30%" y="-30%" width="160%" height="160%">
                            <feGaussianBlur stdDeviation="4.5" result="blur" />
                            <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                        <!-- Arrowhead marker for conventional current flow -->
                        <marker id="current-arrow-par" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#38bdf8" />
                        </marker>
                        <!-- Arrowhead marker for short-circuit surge current -->
                        <marker id="current-arrow-short-par" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#ef4444" />
                        </marker>
                    </defs>

                    <!-- TOP SHORT-CIRCUIT ALERT BANNER -->
                    ${(isClosed && (isFaultAmmeter1 || isFaultAmmeter2 || phys.I_total === Infinity)) ? `
                        <g class="sim-top-danger-banner">
                            <rect x="330" y="-36" width="360" height="40" rx="10" class="sim-top-danger-rect" />
                            <text x="510" y="-11" class="sim-top-danger-text" text-anchor="middle">
                                ⚡ <tspan class="sim-math-sym">I</tspan> → ∞ (Βραχυκύκλωμα!)
                            </text>
                        </g>
                    ` : ''}

                    <!-- Base Wire Framework (Gray) -->
                    <!-- Outer loop: G(100,80) -> C(640,80) -> E(640,350) -> F(100,350) -> battery -->
                    <path d="M 100 200 L 100 80 L 640 80 L 640 350 L 100 350 L 100 230" class="circuit-wire-base" />
                    <!-- Branch 1 (Vertical from A to B at x=380) -->
                    <line x1="380" y1="80" x2="380" y2="350" class="circuit-wire-base" />

                    <!-- Vertical Cable for Faulty Ammeter Cases -->
                    ${isFaultAmmeter1 ? `
                        <line x1="260" y1="80" x2="260" y2="350" class="circuit-wire-base wire-short-vertical" />
                    ` : ''}
                    ${isFaultAmmeter2 ? `
                        <line x1="545" y1="80" x2="545" y2="350" class="circuit-wire-base wire-short-vertical" />
                    ` : ''}

                    <!-- Active Animated Current Overlay Paths -->
                    ${isFaultAmmeter1 ? `
                        ${isClosed ? `
                            <!-- Closed Short-Circuit Loop: Battery(+) -> Switch -> Knot K -> A1 -> Knot F -> Battery(-) -->
                            <path d="M 100 200 L 100 80 L 260 80 L 260 350 L 100 350 L 100 230" 
                                  class="circuit-wire-current wire-short-furious" />
                            <!-- Directional arrows in short-circuit loop -->
                            <path d="M 100 200 L 100 135" marker-end="url(#current-arrow-short-par)" class="flow-arrow-path short-arrow" />
                            <path d="M 205 80 L 245 80" marker-end="url(#current-arrow-short-par)" class="flow-arrow-path short-arrow" />
                            <path d="M 260 105 L 260 165" marker-end="url(#current-arrow-short-par)" class="flow-arrow-path short-arrow" />
                            <path d="M 260 260 L 260 320" marker-end="url(#current-arrow-short-par)" class="flow-arrow-path short-arrow" />
                            <path d="M 240 350 L 160 350" marker-end="url(#current-arrow-short-par)" class="flow-arrow-path short-arrow" />
                        ` : ''}
                    ` : isFaultAmmeter2 ? `
                        ${isClosed ? `
                            <!-- Closed Short-Circuit Loop: Battery(+) -> Switch -> Aολ -> Knot K -> A2 -> Knot M -> Battery(-) -->
                            <path d="M 100 200 L 100 80 L 545 80 L 545 350 L 100 350 L 100 230" 
                                  class="circuit-wire-current wire-short-furious" />
                            <!-- Directional arrows in short-circuit loop -->
                            <path d="M 100 200 L 100 135" marker-end="url(#current-arrow-short-par)" class="flow-arrow-path short-arrow" />
                            <path d="M 205 80 L 255 80" marker-end="url(#current-arrow-short-par)" class="flow-arrow-path short-arrow" />
                            <path d="M 345 80 L 520 80" marker-end="url(#current-arrow-short-par)" class="flow-arrow-path short-arrow" />
                            <path d="M 545 105 L 545 165" marker-end="url(#current-arrow-short-par)" class="flow-arrow-path short-arrow" />
                            <path d="M 545 260 L 545 320" marker-end="url(#current-arrow-short-par)" class="flow-arrow-path short-arrow" />
                            <path d="M 520 350 L 390 350" marker-end="url(#current-arrow-short-par)" class="flow-arrow-path short-arrow" />
                            <path d="M 350 350 L 200 350" marker-end="url(#current-arrow-short-par)" class="flow-arrow-path short-arrow" />
                            <path d="M 180 350 L 110 350" marker-end="url(#current-arrow-short-par)" class="flow-arrow-path short-arrow" />
                        ` : ''}
                    ` : `
                        <!-- Main supply current: Battery -> G -> Switch K -> A(380,80) -->
                        <path d="M 100 200 L 100 80 L 380 80" class="circuit-wire-current ${currentLineClass}" style="animation-duration: ${animSpeed}s;" />
                        <!-- Main return current: B(380,350) -> F(100,350) -> Battery -->
                        <path d="M 380 350 L 100 350 L 100 230" class="circuit-wire-current ${currentLineClass}" style="animation-duration: ${animSpeed}s;" />

                        <!-- Branch 1 current I1: A(380,80) down to B(380,350) -->
                        ${hasCurrent1 ? `
                            <line x1="380" y1="80" x2="380" y2="350" class="circuit-wire-current wire-current-active" 
                                  style="animation-duration: ${animSpeed1}s;" />
                        ` : ''}

                        <!-- Branch 2 current I2: A(380,80) -> C(640,80) -> E(640,350) -> B(380,350) -->
                        ${hasCurrent2 ? `
                            <path d="M 380 80 L 640 80 L 640 350 L 380 350" class="circuit-wire-current wire-current-active" 
                                  style="animation-duration: ${animSpeed2}s;" />
                        ` : ''}

                        <!-- Conventional Flow Directional Arrows (Parallel) -->
                        ${hasCurrent ? `
                            <path d="M 100 180 L 100 120" marker-end="url(#current-arrow-par)" class="flow-arrow-path" />
                            <path d="M 125 80 L 145 80" marker-end="url(#current-arrow-par)" class="flow-arrow-path" />
                            ${hasCurrent1 ? `
                                <path d="M 380 155 L 380 170" marker-end="url(#current-arrow-par)" class="flow-arrow-path" />
                                <path d="M 380 265 L 380 310" marker-end="url(#current-arrow-par)" class="flow-arrow-path" />
                            ` : ''}
                            ${hasCurrent2 ? `
                                <path d="M 440 80 L 560 80" marker-end="url(#current-arrow-par)" class="flow-arrow-path" />
                                <path d="M 640 155 L 640 170" marker-end="url(#current-arrow-par)" class="flow-arrow-path" />
                                <path d="M 640 265 L 640 310" marker-end="url(#current-arrow-par)" class="flow-arrow-path" />
                                <path d="M 600 350 L 545 350" marker-end="url(#current-arrow-par)" class="flow-arrow-path" />
                                <path d="M 475 350 L 415 350" marker-end="url(#current-arrow-par)" class="flow-arrow-path" />
                            ` : ''}
                            <path d="M 280 350 L 180 350" marker-end="url(#current-arrow-par)" class="flow-arrow-path" />
                            <path d="M 100 320 L 100 260" marker-end="url(#current-arrow-par)" class="flow-arrow-path" />
                        ` : ''}
                    `}

                    <!-- Informative warning badge when faulty instrument is active in parallel (Relocated cleanly to bottom: y=415 to 477) -->
                    ${isFaultAmmeter1 ? `
                        <g class="sim-bypass-alert-badge">
                            <rect x="120" y="415" width="680" height="62" rx="14" class="sim-bypass-warning-banner" style="stroke: rgba(239, 68, 68, 0.75); fill: rgba(15, 23, 42, 0.96);" />
                            <text x="460" y="439" class="sim-bypass-warning-text" text-anchor="middle">
                                <tspan x="460" dy="0">${isClosed ? '⚡ Όλο το ρεύμα διαρρέει το <tspan class="sim-math-sym">A</tspan><tspan class="sim-math-sub" dy="3">1</tspan><tspan dy="-3"> (Βραχυκύκλωμα)</tspan>' : '⚪ Ανοικτός διακόπτης'}</tspan>
                                <tspan x="460" dy="24">${isClosed ? 'Στα <tspan class="sim-math-sym">A</tspan><tspan class="sim-math-sub" dy="3">ολ</tspan><tspan dy="-3">, </tspan><tspan class="sim-math-sym">R</tspan><tspan class="sim-math-sub" dy="3">1</tspan><tspan dy="-3"> &amp; </tspan><tspan class="sim-math-sym">R</tspan><tspan class="sim-math-sub" dy="3">2</tspan><tspan dy="-3">: </tspan><tspan class="sim-math-sym">I</tspan> = 0 A (Πλήρης παράκαμψη)' : 'Το ρεύμα είναι μηδέν (<tspan class="sim-math-sym">I</tspan> = 0 A)'}</tspan>
                            </text>
                        </g>
                    ` : ''}
                    ${isFaultAmmeter2 ? `
                        <g class="sim-bypass-alert-badge">
                            <rect x="120" y="415" width="680" height="62" rx="14" class="sim-bypass-warning-banner" style="stroke: rgba(245, 158, 11, 0.75); fill: rgba(15, 23, 42, 0.96);" />
                            <text x="460" y="439" class="sim-bypass-warning-text" style="fill: #fcd34d;" text-anchor="middle">
                                <tspan x="460" dy="0">${isClosed ? '⚡ Το ρεύμα διαρρέει το <tspan class="sim-math-sym">A</tspan><tspan class="sim-math-sub" dy="3">ολ</tspan><tspan dy="-3"> και το </tspan><tspan class="sim-math-sym">A</tspan><tspan class="sim-math-sub" dy="3">2</tspan><tspan dy="-3"> (Βραχυκύκλωμα)</tspan>' : '⚪ Ανοικτός διακόπτης'}</tspan>
                                <tspan x="460" dy="24">${isClosed ? 'Στους αντιστάτες <tspan class="sim-math-sym">R</tspan><tspan class="sim-math-sub" dy="3">1</tspan><tspan dy="-3"> &amp; </tspan><tspan class="sim-math-sym">R</tspan><tspan class="sim-math-sub" dy="3">2</tspan><tspan dy="-3">: </tspan><tspan class="sim-math-sym">I</tspan> = 0 A (Πλήρης παράκαμψη)' : 'Το ρεύμα είναι μηδέν (<tspan class="sim-math-sym">I</tspan> = 0 A)'}</tspan>
                            </text>
                        </g>
                    ` : ''}
                    ${isFaultVoltmeter ? `
                        <g class="sim-bypass-alert-badge">
                            <rect x="120" y="415" width="680" height="62" rx="14" class="sim-bypass-warning-banner" style="stroke: rgba(168, 85, 247, 0.75); fill: rgba(15, 23, 42, 0.96);" />
                            <text x="460" y="439" class="sim-bypass-warning-text" style="fill: #d8b4fe;" text-anchor="middle">
                                <tspan x="460" dy="0">${isClosed ? '⚠️ Το βολτόμετρο συνδέθηκε σε σειρά (<tspan class="sim-math-sym">R</tspan><tspan class="sim-math-sub" dy="3">v</tspan><tspan dy="-3"> → ∞)</tspan>' : '⚪ Ανοικτός διακόπτης'}</tspan>
                                <tspan x="460" dy="24">${isClosed ? 'Στον κύριο αγωγό: <tspan class="sim-math-sym">I</tspan><tspan class="sim-math-sub" dy="3">ολ</tspan><tspan dy="-3"> = 0 A &amp; </tspan><tspan class="sim-math-sym">V</tspan><tspan class="sim-math-sub" dy="3">παρ</tspan><tspan dy="-3"> = 0 V (Μηδενισμός)</tspan>' : 'Το ρεύμα είναι μηδέν (<tspan class="sim-math-sym">I</tspan> = 0 A)'}</tspan>
                            </text>
                        </g>
                    ` : ''}

                    <!-- 1. VOLTMETER Vπηγ across DC Source (Left side: x=42, y=215) -->
                    <g class="comp-interactive comp-voltmeter" data-probe="voltmeter_src"
                       onmouseenter="CircuitSimulation.hoverProbe('voltmeter_src')" 
                       onmouseleave="CircuitSimulation.hoverProbe(null)"
                       onclick="CircuitSimulation.selectProbe('voltmeter_src')">
                        <path d="M 42 197 L 42 160 L 100 160" class="voltmeter-lead" />
                        <path d="M 42 233 L 42 270 L 100 270" class="voltmeter-lead" />
                        <circle cx="100" cy="160" r="3.5" class="voltmeter-contact-dot" />
                        <circle cx="100" cy="270" r="3.5" class="voltmeter-contact-dot" />
                        <circle cx="42" cy="215" r="18.5" class="voltmeter-circle" />
                        <text x="42" y="215" class="voltmeter-text"><tspan font-style="italic">V</tspan><tspan font-size="0.7em" dy="2">πηγ</tspan></text>
                        <text x="42" y="250" class="voltmeter-reading-tag">${state.V_src} V</text>
                    </g>

                    <!-- 2. DC SOURCE at Left (x=100, y=215) -->
                    <g class="comp-interactive comp-source" data-probe="source"
                       onmouseenter="CircuitSimulation.hoverProbe('source')" 
                       onmouseleave="CircuitSimulation.hoverProbe(null)"
                       onclick="CircuitSimulation.selectProbe('source')">
                        <rect x="70" y="160" width="60" height="110" class="comp-hitbox" />
                        <line x1="78" y1="200" x2="122" y2="200" class="battery-plate positive" />
                        <line x1="88" y1="230" x2="112" y2="230" class="battery-plate negative" />
                        <text x="132" y="196" class="comp-label bold text-positive">+</text>
                        <text x="132" y="235" class="comp-label bold text-negative">−</text>
                    </g>

                    <!-- NODE G (x=100, y=80) - Above Source -->
                    <g class="circuit-node-group" onmouseenter="CircuitSimulation.hoverProbe('nodeG')" onmouseleave="CircuitSimulation.hoverProbe(null)" onclick="CircuitSimulation.selectProbe('nodeG')">
                        <circle cx="100" cy="80" r="14" class="comp-hitbox" fill="transparent" />
                        <circle cx="100" cy="80" r="4" class="circuit-node-dot" />
                        <text x="100" y="65" class="node-letter">G</text>
                    </g>

                    <!-- 3. SWITCH K at Top-Left (x=145 to x=205, y=80) -->
                    <g class="comp-interactive comp-switch" data-probe="switch"
                       onmouseenter="CircuitSimulation.hoverProbe('switch')" 
                       onmouseleave="CircuitSimulation.hoverProbe(null)"
                       onclick="CircuitSimulation.toggleSwitch()">
                        <rect x="135" y="45" width="80" height="70" class="comp-hitbox" />
                        <circle cx="145" cy="80" r="4.5" class="terminal-dot" />
                        <circle cx="205" cy="80" r="4.5" class="terminal-dot" />
                        ${isClosed ? `
                            <line x1="145" y1="80" x2="205" y2="80" class="switch-blade closed" />
                        ` : `
                            <line x1="145" y1="80" x2="195" y2="52" class="switch-blade open" />
                        `}
                        <text x="175" y="40" class="comp-title-tag">Διακόπτης K</text>
                    </g>

                    <!-- 4. MAIN RAIL METERS & FAULTY METERS -->
                    ${isFaultAmmeter1 ? `
                        <!-- KNOT K (x=260, y=80) -->
                        <g class="circuit-node-group node-knot-group" onmouseenter="CircuitSimulation.hoverProbe('nodeK')" onmouseleave="CircuitSimulation.hoverProbe(null)" onclick="CircuitSimulation.selectProbe('nodeK')">
                            <circle cx="260" cy="80" r="14" class="comp-hitbox" fill="transparent" />
                            <circle cx="260" cy="80" r="5" class="circuit-node-dot knot-k-dot" />
                            <text x="260" y="65" class="node-letter knot-k-letter">K</text>
                        </g>

                        <!-- AMMETER A1 (Perpendicular in the middle of cable joining K and F: x=260, y=215) -->
                        <g class="comp-interactive comp-meter faulty-ammeter" data-probe="ammeter1"
                           onmouseenter="CircuitSimulation.hoverProbe('ammeter1')" 
                           onmouseleave="CircuitSimulation.hoverProbe(null)"
                           onclick="CircuitSimulation.selectProbe('ammeter1')">
                            <rect x="225" y="175" width="70" height="80" class="comp-hitbox" />
                            <circle cx="260" cy="215" r="21" class="meter-circle meter-faulty ${isClosed ? 'short-alarm' : ''}" />
                            <text x="260" y="215" class="meter-text faulty-text">A₁</text>
                            <text x="260" y="250" class="meter-reading-tag danger-reading">
                                ${!isClosed ? '0.00 A' : '∞ A'}
                            </text>
                        </g>

                        <!-- MAIN AMMETER Aολ shifted slightly to fit nicely (x=320, y=80) -->
                        <g class="comp-interactive comp-meter" data-probe="ammeter_main"
                           onmouseenter="CircuitSimulation.hoverProbe('ammeter_main')" 
                           onmouseleave="CircuitSimulation.hoverProbe(null)"
                           onclick="CircuitSimulation.selectProbe('ammeter_main')">
                            <rect x="298" y="55" width="45" height="65" class="comp-hitbox" />
                            <circle cx="320" cy="80" r="18.5" class="meter-circle" />
                            <text x="320" y="80" class="meter-text">A<tspan font-size="0.65em" dy="2">ολ</tspan></text>
                            <text x="320" y="115" class="meter-reading-tag">${phys.I_total.toFixed(2)} A</text>
                        </g>
                    ` : isFaultAmmeter2 ? `
                        <!-- MAIN AMMETER Aολ shifted slightly to fit nicely (x=320, y=80) - Carrying short-circuit surge -->
                        <g class="comp-interactive comp-meter faulty-ammeter" data-probe="ammeter_main"
                           onmouseenter="CircuitSimulation.hoverProbe('ammeter_main')" 
                           onmouseleave="CircuitSimulation.hoverProbe(null)"
                           onclick="CircuitSimulation.selectProbe('ammeter_main')">
                            <rect x="298" y="55" width="45" height="65" class="comp-hitbox" />
                            <circle cx="320" cy="80" r="18.5" class="meter-circle meter-faulty-orange ${isClosed ? 'short-alarm' : ''}" />
                            <text x="320" y="80" class="meter-text faulty-text-orange">A<tspan font-size="0.65em" dy="2">ολ</tspan></text>
                            <text x="320" y="115" class="meter-reading-tag danger-reading">
                                ${!isClosed ? '0.00 A' : '∞ A'}
                            </text>
                        </g>
                    ` : isFaultVoltmeter ? `
                        <!-- Voltmeter in series just before Aολ (x=250, y=80) -->
                        <g class="comp-interactive comp-voltmeter faulty-voltmeter" data-probe="voltmeter_series"
                           onmouseenter="CircuitSimulation.hoverProbe('voltmeter_series')" 
                           onmouseleave="CircuitSimulation.hoverProbe(null)"
                           onclick="CircuitSimulation.selectProbe('voltmeter_series')">
                            <rect x="228" y="55" width="45" height="65" class="comp-hitbox" />
                            <circle cx="250" cy="80" r="18.5" class="voltmeter-circle meter-faulty-purple" />
                            <text x="250" y="80" class="voltmeter-text faulty-text-purple"><tspan font-style="italic">V</tspan><tspan font-size="0.75em" dy="2">σ</tspan></text>
                            <text x="250" y="115" class="meter-reading-tag purple-reading">${!isClosed ? '0.0 V' : phys.V_src.toFixed(1) + ' V'}</text>
                        </g>

                        <!-- MAIN AMMETER Aολ shifted slightly to fit nicely (x=320, y=80) -->
                        <g class="comp-interactive comp-meter" data-probe="ammeter_main"
                           onmouseenter="CircuitSimulation.hoverProbe('ammeter_main')" 
                           onmouseleave="CircuitSimulation.hoverProbe(null)"
                           onclick="CircuitSimulation.selectProbe('ammeter_main')">
                            <rect x="298" y="55" width="45" height="65" class="comp-hitbox" />
                            <circle cx="320" cy="80" r="18.5" class="meter-circle" />
                            <text x="320" y="80" class="meter-text">A<tspan font-size="0.65em" dy="2">ολ</tspan></text>
                            <text x="320" y="115" class="meter-reading-tag">${phys.I_total.toFixed(2)} A</text>
                        </g>
                    ` : `
                        <!-- 4. MAIN AMMETER Aολ on Top Rail (x=280, y=80) -->
                        <g class="comp-interactive comp-meter" data-probe="ammeter_main"
                           onmouseenter="CircuitSimulation.hoverProbe('ammeter_main')" 
                           onmouseleave="CircuitSimulation.hoverProbe(null)"
                           onclick="CircuitSimulation.selectProbe('ammeter_main')">
                            <rect x="258" y="55" width="45" height="65" class="comp-hitbox" />
                            <circle cx="280" cy="80" r="18.5" class="meter-circle" />
                            <text x="280" y="80" class="meter-text">A<tspan font-size="0.65em" dy="2">ολ</tspan></text>
                            <text x="280" y="115" class="meter-reading-tag">${phys.I_total.toFixed(2)} A</text>
                        </g>
                    `}

                    <!-- NODE A (x=380, y=80) - Branch 1 Top -->
                    <g class="circuit-node-group" onmouseenter="CircuitSimulation.hoverProbe('nodeA')" onmouseleave="CircuitSimulation.hoverProbe(null)" onclick="CircuitSimulation.selectProbe('nodeA')">
                        <circle cx="380" cy="80" r="14" class="comp-hitbox" fill="transparent" />
                        <circle cx="380" cy="80" r="4" class="circuit-node-dot" />
                        <text x="380" y="65" class="node-letter">A</text>
                    </g>

                    <!-- 5. BRANCH 1 AMMETER A1 (Vertical at x=380, y=125) - Rendered only when not moved to vertical cable -->
                    ${!isFaultAmmeter1 ? `
                        <g class="comp-interactive comp-meter" data-probe="ammeter1"
                           onmouseenter="CircuitSimulation.hoverProbe('ammeter1')" 
                           onmouseleave="CircuitSimulation.hoverProbe(null)"
                           onclick="CircuitSimulation.selectProbe('ammeter1')">
                            <rect x="360" y="105" width="40" height="40" class="comp-hitbox" />
                            <circle cx="380" cy="125" r="18" class="meter-circle" />
                            <text x="380" y="125" class="meter-text">A₁</text>
                            <text x="353" y="130" class="meter-reading-tag" text-anchor="end">${phys.I1.toFixed(2)} A</text>
                        </g>
                    ` : ''}

                    <!-- 6. RESISTOR R1 (Vertical Branch 1: x=380) -->
                    <g class="comp-interactive comp-resistor ${state.shortR1 ? 'is-shorted' : ''} ${state.brokenR1 ? 'is-broken' : ''}" data-probe="R1"
                       onmouseenter="CircuitSimulation.hoverProbe('R1')" 
                       onmouseleave="CircuitSimulation.hoverProbe(null)"
                       onclick="CircuitSimulation.selectProbe('R1')">
                        <rect x="350" y="150" width="180" height="130" class="comp-hitbox" />
                        
                        ${state.brokenR1 ? `
                            <!-- Broken Vertical Resistor Split in Two with Red Crack -->
                            <rect x="368" y="175" width="24" height="34" rx="3" class="resistor-body broken" />
                            <rect x="368" y="221" width="24" height="34" rx="3" class="resistor-body broken" />
                            <text x="380" y="192" class="resistor-inner-text" dominant-baseline="middle" text-anchor="middle" style="font-size: 14.5px;"><tspan font-style="italic">R</tspan><tspan font-size="0.75em" dy="3">1</tspan></text>
                            <path d="M 364 213 L 396 223 M 396 213 L 364 223" class="resistor-crack-symbol" />
                            <text x="406" y="274" class="broken-badge-text" text-anchor="start">💥 ΚΑΤΑΣΤΡΟΦΗ</text>
                        ` : `
                            <!-- Normal Vertical Resistor Box -->
                            <rect x="368" y="170" width="24" height="90" rx="4" class="resistor-body ${state.shortR1 ? 'shorted' : ''}" />
                            <text x="380" y="215" class="resistor-inner-text" dominant-baseline="middle" text-anchor="middle"><tspan font-style="italic">R</tspan><tspan font-size="0.75em" dy="3">1</tspan></text>
                        `}
                        
                        <!-- Values to the right: R, V, I (25% larger font: 19px) -->
                        <text x="406" y="196" class="comp-resistor-par-top" text-anchor="start"><tspan font-style="italic">R</tspan><tspan font-size="0.75em" dy="3">1</tspan><tspan dy="-3"> = ${state.R1} Ω</tspan></text>
                        <text x="406" y="224" class="comp-resistor-par-bottom" text-anchor="start">${state.shortR1 ? '<tspan font-style="italic">V</tspan><tspan font-size="0.75em" dy="3">1</tspan><tspan dy="-3"> = 0.0 V (0 Ω)</tspan>' : `<tspan font-style="italic">V</tspan><tspan font-size="0.75em" dy="3">1</tspan><tspan dy="-3"> = ${phys.V1.toFixed(1)} V</tspan>`}</text>
                        <text x="406" y="252" class="comp-resistor-par-current" text-anchor="start"><tspan font-style="italic">I</tspan><tspan font-size="0.75em" dy="3">1</tspan><tspan dy="-3"> = ${phys.I1.toFixed(2)} A</tspan></text>

                        <!-- Bypass Wire if shorted -->
                        ${state.shortR1 ? (state.shortModeR1 === 'alternative' ? `
                            <!-- Alternative Equipotential Short: A(380, 80) to E(640, 350) -->
                            <path d="M 380 80 C 430 140, 590 290, 640 350" class="short-circuit-bypass-wire wire-short-furious" filter="url(#wire-glow-danger-par)" />
                            <circle cx="380" cy="80" r="5.5" class="short-contact-dot" />
                            <circle cx="640" cy="350" r="5.5" class="short-contact-dot" />
                            <text x="510" y="205" class="short-wire-label" text-anchor="middle">⚠️ Εναλλακτικό Βραχυκύκλωμα (A ↔ E)</text>
                        ` : `
                            <!-- Classic Short: A(380, 80) to B(380, 350) -->
                            <path d="M 380 80 C 320 140, 320 290, 380 350" class="short-circuit-bypass-wire" />
                            ${hasCurrent ? `
                                <path d="M 380 80 C 320 140, 320 290, 380 350" class="circuit-wire-current wire-current-active bypass-current" style="animation-duration: ${animSpeed}s;" />
                            ` : ''}
                            <circle cx="380" cy="80" r="4.5" class="short-contact-dot" />
                            <circle cx="380" cy="350" r="4.5" class="short-contact-dot" />
                            <text x="310" y="215" class="short-wire-label" text-anchor="end">⚠️ Κλασικό Βραχυκύκλωμα R₁ (A ↔ B)</text>
                        `) : ''}
                    </g>

                    <!-- 7. AMMETER A2 / KNOT K & M SETUP BETWEEN R1 AND R2 (Shifted cleanly to x=545) -->
                    ${isFaultAmmeter2 ? `
                        <!-- KNOT K (x=545, y=80) - Between R1 and R2 -->
                        <g class="circuit-node-group node-knot-group" onmouseenter="CircuitSimulation.hoverProbe('nodeK')" onmouseleave="CircuitSimulation.hoverProbe(null)" onclick="CircuitSimulation.selectProbe('nodeK')">
                            <circle cx="545" cy="80" r="14" class="comp-hitbox" fill="transparent" />
                            <circle cx="545" cy="80" r="5" class="circuit-node-dot knot-k-dot" />
                            <text x="545" y="65" class="node-letter knot-k-letter">K</text>
                        </g>

                        <!-- AMMETER A2 (Perpendicular in the middle of cable joining K and M: x=545, y=215) -->
                        <g class="comp-interactive comp-meter faulty-ammeter" data-probe="ammeter2"
                           onmouseenter="CircuitSimulation.hoverProbe('ammeter2')" 
                           onmouseleave="CircuitSimulation.hoverProbe(null)"
                           onclick="CircuitSimulation.selectProbe('ammeter2')">
                            <rect x="510" y="175" width="70" height="80" class="comp-hitbox" />
                            <circle cx="545" cy="215" r="21" class="meter-circle meter-faulty-orange ${isClosed ? 'short-alarm' : ''}" />
                            <text x="545" y="215" class="meter-text faulty-text-orange">A₂</text>
                            <text x="574" y="220" class="meter-reading-tag danger-reading" text-anchor="start">
                                ${!isClosed ? '0.00 A' : '∞ A'}
                            </text>
                        </g>

                        <!-- KNOT M (x=545, y=350) - Landing of Vertical Cable from A2 -->
                        <g class="circuit-node-group node-knot-group" onmouseenter="CircuitSimulation.hoverProbe('nodeM')" onmouseleave="CircuitSimulation.hoverProbe(null)" onclick="CircuitSimulation.selectProbe('nodeM')">
                            <circle cx="545" cy="350" r="14" class="comp-hitbox" fill="transparent" />
                            <circle cx="545" cy="350" r="5" class="circuit-node-dot knot-m-dot" />
                            <text x="562" y="342" class="node-letter knot-m-letter">M</text>
                        </g>
                    ` : ''}

                    <!-- NODE C (x=640, y=80) - Branch 2 Top -->
                    <g class="circuit-node-group" onmouseenter="CircuitSimulation.hoverProbe('nodeC')" onmouseleave="CircuitSimulation.hoverProbe(null)" onclick="CircuitSimulation.selectProbe('nodeC')">
                        <circle cx="640" cy="80" r="14" class="comp-hitbox" fill="transparent" />
                        <circle cx="640" cy="80" r="4" class="circuit-node-dot" />
                        <text x="640" y="65" class="node-letter">C</text>
                    </g>

                    <!-- 8. BRANCH 2 AMMETER A2 (Vertical at x=640, y=125) - Rendered only when not moved between resistors -->
                    ${!isFaultAmmeter2 ? `
                        <g class="comp-interactive comp-meter" data-probe="ammeter2"
                           onmouseenter="CircuitSimulation.hoverProbe('ammeter2')" 
                           onmouseleave="CircuitSimulation.hoverProbe(null)"
                           onclick="CircuitSimulation.selectProbe('ammeter2')">
                            <rect x="620" y="105" width="40" height="40" class="comp-hitbox" />
                            <circle cx="640" cy="125" r="18" class="meter-circle" />
                            <text x="640" y="125" class="meter-text">A₂</text>
                            <text x="613" y="130" class="meter-reading-tag" text-anchor="end">${phys.I2.toFixed(2)} A</text>
                        </g>
                    ` : ''}

                    <!-- 9. RESISTOR R2 (Vertical Branch 2: x=640) -->
                    <g class="comp-interactive comp-resistor ${state.shortR2 ? 'is-shorted' : ''} ${state.brokenR2 ? 'is-broken' : ''}" data-probe="R2"
                       onmouseenter="CircuitSimulation.hoverProbe('R2')" 
                       onmouseleave="CircuitSimulation.hoverProbe(null)"
                       onclick="CircuitSimulation.selectProbe('R2')">
                        <rect x="610" y="150" width="180" height="130" class="comp-hitbox" />
                        
                        ${state.brokenR2 ? `
                            <rect x="628" y="175" width="24" height="34" rx="3" class="resistor-body broken" />
                            <rect x="628" y="221" width="24" height="34" rx="3" class="resistor-body broken" />
                            <text x="640" y="192" class="resistor-inner-text" dominant-baseline="middle" text-anchor="middle" style="font-size: 14.5px;"><tspan font-style="italic">R</tspan><tspan font-size="0.75em" dy="3">2</tspan></text>
                            <path d="M 624 213 L 656 223 M 656 213 L 624 223" class="resistor-crack-symbol" />
                            <text x="666" y="274" class="broken-badge-text" text-anchor="start">💥 ΚΑΤΑΣΤΡΟΦΗ</text>
                        ` : `
                            <rect x="628" y="170" width="24" height="90" rx="4" class="resistor-body ${state.shortR2 ? 'shorted' : ''}" />
                            <text x="640" y="215" class="resistor-inner-text" dominant-baseline="middle" text-anchor="middle"><tspan font-style="italic">R</tspan><tspan font-size="0.75em" dy="3">2</tspan></text>
                        `}
                        
                        <text x="666" y="196" class="comp-resistor-par-top" text-anchor="start"><tspan font-style="italic">R</tspan><tspan font-size="0.75em" dy="3">2</tspan><tspan dy="-3"> = ${state.R2} Ω</tspan></text>
                        <text x="666" y="224" class="comp-resistor-par-bottom" text-anchor="start">${state.shortR2 ? '<tspan font-style="italic">V</tspan><tspan font-size="0.75em" dy="3">2</tspan><tspan dy="-3"> = 0.0 V (0 Ω)</tspan>' : `<tspan font-style="italic">V</tspan><tspan font-size="0.75em" dy="3">2</tspan><tspan dy="-3"> = ${phys.V2.toFixed(1)} V</tspan>`}</text>
                        <text x="666" y="252" class="comp-resistor-par-current" text-anchor="start"><tspan font-style="italic">I</tspan><tspan font-size="0.75em" dy="3">2</tspan><tspan dy="-3"> = ${phys.I2.toFixed(2)} A</tspan></text>

                        <!-- Bypass Wire if shorted -->
                        ${state.shortR2 ? (state.shortModeR2 === 'alternative' ? `
                            <!-- Alternative Equipotential Short: B(380, 350) to C(640, 80) -->
                            <path d="M 380 350 C 430 290, 590 140, 640 80" class="short-circuit-bypass-wire wire-short-furious" filter="url(#wire-glow-danger-par)" />
                            <circle cx="380" cy="350" r="5.5" class="short-contact-dot" />
                            <circle cx="640" cy="80" r="5.5" class="short-contact-dot" />
                            <text x="510" y="235" class="short-wire-label" text-anchor="middle">⚠️ Εναλλακτικό Βραχυκύκλωμα (B ↔ C)</text>
                        ` : `
                            <!-- Classic Short: C(640, 80) to E(640, 350) -->
                            <path d="M 640 80 C 580 140, 580 290, 640 350" class="short-circuit-bypass-wire" />
                            ${hasCurrent ? `
                                <path d="M 640 80 C 580 140, 580 290, 640 350" class="circuit-wire-current wire-current-active bypass-current" style="animation-duration: ${animSpeed}s;" />
                            ` : ''}
                            <circle cx="640" cy="80" r="4.5" class="short-contact-dot" />
                            <circle cx="640" cy="350" r="4.5" class="short-contact-dot" />
                            <text x="570" y="215" class="short-wire-label" text-anchor="end">⚠️ Κλασικό Βραχυκύκλωμα R₂ (C ↔ E)</text>
                        `) : ''}
                    </g>

                    <!-- 10. VOLTMETER Vπαρ across Parallel Resistors (Right side: x=860, y=215) -->
                    <g class="comp-interactive comp-voltmeter" data-probe="voltmeter_par"
                       onmouseenter="CircuitSimulation.hoverProbe('voltmeter_par')" 
                       onmouseleave="CircuitSimulation.hoverProbe(null)"
                       onclick="CircuitSimulation.selectProbe('voltmeter_par')">
                        <rect x="830" y="180" width="60" height="75" class="comp-hitbox" fill="transparent" />
                        <!-- Probe leads to Node C (640,80) and Node E (640,350) with ample clearance -->
                        <path d="M 860 197 L 860 80 L 640 80" class="voltmeter-lead" />
                        <path d="M 860 233 L 860 350 L 640 350" class="voltmeter-lead" />
                        <circle cx="640" cy="80" r="3.5" class="voltmeter-contact-dot" />
                        <circle cx="640" cy="350" r="3.5" class="voltmeter-contact-dot" />
                        <!-- Voltmeter Instrument Body -->
                        <circle cx="860" cy="215" r="18.5" class="voltmeter-circle" />
                        <text x="860" y="215" class="voltmeter-text"><tspan font-style="italic">V</tspan><tspan font-size="0.7em" dy="2">παρ</tspan></text>
                        <text x="860" y="250" class="voltmeter-reading-tag">${(!state.switchClosed || phys.status === 'total_short' || isFaultVoltmeter) ? '0.0 V' : `${phys.V_src.toFixed(1)} V`}</text>
                    </g>

                    <!-- Wire Probe Zones -->
                    <g class="wire-probe-zone">
                        <g onmouseenter="CircuitSimulation.hoverProbe('wireMain')" onmouseleave="CircuitSimulation.hoverProbe(null)">
                            <rect x="205" y="65" width="55" height="30" class="probe-wire-hitbox" />
                            <rect x="345" y="65" width="30" height="30" class="probe-wire-hitbox" />
                            <rect x="85" y="100" width="30" height="80" class="probe-wire-hitbox" />
                            <rect x="85" y="270" width="30" height="70" class="probe-wire-hitbox" />
                            <rect x="140" y="335" width="200" height="30" class="probe-wire-hitbox" />
                        </g>
                        <g onmouseenter="CircuitSimulation.hoverProbe('branch1')" onmouseleave="CircuitSimulation.hoverProbe(null)">
                            <rect x="365" y="95" width="30" height="30" class="probe-wire-hitbox" />
                            <rect x="365" y="270" width="30" height="65" class="probe-wire-hitbox" />
                        </g>
                        <g onmouseenter="CircuitSimulation.hoverProbe('branch2')" onmouseleave="CircuitSimulation.hoverProbe(null)">
                            <rect x="410" y="65" width="90" height="30" class="probe-wire-hitbox" />
                            <rect x="525" y="65" width="105" height="30" class="probe-wire-hitbox" />
                            <rect x="625" y="95" width="30" height="30" class="probe-wire-hitbox" />
                            <rect x="625" y="270" width="30" height="65" class="probe-wire-hitbox" />
                            <rect x="525" y="335" width="105" height="30" class="probe-wire-hitbox" />
                        </g>
                    </g>

                    <!-- NODE F (Landing of Vertical Cable when isFaultAmmeter1, or under source at x=100, y=350) -->
                    ${isFaultAmmeter1 ? `
                        <!-- KNOT F (x=260, y=350) - Landing of Vertical Cable from A1 -->
                        <g class="circuit-node-group node-knot-group" onmouseenter="CircuitSimulation.hoverProbe('nodeF')" onmouseleave="CircuitSimulation.hoverProbe(null)" onclick="CircuitSimulation.selectProbe('nodeF')">
                            <circle cx="260" cy="350" r="14" class="comp-hitbox" fill="transparent" />
                            <circle cx="260" cy="350" r="5" class="circuit-node-dot knot-f-dot" />
                            <text x="260" y="335" class="node-letter knot-f-letter">F</text>
                        </g>
                    ` : `
                        <g class="circuit-node-group" onmouseenter="CircuitSimulation.hoverProbe('nodeF')" onmouseleave="CircuitSimulation.hoverProbe(null)" onclick="CircuitSimulation.selectProbe('nodeF')">
                            <circle cx="100" cy="350" r="14" class="comp-hitbox" fill="transparent" />
                            <circle cx="100" cy="350" r="4" class="circuit-node-dot" />
                            <text x="100" y="375" class="node-letter">F</text>
                        </g>
                    `}

                    <!-- NODE B (x=380, y=350) - Bottom of Branch 1 -->
                    <g class="circuit-node-group" onmouseenter="CircuitSimulation.hoverProbe('nodeB')" onmouseleave="CircuitSimulation.hoverProbe(null)" onclick="CircuitSimulation.selectProbe('nodeB')">
                        <circle cx="380" cy="350" r="14" class="comp-hitbox" fill="transparent" />
                        <circle cx="380" cy="350" r="4" class="circuit-node-dot" />
                        <text x="380" y="375" class="node-letter">B</text>
                    </g>

                    <!-- NODE D (GROUND: x=440, y=350) - Cleanly between Branch 1 and Knot M / Branch 2 -->
                    <g class="circuit-node-group" onmouseenter="CircuitSimulation.hoverProbe('nodeD')" onmouseleave="CircuitSimulation.hoverProbe(null)" onclick="CircuitSimulation.selectProbe('nodeD')">
                        <circle cx="440" cy="350" r="14" class="comp-hitbox" fill="transparent" />
                        <circle cx="440" cy="350" r="4" class="circuit-node-dot" />
                        <!-- Ground symbol lines -->
                        <line x1="440" y1="350" x2="440" y2="385" class="ground-stem" />
                        <line x1="425" y1="385" x2="455" y2="385" class="ground-line" />
                        <line x1="430" y1="390" x2="450" y2="390" class="ground-line" />
                        <line x1="435" y1="395" x2="445" y2="395" class="ground-line" />
                        <text x="462" y="380" class="node-letter ground-label" text-anchor="start">D (0 V)</text>
                    </g>

                    <!-- NODE E (x=640, y=350) - Bottom of Branch 2 -->
                    <g class="circuit-node-group" onmouseenter="CircuitSimulation.hoverProbe('nodeE')" onmouseleave="CircuitSimulation.hoverProbe(null)" onclick="CircuitSimulation.selectProbe('nodeE')">
                        <circle cx="640" cy="350" r="14" class="comp-hitbox" fill="transparent" />
                        <circle cx="640" cy="350" r="4" class="circuit-node-dot" />
                        <text x="640" y="375" class="node-letter">E</text>
                    </g>

                    <!-- Harmless / Equipotential Overlays (Parallel) -->
                    ${state.harmlessConnection === 'parallel_AC' ? `
                        <g class="comp-interactive comp-harmless-wire" data-probe="harmless_wire"
                           onmouseenter="CircuitSimulation.hoverProbe('harmless_wire')" 
                           onmouseleave="CircuitSimulation.hoverProbe(null)"
                           onclick="CircuitSimulation.selectProbe('harmless_wire')">
                            <!-- Cable connecting A(380, 80) and C(640, 80) along top rail with 90px clearance (y=-10) -->
                            <path d="M 380 80 L 380 2 Q 380 -10, 392 -10 L 628 -10 Q 640 -10, 640 2 L 640 80" class="harmless-bypass-wire" />
                            <circle cx="380" cy="80" r="5" class="harmless-contact-dot" />
                            <circle cx="640" cy="80" r="5" class="harmless-contact-dot" />

                            <!-- Centered Explanatory Glass Banner in Open Left Bay (Cleanly fitting between Battery and R1) -->
                            <rect x="152" y="169" width="206" height="92" rx="12" class="harmless-center-banner" />
                            <text x="255" y="195" class="harmless-banner-title" text-anchor="middle" font-size="13.5">✅ Ακίνδυνη Σύνδεση</text>
                            <text x="255" y="223" class="harmless-banner-title" text-anchor="middle" font-size="18" fill="#38bdf8">A ↔ C</text>
                            <text x="255" y="246" class="harmless-banner-sub" text-anchor="middle" font-size="11.5">Κοινό δυναμικό: <tspan class="sim-math-sym">V</tspan><tspan class="sim-math-sub" dy="2">πηγ</tspan></text>
                        </g>
                    ` : ''}

                    ${state.harmlessConnection === 'parallel_FE' ? `
                        <g class="comp-interactive comp-harmless-wire" data-probe="harmless_wire"
                           onmouseenter="CircuitSimulation.hoverProbe('harmless_wire')" 
                           onmouseleave="CircuitSimulation.hoverProbe(null)"
                           onclick="CircuitSimulation.selectProbe('harmless_wire')">
                            <!-- Cable connecting F(100, 350) and E(640, 350) along bottom rail with ample clearance below ground (y=425) -->
                            <path d="M 100 350 L 100 415 Q 100 425, 112 425 L 628 425 Q 640 425, 640 415 L 640 350" class="harmless-bypass-wire" />
                            <circle cx="100" cy="350" r="5" class="harmless-contact-dot" />
                            <circle cx="640" cy="350" r="5" class="harmless-contact-dot" />

                            <!-- Centered Explanatory Glass Banner in Open Left Bay (Cleanly fitting between Battery and R1) -->
                            <rect x="152" y="169" width="206" height="92" rx="12" class="harmless-center-banner" />
                            <text x="255" y="195" class="harmless-banner-title" text-anchor="middle" font-size="13.5">✅ Ακίνδυνη Σύνδεση</text>
                            <text x="255" y="223" class="harmless-banner-title" text-anchor="middle" font-size="18" fill="#38bdf8">F ↔ E</text>
                            <text x="255" y="246" class="harmless-banner-sub" text-anchor="middle" font-size="11.5">Κοινή επιστροφή: 0 V</text>
                        </g>
                    ` : ''}
                </svg>
            `;
        }

        viewport.innerHTML = svgHtml;
    }

    /**
     * Helper to render step-by-step physical calculations for resistors (R1 / R2)
     */
    function buildCalculationStepsHtml(resistorKey, phys, p1, p2, e1, e2) {
        if (state.topology === 'series') {
            if (state.faultInstrument === 'ammeter_parallel') {
                const targetR = resistorKey === 'R1' ? state.R1 : state.R2;
                return `
                    <div class="step-calc-line">
                        <div class="step-calc-header">1. Ολική Αντίσταση Σειράς υπό Βραχυκύκλωμα A₁:</div>
                        <div class="step-calc-formula">$$R_{\\text{ολ}} = R_A = 0.00\\ \\Omega \\quad (\\text{Το } A_1 \\text{ συνδέθηκε παράλληλα στην πηγή})$$</div>
                    </div>
                    <div class="step-calc-line">
                        <div class="step-calc-header">2. Παράκαμψη Αντιστάτη $${resistorKey}$:</div>
                        <p style="font-size: 0.88rem; line-height: 1.5; margin: 2px 0;">
                            Επειδή όλο το ρεύμα διαρρέει το αμπερόμετρο $A_1$ μηδενικής αντίστασης, η διαφορά δυναμικού στα άκρα του κλάδου μηδενίζεται ($V_{KF} = 0\\text{ V}$). Συνεπώς, δεν φτάνει καθόλου ρεύμα στον $${resistorKey}$:
                        </p>
                        <div class="step-calc-formula">$$V_${resistorKey === 'R1' ? '1' : '2'} = 0.00\\text{ V}, \\quad I_${resistorKey === 'R1' ? '1' : '2'} = \\frac{0.00\\text{ V}}{${targetR}\\ \\Omega} = 0.00\\text{ A}$$</div>
                    </div>
                    <div class="step-calc-line">
                        <div class="step-calc-header">3. Ισχύς Κατανάλωσης & Θερμότητα:</div>
                        <div class="step-calc-formula">$$P_${resistorKey === 'R1' ? '1' : '2'} = 0.00\\text{ W}, \\quad E_${resistorKey === 'R1' ? '1' : '2'} = 0.0\\text{ J}$$</div>
                    </div>
                `;
            }

            if (state.faultInstrument === 'ammeter2_parallel') {
                if (resistorKey === 'R1') {
                    return `
                        <div class="step-calc-line">
                            <div class="step-calc-header">1. Ολική Αντίσταση Σειράς υπό Βραχυκύκλωμα A₂:</div>
                            <div class="step-calc-formula">$$R_{\\text{ολ}} = R_1 = ${state.R1}\\ \\Omega \\quad (\\text{Το } A_2 \\text{ συνδέθηκε μεταξύ K και M, βραχυκυκλώνοντας τον } R_2)$$</div>
                        </div>
                        <div class="step-calc-line">
                            <div class="step-calc-header">2. Ρεύμα και Πτώση Τάσης στον $R_1$:</div>
                            <p style="font-size: 0.88rem; line-height: 1.5; margin: 2px 0;">
                                Το ρεύμα διαρρέει κανονικά τον αντιστάτη $R_1$ και στη συνέχεια επιστρέφει απευθείας στην πηγή μέσω του αμπερομέτρου $A_2$ (μηδενικής αντίστασης $R_{A2} = 0\\ \\Omega$):
                            </p>
                            <div class="step-calc-formula">$$I_1 = \\frac{V_{\\text{πηγ}}}{R_1} = \\frac{${state.V_src}\\text{ V}}{${state.R1}\\ \\Omega} = ${phys.I1.toFixed(2)}\\text{ A}$$</div>
                            <div class="step-calc-formula">$$V_1 = I_1 \\cdot R_1 = ${phys.I1.toFixed(2)}\\text{ A} \\cdot ${state.R1}\\ \\Omega = ${phys.V1.toFixed(2)}\\text{ V} = V_{\\text{πηγ}}$$</div>
                        </div>
                        <div class="step-calc-line">
                            <div class="step-calc-header">3. Ισχύς Κατανάλωσης & Θερμότητα:</div>
                            <div class="step-calc-formula">$$P_1 = V_1 \\cdot I_1 = ${phys.V1.toFixed(2)}\\text{ V} \\cdot ${phys.I1.toFixed(2)}\\text{ A} = ${p1.toFixed(2)}\\text{ W}$$</div>
                            <div class="step-calc-formula">$$E_1 = P_1 \\cdot t = ${p1.toFixed(2)}\\text{ W} \\cdot 10\\text{ s} = ${e1.toFixed(1)}\\text{ J}$$</div>
                        </div>
                    `;
                } else {
                    return `
                        <div class="step-calc-line">
                            <div class="step-calc-header">1. Ολική Αντίσταση Σειράς υπό Βραχυκύκλωμα A₂:</div>
                            <div class="step-calc-formula">$$R_{\\text{ολ}} = R_1 = ${state.R1}\\ \\Omega \\quad (\\text{Ο } R_2 \\text{ έχει παρακαμφθεί πλήρως})$$</div>
                        </div>
                        <div class="step-calc-line">
                            <div class="step-calc-header">2. Παράκαμψη Αντιστάτη $R_2$ (Βραχυκύκλωση):</div>
                            <p style="font-size: 0.88rem; line-height: 1.5; margin: 2px 0;">
                                Επειδή όλο το ρεύμα από τον κόμβο $K$ εκτρέπεται μέσω του αμπερομέτρου $A_2$ ($R_{A2} \\approx 0\\ \\Omega$) κατευθείαν στον κόμβο επιστροφής $M$, η διαφορά δυναμικού στα άκρα του κλάδου του $R_2$ μηδενίζεται ($V_{KM} = 0.00\\text{ V}$). Συνεπώς, δεν διαρρέεται από ρεύμα:
                            </p>
                            <div class="step-calc-formula">$$V_2 = 0.00\\text{ V}, \\quad I_2 = \\frac{0.00\\text{ V}}{${state.R2}\\ \\Omega} = 0.00\\text{ A}$$</div>
                        </div>
                        <div class="step-calc-line">
                            <div class="step-calc-header">3. Ισχύς Κατανάλωσης & Θερμότητα:</div>
                            <div class="step-calc-formula">$$P_2 = 0.00\\text{ W}, \\quad E_2 = 0.0\\text{ J}$$</div>
                        </div>
                    `;
                }
            }

            if (state.faultInstrument === 'voltmeter_series') {
                const targetR = resistorKey === 'R1' ? state.R1 : state.R2;
                return `
                    <div class="step-calc-line">
                        <div class="step-calc-header">1. Εσωτερική Αντίσταση Βολτομέτρου & Ολική Αντίσταση:</div>
                        <div class="step-calc-formula">$$R_V \\to \\infty \\implies R_{\\text{ολ}} = R_V + R_1 + R_2 \\to \\infty\\ \\Omega$$</div>
                    </div>
                    <div class="step-calc-line">
                        <div class="step-calc-header">2. Μηδενισμός Ρεύματος Κυκλώματος (Νόμος του Ohm):</div>
                        <p style="font-size: 0.88rem; line-height: 1.5; margin: 2px 0;">
                            Επειδή το βολτόμετρο συνδέθηκε λανθασμένα σε σειρά (στη θέση του $A_1$), η τεράστια εσωτερική του αντίσταση ($R_V \\approx \\infty$) μπλοκάρει όλη τη ροή του ηλεκτρικού ρεύματος:
                        </p>
                        <div class="step-calc-formula">$$I = \\frac{V_{\\text{πηγ}}}{R_{\\text{ολ}}} = \\frac{${state.V_src}\\text{ V}}{\\infty\\ \\Omega} = 0.00\\text{ A}$$</div>
                    </div>
                    <div class="step-calc-line">
                        <div class="step-calc-header">3. Πτώση Τάσης στον $${resistorKey}$:</div>
                        <p style="font-size: 0.88rem; line-height: 1.5; margin: 2px 0;">
                            Εφόσον δεν διέρχεται ρεύμα από τον αντιστάτη, η πτώση τάσης στα άκρα του είναι μηδενική:
                        </p>
                        <div class="step-calc-formula">$$V_${resistorKey === 'R1' ? '1' : '2'} = I \\cdot ${resistorKey} = 0.00\\text{ A} \\cdot ${targetR}\\ \\Omega = 0.00\\text{ V}$$</div>
                    </div>
                    <div class="step-calc-line">
                        <div class="step-calc-header">4. Ένδειξη Βολτομέτρου Σειράς ($V_\\sigma$):</div>
                        <p style="font-size: 0.88rem; line-height: 1.5; margin: 2px 0;">
                            Ολόκληρη η τάση της πηγής εμφανίζεται στα άκρα του βολτομέτρου που συνδέθηκε σε σειρά:
                        </p>
                        <div class="step-calc-formula">$$V_\\sigma = V_{\\text{πηγ}} - V_1 - V_2 = ${state.V_src}\\text{ V} - 0 - 0 = ${state.V_src.toFixed(1)}\\text{ V}$$</div>
                    </div>
                `;
            }

            let rEqFormula = '';
            if (!state.switchClosed) {
                rEqFormula = `$$R_{\\text{ολ}} = \\infty\\ \\Omega \\quad (\\text{Ανοικτός Διακόπτης})$$`;
            } else if (state.brokenR1 || state.brokenR2) {
                rEqFormula = `$$R_{\\text{ολ}} = \\infty\\ \\Omega \\quad (\\text{Διακοπή λόγω Καταστροφής})$$`;
            } else {
                rEqFormula = `$$R_{\\text{ολ}} = R_1 + R_2 = ${state.shortR1 ? '0' : state.R1} + ${state.shortR2 ? '0' : state.R2} = ${phys.R_eq.toFixed(1)}\\ \\Omega$$`;
            }

            let iFormula = '';
            if (!state.switchClosed || state.brokenR1 || state.brokenR2) {
                iFormula = `$$I = \\frac{V_{\\text{πηγ}}}{R_{\\text{ολ}}} = \\frac{${state.V_src}\\text{ V}}{\\infty\\ \\Omega} = 0.00\\text{ A}$$`;
            } else {
                iFormula = `$$I = \\frac{V_{\\text{πηγ}}}{R_{\\text{ολ}}} = \\frac{${state.V_src}\\text{ V}}{${phys.R_eq.toFixed(1)}\\ \\Omega} = ${phys.I_total.toFixed(2)}\\text{ A}$$`;
            }

            let vStep = '';
            if (state.brokenR1) {
                vStep = `
                    <p style="font-size: 0.88rem; line-height: 1.5; margin: 2px 0;">
                        Λόγω καταστροφής του $R_1$, το ρεύμα είναι μηδέν ($I = 0\\text{ A}$) και $V_2 = 0\\text{ V}$. <strong>Ολόκληρη η τάση της πηγής εμφανίζεται στα άκρα του κατεστραμμένου $R_1$</strong>:
                    </p>
                    <div class="step-calc-formula">$$V_1 = V_{\\text{πηγ}} = ${state.V_src.toFixed(1)}\\text{ V}, \\quad V_2 = 0.00\\text{ V}$$</div>
                `;
            } else if (state.brokenR2) {
                vStep = `
                    <p style="font-size: 0.88rem; line-height: 1.5; margin: 2px 0;">
                        Λόγω καταστροφής του $R_2$, το ρεύμα είναι μηδέν ($I = 0\\text{ A}$), άρα $V_1 = 0\\text{ V}$, ενώ στα άκρα του $R_2$ εμφανίζεται ολόκληρη η τάση:
                    </p>
                    <div class="step-calc-formula">$$V_1 = 0.00\\text{ V}, \\quad V_2 = V_{\\text{πηγ}} = ${state.V_src.toFixed(1)}\\text{ V}$$</div>
                `;
            } else {
                vStep = `
                    <div class="step-calc-formula">$$V_1 = I \\cdot R_1 = ${phys.I_total.toFixed(2)}\\text{ A} \\cdot ${state.shortR1 ? 0 : state.R1}\\ \\Omega = ${phys.V1.toFixed(2)}\\text{ V}$$</div>
                    <div class="step-calc-formula">$$V_2 = I \\cdot R_2 = ${phys.I_total.toFixed(2)}\\text{ A} \\cdot ${state.shortR2 ? 0 : state.R2}\\ \\Omega = ${phys.V2.toFixed(2)}\\text{ V}$$</div>
                `;
            }

            return `
                <div class="step-calc-line">
                    <div class="step-calc-header">1. Ολική Αντίσταση Σειράς:</div>
                    ${rEqFormula}
                </div>
                <div class="step-calc-line">
                    <div class="step-calc-header">2. Κοινό Ρεύμα Κυκλώματος:</div>
                    ${iFormula}
                </div>
                <div class="step-calc-line">
                    <div class="step-calc-header">3. Πτώσεις Τάσης Αντιστατών:</div>
                    ${vStep}
                </div>
                <div class="step-calc-line">
                    <div class="step-calc-header">4. Θερμική Ισχύς Κατανάλωσης (σε Watt):</div>
                    <div class="step-calc-formula">$$P_1 = V_1 \\cdot I_1 = ${phys.V1.toFixed(2)}\\text{ V} \\cdot ${phys.I1.toFixed(2)}\\text{ A} = ${p1.toFixed(2)}\\text{ W}$$</div>
                    <div class="step-calc-formula">$$P_2 = V_2 \\cdot I_2 = ${phys.V2.toFixed(2)}\\text{ V} \\cdot ${phys.I2.toFixed(2)}\\text{ A} = ${p2.toFixed(2)}\\text{ W}$$</div>
                </div>
                <div class="step-calc-line">
                    <div class="step-calc-header">5. Εκλυόμενη Θερμότητα / Ενέργεια ($t = 10\\text{ s}$ - Νόμος Joule σε Joule):</div>
                    <div class="step-calc-formula">$$E_1 = P_1 \\cdot t = ${p1.toFixed(2)}\\text{ W} \\cdot 10\\text{ s} = ${e1.toFixed(1)}\\text{ J}$$</div>
                    <div class="step-calc-formula">$$E_2 = P_2 \\cdot t = ${p2.toFixed(2)}\\text{ W} \\cdot 10\\text{ s} = ${e2.toFixed(1)}\\text{ J}$$</div>
                </div>
            `;
        } else {
            // Parallel circuit
            if (state.faultInstrument === 'ammeter_parallel') {
                return `
                    <div class="step-calc-line">
                        <div class="step-calc-header">1. Ολική Αντίσταση υπό Βραχυκύκλωμα $A_1$:</div>
                        <div class="step-calc-formula">$$R_{\\text{ολ}} = R_{A1} = 0.00\\ \\Omega \\quad (\\text{Το } A_1 \\text{ συνδέθηκε κάθετα πριν τους κλάδους})$$</div>
                    </div>
                    <div class="step-calc-line">
                        <div class="step-calc-header">2. Παράκαμψη Παράλληλων Κλάδων $R_1, R_2$:</div>
                        <p style="font-size: 0.88rem; line-height: 1.5; margin: 2px 0;">
                            Επειδή όλο το ρεύμα εκτρέπεται μέσω του αμπερομέτρου $A_1$ μηδενικής αντίστασης, η διαφορά δυναμικού στους παράλληλους κλάδους μηδενίζεται ($V_{\\text{παρ}} = 0.00\\text{ V}$). Συνεπώς, δεν φτάνει καθόλου ρεύμα στους αντιστάτες:
                        </p>
                        <div class="step-calc-formula">$$V_1 = V_2 = 0.00\\text{ V}, \\quad I_1 = I_2 = 0.00\\text{ A}$$</div>
                    </div>
                    <div class="step-calc-line">
                        <div class="step-calc-header">3. Ισχύς Κατανάλωσης & Θερμότητα:</div>
                        <div class="step-calc-formula">$$P_1 = P_2 = 0.00\\text{ W}, \\quad E_1 = E_2 = 0.0\\text{ J}$$</div>
                    </div>
                `;
            }

            if (state.faultInstrument === 'ammeter2_parallel') {
                return `
                    <div class="step-calc-line">
                        <div class="step-calc-header">1. Ολική Αντίσταση υπό Βραχυκύκλωμα $A_2$:</div>
                        <div class="step-calc-formula">$$R_{\\text{ολ}} = R_{A2} = 0.00\\ \\Omega \\quad (\\text{Το } A_2 \\text{ συνδέθηκε κάθετα ανάμεσα στους } R_1, R_2)$$</div>
                    </div>
                    <div class="step-calc-line">
                        <div class="step-calc-header">2. Βραχυκύκλωση Παράλληλης Συστοιχίας:</div>
                        <p style="font-size: 0.88rem; line-height: 1.5; margin: 2px 0;">
                            Επειδή και οι δύο παράλληλοι κλάδοι μοιράζονται τις ίδιες γραμμές τροφοδοσίας, η κάθετη σύνδεση του $A_2$ ($R_{A2} \\approx 0\\ \\Omega$) μεταξύ των γραμμών βραχυκυκλώνει πλήρως όλη τη συστοιχία ($V_{\\text{παρ}} = 0.00\\text{ V}$):
                        </p>
                        <div class="step-calc-formula">$$V_1 = V_2 = 0.00\\text{ V}, \\quad I_1 = I_2 = 0.00\\text{ A}$$</div>
                        <p style="font-size: 0.88rem; line-height: 1.5; margin: 2px 0;">
                            Το κύριο αμπερόμετρο $A_{\\text{ολ}}$ και το $A_2$ διαρρέονται από το πλήρες ρεύμα βραχυκυκλώματος:
                        </p>
                        <div class="step-calc-formula">$$I_{\\text{ολ}} = I_{A_{\\text{ολ}}} = I_{A2} \\to \\infty\\text{ A}$$</div>
                    </div>
                    <div class="step-calc-line">
                        <div class="step-calc-header">3. Ισχύς Κατανάλωσης & Θερμότητα Αντιστατών:</div>
                        <div class="step-calc-formula">$$P_1 = P_2 = 0.00\\text{ W}, \\quad E_1 = E_2 = 0.0\\text{ J}$$</div>
                    </div>
                `;
            }

            if (state.faultInstrument === 'voltmeter_series') {
                return `
                    <div class="step-calc-line">
                        <div class="step-calc-header">1. Εσωτερική Αντίσταση Βολτομέτρου & Ολική Αντίσταση:</div>
                        <div class="step-calc-formula">$$R_V \\to \\infty \\implies R_{\\text{ολ}} = R_V + R_{\\text{παρ}} \\to \\infty\\ \\Omega$$</div>
                    </div>
                    <div class="step-calc-line">
                        <div class="step-calc-header">2. Μηδενισμός Ολικού Ρεύματος Κυρίου Αγωγού:</div>
                        <p style="font-size: 0.88rem; line-height: 1.5; margin: 2px 0;">
                            Το βολτόμετρο συνδέθηκε λανθασμένα σε σειρά στον κύριο αγωγό (πριν το $A_{\\text{ολ}}$). Λόγω της άπειρης εσωτερικής του αντίστασης ($R_V \\approx \\infty$), μπλοκάρει όλο το ρεύμα από την πηγή:
                        </p>
                        <div class="step-calc-formula">$$I_{\\text{ολ}} = \\frac{V_{\\text{πηγ}}}{R_{\\text{ολ}}} = \\frac{${state.V_src}\\text{ V}}{\\infty\\ \\Omega} = 0.00\\text{ A}$$</div>
                    </div>
                    <div class="step-calc-line">
                        <div class="step-calc-header">3. Μηδενισμός Τάσης Παράλληλης Συστοιχίας & Ρευμάτων Κλάδων:</div>
                        <p style="font-size: 0.88rem; line-height: 1.5; margin: 2px 0;">
                            Εφόσον $I_{\\text{ολ}} = 0\\text{ A}$, η τάση στους παράλληλους κλάδους μηδενίζεται ($V_{\\text{παρ}} = 0.00\\text{ V}$). Συνεπώς, κανένας κλάδος δεν διαρρέεται από ρεύμα:
                        </p>
                        <div class="step-calc-formula">$$V_1 = V_2 = 0.00\\text{ V}, \\quad I_1 = 0.00\\text{ A}, \\quad I_2 = 0.00\\text{ A}$$</div>
                    </div>
                    <div class="step-calc-line">
                        <div class="step-calc-header">4. Ένδειξη Βολτομέτρου Σειράς ($V_\\sigma$):</div>
                        <p style="font-size: 0.88rem; line-height: 1.5; margin: 2px 0;">
                            Ολόκληρη η τάση της πηγής εμφανίζεται στα άκρα του βολτομέτρου που συνδέθηκε σε σειρά:
                        </p>
                        <div class="step-calc-formula">$$V_\\sigma = V_{\\text{πηγ}} - V_{\\text{παρ}} = ${state.V_src}\\text{ V} - 0.00\\text{ V} = ${state.V_src.toFixed(1)}\\text{ V}$$</div>
                    </div>
                `;
            }

            let vPar = !state.switchClosed ?
                `$$V_1 = V_2 = 0.00\\text{ V} \\quad (\\text{Ανοικτός Διακόπτης})$$` :
                `$$V_1 = ${state.brokenR1 ? '0.00' : state.V_src.toFixed(1)}\\text{ V}, \\quad V_2 = ${state.brokenR2 ? '0.00' : state.V_src.toFixed(1)}\\text{ V}$$`;

            let iPar = '';
            if (!state.switchClosed || (state.brokenR1 && state.brokenR2)) {
                iPar = `$$I_1 = 0.00\\text{ A}, \\quad I_2 = 0.00\\text{ A}, \\quad I_{\\text{ολ}} = 0.00\\text{ A}$$`;
            } else if (state.brokenR1) {
                iPar = `$$I_1 = 0.00\\text{ A}\\ (\\text{Καταστροφή}), \\quad I_2 = \\frac{${state.V_src}\\text{ V}}{${state.R2}\\ \\Omega} = ${phys.I2.toFixed(2)}\\text{ A}, \\quad I_{\\text{ολ}} = I_2 = ${phys.I_total.toFixed(2)}\\text{ A}$$`;
            } else if (state.brokenR2) {
                iPar = `$$I_1 = \\frac{${state.V_src}\\text{ V}}{${state.R1}\\ \\Omega} = ${phys.I1.toFixed(2)}\\text{ A}, \\quad I_2 = 0.00\\text{ A}\\ (\\text{Καταστροφή}), \\quad I_{\\text{ολ}} = I_1 = ${phys.I_total.toFixed(2)}\\text{ A}$$`;
            } else {
                iPar = `$$I_1 = \\frac{V_1}{R_1} = \\frac{${phys.V1.toFixed(1)}\\text{ V}}{${state.R1}\\ \\Omega} = ${phys.I1.toFixed(2)}\\text{ A}$$
                        $$I_2 = \\frac{V_2}{R_2} = \\frac{${phys.V2.toFixed(1)}\\text{ V}}{${state.R2}\\ \\Omega} = ${phys.I2.toFixed(2)}\\text{ A}$$
                        $$I_{\\text{ολ}} = I_1 + I_2 = ${phys.I1.toFixed(2)}\\text{ A} + ${phys.I2.toFixed(2)}\\text{ A} = ${phys.I_total.toFixed(2)}\\text{ A}$$`;
            }

            return `
                <div class="step-calc-line">
                    <div class="step-calc-header">1. Τάσεις Παράλληλων Κλάδων:</div>
                    <div class="step-calc-formula">${vPar}</div>
                </div>
                <div class="step-calc-line">
                    <div class="step-calc-header">2. Ρεύματα Κλάδων (Νόμος Ohm):</div>
                    <div class="step-calc-formula">${iPar}</div>
                </div>
                <div class="step-calc-line">
                    <div class="step-calc-header">3. Θερμική Ισχύς Κατανάλωσης (σε Watt):</div>
                    <div class="step-calc-formula">$$P_1 = V_1 \\cdot I_1 = ${phys.V1.toFixed(2)}\\text{ V} \\cdot ${phys.I1.toFixed(2)}\\text{ A} = ${p1.toFixed(2)}\\text{ W}$$</div>
                    <div class="step-calc-formula">$$P_2 = V_2 \\cdot I_2 = ${phys.V2.toFixed(2)}\\text{ V} \\cdot ${phys.I2.toFixed(2)}\\text{ A} = ${p2.toFixed(2)}\\text{ W}$$</div>
                </div>
                <div class="step-calc-line">
                    <div class="step-calc-header">4. Εκλυόμενη Θερμότητα / Ενέργεια ($t = 10\\text{ s}$ - Νόμος Joule σε Joule):</div>
                    <div class="step-calc-formula">$$E_1 = P_1 \\cdot t = ${p1.toFixed(2)}\\text{ W} \\cdot 10\\text{ s} = ${e1.toFixed(1)}\\text{ J}$$</div>
                    <div class="step-calc-formula">$$E_2 = P_2 \\cdot t = ${p2.toFixed(2)}\\text{ W} \\cdot 10\\text{ s} = ${e2.toFixed(1)}\\text{ J}$$</div>
                </div>
            `;
        }
    }

    /**
     * Render the Multimeter & Detailed Calculation Steps HUD
     */
    function updateHud() {
        const hudCard = document.getElementById('sim-hud-card');
        if (!hudCard) return;

        const phys = computePhysics();
        const probeTarget = state.hoverProbe || state.activeProbe || 'R1';
        const isSteps = state.showSteps;

        let detailsHtml = '';

        if (probeTarget === 'R1') {
            const v = phys.V1;
            const i = phys.I1;
            const isShorted = state.shortR1;
            const isBroken = state.brokenR1;
            const p1 = phys.P1;
            const p2 = phys.P2;
            const e1 = p1 * 10;
            const e2 = p2 * 10;

            detailsHtml = `
                <div class="hud-item-header">
                    <span class="hud-probe-icon">📦</span>
                    <div class="hud-item-title-wrap">
                        <h4 class="hud-item-title">Αντιστάτης <span class="math-expr"><i class="math-var">R</i><sub class="math-sub">1</sub></span> (Κόμβοι A − B)</h4>
                        <span class="hud-item-badge ${state.faultInstrument === 'ammeter_parallel' ? 'bad' : (isBroken ? 'bad' : (isShorted ? 'bad' : (state.faultInstrument === 'voltmeter_series' ? 'bad' : 'good')))}">
                            ${state.faultInstrument === 'ammeter_parallel' ? '⚪ Παρακαμφθείς (Βραχυκύκλωμα από A₁)' : (state.faultInstrument === 'voltmeter_series' ? '⚪ Ανενεργός (Διακοπή Ρεύματος από Vσ)' : (isBroken ? '💥 Καταστροφή (Ανοικτό Κύκλωμα)' : (isShorted ? '⚠️ Βραχυκυκλωμένος (Παρακαμφθείς)' : (state.faultInstrument === 'ammeter2_parallel' ? '⚡ Ενεργό Στοιχείο (Κανονική Ροή)' : 'Ενεργό Στοιχείο'))))}
                        </span>
                    </div>
                </div>

                <div class="hud-readouts-grid cols-3" style="margin-bottom: 10px;">
                    <div class="hud-meter-box">
                        <span class="meter-lbl"><span>Αντίσταση</span><span class="meter-symbol">(<span class="math-expr"><i class="math-var">R</i><sub class="math-sub">1</sub></span>):</span></span>
                        <span class="meter-val text-resistor">${state.R1} Ω</span>
                    </div>
                    <div class="hud-meter-box">
                        <span class="meter-lbl"><span>Ένταση Ρεύματος</span><span class="meter-symbol">(<span class="math-expr"><i class="math-var">I</i><sub class="math-sub">1</sub></span>):</span></span>
                        <span class="meter-val text-current">${i.toFixed(2)} A</span>
                    </div>
                    <div class="hud-meter-box">
                        <span class="meter-lbl"><span>Πτώση Τάσης</span><span class="meter-symbol">(<span class="math-expr"><i class="math-var">V</i><sub class="math-sub">1</sub></span>):</span></span>
                        <span class="meter-val text-voltage">${v.toFixed(2)} V</span>
                    </div>
                </div>

                <div class="hud-readouts-grid cols-4">
                    <div class="hud-meter-box">
                        <span class="meter-lbl"><span>Θερμική Ισχύς</span><span class="meter-symbol">(<span class="math-expr"><i class="math-var">P</i><sub class="math-sub">1</sub></span>):</span></span>
                        <span class="meter-val text-power">${p1.toFixed(2)} W</span>
                    </div>
                    <div class="hud-meter-box">
                        <span class="meter-lbl"><span>Θερμική Ισχύς</span><span class="meter-symbol">(<span class="math-expr"><i class="math-var">P</i><sub class="math-sub">2</sub></span>):</span></span>
                        <span class="meter-val text-power">${p2.toFixed(2)} W</span>
                    </div>
                    <div class="hud-meter-box">
                        <span class="meter-lbl"><span>Θερμότητα Joule</span><span class="meter-symbol">(<span class="math-expr"><i class="math-var">E</i><sub class="math-sub">1</sub></span>, <span class="math-expr"><i class="math-var">t</i> = 10s</span>):</span></span>
                        <span class="meter-val text-energy">${e1.toFixed(1)} J</span>
                    </div>
                    <div class="hud-meter-box">
                        <span class="meter-lbl"><span>Θερμότητα Joule</span><span class="meter-symbol">(<span class="math-expr"><i class="math-var">E</i><sub class="math-sub">2</sub></span>, <span class="math-expr"><i class="math-var">t</i> = 10s</span>):</span></span>
                        <span class="meter-val text-energy">${e2.toFixed(1)} J</span>
                    </div>
                </div>

                ${isShorted ? `
                    <div class="hud-steps-box" style="margin-top: 10px; border-color: rgba(239, 68, 68, 0.4); background: rgba(239, 68, 68, 0.06);">
                        <div class="hud-steps-title" style="color: #f87171;">ℹ️ Τρόπος Παράκαμψης: ${state.shortModeR1 === 'alternative' ? 'Έμμεση Παράκαμψη (G ↔ B)' : 'Άμεση Παράκαμψη (A ↔ B)'}</div>
                        <p style="font-size: 0.88rem; line-height: 1.5; margin: 4px 0;">
                            ${state.shortModeR1 === 'alternative' ? (state.topology === 'series' ? 
                                'Το καλώδιο συνδέει τους κόμβους <strong>G ↔ B</strong> περνώντας με καμπύλη κάτω από τον $R_1$. Επειδή το ιδανικό αμπερόμετρο $A_1$ και ο διακόπτης έχουν μηδενική αντίσταση, ο κόμβος G έχει ακριβώς το ίδιο δυναμικό με τον A ($V_G = V_A = V_{\\text{πηγ}}$). Επομένως, ο κόμβος B τίθεται στο δυναμικό $V_{\\text{πηγ}}$, μηδενίζοντας την τάση στα άκρα του $R_1$ ($V_1 = V_A - V_B = 0\\text{ V}$). Ο αντιστάτης $R_1$ παρακάμπτεται πλήρως!' : 
                                'Το καλώδιο συνδέει τους κόμβους <strong>A ↔ E</strong>. Ο κόμβος A βρίσκεται στο δυναμικό του άνω πόλου ($V_{\\text{πηγ}}$) και ο κόμβος E στο δυναμικό του κάτω πόλου ($0\\text{ V}$). Η σύνδεση παρακάμπτει πλήρως τον $R_1$ και συνδέει απευθείας τους πόλους της πηγής (Ολικό Βραχυκύκλωμα)!') : 
                                (state.topology === 'series' ? 
                                'Το καλώδιο συνδέεται απευθείας στα άκρα του αντιστάτη $R_1$ (κόμβοι A και B), μηδενίζοντας άμεσα την τάση $V_1 = 0\\text{ V}$.' : 
                                'Το καλώδιο συνδέεται απευθείας στα άκρα του κλάδου 1 (κόμβοι A και B), προκαλώντας παράκαμψη του $R_1$ και ολικό βραχυκύκλωμα της πηγής.')}
                        </p>
                    </div>
                ` : ''}

                ${isSteps ? `
                    <div class="hud-steps-box" style="margin-top: 14px;">
                        <div class="hud-steps-title">📐 Αναλυτική Διαδικασία Υπολογισμού:</div>
                        ${buildCalculationStepsHtml('R1', phys, p1, p2, e1, e2)}
                    </div>
                ` : ''}
            `;
        } else if (probeTarget === 'R2') {
            const v = phys.V2;
            const i = phys.I2;
            const isShorted = state.shortR2;
            const isBroken = state.brokenR2;
            const p1 = phys.P1;
            const p2 = phys.P2;
            const e1 = p1 * 10;
            const e2 = p2 * 10;

            detailsHtml = `
                <div class="hud-item-header">
                    <span class="hud-probe-icon">📦</span>
                    <div class="hud-item-title-wrap">
                        <h4 class="hud-item-title">Αντιστάτης <span class="math-expr"><i class="math-var">R</i><sub class="math-sub">2</sub></span> (Κόμβοι ${state.topology === 'series' ? 'B − C' : 'C − E'})</h4>
                        <span class="hud-item-badge ${state.faultInstrument === 'ammeter_parallel' || state.faultInstrument === 'ammeter2_parallel' || state.faultInstrument === 'voltmeter_series' ? 'bad' : (isBroken ? 'bad' : (isShorted ? 'bad' : 'good'))}">
                            ${state.faultInstrument === 'ammeter_parallel' ? '⚪ Παρακαμφθείς (Βραχυκύκλωμα από A₁)' : (state.faultInstrument === 'ammeter2_parallel' ? '⚪ Παρακαμφθείς (Βραχυκύκλωση από A₂)' : (state.faultInstrument === 'voltmeter_series' ? '⚪ Ανενεργός (Διακοπή Ρεύματος από Vσ)' : (isBroken ? '💥 Καταστροφή (Ανοικτό Κύκλωμα)' : (isShorted ? '⚠️ Βραχυκυκλωμένος (Παρακαμφθείς)' : 'Ενεργό Στοιχείο'))))}
                        </span>
                    </div>
                </div>

                <div class="hud-readouts-grid cols-3" style="margin-bottom: 10px;">
                    <div class="hud-meter-box">
                        <span class="meter-lbl"><span>Αντίσταση</span><span class="meter-symbol">(<span class="math-expr"><i class="math-var">R</i><sub class="math-sub">2</sub></span>):</span></span>
                        <span class="meter-val text-resistor">${state.R2} Ω</span>
                    </div>
                    <div class="hud-meter-box">
                        <span class="meter-lbl"><span>Ένταση Ρεύματος</span><span class="meter-symbol">(<span class="math-expr"><i class="math-var">I</i><sub class="math-sub">2</sub></span>):</span></span>
                        <span class="meter-val text-current">${i.toFixed(2)} A</span>
                    </div>
                    <div class="hud-meter-box">
                        <span class="meter-lbl"><span>Πτώση Τάσης</span><span class="meter-symbol">(<span class="math-expr"><i class="math-var">V</i><sub class="math-sub">2</sub></span>):</span></span>
                        <span class="meter-val text-voltage">${v.toFixed(2)} V</span>
                    </div>
                </div>

                <div class="hud-readouts-grid cols-4">
                    <div class="hud-meter-box">
                        <span class="meter-lbl"><span>Θερμική Ισχύς</span><span class="meter-symbol">(<span class="math-expr"><i class="math-var">P</i><sub class="math-sub">1</sub></span>):</span></span>
                        <span class="meter-val text-power">${p1.toFixed(2)} W</span>
                    </div>
                    <div class="hud-meter-box">
                        <span class="meter-lbl"><span>Θερμική Ισχύς</span><span class="meter-symbol">(<span class="math-expr"><i class="math-var">P</i><sub class="math-sub">2</sub></span>):</span></span>
                        <span class="meter-val text-power">${p2.toFixed(2)} W</span>
                    </div>
                    <div class="hud-meter-box">
                        <span class="meter-lbl"><span>Θερμότητα Joule</span><span class="meter-symbol">(<span class="math-expr"><i class="math-var">E</i><sub class="math-sub">1</sub></span>, <span class="math-expr"><i class="math-var">t</i> = 10s</span>):</span></span>
                        <span class="meter-val text-energy">${e1.toFixed(1)} J</span>
                    </div>
                    <div class="hud-meter-box">
                        <span class="meter-lbl"><span>Θερμότητα Joule</span><span class="meter-symbol">(<span class="math-expr"><i class="math-var">E</i><sub class="math-sub">2</sub></span>, <span class="math-expr"><i class="math-var">t</i> = 10s</span>):</span></span>
                        <span class="meter-val text-energy">${e2.toFixed(1)} J</span>
                    </div>
                </div>

                ${isShorted ? `
                    <div class="hud-steps-box" style="margin-top: 10px; border-color: rgba(239, 68, 68, 0.4); background: rgba(239, 68, 68, 0.06);">
                        <div class="hud-steps-title" style="color: #f87171;">ℹ️ Τρόπος Παράκαμψης: ${state.shortModeR2 === 'alternative' ? 'Έμμεση Παράκαμψη (B ↔ E)' : 'Άμεση Παράκαμψη (B ↔ C)'}</div>
                        <p style="font-size: 0.88rem; line-height: 1.5; margin: 4px 0;">
                            ${state.shortModeR2 === 'alternative' ? (state.topology === 'series' ? 
                                'Το καλώδιο συνδέει τους κόμβους <strong>B ↔ E</strong>. Επειδή ο κάτω αγωγός επιστροφής και το $A_3$ έχουν μηδενική αντίσταση, ο κόμβος E έχει ακριβώς το ίδιο δυναμικό με τον C ($V_E = V_C = 0\\text{ V}$). Επομένως, ο κόμβος B τίθεται στο μηδενικό δυναμικό ($0\\text{ V}$), μηδενίζοντας την τάση στα άκρα του $R_2$ ($V_2 = V_B - V_C = 0\\text{ V}$). Ο αντιστάτης $R_2$ παρακάμπτεται πλήρως!' : 
                                'Το καλώδιο συνδέει τους κόμβους <strong>B ↔ C</strong>. Ο κόμβος B είναι στο $0\\text{ V}$ και ο C στο $V_{\\text{πηγ}}$. Η σύνδεση παρακάμπτει πλήρως τον $R_2$ και συνδέει απευθείας τους πόλους της πηγής (Ολικό Βραχυκύκλωμα)!') : 
                                (state.topology === 'series' ? 
                                'Το καλώδιο συνδέεται απευθείας στα άκρα του αντιστάτη $R_2$ (κόμβοι B και C), μηδενίζοντας άμεσα την τάση $V_2 = 0\\text{ V}$.' : 
                                'Το καλώδιο συνδέεται απευθείας στα άκρα του κλάδου 2 (κόμβοι C και E), προκαλώντας παράκαμψη του $R_2$ και ολικό βραχυκύκλωμα της πηγής.')}
                        </p>
                    </div>
                ` : ''}

                ${isSteps ? `
                    <div class="hud-steps-box" style="margin-top: 14px;">
                        <div class="hud-steps-title">📐 Αναλυτική Διαδικασία Υπολογισμού:</div>
                        ${buildCalculationStepsHtml('R2', phys, p1, p2, e1, e2)}
                    </div>
                ` : ''}
            `;
        } else if (probeTarget === 'source') {
            const isFaultAmmeter1 = state.faultInstrument === 'ammeter_parallel';
            const isFaultAmmeter2 = state.faultInstrument === 'ammeter2_parallel';
            const isFaultVoltmeter = state.faultInstrument === 'voltmeter_series';
            const isTotalShort = phys.status === 'total_short';
            const iTotDisplay = phys.I_total === Infinity ? '∞ A (Υπερένταση / Βραχυκύκλωμα!)' : `${phys.I_total.toFixed(2)} A`;
            const reqDisplay = phys.R_eq === Infinity ? '∞ Ω (Ανοικτό Κύκλωμα)' : (phys.R_eq === 0 ? '0.00 Ω (Βραχυκύκλωμα)' : `${phys.R_eq.toFixed(2)} Ω`);
            const pTotDisplay = phys.P_total === Infinity ? '∞ W (Κίνδυνος Υπερθέρμανσης!)' : `${phys.P_total.toFixed(2)} W`;

            detailsHtml = `
                <div class="hud-item-header">
                    <span class="hud-probe-icon">🔋</span>
                    <div class="hud-item-title-wrap">
                        <h4 class="hud-item-title">Ηλεκτρική Πηγή (DC Voltage Source)</h4>
                        <span class="hud-item-badge ${isTotalShort ? 'bad' : (isFaultAmmeter2 ? 'warn' : (isFaultVoltmeter ? 'warn' : 'good'))}">${isTotalShort ? '⚠️ Κατάσταση Βραχυκυκλώματος' : (isFaultAmmeter2 ? '⚠️ Μερικό Βραχυκύκλωμα (R₁ ενεργό)' : (isFaultVoltmeter ? '⚪ Διακοπή Ροής (Rv → ∞)' : 'Κύρια Τροφοδοσία'))}</span>
                    </div>
                </div>

                <div class="hud-readouts-grid">
                    <div class="hud-meter-box">
                        <span class="meter-lbl"><span>Ισοδύναμη Αντίσταση</span><span class="meter-symbol">(<span class="math-expr"><i class="math-var">R</i><sub class="math-sub">ολ</sub></span>):</span></span>
                        <span class="meter-val text-resistor">${reqDisplay}</span>
                    </div>
                    <div class="hud-meter-box">
                        <span class="meter-lbl"><span>Ολικό Ρεύμα</span><span class="meter-symbol">(<span class="math-expr"><i class="math-var">I</i><sub class="math-sub">ολ</sub></span>):</span></span>
                        <span class="meter-val text-current ${phys.I_total === Infinity ? 'danger-reading' : ''}">${iTotDisplay}</span>
                    </div>
                    <div class="hud-meter-box">
                        <span class="meter-lbl"><span>Τάση Πηγής</span><span class="meter-symbol">(<span class="math-expr"><i class="math-var">V</i><sub class="math-sub">πηγ</sub></span>):</span></span>
                        <span class="meter-val text-voltage">${state.V_src} V</span>
                    </div>
                    <div class="hud-meter-box">
                        <span class="meter-lbl"><span>Ολική Ισχύς</span><span class="meter-symbol">(<span class="math-expr"><i class="math-var">P</i><sub class="math-sub">ολ</sub></span>):</span></span>
                        <span class="meter-val text-power ${phys.P_total === Infinity ? 'danger-reading' : ''}">${pTotDisplay}</span>
                    </div>
                </div>

                ${isSteps ? `
                    <div class="hud-steps-box">
                        <div class="hud-steps-title">📐 Επιστημονική Ανάλυση Πηγής:</div>
                        ${isFaultAmmeter1 ? (state.switchClosed ? `
                            <div class="step-calc-line">
                                <div class="step-calc-header">1. Επίδραση Λανθασμένης Σύνδεσης Αμπερομέτρου A₁:</div>
                                <p style="font-size: 0.88rem; line-height: 1.5; margin: 2px 0;">
                                    Το αμπερόμετρο $A_1$ ($R_A \\approx 0\\ \\Omega$) τοποθετήθηκε κάθετα ανάμεσα στον κόμβο $K$ και τον κόμβο $F$, συνδέοντας παράλληλα τους δύο πόλους της πηγής.
                                    Παρακάμπτει πλήρως τη συστοιχία των αντιστατών $R_1 + R_2 = ${state.R1 + state.R2}\\ \\Omega$.
                                </p>
                                <div class="step-calc-formula">$$R_{\\text{ολ}} = R_A = 0.00\\ \\Omega \\quad (\\text{Ολικό Βραχυκύκλωμα})$$</div>
                            </div>
                            <div class="step-calc-line">
                                <div class="step-calc-header">2. Ολικό Ρεύμα από τον Νόμο του Ohm:</div>
                                <div class="step-calc-formula">$$I_{\\text{ολ}} = \\frac{V_{\\text{πηγ}}}{R_{\\text{ολ}}} = \\frac{${state.V_src}\\text{ V}}{0\\ \\Omega} \\to \\infty\\text{ A} \\quad (\\text{Άπειρο Ρεύμα / Υπερένταση})$$</div>
                            </div>
                            <div class="step-calc-line">
                                <div class="step-calc-header">3. Συνολική Παρεχόμενη Ισχύς:</div>
                                <div class="step-calc-formula">$$P_{\\text{ολ}} = V_{\\text{πηγ}} \\cdot I_{\\text{ολ}} \\to \\infty\\text{ W} \\quad (\\text{Κίνδυνος Άμεσης Καταστροφής})$$</div>
                            </div>
                        ` : `
                            <div class="step-calc-line">
                                <div class="step-calc-header">1. Κατάσταση Κυκλώματος:</div>
                                <div class="step-calc-formula">$$R_{\\text{ολ}} = \\infty\\ \\Omega \\quad (\\text{Ανοικτός Διακόπτης})$$</div>
                            </div>
                            <div class="step-calc-line">
                                <div class="step-calc-header">2. Ρεύμα:</div>
                                <div class="step-calc-formula">$$I_{\\text{ολ}} = 0.00\\text{ A}$$</div>
                            </div>
                        `) : isFaultAmmeter2 ? (state.switchClosed ? `
                            <div class="step-calc-line">
                                <div class="step-calc-header">1. Επίδραση Λανθασμένης Σύνδεσης Αμπερομέτρου A₂:</div>
                                <p style="font-size: 0.88rem; line-height: 1.5; margin: 2px 0;">
                                    Το αμπερόμετρο $A_2$ ($R_A \\approx 0\\ \\Omega$) συνδέθηκε κάθετα μεταξύ κόμβου $K$ και κόμβου $M$, παρακάμπτοντας τον αντιστάτη $R_2 = ${state.R2}\\ \\Omega$.
                                    Η ισοδύναμη αντίσταση του κυκλώματος είναι αποκλειστικά ο $R_1$:
                                </p>
                                <div class="step-calc-formula">$$R_{\\text{ολ}} = R_1 = ${state.R1.toFixed(1)}\\ \\Omega \\quad (\\text{Μερικό Βραχυκύκλωμα})$$</div>
                            </div>
                            <div class="step-calc-line">
                                <div class="step-calc-header">2. Ολικό Ρεύμα από τον Νόμο του Ohm:</div>
                                <div class="step-calc-formula">$$I_{\\text{ολ}} = \\frac{V_{\\text{πηγ}}}{R_{\\text{ολ}}} = \\frac{${state.V_src}\\text{ V}}{${state.R1}\\ \\Omega} = ${phys.I_total.toFixed(2)}\\text{ A}$$</div>
                            </div>
                            <div class="step-calc-line">
                                <div class="step-calc-header">3. Συνολική Παρεχόμενη Ισχύς:</div>
                                <div class="step-calc-formula">$$P_{\\text{ολ}} = V_{\\text{πηγ}} \\cdot I_{\\text{ολ}} = P_1 = ${phys.P_total.toFixed(2)}\\text{ W}$$</div>
                            </div>
                        ` : `
                            <div class="step-calc-line">
                                <div class="step-calc-header">1. Κατάσταση Κυκλώματος:</div>
                                <div class="step-calc-formula">$$R_{\\text{ολ}} = \\infty\\ \\Omega \\quad (\\text{Ανοικτός Διακόπτης})$$</div>
                            </div>
                            <div class="step-calc-line">
                                <div class="step-calc-header">2. Ρεύμα:</div>
                                <div class="step-calc-formula">$$I_{\\text{ολ}} = 0.00\\text{ A}$$</div>
                            </div>
                        `) : isFaultVoltmeter ? (state.switchClosed ? `
                            <div class="step-calc-line">
                                <div class="step-calc-header">1. Επίδραση Λανθασμένης Σύνδεσης Βολτομέτρου σε Σειρά ($V_\\sigma$):</div>
                                <p style="font-size: 0.88rem; line-height: 1.5; margin: 2px 0;">
                                    Το βολτόμετρο $V_\\sigma$ ($R_V \\to \\infty$) συνδέθηκε ${state.topology === 'series' ? 'σε σειρά στη θέση του $A_1$' : 'σε σειρά στον κύριο αγωγό τροφοδοσίας πριν το $A_{\\text{ολ}}$'}.
                                    Λόγω της τεράστιας εσωτερικής του αντίστασης, η ισοδύναμη αντίσταση του κυκλώματος τείνει στο άπειρο:
                                </p>
                                <div class="step-calc-formula">$$R_{\\text{ολ}} = R_V + R_{\\text{φορτίου}} \\to \\infty\\ \\Omega \\quad (\\text{Μπλοκάρισμα Ροής})$$</div>
                            </div>
                            <div class="step-calc-line">
                                <div class="step-calc-header">2. Ολικό Ρεύμα από τον Νόμο του Ohm:</div>
                                <div class="step-calc-formula">$$I_{\\text{ολ}} = \\frac{V_{\\text{πηγ}}}{R_{\\text{ολ}}} = \\frac{${state.V_src}\\text{ V}}{\\infty\\ \\Omega} = 0.00\\text{ A}$$</div>
                            </div>
                            <div class="step-calc-line">
                                <div class="step-calc-header">3. Συνολική Παρεχόμενη Ισχύς:</div>
                                <div class="step-calc-formula">$$P_{\\text{ολ}} = V_{\\text{πηγ}} \\cdot I_{\\text{ολ}} = ${state.V_src}\\text{ V} \\cdot 0.00\\text{ A} = 0.00\\text{ W}$$</div>
                            </div>
                        ` : `
                            <div class="step-calc-line">
                                <div class="step-calc-header">1. Κατάσταση Κυκλώματος:</div>
                                <div class="step-calc-formula">$$R_{\\text{ολ}} = \\infty\\ \\Omega \\quad (\\text{Ανοικτός Διακόπτης})$$</div>
                            </div>
                            <div class="step-calc-line">
                                <div class="step-calc-header">2. Ρεύμα:</div>
                                <div class="step-calc-formula">$$I_{\\text{ολ}} = 0.00\\text{ A}$$</div>
                            </div>
                        `) : `
                            <div class="step-calc-line">
                                <div class="step-calc-header">1. Υπολογισμός $R_{\\text{ολ}}$:</div>
                                ${!state.switchClosed ? `
                                    <div class="step-calc-formula">$$R_{\\text{ολ}} = \\infty\\ \\Omega \\quad (\\text{Ανοικτός Διακόπτης})$$</div>
                                ` : (state.brokenR1 || state.brokenR2) ? (state.topology === 'series' ? `
                                    <div class="step-calc-formula">$$R_{\\text{ολ}} = \\infty\\ \\Omega \\quad (\\text{Διακοπή Σειράς})$$</div>
                                ` : (state.brokenR1 && state.brokenR2) ? `
                                    <div class="step-calc-formula">$$R_{\\text{ολ}} = \\infty\\ \\Omega \\quad (\\text{Διακοπή & των 2 Κλάδων})$$</div>
                                ` : `
                                    <div class="step-calc-formula">$$R_{\\text{ολ}} = ${phys.R_eq.toFixed(2)}\\ \\Omega$$</div>
                                `) : (state.topology === 'series' ? `
                                    <div class="step-calc-formula">$$R_{\\text{ολ}} = R_1 + R_2 = ${phys.R_eq.toFixed(1)}\\ \\Omega$$</div>
                                ` : `
                                    <div class="step-calc-formula">$$R_{\\text{ολ}} = \\frac{R_1 \\cdot R_2}{R_1 + R_2} = \\frac{${state.R1} \\cdot ${state.R2}}{${state.R1} + ${state.R2}} = ${phys.R_eq.toFixed(2)}\\ \\Omega$$</div>
                                `)}
                            </div>
                            <div class="step-calc-line">
                                <div class="step-calc-header">2. Ολικό Ρεύμα από τον Νόμο του Ohm:</div>
                                ${(!state.switchClosed || ((state.brokenR1 || state.brokenR2) && state.topology === 'series') || (state.brokenR1 && state.brokenR2)) ? `
                                    <div class="step-calc-formula">$$I_{\\text{ολ}} = \\frac{V_{\\text{πηγ}}}{R_{\\text{ολ}}} = \\frac{${state.V_src}\\text{ V}}{\\infty\\ \\Omega} = 0.00\\text{ A}$$</div>
                                ` : `
                                    <div class="step-calc-formula">$$I_{\\text{ολ}} = \\frac{V_{\\text{πηγ}}}{R_{\\text{ολ}}} = ${phys.I_total.toFixed(2)}\\text{ A}$$</div>
                                `}
                            </div>
                            <div class="step-calc-line">
                                <div class="step-calc-header">3. Συνολική Παρεχόμενη Ισχύς:</div>
                                <div class="step-calc-formula">$$P_{\\text{ολ}} = V_{\\text{πηγ}} \\cdot I_{\\text{ολ}} = P_1 + P_2 = ${phys.P_total.toFixed(2)}\\text{ W}$$</div>
                            </div>
                        `}
                    </div>
                ` : ''}
            `;
        } else if (probeTarget === 'switch') {
            const swCurrent = phys.I_switch === Infinity ? '∞ A (Υπερένταση / Βραχυκύκλωμα)' : `${phys.I_switch.toFixed(2)} A`;
            detailsHtml = `
                <div class="hud-item-header">
                    <span class="hud-probe-icon">🕹️</span>
                    <div class="hud-item-title-wrap">
                        <h4 class="hud-item-title">Διακόπτης Κυκλώματος K</h4>
                        <span class="hud-item-badge ${state.switchClosed ? 'good' : 'bad'}">
                            ${state.switchClosed ? 'Κλειστός (Επιτρέπει τη διέλευση ρεύματος)' : 'Ανοικτός (Διακόπτει το κύκλωμα)'}
                        </span>
                    </div>
                </div>

                <div class="hud-readouts-grid cols-2">
                    <div class="hud-meter-box">
                        <span class="meter-lbl"><span>Τάση Διακόπτη</span><span class="meter-symbol">(<span class="math-expr"><i class="math-var">V</i><sub class="math-sub">διακ</sub></span>):</span></span>
                        <span class="meter-val text-voltage">${phys.V_switch.toFixed(2)} V</span>
                    </div>
                    <div class="hud-meter-box">
                        <span class="meter-lbl"><span>Ρεύμα Διακόπτη</span><span class="meter-symbol">(<span class="math-expr"><i class="math-var">I</i><sub class="math-sub">διακ</sub></span>):</span></span>
                        <span class="meter-val text-current ${phys.I_switch === Infinity ? 'danger-reading' : ''}">${swCurrent}</span>
                    </div>
                </div>

                ${isSteps ? `
                    <div class="hud-steps-box">
                        <div class="hud-steps-title">💡 Θεωρητική Επεξήγηση (Κουίζ Ερώτηση 16):</div>
                        <p style="margin: 4px 0; font-size: 0.9rem; line-height: 1.5;">
                            ${state.switchClosed ? `
                                Όταν ο διακόπτης είναι <strong>κλειστός</strong>, συμπεριφέρεται ως ιδανικό καλώδιο μηδενικής αντίστασης ($R_K = 0\\ \\Omega$). Η πτώση τάσης στα άκρα του είναι <strong>μηδενική ($V_{\\text{διακ}} = 0\\text{ V}$)</strong> και διαρρέεται από το πλήρες ρεύμα $I$.
                            ` : `
                                Όταν ο διακόπτης είναι <strong>ανοικτός</strong>, η αντίστασή του τείνει στο άπειρο ($R_K \\to \\infty$). Το ρεύμα μηδενίζεται ($I = 0\\text{ A}$), και <strong>ολόκληρη η τάση της πηγής εμφανίζεται στα άκρα του διακόπτη ($V_{\\text{διακ}} = V_{\\text{πηγ}} = ${state.V_src}\\text{ V}$)</strong>!
                            `}
                        </p>
                    </div>
                ` : ''}
            `;
        } else if (probeTarget.startsWith('voltmeter')) {
            let vmTitle = 'Ιδανικό Βολτόμετρο (R_V → ∞)';
            let vmReading = 0;
            let vmSubtitle = '';
            let vmExplanation = '';
            let vmBadgeClass = 'good';
            let vmBadgeText = 'RV → ∞ (Ιδανικό Όργανο)';

            if (probeTarget === 'voltmeter_src') {
                vmTitle = 'Βολτόμετρο Πηγής Τάσης (Vπηγ)';
                vmReading = state.V_src;
                vmSubtitle = 'Συνδεδεμένο παράλληλα στους πόλους της ηλεκτρικής πηγής';
                vmExplanation = `Το βολτόμετρο συνδέεται πάντοτε <strong>παράλληλα</strong> στους πόλους της ηλεκτρικής πηγής. Μετράει την ηλεκτρική τάση (διαφορά δυναμικού) που παρέχει η πηγή στο κύκλωμα: $V_{\\text{πηγ}} = ${state.V_src}\\text{ V}$. Επειδή ένα ιδανικό βολτόμετρο έχει άπειρη εσωτερική αντίσταση ($R_V \\to \\infty$), δεν απορροφά ρεύμα ($I_V = 0\\text{ A}$) και δεν επηρεάζει καθόλου τη λειτουργία του κυκλώματος.`;
            } else if (probeTarget === 'voltmeter_series') {
                vmTitle = 'Βολτόμετρο Vσ (⚠️ ΛΑΝΘΑΣΜΕΝΗ ΣΥΝΔΕΣΗ ΣΕ ΣΕΙΡΑ)';
                vmReading = state.switchClosed ? state.V_src : 0;
                vmBadgeClass = 'bad';
                vmBadgeText = '⚠️ Rv → ∞ (Διακοπή Ρεύματος)';
                vmSubtitle = state.topology === 'series' ? 
                    'Συνδεδεμένο σε σειρά στη θέση του A₁ (πριν τον R₁)' : 
                    'Συνδεδεμένο σε σειρά στον κύριο αγωγό (πριν το Aολ)';
                vmExplanation = `
                    <strong>1. Σφάλμα Συνδεσμολογίας:</strong> Το βολτόμετρο συνδέθηκε <em>σε σειρά</em> με το κύκλωμα αντί να συνδεθεί παράλληλα στα άκρα κάποιου στοιχείου.<br>
                    <strong>2. Τεράστια Εσωτερική Αντίσταση:</strong> Ένα ιδανικό βολτόμετρο διαθέτει σχεδόν άπειρη εσωτερική αντίσταση ($R_V \\to \\infty$). Συνδέοντάς το όμως σε σειρά, λειτουργεί σαν <strong>ανοικτός διακόπτης (τεράστιο εμπόδιο)</strong> που μπλοκάρει τη ροή των ηλεκτρονίων.<br>
                    <strong>3. Μηδενισμός Ρεύματος:</strong> Σύμφωνα με τον Νόμο του Ohm:
                    $$I = \\frac{V_{\\text{πηγ}}}{R_{\\text{ολ}}} = \\frac{${state.V_src}\\text{ V}}{\\infty\\ \\Omega} \\to 0.00\\text{ A}$$
                    Κανένα ρεύμα δεν διαρρέει τους αντιστάτες ($I = 0.00\\text{ A}$), ούτε τα αμπερόμετρα.<br>
                    <strong>4. Κατανομή Τάσης:</strong> Επειδή το ρεύμα είναι μηδέν, οι πτώσεις τάσης στα φορτία είναι $V = I \\cdot R = 0.00\\text{ V}$. Επομένως, <strong>ολόκληρη η τάση της πηγής εφαρμόζεται στα άκρα του βολτομέτρου σειράς ($V_\\sigma = V_{\\text{πηγ}} = ${state.V_src.toFixed(1)}\\text{ V}$)</strong>!<br>
                    <strong>5. Ασφάλεια:</strong> Σε αντίθεση με το αμπερόμετρο (που προκαλεί επικίνδυνο βραχυκύκλωμα), η σύνδεση βολτομέτρου σε σειρά είναι <em>εντελώς ακίνδυνη</em> για το όργανο, αλλά καθιστά το κύκλωμα ανενεργό.
                `;
            } else if (probeTarget === 'voltmeter1') {
                vmTitle = 'Βολτόμετρο Αντιστάτη R₁ (V₁)';
                vmReading = phys.V1;
                vmSubtitle = state.topology === 'series' ? 'Συνδεδεμένο παράλληλα στα άκρα του R₁ (Σειρά)' : 'Συνδεδεμένο στον κλάδο του R₁ (Παράλληλα)';
                vmExplanation = state.faultInstrument === 'ammeter_parallel' ? `
                    Λόγω της λανθασμένης παράλληλης τοποθέτησης του αμπερομέτρου $A_1$, η πηγή βραχυκυκλώνεται πλήρως πριν από τον $R_1$. Δεν ρέει ρεύμα προς τον $R_1$ ($I_1 = 0.00\\text{ A}$), συνεπώς η πτώση τάσης στα άκρα του είναι <strong>μηδενική: $V_1 = I_1 \\cdot R_1 = 0.00\\text{ V}$</strong>.
                ` : state.faultInstrument === 'ammeter2_parallel' ? `
                    Το αμπερόμετρο $A_2$ έχει βραχυκυκλώσει τον $R_2$. Επομένως, ολόκληρη η τάση της πηγής εφαρμόζεται στα άκρα του $R_1$: <strong>$V_1 = V_{\\text{πηγ}} = ${state.V_src.toFixed(1)}\\text{ V}$</strong>.
                ` : state.faultInstrument === 'voltmeter_series' ? `
                    Επειδή το βολτόμετρο $V_\\sigma$ συνδέθηκε σε σειρά, η τεράστια εσωτερική του αντίσταση ($R_V \\to \\infty$) διακόπτει όλο το ρεύμα ($I = 0.00\\text{ A}$). Συνεπώς, δεν υπάρχει καμία πτώση τάσης στον $R_1$: <strong>$V_1 = I_1 \\cdot R_1 = 0.00\\text{ V}$</strong>.
                ` : state.topology === 'series' ? (state.brokenR1 ? `
                    Η συσκευή $R_1$ έχει υποστεί βλάβη/καταστροφή (ανοικτό κύκλωμα). Επειδή το ρεύμα στη σειρά μηδενίζεται ($I = 0\\text{ A}$), δεν υπάρχει πτώση τάσης στον ανέπαφο αντιστάτη $R_2$ ($V_2 = I \\cdot R_2 = 0\\text{ V}$). Συνεπώς, <strong>ολόκληρη η τάση της πηγής εμφανίζεται στα άκρα της κατεστραμμένης συσκευής: $V_1 = V_{\\text{πηγ}} = ${state.V_src}\\text{ V}$</strong>!
                ` : state.shortR1 ? `
                    Ο αντιστάτης $R_1$ παρακάμπτεται από το εξωτερικό καλώδιο βραχυκυκλώματος μηδενικής αντίστασης, άρα η τάση στα άκρα του μηδενίζεται ($V_1 = 0.00\\text{ V}$).
                ` : `
                    Συνδέεται παράλληλα στα άκρα του $R_1$. Σύμφωνα με τον Νόμο του Ohm, μετράει πτώση τάσης $V_1 = I \\cdot R_1 = ${phys.I_total.toFixed(2)}\\text{ A} \\cdot ${state.R1}\\ \\Omega = ${phys.V1.toFixed(2)}\\text{ V}$.
                `) : (state.brokenR1 ? `
                    Ο κλάδος του $R_1$ έχει διακοπεί λόγω καταστροφής. Το ρεύμα του κλάδου μηδενίζεται ($I_1 = 0\\text{ A}$).
                ` : `
                    Στην παράλληλη σύνδεση, ο αντιστάτης $R_1$ συνδέεται απευθείας μεταξύ των δύο κύριων αγωγών, συνεπώς η τάση στα άκρα του ισούται με την τάση της πηγής: $V_1 = V_{\\text{πηγ}} = ${state.V_src}\\text{ V}$.
                `);
            } else if (probeTarget === 'voltmeter2') {
                vmTitle = 'Βολτόμετρο Αντιστάτη R₂ (V₂)';
                vmReading = phys.V2;
                vmSubtitle = state.topology === 'series' ? 'Συνδεδεμένο παράλληλα στα άκρα του R₂ (Σειρά)' : 'Συνδεδεμένο στον κλάδο του R₂ (Παράλληλα)';
                vmExplanation = state.faultInstrument === 'ammeter_parallel' ? `
                    Λόγω του ολικού βραχυκυκλώματος από το αμπερόμετρο $A_1$, ο αντιστάτης $R_2$ παρακάμπτεται πλήρως. Το ρεύμα που τον διαρρέει είναι μηδέν ($I_2 = 0.00\\text{ A}$), άρα η ένδειξη του βολτομέτρου είναι <strong>$V_2 = I_2 \\cdot R_2 = 0.00\\text{ V}$</strong>.
                ` : state.faultInstrument === 'ammeter2_parallel' ? `
                    Λόγω της λανθασμένης τοποθέτησης του αμπερομέτρου $A_2$ μεταξύ των κόμβων K και M, ο αντιστάτης $R_2$ παρακάμπτεται πλήρως. Το ρεύμα που τον διαρρέει είναι μηδέν ($I_2 = 0.00\\text{ A}$), άρα η ένδειξη του βολτομέτρου είναι <strong>$V_2 = 0.00\\text{ V}$</strong>.
                ` : state.faultInstrument === 'voltmeter_series' ? `
                    Λόγω της σύνδεσης του βολτομέτρου $V_\\sigma$ σε σειρά, το ρεύμα του κυκλώματος μηδενίζεται ($I = 0.00\\text{ A}$). Επομένως, η πτώση τάσης στον $R_2$ είναι απολύτως μηδενική: <strong>$V_2 = I_2 \\cdot R_2 = 0.00\\text{ V}$</strong>.
                ` : state.topology === 'series' ? (state.brokenR2 ? `
                    Η συσκευή $R_2$ έχει υποστεί βλάβη/καταστροφή (ανοικτό κύκλωμα). Επειδή το ρεύμα στη σειρά μηδενίζεται ($I = 0\\text{ A}$), δεν υπάρχει πτώση τάσης στον ανέπαφο αντιστάτη $R_1$ ($V_1 = I \\cdot R_1 = 0\\text{ V}$). Συνεπώς, <strong>ολόκληρη η τάση της πηγής εμφανίζεται στα άκρα της κατεστραμμένης συσκευής: $V_2 = V_{\\text{πηγ}} = ${state.V_src}\\text{ V}$</strong>!
                ` : state.shortR2 ? `
                    Ο αντιστάτης $R_2$ παρακάμπτεται από το εξωτερικό καλώδιο βραχυκυκλώματος μηδενικής αντίστασης, άρα η τάση στα άκρα του μηδενίζεται ($V_2 = 0.00\\text{ V}$).
                ` : `
                    Συνδέεται παράλληλα στα άκρα του $R_2$. Σύμφωνα με τον Νόμο του Ohm, μετράει πτώση τάσης $V_2 = I \\cdot R_2 = ${phys.I_total.toFixed(2)}\\text{ A} \\cdot ${state.R2}\\ \\Omega = ${phys.V2.toFixed(2)}\\text{ V}$.
                `) : (state.brokenR2 ? `
                    Ο κλάδος του $R_2$ έχει διακοπεί λόγω καταστροφής. Το ρεύμα του κλάδου μηδενίζεται ($I_2 = 0\\text{ A}$).
                ` : `
                    Στην παράλληλη σύνδεση, ο αντιστάτης $R_2$ συνδέεται απευθείας μεταξύ των δύο κύριων αγωγών, συνεπώς η τάση στα άκρα του ισούται με την τάση της πηγής: $V_2 = V_{\\text{πηγ}} = ${state.V_src}\\text{ V}$.
                `);
            } else if (probeTarget === 'voltmeter_par') {
                vmTitle = 'Βολτόμετρο Παράλληλης Σύνδεσης (Vπαρ)';
                vmReading = (!state.switchClosed || phys.status === 'total_short' || state.faultInstrument === 'voltmeter_series') ? 0 : state.V_src;
                vmSubtitle = 'Συνδεδεμένο στη δεξιά πλευρά (Κόμβοι C − E)';
                vmExplanation = state.faultInstrument === 'voltmeter_series' ? `
                    Το βολτόμετρο $V_\\sigma$ που συνδέθηκε σε σειρά στον κύριο αγωγό ($R_V \\to \\infty$) μπλοκάρει όλη την παροχή ρεύματος ($I_{\\text{ολ}} = 0.00\\text{ A}$). Ως αποτέλεσμα, η τάση στους παράλληλους κλάδους είναι <strong>$V_{\\text{παρ}} = 0.00\\text{ V}$</strong>. Ολόκληρη η τάση της πηγής ($V = ${state.V_src}\\text{ V}$) εμφανίζεται στα άκρα του $V_\\sigma$!
                ` : `Το βολτόμετρο είναι συνδεδεμένο παράλληλα στη συστοιχία των δύο παράλληλων κλάδων (μεταξύ του άνω κοινού αγωγού C και του κάτω κοινού αγωγού E). Επιβεβαιώνει πειραματικά τον θεμελιώδη κανόνα της παράλληλης σύνδεσης: <strong>όλοι οι παράλληλοι κλάδοι βρίσκονται υπό την ίδια ακριβώς ηλεκτρική τάση: $V_{\\text{παρ}} = V_1 = V_2 = V_{\\text{πηγ}} = ${state.V_src}\\text{ V}$</strong>!`;
            }

            detailsHtml = `
                <div class="hud-item-header">
                    <span class="hud-probe-icon">🟣</span>
                    <div class="hud-item-title-wrap">
                        <h4 class="hud-item-title">${vmTitle}</h4>
                        <span class="hud-item-badge ${vmBadgeClass}">${vmBadgeText}</span>
                    </div>
                </div>
                <div class="hud-readouts-grid cols-2">
                    <div class="hud-meter-box">
                        <span class="meter-lbl"><span>Ένδειξη Τάσης</span><span class="meter-symbol">(<span class="math-expr"><i class="math-var">V</i></span>):</span></span>
                        <span class="meter-val text-voltage">${vmReading.toFixed(2)} V</span>
                    </div>
                    <div class="hud-meter-box">
                        <span class="meter-lbl"><span>Ρεύμα Οργάνου</span><span class="meter-symbol">(<span class="math-expr"><i class="math-var">I</i><sub class="math-sub">V</sub></span>):</span></span>
                        <span class="meter-val text-current">0.00 A</span>
                    </div>
                </div>
                ${isSteps ? `
                    <div class="hud-steps-box">
                        <div class="hud-steps-title">💡 Φυσική Σημασία Μέτρησης Βολτομέτρου:</div>
                        <p style="font-size: 0.88rem; line-height: 1.5; margin: 4px 0;">
                            ${vmExplanation}
                        </p>
                    </div>
                ` : ''}
            `;
        } else if (probeTarget.startsWith('ammeter')) {
            let amTitle = 'Ιδανικό Αμπερόμετρο (RA = 0 Ω)';
            let amReading = phys.I_total;
            let amExplanation = '';
            let amBadgeClass = 'good';
            let amBadgeText = 'RA = 0 Ω (Ιδανικό Όργανο)';

            if (probeTarget === 'ammeter1') {
                if (state.faultInstrument === 'ammeter_parallel') {
                    amTitle = 'Αμπερόμετρο A₁ (⚠️ ΛΑΝΘΑΣΜΕΝΗ ΤΟΠΟΘΕΤΗΣΗ ΠΑΡΑΛΛΗΛΑ ΣΤΗΝ ΠΗΓΗ)';
                    amBadgeClass = 'bad';
                    amBadgeText = '💥 Βραχυκύκλωμα Πηγής (RA ≈ 0 Ω)';
                    amReading = state.switchClosed ? Infinity : 0;
                    amExplanation = `
                        <strong>1. Σφάλμα Συνδεσμολογίας:</strong> Το αμπερόμετρο $A_1$ τοποθετήθηκε <em>κάθετα</em> συνδέοντας τον άνω κόμβο $K$ με τον κάτω κόμβο επιστροφής $F$. Έτσι συνδέθηκε <strong>παράλληλα στους πόλους της πηγής</strong> αντί να συνδεθεί σε σειρά με τα φορτία.<br>
                        <strong>2. Μηδενική Εσωτερική Αντίσταση:</strong> Ένα ιδανικό αμπερόμετρο διαθέτει σχεδόν μηδενική αντίσταση ($R_A \\approx 0\\ \\Omega$). Συνδέοντάς το όμως παράλληλα, προσφέρει στο ρεύμα μια ανεμπόδιστη παράκαμψη που παρακάμπτει τους αντιστάτες $R_1, R_2$.<br>
                        <strong>3. Φαινόμενο Ολικού Βραχυκυκλώματος:</strong> Σύμφωνα με τον Νόμο του Ohm:
                        $$I_{A1} = \\frac{V_{\\text{πηγ}}}{R_A} = \\frac{${state.V_src}\\text{ V}}{0\\ \\Omega} \\to \\infty\\text{ A}$$
                        ${state.switchClosed ? 'Με κλειστό διακόπτη, το ρεύμα εκτοξεύεται στο <strong>άπειρο ($I \\to \\infty$)</strong>. Στην πράξη, αυτό θα προκαλούσε ακαριαία <em>τήξη της ασφάλειας ή κάψιμο/καταστροφή του οργάνου</em>!' : 'Με ανοικτό διακόπτη, το κύκλωμα είναι ανοικτό και δεν ρέει ρεύμα ($I_{A1} = 0.00\\text{ A}$).'}<br>
                        <strong>4. Μηδενισμός Ρεύματος Φορτίων:</strong> Το ρεύμα επιλέγει εξ ολοκλήρου τη διαδρομή μηδενικής αντίστασης του $A_1$. Συνεπώς, <strong>κανένα ρεύμα δεν φτάνει στους αντιστάτες $R_1, R_2$ και στα αμπερόμετρα $A_2, A_3$</strong> ($I = 0.00\\text{ A}$).
                    `;
                } else if (state.faultInstrument === 'voltmeter_series') {
                    amTitle = state.topology === 'series' ? 'Αμπερόμετρο A₁ (Αντικαταστάθηκε από Vσ)' : 'Αμπερόμετρο A₁ (Κλάδος R₁)';
                    amBadgeClass = 'warn';
                    amBadgeText = 'Μηδενικό Ρεύμα (I = 0 A)';
                    amReading = 0;
                    amExplanation = state.topology === 'series' ? `
                        Στη συνδεσμολογία αυτή, το αμπερόμετρο $A_1$ <strong>έχει αφαιρεθεί πλήρως</strong> και στη θέση του τοποθετήθηκε το βολτόμετρο $V_\\sigma$ σε σειρά.
                    ` : `
                        Το βολτόμετρο $V_\\sigma$ συνδέθηκε σε σειρά στον κύριο αγωγό ($R_V \\to \\infty$), μπλοκάροντας όλη την παροχή ρεύματος ($I_{\\text{ολ}} = 0.00\\text{ A}$). Συνεπώς, κανένα ρεύμα δεν φτάνει στον 1ο παράλληλο κλάδο και το αμπερόμετρο $A_1$ δείχνει <strong>$I_1 = 0.00\\text{ A}$</strong>.
                    `;
                } else if (state.topology === 'series') {
                    amTitle = 'Αμπερόμετρο A₁ (Σειρά - Πριν τον R₁)';
                    amReading = phys.I_total;
                    amExplanation = `Συνδεδεμένο στη σειρά πριν τον πρώτο αντιστάτη $R_1$. Μετράει το ρεύμα που εξέρχεται από την πηγή και διέρχεται από τον $R_1$: $I_{A1} = ${phys.I_total.toFixed(2)}\\text{ A}$.`;
                } else {
                    amTitle = 'Αμπερόμετρο A₁ (Κλάδος R₁)';
                    amReading = phys.I1;
                    amExplanation = `Συνδεδεμένο στον 1ο παράλληλο κλάδο. Μετράει αποκλειστικά το ρεύμα που διαρρέει τον αντιστάτη $R_1$: $I_1 = V_1 / R_1 = ${phys.I1.toFixed(2)}\\text{ A}$.`;
                }
            } else if (probeTarget === 'ammeter2') {
                if (state.faultInstrument === 'ammeter_parallel') {
                    amTitle = 'Αμπερόμετρο A₂ (Παρακαμφθέν από το Βραχυκύκλωμα)';
                    amReading = 0;
                    amBadgeClass = 'warn';
                    amBadgeText = 'Παράκαμψη (I = 0 A)';
                    amExplanation = `Το αμπερόμετρο $A_2$ βρίσκεται ανάμεσα στους αντιστάτες $R_1$ και $R_2$. Επειδή το αμπερόμετρο $A_1$ βραχυκυκλώνει πλήρως την πηγή στον κόμβο $K$, όλο το ρεύμα εκτρέπεται μέσω του $A_1$. Συνεπώς, <strong>δεν διέρχεται ρεύμα από το $A_2$ ($I_{A2} = 0.00\\text{ A}$)</strong>.`;
                } else if (state.faultInstrument === 'ammeter2_parallel') {
                    amTitle = 'Αμπερόμετρο A₂ (⚠️ ΛΑΝΘΑΣΜΕΝΗ ΤΟΠΟΘΕΤΗΣΗ ΜΕΤΑΞΥ K − M)';
                    amBadgeClass = 'warn';
                    amBadgeText = '⚠️ Βραχυκύκλωση R₂ (RA ≈ 0 Ω)';
                    amReading = state.switchClosed ? (phys.I_A2 !== undefined ? phys.I_A2 : phys.I_total) : 0;
                    amExplanation = `
                        <strong>1. Σφάλμα Συνδεσμολογίας:</strong> Το αμπερόμετρο $A_2$ τοποθετήθηκε <em>κάθετα</em> μεταξύ του άνω κόμβου $K$ και του κάτω κόμβου επιστροφής $M$. Έτσι συνδέθηκε <strong>παράλληλα στη συστοιχία του $R_2$</strong> αντί να συνδεθεί σε σειρά.<br>
                        <strong>2. Μηδενική Εσωτερική Αντίσταση & Βραχυκύκλωση $R_2$:</strong> Ένα ιδανικό αμπερόμετρο διαθέτει μηδενική αντίσταση ($R_{A2} \\approx 0\\ \\Omega$). Προσφέρει στο ρεύμα μια διαδρομή μηδενικής αντίστασης κατευθείαν προς τη γραμμή επιστροφής, παρακάμπτοντας πλήρως τον $R_2$ ($I_2 = 0.00\\text{ A}, V_2 = 0.00\\text{ V}$).<br>
                        <strong>3. Ρεύμα Οργάνου:</strong> Το ρεύμα που διέρχεται από το $A_2$ ισούται με το ρεύμα του $R_1$: $I_{A2} = I_1 = ${phys.I_total.toFixed(2)}\\text{ A}$.
                    `;
                } else if (state.faultInstrument === 'voltmeter_series') {
                    amTitle = state.topology === 'series' ? 'Αμπερόμετρο A₂ (Σειρά - Ανάμεσα στους R₁ & R₂)' : 'Αμπερόμετρο A₂ (Κλάδος R₂)';
                    amBadgeClass = 'warn';
                    amBadgeText = 'Μηδενικό Ρεύμα (I = 0 A)';
                    amReading = 0;
                    amExplanation = state.topology === 'series' ? `
                        Επειδή το βολτόμετρο $V_\\sigma$ συνδέθηκε σε σειρά στην αρχή του κυκλώματος ($R_V \\to \\infty$), η ροή του ρεύματος μηδενίζεται πλήρως ($I = 0.00\\text{ A}$). Συνεπώς, το αμπερόμετρο $A_2$ δείχνει <strong>$I_{A2} = 0.00\\text{ A}$</strong>.
                    ` : `
                        Το βολτόμετρο $V_\\sigma$ στον κύριο αγωγό ($R_V \\to \\infty$) διακόπτει όλη την παροχή ρεύματος ($I_{\\text{ολ}} = 0.00\\text{ A}$). Κανένα ρεύμα δεν φτάνει στον 2ο κλάδο, άρα το $A_2$ δείχνει <strong>$I_2 = 0.00\\text{ A}$</strong>.
                    `;
                } else if (state.topology === 'series') {
                    amTitle = 'Αμπερόμετρο A₂ (Σειρά - Ανάμεσα στους R₁ & R₂)';
                    amReading = phys.I_total;
                    amExplanation = `Συνδεδεμένο <strong>ενδιάμεσα των δύο αντιστατών $R_1$ και $R_2$</strong>. Επιβεβαιώνει πειραματικά ότι το ηλεκτρικό ρεύμα δεν «μειώνεται» ούτε «ξοδεύεται» περνώντας μέσα από έναν αντιστάτη: $I_{A2} = I_{A1} = ${phys.I_total.toFixed(2)}\\text{ A}$ (Αρχή Διατήρησης Φορτίου).`;
                } else {
                    amTitle = 'Αμπερόμετρο A₂ (Κλάδος R₂)';
                    amReading = phys.I2;
                    amExplanation = `Συνδεδεμένο στον 2ο παράλληλο κλάδο. Μετράει αποκλειστικά το ρεύμα που διαρρέει τον αντιστάτη $R_2$: $I_2 = V_2 / R_2 = ${phys.I2.toFixed(2)}\\text{ A}$.`;
                }
            } else if (probeTarget === 'ammeter3') {
                if (state.faultInstrument === 'ammeter_parallel' || state.faultInstrument === 'ammeter2_parallel') {
                    amTitle = 'Αμπερόμετρο A₃ (Παρακαμφθέν από το Βραχυκύκλωμα)';
                    amReading = 0;
                    amBadgeClass = 'warn';
                    amBadgeText = 'Παράκαμψη (I = 0 A)';
                    amExplanation = state.faultInstrument === 'ammeter2_parallel' ? `
                        Το αμπερόμετρο $A_3$ βρίσκεται μετά τον δεύτερο αντιστάτη $R_2$. Επειδή όλο το ρεύμα εκτρέπεται μέσω του λανθασμένα τοποθετημένου αμπερομέτρου $A_2$ προς τον κάτω κόμβο επιστροφής $M$, **κανένα ρεύμα δεν διαρρέει τον $R_2$ και το $A_3$ ($I_{A3} = 0.00\\text{ A}$)**.
                    ` : `
                        Το αμπερόμετρο $A_3$ βρίσκεται μετά τον δεύτερο αντιστάτη $R_2$. Λόγω του ολικού βραχυκυκλώματος στον κόμβο $K$, κανένα ρεύμα δεν φτάνει στον κλάδο των $R_1, R_2$, άρα η ένδειξη του $A_3$ είναι <strong>απολύτως μηδενική ($I_{A3} = 0.00\\text{ A}$)</strong>.
                    `;
                } else if (state.faultInstrument === 'voltmeter_series') {
                    amTitle = 'Αμπερόμετρο A₃ (Σειρά - Μετά τον R₂)';
                    amReading = 0;
                    amBadgeClass = 'warn';
                    amBadgeText = 'Μηδενικό Ρεύμα (I = 0 A)';
                    amExplanation = `Λόγω της τεράστιας εσωτερικής αντίστασης του βολτομέτρου $V_\\sigma$ που συνδέθηκε σε σειρά ($R_V \\to \\infty$), το κύκλωμα δεν διαρρέεται από ρεύμα ($I = 0.00\\text{ A}$). Συνεπώς, το $A_3$ δείχνει <strong>$I_{A3} = 0.00\\text{ A}$</strong>.`;
                } else {
                    amTitle = 'Αμπερόμετρο A₃ (Σειρά - Μετά τον R₂)';
                    amReading = phys.I_total;
                    amExplanation = `Συνδεδεμένο <strong>μετά τον δεύτερο αντιστάτη $R_2$</strong>. Επιβεβαιώνει ότι το ρεύμα εξόδου που επιστρέφει στον αρνητικό πόλο της πηγής είναι απαράλλακτο: $I_{A3} = I_{A2} = I_{A1} = ${phys.I_total.toFixed(2)}\\text{ A}$.`;
                }
            } else {
                // Main Ammeter
                if (state.topology === 'parallel') {
                    if (state.faultInstrument === 'ammeter_parallel') {
                        amTitle = 'Κύριο Αμπερόμετρο Aολ (Κύριος Αγωγός)';
                        amReading = 0;
                        amBadgeClass = 'warn';
                        amBadgeText = 'Παράκαμψη (I = 0 A)';
                        amExplanation = `Το αμπερόμετρο $A_{\\text{ολ}}$ βρίσκεται στον κύριο αγωγό μετά το λανθασμένα τοποθετημένο $A_1$. Επειδή όλο το ρεύμα βραχυκυκλώνεται μέσω του $A_1$, κανένα ρεύμα δεν φτάνει στο $A_{\\text{ολ}}$ ($I_{\\text{ολ}} = 0.00\\text{ A}$).`;
                    } else if (state.faultInstrument === 'ammeter2_parallel') {
                        amTitle = 'Κύριο Αμπερόμετρο Aολ (⚠️ ΥΠΕΡΕΝΤΑΣΗ ΒΡΑΧΥΚΥΚΛΩΜΑΤΟΣ)';
                        amReading = state.switchClosed ? Infinity : 0;
                        amBadgeClass = 'bad';
                        amBadgeText = '💥 Υπερένταση Βραχυκύκλωσης';
                        amExplanation = `Το αμπερόμετρο $A_{\\text{ολ}}$ βρίσκεται στον κύριο αγωγό πριν από το κάθετο αμπερόμετρο $A_2$. Επειδή το $A_2$ βραχυκυκλώνει τους αγωγούς τροφοδοσίας, το τεράστιο ρεύμα βραχυκυκλώματος ($I \\to \\infty$) διέρχεται απευθείας μέσα από το $A_{\\text{ολ}}$!`;
                    } else if (state.faultInstrument === 'voltmeter_series') {
                        amTitle = 'Κύριο Αμπερόμετρο Aολ (Κύριος Αγωγός)';
                        amReading = 0;
                        amBadgeClass = 'warn';
                        amBadgeText = 'Μηδενικό Ρεύμα (I = 0 A)';
                        amExplanation = `Το αμπερόμετρο $A_{\\text{ολ}}$ βρίσκεται στον κύριο αγωγό αμέσως μετά το βολτόμετρο $V_\\sigma$. Επειδή το βολτόμετρο έχει άπειρη αντίσταση ($R_V \\to \\infty$), εμποδίζει τη διέλευση του ρεύματος. Έτσι, το $A_{\\text{ολ}}$ μετράει <strong>$I_{\\text{ολ}} = 0.00\\text{ A}$</strong>.`;
                    } else {
                        amTitle = 'Κύριο Αμπερόμετρο Aολ (Κύριος Αγωγός)';
                        amReading = phys.I_total;
                        amExplanation = `Μετράει το συνολικό ρεύμα $I_{\\text{ολ}}$ που εξέρχεται από την ηλεκτρική πηγή. Σύμφωνα με τον 1ο Κανόνα του Kirchhoff, διακλαδίζεται στους δύο κλάδους: $I_{\\text{ολ}} = I_1 + I_2 = ${phys.I1.toFixed(2)}\\text{ A} + ${phys.I2.toFixed(2)}\\text{ A} = ${phys.I_total.toFixed(2)}\\text{ A}$.`;
                    }
                } else {
                    amTitle = 'Ιδανικό Αμπερόμετρο A (Σειρά)';
                    amReading = phys.I_total;
                    amExplanation = `Το αμπερόμετρο συνδέεται πάντοτε <strong>στη σειρά</strong> και διαθέτει μηδενική εσωτερική αντίσταση ($R_A = 0\\ \\Omega$) ώστε να μετράει το ρεύμα χωρίς να προκαλεί καμία πτώση τάσης.`;
                }
            }

            const amReadingStr = amReading === Infinity ? '∞ A (Υπερένταση / Βραχυκύκλωμα!)' : `${amReading.toFixed(2)} A`;

            detailsHtml = `
                <div class="hud-item-header">
                    <span class="hud-probe-icon">🧭</span>
                    <div class="hud-item-title-wrap">
                        <h4 class="hud-item-title">${amTitle}</h4>
                        <span class="hud-item-badge ${amBadgeClass}">${amBadgeText}</span>
                    </div>
                </div>
                <div class="hud-readouts-grid cols-2">
                    <div class="hud-meter-box">
                        <span class="meter-lbl"><span>Ένδειξη Ρεύματος</span><span class="meter-symbol">(<span class="math-expr"><i class="math-var">I</i></span>):</span></span>
                        <span class="meter-val text-current ${amReading === Infinity ? 'danger-reading' : ''}">${amReadingStr}</span>
                    </div>
                    <div class="hud-meter-box">
                        <span class="meter-lbl"><span>Πτώση Τάσης</span><span class="meter-symbol">(<span class="math-expr"><i class="math-var">V</i><sub class="math-sub">A</sub></span>):</span></span>
                        <span class="meter-val text-voltage">0.00 V</span>
                    </div>
                </div>
                ${isSteps ? `
                    <div class="hud-steps-box">
                        <div class="hud-steps-title">💡 Φυσική Σημασία Μέτρησης Αμπερομέτρου:</div>
                        <p style="font-size: 0.88rem; line-height: 1.5; margin: 4px 0;">
                            ${amExplanation}
                        </p>
                    </div>
                ` : ''}
            `;
        } else if (probeTarget.startsWith('node')) {
            const nodeKey = probeTarget.replace('node', '');
            const pot = phys['V' + nodeKey] !== undefined ? phys['V' + nodeKey] : 0;
            let nodeCurrent = 0;
            if (state.switchClosed) {
                if (state.faultInstrument === 'ammeter_parallel') {
                    if (nodeKey === 'G' || nodeKey === 'K' || nodeKey === 'F') {
                        nodeCurrent = Infinity;
                    } else {
                        nodeCurrent = 0;
                    }
                } else if (state.faultInstrument === 'ammeter2_parallel') {
                    if (state.topology === 'series') {
                        if (nodeKey === 'G' || nodeKey === 'A' || nodeKey === 'K' || nodeKey === 'M' || nodeKey === 'D') {
                            nodeCurrent = phys.I1;
                        } else {
                            nodeCurrent = 0;
                        }
                    } else {
                        if (nodeKey === 'G' || nodeKey === 'K' || nodeKey === 'M' || nodeKey === 'D' || nodeKey === 'F') {
                            nodeCurrent = Infinity;
                        } else {
                            nodeCurrent = 0;
                        }
                    }
                } else if (state.faultInstrument === 'voltmeter_series') {
                    nodeCurrent = 0;
                } else if (phys.status !== 'total_short') {
                    if (state.topology === 'series') {
                        nodeCurrent = phys.I_total;
                    } else {
                        nodeCurrent = (nodeKey === 'C' || nodeKey === 'E' || nodeKey === 'D') ? phys.I2 : phys.I_total;
                    }
                }
            }
            const nodeCurrentStr = nodeCurrent === Infinity ? '∞ A (Υπερένταση / Βραχυκύκλωμα)' : `${nodeCurrent.toFixed(2)} A`;
            const isKnot = ((nodeKey === 'K' || nodeKey === 'F') && state.faultInstrument === 'ammeter_parallel') ||
                           ((nodeKey === 'K' || nodeKey === 'M') && state.faultInstrument === 'ammeter2_parallel');

            detailsHtml = `
                <div class="hud-item-header">
                    <span class="hud-probe-icon">${isKnot ? '🔴' : '📍'}</span>
                    <div class="hud-item-title-wrap">
                        <h4 class="hud-item-title">${isKnot ? `Κόμβος ${nodeKey} (Σύνδεση Βραχυκυκλώματος)` : `Κόμβος ${nodeKey} Κυκλώματος`}</h4>
                        <span class="hud-item-badge ${isKnot ? 'bad' : 'good'}">${isKnot ? 'Σημείο Παράλληλης Σύνδεσης' : 'Σημείο Αναφοράς / Μέτρησης'}</span>
                    </div>
                </div>
                <div class="hud-readouts-grid cols-2">
                    <div class="hud-meter-box">
                        <span class="meter-lbl"><span>Ένταση Ρεύματος</span><span class="meter-symbol">(<span class="math-expr"><i class="math-var">I</i></span>):</span></span>
                        <span class="meter-val text-current ${nodeCurrent === Infinity ? 'danger-reading' : ''}">${nodeCurrentStr}</span>
                    </div>
                    <div class="hud-meter-box">
                        <span class="meter-lbl"><span>Ηλεκτρικό Δυναμικό</span><span class="meter-symbol">(<span class="math-expr"><i class="math-var">V</i><sub class="math-sub">${nodeKey}</sub></span>):</span></span>
                        <span class="meter-val text-voltage">${pot.toFixed(2)} V</span>
                    </div>
                </div>
                ${isSteps ? `
                    <div class="hud-steps-box">
                        <div class="hud-steps-title">💡 Ανάλυση Ρεύματος & Ηλεκτρικού Δυναμικού (Κόμβος ${nodeKey}):</div>
                        <p style="font-size: 0.88rem; line-height: 1.5; margin: 0;">
                            ${nodeKey === 'K' ? `
                                <strong>1. Ένταση Ρεύματος:</strong> Στον άνω κόμβο K ${
                                    state.faultInstrument === 'ammeter_parallel' ? 
                                        'φτάνει το ρεύμα από την πηγή και <strong>εκτρέπεται εξ ολοκλήρου προς το κάθετο αμπερόμετρο $A_1$</strong> ($I_{A1} \\to \\infty$), παρακάμπτοντας πλήρως τον αντιστάτη $R_1$ ($I_{R1} = 0.00\\text{ A}$).' : 
                                    (state.faultInstrument === 'ammeter2_parallel' ? 
                                        (state.topology === 'series' ? 
                                            'φτάνει το ρεύμα από τον $R_1$ ($I_1 = ' + phys.I1.toFixed(2) + '\\text{ A}$) και <strong>εκτρέπεται εξ ολοκλήρου προς το κάθετο αμπερόμετρο $A_2$</strong>, παρακάμπτοντας πλήρως τον $R_2$ ($I_2 = 0.00\\text{ A}$).' : 
                                            'φτάνει το ολικό ρεύμα βραχυκυκλώματος μέσω του $A_{\\text{ολ}}$ και <strong>εκτρέπεται εξ ολοκλήρου προς το κάθετο αμπερόμετρο $A_2$</strong> ($I_{A2} \\to \\infty$), παρακάμπτοντας πλήρως τους αντιστάτες $R_1$ και $R_2$ ($I_1 = I_2 = 0.00\\text{ A}$).') : 
                                        'βρίσκεται το σημείο σύνδεσης με ρεύμα $I = ' + nodeCurrent.toFixed(2) + '\\text{ A}$.')
                                }<br>
                                <strong>2. Ηλεκτρικό Δυναμικό:</strong> ${state.faultInstrument === 'ammeter2_parallel' ? 'Συνδέεται μέσω του ιδανικού $A_2$ απευθείας με τον κόμβο M στη γραμμή γείωσης, άρα $V_K = 0.00\\text{ V}$.' : 'Συνδέεται με τον θετικό πόλο της πηγής μέσω του διακόπτη K.'}
                            ` : ''}
                            ${nodeKey === 'M' ? `
                                <strong>1. Ένταση Ρεύματος:</strong> Στον κάτω κόμβο M επιστροφής ${
                                    state.faultInstrument === 'ammeter2_parallel' ? 
                                        (state.topology === 'series' ? 
                                            'καταλήγει το ρεύμα $I_1 = ' + phys.I1.toFixed(2) + '\\text{ A}$ από το κάθετο αμπερόμετρο $A_2$ και συνεχίζει αριστερά προς τη γείωση D και τον αρνητικό πόλο (−) της πηγής.' : 
                                            'καταλήγει το ρεύμα βραχυκυκλώματος ($I \\to \\infty$) από το κάθετο αμπερόμετρο $A_2$ και επιστρέφει αριστερά προς τον αρνητικό πόλο (−) της πηγής.') : 
                                        'διέρχεται το ρεύμα επιστροφής.'
                                }<br>
                                <strong>2. Ηλεκτρικό Δυναμικό:</strong> Βρίσκεται πάνω στον ιδανικό αγωγό επιστροφής που συνδέεται με τη γείωση D ($R = 0\\ \\Omega$), συνεπώς $V_M = V_D = 0.00\\text{ V}$.
                            ` : ''}
                            ${nodeKey === 'G' ? (state.topology === 'series' ? `
                                <strong>1. Ένταση Ρεύματος:</strong> Στον κόμβο G (πάνω από την πηγή) διέρχεται το ολικό ρεύμα του κυκλώματος $I = ${nodeCurrentStr}$.<br>
                                <strong>2. Ηλεκτρικό Δυναμικό:</strong> Βρίσκεται απευθείας συνδεδεμένος με τον θετικό (+) πόλο της ηλεκτρικής πηγής μέσω ιδανικού αγωγού, άρα $V_G = V_{\\text{πηγ}} = ${phys.V_src}\\text{ V}$ (ακόμη και με ανοικτό διακόπτη).
                            ` : `
                                <strong>1. Ένταση Ρεύματος:</strong> Στον κόμβο G πάνω από την πηγή διέρχεται το ολικό ρεύμα $I_{\\text{ολ}} = I_1 + I_2 = ${nodeCurrentStr}$.<br>
                                <strong>2. Ηλεκτρικό Δυναμικό:</strong> Συνδέεται απευθείας με τον θετικό (+) πόλο της πηγής, άρα $V_G = V_{\\text{πηγ}} = ${phys.V_src}\\text{ V}$ (σταθερό δυναμικό αναφοράς).
                            `) : ''}
                            ${nodeKey === 'A' ? (state.topology === 'series' ? `
                                <strong>1. Ένταση Ρεύματος:</strong> Στον κόμβο A ${state.faultInstrument === 'ammeter_parallel' ? 'δεν διέρχεται ρεύμα ($I_A = 0.00\\text{ A}$), καθώς όλο το ρεύμα παρακάμφθηκε από το αμπερόμετρο $A_1$.' : 'διέρχεται το ολικό ρεύμα του κυκλώματος $I = ' + nodeCurrent.toFixed(2) + '\\text{ A}$.'}<br>
                                <strong>2. Ηλεκτρικό Δυναμικό:</strong> Συνδέεται μετά τον διακόπτη. ${state.faultInstrument === 'ammeter_parallel' ? 'Λόγω του βραχυκυκλώματος, $V_A = 0.00\\text{ V}$.' : 'Όταν ο διακόπτης είναι κλειστός, $V_A = V_{\\text{πηγ}} = ' + phys.V_src + '\\text{ V}$ (ως προς τη γείωση $D$).'}
                            ` : `
                                <strong>1. Ένταση Ρεύματος:</strong> Στον κόμβο διακλάδωσης A φτάνει το ολικό ρεύμα $I_{\\text{ολ}} = ${nodeCurrentStr}$. Εκεί διακλαδίζεται στο ρεύμα $I_1 = ${phys.I1.toFixed(2)}\\text{ A}$ (κάθετος κλάδος $R_1$) και στο ρεύμα $I_2 = ${phys.I2.toFixed(2)}\\text{ A}$ (συνέχεια προς κόμβο C) σύμφωνα με τον 1ο Κανόνα Kirchhoff ($I_{\\text{ολ}} = I_1 + I_2$).<br>
                                <strong>2. Ηλεκτρικό Δυναμικό:</strong> Συνδέεται μετά τον διακόπτη με τον θετικό πόλο της πηγής, άρα με κλειστό διακόπτη $V_A = V_{\\text{πηγ}} = ${phys.V_src}\\text{ V}$.
                            `) : ''}
                            ${nodeKey === 'B' ? (state.topology === 'series' ? `
                                <strong>1. Ένταση Ρεύματος:</strong> Στον ενδιάμεσο κόμβο B ${state.faultInstrument === 'ammeter_parallel' || state.faultInstrument === 'ammeter2_parallel' ? 'το ρεύμα είναι μηδενικό ($I_B = 0.00\\text{ A}$) λόγω της παράκαμψης.' : 'διέρχεται το κοινό ρεύμα σειράς $I = ' + nodeCurrent.toFixed(2) + '\\text{ A}$.'}<br>
                                <strong>2. Ηλεκτρικό Δυναμικό:</strong> Βρίσκεται μεταξύ $R_1$ και $R_2$. ${state.faultInstrument === 'ammeter_parallel' || state.faultInstrument === 'ammeter2_parallel' ? 'Είναι $V_B = 0.00\\text{ V}$.' : 'Η πτώση τάσης στον $R_2$ ως προς τη γείωση δίνει δυναμικό $V_B = V_2 = ' + phys.VB.toFixed(2) + '\\text{ V}$.'}
                            ` : `
                                <strong>1. Ένταση Ρεύματος:</strong> Ο κόμβος B είναι ο κόμβος συμβολής των δύο κλάδων: το ρεύμα $I_1 = ${phys.I1.toFixed(2)}\\text{ A}$ (από $R_1$) ενώνεται με το ρεύμα $I_2 = ${phys.I2.toFixed(2)}\\text{ A}$ (από $R_2$) ανασυστήνοντας το ολικό ρεύμα επιστροφής $I_{\\text{ολ}} = ${nodeCurrentStr}$ ($I = I_1 + I_2$).<br>
                                <strong>2. Ηλεκτρικό Δυναμικό:</strong> Συνδέεται με τη γείωση D μέσω ιδανικού αγωγού ($R = 0\\ \\Omega$), άρα $V_B = 0\\text{ V}$.
                            `) : ''}
                            ${nodeKey === 'C' ? (state.topology === 'series' ? `
                                <strong>1. Ένταση Ρεύματος:</strong> Ο κόμβος C ${state.faultInstrument === 'ammeter_parallel' || state.faultInstrument === 'ammeter2_parallel' ? 'δεν διαρρέεται από ρεύμα ($I_C = 0.00\\text{ A}$).' : 'διαρρέεται από το ρεύμα $I = ' + nodeCurrent.toFixed(2) + '\\text{ A}$.'}<br>
                                <strong>2. Ηλεκτρικό Δυναμικό:</strong> Συνδέεται με τη γείωση D μέσω ιδανικού αγωγού ($R = 0\\ \\Omega$), άρα $V_C = V_D = 0\\text{ V}$.
                            ` : `
                                <strong>1. Ένταση Ρεύματος:</strong> Στον πάνω κόμβο C του δεύτερου κλάδου εισέρχεται το ρεύμα $I_2 = ${nodeCurrentStr}$ που κατέρχεται μέσω του αντιστάτη $R_2$.<br>
                                <strong>2. Ηλεκτρικό Δυναμικό:</strong> Συνδέεται με τον κόμβο A μέσω ιδανικού αγωγού ($R = 0\\ \\Omega$), συνεπώς $V_C = V_A = ${phys.VC.toFixed(2)}\\text{ V}$.
                            `) : ''}
                            ${nodeKey === 'D' ? (state.topology === 'series' ? `
                                <strong>1. Ένταση Ρεύματος:</strong> Το ρεύμα που διέρχεται από τον αγωγό στο σημείο D είναι ${state.faultInstrument === 'ammeter_parallel' ? 'μηδενικό ($I_D = 0.00\\text{ A}$), καθώς το ρεύμα επιστρέφει απευθείας μέσω του κόμβου F.' : (state.faultInstrument === 'ammeter2_parallel' ? '$I = ' + phys.I1.toFixed(2) + '\\text{ A}$ (ρέει από τον κόμβο M επιστροφής προς τον αρνητικό πόλο).' : '$I = ' + nodeCurrent.toFixed(2) + '\\text{ A}$ (στη γραμμή γείωσης δεν διαφεύγει ρεύμα).')}<br>
                                <strong>2. Ηλεκτρικό Δυναμικό:</strong> Το σημείο D αποτελεί τη γείωση αναφοράς του κυκλώματος ($V_D = 0\\text{ V}$).
                            ` : `
                                <strong>1. Ένταση Ρεύματος:</strong> Στον κάτω αγωγό στο σημείο D διέρχεται το ρεύμα επιστροφής του δεύτερου κλάδου $I_2 = ${nodeCurrentStr}$ καθοδόν προς τον κόμβο B. Στη γραμμή γείωσης δεν διαφεύγει ρεύμα.<br>
                                <strong>2. Ηλεκτρικό Δυναμικό:</strong> Το σημείο D αποτελεί τη γείωση αναφοράς του κυκλώματος ($V_D = 0\\text{ V}$).
                            `) : ''}
                            ${nodeKey === 'E' ? (state.topology === 'series' ? `
                                <strong>1. Ένταση Ρεύματος:</strong> Στον κόμβο E του κάτω αγωγού ${state.faultInstrument === 'ammeter_parallel' || state.faultInstrument === 'ammeter2_parallel' ? 'το ρεύμα είναι μηδέν ($I_E = 0.00\\text{ A}$).' : 'διέρχεται το ρεύμα επιστροφής $I = ' + nodeCurrent.toFixed(2) + '\\text{ A}$.'}<br>
                                <strong>2. Ηλεκτρικό Δυναμικό:</strong> Βρίσκεται δεξιά της γείωσης D πάνω στον ιδανικό αγωγό ($R = 0\\ \\Omega$), συνεπώς $V_E = V_D = 0\\text{ V}$.
                            ` : `
                                <strong>1. Ένταση Ρεύματος:</strong> Στον κάτω κόμβο E του δεύτερου κλάδου εξέρχεται το ρεύμα $I_2 = ${nodeCurrentStr}$ από τον αντιστάτη $R_2$ και ρέει αριστερά προς τη γείωση D και τον κόμβο B.<br>
                                <strong>2. Ηλεκτρικό Δυναμικό:</strong> Συνδέεται με τη γείωση D μέσω ιδανικού αγωγού ($R = 0\\ \\Omega$), συνεπώς $V_E = 0\\text{ V}$.
                            `) : ''}
                            ${nodeKey === 'F' ? (state.topology === 'series' ? `
                                <strong>1. Ένταση Ρεύματος:</strong> Στον κόμβο F του κάτω αγωγού ${state.faultInstrument === 'ammeter_parallel' ? 'καταλήγει το τεράστιο ρεύμα βραχυκυκλώματος από το αμπερόμετρο $A_1$ ($I \\to \\infty$) και επιστρέφει απευθείας στον αρνητικό πόλο (−) της πηγής.' : 'διέρχεται το ρεύμα επιστροφής $I = ' + nodeCurrent.toFixed(2) + '\\text{ A}$ προς τον αρνητικό πόλο.'}<br>
                                <strong>2. Ηλεκτρικό Δυναμικό:</strong> Βρίσκεται αριστερά της γείωσης D πάνω στον ιδανικό αγωγό ($R = 0\\ \\Omega$), συνεπώς $V_F = V_D = 0\\text{ V}$.
                            ` : `
                                <strong>1. Ένταση Ρεύματος:</strong> Στον κόμβο F (κάτω από την πηγή) διέρχεται το ολικό ρεύμα επιστροφής $I_{\\text{ολ}} = ${nodeCurrentStr}$ που εισέρχεται στον αρνητικό πόλο (−) της πηγής.<br>
                                <strong>2. Ηλεκτρικό Δυναμικό:</strong> Συνδέεται απευθείας με τον κόμβο B και τη γείωση D μέσω ιδανικού αγωγού, άρα $V_F = 0\\text{ V}$.
                            `) : ''}
                        </p>
                    </div>
                ` : ''}
            `;
        } else if (probeTarget === 'harmless_wire') {
            const conn = state.harmlessConnection;
            let title = '🔗 Σύνδεση Ισοδυναμικών Σημείων (Ακίνδυνο Καλώδιο)';
            let badge = '✅ Χωρίς Βραχυκύκλωμα';
            let badgeClass = 'good';
            let explanation = '';

            if (conn === 'series_GA') {
                title = '🔗 Σύνδεση Κόμβων G ↔ A (Σειρά)';
                badge = '✅ Ισοδυναμική Σύνδεση (ΔV = 0 V)';
                explanation = `
                    <p style="font-size: 0.88rem; line-height: 1.5; margin: 4px 0;">
                        <strong>Φυσική Ερμηνεία:</strong> Οι κόμβοι <strong>G</strong> και <strong>A</strong> βρίσκονται και οι δύο στον θετικό πόλο της πηγής (μέσω του διακόπτη $K$ και του ιδανικού αμπερομέτρου $A_1$, όπου $R_A \\approx 0\\ \\Omega$).<br>
                        Συνεπώς έχουν ακριβώς το ίδιο ηλεκτρικό δυναμικό: $$V_G = V_A = V_{\\text{πηγ}} = ${phys.V_src}\\text{ V} \\implies V_{GA} = 0.00\\text{ V}$$
                        Επειδή δεν υπάρχει διαφορά δυναμικού στα άκρα του πρόσθετου καλωδίου και δεν παρακάμπτεται κανένας αντιστάτης ($R_1$ ή $R_2$), <strong>δεν προκαλείται καμία απολύτως αλλαγή στη λειτουργία του κυκλώματος</strong> ούτε βραχυκύκλωμα!
                    </p>
                `;
            } else if (conn === 'series_FC') {
                title = '🔗 Σύνδεση Κόμβων F ↔ C (Σειρά)';
                badge = '✅ Αγωγός Επιστροφής (ΔV = 0 V)';
                explanation = `
                    <p style="font-size: 0.88rem; line-height: 1.5; margin: 4px 0;">
                        <strong>Φυσική Ερμηνεία:</strong> Ο κόμβος <strong>F</strong> (στον κάτω αγωγό επιστροφής) και ο κόμβος <strong>C</strong> (μετά το αμπερόμετρο $A_3$) συνδέονται και οι δύο απευθείας με τον αρνητικό πόλο και τη γείωση $D$.<br>
                        Είναι και τα δύο σημεία μηδενικού δυναμικού: $$V_F = V_C = 0.00\\text{ V} \\implies V_{FC} = 0.00\\text{ V}$$
                        Η ένωσή τους προσθέτει έναν παράλληλο κλάδο μηδενικής αντίστασης πάνω στον ήδη υπάρχοντα ιδανικό αγωγό επιστροφής. <strong>Δεν παρακάμπτεται κανένας αντιστάτης</strong>, συνεπώς δεν προκαλείται βραχυκύκλωμα και τα ρεύματα παραμένουν αναλλοίωτα!
                    </p>
                `;
            } else if (conn === 'parallel_AC') {
                title = '🔗 Σύνδεση Κόμβων A ↔ C (Παράλληλα)';
                badge = '✅ Άνω Γραμμή Πηγής (ΔV = 0 V)';
                explanation = `
                    <p style="font-size: 0.88rem; line-height: 1.5; margin: 4px 0;">
                        <strong>Φυσική Ερμηνεία:</strong> Οι κόμβοι <strong>A</strong> και <strong>C</strong> είναι τα άνω σημεία τροφοδοσίας των δύο παράλληλων κλάδων ($R_1$ και $R_2$). Συνδέονται μεταξύ τους μέσω ιδανικού οριζόντιου αγωγού.<br>
                        Βρίσκονται στο ίδιο ηλεκτρικό δυναμικό: $$V_A = V_C = V_{\\text{πηγ}} = ${phys.V_src}\\text{ V} \\implies V_{AC} = 0.00\\text{ V}$$
                        Η σύνδεση πρόσθετου καλωδίου μεταξύ A και C είναι παράλληλη με τον ήδη υπάρχοντα αγωγό μηδενικής αντίστασης. <strong>Δεν γεφυρώνει τους πόλους κανενός αντιστάτη</strong>, άρα το κύκλωμα συνεχίζει να λειτουργεί απολύτως κανονικά!
                    </p>
                `;
            } else if (conn === 'parallel_FE') {
                title = '🔗 Σύνδεση Κόμβων F ↔ E (Παράλληλα)';
                badge = '✅ Κάτω Γραμμή Επιστροφής (ΔV = 0 V)';
                explanation = `
                    <p style="font-size: 0.88rem; line-height: 1.5; margin: 4px 0;">
                        <strong>Φυσική Ερμηνεία:</strong> Ο κόμβος <strong>F</strong> (κάτω από την πηγή) και ο κόμβος <strong>E</strong> (κάτω από τον κλάδο $R_2$) βρίσκονται πάνω στην κοινή γραμμή επιστροφής 0 V και τη γείωση $D$.<br>
                        Βρίσκονται σε κοινό δυναμικό: $$V_F = V_E = 0.00\\text{ V} \\implies V_{FE} = 0.00\\text{ V}$$
                        Δεν μεταβάλλει καμία πτώση τάσης και <strong>δεν προκαλεί κανένα βραχυκύκλωμα</strong>!
                    </p>
                `;
            } else {
                title = '🔗 Πρόσθετες Συνδέσεις Κυκλώματος';
                badge = 'Κανονική Λειτουργία';
                explanation = '<p style="font-size: 0.88rem; line-height: 1.5; margin: 4px 0;">Δεν έχει συνδεθεί κανένα πρόσθετο εξωτερικό καλώδιο.</p>';
            }

            detailsHtml = `
                <div class="hud-item-header">
                    <span class="hud-probe-icon">🔗</span>
                    <div class="hud-item-title-wrap">
                        <h4 class="hud-item-title">${title}</h4>
                        <span class="hud-item-badge ${badgeClass}">${badge}</span>
                    </div>
                </div>
                <div class="hud-readouts-grid cols-2" style="margin-bottom: 10px;">
                    <div class="hud-meter-box">
                        <span class="meter-lbl"><span>Διαφορά Δυναμικού</span><span class="meter-symbol">(ΔV):</span></span>
                        <span class="meter-val text-voltage">0.00 V</span>
                    </div>
                    <div class="hud-meter-box">
                        <span class="meter-lbl"><span>Επίδραση στο Κύκλωμα:</span></span>
                        <span class="meter-val" style="font-size: 1rem; color: #10b981;">✅ Καμία Αλλοίωση</span>
                    </div>
                </div>
                <div class="hud-steps-box" style="margin-top: 10px;">
                    ${explanation}
                </div>
            `;
        } else {
            // General Wire / Node / Branch hover
            const isBranch1 = probeTarget === 'branch1';
            const isBranch2 = probeTarget === 'branch2';
            let wireI = isBranch1 ? phys.I1 : (isBranch2 ? phys.I2 : phys.I_total);
            if (state.faultInstrument === 'ammeter_parallel' && !isBranch1 && !isBranch2) {
                wireI = state.switchClosed ? Infinity : 0;
            }
            const wireIStr = wireI === Infinity ? '∞ A (Υπερένταση / Βραχυκύκλωμα)' : `${wireI.toFixed(2)} A`;

            detailsHtml = `
                <div class="hud-item-header">
                    <span class="hud-probe-icon">⚡</span>
                    <div class="hud-item-title-wrap">
                        <h4 class="hud-item-title">Αγωγός Κυκλώματος (${isBranch1 ? 'Κλάδος R1' : isBranch2 ? 'Κλάδος R2' : 'Κύριος Αγωγός'})</h4>
                        <span class="hud-item-badge good">Ιδανικό Καλώδιο (R = 0 Ω)</span>
                    </div>
                </div>
                <div class="hud-readouts-grid cols-2">
                    <div class="hud-meter-box">
                        <span class="meter-lbl"><span>Ένταση Ρεύματος</span><span class="meter-symbol">(<span class="math-expr"><i class="math-var">I</i></span>):</span></span>
                        <span class="meter-val text-current ${wireI === Infinity ? 'danger-reading' : ''}">${wireIStr}</span>
                    </div>
                    <div class="hud-meter-box">
                        <span class="meter-lbl"><span>Πτώση Τάσης Καλωδίου</span><span class="meter-symbol">(ΔV):</span></span>
                        <span class="meter-val text-voltage">0.00 V</span>
                    </div>
                </div>
            `;
        }

        if (typeof formatMathText === 'function') {
            detailsHtml = formatMathText(detailsHtml);
        }
        hudCard.innerHTML = detailsHtml;
        if (typeof triggerMathTypeset === 'function') {
            triggerMathTypeset(hudCard);
        }
    }

    /**
     * Render the bottom summary strip
     */
    function updateMetrics() {
        const strip = document.getElementById('sim-metrics-strip');
        if (!strip) return;

        const phys = computePhysics();

        const itotText = phys.I_total === Infinity ? '∞ A (Υπερένταση)' : `${phys.I_total.toFixed(2)} A`;
        const ptotText = phys.P_total === Infinity ? '∞ W' : `${phys.P_total.toFixed(1)} W`;
        const reqText = phys.R_eq === Infinity ? '∞' : (phys.R_eq === 0 && phys.status === 'total_short' ? '0.0 Ω (Βραχυκύκλωμα)' : `${phys.R_eq.toFixed(1)} Ω`);

        let metricsHtml = `
            <div class="sim-metric-cell">
                <span class="metric-label">Ισοδύναμη <span class="meter-symbol">(<span class="math-expr"><i class="math-var">R</i><sub class="math-sub">ολ</sub></span>)</span></span>
                <span class="metric-value text-resistor">${reqText}</span>
            </div>
            <div class="sim-metric-cell">
                <span class="metric-label">Ολικό Ρεύμα <span class="meter-symbol">(<span class="math-expr"><i class="math-var">I</i><sub class="math-sub">ολ</sub></span>)</span></span>
                <span class="metric-value text-current ${phys.I_total === Infinity ? 'danger-reading' : ''}">${itotText}</span>
            </div>
            <div class="sim-metric-cell">
                <span class="metric-label">Τάση Πηγής <span class="meter-symbol">(<span class="math-expr"><i class="math-var">V</i><sub class="math-sub">πηγ</sub></span>)</span></span>
                <span class="metric-value text-voltage">${state.V_src} V</span>
            </div>
            <div class="sim-metric-cell">
                <span class="metric-label">Ολική Ισχύς <span class="meter-symbol">(<span class="math-expr"><i class="math-var">P</i><sub class="math-sub">ολ</sub></span>)</span></span>
                <span class="metric-value text-power ${phys.P_total === Infinity ? 'danger-reading' : ''}">${ptotText}</span>
            </div>
            <div class="sim-metric-cell">
                <span class="metric-label"><span class="meter-symbol"><span class="math-expr"><i class="math-var">R</i><sub class="math-sub">1</sub></span> / <span class="math-expr"><i class="math-var">I</i><sub class="math-sub">1</sub></span> / <span class="math-expr"><i class="math-var">V</i><sub class="math-sub">1</sub></span></span></span>
                <span class="metric-value" style="font-size: 0.95rem;">${state.R1} Ω / ${phys.I1.toFixed(2)} A / ${phys.V1.toFixed(1)} V</span>
            </div>
            <div class="sim-metric-cell">
                <span class="metric-label"><span class="meter-symbol"><span class="math-expr"><i class="math-var">R</i><sub class="math-sub">2</sub></span> / <span class="math-expr"><i class="math-var">I</i><sub class="math-sub">2</sub></span> / <span class="math-expr"><i class="math-var">V</i><sub class="math-sub">2</sub></span></span></span>
                <span class="metric-value" style="font-size: 0.95rem;">${state.R2} Ω / ${phys.I2.toFixed(2)} A / ${phys.V2.toFixed(1)} V</span>
            </div>
        `;
        if (typeof formatMathText === 'function') {
            metricsHtml = formatMathText(metricsHtml);
        }
        strip.innerHTML = metricsHtml;
        if (typeof triggerMathTypeset === 'function') {
            triggerMathTypeset(strip);
        }
    }

    /**
     * Smoothly scrolls and focuses the circuit diagram view
     */
    function focusDiagram() {
        setTimeout(function() {
            const card = document.getElementById('sim-schematic-card') || document.getElementById('sim-svg-viewport');
            if (!card) return;

            // In fullscreen modal, center the card in the modal viewport
            if (state.isFullscreen) {
                card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                return;
            }

            // Normal viewport: smoothly scroll so the schematic card is neatly visible beneath the sticky navbar
            const navbar = document.querySelector('.navbar');
            const navHeight = navbar ? navbar.offsetHeight : 70;
            const cardRect = card.getBoundingClientRect();
            const yOffset = -navHeight - 16;
            const targetY = cardRect.top + window.pageYOffset + yOffset;

            window.scrollTo({
                top: Math.max(0, targetY),
                behavior: 'smooth'
            });

            // Focus accessibility
            card.setAttribute('tabindex', '-1');
            try { card.focus({ preventScroll: true }); } catch (e) {}

            // Pulse glow highlight on the diagram card
            card.classList.remove('sim-schematic-focused');
            void card.offsetWidth;
            card.classList.add('sim-schematic-focused');
        }, 60);
    }

    /**
     * Public API methods
     */
    return {
        render: render,
        focusDiagram: focusDiagram,

        setTopology: function(topo) {
            state.topology = topo;
            state.faultInstrument = 'none'; // Opens by default in ΟΡΘΗ ΣΥΝΔΕΣΗ mode
            state.harmlessConnection = 'none';
            state.activeProbe = 'R1';
            // Uncheck parallel short if switching to parallel to avoid immediate total short
            if (topo === 'parallel') {
                state.shortR1 = false;
                state.shortR2 = false;
            }
            if (state.containerEl) render(state.containerEl);
        },

        setFaultInstrument: function(faultKey) {
            state.faultInstrument = faultKey || 'none';
            if (state.faultInstrument !== 'none') {
                // Lock and reset all short-circuits, damages, and harmless connections
                state.shortR1 = false;
                state.shortR2 = false;
                state.brokenR1 = false;
                state.brokenR2 = false;
                state.harmlessConnection = 'none';
            }
            if (faultKey === 'ammeter_parallel') {
                state.activeProbe = 'ammeter1';
                if (state.topology === 'series') {
                    showToast('⚠️ Λανθασμένη Τοποθέτηση Αμπερομέτρου I: Συνδέθηκε παράλληλα στην πηγή (Κόμβοι K − F)! Προκαλείται ολικό βραχυκύκλωμα (I → ∞).');
                } else {
                    showToast('⚠️ Λανθασμένη Τοποθέτηση Αμπερομέτρου I: Συνδέθηκε κάθετα πριν τους κλάδους (Κόμβοι K − F)! Ολικό βραχυκύκλωμα πηγής (I → ∞).');
                }
            } else if (faultKey === 'ammeter2_parallel') {
                state.activeProbe = 'ammeter2';
                if (state.topology === 'series') {
                    showToast('⚠️ Λανθασμένη Τοποθέτηση Αμπερομέτρου II: Συνδέθηκε μεταξύ K − M! Βραχυκυκλώνει τον R₂ (I₂ = 0 A), ενώ ο R₁ λειτουργεί κανονικά.');
                } else {
                    showToast('⚠️ Λανθασμένη Τοποθέτηση Αμπερομέτρου II: Συνδέθηκε κάθετα ανάμεσα στους R₁ & R₂ (Κόμβοι K − M)! Βραχυκυκλώνει όλη τη διάταξη (I → ∞).');
                }
            } else if (faultKey === 'voltmeter_series') {
                state.activeProbe = 'voltmeter_series';
                if (state.topology === 'series') {
                    showToast('⚠️ Λανθασμένη Τοποθέτηση Βολτομέτρου: Συνδέθηκε σε σειρά στη θέση του A₁ (Rv → ∞)! Μηδενίζει το ρεύμα (I = 0 A) και στα άκρα του εμφανίζεται όλη η τάση.');
                } else {
                    showToast('⚠️ Λανθασμένη Τοποθέτηση Βολτομέτρου: Συνδέθηκε σε σειρά στον κύριο αγωγό (Rv → ∞)! Μηδενίζει το ολικό ρεύμα (Iολ = 0 A) και στα άκρα του εμφανίζεται όλη η τάση.');
                }
            } else {
                state.activeProbe = 'R1';
                showToast('✅ Ορθή Τοποθέτηση Οργάνων: Όλα τα όργανα λειτουργούν στις κανονικές τους θέσεις.');
            }
            if (state.containerEl) {
                render(state.containerEl);
            } else {
                updateSvg();
                updateHud();
                updateMetrics();
            }

            if (faultKey && faultKey !== 'none') {
                focusDiagram();
            }
        },

        setShortMode: function(resistorKey, mode) {
            if (state.faultInstrument && state.faultInstrument !== 'none') return;
            if (resistorKey === 'R1') {
                state.shortR1 = true;
                state.brokenR1 = false;
                state.shortModeR1 = mode;
            } else if (resistorKey === 'R2') {
                state.shortR2 = true;
                state.brokenR2 = false;
                state.shortModeR2 = mode;
            }
            if (state.containerEl) {
                render(state.containerEl);
            } else {
                updateSvg();
                updateHud();
                updateMetrics();
            }
            if (mode === 'alternative') {
                if (state.topology === 'series') {
                    showToast(resistorKey === 'R1' ? 
                        '⚡ Έμμεση παράκαμψη R₁ (G ↔ B): Καλώδιο κάτω από τον R₁. Ο κόμβος G έχει ίδιο δυναμικό με τον A (VG = VA = Vπηγ), μηδενίζοντας την τάση V1 = 0 V!' : 
                        '⚡ Έμμεση παράκαμψη R₂ (B ↔ E): Καλώδιο B ↔ E. Ο κόμβος E έχει ίδιο δυναμικό με τον C (VE = VC = 0 V), μηδενίζοντας την τάση V2 = 0 V!');
                } else {
                    showToast(resistorKey === 'R1' ? 
                        '⚡ Έμμεση παράκαμψη A ↔ E: Ενώνει την άνω γραμμή (A) με την κάτω (E), παρακάμπτοντας τον R₁!' : 
                        '⚡ Έμμεση παράκαμψη B ↔ C: Ενώνει την κάτω γραμμή (B) με την άνω (C), παρακάμπτοντας τον R₂!');
                }
            } else {
                showToast(`⚡ Άμεση παράκαμψη στα άκρα του ${resistorKey} (${resistorKey === 'R1' ? 'A ↔ B' : (state.topology === 'series' ? 'B ↔ C' : 'C ↔ E')}).`);
            }
        },

        setHarmlessConnection: function(connKey) {
            if (state.faultInstrument && state.faultInstrument !== 'none') {
                showToast('🔒 Οι πρόσθετες συνδέσεις είναι κλειδωμένες κατά τη μελέτη σφάλματος τοποθέτησης οργάνου.');
                return;
            }
            // Toggle off if already active
            if (state.harmlessConnection === connKey) {
                state.harmlessConnection = 'none';
                state.activeProbe = 'R1';
                showToast('ℹ️ Αποσυνδέθηκαν τα πρόσθετα εξωτερικά καλώδια.');
            } else {
                state.harmlessConnection = connKey || 'none';
                if (connKey === 'series_GA') {
                    state.activeProbe = 'harmless_wire';
                    showToast('✅ Σύνδεση G ↔ A: Συνδέει δύο ισοδυναμικά σημεία (VG = VA = Vπηγ) κατά μήκος του ιδανικού αμπερομέτρου A1. Δεν προκαλεί καμία αλλοίωση ή βραχυκύκλωμα!');
                } else if (connKey === 'series_FC') {
                    state.activeProbe = 'harmless_wire';
                    showToast('✅ Σύνδεση F ↔ C: Συνδέει δύο σημεία του ίδιου αγωγού επιστροφής μηδενικού δυναμικού (VF = VC = 0 V). Δεν προκαλεί καμία αλλοίωση ή βραχυκύκλωμα!');
                } else if (connKey === 'parallel_AC') {
                    state.activeProbe = 'harmless_wire';
                    showToast('✅ Σύνδεση A ↔ C: Συνδέει δύο σημεία της κοινής άνω γραμμής (VA = VC = Vπηγ). Δεν αλλάζει καθόλου τη λειτουργία και δεν προκαλεί βραχυκύκλωμα!');
                } else if (connKey === 'parallel_FE') {
                    state.activeProbe = 'harmless_wire';
                    showToast('✅ Σύνδεση F ↔ E: Συνδέει δύο σημεία της κοινής κάτω γραμμής επιστροφής (VF = VE = 0 V). Δεν αλλάζει καθόλου τη λειτουργία και δεν προκαλεί βραχυκύκλωμα!');
                } else {
                    state.activeProbe = 'R1';
                    showToast('ℹ️ Αποσυνδέθηκαν τα πρόσθετα εξωτερικά καλώδια.');
                }
            }
            if (state.containerEl) {
                render(state.containerEl);
            } else {
                updateSvg();
                updateHud();
                updateMetrics();
            }

            if (state.harmlessConnection && state.harmlessConnection !== 'none') {
                focusDiagram();
            }
        },

        setParam: function(key, val) {
            if ((key === 'R1' || key === 'R2') && state.faultInstrument && state.faultInstrument !== 'none') {
                return;
            }
            state[key] = parseFloat(val);
            const disp = document.getElementById(key === 'V_src' ? 'disp-vsrc' : (key === 'R1' ? 'disp-r1' : 'disp-r2'));
            if (disp) disp.innerText = `${state[key]} ${key === 'V_src' ? 'V' : 'Ω'}`;
            updateSvg();
            updateHud();
            updateMetrics();
        },

        adjustParam: function(key, delta) {
            if ((key === 'R1' || key === 'R2') && state.faultInstrument && state.faultInstrument !== 'none') {
                return;
            }
            const min = 1;
            const max = key === 'V_src' ? 60 : 50;
            const next = Math.max(min, Math.min(max, state[key] + delta));
            state[key] = next;

            const slider = document.getElementById(key === 'V_src' ? 'sim-slider-vsrc' : (key === 'R1' ? 'sim-slider-r1' : 'sim-slider-r2'));
            if (slider) slider.value = next;

            const disp = document.getElementById(key === 'V_src' ? 'disp-vsrc' : (key === 'R1' ? 'disp-r1' : 'disp-r2'));
            if (disp) disp.innerText = `${next} ${key === 'V_src' ? 'V' : 'Ω'}`;

            updateSvg();
            updateHud();
            updateMetrics();
        },

        toggleSwitch: function() {
            state.switchClosed = !state.switchClosed;
            const btn = document.getElementById('sim-switch-btn');
            const btnText = document.getElementById('sim-switch-btn-text');
            if (btn && btnText) {
                btn.className = `sim-switch-toggle-btn ${state.switchClosed ? 'is-closed' : 'is-open'}`;
                btnText.innerText = state.switchClosed ? '🔴 Διακόπτης: ΚΛΕΙΣΤΟΣ (Ρεύμα Ενεργό)' : '⚪ Διακόπτης: ΑΝΟΙΚΤΟΣ (I = 0 A)';
            }
            updateSvg();
            updateHud();
            updateMetrics();
            showToast(state.switchClosed ? '⚡ Ο διακόπτης έκλεισε! Το ρεύμα ρέει.' : '⚪ Ο διακόπτης άνοιξε! Το ρεύμα διακόπηκε.');
        },

        toggleShort: function(key, checked) {
            if (state.faultInstrument && state.faultInstrument !== 'none') {
                const el = document.getElementById(key === 'shortR1' ? 'sim-short-r1' : 'sim-short-r2');
                if (el) el.checked = false;
                showToast('🔒 Οι διακόπτες βραχυκυκλώματος είναι κλειδωμένοι κατά τη μελέτη σφάλματος τοποθέτησης οργάνου.');
                return;
            }
            state[key] = checked;
            // If shorted, clear broken state for this component
            if (checked) {
                if (key === 'shortR1') {
                    state.brokenR1 = false;
                    const b1 = document.getElementById('sim-broken-r1');
                    if (b1) b1.checked = false;
                } else if (key === 'shortR2') {
                    state.brokenR2 = false;
                    const b2 = document.getElementById('sim-broken-r2');
                    if (b2) b2.checked = false;
                }
            }
            if (state.containerEl) {
                render(state.containerEl);
            } else {
                updateSvg();
                updateHud();
                updateMetrics();
            }
            if (checked) {
                if (state.topology === 'parallel') {
                    showToast('⚠️ Προσοχή: Βραχυκύκλωση κλάδου σε παράλληλη σύνδεση προκαλεί ολικό βραχυκύκλωμα της πηγής!');
                } else {
                    showToast('⚡ Μερικό βραχυκύκλωμα: Ο αντιστάτης παρακάμφθηκε, η ολική αντίσταση μειώθηκε!');
                }
            }
        },

        toggleBroken: function(key, checked) {
            if (state.faultInstrument && state.faultInstrument !== 'none') {
                const el = document.getElementById(key === 'brokenR1' ? 'sim-broken-r1' : 'sim-broken-r2');
                if (el) el.checked = false;
                showToast('🔒 Οι διακόπτες καταστροφής/διακοπής είναι κλειδωμένοι κατά τη μελέτη σφάλματος τοποθέτησης οργάνου.');
                return;
            }
            state[key] = checked;
            // If broken, clear short state for this component
            if (checked) {
                if (key === 'brokenR1') {
                    state.shortR1 = false;
                    const s1 = document.getElementById('sim-short-r1');
                    if (s1) s1.checked = false;
                } else if (key === 'brokenR2') {
                    state.shortR2 = false;
                    const s2 = document.getElementById('sim-short-r2');
                    if (s2) s2.checked = false;
                }
            }
            updateSvg();
            updateHud();
            updateMetrics();
            if (checked) {
                if (state.topology === 'series') {
                    showToast('💥 Καταστροφή συσκευής στη σειρά: Το κύκλωμα διακόπηκε (I = 0 A) και όλη η τάση εμφανίζεται στα άκρα της βλάβης!');
                } else {
                    showToast('💥 Καταστροφή συσκευής: Ο κλάδος διακόπηκε (I = 0 A). Ο άλλος παράλληλος κλάδος συνεχίζει να λειτουργεί ανεπηρέαστος!');
                }
            } else {
                showToast('🔧 Η βλάβη αποκαταστάθηκε! Ο αντιστάτης επαναλειτουργεί.');
            }
        },

        toggleShowSteps: function(checked) {
            state.showSteps = checked;
            updateHud();
        },

        selectProbe: function(component) {
            state.activeProbe = component;
            updateHud();
        },

        hoverProbe: function(component) {
            state.hoverProbe = component;
            updateHud();
        },

        applyPreset: function(presetKey) {
            // Deprecated / removed per user request: ready-made presets at top of simulation are disabled.
        },

        openFullscreenModal: function() {
            const modal = document.getElementById('sim-fullscreen-modal');
            const fsMount = document.getElementById('sim-fullscreen-mount');
            const normalMount = document.getElementById('simulation-mount');
            if (!modal || !fsMount) return;

            state.isFullscreen = true;

            // Clear normal mount so there are no duplicate IDs in the DOM
            if (normalMount) {
                normalMount.innerHTML = '';
            }

            modal.classList.add('active');
            document.body.style.overflow = 'hidden';

            render(fsMount);
        },

        closeFullscreenModal: function(e) {
            const modal = document.getElementById('sim-fullscreen-modal');
            const fsMount = document.getElementById('sim-fullscreen-mount');
            const normalMount = document.getElementById('simulation-mount');
            if (!modal || !modal.classList.contains('active')) return;

            state.isFullscreen = false;
            modal.classList.remove('active');
            document.body.style.overflow = '';

            if (fsMount) {
                fsMount.innerHTML = '';
            }

            if (normalMount && document.body.contains(normalMount)) {
                render(normalMount);
            }
        }
    };
})();
