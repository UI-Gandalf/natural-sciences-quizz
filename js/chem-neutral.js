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

    function beakerSvg(r) {
        const top = 40, bottom = 222, full = bottom - top;
        const level = bottom - full * (r.vTot / (BASE_VOL + MAX_ADD));
        return `
        <svg class="neut-beaker-svg" viewBox="0 0 200 240" role="img" aria-label="Ποτήρι με διάλυμα">
            <rect x="42" y="${level}" width="116" height="${bottom - level}" rx="0" fill="${indicatorColor(r.pH)}" opacity="0.9"/>
            <path d="M 40 40 L 40 210 Q 40 226 56 226 L 144 226 Q 160 226 160 210 L 160 40" class="neut-glass" fill="none"/>
            <line x1="32" y1="40" x2="168" y2="40" class="neut-glass"/>
            <text x="100" y="236" text-anchor="middle" class="neut-cap">pH ${fmt(r.pH, 1)}</text>
        </svg>`;
    }

    // full curve, with a dashed rectangle on the magnified zone
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

    // Volume of HCl (mL) that gives a chosen pH, from the same model as compute()
    function volumeFor(p) {
        const c = CONC, nB = CONC * BASE_VOL;
        if (p > 7) {
            const x = Math.pow(10, p - 14);
            return (nB - BASE_VOL * x) / (c + x);
        }
        if (p < 7) {
            const y = Math.pow(10, -p);
            return (nB + BASE_VOL * y) / (c - y);
        }
        return EQ_VOL;
    }

    function volumesTableHtml() {
        const pHs = [11.3, 10, 9, 8, 7, 6, 5, 4, 3, 2.7];
        const rows = pHs.map((p) => {
            const va = volumeFor(p);
            return `<tr><td>${fmt(p, 1)}</td><td>${fmt(va, 5)}</td><td>${fmt(BASE_VOL + va, 5)}</td></tr>`;
        }).join('');
        return `
        <table class="neut-table">
            <caption><span class="neut-table-title">Λεπτομερής ανάλυση της περιοχής απότομης μείωσης της τιμής του ΠεΧά</span><br>Όγκος HCl 0,10 mol/L που χρειάζεται για να φτάσει το διάλυμα σε συγκεκριμένο pH (25 mL NaOH 0,10 mol/L, ιδανικό μοντέλο)</caption>
            <thead><tr><th>pH</th><th>HCl που προστέθηκε (mL)</th><th>Συνολικός όγκος (mL)</th></tr></thead>
            <tbody>${rows}</tbody>
        </table>`;
    }

    function readoutHtml(r) {
        return `
        <div class="neut-row"><span>$V_{\\text{HCl}}$ προστέθηκε</span><strong>${fmt(r.v, 2)} mL</strong></div>
        <div class="neut-row"><span>Συνολικός όγκος διαλύματος</span><strong>${fmt(r.vTot, 2)} mL</strong></div>
        <div class="neut-row"><span>$n(\\text{OH}^-)$ που απομένει</span><strong>${fmt(r.oh, 3)} mmol</strong></div>
        <div class="neut-row"><span>$n(\\text{H}^+)$ που περισσεύει</span><strong>${fmt(r.hp, 3)} mmol</strong></div>
        <div class="neut-row"><span>$n(\\text{Na}^+)$ (θεατό ιόν)</span><strong>${fmt(r.nB, 3)} mmol</strong></div>
        <div class="neut-row"><span>$n(\\text{Cl}^-)$ (θεατό ιόν)</span><strong>${fmt(r.nA, 3)} mmol</strong></div>
        <div class="neut-row neut-ph"><span>pH</span><strong>${fmt(r.pH, 2)}</strong></div>
        <p class="neut-state">${stateText(r)}</p>`;
    }

    function update(mount) {
        const r = compute(va);
        mount.querySelector('#neut-beaker').innerHTML = beakerSvg(r);
        mount.querySelector('#neut-curve').innerHTML = curveSvg(r);
        const readout = mount.querySelector('#neut-readout');
        readout.innerHTML = readoutHtml(r);
        if (window.renderMath) window.renderMath(readout);
    }

    function build(mount) {
        mount.innerHTML = `
        <div class="neut-wrap">
            <div class="neut-head">
                <h3>Εξουδετέρωση οξέος – βάσης</h3>
                <p>Ποτήρι με 25 mL διαλύματος NaOH 0,10 mol/L. Προσθέστε διάλυμα HCl 0,10 mol/L με βήματα και παρακολουθήστε το pH, το χρώμα του δείκτη και τα ιόντα.</p>
                <div class="neut-conc" role="radiogroup" aria-label="Βήμα προσθήκης οξέος">
                    <span class="neut-conc-label">Βήμα προσθήκης:</span>
                    <label><input type="radio" name="neut-step" value="0.10" checked> 0,10 mL</label>
                    <label><input type="radio" name="neut-step" value="0.05"> 0,05 mL</label>
                </div>
            </div>
            <div class="neut-grid">
                <div class="neut-left">
                    <div id="neut-beaker"></div>
                    <div class="neut-buttons">
                        <button type="button" data-add="1">+1 βήμα</button>
                        <button type="button" data-add="10">+10 βήματα</button>
                        <button type="button" data-eq="1">Ισοδύναμο σημείο</button>
                        <button type="button" data-reset="1">Επαναφορά</button>
                    </div>
                    <div class="neut-legend">
                        <span class="neut-sw" style="background: rgb(245, 213, 71)"></span> pH &lt; 6 (όξινο)
                        <span class="neut-sw" style="background: rgb(46, 160, 67)"></span> pH ≈ 7 (ουδέτερο)
                        <span class="neut-sw" style="background: rgb(31, 111, 235)"></span> pH &gt; 7,6 (βασικό)
                    </div>
                </div>
                <div class="neut-right">
                    <div id="neut-readout" class="neut-readout"></div>
                    <div id="neut-curve"></div>
                    <div id="neut-table"></div>
                </div>
            </div>
            <div class="neut-eq">
                <p>$\\text{HCl} + \\text{NaOH} \\rightarrow \\text{NaCl} + \\text{H}_2\\text{O}$</p>
                <p>Ουσιαστικά: $\\text{H}^+ + \\text{OH}^- \\rightarrow \\text{H}_2\\text{O}$. Τα $\\text{Na}^+$ και $\\text{Cl}^-$ δεν αντιδρούν (θεατές ιόντα).</p>
            </div>
        </div>`;
        mount.querySelector('#neut-table').innerHTML = volumesTableHtml();
        if (window.renderMath) window.renderMath(mount);
        mount.addEventListener('click', (e) => {
            const b = e.target.closest('button');
            if (!b) return;
            if (b.dataset.add) va = Math.min(MAX_ADD, va + parseFloat(b.dataset.add) * step);
            else if (b.dataset.eq) va = EQ_VOL;
            else if (b.dataset.reset) va = 0;
            va = Math.round(va * 100) / 100;
            update(mount);
        });
        mount.addEventListener('change', (e) => {
            if (e.target && e.target.name === 'neut-step') {
                step = parseFloat(e.target.value);
                update(mount);
            }
        });
    }

    function render(mount) {
        if (!mount) return;
        if (!mount.querySelector('.neut-wrap')) build(mount);
        update(mount);
    }

    return { render: render };
})();
