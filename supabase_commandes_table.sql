-- Créer la table commandes dans Supabase
CREATE TABLE IF NOT EXISTS public.commandes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_commande VARCHAR(50) NOT NULL,
  client VARCHAR(255) NOT NULL,
  telephone VARCHAR(20),
  email VARCHAR(255),
  adresse TEXT,
  produits JSONB NOT NULL DEFAULT '[]',
  statut VARCHAR(20) NOT NULL DEFAULT 'en_attente',
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  date_livraison_souhaitee DATE,
  priorite VARCHAR(20) DEFAULT 'normale',
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activer RLS (Row Level Security)
ALTER TABLE public.commandes ENABLE ROW LEVEL SECURITY;

-- Créer une politique pour que les utilisateurs ne voient que leurs propres commandes
CREATE POLICY "Users can view their own commandes" ON public.commandes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own commandes" ON public.commandes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own commandes" ON public.commandes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own commandes" ON public.commandes
  FOR DELETE USING (auth.uid() = user_id);

-- Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_commandes_user_id ON public.commandes(user_id);
CREATE INDEX IF NOT EXISTS idx_commandes_statut ON public.commandes(statut);
CREATE INDEX IF NOT EXISTS idx_commandes_date ON public.commandes(date);

-- Créer un trigger pour updated_at
CREATE TRIGGER update_commandes_updated_at 
  BEFORE UPDATE ON public.commandes 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
