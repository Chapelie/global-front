// Service pour gérer le localStorage avec synchronisation Supabase
import { supabaseSyncService } from './supabaseSync'

export interface User {
  id: number
  username: string
  email: string
  role: 'super_admin' | 'admin' | 'secretaire' | 'livreur'
  password: string
  isLoggedIn: boolean
}

// Type pour les transferts
export interface Transfert {
  id: number
  numeroBordereau: string
  date: string
  client: string
  telephone?: string
  email?: string
  adresse?: string
  produits: Array<{
    designation: string
    quantite: number
    unite: string
    observation?: string
  }>
  chauffeur?: {
    nom: string
    telephone?: string
  }
  statut: 'en_preparation' | 'en_cours' | 'termine'
  dateCreation: string
  dateModification: string
  notes?: string
}

export interface Production {
  id: number
  date: string
  articlesProduits: Array<{
    articleId: number
    quantiteProduite: number
    quantitePlanifiee: number
    unite: string
  }>
  consommables: Array<{
    articleId: number
    quantiteUtilisee: number
    unite: string
  }>
  statut: 'en_cours' | 'termine' | 'en_attente'
  lotId: string
  heureDebut?: string
  heureFin?: string
  operateur?: string
  machine?: string
  qualiteProduite?: 'excellente' | 'bonne' | 'moyenne' | 'defectueuse'
  notes?: string
  tempsEffectif?: number // en minutes
  rendement?: number // en pourcentage
  coutProduction?: number
}

// Interface pour les rapports quotidiens de production
export interface RapportProductionQuotidien {
  id: number
  date: string
  productionsIds: number[]
  resumeProduction: {
    totalArticlesProduits: number
    totalConsommablesUtilises: number
    tempsProductionTotal: number
    rendementMoyen: number
    coutProductionTotal: number
  }
  detailsParArticle: Array<{
    articleId: number
    quantiteProduite: number
    quantitePlanifiee: number
    tauxRealisation: number
    coutProduction: number
  }>
  detailsConsommables: Array<{
    articleId: number
    quantiteUtilisee: number
    coutTotal: number
  }>
  incidents?: string
  observations?: string
  operateurs: string[]
  machines: string[]
}

export interface Commande {
  id: number
  numeroCommande: string
  date: string
  client: string
  telephone: string
  email: string
  adresse: string
  produits: Array<{
    nom: string
    quantite: number
    unite: string
    quantiteLivree?: number
    quantiteRestante?: number
    statutLivraison?: 'non_livre' | 'partiellement_livre' | 'livre'
  }>
  statut: 'en_attente' | 'confirmee' | 'en_preparation' | 'livree' | 'annulee'
  dateLivraisonSouhaitee?: string
  priorite: 'basse' | 'normale' | 'haute' | 'urgente'
  statutGlobalLivraison?: 'non_livre' | 'partiellement_livre' | 'livre'
  totalLivraisons?: number
  totalRestant?: number
}

export interface Livraison {
  id: number
  numeroBL: string
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
  preuveDepot?: string
  preuveReception?: string
  signatureClient?: string
  observations?: string
  heureLivraison?: string
  dateLivraison?: string
  totalCommande: number
  totalLivraison: number
  differenceTotale: number
  resteAPayerTotal: number
  // Nouvelles propriétés pour la gestion de clôture
  cloturee?: boolean
  dateClotureManuelle?: string
  notesCloture?: string
}

export interface Article {
  id: number
  nom: string
  categorie: string
  stock: number
  seuilCritique: number
  unite: string
  prix: number
  fournisseur: string
  derniereMiseAJour: string
  notes?: string
  // Nouvelles propriétés pour la production
  typeProduction: 'brique' | 'palette' | 'ciment' | 'granit' | 'autre'
  capaciteProduction: number // Capacité de production par jour
  uniteProduction: string // Unité de production (briques/jour, palettes/jour, etc.)
  coutProduction: number // Coût de production unitaire
  tempsProduction: number // Temps de production en minutes
  qualite: 'standard' | 'premium' | 'luxe'
  actif: boolean // Si l'article est actif en production
}

// Nouvelle interface pour les états de production des articles
export interface EtatProductionArticle {
  id: number
  articleId: number
  date: string
  quantiteProduite: number
  quantitePlanifiee: number
  statut: 'planifie' | 'en_cours' | 'termine' | 'annule'
  heureDebut?: string
  heureFin?: string
  operateur?: string
  machine?: string
  qualiteProduite: 'excellente' | 'bonne' | 'moyenne' | 'defectueuse'
  notes?: string
  tempsEffectif: number // Temps effectif en minutes
  rendement: number // Rendement en pourcentage
}

export interface Document {
  id: number
  nom: string
  type: string
  taille: string
  dateUpload: string
  uploader: string
  description?: string
  url?: string
}

