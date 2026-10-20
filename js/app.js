/**
 * STEM Academy - Interactive Application Engine
 * Χειρισμός διαδρομών (Routing), κατάστασης (State), θεμάτων (Themes)
 * και πλήρης μηχανή διεξαγωγής κουίζ κατά το πρότυπο του Chemistry Quiz.
 */

// Application State
const AppState = {
    currentClass: null,      // 'Α', 'Β', 'Γ'
    currentSubject: null,    // 'physics', 'chemistry', 'geography', 'biology'
    currentSubjectTab: 'quizzes', // 'quizzes' | 'theory'
    currentQuiz: null,       // Quiz Object
    quizRunner: {
        activeQueue: [],
        skippedSet: new Set(),
        currentPos: 0,
        score: 0,
        answered: false,
        hintOpen: false,
        userHistory: [],      // Tracks { qIndex, selectedIdx, isCorrect }
        navHistory: [],       // History stack for Back navigation
        forwardStack: [],     // Forward stack for Next navigation when reviewing
        viewingReviewIndex: null // If non-null, index in qr.userHistory currently being reviewed
    },
    toastTimer: null
};

// Initialization on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    setupRouting();
    setupGlobalKeyboardShortcuts();
});

/* ==========================================================================
   Theme Management (Dark / Light)
   ========================================================================== */
