# 🔧 Dépannage Configuration Supabase

## 🚨 **Problème : "Mode hors ligne activé" malgré Supabase configuré**

### **Diagnostic**

Si vous voyez ces messages dans la console :
```
✅ Supabase configuré avec succès
📱 Mode hors ligne activé
```

Cela indique un problème de synchronisation entre les fichiers de configuration.

### **🔍 Vérifications à Effectuer**

#### 1. **Vérifier les Variables d'Environnement**

Créez un fichier `.env.local` à la racine du projet :
```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_cle_anon_ici
```

**⚠️ Important :** Remplacez les valeurs par vos vraies clés Supabase.

#### 2. **Tester la Configuration**

Exécutez le script de test :
```bash
node test-supabase-config.js
```

Ou ouvrez la console du navigateur et exécutez :
```javascript
console.log('URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Key:', import.meta.env.VITE_SUPABASE_ANON_KEY);
```

#### 3. **Vérifier l'Ordre d'Initialisation**

Le problème peut venir de l'ordre d'initialisation. Vérifiez que dans `main.ts` :
```typescript
// Configuration après le montage
setTimeout(() => {
  initAppConfig()
  console.log('🚀 Application Global Star Distribution démarrée')
}, 100)
```

### **🛠️ Solutions**

#### **Solution 1 : Redémarrer le Serveur de Développement**

```bash
# Arrêter le serveur (Ctrl+C)
# Redémarrer
npm run dev
# ou
yarn dev
```

#### **Solution 2 : Vérifier le Fichier .env.local**

Assurez-vous que le fichier `.env.local` existe et contient :
```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_cle_anon_ici
```

#### **Solution 3 : Nettoyer le Cache**

```bash
# Supprimer le cache
rm -rf node_modules/.vite
rm -rf dist

# Réinstaller les dépendances
npm install
# ou
yarn install

# Redémarrer
npm run dev
```

#### **Solution 4 : Vérifier la Configuration Supabase**

1. **Connectez-vous** à votre projet Supabase
2. **Allez dans Settings > API**
3. **Copiez** l'URL et la clé anonyme
4. **Mettez à jour** `.env.local`

#### **Solution 5 : Test de Connexion**

Ajoutez ce code dans `main.ts` pour tester :
```typescript
// Test de connexion
import { supabase } from './lib/supabase'

setTimeout(async () => {
  try {
    const { data, error } = await supabase.from('articles').select('count')
    if (error) {
      console.error('❌ Erreur Supabase:', error)
    } else {
      console.log('✅ Connexion Supabase réussie')
    }
  } catch (error) {
    console.error('❌ Erreur de connexion:', error)
  }
}, 2000)
```

### **🧪 Test Complet**

#### **1. Page de Test**

Naviguez vers `/test-supabase` dans votre application pour :
- Tester la connexion Supabase
- Vérifier les tables
- Tester la synchronisation

#### **2. Console de Débogage**

Ouvrez la console du navigateur et vérifiez :
```javascript
// Vérifier la configuration
console.log('Config:', APP_CONFIG);

// Vérifier Supabase
console.log('Supabase:', supabase);

// Tester la connexion
supabase.from('articles').select('count').then(console.log);
```

### **📋 Checklist de Vérification**

- [ ] Fichier `.env.local` créé
- [ ] Variables d'environnement correctes
- [ ] Serveur redémarré
- [ ] Cache nettoyé
- [ ] Tables créées dans Supabase
- [ ] RLS configuré
- [ ] Test de connexion réussi

### **🚨 Erreurs Courantes**

#### **Erreur : "Supabase non configuré"**
- Vérifiez que `.env.local` existe
- Vérifiez que les variables sont correctes
- Redémarrez le serveur

#### **Erreur : "Mode hors ligne activé"**
- Vérifiez l'ordre d'initialisation
- Vérifiez que `initAppConfig()` est appelé après le montage
- Vérifiez que les variables d'environnement sont chargées

#### **Erreur : "Connexion échouée"**
- Vérifiez l'URL Supabase
- Vérifiez la clé anonyme
- Vérifiez que les tables existent
- Vérifiez que RLS est configuré

### **✅ Solution Finale**

Si le problème persiste, exécutez cette séquence :

1. **Arrêter** le serveur
2. **Supprimer** `node_modules/.vite`
3. **Vérifier** `.env.local`
4. **Redémarrer** le serveur
5. **Tester** avec `/test-supabase`

### **📞 Support**

Si le problème persiste :
1. Vérifiez les logs de la console
2. Testez avec la page `/test-supabase`
3. Vérifiez la configuration Supabase
4. Consultez la documentation Supabase

### **🎯 Résultat Attendu**

Après correction, vous devriez voir :
```
✅ Supabase configuré avec succès
✅ Mode en ligne activé (Supabase configuré)
🚀 Application Global Star Distribution démarrée
```

Et l'application devrait fonctionner en mode en ligne avec synchronisation ! 🚀
