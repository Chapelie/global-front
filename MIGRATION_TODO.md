# 🚀 Migration Frontend Supabase → Laravel

## 📋 **TODO List - Migration Complète**

### **Phase 1: Services & API** ✅ TERMINÉ
- [x] **1.1** Créer `services/laravelApiService.ts` avec Laravel Sanctum
- [x] **1.2** Remplacer `completeHybridService.ts` par `completeLaravelService.ts`
- [x] **1.3** Créer `services/laravelAuth.ts` pour l'authentification
- [x] **1.4** Remplacer `auth.ts` (Supabase) par `laravelAuth.ts`
- [x] **1.5** Supprimer `storage.ts` (plus utilisé)

### **Phase 2: Vues & Composants** ✅ TERMINÉ
- [x] **2.1** Corriger `StockView.vue` (supprimer `fournisseur`)
- [x] **2.2** Corriger `CommandesView.vue` (supprimer `email`)
- [x] **2.3** Mettre à jour `DashboardView.vue` (remplacer appels Supabase)
- [x] **2.4** Mettre à jour `HomeView.vue` (remplacer appels Supabase)
- [x] **2.5** Mettre à jour `LivraisonView.vue` (remplacer appels Supabase)
- [x] **2.6** Mettre à jour `AnalysesView.vue` (remplacer appels Supabase)
- [x] **2.7** Mettre à jour `PersonnelView.vue` (remplacer appels Supabase)
- [x] **2.8** Mettre à jour `LoginView.vue` (remplacer auth Supabase)
- [x] **2.9** Mettre à jour `RegisterView.vue` (remplacer auth Supabase)

### **Phase 3: Configuration** ✅ TERMINÉ
- [x] **3.1** Créer `config/laravel.ts` pour la configuration API
- [x] **3.2** Mettre à jour `vite.config.ts` pour les proxies
- [x] **3.3** Supprimer `lib/supabase.ts` (plus utilisé)
- [x] **3.4** Nettoyer les imports Supabase dans tous les fichiers

### **Phase 4: Types & Interfaces** ✅ TERMINÉ
- [x] **4.1** Créer `types/laravel.ts` pour les types Laravel
- [x] **4.2** Mettre à jour les interfaces existantes
- [x] **4.3** Supprimer les types Supabase

### **Phase 5: Tests & Validation** ✅
- [ ] **5.1** Tester l'authentification Laravel
- [ ] **5.2** Tester les CRUD Articles
- [ ] **5.3** Tester les CRUD Consommables
- [ ] **5.4** Tester les CRUD Commandes
- [ ] **5.5** Tester les CRUD Livraisons
- [ ] **5.6** Tester les CRUD Productions
- [ ] **5.7** Valider le dashboard
- [ ] **5.8** Valider les formulaires (sans fournisseur/email)

---

## 🎯 **Détails Techniques**

### **Laravel Sanctum Authentication:**
```typescript
// services/laravelAuth.ts
const login = async (email: string, password: string) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await response.json();
  localStorage.setItem('token', data.token);
  return data.user;
};
```

### **API Service Structure:**
```typescript
// services/laravelApiService.ts
class LaravelApiService {
  private baseURL = 'http://localhost:8000/api';
  
  // Articles
  async getArticles() { return this.get('/articles') }
  async addArticle(data) { return this.post('/articles', data) }
  
  // Consommables
  async getConsommables() { return this.get('/consommables') }
  async addConsommable(data) { return this.post('/consommables', data) }
  
  // Commandes
  async getCommandes() { return this.get('/commandes') }
  async addCommande(data) { return this.post('/commandes', data) }
}
```

### **Champs à supprimer:**
- ❌ `fournisseur` (Articles)
- ❌ `email` (Commandes)
- ✅ Garder `telephone` (Commandes)

---

## 📅 **Timeline Estimée:**
- **Phase 1:** 2-3 heures
- **Phase 2:** 3-4 heures  
- **Phase 3:** 1-2 heures
- **Phase 4:** 1-2 heures
- **Phase 5:** 2-3 heures

**Total:** 9-14 heures
