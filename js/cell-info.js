/* Biology Γ: infographic "Δομή και σύσταση του ευκαρυωτικού κυττάρου" with full screen and zoom. window.CellInfographic.render(mount) */
window.CellInfographic = (function () {
    'use strict';
    const SRC = 'assets/images/cellinfo/eukaryotic_cell.jpg';
    function render(mount) {
        mount.innerHTML =
            '<div class="sv-wrap ci-wrap">' +
            '<div class="sv-head"><h2>🗺️ Infographic: δομή και σύσταση του ευκαρυωτικού κυττάρου</h2>' +
            '<p>Μια σύνοψη με τα χημικά στοιχεία και τα μακρομόρια, τα οργανίδια και τη σύγκριση <strong>ζωικού</strong> και <strong>φυτικού</strong> κυττάρου. Πάτησε <strong>«Μεγέθυνση»</strong> (ή κλικ στην εικόνα) για να τη δεις σε πραγματικό μέγεθος και να μετακινηθείς μέσα της.</p></div>' +
            '<div class="sv-bar"><button type="button" class="sv-btn" id="ci-zoom">🔍 Μεγέθυνση</button><button type="button" class="sv-btn" id="ci-full">⛶ Πλήρης οθόνη</button><span class="sv-note">Στην πλήρη οθόνη, πάτησε Esc για έξοδο.</span></div>' +
            '<div class="ci-box" id="ci-box"><img class="ci-img" id="ci-img" src="' + SRC + '" alt="Infographic: δομή και σύσταση του ευκαρυωτικού κυττάρου και τα μόρια της ζωής"></div></div>';
        const box = mount.querySelector('#ci-box'), img = mount.querySelector('#ci-img'), zb = mount.querySelector('#ci-zoom');
        const setZoom = (on) => { box.classList.toggle('zoomed', on); zb.textContent = on ? '🔍 Σμίκρυνση (να χωράει στην οθόνη)' : '🔍 Μεγέθυνση'; };
        zb.addEventListener('click', () => setZoom(!box.classList.contains('zoomed')));
        img.addEventListener('click', () => setZoom(!box.classList.contains('zoomed')));
        mount.querySelector('#ci-full').addEventListener('click', () => {
            if (document.fullscreenElement) document.exitFullscreen();
            else if (box.requestFullscreen) box.requestFullscreen().catch(() => {});
        });
    }
    return { render };
})();
