/* ==========================================================================
   Biology Γ: interactive explorer of the eukaryotic cell (SVG).
   Content: the organelles, their structure and function as in the school
   material (G. Villias, "Το ευκαρυωτικό κύτταρο", sheets Γ3.1 - Γ3.4).
   window.CellExplorer.render(mountElement)
   ========================================================================== */
(function () {
    'use strict';

    /* ------------------------------------------------------------------ content */
    const ORG = {
        membrane: {
            name: 'Πλασματική μεμβράνη', num: 1, animal: true, plant: true,
            structure: 'Η πλασματική μεμβράνη, όπως και όλες οι μεμβράνες, αποτελείται από λιπίδια που εμποδίζουν την ελεύθερη διέλευση των ουσιών και από πρωτεΐνες που λειτουργούν ως κανάλια ελεγχόμενης διέλευσης.',
            func: 'Περιβάλλει το κύτταρο και ελέγχει την είσοδο και την έξοδο ουσιών.'
        },
        nucleus: {
            name: 'Πυρήνας', num: 2, animal: true, plant: true,
            structure: 'Περιβάλλεται από διπλή πυρηνική μεμβράνη (πυρηνικός φάκελος) και έχει ανοίγματα για την επικοινωνία με το υπόλοιπο κύτταρο (πυρηνικοί πόροι).',
            func: 'Περιέχει τις γενετικές πληροφορίες (DNA) για τη δομή και τη λειτουργία του κυττάρου.'
        },
        rer: {
            name: 'Αδρό ενδοπλασματικό δίκτυο', num: 3, animal: true, plant: true,
            structure: 'Το ενδοπλασματικό δίκτυο (ΕΔ) αποτελείται από ένα συνεχόμενο δίκτυο σωλήνων και μεμβρανών, με το οποίο συνδέεται όλο το εσωτερικό του κυττάρου. Το αδρό ΕΔ φέρει ριβοσώματα στην επιφάνειά του.',
            func: 'Σύνθεση πρωτεϊνών.'
        },
        ser: {
            name: 'Λείο ενδοπλασματικό δίκτυο', num: 4, animal: true, plant: true,
            structure: 'Είναι το ίδιο συνεχόμενο δίκτυο σωλήνων και μεμβρανών του ενδοπλασματικού δικτύου, αλλά χωρίς ριβοσώματα στην επιφάνειά του.',
            func: 'Σύνθεση λιπιδίων και αποθήκευση πρωτεϊνών.'
        },
        ribosome: {
            name: 'Ριβοσώματα', num: 5, animal: true, plant: true,
            structure: 'Αποτελούνται από RNA και πρωτεΐνες. Βρίσκονται στο αδρό ενδοπλασματικό δίκτυο και ελεύθερα στο κυτταρόπλασμα.',
            func: 'Σύνθεση πρωτεϊνών.'
        },
        golgi: {
            name: 'Σύμπλεγμα Golgi', num: 6, animal: true, plant: true,
            structure: 'Είναι ένα σύνολο πεπλατυσμένων σάκων, προς και από τους οποίους καταλήγουν κυστίδια μεταφοράς.',
            func: 'Τελική τροποποίηση των πρωτεϊνών.'
        },
        mito: {
            name: 'Μιτοχόνδριο', num: 7, animal: true, plant: true,
            structure: 'Περιβάλλεται από μία εξωτερική και μία εσωτερική μεμβράνη. Στο εσωτερικό του υπάρχει πλήθος πρωτεϊνών. Έχει δικά του ριβοσώματα και DNA.',
            func: 'Κυτταρική αναπνοή: διάσπαση γλυκόζης και παραγωγή ενέργειας.',
            endo: 'Σύμφωνα με την ενδοσυμβιωτική θεωρία, το μιτοχόνδριο προέκυψε από ένα ετερότροφο βακτήριο που ενσωματώθηκε σε αρχέγονο κύτταρο.'
        },
        lyso: {
            name: 'Λυσόσωμα', num: 8, animal: true, plant: true,
            structure: 'Είναι ένα κυστίδιο που περιέχει δραστικά ένζυμα.',
            func: 'Πέψη τροφών, διάσπαση μικροβίων και αυτοκαταστροφή οργανιδίων.'
        },
        wall: {
            name: 'Κυτταρικό τοίχωμα', num: 9, animal: false, plant: true,
            structure: 'Αποτελείται από μικροϊνίδια κυτταρίνης, που σχηματίζουν παράλληλα διαδοχικά στρώματα και συνδέονται και συμπληρώνονται με τη συμμετοχή και άλλων χημικών ουσιών.',
            func: 'Προστασία και στήριξη του κυττάρου.'
        },
        chloro: {
            name: 'Χλωροπλάστης', num: 10, animal: false, plant: true,
            structure: 'Στο εσωτερικό του εντοπίζονται οργανωμένες δομές μεμβρανών, στις οποίες βρίσκονται οι πρωτεΐνες που είναι απαραίτητες για τη λειτουργία της φωτοσύνθεσης. Έχει δικά του ριβοσώματα και DNA.',
            func: 'Φωτοσύνθεση: παραγωγή γλυκόζης και οξυγόνου.',
            endo: 'Σύμφωνα με την ενδοσυμβιωτική θεωρία, ο χλωροπλάστης προέκυψε από ένα κυανοβακτήριο (φωτοσυνθετικό προκαρυωτικό οργανισμό) που ενσωματώθηκε σε κύτταρο-ξενιστή.'
        },
        vacuole: {
            name: 'Χυμοτόπιο', num: 11, animal: false, plant: true,
            structure: 'Περιβάλλεται από μία ειδική μεμβράνη, η οποία ρυθμίζει την είσοδο και την έξοδο ουσιών σε αυτό. Παρόμοια δομή, αλλά μικρότερο μέγεθος, έχει το πεπτικό κενοτόπιο στα ζωικά ευκαρυωτικά κύτταρα.',
            func: 'Αποθήκευση νερού, αλάτων και διαφόρων θρεπτικών συστατικών.'
        },
        dvacuole: {
            name: 'Πεπτικό κενοτόπιο', num: 9, animal: true, plant: false,
            structure: 'Έχει παρόμοια δομή με το χυμοτόπιο των φυτικών κυττάρων, αλλά μικρότερο μέγεθος. Περιβάλλεται από μία ειδική μεμβράνη, η οποία ρυθμίζει την είσοδο και την έξοδο ουσιών σε αυτό.',
            func: 'Στα ζωικά κύτταρα βρίσκεται το πεπτικό κενοτόπιο, ως αντίστοιχο (μικρότερο) του χυμοτοπίου των φυτικών κυττάρων.'
        },
        cyto: {
            name: 'Κυτταρόπλασμα', num: null, animal: true, plant: true,
            structure: 'Είναι η περιοχή που εκτείνεται από τον πυρήνα έως την πλασματική μεμβράνη του κυττάρου.',
            func: 'Σε αυτήν εντοπίζονται όλα τα κυτταρικά οργανίδια.'
        }
    };

    const ORDER_ANIMAL = ['membrane', 'nucleus', 'rer', 'ser', 'ribosome', 'golgi', 'mito', 'lyso', 'dvacuole'];
    const ORDER_PLANT = ['membrane', 'nucleus', 'rer', 'ser', 'ribosome', 'golgi', 'mito', 'lyso', 'wall', 'chloro', 'vacuole'];

    /* self-test: description -> accepted organelles (only those present in the shown cell count) */
    const TESTS = [
        ['Περιέχει τις γενετικές πληροφορίες (DNA) του κυττάρου.', ['nucleus']],
        ['Περιβάλλεται από διπλή πυρηνική μεμβράνη με πυρηνικούς πόρους.', ['nucleus']],
        ['Κυτταρική αναπνοή: διάσπαση γλυκόζης και παραγωγή ενέργειας.', ['mito']],
        ['Περιβάλλεται από εξωτερική και εσωτερική μεμβράνη και έχει δικά του ριβοσώματα και DNA.', ['mito']],
        ['Πέψη τροφών, διάσπαση μικροβίων και αυτοκαταστροφή οργανιδίων.', ['lyso']],
        ['Κυστίδιο που περιέχει δραστικά ένζυμα.', ['lyso']],
        ['Τελική τροποποίηση των πρωτεϊνών.', ['golgi']],
        ['Σύνολο πεπλατυσμένων σάκων, προς και από τους οποίους καταλήγουν κυστίδια μεταφοράς.', ['golgi']],
        ['Σύνθεση πρωτεϊνών.', ['rer', 'ribosome']],
        ['Σύνθεση λιπιδίων και αποθήκευση πρωτεϊνών.', ['ser']],
        ['Αποτελούνται από RNA και πρωτεΐνες.', ['ribosome']],
        ['Δίκτυο σωλήνων και μεμβρανών με ριβοσώματα στην επιφάνειά του.', ['rer']],
        ['Περιβάλλει το κύτταρο και ελέγχει την είσοδο και την έξοδο ουσιών.', ['membrane']],
        ['Αποτελείται από λιπίδια και πρωτεΐνες-κανάλια ελεγχόμενης διέλευσης.', ['membrane']],
        ['Φωτοσύνθεση: παραγωγή γλυκόζης και οξυγόνου.', ['chloro'], 'plant'],
        ['Προστασία και στήριξη του κυττάρου· αποτελείται από μικροϊνίδια κυτταρίνης.', ['wall'], 'plant'],
        ['Αποθήκευση νερού, αλάτων και διαφόρων θρεπτικών συστατικών.', ['vacuole'], 'plant'],
        ['Στο εσωτερικό του υπάρχουν οργανωμένες δομές μεμβρανών με τις πρωτεΐνες της φωτοσύνθεσης.', ['chloro'], 'plant']
    ];

    /* ------------------------------------------------------------------ SVG art (local coordinates, centred on 0,0) */
    function wavyPath(x0, y0, len, amp, n) {
        let d = 'M' + x0 + ',' + y0;
        const step = len / (n * 2);
        for (let i = 0; i < n * 2; i++) {
            d += ' Q' + (x0 + step * i + step / 2).toFixed(1) + ',' + (y0 + (i % 2 ? 2 * amp : -2 * amp)) + ' ' + (x0 + step * (i + 1)).toFixed(1) + ',' + y0;
        }
        return d;
    }
    function tube(d, cls) {
        return '<path d="' + d + '" class="c-tube-o ' + cls + '"/><path d="' + d + '" class="c-tube-i ' + cls + '"/>';
    }
    function dotsAlong(x0, y0, len, amp, n, gap, off, r) {
        let s = '';
        for (let x = x0 + 6; x < x0 + len - 4; x += gap) {
            const y = y0 + amp * Math.sin((x - x0) / len * n * 2 * Math.PI) * 1.0;
            s += '<circle cx="' + x.toFixed(1) + '" cy="' + (y - off).toFixed(1) + '" r="' + r + '" class="c-ribo"/>';
            s += '<circle cx="' + (x + gap / 2).toFixed(1) + '" cy="' + (y + off).toFixed(1) + '" r="' + r + '" class="c-ribo"/>';
        }
        return s;
    }

    const ART = {
        nucleus() {
            let pores = '';
            for (let a = 0; a < 360; a += 40) {
                pores += '<rect x="-6" y="-113" width="12" height="20" rx="3" transform="rotate(' + a + ')" class="c-pore"/>';
            }
            return '<circle r="108" class="c-nuc-o"/><circle r="97" class="c-nuc-i"/>' + pores +
                '<path d="M-52,-18 C-30,-52 -8,-4 12,-34 S52,-14 40,16 M-44,26 C-20,56 6,14 28,44 M-62,2 C-48,22 -36,-6 -20,8" class="c-chrom"/>' +
                '<circle r="112" class="c-hit"/>';
        },
        rer() {
            let s = '';
            [-42, -14, 14, 42].forEach(y => {
                s += tube(wavyPath(-92, y, 184, 7, 4), 'c-rer') + dotsAlong(-92, y, 184, 7, 4, 12, 9, 3.1);
            });
            return s + '<rect x="-100" y="-62" width="200" height="124" class="c-hit"/>';
        },
        ser() {
            return tube('M-96,-30 C-60,-62 -30,-6 4,-34 S66,-54 96,-26', 'c-ser') + tube('M-96,6 C-62,36 -34,-12 0,14 S64,30 96,2', 'c-ser') +
                tube('M-90,40 C-50,62 -20,28 20,48 S70,56 92,34', 'c-ser') + tube('M-30,-6 C-24,10 -18,20 -14,34', 'c-ser') + tube('M42,-26 C52,-6 52,6 46,18', 'c-ser') +
                '<rect x="-100" y="-66" width="200" height="132" class="c-hit"/>';
        },
        golgi() {
            let s = '';
            [-40, -20, 0, 20, 40].forEach((y, i) => {
                const w = 62 - Math.abs(i - 2) * 6;
                s += tube('M' + (-w) + ',' + y + ' Q0,' + (y - 14) + ' ' + w + ',' + y, 'c-golgi');
            });
            s += '<circle cx="-78" cy="-26" r="8" class="c-vesicle"/><circle cx="-86" cy="6" r="6" class="c-vesicle"/><circle cx="80" cy="-8" r="8" class="c-vesicle"/><circle cx="86" cy="24" r="6" class="c-vesicle"/><circle cx="70" cy="-44" r="5" class="c-vesicle"/>';
            return s + '<rect x="-98" y="-62" width="196" height="124" class="c-hit"/>';
        },
        mito() {
            return '<ellipse rx="72" ry="38" class="c-mito-o"/><ellipse rx="64" ry="30" class="c-mito-i"/>' +
                '<path d="M-48,-26 C-44,-4 -40,0 -38,24 M-26,-30 C-22,-8 -18,2 -16,29 M-4,-30 C0,-10 4,0 6,30 M18,-29 C22,-8 26,2 28,28 M40,-24 C42,-6 44,2 46,20" class="c-crista"/>' +
                '<circle cx="-30" cy="-6" r="2.4" class="c-ribo"/><circle cx="8" cy="8" r="2.4" class="c-ribo"/><circle cx="30" cy="-10" r="2.4" class="c-ribo"/><circle cx="-8" cy="-14" r="2.4" class="c-ribo"/>' +
                '<path d="M-2,-4 c6,-8 14,-2 8,6 c-6,8 -14,2 -8,-6" class="c-dna"/>' +
                '<ellipse rx="76" ry="42" class="c-hit"/>';
        },
        lyso() {
            return '<circle r="27" class="c-lyso"/><circle cx="-8" cy="-7" r="4" class="c-enz"/><circle cx="9" cy="-9" r="3.4" class="c-enz"/><circle cx="3" cy="8" r="4.2" class="c-enz"/><circle cx="-12" cy="9" r="3" class="c-enz"/><circle cx="14" cy="5" r="3" class="c-enz"/><circle r="31" class="c-hit"/>';
        },
        dvacuole() {
            return '<circle r="38" class="c-dvac"/><ellipse cx="-8" cy="-4" rx="14" ry="9" class="c-food"/><circle cx="14" cy="10" r="6" class="c-food"/><circle cx="6" cy="-16" r="4" class="c-food"/><circle r="42" class="c-hit"/>';
        },
        chloro() {
            let g = '';
            [[-44, -4], [-4, 8], [38, -2]].forEach(p => {
                for (let k = 0; k < 4; k++) g += '<rect x="' + (p[0] - 15) + '" y="' + (p[1] - 14 + k * 7) + '" width="30" height="5" rx="2.5" class="c-thyl"/>';
            });
            return '<ellipse rx="80" ry="45" class="c-chl-o"/><ellipse rx="73" ry="38" class="c-chl-i"/>' +
                '<path d="M-30,-4 L-19,4 M12,8 L24,-2" class="c-lam"/>' + g +
                '<circle cx="-12" cy="-26" r="2.4" class="c-ribo"/><circle cx="20" cy="26" r="2.4" class="c-ribo"/><path d="M52,20 c4,-6 11,-2 6,4 c-5,6 -10,2 -6,-4" class="c-dna"/>' +
                '<ellipse rx="84" ry="49" class="c-hit"/>';
        },
        ribosome() {
            return '<circle r="5" class="c-ribo"/><circle r="12" class="c-hit"/>';
        }
    };

    /* ------------------------------------------------------------------ layouts: [type, x, y, scale, rotation] */
    const LAYOUT = {
        animal: [
            ['nucleus', 395, 300, 1, 0],
            ['rer', 610, 265, 1, 0], ['ser', 660, 430, 1, 0], ['golgi', 735, 160, 1, 0],
            ['mito', 250, 480, 1, -22], ['mito', 530, 520, 1, 8], ['mito', 800, 340, 0.9, 70],
            ['lyso', 270, 160, 1, 0], ['lyso', 700, 565, 1, 0], ['lyso', 150, 400, 0.9, 0],
            ['dvacuole', 215, 320, 1, 0]
        ],
        plant: [
            ['vacuole', 345, 350, 1, 0],
            ['nucleus', 640, 235, 0.88, 0],
            ['rer', 780, 395, 0.82, 0], ['ser', 610, 440, 0.8, 0], ['golgi', 790, 165, 0.8, 0],
            ['mito', 560, 545, 0.8, 4], ['mito', 780, 540, 0.78, -14],
            ['chloro', 520, 118, 0.74, 0], ['chloro', 168, 350, 0.74, 90], ['chloro', 345, 575, 0.62, 0],
            ['lyso', 470, 430, 0.9, 0], ['lyso', 860, 285, 0.8, 0]
        ]
    };
    const FREE_RIBOS = {
        animal: [[170, 250], [200, 205], [340, 105], [420, 112], [500, 112], [560, 150], [640, 105], [185, 560], [330, 585], [400, 585], [440, 465], [610, 600], [845, 255], [860, 420], [835, 470], [550, 400], [330, 410], [520, 215], [470, 330], [300, 270]],
        plant: [[540, 330], [700, 330], [850, 220], [690, 335], [500, 480], [690, 480], [870, 470], [700, 590], [470, 575], [880, 360], [560, 175], [715, 105], [150, 160], [150, 560]]
    };

    /* labels: [text x, text y, target x, target y]  (target null = text only) */
    const LABELS = {
        animal: {
            membrane: [500, 34, 500, 62], nucleus: [395, 150, 395, 192], rer: [600, 205, 600, 238], ser: [660, 505, 660, 462], ribosome: [420, 562, 440, 468],
            golgi: [735, 90, 735, 118], mito: [235, 565, 262, 520], lyso: [270, 112, 270, 138], dvacuole: [215, 252, 215, 283]
        },
        plant: {
            wall: [330, 24, 330, 54], membrane: [800, 24, 800, 74], vacuole: [345, 350, null, null], nucleus: [640, 120, 640, 143], rer: [880, 342, 800, 360, 'end'], ser: [610, 372, 610, 396],
            ribosome: [190, 128, 150, 160], golgi: [790, 112, 790, 138], mito: [560, 612, 560, 574], lyso: [455, 392, 470, 410], chloro: [520, 168, 520, 140]
        }
    };
    const BADGE_OFF = { mito: [50, -40], lyso: [20, -22], chloro: [50, -34] };

    function cellOutline(type) {
        if (type === 'animal') {
            const d = 'M118,330 C112,160 330,55 520,60 C725,66 890,165 886,350 C882,525 722,630 520,628 C320,626 124,520 118,330 Z';
            return '<path d="' + d + '" class="c-cyto c-cyto-animal"/><path d="' + d + '" class="c-membrane-line"/><path d="' + d + '" class="c-membrane-hit"/>';
        }
        let s = '<rect x="88" y="48" width="824" height="584" rx="62" class="c-wall-1"/><rect x="95" y="55" width="810" height="570" rx="56" class="c-wall-2"/><rect x="102" y="62" width="796" height="556" rx="51" class="c-wall-3"/>';
        s += '<rect x="88" y="48" width="824" height="584" rx="62" class="c-wall-hit"/>';
        s += '<rect x="112" y="72" width="776" height="536" rx="46" class="c-cyto c-cyto-plant"/><rect x="112" y="72" width="776" height="536" rx="46" class="c-membrane-line"/><rect x="112" y="72" width="776" height="536" rx="46" class="c-membrane-hit"/>';
        return s;
    }

    function vacuoleBig() {
        return '<path d="M-118,-30 C-120,-150 -30,-190 40,-186 C112,-182 130,-100 124,-10 C120,92 104,176 20,184 C-70,192 -118,120 -118,-30 Z" class="c-vac-o"/><path d="M-100,-24 C-100,-128 -22,-166 36,-162 C96,-158 108,-92 104,-8 C100,80 88,152 18,160 C-58,166 -100,104 -100,-24 Z" class="c-vac-i"/>' +
            '<path d="M-70,-60 c10,-30 40,-40 56,-34" class="c-shine"/><path d="M-118,-30 C-120,-150 -30,-190 40,-186 C112,-182 130,-100 124,-10 C120,92 104,176 20,184 C-70,192 -118,120 -118,-30 Z" class="c-hit"/>';
    }

    function buildSvg(type) {
        let s = '<svg class="cell-svg" viewBox="0 0 1000 680" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Διαδραστικό ' + (type === 'animal' ? 'ζωικό' : 'φυτικό') + ' ευκαρυωτικό κύτταρο">';
        s += '<g class="c-cell" data-org="cyto">' + cellOutline(type) + '</g>';
        if (type === 'plant') s += '<g class="org" data-org="wall" data-inst="0"><path d="M88,48 H912 V632 H88 Z M102,62 V618 H898 V62 Z" fill-rule="evenodd" class="c-hit"/></g>';
        s += '<g class="org" data-org="membrane" data-inst="0"><path class="c-hit-mem" d="' + (type === 'animal' ? 'M118,330 C112,160 330,55 520,60 C725,66 890,165 886,350 C882,525 722,630 520,628 C320,626 124,520 118,330 Z' : 'M112,72 H888 V608 H112 Z') + '"/></g>';
        // free ribosomes first (under the organelles)
        FREE_RIBOS[type].forEach((p, i) => {
            s += '<g class="org" data-org="ribosome" data-inst="' + (100 + i) + '" transform="translate(' + p[0] + ',' + p[1] + ')">' + ART.ribosome() + '</g>';
        });
        const count = {};
        LAYOUT[type].forEach(o => {
            const id = o[0];
            count[id] = (count[id] || 0) + 1;
            const inner = id === 'vacuole' ? vacuoleBig() : ART[id]();
            s += '<g class="org" data-org="' + id + '" data-inst="' + count[id] + '" data-x="' + o[1] + '" data-y="' + o[2] + '" data-s="' + o[3] + '" transform="translate(' + o[1] + ',' + o[2] + ') rotate(' + o[4] + ') scale(' + o[3] + ')">' + inner + '</g>';
            if (id === 'rer') {  // the ribosomes of the rough ER are ribosomes too
                s += '<g class="org" data-org="ribosome" data-inst="r' + count[id] + '" data-follow="rer" transform="translate(' + o[1] + ',' + o[2] + ') rotate(' + o[4] + ') scale(' + o[3] + ')">' + dotsOnlyRer() + '</g>';
            }
        });
        s += '<g class="c-labels"></g></svg>';
        return s;
    }
    function dotsOnlyRer() {
        let s = '';
        [-42, -14, 14, 42].forEach(y => { s += dotsAlong(-92, y, 184, 7, 4, 12, 9, 4.4).replace(/c-ribo/g, 'c-hit-ribo'); });
        return s;
    }

    /* ------------------------------------------------------------------ detail drawings (structure) */
    function T(x, y, txt, anchor) { return '<text x="' + x + '" y="' + y + '" text-anchor="' + (anchor || 'start') + '" class="d-txt">' + txt + '</text>'; }
    function L(x1, y1, x2, y2) { return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" class="d-ln"/>'; }

    const DETAIL = {
        membrane() {
            let s = '';
            for (let x = 14; x < 306; x += 13) {
                s += '<circle cx="' + x + '" cy="62" r="5" class="d-head"/><line x1="' + x + '" y1="67" x2="' + x + '" y2="88" class="d-tail"/>';
                s += '<circle cx="' + x + '" cy="128" r="5" class="d-head"/><line x1="' + x + '" y1="123" x2="' + x + '" y2="102" class="d-tail"/>';
            }
            s += '<rect x="132" y="48" width="44" height="94" rx="14" class="d-prot"/><rect x="146" y="54" width="16" height="82" rx="6" class="d-chan"/>';
            return s + L(60, 62, 60, 26) + T(60, 20, 'λιπίδια: εμποδίζουν την ελεύθερη διέλευση', 'start') + L(154, 142, 154, 168) + T(154, 182, 'πρωτεΐνη-κανάλι ελεγχόμενης διέλευσης', 'middle');
        },
        nucleus() {
            let s = '<circle cx="160" cy="95" r="72" class="c-nuc-o"/><circle cx="160" cy="95" r="64" class="c-nuc-i"/>';
            [[160, 23], [232, 95], [160, 167], [88, 95]].forEach((p, i) => { s += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="7" class="c-pore"/>'; });
            s += '<path d="M120,80 C136,56 150,100 166,76 S196,90 190,114 M126,116 C142,136 158,104 176,128" class="c-chrom"/>';
            return s + L(232, 95, 262, 60) + T(266, 56, 'πυρηνικός πόρος', 'start') + L(96, 52, 64, 28) + T(8, 22, 'πυρηνικός φάκελος', 'start') + T(8, 34, '(διπλή μεμβράνη)', 'start') + T(160, 98, 'DNA', 'middle');
        },
        rer() {
            let s = '';
            [58, 92, 126].forEach(y => { s += tube(wavyPath(20, y, 280, 9, 4), 'c-rer') + dotsAlong(20, y, 280, 9, 4, 14, 12, 3.4); });
            return s + L(110, 36, 110, 18) + T(110, 14, 'ριβοσώματα', 'middle') + T(160, 176, 'συνεχόμενο δίκτυο σωλήνων και μεμβρανών', 'middle');
        },
        ser() {
            let s = tube('M20,60 C70,20 110,100 160,60 S250,30 300,64', 'c-ser') + tube('M20,110 C70,150 110,80 160,116 S250,130 300,104', 'c-ser') + tube('M110,76 C114,92 118,100 122,108', 'c-ser') + tube('M222,48 C232,70 232,92 226,112', 'c-ser');
            return s + T(160, 176, 'δίκτυο σωλήνων και μεμβρανών χωρίς ριβοσώματα', 'middle');
        },
        ribosome() {
            return '<ellipse cx="160" cy="110" rx="52" ry="38" class="d-rib-l"/><ellipse cx="160" cy="62" rx="34" ry="24" class="d-rib-s"/>' +
                '<path d="M60,150 C90,120 120,170 160,130 S230,150 264,118" class="d-rna"/>' + T(160, 112, 'RNA & πρωτεΐνες', 'middle') + T(160, 30, 'δύο υπομονάδες', 'middle') + T(160, 176, 'μόριο RNA (αγγελιοφόρο)', 'middle');
        },
        golgi() {
            let s = '';
            [58, 82, 106, 130].forEach((y, i) => { const w = 108 - i * 6; s += tube('M' + (160 - w) + ',' + y + ' Q160,' + (y - 18) + ' ' + (160 + w) + ',' + y, 'c-golgi'); });
            s += '<circle cx="40" cy="70" r="9" class="c-vesicle"/><circle cx="30" cy="104" r="7" class="c-vesicle"/><circle cx="282" cy="84" r="9" class="c-vesicle"/><circle cx="292" cy="116" r="7" class="c-vesicle"/>';
            return s + L(40, 60, 70, 30) + T(70, 24, 'κυστίδια μεταφοράς', 'start') + T(160, 176, 'πεπλατυσμένοι σάκοι', 'middle');
        },
        mito() {
            return '<ellipse cx="160" cy="98" rx="124" ry="62" class="c-mito-o"/><ellipse cx="160" cy="98" rx="112" ry="50" class="c-mito-i"/>' +
                '<path d="M86,56 C92,86 98,92 100,140 M122,52 C128,84 134,92 136,146 M158,50 C164,84 170,96 172,148 M194,52 C198,84 204,94 206,146 M230,58 C234,84 238,92 240,130" class="c-crista"/>' +
                '<circle cx="110" cy="76" r="3" class="c-ribo"/><circle cx="148" cy="118" r="3" class="c-ribo"/><circle cx="214" cy="90" r="3" class="c-ribo"/><circle cx="182" cy="70" r="3" class="c-ribo"/>' +
                '<path d="M150,96 c8,-12 20,-4 12,8 c-8,12 -20,4 -12,-8" class="c-dna"/>' +
                L(160, 36, 160, 20) + T(160, 14, 'εξωτερική μεμβράνη', 'middle') + L(112, 60, 70, 28) + T(8, 24, 'εσωτερική μεμβράνη', 'start') + L(150, 104, 150, 172) + T(150, 184, 'δικό του DNA & ριβοσώματα, πλήθος πρωτεϊνών', 'middle');
        },
        lyso() {
            let s = '<circle cx="160" cy="95" r="62" class="c-lyso"/>';
            [[130, 78], [166, 70], [150, 112], [188, 104], [122, 112], [176, 134]].forEach(p => { s += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="8" class="c-enz"/>'; });
            return s + L(210, 70, 258, 48) + T(262, 44, 'δραστικά ένζυμα', 'start') + T(160, 176, 'κυστίδιο με μία μεμβράνη', 'middle');
        },
        wall() {
            let s = '';
            [[20, 'a'], [66, 'b'], [112, 'a'], [158, 'b']].forEach(l => {
                for (let k = 0; k < 7; k++) {
                    if (l[1] === 'a') s += '<line x1="14" y1="' + (l[0] + k * 5.5) + '" x2="306" y2="' + (l[0] + k * 5.5) + '" class="d-fib"/>';
                    else s += '<line x1="' + (30 + k * 38) + '" y1="' + (l[0]) + '" x2="' + (30 + k * 38) + '" y2="' + (l[0] + 38) + '" class="d-fib2"/>';
                }
            });
            return s + T(160, 12, 'μικροϊνίδια κυτταρίνης σε παράλληλα, διαδοχικά στρώματα', 'middle') + T(160, 192, '+ άλλες χημικές ουσίες που τα συμπληρώνουν', 'middle');
        },
        chloro() {
            let g = '';
            [[96, 90], [160, 106], [222, 92]].forEach(p => { for (let k = 0; k < 5; k++) g += '<rect x="' + (p[0] - 24) + '" y="' + (p[1] - 22 + k * 9) + '" width="48" height="6.5" rx="3.2" class="c-thyl"/>'; });
            return '<ellipse cx="160" cy="98" rx="128" ry="66" class="c-chl-o"/><ellipse cx="160" cy="98" rx="116" ry="54" class="c-chl-i"/>' +
                '<path d="M104,92 L136,104 M184,106 L206,94" class="c-lam"/>' + g +
                '<circle cx="82" cy="60" r="3" class="c-ribo"/><circle cx="244" cy="130" r="3" class="c-ribo"/><path d="M238,66 c8,-12 20,-4 12,8 c-8,12 -20,4 -12,-8" class="c-dna"/>' +
                L(160, 130, 160, 160) + T(160, 172, 'οργανωμένες δομές μεμβρανών', 'middle') + T(160, 184, 'με τις πρωτεΐνες της φωτοσύνθεσης', 'middle') + T(238, 50, 'DNA', 'middle') + T(82, 50, 'ριβοσώματα', 'middle');
        },
        vacuole() {
            return '<path d="M60,100 C56,40 120,22 170,24 C236,26 266,60 262,110 C258,160 210,176 160,176 C100,176 62,152 60,100 Z" class="c-vac-o"/><path d="M74,100 C72,52 124,38 170,40 C226,42 250,68 248,108 C244,150 204,162 160,162 C110,162 76,142 74,100 Z" class="c-vac-i"/>' +
                L(66, 70, 30, 40) + T(8, 34, 'ειδική μεμβράνη', 'start') + T(160, 104, 'νερό, άλατα,', 'middle') + T(160, 118, 'θρεπτικά συστατικά', 'middle') + T(160, 192, 'ρυθμίζει την είσοδο και έξοδο ουσιών', 'middle');
        },
        dvacuole() {
            return '<circle cx="160" cy="95" r="64" class="c-dvac"/><ellipse cx="146" cy="86" rx="26" ry="16" class="c-food"/><circle cx="184" cy="114" r="11" class="c-food"/><circle cx="170" cy="62" r="7" class="c-food"/>' +
                L(214, 64, 258, 40) + T(262, 36, 'ειδική μεμβράνη', 'start') + T(160, 176, 'παρόμοιο με το χυμοτόπιο, αλλά μικρότερο', 'middle');
        },
        cyto() {
            return '<path d="M30,100 C34,34 120,14 190,16 C262,18 296,60 290,110 C284,162 214,176 150,176 C80,176 26,150 30,100 Z" class="c-cyto c-cyto-animal"/><circle cx="90" cy="86" r="30" class="c-nuc-o"/><circle cx="90" cy="86" r="23" class="c-nuc-i"/><ellipse cx="210" cy="108" rx="34" ry="18" class="c-mito-o"/><circle cx="198" cy="56" r="12" class="c-lyso"/><circle cx="150" cy="140" r="9" class="c-golgi"/>' +
                T(160, 12, 'πλασματική μεμβράνη', 'middle') + T(160, 190, 'από τον πυρήνα έως την πλασματική μεμβράνη', 'middle');
        }
    };

    /* ------------------------------------------------------------------ component */
    function render(mount) {
        mount.innerHTML = '';
        const root = document.createElement('div');
        root.className = 'cell-explorer';
        mount.appendChild(root);

        const st = { type: 'animal', sel: null, labels: true, test: null, view: [0, 0, 1000, 680] };

        root.innerHTML =
            '<div class="cell-head"><h2 class="cell-title">🔬 Εξερεύνηση του ευκαρυωτικού κυττάρου</h2>' +
            '<p class="cell-sub">Επιλέξτε Ζωικό ή Φυτικό κύτταρο (ανοίγει σε πλήρη οθόνη) ή δοκιμάστε τον εαυτό σας. Πατήστε πάνω σε ένα οργανίδιο για να το προσεγγίσετε. Η ύλη είναι αυτή του σχολικού υλικού (Γ3.1 – Γ3.4).</p></div>' +
            '<div class="cell-toolbar">' +
            '<div class="cell-toggle" role="group" aria-label="Τύπος κυττάρου"><button type="button" data-act="type" data-v="animal" class="on">🐾 Ζωικό κύτταρο ⛶</button><button type="button" data-act="type" data-v="plant">🌿 Φυτικό κύτταρο ⛶</button></div>' +
            '<label class="cell-check"><input type="checkbox" data-act="labels" checked> Ονόματα στο σχέδιο</label>' +
            '<button type="button" class="cell-btn cell-btn-test" data-act="test">🎯 Δοκίμασε τον εαυτό σου ⛶</button>' +
            '<span class="cell-fsbar"><button type="button" class="cell-btn" data-act="exitfs">✕ Κανονική προβολή</button><button type="button" class="cell-btn cell-btn-leave" data-act="leave">⎋ Έξοδος</button></span>' +
            '</div>' +
            '<div class="cell-testbar" style="display:none"></div>' +
            '<div class="cell-main"><div class="cell-stage"></div><aside class="cell-info"></aside></div>' +
            '<div class="cell-chips" role="list"></div>' +
            '<details class="cell-compare"><summary>Διαφορές ζωικού και φυτικού κυττάρου</summary><div class="cell-compare-body"></div></details>';

        const stage = root.querySelector('.cell-stage');
        const info = root.querySelector('.cell-info');
        const chips = root.querySelector('.cell-chips');
        const testbar = root.querySelector('.cell-testbar');
        let svg = null;
        let tip = null;
        let raf = 0;

        function orderNow() { return st.type === 'animal' ? ORDER_ANIMAL : ORDER_PLANT; }
        function present(id) { return !!ORG[id] && (st.type === 'animal' ? ORG[id].animal : ORG[id].plant); }

        /* ---------- stage ---------- */
        function buildStage() {
            stage.innerHTML = buildSvg(st.type) + '<div class="cell-tip" style="display:none"></div><div class="cell-zoombadge" style="display:none"></div>';
            svg = stage.querySelector('svg');
            tip = stage.querySelector('.cell-tip');
            st.view = [0, 0, 1000, 680];
            setView(st.view);
            drawLabels();
            svg.addEventListener('click', onSvgClick);
            svg.addEventListener('mousemove', onSvgMove);
            svg.addEventListener('mouseleave', () => { tip.style.display = 'none'; });
            applySelection();
        }
        function setView(v) { svg.setAttribute('viewBox', v.map(n => n.toFixed(1)).join(' ')); st.view = v; }
        function animateView(to) {
            cancelAnimationFrame(raf);
            const from = st.view.slice();
            const t0 = performance.now();
            const dur = 650;
            const ease = t => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
            const step = now => {
                const k = Math.min(1, (now - t0) / dur);
                const e = ease(k);
                setView(from.map((f, i) => f + (to[i] - f) * e));
                if (k < 1) raf = requestAnimationFrame(step);
            };
            raf = requestAnimationFrame(step);
        }
        function targetBox(id) {
            const W = 1000, H = 680;
            let cx, cy, w;
            const g = svg.querySelector('.org[data-org="' + id + '"][data-x]');
            if (id === 'membrane') { cx = st.type === 'animal' ? 215 : 190; cy = st.type === 'animal' ? 215 : 130; w = 330; }
            else if (id === 'wall') { cx = 165; cy = 110; w = 300; }
            else if (id === 'cyto') { return [0, 0, W, H]; }
            else if (id === 'ribosome') { const rr = svg.querySelector('.org[data-org="rer"][data-x]'); const p = rr ? [+rr.dataset.x, +rr.dataset.y] : [500, 300]; cx = p[0]; cy = p[1]; w = 300; }
            else if (g) {
                const sc = +g.dataset.s;
                cx = +g.dataset.x; cy = +g.dataset.y;
                const base = { nucleus: 330, rer: 330, ser: 330, golgi: 320, mito: 300, lyso: 200, dvacuole: 220, chloro: 300, vacuole: 520 }[id] || 320;
                w = base * (id === 'vacuole' ? 1 : Math.max(0.8, sc));
            } else return [0, 0, W, H];
            const h = w * H / W;
            return [Math.max(0, Math.min(W - w, cx - w / 2)), Math.max(0, Math.min(H - h, cy - h / 2)), w, h];
        }
        function drawLabels() {
            const gl = svg.querySelector('.c-labels');
            gl.innerHTML = '';
            if (!st.labels || st.test) return;
            let out = '';
            const L = LABELS[st.type];
            // one label per organelle: text (number + name) with a leader line that touches the structure
            Object.keys(L).forEach(id => {
                const o = ORG[id];
                const q = L[id];                      // [textX, textY, targetX, targetY]
                const nm = (o.num ? o.num + '. ' : '') + o.name;
                if (q[2] !== null) {
                    out += '<line x1="' + q[0] + '" y1="' + (q[1] + 5) + '" x2="' + q[2] + '" y2="' + q[3] + '" class="c-lead-w"/><line x1="' + q[0] + '" y1="' + (q[1] + 5) + '" x2="' + q[2] + '" y2="' + q[3] + '" class="c-lead"/>';
                    out += '<circle cx="' + q[2] + '" cy="' + q[3] + '" r="4.5" class="c-lead-dot"/>';
                }
                out += '<text x="' + q[0] + '" y="' + q[1] + '" class="c-label" text-anchor="' + (q[4] || 'middle') + '">' + nm + '</text>';
            });
            // organelles that occur several times: a numbered badge on every copy, so none is mistaken for another organelle
            const cnt = {};
            LAYOUT[st.type].forEach(o => { cnt[o[0]] = (cnt[o[0]] || 0) + 1; });
            LAYOUT[st.type].forEach(o => {
                if (cnt[o[0]] < 2 || !ORG[o[0]].num) return;
                const off = BADGE_OFF[o[0]] || [40, -30];
                out += '<g transform="translate(' + (o[1] + off[0] * o[3]) + ',' + (o[2] + off[1] * o[3]) + ')"><circle r="12" class="c-badge"/><text y="5" text-anchor="middle" class="c-badge-t">' + ORG[o[0]].num + '</text></g>';
            });
            gl.innerHTML = out;
        }

        /* ---------- interactions ---------- */
        function orgFromEvent(e) {
            const el = e.target.closest('[data-org]');
            return el ? el.dataset.org : null;
        }
        function onSvgClick(e) {
            const id = orgFromEvent(e);
            if (!id) return;
            if (st.test) { answerTest(id); return; }
            select(id);
        }
        function onSvgMove(e) {
            if (st.test) { tip.style.display = 'none'; return; }
            const id = orgFromEvent(e);
            if (!id || id === 'cyto' || !present(id)) { tip.style.display = 'none'; return; }
            const b = stage.getBoundingClientRect();
            tip.textContent = ORG[id].name;
            tip.style.display = 'block';
            tip.style.left = Math.min(b.width - 160, e.clientX - b.left + 14) + 'px';
            tip.style.top = (e.clientY - b.top + 16) + 'px';
        }
        function applySelection() {
            Array.from(svg.classList).filter(c => c.indexOf('sel-') === 0).forEach(c => svg.classList.remove(c));
            svg.classList.toggle('has-sel', !!st.sel);
            if (st.sel) svg.classList.add('sel-' + st.sel);
            svg.querySelectorAll('.org, .c-cell').forEach(el => {
                const id = el.dataset.org;
                el.classList.toggle('sel', !!st.sel && id === st.sel);
            });
            const zb = stage.querySelector('.cell-zoombadge');
            if (st.sel && st.sel !== 'cyto') { zb.style.display = 'block'; zb.textContent = '🔍 ' + (ORG[st.sel].num ? ORG[st.sel].num + '. ' : '') + ORG[st.sel].name; }
            else zb.style.display = 'none';
            chips.querySelectorAll('.cell-chip').forEach(c => c.classList.toggle('on', c.dataset.id === st.sel));
        }
        function select(id) {
            st.sel = id;
            applySelection();
            animateView(targetBox(id));
            showInfo(id);
        }
        function resetView() {
            st.sel = null;
            applySelection();
            animateView([0, 0, 1000, 680]);
            showIntro();
        }

        /* ---------- info panel ---------- */
        function showIntro() {
            info.innerHTML =
                '<h3>Το ευκαρυωτικό κύτταρο</h3>' +
                '<p><strong>Ευκαρυωτικό κύτταρο</strong> είναι το κύτταρο στο οποίο υπάρχει δομή πυρήνα, δηλαδή κυτταρικό οργανίδιο με μεμβράνη που περιβάλλει το γενετικό του υλικό και είναι ευδιάκριτη με μικροσκόπιο.</p>' +
                '<p><strong>Κυτταρικά οργανίδια</strong> είναι οι μικρότερες δομές εντός του κυττάρου με εξειδικευμένη λειτουργία (π.χ. πυρήνας, μιτοχόνδριο κ.ά.).</p>' +
                '<p class="cell-tipline">👉 Επιλέξτε ένα οργανίδιο από το σχέδιο ή από τη λίστα. ' + (st.type === 'animal' ? 'Το ζωικό κύτταρο δεν έχει κυτταρικό τοίχωμα, χλωροπλάστες και χυμοτόπιο.' : 'Το φυτικό κύτταρο έχει επιπλέον κυτταρικό τοίχωμα, χλωροπλάστες και χυμοτόπιο.') + '</p>';
        }
        function showInfo(id) {
            const o = ORG[id];
            if (!o) return;
            const badge = (txt, on) => '<span class="cell-badge ' + (on ? 'yes' : 'no') + '">' + txt + '</span>';
            info.innerHTML =
                '<div class="cell-info-top">' + (o.num ? '<span class="cell-num">' + o.num + '</span>' : '<span class="cell-num">∗</span>') + '<h3>' + o.name + '</h3></div>' +
                '<div class="cell-presence">' + badge('Ζωικό κύτταρο ' + (o.animal || (id === 'vacuole') ? (o.animal ? '✓' : '(πεπτικό κενοτόπιο)') : '✗'), o.animal || id === 'vacuole') + badge('Φυτικό κύτταρο ' + (o.plant ? '✓' : '✗'), o.plant) + '</div>' +
                '<div class="cell-detail"><svg viewBox="0 0 320 196" class="cell-detail-svg" aria-hidden="true">' + ((DETAIL[id] || DETAIL.cyto)()) + '</svg></div>' +
                '<h4>Δομή</h4><p>' + o.structure + '</p>' +
                '<h4>Λειτουργία</h4><p class="cell-func">' + o.func + '</p>' +
                (o.endo ? '<div class="cell-endo">🧬 ' + o.endo + '</div>' : '') +
                '<div class="cell-nav"><button type="button" class="cell-btn" data-act="prev">⬅ Προηγούμενο</button><button type="button" class="cell-btn" data-act="next">Επόμενο ➡</button></div>';
        }
        function buildChips() {
            chips.innerHTML = '';
            orderNow().forEach(id => {
                const o = ORG[id];
                const b = document.createElement('button');
                b.type = 'button';
                b.className = 'cell-chip';
                b.dataset.id = id;
                b.setAttribute('role', 'listitem');
                b.innerHTML = '<span class="cell-chip-n">' + o.num + '</span>' + o.name;
                chips.appendChild(b);
            });
            const b = document.createElement('button');
            b.type = 'button'; b.className = 'cell-chip'; b.dataset.id = 'cyto';
            b.innerHTML = '<span class="cell-chip-n">∗</span>Κυτταρόπλασμα';
            chips.appendChild(b);
        }
        function buildCompare() {
            const body = root.querySelector('.cell-compare-body');
            const row = (n, a, p) => '<tr><td>' + n + '</td><td>' + a + '</td><td>' + p + '</td></tr>';
            body.innerHTML = '<table class="cell-table"><thead><tr><th>Δομή / οργανίδιο</th><th>Ζωικό</th><th>Φυτικό</th></tr></thead><tbody>' +
                row('Πλασματική μεμβράνη', '✓', '✓') + row('Πυρήνας', '✓', '✓') + row('Ενδοπλασματικό δίκτυο (αδρό και λείο)', '✓', '✓') + row('Ριβοσώματα', '✓', '✓') +
                row('Σύμπλεγμα Golgi', '✓', '✓') + row('Μιτοχόνδρια', '✓', '✓') + row('Λυσοσώματα', '✓', '✓') +
                row('<strong>Κυτταρικό τοίχωμα</strong>', '✗', '✓') + row('<strong>Χλωροπλάστες</strong>', '✗', '✓') + row('<strong>Χυμοτόπιο</strong>', '✗ (πεπτικό κενοτόπιο, μικρότερο)', '✓') + '</tbody></table>' +
                '<p class="cell-note">Οι διαφορές αφορούν το κυτταρικό τοίχωμα, τους χλωροπλάστες και το χυμοτόπιο.</p>';
        }

        /* ---------- self-test ---------- */
        function startTest() {
            const pool = TESTS.filter(t => !t[2] || t[2] === st.type).map(t => ({ q: t[0], ok: t[1].filter(present) })).filter(t => t.ok.length);
            for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const x = pool[i]; pool[i] = pool[j]; pool[j] = x; }
            st.test = { list: pool.slice(0, 10), i: 0, score: 0, tries: 0, done: false, locked: false };
            st.sel = null;
            applySelection();
            animateView([0, 0, 1000, 680]);
            drawLabels();
            showTestQuestion();
            root.querySelector('[data-act="test"]').textContent = '✖ Τέλος δοκιμής';
            info.innerHTML = '<h3>🎯 Δοκιμή</h3><p>Διαβάστε την περιγραφή και πατήστε πάνω στο οργανίδιο του σχεδίου στο οποίο ανήκει. Σωστό με την 1η προσπάθεια: 1 βαθμός, με τη 2η: 0,5.</p>';
        }
        function endTest() {
            st.test = null;
            testbar.style.display = 'none';
            svg.querySelectorAll('.t-ok, .t-bad').forEach(el => el.classList.remove('t-ok', 't-bad'));
            root.querySelector('[data-act="test"]').textContent = '🎯 Δοκίμασε τον εαυτό σου ⛶';
            drawLabels();
            showIntro();
        }
        function showTestQuestion() {
            const t = st.test;
            testbar.style.display = 'flex';
            svg.querySelectorAll('.t-ok, .t-bad').forEach(el => el.classList.remove('t-ok', 't-bad'));
            if (t.i >= t.list.length) {
                t.done = true;
                testbar.innerHTML = '<div class="cell-test-q"><strong>Τέλος!</strong> Σκορ: ' + fmt(t.score) + ' / ' + t.list.length + '</div><button type="button" class="cell-btn" data-act="test-again">↻ Ξανά</button>';
                return;
            }
            t.tries = 0; t.locked = false;
            testbar.innerHTML = '<div class="cell-test-q"><span class="cell-test-n">Ερώτηση ' + (t.i + 1) + ' / ' + t.list.length + '</span> ' + t.list[t.i].q + '</div><div class="cell-test-score">Σκορ: ' + fmt(t.score) + '</div><button type="button" class="cell-btn" data-act="test-skip">Παράλειψη ➡</button>';
        }
        function fmt(n) { return String(Math.round(n * 10) / 10).replace('.', ','); }
        function flash(ids, cls) {
            ids.forEach(id => svg.querySelectorAll('.org[data-org="' + id + '"]').forEach(el => el.classList.add(cls)));
        }
        function answerTest(id) {
            const t = st.test;
            if (!t || t.done || t.locked) return;
            if (id === 'cyto') return;
            const cur = t.list[t.i];
            if (cur.ok.includes(id)) {
                t.score += t.tries === 0 ? 1 : 0.5;
                t.locked = true;
                flash(cur.ok, 't-ok');
                info.innerHTML = '<h3>✅ Σωστά!</h3><p><strong>' + ORG[id].name + '</strong></p><p>' + ORG[id].func + '</p>';
                setTimeout(() => { if (st.test === t) { t.i++; showTestQuestion(); } }, 1300);
            } else {
                t.tries++;
                flash([id], 't-bad');
                if (t.tries >= 2) {
                    t.locked = true;
                    flash(cur.ok, 't-ok');
                    info.innerHTML = '<h3>❌ Όχι ακριβώς</h3><p>Σωστό: <strong>' + cur.ok.map(x => ORG[x].name).join(' ή ') + '</strong></p><p>' + ORG[cur.ok[0]].structure + '</p>';
                    setTimeout(() => { if (st.test === t) { t.i++; showTestQuestion(); } }, 2400);
                } else {
                    info.innerHTML = '<h3>❌ Δοκιμάστε ξανά</h3><p>Αυτό ήταν: <strong>' + ORG[id].name + '</strong>. Έχετε μία ακόμα προσπάθεια.</p>';
                }
            }
        }

        /* ---------- toolbar + panel events ---------- */
        root.addEventListener('click', e => {
            const b = e.target.closest('[data-act]');
            if (b) {
                const act = b.dataset.act;
                if (act === 'type') {
                    if (st.type !== b.dataset.v) {
                        st.type = b.dataset.v;
                        root.querySelectorAll('[data-act="type"]').forEach(x => x.classList.toggle('on', x === b));
                        st.sel = null;
                        if (st.test) endTest();
                        buildStage(); buildChips(); showIntro();
                    }
                    enterFs();
                } else if (act === 'reset') { if (st.test) endTest(); resetView(); }
                else if (act === 'exitfs') { leaveFs(); }
                else if (act === 'leave') {
                    leaveFs();
                    if (typeof switchSubjectTab === 'function') switchSubjectTab('quizzes');
                }
                else if (act === 'test') { if (st.test) endTest(); else { startTest(); enterFs(); } }
                else if (act === 'test-again') { startTest(); }
                else if (act === 'test-skip') { const t = st.test; if (t && !t.locked) { t.i++; showTestQuestion(); } }
                else if (act === 'prev' || act === 'next') {
                    const list = orderNow().concat(['cyto']);
                    let i = list.indexOf(st.sel);
                    i = act === 'next' ? (i + 1) % list.length : (i - 1 + list.length) % list.length;
                    select(list[i]);
                }
                return;
            }
            if (e.target.closest('.cell-zoombadge')) { if (!st.test) resetView(); return; }
            const chip = e.target.closest('.cell-chip');
            if (chip && !st.test) select(chip.dataset.id);
        });
        root.addEventListener('change', e => {
            if (e.target.matches('[data-act="labels"]')) { st.labels = e.target.checked; drawLabels(); }
        });
        root.addEventListener('keydown', e => { if (e.key === 'Escape') { if (st.test) endTest(); resetView(); } });

        /* full screen: the explorer itself fills the screen; Κανονική προβολή / Έξοδος live inside it */
        function enterFs() {
            if (document.fullscreenElement === root) return;
            if (root.requestFullscreen) { const r = root.requestFullscreen(); if (r && r.catch) r.catch(() => {}); }
        }
        function leaveFs() {
            if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen();
        }
        function onFsChange() {
            if (!root.isConnected) { document.removeEventListener('fullscreenchange', onFsChange); return; }
            root.classList.toggle('cell-fs', document.fullscreenElement === root);
        }
        document.addEventListener('fullscreenchange', onFsChange);

        buildStage();
        buildChips();
        buildCompare();
        showIntro();
    }

    window.CellExplorer = { render };
})();
