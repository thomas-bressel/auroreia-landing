# 📊 Guide de Test de Performance - AuroreIA Landing

## 🎯 Objectifs de Performance

### **Scores Cibles**

| Outil | Métrique | Actuel | Objectif |
|-------|----------|--------|----------|
| **EcoIndex** | Note | D (50) | B (70+) |
| **PageSpeed** | Performance | ? | 90+ |
| **Lighthouse** | Performance | ? | 90+ |
| **Lighthouse** | Accessibility | ? | 95+ |
| **Lighthouse** | SEO | ? | 100 |

### **Core Web Vitals**

| Métrique | Objectif | Description |
|----------|----------|-------------|
| **LCP** | < 2.5s | Largest Contentful Paint (affichage contenu principal) |
| **FID** | < 100ms | First Input Delay (réactivité première interaction) |
| **CLS** | < 0.1 | Cumulative Layout Shift (stabilité visuelle) |
| **TTFB** | < 600ms | Time to First Byte (réponse serveur) |
| **FCP** | < 1.8s | First Contentful Paint (premier élément visible) |

---

## 🛠️ **Outils de Test**

### **1. Test Automatique Local**

Script créé pour tester avant déploiement :

```bash
# Analyser le build
./scripts/test-performance.sh

# Ou manuellement
npm run build
npm run preview
```

**Ce que le script mesure :**
- ✅ Taille du bundle
- ✅ Nombre de requêtes
- ✅ Compression Gzip/Brotli
- ✅ Formats d'images (WebP)
- ✅ Fichiers les plus lourds

---

### **2. Google PageSpeed Insights** ⭐ **PRIORITAIRE**

**URL :** https://pagespeed.web.dev/

**Comment utiliser :**
1. Aller sur PageSpeed Insights
2. Entrer : `https://auroreia.fr`
3. Cliquer "Analyze"
4. Attendre 30-60 secondes

**Résultats :**
- Score Performance (0-100)
- Core Web Vitals (LCP, FID, CLS)
- Suggestions d'optimisation détaillées
- Tests Mobile ET Desktop

**Capture pour rapport :**
```bash
# Prendre screenshot des résultats
# Sauvegarder dans docs/performance/
```

---

### **3. EcoIndex.fr** ⭐ **Pour éco-conception**

**URL :** https://www.ecoindex.fr/

**Comment utiliser :**
1. Aller sur EcoIndex
2. Entrer : `https://auroreia.fr`
3. Cliquer "Calculer"

**Métriques mesurées :**
- Note environnementale (A-G)
- Consommation eau (litres)
- Émissions CO2 (grammes)
- Nombre de requêtes HTTP
- Taille de page (Ko)
- Complexité DOM (éléments)

**Bonnes pratiques vérifiées :**
- Cache-Control headers
- Compression ressources
- Cookies sur ressources statiques
- Minification CSS/JS
- Images optimisées
- HTTP/2
- Print CSS
- Polices personnalisées

---

### **4. Chrome DevTools Lighthouse**

**Comment utiliser :**
1. Ouvrir Chrome
2. F12 (DevTools)
3. Onglet **Lighthouse**
4. Sélectionner :
   - ✅ Performance
   - ✅ Accessibility
   - ✅ Best Practices
   - ✅ SEO
5. Device : Mobile + Desktop
6. Cliquer **Analyze page load**

**Avantages :**
- Gratuit et local
- Tests reproductibles
- Détails techniques précis
- Export JSON/HTML

**Export du rapport :**
```bash
# Lighthouse CLI
npm install -g lighthouse

# Test Mobile
lighthouse https://auroreia.fr --output html --output-path ./reports/mobile.html --preset=perf --throttling.cpuSlowdownMultiplier=4

# Test Desktop
lighthouse https://auroreia.fr --output html --output-path ./reports/desktop.html --preset=desktop
```

---

### **5. WebPageTest** ⭐ **Le plus détaillé**

