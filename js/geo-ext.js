/* Geography Β: one "Επεκτάσεις" tab with a drop-down that chooses between the supplementary pages
   (Byzantium & Mediterranean battles, the wreck of the Vasa, the siege of Leningrad).
   window.GeoExt.render(mountElement) */
window.GeoExt = (function () {
    'use strict';
    const TOPICS = [
        { key: 'byz', label: '🗺️ Βυζάντιο & Μεσόγειος (σημαντικότερες σχετικές μάχες)', get: () => window.ByzMaps },
        { key: 'vasa', label: '⚓ Το ναυάγιο του Vasa (Βαλτική)', get: () => window.VasaPage },
        { key: 'len', label: '🕯️ Η πολιορκία του Λένινγκραντ (Βαλτική)', get: () => window.LeningradPage }
    ];
    let current = 'byz';
    function render(mount) {
        mount.innerHTML = '';
        const root = document.createElement('div');
        root.className = 'bga';
        root.innerHTML = '<div class="bga-head"><h2>🧩 Επεκτάσεις</h2><p>Επιπλέον θέματα Γεωγραφίας και Ιστορίας. Είναι <strong>συμπληρωματικά</strong> και <strong>δεν αποτελούν εξεταστέα ύλη</strong>.</p>' +
            '<div class="cg-pick cg-pick-strong"><span class="cg-pick-t">👇 Υπάρχουν ' + TOPICS.length + ' θέματα: διάλεξε από το μενού</span><label class="cg-pick-sel"><select id="ge-topic">' + TOPICS.map((t) => '<option value="' + t.key + '"' + (t.key === current ? ' selected' : '') + '>' + t.label + '</option>').join('') + '</select></label>' +
            '<div class="cg-chips" id="ge-chips">' + TOPICS.map((t) => '<button type="button" class="cg-chip" data-k="' + t.key + '">' + t.label + '</button>').join('') + '</div></div></div><div id="ge-content"></div>';
        mount.appendChild(root);
        const sel = root.querySelector('#ge-topic'), content = root.querySelector('#ge-content');
        const go = () => { current = sel.value; root.querySelectorAll('.cg-chip').forEach((c) => c.classList.toggle('on', c.dataset.k === current)); const t = TOPICS.find((x) => x.key === current) || TOPICS[0]; const m = t.get(); content.innerHTML = ''; if (m) m.render(content); };
        sel.addEventListener('change', go);
        root.querySelectorAll('.cg-chip').forEach((c) => c.addEventListener('click', () => { sel.value = c.dataset.k; go(); }));
        go();
    }
    return { render };
})();
