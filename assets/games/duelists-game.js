/* Circuit Duelists - "Αποστολές" game mode.
   Free study mode (default) is untouched. This file adds: a mode switch, a missions panel (predict, diagnose, true/false, build),
   points / ranks / streak, conquered cards, and a small localStorage save. It reuses computeCircuit() of the main page for every answer,
   so the right answers always agree with the simulator. */
(function () {
  'use strict';
  const KEY = 'circuit_duelists_game_v1';
  const ROUND_LEN = 10;
  const RANKS = [[0, 'Μαθητευόμενος'], [60, 'Τεχνίτης'], [150, 'Ηλεκτρολόγος'], [300, 'Μηχανικός'], [500, 'Αρχιμηχανικός']];
  const Vs = [12, 20, 24, 30, 36, 48, 60];
  const Rs = [2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 24, 30, 40];
  const Ts = [5, 10, 20];
  const $ = (id) => document.getElementById(id);
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const shuffle = (a) => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
  const clean = (x) => Number.isFinite(x) && Math.abs(x * 100 - Math.round(x * 100)) < 1e-9;
  const num = (x) => (Math.round(x * 100) / 100).toString().replace('.', ',');

  let G = { points: 0, won: [], best: 0, rounds: 0 };
  try { const s = JSON.parse(localStorage.getItem(KEY) || 'null'); if (s && typeof s === 'object') G = Object.assign(G, s); } catch (e) { /* no storage: play without saving */ }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(G)); } catch (e) { /* ignore */ } };

  // the round that is being played (not saved)
  let R = null, M = null;

  /* ---------- circuit maths: always through the page's own computeCircuit() ---------- */
  function calc(sim) {
    const keep = appState.sim;
    appState.sim = Object.assign({ time: 10, trap: 'none' }, sim);
    try { return computeCircuit(); } finally { appState.sim = keep; }
  }

  /* ---------- mission makers ---------- */
  const SERIES_Q = [
    { key: 'req', label: 'την ισοδύναμη αντίσταση Rολ', unit: 'Ω', get: (m) => m.req, hint: 'Σε σειρά οι αντιστάσεις προστίθενται: Rολ = R₁ + R₂.' },
    { key: 'itot', label: 'το ολικό ρεύμα Iολ', unit: 'A', get: (m) => m.itot, hint: 'Πρώτα βρες την Rολ· μετά Iολ = Vπηγ / Rολ (νόμος του Ohm).' },
    { key: 'v1', label: 'την τάση V₁ στα άκρα του R₁', unit: 'V', get: (m) => m.v1, hint: 'Στη σειρά το ρεύμα είναι κοινό: V₁ = I · R₁ (με I = Vπηγ / Rολ).' },
    { key: 'v2', label: 'την τάση V₂ στα άκρα του R₂', unit: 'V', get: (m) => m.v2, hint: 'Στη σειρά το ρεύμα είναι κοινό: V₂ = I · R₂ (με I = Vπηγ / Rολ).' },
    { key: 'p1', label: 'την ισχύ P₁ του R₁', unit: 'W', get: (m) => m.p1, hint: 'P₁ = I² · R₁ (ή V₁ · I), με κοινό ρεύμα I = Vπηγ / Rολ.' },
    { key: 'p2', label: 'την ισχύ P₂ του R₂', unit: 'W', get: (m) => m.p2, hint: 'P₂ = I² · R₂ (ή V₂ · I), με κοινό ρεύμα I = Vπηγ / Rολ.' },
    { key: 'etot', label: 'την ολική ενέργεια Eολ που δίνει η πηγή στον χρόνο t', unit: 'J', get: (m) => m.etot, hint: 'Pπηγ = Vπηγ · Iολ και μετά E = P · t.' }
  ];
  const PAR_Q = [
    { key: 'req', label: 'την ισοδύναμη αντίσταση Rολ', unit: 'Ω', get: (m) => m.req, hint: 'Σε παράλληλη σύνδεση: Rολ = (R₁ · R₂) / (R₁ + R₂).' },
    { key: 'i1', label: 'το ρεύμα I₁ στον κλάδο του R₁', unit: 'A', get: (m) => m.i1, hint: 'Η τάση σε κάθε κλάδο είναι Vπηγ: I₁ = Vπηγ / R₁.' },
    { key: 'i2', label: 'το ρεύμα I₂ στον κλάδο του R₂', unit: 'A', get: (m) => m.i2, hint: 'Η τάση σε κάθε κλάδο είναι Vπηγ: I₂ = Vπηγ / R₂.' },
    { key: 'itot', label: 'το ολικό ρεύμα Iολ της πηγής', unit: 'A', get: (m) => m.itot, hint: 'Βρες I₁ και I₂ (κάθε κλάδος έχει τάση Vπηγ) και πρόσθεσέ τα: Iολ = I₁ + I₂.' },
    { key: 'p1', label: 'την ισχύ P₁ του R₁', unit: 'W', get: (m) => m.p1, hint: 'P₁ = Vπηγ² / R₁ (ή Vπηγ · I₁).' },
    { key: 'p2', label: 'την ισχύ P₂ του R₂', unit: 'W', get: (m) => m.p2, hint: 'P₂ = Vπηγ² / R₂ (ή Vπηγ · I₂).' }
  ];
  const cardFor = (arena, trap, qkey, r1, r2) => {
    if (trap === 'short-r1') return 't-partial';
    if (trap === 'blown-r1') return 't-blown';
    if (qkey === 'p1' && [5, 10, 20, 40].includes(r1)) return 'r-' + r1;
    if (qkey === 'p2' && [5, 10, 20, 40].includes(r2)) return 'r-' + r2;
    return arena === 'series' ? 'a-series' : 'a-parallel';
  };

  function makePredict() {
    for (let n = 0; n < 400; n++) {
      const kind = pick(['series', 'series', 'parallel', 'parallel', 'short-r1', 'blown-r1']);
      const arena = kind === 'parallel' || kind === 'blown-r1' ? 'parallel' : 'series';
      const trap = kind === 'short-r1' ? 'short-r1' : kind === 'blown-r1' ? 'blown-r1' : 'none';
      const sim = { arena, trap, vsrc: pick(Vs), r1: pick(Rs), r2: pick(Rs), time: pick(Ts) };
      if (arena === 'parallel' && sim.r1 === sim.r2 && Math.random() < 0.7) continue;
      const m = calc(sim);
      if (m.statusLevel === 'danger') continue;
      let q;
      if (trap === 'short-r1') q = pick([SERIES_Q[1], SERIES_Q[5]]);
      else if (trap === 'blown-r1') q = PAR_Q[3];
      else q = pick(arena === 'series' ? SERIES_Q : PAR_Q);
      const ans = q.get(m);
      if (!clean(ans) || ans <= 0) continue;
      let intro = (arena === 'series' ? 'Κύκλωμα ΣΕ ΣΕΙΡΑ' : 'ΠΑΡΑΛΛΗΛΟ κύκλωμα') + `: Vπηγ = <b>${sim.vsrc} V</b>, R₁ = <b>${sim.r1} Ω</b>, R₂ = <b>${sim.r2} Ω</b>`;
      if (q.key === 'etot') intro += `, χρόνος λειτουργίας t = <b>${sim.time} s</b>`;
      intro += '.';
      if (trap === 'short-r1') intro += ' Ένα ιδανικό καλώδιο <b>βραχυκυκλώνει τον R₁</b> (μερικό βραχυκύκλωμα).';
      if (trap === 'blown-r1') intro += ' Ο <b>R₁ καίγεται</b> και ο κλάδος του διακόπτεται.';
      const hint = trap === 'short-r1' ? 'Ο R₁ παρακάμπτεται, άρα δεν συμμετέχει στο κύκλωμα: μένει μόνο ο R₂ στον βρόχο. ' + q.hint
        : trap === 'blown-r1' ? 'Ο κλάδος του R₁ δεν διαρρέεται πια, ο R₂ όμως μένει με την ίδια τάση Vπηγ. Άρα Iολ = I₂ = Vπηγ / R₂.' : q.hint;
      return { type: 'predict', sim, m, ans, unit: q.unit, text: intro + ` Βρες ${q.label} (σε ${q.unit}).`, hint, card: cardFor(arena, trap, q.key, sim.r1, sim.r2), tries: 0, hinted: false };
    }
    return null;
  }

  const DIAG = {
    series: [['none', 'Κανονική λειτουργία'], ['short-r1', 'Μερικό βραχυκύκλωμα στον R₁'], ['short-r2', 'Μερικό βραχυκύκλωμα στον R₂'], ['short-total', 'Ολικό βραχυκύκλωμα'], ['open-k', 'Ανοικτός διακόπτης K'], ['blown-r1', 'Καμένος R₁ (διακοπή)']],
    parallel: [['none', 'Κανονική λειτουργία'], ['open-k', 'Ανοικτός διακόπτης K'], ['blown-r1', 'Καμένος R₁ (διακοπή του κλάδου)'], ['short-total', 'Βραχυκύκλωμα']]
  };
  const DIAG_CARD = { 'short-r1': 't-partial', 'short-r2': 't-partial', 'short-total': 't-total', 'open-k': 't-open', 'blown-r1': 't-blown', none: 'e-ammeter' };
  function makeDiagnose() {
    for (let n = 0; n < 200; n++) {
      const arena = pick(['series', 'parallel']);
      const trap = pick(DIAG[arena])[0];
      const base = { arena, vsrc: pick(Vs), r1: pick(Rs), r2: pick(Rs), time: 10 };
      if (arena === 'parallel' && base.r1 === base.r2) continue;
      const m = calc(Object.assign({ trap }, base));
      const norm = calc(Object.assign({ trap: 'none' }, base));
      if (m.statusLevel === 'danger' && !m.isShortTotal) continue;
      const f = (x, u) => (Number.isFinite(x) ? num(x) + ' ' + u : '→ ∞');
      const readings = [['Αμπερόμετρο (Iολ)', trap === 'short-total' || (arena === 'parallel' && trap.startsWith('short')) ? 'ΥΠΕΡΒΟΛΙΚΟ (→ ∞)' : f(m.itot, 'A')], ['Βολτόμετρο στον R₁ (V₁)', f(m.v1, 'V')], ['Βολτόμετρο στον R₂ (V₂)', f(m.v2, 'V')], ['Βολτόμετρο στον διακόπτη K', f(m.vswitch, 'V')]];
      const text = (arena === 'series' ? 'Κύκλωμα ΣΕ ΣΕΙΡΑ' : 'ΠΑΡΑΛΛΗΛΟ κύκλωμα') + `: Vπηγ = <b>${base.vsrc} V</b>, R₁ = <b>${base.r1} Ω</b>, R₂ = <b>${base.r2} Ω</b>. Σε κανονική λειτουργία το αμπερόμετρο θα έδειχνε <b>${num(norm.itot)} A</b>. Τα όργανα τώρα δείχνουν όσα βλέπεις παρακάτω. <b>Τι βλάβη υπάρχει;</b>`;
      return { type: 'diagnose', sim: Object.assign({ trap }, base), m, trap, readings, text, options: DIAG[arena], card: DIAG_CARD[trap], tries: 0 };
    }
    return null;
  }

  const TF = [
    ['Στη σύνδεση σε σειρά το ρεύμα έχει την ίδια τιμή σε όλα τα στοιχεία.', true, 'Υπάρχει ένας μόνο δρόμος για τα φορτία, άρα I = I₁ = I₂.', 'a-series'],
    ['Στη σύνδεση σε σειρά, όταν καεί ένας αντιστάτης, οι υπόλοιποι συνεχίζουν να λειτουργούν.', false, 'Ο βρόχος ανοίγει και το ρεύμα γίνεται 0 A σε όλο το κύκλωμα.', 't-blown'],
    ['Στη παράλληλη σύνδεση η ισοδύναμη αντίσταση είναι μικρότερη από τη μικρότερη αντίσταση του κυκλώματος.', true, 'Προσθέτοντας κλάδους, δίνουμε στο ρεύμα περισσότερους δρόμους, άρα η Rολ μικραίνει.', 'a-parallel'],
    ['Ένας ανοικτός διακόπτης έχει στα άκρα του τάση ίση με την τάση της πηγής.', true, 'Χωρίς ρεύμα δεν υπάρχει πτώση τάσης στους αντιστάτες, άρα όλη η Vπηγ εμφανίζεται στο κενό του διακόπτη.', 't-open'],
    ['Το αμπερόμετρο συνδέεται παράλληλα με τον αντιστάτη του οποίου το ρεύμα μετράμε.', false, 'Το αμπερόμετρο συνδέεται ΣΕ ΣΕΙΡΑ. Παράλληλα, επειδή έχει σχεδόν μηδενική αντίσταση, προκαλεί βραχυκύκλωμα.', 'e-ammeter'],
    ['Το ιδανικό βολτόμετρο έχει πολύ μεγάλη (άπειρη) αντίσταση και συνδέεται παράλληλα.', true, 'Έτσι μετράει τη διαφορά δυναμικού χωρίς να «κλέβει» ρεύμα από το κύκλωμα.', 'e-voltmeter'],
    ['Στο μερικό βραχυκύκλωμα ενός αντιστάτη σε σειρά, το ολικό ρεύμα αυξάνεται.', true, 'Η ολική αντίσταση μειώνεται (ο αντιστάτης που παρακάμπτεται δεν μετράει), άρα I = V / Rολ μεγαλώνει.', 't-partial'],
    ['Στη παράλληλη σύνδεση ο μικρότερος αντιστάτης διαρρέεται από το μεγαλύτερο ρεύμα.', true, 'Όλοι οι κλάδοι έχουν την ίδια τάση, άρα I = V / R: μικρότερο R, μεγαλύτερο ρεύμα.', 'r-5'],
    ['Στη σύνδεση σε σειρά ο λόγος των τάσεων είναι V₁ / V₂ = R₁ / R₂.', true, 'Το ρεύμα είναι κοινό, άρα V₁ / V₂ = (I·R₁) / (I·R₂) = R₁ / R₂.', 'r-20'],
    ['Η αντίσταση ενός αντιστάτη μεγαλώνει όταν αυξάνουμε την τάση στα άκρα του.', false, 'Η αντίσταση εξαρτάται από το υλικό, το μήκος, το εμβαδόν διατομής και τη θερμοκρασία, όχι από τις τιμές V ή I.', 'r-10'],
    ['Στη παράλληλη σύνδεση η τάση στα άκρα κάθε κλάδου ισούται με την τάση της πηγής.', true, 'Όλοι οι κλάδοι συνδέονται στους ίδιους δύο κόμβους.', 'a-parallel'],
    ['Στη σύνδεση σε σειρά ισχύει P₁ / P₂ = R₁ / R₂, ενώ στη παράλληλη P₁ / P₂ = R₂ / R₁.', true, 'Στη σειρά το ρεύμα είναι κοινό (P = I²R), στα παράλληλα η τάση είναι κοινή (P = V²/R).', 'a-series'],
    ['Όταν διπλασιάζουμε την τάση στα άκρα ενός σταθερού αντιστάτη, η ισχύς του διπλασιάζεται.', false, 'Επειδή P = V² / R, η ισχύς τετραπλασιάζεται.', 'g-60'],
    ['Οι οικιακές συσκευές συνδέονται παράλληλα, ώστε αν χαλάσει μία να λειτουργούν οι υπόλοιπες.', true, 'Κάθε κλάδος είναι ανεξάρτητος και έχει την πλήρη τάση της πηγής.', 't-blown'],
    ['Η πηγή (μπαταρία) παράγει τα ηλεκτρόνια που κινούνται στο κύκλωμα.', false, 'Τα ελεύθερα ηλεκτρόνια υπάρχουν ήδη στους αγωγούς. Η πηγή δίνει ενέργεια (διαφορά δυναμικού) ώστε να κινούνται.', 'g-12'],
    ['Στη παράλληλη σύνδεση μπορείς να βραχυκυκλώσεις μόνο τον έναν κλάδο, χωρίς να επηρεαστεί ο άλλος.', false, 'Οι κλάδοι έχουν κοινούς κόμβους: το καλώδιο βραχυκυκλώνει και τον άλλο κλάδο και την πηγή.', 't-total']
  ];
  let tfPool = [];
  function makeTF() {
    if (!tfPool.length) tfPool = shuffle(TF.map((_, i) => i));
    const t = TF[tfPool.pop()];
    return { type: 'tf', text: t[0], truth: t[1], why: t[2], card: t[3], tries: 0 };
  }

  function makeBuild() {
    for (let n = 0; n < 300; n++) {
      const arena = pick(['series', 'parallel']);
      const goal = pick(['itot', 'req']);
      const sol = { arena, trap: 'none', vsrc: pick(Vs), r1: pick(Rs), r2: pick(Rs), time: 10 };
      if (arena === 'parallel' && sol.r1 === sol.r2) continue;
      const m = calc(sol);
      if (m.statusLevel === 'danger') continue;
      const target = goal === 'itot' ? m.itot : m.req;
      if (!clean(target)) continue;
      let start;
      do { start = { vsrc: pick(Vs), r1: pick(Rs), r2: pick(Rs) }; } while (Math.abs((goal === 'itot' ? calc(Object.assign({ arena, trap: 'none', time: 10 }, start)).itot : calc(Object.assign({ arena, trap: 'none', time: 10 }, start)).req) - target) < 0.01);
      const what = goal === 'itot' ? `ολικό ρεύμα Iολ = <b>${num(target)} A</b> και καμία υπερφόρτωση` : `ισοδύναμη αντίσταση Rολ = <b>${num(target)} Ω</b>`;
      return { type: 'build', arena, goal, target, cur: start, card: arena === 'series' ? 'a-series' : 'a-parallel', tries: 0,
        text: (arena === 'series' ? 'Κύκλωμα ΣΕ ΣΕΙΡΑ' : 'ΠΑΡΑΛΛΗΛΟ κύκλωμα') + `: ρύθμισε τα Vπηγ, R₁ και R₂ ώστε να έχεις ${what}. Υπάρχουν πολλές σωστές λύσεις!` };
    }
    return null;
  }

  /* ---------- round / scoring ---------- */
  const rank = () => { let r = RANKS[0]; RANKS.forEach((x) => { if (G.points >= x[0]) r = x; }); return r; };
  const nextRank = () => RANKS.find((x) => x[0] > G.points);

  function newRound() {
    const types = shuffle(['predict', 'predict', 'predict', 'predict', 'diagnose', 'diagnose', 'tf', 'tf', 'build', 'build']);
    R = { types, idx: 0, score: 0, base: 0, max: 0, streak: 0, correct: 0, done: false };
    nextMission();
  }
  function nextMission() {
    if (R.idx >= ROUND_LEN) { R.done = true; M = null; if (R.score > G.best) { G.best = R.score; } G.rounds++; save(); render(); return; }
    const t = R.types[R.idx];
    M = (t === 'predict' ? makePredict() : t === 'diagnose' ? makeDiagnose() : t === 'tf' ? makeTF() : makeBuild()) || makeTF();
    M.settled = false; M.fb = ''; M.max = M.type === 'tf' ? 5 : M.type === 'build' ? 15 : 10; R.max += M.max;
    render();
  }
  function award(base) {
    const bonus = R.streak >= 2 ? Math.min(6, (R.streak - 1) * 2) : 0;
    const pts = base + bonus;
    R.score += pts; R.base += base; G.points += pts; R.streak++; R.correct++;
    if (M.card && !G.won.includes(M.card)) { G.won.push(M.card); }
    save(); markWon();
    return { pts, bonus };
  }
  function miss() { R.streak = 0; save(); }

  /* ---------- rendering ---------- */
  const TYPE = { predict: ['🧮 Πρόβλεψη', ''], diagnose: ['🔍 Διάγνωση βλάβης', 't-diag'], tf: ['⚖️ Σωστό / Λάθος', 't-tf'], build: ['🎛️ Ρύθμιση κυκλώματος', 't-build'] };
  function hud() {
    const r = rank(), nx = nextRank();
    const pct = nx ? Math.round(((G.points - r[0]) / (nx[0] - r[0])) * 100) : 100;
    return `<div class="gm-hud">
      <div class="gm-stat"><span class="k">Πόντοι</span><span class="v">${G.points}</span></div>
      <div class="gm-stat"><span class="k">Βαθμίδα</span><span class="v cyan">${r[1]}</span><div class="gm-bar"><i style="width:${pct}%"></i></div>${nx ? `<span class="k" style="margin-top:4px">επόμενη: ${nx[1]} (${nx[0]})</span>` : ''}</div>
      <div class="gm-stat"><span class="k">Σερί σωστών</span><span class="v pink">${R ? R.streak : 0}${R && R.streak >= 3 ? ' 🔥' : ''}</span></div>
      <div class="gm-stat"><span class="k">Αποστολή</span><span class="v cyan">${R ? Math.min(R.idx + (M && M.settled ? 1 : 0), ROUND_LEN) : 0} / ${ROUND_LEN}</span><div class="gm-bar"><i style="width:${R ? Math.round(((R.idx + (M && M.settled ? 1 : 0)) / ROUND_LEN) * 100) : 0}%"></i></div></div>
      <div class="gm-stat"><span class="k">Κατακτημένες κάρτες</span><span class="v">${G.won.length} / ${CARDS.length}</span></div>
      <div class="gm-stat"><span class="k">Καλύτερος γύρος</span><span class="v">${G.best}</span></div></div>`;
  }
  function render() {
    const host = $('game-body'); if (!host) return;
    let h = hud();
    if (R && R.done) {
      const pct = R.max ? R.base / R.max : 0, stars = pct >= 0.85 ? 3 : pct >= 0.6 ? 2 : 1;
      h += `<div class="gm-card gm-summary"><div class="stars">${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}</div><h3>Τέλος γύρου!</h3>
        <p>Έκανες <b>${R.score}</b> πόντους (${R.base} από ${R.max} βασικούς, και ${R.score - R.base} από bonus σερί) και απάντησες σωστά σε <b>${R.correct}</b> από ${ROUND_LEN} αποστολές.</p>
        <p>Συνολικοί πόντοι: <b>${G.points}</b> · Βαθμίδα: <b>${rank()[1]}</b> · Κατακτημένες κάρτες: <b>${G.won.length} / ${CARDS.length}</b></p>
        <div class="gm-actions" style="justify-content:center"><button type="button" class="gm-btn is-primary" id="gm-again">▶ Νέος γύρος</button></div></div>`;
    } else if (M) {
      h += `<div class="gm-card"><div><span class="gm-chip ${TYPE[M.type][1]}">${TYPE[M.type][0]}</span><span class="gm-chip is-ghost" style="color:var(--on-surface-variant)">έως ${M.max} πόντοι</span></div>
        <div class="gm-q">${M.text}</div><div id="gm-work">${work()}</div><div id="gm-fb">${M.fb}</div><div class="gm-actions" id="gm-act">${actions()}</div></div>`;
    }
    host.innerHTML = h;
    bind();
  }
  function work() {
    if (M.type === 'predict') return `<div class="gm-answer"><input class="gm-input" id="gm-in" inputmode="decimal" autocomplete="off" placeholder="απάντηση" ${M.settled ? 'disabled' : ''}><span class="gm-unit">${M.unit}</span></div>`;
    if (M.type === 'tf') return `<div class="gm-opts"><button type="button" class="gm-opt" data-v="1" ${M.settled ? 'disabled' : ''}>✅ Σωστό</button><button type="button" class="gm-opt" data-v="0" ${M.settled ? 'disabled' : ''}>❌ Λάθος</button></div>`;
    if (M.type === 'diagnose') return `<div class="gm-meters">${M.readings.map((r) => `<div class="gm-meter"><span class="k">${r[0]}</span><span class="v">${r[1]}</span></div>`).join('')}</div>
      <div class="gm-opts">${M.options.map((o) => `<button type="button" class="gm-opt" data-t="${o[0]}" ${M.settled ? 'disabled' : ''}>${o[1]}</button>`).join('')}</div>`;
    if (M.type === 'build') return `<div class="gm-sliders">${[['vsrc', 'Vπηγ', 5, 60, 'V'], ['r1', 'R₁', 2, 60, 'Ω'], ['r2', 'R₂', 2, 60, 'Ω']].map((s) => `<div class="gm-sl"><label>${s[1]} <b id="gl-${s[0]}">${M.cur[s[0]]} ${s[4]}</b></label><input type="range" min="${s[2]}" max="${s[3]}" step="1" value="${M.cur[s[0]]}" data-k="${s[0]}" ${M.settled ? 'disabled' : ''}></div>`).join('')}</div><div class="gm-live" id="gm-live"></div>`;
    return '';
  }
  function actions() {
    if (M.settled) return `<button type="button" class="gm-btn is-primary" id="gm-next">${R.idx + 1 >= ROUND_LEN ? 'Δες το αποτέλεσμα ➜' : 'Επόμενη αποστολή ➜'}</button>${M.sim ? '<button type="button" class="gm-btn is-ghost" id="gm-show">Δες το στον προσομοιωτή</button>' : ''}`;
    if (M.type === 'predict') return '<button type="button" class="gm-btn" id="gm-check">Έλεγχος</button><button type="button" class="gm-btn is-ghost" id="gm-hint">💡 Βοήθεια (−3)</button>';
    if (M.type === 'build') return '<button type="button" class="gm-btn" id="gm-check">Έλεγχος</button>';
    return '';
  }
  function bind() {
    const on = (id, fn) => { const e = $(id); if (e) e.addEventListener('click', fn); };
    on('gm-again', () => { newRound(); });
    on('gm-next', () => { R.idx++; nextMission(); });
    on('gm-show', showInSim);
    on('gm-check', check); on('gm-hint', hint);
    const inp = $('gm-in'); if (inp) { inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') check(); }); if (!M.settled) inp.focus(); }
    document.querySelectorAll('#gm-work .gm-opt').forEach((b) => b.addEventListener('click', () => answerOpt(b)));
    document.querySelectorAll('#gm-work input[type=range]').forEach((s) => s.addEventListener('input', () => { M.cur[s.dataset.k] = +s.value; $('gl-' + s.dataset.k).textContent = s.value + (s.dataset.k === 'vsrc' ? ' V' : ' Ω'); live(); }));
    if (M && M.type === 'build') live();
  }
  function setFb(cls, html) { M.fb = `<div class="gm-fb ${cls}">${html}</div>`; const f = $('gm-fb'); if (f) f.innerHTML = M.fb; }
  const steps = (m) => (m.proof || []).map((p) => `<p>${p}</p>`).join('');

  function check() {
    if (!M || M.settled) return;
    if (M.type === 'predict') {
      const raw = ($('gm-in').value || '').trim().replace(',', '.');
      const x = parseFloat(raw);
      if (!raw || Number.isNaN(x)) { setFb('hint', 'Γράψε έναν αριθμό (π.χ. 2,4).'); return; }
      const ok = Math.abs(x - M.ans) <= Math.max(0.02, Math.abs(M.ans) * 0.01);
      M.tries++;
      if (ok) {
        const base = (M.tries === 1 ? 10 : 5) - (M.hinted ? 3 : 0);
        const a = award(Math.max(base, 2)); M.settled = true;
        setFb('ok', `<strong class="ok">✔ Σωστά!</strong> +${a.pts} πόντοι${a.bonus ? ` (μαζί με bonus σερί +${a.bonus})` : ''}. Η σωστή τιμή είναι ${num(M.ans)} ${M.unit}.${steps(M.m)}`);
      } else if (M.tries >= 2) {
        M.settled = true; miss();
        setFb('bad', `<strong class="bad">✘ Όχι αυτή τη φορά.</strong> Η σωστή απάντηση είναι <b>${num(M.ans)} ${M.unit}</b>. Δες πώς βγαίνει:${steps(M.m)}`);
      } else {
        setFb('bad', '<strong class="bad">✘ Όχι ακριβώς.</strong> Έχεις άλλη μία προσπάθεια (θα πάρεις λιγότερους πόντους). Έλεγξε τον τύπο ή πάτησε «Βοήθεια».');
        $('gm-in').select();
        return;
      }
    } else if (M.type === 'build') {
      const m = calc({ arena: M.arena, trap: 'none', vsrc: M.cur.vsrc, r1: M.cur.r1, r2: M.cur.r2, time: 10 });
      const val = M.goal === 'itot' ? m.itot : m.req;
      const ok = Math.abs(val - M.target) <= (M.goal === 'itot' ? 0.02 : 0.05) && (M.goal === 'req' || m.statusLevel !== 'danger');
      M.tries++;
      if (!ok) { setFb('bad', `<strong class="bad">✘ Δεν είσαι ακόμα εκεί.</strong> Τώρα έχεις ${M.goal === 'itot' ? 'Iολ = ' + num(m.itot) + ' A' : 'Rολ = ' + num(m.req) + ' Ω'}${M.goal === 'itot' && m.statusLevel === 'danger' ? ' και υπάρχει υπερφόρτωση' : ''}. Συνέχισε να ρυθμίζεις.`); return; }
      const a = award(M.tries === 1 ? 15 : 8); M.settled = true; M.sim = { arena: M.arena, trap: 'none', vsrc: M.cur.vsrc, r1: M.cur.r1, r2: M.cur.r2, time: 10 }; M.m = m;
      setFb('ok', `<strong class="ok">✔ Μπράβο!</strong> +${a.pts} πόντοι${a.bonus ? ` (μαζί με bonus σερί +${a.bonus})` : ''}.${steps(m)}`);
    }
    render();
  }
  function hint() {
    if (!M || M.settled || M.type !== 'predict') return;
    M.hinted = true; setFb('hint', '<strong>💡 Βοήθεια:</strong> ' + M.hint);
  }
  function answerOpt(b) {
    if (!M || M.settled) return;
    if (M.type === 'tf') {
      const ok = (b.dataset.v === '1') === M.truth; M.settled = true;
      if (ok) { const a = award(5); setFb('ok', `<strong class="ok">✔ Σωστά!</strong> +${a.pts} πόντοι${a.bonus ? ` (bonus σερί +${a.bonus})` : ''}. ${M.why}`); }
      else { miss(); setFb('bad', `<strong class="bad">✘ Λάθος.</strong> Η πρόταση είναι ${M.truth ? '<b>σωστή</b>' : '<b>λανθασμένη</b>'}. ${M.why}`); }
      render();
    } else if (M.type === 'diagnose') {
      const ok = b.dataset.t === M.trap; M.tries++;
      if (ok) {
        const a = award(M.tries === 1 ? 10 : 5); M.settled = true;
        setFb('ok', `<strong class="ok">✔ Σωστή διάγνωση!</strong> +${a.pts} πόντοι${a.bonus ? ` (bonus σερί +${a.bonus})` : ''}. ${M.m.statusTitle}<p>${M.m.statusDesc}</p>`); render();
      } else if (M.tries >= 2) {
        M.settled = true; miss();
        const right = M.options.find((o) => o[0] === M.trap)[1];
        setFb('bad', `<strong class="bad">✘ Όχι.</strong> Η βλάβη ήταν: <b>${right}</b>.<p>${M.m.statusDesc}</p>${steps(M.m)}`); render();
      } else {
        b.classList.add('is-wrong'); b.disabled = true;
        setFb('bad', '<strong class="bad">✘ Όχι αυτή.</strong> Έχεις άλλη μία προσπάθεια. Σκέψου: τι δείχνει το αμπερόμετρο; Πού εμφανίζεται η τάση της πηγής;');
      }
    }
  }
  function live() {
    const e = $('gm-live'); if (!e || !M) return;
    const m = calc({ arena: M.arena, trap: 'none', vsrc: M.cur.vsrc, r1: M.cur.r1, r2: M.cur.r2, time: 10 });
    e.innerHTML = `<span>Rολ = ${num(m.req)} Ω</span><span>Iολ = ${num(m.itot)} A</span><span class="${m.statusLevel === 'danger' ? 'bad' : ''}">${m.statusLevel === 'danger' ? '⚠ υπερφόρτωση' : '✔ εντός ορίων'}</span>`;
  }
  function showInSim() {
    if (!M || !M.sim) return;
    appState.sim = Object.assign({}, appState.sim, M.sim); syncSimulatorControls(); updateSimulator(); persistState();
    const s = $('simulator-section'); if (s) s.scrollIntoView({ behavior: 'smooth' });
  }

  /* ---------- conquered cards ---------- */
  function markWon() { document.querySelectorAll('.card-scene').forEach((c) => c.classList.toggle('is-won', G.won.includes(c.dataset.id))); }
  const _renderDeck = window.renderDeck;
  window.renderDeck = function () { _renderDeck.apply(this, arguments); markWon(); };

  /* ---------- mode switch ---------- */
  function setMode(mode) {
    const game = mode === 'game';
    document.body.classList.toggle('mode-game', game);
    $('mode-free').setAttribute('aria-pressed', String(!game)); $('mode-game').setAttribute('aria-pressed', String(game));
    $('mode-note').textContent = game ? 'Λύσε αποστολές, κέρδισε πόντους και κατάκτησε κάρτες. Οι κάρτες και ο προσομοιωτής παραμένουν παρακάτω.' : 'Μελέτησε τις κάρτες και δοκίμασε τον προσομοιωτή με τον δικό σου ρυθμό.';
    if (game) { if (!R) newRound(); else render(); const g = $('game-section'); if (g) g.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  }
  function init() {
    const head = document.querySelector('.masthead'); if (!head) return;
    const bar = document.createElement('div'); bar.className = 'mode-bar';
    bar.innerHTML = '<span class="mode-label">Τρόπος χρήσης</span><button type="button" class="mode-btn" id="mode-free" aria-pressed="true">📖 Ελεύθερη μελέτη</button><button type="button" class="mode-btn is-game" id="mode-game" aria-pressed="false">🎮 Αποστολές (παιχνίδι)</button><span class="mode-note" id="mode-note"></span>';
    head.after(bar);
    const sec = document.createElement('section'); sec.id = 'game-section'; sec.className = 'section-block';
    sec.innerHTML = '<div class="section-header"><div><p class="kicker">ΤΡΟΠΟΣ ΠΑΙΧΝΙΔΙΟΥ • ΑΠΟΣΤΟΛΕΣ</p><h2>Αποστολές Κυκλωμάτων</h2><p class="section-sub">Κάθε γύρος έχει 10 αποστολές: προβλέψεις, διάγνωση βλαβών, σωστό/λάθος και ρύθμιση κυκλώματος. Σωστές απαντήσεις δίνουν πόντους, bonus σερί και κατακτούν κάρτες.</p></div></div><div id="game-body"></div>';
    bar.after(sec);
    $('mode-free').addEventListener('click', () => setMode('free'));
    $('mode-game').addEventListener('click', () => setMode('game'));
    setMode('free');
    markWon();
  }
  window.CircuitDuelistsGame = { state: () => ({ M, R, G }) };   // read-only peek, used for testing
  document.addEventListener('DOMContentLoaded', () => setTimeout(init, 0));
})();
