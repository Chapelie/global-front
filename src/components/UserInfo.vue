<script setup lang="ts">
import { computed } from 'vue'
import { useAuth } from '../services/auth'
import { useRoles } from '../services/roles'
import { UserIcon, Cog6ToothIcon } from '@heroicons/vue/24/outline'

const { user, signOut } = useAuth()
const { currentRole, roleDisplayName, roleColor } = useRoles()

const userDisplayName = computed(() => {
  if (user.value?.user_metadata?.first_name && user.value?.user_metadata?.last_name) {
    return `${user.value.user_metadata.first_name} ${user.value.user_metadata.last_name}`
  }
  return user.value?.email || 'Utilisateur'
})

const handleSignOut = async () => {
  try {
    await signOut()
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error)
  }
}
</script>

<template>
  <div class="flex items-center space-x-4">
    <!-- Informations utilisateur -->
    <div class="flex items-center space-x-3">
      <div class="flex-shrink-0">
        <div class="h-8 w-8 rounded-full bg-orange-500 flex items-center justify-center">
          <UserIcon class="h-5 w-5 text-white" />
        </div>
      </div>
      <div class="flex flex-col">
        <span class="text-sm font-medium text-gray-900">{{ userDisplayName }}</span>
        <span class="text-xs text-gray-500">{{ user?.email }}</span>
      </div>
    </div>

    <!-- Badge du rôle -->
    <div class="flex items-center space-x-2">
      <span 
        :class="[
          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
          roleColor
        ]"
      >
        {{ roleDisplayName }}
      </span>
    </div>

    <!-- Menu utilisateur -->
    <div class="relative">
      <button
        type="button"
        class="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700 focus:outline-none"
      >
        <Cog6ToothIcon class="h-4 w-4" />
        <span>Paramètres</span>
      </button>
    </div>

    <!-- Bouton de déconnexion -->
    <button
      @click="handleSignOut"
      class="text-sm text-red-600 hover:text-red-800 focus:outline-none"
    >
      Déconnexion
    </button>
  </div>
</template>
