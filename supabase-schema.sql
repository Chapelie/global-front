-- Script SQL pour créer toutes les tables dans Supabase
-- Exécuter dans l'éditeur SQL de Supabase

-- 1. Table des utilisateurs (extension de auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'secretaire' CHECK (role IN ('super_admin', 'admin', 'secretaire', 'livreur')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Table des articles/stock
CREATE TABLE IF NOT EXISTS public.articles (
  id SERIAL PRIMARY KEY,
  nom TEXT NOT NULL,
  categorie TEXT NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  seuil_critique INTEGER NOT NULL DEFAULT 0,
  unite TEXT NOT NULL,
  prix DECIMAL(10,2) DEFAULT 0,
  fournisseur TEXT,
  derniere_mise_a_jour DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  type_production TEXT,
  capacite_production INTEGER,
  unite_production TEXT,
  cout_production DECIMAL(10,2),
  temps_production INTEGER,
  qualite TEXT,
  actif BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Table des productions
CREATE TABLE IF NOT EXISTS public.productions (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  statut TEXT NOT NULL DEFAULT 'en_cours' CHECK (statut IN ('en_cours', 'termine', 'annule')),
  lot_id TEXT,
  heure_debut TIME,
  heure_fin TIME,
  temps_effectif INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Table des articles produits (relation production-articles)
CREATE TABLE IF NOT EXISTS public.articles_produits (
  id SERIAL PRIMARY KEY,
  production_id INTEGER REFERENCES public.productions(id) ON DELETE CASCADE,
  article_id INTEGER REFERENCES public.articles(id),
  quantite_produite INTEGER NOT NULL,
  quantite_planifiee INTEGER NOT NULL,
  unite TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Table des consommables utilisés
CREATE TABLE IF NOT EXISTS public.consommables_utilises (
  id SERIAL PRIMARY KEY,
  production_id INTEGER REFERENCES public.productions(id) ON DELETE CASCADE,
  article_id INTEGER REFERENCES public.articles(id),
  quantite_utilisee INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Table des commandes
CREATE TABLE IF NOT EXISTS public.commandes (
  id SERIAL PRIMARY KEY,
  numero_commande TEXT UNIQUE NOT NULL,
  date DATE NOT NULL,
  client TEXT NOT NULL,
  telephone TEXT,
  email TEXT,
  adresse TEXT,
  statut TEXT NOT NULL DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'en_preparation', 'livree', 'annule')),
  date_livraison_souhaitee DATE,
  priorite TEXT DEFAULT 'normale' CHECK (priorite IN ('basse', 'normale', 'haute', 'urgente')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Table des produits commandés
CREATE TABLE IF NOT EXISTS public.produits_commandes (
  id SERIAL PRIMARY KEY,
  commande_id INTEGER REFERENCES public.commandes(id) ON DELETE CASCADE,
  nom TEXT NOT NULL,
  quantite INTEGER NOT NULL,
  unite TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Table des livraisons
CREATE TABLE IF NOT EXISTS public.livraisons (
  id SERIAL PRIMARY KEY,
  numero_bl TEXT UNIQUE NOT NULL,
  date DATE NOT NULL,
  client TEXT NOT NULL,
  telephone TEXT,
  chauffeur TEXT,
  statut TEXT NOT NULL DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'en_cours', 'livre', 'annule')),
  adresse TEXT,
  code_suivi TEXT,
  preuve_depot TEXT,
  preuve_reception TEXT,
  signature_client TEXT,
  observations TEXT,
  heure_livraison TIME,
  date_livraison DATE,
  total_commande DECIMAL(10,2) DEFAULT 0,
  total_livraison DECIMAL(10,2) DEFAULT 0,
  difference_totale DECIMAL(10,2) DEFAULT 0,
  reste_a_payer_total DECIMAL(10,2) DEFAULT 0,
  cloturee BOOLEAN DEFAULT false,
  date_cloture_manuelle TIMESTAMP WITH TIME ZONE,
  notes_cloture TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Table des produits livrés
CREATE TABLE IF NOT EXISTS public.produits_livres (
  id SERIAL PRIMARY KEY,
  livraison_id INTEGER REFERENCES public.livraisons(id) ON DELETE CASCADE,
  nom TEXT NOT NULL,
  quantite INTEGER NOT NULL,
  unite TEXT NOT NULL,
  quantite_commandee INTEGER NOT NULL,
  quantite_livree INTEGER NOT NULL DEFAULT 0,
  difference INTEGER NOT NULL DEFAULT 0,
  reste_a_payer DECIMAL(10,2) DEFAULT 0,
  observation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Table des documents
CREATE TABLE IF NOT EXISTS public.documents (
  id SERIAL PRIMARY KEY,
  nom TEXT NOT NULL,
  type TEXT NOT NULL,
  taille INTEGER,
  url TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Table des employés
CREATE TABLE IF NOT EXISTS public.employes (
  id SERIAL PRIMARY KEY,
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  poste TEXT NOT NULL,
  telephone TEXT,
  email TEXT,
  date_embauche DATE,
  salaire DECIMAL(10,2),
  statut TEXT DEFAULT 'actif' CHECK (statut IN ('actif', 'inactif', 'suspendu')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. Table des rapports quotidiens
CREATE TABLE IF NOT EXISTS public.rapports_quotidiens (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  production_totale INTEGER DEFAULT 0,
  livraisons_effectuees INTEGER DEFAULT 0,
  commandes_recues INTEGER DEFAULT 0,
  observations TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. Table des transferts
CREATE TABLE IF NOT EXISTS public.transferts (
  id SERIAL PRIMARY KEY,
  numero_bordereau TEXT UNIQUE NOT NULL,
  date DATE NOT NULL,
  client TEXT NOT NULL,
  telephone TEXT,
  email TEXT,
  adresse TEXT,
  chauffeur_nom TEXT,
  chauffeur_telephone TEXT,
  statut TEXT NOT NULL DEFAULT 'en_preparation' CHECK (statut IN ('en_preparation', 'en_cours', 'termine')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. Table des produits transférés
CREATE TABLE IF NOT EXISTS public.produits_transferes (
  id SERIAL PRIMARY KEY,
  transfert_id INTEGER REFERENCES public.transferts(id) ON DELETE CASCADE,
  designation TEXT NOT NULL,
  quantite INTEGER NOT NULL,
  unite TEXT NOT NULL,
  observation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_articles_nom ON public.articles(nom);
CREATE INDEX IF NOT EXISTS idx_articles_categorie ON public.articles(categorie);
CREATE INDEX IF NOT EXISTS idx_productions_date ON public.productions(date);
CREATE INDEX IF NOT EXISTS idx_commandes_date ON public.commandes(date);
CREATE INDEX IF NOT EXISTS idx_livraisons_date ON public.livraisons(date);
CREATE INDEX IF NOT EXISTS idx_livraisons_statut ON public.livraisons(statut);
CREATE INDEX IF NOT EXISTS idx_transferts_date ON public.transferts(date);

-- Fonctions pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON public.articles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_productions_updated_at BEFORE UPDATE ON public.productions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_commandes_updated_at BEFORE UPDATE ON public.commandes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_livraisons_updated_at BEFORE UPDATE ON public.livraisons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON public.documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employes_updated_at BEFORE UPDATE ON public.employes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rapports_quotidiens_updated_at BEFORE UPDATE ON public.rapports_quotidiens FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transferts_updated_at BEFORE UPDATE ON public.transferts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();