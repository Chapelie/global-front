# 📱 Global Star Distribution - Frontend (Vue 3 + Capacitor)

**Build :** `global-star-frontend-v2.1.0`  
**Version :** 2.1.0  
**Date :** 2025-01-28

Application frontend Vue.js 3 avec Capacitor pour le déploiement mobile (iOS et Android).

## 🚀 Démarrage Rapide

### Installation

```sh
npm install
```

### Développement

```sh
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

### Build Production

```sh
npm run build
```

Les fichiers de production seront générés dans le dossier `dist/`

---

## 📦 Capacitor - Build Mobile

### Prérequis

#### Pour iOS
- **macOS** (requis pour développer iOS)
- **Xcode** 14+ installé depuis l'App Store
- **CocoaPods** installé : `sudo gem install cocoapods`
- **Node.js** 20.19.0+ ou 22.12.0+

#### Pour Android
- **Android Studio** installé
- **Java JDK** 17+ installé
- **Android SDK** configuré
- **Node.js** 20.19.0+ ou 22.12.0+

### Installation Capacitor

Les dépendances Capacitor sont déjà installées. Si besoin :

```sh
npm install @capacitor/core @capacitor/cli
npm install @capacitor/ios @capacitor/android
```

---

## 🎯 Génération des Icônes

Avant de build l'application mobile, générez les icônes et splash screens :

```sh
# Générer toutes les icônes (iOS, Android, Web)
npx capacitor-assets generate
```

Cette commande va :
- ✅ Générer les icônes iOS (toutes les tailles)
- ✅ Générer les icônes Android (toutes les densités)
- ✅ Générer les icônes web PWA
- ✅ Générer les splash screens

**Note :** Assurez-vous d'avoir une image source de haute qualité mais l'image est deja set jsute lancer la commande dans `src/assets/logo.jpeg` (minimum 1024x1024 pixels).

---

## 🚀 Build Production

### 🍎 Build iOS - Production

#### 1. Préparation

```sh
# Build l'application web
npm run build

# Synchroniser avec Capacitor
npm run cap:sync
```

Ou en une seule commande :

```sh
npm run cap:build
```

#### 2. Installer les dépendances CocoaPods

```sh
cd ios/App
pod install
cd ../..
```

#### 3. Ouvrir dans Xcode

```sh
npm run cap:ios
```

#### 4. Configuration dans Xcode

##### 4.1. Configurer le Signing

1. **Sélectionner le projet** dans le navigateur Xcode
2. **Onglet "Signing & Capabilities"**
3. **Cocher "Automatically manage signing"**
4. **Sélectionner votre Team** (Apple Developer Account)
5. **Bundle Identifier** : `com.globalstar.distribution` (doit être unique)

##### 4.2. Configurer les Capabilities

Si nécessaire, ajoutez les capabilities :
- **Push Notifications** (si utilisé)
- **Background Modes**
- **Keychain Sharing**

#### 5. Archiver pour App Store

Pour distribuer sur l'App Store :

1. **Product > Archive**
2. **Attendre** la fin de l'archivage
3. **Window > Organizer** s'ouvre automatiquement
4. **Sélectionner l'archive**
5. **Distribute App**
6. **Suivre l'assistant** :
   - App Store Connect
   - Ad Hoc (test interne)
   - Enterprise
   - Development (test)

#### Commandes utiles iOS Production

```sh
# Build et sync
npm run cap:build

# Ouvrir Xcode
npx cap open ios

# Installer les pods
cd ios/App && pod install && cd ../..

# Vérifier la configuration
npx cap doctor
```

---

### 🤖 Build Android - Production

#### 1. Préparation

```sh
# Build l'application web
npm run build

# Synchroniser avec Capacitor
npm run cap:sync
```

Ou en une seule commande :

```sh
npm run cap:build
```

#### 2. Ouvrir dans Android Studio

```sh
npm run cap:android
```

#### 3. Générer un APK/AAB signé

Pour distribuer l'application :

1. **Build > Generate Signed Bundle / APK**
2. **Choisir** APK ou Android App Bundle (AAB)
3. **Créer ou sélectionner** un keystore
4. **Suivre l'assistant** de signature
5. **Le fichier** sera généré dans `android/app/release/`

#### Commandes utiles Android Production

```sh
# Build et sync
npm run cap:build

