-- Configuration Row Level Security (RLS) pour Supabase
-- Exécuter après avoir créé les tables

-- Activer RLS sur toutes les tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.productions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles_produits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consommables_utilises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commandes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produits_commandes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.livraisons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produits_livres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rapports_quotidiens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transferts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produits_transferes ENABLE ROW LEVEL SECURITY;

-- Politiques pour les utilisateurs
CREATE POLICY "Users can view their own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Politiques pour les articles (lecture pour tous, écriture pour admin+)
CREATE POLICY "Anyone can view articles" ON public.articles
  FOR SELECT USING (true);

CREATE POLICY "Admin can manage articles" ON public.articles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('super_admin', 'admin')
    )
  );

-- Politiques pour les productions
CREATE POLICY "Anyone can view productions" ON public.productions
  FOR SELECT USING (true);

CREATE POLICY "Admin can manage productions" ON public.productions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('super_admin', 'admin', 'secretaire')
    )
  );

-- Politiques pour les articles produits
CREATE POLICY "Anyone can view articles_produits" ON public.articles_produits
  FOR SELECT USING (true);

CREATE POLICY "Admin can manage articles_produits" ON public.articles_produits
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('super_admin', 'admin', 'secretaire')
    )
  );

-- Politiques pour les consommables utilisés
CREATE POLICY "Anyone can view consommables_utilises" ON public.consommables_utilises
  FOR SELECT USING (true);

CREATE POLICY "Admin can manage consommables_utilises" ON public.consommables_utilises
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('super_admin', 'admin', 'secretaire')
    )
  );

-- Politiques pour les commandes
CREATE POLICY "Anyone can view commandes" ON public.commandes
  FOR SELECT USING (true);

CREATE POLICY "Admin can manage commandes" ON public.commandes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('super_admin', 'admin', 'secretaire')
    )
  );

-- Politiques pour les produits commandés
CREATE POLICY "Anyone can view produits_commandes" ON public.produits_commandes
  FOR SELECT USING (true);

CREATE POLICY "Admin can manage produits_commandes" ON public.produits_commandes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('super_admin', 'admin', 'secretaire')
    )
  );

-- Politiques pour les livraisons
CREATE POLICY "Anyone can view livraisons" ON public.livraisons
  FOR SELECT USING (true);

CREATE POLICY "Admin can manage livraisons" ON public.livraisons
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('super_admin', 'admin', 'secretaire', 'livreur')
    )
  );

-- Politiques pour les produits livrés
CREATE POLICY "Anyone can view produits_livres" ON public.produits_livres
  FOR SELECT USING (true);

CREATE POLICY "Admin can manage produits_livres" ON public.produits_livres
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('super_admin', 'admin', 'secretaire', 'livreur')
    )
  );

-- Politiques pour les documents
CREATE POLICY "Anyone can view documents" ON public.documents
  FOR SELECT USING (true);

CREATE POLICY "Admin can manage documents" ON public.documents
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('super_admin', 'admin', 'secretaire')
    )
  );

-- Politiques pour les employés
CREATE POLICY "Anyone can view employes" ON public.employes
  FOR SELECT USING (true);

CREATE POLICY "Admin can manage employes" ON public.employes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('super_admin', 'admin')
    )
  );

-- Politiques pour les rapports quotidiens
CREATE POLICY "Anyone can view rapports_quotidiens" ON public.rapports_quotidiens
  FOR SELECT USING (true);

CREATE POLICY "Admin can manage rapports_quotidiens" ON public.rapports_quotidiens
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('super_admin', 'admin', 'secretaire')
    )
  );

-- Politiques pour les transferts
CREATE POLICY "Anyone can view transferts" ON public.transferts
  FOR SELECT USING (true);

CREATE POLICY "Admin can manage transferts" ON public.transferts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('super_admin', 'admin', 'secretaire', 'livreur')
    )
  );

-- Politiques pour les produits transférés
CREATE POLICY "Anyone can view produits_transferes" ON public.produits_transferes
  FOR SELECT USING (true);

CREATE POLICY "Admin can manage produits_transferes" ON public.produits_transferes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('super_admin', 'admin', 'secretaire', 'livreur')
    )
  );
