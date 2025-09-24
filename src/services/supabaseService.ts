import { supabase, type Production, type Commande, type Livraison, type Article, type Personnel } from '../lib/supabase'
import { useAuth } from './auth'

// Service Supabase pour remplacer le storageService
export class SupabaseService {
  private getCurrentUserId(): string | null {
    const { user } = useAuth()
    return user.value?.id || null
  }

  // ===== GESTION DES ARTICLES =====
  
  async getArticles(): Promise<Article[]> {
    const userId = this.getCurrentUserId()
    if (!userId) throw new Error('Utilisateur non authentifié')

    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  async addArticle(article: Omit<Article, 'id' | 'user_id'>): Promise<Article> {
    const userId = this.getCurrentUserId()
    if (!userId) throw new Error('Utilisateur non authentifié')

    const { data, error } = await supabase
      .from('articles')
      .insert({
        ...article,
        user_id: userId
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  async updateArticle(id: number, updates: Partial<Article>): Promise<Article> {
    const userId = this.getCurrentUserId()
    if (!userId) throw new Error('Utilisateur non authentifié')

    const { data, error } = await supabase
      .from('articles')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async deleteArticle(id: number): Promise<void> {
    const userId = this.getCurrentUserId()
    if (!userId) throw new Error('Utilisateur non authentifié')

    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) throw error
  }

  // ===== GESTION DES COMMANDES =====

  async getCommandes(): Promise<Commande[]> {
    const userId = this.getCurrentUserId()
    if (!userId) throw new Error('Utilisateur non authentifié')

    const { data, error } = await supabase
      .from('commandes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  async addCommande(commande: Omit<Commande, 'id' | 'user_id'>): Promise<Commande> {
    const userId = this.getCurrentUserId()
    if (!userId) throw new Error('Utilisateur non authentifié')

    const { data, error } = await supabase
      .from('commandes')
      .insert({
        ...commande,
        user_id: userId
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  async updateCommande(id: number, updates: Partial<Commande>): Promise<Commande> {
    const userId = this.getCurrentUserId()
    if (!userId) throw new Error('Utilisateur non authentifié')

    const { data, error } = await supabase
      .from('commandes')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async deleteCommande(id: number): Promise<void> {
    const userId = this.getCurrentUserId()
    if (!userId) throw new Error('Utilisateur non authentifié')

    const { error } = await supabase
      .from('commandes')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) throw error
  }

  // ===== GESTION DES LIVRAISONS =====

  async getLivraisons(): Promise<Livraison[]> {
    const userId = this.getCurrentUserId()
    if (!userId) throw new Error('Utilisateur non authentifié')

    const { data, error } = await supabase
      .from('livraisons')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  async addLivraison(livraison: Omit<Livraison, 'id' | 'user_id'>): Promise<Livraison> {
    const userId = this.getCurrentUserId()
    if (!userId) throw new Error('Utilisateur non authentifié')

    const { data, error } = await supabase
      .from('livraisons')
      .insert({
        ...livraison,
        user_id: userId
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  async updateLivraison(id: number, updates: Partial<Livraison>): Promise<Livraison> {
    const userId = this.getCurrentUserId()
    if (!userId) throw new Error('Utilisateur non authentifié')

    const { data, error } = await supabase
      .from('livraisons')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async deleteLivraison(id: number): Promise<void> {
    const userId = this.getCurrentUserId()
    if (!userId) throw new Error('Utilisateur non authentifié')

    const { error } = await supabase
      .from('livraisons')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) throw error
  }

  // ===== GESTION DE LA PRODUCTION =====

  async getProductions(): Promise<Production[]> {
    const userId = this.getCurrentUserId()
    if (!userId) throw new Error('Utilisateur non authentifié')

    const { data, error } = await supabase
      .from('production')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  async addProduction(production: Omit<Production, 'id' | 'user_id'>): Promise<Production> {
    const userId = this.getCurrentUserId()
    if (!userId) throw new Error('Utilisateur non authentifié')

    const { data, error } = await supabase
      .from('production')
      .insert({
        ...production,
        user_id: userId
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  async updateProduction(id: number, updates: Partial<Production>): Promise<Production> {
    const userId = this.getCurrentUserId()
    if (!userId) throw new Error('Utilisateur non authentifié')

    const { data, error } = await supabase
      .from('production')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async deleteProduction(id: number): Promise<void> {
    const userId = this.getCurrentUserId()
    if (!userId) throw new Error('Utilisateur non authentifié')

    const { error } = await supabase
      .from('production')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) throw error
  }

  // ===== GESTION DU PERSONNEL =====

  async getPersonnel(): Promise<Personnel[]> {
    const userId = this.getCurrentUserId()
    if (!userId) throw new Error('Utilisateur non authentifié')

    const { data, error } = await supabase
      .from('personnel')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  async addPersonnel(personnel: Omit<Personnel, 'id' | 'user_id'>): Promise<Personnel> {
    const userId = this.getCurrentUserId()
    if (!userId) throw new Error('Utilisateur non authentifié')

    const { data, error } = await supabase
      .from('personnel')
      .insert({
        ...personnel,
        user_id: userId
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  async updatePersonnel(id: number, updates: Partial<Personnel>): Promise<Personnel> {
    const userId = this.getCurrentUserId()
    if (!userId) throw new Error('Utilisateur non authentifié')

    const { data, error } = await supabase
      .from('personnel')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async deletePersonnel(id: number): Promise<void> {
    const userId = this.getCurrentUserId()
    if (!userId) throw new Error('Utilisateur non authentifié')

    const { error } = await supabase
      .from('personnel')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) throw error
  }

  // ===== GESTION DES DOCUMENTS =====

  async getDocuments(): Promise<any[]> {
    const userId = this.getCurrentUserId()
    if (!userId) throw new Error('Utilisateur non authentifié')

    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  async addDocument(document: Omit<any, 'id' | 'user_id'>): Promise<any> {
    const userId = this.getCurrentUserId()
    if (!userId) throw new Error('Utilisateur non authentifié')

    const { data, error } = await supabase
      .from('documents')
      .insert({
        ...document,
        user_id: userId
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  async deleteDocument(id: number): Promise<void> {
    const userId = this.getCurrentUserId()
    if (!userId) throw new Error('Utilisateur non authentifié')

    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) throw error
  }

  // ===== GESTION DES ANALYSES =====

  async getAnalyses(): Promise<any[]> {
    const userId = this.getCurrentUserId()
    if (!userId) throw new Error('Utilisateur non authentifié')

    const { data, error } = await supabase
      .from('analyses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  async addAnalyse(analyse: Omit<any, 'id' | 'user_id'>): Promise<any> {
    const userId = this.getCurrentUserId()
    if (!userId) throw new Error('Utilisateur non authentifié')

    const { data, error } = await supabase
      .from('analyses')
      .insert({
        ...analyse,
        user_id: userId
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  // ===== MÉTHODES UTILITAIRES =====

  // Génération de numéros
  generateNumeroBL(): string {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hour = String(date.getHours()).padStart(2, '0')
    const minute = String(date.getMinutes()).padStart(2, '0')
    return `BL-${year}${month}${day}-${hour}${minute}`
  }

  generateNumeroCommande(): string {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hour = String(date.getHours()).padStart(2, '0')
    const minute = String(date.getMinutes()).padStart(2, '0')
    return `CMD-${year}${month}${day}-${hour}${minute}`
  }

  generateCodeSuivi(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  generateLotId(): string {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hour = String(date.getHours()).padStart(2, '0')
    const minute = String(date.getMinutes()).padStart(2, '0')
    return `LOT-${year}-${month}${day}-${hour}${minute}`
  }

  // ===== MÉTHODES SPÉCIALISÉES POUR LES LIVRAISONS =====

  async creerLivraisonDepuisCommande(commande: Commande, chauffeur: string): Promise<Livraison> {
    const produitsLivraison = commande.produits.map(produit => ({
      nom: produit.nom,
      quantite: produit.quantite,
      quantiteCommandee: produit.quantite,
      quantiteLivree: 0,
      unite: produit.unite,
      difference: 0,
      resteAPayer: 0
    }))

    const livraison: Omit<Livraison, 'id' | 'user_id'> = {
      numeroBL: this.generateNumeroBL(),
      date: new Date().toISOString().split('T')[0],
      client: commande.client,
      telephone: commande.telephone,
      chauffeur,
      produits: produitsLivraison,
      statut: 'en_attente',
      adresse: commande.adresse,
      codeSuivi: this.generateCodeSuivi(),
      totalCommande: 0,
      totalLivraison: 0,
      differenceTotale: 0,
      resteAPayerTotal: 0
    }

    return this.addLivraison(livraison)
  }

  async mettreAJourQuantitesLivrees(idLivraison: number, quantitesLivrees: Array<{ nom: string, quantite: number }>): Promise<Livraison> {
    const livraison = await this.getLivraisons()
    const livraisonToUpdate = livraison.find(l => l.id === idLivraison)
    
    if (!livraisonToUpdate) {
      throw new Error('Livraison non trouvée')
    }

    // Mettre à jour les quantités livrées
    livraisonToUpdate.produits.forEach(produit => {
      const quantiteLivree = quantitesLivrees.find(q => q.nom === produit.nom)
      if (quantiteLivree) {
        produit.quantiteLivree = quantiteLivree.quantite
      }
    })

    // Recalculer les différences
    const livraisonCalculee = this.calculerDifferencesLivraison(livraisonToUpdate)
    
    return this.updateLivraison(idLivraison, livraisonCalculee)
  }

  private calculerDifferencesLivraison(livraison: Livraison): Partial<Livraison> {
    let totalCommande = 0
    let totalLivraison = 0
    let differenceTotale = 0
    let resteAPayerTotal = 0

    livraison.produits.forEach(produit => {
      produit.difference = produit.quantiteCommandee - produit.quantiteLivree
      
      // Calculer le reste à payer (basé sur le prix unitaire du stock)
      const prixUnitaire = 0 // TODO: Récupérer depuis les articles
      produit.resteAPayer = produit.difference * prixUnitaire
      
      totalCommande += produit.quantiteCommandee * prixUnitaire
      totalLivraison += produit.quantiteLivree * prixUnitaire
      differenceTotale += produit.difference * prixUnitaire
      resteAPayerTotal += produit.resteAPayer
    })

    return {
      totalCommande,
      totalLivraison,
      differenceTotale,
      resteAPayerTotal
    }
  }

  async finaliserLivraisonAvecSignature(idLivraison: number, signatureClient: string, observations?: string): Promise<Livraison> {
    const updates: Partial<Livraison> = {
      statut: 'livre',
      // Ajouter les champs de signature si nécessaire
    }

    if (observations) {
      // Ajouter les observations si nécessaire
    }

    return this.updateLivraison(idLivraison, updates)
  }

  // ===== STATISTIQUES =====

  async getProductionToday(): Promise<number> {
    const today = new Date().toISOString().split('T')[0]
    const productions = await this.getProductions()
    
    return productions
      .filter(p => p.date === today && p.statut === 'termine')
      .reduce((sum, p) => {
        const totalArticles = p.articlesProduits.reduce((articleSum, article) => 
          articleSum + article.quantiteProduite, 0)
        return sum + totalArticles
      }, 0)
  }

  async getProductionEnCours(): Promise<Production[]> {
    const productions = await this.getProductions()
    return productions.filter(p => p.statut === 'en_cours')
  }

  async getLivraisonsNonTerminees(): Promise<Livraison[]> {
    const livraisons = await this.getLivraisons()
    return livraisons.filter(l => l.statut !== 'livre' && l.statut !== 'annule')
  }

  async getLivraisonsTerminees(): Promise<Livraison[]> {
    const livraisons = await this.getLivraisons()
    return livraisons.filter(l => l.statut === 'livre' || l.statut === 'annule')
  }
}

// Instance singleton
export const supabaseService = new SupabaseService()
