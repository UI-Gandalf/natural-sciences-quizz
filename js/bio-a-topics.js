/* ==========================================================================
   Biology Α: "Βαθιά εστίαση & ερμηνεία" - supplementary topics (outside the book, not examined).
   window.BioATopics.render(mountElement)
   ========================================================================== */
(function () {
    'use strict';
    const K = window.BioGuideKit;
    function render(mount) {
        const root = K.renderPage(mount, {
            title: '🧩 Βαθιά εστίαση & ερμηνεία',
            intro: 'Επιπλέον θέματα για όσους θέλουν να πάνε πιο βαθιά. Είναι <strong>συμπληρωματικά</strong> και <strong>δεν αποτελούν εξεταστέα ύλη</strong>.',
            sections: [window.BioPhoto.section(1)]
        });
        window.BioPhoto.init(root);
    }
    window.BioATopics = { render };
})();
