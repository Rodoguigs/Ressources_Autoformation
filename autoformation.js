/* ═══════════════════════════════════════════════════════════════
   SYSTÈME UNIFIÉ DE PROGRESSION - autoformation.js
   À inclure sur toutes les pages
   Stocke : modules complétés, dernière page, % global
   ═══════════════════════════════════════════════════════════════ */

(function() {
  'use strict';
  
  // Clé localStorage unique
  const STORAGE_KEY = 'aut_progress';
  
  // Liste ordonnée des modules (selon ta numérotation : 1,2,3,4,6,7,8,9)
  const MODULES = [
    { num: 1, file: 'prototype_module1_v5.html', titre: 'Bien-être professionnel' },
    { num: 2, file: 'prototype_module2.html', titre: 'Prévention du burnout' },
    { num: 3, file: 'prototype_module3.html', titre: 'Profil des besoins de formation' },
    { num: 4, file: 'prototype_module4.html', titre: 'Vulnérabilité au stress' },
    { num: 5, file: 'prototype_module6.html', titre: 'Cartographie des ressources' },
    { num: 6, file: 'prototype_module7.html', titre: 'Mentorat entre pairs' },
    { num: 7, file: 'prototype_module8.html', titre: 'Stratégies pédagogiques' },
    { num: 8, file: 'prototype_module9.html', titre: 'Fatigue de compassion' },
  ];
  
  // Récupérer l'état actuel
  function getProgress() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { modules: {}, lastPage: null, lastModule: null, diagnosticDone: false };
      return JSON.parse(raw);
    } catch (e) {
      return { modules: {}, lastPage: null, lastModule: null, diagnosticDone: false };
    }
  }
  
  // Sauvegarder l'état
  function saveProgress(p) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
    } catch (e) {
      console.warn('Impossible de sauvegarder la progression:', e);
    }
  }
  
  // Tracker la page actuelle (appelé automatiquement)
  function trackCurrentPage() {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    const p = getProgress();
    p.lastPage = path;
    p.lastVisit = new Date().toISOString();
    
    // Si c'est un module, tracker
    const modMatch = path.match(/prototype_module(\d)/);
    if (modMatch) {
      const num = parseInt(modMatch[1]);
      p.lastModule = num;
      if (!p.modules[num]) p.modules[num] = { started: true, sections: {}, completed: false };
      p.modules[num].started = true;
      p.modules[num].lastVisit = p.lastVisit;
    }
    
    // Si c'est le diagnostic
    if (path.includes('diagnostic')) {
      p.diagnosticDone = p.diagnosticDone || false;
      // Vérifier dans diagnostic v3
      try {
        const diag = localStorage.getItem('aut_diagnostic_v3');
        if (diag) {
          const d = JSON.parse(diag);
          if (d.t1 && d.t1.scores) p.diagnosticDone = true;
        }
      } catch (e) {}
    }
    
    saveProgress(p);
  }
  
  // Marquer un module comme complété
  function markModuleComplete(num) {
    const p = getProgress();
    if (!p.modules[num]) p.modules[num] = { started: true, sections: {}, completed: false };
    p.modules[num].completed = true;
    p.modules[num].completedAt = new Date().toISOString();
    saveProgress(p);
  }
  
  // Marquer une section comme vue
  function markSectionVisited(modNum, secNum) {
    const p = getProgress();
    if (!p.modules[modNum]) p.modules[modNum] = { started: true, sections: {}, completed: false };
    p.modules[modNum].sections[secNum] = true;
    saveProgress(p);
  }
  
  // Calculer le % global
  function getGlobalProgress() {
    const p = getProgress();
    const total = MODULES.length;
    const completed = Object.values(p.modules || {}).filter(m => m.completed).length;
    const percent = Math.round((completed / total) * 100);
    return { completed, total, percent };
  }
  
  // Récupérer la dernière activité formatée
  function getResumeInfo() {
    const p = getProgress();
    if (!p.lastModule) return null;
    
    const mod = MODULES.find(m => m.num === p.lastModule);
    if (!mod) return null;
    
    return {
      moduleNum: p.lastModule,
      moduleTitre: mod.titre,
      moduleFile: mod.file,
      lastVisit: p.lastVisit
    };
  }
  
  // Exposer l'API
  window.AutProgress = {
    getProgress: getProgress,
    saveProgress: saveProgress,
    markModuleComplete: markModuleComplete,
    markSectionVisited: markSectionVisited,
    getGlobalProgress: getGlobalProgress,
    getResumeInfo: getResumeInfo,
    MODULES: MODULES
  };
  
  // Tracker automatiquement au chargement
  trackCurrentPage();
  
})();
