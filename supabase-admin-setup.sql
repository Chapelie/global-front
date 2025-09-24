 -- Script pour créer l'utilisateur admin et configurer les rôles
-- Exécuter après avoir créé les tables et configuré RLS

-- 1. Créer l'utilisateur admin dans la table users
-- Note: L'utilisateur doit d'abord être créé via l'interface d'authentification Supabase
-- Ce script configure les données une fois l'utilisateur créé

-- 2. Fonction pour créer un utilisateur admin
CREATE OR REPLACE FUNCTION create_admin_user(
  user_id UUID,
  username TEXT,
  email TEXT
) RETURNS VOID AS $$
BEGIN
  -- Insérer l'utilisateur admin dans la table users
  INSERT INTO public.users (id, username, email, role, created_at, updated_at)
  VALUES (user_id, username, email, 'super_admin', NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET
    username = EXCLUDED.username,
    email = EXCLUDED.email,
    role = 'super_admin',
    updated_at = NOW();
  
  -- Log de création
  RAISE NOTICE 'Utilisateur admin créé: % (%)', username, email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Fonction pour mettre à jour le rôle d'un utilisateur
CREATE OR REPLACE FUNCTION update_user_role(
  user_id UUID,
  new_role TEXT
) RETURNS VOID AS $$
BEGIN
  -- Vérifier que le rôle est valide
  IF new_role NOT IN ('super_admin', 'admin', 'secretaire', 'livreur') THEN
    RAISE EXCEPTION 'Rôle invalide: %. Rôles valides: super_admin, admin, secretaire, livreur', new_role;
  END IF;
  
  -- Mettre à jour le rôle
  UPDATE public.users 
  SET role = new_role, updated_at = NOW()
  WHERE id = user_id;
  
  -- Vérifier que l'utilisateur existe
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Utilisateur non trouvé: %', user_id;
  END IF;
  
  RAISE NOTICE 'Rôle de l''utilisateur % mis à jour vers: %', user_id, new_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Fonction pour obtenir les permissions d'un utilisateur
CREATE OR REPLACE FUNCTION get_user_permissions(user_id UUID)
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
  -- Récupérer le rôle de l'utilisateur
  SELECT role INTO user_role FROM public.users WHERE id = user_id;
  
  -- Retourner les permissions selon le rôle
  RETURN QUERY SELECT
    CASE user_role
      WHEN 'super_admin' THEN TRUE
      WHEN 'admin' THEN TRUE
      WHEN 'secretaire' THEN TRUE
      ELSE FALSE
    END as can_view_production,
    
    CASE user_role
      WHEN 'super_admin' THEN TRUE
      WHEN 'admin' THEN TRUE
      WHEN 'secretaire' THEN TRUE
      ELSE FALSE
    END as can_edit_production,
    
    CASE user_role
      WHEN 'super_admin' THEN TRUE
      WHEN 'admin' THEN TRUE
      WHEN 'secretaire' THEN TRUE
      ELSE FALSE
    END as can_view_commandes,
    
    CASE user_role
      WHEN 'super_admin' THEN TRUE
      WHEN 'admin' THEN TRUE
      WHEN 'secretaire' THEN TRUE
      ELSE FALSE
    END as can_edit_commandes,
    
    CASE user_role
      WHEN 'super_admin' THEN TRUE
      WHEN 'admin' THEN TRUE
      WHEN 'secretaire' THEN TRUE
      WHEN 'livreur' THEN TRUE
      ELSE FALSE
    END as can_view_livraisons,
    
    CASE user_role
      WHEN 'super_admin' THEN TRUE
      WHEN 'admin' THEN TRUE
      WHEN 'secretaire' THEN TRUE
      WHEN 'livreur' THEN TRUE
      ELSE FALSE
    END as can_edit_livraisons,
    
    CASE user_role
      WHEN 'super_admin' THEN TRUE
      WHEN 'admin' THEN TRUE
      WHEN 'secretaire' THEN TRUE
      ELSE FALSE
    END as can_view_stock,
    
    CASE user_role
      WHEN 'super_admin' THEN TRUE
      WHEN 'admin' THEN TRUE
      WHEN 'secretaire' THEN TRUE
      ELSE FALSE
    END as can_edit_stock,
    
    CASE user_role
      WHEN 'super_admin' THEN TRUE
      WHEN 'admin' THEN TRUE
      ELSE FALSE
    END as can_view_personnel,
    
    CASE user_role
      WHEN 'super_admin' THEN TRUE
      WHEN 'admin' THEN TRUE
      ELSE FALSE
    END as can_edit_personnel,
    
    CASE user_role
      WHEN 'super_admin' THEN TRUE
      WHEN 'admin' THEN TRUE
      WHEN 'secretaire' THEN TRUE
      ELSE FALSE
    END as can_view_analyses,
    
    CASE user_role
      WHEN 'super_admin' THEN TRUE
      WHEN 'admin' THEN TRUE
      ELSE FALSE
    END as can_view_parametres,
    
    CASE user_role
      WHEN 'super_admin' THEN TRUE
      WHEN 'admin' THEN TRUE
      ELSE FALSE
    END as can_edit_parametres,
    
    CASE user_role
      WHEN 'super_admin' THEN TRUE
      WHEN 'admin' THEN TRUE
      ELSE FALSE
    END as can_manage_users;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Fonction pour lister tous les utilisateurs avec leurs rôles
CREATE OR REPLACE FUNCTION list_all_users()
RETURNS TABLE (
  id UUID,
  username TEXT,
  email TEXT,
  role TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT u.id, u.username, u.email, u.role, u.created_at, u.updated_at
  FROM public.users u
  ORDER BY u.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Fonction pour supprimer un utilisateur
CREATE OR REPLACE FUNCTION delete_user(user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Vérifier que l'utilisateur existe
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = user_id) THEN
    RAISE EXCEPTION 'Utilisateur non trouvé: %', user_id;
  END IF;
  
  -- Supprimer l'utilisateur
  DELETE FROM public.users WHERE id = user_id;
  
  RAISE NOTICE 'Utilisateur % supprimé', user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Fonction pour obtenir les statistiques des utilisateurs
CREATE OR REPLACE FUNCTION get_user_stats()
RETURNS TABLE (
  total_users INTEGER,
  super_admins INTEGER,
  admins INTEGER,
  secretaires INTEGER,
  livreurs INTEGER,
  active_users INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::INTEGER as total_users,
    COUNT(*) FILTER (WHERE role = 'super_admin')::INTEGER as super_admins,
    COUNT(*) FILTER (WHERE role = 'admin')::INTEGER as admins,
    COUNT(*) FILTER (WHERE role = 'secretaire')::INTEGER as secretaires,
    COUNT(*) FILTER (WHERE role = 'livreur')::INTEGER as livreurs,
    COUNT(*) FILTER (WHERE updated_at > NOW() - INTERVAL '30 days')::INTEGER as active_users
  FROM public.users;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Créer des vues pour faciliter l'accès aux données
CREATE OR REPLACE VIEW user_permissions_view AS
SELECT 
  u.id,
  u.username,
  u.email,
  u.role,
  p.*
FROM public.users u
CROSS JOIN LATERAL get_user_permissions(u.id) p;

-- 9. Créer un index sur la table users pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);

-- 10. Message de confirmation
SELECT 'Fonctions de gestion des utilisateurs créées avec succès!' as message;
