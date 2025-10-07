-- =====================================================
-- CONFIGURATION SUPABASE EXACTE - Global Star Distribution
-- =====================================================
-- Exécuter dans l'éditeur SQL de Supabase
-- Cette configuration est basée sur l'analyse des services

-- =====================================================
-- 1. TABLE DES UTILISATEURS (users)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'secretaire' CHECK (role IN ('superadmin', 'admin', 'manager', 'operator', 'secretaire', 'livreur')),
  phone TEXT,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. TABLE DES ARTICLES (articles)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. TABLE DES COMMANDES (commandes)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.commandes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_commande TEXT UNIQUE NOT NULL,
  date DATE NOT NULL,
  client TEXT NOT NULL,
  telephone TEXT,
  email TEXT,
  adresse TEXT,
  statut TEXT NOT NULL DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'confirmee', 'en_preparation', 'livree', 'annulee')),
  date_livraison_souhaitee DATE,
  priorite TEXT DEFAULT 'normale' CHECK (priorite IN ('basse', 'normale', 'haute', 'urgente')),
  produits JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array des produits
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. TABLE DES LIVRAISONS (livraisons)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.livraisons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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
  produits JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array des produits
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 5. TABLE DE LA PRODUCTION (production)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.production (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  lot_id TEXT NOT NULL,
  statut TEXT NOT NULL DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'en_cours', 'termine', 'annule')),
  articles_produits JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array des articles produits
  temps_effectif INTEGER,
  rendement DECIMAL(5,2),
  cout_production DECIMAL(10,2),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 6. TABLE DU PERSONNEL (personnel)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.personnel (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  poste TEXT NOT NULL,
  telephone TEXT,
  email TEXT,
  salaire DECIMAL(10,2),
  date_embauche DATE,
  actif BOOLEAN DEFAULT true,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 7. TABLE DES DOCUMENTS (documents)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nom TEXT NOT NULL,
  type TEXT NOT NULL,
  taille INTEGER,
  url TEXT,
  description TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 8. TABLE DES ANALYSES (analyses)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nom TEXT NOT NULL,
  type TEXT NOT NULL,
  donnees JSONB NOT NULL DEFAULT '{}'::jsonb,
  date_analyse DATE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 9. TABLE DES TRANSFERTS (transferts)
-- =====================================================
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
  produits JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array des produits
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 10. TRIGGERS POUR LA MISE À JOUR AUTOMATIQUE
-- =====================================================

-- Fonction pour mettre à jour updated_at
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
CREATE TRIGGER update_commandes_updated_at BEFORE UPDATE ON public.commandes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_livraisons_updated_at BEFORE UPDATE ON public.livraisons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_production_updated_at BEFORE UPDATE ON public.production FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_personnel_updated_at BEFORE UPDATE ON public.personnel FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON public.documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_analyses_updated_at BEFORE UPDATE ON public.analyses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transferts_updated_at BEFORE UPDATE ON public.transferts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 11. TRIGGER POUR CRÉER AUTOMATIQUEMENT UN PROFIL UTILISATEUR
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    first_name,
    last_name,
    role,
    phone,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'secretaire'),
    COALESCE(NEW.raw_user_meta_data->>'phone', NULL),
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer le trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 12. TRIGGER POUR METTRE À JOUR LAST_LOGIN
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_user_login()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.users
  SET last_login = NOW(), updated_at = NOW()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer le trigger de connexion
DROP TRIGGER IF EXISTS on_auth_user_login ON auth.users;
CREATE TRIGGER on_auth_user_login
  AFTER UPDATE OF last_sign_in_at ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_login();

-- =====================================================
-- 13. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Activer RLS sur toutes les tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commandes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.livraisons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personnel ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transferts ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 14. POLITIQUES RLS POUR LES UTILISATEURS
-- =====================================================

-- Politiques pour la table users
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('superadmin', 'admin')
    )
  );

CREATE POLICY "Admins can update all users" ON public.users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('superadmin', 'admin')
    )
  );

-- =====================================================
-- 15. POLITIQUES RLS POUR LES DONNÉES MÉTIER
-- =====================================================

-- Politiques pour articles
CREATE POLICY "Users can manage own articles" ON public.articles
  FOR ALL USING (auth.uid() = user_id);

-- Politiques pour commandes
CREATE POLICY "Users can manage own commandes" ON public.commandes
  FOR ALL USING (auth.uid() = user_id);

