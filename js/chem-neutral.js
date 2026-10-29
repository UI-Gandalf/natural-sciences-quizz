/* Chemistry Γ: simple neutralisation lab, NaOH (base) + HCl (acid), strong acid and strong base.
   Exposes window.NeutralizationLab.render(mount). Calculations use mmol and mL (1 mmol / 1 mL = 1 mol/L).
   The step radio buttons choose how much acid one press adds (0,10 or 0,05 mL). */
window.NeutralizationLab = (function () {
    const CONC = 0.10;        // mol/L, both NaOH and HCl
    const BASE_VOL = 25;      // mL of NaOH in the beaker
    const MAX_ADD = 50;       // mL of acid that can be added
    const EQ_VOL = 25;        // mL, equal amounts of H⁺ and OH⁻

    let va = 0;               // mL of HCl added so far
    let step = 0.10;          // mL added by one press of "+1 βήμα"

    function fmt(x, d) {
        return x.toFixed(d).replace('.', ',');
    }

    function compute(v) {
        const nA = CONC * v;               // mmol H⁺ (and Cl⁻) added
        const nB = CONC * BASE_VOL;        // mmol OH⁻ (and Na⁺) at the start
        const vTot = BASE_VOL + v;         // mL
        const oh = Math.max(0, nB - nA);   // mmol OH⁻ left over
        const hp = Math.max(0, nA - nB);   // mmol H⁺ left over
        let pH;
        if (oh > 1e-9) pH = 14 + Math.log10(oh / vTot);
        else if (hp > 1e-9) pH = -Math.log10(hp / vTot);
        else pH = 7;
        return { v, nA, nB, oh, hp, vTot, pH };
    }

    // Bromothymol blue: yellow below pH 6, green near 7, blue above 7.6
    const YELLOW = [245, 213, 71], GREEN = [46, 160, 67], BLUE = [31, 111, 235];
    function mix(a, b, t) {
        return a.map((x, i) => Math.round(x + (b[i] - x) * t));
    }
    function indicatorColor(pH) {
        let c;
        if (pH <= 6) c = YELLOW;
        else if (pH <= 7) c = mix(YELLOW, GREEN, (pH - 6) / 1);
        else if (pH <= 7.6) c = mix(GREEN, BLUE, (pH - 7) / 0.6);
        else c = BLUE;
        return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
    }

    function stateText(r) {
        if (Math.abs(r.pH - 7) < 0.01 && r.oh < 1e-9 && r.hp < 1e-9) {
            return 'Ισοδύναμο σημείο: ακριβώς ίση ποσότητα H⁺ και OH⁻. Το διάλυμα είναι ουδέτερο (pH = 7).';
        }
        if (r.oh > 0) {
            return 'Περίσσεια OH⁻ (βασικό διάλυμα): το pH είναι μεγαλύτερο από 7 και μειώνεται καθώς προσθέτουμε οξύ.';
        }
        return 'Περίσσεια H⁺ (όξινο διάλυμα): το pH είναι μικρότερο από 7. Το οξύ δεν εξουδετερώνεται πια.';
    }

    // a wave along the surface, two periods wide, filled down to the bottom of the beaker
    function wavePath(level, bottom) {
        let d = `M 10 ${level} q 7.5 -3 15 0`;
        for (let i = 0; i < 12; i++) d += ' t 15 0';
        d += ` L 190 ${bottom} L 10 ${bottom} Z`;
        return d;
    }

    function beakerSvg(r) {
        const top = 40, bottom = 222, full = bottom - top;
        const level = bottom - full * (r.vTot / (BASE_VOL + MAX_ADD));
        const color = indicatorColor(r.pH);
        // the pH value sits inside the liquid, below the surface
        const textY = Math.max(level + 24, (level + bottom) / 2 + 5);
        return `
        <svg class="neut-beaker-svg" viewBox="0 0 200 240" role="img" aria-label="Ποτήρι με διάλυμα">
            <defs>
                <clipPath id="neut-liquid-clip">
                    <rect x="42" y="${top}" width="116" height="${bottom - top}"/>
                </clipPath>
            </defs>
            <g clip-path="url(#neut-liquid-clip)">
                <g class="neut-liquid">
                    <rect x="30" y="${level}" width="140" height="${bottom + 14 - level}" fill="${color}" opacity="0.9"/>
                    <g class="neut-wave"><path d="${wavePath(level, bottom + 14)}" fill="${color}" opacity="0.9"/></g>
                </g>
            </g>
            <path d="M 40 40 L 40 210 Q 40 226 56 226 L 144 226 Q 160 226 160 210 L 160 40" class="neut-glass" fill="none"/>
            <line x1="32" y1="40" x2="168" y2="40" class="neut-glass"/>
            <text x="100" y="${textY}" text-anchor="middle" class="neut-cap-in">pH ${fmt(r.pH, 1)}</text>
        </svg>`;
    }

    function curveSvg(current) {
        const L = 48, R = 400, T = 12, B = 200;
        const x = (v) => L + (v / MAX_ADD) * (R - L);
        const y = (p) => B - (p / 14) * (B - T);
        let pts = [];
        for (let v = 0; v <= MAX_ADD + 1e-9; v += 0.5) {
            pts.push(`${x(v).toFixed(1)},${y(compute(v).pH).toFixed(1)}`);
        }
        let grid = '';
        for (let p = 0; p <= 14; p += 2) {
            grid += `<line x1="${L}" x2="${R}" y1="${y(p)}" y2="${y(p)}" class="neut-grid"/>`;
            grid += `<text x="${L - 8}" y="${y(p) + 4}" text-anchor="end" class="neut-tick">${p}</text>`;
        }
        for (let v = 0; v <= MAX_ADD; v += 10) {
            grid += `<text x="${x(v)}" y="${B + 18}" text-anchor="middle" class="neut-tick">${v}</text>`;
        }
        const cx = x(current.v), cy = y(current.pH);
        return `
        <svg class="neut-curve-svg" viewBox="0 0 420 240" role="img" aria-label="Καμπύλη ογκομέτρησης">
            ${grid}
            <line x1="${L}" x2="${L}" y1="${T}" y2="${B}" class="neut-axis"/>
            <line x1="${L}" x2="${R}" y1="${B}" y2="${B}" class="neut-axis"/>
            <line x1="${x(EQ_VOL)}" x2="${x(EQ_VOL)}" y1="${T}" y2="${B}" class="neut-eq-line"/>
            <text x="${x(EQ_VOL) + 4}" y="${T + 12}" class="neut-eq-label">ισοδύναμο σημείο</text>
            <polyline points="${pts.join(' ')}" class="neut-curve"/>
            <line x1="${cx}" x2="${cx}" y1="${cy}" y2="${B}" class="neut-guide"/>
            <line x1="${L}" x2="${cx}" y1="${cy}" y2="${cy}" class="neut-guide"/>
            <circle cx="${cx}" cy="${cy}" r="6" class="neut-dot"/>
            <text x="${(L + R) / 2}" y="${B + 34}" text-anchor="middle" class="neut-axis-label">V(HCl) / mL</text>
            <text transform="translate(14, ${(T + B) / 2}) rotate(-90)" text-anchor="middle" class="neut-axis-label">pH</text>
        </svg>`;
    }

    function readoutHtml(r) {
        return `
        <div class="neut-row"><span>$V_{\\text{HCl}}$ προστέθηκε</span><strong>${fmt(r.v, 2)} mL</strong></div>
        <div class="neut-row"><span>Συνολικός όγκος διαλύματος</span><strong>${fmt(r.vTot, 2)} mL</strong></div>
        <div class="neut-row"><span>$n(\\text{OH}^-)$ που απομένει</span><strong>${fmt(r.oh, 3)} mmol</strong></div>
        <div class="neut-row"><span>$n(\\text{H}^+)$ που περισσεύει</span><strong>${fmt(r.hp, 3)} mmol</strong></div>
        <div class="neut-row"><span>$n(\\text{Na}^+)$ (ιόν θεατής)</span><strong>${fmt(r.nB, 3)} mmol</strong></div>
        <div class="neut-row"><span>$n(\\text{Cl}^-)$ (ιόν θεατής)</span><strong>${fmt(r.nA, 3)} mmol</strong></div>
        <div class="neut-row neut-ph"><span>pH</span><strong>${fmt(r.pH, 2)}</strong></div>
        <p class="neut-state">${stateText(r)}</p>
        <p class="neut-state neut-hint">Παρατηρήστε τη διαφορά στο χρώμα του δείκτη στο διάλυμα μεταξύ των τιμών 10, 7 και 3.</p>`;
    }

    // restart the wobble of the liquid (CSS animation)
    function jiggle(mount) {
        const g = mount.querySelector('.neut-liquid');
        if (!g) return;
        g.classList.remove('neut-jiggle');
        void g.getBoundingClientRect();
        g.classList.add('neut-jiggle');
    }

    function update(mount, shake) {
        const r = compute(va);
        mount.querySelector('#neut-beaker').innerHTML = beakerSvg(r);
        mount.querySelector('#neut-curve').innerHTML = curveSvg(r);
        const readout = mount.querySelector('#neut-readout');
        readout.innerHTML = readoutHtml(r);
        if (window.renderMath) window.renderMath(readout);
        if (shake) jiggle(mount);
    }

    function build(mount) {
        mount.innerHTML = `
        <div class="neut-wrap">
            <div class="neut-head">
                <h3>Εξουδετέρωση οξέος – βάσης</h3>
                <p>Ποτήρι με 25 mL διαλύματος NaOH 0,10 mol/L. Προσθέστε διάλυμα HCl 0,10 mol/L με βήματα και παρακολουθήστε το pH, το χρώμα του δείκτη και τα ιόντα.</p>
            </div>
            <div class="neut-grid">
                <div class="neut-left">
                    <div id="neut-beaker"></div>
                    <div class="neut-controls">
                        <div class="neut-conc neut-ctl-row" role="radiogroup" aria-label="Βήμα προσθήκης οξέος">
                            <span class="neut-conc-label">Βήμα προσθήκης:</span>
                            <label><input type="radio" name="neut-step" value="0.10" checked> 0,10 mL</label>
                            <label><input type="radio" name="neut-step" value="0.05"> 0,05 mL</label>
                        </div>
                        <div class="neut-buttons neut-steps">
                            <button type="button" data-add="1">+1 βήμα</button>
                            <button type="button" data-add="-1">−1 βήμα</button>
                            <button type="button" data-add="10">+10 βήματα</button>
                            <button type="button" data-add="-10">−10 βήματα</button>
                        </div>
                        <div class="neut-buttons neut-ctl-row">
                            <button type="button" data-eq="1">Ισοδύναμο σημείο</button>
                            <button type="button" data-reset="1">Επαναφορά</button>
                        </div>
                    </div>
                    <div class="neut-legend">
                        <span class="neut-leg-item"><span class="neut-sw" style="background: rgb(245, 213, 71)"></span>pH &lt; 6 (όξινο)</span>
                        <span class="neut-leg-item"><span class="neut-sw" style="background: rgb(46, 160, 67)"></span>pH ≈ 7 (ουδέτερο)</span>
                        <span class="neut-leg-item"><span class="neut-sw" style="background: rgb(31, 111, 235)"></span>pH &gt; 7,6 (βασικό)</span>
                    </div>
                    <p class="neut-indicator">Δείκτης: <span class="neut-ind-name" tabindex="0">μπλε της βρομοθυμόλης</span>
                        <span class="neut-ind-pop" role="tooltip">
                            <strong>Κάτω από pH 6:</strong> κίτρινο, πλήρως όξινη μορφή.<br>
                            <strong>Από pH 6 έως 7,6:</strong> σταδιακή μετάβαση από κίτρινο σε πράσινο και μετά σε μπλε. Το πράσινο είναι το μέσο της μετάβασης, κοντά στο 7.<br>
                            <strong>Πάνω από pH 7,6:</strong> μπλε, πλήρως βασική μορφή.
                        </span>
                    </p>
                </div>
                <div class="neut-right">
                    <div id="neut-readout" class="neut-readout"></div>
                    <div id="neut-curve"></div>
                </div>
            </div>
            <div class="neut-eq">
                <p>$\\text{HCl} + \\text{NaOH} \\rightarrow \\text{NaCl} + \\text{H}_2\\text{O}$</p>
                <p>Ουσιαστικά: $\\text{H}^+ + \\text{OH}^- \\rightarrow \\text{H}_2\\text{O}$. Τα $\\text{Na}^+$ και $\\text{Cl}^-$ δεν αντιδρούν (ιόντα θεατές).</p>
            </div>
        </div>`;
        if (window.renderMath) window.renderMath(mount);

        mount.addEventListener('click', (e) => {
            const b = e.target.closest('button');
            if (!b) return;
            let shake = false;
            if (b.dataset.add) {
                va = Math.min(MAX_ADD, Math.max(0, va + parseFloat(b.dataset.add) * step));
                shake = true;
            } else if (b.dataset.eq) {
                va = EQ_VOL;
                shake = true;
            } else if (b.dataset.reset) {
                va = 0;
                shake = true;
            }
            va = Math.round(va * 100) / 100;
            update(mount, shake);
        });

        mount.addEventListener('change', (e) => {
            if (e.target && e.target.name === 'neut-step') {
                step = parseFloat(e.target.value);
                update(mount, false);
            }
        });

        // a gentle wobble of the liquid when the page is scrolled while the lab is on screen
        let lastShake = 0;
        window.addEventListener('scroll', () => {
            const now = Date.now();
            if (now - lastShake < 500) return;
            const rect = mount.getBoundingClientRect();
            if (rect.height === 0 || rect.bottom < 0 || rect.top > window.innerHeight) return;
            lastShake = now;
            jiggle(mount);
        }, { passive: true });
    }

    function render(mount) {
        if (!mount) return;
        if (!mount.querySelector('.neut-wrap')) build(mount);
        update(mount, false);
    }

    return { render: render };
})();
