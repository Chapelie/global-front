// Service pour gérer le localStorage
export interface User {
  id: number
  username: string
  email: string
  role: 'super_admin' | 'admin' | 'secretaire' | 'livreur'
  password: string
  isLoggedIn: boolean
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
  statut: 'en_cours' | 'termine' | 'en_attente'
  lotId: string
  heureDebut?: string
  heureFin?: string
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

    // Production par défaut
    if (!this.getProductions().length) {
      const defaultProductions: Production[] = [
        {
          id: 1,
          date: new Date().toISOString().split('T')[0],
          articlesProduits: [
            {
              articleId: 1,
              quantiteProduite: 1200,
              quantitePlanifiee: 1200,
              unite: 'pièces'
            }
          ],
          statut: 'termine',
          lotId: 'LOT-2024-001',
          heureDebut: '08:00',
          heureFin: '16:00'
        },
        {
          id: 2,
          date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          articlesProduits: [
            {
              articleId: 1,
              quantiteProduite: 1350,
              quantitePlanifiee: 1350,
              unite: 'pièces'
            }
          ],
          statut: 'termine',
          lotId: 'LOT-2024-002',
          heureDebut: '08:00',
          heureFin: '15:30'
        }
      ]
      this.saveProductions(defaultProductions)
    }

    // Stock par défaut
    if (!this.getStock().length) {
      const defaultStock: Article[] = [
        {
          id: 1,
          nom: 'Briques standard',
          categorie: 'Briques',
          stock: 2500,
          seuilCritique: 1000,
          unite: 'pièces',
          prix: 0.85,
          fournisseur: 'Briqueterie du Nord',
          derniereMiseAJour: new Date().toISOString().split('T')[0],
          notes: 'Stock stable',
          typeProduction: 'brique',
          capaciteProduction: 5000,
          uniteProduction: 'briques/jour',
          coutProduction: 0.45,
          tempsProduction: 2,
          qualite: 'standard',
          actif: true
        },
        {
          id: 2,
          nom: 'Ciment Portland',
          categorie: 'Matériaux',
          stock: 45,
          seuilCritique: 30,
          unite: 'tonnes',
          prix: 120.00,
          fournisseur: 'Ciments Calcia',
          derniereMiseAJour: new Date().toISOString().split('T')[0],
          notes: 'Stock critique - commande en cours',
          typeProduction: 'ciment',
          capaciteProduction: 100,
          uniteProduction: 'tonnes/jour',
          coutProduction: 80.00,
          tempsProduction: 480,
          qualite: 'standard',
          actif: true
        }
      ]
      this.saveStock(defaultStock)
    }

    // Commandes par défaut
    if (!this.getCommandes().length) {
      const defaultCommandes: Commande[] = [
        {
          id: 1,
          numeroCommande: 'CMD-20240115-001',
          date: new Date().toISOString().split('T')[0],
          client: 'Entreprise Martin',
          telephone: '06 12 34 56 78',
          email: 'contact@martin.fr',
          adresse: '123 Rue de la Paix, 75001 Paris',
          produits: [
            { nom: 'Briques standard', quantite: 500, unite: 'pièces' },
            { nom: 'Ciment Portland', quantite: 2, unite: 'tonnes' }
          ],
          statut: 'en_preparation',
          dateLivraisonSouhaitee: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          priorite: 'haute'
        },
        {
          id: 2,
          numeroCommande: 'CMD-20240114-002',
          date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          client: 'Construction Dubois',
          telephone: '06 98 76 54 32',
          email: 'info@dubois-construction.fr',
          adresse: '456 Avenue des Champs, 69000 Lyon',
          produits: [
            { nom: 'Briques standard', quantite: 1000, unite: 'pièces' }
          ],
          statut: 'livree',
          dateLivraisonSouhaitee: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          priorite: 'normale'
        }
      ]
      this.saveCommandes(defaultCommandes)
    }

    // Livraisons par défaut
    if (!this.getLivraisons().length) {
      const defaultLivraisons: Livraison[] = [
        {
          id: 1,
          numeroBL: 'BL-20240115-1430',
          date: new Date().toISOString().split('T')[0],
          client: 'Entreprise Martin',
          telephone: '06 12 34 56 78',
          chauffeur: 'Camion de livraison',
          produits: [
            { nom: 'Briques standard', quantite: 500, unite: 'pièces', quantiteCommandee: 500, quantiteLivree: 0, difference: 500, resteAPayer: 425 },
            { nom: 'Ciment Portland', quantite: 2, unite: 'tonnes', quantiteCommandee: 2, quantiteLivree: 0, difference: 2, resteAPayer: 240 }
          ],
          statut: 'en_cours',
          adresse: '123 Rue de la Paix, 75001 Paris',
          codeSuivi: 'ABC12345',
          totalCommande: 665,
          totalLivraison: 0,
          differenceTotale: 665,
          resteAPayerTotal: 665
        },
        {
          id: 2,
          numeroBL: 'BL-20240114-0915',
          date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          client: 'Construction Dubois',
          telephone: '06 98 76 54 32',
          chauffeur: 'Camion de livraison',
          produits: [
            { nom: 'Briques standard', quantite: 1000, unite: 'pièces', quantiteCommandee: 1000, quantiteLivree: 1000, difference: 0, resteAPayer: 0 }
          ],
          statut: 'livre',
          adresse: '456 Avenue des Champs, 69000 Lyon',
          codeSuivi: 'XYZ98765',
          preuveDepot: 'Produits déposés en bon état',
          preuveReception: 'Client satisfait, signature obtenue',
          signatureClient: 'M. Dubois',
          heureLivraison: '14:30',
          dateLivraison: new Date(Date.now() - 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR'),
          totalCommande: 850,
          totalLivraison: 850,
          differenceTotale: 0,
          resteAPayerTotal: 0
        }
      ]
      this.saveLivraisons(defaultLivraisons)
    }
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
}

export const storageService = new StorageService()