**URL :** https://www.webpagetest.org/

**Configuration recommandée :**
- **Location :** Paris, France (ou Amsterdam)
- **Browser :** Chrome
- **Connection :** 4G / Cable
- **Number of Tests :** 3 (median)
- **Repeat View :** Enabled (test cache)

**Résultats détaillés :**
- Waterfall (cascade requêtes)
- Filmstrip (timeline visuel)
- Video (enregistrement chargement)
- Content Breakdown (types ressources)
- Domains (répartition par domaine)

**Métriques avancées :**
- Start Render
- Speed Index
- First Interactive
- Fully Loaded
- Bytes In (par type)

---

### **6. GTmetrix**

**URL :** https://gtmetrix.com/

**Avantages :**
- Historique des tests
- Comparaison avant/après
- Alerts (monitoring)
- Rapports PDF

**Free tier :**
- 1 location (Vancouver)
- 1 browser (Chrome)
- Tests illimités

---

### **7. Pingdom Tools**

**URL :** https://tools.pingdom.com/

**Avantages :**
- Interface simple
- Résultats rapides
- Waterfall clair
- Grade performance A-F

---

## 📈 **Métriques à Suivre**

### **Bundle Size**

```bash
# Analyser bundle après build
npm run build

# Taille totale client
du -sh .output/public/_nuxt

# Fichiers les plus lourds
du -ah .output/public/_nuxt | sort -rh | head -10
```

**Objectifs :**
- Bundle JS total : **< 200 KB** (gzip)
- Bundle CSS total : **< 50 KB** (gzip)
- Première page : **< 100 KB** (initial load)

---

### **Nombre de Requêtes**

**Avant optimisation :** 150 requêtes
**Objectif :** **< 50 requêtes**

**Répartition idéale :**
- HTML : 1
- CSS : 1-2
- JS : 3-5 chunks
- Images : 2-5 (above fold)
- Fonts : 2 (WOFF2)
- Total : **< 20 requêtes** (above fold)

---

### **Taille de Page**

**Avant optimisation :** 8833 Ko
**Objectif :** **< 2000 Ko**

**Répartition :**
- HTML : < 50 KB
- CSS : < 20 KB
- JS : < 150 KB
- Images : < 300 KB (WebP)
- Fonts : < 100 KB (WOFF2)
- **Total first load : < 500 KB**

---

## 🧪 **Tests Manuels**

### **1. Test Réseau Throttling**

Chrome DevTools → Network → Throttling :

- **Fast 3G** : Simuler mobile 3G
  - Latency : 562.5ms
  - Download : 1.6 Mbps
  - Upload : 750 Kbps

- **Slow 3G** : Test extrême
  - Latency : 2000ms
  - Download : 400 Kbps
  - Upload : 400 Kbps

**Objectif :** Site utilisable en < 5s sur Fast 3G

---

### **2. Test Cache**

1. **First Visit** (cache vide) :
   - Vider cache Chrome
   - Recharger page
   - Noter temps de chargement

2. **Second Visit** (cache plein) :
   - Recharger page (Cmd+R)
   - Temps devrait être < 500ms

3. **Hard Reload** (cache invalidé) :
   - Cmd+Shift+R
   - Vérifier que cache se reconstruit

---

### **3. Test Lighthouse CI**

Pour intégration continue :

```bash
# Installer
npm install -g @lhci/cli

# Configurer
cat > lighthouserc.js <<EOF
module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:3000'],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'categories:performance': ['error', {minScore: 0.9}],
        'categories:accessibility': ['error', {minScore: 0.95}],
        'categories:best-practices': ['error', {minScore: 0.9}],
        'categories:seo': ['error', {minScore: 1}],
      },
    },
  },
};
EOF

# Lancer
npm run preview &
lhci autorun
```

---

## 📊 **Tableau de Bord Performance**

### **Créer un suivi régulier**

