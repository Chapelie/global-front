// Initialisation des fonctions globales

import {
  CompleteArticle,
  CompleteProduction,
  CompleteLivraison,
  CompleteCommande,
  updateAnalyse,
  addAnalyse,
  deleteAnalyseService,
  updateUser,
  createUser,
  deleteUser,
  getMode
} from './services/missingServices'

import { useLaravelApi } from './services/laravelApiService'

// Rendre les fonctions disponibles globalement
;(globalThis as any).CompleteArticle = CompleteArticle
;(globalThis as any).CompleteProduction = CompleteProduction
;(globalThis as any).CompleteLivraison = CompleteLivraison
;(globalThis as any).CompleteCommande = CompleteCommande
;(globalThis as any).updateAnalyse = updateAnalyse
;(globalThis as any).addAnalyse = addAnalyse
;(globalThis as any).deleteAnalyseService = deleteAnalyseService
;(globalThis as any).updateUser = updateUser
;(globalThis as any).createUser = createUser
;(globalThis as any).deleteUser = deleteUser
;(globalThis as any).getMode = getMode

// Fonctions API
const api = useLaravelApi()
;(globalThis as any).getAnalyses = api.getAnalyses
;(globalThis as any).getProductions = api.getProductions




