<script setup lang="ts">
import { computed } from 'vue'
import { useRoles } from '../services/roles'
import type { UserRole } from '../lib/supabase'

interface Props {
  requiredRoles?: UserRole[]
  requiredPermissions?: string[]
  fallbackMessage?: string
  showFallback?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  requiredRoles: () => [],
  requiredPermissions: () => [],
  fallbackMessage: 'Accès non autorisé',
  showFallback: true
})

const { hasAnyRole, hasPermission } = useRoles()

const hasAccess = computed(() => {
  // Vérifier les rôles si spécifiés
  if (props.requiredRoles.length > 0 && !hasAnyRole(props.requiredRoles)) {
    return false
  }

  // Vérifier les permissions si spécifiées
  if (props.requiredPermissions.length > 0) {
    for (const permission of props.requiredPermissions) {
      if (!hasPermission(permission as any)) {
        return false
      }
    }
  }

  return true
})
</script>

<template>
  <div v-if="hasAccess">
    <slot />
  </div>
  <div v-else-if="showFallback" class="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
    <div class="flex">
      <div class="flex-shrink-0">
        <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
      </div>
      <div class="ml-3">
        <h3 class="text-sm font-medium text-yellow-800">
          {{ fallbackMessage }}
        </h3>
        <div class="mt-2 text-sm text-yellow-700">
          <p>Vous n'avez pas les permissions nécessaires pour accéder à cette fonctionnalité.</p>
        </div>
      </div>
    </div>
  </div>
</template>
