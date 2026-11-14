/* Physics Γ: "Circuit Duelists" card game + simulator (self-contained page in assets/games) shown in a frame, with a full-screen button. */
window.DuelistsEmbed = (function () {
    'use strict';
    function render(mount) {
        mount.innerHTML =
            '<div class="sv-wrap de-wrap">' +
            '<div class="sv-head"><h2>🎴 Circuit Duelists: κάρτες, προσομοιωτής και αποστολές</h2>' +
            '<p>Ένα παιχνίδι επανάληψης για τα ηλεκτρικά κυκλώματα. Στην <strong>ελεύθερη μελέτη</strong> γυρίζεις τις 15 κάρτες και δοκιμάζεις τον προσομοιωτή. Με το κουμπί <strong>«🎮 Αποστολές (παιχνίδι)»</strong> παίζεις γύρους των 10 αποστολών, κερδίζεις πόντους και κατακτάς κάρτες. Το παιχνίδι θυμάται την πρόοδό σου σε αυτή τη συσκευή.</p></div>' +
            '<div class="de-bar"><button type="button" class="sv-btn" id="de-full">⛶ Πλήρης οθόνη</button><span class="sv-note">Το παιχνίδι κυλά (scroll) μέσα στο πλαίσιο. Σε κινητό είναι πιο άνετο σε πλήρη οθόνη.</span></div>' +
            '<div class="de-frame-box" id="de-box"><iframe class="de-frame" id="de-frame" title="Circuit Duelists" src="assets/games/circuit-duelists.html" loading="lazy"></iframe></div>' +
            '</div>';
        const box = mount.querySelector('#de-box');
        mount.querySelector('#de-full').addEventListener('click', () => {
            if (document.fullscreenElement) document.exitFullscreen();
            else if (box.requestFullscreen) box.requestFullscreen().catch(() => {});
        });
    }
    return { render };
})();
