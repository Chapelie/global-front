-- Configuration de l'authentification Supabase
-- Exécuter dans l'éditeur SQL de Supabase

-- 1. Désactiver la confirmation email (auto-confirmation)
-- Aller dans Authentication > Settings > Auth et désactiver "Enable email confirmations"

-- 2. Créer la table des utilisateurs étendue
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

-- 3. Créer un trigger pour créer automatiquement un profil utilisateur
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

-- 4. Créer le trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Créer un trigger pour mettre à jour last_login
CREATE OR REPLACE FUNCTION public.handle_user_login()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.users
  SET last_login = NOW(), updated_at = NOW()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Créer le trigger de connexion
DROP TRIGGER IF EXISTS on_auth_user_login ON auth.users;
CREATE TRIGGER on_auth_user_login
  AFTER UPDATE OF last_sign_in_at ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_login();

-- 7. Configurer Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 8. Politique : Les utilisateurs peuvent voir leur propre profil
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- 9. Politique : Les utilisateurs peuvent mettre à jour leur propre profil
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- 10. Politique : Les admins peuvent voir tous les utilisateurs
CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('superadmin', 'admin')
    )
  );

-- 11. Politique : Les admins peuvent créer des utilisateurs
CREATE POLICY "Admins can create users" ON public.users
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('superadmin', 'admin')
    )
  );

-- 12. Politique : Les admins peuvent mettre à jour tous les utilisateurs
CREATE POLICY "Admins can update all users" ON public.users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('superadmin', 'admin')
    )
  );

-- 13. Politique : Les admins peuvent supprimer des utilisateurs
CREATE POLICY "Admins can delete users" ON public.users
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('superadmin', 'admin')
    )
  );

-- 14. Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at);
CREATE INDEX IF NOT EXISTS idx_users_last_login ON public.users(last_login);

-- 15. Créer un utilisateur admin par défaut (optionnel)
-- Remplacer 'admin@example.com' et 'password123' par vos valeurs
-- INSERT INTO auth.users (
--   instance_id,
--   id,
--   aud,
--   role,
--   email,
--   encrypted_password,
--   email_confirmed_at,
--   created_at,
--   updated_at,
--   raw_user_meta_data,
--   is_super_admin
-- ) VALUES (
--   '00000000-0000-0000-0000-000000000000',
--   gen_random_uuid(),
--   'authenticated',
--   'authenticated',
--   'admin@example.com',
--   crypt('password123', gen_salt('bf')),
--   NOW(),
--   NOW(),
--   NOW(),
--   '{"first_name": "Admin", "last_name": "System", "role": "superadmin"}',
--   false
-- );

-- 16. Fonction pour obtenir les permissions d'un utilisateur
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

-- 17. Créer une vue pour les statistiques des utilisateurs
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

-- 18. Commentaires sur les tables
COMMENT ON TABLE public.users IS 'Table des profils utilisateurs étendus';
COMMENT ON COLUMN public.users.role IS 'Rôle de l''utilisateur: superadmin, admin, manager, operator, secretaire, livreur';
COMMENT ON COLUMN public.users.is_active IS 'Indique si le compte utilisateur est actif';
COMMENT ON COLUMN public.users.last_login IS 'Dernière connexion de l''utilisateur';

-- 19. Message de confirmation
DO $$
BEGIN
  RAISE NOTICE 'Configuration de l''authentification Supabase terminée !';
  RAISE NOTICE 'N''oubliez pas de :';
  RAISE NOTICE '1. Désactiver la confirmation email dans Authentication > Settings';
  RAISE NOTICE '2. Configurer les URLs de redirection';
  RAISE NOTICE '3. Tester l''inscription et la connexion';
END $$;