export interface Employe {
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

class StorageService {
  private readonly USERS_KEY = 'briqueapp_users'
  private readonly PRODUCTION_KEY = 'briqueapp_production'
  private readonly COMMANDES_KEY = 'briqueapp_commandes'
  private readonly LIVRAISONS_KEY = 'briqueapp_livraisons'
  private readonly STOCK_KEY = 'briqueapp_stock'
  private readonly DOCUMENTS_KEY = 'briqueapp_documents'
  private readonly EMPLOYES_KEY = 'briqueapp_employes'
  private readonly CURRENT_USER_KEY = 'briqueapp_current_user'
  private readonly RAPPORTS_QUOTIDIENS_KEY = 'briqueapp_rapports_quotidiens'
  private readonly TRANSFERTS_KEY = 'briqueapp_transferts'

  // Initialisation des données par défaut
  initializeDefaultData() {
    // Utilisateurs par défaut
    if (!this.getUsers().length) {
      const defaultUsers: User[] = [
        {
          id: 1,
          username: 'admin',
          email: 'admin@briqueapp.com',
          role: 'super_admin',
          password: 'admin123',
          isLoggedIn: false
        },
        {
          id: 2,
          username: 'manager',
          email: 'manager@briqueapp.com',
          role: 'admin',
          password: 'manager123',
          isLoggedIn: false
        },
        {
          id: 3,
          username: 'secretaire',
          email: 'secretaire@briqueapp.com',
          role: 'secretaire',
          password: 'secretaire123',
          isLoggedIn: false
        }
      ]
      this.saveUsers(defaultUsers)
    }

    // Pas d'autres données par défaut - l'application démarre vide
  }

  // Méthode pour vider toutes les données (optionnel)
  clearAllData() {
    localStorage.removeItem(this.PRODUCTION_KEY)
    localStorage.removeItem(this.COMMANDES_KEY)
    localStorage.removeItem(this.LIVRAISONS_KEY)
    localStorage.removeItem(this.STOCK_KEY)
    localStorage.removeItem(this.DOCUMENTS_KEY)
    localStorage.removeItem(this.EMPLOYES_KEY)
    localStorage.removeItem(this.RAPPORTS_QUOTIDIENS_KEY)
    localStorage.removeItem(this.TRANSFERTS_KEY)
    console.log('🗑️ Toutes les données ont été supprimées')
  }

  // Méthodes génériques
  private getItem<T>(key: string): T[] {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : []
    } catch {
      return []
    }
  }

  private setItem<T>(key: string, data: T[]): void {
    try {
      localStorage.setItem(key, JSON.stringify(data))
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
    }
  }

  // Gestion des utilisateurs
  getUsers(): User[] {
    return this.getItem<User>(this.USERS_KEY)
  }

  saveUsers(users: User[]): void {
    this.setItem(this.USERS_KEY, users)
  }

  getCurrentUser(): User | null {
    const userData = localStorage.getItem(this.CURRENT_USER_KEY)
    return userData ? JSON.parse(userData) : null
  }

  setCurrentUser(user: User | null): void {
    if (user) {
      localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(this.CURRENT_USER_KEY)
    }
  }

  // Authentification
  login(username: string, password: string): User | null {
    const users = this.getUsers()
    const user = users.find(u => u.username === username && u.password === password)
    
    if (user) {
      user.isLoggedIn = true
      this.setCurrentUser(user)
      this.saveUsers(users)
      return user
    }
    
    return null
  }

  logout(): void {
    const currentUser = this.getCurrentUser()
    if (currentUser) {
      const users = this.getUsers()
      const userIndex = users.findIndex(u => u.id === currentUser.id)
      if (userIndex !== -1) {
        users[userIndex].isLoggedIn = false
        this.saveUsers(users)
      }
    }
    this.setCurrentUser(null)
  }

  // Gestion de la production
  getProductions(): Production[] {
    return this.getItem<Production>(this.PRODUCTION_KEY)
  }

  saveProductions(productions: Production[]): void {
    this.setItem(this.PRODUCTION_KEY, productions)
  }

  addProduction(production: Omit<Production, 'id'>): Production {
    const productions = this.getProductions()
    const newId = Math.max(...productions.map(p => p.id), 0) + 1
    const newProduction: Production = { ...production, id: newId }
    productions.push(newProduction)
    this.saveProductions(productions)
    return newProduction
  }

  updateProduction(id: number, updates: Partial<Production>): void {
    const productions = this.getProductions()
    const index = productions.findIndex(p => p.id === id)
    if (index !== -1) {
      productions[index] = { ...productions[index], ...updates }
      this.saveProductions(productions)
    }
  }

  deleteProduction(id: number): void {
    const productions = this.getProductions()
    const filtered = productions.filter(p => p.id !== id)
    this.saveProductions(filtered)
  }

  // Gestion des commandes
  getCommandes(): Commande[] {
    const commandes = this.getItem<Commande>(this.COMMANDES_KEY)
    
    // Calculer automatiquement les états de livraison pour chaque commande
    return commandes.map(commande => this.calculerEtatLivraisonCommande(commande))
  }

  saveCommandes(commandes: Commande[]): void {
    this.setItem(this.COMMANDES_KEY, commandes)
  }

  addCommande(commande: Omit<Commande, 'id'>): Commande {
    const commandes = this.getCommandes()
    const newId = Math.max(...commandes.map(c => c.id), 0) + 1
    const newCommande: Commande = { ...commande, id: newId }
    commandes.push(newCommande)
    this.saveCommandes(commandes)
    return newCommande
  }

