<script setup lang="ts">
import { ref } from 'vue'
import { 
  Cog6ToothIcon,
  UserIcon,
  BellIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon
} from '@heroicons/vue/24/outline'

const activeTab = ref('general')

const tabs = [
  { id: 'general', name: 'Général', icon: Cog6ToothIcon },
  { id: 'utilisateurs', name: 'Utilisateurs', icon: UserIcon },
  { id: 'notifications', name: 'Notifications', icon: BellIcon },
  { id: 'securite', name: 'Sécurité', icon: ShieldCheckIcon },
  { id: 'apparence', name: 'Apparence', icon: GlobeAltIcon }
]

const settings = ref({
  nomEntreprise: 'BriqueApp Production',
  adresse: '123 Rue de la Production, 75001 Paris',
  telephone: '+33 1 23 45 67 89',
  email: 'contact@briqueapp.com',
  devise: 'EUR',
  langue: 'fr',
  fuseauHoraire: 'Europe/Paris',
  notificationsEmail: true,
  notificationsPush: true,
  notificationsWhatsApp: false,
  themeSombre: false,
  modeOffline: true
})

const utilisateurs = ref([
  {
    id: 1,
    nom: 'Admin',
    email: 'admin@briqueapp.com',
    role: 'Super Admin',
    statut: 'actif',
    derniereConnexion: '2024-01-16 14:30'
  },
  {
    id: 2,
    nom: 'Manager',
    email: 'manager@briqueapp.com',
    role: 'Admin',
    statut: 'actif',
    derniereConnexion: '2024-01-16 12:15'
  },
  {
    id: 3,
    nom: 'Secretaire',
    email: 'secretaire@briqueapp.com',
    role: 'Secrétaire',
    statut: 'actif',
    derniereConnexion: '2024-01-16 10:45'
  }
])

const roles = [
  'Super Admin',
  'Admin',
  'Secrétaire',
  'Livreur'
]

const saveSettings = () => {
  // Simulation de sauvegarde
  alert('Paramètres sauvegardés avec succès !')
}

const toggleTheme = () => {
  settings.value.themeSombre = !settings.value.themeSombre
  // Ici on pourrait appliquer le thème sombre
}
</script>

