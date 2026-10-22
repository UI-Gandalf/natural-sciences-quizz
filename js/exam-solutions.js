/**
 * ==============================================================================
 * Γυμνάσιο Νέας Ερυθραίας - Φυσικές Επιστήμες
 * Υποδειγματική Επίλυση Ενδεικτικού Διαγωνίσματος και Συναφής Θεωρία
 * Ενότητα: Ηλεκτρικό Ρεύμα & Συνδεσμολογίες Αντιστατών (Φυσική Γ΄ Γυμνασίου)
 * Επιμέλεια & Επιστημονική Συγγραφή: Δημήτρης Μητσάκης, Φυσικός
 * ==============================================================================
 */

window.ExamSolutionsGuide = (function() {
    'use strict';

    let currentFilter = 'all';

    function scrollToSection(e, secId) {
        if (e && e.preventDefault) e.preventDefault();
        const target = document.getElementById(secId);
        if (target) {
            const nav = document.getElementById('exam-sticky-nav');
            const offset = nav ? nav.offsetHeight + 24 : 90;
            const pos = target.getBoundingClientRect().top + window.pageYOffset - offset;
            window.scrollTo({ top: pos, behavior: 'smooth' });

            // Update active pill
            document.querySelectorAll('.exam-nav-pill').forEach(pill => {
                pill.classList.remove('active');
                if (pill.getAttribute('href') === '#' + secId) {
                    pill.classList.add('active');
                }
            });
        }
    }

    function setFilter(filterType) {
        currentFilter = filterType;
        document.querySelectorAll('.exam-filter-pill').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-filter') === filterType);
        });

        const secA1 = document.getElementById('exam-sec-thema-a1');
        const secA2 = document.getElementById('exam-sec-thema-a2');
        const secShort1 = document.getElementById('exam-sec-series-short');
        const secShort2 = document.getElementById('exam-sec-parallel-short');

        if (filterType === 'all') {
            document.querySelectorAll('.exam-section').forEach(s => s.style.display = 'block');
        } else if (filterType === 'thema_a1') {
            document.querySelectorAll('.exam-section').forEach(s => s.style.display = 'block');
            scrollToSection(null, 'exam-sec-thema-a1');
        } else if (filterType === 'thema_a2') {
            document.querySelectorAll('.exam-section').forEach(s => s.style.display = 'block');
            scrollToSection(null, 'exam-sec-thema-a2');
        } else if (filterType === 'short_circuits') {
            document.querySelectorAll('.exam-section').forEach(s => s.style.display = 'block');
            scrollToSection(null, 'exam-sec-series-short');
        }
    }


    // ==============================================================================
    // INLINE DIAGRAM TOGGLE (THEMA A1 & THEMA A2)
    // Opens directly above the question prompt, centered in the middle of the card
    // ==============================================================================
    function toggleDiagram(questionId, topicKey) {
        const drawer = document.getElementById('diag-drawer-' + questionId);
        const btn = document.getElementById('btn-diag-' + questionId);
        if (!drawer || !btn) return;

        const isClosed = drawer.style.display === 'none' || !drawer.style.display;
        if (isClosed) {
            drawer.style.display = 'block';
            btn.classList.add('is-open');
            const arrow = btn.querySelector('.diag-btn-arrow');
            if (arrow) arrow.textContent = '▴';
            
            // Render MathJax if needed in drawer specs
            if (window.renderMath) {
                window.renderMath(drawer);
            } else if (window.MathJax && window.MathJax.typesetPromise) {
                window.MathJax.typesetPromise([drawer]).catch(() => {});
            }
        } else {
            drawer.style.display = 'none';
            btn.classList.remove('is-open');
            const arrow = btn.querySelector('.diag-btn-arrow');
            if (arrow) arrow.textContent = '▾';
        }
    }

    function toggleSolution(id) {
        const solEl = document.getElementById('sol-' + id);
        const btnEl = document.getElementById('btn-sol-' + id);
        if (solEl && btnEl) {
            const isHidden = solEl.style.display === 'none' || !solEl.style.display;
            solEl.style.display = isHidden ? 'block' : 'none';
            btnEl.classList.toggle('is-open', isHidden);
            btnEl.innerHTML = isHidden 
                ? '<span>💡</span><span>Επίλυση</span><span class="sol-btn-arrow">▴</span>' 
                : '<span>💡</span><span>Επίλυση</span><span class="sol-btn-arrow">▾</span>';
            if (isHidden && window.renderMath) {
                window.renderMath(solEl);
            } else if (isHidden && window.MathJax && window.MathJax.typesetPromise) {
                window.MathJax.typesetPromise([solEl]).catch(function(err) { console.warn(err); });
            }
        }
    }

    function toggleAllSolutions(expand) {
        document.querySelectorAll('.exam-solution-body').forEach(function(el) {
            el.style.display = expand ? 'block' : 'none';
        });
        document.querySelectorAll('.exam-sol-toggle-btn').forEach(function(btn) {
            btn.classList.toggle('is-open', expand);
            btn.innerHTML = expand 
                ? '<span>💡</span><span>Επίλυση</span><span class="sol-btn-arrow">▴</span>' 
                : '<span>💡</span><span>Επίλυση</span><span class="sol-btn-arrow">▾</span>';
        });
        if (expand && window.renderMath) {
            window.renderMath(document.getElementById('exam-solutions-mount'));
        } else if (expand && window.MathJax && window.MathJax.typesetPromise) {
            window.MathJax.typesetPromise().catch(function(err) { console.warn(err); });
        }
    }

    // ==============================================================================
    // INTERACTIVE QUIZ MODE FOR EXAM QUESTIONS (ALLOW 2 ATTEMPTS)
    // ==============================================================================
    const CORRECT_ANSWERS = {
        'a1-1': 1,
        'a1-2': 3,
        'a1-3': 0,
        'a1-4': 3,
        'a1-5': 4,
        'a1-6': 2,
        'a1-7': 6,
        'a1-8': 7,
        'a1-9': 5,
        'a1-10': 1,
        'a1-11': 6,
        'a1-12': 4,
        'a1-13': 1,
        'a1-14': 2,
        'a1-15': 3,
        'a2-1': 6,
        'a2-2': 5,
        'a2-3': 2,
        'a2-4': 1,
        'a2-5': 5,
        'a2-6': 5,
        'a2-7': 0,
        'a2-8': 3,
        'a2-9': 1,
        'a2-10': 3,
        'a2-11': 0,
        'a2-12': 4,
        'a2-13': 7,
        'a2-14': 5,
        'a2-15': 1
    };

    const questionStates = {};

    function openSolution(id) {
        const solEl = document.getElementById('sol-' + id);
        const btnEl = document.getElementById('btn-sol-' + id);
        if (solEl && btnEl) {
            solEl.style.display = 'block';
            btnEl.classList.add('is-open');
            btnEl.innerHTML = '<span>💡</span><span>Επίλυση</span><span class="sol-btn-arrow">▴</span>';
            if (window.renderMath) {
                window.renderMath(solEl);
            } else if (window.MathJax && window.MathJax.typesetPromise) {
                window.MathJax.typesetPromise([solEl]).catch(function(err) { console.warn(err); });
            }
        }
    }

    function checkAnswer(qid, optIndex) {
        const correctIdx = CORRECT_ANSWERS[qid];
        if (correctIdx === undefined) return;

        if (!questionStates[qid]) {
            questionStates[qid] = { attempts: 0, finished: false };
        }
        const state = questionStates[qid];
        if (state.finished) return;

        const optGrid = document.getElementById('opts-grid-' + qid);
        if (!optGrid) return;
        const btns = optGrid.querySelectorAll('.exam-opt-pill');
        const clickedBtn = btns[optIndex];
        if (!clickedBtn || clickedBtn.disabled) return;

        const feedbackEl = document.getElementById('feedback-' + qid);

        state.attempts++;

        if (optIndex === correctIdx) {
            // Correct answer on 1st or 2nd attempt!
            state.finished = true;
            clickedBtn.classList.add('is-correct');
            if (!clickedBtn.querySelector('.opt-check')) {
                const check = document.createElement('span');
                check.className = 'opt-check';
                check.innerHTML = '✓ Σωστή';
                clickedBtn.appendChild(check);
            }

            // Disable all options in this grid
            btns.forEach(function(btn) { btn.disabled = true; });

            if (feedbackEl) {
                feedbackEl.style.display = 'block';
                const attemptText = state.attempts === 1 ? 'στην 1η προσπάθεια' : 'στη 2η προσπάθεια';
                feedbackEl.innerHTML = `
                    <div class="exam-feedback-alert success">
                        <div class="exam-feedback-alert-text">
                            <span style="font-size: 1.15rem;">✓</span>
                            <span><strong>Μπράβο! Σωστή επιλογή ${attemptText}!</strong> Η αναλυτική επίλυση αποκαλύφθηκε αυτόματα παρακάτω.</span>
                        </div>
                        <button type="button" class="exam-reset-btn" onclick="ExamSolutionsGuide.resetQuestion('${qid}')">
                            <span>🔄</span><span>Δοκιμή ξανά</span>
                        </button>
                    </div>
                `;
            }

            // Automatically reveal the explanation!
            openSolution(qid);

        } else {
            // Incorrect answer
            clickedBtn.classList.add('is-wrong');
            clickedBtn.disabled = true;
            if (!clickedBtn.querySelector('.opt-wrong-badge')) {
                const badge = document.createElement('span');
                badge.className = 'opt-wrong-badge';
                badge.innerHTML = state.attempts === 1 ? '✗ 1η προσπάθεια' : '✗ Λάθος';
                clickedBtn.appendChild(badge);
            }

            if (state.attempts < 2) {
                // First failed attempt: DO NOT reveal answer or explanation yet!
                if (feedbackEl) {
                    feedbackEl.style.display = 'block';
                    feedbackEl.innerHTML = `
                        <div class="exam-feedback-alert warning">
                            <div class="exam-feedback-alert-text">
                                <span style="font-size: 1.15rem;">⚠️</span>
                                <span><strong>1η προσπάθεια μη σωστή.</strong> Έχετε <strong>άλλη 1 προσπάθεια</strong> πριν αποκαλυφθεί η σωστή απάντηση και η επίλυση. Δοκιμάστε ξανά!</span>
                            </div>
                        </div>
                    `;
                }
            } else {
                // Second failed attempt: 2 failed attempts exhausted!
                state.finished = true;
                btns.forEach(function(btn) { btn.disabled = true; });

                // Reveal the correct answer!
                const correctBtn = btns[correctIdx];
                if (correctBtn) {
                    correctBtn.classList.add('is-correct');
                    if (!correctBtn.querySelector('.opt-check')) {
                        const check = document.createElement('span');
                        check.className = 'opt-check';
                        check.innerHTML = '✓ Σωστή Απάντηση';
                        correctBtn.appendChild(check);
                    }
                }

                if (feedbackEl) {
                    feedbackEl.style.display = 'block';
                    feedbackEl.innerHTML = `
                        <div class="exam-feedback-alert danger">
                            <div class="exam-feedback-alert-text">
                                <span style="font-size: 1.15rem;">✗</span>
                                <span><strong>Εξαντλήθηκαν οι 2 προσπάθειες.</strong> Αποκαλύφθηκε η σωστή απάντηση παραπάνω και η αναλυτική επίλυση παρακάτω.</span>
                            </div>
                            <button type="button" class="exam-reset-btn" onclick="ExamSolutionsGuide.resetQuestion('${qid}')">
                                <span>🔄</span><span>Δοκιμή ξανά</span>
                            </button>
                        </div>
                    `;
                }

                // Automatically reveal the explanation!
                openSolution(qid);
            }
        }
    }

    function resetQuestion(qid) {
        questionStates[qid] = { attempts: 0, finished: false };
        const optGrid = document.getElementById('opts-grid-' + qid);
        if (optGrid) {
            const btns = optGrid.querySelectorAll('.exam-opt-pill');
            btns.forEach(function(btn) {
                btn.disabled = false;
                btn.classList.remove('is-correct', 'is-wrong');
                const check = btn.querySelector('.opt-check');
                if (check) check.remove();
                const wrong = btn.querySelector('.opt-wrong-badge');
                if (wrong) wrong.remove();
            });
        }
        const feedbackEl = document.getElementById('feedback-' + qid);
        if (feedbackEl) {
            feedbackEl.style.display = 'none';
            feedbackEl.innerHTML = '';
        }
        const solEl = document.getElementById('sol-' + qid);
        const btnEl = document.getElementById('btn-sol-' + qid);
        if (solEl && btnEl) {
            solEl.style.display = 'none';
            btnEl.classList.remove('is-open');
            btnEl.innerHTML = '<span>💡</span><span>Επίλυση</span><span class="sol-btn-arrow">▾</span>';
        }
    }

    function render(container) {
        if (!container) return;

        container.innerHTML = `
            <div class="theory-guide-wrapper exam-guide-wrapper">

                <!-- HERO BANNER -->
                <div class="theory-hero-banner glass-card" style="border-color: rgba(59, 130, 246, 0.4); background: linear-gradient(135deg, rgba(37, 99, 235, 0.15), rgba(15, 23, 42, 0.75));">
                    <div class="theory-hero-meta">
                        <span class="theory-tag-pill" style="border-color: rgba(59, 130, 246, 0.4); color: #93c5fd;">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: -1px; margin-right: 4px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>Υποδειγματική Επίλυση Ενδεικτικού Διαγωνίσματος
                        </span>
                        <span class="theory-tag-pill theme-tag">Φυσική Γ΄ Γυμνασίου</span>
                        <span class="theory-tag-pill page-tag">70 Σελίδες Επίσημου Οδηγού (5.9 MB)</span>
                        <span class="theory-tag-pill" style="border-color: rgba(245, 158, 11, 0.4); color: #fcd34d;">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: -1px; margin-right: 4px;"><path d="M12 19l7-7 3 3-7 7-3-3z"></path><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path><path d="M2 2l7.586 7.586"></path><circle cx="11" cy="11" r="2"></circle></svg>Δημήτρης Μητσάκης, Φυσικός
                        </span>
                    </div>

                    <h1 class="theory-hero-title" style="font-size: 2.2rem;">
                        Υποδειγματική Επίλυση Ενδεικτικού Διαγωνίσματος & Συναφής Θεωρία
                    </h1>
                    <p class="theory-hero-subtitle" style="font-size: 1.05rem;">
                        Οδηγίες Ορθής Μελέτης, Τεχνικές, Ερμηνείες και Πλήρης Βήμα-προς-Βήμα Επίλυση Τυπικού Διαγωνίσματος 
                        στο Ηλεκτρικό Ρεύμα & τις Συνδεσμολογίες Αντιστατών (Σειρά & Παράλληλα).
                        Καλύπτει και τα 30 επιμέρους ερωτήματα, τον υπολογιστικό τροχό (12 τύποι), εναλλακτικές μεθόδους δυναμικού κόμβων,
                        διακόπτες και ανάλυση βραχυκυκλώματος.
                    </p>

                    <!-- QUICK ACTIONS BAR -->
                    <div class="theory-actions-bar">
                        <a href="assets/docs/physics_g_exam_solutions_guide_2026.pdf" target="_blank" download class="theory-btn theory-btn-primary" style="background: linear-gradient(135deg, #2563eb, #1d4ed8); border-color: rgba(255,255,255,0.25);" title="Λήψη του επίσημου πολυσέλιδου PDF του Δ. Μητσάκη">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                            <span>Λήψη Πλήρους Επίσημου PDF (70 Σελίδες - 5.9 MB)</span>
                        </a>
                        <button class="theory-btn theory-btn-secondary" onclick="switchSubjectTab('theory')" title="Μετάβαση στον Συμπυκνωμένο Οδηγό Θεωρίας & Επίλυσης">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                            <span>Θεωρία & Επίλυση Κυκλωμάτων</span>
                        </button>
                        <button class="theory-btn theory-btn-secondary" onclick="switchSubjectTab('simulation')" title="Άνοιγμα του Εικονικού Εργαστηρίου Κυκλωμάτων">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                            <span>Εικονικό Εργαστήριο Προσομοίωσης</span>
                        </button>
                    </div>
                </div>

                <!-- STICKY TABLE OF CONTENTS NAV -->
                <nav class="theory-sticky-nav" id="exam-sticky-nav" style="background: rgba(15, 23, 42, 0.92); border-color: rgba(59, 130, 246, 0.35);">
                    <div class="theory-nav-inner">
                        <a href="#exam-sec-intro" class="theory-nav-pill exam-nav-pill active" onclick="ExamSolutionsGuide.scrollToSection(event, 'exam-sec-intro')">1. Οδηγίες Μελέτης</a>
                        <a href="#exam-sec-fundamentals" class="theory-nav-pill exam-nav-pill" onclick="ExamSolutionsGuide.scrollToSection(event, 'exam-sec-fundamentals')">2. Μεγέθη, Όργανα & Δυναμικό</a>
                        <a href="#exam-sec-wheel" class="theory-nav-pill exam-nav-pill" onclick="ExamSolutionsGuide.scrollToSection(event, 'exam-sec-wheel')">3. Υπολογιστική Ρόδα (12 Τύποι)</a>
                        <a href="#exam-sec-thema-a1" class="theory-nav-pill exam-nav-pill" onclick="ExamSolutionsGuide.scrollToSection(event, 'exam-sec-thema-a1')">4. Θέμα Α1: Σειρά (15 Ερωτήματα)</a>
                        <a href="#exam-sec-series-short" class="theory-nav-pill exam-nav-pill" onclick="ExamSolutionsGuide.scrollToSection(event, 'exam-sec-series-short')">5. Βραχυκύκλωμα στη Σειρά</a>
                        <a href="#exam-sec-thema-a2" class="theory-nav-pill exam-nav-pill" onclick="ExamSolutionsGuide.scrollToSection(event, 'exam-sec-thema-a2')">6. Θέμα Α2: Παράλληλα (15 Ερωτήματα)</a>
                        <a href="#exam-sec-parallel-short" class="theory-nav-pill exam-nav-pill" onclick="ExamSolutionsGuide.scrollToSection(event, 'exam-sec-parallel-short')">7. Βραχυκύκλωμα & Διακοπή</a>
                        <a href="#exam-sec-summary" class="theory-nav-pill exam-nav-pill" onclick="ExamSolutionsGuide.scrollToSection(event, 'exam-sec-summary')">8. Συγκριτικός Πίνακας</a>
                    </div>
                </nav>

                <!-- INTERACTIVE TOOLBAR: FILTER & EXPAND/COLLAPSE -->
                <div class="exam-toolbar glass-card" style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 14px; padding: 14px 20px; border-radius: 16px;">
                    <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                        <span style="font-weight: 700; font-size: 0.88rem; color: var(--text-muted); display: inline-flex; align-items: center; gap: 6px;">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
                            Γρήγορη Εστίαση:
                        </span>
                        <button class="exam-filter-pill active" data-filter="all" onclick="ExamSolutionsGuide.setFilter('all')">Όλα (Πλήρης Μελέτη)</button>
                        <button class="exam-filter-pill" data-filter="thema_a1" onclick="ExamSolutionsGuide.setFilter('thema_a1')">Θέμα Α1: Σειρά</button>
                        <button class="exam-filter-pill" data-filter="thema_a2" onclick="ExamSolutionsGuide.setFilter('thema_a2')">Θέμα Α2: Παράλληλα</button>
                        <button class="exam-filter-pill" data-filter="short_circuits" onclick="ExamSolutionsGuide.setFilter('short_circuits')">Βραχυκυκλώματα & Διακόπτες</button>
                    </div>

                    <div style="display: flex; gap: 8px;">
                        <button class="exam-action-btn" onclick="ExamSolutionsGuide.toggleAllSolutions(true)" title="Άνοιγμα όλων των αναλυτικών απαντήσεων">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                            <span>Εμφάνιση Όλων</span>
                        </button>
                        <button class="exam-action-btn" onclick="ExamSolutionsGuide.toggleAllSolutions(false)" title="Σύμπτυξη όλων για δοκιμή αυτοαξιολόγησης">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                            <span>Απόκρυψη Όλων (Self-Test)</span>
                        </button>
                    </div>
                </div>

                <!-- ==============================================================
                     SECTION 1: ΟΔΗΓΙΕΣ ΟΡΘΗΣ ΜΕΛΕΤΗΣ ΚΑΙ ΠΡΟΕΤΟΙΜΑΣΙΑΣ
                     ============================================================== -->
                <section class="theory-section exam-section glass-card" id="exam-sec-intro">
                    <div class="sec-header">
                        <div class="sec-number-badge" style="background: linear-gradient(135deg, #2563eb, #1d4ed8);">01</div>
                        <div class="sec-header-text">
                            <h2 class="sec-title">Οδηγίες Ορθής Μελέτης & Προετοιμασίας</h2>
                            <p class="sec-subtitle">Στρατηγική μελέτης, αποφυγή μηχανικής αποστήθισης και ενεργειακή κατανόηση του κυκλώματος</p>
                        </div>
                    </div>

                    <div class="concept-alert" style="background: rgba(37, 99, 235, 0.12); border-color: rgba(37, 99, 235, 0.35);">
                        <div class="alert-icon">💡</div>
                        <div class="alert-body">
                            <strong>Το Μήνυμα του Καθηγητή (Δημήτρης Μητσάκης):</strong>
                            <p style="margin-top: 6px;">
                                <em>«Σας παρακαλώ να διαβάσετε πολύ προσεκτικά την εισαγωγή και ακολουθήστε ευλαβικά τις οδηγίες, ώστε να μεγιστοποιήσετε το όφελός σας από το χρόνο που θα επενδύσετε στη μελέτη αυτών των σημειώσεων και να κεφαλοποιήσετε το κέρδος από το στέρεο επίπεδο γνώσης που θα αποκτήσετε.»</em>
                            </p>
                        </div>
                    </div>

                    <div class="exam-pro-grid" style="grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));">
                        <div class="exam-pro-card theme-cyan">
                            <div class="exam-pro-header">
                                <div class="exam-pro-icon-box cyan">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                        <polyline points="15 3 21 3 21 9"></polyline>
                                        <line x1="10" y1="14" x2="21" y2="3"></line>
                                    </svg>
                                </div>
                                <div class="exam-pro-title-wrap">
                                    <span class="exam-pro-tag cyan">Μέθοδος Σκέψης</span>
                                    <h3 class="exam-pro-title">Όχι στη Στείρα Αποστήθιση</h3>
                                </div>
                            </div>
                            <p class="exam-pro-item-desc" style="font-size: 0.92rem; line-height: 1.6;">
                                Στη Φυσική των κυκλωμάτων η επιτυχία βασίζεται στην <strong>ουσιαστική κατανόηση της φυσικής πραγματικότητας</strong>: τι αντιπροσωπεύει το ρεύμα, πώς κινείται σε κλειστό βρόγχο και πώς επιμερίζεται η δυναμική ενέργεια.
                            </p>
                        </div>

                        <div class="exam-pro-card theme-emerald">
                            <div class="exam-pro-header">
                                <div class="exam-pro-icon-box emerald">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <polyline points="23 4 23 10 17 10"></polyline>
                                        <polyline points="1 20 1 14 7 14"></polyline>
                                        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                                    </svg>
                                </div>
                                <div class="exam-pro-title-wrap">
                                    <span class="exam-pro-tag emerald">Θεμελιώδης Αρχή</span>
                                    <h3 class="exam-pro-title">Η Έννοια του Κλειστού Βρόγχου</h3>
                                </div>
                            </div>
                            <p class="exam-pro-item-desc" style="font-size: 0.92rem; line-height: 1.6;">
                                Το ηλεκτρικό ρεύμα απαιτεί <strong>αδιάλειπτο αγώγιμο δρόμο</strong>. Οποιαδήποτε διακοπή (ανοιχτός διακόπτης, καμένη λάμπα σε σειρά) μηδενίζει ακαριαία τη ροή φορτίου σε ολόκληρο τον βρόγχο ($I = 0$).
                            </p>
                        </div>

                        <div class="exam-pro-card theme-purple">
                            <div class="exam-pro-header">
                                <div class="exam-pro-icon-box purple">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <polygon points="23 7 16 12 23 17 23 7"></polygon>
                                        <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                                    </svg>
                                </div>
                                <div class="exam-pro-title-wrap">
                                    <span class="exam-pro-tag purple">Οπτικοακουστικό Υλικό</span>
                                    <h3 class="exam-pro-title">4 Υποστηρικτικά Βίντεο YouTube</h3>
                                </div>
                            </div>
                            <p class="exam-pro-item-desc" style="font-size: 0.92rem; line-height: 1.6;">
                                Το διαγώνισμα συνοδεύεται από 4 αναλυτικά εκπαιδευτικά βίντεο στο YouTube του φυσικού Δημήτρη Μητσάκη, που αναλύουν βήμα-βήμα τη λογική των κυκλωμάτων και την πειραματική επαλήθευση.
                            </p>
                        </div>
                    </div>
                </section>

                <!-- ==============================================================
                     SECTION 2: ΘΕΜΕΛΙΩΔΗ ΜΕΓΕΘΗ, ΟΡΓΑΝΑ & ΔΥΝΑΜΙΚΟ ΚΟΜΒΩΝ
                     ============================================================== -->
                <section class="theory-section exam-section glass-card" id="exam-sec-fundamentals">
                    <div class="sec-header">
                        <div class="sec-number-badge" style="background: linear-gradient(135deg, #10b981, #059669);">02</div>
                        <div class="sec-header-text">
                            <h2 class="sec-title">Θεμελιώδη Μεγέθη, Όργανα Μετρήσεων & Δυναμικό Κόμβων</h2>
                            <p class="sec-subtitle">Ένταση, τάση, αντίσταση, σωστή συνδεσμολογία οργάνων και η ισχυρή μέθοδος του δυναμικού</p>
                        </div>
                    </div>

                    <div class="exam-pro-grid">
                        <!-- CARD 1: AMPEREMETER (IN SERIES) -->
                        <div class="exam-pro-card theme-emerald">
                            <div class="exam-pro-header">
                                <div class="exam-pro-icon-box emerald">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <polyline points="12 6 12 12 16 14"></polyline>
                                    </svg>
                                </div>
                                <div class="exam-pro-title-wrap">
                                    <span class="exam-pro-tag emerald">Όργανο Μέτρησης Έντασης</span>
                                    <h3 class="exam-pro-title">Αμπερόμετρο (Σύνδεση σε Σειρά)</h3>
                                </div>
                            </div>

                            <div class="exam-pro-callout emerald">
                                Συνδέεται <strong>αποκλειστικά σε σειρά</strong> με το εξεταζόμενο στοιχείο, ώστε ολόκληρο το ρεύμα του κλάδου να διέρχεται υποχρεωτικά από το εσωτερικό του.
                            </div>

                            <div class="exam-pro-items">
                                <div class="exam-pro-item">
                                    <div class="exam-pro-item-top">
                                        <div class="exam-pro-item-title">
                                            <span>⚡</span> Αμελητέα Εσωτερική Αντίσταση
                                        </div>
                                        <span class="exam-pro-item-badge emerald">R_A ≈ 0 Ω</span>
                                    </div>
                                    <p class="exam-pro-item-desc">
                                        Δεν προκαλεί πτώση τάσης στα άκρα του ($V_A \\approx 0\\text{ V}$), δεν καταναλώνει ηλεκτρική ισχύ και αφήνει το ρεύμα του κυκλώματος αναλλοίωτο.
                                    </p>
                                </div>

                                <div class="exam-pro-item">
                                    <div class="exam-pro-item-top">
                                        <div class="exam-pro-item-title">
                                            <span>⏱️</span> Μέτρηση Ρυθμού Ροής Φορτίου
                                        </div>
                                        <span class="exam-pro-item-badge emerald">I = q / t</span>
                                    </div>
                                    <p class="exam-pro-item-desc">
                                        Καταγράφει την ποσότητα ηλεκτρικού φορτίου που διέρχεται από τη διατομή του αγωγού ανά μονάδα χρόνου, μετρούμενη σε Amperes ($1\\text{ A} = 1\\text{ C/s}$).
                                    </p>
                                </div>

                                <div class="exam-pro-item">
                                    <div class="exam-pro-item-top">
                                        <div class="exam-pro-item-title">
                                            <span>⚠️</span> Κίνδυνος Παράλληλης Σύνδεσης
                                        </div>
                                        <span class="exam-pro-item-badge danger">Βραχυκύκλωμα</span>
                                    </div>
                                    <p class="exam-pro-item-desc">
                                        Αν συνδεθεί εσφαλμένα παράλληλα στα άκρα φορτίου, λειτουργεί ως βραχυκυκλωτής μηδενικής αντίστασης, προκαλώντας υπερένταση και άμεση καταστροφή!
                                    </p>
                                </div>
                            </div>
                        </div>

                        <!-- CARD 2: VOLTMETER (IN PARALLEL) -->
                        <div class="exam-pro-card theme-cyan">
                            <div class="exam-pro-header">
                                <div class="exam-pro-icon-box cyan">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
                                    </svg>
                                </div>
                                <div class="exam-pro-title-wrap">
                                    <span class="exam-pro-tag cyan">Όργανο Μέτρησης Τάσης</span>
                                    <h3 class="exam-pro-title">Βολτόμετρο (Σύνδεση Παράλληλα)</h3>
                                </div>
                            </div>

                            <div class="exam-pro-callout cyan">
                                Συνδέεται <strong>πάντοτε παράλληλα</strong> στα δύο επιλεγμένα σημεία, μετρώντας τη διαφορά ηλεκτρικού δυναμικού (ηλεκτρική τάση) ανάμεσά τους.
                            </div>

                            <div class="exam-pro-items">
                                <div class="exam-pro-item">
                                    <div class="exam-pro-item-top">
                                        <div class="exam-pro-item-title">
                                            <span>🛡️</span> Τεράστια Εσωτερική Αντίσταση
                                        </div>
                                        <span class="exam-pro-item-badge cyan">R_V → ∞</span>
                                    </div>
                                    <p class="exam-pro-item-desc">
                                        Δεν επιτρέπει σχεδόν καθόλου ρεύμα να διαρρεύσει το όργανο ($I_V \\approx 0\\text{ A}$), διατηρώντας το καθεστώς λειτουργίας των υπόλοιπων κλάδων ακέραιο.
                                    </p>
                                </div>

                                <div class="exam-pro-item">
                                    <div class="exam-pro-item-top">
                                        <div class="exam-pro-item-title">
                                            <span>🔋</span> Μέτρηση Ενέργειας ανά Φορτίο
                                        </div>
                                        <span class="exam-pro-item-badge cyan">V = W / q</span>
                                    </div>
                                    <p class="exam-pro-item-desc">
                                        Καταγράφει το ποσό ενέργειας που μεταβιβάζεται ανά μονάδα διερχόμενου ηλεκτρικού φορτίου, μετρούμενο σε Volts ($1\\text{ V} = 1\\text{ J/C}$).
                                    </p>
                                </div>

                                <div class="exam-pro-item">
                                    <div class="exam-pro-item-top">
                                        <div class="exam-pro-item-title">
                                            <span>⚠️</span> Σφάλμα Σύνδεσης σε Σειρά
                                        </div>
                                        <span class="exam-pro-item-badge warning">Διακοπή Ρεύματος</span>
                                    </div>
                                    <p class="exam-pro-item-desc">
                                        Αν συνδεθεί εσφαλμένα σε σειρά, λόγω της τεράστιας αντίστασής του λειτουργεί σχεδόν ως ανοιχτοκύκλωμα, μηδενίζοντας το ρεύμα του κυκλώματος ($I \\approx 0$).
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- THE NODE POTENTIAL METHOD (ΜΕΘΟΔΟΣ ΔΥΝΑΜΙΚΟΥ ΚΟΜΒΩΝ) -->
                    <div class="concept-alert" style="margin-top: 20px; background: rgba(16, 185, 129, 0.08); border-color: rgba(16, 185, 129, 0.3);">
                        <div class="alert-icon">🧠</div>
                        <div class="alert-body">
                            <h4 style="color: #34d399; margin-bottom: 6px;">Η Εναλλακτική Προσέγγιση: Μέθοδος Ηλεκτρικού Δυναμικού (Node Potential)</h4>
                            <p style="font-size: 0.93rem; line-height: 1.6; color: var(--text-secondary);">
                                Στις σημειώσεις του Δ. Μητσάκη δίνεται μια εξαιρετικά διαφωτιστική μέθοδος για την κατανόηση των κυκλωμάτων:
                            </p>
                            <div style="background: rgba(0,0,0,0.25); padding: 12px 16px; border-radius: 12px; margin-top: 10px; font-size: 0.90rem;">
                                <p><strong>1. Ορισμός Δυναμικού Πόλων:</strong> Θεωρούμε αυθαίρετα ένα δυναμικό αναφοράς στον αρνητικό πόλο, π.χ. $V_- = 100\\text{ V}$. 
                                Εάν η πηγή έχει τάση $V = 60\\text{ V}$, τότε ο θετικός πόλος βρίσκεται στο δυναμικό $V_+ = 100 + 60 = 160\\text{ V}$.</p>
                                <p style="margin-top: 6px;"><strong>2. Ιδανικά Καλώδια:</strong> Κατά μήκος ενός ιδανικού καλωδίου χωρίς αντίσταση ($R = 0$), δεν δαπανάται ενέργεια. Όλα τα σημεία του διατηρούν <em>ακριβώς το ίδιο δυναμικό</em> ($V_{\\text{καλωδίου}} = \\text{σταθερό}$).</p>
                                <p style="margin-top: 6px;"><strong>3. Πτώση Τάσης στον Αντιστάτη:</strong> Όταν το ρεύμα $I$ διέρχεται από αντίσταση $R$, δαπανάται ενέργεια ανά μονάδα φορτίου ίση με $\\Delta V = I \\cdot R$. Στο σημείο αμέσως μετά τον αντιστάτη, το δυναμικό πέφτει: $V_{\\text{μετά}} = V_{\\text{πριν}} - I \\cdot R$.</p>
                                <p style="margin-top: 6px;"><strong>4. Ανοιχτά Κλαδιά ($I = 0$):</strong> Σε ένα κλαδί που καταλήγει σε ανοιχτό διακόπτη, το ρεύμα είναι μηδέν ($I = 0$). Επειδή δεν υπάρχει ροή φορτίου, <em>δεν συμβαίνει καμία πτώση τάσης</em>, και ολόκληρο το ανοιχτό τμήμα διατηρεί το δυναμικό του σημείου στο οποίο εφάπτεται!</p>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- ==============================================================
                     SECTION 3: ΥΠΟΛΟΓΙΣΤΙΚΗ ΡΟΔΑ (12 ΤΥΠΟΙ P, V, I, R)
                     ============================================================== -->
                <section class="theory-section exam-section glass-card" id="exam-sec-wheel">
                    <div class="sec-header">
                        <div class="sec-number-badge" style="background: linear-gradient(135deg, #f59e0b, #d97706);">03</div>
                        <div class="sec-header-text">
                            <h2 class="sec-title">Μνημονικοί Κανόνες & Υπολογιστική Ρόδα (Calculation Wheel)</h2>
                            <p class="sec-subtitle">Οι 12 θεμελιώδεις μαθηματικοί τύποι υπολογισμού των $P, V, I, R$ σε 4 τεταρτημόρια</p>
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1.2fr; gap: 24px; align-items: center;" class="wheel-grid-layout">
                        <!-- WHEEL IMAGE SHOWCASE -->
                        <div style="text-align: center;">
                            <div class="diagram-img-wrap" style="max-width: 380px; margin: 0 auto; cursor: pointer; border-radius: 18px; overflow: hidden; border: 2px solid rgba(245, 158, 11, 0.4); box-shadow: 0 8px 24px rgba(0,0,0,0.3);" onclick="openDiagramLightbox('assets/images/exam_solutions/calculation_wheel.png', 'Υπολογιστική Ρόδα 12 Τύπων (P, V, I, R)')" title="Κλικ για μεγέθυνση σε πλήρη οθόνη">
                                <img src="assets/images/exam_solutions/calculation_wheel.png" alt="Calculation Wheel 12 Formulas" style="width: 100%; display: block;" />
                                <span class="diagram-zoom-hint">🔍 Κλικ για Πλήρη Οθόνη</span>
                            </div>
                            <p style="font-size: 0.82rem; color: var(--text-muted); margin-top: 8px;">
                                Σχήμα: Ο πλήρης υπολογιστικός τροχός των 12 τύπων συνεχούς ρεύματος (DC).
                            </p>
                        </div>

                        <!-- 4 QUADRANTS TABLE -->
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                            <div class="formula-box" style="border-left: 3px solid #60a5fa;">
                                <div class="formula-box-title" style="color: #60a5fa;">⚡ Τάση ($V$) — Volt</div>
                                <div class="formula-latex" style="font-size: 1.05rem;">$$V = I \\cdot R$$</div>
                                <div class="formula-latex" style="font-size: 1.05rem;">$$V = \\frac{P}{I}$$</div>
                                <div class="formula-latex" style="font-size: 1.05rem;">$$V = \\sqrt{P \\cdot R}$$</div>
                            </div>

                            <div class="formula-box" style="border-left: 3px solid #34d399;">
                                <div class="formula-box-title" style="color: #34d399;">🌊 Ένταση ($I$) — Ampere</div>
                                <div class="formula-latex" style="font-size: 1.05rem;">$$I = \\frac{V}{R}$$</div>
                                <div class="formula-latex" style="font-size: 1.05rem;">$$I = \\frac{P}{V}$$</div>
                                <div class="formula-latex" style="font-size: 1.05rem;">$$I = \\sqrt{\\frac{P}{R}}$$</div>
                            </div>

                            <div class="formula-box" style="border-left: 3px solid #fbbf24;">
                                <div class="formula-box-title" style="color: #fbbf24;">🛑 Αντίσταση ($R$) — Ohm ($\\Omega$)</div>
                                <div class="formula-latex" style="font-size: 1.05rem;">$$R = \\frac{V}{I}$$</div>
                                <div class="formula-latex" style="font-size: 1.05rem;">$$R = \\frac{V^2}{P}$$</div>
                                <div class="formula-latex" style="font-size: 1.05rem;">$$R = \\frac{P}{I^2}$$</div>
                            </div>

                            <div class="formula-box" style="border-left: 3px solid #f87171;">
                                <div class="formula-box-title" style="color: #f87171;">🔥 Ισχύς ($P$) — Watt</div>
                                <div class="formula-latex" style="font-size: 1.05rem;">$$P = V \\cdot I$$</div>
                                <div class="formula-latex" style="font-size: 1.05rem;">$$P = I^2 \\cdot R$$</div>
                                <div class="formula-latex" style="font-size: 1.05rem;">$$P = \\frac{V^2}{R}$$</div>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- ==============================================================
                     SECTION 4: ΘΕΜΑ Α1 — ΣΥΝΔΕΣΜΟΛΟΓΙΑ ΣΕΙΡΑΣ (15 ΕΡΩΤΗΜΑΤΑ)
                     ============================================================== -->
                <section class="theory-section exam-section glass-card" id="exam-sec-thema-a1">
                    <div class="sec-header">
                        <div class="sec-number-badge" style="background: linear-gradient(135deg, #8b5cf6, #6d28d9);">04</div>
                        <div class="sec-header-text">
                            <h2 class="sec-title">Θέμα Α1: Συνδεσμολογία σε Σειρά (15 Ερωτήματα)</h2>
                            <p class="sec-subtitle">Υποδειγματική επίλυση όλων των ερωτημάτων με διακόπτες, βραχυκυκλώματα και δυναμικό κόμβων</p>
                        </div>
                    </div>

                    <!-- THEMA A1 CIRCUIT OVERVIEW CARD -->
                    <div class="theory-card" style="margin-bottom: 24px; border-left: 4px solid #8b5cf6;">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; align-items: center;" class="circuit-overview-grid">
                            <div>
                                <h3 style="color: #a78bfa; margin-bottom: 8px;">Δεδομένα Κυκλώματος Θέματος Α1</h3>
                                <ul style="line-height: 1.7; font-size: 0.95rem; color: var(--text-secondary); padding-left: 20px;">
                                    <li>Τάση πηγής: <strong>$V = 60\\text{ V}$</strong></li>
                                    <li>Αντιστάτης 1: <strong>$R_1 = 5\\ \\Omega$</strong></li>
                                    <li>Αντιστάτης 2: <strong>$R_2 = 15\\ \\Omega$</strong></li>
                                    <li>Ιδανικοί διακόπτες: <strong>[Γ, Δ]</strong> (κεντρικός), <strong>[Ζ, Η]</strong>, <strong>[Μ, Λ]</strong>, <strong>[Θ, Κ]</strong>, <strong>[Ξ, Ν]</strong></li>
                                    <li>Χαρακτηριστικά σημεία: <strong>Τ, Π, Ρ, Σ</strong></li>
                                    <li><strong>Αρχική Κατάσταση:</strong> Κλείνει <em>μόνο</em> ο κεντρικός διακόπτης [Γ, Δ].</li>
                                </ul>
                            </div>
                            <div style="text-align: center;">
                                <div class="diagram-img-wrap" style="max-width: 440px; margin: 0 auto; cursor: pointer; border-radius: 14px; overflow: hidden; border: 2px solid rgba(139, 92, 246, 0.4);" onclick="openDiagramLightbox('assets/images/exam_solutions/circuit_series_a1.png', 'Διάγραμμα Κυκλώματος Θέματος Α1 (Συνδεσμολογία Σειράς)')" title="Κλικ για μεγέθυνση">
                                    <img src="assets/images/exam_solutions/circuit_series_a1.png" alt="Thema A1 Circuit Diagram" style="width: 100%; display: block;" />
                                    <span class="diagram-zoom-hint">🔍 Κλικ για Πλήρη Οθόνη</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- QUESTIONS 1 TO 15 FOR THEMA A1 -->
                    <div class="exam-questions-list">

                        <!-- Q1 -->
                        <div class="exam-question-card glass-card">
                            <div class="exam-q-header">
                                <span class="exam-q-badge">Ερώτημα 1</span>
                                <h4 class="exam-q-title">Τιμή της συνολικής (ισοδύναμης) αντίστασης του κυκλώματος</h4>

                                <button class="exam-diagram-toggle-btn theme-a1" id="btn-diag-a1-1" 
                                        onclick="ExamSolutionsGuide.toggleDiagram('a1-1', 'a1')"
                                         title="Κλικ για άνοιγμα/κλείσιμο του διαγράμματος επάνω από το ερώτημα">
                                    <span class="diag-btn-icon">🗺️</span>
                                    <span class="diag-btn-label">Διάγραμμα</span>
                                    <span class="diag-btn-arrow">▾</span>
                                </button>
                            </div>
                            <!-- Collapsible Inline Diagram Drawer (Thema A1) -->
                            <div class="exam-inline-diagram-drawer" id="diag-drawer-a1-1" style="display: none;">
                                <div class="exam-inline-diagram-card theme-a1">
                                    <div class="exam-inline-diagram-header">
                                        <span class="exam-inline-badge theme-a1">⚡ Θέμα Α1: Συνδεσμολογία σε Σειρά</span>
                                        <button type="button" class="exam-inline-close-btn" onclick="ExamSolutionsGuide.toggleDiagram('a1-1', 'a1')" title="Κλείσιμο διαγράμματος">✕</button>
                                    </div>
                                    <div class="exam-inline-diagram-grid">
                                        <div class="exam-inline-diagram-img-wrap" onclick="openDiagramLightbox('assets/images/exam_solutions/circuit_series_a1.png', 'Διάγραμμα Κυκλώματος Θέματος Α1 (Συνδεσμολογία Σειράς)')" title="Κλικ για μεγέθυνση σε πλήρη οθόνη">
                                            <img src="assets/images/exam_solutions/circuit_series_a1.png" alt="Thema A1 Circuit Diagram" loading="lazy" />
                                            <span class="diagram-zoom-hint">🔍 Κλικ για Πλήρη Οθόνη</span>
                                        </div>
                                        <div class="exam-inline-diagram-specs">
                                            <h5 class="exam-inline-specs-heading">Βασικά Δεδομένα Κυκλώματος:</h5>
                                            <ul class="exam-inline-specs-list">
                                                <li>Τάση πηγής: <strong>$V = 60\text{ V}$</strong></li>
                                                <li>Αντιστάτες: <strong>$R_1 = 5\ \Omega$</strong>, <strong>$R_2 = 15\ \Omega$</strong> (σε σειρά)</li>
                                                <li>Κεντρικός διακόπτης: <strong>[Γ, Δ]</strong> (κλειστός)</li>
                                                <li>Κλαδικοί διακόπτες: <strong>[Ζ, Η]</strong>, <strong>[Μ, Λ]</strong>, <strong>[Θ, Κ]</strong>, <strong>[Ξ, Ν]</strong></li>
                                                <li>Σημεία κυκλώματος: <strong>Τ, Π, Ρ, Σ</strong></li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <p class="exam-q-prompt">
                                Με κλειστό μόνο τον κεντρικό διακόπτη [Γ, Δ], να υπολογίσετε τη συνολική αντίσταση $R_{\\text{ολ}}$ του κυκλώματος.
                            </p>
                            <div class="exam-options-grid" id="opts-grid-a1-1">
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-1', 0)"><span class="opt-label">(α) $5\\ \\Omega$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-1', 1)"><span class="opt-label">(β) $20\\ \\Omega$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-1', 2)"><span class="opt-label">(γ) $15\\ \\Omega$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-1', 3)"><span class="opt-label">(δ) $60\\ \\Omega$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-1', 4)"><span class="opt-label">(ε) $90\\ \\Omega$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-1', 5)"><span class="opt-label">(στ) $3,75\\ \\Omega$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-1', 6)"><span class="opt-label">(ζ) $10\\ \\Omega$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-1', 7)"><span class="opt-label">(η) $3\\ \\Omega$</span></button>
                            </div>
                            <div class="exam-q-feedback" id="feedback-a1-1" style="display: none;"></div>
                            <div class="exam-sol-wrap">
                                <button class="exam-sol-toggle-btn" id="btn-sol-a1-1" onclick="ExamSolutionsGuide.toggleSolution('a1-1')">
                                    <span>💡</span><span>Επίλυση</span><span class="sol-btn-arrow">▾</span>
                                </button>
                                <div class="exam-solution-body" id="sol-a1-1" style="display: none;">
                                    <div class="exam-sol-inner">
                                        <p><strong>Αιτιολόγηση:</strong> Με κλειστό μόνο τον διακόπτη [Γ, Δ], υπάρχει ένας και μοναδικός διαθέσιμος κλειστός δρόμος (βρόγχος) για να κινηθεί το ρεύμα από τον θετικό προς τον αρνητικό πόλο, διαμέσου και των δύο αντιστατών. Άρα οι αντιστάτες $R_1$ και $R_2$ συνδέονται <strong>σε σειρά</strong>.</p>
                                        <div class="formula-latex">$$R_{\\text{ολ}} = R_1 + R_2 = 5\\ \\Omega + 15\\ \\Omega = 20\\ \\Omega$$</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Q2 -->
                        <div class="exam-question-card glass-card">
                            <div class="exam-q-header">
                                <span class="exam-q-badge">Ερώτημα 2</span>
                                <h4 class="exam-q-title">Ένταση του ρεύματος που διαρρέει την πηγή</h4>
                            
                                <button class="exam-diagram-toggle-btn theme-a1" id="btn-diag-a1-2" 
                                        onclick="ExamSolutionsGuide.toggleDiagram('a1-2', 'a1')"
                                         title="Κλικ για άνοιγμα/κλείσιμο του διαγράμματος επάνω από το ερώτημα">
                                    <span class="diag-btn-icon">🗺️</span>
                                    <span class="diag-btn-label">Διάγραμμα</span>
                                    <span class="diag-btn-arrow">▾</span>
                                </button>
                            </div>
                            <!-- Collapsible Inline Diagram Drawer (Thema A1) -->
                            <div class="exam-inline-diagram-drawer" id="diag-drawer-a1-2" style="display: none;">
                                <div class="exam-inline-diagram-card theme-a1">
                                    <div class="exam-inline-diagram-header">
                                        <span class="exam-inline-badge theme-a1">⚡ Θέμα Α1: Συνδεσμολογία σε Σειρά</span>
                                        <button type="button" class="exam-inline-close-btn" onclick="ExamSolutionsGuide.toggleDiagram('a1-2', 'a1')" title="Κλείσιμο διαγράμματος">✕</button>
                                    </div>
                                    <div class="exam-inline-diagram-grid">
                                        <div class="exam-inline-diagram-img-wrap" onclick="openDiagramLightbox('assets/images/exam_solutions/circuit_series_a1.png', 'Διάγραμμα Κυκλώματος Θέματος Α1 (Συνδεσμολογία Σειράς)')" title="Κλικ για μεγέθυνση σε πλήρη οθόνη">
                                            <img src="assets/images/exam_solutions/circuit_series_a1.png" alt="Thema A1 Circuit Diagram" loading="lazy" />
                                            <span class="diagram-zoom-hint">🔍 Κλικ για Πλήρη Οθόνη</span>
                                        </div>
                                        <div class="exam-inline-diagram-specs">
                                            <h5 class="exam-inline-specs-heading" style="color: #a78bfa;">Δεδομένα Κυκλώματος Θέματος Α1</h5>
                                            <ul class="exam-inline-specs-list">
                                                <li>Τάση πηγής: <strong>$V = 60\\text{ V}$</strong></li>
                                                <li>Αντιστάτης 1: <strong>$R_1 = 5\\ \\Omega$</strong></li>
                                                <li>Αντιστάτης 2: <strong>$R_2 = 15\\ \\Omega$</strong></li>
                                                <li>Ιδανικοί διακόπτες: <strong>[Γ, Δ]</strong> (κεντρικός), <strong>[Ζ, Η]</strong>, <strong>[Μ, Λ]</strong>, <strong>[Θ, Κ]</strong>, <strong>[Ξ, Ν]</strong></li>
                                                <li>Χαρακτηριστικά σημεία: <strong>Τ, Π, Ρ, Σ</strong></li>
                                                <li><strong>Αρχική Κατάσταση:</strong> Κλείνει <em>μόνο</em> ο κεντρικός διακόπτης [Γ, Δ].</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <p class="exam-q-prompt">
                                Να υπολογίσετε την ένταση του ρεύματος $I$ που εξέρχεται από την πηγή.
                            </p>
                            <div class="exam-options-grid" id="opts-grid-a1-2">
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-2', 0)"><span class="opt-label">(α) $5\\text{ A}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-2', 1)"><span class="opt-label">(β) $6\\text{ A}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-2', 2)"><span class="opt-label">(γ) $2\\text{ A}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-2', 3)"><span class="opt-label">(δ) $3\\text{ A}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-2', 4)"><span class="opt-label">(ε) $15\\text{ A}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-2', 5)"><span class="opt-label">(στ) $20\\text{ A}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-2', 6)"><span class="opt-label">(ζ) άπειρη</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-2', 7)"><span class="opt-label">(η) $4\\text{ A}$</span></button>
                            </div>
                            <div class="exam-q-feedback" id="feedback-a1-2" style="display: none;"></div>
                            <div class="exam-sol-wrap">
                                <button class="exam-sol-toggle-btn" id="btn-sol-a1-2" onclick="ExamSolutionsGuide.toggleSolution('a1-2')">
                                    <span>💡</span><span>Επίλυση</span><span class="sol-btn-arrow">▾</span>
                                </button>
                                <div class="exam-solution-body" id="sol-a1-2" style="display: none;">
                                    <div class="exam-sol-inner">
                                        <p><strong>Αιτιολόγηση:</strong> Εφαρμόζουμε τον νόμο του Ohm για το ισοδύναμο κύκλωμα με την ολική αντίσταση:</p>
                                        <div class="formula-latex">$$I = \\frac{V}{R_{\\text{ολ}}} = \\frac{60\\text{ V}}{20\\ \\Omega} = 3\\text{ A}$$</div>
                                        <p>Επειδή το κύκλωμα είναι σε σειρά, η ένταση είναι ίδια σε κάθε σημείο του: $I_{\\text{ολ}} = I_1 = I_2 = 3\\text{ A}$.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Q3 -->
                        <div class="exam-question-card glass-card">
                            <div class="exam-q-header">
                                <span class="exam-q-badge">Ερώτημα 3</span>
                                <h4 class="exam-q-title">Διαφορά δυναμικού στα άκρα του αντιστάτη $R_1$</h4>
                            
                                <button class="exam-diagram-toggle-btn theme-a1" id="btn-diag-a1-3" 
                                        onclick="ExamSolutionsGuide.toggleDiagram('a1-3', 'a1')"
                                         title="Κλικ για άνοιγμα/κλείσιμο του διαγράμματος επάνω από το ερώτημα">
                                    <span class="diag-btn-icon">🗺️</span>
                                    <span class="diag-btn-label">Διάγραμμα</span>
                                    <span class="diag-btn-arrow">▾</span>
                                </button>
                            </div>
                            <!-- Collapsible Inline Diagram Drawer (Thema A1) -->
                            <div class="exam-inline-diagram-drawer" id="diag-drawer-a1-3" style="display: none;">
                                <div class="exam-inline-diagram-card theme-a1">
                                    <div class="exam-inline-diagram-header">
                                        <span class="exam-inline-badge theme-a1">⚡ Θέμα Α1: Συνδεσμολογία σε Σειρά</span>
                                        <button type="button" class="exam-inline-close-btn" onclick="ExamSolutionsGuide.toggleDiagram('a1-3', 'a1')" title="Κλείσιμο διαγράμματος">✕</button>
                                    </div>
                                    <div class="exam-inline-diagram-grid">
                                        <div class="exam-inline-diagram-img-wrap" onclick="openDiagramLightbox('assets/images/exam_solutions/circuit_series_a1.png', 'Διάγραμμα Κυκλώματος Θέματος Α1 (Συνδεσμολογία Σειράς)')" title="Κλικ για μεγέθυνση σε πλήρη οθόνη">
                                            <img src="assets/images/exam_solutions/circuit_series_a1.png" alt="Thema A1 Circuit Diagram" loading="lazy" />
                                            <span class="diagram-zoom-hint">🔍 Κλικ για Πλήρη Οθόνη</span>
                                        </div>
                                        <div class="exam-inline-diagram-specs">
                                            <h5 class="exam-inline-specs-heading" style="color: #a78bfa;">Δεδομένα Κυκλώματος Θέματος Α1</h5>
                                            <ul class="exam-inline-specs-list">
                                                <li>Τάση πηγής: <strong>$V = 60\\text{ V}$</strong></li>
                                                <li>Αντιστάτης 1: <strong>$R_1 = 5\\ \\Omega$</strong></li>
                                                <li>Αντιστάτης 2: <strong>$R_2 = 15\\ \\Omega$</strong></li>
                                                <li>Ιδανικοί διακόπτες: <strong>[Γ, Δ]</strong> (κεντρικός), <strong>[Ζ, Η]</strong>, <strong>[Μ, Λ]</strong>, <strong>[Θ, Κ]</strong>, <strong>[Ξ, Ν]</strong></li>
                                                <li>Χαρακτηριστικά σημεία: <strong>Τ, Π, Ρ, Σ</strong></li>
                                                <li><strong>Αρχική Κατάσταση:</strong> Κλείνει <em>μόνο</em> ο κεντρικός διακόπτης [Γ, Δ].</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <p class="exam-q-prompt">
                                Να υπολογίσετε την τάση $V_1$ στα άκρα του αντιστάτη $R_1$.
                            </p>
                            <div class="exam-options-grid" id="opts-grid-a1-3">
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-3', 0)"><span class="opt-label">(α) $15\\text{ V}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-3', 1)"><span class="opt-label">(β) $5\\text{ V}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-3', 2)"><span class="opt-label">(γ) $60\\text{ V}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-3', 3)"><span class="opt-label">(δ) $3\\text{ V}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-3', 4)"><span class="opt-label">(ε) $15\\text{ A}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-3', 5)"><span class="opt-label">(στ) $0\\text{ V}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-3', 6)"><span class="opt-label">(ζ) $20\\text{ V}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-3', 7)"><span class="opt-label">(η) $30\\text{ V}$</span></button>
                            </div>
                            <div class="exam-q-feedback" id="feedback-a1-3" style="display: none;"></div>
                            <div class="exam-sol-wrap">
                                <button class="exam-sol-toggle-btn" id="btn-sol-a1-3" onclick="ExamSolutionsGuide.toggleSolution('a1-3')">
                                    <span>💡</span><span>Επίλυση</span><span class="sol-btn-arrow">▾</span>
                                </button>
                                <div class="exam-solution-body" id="sol-a1-3" style="display: none;">
                                    <div class="exam-sol-inner">
                                        <p><strong>1. Τυπική Μέθοδος (Νόμος Ohm):</strong></p>
                                        <div class="formula-latex">$$V_1 = I \\cdot R_1 = 3\\text{ A} \\cdot 5\\ \\Omega = 15\\text{ V}$$</div>
                                        <p style="margin-top: 10px;"><strong>2. Εναλλακτική Προσέγγιση (Δυναμικό Κόμβων):</strong></p>
                                        <p>Θέτουμε $V_- = 100\\text{ V} \\implies V_+ = 160\\text{ V}$. Στο σημείο Ε (πριν τον $R_1$), $V_{\\text{Ε}} = 160\\text{ V}$.</p>
                                        <p>Η δαπάνη ενέργειας για τη διέλευση του $R_1$ είναι $15\\text{ V}$, άρα στο σημείο Γ μετά τον αντιστάτη το δυναμικό μειώνεται: $V_{\\text{Γ}} = 160 - 15 = 145\\text{ V}$.</p>
                                        <p>Επομένως: $V_1 = V_{\\text{Ε}} - V_{\\text{Γ}} = 160\\text{ V} - 145\\text{ V} = 15\\text{ V}$.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Q4 -->
                        <div class="exam-question-card glass-card">
                            <div class="exam-q-header">
                                <span class="exam-q-badge">Ερώτημα 4</span>
                                <h4 class="exam-q-title">Διαφορά δυναμικού στα άκρα του αντιστάτη $R_2$</h4>
                            
                                <button class="exam-diagram-toggle-btn theme-a1" id="btn-diag-a1-4" 
                                        onclick="ExamSolutionsGuide.toggleDiagram('a1-4', 'a1')"
                                         title="Κλικ για άνοιγμα/κλείσιμο του διαγράμματος επάνω από το ερώτημα">
                                    <span class="diag-btn-icon">🗺️</span>
                                    <span class="diag-btn-label">Διάγραμμα</span>
                                    <span class="diag-btn-arrow">▾</span>
                                </button>
                            </div>
                            <!-- Collapsible Inline Diagram Drawer (Thema A1) -->
                            <div class="exam-inline-diagram-drawer" id="diag-drawer-a1-4" style="display: none;">
                                <div class="exam-inline-diagram-card theme-a1">
                                    <div class="exam-inline-diagram-header">
                                        <span class="exam-inline-badge theme-a1">⚡ Θέμα Α1: Συνδεσμολογία σε Σειρά</span>
                                        <button type="button" class="exam-inline-close-btn" onclick="ExamSolutionsGuide.toggleDiagram('a1-4', 'a1')" title="Κλείσιμο διαγράμματος">✕</button>
                                    </div>
                                    <div class="exam-inline-diagram-grid">
                                        <div class="exam-inline-diagram-img-wrap" onclick="openDiagramLightbox('assets/images/exam_solutions/circuit_series_a1.png', 'Διάγραμμα Κυκλώματος Θέματος Α1 (Συνδεσμολογία Σειράς)')" title="Κλικ για μεγέθυνση σε πλήρη οθόνη">
                                            <img src="assets/images/exam_solutions/circuit_series_a1.png" alt="Thema A1 Circuit Diagram" loading="lazy" />
                                            <span class="diagram-zoom-hint">🔍 Κλικ για Πλήρη Οθόνη</span>
                                        </div>
                                        <div class="exam-inline-diagram-specs">
                                            <h5 class="exam-inline-specs-heading" style="color: #a78bfa;">Δεδομένα Κυκλώματος Θέματος Α1</h5>
                                            <ul class="exam-inline-specs-list">
                                                <li>Τάση πηγής: <strong>$V = 60\\text{ V}$</strong></li>
                                                <li>Αντιστάτης 1: <strong>$R_1 = 5\\ \\Omega$</strong></li>
                                                <li>Αντιστάτης 2: <strong>$R_2 = 15\\ \\Omega$</strong></li>
                                                <li>Ιδανικοί διακόπτες: <strong>[Γ, Δ]</strong> (κεντρικός), <strong>[Ζ, Η]</strong>, <strong>[Μ, Λ]</strong>, <strong>[Θ, Κ]</strong>, <strong>[Ξ, Ν]</strong></li>
                                                <li>Χαρακτηριστικά σημεία: <strong>Τ, Π, Ρ, Σ</strong></li>
                                                <li><strong>Αρχική Κατάσταση:</strong> Κλείνει <em>μόνο</em> ο κεντρικός διακόπτης [Γ, Δ].</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <p class="exam-q-prompt">
                                Να υπολογίσετε την τάση $V_2$ στα άκρα του αντιστάτη $R_2$.
                            </p>
                            <div class="exam-options-grid" id="opts-grid-a1-4">
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-4', 0)"><span class="opt-label">(α) $15\\text{ V}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-4', 1)"><span class="opt-label">(β) $5\\text{ V}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-4', 2)"><span class="opt-label">(γ) $60\\text{ V}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-4', 3)"><span class="opt-label">(δ) $45\\text{ V}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-4', 4)"><span class="opt-label">(ε) $75\\text{ A}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-4', 5)"><span class="opt-label">(στ) $30\\text{ V}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-4', 6)"><span class="opt-label">(ζ) $20\\text{ V}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-4', 7)"><span class="opt-label">(η) μηδέν</span></button>
                            </div>
                            <div class="exam-q-feedback" id="feedback-a1-4" style="display: none;"></div>
                            <div class="exam-sol-wrap">
                                <button class="exam-sol-toggle-btn" id="btn-sol-a1-4" onclick="ExamSolutionsGuide.toggleSolution('a1-4')">
                                    <span>💡</span><span>Επίλυση</span><span class="sol-btn-arrow">▾</span>
                                </button>
                                <div class="exam-solution-body" id="sol-a1-4" style="display: none;">
                                    <div class="exam-sol-inner">
                                        <p><strong>Αιτιολόγηση:</strong> Από τον νόμο του Ohm για τον $R_2$:</p>
                                        <div class="formula-latex">$$V_2 = I \\cdot R_2 = 3\\text{ A} \\cdot 15\\ \\Omega = 45\\text{ V}$$</div>
                                        <p><strong>Επαλήθευση:</strong> $V_1 + V_2 = 15\\text{ V} + 45\\text{ V} = 60\\text{ V} = V_{\\text{πηγ}}$. Επιβεβαιώνεται ότι η τάση της πηγής επιμερίζεται στους δύο αντιστάτες αναλόγως των αντιστάσεών τους ($R_2 = 3 \\cdot R_1 \\implies V_2 = 3 \\cdot V_1$).</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Q5 -->
                        <div class="exam-question-card glass-card">
                            <div class="exam-q-header">
                                <span class="exam-q-badge">Ερώτημα 5</span>
                                <h4 class="exam-q-title">Ισχύς που παράγει η πηγή</h4>
                            
                                <button class="exam-diagram-toggle-btn theme-a1" id="btn-diag-a1-5" 
                                        onclick="ExamSolutionsGuide.toggleDiagram('a1-5', 'a1')"
                                         title="Κλικ για άνοιγμα/κλείσιμο του διαγράμματος επάνω από το ερώτημα">
                                    <span class="diag-btn-icon">🗺️</span>
                                    <span class="diag-btn-label">Διάγραμμα</span>
                                    <span class="diag-btn-arrow">▾</span>
                                </button>
                            </div>
                            <!-- Collapsible Inline Diagram Drawer (Thema A1) -->
                            <div class="exam-inline-diagram-drawer" id="diag-drawer-a1-5" style="display: none;">
                                <div class="exam-inline-diagram-card theme-a1">
                                    <div class="exam-inline-diagram-header">
                                        <span class="exam-inline-badge theme-a1">⚡ Θέμα Α1: Συνδεσμολογία σε Σειρά</span>
                                        <button type="button" class="exam-inline-close-btn" onclick="ExamSolutionsGuide.toggleDiagram('a1-5', 'a1')" title="Κλείσιμο διαγράμματος">✕</button>
                                    </div>
                                    <div class="exam-inline-diagram-grid">
                                        <div class="exam-inline-diagram-img-wrap" onclick="openDiagramLightbox('assets/images/exam_solutions/circuit_series_a1.png', 'Διάγραμμα Κυκλώματος Θέματος Α1 (Συνδεσμολογία Σειράς)')" title="Κλικ για μεγέθυνση σε πλήρη οθόνη">
                                            <img src="assets/images/exam_solutions/circuit_series_a1.png" alt="Thema A1 Circuit Diagram" loading="lazy" />
                                            <span class="diagram-zoom-hint">🔍 Κλικ για Πλήρη Οθόνη</span>
                                        </div>
                                        <div class="exam-inline-diagram-specs">
                                            <h5 class="exam-inline-specs-heading" style="color: #a78bfa;">Δεδομένα Κυκλώματος Θέματος Α1</h5>
                                            <ul class="exam-inline-specs-list">
                                                <li>Τάση πηγής: <strong>$V = 60\\text{ V}$</strong></li>
                                                <li>Αντιστάτης 1: <strong>$R_1 = 5\\ \\Omega$</strong></li>
                                                <li>Αντιστάτης 2: <strong>$R_2 = 15\\ \\Omega$</strong></li>
                                                <li>Ιδανικοί διακόπτες: <strong>[Γ, Δ]</strong> (κεντρικός), <strong>[Ζ, Η]</strong>, <strong>[Μ, Λ]</strong>, <strong>[Θ, Κ]</strong>, <strong>[Ξ, Ν]</strong></li>
                                                <li>Χαρακτηριστικά σημεία: <strong>Τ, Π, Ρ, Σ</strong></li>
                                                <li><strong>Αρχική Κατάσταση:</strong> Κλείνει <em>μόνο</em> ο κεντρικός διακόπτης [Γ, Δ].</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <p class="exam-q-prompt">
                                Να υπολογίσετε την τιμή της ισχύος $P_{\\text{πηγ}}$ που προσφέρει η πηγή στο κύκλωμα.
                            </p>
                            <div class="exam-options-grid" id="opts-grid-a1-5">
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-5', 0)"><span class="opt-label">(α) $150\\text{ W}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-5', 1)"><span class="opt-label">(β) άπειρη</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-5', 2)"><span class="opt-label">(γ) $45\\text{ W}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-5', 3)"><span class="opt-label">(δ) $60\\text{ W}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-5', 4)"><span class="opt-label">(ε) $180\\text{ W}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-5', 5)"><span class="opt-label">(στ) $120\\text{ W}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-5', 6)"><span class="opt-label">(ζ) $200\\text{ W}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-5', 7)"><span class="opt-label">(η) μηδέν</span></button>
                            </div>
                            <div class="exam-q-feedback" id="feedback-a1-5" style="display: none;"></div>
                            <div class="exam-sol-wrap">
                                <button class="exam-sol-toggle-btn" id="btn-sol-a1-5" onclick="ExamSolutionsGuide.toggleSolution('a1-5')">
                                    <span>💡</span><span>Επίλυση</span><span class="sol-btn-arrow">▾</span>
                                </button>
                                <div class="exam-solution-body" id="sol-a1-5" style="display: none;">
                                    <div class="exam-sol-inner">
                                        <p><strong>Αιτιολόγηση:</strong> Από τον ορισμό της ηλεκτρικής ισχύος της πηγής:</p>
                                        <div class="formula-latex">$$P_{\\text{πηγ}} = V \\cdot I = 60\\text{ V} \\cdot 3\\text{ A} = 180\\text{ W}$$</div>
                                        <p><strong>Επαλήθευση μέσω κατανάλωσης:</strong></p>
                                        <div class="formula-latex">$$P_1 = I^2 \\cdot R_1 = 3^2 \\cdot 5 = 45\\text{ W},\\quad P_2 = I^2 \\cdot R_2 = 3^2 \\cdot 15 = 135\\text{ W}$$</div>
                                        <div class="formula-latex">$$P_{\\text{ολ}} = P_1 + P_2 = 45\\text{ W} + 135\\text{ W} = 180\\text{ W}$$</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Q6 -->
                        <div class="exam-question-card glass-card">
                            <div class="exam-q-header">
                                <span class="exam-q-badge">Ερώτημα 6</span>
                                <h4 class="exam-q-title">Διαφορά δυναμικού στα άκρα του διακόπτη [Γ, Δ]</h4>
                            
                                <button class="exam-diagram-toggle-btn theme-a1" id="btn-diag-a1-6" 
                                        onclick="ExamSolutionsGuide.toggleDiagram('a1-6', 'a1')"
                                         title="Κλικ για άνοιγμα/κλείσιμο του διαγράμματος επάνω από το ερώτημα">
                                    <span class="diag-btn-icon">🗺️</span>
                                    <span class="diag-btn-label">Διάγραμμα</span>
                                    <span class="diag-btn-arrow">▾</span>
                                </button>
                            </div>
                            <!-- Collapsible Inline Diagram Drawer (Thema A1) -->
                            <div class="exam-inline-diagram-drawer" id="diag-drawer-a1-6" style="display: none;">
                                <div class="exam-inline-diagram-card theme-a1">
                                    <div class="exam-inline-diagram-header">
                                        <span class="exam-inline-badge theme-a1">⚡ Θέμα Α1: Συνδεσμολογία σε Σειρά</span>
                                        <button type="button" class="exam-inline-close-btn" onclick="ExamSolutionsGuide.toggleDiagram('a1-6', 'a1')" title="Κλείσιμο διαγράμματος">✕</button>
                                    </div>
                                    <div class="exam-inline-diagram-grid">
                                        <div class="exam-inline-diagram-img-wrap" onclick="openDiagramLightbox('assets/images/exam_solutions/circuit_series_a1.png', 'Διάγραμμα Κυκλώματος Θέματος Α1 (Συνδεσμολογία Σειράς)')" title="Κλικ για μεγέθυνση σε πλήρη οθόνη">
                                            <img src="assets/images/exam_solutions/circuit_series_a1.png" alt="Thema A1 Circuit Diagram" loading="lazy" />
                                            <span class="diagram-zoom-hint">🔍 Κλικ για Πλήρη Οθόνη</span>
                                        </div>
                                        <div class="exam-inline-diagram-specs">
                                            <h5 class="exam-inline-specs-heading" style="color: #a78bfa;">Δεδομένα Κυκλώματος Θέματος Α1</h5>
                                            <ul class="exam-inline-specs-list">
                                                <li>Τάση πηγής: <strong>$V = 60\\text{ V}$</strong></li>
                                                <li>Αντιστάτης 1: <strong>$R_1 = 5\\ \\Omega$</strong></li>
                                                <li>Αντιστάτης 2: <strong>$R_2 = 15\\ \\Omega$</strong></li>
                                                <li>Ιδανικοί διακόπτες: <strong>[Γ, Δ]</strong> (κεντρικός), <strong>[Ζ, Η]</strong>, <strong>[Μ, Λ]</strong>, <strong>[Θ, Κ]</strong>, <strong>[Ξ, Ν]</strong></li>
                                                <li>Χαρακτηριστικά σημεία: <strong>Τ, Π, Ρ, Σ</strong></li>
                                                <li><strong>Αρχική Κατάσταση:</strong> Κλείνει <em>μόνο</em> ο κεντρικός διακόπτης [Γ, Δ].</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <p class="exam-q-prompt">
                                Να υπολογίσετε τη διαφορά δυναμικού στα άκρα του κεντρικού διακόπτη [Γ, Δ] όταν το κύκλωμα είναι ανοιχτό.
                            </p>
                            <div class="exam-options-grid" id="opts-grid-a1-6">
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-6', 0)"><span class="opt-label">(α) $15\\text{ V}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-6', 1)"><span class="opt-label">(β) $5\\text{ V}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-6', 2)"><span class="opt-label">(γ) $60\\text{ V}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-6', 3)"><span class="opt-label">(δ) $3\\text{ V}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-6', 4)"><span class="opt-label">(ε) $15\\text{ A}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-6', 5)"><span class="opt-label">(στ) $12\\text{ V}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-6', 6)"><span class="opt-label">(ζ) $0\\text{ V}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-6', 7)"><span class="opt-label">(η) $4\\text{ V}$</span></button>
                            </div>
                            <div class="exam-q-feedback" id="feedback-a1-6" style="display: none;"></div>
                            <div class="exam-sol-wrap">
                                <button class="exam-sol-toggle-btn" id="btn-sol-a1-6" onclick="ExamSolutionsGuide.toggleSolution('a1-6')">
                                    <span>💡</span><span>Επίλυση</span><span class="sol-btn-arrow">▾</span>
                                </button>
                                <div class="exam-solution-body" id="sol-a1-6" style="display: none;">
                                    <div class="exam-sol-inner">
                                        <p><strong>Αιτιολόγηση:</strong> Το κύκλωμα είναι ανοιχτό, οπότε $I = 0$. Επειδή δεν ρέει ρεύμα, δεν υπάρχει πτώση τάσης σε κανέναν αντιστάτη ($V_1 = 0, V_2 = 0$).</p>
                                        <p>Το άκρο Γ συνδέεται μέσω του $R_1$ με τον θετικό πόλο της πηγής ($V_{\\text{Γ}} = V_+ = 160\\text{ V}$).</p>
                                        <p>Το άκρο Δ συνδέεται μέσω του $R_2$ με τον αρνητικό πόλο της πηγής ($V_{\\text{Δ}} = V_- = 100\\text{ V}$).</p>
                                        <div class="formula-latex">$$V_{\\text{ΓΔ}} = V_{\\text{Γ}} - V_{\\text{Δ}} = V_+ - V_- = 60\\text{ V}$$</div>
                                        <p><em>(Σημείωση: Αν ο διακόπτης ήταν κλειστός, ως ιδανικός αγωγός μηδενικής αντίστασης θα είχε $V_{\\text{ΓΔ}} = 0\\text{ V}$).</em></p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Q7 -->
                        <div class="exam-question-card glass-card">
                            <div class="exam-q-header">
                                <span class="exam-q-badge">Ερώτημα 7</span>
                                <h4 class="exam-q-title">Διαφορά δυναμικού στα άκρα του ανοιχτού διακόπτη [Θ, Κ]</h4>
                            
                                <button class="exam-diagram-toggle-btn theme-a1" id="btn-diag-a1-7" 
                                        onclick="ExamSolutionsGuide.toggleDiagram('a1-7', 'a1')"
                                         title="Κλικ για άνοιγμα/κλείσιμο του διαγράμματος επάνω από το ερώτημα">
                                    <span class="diag-btn-icon">🗺️</span>
                                    <span class="diag-btn-label">Διάγραμμα</span>
                                    <span class="diag-btn-arrow">▾</span>
                                </button>
                            </div>
                            <!-- Collapsible Inline Diagram Drawer (Thema A1) -->
                            <div class="exam-inline-diagram-drawer" id="diag-drawer-a1-7" style="display: none;">
                                <div class="exam-inline-diagram-card theme-a1">
                                    <div class="exam-inline-diagram-header">
                                        <span class="exam-inline-badge theme-a1">⚡ Θέμα Α1: Συνδεσμολογία σε Σειρά</span>
                                        <button type="button" class="exam-inline-close-btn" onclick="ExamSolutionsGuide.toggleDiagram('a1-7', 'a1')" title="Κλείσιμο διαγράμματος">✕</button>
                                    </div>
                                    <div class="exam-inline-diagram-grid">
                                        <div class="exam-inline-diagram-img-wrap" onclick="openDiagramLightbox('assets/images/exam_solutions/circuit_series_a1.png', 'Διάγραμμα Κυκλώματος Θέματος Α1 (Συνδεσμολογία Σειράς)')" title="Κλικ για μεγέθυνση σε πλήρη οθόνη">
                                            <img src="assets/images/exam_solutions/circuit_series_a1.png" alt="Thema A1 Circuit Diagram" loading="lazy" />
                                            <span class="diagram-zoom-hint">🔍 Κλικ για Πλήρη Οθόνη</span>
                                        </div>
                                        <div class="exam-inline-diagram-specs">
                                            <h5 class="exam-inline-specs-heading" style="color: #a78bfa;">Δεδομένα Κυκλώματος Θέματος Α1</h5>
                                            <ul class="exam-inline-specs-list">
                                                <li>Τάση πηγής: <strong>$V = 60\\text{ V}$</strong></li>
                                                <li>Αντιστάτης 1: <strong>$R_1 = 5\\ \\Omega$</strong></li>
                                                <li>Αντιστάτης 2: <strong>$R_2 = 15\\ \\Omega$</strong></li>
                                                <li>Ιδανικοί διακόπτες: <strong>[Γ, Δ]</strong> (κεντρικός), <strong>[Ζ, Η]</strong>, <strong>[Μ, Λ]</strong>, <strong>[Θ, Κ]</strong>, <strong>[Ξ, Ν]</strong></li>
                                                <li>Χαρακτηριστικά σημεία: <strong>Τ, Π, Ρ, Σ</strong></li>
                                                <li><strong>Αρχική Κατάσταση:</strong> Κλείνει <em>μόνο</em> ο κεντρικός διακόπτης [Γ, Δ].</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <p class="exam-q-prompt">
                                Να υπολογίσετε τη διαφορά δυναμικού στα άκρα του ανοιχτού διακόπτη [Θ, Κ] (με ανοιχτό τον [Γ, Δ]).
                            </p>
                            <div class="exam-options-grid" id="opts-grid-a1-7">
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-7', 0)"><span class="opt-label">(α) $15\\text{ V}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-7', 1)"><span class="opt-label">(β) $5\\text{ V}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-7', 2)"><span class="opt-label">(γ) $60\\text{ V}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-7', 3)"><span class="opt-label">(δ) $3\\text{ V}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-7', 4)"><span class="opt-label">(ε) $15\\text{ A}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-7', 5)"><span class="opt-label">(στ) $12\\text{ V}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-7', 6)"><span class="opt-label">(ζ) μηδέν <span class="opt-sub">($0\\text{ V}$)</span></span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-7', 7)"><span class="opt-label">(η) $4\\text{ V}$</span></button>
                            </div>
                            <div class="exam-q-feedback" id="feedback-a1-7" style="display: none;"></div>
                            <div class="exam-sol-wrap">
                                <button class="exam-sol-toggle-btn" id="btn-sol-a1-7" onclick="ExamSolutionsGuide.toggleSolution('a1-7')">
                                    <span>💡</span><span>Επίλυση</span><span class="sol-btn-arrow">▾</span>
                                </button>
                                <div class="exam-solution-body" id="sol-a1-7" style="display: none;">
                                    <div class="exam-sol-inner">
                                        <p><strong>Αιτιολόγηση:</strong> Και τα δύο άκρα Θ και Κ του διακόπτη συνδέονται με τον αρνητικό πόλο της πηγής χωρίς να παρεμβάλλεται καμία πηγή. Επειδή $I = 0$, δεν υπάρχει πουθενά πτώση τάσης και $V_{\\text{Θ}} = V_{\\text{Κ}} = V_-$.</p>
                                        <div class="formula-latex">$$V_{\\text{ΘΚ}} = V_{\\text{Θ}} - V_{\\text{Κ}} = 0\\text{ V}$$</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Q8 -->
                        <div class="exam-question-card glass-card">
                            <div class="exam-q-header">
                                <span class="exam-q-badge">Ερώτημα 8</span>
                                <h4 class="exam-q-title">Ενέργεια του $R_1$ εάν κλείσει προσωρινά ο διακόπτης [Ζ, Η]</h4>
                            
                                <button class="exam-diagram-toggle-btn theme-a1" id="btn-diag-a1-8" 
                                        onclick="ExamSolutionsGuide.toggleDiagram('a1-8', 'a1')"
                                         title="Κλικ για άνοιγμα/κλείσιμο του διαγράμματος επάνω από το ερώτημα">
                                    <span class="diag-btn-icon">🗺️</span>
                                    <span class="diag-btn-label">Διάγραμμα</span>
                                    <span class="diag-btn-arrow">▾</span>
                                </button>
                            </div>
                            <!-- Collapsible Inline Diagram Drawer (Thema A1) -->
                            <div class="exam-inline-diagram-drawer" id="diag-drawer-a1-8" style="display: none;">
                                <div class="exam-inline-diagram-card theme-a1">
                                    <div class="exam-inline-diagram-header">
                                        <span class="exam-inline-badge theme-a1">⚡ Θέμα Α1: Συνδεσμολογία σε Σειρά</span>
                                        <button type="button" class="exam-inline-close-btn" onclick="ExamSolutionsGuide.toggleDiagram('a1-8', 'a1')" title="Κλείσιμο διαγράμματος">✕</button>
                                    </div>
                                    <div class="exam-inline-diagram-grid">
                                        <div class="exam-inline-diagram-img-wrap" onclick="openDiagramLightbox('assets/images/exam_solutions/circuit_series_a1.png', 'Διάγραμμα Κυκλώματος Θέματος Α1 (Συνδεσμολογία Σειράς)')" title="Κλικ για μεγέθυνση σε πλήρη οθόνη">
                                            <img src="assets/images/exam_solutions/circuit_series_a1.png" alt="Thema A1 Circuit Diagram" loading="lazy" />
                                            <span class="diagram-zoom-hint">🔍 Κλικ για Πλήρη Οθόνη</span>
                                        </div>
                                        <div class="exam-inline-diagram-specs">
                                            <h5 class="exam-inline-specs-heading" style="color: #a78bfa;">Δεδομένα Κυκλώματος Θέματος Α1</h5>
                                            <ul class="exam-inline-specs-list">
                                                <li>Τάση πηγής: <strong>$V = 60\\text{ V}$</strong></li>
                                                <li>Αντιστάτης 1: <strong>$R_1 = 5\\ \\Omega$</strong></li>
                                                <li>Αντιστάτης 2: <strong>$R_2 = 15\\ \\Omega$</strong></li>
                                                <li>Ιδανικοί διακόπτες: <strong>[Γ, Δ]</strong> (κεντρικός), <strong>[Ζ, Η]</strong>, <strong>[Μ, Λ]</strong>, <strong>[Θ, Κ]</strong>, <strong>[Ξ, Ν]</strong></li>
                                                <li>Χαρακτηριστικά σημεία: <strong>Τ, Π, Ρ, Σ</strong></li>
                                                <li><strong>Αρχική Κατάσταση:</strong> Κλείνει <em>μόνο</em> ο κεντρικός διακόπτης [Γ, Δ].</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <p class="exam-q-prompt">
                                Με κλειστό τον διακόπτη [Γ, Δ], να υπολογίσετε την ενέργεια που καταναλώνει σε χρόνο $t = 10\\text{ s}$ ο αντιστάτης $R_1$, εάν κλείσει προσωρινά ο διακόπτης [Ζ, Η].
                            </p>
                            <div class="exam-options-grid" id="opts-grid-a1-8">
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-8', 0)"><span class="opt-label">(α) άπειρη</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-8', 1)"><span class="opt-label">(β) $3000\\text{ J}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-8', 2)"><span class="opt-label">(γ) $4500\\text{ J}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-8', 3)"><span class="opt-label">(δ) $600\\text{ J}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-8', 4)"><span class="opt-label">(ε) $1800\\text{ J}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-8', 5)"><span class="opt-label">(στ) $1350\\text{ J}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-8', 6)"><span class="opt-label">(ζ) $2400\\text{ J}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-8', 7)"><span class="opt-label">(η) μηδέν <span class="opt-sub">($0\\text{ J}$)</span></span></button>
                            </div>
                            <div class="exam-q-feedback" id="feedback-a1-8" style="display: none;"></div>
                            <div class="exam-sol-wrap">
                                <button class="exam-sol-toggle-btn" id="btn-sol-a1-8" onclick="ExamSolutionsGuide.toggleSolution('a1-8')">
                                    <span>💡</span><span>Επίλυση</span><span class="sol-btn-arrow">▾</span>
                                </button>
                                <div class="exam-solution-body" id="sol-a1-8" style="display: none;">
                                    <div class="exam-sol-inner">
                                        <p><strong>Αιτιολόγηση:</strong> Ο διακόπτης [Ζ, Η] συνδέεται παράλληλα στα άκρα του αντιστάτη $R_1$. Κλείνοντάς τον, προσφέρει έναν εναλλακτικό αγώγιμο δρόμο <em>μηδενικής αντίστασης</em>. Επομένως <strong>βραχυκυκλώνει πλήρως τον $R_1$</strong>!</p>
                                        <p>Όλο το ρεύμα ρέει διαμέσου του διακόπτη [Ζ, Η] παρακάμπτοντας τον $R_1$ ($I_1 = 0\\text{ A}$).</p>
                                        <div class="formula-latex">$$P_1 = I_1^2 \\cdot R_1 = 0\\text{ W} \\implies E_1 = P_1 \\cdot t = 0\\text{ J}\\quad (\\text{μηδέν})$$</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Q9 -->
                        <div class="exam-question-card glass-card">
                            <div class="exam-q-header">
                                <span class="exam-q-badge">Ερώτημα 9</span>
                                <h4 class="exam-q-title">Ρυθμός διέλευσης φορτίου ($\\Delta q/\\Delta t$) μέσα από τον [Γ, Δ] εάν κλείσει ο [Θ, Κ]</h4>
                            
                                <button class="exam-diagram-toggle-btn theme-a1" id="btn-diag-a1-9" 
                                        onclick="ExamSolutionsGuide.toggleDiagram('a1-9', 'a1')"
                                         title="Κλικ για άνοιγμα/κλείσιμο του διαγράμματος επάνω από το ερώτημα">
                                    <span class="diag-btn-icon">🗺️</span>
                                    <span class="diag-btn-label">Διάγραμμα</span>
                                    <span class="diag-btn-arrow">▾</span>
                                </button>
                            </div>
                            <!-- Collapsible Inline Diagram Drawer (Thema A1) -->
                            <div class="exam-inline-diagram-drawer" id="diag-drawer-a1-9" style="display: none;">
                                <div class="exam-inline-diagram-card theme-a1">
                                    <div class="exam-inline-diagram-header">
                                        <span class="exam-inline-badge theme-a1">⚡ Θέμα Α1: Συνδεσμολογία σε Σειρά</span>
                                        <button type="button" class="exam-inline-close-btn" onclick="ExamSolutionsGuide.toggleDiagram('a1-9', 'a1')" title="Κλείσιμο διαγράμματος">✕</button>
                                    </div>
                                    <div class="exam-inline-diagram-grid">
                                        <div class="exam-inline-diagram-img-wrap" onclick="openDiagramLightbox('assets/images/exam_solutions/circuit_series_a1.png', 'Διάγραμμα Κυκλώματος Θέματος Α1 (Συνδεσμολογία Σειράς)')" title="Κλικ για μεγέθυνση σε πλήρη οθόνη">
                                            <img src="assets/images/exam_solutions/circuit_series_a1.png" alt="Thema A1 Circuit Diagram" loading="lazy" />
                                            <span class="diagram-zoom-hint">🔍 Κλικ για Πλήρη Οθόνη</span>
                                        </div>
                                        <div class="exam-inline-diagram-specs">
                                            <h5 class="exam-inline-specs-heading" style="color: #a78bfa;">Δεδομένα Κυκλώματος Θέματος Α1</h5>
                                            <ul class="exam-inline-specs-list">
                                                <li>Τάση πηγής: <strong>$V = 60\\text{ V}$</strong></li>
                                                <li>Αντιστάτης 1: <strong>$R_1 = 5\\ \\Omega$</strong></li>
                                                <li>Αντιστάτης 2: <strong>$R_2 = 15\\ \\Omega$</strong></li>
                                                <li>Ιδανικοί διακόπτες: <strong>[Γ, Δ]</strong> (κεντρικός), <strong>[Ζ, Η]</strong>, <strong>[Μ, Λ]</strong>, <strong>[Θ, Κ]</strong>, <strong>[Ξ, Ν]</strong></li>
                                                <li>Χαρακτηριστικά σημεία: <strong>Τ, Π, Ρ, Σ</strong></li>
                                                <li><strong>Αρχική Κατάσταση:</strong> Κλείνει <em>μόνο</em> ο κεντρικός διακόπτης [Γ, Δ].</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <p class="exam-q-prompt">
                                Να υπολογίσετε τον ρυθμό διέλευσης φορτίου ($I$) μέσα από τον κεντρικό διακόπτη [Γ, Δ], εάν κλείσει προσωρινά ο διακόπτης [Θ, Κ].
                            </p>
                            <div class="exam-options-grid" id="opts-grid-a1-9">
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-9', 0)"><span class="opt-label">(α) $10\\text{ A}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-9', 1)"><span class="opt-label">(β) άπειρος</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-9', 2)"><span class="opt-label">(γ) $45\\text{ C/s}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-9', 3)"><span class="opt-label">(δ) μηδέν</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-9', 4)"><span class="opt-label">(ε) $14\\text{ C/s}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-9', 5)"><span class="opt-label">(στ) $12\\text{ A}$ <span class="opt-sub">($12\\text{ C/s}$)</span></span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-9', 6)"><span class="opt-label">(ζ) $120\\text{ A}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-9', 7)"><span class="opt-label">(η) $8\\text{ C/s}$</span></button>
                            </div>
                            <div class="exam-q-feedback" id="feedback-a1-9" style="display: none;"></div>
                            <div class="exam-sol-wrap">
                                <button class="exam-sol-toggle-btn" id="btn-sol-a1-9" onclick="ExamSolutionsGuide.toggleSolution('a1-9')">
                                    <span>💡</span><span>Επίλυση</span><span class="sol-btn-arrow">▾</span>
                                </button>
                                <div class="exam-solution-body" id="sol-a1-9" style="display: none;">
                                    <div class="exam-sol-inner">
                                        <p><strong>Αιτιολόγηση:</strong> Ο ρυθμός διέλευσης φορτίου ορίζεται ως η ένταση του ρεύματος: $I = \\frac{\\Delta q}{\\Delta t}$.</p>
                                        <p>Το κλείσιμο του διακόπτη [Θ, Κ] <strong>βραχυκυκλώνει τον αντιστάτη $R_2$</strong>. Τώρα ο μόνος ενεργός αντιστάτης στο κύκλωμα είναι ο $R_1 = 5\\ \\Omega$:</p>
                                        <div class="formula-latex">$$R_{\\text{ολ}}' = R_1 = 5\\ \\Omega$$</div>
                                        <div class="formula-latex">$$I' = \\frac{V}{R_{\\text{ολ}}'} = \\frac{60\\text{ V}}{5\\ \\Omega} = 12\\text{ A} = 12\\text{ C/s}$$</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Q10 -->
                        <div class="exam-question-card glass-card">
                            <div class="exam-q-header">
                                <span class="exam-q-badge">Ερώτημα 10</span>
                                <h4 class="exam-q-title">Ποσότητα φορτίου από το σημείο Α σε $t = 10\\text{ s}$ εάν κλείσει ο [Μ, Λ]</h4>
                            
                                <button class="exam-diagram-toggle-btn theme-a1" id="btn-diag-a1-10" 
                                        onclick="ExamSolutionsGuide.toggleDiagram('a1-10', 'a1')"
                                         title="Κλικ για άνοιγμα/κλείσιμο του διαγράμματος επάνω από το ερώτημα">
                                    <span class="diag-btn-icon">🗺️</span>
                                    <span class="diag-btn-label">Διάγραμμα</span>
                                    <span class="diag-btn-arrow">▾</span>
                                </button>
                            </div>
                            <!-- Collapsible Inline Diagram Drawer (Thema A1) -->
                            <div class="exam-inline-diagram-drawer" id="diag-drawer-a1-10" style="display: none;">
                                <div class="exam-inline-diagram-card theme-a1">
                                    <div class="exam-inline-diagram-header">
                                        <span class="exam-inline-badge theme-a1">⚡ Θέμα Α1: Συνδεσμολογία σε Σειρά</span>
                                        <button type="button" class="exam-inline-close-btn" onclick="ExamSolutionsGuide.toggleDiagram('a1-10', 'a1')" title="Κλείσιμο διαγράμματος">✕</button>
                                    </div>
                                    <div class="exam-inline-diagram-grid">
                                        <div class="exam-inline-diagram-img-wrap" onclick="openDiagramLightbox('assets/images/exam_solutions/circuit_series_a1.png', 'Διάγραμμα Κυκλώματος Θέματος Α1 (Συνδεσμολογία Σειράς)')" title="Κλικ για μεγέθυνση σε πλήρη οθόνη">
                                            <img src="assets/images/exam_solutions/circuit_series_a1.png" alt="Thema A1 Circuit Diagram" loading="lazy" />
                                            <span class="diagram-zoom-hint">🔍 Κλικ για Πλήρη Οθόνη</span>
                                        </div>
                                        <div class="exam-inline-diagram-specs">
                                            <h5 class="exam-inline-specs-heading" style="color: #a78bfa;">Δεδομένα Κυκλώματος Θέματος Α1</h5>
                                            <ul class="exam-inline-specs-list">
                                                <li>Τάση πηγής: <strong>$V = 60\\text{ V}$</strong></li>
                                                <li>Αντιστάτης 1: <strong>$R_1 = 5\\ \\Omega$</strong></li>
                                                <li>Αντιστάτης 2: <strong>$R_2 = 15\\ \\Omega$</strong></li>
                                                <li>Ιδανικοί διακόπτες: <strong>[Γ, Δ]</strong> (κεντρικός), <strong>[Ζ, Η]</strong>, <strong>[Μ, Λ]</strong>, <strong>[Θ, Κ]</strong>, <strong>[Ξ, Ν]</strong></li>
                                                <li>Χαρακτηριστικά σημεία: <strong>Τ, Π, Ρ, Σ</strong></li>
                                                <li><strong>Αρχική Κατάσταση:</strong> Κλείνει <em>μόνο</em> ο κεντρικός διακόπτης [Γ, Δ].</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <p class="exam-q-prompt">
                                Να υπολογίσετε το φορτίο $q$ που διέρχεται από το σημείο Α σε χρόνο $t = 10\\text{ s}$, εάν κλείσει προσωρινά ο διακόπτης [Μ, Λ].
                            </p>
                            <div class="exam-options-grid" id="opts-grid-a1-10">
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-10', 0)"><span class="opt-label">(α) $100\\text{ C}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-10', 1)"><span class="opt-label">(β) $30\\text{ C}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-10', 2)"><span class="opt-label">(γ) $45\\text{ C}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-10', 3)"><span class="opt-label">(δ) $60\\text{ C}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-10', 4)"><span class="opt-label">(ε) $180\\text{ C}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-10', 5)"><span class="opt-label">(στ) $135\\text{ C}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-10', 6)"><span class="opt-label">(ζ) $120\\text{ C}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-10', 7)"><span class="opt-label">(η) $200\\text{ C}$</span></button>
                            </div>
                            <div class="exam-q-feedback" id="feedback-a1-10" style="display: none;"></div>
                            <div class="exam-sol-wrap">
                                <button class="exam-sol-toggle-btn" id="btn-sol-a1-10" onclick="ExamSolutionsGuide.toggleSolution('a1-10')">
                                    <span>💡</span><span>Επίλυση</span><span class="sol-btn-arrow">▾</span>
                                </button>
                                <div class="exam-solution-body" id="sol-a1-10" style="display: none;">
                                    <div class="exam-sol-inner">
                                        <p><strong>Αιτιολόγηση:</strong> Ο διακόπτης [Μ, Λ] συνδέει δύο σημεία του ίδιου αγώγιμου καλωδίου που βρίσκονται στο ίδιο δυναμικό ($V_{\\text{Μ}} = V_{\\text{Λ}}$). Δεν παρακάμπτει κανέναν αντιστάτη και δεν ενώνει διαφορετικούς πόλους.</p>
                                        <p>Συνεπώς, το κύκλωμα παραμένει λειτουργικά <strong>αμετάβλητο</strong> ($I = 3\\text{ A}$).</p>
                                        <div class="formula-latex">$$q = I \\cdot t = 3\\text{ A} \\cdot 10\\text{ s} = 30\\text{ C}$$</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Q11 -->
                        <div class="exam-question-card glass-card">
                            <div class="exam-q-header">
                                <span class="exam-q-badge">Ερώτημα 11</span>
                                <h4 class="exam-q-title">Ενέργεια που καταναλώνει ο $R_1$ σε $t = 10\\text{ s}$ εάν κλείσει ο [Θ, Κ]</h4>
                            
                                <button class="exam-diagram-toggle-btn theme-a1" id="btn-diag-a1-11" 
                                        onclick="ExamSolutionsGuide.toggleDiagram('a1-11', 'a1')"
                                         title="Κλικ για άνοιγμα/κλείσιμο του διαγράμματος επάνω από το ερώτημα">
                                    <span class="diag-btn-icon">🗺️</span>
                                    <span class="diag-btn-label">Διάγραμμα</span>
                                    <span class="diag-btn-arrow">▾</span>
                                </button>
                            </div>
                            <!-- Collapsible Inline Diagram Drawer (Thema A1) -->
                            <div class="exam-inline-diagram-drawer" id="diag-drawer-a1-11" style="display: none;">
                                <div class="exam-inline-diagram-card theme-a1">
                                    <div class="exam-inline-diagram-header">
                                        <span class="exam-inline-badge theme-a1">⚡ Θέμα Α1: Συνδεσμολογία σε Σειρά</span>
                                        <button type="button" class="exam-inline-close-btn" onclick="ExamSolutionsGuide.toggleDiagram('a1-11', 'a1')" title="Κλείσιμο διαγράμματος">✕</button>
                                    </div>
                                    <div class="exam-inline-diagram-grid">
                                        <div class="exam-inline-diagram-img-wrap" onclick="openDiagramLightbox('assets/images/exam_solutions/circuit_series_a1.png', 'Διάγραμμα Κυκλώματος Θέματος Α1 (Συνδεσμολογία Σειράς)')" title="Κλικ για μεγέθυνση σε πλήρη οθόνη">
                                            <img src="assets/images/exam_solutions/circuit_series_a1.png" alt="Thema A1 Circuit Diagram" loading="lazy" />
                                            <span class="diagram-zoom-hint">🔍 Κλικ για Πλήρη Οθόνη</span>
                                        </div>
                                        <div class="exam-inline-diagram-specs">
                                            <h5 class="exam-inline-specs-heading" style="color: #a78bfa;">Δεδομένα Κυκλώματος Θέματος Α1</h5>
                                            <ul class="exam-inline-specs-list">
                                                <li>Τάση πηγής: <strong>$V = 60\\text{ V}$</strong></li>
                                                <li>Αντιστάτης 1: <strong>$R_1 = 5\\ \\Omega$</strong></li>
                                                <li>Αντιστάτης 2: <strong>$R_2 = 15\\ \\Omega$</strong></li>
                                                <li>Ιδανικοί διακόπτες: <strong>[Γ, Δ]</strong> (κεντρικός), <strong>[Ζ, Η]</strong>, <strong>[Μ, Λ]</strong>, <strong>[Θ, Κ]</strong>, <strong>[Ξ, Ν]</strong></li>
                                                <li>Χαρακτηριστικά σημεία: <strong>Τ, Π, Ρ, Σ</strong></li>
                                                <li><strong>Αρχική Κατάσταση:</strong> Κλείνει <em>μόνο</em> ο κεντρικός διακόπτης [Γ, Δ].</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <p class="exam-q-prompt">
                                Να υπολογίσετε την ενέργεια $E_1$ που καταναλώνει σε $t = 10\\text{ s}$ ο $R_1$, εάν κλείσει προσωρινά ο διακόπτης [Θ, Κ].
                            </p>
                            <div class="exam-options-grid" id="opts-grid-a1-11">
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-11', 0)"><span class="opt-label">(α) μηδέν</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-11', 1)"><span class="opt-label">(β) $3000\\text{ J}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-11', 2)"><span class="opt-label">(γ) $4500\\text{ J}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-11', 3)"><span class="opt-label">(δ) $600\\text{ J}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-11', 4)"><span class="opt-label">(ε) άπειρη</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-11', 5)"><span class="opt-label">(στ) $1350\\text{ J}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-11', 6)"><span class="opt-label">(ζ) $7200\\text{ J}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-11', 7)"><span class="opt-label">(η) $2000\\text{ J}$</span></button>
                            </div>
                            <div class="exam-q-feedback" id="feedback-a1-11" style="display: none;"></div>
                            <div class="exam-sol-wrap">
                                <button class="exam-sol-toggle-btn" id="btn-sol-a1-11" onclick="ExamSolutionsGuide.toggleSolution('a1-11')">
                                    <span>💡</span><span>Επίλυση</span><span class="sol-btn-arrow">▾</span>
                                </button>
                                <div class="exam-solution-body" id="sol-a1-11" style="display: none;">
                                    <div class="exam-sol-inner">
                                        <p><strong>Αιτιολόγηση:</strong> Όπως διαπιστώθηκε στο Ερώτημα 9, με βραχυκυκλωμένο τον $R_2$, το ρεύμα αυξάνεται στα $I' = 12\\text{ A}$.</p>
                                        <p>Η ισχύς που αναπτύσσεται στον $R_1$ γίνεται:</p>
                                        <div class="formula-latex">$$P_1' = I'^2 \\cdot R_1 = 12^2 \\cdot 5 = 144 \\cdot 5 = 720\\text{ W}$$</div>
                                        <p>Η καταναλισκόμενη ενέργεια σε $t = 10\\text{ s}$ είναι:</p>
                                        <div class="formula-latex">$$E_1 = P_1' \\cdot t = 720\\text{ W} \\cdot 10\\text{ s} = 7200\\text{ J}$$</div>
                                        <p><em>(Σύγκριση: στο κανονικό κύκλωμα κατανάλωνε $45\\text{ W} \\cdot 10\\text{ s} = 450\\text{ J}$. Λόγω του βραχυκυκλώματος του άλλου αντιστάτη, η καταπόνηση εκτοξεύεται κατά 16 φορές!).</em></p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Q12 -->
                        <div class="exam-question-card glass-card">
                            <div class="exam-q-header">
                                <span class="exam-q-badge">Ερώτημα 12</span>
                                <h4 class="exam-q-title">Ισχύς πηγής εάν κλείσουν ταυτόχρονα οι διακόπτες [Μ, Λ] και [Ξ, Ν]</h4>
                            
                                <button class="exam-diagram-toggle-btn theme-a1" id="btn-diag-a1-12" 
                                        onclick="ExamSolutionsGuide.toggleDiagram('a1-12', 'a1')"
                                         title="Κλικ για άνοιγμα/κλείσιμο του διαγράμματος επάνω από το ερώτημα">
                                    <span class="diag-btn-icon">🗺️</span>
                                    <span class="diag-btn-label">Διάγραμμα</span>
                                    <span class="diag-btn-arrow">▾</span>
                                </button>
                            </div>
                            <!-- Collapsible Inline Diagram Drawer (Thema A1) -->
                            <div class="exam-inline-diagram-drawer" id="diag-drawer-a1-12" style="display: none;">
                                <div class="exam-inline-diagram-card theme-a1">
                                    <div class="exam-inline-diagram-header">
                                        <span class="exam-inline-badge theme-a1">⚡ Θέμα Α1: Συνδεσμολογία σε Σειρά</span>
                                        <button type="button" class="exam-inline-close-btn" onclick="ExamSolutionsGuide.toggleDiagram('a1-12', 'a1')" title="Κλείσιμο διαγράμματος">✕</button>
                                    </div>
                                    <div class="exam-inline-diagram-grid">
                                        <div class="exam-inline-diagram-img-wrap" onclick="openDiagramLightbox('assets/images/exam_solutions/circuit_series_a1.png', 'Διάγραμμα Κυκλώματος Θέματος Α1 (Συνδεσμολογία Σειράς)')" title="Κλικ για μεγέθυνση σε πλήρη οθόνη">
                                            <img src="assets/images/exam_solutions/circuit_series_a1.png" alt="Thema A1 Circuit Diagram" loading="lazy" />
                                            <span class="diagram-zoom-hint">🔍 Κλικ για Πλήρη Οθόνη</span>
                                        </div>
                                        <div class="exam-inline-diagram-specs">
                                            <h5 class="exam-inline-specs-heading" style="color: #a78bfa;">Δεδομένα Κυκλώματος Θέματος Α1</h5>
                                            <ul class="exam-inline-specs-list">
                                                <li>Τάση πηγής: <strong>$V = 60\\text{ V}$</strong></li>
                                                <li>Αντιστάτης 1: <strong>$R_1 = 5\\ \\Omega$</strong></li>
                                                <li>Αντιστάτης 2: <strong>$R_2 = 15\\ \\Omega$</strong></li>
                                                <li>Ιδανικοί διακόπτες: <strong>[Γ, Δ]</strong> (κεντρικός), <strong>[Ζ, Η]</strong>, <strong>[Μ, Λ]</strong>, <strong>[Θ, Κ]</strong>, <strong>[Ξ, Ν]</strong></li>
                                                <li>Χαρακτηριστικά σημεία: <strong>Τ, Π, Ρ, Σ</strong></li>
                                                <li><strong>Αρχική Κατάσταση:</strong> Κλείνει <em>μόνο</em> ο κεντρικός διακόπτης [Γ, Δ].</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <p class="exam-q-prompt">
                                Να υπολογίσετε την ισχύ που παράγει η πηγή, εάν κλείσουν προσωρινά οι διακόπτες [Μ, Λ] και [Ξ, Ν].
                            </p>
                            <div class="exam-options-grid" id="opts-grid-a1-12">
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-12', 0)"><span class="opt-label">(α) $2400\\text{ W}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-12', 1)"><span class="opt-label">(β) $300\\text{ W}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-12', 2)"><span class="opt-label">(γ) $450\\text{ W}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-12', 3)"><span class="opt-label">(δ) $60\\text{ W}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-12', 4)"><span class="opt-label">(ε) άπειρη <span class="opt-sub">(ολικό βραχυκύκλωμα)</span></span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-12', 5)"><span class="opt-label">(στ) μηδέν</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-12', 6)"><span class="opt-label">(ζ) $1200\\text{ W}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-12', 7)"><span class="opt-label">(η) $2000\\text{ W}$</span></button>
                            </div>
                            <div class="exam-q-feedback" id="feedback-a1-12" style="display: none;"></div>
                            <div class="exam-sol-wrap">
                                <button class="exam-sol-toggle-btn" id="btn-sol-a1-12" onclick="ExamSolutionsGuide.toggleSolution('a1-12')">
                                    <span>💡</span><span>Επίλυση</span><span class="sol-btn-arrow">▾</span>
                                </button>
                                <div class="exam-solution-body" id="sol-a1-12" style="display: none;">
                                    <div class="exam-sol-inner">
                                        <p><strong>Αιτιολόγηση:</strong> Το ταυτόχρονο κλείσιμο των διακοπτών [Μ, Λ] και [Ξ, Ν] δημιουργεί έναν άμεσο αγώγιμο δρόμο μηδενικής αντίστασης ανάμεσα στον θετικό και τον αρνητικό πόλο της πηγής.</p>
                                        <p>Αυτό συνιστά <strong>Ολικό Βραχυκύκλωμα της Πηγής</strong>:</p>
                                        <div class="formula-latex">$$R_{\\text{ολ}} \\to 0 \\implies I = \\frac{V}{R_{\\text{ολ}}} \\to \\infty \\implies P = \\frac{V^2}{R_{\\text{ολ}}} \\to \\infty$$</div>
                                        <p>Στην πράξη προκαλείται άμεση υπερθέρμανση, καταστροφή της πηγής και κίνδυνος πυρκαγιάς.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Q13 -->
                        <div class="exam-question-card glass-card">
                            <div class="exam-q-header">
                                <span class="exam-q-badge">Ερώτημα 13</span>
                                <h4 class="exam-q-title">Ρυθμός κατανάλωσης ενέργειας (ισχύς) του $R_1$ αν ενωθούν τα σημεία Ε και Γ</h4>
                            
                                <button class="exam-diagram-toggle-btn theme-a1" id="btn-diag-a1-13" 
                                        onclick="ExamSolutionsGuide.toggleDiagram('a1-13', 'a1')"
                                         title="Κλικ για άνοιγμα/κλείσιμο του διαγράμματος επάνω από το ερώτημα">
                                    <span class="diag-btn-icon">🗺️</span>
                                    <span class="diag-btn-label">Διάγραμμα</span>
                                    <span class="diag-btn-arrow">▾</span>
                                </button>
                            </div>
                            <!-- Collapsible Inline Diagram Drawer (Thema A1) -->
                            <div class="exam-inline-diagram-drawer" id="diag-drawer-a1-13" style="display: none;">
                                <div class="exam-inline-diagram-card theme-a1">
                                    <div class="exam-inline-diagram-header">
                                        <span class="exam-inline-badge theme-a1">⚡ Θέμα Α1: Συνδεσμολογία σε Σειρά</span>
                                        <button type="button" class="exam-inline-close-btn" onclick="ExamSolutionsGuide.toggleDiagram('a1-13', 'a1')" title="Κλείσιμο διαγράμματος">✕</button>
                                    </div>
                                    <div class="exam-inline-diagram-grid">
                                        <div class="exam-inline-diagram-img-wrap" onclick="openDiagramLightbox('assets/images/exam_solutions/circuit_series_a1.png', 'Διάγραμμα Κυκλώματος Θέματος Α1 (Συνδεσμολογία Σειράς)')" title="Κλικ για μεγέθυνση σε πλήρη οθόνη">
                                            <img src="assets/images/exam_solutions/circuit_series_a1.png" alt="Thema A1 Circuit Diagram" loading="lazy" />
                                            <span class="diagram-zoom-hint">🔍 Κλικ για Πλήρη Οθόνη</span>
                                        </div>
                                        <div class="exam-inline-diagram-specs">
                                            <h5 class="exam-inline-specs-heading" style="color: #a78bfa;">Δεδομένα Κυκλώματος Θέματος Α1</h5>
                                            <ul class="exam-inline-specs-list">
                                                <li>Τάση πηγής: <strong>$V = 60\\text{ V}$</strong></li>
                                                <li>Αντιστάτης 1: <strong>$R_1 = 5\\ \\Omega$</strong></li>
                                                <li>Αντιστάτης 2: <strong>$R_2 = 15\\ \\Omega$</strong></li>
                                                <li>Ιδανικοί διακόπτες: <strong>[Γ, Δ]</strong> (κεντρικός), <strong>[Ζ, Η]</strong>, <strong>[Μ, Λ]</strong>, <strong>[Θ, Κ]</strong>, <strong>[Ξ, Ν]</strong></li>
                                                <li>Χαρακτηριστικά σημεία: <strong>Τ, Π, Ρ, Σ</strong></li>
                                                <li><strong>Αρχική Κατάσταση:</strong> Κλείνει <em>μόνο</em> ο κεντρικός διακόπτης [Γ, Δ].</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <p class="exam-q-prompt">
                                Να υπολογίσετε τον ρυθμό κατανάλωσης ενέργειας του $R_1$, εάν ενώσουμε προσωρινά με ιδανικό καλώδιο τα σημεία Ε και Γ.
                            </p>
                            <div class="exam-options-grid" id="opts-grid-a1-13">
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-13', 0)"><span class="opt-label">(α) $1000\\text{ J/s}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-13', 1)"><span class="opt-label">(β) μηδέν <span class="opt-sub">($0\\text{ W}$)</span></span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-13', 2)"><span class="opt-label">(γ) $450\\text{ J/s}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-13', 3)"><span class="opt-label">(δ) $60\\text{ W}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-13', 4)"><span class="opt-label">(ε) $1800\\text{ W}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-13', 5)"><span class="opt-label">(στ) $1350\\text{ W}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-13', 6)"><span class="opt-label">(ζ) άπειρος</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-13', 7)"><span class="opt-label">(η) $2000\\text{ J/s}$</span></button>
                            </div>
                            <div class="exam-q-feedback" id="feedback-a1-13" style="display: none;"></div>
                            <div class="exam-sol-wrap">
                                <button class="exam-sol-toggle-btn" id="btn-sol-a1-13" onclick="ExamSolutionsGuide.toggleSolution('a1-13')">
                                    <span>💡</span><span>Επίλυση</span><span class="sol-btn-arrow">▾</span>
                                </button>
                                <div class="exam-solution-body" id="sol-a1-13" style="display: none;">
                                    <div class="exam-sol-inner">
                                        <p><strong>Αιτιολόγηση:</strong> Ο ρυθμός κατανάλωσης ενέργειας είναι η ηλεκτρική ισχύς ($P_1 = \\frac{\\Delta E}{\\Delta t}$).</p>
                                        <p>Τα σημεία Ε και Γ είναι ακριβώς τα δύο άκρα του αντιστάτη $R_1$. Ενώνοντάς τα με ιδανικό καλώδιο, ο αντιστάτης βραχυκυκλώνεται πλήρως. Το ρεύμα παρακάμπτει τον $R_1$ ($I_1 = 0$), άρα:</p>
                                        <div class="formula-latex">$$P_1 = 0\\text{ W} = 0\\text{ J/s}\\quad (\\text{μηδέν})$$</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Q14 -->
                        <div class="exam-question-card glass-card">
                            <div class="exam-q-header">
                                <span class="exam-q-badge">Ερώτημα 14</span>
                                <h4 class="exam-q-title">Διαφορά δυναμικού στα άκρα του $R_2$ εάν ενωθούν τα σημεία Δ και Μ</h4>
                            
                                <button class="exam-diagram-toggle-btn theme-a1" id="btn-diag-a1-14" 
                                        onclick="ExamSolutionsGuide.toggleDiagram('a1-14', 'a1')"
                                         title="Κλικ για άνοιγμα/κλείσιμο του διαγράμματος επάνω από το ερώτημα">
                                    <span class="diag-btn-icon">🗺️</span>
                                    <span class="diag-btn-label">Διάγραμμα</span>
                                    <span class="diag-btn-arrow">▾</span>
                                </button>
                            </div>
                            <!-- Collapsible Inline Diagram Drawer (Thema A1) -->
                            <div class="exam-inline-diagram-drawer" id="diag-drawer-a1-14" style="display: none;">
                                <div class="exam-inline-diagram-card theme-a1">
                                    <div class="exam-inline-diagram-header">
                                        <span class="exam-inline-badge theme-a1">⚡ Θέμα Α1: Συνδεσμολογία σε Σειρά</span>
                                        <button type="button" class="exam-inline-close-btn" onclick="ExamSolutionsGuide.toggleDiagram('a1-14', 'a1')" title="Κλείσιμο διαγράμματος">✕</button>
                                    </div>
                                    <div class="exam-inline-diagram-grid">
                                        <div class="exam-inline-diagram-img-wrap" onclick="openDiagramLightbox('assets/images/exam_solutions/circuit_series_a1.png', 'Διάγραμμα Κυκλώματος Θέματος Α1 (Συνδεσμολογία Σειράς)')" title="Κλικ για μεγέθυνση σε πλήρη οθόνη">
                                            <img src="assets/images/exam_solutions/circuit_series_a1.png" alt="Thema A1 Circuit Diagram" loading="lazy" />
                                            <span class="diagram-zoom-hint">🔍 Κλικ για Πλήρη Οθόνη</span>
                                        </div>
                                        <div class="exam-inline-diagram-specs">
                                            <h5 class="exam-inline-specs-heading" style="color: #a78bfa;">Δεδομένα Κυκλώματος Θέματος Α1</h5>
                                            <ul class="exam-inline-specs-list">
                                                <li>Τάση πηγής: <strong>$V = 60\\text{ V}$</strong></li>
                                                <li>Αντιστάτης 1: <strong>$R_1 = 5\\ \\Omega$</strong></li>
                                                <li>Αντιστάτης 2: <strong>$R_2 = 15\\ \\Omega$</strong></li>
                                                <li>Ιδανικοί διακόπτες: <strong>[Γ, Δ]</strong> (κεντρικός), <strong>[Ζ, Η]</strong>, <strong>[Μ, Λ]</strong>, <strong>[Θ, Κ]</strong>, <strong>[Ξ, Ν]</strong></li>
                                                <li>Χαρακτηριστικά σημεία: <strong>Τ, Π, Ρ, Σ</strong></li>
                                                <li><strong>Αρχική Κατάσταση:</strong> Κλείνει <em>μόνο</em> ο κεντρικός διακόπτης [Γ, Δ].</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <p class="exam-q-prompt">
                                Να υπολογίσετε τη διαφορά δυναμικού στα άκρα του αντιστάτη $R_2$, εάν ενώσουμε προσωρινά με ένα ιδανικό καλώδιο τα σημεία Δ και Μ.
                            </p>
                            <div class="exam-options-grid" id="opts-grid-a1-14">
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-14', 0)"><span class="opt-label">(α) $45\\text{ V}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-14', 1)"><span class="opt-label">(β) $15\\text{ V}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-14', 2)"><span class="opt-label">(γ) μηδέν <span class="opt-sub">($0\\text{ V}$)</span></span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-14', 3)"><span class="opt-label">(δ) $12\\text{ V}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-14', 4)"><span class="opt-label">(ε) $4\\text{ V}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-14', 5)"><span class="opt-label">(στ) $120\\text{ V}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-14', 6)"><span class="opt-label">(ζ) άπειρη</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-14', 7)"><span class="opt-label">(η) $60\\text{ V}$</span></button>
                            </div>
                            <div class="exam-q-feedback" id="feedback-a1-14" style="display: none;"></div>
                            <div class="exam-sol-wrap">
                                <button class="exam-sol-toggle-btn" id="btn-sol-a1-14" onclick="ExamSolutionsGuide.toggleSolution('a1-14')">
                                    <span>💡</span><span>Επίλυση</span><span class="sol-btn-arrow">▾</span>
                                </button>
                                <div class="exam-solution-body" id="sol-a1-14" style="display: none;">
                                    <div class="exam-sol-inner">
                                        <p><strong>Αιτιολόγηση:</strong> Η ένωση των σημείων Δ και Μ με ιδανικό καλώδιο προσφέρει παρακαμπτήριο δρόμο μηδενικής αντίστασης στα άκρα του αντιστάτη $R_2$.</p>
                                        <p>Ο $R_2$ βραχυκυκλώνεται και η διαφορά δυναμικού μεταξύ των άκρων του μηδενίζεται:</p>
                                        <div class="formula-latex">$$V_2 = 0\\text{ V}$$</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Q15 -->
                        <div class="exam-question-card glass-card">
                            <div class="exam-q-header">
                                <span class="exam-q-badge">Ερώτημα 15</span>
                                <h4 class="exam-q-title">Ενέργεια πηγής σε $t = 20\\text{ s}$ εάν ενωθούν τα σημεία Η και Ν</h4>
                            
                                <button class="exam-diagram-toggle-btn theme-a1" id="btn-diag-a1-15" 
                                        onclick="ExamSolutionsGuide.toggleDiagram('a1-15', 'a1')"
                                         title="Κλικ για άνοιγμα/κλείσιμο του διαγράμματος επάνω από το ερώτημα">
                                    <span class="diag-btn-icon">🗺️</span>
                                    <span class="diag-btn-label">Διάγραμμα</span>
                                    <span class="diag-btn-arrow">▾</span>
                                </button>
                            </div>
                            <!-- Collapsible Inline Diagram Drawer (Thema A1) -->
                            <div class="exam-inline-diagram-drawer" id="diag-drawer-a1-15" style="display: none;">
                                <div class="exam-inline-diagram-card theme-a1">
                                    <div class="exam-inline-diagram-header">
                                        <span class="exam-inline-badge theme-a1">⚡ Θέμα Α1: Συνδεσμολογία σε Σειρά</span>
                                        <button type="button" class="exam-inline-close-btn" onclick="ExamSolutionsGuide.toggleDiagram('a1-15', 'a1')" title="Κλείσιμο διαγράμματος">✕</button>
                                    </div>
                                    <div class="exam-inline-diagram-grid">
                                        <div class="exam-inline-diagram-img-wrap" onclick="openDiagramLightbox('assets/images/exam_solutions/circuit_series_a1.png', 'Διάγραμμα Κυκλώματος Θέματος Α1 (Συνδεσμολογία Σειράς)')" title="Κλικ για μεγέθυνση σε πλήρη οθόνη">
                                            <img src="assets/images/exam_solutions/circuit_series_a1.png" alt="Thema A1 Circuit Diagram" loading="lazy" />
                                            <span class="diagram-zoom-hint">🔍 Κλικ για Πλήρη Οθόνη</span>
                                        </div>
                                        <div class="exam-inline-diagram-specs">
                                            <h5 class="exam-inline-specs-heading" style="color: #a78bfa;">Δεδομένα Κυκλώματος Θέματος Α1</h5>
                                            <ul class="exam-inline-specs-list">
                                                <li>Τάση πηγής: <strong>$V = 60\\text{ V}$</strong></li>
                                                <li>Αντιστάτης 1: <strong>$R_1 = 5\\ \\Omega$</strong></li>
                                                <li>Αντιστάτης 2: <strong>$R_2 = 15\\ \\Omega$</strong></li>
                                                <li>Ιδανικοί διακόπτες: <strong>[Γ, Δ]</strong> (κεντρικός), <strong>[Ζ, Η]</strong>, <strong>[Μ, Λ]</strong>, <strong>[Θ, Κ]</strong>, <strong>[Ξ, Ν]</strong></li>
                                                <li>Χαρακτηριστικά σημεία: <strong>Τ, Π, Ρ, Σ</strong></li>
                                                <li><strong>Αρχική Κατάσταση:</strong> Κλείνει <em>μόνο</em> ο κεντρικός διακόπτης [Γ, Δ].</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <p class="exam-q-prompt">
                                Να υπολογίσετε την ενέργεια που προσφέρει η πηγή στο κύκλωμα σε χρόνο $t = 20\\text{ s}$, εάν ενώσουμε προσωρινά με ιδανικό καλώδιο τα σημεία Η και Ν.
                            </p>
                            <div class="exam-options-grid" id="opts-grid-a1-15">
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-15', 0)"><span class="opt-label">(α) $10000\\text{ J}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-15', 1)"><span class="opt-label">(β) άπειρη</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-15', 2)"><span class="opt-label">(γ) μηδέν</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-15', 3)"><span class="opt-label">(δ) $14400\\text{ J}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-15', 4)"><span class="opt-label">(ε) $18000\\text{ J}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-15', 5)"><span class="opt-label">(στ) $1450\\text{ J}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-15', 6)"><span class="opt-label">(ζ) $12000\\text{ J}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a1-15', 7)"><span class="opt-label">(η) $20000\\text{ J}$</span></button>
                            </div>
                            <div class="exam-q-feedback" id="feedback-a1-15" style="display: none;"></div>
                            <div class="exam-sol-wrap">
                                <button class="exam-sol-toggle-btn" id="btn-sol-a1-15" onclick="ExamSolutionsGuide.toggleSolution('a1-15')">
                                    <span>💡</span><span>Επίλυση</span><span class="sol-btn-arrow">▾</span>
                                </button>
                                <div class="exam-solution-body" id="sol-a1-15" style="display: none;">
                                    <div class="exam-sol-inner">
                                        <p><strong>Αιτιολόγηση:</strong> Η ένωση των σημείων Η και Ν βραχυκυκλώνει τον αντιστάτη $R_2$. Ενεργός στο κύκλωμα παραμένει μόνο ο $R_1 = 5\\ \\Omega$:</p>
                                        <div class="formula-latex">$$I' = \\frac{V}{R_1} = \\frac{60\\text{ V}}{5\\ \\Omega} = 12\\text{ A}$$</div>
                                        <div class="formula-latex">$$P_{\\text{πηγ}}' = V \\cdot I' = 60\\text{ V} \\cdot 12\\text{ A} = 720\\text{ W}$$</div>
                                        <p>Σε χρονικό διάστημα $t = 20\\text{ s}$:</p>
                                        <div class="formula-latex">$$E = P_{\\text{πηγ}}' \\cdot t = 720\\text{ W} \\cdot 20\\text{ s} = 14400\\text{ J}$$</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </section>

                <!-- ==============================================================
                     SECTION 5: ΕΜΠΕΡΙΣΤΑΤΩΜΕΝΗ ΑΝΑΣΚΟΠΗΣΗ ΒΡΑΧΥΚΥΚΛΩΜΑΤΟΣ ΣΤΗ ΣΕΙΡΑ
                     ============================================================== -->
                <section class="theory-section exam-section glass-card" id="exam-sec-series-short">
                    <div class="sec-header">
                        <div class="sec-number-badge" style="background: linear-gradient(135deg, #ef4444, #b91c1c);">05</div>
                        <div class="sec-header-text">
                            <h2 class="sec-title">Εμπεριστατωμένη Ανάλυση Βραχυκυκλώματος στη Σειρά</h2>
                            <p class="sec-subtitle">Μερικό vs Ολικό βραχυκύκλωμα, υπερφόρτωση του επιζώντος αντιστάτη και κίνδυνοι</p>
                        </div>
                    </div>

                    <div class="exam-pro-grid">
                        <!-- CARD 1: PARTIAL SHORT CIRCUIT -->
                        <div class="exam-pro-card theme-warning">
                            <div class="exam-pro-header">
                                <div class="exam-pro-icon-box warning">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                                        <line x1="12" y1="9" x2="12" y2="13"></line>
                                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                                    </svg>
                                </div>
                                <div class="exam-pro-title-wrap">
                                    <span class="exam-pro-tag warning">Παράκαμψη Μεμονωμένου Αντιστάτη</span>
                                    <h3 class="exam-pro-title">Μερικό Βραχυκύκλωμα (στα άκρα του $R_2$)</h3>
                                </div>
                            </div>

                            <div class="exam-pro-callout warning">
                                Σύνδεση καλωδίου μηδενικής αντίστασης στα άκρα του $R_2$ εκτρέπει <strong>όλο το ρεύμα μέσω του καλωδίου</strong>, θέτοντας τον $R_2$ εκτός λειτουργίας.
                            </div>

                            <div class="exam-pro-items">
                                <div class="exam-pro-item">
                                    <div class="exam-pro-item-top">
                                        <div class="exam-pro-item-title">
                                            <span>⚡</span> Κατακόρυφη Πτώση Αντίστασης
                                        </div>
                                        <span class="exam-pro-item-badge warning">$R_{\\text{ολ}}' = 5\\ \\Omega\\ (\\text{από } 20\\ \\Omega)$</span>
                                    </div>
                                    <p class="exam-pro-item-desc">
                                        Η ολική αντίσταση περιορίζεται πλέον μόνο στον $R_1$, προκαλώντας τετραπλασιασμό του ρεύματος:
                                    </p>
                                    <div class="exam-pro-item-formula warning">
                                        $R_{\\text{ολ}}' = R_1 + 0 = 5\\ \\Omega \\implies I' = \\dfrac{V}{R_1} = \\dfrac{60\\text{ V}}{5\\ \\Omega} = 12\\text{ A}$
                                    </div>
                                </div>

                                <div class="exam-pro-item">
                                    <div class="exam-pro-item-top">
                                        <div class="exam-pro-item-title">
                                            <span>🎯</span> Συγκέντρωση Ολόκληρης της Τάσης
                                        </div>
                                        <span class="exam-pro-item-badge warning">$V_1' = V_{\\text{πηγ}} = 60\\text{ V}$</span>
                                    </div>
                                    <p class="exam-pro-item-desc">
                                        Ο $R_2$ τίθεται εκτός τάσης ($V_2' = 0\\text{ V}$), επομένως ο επιζών αντιστάτης $R_1$ δέχεται μόνος του όλη την τάση:
                                    </p>
                                    <div class="exam-pro-item-formula warning">
                                        $V_2' = 0\\text{ V} \\implies V_1' = V_{\\text{πηγ}} = 60\\text{ V} \\quad (\\text{από αρχικά } 15\\text{ V})$
                                    </div>
                                </div>

                                <div class="exam-pro-item">
                                    <div class="exam-pro-item-top">
                                        <div class="exam-pro-item-title">
                                            <span>💥</span> Υπερφόρτωση Ισχύος +1600%
                                        </div>
                                        <span class="exam-pro-item-badge warning">$P_1': 45\\text{ W} \\to 720\\text{ W}$</span>
                                    </div>
                                    <p class="exam-pro-item-desc">
                                        Η θερμική ισχύς εκτοξεύεται κατά 16 φορές, οδηγώντας άμεσα σε υπερθέρμανση και καταστροφή του $R_1$:
                                    </p>
                                    <div class="exam-pro-item-formula warning">
                                        $P_1' = I'^2 \\cdot R_1 = 12^2 \\cdot 5 = 720\\text{ W} \\quad (\\times 16 \\text{ υπέρβαση ορίου})$
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- CARD 2: TOTAL SHORT CIRCUIT -->
                        <div class="exam-pro-card theme-danger">
                            <div class="exam-pro-header">
                                <div class="exam-pro-icon-box danger">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                                    </svg>
                                </div>
                                <div class="exam-pro-title-wrap">
                                    <span class="exam-pro-tag danger">Καθολική Γεφύρωση Πόλων</span>
                                    <h3 class="exam-pro-title">Ολικό Βραχυκύκλωμα (Απευθείας Πόλοι)</h3>
                                </div>
                            </div>

                            <div class="exam-pro-callout danger">
                                Αγώγιμος δρόμος μηδενικής αντίστασης ενώνει <strong>απευθείας τον θετικό (+) και τον αρνητικό (-) πόλο</strong> της ηλεκτρικής πηγής.
                            </div>

                            <div class="exam-pro-items">
                                <div class="exam-pro-item">
                                    <div class="exam-pro-item-top">
                                        <div class="exam-pro-item-title">
                                            <span>🛑</span> Μηδενισμός Εξωτερικής Αντίστασης
                                        </div>
                                        <span class="exam-pro-item-badge danger">$R_{\\text{εξ}} \\approx 0\\ \\Omega$</span>
                                    </div>
                                    <p class="exam-pro-item-desc">
                                        Όλοι οι συνδεδεμένοι αντιστάτες τίθενται εκτός λειτουργίας με μηδενική τάση, καθώς παρακάμπτονται πλήρως:
                                    </p>
                                    <div class="exam-pro-item-formula danger">
                                        $R_{\\text{εξ}} \\to 0\\ \\Omega \\implies V_{\\text{πόλων}} = 0\\text{ V} \\quad (V_1 = V_2 = 0\\text{ V})$
                                    </div>
                                </div>

                                <div class="exam-pro-item">
                                    <div class="exam-pro-item-top">
                                        <div class="exam-pro-item-title">
                                            <span>⚡</span> Απειρισμός Έντασης Ρεύματος
                                        </div>
                                        <span class="exam-pro-item-badge danger">$I_{\\text{βραχ}} \\to \\infty$</span>
                                    </div>
                                    <p class="exam-pro-item-desc">
                                        Η ένταση του ρεύματος περιορίζεται μόνο από την ελάχιστη εσωτερική αντίσταση $r_{\\text{εσ}}$ της πηγής:
                                    </p>
                                    <div class="exam-pro-item-formula danger">
                                        $I_{\\text{βραχ}} = \\dfrac{\\mathcal{E}}{r_{\\text{εσ}}} \\to \\infty \\quad (\\text{μέγιστο καταστροφικό ρεύμα})$
                                    </div>
                                </div>

                                <div class="exam-pro-item">
                                    <div class="exam-pro-item-top">
                                        <div class="exam-pro-item-title">
                                            <span>🔥</span> Θερμική Τήξη &amp; Κίνδυνος Πυρκαγιάς
                                        </div>
                                        <span class="exam-pro-item-badge danger">$Q = I^2 \\cdot R \\cdot t$</span>
                                    </div>
                                    <p class="exam-pro-item-desc">
                                        Η ραγδαία έκλυση θερμότητας κατά Joule λιώνει τη μόνωση των καλωδίων και προκαλεί άμεσο κίνδυνο πυρκαγιάς:
                                    </p>
                                    <div class="exam-pro-item-formula danger">
                                        $P_{\\text{θερμ}} = I_{\\text{βραχ}}^2 \\cdot r_{\\text{εσ}} \\to \\infty \\implies \\text{τήξη καλωδίων και πυρκαγιά}$
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- KEY TAKEAWAY STRIP -->
                    <div class="exam-pro-takeaway">
                        <div class="exam-pro-takeaway-text">
                            <span style="font-size: 1.25rem;">💡</span>
                            <span><strong>Κρίσιμη Διάκριση:</strong> Στο μερικό βραχυκύκλωμα στη σειρά ο ένας αντιστάτης σβήνει αλλά ο άλλος υπερφορτώνεται επικίνδυνα ($P_1' = 720\\text{ W}$). Στο ολικό, όλα τα φορτία σβήνουν ($V = 0\\text{ V}$) και καταστρέφεται η πηγή!</span>
                        </div>
                        <div class="exam-pro-takeaway-formula">
                            $R_{\\text{μερ}}' = R_1 \\implies P_1' = 720\\text{ W} \\quad\\longleftrightarrow\\quad R_{\\text{ολ}}' \\to 0 \\implies I_{\\text{βραχ}} = \\dfrac{\\mathcal{E}}{r} \\to \\infty$
                        </div>
                    </div>
                </section>

                <!-- ==============================================================
                     SECTION 6: ΘΕΜΑ Α2 — ΠΑΡΑΛΛΗΛΗ ΣΥΝΔΕΣΜΟΛΟΓΙΑ (15 ΕΡΩΤΗΜΑΤΑ)
                     ============================================================== -->
                <section class="theory-section exam-section glass-card" id="exam-sec-thema-a2">
                    <div class="sec-header">
                        <div class="sec-number-badge" style="background: linear-gradient(135deg, #06b6d4, #0891b2);">06</div>
                        <div class="sec-header-text">
                            <h2 class="sec-title">Θέμα Α2: Παράλληλη Συνδεσμολογία (15 Ερωτήματα)</h2>
                            <p class="sec-subtitle">Κοινή τάση, ανεξαρτησία κλάδων, 1ος Κανόνας Kirchhoff και κίνδυνοι βραχυκυκλώματος</p>
                        </div>
                    </div>

                    <!-- THEMA A2 CIRCUIT OVERVIEW CARD -->
                    <div class="theory-card" style="margin-bottom: 24px; border-left: 4px solid #06b6d4;">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; align-items: center;" class="circuit-overview-grid">
                            <div>
                                <h3 style="color: #67e8f9; margin-bottom: 8px;">Δεδομένα Κυκλώματος Θέματος Α2</h3>
                                <ul style="line-height: 1.7; font-size: 0.95rem; color: var(--text-secondary); padding-left: 20px;">
                                    <li>Τάση πηγής: <strong>$V = 75\\text{ V}$</strong></li>
                                    <li>Αντιστάτης 1: <strong>$R_1 = 30\\ \\Omega$</strong></li>
                                    <li>Αντιστάτης 2: <strong>$R_2 = 10\\ \\Omega$</strong></li>
                                    <li>Συνδεσμολογία: <strong>Παράλληλη</strong> ($V_1 = V_2 = V = 75\\text{ V}$)</li>
                                    <li>Διακόπτες: Κεντρικός <strong>[Α, Β]</strong>, Κλαδικοί <strong>[Γ, Δ]</strong> (για $R_1$) και <strong>[Ε, Ζ]</strong> (για $R_2$)</li>
                                </ul>
                            </div>
                            <div style="text-align: center;">
                                <div class="diagram-img-wrap" style="max-width: 440px; margin: 0 auto; cursor: pointer; border-radius: 14px; overflow: hidden; border: 2px solid rgba(6, 182, 212, 0.4);" onclick="openDiagramLightbox('assets/images/exam_solutions/circuit_parallel_a2.png', 'Διάγραμμα Κυκλώματος Θέματος Α2 (Παράλληλη Συνδεσμολογία)')" title="Κλικ για μεγέθυνση">
                                    <img src="assets/images/exam_solutions/circuit_parallel_a2.png" alt="Thema A2 Circuit Diagram" style="width: 100%; display: block;" />
                                    <span class="diagram-zoom-hint">🔍 Κλικ για Πλήρη Οθόνη</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- QUESTIONS 1 TO 15 FOR THEMA A2 -->
                    <div class="exam-questions-list">

                        <!-- Q1 -->
                        <div class="exam-question-card glass-card">
                            <div class="exam-q-header">
                                <span class="exam-q-badge" style="background: rgba(6, 182, 212, 0.2); color: #67e8f9; border-color: rgba(6, 182, 212, 0.4);">Ερώτημα 1</span>
                                <h4 class="exam-q-title">Τιμή της συνολικής (ισοδύναμης) αντίστασης του κυκλώματος</h4>

                                <button class="exam-diagram-toggle-btn theme-a2" id="btn-diag-a2-1" 
                                        onclick="ExamSolutionsGuide.toggleDiagram('a2-1', 'a2')"
                                         title="Κλικ για άνοιγμα/κλείσιμο του διαγράμματος επάνω από το ερώτημα">
                                    <span class="diag-btn-icon">🗺️</span>
                                    <span class="diag-btn-label">Διάγραμμα</span>
                                    <span class="diag-btn-arrow">▾</span>
                                </button>
                            </div>
                            <!-- Collapsible Inline Diagram Drawer (Thema A2) -->
                            <div class="exam-inline-diagram-drawer" id="diag-drawer-a2-1" style="display: none;">
                                <div class="exam-inline-diagram-card theme-a2">
                                    <div class="exam-inline-diagram-header">
                                        <span class="exam-inline-badge theme-a2">🔀 Θέμα Α2: Παράλληλη Συνδεσμολογία</span>
                                        <button type="button" class="exam-inline-close-btn" onclick="ExamSolutionsGuide.toggleDiagram('a2-1', 'a2')" title="Κλείσιμο διαγράμματος">✕</button>
                                    </div>
                                    <div class="exam-inline-diagram-grid">
                                        <div class="exam-inline-diagram-img-wrap" onclick="openDiagramLightbox('assets/images/exam_solutions/circuit_parallel_a2.png', 'Διάγραμμα Κυκλώματος Θέματος Α2 (Παράλληλη Συνδεσμολογία)')" title="Κλικ για μεγέθυνση σε πλήρη οθόνη">
                                            <img src="assets/images/exam_solutions/circuit_parallel_a2.png" alt="Thema A2 Circuit Diagram" loading="lazy" />
                                            <span class="diagram-zoom-hint">🔍 Κλικ για Πλήρη Οθόνη</span>
                                        </div>
                                        <div class="exam-inline-diagram-specs">
                                            <h5 class="exam-inline-specs-heading">Βασικά Δεδομένα Κυκλώματος:</h5>
                                            <ul class="exam-inline-specs-list">
                                                <li>Τάση πηγής: <strong>$V = 75\text{ V}$</strong></li>
                                                <li>Αντιστάτες: <strong>$R_1 = 30\ \Omega$</strong>, <strong>$R_2 = 10\ \Omega$</strong> (παράλληλα)</li>
                                                <li>Κοινή τάση κλάδων: <strong>$V_1 = V_2 = V = 75\text{ V}$</strong></li>
                                                <li>Κεντρικός διακόπτης: <strong>[Α, Β]</strong></li>
                                                <li>Κλαδικοί διακόπτες: <strong>[Γ, Δ]</strong> ($R_1$), <strong>[Ε, Ζ]</strong> ($R_2$)</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <p class="exam-q-prompt">
                                Να υπολογίσετε τη συνολική αντίσταση $R_{\\text{ολ}}$ της παράλληλης συνδεσμολογίας των αντιστατών $R_1 = 30\\ \\Omega$ και $R_2 = 10\\ \\Omega$.
                            </p>
                            <div class="exam-options-grid" id="opts-grid-a2-1">
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-1', 0)"><span class="opt-label">(α) $40\\ \\Omega$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-1', 1)"><span class="opt-label">(β) $20\\ \\Omega$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-1', 2)"><span class="opt-label">(γ) $15\\ \\Omega$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-1', 3)"><span class="opt-label">(δ) $60\\ \\Omega$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-1', 4)"><span class="opt-label">(ε) $90\\ \\Omega$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-1', 5)"><span class="opt-label">(στ) $3,75\\ \\Omega$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-1', 6)"><span class="opt-label">(ζ) $7,5\\ \\Omega$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-1', 7)"><span class="opt-label">(η) $3\\ \\Omega$</span></button>
                            </div>
                            <div class="exam-q-feedback" id="feedback-a2-1" style="display: none;"></div>
                            <div class="exam-sol-wrap">
                                <button class="exam-sol-toggle-btn" id="btn-sol-a2-1" onclick="ExamSolutionsGuide.toggleSolution('a2-1')">
                                    <span>💡</span><span>Επίλυση</span><span class="sol-btn-arrow">▾</span>
                                </button>
                                <div class="exam-solution-body" id="sol-a2-1" style="display: none;">
                                    <div class="exam-sol-inner">
                                        <p><strong>1. Τύπος Αντιστρόφων:</strong></p>
                                        <div class="formula-latex">$$\\frac{1}{R_{\\text{ολ}}} = \\frac{1}{R_1} + \\frac{1}{R_2} = \\frac{1}{30} + \\frac{1}{10} = \\frac{1 + 3}{30} = \\frac{4}{30} = \\frac{2}{15}\\ \\Omega^{-1} \\implies R_{\\text{ολ}} = \\frac{15}{2} = 7,5\\ \\Omega$$</div>
                                        <p style="margin-top: 8px;"><strong>2. Συνεπτυγμένος Τύπος για 2 Παράλληλους Αντιστάτες (Γινόμενο δια Άθροισμα):</strong></p>
                                        <div class="formula-latex">$$R_{\\text{ολ}} = \\frac{R_1 \\cdot R_2}{R_1 + R_2} = \\frac{30 \\cdot 10}{30 + 10} = \\frac{300}{40} = 7,5\\ \\Omega$$</div>
                                        <p><em>(Παρατήρηση: $R_{\\text{ολ}} = 7,5\\ \\Omega < \\min(R_1, R_2) = 10\\ \\Omega$, όπως οφείλει πάντοτε στα παράλληλα!).</em></p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Q2 -->
                        <div class="exam-question-card glass-card">
                            <div class="exam-q-header">
                                <span class="exam-q-badge" style="background: rgba(6, 182, 212, 0.2); color: #67e8f9; border-color: rgba(6, 182, 212, 0.4);">Ερώτημα 2</span>
                                <h4 class="exam-q-title">Ένταση του ρεύματος που διαρρέει την πηγή</h4>
                            
                                <button class="exam-diagram-toggle-btn theme-a2" id="btn-diag-a2-2" 
                                        onclick="ExamSolutionsGuide.toggleDiagram('a2-2', 'a2')"
                                         title="Κλικ για άνοιγμα/κλείσιμο του διαγράμματος επάνω από το ερώτημα">
                                    <span class="diag-btn-icon">🗺️</span>
                                    <span class="diag-btn-label">Διάγραμμα</span>
                                    <span class="diag-btn-arrow">▾</span>
                                </button>
                            </div>
                            <!-- Collapsible Inline Diagram Drawer (Thema A2) -->
                            <div class="exam-inline-diagram-drawer" id="diag-drawer-a2-2" style="display: none;">
                                <div class="exam-inline-diagram-card theme-a2">
                                    <div class="exam-inline-diagram-header">
                                        <span class="exam-inline-badge theme-a2">🔄 Θέμα Α2: Παράλληλη Συνδεσμολογία</span>
                                        <button type="button" class="exam-inline-close-btn" onclick="ExamSolutionsGuide.toggleDiagram('a2-2', 'a2')" title="Κλείσιμο διαγράμματος">✕</button>
                                    </div>
                                    <div class="exam-inline-diagram-grid">
                                        <div class="exam-inline-diagram-img-wrap" onclick="openDiagramLightbox('assets/images/exam_solutions/circuit_parallel_a2.png', 'Διάγραμμα Κυκλώματος Θέματος Α2 (Παράλληλη Συνδεσμολογία)')" title="Κλικ για μεγέθυνση σε πλήρη οθόνη">
                                            <img src="assets/images/exam_solutions/circuit_parallel_a2.png" alt="Thema A2 Circuit Diagram" loading="lazy" />
                                            <span class="diagram-zoom-hint">🔍 Κλικ για Πλήρη Οθόνη</span>
                                        </div>
                                        <div class="exam-inline-diagram-specs">
                                            <h5 class="exam-inline-specs-heading" style="color: #67e8f9;">Δεδομένα Κυκλώματος Θέματος Α2</h5>
                                            <ul class="exam-inline-specs-list">
                                                <li>Τάση πηγής: <strong>$V = 75\\text{ V}$</strong></li>
                                                <li>Αντιστάτης 1: <strong>$R_1 = 30\\ \\Omega$</strong></li>
                                                <li>Αντιστάτης 2: <strong>$R_2 = 10\\ \\Omega$</strong></li>
                                                <li>Συνδεσμολογία: <strong>Παράλληλη</strong> ($V_1 = V_2 = V = 75\\text{ V}$)</li>
                                                <li>Διακόπτες: Κεντρικός <strong>[Α, Β]</strong>, Κλαδικοί <strong>[Γ, Δ]</strong> (για $R_1$) και <strong>[Ε, Ζ]</strong> (για $R_2$)</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <p class="exam-q-prompt">
                                Να υπολογίσετε την ένταση του ολικού ρεύματος $I_{\\text{ολ}}$ που εξέρχεται από την πηγή.
                            </p>
                            <div class="exam-options-grid" id="opts-grid-a2-2">
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-2', 0)"><span class="opt-label">(α) $75\\text{ A}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-2', 1)"><span class="opt-label">(β) $7,5\\text{ A}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-2', 2)"><span class="opt-label">(γ) $2,5\\text{ A}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-2', 3)"><span class="opt-label">(δ) $3\\text{ A}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-2', 4)"><span class="opt-label">(ε) $3,75\\text{ A}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-2', 5)"><span class="opt-label">(στ) $10\\text{ A}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-2', 6)"><span class="opt-label">(ζ) $20\\text{ A}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-2', 7)"><span class="opt-label">(η) $4\\text{ A}$</span></button>
                            </div>
                            <div class="exam-q-feedback" id="feedback-a2-2" style="display: none;"></div>
                            <div class="exam-sol-wrap">
                                <button class="exam-sol-toggle-btn" id="btn-sol-a2-2" onclick="ExamSolutionsGuide.toggleSolution('a2-2')">
                                    <span>💡</span><span>Επίλυση</span><span class="sol-btn-arrow">▾</span>
                                </button>
                                <div class="exam-solution-body" id="sol-a2-2" style="display: none;">
                                    <div class="exam-sol-inner">
                                        <p><strong>Αιτιολόγηση:</strong> Από τον νόμο του Ohm για το ισοδύναμο κύκλωμα:</p>
                                        <div class="formula-latex">$$I_{\\text{ολ}} = \\frac{V}{R_{\\text{ολ}}} = \\frac{75\\text{ V}}{7,5\\ \\Omega} = 10\\text{ A}$$</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Q3 -->
                        <div class="exam-question-card glass-card">
                            <div class="exam-q-header">
                                <span class="exam-q-badge" style="background: rgba(6, 182, 212, 0.2); color: #67e8f9; border-color: rgba(6, 182, 212, 0.4);">Ερώτημα 3</span>
                                <h4 class="exam-q-title">Ένταση του ρεύματος που διαρρέει τον αντιστάτη $R_1$</h4>
                            
                                <button class="exam-diagram-toggle-btn theme-a2" id="btn-diag-a2-3" 
                                        onclick="ExamSolutionsGuide.toggleDiagram('a2-3', 'a2')"
                                         title="Κλικ για άνοιγμα/κλείσιμο του διαγράμματος επάνω από το ερώτημα">
                                    <span class="diag-btn-icon">🗺️</span>
                                    <span class="diag-btn-label">Διάγραμμα</span>
                                    <span class="diag-btn-arrow">▾</span>
                                </button>
                            </div>
                            <!-- Collapsible Inline Diagram Drawer (Thema A2) -->
                            <div class="exam-inline-diagram-drawer" id="diag-drawer-a2-3" style="display: none;">
                                <div class="exam-inline-diagram-card theme-a2">
                                    <div class="exam-inline-diagram-header">
                                        <span class="exam-inline-badge theme-a2">🔄 Θέμα Α2: Παράλληλη Συνδεσμολογία</span>
                                        <button type="button" class="exam-inline-close-btn" onclick="ExamSolutionsGuide.toggleDiagram('a2-3', 'a2')" title="Κλείσιμο διαγράμματος">✕</button>
                                    </div>
                                    <div class="exam-inline-diagram-grid">
                                        <div class="exam-inline-diagram-img-wrap" onclick="openDiagramLightbox('assets/images/exam_solutions/circuit_parallel_a2.png', 'Διάγραμμα Κυκλώματος Θέματος Α2 (Παράλληλη Συνδεσμολογία)')" title="Κλικ για μεγέθυνση σε πλήρη οθόνη">
                                            <img src="assets/images/exam_solutions/circuit_parallel_a2.png" alt="Thema A2 Circuit Diagram" loading="lazy" />
                                            <span class="diagram-zoom-hint">🔍 Κλικ για Πλήρη Οθόνη</span>
                                        </div>
                                        <div class="exam-inline-diagram-specs">
                                            <h5 class="exam-inline-specs-heading" style="color: #67e8f9;">Δεδομένα Κυκλώματος Θέματος Α2</h5>
                                            <ul class="exam-inline-specs-list">
                                                <li>Τάση πηγής: <strong>$V = 75\\text{ V}$</strong></li>
                                                <li>Αντιστάτης 1: <strong>$R_1 = 30\\ \\Omega$</strong></li>
                                                <li>Αντιστάτης 2: <strong>$R_2 = 10\\ \\Omega$</strong></li>
                                                <li>Συνδεσμολογία: <strong>Παράλληλη</strong> ($V_1 = V_2 = V = 75\\text{ V}$)</li>
                                                <li>Διακόπτες: Κεντρικός <strong>[Α, Β]</strong>, Κλαδικοί <strong>[Γ, Δ]</strong> (για $R_1$) και <strong>[Ε, Ζ]</strong> (για $R_2$)</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <p class="exam-q-prompt">
                                Να υπολογίσετε την ένταση του ρεύματος $I_1$ στον κλάδο του αντιστάτη $R_1 = 30\\ \\Omega$.
                            </p>
                            <div class="exam-options-grid" id="opts-grid-a2-3">
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-3', 0)"><span class="opt-label">(α) άπειρη</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-3', 1)"><span class="opt-label">(β) $7,5\\text{ A}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-3', 2)"><span class="opt-label">(γ) $2,5\\text{ A}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-3', 3)"><span class="opt-label">(δ) $3\\text{ A}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-3', 4)"><span class="opt-label">(ε) $3,75\\text{ A}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-3', 5)"><span class="opt-label">(στ) $10\\text{ A}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-3', 6)"><span class="opt-label">(ζ) $20\\text{ A}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-3', 7)"><span class="opt-label">(η) μηδέν</span></button>
                            </div>
                            <div class="exam-q-feedback" id="feedback-a2-3" style="display: none;"></div>
                            <div class="exam-sol-wrap">
                                <button class="exam-sol-toggle-btn" id="btn-sol-a2-3" onclick="ExamSolutionsGuide.toggleSolution('a2-3')">
                                    <span>💡</span><span>Επίλυση</span><span class="sol-btn-arrow">▾</span>
                                </button>
                                <div class="exam-solution-body" id="sol-a2-3" style="display: none;">
                                    <div class="exam-sol-inner">
                                        <p><strong>Αιτιολόγηση:</strong> Στην παράλληλη σύνδεση, κάθε κλάδος δέχεται ολόκληρη την τάση της πηγής ($V_1 = V = 75\\text{ V}$):</p>
                                        <div class="formula-latex">$$I_1 = \\frac{V}{R_1} = \\frac{75\\text{ V}}{30\\ \\Omega} = 2,5\\text{ A}$$</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Q4 -->
                        <div class="exam-question-card glass-card">
                            <div class="exam-q-header">
                                <span class="exam-q-badge" style="background: rgba(6, 182, 212, 0.2); color: #67e8f9; border-color: rgba(6, 182, 212, 0.4);">Ερώτημα 4</span>
                                <h4 class="exam-q-title">Ένταση του ρεύματος που διαρρέει τον αντιστάτη $R_2$</h4>
                            
                                <button class="exam-diagram-toggle-btn theme-a2" id="btn-diag-a2-4" 
                                        onclick="ExamSolutionsGuide.toggleDiagram('a2-4', 'a2')"
                                         title="Κλικ για άνοιγμα/κλείσιμο του διαγράμματος επάνω από το ερώτημα">
                                    <span class="diag-btn-icon">🗺️</span>
                                    <span class="diag-btn-label">Διάγραμμα</span>
                                    <span class="diag-btn-arrow">▾</span>
                                </button>
                            </div>
                            <!-- Collapsible Inline Diagram Drawer (Thema A2) -->
                            <div class="exam-inline-diagram-drawer" id="diag-drawer-a2-4" style="display: none;">
                                <div class="exam-inline-diagram-card theme-a2">
                                    <div class="exam-inline-diagram-header">
                                        <span class="exam-inline-badge theme-a2">🔄 Θέμα Α2: Παράλληλη Συνδεσμολογία</span>
                                        <button type="button" class="exam-inline-close-btn" onclick="ExamSolutionsGuide.toggleDiagram('a2-4', 'a2')" title="Κλείσιμο διαγράμματος">✕</button>
                                    </div>
                                    <div class="exam-inline-diagram-grid">
                                        <div class="exam-inline-diagram-img-wrap" onclick="openDiagramLightbox('assets/images/exam_solutions/circuit_parallel_a2.png', 'Διάγραμμα Κυκλώματος Θέματος Α2 (Παράλληλη Συνδεσμολογία)')" title="Κλικ για μεγέθυνση σε πλήρη οθόνη">
                                            <img src="assets/images/exam_solutions/circuit_parallel_a2.png" alt="Thema A2 Circuit Diagram" loading="lazy" />
                                            <span class="diagram-zoom-hint">🔍 Κλικ για Πλήρη Οθόνη</span>
                                        </div>
                                        <div class="exam-inline-diagram-specs">
                                            <h5 class="exam-inline-specs-heading" style="color: #67e8f9;">Δεδομένα Κυκλώματος Θέματος Α2</h5>
                                            <ul class="exam-inline-specs-list">
                                                <li>Τάση πηγής: <strong>$V = 75\\text{ V}$</strong></li>
                                                <li>Αντιστάτης 1: <strong>$R_1 = 30\\ \\Omega$</strong></li>
                                                <li>Αντιστάτης 2: <strong>$R_2 = 10\\ \\Omega$</strong></li>
                                                <li>Συνδεσμολογία: <strong>Παράλληλη</strong> ($V_1 = V_2 = V = 75\\text{ V}$)</li>
                                                <li>Διακόπτες: Κεντρικός <strong>[Α, Β]</strong>, Κλαδικοί <strong>[Γ, Δ]</strong> (για $R_1$) και <strong>[Ε, Ζ]</strong> (για $R_2$)</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <p class="exam-q-prompt">
                                Να υπολογίσετε την ένταση του ρεύματος $I_2$ στον κλάδο του αντιστάτη $R_2 = 10\\ \\Omega$.
                            </p>
                            <div class="exam-options-grid" id="opts-grid-a2-4">
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-4', 0)"><span class="opt-label">(α) $75\\text{ A}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-4', 1)"><span class="opt-label">(β) $7,5\\text{ A}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-4', 2)"><span class="opt-label">(γ) $2,5\\text{ A}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-4', 3)"><span class="opt-label">(δ) $3\\text{ A}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-4', 4)"><span class="opt-label">(ε) άπειρη</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-4', 5)"><span class="opt-label">(στ) $10\\text{ A}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-4', 6)"><span class="opt-label">(ζ) $20\\text{ A}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-4', 7)"><span class="opt-label">(η) μηδέν</span></button>
                            </div>
                            <div class="exam-q-feedback" id="feedback-a2-4" style="display: none;"></div>
                            <div class="exam-sol-wrap">
                                <button class="exam-sol-toggle-btn" id="btn-sol-a2-4" onclick="ExamSolutionsGuide.toggleSolution('a2-4')">
                                    <span>💡</span><span>Επίλυση</span><span class="sol-btn-arrow">▾</span>
                                </button>
                                <div class="exam-solution-body" id="sol-a2-4" style="display: none;">
                                    <div class="exam-sol-inner">
                                        <p><strong>1. Νόμος Ohm στον Κλάδο 2:</strong></p>
                                        <div class="formula-latex">$$I_2 = \\frac{V}{R_2} = \\frac{75\\text{ V}}{10\\ \\Omega} = 7,5\\text{ A}$$</div>
                                        <p style="margin-top: 8px;"><strong>2. Επαλήθευση 1ου Κανόνα Kirchhoff (Διατήρηση Φορτίου στον Κόμβο):</strong></p>
                                        <div class="formula-latex">$$I_{\\text{ολ}} = I_1 + I_2 \\implies 10\\text{ A} = 2,5\\text{ A} + 7,5\\text{ A}\\quad \\text{(απόλυτη ταύτιση!)}$$</div>
                                        <p><em>(Παρατήρηση: Ο $R_2$ έχει 3 φορές μικρότερη αντίσταση από τον $R_1$, άρα διαρρέεται από 3 φορές μεγαλύτερο ρεύμα: $\\frac{I_2}{I_1} = \\frac{R_1}{R_2} = \\frac{30}{10} = 3$).</em></p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Q5 -->
                        <div class="exam-question-card glass-card">
                            <div class="exam-q-header">
                                <span class="exam-q-badge" style="background: rgba(6, 182, 212, 0.2); color: #67e8f9; border-color: rgba(6, 182, 212, 0.4);">Ερώτημα 5</span>
                                <h4 class="exam-q-title">Διαφορά δυναμικού μεταξύ των άκρων του διακόπτη [Α, Β]</h4>
                            
                                <button class="exam-diagram-toggle-btn theme-a2" id="btn-diag-a2-5" 
                                        onclick="ExamSolutionsGuide.toggleDiagram('a2-5', 'a2')"
                                         title="Κλικ για άνοιγμα/κλείσιμο του διαγράμματος επάνω από το ερώτημα">
                                    <span class="diag-btn-icon">🗺️</span>
                                    <span class="diag-btn-label">Διάγραμμα</span>
                                    <span class="diag-btn-arrow">▾</span>
                                </button>
                            </div>
                            <!-- Collapsible Inline Diagram Drawer (Thema A2) -->
                            <div class="exam-inline-diagram-drawer" id="diag-drawer-a2-5" style="display: none;">
                                <div class="exam-inline-diagram-card theme-a2">
                                    <div class="exam-inline-diagram-header">
                                        <span class="exam-inline-badge theme-a2">🔄 Θέμα Α2: Παράλληλη Συνδεσμολογία</span>
                                        <button type="button" class="exam-inline-close-btn" onclick="ExamSolutionsGuide.toggleDiagram('a2-5', 'a2')" title="Κλείσιμο διαγράμματος">✕</button>
                                    </div>
                                    <div class="exam-inline-diagram-grid">
                                        <div class="exam-inline-diagram-img-wrap" onclick="openDiagramLightbox('assets/images/exam_solutions/circuit_parallel_a2.png', 'Διάγραμμα Κυκλώματος Θέματος Α2 (Παράλληλη Συνδεσμολογία)')" title="Κλικ για μεγέθυνση σε πλήρη οθόνη">
                                            <img src="assets/images/exam_solutions/circuit_parallel_a2.png" alt="Thema A2 Circuit Diagram" loading="lazy" />
                                            <span class="diagram-zoom-hint">🔍 Κλικ για Πλήρη Οθόνη</span>
                                        </div>
                                        <div class="exam-inline-diagram-specs">
                                            <h5 class="exam-inline-specs-heading" style="color: #67e8f9;">Δεδομένα Κυκλώματος Θέματος Α2</h5>
                                            <ul class="exam-inline-specs-list">
                                                <li>Τάση πηγής: <strong>$V = 75\\text{ V}$</strong></li>
                                                <li>Αντιστάτης 1: <strong>$R_1 = 30\\ \\Omega$</strong></li>
                                                <li>Αντιστάτης 2: <strong>$R_2 = 10\\ \\Omega$</strong></li>
                                                <li>Συνδεσμολογία: <strong>Παράλληλη</strong> ($V_1 = V_2 = V = 75\\text{ V}$)</li>
                                                <li>Διακόπτες: Κεντρικός <strong>[Α, Β]</strong>, Κλαδικοί <strong>[Γ, Δ]</strong> (για $R_1$) και <strong>[Ε, Ζ]</strong> (για $R_2$)</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <p class="exam-q-prompt">
                                Να υπολογίσετε τη διαφορά δυναμικού στα άκρα του κλειστού κεντρικού διακόπτη [Α, Β].
                            </p>
                            <div class="exam-options-grid" id="opts-grid-a2-5">
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-5', 0)"><span class="opt-label">(α) $75\\text{ V}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-5', 1)"><span class="opt-label">(β) $30\\text{ V}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-5', 2)"><span class="opt-label">(γ) $10\\text{ V}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-5', 3)"><span class="opt-label">(δ) $7,5\\text{ V}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-5', 4)"><span class="opt-label">(ε) άπειρη</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-5', 5)"><span class="opt-label">(στ) μηδέν <span class="opt-sub">($0\\text{ V}$)</span></span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-5', 6)"><span class="opt-label">(ζ) $150\\text{ V}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-5', 7)"><span class="opt-label">(η) $37,5\\text{ V}$</span></button>
                            </div>
                            <div class="exam-q-feedback" id="feedback-a2-5" style="display: none;"></div>
                            <div class="exam-sol-wrap">
                                <button class="exam-sol-toggle-btn" id="btn-sol-a2-5" onclick="ExamSolutionsGuide.toggleSolution('a2-5')">
                                    <span>💡</span><span>Επίλυση</span><span class="sol-btn-arrow">▾</span>
                                </button>
                                <div class="exam-solution-body" id="sol-a2-5" style="display: none;">
                                    <div class="exam-sol-inner">
                                        <p><strong>Αιτιολόγηση:</strong> Ο διακόπτης [Α, Β] όταν είναι κλειστός συνιστά ιδανικό αγωγό με μηδενική αντίσταση ($R_{\\text{διακ}} = 0$).</p>
                                        <div class="formula-latex">$$V_{\\text{ΑΒ}} = I \\cdot R_{\\text{διακ}} = I \\cdot 0 = 0\\text{ V}$$</div>
                                        <p><em>(Αντιθέτως, όταν ο διακόπτης είναι ανοιχτός, αποκόπτει την πηγή και στα άκρα του εμφανίζεται ολόκληρη η τάση της πηγής $V_{\\text{ΑΒ}} = 75\\text{ V}$).</em></p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Q6 -->
                        <div class="exam-question-card glass-card">
                            <div class="exam-q-header">
                                <span class="exam-q-badge" style="background: rgba(6, 182, 212, 0.2); color: #67e8f9; border-color: rgba(6, 182, 212, 0.4);">Ερώτημα 6</span>
                                <h4 class="exam-q-title">Διαφορά δυναμικού μεταξύ των άκρων του διακόπτη [Ε, Ζ]</h4>
                            
                                <button class="exam-diagram-toggle-btn theme-a2" id="btn-diag-a2-6" 
                                        onclick="ExamSolutionsGuide.toggleDiagram('a2-6', 'a2')"
                                         title="Κλικ για άνοιγμα/κλείσιμο του διαγράμματος επάνω από το ερώτημα">
                                    <span class="diag-btn-icon">🗺️</span>
                                    <span class="diag-btn-label">Διάγραμμα</span>
                                    <span class="diag-btn-arrow">▾</span>
                                </button>
                            </div>
                            <!-- Collapsible Inline Diagram Drawer (Thema A2) -->
                            <div class="exam-inline-diagram-drawer" id="diag-drawer-a2-6" style="display: none;">
                                <div class="exam-inline-diagram-card theme-a2">
                                    <div class="exam-inline-diagram-header">
                                        <span class="exam-inline-badge theme-a2">🔄 Θέμα Α2: Παράλληλη Συνδεσμολογία</span>
                                        <button type="button" class="exam-inline-close-btn" onclick="ExamSolutionsGuide.toggleDiagram('a2-6', 'a2')" title="Κλείσιμο διαγράμματος">✕</button>
                                    </div>
                                    <div class="exam-inline-diagram-grid">
                                        <div class="exam-inline-diagram-img-wrap" onclick="openDiagramLightbox('assets/images/exam_solutions/circuit_parallel_a2.png', 'Διάγραμμα Κυκλώματος Θέματος Α2 (Παράλληλη Συνδεσμολογία)')" title="Κλικ για μεγέθυνση σε πλήρη οθόνη">
                                            <img src="assets/images/exam_solutions/circuit_parallel_a2.png" alt="Thema A2 Circuit Diagram" loading="lazy" />
                                            <span class="diagram-zoom-hint">🔍 Κλικ για Πλήρη Οθόνη</span>
                                        </div>
                                        <div class="exam-inline-diagram-specs">
                                            <h5 class="exam-inline-specs-heading" style="color: #67e8f9;">Δεδομένα Κυκλώματος Θέματος Α2</h5>
                                            <ul class="exam-inline-specs-list">
                                                <li>Τάση πηγής: <strong>$V = 75\\text{ V}$</strong></li>
                                                <li>Αντιστάτης 1: <strong>$R_1 = 30\\ \\Omega$</strong></li>
                                                <li>Αντιστάτης 2: <strong>$R_2 = 10\\ \\Omega$</strong></li>
                                                <li>Συνδεσμολογία: <strong>Παράλληλη</strong> ($V_1 = V_2 = V = 75\\text{ V}$)</li>
                                                <li>Διακόπτες: Κεντρικός <strong>[Α, Β]</strong>, Κλαδικοί <strong>[Γ, Δ]</strong> (για $R_1$) και <strong>[Ε, Ζ]</strong> (για $R_2$)</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <p class="exam-q-prompt">
                                Να υπολογίσετε τη διαφορά δυναμικού στα άκρα του κλειστού διακόπτη κλάδου [Ε, Ζ].
                            </p>
                            <div class="exam-options-grid" id="opts-grid-a2-6">
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-6', 0)"><span class="opt-label">(α) $75\\text{ V}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-6', 1)"><span class="opt-label">(β) $30\\text{ V}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-6', 2)"><span class="opt-label">(γ) $10\\text{ V}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-6', 3)"><span class="opt-label">(δ) $7,5\\text{ V}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-6', 4)"><span class="opt-label">(ε) άπειρη</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-6', 5)"><span class="opt-label">(στ) μηδέν <span class="opt-sub">($0\\text{ V}$)</span></span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-6', 6)"><span class="opt-label">(ζ) $150\\text{ V}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-6', 7)"><span class="opt-label">(η) $37,5\\text{ V}$</span></button>
                            </div>
                            <div class="exam-q-feedback" id="feedback-a2-6" style="display: none;"></div>
                            <div class="exam-sol-wrap">
                                <button class="exam-sol-toggle-btn" id="btn-sol-a2-6" onclick="ExamSolutionsGuide.toggleSolution('a2-6')">
                                    <span>💡</span><span>Επίλυση</span><span class="sol-btn-arrow">▾</span>
                                </button>
                                <div class="exam-solution-body" id="sol-a2-6" style="display: none;">
                                    <div class="exam-sol-inner">
                                        <p><strong>Αιτιολόγηση:</strong> Όπως και στο Ερώτημα 5, κάθε ιδανικός κλειστός διακόπτης έχει μηδενική αντίσταση ($R_{\\text{ΕΖ}} = 0$), συνεπώς δεν προκαλεί καμία πτώση τάσης:</p>
                                        <div class="formula-latex">$$V_{\\text{ΕΖ}} = 0\\text{ V}$$</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Q7 -->
                        <div class="exam-question-card glass-card">
                            <div class="exam-q-header">
                                <span class="exam-q-badge" style="background: rgba(6, 182, 212, 0.2); color: #67e8f9; border-color: rgba(6, 182, 212, 0.4);">Ερώτημα 7</span>
                                <h4 class="exam-q-title">Τιμή της ισχύος που καταναλίσκει ο αντιστάτης $R_1$</h4>
                            
                                <button class="exam-diagram-toggle-btn theme-a2" id="btn-diag-a2-7" 
                                        onclick="ExamSolutionsGuide.toggleDiagram('a2-7', 'a2')"
                                         title="Κλικ για άνοιγμα/κλείσιμο του διαγράμματος επάνω από το ερώτημα">
                                    <span class="diag-btn-icon">🗺️</span>
                                    <span class="diag-btn-label">Διάγραμμα</span>
                                    <span class="diag-btn-arrow">▾</span>
                                </button>
                            </div>
                            <!-- Collapsible Inline Diagram Drawer (Thema A2) -->
                            <div class="exam-inline-diagram-drawer" id="diag-drawer-a2-7" style="display: none;">
                                <div class="exam-inline-diagram-card theme-a2">
                                    <div class="exam-inline-diagram-header">
                                        <span class="exam-inline-badge theme-a2">🔄 Θέμα Α2: Παράλληλη Συνδεσμολογία</span>
                                        <button type="button" class="exam-inline-close-btn" onclick="ExamSolutionsGuide.toggleDiagram('a2-7', 'a2')" title="Κλείσιμο διαγράμματος">✕</button>
                                    </div>
                                    <div class="exam-inline-diagram-grid">
                                        <div class="exam-inline-diagram-img-wrap" onclick="openDiagramLightbox('assets/images/exam_solutions/circuit_parallel_a2.png', 'Διάγραμμα Κυκλώματος Θέματος Α2 (Παράλληλη Συνδεσμολογία)')" title="Κλικ για μεγέθυνση σε πλήρη οθόνη">
                                            <img src="assets/images/exam_solutions/circuit_parallel_a2.png" alt="Thema A2 Circuit Diagram" loading="lazy" />
                                            <span class="diagram-zoom-hint">🔍 Κλικ για Πλήρη Οθόνη</span>
                                        </div>
                                        <div class="exam-inline-diagram-specs">
                                            <h5 class="exam-inline-specs-heading" style="color: #67e8f9;">Δεδομένα Κυκλώματος Θέματος Α2</h5>
                                            <ul class="exam-inline-specs-list">
                                                <li>Τάση πηγής: <strong>$V = 75\\text{ V}$</strong></li>
                                                <li>Αντιστάτης 1: <strong>$R_1 = 30\\ \\Omega$</strong></li>
                                                <li>Αντιστάτης 2: <strong>$R_2 = 10\\ \\Omega$</strong></li>
                                                <li>Συνδεσμολογία: <strong>Παράλληλη</strong> ($V_1 = V_2 = V = 75\\text{ V}$)</li>
                                                <li>Διακόπτες: Κεντρικός <strong>[Α, Β]</strong>, Κλαδικοί <strong>[Γ, Δ]</strong> (για $R_1$) και <strong>[Ε, Ζ]</strong> (για $R_2$)</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <p class="exam-q-prompt">
                                Να υπολογίσετε την ισχύ $P_1$ που καταναλώνει ο αντιστάτης $R_1 = 30\\ \\Omega$.
                            </p>
                            <div class="exam-options-grid" id="opts-grid-a2-7">
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-7', 0)"><span class="opt-label">(α) $187,5\\text{ W}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-7', 1)"><span class="opt-label">(β) άπειρη</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-7', 2)"><span class="opt-label">(γ) $750\\text{ W}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-7', 3)"><span class="opt-label">(δ) $60,5\\text{ J/s}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-7', 4)"><span class="opt-label">(ε) $185,5\\text{ W}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-7', 5)"><span class="opt-label">(στ) $120\\text{ J/s}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-7', 6)"><span class="opt-label">(ζ) μηδέν</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-7', 7)"><span class="opt-label">(η) $562,5\\text{ J/s}$</span></button>
                            </div>
                            <div class="exam-q-feedback" id="feedback-a2-7" style="display: none;"></div>
                            <div class="exam-sol-wrap">
                                <button class="exam-sol-toggle-btn" id="btn-sol-a2-7" onclick="ExamSolutionsGuide.toggleSolution('a2-7')">
                                    <span>💡</span><span>Επίλυση</span><span class="sol-btn-arrow">▾</span>
                                </button>
                                <div class="exam-solution-body" id="sol-a2-7" style="display: none;">
                                    <div class="exam-sol-inner">
                                        <p><strong>Υπολογισμός (μέσω $V$ και $I_1$):</strong></p>
                                        <div class="formula-latex">$$P_1 = V \\cdot I_1 = 75\\text{ V} \\cdot 2,5\\text{ A} = 187,5\\text{ W}$$</div>
                                        <p style="margin-top: 8px;"><strong>Εναλλακτικός Υπολογισμός (μέσω $V$ και $R_1$):</strong></p>
                                        <div class="formula-latex">$$P_1 = \\frac{V^2}{R_1} = \\frac{75^2}{30} = \\frac{5625}{30} = 187,5\\text{ W}$$</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Q8 -->
                        <div class="exam-question-card glass-card">
                            <div class="exam-q-header">
                                <span class="exam-q-badge" style="background: rgba(6, 182, 212, 0.2); color: #67e8f9; border-color: rgba(6, 182, 212, 0.4);">Ερώτημα 8</span>
                                <h4 class="exam-q-title">Ενέργεια που καταναλίσκει ο $R_2$ σε χρόνο $t = 10\\text{ s}$</h4>
                            
                                <button class="exam-diagram-toggle-btn theme-a2" id="btn-diag-a2-8" 
                                        onclick="ExamSolutionsGuide.toggleDiagram('a2-8', 'a2')"
                                         title="Κλικ για άνοιγμα/κλείσιμο του διαγράμματος επάνω από το ερώτημα">
                                    <span class="diag-btn-icon">🗺️</span>
                                    <span class="diag-btn-label">Διάγραμμα</span>
                                    <span class="diag-btn-arrow">▾</span>
                                </button>
                            </div>
                            <!-- Collapsible Inline Diagram Drawer (Thema A2) -->
                            <div class="exam-inline-diagram-drawer" id="diag-drawer-a2-8" style="display: none;">
                                <div class="exam-inline-diagram-card theme-a2">
                                    <div class="exam-inline-diagram-header">
                                        <span class="exam-inline-badge theme-a2">🔄 Θέμα Α2: Παράλληλη Συνδεσμολογία</span>
                                        <button type="button" class="exam-inline-close-btn" onclick="ExamSolutionsGuide.toggleDiagram('a2-8', 'a2')" title="Κλείσιμο διαγράμματος">✕</button>
                                    </div>
                                    <div class="exam-inline-diagram-grid">
                                        <div class="exam-inline-diagram-img-wrap" onclick="openDiagramLightbox('assets/images/exam_solutions/circuit_parallel_a2.png', 'Διάγραμμα Κυκλώματος Θέματος Α2 (Παράλληλη Συνδεσμολογία)')" title="Κλικ για μεγέθυνση σε πλήρη οθόνη">
                                            <img src="assets/images/exam_solutions/circuit_parallel_a2.png" alt="Thema A2 Circuit Diagram" loading="lazy" />
                                            <span class="diagram-zoom-hint">🔍 Κλικ για Πλήρη Οθόνη</span>
                                        </div>
                                        <div class="exam-inline-diagram-specs">
                                            <h5 class="exam-inline-specs-heading" style="color: #67e8f9;">Δεδομένα Κυκλώματος Θέματος Α2</h5>
                                            <ul class="exam-inline-specs-list">
                                                <li>Τάση πηγής: <strong>$V = 75\\text{ V}$</strong></li>
                                                <li>Αντιστάτης 1: <strong>$R_1 = 30\\ \\Omega$</strong></li>
                                                <li>Αντιστάτης 2: <strong>$R_2 = 10\\ \\Omega$</strong></li>
                                                <li>Συνδεσμολογία: <strong>Παράλληλη</strong> ($V_1 = V_2 = V = 75\\text{ V}$)</li>
                                                <li>Διακόπτες: Κεντρικός <strong>[Α, Β]</strong>, Κλαδικοί <strong>[Γ, Δ]</strong> (για $R_1$) και <strong>[Ε, Ζ]</strong> (για $R_2$)</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <p class="exam-q-prompt">
                                Να υπολογίσετε την ενέργεια $E_2$ που καταναλώνει ο αντιστάτης $R_2 = 10\\ \\Omega$ σε χρονικό διάστημα $t = 10\\text{ s}$.
                            </p>
                            <div class="exam-options-grid" id="opts-grid-a2-8">
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-8', 0)"><span class="opt-label">(α) άπειρη</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-8', 1)"><span class="opt-label">(β) $1875\\text{ J}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-8', 2)"><span class="opt-label">(γ) $4500\\text{ J}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-8', 3)"><span class="opt-label">(δ) $5625\\text{ J}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-8', 4)"><span class="opt-label">(ε) $2050\\text{ J}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-8', 5)"><span class="opt-label">(στ) $5750\\text{ J}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-8', 6)"><span class="opt-label">(ζ) $2400\\text{ J}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-8', 7)"><span class="opt-label">(η) μηδέν</span></button>
                            </div>
                            <div class="exam-q-feedback" id="feedback-a2-8" style="display: none;"></div>
                            <div class="exam-sol-wrap">
                                <button class="exam-sol-toggle-btn" id="btn-sol-a2-8" onclick="ExamSolutionsGuide.toggleSolution('a2-8')">
                                    <span>💡</span><span>Επίλυση</span><span class="sol-btn-arrow">▾</span>
                                </button>
                                <div class="exam-solution-body" id="sol-a2-8" style="display: none;">
                                    <div class="exam-sol-inner">
                                        <p><strong>1. Υπολογισμός Ισχύος $P_2$:</strong></p>
                                        <div class="formula-latex">$$P_2 = V \\cdot I_2 = 75\\text{ V} \\cdot 7,5\\text{ A} = 562,5\\text{ W}$$</div>
                                        <p style="margin-top: 8px;"><strong>2. Υπολογισμός Ενέργειας σε $t = 10\\text{ s}$:</strong></p>
                                        <div class="formula-latex">$$E_2 = P_2 \\cdot t = 562,5\\text{ W} \\cdot 10\\text{ s} = 5625\\text{ J}$$</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Q9 -->
                        <div class="exam-question-card glass-card">
                            <div class="exam-q-header">
                                <span class="exam-q-badge" style="background: rgba(6, 182, 212, 0.2); color: #67e8f9; border-color: rgba(6, 182, 212, 0.4);">Ερώτημα 9</span>
                                <h4 class="exam-q-title">Ένταση ρεύματος στον $R_2$ εάν ανοίξει προσωρινά ο διακόπτης [Γ, Δ]</h4>
                            
                                <button class="exam-diagram-toggle-btn theme-a2" id="btn-diag-a2-9" 
                                        onclick="ExamSolutionsGuide.toggleDiagram('a2-9', 'a2')"
                                         title="Κλικ για άνοιγμα/κλείσιμο του διαγράμματος επάνω από το ερώτημα">
                                    <span class="diag-btn-icon">🗺️</span>
                                    <span class="diag-btn-label">Διάγραμμα</span>
                                    <span class="diag-btn-arrow">▾</span>
                                </button>
                            </div>
                            <!-- Collapsible Inline Diagram Drawer (Thema A2) -->
                            <div class="exam-inline-diagram-drawer" id="diag-drawer-a2-9" style="display: none;">
                                <div class="exam-inline-diagram-card theme-a2">
                                    <div class="exam-inline-diagram-header">
                                        <span class="exam-inline-badge theme-a2">🔄 Θέμα Α2: Παράλληλη Συνδεσμολογία</span>
                                        <button type="button" class="exam-inline-close-btn" onclick="ExamSolutionsGuide.toggleDiagram('a2-9', 'a2')" title="Κλείσιμο διαγράμματος">✕</button>
                                    </div>
                                    <div class="exam-inline-diagram-grid">
                                        <div class="exam-inline-diagram-img-wrap" onclick="openDiagramLightbox('assets/images/exam_solutions/circuit_parallel_a2.png', 'Διάγραμμα Κυκλώματος Θέματος Α2 (Παράλληλη Συνδεσμολογία)')" title="Κλικ για μεγέθυνση σε πλήρη οθόνη">
                                            <img src="assets/images/exam_solutions/circuit_parallel_a2.png" alt="Thema A2 Circuit Diagram" loading="lazy" />
                                            <span class="diagram-zoom-hint">🔍 Κλικ για Πλήρη Οθόνη</span>
                                        </div>
                                        <div class="exam-inline-diagram-specs">
                                            <h5 class="exam-inline-specs-heading" style="color: #67e8f9;">Δεδομένα Κυκλώματος Θέματος Α2</h5>
                                            <ul class="exam-inline-specs-list">
                                                <li>Τάση πηγής: <strong>$V = 75\\text{ V}$</strong></li>
                                                <li>Αντιστάτης 1: <strong>$R_1 = 30\\ \\Omega$</strong></li>
                                                <li>Αντιστάτης 2: <strong>$R_2 = 10\\ \\Omega$</strong></li>
                                                <li>Συνδεσμολογία: <strong>Παράλληλη</strong> ($V_1 = V_2 = V = 75\\text{ V}$)</li>
                                                <li>Διακόπτες: Κεντρικός <strong>[Α, Β]</strong>, Κλαδικοί <strong>[Γ, Δ]</strong> (για $R_1$) και <strong>[Ε, Ζ]</strong> (για $R_2$)</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <p class="exam-q-prompt">
                                Να υπολογίσετε την ένταση του ρεύματος $I_2'$ που διαρρέει τον $R_2$, εάν ανοίξει προσωρινά ο διακόπτης [Γ, Δ] (του άλλου κλάδου).
                            </p>
                            <div class="exam-options-grid" id="opts-grid-a2-9">
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-9', 0)"><span class="opt-label">(α) $75\\text{ A}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-9', 1)"><span class="opt-label">(β) $7,5\\text{ A}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-9', 2)"><span class="opt-label">(γ) $2,5\\text{ A}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-9', 3)"><span class="opt-label">(δ) $3\\text{ A}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-9', 4)"><span class="opt-label">(ε) $3,75\\text{ A}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-9', 5)"><span class="opt-label">(στ) $10\\text{ A}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-9', 6)"><span class="opt-label">(ζ) $20\\text{ A}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-9', 7)"><span class="opt-label">(η) $4\\text{ A}$</span></button>
                            </div>
                            <div class="exam-q-feedback" id="feedback-a2-9" style="display: none;"></div>
                            <div class="exam-sol-wrap">
                                <button class="exam-sol-toggle-btn" id="btn-sol-a2-9" onclick="ExamSolutionsGuide.toggleSolution('a2-9')">
                                    <span>💡</span><span>Επίλυση</span><span class="sol-btn-arrow">▾</span>
                                </button>
                                <div class="exam-solution-body" id="sol-a2-9" style="display: none;">
                                    <div class="exam-sol-inner">
                                        <p><strong>Θεμελιώδης Αρχή Παράλληλης Σύνδεσης:</strong></p>
                                        <p>Το άνοιγμα του διακόπτη [Γ, Δ] καταργεί το ρεύμα στον κλάδο του $R_1$ ($I_1' = 0$). Όμως η τάση στα άκρα του κλάδου του $R_2$ <strong>παραμένει απαράλλακτη και ίση με την τάση της πηγής ($75\\text{ V}$)</strong>!</p>
                                        <div class="formula-latex">$$I_2' = \\frac{V}{R_2} = \\frac{75\\text{ V}}{10\\ \\Omega} = 7,5\\text{ A}\\quad \\text{(αμετάβλητη!)}$$</div>
                                        <p><em>(Αυτό είναι το τεράστιο πλεονέκτημα του οικιακού δικτύου: όταν κλείνουμε το φως στο δωμάτιο, το ψυγείο συνεχίζει να λειτουργεί απρόσκοπτα!).</em></p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Q10 -->
                        <div class="exam-question-card glass-card">
                            <div class="exam-q-header">
                                <span class="exam-q-badge" style="background: rgba(6, 182, 212, 0.2); color: #67e8f9; border-color: rgba(6, 182, 212, 0.4);">Ερώτημα 10</span>
                                <h4 class="exam-q-title">Ποσότητα φορτίου που διαρρέει την πηγή σε $t = 20\\text{ s}$ εάν ανοίξει ο [Γ, Δ]</h4>
                            
                                <button class="exam-diagram-toggle-btn theme-a2" id="btn-diag-a2-10" 
                                        onclick="ExamSolutionsGuide.toggleDiagram('a2-10', 'a2')"
                                         title="Κλικ για άνοιγμα/κλείσιμο του διαγράμματος επάνω από το ερώτημα">
                                    <span class="diag-btn-icon">🗺️</span>
                                    <span class="diag-btn-label">Διάγραμμα</span>
                                    <span class="diag-btn-arrow">▾</span>
                                </button>
                            </div>
                            <!-- Collapsible Inline Diagram Drawer (Thema A2) -->
                            <div class="exam-inline-diagram-drawer" id="diag-drawer-a2-10" style="display: none;">
                                <div class="exam-inline-diagram-card theme-a2">
                                    <div class="exam-inline-diagram-header">
                                        <span class="exam-inline-badge theme-a2">🔄 Θέμα Α2: Παράλληλη Συνδεσμολογία</span>
                                        <button type="button" class="exam-inline-close-btn" onclick="ExamSolutionsGuide.toggleDiagram('a2-10', 'a2')" title="Κλείσιμο διαγράμματος">✕</button>
                                    </div>
                                    <div class="exam-inline-diagram-grid">
                                        <div class="exam-inline-diagram-img-wrap" onclick="openDiagramLightbox('assets/images/exam_solutions/circuit_parallel_a2.png', 'Διάγραμμα Κυκλώματος Θέματος Α2 (Παράλληλη Συνδεσμολογία)')" title="Κλικ για μεγέθυνση σε πλήρη οθόνη">
                                            <img src="assets/images/exam_solutions/circuit_parallel_a2.png" alt="Thema A2 Circuit Diagram" loading="lazy" />
                                            <span class="diagram-zoom-hint">🔍 Κλικ για Πλήρη Οθόνη</span>
                                        </div>
                                        <div class="exam-inline-diagram-specs">
                                            <h5 class="exam-inline-specs-heading" style="color: #67e8f9;">Δεδομένα Κυκλώματος Θέματος Α2</h5>
                                            <ul class="exam-inline-specs-list">
                                                <li>Τάση πηγής: <strong>$V = 75\\text{ V}$</strong></li>
                                                <li>Αντιστάτης 1: <strong>$R_1 = 30\\ \\Omega$</strong></li>
                                                <li>Αντιστάτης 2: <strong>$R_2 = 10\\ \\Omega$</strong></li>
                                                <li>Συνδεσμολογία: <strong>Παράλληλη</strong> ($V_1 = V_2 = V = 75\\text{ V}$)</li>
                                                <li>Διακόπτες: Κεντρικός <strong>[Α, Β]</strong>, Κλαδικοί <strong>[Γ, Δ]</strong> (για $R_1$) και <strong>[Ε, Ζ]</strong> (για $R_2$)</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <p class="exam-q-prompt">
                                Να υπολογίσετε το φορτίο $q_{\\text{πηγ}}$ που εξέρχεται από την πηγή σε χρόνο $t = 20\\text{ s}$, εάν ανοίξει προσωρινά ο διακόπτης [Γ, Δ].
                            </p>
                            <div class="exam-options-grid" id="opts-grid-a2-10">
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-10', 0)"><span class="opt-label">(α) $750\\text{ C}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-10', 1)"><span class="opt-label">(β) $75\\text{ C}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-10', 2)"><span class="opt-label">(γ) $25\\text{ C}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-10', 3)"><span class="opt-label">(δ) $150\\text{ C}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-10', 4)"><span class="opt-label">(ε) $3,75\\text{ C}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-10', 5)"><span class="opt-label">(στ) $500\\text{ C}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-10', 6)"><span class="opt-label">(ζ) $250\\text{ C}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-10', 7)"><span class="opt-label">(η) $50\\text{ C}$</span></button>
                            </div>
                            <div class="exam-q-feedback" id="feedback-a2-10" style="display: none;"></div>
                            <div class="exam-sol-wrap">
                                <button class="exam-sol-toggle-btn" id="btn-sol-a2-10" onclick="ExamSolutionsGuide.toggleSolution('a2-10')">
                                    <span>💡</span><span>Επίλυση</span><span class="sol-btn-arrow">▾</span>
                                </button>
                                <div class="exam-solution-body" id="sol-a2-10" style="display: none;">
                                    <div class="exam-sol-inner">
                                        <p><strong>Αιτιολόγηση:</strong> Με ανοιχτό τον κλάδο του $R_1$, το ολικό ρεύμα της πηγής μειώνεται και ισούται αποκλειστικά με το ρεύμα του μοναδικού ενεργού κλάδου ($R_2$):</p>
                                        <div class="formula-latex">$$I_{\\text{ολ}}' = I_2' = 7,5\\text{ A}$$</div>
                                        <p>Σε χρονικό διάστημα $t = 20\\text{ s}$:</p>
                                        <div class="formula-latex">$$q = I_{\\text{ολ}}' \\cdot t = 7,5\\text{ A} \\cdot 20\\text{ s} = 150\\text{ C}$$</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Q11 -->
                        <div class="exam-question-card glass-card">
                            <div class="exam-q-header">
                                <span class="exam-q-badge" style="background: rgba(6, 182, 212, 0.2); color: #67e8f9; border-color: rgba(6, 182, 212, 0.4);">Ερώτημα 11</span>
                                <h4 class="exam-q-title">Διαφορά δυναμικού στα άκρα του $R_1$ εάν συνδέσουμε τα σημεία Δ και Η με καλώδιο</h4>
                            
                                <button class="exam-diagram-toggle-btn theme-a2" id="btn-diag-a2-11" 
                                        onclick="ExamSolutionsGuide.toggleDiagram('a2-11', 'a2')"
                                         title="Κλικ για άνοιγμα/κλείσιμο του διαγράμματος επάνω από το ερώτημα">
                                    <span class="diag-btn-icon">🗺️</span>
                                    <span class="diag-btn-label">Διάγραμμα</span>
                                    <span class="diag-btn-arrow">▾</span>
                                </button>
                            </div>
                            <!-- Collapsible Inline Diagram Drawer (Thema A2) -->
                            <div class="exam-inline-diagram-drawer" id="diag-drawer-a2-11" style="display: none;">
                                <div class="exam-inline-diagram-card theme-a2">
                                    <div class="exam-inline-diagram-header">
                                        <span class="exam-inline-badge theme-a2">🔄 Θέμα Α2: Παράλληλη Συνδεσμολογία</span>
                                        <button type="button" class="exam-inline-close-btn" onclick="ExamSolutionsGuide.toggleDiagram('a2-11', 'a2')" title="Κλείσιμο διαγράμματος">✕</button>
                                    </div>
                                    <div class="exam-inline-diagram-grid">
                                        <div class="exam-inline-diagram-img-wrap" onclick="openDiagramLightbox('assets/images/exam_solutions/circuit_parallel_a2.png', 'Διάγραμμα Κυκλώματος Θέματος Α2 (Παράλληλη Συνδεσμολογία)')" title="Κλικ για μεγέθυνση σε πλήρη οθόνη">
                                            <img src="assets/images/exam_solutions/circuit_parallel_a2.png" alt="Thema A2 Circuit Diagram" loading="lazy" />
                                            <span class="diagram-zoom-hint">🔍 Κλικ για Πλήρη Οθόνη</span>
                                        </div>
                                        <div class="exam-inline-diagram-specs">
                                            <h5 class="exam-inline-specs-heading" style="color: #67e8f9;">Δεδομένα Κυκλώματος Θέματος Α2</h5>
                                            <ul class="exam-inline-specs-list">
                                                <li>Τάση πηγής: <strong>$V = 75\\text{ V}$</strong></li>
                                                <li>Αντιστάτης 1: <strong>$R_1 = 30\\ \\Omega$</strong></li>
                                                <li>Αντιστάτης 2: <strong>$R_2 = 10\\ \\Omega$</strong></li>
                                                <li>Συνδεσμολογία: <strong>Παράλληλη</strong> ($V_1 = V_2 = V = 75\\text{ V}$)</li>
                                                <li>Διακόπτες: Κεντρικός <strong>[Α, Β]</strong>, Κλαδικοί <strong>[Γ, Δ]</strong> (για $R_1$) και <strong>[Ε, Ζ]</strong> (για $R_2$)</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <p class="exam-q-prompt">
                                Να υπολογίσετε τη διαφορά δυναμικού στα άκρα του $R_1$, εάν συνδέσουμε τα σημεία Δ και Η με ένα ιδανικό καλώδιο.
                            </p>
                            <div class="exam-options-grid" id="opts-grid-a2-11">
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-11', 0)"><span class="opt-label">(α) $75\\text{ V}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-11', 1)"><span class="opt-label">(β) $30\\text{ V}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-11', 2)"><span class="opt-label">(γ) $10\\text{ V}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-11', 3)"><span class="opt-label">(δ) $7,5\\text{ V}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-11', 4)"><span class="opt-label">(ε) άπειρη</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-11', 5)"><span class="opt-label">(στ) μηδέν</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-11', 6)"><span class="opt-label">(ζ) $150\\text{ V}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-11', 7)"><span class="opt-label">(η) $37,5\\text{ V}$</span></button>
                            </div>
                            <div class="exam-q-feedback" id="feedback-a2-11" style="display: none;"></div>
                            <div class="exam-sol-wrap">
                                <button class="exam-sol-toggle-btn" id="btn-sol-a2-11" onclick="ExamSolutionsGuide.toggleSolution('a2-11')">
                                    <span>💡</span><span>Επίλυση</span><span class="sol-btn-arrow">▾</span>
                                </button>
                                <div class="exam-solution-body" id="sol-a2-11" style="display: none;">
                                    <div class="exam-sol-inner">
                                        <p><strong>Αιτιολόγηση:</strong> Τα σημεία Δ και Η βρίσκονται ήδη στην ίδια αγώγιμη γραμμή (στον ίδιο κόμβο) που συνδέεται απευθείας με τον έναν πόλο της πηγής. Ένα πρόσθετο καλώδιο μεταξύ τους δεν δημιουργεί καμία αλλαγή στο κύκλωμα.</p>
                                        <p>Η τάση στα άκρα του $R_1$ παραμένει $V_1 = 75\\text{ V}$.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Q12 -->
                        <div class="exam-question-card glass-card">
                            <div class="exam-q-header">
                                <span class="exam-q-badge" style="background: rgba(6, 182, 212, 0.2); color: #67e8f9; border-color: rgba(6, 182, 212, 0.4);">Ερώτημα 12</span>
                                <h4 class="exam-q-title">Ένταση ρεύματος στον διακόπτη [Γ, Δ] εάν συνδέσουμε τα σημεία Ζ και Η</h4>
                            
                                <button class="exam-diagram-toggle-btn theme-a2" id="btn-diag-a2-12" 
                                        onclick="ExamSolutionsGuide.toggleDiagram('a2-12', 'a2')"
                                         title="Κλικ για άνοιγμα/κλείσιμο του διαγράμματος επάνω από το ερώτημα">
                                    <span class="diag-btn-icon">🗺️</span>
                                    <span class="diag-btn-label">Διάγραμμα</span>
                                    <span class="diag-btn-arrow">▾</span>
                                </button>
                            </div>
                            <!-- Collapsible Inline Diagram Drawer (Thema A2) -->
                            <div class="exam-inline-diagram-drawer" id="diag-drawer-a2-12" style="display: none;">
                                <div class="exam-inline-diagram-card theme-a2">
                                    <div class="exam-inline-diagram-header">
                                        <span class="exam-inline-badge theme-a2">🔄 Θέμα Α2: Παράλληλη Συνδεσμολογία</span>
                                        <button type="button" class="exam-inline-close-btn" onclick="ExamSolutionsGuide.toggleDiagram('a2-12', 'a2')" title="Κλείσιμο διαγράμματος">✕</button>
                                    </div>
                                    <div class="exam-inline-diagram-grid">
                                        <div class="exam-inline-diagram-img-wrap" onclick="openDiagramLightbox('assets/images/exam_solutions/circuit_parallel_a2.png', 'Διάγραμμα Κυκλώματος Θέματος Α2 (Παράλληλη Συνδεσμολογία)')" title="Κλικ για μεγέθυνση σε πλήρη οθόνη">
                                            <img src="assets/images/exam_solutions/circuit_parallel_a2.png" alt="Thema A2 Circuit Diagram" loading="lazy" />
                                            <span class="diagram-zoom-hint">🔍 Κλικ για Πλήρη Οθόνη</span>
                                        </div>
                                        <div class="exam-inline-diagram-specs">
                                            <h5 class="exam-inline-specs-heading" style="color: #67e8f9;">Δεδομένα Κυκλώματος Θέματος Α2</h5>
                                            <ul class="exam-inline-specs-list">
                                                <li>Τάση πηγής: <strong>$V = 75\\text{ V}$</strong></li>
                                                <li>Αντιστάτης 1: <strong>$R_1 = 30\\ \\Omega$</strong></li>
                                                <li>Αντιστάτης 2: <strong>$R_2 = 10\\ \\Omega$</strong></li>
                                                <li>Συνδεσμολογία: <strong>Παράλληλη</strong> ($V_1 = V_2 = V = 75\\text{ V}$)</li>
                                                <li>Διακόπτες: Κεντρικός <strong>[Α, Β]</strong>, Κλαδικοί <strong>[Γ, Δ]</strong> (για $R_1$) και <strong>[Ε, Ζ]</strong> (για $R_2$)</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <p class="exam-q-prompt">
                                Να υπολογίσετε το ρεύμα που διαρρέει τον διακόπτη [Γ, Δ], εάν συνδέσουμε προσωρινά τα σημεία Ζ και Η με ιδανικό καλώδιο.
                            </p>
                            <div class="exam-options-grid" id="opts-grid-a2-12">
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-12', 0)"><span class="opt-label">(α) $750\\text{ A}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-12', 1)"><span class="opt-label">(β) $7,5\\text{ A}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-12', 2)"><span class="opt-label">(γ) $75\\text{ A}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-12', 3)"><span class="opt-label">(δ) $2,5\\text{ A}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-12', 4)"><span class="opt-label">(ε) μηδέν <span class="opt-sub">($0\\text{ A}$)</span></span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-12', 5)"><span class="opt-label">(στ) $10\\text{ A}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-12', 6)"><span class="opt-label">(ζ) $20\\text{ A}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-12', 7)"><span class="opt-label">(η) άπειρη</span></button>
                            </div>
                            <div class="exam-q-feedback" id="feedback-a2-12" style="display: none;"></div>
                            <div class="exam-sol-wrap">
                                <button class="exam-sol-toggle-btn" id="btn-sol-a2-12" onclick="ExamSolutionsGuide.toggleSolution('a2-12')">
                                    <span>💡</span><span>Επίλυση</span><span class="sol-btn-arrow">▾</span>
                                </button>
                                <div class="exam-solution-body" id="sol-a2-12" style="display: none;">
                                    <div class="exam-sol-inner">
                                        <p><strong>Κρίσιμη Ανάλυση Βραχυκυκλώματος στα Παράλληλα:</strong></p>
                                        <p>Τα σημεία Ζ και Η είναι τα δύο άκρα του αντιστάτη $R_2$. Επειδή όμως το κύκλωμα είναι παράλληλο, τα σημεία αυτά συνδέονται ταυτόχρονα και με τους δύο κύριους αγωγούς της πηγής!</p>
                                        <p>Συνδέοντας τα Ζ και Η με καλώδιο, <strong>βραχυκυκλώνονται ταυτόχρονα ΟΛΟΙ οι παράλληλοι κλάδοι ΚΑΙ η πηγή</strong>! Η διαφορά δυναμικού σε όλους τους κλάδους μηδενίζεται ($V \\to 0$).</p>
                                        <p>Όλο το τεράστιο ρεύμα της πηγής ρέει μέσα από το καλώδιο βραχυκυκλώματος, και το ρεύμα μέσα από τον διακόπτη [Γ, Δ] μηδενίζεται: $I_{\\text{ΓΔ}} = 0\\text{ A}$.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Q13 -->
                        <div class="exam-question-card glass-card">
                            <div class="exam-q-header">
                                <span class="exam-q-badge" style="background: rgba(6, 182, 212, 0.2); color: #67e8f9; border-color: rgba(6, 182, 212, 0.4);">Ερώτημα 13</span>
                                <h4 class="exam-q-title">Ρυθμός κατανάλωσης ενέργειας του $R_1$ εάν ενωθούν τα σημεία Γ και Ε</h4>
                            
                                <button class="exam-diagram-toggle-btn theme-a2" id="btn-diag-a2-13" 
                                        onclick="ExamSolutionsGuide.toggleDiagram('a2-13', 'a2')"
                                         title="Κλικ για άνοιγμα/κλείσιμο του διαγράμματος επάνω από το ερώτημα">
                                    <span class="diag-btn-icon">🗺️</span>
                                    <span class="diag-btn-label">Διάγραμμα</span>
                                    <span class="diag-btn-arrow">▾</span>
                                </button>
                            </div>
                            <!-- Collapsible Inline Diagram Drawer (Thema A2) -->
                            <div class="exam-inline-diagram-drawer" id="diag-drawer-a2-13" style="display: none;">
                                <div class="exam-inline-diagram-card theme-a2">
                                    <div class="exam-inline-diagram-header">
                                        <span class="exam-inline-badge theme-a2">🔄 Θέμα Α2: Παράλληλη Συνδεσμολογία</span>
                                        <button type="button" class="exam-inline-close-btn" onclick="ExamSolutionsGuide.toggleDiagram('a2-13', 'a2')" title="Κλείσιμο διαγράμματος">✕</button>
                                    </div>
                                    <div class="exam-inline-diagram-grid">
                                        <div class="exam-inline-diagram-img-wrap" onclick="openDiagramLightbox('assets/images/exam_solutions/circuit_parallel_a2.png', 'Διάγραμμα Κυκλώματος Θέματος Α2 (Παράλληλη Συνδεσμολογία)')" title="Κλικ για μεγέθυνση σε πλήρη οθόνη">
                                            <img src="assets/images/exam_solutions/circuit_parallel_a2.png" alt="Thema A2 Circuit Diagram" loading="lazy" />
                                            <span class="diagram-zoom-hint">🔍 Κλικ για Πλήρη Οθόνη</span>
                                        </div>
                                        <div class="exam-inline-diagram-specs">
                                            <h5 class="exam-inline-specs-heading" style="color: #67e8f9;">Δεδομένα Κυκλώματος Θέματος Α2</h5>
                                            <ul class="exam-inline-specs-list">
                                                <li>Τάση πηγής: <strong>$V = 75\\text{ V}$</strong></li>
                                                <li>Αντιστάτης 1: <strong>$R_1 = 30\\ \\Omega$</strong></li>
                                                <li>Αντιστάτης 2: <strong>$R_2 = 10\\ \\Omega$</strong></li>
                                                <li>Συνδεσμολογία: <strong>Παράλληλη</strong> ($V_1 = V_2 = V = 75\\text{ V}$)</li>
                                                <li>Διακόπτες: Κεντρικός <strong>[Α, Β]</strong>, Κλαδικοί <strong>[Γ, Δ]</strong> (για $R_1$) και <strong>[Ε, Ζ]</strong> (για $R_2$)</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <p class="exam-q-prompt">
                                Να υπολογίσετε τον ρυθμό κατανάλωσης ενέργειας (ισχύ) του $R_1$, εάν συνδέσουμε προσωρινά τα σημεία Γ και Ε με ιδανικό καλώδιο.
                            </p>
                            <div class="exam-options-grid" id="opts-grid-a2-13">
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-13', 0)"><span class="opt-label">(α) άπειρος</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-13', 1)"><span class="opt-label">(β) $1500\\text{ W}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-13', 2)"><span class="opt-label">(γ) $45,5\\text{ J/s}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-13', 3)"><span class="opt-label">(δ) $600\\text{ J/s}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-13', 4)"><span class="opt-label">(ε) $1800\\text{ W}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-13', 5)"><span class="opt-label">(στ) $120\\text{ W}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-13', 6)"><span class="opt-label">(ζ) $200\\text{ J/s}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-13', 7)"><span class="opt-label">(η) μηδέν <span class="opt-sub">($0\\text{ W}$)</span></span></button>
                            </div>
                            <div class="exam-q-feedback" id="feedback-a2-13" style="display: none;"></div>
                            <div class="exam-sol-wrap">
                                <button class="exam-sol-toggle-btn" id="btn-sol-a2-13" onclick="ExamSolutionsGuide.toggleSolution('a2-13')">
                                    <span>💡</span><span>Επίλυση</span><span class="sol-btn-arrow">▾</span>
                                </button>
                                <div class="exam-solution-body" id="sol-a2-13" style="display: none;">
                                    <div class="exam-sol-inner">
                                        <p><strong>Αιτιολόγηση:</strong> Το σημείο Γ συνδέεται με τον έναν πόλο και το σημείο Ε με τον άλλο πόλο της πηγής. Η ένωσή τους με ιδανικό καλώδιο προκαλεί <strong>Ολικό Βραχυκύκλωμα της Πηγής</strong>.</p>
                                        <p>Η τάση στους αντιστάτες μηδενίζεται, άρα ο ρυθμός κατανάλωσης ενέργειας (ισχύς) του $R_1$ μηδενίζεται:</p>
                                        <div class="formula-latex">$$P_1 = 0\\text{ W} = 0\\text{ J/s}\\quad (\\text{μηδέν})$$</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Q14 -->
                        <div class="exam-question-card glass-card">
                            <div class="exam-q-header">
                                <span class="exam-q-badge" style="background: rgba(6, 182, 212, 0.2); color: #67e8f9; border-color: rgba(6, 182, 212, 0.4);">Ερώτημα 14</span>
                                <h4 class="exam-q-title">Ποσότητα φορτίου που διέρχεται από το σημείο Η σε $t = 30\\text{ s}$ εάν ανοίξει ο [Γ, Δ]</h4>
                            
                                <button class="exam-diagram-toggle-btn theme-a2" id="btn-diag-a2-14" 
                                        onclick="ExamSolutionsGuide.toggleDiagram('a2-14', 'a2')"
                                         title="Κλικ για άνοιγμα/κλείσιμο του διαγράμματος επάνω από το ερώτημα">
                                    <span class="diag-btn-icon">🗺️</span>
                                    <span class="diag-btn-label">Διάγραμμα</span>
                                    <span class="diag-btn-arrow">▾</span>
                                </button>
                            </div>
                            <!-- Collapsible Inline Diagram Drawer (Thema A2) -->
                            <div class="exam-inline-diagram-drawer" id="diag-drawer-a2-14" style="display: none;">
                                <div class="exam-inline-diagram-card theme-a2">
                                    <div class="exam-inline-diagram-header">
                                        <span class="exam-inline-badge theme-a2">🔄 Θέμα Α2: Παράλληλη Συνδεσμολογία</span>
                                        <button type="button" class="exam-inline-close-btn" onclick="ExamSolutionsGuide.toggleDiagram('a2-14', 'a2')" title="Κλείσιμο διαγράμματος">✕</button>
                                    </div>
                                    <div class="exam-inline-diagram-grid">
                                        <div class="exam-inline-diagram-img-wrap" onclick="openDiagramLightbox('assets/images/exam_solutions/circuit_parallel_a2.png', 'Διάγραμμα Κυκλώματος Θέματος Α2 (Παράλληλη Συνδεσμολογία)')" title="Κλικ για μεγέθυνση σε πλήρη οθόνη">
                                            <img src="assets/images/exam_solutions/circuit_parallel_a2.png" alt="Thema A2 Circuit Diagram" loading="lazy" />
                                            <span class="diagram-zoom-hint">🔍 Κλικ για Πλήρη Οθόνη</span>
                                        </div>
                                        <div class="exam-inline-diagram-specs">
                                            <h5 class="exam-inline-specs-heading" style="color: #67e8f9;">Δεδομένα Κυκλώματος Θέματος Α2</h5>
                                            <ul class="exam-inline-specs-list">
                                                <li>Τάση πηγής: <strong>$V = 75\\text{ V}$</strong></li>
                                                <li>Αντιστάτης 1: <strong>$R_1 = 30\\ \\Omega$</strong></li>
                                                <li>Αντιστάτης 2: <strong>$R_2 = 10\\ \\Omega$</strong></li>
                                                <li>Συνδεσμολογία: <strong>Παράλληλη</strong> ($V_1 = V_2 = V = 75\\text{ V}$)</li>
                                                <li>Διακόπτες: Κεντρικός <strong>[Α, Β]</strong>, Κλαδικοί <strong>[Γ, Δ]</strong> (για $R_1$) και <strong>[Ε, Ζ]</strong> (για $R_2$)</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <p class="exam-q-prompt">
                                Να υπολογίσετε το φορτίο $q_{\\text{Η}}$ που διέρχεται από το σημείο Η σε χρόνο $t = 30\\text{ s}$, εάν ανοίξει προσωρινά ο διακόπτης [Γ, Δ].
                            </p>
                            <div class="exam-options-grid" id="opts-grid-a2-14">
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-14', 0)"><span class="opt-label">(α) $75\\text{ C}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-14', 1)"><span class="opt-label">(β) $7,5\\text{ C}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-14', 2)"><span class="opt-label">(γ) άπειρη</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-14', 3)"><span class="opt-label">(δ) $3\\text{ C}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-14', 4)"><span class="opt-label">(ε) $3,75\\text{ C}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-14', 5)"><span class="opt-label">(στ) $225\\text{ C}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-14', 6)"><span class="opt-label">(ζ) $20\\text{ C}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-14', 7)"><span class="opt-label">(η) $4\\text{ C}$</span></button>
                            </div>
                            <div class="exam-q-feedback" id="feedback-a2-14" style="display: none;"></div>
                            <div class="exam-sol-wrap">
                                <button class="exam-sol-toggle-btn" id="btn-sol-a2-14" onclick="ExamSolutionsGuide.toggleSolution('a2-14')">
                                    <span>💡</span><span>Επίλυση</span><span class="sol-btn-arrow">▾</span>
                                </button>
                                <div class="exam-solution-body" id="sol-a2-14" style="display: none;">
                                    <div class="exam-sol-inner">
                                        <p><strong>Αιτιολόγηση:</strong> Το σημείο Η βρίσκεται στον κλάδο του $R_2$. Όπως αποδείξαμε στο Ερώτημα 9, το ρεύμα στον κλάδο του $R_2$ παραμένει $I_2 = 7,5\\text{ A}$ ανεξάρτητα από την κατάσταση του άλλου κλάδου.</p>
                                        <p>Συνεπώς σε χρόνο $t = 30\\text{ s}$:</p>
                                        <div class="formula-latex">$$q = I_2 \\cdot t = 7,5\\text{ A} \\cdot 30\\text{ s} = 225\\text{ C}$$</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Q15 -->
                        <div class="exam-question-card glass-card">
                            <div class="exam-q-header">
                                <span class="exam-q-badge" style="background: rgba(6, 182, 212, 0.2); color: #67e8f9; border-color: rgba(6, 182, 212, 0.4);">Ερώτημα 15</span>
                                <h4 class="exam-q-title">Ενέργεια που παράγει η πηγή σε $t = 40\\text{ s}$ εάν συνδέσουμε τα σημεία Β και Δ με καλώδιο</h4>
                            
                                <button class="exam-diagram-toggle-btn theme-a2" id="btn-diag-a2-15" 
                                        onclick="ExamSolutionsGuide.toggleDiagram('a2-15', 'a2')"
                                         title="Κλικ για άνοιγμα/κλείσιμο του διαγράμματος επάνω από το ερώτημα">
                                    <span class="diag-btn-icon">🗺️</span>
                                    <span class="diag-btn-label">Διάγραμμα</span>
                                    <span class="diag-btn-arrow">▾</span>
                                </button>
                            </div>
                            <!-- Collapsible Inline Diagram Drawer (Thema A2) -->
                            <div class="exam-inline-diagram-drawer" id="diag-drawer-a2-15" style="display: none;">
                                <div class="exam-inline-diagram-card theme-a2">
                                    <div class="exam-inline-diagram-header">
                                        <span class="exam-inline-badge theme-a2">🔄 Θέμα Α2: Παράλληλη Συνδεσμολογία</span>
                                        <button type="button" class="exam-inline-close-btn" onclick="ExamSolutionsGuide.toggleDiagram('a2-15', 'a2')" title="Κλείσιμο διαγράμματος">✕</button>
                                    </div>
                                    <div class="exam-inline-diagram-grid">
                                        <div class="exam-inline-diagram-img-wrap" onclick="openDiagramLightbox('assets/images/exam_solutions/circuit_parallel_a2.png', 'Διάγραμμα Κυκλώματος Θέματος Α2 (Παράλληλη Συνδεσμολογία)')" title="Κλικ για μεγέθυνση σε πλήρη οθόνη">
                                            <img src="assets/images/exam_solutions/circuit_parallel_a2.png" alt="Thema A2 Circuit Diagram" loading="lazy" />
                                            <span class="diagram-zoom-hint">🔍 Κλικ για Πλήρη Οθόνη</span>
                                        </div>
                                        <div class="exam-inline-diagram-specs">
                                            <h5 class="exam-inline-specs-heading" style="color: #67e8f9;">Δεδομένα Κυκλώματος Θέματος Α2</h5>
                                            <ul class="exam-inline-specs-list">
                                                <li>Τάση πηγής: <strong>$V = 75\\text{ V}$</strong></li>
                                                <li>Αντιστάτης 1: <strong>$R_1 = 30\\ \\Omega$</strong></li>
                                                <li>Αντιστάτης 2: <strong>$R_2 = 10\\ \\Omega$</strong></li>
                                                <li>Συνδεσμολογία: <strong>Παράλληλη</strong> ($V_1 = V_2 = V = 75\\text{ V}$)</li>
                                                <li>Διακόπτες: Κεντρικός <strong>[Α, Β]</strong>, Κλαδικοί <strong>[Γ, Δ]</strong> (για $R_1$) και <strong>[Ε, Ζ]</strong> (για $R_2$)</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <p class="exam-q-prompt">
                                Να υπολογίσετε την ενέργεια $E_{\\text{πηγ}}$ που παράγει η πηγή σε χρόνο $t = 40\\text{ s}$, εάν συνδέσουμε προσωρινά τα σημεία Β και Δ με ιδανικό καλώδιο.
                            </p>
                            <div class="exam-options-grid" id="opts-grid-a2-15">
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-15', 0)"><span class="opt-label">(α) άπειρη</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-15', 1)"><span class="opt-label">(β) $30000\\text{ J}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-15', 2)"><span class="opt-label">(γ) $45000\\text{ J}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-15', 3)"><span class="opt-label">(δ) $6000\\text{ J}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-15', 4)"><span class="opt-label">(ε) $18000\\text{ J}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-15', 5)"><span class="opt-label">(στ) $13500\\text{ J}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-15', 6)"><span class="opt-label">(ζ) $24000\\text{ J}$</span></button>
                                <button type="button" class="exam-opt-pill" onclick="ExamSolutionsGuide.checkAnswer('a2-15', 7)"><span class="opt-label">(η) μηδέν</span></button>
                            </div>
                            <div class="exam-q-feedback" id="feedback-a2-15" style="display: none;"></div>
                            <div class="exam-sol-wrap">
                                <button class="exam-sol-toggle-btn" id="btn-sol-a2-15" onclick="ExamSolutionsGuide.toggleSolution('a2-15')">
                                    <span>💡</span><span>Επίλυση</span><span class="sol-btn-arrow">▾</span>
                                </button>
                                <div class="exam-solution-body" id="sol-a2-15" style="display: none;">
                                    <div class="exam-sol-inner">
                                        <p><strong>Αιτιολόγηση:</strong> Τα σημεία Β και Δ ανήκουν στην ίδια αγώγιμη γραμμή (ισοδυναμικά σημεία). Η σύνδεσή τους δεν επιφέρει καμία απολύτως μεταβολή στη λειτουργία του κυκλώματος.</p>
                                        <p>Η ισχύς της πηγής είναι:</p>
                                        <div class="formula-latex">$$P_{\\text{πηγ}} = V \\cdot I_{\\text{ολ}} = 75\\text{ V} \\cdot 10\\text{ A} = 750\\text{ W}$$</div>
                                        <p>Η παραγόμενη ενέργεια σε χρόνο $t = 40\\text{ s}$ είναι:</p>
                                        <div class="formula-latex">$$E = P_{\\text{πηγ}} \\cdot t = 750\\text{ W} \\cdot 40\\text{ s} = 30000\\text{ J}$$</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </section>

                <!-- ==============================================================
                     SECTION 7: ΑΝΑΚΕΦΑΛΑΙΩΣΗ ΠΑΡΑΛΛΗΛΗΣ & ΒΡΑΧΥΚΥΚΛΩΜΑ
                     ============================================================== -->
                <section class="theory-section exam-section glass-card" id="exam-sec-parallel-short">
                    <div class="sec-header">
                        <div class="sec-number-badge" style="background: linear-gradient(135deg, #0ea5e9, #0284c7);">07</div>
                        <div class="sec-header-text">
                            <h2 class="sec-title">Ανακεφαλαίωση Παράλληλης Σύνδεσης & Βραχυκύκλωμα</h2>
                            <p class="sec-subtitle">Η ουσία της παράλληλης λειτουργίας, οικιακές εφαρμογές και ο καθολικός κίνδυνος βραχυκυκλώματος</p>
                        </div>
                    </div>

                    <div class="exam-pro-grid">
                        <!-- CARD 1: HOME NETWORK ADVANTAGE -->
                        <div class="exam-pro-card theme-cyan">
                            <div class="exam-pro-header">
                                <div class="exam-pro-icon-box cyan">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                                        <polyline points="9 22 9 12 15 12 15 22"></polyline>
                                    </svg>
                                </div>
                                <div class="exam-pro-title-wrap">
                                    <span class="exam-pro-tag cyan">Οικιακή Εγκατάσταση &amp; Αυτονομία</span>
                                    <h3 class="exam-pro-title">Το Πλεονέκτημα του Οικιακού Δικτύου</h3>
                                </div>
                            </div>

                            <div class="exam-pro-callout cyan">
                                Στο παράλληλο κύκλωμα, κάθε συσκευή (κλάδος) συνδέεται <strong>απευθείας στους κύριους αγωγούς</strong> της πηγής (φάση &amp; ουδέτερος).
                            </div>

                            <div class="exam-pro-items">
                                <div class="exam-pro-item">
                                    <div class="exam-pro-item-top">
                                        <div class="exam-pro-item-title">
                                            <span>⚡</span> Κοινή Ονομαστική Τάση
                                        </div>
                                        <span class="exam-pro-item-badge cyan">$V_i = V_{\\text{πηγ}} = 230\\text{ V}$</span>
                                    </div>
                                    <p class="exam-pro-item-desc">
                                        Όλες οι συσκευές τροφοδοτούνται με την πλήρη ονομαστική τάση δικτύου, ανεξάρτητα από το πλήθος των άλλων ενεργών συσκευών:
                                    </p>
                                    <div class="exam-pro-item-formula cyan">
                                        $V_1 = V_2 = \\dots = V_{\\text{πηγ}} = 230\\text{ V}$
                                    </div>
                                </div>

                                <div class="exam-pro-item">
                                    <div class="exam-pro-item-top">
                                        <div class="exam-pro-item-title">
                                            <span>🔌</span> Πλήρης Λειτουργική Αυτονομία
                                        </div>
                                        <span class="exam-pro-item-badge cyan">$I_i = \\dfrac{V_{\\text{πηγ}}}{R_i}$</span>
                                    </div>
                                    <p class="exam-pro-item-desc">
                                        Κάθε κλάδος διαθέτει δικό του διακόπτη και απορροφά ρεύμα καθοριζόμενο αποκλειστικά από τη δική του αντίσταση:
                                    </p>
                                    <div class="exam-pro-item-formula cyan">
                                        $I_i = \\dfrac{V_{\\text{πηγ}}}{R_i} \\quad (\\text{πλήρης ανεξαρτησία κλάδων})$
                                    </div>
                                </div>

                                <div class="exam-pro-item">
                                    <div class="exam-pro-item-top">
                                        <div class="exam-pro-item-title">
                                            <span>🛡️</span> Αδιάλειπτη Παροχή σε Βλάβη
                                        </div>
                                        <span class="exam-pro-item-badge cyan">$I_{\\text{λοιπ}} = \\text{σταθερό}$</span>
                                    </div>
                                    <p class="exam-pro-item-desc">
                                        Εάν καεί μία λάμπα ή ανοίξει ένας κλάδος ($I_1 = 0$), οι υπόλοιποι κλάδοι συνεχίζουν απρόσκοπτα χωρίς καμία μεταβολή:
                                    </p>
                                    <div class="exam-pro-item-formula cyan">
                                        $I_1 = 0 \\implies I_k = \\dfrac{V_{\\text{πηγ}}}{R_k} = \\text{αμετάβλητο} \\quad (\\forall k \\neq 1)$
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- CARD 2: SHORT CIRCUIT HAZARD -->
                        <div class="exam-pro-card theme-danger">
                            <div class="exam-pro-header">
                                <div class="exam-pro-icon-box danger">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                                        <line x1="12" y1="9" x2="12" y2="13"></line>
                                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                                    </svg>
                                </div>
                                <div class="exam-pro-title-wrap">
                                    <span class="exam-pro-tag danger">Κρίσιμος Κίνδυνος Ασφάλειας</span>
                                    <h3 class="exam-pro-title">Ο Κίνδυνος Βραχυκυκλώματος στα Παράλληλα</h3>
                                </div>
                            </div>

                            <div class="exam-pro-callout danger">
                                Στην παράλληλη συνδεσμολογία <strong>ΔΕΝ υπάρχει ποτέ «μερικό» βραχυκύκλωμα</strong> — οποιαδήποτε βραχυκύκλωση είναι καθολική!
                            </div>

                            <div class="exam-pro-items">
                                <div class="exam-pro-item">
                                    <div class="exam-pro-item-top">
                                        <div class="exam-pro-item-title">
                                            <span>💥</span> Άμεση Ένωση Πόλων Πηγής
                                        </div>
                                        <span class="exam-pro-item-badge danger">$R_{\\text{ολ}} \\to 0\\ \\Omega$</span>
                                    </div>
                                    <p class="exam-pro-item-desc">
                                        Σύνδεση σύρματος μηδενικής αντίστασης ($R_{\\text{βραχ}} = 0$) σε <em>οποιονδήποτε</em> κλάδο γεφυρώνει αυτόματα τους πόλους της πηγής:
                                    </p>
                                    <div class="exam-pro-item-formula danger">
                                        $\\dfrac{1}{R_{\\text{ολ}}} = \\dfrac{1}{0} + \\sum \\dfrac{1}{R_i} \\implies R_{\\text{ολ}} \\to 0\\ \\Omega$
                                    </div>
                                </div>

                                <div class="exam-pro-item">
                                    <div class="exam-pro-item-top">
                                        <div class="exam-pro-item-title">
                                            <span>⚠️</span> Καθολική Κατάρρευση Τάσης
                                        </div>
                                        <span class="exam-pro-item-badge danger">$V_{\\text{κλάδων}} = 0\\text{ V}$</span>
                                    </div>
                                    <p class="exam-pro-item-desc">
                                        Η τάση μηδενίζεται ακαριαία σε όλους τους κλάδους. Όλα τα φώτα και οι συσκευές σβήνουν λόγω πλήρους παράκαμψης:
                                    </p>
                                    <div class="exam-pro-item-formula danger">
                                        $V_{\\text{κλάδων}} = 0\\text{ V} \\implies I_{\\text{συσκ}} = \\dfrac{0\\text{ V}}{R_i} = 0\\text{ A}$
                                    </div>
                                </div>

                                <div class="exam-pro-item">
                                    <div class="exam-pro-item-top">
                                        <div class="exam-pro-item-title">
                                            <span>🔥</span> Υπερένταση Ρεύματος &amp; Πυρκαγιά
                                        </div>
                                        <span class="exam-pro-item-badge danger">$I_{\\text{πηγ}} \\to \\infty$</span>
                                    </div>
                                    <p class="exam-pro-item-desc">
                                        Το συνολικό ρεύμα εκτοξεύεται σε ακραίες τιμές, προκαλώντας τεράστια θερμική καταπόνηση Joule ($P = I^2 \\cdot R$):
                                    </p>
                                    <div class="exam-pro-item-formula danger">
                                        $I_{\\text{πηγ}} = \\dfrac{V}{R_{\\text{ολ}}} \\to \\infty \\implies P_{\\text{Joule}} = I_{\\text{πηγ}}^2 \\cdot R_{\\text{καλωδ}} \\to \\infty$
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- KEY TAKEAWAY STRIP -->
                    <div class="exam-pro-takeaway">
                        <div class="exam-pro-takeaway-text">
                            <span style="font-size: 1.25rem;">💡</span>
                            <span><strong>Θεμελιώδης Κανόνας:</strong> Στα παράλληλα τα φορτία λειτουργούν ανεξάρτητα, αλλά το βραχυκύκλωμα έστω και ενός κλάδου καταρρέει ακαριαία ολόκληρο το δίκτυο!</span>
                        </div>
                        <div class="exam-pro-takeaway-formula">
                            $V_{\\text{κλάδων}} = V_{\\text{πηγ}} = 230\\text{ V} \\quad\\longleftrightarrow\\quad R_{\\text{βραχ}} = 0 \\implies I_{\\text{πηγ}} \\to \\infty \\quad (V_{\\text{κλ}} = 0\\text{ V})$
                        </div>
                    </div>
                </section>

                <!-- ==============================================================
                     SECTION 8: ΜΕΓΑΛΟΣ ΣΥΓΚΡΙΤΙΚΟΣ ΠΙΝΑΚΑΣ (ΣΕΙΡΑ vs ΠΑΡΑΛΛΗΛΗ)
                     ============================================================== -->
                <section class="theory-section exam-section glass-card" id="exam-sec-summary">
                    <div class="sec-header">
                        <div class="sec-number-badge" style="background: linear-gradient(135deg, #10b981, #059669);">08</div>
                        <div class="sec-header-text">
                            <h2 class="sec-title">Μεγάλος Συγκριτικός Πίνακας: Σειρά vs Παράλληλη</h2>
                            <p class="sec-subtitle">Συγκεντρωτική αντιπαραβολή Σειράς vs Παράλληλης σε όλα τα φυσικά μεγέθη και συμπεριφορές κυκλωμάτων</p>
                        </div>
                    </div>

                    <!-- COMPARISON TABLE -->
                    <div class="comp-table-card summary-table-wrapper">
                        <div class="comp-table-scroll">
                            <table class="comp-table summary-table">
                                <thead>
                                    <tr>
                                        <th class="col-prop">
                                            <span class="th-badge-neutral">
                                                <span>📐</span>
                                                <span>Φυσικό Μέγεθος / Ιδιότητα</span>
                                            </span>
                                        </th>
                                        <th class="col-series">
                                            <span class="th-badge-series">
                                                <span>⚡</span>
                                                <span>Συνδεσμολογία σε Σειρά</span>
                                            </span>
                                        </th>
                                        <th class="col-parallel">
                                            <span class="th-badge-parallel">
                                                <span>🔀</span>
                                                <span>Παράλληλη Συνδεσμολογία</span>
                                            </span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <!-- ROW 1: Current Paths -->
                                    <tr>
                                        <td class="col-prop">
                                            <div class="comp-prop-name">
                                                <span class="comp-prop-icon">🔄</span>
                                                <span class="comp-prop-label">Διαδρομές Ρεύματος</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div class="comp-cell-stack">
                                                <span class="comp-pill purple">Μία και μοναδική διαδρομή</span>
                                                <span class="comp-note">Όλα τα στοιχεία συνδέονται διαδοχικά στον ίδιο κλειστό βρόγχο</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div class="comp-cell-stack">
                                                <span class="comp-pill cyan">Πολλαπλές ανεξάρτητες διαδρομές</span>
                                                <span class="comp-note">Το ρεύμα διακλαδίζεται σε ξεχωριστούς παράλληλους κλάδους</span>
                                            </div>
                                        </td>
                                    </tr>

                                    <!-- ROW 2: Current I -->
                                    <tr>
                                        <td class="col-prop">
                                            <div class="comp-prop-name">
                                                <span class="comp-prop-icon">⚡</span>
                                                <span class="comp-prop-label">Ένταση Ρεύματος <span class="math-nowrap">($I$)</span></span>
                                            </div>
                                        </td>
                                        <td>
                                            <div class="comp-cell-stack">
                                                <span class="comp-pill emerald">✅ Κοινή παντού</span>
                                                <div class="comp-formula-box">$$I = I_1 = I_2$$</div>
                                                <span class="comp-note">Ίδια ακριβώς ποσότητα φορτίου περνά από κάθε αντιστάτη</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div class="comp-cell-stack">
                                                <span class="comp-pill amber">⚡ Επιμερίζεται στους κλάδους</span>
                                                <div class="comp-formula-box">$$I_{\\text{ολ}} = I_1 + I_2$$</div>
                                                <span class="comp-note">1ος Κανόνας Kirchhoff (άθροισμα ρευμάτων των κλάδων)</span>
                                            </div>
                                        </td>
                                    </tr>

                                    <!-- ROW 3: Voltage V -->
                                    <tr>
                                        <td class="col-prop">
                                            <div class="comp-prop-name">
                                                <span class="comp-prop-icon">🔋</span>
                                                <span class="comp-prop-label">Διαφορά Δυναμικού <span class="math-nowrap">($V$)</span></span>
                                            </div>
                                        </td>
                                        <td>
                                            <div class="comp-cell-stack">
                                                <span class="comp-pill amber">⚡ Επιμερίζεται στα στοιχεία</span>
                                                <div class="comp-formula-box">$$V_{\\text{πηγ}} = V_1 + V_2$$</div>
                                                <span class="comp-note">Η τάση πηγής ισούται με το άθροισμα πτώσεων τάσης</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div class="comp-cell-stack">
                                                <span class="comp-pill emerald">✅ Κοινή παντού</span>
                                                <div class="comp-formula-box">$$V_{\\text{πηγ}} = V_1 = V_2$$</div>
                                                <span class="comp-note">Κάθε κλάδος συνδέεται απευθείας στους πόλους της πηγής</span>
                                            </div>
                                        </td>
                                    </tr>

                                    <!-- ROW 4: Equivalent Resistance -->
                                    <tr>
                                        <td class="col-prop">
                                            <div class="comp-prop-name">
                                                <span class="comp-prop-icon">📦</span>
                                                <span class="comp-prop-label">Ισοδύναμη Αντίσταση <span class="math-nowrap">($R_{\\text{ολ}}$)</span></span>
                                            </div>
                                        </td>
                                        <td>
                                            <div class="comp-cell-stack">
                                                <span class="comp-pill purple">📈 Αυξάνεται ($R_{\\text{ολ}} > R_{\\text{max}}$)</span>
                                                <div class="comp-formula-box">$$R_{\\text{ολ}} = R_1 + R_2$$</div>
                                                <span class="comp-note">Πάντοτε μεγαλύτερη από τη μεγαλύτερη επιμέρους αντίσταση</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div class="comp-cell-stack">
                                                <span class="comp-pill cyan">📉 Μειώνεται ($R_{\\text{ολ}} < R_{\\text{min}}$)</span>
                                                <div class="comp-formula-box">$$\\dfrac{1}{R_{\\text{ολ}}} = \\dfrac{1}{R_1} + \\dfrac{1}{R_2} \\quad \\left(R_{\\text{ολ}} = \\dfrac{R_1 \\cdot R_2}{R_1 + R_2}\\right)$$</div>
                                                <span class="comp-note">Πάντοτε μικρότερη και από τη μικρότερη επιμέρους αντίσταση!</span>
                                            </div>
                                        </td>
                                    </tr>

                                    <!-- ROW 5: Ratio Identities -->
                                    <tr>
                                        <td class="col-prop">
                                            <div class="comp-prop-name">
                                                <span class="comp-prop-icon">📊</span>
                                                <span class="comp-prop-label">Αναλογίες Μεγεθών<br><small style="font-size:0.78em;opacity:0.75;">$\dfrac{R_1}{R_2},\;\dfrac{I_1}{I_2},\;\dfrac{V_1}{V_2},\;\dfrac{P_1}{P_2},\;\dfrac{E_1}{E_2}$</small></span>
                                            </div>
                                        </td>
                                        <td>
                                            <div class="comp-cell-stack">
                                                <span class="comp-pill purple">⚡ Κοινό I → αναλογία μέσω R</span>
                                                <div class="comp-formula-box">
                                                    $$\frac{V_1}{V_2} = \frac{R_1}{R_2}$$
                                                </div>
                                                <span class="comp-note">Τάση: μεγαλύτερος R παίρνει μεγαλύτερη V (Ohm: $V=IR$)</span>
                                                <div class="comp-formula-box" style="margin-top:6px;">
                                                    $$\frac{P_1}{P_2} = \frac{E_1}{E_2} = \frac{R_1}{R_2}$$
                                                </div>
                                                <span class="comp-note">Ισχύς &amp; θερμότητα: αναλογικές προς R (${P=I^2R}$)</span>
                                                <div class="comp-formula-box" style="margin-top:6px;">
                                                    $$\frac{I_1}{I_2} = 1 \quad (I_1 = I_2)$$
                                                </div>
                                                <span class="comp-note">Ρεύμα: κοινό σε όλους τους αντιστάτες — αναλογία = 1</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div class="comp-cell-stack">
                                                <span class="comp-pill cyan">🔀 Κοινό V → αναλογία μέσω R</span>
                                                <div class="comp-formula-box">
                                                    $$\frac{I_1}{I_2} = \frac{R_2}{R_1}$$
                                                </div>
                                                <span class="comp-note">Ρεύμα: μικρότερος R παίρνει μεγαλύτερο I (Ohm: $I=V/R$)</span>
                                                <div class="comp-formula-box" style="margin-top:6px;">
                                                    $$\frac{P_1}{P_2} = \frac{E_1}{E_2} = \frac{R_2}{R_1}$$
                                                </div>
                                                <span class="comp-note">Ισχύς &amp; θερμότητα: αντιστρόφως ανάλογες προς R ($P=V^2/R$)</span>
                                                <div class="comp-formula-box" style="margin-top:6px;">
                                                    $$\frac{V_1}{V_2} = 1 \quad (V_1 = V_2)$$
                                                </div>
                                                <span class="comp-note">Τάση: κοινή σε όλους τους κλάδους — αναλογία = 1</span>
                                            </div>
                                        </td>
                                    </tr>

                                    <!-- ROW 6: Disconnection -->
                                    <tr>
                                        <td class="col-prop">
                                            <div class="comp-prop-name">
                                                <span class="comp-prop-icon">💡</span>
                                                <span class="comp-prop-label">Διακοπή / Βλάβη ενός Στοιχείου</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div class="comp-cell-stack">
                                                <span class="comp-pill rose">💥 Ολική Διακοπή ($I = 0$)</span>
                                                <span class="comp-note">Ανοικτό κύκλωμα: σβήνουν όλες οι υπόλοιπες συσκευές ακαριαία</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div class="comp-cell-stack">
                                                <span class="comp-pill emerald">✅ Ανεξάρτητη Λειτουργία</span>
                                                <span class="comp-note">Οι υπόλοιποι κλάδοι συνεχίζουν να λειτουργούν απολύτως κανονικά</span>
                                            </div>
                                        </td>
                                    </tr>

                                    <!-- ROW 6: Short Circuit -->
                                    <tr>
                                        <td class="col-prop">
                                            <div class="comp-prop-name">
                                                <span class="comp-prop-icon">⚠️</span>
                                                <span class="comp-prop-label">Βραχυκύκλωμα ενός Αντιστάτη</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div class="comp-cell-stack">
                                                <span class="comp-pill amber">⚠️ Μερικό Βραχυκύκλωμα</span>
                                                <div class="comp-formula-box">$$V_{\\text{άλλο}} = V_{\\text{πηγ}} \\quad (V_{\\text{βραχ}} = 0)$$</div>
                                                <span class="comp-note">Ο επιζών αντιστάτης παραμένει ενεργός αλλά υπερφορτώνεται ($1600\\%$)</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div class="comp-cell-stack">
                                                <span class="comp-pill rose">💥 Ολικό Βραχυκύκλωμα</span>
                                                <div class="comp-formula-box">$$R_{\\text{ολ}} \\to 0 \\implies I_{\\text{ολ}} \\to \\infty$$</div>
                                                <span class="comp-note">Η πηγή βραχυκυκλώνεται αμέσως και καταρρέει όλο το δίκτυο ($V \\to 0$)</span>
                                            </div>
                                        </td>
                                    </tr>

                                    <!-- ROW 7: Total Power -->
                                    <tr>
                                        <td class="col-prop">
                                            <div class="comp-prop-name">
                                                <span class="comp-prop-icon">🔥</span>
                                                <span class="comp-prop-label">Ολική Ισχύς <span class="math-nowrap">($P_{\\text{ολ}}$)</span></span>
                                            </div>
                                        </td>
                                        <td>
                                            <div class="comp-cell-stack">
                                                <div class="comp-formula-box">$$P_{\\text{ολ}} = P_1 + P_2 = V_{\\text{πηγ}} \\cdot I$$</div>
                                                <div class="comp-subformula">
                                                    <span class="comp-subformula-label">Κατανάλωση:</span>
                                                    $$P_{\\text{ολ}} = I^2 \\cdot R_{\\text{ολ}}$$
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div class="comp-cell-stack">
                                                <div class="comp-formula-box">$$P_{\\text{ολ}} = P_1 + P_2 = V_{\\text{πηγ}} \\cdot I_{\\text{ολ}}$$</div>
                                                <div class="comp-subformula">
                                                    <span class="comp-subformula-label">Κατανάλωση:</span>
                                                    $$\\dfrac{V^2}{R_{\\text{ολ}}}$$
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- FINAL ACTION BUTTONS -->
                    <div style="text-align: center; margin-top: 32px; padding: 24px; background: rgba(255,255,255,0.02); border-radius: 18px; border: 1px solid var(--border);">
                        <h4 style="margin-bottom: 14px; color: var(--text-primary); font-size: 1.05rem; font-weight: 700;">Έτοιμοι να δοκιμάσετε τις γνώσεις σας;</h4>
                        <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
                            <button class="theory-btn theory-btn-primary" onclick="switchSubjectTab('quizzes')">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                                <span>Μετάβαση στα Διαδραστικά Κουίζ</span>
                            </button>
                            <button class="theory-btn theory-btn-secondary" onclick="switchSubjectTab('simulation')">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                                <span>Δοκιμή στο Εικονικό Εργαστήριο</span>
                            </button>
                            <a href="assets/docs/physics_g_exam_solutions_guide_2026.pdf" target="_blank" download class="theory-btn theory-btn-secondary">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                                <span>Λήψη Επίσημου PDF (70 Σελίδες)</span>
                            </a>
                        </div>
                    </div>
                </section>

            </div>
        `;

        if (window.renderMath) {
            window.renderMath(container);
        } else if (window.MathJax && window.MathJax.typesetPromise) {
            window.MathJax.typesetPromise([container]).catch(function(err) {
                console.warn('MathJax exam typesetting error:', err);
            });
        }
    }

    return {
        render: render,
        scrollToSection: scrollToSection,
        setFilter: setFilter,
        toggleSolution: toggleSolution,
        toggleAllSolutions: toggleAllSolutions,
        toggleDiagram: toggleDiagram,
        checkAnswer: checkAnswer,
        resetQuestion: resetQuestion
    };
})();
