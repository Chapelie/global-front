// Service hybride complet pour toutes les données
import { ref } from 'vue'
import { supabase } from '../lib/supabase'
import { useAuth } from './auth'
import { isSupabaseConfigured } from '../config/app-config'

// ===== INTERFACES =====

export interface CompleteArticle {
  id?: string
  nom: string
  categorie: string
  stock: number
  seuilCritique: number
  unite: string
  prix: number
  fournisseur?: string
  notes?: string
  typeProduction?: string
  capaciteProduction?: number
  uniteProduction?: string
  coutProduction?: number
  tempsProduction?: number
  qualite?: string
  actif?: boolean
  derniereMiseAJour?: string
  user_id?: string
}

export interface CompleteCommande {
  id?: string
  numeroCommande: string
  client: string
  telephone: string
  email: string
  adresse: string
  produits: Array<{
    nom: string
    quantite: number
    unite: string
  }>
  statut: 'en_attente' | 'confirmee' | 'en_preparation' | 'livree' | 'annulee'
  date: string
  dateLivraisonSouhaitee?: string
  priorite: 'basse' | 'normale' | 'haute' | 'urgente'
  user_id?: string
}

export interface CompleteLivraison {
  id?: string
  numeroBl: string
  date: string
  client: string
  telephone: string
  chauffeur: string
  produits: Array<{
    nom: string
    quantite: number
    unite: string
    quantiteCommandee: number
    quantiteLivree: number
    difference: number
    resteAPayer: number
  }>
  statut: 'en_attente' | 'en_cours' | 'livre' | 'annule'
  adresse: string
  codeSuivi: string
  totalCommande: number
  totalLivraison: number
  differenceTotale: number
  resteAPayerTotal: number
  cloturee?: boolean
  dateCloture?: string
  dateClotureManuelle?: string
  notesCloture?: string
  commandeId?: string
  signatureClient?: string
  signatureChauffeur?: string
  preuveDepot?: string
  preuveReception?: string
  notes?: string
  dateLivraison?: string
  heureLivraison?: string
  user_id?: string
}

export interface CompleteProduction {
  id?: string
  date: string
  lotId: string
  statut: 'en_attente' | 'en_cours' | 'termine' | 'annule'
  articlesProduits: Array<{
    nom: string
    quantiteProduite: number
    unite: string
  }>
  tempsEffectif?: number
  rendement?: number
  coutProduction?: number
  user_id?: string
}

export interface CompleteUser {
  id?: string
  email: string
  first_name: string
  last_name: string
  role: 'superadmin' | 'admin' | 'manager' | 'operator' | 'secretaire' | 'livreur'
  phone?: string
  actif: boolean
  created_at?: string
  updated_at?: string
}

export interface CompleteAnalyse {
  id?: string
  nom: string
  type: 'qualite' | 'performance' | 'cout' | 'rendement' | 'autre'
  description?: string
  dateDebut: string
  dateFin?: string
  statut: 'en_cours' | 'termine' | 'annule'
  resultats?: string
  observations?: string
  recommandations?: string
  user_id?: string
}

export interface CompleteDocument {
  id?: string
  nom: string
  type: string
  taille: number
  url: string
  description: string
  user_id?: string
}

export interface CompleteAnalyse {
  id?: string
  nom: string
  type: 'qualite' | 'performance' | 'cout' | 'rendement' | 'autre'
  donnees: any
  dateAnalyse: string
  user_id?: string
}

export interface CompleteTransfert {
  id?: string
  numeroBordereau: string
  date: string
  client: string
  telephone: string
  email: string
  adresse: string
  chauffeurNom: string
  chauffeurTelephone: string
  statut: 'en_preparation' | 'en_cours' | 'termine'
  notes: string
  produits: Array<{
    designation: string
    quantite: number
    unite: string
    observation: string
  }>
  user_id?: string
}

// ===== SERVICE PRINCIPAL =====

class CompleteHybridService {
  private useSupabase: boolean

  constructor() {
    // Force l'utilisation de Supabase - ignorer la configuration
    this.useSupabase = true
    console.log('📊 CompleteHybridService: Mode Supabase FORCÉ')
    console.log('🚀 [CompleteHybridService] MODE SUPABASE FORCÉ - 100% Supabase activé')
  }

  // Vérifier si l'utilisateur est authentifié
  private isUserAuthenticated(): boolean {
    // Force l'utilisation de Supabase - toujours retourner true
    console.log('📡 [CompleteHybridService] Mode Supabase forcé - Authentification simulée')
    return true
  }

  // Obtenir l'ID de l'utilisateur actuel
  private getCurrentUserId(): string | null {
    // Mode Supabase forcé - récupérer le premier utilisateur disponible ou utiliser null pour récupérer toutes les données
    console.log('📡 [CompleteHybridService] Mode Supabase - Récupération de toutes les données (sans filtre user_id)')
    return null // Retourner null pour récupérer toutes les données
  }

  // ===== MAPPING SUPABASE =====

  // Articles
  private mapArticleFromSupabase(data: any): CompleteArticle {
    return {
      id: data.id?.toString(),
      nom: data.nom,
      categorie: data.categorie,
      stock: data.stock,
      seuilCritique: data.seuil_critique,
      unite: data.unite,
      prix: data.prix,
      fournisseur: data.fournisseur,
      notes: data.notes,
      typeProduction: data.type_production,
      capaciteProduction: data.capacite_production,
      uniteProduction: data.unite_production,
      coutProduction: data.cout_production,
      tempsProduction: data.temps_production,
      qualite: data.qualite,
      actif: data.actif,
      derniereMiseAJour: data.derniere_mise_a_jour,
      user_id: data.user_id
    }
  }

  private mapArticleToSupabase(article: CompleteArticle): any {
    return {
      nom: article.nom,
      categorie: article.categorie,
      stock: article.stock,
      seuil_critique: article.seuilCritique,
      unite: article.unite,
      prix: article.prix,
      fournisseur: article.fournisseur,
      notes: article.notes,
      type_production: article.typeProduction,
      capacite_production: article.capaciteProduction,
      unite_production: article.uniteProduction,
      cout_production: article.coutProduction,
      temps_production: article.tempsProduction,
      qualite: article.qualite,
      actif: article.actif,
      derniere_mise_a_jour: article.derniereMiseAJour
    }
  }

  // Commandes
  private mapCommandeFromSupabase(data: any): CompleteCommande {
    return {
      id: data.id?.toString(),
      numeroCommande: data.numero_commande,
      client: data.client,
      telephone: data.telephone,
      email: data.email,
      adresse: data.adresse,
      produits: data.produits || [],
      statut: data.statut,
      date: data.date,
      dateLivraisonSouhaitee: data.date_livraison_souhaitee,
      priorite: data.priorite,
      user_id: data.user_id
    }
  }

  private mapCommandeToSupabase(commande: CompleteCommande): any {
    return {
      numero_commande: commande.numeroCommande,
      client: commande.client,
      telephone: commande.telephone,
      email: commande.email,
      adresse: commande.adresse,
      produits: commande.produits,
      statut: commande.statut,
      date: commande.date,
      date_livraison_souhaitee: commande.dateLivraisonSouhaitee,
      priorite: commande.priorite
    }
  }

  // Livraisons
  private mapLivraisonFromSupabase(data: any): CompleteLivraison {
    return {
      id: data.id?.toString(),
      numeroBl: data.numero_bl,
      date: data.date,
      client: data.client,
      telephone: data.telephone,
      chauffeur: data.chauffeur,
      produits: data.produits || [],
      statut: data.statut,
      adresse: data.adresse,
      codeSuivi: data.code_suivi,
      totalCommande: data.total_commande,
      totalLivraison: data.total_livraison,
      differenceTotale: data.difference_totale,
      resteAPayerTotal: data.reste_a_payer_total,
      user_id: data.user_id
    }
  }

  private mapLivraisonToSupabase(livraison: CompleteLivraison): any {
    return {
      numero_bl: livraison.numeroBl,
      date: livraison.date,
      client: livraison.client,
      telephone: livraison.telephone,
      chauffeur: livraison.chauffeur,
      produits: livraison.produits,
      statut: livraison.statut,
      adresse: livraison.adresse,
      code_suivi: livraison.codeSuivi,
      total_commande: livraison.totalCommande,
      total_livraison: livraison.totalLivraison,
      difference_totale: livraison.differenceTotale,
      reste_a_payer_total: livraison.resteAPayerTotal
    }
  }

  // Production
  private mapProductionFromSupabase(data: any): CompleteProduction {
    return {
      id: data.id?.toString(),
      date: data.date,
      lotId: data.lot_id,
      statut: data.statut,
      articlesProduits: data.articles_produits || [],
      tempsEffectif: data.temps_effectif,
      rendement: data.rendement,
      coutProduction: data.cout_production,
      user_id: data.user_id
    }
  }

  private mapProductionToSupabase(production: CompleteProduction): any {
    return {
      date: production.date,
      lot_id: production.lotId,
      statut: production.statut,
      articles_produits: production.articlesProduits,
      temps_effectif: production.tempsEffectif,
      rendement: production.rendement,
      cout_production: production.coutProduction
    }
  }

  // Users
  private mapUserFromSupabase(data: any): CompleteUser {
    return {
      id: data.id?.toString(),
      email: data.email,
      first_name: data.first_name,
      last_name: data.last_name,
      role: data.role,
      phone: data.phone,
      actif: data.actif,
      created_at: data.created_at,
      updated_at: data.updated_at
    }
  }

