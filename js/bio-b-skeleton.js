/* ==========================================================================
   Biology Β: interactive skeleton (book page 104, "Το ερειστικό σύστημα (σκελετός) του ανθρώπου").
   The figure is the book's own drawing without its labels. Hover (or touch) a bone to see how the
   book names it. Texts come only from the school book.
   window.BioBSkeleton.render(mountElement)
   ========================================================================== */
(function () {
    'use strict';

    const GENERIC = 'Το βιβλίο δεν δίνει ξεχωριστή περιγραφή για αυτό το οστό. Ισχύουν οι γενικές λειτουργίες του σκελετού (πλαίσιο κάτω από το σχήμα).';
    const SKULL = 'Κρανίο · σκελετός του κορμού';
    const THORAX = 'Θώρακας · σκελετός του κορμού';
    const ARM = 'Άνω άκρο · σκελετός των άκρων';
    const LEG = 'Κάτω άκρο · σκελετός των άκρων';
    const NAMEPOS = 'Συνήθως τα οστά παίρνουν το όνομά τους ανάλογα με τη θέση τους.';
    const TYPES = 'Τα οστά, ανάλογα με τη μορφή τους, διακρίνονται σε <strong>μακρά, βραχέα και πλατιά</strong>.';

    /* id -> {name, group, note, label (chip text), unnamed} */
    const BONES = {
        1: { name: 'Μετωπιαίο', group: SKULL, note: 'Το βιβλίο το δίνει ως παράδειγμα οστού που παίρνει το όνομά του από τη <strong>θέση</strong> του. ' },
        2: { name: 'Βρεγματικό', group: SKULL, note: NAMEPOS },
        3: { name: 'Κροταφικό', group: SKULL, note: NAMEPOS },
        4: { name: 'Ζυγωματικό', group: SKULL, note: NAMEPOS },
        5: { name: 'Άνω γνάθος', group: SKULL, note: NAMEPOS },
        6: { name: 'Κάτω γνάθος', group: SKULL, note: NAMEPOS },
        7: { name: 'Κρανίο', group: SKULL, note: 'Άλλο οστό του κρανίου, που δεν ονομάζεται στο σχήμα του βιβλίου.', unnamed: true },
        8: { name: 'Κλείδα', group: THORAX, note: GENERIC },
        9: { name: 'Ωμοπλάτη', group: ARM, note: GENERIC },
        10: { name: 'Στέρνο', group: THORAX, note: GENERIC },
        11: { name: 'Πλευρές', group: THORAX, note: GENERIC },
        12: { name: 'Σπονδυλική στήλη', group: 'Σκελετός του κορμού', note: '<ul><li>Αποτελείται από <strong>σπονδύλους</strong>, ανάμεσα στους οποίους υπάρχουν ελαστικοί <strong>μεσοσπονδύλιοι δίσκοι</strong>.</li><li>Οι σπόνδυλοι σχηματίζουν τον <strong>σπονδυλικό σωλήνα</strong>, όπου προφυλάσσεται ο <strong>νωτιαίος μυελός</strong>.</li><li>Έχει τέσσερα κυρτώματα: αυχενικό, θωρακικό, οσφυϊκό, ιερό.</li><li>Συγκρατεί το <strong>βάρος του σώματος</strong> και είναι <strong>ευλύγιστη</strong>.</li></ul>' },
        13: { name: 'Βραχιόνιο', group: ARM, note: GENERIC },
        14: { name: 'Κερκίδα', group: ARM, note: 'Η εικόνα «Μακρά οστά» δεξιά στη σελίδα του βιβλίου δείχνει οστά του πήχη ως παράδειγμα μακρών οστών. ' + TYPES },
        15: { name: 'Ωλένη', group: ARM, note: 'Η εικόνα «Μακρά οστά» δεξιά στη σελίδα του βιβλίου δείχνει οστά του πήχη ως παράδειγμα μακρών οστών. ' + TYPES },
        16: { name: 'Άνω άκρο', group: ARM, note: 'Άλλα οστά του άνω άκρου, που δεν ονομάζονται στο σχήμα του βιβλίου.', unnamed: true },
        17: { name: 'Φάλαγγες', group: ARM, note: GENERIC, label: 'Φάλαγγες (χέρι)' },
        18: { name: 'Ανώνυμο οστό', group: LEG, note: GENERIC },
        19: { name: 'Μηριαίο', group: LEG, note: 'Το βιβλίο το δίνει ως παράδειγμα οστού που παίρνει το όνομά του από τη <strong>θέση</strong> του.' },
        20: { name: 'Επιγονατίδα', group: LEG, note: GENERIC },
        21: { name: 'Κνήμη', group: LEG, note: GENERIC },
        22: { name: 'Περόνη', group: LEG, note: GENERIC },
        23: { name: 'Κάτω άκρο', group: LEG, note: 'Άλλα οστά του κάτω άκρου, που δεν ονομάζονται στο σχήμα του βιβλίου.', unnamed: true },
        24: { name: 'Φάλαγγες', group: LEG, note: GENERIC, label: 'Φάλαγγες (πόδι)' },
        25: { name: 'Βραχύ οστό', group: 'Είδη οστών', note: 'Στην εικόνα δεξιά το βιβλίο δείχνει ένα βραχύ οστό. ' + TYPES },
        26: { name: 'Μακρά οστά', group: 'Είδη οστών', note: 'Στην εικόνα δεξιά το βιβλίο δείχνει μακρά οστά. ' + TYPES },
        27: { name: 'Πλατιά οστά', group: 'Είδη οστών', note: 'Στην εικόνα δεξιά το βιβλίο δείχνει πλατιά οστά. ' + TYPES }
    };
    /* short plain-language meaning of each bone: SUPPLEMENTARY (not in the school book, not examined) */
    const SIG = {
        1: 'Σχηματίζει το μέτωπο και το πάνω μέρος της κόγχης των ματιών. Προστατεύει το μπροστινό μέρος του εγκεφάλου.',
        2: 'Σχηματίζει το πάνω και πλάγιο μέρος του κρανίου. Προστατεύει τον εγκέφαλο.',
        3: 'Βρίσκεται στο πλάι του κρανίου, στον κρόταφο. Προστατεύει τον εγκέφαλο και στο εσωτερικό του βρίσκονται τμήματα του αυτιού.',
        4: 'Είναι το οστό του μάγουλου. Δίνει σχήμα στο πρόσωπο και προστατεύει το μάτι από το πλάι.',
        5: 'Σχηματίζει το πάνω μέρος του στόματος και στηρίζει τα πάνω δόντια.',
        6: 'Είναι το μόνο οστό του κρανίου που κινείται: επιτρέπει το μάσημα και την ομιλία και στηρίζει τα κάτω δόντια.',
        7: 'Τα οστά του κρανίου μαζί σχηματίζουν μια σκληρή θήκη που προστατεύει τον εγκέφαλο.',
        8: 'Συνδέει το στέρνο με την ωμοπλάτη. Κρατά τον ώμο μακριά από το στήθος και βοηθά στην κίνηση του χεριού.',
        9: 'Είναι ένα πλατύ οστό της πλάτης, όπου πιάνεται το βραχιόνιο στον ώμο. Σε αυτήν στηρίζονται πολλοί μύες που κινούν το χέρι.',
        10: 'Ενώνει τις πλευρές μπροστά. Μαζί τους προστατεύει την καρδιά και τους πνεύμονες.',
        11: 'Σχηματίζουν τον «κλωβό» του θώρακα, που προστατεύει την καρδιά και τους πνεύμονες. Κινούνται όταν αναπνέουμε.',
        12: 'Είναι ο κεντρικός άξονας του σώματος: στηρίζει το κεφάλι και τον κορμό και προστατεύει τον νωτιαίο μυελό.',
        13: 'Είναι το οστό του βραχίονα, από τον ώμο ως τον αγκώνα. Σε αυτό πιάνονται οι μύες που κάμπτουν και τεντώνουν τον αγκώνα.',
        14: 'Είναι οστό του πήχη, από την πλευρά του αντίχειρα. Βοηθά να στρέφουμε την παλάμη.',
        15: 'Είναι οστό του πήχη, από την πλευρά του μικρού δαχτύλου. Σχηματίζει την προεξοχή του αγκώνα.',
        16: 'Μικρά οστά του καρπού και της παλάμης, που κάνουν το χέρι ευκίνητο.',
        17: 'Είναι τα οστά των δαχτύλων. Επιτρέπουν να πιάνουμε και να κρατάμε αντικείμενα.',
        18: 'Είναι τμήμα της λεκάνης. Στηρίζει το βάρος του κορμού και προστατεύει όργανα της κοιλιάς.',
        19: 'Είναι το μακρύτερο και ισχυρότερο οστό του σώματος. Στηρίζει το βάρος και επιτρέπει το περπάτημα και το τρέξιμο.',
        20: 'Είναι το οστό του γονάτου, μπροστά από την άρθρωση. Την προστατεύει.',
        21: 'Είναι το χοντρό οστό της κνήμης. Σηκώνει το μεγαλύτερο μέρος του βάρους του σώματος από το γόνατο ως τον αστράγαλο.',
        22: 'Είναι λεπτό οστό δίπλα στην κνήμη. Δεν σηκώνει πολύ βάρος, αλλά βοηθά στη σταθερότητα του αστραγάλου και δίνει θέση σε μύες.',
        23: 'Μικρά οστά του αστραγάλου και του πέλματος, που στηρίζουν το σώμα όταν στεκόμαστε.',
        24: 'Είναι τα οστά των δαχτύλων του ποδιού. Βοηθούν στην ισορροπία και στο βάδισμα.',
        25: 'Τα βραχέα οστά είναι μικρά και συμπαγή. Δίνουν στήριξη και αντοχή (όπως οι σπόνδυλοι της σπονδυλικής στήλης).',
        26: 'Είναι μακριά οστά, όπως τα οστά των άκρων. Λειτουργούν σαν μοχλοί που κινούνται από τους μύες.',
        27: 'Είναι πλατιά και επίπεδα οστά. Προστατεύουν όργανα και προσφέρουν μεγάλη επιφάνεια για να πιάνονται μύες.'
    };
    const CHIP_GROUPS = [
        ['Κρανίο', [1, 2, 3, 4, 5, 6]],
        ['Θώρακας και σπονδυλική στήλη', [8, 10, 11, 12]],
        ['Άνω άκρο', [9, 13, 14, 15, 17]],
        ['Κάτω άκρο', [18, 19, 20, 21, 22, 24]],
        ['Είδη οστών (εικόνες δεξιά)', [25, 26, 27]]
    ];

    function decodeMap(m) {
        const bin = atob(m.rle);
        const out = new Uint8Array(m.w * m.h);
        let p = 0;
        for (let i = 0; i < bin.length; i += 3) {
            const v = bin.charCodeAt(i);
            const n = bin.charCodeAt(i + 1) | (bin.charCodeAt(i + 2) << 8);
            if (v) out.fill(v, p, p + n);
            p += n;
        }
        return out;
    }

    function render(mount) {
        mount.innerHTML = '';
        const map = window.BIO_B_SKEL_MAP;
        const root = document.createElement('div');
        root.className = 'sk-wrap';
        mount.appendChild(root);
        if (!map) { root.textContent = 'Δεν φορτώθηκαν τα δεδομένα του σκελετού.'; return; }
        const ids = decodeMap(map);
        const W = map.w, H = map.h;

        root.innerHTML =
            '<div class="sk-head"><h2>🦴 Το ερειστικό σύστημα (σκελετός) του ανθρώπου</h2>' +
            '<p>Περνάς το ποντίκι (ή αγγίζεις) πάνω από ένα οστό για να δεις πώς το ονομάζει το βιβλίο (σελ. 104). Πατώντας σε ένα οστό, η πληροφορία μένει στο πλαίσιο.</p></div>' +
            '<div class="sk-toolbar"><button type="button" class="sk-btn" data-act="reset">↩ Καθαρισμός επιλογής</button><button type="button" class="sk-btn" data-act="fs">⛶ Πλήρης οθόνη</button></div>' +
            '<div class="sk-main"><div class="sk-stage"><img class="sk-img" src="assets/images/bio_b_skeleton.svg" alt="Ο σκελετός του ανθρώπου, χωρίς ονομασίες" draggable="false"><canvas class="sk-hl" width="' + W + '" height="' + H + '"></canvas><div class="sk-tip" style="display:none"></div></div>' +
            '<aside class="sk-side"><div class="sk-info"></div><div class="sk-chips"></div></aside></div>' +
            '<details class="sk-general"><summary>Οι γενικές λειτουργίες του σκελετού (από το βιβλίο)</summary><div class="sk-general-body">' +
            '<ul><li>Ο σκελετός συμβάλλει στην <strong>κίνηση</strong>, <strong>προστατεύει</strong>, <strong>υποστηρίζει</strong> και <strong>διατηρεί το σχήμα</strong> του σώματος.</li>' +
            '<li>Λειτουργεί ως <strong>αποθήκη του ασβεστίου</strong>, που είναι απαραίτητο στον οργανισμό μας.</li>' +
            '<li>Στον <strong>ερυθρό μυελό των οστών</strong> παράγονται κύτταρα του αίματος.</li>' +
            '<li>Ο σκελετός του ανθρώπου διακρίνεται σε <strong>σκελετό του κορμού</strong> (κρανίο, θώρακας, σπονδυλική στήλη) και <strong>σκελετό των άκρων</strong> (άνω και κάτω άκρα).</li></ul></div></details>';

        const stage = root.querySelector('.sk-stage');
        const cv = root.querySelector('.sk-hl');
        const ctx = cv.getContext('2d');
        const tip = root.querySelector('.sk-tip');
        const info = root.querySelector('.sk-info');
        const chipsBox = root.querySelector('.sk-chips');
        const st = { hover: 0, sel: 0, drawn: -1 };

        function idAt(clientX, clientY) {
            const r = stage.getBoundingClientRect();
            const x = Math.floor((clientX - r.left) / r.width * W);
            const y = Math.floor((clientY - r.top) / r.height * H);
            if (x < 0 || y < 0 || x >= W || y >= H) return 0;
            return ids[y * W + x];
        }
        function paint(id) {
            if (st.drawn === id) return;
            st.drawn = id;
            ctx.clearRect(0, 0, W, H);
            if (!id) return;
            const img = ctx.createImageData(W, H);
            const d = img.data;
            for (let i = 0, n = W * H; i < n; i++) {
                if (ids[i] === id) { const k = i * 4; d[k] = 250; d[k + 1] = 190; d[k + 2] = 10; d[k + 3] = 170; }
            }
            ctx.putImageData(img, 0, 0);
        }
        function showInfo(id) {
            if (!id) {
                info.innerHTML = '<h3>Πάνω από ποιο οστό περνάς;</h3><p>Κινήσου πάνω στο σχήμα. Θα δεις το όνομα του οστού όπως το γράφει το βιβλίο και σε ποιο τμήμα του σκελετού ανήκει.</p><p class="sk-hint">Η εικόνα είναι από τη σελ. 104 του βιβλίου, χωρίς τις ονομασίες. Τα τρία μικρά σχήματα δεξιά δείχνουν τα είδη οστών: βραχύ, μακρά, πλατιά.</p>';
                return;
            }
            const b = BONES[id];
            info.innerHTML = '<div class="sk-card"><h3>' + b.name + '</h3><div class="sk-group">' + b.group + '</div><div class="sk-note">' + b.note + '</div>' +
                '<div class="sk-signif"><div class="sk-signif-h">Σημασία του οστού <span>συμπληρωματικό · εκτός βιβλίου · δεν ζητείται</span></div><p>' + SIG[id] + '</p></div></div>';
        }
        function current() { return st.hover || st.sel; }
        function refresh() { paint(current()); showInfo(current()); chipsBox.querySelectorAll('.sk-chip').forEach(c => c.classList.toggle('on', +c.dataset.id === current())); }

        stage.addEventListener('mousemove', e => {
            const id = idAt(e.clientX, e.clientY);
            if (id !== st.hover) { st.hover = id; refresh(); }
            if (id) {
                const r = stage.getBoundingClientRect();
                tip.textContent = BONES[id].name;
                tip.style.display = 'block';
                tip.style.left = Math.min(r.width - 150, e.clientX - r.left + 14) + 'px';
                tip.style.top = (e.clientY - r.top + 16) + 'px';
            } else tip.style.display = 'none';
        });
        stage.addEventListener('mouseleave', () => { st.hover = 0; tip.style.display = 'none'; refresh(); });
        stage.addEventListener('click', e => {
            const id = idAt(e.clientX, e.clientY);
            st.sel = id || 0;
            st.hover = id || 0;
            refresh();
        });

        CHIP_GROUPS.forEach(g => {
            const row = document.createElement('div');
            row.className = 'sk-chiprow';
            row.innerHTML = '<span class="sk-chipt">' + g[0] + '</span>';
            g[1].forEach(id => {
                const b = document.createElement('button');
                b.type = 'button'; b.className = 'sk-chip'; b.dataset.id = id;
                b.textContent = BONES[id].label || BONES[id].name;
                row.appendChild(b);
            });
            chipsBox.appendChild(row);
        });
        chipsBox.addEventListener('click', e => {
            const c = e.target.closest('.sk-chip');
            if (!c) return;
            st.sel = +c.dataset.id; st.hover = 0; refresh();
        });

        root.addEventListener('click', e => {
            const b = e.target.closest('[data-act]');
            if (!b) return;
            if (b.dataset.act === 'reset') { st.sel = 0; st.hover = 0; refresh(); }
            else if (b.dataset.act === 'fs') {
                if (document.fullscreenElement === root) document.exitFullscreen();
                else if (root.requestFullscreen) { const r = root.requestFullscreen(); if (r && r.catch) r.catch(() => {}); }
            }
        });
        function onFs() {
            if (!root.isConnected) { document.removeEventListener('fullscreenchange', onFs); return; }
            root.classList.toggle('sk-fs', document.fullscreenElement === root);
        }
        document.addEventListener('fullscreenchange', onFs);
        refresh();
    }

    window.BioBSkeleton = { render };
})();
