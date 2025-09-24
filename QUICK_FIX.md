# 🚨 Dépannage Rapide - Global Star Distribution

## ❌ Erreurs Courantes et Solutions

### 1. "Invalid supabaseUrl" ou "can't access lexical declaration"
**Cause :** Variables d'environnement Supabase manquantes

**Solution :**
```bash
# Créer le fichier .env.local
echo "VITE_SUPABASE_URL=https://your-project.supabase.co" > .env.local
echo "VITE_SUPABASE_ANON_KEY=your-anon-key-here" >> .env.local

# Redémarrer le serveur
npm run dev
```

### 2. "Rien ne s'affiche" ou page blanche
**Cause :** Erreur JavaScript bloquante

**Solution :**
1. Ouvrir la console (F12)
2. Vérifier les erreurs
3. Redémarrer le serveur : `npm run dev`

### 3. Dépendances circulaires
**Cause :** Import circulaire entre services

**Solution :** ✅ **DÉJÀ CORRIGÉ** - Utilisation de services simplifiés

## 🛠️ Solutions par Étapes

### Étape 1 : Mode Hors Ligne (Recommandé)
```bash
# L'application fonctionne immédiatement
npm run dev
```
- ✅ Pas de configuration requise
- ✅ Toutes les fonctionnalités disponibles
- ✅ Données stockées localement

### Étape 2 : Mode Synchronisé (Optionnel)
```bash
# 1. Créer .env.local
cat > .env.local << EOF
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-cle-ici
EOF

# 2. Redémarrer
npm run dev
```

## 🔍 Vérifications

### Console du Navigateur
```javascript
// Vérifier que l'app démarre
console.log('🚀 Application Global Star Distribution démarrée')

// Vérifier le mode
console.log('📱 Mode hors ligne activé') // ou '✅ Mode en ligne activé'
```

### Fichiers de Configuration
- ✅ `.env.local` existe
- ✅ Variables correctes
- ✅ Pas d'erreurs de syntaxe

## 🎯 Test Rapide

1. **Lancer l'application :**
   ```bash
   npm run dev
   ```

2. **Vérifier la console :**
   - Pas d'erreurs rouges
   - Message de démarrage visible

3. **Tester une fonctionnalité :**
   - Aller sur une page
   - Ajouter un article
   - Vérifier que ça fonctionne

## 🆘 Si Rien Ne Fonctionne

### Solution d'Urgence
```bash
# 1. Nettoyer le cache
rm -rf node_modules package-lock.json
npm install

# 2. Redémarrer
npm run dev
```

### Mode Développement
```bash
# Lancer avec plus de logs
npm run dev -- --debug
```

## ✅ Checklist de Fonctionnement

- [ ] L'application se lance sans erreur
- [ ] La page d'accueil s'affiche
- [ ] Les données sont visibles
- [ ] Pas d'erreurs dans la console
- [ ] Les fonctionnalités marchent

## 🎉 Résultat Attendu

L'application devrait maintenant :
- ✅ Se lancer sans erreur
- ✅ Afficher l'interface
- ✅ Fonctionner en mode hors ligne
- ✅ Permettre d'ajouter/modifier des données
- ✅ Afficher "Mode hors ligne" dans la console

**L'application est maintenant fonctionnelle !** 🚀