  private mapUserToSupabase(user: CompleteUser): any {
    return {
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      phone: user.phone,
      actif: user.actif
    }
  }

  // ===== GESTION LOCALSTORAGE =====

  private getFromStorage<T>(key: string): T[] {
    try {
      const data = localStorage.getItem(key)
      if (data) {
        const parsedData = JSON.parse(data)
        console.log(`📦 [CompleteHybridService] ${key} trouvés dans localStorage:`, parsedData.length)
        return parsedData
      }
      console.log(`📦 [CompleteHybridService] Aucun ${key} dans localStorage`)
      return []
    } catch (error) {
      console.error(`❌ [CompleteHybridService] Erreur lors de la lecture du localStorage (${key}):`, error)
      return []
    }
  }

  private saveToStorage<T>(key: string, data: T[]): void {
    try {
      localStorage.setItem(key, JSON.stringify(data))
      console.log(`💾 [CompleteHybridService] ${key} sauvegardés dans localStorage:`, data.length)
    } catch (error) {
      console.error(`❌ [CompleteHybridService] Erreur lors de la sauvegarde dans localStorage (${key}):`, error)
    }
  }

  // ===== GESTION DES ARTICLES =====

  async getArticles(): Promise<CompleteArticle[]> {
    console.log('🔍 [CompleteHybridService] getArticles() - Début')
    
    try {
      if (this.isUserAuthenticated()) {
        console.log('📡 [CompleteHybridService] Utilisation de Supabase')
        const userId = this.getCurrentUserId()
        
        const { data, error } = await this.buildQuery('articles', userId)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('❌ [CompleteHybridService] Erreur Supabase:', error)
          throw error
        }
        
        console.log('✅ [CompleteHybridService] Articles récupérés depuis Supabase:', data?.length || 0)
        const mappedData = (data || []).map((item: any) => this.mapArticleFromSupabase(item))
        return mappedData
      } else {
        // Mode Supabase forcé - ne devrait jamais arriver
        console.log('⚠️ [CompleteHybridService] Mode Supabase forcé - section else ignorée')
        return []
      }
    } catch (error) {
      console.error('❌ [CompleteHybridService] Erreur lors de la récupération des articles:', error)
      throw error // Ne pas fallback vers localStorage
    }
  }

  async addArticle(article: Omit<CompleteArticle, 'id' | 'user_id'>): Promise<CompleteArticle> {
    console.log('🔍 [CompleteHybridService] addArticle() - Début')
    
    const articleWithUserId = {
      ...article,
      user_id: this.getCurrentUserId() || undefined
    }

    try {
      if (this.isUserAuthenticated()) {
        console.log('📡 [CompleteHybridService] Utilisation de Supabase')
        const userId = this.getCurrentUserId()
        
        if (!userId) {
          throw new Error('Utilisateur non authentifié')
        }

        const supabaseData = this.mapArticleToSupabase(articleWithUserId)
        const { data, error } = await supabase
          .from('articles')
          .insert([{ ...supabaseData, user_id: userId }])
          .select('*')
          .single()

        if (error) {
          console.error('❌ [CompleteHybridService] Erreur Supabase:', error)
          throw error
        }

        console.log('✅ [CompleteHybridService] Article créé dans Supabase:', data)
        return this.mapArticleFromSupabase(data)
      } else {
        console.log('💾 [CompleteHybridService] Utilisation de localStorage')
        const articles = this.getFromStorage<CompleteArticle>('stock_articles')
        const newArticle = {
          ...articleWithUserId,
          id: this.generateId()
        }
        articles.push(newArticle)
        this.saveToStorage('stock_articles', articles)
        console.log('✅ [CompleteHybridService] Article créé dans localStorage:', newArticle)
        return newArticle
      }
    } catch (error) {
      console.error('❌ [CompleteHybridService] Erreur lors de la création de l\'article:', error)
      console.log('🔄 [CompleteHybridService] Fallback vers localStorage')
      const articles = this.getFromStorage<CompleteArticle>('stock_articles')
      const newArticle = {
        ...articleWithUserId,
        id: this.generateId()
      }
      articles.push(newArticle)
      this.saveToStorage('stock_articles', articles)
      return newArticle
    }
  }

  async updateArticle(id: string, updates: Partial<CompleteArticle>): Promise<CompleteArticle> {
    console.log('🔍 [CompleteHybridService] updateArticle() - Début')
    
    try {
      if (this.isUserAuthenticated()) {
        console.log('📡 [CompleteHybridService] Utilisation de Supabase')
        const userId = this.getCurrentUserId()
        
        if (!userId) {
          throw new Error('Utilisateur non authentifié')
        }

        const supabaseUpdates = this.mapArticleToSupabase(updates as CompleteArticle)
        const { data, error } = await supabase
          .from('articles')
          .update(supabaseUpdates)
          .eq('id', id)
          .eq('user_id', userId)
          .select('*')
          .single()

        if (error) {
          console.error('❌ [CompleteHybridService] Erreur Supabase:', error)
          throw error
        }

        console.log('✅ [CompleteHybridService] Article mis à jour dans Supabase:', data)
        return this.mapArticleFromSupabase(data)
      } else {
        console.log('💾 [CompleteHybridService] Utilisation de localStorage')
        const articles = this.getFromStorage<CompleteArticle>('stock_articles')
        const articleIndex = articles.findIndex(a => a.id === id)
        if (articleIndex !== -1) {
          articles[articleIndex] = { ...articles[articleIndex], ...updates }
          this.saveToStorage('stock_articles', articles)
          console.log('✅ [CompleteHybridService] Article mis à jour dans localStorage:', articles[articleIndex])
          return articles[articleIndex]
        } else {
          throw new Error('Article non trouvé')
        }
      }
    } catch (error) {
      console.error('❌ [CompleteHybridService] Erreur lors de la mise à jour de l\'article:', error)
      console.log('🔄 [CompleteHybridService] Fallback vers localStorage')
      const articles = this.getFromStorage<CompleteArticle>('stock_articles')
      const articleIndex = articles.findIndex(a => a.id === id)
      if (articleIndex !== -1) {
        articles[articleIndex] = { ...articles[articleIndex], ...updates }
        this.saveToStorage('stock_articles', articles)
        return articles[articleIndex]
      } else {
        throw new Error('Article non trouvé')
      }
    }
  }

  async deleteArticle(id: string): Promise<void> {
    console.log('🔍 [CompleteHybridService] deleteArticle() - Début')
    
    try {
      if (this.isUserAuthenticated()) {
        console.log('📡 [CompleteHybridService] Utilisation de Supabase')
        const userId = this.getCurrentUserId()
        
        if (!userId) {
          throw new Error('Utilisateur non authentifié')
        }

        const { error } = await supabase
          .from('articles')
          .delete()
          .eq('id', id)
          .eq('user_id', userId)

        if (error) {
          console.error('❌ [CompleteHybridService] Erreur Supabase:', error)
          throw error
        }

        console.log('✅ [CompleteHybridService] Article supprimé de Supabase')
      } else {
        console.log('💾 [CompleteHybridService] Utilisation de localStorage')
        const articles = this.getFromStorage<CompleteArticle>('stock_articles')
        const filteredArticles = articles.filter(a => a.id !== id)
        this.saveToStorage('stock_articles', filteredArticles)
        console.log('✅ [CompleteHybridService] Article supprimé de localStorage')
      }
    } catch (error) {
      console.error('❌ [CompleteHybridService] Erreur lors de la suppression de l\'article:', error)
      console.log('🔄 [CompleteHybridService] Fallback vers localStorage')
      const articles = this.getFromStorage<CompleteArticle>('stock_articles')
      const filteredArticles = articles.filter(a => a.id !== id)
      this.saveToStorage('stock_articles', filteredArticles)
    }
  }

  // ===== GESTION DES COMMANDES =====

  async getCommandes(): Promise<CompleteCommande[]> {
    console.log('🔍 [CompleteHybridService] getCommandes() - Début')
    
    try {
      if (this.isUserAuthenticated()) {
        console.log('📡 [CompleteHybridService] Utilisation de Supabase')
        const userId = this.getCurrentUserId()
        
        const { data, error } = await this.buildQuery('commandes', userId)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('❌ [CompleteHybridService] Erreur Supabase:', error)
          throw error
        }
        
        console.log('✅ [CompleteHybridService] Commandes récupérées depuis Supabase:', data?.length || 0)
        const mappedData = (data || []).map((item: any) => this.mapCommandeFromSupabase(item))
        return mappedData
      } else {
        console.log('💾 [CompleteHybridService] Utilisation de localStorage')
        return this.getFromStorage<CompleteCommande>('commandes')
      }
    } catch (error) {
      console.error('❌ [CompleteHybridService] Erreur lors de la récupération des commandes:', error)
      console.log('🔄 [CompleteHybridService] Fallback vers localStorage')
      return this.getFromStorage<CompleteCommande>('commandes')
    }
  }

  async addCommande(commande: Omit<CompleteCommande, 'id' | 'user_id'>): Promise<CompleteCommande> {
    console.log('🔍 [CompleteHybridService] addCommande() - Début')
    
    const commandeWithUserId = {
      ...commande,
      user_id: this.getCurrentUserId() || undefined
    }

    try {
      if (this.isUserAuthenticated()) {
        console.log('📡 [CompleteHybridService] Utilisation de Supabase')
        const userId = this.getCurrentUserId()
        
        if (!userId) {
          throw new Error('Utilisateur non authentifié')
        }

        const supabaseData = this.mapCommandeToSupabase(commandeWithUserId)
        const { data, error } = await supabase
          .from('commandes')
          .insert([{ ...supabaseData, user_id: userId }])
          .select('*')
          .single()

        if (error) {
          console.error('❌ [CompleteHybridService] Erreur Supabase:', error)
          throw error
        }

        console.log('✅ [CompleteHybridService] Commande créée dans Supabase:', data)
        return this.mapCommandeFromSupabase(data)
      } else {
        console.log('💾 [CompleteHybridService] Utilisation de localStorage')
        const commandes = this.getFromStorage<CompleteCommande>('commandes')
        const newCommande = {
          ...commandeWithUserId,
          id: this.generateId()
        }
        commandes.push(newCommande)
        this.saveToStorage('commandes', commandes)
        console.log('✅ [CompleteHybridService] Commande créée dans localStorage:', newCommande)
        return newCommande
      }
    } catch (error) {
      console.error('❌ [CompleteHybridService] Erreur lors de la création de la commande:', error)
      console.log('🔄 [CompleteHybridService] Fallback vers localStorage')
      const commandes = this.getFromStorage<CompleteCommande>('commandes')
      const newCommande = {
        ...commandeWithUserId,
        id: this.generateId()
      }
      commandes.push(newCommande)
      this.saveToStorage('commandes', commandes)
      return newCommande
    }
  }

  async updateCommande(id: string, updates: Partial<CompleteCommande>): Promise<CompleteCommande> {
    console.log('🔍 [CompleteHybridService] updateCommande() - Début')
    
    try {
      if (this.isUserAuthenticated()) {
        console.log('📡 [CompleteHybridService] Utilisation de Supabase')
        const userId = this.getCurrentUserId()
        
        if (!userId) {
          throw new Error('Utilisateur non authentifié')
        }

        const supabaseUpdates = this.mapCommandeToSupabase(updates as CompleteCommande)
        const { data, error } = await supabase
          .from('commandes')
          .update(supabaseUpdates)
          .eq('id', id)
          .eq('user_id', userId)
          .select('*')
          .single()

        if (error) {
          console.error('❌ [CompleteHybridService] Erreur Supabase:', error)
          throw error
        }

        console.log('✅ [CompleteHybridService] Commande mise à jour dans Supabase:', data)
        return this.mapCommandeFromSupabase(data)
      } else {
        console.log('💾 [CompleteHybridService] Utilisation de localStorage')
        const commandes = this.getFromStorage<CompleteCommande>('commandes')
        const commandeIndex = commandes.findIndex(c => c.id === id)
        if (commandeIndex !== -1) {
          commandes[commandeIndex] = { ...commandes[commandeIndex], ...updates }
          this.saveToStorage('commandes', commandes)
          console.log('✅ [CompleteHybridService] Commande mise à jour dans localStorage:', commandes[commandeIndex])
          return commandes[commandeIndex]
        } else {
          throw new Error('Commande non trouvée')
        }
      }
    } catch (error) {
      console.error('❌ [CompleteHybridService] Erreur lors de la mise à jour de la commande:', error)
      console.log('🔄 [CompleteHybridService] Fallback vers localStorage')
      const commandes = this.getFromStorage<CompleteCommande>('commandes')
      const commandeIndex = commandes.findIndex(c => c.id === id)
      if (commandeIndex !== -1) {
        commandes[commandeIndex] = { ...commandes[commandeIndex], ...updates }
        this.saveToStorage('commandes', commandes)
        return commandes[commandeIndex]
      } else {
        throw new Error('Commande non trouvée')
      }
    }
  }

  async deleteCommande(id: string): Promise<void> {
    console.log('🔍 [CompleteHybridService] deleteCommande() - Début')
    
    try {
      if (this.isUserAuthenticated()) {
        console.log('📡 [CompleteHybridService] Utilisation de Supabase')
        const userId = this.getCurrentUserId()
        
        if (!userId) {
          throw new Error('Utilisateur non authentifié')
        }

        const { error } = await supabase
          .from('commandes')
          .delete()
          .eq('id', id)
          .eq('user_id', userId)

        if (error) {
          console.error('❌ [CompleteHybridService] Erreur Supabase:', error)
          throw error
        }

        console.log('✅ [CompleteHybridService] Commande supprimée de Supabase')
      } else {
        console.log('💾 [CompleteHybridService] Utilisation de localStorage')
        const commandes = this.getFromStorage<CompleteCommande>('commandes')
        const filteredCommandes = commandes.filter(c => c.id !== id)
        this.saveToStorage('commandes', filteredCommandes)
        console.log('✅ [CompleteHybridService] Commande supprimée de localStorage')
      }
    } catch (error) {
      console.error('❌ [CompleteHybridService] Erreur lors de la suppression de la commande:', error)
      console.log('🔄 [CompleteHybridService] Fallback vers localStorage')
      const commandes = this.getFromStorage<CompleteCommande>('commandes')
      const filteredCommandes = commandes.filter(c => c.id !== id)
      this.saveToStorage('commandes', filteredCommandes)
    }
  }

  // ===== GESTION DES LIVRAISONS =====

  async getLivraisons(): Promise<CompleteLivraison[]> {
    console.log('🔍 [CompleteHybridService] getLivraisons() - Début')
    
    try {
      if (this.isUserAuthenticated()) {
        console.log('📡 [CompleteHybridService] Utilisation de Supabase')
        const userId = this.getCurrentUserId()
        
        const { data, error } = await this.buildQuery('livraisons', userId)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('❌ [CompleteHybridService] Erreur Supabase:', error)
          throw error
        }
        
        console.log('✅ [CompleteHybridService] Livraisons récupérées depuis Supabase:', data?.length || 0)
        const mappedData = (data || []).map((item: any) => this.mapLivraisonFromSupabase(item))
        return mappedData
      } else {
        console.log('💾 [CompleteHybridService] Utilisation de localStorage')
        return this.getFromStorage<CompleteLivraison>('livraisons')
      }
    } catch (error) {
      console.error('❌ [CompleteHybridService] Erreur lors de la récupération des livraisons:', error)
      console.log('🔄 [CompleteHybridService] Fallback vers localStorage')
      return this.getFromStorage<CompleteLivraison>('livraisons')
    }
  }

  async addLivraison(livraison: Omit<CompleteLivraison, 'id' | 'user_id'>): Promise<CompleteLivraison> {
    console.log('🔍 [CompleteHybridService] addLivraison() - Début')
    
    const livraisonWithUserId = {
      ...livraison,
      user_id: this.getCurrentUserId() || undefined
    }

    try {
      if (this.isUserAuthenticated()) {
        console.log('📡 [CompleteHybridService] Utilisation de Supabase')
        const userId = this.getCurrentUserId()
        
        if (!userId) {
          throw new Error('Utilisateur non authentifié')
        }

        const supabaseData = this.mapLivraisonToSupabase(livraisonWithUserId)
        const { data, error } = await supabase
          .from('livraisons')
          .insert([{ ...supabaseData, user_id: userId }])
          .select('*')
          .single()

        if (error) {
          console.error('❌ [CompleteHybridService] Erreur Supabase:', error)
          throw error
        }

        console.log('✅ [CompleteHybridService] Livraison créée dans Supabase:', data)
        return this.mapLivraisonFromSupabase(data)
      } else {
        console.log('💾 [CompleteHybridService] Utilisation de localStorage')
        const livraisons = this.getFromStorage<CompleteLivraison>('livraisons')
        const newLivraison = {
          ...livraisonWithUserId,
          id: this.generateId()
        }
        livraisons.push(newLivraison)
        this.saveToStorage('livraisons', livraisons)
        console.log('✅ [CompleteHybridService] Livraison créée dans localStorage:', newLivraison)
        return newLivraison
      }
    } catch (error) {
      console.error('❌ [CompleteHybridService] Erreur lors de la création de la livraison:', error)
      console.log('🔄 [CompleteHybridService] Fallback vers localStorage')
      const livraisons = this.getFromStorage<CompleteLivraison>('livraisons')
      const newLivraison = {
        ...livraisonWithUserId,
        id: this.generateId()
      }
      livraisons.push(newLivraison)
      this.saveToStorage('livraisons', livraisons)
      return newLivraison
    }
  }

  async updateLivraison(id: string, updates: Partial<CompleteLivraison>): Promise<CompleteLivraison> {
    console.log('🔍 [CompleteHybridService] updateLivraison() - Début')
    
    try {
      if (this.isUserAuthenticated()) {
        console.log('📡 [CompleteHybridService] Utilisation de Supabase')
        const userId = this.getCurrentUserId()
        
        if (!userId) {
          throw new Error('Utilisateur non authentifié')
        }

        const supabaseUpdates = this.mapLivraisonToSupabase(updates as CompleteLivraison)
        const { data, error } = await supabase
          .from('livraisons')
          .update(supabaseUpdates)
          .eq('id', id)
          .eq('user_id', userId)
          .select('*')
          .single()

        if (error) {
          console.error('❌ [CompleteHybridService] Erreur Supabase:', error)
          throw error
        }

        console.log('✅ [CompleteHybridService] Livraison mise à jour dans Supabase:', data)
        return this.mapLivraisonFromSupabase(data)
      } else {
        console.log('💾 [CompleteHybridService] Utilisation de localStorage')
        const livraisons = this.getFromStorage<CompleteLivraison>('livraisons')
        const livraisonIndex = livraisons.findIndex(l => l.id === id)
        if (livraisonIndex !== -1) {
          livraisons[livraisonIndex] = { ...livraisons[livraisonIndex], ...updates }
          this.saveToStorage('livraisons', livraisons)
          console.log('✅ [CompleteHybridService] Livraison mise à jour dans localStorage:', livraisons[livraisonIndex])
          return livraisons[livraisonIndex]
        } else {
          throw new Error('Livraison non trouvée')
        }
      }
    } catch (error) {
      console.error('❌ [CompleteHybridService] Erreur lors de la mise à jour de la livraison:', error)
      console.log('🔄 [CompleteHybridService] Fallback vers localStorage')
      const livraisons = this.getFromStorage<CompleteLivraison>('livraisons')
      const livraisonIndex = livraisons.findIndex(l => l.id === id)
      if (livraisonIndex !== -1) {
        livraisons[livraisonIndex] = { ...livraisons[livraisonIndex], ...updates }
        this.saveToStorage('livraisons', livraisons)
        return livraisons[livraisonIndex]
      } else {
        throw new Error('Livraison non trouvée')
      }
    }
  }

  async deleteLivraison(id: string): Promise<void> {
    console.log('🔍 [CompleteHybridService] deleteLivraison() - Début')
    
    try {
      if (this.isUserAuthenticated()) {
        console.log('📡 [CompleteHybridService] Utilisation de Supabase')
        const userId = this.getCurrentUserId()
        
        if (!userId) {
          throw new Error('Utilisateur non authentifié')
        }

        const { error } = await supabase
          .from('livraisons')
          .delete()
          .eq('id', id)
          .eq('user_id', userId)

        if (error) {
          console.error('❌ [CompleteHybridService] Erreur Supabase:', error)
          throw error
        }

        console.log('✅ [CompleteHybridService] Livraison supprimée de Supabase')
      } else {
        console.log('💾 [CompleteHybridService] Utilisation de localStorage')
        const livraisons = this.getFromStorage<CompleteLivraison>('livraisons')
        const filteredLivraisons = livraisons.filter(l => l.id !== id)
        this.saveToStorage('livraisons', filteredLivraisons)
        console.log('✅ [CompleteHybridService] Livraison supprimée de localStorage')
      }
    } catch (error) {
      console.error('❌ [CompleteHybridService] Erreur lors de la suppression de la livraison:', error)
      console.log('🔄 [CompleteHybridService] Fallback vers localStorage')
      const livraisons = this.getFromStorage<CompleteLivraison>('livraisons')
      const filteredLivraisons = livraisons.filter(l => l.id !== id)
      this.saveToStorage('livraisons', filteredLivraisons)
    }
  }

  // ===== GESTION DE LA PRODUCTION =====

  async getProductions(): Promise<CompleteProduction[]> {
    console.log('🔍 [CompleteHybridService] getProductions() - Début')
    
    try {
      if (this.isUserAuthenticated()) {
        console.log('📡 [CompleteHybridService] Utilisation de Supabase')
        const userId = this.getCurrentUserId()
        
        const { data, error } = await this.buildQuery('production', userId)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('❌ [CompleteHybridService] Erreur Supabase:', error)
          throw error
        }
        
        console.log('✅ [CompleteHybridService] Productions récupérées depuis Supabase:', data?.length || 0)
        const mappedData = (data || []).map((item: any) => this.mapProductionFromSupabase(item))
        return mappedData
      } else {
        console.log('💾 [CompleteHybridService] Utilisation de localStorage')
        return this.getFromStorage<CompleteProduction>('productions')
      }
    } catch (error) {
      console.error('❌ [CompleteHybridService] Erreur lors de la récupération des productions:', error)
      console.log('🔄 [CompleteHybridService] Fallback vers localStorage')
      return this.getFromStorage<CompleteProduction>('productions')
    }
  }

  async addProduction(production: Omit<CompleteProduction, 'id' | 'user_id'>): Promise<CompleteProduction> {
    console.log('🔍 [CompleteHybridService] addProduction() - Début')
    
    const productionWithUserId = {
      ...production,
      user_id: this.getCurrentUserId() || undefined
    }

    try {
      if (this.isUserAuthenticated()) {
        console.log('📡 [CompleteHybridService] Utilisation de Supabase')
        const userId = this.getCurrentUserId()
        
        if (!userId) {
          throw new Error('Utilisateur non authentifié')
        }

        const supabaseData = this.mapProductionToSupabase(productionWithUserId)
        const { data, error } = await supabase
          .from('production')
          .insert([{ ...supabaseData, user_id: userId }])
          .select('*')
          .single()

        if (error) {
          console.error('❌ [CompleteHybridService] Erreur Supabase:', error)
          throw error
        }

        console.log('✅ [CompleteHybridService] Production créée dans Supabase:', data)
        return this.mapProductionFromSupabase(data)
      } else {
        console.log('💾 [CompleteHybridService] Utilisation de localStorage')
        const productions = this.getFromStorage<CompleteProduction>('productions')
        const newProduction = {
          ...productionWithUserId,
          id: this.generateId()
        }
        productions.push(newProduction)
        this.saveToStorage('productions', productions)
        console.log('✅ [CompleteHybridService] Production créée dans localStorage:', newProduction)
        return newProduction
      }
    } catch (error) {
      console.error('❌ [CompleteHybridService] Erreur lors de la création de la production:', error)
      console.log('🔄 [CompleteHybridService] Fallback vers localStorage')
      const productions = this.getFromStorage<CompleteProduction>('productions')
      const newProduction = {
        ...productionWithUserId,
        id: this.generateId()
      }
      productions.push(newProduction)
      this.saveToStorage('productions', productions)
      return newProduction
    }
  }

  async updateProduction(id: string, updates: Partial<CompleteProduction>): Promise<CompleteProduction> {
    console.log('🔍 [CompleteHybridService] updateProduction() - Début')
    
    try {
      if (this.isUserAuthenticated()) {
        console.log('📡 [CompleteHybridService] Utilisation de Supabase')
        const userId = this.getCurrentUserId()
        
        if (!userId) {
          throw new Error('Utilisateur non authentifié')
        }

        const supabaseUpdates = this.mapProductionToSupabase(updates as CompleteProduction)
        const { data, error } = await supabase
          .from('production')
          .update(supabaseUpdates)
          .eq('id', id)
          .eq('user_id', userId)
          .select('*')
          .single()

        if (error) {
          console.error('❌ [CompleteHybridService] Erreur Supabase:', error)
          throw error
        }

        console.log('✅ [CompleteHybridService] Production mise à jour dans Supabase:', data)
        return this.mapProductionFromSupabase(data)
      } else {
        console.log('💾 [CompleteHybridService] Utilisation de localStorage')
        const productions = this.getFromStorage<CompleteProduction>('productions')
        const productionIndex = productions.findIndex(p => p.id === id)
        if (productionIndex !== -1) {
          productions[productionIndex] = { ...productions[productionIndex], ...updates }
          this.saveToStorage('productions', productions)
          console.log('✅ [CompleteHybridService] Production mise à jour dans localStorage:', productions[productionIndex])
          return productions[productionIndex]
        } else {
          throw new Error('Production non trouvée')
        }
      }
    } catch (error) {
      console.error('❌ [CompleteHybridService] Erreur lors de la mise à jour de la production:', error)
      console.log('🔄 [CompleteHybridService] Fallback vers localStorage')
      const productions = this.getFromStorage<CompleteProduction>('productions')
      const productionIndex = productions.findIndex(p => p.id === id)
      if (productionIndex !== -1) {
        productions[productionIndex] = { ...productions[productionIndex], ...updates }
        this.saveToStorage('productions', productions)
        return productions[productionIndex]
      } else {
        throw new Error('Production non trouvée')
      }
    }
  }

  async deleteProduction(id: string): Promise<void> {
    console.log('🔍 [CompleteHybridService] deleteProduction() - Début')
    
    try {
      if (this.isUserAuthenticated()) {
        console.log('📡 [CompleteHybridService] Utilisation de Supabase')
        const userId = this.getCurrentUserId()
        
        if (!userId) {
          throw new Error('Utilisateur non authentifié')
        }

        const { error } = await supabase
          .from('production')
          .delete()
          .eq('id', id)
          .eq('user_id', userId)

        if (error) {
          console.error('❌ [CompleteHybridService] Erreur Supabase:', error)
          throw error
        }

        console.log('✅ [CompleteHybridService] Production supprimée de Supabase')
      } else {
        console.log('💾 [CompleteHybridService] Utilisation de localStorage')
        const productions = this.getFromStorage<CompleteProduction>('productions')
        const filteredProductions = productions.filter(p => p.id !== id)
        this.saveToStorage('productions', filteredProductions)
        console.log('✅ [CompleteHybridService] Production supprimée de localStorage')
      }
    } catch (error) {
      console.error('❌ [CompleteHybridService] Erreur lors de la suppression de la production:', error)
      console.log('🔄 [CompleteHybridService] Fallback vers localStorage')
      const productions = this.getFromStorage<CompleteProduction>('productions')
      const filteredProductions = productions.filter(p => p.id !== id)
      this.saveToStorage('productions', filteredProductions)
    }
  }

  // ===== GESTION DES UTILISATEURS =====

  async getUsers(): Promise<CompleteUser[]> {
    console.log('🔍 [CompleteHybridService] getUsers() - Début')
    
    try {
      if (this.isUserAuthenticated()) {
        console.log('📡 [CompleteHybridService] Utilisation de Supabase')
        const userId = this.getCurrentUserId()
        
        if (!userId) {
          throw new Error('Utilisateur non authentifié')
        }

        const { data, error } = await supabase
          .from('users')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) {
          console.error('❌ [CompleteHybridService] Erreur Supabase:', error)
          throw error
        }
        
        console.log('✅ [CompleteHybridService] Utilisateurs récupérés depuis Supabase:', data?.length || 0)
        const mappedData = (data || []).map((item: any) => this.mapUserFromSupabase(item))
        return mappedData
      } else {
        console.log('💾 [CompleteHybridService] Utilisation de localStorage')
        return this.getFromStorage<CompleteUser>('users')
      }
    } catch (error) {
      console.error('❌ [CompleteHybridService] Erreur lors de la récupération des utilisateurs:', error)
      console.log('🔄 [CompleteHybridService] Fallback vers localStorage')
      return this.getFromStorage<CompleteUser>('users')
    }
  }

  // ===== GESTION DES ANALYSES =====

  async getAnalyses(): Promise<CompleteAnalyse[]> {
    console.log('🔍 [CompleteHybridService] getAnalyses() - Début')
    
    try {
      if (this.isUserAuthenticated()) {
        console.log('📡 [CompleteHybridService] Utilisation de Supabase')
        const userId = this.getCurrentUserId()
        
        if (!userId) {
          throw new Error('Utilisateur non authentifié')
        }

        const { data, error } = await supabase
          .from('analyses')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('❌ [CompleteHybridService] Erreur Supabase:', error)
          throw error
        }

        console.log('✅ [CompleteHybridService] Analyses récupérées depuis Supabase:', data?.length || 0)
        return (data || []).map((item: any) => this.mapAnalyseFromSupabase(item))
      } else {
        console.log('💾 [CompleteHybridService] Utilisation de localStorage')
        return this.getFromStorage<CompleteAnalyse>('analyses')
      }
    } catch (error) {
      console.error('❌ [CompleteHybridService] Erreur lors de la récupération des analyses:', error)
      console.log('🔄 [CompleteHybridService] Fallback vers localStorage')
      return this.getFromStorage<CompleteAnalyse>('analyses')
    }
  }

  async addAnalyse(analyse: Omit<CompleteAnalyse, 'id' | 'user_id'>): Promise<CompleteAnalyse> {
    console.log('🔍 [CompleteHybridService] addAnalyse() - Début')
    console.log('📊 [CompleteHybridService] Analyse à créer:', analyse)

    const analyseWithUserId = {
      ...analyse,
      user_id: this.getCurrentUserId() || undefined
    }

    try {
      if (this.isUserAuthenticated()) {
        console.log('📡 [CompleteHybridService] Utilisation de Supabase')
        const userId = this.getCurrentUserId()
        
        if (!userId) {
          throw new Error('Utilisateur non authentifié')
        }

        const supabaseData = this.mapAnalyseToSupabase(analyseWithUserId)
        const { data, error } = await supabase
          .from('analyses')
          .insert([{ ...supabaseData, user_id: userId }])
          .select()
          .single()

        if (error) {
          console.error('❌ [CompleteHybridService] Erreur Supabase:', error)
          throw error
        }

        console.log('✅ [CompleteHybridService] Analyse créée dans Supabase:', data)
        const mappedData = this.mapAnalyseFromSupabase(data)
        console.log('🔄 [CompleteHybridService] Analyse mappée:', mappedData)
        return mappedData
      } else {
        console.log('💾 [CompleteHybridService] Utilisation de localStorage')
        const analyses = this.getFromStorage<CompleteAnalyse>('analyses')
        const newAnalyse = {
          ...analyseWithUserId,
          id: this.generateId()
        }
        analyses.push(newAnalyse)
        this.saveToStorage('analyses', analyses)
        console.log('✅ [CompleteHybridService] Analyse créée dans localStorage:', newAnalyse)
        return newAnalyse
      }
    } catch (error) {
      console.error('❌ [CompleteHybridService] Erreur lors de la création de l\'analyse:', error)
      
      // Fallback vers localStorage
      console.log('🔄 [CompleteHybridService] Fallback vers localStorage')
      const analyses = this.getFromStorage<CompleteAnalyse>('analyses')
      const newAnalyse = {
        ...analyseWithUserId,
        id: this.generateId()
      }
      analyses.push(newAnalyse)
      this.saveToStorage('analyses', analyses)
      console.log('✅ [CompleteHybridService] Analyse créée dans localStorage (fallback):', newAnalyse)
      return newAnalyse
    }
  }

  async updateAnalyse(id: string, updates: Partial<CompleteAnalyse>): Promise<CompleteAnalyse> {
    console.log('🔍 [CompleteHybridService] updateAnalyse() - Début')
    console.log('📊 [CompleteHybridService] Analyse à mettre à jour:', id, updates)

    try {
      if (this.isUserAuthenticated()) {
        console.log('📡 [CompleteHybridService] Utilisation de Supabase')
        const userId = this.getCurrentUserId()
        
        if (!userId) {
          throw new Error('Utilisateur non authentifié')
        }

        const supabaseUpdates = this.mapAnalyseToSupabase(updates as CompleteAnalyse)
        const { data, error } = await supabase
          .from('analyses')
          .update(supabaseUpdates)
          .eq('id', id)
          .eq('user_id', userId)
          .select()
          .single()

        if (error) {
          console.error('❌ [CompleteHybridService] Erreur Supabase:', error)
          throw error
        }

        console.log('✅ [CompleteHybridService] Analyse mise à jour dans Supabase:', data)
        const mappedData = this.mapAnalyseFromSupabase(data)
        console.log('🔄 [CompleteHybridService] Analyse mappée:', mappedData)
        return mappedData
      } else {
        console.log('💾 [CompleteHybridService] Utilisation de localStorage')
        const analyses = this.getFromStorage<CompleteAnalyse>('analyses')
        const analyseIndex = analyses.findIndex(a => a.id === id)
        if (analyseIndex !== -1) {
          analyses[analyseIndex] = { ...analyses[analyseIndex], ...updates }
          this.saveToStorage('analyses', analyses)
          console.log('✅ [CompleteHybridService] Analyse mise à jour dans localStorage:', analyses[analyseIndex])
          return analyses[analyseIndex]
        } else {
          throw new Error('Analyse non trouvée')
        }
      }
    } catch (error) {
      console.error('❌ [CompleteHybridService] Erreur lors de la mise à jour de l\'analyse:', error)
      
      // Fallback vers localStorage
      console.log('🔄 [CompleteHybridService] Fallback vers localStorage')
      const analyses = this.getFromStorage<CompleteAnalyse>('analyses')
      const analyseIndex = analyses.findIndex(a => a.id === id)
      if (analyseIndex !== -1) {
        analyses[analyseIndex] = { ...analyses[analyseIndex], ...updates }
        this.saveToStorage('analyses', analyses)
        console.log('✅ [CompleteHybridService] Analyse mise à jour dans localStorage (fallback):', analyses[analyseIndex])
        return analyses[analyseIndex]
      } else {
        throw new Error('Analyse non trouvée')
      }
    }
  }

  async deleteAnalyse(id: string): Promise<void> {
    console.log('🔍 [CompleteHybridService] deleteAnalyse() - Début')
    console.log('📊 [CompleteHybridService] Analyse à supprimer:', id)

    try {
      if (this.isUserAuthenticated()) {
        console.log('📡 [CompleteHybridService] Utilisation de Supabase')
        const userId = this.getCurrentUserId()
        
        if (!userId) {
          throw new Error('Utilisateur non authentifié')
        }

        const { error } = await supabase
          .from('analyses')
          .delete()
          .eq('id', id)
          .eq('user_id', userId)

        if (error) {
          console.error('❌ [CompleteHybridService] Erreur Supabase:', error)
          throw error
        }

        console.log('✅ [CompleteHybridService] Analyse supprimée de Supabase')
      } else {
        console.log('💾 [CompleteHybridService] Utilisation de localStorage')
        const analyses = this.getFromStorage<CompleteAnalyse>('analyses')
        const filteredAnalyses = analyses.filter(a => a.id !== id)
        this.saveToStorage('analyses', filteredAnalyses)
        console.log('✅ [CompleteHybridService] Analyse supprimée de localStorage')
      }
    } catch (error) {
      console.error('❌ [CompleteHybridService] Erreur lors de la suppression de l\'analyse:', error)
      
      // Fallback vers localStorage
      console.log('🔄 [CompleteHybridService] Fallback vers localStorage')
      const analyses = this.getFromStorage<CompleteAnalyse>('analyses')
      const filteredAnalyses = analyses.filter(a => a.id !== id)
      this.saveToStorage('analyses', filteredAnalyses)
      console.log('✅ [CompleteHybridService] Analyse supprimée de localStorage (fallback)')
    }
  }

  // Méthodes de mapping pour les analyses
  private mapAnalyseFromSupabase(data: any): CompleteAnalyse {
    return {
      id: data.id?.toString(),
      nom: data.nom,
      type: data.type,
      donnees: data.donnees || {},
      dateAnalyse: data.date_analyse || data.date_debut || new Date().toISOString(),
      description: data.description,
      dateDebut: data.date_debut,
      dateFin: data.date_fin,
      statut: data.statut,
      resultats: data.resultats,
      observations: data.observations,
      recommandations: data.recommandations,
      user_id: data.user_id
    }
  }

  private mapAnalyseToSupabase(analyse: CompleteAnalyse): any {
    return {
      nom: analyse.nom,
      type: analyse.type,
      description: analyse.description,
      date_debut: analyse.dateDebut,
      date_fin: analyse.dateFin,
      statut: analyse.statut,
      resultats: analyse.resultats,
      observations: analyse.observations,
      recommandations: analyse.recommandations
    }
  }

  // ===== GESTION DES DOCUMENTS =====

  async getDocuments(): Promise<CompleteDocument[]> {
    console.log('🔍 [CompleteHybridService] getDocuments() - Début')
    
    try {
      if (this.isUserAuthenticated()) {
        console.log('📡 [CompleteHybridService] Utilisation de Supabase')
        const userId = this.getCurrentUserId()
        
        if (!userId) {
          throw new Error('Utilisateur non authentifié')
        }

        const { data, error } = await supabase
          .from('documents')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('❌ [CompleteHybridService] Erreur Supabase:', error)
          throw error
        }

        console.log('✅ [CompleteHybridService] Documents récupérés depuis Supabase:', data?.length || 0)
        return (data || []).map((item: any) => this.mapDocumentFromSupabase(item))
      } else {
        console.log('💾 [CompleteHybridService] Utilisation de localStorage')
        return this.getFromStorage<CompleteDocument>('documents')
      }
    } catch (error) {
      console.error('❌ [CompleteHybridService] Erreur lors de la récupération des documents:', error)
      console.log('🔄 [CompleteHybridService] Fallback vers localStorage')
      return this.getFromStorage<CompleteDocument>('documents')
    }
  }

  async addDocument(document: Omit<CompleteDocument, 'id' | 'user_id'> & { contenu: Blob, fileName: string }): Promise<CompleteDocument> {
    console.log('🔍 [CompleteHybridService] addDocument() - Début')
    console.log('📄 [CompleteHybridService] Document à créer:', document.nom)

    try {
      if (this.isUserAuthenticated()) {
        console.log('📡 [CompleteHybridService] Utilisation de Supabase Storage')
        let userId = this.getCurrentUserId()
        
        if (!userId) {
          // Mode Supabase forcé - utiliser un userId par défaut
          console.log('📡 [CompleteHybridService] Mode Supabase forcé - utilisation d\'un userId par défaut')
          userId = '00000000-0000-0000-0000-000000000000'
        }

        // Upload du fichier dans Supabase Storage
        const filePath = `documents/${userId}/${document.fileName}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, document.contenu, {
            contentType: 'application/pdf',
            upsert: true
          })

        if (uploadError) {
          console.error('❌ [CompleteHybridService] Erreur upload Supabase:', uploadError)
          throw uploadError
        }

        // Récupérer l'URL publique
        const { data: urlData } = supabase.storage
          .from('documents')
          .getPublicUrl(filePath)

        // Créer l'entrée dans la table documents
        const documentData = {
          nom: document.nom,
          type: document.type,
          taille: document.contenu.size,
          url: urlData.publicUrl,
          description: document.description,
          user_id: userId
        }

        const { data, error } = await supabase
          .from('documents')
          .insert([documentData])
          .select()
          .single()

        if (error) {
          console.error('❌ [CompleteHybridService] Erreur Supabase:', error)
          throw error
        }

        console.log('✅ [CompleteHybridService] Document créé dans Supabase:', data)
        const mappedData = this.mapDocumentFromSupabase(data)
        console.log('🔄 [CompleteHybridService] Document mappé:', mappedData)
        return mappedData
      } else {
        console.log('💾 [CompleteHybridService] Utilisation de localStorage')
        const documents = this.getFromStorage<CompleteDocument>('documents')
        const newDocument = {
          ...document,
          id: this.generateId(),
          taille: document.contenu.size,
          url: URL.createObjectURL(document.contenu)
        }
        documents.push(newDocument)
        this.saveToStorage('documents', documents)
        console.log('✅ [CompleteHybridService] Document créé dans localStorage:', newDocument)
        return newDocument
      }
    } catch (error) {
      console.error('❌ [CompleteHybridService] Erreur lors de la création du document:', error)
      
      // Fallback vers localStorage
      console.log('🔄 [CompleteHybridService] Fallback vers localStorage')
      const documents = this.getFromStorage<CompleteDocument>('documents')
      const newDocument = {
        ...document,
        id: this.generateId(),
        taille: document.contenu.size,
        url: URL.createObjectURL(document.contenu)
      }
      documents.push(newDocument)
      this.saveToStorage('documents', documents)
      console.log('✅ [CompleteHybridService] Document créé dans localStorage (fallback):', newDocument)
      return newDocument
    }
  }

  async deleteDocument(id: string): Promise<void> {
    console.log('🔍 [CompleteHybridService] deleteDocument() - Début')
    console.log('📄 [CompleteHybridService] Document à supprimer:', id)

    try {
      if (this.isUserAuthenticated()) {
        console.log('📡 [CompleteHybridService] Utilisation de Supabase')
        const userId = this.getCurrentUserId()
        
        if (!userId) {
          throw new Error('Utilisateur non authentifié')
        }

        // Récupérer le document pour obtenir l'URL
        const { data: document, error: fetchError } = await supabase
          .from('documents')
          .select('url')
          .eq('id', id)
          .eq('user_id', userId)
          .single()

        if (fetchError) {
          console.error('❌ [CompleteHybridService] Erreur récupération document:', fetchError)
          throw fetchError
        }

        // Supprimer le fichier du storage
        if (document?.url) {
          const filePath = document.url.split('/').slice(-2).join('/')
          const { error: storageError } = await supabase.storage
            .from('documents')
            .remove([filePath])

          if (storageError) {
            console.error('❌ [CompleteHybridService] Erreur suppression storage:', storageError)
          }
        }

        // Supprimer l'entrée de la table
        const { error } = await supabase
          .from('documents')
          .delete()
          .eq('id', id)
          .eq('user_id', userId)

        if (error) {
          console.error('❌ [CompleteHybridService] Erreur Supabase:', error)
          throw error
        }

        console.log('✅ [CompleteHybridService] Document supprimé de Supabase')
      } else {
        console.log('💾 [CompleteHybridService] Utilisation de localStorage')
        const documents = this.getFromStorage<CompleteDocument>('documents')
        const filteredDocuments = documents.filter(d => d.id !== id)
        this.saveToStorage('documents', filteredDocuments)
        console.log('✅ [CompleteHybridService] Document supprimé de localStorage')
      }
    } catch (error) {
      console.error('❌ [CompleteHybridService] Erreur lors de la suppression du document:', error)
      
      // Fallback vers localStorage
      console.log('🔄 [CompleteHybridService] Fallback vers localStorage')
      const documents = this.getFromStorage<CompleteDocument>('documents')
      const filteredDocuments = documents.filter(d => d.id !== id)
      this.saveToStorage('documents', filteredDocuments)
      console.log('✅ [CompleteHybridService] Document supprimé de localStorage (fallback)')
    }
  }

  // Méthodes de mapping pour les documents
  private mapDocumentFromSupabase(data: any): CompleteDocument {
    return {
      id: data.id?.toString(),
      nom: data.nom,
      type: data.type,
      taille: data.taille,
      url: data.url,
      description: data.description,
      user_id: data.user_id
    }
  }

  private mapDocumentToSupabase(document: CompleteDocument): any {
    return {
      nom: document.nom,
      type: document.type,
      taille: document.taille,
      url: document.url,
      description: document.description
    }
  }

  // ===== GESTION DES UTILISATEURS =====

  async createUser(userData: Omit<CompleteUser, 'id' | 'created_at' | 'updated_at'> & { password: string }): Promise<CompleteUser> {
    console.log('🔍 [CompleteHybridService] createUser() - Début')
    console.log('👤 [CompleteHybridService] Utilisateur à créer:', userData.email)

    try {
      if (this.isUserAuthenticated()) {
        console.log('📡 [CompleteHybridService] Utilisation de Supabase')
        
        // Générer un ID unique pour l'utilisateur
        const userId = this.generateId()
        
        // Créer l'utilisateur directement dans la table users
        const userRecord = {
          id: userId,
          email: userData.email,
          first_name: userData.first_name,
          last_name: userData.last_name,
          role: userData.role,
          phone: userData.phone,
          actif: userData.actif,
          password_hash: await this.hashPassword(userData.password) // Hash du mot de passe
        }

        const { data, error } = await supabase
          .from('users')
          .insert([userRecord])
          .select()
          .single()

        if (error) {
          console.error('❌ [CompleteHybridService] Erreur création utilisateur DB:', error)
          throw error
        }

        console.log('✅ [CompleteHybridService] Utilisateur créé dans DB:', data)
        const mappedData = this.mapUserFromSupabase(data)
        console.log('🔄 [CompleteHybridService] Utilisateur mappé:', mappedData)
        return mappedData
      } else {
        console.log('💾 [CompleteHybridService] Utilisation de localStorage')
        const users = this.getFromStorage<CompleteUser>('users')
        const newUser = {
          ...userData,
          id: this.generateId(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        users.push(newUser)
        this.saveToStorage('users', users)
        console.log('✅ [CompleteHybridService] Utilisateur créé dans localStorage:', newUser)
        return newUser
      }
    } catch (error) {
      console.error('❌ [CompleteHybridService] Erreur lors de la création de l\'utilisateur:', error)
      throw error
    }
  }

  async updateUser(id: string, updates: Partial<CompleteUser>): Promise<CompleteUser> {
    console.log('🔍 [CompleteHybridService] updateUser() - Début')
    console.log('👤 [CompleteHybridService] Utilisateur à mettre à jour:', id, updates)

    try {
      if (this.isUserAuthenticated()) {
        console.log('📡 [CompleteHybridService] Utilisation de Supabase')
        
        // Mettre à jour dans la table users
        const supabaseUpdates = this.mapUserToSupabase(updates as CompleteUser)
        const { data, error } = await supabase
          .from('users')
          .update(supabaseUpdates)
          .eq('id', id)
          .select()
          .single()

        if (error) {
          console.error('❌ [CompleteHybridService] Erreur Supabase:', error)
          throw error
        }

        console.log('✅ [CompleteHybridService] Utilisateur mis à jour dans Supabase:', data)
        const mappedData = this.mapUserFromSupabase(data)
        console.log('🔄 [CompleteHybridService] Utilisateur mappé:', mappedData)
        return mappedData
      } else {
        console.log('💾 [CompleteHybridService] Utilisation de localStorage')
        const users = this.getFromStorage<CompleteUser>('users')
        const userIndex = users.findIndex(u => u.id === id)
        if (userIndex !== -1) {
          users[userIndex] = { ...users[userIndex], ...updates, updated_at: new Date().toISOString() }
          this.saveToStorage('users', users)
          console.log('✅ [CompleteHybridService] Utilisateur mis à jour dans localStorage:', users[userIndex])
          return users[userIndex]
        } else {
          throw new Error('Utilisateur non trouvé')
        }
      }
    } catch (error) {
      console.error('❌ [CompleteHybridService] Erreur lors de la mise à jour de l\'utilisateur:', error)
      throw error
    }
  }

  async deleteUser(id: string): Promise<void> {
    console.log('🔍 [CompleteHybridService] deleteUser() - Début')
    console.log('👤 [CompleteHybridService] Utilisateur à supprimer:', id)

    try {
      if (this.isUserAuthenticated()) {
        console.log('📡 [CompleteHybridService] Utilisation de Supabase')
        
        // Supprimer de la table users
        const { error } = await supabase
          .from('users')
          .delete()
          .eq('id', id)

        if (error) {
          console.error('❌ [CompleteHybridService] Erreur Supabase:', error)
          throw error
        }

        // Supprimer de Supabase Auth (nécessite les droits admin)
        const { error: authError } = await supabase.auth.admin.deleteUser(id)
        if (authError) {
          console.warn('⚠️ [CompleteHybridService] Erreur suppression Auth (peut nécessiter droits admin):', authError)
        }

        console.log('✅ [CompleteHybridService] Utilisateur supprimé de Supabase')
      } else {
        console.log('💾 [CompleteHybridService] Utilisation de localStorage')
        const users = this.getFromStorage<CompleteUser>('users')
        const filteredUsers = users.filter(u => u.id !== id)
        this.saveToStorage('users', filteredUsers)
        console.log('✅ [CompleteHybridService] Utilisateur supprimé de localStorage')
      }
    } catch (error) {
      console.error('❌ [CompleteHybridService] Erreur lors de la suppression de l\'utilisateur:', error)
      throw error
    }
  }

  async loginUser(email: string, password: string): Promise<{ user: any; session: any }> {
    console.log('🔍 [CompleteHybridService] loginUser() - Début')
    console.log('👤 [CompleteHybridService] Connexion pour:', email)

    try {
      // Chercher l'utilisateur dans notre table users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('actif', true)
        .single()

      if (userError || !userData) {
        throw new Error('Utilisateur non trouvé ou inactif')
      }

      // Vérifier le mot de passe
      const isValidPassword = await this.verifyPassword(password, userData.password_hash)
      if (!isValidPassword) {
        throw new Error('Mot de passe incorrect')
      }

      // Créer une session simulée
      const session = {
        user: {
          id: userData.id,
          email: userData.email,
          user_metadata: {
            first_name: userData.first_name,
            last_name: userData.last_name,
            role: userData.role,
            phone: userData.phone
          }
        },
        access_token: this.generateToken(userData.id),
        refresh_token: this.generateToken(userData.id)
      }

      console.log('✅ [CompleteHybridService] Connexion réussie:', userData.id)
      return { user: session.user, session }
    } catch (error) {
      console.error('❌ [CompleteHybridService] Erreur lors de la connexion:', error)
      throw error
    }
  }

  // Méthode pour hasher les mots de passe
  private async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(password)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  // Méthode pour vérifier les mots de passe
  private async verifyPassword(password: string, hash: string): Promise<boolean> {
    const passwordHash = await this.hashPassword(password)
    return passwordHash === hash
  }

  // Méthode pour générer un token simple
  private generateToken(userId: string): string {
    return btoa(JSON.stringify({ userId, timestamp: Date.now() }))
  }

  // ===== DASHBOARD STATISTIQUES =====

  // Fonction utilitaire pour construire les requêtes avec ou sans user_id
  private buildQuery(tableName: string, userId: string | null) {
    let query = supabase.from(tableName).select('*')
    if (userId) {
      query = query.eq('user_id', userId)
    }
    return query
  }

  // Récupérer les informations du stock
  async getStockInfo(): Promise<any> {
    console.log('🔍 [CompleteHybridService] getStockInfo() - Début')
    
    try {
      if (this.isUserAuthenticated()) {
        console.log('📡 [CompleteHybridService] Utilisation de Supabase pour le stock')
        const userId = this.getCurrentUserId()
        
        const { data, error } = await this.buildQuery('articles', userId)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('❌ [CompleteHybridService] Erreur Supabase stock:', error)
          throw error
        }

        const articles = (data || []).map((item: any) => this.mapArticleFromSupabase(item))
        
        const stockInfo = {
          totalArticles: articles.length,
          stockCritique: articles.filter((a: any) => a.stock <= a.seuilCritique).length,
          valeurTotale: articles.reduce((sum: number, a: any) => sum + (a.stock * a.prix), 0),
          articlesCritiques: articles.filter((a: any) => a.stock <= a.seuilCritique),
          stockMoyen: articles.length > 0 ? articles.reduce((sum: number, a: any) => sum + a.stock, 0) / articles.length : 0
        }

        console.log('✅ [CompleteHybridService] Informations stock récupérées:', stockInfo)
        return stockInfo
      } else {
        throw new Error('Mode Supabase forcé - localStorage non disponible')
      }
    } catch (error) {
      console.error('❌ [CompleteHybridService] Erreur lors de la récupération du stock:', error)
      throw error
    }
  }

  // Récupérer les productions du jour
  async getProductionsDuJour(): Promise<any> {
    console.log('🔍 [CompleteHybridService] getProductionsDuJour() - Début')
    
    try {
      if (this.isUserAuthenticated()) {
        console.log('📡 [CompleteHybridService] Utilisation de Supabase pour les productions du jour')
        const userId = this.getCurrentUserId()
        
        const aujourdhui = new Date().toISOString().split('T')[0]
        
        const { data, error } = await this.buildQuery('production', userId)
          .gte('date', `${aujourdhui}T00:00:00.000Z`)
          .lte('date', `${aujourdhui}T23:59:59.999Z`)
          .order('date', { ascending: false })

        if (error) {
          console.error('❌ [CompleteHybridService] Erreur Supabase productions du jour:', error)
          throw error
        }

        const productions = (data || []).map((item: any) => this.mapProductionFromSupabase(item))
        
        const productionsInfo = {
          total: productions.length,
          enCours: productions.filter((p: any) => p.statut === 'en_cours').length,
          terminees: productions.filter((p: any) => p.statut === 'termine').length,
          annulees: productions.filter((p: any) => p.statut === 'annule').length,
          productions: productions
        }

        console.log('✅ [CompleteHybridService] Productions du jour récupérées:', productionsInfo)
        return productionsInfo
      } else {
        throw new Error('Mode Supabase forcé - localStorage non disponible')
      }
    } catch (error) {
      console.error('❌ [CompleteHybridService] Erreur lors de la récupération des productions du jour:', error)
      throw error
    }
  }

  // Récupérer les livraisons récentes
  async getLivraisonsRecentes(): Promise<any> {
    console.log('🔍 [CompleteHybridService] getLivraisonsRecentes() - Début')
    
    try {
      if (this.isUserAuthenticated()) {
        console.log('📡 [CompleteHybridService] Utilisation de Supabase pour les livraisons récentes')
        const userId = this.getCurrentUserId()
        
        const { data, error } = await this.buildQuery('livraisons', userId)
          .order('date', { ascending: false })
          .limit(10)

        if (error) {
          console.error('❌ [CompleteHybridService] Erreur Supabase livraisons récentes:', error)
          throw error
        }

        const livraisons = (data || []).map((item: any) => this.mapLivraisonFromSupabase(item))
        
        const livraisonsInfo = {
          total: livraisons.length,
          enCours: livraisons.filter((l: any) => l.statut === 'en_cours').length,
          livrees: livraisons.filter((l: any) => l.statut === 'livre').length,
          enAttente: livraisons.filter((l: any) => l.statut === 'en_attente').length,
          livraisons: livraisons
        }

        console.log('✅ [CompleteHybridService] Livraisons récentes récupérées:', livraisonsInfo)
        return livraisonsInfo
      } else {
        throw new Error('Mode Supabase forcé - localStorage non disponible')
      }
    } catch (error) {
      console.error('❌ [CompleteHybridService] Erreur lors de la récupération des livraisons récentes:', error)
      throw error
    }
  }

  // Récupérer la production par semaine
  async getProductionParSemaine(): Promise<any> {
    console.log('🔍 [CompleteHybridService] getProductionParSemaine() - Début')
    
    try {
      if (this.isUserAuthenticated()) {
        console.log('📡 [CompleteHybridService] Utilisation de Supabase pour la production par semaine')
        const userId = this.getCurrentUserId()
        
        // Calculer le début et la fin de la semaine
        const maintenant = new Date()
        const debutSemaine = new Date(maintenant.setDate(maintenant.getDate() - maintenant.getDay()))
        const finSemaine = new Date(debutSemaine)
        finSemaine.setDate(finSemaine.getDate() + 6)
        
        const { data, error } = await this.buildQuery('production', userId)
          .gte('date', debutSemaine.toISOString())
          .lte('date', finSemaine.toISOString())
          .order('date', { ascending: false })

        if (error) {
          console.error('❌ [CompleteHybridService] Erreur Supabase production par semaine:', error)
          throw error
        }

        const productions = (data || []).map((item: any) => this.mapProductionFromSupabase(item))
        
        // Grouper par jour de la semaine
        const productionParJour = {
          lundi: productions.filter((p: any) => new Date(p.date).getDay() === 1).length,
          mardi: productions.filter((p: any) => new Date(p.date).getDay() === 2).length,
          mercredi: productions.filter((p: any) => new Date(p.date).getDay() === 3).length,
          jeudi: productions.filter((p: any) => new Date(p.date).getDay() === 4).length,
          vendredi: productions.filter((p: any) => new Date(p.date).getDay() === 5).length,
          samedi: productions.filter((p: any) => new Date(p.date).getDay() === 6).length,
          dimanche: productions.filter((p: any) => new Date(p.date).getDay() === 0).length
        }
        
        const productionInfo = {
          totalSemaine: productions.length,
          enCours: productions.filter((p: any) => p.statut === 'en_cours').length,
          terminees: productions.filter((p: any) => p.statut === 'termine').length,
          parJour: productionParJour,
          productions: productions
        }

        console.log('✅ [CompleteHybridService] Production par semaine récupérée:', productionInfo)
        return productionInfo
      } else {
        throw new Error('Mode Supabase forcé - localStorage non disponible')
      }
    } catch (error) {
      console.error('❌ [CompleteHybridService] Erreur lors de la récupération de la production par semaine:', error)
      throw error
    }
  }

  async getDashboardStats(): Promise<any> {
    console.log('🔍 [CompleteHybridService] getDashboardStats() - Début')
    
    try {
      if (this.isUserAuthenticated()) {
        console.log('📡 [CompleteHybridService] Utilisation de Supabase')
        const userId = this.getCurrentUserId()
        
        if (!userId) {
          throw new Error('Utilisateur non authentifié')
        }

        // Récupérer toutes les données en parallèle
        const [articles, commandes, livraisons, productions] = await Promise.all([
          this.getArticles(),
          this.getCommandes(),
          this.getLivraisons(),
          this.getProductions()
        ])

        const stats = {
          totalArticles: articles.length,
          totalCommandes: commandes.length,
          totalLivraisons: livraisons.length,
          totalProductions: productions.length,
          // Statistiques détaillées pour usage futur
          details: {
            articles: {
              total: articles.length,
              stockCritique: articles.filter((a: any) => a.stock <= a.seuilCritique).length,
              valeurTotale: articles.reduce((sum: number, a: any) => sum + (a.stock * a.prix), 0)
            },
            commandes: {
              total: commandes.length,
              enAttente: commandes.filter(c => c.statut === 'en_attente').length,
              confirmees: commandes.filter(c => c.statut === 'confirmee').length,
              livrees: commandes.filter(c => c.statut === 'livree').length
            },
            livraisons: {
              total: livraisons.length,
              enCours: livraisons.filter((l: any) => l.statut === 'en_cours').length,
              livrees: livraisons.filter((l: any) => l.statut === 'livre').length
            },
            productions: {
              total: productions.length,
              enCours: productions.filter((p: any) => p.statut === 'en_cours').length,
              terminees: productions.filter((p: any) => p.statut === 'termine').length
            }
          }
        }

        console.log('✅ [CompleteHybridService] Statistiques calculées:', stats)
        return stats
      } else {
        // Mode Supabase forcé - ne devrait jamais arriver
        console.log('⚠️ [CompleteHybridService] Mode Supabase forcé - section else ignorée')
        throw new Error('Mode Supabase forcé - localStorage non disponible')
      }
    } catch (error) {
      console.error('❌ [CompleteHybridService] Erreur lors du calcul des statistiques:', error)
      // Mode Supabase forcé - retourner des statistiques vides en cas d'erreur
      return {
        totalArticles: 0,
        totalCommandes: 0,
        totalLivraisons: 0,
        totalProductions: 0,
        details: {
          articles: { total: 0, stockCritique: 0, valeurTotale: 0 },
          commandes: { total: 0, enAttente: 0, confirmees: 0, livrees: 0 },
          livraisons: { total: 0, enCours: 0, livrees: 0 },
          productions: { total: 0, enCours: 0, terminees: 0 }
        }
      }
    }
  }

  // ===== UTILITAIRES =====

  generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
  }

  getMode(): 'online' | 'offline' {
    // Force l'utilisation de Supabase - toujours retourner 'online'
    console.log('📡 [CompleteHybridService] Mode Supabase forcé - getMode = online')
    return 'online'
  }

  isSupabaseEnabled(): boolean {
    // Force l'utilisation de Supabase - toujours retourner true
    console.log('📡 [CompleteHybridService] Mode Supabase forcé - isSupabaseEnabled = true')
    return true
  }
}

// Instance singleton
export const completeHybridService = new CompleteHybridService()

// Composable pour utiliser le service hybride complet
export const useCompleteHybridService = () => {
  return {
    // Articles
    getArticles: completeHybridService.getArticles.bind(completeHybridService),
    addArticle: completeHybridService.addArticle.bind(completeHybridService),
    updateArticle: completeHybridService.updateArticle.bind(completeHybridService),
    deleteArticle: completeHybridService.deleteArticle.bind(completeHybridService),
    
    // Commandes
    getCommandes: completeHybridService.getCommandes.bind(completeHybridService),
    addCommande: completeHybridService.addCommande.bind(completeHybridService),
    updateCommande: completeHybridService.updateCommande.bind(completeHybridService),
    deleteCommande: completeHybridService.deleteCommande.bind(completeHybridService),
    
    // Livraisons
    getLivraisons: completeHybridService.getLivraisons.bind(completeHybridService),
    addLivraison: completeHybridService.addLivraison.bind(completeHybridService),
    updateLivraison: completeHybridService.updateLivraison.bind(completeHybridService),
    deleteLivraison: completeHybridService.deleteLivraison.bind(completeHybridService),
    
    // Production
    getProductions: completeHybridService.getProductions.bind(completeHybridService),
    addProduction: completeHybridService.addProduction.bind(completeHybridService),
    updateProduction: completeHybridService.updateProduction.bind(completeHybridService),
    deleteProduction: completeHybridService.deleteProduction.bind(completeHybridService),
    
    // Utilisateurs
    getUsers: completeHybridService.getUsers.bind(completeHybridService),
    createUser: completeHybridService.createUser.bind(completeHybridService),
    updateUser: completeHybridService.updateUser.bind(completeHybridService),
    deleteUser: completeHybridService.deleteUser.bind(completeHybridService),
    loginUser: completeHybridService.loginUser.bind(completeHybridService),
    
    // Analyses
    getAnalyses: completeHybridService.getAnalyses.bind(completeHybridService),
    addAnalyse: completeHybridService.addAnalyse.bind(completeHybridService),
    updateAnalyse: completeHybridService.updateAnalyse.bind(completeHybridService),
    deleteAnalyse: completeHybridService.deleteAnalyse.bind(completeHybridService),
    
    // Documents
    getDocuments: completeHybridService.getDocuments.bind(completeHybridService),
    addDocument: completeHybridService.addDocument.bind(completeHybridService),
    deleteDocument: completeHybridService.deleteDocument.bind(completeHybridService),
    
    // Dashboard
    getDashboardStats: completeHybridService.getDashboardStats.bind(completeHybridService),
    getStockInfo: completeHybridService.getStockInfo.bind(completeHybridService),
    getProductionsDuJour: completeHybridService.getProductionsDuJour.bind(completeHybridService),
    getLivraisonsRecentes: completeHybridService.getLivraisonsRecentes.bind(completeHybridService),
    getProductionParSemaine: completeHybridService.getProductionParSemaine.bind(completeHybridService),
    
    // Utilitaires
    generateId: completeHybridService.generateId.bind(completeHybridService),
    getMode: completeHybridService.getMode.bind(completeHybridService),
    isSupabaseEnabled: completeHybridService.isSupabaseEnabled.bind(completeHybridService)
  }
}
