<script setup lang="ts">
import { ref } from 'vue'
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  UsersIcon,
  ClockIcon,
  CheckCircleIcon,
  UserIcon
} from '@heroicons/vue/24/outline'

interface Employe {
  id: number
  nom: string
  prenom: string
  poste: string
  telephone: string
  email: string
  dateEmbauche: string
  statut: 'actif' | 'inactif'
  taches: Array<{
    id: number
    description: string
    statut: 'en_cours' | 'termine' | 'en_attente'
    date: string
  }>
}

const employes = ref<Employe[]>([
  {
    id: 1,
    nom: 'Dupont',
    prenom: 'Jean',
    poste: 'Ouvrier production',
    telephone: '+33 6 12 34 56 78',
    email: 'jean.dupont@briqueapp.com',
    dateEmbauche: '2023-01-15',
    statut: 'actif',
    taches: [
      { id: 1, description: 'Production briques standard', statut: 'termine', date: '2024-01-15' },
      { id: 2, description: 'Contrôle qualité', statut: 'en_cours', date: '2024-01-16' }
    ]
  },
  {
    id: 2,
    nom: 'Martin',
    prenom: 'Marie',
    poste: 'Chauffeur livraison',
    telephone: '+33 6 98 76 54 32',
    email: 'marie.martin@briqueapp.com',
    dateEmbauche: '2023-03-20',
    statut: 'actif',
    taches: [
      { id: 3, description: 'Livraison client Dubois', statut: 'en_cours', date: '2024-01-16' }
    ]
  }
])

const showModal = ref(false)
const editingEmploye = ref<Employe | null>(null)

const newEmploye = ref({
  nom: '',
  prenom: '',
  poste: '',
  telephone: '',
  email: '',
  dateEmbauche: '',
  statut: 'actif' as const
})

const postes = [
  'Ouvrier production',
  'Chauffeur livraison',
  'Manager production',
  'Contrôleur qualité',
  'Magasinier',
  'Administratif'
]

const openModal = (employe?: Employe) => {
  if (employe) {
    editingEmploye.value = employe
    newEmploye.value = { 
      ...employe,
      statut: employe.statut === 'inactif' ? 'actif' : employe.statut // Convertir inactif en actif pour le formulaire
    }
  } else {
    editingEmploye.value = null
    newEmploye.value = {
      nom: '',
      prenom: '',
      poste: '',
      telephone: '',
      email: '',
      dateEmbauche: '',
      statut: 'actif'
    }
  }
  showModal.value = true
}

const saveEmploye = () => {
  if (editingEmploye.value) {
    const index = employes.value.findIndex(e => e.id === editingEmploye.value!.id)
    employes.value[index] = { ...newEmploye.value, id: editingEmploye.value.id, taches: editingEmploye.value.taches }
  } else {
    const newId = Math.max(...employes.value.map(e => e.id)) + 1
    employes.value.push({ ...newEmploye.value, id: newId, taches: [] })
  }
  showModal.value = false
  editingEmploye.value = null
}

const deleteEmploye = (id: number) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer cet employé ?')) {
    employes.value = employes.value.filter(e => e.id !== id)
  }
}

const totalEmployes = employes.value.length
const employesActifs = employes.value.filter(e => e.statut === 'actif').length
const totalTaches = employes.value.reduce((sum, e) => sum + e.taches.length, 0)
</script>

