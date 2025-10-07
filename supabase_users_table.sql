-- Création de la table users
CREATE TABLE public.users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('superadmin', 'admin', 'manager', 'operator', 'secretaire', 'livreur')),
  phone TEXT,
  actif BOOLEAN NOT NULL DEFAULT true,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activer RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
CREATE POLICY "Users can view all users"
  ON public.users FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert users"
  ON public.users FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can update users"
  ON public.users FOR UPDATE
  USING (true);

CREATE POLICY "Admins can delete users"
  ON public.users FOR DELETE
  USING (true);

-- Index pour améliorer les performances
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_actif ON public.users(actif);

-- Pas de fonctions automatiques nécessaires
-- Les utilisateurs sont créés directement dans la table users
