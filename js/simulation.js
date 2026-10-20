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
        shortR1: false,          // Boolean
        shortR2: false,          // Boolean
        showSteps: true,         // Boolean: Show detailed calculation steps
        activeProbe: 'R1',       // Currently inspected component
        hoverProbe: null,        // Hovered element
        containerEl: null
    };

    // Preset configurations matching quiz questions
    const PRESETS = {
        'q1_series': {
            name: 'Πρόβλημα 1 (Σειρά: 20V, 4Ω + 6Ω)',
            topology: 'series',
            V_src: 20,
            R1: 4,
            R2: 6,
            switchClosed: true,
            shortR1: false,
            shortR2: false
        },
        'q4_parallel': {
            name: 'Πρόβλημα 4 (Παράλληλα: 30V, 10Ω || 30Ω)',
            topology: 'parallel',
            V_src: 30,
            R1: 10,
            R2: 30,
            switchClosed: true,
            shortR1: false,
            shortR2: false
        },
        'q24_short': {
            name: 'Πρόβλημα 24 (Βραχυκύκλωμα R1: 30V, 10Ω + 5Ω)',
            topology: 'series',
            V_src: 30,
            R1: 10,
            R2: 5,
            switchClosed: true,
            shortR1: true,
            shortR2: false
        },
        'standard_12v': {
            name: 'Εργαστήριο 12V (10Ω & 20Ω)',
            topology: 'series',
            V_src: 12,
            R1: 10,
            R2: 20,
            switchClosed: true,
            shortR1: false,
            shortR2: false
        }
    };

    /**
     * Compute all electrical quantities based on physical laws
     */
    function computePhysics() {
        const { topology, V_src, R1, R2, switchClosed, shortR1, shortR2 } = state;
        const res = {
            switchClosed,
            V_src,
            R1,
            R2,
            shortR1,
            shortR2,
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
            return res;
        }

        res.V_switch = 0;

        if (topology === 'series') {
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
            res.statusText = (shortR1 || shortR2) ? 'Μερικό Βραχυκύκλωμα' : 'Κανονική Λειτουργία (Σειρά)';
            res.R_eq = Req;
            res.I_total = I;
            res.I_switch = I;
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
            res.VG = V_src;
        } else {
            // Parallel circuit
            if (shortR1 || shortR2) {
                res.status = 'total_short';
                res.statusText = '⚠️ Ολικό Βραχυκύκλωμα Πηγής (Παράλληλη σύνδεση)!';
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

            const Req = (R1 * R2) / (R1 + R2);
            const I1 = V_src / R1;
            const I2 = V_src / R2;
            const Itot = I1 + I2;

            res.status = 'normal';
            res.statusText = 'Κανονική Λειτουργία (Παράλληλα)';
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

        container.innerHTML = `
            <div class="sim-container theme-physics">
                <!-- Header Toolbar: Topology & Presets -->
                <div class="sim-header-card">
                    <div class="sim-header-top">
                        <div class="sim-title-wrap">
                            <span class="sim-title-badge">⚡ Εικονικό Εργαστήριο Φυσικής</span>
                            <h2 class="sim-title">Διαδραστική Προσομοίωση Κυκλωμάτων</h2>
                            <p class="sim-subtitle">
                                Μεταβάλλετε τις τιμές τάσης και αντιστάσεων, ανοιγοκλείστε τον διακόπτη και περάστε το ποντίκι πάνω από οποιοδήποτε στοιχείο για ζωντανή μέτρηση & ανάλυση!
                            </p>
                        </div>
                        
                        <!-- Topology Segmented Switch -->
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
                    </div>

                    <!-- Preset Quick Load Pills -->
                    <div class="sim-presets-bar">
                        <span class="sim-presets-label">🎯 Έτοιμες Ρυθμίσεις (από τα Κουίζ):</span>
                        <div class="sim-presets-list">
                            ${Object.entries(PRESETS).map(([key, p]) => `
                                <button class="sim-preset-pill" onclick="CircuitSimulation.applyPreset('${key}')" title="Φόρτωση τιμών">
                                    ${p.name}
                                </button>
                            `).join('')}
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
                        <div class="sim-control-group">
                            <div class="sim-control-header">
                                <label for="sim-slider-r1">
                                    <strong>Αντιστάτης 1</strong> <span class="math-expr">(<i class="math-var">R</i><sub class="math-sub">1</sub>)</span>:
                                </label>
                                <span class="sim-val-display" id="disp-r1">${state.R1} Ω</span>
                            </div>
                            <div class="sim-slider-row">
                                <input type="range" id="sim-slider-r1" min="1" max="50" step="1" value="${state.R1}" 
                                       oninput="CircuitSimulation.setParam('R1', this.value)" />
                            </div>
                            <div class="sim-toggles-row">
                                <label class="sim-toggle-checkbox">
                                    <input type="checkbox" id="sim-short-r1" ${state.shortR1 ? 'checked' : ''} 
                                           onchange="CircuitSimulation.toggleShort('shortR1', this.checked)">
                                    <span class="checkbox-custom"></span>
                                    <span class="checkbox-label">Βραχυκύκλωση <span class="math-expr"><i class="math-var">R</i><sub class="math-sub">1</sub></span> (Bypass)</span>
                                </label>
                            </div>
                        </div>

                        <!-- 3. Resistor R2 Control -->
                        <div class="sim-control-group">
                            <div class="sim-control-header">
                                <label for="sim-slider-r2">
                                    <strong>Αντιστάτης 2</strong> <span class="math-expr">(<i class="math-var">R</i><sub class="math-sub">2</sub>)</span>:
                                </label>
                                <span class="sim-val-display" id="disp-r2">${state.R2} Ω</span>
                            </div>
                            <div class="sim-slider-row">
                                <input type="range" id="sim-slider-r2" min="1" max="50" step="1" value="${state.R2}" 
                                       oninput="CircuitSimulation.setParam('R2', this.value)" />
                            </div>
                            <div class="sim-toggles-row">
                                <label class="sim-toggle-checkbox">
                                    <input type="checkbox" id="sim-short-r2" ${state.shortR2 ? 'checked' : ''} 
                                           onchange="CircuitSimulation.toggleShort('shortR2', this.checked)">
                                    <span class="checkbox-custom"></span>
                                    <span class="checkbox-label">Βραχυκύκλωση <span class="math-expr"><i class="math-var">R</i><sub class="math-sub">2</sub></span> (Bypass)</span>
                                </label>
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
                                <div class="sim-instructions-badge">
                                    🔍 <em>Περάστε το ποντίκι πάνω από στοιχεία ή κόμβους για πληροφορίες</em>
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
        const isShortTotal = phys.status === 'total_short';
        const hasCurrent = isClosed && !isShortTotal && phys.I_total > 0;

        // Particle speed & dasharray
        const animSpeed = hasCurrent ? Math.max(0.6, Math.min(3.5, 4.5 / phys.I_total)).toFixed(2) : 0;
        const currentLineClass = hasCurrent ? 'wire-current-active' : 'wire-current-inactive';

        let svgHtml = '';

        if (state.topology === 'series') {
            svgHtml = `
                <svg viewBox="0 0 840 430" class="sim-svg-circuit" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <!-- Glow filter for active wires -->
                        <filter id="wire-glow" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="3.5" result="blur" />
                            <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                        <!-- Arrowhead marker for conventional current flow -->
                        <marker id="current-arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#38bdf8" />
                        </marker>
                    </defs>

                    <!-- Background Base Wire Path (Gray) -->
                    <rect x="90" y="80" width="660" height="270" rx="16" ry="16" class="circuit-wire-base" />

                    <!-- Active Animated Current Overlay Path -->
                    <rect x="90" y="80" width="660" height="270" rx="16" ry="16" 
                          class="circuit-wire-current ${currentLineClass}" 
                          style="animation-duration: ${animSpeed}s;" />

                    <!-- Conventional Flow Directional Arrows (Series Closed Loop) -->
                    ${hasCurrent ? `
                        <path d="M 90 200 L 90 140" marker-end="url(#current-arrow)" class="flow-arrow-path" />
                        <path d="M 230 80 L 290 80" marker-end="url(#current-arrow)" class="flow-arrow-path" />
                        <path d="M 750 160 L 750 240" marker-end="url(#current-arrow)" class="flow-arrow-path" />
                        <path d="M 710 350 L 640 350" marker-end="url(#current-arrow)" class="flow-arrow-path" />
                        <path d="M 530 350 L 470 350" marker-end="url(#current-arrow)" class="flow-arrow-path" />
                        <path d="M 370 350 L 310 350" marker-end="url(#current-arrow)" class="flow-arrow-path" />
                        <path d="M 210 350 L 150 350" marker-end="url(#current-arrow)" class="flow-arrow-path" />
                    ` : ''}

                    <!-- 1. DC VOLTAGE SOURCE (BATTERY) at Left (x=90, y=215) -->
                    <g class="comp-interactive comp-source" data-probe="source" 
                       onmouseenter="CircuitSimulation.hoverProbe('source')" 
                       onmouseleave="CircuitSimulation.hoverProbe(null)"
                       onclick="CircuitSimulation.selectProbe('source')">
                        <!-- Click / Hover Hitbox -->
                        <rect x="50" y="160" width="80" height="110" class="comp-hitbox" />
                        <!-- Battery Plates -->
                        <line x1="68" y1="200" x2="112" y2="200" class="battery-plate positive" />
                        <line x1="78" y1="230" x2="102" y2="230" class="battery-plate negative" />
                        <!-- Polarity & Labels -->
                        <text x="122" y="196" class="comp-label bold text-positive">+</text>
                        <text x="122" y="235" class="comp-label bold text-negative">−</text>
                        <text x="44" y="218" class="comp-value-tag"><tspan font-style="italic">V</tspan><tspan font-size="0.75em" dy="3">πηγ</tspan><tspan dy="-3"> = ${state.V_src} V</tspan></text>
                    </g>

                    <!-- NODE G (x=90, y=80) - Above Source -->
                    <g class="circuit-node-group" onmouseenter="CircuitSimulation.hoverProbe('nodeG')" onmouseleave="CircuitSimulation.hoverProbe(null)" onclick="CircuitSimulation.selectProbe('nodeG')">
                        <circle cx="90" cy="80" r="14" class="comp-hitbox" fill="transparent" />
                        <circle cx="90" cy="80" r="4" class="circuit-node-dot" />
                        <text x="90" y="65" class="node-letter">G</text>
                    </g>

                    <!-- 2. SWITCH K at Top-Left (x=170 to x=230, y=80) -->
                    <g class="comp-interactive comp-switch" data-probe="switch"
                       onmouseenter="CircuitSimulation.hoverProbe('switch')" 
                       onmouseleave="CircuitSimulation.hoverProbe(null)"
                       onclick="CircuitSimulation.toggleSwitch()">
                        <rect x="155" y="45" width="90" height="70" class="comp-hitbox" />
                        <!-- Terminals -->
                        <circle cx="170" cy="80" r="4.5" class="terminal-dot" />
                        <circle cx="230" cy="80" r="4.5" class="terminal-dot" />
                        <!-- Blade -->
                        ${isClosed ? `
                            <line x1="170" y1="80" x2="230" y2="80" class="switch-blade closed" />
                        ` : `
                            <line x1="170" y1="80" x2="220" y2="52" class="switch-blade open" />
                        `}
                        <text x="200" y="40" class="comp-title-tag">Διακόπτης K (${isClosed ? 'Κλειστός' : 'Ανοικτός'})</text>
                    </g>

                    <!-- 3. AMMETER A at Top-Center (x=300, y=80) -->
                    <g class="comp-interactive comp-meter" data-probe="ammeter"
                       onmouseenter="CircuitSimulation.hoverProbe('ammeter')" 
                       onmouseleave="CircuitSimulation.hoverProbe(null)"
                       onclick="CircuitSimulation.selectProbe('ammeter')">
                        <rect x="275" y="55" width="55" height="55" class="comp-hitbox" />
                        <circle cx="302" cy="80" r="19" class="meter-circle" />
                        <text x="302" y="86" class="meter-text">A</text>
                        <text x="302" y="118" class="meter-reading-tag">${phys.I_total.toFixed(2)} A</text>
                    </g>

                    <!-- NODE A (x=380, y=80) -->
                    <g class="circuit-node-group" onmouseenter="CircuitSimulation.hoverProbe('nodeA')" onmouseleave="CircuitSimulation.hoverProbe(null)" onclick="CircuitSimulation.selectProbe('nodeA')">
                        <circle cx="380" cy="80" r="14" class="comp-hitbox" fill="transparent" />
                        <circle cx="380" cy="80" r="4" class="circuit-node-dot" />
                        <text x="380" y="65" class="node-letter">A</text>
                    </g>

                    <!-- 4. RESISTOR R1 (x=410 to x=510, y=80) -->
                    <g class="comp-interactive comp-resistor ${state.shortR1 ? 'is-shorted' : ''}" data-probe="R1"
                       onmouseenter="CircuitSimulation.hoverProbe('R1')" 
                       onmouseleave="CircuitSimulation.hoverProbe(null)"
                       onclick="CircuitSimulation.selectProbe('R1')">
                        <rect x="395" y="40" width="130" height="85" class="comp-hitbox" />
                        <!-- Resistance value above resistor (LaTeX style) -->
                        <text x="460" y="53" class="comp-resistor-top" text-anchor="middle"><tspan font-style="italic">R</tspan><tspan font-size="0.75em" dy="3">1</tspan><tspan dy="-3"> = ${state.R1} Ω</tspan></text>
                        <!-- Resistor Box -->
                        <rect x="415" y="68" width="90" height="24" rx="4" class="resistor-body ${state.shortR1 ? 'shorted' : ''}" />
                        <text x="460" y="80" class="resistor-inner-text"><tspan font-style="italic">R</tspan><tspan font-size="0.75em" dy="3">1</tspan></text>
                        <!-- Voltage drop value below resistor (LaTeX style) -->
                        <text x="460" y="120" class="comp-resistor-bottom" text-anchor="middle">${state.shortR1 ? '<tspan font-style="italic">V</tspan><tspan font-size="0.75em" dy="3">1</tspan><tspan dy="-3"> = 0.0 V (0 Ω)</tspan>' : `<tspan font-style="italic">V</tspan><tspan font-size="0.75em" dy="3">1</tspan><tspan dy="-3"> = ${phys.V1.toFixed(1)} V</tspan>`}</text>

                        <!-- Bypass Wire if shorted -->
                        ${state.shortR1 ? `
                            <path d="M 380 80 C 420 25, 500 25, 540 80" class="short-circuit-bypass-wire" />
                            <text x="460" y="22" class="short-wire-label">⚠️ Καλώδιο Βραχυκύκλωσης</text>
                        ` : ''}
                    </g>

                    <!-- NODE B (x=540, y=80) -->
                    <g class="circuit-node-group" onmouseenter="CircuitSimulation.hoverProbe('nodeB')" onmouseleave="CircuitSimulation.hoverProbe(null)" onclick="CircuitSimulation.selectProbe('nodeB')">
                        <circle cx="540" cy="80" r="14" class="comp-hitbox" fill="transparent" />
                        <circle cx="540" cy="80" r="4" class="circuit-node-dot" />
                        <text x="540" y="65" class="node-letter">B</text>
                    </g>

                    <!-- 5. RESISTOR R2 (x=570 to x=670, y=80) -->
                    <g class="comp-interactive comp-resistor ${state.shortR2 ? 'is-shorted' : ''}" data-probe="R2"
                       onmouseenter="CircuitSimulation.hoverProbe('R2')" 
                       onmouseleave="CircuitSimulation.hoverProbe(null)"
                       onclick="CircuitSimulation.selectProbe('R2')">
                        <rect x="555" y="40" width="130" height="85" class="comp-hitbox" />
                        <!-- Resistance value above resistor (LaTeX style) -->
                        <text x="620" y="53" class="comp-resistor-top" text-anchor="middle"><tspan font-style="italic">R</tspan><tspan font-size="0.75em" dy="3">2</tspan><tspan dy="-3"> = ${state.R2} Ω</tspan></text>
                        <!-- Resistor Box -->
                        <rect x="575" y="68" width="90" height="24" rx="4" class="resistor-body ${state.shortR2 ? 'shorted' : ''}" />
                        <text x="620" y="80" class="resistor-inner-text"><tspan font-style="italic">R</tspan><tspan font-size="0.75em" dy="3">2</tspan></text>
                        <!-- Voltage drop value below resistor (LaTeX style) -->
                        <text x="620" y="120" class="comp-resistor-bottom" text-anchor="middle">${state.shortR2 ? '<tspan font-style="italic">V</tspan><tspan font-size="0.75em" dy="3">2</tspan><tspan dy="-3"> = 0.0 V (0 Ω)</tspan>' : `<tspan font-style="italic">V</tspan><tspan font-size="0.75em" dy="3">2</tspan><tspan dy="-3"> = ${phys.V2.toFixed(1)} V</tspan>`}</text>

                        <!-- Bypass Wire if shorted -->
                        ${state.shortR2 ? `
                            <path d="M 540 80 C 580 25, 660 25, 700 80" class="short-circuit-bypass-wire" />
                            <text x="620" y="22" class="short-wire-label">⚠️ Καλώδιο Βραχυκύκλωσης</text>
                        ` : ''}
                    </g>

                    <!-- NODE C (x=700, y=80) -->
                    <g class="circuit-node-group" onmouseenter="CircuitSimulation.hoverProbe('nodeC')" onmouseleave="CircuitSimulation.hoverProbe(null)" onclick="CircuitSimulation.selectProbe('nodeC')">
                        <circle cx="700" cy="80" r="14" class="comp-hitbox" fill="transparent" />
                        <circle cx="700" cy="80" r="4" class="circuit-node-dot" />
                        <text x="700" y="65" class="node-letter">C</text>
                    </g>

                    <!-- Wire Probe Zones (Hovering plain wires) -->
                    <g class="wire-probe-zone" onmouseenter="CircuitSimulation.hoverProbe('wireMain')" onmouseleave="CircuitSimulation.hoverProbe(null)">
                        <rect x="735" y="130" width="30" height="150" class="probe-wire-hitbox" />
                        <rect x="110" y="335" width="110" height="30" class="probe-wire-hitbox" />
                        <rect x="640" y="335" width="90" height="30" class="probe-wire-hitbox" />
                    </g>

                    <!-- NODE F (x=260, y=350) - Left of Ground D -->
                    <g class="circuit-node-group" onmouseenter="CircuitSimulation.hoverProbe('nodeF')" onmouseleave="CircuitSimulation.hoverProbe(null)" onclick="CircuitSimulation.selectProbe('nodeF')">
                        <circle cx="260" cy="350" r="14" class="comp-hitbox" fill="transparent" />
                        <circle cx="260" cy="350" r="4" class="circuit-node-dot" />
                        <text x="260" y="335" class="node-letter">F</text>
                    </g>

                    <!-- NODE D (GROUND) at Bottom (x=420, y=350) -->
                    <g class="circuit-node-group" onmouseenter="CircuitSimulation.hoverProbe('nodeD')" onmouseleave="CircuitSimulation.hoverProbe(null)" onclick="CircuitSimulation.selectProbe('nodeD')">
                        <circle cx="420" cy="350" r="14" class="comp-hitbox" fill="transparent" />
                        <circle cx="420" cy="350" r="4" class="circuit-node-dot" />
                        <!-- Ground symbol lines -->
                        <line x1="420" y1="350" x2="420" y2="385" class="ground-stem" />
                        <line x1="405" y1="385" x2="435" y2="385" class="ground-line" />
                        <line x1="410" y1="390" x2="430" y2="390" class="ground-line" />
                        <line x1="415" y1="395" x2="425" y2="395" class="ground-line" />
                        <!-- Ground label moved to the right for clear visibility -->
                        <text x="442" y="380" class="node-letter ground-label" text-anchor="start">D (0 V)</text>
                    </g>

                    <!-- NODE E (x=580, y=350) - Right of Ground D -->
                    <g class="circuit-node-group" onmouseenter="CircuitSimulation.hoverProbe('nodeE')" onmouseleave="CircuitSimulation.hoverProbe(null)" onclick="CircuitSimulation.selectProbe('nodeE')">
                        <circle cx="580" cy="350" r="14" class="comp-hitbox" fill="transparent" />
                        <circle cx="580" cy="350" r="4" class="circuit-node-dot" />
                        <text x="580" y="335" class="node-letter">E</text>
                    </g>
                </svg>
            `;
        } else {
            // PARALLEL CIRCUIT SVG (Σχήμα 2 - Vertical Resistors)
            svgHtml = `
                <svg viewBox="0 0 840 430" class="sim-svg-circuit" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <!-- Glow filter for active wires -->
                        <filter id="wire-glow-par" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="3.5" result="blur" />
                            <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                        <marker id="current-arrow-par" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#38bdf8" />
                        </marker>
                    </defs>

                    <!-- Base Wire Framework (Gray) -->
                    <!-- Outer rectangular loop: G(100,80) -> C(620,80) -> E(620,350) -> F(100,350) -> battery -->
                    <path d="M 100 200 L 100 80 L 620 80 L 620 350 L 100 350 L 100 230" class="circuit-wire-base" />
                    <!-- Branch 1 (Vertical from A to B at x=380) -->
                    <line x1="380" y1="80" x2="380" y2="350" class="circuit-wire-base" />

                    <!-- Active Animated Current Overlay Paths -->
                    <!-- Main supply current: Battery -> G -> Switch K -> A -->
                    <path d="M 100 200 L 100 80 L 380 80" class="circuit-wire-current ${currentLineClass}" style="animation-duration: ${animSpeed}s;" />
                    <!-- Main return current: B -> F -> Battery -->
                    <path d="M 380 350 L 100 350 L 100 230" class="circuit-wire-current ${currentLineClass}" style="animation-duration: ${animSpeed}s;" />

                    <!-- Branch 1 current I1: A(380,80) down to B(380,350) -->
                    <line x1="380" y1="80" x2="380" y2="350" class="circuit-wire-current ${currentLineClass}" 
                          style="animation-duration: ${hasCurrent ? (3 / Math.max(0.2, phys.I1)).toFixed(2) : 0}s;" />

                    <!-- Branch 2 current I2: A(380,80) -> C(620,80) -> E(620,350) -> B(380,350) -->
                    <path d="M 380 80 L 620 80 L 620 350 L 380 350" class="circuit-wire-current ${currentLineClass}" 
                          style="animation-duration: ${hasCurrent ? (3 / Math.max(0.2, phys.I2)).toFixed(2) : 0}s;" />

                    <!-- Conventional Flow Directional Arrows (Parallel) -->
                    ${hasCurrent ? `
                        <!-- Left wire up towards G -->
                        <path d="M 100 180 L 100 120" marker-end="url(#current-arrow-par)" class="flow-arrow-path" />
                        <!-- Top wire from G to switch -->
                        <path d="M 125 80 L 165 80" marker-end="url(#current-arrow-par)" class="flow-arrow-path" />
                        <!-- Top wire from switch to A -->
                        <path d="M 260 80 L 330 80" marker-end="url(#current-arrow-par)" class="flow-arrow-path" />
                        <!-- Top wire between A and C -->
                        <path d="M 440 80 L 540 80" marker-end="url(#current-arrow-par)" class="flow-arrow-path" />
                        <!-- Branch 1 (R1) downwards: above and below resistor -->
                        <path d="M 380 110 L 380 155" marker-end="url(#current-arrow-par)" class="flow-arrow-path" />
                        <path d="M 380 275 L 380 320" marker-end="url(#current-arrow-par)" class="flow-arrow-path" />
                        <!-- Branch 2 (R2) downwards: above and below resistor -->
                        <path d="M 620 110 L 620 155" marker-end="url(#current-arrow-par)" class="flow-arrow-path" />
                        <path d="M 620 275 L 620 320" marker-end="url(#current-arrow-par)" class="flow-arrow-path" />
                        <!-- Bottom wire from E to D -->
                        <path d="M 580 350 L 535 350" marker-end="url(#current-arrow-par)" class="flow-arrow-path" />
                        <!-- Bottom wire from D to B -->
                        <path d="M 465 350 L 415 350" marker-end="url(#current-arrow-par)" class="flow-arrow-path" />
                        <!-- Bottom wire from B to F -->
                        <path d="M 280 350 L 180 350" marker-end="url(#current-arrow-par)" class="flow-arrow-path" />
                        <!-- Left wire return to battery -->
                        <path d="M 100 320 L 100 260" marker-end="url(#current-arrow-par)" class="flow-arrow-path" />
                    ` : ''}

                    <!-- 1. DC SOURCE at Left (x=100, y=215) -->
                    <g class="comp-interactive comp-source" data-probe="source"
                       onmouseenter="CircuitSimulation.hoverProbe('source')" 
                       onmouseleave="CircuitSimulation.hoverProbe(null)"
                       onclick="CircuitSimulation.selectProbe('source')">
                        <rect x="60" y="160" width="80" height="110" class="comp-hitbox" />
                        <line x1="78" y1="200" x2="122" y2="200" class="battery-plate positive" />
                        <line x1="88" y1="230" x2="112" y2="230" class="battery-plate negative" />
                        <text x="132" y="196" class="comp-label bold text-positive">+</text>
                        <text x="132" y="235" class="comp-label bold text-negative">−</text>
                        <text x="54" y="218" class="comp-value-tag"><tspan font-style="italic">V</tspan><tspan font-size="0.75em" dy="3">πηγ</tspan><tspan dy="-3"> = ${state.V_src} V</tspan></text>
                    </g>

                    <!-- 2. SWITCH K at Top-Left (x=180 to x=240, y=80) -->
                    <g class="comp-interactive comp-switch" data-probe="switch"
                       onmouseenter="CircuitSimulation.hoverProbe('switch')" 
                       onmouseleave="CircuitSimulation.hoverProbe(null)"
                       onclick="CircuitSimulation.toggleSwitch()">
                        <rect x="165" y="45" width="90" height="70" class="comp-hitbox" />
                        <circle cx="180" cy="80" r="4.5" class="terminal-dot" />
                        <circle cx="240" cy="80" r="4.5" class="terminal-dot" />
                        ${isClosed ? `
                            <line x1="180" y1="80" x2="240" y2="80" class="switch-blade closed" />
                        ` : `
                            <line x1="180" y1="80" x2="230" y2="52" class="switch-blade open" />
                        `}
                        <text x="210" y="40" class="comp-title-tag">Διακόπτης K (${isClosed ? 'Κλειστός' : 'Ανοικτός'})</text>
                    </g>

                    <!-- 3. RESISTOR R1 (Vertical Branch 1: x=380) -->
                    <g class="comp-interactive comp-resistor ${state.shortR1 ? 'is-shorted' : ''}" data-probe="R1"
                       onmouseenter="CircuitSimulation.hoverProbe('R1')" 
                       onmouseleave="CircuitSimulation.hoverProbe(null)"
                       onclick="CircuitSimulation.selectProbe('R1')">
                        <rect x="350" y="150" width="180" height="130" class="comp-hitbox" />
                        <!-- Vertical Resistor Box -->
                        <rect x="368" y="170" width="24" height="90" rx="4" class="resistor-body ${state.shortR1 ? 'shorted' : ''}" />
                        <text x="380" y="215" class="resistor-inner-text" dominant-baseline="middle" text-anchor="middle"><tspan font-style="italic">R</tspan><tspan font-size="0.75em" dy="3">1</tspan></text>
                        <!-- Values to the right: R, V, I (25% larger font: 19px) -->
                        <text x="406" y="196" class="comp-resistor-par-top" text-anchor="start"><tspan font-style="italic">R</tspan><tspan font-size="0.75em" dy="3">1</tspan><tspan dy="-3"> = ${state.R1} Ω</tspan></text>
                        <text x="406" y="224" class="comp-resistor-par-bottom" text-anchor="start">${state.shortR1 ? '<tspan font-style="italic">V</tspan><tspan font-size="0.75em" dy="3">1</tspan><tspan dy="-3"> = 0.0 V (0 Ω)</tspan>' : `<tspan font-style="italic">V</tspan><tspan font-size="0.75em" dy="3">1</tspan><tspan dy="-3"> = ${phys.V1.toFixed(1)} V</tspan>`}</text>
                        <text x="406" y="252" class="comp-resistor-par-current" text-anchor="start"><tspan font-style="italic">I</tspan><tspan font-size="0.75em" dy="3">1</tspan><tspan dy="-3"> = ${phys.I1.toFixed(2)} A</tspan></text>

                        <!-- Bypass Wire if shorted -->
                        ${state.shortR1 ? `
                            <path d="M 380 80 C 330 140, 330 290, 380 350" class="short-circuit-bypass-wire" />
                            <text x="320" y="215" class="short-wire-label" text-anchor="end">⚠️ Βραχυκύκλωμα R1</text>
                        ` : ''}
                    </g>

                    <!-- 4. RESISTOR R2 (Vertical Branch 2: x=620) -->
                    <g class="comp-interactive comp-resistor ${state.shortR2 ? 'is-shorted' : ''}" data-probe="R2"
                       onmouseenter="CircuitSimulation.hoverProbe('R2')" 
                       onmouseleave="CircuitSimulation.hoverProbe(null)"
                       onclick="CircuitSimulation.selectProbe('R2')">
                        <rect x="590" y="150" width="180" height="130" class="comp-hitbox" />
                        <!-- Vertical Resistor Box -->
                        <rect x="608" y="170" width="24" height="90" rx="4" class="resistor-body ${state.shortR2 ? 'shorted' : ''}" />
                        <text x="620" y="215" class="resistor-inner-text" dominant-baseline="middle" text-anchor="middle"><tspan font-style="italic">R</tspan><tspan font-size="0.75em" dy="3">2</tspan></text>
                        <!-- Values to the right: R, V, I (25% larger font: 19px) -->
                        <text x="646" y="196" class="comp-resistor-par-top" text-anchor="start"><tspan font-style="italic">R</tspan><tspan font-size="0.75em" dy="3">2</tspan><tspan dy="-3"> = ${state.R2} Ω</tspan></text>
                        <text x="646" y="224" class="comp-resistor-par-bottom" text-anchor="start">${state.shortR2 ? '<tspan font-style="italic">V</tspan><tspan font-size="0.75em" dy="3">2</tspan><tspan dy="-3"> = 0.0 V (0 Ω)</tspan>' : `<tspan font-style="italic">V</tspan><tspan font-size="0.75em" dy="3">2</tspan><tspan dy="-3"> = ${phys.V2.toFixed(1)} V</tspan>`}</text>
                        <text x="646" y="252" class="comp-resistor-par-current" text-anchor="start"><tspan font-style="italic">I</tspan><tspan font-size="0.75em" dy="3">2</tspan><tspan dy="-3"> = ${phys.I2.toFixed(2)} A</tspan></text>

                        <!-- Bypass Wire if shorted -->
                        ${state.shortR2 ? `
                            <path d="M 620 80 C 570 140, 570 290, 620 350" class="short-circuit-bypass-wire" />
                            <text x="560" y="215" class="short-wire-label" text-anchor="end">⚠️ Βραχυκύκλωμα R2</text>
                        ` : ''}
                    </g>

                    <!-- Wire Probe Zones -->
                    <g class="wire-probe-zone">
                        <g onmouseenter="CircuitSimulation.hoverProbe('wireMain')" onmouseleave="CircuitSimulation.hoverProbe(null)">
                            <rect x="250" y="65" width="100" height="30" class="probe-wire-hitbox" />
                            <rect x="85" y="100" width="30" height="80" class="probe-wire-hitbox" />
                            <rect x="85" y="270" width="30" height="70" class="probe-wire-hitbox" />
                            <rect x="140" y="335" width="200" height="30" class="probe-wire-hitbox" />
                        </g>
                        <g onmouseenter="CircuitSimulation.hoverProbe('branch1')" onmouseleave="CircuitSimulation.hoverProbe(null)">
                            <rect x="365" y="95" width="30" height="65" class="probe-wire-hitbox" />
                            <rect x="365" y="270" width="30" height="65" class="probe-wire-hitbox" />
                        </g>
                        <g onmouseenter="CircuitSimulation.hoverProbe('branch2')" onmouseleave="CircuitSimulation.hoverProbe(null)">
                            <rect x="410" y="65" width="180" height="30" class="probe-wire-hitbox" />
                            <rect x="605" y="95" width="30" height="65" class="probe-wire-hitbox" />
                            <rect x="605" y="270" width="30" height="65" class="probe-wire-hitbox" />
                            <rect x="410" y="335" width="180" height="30" class="probe-wire-hitbox" />
                        </g>
                    </g>

                    <!-- NODE G (x=100, y=80) - Above Source -->
                    <g class="circuit-node-group" onmouseenter="CircuitSimulation.hoverProbe('nodeG')" onmouseleave="CircuitSimulation.hoverProbe(null)" onclick="CircuitSimulation.selectProbe('nodeG')">
                        <circle cx="100" cy="80" r="14" class="comp-hitbox" fill="transparent" />
                        <circle cx="100" cy="80" r="4" class="circuit-node-dot" />
                        <text x="100" y="65" class="node-letter">G</text>
                    </g>

                    <!-- NODE A (x=380, y=80) - Top of Branch 1 -->
                    <g class="circuit-node-group" onmouseenter="CircuitSimulation.hoverProbe('nodeA')" onmouseleave="CircuitSimulation.hoverProbe(null)" onclick="CircuitSimulation.selectProbe('nodeA')">
                        <circle cx="380" cy="80" r="14" class="comp-hitbox" fill="transparent" />
                        <circle cx="380" cy="80" r="4" class="circuit-node-dot" />
                        <text x="380" y="65" class="node-letter">A</text>
                    </g>

                    <!-- NODE C (x=620, y=80) - Top of Branch 2 -->
                    <g class="circuit-node-group" onmouseenter="CircuitSimulation.hoverProbe('nodeC')" onmouseleave="CircuitSimulation.hoverProbe(null)" onclick="CircuitSimulation.selectProbe('nodeC')">
                        <circle cx="620" cy="80" r="14" class="comp-hitbox" fill="transparent" />
                        <circle cx="620" cy="80" r="4" class="circuit-node-dot" />
                        <text x="620" y="65" class="node-letter">C</text>
                    </g>

                    <!-- NODE F (x=100, y=350) - Under Source -->
                    <g class="circuit-node-group" onmouseenter="CircuitSimulation.hoverProbe('nodeF')" onmouseleave="CircuitSimulation.hoverProbe(null)" onclick="CircuitSimulation.selectProbe('nodeF')">
                        <circle cx="100" cy="350" r="14" class="comp-hitbox" fill="transparent" />
                        <circle cx="100" cy="350" r="4" class="circuit-node-dot" />
                        <text x="100" y="375" class="node-letter">F</text>
                    </g>

                    <!-- NODE B (x=380, y=350) - Bottom of Branch 1 -->
                    <g class="circuit-node-group" onmouseenter="CircuitSimulation.hoverProbe('nodeB')" onmouseleave="CircuitSimulation.hoverProbe(null)" onclick="CircuitSimulation.selectProbe('nodeB')">
                        <circle cx="380" cy="350" r="14" class="comp-hitbox" fill="transparent" />
                        <circle cx="380" cy="350" r="4" class="circuit-node-dot" />
                        <text x="380" y="375" class="node-letter">B</text>
                    </g>

                    <!-- NODE D (GROUND: x=500, y=350) -->
                    <g class="circuit-node-group" onmouseenter="CircuitSimulation.hoverProbe('nodeD')" onmouseleave="CircuitSimulation.hoverProbe(null)" onclick="CircuitSimulation.selectProbe('nodeD')">
                        <circle cx="500" cy="350" r="14" class="comp-hitbox" fill="transparent" />
                        <circle cx="500" cy="350" r="4" class="circuit-node-dot" />
                        <!-- Ground symbol lines -->
                        <line x1="500" y1="350" x2="500" y2="385" class="ground-stem" />
                        <line x1="485" y1="385" x2="515" y2="385" class="ground-line" />
                        <line x1="490" y1="390" x2="510" y2="390" class="ground-line" />
                        <line x1="495" y1="395" x2="505" y2="395" class="ground-line" />
                        <text x="522" y="380" class="node-letter ground-label" text-anchor="start">D (0 V)</text>
                    </g>

                    <!-- NODE E (x=620, y=350) - Bottom of Branch 2 -->
                    <g class="circuit-node-group" onmouseenter="CircuitSimulation.hoverProbe('nodeE')" onmouseleave="CircuitSimulation.hoverProbe(null)" onclick="CircuitSimulation.selectProbe('nodeE')">
                        <circle cx="620" cy="350" r="14" class="comp-hitbox" fill="transparent" />
                        <circle cx="620" cy="350" r="4" class="circuit-node-dot" />
                        <text x="620" y="375" class="node-letter">E</text>
                    </g>
                </svg>
            `;
        }

        viewport.innerHTML = svgHtml;
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
            const p1 = phys.P1;
            const p2 = phys.P2;
            const e1 = p1 * 10;
            const e2 = p2 * 10;

            detailsHtml = `
                <div class="hud-item-header">
                    <span class="hud-probe-icon">📦</span>
                    <div class="hud-item-title-wrap">
                        <h4 class="hud-item-title">Αντιστάτης <span class="math-expr"><i class="math-var">R</i><sub class="math-sub">1</sub></span> (Κόμβοι A − B)</h4>
                        <span class="hud-item-badge ${isShorted ? 'bad' : 'good'}">
                            ${isShorted ? '⚠️ Βραχυκυκλωμένος (Παρακαμφθείς)' : 'Ενεργό Στοιχείο'}
                        </span>
                    </div>
                </div>

                <!-- Row 1: V1, I1, R1 -->
                <div class="hud-readouts-grid cols-3" style="margin-bottom: 10px;">
                    <div class="hud-meter-box">
                        <span class="meter-lbl"><span>Πτώση Τάσης</span><span>(<span class="math-expr"><i class="math-var">V</i><sub class="math-sub">1</sub></span>):</span></span>
                        <span class="meter-val text-voltage">${v.toFixed(2)} V</span>
                    </div>
                    <div class="hud-meter-box">
                        <span class="meter-lbl"><span>Ένταση Ρεύματος</span><span>(<span class="math-expr"><i class="math-var">I</i><sub class="math-sub">1</sub></span>):</span></span>
                        <span class="meter-val text-current">${i.toFixed(2)} A</span>
                    </div>
                    <div class="hud-meter-box">
                        <span class="meter-lbl"><span>Αντίσταση</span><span>(<span class="math-expr"><i class="math-var">R</i><sub class="math-sub">1</sub></span>):</span></span>
                        <span class="meter-val text-resistor">${state.R1} Ω</span>
                    </div>
                </div>

                <!-- Row 2: P1, P2, E1 (t=10s), E2 (t=10s) -->
                <div class="hud-readouts-grid cols-4">
                    <div class="hud-meter-box">
                        <span class="meter-lbl"><span>Θερμική Ισχύς</span><span>(<span class="math-expr"><i class="math-var">P</i><sub class="math-sub">1</sub></span>):</span></span>
                        <span class="meter-val text-power">${p1.toFixed(2)} W</span>
                    </div>
                    <div class="hud-meter-box">
                        <span class="meter-lbl"><span>Θερμική Ισχύς</span><span>(<span class="math-expr"><i class="math-var">P</i><sub class="math-sub">2</sub></span>):</span></span>
                        <span class="meter-val text-power">${p2.toFixed(2)} W</span>
                    </div>
                    <div class="hud-meter-box">
                        <span class="meter-lbl"><span>Θερμότητα Joule</span><span>(<span class="math-expr"><i class="math-var">E</i><sub class="math-sub">1</sub></span>, <span class="math-expr"><i class="math-var">t</i> = 10s</span>):</span></span>
                        <span class="meter-val text-energy">${e1.toFixed(1)} J</span>
                    </div>
                    <div class="hud-meter-box">
                        <span class="meter-lbl"><span>Θερμότητα Joule</span><span>(<span class="math-expr"><i class="math-var">E</i><sub class="math-sub">2</sub></span>, <span class="math-expr"><i class="math-var">t</i> = 10s</span>):</span></span>
                        <span class="meter-val text-energy">${e2.toFixed(1)} J</span>
                    </div>
                </div>

                ${isSteps ? `
                    <div class="hud-steps-box" style="margin-top: 14px;">
                        <div class="hud-steps-title">📐 Αναλυτική Διαδικασία Υπολογισμού:</div>
                        ${state.topology === 'series' ? `
                            <div class="step-calc-line">
                                <div class="step-calc-header">1. Ολική Αντίσταση Σειράς:</div>
                                ${!state.switchClosed ? `
                                    <div class="step-calc-formula">$$R_{\\text{ολ}} = \\infty\\ \\Omega \\quad (\\text{Ανοικτός Διακόπτης})$$</div>
                                ` : `
                                    <div class="step-calc-formula">$$R_{\\text{ολ}} = R_1 + R_2 = ${state.shortR1 ? '0' : state.R1} + ${state.shortR2 ? '0' : state.R2} = ${phys.R_eq.toFixed(1)}\\ \\Omega$$</div>
                                `}
                            </div>
                            <div class="step-calc-line">
                                <div class="step-calc-header">2. Κοινό Ρεύμα Κυκλώματος:</div>
                                ${!state.switchClosed ? `
                                    <div class="step-calc-formula">$$I = \\frac{V_{\\text{πηγ}}}{R_{\\text{ολ}}} = \\frac{${state.V_src}\\text{ V}}{\\infty\\ \\Omega} = 0.00\\text{ A}$$</div>
                                ` : `
                                    <div class="step-calc-formula">$$I = \\frac{V_{\\text{πηγ}}}{R_{\\text{ολ}}} = \\frac{${state.V_src}\\text{ V}}{${phys.R_eq.toFixed(1)}\\ \\Omega} = ${phys.I_total.toFixed(2)}\\text{ A}$$</div>
                                `}
                            </div>
                            <div class="step-calc-line">
                                <div class="step-calc-header">3. Πτώσεις Τάσης Αντιστατών (Νόμος Ohm):</div>
                                <div class="step-calc-formula">$$V_1 = I \\cdot R_1 = ${phys.I_total.toFixed(2)}\\text{ A} \\cdot ${state.shortR1 ? 0 : state.R1}\\ \\Omega = ${phys.V1.toFixed(2)}\\text{ V}$$</div>
                                <div class="step-calc-formula">$$V_2 = I \\cdot R_2 = ${phys.I_total.toFixed(2)}\\text{ A} \\cdot ${state.shortR2 ? 0 : state.R2}\\ \\Omega = ${phys.V2.toFixed(2)}\\text{ V}$$</div>
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
                        ` : `
                            <div class="step-calc-line">
                                <div class="step-calc-header">1. Τάσεις Παράλληλων Κλάδων:</div>
                                ${!state.switchClosed ? `
                                    <div class="step-calc-formula">$$V_1 = V_2 = 0.00\\text{ V} \\quad (\\text{Ανοικτός Διακόπτης})$$</div>
                                ` : `
                                    <div class="step-calc-formula">$$V_1 = V_2 = V_{\\text{πηγ}} = ${state.V_src}\\text{ V} \\quad (V_A - V_B = V_C - V_E = ${state.V_src}\\text{ V})$$</div>
                                `}
                            </div>
                            <div class="step-calc-line">
                                <div class="step-calc-header">2. Ρεύματα Κλάδων (Νόμος Ohm):</div>
                                ${!state.switchClosed ? `
                                    <div class="step-calc-formula">$$I_1 = 0.00\\text{ A}, \\quad I_2 = 0.00\\text{ A}, \\quad I_{\\text{ολ}} = 0.00\\text{ A}$$</div>
                                ` : `
                                    <div class="step-calc-formula">$$I_1 = \\frac{V_1}{R_1} = \\frac{${phys.V1.toFixed(1)}\\text{ V}}{${state.R1}\\ \\Omega} = ${phys.I1.toFixed(2)}\\text{ A}$$</div>
                                    <div class="step-calc-formula">$$I_2 = \\frac{V_2}{R_2} = \\frac{${phys.V2.toFixed(1)}\\text{ V}}{${state.R2}\\ \\Omega} = ${phys.I2.toFixed(2)}\\text{ A}$$</div>
                                    <div class="step-calc-formula">$$I_{\\text{ολ}} = I_1 + I_2 = ${phys.I1.toFixed(2)}\\text{ A} + ${phys.I2.toFixed(2)}\\text{ A} = ${phys.I_total.toFixed(2)}\\text{ A}$$</div>
                                `}
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
                        `}
                    </div>
                ` : ''}
            `;
        } else if (probeTarget === 'R2') {
            const v = phys.V2;
            const i = phys.I2;
            const isShorted = state.shortR2;
            const p1 = phys.P1;
            const p2 = phys.P2;
            const e1 = p1 * 10;
            const e2 = p2 * 10;

            detailsHtml = `
                <div class="hud-item-header">
                    <span class="hud-probe-icon">📦</span>
                    <div class="hud-item-title-wrap">
                        <h4 class="hud-item-title">Αντιστάτης <span class="math-expr"><i class="math-var">R</i><sub class="math-sub">2</sub></span> (Κόμβοι ${state.topology === 'series' ? 'B − C' : 'C − E'})</h4>
                        <span class="hud-item-badge ${isShorted ? 'bad' : 'good'}">
                            ${isShorted ? '⚠️ Βραχυκυκλωμένος (Παρακαμφθείς)' : 'Ενεργό Στοιχείο'}
                        </span>
                    </div>
                </div>

                <!-- Row 1: V2, I2, R2 -->
                <div class="hud-readouts-grid cols-3" style="margin-bottom: 10px;">
                    <div class="hud-meter-box">
                        <span class="meter-lbl"><span>Πτώση Τάσης</span><span>(<span class="math-expr"><i class="math-var">V</i><sub class="math-sub">2</sub></span>):</span></span>
                        <span class="meter-val text-voltage">${v.toFixed(2)} V</span>
                    </div>
                    <div class="hud-meter-box">
                        <span class="meter-lbl"><span>Ένταση Ρεύματος</span><span>(<span class="math-expr"><i class="math-var">I</i><sub class="math-sub">2</sub></span>):</span></span>
                        <span class="meter-val text-current">${i.toFixed(2)} A</span>
                    </div>
                    <div class="hud-meter-box">
                        <span class="meter-lbl"><span>Αντίσταση</span><span>(<span class="math-expr"><i class="math-var">R</i><sub class="math-sub">2</sub></span>):</span></span>
                        <span class="meter-val text-resistor">${state.R2} Ω</span>
                    </div>
                </div>

                <!-- Row 2: P1, P2, E1 (t=10s), E2 (t=10s) -->
                <div class="hud-readouts-grid cols-4">
                    <div class="hud-meter-box">
                        <span class="meter-lbl"><span>Θερμική Ισχύς</span><span>(<span class="math-expr"><i class="math-var">P</i><sub class="math-sub">1</sub></span>):</span></span>
                        <span class="meter-val text-power">${p1.toFixed(2)} W</span>
                    </div>
                    <div class="hud-meter-box">
                        <span class="meter-lbl"><span>Θερμική Ισχύς</span><span>(<span class="math-expr"><i class="math-var">P</i><sub class="math-sub">2</sub></span>):</span></span>
                        <span class="meter-val text-power">${p2.toFixed(2)} W</span>
                    </div>
                    <div class="hud-meter-box">
                        <span class="meter-lbl"><span>Θερμότητα Joule</span><span>(<span class="math-expr"><i class="math-var">E</i><sub class="math-sub">1</sub></span>, <span class="math-expr"><i class="math-var">t</i> = 10s</span>):</span></span>
                        <span class="meter-val text-energy">${e1.toFixed(1)} J</span>
                    </div>
                    <div class="hud-meter-box">
                        <span class="meter-lbl"><span>Θερμότητα Joule</span><span>(<span class="math-expr"><i class="math-var">E</i><sub class="math-sub">2</sub></span>, <span class="math-expr"><i class="math-var">t</i> = 10s</span>):</span></span>
                        <span class="meter-val text-energy">${e2.toFixed(1)} J</span>
                    </div>
                </div>

                ${isSteps ? `
                    <div class="hud-steps-box" style="margin-top: 14px;">
                        <div class="hud-steps-title">📐 Αναλυτική Διαδικασία Υπολογισμού:</div>
                        ${state.topology === 'series' ? `
                            <div class="step-calc-line">
                                <div class="step-calc-header">1. Ολική Αντίσταση Σειράς:</div>
                                ${!state.switchClosed ? `
                                    <div class="step-calc-formula">$$R_{\\text{ολ}} = \\infty\\ \\Omega \\quad (\\text{Ανοικτός Διακόπτης})$$</div>
                                ` : `
                                    <div class="step-calc-formula">$$R_{\\text{ολ}} = R_1 + R_2 = ${phys.R_eq.toFixed(1)}\\ \\Omega$$</div>
                                `}
                            </div>
                            <div class="step-calc-line">
                                <div class="step-calc-header">2. Κοινό Ρεύμα Σειράς:</div>
                                ${!state.switchClosed ? `
                                    <div class="step-calc-formula">$$I = \\frac{V_{\\text{πηγ}}}{R_{\\text{ολ}}} = \\frac{${state.V_src}\\text{ V}}{\\infty\\ \\Omega} = 0.00\\text{ A}$$</div>
                                ` : `
                                    <div class="step-calc-formula">$$I = \\frac{V_{\\text{πηγ}}}{R_{\\text{ολ}}} = ${phys.I_total.toFixed(2)}\\text{ A}$$</div>
                                `}
                            </div>
                            <div class="step-calc-line">
                                <div class="step-calc-header">3. Πτώσεις Τάσης Αντιστατών (Νόμος Ohm):</div>
                                <div class="step-calc-formula">$$V_1 = I \\cdot R_1 = ${phys.I_total.toFixed(2)}\\text{ A} \\cdot ${state.shortR1 ? 0 : state.R1}\\ \\Omega = ${phys.V1.toFixed(2)}\\text{ V}$$</div>
                                <div class="step-calc-formula">$$V_2 = I \\cdot R_2 = ${phys.I_total.toFixed(2)}\\text{ A} \\cdot ${state.shortR2 ? 0 : state.R2}\\ \\Omega = ${phys.V2.toFixed(2)}\\text{ V}$$</div>
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
                        ` : `
                            <div class="step-calc-line">
                                <div class="step-calc-header">1. Τάσεις Παράλληλων Κλάδων:</div>
                                ${!state.switchClosed ? `
                                    <div class="step-calc-formula">$$V_1 = V_2 = 0.00\\text{ V} \\quad (\\text{Ανοικτός Διακόπτης})$$</div>
                                ` : `
                                    <div class="step-calc-formula">$$V_1 = V_2 = V_{\\text{πηγ}} = ${state.V_src}\\text{ V} \\quad (V_A - V_B = V_C - V_E = ${state.V_src}\\text{ V})$$</div>
                                `}
                            </div>
                            <div class="step-calc-line">
                                <div class="step-calc-header">2. Ρεύματα Κλάδων (Νόμος Ohm):</div>
                                ${!state.switchClosed ? `
                                    <div class="step-calc-formula">$$I_1 = 0.00\\text{ A}, \\quad I_2 = 0.00\\text{ A}, \\quad I_{\\text{ολ}} = 0.00\\text{ A}$$</div>
                                ` : `
                                    <div class="step-calc-formula">$$I_1 = \\frac{V_1}{R_1} = \\frac{${phys.V1.toFixed(1)}\\text{ V}}{${state.R1}\\ \\Omega} = ${phys.I1.toFixed(2)}\\text{ A}$$</div>
                                    <div class="step-calc-formula">$$I_2 = \\frac{V_2}{R_2} = \\frac{${phys.V2.toFixed(1)}\\text{ V}}{${state.R2}\\ \\Omega} = ${phys.I2.toFixed(2)}\\text{ A}$$</div>
                                    <div class="step-calc-formula">$$I_{\\text{ολ}} = I_1 + I_2 = ${phys.I1.toFixed(2)}\\text{ A} + ${phys.I2.toFixed(2)}\\text{ A} = ${phys.I_total.toFixed(2)}\\text{ A}$$</div>
                                `}
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
                        `}
                    </div>
                ` : ''}
            `;
        } else if (probeTarget === 'source') {
            detailsHtml = `
                <div class="hud-item-header">
                    <span class="hud-probe-icon">🔋</span>
                    <div class="hud-item-title-wrap">
                        <h4 class="hud-item-title">Ηλεκτρική Πηγή (DC Voltage Source)</h4>
                        <span class="hud-item-badge good">Κύρια Τροφοδοσία</span>
                    </div>
                </div>

                <div class="hud-readouts-grid">
                    <div class="hud-meter-box">
                        <span class="meter-lbl"><span>Τάση Πηγής</span><span>(<span class="math-expr"><i class="math-var">V</i><sub class="math-sub">πηγ</sub></span>):</span></span>
                        <span class="meter-val text-voltage">${state.V_src} V</span>
                    </div>
                    <div class="hud-meter-box">
                        <span class="meter-lbl"><span>Ολικό Ρεύμα</span><span>(<span class="math-expr"><i class="math-var">I</i><sub class="math-sub">ολ</sub></span>):</span></span>
                        <span class="meter-val text-current">${phys.I_total.toFixed(2)} A</span>
                    </div>
                    <div class="hud-meter-box">
                        <span class="meter-lbl"><span>Ισοδύναμη Αντίσταση</span><span>(<span class="math-expr"><i class="math-var">R</i><sub class="math-sub">ολ</sub></span>):</span></span>
                        <span class="meter-val text-resistor">${phys.R_eq === Infinity ? '∞ Ω' : `${phys.R_eq.toFixed(2)} Ω`}</span>
                    </div>
                    <div class="hud-meter-box">
                        <span class="meter-lbl"><span>Ολική Ισχύς</span><span>(<span class="math-expr"><i class="math-var">P</i><sub class="math-sub">ολ</sub></span>):</span></span>
                        <span class="meter-val text-power">${phys.P_total.toFixed(2)} W</span>
                    </div>
                </div>

                ${isSteps ? `
                    <div class="hud-steps-box">
                        <div class="hud-steps-title">📐 Επιστημονική Ανάλυση Πηγής:</div>
                        <div class="step-calc-line">
                            <div class="step-calc-header">1. Υπολογισμός $R_{\\text{ολ}}$:</div>
                            ${!state.switchClosed ? `
                                <div class="step-calc-formula">$$R_{\\text{ολ}} = \\infty\\ \\Omega \\quad (\\text{Ανοικτός Διακόπτης})$$</div>
                            ` : (state.topology === 'series' ? `
                                <div class="step-calc-formula">$$R_{\\text{ολ}} = R_1 + R_2 = ${phys.R_eq.toFixed(1)}\\ \\Omega$$</div>
                            ` : `
                                <div class="step-calc-formula">$$R_{\\text{ολ}} = \\frac{R_1 \\cdot R_2}{R_1 + R_2} = \\frac{${state.R1} \\cdot ${state.R2}}{${state.R1} + ${state.R2}} = ${phys.R_eq.toFixed(2)}\\ \\Omega$$</div>
                            `)}
                        </div>
                        <div class="step-calc-line">
                            <div class="step-calc-header">2. Ολικό Ρεύμα από τον Νόμο του Ohm:</div>
                            ${!state.switchClosed ? `
                                <div class="step-calc-formula">$$I_{\\text{ολ}} = \\frac{V_{\\text{πηγ}}}{R_{\\text{ολ}}} = \\frac{${state.V_src}\\text{ V}}{\\infty\\ \\Omega} = 0.00\\text{ A}$$</div>
                            ` : `
                                <div class="step-calc-formula">$$I_{\\text{ολ}} = \\frac{V_{\\text{πηγ}}}{R_{\\text{ολ}}} = ${phys.I_total.toFixed(2)}\\text{ A}$$</div>
                            `}
                        </div>
                        <div class="step-calc-line">
                            <div class="step-calc-header">3. Συνολική Παρεχόμενη Ισχύς:</div>
                            <div class="step-calc-formula">$$P_{\\text{ολ}} = V_{\\text{πηγ}} \\cdot I_{\\text{ολ}} = P_1 + P_2 = ${phys.P_total.toFixed(2)}\\text{ W}$$</div>
                        </div>
                    </div>
                ` : ''}
            `;
        } else if (probeTarget === 'switch') {
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
                        <span class="meter-lbl"><span>Τάση Διακόπτη</span><span>(<span class="math-expr"><i class="math-var">V</i><sub class="math-sub">διακ</sub></span>):</span></span>
                        <span class="meter-val text-voltage">${phys.V_switch.toFixed(2)} V</span>
                    </div>
                    <div class="hud-meter-box">
                        <span class="meter-lbl"><span>Ρεύμα Διακόπτη</span><span>(<span class="math-expr"><i class="math-var">I</i><sub class="math-sub">διακ</sub></span>):</span></span>
                        <span class="meter-val text-current">${phys.I_switch.toFixed(2)} A</span>
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
        } else if (probeTarget === 'ammeter') {
            detailsHtml = `
                <div class="hud-item-header">
                    <span class="hud-probe-icon">🧭</span>
                    <div class="hud-item-title-wrap">
                        <h4 class="hud-item-title">Ιδανικό Αμπερόμετρο A (Σειρά)</h4>
                        <span class="hud-item-badge good">RA = 0 Ω (Ιδανικό)</span>
                    </div>
                </div>
                <div class="hud-readouts-grid cols-2">
                    <div class="hud-meter-box">
                        <span class="meter-lbl"><span>Ένδειξη Αμπερομέτρου</span><span>(<span class="math-expr"><i class="math-var">I</i></span>):</span></span>
                        <span class="meter-val text-current">${phys.I_total.toFixed(2)} A</span>
                    </div>
                    <div class="hud-meter-box">
                        <span class="meter-lbl"><span>Πτώση Τάσης</span><span>(<span class="math-expr"><i class="math-var">V</i><sub class="math-sub">A</sub></span>):</span></span>
                        <span class="meter-val text-voltage">0.00 V</span>
                    </div>
                </div>
                ${isSteps ? `
                    <div class="hud-steps-box">
                        <div class="hud-steps-title">💡 Χαρακτηριστικό Ιδανικού Αμπερομέτρου (Ερώτηση 17):</div>
                        <p style="font-size: 0.88rem; line-height: 1.5;">
                            Το αμπερόμετρο συνδέεται πάντοτε <strong>στη σειρά</strong> και διαθέτει μηδενική εσωτερική αντίσταση ($R_A = 0\ \Omega$) ώστε να μετράει το ρεύμα χωρίς να προκαλεί καμία πτώση τάσης και χωρίς να μεταβάλλει τη ροή του κυκλώματος.
                        </p>
                    </div>
                ` : ''}
            `;
        } else if (probeTarget.startsWith('node')) {
            const nodeKey = probeTarget.replace('node', '');
            const pot = phys['V' + nodeKey] !== undefined ? phys['V' + nodeKey] : 0;
            let nodeCurrent = 0;
            if (state.switchClosed && phys.status !== 'total_short') {
                if (state.topology === 'series') {
                    nodeCurrent = phys.I_total;
                } else {
                    nodeCurrent = (nodeKey === 'C' || nodeKey === 'E' || nodeKey === 'D') ? phys.I2 : phys.I_total;
                }
            }
            detailsHtml = `
                <div class="hud-item-header">
                    <span class="hud-probe-icon">📍</span>
                    <div class="hud-item-title-wrap">
                        <h4 class="hud-item-title">Κόμβος ${nodeKey} Κυκλώματος</h4>
                        <span class="hud-item-badge good">Σημείο Αναφοράς / Μέτρησης</span>
                    </div>
                </div>
                <div class="hud-readouts-grid cols-2">
                    <div class="hud-meter-box">
                        <span class="meter-lbl"><span>Ένταση Ρεύματος</span><span>(<span class="math-expr"><i class="math-var">I</i></span>):</span></span>
                        <span class="meter-val text-current">${nodeCurrent.toFixed(2)} A</span>
                    </div>
                    <div class="hud-meter-box">
                        <span class="meter-lbl"><span>Ηλεκτρικό Δυναμικό</span><span>(<span class="math-expr"><i class="math-var">V</i><sub class="math-sub">${nodeKey}</sub></span>):</span></span>
                        <span class="meter-val text-voltage">${pot.toFixed(2)} V</span>
                    </div>
                </div>
                ${isSteps ? `
                    <div class="hud-steps-box">
                        <div class="hud-steps-title">💡 Ανάλυση Ρεύματος & Ηλεκτρικού Δυναμικού (Κόμβος ${nodeKey}):</div>
                        <p style="font-size: 0.88rem; line-height: 1.5; margin: 0;">
                            ${nodeKey === 'G' ? (state.topology === 'series' ? `
                                <strong>1. Ένταση Ρεύματος:</strong> Στον κόμβο G (πάνω από την πηγή) διέρχεται το ολικό ρεύμα του κυκλώματος $I = ${nodeCurrent.toFixed(2)}\\text{ A}$.<br>
                                <strong>2. Ηλεκτρικό Δυναμικό:</strong> Βρίσκεται απευθείας συνδεδεμένος με τον θετικό (+) πόλο της ηλεκτρικής πηγής μέσω ιδανικού αγωγού, άρα $V_G = V_{\\text{πηγ}} = ${phys.V_src}\\text{ V}$ (ακόμη και με ανοικτό διακόπτη).
                            ` : `
                                <strong>1. Ένταση Ρεύματος:</strong> Στον κόμβο G πάνω από την πηγή διέρχεται το ολικό ρεύμα $I_{\\text{ολ}} = I_1 + I_2 = ${nodeCurrent.toFixed(2)}\\text{ A}$.<br>
                                <strong>2. Ηλεκτρικό Δυναμικό:</strong> Συνδέεται απευθείας με τον θετικό (+) πόλο της πηγής, άρα $V_G = V_{\\text{πηγ}} = ${phys.V_src}\\text{ V}$ (σταθερό δυναμικό αναφοράς).
                            `) : ''}
                            ${nodeKey === 'A' ? (state.topology === 'series' ? `
                                <strong>1. Ένταση Ρεύματος:</strong> Στον κόμβο A διέρχεται το ολικό ρεύμα του κυκλώματος $I = ${nodeCurrent.toFixed(2)}\\text{ A}$.<br>
                                <strong>2. Ηλεκτρικό Δυναμικό:</strong> Συνδέεται μετά τον διακόπτη και το αμπερόμετρο. Όταν ο διακόπτης είναι κλειστός, $V_A = V_{\\text{πηγ}} = ${phys.V_src}\\text{ V}$ (ως προς τη γείωση $D$).
                            ` : `
                                <strong>1. Ένταση Ρεύματος:</strong> Στον κόμβο διακλάδωσης A φτάνει το ολικό ρεύμα $I_{\\text{ολ}} = ${nodeCurrent.toFixed(2)}\\text{ A}$. Εκεί διακλαδίζεται στο ρεύμα $I_1 = ${phys.I1.toFixed(2)}\\text{ A}$ (κάθετος κλάδος $R_1$) και στο ρεύμα $I_2 = ${phys.I2.toFixed(2)}\\text{ A}$ (συνέχεια προς κόμβο C) σύμφωνα με τον 1ο Κανόνα Kirchhoff ($I_{\\text{ολ}} = I_1 + I_2$).<br>
                                <strong>2. Ηλεκτρικό Δυναμικό:</strong> Συνδέεται μετά τον διακόπτη με τον θετικό πόλο της πηγής, άρα με κλειστό διακόπτη $V_A = V_{\\text{πηγ}} = ${phys.V_src}\\text{ V}$.
                            `) : ''}
                            ${nodeKey === 'B' ? (state.topology === 'series' ? `
                                <strong>1. Ένταση Ρεύματος:</strong> Στον ενδιάμεσο κόμβο B διέρχεται το κοινό ρεύμα σειράς $I = ${nodeCurrent.toFixed(2)}\\text{ A}$.<br>
                                <strong>2. Ηλεκτρικό Δυναμικό:</strong> Βρίσκεται μεταξύ $R_1$ και $R_2$. Η πτώση τάσης στον $R_2$ ως προς τη γείωση δίνει δυναμικό $V_B = V_2 = ${phys.VB.toFixed(2)}\\text{ V}$.
                            ` : `
                                <strong>1. Ένταση Ρεύματος:</strong> Ο κόμβος B είναι ο κόμβος συμβολής των δύο κλάδων: το ρεύμα $I_1 = ${phys.I1.toFixed(2)}\\text{ A}$ (από $R_1$) ενώνεται με το ρεύμα $I_2 = ${phys.I2.toFixed(2)}\\text{ A}$ (από $R_2$) ανασυστήνοντας το ολικό ρεύμα επιστροφής $I_{\\text{ολ}} = ${nodeCurrent.toFixed(2)}\\text{ A}$ ($I = I_1 + I_2$).<br>
                                <strong>2. Ηλεκτρικό Δυναμικό:</strong> Συνδέεται με τη γείωση D μέσω ιδανικού αγωγού ($R = 0\\ \\Omega$), άρα $V_B = 0\\text{ V}$.
                            `) : ''}
                            ${nodeKey === 'C' ? (state.topology === 'series' ? `
                                <strong>1. Ένταση Ρεύματος:</strong> Ο κόμβος C διαρρέεται από το ρεύμα $I = ${nodeCurrent.toFixed(2)}\\text{ A}$.<br>
                                <strong>2. Ηλεκτρικό Δυναμικό:</strong> Συνδέεται με τη γείωση D μέσω ιδανικού αγωγού ($R = 0\\ \\Omega$), άρα $V_C = V_D = 0\\text{ V}$.
                            ` : `
                                <strong>1. Ένταση Ρεύματος:</strong> Στον πάνω κόμβο C του δεύτερου κλάδου εισέρχεται το ρεύμα $I_2 = ${nodeCurrent.toFixed(2)}\\text{ A}$ που κατέρχεται μέσω του αντιστάτη $R_2$.<br>
                                <strong>2. Ηλεκτρικό Δυναμικό:</strong> Συνδέεται με τον κόμβο A μέσω ιδανικού αγωγού ($R = 0\\ \\Omega$), συνεπώς $V_C = V_A = ${phys.VC.toFixed(2)}\\text{ V}$.
                            `) : ''}
                            ${nodeKey === 'D' ? (state.topology === 'series' ? `
                                <strong>1. Ένταση Ρεύματος:</strong> Το ρεύμα που διέρχεται από τον αγωγό στο σημείο D είναι $I = ${nodeCurrent.toFixed(2)}\\text{ A}$ (στη γραμμή γείωσης δεν διαφεύγει ρεύμα).<br>
                                <strong>2. Ηλεκτρικό Δυναμικό:</strong> Το σημείο D αποτελεί τη γείωση αναφοράς του κυκλώματος ($V_D = 0\\text{ V}$).
                            ` : `
                                <strong>1. Ένταση Ρεύματος:</strong> Στον κάτω αγωγό στο σημείο D διέρχεται το ρεύμα επιστροφής του δεύτερου κλάδου $I_2 = ${nodeCurrent.toFixed(2)}\\text{ A}$ καθοδόν προς τον κόμβο B. Στη γραμμή γείωσης δεν διαφεύγει ρεύμα.<br>
                                <strong>2. Ηλεκτρικό Δυναμικό:</strong> Το σημείο D αποτελεί τη γείωση αναφοράς του κυκλώματος ($V_D = 0\\text{ V}$).
                            `) : ''}
                            ${nodeKey === 'E' ? (state.topology === 'series' ? `
                                <strong>1. Ένταση Ρεύματος:</strong> Στον κόμβο E του κάτω αγωγού διέρχεται το ρεύμα επιστροφής $I = ${nodeCurrent.toFixed(2)}\\text{ A}$.<br>
                                <strong>2. Ηλεκτρικό Δυναμικό:</strong> Βρίσκεται δεξιά της γείωσης D πάνω στον ιδανικό αγωγό ($R = 0\\ \\Omega$), συνεπώς $V_E = V_D = 0\\text{ V}$.
                            ` : `
                                <strong>1. Ένταση Ρεύματος:</strong> Στον κάτω κόμβο E του δεύτερου κλάδου εξέρχεται το ρεύμα $I_2 = ${nodeCurrent.toFixed(2)}\\text{ A}$ από τον αντιστάτη $R_2$ και ρέει αριστερά προς τη γείωση D και τον κόμβο B.<br>
                                <strong>2. Ηλεκτρικό Δυναμικό:</strong> Συνδέεται με τη γείωση D μέσω ιδανικού αγωγού ($R = 0\\ \\Omega$), συνεπώς $V_E = 0\\text{ V}$.
                            `) : ''}
                            ${nodeKey === 'F' ? (state.topology === 'series' ? `
                                <strong>1. Ένταση Ρεύματος:</strong> Στον κόμβο F του κάτω αγωγού διέρχεται το ρεύμα επιστροφής $I = ${nodeCurrent.toFixed(2)}\\text{ A}$ προς τον αρνητικό πόλο.<br>
                                <strong>2. Ηλεκτρικό Δυναμικό:</strong> Βρίσκεται αριστερά της γείωσης D πάνω στον ιδανικό αγωγό ($R = 0\\ \\Omega$), συνεπώς $V_F = V_D = 0\\text{ V}$.
                            ` : `
                                <strong>1. Ένταση Ρεύματος:</strong> Στον κόμβο F (κάτω από την πηγή) διέρχεται το ολικό ρεύμα επιστροφής $I_{\\text{ολ}} = ${nodeCurrent.toFixed(2)}\\text{ A}$ που εισέρχεται στον αρνητικό πόλο (−) της πηγής.<br>
                                <strong>2. Ηλεκτρικό Δυναμικό:</strong> Συνδέεται απευθείας με τον κόμβο B και τη γείωση D μέσω ιδανικού αγωγού, άρα $V_F = 0\\text{ V}$.
                            `) : ''}
                        </p>
                    </div>
                ` : ''}
            `;
        } else {
            // General Wire / Node / Branch hover
            const isBranch1 = probeTarget === 'branch1';
            const isBranch2 = probeTarget === 'branch2';
            const wireI = isBranch1 ? phys.I1 : (isBranch2 ? phys.I2 : phys.I_total);

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
                        <span class="meter-lbl"><span>Ένταση Ρεύματος</span><span>(<span class="math-expr"><i class="math-var">I</i></span>):</span></span>
                        <span class="meter-val text-current">${wireI.toFixed(2)} A</span>
                    </div>
                    <div class="hud-meter-box">
                        <span class="meter-lbl"><span>Πτώση Τάσης Καλωδίου</span><span>(ΔV):</span></span>
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

        let metricsHtml = `
            <div class="sim-metric-cell">
                <span class="metric-label">Τάση Πηγής (<span class="math-expr"><i class="math-var">V</i><sub class="math-sub">πηγ</sub></span>)</span>
                <span class="metric-value text-voltage">${state.V_src} V</span>
            </div>
            <div class="sim-metric-cell">
                <span class="metric-label">Ισοδύναμη (<span class="math-expr"><i class="math-var">R</i><sub class="math-sub">ολ</sub></span>)</span>
                <span class="metric-value text-resistor">${phys.R_eq === Infinity ? '∞' : `${phys.R_eq.toFixed(1)} Ω`}</span>
            </div>
            <div class="sim-metric-cell">
                <span class="metric-label">Ολικό Ρεύμα (<span class="math-expr"><i class="math-var">I</i><sub class="math-sub">ολ</sub></span>)</span>
                <span class="metric-value text-current">${phys.I_total.toFixed(2)} A</span>
            </div>
            <div class="sim-metric-cell">
                <span class="metric-label">Ολική Ισχύς (<span class="math-expr"><i class="math-var">P</i><sub class="math-sub">ολ</sub></span>)</span>
                <span class="metric-value text-power">${phys.P_total.toFixed(1)} W</span>
            </div>
            <div class="sim-metric-cell">
                <span class="metric-label">Τάση <span class="math-expr"><i class="math-var">V</i><sub class="math-sub">1</sub></span> / Ρεύμα <span class="math-expr"><i class="math-var">I</i><sub class="math-sub">1</sub></span></span>
                <span class="metric-value" style="font-size: 0.95rem;">${phys.V1.toFixed(1)} V / ${phys.I1.toFixed(2)} A</span>
            </div>
            <div class="sim-metric-cell">
                <span class="metric-label">Τάση <span class="math-expr"><i class="math-var">V</i><sub class="math-sub">2</sub></span> / Ρεύμα <span class="math-expr"><i class="math-var">I</i><sub class="math-sub">2</sub></span></span>
                <span class="metric-value" style="font-size: 0.95rem;">${phys.V2.toFixed(1)} V / ${phys.I2.toFixed(2)} A</span>
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
     * Public API methods
     */
    return {
        render: render,

        setTopology: function(topo) {
            state.topology = topo;
            // Uncheck parallel short if switching to parallel to avoid immediate total short
            if (topo === 'parallel') {
                state.shortR1 = false;
                state.shortR2 = false;
            }
            if (state.containerEl) render(state.containerEl);
        },

        setParam: function(key, val) {
            state[key] = parseFloat(val);
            const disp = document.getElementById(key === 'V_src' ? 'disp-vsrc' : (key === 'R1' ? 'disp-r1' : 'disp-r2'));
            if (disp) disp.innerText = `${state[key]} ${key === 'V_src' ? 'V' : 'Ω'}`;
            updateSvg();
            updateHud();
            updateMetrics();
        },

        adjustParam: function(key, delta) {
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
            state[key] = checked;
            updateSvg();
            updateHud();
            updateMetrics();
            if (checked) {
                if (state.topology === 'parallel') {
                    showToast('⚠️ Προσοχή: Βραχυκύκλωση κλάδου σε παράλληλη σύνδεση προκαλεί ολικό βραχυκύκλωμα της πηγής!');
                } else {
                    showToast('⚡ Μερικό βραχυκύκλωμα: Ο αντιστάτης παρακάμφθηκε, η ολική αντίσταση μειώθηκε!');
                }
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
            const p = PRESETS[presetKey];
            if (!p) return;
            state.topology = p.topology;
            state.V_src = p.V_src;
            state.R1 = p.R1;
            state.R2 = p.R2;
            state.switchClosed = p.switchClosed;
            state.shortR1 = p.shortR1;
            state.shortR2 = p.shortR2;
            state.activeProbe = 'R1';

            if (state.containerEl) render(state.containerEl);
            showToast(`🎯 Φορτώθηκε: ${p.name}`);
        }
    };
})();
