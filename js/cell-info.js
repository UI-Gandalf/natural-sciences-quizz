/* Biology Γ: infographic "Δομή και σύσταση του ευκαρυωτικού κυττάρου" with full screen and zoom. window.CellInfographic.render(mount) */
window.CellInfographic = (function () {
    'use strict';
    const CELL = { src: 'assets/images/cellinfo/eukaryotic_cell.jpg', alt: 'Infographic: δομή και σύσταση του ευκαρυωτικού κυττάρου και τα μόρια της ζωής', title: '🗺️ Infographic: δομή και σύσταση του ευκαρυωτικού κυττάρου', text: 'Μια σύνοψη με τα χημικά στοιχεία και τα μακρομόρια, τα οργανίδια και τη σύγκριση <strong>ζωικού</strong> και <strong>φυτικού</strong> κυττάρου.' };
    const MASSWEIGHT = { src: 'assets/images/massweight/mass_vs_weight.jpg', alt: 'Infographic: Μάζα και Βάρος, λύνοντας την παρανόηση', title: '⚖️ Infographic: Μάζα και Βάρος', text: 'Μια σύνοψη της <strong>διαφοράς μάζας και βάρους</strong>: τι είναι το καθένα, σε τι μονάδες μετριέται, με ποιο όργανο και πώς συνδέονται με τον τύπο W = m · g.' };
    function render(mount, cfg) {
        cfg = cfg || CELL; const SRC = cfg.src;
        mount.innerHTML =
            '<div class="sv-wrap ci-wrap">' +
            '<div class="sv-head"><h2>' + cfg.title + '</h2>' +
            '<p>' + cfg.text + ' Πάτησε <strong>«Μεγέθυνση»</strong> (ή κλικ στην εικόνα) για να τη δεις σε πραγματικό μέγεθος και να μετακινηθείς μέσα της.</p></div>' +
            '<div class="sv-bar"><button type="button" class="sv-btn" id="ci-zoom">🔍 Μεγέθυνση</button><button type="button" class="sv-btn" id="ci-full">⛶ Πλήρης οθόνη</button><span class="sv-note">Στην πλήρη οθόνη, πάτησε Esc για έξοδο.</span></div>' +
            '<div class="ci-box" id="ci-box"><img class="ci-img" id="ci-img" src="' + SRC + '" alt="' + cfg.alt + '"></div></div>';
        const box = mount.querySelector('#ci-box'), img = mount.querySelector('#ci-img'), zb = mount.querySelector('#ci-zoom');
        const setZoom = (on) => { box.classList.toggle('zoomed', on); zb.textContent = on ? '🔍 Σμίκρυνση (να χωράει στην οθόνη)' : '🔍 Μεγέθυνση'; };
        zb.addEventListener('click', () => setZoom(!box.classList.contains('zoomed')));
        img.addEventListener('click', () => setZoom(!box.classList.contains('zoomed')));
        mount.querySelector('#ci-full').addEventListener('click', () => {
            if (document.fullscreenElement) document.exitFullscreen();
            else if (box.requestFullscreen) box.requestFullscreen().catch(() => {});
        });
    }
    return { render, renderMassWeight: (m) => render(m, MASSWEIGHT) };
})();