  updateCommande(id: number, updates: Partial<Commande>): void {
    const commandes = this.getCommandes()
    const index = commandes.findIndex(c => c.id === id)
    if (index !== -1) {
      commandes[index] = { ...commandes[index], ...updates }
      this.saveCommandes(commandes)
    }
  }

  deleteCommande(id: number): void {
    const commandes = this.getCommandes()
    const filtered = commandes.filter(c => c.id !== id)
    this.saveCommandes(filtered)
  }

  // Gestion des livraisons
  getLivraisons(): Livraison[] {
    return this.getItem<Livraison>(this.LIVRAISONS_KEY)
  }

  saveLivraisons(livraisons: Livraison[]): void {
    this.setItem(this.LIVRAISONS_KEY, livraisons)
  }

  addLivraison(livraison: Omit<Livraison, 'id'>): Livraison {
    const livraisons = this.getLivraisons()
    const newId = Math.max(...livraisons.map(l => l.id), 0) + 1
    const newLivraison: Livraison = { ...livraison, id: newId }
    livraisons.push(newLivraison)
    this.saveLivraisons(livraisons)
    return newLivraison
  }

  updateLivraison(id: number, updates: Partial<Livraison>): void {
    const livraisons = this.getLivraisons()
    const index = livraisons.findIndex(l => l.id === id)
    if (index !== -1) {
      livraisons[index] = { ...livraisons[index], ...updates }
      this.saveLivraisons(livraisons)
    }
  }

  deleteLivraison(id: number): void {
    const livraisons = this.getLivraisons()
    const filtered = livraisons.filter(l => l.id !== id)
    this.saveLivraisons(filtered)
  }

  // Génération de numéro BL
  generateNumeroBL(): string {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hour = String(date.getHours()).padStart(2, '0')
    const minute = String(date.getMinutes()).padStart(2, '0')
    return `BL-${year}${month}${day}-${hour}${minute}`
  }

  // Génération de numéro de commande
  generateNumeroCommande(): string {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hour = String(date.getHours()).padStart(2, '0')
    const minute = String(date.getMinutes()).padStart(2, '0')
    return `CMD-${year}${month}${day}-${hour}${minute}`
  }

