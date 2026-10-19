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
        userHistory: []      // Tracks { qIndex, selectedIdx, isCorrect }
    },
    toastTimer: null
};

// Initialization on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initMobileView();
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
   Mobile / Student Phone View Management
   ========================================================================== */
function initMobileView() {
    const saved = localStorage.getItem('stem_quiz_mobile_preview');
    if (saved === 'true') {
        setMobileView(true, false);
    }
}

function toggleMobileView() {
    const isCurrentlyMobile = document.body.getAttribute('data-mobile-preview') === 'true';
    setMobileView(!isCurrentlyMobile, true);
}

function setMobileView(isMobile, showToastNotice = false) {
    const btn = document.getElementById('mobile-toggle');
    const label = document.querySelector('.mobile-toggle-label');
    const icon = document.getElementById('mobile-toggle-icon');

    if (isMobile) {
        document.body.setAttribute('data-mobile-preview', 'true');
        localStorage.setItem('stem_quiz_mobile_preview', 'true');
        if (btn) btn.classList.add('active');
        if (label) label.innerText = 'Desktop';
        if (icon) icon.innerText = '💻';
        if (showToastNotice) {
            showToast('📱 Ενεργοποιήθηκε η Προβολή Κινητού (Phone View)');
        }
    } else {
        document.body.removeAttribute('data-mobile-preview');
        localStorage.setItem('stem_quiz_mobile_preview', 'false');
        if (btn) btn.classList.remove('active');
        if (label) label.innerText = 'Κινητό';
        if (icon) icon.innerText = '📱';
        if (showToastNotice) {
            showToast('💻 Επιστροφή σε Κανονική Προβολή (Desktop View)');
        }
    }
}

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

            // Subject Selected: Show Quizzes List
            AppState.currentQuiz = null;
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

    let html = `<a class="crumb-item" onclick="navigateTo('')">🏛️ Αρχική</a>`;

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
            // Non-quiz page: display emoji as an icon!
            html += `<span class="crumb-active">${subConf.emoji} ${subConf.name}</span>`;
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
            <h1 class="view-title">Επιλέξτε Τάξη Γυμνασίου</h1>
            <p class="view-subtitle">
                Προσαρμοσμένα διαδραστικά τεστ Φυσικής, Χημείας, Βιολογίας και Γεωγραφίας 
                για όλες τις τάξεις του Γυμνασίου με άμεση ανατροφοδότηση και αναλυτικές επεξηγήσεις.
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

            <!-- Navigation Tabs: Quizzes vs Theory -->
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
    `;

    container.innerHTML = html;
}

function switchSubjectTab(tabKey) {
    AppState.currentSubjectTab = tabKey;
    
    const quizzesBtn = document.getElementById('tab-btn-quizzes');
    const theoryBtn = document.getElementById('tab-btn-theory');
    const quizzesPanel = document.getElementById('tab-panel-quizzes');
    const theoryPanel = document.getElementById('tab-panel-theory');

    if (!quizzesPanel || !theoryPanel) return;

    if (tabKey === 'quizzes') {
        if (quizzesBtn) quizzesBtn.classList.add('active');
        if (theoryBtn) theoryBtn.classList.remove('active');
        quizzesPanel.style.display = 'block';
        theoryPanel.style.display = 'none';
        quizzesPanel.style.animation = 'fadeIn 0.3s ease';
    } else {
        if (quizzesBtn) quizzesBtn.classList.remove('active');
        if (theoryBtn) theoryBtn.classList.add('active');
        quizzesPanel.style.display = 'none';
        theoryPanel.style.display = 'block';
        theoryPanel.style.animation = 'fadeIn 0.3s ease';
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

                        <button class="next-btn" id="next-btn" onclick="handleNextOrSkip()" title="Παράλειψη / Επόμενο">
                            <span id="next-btn-text">Επόμενο</span>
                            <span>➔</span>
                        </button>
                    </div>

                    <div class="shortcuts-hint">
                        Συντομεύσεις: <kbd>1</kbd>-<kbd>5</kbd> Επιλογή | <kbd>H</kbd> Υπόδειξη | <kbd>Enter</kbd> Επόμενο / Παράλειψη
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

    qr.answered = false;
    qr.hintOpen = false;

    const qIndex = qr.activeQueue[qr.currentPos];
    const q = quiz.questions[qIndex];
    const totalAnswered = quiz.questions.length - qr.activeQueue.length;

    // Header updates
    document.getElementById('question-count').innerText = `Ερώτηση ${totalAnswered + 1} / ${quiz.questions.length}`;
    document.getElementById('score-counter').innerText = `Σκορ: ${qr.score}`;
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
    document.getElementById('question-text').innerText = q.q;

    // Options rendering
    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = '';

    const letters = ['Α', 'Β', 'Γ', 'Δ', 'Ε'];
    q.options.forEach((optText, optIdx) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        
        let cleanText = optText.replace(/^[α-εA-Ea-e1-5][\)\.\-]\s*/, '');
        
        btn.innerHTML = `
            <span class="opt-letter">${letters[optIdx]}.</span>
            <span class="opt-content">${cleanText}</span>
        `;
        btn.onclick = () => selectQuizOption(optIdx);
        optionsContainer.appendChild(btn);
    });

    // Reset Hint
    const hintBox = document.getElementById('hint-box');
    hintBox.style.display = 'none';
    document.getElementById('hint-content').innerText = q.hint || q.exp;
    document.getElementById('hint-btn-text').innerText = 'Υπόδειξη';
    document.getElementById('hint-chevron').innerText = '▾';

    // Reset Feedback
    const feedbackBox = document.getElementById('feedback-box');
    feedbackBox.style.display = 'none';
    feedbackBox.className = 'feedback-box';

    // Reset Next button state
    const nextBtn = document.getElementById('next-btn');
    nextBtn.classList.remove('pulse-ready');
    document.getElementById('next-btn-text').innerText = 'Επόμενο';
    nextBtn.title = 'Προσωρινή παράλειψη ερώτησης (Pass)';

    // Smooth scroll to top of question on mobile
    if (window.innerWidth <= 768 || document.body.getAttribute('data-mobile-preview') === 'true') {
        const quizContainer = document.querySelector('.quiz-container');
        if (quizContainer) {
            quizContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
}

function selectQuizOption(idx) {
    const qr = AppState.quizRunner;
    const quiz = AppState.currentQuiz;
    if (qr.answered) return;
    qr.answered = true;

    const qIndex = qr.activeQueue[qr.currentPos];
    const q = quiz.questions[qIndex];
    const btns = document.querySelectorAll('.option-btn');
    const feedback = document.getElementById('feedback-box');
    const nextBtn = document.getElementById('next-btn');

    btns.forEach(btn => btn.disabled = true);

    const isCorrect = (idx === q.correct);
    if (isCorrect) {
        qr.score++;
        btns[idx].classList.add('correct');
        feedback.className = 'feedback-box correct';
        feedback.innerHTML = `<strong>✓ Σωστό!</strong> ${q.exp}`;
    } else {
        btns[idx].classList.add('wrong');
        btns[q.correct].classList.add('correct');
        feedback.className = 'feedback-box wrong';
        feedback.innerHTML = `<strong>✗ Λάθος!</strong> ${q.exp}`;
    }

    // Save into history for the review list
    qr.userHistory.push({
        qIndex: qIndex,
        question: q.q,
        options: q.options,
        correctIdx: q.correct,
        chosenIdx: idx,
        isCorrect: isCorrect,
        explanation: q.exp
    });

    document.getElementById('score-counter').innerText = `Σκορ: ${qr.score}`;
    feedback.style.display = 'block';

    // Auto-scroll feedback into view smoothly on mobile
    if (window.innerWidth <= 768 || document.body.getAttribute('data-mobile-preview') === 'true') {
        setTimeout(() => {
            feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 60);
    }

    // Pulse next button
    nextBtn.classList.add('pulse-ready');
    nextBtn.title = 'Συνέχεια στην επόμενη ερώτηση';
}

function handleNextOrSkip() {
    const qr = AppState.quizRunner;
    if (!qr.answered) {
        // User is skipping (pass)
        if (qr.activeQueue.length <= 1) {
            showToast('⚠️ Απομένει μόνο αυτή η ερώτηση! Παρακαλώ επιλέξτε μια απάντηση.');
            return;
        }

        const skippedQ = qr.activeQueue.splice(qr.currentPos, 1)[0];
        qr.activeQueue.push(skippedQ);
        qr.skippedSet.add(skippedQ);

        showToast('⏭️ Η ερώτηση παραλείφθηκε (pass) και θα επανέλθει στο τέλος.');

        if (qr.currentPos >= qr.activeQueue.length) {
            qr.currentPos = 0;
        }
        loadCurrentQuestion();
    } else {
        // User answered and proceeds
        const finishedQ = qr.activeQueue.splice(qr.currentPos, 1)[0];
        qr.skippedSet.delete(finishedQ);

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

function toggleHint() {
    const qr = AppState.quizRunner;
    qr.hintOpen = !qr.hintOpen;
    const hintBox = document.getElementById('hint-box');
    const hintBtnText = document.getElementById('hint-btn-text');
    const hintChevron = document.getElementById('hint-chevron');

    if (qr.hintOpen) {
        hintBox.style.display = 'block';
        hintBtnText.innerText = 'Απόκρυψη';
        hintChevron.innerText = '▴';
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

    document.getElementById('final-score').innerText = qr.score;
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
        const cleanCorrectText = item.options[item.correctIdx].replace(/^[α-εA-Ea-e1-5][\)\.\-]\s*/, '');
        const cleanChosenText = item.options[item.chosenIdx].replace(/^[α-εA-Ea-e1-5][\)\.\-]\s*/, '');

        html += `
            <div class="review-item ${statusClass}">
                <div class="review-q-title">
                    ${item.isCorrect ? '✓' : '✗'} ${item.question}
                </div>
                <div style="margin: 6px 0; font-size: 0.9rem;">
                    <strong>Η επιλογή σας:</strong> 
                    <span style="color: ${item.isCorrect ? 'var(--success-border)' : 'var(--danger-border)'}; font-weight: 600;">
                        ${letters[item.chosenIdx]}. ${cleanChosenText}
                    </span>
                </div>
                ${!item.isCorrect ? `
                    <div style="margin: 6px 0; font-size: 0.9rem;">
                        <strong>Σωστή απάντηση:</strong> 
                        <span style="color: var(--success-border); font-weight: 600;">
                            ${letters[item.correctIdx]}. ${cleanCorrectText}
                        </span>
                    </div>
                ` : ''}
                <div class="review-q-exp">
                    <strong>💡 Επεξήγηση:</strong> ${item.explanation}
                </div>
            </div>
        `;
    });

    reviewList.innerHTML = html;
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
    }
}

function restartCurrentQuiz() {
    if (AppState.currentQuiz) {
        renderQuizRunner(AppState.currentQuiz);
    }
}

/* ==========================================================================
   Global Keyboard Shortcuts
   ========================================================================== */
function setupGlobalKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
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
        // Next: Enter or Space or ArrowRight
        else if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') {
            if (e.key === ' ') e.preventDefault();
            handleNextOrSkip();
        }
    });
}