<template>
  <div class="space-y-6">
    <!-- En-tête -->
    <div class="mb-8">
      <h2 class="text-2xl font-bold text-gray-900">Paramètres</h2>
      <p class="mt-2 text-gray-600">Configuration de l'application</p>
    </div>

    <!-- Onglets -->
    <div class="bg-white rounded-2xl shadow-md border border-gray-100">
      <div class="border-b border-gray-200">
        <nav class="flex space-x-8 px-6" aria-label="Tabs">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            class="flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors"
            :class="[
              activeTab === tab.id
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
          >
            <component :is="tab.icon" class="h-5 w-5 mr-2" />
            {{ tab.name }}
          </button>
        </nav>
      </div>

      <div class="p-6">
        <!-- Onglet Général -->
        <div v-if="activeTab === 'general'" class="space-y-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Paramètres généraux</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nom de l'entreprise</label>
              <input
                v-model="settings.nomEntreprise"
                type="text"
                class="w-full rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
              <input
                v-model="settings.adresse"
                type="text"
                class="w-full rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
              <input
                v-model="settings.telephone"
                type="tel"
                class="w-full rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                v-model="settings.email"
                type="email"
                class="w-full rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Devise</label>
              <select
                v-model="settings.devise"
                class="w-full rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500"
              >
                <option value="EUR">EUR (€)</option>
                <option value="USD">USD ($)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Langue</label>
              <select
                v-model="settings.langue"
                class="w-full rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500"
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
                <option value="es">Español</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Onglet Utilisateurs -->
        <div v-if="activeTab === 'utilisateurs'" class="space-y-6">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900">Gestion des utilisateurs</h3>
            <button class="inline-flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-xl transition-colors">
              <UserIcon class="h-5 w-5 mr-2" />
              Nouvel utilisateur
            </button>
          </div>
          
          <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilisateur</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rôle</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dernière connexion</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="utilisateur in utilisateurs" :key="utilisateur.id" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div class="text-sm font-medium text-gray-900">{{ utilisateur.nom }}</div>
                      <div class="text-sm text-gray-500">{{ utilisateur.email }}</div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {{ utilisateur.role }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span 
                      class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                      :class="utilisateur.statut === 'actif' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                    >
                      {{ utilisateur.statut === 'actif' ? 'Actif' : 'Inactif' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ utilisateur.derniereConnexion }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button class="text-orange-600 hover:text-orange-900 mr-3">Modifier</button>
                    <button class="text-red-600 hover:text-red-900">Supprimer</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Onglet Notifications -->
        <div v-if="activeTab === 'notifications'" class="space-y-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Configuration des notifications</h3>
          
          <div class="space-y-4">
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div class="flex items-center">
                <BellIcon class="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p class="text-sm font-medium text-gray-900">Notifications par email</p>
                  <p class="text-sm text-gray-500">Recevoir les alertes par email</p>
                </div>
              </div>
              <button
                @click="settings.notificationsEmail = !settings.notificationsEmail"
                class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                :class="settings.notificationsEmail ? 'bg-orange-500' : 'bg-gray-200'"
              >
                <span
                  class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                  :class="settings.notificationsEmail ? 'translate-x-6' : 'translate-x-1'"
                ></span>
              </button>
            </div>

            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div class="flex items-center">
                <DevicePhoneMobileIcon class="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p class="text-sm font-medium text-gray-900">Notifications push</p>
                  <p class="text-sm text-gray-500">Alertes sur l'appareil</p>
                </div>
              </div>
              <button
                @click="settings.notificationsPush = !settings.notificationsPush"
                class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                :class="settings.notificationsPush ? 'bg-orange-500' : 'bg-gray-200'"
              >
                <span
                  class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                  :class="settings.notificationsPush ? 'translate-x-6' : 'translate-x-1'"
                ></span>
              </button>
            </div>

            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div class="flex items-center">
                <GlobeAltIcon class="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p class="text-sm font-medium text-gray-900">Notifications WhatsApp</p>
                  <p class="text-sm text-gray-500">Alertes via WhatsApp</p>
                </div>
              </div>
              <button
                @click="settings.notificationsWhatsApp = !settings.notificationsWhatsApp"
                class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                :class="settings.notificationsWhatsApp ? 'bg-orange-500' : 'bg-gray-200'"
              >
                <span
                  class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                  :class="settings.notificationsWhatsApp ? 'translate-x-6' : 'translate-x-1'"
                ></span>
              </button>
            </div>
          </div>
        </div>

        <!-- Onglet Sécurité -->
        <div v-if="activeTab === 'securite'" class="space-y-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Sécurité et accès</h3>
          
          <div class="space-y-4">
            <div class="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div class="flex">
                <ShieldCheckIcon class="h-5 w-5 text-blue-400 mr-3 mt-0.5" />
                <div>
                  <h4 class="text-sm font-medium text-blue-900">Mode hors ligne</h4>
                  <p class="text-sm text-blue-700 mt-1">
                    Permettre l'utilisation de l'application sans connexion internet
                  </p>
                  <button
                    @click="settings.modeOffline = !settings.modeOffline"
                    class="mt-2 relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                    :class="settings.modeOffline ? 'bg-blue-500' : 'bg-gray-200'"
                  >
                    <span
                      class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                      :class="settings.modeOffline ? 'translate-x-6' : 'translate-x-1'"
                    ></span>
                  </button>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Changer le mot de passe</label>
                <button class="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                  Modifier le mot de passe
                </button>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Authentification à deux facteurs</label>
                <button class="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                  Configurer 2FA
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Onglet Apparence -->
        <div v-if="activeTab === 'apparence'" class="space-y-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Apparence et thème</h3>
          
          <div class="space-y-4">
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div class="flex items-center">
                <GlobeAltIcon class="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p class="text-sm font-medium text-gray-900">Mode sombre</p>
                  <p class="text-sm text-gray-500">Activer le thème sombre</p>
                </div>
              </div>
              <button
                @click="toggleTheme"
                class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                :class="settings.themeSombre ? 'bg-orange-500' : 'bg-gray-200'"
              >
                <span
                  class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                  :class="settings.themeSombre ? 'translate-x-6' : 'translate-x-1'"
                ></span>
              </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Taille de police</label>
                <select class="w-full rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500">
                  <option>Petite</option>
                  <option selected>Moyenne</option>
                  <option>Grande</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Densité d'affichage</label>
                <select class="w-full rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500">
                  <option>Compact</option>
                  <option selected>Normal</option>
                  <option>Étendu</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Bouton de sauvegarde -->
        <div class="flex justify-end pt-6 border-t border-gray-200">
          <button
            @click="saveSettings"
            class="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-xl transition-colors"
          >
            Sauvegarder les paramètres
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

