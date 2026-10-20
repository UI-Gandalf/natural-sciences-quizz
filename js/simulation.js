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
            res.VB = res.V2;
            res.VA = res.VB + res.V1; // = V_src
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
            res.VC = 0;
            res.VB = 0;
            res.VA = V_src;
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
                                    🔍 <em>Περάστε το ποντίκι πάνω από στοιχεία ή καλώδια για μέτρηση</em>
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
                        <path d="M 620 350 L 520 350" marker-end="url(#current-arrow)" class="flow-arrow-path" />
                        <path d="M 280 350 L 180 350" marker-end="url(#current-arrow)" class="flow-arrow-path" />
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
                    <g class="circuit-node-group" onmouseenter="CircuitSimulation.hoverProbe('nodeA')" onmouseleave="CircuitSimulation.hoverProbe(null)">
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
                        <text x="460" y="55" class="comp-resistor-top" text-anchor="middle"><tspan font-style="italic">R</tspan><tspan font-size="0.75em" dy="3">1</tspan><tspan dy="-3"> = ${state.R1} Ω</tspan></text>
                        <!-- Resistor Box -->
                        <rect x="415" y="68" width="90" height="24" rx="4" class="resistor-body ${state.shortR1 ? 'shorted' : ''}" />
                        <text x="460" y="80" class="resistor-inner-text"><tspan font-style="italic">R</tspan><tspan font-size="0.75em" dy="3">1</tspan></text>
                        <!-- Voltage drop value below resistor (LaTeX style) -->
                        <text x="460" y="118" class="comp-resistor-bottom" text-anchor="middle">${state.shortR1 ? '<tspan font-style="italic">V</tspan><tspan font-size="0.75em" dy="3">1</tspan><tspan dy="-3"> = 0.0 V (0 Ω)</tspan>' : `<tspan font-style="italic">V</tspan><tspan font-size="0.75em" dy="3">1</tspan><tspan dy="-3"> = ${phys.V1.toFixed(1)} V</tspan>`}</text>

                        <!-- Bypass Wire if shorted -->
                        ${state.shortR1 ? `
                            <path d="M 380 80 C 420 25, 500 25, 540 80" class="short-circuit-bypass-wire" />
                            <text x="460" y="22" class="short-wire-label">⚠️ Καλώδιο Βραχυκύκλωσης</text>
                        ` : ''}
                    </g>

                    <!-- NODE B (x=540, y=80) -->
                    <g class="circuit-node-group" onmouseenter="CircuitSimulation.hoverProbe('nodeB')" onmouseleave="CircuitSimulation.hoverProbe(null)">
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
                        <text x="620" y="55" class="comp-resistor-top" text-anchor="middle"><tspan font-style="italic">R</tspan><tspan font-size="0.75em" dy="3">2</tspan><tspan dy="-3"> = ${state.R2} Ω</tspan></text>
                        <!-- Resistor Box -->
                        <rect x="575" y="68" width="90" height="24" rx="4" class="resistor-body ${state.shortR2 ? 'shorted' : ''}" />
                        <text x="620" y="80" class="resistor-inner-text"><tspan font-style="italic">R</tspan><tspan font-size="0.75em" dy="3">2</tspan></text>
                        <!-- Voltage drop value below resistor (LaTeX style) -->
                        <text x="620" y="118" class="comp-resistor-bottom" text-anchor="middle">${state.shortR2 ? '<tspan font-style="italic">V</tspan><tspan font-size="0.75em" dy="3">2</tspan><tspan dy="-3"> = 0.0 V (0 Ω)</tspan>' : `<tspan font-style="italic">V</tspan><tspan font-size="0.75em" dy="3">2</tspan><tspan dy="-3"> = ${phys.V2.toFixed(1)} V</tspan>`}</text>

                        <!-- Bypass Wire if shorted -->
                        ${state.shortR2 ? `
                            <path d="M 540 80 C 580 25, 660 25, 700 80" class="short-circuit-bypass-wire" />
                            <text x="620" y="22" class="short-wire-label">⚠️ Καλώδιο Βραχυκύκλωσης</text>
                        ` : ''}
                    </g>

                    <!-- NODE C (x=700, y=80) -->
                    <g class="circuit-node-group" onmouseenter="CircuitSimulation.hoverProbe('nodeC')" onmouseleave="CircuitSimulation.hoverProbe(null)">
                        <circle cx="700" cy="80" r="4" class="circuit-node-dot" />
                        <text x="700" y="65" class="node-letter">C</text>
                    </g>

                    <!-- NODE D (GROUND) at Bottom (x=420, y=350) -->
                    <g class="circuit-node-group" onmouseenter="CircuitSimulation.hoverProbe('nodeD')" onmouseleave="CircuitSimulation.hoverProbe(null)">
                        <circle cx="420" cy="350" r="4" class="circuit-node-dot" />
                        <!-- Ground symbol lines -->
                        <line x1="420" y1="350" x2="420" y2="385" class="ground-stem" />
                        <line x1="405" y1="385" x2="435" y2="385" class="ground-line" />
                        <line x1="410" y1="390" x2="430" y2="390" class="ground-line" />
                        <line x1="415" y1="395" x2="425" y2="395" class="ground-line" />
                        <!-- Ground label moved to the right for clear visibility -->
                        <text x="442" y="380" class="node-letter ground-label" text-anchor="start">D (0 V)</text>
                    </g>

                    <!-- Wire Probe Zones -->
                    <g class="wire-probe-zone" onmouseenter="CircuitSimulation.hoverProbe('wireMain')" onmouseleave="CircuitSimulation.hoverProbe(null)">
                        <rect x="735" y="130" width="30" height="150" class="probe-wire-hitbox" />
                        <rect x="200" y="335" width="200" height="30" class="probe-wire-hitbox" />
                    </g>
                </svg>
            `;
        } else {
            // PARALLEL CIRCUIT SVG (Σχήμα 2)
            svgHtml = `
                <svg viewBox="0 0 840 430" class="sim-svg-circuit" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <marker id="current-arrow-par" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#38bdf8" />
                        </marker>
                    </defs>

                    <!-- Main Outer Circuit Frame (Left Battery to Nodes A & B) -->
                    <!-- Top wire from battery to Node A (x=360, y=90) -->
                    <path d="M 90 215 L 90 90 L 360 90" class="circuit-wire-base" />
                    <!-- Bottom return wire from Node D (x=660, y=350) to battery (x=90, y=350) -->
                    <path d="M 660 90 L 660 350 L 90 350 L 90 235" class="circuit-wire-base" />

                    <!-- Branch 1 (Top): from Node A (360, 90) across R1 to Node B (660, 90) -->
                    <line x1="360" y1="90" x2="660" y2="90" class="circuit-wire-base" />

                    <!-- Branch 2 (Bottom): drops from A (360, 90) down to (360, 220) across R2 to (660, 220) up to B (660, 90) -->
                    <path d="M 360 90 L 360 220 L 660 220 L 660 90" class="circuit-wire-base" />

                    <!-- Animated Current Overlays -->
                    <!-- Main supply current Itotal -->
                    <path d="M 90 215 L 90 90 L 360 90" class="circuit-wire-current ${currentLineClass}" style="animation-duration: ${animSpeed}s;" />
                    <path d="M 660 90 L 660 350 L 90 350 L 90 235" class="circuit-wire-current ${currentLineClass}" style="animation-duration: ${animSpeed}s;" />

                    <!-- Branch 1 current I1 -->
                    <line x1="360" y1="90" x2="660" y2="90" class="circuit-wire-current ${currentLineClass}" 
                          style="animation-duration: ${hasCurrent ? (3 / Math.max(0.2, phys.I1)).toFixed(2) : 0}s;" />

                    <!-- Branch 2 current I2 -->
                    <path d="M 360 90 L 360 220 L 660 220 L 660 90" class="circuit-wire-current ${currentLineClass}" 
                          style="animation-duration: ${hasCurrent ? (3 / Math.max(0.2, phys.I2)).toFixed(2) : 0}s;" />

                    <!-- Conventional Flow Directional Arrows (Parallel) -->
                    ${hasCurrent ? `
                        <path d="M 90 180 L 90 120" marker-end="url(#current-arrow-par)" class="flow-arrow-path" />
                        <path d="M 230 90 L 290 90" marker-end="url(#current-arrow-par)" class="flow-arrow-path" />
                        <path d="M 390 90 L 440 90" marker-end="url(#current-arrow-par)" class="flow-arrow-path" />
                        <path d="M 390 220 L 440 220" marker-end="url(#current-arrow-par)" class="flow-arrow-path" />
                        <path d="M 660 140 L 660 190" marker-end="url(#current-arrow-par)" class="flow-arrow-path" />
                        <path d="M 660 280 L 660 320" marker-end="url(#current-arrow-par)" class="flow-arrow-path" />
                        <path d="M 400 350 L 300 350" marker-end="url(#current-arrow-par)" class="flow-arrow-path" />
                    ` : ''}

                    <!-- 1. DC SOURCE at Left -->
                    <g class="comp-interactive comp-source" data-probe="source"
                       onmouseenter="CircuitSimulation.hoverProbe('source')" 
                       onmouseleave="CircuitSimulation.hoverProbe(null)"
                       onclick="CircuitSimulation.selectProbe('source')">
                        <rect x="50" y="160" width="80" height="110" class="comp-hitbox" />
                        <line x1="68" y1="200" x2="112" y2="200" class="battery-plate positive" />
                        <line x1="78" y1="230" x2="102" y2="230" class="battery-plate negative" />
                        <text x="122" y="196" class="comp-label bold text-positive">+</text>
                        <text x="122" y="235" class="comp-label bold text-negative">−</text>
                        <text x="44" y="218" class="comp-value-tag"><tspan font-style="italic">V</tspan><tspan font-size="0.75em" dy="3">πηγ</tspan><tspan dy="-3"> = ${state.V_src} V</tspan></text>
                    </g>

                    <!-- 2. SWITCH K on Main Wire -->
                    <g class="comp-interactive comp-switch" data-probe="switch"
                       onmouseenter="CircuitSimulation.hoverProbe('switch')" 
                       onmouseleave="CircuitSimulation.hoverProbe(null)"
                       onclick="CircuitSimulation.toggleSwitch()">
                        <rect x="155" y="55" width="90" height="70" class="comp-hitbox" />
                        <circle cx="170" cy="90" r="4.5" class="terminal-dot" />
                        <circle cx="230" cy="90" r="4.5" class="terminal-dot" />
                        ${isClosed ? `
                            <line x1="170" y1="90" x2="230" y2="90" class="switch-blade closed" />
                        ` : `
                            <line x1="170" y1="90" x2="220" y2="62" class="switch-blade open" />
                        `}
                        <text x="200" y="50" class="comp-title-tag">Διακόπτης K (${isClosed ? 'Κλειστός' : 'Ανοικτός'})</text>
                    </g>

                    <!-- NODE A (Main Distribution Node) -->
                    <g class="circuit-node-group" onmouseenter="CircuitSimulation.hoverProbe('nodeA')" onmouseleave="CircuitSimulation.hoverProbe(null)">
                        <circle cx="360" cy="90" r="5" class="circuit-node-dot" />
                        <text x="360" y="72" class="node-letter">A (Κόμβος Διακλάδωσης)</text>
                    </g>

                    <!-- 3. RESISTOR R1 (Top Parallel Branch) -->
                    <g class="comp-interactive comp-resistor ${state.shortR1 ? 'is-shorted' : ''}" data-probe="R1"
                       onmouseenter="CircuitSimulation.hoverProbe('R1')" 
                       onmouseleave="CircuitSimulation.hoverProbe(null)"
                       onclick="CircuitSimulation.selectProbe('R1')">
                        <rect x="440" y="55" width="130" height="70" class="comp-hitbox" />
                        <rect x="460" y="78" width="90" height="24" rx="4" class="resistor-body ${state.shortR1 ? 'shorted' : ''}" />
                        <text x="505" y="94" class="resistor-inner-text"><tspan font-style="italic">R</tspan><tspan font-size="0.75em" dy="3">1</tspan></text>
                        <text x="505" y="126" class="comp-value-tag">${state.R1} Ω (<tspan font-style="italic">I</tspan><tspan font-size="0.75em" dy="2">1</tspan><tspan dy="-2"> = ${phys.I1.toFixed(2)} A</tspan>)</text>

                        ${state.shortR1 ? `
                            <path d="M 360 90 C 440 30, 580 30, 660 90" class="short-circuit-bypass-wire" />
                            <text x="510" y="26" class="short-wire-label">⚠️ Βραχυκύκλωμα Κλάδου 1</text>
                        ` : ''}
                    </g>

                    <!-- 4. RESISTOR R2 (Bottom Parallel Branch) -->
                    <g class="comp-interactive comp-resistor ${state.shortR2 ? 'is-shorted' : ''}" data-probe="R2"
                       onmouseenter="CircuitSimulation.hoverProbe('R2')" 
                       onmouseleave="CircuitSimulation.hoverProbe(null)"
                       onclick="CircuitSimulation.selectProbe('R2')">
                        <rect x="440" y="185" width="130" height="70" class="comp-hitbox" />
                        <rect x="460" y="208" width="90" height="24" rx="4" class="resistor-body ${state.shortR2 ? 'shorted' : ''}" />
                        <text x="505" y="224" class="resistor-inner-text"><tspan font-style="italic">R</tspan><tspan font-size="0.75em" dy="3">2</tspan></text>
                        <text x="505" y="256" class="comp-value-tag">${state.R2} Ω (<tspan font-style="italic">I</tspan><tspan font-size="0.75em" dy="2">2</tspan><tspan dy="-2"> = ${phys.I2.toFixed(2)} A</tspan>)</text>

                        ${state.shortR2 ? `
                            <path d="M 360 220 C 440 160, 580 160, 660 220" class="short-circuit-bypass-wire" />
                            <text x="510" y="156" class="short-wire-label">⚠️ Βραχυκύκλωμα Κλάδου 2</text>
                        ` : ''}
                    </g>

                    <!-- NODE B (Reunion Node) -->
                    <g class="circuit-node-group" onmouseenter="CircuitSimulation.hoverProbe('nodeB')" onmouseleave="CircuitSimulation.hoverProbe(null)">
                        <circle cx="660" cy="90" r="5" class="circuit-node-dot" />
                        <text x="660" y="72" class="node-letter">B (Κόμβος Συμβολής)</text>
                    </g>

                    <!-- NODE D (GROUND) -->
                    <g class="circuit-node-group" onmouseenter="CircuitSimulation.hoverProbe('nodeD')" onmouseleave="CircuitSimulation.hoverProbe(null)">
                        <circle cx="420" cy="350" r="4" class="circuit-node-dot" />
                        <line x1="420" y1="350" x2="420" y2="385" class="ground-stem" />
                        <line x1="405" y1="385" x2="435" y2="385" class="ground-line" />
                        <line x1="410" y1="390" x2="430" y2="390" class="ground-line" />
                        <text x="442" y="380" class="node-letter ground-label" text-anchor="start">D (0 V)</text>
                    </g>

                    <!-- Branch Probe Zones -->
                    <g class="wire-probe-zone" onmouseenter="CircuitSimulation.hoverProbe('branch1')" onmouseleave="CircuitSimulation.hoverProbe(null)">
                        <rect x="580" y="75" width="60" height="30" class="probe-wire-hitbox" />
                    </g>
                    <g class="wire-probe-zone" onmouseenter="CircuitSimulation.hoverProbe('branch2')" onmouseleave="CircuitSimulation.hoverProbe(null)">
                        <rect x="580" y="205" width="60" height="30" class="probe-wire-hitbox" />
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
            const p = phys.P1;
            const isShorted = state.shortR1;

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

                <div class="hud-readouts-grid">
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
                    <div class="hud-meter-box">
                        <span class="meter-lbl"><span>Θερμική Ισχύς</span><span>(<span class="math-expr"><i class="math-var">P</i><sub class="math-sub">1</sub></span>):</span></span>
                        <span class="meter-val text-power">${p.toFixed(2)} W</span>
                    </div>
                </div>

                ${isSteps ? `
                    <div class="hud-steps-box">
                        <div class="hud-steps-title">📐 Αναλυτική Διαδικασία Υπολογισμού:</div>
                        ${state.topology === 'series' ? `
                            <div class="step-calc-line">
                                <div class="step-calc-header">1. Ολική Αντίσταση Σειράς:</div>
                                <div class="step-calc-formula">$$R_{\\text{ολ}} = R_1 + R_2 = ${state.shortR1 ? '0' : state.R1} + ${state.shortR2 ? '0' : state.R2} = ${phys.R_eq.toFixed(1)}\\ \\Omega$$</div>
                            </div>
                            <div class="step-calc-line">
                                <div class="step-calc-header">2. Κοινό Ρεύμα Κυκλώματος:</div>
                                <div class="step-calc-formula">$$I = \\frac{V_{\\text{πηγ}}}{R_{\\text{ολ}}} = \\frac{${state.V_src}\\text{ V}}{${phys.R_eq.toFixed(1)}\\ \\Omega} = ${phys.I_total.toFixed(2)}\\text{ A}$$</div>
                            </div>
                            <div class="step-calc-line">
                                <div class="step-calc-header">3. Νόμος του Ohm για τον $R_1$:</div>
                                <div class="step-calc-formula">$$V_1 = I \\cdot R_1 = ${i.toFixed(2)}\\text{ A} \\cdot ${isShorted ? 0 : state.R1}\\ \\Omega = ${v.toFixed(2)}\\text{ V}$$</div>
                            </div>
                            <div class="step-calc-line">
                                <div class="step-calc-header">4. Ισχύς Κατανάλωσης (Joule):</div>
                                <div class="step-calc-formula">$$P_1 = V_1 \\cdot I_1 = ${v.toFixed(2)}\\text{ V} \\cdot ${i.toFixed(2)}\\text{ A} = ${p.toFixed(2)}\\text{ W}$$</div>
                            </div>
                        ` : `
                            <div class="step-calc-line">
                                <div class="step-calc-header">1. Τάση Κλάδου (Παράλληλη σύνδεση):</div>
                                <div class="step-calc-formula">$$V_1 = V_{\\text{πηγ}} = ${state.V_src}\\text{ V}$$</div>
                            </div>
                            <div class="step-calc-line">
                                <div class="step-calc-header">2. Ρεύμα Κλάδου $R_1$ (Νόμος Ohm):</div>
                                <div class="step-calc-formula">$$I_1 = \\frac{V_1}{R_1} = \\frac{${state.V_src}\\text{ V}}{${state.R1}\\ \\Omega} = ${i.toFixed(2)}\\text{ A}$$</div>
                            </div>
                            <div class="step-calc-line">
                                <div class="step-calc-header">3. Ισχύς Κατανάλωσης Κλάδου 1:</div>
                                <div class="step-calc-formula">$$P_1 = \\frac{V_1^2}{R_1} = \\frac{(${state.V_src})^2}{${state.R1}} = ${p.toFixed(2)}\\text{ W}$$</div>
                            </div>
                        `}
                    </div>
                ` : ''}
            `;
        } else if (probeTarget === 'R2') {
            const v = phys.V2;
            const i = phys.I2;
            const p = phys.P2;
            const isShorted = state.shortR2;

            detailsHtml = `
                <div class="hud-item-header">
                    <span class="hud-probe-icon">📦</span>
                    <div class="hud-item-title-wrap">
                        <h4 class="hud-item-title">Αντιστάτης <span class="math-expr"><i class="math-var">R</i><sub class="math-sub">2</sub></span> (Κόμβοι B − C)</h4>
                        <span class="hud-item-badge ${isShorted ? 'bad' : 'good'}">
                            ${isShorted ? '⚠️ Βραχυκυκλωμένος (Παρακαμφθείς)' : 'Ενεργό Στοιχείο'}
                        </span>
                    </div>
                </div>

                <div class="hud-readouts-grid">
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
                    <div class="hud-meter-box">
                        <span class="meter-lbl"><span>Θερμική Ισχύς</span><span>(<span class="math-expr"><i class="math-var">P</i><sub class="math-sub">2</sub></span>):</span></span>
                        <span class="meter-val text-power">${p.toFixed(2)} W</span>
                    </div>
                </div>

                ${isSteps ? `
                    <div class="hud-steps-box">
                        <div class="hud-steps-title">📐 Αναλυτική Διαδικασία Υπολογισμού:</div>
                        ${state.topology === 'series' ? `
                            <div class="step-calc-line">
                                <div class="step-calc-header">1. Ολική Αντίσταση Σειράς:</div>
                                <div class="step-calc-formula">$$R_{\\text{ολ}} = R_1 + R_2 = ${phys.R_eq.toFixed(1)}\\ \\Omega$$</div>
                            </div>
                            <div class="step-calc-line">
                                <div class="step-calc-header">2. Κοινό Ρεύμα Σειράς:</div>
                                <div class="step-calc-formula">$$I = \\frac{V_{\\text{πηγ}}}{R_{\\text{ολ}}} = ${phys.I_total.toFixed(2)}\\text{ A}$$</div>
                            </div>
                            <div class="step-calc-line">
                                <div class="step-calc-header">3. Νόμος Ohm για τον $R_2$:</div>
                                <div class="step-calc-formula">$$V_2 = I \\cdot R_2 = ${i.toFixed(2)}\\text{ A} \\cdot ${isShorted ? 0 : state.R2}\\ \\Omega = ${v.toFixed(2)}\\text{ V}$$</div>
                            </div>
                            <div class="step-calc-line">
                                <div class="step-calc-header">4. Ισχύς Κατανάλωσης (Joule):</div>
                                <div class="step-calc-formula">$$P_2 = V_2 \\cdot I_2 = ${v.toFixed(2)}\\text{ V} \\cdot ${i.toFixed(2)}\\text{ A} = ${p.toFixed(2)}\\text{ W}$$</div>
                            </div>
                        ` : `
                            <div class="step-calc-line">
                                <div class="step-calc-header">1. Τάση Κλάδου (Παράλληλη σύνδεση):</div>
                                <div class="step-calc-formula">$$V_2 = V_{\\text{πηγ}} = ${state.V_src}\\text{ V}$$</div>
                            </div>
                            <div class="step-calc-line">
                                <div class="step-calc-header">2. Ρεύμα Κλάδου $R_2$ (Νόμος Ohm):</div>
                                <div class="step-calc-formula">$$I_2 = \\frac{V_2}{R_2} = \\frac{${state.V_src}\\text{ V}}{${state.R2}\\ \\Omega} = ${i.toFixed(2)}\\text{ A}$$</div>
                            </div>
                            <div class="step-calc-line">
                                <div class="step-calc-header">3. Ισχύς Κατανάλωσης Κλάδου 2:</div>
                                <div class="step-calc-formula">$$P_2 = \\frac{V_2^2}{R_2} = \\frac{(${state.V_src})^2}{${state.R2}} = ${p.toFixed(2)}\\text{ W}$$</div>
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
                        <span class="meter-val text-resistor">${phys.R_eq.toFixed(2)} Ω</span>
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
                            ${state.topology === 'series' ? `
                                <div class="step-calc-formula">$$R_{\\text{ολ}} = R_1 + R_2 = ${phys.R_eq.toFixed(1)}\\ \\Omega$$</div>
                            ` : `
                                <div class="step-calc-formula">$$R_{\\text{ολ}} = \\frac{R_1 \\cdot R_2}{R_1 + R_2} = \\frac{${state.R1} \\cdot ${state.R2}}{${state.R1} + ${state.R2}} = ${phys.R_eq.toFixed(2)}\\ \\Omega$$</div>
                            `}
                        </div>
                        <div class="step-calc-line">
                            <div class="step-calc-header">2. Ολικό Ρεύμα από τον Νόμο του Ohm:</div>
                            <div class="step-calc-formula">$$I_{\\text{ολ}} = \\frac{V_{\\text{πηγ}}}{R_{\\text{ολ}}} = ${phys.I_total.toFixed(2)}\\text{ A}$$</div>
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
                        <span class="meter-lbl"><span>Ηλεκτρικό Δυναμικό</span><span>(<span class="math-expr"><i class="math-var">V</i><sub class="math-sub">${nodeKey}</sub></span>):</span></span>
                        <span class="meter-val text-voltage">${pot.toFixed(2)} V</span>
                    </div>
                    <div class="hud-meter-box">
                        <span class="meter-lbl"><span>Δυναμικό Γείωσης</span><span>(<span class="math-expr"><i class="math-var">V</i><sub class="math-sub">D</sub></span>):</span></span>
                        <span class="meter-val" style="color: var(--text-muted, #94a3b8); font-weight: 700;">0.00 V</span>
                    </div>
                </div>
                ${isSteps ? `
                    <div class="hud-steps-box">
                        <div class="hud-steps-title">💡 Ανάλυση Ηλεκτρικού Δυναμικού (Κουίζ Ερώτηση 1):</div>
                        <p style="font-size: 0.88rem; line-height: 1.5; margin: 0;">
                            Το ηλεκτρικό δυναμικό στον κόμβο ${nodeKey} ορίζεται ως προς τη γείωση (σημείο D όπου $V_D = 0\text{ V}$).
                            ${nodeKey === 'A' ? `Εφόσον ο διακόπτης και το αμπερόμετρο θεωρούνται ιδανικά (αμελητέα αντίσταση), $V_A = V_{\text{πηγ}} = ${phys.V_src}\text{ V}$.` : ''}
                            ${nodeKey === 'B' ? (state.topology === 'series' ? `Η πτώση τάσης στον $R_1$ είναι $V_{AB} = V_1 = ${phys.V1.toFixed(2)}\text{ V}$, άρα $V_B = V_A - V_1 = ${phys.VB.toFixed(2)}\text{ V}$.` : `Στην παράλληλη σύνδεση, ο κόμβος B είναι ο κόμβος συμβολής των δύο κλάδων.`) : ''}
                            ${nodeKey === 'C' ? `Ο κόμβος C συνδέεται απευθείας με τη γείωση D μέσω ιδανικού αγωγού, άρα $V_C = V_D = 0\text{ V}$.` : ''}
                            ${nodeKey === 'D' ? `Το σημείο D αποτελεί τη γείωση του κυκλώματος με δυναμικό αναφοράς $V_D = 0\text{ V}$.` : ''}
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