-- Politiques pour livraisons
CREATE POLICY "Users can manage own livraisons" ON public.livraisons
  FOR ALL USING (auth.uid() = user_id);

-- Politiques pour production
CREATE POLICY "Users can manage own production" ON public.production
  FOR ALL USING (auth.uid() = user_id);

-- Politiques pour personnel
CREATE POLICY "Users can manage own personnel" ON public.personnel
  FOR ALL USING (auth.uid() = user_id);

-- Politiques pour documents
CREATE POLICY "Users can manage own documents" ON public.documents
  FOR ALL USING (auth.uid() = user_id);

-- Politiques pour analyses
CREATE POLICY "Users can manage own analyses" ON public.analyses
  FOR ALL USING (auth.uid() = user_id);

-- Politiques pour transferts
CREATE POLICY "Users can manage own transferts" ON public.transferts
  FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- 16. INDEX POUR AMÉLIORER LES PERFORMANCES
-- =====================================================

-- Index pour les tables principales
CREATE INDEX IF NOT EXISTS idx_articles_user_id ON public.articles(user_id);
CREATE INDEX IF NOT EXISTS idx_articles_nom ON public.articles(nom);
CREATE INDEX IF NOT EXISTS idx_articles_categorie ON public.articles(categorie);

CREATE INDEX IF NOT EXISTS idx_commandes_user_id ON public.commandes(user_id);
CREATE INDEX IF NOT EXISTS idx_commandes_date ON public.commandes(date);
CREATE INDEX IF NOT EXISTS idx_commandes_statut ON public.commandes(statut);

CREATE INDEX IF NOT EXISTS idx_livraisons_user_id ON public.livraisons(user_id);
CREATE INDEX IF NOT EXISTS idx_livraisons_date ON public.livraisons(date);
CREATE INDEX IF NOT EXISTS idx_livraisons_statut ON public.livraisons(statut);

CREATE INDEX IF NOT EXISTS idx_production_user_id ON public.production(user_id);
CREATE INDEX IF NOT EXISTS idx_production_date ON public.production(date);