  // Génération de code de suivi
  generateCodeSuivi(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  // Gestion du stock
  getStock(): Article[] {
    return this.getItem<Article>(this.STOCK_KEY)
  }

  saveStock(stock: Article[]): void {
    this.setItem(this.STOCK_KEY, stock)
  }

  // Gestion des documents
  getDocuments(): Document[] {
    return this.getItem<Document>(this.DOCUMENTS_KEY)
  }

  saveDocuments(documents: Document[]): void {
    this.setItem(this.DOCUMENTS_KEY, documents)
  }

  // Gestion des employés
  getEmployes(): Employe[] {
    return this.getItem<Employe>(this.EMPLOYES_KEY)
  }

  saveEmployes(employes: Employe[]): void {
    this.setItem(this.EMPLOYES_KEY, employes)
  }

  // Statistiques de production
  getProductionToday(): number {
    const today = new Date().toISOString().split('T')[0]
    const productions = this.getProductions()
    return productions
      .filter(p => p.date === today && p.statut === 'termine')
      .reduce((sum, p) => {
        const totalArticles = p.articlesProduits.reduce((articleSum, article) => 
          articleSum + article.quantiteProduite, 0)
        return sum + totalArticles
      }, 0)
  }

  getProductionEnCours(): Production[] {
    const productions = this.getProductions()
    return productions.filter(p => p.statut === 'en_cours')
  }

  // Génération d'ID de lot
  generateLotId(): string {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hour = String(date.getHours()).padStart(2, '0')
    const minute = String(date.getMinutes()).padStart(2, '0')
    return `LOT-${year}-${month}${day}-${hour}${minute}`
  }

  // NOUVELLES MÉTHODES POUR LA GESTION DES LIVRAISONS AVEC SIGNATURE

  // Méthode pour créer une livraison à partir d'une commande
  creerLivraisonDepuisCommande(commande: Commande, livreur: string): Livraison {
    const produitsLivraison = commande.produits.map(produit => ({
      nom: produit.nom,
      quantite: produit.quantite,
      quantiteCommandee: produit.quantite,
      quantiteLivree: 0, // Sera rempli lors de la livraison
      unite: produit.unite,
      difference: 0,
      resteAPayer: 0
    }))

    const livraison: Omit<Livraison, 'id'> = {
      numeroBL: this.generateNumeroBL(),
      date: new Date().toISOString().split('T')[0],
      client: commande.client,
      telephone: commande.telephone,
      chauffeur: livreur, // Utiliser le livreur de la commande
      produits: produitsLivraison,
      statut: 'en_attente',
      adresse: commande.adresse,
      codeSuivi: this.generateCodeSuivi(),
      totalCommande: 0,
      totalLivraison: 0,
      differenceTotale: 0,
      resteAPayerTotal: 0
    }

    // Calculer les totaux
    const livraisonCalculee = this.calculerDifferencesLivraison(livraison as Livraison)
    
    return this.addLivraison(livraisonCalculee)
  }

  // Méthode pour calculer les différences de livraison
  calculerDifferencesLivraison(livraison: Livraison): Livraison {
    let totalCommande = 0
    let totalLivraison = 0
    let differenceTotale = 0
    let resteAPayerTotal = 0

    livraison.produits.forEach(produit => {
      // Calculer la différence pour chaque produit
      produit.difference = produit.quantiteCommandee - produit.quantiteLivree
      
      // Calculer le reste à payer (basé sur le prix unitaire du stock)
      const stock = this.getStock()
      const articleStock = stock.find(article => article.nom === produit.nom)
      const prixUnitaire = articleStock ? articleStock.prix : 0
      
      produit.resteAPayer = produit.difference * prixUnitaire
      
      // Ajouter aux totaux
      totalCommande += produit.quantiteCommandee * prixUnitaire
      totalLivraison += produit.quantiteLivree * prixUnitaire
      differenceTotale += produit.difference * prixUnitaire
      resteAPayerTotal += produit.resteAPayer
    })

    return {
      ...livraison,
      totalCommande,
      totalLivraison,
      differenceTotale,
      resteAPayerTotal
    }
  }

  // Méthode pour mettre à jour les quantités livrées
  mettreAJourQuantitesLivrees(idLivraison: number, quantitesLivrees: Array<{ nom: string, quantite: number }>): Livraison {
    const livraisons = this.getLivraisons()
    const livraison = livraisons.find(l => l.id === idLivraison)
    
    if (livraison) {
      // Mettre à jour les quantités livrées
      livraison.produits.forEach(produit => {
        const quantiteLivree = quantitesLivrees.find(q => q.nom === produit.nom)
        if (quantiteLivree) {
          produit.quantiteLivree = quantiteLivree.quantite
        }
      })

      // Recalculer les différences
      const livraisonCalculee = this.calculerDifferencesLivraison(livraison)
      
      // Mettre à jour dans la liste
      const index = livraisons.findIndex(l => l.id === idLivraison)
      if (index !== -1) {
        livraisons[index] = livraisonCalculee
        this.saveLivraisons(livraisons)
      }
      
      return livraisonCalculee
    }
    
    throw new Error('Livraison non trouvée')
  }

  // Méthode pour finaliser une livraison avec signature
  finaliserLivraisonAvecSignature(idLivraison: number, signatureClient: string, observations?: string): Livraison {
    const livraisons = this.getLivraisons()
    const livraison = livraisons.find(l => l.id === idLivraison)
    
    if (livraison) {
      // Mettre à jour le statut et la signature
      livraison.statut = 'livre'
      livraison.signatureClient = signatureClient
      livraison.dateLivraison = new Date().toISOString().split('T')[0]
      livraison.heureLivraison = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      
      if (observations) {
        livraison.observations = observations
      }

      // Mettre à jour dans la liste
      const index = livraisons.findIndex(l => l.id === idLivraison)
      if (index !== -1) {
        livraisons[index] = livraison
        this.saveLivraisons(livraisons)
      }
      
      return livraison
    }
    
    throw new Error('Livraison non trouvée')
  }

  // Méthode pour obtenir les livraisons non terminées
  getLivraisonsNonTerminees(): Livraison[] {
    return this.getLivraisons().filter(l => l.statut !== 'livre' && l.statut !== 'annule')
  }

  // Méthode pour obtenir les livraisons terminées
  getLivraisonsTerminees(): Livraison[] {
    return this.getLivraisons().filter(l => l.statut === 'livre' || l.statut === 'annule')
  }

  // Calculer automatiquement l'état de livraison d'une commande
  calculerEtatLivraisonCommande(commande: Commande): Commande {
    const livraisons = this.getLivraisons()
    const livraisonsCommande = livraisons.filter(l => l.client === commande.client)
    
    // Initialiser les quantités livrées pour chaque produit
    const produitsAvecLivraison = commande.produits.map(produitCommande => {
      let quantiteLivree = 0
      
      // Calculer la quantité totale livrée pour ce produit
      livraisonsCommande.forEach(livraison => {
        const produitLivraison = livraison.produits.find(p => p.nom === produitCommande.nom)
        if (produitLivraison) {
          quantiteLivree += produitLivraison.quantiteLivree || 0
        }
      })
      
      const quantiteRestante = Math.max(0, produitCommande.quantite - quantiteLivree)
      
      // Déterminer le statut de livraison du produit
      let statutLivraison: 'non_livre' | 'partiellement_livre' | 'livre'
      if (quantiteLivree === 0) {
        statutLivraison = 'non_livre'
      } else if (quantiteLivree >= produitCommande.quantite) {
        statutLivraison = 'livre'
      } else {
        statutLivraison = 'partiellement_livre'
      }
      
      return {
        ...produitCommande,
        quantiteLivree,
        quantiteRestante,
        statutLivraison
      }
    })
    
    // Calculer le statut global de livraison de la commande
    const totalCommandee = produitsAvecLivraison.reduce((sum, p) => sum + p.quantite, 0)
    const totalLivree = produitsAvecLivraison.reduce((sum, p) => sum + p.quantiteLivree!, 0)
    const totalRestant = produitsAvecLivraison.reduce((sum, p) => sum + p.quantiteRestante!, 0)
    
    let statutGlobalLivraison: 'non_livre' | 'partiellement_livre' | 'livre'
    if (totalLivree === 0) {
      statutGlobalLivraison = 'non_livre'
    } else if (totalLivree >= totalCommandee) {
      statutGlobalLivraison = 'livre'
    } else {
      statutGlobalLivraison = 'partiellement_livre'
    }
    
    return {
      ...commande,
      produits: produitsAvecLivraison,
      statutGlobalLivraison,
      totalLivraisons: totalLivree,
      totalRestant
    }
  }

  // Mettre à jour automatiquement l'état d'une commande après une livraison
  mettreAJourEtatCommandeApresLivraison(livraison: Livraison) {
    const commandes = this.getCommandes()
    const commandeIndex = commandes.findIndex(c => c.client === livraison.client)
    
    if (commandeIndex !== -1) {
      const commandesData = this.getItem<Commande>(this.COMMANDES_KEY)
      const commande = commandesData[commandeIndex]
      const commandeMiseAJour = this.calculerEtatLivraisonCommande(commande)
      commandesData[commandeIndex] = commandeMiseAJour
      this.saveCommandes(commandesData)
    }
  }

  // NOUVELLES MÉTHODES POUR LA GESTION DES ÉTATS DE PRODUCTION

  // Obtenir les états de production d'un article
  getEtatsProductionArticle(articleId: number): EtatProductionArticle[] {
    const key = `briqueapp_etats_production_${articleId}`
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : []
  }

  // Ajouter un état de production
  ajouterEtatProduction(etat: Omit<EtatProductionArticle, 'id'>): EtatProductionArticle {
    const articleId = etat.articleId
    const etats = this.getEtatsProductionArticle(articleId)
    const newId = Math.max(...etats.map(e => e.id), 0) + 1
    const nouvelEtat: EtatProductionArticle = { ...etat, id: newId }
    
    etats.push(nouvelEtat)
    const key = `briqueapp_etats_production_${articleId}`
    this.setItem(key, etats)
    
    // Mettre à jour le stock de l'article
    this.mettreAJourStockArticle(articleId, etat.quantiteProduite)
    
    return nouvelEtat
  }

  // Mettre à jour un état de production
  mettreAJourEtatProduction(articleId: number, etatId: number, updates: Partial<EtatProductionArticle>): boolean {
    const etats = this.getEtatsProductionArticle(articleId)
    const index = etats.findIndex(e => e.id === etatId)
    
    if (index !== -1) {
      etats[index] = { ...etats[index], ...updates }
      const key = `briqueapp_etats_production_${articleId}`
      this.setItem(key, etats)
      return true
    }
    return false
  }

  // Mettre à jour le stock d'un article après production
  mettreAJourStockArticle(articleId: number, quantiteProduite: number): void {
    const stock = this.getStock()
    const article = stock.find(a => a.id === articleId)
    
    if (article) {
      article.stock += quantiteProduite
      article.derniereMiseAJour = new Date().toISOString().split('T')[0]
      this.saveStock(stock)
    }
  }

  // Obtenir les statistiques de production d'un article
  getStatistiquesProductionArticle(articleId: number, periode: 'jour' | 'semaine' | 'mois' = 'mois'): {
    totalProduit: number
    moyenneQuotidienne: number
    rendementMoyen: number
    tempsMoyen: number
    coutTotal: number
  } {
    const etats = this.getEtatsProductionArticle(articleId)
    const article = this.getStock().find(a => a.id === articleId)
    
    if (!article) {
      return {
        totalProduit: 0,
        moyenneQuotidienne: 0,
        rendementMoyen: 0,
        tempsMoyen: 0,
        coutTotal: 0
      }
    }

    // Filtrer par période
    const maintenant = new Date()
    let dateLimite: Date
    
    switch (periode) {
      case 'jour':
        dateLimite = new Date(maintenant.getTime() - 24 * 60 * 60 * 1000)
        break
      case 'semaine':
        dateLimite = new Date(maintenant.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'mois':
        dateLimite = new Date(maintenant.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
    }

    const etatsPeriode = etats.filter(e => new Date(e.date) >= dateLimite)
    
    if (etatsPeriode.length === 0) {
      return {
        totalProduit: 0,
        moyenneQuotidienne: 0,
        rendementMoyen: 0,
        tempsMoyen: 0,
        coutTotal: 0
      }
    }

    const totalProduit = etatsPeriode.reduce((sum, e) => sum + e.quantiteProduite, 0)
    const moyenneQuotidienne = totalProduit / etatsPeriode.length
    const rendementMoyen = etatsPeriode.reduce((sum, e) => sum + e.rendement, 0) / etatsPeriode.length
    const tempsMoyen = etatsPeriode.reduce((sum, e) => sum + e.tempsEffectif, 0) / etatsPeriode.length
    const coutTotal = totalProduit * article.coutProduction

    return {
      totalProduit,
      moyenneQuotidienne,
      rendementMoyen,
      tempsMoyen,
      coutTotal
    }
  }

  // Obtenir tous les articles actifs en production
  getArticlesActifsProduction(): Article[] {
    return this.getStock().filter(article => article.actif)
  }

  // Planifier la production d'un article
  planifierProduction(articleId: number, quantitePlanifiee: number, date: string, operateur?: string): EtatProductionArticle {
    const article = this.getStock().find(a => a.id === articleId)
    if (!article) {
      throw new Error('Article non trouvé')
    }

    const etat: Omit<EtatProductionArticle, 'id'> = {
      articleId,
      date,
      quantiteProduite: 0,
      quantitePlanifiee,
      statut: 'planifie',
      operateur,
      qualiteProduite: 'excellente',
      notes: 'Production planifiée',
      tempsEffectif: 0,
      rendement: 100
    }

    return this.ajouterEtatProduction(etat)
  }

  // Ajouter un nouvel article
  addArticle(articleData: Omit<Article, 'id' | 'derniereMiseAJour'>): Article {
    const stock = this.getStock()
    const newId = stock.length > 0 ? Math.max(...stock.map(a => a.id)) + 1 : 1
    
    const newArticle: Article = {
      ...articleData,
      id: newId,
      derniereMiseAJour: new Date().toISOString().split('T')[0]
    }
    
    stock.push(newArticle)
    this.saveStock(stock)
    return newArticle
  }

  // Mettre à jour un article existant
  updateArticle(articleId: number, articleData: Partial<Article>): Article {
    const stock = this.getStock()
    const index = stock.findIndex(a => a.id === articleId)
    
    if (index === -1) {
      throw new Error('Article non trouvé')
    }
    
    const updatedArticle: Article = {
      ...stock[index],
      ...articleData,
      derniereMiseAJour: new Date().toISOString().split('T')[0]
    }
    
    stock[index] = updatedArticle
    this.saveStock(stock)
    return updatedArticle
  }

  // Supprimer un article
  deleteArticle(articleId: number): void {
    const stock = this.getStock()
    const index = stock.findIndex(a => a.id === articleId)
    
    if (index === -1) {
      throw new Error('Article non trouvé')
    }
    
    stock.splice(index, 1)
    this.saveStock(stock)
  }

  // NOUVELLES MÉTHODES POUR LA GESTION DES RAPPORTS QUOTIDIENS ET CONSOMMABLES

  // Gestion des rapports quotidiens
  getRapportsQuotidiens(): RapportProductionQuotidien[] {
    return this.getItem<RapportProductionQuotidien>(this.RAPPORTS_QUOTIDIENS_KEY)
  }

  saveRapportsQuotidiens(rapports: RapportProductionQuotidien[]): void {
    this.setItem(this.RAPPORTS_QUOTIDIENS_KEY, rapports)
  }

  // Créer un rapport quotidien automatiquement
  genererRapportQuotidien(date: string): RapportProductionQuotidien {
    const productions = this.getProductions().filter(p => p.date === date && p.statut === 'termine')
    const stock = this.getStock()

    if (productions.length === 0) {
      throw new Error('Aucune production terminée pour cette date')
    }

    let totalArticlesProduits = 0
    let totalConsommablesUtilises = 0
    let tempsProductionTotal = 0
    let coutProductionTotal = 0
    let rendements: number[] = []

    const detailsParArticle = new Map<number, {articleId: number, quantiteProduite: number, quantitePlanifiee: number, coutProduction: number}>()
    const detailsConsommables = new Map<number, {articleId: number, quantiteUtilisee: number, coutTotal: number}>()

    const operateurs = new Set<string>()
    const machines = new Set<string>()

    productions.forEach(production => {
      // Articles produits
      production.articlesProduits.forEach(article => {
        totalArticlesProduits += article.quantiteProduite

        const articleStock = stock.find(a => a.id === article.articleId)
        const coutArticle = articleStock ? article.quantiteProduite * articleStock.coutProduction : 0

        if (detailsParArticle.has(article.articleId)) {
          const detail = detailsParArticle.get(article.articleId)!
          detail.quantiteProduite += article.quantiteProduite
          detail.quantitePlanifiee += article.quantitePlanifiee
          detail.coutProduction += coutArticle
        } else {
          detailsParArticle.set(article.articleId, {
            articleId: article.articleId,
            quantiteProduite: article.quantiteProduite,
            quantitePlanifiee: article.quantitePlanifiee,
            coutProduction: coutArticle
          })
        }
      })

      // Consommables utilisés
      if (production.consommables) {
        production.consommables.forEach(consommable => {
          totalConsommablesUtilises += consommable.quantiteUtilisee

          const consommableStock = stock.find(a => a.id === consommable.articleId)
          const coutConsommable = consommableStock ? consommable.quantiteUtilisee * consommableStock.prix : 0

          if (detailsConsommables.has(consommable.articleId)) {
            const detail = detailsConsommables.get(consommable.articleId)!
            detail.quantiteUtilisee += consommable.quantiteUtilisee
            detail.coutTotal += coutConsommable
          } else {
            detailsConsommables.set(consommable.articleId, {
              articleId: consommable.articleId,
              quantiteUtilisee: consommable.quantiteUtilisee,
              coutTotal: coutConsommable
            })
          }
        })
      }

      // Temps et rendement
      if (production.tempsEffectif) {
        tempsProductionTotal += production.tempsEffectif
      }
      if (production.rendement) {
        rendements.push(production.rendement)
      }
      if (production.coutProduction) {
        coutProductionTotal += production.coutProduction
      }

      // Opérateurs et machines
      if (production.operateur) {
        operateurs.add(production.operateur)
      }
      if (production.machine) {
        machines.add(production.machine)
      }
    })

    const rendementMoyen = rendements.length > 0 ? rendements.reduce((a, b) => a + b, 0) / rendements.length : 0

    const rapport: RapportProductionQuotidien = {
      id: Date.now(),
      date,
      productionsIds: productions.map(p => p.id),
      resumeProduction: {
        totalArticlesProduits,
        totalConsommablesUtilises,
        tempsProductionTotal,
        rendementMoyen,
        coutProductionTotal
      },
      detailsParArticle: Array.from(detailsParArticle.values()).map(detail => ({
        ...detail,
        tauxRealisation: detail.quantitePlanifiee > 0 ? (detail.quantiteProduite / detail.quantitePlanifiee) * 100 : 0
      })),
      detailsConsommables: Array.from(detailsConsommables.values()),
      operateurs: Array.from(operateurs),
      machines: Array.from(machines)
    }

    // Sauvegarder le rapport
    const rapports = this.getRapportsQuotidiens()
    rapports.push(rapport)
    this.saveRapportsQuotidiens(rapports)

    return rapport
  }

  // Obtenir le rapport quotidien pour une date
  getRapportQuotidien(date: string): RapportProductionQuotidien | null {
    const rapports = this.getRapportsQuotidiens()
    return rapports.find(r => r.date === date) || null
  }

  // Mettre à jour le stock avec les consommables utilisés
  consommerMatieresPremieresProduction(production: Production): void {
    if (!production.consommables) return

    const stock = this.getStock()
    let stockModifie = false

    production.consommables.forEach(consommable => {
      const articleIndex = stock.findIndex(a => a.id === consommable.articleId)
      if (articleIndex !== -1) {
        stock[articleIndex].stock = Math.max(0, stock[articleIndex].stock - consommable.quantiteUtilisee)
        stock[articleIndex].derniereMiseAJour = new Date().toISOString().split('T')[0]
        stockModifie = true
      }
    })

    if (stockModifie) {
      this.saveStock(stock)
    }
  }

  // Ajouter les articles produits au stock
  ajouterProductionAuStock(production: Production): void {
    const stock = this.getStock()
    let stockModifie = false

    production.articlesProduits.forEach(article => {
      const articleIndex = stock.findIndex(a => a.id === article.articleId)
      if (articleIndex !== -1) {
        stock[articleIndex].stock += article.quantiteProduite
        stock[articleIndex].derniereMiseAJour = new Date().toISOString().split('T')[0]
        stockModifie = true
      }
    })

    if (stockModifie) {
      this.saveStock(stock)
    }
  }

  // Traitement complet d'une production terminée
  terminerProduction(productionId: number): void {
    const productions = this.getProductions()
    const production = productions.find(p => p.id === productionId)

    if (!production) {
      throw new Error('Production non trouvée')
    }

    if (production.statut !== 'en_cours') {
      throw new Error('Seules les productions en cours peuvent être terminées')
    }

    // Marquer comme terminée
    production.statut = 'termine'
    production.heureFin = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

    // Calculer le temps effectif si pas déjà renseigné
    if (!production.tempsEffectif && production.heureDebut && production.heureFin) {
      const debut = new Date(`1970-01-01T${production.heureDebut}:00`)
      const fin = new Date(`1970-01-01T${production.heureFin}:00`)
      production.tempsEffectif = Math.round((fin.getTime() - debut.getTime()) / (1000 * 60))
    }

    this.saveProductions(productions)

    // Consommer les matières premières
    this.consommerMatieresPremieresProduction(production)

    // Ajouter la production au stock
    this.ajouterProductionAuStock(production)
  }

  // Obtenir les articles consommables (pour la production)
  getArticlesConsommables(): Article[] {
    return this.getStock().filter(article =>
      article.categorie === 'Consommables' ||
      article.categorie === 'Matériaux' ||
      article.typeProduction === 'autre'
    )
  }

  // Vérifier la disponibilité des consommables pour une production
  verifierDisponibiliteConsommables(consommables: Array<{articleId: number, quantiteUtilisee: number}>): {disponible: boolean, manquants: Array<{articleId: number, nom: string, quantiteManquante: number}>} {
    const stock = this.getStock()
    const manquants: Array<{articleId: number, nom: string, quantiteManquante: number}> = []

    consommables.forEach(consommable => {
      const article = stock.find(a => a.id === consommable.articleId)
      if (!article) {
        manquants.push({
          articleId: consommable.articleId,
          nom: 'Article inconnu',
          quantiteManquante: consommable.quantiteUtilisee
        })
      } else if (article.stock < consommable.quantiteUtilisee) {
        manquants.push({
          articleId: consommable.articleId,
          nom: article.nom,
          quantiteManquante: consommable.quantiteUtilisee - article.stock
        })
      }
    })

    return {
      disponible: manquants.length === 0,
      manquants
    }
  }

  // ===== GESTION DES TRANSFERTS =====

  // Obtenir tous les transferts
  getTransferts(): Transfert[] {
    return this.getItem<Transfert>(this.TRANSFERTS_KEY)
  }

  // Sauvegarder les transferts
  saveTransferts(transferts: Transfert[]): void {
    this.setItem(this.TRANSFERTS_KEY, transferts)
  }

  // Ajouter un nouveau transfert
  ajouterTransfert(transfert: Omit<Transfert, 'id' | 'numeroBordereau' | 'dateCreation' | 'dateModification'>): Transfert {
    const transferts = this.getTransferts()
    const id = transferts.length > 0 ? Math.max(...transferts.map(t => t.id)) + 1 : 1
    
    const nouveauTransfert: Transfert = {
      ...transfert,
      id,
      numeroBordereau: `TRF-${new Date().getFullYear()}-${String(id).padStart(4, '0')}`,
      dateCreation: new Date().toISOString(),
      dateModification: new Date().toISOString()
    }

    transferts.push(nouveauTransfert)
    this.saveTransferts(transferts)
    return nouveauTransfert
  }

  // Modifier un transfert
  modifierTransfert(id: number, modifications: Partial<Transfert>): void {
    const transferts = this.getTransferts()
    const index = transferts.findIndex(t => t.id === id)
    
    if (index === -1) {
      throw new Error('Transfert non trouvé')
    }

    transferts[index] = {
      ...transferts[index],
      ...modifications,
      dateModification: new Date().toISOString()
    }

    this.saveTransferts(transferts)
  }

  // Supprimer un transfert
  supprimerTransfert(id: number): void {
    const transferts = this.getTransferts()
    const index = transferts.findIndex(t => t.id === id)
    
    if (index === -1) {
      throw new Error('Transfert non trouvé')
    }

    transferts.splice(index, 1)
    this.saveTransferts(transferts)
  }

  // Obtenir un transfert par ID
  getTransfertById(id: number): Transfert | undefined {
    return this.getTransferts().find(t => t.id === id)
  }

  // Obtenir les transferts par statut
  getTransfertsByStatut(statut: Transfert['statut']): Transfert[] {
    return this.getTransferts().filter(t => t.statut === statut)
  }

  // Obtenir les statistiques des transferts
  getTransfertStats(): { totalTransferts: number, transfertsEnCours: number, transfertsTermines: number, totalArticles: number } {
    const transferts = this.getTransferts()
    
    return {
      totalTransferts: transferts.length,
      transfertsEnCours: transferts.filter(t => t.statut === 'en_cours').length,
      transfertsTermines: transferts.filter(t => t.statut === 'termine').length,
      totalArticles: transferts.reduce((total, t) => 
        total + t.produits.reduce((sum, p) => sum + p.quantite, 0), 0
      )
    }
  }

  // ===== SYNCHRONISATION SUPABASE =====

  // Synchroniser les articles vers Supabase
  async syncArticlesToSupabase() {
    const articles = this.getStock()
    articles.forEach(article => {
      supabaseSyncService.addToQueue('insert', 'articles', {
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
    })
  }

  // Synchroniser les productions vers Supabase
  async syncProductionsToSupabase() {
    const productions = this.getProductions()
    productions.forEach(production => {
      supabaseSyncService.addToQueue('insert', 'productions', {
        date: production.date,
        statut: production.statut,
        lot_id: production.lotId,
        heure_debut: production.heureDebut,
        heure_fin: production.heureFin,
        temps_effectif: production.tempsEffectif
      })
    })
  }

  // Synchroniser les commandes vers Supabase
  async syncCommandesToSupabase() {
    const commandes = this.getCommandes()
    commandes.forEach(commande => {
      supabaseSyncService.addToQueue('insert', 'commandes', {
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
    })
  }

  // Synchroniser les livraisons vers Supabase
  async syncLivraisonsToSupabase() {
    const livraisons = this.getLivraisons()
    livraisons.forEach(livraison => {
      supabaseSyncService.addToQueue('insert', 'livraisons', {
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
    })
  }

  // Synchroniser les transferts vers Supabase
  async syncTransfertsToSupabase() {
    const transferts = this.getTransferts()
    transferts.forEach(transfert => {
      supabaseSyncService.addToQueue('insert', 'transferts', {
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
    })
  }

  // Synchronisation complète vers Supabase
  async syncAllToSupabase() {
    try {
      console.log('🔄 Début de la synchronisation vers Supabase...')
      
      await this.syncArticlesToSupabase()
      await this.syncProductionsToSupabase()
      await this.syncCommandesToSupabase()
      await this.syncLivraisonsToSupabase()
      await this.syncTransfertsToSupabase()
      
      console.log('✅ Synchronisation vers Supabase terminée')
    } catch (error) {
      console.error('❌ Erreur lors de la synchronisation:', error)
    }
  }

  // Obtenir le statut de synchronisation
  getSyncStatus() {
    return supabaseSyncService.getStatus()
  }

  // Démarrer la synchronisation automatique
  startAutoSync(intervalMs: number = 30000) {
    supabaseSyncService.startAutoSync(intervalMs)
  }

  // Arrêter la synchronisation automatique
  stopAutoSync() {
    supabaseSyncService.stopAutoSync()
  }
}

export const storageService = new StorageService()
