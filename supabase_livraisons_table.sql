-- Créer la table livraisons dans Supabase
CREATE TABLE IF NOT EXISTS public.livraisons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_bl VARCHAR(50) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  client VARCHAR(255) NOT NULL,
  telephone VARCHAR(20),
  chauffeur VARCHAR(255),
  adresse TEXT,
  code_suivi VARCHAR(50),
  statut VARCHAR(20) NOT NULL DEFAULT 'en_attente',
  produits JSONB NOT NULL DEFAULT '[]',
  total_commande DECIMAL(10,2) DEFAULT 0,
  total_livraison DECIMAL(10,2) DEFAULT 0,
  difference_totale DECIMAL(10,2) DEFAULT 0,
  reste_a_payer_total DECIMAL(10,2) DEFAULT 0,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activer RLS (Row Level Security)
ALTER TABLE public.livraisons ENABLE ROW LEVEL SECURITY;

-- Créer une politique pour que les utilisateurs ne voient que leurs propres livraisons
CREATE POLICY "Users can view their own livraisons" ON public.livraisons
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own livraisons" ON public.livraisons
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own livraisons" ON public.livraisons
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own livraisons" ON public.livraisons
  FOR DELETE USING (auth.uid() = user_id);

-- Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_livraisons_user_id ON public.livraisons(user_id);
CREATE INDEX IF NOT EXISTS idx_livraisons_statut ON public.livraisons(statut);
CREATE INDEX IF NOT EXISTS idx_livraisons_date ON public.livraisons(date);

-- Créer une fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Créer un trigger pour updated_at
CREATE TRIGGER update_livraisons_updated_at 
  BEFORE UPDATE ON public.livraisons 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