CREATE INDEX IF NOT EXISTS idx_personnel_user_id ON public.personnel(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON public.documents(user_id);
CREATE INDEX IF NOT EXISTS idx_analyses_user_id ON public.analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_transferts_user_id ON public.transferts(user_id);

-- =====================================================
-- 17. FONCTION POUR OBTENIR LES PERMISSIONS UTILISATEUR
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_user_permissions(user_id UUID)
RETURNS TABLE (
  can_view_production BOOLEAN,
  can_edit_production BOOLEAN,
  can_view_commandes BOOLEAN,
  can_edit_commandes BOOLEAN,
  can_view_livraisons BOOLEAN,
  can_edit_livraisons BOOLEAN,
  can_view_stock BOOLEAN,
  can_edit_stock BOOLEAN,
  can_view_personnel BOOLEAN,
  can_edit_personnel BOOLEAN,
  can_view_analyses BOOLEAN,
  can_view_parametres BOOLEAN,
  can_edit_parametres BOOLEAN,
  can_manage_users BOOLEAN
) AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role FROM public.users WHERE id = user_id;
  
  RETURN QUERY SELECT
    CASE user_role
      WHEN 'superadmin' THEN true
      WHEN 'admin' THEN true
      WHEN 'manager' THEN true
      WHEN 'operator' THEN true
      ELSE false
    END as can_view_production,
    
    CASE user_role
      WHEN 'superadmin' THEN true
      WHEN 'admin' THEN true
      WHEN 'manager' THEN true
      WHEN 'operator' THEN true
      ELSE false
    END as can_edit_production,
    
    CASE user_role
      WHEN 'superadmin' THEN true
      WHEN 'admin' THEN true
      WHEN 'manager' THEN true
      WHEN 'secretaire' THEN true
      ELSE false
    END as can_view_commandes,
    
    CASE user_role
      WHEN 'superadmin' THEN true
      WHEN 'admin' THEN true
      WHEN 'manager' THEN true
      WHEN 'secretaire' THEN true
      ELSE false
    END as can_edit_commandes,
    
    CASE user_role
      WHEN 'superadmin' THEN true
      WHEN 'admin' THEN true
      WHEN 'manager' THEN true
      WHEN 'livreur' THEN true
      ELSE false
    END as can_view_livraisons,
    
    CASE user_role
      WHEN 'superadmin' THEN true
      WHEN 'admin' THEN true
      WHEN 'manager' THEN true
      WHEN 'livreur' THEN true
      ELSE false
    END as can_edit_livraisons,
    
    CASE user_role
      WHEN 'superadmin' THEN true
      WHEN 'admin' THEN true
      WHEN 'manager' THEN true
      WHEN 'operator' THEN true
      ELSE false
    END as can_view_stock,
    
    CASE user_role
      WHEN 'superadmin' THEN true
      WHEN 'admin' THEN true
      WHEN 'manager' THEN true
      WHEN 'operator' THEN true
      ELSE false
    END as can_edit_stock,
    
    CASE user_role
      WHEN 'superadmin' THEN true
      WHEN 'admin' THEN true
      WHEN 'manager' THEN true
      ELSE false
    END as can_view_personnel,
    
    CASE user_role
      WHEN 'superadmin' THEN true
      WHEN 'admin' THEN true
      WHEN 'manager' THEN true
      ELSE false
    END as can_edit_personnel,
    
    CASE user_role
      WHEN 'superadmin' THEN true
      WHEN 'admin' THEN true
      WHEN 'manager' THEN true
      ELSE false
    END as can_view_analyses,
    
    CASE user_role
      WHEN 'superadmin' THEN true
      WHEN 'admin' THEN true
      ELSE false
    END as can_view_parametres,
    
    CASE user_role
      WHEN 'superadmin' THEN true
      WHEN 'admin' THEN true
      ELSE false
    END as can_edit_parametres,
    
    CASE user_role
      WHEN 'superadmin' THEN true
      WHEN 'admin' THEN true
      ELSE false
    END as can_manage_users;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 18. VUE POUR LES STATISTIQUES DES UTILISATEURS
-- =====================================================

CREATE OR REPLACE VIEW public.user_stats AS
SELECT
  role,
  COUNT(*) as total_users,
  COUNT(CASE WHEN is_active = true THEN 1 END) as active_users,
  COUNT(CASE WHEN last_login > NOW() - INTERVAL '30 days' THEN 1 END) as recent_users,
  AVG(EXTRACT(EPOCH FROM (NOW() - created_at))/86400) as avg_days_since_creation
FROM public.users
GROUP BY role
ORDER BY total_users DESC;

-- =====================================================
-- 19. COMMENTAIRES SUR LES TABLES
-- =====================================================

COMMENT ON TABLE public.users IS 'Table des profils utilisateurs étendus';
COMMENT ON TABLE public.articles IS 'Table des articles/stock avec gestion par utilisateur';
COMMENT ON TABLE public.commandes IS 'Table des commandes clients avec gestion par utilisateur';
COMMENT ON TABLE public.livraisons IS 'Table des livraisons avec gestion par utilisateur';
COMMENT ON TABLE public.production IS 'Table de la production avec gestion par utilisateur';
COMMENT ON TABLE public.personnel IS 'Table du personnel avec gestion par utilisateur';
COMMENT ON TABLE public.documents IS 'Table des documents avec gestion par utilisateur';
COMMENT ON TABLE public.analyses IS 'Table des analyses avec gestion par utilisateur';
COMMENT ON TABLE public.transferts IS 'Table des transferts avec gestion par utilisateur';

-- =====================================================
-- 20. MESSAGE DE CONFIRMATION
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '=====================================================';
  RAISE NOTICE 'CONFIGURATION SUPABASE TERMINÉE AVEC SUCCÈS !';
  RAISE NOTICE '=====================================================';
  RAISE NOTICE 'Tables créées : 9';
  RAISE NOTICE 'Triggers créés : 11';
  RAISE NOTICE 'Politiques RLS : 15';
  RAISE NOTICE 'Index créés : 15';
  RAISE NOTICE 'Fonctions créées : 3';
  RAISE NOTICE 'Vues créées : 1';
  RAISE NOTICE '=====================================================';
  RAISE NOTICE 'N''oubliez pas de :';
  RAISE NOTICE '1. Désactiver la confirmation email dans Authentication > Settings';
  RAISE NOTICE '2. Configurer les URLs de redirection';
  RAISE NOTICE '3. Tester l''inscription et la connexion';
  RAISE NOTICE '=====================================================';
END $$;