<template>
  <div class="space-y-8">
    <!-- En-tête amélioré -->
    <div class="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-3xl p-8 border border-purple-100">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div class="mb-6 lg:mb-0">
          <div class="flex items-center mb-3">
            <div class="h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center mr-4">
              <UsersIcon class="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 class="text-3xl font-bold text-gray-900">Gestion du Personnel</h1>
              <p class="text-gray-600 font-medium">Suivi des employés et gestion des tâches</p>
            </div>
          </div>
          <div class="flex items-center space-x-6 text-sm">
            <div class="flex items-center text-gray-600">
              <ClockIcon class="h-4 w-4 mr-1" />
              <span>{{ new Date().toLocaleDateString('fr-FR') }}</span>
            </div>
            <div class="flex items-center text-gray-600">
              <CheckCircleIcon class="h-4 w-4 mr-1" />
              <span>{{ employesActifs }} employé(s) actif(s)</span>
            </div>
          </div>
        </div>
        <button
          @click="openModal()"
          class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-semibold rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <PlusIcon class="h-5 w-5 mr-2" />
          Nouvel employé
        </button>
      </div>
    </div>

    <!-- Statistiques améliorées -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 group hover:border-blue-200">
        <div class="flex items-center justify-between">
          <div>
            <div class="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
              <UsersIcon class="h-7 w-7 text-white" />
            </div>
            <p class="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total employés</p>
            <p class="text-3xl font-bold text-gray-900 mt-1">{{ totalEmployes }}</p>
          </div>
          <div class="text-right">
            <div class="h-2 w-16 bg-blue-200 rounded-full overflow-hidden">
              <div class="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full" style="width: 100%"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 group hover:border-green-200">
        <div class="flex items-center justify-between">
          <div>
            <div class="h-14 w-14 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
              <UserIcon class="h-7 w-7 text-white" />
            </div>
            <p class="text-sm font-semibold text-gray-600 uppercase tracking-wide">Employés actifs</p>
            <p class="text-3xl font-bold text-gray-900 mt-1">{{ employesActifs }}</p>
          </div>
          <div class="text-right">
            <div class="h-2 w-16 bg-green-200 rounded-full overflow-hidden">
              <div class="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full" :style="{ width: `${Math.round((employesActifs / totalEmployes) * 100)}%` }"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 group hover:border-orange-200">
        <div class="flex items-center justify-between">
          <div>
            <div class="h-14 w-14 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
              <ClockIcon class="h-7 w-7 text-white" />
            </div>
            <p class="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total tâches</p>
            <p class="text-3xl font-bold text-gray-900 mt-1">{{ totalTaches }}</p>
          </div>
          <div class="text-right">
            <div class="h-2 w-16 bg-orange-200 rounded-full overflow-hidden">
              <div class="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full" style="width: 75%"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 group hover:border-purple-200">
        <div class="flex items-center justify-between">
          <div>
            <div class="h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
              <CheckCircleIcon class="h-7 w-7 text-white" />
            </div>
            <p class="text-sm font-semibold text-gray-600 uppercase tracking-wide">Tâches en cours</p>
            <p class="text-3xl font-bold text-gray-900 mt-1">{{ employes.reduce((sum, e) => sum + e.taches.filter(t => t.statut === 'en_cours').length, 0) }}</p>
          </div>
          <div class="text-right">
            <div class="h-2 w-16 bg-purple-200 rounded-full overflow-hidden">
              <div class="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full" style="width: 60%"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Liste des employés améliorée -->
    <div class="bg-white rounded-3xl shadow-lg p-8 border border-gray-100">
      <div class="mb-6">
        <h3 class="text-xl font-bold text-gray-900 mb-2">Équipe</h3>
        <p class="text-gray-600">{{ employes.length }} employé(s) enregistré(s)</p>
      </div>
      <div class="space-y-6">
        <div
          v-for="employe in employes"
          :key="employe.id"
          class="bg-gradient-to-r from-gray-50 to-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 p-6 border border-gray-200 hover:border-purple-200 hover:-translate-y-1"
        >
        <div class="flex items-start justify-between mb-4">
          <div class="flex-1">
            <div class="flex items-center space-x-3 mb-2">
              <h4 class="text-lg font-semibold text-gray-900">{{ employe.prenom }} {{ employe.nom }}</h4>
              <span 
                class="inline-flex px-2 py-1 text-xs font-medium rounded-full"
                :class="employe.statut === 'actif' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
              >
                {{ employe.statut === 'actif' ? 'Actif' : 'Inactif' }}
              </span>
            </div>
            <p class="text-sm text-gray-600">{{ employe.poste }}</p>
          </div>
          <div class="flex items-center space-x-2">
            <button
              @click="openModal(employe)"
              class="text-orange-600 hover:text-orange-900"
              title="Modifier"
            >
              <PencilIcon class="h-4 w-4" />
            </button>
            <button
              @click="deleteEmploye(employe.id)"
              class="text-red-600 hover:text-red-900"
              title="Supprimer"
            >
              <TrashIcon class="h-4 w-4" />
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <p class="text-sm font-medium text-gray-700">Téléphone</p>
            <p class="text-sm text-gray-900">{{ employe.telephone }}</p>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-700">Email</p>
            <p class="text-sm text-gray-900">{{ employe.email }}</p>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-700">Date d'embauche</p>
            <p class="text-sm text-gray-900">{{ new Date(employe.dateEmbauche).toLocaleDateString('fr-FR') }}</p>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-700">Tâches en cours</p>
            <p class="text-sm text-gray-900">{{ employe.taches.filter(t => t.statut === 'en_cours').length }}</p>
          </div>
        </div>

        <div v-if="employe.taches.length > 0">
          <h5 class="text-sm font-medium text-gray-700 mb-2">Tâches récentes</h5>
          <div class="space-y-2">
            <div 
              v-for="tache in employe.taches.slice(0, 3)" 
              :key="tache.id"
              class="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
            >
              <span class="text-sm text-gray-900">{{ tache.description }}</span>
              <div class="flex items-center space-x-2">
                <span 
                  class="inline-flex px-2 py-1 text-xs font-medium rounded-full"
                  :class="{
                    'bg-yellow-100 text-yellow-800': tache.statut === 'en_attente',
                    'bg-blue-100 text-blue-800': tache.statut === 'en_cours',
                    'bg-green-100 text-green-800': tache.statut === 'termine'
                  }"
                >
                  {{ tache.statut === 'en_attente' ? 'En attente' : tache.statut === 'en_cours' ? 'En cours' : 'Terminé' }}
                </span>
                <span class="text-xs text-gray-500">{{ new Date(tache.date).toLocaleDateString('fr-FR') }}</span>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>

    <!-- Modal pour ajouter/éditer amélioré -->
    <div v-if="showModal" class="fixed inset-0 bg-gray-900 bg-opacity-75 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div class="relative mx-auto border w-full max-w-2xl shadow-2xl rounded-3xl bg-white animate-in zoom-in-95 duration-200">
        <!-- Header modal -->
        <div class="bg-gradient-to-r from-purple-500 to-indigo-500 p-6 rounded-t-3xl">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="h-10 w-10 rounded-xl bg-white bg-opacity-20 flex items-center justify-center">
                <UsersIcon class="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 class="text-xl font-bold text-white">
                  {{ editingEmploye ? 'Modifier l\'employé' : 'Nouvel employé' }}
                </h3>
                <p class="text-purple-100 text-sm">Gestion des informations personnelles</p>
              </div>
            </div>
            <button
              @click="showModal = false"
              class="text-white hover:text-purple-200 transition-colors p-2 rounded-lg hover:bg-white hover:bg-opacity-20"
            >
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Content modal -->
        <div class="p-6">
          
          <form @submit.prevent="saveEmploye" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                <input
                  v-model="newEmploye.prenom"
                  type="text"
                  required
                  class="w-full rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                <input
                  v-model="newEmploye.nom"
                  type="text"
                  required
                  class="w-full rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Poste</label>
                <select
                  v-model="newEmploye.poste"
                  required
                  class="w-full rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                >
                  <option value="">Sélectionner un poste</option>
                  <option v-for="poste in postes" :key="poste" :value="poste">
                    {{ poste }}
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                <select
                  v-model="newEmploye.statut"
                  required
                  class="w-full rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                >
                  <option value="actif">Actif</option>
                  <option value="inactif">Inactif</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                <input
                  v-model="newEmploye.telephone"
                  type="tel"
                  required
                  class="w-full rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  v-model="newEmploye.email"
                  type="email"
                  required
                  class="w-full rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Date d'embauche</label>
              <input
                v-model="newEmploye.dateEmbauche"
                type="date"
                required
                class="w-full rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500"
              />
            </div>

            <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                @click="showModal = false"
                class="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200 hover:shadow-md"
              >
                Annuler
              </button>
              <button
                type="submit"
                class="px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {{ editingEmploye ? 'Modifier' : 'Ajouter' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