| Date | PageSpeed Mobile | PageSpeed Desktop | EcoIndex | LCP | FID | CLS | Taille | Requêtes |
|------|------------------|-------------------|----------|-----|-----|-----|--------|----------|
| 2025-12-01 (avant) | ? | ? | D (50) | ? | ? | ? | 8833 Ko | 150 |
| 2025-12-01 (après) | ? | ? | B (70+) | < 2.5s | < 100ms | < 0.1 | < 3000 Ko | < 80 |

---

## 🎯 **Checklist Pré-Déploiement**

Avant chaque déploiement, vérifier :

### **Build & Bundle**
- [ ] `npm run build` réussit sans erreurs
- [ ] Bundle < 200 KB (gzip)
- [ ] Pas de console.log en production
- [ ] Source maps désactivés (ou externes)

### **Images**
- [ ] Toutes les images en WebP
- [ ] `width` et `height` définis (éviter CLS)
- [ ] `loading="lazy"` pour images below fold
- [ ] `loading="eager"` pour logo header

### **Performance**
- [ ] Lighthouse Performance > 90
- [ ] LCP < 2.5s
- [ ] CLS < 0.1
- [ ] PageSpeed Mobile > 90

### **Accessibilité**
- [ ] Lighthouse Accessibility > 95
- [ ] Contraste couleurs WCAG AA
- [ ] Alt text sur images
- [ ] Navigation clavier fonctionnelle

### **SEO**
- [ ] Lighthouse SEO = 100
- [ ] Meta description présente
- [ ] Canonical URL définie
- [ ] Sitemap.xml accessible
- [ ] robots.txt configuré

### **Éco-conception**
- [ ] EcoIndex > B (70)
- [ ] < 80 requêtes HTTP
- [ ] < 3000 Ko taille page
- [ ] Compression activée
- [ ] Cache headers configurés
- [ ] Pas de cookies sur ressources statiques

---

## 🚀 **Quick Start**

### **Test rapide (2 minutes)**

```bash
# 1. Build
npm run build

# 2. Preview
npm run preview

# 3. Lighthouse (Chrome DevTools)
# F12 → Lighthouse → Analyze
```

### **Test complet (10 minutes)**

```bash
# 1. Script automatique
./scripts/test-performance.sh

# 2. PageSpeed Insights
# → https://pagespeed.web.dev/
# → Entrer URL production

# 3. EcoIndex
# → https://www.ecoindex.fr/
# → Entrer URL production

# 4. WebPageTest
# → https://www.webpagetest.org/
# → Location: Paris, Connection: 4G, Tests: 3
```

---

## 📚 **Ressources**

### **Documentation**
- [Web Vitals](https://web.dev/vitals/)
- [Lighthouse Scoring](https://web.dev/performance-scoring/)
- [EcoIndex Methodology](https://www.ecoindex.fr/comment-ca-marche/)
- [Nuxt Performance](https://nuxt.com/docs/guide/concepts/rendering)

### **Outils Complémentaires**
- [Bundle Analyzer](https://github.com/nuxt/nuxt/tree/main/packages/nuxt#bundle-analyzer)
- [Webpack Bundle Analyzer](https://www.npmjs.com/package/webpack-bundle-analyzer)
- [Chrome User Experience Report](https://developer.chrome.com/docs/crux/)

### **Benchmarks**
- [HTTP Archive](https://httparchive.org/)
- [Performance Budget Calculator](https://www.performancebudget.io/)

---

## 🎓 **Formation**

### **Core Web Vitals**
- [web.dev/vitals](https://web.dev/vitals/)
- [Core Web Vitals Workflow](https://web.dev/vitals-tools/)

### **Performance Budgets**
- Définir budgets : https://web.dev/performance-budgets-101/
- Lighthouse CI budgets : https://github.com/GoogleChrome/lighthouse-ci

---

**Dernière mise à jour :** 2025-12-01
**Auteur :** Claude Code (AuroreIA)
