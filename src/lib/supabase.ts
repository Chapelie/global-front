import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Configuration gracieuse - ne pas planter l'app si Supabase n'est pas configuré
let supabase: any = null

if (supabaseUrl && supabaseAnonKey && 
    supabaseUrl !== 'https://your-project.supabase.co' && 
    supabaseAnonKey !== 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-anon-key-here') {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    })
    console.log('✅ Supabase configuré avec succès')
  } catch (error) {
    console.warn('⚠️ Erreur de configuration Supabase:', error)
    console.log('📱 L\'application fonctionnera en mode hors ligne uniquement')
  }
} else {
  console.warn('⚠️ Supabase non configuré - Mode hors ligne uniquement')
  console.log('💡 Pour activer la synchronisation, configurez vos clés Supabase dans .env.local')
}

export { supabase }

// Types pour l'authentification
export interface User {
  id: string
  email: string
  user_metadata: {
    first_name?: string
    last_name?: string
    avatar_url?: string
    role?: UserRole
  }
  created_at: string
}

// Types de rôles utilisateur
export type UserRole = 'super_admin' | 'admin' | 'secretaire' | 'livreur'

// Interface pour les permissions
export interface UserPermissions {
  canViewProduction: boolean
  canEditProduction: boolean
  canViewCommandes: boolean
  canEditCommandes: boolean
  canViewLivraisons: boolean
  canEditLivraisons: boolean
  canViewStock: boolean
  canEditStock: boolean
  canViewPersonnel: boolean
  canEditPersonnel: boolean
  canViewAnalyses: boolean
  canViewParametres: boolean
  canEditParametres: boolean
  canManageUsers: boolean
}

export interface AuthState {
  user: User | null
  loading: boolean
  initialized: boolean
}

// Types pour les données métier (basés sur votre storageService existant)
export interface Production {
  id?: number
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

export interface Commande {
  id?: number
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

export interface Livraison {
  id?: number
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
  totalCommande: number
  totalLivraison: number
  differenceTotale: number
  resteAPayerTotal: number
  user_id?: string
}

export interface Article {
  id?: number
  nom: string
  stock: number
  unite: string
  prix: number
  seuilCritique: number
  actif: boolean
  user_id?: string
}

export interface Personnel {
  id?: number
  nom: string
  prenom: string
  poste: string
  telephone: string
  email: string
  salaire: number
  dateEmbauche: string
  actif: boolean
  user_id?: string
}