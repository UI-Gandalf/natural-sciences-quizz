/* ==========================================================================
   Shared helpers for the concise study guides of Biology (tables, lists, boxes, collapsible sections).
   window.BioGuideKit = { tbl, ul, box, sec, flow, pyramid, renderPage }
   ========================================================================== */
(function () {
    'use strict';

    const tbl = (head, rows, cls) =>
        '<div class="bga-tw"><table class="bga-table ' + (cls || '') + '"><thead><tr>' + head.map(h => '<th>' + h + '</th>').join('') + '</tr></thead><tbody>' +
        rows.map(r => '<tr>' + r.map((c, i) => (i === 0 ? '<th scope="row">' : '<td>') + c + (i === 0 ? '</th>' : '</td>')).join('') + '</tr>').join('') +
        '</tbody></table></div>';
    const ul = items => '<ul class="bga-list">' + items.map(i => '<li>' + i + '</li>').join('') + '</ul>';
    const box = (cls, title, body) => '<div class="bga-box ' + cls + '"><strong>' + title + '</strong>' + body + '</div>';
    const sec = (id, icon, title, sub, body, open) =>
        '<details class="bga-sec" id="bga-' + id + '"' + (open ? ' open' : '') + '><summary><span class="bga-ico">' + icon + '</span><span class="bga-sum"><span class="bga-t">' + title + '</span><span class="bga-s">' + sub + '</span></span></summary><div class="bga-body">' + body + '</div></details>';
    const flow = steps => '<div class="bga-flow">' + steps.map((s, i) => (i ? '<span class="bga-arr">→</span>' : '') + '<span class="bga-step">' + s + '</span>').join('') + '</div>';
    /* tiers: top first; each {label, note} */
    const pyramid = (tiers, title) =>
        '<div class="bga-pyr" role="img" aria-label="' + title + '">' + tiers.map((t, i) =>
            '<div class="bga-pyr-row"><div class="bga-pyr-tier bga-pyr-t' + i + '" style="width:' + (34 + i * (66 / Math.max(1, tiers.length - 1))).toFixed(0) + '%"><strong>' + t[0] + '</strong><span>' + t[1] + '</span></div></div>').join('') + '</div>';

    /* cfg: {title, intro, sections:[{id, icon, title, sub, body, open}]} */
    function renderPage(mount, cfg) {
        mount.innerHTML = '';
        const root = document.createElement('div');
        root.className = 'bga';
        root.innerHTML =
            '<div class="bga-head"><h2>' + cfg.title + '</h2><p>' + cfg.intro + '</p>' +
            '<div class="bga-nav">' + cfg.sections.map(s => '<a href="#bga-' + s.id + '" data-go="' + s.id + '">' + (s.nav || s.title) + '</a>').join('') + '</div></div>' +
            cfg.sections.map(s => sec(s.id, s.icon, s.title, s.sub, s.body, s.open)).join('');
        mount.appendChild(root);
        root.querySelectorAll('.bga-nav a').forEach(a => {
            a.addEventListener('click', e => {
                e.preventDefault();
                const d = root.querySelector('#bga-' + a.dataset.go);
                if (d) { d.open = true; d.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
            });
        });
        return root;
    }

    window.BioGuideKit = { tbl, ul, box, sec, flow, pyramid, renderPage };
})();