function initTheme() {
    const savedTheme = localStorage.getItem('stem_academy_theme') || 'dark';
    setTheme(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('stem_academy_theme', theme);
    const icon = document.getElementById('theme-toggle-icon');
    if (icon) {
        icon.innerText = theme === 'dark' ? '🌙' : '☀️';
    }
}

/* ==========================================================================
   Routing & Application State
   ========================================================================== */

/* ==========================================================================
   Routing & Background Dynamic Layer
   ========================================================================== */
function setupRouting() {
    window.addEventListener('hashchange', handleRoute);
    handleRoute();
}

function navigateTo(hash) {
    window.location.hash = hash;
}

function handleRoute() {
    const hash = window.location.hash.replace(/^#\/?/, '');
    const parts = hash.split('/').filter(Boolean);

    // Default: Class Selection View
    if (parts.length === 0) {
        AppState.currentClass = null;
        AppState.currentSubject = null;
        AppState.currentQuiz = null;
        renderClassSelection();
        updateDynamicBg('assets/images/school_photo_bg.jpg', null);
        updateBreadcrumbs();
        return;
    }

    // e.g. #/class/Γ
    if (parts[0] === 'class' && parts[1]) {
        const classKey = decodeURIComponent(parts[1]);
        if (!CLASS_CONFIG[classKey]) {
            navigateTo('');
            return;
        }

        AppState.currentClass = classKey;

        // e.g. #/class/Γ/subject/chemistry
        if (parts[2] === 'subject' && parts[3]) {
            const subjectKey = parts[3];
            if (!SUBJECT_CONFIG[subjectKey]) {
                navigateTo(`class/${classKey}`);
                return;
            }

            AppState.currentSubject = subjectKey;

            // e.g. #/class/Γ/subject/chemistry/quiz/chem_g_1
            if (parts[4] === 'quiz' && parts[5]) {
                const quizId = parts[5];
                const subjectQuizzes = (QUIZ_DATABASE[classKey] && QUIZ_DATABASE[classKey][subjectKey]) || [];
                const targetQuiz = subjectQuizzes.find(q => q.id === quizId);

                if (targetQuiz) {
                    AppState.currentQuiz = targetQuiz;
                    renderQuizRunner(targetQuiz);
                    updateDynamicBg(SUBJECT_CONFIG[subjectKey].bgImage, subjectKey);
                    updateBreadcrumbs();
                    return;
                }
            }

            // e.g. #/class/Γ/subject/physics/simulation
            if (parts[4] === 'simulation') {
                AppState.currentQuiz = null;
                AppState.currentSubjectTab = 'simulation';
                renderQuizSelection(classKey, subjectKey);
                updateDynamicBg(SUBJECT_CONFIG[subjectKey].bgImage, subjectKey);
                updateBreadcrumbs();
                return;
            }

            // Subject Selected: Show Quizzes List
            AppState.currentQuiz = null;
            AppState.currentSubjectTab = 'quizzes';
            renderQuizSelection(classKey, subjectKey);
            updateDynamicBg(SUBJECT_CONFIG[subjectKey].bgImage, subjectKey);
            updateBreadcrumbs();
            return;
        }

        // Class Selected: Show Subjects List
        AppState.currentSubject = null;
        AppState.currentQuiz = null;
        renderSubjectSelection(classKey);
        updateDynamicBg('assets/images/hero_bg.jpg', null);
        updateBreadcrumbs();
        return;
    }

    // Fallback
    navigateTo('');
}

function updateDynamicBg(imagePath, subjectKey) {
    const bgLayer = document.getElementById('dynamic-bg');
    if (bgLayer) {
        bgLayer.style.backgroundImage = `url('${imagePath}')`;
    }
    if (subjectKey) {
        document.body.setAttribute('data-subject', subjectKey);
    } else {
        document.body.removeAttribute('data-subject');
    }
}

function updateBreadcrumbs() {
    const breadcrumbs = document.getElementById('nav-breadcrumbs');
    if (!breadcrumbs) return;

    let html = `<a class="crumb-item crumb-home" onclick="navigateTo('')" title="Αρχική Σελίδα"><span class="crumb-icon">🏛️</span><span class="crumb-text">Αρχική</span></a>`;

    if (AppState.currentClass) {
        const cls = CLASS_CONFIG[AppState.currentClass];
        const classLabel = cls ? cls.name : `Τάξη ${AppState.currentClass}`;
        html += `<span class="crumb-sep">/</span>`;
        if (!AppState.currentSubject) {
            html += `<span class="crumb-active">${classLabel}</span>`;
        } else {
            html += `<a class="crumb-item" onclick="navigateTo('class/${AppState.currentClass}')">${classLabel}</a>`;
        }
    }

    if (AppState.currentSubject) {
        const subConf = SUBJECT_CONFIG[AppState.currentSubject];
        html += `<span class="crumb-sep">/</span>`;
        if (!AppState.currentQuiz) {
            if (AppState.currentSubjectTab === 'simulation') {
                html += `<a class="crumb-item" onclick="switchSubjectTab('quizzes')">${subConf.emoji} ${subConf.name}</a>`;
                html += `<span class="crumb-sep">/</span>`;
                html += `<span class="crumb-active">⚡ Προσομοίωση Κυκλωμάτων</span>`;
            } else {
                // Non-quiz page: display emoji as an icon!
                html += `<span class="crumb-active">${subConf.emoji} ${subConf.name}</span>`;
            }
        } else {
            html += `<a class="crumb-item" onclick="navigateTo('class/${AppState.currentClass}/subject/${AppState.currentSubject}')">${subConf.emoji} ${subConf.name}</a>`;
            html += `<span class="crumb-sep">/</span>`;
            // In quiz view, display clean title (NO emoji as icon)
            html += `<span class="crumb-active">${AppState.currentQuiz.title.split(':')[0]}</span>`;
        }
    }

    breadcrumbs.innerHTML = html;
}

/* ==========================================================================
   VIEW 1: Class Selection (Index Screen)
   ========================================================================== */
function renderClassSelection() {
    const container = document.getElementById('app-content');
    
    let html = `
        <div class="view-header">
            <div class="view-badge-chip">
                <span>⚡</span>
                <span>Γυμνάσιο Νέας Ερυθραίας - Φυσικές Επιστήμες</span>
            </div>
            <h1 class="view-title">Επιλέξτε Τάξη</h1>
            <p class="view-subtitle">
                Προσαρμοσμένα διαδραστικά τεστ Φυσικής, Χημείας, Βιολογίας και Γεωγραφίας 
                για όλες τις τάξεις με άμεση ανατροφοδότηση και αναλυτικές επεξηγήσεις.
            </p>
        </div>

        <div class="classes-grid">
    `;

    Object.keys(CLASS_CONFIG).forEach(classKey => {
        const cls = CLASS_CONFIG[classKey];
        const quizzesCount = countQuizzesForClass(classKey);

        html += `
            <div class="glass-card class-card" onclick="navigateTo('class/${classKey}')">
                <div class="card-ambient-glow" style="background: var(--primary);"></div>
                <div class="card-content-wrap">
                    <div class="card-top-meta" style="justify-content: flex-end;">
                        <span class="card-badge">4 Μαθήματα</span>
                    </div>
                    <div class="card-icon-box">
                        <span class="class-emoji-icon">${cls.icon}</span>
                    </div>
                    <h2 class="card-title">${cls.name}</h2>
                </div>
            </div>
        `;
    });

    html += `</div>`;
    container.innerHTML = html;
}

function countQuizzesForClass(classKey) {
    const classData = QUIZ_DATABASE[classKey];
    if (!classData) return 'Υπό Προετοιμασία';
    let active = 0;
    let questions = 0;
    Object.keys(classData).forEach(sub => {
        classData[sub].forEach(q => {
            if (!q.isPlaceholder) {
                active++;
                questions += (q.questions ? q.questions.length : 0);
            }
        });
    });
    if (active === 0) return 'Υπό Προετοιμασία';
    return `${active} Ενεργά Κουίζ (${questions} Ερωτήσεις)`;
}

/* ==========================================================================
   VIEW 2: Subject Selection for Chosen Class (Non-quiz subpage: EMOJIS DISPLAYED!)
   ========================================================================== */
function renderSubjectSelection(classKey) {
    const container = document.getElementById('app-content');
    const cls = CLASS_CONFIG[classKey];

    let html = `
        <button class="back-btn" onclick="navigateTo('')">
            <span>⬅</span>
            <span>Επιστροφή στις Τάξεις</span>
        </button>

        <div class="view-header">
            <h1 class="view-title">Επιλογή Μαθήματος</h1>
            <p class="view-subtitle">
                Επιλέξτε ένα από τα 4 διδακτικά πεδία Φυσικών Επιστημών για να περιηγηθείτε στα διαθέσιμα κουίζ.
            </p>
        </div>

        <div class="subjects-grid">
    `;

    ['physics', 'chemistry', 'geography', 'biology'].forEach(subKey => {
        const sub = SUBJECT_CONFIG[subKey];
        const quizzes = (QUIZ_DATABASE[classKey] && QUIZ_DATABASE[classKey][subKey]) || [];
        const activeQuizzes = quizzes.filter(q => !q.isPlaceholder);
        const badgeText = activeQuizzes.length > 0 ? `${activeQuizzes.length} Ενεργό Κουίζ` : 'Υπό Προετοιμασία';

        html += `
            <div class="glass-card theme-${sub.theme}" onclick="navigateTo('class/${classKey}/subject/${subKey}')">
                <div class="card-ambient-glow"></div>
                <div class="card-content-wrap">
                    <div class="card-top-meta">
                        <span class="card-badge">${badgeText}</span>
                    </div>
                    <!-- EMOJI AS AN ICON (Strictly for non-quiz subpages) -->
                    <div class="card-icon-box">
                        <span>${sub.emoji}</span>
                    </div>
                    <h2 class="card-title">${sub.name}</h2>
                    <p class="card-desc">${sub.description}</p>
                </div>
            </div>
        `;
    });

    html += `</div>`;
    container.innerHTML = html;
}

/* ==========================================================================
   VIEW 3: Quiz Selection for Subject & Class (Non-quiz subpage: EMOJIS DISPLAYED!)
   ========================================================================== */
function renderQuizSelection(classKey, subjectKey) {
    const container = document.getElementById('app-content');
    const cls = CLASS_CONFIG[classKey];
    const sub = SUBJECT_CONFIG[subjectKey];
    const quizzes = (QUIZ_DATABASE[classKey] && QUIZ_DATABASE[classKey][subjectKey]) || [];
    const activeQuizzes = quizzes.filter(q => !q.isPlaceholder);
    const currentTab = AppState.currentSubjectTab || 'quizzes';

    let html = `
        <button class="back-btn" onclick="navigateTo('class/${classKey}')">
            <span>⬅</span>
            <span>Επιστροφή στα Μαθήματα</span>
        </button>

        <div class="view-header">
            <div class="view-badge-chip">
                <!-- EMOJI AS AN ICON (Strictly for non-quiz subpages) -->
                <span>${sub.emoji}</span>
                <span>${sub.name} - ${cls.name}</span>
            </div>
            <h1 class="view-title">${sub.name} (${cls.name})</h1>
            <p class="view-subtitle">
                Επιλέξτε ένα διαδραστικό κουίζ αυτοαξιολόγησης ή μελετήστε τη βασική θεωρία του μαθήματος.
            </p>

            <!-- Navigation Tabs: Quizzes vs Theory vs Simulation -->
            <div class="subject-tabs-container">
                <button class="subject-tab-btn ${currentTab === 'quizzes' ? 'active' : ''}" id="tab-btn-quizzes" onclick="switchSubjectTab('quizzes')">
                    <span class="tab-icon">📝</span>
                    <span>Κουίζ Αξιολόγησης</span>
                    <span class="tab-badge">${activeQuizzes.length > 0 ? `${activeQuizzes.length} Ενεργό` : 'Υπό προετοιμασία'}</span>
                </button>
                <button class="subject-tab-btn ${currentTab === 'theory' ? 'active' : ''}" id="tab-btn-theory" onclick="switchSubjectTab('theory')">
                    <span class="tab-icon">📖</span>
                    <span>Θεωρία Μαθήματος</span>
                    <span class="tab-badge" style="background: rgba(245, 158, 11, 0.15); color: #f59e0b; border-color: rgba(245, 158, 11, 0.4);">Σύντομα</span>
                </button>
                ${subjectKey === 'physics' ? `
                <button class="subject-tab-btn ${currentTab === 'simulation' ? 'active' : ''}" id="tab-btn-simulation" onclick="switchSubjectTab('simulation')">
                    <span class="tab-icon">⚡</span>
                    <span>Προσομοίωση</span>
                    <span class="tab-badge" style="background: rgba(16, 185, 129, 0.2); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.4);">ΝΕΟ</span>
                </button>
                ` : ''}
            </div>
        </div>

        <!-- TAB 1: QUIZZES PANEL -->
        <div class="tab-panel" id="tab-panel-quizzes" style="display: ${currentTab === 'quizzes' ? 'block' : 'none'};">
            <div class="quizzes-grid">
    `;

    quizzes.forEach((quiz, index) => {
        if (quiz.isPlaceholder) {
            html += `
                <div class="glass-card theme-${sub.theme}" style="opacity: 0.88; cursor: pointer;" onclick="showToast('📋 Το κουίζ προετοιμάζεται αποκλειστικά βάσει των επίσημων φυλλαδίων PDF.')">
                    <div class="card-ambient-glow"></div>
                    <div class="card-content-wrap">
                        <div class="card-top-meta">
                            <span class="card-badge" style="background: rgba(245, 158, 11, 0.15); color: #f59e0b; border-color: rgba(245, 158, 11, 0.4);">${quiz.badge}</span>
                            <span class="card-badge">${quiz.level}</span>
                        </div>
                        <h3 class="card-title" style="font-size: 1.25rem; margin-top: 10px;">${quiz.title}</h3>
                        <p class="card-desc">${quiz.subtitle}</p>
                        
                        <div class="card-footer">
                            <span style="font-size: 0.82rem; color: var(--text-muted); font-weight: 600;">
                                Υπό επεξεργασία PDF
                            </span>
                            <span class="card-btn-label" style="color: var(--text-muted);">
                                Σύντομα διαθέσιμο ⏳
                            </span>
                        </div>
                    </div>
                </div>
            `;
            return;
        }

        const savedScoreKey = `stem_quiz_score_${quiz.id}`;
        const savedScore = localStorage.getItem(savedScoreKey);

        html += `
            <div class="glass-card theme-${sub.theme}" onclick="navigateTo('class/${classKey}/subject/${subjectKey}/quiz/${quiz.id}')">
                <div class="card-ambient-glow"></div>
                <div class="card-content-wrap">
                    <div class="card-top-meta">
                        <span class="card-badge">${quiz.badge}</span>
                        <span class="card-badge">${quiz.level}</span>
                    </div>
                    <h3 class="card-title" style="font-size: 1.25rem; margin-top: 10px;">${quiz.title}</h3>
                    <p class="card-desc">${quiz.subtitle}</p>
                    
                    <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px;">
                        <span class="card-badge">⏱️ ${quiz.time}</span>
                        ${savedScore !== null ? `
                            <span class="card-badge" style="background: var(--success-bg); color: var(--success-text); border-color: var(--success-border);">
                                🏆 Καλύτερο: ${savedScore}/${quiz.questions.length}
                            </span>
                        ` : ''}
                    </div>

                    <div class="card-footer">
                        <span style="font-size: 0.82rem; color: var(--text-muted); font-weight: 600;">
                            ${quiz.questions.length} Ερωτήσεις
                        </span>
                        <span class="card-btn-label">
                            Έναρξη Κουίζ <span>➔</span>
                        </span>
                    </div>
                </div>
            </div>
        `;
    });

    html += `
            </div>
        </div>

        <!-- TAB 2: THEORY PANEL (Empty placeholder ready for future content) -->
        <div class="tab-panel" id="tab-panel-theory" style="display: ${currentTab === 'theory' ? 'block' : 'none'};">
            <div class="glass-card theory-placeholder-card">
                <div class="theory-placeholder-icon">📖</div>
                <h2 class="theory-placeholder-title">Θεωρία & Σημειώσεις: ${sub.name} (${cls.name})</h2>
                <p class="theory-placeholder-desc">
                    Η βασική θεωρία, οι ορισμοί, οι μαθηματικοί τύποι και τα συνοπτικά διαγράμματα για το μάθημα της 
                    <strong>${sub.name} (${cls.name})</strong> προετοιμάζονται βάσει των επίσημων φυλλαδίων PDF και θα αναρτηθούν σύντομα εδώ.
                </p>

                <div class="theory-features-grid">
                    <div class="theory-feature-pill">
                        <span class="pill-icon">📌</span>
                        <div>
                            <strong>Βασικές Έννοιες & Ορισμοί</strong>
                            <p>Συνοπτική παρουσίαση των θεμελιωδών νόμων και ορολογίας</p>
                        </div>
                    </div>
                    <div class="theory-feature-pill">
                        <span class="pill-icon">📐</span>
                        <div>
                            <strong>Μαθηματικοί Τύποι & Μονάδες SI</strong>
                            <p>Τυπολόγιο με εφαρμογές και μετατροπές μονάδων μέτρησης</p>
                        </div>
                    </div>
                    <div class="theory-feature-pill">
                        <span class="pill-icon">⚡</span>
                        <div>
                            <strong>Σχηματικά Διαγράμματα</strong>
                            <p>Επεξηγηματικά κυκλώματα, χημικές εξισώσεις και γραφήματα</p>
                        </div>
                    </div>
                    <div class="theory-feature-pill">
                        <span class="pill-icon">📥</span>
                        <div>
                            <strong>Υποστηρικτικό Υλικό PDF</strong>
                            <p>Επίσημα σχολικά βοηθήματα και φύλλα αυτοαξιολόγησης</p>
                        </div>
                    </div>
                </div>

                <div class="theory-action-wrap">
                    <button class="hint-btn" onclick="switchSubjectTab('quizzes')" style="background: var(--primary); color: white; border: none; padding: 11px 24px; font-size: 0.94rem;">
                        <span>📝</span>
                        <span>Μετάβαση στα Κουίζ του Μαθήματος</span>
                    </button>
                </div>
            </div>
        </div>

        ${subjectKey === 'physics' ? `
        <!-- TAB 3: SIMULATION PANEL -->
        <div class="tab-panel" id="tab-panel-simulation" style="display: ${currentTab === 'simulation' ? 'block' : 'none'};">
            <div id="simulation-mount"></div>
        </div>
        ` : ''}
    `;

    container.innerHTML = html;

    if (currentTab === 'simulation' && subjectKey === 'physics') {
        const mount = document.getElementById('simulation-mount');
        if (mount && window.CircuitSimulation) {
            window.CircuitSimulation.render(mount);
        }
    }
}

function switchSubjectTab(tabKey) {
    AppState.currentSubjectTab = tabKey;
    
    const quizzesBtn = document.getElementById('tab-btn-quizzes');
    const theoryBtn = document.getElementById('tab-btn-theory');
    const simBtn = document.getElementById('tab-btn-simulation');
    const quizzesPanel = document.getElementById('tab-panel-quizzes');
    const theoryPanel = document.getElementById('tab-panel-theory');
    const simPanel = document.getElementById('tab-panel-simulation');

    if (quizzesBtn) quizzesBtn.classList.toggle('active', tabKey === 'quizzes');
    if (theoryBtn) theoryBtn.classList.toggle('active', tabKey === 'theory');
    if (simBtn) simBtn.classList.toggle('active', tabKey === 'simulation');

    if (quizzesPanel) quizzesPanel.style.display = tabKey === 'quizzes' ? 'block' : 'none';
    if (theoryPanel) theoryPanel.style.display = tabKey === 'theory' ? 'block' : 'none';
    if (simPanel) {
        simPanel.style.display = tabKey === 'simulation' ? 'block' : 'none';
        if (tabKey === 'simulation') {
            simPanel.style.animation = 'fadeIn 0.3s ease';
            const mount = document.getElementById('simulation-mount');
            if (mount && window.CircuitSimulation) {
                window.CircuitSimulation.render(mount);
            }
        }
    }

    if (tabKey === 'quizzes' && quizzesPanel) quizzesPanel.style.animation = 'fadeIn 0.3s ease';
    if (tabKey === 'theory' && theoryPanel) theoryPanel.style.animation = 'fadeIn 0.3s ease';

    updateBreadcrumbs();
}

/* ==========================================================================
   Mathematical & Physical Formulas Typography Engine (LaTeX-Flavored)
   Handles TeX/LaTeX ($...$, $$...$$, \frac, \Omega, etc.) and
   Greek physics notations (Vπηγ, R1, Rολ, VAB = VA - VB, numbers & units)
   with authentic LaTeX math italics and typography.
   ========================================================================== */
function formatMathText(text) {
    if (!text || typeof text !== 'string') return text || '';

    // 1. Parse LaTeX math snippets ($$...$$ and $...$)
    function parseLatexSnippet(inner) {
        let s = inner.trim();
        // Greek words in \mathrm{} or \text{}
        s = s.replace(/\\(?:mathrm|text)\s*\{\s*(?:\\pi\\eta\\gamma|πηγ)\s*\}/g, 'πηγ');
        s = s.replace(/\\(?:mathrm|text)\s*\{\s*(?:o\\lambda|ολ)\s*\}/g, 'ολ');
        s = s.replace(/\\(?:mathrm|text)\s*\{\s*(?:\\sigma\\epsilon\\iota\\rho|σειρ)\s*\}/g, 'σειρ');
        s = s.replace(/\\(?:mathrm|text)\s*\{\s*(?:\\pi\\alpha\\rho|παρ)\s*\}/g, 'παρ');
        s = s.replace(/\\(?:mathrm|text)\s*\{\s*(?:\\delta\\iota\\alpha\\kappa|διακ)\s*\}/g, 'διακ');
        s = s.replace(/\\(?:mathrm|text)\s*\{\s*([ΩVAWJs\s]+)\s*\}/g, ' <span class="math-unit">$1</span>');
        s = s.replace(/\\(?:mathrm|text)\s*\{\s*([^}]+)\s*\}/g, '<span class="math-unit">$1</span>');

        // Common TeX symbols & operators
        s = s.replace(/\\Omega\b/g, '<span class="math-sym">Ω</span>');
        s = s.replace(/\\cdot\b/g, '<span class="math-op math-bin">·</span>');
        s = s.replace(/\\(?:to|rightarrow)\b/g, '<span class="math-op math-rel">→</span>');
        s = s.replace(/\\implies\b/g, '<span class="math-op math-rel">⇒</span>');
        s = s.replace(/\\infty\b/g, '<span class="math-sym">∞</span>');
        s = s.replace(/\\Delta\b/g, '<span class="math-sym">Δ</span>');
        s = s.replace(/\\approx\b/g, '<span class="math-op math-rel">≈</span>');
        s = s.replace(/\\(?:le|leq)\b/g, '<span class="math-op math-rel">≤</span>');
        s = s.replace(/\\(?:ge|geq)\b/g, '<span class="math-op math-rel">≥</span>');
        s = s.replace(/\\neq\b/g, '<span class="math-op math-rel">≠</span>');
        s = s.replace(/\\times\b/g, '<span class="math-op math-bin">×</span>');
        s = s.replace(/\\\s+/g, ' ');

        // Nested / simple fractions (support nested braces in numerator / denominator)
        for (let k = 0; k < 3; k++) {
            s = s.replace(/\\frac\{((?:[^{}]+|\{[^{}]*\})*)\}\{((?:[^{}]+|\{[^{}]*\})*)\}/g, '<span class="math-frac"><span class="math-num">$1</span><span class="math-den">$2</span></span>');
        }

        // Subscripts: X_{sub} or X_sub
        s = s.replace(/([A-Za-zΑ-Ωα-ω\']+)_\{([^}]+)\}/g, '<i class="math-var">$1</i><sub class="math-sub">$2</sub>');
        s = s.replace(/([A-Za-zΑ-Ωα-ω\']+)_([0-9a-zA-Zα-ωΑ-Ω]+)/g, '<i class="math-var">$1</i><sub class="math-sub">$2</sub>');

        // Superscripts
        s = s.replace(/([0-9A-Za-zΑ-Ωα-ωΩ\)]+)\^\{([^}]+)\}/g, '$1<sup class="math-sup">$2</sup>');
        s = s.replace(/([0-9A-Za-zΑ-Ωα-ωΩ\)]+)\^([0-9a-zA-Z\+\-]+)/g, '$1<sup class="math-sup">$2</sup>');

        // Operators: = , + , - (when not inside HTML tags)
        s = s.replace(/(?<![<a-zA-Z/])=(?![=>])/g, ' <span class="math-op math-rel">=</span> ');
        s = s.replace(/(?<![<a-zA-Z/])\+(?![+>])/g, ' <span class="math-op math-bin">+</span> ');
        s = s.replace(/(?<![<a-zA-Z/])-(?![->])/g, ' <span class="math-op math-bin">−</span> ');

        // Numbers in LaTeX math mode (ensuring not inside HTML tag/attribute)
        s = s.replace(/(?<![0-9A-Za-zΑ-Ωα-ω])(\d+(?:[.,]\d+)?)(?![0-9A-Za-zΑ-Ωα-ω_])(?![^<]*>)/g, '<span class="math-num-val">$1</span>');

        // Italicize single Latin variables inside LaTeX expression (V, I, P, R, K, A, B, C, D, etc.)
        s = s.replace(/(?<![0-9A-Za-zΑ-Ωα-ω<>="\'/])\b([A-Za-z])\b(?![0-9A-Za-zΑ-Ωα-ω<>="\'/])/g, '<i class="math-var">$1</i>');

        // Normalize multiple spaces
        s = s.replace(/\s{2,}/g, ' ');

        return `<span class="math-expr">${s.trim()}</span>`;
    }

    let res = text;
    // LaTeX display math $$...$$
    res = res.replace(/\$\$(.*?)\$\$/gs, (m, p1) => `<span class="math-display">${parseLatexSnippet(p1)}</span>`);
    // LaTeX inline math $...$
    res = res.replace(/\$([^\$\n]+?)\$/g, (m, p1) => parseLatexSnippet(p1));

    // 2. Physics & Electrical Formulas in plain Greek/Latin text
    // Greek subscripts: Vπηγ, Vδιακ, Rολ, Iολ, Iπηγ, Pολ, Rσειρ, Rπαρ
    res = res.replace(/\b(V|I|P|R)(πηγ|διακ|ολ|σειρ|παρ)\b/g, '<span class="math-expr"><i class="math-var">$1</i><sub class="math-sub">$2</sub></span>');
    res = res.replace(/\b(R')\s*(ολ)\b/g, '<span class="math-expr"><i class="math-var">$1</i><sub class="math-sub">$2</sub></span>');

    // Dual letter node voltages: VAB, VBC, VCD, VAD
    res = res.replace(/\b(V)(AB|BC|CD|AD)\b/g, '<span class="math-expr"><i class="math-var">$1</i><sub class="math-sub">$2</sub></span>');

    // Single letter node voltages & meter resistances: VA, VB, VC, VD, RA, RV
    res = res.replace(/\b(V)(A|B|C|D)\b/g, '<span class="math-expr"><i class="math-var">$1</i><sub class="math-sub">$2</sub></span>');
    res = res.replace(/\b(R)(A|V)\b/g, '<span class="math-expr"><i class="math-var">$1</i><sub class="math-sub">$2</sub></span>');

    // Numbered variables: R1, R2, R3, R4, V1, V2, I1, I2, P1, P2
    res = res.replace(/\b(R|V|I|P)([1-4])\b/g, '<span class="math-expr"><i class="math-var">$1</i><sub class="math-sub">$2</sub></span>');

    // Prime currents: I'
    res = res.replace(/\b(I')\b/g, '<span class="math-expr"><i class="math-var">$1</i></span>');

    // Delta differences: ΔI, ΔV
    res = res.replace(/\b(Δ)(I|V)\b/g, '<span class="math-expr"><span class="math-sym">$1</span><i class="math-var">$2</i></span>');

    // Circuit Nodes in context: "κόμβων A και B", "σημεία C και D"
    res = res.replace(/(κόμβων|κόμβους|κόμβου|κόμβο|σημείων|σημείου|σημεία)\s+([ABCD])\b/g, '$1 <span class="math-expr"><i class="math-var">$2</i></span>');
    res = res.replace(/(και|έως|προς|μεταξύ)\s+([ABCD])\b(?=\s*[.,;]|\s+και|\s+είναι|\s+μεταξύ)/g, '$1 <span class="math-expr"><i class="math-var">$2</i></span>');

    // Switch K: "διακόπτης K", "διακόπτη K"
    res = res.replace(/\b(διακόπτης|διακόπτη|διακόπτη\s+)(K)\b/g, '$1<span class="math-expr"><i class="math-var">$2</i></span>');

    // Numbers with physical units: 20 V, 4 Ω, 2 A, 40 W, 120 J, 10 s
    res = res.replace(/(\d+(?:[.,]\d+)?)\s*(Ω|V|A|W|J|s)\b/g, (m, val, unit) => {
        const unitHtml = unit === 'Ω' ? '<span class="math-sym">Ω</span>' : `<span class="math-unit">${unit}</span>`;
        return `<span class="math-expr"><span class="math-num-val">${val}</span> ${unitHtml}</span>`;
    });

    // Standalone Ohm symbol Ω
    res = res.replace(/(?<![0-9A-Za-zΑ-Ωα-ω<>="\'/])Ω(?![0-9A-Za-zΑ-Ωα-ω<>="\'/])/g, '<span class="math-expr"><span class="math-sym">Ω</span></span>');

    // Arrow and logic operators
    res = res.replace(/\s*->\s*/g, ' <span class="math-op">→</span> ');
    res = res.replace(/\s*=>\s*/g, ' <span class="math-op">⇒</span> ');

    // Powers like I² or R²
    res = res.replace(/\b([VIPR])²\b/g, '<span class="math-expr"><i class="math-var">$1</i><sup class="math-sup">2</sup></span>');
    res = res.replace(/\b([VIPR])³\b/g, '<span class="math-expr"><i class="math-var">$1</i><sup class="math-sup">3</sup></span>');
    res = res.replace(/([0-9A-Za-zΑ-Ωα-ω])²/g, '$1<sup class="math-sup">2</sup>');
    res = res.replace(/([0-9A-Za-zΑ-Ωα-ω])³/g, '$1<sup class="math-sup">3</sup>');

    // Middle dot multiplication ·
    res = res.replace(/\s*·\s*/g, ' <span class="math-op">·</span> ');

    // Standalone math variables VIPRKtqWE directly adjacent to operators (=, ·, +, -, −, /, *, <, >, ⇒, →)
    res = res.replace(/(?<![0-9A-Za-zΑ-Ωα-ω<>="\'/])\b([VIPRKtqWE])\b(?=\s*[=·\+\-−\/\*<>⇒→]|\s+[=·\+\-−\/\*<>⇒→])/g, '<span class="math-expr"><i class="math-var">$1</i></span>');
    res = res.replace(/([=·\+\-−\/\*<>⇒→]\s*)(?<![0-9A-Za-zΑ-Ωα-ω<>="\'/])\b([VIPRKtqWE])\b(?![0-9A-Za-zΑ-Ωα-ω<>="\'/])/g, '$1<span class="math-expr"><i class="math-var">$2</i></span>');

    // Chemistry ions and formulas
    res = res.replace(/\b(H)\+/g, '<span class="math-expr"><i class="math-var">$1</i><sup class="math-sup">+</sup></span>');
    res = res.replace(/\b(OH)\-/g, '<span class="math-expr"><span class="math-sym">$1</span><sup class="math-sup">−</sup></span>');
    res = res.replace(/\b(H)2(O)\b/g, '<span class="math-expr"><span class="math-sym">$1</span><sub class="math-sub">2</sub><span class="math-sym">$2</span></span>');
    res = res.replace(/\b(H)3(O)\+/g, '<span class="math-expr"><span class="math-sym">$1</span><sub class="math-sub">3</sub><span class="math-sym">$2</span><sup class="math-sup">+</sup></span>');

    return res;
}

/**
 * Asynchronously triggers MathJax typesetting on a specific DOM element or document
 */
function triggerMathTypeset(container) {
    if (window.MathJax && window.MathJax.typesetPromise) {
        try {
            const target = container ? (Array.isArray(container) ? container : [container]) : [];
            window.MathJax.typesetPromise(target.length ? target : undefined).catch((err) => {
                console.debug('MathJax typeset notice:', err);
            });
        } catch (e) {
            console.debug('MathJax invocation notice:', e);
        }
    }
}

/* ==========================================================================
   VIEW 4: QUIZ RUNNER (Exact Chemistry Quiz.html Template)
   CRITICAL: NO EMOJI AS ICON ON QUIZ SUBPAGE! Clean Academic Header
   ========================================================================== */
function renderQuizRunner(quiz) {
    const container = document.getElementById('app-content');
    const sub = SUBJECT_CONFIG[AppState.currentSubject];
    const cls = CLASS_CONFIG[AppState.currentClass];

    if (quiz.isPlaceholder || !quiz.questions || quiz.questions.length === 0) {
        container.innerHTML = `
            <div class="quiz-runner-wrap">
                <div class="quiz-container" style="text-align: center; padding: 40px 24px;">
                    <div style="font-size: 3rem; margin-bottom: 16px;">📋</div>
                    <h2 style="font-size: 1.8rem; margin-bottom: 12px; color: var(--primary);">Κουίζ Υπό Προετοιμασία</h2>
                    <p style="color: var(--text-secondary); max-width: 540px; margin: 0 auto 28px auto; line-height: 1.6;">
                        Το εκπαιδευτικό υλικό και οι ερωτήσεις για το συγκεκριμένο μάθημα προετοιμάζονται 
                        αποκλειστικά βάσει των επίσημων σημειώσεων και φυλλαδίων PDF του Γυμνασίου Νέας Ερυθραίας.
                    </p>
                    <div style="display: flex; justify-content: center; gap: 12px; flex-wrap: wrap;">
                        <button class="restart-btn" onclick="navigateTo('class/Γ/subject/physics/quiz/phys_g_1')">
                            <span>⚡</span>
                            <span>Κουίζ Φυσικής Γ΄ (30 Ερωτήσεις)</span>
                        </button>
                        <button class="restart-btn" style="background: var(--theme-chemistry);" onclick="navigateTo('class/Γ/subject/chemistry/quiz/chem_g_1')">
                            <span>⚗️</span>
                            <span>Κουίζ Χημείας Γ΄ (30 Ερωτήσεις)</span>
                        </button>
                        <button class="return-quizzes-btn" onclick="navigateTo('class/${AppState.currentClass}/subject/${AppState.currentSubject}')">
                            <span>⬅</span>
                            <span>Επιστροφή στα Μαθήματα</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
        return;
    }

    // Initialize Quiz Runner State
    const qr = AppState.quizRunner;
    qr.activeQueue = Array.from({ length: quiz.questions.length }, (_, i) => i);
    qr.skippedSet.clear();
    qr.currentPos = 0;
    qr.score = 0;
    qr.answered = false;
    qr.hintOpen = false;
    qr.userHistory = [];
    qr.navHistory = [];
    qr.forwardStack = [];
    qr.viewingReviewIndex = null;

    // Quiz container matches Chemistry Quiz.html template
    // Notice: NO emoji as subject icon here!
    let html = `
        <div class="quiz-runner-wrap">
            <div class="quiz-container">
                <!-- Quiz Screen -->
                <div id="quiz-screen">
                    <div class="quiz-header">
                        <div class="quiz-header-top">
                            <div class="quiz-header-title">
                                <span class="quiz-subject-tag">${sub.name} (${cls.name})</span>
                                <span>${quiz.title.split(':')[0]}</span>
                            </div>
                            <div class="quiz-top-actions">
                                <button class="quiz-exit-btn" onclick="confirmExitQuiz()">
                                    Έξοδος
                                </button>
                                <button class="theme-toggle-btn" onclick="toggleTheme()" title="Εναλλαγή Θέματος (Dark/Light)">
                                    <span id="theme-toggle-quiz-icon">🌙</span>
                                </button>
                            </div>
                        </div>

                        <div class="progress-bar-container">
                            <div class="progress-bar" id="progress-bar"></div>
                        </div>

                        <div class="question-meta">
                            <div class="meta-badges">
                                <span class="meta-badge" id="question-count">Ερώτηση 1 / ${quiz.questions.length}</span>
                                <span class="meta-badge badge-skipped" id="skipped-badge" style="display: none;">
                                    🔄 Από παράλειψη
                                </span>
                                <span class="meta-badge" id="pending-badge" style="display: none;">
                                    📌 Σε εκκρεμότητα: <span id="pending-count">0</span>
                                </span>
                            </div>
                            <span class="meta-badge badge-score" id="score-counter">Σκορ: 0</span>
                        </div>
                    </div>

                    <div class="question-text" id="question-text">Φόρτωση ερώτησης...</div>

                    <!-- Question Circuit Diagrams Container -->
                    <div class="question-diagrams-container" id="question-diagrams-container" style="display: none;"></div>

                    <div class="options-list" id="options-container"></div>

                    <!-- Hint Box -->
                    <div class="hint-box" id="hint-box">
                        <div class="hint-header">
                            <span>💡</span>
                            <span>Υπόδειξη (Hint):</span>
                        </div>
                        <div id="hint-content"></div>
                    </div>

                    <!-- Feedback Box -->
                    <div class="feedback-box" id="feedback-box"></div>

                    <!-- Action Buttons -->
                    <div class="actions-bar">
                        <button class="hint-btn" id="hint-btn" onclick="toggleHint()" title="Εμφάνιση ή απόκρυψη υπόδειξης (Πλήκτρο H)">
                            <span>💡</span>
                            <span id="hint-btn-text">Υπόδειξη</span>
                            <span id="hint-chevron">▾</span>
                        </button>

                        <div class="quiz-nav-group">
                            <button class="prev-btn" id="prev-btn" onclick="handlePrevQuestion()" title="Προηγούμενη ερώτηση (⬅ ή P)" disabled>
                                <span>⬅</span>
                                <span id="prev-btn-text">Προηγούμενο</span>
                            </button>

                            <button class="next-btn" id="next-btn" onclick="handleNextOrSkip()" title="Παράλειψη / Επόμενο (Enter ή ➔)">
                                <span id="next-btn-text">Επόμενο</span>
                                <span>➔</span>
                            </button>
                        </div>
                    </div>

                    <div class="shortcuts-hint">
                        Συντομεύσεις: <kbd>1</kbd>-<kbd>5</kbd> Επιλογή | <kbd>⬅</kbd> / <kbd>➔</kbd> Πλοήγηση | <kbd>H</kbd> Υπόδειξη | <kbd>Enter</kbd> Επόμενο
                    </div>
                </div>

                <!-- Results Screen -->
                <div class="results-container" id="results-screen">
                    <h2>Ολοκλήρωση Κουίζ! 🎉</h2>
                    <div class="score-circle">
                        <span class="score-number" id="final-score">0</span>
                        <span class="score-total">/ ${quiz.questions.length}</span>
                    </div>
                    <div class="final-pct" id="final-pct">0%</div>
                    <div class="final-message" id="final-message"></div>
                    
                    <div class="results-actions">
                        <button class="restart-btn" onclick="restartCurrentQuiz()">
                            <span>🔄</span>
                            <span>Επανεκκίνηση Κουίζ</span>
                        </button>
                        <button class="return-quizzes-btn" onclick="navigateTo('class/${AppState.currentClass}/subject/${AppState.currentSubject}')">
                            <span>🏠</span>
                            <span>Επιστροφή στα Κουίζ</span>
                        </button>
                    </div>

                    <button class="review-summary-toggle" onclick="toggleReviewList()">
                        <span>📋</span>
                        <span id="review-toggle-label">Επισκόπηση Όλων των Ερωτήσεων</span>
                        <span id="review-chevron">▾</span>
                    </button>

                    <div class="review-list" id="review-list"></div>
                </div>
            </div>
        </div>

        <!-- Floating Toast Notification -->
        <div class="toast-notification" id="toast-msg"></div>
    `;

    container.innerHTML = html;
    loadCurrentQuestion();
}

function confirmExitQuiz() {
    const qr = AppState.quizRunner;
    const answeredCount = AppState.currentQuiz.questions.length - qr.activeQueue.length;
    if (answeredCount > 0 && qr.activeQueue.length > 0) {
        if (!confirm('Έχετε ένα κουίζ σε εξέλιξη. Είστε σίγουροι ότι θέλετε να αποχωρήσετε;')) {
            return;
        }
    }
    navigateTo(`class/${AppState.currentClass}/subject/${AppState.currentSubject}`);
}

function loadCurrentQuestion() {
    const quiz = AppState.currentQuiz;
    const qr = AppState.quizRunner;

    if (qr.activeQueue.length === 0) {
        showQuizResults();
        return;
    }

    if (qr.currentPos >= qr.activeQueue.length) {
        qr.currentPos = 0;
    }

    qr.viewingReviewIndex = null;
    qr.answered = false;
    qr.hintOpen = false;

    const qIndex = qr.activeQueue[qr.currentPos];
    const q = quiz.questions[qIndex];
    const totalAnswered = quiz.questions.length - qr.activeQueue.length;

    // Header updates - Display current question index and completed progress
    document.getElementById('question-count').innerText = `Ερώτηση ${qIndex + 1} / ${quiz.questions.length}`;
    document.getElementById('score-counter').innerText = `Σκορ: ${formatScore(qr.score)}`;
    document.getElementById('progress-bar').style.width = `${(totalAnswered / quiz.questions.length) * 100}%`;

    // Skipped badge
    const isRevisited = qr.skippedSet.has(qIndex);
    const skippedBadge = document.getElementById('skipped-badge');
    skippedBadge.style.display = isRevisited ? 'inline-flex' : 'none';

    // Pending skipped counter badge
    const pendingBadge = document.getElementById('pending-badge');
    const remainingSkipped = qr.activeQueue.filter(idx => qr.skippedSet.has(idx)).length;
    if (remainingSkipped > 0) {
        pendingBadge.style.display = 'inline-flex';
        document.getElementById('pending-count').innerText = remainingSkipped;
    } else {
        pendingBadge.style.display = 'none';
    }

    // Question text
    document.getElementById('question-text').innerHTML = formatMathText(q.q);

    // Render Question Circuit Diagrams
    renderCurrentQuestionDiagrams(q);

    // Question body rendering (Matching, Cascading Stepper, or Standard MCQ)
    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = '';

    if (q.type === 'matching') {
        renderMatchingQuestion(q, qIndex, optionsContainer);
    } else if (q.type === 'cascading') {
        renderCascadingQuestion(q, qIndex, optionsContainer);
    } else {
        renderStandardMcqQuestion(q, qIndex, optionsContainer);
    }

    // Reset Attempts & Hint
    qr.currentAttempts = 0;
    const hintBox = document.getElementById('hint-box');
    const hintBtn = document.getElementById('hint-btn');
    hintBox.style.display = 'none';
    if (hintBtn) {
        hintBtn.style.display = 'none'; // Hint hidden initially on 1st attempt
        hintBtn.classList.remove('pulse-ready');
    }
    document.getElementById('hint-content').innerHTML = formatMathText(q.hint || q.exp);
    document.getElementById('hint-btn-text').innerText = 'Υπόδειξη';
    document.getElementById('hint-chevron').innerText = '▾';

    // Reset Feedback
    const feedbackBox = document.getElementById('feedback-box');
    feedbackBox.style.display = 'none';
    feedbackBox.className = 'feedback-box';

    // Update Previous button state
    const prevBtn = document.getElementById('prev-btn');
    if (prevBtn) {
        const canGoBack = qr.navHistory.length > 0;
        prevBtn.disabled = !canGoBack;
        prevBtn.title = canGoBack ? 'Προηγούμενη ερώτηση (⬅ ή P)' : 'Δεν υπάρχει προηγούμενη ερώτηση';
    }

    // Reset Next button state
    const nextBtn = document.getElementById('next-btn');
    nextBtn.classList.remove('pulse-ready');
    document.getElementById('next-btn-text').innerText = 'Επόμενο';
    nextBtn.title = 'Προσωρινή παράλειψη ερώτησης (Pass)';

    // Trigger MathJax / dynamic typesetting
    triggerMathTypeset(document.querySelector('.quiz-container'));

    // Smooth scroll to top of question on mobile
    if (window.innerWidth <= 768) {
        const quizContainer = document.querySelector('.quiz-container');
        if (quizContainer) {
            quizContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
}

/* ==========================================================================
   CRYPTOGRAPHIC ANSWER VERIFICATION (SHA-256)
   Protects quiz answers against inspection in DevTools / Source code
   ========================================================================== */
function formatScore(score) {
    if (typeof score !== 'number' || isNaN(score)) return 0;
    if (Math.abs(score - Math.round(score)) < 0.05) {
        return Math.round(score);
    }
    return Number(score.toFixed(1));
}

const _GNE_HASH_SALT = atob("R05FXzIwMjZfUVVJWl9TQUxUXzlmOGIyYw==");

function _calcOptHash(qid, optIdx) {
    return sha256(String(qid) + ":" + String(optIdx) + ":" + _GNE_HASH_SALT);
}

function _calcPairHash(qid, leftId, rightId) {
    return sha256(String(qid) + ":" + String(leftId) + ":" + String(rightId) + ":" + _GNE_HASH_SALT);
}

function _calcStepHash(qid, stepIdx, optIdx) {
    return sha256(String(qid) + "_s" + String(stepIdx) + ":" + String(optIdx) + ":" + _GNE_HASH_SALT);
}

function resolveCorrectIndex(question) {
    if (!question) return -1;
    if (question.correct !== undefined) return question.correct;
    if (question.correctHash && Array.isArray(question.options)) {
        const qid = question.id !== undefined ? question.id : (question.q ? parseInt(question.q) : 0);
        for (let i = 0; i < question.options.length; i++) {
            if (_calcOptHash(qid, i) === question.correctHash) {
                return i;
            }
        }
    }
    return -1;
}

function checkIsCorrect(question, chosenIdx) {
    if (!question) return false;
    if (question.correctHash) {
        const qid = question.id !== undefined ? question.id : (question.q ? parseInt(question.q) : 0);
        return _calcOptHash(qid, chosenIdx) === question.correctHash;
    }
    return question.correct === chosenIdx;
}

function checkMatchingPair(question, leftId, rightId) {
    if (!question) return false;
    const qid = question.id !== undefined ? question.id : (question.q ? parseInt(question.q) : 0);
    if (question.pairHashes && question.pairHashes[leftId]) {
        return _calcPairHash(qid, leftId, rightId) === question.pairHashes[leftId];
    }
    if (question.pairs) {
        return question.pairs[leftId] === rightId;
    }
    return false;
}

function checkCascadingStep(question, stepIdx, chosenIdx) {
    if (!question || !question.steps || !question.steps[stepIdx]) return false;
    const step = question.steps[stepIdx];
    const qid = question.id !== undefined ? question.id : (question.q ? parseInt(question.q) : 0);
    if (step.correctHash) {
        return _calcStepHash(qid, stepIdx, chosenIdx) === step.correctHash;
    }
    return step.correct === chosenIdx;
}

function resolveCascadingCorrectIndex(question, stepIdx) {
    if (!question || !question.steps || !question.steps[stepIdx]) return -1;
    const step = question.steps[stepIdx];
    if (step.correct !== undefined) return step.correct;
    if (step.correctHash && Array.isArray(step.options)) {
        const qid = question.id !== undefined ? question.id : (question.q ? parseInt(question.q) : 0);
        for (let i = 0; i < step.options.length; i++) {
            if (_calcStepHash(qid, stepIdx, i) === step.correctHash) {
                return i;
            }
        }
    }
    return -1;
}

function sha256(ascii) {
    function rightRotate(value, amount) { return (value >>> amount) | (value << (32 - amount)); }
    var mathPow = Math.pow, maxWord = mathPow(2, 32), lengthProperty = 'length', i, j, result = '', words = [];
    var asciiBitLength = ascii[lengthProperty] * 8;
    var hash = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
    var k = [0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
        0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
        0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
        0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
        0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
        0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
        0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
        0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2];
    var utf8 = unescape(encodeURIComponent(ascii));
    asciiBitLength = utf8[lengthProperty] * 8;
    for (i = 0; i < utf8[lengthProperty]; i++) words[i >> 2] |= (utf8.charCodeAt(i) & 0xff) << ((3 - (i % 4)) * 8);
    words[asciiBitLength >> 5] |= 0x80 << (24 - (asciiBitLength % 32));
    words[(((asciiBitLength + 64) >> 9) << 4) + 15] = asciiBitLength;
    for (i = 0; i < words[lengthProperty]; i += 16) {
        var w = words.slice(i, i + 16), oldHash = hash.slice(0);
        for (j = 0; j < 64; j++) {
            var w15 = w[j - 15], w2 = w[j - 2];
            var s0 = rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3);
            var s1 = rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10);
            w[j] = j < 16 ? (w[j] | 0) : ((w[j - 16] + s0 + w[j - 7] + s1) | 0);
            var s1_maj = rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22);
            var maj = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]);
            var t2 = (s1_maj + maj) | 0;
            var s1_ch = rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25);
            var ch = (hash[4] & hash[5]) ^ ((~hash[4]) & hash[6]);
            var t1 = (hash[7] + s1_ch + ch + k[j] + w[j]) | 0;
            hash = [(t1 + t2) | 0, hash[0], hash[1], hash[2], (hash[3] + t1) | 0, hash[4], hash[5], hash[6]];
        }
        for (j = 0; j < 8; j++) hash[j] = (hash[j] + oldHash[j]) | 0;
    }
    for (i = 0; i < 8; i++) {
        for (j = 3; j >= 0; j--) {
            var b = (hash[i] >> (j * 8)) & 255;
            result += (b < 16 ? '0' : '') + b.toString(16);
        }
    }
    return result;
}

/* ==========================================================================
   QUIZ VARIATIONS: RENDERING & INTERACTION ENGINES
   1. Matching (Αντιστοίχιση / Connect-the-Dots)
   2. Cascading Stepper (Διαδοχική Επίλυση Βημάτων)
   3. Standard Multiple Choice (MCQ)
   ========================================================================== */

function renderStandardMcqQuestion(q, qIndex, container) {
    const letters = ['Α', 'Β', 'Γ', 'Δ', 'Ε'];
    q.options.forEach((optText, optIdx) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        
        let cleanText = optText.replace(/^[α-εA-Ea-e1-5][\)\.\-]\s*/, '');
        
        btn.innerHTML = `
            <span class="opt-letter">${letters[optIdx]}.</span>
            <span class="opt-content">${formatMathText(cleanText)}</span>
        `;
        btn.onclick = () => selectQuizOption(optIdx);
        container.appendChild(btn);
    });
}

/* --------------------------------------------------------------------------
   Type 1: Αντιστοίχιση (Interactive Matching / Connect-the-Dots)
   -------------------------------------------------------------------------- */
function renderMatchingQuestion(q, qIndex, container) {
    const qr = AppState.quizRunner;
    qr.matchingState = {
        selectedLeft: null,
        selectedRight: null,
        matchedPairs: {}, // { [leftId]: rightId }
        attempts: 0,
        evaluating: false
    };

    const wrapper = document.createElement('div');
    wrapper.className = 'matching-wrapper';
    wrapper.id = 'matching-wrapper';

    // SVG layer for lines
    const svgLayer = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgLayer.setAttribute('class', 'matching-svg-layer');
    svgLayer.setAttribute('id', 'matching-svg-layer');
    wrapper.appendChild(svgLayer);

    // Columns container
    const columnsDiv = document.createElement('div');
    columnsDiv.className = 'matching-columns';

    // Left Column
    const leftCol = document.createElement('div');
    leftCol.className = 'matching-col matching-col-left';
    const leftTitle = document.createElement('div');
    leftTitle.className = 'matching-col-title';
    leftTitle.innerHTML = '📋 Στήλη Α (Στοιχεία)';
    leftCol.appendChild(leftTitle);

    q.left.forEach((item, idx) => {
        const itemEl = document.createElement('div');
        itemEl.className = 'matching-item matching-item-left';
        itemEl.dataset.id = item.id;
        itemEl.dataset.side = 'left';

        itemEl.innerHTML = `
            <div class="matching-item-content">
                <span class="matching-num">${idx + 1}.</span>
                <span class="matching-text">${formatMathText(item.text)}</span>
            </div>
            <div class="matching-dot matching-dot-right" data-id="${item.id}" data-side="left" title="Κάντε κλικ για σύνδεση">
                <span class="dot-inner"></span>
            </div>
        `;

        itemEl.onclick = () => handleMatchingClick('left', item.id);
        leftCol.appendChild(itemEl);
    });

    // Right Column
    const rightCol = document.createElement('div');
    rightCol.className = 'matching-col matching-col-right';
    const rightTitle = document.createElement('div');
    rightTitle.className = 'matching-col-title';
    rightTitle.innerHTML = '🎯 Στήλη Β (Ιδιότητες / Αποτελέσματα)';
    rightCol.appendChild(rightTitle);

    const letters = ['Α', 'Β', 'Γ', 'Δ', 'Ε'];
    q.right.forEach((item, idx) => {
        const itemEl = document.createElement('div');
        itemEl.className = 'matching-item matching-item-right';
        itemEl.dataset.id = item.id;
        itemEl.dataset.side = 'right';

        itemEl.innerHTML = `
            <div class="matching-dot matching-dot-left" data-id="${item.id}" data-side="right" title="Κάντε κλικ για σύνδεση">
                <span class="dot-inner"></span>
            </div>
            <div class="matching-item-content">
                <span class="matching-num">${letters[idx] || (idx + 1)}.</span>
                <span class="matching-text">${formatMathText(item.text)}</span>
            </div>
        `;

        itemEl.onclick = () => handleMatchingClick('right', item.id);
        rightCol.appendChild(itemEl);
    });

    columnsDiv.appendChild(leftCol);
    columnsDiv.appendChild(rightCol);
    wrapper.appendChild(columnsDiv);
    container.appendChild(wrapper);

    // Instruction prompt
    const instructionBar = document.createElement('div');
    instructionBar.className = 'matching-instruction-bar';
    instructionBar.innerHTML = '💡 <em>Κάντε κλικ σε ένα στοιχείο της Στήλης Α και κατόπιν στο αντίστοιχο της Στήλης Β για να τα συνδέσετε.</em>';
    container.appendChild(instructionBar);

    // Responsive line recalculation
    if (window._matchingResizeHandler) {
        window.removeEventListener('resize', window._matchingResizeHandler);
    }
    window._matchingResizeHandler = () => redrawAllMatchingLines(q);
    window.addEventListener('resize', window._matchingResizeHandler);
}

function handleMatchingClick(side, id) {
    const qr = AppState.quizRunner;
    const q = AppState.currentQuiz.questions[qr.activeQueue[qr.currentPos]];
    if (qr.answered || !qr.matchingState || qr.matchingState.evaluating) return;

    // Ignore if already matched
    if (side === 'left' && qr.matchingState.matchedPairs[id]) return;
    if (side === 'right' && Object.values(qr.matchingState.matchedPairs).includes(id)) return;

    if (side === 'left') {
        qr.matchingState.selectedLeft = id;
        highlightMatchingSelection();

        if (qr.matchingState.selectedRight) {
            evaluateMatchingPair(q, qr.matchingState.selectedLeft, qr.matchingState.selectedRight);
        }
    } else {
        qr.matchingState.selectedRight = id;
        highlightMatchingSelection();

        if (qr.matchingState.selectedLeft) {
            evaluateMatchingPair(q, qr.matchingState.selectedLeft, qr.matchingState.selectedRight);
        }
    }
}

function highlightMatchingSelection() {
    const qr = AppState.quizRunner;
    const wrapper = document.getElementById('matching-wrapper');
    if (!wrapper || !qr.matchingState) return;

    wrapper.querySelectorAll('.matching-item').forEach(el => {
        const side = el.dataset.side;
        const id = el.dataset.id;
        const isSelected = (side === 'left' && qr.matchingState.selectedLeft === id) ||
                           (side === 'right' && qr.matchingState.selectedRight === id);
        el.classList.toggle('selected', isSelected);
    });
}

function evaluateMatchingPair(q, leftId, rightId) {
    const qr = AppState.quizRunner;
    qr.matchingState.evaluating = true;

    const isMatch = checkMatchingPair(q, leftId, rightId);
    const wrapper = document.getElementById('matching-wrapper');
    const svgLayer = document.getElementById('matching-svg-layer');

    const leftDot = wrapper ? wrapper.querySelector(`.matching-item-left[data-id="${leftId}"] .matching-dot`) : null;
    const rightDot = wrapper ? wrapper.querySelector(`.matching-item-right[data-id="${rightId}"] .matching-dot`) : null;
    const leftItem = wrapper ? wrapper.querySelector(`.matching-item-left[data-id="${leftId}"]`) : null;
    const rightItem = wrapper ? wrapper.querySelector(`.matching-item-right[data-id="${rightId}"]`) : null;

    if (isMatch) {
        // Correct connection!
        qr.matchingState.matchedPairs[leftId] = rightId;
        qr.matchingState.selectedLeft = null;
        qr.matchingState.selectedRight = null;
        highlightMatchingSelection();

        if (leftItem) leftItem.classList.add('matched');
        if (rightItem) rightItem.classList.add('matched');

        // Draw permanent green line
        if (svgLayer && leftDot && rightDot) {
            drawConnectingLine(svgLayer, leftDot, rightDot, 'matching-line-correct', `line-${leftId}`);
        }

        const totalPairs = q.left.length;
        const matchedCount = Object.keys(qr.matchingState.matchedPairs).length;

        if (matchedCount === totalPairs) {
            // All pairs successfully connected!
            qr.answered = true;
            qr.score++;
            document.getElementById('score-counter').innerText = `Σκορ: ${formatScore(qr.score)}`;

            const feedback = document.getElementById('feedback-box');
            feedback.className = 'feedback-box correct';
            feedback.innerHTML = `<strong>✓ Εξαιρετικά! Όλες οι αντιστοιχίσεις έγιναν σωστά!</strong><br><br>${formatMathText(q.exp)}`;
            feedback.style.display = 'block';
            triggerMathTypeset(feedback);

            const nextBtn = document.getElementById('next-btn');
            nextBtn.classList.add('pulse-ready');
            document.getElementById('next-btn-text').innerText = 'Επόμενο';
            nextBtn.title = 'Συνέχεια στην επόμενη ερώτηση';

            qr.userHistory.push({
                type: 'matching',
                qIndex: qr.activeQueue[qr.currentPos],
                question: q.q,
                left: q.left,
                right: q.right,
                matchedPairs: { ...qr.matchingState.matchedPairs },
                isCorrect: true,
                attempts: qr.matchingState.attempts + 1,
                explanation: q.exp,
                diagrams: resolveQuestionDiagrams(q)
            });

            showToast('🎉 Άριστα! Όλες οι συνδέσεις είναι σωστές!');
        } else {
            showToast(`✓ Σωστή σύνδεση! (${matchedCount}/${totalPairs})`);
        }
        qr.matchingState.evaluating = false;
    } else {
        // Wrong connection: draw line, shake, then dissolve line!
        qr.matchingState.attempts = (qr.matchingState.attempts || 0) + 1;

        let wrongLine = null;
        if (svgLayer && leftDot && rightDot) {
            wrongLine = drawConnectingLine(svgLayer, leftDot, rightDot, 'matching-line-wrong', 'temp-wrong-line');
        }

        if (leftItem) leftItem.classList.add('card-shake', 'item-wrong');
        if (rightItem) rightItem.classList.add('card-shake', 'item-wrong');

        setTimeout(() => {
            if (wrongLine && wrongLine.parentNode) {
                wrongLine.classList.add('line-dissolve');
                setTimeout(() => wrongLine.remove(), 250);
            }
            if (leftItem) leftItem.classList.remove('card-shake', 'item-wrong');
            if (rightItem) rightItem.classList.remove('card-shake', 'item-wrong');

            qr.matchingState.selectedLeft = null;
            qr.matchingState.selectedRight = null;
            highlightMatchingSelection();
            qr.matchingState.evaluating = false;
        }, 600);

        const hintBtn = document.getElementById('hint-btn');
        if (hintBtn && qr.matchingState.attempts === 1) {
            hintBtn.style.display = 'inline-flex';
            hintBtn.classList.add('pulse-ready');
            showToast('💡 Ξεκλειδώθηκε η υπόδειξη! Δοκιμάστε ξανά.');
        } else {
            showToast('✗ Λανθασμένη αντιστοίχιση. Δοκιμάστε ξανά!');
        }

        const feedback = document.getElementById('feedback-box');
        feedback.className = 'feedback-box warning';
        feedback.innerHTML = `<strong>✗ Μη σωστή αντιστοίχιση.</strong> Η λανθασμένη σύνδεση αφαιρέθηκε. Συμβουλευτείτε τη θεωρία ή την <strong>Υπόδειξη (💡)</strong> και συνδέστε ξανά.`;
        feedback.style.display = 'block';
    }
}

function drawConnectingLine(svgLayer, dotA, dotB, className, id) {
    const wrapper = svgLayer.closest('.matching-wrapper');
    if (!wrapper || !dotA || !dotB) return null;

    const wrapRect = wrapper.getBoundingClientRect();
    const rectA = dotA.getBoundingClientRect();
    const rectB = dotB.getBoundingClientRect();

    const x1 = rectA.left + rectA.width / 2 - wrapRect.left;
    const y1 = rectA.top + rectA.height / 2 - wrapRect.top;
    const x2 = rectB.left + rectB.width / 2 - wrapRect.left;
    const y2 = rectB.top + rectB.height / 2 - wrapRect.top;

    const dx = Math.abs(x2 - x1) * 0.45;
    const pathData = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;

    let path = id ? svgLayer.querySelector(`#${id}`) : null;
    if (!path) {
        path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        if (id) path.setAttribute('id', id);
        svgLayer.appendChild(path);
    }
    path.setAttribute('d', pathData);
    path.setAttribute('class', `matching-line ${className}`);
    return path;
}

function redrawAllMatchingLines(q) {
    const qr = AppState.quizRunner;
    const wrapper = document.getElementById('matching-wrapper');
    const svgLayer = document.getElementById('matching-svg-layer');
    if (!wrapper || !svgLayer || !qr.matchingState || !qr.matchingState.matchedPairs) return;

    Object.entries(qr.matchingState.matchedPairs).forEach(([leftId, rightId]) => {
        const leftDot = wrapper.querySelector(`.matching-item-left[data-id="${leftId}"] .matching-dot`);
        const rightDot = wrapper.querySelector(`.matching-item-right[data-id="${rightId}"] .matching-dot`);
        if (leftDot && rightDot) {
            drawConnectingLine(svgLayer, leftDot, rightDot, 'matching-line-correct', `line-${leftId}`);
        }
    });
}

/* --------------------------------------------------------------------------
   Type 2: Cascading Step-by-Step Problem (Διαδοχική Επίλυση Βημάτων)
   -------------------------------------------------------------------------- */
function renderCascadingQuestion(q, qIndex, container) {
    const qr = AppState.quizRunner;
    qr.cascadingState = {
        currentStep: 0,
        stepResults: [],
        stepAttempts: 0,
        totalSteps: q.steps.length
    };

    const cascadingWrap = document.createElement('div');
    cascadingWrap.className = 'cascading-container';
    cascadingWrap.id = 'cascading-container';

    // Header Stepper Indicator
    const header = document.createElement('div');
    header.className = 'cascading-stepper-header';
    header.id = 'cascading-stepper-header';

    q.steps.forEach((step, sIdx) => {
        const pill = document.createElement('div');
        pill.className = `cascading-step-pill ${sIdx === 0 ? 'active' : 'locked'}`;
        pill.id = `step-pill-${sIdx}`;
        pill.innerHTML = `
            <span class="step-num-circle">${sIdx + 1}</span>
            <span class="step-pill-title">${step.stepTitle || `Βήμα ${sIdx + 1}`}</span>
        `;
        header.appendChild(pill);
    });
    cascadingWrap.appendChild(header);

    // Body container for progressive step cards
    const stepsBody = document.createElement('div');
    stepsBody.className = 'cascading-steps-body';
    stepsBody.id = 'cascading-steps-body';
    cascadingWrap.appendChild(stepsBody);

    container.appendChild(cascadingWrap);

    // Render Step 0 initially
    renderActiveCascadingStep(q, 0);
}

function renderActiveCascadingStep(q, stepIdx) {
    const qr = AppState.quizRunner;
    qr.cascadingState.currentStep = stepIdx;
    qr.cascadingState.stepAttempts = 0;

    const stepsBody = document.getElementById('cascading-steps-body');
    if (!stepsBody) return;
    const step = q.steps[stepIdx];

    // Update Header step pills
    q.steps.forEach((_, idx) => {
        const pill = document.getElementById(`step-pill-${idx}`);
        if (pill) {
            if (idx < stepIdx) {
                pill.className = 'cascading-step-pill completed';
            } else if (idx === stepIdx) {
                pill.className = 'cascading-step-pill active';
            } else {
                pill.className = 'cascading-step-pill locked';
            }
        }
    });

    // Create Step Card
    const card = document.createElement('div');
    card.className = 'cascading-step-card active animate-step-in';
    card.id = `cascading-step-card-${stepIdx}`;

    const letters = ['Α', 'Β', 'Γ', 'Δ', 'Ε'];
    const stepPct = Math.round(100 / q.steps.length);

    card.innerHTML = `
        <div class="step-badge-title">
            <span class="step-badge">Βήμα ${stepIdx + 1} από ${q.steps.length}</span>
            <span class="step-badge-weight">Ισοδύναμη βαθμολόγηση (${stepPct}%)</span>
        </div>
        <div class="step-prompt">${formatMathText(step.prompt)}</div>
        <div class="step-options-grid" id="step-options-${stepIdx}"></div>
        <div class="step-mini-feedback" id="step-feedback-${stepIdx}" style="display: none;"></div>
    `;

    const optionsGrid = card.querySelector(`#step-options-${stepIdx}`);

    step.options.forEach((optText, optIdx) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn step-option-btn';
        let cleanText = optText.replace(/^[α-εA-Ea-e1-5][\)\.\-]\s*/, '');
        btn.innerHTML = `
            <span class="opt-letter">${letters[optIdx]}.</span>
            <span class="opt-content">${formatMathText(cleanText)}</span>
        `;
        btn.onclick = () => selectCascadingStepOption(stepIdx, optIdx);
        optionsGrid.appendChild(btn);
    });

    stepsBody.appendChild(card);
    triggerMathTypeset(card);

    // Smooth scroll down to new step card
    setTimeout(() => {
        card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 120);
}

function selectCascadingStepOption(stepIdx, optIdx) {
    const qr = AppState.quizRunner;
    const q = AppState.currentQuiz.questions[qr.activeQueue[qr.currentPos]];
    const step = q.steps[stepIdx];
    if (qr.answered || qr.cascadingState.currentStep !== stepIdx) return;

    const card = document.getElementById(`cascading-step-card-${stepIdx}`);
    if (!card) return;
    const btns = card.querySelectorAll('.step-option-btn');
    if (btns[optIdx] && btns[optIdx].disabled) return;

    qr.cascadingState.stepAttempts++;
    const isCorrect = checkCascadingStep(q, stepIdx, optIdx);
    const correctIdx = resolveCascadingCorrectIndex(q, stepIdx);
    const feedbackEl = card.querySelector(`#step-feedback-${stepIdx}`);

    if (isCorrect) {
        // Step answered correctly!
        btns[optIdx].classList.add('correct');
        const badge = document.createElement('span');
        badge.className = 'opt-status-badge correct-badge';
        badge.innerHTML = '✓ Σωστό';
        btns[optIdx].appendChild(badge);
        btns.forEach(b => b.disabled = true);

        // Add equal fractional score
        qr.score += (1 / q.steps.length);
        document.getElementById('score-counter').innerText = `Σκορ: ${formatScore(qr.score)}`;

        feedbackEl.className = 'step-mini-feedback correct';
        feedbackEl.innerHTML = `<strong>✓ Σωστό!</strong> ${formatMathText(step.exp)}`;
        feedbackEl.style.display = 'block';
        triggerMathTypeset(feedbackEl);

        qr.cascadingState.stepResults.push({
            stepIdx,
            chosenIdx: optIdx,
            correctIdx,
            isCorrect: true,
            attempts: qr.cascadingState.stepAttempts
        });

        handleCascadingStepAdvance(q, stepIdx);
    } else {
        // Step answered incorrectly
        btns[optIdx].classList.add('wrong');
        btns[optIdx].disabled = true;

        if (qr.cascadingState.stepAttempts === 1) {
            const hintBtn = document.getElementById('hint-btn');
            if (hintBtn) {
                hintBtn.style.display = 'inline-flex';
                hintBtn.classList.add('pulse-ready');
            }
            feedbackEl.className = 'step-mini-feedback warning';
            feedbackEl.innerHTML = `<strong>✗ Μη σωστή επιλογή.</strong> Έχετε άλλη 1 προσπάθεια. Συμβουλευτείτε την <strong>Υπόδειξη (💡)</strong> παρακάτω και δοκιμάστε ξανά!`;
            feedbackEl.style.display = 'block';
            showToast('💡 Ξεκλειδώθηκε η υπόδειξη για το βήμα!');
        } else {
            // Second wrong attempt: reveal correct and unlock next step
            btns.forEach(b => b.disabled = true);
            if (correctIdx >= 0 && btns[correctIdx]) {
                btns[correctIdx].classList.add('correct');
                const badge = document.createElement('span');
                badge.className = 'opt-status-badge correct-badge';
                badge.innerHTML = '✓ Σωστή Απάντηση';
                btns[correctIdx].appendChild(badge);
            }

            feedbackEl.className = 'step-mini-feedback wrong';
            feedbackEl.innerHTML = `<strong>✗ Λάθος στη 2η προσπάθεια.</strong> Η σωστή απάντηση επισημαίνεται με πράσινο.<br><br><strong>Επεξήγηση βήματος:</strong> ${formatMathText(step.exp)}`;
            feedbackEl.style.display = 'block';
            triggerMathTypeset(feedbackEl);

            qr.cascadingState.stepResults.push({
                stepIdx,
                chosenIdx: optIdx,
                correctIdx,
                isCorrect: false,
                attempts: 2
            });

            setTimeout(() => {
                handleCascadingStepAdvance(q, stepIdx);
            }, 1400);
        }
    }
}

function handleCascadingStepAdvance(q, stepIdx) {
    const qr = AppState.quizRunner;
    const card = document.getElementById(`cascading-step-card-${stepIdx}`);
    if (card) {
        card.classList.remove('active');
        card.classList.add('completed');
    }

    if (stepIdx + 1 < q.steps.length) {
        setTimeout(() => {
            renderActiveCascadingStep(q, stepIdx + 1);
        }, 500);
    } else {
        // All steps completed!
        qr.answered = true;

        q.steps.forEach((_, idx) => {
            const pill = document.getElementById(`step-pill-${idx}`);
            if (pill) pill.className = 'cascading-step-pill completed';
        });

        const feedback = document.getElementById('feedback-box');
        const allCorrect = qr.cascadingState.stepResults.every(r => r.isCorrect);

        feedback.className = `feedback-box ${allCorrect ? 'correct' : 'warning'}`;
        feedback.innerHTML = `
            <strong>${allCorrect ? '✓ Συγχαρητήρια! Επιλύσατε όλα τα βήματα με απόλυτη επιτυχία!' : '✓ Ολοκληρώθηκε η επίλυση όλων των βημάτων του προβλήματος!'}</strong><br><br>
            <strong>Συνολική Επεξήγηση:</strong> ${formatMathText(q.exp)}
        `;
        feedback.style.display = 'block';
        triggerMathTypeset(feedback);

        const nextBtn = document.getElementById('next-btn');
        nextBtn.classList.add('pulse-ready');
        document.getElementById('next-btn-text').innerText = 'Επόμενο';
        nextBtn.title = 'Συνέχεια στην επόμενη ερώτηση';

        qr.userHistory.push({
            type: 'cascading',
            qIndex: qr.activeQueue[qr.currentPos],
            question: q.q,
            steps: q.steps,
            stepResults: qr.cascadingState.stepResults,
            isCorrect: allCorrect,
            explanation: q.exp,
            diagrams: resolveQuestionDiagrams(q)
        });

        showToast(allCorrect ? '🏆 Άριστα! Όλα τα βήματα επιλύθηκαν σωστά!' : '✓ Ολοκληρώθηκαν όλα τα βήματα.');
    }
}

/* --------------------------------------------------------------------------
   Review Helpers for New Types
   -------------------------------------------------------------------------- */
function renderMatchingReview(entry, container) {
    const letters = ['Α', 'Β', 'Γ', 'Δ', 'Ε'];
    const card = document.createElement('div');
    card.className = 'review-matching-card';
    card.innerHTML = `
        <div class="review-matching-title">✓ Ολοκληρωμένες Αντιστοιχίσεις:</div>
        <div class="review-matching-pairs">
            ${entry.left.map((lItem, idx) => {
                const matchedRightId = entry.matchedPairs ? entry.matchedPairs[lItem.id] : null;
                const rItem = entry.right ? entry.right.find(r => r.id === matchedRightId) : null;
                const rIdx = entry.right ? entry.right.findIndex(r => r.id === matchedRightId) : -1;
                const rLetter = rIdx >= 0 ? letters[rIdx] : '';
                return `
                    <div class="review-pair-row">
                        <div class="review-pair-left"><strong>${idx + 1}.</strong> ${formatMathText(lItem.text)}</div>
                        <div class="review-pair-arrow">➔</div>
                        <div class="review-pair-right"><strong>${rLetter}.</strong> ${rItem ? formatMathText(rItem.text) : '—'}</div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
    container.appendChild(card);
}

function renderCascadingReview(entry, container) {
    const letters = ['Α', 'Β', 'Γ', 'Δ', 'Ε'];
    const card = document.createElement('div');
    card.className = 'review-cascading-card';
    card.innerHTML = `
        <div class="review-cascading-title">Διαδοχικά Βήματα Επίλυσης:</div>
        <div class="review-cascading-steps">
            ${entry.steps.map((step, sIdx) => {
                const res = entry.stepResults ? entry.stepResults[sIdx] : null;
                const chosenIdx = res ? res.chosenIdx : -1;
                const correctIdx = res ? res.correctIdx : -1;
                const isCorrect = res ? res.isCorrect : false;
                const chosenText = chosenIdx >= 0 && step.options && step.options[chosenIdx] ? step.options[chosenIdx].replace(/^[α-εA-Ea-e1-5][\)\.\-]\s*/, '') : '';
                const correctText = correctIdx >= 0 && step.options && step.options[correctIdx] ? step.options[correctIdx].replace(/^[α-εA-Ea-e1-5][\)\.\-]\s*/, '') : '';
                return `
                    <div class="review-step-item ${isCorrect ? 'was-correct' : 'was-wrong'}">
                        <div class="review-step-header">
                            <span class="review-step-badge">${isCorrect ? '✓' : '✗'} Βήμα ${sIdx + 1}</span>
                            <span class="review-step-prompt">${formatMathText(step.prompt)}</span>
                        </div>
                        <div class="review-step-details">
                            <div><strong>Επιλογή σας:</strong> <span style="color: ${isCorrect ? 'var(--success-border)' : 'var(--danger-border)'};">${letters[chosenIdx]}. ${formatMathText(chosenText)}</span></div>
                            ${!isCorrect ? `<div><strong>Σωστή απάντηση:</strong> <span style="color: var(--success-border);">${letters[correctIdx]}. ${formatMathText(correctText)}</span></div>` : ''}
                            <div class="review-step-exp"><strong>💡 Επεξήγηση βήματος:</strong> ${formatMathText(step.exp)}</div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
    container.appendChild(card);
}

function renderStandardMcqReview(entry, container) {
    const letters = ['Α', 'Β', 'Γ', 'Δ', 'Ε'];
    entry.options.forEach((optText, optIdx) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.disabled = true;

        let cleanText = optText.replace(/^[α-εA-Ea-e1-5][\)\.\-]\s*/, '');
        btn.innerHTML = `
            <span class="opt-letter">${letters[optIdx]}.</span>
            <span class="opt-content">${formatMathText(cleanText)}</span>
        `;

        if (optIdx === entry.correctIdx) {
            btn.classList.add('correct');
            const badge = document.createElement('span');
            badge.className = 'opt-status-badge correct-badge';
            badge.innerHTML = '✓ Σωστή';
            btn.appendChild(badge);
        } else if (optIdx === entry.chosenIdx && !entry.isCorrect) {
            btn.classList.add('wrong');
            const badge = document.createElement('span');
            badge.className = 'opt-status-badge wrong-badge';
            badge.innerHTML = '✗ Επιλογή σας';
            btn.appendChild(badge);
        }

        container.appendChild(btn);
    });
}

function selectQuizOption(idx) {
    const qr = AppState.quizRunner;
    const quiz = AppState.currentQuiz;
    if (qr.viewingReviewIndex !== null) return; // In review mode, options are read-only
    if (qr.answered) return;

    const btns = document.querySelectorAll('.option-btn');
    // If this option was already tried and marked wrong, ignore clicks
    if (btns[idx] && btns[idx].disabled) return;

    const qIndex = qr.activeQueue[qr.currentPos];
    const q = quiz.questions[qIndex];
    const feedback = document.getElementById('feedback-box');
    const nextBtn = document.getElementById('next-btn');
    const hintBtn = document.getElementById('hint-btn');

    const isCorrect = checkIsCorrect(q, idx);
    const correctIndex = resolveCorrectIndex(q);

    // Track attempt count for current question
    qr.currentAttempts = (qr.currentAttempts || 0) + 1;

    if (isCorrect) {
        // Correct answer (either on 1st or 2nd attempt)
        qr.answered = true;
        qr.score++;
        btns[idx].classList.add('correct');
        if (!btns[idx].querySelector('.opt-status-badge')) {
            const badge = document.createElement('span');
            badge.className = 'opt-status-badge correct-badge';
            badge.innerHTML = '✓ Σωστό';
            btns[idx].appendChild(badge);
        }
        btns.forEach(btn => btn.disabled = true);

        feedback.className = 'feedback-box correct';
        if (qr.currentAttempts === 1) {
            feedback.innerHTML = `<strong>✓ Σωστό!</strong> ${formatMathText(q.exp)}`;
        } else {
            feedback.innerHTML = `<strong>✓ Μπράβο! Σωστό στη 2η προσπάθεια!</strong> ${formatMathText(q.exp)}`;
        }
        feedback.style.display = 'block';
        triggerMathTypeset(feedback);

        // Save history for review screen
        qr.userHistory.push({
            qIndex: qIndex,
            question: q.q,
            options: q.options,
            correctIdx: correctIndex,
            chosenIdx: idx,
            isCorrect: true,
            attempts: qr.currentAttempts,
            explanation: q.exp,
            diagrams: resolveQuestionDiagrams(q)
        });

        document.getElementById('score-counter').innerText = `Σκορ: ${formatScore(qr.score)}`;
        nextBtn.classList.add('pulse-ready');
        document.getElementById('next-btn-text').innerText = 'Επόμενο';
        nextBtn.title = 'Συνέχεια στην επόμενη ερώτηση';

    } else {
        // Incorrect answer
        btns[idx].classList.add('wrong');
        btns[idx].disabled = true; // disable this wrong option
        if (!btns[idx].querySelector('.opt-status-badge')) {
            const badge = document.createElement('span');
            badge.className = 'opt-status-badge wrong-badge';
            badge.innerHTML = qr.currentAttempts === 1 ? '✗ 1η προσπάθεια' : '✗ Λάθος';
            btns[idx].appendChild(badge);
        }

        if (qr.currentAttempts === 1) {
            // First incorrect attempt:
            // 1. DO NOT show the correct answer!
            // 2. Unlock the Hint button!
            if (hintBtn) {
                hintBtn.style.display = 'inline-flex';
                hintBtn.classList.add('pulse-ready');
            }

            feedback.className = 'feedback-box warning';
            feedback.innerHTML = `<strong>✗ Μη σωστή επιλογή!</strong> Έχετε άλλη 1 προσπάθεια. Συμβουλευτείτε την <strong>Υπόδειξη (💡)</strong> που μόλις ξεκλειδώθηκε παρακάτω και δοκιμάστε ξανά!`;
            feedback.style.display = 'block';

            showToast('💡 Ξεκλειδώθηκε η υπόδειξη! Δοκιμάστε ξανά.');

            // Other buttons remain enabled for attempt 2!
            // qr.answered remains false

        } else {
            // Second incorrect attempt:
            // NOW, and only now, reveal the correct answer with green highlight!
            qr.answered = true;
            btns.forEach(btn => btn.disabled = true);

            // Highlight the correct answer with vibrant green & checkmark badge
            if (correctIndex >= 0 && btns[correctIndex]) {
                btns[correctIndex].classList.add('correct');
                if (!btns[correctIndex].querySelector('.opt-status-badge')) {
                    const badge = document.createElement('span');
                    badge.className = 'opt-status-badge correct-badge';
                    badge.innerHTML = '✓ Σωστή Απάντηση';
                    btns[correctIndex].appendChild(badge);
                }
            }

            const letters = ['Α', 'Β', 'Γ', 'Δ', 'Ε'];
            const correctLetterStr = correctIndex >= 0 ? ` (Επιλογή <strong>${letters[correctIndex]}</strong>)` : '';
            feedback.className = 'feedback-box wrong';
            feedback.innerHTML = `<strong>✗ Λάθος και στη 2η προσπάθεια.</strong> Η σωστή απάντηση επισημαίνεται με πράσινο${correctLetterStr}.<br><br><strong>Επεξήγηση:</strong> ${formatMathText(q.exp)}`;
            feedback.style.display = 'block';
            triggerMathTypeset(feedback);

            // Save history for review screen
            qr.userHistory.push({
                qIndex: qIndex,
                question: q.q,
                options: q.options,
                correctIdx: correctIndex,
                chosenIdx: idx,
                isCorrect: false,
                attempts: 2,
                explanation: q.exp,
                diagrams: resolveQuestionDiagrams(q)
            });

            nextBtn.classList.add('pulse-ready');
            document.getElementById('next-btn-text').innerText = 'Επόμενο';
            nextBtn.title = 'Συνέχεια στην επόμενη ερώτηση';
        }
    }

    // Auto-scroll feedback into view smoothly on mobile
    if (window.innerWidth <= 768) {
        setTimeout(() => {
            feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 60);
    }
}

function handleNextOrSkip() {
    const qr = AppState.quizRunner;

    // 1. If currently viewing an answered question in review mode
    if (qr.viewingReviewIndex !== null) {
        if (qr.forwardStack.length > 0) {
            const fwd = qr.forwardStack.pop();
            // Re-push the current review state to navHistory so user can step back again
            qr.navHistory.push({
                type: 'answered',
                qIndex: qr.userHistory[qr.viewingReviewIndex].qIndex,
                historyIndex: qr.viewingReviewIndex
            });

            if (fwd.type === 'review') {
                qr.viewingReviewIndex = fwd.reviewIndex;
                renderAnsweredQuestionReview(qr.viewingReviewIndex);
            } else {
                // Return to active interactive question!
                qr.viewingReviewIndex = null;
                qr.activeQueue = fwd.activeQueue;
                qr.skippedSet = fwd.skippedSet;
                qr.currentPos = fwd.currentPos;
                loadCurrentQuestion();
                showToast('➔ Επιστροφή στην τρέχουσα ερώτηση');
            }
        } else {
            qr.viewingReviewIndex = null;
            loadCurrentQuestion();
        }
        return;
    }

    // 2. Normal Active Flow: any forward action clears the forward navigation stack
    qr.forwardStack = [];

    if (!qr.answered) {
        // User is skipping (pass)
        if (qr.activeQueue.length <= 1) {
            showToast('⚠️ Απομένει μόνο αυτή η ερώτηση! Παρακαλώ επιλέξτε μια απάντηση.');
            return;
        }

        const skippedQ = qr.activeQueue.splice(qr.currentPos, 1)[0];
        const wasAlreadySkipped = qr.skippedSet.has(skippedQ);
        qr.activeQueue.push(skippedQ);
        qr.skippedSet.add(skippedQ);

        // Record skip action into navHistory
        qr.navHistory.push({
            type: 'skip',
            qIndex: skippedQ,
            wasAlreadySkipped: wasAlreadySkipped
        });

        showToast('⏭️ Η ερώτηση παραλείφθηκε (pass) και θα επανέλθει στο τέλος.');

        if (qr.currentPos >= qr.activeQueue.length) {
            qr.currentPos = 0;
        }
        loadCurrentQuestion();
    } else {
        // User answered and proceeds
        const finishedQ = qr.activeQueue.splice(qr.currentPos, 1)[0];
        qr.skippedSet.delete(finishedQ);

        // Record answered question into navHistory
        qr.navHistory.push({
            type: 'answered',
            qIndex: finishedQ,
            historyIndex: qr.userHistory.length - 1
        });

        if (qr.activeQueue.length === 0) {
            showQuizResults();
        } else {
            if (qr.currentPos >= qr.activeQueue.length) {
                qr.currentPos = 0;
            }
            loadCurrentQuestion();
        }
    }
}

function handlePrevQuestion() {
    const qr = AppState.quizRunner;
    const quiz = AppState.currentQuiz;
    if (!quiz || !quiz.questions) return;

    // Case 1: Already in review mode, stepping back to an earlier question
    if (qr.viewingReviewIndex !== null) {
        if (qr.navHistory.length > 0) {
            qr.forwardStack.push({
                type: 'review',
                reviewIndex: qr.viewingReviewIndex
            });
            const prevRecord = qr.navHistory.pop();
            if (prevRecord.type === 'answered') {
                qr.viewingReviewIndex = prevRecord.historyIndex;
                renderAnsweredQuestionReview(qr.viewingReviewIndex);
            } else if (prevRecord.type === 'skip') {
                qr.viewingReviewIndex = null;
                const idxInQueue = qr.activeQueue.indexOf(prevRecord.qIndex);
                if (idxInQueue !== -1) {
                    qr.activeQueue.splice(idxInQueue, 1);
                }
                qr.activeQueue.unshift(prevRecord.qIndex);
                qr.currentPos = 0;
                if (!prevRecord.wasAlreadySkipped) {
                    qr.skippedSet.delete(prevRecord.qIndex);
                }
                loadCurrentQuestion();
            }
        } else {
            showToast('⚠️ Βρίσκεστε στην πρώτη ερώτηση.');
        }
        return;
    }

    // Case 2: At active question, checking if we can step back
    if (qr.navHistory.length === 0) {
        showToast('⚠️ Βρίσκεστε στην αρχή του κουίζ.');
        return;
    }

    // Save active question snapshot into forwardStack so Next can return to it
    qr.forwardStack.push({
        type: 'active',
        activeQueue: [...qr.activeQueue],
        skippedSet: new Set(qr.skippedSet),
        currentPos: qr.currentPos
    });

    const prevRecord = qr.navHistory.pop();

    if (prevRecord.type === 'skip') {
        // Bring skipped question back to the front of the active queue
        const idxInQueue = qr.activeQueue.indexOf(prevRecord.qIndex);
        if (idxInQueue !== -1) {
            qr.activeQueue.splice(idxInQueue, 1);
        }
        qr.activeQueue.unshift(prevRecord.qIndex);
        qr.currentPos = 0;
        if (!prevRecord.wasAlreadySkipped) {
            qr.skippedSet.delete(prevRecord.qIndex);
        }
        loadCurrentQuestion();
        showToast('⬅ Προηγούμενη ερώτηση');
    } else if (prevRecord.type === 'answered') {
        // Display previously answered question in read-only review mode
        qr.viewingReviewIndex = prevRecord.historyIndex;
        renderAnsweredQuestionReview(qr.viewingReviewIndex);
        showToast('⬅ Επισκόπηση προηγούμενης απάντησης');
    }
}

function renderAnsweredQuestionReview(reviewIndex) {
    const qr = AppState.quizRunner;
    const quiz = AppState.currentQuiz;
    const entry = qr.userHistory[reviewIndex];
    if (!entry) return;

    const q = quiz.questions[entry.qIndex];

    // Header updates
    document.getElementById('question-count').innerText = `Ερώτηση ${entry.qIndex + 1} / ${quiz.questions.length} (Απαντημένη)`;
    document.getElementById('score-counter').innerText = `Σκορ: ${formatScore(qr.score)}`;
    
    const totalAnswered = quiz.questions.length - qr.activeQueue.length;
    document.getElementById('progress-bar').style.width = `${(totalAnswered / quiz.questions.length) * 100}%`;

    // Skipped & Pending Badges
    const skippedBadge = document.getElementById('skipped-badge');
    if (skippedBadge) skippedBadge.style.display = 'none';

    const pendingBadge = document.getElementById('pending-badge');
    if (pendingBadge) pendingBadge.style.display = 'none';

    // Question text
    document.getElementById('question-text').innerHTML = formatMathText(entry.question);

    // Render diagrams if any
    renderCurrentQuestionDiagrams(q);

    // Question body rendering in read-only review mode
    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = '';
    const letters = ['Α', 'Β', 'Γ', 'Δ', 'Ε'];

    if (entry.type === 'matching') {
        renderMatchingReview(entry, optionsContainer);
    } else if (entry.type === 'cascading') {
        renderCascadingReview(entry, optionsContainer);
    } else {
        renderStandardMcqReview(entry, optionsContainer);
    }

    // Hide hint in review mode
    const hintBtn = document.getElementById('hint-btn');
    const hintBox = document.getElementById('hint-box');
    if (hintBtn) hintBtn.style.display = 'none';
    if (hintBox) hintBox.style.display = 'none';

    // Feedback box with explanation
    const feedbackBox = document.getElementById('feedback-box');
    feedbackBox.style.display = 'block';
    if (entry.isCorrect) {
        feedbackBox.className = 'feedback-box correct';
        feedbackBox.innerHTML = `<strong>✓ Σωστό!</strong> ${formatMathText(entry.explanation)}`;
    } else {
        feedbackBox.className = 'feedback-box wrong';
        if (entry.type === 'matching' || entry.type === 'cascading') {
            feedbackBox.innerHTML = `<strong>Επεξήγηση:</strong> ${formatMathText(entry.explanation)}`;
        } else {
            feedbackBox.innerHTML = `<strong>✗ Μη σωστή επιλογή.</strong> Η σωστή απάντηση είναι η επιλογή <strong>${letters[entry.correctIdx]}</strong>.<br><br><strong>Επεξήγηση:</strong> ${formatMathText(entry.explanation)}`;
        }
    }

    // Previous button state
    const prevBtn = document.getElementById('prev-btn');
    if (prevBtn) {
        const canGoBack = qr.navHistory.length > 0;
        prevBtn.disabled = !canGoBack;
        prevBtn.title = canGoBack ? 'Προηγούμενη ερώτηση (⬅ ή P)' : 'Δεν υπάρχει προηγούμενη ερώτηση';
    }

    // Next button state
    const nextBtn = document.getElementById('next-btn');
    if (nextBtn) {
        nextBtn.classList.add('pulse-ready');
        document.getElementById('next-btn-text').innerText = 'Επόμενο';
        nextBtn.title = 'Επόμενη ερώτηση / Επιστροφή στο κουίζ';
    }

    // Trigger MathJax / dynamic typesetting
    triggerMathTypeset(document.querySelector('.quiz-container'));

    // Auto-scroll
    if (window.innerWidth <= 768) {
        const quizContainer = document.querySelector('.quiz-container');
        if (quizContainer) {
            quizContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
}

function toggleHint() {
    const qr = AppState.quizRunner;
    const hintBtn = document.getElementById('hint-btn');
    if (!hintBtn || hintBtn.style.display === 'none') {
        showToast('💡 Η υπόδειξη ξεκλειδώνεται μόνο αν χρειαστείτε 2η προσπάθεια!');
        return;
    }
    qr.hintOpen = !qr.hintOpen;
    const hintBox = document.getElementById('hint-box');
    const hintBtnText = document.getElementById('hint-btn-text');
    const hintChevron = document.getElementById('hint-chevron');

    if (qr.hintOpen) {
        hintBox.style.display = 'block';
        hintBtnText.innerText = 'Απόκρυψη';
        hintChevron.innerText = '▴';
        triggerMathTypeset(hintBox);
        setTimeout(() => {
            hintBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 60);
    } else {
        hintBox.style.display = 'none';
        hintBtnText.innerText = 'Υπόδειξη';
        hintChevron.innerText = '▾';
    }
}

function showToast(message) {
    const toast = document.getElementById('toast-msg');
    if (!toast) return;
    toast.innerText = message;
    toast.classList.add('show');

    if (AppState.toastTimer) clearTimeout(AppState.toastTimer);
    AppState.toastTimer = setTimeout(() => {
        toast.classList.remove('show');
    }, 2400);
}

function showQuizResults() {
    const qr = AppState.quizRunner;
    const quiz = AppState.currentQuiz;

    document.getElementById('quiz-screen').style.display = 'none';
    document.getElementById('results-screen').style.display = 'block';

    document.getElementById('final-score').innerText = formatScore(qr.score);
    const total = quiz.questions.length;
    const pct = Math.round((qr.score / total) * 100);
    document.getElementById('final-pct').innerText = `${pct}% Επιτυχία`;

    // Qualitative assessment in Greek
    let msg = "";
    if (pct >= 90) msg = "🌟 Άριστα! Έχετε πλήρη κατάρτιση και βαθιά επιστημονική κατανόηση της ύλης!";
    else if (pct >= 75) msg = "👏 Πολύ καλά! Έχετε κατανοήσει πλήρως τις βασικές έννοιες και αρχές.";
    else if (pct >= 50) msg = "👍 Καλή προσπάθεια! Χρειάζεται μια μικρή επανάληψη σε ορισμένες θεωρητικές λεπτομέρειες.";
    else msg = "📖 Χρειάζεται περισσότερη μελέτη και προσεκτική επανάληψη στις βασικές έννοιες της ενότητας.";

    document.getElementById('final-message').innerText = msg;

    // Save best score to localStorage
    const savedScoreKey = `stem_quiz_score_${quiz.id}`;
    const previousBest = parseInt(localStorage.getItem(savedScoreKey) || '0');
    if (qr.score > previousBest) {
        localStorage.setItem(savedScoreKey, qr.score);
    }

    // Build Detailed Review List
    buildReviewList();
}

function buildReviewList() {
    const reviewList = document.getElementById('review-list');
    if (!reviewList) return;
    const qr = AppState.quizRunner;

    let html = '';
    const letters = ['Α', 'Β', 'Γ', 'Δ', 'Ε'];

    qr.userHistory.forEach((item, i) => {
        const statusClass = item.isCorrect ? 'was-correct' : 'was-wrong';

        let diagramsHtml = '';
        if (item.diagrams && item.diagrams.length > 0) {
            diagramsHtml = `
                <div class="review-diagrams-wrap">
                    ${item.diagrams.map(d => `
                        <div class="review-diagram-item">
                            <div class="review-diagram-label">${d.badge}</div>
                            <img src="${d.src}" alt="${d.alt}" onclick="openDiagramLightbox('${d.src}', '${d.alt.replace(/'/g, "\\'")}')" title="Κάντε κλικ για μεγέθυνση" />
                        </div>
                    `).join('')}
                </div>
            `;
        }

        let bodyHtml = '';
        if (item.type === 'matching') {
            bodyHtml = `
                <div class="review-matching-card">
                    <div class="review-matching-title">✓ Ολοκληρωμένες Αντιστοιχίσεις:</div>
                    <div class="review-matching-pairs">
                        ${item.left.map((lItem, idx) => {
                            const matchedRightId = item.matchedPairs ? item.matchedPairs[lItem.id] : null;
                            const rItem = item.right ? item.right.find(r => r.id === matchedRightId) : null;
                            const rIdx = item.right ? item.right.findIndex(r => r.id === matchedRightId) : -1;
                            const rLetter = rIdx >= 0 ? letters[rIdx] : '';
                            return `
                                <div class="review-pair-row">
                                    <div class="review-pair-left"><strong>${idx + 1}.</strong> ${formatMathText(lItem.text)}</div>
                                    <div class="review-pair-arrow">➔</div>
                                    <div class="review-pair-right"><strong>${rLetter}.</strong> ${rItem ? formatMathText(rItem.text) : '—'}</div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        } else if (item.type === 'cascading') {
            bodyHtml = `
                <div class="review-cascading-card">
                    <div class="review-cascading-title">Διαδοχικά Βήματα Επίλυσης:</div>
                    <div class="review-cascading-steps">
                        ${item.steps.map((step, sIdx) => {
                            const res = item.stepResults ? item.stepResults[sIdx] : null;
                            const chosenIdx = res ? res.chosenIdx : -1;
                            const correctIdx = res ? res.correctIdx : -1;
                            const isCorrect = res ? res.isCorrect : false;
                            const chosenText = chosenIdx >= 0 && step.options && step.options[chosenIdx] ? step.options[chosenIdx].replace(/^[α-εA-Ea-e1-5][\)\.\-]\s*/, '') : '';
                            const correctText = correctIdx >= 0 && step.options && step.options[correctIdx] ? step.options[correctIdx].replace(/^[α-εA-Ea-e1-5][\)\.\-]\s*/, '') : '';
                            return `
                                <div class="review-step-item ${isCorrect ? 'was-correct' : 'was-wrong'}">
                                    <div class="review-step-header">
                                        <span class="review-step-badge">${isCorrect ? '✓' : '✗'} Βήμα ${sIdx + 1}</span>
                                        <span class="review-step-prompt">${formatMathText(step.prompt)}</span>
                                    </div>
                                    <div class="review-step-details">
                                        <div><strong>Επιλογή σας:</strong> <span style="color: ${isCorrect ? 'var(--success-border)' : 'var(--danger-border)'}; font-weight: 600;">${letters[chosenIdx]}. ${formatMathText(chosenText)}</span></div>
                                        ${!isCorrect ? `<div><strong>Σωστή απάντηση:</strong> <span style="color: var(--success-border); font-weight: 600;">${letters[correctIdx]}. ${formatMathText(correctText)}</span></div>` : ''}
                                        <div class="review-step-exp"><strong>💡 Επεξήγηση βήματος:</strong> ${formatMathText(step.exp)}</div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        } else {
            const cleanCorrectText = item.options && item.options[item.correctIdx] ? item.options[item.correctIdx].replace(/^[α-εA-Ea-e1-5][\)\.\-]\s*/, '') : '';
            const cleanChosenText = item.options && item.options[item.chosenIdx] ? item.options[item.chosenIdx].replace(/^[α-εA-Ea-e1-5][\)\.\-]\s*/, '') : '';
            bodyHtml = `
                <div style="margin: 6px 0; font-size: 0.9rem;">
                    <strong>Η επιλογή σας:</strong> 
                    <span style="color: ${item.isCorrect ? 'var(--success-border)' : 'var(--danger-border)'}; font-weight: 600;">
                        ${letters[item.chosenIdx]}. ${formatMathText(cleanChosenText)}
                    </span>
                </div>
                ${!item.isCorrect ? `
                    <div style="margin: 6px 0; font-size: 0.9rem;">
                        <strong>Σωστή απάντηση:</strong> 
                        <span style="color: var(--success-border); font-weight: 600;">
                            ${letters[item.correctIdx]}. ${formatMathText(cleanCorrectText)}
                        </span>
                    </div>
                ` : ''}
            `;
        }

        html += `
            <div class="review-item ${statusClass}">
                <div class="review-q-title">
                    ${item.isCorrect ? '✓' : '✗'} ${formatMathText(item.question)}
                    <span style="font-size: 0.82rem; margin-left: 8px; opacity: 0.85; font-weight: normal;">
                        (${item.isCorrect ? (item.attempts === 1 ? '1η προσπάθεια' : '2η προσπάθεια με υπόδειξη') : 'Εξαντλήθηκαν 2 προσπάθειες'})
                    </span>
                </div>
                ${diagramsHtml}
                ${bodyHtml}
                <div class="review-q-exp">
                    <strong>💡 Επεξήγηση:</strong> ${formatMathText(item.explanation)}
                </div>
            </div>
        `;
    });

    reviewList.innerHTML = html;
    triggerMathTypeset(reviewList);
}

function toggleReviewList() {
    const list = document.getElementById('review-list');
    const chevron = document.getElementById('review-chevron');
    if (!list) return;

    if (list.style.display === 'flex') {
        list.style.display = 'none';
        chevron.innerText = '▾';
    } else {
        list.style.display = 'flex';
        chevron.innerText = '▴';
        triggerMathTypeset(list);
    }
}

function restartCurrentQuiz() {
    if (AppState.currentQuiz) {
        renderQuizRunner(AppState.currentQuiz);
    }
}

/* ==========================================================================
   Question Circuit Diagram Resolvers & Lightbox Handlers
   ========================================================================== */
function resolveQuestionDiagrams(q) {
    if (!q) return [];
    
    // 1. Explicit array
    if (Array.isArray(q.images) && q.images.length > 0) {
        return q.images.map(img => formatDiagramObj(img));
    }
    // 2. Explicit single image or array
    if (q.image) {
        if (Array.isArray(q.image)) {
            return q.image.map(img => formatDiagramObj(img));
        }
        return [formatDiagramObj(q.image)];
    }

    // 3. User Rule Detection:
    // "each question in physics Γ class either says σχήμα 1 ή σχήμα 2 ή σειρά ή παράλληλα"
    const text = ((q.q || '') + ' ' + (q.exp || '')).toLowerCase();
    
    // Check for Schema 1 OR Series Circuit
    const matchS1 = /(?:σχήμα|σχημα|σχήματος|σχηματος)\s*1/i.test(text);
    const matchSeries = /σειρ[άα]|σειρ[αά]ς|σε\s*σειρά|κύκλωμα\s*σειράς/i.test(text);
    const isS1 = matchS1 || matchSeries;

    // Check for Schema 2 OR Parallel Circuit
    const matchS2 = /(?:σχήμα|σχημα|σχήματος|σχηματος)\s*2/i.test(text);
    const matchParallel = /παράλληλ|παραλληλ/i.test(text);
    const isS2 = matchS2 || matchParallel;

    const diagrams = [];

    // Special case: ammeter placed in parallel across R1 in Schema 1 (Q11)
    const isOnlyS1Ammeter = matchS1 && !matchS2 && /αμπερόμετρο.*παράλληλα/i.test(text);

    // If both keywords/schemas are present (comparison questions)
    if (isS1 && isS2 && !isOnlyS1Ammeter) {
        diagrams.push(formatDiagramObj('assets/images/sxima_1_series_circuit.png'));
        diagrams.push(formatDiagramObj('assets/images/sxima_2_parallel_circuit.png'));
        return diagrams;
    }

    if (isS1) {
        diagrams.push(formatDiagramObj('assets/images/sxima_1_series_circuit.png'));
    } else if (isS2) {
        diagrams.push(formatDiagramObj('assets/images/sxima_2_parallel_circuit.png'));
    }

    return diagrams;
}

function formatDiagramObj(item) {
    if (typeof item === 'object' && item.src) return item;
    const src = String(item);
    if (src.includes('sxima_1')) {
        return {
            src: src,
            alt: 'Σχήμα 1: Σύνδεση σε Σειρά',
            badge: '⚡ Σχήμα 1: Σύνδεση σε Σειρά (R₁, R₂, Vπηγ, Διακόπτης K)'
        };
    }
    if (src.includes('sxima_2')) {
        return {
            src: src,
            alt: 'Σχήμα 2: Παράλληλη Σύνδεση',
            badge: '⚡ Σχήμα 2: Παράλληλη Σύνδεση (R₁, R₂, Κλάδοι I₁, I₂)'
        };
    }
    if (src.includes('ohms_law')) {
        return {
            src: src,
            alt: 'Διάγραμμα Νόμου Ohm (V - I)',
            badge: '📈 Διάγραμμα Νόμου του Ohm (V – I)'
        };
    }
    return {
        src: src,
        alt: 'Διάγραμμα Κυκλώματος',
        badge: '⚡ Διάγραμμα Κυκλώματος'
    };
}

function renderCurrentQuestionDiagrams(q) {
    const container = document.getElementById('question-diagrams-container');
    if (!container) return;

    const diagrams = resolveQuestionDiagrams(q);
    if (diagrams && diagrams.length > 0) {
        container.innerHTML = `
            <div class="question-diagrams-grid ${diagrams.length > 1 ? 'multi-diagrams' : 'single-diagram'}">
                ${diagrams.map(d => `
                    <div class="question-diagram-card">
                        <div class="diagram-badge">${d.badge}</div>
                        <div class="diagram-img-wrap" onclick="openDiagramLightbox('${d.src}', '${d.alt.replace(/'/g, "\\'")}')" title="Κάντε κλικ για μεγέθυνση σε πλήρη ανάλυση">
                            <img src="${d.src}" alt="${d.alt}" class="question-diagram-img" loading="eager" />
                            <span class="diagram-zoom-hint">🔍 Μεγέθυνση</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        container.style.display = 'block';
    } else {
        container.innerHTML = '';
        container.style.display = 'none';
    }
}

function openDiagramLightbox(src, title) {
    const lb = document.getElementById('diagram-lightbox');
    const img = document.getElementById('lightbox-img');
    const t = document.getElementById('lightbox-title');
    if (lb && img) {
        img.src = src;
        if (t) t.innerText = title || 'Διάγραμμα Κυκλώματος';
        lb.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeDiagramLightbox(e) {
    const lb = document.getElementById('diagram-lightbox');
    if (lb) {
        lb.classList.remove('active');
        document.body.style.overflow = '';
    }
}

/* ==========================================================================
   Global Keyboard Shortcuts
   ========================================================================== */
function setupGlobalKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Lightbox Escape
        if (e.key === 'Escape') {
            closeDiagramLightbox();
            return;
        }

        // Only active when quiz screen is visible
        const quizScreen = document.getElementById('quiz-screen');
        if (!quizScreen || quizScreen.style.display === 'none') {
            const resultsScreen = document.getElementById('results-screen');
            if (resultsScreen && resultsScreen.style.display === 'block' && e.key === 'Enter') {
                restartCurrentQuiz();
            }
            return;
        }

        // Keys 1 to 5
        if (e.key >= '1' && e.key <= '5') {
            const idx = parseInt(e.key) - 1;
            selectQuizOption(idx);
        } 
        // Greek and Latin letters
        else if (['a', 'b', 'c', 'd', 'e', 'α', 'β', 'γ', 'δ', 'ε'].includes(e.key.toLowerCase())) {
            const map = { 'a': 0, 'α': 0, 'b': 1, 'β': 1, 'c': 2, 'γ': 2, 'd': 3, 'δ': 3, 'e': 4, 'ε': 4 };
            const idx = map[e.key.toLowerCase()];
            if (idx !== undefined) selectQuizOption(idx);
        } 
        // Hint: H or Η
        else if (e.key.toLowerCase() === 'h' || e.key.toLowerCase() === 'η') {
            toggleHint();
        } 
        // Previous: ArrowLeft or P or Π
        else if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'p' || e.key.toLowerCase() === 'π') {
            handlePrevQuestion();
        }
        // Next: Enter or Space or ArrowRight
        else if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') {
            if (e.key === ' ') e.preventDefault();
            handleNextOrSkip();
        }
    });
}
