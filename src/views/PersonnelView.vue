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
  <div class="space-y-6">
    <!-- En-tête -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">Gestion du Personnel</h2>
        <p class="mt-2 text-gray-600">Suivi des employés et tâches</p>
      </div>
      <button
        @click="openModal()"
        class="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-xl transition-colors"
      >
        <PlusIcon class="h-5 w-5 mr-2" />
        Nouvel employé
      </button>
    </div>

    <!-- Statistiques -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
      <div class="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
        <div class="flex items-center">
          <div class="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
            <UsersIcon class="h-6 w-6 text-blue-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Total employés</p>
            <p class="text-2xl font-bold text-gray-900">{{ totalEmployes }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
        <div class="flex items-center">
          <div class="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center">
            <UserIcon class="h-6 w-6 text-green-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Employés actifs</p>
            <p class="text-2xl font-bold text-gray-900">{{ employesActifs }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
        <div class="flex items-center">
          <div class="h-12 w-12 rounded-xl bg-orange-100 flex items-center justify-center">
            <ClockIcon class="h-6 w-6 text-orange-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Total tâches</p>
            <p class="text-2xl font-bold text-gray-900">{{ totalTaches }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Liste des employés -->
    <div class="space-y-4">
      <div 
        v-for="employe in employes" 
        :key="employe.id"
        class="bg-white rounded-2xl shadow-md border border-gray-100 p-6"
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

    <!-- Modal pour ajouter/éditer -->
    <div v-if="showModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-2xl bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">
            {{ editingEmploye ? 'Modifier l\'employé' : 'Nouvel employé' }}
          </h3>
          
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

            <div class="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                @click="showModal = false"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                class="px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors"
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

