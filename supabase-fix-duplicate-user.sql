-- =====================================================
-- CORRECTION RAPIDE - Erreur de clé dupliquée
-- =====================================================
-- Exécuter dans l'éditeur SQL de Supabase pour corriger l'erreur

-- 1. Supprimer les utilisateurs en double dans la table users
-- (garder seulement le plus récent)
DELETE FROM public.users 
WHERE id IN (
  SELECT id FROM (
    SELECT id, 
           ROW_NUMBER() OVER (PARTITION BY email ORDER BY created_at DESC) as rn
    FROM public.users
  ) t 
  WHERE rn > 1
);

-- 2. Mettre à jour la fonction handle_new_user pour gérer les conflits
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
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    role = EXCLUDED.role,
    phone = EXCLUDED.phone,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Recréer le trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Vérifier qu'il n'y a plus de doublons
SELECT 
  email, 
  COUNT(*) as count 
FROM public.users 
GROUP BY email 
HAVING COUNT(*) > 1;

-- 5. Message de confirmation
DO $$
BEGIN
  RAISE NOTICE '=====================================================';
  RAISE NOTICE 'CORRECTION APPLIQUÉE AVEC SUCCÈS !';
  RAISE NOTICE '=====================================================';
  RAISE NOTICE '✅ Utilisateurs en double supprimés';
  RAISE NOTICE '✅ Fonction handle_new_user mise à jour';
  RAISE NOTICE '✅ Trigger recréé avec gestion des conflits';
  RAISE NOTICE '✅ L''inscription devrait maintenant fonctionner';
  RAISE NOTICE '=====================================================';
END $$;
