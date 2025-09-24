// Service de gestion de la synchronisation et suppression des données
import { supabase } from '../lib/supabase'
import { storageService } from './storage'

export interface SyncResult {
  success: boolean
  syncedItems: number
  errors: string[]
  deletedItems: number
}

class SyncManager {
  private syncedItems = new Set<string>() // Track des éléments synchronisés
  private syncQueue = new Map<string, any>() // Queue de synchronisation

  constructor() {
    this.loadSyncedItems()
  }

  // Charger les éléments synchronisés depuis localStorage
  private loadSyncedItems() {
    try {
      const saved = localStorage.getItem('synced_items')
      if (saved) {
        const items = JSON.parse(saved)
        this.syncedItems = new Set(items)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des éléments synchronisés:', error)
    }
  }

  // Sauvegarder les éléments synchronisés
  private saveSyncedItems() {
    try {
      localStorage.setItem('synced_items', JSON.stringify([...this.syncedItems]))
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des éléments synchronisés:', error)
    }
  }

  // Marquer un élément comme synchronisé
  markAsSynced(itemId: string, itemType: string) {
    const key = `${itemType}_${itemId}`
    this.syncedItems.add(key)
    this.saveSyncedItems()
  }

  // Vérifier si un élément est synchronisé
  isSynced(itemId: string, itemType: string): boolean {
    const key = `${itemType}_${itemId}`
    return this.syncedItems.has(key)
  }

  // Supprimer un élément synchronisé
  removeSyncedItem(itemId: string, itemType: string) {
    const key = `${itemType}_${itemId}`
    this.syncedItems.delete(key)
    this.saveSyncedItems()
  }

  // Synchroniser et supprimer les données locales
  async syncAndDelete(): Promise<SyncResult> {
    const result: SyncResult = {
      success: false,
      syncedItems: 0,
      errors: [],
      deletedItems: 0
    }

    try {
      console.log('🔄 Début de la synchronisation et suppression...')

      // 1. Synchroniser les articles
      const articlesResult = await this.syncArticles()
      result.syncedItems += articlesResult.synced
      result.deletedItems += articlesResult.deleted
      result.errors.push(...articlesResult.errors)

      // 2. Synchroniser les productions
      const productionsResult = await this.syncProductions()
      result.syncedItems += productionsResult.synced
      result.deletedItems += productionsResult.deleted
      result.errors.push(...productionsResult.errors)

      // 3. Synchroniser les commandes
      const commandesResult = await this.syncCommandes()
      result.syncedItems += commandesResult.synced
      result.deletedItems += commandesResult.deleted
      result.errors.push(...commandesResult.errors)

      // 4. Synchroniser les livraisons
      const livraisonsResult = await this.syncLivraisons()
      result.syncedItems += livraisonsResult.synced
      result.deletedItems += livraisonsResult.deleted
      result.errors.push(...livraisonsResult.errors)

      // 5. Synchroniser les transferts
      const transfertsResult = await this.syncTransferts()
      result.syncedItems += transfertsResult.synced
      result.deletedItems += transfertsResult.deleted
      result.errors.push(...transfertsResult.errors)

      result.success = result.errors.length === 0
      console.log('✅ Synchronisation et suppression terminée')

    } catch (error) {
      console.error('❌ Erreur lors de la synchronisation:', error)
      result.errors.push(`Erreur générale: ${error}`)
    }

    return result
  }

  // Synchroniser les articles
  private async syncArticles(): Promise<{ synced: number, deleted: number, errors: string[] }> {
    const result = { synced: 0, deleted: 0, errors: [] as string[] }
    
    try {
      const articles = storageService.getStock()
      
      for (const article of articles) {
        try {
          // Synchroniser vers Supabase
          const { error } = await supabase
            .from('articles')
            .upsert({
              id: article.id,
              nom: article.nom,
              categorie: article.categorie,
              stock: article.stock,
              seuil_critique: article.seuilCritique,
              unite: article.unite,
              prix: article.prix,
              fournisseur: article.fournisseur,
              derniere_mise_a_jour: article.derniereMiseAJour,
              notes: article.notes,
              type_production: article.typeProduction,
              capacite_production: article.capaciteProduction,
              unite_production: article.uniteProduction,
              cout_production: article.coutProduction,
              temps_production: article.tempsProduction,
              qualite: article.qualite,
              actif: article.actif
            })

          if (error) {
            result.errors.push(`Article ${article.id}: ${error.message}`)
          } else {
            // Marquer comme synchronisé et supprimer localement
            this.markAsSynced(article.id.toString(), 'article')
            storageService.deleteArticle(article.id)
            result.synced++
            result.deleted++
          }
        } catch (error) {
          result.errors.push(`Article ${article.id}: ${error}`)
        }
      }
    } catch (error) {
      result.errors.push(`Erreur articles: ${error}`)
    }

    return result
  }

  // Synchroniser les productions
  private async syncProductions(): Promise<{ synced: number, deleted: number, errors: string[] }> {
    const result = { synced: 0, deleted: 0, errors: [] as string[] }
    
    try {
      const productions = storageService.getProductions()
      
      for (const production of productions) {
        try {
          // Synchroniser vers Supabase
          const { error } = await supabase
            .from('productions')
            .upsert({
              id: production.id,
              date: production.date,
              statut: production.statut,
              lot_id: production.lotId,
              heure_debut: production.heureDebut,
              heure_fin: production.heureFin,
              temps_effectif: production.tempsEffectif
            })

          if (error) {
            result.errors.push(`Production ${production.id}: ${error.message}`)
          } else {
            // Marquer comme synchronisé et supprimer localement
            this.markAsSynced(production.id.toString(), 'production')
            storageService.deleteProduction(production.id)
            result.synced++
            result.deleted++
          }
        } catch (error) {
          result.errors.push(`Production ${production.id}: ${error}`)
        }
      }
    } catch (error) {
      result.errors.push(`Erreur productions: ${error}`)
    }

    return result
  }

  // Synchroniser les commandes
  private async syncCommandes(): Promise<{ synced: number, deleted: number, errors: string[] }> {
    const result = { synced: 0, deleted: 0, errors: [] as string[] }
    
    try {
      const commandes = storageService.getCommandes()
      
      for (const commande of commandes) {
        try {
          // Synchroniser vers Supabase
          const { error } = await supabase
            .from('commandes')
            .upsert({
              id: commande.id,
              numero_commande: commande.numeroCommande,
              date: commande.date,
              client: commande.client,
              telephone: commande.telephone,
              email: commande.email,
              adresse: commande.adresse,
              statut: commande.statut,
              date_livraison_souhaitee: commande.dateLivraisonSouhaitee,
              priorite: commande.priorite
            })

          if (error) {
            result.errors.push(`Commande ${commande.id}: ${error.message}`)
          } else {
            // Marquer comme synchronisé et supprimer localement
            this.markAsSynced(commande.id.toString(), 'commande')
            storageService.deleteCommande(commande.id)
            result.synced++
            result.deleted++
          }
        } catch (error) {
          result.errors.push(`Commande ${commande.id}: ${error}`)
        }
      }
    } catch (error) {
      result.errors.push(`Erreur commandes: ${error}`)
    }

    return result
  }

  // Synchroniser les livraisons
  private async syncLivraisons(): Promise<{ synced: number, deleted: number, errors: string[] }> {
    const result = { synced: 0, deleted: 0, errors: [] as string[] }
    
    try {
      const livraisons = storageService.getLivraisons()
      
      for (const livraison of livraisons) {
        try {
          // Synchroniser vers Supabase
          const { error } = await supabase
            .from('livraisons')
            .upsert({
              id: livraison.id,
              numero_bl: livraison.numeroBL,
              date: livraison.date,
              client: livraison.client,
              telephone: livraison.telephone,
              chauffeur: livraison.chauffeur,
              statut: livraison.statut,
              adresse: livraison.adresse,
              code_suivi: livraison.codeSuivi,
              preuve_depot: livraison.preuveDepot,
              preuve_reception: livraison.preuveReception,
              signature_client: livraison.signatureClient,
              observations: livraison.observations,
              heure_livraison: livraison.heureLivraison,
              date_livraison: livraison.dateLivraison,
              total_commande: livraison.totalCommande,
              total_livraison: livraison.totalLivraison,
              difference_totale: livraison.differenceTotale,
              reste_a_payer_total: livraison.resteAPayerTotal,
              cloturee: livraison.cloturee,
              date_cloture_manuelle: livraison.dateClotureManuelle,
              notes_cloture: livraison.notesCloture
            })

          if (error) {
            result.errors.push(`Livraison ${livraison.id}: ${error.message}`)
          } else {
            // Marquer comme synchronisé et supprimer localement
            this.markAsSynced(livraison.id.toString(), 'livraison')
            storageService.deleteLivraison(livraison.id)
            result.synced++
            result.deleted++
          }
        } catch (error) {
          result.errors.push(`Livraison ${livraison.id}: ${error}`)
        }
      }
    } catch (error) {
      result.errors.push(`Erreur livraisons: ${error}`)
    }

    return result
  }

  // Synchroniser les transferts
  private async syncTransferts(): Promise<{ synced: number, deleted: number, errors: string[] }> {
    const result = { synced: 0, deleted: 0, errors: [] as string[] }
    
    try {
      const transferts = storageService.getTransferts()
      
      for (const transfert of transferts) {
        try {
          // Synchroniser vers Supabase
          const { error } = await supabase
            .from('transferts')
            .upsert({
              id: transfert.id,
              numero_bordereau: transfert.numeroBordereau,
              date: transfert.date,
              client: transfert.client,
              telephone: transfert.telephone,
              email: transfert.email,
              adresse: transfert.adresse,
              chauffeur_nom: transfert.chauffeur?.nom,
              chauffeur_telephone: transfert.chauffeur?.telephone,
              statut: transfert.statut,
              notes: transfert.notes
            })

          if (error) {
            result.errors.push(`Transfert ${transfert.id}: ${error.message}`)
          } else {
            // Marquer comme synchronisé et supprimer localement
            this.markAsSynced(transfert.id.toString(), 'transfert')
            storageService.supprimerTransfert(transfert.id)
            result.synced++
            result.deleted++
          }
        } catch (error) {
          result.errors.push(`Transfert ${transfert.id}: ${error}`)
        }
      }
    } catch (error) {
      result.errors.push(`Erreur transferts: ${error}`)
    }

    return result
  }

  // Obtenir les statistiques de synchronisation
  getSyncStats() {
    return {
      syncedItems: this.syncedItems.size,
      queueSize: this.syncQueue.size,
      totalLocalItems: this.getTotalLocalItems()
    }
  }

  // Obtenir le nombre total d'éléments locaux
  private getTotalLocalItems(): number {
    return (
      storageService.getStock().length +
      storageService.getProductions().length +
      storageService.getCommandes().length +
      storageService.getLivraisons().length +
      storageService.getTransferts().length
    )
  }

  // Vider tous les éléments synchronisés
  clearSyncedItems() {
    this.syncedItems.clear()
    this.saveSyncedItems()
    console.log('🗑️ Éléments synchronisés vidés')
  }

  // Obtenir la liste des éléments synchronisés
  getSyncedItems(): string[] {
    return [...this.syncedItems]
  }
}

// Instance singleton
export const syncManager = new SyncManager()

// Composable Vue pour utiliser le service
export const useSyncManager = () => {
  return {
    syncAndDelete: () => syncManager.syncAndDelete(),
    getSyncStats: () => syncManager.getSyncStats(),
    clearSyncedItems: () => syncManager.clearSyncedItems(),
    getSyncedItems: () => syncManager.getSyncedItems(),
    isSynced: (itemId: string, itemType: string) => syncManager.isSynced(itemId, itemType),
    markAsSynced: (itemId: string, itemType: string) => syncManager.markAsSynced(itemId, itemType)
  }
}