# Ouvrir Android Studio
npx cap open android

# Vérifier la configuration
npx cap doctor
```

---

## 💻 Build Local / Développement

### 🍎 Build iOS - Local

#### 1. Synchroniser Capacitor

```sh
# Build l'application web
npm run build

# Synchroniser avec Capacitor
npm run cap:sync
```

Ou en une seule commande :

```sh
npm run cap:build
```

#### 2. Installer les dépendances CocoaPods

```sh
cd ios/App
pod install
cd ../..
```

**Note :** Cette étape est nécessaire après chaque `cap sync` si des plugins natifs ont été ajoutés.

#### 3. Ouvrir dans Xcode

```sh
npm run cap:ios
```

Cette commande va :
- Build l'application
- Synchroniser avec Capacitor
- Ouvrir Xcode automatiquement

#### 4. Build et Run

1. **Sélectionner un appareil** ou simulateur dans la barre d'outils
2. **Cliquer sur Run** (▶️) ou `Cmd + R`
3. **Attendre** la compilation et l'installation

#### Commandes utiles iOS Local

```sh
# Synchroniser uniquement
npm run cap:sync

# Build et sync
npm run cap:build

# Ouvrir Xcode
npx cap open ios

# Installer les pods
cd ios/App && pod install && cd ../..
```

---

### 🤖 Build Android - Local

#### 1. Synchroniser Capacitor

```sh
# Build l'application web
npm run build

# Synchroniser avec Capacitor
npm run cap:sync
```

Ou en une seule commande :

```sh
npm run cap:build
```

#### 2. Ouvrir dans Android Studio

```sh
npm run cap:android
```

Cette commande va :
- Build l'application
- Synchroniser avec Capacitor
- Ouvrir Android Studio automatiquement

#### 3. Build dans Android Studio

1. **Ouvrir Android Studio** (si pas déjà ouvert)
2. **Attendre la synchronisation** Gradle
3. **Connecter un appareil** ou lancer un émulateur
4. **Cliquer sur Run** (▶️) ou `Shift + F10`
5. **Sélectionner l'appareil** cible

#### Commandes utiles Android Local

```sh
# Synchroniser uniquement
npm run cap:sync

# Build et sync
npm run cap:build

# Ouvrir Android Studio
npx cap open android

# Vérifier la configuration
npx cap doctor
```

---

## 🔧 Configuration Capacitor

### Fichier `capacitor.config.ts`

La configuration Capacitor se trouve dans `capacitor.config.ts` :

```typescript
{
  appId: 'com.globalstar.distribution',
  appName: 'Global Star Distribution',
  webDir: 'dist',
  // ...
}
```

### Variables d'environnement

Créez un fichier `.env.local` pour la configuration :

```env
VITE_API_URL=http://localhost:8000/api
```

---

## 📝 Scripts Disponibles

| Commande | Description |
|----------|-------------|
| `npm run dev` | Démarre le serveur de développement |
| `npm run build` | Build de production (type-check + build) |
| `npm run build-only` | Build uniquement (sans type-check) |
| `npm run preview` | Preview du build de production |
| `npm run type-check` | Vérification TypeScript |
| `npm run cap:sync` | Synchronise Capacitor |
| `npm run cap:build` | Build + synchronise Capacitor |
| `npm run cap:ios` | Build + ouvre Xcode |
| `npm run cap:android` | Build + ouvre Android Studio |

---

## 🐛 Dépannage

### Erreur "Pod install failed"

```sh
cd ios/App
pod deintegrate
pod install
cd ../..
```

### Erreur "Gradle sync failed"

1. Ouvrir Android Studio
2. **File > Invalidate Caches / Restart**
3. Attendre la resynchronisation

### Icônes non générées

```sh
# Vérifier que le logo existe
ls src/assets/logo.jpeg

# Régénérer les icônes
npx capacitor-assets generate
```

### Capacitor sync échoue

```sh
# Nettoyer et resynchroniser
rm -rf ios android
npm run cap:build
```

### Xcode ne trouve pas les pods

```sh
cd ios/App
pod install --repo-update
cd ../..
```

---

